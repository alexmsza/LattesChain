[SETUP DO AMBIENTE ANCHOR (SOLANA)]
Execute no terminal na raiz do monorepo:
anchor init educore_contracts
cd educore_contracts

[ESPECIFICAÇÃO DOS SMART CONTRACTS EM RUST]
No diretório `educore_contracts/programs/educore_contracts/src/lib.rs`, implemente o Smart Contract do EduCore Protocol. O contrato deve seguir o modelo de "Master Registry", onde uma autoridade central (a plataforma) valida as Pubkeys das Universidades.

Requisitos do Código Rust (Anchor):

1. Importações: Traga as bibliotecas padrão do `anchor_lang`.
2. Estado (Accounts):
   - `MasterRegistry`: Armazena a Pubkey da autoridade (admin do sistema).
   - `UniversityRecord`: Armazena dados da instituição aprovada (Pubkey, status ativo).
3. Instruções (Functions):
   - `initialize_registry`: Cria o registro mestre e define a autoridade.
   - `register_university`: A autoridade cadastra uma nova universidade (passando a Pubkey dela).
   - `log_academic_event`: A universidade (Signer) chama esta função passando o `document_hash` e a `icp_signature`. O contrato deve verificar se a universidade está ativa no `UniversityRecord`. Após a validação, emite um Evento (`AcademicEventLogged`) on-chain.
   *(Nota de arquitetura: A chamada real para o programa nativo SPL Memo será orquestrada via Transaction Builder no backend em Go, mas o Anchor garante as regras de negócio de quem pode emitir)*.
4. Tratamento de Erros: Crie um `error_code` enum (ex: `Unauthorized`, `UniversityNotRegistered`).
5. Comentários: Todo o código Rust deve ser densamente comentado em Português do Brasil (PT-BR) explicando a segurança e as regras de negócio.

[EXEMPLO DE ESTRUTURA ESPERADA NO CÓDIGO]

```rust
use anchor_lang::prelude::*;

declare_id!("InsiraSeuProgramIdAqui...");

#[program]
pub mod educore_contracts {
    use super::*;
    // Implementar initialize_registry
    // Implementar register_university
    // Implementar log_academic_event (com verificação de autorização)
}

// ... Definição das structs #[derive(Accounts)], #[account], #[event] e #[error_code]
