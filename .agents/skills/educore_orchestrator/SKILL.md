---
name: educore_orchestrator
description: Instruções de orquestração do EduCore Protocol (LattesChain) integrando Solana, Go Serverless, Supabase e Next.js.
---

# EduCore Orchestrator Skill

Esta skill orquestra as operações técnicas do projeto EduCore Protocol (LattesChain).

## Estrutura Operacional

### 1. Smart Contracts (Solana Anchor)

- **Localização**: `educore_contracts/`
- **Comandos**:
  - Compilar: `anchor build`
  - Testar: `anchor test`
  - Local Validator: `solana-test-validator`

### 2. Backend Go Serverless (Vercel)

- **Localização**: `api/`
- **Comandos**:
  - Testes unitários: `go test ./...`
  - Instalar dependências: `go get github.com/gagliardetto/solana-go`

### 3. Frontend Next.js

- **Localização**: Raiz do repositório (`src/app/`)
- **Comandos**:
  - Execução local: `npm run dev`
  - Build: `npm run build`

### 4. Supabase

- **Localização**: `supabase/migrations/`
- **Comandos**:
  - Migração local: `supabase db push` ou execução via SQL Editor.
