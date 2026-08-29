# EduCore Protocol — Especificação de Frontend (Next.js)

## 1. Arquitetura de Telas
- **Framework**: Next.js 14+ (App Router)
- **Design System**: Tailwind CSS
- **Paleta de Cores**:
  - Primária: Azul Marinho (`#003366` / `bg-[#003366]`)
  - Acento: Dourado (`#D4AF37` / `text-[#D4AF37]` / `border-[#D4AF37]`)
  - Neutros: Branco (`#FFFFFF`), Cinza Escuro (`#0F172A`)
- **Fontes**: Inter (corpo) / Outfit (headings) via Google Fonts
- **Autenticação**: Supabase Auth (E-mail/OAuth) — Provider no `layout.tsx`

---

## 2. Mapeamento de Rotas

| Rota | Público | Auth | Funcionalidades |
| :--- | :--- | :--- | :--- |
| `/` | Público Geral | Nenhuma | Landing page institucional |
| `/admin-protocol` | Super Admin | Supabase Auth (role: admin) | Master Registry |
| `/university` | IES (Emissor) | Supabase Auth (role: institution) | Emissão de certificados |
| `/student` | Aluno (WaaS) | Supabase Auth (role: student) | Carteira acadêmica |
| `/validator` | RH / Público | **Nenhuma (walletless + loginless)** | Validação de documentos |

---

## 3. Especificação por Rota

### 3.1 Landing Page (`src/app/page.tsx`)
- **Hero Section**: Título "Certificação Acadêmica na Blockchain", subtítulo com proposta de valor, CTA "Validar Documento" e "Acessar Plataforma".
- **Seção "Como Funciona"**: 3 cards com ícones (Emissão → Registro On-Chain → Validação).
- **Estatísticas**: Contadores animados (Certificados Emitidos, IES Cadastradas, Horas Registradas) — dados reais via query Supabase.
- **Footer**: Links institucionais, badges Solana/ICP-Brasil, contato.

### 3.2 Master Registry (`src/app/admin-protocol/page.tsx`)
- **Proteção**: Middleware Supabase Auth, role `admin`. Redirect para `/` se não autorizado.
- **Componentes**:
  - **Tabela de IES cadastradas**: Colunas (Nome, CNPJ, Pubkey Solana, Status Ativo/Inativo, Data Cadastro). Paginação server-side.
  - **Formulário "Registrar Nova IES"**: Campos (Nome, CNPJ `mask: XX.XXX.XXX/XXXX-XX`, Pubkey Solana `VARCHAR(44)`). Botão "Registrar" → chama instrução Anchor `register_university` via backend.
  - **Toggle Ativar/Desativar**: Botão por linha na tabela → chama instrução `deactivate_university` via backend.
- **Estados**: Loading (skeleton table), Sucesso (toast verde com tx_signature), Erro (toast vermelho com mensagem).

### 3.3 Painel da Universidade (`src/app/university/page.tsx`)
- **Proteção**: Supabase Auth, role `institution`.
- **Componentes**:
  - **Formulário "Nova Emissão"** (`CertificateForm.tsx`):
    - Campos: CPF do Aluno (`mask: XXX.XXX.XXX-XX`), Nome do Curso, Carga Horária (número), Tipo (`select: DIPLOMA | HORAS_COMPLEMENTARES | CERTIFICADO_CURSO`).
    - Ação: `fetch('POST', '/api/issue_certificate')` → exibe toast com `solana_tx_signature` clicável (link para Solana Explorer Devnet).
  - **Upload em Lote**: Dropzone para CSV/JSON com preview dos registros antes de submissão.
  - **Histórico de Emissões**: Tabela com (Aluno, Curso, Tipo, Hash, Tx Signature, Status, Data). Filtros por tipo e data. Link para Explorer em cada tx.
- **Estados**: Idle → Enviando (spinner + "Registrando na Blockchain...") → Sucesso (toast verde) → Erro (toast vermelho).

### 3.4 Carteira Acadêmica do Aluno (`src/app/student/page.tsx`)
- **Proteção**: Supabase Auth, role `student`. Account Abstraction — aluno não gerencia chaves.
- **Componentes**:
  - **Dashboard Header**: Nome do aluno, e-mail, wallet custodial (parcialmente mascarada), Score/Total de Horas acumuladas (badge circular animado).
  - **Timeline Cronológica** (`CertificateTimeline.tsx`): Lista vertical de certificados/horas ordenada por `issued_at` DESC. Cada item mostra: ícone por tipo, nome do curso, IES emissora, carga horária, data, link para Explorer.
  - **Botão "Exportar Carteira Acadêmica"** (`QRCodeExport.tsx`): Gera QR Code contendo URL `https://<domain>/validator?hash=<document_hash>` para validação externa por RH/terceiros.
- **Dados**: Query `academic_records` via Supabase client-side (RLS filtra por `student_id = auth.uid()`).

### 3.5 Portal do Validador / RH (`src/app/validator/page.tsx`)
- **Proteção**: **Nenhuma** — rota 100% pública, sem login, sem wallet.
- **Componentes**:
  - **Dropzone de PDF** (`ValidationDropzone.tsx`): Drag & Drop de arquivo PDF. Client-side extrai o hash SHA-256 do arquivo via `crypto.subtle.digest()` no browser. Chama `GET /api/validate?hash=<hash>`.
  - **Campo Tx Signature**: Input de texto para colar `solana_tx_signature` diretamente. Chama `GET /api/validate?tx=<tx>`.
  - **Resultado da Validação** (`ValidationResult.tsx`):
    - **Loading**: Spinner + "Verificando na Blockchain Solana..."
    - **VALID**: Card verde com checkmark animado, selo "Certificado Autêntico", dados da IES emissora, tipo do documento, data de emissão, link para Explorer.
    - **INVALID**: Card vermelho com ícone de alerta, "Documento Inválido / Possível Fraude", hash divergente do registro on-chain.
    - **NOT_FOUND**: Card cinza neutro, "Nenhum registro encontrado para este documento".
    - **PENDING**: Card amarelo, "Transação ainda não confirmada na blockchain".

---

## 4. Componentes Reutilizáveis (`src/components/`)

| Componente | Função |
|:---|:---|
| `Navbar.tsx` | Navegação responsiva com links condicionais por role. Logo + cores institucionais. |
| `Footer.tsx` | Links, badges Solana/ICP, copyright. |
| `CertificateForm.tsx` | Formulário de emissão com validação, masks e submit. |
| `CertificateTimeline.tsx` | Lista cronológica vertical de registros acadêmicos. |
| `ValidationDropzone.tsx` | Drag & Drop de PDF com extração de hash SHA-256 no client. |
| `ValidationResult.tsx` | Card de resultado com 4 estados visuais (VALID/INVALID/NOT_FOUND/PENDING). |
| `QRCodeExport.tsx` | Geração de QR Code com URL de validação. |
| `Toast.tsx` | Notificação flutuante (sucesso/erro) com auto-dismiss. |
| `StatusBadge.tsx` | Badge de status colorido (Ativo/Inativo, Válido/Inválido). |
| `DataTable.tsx` | Tabela genérica com paginação, filtros e sort. |
