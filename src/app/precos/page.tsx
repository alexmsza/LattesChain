"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function PrecosPage() {
  const { dict, language } = useLanguage();
  const { theme } = useTheme();
  const p = dict.pricing;
  const isPurple = theme === "purple";

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

  const accentText = isPurple ? "text-solana-purple" : "text-solana-green";
  const accentBorder = isPurple ? "border-solana-purple/40" : "border-solana-green/40";
  const accentBadgeBg = isPurple ? "bg-purple-950/30 text-solana-purple" : "bg-emerald-950/20 text-solana-green";
  const accentCheck = isPurple ? "text-solana-purple" : "text-solana-green";
  const accentButton = isPurple
    ? "bg-solana-purple text-white shadow-md shadow-solana-purple/25 hover:bg-solana-purpleDeep hover:scale-[1.01]"
    : "bg-gradient-to-r from-solana-green to-emerald-400 text-navy-900 shadow-md shadow-solana-green/20 hover:scale-[1.01]";

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className={`inline-flex items-center gap-2 rounded-full border ${accentBorder} ${accentBadgeBg} px-4 py-1.5 text-xs font-semibold transition-colors`}>
          <Sparkles className="h-4 w-4" />
          {p.badge}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {p.title}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          {p.subtitle}
        </p>
      </div>

      {/* PLANOS PARA UNIVERSIDADES (IES) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className={`h-6 w-6 transition-colors ${accentText}`} />
          <h2 className="font-display text-2xl font-bold text-white">
            {p.universitiesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IES START - INICIAÇÃO DIGITAL */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${accentText}`}>
                  {p.startBadge}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border ${accentBorder} bg-solana-green/10 px-2.5 py-0.5 text-[10px] font-bold text-solana-green`}>
                  <Clock className="h-3 w-3" />
                  {p.startTrial}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">{p.startTitle}</h3>
              <div className="text-3xl font-extrabold text-white">
                {p.startPrice} <span className="text-xs font-normal text-slate-400">{p.startPeriod}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.startDesc}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.startF1}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.startF2}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.startF3}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.startF4}</li>
              </ul>
            </div>
            <Link
              href="/university"
              className="w-full text-center rounded-xl border border-slate-700 bg-navy-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              {p.startCta}
            </Link>
          </div>

          {/* IES CAMPUS PRO */}
          <div
            className={`glass-panel rounded-3xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${
              isPurple ? "border-solana-purple/50 glow-purple" : "border-solana-green/40 glow-green"
            }`}
          >
            <div
              className={`absolute -top-3 right-6 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isPurple ? "bg-solana-purple text-white shadow-sm shadow-solana-purple/30" : "bg-solana-green text-navy-900"
              }`}
            >
              {language === "en" ? "Most Popular" : language === "es" ? "Más Popular" : "Mais Popular"}
            </div>
            <div className="space-y-3">
              <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${accentText}`}>
                {p.proBadge}
              </span>
              <h3 className="font-display text-xl font-bold text-white">{p.proTitle}</h3>
              <div className="text-3xl font-extrabold text-white">
                {p.proPrice} <span className="text-xs font-normal text-slate-400">{p.proPeriod}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {p.proDesc}
              </p>
              <ul className="space-y-2 text-xs text-slate-200 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.proF1}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.proF2}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.proF3}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.proF4}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.proF5}</li>
              </ul>
            </div>
            <button
              onClick={() => {
                document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
                setOrgType("IES Pro");
              }}
              className={`w-full text-center rounded-xl py-2.5 text-xs font-bold transition-all ${accentButton}`}
            >
              {p.proCta}
            </button>
          </div>

          {/* IES ENTERPRISE */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {p.entBadge}
              </span>
              <h3 className="font-display text-xl font-bold text-white">{p.entTitle}</h3>
              <div className="text-3xl font-extrabold text-white">{p.entPrice}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.entDesc}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.entF1}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.entF2}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.entF3}</li>
                <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.entF4}</li>
              </ul>
            </div>
            <button
              onClick={() => {
                document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
                setOrgType("IES Enterprise");
              }}
              className="w-full text-center rounded-xl border border-slate-700 bg-navy-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              {p.entCta}
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
              {p.rhTitle}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-extrabold text-white">
              {p.rhPrice} <span className="text-xs font-normal text-slate-400">{p.rhPeriod}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {p.rhDesc}
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200 border-t border-slate-800 pt-4">
            <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.rhF1}</li>
            <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.rhF2}</li>
            <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.rhF3}</li>
            <li className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${accentCheck}`} /> {p.rhF4}</li>
          </ul>
          <Link
            href="/validator"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-solana-purple py-3 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep hover:scale-[1.01] transition-all"
          >
            {p.rhCta}
          </Link>
        </div>

        {/* ESTUDANTE VITALÍCIO */}
        <div className="glass-panel rounded-3xl p-8 border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-solana-green" />
            <h3 className="font-display text-xl font-bold text-white">
              {p.studentsTitle}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-extrabold text-solana-green">
              {p.studentsPrice}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({p.studentsPeriod})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {p.studentsDesc}
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200 border-t border-slate-800 pt-4">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green shrink-0" /> {p.studentsF1}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green shrink-0" /> {p.studentsF2}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green shrink-0" /> {p.studentsF3}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-solana-green shrink-0" /> {p.studentsF4}</li>
          </ul>
          <Link
            href="/student"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-solana-green/40 bg-solana-green/15 py-3 text-xs font-bold text-solana-green hover:bg-solana-green/25 transition-all"
          >
            {p.studentsCta}
          </Link>
        </div>
      </div>

      {/* LEAD CONTACT FORM */}
      <div id="lead-form" className="glass-panel rounded-3xl p-8 sm:p-10 border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${accentText}`}>
            {p.leadFormBadge}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {p.leadFormTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {p.leadFormDesc}
          </p>

          {sentLead ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-semibold text-white text-base">{p.leadSuccessTitle}</h3>
              <p className="text-xs text-slate-300">
                {p.leadSuccessDesc}
              </p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 text-left max-w-md mx-auto pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{p.leadNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Universidade Federal / Nubank"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={`w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    isPurple ? "focus:border-solana-purple" : "focus:border-solana-green"
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{p.leadEmailLabel}</label>
                <input
                  type="email"
                  required
                  placeholder="reitoria@universidade.edu.br"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className={`w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    isPurple ? "focus:border-solana-purple" : "focus:border-solana-green"
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{p.leadPlanLabel}</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className={`w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                    isPurple ? "focus:border-solana-purple" : "focus:border-solana-green"
                  }`}
                >
                  <option value="IES Start">{p.startTitle} (R$ 0 - 1 {language === "en" ? "month trial" : language === "es" ? "mes de prueba" : "mês grátis"})</option>
                  <option value="IES Campus Pro">{p.proTitle}</option>
                  <option value="IES Enterprise">{p.entTitle}</option>
                  <option value="RH Recrutador Pro">{p.rhTitle}</option>
                </select>
              </div>
              <button
                type="submit"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${accentButton}`}
              >
                <Send className="h-4 w-4" />
                {p.ctaTalk}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
