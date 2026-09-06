# EduCore Protocol / LattesChain — Arquitetura Tripartite, Validade Universal e Jovian Tech

> **Documento de Engenharia e Modelo de Negócios**  
> Data: 2026-09-06  
> Escopo: Ponte Tripartite (Estudante ⇄ IES ⇄ RH/Empresa), Internacionalização (PT/EN/ES), Validade Universal (Haia / W3C VC) e Posicionamento Jovian Tech.

---

## 1. Descrição da Mudança

A arquitetura do LattesChain foi expandida para suportar o fluxo completo de interação entre os 3 atores centrais da educação e empregabilidade:

1. **Estudante**:
   - Submissão de certificados de cursos internos ou externos para avaliação e homologação pela coordenação da sua universidade (`/student` ➔ Aba "Solicitar Validação à IES").
   - Acompanhamento em tempo real da timeline de status da solicitação (`PENDING`, `IN_REVIEW`, `APPROVED` on-chain na Solana Devnet, ou `REJECTED` com justificativa formal).
   - Gestão de requisições de empresas recebidas para comprovação de estágio e vagas CLT, com autorização de compartilhamento criptográfico com 1 clique.

2. **Instituição de Ensino Superior (IES)**:
   - Fila de triagem de solicitações acadêmicas submetidas por estudantes (`/university` ➔ Aba "Fila de Solicitações").
   - Capacidade de **Aprovar e Ancorar On-Chain** no Solana Attestation Service (SAS) ou **Recusar com Parecer Formal**.
   - Diretório consolidado de todos os estudantes matriculados, histórico escolar e atestações acumuladas.

3. **RH & Empresas**:
   - Auditoria pública instantânea de certificados e diplomas com emissão de Parecer de Confiança por Inteligência Artificial (`/validator` ➔ Aba "Validador RH").
   - Comparador Semântico de Equivalência Curricular por IA entre universidades (`/validator` ➔ Aba "Equivalência Curricular").
   - **Solicitação Formal de Comprovação Acadêmica (Compliance)**: Recrutadores disparam requisições criptográficas informando o CPF ou carteira do candidato para comprovar matrícula, histórico oficial ou horas de estágio (`/validator` ➔ Aba "Solicitar Comprovação").

4. **Internacionalização (i18n)**:
   - Seletor de idiomas no Navbar com suporte nativo a 🇧🇷 **Português (PT)**, 🇺🇸 **Inglês (EN)** e 🇪🇸 **Espanhol (ES)**, persistido no `localStorage` e distribuído via `LanguageContext`.

5. **Institucional & Comercial Jovian Tech**:
   - Nova página **`/sobre`**: Apresentação da **Jovian Tech** como criadora do protocolo, detalhamento dos pilares SAS, Token-2022, IA, LGPD e validação universal cross-border compatível com a Convenção de Haia.
   - Nova página **`/precos`**: Planos comerciais estruturados para Universidades (Start, Campus Pro, Enterprise), RHs/Empresas (Consulta Pública, Recrutador Pro) e Estudantes (Passaporte Gratuito vitalício).

---

## 2. Impacto Arquitetural

- **Banco de Dados (Supabase)**:
  - Criação da tabela `validation_requests` para rastrear o ciclo de vida da validação de certificados de alunos perante a IES.
  - Criação da tabela `employer_compliance_requests` para gerenciar solicitações de comprovação de empresas para candidatos.
- **Backend Serverless Next.js**:
  - `POST /api/requests/student`: Envio de solicitação com cálculo SHA-256 e anexação de metadados.
  - `GET /api/requests/student`: Consulta de solicitações do aluno.
  - `GET /api/requests/institution`: Consulta da fila da IES.
  - `POST /api/requests/institution/review`: Decisão da comissão acadêmica (aprova gerando transação Solana Devnet ou indefere).
  - `GET /api/directory/students`: Diretório consolidado de alunos e históricos.
  - `POST /api/compliance/request`: Disparo de compliance por empresas.
  - `POST /api/compliance/student`: Autorização do estudante.
- **Segurança & LGPD**:
  - Zero PII on-chain. Todo arquivo anexado tem seu hash SHA-256 computado localmente no browser do aluno, garantindo sigilo e conformidade com a LGPD e GDPR.

---

## 3. Instruções de Uso

### 3.1 Submissão de Certificado pelo Aluno
1. Acesse `/student` e clique na aba **"2. Solicitar Validação à IES"**.
2. Preencha o título, selecione a IES de destino, escolha se é curso interno ou externo, informe a carga horária e selecione o PDF do certificado.
3. Clique em **"Submeter Solicitação para a IES"**.
4. Acompanhe o andamento na aba **"3. Minhas Solicitações"**.

### 3.2 Avaliação pela Universidade (IES)
1. Acesse `/university` e abra a aba **"1. Fila de Solicitações Recebidas"**.
2. Analise os dados do aluno e o hash do certificado.
3. Clique em **"Aprovar On-Chain"** para emitir a atestação no SAS (gerando link no Solana Explorer) ou em **"Recusar"** para registrar a justificativa.
4. Acesse a aba **"3. Diretório de Alunos Matriculados"** para pesquisar qualquer aluno e auditar seu histórico curricular completo.

### 3.3 Solicitação de Compliance pelo RH / Empresa
1. Acesse `/validator` e vá na aba **"3. Solicitar Comprovação para Estágio/Vaga"**.
2. Informe o nome da empresa, e-mail corporativo, CPF ou carteira do candidato e selecione o objetivo (Estágio, CLT ou Background Check).
3. Clique em **"Enviar Solicitação de Comprovação"**.
4. O aluno verá o pedido na aba **"4. Requisições de Empresas"** do seu passaporte e poderá autorizar o compartilhamento criptográfico.

### 3.4 Alternar Idioma do Sistema
- No canto superior direito do Navbar, clique nos botões **PT**, **EN** ou **ES** para alternar instantaneamente todo o vocabulário e rótulos da plataforma.
