"use client";

import { useState } from "react";
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
  Briefcase,
  Send,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ValidatorPage() {
  const { dict } = useLanguage();
  const [activeTab, setActiveTab] = useState<"VERIFY" | "EQUIVALENCE" | "COMPLIANCE">("VERIFY");

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

  // Estados da Solicitação de Comprovação de RH (Compliance)
  const [candidateId, setCandidateId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [purpose, setPurpose] = useState("ESTAGIO");
  const [sendingCompliance, setSendingCompliance] = useState(false);
  const [complianceSuccess, setComplianceSuccess] = useState<any | null>(null);

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
        alert("Faça upload de um arquivo PDF ou insira o hash SHA-256 / assinatura da transação.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/credentials/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: target }),
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data && (data.isValid !== undefined || data.status)) {
            setVerificationResult(data);
            if (data.isValid) {
              generateTrustReport(data);
            }
            setLoading(false);
            return;
          }
        }

        setVerificationResult({
          isValid: false,
          status: "DOCUMENTO NÃO LOCALIZADO",
          error: "Nenhum registro on-chain correspondente a este hash foi encontrado na Solana Devnet ou Supabase.",
        });
      } catch (networkErr: any) {
        setVerificationResult({
          isValid: false,
          status: "ERRO DE CONEXÃO",
          error: `Falha ao consultar protocolo: ${networkErr.message}`,
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateTrustReport = async (facts: any) => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/trust-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.report) {
          setTrustReport(data.report);
          setLoadingAI(false);
          return;
        }
      }
    } catch (err) {
      console.error("Erro ao gerar parecer de IA:", err);
    }

    setTrustReport("Parecer gerado com base nas atestações on-chain validadas.");
    setLoadingAI(false);
  };

  const handleCheckEquivalence = async () => {
    setLoadingEquiv(true);
    setEquivResult(null);

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

    try {
      const res = await fetch("/api/ai/equivalence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data && data.veredito) {
          setEquivResult(data);
          setLoadingEquiv(false);
          return;
        }
      }

      alert("Não foi possível processar a equivalência curricular via IA no momento. Verifique os dados fornecidos.");
    } catch (err: any) {
      alert(`Falha de conexão com motor de equivalência IA: ${err.message}`);
    } finally {
      setLoadingEquiv(false);
    }
  };

  const handleSendCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !companyName || !recruiterEmail) {
      alert("Preencha todos os campos da solicitação.");
      return;
    }

    setSendingCompliance(true);
    setComplianceSuccess(null);

    try {
      const res = await fetch("/api/compliance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employer_name: companyName,
          employer_email: recruiterEmail,
          student_identifier: candidateId,
          purpose,
          requested_items: ["matricula_ativa", "historico", "horas_complementares"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComplianceSuccess(data.request);
        setCandidateId("");
      } else {
        const errData = await res.json();
        alert(`Erro ao solicitar comprovação: ${errData.error || "Tente novamente."}`);
      }
    } catch (err: any) {
      alert(`Falha de conexão: ${err.message}`);
    } finally {
      setSendingCompliance(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-3.5 py-1 text-xs font-semibold text-solana-green mb-4">
          <ShieldCheck className="h-4 w-4" />
          {dict.validator.title}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Verificação Instantânea & Camada de IA
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {dict.validator.subtitle}
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("VERIFY")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "VERIFY"
              ? "bg-solana-green text-navy-900 border-solana-green shadow-md shadow-solana-green/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          {dict.validator.tabVerify}
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
          {dict.validator.tabEquivalence}
        </button>

        <button
          onClick={() => setActiveTab("COMPLIANCE")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "COMPLIANCE"
              ? "bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-500/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          {dict.validator.tabCompliance}
        </button>
      </div>

      {/* ABA 1: VALIDADOR DE DOCUMENTOS */}
      {activeTab === "VERIFY" && (
        <div className="space-y-8 animate-in fade-in duration-200">
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

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FileSearch className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cole o Hash SHA-256 ou Signature de transação da Solana..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-solana-green focus:outline-none"
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
                        {verificationResult.solana_tx_signature?.substring(0, 22)}...
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
                    Processando evidências criptográficas e sintetizando parecer...
                  </div>
                ) : (
                  <div className="rounded-xl bg-navy-900/60 p-4 border border-slate-800 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {trustReport || "Parecer pronto para visualização."}
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
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <GitCompare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Transferência & Aproveitamento de Créditos por IA
                </h2>
                <p className="text-xs text-slate-400">
                  Compara ementas universitárias nacionais ou internacionais com validação de hash gravado on-chain.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-2xl bg-navy-900/70 p-5 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-solana-green flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4" />
                  Instituição A (Emitida On-Chain)
                </span>
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
                  <label className="text-[11px] text-slate-400 block mb-1">Ementa Oficial</label>
                  <textarea
                    rows={4}
                    value={ementaA}
                    onChange={(e) => setEmentaA(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-navy-900/70 p-5 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-solana-purple flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Instituição B (Receptora / Destino)
                </span>
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckEquivalence}
              disabled={loadingEquiv}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-purple via-indigo-500 to-solana-green py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loadingEquiv ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loadingEquiv ? "Avaliando Compatibilidade Semântica..." : "Calcular Equivalência com Inteligência Artificial"}
            </button>
          </div>

          {equivResult && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border-solana-green/40 bg-navy-900/80 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Veredito do Motor de IA</span>
                  <h3 className="font-display text-xl font-bold text-white">
                    {equivResult.veredito?.equivalente ? "EQUIVALÊNCIA DEFERIDA ✅" : "EQUIVALÊNCIA INDEFERIDA ❌"}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Similaridade</span>
                    <span className="font-display text-2xl font-extrabold text-solana-green">
                      {equivResult.veredito?.confianca_pct}%
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-4">
                    <span className="text-xs text-slate-400 block">Créditos Aproveitáveis</span>
                    <span className="font-display text-2xl font-extrabold text-white">
                      {equivResult.veredito?.carga_horaria_aproveitavel} h
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm mt-4 leading-relaxed">
                {equivResult.veredito?.justificativa}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: SOLICITAR COMPROVAÇÃO PARA ESTÁGIO / VAGA (COMPLIANCE RH) */}
      {activeTab === "COMPLIANCE" && (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border-indigo-500/30 glow-green animate-in fade-in max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              {dict.validator.complianceTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {dict.validator.complianceDesc}
            </p>
          </div>

          {complianceSuccess ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-semibold text-white text-base">Solicitação de Comprovação Disparada!</h3>
              <p className="text-xs text-slate-300">
                Uma notificação de autorização foi enviada para o passaporte do aluno. O token de acompanhamento para o RH é:
              </p>
              <div className="rounded-xl bg-slate-900 p-2.5 font-mono text-xs text-solana-green">
                Token: {complianceSuccess.access_token}
              </div>
              <button
                onClick={() => setComplianceSuccess(null)}
                className="rounded-xl border border-slate-700 bg-navy-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Nova Solicitação
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendCompliance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{dict.validator.companyName}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nubank / Google / Petrobras"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{dict.validator.recruiterEmail}</label>
                  <input
                    type="email"
                    required
                    placeholder="talentos@empresa.com"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{dict.validator.candidateIdentifier}</label>
                <input
                  type="text"
                  required
                  placeholder="Informe o CPF ou a Carteira Solana do Candidato..."
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{dict.validator.purpose}</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                >
                  <option value="ESTAGIO">{dict.validator.purposeInternship}</option>
                  <option value="VAGA_CLT">{dict.validator.purposeEmployment}</option>
                  <option value="BACKGROUND_CHECK">{dict.validator.purposeBackground}</option>
                </select>
              </div>

              <div className="rounded-xl bg-navy-900/80 p-4 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Documentos Solicitados para Comprovação:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 text-[11px] text-indigo-300">
                    ✓ Matrícula Ativa Homologada
                  </span>
                  <span className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 text-[11px] text-indigo-300">
                    ✓ Histórico Escolar Oficial On-Chain
                  </span>
                  <span className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 text-[11px] text-indigo-300">
                    ✓ Horas Complementares Aprovadas no SAS
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingCompliance}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-solana-purple to-solana-green py-3.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {sendingCompliance ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sendingCompliance ? "Disparando Requisição Criptográfica..." : dict.validator.sendRequest}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
