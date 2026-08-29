# EduCore Protocol — Gestão de Chaves (Key Management)

> Escopo: **todas** as chaves do sistema — master seed de carteiras alunos, relayer signer, authority do contrato, e-CNPJ (ICP-Brasil).
> Princípio: nenhuma chave em código, env var de dev-commit, ou laptop. Toda chave tem dono, rotação e runbook.

## 1. Inventário de Chaves

| # | Chave | Algoritmo | Onde vive (MVP) | Onde viverá (Produção) | Dono |
| :--- | :--- | :--- | :--- | :--- | :--- |
| K1 | Master seed BIP39 (carteiras alunos) | BIP39/SLIP-10 Ed25519 | Supabase Vault (a integrar) | Supabase Vault + HSM-backed KMS externo (fase) | Protocolo |
| K2 | Relayer signer (Devnet) | Ed25519 | `fly secrets` (env) | Fly secrets + rotação; limite por IES programado | DevOps |
| K3 | `MasterRegistry.authority` (Super Admin) | Ed25519 | keypair dev | **Multisig Squads 3/5** + timelock | Protocolo |
| K4 | Chave da IES (emissor on-chain) | Ed25519 | keypair por IES (Devnet) | Keypair dedicado gerenciado pela IES (ou CloudHSM da IES) | IES |
| K5 | e-CNPJ A1/A3 (assinatura jurídica) | RSA/ECDSA PKCS#11 | **mock** (não existe) | **AWS CloudHSM** (A1 em HSM) ou A3 via serviço de assinatura remota | IES |
| K6 | Supabase service role key | opaque | fly secrets | fly secrets + rotação periódica | DevOps |
| K7 | API keys Helius/QuickNode | opaque | fly secrets | fly secrets + IP allowlist | DevOps |

## 2. K1 — Master Seed BIP39 (carteiras custodiais) 🔴 mais crítica

### 2.1 O que está em jogo
Cada aluno tem carteira derivada deterministicamente (`m/44'/501'/account'/0/0`, account ← SHA-256(student_uuid)). **Quem tem a master seed tem TODAS as carteiras dos alunos** — pode transferir/queimar SBTs (diplomas) de todos. É o pior caso de blast radius do sistema.

### 2.2 Cerimônia de geração (obrigatória antes do primeiro aluno real)
1. Ambiente limpo (VM efêmera, sem rede após setup), 2+ testemunhas (engenharia + diretoria), registro em ata.
2. `GenerateMasterSeed()` (BIP39, 256 bits) em Go ou `solana-keygen new --no-bip39-passphrase`.
3. **Backup da mnemonic**: 2+ cópias em papel/metal, lacradas, cofres geograficamente separados (ex.: escritório jurídico + cofre bancário). Nada digital sem encriptação.
4. **Gravação no Supabase Vault**: `vault.create_secret()` — o Vault encripta com a TON (Tenant Owner Key) gerenciada pelo Supabase; documentar quem tem acesso ao projeto.
5. **Verificação**: derivar 3 wallets de teste, gravar pubkeys, destruir ambiente. Re-derivar do Vault em outro ambiente e conferir.
6. Rotation: **não existe rotação prática de master seed** (quebraria todas as derivações). Mitigação = segmentação (ver 2.4).

### 2.3 Regras operacionais
- A seed sai do Vault **apenas em memória do relayer**, por request, para assinar/derivar. Nunca logada (redact em zerolog), nunca retornada em API.
- Acesso à tabela Vault: apenas `service_role` (RLS já garante — sem policies públicas).
- **Circuit breaker**: env `EDUCORE_APP_DISABLE_DERIVATION` desativa derivação em caso de suspeita.
- A exportação para o aluno (`/student/export`) é o **único** fluxo que expõe material derivado — e expõe a chave do aluno, nunca a master seed.

### 2.4 Escalação futura (além do MVP)
- Segmentar por coorte (1 seed a cada N alunos) para limitar blast radius.
- Migrar derivação/assinatura para **KMS/HSM** (AWS CloudHSM com SLIP-10, ou Turnkey) — mantém a API igual, troca o backend.
- Threshold signing (Lit/GG20) elimina o ponto único — fora do MVP.

## 3. K3 — Authority do MasterRegistry

- **MVP/Devnet**: keypair único do deploy (K3 simples). Aceitável só enquanto não há valor real.
- **Produção**: authority = **multisig Squads 3/5** (time fundador + jurídico + 1 assinante externo). Rotate via `rotate_authority` para o endereço do multisig **antes** de qualquer registro real de IES.
- `rotate_authority` direto é perigoso (chave errada = lockout permanente): em produção, envolver timelock/simulação — a instrução atual não tem delay; até lá, usar cerimônia dupla (2 pessoas conferem o endereço novo + testemunha on-chain de teste com valor mínimo).
- Runbook: RB-05 (`docs/10_runbooks.md`).

## 4. K5 — e-CNPJ (ICP-Brasil) na produção

### 4.1 Arquitetura alvo (AWS CloudHSM + Lambda)
```
Relayer Go (Fly.io)
   │ HTTPS + mTLS/IAM
   ▼
API Signer (Lambda, VPC com CloudHSM)
   │ PKCS#11
   ▼
CloudHSM (FIPS 140-2 L3) — chave A1 da IES (importada em cerimônia)
   │
   ▼
PKCS#7/CMS assinado sobre document_hash → base64 → relayer
```
- Import da chave A1 (`.pfx`) em cerimônia com 2 testemunhas; o arquivo original é destruído após import (ou a IES mantém A3 físico e usa **serviço de assinatura remota** — Valid/Certisign/Lacuna).
- Auditoria: CloudTrail (quem chamou), logs HSM (o que foi assinado), `verification_logs` (correlação com emissão).
- Custo de referência: CloudHSM ~US$ 1,4k/mês + Lambda. Alternativa mais barata para pilot: serviço de assinatura remota por uso.
- **Recomendação de produto**: oferecer à IES **certificado dedicado ao protocolo** (não o e-CNPJ raiz) — barreira de adoção menor e blast radius contido (chave comprometida afeta só emissões EduCore, revogável sem trocar o e-CNPJ).

### 4.2 MVP
`MockICPBrasilSign` (ECDSA local em `utils/crypto.go`) + string mock no handler — sem valor jurídico; rotulado em toda a documentação. Flag `EDUCORE_APP_MOCK_ICP_SIGNING=false` é **bloqueante** para Mainnet.

## 5. K2 — Relayer Signer

- Devnet: env var base58 em `fly secrets` (aceitável).
- Produção: signer dedicado por ambiente; solução alvo = signer por IES (o programa já exige `institution_signer == UniversityRecord.institution_pubkey` — ou seja, **o modelo final é a própria IES assinar** via sua chave K4, com o relayer apenas orquestrando). Até lá, para emissões MVP, o relayer assina Memo/log em nome da IES — documentar essa limitação de trust no threat model (§9 T3).
- Rotação: nova keypair → trocar secret → restart; sem estado on-chain atrelado ao relayer.

## 6. Boas práticas transversais

- **4-eyes**: nenhuma operação com K1/K3/K5 por uma pessoa só (cerimônias, exports).
- **Secrets**: só `fly secrets` (nada em `fly.toml` — o arquivo já está correto, só comentários).
- **Rotação K6 (service role)**: a cada 90 dias no Supabase dashboard; manter janela de sobreposição.
- **Logs**: redact de `RELAYER_PRIVATE_KEY`, seed, mnemonics; nunca logar `document_metadata` completo em produção (contém curso — dado não-sensível mas do titular).
- Toda chave nova entra nesta página (inventário) + runbook correspondente.
