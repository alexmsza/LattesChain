"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Scale,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Mail,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* HEADER */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-solana-green hover:underline mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-3.5 py-1 text-xs font-semibold text-solana-green">
          <ShieldCheck className="h-4 w-4" />
          Governança de Dados & Conformidade Regulatória
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Política de Privacidade & Diretrizes LGPD
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          O <strong>LattesChain (EduCore Protocol)</strong> adota o princípio de{" "}
          <strong className="text-solana-green">Privacy by Design e Privacy by Default</strong>,
          em estrito alinhamento com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong> e
          as <strong>Portarias MEC nº 330/2018 e nº 554/2019</strong>.
        </p>
      </div>

      {/* PILARES CENTRAIS DE PRIVACIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-green/10 border border-solana-green/30 text-solana-green">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-white text-base">Zero-PII On-Chain</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nenhum Dado Pessoal Identificável (PII) como CPF, e-mail, notas ou filiação é gravado no ledger público da Solana.
            Apenas a função de mão única <strong>SHA-256</strong> é ancorada na rede.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-purple/10 border border-solana-purple/30 text-solana-purple">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-white text-base">Identidade Soberana</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            O estudante é o único titular das suas credenciais. O compartilhamento de atestações completas com recrutadores
            e empresas exige consentimento e autorização expressa do discente.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-white text-base">Conformidade MEC</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Preservação da autoridade das Instituições de Ensino Superior (IES) emissoras de diplomas digitais (Portaria 554/2019),
            garantindo validade jurídica e prerrogativa institucional de revogação.
          </p>
        </div>
      </div>

      {/* CLÁUSULAS E TERMOS DETALHADOS */}
      <div className="glass-panel rounded-3xl p-8 border-slate-800 space-y-8 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-solana-green" />
            1. Bases Legais do Tratamento de Dados (Art. 7º da LGPD)
          </h2>
          <p>
            O tratamento de dados acadêmicos no âmbito do LattesChain fundamenta-se nas seguintes hipóteses legais:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong>Cumprimento de Obrigação Legal e Regulatória (Art. 7º, II):</strong> Emissão, registro e verificação pública
              de autenticidade de Diplomas Digitais e Históricos Escolares, em cumprimento às Portarias MEC nº 330/2018 e nº 554/2019.
            </li>
            <li>
              <strong>Consentimento do Titular (Art. 7º, I):</strong> Autorização concedida pelo discente para compartilhamento seletivo
              de relatórios de compliance acadêmico com empresas recrutadoras de interesse do titular.
            </li>
            <li>
              <strong>Execução de Contrato e Procedimentos Preliminares (Art. 7º, V):</strong> Prestação de serviços de gerenciamento
              curricular e aproveitamento de equivalências por inteligência artificial.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-solana-green" />
            2. Mecanismo Criptográfico de Minimização de Dados (Hash SHA-256)
          </h2>
          <p>
            Em cumprimento ao princípio da <strong>necessidade e minimização</strong> (Art. 6º, III da LGPD), o protocolo
            transforma o conteúdo de qualquer certificado ou diploma em um digest criptográfico de 256 bits (64 caracteres hexadecimais).
          </p>
          <p className="text-slate-400">
            A função hash SHA-256 é matematicamente irreversível. Isso significa que terceiros que auditam a blockchain Solana
            têm acesso exclusivamente à prova matemática de autenticidade, sendo tecnicamente impossível reconstruir o nome,
            notas ou documentos pessoais a partir do hash registrado on-chain.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-solana-green" />
            3. Direitos dos Titulares de Dados (Art. 18 da LGPD)
          </h2>
          <p>
            O discente, professor ou colaborador tem garantido, mediante simples solicitação ao Encarregado de Dados (DPO):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              "Confirmação da existência de tratamento dos seus dados",
              "Acesso aos dados acadêmicos armazenados no banco off-chain",
              "Correção de dados incompletos, inexatos ou desatualizados",
              "Anonimização, bloqueio ou eliminação de dados desnecessários",
              "Portabilidade dos dados curriculares via W3C Verifiable Credentials",
              "Revogação do consentimento para compartilhamento com terceiros",
            ].map((direito, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-solana-green shrink-0" />
                <span className="text-[11px] text-slate-300">{direito}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-solana-green" />
            4. Segurança da Informação e Políticas Anti-Scraping
          </h2>
          <p>
            O LattesChain emprega medidas técnicas e organizacionais de segurança para proteger os dados contra acessos não autorizados,
            destruição, perda ou alteração:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Row Level Security (RLS):</strong> Isolamento de tabelas no PostgreSQL impedindo leitura cruzada entre diferentes usuários ou instituições.</li>
            <li><strong>SecurityGuard Client-Side:</strong> Proteção ativa contra inspeção indevida e scraping de código ou hashes de terceiros.</li>
            <li><strong>HTTP Security Headers:</strong> Mitigação de clickjacking e ataques de injeção através de cabeçalhos estritos (CSP, X-Frame-Options DENY).</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-solana-green" />
            5. Canal de Contato com o Encarregado de Dados (DPO)
          </h2>
          <p>
            Para exercer seus direitos de titular ou esclarecer dúvidas sobre a governança de privacidade do protocolo,
            entre em contato com o Encarregado de Proteção de Dados:
          </p>
          <div className="p-4 rounded-xl bg-navy-900/90 border border-slate-800 text-xs space-y-1">
            <div><strong>Controlador Técnico:</strong> Alex Miqueias / Jovian Tech</div>
            <div><strong>E-mail institucional de DPO & Contato Oficial:</strong> <a href="mailto:contact@jovian.foo" className="text-solana-green hover:underline">contact@jovian.foo</a></div>
            <div><strong>Hub de Inovação:</strong> <a href="https://jovian.foo" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:underline">jovian.foo</a></div>
          </div>
        </section>
      </div>
    </div>
  );
}
