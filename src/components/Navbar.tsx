"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ShieldCheck, UserCheck, Building2, ExternalLink } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Início", icon: GraduationCap },
    { href: "/validator", label: "Validador RH", icon: ShieldCheck },
    { href: "/student", label: "Meu Passaporte", icon: UserCheck },
    { href: "/university", label: "Portal IES", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#080c14]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-solana-purple to-solana-green p-0.5 shadow-lg shadow-solana-green/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-navy-900 transition-colors group-hover:bg-navy-800">
              <GraduationCap className="h-5 w-5 text-solana-green" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Lattes<span className="text-solana-green">Chain</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">EduCore Protocol</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-solana-green/10 text-solana-green border border-solana-green/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-solana-green/30 bg-solana-green/10 px-3 py-1 text-xs font-semibold text-solana-green">
            <span className="h-2 w-2 rounded-full bg-solana-green animate-pulse" />
            Solana Devnet
          </div>
          <Link
            href="/validator"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-2 text-xs font-bold text-navy-900 shadow-md shadow-solana-green/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Validar Documento
          </Link>
        </div>
      </div>
    </header>
  );
}
