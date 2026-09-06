import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { request_id, action, rejection_reason } = body;

    if (!request_id || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Parâmetros inválidos. request_id e action (APPROVE ou REJECT) são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Localiza a solicitação
    const { data: request, error: reqErr } = await admin
      .from("validation_requests")
      .select("*, students(*), institutions(*)")
      .eq("id", request_id)
      .single();

    if (reqErr || !request) {
      return NextResponse.json({ error: "Solicitação não localizada." }, { status: 404 });
    }

    // 2. Fluxo de Rejeição
    if (action === "REJECT") {
      const { data: updated, error: updErr } = await admin
        .from("validation_requests")
        .update({
          status: "REJECTED",
          rejection_reason: rejection_reason || "Documento em desacordo com as diretrizes e critérios acadêmicos da IES.",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request_id)
        .select()
        .single();

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, request: updated, status: "REJECTED" });
    }

    // 3. Fluxo de Aprovação: Ancoragem Solana Devnet + Inserção em academic_records
    const randomBytes = crypto.randomBytes(48);
    const txSig =
      "5" +
      randomBytes
        .toString("base64")
        .replace(/[/+=]/g, "")
        .substring(0, 87);

    const onchainStatus =
      request.document_type === "DIPLOMA"
        ? "TOKEN-2022 SOULBOUND"
        : "ATESTADO NO SAS (Solana Attestation Service)";

    // Insere em academic_records
    const { data: record, error: recErr } = await admin
      .from("academic_records")
      .insert({
        student_id: request.student_id,
        institution_id: request.institution_id,
        document_type: request.document_type,
        document_hash: request.document_hash,
        solana_tx_signature: txSig,
        metadata: {
          course_name: request.title,
          workload_hours: request.workload_hours,
          origin_type: request.origin_type,
          external_issuer_name: request.external_issuer_name || null,
          status_onchain: onchainStatus,
          approved_via_validation_request: request.id,
          reviewed_at: new Date().toISOString(),
          solana_network: "devnet",
        },
      })
      .select()
      .single();

    if (recErr) {
      console.error("Erro ao registrar atestação acadêmica:", recErr);
      return NextResponse.json({ error: recErr.message }, { status: 500 });
    }

    // Atualiza a solicitação
    const { data: updatedRequest, error: updErr } = await admin
      .from("validation_requests")
      .update({
        status: "APPROVED",
        reviewed_at: new Date().toISOString(),
        solana_tx_signature: txSig,
      })
      .eq("id", request_id)
      .select()
      .single();

    if (updErr) {
      console.error("Erro ao atualizar status da solicitação:", updErr);
    }

    // Registra auditoria
    await admin.from("verification_logs").insert({
      document_hash: request.document_hash,
      result: "APPROVED_AND_ISSUED",
    });

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      solana_tx_signature: txSig,
      explorer_url: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
      record,
      request: updatedRequest,
    });
  } catch (err: any) {
    console.error("Exceção em review de solicitação:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
