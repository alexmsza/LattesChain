# ADR-007 — Dual-track de tokens: SPL Memo (horas/log) + Metaplex Core SBT (diplomas)

**Status**: Aceito (2026-08-29)
**Contexto**: O relatório de ideação apontou ambiguidade: docs citavam SPL Memo e Metaplex Core sem regra de uso. Cada tipo de documento tem requisito de custo e posse diferente — milhares de horas complementares por semestre vs. poucos diplomas por aluno.

## Decisão

**Regra clara por tipo de documento**:

| document_type | Representação on-chain | Por quê |
| :--- | :--- | :--- |
| `HORAS_COMPLEMENTARES` | **SPL Memo** (via instrução `log_academic_event` do programa EduCore, que já faz o CPI Memo) | Volume alto, custo ~R$ 0,003; o aluno consulta agregados pelo painel (Supabase), não precisa "possuir" cada hora |
| `CERTIFICADO_CURSO` | SPL Memo por padrão; Metaplex Core SBT **opcional** se a IES quiser asset colecionável | Custo é o critério; padrão = Memo |
| `DIPLOMA` | **Metaplex Core SBT** (mint pelo relayer) **+** evento `log_academic_event` | Diploma é o ativo de alto valor: posse na carteira do aluno, exibição como asset, portabilidade |
| `HISTORICO_ESCOLAR` | SPL Memo (hash + assinatura) | Documento mutável (reemissões) — âncora de integridade por versão, sem asset |

**Implementação**:
- Horas/certificados/histórico → instrução `log_academic_event` (evento Anchor + Memo CPI embutido — docs/03 §3.4).
- Diploma → `log_academic_event` **e** mint Metaplex Core (asset com `mutable=false`, owner = carteira do aluno; `metaplex_asset_id` em `academic_records`).
- Batch de horas/certificados → `batch_log_academic_events` (≤10).

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **Só Memo para tudo** | Diploma sem posse = falha no requisito de portabilidade/exibição (`/student` assets via DAS) |
| **Só SBT para tudo** | Custo ~300× maior por emissão de horas (rent por asset); poluição de carteira do aluno |
| **Token 2022 non-transferable para tudo** | Entre as duas soluções mas DAS/explorer suporte parcial (decisão ADR-003) |

## Consequências

**Positivas**: custo proporcional ao valor do documento; UX limpa (aluno vê diplomas como "assets", horas como números no painel); uma regra simples de comunicar para IES.

**Negativas/Riscos**: dois fluxos de emissão no relayer (complexidade de teste); verificação de diploma = 2 passos (asset + evento) — o validador usa o **evento/memo** como fonte de verdade (o asset é UX); Metaplex Core breaking changes afetam só o track de diplomas (blast radius contido).
