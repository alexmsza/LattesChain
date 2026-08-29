# EduCore Protocol — Especificação de Frontend (Next.js)

## 1. Arquitetura de Telas

- **Framework**: Next.js 14+ (App Router)
- **Design System**: Tailwind CSS
- **Paleta de Cores**:
  - Primária: Azul Marinho (`#003366` / `bg-slate-900` / `bg-[#003366]`)
  - Acento: Dourado (`#D4AF37` / `text-amber-500` / `border-[#D4AF37]`)
  - Neutros: Branco (`#FFFFFF`), Cinza Escuro (`#0F172A`)

## 2. Mapeamento de Rotas

| Rota | Público | Funcionalidades |
| :--- | :--- | :--- |
| `/` | Público Geral | Landing page com proposta de valor, estatísticas e acessos rápidos. |
| `/admin-protocol` | Super Admin | Master Registry: listagem e vinculação de CNPJs a Pubkeys Solana. |
| `/university` | IES (Emissor) | Formulário de emissão de certificado/horas, upload em lote, histórico e status de tx. |
| `/student` | Aluno (WaaS) | Visualização de horas acumuladas, timeline cronológica de certificados e exportação de QR Code. |
| `/validator` | RH / Público | Dropzone de PDF ou busca por `Tx Signature`, verificação instantânea On-Chain (Válido / Fraude). |
