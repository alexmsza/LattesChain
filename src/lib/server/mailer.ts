import nodemailer from "nodemailer";

/**
 * Envio de email transacional via Lark Mail (SMTP da conta contact@jovian.foo).
 * Verificado em produção local: smtp.larksuite.com:465 (SSL) funciona.
 */

const HOST = process.env.SMTP_HOST || "smtp.larksuite.com";
const PORT = Number(process.env.SMTP_PORT || 465);
const SECURE = process.env.SMTP_SECURE !== "false";
const USER = process.env.SMTP_USER || "contact@jovian.foo";
const PASS = process.env.SMTP_PASS || "";
const FROM = process.env.MAIL_FROM || `LattesChain <${USER}>`;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: SECURE,
  auth: { user: USER, pass: PASS },
  connectionTimeout: 4_000,
  greetingTimeout: 4_000,
  socketTimeout: 5_000,
});

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!USER || !PASS) {
    console.warn("[mailer] SMTP_USER ou SMTP_PASS ausentes no ambiente. E-mail simulado para:", options.to);
    return { messageId: "simulated-smtp-fallback" };
  }
  return transporter.sendMail({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || stripHtml(options.html),
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============ Templates de email (dark, alinhados à marca) ============ */

const shell = (title: string, bodyHtml: string, footerNote?: string) => `
<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;padding:0;background:#080c14;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:bold;color:#ffffff;">Lattes<span style="color:#14F195;">Chain</span></span>
      <div style="font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">EduCore Protocol</div>
    </div>
    <div style="background:#0d1526;border:1px solid #1e293b;border-radius:16px;padding:28px;">
      <h1 style="font-size:18px;color:#ffffff;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      ${footerNote ? `<p style="font-size:12px;color:#64748b;margin-top:24px;border-top:1px solid #1e293b;padding-top:16px;">${footerNote}</p>` : ""}
    </div>
    <div style="text-align:center;font-size:11px;color:#475569;margin-top:24px;">
      LattesChain — Passaporte Acadêmico Soberano na Solana · Este é um email automático.
    </div>
  </div>
</body></html>`;

const button = (href: string, label: string) => `
<a href="${href}" style="display:inline-block;background:#14F195;color:#0b1320;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">${label}</a>
<div style="font-size:12px;color:#64748b;word-break:break-all;">Se o botão não funcionar, copie e cole este link:<br>${href}</div>`;

/** Email enviado ao ADMIN (contact@jovian.foo) para aprovar/reprovar um novo cadastro. */
export function templateApprovalRequest(p: {
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  details: Array<[string, string]>;
  approveUrl: string;
  rejectUrl: string;
  ticketId: string;
}) {
  return shell(
    `Novo cadastro pendente — ${p.roleLabel}`,
    `
    <p>Um novo usuário solicitou acesso à plataforma:</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      ${p.details
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#94a3b8;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;color:#e2e8f0;">${v}</td></tr>`
        )
        .join("")}
    </table>
    <p style="margin-top:20px;font-size:14px;">Para o usuário <b>acessar a plataforma</b>, sua ação é necessária:</p>
    <div style="text-align:center;">
      ${button(p.approveUrl, "Aprovar cadastro")}
      <div style="margin:8px 0 16px;">
        <a href="${p.rejectUrl}" style="display:inline-block;background:transparent;border:1px solid #f87171;color:#f87171;font-weight:bold;font-size:13px;padding:10px 24px;border-radius:12px;text-decoration:none;">Reprovar solicitação</a>
      </div>
    </div>
    <p style="font-size:12px;color:#64748b;">Protocolo: <code style="color:#14F195;">${p.ticketId}</code></p>
    `,
    "Links de ação válidos por 72 horas e para uso único. Se você não esperava este email, ignore-o."
  );
}

/** Confirmação ao usuário de que a solicitação de cadastro foi recebida. */
export function templateSignupReceived(p: { name: string; ticketId: string; roleLabel: string }) {
  return shell(
    `Recebemos sua solicitação, ${p.name}!`,
    `
    <p>Sua solicitação de acesso como <b>${p.roleLabel}</b> foi recebida e está em análise pela equipe LattesChain.</p>
    <p>Você receberá um email assim que o cadastro for aprovado. Protocolo: <code style="color:#14F195;">${p.ticketId}</code></p>
    <p style="font-size:13px;color:#94a3b8;">Se você não solicitou este cadastro, ignore este email.</p>
    `
  );
}

/** Email com o link de redefinição de senha. */
export function templatePasswordReset(p: { name: string; resetUrl: string }) {
  return shell(
    "Redefinição de senha",
    `
    <p>Olá, ${p.name}.</p>
    <p>Recebemos um pedido para redefinir a senha da sua conta LattesChain. O link abaixo é válido por <b>1 hora</b> e pode ser usado apenas uma vez:</p>
    <div style="text-align:center;">${button(p.resetUrl, "Redefinir minha senha")}</div>
    <p style="font-size:13px;color:#94a3b8;">Se não foi você quem solicitou, pode ignorar este email — sua senha atual permanece válida.</p>
    `,
    "Por segurança, nunca compartilhe este link."
  );
}

/** Notificação de cadastro aprovado (enviada após o admin aprovar). */
export function templateAccountApproved(p: { name: string; loginUrl: string; roleLabel: string }) {
  return shell(
    `Cadastro aprovado, ${p.name}!`,
    `
    <p>Seu acesso como <b>${p.roleLabel}</b> foi aprovado. Bem-vindo(a) ao LattesChain!</p>
    <div style="text-align:center;">${button(p.loginUrl, "Entrar na plataforma")}</div>
    <p style="font-size:13px;color:#94a3b8;">Use o email e a senha escolhidos no cadastro.</p>
    `
  );
}

/** Notificação de cadastro reprovado. */
export function templateAccountRejected(p: { name: string; reason: string; signupUrl: string }) {
  return shell(
    "Sua solicitação de cadastro",
    `
    <p>Olá, ${p.name}.</p>
    <p>Infelizmente sua solicitação de cadastro no LattesChain não foi aprovada neste momento.</p>
    <p><b>Motivo informado:</b> ${p.reason}</p>
    <p style="font-size:13px;color:#94a3b8;">Se acredita que isso é um engano, responda este email ou solicite um novo cadastro.</p>
    <div style="text-align:center;">${button(p.signupUrl, "Solicitar novo cadastro")}</div>
    `
  );
}

/** Convite / Acesso enviado ao estudante quando a IES o cadastra ou matricula. */
export function templateStudentInvitation(p: {
  studentName: string;
  institutionName: string;
  campusName?: string;
  courseName: string;
  registrationNumber: string;
  accessUrl: string;
}) {
  return shell(
    `Seu Passaporte Acadêmico no LattesChain — ${p.institutionName}`,
    `
    <p>Olá, <b>${p.studentName}</b>!</p>
    <p>A instituição <b>${p.institutionName}</b>${p.campusName ? ` (Campus ${p.campusName})` : ""} registrou a sua matrícula no <b>LattesChain</b>, o protocolo soberano de credenciais acadêmicas na rede Solana.</p>
    
    <div style="background:#090f1d;border:1px solid #1e293b;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">Curso: <strong style="color:#ffffff;">${p.courseName}</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">Matrícula: <strong style="color:#14F195;">${p.registrationNumber}</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">Instituição: <strong style="color:#ffffff;">${p.institutionName}</strong></p>
    </div>

    <p>Você pode acessar sua carteira acadêmica soberana, consultar suas matérias, horas complementares e gerar QR Codes e atestações públicas com validade jurídica:</p>
    <div style="text-align:center;">${button(p.accessUrl, "Acessar Meu Passaporte Acadêmico")}</div>
    <p style="font-size:12px;color:#64748b;">Suas credenciais são ancoradas diretamente na Solana Devnet e garantidas por tecnologia criptográfica Token-2022.</p>
    `,
    "Caso você já possua conta no LattesChain com outra instituição, este novo vínculo foi adicionado automaticamente ao seu perfil unificado."
  );
}

/** Notificação de solicitação de compliance/visualização de dados enviada por RH/Empresa (LGPD Art. 7º/9º). */
export function templateEmployerComplianceNotification(p: {
  studentName: string;
  employerName: string;
  employerEmail: string;
  purpose: string;
  consentUrl: string;
}) {
  const purposeLabels: Record<string, string> = {
    ESTAGIO: "Processo Seletivo de Estágio",
    VAGA_CLT: "Contratação Efetiva (CLT)",
    BACKGROUND_CHECK: "Validação Documental / Background Check",
    POS_GRADUACAO: "Admissão em Pós-Graduação / Pesquisa",
  };

  const purposeStr = purposeLabels[p.purpose] || p.purpose;

  return shell(
    `Solicitação de Acesso Acadêmico — ${p.employerName}`,
    `
    <p>Olá, <b>${p.studentName}</b>!</p>
    <p>A empresa <b>${p.employerName}</b> (${p.employerEmail}) solicitou acesso à visualização das suas credenciais acadêmicas verificadas no <b>LattesChain</b>.</p>
    
    <div style="background:#090f1d;border:1px solid #1e293b;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">Finalidade Declarada: <strong style="color:#ffffff;">${purposeStr}</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">Itens Solicitados: <strong style="color:#14F195;">Status de Matrícula, Histórico de Disciplinas e Horas MEC</strong></p>
    </div>

    <p style="font-size:13px;color:#cbd5e1;"><b>Em conformidade com a LGPD (Lei nº 13.709/2018)</b>, o compartilhamento dos seus dados só ocorre mediante sua autorização explícita e revogável. Nenhum dado sensível é revelado sem seu consentimento.</p>
    <div style="text-align:center;">${button(p.consentUrl, "Revisar e Autorizar Compartilhamento")}</div>
    `,
    "Você tem autonomia total sobre quem acessa seus dados e pode revogar o consentimento a qualquer momento pelo portal do estudante."
  );
}

