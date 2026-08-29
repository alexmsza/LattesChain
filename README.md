# EduCore Protocol (LattesChain) 🎓⛓️

[![Solana Devnet](https://img.shields.io/badge/Blockchain-Solana%20Devnet-9945FF?logo=solana)](https://solana.com)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![Go Serverless](https://img.shields.io/badge/Backend-Go%20Serverless-00ADD8?logo=go)](https://go.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Anchor Framework](https://img.shields.io/badge/Anchor-0.29.0-2b2b2b)](https://www.anchor-lang.com)

Plataforma B2B SaaS de certificação acadêmica e validação de horas complementares baseada em arquitetura híbrida (Off-Chain/On-Chain). Integra a validade jurídica governamental (**ICP-Brasil**) com a imutabilidade pública da blockchain **Solana**.

---

## 🏛️ Arquitetura do Sistema

```
                         ┌─────────────────────────────────┐
                         │   Frontend Next.js (App Router)  │
                         │   /admin /university /student   │
                         └──────────────┬──────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────────┐
                         │  Go Serverless Relayer (/api)   │
                         │  SHA-256 Digest + ICP Mock Sign │
                         └──────────────┬──────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│   Supabase Postgres (Off-Chain) │           │    Solana Devnet (On-Chain)     │
│   • Dados Pessoais (PII / LGPD) │           │    • Master Registry (Anchor)   │
│   • Metadados & Registros       │           │    • SPL Memo Program           │
│   • Autenticação & RLS          │           │    • Metaplex Core SBT          │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 📂 Estrutura do Repositório

```
LattesChain/
├── .agents/                      # Regras e skills do assistente Antigravity
│   ├── rules/                    # Diretrizes técnicas específicas do projeto
│   └── skills/                   # Orquestrador técnico
├── api/                          # Backend Go Serverless (Vercel Functions)
├── docs/                         # Documentação técnica e arquitetural
│   ├── 01_architecture_overview.md
│   ├── 02_data_models.md
│   ├── 03_smart_contracts_anchor.md
│   ├── 04_backend_relayer_go.md
│   ├── 05_frontend_spec.md
│   └── 06_security_lgpd_icp.md
├── educore_contracts/            # Smart Contracts em Rust (Anchor Framework)
│   └── programs/educore_contracts/src/lib.rs
├── prompts/                      # Especificações e prompts de referência
├── src/                          # Aplicação Frontend Next.js
│   ├── app/                      # Rotas e páginas (admin, university, student, validator)
│   └── components/               # Componentes UI reutilizáveis
├── supabase/                     # Migrações SQL e definições de banco
│   └── migrations/
├── .gitignore                    # Regras de exclusão do Git
├── package.json                  # Dependências Node.js / Next.js
├── vercel.json                   # Configuração de rotas e builds Vercel
└── README.md                     # Este documento
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js `18+` & npm
- Go `1.21+`
- Rust & Cargo `1.75+`
- Solana CLI & Anchor CLI `0.29.0+`
- Supabase CLI (opcional para ambiente local)

### 2. Frontend (Next.js)
```bash
npm install
npm run dev
```
Acesse em: `http://localhost:3000`

### 3. Backend (Go Serverless)
```bash
cd api
go mod download
go test ./...
```

### 4. Smart Contracts (Solana Anchor)
```bash
cd educore_contracts
anchor build
anchor test
```

---

## 🛡️ Conformidade & Segurança
- **LGPD**: Dados Pessoais Sensíveis (Nome, CPF, E-mail) são mantidos exclusivamente off-chain no Supabase, permitindo pleno atendimento ao Art. 18 (Direito ao Esquecimento).
- **Integridade Criptográfica**: Hashes SHA-256 e assinaturas de autoridade institucional são os únicos registros imutáveis na rede Solana.
