"use client";

import Link from "next/link";
import { GraduationCap, ExternalLink, Linkedin, Instagram, Globe, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

export function Footer() {
  const { dict } = useLanguage();
  const { theme } = useTheme();
  const f = dict.footer;

  const accentColor = theme === "purple" ? "text-solana-purple" : "text-solana-green";
  const hoverAccent = theme === "purple" ? "hover:text-solana-purple" : "hover:text-solana-green";

  return (
    <footer className="border-t border-slate-800/80 bg-[var(--background)] py-12 text-slate-400 no-print transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* COLUNA 1: PROJETO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo_icon.svg"
                alt="LattesChain"
                className="h-7 w-7 object-contain"
              />
              <span className="font-display text-lg font-bold text-white">
                Lattes<span className={`transition-colors duration-300 ${accentColor}`}>Chain</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {f.desc}
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              {f.hackathon}
            </div>
          </div>

          {/* COLUNA 2: PROTOCOLO & GUIAS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">{f.colGuides}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/validator" className={`${hoverAccent} transition-colors`}>
                  {f.validatorLink}
                </Link>
              </li>
              <li>
                <Link href="/student" className={`${hoverAccent} transition-colors`}>
                  {f.studentLink}
                </Link>
              </li>
              <li>
                <Link href="/university" className={`${hoverAccent} transition-colors`}>
                  {f.universityLink}
                </Link>
              </li>
              <li>
                <Link href="/guia-carteira" className={`${accentColor} hover:underline flex items-center gap-1 font-semibold`}>
                  {f.walletGuideLink}
                </Link>
              </li>
              <li>
                <Link href="/sobre" className={`${hoverAccent} transition-colors`}>
                  {f.aboutLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: TECNOLOGIA */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">{f.colTech}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://attest.solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${hoverAccent} transition-colors`}
                >
                  Solana Attestation Service <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://solana.com/docs/core/token-extensions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${hoverAccent} transition-colors`}
                >
                  Token-2022 Extensions <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${hoverAccent} transition-colors`}
                >
                  Supabase Backend <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/sobre" className={`${hoverAccent} transition-colors`}>
                  Jovian Tech
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className={`${accentColor} hover:underline transition-colors flex items-center gap-1`}>
                  {f.privacyLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: DESENVOLVEDOR & CONTATO OFICIAL */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">{f.colAuthor}</h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-300 font-semibold block">Alex Miqueias</span>
                <span className="text-slate-500 text-[11px] block">Lead Architect & Developer</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <a
                    href="https://www.linkedin.com/in/alexmiqueias/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    title="LinkedIn de Alex Miqueias"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://www.instagram.com/alexmsza/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 transition-colors"
                    title="Instagram de Alex Miqueias"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram
                  </a>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
                <span className="text-slate-300 font-semibold block">Jovian Tech</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://jovian.foo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-[11px] ${accentColor} hover:underline transition-colors`}
                    title="Website Jovian Tech"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    jovian.foo
                  </a>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://www.linkedin.com/company/jovian-tech-foo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    title="LinkedIn da Jovian Tech"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Mail className={`h-3.5 w-3.5 transition-colors duration-300 ${accentColor}`} />
                  <span>{f.contactLabel}</span>
                  <a href={`mailto:${f.contactEmail}`} className={`font-mono text-slate-300 ${hoverAccent} transition-colors underline`}>
                    {f.contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {f.rights}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className={`text-slate-400 ${hoverAccent} transition-colors underline`}>
              {f.privacyBadge}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
