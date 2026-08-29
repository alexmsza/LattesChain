RELATÓRIO DE ANÁLISE DE IDEAÇÃO — LATTESCHAIN / EDUCORE PROTOCOL

1. RESUMO EXECUTIVO
O projeto LattesChain (EduCore Protocol) é uma plataforma B2B/B2C SaaS que propõe resolver a fraude acadêmica no Brasil unindo validade jurídica ICP-Brasil com imutabilidade blockchain Solana. A documentação existente cobre arquitetura, modelos de dados, smart contracts, backend, frontend e segurança — mas não há código implementado, apenas especificações.

Veredito geral: Conceito sólido e bem fundamentado legalmente, mas com inconsistências técnicas críticas, lacunas de negócio e riscos de execução que precisam ser resolvidos antes de qualquer desenvolvimento.

1. ANÁLISE TÉCNICA — INCONSISTÊNCIAS E ERROS
2.1 Smart Contracts (Anchor/Rust) — 03_smart_contracts_anchor.md
Item
Problema
Severidade
Instrução log_academic_event Recebe icp_signature: String mas não valida nem armazena a assinatura ICP-Brasil on-chain. Apenas emite evento com document_hash. A assinatura ICP-Brasil é o pilar jurídico — sem validação on-chain, não há "Trust Anchor" real. 🔴 Crítico
UniversityRecord Armazena cnpj: [u8; 14] (bytes brutos) — sem validação de formato CNPJ (14 dígitos numéricos, dígitos verificadores). Risco de registro de CNPJs inválidos. 🟡 Médio
MasterRegistry Single authority (authority: Pubkey) — single point of failure. Sem rotação de chaves, timelock, ou multisig para Super Admin. 🟡 Médio
Ausência de instruções Não há: update_university_status, rotate_authority, revoke_certificate, batch_log_events, pausable circuit breaker. 🟡 Médio
SPL Memo vs Metaplex Core Doc menciona ambos, mas não define quando usar cada um. SPL Memo = barato, só log. Metaplex Core SBT = custo de mint, não-transferível. Precisa de regra clara (ex: diploma = SBT; horas = Memo). 🟡 Médio
Tamanho de conta UniversityRecord = 32+14+1+1 = 48 bytes + discriminator (8) = 56 bytes. OK para rent-exempt (~0.0014 SOL), mas falta name da instituição para UX de validador. 🟢 Baixo
2.2 Modelagem de Dados — 02_data_models.md
Item
Problema
Severidade
institutions.solana_pubkey VARCHAR(44) Pubkey Solana base58 = 32-44 chars. VARCHAR(44) OK, mas falta UNIQUE constraint no CNPJ (já tem) e falta índice em solana_pubkey para lookup reverso rápido no validador. 🟡 Médio
students.solana_wallet_custodial VARCHAR(44) UNIQUE — OK. Mas não há campo wallet_type (custodial/externally-owned) nem wallet_bump para PDAs derivadas. 🟡 Médio
academic_records.document_type VARCHAR(50) livre — sem CHECK constraint para 'DIPLOMA', 'HORAS_COMPLEMENTARES', 'CERTIFICADO_CURSO'. Risco de typos. 🟡 Médio
academic_records.icp_brasil_signature TEXT Armazena assinatura mock ou PKCS#7. Não define formato padronizado (base64? DER? PEM?). Validador precisa saber como parsear. 🟡 Médio
Ausência de tabelas Não há: verification_logs (auditoria de consultas /validator), external_courses (zkTLS/Coursera), wallet_nonces (replay protection), protocol_config (fee, pausable flags). 🟡 Médio
RLS Policies Menciona "RLS" mas não define policies SQL. Ex: aluno só vê seus registros; IES só vê seus emitidos; validador público só lê hash/status. 🟡 Médio
2.3 Backend Go Relayer — 04_backend_relayer_go.md
Item
Problema
Severidade
icp_brasil_signature = "Mock" Doc assume assinatura mock. Produção exige HSM/CloudHSM ou integração com autoridade certificadora (Valid, Certisign, etc.). Não há menção a como gerenciar chave privada e-CNPJ (A1/A3). 🔴 Crítico
Chave privada do Relayer "Assina com a chave privada relayer (Devnet)" — onde essa chave fica guardada? Vercel env vars? KMS? Sem KMS/HSM, vazamento = assinatura fraudulenta de qualquer certificado. 🔴 Crítico
Idempotência Não há idempotency_key no payload. Reenvio de request = dupla emissão (double-spend de certificado). 🟡 Médio
Validação de student_id / institution_id Não verifica se institution_id corresponde a institutions.solana_pubkey ativa no MasterRegistry on-chain. Race condition: IES desativada on-chain mas ativa no Supabase. 🟡 Médio
SPL Memo Program ID Hardcoded Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo — correto para mainnet/devnet, mas não parametrizado. 🟢 Baixo
Timeout RPC 10s Vercel serverless max exec = 60s (Pro) / 10s (Hobby). 10s RPC timeout consome todo o budget. Precisa async pattern (polling/webhook) ou aumentar timeout. 🟡 Médio
Rate limiting / DDoS Não mencionado. Endpoint público /issue_certificate exposto a spam. 🟡 Médio
2.4 Frontend — 05_frontend_spec.md
Item
Problema
Severidade
Rotas definidas mas sem auth matrix /admin-protocol (Super Admin), /university (IES), /student (WaaS), /validator (público). Não define como diferenciar IES vs Aluno vs Admin no Supabase Auth (custom claims? roles table?). 🟡 Médio
/validator "drag & drop PDF" Extrai hash do PDF no frontend? PDFs têm metadados variáveis (timestamps, IDs internos). Hash do arquivo ≠ hash do payload canônico. Validador deve recomputar hash canônico (campos fixos) ou receber tx_signature direto. 🟡 Médio
WaaS (Wallet-as-a-Service) "Backend provisiona carteira invisível" — como assina transações SBT (Metaplex) se a chave é custodial? Precisa de backend signer ou delegated signing (session keys). Não documentado. 🔴 Crítico
QR Code export /student exporta QR — qual payload? solana_tx_signature? document_hash? Deep link para /validator?tx=...? Não especificado. 🟢 Baixo
2.5 Segurança / LGPD / ICP-Brasil — 06_security_lgpd_icp.md
Item
Problema
Severidade
Direito ao esquecimento "Hash na blockchain torna-se órfão" — correto tecnicamente, mas juridicamente frágil. ANPD pode considerar que hash + assinatura ICP-Brasil + timestamp = dado pseudonimizado correlacionável. Precisa de parecer jurídico formal. 🟡 Médio
ICP-Brasil "Mock" Assinatura off-chain gerada pelo backend. Quem audita o backend? Se o relayer for comprometido, emite assinaturas válidas para certificados falsos. Precisa: auditoria de código, attestation (AWS Nitro / GCP Confidential), log imutável de emissões. 🔴 Crítico
Chave e-CNPJ (A1/A3) Não define: A1 (arquivo .pfx) — onde armazena? A3 (token/smartcard) — como integra com serverless? Serverless não tem acesso a HSM USB. Precisa CloudHSM ou serviço de assinatura remota (ex: Lacuna, Valid). 🔴 Crítico
zkTLS / Reclaim Protocol (Fase 2) Mencionado mas sem especificação de fluxo: como o aluno prova posse de certificado Coursera sem expor credenciais? Reclaim gera prova de TLS — mas Coursera pode mudar DOM/HTML a qualquer momento, quebrando seletores. 🟡 Médio
2.6 Arquitetura Geral — 01_architecture_overview.md
Item
Problema
Severidade
Solana Devnet only Doc menciona "Devnet" no relayer. Produção exige Mainnet-Beta. Custos: ~0.000005 SOL/tx (Memo) + ~0.001 SOL/SBT mint + rent. Viável, mas precisa estimativa de custo por emissão. 🟡 Médio
Single RPC endpoint "Solana RPC" — sem menção a redundância (QuickNode, Helius, Triton, GenesysGo). Falha de RPC = parada total de emissões. 🟡 Médio
Vercel Serverless + Go Go no Vercel = @vercel/go (experimental, suporte limitado). Cold starts ~200-500ms. Para alta throughput, melhor: Fly.io, Railway, ou AWS Lambda (ARM/Graviton). 🟡 Médio
Supabase Auth + WaaS Supabase Auth gera JWT. Backend Go valida JWT → deriva wallet custodial. Como garantir que wallet derivado = mesmo do on-chain? Precisa derivação determinística (HD wallet BIP44) ou mapeamento 1:1 em tabela. 🟡 Médio
2. ANÁLISE DE NEGÓCIO — LACUNAS E RISCOS
Área
Lacuna / Risco
Recomendação
Go-to-Market B2B SaaS para IES — ciclo de venda longo (6-18 meses), exige aprovação jurídica, TI, reitoria. Sem pilot/POC definido. Definir 1-2 IES piloto (ex: UNAMA, Estácio, Uninter) com MOU assinado antes de dev.
Pricing Não há modelo: por emissão? assinatura mensal? % por validação? Modelo híbrido: setup fee + mensalidade + per-emissão (volume). Benchmark: DocuSign, Clicksign, OriginalMy.
Concorrência OriginalMy (blockchain + ICP-Brasil, foco cartório), Clicksign/ClickCert (assinatura digital), Diploma Digital MEC (sistema oficial gratuito), Blockcerts (open standard). Diferencial claro: horas complementares + zkTLS externo + SBT diploma + UX zero-crypto. Focar em "horas complementares" como beachhead.
Regulatório MEC Portaria 330/2018 exige registro no RND (Registro Nacional de Diplomas). LattesChain não substitui RND — é camada complementar. Precisa deixar claro no marketing para não prometer "diploma válido sem RND". Posicionar como "camada de integridade e portabilidade" + integração futura com RND via API.
LGPD / ANPD Hash + assinatura = dado pseudonimizado. Risco de multa se ANPD considerar identificável. Contratar assessoria jurídica especializada (ex: Opice Blum, Baptista Luz). Documentar DPIA (Data Protection Impact Assessment).
Chave e-CNPJ IES precisam fornecer chave privada A1 ou acesso a A3. Barreira de adoção alta — TI da IES não costuma compartilhar certificado. Oferecer: (1) geração de par de chaves dedicado ao protocolo (não e-CNPJ raiz), (2) integração com autoridade certificadora via API, (3) modelo "traga seu HSM".
Validador RH "Verificação instantânea" — mas RH não tem incentivo para trocar processo atual (e-mail/telefone para secretaria). Criar marketplace de validadores, API para ATS (Gupy, Kenoby, Vagas.com), credenciamento "LattesChain Verified".
Aluno / WaaS "Zero-crypto-knowledge" — mas portabilidade real exige que aluno possa exportar chave (self-custody). Se wallet é 100% custodial, aluno fica preso (vendor lock-in). Planejar "graduation to self-custody": exportar private key ou transferir SBT para wallet externa.
Tokenomics / Incentivos Não há token nativo — como sustentar relayer, RPC, storage long-term? Taxa por emissão (BRL/USDC) paga ao protocolo; tesouraria multi-sig; governança futura via DAO.
Internacionalização Foco só Brasil (CNPJ, ICP-Brasil, MEC). Não escala. Manter core modular; pluggable "Trust Anchors" por jurisdição (eIDAS EU, NIST US, etc.).
3. QUALIDADE DA DOCUMENTAÇÃO / PROMPTS
Documento
Concisão
Clareza
Completude
Ação
01_architecture_overview.md ✅ Boa ✅ Boa 🟡 Média (falta custos, RPC redundancy, disaster recovery) Expandir seção "Operação em Produção"
02_data_models.md ✅ Boa ✅ Boa 🟡 Média (falta RLS policies, índices, tabelas auxiliares) Adicionar SQL completo + RLS
03_smart_contracts_anchor.md ✅ Boa 🟡 Média (falta validação ICP on-chain, instruções admin) 🔴 Baixa (esqueleto apenas) Reescrever com spec completa
04_backend_relayer_go.md ✅ Boa ✅ Boa 🔴 Baixa (mock ICP, sem KMS, sem idempotência) Reescrever com fluxo produção
05_frontend_spec.md ✅ Boa 🟡 Média (falta auth matrix, validador PDF hash) 🔴 Baixa (só rotas) Adicionar wireframes / user flows
06_security_lgpd_icp.md ✅ Boa ✅ Boa 🟡 Média (falta DPIA, key management, threat model) Adicionar threat model STRIDE
LattesChain.md (master doc) 🟡 Verboso 🟡 Repetitivo ✅ Boa visão geral Consolidar como SPEC única + separar em ADRs
educore_orchestrator skill ✅ Concisa ✅ Clara 🔴 Incompleta (sem testes, CI/CD, deploy, monitoring) Expandir significativamente
Principais problemas de documentação:

Duplicação: LattesChain.md repete conteúdo dos docs numerados.
Ausência de ADRs (Architecture Decision Records) — decisões como "por que Solana?", "por que Go?", "por que Metaplex Core?" não estão documentadas.
Sem especificação de API (OpenAPI/Swagger) para backend.
Sem threat model (STRIDE) nem diagrama de fluxo de dados (DFD).
Skill do orchestrator é só lista de comandos — não ensina como desenvolver, testar, deployar, monitorar.
5. AGENTES, CONTEXTOS E SKILLS PROPOSTOS
5.1 Agents Necessários (para desenvolvimento futuro)
Agent
Responsabilidade
Skills Necessárias
anchor-dev Smart contracts Solana/Anchor anchor-lang, solana-program, rust-testing, solana-cli
go-relayer-dev Backend Go Serverless (Vercel/Fly.io) go-serverless, solana-go, supabase-go, kms-integration
nextjs-frontend-dev Frontend Next.js 14+ App Router nextjs-app-router, tailwind, supabase-auth, solana-web3js, waas-integration
supabase-architect DB schema, RLS, migrations, Auth config postgresql, supabase, row-level-security, database-migrations
security-auditor Threat model, LGPD compliance, key management threat-modeling, lgpd-compliance, icp-brasil, key-management
product-manager Priorização, GTM, pricing, métricas b2b-saas-gtm, product-analytics, user-research
devops-engineer CI/CD, monitoring, RPC redundancy, disaster recovery github-actions, vercel, flyio, solana-rpc-monitoring, observability
5.2 Skills a Criar/Expandir (no diretório .agents/skills/)
Skill
Descrição
Prioridade
educore_anchor_contracts Spec completa + testes + deploy scripts para Anchor 0.29/0.30 🔴 Crítica
educore_go_relayer Backend production-ready: KMS, idempotency, async RPC, ICP-Brasil real 🔴 Crítica
educore_nextjs_frontend App Router + Tailwind + Supabase Auth + WaaS + Solana wallet adapter 🔴 Crítica
educore_supabase_schema SQL completo: tabelas, índices, RLS policies, functions, triggers 🔴 Crítica
educore_security_lgpd DPIA, threat model STRIDE, key ceremony, HSM/CloudHSM integration 🔴 Crítica
educore_zkTLS_integration Reclaim Protocol / zkTLS para Coursera/Udemy — spec + fallback 🟡 Fase 2
educore_devops CI/CD (GitHub Actions), multi-env (dev/staging/prod), monitoring (Sentry, Datadog, Helius) 🟡 Alta
educore_product_growth GTM, pricing, metrics (NRR, CAC, LTV), pilot framework 🟡 Alta
5.3 Contextos Compartilhados (para injetar nos agents)

# .hermes/contexts/educore_project.yaml

project:
  name: "EduCore Protocol (LattesChain)"
  repo_root: "C:/Users/alexk/Desktop/LattesChain"
  stack:
    frontend: "Next.js 14+ App Router, Tailwind CSS, @solana/web3.js, @supabase/supabase-js"
    backend: "Go 1.22+ Serverless (Fly.io preferred over Vercel), solana-go, supabase-go"
    contracts: "Rust, Anchor 0.29/0.30, SPL Memo, Metaplex Core"
    db: "Supabase PostgreSQL 15+ (PostgREST, Realtime, Auth, Storage)"
    blockchain: "Solana Mainnet-Beta (Devnet para test), RPC: Helius + QuickNode redundant"
  identities:
    super_admin: "Multisig (3/5) via Squads or custom PDA"
    university: "e-CNPJ A1/A3 or dedicated keypair registered in MasterRegistry"
    student: "Supabase Auth (email/OAuth) → deterministic custodial wallet (BIP44)"
  compliance:
    lgpd: "Strict off-chain PII; on-chain only hash + sig + timestamp; DPIA required"
    icp_brasil: "Portaria MEC 330/2018, 554/2019; CloudHSM (AWS CloudHSM / Azure Key Vault) for signing"
  business:
    pricing_model: "Setup BRL 15k + Monthly BRL 3k + Per-issuance BRL 0.50 (volume discounts)"
    target_market: "IES privadas EAD (top 50), Corporate universities, Edtechs"
    pilot_target: "2 IES (MOU signed) before mainnet launch"
6. PRÓXIMOS PASSOS RECOMENDADOS (ORDEM DE PRIORIDADE)

#

Ação
Responsável
Entregável
1 Reescrever 03_smart_contracts_anchor.md com spec completa (validação ICP on-chain, instruções admin, pausable, events) anchor-dev Spec v1.0 + Cargo.toml
2 Definir gestão de chaves ICP-Brasil (CloudHSM, cerimônia, rotação, disaster recovery) security-auditor Key Management Doc + Architecture Decision Record
3 Criar educore_supabase_schema skill com SQL completo + RLS policies testáveis supabase-architect supabase/migrations/001_initial_schema.sql
4 Escrever OpenAPI spec para backend Go (/api/issue_certificate, /api/verify, /api/batch) go-relayer-dev api/openapi.yaml
5 Threat Model STRIDE + DPIA LGPD formal security-auditor docs/THREAT_MODEL.md, docs/DPIA.pdf
6 Consolidar documentação em SPEC.md única + ADRs em docs/adr/ product-manager SPEC.md, docs/adr/001-why-solana.md, etc.
7 Expandir educore_orchestrator skill com workflows completos (dev, test, deploy, monitor) devops-engineer Skill atualizada
8 Fechar MOU com 1-2 IES piloto (definir escopo, SLA, custos, timeline) product-manager MOU assinado
9 Prototipar validador /validator (hash canônico vs PDF upload, RPC fallback) nextjs-frontend-dev Demo funcional em Devnet
10 Definir tokenomics / sustainability (fee switch, treasury, governance) product-manager Tokenomics litepaper
7. DECISÕES TÉCNICAS PENDENTES (REQUEREM SUA APROVAÇÃO)
Decisão
Opções
Minha Recomendação
Backend hosting Vercel (Go experimental) vs Fly.io (Go nativo, VMs, scale-to-zero) vs AWS Lambda Fly.io — melhor suporte Go, custo previsível, secrets management nativo, websockets para RPC
RPC Provider QuickNode vs Helius vs Triton vs GenesysGo + self-hosted Helius (primary) + QuickNode (fallback) — melhores webhooks, DAS API, prioridade tx
ICP-Brasil Signing (A) CloudHSM AWS + Lambda signer (B) Serviço terceirizado (Lacuna, Valid, Certisign) (C) HSM on-prem da IES + relayer proxy (A) AWS CloudHSM + Lambda — controle total, auditável, serverless, custo ~$1.4k/mês + uso
Wallet Custodial (A) Supabase Vault + derivacao BIP44 determinística (B) Turnkey / Privy / Dynamic (C) Lit Protocol (threshold) (A) Supabase Vault + BIP44 — zero custo extra, controle total, integração nativa com Auth
SBT Standard Metaplex Core (novo, imutável) vs Metaplex Legacy (Token Metadata) vs SPL Token 2022 (Non-transferable) Metaplex Core — padrão futuro, mais barato, composable, mas exige migration tool se mudar depois
Validador PDF Hash (A) Frontend extrai texto + canonicaliza + hash (B) Backend recebe PDF + canonicaliza + hash (C) Só aceita tx_signature lookup (B) Backend canonicaliza — evita discrepâncias de PDF viewer/OS; expõe API /verify/pdf
8. RESUMO DE RISCOS CRÍTICOS (MATRIZ)
Risco
Probabilidade
Impacto
Mitigação
Chave e-CNPJ vazada / relayer comprometido Média Catastrófico (emissão fraudulenta em massa) CloudHSM + attestation + auditoria código + circuit breaker on-chain
ANPD considera hash+sig = dado pessoal Média Alto (multa, bloqueio) DPIA formal + parecer jurídico + design privacy-by-default
IES não adotam por burocracia chave e-CNPJ Alta Alto (sem supply side) Oferecer chave dedicada ao protocolo + integração CA API
Solana congestion / outage Baixa Médio (emissões param) RPC redundancy + queue local + async pattern
Metaplex Core breaking changes Baixa Médio (SBTs quebram) Pin version + testes integração + plano migração
zkTLS (Reclaim) quebrado por mudança site Média (Fase 2) Baixo (feature opcional) Fallback manual + monitoramento seletores
Vendor lock-in Supabase/Vercel Média Médio Arquitetura multi-cloud ready (Postgres padrão, Docker Go, Next.js standalone)
9. CHECKLIST DE "DEFINITION OF READY" PARA INÍCIO DE DESENVOLVIMENTO
 Spec completa de Smart Contracts (Anchor) revisada e aprovada
 Key Management Doc (ICP-Brasil + Relayer + Student Wallets) aprovado
 SQL Schema + RLS Policies testados em Supabase local
 OpenAPI Spec do Backend aprovada
 Threat Model STRIDE + DPIA LGPD assinados por jurídico
 MOU assinado com ≥1 IES piloto
 Orçamento aprovado (CloudHSM, RPC, Supabase Pro, Fly.io, auditoria)
 CI/CD pipeline desenhado (GitHub Actions → Devnet → Staging → Mainnet)
 Métricas de sucesso definidas (emissões/dia, latência p99, custo/emissão, adoção validador)
 Runbooks de incidente (key rotation, RPC failure, contract pause, data breach)
Próxima ação sugerida: Quer que eu crie os skills detalhados (arquivos .md em .agents/skills/) para os 3-4 mais críticos (educore_anchor_contracts, educore_go_relayer, educore_supabase_schema, educore_security_lgpd) para que a equipe (ou agents futuros) tenha base sólida para começar a codificar?

Análise concluída. O relatório acima cobre:

Inconsistências técnicas críticas (validação ICP-Brasil on-chain ausente, gestão de chaves e-CNPJ mock, idempotência, WaaS signing)
Lacunas de negócio (GTM, pricing, concorrência MEC/OriginalMy, regulatório, tokenomics)
Problemas de documentação (duplicação, ausência ADRs, threat model, OpenAPI spec)
8 agents propostos com responsabilidades claras
8 skills a criar/expandir (4 críticas para começar)
Contexto compartilhado (YAML) para injeção nos agents
10 próximos passos priorizados com Definition of Ready
6 decisões técnicas pendentes com recomendações
Matriz de riscos com 8 riscos mapeados
Quer que eu crie agora os 4 skills críticos (.agents/skills/) para dar base sólida ao desenvolvimento?

educore_anchor_contracts — Spec completa Anchor + testes + deploy
educore_go_relayer — Backend production-ready (KMS, idempotency, ICP real)
educore_supabase_schema — SQL completo + RLS policies testáveis
educore_security_lgpd — Threat model STRIDE + DPIA + key ceremony
Ou prefere revisar/ajustar alguma decisão técnica (ex: Fly.io vs Vercel, CloudHSM vs serviço terceirizado) antes?

[ATUALIZAÇÃO DE ARQUITETURA E DIRETRIZES DE CÓDIGO]
Assimile as seguintes mudanças estruturais para o desenvolvimento do EduCore Protocol (LattesChain). Estas decisões sobrepõem as diretrizes de infraestrutura anteriores.

1. Mudança de Hosting (Backend):

- Remova a configuração do Go para Vercel Serverless (`vercel.json`).
- O backend em Go será hospedado no Fly.io.
- Crie o arquivo `fly.toml` na raiz do diretório `/api` configurado para um ambiente Go nativo, expondo a porta 8080.

1. Integração Solana RPC:

- Utilize a Helius como provedor principal (implemente a DAS API para buscar os ativos Metaplex Core da carteira do aluno).
- Prepare a QuickNode como URL de fallback no cliente RPC em Go.

1. Custódia de Carteiras (Supabase Vault + BIP44):

- Não utilizaremos provedores de WaaS externos.
- Atualize a tabela de `students` no Supabase. A seed phrase master ficará encriptada no Supabase Vault.
- No backend Go, crie uma função de derivação de chaves (BIP44) que gera a `Pubkey` do aluno de forma determinística baseada no UUID do Supabase Auth dele.

1. Padrão de Tokens (Metaplex Core):

- Todos os Diplomas e Certificados emitidos on-chain devem obrigatoriamente utilizar o padrão Metaplex Core (SBT - Non-Transferable). Atualize as dependências e chamadas do relayer em Go para refletir o programa Core.

1. Validação de Arquivos (Backend Canonicalization):

- Crie uma rota `POST /api/verify/pdf` no backend Go.
- O Frontend (Next.js) não fará o hash. Ele enviará o arquivo `multipart/form-data` para esta rota, e o Go fará a leitura binária bruta, computará o SHA-256, consultará a blockchain e retornará o status de validação.

1. Escopo de Assinatura (MVP vs Produção):

- No código Go (MVP), mantenha a geração do mock da assinatura ICP-Brasil com chave RSA local.
- Documente no README.md a arquitetura de produção final baseada em AWS CloudHSM + Lambda para o signing do e-CNPJ.
