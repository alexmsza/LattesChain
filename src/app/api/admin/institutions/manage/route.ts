import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
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
 * POST /api/admin/institutions/manage
 * Cria uma nova Instituição de Ensino Superior (IES)
 */
export async function POST(req: NextRequest) {
  try {
    const check = await assertAdmin();
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

    const { admin } = check;
    const body = await req.json();
    const { name, cnpj, solana_pubkey, is_verified = true, is_active = true } = body;

    if (!name || !cnpj) {
      return NextResponse.json({ error: "Nome da IES e CNPJ são obrigatórios." }, { status: 400 });
    }

    const cleanCnpj = cnpj.replace(/\D/g, "");
    const effectivePubkey = solana_pubkey?.trim() || Keypair.generate().publicKey.toBase58();

    const { data: institution, error } = await admin
      .from("institutions")
      .insert({
        name: name.trim(),
        cnpj: cleanCnpj,
        solana_pubkey: effectivePubkey,
        is_verified: Boolean(is_verified),
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      console.error("[admin-institutions-post] erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Instituição '${institution.name}' cadastrada com sucesso!`,
      institution,
    });
  } catch (err: any) {
    console.error("[admin-institutions-post] exceção:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/institutions/manage
 * Atualiza ou suspende uma IES (is_active = false)
 */
export async function PUT(req: NextRequest) {
  try {
    const check = await assertAdmin();
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

    const { admin } = check;
    const body = await req.json();
    const { id, name, cnpj, solana_pubkey, is_verified, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da instituição é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updatePayload.name = name.trim();
    if (cnpj) updatePayload.cnpj = cnpj.replace(/\D/g, "");
    if (solana_pubkey) updatePayload.solana_pubkey = solana_pubkey.trim();
    if (typeof is_verified === "boolean") updatePayload.is_verified = is_verified;
    if (typeof is_active === "boolean") updatePayload.is_active = is_active;

    const { data: updated, error } = await admin
      .from("institutions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin-institutions-put] erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Instituição '${updated.name}' atualizada com sucesso. Status ativo: ${updated.is_active}`,
      institution: updated,
    });
  } catch (err: any) {
    console.error("[admin-institutions-put] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
