import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Lista usuários cadastrados com suporte a filtro por status (PENDING, APPROVED, REJECTED, ALL)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const admin = createAdminClient();
    let query = admin
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("[admin-users] erro ao listar:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      users: users || [],
    });
  } catch (err: any) {
    console.error("[admin-users] erro interno:", err);
    return NextResponse.json({ error: "Erro interno ao carregar usuários." }, { status: 500 });
  }
}
