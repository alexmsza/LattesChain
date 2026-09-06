-- LattesChain / EduCore Protocol - Migration 004
-- Descrição: Tabelas de Solicitação de Validação Acadêmica (Aluno ➔ IES) e Solicitação de Compliance (RH ➔ Aluno)

-- ============================================
-- TABLE: validation_requests (Estudante ➔ IES)
-- ============================================
CREATE TABLE IF NOT EXISTS validation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'DIPLOMA',
        'HORAS_COMPLEMENTARES',
        'CERTIFICADO_CURSO',
        'HISTORICO_ESCOLAR'
    )),
    origin_type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL' CHECK (origin_type IN ('INTERNAL', 'EXTERNAL')),
    title VARCHAR(255) NOT NULL,
    workload_hours INTEGER,
    document_hash VARCHAR(64) NOT NULL,
    external_issuer_name VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    solana_tx_signature VARCHAR(88),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vr_student ON validation_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_vr_institution ON validation_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_vr_status ON validation_requests(status);
CREATE INDEX IF NOT EXISTS idx_vr_hash ON validation_requests(document_hash);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_validation_requests_updated_at ON validation_requests;
CREATE TRIGGER update_validation_requests_updated_at
    BEFORE UPDATE ON validation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: employer_compliance_requests (RH/Empresas ➔ Aluno)
-- ============================================
CREATE TABLE IF NOT EXISTS employer_compliance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_name VARCHAR(255) NOT NULL,
    employer_email VARCHAR(255) NOT NULL,
    student_identifier VARCHAR(44) NOT NULL, -- CPF ou Wallet do estudante
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('ESTAGIO', 'VAGA_CLT', 'BACKGROUND_CHECK', 'POS_GRADUACAO')),
    requested_items JSONB NOT NULL DEFAULT '["matricula_ativa", "historico", "horas_complementares"]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SHARED', 'EXPIRED')),
    shared_at TIMESTAMPTZ,
    access_token VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_ecr_student ON employer_compliance_requests(student_identifier);
CREATE INDEX IF NOT EXISTS idx_ecr_status ON employer_compliance_requests(status);
CREATE INDEX IF NOT EXISTS idx_ecr_token ON employer_compliance_requests(access_token);

-- RLS Básico
ALTER TABLE validation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_compliance_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS permissivas para o Service Role do backend
DROP POLICY IF EXISTS "Service role full access validation_requests" ON validation_requests;
CREATE POLICY "Service role full access validation_requests" ON validation_requests
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access employer_compliance_requests" ON employer_compliance_requests;
CREATE POLICY "Service role full access employer_compliance_requests" ON employer_compliance_requests
    FOR ALL USING (true) WITH CHECK (true);

