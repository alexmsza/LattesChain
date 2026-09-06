-- LattesChain - Migration 005
-- Descrição: Tabela de tokens de API para autenticação externa (ERPs, TOTVS, ATS de RH)
-- e governança administrativa avançada.

-- ============================================
-- TABLE: api_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) UNIQUE NOT NULL,
    key_prefix VARCHAR(24) NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['credentials:verify'],
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 120,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_key_hash ON api_tokens(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_tokens_institution_id ON api_tokens(institution_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_is_active ON api_tokens(is_active);

-- Enable RLS on api_tokens
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Only service_role can access everything by default
CREATE POLICY "Service role full access to api_tokens"
    ON api_tokens
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
