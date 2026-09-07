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
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Layers,
  FileText,
  MapPin,
  Mail,
  UserPlus,
  Send,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function UniversityPortal() {
  const { dict } = useLanguage();
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "DIRECT_ISSUE" | "BATCH_CSV" | "DIRECTORY" | "CAMPUSES">("REQUESTS");

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

  // Estados do Parser de XML do MEC
  const [xmlParsing, setXmlParsing] = useState(false);
  const [xmlStatus, setXmlStatus] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    hash?: string;
    filename?: string;
  } | null>(null);
  const [xmlFileHash, setXmlFileHash] = useState<string>("");

  // Estados do Módulo de Emissão em Lote (CSV)
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchData, setBatchData] = useState<Array<{
    nome: string;
    cpf: string;
    email: string;
    curso: string;
    tipo_documento: string;
    carga_horaria: string;
    semestre: string;
    status: "PENDING" | "PROCESSING" | "SUCCESS" | "ERROR";
    hash?: string;
    tx?: string;
    errorMsg?: string;
  }>>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Estados de Campus
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [newCampusName, setNewCampusName] = useState("");
  const [newCampusCode, setNewCampusCode] = useState("");
  const [newCampusCity, setNewCampusCity] = useState("");
  const [newCampusState, setNewCampusState] = useState("");
  const [savingCampus, setSavingCampus] = useState(false);
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>("ALL");

  // Estados do Modal de Matrícula de Estudante (Multi-Tenant)
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollName, setEnrollName] = useState("");
  const [enrollCpf, setEnrollCpf] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollRegNum, setEnrollRegNum] = useState("");
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollCampusId, setEnrollCampusId] = useState("");
  const [enrollSendEmail, setEnrollSendEmail] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollFeedback, setEnrollFeedback] = useState<string | null>(null);

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

  // Carrega Campuses da IES
  const loadCampuses = async () => {
    setLoadingCampuses(true);
    try {
      const res = await fetch("/api/institution/campuses");
      if (res.ok) {
        const data = await res.json();
        setCampuses(data.campuses || []);
      }
    } catch (err) {
      console.error("Erro ao carregar campus:", err);
    } finally {
      setLoadingCampuses(false);
    }
  };

  // Carrega Estudantes vinculados à IES (Multi-Tenant)
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/institution/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      } else {
        const fallbackRes = await fetch("/api/directory/students");
        if (fallbackRes.ok) {
          const fb = await fallbackRes.json();
          setStudents(fb.students || []);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar diretório de estudantes:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Criação de Campus pela IES
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusName.trim()) return;
    setSavingCampus(true);
    try {
      const res = await fetch("/api/institution/campuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampusName.trim(),
          code: newCampusCode.trim(),
          city: newCampusCity.trim(),
          state: newCampusState.trim(),
        }),
      });
      if (res.ok) {
        setNewCampusName("");
        setNewCampusCode("");
        setNewCampusCity("");
        setNewCampusState("");
        loadCampuses();
      } else {
        const err = await res.json();
        alert("Erro ao criar campus: " + (err.error || "Tente novamente."));
      }
    } catch (err: any) {
      alert("Falha de conexão: " + err.message);
    } finally {
      setSavingCampus(false);
    }
  };

  // Matrícula de Estudante com Disparo de E-mail
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollCpf.trim() || !enrollEmail.trim() || !enrollRegNum.trim() || !enrollCourse.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    setEnrolling(true);
    setEnrollFeedback(null);
    try {
      const res = await fetch("/api/institution/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: enrollName.trim(),
          cpf: enrollCpf.trim(),
          email: enrollEmail.trim(),
          registration_number: enrollRegNum.trim(),
          course_name: enrollCourse.trim(),
          campus_id: enrollCampusId || null,
          send_email: enrollSendEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEnrollFeedback(data.message || "Estudante matriculado com sucesso!");
        loadStudents();
        setTimeout(() => {
          setShowEnrollModal(false);
          setEnrollName("");
          setEnrollCpf("");
          setEnrollEmail("");
          setEnrollRegNum("");
          setEnrollCourse("");
          setEnrollCampusId("");
          setEnrollFeedback(null);
        }, 1500);
      } else {
        alert("Erro ao matricular estudante: " + (data.error || "Tente novamente."));
      }
    } catch (err: any) {
      alert("Erro de conexão: " + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadCampuses();
  }, []);

  useEffect(() => {
    if (activeTab === "DIRECTORY") {
      loadStudents();
      loadCampuses();
    }
    if (activeTab === "REQUESTS") loadRequests();
    if (activeTab === "CAMPUSES") loadCampuses();
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
        if (action === "APPROVE") {
          alert(`Atestação deferida e ancorada na Solana Devnet!\nSignature: ${data.solana_tx_signature}`);
        }
        loadRequests();
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

  // Parser do XML do MEC com tolerância e fallback para edição manual
  const handleXmlUpload = async (xmlFile: File) => {
    try {
      setXmlParsing(true);
      setXmlStatus(null);

      const computedHash = await computeFileHash(xmlFile);
      setXmlFileHash(computedHash);
      setFile(xmlFile);

      const text = await xmlFile.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Estrutura XML corrompida ou inválida.");
      }

      // Extrai campos com suporte a variações de esquemas do MEC
      const getTag = (selectors: string[]) => {
        for (const s of selectors) {
          const el = xmlDoc.querySelector(s);
          if (el && el.textContent?.trim()) return el.textContent.trim();
        }
        return "";
      };

      const nome = getTag(["diplomado > nome", "nomeDiplomado", "dadosDiplomado > nome", "dadosDoDiplomado > nome", "nome"]);
      const cpf = getTag(["diplomado > cpf", "cpfDiplomado", "dadosDiplomado > cpf", "cpf"]);
      const curso = getTag(["dadosCurso > nomeCurso", "nomeCurso", "curso > nome", "dadosDoCurso > nomeCurso", "curso"]);
      const carga = getTag(["dadosCurso > cargaHoraria", "cargaHoraria", "dadosDoCurso > cargaHoraria"]) || "3600";
      const livro = getTag(["dadosRegistro > livroRegistro", "livroRegistro", "dadosDoRegistro > livro"]);
      const folha = getTag(["dadosRegistro > numeroFolhaDoRegistro", "numeroFolhaDoRegistro", "folhaRegistro", "folha"]);
      const registro = getTag(["dadosRegistro > numeroRegistro", "numeroRegistro", "registro"]);

      if (nome) setStudentName(nome);
      if (cpf) setStudentCpf(cpf);
      if (curso) setCourseName(curso);
      if (carga) setWorkloadHours(carga);
      setDocType("DIPLOMA");

      if (livro || registro) {
        setEmentaTexto(`Diploma Digital Registrado sob nº ${registro || "S/N"}, Livro ${livro || "1"}, Folha ${folha || "1"}. Ancorado e em conformidade com as Portarias MEC nº 330/2018 e nº 554/2019.`);
      }

      setXmlStatus({
        type: "success",
        message: "XML do Diploma Digital (MEC) processado com sucesso! Os campos foram preenchidos automaticamente. Você pode revisar e editar livremente qualquer informação abaixo antes de emitir.",
        hash: computedHash,
        filename: xmlFile.name,
      });
    } catch (err: any) {
      setXmlStatus({
        type: "warning",
        message: `Não foi possível extrair todos os metadados do XML automaticamente (${err.message}). O formulário abaixo continua 100% liberado para inserção manual.`,
      });
    } finally {
      setXmlParsing(false);
    }
  };

  // Download do Template CSV para Lote
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "nome,cpf,email,curso,tipo_documento,carga_horaria,semestre\n" +
      "Mariana Costa,12345678909,mariana@exemplo.com,Ciência da Computação,DIPLOMA,3600,2026.1\n" +
      "Lucas Mendes,98765432100,lucas@exemplo.com,Inteligência Artificial Aplicada,DISCIPLINA,72,2026.1\n" +
      "Beatriz Lima,45678912301,beatriz@exemplo.com,Hackathon Universitário Superteam,HORAS_COMPLEMENTARES,40,2026.1\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_emissao_lote_lattes_chain.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload e Parse de CSV
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selected = e.target.files[0];
    setBatchFile(selected);

    try {
      const text = await selected.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert("O arquivo CSV precisa ter ao menos o cabeçalho e uma linha de dados.");
        return;
      }

      const parsedRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length >= 4) {
          parsedRows.push({
            nome: cols[0] || "",
            cpf: cols[1] || "",
            email: cols[2] || "",
            curso: cols[3] || "",
            tipo_documento: cols[4] || "DIPLOMA",
            carga_horaria: cols[5] || "60",
            semestre: cols[6] || "2026.1",
            status: "PENDING",
          });
        }
      }

      setBatchData(parsedRows);
      setBatchProgress({ current: 0, total: parsedRows.length });
    } catch (err: any) {
      alert(`Falha ao ler o arquivo CSV: ${err.message}`);
    }
  };

  // Processamento Sequencial do Lote com Feedback Visual
  const handleProcessBatch = async () => {
    if (batchData.length === 0) return;
    setBatchProcessing(true);

    const updated = [...batchData];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      item.status = "PROCESSING";
      setBatchData([...updated]);
      setBatchProgress({ current: i + 1, total: updated.length });

      try {
        const res = await fetch("/api/credentials/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_name: item.nome,
            student_cpf: item.cpf,
            student_email: item.email,
            document_type: item.tipo_documento,
            course_name: item.curso,
            workload_hours: parseInt(item.carga_horaria || "60", 10),
            semester: item.semestre,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          item.status = "SUCCESS";
          item.hash = data.document_hash;
          item.tx = data.solana_tx_signature;
        } else {
          const err = await res.json().catch(() => ({}));
          item.status = "ERROR";
          item.errorMsg = err.error || "Erro na emissão";
        }
      } catch (err: any) {
        item.status = "ERROR";
        item.errorMsg = err.message;
      }

      setBatchData([...updated]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setBatchProcessing(false);
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
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/30 bg-solana-purple/10 px-3.5 py-1 text-xs font-semibold text-solana-purple mb-4">
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
              ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <Inbox className="h-4 w-4" />
          {dict.university.tabRequests}
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-navy-900 text-solana-purple px-2 py-0.5 text-[10px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("DIRECT_ISSUE")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "DIRECT_ISSUE"
              ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          {dict.university.tabDirectIssue}
        </button>

        <button
          onClick={() => setActiveTab("BATCH_CSV")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "BATCH_CSV"
              ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          Emissão em Lote (CSV)
        </button>

        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "DIRECTORY"
              ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          {dict.university.tabDirectory}
        </button>

        <button
          onClick={() => setActiveTab("CAMPUSES")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
            activeTab === "CAMPUSES"
              ? "bg-solana-purple text-white border-solana-purple shadow-md shadow-solana-purple/20"
              : "bg-navy-900/60 text-slate-300 border-slate-800 hover:text-white"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Polos & Campus
          {campuses.length > 0 && (
            <span className="rounded-full bg-navy-900 text-solana-purple px-2 py-0.5 text-[10px] font-black">
              {campuses.length}
            </span>
          )}
        </button>
      </div>

      {/* ABA 1: FILA DE SOLICITAÇÕES DE ALUNOS */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4 animate-in fade-in">
          {loadingRequests ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
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
                        className="inline-flex items-center gap-1 text-solana-purple hover:underline text-xs font-mono"
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
            <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-solana-purple" />
              Nova Atestação Acadêmica Direta
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Emita diplomas digitais ou certificados via upload de XML padrão MEC ou preenchendo os dados manualmente.
            </p>

            {/* ÁREA DE IMPORTAÇÃO DE XML DO MEC (PORTARIAS 330/2018 E 554/2019) */}
            <div className="mb-6 p-4 rounded-2xl border border-slate-700/80 bg-navy-900/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-solana-purple" />
                  Importar XML do MEC (Diploma Digital ICP-Brasil)
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-solana-purple bg-solana-purple/10 border border-solana-purple/30 px-2.5 py-0.5 rounded-full">
                  Portarias MEC 330/2018 & 554/2019
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Se você possui o XML oficial do diploma, carregue-o para preenchimento automático. Caso prefira ou o arquivo apresente inconformidade, todos os campos permanecem 100% editáveis e acessíveis manualmente.
              </p>

              <div
                className="border-2 border-dashed border-slate-700 hover:border-solana-purple/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50"
                onClick={() => document.getElementById("xml-upload-input")?.click()}
              >
                <input
                  id="xml-upload-input"
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleXmlUpload(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="h-6 w-6 text-solana-purple mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-white block">
                  {xmlParsing ? "Decodificando arquivo XML..." : "Arraste ou clique para carregar o XML do Diploma Digital"}
                </span>
                <span className="text-[10px] text-slate-500">
                  Compatível com os esquemas XSD do MEC (Livro, Folha, Registro e Hash ICP-Brasil)
                </span>
              </div>

              {xmlStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in ${
                    xmlStatus.type === "success"
                      ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-200"
                      : "bg-amber-950/40 border border-amber-500/40 text-amber-200"
                  }`}
                >
                  {xmlStatus.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{xmlStatus.message}</p>
                    {xmlStatus.hash && (
                      <p className="font-mono text-[10px] opacity-80 break-all">
                        SHA-256 Canônico do Arquivo: {xmlStatus.hash}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setXmlStatus(null)}
                    className="text-[10px] underline hover:opacity-100 opacity-70"
                  >
                    Dispensar
                  </button>
                </div>
              )}
            </div>

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
                          ? "bg-solana-purple/15 text-solana-purple border-solana-purple/40 shadow-sm"
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
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">CPF do Aluno</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={studentCpf}
                    onChange={(e) => setStudentCpf(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Carga (Horas)</label>
                  <input
                    type="number"
                    value={workloadHours}
                    onChange={(e) => setWorkloadHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Avaliação / Nota</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Semestre Letivo</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800/80 px-3.5 py-2.5 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-solana-purple py-3.5 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep hover:scale-[1.01] transition-all disabled:opacity-50"
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

      {/* ABA 3: EMISSÃO EM LOTE VIA CSV */}
      {activeTab === "BATCH_CSV" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 glow-green space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-solana-purple" />
                  Emissão em Lote (Turmas & Formaturas)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Importe planilhas com dezenas de formandos para ancoragem sequencial em lote no protocolo Solana.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm self-start sm:self-auto"
              >
                <Download className="h-4 w-4 text-solana-purple" />
                Baixar Modelo CSV (Template)
              </button>
            </div>

            {/* DROPZONE CSV */}
            <div
              className="border-2 border-dashed border-slate-700 hover:border-solana-purple/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-900/40"
              onClick={() => document.getElementById("csv-batch-upload")?.click()}
            >
              <input
                id="csv-batch-upload"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
              <FileSpreadsheet className="h-8 w-8 text-solana-purple mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">
                {batchFile ? batchFile.name : "Clique para selecionar ou arraste o arquivo CSV da turma"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Formato esperado: <code className="text-solana-purple">nome,cpf,email,curso,tipo_documento,carga_horaria,semestre</code>
              </p>
            </div>

            {/* TABELA DE PRÉ-VISUALIZAÇÃO DO LOTE */}
            {batchData.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Registros Identificados: <strong className="text-solana-purple">{batchData.length} alunos</strong>
                  </span>
                  <button
                    onClick={handleProcessBatch}
                    disabled={batchProcessing}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-solana-purple px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {batchProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {batchProcessing
                      ? `Processando Lote (${batchProgress.current}/${batchProgress.total})...`
                      : "Processar e Ancorar Lote na Solana"}
                  </button>
                </div>

                {/* BARRA DE PROGRESSO DO LOTE */}
                {batchProcessing && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Ancorando atestações na Devnet...</span>
                      <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-solana-purple transition-all duration-300"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-navy-950/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 bg-navy-900/80 text-[11px] font-semibold text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">Aluno</th>
                        <th className="p-3">CPF</th>
                        <th className="p-3">Curso / Título</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Carga</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Atestação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {batchData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-semibold text-white">{row.nome}</td>
                          <td className="p-3 font-mono text-[11px]">{row.cpf}</td>
                          <td className="p-3">{row.curso}</td>
                          <td className="p-3">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                              {row.tipo_documento}
                            </span>
                          </td>
                          <td className="p-3">{row.carga_horaria}h</td>
                          <td className="p-3">
                            {row.status === "PENDING" && (
                              <span className="text-slate-400 text-[11px]">Pronto</span>
                            )}
                            {row.status === "PROCESSING" && (
                              <span className="text-solana-purple text-[11px] flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Emitindo...
                              </span>
                            )}
                            {row.status === "SUCCESS" && (
                              <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Ancorado
                              </span>
                            )}
                            {row.status === "ERROR" && (
                              <span className="text-red-400 text-[11px] flex items-center gap-1" title={row.errorMsg}>
                                <XCircle className="h-3.5 w-3.5" /> Falha
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {row.tx ? (
                              <a
                                href={`https://explorer.solana.com/tx/${row.tx}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-solana-purple hover:underline font-mono text-[11px]"
                              >
                                Explorer <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: DIRETÓRIO DE ALUNOS MATRICULADOS */}
      {/* ABA 4: DIRETÓRIO DE ALUNOS MATRICULADOS */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={dict.university.studentSearchPlaceholder}
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-solana-purple focus:outline-none"
                />
              </div>

              {/* Filtro por Polo / Campus */}
              <select
                value={selectedCampusFilter}
                onChange={(e) => setSelectedCampusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-solana-purple focus:outline-none"
              >
                <option value="ALL">Todos os Polos / Campus</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowEnrollModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-solana-purple px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Matricular Aluno
            </button>
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
              Carregando diretório de alunos e históricos...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-2">
              <UserCheck className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs">Nenhum estudante matriculado encontrado com o filtro pesquisado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents
                .filter((stud) =>
                  selectedCampusFilter === "ALL" ? true : stud.campus?.id === selectedCampusFilter
                )
                .map((stud) => (
                  <div
                    key={stud.enrollment_id || stud.student_id || stud.id}
                    className="glass-panel rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-white text-sm block">{stud.full_name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {stud.course_name || "Curso Geral"} • Matrícula:{" "}
                            <strong className="text-slate-200">{stud.registration_number || "S/N"}</strong>
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            stud.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {stud.status === "ACTIVE" ? "Matrícula Ativa" : stud.status || "Ativo"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-navy-800 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                          <MapPin className="h-3 w-3 text-sky-400" />
                          {stud.campus?.name || "Campus Geral"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          CPF: {stud.cpf || "---"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 truncate">{stud.email}</p>
                      {stud.wallet && (
                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          Wallet: {stud.wallet}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={async () => {
                          if (!stud.email) return alert("Estudante sem e-mail cadastrado.");
                          try {
                            const res = await fetch("/api/institution/students", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                full_name: stud.full_name,
                                cpf: stud.cpf || "00000000000",
                                email: stud.email,
                                registration_number: stud.registration_number || "MATR",
                                course_name: stud.course_name || "Geral",
                                campus_id: stud.campus?.id || null,
                                send_email: true,
                              }),
                            });
                            if (res.ok) alert(`E-mail de acesso reenviado para ${stud.email}!`);
                            else alert("Erro ao reenviar e-mail.");
                          } catch (e: any) {
                            alert("Falha de conexão: " + e.message);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                        title="Reenviar e-mail de acesso ao passaporte"
                      >
                        <Mail className="h-3.5 w-3.5 text-solana-purple" />
                        Reenviar Acesso
                      </button>

                      <button
                        onClick={() => setSelectedStudentForHistory(stud)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-solana-purple" />
                        {dict.university.viewHistory}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 5: GESTÃO DE POLOS & CAMPUS */}
      {activeTab === "CAMPUSES" && (
        <div className="space-y-6 animate-in fade-in">
          {/* FORMULÁRIO DE CADASTRO DE NOVO CAMPUS */}
          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="h-5 w-5 text-solana-purple" />
              <div>
                <h3 className="font-bold text-white text-base">Cadastrar Novo Polo ou Campus</h3>
                <p className="text-xs text-slate-400">
                  Gerencie as unidades físicas ou polos EaD da sua instituição de ensino para vinculação de alunos e turmas.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCampus} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nome do Campus / Polo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campus Central"
                  value={newCampusName}
                  onChange={(e) => setNewCampusName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-solana-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Código e-MEC / Sigla
                </label>
                <input
                  type="text"
                  placeholder="Ex: POLO-01 / MEC-8492"
                  value={newCampusCode}
                  onChange={(e) => setNewCampusCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-solana-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: Montes Claros"
                  value={newCampusCity}
                  onChange={(e) => setNewCampusCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-solana-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">UF (Estado)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="MG"
                    value={newCampusState}
                    onChange={(e) => setNewCampusState(e.target.value.toUpperCase())}
                    className="w-20 rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:border-solana-purple focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingCampus || !newCampusName.trim()}
                    className="flex-1 rounded-xl bg-solana-purple px-4 py-2 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep transition-all disabled:opacity-50"
                  >
                    {savingCampus ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* LISTAGEM DE CAMPUS CADASTRADOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Polos e Unidades Cadastradas ({campuses.length})
            </h4>

            {loadingCampuses ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin text-solana-purple" />
                Carregando unidades...
              </div>
            ) : campuses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
                Nenhum campus ou polo cadastrado ainda. Use o formulário acima para registrar sua primeira unidade.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {campuses.map((c) => (
                  <div
                    key={c.id}
                    className="glass-panel rounded-2xl p-4 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            c.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {c.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {c.city ? `${c.city}${c.state ? ` - ${c.state}` : ""}` : "Unidade Central"}
                      </p>
                      {c.code && (
                        <p className="text-[10px] font-mono text-slate-500">Código: {c.code}</p>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-end">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/institution/campuses", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
                            });
                            if (res.ok) loadCampuses();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        {c.is_active ? "Desativar Polo" : "Ativar Polo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE MATRÍCULA DE ESTUDANTE (MULTI-TENANT) */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-solana-purple" />
                <h3 className="font-display text-lg font-bold text-white">Matricular Estudante</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {enrollFeedback && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {enrollFeedback}
              </div>
            )}

            <form onSubmit={handleEnrollStudent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nome Completo do Aluno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do estudante"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={enrollCpf}
                    onChange={(e) => setEnrollCpf(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    E-mail do Estudante *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aluno@email.com"
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Número de Matrícula *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 202610984"
                    value={enrollRegNum}
                    onChange={(e) => setEnrollRegNum(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Curso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Engenharia de Software"
                    value={enrollCourse}
                    onChange={(e) => setEnrollCourse(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Polo / Campus de Alocação
                </label>
                <select
                  value={enrollCampusId}
                  onChange={(e) => setEnrollCampusId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-purple focus:outline-none"
                >
                  <option value="">Campus Geral / Sede</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.city ? `(${c.city})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={enrollSendEmail}
                  onChange={(e) => setEnrollSendEmail(e.target.checked)}
                  className="rounded border-slate-700 bg-navy-900 text-solana-purple focus:ring-solana-purple"
                />
                <label htmlFor="sendEmailCheck" className="text-xs text-slate-300 select-none">
                  Disparar e-mail de acesso e boas-vindas com instruções do passaporte
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="rounded-xl bg-solana-purple px-5 py-2 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep transition-all disabled:opacity-50"
                >
                  {enrolling ? "Matriculando..." : "Confirmar Matrícula"}
                </button>
              </div>
            </form>
          </div>
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
                      <span className="text-[10px] text-solana-purple font-mono">
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
                      className="inline-flex items-center gap-1 text-solana-purple hover:underline text-[10px] font-mono pt-1"
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
