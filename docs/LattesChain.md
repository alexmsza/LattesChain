1. Validação da Dor e Fundamentação
Dor e Cenário Regulatório:
O mercado de Ensino a Distância (EAD) e a emissão de certificados extracurriculares no Brasil sofrem com um déficit estrutural de confiança. A facilidade de falsificação de documentos em PDF e a vulnerabilidade de bancos de dados centralizados de sistemas LMS (Learning Management Systems) fomentam a fraude acadêmica.

Fundamentação Legal: As Portarias MEC nº 330/2018 e nº 554/2019 estabelecem a obrigatoriedade do Diploma Digital, exigindo carimbo de tempo e assinatura ICP-Brasil. No entanto, o ciclo de vida acadêmico (provas, horas complementares) e certificados livres permanecem opacos.

Problema Estrutural: Sistemas EAD operam sob confiança unilateral (DBAs podem alterar registros sem rastro). Cursos externos (Udemy, Coursera) exigem chancela manual lenta pelas secretarias. Não há lastro criptográfico descentralizado que ateste a integridade cronológica.

Solução e Proposta de Valor (Modelo B2B SaaS):

Nome Comercial: LattesChain

Nome Técnico: EduCore Protocol (ECP)

Proposta de Valor: Plataforma B2B que atua como Trust Anchor (Cartório Central) unindo a validade jurídica governamental (ICP-Brasil) com a imutabilidade pública da Web3 (Solana).

Impacto no Mercado:

Universidades: Redução de custos com auditoria e emissão de 2ª via.

RH/Empresas: Verificação instantânea (Zero-Knowledge) de currículos sem necessidade de ofícios.

Alunos: Portabilidade vitalícia do dossiê acadêmico sem atrito técnico (Zero-Crypto-Knowledge).

1. Arquitetura e Engenharia do Sistema
Modelo de Identidade e Master Registry:
O sistema opera através de um Smart Contract Master. A plataforma LattesChain audita o CNPJ da Instituição de Ensino Superior (IES) e vincula oficialmente sua Pubkey Solana. Qualquer validador confirma a autenticidade cruzando a assinatura ICP-Brasil com a Pubkey autorizada no Master Registry.

Diagrama de Fluxo (End-to-End):

Emissão Interna (IES): O backend (Go Serverless) intercepta a emissão do LMS. Gera um hash SHA-256 do payload + PDF, assina com e-CNPJ (ICP-Brasil) da IES.

Registro On-Chain: A Vercel (Relayer) envia transação para a Solana. Atualiza o contrato Anchor, registra o hash assinado via SPL Memo Program e, se final (Diploma), emite um Soulbound Token (SBT) via Metaplex.

Cursos Externos (Inovação zkTLS): O aluno gera uma prova de conhecimento zero (zkProof) no seu navegador enquanto acessa um certificado na Coursera/Udemy. O protocolo submete essa prova à Solana, cunhando as horas complementares automaticamente, sem integração de API corporativa e sem expor senhas.

Consulta Pública: O RH faz upload do PDF na rota /validator. O frontend extrai o hash, consulta a RPC da Solana, verifica a assinatura Ed25519 e valida contra a chave ICP-Brasil, retornando o status em milissegundos.

UX e Account Abstraction (Wallet-as-a-Service):
O aluno não gerencia chaves criptográficas (Seed Phrases). A autenticação ocorre via Supabase Auth (E-mail/OAuth). O backend provisiona e gere uma carteira Solana invisível vinculada ao seu uuid de sessão.

Modelo Híbrido de Dados (LGPD):

Off-Chain (Supabase - PostgreSQL): Dados pessoais sensíveis (PII) nome, cpf, rg, arquivos_pdf. Total aderência ao Direito ao Esquecimento (exclusão limpa).

On-Chain (Solana): wallet_pubkey, hash(documento), timestamp, tx_signature. Dados irretrocedíveis que, isolados, não expõem a identidade do usuário.

Estrutura de Telas (Next.js App Router):

/admin-protocol: Master Registry SaaS. Gestão de CNPJs e vinculação de Pubkeys institucionais.

/university: Emissão em lote, integração de chaves locais, relatórios de emissão SPL Memo.

/student: Dashboard WaaS. Visualização de SBTs, timeline cronológica acadêmica, importador zkTLS e exportação de Carteira Acadêmica (QR Code).

/validator: Interface walletless e loginless para RHs. Drag & Drop de arquivos para validação criptográfica.

1. Especificação Técnica e Tecnologias
Frontend & Hosting: Next.js (React, Tailwind CSS) deployado na Vercel. Padrão visual institucional: Azul Marinho (#003366), Dourado (#D4AF37) e Branco.

Backend (Relayer/API): Go (Golang) operando como Serverless Functions no diretório /api da Vercel. Responsável pelo motor de hash, empacotamento ICP-Brasil e broadcast para RPC Solana.

Banco de Dados & Autenticação: Supabase. PostgreSQL para persistência Off-Chain com Row Level Security (RLS) e Supabase Auth para controle de sessão.

Smart Contracts (Solana): Rust via framework Anchor. Gerencia o Master Registry e regras de autorização de emissões.

Protocolos Auxiliares:

Metaplex (Core Standard): Emissão de Soulbound Tokens (Non-Transferable) para diplomas oficiais.

SPL Memo Program: Auditoria contínua de horas, aprovações modulares e histórico sem custo de mint de NFT.

Reclaim Protocol / zkTLS: Geração de provas de conhecimento zero sobre tráfego HTTPS (validação de cursos externos decentralizada).

1. Implementação de Código (Dependências Estruturais)
Lista Explícita de Dependências (Infraestrutura Atualizada):

Frontend (package.json): next, react, tailwindcss, @supabase/supabase-js, @solana/web3.js

Backend Serverless (go.mod):

[github.com/gagliardetto/solana-go](https://github.com/gagliardetto/solana-go) (Interação blockchain)

[github.com/supabase-community/supabase-go](https://github.com/supabase-community/supabase-go) (Cliente backend DB)

Smart Contracts (Cargo.toml): anchor-lang = "0.29.0", anchor-spl = "0.29.0"

Banco de Dados: PostgreSQL hospedado no Supabase com Migrations SQL nativas.
