"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  FileSearch,
  UploadCloud,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  GitCompare,
  ArrowRight,
  BookOpen,
  FileText,
  BadgeCheck,
} from "lucide-react";

function ValidatorContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || searchParams.get("hash");
  const [activeTab, setActiveTab] = useState<"VERIFY" | "EQUIVALENCE">("VERIFY");

  // Estados da Validação de Documentos
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [trustReport, setTrustReport] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Estados do Motor de Equivalência Curricular
  const [instA, setInstA] = useState("Universidade Federal de Minas Gerais (UFMG)");
  const [discA, setDiscA] = useState("Estruturas de Dados e Algoritmos Avançados");
  const [hoursA, setHoursA] = useState("72");
  const [ementaA, setEmentaA] = useState(
    "Estruturas de Dados e Algoritmos: complexidade assintótica (notações O, Ômega, Theta), listas, pilhas, filas, árvores binárias balanceadas (AVL, Rubro-Negra), tabelas hash com tratamento de colisões, grafos e algoritmos de busca (BFS, DFS) e ordenação (QuickSort, MergeSort)."
  );
  const [hashA, setHashA] = useState("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");

  const [instB, setInstB] = useState("Universidade de São Paulo (USP)");
  const [discB, setDiscB] = useState("Algoritmos e Estruturas de Dados I");
  const [hoursB, setHoursB] = useState("60");
  const [ementaB, setEmentaB] = useState(
    "Análise de complexidade, estruturas lineares (listas, pilhas, filas), árvores binárias, tabelas de dispersão hash, introdução a grafos e principais algoritmos de busca e ordenação em memória primária."
  );

  const [loadingEquiv, setLoadingEquiv] = useState(false);
  const [equivResult, setEquivResult] = useState<any>(null);

  // Computa SHA-256 do arquivo no browser
  const computeFileHash = async (selectedFile: File): Promise<string> => {
    const buffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleVerify = async (forcedQuery?: string) => {
    setLoading(true);
    setVerificationResult(null);
    setTrustReport(null);

    try {
      let target = (forcedQuery || searchQuery).trim();

      if (file && !forcedQuery) {
        target = await computeFileHash(file);
      }

      if (!target) {
        alert("Faça upload de um arquivo PDF ou digite um hash SHA-256 / transação Solana.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target }),
      });

      const data = await res.json();
      setVerificationResult(data);

      if (data.isValid) {
        generateTrustReport(data);
      }
    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        isValid: false,
        status: "ERRO NA VERIFICAÇÃO",
        error: "Ocorreu um erro ao consultar o protocolo LattesChain.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      handleVerify(queryParam);
    }
  }, [queryParam]);

  const generateTrustReport = async (facts: any) => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/trust-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });
      const data = await res.json();
      setTrustReport(data.report);
    } catch {
      setTrustReport(
        `RELATÓRIO DE CONFIANÇA (Verificação Criptográfica):\n` +
          `O documento apresentado foi emitido pela instituição autorizada (${facts.institution_name}). ` +
          `A atestação on-chain está ativa no Solana Attestation Service e não sofreu revogação.`
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCheckEquivalence = async () => {
    setLoadingEquiv(true);
    setEquivResult(null);

    try {
      const payload = {
        disciplina_a: {
          instituicao: instA,
          disciplina: discA,
          carga_horaria: parseInt(hoursA || "60", 10),
          ementa: ementaA,
          ementa_hash: hashA,
        },
        disciplina_b: {
          instituicao: instB,
          disciplina: discB,
          carga_horaria: parseInt(hoursB || "60", 10),
          ementa: ementaB,
        },
      };

      const res = await fetch("/api/ai/equivalence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao avaliar equivalência.");
      }
      setEquivResult(data);
    } catch (err: any) {
      console.error(err);
      alert(`Erro no motor de equivalência: ${err.message}`);
    } finally {
      setLoadingEquiv(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-3.5 py-1 text-xs font-semibold text-solana-green mb-4">
          <ShieldCheck className="h-4 w-4" />
          Validador Público RH & Auditoria Curricular
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Verificação Instantânea & Camada de IA
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Valide credenciais acadêmicas imutáveis direto da rede Solana ou utilize a IA para avaliar equivalência curricular entre universidades.
        </p>

        {/* TABS SELECTOR */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab("VERIFY")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
              activeTab === "VERIFY"
                ? "bg-solana-green text-navy-900 border-solana-green shadow-md shadow-solana-green/20"
                : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            1. Validador de Documentos (RH)
          </button>
          <button
            onClick={() => setActiveTab("EQUIVALENCE")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
              activeTab === "EQUIVALENCE"
                ? "bg-gradient-to-r from-solana-purple to-purple-500 text-white border-purple-400/40 shadow-md shadow-purple-500/20"
                : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
            }`}
          >
            <GitCompare className="h-4 w-4" />
            2. Equivalência Curricular (IA)
          </button>
        </div>
      </div>

      {/* ABA 1: VALIDADOR DE AUTENTICIDADE */}
      {activeTab === "VERIFY" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* VERIFICATION BOX */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 glow-green">
            <div
              className="border-2 border-dashed border-slate-700 hover:border-solana-green/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-900/40 mb-6"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="h-10 w-10 text-solana-green mx-auto mb-3 animate-bounce" />
              <h3 className="font-semibold text-white text-base mb-1">
                {file ? file.name : "Clique para selecionar ou arraste o certificado PDF"}
              </h3>
              <p className="text-xs text-slate-400">
                O arquivo nunca sai do seu navegador. Apenas o hash criptográfico SHA-256 é consultado on-chain.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Testar com 1 clique:</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSearchQuery("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                  handleVerify("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                }}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                🎓 Diploma Soulbound (UFMG)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSearchQuery("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
                  handleVerify("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
                }}
                className="rounded-lg border border-solana-green/30 bg-solana-green/10 px-2.5 py-1 text-solana-green hover:bg-solana-green/20 transition-colors"
              >
                📜 Disciplina Atestada (SAS)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSearchQuery("9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72");
                  handleVerify("9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72");
                }}
                className="rounded-lg border border-solana-purple/30 bg-solana-purple/10 px-2.5 py-1 text-solana-purple hover:bg-solana-purple/20 transition-colors"
              >
                ⏱️ Horas Extensão (Superteam)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSearchQuery("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
                  handleVerify("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
                }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                ⚠️ Simular Fraude / Revogado
              </button>
            </div>

            {/* Search input alternative */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FileSearch className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cole o Hash SHA-256 ou Signature de transação da Solana..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-solana-green focus:outline-none focus:ring-1 focus:ring-solana-green"
                />
              </div>
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-6 py-3 text-sm font-bold text-navy-900 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? "Auditando na Chain..." : "Verificar Autenticidade"}
              </button>
            </div>
          </div>

          {/* VERIFICATION RESULT CARD */}
          {verificationResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div
                className={`glass-panel rounded-3xl p-6 sm:p-8 border ${
                  verificationResult.isValid
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : "border-red-500/40 bg-red-950/10"
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  {verificationResult.isValid ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-400 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-xl font-bold text-white">
                        {verificationResult.status}
                      </h2>
                      <span className="rounded-full bg-solana-green/10 border border-solana-green/30 px-3 py-1 text-xs font-semibold text-solana-green">
                        Solana Attestation Service (SAS)
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      {verificationResult.isValid
                        ? "Este documento possui atestação imutável com assinatura criptográfica da IES emissora."
                        : verificationResult.error}
                    </p>
                  </div>
                </div>

                {verificationResult.isValid && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block">Instituição Emissora</span>
                      <span className="font-semibold text-slate-200">{verificationResult.institution_name}</span>
                      <div className="text-xs text-slate-400">CNPJ: {verificationResult.institution_cnpj}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block">Título / Curso</span>
                      <span className="font-semibold text-slate-200">
                        {verificationResult.metadata?.course_name || verificationResult.document_type}
                      </span>
                      {verificationResult.metadata?.workload_hours && (
                        <div className="text-xs text-slate-400">
                          Carga Horária: {verificationResult.metadata.workload_hours}h
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block">Hash SHA-256</span>
                      <span className="font-mono text-xs text-slate-300 truncate block">
                        {verificationResult.document_hash}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block">Transação Solana</span>
                      <a
                        href={`https://explorer.solana.com/tx/${verificationResult.solana_tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-solana-green hover:underline"
                      >
                        {verificationResult.solana_tx_signature.substring(0, 22)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* AI TRUST REPORT */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border-solana-purple/30 bg-purple-950/10">
                <div className="flex items-center gap-2.5 mb-4 text-solana-purple">
                  <BrainCircuit className="h-6 w-6 text-solana-green" />
                  <h3 className="font-display text-lg font-bold text-white">
                    Parecer de Confiança para RH (Inteligência Artificial)
                  </h3>
                </div>
                {loadingAI ? (
                  <div className="flex items-center gap-3 text-sm text-slate-400 py-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-solana-green" />
                    Processando evidências criptográficas e sintetizando relatório...
                  </div>
                ) : (
                  <div className="rounded-xl bg-navy-900/60 p-4 border border-slate-800 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {trustReport || "Relatório de confiança pronto para visualização."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: MOTOR DE EQUIVALÊNCIA CURRICULAR */}
      {activeTab === "EQUIVALENCE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-purple-500/30 glow-green">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <GitCompare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Transferência & Aproveitamento de Créditos por IA
                  </h2>
                  <p className="text-xs text-slate-400">
                    Compara duas ementas universitárias com prova de hash gravado on-chain no Solana Attestation Service.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Disciplina A (Origem / On-Chain) */}
              <div className="rounded-2xl bg-navy-900/70 p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-solana-green flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4" />
                    Instituição A (Emitida On-Chain)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Hash Ancorado</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Universidade</label>
                  <input
                    type="text"
                    value={instA}
                    onChange={(e) => setInstA(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Disciplina</label>
                    <input
                      type="text"
                      value={discA}
                      onChange={(e) => setDiscA(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Carga (h)</label>
                    <input
                      type="number"
                      value={hoursA}
                      onChange={(e) => setHoursA(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ementa Oficial (Off-Chain)</label>
                  <textarea
                    rows={4}
                    value={ementaA}
                    onChange={(e) => setEmentaA(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 leading-relaxed"
                  />
                </div>
              </div>

              {/* Disciplina B (Destino) */}
              <div className="rounded-2xl bg-navy-900/70 p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-solana-purple flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    Instituição B (Receptora / Destino)
                  </span>
                  <span className="text-[10px] text-slate-500">Grade Alvo</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Universidade</label>
                  <input
                    type="text"
                    value={instB}
                    onChange={(e) => setInstB(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Disciplina</label>
                    <input
                      type="text"
                      value={discB}
                      onChange={(e) => setDiscB(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Carga (h)</label>
                    <input
                      type="number"
                      value={hoursB}
                      onChange={(e) => setHoursB(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ementa da Instituição Alvo</label>
                  <textarea
                    rows={4}
                    value={ementaB}
                    onChange={(e) => setEmentaB(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckEquivalence}
              disabled={loadingEquiv}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-purple via-indigo-500 to-solana-green py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loadingEquiv ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loadingEquiv ? "Avaliando Compatibilidade Semântica..." : "Calcular Equivalência com Inteligência Artificial"}
            </button>
          </div>

          {/* RESULTADO DA EQUIVALÊNCIA */}
          {equivResult && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border-solana-green/40 bg-navy-900/80 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {equivResult.veredito?.equivalente ? (
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <XCircle className="h-7 w-7" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 block">Veredito do Motor de IA</span>
                    <h3 className="font-display text-xl font-bold text-white">
                      {equivResult.veredito?.equivalente
                        ? "EQUIVALÊNCIA DEFERIDA ✅"
                        : "EQUIVALÊNCIA INDEFERIDA ❌"}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Grau de Similaridade</span>
                    <span className="font-display text-2xl font-extrabold text-solana-green">
                      {equivResult.veredito?.confianca_pct}%
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-3">
                    <span className="text-xs text-slate-400 block">Créditos Aproveitáveis</span>
                    <span className="font-display text-2xl font-extrabold text-white">
                      {equivResult.veredito?.carga_horaria_aproveitavel} h
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs sm:text-sm">
                <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Parecer Técnico Automatizado:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {equivResult.veredito?.justificativa}
                  </p>
                </div>

                {equivResult.veredito?.topicos_coincidentes && (
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block mb-2">
                      Núcleos de Conhecimento Coincidentes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {equivResult.veredito.topicos_coincidentes.map((topico: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-lg bg-solana-green/10 border border-solana-green/30 px-2.5 py-1 text-xs text-solana-green font-medium"
                        >
                          ✓ {topico}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                  <span>
                    Integridade Criptográfica:{" "}
                    <strong className="text-solana-green">100% Autenticada On-Chain</strong>
                  </span>
                  <span className="font-mono text-[11px]">
                    SHA-256: {equivResult.ementa_hash_calculado?.substring(0, 20)}...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ValidatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Carregando validador RH...
        </div>
      }
    >
      <ValidatorContent />
    </Suspense>
  );
}
