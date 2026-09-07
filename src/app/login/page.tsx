"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Clock,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/useSession";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  INSTITUTION: "/university",
  EMPLOYER: "/validator",
  ADMIN: "/admin-protocol",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next"); // p/ onde voltar após login (guards)
  const pendingParam = searchParams.get("pending") === "1";
  const rejectedParam = searchParams.get("rejected") === "1";

  const { dict } = useLanguage();
  const t = dict.auth.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingMsg(null);

    try {
      const supabase = getSupabaseBrowser();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.session) {
        setError(t.errorInvalid);
        return;
      }

      const isJovian = data.user.email?.toLowerCase().endsWith("@jovian.foo");

      // Carrega perfil para checar aprovação
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("status, role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userRole = isJovian ? "ADMIN" : profile?.role;
      const userStatus = isJovian ? "APPROVED" : profile?.status;

      if (!userStatus || userStatus !== "APPROVED") {
        await supabase.auth.signOut();
        if (userStatus === "REJECTED") {
          setError(t.rejectedMsg);
        } else {
          setPendingMsg(t.pendingMsg);
        }
        return;
      }

      // Redirect p/ destino (guard) ou home do papel
      const dest = nextParam && nextParam.startsWith("/") ? nextParam : ROLE_HOME[userRole || "STUDENT"] || "/";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(t.errorUnexpected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl p-8 glow-green">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-solana-purple to-solana-green p-0.5 shadow-lg shadow-solana-green/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-navy-900">
              <GraduationCap className="h-7 w-7 text-solana-green" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {rejectedParam && !error && !pendingMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.rejectedMsg}</span>
          </div>
        )}
        {pendingParam && !error && !pendingMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-400">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.pendingMsg}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {pendingMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-400">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pendingMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com ou admin@jovian.foo"
                className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                {t.passwordLabel}
              </label>
              <Link
                href="/recuperar-senha"
                className="text-xs font-semibold text-solana-green hover:text-solana-green/80 transition-colors"
                title="Acesso de administradores Jovian Tech e recuperação geral de senha"
              >
                {t.firstAccessOrForgot}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-3 text-sm font-bold text-navy-900 shadow-md shadow-solana-green/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t.submitting}
              </>
            ) : (
              t.submit
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {t.noAccount}{" "}
          <Link href="/cadastro" className="font-semibold text-solana-green hover:text-solana-green/80">
            {t.requestAccount}
          </Link>
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
        <div className="glass-panel rounded-xl px-2 py-3">
          <GraduationCap className="mx-auto mb-1 h-4 w-4 text-solana-purple" />
          {t.roleStudents}
        </div>
        <div className="glass-panel rounded-xl px-2 py-3">
          <Building2 className="mx-auto mb-1 h-4 w-4 text-gold-400" />
          {t.roleInstitutions}
        </div>
        <div className="glass-panel rounded-xl px-2 py-3">
          <Briefcase className="mx-auto mb-1 h-4 w-4 text-solana-green" />
          {t.roleRecruiters}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grid-pattern px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 20%, rgba(20,241,149,0.06), transparent 60%), radial-gradient(500px circle at 80% 80%, rgba(153,69,255,0.06), transparent 60%)",
        }}
      />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
