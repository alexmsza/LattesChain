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

    if (error || !requests || requests.length === 0) {
      const { MOCK_COMPLIANCE_REQUESTS } = await import("@/lib/mockData");
      if (employerEmail) {
        return NextResponse.json({
          requests: MOCK_COMPLIANCE_REQUESTS.filter(
            (r) => r.employer_email.toLowerCase() === employerEmail.toLowerCase().trim()
          ),
        });
      }
      return NextResponse.json({ requests: MOCK_COMPLIANCE_REQUESTS });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (err: any) {
    const { MOCK_COMPLIANCE_REQUESTS } = await import("@/lib/mockData");
    return NextResponse.json({ requests: MOCK_COMPLIANCE_REQUESTS });
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
      console.warn("Supabase indisponível no mock showcase, retornando requisição simulada:", error.message);
      const mockRequest = {
        id: `comp-${Date.now()}`,
        employer_name: employer_name.trim(),
        employer_email: employer_email.trim(),
        student_identifier: cleanIdentifier,
        purpose: purpose || "ESTAGIO",
        requested_items: requested_items || ["matricula_ativa", "historico", "horas_complementares"],
        status: "PENDING",
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, request: mockRequest });
    }

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    const mockRequest = {
      id: `comp-${Date.now()}`,
      employer_name: "Empresa Parceira",
      employer_email: "rh@empresa.com",
      student_identifier: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
      purpose: "ESTAGIO",
      requested_items: ["Comprovante de Matrícula Ativa", "Histórico Escolar"],
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, request: mockRequest });
  }
}
