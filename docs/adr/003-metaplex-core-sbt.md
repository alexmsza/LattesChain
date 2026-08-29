# ADR-003 — Metaplex Core como padrão de SBT para diplomas

**Status**: Aceito (2026-08-29)
**Contexto**: Diplomas exigem representação on-chain **não-transferível** (soulbound), verificável, com metadados externos (URI) e custo de mint baixo. Alternativas de padrão: Metaplex Core (novo), Metaplex Legacy (Token Metadata), SPL Token 2022 (Token Extensions non-transferable).

## Decisão

**Metaplex Core** para todos os diplomas (DIPLOMA) e certificados de curso (CERTIFICADO_CURSO quando houver valor em asset):
- Program: `CoREENxT6tW1HoK8ypY1SxRMZjVPm7xRk51t3G14eYTV` (pin da versão na integração)
- Asset único por diploma, owner = carteira custodial do aluno (derivada BIP44 — ADR-004)
- `mutable = false` no mint (imutabilidade de metadados do diploma)
- Metadados: JSON em URI externa (Supabase Storage/arweave futuro) contendo APENAS dados não-pessoais + hash do documento
- Mint executado pelo **relayer Go** (não por CPI do programa EduCore — ver doc 03 §8.5)
- Horas complementares e logs usam **SPL Memo** (mais barato — ADR-007)

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **Metaplex Legacy (Token Metadata)** | Depricated para novos projetos; 3+ contas por NFT (Mint + Metadata + MasterEdition) = mais rent; Data model orientado a coleções fungíveis da era JPEG |
| **SPL Token 2022 (non-transferable extension)** | Padrão de token nativo, mas ecossistema de wallet/explorer ainda parcial; sem plugins nativos de metadados rich |
| **SPL Memo para tudo** | Sem posse do aluno: diploma não "existe" na carteira — falha no requisito de portabilidade percebida (`/student` mostra diplomas como assets) |

## Consequências

**Positivas**: 1 conta Asset (~136+ bytes) = rent mínimo; padrão futuro da Metaplex; DAS API (Helius) indexa Core assets nativamente (`GetStudentAssets` já implementado); não-transferível por design = diploma intransferível mesmo em account takeover (ver threat model T-ATO §8).

**Negativas/Riscos**: padrão novo (2024+) — breaking changes possíveis (mitigação: pin de versão no relayer + testes de integração + ADR de migração); wallet UX: carteiras ainda adaptando suporte a Core (o aluno EduCore não precisa de carteira externa no MVP — o painel resolve); burn/re-mint para self-custody migration precisa de fluxo próprio (docs/05 §6).

**Custo**: ~0.001-0.0015 SOL/mint (rent dominante) — estimativa no doc 01 §7.

**Integração pendente**: `MintMetaplexCoreSBT` em `solana.go` é placeholder (`not implemented`) — implementação via builder de instruções Core (create_asset) no relayer Go. Ver docs/04 §7.2.
