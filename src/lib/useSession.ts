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
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  cpf?: string | null;
  cnpj?: string | null;
  institution_name?: string | null;
  company_name?: string | null;
  institution_id?: string | null;
  campus_id?: string | null;
  campus_name?: string | null;
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
    try {
      const supabase = getSupabaseBrowser();
      
      // Tentativa 1: busca com campos multitenant (migration 006)
      let data: any = null;
      const res = await supabase
        .from("user_profiles")
        .select("user_id, role, full_name, email, status, cpf, cnpj, institution_name, company_name, institution_id, campus_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (res.error) {
        // Fallback defensivo: se colunas multitenant ainda não existirem no schema remoto, carrega schema base (migration 003)
        const fallbackRes = await supabase
          .from("user_profiles")
          .select("user_id, role, full_name, email, status, cpf, cnpj, institution_name, company_name")
          .eq("user_id", userId)
          .maybeSingle();
        data = fallbackRes.data;
      } else {
        data = res.data;
      }

      const { data: authData } = await supabase.auth.getUser();
      const userEmail = authData.user?.email?.toLowerCase() || data?.email?.toLowerCase() || "";
      const isJovian = userEmail.endsWith("@jovian.foo");

      let campusName: string | null = null;
      if (data?.campus_id) {
        try {
          const { data: c } = await supabase
            .from("institution_campuses")
            .select("name")
            .eq("id", data.campus_id)
            .maybeSingle();
          if (c?.name) campusName = c.name;
        } catch (e) {
          console.warn("Campus fetch fallback:", e);
        }
      }

      if (isJovian) {
        setProfile({
          user_id: userId,
          role: "ADMIN",
          status: "APPROVED",
          full_name: data?.full_name || authData.user?.user_metadata?.full_name || "Admin Jovian",
          email: userEmail,
          cpf: data?.cpf || null,
          cnpj: data?.cnpj || null,
          institution_name: data?.institution_name || null,
          company_name: data?.company_name || null,
          institution_id: data?.institution_id || null,
          campus_id: data?.campus_id || null,
          campus_name: campusName,
        });
      } else if (data) {
        setProfile({
          ...data,
          campus_name: campusName,
        } as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn("loadProfile error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    // middleware cuidará do redirect em rotas protegidas; aqui só limpa estado
  }, []);

  return { session, profile, loading, signOut };
}
