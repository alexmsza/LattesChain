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
  Info,
  Tag,
  Presentation,
  Palette,
} from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { useTheme } from "@/lib/theme/ThemeContext";

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
  const { language, setLanguage, dict } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const baseNavItems = [
    { href: "/", label: dict.nav.home, icon: GraduationCap },
    { href: "/validator", label: dict.nav.validator, icon: ShieldCheck },
    { href: "/student", label: dict.nav.student, icon: UserCheck },
    { href: "/university", label: dict.nav.university, icon: Building2 },
    { href: "/pitch", label: (dict.nav as any).pitch || "Pitch", icon: Presentation },
    { href: "/sobre", label: dict.nav.about, icon: Info },
    { href: "/precos", label: dict.nav.pricing, icon: Tag },
  ];

  const navItems =
    profile?.role === "ADMIN"
      ? [
          ...baseNavItems.slice(0, 4),
          { href: "/admin-protocol", label: dict.nav.protocol, icon: Activity },
          ...baseNavItems.slice(4),
        ]
      : baseNavItems;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const roleHome = profile ? ROLE_HOME[profile.role] || "/" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[var(--header-bg)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-solana-purple to-solana-green p-0.5 shadow-lg shadow-solana-purple/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-navy-900 transition-colors group-hover:bg-navy-800">
              <GraduationCap
                className={`h-5 w-5 transition-colors duration-300 ${
                  theme === "purple" ? "text-solana-purple" : "text-solana-green"
                }`}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Lattes
              <span
                className={`transition-colors duration-300 ${
                  theme === "purple" ? "text-solana-purple" : "text-solana-green"
                }`}
              >
                Chain
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Edu Core Protocol
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? theme === "purple"
                      ? "bg-solana-purple/15 text-solana-purple border border-solana-purple/30 font-semibold"
                      : "bg-solana-green/10 text-solana-green border border-solana-green/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* COLOR THEME SWITCHER */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-navy-900/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all shadow-sm group"
            title={
              language === "en"
                ? `Color theme: ${theme === "purple" ? "Elementus Purple" : "Solana Emerald"}. Click to toggle.`
                : language === "es"
                ? `Tema de color: ${theme === "purple" ? "Elementus Púrpura" : "Solana Esmeralda"}. Clic para alternar.`
                : `Tema de cores: ${theme === "purple" ? "Elementus Purple" : "Solana Emerald"}. Clique para alternar.`
            }
            aria-label="Alternar tema de cores"
          >
            <Palette
              className={`h-3.5 w-3.5 transition-colors duration-300 ${
                theme === "purple" ? "text-solana-purple" : "text-solana-green"
              }`}
            />
            <span className="hidden md:inline capitalize">
              {theme === "purple" ? "Purple" : "Emerald"}
            </span>
            <span
              className="h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-125"
              style={{
                backgroundColor: theme === "purple" ? "#8a33f5" : "#14F195",
                boxShadow:
                  theme === "purple"
                    ? "0 0 8px rgba(138, 51, 245, 0.7)"
                    : "0 0 8px rgba(20, 241, 149, 0.7)",
              }}
            />
          </button>

          {/* LANGUAGE SELECTOR */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-navy-900/80 p-0.5 text-[11px] font-semibold">
            {(["pt", "en", "es"] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-lg px-2 py-1 uppercase transition-all ${
                  language === lang
                    ? theme === "purple"
                      ? "bg-solana-purple text-white font-bold shadow-sm"
                      : "bg-solana-green text-navy-900 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title={`Mudar idioma para ${lang.toUpperCase()}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              theme === "purple"
                ? "border-solana-purple/30 bg-solana-purple/10 text-solana-purple"
                : "border-solana-green/30 bg-solana-green/10 text-solana-green"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                theme === "purple" ? "bg-solana-purple" : "bg-solana-green"
              }`}
            />
            Devnet
          </div>

          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : session ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={roleHome}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-navy-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-solana-purple/40 hover:text-white"
                title={profile?.email || session.user.email}
              >
                <UserCircle2
                  className={`h-3.5 w-3.5 ${
                    theme === "purple" ? "text-solana-purple" : "text-solana-green"
                  }`}
                />
                <span className="max-w-[100px] truncate">
                  {profile?.full_name?.split(" ")[0] || "Conta"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 rounded-xl border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-red-400/50 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                theme === "purple"
                  ? "bg-solana-purple text-white shadow-md shadow-solana-purple/30 hover:bg-solana-purpleDeep"
                  : "bg-gradient-to-r from-solana-green to-emerald-400 text-navy-900 shadow-md shadow-solana-green/20"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              {dict.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
