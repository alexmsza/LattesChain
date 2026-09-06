# Sistema Dinâmico de Temas de Cores — Elementus Purple & Solana Emerald

## 1. Descrição da Mudança
Implementação de arquitetura de alternância dinâmica de temas cromáticos (Theme Switcher) entre a paleta padrão (**Solana Emerald / Deep Navy**) e a paleta **Elementus Purple System**, extraída fielmente dos commits `01adc1c` e `eaebb18` da branch `design/elementus-purple-system`.

A implementação cumpre o requisito de **isolamento estrito**: apenas tokens de cores (fundos, cartões, superfícies navy, bordas, glows e acentos) foram parametrizados, preservando integralmente todos os elementos, textos, cards, formulários, rotas e recursos do LattesChain.

---

## 2. Especificação Cromática dos Temas

| Token | Tema Padrão (Solana Emerald) | Elementus Purple System |
| :--- | :--- | :--- |
| **`--background`** | `#080c14` | `#0e0a18` (Purple-black ink) |
| **`--card-bg`** | `rgba(16, 29, 50, 0.6)` | `rgba(27, 21, 44, 0.6)` |
| **`--card-border-hover`** | `rgba(20, 241, 149, 0.3)` | `rgba(138, 51, 245, 0.35)` |
| **`--header-bg`** | `rgba(8, 12, 20, 0.9)` | `rgba(14, 10, 24, 0.9)` |
| **`--navy-900`** | `11 19 32` (`#0b1320`) | `14 10 24` (`#0e0a18`) |
| **`--navy-800`** | `16 29 50` (`#101d32`) | `27 21 44` (`#1b152c`) |
| **`--navy-700`** | `22 39 68` (`#162744`) | `36 28 56` (`#241c38`) |
| **`--navy-600`** | `30 54 93` (`#1e365d`) | `52 39 80` (`#342750`) |
| **`--solana-purple`** | `153 69 255` (`#9945FF`) | `138 51 245` (`#8a33f5`) |
| **`--solana-purple-soft`**| `196 137 255` (`#c489ff`) | `209 171 249` (`#d1abf9`) |
| **`--solana-purple-deep`**| `125 38 217` (`#7d26d9`) | `107 33 217` (`#6b21d9`) |
| **`--primary`** | `#14F195` (Solana Green) | `#8a33f5` (Elementus Purple) |
| **Glow Primário** | `glow-green` (`rgba(20, 241, 149, 0.25)`) | `glow-purple` (`rgba(138, 51, 245, 0.3)`) |

---

## 3. Arquitetura Técnica

### 3.1. Suporte a Opacidade no Tailwind CSS
Para garantir que classes com opacidade (como `bg-navy-900/80` ou `border-solana-purple/30`) funcionem perfeitamente em ambos os temas, os valores das cores são declarados em canais RGB separados por espaço (`r g b`) em `globals.css` e consumidos no `tailwind.config.ts`:
```ts
navy: {
  900: "rgb(var(--navy-900) / <alpha-value>)",
  800: "rgb(var(--navy-800) / <alpha-value>)",
  // ...
}
```

### 3.2. Gerenciamento de Estado (`ThemeContext`)
Localizado em `src/lib/theme/ThemeContext.tsx`:
- Estado tipado: `"default" | "purple"`.
- Atributo raiz no DOM: `document.documentElement.setAttribute("data-theme", theme)`.
- Classe utilitária condicional: `theme-purple`.
- Persistência no `localStorage` sob a chave `educore_theme`.

### 3.3. Controle no Navbar
Localizado em `src/components/Navbar.tsx`:
- Botão interativo com ícone `Palette` e indicador circular da cor ativa (`#14F195` vs `#8a33f5`).
- Rótulos e tooltips multilíngues (PT, EN, ES).

---

## 4. Instruções de Uso
1. Clique no botão de paleta cromática no Navbar (ao lado do seletor de idiomas).
2. A aplicação transiciona suavemente entre o tema clássico **Solana Emerald** e o **Elementus Purple**.
3. A preferência é memorizada para acessos subsequentes.
