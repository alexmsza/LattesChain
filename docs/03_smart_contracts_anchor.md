# EduCore Protocol — Especificação de Smart Contracts (Anchor)

## 1. Localização
`educore_contracts/programs/educore_contracts/src/lib.rs`

## 2. Framework e Versões
- **Solana CLI**: `1.18+`
- **Anchor CLI & Lang**: `0.29.0` (ou compativel `0.30+`)
- **Rust Toolchain**: `1.75+`

## 3. Instruções e Regras de Negócio

### 3.1 `initialize_registry(ctx)`
- **Permissão**: Exclusivo para o Deployer / Super Admin.
- **Ação**: Inicializa a conta `MasterRegistry` e define a chave de autoridade mestre.

### 3.2 `register_university(ctx, cnpj: String, university_pubkey: Pubkey)`
- **Permissão**: Exclusivo para `MasterRegistry.authority`.
- **Ação**: Cria a PDA `UniversityRecord` vinculada ao CNPJ/Pubkey da IES, definindo `is_active = true`.

### 3.3 `deactivate_university(ctx)`
- **Permissão**: Exclusivo para `MasterRegistry.authority`.
- **Ação**: Define `UniversityRecord.is_active = false`. IES desativada não pode mais emitir eventos acadêmicos via `log_academic_event`.

### 3.4 `log_academic_event(ctx, document_hash: String, icp_signature: String)`
- **Permissão**: Signatário deve ser a Pubkey registrada em `UniversityRecord` e com `is_active == true`.
- **Ação**: Valida tamanho do hash (64 chars hex). Emite o evento `AcademicEventLogged(institution, document_hash, timestamp)`.

## 4. Nota: Conversão de CNPJ (`String` → `[u8; 14]`)
A struct `UniversityRecord` armazena o CNPJ como `[u8; 14]` (14 bytes fixos) para economia de espaço on-chain (~40 bytes economizados vs `String`). A conversão é responsabilidade do backend Go:
- **Entrada** (API): `"17217985000104"` (String de 14 dígitos, sem máscara).
- **Serialização** (Go → Anchor): Converter cada char ASCII para seu byte correspondente no array `[u8; 14]`.
- **Leitura** (Anchor → Go): Reconstruir a String a partir do array de bytes.

## 5. Códigos de Erro (`ErrorCode`)
- `Unauthorized`: O signatário não possui permissão administrativa.
- `UniversityNotRegistered`: A universidade não possui registro na PDA.
- `UniversityInactive`: A instituição está suspensa ou inativa.
- `InvalidHashLength`: O hash SHA-256 não possui exatamente 64 caracteres hexadecimais.
