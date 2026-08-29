# EduCore Protocol — Segurança, LGPD e ICP-Brasil

> Documentos irmãos: threat model completo em `docs/09_threat_model.md`; gestão de chaves em `docs/08_key_management.md`; ADR-006 (assinatura).

## 1. Compliance com LGPD (Lei nº 13.709/2018)

A imutabilidade das blockchains públicas impõe um desafio direto ao **Direito à Eliminação/Esquecimento** (Art. 18, VI).

### 1.1 Estratégia de Isolamento Criptográfico
1. **Nenhuma PII on-chain**: proibido gravar CPF, nome, RG ou e-mail em SPL Memo, contas Anchor ou metadados de tokens (política em `.agents/rules/educore_standards.md`).
2. **Dados on-chain estritamente pseudonimizados**: apenas `document_hash` (SHA-256), `icp_brasil_signature` (ou seu hash — ADR-006), pubkeys e timestamps.
3. **Direito ao esquecimento off-chain**: exclusão/anonimização do registro no Supabase (`students`, `academic_records`); o hash on-chain torna-se órfão e **não correlacionável** sem o índice off-chain.

### 1.2 ⚠️ Risco ANPD (dado pseudonimizado ≠ anônimo)
A ANPD pode considerar `hash + assinatura + pubkey + timestamp` como **dado pessoal pseudonimizado** (reidentificável mediante esforço razoável, ex.: posse do PDF). Não há jurisprudência consolidada. Mitigações obrigatórias antes de produção:
- **DPIA** (Relatório de Impacto à Proteção de Dados, Art. 5º XVII / Resolução CD/ANPD nº 2/2022) — template e responsáveis no `docs/09_threat_model.md` §9.
- **Parecer jurídico formal** especializado em LGPD + blockchain.
- Design privacy-by-default: minimização (hash do arquivo, não do aluno), retenção limitada de IPs (`docs/02_data_models.md` §5.3), finalidade explícita no contrato de adesão da IES.

### 1.3 Base legal e direitos
- Base legal para processamento: **execução de contrato** (Art. 7º, V — serviço de certificação contratado pela IES) + **legítimo interesse** para logs de auditoria.
- Direitos do titular (Art. 18): acesso/portabilidade (timeline exportável), correção (retificação via novo registro), **eliminação** (soft delete off-chain; ver §1.1.3), informação (landing + política de privacidade).
- Titular menor de idade: consentimento dos responsáveis (Art. 14) — fluxo a definir com jurídico (público EAD pode incluir <18).

## 2. Validação Jurídica ICP-Brasil

### 2.1 Marco regulatório
- **Portarias MEC 330/2018 e 554/2019**: diplomas digitais exigem assinatura com certificado padrão ICP-Brasil (e-CNPJ da IES) e registro no **RND**.
- **Posicionamento do produto**: LattesChain é **camada complementar de integridade/portabilidade** — não substitui o RND nem o diploma oficial. Marketing e contratos devem dizer isso explicitamente (risco regulatório senão).

### 2.2 MVP (estado atual)
Assinatura mock no relayer Go: `"MOCK_ICP_BRASIL_SIGNATURE_" + hash[:16]` — sem valor jurídico, serve apenas para o pipeline end-to-end em Devnet. `utils.MockICPBrasilSign` (ECDSA secp256k1 local) existe como utilitário de teste.

### 2.3 Produção (alvo)
- **AWS CloudHSM + Lambda signer**: chave e-CNPJ (A1) da IES em HSM FIPS 140-2 L3; Lambda faz o signing sob demanda com audit trail (CloudTrail + CloudWatch). Alternativas avaliadas em ADR-006 (serviços de assinatura remota: Valid, Certisign, Lacuna).
- **Fluxo de assinatura**: relayer Go → API interna do signer (mTLS + IAM) → CloudHSM assina `document_hash` → PKCS#7/CMS → base64 → persistido + hash on-chain.
- **Chave dedicada ao protocolo** (recomendação): em vez de usar o e-CNPJ raiz da IES, emitir certificado dedicado (AC emissor credencia a mesma pessoa jurídica) — reduz barreira de adoção e blast radius.

### 2.4 Auditoria cruzada (validador)
1. Validador obtém a pubkey da IES via `MasterRegistry`/`UniversityRecord` on-chain (fonte de verdade).
2. Verifica a assinatura ICP-Brasil do `document_hash` contra a chave da IES.
3. Verifica a tx Solana (Memo/evento) e o timestamp.

**Pré-condição**: o validator precisa do certificado ICP-Brasil (cadeia pública) para validar a assinatura — cache de cadeias + CRL/OCSP.

## 3. Segurança Aplicativa (resumo)

| Domínio | Controle | Status |
| :--- | :--- | :--- |
| Segredo de API | Service role key via `fly secrets` — **jamais** no frontend; anon key apenas no público | 🟡 definido, aplicar |
| Vault master seed | Supabase Vault, acesso somente service role; cerimônia de geração em `docs/08_key_management.md` | 🔴 integração pendente |
| RLS | Todas as tabelas; políticas em `002_rls_policies.sql` (gaps em `docs/02_data_models.md` §5) | 🟡 escrito, testes pendentes |
| Transporte | `force_https` no Fly.io + HSTS | 🟡 config pronta |
| Rate limit | Endpoints públicos (`verify/pdf`, health) | 🔴 pendente |
| Logs | zerolog estruturado; nunca logar PII/secret | 🟡 aplicar revisão |
| Auditoria | `verification_logs` + eventos on-chain + CloudTrail (signer) | 🟡 parcial |

## 4. Incidentes

Runbooks operacionais (detalhe passo a passo): `docs/10_runbooks.md` — vazamento de chave relayer, comprometimento do relayer, pause on-chain, RPC down, breach de dados Supabase, rotação de authority, reconstrução de índice.

Disclosura responsável: `security.md` no repositório (a criar) + contato de segurança dedicado.
