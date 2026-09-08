# 🎨 Staging de Design e Identidade Visual — LattesChain (v1 a v4)

---
status: Homologado_Producao
projeto: LattesChain
area: Design/Marketing
subject: Consolidacao_Identidade_Visual_v4
tipo: Documentacao_Mudanca
---

## 1. Descrição da Mudança
Consolidação da **Versão 4 (v4)** adotando o `favicon_v3.svg` como **padrão total e absoluto** para todos os elementos gráficos e vetores da marca LattesChain (EduCore Protocol).

### Especificações Técnicas da v4:
1. **Padrão Total Baseado no Favicon:**
   - Geometria do ícone rigorosamente unificada com proporção canônica: moldura hexagonal com gradiente Solana, capelo acadêmico, três barras de velocidade Solana e cordão suave finalizado em esfera esmeralda única sem quadrado.
2. **Contraste e Variação Cromática do Cordão do Capelo:**
   - **Versão Dark (`logo_horizontal_dark_v4.svg` e `logo_icon_v4.svg`):** Cordão do capelo em branco puro (`#FFFFFF`).
   - **Versão Light (`logo_horizontal_light_v4.svg`):** Cordão do capelo em ardósia escura (`#0F172A`) para contraste e legibilidade institucional em impressões e PDFs de diploma do MEC.
3. **Coleção de Mídia e Vetores v4:**
   - Vetores: `favicon_v4.svg`, `logo_icon_v4.svg`, `logo_horizontal_dark_v4.svg`, `logo_horizontal_light_v4.svg`, `logo_badge_soulbound_v4.svg`.
   - Imagens 8k: `lattes_logo_3d_v4.jpg`, `lattes_hero_banner_v4.jpg`, `lattes_linkedin_cover_v4.jpg`, `lattes_soulbound_badge_v4.jpg`.

---

## 2. Impacto no Sistema
- **Ativo em Produção:** Assets publicados em `public/brand/` e `public/favicon.svg` / `public/icon.svg`.
- **Interface Integrada:** Navbar (`Navbar.tsx`), Rodapé (`Footer.tsx`) e metadados (`layout.tsx`) consumindo os novos logotipos oficiais.
- **Rastreabilidade Total:** Todas as versões (`v1`, `v2`, `v3` e `v4`) estão preservadas e organizadas no diretório oficial `Design/`.

---

## 3. Instruções de Uso
- Os arquivos originais e masters encontram-se em `Design/vectors/` e `Design/images/`.
- No frontend, acesse diretamente via `/brand/logo_icon.svg`, `/brand/logo_horizontal_dark.svg` ou `/favicon.svg`.
