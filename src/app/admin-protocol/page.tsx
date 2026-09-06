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

export default function AdminProtocolPage() {
  const [institutions, setInstitutions] = useState<RegisteredInstitution[]>([
    {
      id: "inst-ufmg",
      name: "Universidade Federal de Minas Gerais (UFMG)",
      cnpj: "17.217.985/0001-04",
      solana_pubkey: "3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH",
      is_verified: true,
      is_active: true,
      total_issued: 1420,
    },
    {
      id: "inst-usp",
      name: "Universidade de São Paulo (USP)",
      cnpj: "63.025.530/0001-04",
      solana_pubkey: "7yW1J9kLmNoPqRsTuVwXyZ1234567890abcdef12345",
      is_verified: true,
      is_active: true,
      total_issued: 2890,
    },
    {
      id: "inst-puc",
      name: "Pontifícia Universidade Católica de Minas Gerais (PUC Minas)",
      cnpj: "17.178.195/0001-67",
      solana_pubkey: "9zX2K0mNoPqRsTuVwXyZ1234567890abcdef1234567",
      is_verified: true,
      is_active: true,
      total_issued: 850,
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newPubkey, setNewPubkey] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCnpj || !newPubkey) {
      alert("Preencha todos os campos da instituição.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newInst: RegisteredInstitution = {
        id: `inst-${Date.now()}`,
        name: newName,
        cnpj: newCnpj,
        solana_pubkey: newPubkey,
        is_verified: true,
        is_active: true,
        total_issued: 0,
      };

      setInstitutions((prev) => [newInst, ...prev]);
      setNewName("");
      setNewCnpj("");
      setNewPubkey("");
      setSuccessMsg(`Instituição "${newInst.name}" credenciada no protocolo com sucesso!`);
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 600);
  };

  const totalEmitted = institutions.reduce((acc, i) => acc + (i.total_issued || 0), 0);

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
          Gestão descentralizada de autoridades emissoras (IES), monitoramento de contratos inteligentes SAS e conformidade regulatória.
        </p>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Building2 className="h-4 w-4 text-solana-green" />
            IES Credenciadas
          </div>
          <div className="font-display text-3xl font-extrabold text-white">
            {institutions.length}
          </div>
          <div className="text-[11px] text-solana-green mt-1">100% Homologadas MEC / On-Chain</div>
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
            <Cpu className="h-4 w-4 text-amber-400" />
            Custo Médio / Transação
          </div>
          <div className="font-display text-3xl font-extrabold text-amber-400">&lt; R$ 0,005</div>
          <div className="text-[11px] text-slate-400 mt-1">Economia de 99.9% vs. Cartório</div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Database className="h-4 w-4 text-emerald-400" />
            Taxa de Fraude Detectada
          </div>
          <div className="font-display text-3xl font-extrabold text-emerald-400">0.00%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Imutabilidade Criptográfica</div>
        </div>
      </div>

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
            {institutions.map((inst) => (
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
            ))}
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

          {successMsg && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome da Instituição *</label>
              <input
                type="text"
                required
                placeholder="Ex: Universidade de Brasília (UnB)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-green focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">CNPJ Oficial *</label>
              <input
                type="text"
                required
                placeholder="00.000.000/0001-00"
                value={newCnpj}
                onChange={(e) => setNewCnpj(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs text-white focus:border-solana-green focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Solana Authority Pubkey *</label>
              <input
                type="text"
                required
                placeholder="Chave Base58 da carteira da IES..."
                value={newPubkey}
                onChange={(e) => setNewPubkey(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3 py-2 text-xs font-mono text-white focus:border-solana-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-purple to-solana-green py-2.5 text-xs font-bold text-white shadow-md shadow-solana-purple/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {loading ? "Registrando no Master Registry..." : "Homologar IES no Protocolo"}
            </button>
          </form>

          <div className="rounded-xl bg-navy-900/60 p-3 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Regras de Segurança Protocolar:</div>
            <div>• Somente o Master Authority pode homologar novas IES.</div>
            <div>• Revogações exigem prova criptográfica assinada pela IES.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
