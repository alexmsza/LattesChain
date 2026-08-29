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

### 3.3 `log_academic_event(ctx, document_hash: String, icp_signature: String)`

- **Permissão**: Signatário deve ser a Pubkey registrada em `UniversityRecord` e com `is_active == true`.
- **Ação**: Emite o evento `AcademicEventLogged(institution, document_hash, timestamp)`.

## 4. Códigos de Erro (`ErrorCode`)

- `Unauthorized`: O signatário não possui permissão administrativa.
- `UniversityNotRegistered`: A universidade não possui registro na PDA.
- `UniversityInactive`: A instituição está suspensa ou inativa.
- `InvalidHashLength`: O hash SHA-256 não possui exatamente 64 caracteres hexadecimais.
