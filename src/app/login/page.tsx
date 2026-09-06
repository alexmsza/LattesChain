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
  CheckCircle2,
  Clock,
  Lock,
  Mail,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/useSession";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  INSTITUTION: "/university",
  EMPLOYER: "/validator",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next"); // p/ onde voltar após login (guards)
  const pendingParam = searchParams.get("pending") === "1";
  const rejectedParam = searchParams.get("rejected") === "1";

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
        setError("E-mail ou senha incorretos.");
        return;
      }

      // Carrega perfil para checar aprovação
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("status, role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profile || profile.status !== "APPROVED") {
        await supabase.auth.signOut();
        if (profile?.status === "REJECTED") {
          setError("Seu cadastro foi reprovado. Fale com o suporte em LattesChain@jovian.foo.");
        } else {
          setPendingMsg(
            "Sua conta ainda está em análise pela equipe LattesChain. Você receberá um email assim que for aprovada."
          );
        }
        return;
      }

      // Redirect p/ destino (guard) ou home do papel
      const dest = nextParam && nextParam.startsWith("/") ? nextParam : ROLE_HOME[profile.role] || "/";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError("Erro inesperado ao entrar. Tente novamente.");
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
          <h1 className="font-display text-2xl font-bold text-white">Entrar na plataforma</h1>
          <p className="mt-2 text-sm text-slate-400">
            Passaporte acadêmico soberano na Solana
          </p>
        </div>

        {rejectedParam && !error && !pendingMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Seu cadastro foi reprovado. Fale com o suporte em LattesChain@jovian.foo.</span>
          </div>
        )}
        {pendingParam && !error && !pendingMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-400">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Sua conta ainda está em análise pela equipe LattesChain. Você receberá um email assim que for aprovada.
            </span>
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

        {/* PAINEL DE ACESSO RÁPIDO DE DEMONSTRAÇÃO (SEM SENHA) */}
        <div className="mb-6 rounded-2xl border border-solana-green/40 bg-navy-950/80 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-solana-green">
            <span className="flex h-2 w-2 rounded-full bg-solana-green animate-ping" />
            Acesso Rápido Mock (Sem Autenticação):
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Navegue diretamente pelos 4 portais da plataforma com dados canônicos:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/student"
              className="flex items-center gap-2 rounded-xl bg-purple-950/40 border border-purple-500/30 p-2.5 text-xs text-purple-200 hover:bg-purple-900/50 hover:border-purple-400 transition-all"
            >
              <GraduationCap className="h-4 w-4 text-solana-purple shrink-0" />
              <div className="text-left">
                <span className="font-bold block">1. Estudante</span>
                <span className="text-[10px] text-slate-400">Alexandre (UFMG)</span>
              </div>
            </Link>

            <Link
              href="/university"
              className="flex items-center gap-2 rounded-xl bg-blue-950/40 border border-blue-500/30 p-2.5 text-xs text-blue-200 hover:bg-blue-900/50 hover:border-blue-400 transition-all"
            >
              <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">2. IES Emissora</span>
                <span className="text-[10px] text-slate-400">Portal UFMG / MEC</span>
              </div>
            </Link>

            <Link
              href="/validator"
              className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all"
            >
              <Briefcase className="h-4 w-4 text-solana-green shrink-0" />
              <div className="text-left">
                <span className="font-bold block">3. RH / Empresas</span>
                <span className="text-[10px] text-slate-400">Validador + IA</span>
              </div>
            </Link>

            <Link
              href="/admin-protocol"
              className="flex items-center gap-2 rounded-xl bg-amber-950/40 border border-amber-500/30 p-2.5 text-xs text-amber-200 hover:bg-amber-900/50 hover:border-amber-400 transition-all"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">4. Protocolo</span>
                <span className="text-[10px] text-slate-400">Master Registry</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-navy-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 shrink-0">
            ou acesse com e-mail cadastrado
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              E-mail
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
                placeholder="voce@email.com"
                className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Senha
              </label>
              <Link
                href="/recuperar-senha"
                className="text-xs font-semibold text-solana-green hover:text-solana-green/80"
              >
                Esqueci minha senha
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
                <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-solana-green hover:text-solana-green/80">
            Solicite seu cadastro
          </Link>
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
        <div className="glass-panel rounded-xl px-2 py-3">
          <GraduationCap className="mx-auto mb-1 h-4 w-4 text-solana-purple" />
          Estudantes
        </div>
        <div className="glass-panel rounded-xl px-2 py-3">
          <Building2 className="mx-auto mb-1 h-4 w-4 text-gold-400" />
          Instituições
        </div>
        <div className="glass-panel rounded-xl px-2 py-3">
          <Briefcase className="mx-auto mb-1 h-4 w-4 text-solana-green" />
          RH / Empresas
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
