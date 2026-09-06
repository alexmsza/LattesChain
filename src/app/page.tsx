import Link from "next/link";
import VisualFlowPipeline from "@/components/VisualFlowPipeline";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Lock,
  Zap,
  Building2,
  FileCheck2,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-solana-purple/20 via-solana-green/15 to-transparent blur-[120px] rounded-full" />

      {/* HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 bg-grid-pattern">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-4 py-1.5 text-xs font-semibold text-solana-green mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Hackathon Universitário Superteam Brasil 2026
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            O seu histórico acadêmico não pertence à faculdade.{" "}
            <span className="bg-gradient-to-r from-solana-green via-emerald-300 to-solana-purple bg-clip-text text-transparent">
              Ele pertence a você.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-xl text-slate-300 leading-relaxed mb-10">
            O <strong>LattesChain</strong> é o passaporte acadêmico descentralizado sobre a Solana.
            Transformamos diplomas, horas complementares e disciplinas em atestações imutáveis, soberanas e verificáveis em 1 segundo por qualquer empresa no mundo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/validator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-lg shadow-solana-green/25 transition-all hover:scale-[1.03] hover:shadow-solana-green/40 active:scale-[0.98]"
            >
              <ShieldCheck className="h-5 w-5" />
              Validar Documento Agora
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:border-slate-600 active:scale-[0.98]"
            >
              <GraduationCap className="h-5 w-5 text-solana-green" />
              Acessar Meu Passaporte
            </Link>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-solana-green">&lt; 1 seg</div>
              <div className="text-xs text-slate-400 mt-1">Tempo de Verificação</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-solana-purple">&lt; R$ 0,01</div>
              <div className="text-xs text-slate-400 mt-1">Custo por Atestação</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400">100% Soulbound</div>
              <div className="text-xs text-slate-400 mt-1">Token-2022 Intransferível</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">LGPD Safe</div>
              <div className="text-xs text-slate-400 mt-1">Zero PII On-Chain</div>
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
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-850 bg-[#060910]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
              A Burocracia Tradicional vs. O Passaporte Soberano
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Entenda como a infraestrutura nativa da Solana elimina os gargalos históricos da educação superior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="glass-panel rounded-2xl p-8 border-red-500/20 bg-red-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-red-500/20 p-3 text-red-400">
                  <Ban className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Como Funciona Hoje</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Semanas de espera:</strong> Solicitações de histórico e validação de horas demoram até 30 dias em secretarias acadêmicas.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fraudes frequentes:</strong> PDFs simples são adulterados com facilidade, forçando RHs a ligarem para secretarias.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dado preso à instituição:</strong> Se a faculdade fechar ou negar atendimento, o histórico do estudante fica inacessível.
                  </span>
                </li>
              </ul>
            </div>

            {/* LattesChain Way */}
            <div className="glass-panel rounded-2xl p-8 border-solana-green/30 bg-solana-green/5 glow-green">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-solana-green/20 p-3 text-solana-green">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Com o LattesChain</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Verificação instantânea:</strong> Qualquer empresa ou faculdade lê a autenticidade direto da blockchain em segundos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Soulbound & Revogável:</strong> Token-2022 garante que o certificado não pode ser vendido e pode ser revogado pela IES em caso de fraude.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>IA de Equivalência:</strong> A IA analisa ementas de diferentes faculdades e calcula a compatibilidade de matérias automaticamente.
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
              Arquitetura em Três Pilares Nativos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Construído sobre protocolos consolidados e abertos da Solana, sem contratos proprietários opacos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-solana-green/10 border border-solana-green/20 flex items-center justify-center text-solana-green mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">1. Solana Attestation Service</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Padrão aberto de atestações da Solana (`22zoJM...`). A universidade cria Schemas de disciplinas e emite credenciais criptograficamente assinadas para o aluno.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-solana-purple/10 border border-solana-purple/20 flex items-center justify-center text-solana-purple mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">2. Token-2022 Soulbound</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Extensões nativas `NonTransferable` e `PermanentDelegate`. O diploma é intransferível e a instituição retém o poder de revogação on-chain sem intermediários.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">3. Camada de Inteligência Artificial</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A IA analisa ementas de disciplinas e gera relatórios de confiança (Trust Reports) para recrutadores, traduzindo dados on-chain em linguagem clara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-850 bg-gradient-to-b from-[#080c14] to-[#04070d]">
        <div className="mx-auto max-w-4xl text-center glass-panel rounded-3xl p-10 sm:p-14 border-solana-green/20 glow-green">
          <GraduationCap className="h-12 w-12 text-solana-green mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
            Experimente a Validação em Tempo Real
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Faça upload de um certificado ou consulte registros emitidos na devnet da Solana e comprove a verificação em menos de 1 segundo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/validator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-md shadow-solana-green/20 transition-transform hover:scale-[1.02]"
            >
              <FileCheck2 className="h-5 w-5" />
              Abrir Validador RH
            </Link>
            <Link
              href="/university"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Building2 className="h-5 w-5 text-solana-green" />
              Portal do Emissor (IES)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
