import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase SSR para Server Components / Server Actions
 * (usa os cookies de sessão gerenciados pelo middleware).
 */
export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesList: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesList.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado de um Server Component — middleware refresca a sessão
          }
        },
      },
    }
  );
}
