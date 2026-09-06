import Link from "next/link";
import { GraduationCap, ExternalLink, Linkedin, Instagram, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-850 bg-[#060910] py-12 text-slate-400 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* COLUNA 1: PROJETO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-solana-green" />
              <span className="font-display text-lg font-bold text-white">
                Lattes<span className="text-solana-green">Chain</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Passaporte acadêmico soberano sobre a Solana. Atestações oficiais, diplomas e histórico com credibilidade universal para IES, estudantes e empresas.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Construído para o Hackathon Universitário Superteam Brasil 2026.
            </div>
          </div>

          {/* COLUNA 2: PROTOCOLO & GUIAS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Protocolo & Guias</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/validator" className="hover:text-solana-green transition-colors">
                  Validador Público RH
                </Link>
              </li>
              <li>
                <Link href="/student" className="hover:text-solana-green transition-colors">
                  Passaporte do Aluno
                </Link>
              </li>
              <li>
                <Link href="/university" className="hover:text-solana-green transition-colors">
                  Portal da Universidade (IES)
                </Link>
              </li>
              <li>
                <Link href="/guia-carteira" className="text-solana-green hover:underline flex items-center gap-1 font-semibold">
                  Guia: Como Conectar a Carteira Solana
                </Link>
              </li>
              <li>
                <Link href="/admin-protocol" className="hover:text-solana-green transition-colors">
                  Governança do Protocolo
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: TECNOLOGIA */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Tecnologia On-Chain</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://attest.solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
                >
                  Solana Attestation Service <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://solana.com/docs/core/token-extensions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
                >
                  Token-2022 Extensions <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
                >
                  Supabase Backend <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-solana-green transition-colors">
                  Sobre a Jovian Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: DESENVOLVEDOR & VENTURE BUILDER */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Engenharia & Autoria</h4>
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
                    @alexmsza
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-300 font-semibold block">Jovian Tech</span>
                <span className="text-slate-500 text-[11px] block">Venture Builder & GovTech</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <a
                    href="https://jovian.foo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-solana-green hover:underline transition-colors"
                    title="Website da Jovian Tech"
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
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LattesChain / EduCore Protocol • Desenvolvido por Alex Miqueias • Jovian Tech.</p>
          <div className="flex items-center gap-4">
            <span>Privacidade & LGPD por Design (Zero PII on-chain)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
