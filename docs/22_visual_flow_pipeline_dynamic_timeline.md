# Pipeline de Dados e Fases de Integração — Fluxo Dinâmico e Timeline Automatizada

## 1. Descrição da Mudança
Refatoração da seção **Pipeline de Dados e Fases de Integração** (`VisualFlowPipeline.tsx`) na landing page do LattesChain, convertendo a representação visual de um diagrama estático para um **sistema dinâmico de fluxo contínuo** com animações de pulso, partículas de energia e rotação automatizada suave de etapas.

---

## 2. Componentes e Recursos Implementados

### 2.1 Linha de Fluxo Dinâmica & Partículas de Energia
- **Trilho Base & Preenchimento Reativo**: A linha horizontal agora conta com preenchimento gradual proporcional à etapa ativa (`width: ${((selectedStep - 1) / 4) * 100}%`).
- **Feixe Laser Contínuo (`flow-line-animated`)**: Gradiente animado em loop contínuo via CSS keyframes (`flow-travel`) percorrendo o percurso com largura de 200%.
- **Partículas de Transmissão (`flow-particle-1` e `flow-particle-2`)**: Elementos com blur e glow neon simulando pacotes de dados viajando ao longo da linha da esquerda para a direita.

### 2.2 Blocos do Ciclo de Vida Reativos
- **Estado Ativo**:
  - Anel pulsante (`step-active-pulse`), glow da cor do tema e elevação visual (`scale-[1.04]`).
  - **Micro-barra de Progresso Temporal**: Trilho animado no rodapé do bloco ativo indicando em tempo real o tempo restante antes da transição automática.
- **Estado Concluído**:
  - Etapas anteriores ao estágio atual recebem badge circular com checkmark indicando validação de fluxo concluída.
- **Setas Direcionais**: Indicadores sutis de direção (`ChevronRight`) entre os blocos.

### 2.3 Rotação Automatizada Suave (Auto-Play)
- **Ciclo Temporal Suave**: Rotação a cada 5.000 ms (5 segundos), avançando continuamente de 1 a 5 e retornando a 1.
- **Pausa Inteligente no Hover**: Ao posicionar o cursor sobre o container do pipeline, a rotação pausa automaticamente para possibilitar leitura atenta, retomando ao sair.
- **Controle Manual**:
  - Botão de Play/Pause integrado no cabeçalho com feedback visual de estado.
  - Botões de navegação anterior/próximo (`<` e `>`) para consulta sob demanda.
  - Seleção direta por clique em qualquer bloco com reinício suave do temporizador.
- **Transição Suave no Card de Detalhes**: Renderização com keyframes de entrada (`animate-in fade-in slide-in-from-right-3`) evitando cortes secos.

### 2.4 Compatibilidade Cromática com o Theme Switcher
- Todas as linhas, partículas, botões e barras de progresso herdam dinamicamente as variáveis de cor ativas do tema (**Solana Emerald** vs **Elementus Purple**).

---

## 3. Instruções de Uso
1. Acesse a landing page (`/`) e role até a seção **Pipeline de Dados e Fases de Integração**.
2. Observe a passagem automática suave a cada 5 segundos ou passe o mouse sobre o componente para pausar a rotação.
3. Utilize os botões de navegação manual ou clique diretamente nos blocos para inspecionar cada fase.
4. Clique no botão de paleta cromática no Navbar para alternar o tema e verificar a adaptação imediata das cores do feixe de fluxo.
