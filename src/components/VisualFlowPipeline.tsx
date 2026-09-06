"use client";

import { useState } from "react";
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
  AlertTriangle,
  Zap,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

export default function VisualFlowPipeline() {
  const { dict, language } = useLanguage();
  const p = dict.pipeline;

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

  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simScenario, setSimScenario] = useState<"VALID" | "TAMPERED">("VALID");
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);

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

  return (
    <div className="w-full">
      {/* Header do Pipeline */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-4 py-1 text-xs font-bold text-solana-green mb-4">
          <Zap className="h-3.5 w-3.5" />
          {p.badge}
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          {p.title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {p.subtitle}
        </p>
      </div>

      {/* Horizontal Timeline Navigation */}
      <div className="relative mb-12">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
          {PIPELINE_STEPS.map((step) => {
            const isActive = selectedStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 border ${
                  isActive
                    ? "bg-slate-850/90 border-solana-green shadow-lg shadow-solana-green/15 scale-[1.03]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-sm mb-3 transition-colors ${
                    isActive
                      ? "bg-gradient-to-br from-solana-green to-emerald-400 text-navy-900 shadow-md"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {step.id}
                </div>
                <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{step.actor}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Showcase Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border-slate-750 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-md">
                {language === "en" ? `STAGE ${currentStep.id} OF 5` : language === "es" ? `ETAPA ${currentStep.id} DE 5` : `ETAPA ${currentStep.id} DE 5`}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${currentStep.badgeColor}`}>
                {currentStep.badge}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              {currentStep.title}
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentStep.description}
            </p>

            <div className="space-y-2.5 pt-2">
              {currentStep.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <div className="rounded-full bg-solana-green/20 p-1 text-solana-green mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href={currentStep.actionHref}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-5 py-3 text-sm font-bold text-navy-900 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentStep.actionText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Stage Badge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
            {currentStep.id === 1 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step1Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step1Desc}</div>
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-purple/20 text-solana-purple flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step2Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step2Desc}</div>
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-green/20 text-solana-green flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step5Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step5Desc}</div>
              </div>
            )}

            {currentStep.id === 4 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">{p.step3Title}</div>
                <div className="text-xs text-slate-400 max-w-xs">{p.step3Desc}</div>
              </div>
            )}

            {currentStep.id === 5 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
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
            <div className="flex items-center gap-2 text-xs font-bold text-solana-green uppercase tracking-wider mb-1">
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
              className="inline-flex items-center gap-2 rounded-xl bg-solana-green/20 border border-solana-green/40 px-4 py-2 text-xs font-bold text-solana-green hover:bg-solana-green/30 transition-all disabled:opacity-50"
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
              simProgress >= 1 ? "bg-solana-green" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 2 ? "bg-solana-green" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 3
                ? simScenario === "VALID"
                  ? "bg-solana-green"
                  : "bg-red-500"
                : "bg-slate-800"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              simProgress >= 4
                ? simScenario === "VALID"
                  ? "bg-solana-green"
                  : "bg-red-500"
                : "bg-slate-800"
            }`}
          />
        </div>

        {/* Simulator Console Output */}
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-1.5 min-h-[90px]">
          {simLog.length === 0 ? (
            <div className="text-slate-500 flex items-center gap-2">
              <Play className="h-3.5 w-3.5 text-solana-green" />
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
                    ? "text-solana-green font-bold"
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
