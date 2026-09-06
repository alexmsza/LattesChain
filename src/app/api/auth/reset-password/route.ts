import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { hashResetToken } from "@/lib/server/tokens";
import { rateLimit, getClientIp } from "@/lib/server/rateLimit";
import { validatePassword } from "@/lib/server/validators";

/**
 * POST /api/auth/reset-password
 * Redefine a senha usando o token recebido por email (uso único, 1h).
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`reset:${getClientIp(req)}`, 10, 15 * 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const token = String(body.token || "");
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!token) {
      return NextResponse.json({ error: "Token ausente." }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Senha fraca: use no mínimo 8 caracteres com letras e números." },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });
    }

    const admin = createAdminClient();
    const tokenHash = hashResetToken(token);

    // Busca token válido
    const { data: resetRow, error: selErr } = await admin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (selErr || !resetRow) {
      return NextResponse.json(
        { error: "Token inválido. Solicite um novo link de redefinição." },
        { status: 400 }
      );
    }
    if (resetRow.used_at) {
      return NextResponse.json(
        { error: "Este link já foi utilizado. Solicite um novo." },
        { status: 400 }
      );
    }
    if (new Date(resetRow.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Este link expirou. Solicite um novo link de redefinição." },
        { status: 400 }
      );
    }

    // Atualiza a senha no auth
    const { error: updErr } = await admin.auth.admin.updateUserById(resetRow.user_id, {
      password,
    });

    if (updErr) {
      return NextResponse.json(
        { error: "Falha ao redefinir a senha. Tente novamente." },
        { status: 500 }
      );
    }

    // Marca token como usado (uso único)
    await admin
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", resetRow.id);

    return NextResponse.json({
      ok: true,
      message: "Senha redefinida com sucesso! Você já pode entrar com a nova senha.",
    });
  } catch (e: any) {
    console.error("[reset-password] erro:", e);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
