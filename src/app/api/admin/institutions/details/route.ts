import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/server/session";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

async function assertAdminSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado", status: 401 };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "ADMIN" || profile.status !== "APPROVED") {
    return { error: "Acesso restrito a administradores do protocolo.", status: 403 };
  }

  return { user, admin };
}

export async function GET() {
  const check = await assertAdminSession();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { admin } = check;

  try {
    // 1. Busca todas as instituições
    const { data: institutions, error: instErr } = await admin
      .from("institutions")
      .select("*")
      .order("name", { ascending: true });

    if (instErr) {
      return NextResponse.json({ error: "Erro ao buscar instituições: " + instErr.message }, { status: 500 });
    }

    // 2. Busca todos os usuários de IES
    const { data: instUsers, error: userErr } = await admin
      .from("user_profiles")
      .select("user_id, role, full_name, email, cnpj, institution_name, phone, status, created_at")
      .eq("role", "INSTITUTION");

    // 3. Busca métricas de emissão por IES
    const { data: records, error: recErr } = await admin
      .from("academic_records")
      .select("institution_id, document_type");

    const issuanceMap: Record<string, { total: number; diplomas: number; certificates: number }> = {};
    (records || []).forEach((r) => {
      if (!issuanceMap[r.institution_id]) {
        issuanceMap[r.institution_id] = { total: 0, diplomas: 0, certificates: 0 };
      }
      issuanceMap[r.institution_id].total += 1;
      if (r.document_type === "DIPLOMA") issuanceMap[r.institution_id].diplomas += 1;
      else issuanceMap[r.institution_id].certificates += 1;
    });

    // 4. Cruza usuários por CNPJ
    const detailedInstitutions = (institutions || []).map((inst) => {
      const cleanCnpj = (inst.cnpj || "").replace(/\D/g, "");
      const associatedUsers = (instUsers || []).filter((u) => {
        const userCnpj = (u.cnpj || "").replace(/\D/g, "");
        return (
          (cleanCnpj && userCnpj === cleanCnpj) ||
          (u.institution_name && u.institution_name.toLowerCase() === inst.name.toLowerCase())
        );
      });

      const metrics = issuanceMap[inst.id] || { total: 0, diplomas: 0, certificates: 0 };

      return {
        id: inst.id,
        name: inst.name,
        cnpj: inst.cnpj,
        solana_pubkey: inst.solana_pubkey,
        is_verified: inst.is_verified,
        is_active: inst.is_active,
        created_at: inst.created_at,
        issuance_stats: metrics,
        users_count: associatedUsers.length,
        users: associatedUsers,
      };
    });

    return NextResponse.json({
      total_institutions: detailedInstitutions.length,
      institutions: detailedInstitutions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno: " + err.message }, { status: 500 });
  }
}
