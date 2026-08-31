import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { sendMail, templateAccountRejected, APP_URL } from "@/lib/server/mailer";
import { verifyActionToken } from "@/lib/server/tokens";

/**
 * GET /api/auth/reject?token=...
 * Link de REPROVAÇÃO clicado pelo admin no email.
 * Marca perfil REJECTED, bane o usuário (impede login) e notifica.
 * Motivo opcional via ?reason= (vindo de um prompt na hora do clique).
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const reason = req.nextUrl.searchParams.get("reason") || "Solicitação não aprovada pela equipe de análise.";

  const { valid, payload } = verifyActionToken(token);
  if (!valid) {
    return htmlResponse(
      "Link inválido ou expirado",
      "Este link de reprovação não é mais válido.",
      false
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("status, full_name, email, role")
    .eq("user_id", payload.uid)
    .maybeSingle();

  if (!profile) {
    return htmlResponse("Usuário não encontrado", "Não localizamos o cadastro referenciado.", false);
  }
  if (profile.status === "APPROVED") {
    return htmlResponse(
      "Cadastro já aprovado",
      `O cadastro de <b>${profile.full_name}</b> já foi aprovado anteriormente.`,
      true
    );
  }

  const { error: updErr } = await admin
    .from("user_profiles")
    .update({
      status: "REJECTED",
      rejected_reason: reason,
      approved_by: null,
      approved_at: null,
    })
    .eq("user_id", payload.uid);

  if (updErr) {
    return htmlResponse("Erro", "Falha ao reprovar o cadastro. Tente novamente.", false);
  }

  // Bane o usuário no auth (impede login até nova aprovação)
  await admin.auth.admin.updateUserById(payload.uid, { ban_duration: "876000h" }).catch(() => {});

  try {
    await sendMail({
      to: profile.email,
      subject: "[LattesChain] Resultado da sua solicitação de cadastro",
      html: templateAccountRejected({
        name: profile.full_name,
        reason,
        signupUrl: `${APP_URL}/cadastro`,
      }),
    });
  } catch (e) {
    console.error("[reject] falha ao notificar usuário:", e);
  }

  return htmlResponse(
    "Cadastro reprovado",
    `A solicitação de <b>${profile.full_name}</b> (${profile.email}) foi reprovada. O usuário foi notificado.`,
    true
  );
}

function htmlResponse(title: string, message: string, success: boolean) {
  const color = success ? "#14F195" : "#f87171";
  const icon = success ? "✓" : "✕";
  return new NextResponse(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>LattesChain — ${title}</title></head>
<body style="margin:0;background:#080c14;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:48px 16px;text-align:center;">
    <div style="font-size:26px;font-weight:bold;margin-bottom:32px;">Lattes<span style="color:#14F195;">Chain</span></div>
    <div style="background:#0d1526;border:1px solid #1e293b;border-radius:16px;padding:40px 28px;">
      <div style="width:56px;height:56px;border-radius:50%;background:${color}22;border:2px solid ${color};color:${color};font-size:28px;line-height:52px;margin:0 auto 20px;">${icon}</div>
      <h1 style="font-size:20px;margin:0 0 12px;color:#ffffff;">${title}</h1>
      <p style="font-size:14px;color:#94a3b8;margin:0;">${message}</p>
    </div>
    <a href="${APP_URL}" style="display:inline-block;margin-top:24px;color:#14F195;font-size:14px;text-decoration:none;">← Voltar ao início</a>
  </div>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
