import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employerEmail = searchParams.get("email");

    const admin = createAdminClient();
    let query = admin
      .from("employer_compliance_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (employerEmail) {
      query = query.eq("employer_email", employerEmail.trim());
    }

    const { data: requests, error } = await query;

    if (error) {
      return NextResponse.json({ requests: [] });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      employer_name,
      employer_email,
      student_identifier,
      purpose,
      requested_items,
    } = body;

    if (!employer_name || !employer_email || !student_identifier || !purpose) {
      return NextResponse.json(
        { error: "Todos os campos da solicitação de compliance são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const cleanIdentifier = student_identifier.replace(/\D/g, "") || student_identifier.trim();

    const { data: request, error } = await admin
      .from("employer_compliance_requests")
      .insert({
        employer_name: employer_name.trim(),
        employer_email: employer_email.trim(),
        student_identifier: cleanIdentifier,
        purpose: purpose || "ESTAGIO",
        requested_items: requested_items || ["matricula_ativa", "historico", "horas_complementares"],
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar solicitação de compliance para RH:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
