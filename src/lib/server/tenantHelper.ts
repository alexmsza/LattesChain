import { SupabaseClient } from "@supabase/supabase-js";

export interface ResolvedTenant {
  user_id: string;
  role: "STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN";
  isAdmin: boolean;
  institution_id?: string | null;
  institution_name?: string | null;
  campus_id?: string | null;
  campus_name?: string | null;
}

/**
 * Resolve o tenant (Instituição e Campus) do usuário autenticado no backend.
 */
export async function resolveUserTenant(
  admin: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<ResolvedTenant | null> {
  const isJovian = userEmail?.toLowerCase().endsWith("@jovian.foo");

  let profile: any = null;
  const mtRes = await admin
    .from("user_profiles")
    .select("user_id, role, status, institution_name, cnpj, institution_id, campus_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (mtRes.error) {
    const baseRes = await admin
      .from("user_profiles")
      .select("user_id, role, status, institution_name, cnpj")
      .eq("user_id", userId)
      .maybeSingle();
    profile = baseRes.data;
  } else {
    profile = mtRes.data;
  }

  if (!profile && !isJovian) return null;

  const role = isJovian ? "ADMIN" : (profile?.role || "STUDENT");
  const isAdmin = role === "ADMIN";

  let institutionId = profile?.institution_id || null;
  let institutionName = profile?.institution_name || null;
  let campusId = profile?.campus_id || null;
  let campusName: string | null = null;

  // Se for INSTITUTION e não tiver institution_id gravado, tenta associar por CNPJ ou nome
  if (role === "INSTITUTION" && !institutionId) {
    if (profile?.cnpj) {
      const cleanCnpj = profile.cnpj.replace(/\D/g, "");
      const { data: inst } = await admin
        .from("institutions")
        .select("id, name")
        .ilike("cnpj", `%${cleanCnpj}%`)
        .maybeSingle();

      if (inst) {
        institutionId = inst.id;
        institutionName = inst.name;
        try {
          await admin.from("user_profiles").update({ institution_id: inst.id }).eq("user_id", userId);
        } catch {}
      }
    }

    if (!institutionId && profile?.institution_name) {
      const { data: inst } = await admin
        .from("institutions")
        .select("id, name")
        .ilike("name", `%${profile.institution_name.trim()}%`)
        .maybeSingle();

      if (inst) {
        institutionId = inst.id;
        institutionName = inst.name;
        try {
          await admin.from("user_profiles").update({ institution_id: inst.id }).eq("user_id", userId);
        } catch {}
      }
    }

    // Fallback: se ainda assim não tiver, busca a primeira instituição ativa
    if (!institutionId) {
      const { data: inst } = await admin
        .from("institutions")
        .select("id, name")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (inst) {
        institutionId = inst.id;
        institutionName = inst.name;
      }
    }
  }

  // Se tiver campus_id, recupera o nome do campus
  if (campusId) {
    const { data: c } = await admin
      .from("institution_campuses")
      .select("name")
      .eq("id", campusId)
      .maybeSingle();
    if (c) campusName = c.name;
  }

  return {
    user_id: userId,
    role,
    isAdmin,
    institution_id: institutionId,
    institution_name: institutionName,
    campus_id: campusId,
    campus_name: campusName,
  };
}
