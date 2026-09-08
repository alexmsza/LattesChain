# Resiliência da Sessão de Autenticação e RBAC (DataSecAIOps)

## 1. Contexto & Diagnóstico da Falha
Em deploys recentes onde a migration `006_multitenant_campuses_enrollments.sql` (que introduz as colunas `institution_id` e `campus_id` na tabela `user_profiles`) ainda não foi aplicada ao banco remoto gerenciado pelo Supabase, chamadas automáticas disparadas por `useSession` geravam erro:
```json
{
  "code": "42703",
  "message": "column user_profiles.institution_id does not exist"
}
```

### Sintomas observados
1. **Spinner infinito na Navbar**: O hook `useSession` mantinha `loading: true` permanentemente quando o perfil retornava `null` devido ao erro HTTP 400 da API REST do Supabase.
2. **Loop de redirecionamento no Middleware**: Usuários com sessão autenticada porém com status não aprovado ou perfil pendente eram redirecionados pelo middleware para `/login?pending=1`, mas a regra que impedia usuários logados de acessar `/login` os reenviava para `/`, ocultando o alerta e causando loops.
3. **Sobrescrita de papel para `@jovian.foo`**: Contas sob o domínio `@jovian.foo` cadastradas com papel específico (ex: `ana.estudante.teste@jovian.foo` como `STUDENT`) tinham seu papel forçado para `ADMIN`, impedindo a validação da experiência do estudante.

---

## 2. Correções Técnicas Implementadas

### A. Fallback Defensivo em `src/lib/useSession.ts`
- **Consulta em dois estágios**: Tenta selecionar os campos multitenant (`institution_id`, `campus_id`). Se a API retornar erro de coluna inexistente, executa automaticamente a consulta de fallback com o schema canônico base (`user_id, role, full_name, email, status, cpf, cnpj, institution_name, company_name`).
- **Garantia de Finalização do Loading**: Inclusão de bloco `try / catch / finally` onde `setLoading(false)` é invocado obrigatoriamente, evitando que qualquer exceção deixe a UI travada.

### B. Fallback em `src/lib/server/tenantHelper.ts`
- Implementação idêntica em nível de servidor para APIs que dependem de `resolveUserTenant`: se `institution_id` não existir na tabela, a consulta retrocompatível evita falhas de execução no SSR e API routes.

### C. Ajuste do Middleware (`src/middleware.ts`)
- **Liberação de `/login` com parâmetros de alerta**: Permite que usuários autenticados acessem a página de login caso os parâmetros `pending=1`, `rejected=1` ou `suspended=1` estejam presentes, exibindo claramente o motivo de impedimento.
- **Respeito ao papel de domínio**: O papel registrado em `user_profiles` prevalece; contas `@jovian.foo` apenas recebem `ADMIN` se não tiverem papel previamente definido.
- **Suporte ao redirect de `ADMIN`**: Adicionado `/admin-protocol` na cadeia de redirecionamento por papel.

### D. Presets de Demonstração em `src/app/login/page.tsx`
- Adicionados botões de 1 clique para preenchimento imediato das credenciais canônicas da banca examinadora:
  - **Aluno Demo**: `ana.estudante.teste@jovian.foo` (Senha: `SenhaAluno123`)
  - **IES / Admin**: `latteschain@jovian.foo` (Senha: `NovaSenha456`)

---

## 3. Instruções de Teste e Validação
1. **Acessar `/pitch`**: Verificar que a barra superior renderiza instantaneamente o botão "Entrar" sem travar em estado de carregamento.
2. **Acessar `/login`**: Clicar nos botões de preenchimento rápido para testar o login sem necessidade de digitação manual.
3. **Login como Aluno**: Direciona com sucesso para `/student`.
4. **Login como IES/Admin**: Direciona com sucesso para `/admin-protocol`.
