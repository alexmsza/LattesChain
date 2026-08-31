"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Sessão Supabase no browser, sincronizada com o middleware.
 * Retorna { session, profile, loading } — profile é o user_profiles da conta.
 */

export type UserProfile = {
  user_id: string;
  role: "STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN";
  full_name: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  cpf?: string | null;
  cnpj?: string | null;
  institution_name?: string | null;
  company_name?: string | null;
};

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id, role, full_name, email, status, cpf, cnpj, institution_name, company_name")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data as UserProfile | null);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    if (session !== null && profile !== null) setLoading(false);
  }, [session, profile]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    // middleware cuidará do redirect em rotas protegidas; aqui só limpa estado
  }, []);

  return { session, profile, loading, signOut };
}
