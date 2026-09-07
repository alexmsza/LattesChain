import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { sendMail, templatePasswordReset } from "@/lib/server/mailer";
import { generateResetToken } from "@/lib/server/tokens";
import { rateLimit, getClientIp } from "@/lib/server/rateLimit";
import { validateEmail } from "@/lib/server/validators";

/**
 * POST /api/auth/forgot-password
 * Gera token de redefinição (1h, uso único) e envia por email.
 * Resposta sempre genérica (não revela se o email existe).
 */

export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 60 * 60_000; // 1 hora

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`forgot:${getClientIp(req)}`, 5, 15 * 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Localiza usuário + perfil em uma query
    const { data: profile } = await admin
      .from("user_profiles")
      .select("user_id, full_name, status")
      .eq("email", email)
      .maybeSingle();

    // Resposta genérica — não vaza existência da conta
    const genericOk = { ok: true, message: "Se o e-mail estiver cadastrado, você receberá as instruções de redefinição." };

    let effectiveProfile = profile;
    const isJovian = email.endsWith("@jovian.foo");

    if (isJovian) {
      if (!effectiveProfile) {
        // Auto-provisionamento de usuário do domínio oficial Jovian Tech como ADMIN
        const defaultName = `Admin Jovian (${email.split("@")[0]})`;
        const { data: newAuthUser, error: authErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { role: "ADMIN", full_name: defaultName },
        });

        if (authErr && !newAuthUser?.user) {
          console.error("[forgot-password] jovian auto-create auth error:", authErr);
        } else if (newAuthUser?.user) {
          const { data: newProf, error: profErr } = await admin
            .from("user_profiles")
            .upsert(
              {
                user_id: newAuthUser.user.id,
                email,
                role: "ADMIN",
                status: "APPROVED",
                full_name: defaultName,
                approved_by: "SYSTEM_JOVIAN_DOMAIN",
                approved_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            )
            .select("user_id, full_name, status")
            .single();

          if (profErr) {
            console.error("[forgot-password] jovian upsert profile error:", profErr);
          } else {
            effectiveProfile = newProf;
          }
        }
      } else {
        // Assegura permissão máxima de ADMIN e status APPROVED para domínio jovian.foo
        if (effectiveProfile.status !== "APPROVED") {
          await admin
            .from("user_profiles")
            .update({
              role: "ADMIN",
              status: "APPROVED",
              approved_by: "SYSTEM_JOVIAN_DOMAIN",
              approved_at: new Date().toISOString(),
            })
            .eq("user_id", effectiveProfile.user_id);
          effectiveProfile.status = "APPROVED";
        }
      }
    }

    if (!effectiveProfile) return NextResponse.json(genericOk);

    if (effectiveProfile.status === "REJECTED") {
      // Conta reprovada não gera link (mas resposta permanece genérica)
      return NextResponse.json(genericOk);
    }

    const { raw, hash } = generateResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    const { error: insErr } = await admin.from("password_reset_tokens").insert({
      user_id: effectiveProfile.user_id,
      token_hash: hash,
      expires_at: expiresAt,
    });

    if (insErr) {
      console.error("[forgot-password] insert:", insErr);
      return NextResponse.json(genericOk);
    }

    const resetUrl = `${APP_URL_PUBLIC()}/redefinir-senha?token=${encodeURIComponent(raw)}`;

    try {
      await sendMail({
        to: email,
        subject: "[LattesChain] Redefinição de senha / Primeiro acesso",
        html: templatePasswordReset({ name: effectiveProfile.full_name, resetUrl }),
      });
    } catch (e) {
      console.error("[forgot-password] sendMail:", e);
      return NextResponse.json(genericOk);
    }

    return NextResponse.json(genericOk);
  } catch (e: any) {
    console.error("[forgot-password] erro:", e);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}

function APP_URL_PUBLIC() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
