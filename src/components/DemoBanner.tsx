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

        <div className="flex items-center gap-2">
          <Link
            href="/validator"
            className="inline-flex items-center gap-1 rounded-lg bg-solana-green/15 border border-solana-green/40 px-2 py-0.5 text-[11px] font-bold text-solana-green hover:bg-solana-green/25"
          >
            <ShieldCheck className="h-3 w-3" />
            1. Validador RH
          </Link>
          <Link
            href="/student"
            className="inline-flex items-center gap-1 rounded-lg bg-solana-purple/20 border border-solana-purple/40 px-2 py-0.5 text-[11px] font-bold text-purple-300 hover:bg-solana-purple/30"
          >
            <UserCheck className="h-3 w-3" />
            2. Passaporte
          </Link>
          <Link
            href="/university"
            className="inline-flex items-center gap-1 rounded-lg bg-navy-800 border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Building2 className="h-3 w-3" />
            3. Emissor IES
          </Link>
        </div>
      </div>
    </aside>
  );
}
