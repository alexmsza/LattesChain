[ESPECIFICAÇÃO DO BACKEND SERVERLESS EM GO]
Desenvolva a API no diretório `/api/issue_certificate.go`, otimizada para rodar como Vercel Serverless Function. A API atuará como motor criptográfico e Relayer para a rede Solana.

Requisitos de Implementação:

1. Setup e Handler HTTP:
   - Rota: `POST /api/issue_certificate`.
   - Parse do payload JSON de entrada: `student_id`, `institution_id`, `document_metadata`.
2. Motor de Criptografia Off-Chain:
   - Implemente `GenerateDocumentHash(payload []byte)` para computar o SHA-256 do documento (integridade).
   - Implemente `MockICPBrasilSignature(hash string)` simulando a assinatura com chave privada local, representando o e-CNPJ da instituição.
3. Integração On-Chain (Solana Relayer):
   - Utilize a biblioteca `github.com/gagliardetto/solana-go`.
   - Crie a função `LogToSolanaMemo(hash string, icpSig string)`.
   - Monte uma instrução utilizando o SPL Memo Program (Program ID: `Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo`).
   - O payload do Memo deve ser um JSON serializado: `{"h":"<hash>", "sig":"<icp_sig>"}`.
   - Assine a transação usando uma Private Key mockada no backend e faça o broadcast para a rede (Devnet).
4. Persistência (Supabase):
   - Realize o `INSERT` na tabela `academic_records` contendo `student_id`, `institution_id`, `document_hash`, `icp_brasil_signature` e `solana_tx_signature`.

[INSTRUÇÃO AO AGENTE]
Escreva o arquivo `issue_certificate.go` completo. Utilize comentários técnicos em PT-BR focados na arquitetura de rede e tratamento de concorrência. Após gerar o código, retorne exclusivamente: "Backend Go Serverless gerado com sucesso." para seguirmos ao Frontend.
