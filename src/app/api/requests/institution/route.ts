import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instId = searchParams.get("institution_id");

    const admin = createAdminClient();

    let query = admin
      .from("validation_requests")
      .select("*, students(id, full_name, cpf, solana_wallet_custodial, email), institutions(name, cnpj)")
      .order("created_at", { ascending: false });

    if (instId) {
      query = query.eq("institution_id", instId);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Erro ao buscar solicitações para IES:", error);
      return NextResponse.json({ requests: [] });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
