[INSTRUÇÕES DE SETUP E ESTRUTURA DO MONOREPO]
Inicialize a estrutura do projeto executando os seguintes comandos no terminal:

1. Frontend (Next.js):
   npx create-next-app@latest educore-protocol --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd educore-protocol

2. Backend (Go - Serverless API):
   mkdir api
   cd api
   go mod init github.com/seu-usuario/educore-protocol/api
   go get github.com/gagliardetto/solana-go
   cd ..

3. Infraestrutura (Supabase & Vercel CLI):
   npm i -g vercel
   npm i -g supabase
   supabase init

Crie o arquivo `vercel.json` na raiz do repositório para o roteamento do Go e Next.js:
{
  "builds": [
    { "src": "src/app/layout.tsx", "use": "@vercel/next" },
    { "src": "api/**/*.go", "use": "@vercel/go" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}

[MODELOS DE DADOS - SUPABASE MIGRATIONS (SQL)]
Crie o arquivo de migração do Supabase (`supabase/migrations/20260829000000_init_schema.sql`) com os seguintes modelos (tabelas) e Row Level Security (RLS) básico:

-- 1. Modelo: institutions (Emissores/Universidades)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    solana_pubkey VARCHAR(44) UNIQUE NOT NULL, -- Wallet vinculada no Master Registry
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Modelo: students (Alunos - Account Abstraction)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT auth.uid(), -- Vinculado ao Supabase Auth
    cpf VARCHAR(11) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    solana_wallet_custodial VARCHAR(44) UNIQUE, -- Wallet gerada via WaaS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Modelo: academic_records (Registros e Documentos)
CREATE TABLE academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL, -- 'DIPLOMA', 'HORAS_COMPLEMENTARES', 'CERTIFICADO_CURSO'
    document_hash VARCHAR(64) UNIQUE NOT NULL, -- Hash SHA-256 do arquivo original
    icp_brasil_signature TEXT, -- Assinatura gerada off-chain com e-CNPJ
    solana_tx_signature VARCHAR(88) NOT NULL, -- Assinatura da transação no SPL Memo / Metaplex
    metadata JSONB, -- Dados flexíveis (nome do curso, carga horária, notas)
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Performance
CREATE INDEX idx_academic_hash ON academic_records(document_hash);
CREATE INDEX idx_academic_tx ON academic_records(solana_tx_signature);
CREATE INDEX idx_student_records ON academic_records(student_id);

[INSTRUÇÃO AO AGENTE]
Crie essa estrutura de pastas, o arquivo `vercel.json` e o schema SQL de migração. Responda apenas com "Estrutura e Banco de Dados inicializados." quando concluir, para que possamos prosseguir com os Smart Contracts em Rust.
