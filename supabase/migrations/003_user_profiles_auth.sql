-- LattesChain - Migration 003
-- Descrição: Perfis de usuário (Estudante, IES, RH) vinculados ao Supabase Auth,
-- tokens de redefinição de senha e trilha de auditoria de aprovação.

-- ============================================
-- ENUM: user_role
-- ============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'INSTITUTION', 'EMPLOYER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- TABLE: user_profiles
-- Perfil de domínio de cada usuário autenticado.
-- user_id -> auth.users.id (FK). Cada usuário tem exatamente 1 perfil.
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(11),
    cnpj VARCHAR(14),
    institution_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(32),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON user_profiles(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_cnpj ON user_profiles(cnpj) WHERE cnpj IS NOT NULL;

-- ============================================
-- TABLE: password_reset_tokens
-- Tokens de uso único para redefinição de senha (fluxo de recuperação).
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_expires ON password_reset_tokens(expires_at);

COMMENT ON TABLE user_profiles IS 'Perfil de domínio (Estudante/IES/RH) vinculado ao auth.users do Supabase';
COMMENT ON TABLE password_reset_tokens IS 'Tokens de uso único p/ redefinição de senha (hash SHA-256 do token bruto)';

-- ============================================
-- TRIGGER: cria perfil após signup no Supabase Auth
-- Dados vêm dos raw_user_meta_data preenchidos no formulário de cadastro.
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role, full_name, email, cpf, cnpj, institution_name, company_name, phone)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'cpf',
        NEW.raw_user_meta_data->>'cnpj',
        NEW.raw_user_meta_data->>'institution_name',
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger para user_profiles (função da migration 001)
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Usuário lê o próprio perfil
CREATE POLICY "profiles_select_own" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- ADMIN (via service role no backend) gerencia aprovações
-- (service_role ignora RLS, então não precisa de policy explícita)

-- Ninguém mais lê perfis de terceiros (default deny para anon/authenticated)

-- password_reset_tokens: nenhum acesso via API de clientes (só service_role no backend)

-- Concede acesso do schema public ao authenticated/anon (default do hosted)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
