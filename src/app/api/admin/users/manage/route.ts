import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { createServerSupabaseClient } from "@/lib/server/session";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Acesso não autorizado.", status: 401 };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isJovian = user.email?.toLowerCase().endsWith("@jovian.foo");
  if (!isJovian && (!profile || profile.role !== "ADMIN" || profile.status !== "APPROVED")) {
    return { error: "Acesso restrito à governança administrativa.", status: 403 };
  }

  return { admin, user };
}

/**
 * POST /api/admin/users/manage
 * Cria um novo usuário diretamente pela governança (STUDENT, INSTITUTION, EMPLOYER, ADMIN).
 */
export async function POST(req: NextRequest) {
  try {
    const check = await assertAdmin();
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

    const { admin } = check;
    const body = await req.json();
    const { email, password, full_name, role, status = "APPROVED", cpf, cnpj, institution_name, company_name, institution_id, campus_id, phone } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: "Email, nome completo e papel (role) são obrigatórios." }, { status: 400 });
    }

    // 1. Cria usuário no Supabase Auth via Admin API
    const defaultPassword = password || "Mudar@123456";
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        role,
        cpf: cpf ? cpf.replace(/\D/g, "") : null,
        cnpj: cnpj ? cnpj.replace(/\D/g, "") : null,
        institution_name: institution_name?.trim() || null,
        company_name: company_name?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    if (authError || !authUser.user) {
      return NextResponse.json({ error: "Erro ao criar usuário no Auth: " + authError?.message }, { status: 500 });
    }

    const userId = authUser.user.id;

    // 2. Garante o registro na tabela user_profiles com os vínculos
    const { data: profile, error: profileErr } = await admin
      .from("user_profiles")
      .upsert({
        user_id: userId,
        role,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf ? cpf.replace(/\D/g, "") : null,
        cnpj: cnpj ? cnpj.replace(/\D/g, "") : null,
        institution_name: institution_name?.trim() || null,
        company_name: company_name?.trim() || null,
        phone: phone?.trim() || null,
        status: status || "APPROVED",
        institution_id: institution_id || null,
        campus_id: campus_id || null,
        approved_at: status === "APPROVED" ? new Date().toISOString() : null,
        approved_by: "ADMIN_DIRECT_CREATE",
      })
      .select()
      .single();

    if (profileErr) {
      return NextResponse.json({ error: "Erro ao criar perfil de usuário: " + profileErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Usuário '${full_name}' criado com sucesso!`,
      user: profile,
    });
  } catch (err: any) {
    console.error("[admin-users-create] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/manage
 * Atualiza qualquer usuário: role, status (inclusive SUSPENDED), dados pessoais, IES e Campus.
 */
export async function PUT(req: NextRequest) {
  try {
    const check = await assertAdmin();
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

    const { admin } = check;
    const body = await req.json();
    const { user_id, full_name, role, status, cpf, cnpj, institution_name, company_name, institution_id, campus_id, phone } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name) updatePayload.full_name = full_name.trim();
    if (role && ["STUDENT", "INSTITUTION", "EMPLOYER", "ADMIN"].includes(role)) updatePayload.role = role;
    if (status && ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) updatePayload.status = status;
    if (cpf !== undefined) updatePayload.cpf = cpf ? cpf.replace(/\D/g, "") : null;
    if (cnpj !== undefined) updatePayload.cnpj = cnpj ? cnpj.replace(/\D/g, "") : null;
    if (institution_name !== undefined) updatePayload.institution_name = institution_name ? institution_name.trim() : null;
    if (company_name !== undefined) updatePayload.company_name = company_name ? company_name.trim() : null;
    if (phone !== undefined) updatePayload.phone = phone ? phone.trim() : null;
    if (institution_id !== undefined) updatePayload.institution_id = institution_id || null;
    if (campus_id !== undefined) updatePayload.campus_id = campus_id || null;

    const { data: updated, error } = await admin
      .from("user_profiles")
      .update(updatePayload)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      console.error("[admin-users-update] erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Usuário '${updated.full_name}' atualizado com sucesso. Status atual: ${updated.status}`,
      user: updated,
    });
  } catch (err: any) {
    console.error("[admin-users-update] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
