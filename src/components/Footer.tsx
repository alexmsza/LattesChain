import Link from "next/link";
import { GraduationCap, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-850 bg-[#060910] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-6 w-6 text-solana-green" />
              <span className="font-display text-lg font-bold text-white">
                Lattes<span className="text-solana-green">Chain</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md">
              Passaporte acadêmico descentralizado e soberano construído sobre a Solana.
              Transformando históricos, diplomas e horas complementares em atestações imutáveis e verificáveis globalmente.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>Construído para o Hackathon Universitário Superteam Brasil</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Protocolo</h4>
            <ul className="space-y-2 text-sm">
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
                  Painel da Universidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Tecnologia</h4>
            <ul className="space-y-2 text-sm">
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
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LattesChain / EduCore Protocol. Código Open Source.</p>
          <div className="flex items-center gap-4">
            <span>Privacidade & LGPD por Design (Zero PII on-chain)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
