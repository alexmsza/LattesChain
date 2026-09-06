"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  BrainCircuit,
  FileText,
  Lock,
  RefreshCw,
  Play,
  ExternalLink,
  AlertTriangle,
  Zap,
  Check,
} from "lucide-react";

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

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: "Emissão Institucional",
    actor: "Universidade (IES)",
    badge: "Origem Confiável",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description:
      "A universidade emite a credencial (diploma, horas ou disciplina). O sistema extrai os dados oficiais e calcula o hash criptográfico SHA-256 único do arquivo.",
    actionText: "Acessar Portal da IES",
    actionHref: "/university",
    details: [
      "Assinatura digital e-CNPJ da instituição",
      "Geração de hash SHA-256 imutável do documento",
      "Validação prévia de ementa e carga horária",
    ],
  },
  {
    id: 2,
    title: "Ancoragem na Solana",
    actor: "Protocolo Descentralizado",
    badge: "Custo < R$ 0,01 • < 1s",
    badgeColor: "bg-solana-purple/10 text-solana-purple border-solana-purple/30",
    description:
      "A atestação é registrada na blockchain Solana via SAS (Solana Attestation Service) e SPL Memo, ou emitida como Token-2022 Soulbound intransferível para diplomas.",
    actionText: "Ver Regras do Protocolo",
    actionHref: "/admin-protocol",
    details: [
      "Carimbo temporal criptográfico irrefutável",
      "Token-2022 Soulbound (intransferível, anti-venda)",
      "Zero dados pessoais sensíveis on-chain (LGPD)",
    ],
  },
  {
    id: 3,
    title: "Validação Pública Instantânea",
    actor: "RH / Empresas / Recrutadores",
    badge: "Zero Burocracia",
    badgeColor: "bg-solana-green/10 text-solana-green border-solana-green/30",
    description:
      "Qualquer recrutador ou empresa arrasta o PDF no validador ou cola o código de autenticidade. O selo verde ou vermelho sai em milissegundos sem necessidade de login.",
    actionText: "Testar o Validador",
    actionHref: "/validator",
    details: [
      "Detecção automática de PDF adulterado ou falso",
      "Conferência direta contra os nós da Solana",
      "Relatório de confiança gerado por IA com auditoria",
    ],
  },
  {
    id: 4,
    title: "Passaporte Soberano do Estudante",
    actor: "Estudante",
    badge: "100% Walletless",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description:
      "O estudante acumula certificados de diversas faculdades, cursos de extensão e projetos em um painel único. Ele é o dono soberano do seu histórico para sempre.",
    actionText: "Acessar Meu Passaporte",
    actionHref: "/student",
    details: [
      "Histórico unificado não dependente de secretaria",
      "Soma automática de horas complementares",
      "Compartilhamento público via link seguro e QR Code",
    ],
  },
  {
    id: 5,
    title: "Equivalência Curricular com IA",
    actor: "Comitê Acadêmico / Transferência",
    badge: "Análise Semântica",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description:
      "Na transferência de faculdade, a IA do LattesChain compara as ementas de disciplinas de faculdades distintas e gera um parecer de compatibilidade imediato.",
    actionText: "Simular Equivalência",
    actionHref: "/validator?tab=EQUIVALENCE",
    details: [
      "Comparação semântica profunda de ementas curriculares",
      "Cálculo de sobreposição de tópicos e carga horária",
      "Sugestão fundamentada de dispensa de disciplina",
    ],
  },
];

export default function VisualFlowPipeline() {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simScenario, setSimScenario] = useState<"VALID" | "TAMPERED">("VALID");
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  const runSimulation = (scenario: "VALID" | "TAMPERED") => {
    setSimScenario(scenario);
    setIsSimulating(true);
    setSimProgress(1);
    setSimLog([
      `[Passo 1/4] IES submete documento "${
        scenario === "VALID"
          ? "Diploma_Ciencia_Computacao_UFMG.pdf"
          : "Certificado_Horas_Adulterado_PDF.pdf"
      }"...`,
    ]);

    setTimeout(() => {
      setSimProgress(2);
      setSimLog((prev) => [
        ...prev,
        `[Passo 2/4] Calculando SHA-256: ${
          scenario === "VALID"
            ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            : "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        }`,
        `[Passo 2/4] Transmitindo atestação para o Solana Attestation Service (Devnet)...`,
      ]);
    }, 1000);

    setTimeout(() => {
      setSimProgress(3);
      setSimLog((prev) => [
        ...prev,
        scenario === "VALID"
          ? `[Passo 3/4] Transação confirmada na Solana! Tx: 5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE...`
          : `[Passo 3/4] Atestação detectada com status: REVOGADA / FRAUDE NO HISTÓRICO.`,
      ]);
    }, 2200);

    setTimeout(() => {
      setSimProgress(4);
      setSimLog((prev) => [
        ...prev,
        scenario === "VALID"
          ? `[Passo 4/4] Validador RH: SELO VERDE emitido! "Documento autêntico e íntegro".`
          : `[Passo 4/4] Validador RH: SELO VERMELHO! "Rejeitado: Hash adulterado ou revogado".`,
      ]);
      setIsSimulating(false);
    }, 3400);
  };

  const currentStep = PIPELINE_STEPS.find((s) => s.id === selectedStep) || PIPELINE_STEPS[0];

  return (
    <div className="w-full">
      {/* Header do Pipeline */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/30 bg-solana-purple/10 px-4 py-1 text-xs font-bold text-solana-purple mb-4">
          <Zap className="h-3.5 w-3.5" />
          Pipeline de Confiança Ponta a Ponta
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Como o LattesChain Funciona
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Da assinatura na faculdade até a contratação no RH: entenda a jornada completa de uma credencial acadêmica imutável na Solana.
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
                    ? "bg-slate-850/90 border-solana-purple shadow-lg shadow-solana-purple/15 scale-[1.03]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-sm mb-3 transition-colors ${
                    isActive
                      ? "bg-solana-purple text-white shadow-md"
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
                ETAPA {currentStep.id} DE 5
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
                className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-solana-purpleDeep hover:scale-[1.02] active:scale-[0.98]"
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
                <div className="font-display font-bold text-lg text-white">Emissão IES Oficial</div>
                <div className="text-xs text-slate-400 max-w-xs">
                  A faculdade atesta os dados sem depender de papel ou carimbos manuais.
                </div>
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-purple/20 text-solana-purple flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">Consenso Solana</div>
                <div className="text-xs text-slate-400 max-w-xs">
                  Hash registrado em bloco finalizado em menos de 1 segundo por fração de centavo.
                </div>
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-solana-green/20 text-solana-green flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">Auditoria Instantânea</div>
                <div className="text-xs text-slate-400 max-w-xs">
                  RH confere autenticidade sem ligar para ninguém e sem risco de falsificação.
                </div>
              </div>
            )}

            {currentStep.id === 4 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">Soberania Estudantil</div>
                <div className="text-xs text-slate-400 max-w-xs">
                  O diploma é posse vitalícia do estudante, protegido contra perda física ou falência institucional.
                </div>
              </div>
            )}

            {currentStep.id === 5 && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <div className="font-display font-bold text-lg text-white">Inteligência Acadêmica</div>
                <div className="text-xs text-slate-400 max-w-xs">
                  Transferências universitárias resolvidas por IA em segundos, eliminando meses de espera.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE SIMULATOR BANNER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-solana-purple/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-navy-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-solana-purple uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              Simulador em Tempo Real
            </div>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-white">
              Veja a Timeline Criptográfica em Ação
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Experimente a diferença entre um certificado legítimo e uma tentativa de fraude detectada instantaneamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runSimulation("VALID")}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-solana-green/20 border border-solana-green/40 px-4 py-2 text-xs font-bold text-solana-green hover:bg-solana-green/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simular Caso Legítimo
            </button>
            <button
              onClick={() => runSimulation("TAMPERED")}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              Simular Caso com Fraude
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
              <Play className="h-3.5 w-3.5 text-solana-purple" />
              Clique em um dos botões acima para iniciar a simulação ao vivo do fluxo...
            </div>
          ) : (
            simLog.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("SELO VERMELHO") || log.includes("REVOGADA")
                    ? "text-red-400 font-bold"
                    : log.includes("SELO VERDE")
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
