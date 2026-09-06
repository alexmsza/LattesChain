import crypto from "crypto";

/**
 * Tokens de ação assinados com HMAC-SHA256 (aprovação/reprovação de cadastro).
 * Estrutura: base64url(payload).base64url(hmac)
 * Payload: { uid, action, exp } — exp em epoch seconds.
 */

const SECRET = process.env.APP_SECRET || "";

function requireSecret() {
  if (!SECRET) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "latteschain-secret-salt-2026-superteam";
  }
  return SECRET;
}

function b64uEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: object, ttlSeconds: number): string {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const data = b64uEncode(Buffer.from(JSON.stringify(body), "utf8"));
  const mac = crypto.createHmac("sha256", requireSecret()).update(data).digest();
  return `${data}.${b64uEncode(mac)}`;
}

function verify(token: string): { valid: boolean; payload?: any; reason?: string } {
  try {
    const [data, mac] = token.split(".");
    if (!data || !mac) return { valid: false, reason: "malformed" };
    const expected = b64uEncode(
      crypto.createHmac("sha256", requireSecret()).update(data).digest()
    );
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, reason: "bad_signature" };
    }
    const payload = JSON.parse(b64uDecode(data).toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: "expired", payload };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "error" };
  }
}

/** Gera token de aprovação de cadastro (72h de validade). */
export function createApprovalToken(userId: string, email: string, role: string) {
  return sign({ uid: userId, email, role, action: "APPROVE_SIGNUP" }, 72 * 3600);
}

/** Gera token de reprovação de cadastro (72h de validade). */
export function createRejectionToken(userId: string, email: string, name: string) {
  return sign({ uid: userId, email, name, action: "REJECT_SIGNUP" }, 72 * 3600);
}

/** Verifica e decodifica um token de ação. */
export function verifyActionToken(token: string) {
  return verify(token);
}

/** Gera token bruto de reset de senha (armazenamos só o SHA-256 dele). */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** ID curto de protocolo p/ exibição (ex: LC-3F9A2C). */
export function ticketId(): string {
  return "LC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}
