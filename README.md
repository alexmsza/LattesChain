# LattesChain — Passaporte Acadêmico Global Descentralizado 🎓⛓️

[![Solana](https://img.shields.io/badge/Blockchain-Solana%20Devnet%20%2F%20Mainnet-9945FF?logo=solana)](https://solana.com)
[![SAS](https://img.shields.io/badge/Protocolo-Solana%20Attestation%20Service-14F195)](https://attest.solana.com)
[![Open Source](https://img.shields.io/badge/Stack-100%25%20Free%20%26%20Open--Source-brightgreen)](https://opensource.org)
[![Superteam Brasil](https://img.shields.io/badge/Hackathon-Superteam%20Brasil-008C4C)](https://uni.superteam.com.br/)

> **Projeto submetido ao [Hackathon Universitário Superteam Brasil](https://uni.superteam.com.br/)**  
> Listagem oficial no Superteam Earn: [Hackathon Universitária Superteam Brasil](https://superteam.fun/earn/listing/hackathon-universitaria-superteam-brasil-1)  
> **Missão**: Transformar credenciais, diplomas e históricos acadêmicos em atestações soberanas, imutáveis e verificáveis globalmente na **Solana**.
## 📑 Documentação e Recursos Principais

- 🎙️ **[Roteiro de Pitch (5 Minutos)](docs/PITCH_DECK.md)**: Minutagem, slides e script de fala guiada para gravação do vídeo de submissão.
- 🏛️ **[Arquitetura Tripartite & Modelo de Negócios](docs/12_tripartite_and_business_architecture.md)**: Ciclo Estudante ⇄ IES ⇄ RH, compliance de estágios, validade universal e Jovian Tech.
- 📊 **[Plano de Negócios & GTM](docs/BUSINESS_PLAN.md)**: Modelagem B2B2C freemium, unit economics, personas e estratégia beachhead.
- 🎬 **[Demo Runbook](demo/RUNBOOK.md)**: Passo a passo de execução da demo ao vivo on-chain e IA.
- 🏗️ **[Visão Geral de Arquitetura](docs/01_architecture_overview.md)**: Topologia, privacidade LGPD e stack open-source.
- 🧪 **[Guia do Validador & Testes](docs/VALIDATOR_TESTING_GUIDE.md)**: Configuração do validador local, programas clonados e gerador de templates.

---

## 1. O Problema (A Dor Real)

Hoje, o histórico educacional do estudante é **refém das instituições de ensino**:
- **Lentidão & Burocracia**: Solicitações de histórico, validação de horas complementares e transferências de cursos demoram semanas em secretarias acadêmicas e frequentemente envolvem cobrança de taxas.
- **Fraude Endêmica**: Mais de 10% dos certificados e diplomas apresentados em processos seletivos contêm adulterações em PDF.
- **Custo para Recrutadores & Universidades**: RHs e faculdades perdem tempo e dinheiro ligando ou enviando e-mails para checar autenticidade de documentos.

---

## 2. A Solução: Passaporte Acadêmico Soberano

O **LattesChain** cria uma ponte direta entre universidades, estudantes e validadores:

```mermaid
graph LR
    U[Universidade\nIssuer / Credential] -->|CreateSchema| S[Schema\ndisciplina / diploma]
    U -->|CreateAttestation| A[Attestation\nna carteira do aluno]
    S --> A
    A -->|token soulbound\nToken-2022| AL[Aluno\nHolder]
    AL -.->|carteira pública / QR Code| V[Validador / RH\nlê direto da Solana]
    V -->|IA: traduz pra\nlinguagem natural| R[Trust Report & Equivalência]
```

1. **Emissão Soberana**: A universidade emite uma atestação oficial para a carteira do estudante (onboarding transparente e zero-crypto).
2. **Propriedade Real**: Cada disciplina, curso livre e diploma torna-se uma credencial imutável na posse do aluno.
3. **Verificação Instantânea**: Qualquer empresa ou instituição no mundo valida a credencial em 1 segundo direto da blockchain, sem intermediários.
4. **Camada de IA Inteligente**: A IA processa as ementas emitidas, calcula o grau de equivalência curricular entre instituições e gera relatórios de confiança para recrutadores.

---

## 3. Por que Solana & Ecossistema?

A Solana é a infraestrutura ideal para certificações educacionais em escala global:

- **Solana Attestation Service (SAS)**: Em vez de contratos proprietários opacos, usamos o padrão aberto da Solana (`22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG`), interoperável com Solana ID e Civic.
- **Token-2022 Soulbound & Revogável**:
  - `NonTransferable`: Garante que o diploma ou certificado nunca possa ser vendido ou transferido.
  - `PermanentDelegate`: Permite que a instituição revogue a atestação on-chain em caso de fraude ou erro, sem depender da autorização do aluno.
- **Custo de Sub-Centavo**: Emissões em massa custam frações de centavo (< R$ 0,01), viabilizando milhões de atestações por semestre.
- **Privacidade & LGPD por Design**: Nenhum dado sensível (nome, CPF, dados do aluno) vai para a rede. Apenas o hash SHA-256 do documento canônico é ancorado on-chain.

---

## 4. Stack Tecnológica 100% Free, Open-Source & Self-Hosted

Toda a arquitetura foi desenhada para operar a **custo zero de infraestrutura** no MVP:

| Camada | Tecnologia | Licença / Modalidade | Custo |
| :--- | :--- | :--- | :---: |
| **Blockchain** | Solana (SAS + Token-2022) | Open Source / Permissionless | Sub-cent (< R$ 0,01) |
| **Backend / Relayer** | Go (Golang) + Python SAS SDK | Open Source (BSD / MIT) | R$ 0,00 |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Open Source / Free Tier | R$ 0,00 |
| **Frontend** | Next.js + Tailwind CSS | Open Source / Cloudflare Pages / Vercel Free | R$ 0,00 |
| **Camada de IA** | Ollama / Groq / Google Gemini Free | Open Source / Free Tier API | R$ 0,00 |

---

## 5. Estrutura do Repositório

```
LattesChain/
├── README.md                 # Este documento — planejamento e visão consolidada
├── docs/                     # Especificações detalhadas e documentação técnica
│   ├── PITCH_DECK.md         # Roteiro de pitch de 5 minutos para submissão
│   ├── BUSINESS_PLAN.md      # Modelagem de negócios B2B2C e estratégia GTM
│   ├── 00_index.md           # Índice de documentação técnica
│   ├── 01_architecture_overview.md # Arquitetura geral do sistema
│   └── adr/                  # Architecture Decision Records (ADR 001-007)
├── educore_contracts/        # Smart Contracts Anchor (MasterRegistry, IES e Emissões)
│   ├── Anchor.toml           # Configuração de cluster e clonagem de Memo e SAS
│   ├── programs/             # Código Rust do programa EduCore (lib.rs)
│   └── tests/                # Suíte de testes de integração Anchor (.spec.ts)
├── scripts/                  # Automação do Validador e Gerador de Templates
│   └── validator-template-generator.mjs # CLI de diagnóstico e gerador de testes
├── sas/                      # Pipeline executável do Solana Attestation Service
│   ├── sas_core.py           # Core: constantes, codecs, PDAs e decoders
│   ├── sas_client.py         # Builders de instruções e envio de transações
│   ├── 00_setup_wallets.py   # Criação/carregamento de keypairs locais
│   ├── 01_create_credential.py # Registro da universidade como emissor
│   ├── 02_create_schema.py   # Registro dos schemas (disciplina e diploma)
│   ├── 03_issue_attestation.py # Emissão de atestação on-chain
│   ├── 04_issue_soulbound.py # Emissão com Token-2022 Soulbound
│   ├── 05_verify.py          # Verificação de atestações direto da rede
│   ├── 06_revoke.py          # Demonstração de revogação nativa
│   ├── tests/                # Testes Python SAS locais
│   └── README.md             # Instruções de setup do módulo SAS
├── ai/                       # Camada de IA (Equivalência e Relatórios)
│   ├── equivalence_check.py  # Análise semântica de equivalência de ementas
│   ├── trust_report.py       # Geração de Trust Report para RH
│   └── requirements.txt      # Dependências da camada de IA
├── api/                      # Backend Go Relayer (Open-Source REST API)
├── supabase/                 # Schemas SQL e Políticas RLS (PostgreSQL)
└── demo/
    └── RUNBOOK.md            # Roteiro passo a passo da demo ao vivo
```

---

## 6. Como Executar a Demonstração On-Chain

### 6.1 Pré-requisitos
- Python 3.10+ instalado
- `uv` ou ambiente virtual Python

### 6.2 Execução do Pipeline SAS (Solana Devnet)
```bash
# 1. Configurar dependências
cd sas
pip install -r requirements.txt

# 2. Configurar carteiras e fundos de teste
python 00_setup_wallets.py

# 3. Registrar universidade e schemas
python 01_create_credential.py
python 02_create_schema.py

# 4. Emitir atestação e mint soulbound
python 03_issue_attestation.py
python 04_issue_soulbound.py

# 5. Verificar atestação on-chain
python 05_verify.py disciplina

# 6. Demonstrar revogação de credencial
python 06_revoke.py
```

### 6.3 Executar a Camada de IA
```bash
# Ambiente com uv
uv venv .venv
.venv\Scripts\activate
uv pip install -r ai/requirements.txt

# Gerar Trust Report para o RH
python ai/trust_report.py

# Executar checagem de equivalência curricular
python ai/equivalence_check.py
```

### 6.4 Executar a Aplicação Web Full-Stack (Next.js 14)
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
# Acesse em http://localhost:3000
```

#### Rotas Principais da Aplicação:
- `/`: Landing page com proposta de valor, métricas e seletor de idiomas (PT, EN, ES).
- `/validator`: Validador público de documentos (PDF/Hash), Motor de Equivalência Curricular por IA e Solicitação de Comprovação para Estágios/Vagas (Compliance RH).
- `/student`: Passaporte acadêmico soberano do estudante, formulário de solicitação de validação à IES, timeline de status e autorização de compliance.
- `/university`: Portal IES com fila de triagem de solicitações de alunos, emissão manual de diplomas e diretório geral de alunos matriculados.
- `/admin-protocol`: Master Registry e governança descentralizada do ecossistema.
- `/sobre`: Página institucional sobre o LattesChain como produto oficial da **Jovian Tech** e validade universal.
- `/precos`: Tabela de preços, planos para universidades (Start, Campus Pro, Enterprise), planos para RHs e gratuidade para estudantes.

### 6.5 Branches do Repositório: Produção Real vs Demonstração

- **Branch `dev-alex` (Ambiente Real / Zero Mock)**:
  Contém o código de produção limpo, sem componentes ou dados sintéticos. Todas as operações de emissão, cadastro de IES, validação de passaporte de aluno e auditoria de documentos consultam e persistem diretamente no Supabase e na rede Solana Devnet via Serverless Functions.

- **Branch `demo/mock-showcase` (Ambiente de Demonstração & Pitch)**:
  Branch isolada contendo dados canônicos pré-configurados (UFMG, USP, PUC Minas, estudante com histórico e diplomas Soulbound) e motor de equivalência curricular determinístico resiliente a falhas de rede, ideal para gravação de vídeos e apresentação no Hackathon Universitário Superteam Brasil.
```bash
# Para rodar o ambiente de demonstração com mock canônico:
git checkout demo/mock-showcase
npm run dev
```

### 6.6 Integrações MCP (Model Context Protocol)

O ecossistema conta com suporte a servidores MCP para automação e orquestração de DataSecAIOps:
- **Vercel MCP** (`https://mcp.vercel.com`): Gerenciamento de projetos, deploys, análise de build logs e monitoramento de Web Analytics.
- **Supabase MCP** (`https://mcp.supabase.com/mcp`): Gerenciamento de bancos de dados, migrations, branches e queries SQL.
- **Context7 MCP**: Resolução semântica de documentações técnicas e SDKs.
- **Chrome DevTools MCP**: Automação e inspeção de fluxos em navegadores headless/headed.

Para conectar o Vercel MCP em qualquer cliente:
```bash
npx -y add-mcp https://mcp.vercel.com -g -y -a antigravity -a gemini-cli
```

---

## 7. Ambiente de Testes Locais com Validador & Gerador de Templates 🧪

Seguindo as convenções oficiais do **[create-solana-dapp](https://github.com/solana-foundation/create-solana-dapp)** e **[solana-foundation/templates](https://github.com/solana-foundation/templates)**, o LattesChain conta com um ambiente completo de testes locais para **Anchor (Rust)** e **SAS (Python)** contra o `solana-test-validator`.

### 7.1 Por que Validador com Clonagem?
O LattesChain depende de programas externos:
1. **SPL Memo (`Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo`)**: consumido no CPI de auditoria da instrução `log_academic_event`.
2. **Solana Attestation Service (`22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG`)**: consumido pelo pipeline de atestações do SAS.

Em um validador local limpo, esses programas não existem. Por isso, nosso comando de inicialização clona esses programas da **Devnet** no boot, permitindo testes 100% locais, determinísticos e sem depender de faucets ou rate-limits de RPC.

### 7.2 Comandos Rápidos

| Comando | Descrição |
| :--- | :--- |
| `npm run validator:start` | Sobe o `solana-test-validator` com clonagem do **Memo** e **SAS** da Devnet |
| `npm run validator:check` | Diagnóstico de saúde: testa RPC `8899` e confirma que os programas clonados estão ativos |
| `npm run validator:template -- <tipo> <nome>` | **Gerador de templates**: scaffolda novos testes (`anchor`, `python` ou `bankrun`) |
| `npm run validator:cmd` | Exibe o comando CLI bruto do validador com todos os parâmetros |
| `npm run anchor:build` | Compila os smart contracts Anchor em `educore_contracts/` |
| `npm run anchor:test` | Executa a suíte de testes Anchor contra o validador ativo |

### 7.3 Passo a Passo: Subindo o Validador e Testando

```bash
# 1. Em um terminal dedicado, inicie o validador com as dependências clonadas:
npm run validator:start

# 2. Em outro terminal, faça o diagnóstico de saúde:
npm run validator:check

# 3. Compile e execute os testes Anchor:
npm run anchor:build
npm run anchor:test
```

### 7.4 Gerador de Cenários de Teste (`validator:template`)
Para acelerar o desenvolvimento de novos cenários (evitando o setup manual de PDAs e contas), use o CLI gerador integrado:

```bash
# Gera teste Anchor (TypeScript) em educore_contracts/tests/
npm run validator:template -- anchor test_batch_emissions

# Gera teste SAS em Python em sas/tests/ apontado para o validador local
npm run validator:template -- python test_revocation_flow

# Gera teste in-memory ultrarrápido com solana-bankrun
npm run validator:template -- bankrun test_isolated_runtime
```

### 7.5 Executando o Pipeline SAS Localmente em Python
Com o validador ativo (`npm run validator:start`), você pode rodar o pipeline Python SAS sem tocar na Devnet:

```bash
# Aponta para o validador local (porta 8899)
export EDUCORE_RPC_URL="http://127.0.0.1:8899"

# Executa o teste automatizado local do SAS
python sas/tests/test_validator_sas_local.py

# Ou o pipeline completo:
python sas/00_setup_wallets.py
python sas/01_create_credential.py
python sas/02_create_schema.py
python sas/03_issue_attestation.py
python sas/05_verify.py disciplina
```

### 7.6 Como Usar Este Repositório como Template via `create-solana-dapp`
O projeto já inclui a configuração `"create-solana-dapp"` no [`package.json`](package.json). Qualquer desenvolvedor pode instanciar o LattesChain como template diretamente via CLI oficial:

```bash
npx create-solana-dapp@latest -t <seu-usuario-github>/LattesChain
```
Ao final da instalação, as instruções de inicialização do validador e execução dos testes são apresentadas automaticamente no terminal.


