# Modo Gravação & Teleprompter em Janela Separada (Dual-Screen Pitch)

## 1. Visão Geral e Objetivo
O módulo de apresentação do **LattesChain Pitch Deck** (`/pitch`) agora suporta **Separação de Janela (Pop-out)** e **Modo Gravação Limpo (Clean View 16:9)**.
Isso permite ao apresentador gravar o pitch (via OBS Studio, Loom, QuickTime ou gravação de janela) capturando estritamente os slides limpos e profissionais na tela principal, enquanto o script guiado palavra-por-palavra, dicas de oratória, pontos-chave da banca e cronômetro de 5 minutos rodam sincronizados em uma 2ª janela externa independente.

---

## 2. Arquitetura de Sincronização em Tempo Real
A comunicação entre a janela principal de apresentação (`/pitch`) e a janela do orador (`/pitch/speaker`) utiliza a API nativa **`BroadcastChannel`** (`lattes_pitch_sync`), com fallback automático via **`localStorage`** (`lattes_pitch_font_size` e `lattes_pitch_sync`):

```mermaid
sequenceDiagram
    participant P as Pitch Deck (/pitch)
    participant BC as BroadcastChannel ("lattes_pitch_sync")
    participant S as Teleprompter Orador (/pitch/speaker)

    Note over P: Usuário clica em "Separar Notas"<br/>ou pressiona tecla 'O'
    P->>S: window.open('/pitch/speaker')
    P->>P: setShowNotes(false) [Limpa tela de gravação]
    S->>BC: REQUEST_STATE
    BC->>P: REQUEST_STATE
    P->>BC: SYNC_SLIDE, SYNC_TIMER, SYNC_FONT_SIZE
    BC->>S: Atualiza Slide, Timer e Tamanho da Fonte

    Note over P,S: Transição de slides, cronômetro e tamanho da fonte sincronizados bidirecionalmente
    S->>BC: SYNC_SLIDE (Avançar/Voltar) / SYNC_FONT_SIZE (+/-)
    BC->>P: Atualiza slide e escala tipográfica em ambas as telas
```

---

## 3. Atalhos de Teclado Suportados

| Atalho | Ação | Descrição |
| :--- | :--- | :--- |
| `+` ou `=` | **Aumentar Fonte das Notas** | Eleva a escala tipográfica das notas/teleprompter (`SM` ➔ `2XL`) |
| `-` ou `_` | **Diminuir Fonte das Notas** | Reduz a escala tipográfica das notas/teleprompter (`2XL` ➔ `SM`) |
| `O` | **Separar Notas (Janela Pop-out)** | Abre `/pitch/speaker` em janela popup e oculta notas da tela principal |
| `G` | **Modo Gravação (Clean View)** | Oculta cabeçalho, barra de progresso e bordas; foca no slide 16:9 |
| `N` | **Notas Embutidas** | Alterna exibição das notas na parte inferior da própria página |
| `F` | **Tela Cheia** | Ativa/desativa Fullscreen nativo da apresentação |
| `Space` / `→` / `PgDn` | **Próximo Slide** | Avança slide e propaga evento em tempo real via BroadcastChannel |
| `Backspace` / `←` / `PgUp` | **Slide Anterior** | Retorna slide e sincroniza janelas |
| `T` | **Play/Pause Cronômetro** | Inicia ou pausa o timer de 5 minutos em ambas as telas |
| `R` | **Zerar Cronômetro** | Reinicia a contagem do cronômetro sincronizadamente |
| `1` a `6` | **Pular para Slide 1-6** | Navegação rápida direta para os tópicos do pitch |

---

## 4. Níveis de Escala Tipográfica Suportados

Ambas as telas compartilham 5 níveis calibrados para legibilidade em monitores de qualquer distância e resolução:

| Nível | Identificador | Indicador Visual | Aplicação Recomendada |
| :---: | :---: | :---: | :--- |
| **Pequeno** | `sm` | `A- (SM)` | Telas pequenas, notebooks 13" ou visão próxima |
| **Médio (Padrão)** | `md` | `A (MD)` | Resolução padrão 1080p e leitura balanceada |
| **Grande** | `lg` | `A+ (LG)` | Monitores 2K/4K ou maior facilidade de escaneamento visual |
| **Extra Grande** | `xl` | `A++ (XL)` | Uso como teleprompter a meia distância (1,5m) |
| **Teleprompter Pro** | `2xl` | `A+++ (2XL)` | Leitura dinâmica a longa distância ou gravação em pé |

---

## 5. Instruções de Uso para Gravação

1. Acesse `http://localhost:3000/pitch`.
2. Clique no botão **"Separar Notas (Janela Pop-out)"** (ou pressione a tecla `O`).
3. Uma nova janela com o **Teleprompter do Orador** será aberta:
   - Arraste esta janela para o seu segundo monitor ou para a metade lateral do seu display.
   - Ajuste o tamanho da fonte clicando nos botões `A-` / `A+` no topo ou no card do script, ou use as teclas `+` e `-`. A alteração sincroniza instantaneamente com o drawer da tela principal e fica salva no navegador.
4. Na janela principal, ative o **"Modo Gravação"** (ou pressione a tecla `G` / `F` para tela cheia):
   - A tela exibirá apenas o slide em alta definição 16:9 sem poluição visual.
5. No software de gravação (ex: OBS Studio ou Loom):
   - Selecione para capturar exclusivamente a janela do **Pitch Deck Principal**.
6. Use o teclado (`Espaço`, `→`) na janela do orador ou na janela principal: ambas avançam juntas instantaneamente.

