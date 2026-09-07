"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { dict } = useLanguage();
  const t = dict.auth.forgotPassword;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao solicitar acesso.");
        return;
      }
      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grid-pattern px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 20%, rgba(20,241,149,0.06), transparent 60%), radial-gradient(500px circle at 80% 80%, rgba(153,69,255,0.06), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="glass-panel rounded-2xl p-8 glow-green">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-solana-green/10 border border-solana-green/30">
              <KeyRound className="h-7 w-7 text-solana-green" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">{t.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {t.subtitle}
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-solana-green" />
              <h3 className="text-base font-bold text-white mb-2">{t.sentTitle}</h3>
              <p className="text-sm text-slate-300">
                {t.sentNotice}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {t.sentHelp}
              </p>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-solana-green/40 hover:text-white transition-colors"
                >
                  {t.tryAnotherEmail}
                </button>
                <Link
                  href="/login"
                  className="block rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-2.5 text-sm font-bold text-navy-900 shadow-md shadow-solana-green/20 text-center hover:scale-[1.01] transition-all"
                >
                  {t.backToLogin}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder={t.emailPlaceholder}
                      className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                    />
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
                    <>
                      <Mail className="h-4 w-4" /> {t.submit}
                    </>
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-400">
                {t.remembered}{" "}
                <Link href="/login" className="font-semibold text-solana-green hover:text-solana-green/80">
                  {t.backToLogin}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
