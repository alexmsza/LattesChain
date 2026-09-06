---
name: educore_orchestrator
description: Orquestração do desenvolvimento do LattesChain (EduCore Protocol) — Solana SAS/Token-2022, Next.js/Vercel, Supabase (PostgreSQL + RLS + Storage) e Camada de IA.
---

# LattesChain Orchestrator Skill

Orquestra o desenvolvimento completo do LattesChain. Antes de executar qualquer código, consulte `docs/00_index.md`, `docs/PITCH_DECK.md` e `docs/BUSINESS_PLAN.md`.

---

## 1. Stack e Primitivas Centrais

| Camada | Tecnologia / Padrão | Função |
| :--- | :--- | :--- |
| **Blockchain** | Solana (SAS + Token-2022) | Atestações padronizadas (`22zoJM...`) e Soulbound Tokens revogáveis |
| **Frontend** | Next.js 14+ / Vercel | Portal Web para Aluno, Universidade e Validador RH |
| **Backend / DB** | Supabase (Postgres + Auth + Storage + RLS) | Gestão de dados off-chain, autenticação e custódia de PDFs |
| **Camada de IA** | `ai/llm_client.py` (Multi-provedor) | Equivalência curricular semântica e geração de Trust Report |

---

## 2. Fluxos Operacionais de Desenvolvimento

### 2.1 Solana Attestation Service (`sas/`)
```bash
# Ambiente e dependências via uv
uv venv .venv
.venv\Scripts\activate
uv pip install -r sas/requirements.txt -r ai/requirements.txt

# Execução do pipeline sequencial
python sas/00_setup_wallets.py       # Setup de carteiras
python sas/01_create_credential.py   # Registro da IES
python sas/02_create_schema.py       # Schemas (disciplina / diploma)
python sas/03_issue_attestation.py   # Emissão de atestação
python sas/04_issue_soulbound.py     # Mint Token-2022 Soulbound
python sas/05_verify.py disciplina   # Validação on-chain
python sas/06_revoke.py              # Demonstração de revogação
```

### 2.2 Camada de IA (`ai/`)
```bash
python ai/trust_report.py            # Gera Trust Report para RH a partir de dados on-chain
python ai/equivalence_check.py       # Avalia equivalência entre duas ementas
```

### 2.3 Frontend Next.js (`src/` / Vercel)
```bash
npm install                          # Instala dependências
npm run dev                          # Servidor local em :3000
npm run build                        # Build de produção para deploy na Vercel
```

### 2.4 Supabase (`supabase/migrations/`)
```bash
supabase db push                     # Aplica schemas e políticas RLS
```

---

## 3. Regras Invioláveis de Segurança & LGPD
1. **Nenhum PII On-Chain**: CPF, nomes e dados pessoais nunca são enviados para a blockchain; apenas hashes SHA-256 e pubkeys.
2. **Revogação Nativa**: Credenciais tokenizadas devem sempre carregar a extensão `PermanentDelegate` apontando para a universidade emissora.
3. **Secrets Seguros**: Chaves de API e Service Role Keys nunca devem ser commitadas no repositório.
4. **Documentação Contínua**: Toda alteração de schema ou rota deve atualizar a documentação em `docs/`.

