import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: institutions, error } = await admin
      .from("institutions")
      .select("id, name, cnpj, solana_pubkey, is_verified, is_active, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao listar instituições:", error);
      return NextResponse.json({ institutions: [] }, { status: 200 });
    }

    // Busca contagem de atestações por instituição
    const { data: records } = await admin
      .from("academic_records")
      .select("institution_id");

    const counts: Record<string, number> = {};
    if (records) {
      records.forEach((r) => {
        if (r.institution_id) {
          counts[r.institution_id] = (counts[r.institution_id] || 0) + 1;
        }
      });
    }

    const formatted = (institutions || []).map((inst) => ({
      ...inst,
      total_issued: counts[inst.id] || 0,
    }));

    return NextResponse.json({ institutions: formatted });
  } catch (err: any) {
    console.error("Exceção ao buscar instituições:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, cnpj, solana_pubkey } = body;

    if (!name || !cnpj || !solana_pubkey) {
      return NextResponse.json(
        { error: "Nome, CNPJ e Solana Public Key são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const cleanCnpj = cnpj.replace(/\D/g, "");

    const { data, error } = await admin
      .from("institutions")
      .insert({
        name: name.trim(),
        cnpj: cleanCnpj,
        solana_pubkey: solana_pubkey.trim(),
        is_verified: true,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao registrar instituição:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ institution: data, success: true });
  } catch (err: any) {
    console.error("Exceção ao cadastrar instituição:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
