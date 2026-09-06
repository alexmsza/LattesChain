import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { createServerSupabaseClient } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryWallet = searchParams.get("wallet");
    const queryCpf = searchParams.get("cpf");

    const admin = createAdminClient();

    let targetWallet = queryWallet?.trim();
    let targetCpf = queryCpf ? queryCpf.replace(/\D/g, "") : null;
    let studentName = "Alexandre Silva";
    let studentEmail = "alexandre.silva@aluno.educore.org";
    let universityName = "Universidade Federal de Minas Gerais (UFMG)";

    // Se não passou parâmetros de busca, tenta carregar do usuário logado
    if (!targetWallet && !targetCpf) {
      try {
        const supabaseUser = await createServerSupabaseClient();
        const {
          data: { user },
        } = await supabaseUser.auth.getUser();

        if (user) {
          const { data: profile } = await admin
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile) {
            studentName = profile.full_name || studentName;
            studentEmail = profile.email || studentEmail;
            if (profile.cpf) targetCpf = profile.cpf.replace(/\D/g, "");
          }
        }
      } catch {
        // Segue com busca padrão
      }
    }

    // Se ainda não houver wallet definida, usa a carteira padrão de demonstração
    if (!targetWallet) {
      targetWallet = "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK";
    }

    // 1. Busca aluno no banco
    let studentQuery = admin.from("students").select("id, cpf, full_name, email, solana_wallet_custodial");
    if (targetCpf) {
      studentQuery = studentQuery.eq("cpf", targetCpf);
    } else {
      studentQuery = studentQuery.eq("solana_wallet_custodial", targetWallet);
    }

    const { data: student } = await studentQuery.maybeSingle();

    let records: any[] = [];
    if (student) {
      studentName = student.full_name;
      studentEmail = student.email;
      targetWallet = student.solana_wallet_custodial || targetWallet;

      // 2. Busca registros acadêmicos
      const { data: dbRecords } = await admin
        .from("academic_records")
        .select("*, institutions(name, cnpj, solana_pubkey)")
        .eq("student_id", student.id)
        .order("issued_at", { ascending: false });

      if (dbRecords && dbRecords.length > 0) {
        records = dbRecords.map((r) => ({
          id: r.id,
          type: r.document_type,
          title: r.metadata?.course_name || r.document_type,
          institution: r.institutions?.name || universityName,
          date: new Date(r.issued_at).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
          hours: r.metadata?.workload_hours || null,
          grade: r.metadata?.grade || null,
          status: r.metadata?.status_onchain || (r.document_type === "DIPLOMA" ? "TOKEN-2022 SOULBOUND" : "ATESTADO NO SAS"),
          hash: r.document_hash,
          tx: r.solana_tx_signature,
          rawMetadata: r.metadata,
        }));
      }
    }

    // 3. Calcula total de horas acumuladas dos registros reais retornados

    // 4. Calcula total de horas acumuladas
    const totalHours = records.reduce((acc, r) => {
      if (r.hours && typeof r.hours === "number") {
        return acc + r.hours;
      }
      return acc;
    }, 0);

    return NextResponse.json({
      student: {
        name: studentName,
        course: "Ciência da Computação",
        university: universityName,
        email: studentEmail,
        solanaWallet: targetWallet,
        totalHours,
        requiredHours: 200,
      },
      records,
    });
  } catch (err: any) {
    console.error("Erro na busca de credenciais do estudante:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
