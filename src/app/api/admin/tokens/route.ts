import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/server/session";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import crypto from "crypto";

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

  const isJovian = user.email?.toLowerCase().endsWith("@jovian.foo");
  if (!isJovian && (!profile || profile.role !== "ADMIN" || profile.status !== "APPROVED")) {
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
  const { data: tokens, error } = await admin
    .from("api_tokens")
    .select("*, institutions(name, cnpj)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar tokens: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ tokens: tokens || [] });
}

export async function POST(req: Request) {
  const check = await assertAdminSession();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { user, admin } = check;
    const body = await req.json();
    const {
      name,
      institution_id,
      scopes = ["credentials:verify"],
      rate_limit_per_minute = 120,
      expires_in_days,
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nome da aplicação / cliente é obrigatório." }, { status: 400 });
    }

    // Gera token seguro com alta entropia
    const randomHex = crypto.randomBytes(24).toString("hex");
    const rawToken = `lat_live_${randomHex}`;
    const keyHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const keyPrefix = `${rawToken.slice(0, 16)}...`;

    let expiresAt: string | null = null;
    if (expires_in_days && Number(expires_in_days) > 0) {
      const d = new Date();
      d.setDate(d.getDate() + Number(expires_in_days));
      expiresAt = d.toISOString();
    }

    const { data: createdToken, error: insertError } = await admin
      .from("api_tokens")
      .insert({
        name: name.trim(),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        institution_id: institution_id || null,
        scopes: scopes.length > 0 ? scopes : ["credentials:verify"],
        rate_limit_per_minute: Number(rate_limit_per_minute) || 120,
        is_active: true,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select("*, institutions(name, cnpj)")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Erro ao registrar token: " + insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chave de API gerada com sucesso. Copie o valor imediatamente, ele não será exibido novamente.",
        raw_token: rawToken,
        token: createdToken,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const check = await assertAdminSession();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("id");

    if (!tokenId) {
      return NextResponse.json({ error: "ID do token não fornecido." }, { status: 400 });
    }

    const { admin } = check;
    const { data, error } = await admin
      .from("api_tokens")
      .update({ is_active: false })
      .eq("id", tokenId)
      .select("id, name, is_active")
      .single();

    if (error) {
      return NextResponse.json({ error: "Falha ao revogar token: " + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Chave de API "${data.name}" revogada com sucesso.`,
      token: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno: " + err.message }, { status: 500 });
  }
}
