# EduCore Protocol (LattesChain) — Visão Geral de Arquitetura

## 1. Contexto e Proposta de Valor
O **EduCore Protocol (LattesChain)** é uma plataforma B2B/B2C SaaS projetada para mitigar fraudes na emissão de certificados acadêmicos, horas complementares e diplomas EAD no Brasil. 

A solução unifica a validade jurídica governamental (**ICP-Brasil / e-CNPJ**) com a imutabilidade pública descentralizada da blockchain **Solana**.

---

## 2. Topologia do Sistema

```mermaid
graph TD
    subgraph Emissor_IES [Instituição de Ensino Superior]
        A[LMS / Painel University] -->|Assinatura e-CNPJ + Payload| B[Backend Go Relayer]
    end

    subgraph Relayer_OffChain [Vercel Serverless / Go]
        B -->|Gera Hash SHA-256| B1[Motor Criptográfico]
        B -->|Persiste Metadados| C[(Supabase Postgres)]
        B -->|Transação Solana Devnet| D[Solana RPC]
    end

    subgraph OnChain_Solana [Blockchain Solana]
        D --> E[Anchor MasterRegistry]
        D --> F[SPL Memo Program]
        D --> G[Metaplex Core SBT]
    end

    subgraph Validador_RH [Verificação Pública]
        H[RH / Validador /validator] -->|Upload PDF ou Tx Hash| I[Consulta RPC Solana + Supabase]
        I -->|Status Criptográfico| H
    end
```

---

## 3. Componentes Estruturais

| Camada | Tecnologia | Responsabilidade |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), Tailwind CSS | Interfaces `/admin-protocol`, `/university`, `/student`, `/validator`. |
| **Backend** | Go (Golang) Vercel Serverless | Motor SHA-256, empacotamento ICP-Brasil e Relayer de transações Solana. |
| **Persistência** | Supabase (PostgreSQL + RLS + Auth) | Armazenamento off-chain de PII (LGPD compliance) e autenticação de alunos/IES. |
| **Smart Contracts** | Rust / Anchor (Solana) | Master Registry (whitelist institucional), SPL Memo e Metaplex SBTs. |
| **Validação Externa** | zkTLS / Reclaim Protocol *(Fase 2)* | Provas de conhecimento zero para cursos externos (Coursera/Udemy). |

---

## 4. Matriz de Separação de Dados (LGPD Compliance)

| Dado | Armazenamento | Justificativa |
| :--- | :--- | :--- |
| Nome, CPF, E-mail, PDF original | **Off-Chain (Supabase)** | Dados pessoais sensíveis. Permite direito ao esquecimento e exclusão. |
| `solana_pubkey`, `document_hash`, `icp_sig`, `tx_signature` | **On-Chain (Solana)** | Dados imutáveis, anonimizados e verificáveis publicamente. |
