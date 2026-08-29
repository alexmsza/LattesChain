[ESPECIFICAÇÃO DO FRONTEND EM NEXT.JS (APP ROUTER)]
Crie as interfaces da aplicação utilizando Next.js (React) e Tailwind CSS, garantindo responsividade e o padrão visual definido: Azul Marinho (bg-blue-900 / #003366), Dourado (text-yellow-500 / #D4AF37) e Branco.

Requisitos das Páginas (Crie os arquivos em `src/app/`):

1. Painel da Universidade (`src/app/university/page.tsx`):
   - Crie um formulário de "Nova Emissão de Certificado".
   - Campos: CPF do Aluno, Nome do Curso, Carga Horária, Tipo (Diploma/Horas).
   - Ação: Ao submeter, deve fazer um `fetch('POST', '/api/issue_certificate')` enviando o payload JSON.
   - Mostre um *toast* ou alerta de sucesso exibindo a `solana_tx_signature` retornada pela API.

2. Carteira Acadêmica do Aluno (`src/app/student/page.tsx`):
   - Simule uma view onde o aluno já está logado (Account Abstraction via Supabase Auth).
   - Exiba um Dashboard com um "Score de Créditos/Horas".
   - Crie um componente de Timeline cronológica mostrando os certificados recebidos (buscando da tabela `academic_records` do Supabase).
   - Adicione um botão "Exportar Carteira (QR Code)".

3. Portal do Validador Público / RH (`src/app/validator/page.tsx`):
   - Rota pública (sem necessidade de login).
   - Crie uma interface com uma "Dropzone" para upload de arquivos PDF e um campo de texto para colar a `Transaction Signature` da Solana.
   - Crie um mockup de estado de validação:
     - Estado de "Validando na Blockchain..." (loading spinner).
     - Estado "Válido" (Card verde com selo ICP-Brasil + Checkmark).
     - Estado "Inválido/Fraude" (Card vermelho indicando que o hash do PDF não bate com o registro On-Chain).

[INSTRUÇÃO AO AGENTE]
Gere o código dos 3 componentes de página mencionados (`university`, `student`, `validator`) e um `layout.tsx` global aplicando as cores primárias no header/navbar. Utilize Tailwind CSS para a estilização completa. Todos os comentários devem estar em PT-BR.
Após finalizar os arquivos, responda exclusivamente: "Frontend Next.js gerado com sucesso. Projeto EduCore Protocol estruturado."
