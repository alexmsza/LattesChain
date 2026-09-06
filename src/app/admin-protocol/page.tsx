"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  Activity,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Users,
  Check,
  X,
  Clock,
  Search,
  Filter,
} from "lucide-react";

interface RegisteredInstitution {
  id: string;
  name: string;
  cnpj: string;
  solana_pubkey: string;
  is_verified: boolean;
  is_active: boolean;
  total_issued?: number;
}

interface UserProfile {
  user_id: string;
  role: "STUDENT" | "INSTITUTION" | "EMPLOYER";
  full_name: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  institution_name?: string;
  company_name?: string;
  phone?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
}

export default function AdminProtocolPage() {
  const [activeTab, setActiveTab] = useState<"institutions" | "users">("users");

  // State IES
  const [institutions, setInstitutions] = useState<RegisteredInstitution[]>([]);
  const [fetchingInst, setFetchingInst] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newPubkey, setNewPubkey] = useState("");
  const [loadingInst, setLoadingInst] = useState(false);
  const [instSuccessMsg, setInstSuccessMsg] = useState("");

  // State Usuários
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [userFilter, setUserFilter] = useState<string>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchInstitutions = async () => {
    try {
      const res = await fetch("/api/institutions");
      if (res.ok) {
        const data = await res.json();
        if (data.institutions) {
          setInstitutions(data.institutions);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar instituições:", err);
    } finally {
      setFetchingInst(false);
    }
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?status=${userFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    fetchUsers();
  }, [userFilter]);

  const handleRegisterInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCnpj || !newPubkey) {
      alert("Preencha todos os campos da instituição.");
      return;
    }

    setLoadingInst(true);
    try {
      const res = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          cnpj: newCnpj,
          solana_pubkey: newPubkey,
        }),
      });

      if (res.ok) {
        setInstSuccessMsg(`Instituição "${newName}" credenciada no protocolo com sucesso!`);
        setNewName("");
        setNewCnpj("");
        setNewPubkey("");
        fetchInstitutions();
        setTimeout(() => setInstSuccessMsg(""), 4000);
      } else {
        const errData = await res.json();
        alert(`Erro ao cadastrar instituição: ${errData.error || "Erro no servidor"}`);
      }
    } catch (err: any) {
      alert(`Falha ao conectar: ${err.message}`);
    } finally {
      setLoadingInst(false);
    }
  };

  const handleReviewUser = async (userId: string, action: "APPROVE" | "REJECT") => {
    let reason = "";
    if (action === "REJECT") {
      const promptReason = prompt("Informe a justificativa formal para a recusa do cadastro:");
      if (!promptReason) return;
      reason = promptReason;
    }

    setReviewingId(userId);
    setUserMsg(null);

    try {
      const res = await fetch("/api/admin/users/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUserMsg({ type: "error", text: data.error || "Falha ao revisar cadastro." });
        return;
      }

      setUserMsg({ type: "success", text: data.message });
      fetchUsers();
      setTimeout(() => setUserMsg(null), 5000);
    } catch (err: any) {
      setUserMsg({ type: "error", text: `Erro de conexão: ${err.message}` });
    } finally {
      setReviewingId(null);
    }
  };

  const totalEmitted = institutions.reduce((acc, i) => acc + (i.total_issued || 0), 0);
  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.cpf?.includes(term) ||
      u.cnpj?.includes(term) ||
      u.institution_name?.toLowerCase().includes(term) ||
      u.company_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/40 bg-purple-950/20 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-4">
          <Activity className="h-4 w-4 text-solana-green" />
          Master Registry & Protocol Governance
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Administração do Protocolo LattesChain
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Triagem de autoridades emissoras (IES), homologação de cadastros de estudantes/empresas e governança do ecossistema.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-slate-900/90 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "users"
                ? "bg-solana-green text-navy-950 shadow-md shadow-solana-green/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            Gestão de Cadastros
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-black px-2 py-0.5 text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("institutions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "institutions"
                ? "bg-solana-green text-navy-950 shadow-md shadow-solana-green/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Universidades Homologadas ({institutions.length})
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Users className="h-4 w-4 text-amber-400" />
            Cadastros Pendentes
          </div>
          <div className="font-display text-3xl font-extrabold text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Aguardando homologação</div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Building2 className="h-4 w-4 text-solana-green" />
            IES Credenciadas
          </div>
          <div className="font-display text-3xl font-extrabold text-white">
            {institutions.length}
          </div>
          <div className="text-[11px] text-solana-green mt-1">100% Homologadas On-Chain</div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Layers className="h-4 w-4 text-solana-purple" />
            Total de Atestações
          </div>
          <div className="font-display text-3xl font-extrabold text-solana-green">
            {totalEmitted.toLocaleString("pt-BR")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Registradas na Devnet / SAS</div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Database className="h-4 w-4 text-emerald-400" />
            Confiabilidade
          </div>
          <div className="font-display text-3xl font-extrabold text-emerald-400">100%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Zero fraudes detectadas</div>
        </div>
      </div>

      {/* FEEDBACK MESSAGES */}
      {userMsg && (
        <div
          className={`mb-6 rounded-2xl p-4 text-sm flex items-center gap-3 border ${
            userMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/50 border-red-500/40 text-red-300"
          }`}
        >
          {userMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{userMsg.text}</span>
        </div>
      )}

      {/* TAB 1: GESTÃO DE CADASTROS DE USUÁRIOS */}
      {activeTab === "users" && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-solana-green" />
                Fila de Homologação de Usuários
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aprove ou recuse solicitações de acesso de estudantes, universidades e empresas com 1 clique.
              </p>
            </div>

            {/* FILTROS & BUSCA */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-navy-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-solana-green focus:outline-none"
                />
              </div>

              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-navy-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-solana-green focus:outline-none"
              >
                <option value="PENDING">Pendentes</option>
                <option value="APPROVED">Aprovados</option>
                <option value="REJECTED">Reprovados</option>
                <option value="ALL">Todos os Status</option>
              </select>

              <button
                onClick={fetchUsers}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:text-white hover:bg-slate-800"
                title="Atualizar lista"
              >
                <RefreshCw className={`h-4 w-4 ${fetchingUsers ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* LISTAGEM DE USUÁRIOS */}
          <div className="space-y-4">
            {fetchingUsers ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin text-solana-green" />
                Carregando solicitações de cadastro...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400 text-sm">
                Nenhum usuário encontrado para o filtro selecionado ({userFilter}).
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.user_id}
                  className="rounded-2xl bg-navy-900/90 p-5 border border-slate-850 transition-all hover:border-slate-750"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-base">{u.full_name}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            u.role === "STUDENT"
                              ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                              : u.role === "INSTITUTION"
                              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {u.role === "STUDENT"
                            ? "Estudante"
                            : u.role === "INSTITUTION"
                            ? "Faculdade / IES"
                            : "Recrutador / RH"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : u.status === "REJECTED"
                              ? "bg-red-500/15 text-red-300 border border-red-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {u.status === "APPROVED"
                            ? "Aprovado"
                            : u.status === "REJECTED"
                            ? "Recusado"
                            : "Pendente"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>E-mail: <strong className="text-slate-200">{u.email}</strong></span>
                        {u.phone && <span>Tel: <strong className="text-slate-200">{u.phone}</strong></span>}
                        {u.cpf && <span>CPF: <strong className="font-mono text-slate-200">{u.cpf}</strong></span>}
                        {u.cnpj && <span>CNPJ: <strong className="font-mono text-slate-200">{u.cnpj}</strong></span>}
                        {u.institution_name && <span>IES: <strong className="text-slate-200">{u.institution_name}</strong></span>}
                        {u.company_name && <span>Empresa: <strong className="text-slate-200">{u.company_name}</strong></span>}
                        <span>Data: <strong className="text-slate-200">{new Date(u.created_at).toLocaleDateString("pt-BR")}</strong></span>
                      </div>

                      {u.rejected_reason && (
                        <p className="text-xs text-red-400 italic">
                          Motivo da recusa: {u.rejected_reason}
                        </p>
                      )}
                    </div>

                    {/* AÇÕES DE HOMOLOGAÇÃO */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      {u.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleReviewUser(u.user_id, "APPROVE")}
                            disabled={reviewingId === u.user_id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-solana-green px-4 py-2 text-xs font-bold text-navy-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-solana-green/20 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                            Aprovar Acesso
                          </button>
                          <button
                            onClick={() => handleReviewUser(u.user_id, "REJECT")}
                            disabled={reviewingId === u.user_id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-all disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                            Recusar
                          </button>
                        </>
                      )}

                      {u.status === "APPROVED" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Acesso Ativo
                        </span>
                      )}

                      {u.status === "REJECTED" && (
                        <button
                          onClick={() => handleReviewUser(u.user_id, "APPROVE")}
                          disabled={reviewingId === u.user_id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                        >
                          Reaprovar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UNIVERSIDADES HOMOLOGADAS */}
      {activeTab === "institutions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TABELA DE INSTITUIÇÕES */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-solana-green" />
                Instituições Emissoras Homologadas (Master Registry)
              </h2>
              <span className="text-xs text-slate-400">
                Programa SAS: <code className="font-mono text-solana-green">22zoJM...</code>
              </span>
            </div>

            <div className="space-y-3">
              {fetchingInst ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin text-solana-green" />
                  Carregando autoridades emissoras do banco de dados...
                </div>
              ) : institutions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-sm">
                  Nenhuma instituição homologada cadastrada no banco de dados ainda.
                </div>
              ) : (
                institutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="rounded-2xl bg-navy-900/80 p-4 border border-slate-800 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{inst.name}</span>
                          <span className="rounded-full bg-solana-green/10 border border-solana-green/30 px-2 py-0.5 text-[10px] font-semibold text-solana-green">
                            Ativa
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          CNPJ: <span className="font-mono text-slate-300">{inst.cnpj}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-1 truncate max-w-md">
                          Pubkey: {inst.solana_pubkey}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs font-bold text-solana-green block">
                            {inst.total_issued?.toLocaleString("pt-BR")}
                          </span>
                          <span className="text-[10px] text-slate-500">atestações</span>
                        </div>
                        <a
                          href={`https://explorer.solana.com/address/${inst.solana_pubkey}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white hover:bg-slate-800"
                          title="Ver conta da IES no Solana Explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CADASTRO DE NOVA IES */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-solana-purple" />
              Credenciar Nova Universidade
            </h3>
            <p className="text-xs text-slate-400">
              Associa o CNPJ oficial da IES à chave pública de assinatura no programa SAS da Solana.
            </p>

            {instSuccessMsg && (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {instSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRegisterInstitution} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome da Instituição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Universidade de Brasília (UnB)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-900/90 px-3.5 py-2 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">CNPJ Institucional *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-900/90 px-3.5 py-2 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Solana Public Key (Authority) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                  value={newPubkey}
                  onChange={(e) => setNewPubkey(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-navy-900/90 px-3.5 py-2 text-xs font-mono text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingInst}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 py-2.5 text-sm font-bold text-navy-900 hover:opacity-95 disabled:opacity-50"
              >
                {loadingInst ? "Registrando..." : "Homologar Instituição"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
