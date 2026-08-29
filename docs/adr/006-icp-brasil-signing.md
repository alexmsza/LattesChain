# ADR-006 — Assinatura ICP-Brasil: mock no MVP → AWS CloudHSM + Lambda na produção

**Status**: Aceito (2026-08-29)
**Contexto**: A assinatura digital da IES (e-CNPJ, Portarias MEC 330/2018 e 554/2019) é o pilar jurídico do protocolo. Serverless não acessa HSM USB (A3); A1 (`.pfx`) em disco é inaceitável em produção. No MVP não há certificado real — precisa de caminho claro do mock ao produção.

## Decisão

**Dois estágios**:

### Estágio 1 — MVP (atual, Devnet apenas)
- Assinatura mock no relayer Go: string rotulada `MOCK_ICP_BRASIL_SIGNATURE_*`.
- `utils.MockICPBrasilSign` (ECDSA local) serve para testes de pipeline.
- Flag `EDUCORE_APP_MOCK_ICP_SIGNING=true` (default). Documentado no README: **sem valor jurídico**.

### Estágio 2 — Produção (bloqueante para Mainnet)
- **AWS CloudHSM (FIPS 140-2 L3)** + **Lambda signer** em VPC:
  1. Relayer Go (Fly.io) → HTTPS/mTLS → Lambda signer.
  2. Lambda → PKCS#11 → CloudHSM assina o `document_hash` com a chave A1 da IES.
  3. Retorna PKCS#7/CMS → base64 → relayer persiste (Supabase) e grava **hash da assinatura** on-chain (ver trade-off §Trade-off de tamanho).
- Import da chave A1 em **cerimônia** (docs/08 §4.1); certificado **dedicado ao protocolo** recomendado (não o e-CNPJ raiz).
- Auditoria: CloudTrail + logs HSM + `verification_logs`.
- Custo referência: ~US$ 1.4k/mês CloudHSM + Lambda por uso. Alternativa para pilot: serviços de assinatura remota (Valid, Certisign, Lacuna) — decisão por IES no onboarding.

### Trade-off de tamanho on-chain (pendente de implementação)
Assinatura PKCS#7 real tem 1-4 KB; no evento Anchor/Memo ela infla o log e pode estourar o limite de 1.232 bytes da transação. **Acordado**: on-chain grava-se apenas `SHA-256(icp_signature)` (64 chars); a assinatura completa fica off-chain (Supabase) e o validador a recupera por `document_hash`. Mudança de schema do evento (docs/03 §8.3) a fazer **antes do primeiro deploy Mainnet**.

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **(B) Serviço terceirizado direto** (Valid/Certisign/Lacuna para tudo) | Delega o pilar jurídico a terceiro por integração fechada; custo por assinatura imprevisível em volume; mantida como opção por IES |
| **(C) HSM on-prem da IES + relayer proxy** | A3 USB impossível com Fly.io; on-prem = SLA/ops da IES no caminho crítico de emissão |
| **Manter mock em produção** | Juridicamente nulo; fraude de "autenticidade" simulada — inaceitável |

## Consequências

**Positivas**: controle total e auditável da chave; serverless-friendly; caminho claro mock→real sem redesign de API (a troca é interna ao signer).

**Negativas/Riscos**: custo fixo CloudHSM (mitigação: pilot usa serviço remoto por uso); mais um serviço na cadeia (Lambda) — health check e RB-03 devem cobri-lo; dependência AWS (aceita: serviço commodity, trocável).
