# ADR-004 — Carteiras custodiais próprias: Supabase Vault + derivação BIP44

**Status**: Aceito (2026-08-29) — substitui a consideração de WaaS externo (Turnkey/Privy/Dynamic/Lit)
**Contexto**: O aluno não deve precisar entender crypto ("zero-crypto-knowledge"). Cada aluno precisa de uma carteira Solana determinística, custodial, derivável a qualquer momento (stateless) e exportável no futuro (self-custody graduation). Alternativas: WaaS terceiro, Lit threshold, carteira por request.

## Decisão

**Custódia própria**:
1. **Master seed BIP39** (256 bits) gerada em cerimônia (docs/08 §2.2), armazenada **encriptada no Supabase Vault** (`vault.create_secret`), acesso somente service role.
2. **Derivação determinística por aluno** no relayer Go: path SLIP-10/BIP44 `m/44'/501'/account'/0'/0'` com `account = SHA-256(student_uuid)[0..3]` como u32 — mesma pubkey sempre derivável do UUID.
3. Pubkey derivada persistida em `students.solana_wallet_custodial` (lookup rápido + UNIQUE).
4. A seed **nunca** sai do processo do relayer (memória only, redact em logs).
5. Export self-custody: único fluxo que expõe material do aluno (docs/05 §6), com cooldown e marcação `exported`.

> 🔴 **Correção pendente no código atual** (docs/04 §7.4): `utils/crypto.go` deriva **secp256k1** (BIP32 padrão) e serializa pubkey comprimida em hex — **incompatível com Solana (Ed25519/base58)**. Implementar com `github.com/gagliardetto/solana-go/pkg/hd` (SLIP-10 Ed25519, hardened-only). Qualquer pubkey já gravada com o algoritmo atual deve ser limpa/rederivada antes de uso real.

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **Turnkey / Privy / Dynamic (WaaS)** | Custos por MAU; depósito de trust em terceiro para o ativo MAIS crítico (seed dos alunos); custo de integração; vendor lock-in (o relatório de ideação mapeou lock-in como risco) |
| **Lit Protocol (threshold MPC)** | Elegante (sem seed única), mas rede/latência/tokens e complexidade de integração fora do MVP |
| **Keypair aleatória por aluno** (não determinística) | Necessita armazenar 32 bytes por aluno = mesma exposição com menos flexibilidade; derivação stateless é mais robusta a restore |

## Consequências

**Positivas**: zero custo de infra terceira; derivação stateless (idempotente — regenerar do UUID sempre); integração nativa com Supabase Auth (UUID já existe); export direto para o aluno.

**Negativas/Riscos**: **a master seed é o maior blast radius do sistema** (docs/08 §2, threat model T5) — cerimônia + redact + breaker obrigatórios; sem rotação prática (mitigação: segmentação por coorte no futuro); responsabilidade legal da custódia recai no protocolo (jurídico deve validar em contrato de adesão).

**Escopo de produção**: migração do Vault para KMS/HSM-backed (mesma API, troca de backend de armazenamento) planejada — docs/08 §2.4.
