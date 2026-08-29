# Diretrizes Técnicas do Projeto EduCore Protocol (LattesChain)

> Documentação de referência: `docs/00_index.md` (índice mestre). Este arquivo define as regras que todo agente/colaborador deve seguir ao tocar no código.

## 1. Regras de Arquitetura e Monorepo
- **Estrutura de Pastas**:
  - `src/`: Aplicação Next.js 14+ (App Router) — ainda não implementada (spec: `docs/05_frontend_spec.md`).
  - `api/`: Backend Go 1.22 (Gin) hospedado no **Fly.io** (NÃO Vercel — ADR-002). Config: `api/fly.toml`.
  - `educore_contracts/`: Smart Contracts Solana (Anchor 0.29, Rust).
  - `supabase/`: Migrações SQL (schema + RLS) — aplicar via `supabase db push`.
  - `docs/`: Documentação técnica centralizada. **Atualizar o doc correspondente no mesmo PR de qualquer mudança de código.** Decisões novas viram ADR (`docs/adr/NNN-*.md`).

## 2. Padrões de Código e Segurança
- **LGPD**: Proibido enviar qualquer PII (CPF, Nome, E-mail) para instruções On-Chain (SPL Memo, contas Anchor ou metadados de token Metaplex). Apenas hashes SHA-256, assinaturas (ou hash da assinatura — ADR-006) e pubkeys.
- **Backend Go**: 
  - Module path: `github.com/educore-latteschain/api` (imports internos SEMPRE prefixados com ele — issue I-1).
  - Timeouts de contexto para RPC Solana; fallback Helius→QuickNode via `ExecuteWithFallback`.
  - Config via env `EDUCORE_*` (viper); secrets SOMENTE via `fly secrets`, nunca commitados.
  - Master seed BIP39 vive apenas no Supabase Vault + memória do processo — nunca em log, response ou dump.
- **Smart Contracts (Anchor)**: `require!` para TODA validação de input; `is_paused` deve ser checado em toda instrução de emissão; seeds de PDA documentadas em `docs/02_data_models.md` §3.
- **Carteiras**: derivação de aluno = SLIP-10/Ed25519 (path `m/44'/501'/account'/0'/0'`, account ← SHA-256(uuid)[0..3]) — ver ADR-004. Diplomas = mint Metaplex Core SBT (mutable=false, ADR-003); horas/certificados = SPL Memo (ADR-007).
- **Validação de PDF**: o hash é computado SEMPRE no backend (bytes brutos do arquivo) — o frontend apenas faz upload multipart para `/api/verify/pdf` (ADR-005).
- **UI/UX**: Esquema cromático institucional (#003366, #D4AF37, #FFFFFF), microinterações, zero termos técnicos na visão do aluno/RH (Account Abstraction).

## 3. Definição de Pronto (por componente)
- Go: `go build ./...` + `go test ./...` verdes antes de qualquer deploy.
- Anchor: `anchor build` + `anchor test` verdes (checklist em `docs/03_smart_contracts_anchor.md` §7).
- SQL: migration aplicada em projeto de teste + RLS validada com fixtures de cada papel.
- Docs: componente alterado ⇒ doc correspondente + `docs/00_index.md` §2/§3 atualizados no mesmo PR.
