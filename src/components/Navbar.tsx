"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Building2,
  LogIn,
  LogOut,
  UserCircle2,
  Loader2,
  Activity,
} from "lucide-react";
import { useSession } from "@/lib/useSession";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  INSTITUTION: "/university",
  EMPLOYER: "/validator",
  ADMIN: "/admin-protocol",
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, profile, loading, signOut } = useSession();

  const navItems = [
    { href: "/", label: "Início", icon: GraduationCap, public: true },
    { href: "/validator", label: "Validador RH", icon: ShieldCheck, public: true },
    { href: "/student", label: "Meu Passaporte", icon: UserCheck, public: false },
    { href: "/university", label: "Portal IES", icon: Building2, public: false },
    { href: "/admin-protocol", label: "Protocolo", icon: Activity, public: false },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const roleHome = profile ? ROLE_HOME[profile.role] || "/" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0e0a18]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-solana-purple to-solana-green p-0.5 shadow-lg shadow-solana-purple/20">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-navy-900 transition-colors group-hover:bg-navy-800">
              <GraduationCap className="h-5 w-5 text-solana-purple" />
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
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-solana-purple/10 text-solana-purple border border-solana-purple/30"
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

          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <Link
                href={roleHome}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-800/60 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-solana-green/40 hover:text-white"
                title={profile?.email || session.user.email}
              >
                <UserCircle2 className="h-4 w-4 text-solana-green" />
                <span className="max-w-[140px] truncate">
                  {profile?.full_name?.split(" ")[0] || "Conta"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-red-400/50 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-4 py-2 text-xs font-bold text-white shadow-md shadow-solana-purple/25 transition-all hover:bg-solana-purpleDeep hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
