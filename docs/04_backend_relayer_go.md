# EduCore Protocol — Backend Relayer (Go / Fly.io)

> Fonte da verdade: `api/` (Go 1.22, Gin, zerolog, viper). Configuração Fly.io em `api/fly.toml`.
> Este documento espelha o código **como escrito**, com issues conhecidas sinalizadas (§7).

## 1. Runtime e Ambiente

- **Diretório**: `api/` — módulo Go `github.com/educore-latteschain/api`
- **Hosting**: **Fly.io** (não Vercel Serverless — ver ADR-002). App `educore-relayer`, região `gru`, porta interna 8080, scale-to-zero, health check `/health` 30s.
- **Servidor**: Gin + middleware zerolog (structured logging) + graceful shutdown (SIGINT/SIGTERM, timeout 30s).
- **Dependências principais** (`go.mod`):
  - `github.com/gagliardetto/solana-go` + `/rpc` — RPC Solana (Helius primário / QuickNode fallback)
  - `github.com/supabase-community/supabase-go` — REST PostgREST (service role)
  - `github.com/gin-gonic/gin` v1.10 — HTTP
  - `github.com/rs/zerolog` v1.33 — logs
  - `github.com/spf13/viper` v1.19 — config (env `EDUCORE_*` + `config.yaml`)
  - `github.com/btcsuite/btcd/btcec/v2` — derivação BIP32/BIP44
  - `github.com/tyler-smith/go-bip39` — geração da master seed
  - `github.com/jackc/pgx/v5` — (presente no go.mod, uso direto pendente)

> 🔴 **Issue conhecida**: `internal/services/solana.go` e `internal/services/supabase.go` importam `educore-api/internal/...`, mas o módulo é `github.com/educore-latteschain/api` — **o pacote não compila** (`go build ./...` falha). Corrigir todos os imports para o path do módulo. Ver `docs/00_index.md`.

> 🔴 **Issue I-1b (verificada por execução)**: o `go.mod` declara versões que **não existem** no upstream: `gagliardetto/solana-go v0.1.0` (versão real atual: v1.23.0), o submódulo `solana-go/rpc v0.1.0` (não é módulo separado — o pacote `rpc` vive no módulo principal), `supabase-community/supabase-go v0.6.0` (versões reais: v0.0.1–v0.0.4) e `chenzhuoyu/base64x@2023-07-18` (revisão desconhecida). Resultado de `go mod download all`: *"invalid version: unknown revision"* para todos. Além disso não há `go.sum`. **Correção**: fixar `solana-go` ≥ v1.20 (import único), usar `supabase-go v0.0.4` ou substituir pelo cliente `postgrest-go`, rodar `go mod tidy` e versionar o `go.sum` gerado.

## 2. Configuração (variáveis de ambiente)

Prefixo `EDUCORE_` via viper (`api/internal/config/config.go`). No Fly.io, setar via `fly secrets set`:

| Env | Default | Descrição |
| :--- | :--- | :--- |
| `PORT` | `8080` | Porta HTTP (Gin escuta `:PORT`) |
| `EDUCORE_SERVER_ENVIRONMENT` | `development` | `production` ativa gin release mode |
| `EDUCORE_SOLANA_HELIUS_RPC_URL` | — | **RPC primário** (Helius; requerido no mínimo um dos dois) |
| `EDUCORE_SOLANA_QUICKNODE_RPC_URL` | — | RPC fallback (QuickNode) |
| `EDUCORE_SOLANA_PROGRAM_ID` / `MASTER_REGISTRY_PROGRAM_ID` | — | Program ID do contrato EduCore (obrigatório) |
| `EDUCORE_SOLANA_RELAYER_PRIVATE_KEY` | — | Chave do relayer em base58 — **MVP apenas; produção exige KMS/secrets manager** (§7.5, ADR-006) |
| `EDUCORE_SOLANA_COMMITMENT` | `confirmed` | Commitment das consultas |
| `EDUCORE_SUPABASE_URL` | — | URL do projeto Supabase (obrigatório) |
| `EDUCORE_SUPABASE_SERVICE_ROLE_KEY` | — | Service role key (backend; obrigatório) |
| `EDUCORE_SUPABASE_ANON_KEY` | — | Anon key (uso público/validator) |
| `EDUCORE_SUPABASE_VAULT_MASTER_SEED_KEY` | — | Nome do secret no Vault com a master seed BIP39 |
| `EDUCORE_APP_MOCK_ICP_SIGNING` | `true` | `true` = assinatura mock (MVP); `false` = CloudHSM (produção) |

Validação na inicialização (`config.Validate()`): falha se nenhum RPC, sem Supabase URL/key, ou sem Program ID.

## 3. Endpoints

| Método & Rota | Auth | Descrição |
| :--- | :--- | :--- |
| `GET /health` | pública | Health check (Fly.io probe) |
| `POST /api/issue_certificate` | restrita (ver §5) | Emissão: hash canônico → assinatura → Solana → persistência |
| `POST /api/verify/pdf` | pública | **Canonicalização backend**: recebe PDF `multipart/form-data` (campo `document`), lê bytes brutos, computa SHA-256, consulta Supabase → fallback on-chain |
| `GET /api/students/:id/records` | protegida | Registros do aluno |
| `GET /api/institutions/:id/records` | protegida | Registros emitidos pela IES |
| `GET /api/students/:id/assets` | protegida | Ativos Metaplex Core do aluno via **Helius DAS API** |

Spec completa: `docs/07_api_openapi.yaml`.

## 4. Fluxo `POST /api/issue_certificate` (implementado)

1. **Bind + validação**: `student_id` e `institution_id` obrigatórios (uuid); `document_metadata` required.
2. **Busca aluno** no Supabase (404 se ausente).
3. **Busca instituição**; 403 se `is_active = false`.
4. **Hash canônico**: `utils.ComputeDocumentHash(metadata)` — JSON com chaves ordenadas → SHA-256 hex.
5. **Idempotência por hash**: registro existente → **409 Conflict** com `document_hash` + `tx_signature` da emissão original (não reemite).
6. **Assinatura ICP-Brasil (mock MVP)**: `"MOCK_ICP_BRASIL_SIGNATURE_" + hash[:16]`. Produção: CloudHSM + Lambda (ADR-006, `docs/08_key_management.md`).
7. **Derivação BIP44 da carteira do aluno** (se ainda não existir): master seed do **Supabase Vault** → path `m/44'/501'/account'/0/0`, onde `account = SHA-256(student_uuid)[0..3]` como u32 endurecido. Pubkey gravada em `students.solana_wallet_custodial`.
   - 🔴 **Issue conhecida (crítica)**: `utils/crypto.go` deriva **secp256k1** e serializa a pubkey **comprimida hex** — Solana usa **Ed25519/base58**; a chave derivada não é utilizável on-chain. Solução correta documentada em §7.4 e ADR-004 (SLIP-10/Ed25519, ex.: `github.com/gagliardetto/solana-go/pkg/hd`).
8. **Tipo do documento**: lido de `metadata["type"]` (default `HORAS_COMPLEMENTARES`); enum Go ↔ SQL ↔ Anchor em `docs/02_data_models.md` §3.4.
9. **Diploma** (`DIPLOMA`): reserva `metaplex_asset_id = "PENDING_SBT_MINT"` — **mint Metaplex Core ainda não implementado** (ADR-003).
10. **Submissão Solana**: `submitToSolana()` hoje retorna placeholder `"MOCK_TX_SIGNATURE_..."` — **não envia transação real** (ver §7.2). Design alvo: instrução Anchor `log_academic_event` (+ CPI Memo já embutido no programa).
11. **Persistência** em `academic_records` (append-only). Falha aqui = tx on-chain órfã: log de erro + registro de compensação (hoje apenas comentário no código — ver §7.6).
12. **Auditoria**: `verification_logs` com resultado `ISSUED`.
13. **Resposta 201**: `{ status, document_hash, solana_tx_signature, icp_signature, metaplex_asset_id }`.

## 4.1 Fluxo `POST /api/verify/pdf` (implementado)

1. Parse `multipart/form-data`, campo `document` (PDF).
2. **SHA-256 dos bytes brutos** do arquivo (leitura binária, sem transformação — ADR-005).
3. Consulta Supabase por `document_hash` (rápida) → se válido, responde com dados.
4. **Fallback on-chain**: `VerifyDocumentOnChain` — hoje retorna "not implemented" (ver §7.3).
5. Log de auditoria em todos os caminhos (`VALID` / `VALID_ONCHAIN` / `INVALID` / `ERROR`).

> 🔴 **Gap crítico de produto**: o hash computado na emissão é do **JSON canônico dos metadados**, e o do validador é dos **bytes do PDF** — **nunca coincidem**. Correção: gravar `pdf_file_hash` na emissão (recebendo o PDF ou hash de baixa confiabilidade) — detalhes em `docs/02_data_models.md` §5.2 e ADR-005. **Sem isso, `/validator` não valida nada emitido pelo sistema.**

## 5. Autenticação de API

**Estado atual**: os endpoints não validam JWT — `issue_certificate` confia no caller. **Inaceitável em produção**; para o MVP de Devnet é tolerável apenas com a API atrás de Fly.io private networking + gateway. Plano (ver `docs/05_frontend_spec.md` §3):
- `issue_certificate`: token institucional (service-to-service, scope `issuance`) OU sessão Supabase Auth da IES com claim `wallet_address` = pubkey registrada.
- Endpoints de leitura: JWT Supabase (aluno vê só os seus; IES só os emitidos) — o backend já opera como service role, aplicar o filtro no handler.
- `verify/pdf`: público + **rate limit** (§7.7).

## 6. RPC Solana com fallback (implementado)

`SolanaService`:
- `ExecuteWithFallback(fn)`: tenta Helius → QuickNode → erro. Log de warn no fallback.
- `GetMasterRegistry()` / `GetUniversityRecord()`: leitura de PDAs — 🔴 offsets de desserialização incorretos (ignoram length-prefix Borsh de `cnpj`/`name`); ver `docs/02_data_models.md` §3.2.
- `GetStudentAssets()`: **Helius DAS API** `GET {helius}/v0/assets/owner/{pubkey}` — lista SBTs Metaplex Core do aluno.
- `SendTransaction` / `ConfirmTransaction`: assinatura e broadcast com fallback, commitment `finalized` na confirmação.

## 7. Issues Conhecidas e Roadmap do Backend

| # | Severidade | Issue | Correção |
| :--- | :--- | :--- | :--- |
| 7.1 | 🔴 | Imports `educore-api/internal/...` ≠ module path `github.com/educore-latteschain/api` — **não compila** | `sed` nos imports de `services/` |
| 7.2 | 🔴 | `submitToSolana` placeholder — nenhuma tx real é enviada | Implementar builder de tx Anchor (instruction discriminator `log_academic_event` + contas) via solana-go |
| 7.3 | 🔴 | `VerifyDocumentOnChain` placeholder | Implementar via Helius Enhanced Transactions API (buscar memo/evento por hash) ou PDA de registro acadêmico |
| 7.4 | 🔴 | BIP44 deriva secp256k1/hex-compressed — incompatível com Solana Ed25519 | Trocar por SLIP-10 Ed25519 (`solana-go/pkg/hd`); regenerar master seed existente antes de expor carteiras |
| 7.5 | 🟡 | `RELAYER_PRIVATE_KEY` em env var | Fly secrets + rotação; produção: signer dedicado com limite (ver `docs/08_key_management.md` §5) |
| 7.6 | 🟡 | Falha de persistência pós-tx on-chain sem compensação | Outbox pattern: gravar intent antes do broadcast; reconciliar via webhooks Helius |
| 7.7 | 🟡 | Sem rate limiting em endpoints públicos | Middleware Gin (ex.: `ulule/limiter` + Redis, ou Fly.io proxy rate limits) |
| 7.8 | 🟡 | `ProgramID`/`MasterRegistryPDA` opcionais na validação | Obrigar `ProgramID` já na validação (já feito); derivar PDA no startup e logar |
| 7.9 | 🟢 | Health check estático | Ping real no Supabase e RPC no `/health` |
| 7.10 | 🟢 | `verification_logs.verifier_ip` = PII | Truncar IP (ex.: /24) ou hash + retenção 90d |
| 7.11 | 🟢 | `encodeDER`/`hmacSHA512` hand-rolled | Substituir por libs padrão (`crypto/ecdsa`, `crypto/hmac`) — código morto pós-Cor-7.4 |

## 8. Testes (estado atual e alvo)

- **Hoje**: `go test ./...` — sem arquivos `_test.go` no repositório. Compilação está quebrada por 7.1.
- **Alvo (mínimo)**:
  - `utils`: `ComputeDocumentHash` (determinismo com chaves embaralhadas), derivação Ed25519 (vetores conhecidos), `MockICPBrasilSign`.
  - `services`: `ExecuteWithFallback` (primary down → fallback ok; ambos down → erro), parsing de PDA com layout Borsh correto.
  - `handlers`: emissão happy path, idempotência 409, `verify/pdf` com PDF fixture (hash match), 404 aluno/IES.
  - **Regra**: nenhum deploy (devnet inclusive) sem `go build ./...` + `go test ./...` verdes no CI.

## 9. Deploy (Fly.io)

```bash
# Setup inicial
fly auth login
fly launch --no-deploy --name educore-relayer --region gru --config api/fly.toml

# Secrets (uma vez; nunca commit)
fly secrets set \
  EDUCORE_SOLANA_HELIUS_RPC_URL="https://devnet.helius-rpc.com/?api-key=..." \
  EDUCORE_SOLANA_QUICKNODE_RPC_URL="https://...quicknode.io/..." \
  EDUCORE_SOLANA_PROGRAM_ID="..." \
  EDUCORE_SUPABASE_URL="https://xxx.supabase.co" \
  EDUCORE_SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  EDUCORE_APP_MOCK_ICP_SIGNING="true"

# Deploy
cd api && fly deploy --config fly.toml

# Verificação pós-deploy
fly status && curl -s https://educore-relayer.fly.dev/health | jq
```

Ambientes: `development` (local), `staging` (app `educore-relayer-staging`, Devnet), `production` (app `educore-relayer`, Mainnet + CloudHSM).
