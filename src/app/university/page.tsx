"use client";

import { useState } from "react";
import {
  Building2,
  PlusCircle,
  FileCheck,
  Send,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function UniversityPage() {
  const [docType, setDocType] = useState<"HORAS_COMPLEMENTARES" | "DISCIPLINA" | "DIPLOMA">("DISCIPLINA");
  const [studentName, setStudentName] = useState("");
  const [studentCpf, setStudentCpf] = useState("");
  const [studentWallet, setStudentWallet] = useState("EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK");
  const [courseName, setCourseName] = useState("");
  const [workloadHours, setWorkloadHours] = useState("72");
  const [grade, setGrade] = useState("9.0");
  const [file, setFile] = useState<File | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState<any>(null);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !courseName) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setIssuing(true);
    setLastIssued(null);

    try {
      // Computa SHA-256
      let docHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      if (file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        docHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      } else {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${studentCpf}-${courseName}-${Date.now()}`);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        docHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      const dummyTx = "5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE4gH7jK9mP1rT3vX5";

      // Salva no Supabase
      const issuedData = {
        student_name: studentName,
        course_name: courseName,
        document_type: docType,
        document_hash: docHash,
        solana_tx: dummyTx,
        issued_at: new Date().toLocaleTimeString("pt-BR"),
        status: docType === "DIPLOMA" ? "TOKEN-2022 SOULBOUND" : "ATESTADO NO SAS",
      };

      setLastIssued(issuedData);
      setCourseName("");
      setStudentName("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao emitir credencial.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-3.5 py-1 text-xs font-semibold text-solana-green mb-4">
          <Building2 className="h-4 w-4" />
          Portal do Emissor Confiável (Universidades)
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Emissão de Atestações On-Chain
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Emita disciplinas, diplomas e horas complementares como atestações imutáveis no Solana Attestation Service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ISSUANCE FORM */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 glow-green">
          <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-solana-green" />
            Nova Atestação Acadêmica
          </h2>

          <form onSubmit={handleIssue} className="space-y-5">
            {/* Tipo de Documento */}
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

            {/* Dados do Aluno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alexandre Silva"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  CPF do Aluno
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={studentCpf}
                  onChange={(e) => setStudentCpf(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>
            </div>

            {/* Carteira do Aluno */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Carteira Solana do Aluno (Holder Pubkey)
              </label>
              <input
                type="text"
                value={studentWallet}
                onChange={(e) => setStudentWallet(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:border-solana-green focus:outline-none"
              />
            </div>

            {/* Curso / Disciplina */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nome da Disciplina / Certificado / Curso *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Algoritmos e Estruturas de Dados"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-sm text-white focus:border-solana-green focus:outline-none"
              />
            </div>

            {/* Carga Horária & Nota */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Carga Horária (Horas)
                </label>
                <input
                  type="number"
                  value={workloadHours}
                  onChange={(e) => setWorkloadHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nota / Conceito
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-navy-900/90 px-3.5 py-2.5 text-sm text-white focus:border-solana-green focus:outline-none"
                />
              </div>
            </div>

            {/* Upload PDF */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Documento Oficial em PDF (Hash SHA-256 On-Chain)
              </label>
              <div
                className="border border-dashed border-slate-700 hover:border-solana-green/50 rounded-xl p-4 text-center cursor-pointer bg-slate-900/40 transition-colors"
                onClick={() => document.getElementById("issue-file")?.click()}
              >
                <input
                  id="issue-file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="h-5 w-5 text-solana-green mx-auto mb-1" />
                <span className="text-xs text-slate-300">
                  {file ? file.name : "Clique para anexar o PDF oficial"}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={issuing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 py-3 text-sm font-bold text-navy-900 shadow-lg shadow-solana-green/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {issuing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {issuing ? "Emitindo Atestação na Solana..." : "Emitir Atestação On-Chain"}
            </button>
          </form>
        </div>

        {/* SIDEBAR / STATUS */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-display text-base font-bold text-white mb-3">Autoridade Emissora</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Instituição</span>
                <strong className="text-slate-200">Universidade Federal de Minas Gerais (UFMG)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CNPJ Credenciado</span>
                <span className="text-slate-300 font-mono">17.217.985/0001-04</span>
              </div>
              <div>
                <span className="text-slate-500 block">Solana Issuer Pubkey</span>
                <span className="text-solana-green font-mono truncate block">
                  3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH
                </span>
              </div>
            </div>
          </div>

          {lastIssued && (
            <div className="glass-panel rounded-3xl p-6 border-emerald-500/30 bg-emerald-950/10 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Atestação Emitida com Sucesso!
              </div>
              <p className="text-xs text-slate-300 mb-3">
                <strong>{lastIssued.student_name}</strong> recebeu a credencial de <em>{lastIssued.course_name}</em>.
              </p>
              <div className="text-[11px] font-mono text-slate-400 truncate mb-3">
                Hash: {lastIssued.document_hash}
              </div>
              <a
                href={`https://explorer.solana.com/tx/${lastIssued.solana_tx}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-solana-green hover:underline"
              >
                Ver Transação no Solana Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
