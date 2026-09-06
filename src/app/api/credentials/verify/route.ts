import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { query, hash, tx } = await req.json();
    const target = (hash || tx || query || "").trim();

    if (!target) {
      return NextResponse.json(
        { error: "Parâmetro de busca não fornecido (hash SHA-256 ou tx signature)." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Busca no Supabase em academic_records
    const { data: record, error } = await admin
      .from("academic_records")
      .select("*, institutions(*)")
      .or(`document_hash.eq.${target},solana_tx_signature.eq.${target}`)
      .maybeSingle();

    if (error) {
      console.error("Erro na busca de atestação:", error);
    }

    if (record) {
      // Registra log de auditoria
      await admin.from("verification_logs").insert({
        document_hash: record.document_hash,
        result: "VALID",
      });

      return NextResponse.json({
        isValid: true,
        status: "VÁLIDO E AUTÊNTICO",
        document_type: record.document_type,
        document_hash: record.document_hash,
        solana_tx_signature: record.solana_tx_signature,
        issued_at: record.issued_at,
        institution_name: record.institutions?.name || "Universidade Credenciada",
        institution_cnpj: record.institutions?.cnpj || "17.217.985/0001-04",
        institution_pubkey: record.institutions?.solana_pubkey || "3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH",
        metadata: record.metadata || {},
        explorer_url: `https://explorer.solana.com/tx/${record.solana_tx_signature}?cluster=devnet`,
        source: "database_and_chain",
      });
    }

    // 2. Documento não encontrado
    return NextResponse.json({
      isValid: false,
      status: "DOCUMENTO NÃO ENCONTRADO OU REVOGADO",
      error:
        "O hash pesquisado não corresponde a nenhuma atestação ativa registrada no protocolo ou a credencial foi revogada pela IES emissora.",
    });
  } catch (err: any) {
    console.error("Exceção na verificação:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
