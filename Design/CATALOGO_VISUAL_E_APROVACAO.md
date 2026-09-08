# 🛡️ Catálogo Visual & Protocolo de Aprovação — LattesChain (v1, v2, v3 & v4)

> **Status:** HOMOLOGADO E PUBLICADO NO SITE  
> **Ambiente:** Produção e Site Oficial (`/public/brand/` e `/Design/`)  
> **Garantia de Integridade:** Padrão v4 consolidado e ativo em `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/app/layout.tsx` e `public/`.

---

## 📁 Estrutura Consolidada de Versões

```
C:\Users\alexk\Desktop\LattesChain\Design\
├── BRAND_GUIDELINES.md                  # Manual completo de identidade visual e tokens
├── CATALOGO_VISUAL_E_APROVACAO.md       # Catálogo de curadoria e histórico de versões
│
├── vectors/                             # VERSÃO 1 (Original)
├── vectors/v2/                          # VERSÃO 2 (Intermediária)
├── vectors/v3/                          # VERSÃO 3 (Ajuste da bolinha)
│
├── vectors/v4/                          # VERSÃO 4 (PADRÃO TOTAL BASEADO NO FAVICON_V3)
│   ├── favicon_v4.svg                   # Padrão total e absoluto aprovado
│   ├── logo_icon_v4.svg                 # Ícone mestre 512x512 derivado diretamente do favicon_v3
│   ├── logo_horizontal_dark_v4.svg      # Logo Dark: Cordão do cap em BRANCO (#FFFFFF)
│   ├── logo_horizontal_light_v4.svg     # Logo Light: Cordão do cap em ESCURO (#0F172A)
│   └── logo_badge_soulbound_v4.svg      # Selo circular oficial baseado no ícone v4
│
├── images/                              # MÍDIA VERSÃO 1
├── images/v2/                           # MÍDIA VERSÃO 2
├── images/v3/                           # MÍDIA VERSÃO 3
│
└── images/v4/                           # MÍDIA VERSÃO 4 (PADRÃO TOTAL FAVICON)
    ├── lattes_logo_3d_v4.jpg            # Render 3D rigorosamente baseado no favicon_v3
    ├── lattes_hero_banner_v4.jpg        # Hero banner com placa monolítica espelhando a v4
    ├── lattes_linkedin_cover_v4.jpg     # Banner oficial LinkedIn alinhado ao padrão v4
    └── lattes_soulbound_badge_v4.jpg    # Medalhão 3D esculpido com o símbolo v4
```

---

## 🔬 Especificações do Padrão Total (v4)

1. **Geometria de Referência Absoluta (`favicon_v3.svg`):**
   - Moldura hexagonal com borda em gradiente Solana (`#9945FF` ➔ `#38BDF8` ➔ `#14F195`).
   - Capelo acadêmico superior (`polygon points="70,28 116,52 70,76 24,52"`).
   - Três barras de velocidade Solana paralelas (`#14F195`, `#38BDF8`, `#9945FF`).
   - Extremidade da linha suave do cordão descendo fluidamente até a bolinha única esmeralda (`#14F195`), sem molduras ou quadrados.
2. **Adaptação Cromática Conforme o Tema (Dark vs. Light):**
   - **Tema Escuro (`logo_horizontal_dark_v4.svg`):** O cordão do capelo é traçado em **Branco Puro (`#FFFFFF`)** para máximo contraste e legibilidade sobre fundo escuro (`#080C14` / `#101D32`).
   - **Tema Claro (`logo_horizontal_light_v4.svg`):** O cordão do capelo é traçado em **Ardósia Escura (`#0F172A`)** para nitidez e contraste ideal sobre fundo branco/claro (aplicações em certidões PDF/MEC e papel timbrado).

---

## 🗺️ Matriz de Deploy Final (Quando Aprovado)

| Asset Padrão (v4) | Formato | Aplicação no Sistema | Destino em Produção |
| :--- | :--- | :--- | :--- |
| `logo_horizontal_dark_v4.svg` | SVG | Header principal (Navbar) | `src/components/Navbar.tsx` |
| `logo_horizontal_light_v4.svg`| SVG | Certidões e RVDD em PDF (MEC) | `src/lib/pdf/reportTemplate.ts` |
| `logo_icon_v4.svg` | SVG | Ícone mobile e selos públicos | `public/logo_icon.svg` |
| `favicon_v4.svg` | SVG | Favicon da aplicação web | `src/app/icon.svg` |
| `lattes_hero_banner_v4.jpg` | JPG 8k (16:9) | Hero banner da Landing Page | `public/images/hero_banner.jpg` |
| `lattes_linkedin_cover_v4.jpg`| JPG 8k (16:9) | Divulgação corporativa LinkedIn | Redes Sociais / Mídia Externa |
| `lattes_logo_3d_v4.jpg` | JPG 8k (1:1) | Pitch Deck e Avatares | `public/images/brand_3d.jpg` |
| `lattes_soulbound_badge_v4.jpg`| JPG 8k (1:1) | Selo comemorativo no Passaporte | `src/app/student/page.tsx` |
