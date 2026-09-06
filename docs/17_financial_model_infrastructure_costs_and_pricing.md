# Documento Técnico 17: Modelo Financeiro, Custos de Infraestrutura e Precificação de Mercado

**Protocolo:** LattesChain (EduCore Protocol)  
**Versão:** 1.0.0  
**Data:** Setembro de 2026  
**Responsável Técnico & Modelagem:** Alex Miqueias (Jovian Tech)  
**Status:** Aprovado & Base de Negociação B2B

---

## 1. Sumário Executivo

Este relatório detalha a composição de custos de infraestrutura em nuvem e blockchain necessários para sustentar a operação comercial do **LattesChain** na **Solana Mainnet-Beta**, a precificação recomendada para Instituições de Ensino Superior (IES) e departamentos de Recursos Humanos (RH), e as margens operacionais projetadas para a **Jovian Tech**.

A principal premissa arquitetural do modelo é o **Zero Cripto Onboarding**: nem faculdades nem alunos compram tokens em exchanges; a Jovian Tech absorve as frações de centavos de gás on-chain através de um Relayer Fee Payer corporativo e fatura os clientes em moeda fiduciária nacional (**Reais - BRL**).

---

## 2. Custos Fixos e Variáveis de Infraestrutura (Jovian Tech)

| Serviço / Ferramenta | Provedor Recomendado | Função no Ecossistema | Custo Mensal Estimado (USD) | Custo Mensal Estimado (BRL)* |
| :--- | :--- | :--- | :--- | :--- |
| **Nó RPC Solana Dedicado** | **Helius** (Developer Tier) / QuickNode | Conexão de baixa latência, WebSockets, Priority Fees e webhooks | US$ 49,00 | ~R$ 270,00 |
| **Backend & Banco de Dados** | **Supabase** (Pro Tier) | PostgreSQL dedicado, Auth, Storage para PDFs/XMLs e Row Level Security | US$ 25,00 | ~R$ 138,00 |
| **Frontend & Edge CDN** | **Vercel** (Pro Tier) | Hospedagem Next.js 14, rotas serverless, proteção DDoS e SSL | US$ 20,00 | ~R$ 110,00 |
| **Gás Solana (Fee Payer Relayer)** | Carteira Corporativa Solana | Co-assinatura de transações on-chain (State Compression / Bubblegum) | ~US$ 15,00 (~0.1 SOL) | ~R$ 82,00 |
| **Email Transacional** | **Lark Mail / Resend** | Envios de homologação de contas e certidões aos usuários | US$ 0,00 (Plano Domínio) | R$ 0,00 |
| **Monitoramento & Logs** | **Sentry** (Developer) | Telemetria de erros em tempo real e rastreamento de runtime | US$ 0,00 (Tier Free) | R$ 0,00 |
| **TOTAL MENSAL DE INFRAESTRUTURA** | — | **Sustenta até 10 faculdades e 50.000 atestações/mês** | **~US$ 109,00 / mês** | **~R$ 600,00 / mês** |

*\*Câmbio base estimado: US$ 1,00 = R$ 5,50.*

---

## 3. Custo por Transação On-Chain (Por que o Gás é Insignificante)

Graças ao uso de **State Compression (Concurrent Merkle Trees via Bubblegum)**:
- **Rent de Criação da Árvore de Merkle (Pagamento Único)**:
  - Árvore de profundidade 14 (`maxDepth = 14`, `maxBufferSize = 64`): comporta até **16.384 diplomas/atestações**.
  - Custo único de abertura: ~0.15 SOL (~R$ 120,00 uma única vez).
- **Custo por Emissão Individual**:
  - ~0.000005 a 0.000010 SOL (incluindo taxa de prioridade Helius).
  - Equivale a **R$ 0,005 (meio centavo de Real)** por atestação ancorada.
- **Conclusão:** O custo da blockchain representa menos de 5% do custo total da plataforma; mais de 90% é infraestrutura tradicional em nuvem (RPC + Banco de Dados + CDN).

---

## 4. Quanto Custa para a Faculdade (IES)

A faculdade **não paga taxa de gás nem compra criptomoeda**. Ela contrata uma assinatura de software como serviço (SaaS):

### Tabela de Planos Recomendada para IES:
1. **Plano Start (Gratuito / Freemium)**:
   - Para pequenas faculdades isoladas testarem o protocolo.
   - Limite: Até 300 atestações/ano.
   - Custo: **R$ 0,00**. (Gera tração de rede e atrai estudantes).
2. **Plano Campus Pro (Mais Popular)**:
   - Para faculdades e centros universitários (até 5.000 alunos).
   - Recursos: Emissões ilimitadas, leitor de XML do MEC, emissão em lote via CSV, fila de validação de horas complementares e suporte técnico prioritário.
   - Preço Recomendado: **R$ 1.290,00 / mês** (ou **R$ 12.900,00 / ano** à vista).
3. **Plano Enterprise & Governo**:
   - Para universidades federais, estaduais e grandes grupos educacionais (Kroton, Ânima, Yduqs).
   - Recursos: Integração direta via API REST / Webhooks ao ERP acadêmico (TOTVS RM, Sophia, Lyceum), nó RPC privado, SLAs 99.9% e múltiplas chaves de coordenadoria.
   - Preço Recomendado: **R$ 4.500,00 a R$ 12.000,00 / mês** + Taxa de Setup de Implantação de **R$ 15.000,00 a R$ 35.000,00**.

---

## 5. Quanto Custa para a Empresa / RH

1. **Validador Público Web**:
   - **100% Gratuito**: Qualquer empresa pode consultar um hash ou subir um certificado PDF para auditar a autenticidade na hora.
2. **Plano RH Pro (Recrutamento Ágil)**:
   - Para agências de talentos, consultorias de RH e médias empresas.
   - Recursos: Solicitação formal de comprovação de matrícula, Pareceres de Confiança de IA ilimitados (Trust Report) e Comparador Semântico de Equivalência Curricular.
   - Preço Recomendado: **R$ 490,00 / mês**.
3. **Plano RH API Enterprise (Background Check em Lote)**:
   - Integração direta nos softwares de contratação (Gupy, Greenhouse, Lever, Workday).
   - Preço Recomendado: **R$ 1.900,00 / mês** + **R$ 1,50 por candidato auditado**.

---

## 6. Projeção de Faturamento e Margem Líquida (Cenário Realista de 12 Meses)

Considerando a adesão de **5 Faculdades Campus Pro** e **10 Empresas no Plano RH Pro**:

| Origem de Receita | Quantidade | Mensalidade Unitária | Receita Mensal Total |
| :--- | :---: | :--- | :--- |
| Faculdades (Campus Pro) | 5 | R$ 1.290,00 | R$ 6.450,00 |
| Empresas de RH (RH Pro) | 10 | R$ 490,00 | R$ 4.900,00 |
| **Receita Recorrente Mensal (MRR)** | — | — | **R$ 11.350,00 / mês** |
| **Custo de Infraestrutura Total** | — | — | **- R$ 650,00 / mês** |
| **Lucro Operacional Bruto Mensal** | — | — | **R$ 10.700,00 / mês** |
| **Margem Bruta** | — | — | **94,27%** |

---

## 7. Relação de Ferramentas Obrigatórias a Contratar

Para colocar a migração em produção na Mainnet:

1. **Helius (helius.dev)**:
   - Criar conta e assinar o plano **Developer** (US$ 49/mês).
   - Gerar chave de API para o endpoint `https://mainnet.helius-rpc.com/?api-key=...`.
2. **Supabase (supabase.com)**:
   - Fazer upgrade do projeto atual para o plano **Pro** (US$ 25/mês) para habilitar backups diários e conexão com pool de conexões estável.
3. **Vercel (vercel.com)**:
   - Plano **Pro** (US$ 20/mês) para garantir bandwidth corporativo e SLAs sem bloqueio de tráfego.
4. **Carteira Solana Fee Payer (Phantom / Solflare / Backpack)**:
   - Carteira fria/quente corporativa gerenciada pela Jovian Tech carregada com **1 a 2 SOL** (cerca de R$ 800,00 a R$ 1.600,00 em saldo de giro operacional), suficiente para garantir centenas de milhares de micro-transações de atestação.
