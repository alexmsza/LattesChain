# EduCore Protocol — Índice da Documentação

> Ponto de entrada único da documentação. Este arquivo substitui o papel de "SPEC consolidada" apontado no relatório de ideação (passo 6).
> Última atualização: 2026-08-31.

## 1. Mapa dos Documentos

| Doc | Título | Função |
| :--- | :--- | :--- |
| `00_index.md` | **Este arquivo** | Índice, status do projeto, issues conhecidas, Definition of Ready |
| `ARQUITETURA_E_FLUXOS_GERAL.md` | **Manual Completo de Arquitetura & Fluxos** | Guia de ponta a ponta: todas as tecnologias, fluxos operacionais, autenticação e LGPD |
| `PITCH_DECK.md` | Roteiro de Pitch (5 Min) | Script e minutagem para vídeo do Hackathon Superteam Brasil |
| `BUSINESS_PLAN.md` | Plano de Negócios & GTM | Modelo B2B2C, personas, análise competitiva e pricing |
| `01_architecture_overview.md` | Visão Geral | Topologia, componentes, ambientes, custos, DR |
| `02_data_models.md` | Modelagem de Dados | ER off-chain, contas on-chain, RLS, issues do schema |
| `03_smart_contracts_anchor.md` | Smart Contracts | Instruções, eventos, erros, build/test/deploy, lacunas |
| `04_backend_relayer_go.md` | Backend Relayer | Endpoints, fluxos, config, issues, deploy Fly.io |
| `05_frontend_spec.md` | Frontend | Rotas, auth matrix, user flows, integração |
| `06_security_lgpd_icp.md` | Segurança/LGPD/ICP | Compliance, ICP-Brasil MVP→produção, resumo controles |
| `07_api_openapi.yaml` | OpenAPI 3.1 | Spec completa da API (source of truth para client codegen) |
| `08_key_management.md` | Gestão de Chaves | Inventário K1-K7, cerimônias, CloudHSM |
| `09_threat_model.md` | Threat Model | STRIDE + DFD, riscos rankeados, DPIA esqueleto |
| `10_runbooks.md` | Runbooks | RB-01 a RB-10 resposta a incidentes |
| `11_fullstack_and_demo_guide.md` | Guia Full-Stack & Demo | APIs Next.js, persistência Supabase, equivalência de IA e branch mock |
| `12_tripartite_and_business_architecture.md` | Arquitetura Tripartite & Negócios | Modelo de valor compartilhado IES ⇄ Estudante ⇄ RH e compliance |
| `13_mcp_integrations_and_vercel_setup.md` | Guia MCP & CI/CD Vercel | Setup Vercel MCP, Supabase Preview CI e boas práticas de deploy |
| `14_solana_wallet_connection_and_security.md` | Carteira Solana & Segurança | Conexão Web3 (Phantom/Solflare), SecurityGuard anti-scraping e créditos |
| `15_mec_xml_parser_rvdd_and_lgpd_compliance.md` | Conformidade MEC, XML & LGPD | Parser do XML MEC (Portarias 330/554), RVDD QR Code, Lote CSV e LGPD |
| `16_mainnet_migration_and_gasless_relayer_spec.md` | Migração Mainnet & Relayer Gasless | Infraestrutura Helius/QuickNode, Fee Payer e State Compression |
| `adr/001-007` | ADRs | 7 decisões de arquitetura formalizadas |
| `LattesChain.md` | Documento mestre (histórico) | Visão original — **subsumido** pelos docs numerados; manter como referência |

## 2. Status de Implementação (honesto, por componente)

| Componente | Estado | Evidência |
| :--- | :--- | :--- |
| Smart contracts Anchor | 🟡 Código escrito, **sem testes, sem build verificado** | `educore_contracts/programs/.../lib.rs` (495 linhas) |
| Solana Attestation Service (SAS) | 🟢 **Implementado e funcional (Devnet)** | `sas/00_setup_wallets.py` a `sas/06_revoke.py` |
| Migrations SQL | 🟢 **Aplicadas no Supabase** (`001 + 002 + 003`) | `supabase/migrations/` |
| Backend APIs Next.js | 🟢 **Implementadas e integradas** (issue, student, verify, equivalence, trust-report) | `src/app/api/credentials/*`, `src/app/api/ai/*` |
| Frontend Next.js | 🟢 **Implementado, conectado e build verificado** (`/`, `/validator`, `/student`, `/university`, `/admin-protocol`) | `src/` |
| Camada de IA | 🟢 **Multi-provedor com fallback determinístico local** (Equivalência Curricular + Trust Report) | `src/app/api/ai/*`, `ai/` |
| Autenticação multi-perfil (Estudante/IES/RH) | 🟢 **Implementado, E2E verificado** (`/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha` + APIs + middleware de guards) | `src/app/login`, `src/app/api/auth/*`, `src/middleware.ts` |
| Aprovação de cadastro via email (Lark SMTP/IMAP) | 🟢 **Funcional e verificado E2E** (links HMAC de aprovar/reprovar chegam ao admin e funcionam) | `src/lib/server/mailer.ts`, `src/app/api/auth/approve|reject` |
| Recuperação de senha por email | 🟢 **Funcional e verificado E2E** (token uso único 1h, hash SHA-256 no banco) | `password_reset_tokens`, `src/app/api/auth/forgot|reset-password` |
| Supabase DB & RLS | 🟢 **Conectado e Migrações Aplicadas** (`001 + 002`) | `supabase/migrations/` |
| Metaplex Core mint | 🔴 Placeholder `not implemented` | `solana.go::MintMetaplexCoreSBT` |
| Verificação on-chain | 🔴 Placeholder `not implemented` | `solana.go::VerifyDocumentOnChain` |
| Vault + derivação | 🔴 `GetMasterSeed` placeholder; derivação usa curva errada | `supabase.go`, `crypto.go` |
| ICP-Brasil | 🔴 Mock string | `handlers.go::IssueCertificate` |
| RLS | 🟡 Escritas, sem testes, policy `anon` inócua, update sem colunas restritas | `002_rls_policies.sql` |
| Deploy Fly.io | 🟢 `fly.toml` pronto, app não criado | `api/fly.toml` |
| RPC fallback | 🟢 Implementado (Helius→QuickNode) | `solana.go::ExecuteWithFallback` |

## 3. Issues Conhecidas do Código (bloqueios na ordem de correção)

| # | Severidade | Issue | Onde | Correção |
| :--- | :--- | :--- | :--- | :--- |
| I-1 | 🔴 | Imports `educore-api/internal` ≠ module `github.com/educore-latteschain/api` → **build quebrado** | `api/internal/services/*.go` (5 imports) | Unificar module path |
| I-1b | 🔴 | **`go.mod` com versões inexistentes** (verificado via `go list -m -versions`): `solana-go v0.1.0` (real: v1.23.0), `solana-go/rpc v0.1.0` (não é módulo separado), `supabase-go v0.6.0` (real: v0.0.4), `base64x@2023-07-18` (revisão desconhecida); sem `go.sum` | `api/go.mod` | `go mod tidy` após trocar `supabase-go` por versão real (v0.0.4) ou migrar para `postgrest-go`; alinhar solana-go ≥v1.20 (sem submódulo rpc) |
| I-2 | 🔴 | `bip44_index UINT` não existe em Postgres → migration falha | `001_initial_schema.sql:51` | `INTEGER` |
| I-3 | 🔴 | BIP44 deriva secp256k1 + hex compressed → **inutilizável na Solana (Ed25519)** | `utils/crypto.go` | SLIP-10 Ed25519 (`solana-go/pkg/hd`) |
| I-4 | 🔴 | Emissão hasheia JSON, validador hasheia PDF → **hashes nunca coincidem** | `handlers.go` + doc 02 §5.2 | Coluna `pdf_file_hash` + fluxo ADR-005 |
| I-5 | 🔴 | `is_paused` nunca checado → **pause on-chain inoperante** | `lib.rs` (log/batch) | `require!(!is_paused)` |
| I-6 | 🔴 | `submitToSolana` retorna mock → **nenhuma transação real é enviada** | `handlers.go` | Builder de tx Anchor via solana-go |
| I-7 | 🔴 | Offsets de desserialização das PDAs ignoram length-prefix Borsh | `solana.go::GetUniversityRecord` | Parser Borsh correto (doc 02 §3.2) |
| I-8 | 🟡 | `verify/pdf` sem rate limit nem limite de tamanho | `main.go`/handlers | Middleware + MaxMultipartMemory |
| I-9 | 🟡 | Policy student UPDATE sem restrição de colunas (wallet hijack) | `002_rls_policies.sql` | Remover policy ou restringir colunas |
| I-10 | 🟡 | `GetMasterSeed` placeholder → derivação sempre falha | `supabase.go` | Integração real Vault |
| I-11 | 🟡 | Sem tests Go; sem `Anchor.toml`/workspace completo | `api/`, `educore_contracts/` | Ver doc 03 §7 e doc 04 §8 |
| I-12 | 🟢 | Health check estático (não probeia Supabase/RPC) | `handlers.go` | Pings reais |
| I-13 | 🟢 | `verifier_ip` INET cru = PII | `001_schema.sql` | Truncar/hash + retenção |
| I-14 | 🟡 | Rate limit de auth é **em memória** (janela deslizante por instância serverless) — escala horizontal requer Upstash Redis | `src/lib/server/rateLimit.ts` | Migrar p/ Redis em produção |
| I-15 | 🟡 | Contas em `PENDING`/`REJECTED` existem no `auth.users` com `email_confirm=true` (login checado no app, não no GoTrue) — divulgação limitada, aceitável no MVP | `src/app/api/auth/signup` | Hook `before_user_created` ou fluxo de convite via `inviteUserByEmail` |

## 4. Decisões de Arquitetura (resumo — detalhes em `docs/adr/`)

| ADR | Decisão |
| :--- | :--- |
| 001 | Solana (Devnet→Mainnet), Anchor 0.29, RPC Helius+QuickNode |
| 002 | Backend Go no **Fly.io** região gru (Vercel descartado) |
| 003 | **Metaplex Core** para SBTs de diploma (mutable=false) |
| 004 | Custódia própria: **Supabase Vault + BIP44** (sem WaaS externo) |
| 005 | Hash do PDF **no backend** (bytes brutos, multipart upload) |
| 006 | ICP-Brasil: mock MVP → **CloudHSM + Lambda** produção; on-chain só hash da assinatura |
| 007 | Dual-track: Memo p/ horas + Core SBT p/ diplomas |

## 5. Pendências de Negócio (do relatório de ideação — ainda abertas)

- [ ] MOU com 1-2 IES piloto (bloqueante Mainnet)
- [ ] Pricing model formal (referência: setup 15k + 3k/mês + 0,50/emissão)
- [ ] Parecer jurídico LGPD/ANPD + DPIA assinada (docs/09 §9)
- [ ] Tokenomics / tesouraria multisig / fee switch
- [ ] zkTLS (Reclaim) — Fase 2, tabela já provisionada
- [ ] CI/CD GitHub Actions (dev→staging→mainnet gates)

## 6. Definition of Ready — Mainnet (checklist)

- [ ] I-1 a I-7 corrigidos + `go build ./...` e `go test ./...` verdes no CI
- [ ] `anchor build && anchor test` verdes (checklist doc 03 §7)
- [ ] Migration 001 aplicada limpa (pós-fix UINT) + RLS testada com fixtures
- [ ] CloudHSM ativo + cerimônia de seed concluída (docs/08 §2.2)
- [ ] `mock_icp_signing=false` + validação de cadeia ICP no validador
- [ ] Multisig Squads 3/5 como `MasterRegistry.authority`
- [ ] Threat model revisado + DPIA assinada por jurídico
- [ ] MOU IES piloto assinado
- [ ] Runbooks RB-01 a RB-10 com contatos preenchidos
- [ ] Monitoramento: Sentry + alertas RPC/health + dashboards emissões

## 7. Convenções de Documentação

- Mudou código → atualizar doc correspondente **no mesmo PR** (regra `.agents/rules`).
- Nova decisão arquitetural → novo ADR numerado (`docs/adr/NNN-slug.md`).
- Doc é "source of truth" quando divergir de código legado; divergências viram issue na §3 daqui.
- `LattesChain.md` (mestre original) é mantido como referência histórica — não editar para specs novas.
