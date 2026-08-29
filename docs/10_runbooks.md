# EduCore Protocol — Runbooks de Incidente

> Objetivo: resposta a incidente em <30 min para qualquer cenário listado.
> Cada runbook tem: gatilho (como detectar), passos imediatos, comunicação e pós-mortem.
> Convenção: `fly` commands rodam com `FLY_APP=educore-relayer`; `psql $DATABASE_URL` conecta ao Supabase; `docs/08_key_management.md` = KMD.

## RB-01 — Vazamento da chave do relayer (K2)

**Gatilho**: alerta de tx desconhecida assinada pelo relayer; secret em log/commit; relatório externo.

1. **Minutar (5 min)**: rodar `RB-04` (pause global) se emissões fraudulentes forem confirmadas.
2. Gerar nova keypair: `solana-keygen new --no-bip39-passphrase -o /tmp/new-relayer.json` (VM limpa).
3. `fly secrets set EDUCORE_SOLANA_RELAYER_PRIVATE_KEY="<nova>" && fly deploy`.
4. Reconciliar: extrair txs assinadas pela chave antiga (Helius) → validar contra `academic_records`; revogar emissões falsas via `update_university_status` (se via IES específica) + nota pública.
5. Pós-mortem: como vazou (log? commit? máquina?) + scanner de secrets no CI (gitleaks) + alerta.

## RB-02 — Comprometimento do relayer (código/máquina)

**Gatilho**: emissões que não constam em logs; comportamento anômalo da API; deploy não autorizado.

1. `fly scale count 0` (derruba todas as machines) ou `fly apps suspend`.
2. `RB-04`: pause global on-chain.
3. Rotacionar **todos** os secrets (Supabase service role, RPC keys, relayer key) — assumir total comprometimento.
4. Forense: image da machine (`fly ssh console` + dump de filesystem), logs Fly + Supabase.
5. Restaurar de código limpo (git main verificada); redeploy; despausar.
6. Comunicação: IES afetadas + alunos via IES (titular não é notificado direto pelo protocolo — canal da IES).
7. Obrigatório: notificação à ANPD se houver dados pessoais (Art. 48 LGPD) — jurídico acionado.

## RB-03 — Falha de RPC (Helius + QuickNode down)

**Gatilho**: 5xx em `/health` custom; taxa de erro Solana >50%; alerta de latência.

1. Verificar status públicos: Helius status page, QuickNode, Solana validators (solana.com/validators).
2. Se só Helius: `ExecuteWithFallback` já cobre (QuickNode) — monitorar até Helius voltar.
3. Se ambos: emissões ficam indisponíveis por design (não emitir sem confirmar on-chain).
   - Acionar RPC público de emergência (`api.devnet.solana.com` para dev; para mainnet, ativar conta reserve ex.: Triton).
   - `fly secrets set EDUCORE_SOLANA_*` apontando ao reserve + deploy.
4. Comunicação: banner no `/university` ("emissões temporariamente pausadas").
5. Postmortem: SLA dos provedores; considerar terceiro provedor.

## RB-04 — Pause global (circuit breaker)

**Gatilho**: fraude em massa, bug de emissão, comprometimento.

> **Pré-requisito**: corrigir T14 (`is_paused` require) — sem isso o pause NÃO interrompe emissões.

1. Chamar `set_pause_status(is_paused=true)` — via Squads multisig em produção (2 assinantes).
2. Verificar: tentar emissão de teste → esperado `ProgramPaused`.
3. Comunicar IES ativas (e-mail + dashboard banner).
4. Investigar causa-raiz antes de despausar; registro em ata com timestamps.
5. Despausar somente com aprovação 2/3 do multisig + teste smoke.

## RB-05 — Rotação de authority (K3)

**Gatilho**: suspeita de comprometimento do Super Admin; troca programada.

1. Confirmar endereço do novo multisig Squads 3/5 (2 pessoas conferem a pubkey).
2. Simular: `anchor test` com fixture de rotate (ou devnet throwaway).
3. Executar `rotate_authority(new_authority)` on-chain.
4. Verificar: `solana account <PDA>` → campo authority == novo endereço.
5. Arquivar chave antiga (destroy) + ata de cerimônia.
> ⚠️ Sem volta fácil: se o endereço novo estiver errado, lockout permanente do programa. Nunca executar sozinho.

## RB-06 — Falha de persistência (tx on-chain sem registro off-chain)

**Gatilho**: log "Record persisted on-chain but failed off-chain"; aluno sem registro que a IES diz ter emitido.

1. Buscar txs recentes do relayer (Helius `getSignaturesForAddress`).
2. Para cada tx sem registro: extrair `document_hash` do memo/evento → inserir em `academic_records` manualmente (script `scripts/backfill_record.sql` a criar).
3. Validar: `/api/verify/pdf` do documento original → deve retornar `VALID_ONCHAIN`.
4. Causa-raiz (Supabase down? race?) → implementar outbox pattern (docs/04 §7.6).

## RB-07 — Suspeita de fraude por IES

**Gatilho**: denúncia de aluno/RH; hashes de documentos falsos validando.

1. Congelar a IES: `update_university_status(false)` on-chain (authority).
2. Marcar no Supabase: `institutions.is_active = false` (backend deixa de emitir).
3. Auditar: todas as emissões da IES (período suspeito) → lista de hashes → relatório.
4. Comunicação: IES (formal) + parecer jurídico (fraude documental é crime, Art. 297 CP).
5. Decisão: reativação, revogação de registro, ou ação legal — comitê 2/3.

## RB-08 — Breach de dados Supabase (PII)

**Gatilho**: dump vazado; acesso anômalo; alerta do Supabase.

1. Rotacionar service role + JWT secret (Supabase dashboard) — corta acesso contínuo.
2. Snapshot forense (PITR point) antes de qualquer mudança.
3. Escopo: quais tabelas/registros (students = PII; academic_records = metadados).
4. Notificação ANPD (Art. 48 LGPD — 2 anos de regra) + titulares via IES + comunicado público, com jurídico.
5. Pós-mortem + DPIA atualizada (docs/09 §9).

## RB-09 — Reconstrução do índice off-chain

**Gatilho**: perda de dados Supabase sem PITR; migração de ambiente; auditoria de integridade.

1. Configurar webhook/indexer Helius (program ID EduCore) desde o genesis.
2. Replayer todos os eventos `AcademicEventLogged` → reconstruir `academic_records` (hash, IES, tipo, timestamp).
3. PII (nome do aluno, curso) **não é recuperável on-chain** — restaurar de backup; registros sem PII ficam órfãos (documentados).
4. Verificação: `total_events_logged` on-chain == count de registros reconstruídos.

## RB-10 — Comprometimento da master seed (K1) — pior caso

**Gatilho**: acesso não autorizado ao Vault; derivações anômalas; export em massa.

1. `fly secrets set EDUCORE_APP_DISABLE_DERIVATION=true` + deploy (bloqueia novas derivações).
2. Avaliar alcance: quias carteiras derivadas existem vs. transações anômalas.
3. Como **não** há rotação de master seed: plano de migração — nova seed → re-derivar alunos → burn+re-mint SBTs (Metaplex Core permite burn via owner) → comunicar titulares.
4. Cerimônia de re-geração (docs/08 §2.2) com testemunhas.
5. Notificação ANPD (docs/09 §9) + jurídico + shutdown se necessário.

---

## Contatos e Escalação

| Papel | Responsável (preencher) | Canal |
| :--- | :--- | :--- |
| Engenharia on-call | ___ | ___ |
| DevOps/Fly | ___ | ___ |
| Jurídico (LGPD/ANPD) | ___ | ___ |
| Supabase support | enterprise dashboard | supabase.com/support |
| Helius support | discord/support | docs.helius.dev |

## Ferramentas de Diagnóstico (cheat-sheet)

```bash
# Estado geral
fly status --app educore-relayer
curl -s https://educore-relayer.fly.dev/health | jq

# Logs recentes
fly logs --app educore-relayer --no-tail | tail -100

# On-chain (solana CLI)
solana config get
solana account <PDA_MASTER_REGISTRY> --output json
solana confirm <TX_SIGNATURE>

# Supabase
psql $DATABASE_URL -c "SELECT count(*) FROM academic_records;"
psql $DATABASE_URL -c "SELECT * FROM verification_logs ORDER BY created_at DESC LIMIT 20;"
```
