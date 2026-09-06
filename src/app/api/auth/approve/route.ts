import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { sendMail, templateAccountApproved, APP_URL } from "@/lib/server/mailer";
import { verifyActionToken } from "@/lib/server/tokens";

/**
 * GET /api/auth/approve?token=...
 * Link de APROVAÇÃO clicado pelo admin no email.
 * Marca o perfil como APPROVED, desbanindo o usuário, e notifica o usuário.
 */

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudante",
  INSTITUTION: "Instituição de Ensino (IES)",
  EMPLOYER: "Recrutador / RH",
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";

  const { valid, payload, reason } = verifyActionToken(token);
  if (!valid) {
    return htmlResponse(
      "Link inválido ou expirado",
      "Este link de aprovação não é mais válido. Solicite um novo email de aprovação ao suporte.",
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
  if (profile.status === "REJECTED") {
    return htmlResponse(
      "Cadastro reprovado",
      `O cadastro de <b>${profile.full_name}</b> foi reprovado anteriormente e não pode ser aprovado por este link.`,
      false
    );
  }

  // Aprova: perfil APPROVED + usuário desbanido (garante login)
  const { error: updErr } = await admin
    .from("user_profiles")
    .update({
      status: "APPROVED",
      approved_by: "admin@latteschain",
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    })
    .eq("user_id", payload.uid);

  if (updErr) {
    return htmlResponse("Erro", "Falha ao aprovar o cadastro. Tente novamente.", false);
  }

  await admin.auth.admin.updateUserById(payload.uid, { ban_duration: "none" }).catch(() => {});

  // Notifica o usuário
  try {
    await sendMail({
      to: profile.email,
      subject: "[LattesChain] Seu cadastro foi aprovado!",
      html: templateAccountApproved({
        name: profile.full_name,
        loginUrl: `${APP_URL}/login`,
        roleLabel: ROLE_LABELS[profile.role] || "usuário",
      }),
    });
  } catch (e) {
    console.error("[approve] falha ao notificar usuário:", e);
  }

  return htmlResponse(
    "Cadastro aprovado",
    `O cadastro de <b>${profile.full_name}</b> (${profile.email}) foi aprovado com sucesso. Ele(a) já pode acessar a plataforma.`,
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
