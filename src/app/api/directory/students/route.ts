import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();

    // 1. Busca alunos cadastrados
    const { data: students, error: studErr } = await admin
      .from("students")
      .select("id, full_name, cpf, email, solana_wallet_custodial, created_at")
      .order("full_name", { ascending: true });

    if (studErr) {
      console.error("Erro ao buscar diretório de alunos:", studErr);
      return NextResponse.json({ students: [] });
    }

    // 2. Busca registros acadêmicos de todos os alunos
    const { data: records } = await admin
      .from("academic_records")
      .select("id, student_id, document_type, document_hash, solana_tx_signature, metadata, issued_at, institutions(name)");

    const recordsByStudent: Record<string, any[]> = {};
    if (records) {
      records.forEach((r) => {
        if (!recordsByStudent[r.student_id]) {
          recordsByStudent[r.student_id] = [];
        }
        recordsByStudent[r.student_id].push(r);
      });
    }

    const formatted = (students || []).map((s) => {
      const studentRecords = recordsByStudent[s.id] || [];
      const totalHours = studentRecords.reduce((acc, r) => {
        const h = r.metadata?.workload_hours;
        return acc + (typeof h === "number" ? h : 0);
      }, 0);

      return {
        ...s,
        total_records: studentRecords.length,
        total_hours: totalHours,
        records: studentRecords,
      };
    });

    return NextResponse.json({ students: formatted });
  } catch (err: any) {
    console.error("Exceção ao listar diretório de estudantes:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
