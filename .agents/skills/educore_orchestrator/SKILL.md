---
name: educore_orchestrator
description: Instruções de orquestração do EduCore Protocol (LattesChain) integrando Solana, Go Serverless, Supabase e Next.js.
---

# EduCore Orchestrator Skill

Esta skill orquestra as operações técnicas do projeto EduCore Protocol (LattesChain).

## Ambiente de Build

> **Smart Contracts (Anchor/Rust)** devem ser compilados no **WSL2 (Ubuntu 22.04)**, não no Windows nativo. Anchor e `solana-test-validator` não funcionam corretamente no Windows.

Para acessar o projeto no WSL2:
```bash
wsl -d Ubuntu-22.04
cd /mnt/c/Users/alexk/Desktop/LattesChain/educore_contracts
```

## Estrutura Operacional

### 1. Smart Contracts (Solana Anchor) — **Executar no WSL2**
- **Localização**: `educore_contracts/`
- **Comandos**:
  - Compilar: `anchor build`
  - Testar: `anchor test`
  - Local Validator: `solana-test-validator`
  - Deploy Devnet: `anchor deploy --provider.cluster devnet`

### 2. Backend Go Serverless (Vercel) — Windows ou WSL2
- **Localização**: `api/`
- **Comandos**:
  - Testes unitários: `go test ./...`
  - Instalar dependências: `go mod download`

### 3. Frontend Next.js — Windows
- **Localização**: Raiz do repositório (`src/app/`)
- **Comandos**:
  - Execução local: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`

### 4. Supabase — Cloud ou WSL2
- **Localização**: `supabase/migrations/`
- **Comandos (CLI local)**:
  - Iniciar: `supabase start`
  - Aplicar migração: `supabase db push`
  - Reset: `supabase db reset`

## Variáveis de Ambiente Requeridas
Arquivo `.env.local` na raiz (não commitado):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SOLANA_RPC_URL=https://api.devnet.solana.com
RELAYER_PRIVATE_KEY=
ANCHOR_PROGRAM_ID=
DEMO_MODE=false
```
