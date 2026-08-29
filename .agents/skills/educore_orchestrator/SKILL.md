---
name: educore_orchestrator
description: Orquestração do desenvolvimento do EduCore Protocol (LattesChain) — Solana/Anchor, Go/Fly.io, Supabase, Next.js. Use ao construir, testar, deployar ou depurar qualquer componente do projeto.
---

# EduCore Orchestrator Skill

Orquestra o desenvolvimento do EduCore Protocol (LattesChain). Antes de qualquer código, consulte `docs/00_index.md` (índice, issues conhecidas I-1..I-13, Definition of Ready).

## Mapa de Decisões (ADRs — não redecidir)

| Tema | Decisão | ADR |
| :--- | :--- | :--- |
| Blockchain | Solana, Anchor 0.29, Helius→QuickNode | 001 |
| Hosting backend | Fly.io região gru (NÃO Vercel) | 002 |
| SBT diploma | Metaplex Core, mutable=false | 003 |
| Carteiras alunos | Supabase Vault + SLIP-10/BIP44 Ed25519 | 004 |
| Hash de PDF | Sempre no backend, bytes brutos | 005 |
| ICP-Brasil | Mock MVP → CloudHSM+Lambda produção | 006 |
| Tokens | Memo p/ horas, Core SBT p/ diplomas | 007 |

## Fluxos Operacionais

### 1. Smart Contracts (`educore_contracts/`)
```bash
anchor build          # compila
anchor test           # solana-test-validator + testes (requer Anchor.toml)
anchor keys sync      # após gerar Program ID real (substituir placeholder)
anchor deploy --provider.cluster devnet
```
- Spec de instruções/eventos/erros: `docs/03_smart_contracts_anchor.md`.
- Lacunas a corrigir antes de Mainnet: §8.1 (is_paused), §8.2 (DV CNPJ), §8.3 (hash da assinatura).

### 2. Backend Go (`api/`)
```bash
cd api
go build ./...        # deve compilar (issue I-1: imports educore-api/* errados)
go test ./...
go run ./cmd          # local :8080 — requer envs EDUCORE_* (ver docs/04 §2)
fly deploy --config fly.toml
```
- Endpoints/fluxos: `docs/04_backend_relayer_go.md`; OpenAPI: `docs/07_api_openapi.yaml`.
- Issues bloqueantes: I-1 (imports), I-3 (derivação Ed25519), I-4 (pdf_file_hash), I-6 (tx real).

### 3. Frontend Next.js (`src/`)
```bash
npm install && npm run dev    # ainda não implementado — spec em docs/05
```
- Auth matrix e user flows definidos em `docs/05_frontend_spec.md` (§3, §4).
- Regra UX: zero termos crypto na visão aluno/RH.

### 4. Supabase (`supabase/migrations/`)
```bash
supabase db push      # aplica 001 + 002
```
- Corrigir `bip44_index UINT` → `INTEGER` (issue I-2) antes de aplicar.
- Testar RLS com fixtures de cada papel (student/institution/anon/service_role) — gaps em `docs/02_data_models.md` §5.

## Regras Invioláveis (segurança/LGPD)
1. Nenhuma PII on-chain (nem em Memo, contas ou metadados de token).
2. Master seed BIP39: apenas Supabase Vault + memória do processo; jamais em log/response.
3. Secrets apenas via `fly secrets set` — nunca em código, `fly.toml` ou commit.
4. Toda mudança de código atualiza o doc correspondente no mesmo PR.
5. Assinatura mock ICP (`MOCK_ICP_BRASIL_SIGNATURE_*`) é aceitável SOMENTE em Devnet com `EDUCORE_APP_MOCK_ICP_SIGNING=true`; Mainnet exige CloudHSM (docs/08).

## Incidentes
Runbooks RB-01..RB-10 em `docs/10_runbooks.md` (vazamento de chave, pause global, RPC down, breach LGPD, reconstrução de índice, etc.).
