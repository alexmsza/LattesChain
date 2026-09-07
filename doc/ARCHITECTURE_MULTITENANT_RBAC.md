# Arquitetura Multi-Tenant, Campus e Governança Administrativa

## 1. Descrição da Mudança
Implementação da arquitetura multi-tenant completa no protocolo LattesChain:
- **Multi-Tenant para Estudantes**: Permite que um estudante pertença a múltiplas Instituições de Ensino Superior (IES) e múltiplos Campus simultaneamente através da tabela de relacionamento `student_enrollments`.
- **Gestão de Campus (Polos)**: As instituições de ensino podem criar, listar, atualizar e ativar/desativar seus polos/unidades (`institution_campuses`). O Administrador do protocolo tem visão agregada de todos os campus de todas as instituições.
- **Governança Administrativa (Admin)**:
  - Criação de novos usuários com definição de papéis (`STUDENT`, `INSTITUTION`, `EMPLOYER`, `ADMIN`) e vínculo opcional a IES/Campus.
  - Suspensão e reativação imediata de usuários (`status = 'SUSPENDED'` / `'APPROVED'`).
  - Edição e atribuição de papéis e IES a qualquer usuário cadastrado.
  - Suspensão e reativação de credenciamento de IES (`is_active = false/true`).
- **Mensageria Transacional Legal (LGPD)**:
  - Disparo de e-mail de acesso e boas-vindas com instruções do passaporte acadêmico ao estudante no momento da matrícula pela IES.
  - Disparo de notificação formal com token de consentimento unívoco ao estudante quando empresas/RH solicitam visualização de dados acadêmicos (Artigos 7º e 9º da LGPD).
- **RBAC e Indicador Visual no Topbar**:
  - Abas e navegação condicionados ao papel do usuário logado (estudantes acessam seu passaporte; IES acessa portal institucional e campus; empresas acessam validação e compliance; admin tem acesso irrestrito).
  - Badge contextual no header indicando o perfil ativo: `Estudante: [Nome]`, `Empresa: [Nome]`, `IES: [Nome da IES] • Polo: [Nome do Campus]`, ou `Admin Protocol`.

---

## 2. Impacto no Sistema
- **Camada de Dados**: Criação da migração `006_multitenant_campuses_enrollments.sql` sem afetar os dados legados de `students` e `academic_records`.
- **Segurança & RBAC**: O middleware (`src/middleware.ts`) intercepta contas com status `'SUSPENDED'`, bloqueando o acesso imediatamente e redirecionando para `/login?suspended=1`.
- **Privacidade & Compliance**: Elimina exposição arbitrária de dados acadêmicos para empresas recrutadoras sem autorização prévia por e-mail do titular dos dados.

---

## 3. Instruções de Uso

### 3.1. Instituição de Ensino (IES)
1. Acesse o portal da IES (`/university`).
2. **Gestão de Campus**: Clique na aba `Polos & Campus` para cadastrar novos polos (Nome, Código e-MEC/Sigla, Cidade, UF) ou ativar/desativar unidades existentes.
3. **Matrícula de Estudantes**: Na aba `Diretório de Alunos`, clique em `Matricular Aluno` para cadastrar novos estudantes, alocar ao polo desejado e disparar o e-mail de acesso.
4. **Filtro por Polo**: Utilize o seletor de campus na barra superior do diretório para filtrar estudantes por polo específico.

### 3.2. Administrador do Protocolo
1. Acesse a Governança (`/admin-protocol`).
2. **Usuários**: Na aba `Gestão de Usuários`, crie novos usuários com o botão `Criar Novo Usuário`, filtre por `Suspensos`, e utilize as ações `Editar / Atribuir` ou `Suspender` em qualquer registro.
3. **Instituições**: Na aba `IES Cadastradas`, visualize e adicione novos polos através do botão `Polos & Campus` de cada instituição, ou suspenda o credenciamento de uma IES com `Suspender IES`.

### 3.3. Empresa / RH
1. Acesse a aba de Validador & Compliance (`/validator`).
2. Submeta uma solicitação formal informando o identificador do estudante (CPF ou carteira Solana).
3. O sistema despacha automaticamente um e-mail transacional seguro ao aluno solicitando sua expressa anuência legal.
