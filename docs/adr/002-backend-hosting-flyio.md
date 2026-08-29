# ADR-002 — Backend Go hospedado no Fly.io (não Vercel Serverless)

**Status**: Aceito (2026-08-29) — substitui a decisão anterior de Vercel
**Contexto**: O relayer precisa: (1) manter conexões RPC Solana com timeout >10s e fallback; (2) suporte Go nativo de primeira classe; (3) secrets management; (4) execução na região São Paulo (latência BR); (5) HTTP server padrão com Gin/zerolog; (6) custo previsível em scale baixo.

## Decisão

**Go 1.22 + Gin**, empacotado e deployado no **Fly.io**:
- `api/fly.toml`: região `gru`, porta interna 8080, `force_https`, health check `/health` (30s/5s), auto stop/start (scale-to-zero), VM shared 1×CPU/512MB, metrics Prometheus `:9091`.
- Secrets via `fly secrets set` (nunca no `fly.toml` — arquivo só tem comentários de referência).
- A configuração Vercel (`vercel.json` / `@vercel/go`) **foi removida** do escopo do backend.

## Alternativas consideradas

| Opção | Por que rejeitada |
| :--- | :--- |
| **Vercel Serverless (@vercel/go)** | Go é experimental (suporte limitado); timeout Hobby 10s consome todo o budget com um único RPC call; cold starts 200-500ms; sem websockets longos |
| **AWS Lambda (ARM/Graviton)** | Viável e barato, mas mais peças (API Gateway, layers); operação mais complexa para o time; cold starts similares |
| **Railway / Render** | Equivalentes; Fly.io tem melhor história com Go, regions BR, e machines API |
| **K8s (EKS/GKE)** | Overkill total para 1 serviço stateless em MVP |

## Consequências

**Positivas**: timeout de request sob controle (30s read/write no Gin); `ExecuteWithFallback` pode tentar Helius→QuickNode numa única request; região `gru` para emissões brasileiras; deploy simples (`fly deploy`); scale-to-zero para custos de MVP.

**Negativas**: machine única = SPOF de zona (mitigação: `fly scale count 2` em produção); cold start 1-3s no scale-from-zero (aceitável: emissões são batch de IES, não UX sensível); lock-in leve do fly.toml (baixo: Dockerfile alternativo trivial).

**Configuração de deploy**: ver `docs/04_backend_relayer_go.md` §9.
