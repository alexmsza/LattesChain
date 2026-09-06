"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Clock,
  RefreshCw,
  Search,
  UserCheck,
  Inbox,
  AlertCircle,
  Eye,
  FileCheck2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function UniversityPortal() {
  const { dict } = useLanguage();
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "DIRECT_ISSUE" | "DIRECTORY">("REQUESTS");

  // Estados da Fila de Solicitações de Alunos
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Estados do Diretório de Alunos
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any | null>(null);

  // Estados da Emissão Manual Direta
  const [docType, setDocType] = useState<"DISCIPLINA" | "HORAS_COMPLEMENTARES" | "DIPLOMA">("DISCIPLINA");
  const [studentName, setStudentName] = useState("");
  const [studentCpf, setStudentCpf] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [courseName, setCourseName] = useState("");
  const [workloadHours, setWorkloadHours] = useState("60");
  const [grade, setGrade] = useState("Aprovado");
  const [semester, setSemester] = useState("2026.1");
  const [ementaTexto, setEmentaTexto] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState<any>(null);
  const [recentIssuances, setRecentIssuances] = useState<any[]>([]);

  // Carrega Solicitações
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/requests/institution");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Erro ao carregar fila de solicitações:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Carrega Diretório de Alunos
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/directory/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Erro ao carregar diretório de estudantes:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "DIRECTORY") loadStudents();
    if (activeTab === "REQUESTS") loadRequests();
  }, [activeTab]);

  // Ação de Revisão de Solicitação de Aluno (Aprovação ou Rejeição)
  const handleReview = async (requestId: string, action: "APPROVE" | "REJECT") => {
    let reason: string | null = null;
    if (action === "REJECT") {
      reason = prompt(dict.university.rejectionPrompt);
      if (reason === null) return; // cancelou
    } else {
      if (!confirm(dict.university.confirmApproval)) return;
    }

    setReviewingId(requestId);
    try {
      const res = await fetch("/api/requests/institution/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          action,
          rejection_reason: reason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  solana_tx_signature: data.solana_tx_signature || r.solana_tx_signature,
                  rejection_reason: reason || r.rejection_reason,
                }
              : r
          )
        );
        if (action === "APPROVE") {
          alert(`Atestação deferida e ancorada na Solana Devnet!\nSignature: ${data.solana_tx_signature}`);
        }
      } else {
        const errData = await res.json();
        alert(`Erro na avaliação: ${errData.error || "Tente novamente."}`);
      }
    } catch (err: any) {
      alert(`Falha de conexão: ${err.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  // Computa SHA-256 no browser
  const computeFileHash = async (selectedFile: File): Promise<string> => {
    const buffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Emissão Manual Direta
  const handleDirectIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !courseName) {
      alert("Preencha o nome do estudante e o curso/disciplina.");
      return;
    }

    setIssuing(true);
    try {
      let docHash = "";
      if (file) {
        docHash = await computeFileHash(file);
      }

      const res = await fetch("/api/credentials/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          student_cpf: studentCpf,
          student_wallet: studentWallet,
          document_type: docType,
          course_name: courseName,
          workload_hours: parseInt(workloadHours || "60", 10),
          grade,
          semester,
          ementa_texto: docType === "DISCIPLINA" ? ementaTexto : undefined,
          document_hash: docHash,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.solana_tx_signature) {
          const issuedData = {
            student_name: studentName,
            course_name: courseName,
            document_type: docType,
            document_hash: docHash,
            solana_tx: data.solana_tx_signature,
            explorer_url: data.explorer_url,
            issued_at: new Date().toLocaleTimeString("pt-BR"),
            status:
              data.status_onchain ||
              (docType === "DIPLOMA" ? "TOKEN-2022 SOULBOUND" : "ATESTADO NO SAS"),
          };
          setLastIssued(issuedData);
          setRecentIssuances((prev) => [issuedData, ...prev]);
          setCourseName("");
          setStudentName("");
          setFile(null);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Erro ao emitir credencial: ${errData.error || "Falha na comunicação com o protocolo."}`);
      }
    } catch (networkErr: any) {
      alert(`Falha de conexão ao emitir credencial: ${networkErr.message}`);
    } finally {
      setIssuing(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.cpf?.includes(searchStudent) ||
      s.solana_wallet_custodial?.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-3.5 py-1 text-xs font-semibold text-solana-green mb-4">
          <Building2 className="h-4 w-4" />
          {dict.university.title}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Gestão Acadêmica & Atestações On-Chain
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {dict.university.subtitle}
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "REQUESTS"
              ? "bg-solana-green text-navy-900 border-solana-green shadow-md shadow-solana-green/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <Inbox className="h-4 w-4" />
          {dict.university.tabRequests}
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-navy-900 text-solana-green px-2 py-0.5 text-[10px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("DIRECT_ISSUE")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "DIRECT_ISSUE"
              ? "bg-solana-green text-navy-900 border-solana-green shadow-md shadow-solana-green/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          {dict.university.tabDirectIssue}
        </button>

        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "DIRECTORY"
              ? "bg-solana-green text-navy-900 border-solana-green shadow-md shadow-solana-green/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          {dict.university.tabDirectory}
        </button>
      </div>

      {/* ABA 1: FILA DE SOLICITAÇÕES DE ALUNOS */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4 animate-in fade-in">
          {loadingRequests ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-green" />
              Carregando fila de solicitações de alunos...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-3">
              <Inbox className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-semibold text-white text-base">Fila limpa! Nenhuma solicitação pendente</h3>
              <p className="text-xs max-w-md mx-auto">
                Quando os alunos submeterem comprovantes de cursos internos ou de extensão em seus passaportes, eles aparecerão aqui para triagem.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="glass-panel rounded-2xl p-5 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                          ? "✓ Homologado On-Chain"
                          : req.status === "REJECTED"
                          ? "✕ Indeferido"
                          : "⏳ Aguardando Decisão"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Aluno: <strong className="text-white">{req.students?.full_name || "Aluno"}</strong> (CPF: {req.students?.cpf || "---"}) • Carga: {req.workload_hours}h
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Hash SHA-256: {req.document_hash}
                    </p>
                    {req.origin_type === "EXTERNAL" && req.external_issuer_name && (
                      <p className="text-[11px] text-purple-300">
                        Instituição Externa: <strong>{req.external_issuer_name}</strong>
                      </p>
                    )}
                    {req.notes && (
                      <p className="text-xs text-slate-400 italic">&ldquo;{req.notes}&rdquo;</p>
                    )}
                    {req.rejection_reason && (
                      <p className="text-xs text-red-300">
                        Motivo da Recusa: {req.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleReview(req.id, "APPROVE")}
                          disabled={reviewingId === req.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-2 text-xs font-bold text-navy-900 shadow-md hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                          {reviewingId === req.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Aprovar On-Chain
                        </button>
                        <button
                          onClick={() => handleReview(req.id, "REJECT")}
                          disabled={reviewingId === req.id}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/40 transition-all"
                        >
                          <XCircle className="h-4 w-4" />
                          Recusar
                        </button>
                      </>
                    ) : req.solana_tx_signature ? (
                      <a
                        href={`https://explorer.solana.com/tx/${req.solana_tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-solana-green hover:underline text-xs font-mono"
                      >
                        Solana Explorer <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: EMISSÃO MANUAL DIRETA */}
      {activeTab === "DIRECT_ISSUE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 glow-green">
            <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-solana-green" />
              Nova Atestação Acadêmica Direta
            </h2>

            <form onSubmit={handleDirectIssue} className="space-y-5 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tipo de Credencial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "DISCIPLINA", label: "Disciplina Cursada" },
                    { id: "HORAS_COMPLEMENTARES", label: "Horas Extensão" },
                    { id: "DIPLOMA", label: "Diploma Soulbound" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDocType(type.id as any)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        docType === type.id
                          ? "bg-solana-green/15 text-solana-green border-solana-green/40 shadow-sm"
                          : "bg-navy-900/60 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Nome Completo do Aluno</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alexandre Silva"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">CPF do Aluno</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={studentCpf}
                    onChange={(e) => setStudentCpf(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Título da Matéria ou Diploma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Algoritmos e Estruturas de Dados Avançados"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Carga (Horas)</label>
                  <input
                    type="number"
                    value={workloadHours}
                    onChange={(e) => setWorkloadHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Avaliação / Nota</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Semestre Letivo</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-green focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 py-3.5 text-xs font-bold text-navy-900 shadow-md shadow-solana-green/20 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {issuing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {issuing ? "Ancorando na Solana Devnet..." : "Emitir Atestação Criptográfica"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-6 border-slate-800">
              <h3 className="font-display font-bold text-white text-sm mb-3">Última Emissão Realizada</h3>
              {lastIssued ? (
                <div className="space-y-2 text-xs">
                  <span className="rounded-full bg-solana-green/10 text-solana-green px-2 py-0.5 text-[10px] font-bold">
                    {lastIssued.status}
                  </span>
                  <p className="font-semibold text-white">{lastIssued.course_name}</p>
                  <p className="text-slate-400">Aluno: {lastIssued.student_name}</p>
                  <a
                    href={lastIssued.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-solana-green hover:underline font-mono text-[11px] pt-1"
                  >
                    Ver no Solana Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nenhuma emissão realizada nesta sessão.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: DIRETÓRIO DE ALUNOS MATRICULADOS */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={dict.university.studentSearchPlaceholder}
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-solana-green focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 self-end sm:self-center">
              {filteredStudents.length} estudantes cadastrados no protocolo
            </span>
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-green" />
              Carregando diretório de alunos e históricos...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-2">
              <UserCheck className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs">Nenhum estudante encontrado com o filtro pesquisado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((stud) => (
                <div
                  key={stud.id}
                  className="glass-panel rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{stud.full_name}</span>
                      <span className="text-[11px] font-mono text-slate-400">CPF: {stud.cpf || "---"}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{stud.email}</p>
                    <div className="font-mono text-[10px] text-slate-500 truncate">
                      Wallet: {stud.solana_wallet_custodial}
                    </div>
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      <span className="text-solana-green font-bold">
                        {stud.total_hours}h atestadas
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">
                        {stud.total_records} documentos emitidos
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedStudentForHistory(stud)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      <Eye className="h-3.5 w-3.5 text-solana-green" />
                      {dict.university.viewHistory}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL HISTÓRICO COMPLETO DO ESTUDANTE */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-slate-700 space-y-5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {selectedStudentForHistory.full_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Histórico acadêmico homologado na Solana Devnet
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedStudentForHistory.records?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Nenhum registro acadêmico homologado para este aluno ainda.
                </p>
              ) : (
                selectedStudentForHistory.records?.map((rec: any) => (
                  <div key={rec.id} className="rounded-xl bg-navy-900/90 p-3.5 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        {rec.metadata?.course_name || rec.document_type}
                      </span>
                      <span className="text-[10px] text-solana-green font-mono">
                        {rec.metadata?.workload_hours ? `${rec.metadata.workload_hours}h` : "Certificado"}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Hash: {rec.document_hash}
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${rec.solana_tx_signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-solana-green hover:underline text-[10px] font-mono pt-1"
                    >
                      Transação Solana <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
