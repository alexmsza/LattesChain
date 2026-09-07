import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabaseAdmin";
import { createServerSupabaseClient } from "@/lib/server/session";
import { resolveUserTenant } from "@/lib/server/tenantHelper";

export const dynamic = "force-dynamic";

/**
 * GET /api/institution/campuses
 * Lista os campus da instituição logada (ou filtrado por institution_id se ADMIN).
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
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito a IES e administradores." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetInstitutionId = tenant.isAdmin
      ? searchParams.get("institution_id") || tenant.institution_id
      : tenant.institution_id;

    let query = admin
      .from("institution_campuses")
      .select("*, institutions(id, name, cnpj)")
      .order("created_at", { ascending: false });

    if (targetInstitutionId) {
      query = query.eq("institution_id", targetInstitutionId);
    }

    const { data: campuses, error } = await query;

    if (error) {
      console.error("[campuses-get] erro ao buscar campus:", error);
      return NextResponse.json({ campuses: [] });
    }

    return NextResponse.json({
      ok: true,
      campuses: campuses || [],
      institution_id: targetInstitutionId,
      institution_name: tenant.institution_name,
    });
  } catch (err: any) {
    console.error("[campuses-get] exceção:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/institution/campuses
 * Cria um novo campus para a IES.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito a IES e administradores." }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, city, state, institution_id } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "O nome do campus é obrigatório." }, { status: 400 });
    }

    const effectiveInstitutionId = tenant.isAdmin && institution_id ? institution_id : tenant.institution_id;

    if (!effectiveInstitutionId) {
      return NextResponse.json(
        { error: "Nenhuma instituição associada ao usuário atual para vinculação do campus." },
        { status: 400 }
      );
    }

    const { data: campus, error } = await admin
      .from("institution_campuses")
      .insert({
        institution_id: effectiveInstitutionId,
        name: name.trim(),
        code: code ? code.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim().toUpperCase().slice(0, 2) : null,
        is_active: true,
      })
      .select("*, institutions(name)")
      .single();

    if (error) {
      console.error("[campuses-post] erro ao criar:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Campus '${campus.name}' cadastrado com sucesso!`,
      campus,
    });
  } catch (err: any) {
    console.error("[campuses-post] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/institution/campuses
 * Atualiza dados ou status de ativação do campus.
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const tenant = await resolveUserTenant(admin, user.id, user.email);

    if (!tenant || (!tenant.isAdmin && tenant.role !== "INSTITUTION")) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, code, city, state, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do campus é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof code === "string") updatePayload.code = code.trim();
    if (typeof city === "string") updatePayload.city = city.trim();
    if (typeof state === "string") updatePayload.state = state.trim().toUpperCase().slice(0, 2);
    if (typeof is_active === "boolean") updatePayload.is_active = is_active;

    let query = admin.from("institution_campuses").update(updatePayload).eq("id", id);

    // Se não for admin, restringe à própria IES
    if (!tenant.isAdmin && tenant.institution_id) {
      query = query.eq("institution_id", tenant.institution_id);
    }

    const { data: updated, error } = await query.select().single();

    if (error) {
      console.error("[campuses-put] erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Campus atualizado com sucesso.",
      campus: updated,
    });
  } catch (err: any) {
    console.error("[campuses-put] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
