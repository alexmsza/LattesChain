"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  BrainCircuit,
  Lock,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

export interface PipelineStep {
  id: number;
  title: string;
  actor: string;
  badge: string;
  badgeColor: string;
  description: string;
  actionText: string;
  actionHref: string;
  details: string[];
}

const STEP_DURATION_MS = 5000;
const TICK_INTERVAL_MS = 50;

export default function VisualFlowPipeline() {
  const { dict, language } = useLanguage();
  const { theme } = useTheme();
  const p = dict.pipeline;

  const isPurple = theme === "purple";
  const accentColor = isPurple ? "text-solana-purple" : "text-solana-green";
  const accentBorder = isPurple ? "border-solana-purple" : "border-solana-green";
  const accentGrad = isPurple
    ? "from-solana-purple via-fuchsia-500 to-solana-purpleDeep"
    : "from-solana-green via-emerald-400 to-teal-400";
  const accentGlow = isPurple ? "shadow-solana-purple/25" : "shadow-solana-green/20";
  const accentBadgeBg = isPurple
    ? "border-solana-purple/30 bg-solana-purple/10 text-solana-purple"
    : "border-solana-green/30 bg-solana-green/10 text-solana-green";

  const PIPELINE_STEPS: PipelineStep[] = [
    {
      id: 1,
      title: p.step1Title,
      actor: p.step1Actor,
      badge: p.step1Badge,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description: p.step1Desc,
      actionText: p.step1Action,
      actionHref: "/university",
      details: [p.step1D1, p.step1D2, p.step1D3],
    },
    {
      id: 2,
      title: p.step2Title,
      actor: p.step2Actor,
      badge: p.step2Badge,
      badgeColor: "bg-solana-purple/10 text-solana-purple border-solana-purple/30",
      description: p.step2Desc,
      actionText: p.step2Action,
      actionHref: "/sobre",
      details: [p.step2D1, p.step2D2, p.step2D3],
    },
    {
      id: 3,
      title: p.step5Title,
      actor: p.step5Actor,
      badge: p.step5Badge,
      badgeColor: "bg-solana-green/10 text-solana-green border-solana-green/30",
      description: p.step5Desc,
      actionText: p.step5Action,
      actionHref: "/validator",
      details: [p.step5D1, p.step5D2, p.step5D3],
    },
    {
      id: 4,
      title: p.step3Title,
      actor: p.step3Actor,
      badge: p.step3Badge,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: p.step3Desc,
      actionText: p.step3Action,
      actionHref: "/student",
      details: [p.step3D1, p.step3D2, p.step3D3],
    },
    {
      id: 5,
      title: p.step4Title,
      actor: p.step4Actor,
      badge: p.step4Badge,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: p.step4Desc,
      actionText: p.step4Action,
      actionHref: "/validator",
      details: [p.step4D1, p.step4D2, p.step4D3],
    },
  ];

  // Auto-play & state controls
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Live Simulator states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simScenario, setSimScenario] = useState<"VALID" | "TAMPERED">("VALID");
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  // Smooth Auto-Play Transition Loop
  useEffect(() => {
    if (!isAutoPlay || isHovered || isSimulating) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSelectedStep((curr) => (curr % PIPELINE_STEPS.length) + 1);
          return 0;
        }
        return prev + (TICK_INTERVAL_MS / STEP_DURATION_MS) * 100;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, isSimulating, PIPELINE_STEPS.length]);

  const handleSelectStep = (stepId: number) => {
    setSelectedStep(stepId);
    setProgress(0);
  };

  const handlePrevStep = () => {
    setSelectedStep((prev) => (prev === 1 ? PIPELINE_STEPS.length : prev - 1));
    setProgress(0);
  };

  const handleNextStep = () => {
    setSelectedStep((prev) => (prev % PIPELINE_STEPS.length) + 1);
    setProgress(0);
  };

  const runSimulation = (scenario: "VALID" | "TAMPERED") => {
    setSimScenario(scenario);
    setIsSimulating(true);
    setSimProgress(1);

    const docName =
      scenario === "VALID"
        ? "Diploma_Ciencia_Computacao.pdf"
        : "Certificado_Adulterado_Fake.pdf";

    const log1 =
      language === "en"
        ? `[Step 1/4] University submits document "${docName}"...`
        : language === "es"
        ? `[Paso 1/4] IES envía documento "${docName}"...`
        : `[Passo 1/4] IES submete documento "${docName}"...`;

    setSimLog([log1]);

    setTimeout(() => {
      setSimProgress(2);
      const hash =
        scenario === "VALID"
          ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
          : "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      const log2a =
        language === "en"
          ? `[Step 2/4] Computing SHA-256: ${hash}`
          : language === "es"
          ? `[Paso 2/4] Calculando SHA-256: ${hash}`
          : `[Passo 2/4] Calculando SHA-256: ${hash}`;

      const log2b =
        language === "en"
          ? `[Step 2/4] Broadcasting attestation to Solana Attestation Service (Devnet)...`
          : language === "es"
          ? `[Paso 2/4] Transmitiendo atestación a Solana Attestation Service (Devnet)...`
          : `[Passo 2/4] Transmitindo atestação para o Solana Attestation Service (Devnet)...`;

      setSimLog((prev) => [...prev, log2a, log2b]);
    }, 1000);

    setTimeout(() => {
      setSimProgress(3);
      const log3 =
        scenario === "VALID"
          ? language === "en"
            ? `[Step 3/4] Transaction confirmed on Solana! Tx: 5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE...`
            : language === "es"
            ? `[Paso 3/4] ¡Transacción confirmada en Solana! Tx: 5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE...`
            : `[Passo 3/4] Transação confirmada na Solana! Tx: 5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE...`
          : language === "en"
          ? `[Step 3/4] Attestation status: REVOKED / DETECTED FRAUD IN HISTORY.`
          : language === "es"
          ? `[Paso 3/4] Estado de atestación: REVOCADA / FRAUDE DETECTADO EN HISTORIAL.`
          : `[Passo 3/4] Atestação detectada com status: REVOGADA / FRAUDE NO HISTÓRICO.`;

      setSimLog((prev) => [...prev, log3]);
    }, 2200);

    setTimeout(() => {
      setSimProgress(4);
      const log4 =
        scenario === "VALID"
          ? language === "en"
            ? `[Step 4/4] HR Validator: GREEN BADGE! "Authentic and untampered document".`
            : language === "es"
            ? `[Paso 4/4] Validador RRHH: ¡SELLO VERDE! "Documento auténtico e íntegro".`
            : `[Passo 4/4] Validador RH: SELO VERDE emitido! "Documento autêntico e íntegro".`
          : language === "en"
          ? `[Step 4/4] HR Validator: RED BADGE! "Rejected: Tampered or revoked hash".`
          : language === "es"
          ? `[Paso 4/4] Validador RRHH: ¡SELLO ROJO! "Rechazado: Hash adulterado o revocado".`
          : `[Passo 4/4] Validador RH: SELO VERMELHO! "Rejeitado: Hash adulterado ou revogado".`;

      setSimLog((prev) => [...prev, log4]);
      setIsSimulating(false);
    }, 3400);
  };

  const currentStep = PIPELINE_STEPS.find((s) => s.id === selectedStep) || PIPELINE_STEPS[0];
  const fillPercent = ((selectedStep - 1) / (PIPELINE_STEPS.length - 1)) * 100;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header do Pipeline com Controles de Fluxo */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-bold transition-colors ${accentBadgeBg}`}>
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            {p.badge}
          </div>

          {/* Botão de Auto-Play / Pause */}
          <button
            type="button"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition-all shadow-sm"
            title={
              isAutoPlay
                ? language === "en"
                  ? "Pause automatic flow"
                  : language === "es"
                  ? "Pausar flujo automático"
                  : "Pausar fluxo automático"
                : language === "en"
                ? "Resume automatic flow"
                : language === "es"
                ? "Reanudar flujo automático"
                : "Retomar fluxo automático"
            }
          >
            {isAutoPlay ? (
              <>
                <Pause className={`h-3 w-3 ${accentColor}`} />
                <span>
                  {language === "en"
                    ? isHovered ? "Paused (Hover)" : "Auto Flow Active"
                    : language === "es"
                    ? isHovered ? "Pausado (Hover)" : "Flujo Automático"
                    : isHovered ? "Pausado (Hover)" : "Fluxo Automático"}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${accentColor} animate-pulse`} />
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-slate-400" />
                <span>
                  {language === "en" ? "Play Flow" : language === "es" ? "Iniciar Flujo" : "Iniciar Fluxo"}
                </span>
              </>
            )}
          </button>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          {p.title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {p.subtitle}
        </p>
      </div>

      {/* Horizontal Timeline Navigation com Linha Dinâmica */}
      <div className="relative mb-8 px-2">
        {/* Animated Connecting Flow Line Container (Desktop) */}
        <div className="hidden md:block absolute top-[52px] left-12 right-12 h-2 -translate-y-1/2 z-0">
          {/* Base rail */}
          <div className="absolute inset-0 bg-slate-850/90 rounded-full border border-slate-800" />

          {/* Active progress fill */}
          <div
            className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${accentGrad} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${fillPercent}%` }}
          />

          {/* High-speed animated laser flow beam across the full line */}
          <div className="absolute inset-0 flow-line-animated rounded-full opacity-70" />

          {/* Traveling energy particles */}
          <div className="flow-particle-1" />
          <div className="flow-particle-2" />
        </div>

        {/* Pipeline Step Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
          {PIPELINE_STEPS.map((step, index) => {
            const isActive = selectedStep === step.id;
            const isCompleted = step.id < selectedStep;

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleSelectStep(step.id)}
                  className={`w-full flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 border relative overflow-hidden group ${
                    isActive
                      ? `bg-slate-850/95 ${accentBorder} ${accentGlow} shadow-xl scale-[1.04] step-active-pulse`
                      : isCompleted
                      ? `bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-850/60`
                      : `bg-slate-900/50 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700 hover:bg-slate-850/50`
                  }`}
                >
                  {/* Micro Progress Bar on Active Block */}
                  {isActive && isAutoPlay && !isHovered && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
                      <div
                        className={`h-full bg-gradient-to-r ${accentGrad} transition-all duration-75`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Status Indicator Badge */}
                  <div className="absolute top-2 right-2">
                    {isCompleted ? (
                      <div className={`rounded-full p-0.5 ${isPurple ? "bg-solana-purple/20 text-solana-purple" : "bg-solana-green/20 text-solana-green"}`}>
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <span className={`flex h-2 w-2 rounded-full ${isPurple ? "bg-solana-purple" : "bg-solana-green"} animate-ping`} />
                    ) : null}
                  </div>

                  {/* Circle Number / Icon */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-extrabold text-sm mb-2.5 transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${accentGrad} text-navy-900 shadow-lg scale-110`
                        : isCompleted
                        ? `${isPurple ? "bg-solana-purple/20 text-solana-purple border border-solana-purple/40" : "bg-solana-green/20 text-solana-green border border-solana-green/40"}`
                        : "bg-slate-800 text-slate-400 border border-slate-750 group-hover:border-slate-700"
                    }`}
                  >
                    {step.id}
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-slate-100">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{step.actor}</div>
                </button>

                {/* Directional arrow between cards on mobile/tablet */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="md:hidden flex justify-center py-1 text-slate-600">
                    <ChevronRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Showcase Card with Smooth Transitions */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border-slate-750 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl mb-12 relative overflow-hidden transition-all duration-500">
        {/* Background glow according to current step */}
        <div
          className={`pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-25 ${
            isPurple ? "bg-solana-purple" : "bg-solana-green"
          }`}
        />

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/90 px-3 py-1 rounded-md">
              {language === "en"
                ? `STAGE ${currentStep.id} OF 5`
                : language === "es"
                ? `ETAPA ${currentStep.id} DE 5`
                : `ETAPA ${currentStep.id} DE 5`}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${currentStep.badgeColor}`}>
              {currentStep.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={language === "en" ? "Previous Stage" : language === "es" ? "Etapa Anterior" : "Etapa Anterior"}
              aria-label="Etapa anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={language === "en" ? "Next Stage" : language === "es" ? "Próxima Etapa" : "Próxima Etapa"}
              aria-label="Próxima etapa"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Animated Step Details Container */}
        <div
          key={currentStep.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-500 animate-in fade-in slide-in-from-right-3"
        >
          <div className="lg:col-span-7 space-y-5">
            <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-snug">
              {currentStep.title}
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentStep.description}
            </p>

            <div className="space-y-2.5 pt-2">
              {currentStep.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <div className={`rounded-full p-1 mt-0.5 shrink-0 ${isPurple ? "bg-solana-purple/20 text-solana-purple" : "bg-solana-green/20 text-solana-green"}`}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href={currentStep.actionHref}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isPurple
                    ? "bg-solana-purple text-white shadow-solana-purple/25 hover:bg-solana-purpleDeep"
                    : "bg-gradient-to-r from-solana-green to-emerald-400 text-navy-900 shadow-solana-green/20"
                }`}
              >
                {currentStep.actionText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Stage Badge with Pulse Effect */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center shadow-inner relative group">
            {currentStep.id === 1 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step1Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step1Desc}</div>
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-purple/20 text-solana-purple flex items-center justify-center mx-auto shadow-lg shadow-solana-purple/20">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step2Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step2Desc}</div>
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-green/20 text-solana-green flex items-center justify-center mx-auto shadow-lg shadow-solana-green/20">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step5Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step5Desc}</div>
              </div>
            )}

            {currentStep.id === 4 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step3Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step3Desc}</div>
              </div>
            )}

            {currentStep.id === 5 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step4Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step4Desc}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE SIMULATOR BANNER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-solana-green/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-navy-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${accentColor}`}>
              <Sparkles className="h-4 w-4" />
              {p.simulatorTitle}
            </div>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-white">
              {p.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {p.simulatorDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runSimulation("VALID")}
              disabled={isSimulating}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
                isPurple
                  ? "bg-solana-purple/20 border border-solana-purple/40 text-solana-purple hover:bg-solana-purple/30"
                  : "bg-solana-green/20 border border-solana-green/40 text-solana-green hover:bg-solana-green/30"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {language === "en" ? "Simulate Valid Case" : language === "es" ? "Simular Caso Válido" : "Simular Caso Legítimo"}
            </button>
            <button
              onClick={() => runSimulation("TAMPERED")}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              {language === "en" ? "Simulate Fraud Case" : language === "es" ? "Simular Caso con Fraude" : "Simular Caso com Fraude"}
            </button>
          </div>
        </div>

        {/* Simulator Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 1 ? (isPurple ? "bg-solana-purple" : "bg-solana-green") : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 2 ? (isPurple ? "bg-solana-purple" : "bg-solana-green") : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 3
                ? simScenario === "VALID"
                  ? isPurple ? "bg-solana-purple" : "bg-solana-green"
                  : "bg-red-500"
                : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 4
                ? simScenario === "VALID"
                  ? isPurple ? "bg-solana-purple" : "bg-solana-green"
                  : "bg-red-500"
                : "bg-slate-800"
            }`}
          />
        </div>

        {/* Simulator Console Output */}
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-1.5 min-h-[90px]">
          {simLog.length === 0 ? (
            <div className="text-slate-500 flex items-center gap-2">
              <Play className={`h-3.5 w-3.5 ${accentColor}`} />
              {language === "en"
                ? "Click one of the buttons above to test the verification pipeline live..."
                : language === "es"
                ? "Haz clic en uno de los botones para iniciar la simulación en vivo..."
                : "Clique em um dos botões acima para iniciar a simulação ao vivo do fluxo..."}
            </div>
          ) : (
            simLog.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("VERMELHO") || log.includes("REVOGADA") || log.includes("RED") || log.includes("REVOCADA") || log.includes("ROJO")
                    ? "text-red-400 font-bold"
                    : log.includes("VERDE") || log.includes("GREEN")
                    ? `${accentColor} font-bold`
                    : "text-slate-300"
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
