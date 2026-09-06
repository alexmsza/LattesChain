"use client";

import { useState } from "react";
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
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  ShieldCheck,
} from "lucide-react";

type Role = "STUDENT" | "INSTITUTION" | "EMPLOYER";

const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Estudante",
  INSTITUTION: "Instituição de Ensino (IES)",
  EMPLOYER: "Recrutador / RH",
};

export default function SignupPage() {
  const [role, setRole] = useState<Role>("STUDENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketId: string; message: string } | null>(null);

  const formatCpfInput = (v: string) =>
    v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  const formatCnpjInput = (v: string) =>
    v.replace(/\D/g, "").slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          email,
          phone,
          cpf: role === "STUDENT" ? cpf.replace(/\D/g, "") : undefined,
          cnpj: role === "INSTITUTION" ? cnpj.replace(/\D/g, "") : undefined,
          institutionName: role === "INSTITUTION" ? institutionName : undefined,
          companyName: role === "EMPLOYER" ? companyName : undefined,
          password,
          confirmPassword,
          agree,
        }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          setError(`Erro no servidor (${res.status} ${res.statusText || ""}). Aguarde alguns instantes e tente novamente.`);
          return;
        }
      }

      if (!res.ok) {
        setError(data?.error || "Falha ao enviar solicitação.");
        return;
      }
      setSuccess({ ticketId: data?.ticketId || "PENDING", message: data?.message || "Solicitação enviada com sucesso." });
    } catch (err: any) {
      setError(err?.message || "Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grid-pattern px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-2xl p-8 text-center glow-green">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-solana-green" />
            <h1 className="font-display text-2xl font-bold text-white">Solicitação enviada!</h1>
            <p className="mt-3 text-sm text-slate-400">{success.message}</p>
            <p className="mt-4 rounded-xl border border-slate-700 bg-navy-800/50 px-4 py-3 text-sm">
              Protocolo:{" "}
              <span className="font-mono font-bold text-solana-green">{success.ticketId}</span>
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Guarde este protocolo. A análise é feita manualmente pela equipe LattesChain e você será notificado por email.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-5 py-2.5 text-sm font-bold text-navy-900"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grid-pattern px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 20%, rgba(20,241,149,0.06), transparent 60%), radial-gradient(500px circle at 80% 80%, rgba(153,69,255,0.06), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-white">Solicitar cadastro</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sua solicitação será analisada pela equipe LattesChain antes da liberação do acesso.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 glow-green">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Seleção de perfil */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-300">Eu sou:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  {
                    id: "STUDENT",
                    label: "Estudante",
                    icon: GraduationCap,
                    activeCls: "border-solana-purple/60 bg-solana-purple/10 text-solana-purple",
                  },
                  {
                    id: "INSTITUTION",
                    label: "IES",
                    icon: Building2,
                    activeCls: "border-gold-400/60 bg-gold-400/10 text-gold-400",
                  },
                  {
                    id: "EMPLOYER",
                    label: "RH / Empresa",
                    icon: Briefcase,
                    activeCls: "border-solana-green/60 bg-solana-green/10 text-solana-green",
                  },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-xs font-semibold transition-all ${
                      active
                        ? opt.activeCls
                        : "border-slate-700 bg-navy-800/30 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">{ROLE_LABELS[role]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nome completo {role === "INSTITUTION" && <span className="text-slate-500">(do responsável)</span>}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                />
              </div>
            </div>

            {/* CPF (Estudante) */}
            {role === "STUDENT" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">CPF</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpfInput(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                  />
                </div>
              </div>
            )}

            {/* CNPJ + Instituição (IES) */}
            {role === "INSTITUTION" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">CNPJ da instituição</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCnpjInput(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Nome da instituição</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-solana-purple" />
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="Ex.: Universidade Federal de Minas Gerais"
                      className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Empresa (RH) */}
            {role === "EMPLOYER" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Nome da empresa</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex.: Tech Recursos Humanos LTDA"
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                  />
                </div>
              </div>
            )}

            {/* Email + Telefone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
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
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Telefone <span className="text-slate-500">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(31) 90000-0000"
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                />
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 8 caracteres"
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-solana-green/60 focus:outline-none focus:ring-1 focus:ring-solana-green/40"
                  />
                </div>
              </div>
            </div>

            {/* LGPD */}
            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-navy-800 accent-solana-green"
              />
              <span>
                Concordo com os <Link href="/sobre" className="font-semibold text-slate-300 hover:text-solana-green underline">Termos do Protocolo</Link> e a{" "}
                <Link href="/privacidade" target="_blank" className="font-semibold text-solana-green hover:underline">
                  Política de Privacidade (LGPD)
                </Link>. Autorizo o
                tratamento dos meus dados para criação e validação do meu passaporte acadêmico.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-3 text-sm font-bold text-navy-900 shadow-md shadow-solana-green/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando solicitação...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Enviar solicitação de cadastro
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-solana-green hover:text-solana-green/80">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
