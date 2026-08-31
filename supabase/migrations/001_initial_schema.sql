-- EduCore Protocol - Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Initial schema for institutions, students, academic_records, and verification_logs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: institutions
-- ============================================
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    solana_pubkey VARCHAR(44) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for institutions
CREATE INDEX idx_institutions_cnpj ON institutions(cnpj);
CREATE INDEX idx_institutions_solana_pubkey ON institutions(solana_pubkey);
CREATE INDEX idx_institutions_is_active ON institutions(is_active);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: students
-- ============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    solana_wallet_custodial VARCHAR(44) UNIQUE,
    bip44_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for students
CREATE INDEX idx_students_cpf ON students(cpf);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_solana_wallet ON students(solana_wallet_custodial);
CREATE INDEX idx_students_deleted_at ON students(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: academic_records
-- ============================================
CREATE TABLE academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'DIPLOMA',
        'HORAS_COMPLEMENTARES',
        'CERTIFICADO_CURSO',
        'HISTORICO_ESCOLAR'
    )),
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    icp_brasil_signature TEXT,
    solana_tx_signature VARCHAR(88) NOT NULL,
    metaplex_asset_id VARCHAR(88),
    metadata JSONB NOT NULL DEFAULT '{}',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for academic_records
CREATE INDEX idx_academic_hash ON academic_records(document_hash);
CREATE INDEX idx_academic_tx ON academic_records(solana_tx_signature);
CREATE INDEX idx_academic_student ON academic_records(student_id);
CREATE INDEX idx_academic_institution ON academic_records(institution_id);
CREATE INDEX idx_academic_type ON academic_records(document_type);
CREATE INDEX idx_academic_issued_at ON academic_records(issued_at);
CREATE INDEX idx_academic_metaplex_asset ON academic_records(metaplex_asset_id);

-- ============================================
-- TABLE: verification_logs (Audit trail)
-- ============================================
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_hash VARCHAR(64) NOT NULL,
    verifier_ip INET,
    result VARCHAR(20) NOT NULL CHECK (result IN (
        'VALID',
        'VALID_ONCHAIN',
        'INVALID',
        'ISSUED',
        'ERROR'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_hash ON verification_logs(document_hash);
CREATE INDEX idx_verification_created ON verification_logs(created_at);
CREATE INDEX idx_verification_result ON verification_logs(result);

-- ============================================
-- TABLE: external_courses (Phase 2 - zkTLS)
-- ============================================
CREATE TABLE external_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL, -- 'COURSERA', 'UDEMY', 'EDX', etc.
    course_url TEXT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    workload_hours INTEGER NOT NULL,
    zk_proof TEXT, -- Reclaim Protocol proof
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    solana_tx_signature VARCHAR(88),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',
        'VERIFIED',
        'REJECTED',
        'ISSUED'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_external_student ON external_courses(student_id);
CREATE INDEX idx_external_hash ON external_courses(document_hash);
CREATE INDEX idx_external_status ON external_courses(status);

CREATE TRIGGER update_external_courses_updated_at
    BEFORE UPDATE ON external_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: student_academic_summary
-- ============================================
CREATE VIEW student_academic_summary AS
SELECT 
    s.id AS student_id,
    s.full_name,
    s.email,
    s.solana_wallet_custodial,
    COUNT(ar.id) AS total_records,
    COUNT(CASE WHEN ar.document_type = 'DIPLOMA' THEN 1 END) AS diplomas_count,
    COUNT(CASE WHEN ar.document_type = 'HORAS_COMPLEMENTARES' THEN 1 END) AS hours_count,
    COALESCE(SUM(CASE 
        WHEN ar.document_type = 'HORAS_COMPLEMENTARES' 
        THEN (ar.metadata->>'workload_hours')::int 
        ELSE 0 
    END), 0) AS total_hours,
    MAX(ar.issued_at) AS last_issued_at
FROM students s
LEFT JOIN academic_records ar ON s.id = ar.student_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.full_name, s.email, s.solana_wallet_custodial;