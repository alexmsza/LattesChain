"use client";

import Link from "next/link";
import VisualFlowPipeline from "@/components/VisualFlowPipeline";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Lock,
  Building2,
  FileCheck2,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function Home() {
  const { dict } = useLanguage();
  const { theme } = useTheme();
  const h = dict.home;

  const isPurple = theme === "purple";
  const accentColor = isPurple ? "text-solana-purple" : "text-solana-green";
  const accentBadge = isPurple
    ? "border-solana-purple/30 bg-solana-purple/10 text-solana-purple"
    : "border-solana-green/30 bg-solana-green/10 text-solana-green";
  const accentBtn = isPurple
    ? "bg-solana-purple text-white shadow-lg shadow-solana-purple/30 hover:bg-solana-purpleDeep hover:shadow-solana-purple/40"
    : "bg-gradient-to-r from-solana-green to-emerald-400 text-navy-900 shadow-lg shadow-solana-green/25 hover:shadow-solana-green/40";

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div
        className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br blur-[120px] rounded-full transition-all duration-500 ${
          isPurple
            ? "from-solana-purple/25 via-solana-purpleDeep/20 to-transparent"
            : "from-solana-purple/20 via-solana-green/15 to-transparent"
        }`}
      />

      {/* HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 bg-grid-pattern">
        <div className="mx-auto max-w-5xl text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold mb-8 shadow-sm transition-colors ${accentBadge}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {h.badge}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            {h.heroTitlePre}{" "}
            <span
              className={`bg-clip-text text-transparent transition-all duration-500 ${
                isPurple
                  ? "bg-gradient-to-r from-solana-purple via-fuchsia-400 to-solana-green"
                  : "bg-gradient-to-r from-solana-green via-emerald-300 to-solana-purple"
              }`}
            >
              {h.heroTitleGradient}
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-xl text-slate-300 leading-relaxed mb-10">
            {h.heroDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/validator"
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] ${accentBtn}`}
            >
              <ShieldCheck className="h-5 w-5" />
              {h.ctaValidate}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:border-slate-600 active:scale-[0.98]"
            >
              <GraduationCap className={`h-5 w-5 transition-colors ${accentColor}`} />
              {h.ctaPassport}
            </Link>
            <Link
              href="/university"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all active:scale-[0.98] ${
                isPurple
                  ? "border-solana-purple/30 bg-solana-purple/10 text-solana-purple hover:bg-solana-purple/20"
                  : "border-solana-green/30 bg-solana-green/10 text-solana-green hover:bg-solana-green/20"
              }`}
            >
              <Building2 className={`h-5 w-5 transition-colors ${accentColor}`} />
              {h.ctaUniversity}
            </Link>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className={`font-display text-2xl sm:text-3xl font-extrabold transition-colors ${accentColor}`}>
                {h.metric1Value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{h.metric1Label}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-solana-purple">
                {h.metric2Value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{h.metric2Label}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400">
                {h.metric3Value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{h.metric3Label}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {h.metric4Value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{h.metric4Label}</div>
            </div>
          </div>

          {/* Tripartite Pillars Bar */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-left">
            <div className={`glass-panel rounded-2xl p-5 bg-slate-900/60 ${isPurple ? "border-solana-purple/20" : "border-solana-green/20"}`}>
              <div className={`flex items-center gap-2 font-bold text-sm mb-2 ${accentColor}`}>
                <Building2 className="h-4 w-4" />
                {h.pillarUniTitle}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {h.pillarUniDesc}
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border-solana-purple/20 bg-slate-900/60">
              <div className="flex items-center gap-2 text-solana-purple font-bold text-sm mb-2">
                <GraduationCap className="h-4 w-4" />
                {h.pillarStudentTitle}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {h.pillarStudentDesc}
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border-amber-400/20 bg-slate-900/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <FileCheck2 className="h-4 w-4" />
                {h.pillarEmployerTitle}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {h.pillarEmployerDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL PIPELINE & TIMELINE SECTION */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/70">
        <div className="mx-auto max-w-6xl">
          <VisualFlowPipeline />
        </div>
      </section>

      {/* THE PROBLEM VS SOLUTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[var(--background)] transition-colors duration-300">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
              {h.problemTitle}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {h.problemSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="glass-panel rounded-2xl p-8 border-red-500/20 bg-red-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-red-500/20 p-3 text-red-400">
                  <Ban className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{h.oldWayTitle}</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{h.oldWay1Title}</strong> {h.oldWay1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{h.oldWay2Title}</strong> {h.oldWay2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{h.oldWay3Title}</strong> {h.oldWay3Desc}
                  </span>
                </li>
              </ul>
            </div>

            {/* LattesChain Way */}
            <div
              className={`glass-panel rounded-2xl p-8 transition-all ${
                isPurple
                  ? "border-solana-purple/30 bg-solana-purple/5 glow-purple"
                  : "border-solana-green/30 bg-solana-green/5 glow-green"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`rounded-xl p-3 transition-colors ${
                    isPurple
                      ? "bg-solana-purple/20 text-solana-purple"
                      : "bg-solana-green/20 text-solana-green"
                  }`}
                >
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{h.newWayTitle}</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${accentColor}`} />
                  <span>
                    <strong>{h.newWay1Title}</strong> {h.newWay1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${accentColor}`} />
                  <span>
                    <strong>{h.newWay2Title}</strong> {h.newWay2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${accentColor}`} />
                  <span>
                    <strong>{h.newWay3Title}</strong> {h.newWay3Desc}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
              {h.pillarsSectionTitle}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {h.pillarsSectionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="glass-panel rounded-2xl p-6">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                  isPurple
                    ? "bg-solana-purple/10 border border-solana-purple/20 text-solana-purple"
                    : "bg-solana-green/10 border border-solana-green/20 text-solana-green"
                }`}
              >
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{h.p1Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {h.p1Desc}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-solana-purple/10 border border-solana-purple/20 flex items-center justify-center text-solana-purple mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{h.p2Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {h.p2Desc}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{h.p3Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {h.p3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-gradient-to-b from-[var(--background)] to-navy-900 transition-colors duration-300">
        <div
          className={`mx-auto max-w-4xl text-center glass-panel rounded-3xl p-10 sm:p-14 transition-all ${
            isPurple
              ? "border-solana-purple/20 glow-purple"
              : "border-solana-green/20 glow-green"
          }`}
        >
          <GraduationCap className={`h-12 w-12 mx-auto mb-4 transition-colors ${accentColor}`} />
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
            {h.ctaTitle}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {h.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/validator"
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02] ${accentBtn}`}
            >
              <FileCheck2 className="h-5 w-5" />
              {h.ctaOpenValidator}
            </Link>
            <Link
              href="/university"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Building2 className={`h-5 w-5 transition-colors ${accentColor}`} />
              {h.ctaOpenUniversity}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
