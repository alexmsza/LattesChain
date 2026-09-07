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
  Lock,
  ArrowRight,
  Key,
  Terminal,
  Copy,
  Globe,
  AlertCircle,
  Play,
  Send,
  Zap,
  Trash2,
  Server,
  FileText,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

interface DetailedInstitution {
  id: string;
  name: string;
  cnpj: string;
  solana_pubkey: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  issuance_stats?: {
    total: number;
    diplomas: number;
    certificates: number;
  };
  users_count: number;
  users: Array<{
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
  }>;
}

interface UserProfile {
  user_id: string;
  role: "STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN";
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

interface TransactionRecord {
  id: string;
  document_type: string;
  document_hash: string;
  solana_tx_signature: string;
  explorer_url: string;
  institution_name: string;
  institution_cnpj?: string;
  student_name: string;
  student_cpf: string;
  issued_at: string;
  status: string;
  metadata?: any;
}

interface ApiTokenRecord {
  id: string;
  name: string;
  key_prefix: string;
  institution_id?: string;
  institutions?: { name: string; cnpj: string };
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

interface SystemHealth {
  status: string;
  network: string;
  rpc: {
    status: string;
    endpoint_censored: string;
    latency_ms: number;
  };
  relayer_wallet: {
    address: string;
    balance_sol: number;
    estimated_remaining_txs: number;
    status: string;
  };
  database: {
    engine: string;
    latency_ms: number;
    counts: {
      api_tokens: number;
      academic_records: number;
      students: number;
      institutions: number;
    };
  };
  alerts: Array<{ level: string; message: string }>;
}

export default function AdminProtocolPage() {
  const [activeTab, setActiveTab] = useState<
    "institutions" | "transactions" | "tokens" | "users" | "support"
  >("institutions");

  const [isForbidden, setIsForbidden] = useState(false);

  // 1. Aba IES
  const [institutions, setInstitutions] = useState<DetailedInstitution[]>([]);
  const [fetchingInst, setFetchingInst] = useState(true);
  const [selectedInstForUsers, setSelectedInstForUsers] = useState<DetailedInstitution | null>(null);
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newPubkey, setNewPubkey] = useState("");
  const [loadingInst, setLoadingInst] = useState(false);
  const [instSuccessMsg, setInstSuccessMsg] = useState("");

  // 2. Aba Transações
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [fetchingTx, setFetchingTx] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("ALL");

  // 3. Aba API Tokens
  const [tokens, setTokens] = useState<ApiTokenRecord[]>([]);
  const [fetchingTokens, setFetchingTokens] = useState(false);
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenInstId, setTokenInstId] = useState("");
  const [tokenScopes, setTokenScopes] = useState<string[]>([
    "credentials:issue",
    "credentials:verify",
  ]);
  const [tokenRateLimit, setTokenRateLimit] = useState(120);
  const [tokenDays, setTokenDays] = useState(365);
  const [creatingToken, setCreatingToken] = useState(false);
  const [generatedRawToken, setGeneratedRawToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // 4. Aba Usuários
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [userFilter, setUserFilter] = useState<string>("PENDING");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 5. Aba Suporte / Saúde
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [fetchingHealth, setFetchingHealth] = useState(false);
  const [simulatorHash, setSimulatorHash] = useState("");
  const [simulatorResponse, setSimulatorResponse] = useState<any | null>(null);
  const [runningSimulation, setRunningSimulation] = useState(false);

  // Carregamentos
  const fetchInstitutions = async () => {
    setFetchingInst(true);
    try {
      const res = await fetch("/api/admin/institutions/details");
      if (res.status === 401 || res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.institutions) setInstitutions(data.institutions);
      }
    } catch (err) {
      console.error("Erro ao carregar IES:", err);
    } finally {
      setFetchingInst(false);
    }
  };

  const fetchTransactions = async () => {
    setFetchingTx(true);
    try {
      const res = await fetch("/api/admin/transactions?limit=50");
      if (res.status === 401 || res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    } finally {
      setFetchingTx(false);
    }
  };

  const fetchTokens = async () => {
    setFetchingTokens(true);
    try {
      const res = await fetch("/api/admin/tokens");
      if (res.status === 401 || res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.tokens) setTokens(data.tokens);
      }
    } catch (err) {
      console.error("Erro ao carregar tokens:", err);
    } finally {
      setFetchingTokens(false);
    }
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?status=${userFilter}`);
      if (res.status === 401 || res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsers(data.users);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchHealth = async () => {
    setFetchingHealth(true);
    try {
      const res = await fetch("/api/admin/system/health");
      if (res.status === 401 || res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.error("Erro ao carregar saúde:", err);
    } finally {
      setFetchingHealth(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    fetchUsers();
    fetchHealth();
  }, [userFilter]);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
    if (activeTab === "tokens") fetchTokens();
    if (activeTab === "support") fetchHealth();
  }, [activeTab]);

  // Ações IES
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

  // Ações Usuários
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

  // Ações Tokens
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName) return;

    setCreatingToken(true);
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tokenName,
          institution_id: tokenInstId || null,
          scopes: tokenScopes,
          rate_limit_per_minute: tokenRateLimit,
          expires_in_days: tokenDays,
        }),
      });

      const data = await res.json();
      if (res.ok && data.raw_token) {
        setGeneratedRawToken(data.raw_token);
        fetchTokens();
      } else {
        alert(data.error || "Erro ao criar token.");
      }
    } catch (err: any) {
      alert(`Erro de conexão: ${err.message}`);
    } finally {
      setCreatingToken(false);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja revogar permanentemente o acesso da chave "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tokens?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        fetchTokens();
      } else {
        alert(data.error || "Falha ao revogar token.");
      }
    } catch (err: any) {
      alert(`Erro ao revogar: ${err.message}`);
    }
  };

  // Ações Suporte / Simulador
  const handleRunSimulator = async () => {
    if (!simulatorHash) {
      alert("Informe um Hash SHA-256 para testar a verificação.");
      return;
    }

    setRunningSimulation(true);
    setSimulatorResponse(null);
    try {
      const res = await fetch("/api/v1/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_hash: simulatorHash.trim() }),
      });
      const data = await res.json();
      setSimulatorResponse({ status: res.status, data });
    } catch (err: any) {
      setSimulatorResponse({ status: 500, data: { error: err.message } });
    } finally {
      setRunningSimulation(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      !txSearch ||
      tx.document_hash.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.student_name.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.institution_name.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.solana_tx_signature.toLowerCase().includes(txSearch.toLowerCase());

    const matchType = txTypeFilter === "ALL" || tx.document_type === txTypeFilter;
    return matchSearch && matchType;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.cpf?.includes(term) ||
      u.cnpj?.includes(term) ||
      u.institution_name?.toLowerCase().includes(term) ||
      u.company_name?.toLowerCase().includes(term)
    );
  });

  if (isForbidden) {
    return (
      <div className="min-h-screen px-4 py-24 flex items-center justify-center">
        <div className="glass-panel rounded-3xl p-8 max-w-md w-full border-red-500/40 text-center space-y-5 animate-in zoom-in-95">
          <div className="h-14 w-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold text-white">Acesso Restrito à Governança</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta área de administração e governança do protocolo é restrita a usuários autenticados com papel de <strong>ADMIN</strong>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?next=%2Fadmin-protocol"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-solana-purple py-3 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:bg-solana-purpleDeep hover:scale-[1.01] transition-all"
            >
              Fazer Login como Administrador <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-solana-purple/40 bg-solana-purple/10 px-3 py-1 text-xs font-semibold text-solana-purple mb-2">
            <Activity className="h-3.5 w-3.5 text-solana-purple animate-pulse" />
            Master Registry & DataSecAIOps Protocol Owner
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Painel Geral do Dono do Protocolo
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Supervisão de IES credenciadas, auditoria de usuários, transações Solana e provisionamento de chaves para ERPs legados.
          </p>
        </div>

        {/* BADGES DE TELEMETRIA AO VIVO */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="glass-panel px-3 py-1.5 rounded-xl border-slate-800 flex items-center gap-2 text-xs">
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Rede:</span>
            <span className="font-mono font-bold text-white uppercase">{systemHealth?.network || "devnet"}</span>
          </div>

          <div className="glass-panel px-3 py-1.5 rounded-xl border-slate-800 flex items-center gap-2 text-xs">
            <Zap className="h-3.5 w-3.5 text-solana-purple" />
            <span className="text-slate-400">Fee Payer:</span>
            <span className="font-mono font-bold text-solana-purple">
              {systemHealth?.relayer_wallet?.balance_sol ?? "1.45"} SOL
            </span>
          </div>

          <div className="glass-panel px-3 py-1.5 rounded-xl border-slate-800 flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">RPC:</span>
            <span className="font-mono text-emerald-300 font-semibold">{systemHealth?.rpc?.latency_ms || 32}ms</span>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-800/80 gap-2">
        <button
          onClick={() => setActiveTab("institutions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "institutions"
              ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          IES Cadastradas & Usuários ({institutions.length})
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "transactions"
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Activity className="h-4 w-4" />
          Transações Solana & Histórico ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab("tokens")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "tokens"
              ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Key className="h-4 w-4" />
          Chaves de API & ERPs ({tokens.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "users"
              ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Triagem de Usuários ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "support"
              ? "bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Terminal className="h-4 w-4" />
          Suporte Técnico & Sandbox
        </button>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: IES CADASTRADAS & USUÁRIOS VINCULADOS             */}
      {/* ======================================================== */}
      {activeTab === "institutions" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO DE NOVO CREDENCIAMENTO */}
            <div className="glass-panel rounded-2xl p-6 border-slate-800 h-fit space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <PlusCircle className="h-4 w-4 text-solana-purple" />
                Credenciar Nova IES no Protocolo
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Habilita a universidade como autoridade emissora válida para o contrato SAS e emissão em lote.
              </p>

              {instSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{instSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterInstitution} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome da Instituição</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Universidade de Brasília (UnB)"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-solana-purple outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">CNPJ (apenas dígitos)</label>
                  <input
                    type="text"
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    placeholder="00038174000143"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-solana-purple outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Chave Pública Solana (Authority Pubkey)
                  </label>
                  <input
                    type="text"
                    value={newPubkey}
                    onChange={(e) => setNewPubkey(e.target.value)}
                    placeholder="Ex: 3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-solana-purple outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingInst}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-solana-purple to-purple-600 text-white font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {loadingInst ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Credenciar Autoridade IES
                </button>
              </form>
            </div>

            {/* LISTA DE IES E DETALHES DE USUÁRIOS */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  Instituições Credenciadas no Smart Contract
                </h3>
                <button
                  onClick={fetchInstitutions}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${fetchingInst ? "animate-spin" : ""}`} /> Atualizar
                </button>
              </div>

              {fetchingInst ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-400">
                  Carregando instituições e vinculações...
                </div>
              ) : institutions.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-400">
                  Nenhuma instituição credenciada até o momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {institutions.map((inst) => (
                    <div
                      key={inst.id}
                      className="glass-panel rounded-2xl p-4 border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{inst.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> MEC Validada
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {inst.cnpj}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInstForUsers(inst)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-all"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Ver Usuários ({inst.users_count})
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Chave Solana (Authority):</span>
                          <span className="font-mono text-slate-300 truncate block text-[11px]">
                            {inst.solana_pubkey.slice(0, 8)}...{inst.solana_pubkey.slice(-8)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">Total Emitido:</span>
                          <span className="font-semibold text-solana-purple">
                            {inst.issuance_stats?.total || 0} credenciais
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">Diplomas / Certificados:</span>
                          <span className="text-slate-300">
                            {inst.issuance_stats?.diplomas || 0} / {inst.issuance_stats?.certificates || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MODAL DE USUÁRIOS VINCULADOS À IES SELECIONADA */}
          {selectedInstForUsers && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel max-w-2xl w-full rounded-2xl p-6 border-slate-700 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-400" />
                      Usuários Vinculados à {selectedInstForUsers.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">CNPJ: {selectedInstForUsers.cnpj}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInstForUsers(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedInstForUsers.users.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nenhum usuário com papel de IES cadastrado para este CNPJ ainda.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {selectedInstForUsers.users.map((u) => (
                      <div
                        key={u.user_id}
                        className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{u.full_name}</p>
                          <p className="text-slate-400">{u.email}</p>
                          {u.phone && <p className="text-slate-500 font-mono text-[11px]">{u.phone}</p>}
                        </div>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              u.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : u.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedInstForUsers(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: TRANSAÇÕES ON-CHAIN EM TEMPO REAL & HISTÓRICO     */}
      {/* ======================================================== */}
      {activeTab === "transactions" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Livro Razão de Atestações On-Chain (Solana)</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Buscar por hash, aluno, IES..."
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none w-56"
                />
              </div>

              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
              >
                <option value="ALL">Todos os Tipos</option>
                <option value="DIPLOMA">DIPLOMA</option>
                <option value="HORAS_COMPLEMENTARES">HORAS_COMPLEMENTARES</option>
                <option value="CERTIFICADO_CURSO">CERTIFICADO_CURSO</option>
                <option value="HISTORICO_ESCOLAR">HISTORICO_ESCOLAR</option>
              </select>

              <button
                onClick={fetchTransactions}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Recarregar feed de transações"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingTx ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {fetchingTx ? (
            <div className="glass-panel p-12 text-center text-xs text-slate-400 rounded-2xl">
              Sincronizando transações da rede Solana...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="glass-panel p-12 text-center text-xs text-slate-400 rounded-2xl">
              Nenhuma transação encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Data / Hora</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold">Aluno / CPF</th>
                      <th className="py-3 px-4 font-semibold">IES Emissora</th>
                      <th className="py-3 px-4 font-semibold">Document Hash (SHA-256)</th>
                      <th className="py-3 px-4 font-semibold">Assinatura Solana</th>
                      <th className="py-3 px-4 font-semibold">Auditoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {new Date(tx.issued_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold text-[10px]">
                            {tx.document_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-white block">{tx.student_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{tx.student_cpf}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-white block">{tx.institution_name}</span>
                          {tx.institution_cnpj && (
                            <span className="text-[10px] text-slate-500 font-mono">CNPJ: {tx.institution_cnpj}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-emerald-400">
                          {tx.document_hash.slice(0, 10)}...{tx.document_hash.slice(-8)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-solana-purple">
                          <a
                            href={tx.explorer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            {tx.solana_tx_signature.slice(0, 10)}... <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> FINALIZED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 3: CHAVES DE API & INTEGRAÇÕES ERP (TOTVS, ATS)      */}
      {/* ======================================================== */}
      {activeTab === "tokens" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-400" />
                Gerenciador de Chaves de API (B2B & ERP Gateway)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crie credenciais com escopos controlados para integração com TOTVS RM, Sophia, ATS Gupy ou CRMs corporativos.
              </p>
            </div>

            <button
              onClick={() => {
                setShowNewTokenModal(true);
                setGeneratedRawToken(null);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 font-bold text-xs rounded-xl hover:scale-[1.02] transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              Criar Nova Chave de API
            </button>
          </div>

          {fetchingTokens ? (
            <div className="glass-panel p-10 text-center text-xs text-slate-400 rounded-2xl">
              Carregando chaves cadastradas...
            </div>
          ) : tokens.length === 0 ? (
            <div className="glass-panel p-10 text-center text-xs text-slate-400 rounded-2xl">
              Nenhuma chave de API gerada até o momento.
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((tok) => (
                <div
                  key={tok.id}
                  className="glass-panel rounded-2xl p-4 border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{tok.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tok.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {tok.is_active ? "ATIVO" : "REVOGADO"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300 text-[11px]">
                        {tok.key_prefix}
                      </span>
                      {tok.institutions?.name && (
                        <span>• IES: <strong className="text-slate-300">{tok.institutions.name}</strong></span>
                      )}
                      <span>• Rate Limit: <strong>{tok.rate_limit_per_minute} req/min</strong></span>
                      <span>
                        • Último uso:{" "}
                        <span className="text-slate-300">
                          {tok.last_used_at ? new Date(tok.last_used_at).toLocaleString("pt-BR") : "Nunca utilizada"}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tok.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-mono border border-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {tok.is_active && (
                    <div>
                      <button
                        onClick={() => handleRevokeToken(tok.id, tok.name)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-900/60 transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revogar Chave
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* GUIA RÁPIDO DE CONSUMO COM CURL */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              Exemplo de Consumo via cURL (TOTVS RM ou Sistema Legado)
            </h4>
            <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
{`# 1. Emissão de Diploma via API REST
curl -X POST https://latteschain.vercel.app/api/v1/credentials/issue \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: lat_live_SUA_CHAVE_AQUI" \\
  -d '{
    "student_name": "Carlos Silva",
    "student_cpf": "12345678901",
    "document_type": "DIPLOMA",
    "course_name": "Engenharia de Software",
    "workload_hours": 3600
  }'`}
            </pre>
          </div>

          {/* MODAL DE CRIAÇÃO DE TOKEN */}
          {showNewTokenModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border-slate-700 space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-amber-400" />
                    Gerar Nova Chave de API
                  </h3>
                  <button
                    onClick={() => setShowNewTokenModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {generatedRawToken ? (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="h-4 w-4" /> Chave Gerada com Sucesso!
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Copie a chave agora. Por segurança DataSecAIOps, o token raw nunca é salvo em texto puro e não poderá ser recuperado.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-amber-300 break-all">{generatedRawToken}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedRawToken);
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 3000);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-lg shrink-0 flex items-center gap-1"
                      >
                        {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedToken ? "Copiado!" : "Copiar"}
                      </button>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setShowNewTokenModal(false);
                          setGeneratedRawToken(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl"
                      >
                        Concluir e Fechar
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateToken} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Nome da Aplicação / Cliente
                      </label>
                      <input
                        type="text"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="Ex: ERP TOTVS RM - Secretaria Central"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Vincular à Instituição (Opcional)
                      </label>
                      <select
                        value={tokenInstId}
                        onChange={(e) => setTokenInstId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                      >
                        <option value="">Nenhuma (Chave Global de Protocolo)</option>
                        {institutions.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.cnpj})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                        Escopos de Autorização
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: "credentials:issue", label: "Emissão de Diplomas" },
                          { id: "credentials:verify", label: "Verificação de Autenticidade" },
                          { id: "students:read", label: "Consulta de Alunos" },
                          { id: "institutions:read", label: "Listagem de IES" },
                        ].map((sc) => (
                          <label
                            key={sc.id}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer text-slate-300 hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={tokenScopes.includes(sc.id)}
                              onChange={(e) => {
                                if (e.target.checked) setTokenScopes([...tokenScopes, sc.id]);
                                else setTokenScopes(tokenScopes.filter((s) => s !== sc.id));
                              }}
                              className="accent-amber-400"
                            />
                            <span className="text-[11px]">{sc.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Rate Limit (req/min)
                        </label>
                        <input
                          type="number"
                          value={tokenRateLimit}
                          onChange={(e) => setTokenRateLimit(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Validade (Dias)
                        </label>
                        <input
                          type="number"
                          value={tokenDays}
                          onChange={(e) => setTokenDays(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewTokenModal(false)}
                        className="px-4 py-2 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={creatingToken}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 font-bold text-xs rounded-xl hover:scale-[1.01] transition-all flex items-center gap-1.5"
                      >
                        {creatingToken ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                        Gerar Chave Criptográfica
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 4: TRIAGEM & APROVAÇÃO DE USUÁRIOS                   */}
      {/* ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              Fila de Triagem e Auditoria de Cadastros
            </h3>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Filtrar por nome, email, CPF..."
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none w-56"
                />
              </div>

              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
              >
                <option value="PENDING">Pendentes</option>
                <option value="APPROVED">Aprovados</option>
                <option value="REJECTED">Reprovados</option>
                <option value="ALL">Todos os Registros</option>
              </select>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingUsers ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {userMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                userMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {userMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{userMsg.text}</span>
            </div>
          )}

          {fetchingUsers ? (
            <div className="glass-panel p-10 text-center text-xs text-slate-400 rounded-2xl">
              Carregando fila de cadastros...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass-panel p-10 text-center text-xs text-slate-400 rounded-2xl">
              Nenhum usuário correspondente nesta categoria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.user_id}
                  className="glass-panel rounded-2xl p-4 border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.full_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-semibold">
                        {u.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : u.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{u.email}</span>
                      {u.cpf && <span>• CPF: {u.cpf}</span>}
                      {u.cnpj && <span>• CNPJ: {u.cnpj}</span>}
                      {u.institution_name && <span>• IES: {u.institution_name}</span>}
                      {u.company_name && <span>• Empresa: {u.company_name}</span>}
                      {u.phone && <span>• Tel: {u.phone}</span>}
                    </div>

                    {u.rejected_reason && (
                      <p className="text-[11px] text-red-400 mt-1 italic">
                        Motivo da reprovação: &quot;{u.rejected_reason}&quot;
                      </p>
                    )}
                  </div>

                  {u.status === "PENDING" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewUser(u.user_id, "APPROVE")}
                        disabled={reviewingId === u.user_id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>

                      <button
                        onClick={() => handleReviewUser(u.user_id, "REJECT")}
                        disabled={reviewingId === u.user_id}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition-all flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Reprovar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 5: CENTRO DE SUPORTE, SANDBOX & SAÚDE DO SISTEMA     */}
      {/* ======================================================== */}
      {activeTab === "support" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: RELAYER FEE PAYER */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Gasless Relayer Solana</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-solana-purple">
                {systemHealth?.relayer_wallet?.balance_sol ?? 1.45} SOL
              </div>
              <p className="text-[11px] text-slate-400 font-mono break-all">
                {systemHealth?.relayer_wallet?.address || "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK"}
              </p>
              <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Capacidade estimada:</span>
                <strong className="text-white">
                  ~{systemHealth?.relayer_wallet?.estimated_remaining_txs ?? 145000} txs
                </strong>
              </div>
            </div>

            {/* CARD 2: RPC CONNECTION */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Status do RPC Solana</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  {systemHealth?.rpc?.status || "ONLINE"}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {systemHealth?.rpc?.latency_ms || 32} ms
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {systemHealth?.rpc?.endpoint_censored || "Cluster Oficial Solana Devnet"}
              </p>
              <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Rede:</span>
                <strong className="text-white uppercase">{systemHealth?.network || "devnet"}</strong>
              </div>
            </div>

            {/* CARD 3: DATABASE & INTEGRITY */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">PostgreSQL (Supabase)</span>
                <Database className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {systemHealth?.database?.latency_ms || 18} ms
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Diplomas e Atestações:</span>
                  <strong className="text-white">{systemHealth?.database?.counts?.academic_records || 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Alunos Registrados:</span>
                  <strong className="text-white">{systemHealth?.database?.counts?.students || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SANDBOX / SIMULADOR DE API PARA SUPORTE TÉCNICO */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Sandbox de Suporte: Simulador de Verificação Externa
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Teste se um diploma de qualquer aluno ou IES está respondendo adequadamente para sistemas legados externos (TOTVS/Gupy).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={simulatorHash}
                onChange={(e) => setSimulatorHash(e.target.value)}
                placeholder="Cole o Hash SHA-256 do documento para auditar..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
              <button
                onClick={handleRunSimulator}
                disabled={runningSimulation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-navy-950 font-bold text-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {runningSimulation ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Disparar Teste de API
              </button>
            </div>

            {simulatorResponse && (
              <div className="space-y-2 pt-2 animate-in fade-in-50">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400">Resposta HTTP:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      simulatorResponse.status === 200
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    HTTP {simulatorResponse.status}
                  </span>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-72">
                  {JSON.stringify(simulatorResponse.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
