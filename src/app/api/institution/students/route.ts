import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { createServerSupabaseClient } from "@/lib/server/session";
import { resolveUserTenant } from "@/lib/server/tenantHelper";
import { sendMail, templateStudentInvitation, APP_URL } from "@/lib/server/mailer";

export const dynamic = "force-dynamic";

/**
 * GET /api/institution/students
 * Lista os estudantes vinculados à IES atual com suas respectivas matrículas e campus.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetInstId = tenant.isAdmin
      ? searchParams.get("institution_id") || tenant.institution_id
      : tenant.institution_id;

    // 1. Busca matrículas da instituição
    let enrollQuery = admin
      .from("student_enrollments")
      .select(`
        id,
        registration_number,
        course_name,
        status,
        enrolled_at,
        created_at,
        campus:institution_campuses (id, name, city, state),
        institution:institutions (id, name, cnpj),
        student:students (id, full_name, cpf, email, solana_wallet_custodial, created_at)
      `)
      .order("created_at", { ascending: false });

    if (targetInstId) {
      enrollQuery = enrollQuery.eq("institution_id", targetInstId);
    }

    const { data: enrollments, error: enrollErr } = await enrollQuery;

    if (enrollErr) {
      console.warn("[institution-students] Erro ao consultar matrículas em student_enrollments:", enrollErr.message);
      // Fallback: se a tabela de enrollments ainda estiver vazia ou recém criada, busca direto de students
      const { data: fallbackStudents } = await admin
        .from("students")
        .select("id, full_name, cpf, email, solana_wallet_custodial, created_at")
        .order("full_name", { ascending: true });

      return NextResponse.json({
        ok: true,
        students: (fallbackStudents || []).map((s) => ({
          enrollment_id: null,
          student_id: s.id,
          full_name: s.full_name,
          cpf: s.cpf,
          email: s.email,
          wallet: s.solana_wallet_custodial,
          registration_number: "S/N",
          course_name: "Geral",
          status: "ACTIVE",
          campus: null,
          institution: { name: tenant.institution_name || "Instituição" },
        })),
      });
    }

    // Formata o retorno para a interface
    const formatted = (enrollments || []).map((e: any) => ({
      enrollment_id: e.id,
      student_id: e.student?.id,
      full_name: e.student?.full_name,
      cpf: e.student?.cpf,
      email: e.student?.email,
      wallet: e.student?.solana_wallet_custodial,
      registration_number: e.registration_number,
      course_name: e.course_name,
      status: e.status,
      enrolled_at: e.enrolled_at,
      campus: e.campus,
      institution: e.institution,
    }));

    return NextResponse.json({
      ok: true,
      students: formatted,
      institution_id: targetInstId,
      institution_name: tenant.institution_name,
    });
  } catch (err: any) {
    console.error("[institution-students-get] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/institution/students
 * Cadastra um novo estudante ou vincula estudante existente a esta IES e Campus (Multi-tenant).
 * Dispara e-mail de acesso e credenciais ao estudante.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }

    const body = await req.json();
    const {
      full_name,
      cpf,
      email,
      registration_number,
      course_name,
      campus_id,
      institution_id,
      send_email = true,
    } = body;

    if (!full_name || !cpf || !email || !registration_number || !course_name) {
      return NextResponse.json(
        { error: "Nome, CPF, E-mail, Matrícula e Curso são obrigatórios." },
        { status: 400 }
      );
    }

    const effectiveInstId = tenant.isAdmin && institution_id ? institution_id : tenant.institution_id;
    if (!effectiveInstId) {
      return NextResponse.json({ error: "Instituição de ensino não identificada." }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    // 1. Procura se o estudante já existe globalmente no protocolo
    let { data: existingStudent } = await admin
      .from("students")
      .select("id, full_name, email, solana_wallet_custodial")
      .or(`cpf.eq.${cleanCpf},email.eq.${cleanEmail}`)
      .maybeSingle();

    let studentId = existingStudent?.id;
    let walletAddress = existingStudent?.solana_wallet_custodial;

    // Se não existir, cria o estudante base com carteira Devnet gerada
    if (!studentId) {
      const studentKp = Keypair.generate();
      walletAddress = studentKp.publicKey.toBase58();

      const { data: newStudent, error: createStudentErr } = await admin
        .from("students")
        .insert({
          full_name: full_name.trim(),
          cpf: cleanCpf,
          email: cleanEmail,
          solana_wallet_custodial: walletAddress,
        })
        .select()
        .single();

      if (createStudentErr) {
        return NextResponse.json(
          { error: "Erro ao cadastrar registro do estudante: " + createStudentErr.message },
          { status: 500 }
        );
      }
      studentId = newStudent.id;
    }

    // 2. Cria a matrícula multi-tenant em student_enrollments
    const { data: enrollment, error: enrollErr } = await admin
      .from("student_enrollments")
      .upsert(
        {
          student_id: studentId,
          institution_id: effectiveInstId,
          campus_id: campus_id || null,
          registration_number: registration_number.trim(),
          course_name: course_name.trim(),
          status: "ACTIVE",
          enrolled_at: new Date().toISOString().split("T")[0],
        },
        { onConflict: "student_id,institution_id,registration_number" }
      )
      .select("*, campus:institution_campuses(name)")
      .single();

    if (enrollErr) {
      return NextResponse.json(
        { error: "Erro ao vincular matrícula: " + enrollErr.message },
        { status: 500 }
      );
    }

    // 3. Dispara e-mail de acesso para o estudante
    let emailSent = false;
    if (send_email) {
      try {
        const campusName = enrollment?.campus?.name || undefined;
        await sendMail({
          to: cleanEmail,
          subject: `[LattesChain] Seu Passaporte Acadêmico foi registrado por ${tenant.institution_name || "sua IES"}!`,
          html: templateStudentInvitation({
            studentName: full_name.trim(),
            institutionName: tenant.institution_name || "Instituição de Ensino",
            campusName,
            courseName: course_name.trim(),
            registrationNumber: registration_number.trim(),
            accessUrl: `${APP_URL}/student`,
          }),
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("[institution-students] Falha ao disparar e-mail de convite:", mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Estudante '${full_name}' matriculado com sucesso na IES! ${emailSent ? "E-mail de acesso enviado." : ""}`,
      student_id: studentId,
      wallet: walletAddress,
      enrollment,
      emailSent,
    });
  } catch (err: any) {
    console.error("[institution-students-post] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/institution/students
 * Atualiza dados da matrícula (status, curso, campus, matrícula).
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }

    const body = await req.json();
    const { enrollment_id, status, course_name, registration_number, campus_id } = body;

    if (!enrollment_id) {
      return NextResponse.json({ error: "ID da matrícula é obrigatório." }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status && ["ACTIVE", "GRADUATED", "SUSPENDED", "LOCKED"].includes(status)) {
      updateData.status = status;
    }
    if (course_name) updateData.course_name = course_name.trim();
    if (registration_number) updateData.registration_number = registration_number.trim();
    if (campus_id !== undefined) updateData.campus_id = campus_id || null;

    let query = admin.from("student_enrollments").update(updateData).eq("id", enrollment_id);

    if (!tenant.isAdmin && tenant.institution_id) {
      query = query.eq("institution_id", tenant.institution_id);
    }

    const { data: updated, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Matrícula atualizada com sucesso.",
      enrollment: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
