import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { validateApiKey } from "@/lib/server/apiKeyAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Autenticação opcional: se fornecer chave, valida; se não, fornece visão pública limitada
  const auth = await validateApiKey(request, "institutions:read").catch(() => null);

  const admin = createAdminClient();
  const { data: institutions, error } = await admin
    .from("institutions")
    .select("id, name, cnpj, solana_pubkey, is_verified, is_active, created_at")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Erro ao consultar instituições: " + error.message }, { status: 500 });
  }

  return NextResponse.json({
    protocol: "LattesChain",
    total: institutions.length,
    institutions: institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      cnpj: inst.cnpj,
      solana_authority: inst.solana_pubkey,
      is_mec_verified: inst.is_verified,
      created_at: inst.created_at,
    })),
  });
}
