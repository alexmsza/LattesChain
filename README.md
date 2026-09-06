# LattesChain — Passaporte Acadêmico Global Descentralizado 🎓⛓️

[![Solana](https://img.shields.io/badge/Blockchain-Solana%20Devnet%20%2F%20Mainnet-9945FF?logo=solana)](https://solana.com)
[![SAS](https://img.shields.io/badge/Protocolo-Solana%20Attestation%20Service-14F195)](https://attest.solana.com)
[![Token-2022](https://img.shields.io/badge/Token--2022-Soulbound%20%26%20Revocable-blueviolet)](https://spl.solana.com/token-2022)
[![Open Source](https://img.shields.io/badge/Stack-100%25%20Free%20%26%20Open--Source-brightgreen)](https://opensource.org)
[![Superteam Brasil](https://img.shields.io/badge/Hackathon-Superteam%20Brasil-008C4C)](https://uni.superteam.com.br/)

> **Projeto submetido ao [Hackathon Universitário Superteam Brasil](https://uni.superteam.com.br/)**  
> Listagem oficial no Superteam Earn: [Hackathon Universitária Superteam Brasil](https://superteam.fun/earn/listing/hackathon-universitaria-superteam-brasil-1)  
> **Missão**: Transformar credenciais, diplomas e históricos acadêmicos em atestações soberanas, imutáveis e verificáveis globalmente na **Solana**.

---

## 📑 Sumário Executivo de Documentação

- 🎙️ **[Roteiro de Pitch (5 Minutos)](docs/PITCH_DECK.md)**: Minutagem, slides e script de fala guiada para gravação do vídeo de submissão.
- 🏛️ **[Arquitetura Tripartite & Modelo de Negócios](docs/12_tripartite_and_business_architecture.md)**: Ciclo Estudante ⇄ IES ⇄ RH, compliance de estágios, validade universal e produto Jovian Tech.
- 📊 **[Plano de Negócios & GTM](docs/BUSINESS_PLAN.md)**: Modelagem B2B2C freemium, unit economics, personas e estratégia beachhead.
- 🛡️ **[Relatório de Auditoria & Due Diligence](DUE_DILIGENCE_AUDIT.md)**: Auditoria técnica independente de 52KB cobrindo contratos Anchor, segurança e LGPD.
- 🎬 **[Demo Runbook](demo/RUNBOOK.md)**: Passo a passo para execução da demonstração ao vivo on-chain e IA.
- 🏗️ **[Visão Geral de Arquitetura](docs/01_architecture_overview.md)**: Topologia, privacidade LGPD e stack open-source.
- 🧪 **[Guia do Validador & Testes Locais](docs/VALIDATOR_TESTING_GUIDE.md)**: Setup do `solana-test-validator` com programas clonados e templates de teste.

---

## 1. O Problema: Burocracia, Fraudes e Atrito no Ensino Superior

Hoje, o ecossistema educacional e o mercado corporativo enfrentam custos bilionários com validação documental manual:

1. **Sobrecarga Crônica nas Secretarias Acadêmicas**: Universidades despendem semanas processando solicitações manuais de aproveitamento de disciplinas, emissão de segunda via de diplomas e declarações de matrícula.
2. **Epidemia de Fraudes em Diplomas e Certificados**: Estima-se que mais de 10% dos currículos e certificados apresentados em seleções contenham adulterações digitais em PDFs comuns, impossíveis de auditar sem telefonar para a instituição de origem.
3. **Atrito Extremo para Alunos e Recrutadores**: Estudantes perdem vagas de estágio e oportunidades internacionais aguardando carimbos; empresas gastam até 15 dias em processos de *background check* educacional.

---

## 2. A Solução LattesChain: Passaporte Acadêmico Soberano

O **LattesChain** é um protocolo que une **Universidades**, **Estudantes** e **Empresas/RHs** sobre a infraestrutura ultrarrápida da **Solana**:

```mermaid
graph LR
    subgraph Emissao ["1. Emissão Autêntica"]
      IES[Universidade Credenciada\nAssinatura ICP-Brasil] -->|Hash SHA-256| SAS[Solana Attestation Service\nToken-2022 Soulbound]
    end

    subgraph Posse ["2. Posse Soberana"]
      SAS -->|Mint Intransferível| WALLET[Passaporte do Aluno\nCarteira Pública / QR Code]
    end

    subgraph Verificacao ["3. Verificação Pública"]
      WALLET -.->|Hash / URL / PDF| VAL[Validador RH Instantâneo\nConsulta On-Chain em <400ms]
      VAL -->|Análise Semântica| IA[Motor de IA Gemini 1.5 Pro\nTrust Report & Equivalência]
    end
```

- **Emissão Soberana**: Universidades ancoram atestações no padrão aberto SAS (*Solana Attestation Service*) e emitem certificados como tokens Soulbound (Token-2022).
- **Propriedade Real pelo Estudante**: O aluno possui sua identidade educacional em sua própria carteira, compartilhável via link ou QR Code.
- **Validação Pública em 1 Segundo**: Qualquer recrutador ou universidade do mundo confere a autenticidade diretamente na blockchain, sem intermediários e sem custo.
- **Camada de Inteligência Artificial**: Tradução de dados brutos da blockchain em relatórios executivos de confiança (*Trust Reports*) e análise semântica de equivalência entre ementas curriculares.

---

## 3. Principais Features do Sistema

### 3.1 Passaporte Acadêmico do Estudante (`/student`)
- **Visualização Unificada de Conquistas**: Histórico completo de disciplinas cursadas, cursos de extensão e diplomas oficiais.
- **Token-2022 Soulbound**: Credenciais intransferíveis (`NonTransferable`) com capacidade de revogação auditada (`PermanentDelegate`).
- **Barra de Progresso de Horas Complementares**: Acompanhamento visual da carga horária concluída vs. exigida pelo MEC.
- **Compartilhamento Descomplicado**: Geração de link público e QR Code para inserção em currículos, perfis do LinkedIn ou envio direto ao RH.
- **Ação Rápida "Validar no RH"**: Botão direto em cada certificado para conferência pública em 1 clique.
- **Fila de Solicitações Tripartite**: Envio de solicitações de validação de cursos extracurriculares diretamente para a secretaria da IES.

### 3.2 Validador RH Instantâneo (`/validator`)
- **Consulta Criptográfica em Tempo Real**: Verificação em menos de 400ms na Solana Devnet/Mainnet por hash SHA-256 ou transação.
- **Validação Local de PDFs (LGPD Native)**: O hash do arquivo PDF é computado no navegador do usuário (`crypto.subtle`); nenhum dado sensível ou documento trafega para servidores de terceiros.
- **Test Drive em 1 Clique (Hackathon Showcase)**: Quatro presets canônicos prontos para testes instantâneos:
  1. *UFMG - Diploma de Ciência da Computação (Soulbound Válido)*
  2. *Superteam - SAS Attested Course (Solana Developer)*
  3. *Hackathon - Certificado de Horas de Extensão*
  4. *Fraude / Revogado (Simulação de Diploma Cancelado)*
- **Auto-Validação por URL**: Suporte nativo a parâmetros `?query=<hash>` ou `?hash=<hash>` para validação automatizada ao carregar a página.
- **Detecção de Fraude & Alerta Visual**: Exibição imediata de alertas vermelhos caso o documento tenha sido adulterado ou revogado pelo emissor.

### 3.3 Motor de Inteligência Artificial Curricular (Gemini 1.5 Pro)
- **Trust Report Automatizado**: Geração de parecer técnico para recrutadores, interpretando o contexto institucional, autenticidade on-chain e data de emissão.
- **Análise Semântica de Equivalência**: Comparador entre duas ementas universitárias (ex: UFMG vs. USP), analisando compatibilidade de carga horária, tópicos coincidentes, grau percentual de equivalência e parecer técnico justificado.

### 3.4 Portal do Emissor Universitário (`/university`)
- **Emissão Individual e em Lote**: Interface amigável para secretarias acadêmicas emitirem atestações de disciplinas, horas complementares ou diplomas.
- **Metadados Oficiais do MEC**: Registro de Portaria MEC, CNPJ, carga horária, nota e texto de ementa.
- **Ações Imediatas Pós-Emissão**: Após ancorar na Solana, a interface exibe botões rápidos para *Testar no Validador RH*, *Ver no Passaporte do Aluno* ou *Inspecionar no Solana Explorer*.
- **Fila de Triagem de Alunos**: Painel para aprovar ou rejeitar solicitações de aproveitamento de estudos enviadas pelos alunos.

### 3.5 Governança Descentralizada & Circuit Breakers (`educore_contracts`)
- **Smart Contracts Anchor Rust**: Registro mestre de instituições de ensino (`MasterRegistry`) e mapeamento por CNPJ.
- **Circuit Breaker de Emergência**: Capacidade de pausar o protocolo (`is_paused`) em caso de incidentes de segurança.
- **CPI Seguro**: Chamadas entre programas para registro de auditoria no SPL Memo e emissões no SAS.

### 3.6 Arquitetura Tripartite & Internacionalização
- **Ciclo Tripartite**: Aluno solicita ➔ Universidade atesta e homologa ➔ Empresa valida e contrata com compliance LGPD.
- **Multilíngue (i18n)**: Suporte completo em tempo real para **Português**, **Inglês** e **Espanhol**.

---

## 4. Pipeline Visual e Timeline do Fluxo de Valor

Implementado interativamente na landing page ([`VisualFlowPipeline.tsx`](src/components/VisualFlowPipeline.tsx)), o fluxo divide-se em 5 etapas claras:

| Etapa | Responsável | Ação Realizada | Padrão Tecnológico |
| :---: | :--- | :--- | :--- |
| **01** | **Secretaria IES** | Emite diploma ou certificado com assinatura digital ICP-Brasil e metadados MEC. | ICP-Brasil + SHA-256 |
| **02** | **Solana Core** | Âncora imutável da atestação no Solana Attestation Service e mint Token-2022. | SAS Program + Soulbound PDA |
| **03** | **Validador RH** | Consulta pública ultrarrápida da atestação por hash ou arquivo PDF em < 400ms. | Solana RPC + Public Verifier |
| **04** | **Aluno Holder** | Credencial visível no passaporte soberano, com QR Code dinâmico e link de validação. | Sovereign Wallet Identity |
| **05** | **IA Curricular** | Tradução dos dados brutos em Trust Report para RH e cálculo de equivalência de disciplinas. | Google Gemini 1.5 Pro |

### Comparativo de Cenários no Simulador ao Vivo

- **Cenário de Sucesso (Happy Path)**:
  1. IES credenciada emite a credencial para o aluno.
  2. Atestação gerada on-chain com hash canônico e mint Soulbound.
  3. Validador atesta: `STATUS: VÁLIDO & AUTÊNTICO`.
  4. IA emite: *"Documento com integridade criptográfica 100% verificada na Solana Devnet."*
- **Cenário de Fraude / Revogação**:
  1. Tentativa de apresentação de diploma adulterado ou cancelado judicialmente.
  2. Consulta detecta revogação via instrução nativa do Token-2022 `PermanentDelegate`.
  3. Validador atesta: `STATUS: REVOGADO / FRAUDULENTO`.
  4. IA emite: *"Aviso de Risco Crítico: Este documento não possui atestação ativa e foi formalmente revogado pela instituição emissora."*

---

## 5. Como Usar o Sistema (Guia Passo a Passo por Perfil)

### 5.1 Para Empresas e Recrutadores (Validação em 1 Clique)
1. Acesse `/validator`.
2. Para testar sem digitar nada, clique em qualquer um dos 4 botões de **Test Drive Rápido**:
   - Clique em **"UFMG - Diploma Válido"** para validar um diploma canônico.
   - Clique em **"Fraude / Revogado"** para testar a detecção em tempo real de cancelamento on-chain.
3. Para validar um arquivo recebido de um candidato, arraste o PDF para o campo de upload ou cole o hash SHA-256.
4. Clique em **"Verificar Documento On-Chain"**. O resultado será exibido em milissegundos com o selo verde de autenticidade, link para o Solana Explorer e o parecer do Gemini 1.5 Pro.
5. Para analisar compatibilidade de currículos, clique na aba **"Equivalência Curricular (IA)"**, selecione as duas disciplinas e clique em **"Avaliar Equivalência com IA"**.

### 5.2 Para Estudantes (Meu Passaporte)
1. Acesse `/student`.
2. Visualize todas as suas atestações ativas, notas e o progresso da sua carga horária de extensão.
3. Para apresentar seu passaporte para um recrutador, clique em **"Compartilhar Passaporte"** para copiar seu link público de validação ou em **"QR Code Geral"** para exibir o código na tela.
4. Para auditar qualquer disciplina específica, clique em **"Validar no RH"** diretamente no card da credencial para abri-la no validador.
5. Caso tenha concluído um curso externo (ex: Superteam Solana Bootcamp), utilize a seção **"Solicitar Validação de Atividade"** para enviar a ementa e carga horária para homologação da sua faculdade.

### 5.3 Para Faculdades e Universidades (Portal IES)
1. Acesse `/university`.
2. No formulário de emissão, selecione o tipo de documento (*Disciplina*, *Horas Complementares* ou *Diploma Oficial*).
3. Preencha o nome do aluno, CPF, carteira Solana (ou utilize a carteira de teste padrão) e a ementa curricular.
4. Clique em **"Emitir Atestação On-Chain"**. A transação é enviada e assinada na Solana Devnet.
5. No painel lateral, utilize os botões rápidos:
   - **"Testar no Validador RH"**: Abre a verificação pública imediata da atestação recém-emitida.
   - **"Ver no Passaporte do Aluno"**: Confere a credencial refletida instantaneamente na carteira do estudante.

---

## 6. Mapeamento de Rotas da Interface & Endpoints de API

### 6.1 Rotas da Interface Web (Next.js 14 App Router)

| Rota | Descrição | Acesso |
| :--- | :--- | :---: |
| `/` | Landing page com posicionamento tripartite, métricas e pipeline interativo | Público |
| `/validator` | Validador público de documentos, exportação de certidão PDF e motor de IA | Público |
| `/student` | Passaporte acadêmico do aluno com barra de horas MEC, QR code e solicitações | Estudante |
| `/university` | Portal do emissor IES com emissão on-chain, triagem de pedidos e diretório | IES |
| `/admin-protocol` | Governança de autoridades IES e homologação de novos usuários com 1 clique | Administrador |
| `/precos` | Planos comerciais para Universidades, RHs e gratuidade para estudantes | Público |
| `/sobre` | Detalhamento institucional do protocolo LattesChain e Jovian Tech | Público |
| `/login` | Autenticação com verificação de perfil aprovado (Supabase Auth) | Público |
| `/cadastro` | Solicitação de cadastro com validação de CPF/CNPJ e ticket de protocolo | Público |

### 6.2 Endpoints REST da API

| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `POST` | `/api/credentials/verify` | Valida hash de documento ou transação no protocolo SAS / Solana |
| `POST` | `/api/credentials/issue` | Emite atestação on-chain no SAS com metadados acadêmicos |
| `GET` | `/api/credentials/student` | Retorna passaporte, credenciais e horas complementares de um aluno |
| `POST` | `/api/ai/trust-report` | Gera relatório de confiança em linguagem natural via Gemini 1.5 Pro |
| `POST` | `/api/ai/equivalence` | Realiza análise semântica e cálculo de equivalência entre ementas |
| `GET` | `/api/institutions` | Lista instituições credenciadas e seus status no protocolo |
| `GET/POST`| `/api/requests/student` | Cria e lista solicitações de validação enviadas por alunos |
| `POST` | `/api/requests/institution/review` | Aprova ou rejeita solicitações de alunos pela universidade |
| `POST` | `/api/compliance/request` | Cria solicitação de compliance educacional para processos seletivos |
| `GET` | `/api/compliance/student` | Consulta termos e autorizações de compliance de um candidato |
| `GET` | `/api/admin/users` | Lista contas de usuários cadastradas com filtro por status (`PENDING`, `APPROVED`, etc.) |
| `POST` | `/api/admin/users/review` | Aprova ou rejeita solicitação de cadastro com envio de notificação |
| `POST` | `/api/auth/signup` | Criação de usuário no Supabase Auth com ticket e perfil pendente |
| `GET` | `/api/auth/approve` | Link assinado HMAC-SHA256 para homologação de cadastro via email |
| `GET` | `/api/auth/reject` | Link assinado HMAC-SHA256 para recusa de cadastro via email |

---

## 7. Como Rodar o Projeto Localmente

### 7.1 Pré-requisitos
- **Node.js**: v18.18.0 ou superior (Node 20+ recomendado)
- **npm** ou **pnpm**
- **Rust & Cargo** (opcional, para compilar contratos Anchor)
- **Solana CLI** `1.18+` (opcional, para rodar validador local)
- **Python 3.10+** (opcional, para rodar scripts SAS puros)

### 7.2 Execução da Aplicação Web Full-Stack

```bash
# 1. Clonar o repositório
git clone https://github.com/alexmsza/LattesChain.git
cd LattesChain

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# (Preencha as chaves do Supabase e Solana RPC caso queira usar endpoints próprios)

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 7.3 Verificação de Build de Produção

```bash
npm run build
npm run start
```

---

## 8. Ambiente de Testes Locais com Validador & Anchor 🧪

Seguindo as convenções oficiais do **create-solana-dapp**, o LattesChain disponibiliza um ecossistema completo para testes locais determinísticos com programas clonados da Devnet.

### Comandos Disponíveis no `package.json`

```bash
# Iniciar o solana-test-validator clonando o SPL Memo e o Solana Attestation Service (SAS):
npm run validator:start

# Executar diagnóstico de saúde das portas RPC e dos programas clonados:
npm run validator:check

# Gerar automaticamente novos templates de teste (Anchor, Python SAS ou Bankrun):
npm run validator:template -- anchor meu_teste_lote
npm run validator:template -- python meu_teste_revogacao

# Compilar e testar os smart contracts Anchor:
npm run anchor:build
npm run anchor:test
```

Para mais detalhes sobre a execução do pipeline Python SAS e testes isolados, consulte o **[Guia do Validador & Testes Locais](docs/VALIDATOR_TESTING_GUIDE.md)**.

---

## 9. Privacidade, Conformidade MEC e Segurança

- **100% LGPD por Design**: Nenhum dado pessoal identificável (PII) é registrado na blockchain. Apenas a função de mão única SHA-256 do documento canônico é ancorada na rede. O documento original permanece armazenado com segurança pela instituição emissora.
- **Portaria MEC nº 330/2018 e nº 554/2019**: O protocolo foi concebido para incorporar os requisitos do Diploma Digital do MEC, permitindo a validação de arquivos XML assinados com certificados digitais padrão ICP-Brasil acoplados à atestação on-chain.
- **Circuit Breakers & Defesa em Profundidade**: Todos os contratos do protocolo contam com verificação de integridade e mecanismos de pausa de emergência protegidos por chaves multisig.

---

## 10. Equipe e Reconhecimentos

Desenvolvido para o **Hackathon Universitário Superteam Brasil**:
- **Solana Attestation Service (SAS)**
- **Token-2022 Extensions (NonTransferable & PermanentDelegate)**
- **Superteam Brasil Community**

Para suporte, parcerias e credenciamento de novas universidades, consulte **[docs/12_tripartite_and_business_architecture.md](docs/12_tripartite_and_business_architecture.md)** ou entre em contato com a equipe Jovian Tech.
