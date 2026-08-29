# EduCore Protocol — Especificação de Frontend (Next.js)

> Diretório alvo: `src/` (App Router). **Estado atual: não implementado** (nenhum arquivo em `src/`).
> Este documento é a spec de implementação (rotas, auth matrix, fluxos, integração com API Go).

## 1. Arquitetura de Telas

- **Framework**: Next.js 14+ (App Router, Server Components)
- **Design System**: Tailwind CSS
- **Paleta institucional**:
  - Primária: Azul Marinho (`#003366`)
  - Acento: Dourado (`#D4AF37`)
  - Neutros: Branco (`#FFFFFF`), Cinza Escuro (`#0F172A`)
- **Princípio UX**: **zero termos técnicos** na visão do aluno e do RH — nenhuma menção a wallet, seed, tx, SOL (Account Abstraction percebida, não explicada).

## 2. Mapeamento de Rotas

| Rota | Público | Funcionalidades |
| :--- | :--- | :--- |
| `/` | Público | Landing: proposta de valor, estatísticas, acesso rápido ao validador |
| `/validator` | Público | **Dropzone de PDF** → `POST /api/verify/pdf` (multipart) — o frontend **NÃO computa hash** (ADR-005); alternativa: busca por `tx_signature` |
| `/admin-protocol` | Super Admin | Master Registry: listar/vincular CNPJ↔Pubkey, ativar/suspender IES, pause global, rotação de authority |
| `/university` | IES (emissor) | Emissão individual + lote (batch ≤10), histórico de emissões, status de tx, gestão de alunos |
| `/student` | Aluno (custodial) | Total de horas complementares, timeline de certificados, SBTs (diplomas), export QR Code |
| `/student/export` | Aluno | "Graduação para self-custody": exportar chave privada derivada (fluxo sensível — ver §6) |

## 3. Matriz de Autenticação (Auth Matrix)

Supabase Auth (e-mail/OAuth) + **custom claims no JWT** via `custom_access_token_hook`:

| Claim | Valores | Fonte |
| :--- | :--- | :--- |
| `role` | `super_admin` \| `institution` \| `student` | tabela `user_roles` (a criar — `docs/02_data_models.md` §1.1) |
| `wallet_address` | pubkey Solana (IES) | `institutions.solana_pubkey` vinculada ao user |
| `student_id` | UUID do aluno | `students.id = auth.uid()` |

| Rota | Gate | Backend correspondente |
| :--- | :--- | :--- |
| `/` , `/validator` | público (anon) | `POST /api/verify/pdf` (público + rate limit) |
| `/admin-protocol` | `role = super_admin` | rotas admin (a criar no Go; hoje via dashboard Supabase direto) |
| `/university` | `role = institution` + `wallet_address` registrada on-chain | `POST /api/issue_certificate`, `GET /api/institutions/:id/records` |
| `/student` | `role = student` | `GET /api/students/:id/records`, `GET /api/students/:id/assets` |

**Estado atual do backend**: os endpoints Go não validam JWT (ver `docs/04_backend_relayer_go.md` §5). A matriz acima é o **alvo**; até lá, `src/` não deve chamar rotas restritas sem gateway.

## 4. Fluxos de Usuário (User Flows)

### 4.1 Emissão (IES) — `/university/issue`
```
Login IES (Supabase Auth) → seleciona/cria aluno (CPF + nome + e-mail)
  → preenche: tipo (HORAS_COMPLEMENTARES | CERTIFICADO_CURSO | DIPLOMA),
              curso, carga horária, data
  → anexa PDF oficial (opcional no MVP; alvo: obrigatório)
  → POST /api/issue_certificate
  → sucesso: tela "Certificado registrado" (hash + link Solana Explorer + QR)
  → duplicado: 409 → aviso "documento já emitido" + link da emissão original
  → falha: mensagem humanizada + retry
```

### 4.2 Validação (RH) — `/validator`
```
RH arrasta PDF → POST /api/verify/pdf (multipart, campo "document")
  → VÁLIDO: selo verde "Documento autêntico" + IES + tipo + data + tx + QR de compartilhamento
  → INVÁLIDO: selo vermelho "não consta no registro" (sem expor dados de terceiros)
  → alternativa: colar tx_signature → mesmo resultado
```

### 4.3 Meus certificados (Aluno) — `/student`
```
Login aluno → timeline (issued_at desc) com horas somadas (student_academic_summary)
  → cada card: curso, IES, horas, status on-chain, QR (deep link /validator?tx=...)
  → diplomas renderizados como SBT (via GET /api/students/:id/assets — DAS API)
```

### 4.4 QR Code (export) — `/student`
Payload do QR: **deep link** `https://<app>/validator?tx=<solana_tx_signature>&hash=<document_hash>` — o validador resolve por tx (canônico) ou hash. Nunca embutir PII no QR.

## 5. Integração Técnica

- **API Go**: base URL via `NEXT_PUBLIC_API_URL` (ex.: `https://educore-relayer.fly.dev`). Client: fetch nativo + Server Components para leituras do aluno.
- **Supabase JS**: auth (login/refresh) + leituras diretas permitidas por RLS (student vê os próprios records; institution vê os emitidos). Escritas sempre via backend Go (service role).
- **Solana**: o frontend **não** fala com a blockchain diretamente — toda leitura passa pela API Go (DAS/Helius) ou Supabase. Isso mantém o app server-first e evita expor RPC keys.
- **Rate limit do validador**: feedback amigável em 429 ("muitas verificações, tente em instantes").

## 6. Graduação para Self-Custody (Fase 2)

O aluno dono de carteira custodial deve poder sair sem perder SBTs:
1. `/student/export` com verificação forte (re-auth + e-mail OTP + período de espera 24h).
2. Backend deriva a chave do aluno (Vault seed) → **exibe seed/privkey uma única vez** OU gera nova wallet e queima/reemite SBT (Metaplex Core burn + re-mint) — decisão em ADR futuro.
3. Pós-export: wallet marcada `exported`, derivada não é mais usada para novos mints (evita chave órfã assinando transações).
4. Risco documentado em `docs/09_threat_model.md` §8 (account takeover do aluno).
