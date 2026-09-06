import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { sendMail, templateApprovalRequest, templateSignupReceived, APP_URL } from "@/lib/server/mailer";
import { validateCPF, validateCNPJ, validateEmail, validatePassword } from "@/lib/server/validators";
import { createApprovalToken, createRejectionToken, ticketId } from "@/lib/server/tokens";
import { rateLimit, getClientIp } from "@/lib/server/rateLimit";

/**
 * POST /api/auth/signup
 * Cria a conta (Supabase Auth) com perfil PENDING e envia ao email oficial
 * (contact@jovian.foo) os links de APROVAR / REPROVAR o cadastro.
 */

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudante",
  INSTITUTION: "Instituição de Ensino (IES)",
  EMPLOYER: "Recrutador / RH",
};

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 tentativas por IP a cada 15 min
    const rl = rateLimit(`signup:${getClientIp(req)}`, 5, 15 * 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const role = String(body.role || "").toUpperCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim() || null;
    const cpf = body.cpf ? String(body.cpf).replace(/\D/g, "") : null;
    const cnpj = body.cnpj ? String(body.cnpj).replace(/\D/g, "") : null;
    const institutionName = String(body.institutionName || "").trim() || null;
    const companyName = String(body.companyName || "").trim() || null;
    const agree = Boolean(body.agree);

    // -------- Validações --------
    if (!ROLE_LABELS[role]) {
      return NextResponse.json({ error: "Tipo de conta inválido." }, { status: 400 });
    }
    if (!fullName || fullName.length < 3) {
      return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
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
    if (!agree) {
      return NextResponse.json(
        { error: "É necessário aceitar os termos de uso e a política de privacidade (LGPD)." },
        { status: 400 }
      );
    }

    // Validações por papel
    if (role === "STUDENT") {
      if (!cpf || !validateCPF(cpf)) {
        return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
      }
    }
    if (role === "INSTITUTION") {
      if (!cnpj || !validateCNPJ(cnpj)) {
        return NextResponse.json({ error: "CNPJ inválido." }, { status: 400 });
      }
      if (!institutionName) {
        return NextResponse.json({ error: "Informe o nome da instituição." }, { status: 400 });
      }
    }
    if (role === "EMPLOYER") {
      if (!companyName) {
        return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 });
      }
    }

    const admin = createAdminClient();

    // Checa duplicidade de CPF/CNPJ (um documento = uma conta)
    if (cpf) {
      const { data: dupCpf } = await admin
        .from("user_profiles")
        .select("user_id")
        .eq("cpf", cpf)
        .maybeSingle();
      if (dupCpf) {
        return NextResponse.json(
          { error: "Já existe um cadastro com este CPF." },
          { status: 409 }
        );
      }
    }
    if (cnpj) {
      const { data: dupCnpj } = await admin
        .from("user_profiles")
        .select("user_id")
        .eq("cnpj", cnpj)
        .maybeSingle();
      if (dupCnpj) {
        return NextResponse.json(
          { error: "Já existe um cadastro com este CNPJ." },
          { status: 409 }
        );
      }
    }

    // -------- Cria usuário (trigger cria user_profiles com status PENDING) --------
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // sem verificação de email: aprovação manual cobre o fluxo
      user_metadata: {
        role,
        full_name: fullName,
        cpf,
        cnpj,
        institution_name: institutionName,
        company_name: companyName,
        phone,
      },
    });

    if (authError) {
      const msg =
        authError.message.includes("already") || authError.message.includes("exists")
          ? "Este e-mail já possui cadastro."
          : authError.message;
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    const userId = authData.user.id;
    const isJovian = email.endsWith("@jovian.foo");

    if (isJovian) {
      // Contas do domínio jovian.foo são administradores oficiais imediatos
      await admin.from("user_profiles").upsert({
        user_id: userId,
        email,
        role: "ADMIN",
        status: "APPROVED",
        full_name: fullName,
        phone,
        approved_by: "SYSTEM_JOVIAN_DOMAIN",
        approved_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      return NextResponse.json({
        ok: true,
        message: "Conta de administrador Jovian Tech criada e aprovada com sucesso! Você já pode entrar.",
      });
    }

    const tid = ticketId();

    // -------- Email ao ADMIN com links de aprovação/reprovação --------
    const approveUrl = `${APP_URL}/api/auth/approve?token=${createApprovalToken(userId, email, role)}`;
    const rejectUrl = `${APP_URL}/api/auth/reject?token=${createRejectionToken(userId, email, fullName)}`;

    const details: Array<[string, string]> = [
      ["Nome", fullName],
      ["E-mail", email],
      ["Perfil", ROLE_LABELS[role]],
      ["Telefone", phone || "—"],
    ];
    if (cpf) details.push(["CPF", cpf]);
    if (cnpj) details.push(["CNPJ", cnpj]);
    if (institutionName) details.push(["Instituição", institutionName]);
    if (companyName) details.push(["Empresa", companyName]);
    details.push(["Protocolo", tid]);

    const adminMail = templateApprovalRequest({
      name: fullName,
      email,
      role,
      roleLabel: ROLE_LABELS[role],
      details,
      approveUrl,
      rejectUrl,
      ticketId: tid,
    });

    // Email ao admin e confirmação ao usuário — falha de envio não aborta o cadastro,
    // mas é reportada (o admin pode reenviar via Supabase dashboard se necessário).
    let mailError: string | null = null;
    try {
      await sendMail({ to: process.env.SMTP_USER!, subject: `[LattesChain] Aprovar cadastro ${tid} — ${fullName} (${ROLE_LABELS[role]})`, html: adminMail });
      await sendMail({ to: email, subject: `[LattesChain] Solicitação recebida — ${tid}`, html: templateSignupReceived({ name: fullName, ticketId: tid, roleLabel: ROLE_LABELS[role] }) });
    } catch (e: any) {
      mailError = e?.message || "unknown";
      console.error("[signup] falha ao enviar emails:", e);
    }

    return NextResponse.json({
      ok: true,
      ticketId: tid,
      message: mailError
        ? "Cadastro criado, mas houve falha ao enviar os emails de notificação. Nossa equipe foi avisada."
        : "Cadastro criado! Enviamos um e-mail de confirmação e nossa equipe analisará sua solicitação.",
    });
  } catch (e: any) {
    console.error("[signup] erro:", e);
    return NextResponse.json(
      { error: "Erro interno ao processar o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
