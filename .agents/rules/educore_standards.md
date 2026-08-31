# Diretrizes Técnicas do Projeto LattesChain (EduCore Protocol)

> Documentação de referência: `docs/00_index.md`, `README.md`, `docs/PITCH_DECK.md` e `docs/BUSINESS_PLAN.md`.
> Este arquivo define as regras e restrições obrigatórias para o desenvolvimento do projeto.

---

## 1. Regras de Arquitetura e Monorepo
- **Estrutura do Projeto**:
  - `src/`: Aplicação Frontend Next.js 14+ (App Router), hospedada na **Vercel**. UI moderna com Tailwind CSS e Lucide Icons.
  - `sas/`: Pipeline executável do **Solana Attestation Service (SAS)** em Python 3.10+ (programa nativo `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` + Token-2022).
  - `ai/`: Camada de IA (Equivalência Curricular & Trust Report para RH) com suporte multi-provedor via `ai/llm_client.py` (Ollama, Groq, Gemini, Anthropic ou fallback offline).
  - `api/`: Relayer REST API em Go (Golang) — ultraleve, consumo <20MB RAM.
  - `supabase/`: Migrações SQL (tabelas, índices, storage e políticas RLS de segurança).
  - `docs/`: Documentação técnica centralizada, ADRs, Pitch Deck e Business Plan.

---

## 2. Padrões de Código, Segurança e LGPD
- **LGPD por Design**: Proibido enviar qualquer PII (Nome, CPF, E-mail) para a blockchain. On-chain trafegam apenas hashes SHA-256 do documento canônico, pubkeys e atestações SAS.
- **Solana Attestation Service (SAS) & Token-2022**:
  - Utilizar a primitiva oficial do SAS para Schemas e Atestações.
  - Diplomas e certificados tokenizados utilizam extensões Token-2022:
    - `NonTransferable`: Impede a transferência/venda da credencial (Soulbound).
    - `PermanentDelegate`: Permite que a instituição revogue a atestação on-chain em caso de fraude.
- **Supabase (Auth, DB & Storage)**:
  - Autenticação JWT via Supabase Auth.
  - RLS (Row Level Security) obrigatório em 100% das tabelas.
  - Armazenamento de PDFs e ementas no Supabase Storage com controle de acesso granular.
- **Frontend Next.js (Vercel)**:
  - Design premium e moderno: dark mode nativo, glassmorphism, micro-animações, layout responsivo.
  - Zero fricção Web3: abstração de conceitos técnicos para o estudante e recrutador.
- **Dependências e Ambientes**:
  - Python: Uso mandatório de `uv` (`.venv/`, lock e sync).
  - Node.js: `npm` com dependências congeladas em `package-lock.json`.

---

## 3. Definição de Pronto (Definition of Done)
- **Frontend**: Build limpo (`npm run build`) sem erros de TypeScript e responsividade testada.
- **SAS / Solana**: Pipeline executável ponta a ponta (`00` a `06`) em Solana Devnet sem erros.
- **IA**: Execução resiliente de `trust_report.py` e `equivalence_check.py` com ou sem chaves de API externas.
- **Documentação**: Toda alteração de código ou schema deve refletir no `README.md` e em `docs/`.

