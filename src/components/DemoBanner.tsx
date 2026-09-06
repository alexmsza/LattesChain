"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, UserCheck, Building2, GitCompare } from "lucide-react";

export function DemoBanner() {
  return (
    <aside aria-label="Ambiente de Demonstração" className="w-full bg-gradient-to-r from-purple-950/90 via-navy-900 to-emerald-950/90 border-b border-solana-purple/30 py-2 px-4 text-xs">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-purple-200">
          <span className="flex h-2 w-2 rounded-full bg-solana-green animate-ping" />
          <span className="font-semibold text-white">Modo Demonstração (Hackathon Pitch Showcase):</span>
          <span className="text-slate-300 hidden sm:inline">
            Dados canônicos e cenários on-chain prontos para gravação e apresentação ao vivo.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/student"
            className="inline-flex items-center gap-1 rounded-lg bg-solana-purple/20 border border-solana-purple/40 px-2.5 py-1 text-[11px] font-bold text-purple-300 hover:bg-solana-purple/30 transition-all"
          >
            <UserCheck className="h-3 w-3" />
            🎓 1. Aluno (Passaporte)
          </Link>
          <Link
            href="/university"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-900/30 border border-blue-500/40 px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-900/50 transition-all"
          >
            <Building2 className="h-3 w-3" />
            🏛️ 2. IES (Emissor)
          </Link>
          <Link
            href="/validator"
            className="inline-flex items-center gap-1 rounded-lg bg-solana-green/15 border border-solana-green/40 px-2.5 py-1 text-[11px] font-bold text-solana-green hover:bg-solana-green/25 transition-all"
          >
            <ShieldCheck className="h-3 w-3" />
            🏢 3. RH / Empresas (Validador + IA)
          </Link>
          <Link
            href="/admin-protocol"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-900/30 border border-amber-500/40 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-900/50 transition-all"
          >
            <Sparkles className="h-3 w-3" />
            🛡️ 4. Protocolo (Admin)
          </Link>
        </div>
      </div>
    </aside>
  );
}
