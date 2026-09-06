import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier"); // CPF ou Wallet

    const admin = createAdminClient();
    let query = admin
      .from("employer_compliance_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (identifier) {
      const clean = identifier.replace(/\D/g, "");
      query = query.or(`student_identifier.eq.${clean},student_identifier.eq.${identifier.trim()}`);
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
    const { request_id } = body;

    if (!request_id) {
      return NextResponse.json({ error: "request_id é obrigatório." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: updated, error } = await admin
      .from("employer_compliance_requests")
      .update({
        status: "SHARED",
        shared_at: new Date().toISOString(),
      })
      .eq("id", request_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
