-- LattesChain / EduCore Protocol - Migration 006
-- Descrição: Suporte a múltiplos Campus por IES, matrículas de Estudantes Multi-Tenant,
-- vínculos de perfis a IES/Campus e status SUSPENDED para governança.

-- ============================================
-- TABLE: institution_campuses
-- ============================================
CREATE TABLE IF NOT EXISTS institution_campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Código e-MEC ou código de polo interno
    city VARCHAR(100),
    state VARCHAR(2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campuses_institution ON institution_campuses(institution_id);
CREATE INDEX IF NOT EXISTS idx_campuses_is_active ON institution_campuses(is_active);

-- Trigger updated_at para campuses
DROP TRIGGER IF EXISTS update_institution_campuses_updated_at ON institution_campuses;
CREATE TRIGGER update_institution_campuses_updated_at
    BEFORE UPDATE ON institution_campuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: student_enrollments (Matrículas Multi-Tenant)
-- Um estudante pode possuir matrículas ativas em múltiplas IES e múltiplos campus
-- ============================================
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES institution_campuses(id) ON DELETE SET NULL,
    registration_number VARCHAR(100) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'GRADUATED', 'SUSPENDED', 'LOCKED')),
    enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_inst_reg UNIQUE (student_id, institution_id, registration_number)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_institution ON student_enrollments(institution_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_campus ON student_enrollments(campus_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON student_enrollments(status);

-- Trigger updated_at para student_enrollments
DROP TRIGGER IF EXISTS update_student_enrollments_updated_at ON student_enrollments;
CREATE TRIGGER update_student_enrollments_updated_at
    BEFORE UPDATE ON student_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UPDATE user_profiles: colunas de IES, Campus e status SUSPENDED
-- ============================================
ALTER TABLE user_profiles 
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES institution_campuses(id) ON DELETE SET NULL;

-- Atualizar CHECK de status para permitir SUSPENDED
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;
ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_status_check 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON user_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_campus ON user_profiles(campus_id);

-- Habilitar RLS
ALTER TABLE institution_campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS permissivas para o Service Role do backend
DROP POLICY IF EXISTS "Service role full access institution_campuses" ON institution_campuses;
CREATE POLICY "Service role full access institution_campuses" ON institution_campuses
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access student_enrollments" ON student_enrollments;
CREATE POLICY "Service role full access student_enrollments" ON student_enrollments
    FOR ALL USING (true) WITH CHECK (true);
