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
];

const AUTH_PAGES = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  // Na branch demo/mock-showcase, o acesso é 100% livre e desimpedido
  // para permitir demonstração imediata dos portais (Estudante, IES, Validador RH, Admin) sem exigir login.
  return NextResponse.next({ request });
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
