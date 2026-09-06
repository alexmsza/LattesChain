import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/server/apiKeyAuth";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Autenticação opcional para consulta pública ou enriquecida
  const auth = await validateApiKey(request, "credentials:verify").catch(() => null);

  try {
    const body = await request.json();
    const { document_hash, transaction_signature } = body;

    if (!document_hash && !transaction_signature) {
      return NextResponse.json(
        { error: "É obrigatório informar 'document_hash' (SHA-256) ou 'transaction_signature' da Solana." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    let query = admin
      .from("academic_records")
      .select("*, institutions(*), students(*)");

    if (document_hash) {
      query = query.eq("document_hash", document_hash.trim());
    } else if (transaction_signature) {
      query = query.eq("solana_tx_signature", transaction_signature.trim());
    }

    const { data: record, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Erro na consulta: " + error.message }, { status: 500 });
    }

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (!record) {
      // Grava tentativa inválida nos logs de auditoria
      if (document_hash) {
        await admin.from("verification_logs").insert({
          document_hash: document_hash.trim(),
          result: "INVALID",
        });
      }

      return NextResponse.json(
        {
          valid: false,
          status: "NOT_FOUND",
          message: "Nenhum registro acadêmico correspondente foi encontrado na base de integridade do LattesChain.",
          searched_hash: document_hash || null,
        },
        { status: 404 }
      );
    }

    // Grava log de auditoria válido
    await admin.from("verification_logs").insert({
      document_hash: record.document_hash,
      result: "VALID_ONCHAIN",
    });

    const isDevnet = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") !== "mainnet-beta";
    const explorerUrl = isDevnet
      ? `https://explorer.solana.com/tx/${record.solana_tx_signature}?cluster=devnet`
      : `https://explorer.solana.com/tx/${record.solana_tx_signature}`;

    const rawCpf = record.students?.cpf || "";
    const maskedCpf = rawCpf.length === 11 ? `***.${rawCpf.slice(3, 6)}.${rawCpf.slice(6, 9)}-**` : rawCpf;

    return NextResponse.json({
      valid: true,
      status: "VERIFIED_ONCHAIN",
      protocol: "LattesChain (EduCore Protocol)",
      document: {
        id: record.id,
        type: record.document_type,
        hash_sha256: record.document_hash,
        issued_at: record.issued_at,
        metadata: record.metadata,
      },
      issuer_institution: {
        id: record.institutions?.id,
        name: record.institutions?.name,
        cnpj: record.institutions?.cnpj,
        authority_solana_pubkey: record.institutions?.solana_pubkey,
        mec_compliance: record.institutions?.is_verified,
      },
      student: {
        name: record.students?.full_name,
        cpf_masked: maskedCpf,
        solana_wallet: record.students?.solana_wallet_custodial,
      },
      blockchain_proof: {
        network: isDevnet ? "devnet" : "mainnet-beta",
        signature: record.solana_tx_signature,
        explorer_url: explorerUrl,
        immutable: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno no servidor: " + err.message }, { status: 500 });
  }
}
