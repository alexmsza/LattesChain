"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Award,
  Clock,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  RefreshCw,
  PlusCircle,
  FileText,
  UploadCloud,
  AlertCircle,
  Building2,
  Briefcase,
  Check,
  XCircle,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function StudentContent() {
  const searchParams = useSearchParams();
  const walletQuery = searchParams.get("wallet");
  const cpfQuery = searchParams.get("cpf");
  const { dict } = useLanguage();

  const [activeTab, setActiveTab] = useState<"CREDENTIALS" | "NEW_REQUEST" | "TIMELINE" | "COMPLIANCE">("CREDENTIALS");
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedRecordForQR, setSelectedRecordForQR] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [studentData, setStudentData] = useState({
    name: "Estudante",
    course: "Graduação",
    university: "Universidade Credenciada",
    solanaWallet: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
    totalHours: 0,
    requiredHours: 200,
    records: [] as any[],
  });

  // Estado das Solicitações Enviadas
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Estado das Solicitações de Compliance de RH
  const [complianceRequests, setComplianceRequests] = useState<any[]>([]);
  const [loadingCompliance, setLoadingCompliance] = useState(false);

  // Lista de Instituições para o Form
  const [institutions, setInstitutions] = useState<any[]>([]);

  // Formulário de Nova Solicitação
  const [reqTitle, setReqTitle] = useState("");
  const [reqDocType, setReqDocType] = useState("CERTIFICADO_CURSO");
  const [reqOrigin, setReqOrigin] = useState<"INTERNAL" | "EXTERNAL">("EXTERNAL");
  const [reqHours, setReqHours] = useState("40");
  const [reqExternalIssuer, setReqExternalIssuer] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [reqInstId, setReqInstId] = useState("");
  const [reqFile, setReqFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Carrega Dados do Estudante
  const loadStudentData = async () => {
    setLoading(true);
    try {
      let url = "/api/credentials/student";
      const params = new URLSearchParams();
      if (walletQuery) params.append("wallet", walletQuery);
      if (cpfQuery) params.append("cpf", cpfQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudentData({
          name: data.student.name,
          course: data.student.course,
          university: data.student.university,
          solanaWallet: data.student.solanaWallet,
          totalHours: data.student.totalHours,
          requiredHours: data.student.requiredHours || 200,
          records: data.records || [],
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados do aluno:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carrega Minhas Solicitações de Validação
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`/api/requests/student?wallet=${studentData.solanaWallet}`);
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Carrega Pedidos de Empresas (Compliance)
  const loadCompliance = async () => {
    setLoadingCompliance(true);
    try {
      const res = await fetch(`/api/compliance/student?identifier=${studentData.solanaWallet}`);
      if (res.ok) {
        const data = await res.json();
        setComplianceRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Erro ao carregar requisições de compliance:", err);
    } finally {
      setLoadingCompliance(false);
    }
  };

  // Carrega Instituições
  useEffect(() => {
    fetch("/api/institutions")
      .then((r) => r.json())
      .then((d) => {
        if (d.institutions && d.institutions.length > 0) {
          setInstitutions(d.institutions);
          setReqInstId(d.institutions[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [walletQuery, cpfQuery]);

  useEffect(() => {
    if (activeTab === "TIMELINE") loadRequests();
    if (activeTab === "COMPLIANCE") loadCompliance();
  }, [activeTab, studentData.solanaWallet]);

  // Computa SHA-256 no navegador
  const computeFileHash = async (selectedFile: File): Promise<string> => {
    const buffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Submissão do Formulário de Validação
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqHours) {
      alert("Preencha o título e a carga horária.");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      let docHash = "";
      if (reqFile) {
        docHash = await computeFileHash(reqFile);
      }

      const res = await fetch("/api/requests/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_wallet: studentData.solanaWallet,
          student_name: studentData.name,
          institution_id: reqInstId,
          document_type: reqDocType,
          origin_type: reqOrigin,
          title: reqTitle,
          workload_hours: parseInt(reqHours, 10),
          document_hash: docHash,
          external_issuer_name: reqOrigin === "EXTERNAL" ? reqExternalIssuer : undefined,
          notes: reqNotes,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setReqTitle("");
        setReqHours("40");
        setReqExternalIssuer("");
        setReqNotes("");
        setReqFile(null);
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab("TIMELINE");
        }, 1500);
      } else {
        const errData = await res.json();
        alert(`Erro ao submeter: ${errData.error || "Tente novamente."}`);
      }
    } catch (err: any) {
      alert(`Falha ao conectar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Autorização de Compliance para Empresa
  const handleAuthorizeCompliance = async (reqId: string) => {
    try {
      const res = await fetch("/api/compliance/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: reqId }),
      });
      if (res.ok) {
        loadCompliance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/validator?wallet=${studentData.solanaWallet}`
      : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 glow-green">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-solana-purple to-solana-purple p-0.5 shadow-lg">
              <div className="h-full w-full rounded-[14px] bg-navy-900 flex items-center justify-center text-solana-purple">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{studentData.name}</h1>
              <p className="text-sm text-slate-300">
                {studentData.course} • <span className="text-solana-purple">{studentData.university}</span>
              </p>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs text-slate-400">
                <span>Carteira Soberana:</span>
                <span className="text-slate-300">{studentData.solanaWallet.substring(0, 18)}...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setSelectedRecordForQR(null);
                setShowQR(true);
              }}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              <QrCode className="h-4 w-4 text-solana-purple" />
              QR Code do Passaporte
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-solana-purple/15 border border-solana-purple/30 px-4 py-2.5 text-xs font-semibold text-solana-purple hover:bg-solana-purple/25 transition-all"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Link Copiado!" : "Compartilhar Link"}
            </button>
          </div>
        </div>

        {/* PROGRESS BAR HORAS COMPLEMENTARES */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-solana-purple" />
              {dict.student.hoursProgress}
            </span>
            <span className="font-mono text-slate-200">
              <strong className="text-solana-purple text-sm">{studentData.totalHours}h</strong> / {studentData.requiredHours}h
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-solana-purple to-solana-purple transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, (studentData.totalHours / studentData.requiredHours) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "CREDENTIALS", label: dict.student.tabActive, icon: Award },
          { id: "NEW_REQUEST", label: dict.student.tabRequest, icon: PlusCircle },
          { id: "TIMELINE", label: dict.student.tabTimeline, icon: Clock },
          { id: "COMPLIANCE", label: dict.student.tabCompliance, icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                isActive
                  ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
                  : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ABA 1: CREDENCIAIS ATIVAS */}
      {activeTab === "CREDENTIALS" && (
        <div className="space-y-4 animate-in fade-in">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
              Consultando atestações na Solana Devnet...
            </div>
          ) : studentData.records.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-3">
              <Award className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-semibold text-white text-base">Nenhuma credencial atestada ainda</h3>
              <p className="text-xs max-w-md mx-auto">
                Submeta certificados de cursos na aba &quot;Solicitar Validação&quot; para que sua universidade homologue suas horas on-chain.
              </p>
              <button
                onClick={() => setActiveTab("NEW_REQUEST")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-solana-purple/15 border border-solana-purple/40 px-4 py-2 text-xs font-bold text-solana-purple hover:bg-solana-purple/25"
              >
                <PlusCircle className="h-4 w-4" />
                Nova Solicitação
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentData.records.map((rec) => (
                <div
                  key={rec.id}
                  className="glass-panel rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-solana-purple/10 border border-solana-purple/30 px-2.5 py-0.5 text-[10px] font-bold text-solana-purple">
                        {rec.status}
                      </span>
                      <span className="text-[11px] text-slate-400">{rec.date}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-base">{rec.title}</h3>
                    <p className="text-xs text-slate-400">{rec.institution}</p>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      Hash: {rec.hash}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">
                      {rec.hours ? `${rec.hours}h` : rec.grade ? `Nota: ${rec.grade}` : "Atestado Oficial"}
                    </span>
                    <a
                      href={`https://explorer.solana.com/tx/${rec.tx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-solana-purple hover:underline font-mono text-[11px]"
                    >
                      Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: NOVA SOLICITAÇÃO DE VALIDAÇÃO */}
      {activeTab === "NEW_REQUEST" && (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border-slate-800 animate-in fade-in max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-solana-purple" />
              {dict.student.requestFormTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {dict.student.requestFormDesc}
            </p>
          </div>

          {submitSuccess ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-semibold text-white text-base">Solicitação enviada com sucesso!</h3>
              <p className="text-xs text-slate-300">
                A coordenação da sua IES foi notificada e avaliará o certificado na fila acadêmica. Redirecionando para suas solicitações...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {/* Seleção de Instituição */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Universidade / IES de Destino</label>
                <select
                  value={reqInstId}
                  onChange={(e) => setReqInstId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (CNPJ: {i.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              {/* Origem: Interna ou Externa */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{dict.student.originType}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReqOrigin("INTERNAL")}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                      reqOrigin === "INTERNAL"
                        ? "bg-solana-green/15 text-solana-green border-solana-green/40"
                        : "bg-navy-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {dict.student.internalCourse}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqOrigin("EXTERNAL")}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                      reqOrigin === "EXTERNAL"
                        ? "bg-solana-purple/20 text-purple-300 border-purple-500/40"
                        : "bg-navy-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {dict.student.externalCourse}
                  </button>
                </div>
              </div>

              {/* Título e Carga */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">{dict.student.courseTitle}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Workshop de Inteligência Artificial e Rust"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{dict.student.workload}</label>
                  <input
                    type="number"
                    required
                    value={reqHours}
                    onChange={(e) => setReqHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
              </div>

              {/* Se for curso externo, pede emissor */}
              {reqOrigin === "EXTERNAL" && (
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{dict.student.externalIssuer}</label>
                  <input
                    type="text"
                    placeholder="Ex: Alura / Coursera / Superteam / USP"
                    value={reqExternalIssuer}
                    onChange={(e) => setReqExternalIssuer(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
              )}

              {/* Upload do Certificado PDF */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Comprovante em PDF</label>
                <div
                  onClick={() => document.getElementById("req-file")?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-solana-purple/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/40 transition-colors"
                >
                  <input
                    id="req-file"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReqFile(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="h-8 w-8 text-solana-purple mx-auto mb-2" />
                  <p className="font-semibold text-white text-xs">
                    {reqFile ? reqFile.name : dict.student.uploadPrompt}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    O arquivo permanece privado no seu dispositivo; apenas o hash de integridade é enviado.
                  </p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{dict.student.notes}</label>
                <textarea
                  rows={2}
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Informações adicionais para a comissão de validação..."
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 p-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-solana-purple py-3 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {submitting ? "Processando e Computando Hash..." : dict.student.submitRequest}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ABA 3: MINHAS SOLICITAÇÕES (TIMELINE) */}
      {activeTab === "TIMELINE" && (
        <div className="space-y-4 animate-in fade-in">
          {loadingRequests ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
              Carregando timeline de solicitações...
            </div>
          ) : myRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-semibold text-white text-base">{dict.student.noRequests}</h3>
              <p className="text-xs max-w-md mx-auto">
                Quando você enviar certificados de extensão para a IES, poderá acompanhar aqui o parecer da coordenação.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="glass-panel rounded-2xl p-5 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.title}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : req.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {req.status === "APPROVED"
                          ? "✓ Aprovado On-Chain"
                          : req.status === "REJECTED"
                          ? "✕ Indeferido"
                          : "⏳ Aguardando Avaliação"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {req.workload_hours}h • IES: {req.institutions?.name || "Universidade"} • {req.origin_type === "INTERNAL" ? "Curso Interno" : `Externo: ${req.external_issuer_name || "Livre"}`}
                    </p>
                    {req.rejection_reason && (
                      <p className="text-xs text-red-300 bg-red-950/20 border border-red-500/20 rounded-lg p-2 mt-2">
                        <strong>Parecer da IES:</strong> {req.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {req.solana_tx_signature ? (
                      <a
                        href={`https://explorer.solana.com/tx/${req.solana_tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-solana-purple hover:underline text-xs font-mono"
                      >
                        Ver na Solana <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Protocolado em {new Date(req.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: REQUISIÇÕES DE RH / COMPLIANCE */}
      {activeTab === "COMPLIANCE" && (
        <div className="space-y-4 animate-in fade-in">
          {loadingCompliance ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
              Verificando solicitações de compliance...
            </div>
          ) : complianceRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-3">
              <Briefcase className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-semibold text-white text-base">{dict.student.noCompliance}</h3>
              <p className="text-xs max-w-md mx-auto">
                Quando uma empresa ou RH disparar uma checagem de matrícula ou estágio para seu CPF/Carteira, você poderá autorizar o compartilhamento criptográfico por aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {complianceRequests.map((req) => (
                <div
                  key={req.id}
                  className="glass-panel rounded-2xl p-5 border-solana-purple/30 bg-purple-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-solana-purple" />
                      <span className="font-bold text-white text-sm">{req.employer_name}</span>
                      <span className="rounded-full bg-solana-purple/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                        {req.purpose}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Contato: <span className="font-mono text-slate-200">{req.employer_email}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Itens Solicitados: {Array.isArray(req.requested_items) ? req.requested_items.join(", ") : "Histórico Oficial"}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {req.status === "SHARED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <Check className="h-4 w-4" /> Prova Compartilhada com a Empresa
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAuthorizeCompliance(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-solana-purple px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-solana-purpleDeep hover:scale-[1.02] transition-all"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {dict.student.authorizeShare}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL QR CODE */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-sm w-full border-solana-purple/40 text-center space-y-4 animate-in zoom-in-95">
            <h3 className="font-display text-lg font-bold text-white">{dict.student.qrModalTitle}</h3>
            <p className="text-xs text-slate-400">{dict.student.qrModalDesc}</p>
            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center">
              {/* QR Code Simulado de Alta Fidelidade */}
              <QrCode className="h-40 w-40 text-navy-900" />
            </div>
            <div className="font-mono text-[10px] text-slate-400 truncate">
              {studentData.solanaWallet}
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full rounded-xl border border-slate-700 bg-navy-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={null}>
      <StudentContent />
    </Suspense>
  );
}
