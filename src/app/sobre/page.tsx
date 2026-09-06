"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  BrainCircuit,
  Lock,
  Globe2,
  Award,
  ArrowRight,
  CheckCircle2,
  Layers,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SobrePage() {
  const { dict } = useLanguage();

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/40 bg-purple-950/20 px-4 py-1.5 text-xs font-semibold text-purple-300">
          <Sparkles className="h-4 w-4 text-solana-green" />
          {dict.about.badge}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {dict.about.title}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          {dict.about.description}
        </p>
      </div>

      {/* JOVIAN TECH VENTURE BUILDER CARD */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border-solana-green/30 glow-green relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-solana-green">
              GovTech • DataSecAIOps • Web3
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {dict.about.companyTitle}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {dict.about.companyDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/precos"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-md shadow-solana-green/20 hover:scale-[1.02] transition-all"
            >
              Ver Planos e Contratação
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/validator"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-navy-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition-all"
            >
              Testar Validador Público
            </Link>
          </div>
        </div>
      </div>

      {/* LEADERSHIP & DEVELOPER SECTION */}
      <div className="glass-panel rounded-3xl p-8 border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-solana-purple">
              Autoria & Engenharia do Sistema
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Desenvolvido por Alex Miqueias • Jovian Tech
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Solução concebida e implementada para o Hackathon Universitário Superteam Brasil 2026, unindo contratos Token-2022 Soulbound, Solana Attestation Service e infraestrutura DataSecAIOps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.linkedin.com/in/alexmiqueias/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/20 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-900/40 transition-all"
            >
              LinkedIn do Desenvolvedor
            </a>
            <a
              href="https://www.instagram.com/alexmsza/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-pink-500/40 bg-pink-950/20 px-4 py-2.5 text-xs font-bold text-pink-300 hover:bg-pink-900/40 transition-all"
            >
              Instagram @alexmsza
            </a>
            <a
              href="https://jovian.foo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-solana-green/40 bg-solana-green/10 px-4 py-2.5 text-xs font-bold text-solana-green hover:bg-solana-green/20 transition-all"
            >
              Website jovian.foo
            </a>
          </div>
        </div>
      </div>

      {/* 4 PILARES TECNOLÓGICOS */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Pilares da Infraestrutura LattesChain
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engenharia robusta projetada para escala, conformidade jurídica e custo desprezível.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-solana-green/10 text-solana-green flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {dict.about.pillar1Title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dict.about.pillar1Desc}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-solana-purple/20 text-purple-300 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {dict.about.pillar2Title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dict.about.pillar2Desc}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {dict.about.pillar3Title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dict.about.pillar3Desc}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {dict.about.pillar4Title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dict.about.pillar4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* VALIDADE UNIVERSAL & INTEROPERABILIDADE */}
      <div className="rounded-3xl border border-solana-purple/30 bg-purple-950/10 p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <Globe2 className="h-8 w-8 text-solana-green" />
          <h2 className="font-display text-2xl font-bold text-white">
            Validade Universal e Convenção de Haia
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          O LattesChain foi desenhado para superar as barreiras burocráticas internacionais. Ao registrar a atestação com chaves ed25519 e portaria oficial do MEC da instituição emissora, o certificado ganha <strong>equivalência técnica de Apostilamento Digital de Haia</strong>, permitindo que uma pós-graduação na Europa ou um emprego nos Estados Unidos valide o histórico escolar de um aluno brasileiro em segundos, sem necessidade de despachos consulares.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-purple-900/40 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-solana-green shrink-0" />
            Compatível com padrões W3C VC
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-solana-green shrink-0" />
            Conformidade MEC & Portaria 360/2022
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-solana-green shrink-0" />
            Sub-segundo em qualquer país do globo
          </div>
        </div>
      </div>
    </div>
  );
}
