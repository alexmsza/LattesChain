# Documento Técnico 18: Manual de Integração Externa de APIs e ERPs Legados

**Protocolo:** LattesChain (EduCore Protocol)  
**Versão da API:** v1.0.0  
**Data:** Setembro de 2026  
**Responsável Técnico:** Alex Miqueias (Jovian Tech)  
**Padrão de Conformidade:** DataSecAIOps, MEC Portaria nº 330/2018, MEC Portaria nº 554/2019 e LGPD  

---

## 1. Visão Geral da Arquitetura de Integração

A API REST do **LattesChain** permite que sistemas acadêmicos legados (TOTVS RM, Sophia, Lyceum) e plataformas de Recursos Humanos / ATS (Gupy, Workday, SAP SuccessFactors) emitam, auditem e consultem registros acadêmicos imutáveis na blockchain Solana **sem fricção de criptomoedas (Zero Cripto Integration)**.

```mermaid
sequenceDiagram
    autonumber
    actor Aluno as Aluno / Graduado
    participant ERP as ERP Legado (TOTVS RM / Sophia)
    participant API as LattesChain Gateway API v1
    participant Relayer as Relayer Fee Payer Gasless
    participant Solana as Solana Mainnet-Beta
    participant ATS as Plataforma RH / ATS (Gupy / Workday)

    ERP->>API: POST /api/v1/credentials/issue (x-api-key + JSON diploma)
    API->>API: Valida API Key, escopos e calcula Hash SHA-256 canônico
    API->>Relayer: Envia instrução de ancoragem com co-assinatura corporativa
    Relayer->>Solana: Transação On-Chain (Concurrent Merkle Tree / Bubblegum)
    Solana-->>API: Confirmação e Assinatura Tx (Finalized)
    API-->>ERP: HTTP 201 (Tx Signature + Hash SHA-256 + Explorer URL)
    
    Note over ATS,Solana: Verificação instantânea sem login
    ATS->>API: POST /api/v1/credentials/verify { document_hash }
    API->>Solana: Valida integridade criptográfica
    API-->>ATS: HTTP 200 { valid: true, institution, student, status: "VERIFIED_ONCHAIN" }
```

---

## 2. Autenticação e Segurança (API Tokens)

### 2.1. Como obter uma Chave de API
O Super Administrador do protocolo gera as credenciais diretamente no Painel de Governança (`/admin-protocol`) na aba **Chaves de API & ERPs**.
- Chaves em produção iniciam com o prefixo `lat_live_`
- Chaves em ambiente de homologação iniciam com `lat_test_`

### 2.2. Cabeçalhos de Requisição Obrigatórios
A autenticação pode ser enviada por qualquer uma das duas abordagens:
1. Header `x-api-key`:
   ```http
   x-api-key: lat_live_63e13cb38dc5c31d112cb509df8c80e7be7a6c087340ff7b
   ```
2. Header `Authorization: Bearer`:
   ```http
   Authorization: Bearer lat_live_63e13cb38dc5c31d112cb509df8c80e7be7a6c087340ff7b
   ```

### 2.3. Matriz de Escopos (Scopes)
| Escopo | Descrição | Casos de Uso Típicos |
| :--- | :--- | :--- |
| `credentials:issue` | Permite emissão e ancoragem de diplomas e certificados | ERPs acadêmicos (TOTVS, Sophia, Lyceum) |
| `credentials:verify` | Permite auditoria detalhada de diplomas e históricos | ATS de RH, birôs de background check, conselhos (CRM, OAB) |
| `students:read` | Consulta o passaporte acadêmico do estudante por CPF | Portais do aluno, secretarias virtuais |
| `institutions:read` | Consulta a listagem de IES credenciadas e suas chaves | Diretórios e parceiros institucionais |

---

## 3. Especificação dos Endpoints REST

### 3.1. Health Check
- **Rota:** `GET /api/v1/health`
- **Autenticação:** Pública (não requer chave).
- **Resposta de Sucesso (HTTP 200):**
```json
{
  "status": "healthy",
  "protocol": "LattesChain (EduCore Protocol)",
  "version": "v1.0.0",
  "network": "devnet",
  "compliance": [
    "MEC Portaria 330/2018",
    "MEC Portaria 554/2019",
    "LGPD Art. 18"
  ],
  "latency_ms": 12,
  "timestamp": "2026-09-06T22:30:00.000Z"
}
```

---

### 3.2. Emissão de Credencial Acadêmica (ERPs)
- **Rota:** `POST /api/v1/credentials/issue`
- **Escopo Requerido:** `credentials:issue`
- **Content-Type:** `application/json`

#### Corpo da Requisição (Payload JSON):
```json
{
  "student_name": "Gabriel Vasconcelos",
  "student_cpf": "12345678901",
  "student_email": "gabriel.vasconcelos@aluno.ufmg.br",
  "document_type": "DIPLOMA",
  "course_name": "Ciência da Computação",
  "workload_hours": 3600,
  "grade": 9.4,
  "semester": "2026.1",
  "institution_cnpj": "17217985000104",
  "metadata": {
    "degree": "Bacharelado",
    "mec_process": "23000.012345/2020-00",
    "graduation_date": "2026-08-30",
    "registry_book": "L-14",
    "registry_page": "82",
    "registry_number": "14290"
  },
  "icp_brasil_signature": "MIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQME..."
}
```

#### Resposta de Sucesso (HTTP 201 Created):
```json
{
  "success": true,
  "message": "Diploma / Atestação acadêmica emitida e ancorada com sucesso no LattesChain.",
  "data": {
    "record_id": "7f8b9c1d-1234-4567-890a-bcdef1234567",
    "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "document_type": "DIPLOMA",
    "issued_at": "2026-09-06T22:35:12.123Z",
    "institution": {
      "name": "Universidade Federal de Minas Gerais (UFMG)",
      "cnpj": "17217985000104",
      "solana_pubkey": "3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH"
    },
    "student": {
      "name": "Gabriel Vasconcelos",
      "cpf_masked": "***.456.789-**",
      "wallet": "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK"
    },
    "blockchain": {
      "network": "devnet",
      "transaction_signature": "4N1mK7...v9xQ",
      "explorer_url": "https://explorer.solana.com/tx/4N1mK7...v9xQ?cluster=devnet"
    }
  }
}
```

---

### 3.3. Verificação de Autenticidade (RHs e Plataformas ATS)
- **Rota:** `POST /api/v1/credentials/verify`
- **Escopo:** Público ou `credentials:verify`
- **Content-Type:** `application/json`

#### Corpo da Requisição:
```json
{
  "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

#### Resposta de Sucesso (HTTP 200 OK):
```json
{
  "valid": true,
  "status": "VERIFIED_ONCHAIN",
  "protocol": "LattesChain (EduCore Protocol)",
  "document": {
    "id": "7f8b9c1d-1234-4567-890a-bcdef1234567",
    "type": "DIPLOMA",
    "hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "issued_at": "2026-09-06T22:35:12.123Z",
    "metadata": {
      "course_name": "Ciência da Computação",
      "workload_hours": 3600,
      "degree": "Bacharelado"
    }
  },
  "issuer_institution": {
    "name": "Universidade Federal de Minas Gerais (UFMG)",
    "cnpj": "17217985000104",
    "authority_solana_pubkey": "3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH",
    "mec_compliance": true
  },
  "student": {
    "name": "Gabriel Vasconcelos",
    "cpf_masked": "***.456.789-**"
  },
  "blockchain_proof": {
    "network": "devnet",
    "signature": "4N1mK7...v9xQ",
    "explorer_url": "https://explorer.solana.com/tx/4N1mK7...v9xQ?cluster=devnet",
    "immutable": true
  }
}
```

---

## 4. Exemplos de Implementação Prática

### 4.1. C# (.NET Core) — Ideal para TOTVS RM Educacional
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class LattesChainClient
{
    private readonly HttpClient _client;
    private const string ApiBaseUrl = "https://latteschain.vercel.app/api/v1";
    private const string ApiKey = "lat_live_SUA_CHAVE_AQUI";

    public LattesChainClient()
    {
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("x-api-key", ApiKey);
    }

    public async Task<string> EmitirDiplomaAsync(string nomeAluno, string cpf, string curso, int cargaHoraria)
    {
        var payload = new
        {
            student_name = nomeAluno,
            student_cpf = cpf,
            document_type = "DIPLOMA",
            course_name = curso,
            workload_hours = cargaHoraria
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{ApiBaseUrl}/credentials/issue", content);

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}
```

### 4.2. Python — Ideal para Pipelines de Automação e DataSecAIOps
```python
import requests

API_KEY = "lat_live_SUA_CHAVE_AQUI"
BASE_URL = "https://latteschain.vercel.app/api/v1"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Emissão de diploma
data = {
    "student_name": "Juliana Mendes",
    "student_cpf": "98765432100",
    "document_type": "DIPLOMA",
    "course_name": "Direito",
    "workload_hours": 4200
}

response = requests.post(f"{BASE_URL}/credentials/issue", json=data, headers=headers)
print("Status Code:", response.status_code)
print("Resultado:", response.json())
```

### 4.3. cURL (Terminal / Bash)
```bash
# Verificação de autenticidade instantânea
curl -X POST https://latteschain.vercel.app/api/v1/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }'
```

---

## 5. Códigos de Retorno HTTP e Tratamento de Erros

| Código HTTP | Significado | Causa e Resolução |
| :--- | :--- | :--- |
| **200 OK** | Sucesso | Consulta ou verificação efetuada com sucesso. |
| **201 Created** | Sucesso | Credencial emitida e ancorada na blockchain Solana. |
| **400 Bad Request** | Dados Inválidos | Parâmetros obrigatórios ausentes ou tipo de documento desconhecido. |
| **401 Unauthorized** | Falha de Autenticação | Chave de API ausente, incorreta ou revogada. |
| **403 Forbidden** | Permissão Insuficiente | A chave não possui o escopo necessário (ex: falta `credentials:issue`). |
| **404 Not Found** | Não Encontrado | O hash consultado não existe na base de integridade do protocolo. |
| **429 Too Many Requests** | Limite Excedido | A taxa de chamadas por minuto (Rate Limit) da chave foi ultrapassada. |
| **500 Internal Error** | Erro de Servidor | Falha temporária de infraestrutura; implemente retry com backoff exponencial. |
