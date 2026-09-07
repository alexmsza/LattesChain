# 20. Governança de Acesso Admin (`jovian.foo`), Tradução Completa (i18n) e Tabela de Preços

## 1. Descrição da Mudança
Esta atualização estabelece:
1. **Governança Determinística de Administradores Jovian Tech**:
   - Todo usuário portador de e-mail sob o domínio `@jovian.foo` recebe automaticamente o papel de `ADMIN` com status `APPROVED`.
   - Criação do mecanismo de auto-provisionamento no fluxo de **Primeiro Acesso / Esqueci minha Senha** (`/recuperar-senha`), permitindo que administradores obtenham credenciais sem depender de pré-cadastro manual no banco de dados.
   - Atualização do fluxo de login e middleware com bypass e permissões completas para `@jovian.foo`.
2. **Internacionalização Integral (i18n)**:
   - Dicionário exaustivo em Português (`pt`), Inglês (`en`) e Espanhol (`es`) em `src/lib/i18n/translations.ts`.
   - Conversão reativa de componentes e páginas centrais: Página Inicial (`/`), Pipeline Interativo (`VisualFlowPipeline.tsx`), Rodapé (`Footer.tsx`), Autenticação (`/login`, `/recuperar-senha`, `/redefinir-senha`, `/cadastro`), Guia da Carteira (`/guia-carteira`) e Tabela de Preços (`/precos`).
3. **Parametrização do Plano Start (Preços)**:
   - Inclusão do plano **Iniciação Digital / Plano Start** por **R$ 0 / mês** (com **1 mês grátis para teste**), ideal para faculdades isoladas testarem emissão de diplomas na Solana.
   - Limite de até 500 atestações/ano, emissão de diplomas Soulbound (Token-2022), Portal Web de Emissão e Suporte técnico.
4. **Padronização dos Canais de Contato**:
   - Unificação de e-mails corporativos, DPO e suporte para o endereço oficial determinístico: `contact@jovian.foo`.

---

## 2. Impacto no Sistema

| Camada | Componente / Rota | Impacto |
| :--- | :--- | :--- |
| **Auth Server** | `/api/auth/forgot-password` | Auto-criação de conta `ADMIN` no Supabase Auth + `user_profiles` caso usuário `@jovian.foo` solicite primeiro acesso. |
| **Auth Server** | `/api/auth/signup` | Aprovação imediata (`APPROVED`) com role `ADMIN` para contas `@jovian.foo`. |
| **Middleware** | `src/middleware.ts` | Reconhecimento imediato de permissão de acesso a `/student`, `/university` e `/admin-protocol` para administradores `@jovian.foo`. |
| **Admin API** | `/api/admin/*` | Validação tolerante a falhas que autentica qualquer sessão válida com e-mail `@jovian.foo`. |
| **Frontend** | `src/app/page.tsx` | Página inicial agora é um Client Component dinâmico conectado ao `useLanguage()`. |
| **Frontend** | `VisualFlowPipeline.tsx` | Simulação e etapas agora traduzem em tempo real ao clicar nos botões `PT`, `EN` ou `ES`. |
| **Frontend** | `Footer.tsx` e `Sobre` | Centralização do e-mail de contato em `contact@jovian.foo`. |
| **Frontend** | `/precos` | Apresentação clara do Plano Start gratuito com 1 mês de teste. |

---

## 3. Instruções de Uso

### 3.1 Primeiro Acesso de Administrador Jovian Tech
1. Acesse `/login`.
2. Clique no link **"Primeiro acesso ou esqueceu a senha?"**.
3. Digite o e-mail oficial (ex: `admin@jovian.foo` ou `contact@jovian.foo`).
4. Clique em **"Enviar link de acesso"**.
5. Abra o e-mail recebido (ou consulte o log transacional) e clique no link de redefinição recebido (`/redefinir-senha?token=...`).
6. Defina uma senha segura com no mínimo 8 caracteres contendo letras e números.
7. Acesse `/login` com seu e-mail `@jovian.foo` e a nova senha. Você será automaticamente direcionado para o **Painel Geral do Dono do Protocolo** (`/admin-protocol`).

### 3.2 Alternância de Idioma (i18n)
- No topo da página (`Navbar`), utilize o seletor de idiomas:
  - `PT`: Português do Brasil (Padrão).
  - `EN`: Inglês.
  - `ES`: Espanhol.
- A preferência é salva no `localStorage` sob a chave `educore_lang` e sincronizada instantaneamente em todos os componentes da aplicação.

### 3.3 Contato Oficial
- Qualquer comunicação institucional ou suporte deve ser direcionada para:
  `contact@jovian.foo`
