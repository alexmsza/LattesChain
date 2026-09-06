import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware de sessão Supabase:
 * - Refresca tokens de auth nos cookies
 * - Protege /student (Estudante) e /university (IES): exige login + cadastro APROVADO + papel correto
 * - Redireciona usuário logado longe de /login e /cadastro
 */

const ROLE_GUARDS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/student", roles: ["STUDENT", "ADMIN"] },
  { prefix: "/university", roles: ["INSTITUTION", "ADMIN"] },
  { prefix: "/admin-protocol", roles: ["ADMIN"] },
];

const AUTH_PAGES = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const path = request.nextUrl.pathname;

  // Usuário logado não deve ver login/cadastro
  if (user && AUTH_PAGES.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const guard = ROLE_GUARDS.find((g) => path === g.prefix || path.startsWith(g.prefix + "/"));
  if (guard) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(url);
    }

    // Carrega perfil (RLS: usuário só lê o próprio) e valida status/papel
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("status, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "APPROVED") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?pending=1";
      if (profile?.status === "REJECTED") url.search = "?rejected=1";
      return NextResponse.redirect(url);
    }

    if (!guard.roles.includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
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
