-- EduCore Protocol - Supabase RLS Policies
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for all tables

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_courses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSTITUTIONS POLICIES
-- ============================================

-- Public read access for active institutions (for validator)
CREATE POLICY "Public read active institutions" ON institutions
    FOR SELECT USING (is_active = true);

-- Service role full access (backend)
CREATE POLICY "Service role full access institutions" ON institutions
    FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users (university admins) can read their own institution
CREATE POLICY "University admin read own institution" ON institutions
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND solana_pubkey = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- ============================================
-- STUDENTS POLICIES
-- ============================================

-- Students can read their own record
CREATE POLICY "Student read own record" ON students
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND id = auth.uid()
    );

-- Students can update their own record (limited fields)
CREATE POLICY "Student update own record" ON students
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND id = auth.uid()
    ) WITH CHECK (
        auth.role() = 'authenticated' 
        AND id = auth.uid()
    );

-- Service role full access (backend)
CREATE POLICY "Service role full access students" ON students
    FOR ALL USING (auth.role() = 'service_role');

-- Public cannot read students (PII protection)
-- No public policy for students table

-- ============================================
-- ACADEMIC RECORDS POLICIES
-- ============================================

-- Students can read their own academic records
CREATE POLICY "Student read own records" ON academic_records
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND student_id = auth.uid()
    );

-- Institutions can read records they issued
CREATE POLICY "Institution read own issued records" ON academic_records
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND institution_id IN (
            SELECT id FROM institutions 
            WHERE solana_pubkey = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Public verification: anyone can verify by document_hash or tx_signature
-- This allows the /validator route to work without authentication
CREATE POLICY "Public verify by hash" ON academic_records
    FOR SELECT USING (
        auth.role() = 'anon' 
        AND (
            document_hash = current_setting('request.jwt.claims', true)::json->>'document_hash'
            OR solana_tx_signature = current_setting('request.jwt.claims', true)::json->>'tx_signature'
        )
    );

-- Service role full access (backend)
CREATE POLICY "Service role full access academic_records" ON academic_records
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- VERIFICATION LOGS POLICIES
-- ============================================

-- Service role full access (backend writes logs)
CREATE POLICY "Service role full access verification_logs" ON verification_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Public cannot read verification logs (audit privacy)
-- No public policy

-- ============================================
-- EXTERNAL COURSES POLICIES
-- ============================================

-- Students can read their own external courses
CREATE POLICY "Student read own external courses" ON external_courses
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND student_id = auth.uid()
    );

-- Students can insert their own external courses (for zkTLS submission)
CREATE POLICY "Student insert own external courses" ON external_courses
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND student_id = auth.uid()
    );

-- Service role full access (backend)
CREATE POLICY "Service role full access external_courses" ON external_courses
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTION: get_current_user_wallet
-- Helper to extract wallet from JWT claims
-- ============================================
CREATE OR REPLACE FUNCTION get_current_user_wallet()
RETURNS VARCHAR(44) AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'wallet_address';
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: is_super_admin
-- Check if current user is super admin
-- ============================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super admin policy for institutions (manage registry)
CREATE POLICY "Super admin manage institutions" ON institutions
    FOR ALL USING (is_super_admin());