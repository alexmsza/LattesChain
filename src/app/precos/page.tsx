"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrecosPage() {
  const { dict } = useLanguage();
  const [sentLead, setSentLead] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgType, setOrgType] = useState("IES");

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgEmail) return;
    setSentLead(true);
    setTimeout(() => {
      setOrgName("");
      setOrgEmail("");
    }, 1000);
  };

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/40 bg-emerald-950/20 px-4 py-1.5 text-xs font-semibold text-solana-green">
          <Sparkles className="h-4 w-4" />
          {dict.pricing.badge}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {dict.pricing.title}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          {dict.pricing.subtitle}
        </p>
      </div>

      {/* PLANOS PARA UNIVERSIDADES (IES) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="h-6 w-6 text-solana-green" />
          <h2 className="font-display text-2xl font-bold text-white">
            {dict.pricing.universitiesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IES START */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Iniciação Digital
              </span>
              <h3 className="font-display text-xl font-bold text-white">Plano Start</h3>
              <div className="text-3xl font-extrabold text-white">
                R$ 0 <span className="text-xs font-normal text-slate-400">/ mês</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ideal para faculdades isoladas testarem a emissão de diplomas na Solana.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Até 500 atestações/ano</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Emissão de Diplomas Soulbound</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Portal Web de Emissão</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Suporte comunitário Jovian Tech</li>
              </ul>
            </div>
            <Link
              href="/university"
              className="w-full text-center rounded-xl border border-slate-700 bg-navy-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              Começar Grátis
            </Link>
          </div>

          {/* IES CAMPUS PRO */}
          <div className="glass-panel rounded-3xl p-6 border-solana-green/40 glow-green flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-6 rounded-full bg-solana-green px-3 py-0.5 text-[10px] font-bold text-navy-900 uppercase tracking-wider">
              Mais Popular
            </div>
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-solana-green">
                Campus Completo
              </span>
              <h3 className="font-display text-xl font-bold text-white">Plano Campus Pro</h3>
              <div className="text-3xl font-extrabold text-white">
                R$ 1.290 <span className="text-xs font-normal text-slate-400">/ mês</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para universidades e centros universitários com alta rotatividade de validação.
              </p>
              <ul className="space-y-2 text-xs text-slate-200 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Emissões Ilimitadas no SAS</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Triagem e Fila de Validação de Alunos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Diretório Geral de Alunos e Histórico</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Integração com Moodle / TOTVS / SAGRES</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Suporte Técnico Prioritário Jovian Tech</li>
              </ul>
            </div>
            <button
              onClick={() => {
                document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
                setOrgType("IES Pro");
              }}
              className="w-full text-center rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 py-2.5 text-xs font-bold text-navy-900 shadow-md shadow-solana-green/20 hover:scale-[1.01] transition-all"
            >
              Contratar Campus Pro
            </button>
          </div>

          {/* IES ENTERPRISE */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Redes & Federais
              </span>
              <h3 className="font-display text-xl font-bold text-white">Enterprise & Governo</h3>
              <div className="text-3xl font-extrabold text-white">Sob Consulta</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Universidades federais, estaduais e grupos educacionais multi-campi.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Relayer Go Dedicado & RPC Próprio</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Múltiplas Chaves de Coordenadoria</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> SLA 99.9% de Disponibilidade</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Auditoria de Segurança & LGPD sob medida</li>
              </ul>
            </div>
            <button
              onClick={() => {
                document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
                setOrgType("IES Enterprise");
              }}
              className="w-full text-center rounded-xl border border-slate-700 bg-navy-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              Falar com Consultor
            </button>
          </div>
        </div>
      </div>

      {/* PLANOS PARA RH / EMPRESAS & ESTUDANTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* RH PRO */}
        <div className="glass-panel rounded-3xl p-8 border-solana-purple/30 space-y-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-solana-purple" />
            <h3 className="font-display text-xl font-bold text-white">
              {dict.pricing.recruitersTitle}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-extrabold text-white">
              R$ 490 <span className="text-xs font-normal text-slate-400">/ mês</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para departamentos de Recursos Humanos, consultorias de talentos e empresas que contratam estagiários e profissionais qualificados.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200 border-t border-slate-800 pt-4">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Solicitação Formal de Comprovação de Matrícula e Estágio</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Pareceres Executivos de IA Ilimitados (Trust Report)</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Comparador Semântico de Equivalência Curricular</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> API de Background Check em Lote para ATS (Gupy, Greenhouse)</li>
          </ul>
          <Link
            href="/validator"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-solana-purple to-purple-600 py-3 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:scale-[1.01] transition-all"
          >
            Acessar Validador RH
          </Link>
        </div>

        {/* ESTUDANTE VITALÍCIO */}
        <div className="glass-panel rounded-3xl p-8 border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-solana-green" />
            <h3 className="font-display text-xl font-bold text-white">
              {dict.pricing.studentsTitle}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-extrabold text-solana-green">
              {dict.pricing.studentsPrice}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({dict.pricing.studentsPeriod})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O aluno é o verdadeiro dono do seu histórico educacional. Nenhum estudante paga para possuir suas atestações no LattesChain.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200 border-t border-slate-800 pt-4">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Passaporte Acadêmico Soberano Ilimitado</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Submissão de Cursos Internos e Externos para a IES</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> QR Code Dinâmico para Entrevistas e Congressos</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green" /> Autorização de Compartilhamento para Vagas e Estágios</li>
          </ul>
          <Link
            href="/student"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-solana-green/40 bg-solana-green/15 py-3 text-xs font-bold text-solana-green hover:bg-solana-green/25 transition-all"
          >
            Abrir Meu Passaporte
          </Link>
        </div>
      </div>

      {/* LEAD CONTACT FORM */}
      <div id="lead-form" className="glass-panel rounded-3xl p-8 sm:p-10 border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-solana-green">
            Jovian Tech Enterprise Solutions
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Solicitar Contratação ou Proposta Customizada
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Nossa equipe de engenharia Web3 e conformidade acadêmica entrará em contato em até 24 horas úteis.
          </p>

          {sentLead ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-semibold text-white text-base">Solicitação Enviada com Sucesso!</h3>
              <p className="text-xs text-slate-300">
                O time da Jovian Tech entrará em contato pelo e-mail informado com a minuta contratual e credenciais de homologação.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 text-left max-w-md mx-auto pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome da Instituição ou Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Universidade Federal / Nubank"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-solana-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="reitoria@universidade.edu.br"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-solana-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Plano de Interesse</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                >
                  <option value="IES Campus Pro">Universidade (Plano Campus Pro)</option>
                  <option value="IES Enterprise">Universidade (Enterprise / Multi-Campi)</option>
                  <option value="RH Recrutador Pro">RH / Empresa (Recrutador Pro)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 py-3 text-xs font-bold text-navy-900 shadow-md shadow-solana-green/20 hover:scale-[1.01] transition-all"
              >
                <Send className="h-4 w-4" />
                {dict.pricing.ctaTalk}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
