"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Building2,
  Briefcase,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  Laptop,
} from "lucide-react";

export default function GuiaCarteiraPage() {
  const [activeProfile, setActiveProfile] = useState<"STUDENT" | "INSTITUTION" | "EMPLOYER">("STUDENT");
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [walletPubkey, setWalletPubkey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const solana = (window as any).solana;
      if (solana && solana.isPhantom) {
        setHasProvider(true);
        if (solana.isConnected && solana.publicKey) {
          setWalletPubkey(solana.publicKey.toString());
        }
      } else {
        setHasProvider(false);
      }
    }
  }, []);

  const handleTestConnect = async () => {
    if (typeof window === "undefined") return;
    const solana = (window as any).solana;
    if (!solana) {
      alert("Nenhuma carteira Phantom/Solana foi detectada na sua extensão. Instale pelo link abaixo.");
      return;
    }

    setConnecting(true);
    try {
      const resp = await solana.connect();
      setWalletPubkey(resp.publicKey.toString());
    } catch (err: any) {
      console.warn("Conexão cancelada pelo usuário:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleCopyPubkey = () => {
    if (!walletPubkey) return;
    navigator.clipboard.writeText(walletPubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/40 bg-solana-green/10 px-4 py-1.5 text-xs font-semibold text-solana-green">
          <Sparkles className="h-4 w-4" />
          Passo a Passo Web3 • Solana Devnet
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Como Conectar sua Carteira Solana no LattesChain
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Guia descomplicado para estudantes, faculdades e empresas criarem sua identidade digital descentralizada em menos de 2 minutos, sem custos e com segurança máxima.
        </p>
      </div>

      {/* DETECTOR INTERATIVO DE CARTEIRA */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-solana-purple/30 bg-purple-950/15 glow-purple">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-bold text-solana-purple">
              <Wallet className="h-5 w-5 text-solana-green" />
              Detector Automático de Carteira Solana
            </div>
            <p className="text-xs text-slate-300">
              {hasProvider
                ? "Extensão Phantom/Solana detectada no seu navegador. Você pode testar a conexão agora."
                : "Nenhuma carteira detectada ainda no navegador. Siga o tutorial abaixo para instalar."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {walletPubkey ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-solana-green/40 px-3.5 py-2">
                <span className="h-2 w-2 rounded-full bg-solana-green animate-pulse" />
                <span className="font-mono text-xs text-slate-200">
                  {walletPubkey.substring(0, 6)}...{walletPubkey.substring(walletPubkey.length - 4)}
                </span>
                <button
                  onClick={handleCopyPubkey}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copiar chave pública"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-solana-green" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={handleTestConnect}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-xl bg-solana-green px-5 py-2.5 text-xs font-bold text-navy-950 shadow-md shadow-solana-green/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                {connecting ? "Detectando..." : "Conectar Carteira Agora"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SELETOR DE PERFIL */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-900/90 border border-slate-800 p-1.5 gap-1">
          <button
            onClick={() => setActiveProfile("STUDENT")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeProfile === "STUDENT"
                ? "bg-solana-green text-navy-950 font-bold shadow-md shadow-solana-green/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Para Estudantes
          </button>
          <button
            onClick={() => setActiveProfile("INSTITUTION")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeProfile === "INSTITUTION"
                ? "bg-solana-green text-navy-950 font-bold shadow-md shadow-solana-green/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Para Faculdades (IES)
          </button>
          <button
            onClick={() => setActiveProfile("EMPLOYER")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeProfile === "EMPLOYER"
                ? "bg-solana-green text-navy-950 font-bold shadow-md shadow-solana-green/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Para RHs & Empresas
          </button>
        </div>
      </div>

      {/* GUIA DO ESTUDANTE */}
      {activeProfile === "STUDENT" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3 relative">
              <div className="h-8 w-8 rounded-lg bg-solana-green/15 text-solana-green font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-display text-base font-bold text-white">Instale sua Carteira</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recomendamos a <strong>Phantom</strong> ou a <strong>Solflare</strong>. Estão disponíveis gratuitamente para Chrome, Firefox, Edge, iOS e Android.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs">
                <a
                  href="https://phantom.app/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-solana-green hover:underline flex items-center gap-1 font-semibold"
                >
                  Baixar Phantom Wallet <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://solflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-solana-purple hover:underline flex items-center gap-1 font-semibold"
                >
                  Baixar Solflare Wallet <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3 relative">
              <div className="h-8 w-8 rounded-lg bg-solana-purple/20 text-purple-300 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-display text-base font-bold text-white">Crie sua Chave Soberana</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Abra a extensão e clique em &quot;Criar Nova Carteira&quot;. Anote suas 12 palavras secretas (Seed Phrase) em papel seguro.
              </p>
              <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span><strong>Regra de Ouro:</strong> Nunca compartilhe suas 12 palavras com ninguém, nem com a faculdade.</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3 relative">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-display text-base font-bold text-white">Ative a Rede Devnet</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Na sua Phantom: clique em Configurações (ícone de engrenagem) ➔ <strong>Configurações do Desenvolvedor</strong> ➔ marque <strong>&quot;Modo de Teste&quot;</strong> ou escolha a rede <strong>&quot;Devnet&quot;</strong>.
              </p>
              <p className="text-[11px] text-slate-400">
                Na Devnet todas as transações são simuladas a custo zero para testes universitários.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-solana-green/20 space-y-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-solana-green" />
              Como Receber seu Diploma e Atestações no LattesChain
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              1. Copie o endereço público da sua carteira (começa com letras e números, ex: <code>4zMMC9srt5...</code>).<br />
              2. No seu <Link href="/student" className="text-solana-green hover:underline font-semibold">Passaporte do Aluno</Link>, apresente este endereço ou faça login com seu CPF.<br />
              3. Quando a sua faculdade aprovar uma matéria ou carga horária, a atestação imutável SAS (Token-2022) será ancorada diretamente no seu endereço!
            </p>
          </div>
        </div>
      )}

      {/* GUIA DA IES */}
      {activeProfile === "INSTITUTION" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-solana-green/15 text-solana-green font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-display text-base font-bold text-white">Carteira Institucional</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A secretaria acadêmica cria uma carteira dedicada que representará a autoridade de assinatura da instituição perante o protocolo.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-solana-purple/20 text-purple-300 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-display text-base font-bold text-white">Homologação no Master Registry</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O CNPJ e a Portaria MEC da IES são associados à chave pública no contrato SAS através da governança administrativa do protocolo.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-display text-base font-bold text-white">Emissão On-Chain Automática</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No <Link href="/university" className="text-solana-green hover:underline font-semibold">Portal do Emissor</Link>, a secretaria emite atestações individuais ou em lote em menos de 1 segundo por registro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GUIA DO RH */}
      {activeProfile === "EMPLOYER" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-panel rounded-3xl p-8 border-slate-800 space-y-6">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-solana-green" />
              Verificação Sem Fricção: Zero Dependência de Cripto
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O validador público do LattesChain (<Link href="/validator" className="text-solana-green hover:underline font-semibold">/validator</Link>) foi projetado para equipes de RH e recrutamento sem nenhuma necessidade de instalar carteiras ou comprar criptomoedas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl bg-navy-900/80 p-4 border border-slate-800">
                <span className="font-bold text-white text-xs block mb-1">1. Validação por Arquivo ou Hash</span>
                <p className="text-xs text-slate-400">
                  Arraste o PDF recebido do candidato ou digite o código de 64 dígitos para receber o parecer em 1 segundo.
                </p>
              </div>
              <div className="rounded-2xl bg-navy-900/80 p-4 border border-slate-800">
                <span className="font-bold text-white text-xs block mb-1">2. Pedido Formal de Comprovação</span>
                <p className="text-xs text-slate-400">
                  Utilize a aba &quot;Solicitar Comprovação&quot; informando o CPF do candidato para gerar um protocolo de estágio ou admissão CLT.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ SECTION */}
      <div className="glass-panel rounded-3xl p-8 border-slate-800 space-y-6">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-solana-green" />
          Perguntas Frequentes sobre Carteiras e Segurança
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-200">Preciso pagar alguma taxa para criar a carteira?</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Não. O download da Phantom ou Solflare e a criação da chave são 100% gratuitos. Além disso, as atestações emitidas pela universidade cobrem as taxas de rede da Solana (&lt; R$ 0,01).
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-200">O que acontece se eu perder meu celular ou computador?</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Desde que você guarde suas 12 palavras secretas (Seed Phrase) anotadas em local seguro, você pode restaurar sua carteira e todos os seus diplomas em qualquer outro aparelho a qualquer momento.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-200">O que é a Solana Devnet?</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              É a rede oficial de testes e homologação da Solana. Funciona de maneira idêntica à rede principal, porém utiliza SOL de teste sem valor monetário, ideal para validações do Hackathon e demonstrações acadêmicas.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-200">Meus dados pessoais ficam expostos na blockchain?</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Não. O LattesChain adota a arquitetura <strong>Zero PII On-Chain</strong>. Nenhum CPF, nome ou dado sensível é gravado na blockchain pública; apenas o hash criptográfico SHA-256 e o carimbo de autoridade da universidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
