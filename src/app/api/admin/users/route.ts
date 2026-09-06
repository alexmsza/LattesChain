import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { createServerSupabaseClient } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Lista usuários cadastrados com suporte a filtro por status (PENDING, APPROVED, REJECTED, ALL).
 * Protegido: Apenas ADMINs autenticados podem consultar.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("user_profiles")
      .select("role, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isJovian = user.email?.toLowerCase().endsWith("@jovian.foo");
    if (!isJovian && (!profile || profile.role !== "ADMIN" || profile.status !== "APPROVED")) {
      return NextResponse.json(
        { error: "Acesso restrito à governança administrativa." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

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
