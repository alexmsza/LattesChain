# EduCore Protocol (LattesChain) 🎓⛓️

[![Solana](https://img.shields.io/badge/Blockchain-Solana%20Devnet-9945FF?logo=solana)](https://solana.com)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![Go](https://img.shields.io/badge/Backend-Go%201.22%20on%20Fly.io-00ADD8?logo=go)](https://fly.io)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.29.0-2b2b2b)](https://www.anchor-lang.com)

Plataforma B2B SaaS de certificação acadêmica e validação de horas complementares baseada em arquitetura híbrida (Off-Chain/On-Chain). Integra a validade jurídica governamental (**ICP-Brasil**) com a imutabilidade pública da blockchain **Solana**.

> 📚 **Documentação completa**: comece por [`docs/00_index.md`](docs/00_index.md) — índice, status de implementação, issues conhecidas e Definition of Ready para Mainnet.

---

## 🏛️ Arquitetura do Sistema

```
                        ┌──────────────────────────────────┐
                        │  Frontend Next.js (App Router)   │
                        │  /admin /university /student     │
                        │  /validator (upload PDF p/ API)  │
                        └───────────────┬──────────────────┘
                                        │ HTTPS
                                        ▼
                        ┌──────────────────────────────────┐
                        │  Go Relayer — Fly.io (região gru)│
                        │  SHA-256 canônico + BIP44 + ICP  │
                        └───────┬──────────────────┬───────┘
                                │                  │
                 ┌──────────────┴───────┐  ┌───────┴────────────────────┐
                 ▼                      │  ▼                            ▼
    ┌─────────────────────────┐         │  ┌─────────────────────────────────┐
    │ Supabase (Off-Chain)   │         │  │ Solana (On-Chain)               │
    │ • PII / LGPD + RLS     │◄────────┘  │ • MasterRegistry (Anchor 0.29)   │
    │ • Vault (master seed)  │   fallback │ • SPL Memo (horas/certificados) │
    │ • Auth + logs auditoria│            │ • Metaplex Core SBT (diplomas)  │
    └─────────────────────────┘            │ RPC: Helius → QuickNode        │
                                           └─────────────────────────────────┘
```

**Decisões-chave** (ADRs completos em `docs/adr/`):
- **Fly.io** para o backend Go (região `gru`, scale-to-zero) — ADR-002
- **Helius primário + QuickNode fallback** com `ExecuteWithFallback` — ADR-001
- Carteiras alunos custodiais próprias: **Supabase Vault + derivação BIP44** — ADR-004
- **Metaplex Core SBT** obrigatório para diplomas; SPL Memo para horas — ADR-003/007
- **Hash do PDF no backend** (`POST /api/verify/pdf`, bytes brutos) — ADR-005

---

## ⚠️ Estado Atual do Código (MVP incompleto)

Este repositório está em fase de esqueleto. Antes de rodar qualquer fluxo end-to-end, leia [`docs/00_index.md` §3](docs/00_index.md) — há issues bloqueantes conhecidas (imports quebrados no Go, derivação de wallet com curva errada, hash de emissão ≠ hash de validação, `is_paused` não aplicado no contrato, transação Solana ainda mock).

---

## 📂 Estrutura do Repositório

```
LattesChain/
├── api/                          # Backend Go (Fly.io) — relayer
│   ├── cmd/main.go               # Gin + zerolog + graceful shutdown
│   ├── internal/{config,handlers,models,services,utils}
│   └── fly.toml                  # região gru, porta 8080, health check
├── docs/                         # Documentação técnica (source of truth)
│   ├── 00_index.md               # ← COMECE AQUI
│   ├── 01..06_*.md               # arquitetura, dados, contratos, backend, frontend, segurança
│   ├── 07_api_openapi.yaml       # spec OpenAPI 3.1
│   ├── 08_key_management.md      # K1-K7, cerimônias, CloudHSM
│   ├── 09_threat_model.md        # STRIDE + DFD + DPIA
│   ├── 10_runbooks.md            # RB-01..RB-10
│   └── adr/001-007               # decisões de arquitetura
├── educore_contracts/            # Smart Contracts Rust/Anchor 0.29
│   ├── Cargo.toml
│   └── programs/educore_contracts/src/lib.rs
├── supabase/migrations/          # 001_initial_schema.sql + 002_rls_policies.sql
├── src/                          # Frontend Next.js (ainda não implementado)
├── prompts/                      # Prompts de referência históricos
└── .agents/                      # Regras + skill do orchestrator
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Go `1.22+`
- Rust `1.75+` & Anchor `0.29.0` (Solana CLI `1.18+`)
- Node.js `18+` (frontend)
- Contas: Supabase (projeto), Helius (RPC + API key), Fly.io (CLI autenticada)

### 2. Backend Go (local)
```bash
cd api
export EDUCORE_SOLANA_HELIUS_RPC_URL="https://devnet.helius-rpc.com/?api-key=<key>"
export EDUCORE_SOLANA_PROGRAM_ID="<program_id>"
export EDUCORE_SUPABASE_URL="https://<ref>.supabase.co"
export EDUCORE_SUPABASE_SERVICE_ROLE_KEY="<key>"
go run ./cmd        # escuta :8080
```
> Nota: o build está atualmente quebrado por imports de module path (issue I-1 em `docs/00_index.md`).

### 3. Deploy Fly.io
```bash
fly launch --no-deploy --name educore-relayer --region gru --config api/fly.toml
fly secrets set EDUCORE_SOLANA_HELIUS_RPC_URL=... EDUCORE_SUPABASE_URL=... ...
fly deploy --config api/fly.toml
```

### 4. Smart Contracts
```bash
cd educore_contracts
anchor build && anchor test    # requer Anchor.toml (a criar — ver docs/03 §7)
```

### 5. Banco (Supabase)
```bash
supabase db push               # aplica supabase/migrations
# ⚠️ corrigir bip44_index UINT → INTEGER antes (issue I-2)
```

---

## 🔐 Assinatura ICP-Brasil — MVP vs Produção

- **MVP (atual)**: assinatura **mock** gerada no relayer (`MOCK_ICP_BRASIL_SIGNATURE_*`). Rotulada e sem valor jurídico. Apenas Devnet.
- **Produção (arquitetura final, a implementar)**: **AWS CloudHSM (FIPS 140-2 L3) + Lambda signer** — a chave e-CNPJ (A1) da IES vive dentro do HSM, importada em cerimônia; o Lambda assina o `document_hash` sob demanda via PKCS#11, com trilha de auditoria completa (CloudTrail). Alternativa por IES: serviços de assinatura remota (Valid, Certisign, Lacuna).
- On-chain grava-se apenas o **hash da assinatura** (a PKCS#7 completa, 1-4KB, fica off-chain).

Detalhes: [`docs/08_key_management.md`](docs/08_key_management.md) e [`docs/adr/006-icp-brasil-signing.md`](docs/adr/006-icp-brasil-signing.md).

---

## 🛡️ Conformidade & Segurança
- **LGPD**: PII (nome, CPF, e-mail, PDF) exclusivamente off-chain no Supabase; on-chain apenas hash + assinatura + pubkeys (pseudonimização). Direito ao esquecimento via soft delete off-chain. DPIA esqueleto em `docs/09_threat_model.md` §9.
- **ICP-Brasil**: Portarias MEC 330/2018 e 554/2019 — camada complementar ao RND (não o substitui).
- **RLS**: policies por papel (student/institution/service_role) em todas as tabelas.
- Docs: [`06_security_lgpd_icp.md`](docs/06_security_lgpd_icp.md) • [`09_threat_model.md`](docs/09_threat_model.md) • [`10_runbooks.md`](docs/10_runbooks.md)
