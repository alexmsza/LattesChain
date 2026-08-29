# ADR-005 — Canonicalização e hash de PDF no backend

**Status**: Aceito (2026-08-29)
**Contexto**: O validador (`/validator`) autentica documentos. Pergunta: onde computar o hash do PDF — no browser, no backend, ou só aceitar tx_signature? PDFs são binários frágeis: metadados mutáveis, IDs internos, timestamps de geração, fontes embutidas, compressão. Hashing no client geraria discrepâncias por OS/versão/reader.

## Decisão

**Backend canonicaliza e hasheia** — opção (B) do relatório de ideação:
1. Frontend **não computa hash**: envia o PDF via `POST /api/verify/pdf` (`multipart/form-data`, campo `document`).
2. O relayer Go lê os **bytes brutos** do arquivo (SHA-256 binário exato), sem qualquer transformação — o hash de um arquivo é o hash daquele arquivo, ponto.
3. Consulta: Supabase (rápido, por `pdf_file_hash`) → fallback on-chain (lento, memo/evento).

> ⚠️ **Gap crítico de implementação atual** (docs/02 §5.2): a emissão hoje hasheia o **JSON canônico dos metadados**, não o PDF. O hash do validador nunca casa com o da emissão. Correção acordada:
> - `issue_certificate` passa a aceitar o PDF (multipart) ou `pdf_file_hash` fornecido pela IES;
> - `academic_records` ganha a coluna `pdf_file_hash VARCHAR(64) UNIQUE`;
> - `/verify/pdf` consulta por `pdf_file_hash` (e mantém `document_hash` canônico como referência interna).
> **Bloqueante para o validador funcionar end-to-end.**

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **(A) Frontend extrai texto + canonicaliza + hash** | Discrepância por reader/OS/fonte; texto extraído não é canônico sem spec complexa; expõe lógica de hash ao client (tampering) |
| **(C) Só aceitar tx_signature** | RU não tem tx_signature — só o PDF impresso/anexado; falha no fluxo primário do RH |
| **Hash canônico de campos** (sem o arquivo) | Valida o *conteúdo declarado*, não o *documento oficial* — não detecta PDF adulterado com mesmo conteúdo |

## Consequências

**Positivas**: uma única implementação do hash (Go), comportamento idêntico para todos os clientes; o arquivo físico é a fonte da verdade; discrepâncias impossíveis por plataforma.

**Negativas/Riscos**: upload de arquivo (limite de tamanho obrigatório — T6 no threat model; sugerido 10MB); custo de banda no relayer (baixo); PDF re-gerado pela IES (ex.: reemissão com correção) gera hash novo → precisa regra de retificação (novo registro com `metadata->>'rectifies'`, já prevista nas convenções do doc 02 §6).

**Formatos futuros**: imagens/JPEG de diplomas escaneados podem ser verificadas pelo mesmo fluxo (hash binário) — extensão natural.
