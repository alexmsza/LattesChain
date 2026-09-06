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
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-solana-purple/25 via-solana-purple/10 to-transparent blur-[120px] rounded-full" />

      {/* HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 bg-grid-pattern">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/30 bg-solana-purple/10 px-4 py-1.5 text-xs font-semibold text-solana-purple mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Hackathon Universitário Superteam Brasil 2026
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            A ponte de confiança universal entre{" "}
            <span className="bg-gradient-to-r from-solana-purple via-violet-400 to-solana-purpleSoft bg-clip-text text-transparent">
              Faculdades, Estudantes e Empresas.
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-xl text-slate-300 leading-relaxed mb-10">
            O <strong>LattesChain</strong> potencializa a credibilidade acadêmica sobre a rede Solana.
            A <strong>faculdade</strong> confere autenticidade global e proteção de marca aos seus documentos, o <strong>estudante</strong> apresenta seus títulos e horas em qualquer instituição ou processo seletivo com máxima facilidade, e as <strong>empresas</strong> recebem talentos com confiabilidade garantida em 1 segundo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/validator"
              className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-solana-purple/25 transition-all hover:bg-solana-purpleDeep hover:scale-[1.03] active:scale-[0.98]"
            >
              <ShieldCheck className="h-5 w-5" />
              Validar Documento Agora
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:border-slate-600 active:scale-[0.98]"
            >
              <GraduationCap className="h-5 w-5 text-solana-purple" />
              Acessar Meu Passaporte
            </Link>
            <Link
              href="/university"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:border-slate-600 active:scale-[0.98]"
            >
              <Building2 className="h-5 w-5 text-solana-purple" />
              Portal da Faculdade (IES)
            </Link>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-solana-purple">&lt; 1 seg</div>
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

          {/* Tripartite Pillars Bar */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-left">
            <div className="glass-panel rounded-2xl p-5 border-solana-green/20 bg-slate-900/60">
              <div className="flex items-center gap-2 text-solana-green font-bold text-sm mb-2">
                <Building2 className="h-4 w-4" />
                Para Faculdades & Universidades
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Credibilidade universal instantânea para seus títulos. Zero risco de fraudes de diplomas com o nome da IES e redução drástica de sobrecarga nas secretarias acadêmicas.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border-solana-purple/20 bg-slate-900/60">
              <div className="flex items-center gap-2 text-solana-purple font-bold text-sm mb-2">
                <GraduationCap className="h-4 w-4" />
                Para Estudantes & Alunos
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Máxima facilidade para entregar documentos em outras faculdades, intercâmbios ou processos seletivos. Passaporte acadêmico soberano, unificado e sem burocracia.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border-amber-400/20 bg-slate-900/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <FileCheck2 className="h-4 w-4" />
                Para RHs & Empresas
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receba profissionais com documentos acadêmicos e comprovações de estágio com confiabilidade garantida em 1 segundo, sem depender de telefonemas ou e-mails a secretarias.
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
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-850 bg-[#0a0714]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
              Do Gargalo Tradicional à Aliança de Confiança Digital
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Como a infraestrutura aberta da Solana une Faculdades, Estudantes e RHs eliminando atritos históricos de verificação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="glass-panel rounded-2xl p-8 border-red-500/20 bg-red-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-red-500/20 p-3 text-red-400">
                  <Ban className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">O Modelo Tradicional Sem LattesChain</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Secretarias sobrecarregadas:</strong> Semanas de espera para expedição e validação de históricos e certificados de horas complementares.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Vulnerabilidade a fraudes:</strong> PDFs simples adulterados colocam a reputação da universidade em risco e induzem empresas a erros graves.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Falta de portabilidade:</strong> Estudantes enfrentam atrito extremo ao transferir matérias para outra faculdade ou comprovar formação no exterior.
                  </span>
                </li>
              </ul>
            </div>

            {/* LattesChain Way */}
            <div className="glass-panel rounded-2xl p-8 border-solana-purple/30 bg-solana-purple/5 glow-purple">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-solana-purple/20 p-3 text-solana-purple">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Com o LattesChain (Valor Tripartite)</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Credibilidade universal para a IES:</strong> Documentos emitidos pela faculdade têm autenticidade criptográfica imediata e auditável no mundo todo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Facilidade real para o estudante:</strong> Apresentação ágil de diplomas e horas complementares com 1 clique ou QR Code em qualquer instituição.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-solana-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Confiabilidade garantida para empresas:</strong> RHs recebem comprovações de candidatos em 1 segundo e com análise inteligente de equivalência por IA.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-14 items-end">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
              Arquitetura em Três Pilares Nativos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Construído sobre protocolos consolidados e abertos da Solana, sem contratos proprietários opacos.
            </p>
          </div>

          <div>
            {/* Pillar 1 */}
            <div className="numbered-row grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-x-6 gap-y-3 py-8 items-start">
              <span className="font-display text-2xl font-extrabold text-solana-purple">01</span>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-solana-purple shrink-0" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">Solana Attestation Service</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                  Padrão aberto de atestações da Solana (`22zoJM...`). A universidade cria Schemas de disciplinas e emite credenciais criptograficamente assinadas para o aluno.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="numbered-row grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-x-6 gap-y-3 py-8 items-start">
              <span className="font-display text-2xl font-extrabold text-solana-purple">02</span>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="h-5 w-5 text-solana-purple shrink-0" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">Token-2022 Soulbound</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                  Extensões nativas `NonTransferable` e `PermanentDelegate`. O diploma é intransferível e a instituição retém o poder de revogação on-chain sem intermediários.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="numbered-row grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-x-6 gap-y-3 py-8 items-start">
              <span className="font-display text-2xl font-extrabold text-solana-purple">03</span>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BrainCircuit className="h-5 w-5 text-solana-purple shrink-0" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">Camada de Inteligência Artificial</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                  A IA analisa ementas de disciplinas e gera relatórios de confiança (Trust Reports) para recrutadores, traduzindo dados on-chain em linguagem clara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-850 bg-gradient-to-b from-[#0e0a18] to-[#060412]">
        <div className="mx-auto max-w-4xl text-center glass-panel rounded-3xl p-10 sm:p-14 border-solana-purple/20 glow-purple">
          <GraduationCap className="h-12 w-12 text-solana-purple mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
            Experimente a Validação em Tempo Real
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Faça upload de um certificado ou consulte registros emitidos na devnet da Solana e comprove a verificação em menos de 1 segundo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/validator"
              className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-solana-purple/20 transition-all hover:bg-solana-purpleDeep hover:scale-[1.02]"
            >
              <FileCheck2 className="h-5 w-5" />
              Abrir Validador RH
            </Link>
            <Link
              href="/university"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Building2 className="h-5 w-5 text-solana-purple" />
              Portal do Emissor (IES)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
