import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware de Segurança DataSecAIOps:
 * - A rota /admin-protocol é RIGOROSAMENTE BLINDADA: exige login ativo + status APPROVED + papel ADMIN.
 * - Nas rotas de estudante e universidade na branch mock, permite demonstração fluida para feiras/pitch,
 *   porém o painel administrativo do proprietário NUNCA é exposto sem credenciais válidas.
 */

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesList: Array<{ name: string; value: string; options?: any }>) {
          cookiesList.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesList.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. BLINDAGEM OBRIGATÓRIA DE ADMIN: NUNCA PERMITIR ACESSO PÚBLICO OU MOCKADO AO PAINEL MASTER
  if (path === "/admin-protocol" || path.startsWith("/admin-protocol/")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("status, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "APPROVED" || profile.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?next=%2Fadmin-protocol";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Tudo exceto: _next/static, _next/image, favicon, arquivos estáticos
     * e rotas de API (as rotas de auth cuidam de si mesmas).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
