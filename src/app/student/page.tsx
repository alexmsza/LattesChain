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
} from "lucide-react";

function StudentContent() {
  const searchParams = useSearchParams();
  const walletQuery = searchParams.get("wallet");
  const cpfQuery = searchParams.get("cpf");

  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedRecordForQR, setSelectedRecordForQR] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [studentData, setStudentData] = useState({
    name: "Alexandre Silva",
    course: "Ciência da Computação",
    university: "Universidade Federal de Minas Gerais (UFMG)",
    solanaWallet: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
    totalHours: 180,
    requiredHours: 200,
    records: [] as any[],
  });

  useEffect(() => {
    async function loadStudentData() {
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
    }

    loadStudentData();
  }, [walletQuery, cpfQuery]);

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
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 mb-8 glow-purple">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-solana-purple to-solana-green p-0.5 shadow-lg">
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
                <span className="text-slate-300">{studentData.solanaWallet.substring(0, 16)}...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedRecordForQR(null);
                setShowQR(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              <QrCode className="h-4 w-4 text-solana-purple" />
              QR Code Geral
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-solana-purpleDeep hover:scale-[1.02] transition-all"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Link Copiado!" : "Compartilhar Passaporte"}
            </button>
          </div>
        </div>

        {/* PROGRESS METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
          <div className="rounded-2xl bg-navy-900/60 p-4 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Horas de Extensão / Complementares</span>
            <div className="font-display text-2xl font-bold text-solana-purple">
              {studentData.totalHours} / {studentData.requiredHours} h
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-solana-purple to-solana-green h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((studentData.totalHours / studentData.requiredHours) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900/60 p-4 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Atestações no SAS</span>
            <div className="font-display text-2xl font-bold text-white">
              {studentData.records.length} Credenciais
            </div>
            <span className="text-xs text-emerald-400 font-medium">100% Verificadas On-Chain</span>
          </div>

          <div className="rounded-2xl bg-navy-900/60 p-4 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Status do Diploma</span>
            <div className="font-display text-2xl font-bold text-amber-400">
              {studentData.records.some((r) => r.type === "DIPLOMA")
                ? "Emitido (Soulbound)"
                : "Apto para Colação"}
            </div>
            <span className="text-xs text-slate-400">Token-2022 Intransferível</span>
          </div>
        </div>
      </div>

      {/* CREDENTIALS TIMELINE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-solana-purple" />
            Credenciais & Atestações Registradas
          </h2>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-solana-purple" />
              Sincronizando...
            </div>
          )}
        </div>

        <div className="space-y-4">
          {studentData.records.map((record) => (
            <div
              key={record.id}
              className="glass-panel rounded-2xl p-6 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        record.type === "DIPLOMA"
                          ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                          : "bg-solana-green/10 text-solana-green border-solana-green/30"
                      }`}
                    >
                      {record.status}
                    </span>
                    <span className="text-xs text-slate-400">{record.date}</span>
                    {record.grade && (
                      <span className="text-xs text-slate-300 font-mono">
                        • Nota: {record.grade}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">{record.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Emissor: <strong className="text-slate-300">{record.institution}</strong>
                    {record.hours && ` • Carga Horária: ${record.hours}h`}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-md">
                    Hash: {record.hash}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setSelectedRecordForQR(record);
                      setShowQR(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <QrCode className="h-3.5 w-3.5 text-solana-purple" />
                    QR
                  </button>
                  <Link
                    href={`/validator?hash=${record.hash}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-solana-purple/40 bg-solana-purple/15 px-3 py-2 text-xs font-bold text-solana-purple hover:bg-solana-purple/25"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Validar no RH
                  </Link>
                  <a
                    href={`https://explorer.solana.com/tx/${record.tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    Ver na Solana
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR CODE MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-sm w-full text-center border-solana-purple/30 glow-purple animate-in fade-in zoom-in-95">
            <ShieldCheck className="h-10 w-10 text-solana-purple mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-white mb-1">
              {selectedRecordForQR ? "Validação Específica" : "Passaporte Acadêmico"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {selectedRecordForQR
                ? `QR Code apontando para o hash ${selectedRecordForQR.title}`
                : "Apresente para recrutadores validarem seu passaporte instantaneamente."}
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl mb-4">
              <div className="h-44 w-44 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
                <QrCode className="h-28 w-28 text-solana-purple" />
                <span className="text-[9px] font-mono text-slate-400 mt-2 truncate w-full">
                  {selectedRecordForQR ? selectedRecordForQR.hash.substring(0, 18) + "..." : studentData.solanaWallet.substring(0, 18) + "..."}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(false)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Carregando passaporte acadêmico...
        </div>
      }
    >
      <StudentContent />
    </Suspense>
  );
}
