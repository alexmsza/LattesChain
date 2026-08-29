# ADR-001 — Solana como blockchain alvo

**Status**: Aceito (2026-08-29)
**Contexto**: O protocolo precisa de ledger pública, imutável e de baixo custo por emissão para âncoras de integridade acadêmica, com throughput suficiente para milhares de emissões/dia e verificação pública sem permissão.

## Decisão

**Solana** (Devnet para MVP/staging, Mainnet-Beta para produção), com:
- Contratos em **Anchor 0.29** (program EduCore: MasterRegistry + UniversityRecord)
- **SPL Memo** para log de horas/certificados (barato, sem conta nova)
- **Metaplex Core** para SBTs de diploma (ADR-003)
- RPC gerenciado: **Helius** (primário) + **QuickNode** (fallback) — ADR de ops no doc 01

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **Ethereum L1** | Gas inviável por emissão (~US$ 1-50); SBTs caros demais em volume |
| **L2 rollups (Base/Arbitrum)** | Custo ok, mas dependência de sequencer/L1 bridge; UX de verificação via indexer menos madura para o caso; data availability ainda centralizada (security council) |
| **Polygon PoS** | Histórico de reorgs/outages; bridges de confiança quebraram em 2023 |
| **Bitcoin (Ordinals/OP_RETURN)** | Sem contrato para registry; capacidade de script insuficiente |
| **Hyperledger/private** | Falha no requisito central: **verificação pública sem permissão** — RH/ATS precisam validar sem confiar no operador |
| **MongoDB + assinatura** (sem blockchain) | Sem imutabilidade demonstrável a terceiros; âncora de timestamp fraca |

## Consequências

**Positivas**: custo ~R$ 0,003/log e ~R$ 0,90/SBT; finalidade rápida (~400ms-2s confirmed); ecossistema Rust/Anchor maduro; DAS API (Helius) para busca de assets; PDAs determinísticos para registry.

**Negativas/Riscos**: outages históricas da rede (mitigação: circuit breaker on-chain + queue off-chain, RB-03/04); Metaplex Core é padrão novo (pin de versão + testes de integração, risco mapeado no relatório de ideação); validadores menos descentralizados que Ethereum (aceito para o caso de uso: âncora de integridade, não custódia de valor financeiro).

**Caso a rede precise ser trocada**: o design é blockchain-agnóstico por camada (hash + assinatura são primitivas portáveis); o acoplamento real está no relayer Go e nos SBTs — ver estratégia de migração em `docs/09_threat_model.md` §6.
