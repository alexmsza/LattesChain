import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/server/session";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

async function assertAdminSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado", status: 401 };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isJovian = user.email?.toLowerCase().endsWith("@jovian.foo");
  if (!isJovian && (!profile || profile.role !== "ADMIN" || profile.status !== "APPROVED")) {
    return { error: "Acesso restrito a administradores do protocolo.", status: 403 };
  }

  return { user, admin };
}

export async function GET(req: Request) {
  const check = await assertAdminSession();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { admin } = check;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  try {
    // Busca registros acadêmicos ancorados on-chain
    const { data: records, error: recError } = await admin
      .from("academic_records")
      .select("*, institutions(name, cnpj, solana_pubkey), students(full_name, cpf, solana_wallet_custodial)")
      .order("issued_at", { ascending: false })
      .limit(limit);

    if (recError) {
      return NextResponse.json({ error: "Erro ao buscar transações: " + recError.message }, { status: 500 });
    }

    // Busca últimos logs de auditoria
    const { data: logs, error: logsError } = await admin
      .from("verification_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    const isDevnet = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") !== "mainnet-beta";

    const formattedRecords = (records || []).map((r) => ({
      id: r.id,
      document_type: r.document_type,
      document_hash: r.document_hash,
      solana_tx_signature: r.solana_tx_signature,
      explorer_url: isDevnet
        ? `https://explorer.solana.com/tx/${r.solana_tx_signature}?cluster=devnet`
        : `https://explorer.solana.com/tx/${r.solana_tx_signature}`,
      institution_name: r.institutions?.name || "IES Credenciada",
      institution_cnpj: r.institutions?.cnpj,
      student_name: r.students?.full_name || "Estudante",
      student_cpf: r.students?.cpf ? `***.${r.students.cpf.slice(3, 6)}.${r.students.cpf.slice(6, 9)}-**` : "—",
      issued_at: r.issued_at,
      metadata: r.metadata,
      status: "FINALIZED",
    }));

    // Métricas
    const totalTransactions = records?.length || 0;
    const totalVerifications = logs?.length || 0;

    return NextResponse.json({
      network: isDevnet ? "devnet" : "mainnet-beta",
      total_issued: totalTransactions,
      total_verified: totalVerifications,
      transactions: formattedRecords,
      verification_logs: logs || [],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno: " + err.message }, { status: 500 });
  }
}
