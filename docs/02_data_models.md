# EduCore Protocol — Modelagem de Dados

## 1. Schema Relacional Off-Chain (Supabase PostgreSQL)

### 1.1 Tabela: `institutions`
Armazena as Instituições de Ensino Superior (IES) validadas.

```sql
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    solana_pubkey VARCHAR(44) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Tabela: `students`
Armazena dados cadastrais do aluno e sua carteira custodial (WaaS).

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    solana_wallet_custodial VARCHAR(44) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Tabela: `academic_records`
Registros emitidos e indexados off-chain com referência à transação Solana.

```sql
CREATE TABLE academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL, -- 'DIPLOMA', 'HORAS_COMPLEMENTARES', 'CERTIFICADO_CURSO'
    document_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256
    icp_brasil_signature TEXT, -- Assinatura e-CNPJ (mock ou PKCS#7/RSA)
    solana_tx_signature VARCHAR(88) NOT NULL,
    metadata JSONB,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_hash ON academic_records(document_hash);
CREATE INDEX idx_academic_tx ON academic_records(solana_tx_signature);
CREATE INDEX idx_student_records ON academic_records(student_id);
```

---

## 2. Estrutura de Contas On-Chain (Solana Anchor)

### 2.1 Conta Mestre: `MasterRegistry`
```rust
#[account]
pub struct MasterRegistry {
    pub authority: Pubkey,      // 32 bytes - Super Admin
    pub bump: u8,               // 1 byte
}
```

### 2.2 Conta de Registro Institucional: `UniversityRecord`
```rust
#[account]
pub struct UniversityRecord {
    pub institution_pubkey: Pubkey, // 32 bytes
    pub cnpj: [u8; 14],             // 14 bytes
    pub is_active: bool,            // 1 byte
    pub bump: u8,                   // 1 byte
}
```

### 2.3 Evento On-Chain: `AcademicEventLogged`
```rust
#[event]
pub struct AcademicEventLogged {
    pub institution: Pubkey,
    pub document_hash: String,
    pub timestamp: i64,
}
```
