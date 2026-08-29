# EduCore Protocol — Backend Relayer (Go Serverless)

## 1. Localização e Ambiente

- **Diretório**: `api/`
- **Runtime**: Vercel Serverless Functions (`@vercel/go`)
- **Dependências**:
  - `github.com/gagliardetto/solana-go` (interação Solana RPC / Devnet)
  - `github.com/supabase-community/supabase-go` ou cliente HTTP/Postgres

## 2. Endpoints e Fluxos

### 2.1 `POST /api/issue_certificate`

**Payload de Entrada (JSON)**:

```json
{
  "student_id": "uuid-do-aluno",
  "institution_id": "uuid-da-ies",
  "document_metadata": {
    "course_name": "Engenharia de Software",
    "workload_hours": 360,
    "type": "HORAS_COMPLEMENTARES"
  }
}
```

**Etapas de Execução**:

1. **Validação de Entrada**: Sanitização dos identificadores e metadados.
2. **Geração de Hash SHA-256**: Computa o digest criptográfico dos dados do documento.
3. **Assinatura ICP-Brasil Mock**: Simula assinatura digital do hash via certificado e-CNPJ da instituição.
4. **Broadcast SPL Memo na Solana**:
   - Cria instrução SPL Memo (`Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo`).
   - Assina com a chave privada relayer (Devnet) e envia transação.
   - Obtém a `tx_signature` da Solana.
5. **Persistência Off-Chain**:
   - Grava o registro em `academic_records` no Supabase.
6. **Resposta (JSON)**:

```json
{
  "status": "success",
  "document_hash": "sha256...",
  "solana_tx_signature": "5K...",
  "icp_signature": "sig..."
}
```

### 2.2 Tratamento de Erros e Concorrência

- Context timeouts para chamadas RPC Solana (máx. 10s).
- Fallback em caso de falha de conexão RPC.
- Retorno HTTP 400 para payloads inválidos e HTTP 500 para falhas de rede blockchain/banco.
