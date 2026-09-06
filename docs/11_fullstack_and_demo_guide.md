# EduCore Protocol — Guia Full-Stack e Roteiro de Demonstração (Demo Branch)

> **Documento de Integração e Demonstração**  
> Data: 2026-09-06  
> Escopo: Endpoints da API Next.js, persistência no Supabase, ancoragem Solana SAS/Token-2022, motor de IA e branch `demo/mock-showcase`.

---

## 1. Visão Geral das Novas Rotas de API

O frontend Next.js agora opera com endpoints server-side integrados, conectando a interface diretamente ao Supabase e ao Solana Attestation Service (SAS):

| Endpoint | Método | Papel | Descrição |
| :--- | :---: | :---: | :--- |
| `/api/credentials/issue` | `POST` | `INSTITUTION` / `ADMIN` | Emissão de nova atestação acadêmica (disciplina, horas, diploma), persistência em `academic_records` e geração de prova on-chain. |
| `/api/credentials/student` | `GET` | Público / `STUDENT` | Consulta o passaporte acadêmico do aluno por sessão, carteira (`?wallet=...`) ou CPF (`?cpf=...`), computando total de horas. |
| `/api/credentials/verify` | `POST` | Público (RH / IES) | Verificação pública instantânea por hash SHA-256 ou assinatura de transação Solana Devnet. |
| `/api/ai/equivalence` | `POST` | Público (RH / IES) | Análise semântica e curricular de equivalência entre duas ementas, com checagem de hash on-chain e score de similaridade. |
| `/api/ai/trust-report` | `POST` | Público (RH) | Geração de parecer executivo para recrutadores a partir dos fatos criptográficos auditados na rede. |

---

## 2. Portais e Telas Atualizadas

1. **Portal da Universidade (`/university`)**:
   - Formulário completo para emissão de disciplinas, horas complementares e diplomas.
   - Cálculo automático de hash SHA-256 de PDFs no navegador.
   - Campo para inserção de ementa curricular off-chain (ancorada por hash no SAS).
   - Comprovante de emissão com link direto para o **Solana Explorer Devnet**.
   - Histórico em tempo real das atestações emitidas na sessão.

2. **Passaporte do Aluno (`/student`)**:
   - Carregamento dinâmico via `/api/credentials/student`.
   - Suporte a deep-link para visualização de qualquer carteira (`/student?wallet=...`).
   - Métrica de progresso de horas complementares (ex: 180h / 200h).
   - Modal interativo de QR Code para apresentação presencial a recrutadores.

3. **Validador Público & RH (`/validator`)**:
   - **Aba 1 (Validação de Documentos)**: Drag & drop de arquivos PDF com cálculo de hash local, consulta auditada e geração de Trust Report por IA.
   - **Aba 2 (Equivalência Curricular por IA)**: Comparador semântico de ementas entre universidades distintas (ex: UFMG vs USP), validando integridade do hash on-chain e calculando carga horária aproveitável.

4. **Administração do Protocolo (`/admin-protocol`)**:
   - Master Registry com lista de IES homologadas.
   - Painel de métricas de emissão, governança e economia protocolar.
   - Formulário para homologar novas universidades emissoras no ecossistema.

---

## 3. Separação de Ambientes e Branches

Para garantir integridade de produção e estabilidade em eventos de avaliação, o repositório adota isolamento estrito entre branches:

### A. Branch de Produção / Desenvolvimento Real (`dev-alex`)
- **Política Zero Mock**: Nenhum dado fictício, componente de demonstração ou fallback sintético.
- **Persistência Real**:
  - `POST /api/institutions` e `GET /api/institutions`: Registra e consulta IES na tabela `institutions` do Supabase.
  - `POST /api/credentials/issue`: Provisiona alunos na tabela `students`, grava credenciais em `academic_records` e audita em `verification_logs`.
  - `POST /api/credentials/verify`: Consulta exclusivamente os registros existentes no Supabase e na rede Solana Devnet. Se não localizado, retorna status real de `DOCUMENTO NÃO LOCALIZADO`.
  - `GET /api/credentials/student`: Consulta apenas registros vinculados ao aluno no banco de dados. Caso não haja registros cadastrados, retorna lista vazia `[]`.
  - `/validator`: Upload de documentos e cálculo real de SHA-256 via Web Crypto API, com interface estritamente limpa para produção.

### B. Branch de Demonstração (`demo/mock-showcase`)
Para apresentações ao vivo e gravação do pitch sem risco de instabilidade na Devnet ou rate-limit de RPCs públicos, foi estabelecida a branch dedicada **`demo/mock-showcase`**.

#### Características da Branch de Demonstração:
- Dataset canônico pré-configurado:
  - **Universidades**: UFMG, USP, PUC Minas.
  - **Aluno**: Alexandre Silva (Ciência da Computação).
  - **Credenciais**:
    1. Diploma de Bacharelado em Ciência da Computação (Token-2022 Soulbound Revogável).
    2. Disciplina "Estruturas de Dados e Algoritmos Avançados" (72h, SAS).
    3. Certificado de Extensão "Hackathon Superteam Brasil" (60h, SAS).
    4. Monitoria Acadêmica (48h, SAS).
- Botões de auto-preenchimento 1-clique para teste rápido no validador.
- Ementas pré-carregadas para demonstração imediata do motor de IA.
- Banner de demonstração com alternância de perfis e casos de uso.
