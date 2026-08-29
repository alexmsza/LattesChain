# Diretrizes Técnicas do Projeto EduCore Protocol (LattesChain)

## 1. Regras de Arquitetura e Monorepo
- **Estrutura de Pastas**:
  - `src/`: Aplicação Next.js (App Router).
  - `api/`: Funções Serverless em Go para Vercel.
  - `educore_contracts/`: Smart Contracts Solana (Anchor Framework).
  - `supabase/`: Migrações SQL e políticas RLS.
  - `docs/`: Documentação técnica centralizada e atualizada a cada mudança de código.

## 2. Padrões de Código e Segurança
- **LGPD**: Proibido enviar qualquer PII (CPF, Nome, E-mail) para instruções On-Chain (SPL Memo ou Anchor Accounts). Apenas hashes SHA-256 e assinaturas são permitidos.
- **Go Serverless**: Tratamento determinístico de erros, context timeouts para RPCs da Solana, e variáveis de ambiente tipadas.
- **Solana Devnet**: Uso de conexões seguras e validação de `solana_tx_signature` e `document_hash`.
- **UI/UX**: Esquema cromático institucional (#003366, #D4AF37, #FFFFFF), microinterações, zero termos técnicos na visão do aluno/RH (Account Abstraction).
