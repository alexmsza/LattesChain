# EduCore Protocol — Especificação de Smart Contracts (Anchor)

> Fonte da verdade: `educore_contracts/programs/educore_contracts/src/lib.rs`.
> Este documento espelha o código **como escrito** e sinaliza lacunas (§8).

## 1. Framework e Versões

| Ferramenta | Versão |
| :--- | :--- |
| Anchor CLI & Lang | `0.29.0` |
| solana-program | `1.18.0` |
| Rust toolchain | `1.75+` (edition 2021) |
| SPL Memo (CPI) | via `anchor-spl 0.29.0` |
| Program ID (placeholder) | `EduCore11111111111111111111111111111111111111111111` |

> O `declare_id!` é placeholder. Após `anchor build`, sincronizar com `anchor keys sync` antes do primeiro deploy (ver §7).

## 2. Modelo de Contas

### 2.1 `MasterRegistry` (PDA única global)
Seeds: `["master_registry"]` — space 74 bytes (layout em `docs/02_data_models.md` §3.1).

Campos: `authority` (Super Admin), `bump`, `is_paused`, `total_institutions`, `total_events_logged`, `created_at`, `updated_at`.

### 2.2 `UniversityRecord` (PDA por instituição)
Seeds: `["university_record", institution_pubkey]` — space 204 bytes.

Campos: `institution_pubkey`, `cnpj: Vec<u8>` (14 dígitos), `name: String` (≤100), `is_active`, `bump`, `registered_at`, `updated_at`, `total_emissions`, `last_emission_at`.

## 3. Instruções

### 3.1 `initialize_registry()`
- **Permissão**: deployer (signer livre — quem paga cria o registro).
- **Ação**: inicializa `MasterRegistry`; `is_paused = false`; contadores zerados.
- **Evento**: `RegistryInitialized { authority, timestamp }`.

### 3.2 `register_university(cnpj: String, name: String)`
- **Permissão**: `MasterRegistry.authority` (`has_one = authority`).
- **Validações**: CNPJ com exatamente 14 chars ASCII-dígitos (`InvalidCNPJLength`/`InvalidCNPJFormat`); `name ≤ 100` (`InvalidNameLength`).
- **Ação**: cria PDA `UniversityRecord` (payer = authority), `is_active = true`, incrementa `total_institutions`.
- **Evento**: `UniversityRegistered { institution, cnpj, name, timestamp }`.
- **Nota**: a conta `institution_pubkey` é `AccountInfo` (referência, não signer) — a PDA é derivada da chave informada.

### 3.3 `update_university_status(is_active: bool)`
- **Permissão**: `MasterRegistry.authority`.
- **Ação**: ativa/suspende a IES; atualiza `updated_at`.
- **Evento**: `UniversityStatusUpdated { institution, is_active, timestamp }`.
- **Uso operacional**: suspeita de fraude/comprometimento → RB-07 (`docs/10_runbooks.md`).

### 3.4 `log_academic_event(document_hash: String, icp_signature: String, document_type: DocumentType, metadata_uri: Option<String>)`
- **Permissão**: signer cuja chave **== `UniversityRecord.institution_pubkey`** (`UnauthorizedInstitution`) e IES `is_active` (`UniversityInactive`).
- **Validações**: hash com 64 chars hex (`InvalidHashLength`/`InvalidHashFormat`); assinatura não vazia (`EmptyICPSignature`).
- **Ação**:
  1. Emite `AcademicEventLogged { institution, document_hash, icp_signature, document_type(u8), metadata_uri, timestamp }`.
  2. Incrementa `total_emissions`, `last_emission_at` e `total_events_logged`.
  3. **CPI para SPL Memo** (`Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo`) com payload `EduCore:<pubkey>:<hash>:<sig>:<type>` — trilha de auditoria pesquisável por indexers.

### 3.5 `batch_log_academic_events(events: Vec<BatchEventData>)`
- **Permissão**: igual à 3.4.
- **Limite**: ≤ 10 eventos (`BatchTooLarge`).
- **Ação**: valida e emite um evento por item; atualiza contadores uma única vez (economia de fees).
- **Nota**: não faz CPI Memo (evitar estouro de tamanho de transação).

### 3.6 `set_pause_status(is_paused: bool)`
- **Permissão**: `MasterRegistry.authority`.
- **Ação**: circuit breaker global; emite `PauseStatusChanged`.
- 🔴 **Issue conhecida**: `log_academic_event` **não checa `is_paused`** (o erro `ProgramPaused` está declarado mas nunca usado). Corrigir (ver §8.1) — sem isso, o pause não interrompe emissões.

### 3.7 `rotate_authority(new_authority: Pubkey)`
- **Permissão**: `MasterRegistry.authority` atual.
- **Ação**: transfere o Super Admin; emite `AuthorityRotated { old, new, timestamp }`.
- **Produção**: exigir multisig 3/5 (Squads) como authority e timelock de segurança (ADR futuro); o swap direto é aceitável em Devnet.

## 4. Tipos de Entrada

```rust
pub struct BatchEventData {
    pub document_hash: String,       // 64 hex
    pub icp_signature: String,       // não vazio
    pub document_type: DocumentType, // enum u8
    pub metadata_uri: Option<String>,
}

pub enum DocumentType {
    Diploma = 0, HorasComplementares = 1,
    CertificadoCurso = 2, HistoricoEscolar = 3,
}
```

## 5. Eventos (índice off-chain)

| Evento | Campos | Consumidor |
| :--- | :--- | :--- |
| `RegistryInitialized` | authority, timestamp | indexer |
| `UniversityRegistered` | institution, cnpj, name, timestamp | indexer → sync Supabase |
| `UniversityStatusUpdated` | institution, is_active, timestamp | indexer → sync Supabase |
| `AcademicEventLogged` | institution, document_hash, icp_signature, document_type, metadata_uri, timestamp | indexer → `academic_records` |
| `PauseStatusChanged` | is_paused, timestamp | monitoramento/alerta |
| `AuthorityRotated` | old, new, timestamp | alerta de segurança crítica |

## 6. Códigos de Erro

| Código | Mensagem | Disparado por |
| :--- | :--- | :--- |
| `Unauthorized` | signer sem permissão | (reservado) |
| `UniversityNotRegistered` | IES ausente no registry | (reservado — o `init`+seeds já retornam `AccountNotInitialized` na prática) |
| `UniversityInactive` | IES suspensa | 3.4, 3.5 |
| `InvalidHashLength` | hash ≠ 64 chars | 3.4, 3.5 |
| `InvalidHashFormat` | não-hexadecimal | 3.4 |
| `InvalidCNPJLength` | CNPJ ≠ 14 dígitos | 3.2 |
| `InvalidCNPJFormat` | CNPJ com não-dígitos | 3.2 |
| `InvalidNameLength` | nome > 100 chars | 3.2 |
| `EmptyICPSignature` | assinatura vazia | 3.4, 3.5 |
| `BatchTooLarge` | lote > 10 | 3.5 |
| `ProgramPaused` | programa pausado | **não usado ainda** (§8.1) |
| `UnauthorizedInstitution` | signer ≠ pubkey registrada | 3.4, 3.5 |

## 7. Build, Test e Deploy

```bash
# 1. Configurar CLI
solana config set --url devnet
anchor keys list            # após o primeiro build, gerar/substituir Program ID real

# 2. Build + testes
anchor build
anchor test                 # exige solana-test-validator (validator local + test runner)

# 3. Deploy
anchor deploy --provider.cluster devnet
anchor keys sync            # grava o Program ID real no declare_id! e no Anchor.toml
```

**Checklist de teste por instrução (mínimo para Mainnet)**:
- `initialize_registry`: inicializa uma vez; segunda chamada falha (PDA já existe).
- `register_university`: authority OK; não-authority falha; CNPJ 13/15 chars e com letras falham; duplicidade de pubkey falha.
- `update_university_status`: toggle ativo↔inativo; eventos corretos.
- `log_academic_event`: IES ativa assina OK; pubkey errada falha; IES inativa falha; hash 63/65/não-hex falham; sig vazia falha; contadores incrementam; Memo CPI escreve.
- `batch_log_academic_events`: 10 eventos OK; 11 falha; contadores somam N.
- `set_pause_status`: pausa e **(após correção §8.1)** emissões falham com `ProgramPaused`.
- `rotate_authority`: authority antiga perde poderes; nova assume.

## 8. Lacunas e Melhorias Pendentes

### 8.1 🔴 `is_paused` não é aplicado
Adicionar em `log_academic_event` e `batch_log_academic_events`:
```rust
require!(!ctx.accounts.master_registry.is_paused, ErrorCode::ProgramPaused);
```

### 8.2 🟡 CNPJ sem dígito verificador
O programa valida formato (14 dígitos) mas não o algoritmo DV. Recomendado: validar DV no programa (barato, determinístico) **ou** garantir no relayer (Go) + aceitar o risco de CNPJ matematicamente inválido vindo de terceiros. Decisão sugerida: validar no programa.

### 8.3 🟡 `icp_signature` completa on-chain (custo/tamanho)
Assinatura PKCS#7/CMS real tem 1–4 KB; em evento Anchor ela inflate o log, e no Memo CPI pode estourar o limite de 1232 bytes da transação. **Recomendação (ADR-006)**: on-chain gravar apenas `SHA-256(icp_signature)` (64 chars fixos); a assinatura completa fica no Supabase e o validador a recupera por `document_hash`. Mudança requer atualização do relayer e do validador — planejar antes do primeiro Mainnet deploy.

### 8.4 🟢 `UniversityNotRegistered`/`Unauthorized` órfãos
Mensagens reservadas; ok manter, mas documentar (feito em §6).

### 8.5 🟢 Metaplex Core mint fora deste programa
O mint de SBT de diploma (Metaplex Core) é feito **direto pelo relayer** (CPI não é necessária no programa EduCore) — ver ADR-003 e ADR-007. Se no futuro for exigido mint condicionado ao registry, adicionar instrução wrapper com `constraint` na PDA da IES.
