import { createAdminClient } from "@/lib/server/supabaseAdmin";
import crypto from "crypto";

export interface AuthenticatedApiKey {
  id: string;
  name: string;
  institution_id: string | null;
  scopes: string[];
  rate_limit_per_minute: number;
}

export async function validateApiKey(
  request: Request,
  requiredScope?: string
): Promise<{ error?: { status: number; message: string }; token?: AuthenticatedApiKey }> {
  const authHeader = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");

  let rawToken = "";
  if (xApiKey) {
    rawToken = xApiKey.trim();
  } else if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    rawToken = authHeader.slice(7).trim();
  }

  if (!rawToken) {
    return {
      error: {
        status: 401,
        message: "Chave de API não fornecida. Utilize o header 'x-api-key: <TOKEN>' ou 'Authorization: Bearer <TOKEN>'.",
      },
    };
  }

  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const admin = createAdminClient();

  const { data: tokenRecord, error: dbError } = await admin
    .from("api_tokens")
    .select("id, name, institution_id, scopes, rate_limit_per_minute, is_active, expires_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (dbError || !tokenRecord) {
    return {
      error: {
        status: 401,
        message: "Chave de API inválida, não encontrada ou revogada.",
      },
    };
  }

  if (!tokenRecord.is_active) {
    return {
      error: {
        status: 403,
        message: "Esta chave de API está inativa ou foi desativada pelo administrador do protocolo.",
      },
    };
  }

  if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
    return {
      error: {
        status: 403,
        message: "Esta chave de API expirou.",
      },
    };
  }

  if (requiredScope && (!tokenRecord.scopes || !tokenRecord.scopes.includes(requiredScope))) {
    return {
      error: {
        status: 403,
        message: `Escopo insuficiente. Esta chave requer o escopo '${requiredScope}'. Escopos concedidos: [${(tokenRecord.scopes || []).join(", ")}].`,
      },
    };
  }

  // Atualiza last_used_at de forma não bloqueante
  admin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRecord.id)
    .then(() => {});

  return {
    token: {
      id: tokenRecord.id,
      name: tokenRecord.name,
      institution_id: tokenRecord.institution_id,
      scopes: tokenRecord.scopes || [],
      rate_limit_per_minute: tokenRecord.rate_limit_per_minute || 120,
    },
  };
}
