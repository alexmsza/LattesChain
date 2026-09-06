import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { sendMail, templateAccountApproved, templateAccountRejected, APP_URL } from "@/lib/server/mailer";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudante",
  INSTITUTION: "Instituição de Ensino (IES)",
  EMPLOYER: "Recrutador / RH",
};

/**
 * POST /api/admin/users/review
 * Aprova ou rejeita o cadastro de um usuário diretamente pelo painel administrativo.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: userId e action ('APPROVE' | 'REJECT') são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Busca dados do usuário para confirmação
    const { data: profile, error: fetchError } = await admin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const roleLabel = ROLE_LABELS[profile.role] || profile.role;

    if (action === "APPROVE") {
      const { error: updateError } = await admin
        .from("user_profiles")
        .update({
          status: "APPROVED",
          approved_at: new Date().toISOString(),
          approved_by: "ADMIN_DASHBOARD",
          rejected_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Notifica usuário por e-mail (se configurado)
      try {
        await sendMail({
          to: profile.email,
          subject: "[LattesChain] Seu cadastro foi aprovado!",
          html: templateAccountApproved({
            name: profile.full_name,
            roleLabel,
            loginUrl: `${APP_URL}/login`,
          }),
        });
      } catch (mailErr) {
        console.warn("[admin-review] falha ao enviar e-mail de aprovação:", mailErr);
      }

      return NextResponse.json({
        ok: true,
        message: `Cadastro de ${profile.full_name} (${roleLabel}) aprovado com sucesso!`,
      });
    } else {
      const rejectReason = String(reason || "Cadastro não atende aos requisitos documentais do protocolo.").trim();

      const { error: updateError } = await admin
        .from("user_profiles")
        .update({
          status: "REJECTED",
          rejected_reason: rejectReason,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Notifica usuário por e-mail (se configurado)
      try {
        await sendMail({
          to: profile.email,
          subject: "[LattesChain] Atualização sobre sua solicitação de cadastro",
          html: templateAccountRejected({
            name: profile.full_name,
            reason: rejectReason,
            signupUrl: `${APP_URL}/cadastro`,
          }),
        });
      } catch (mailErr) {
        console.warn("[admin-review] falha ao enviar e-mail de recusa:", mailErr);
      }

      return NextResponse.json({
        ok: true,
        message: `Cadastro de ${profile.full_name} reprovado com sucesso.`,
      });
    }
  } catch (err: any) {
    console.error("[admin-review] erro interno:", err);
    return NextResponse.json({ error: "Erro interno ao processar a revisão." }, { status: 500 });
  }
}
