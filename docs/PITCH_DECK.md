# LattesChain — Roteiro de Pitch (5 Minutos) 🎙️

> **Desafio**: Hackathon Universitário Superteam Brasil (Superteam Earn)  
> **Duração máxima do vídeo**: 05:00 minutos (1 minuto por bloco temático)  
> **Apresentador Interativo Web**: Disponível em [`/pitch`](http://localhost:3000/pitch) com modo apresentação, teclado interativo, cronômetro e notas do orador.  
> **Formato de entrega**: Vídeo de tela/slides com voz (YouTube não listado / Loom / Drive aberto)  
> **Idioma**: Português (Legendas em inglês recomendadas como diferencial)

---

## ⏱️ Minutagem e Estrutura dos 5 Blocos

| Tempo | Bloco | Objetivo Principal | Métricas & Fontes | Slide Web |
| :---: | :--- | :--- | :--- | :---: |
| **00:00 - 01:00** | **1. O Problema & Quem Sofre** | Dor real: burocracia de PDFs/papel, lentidão crônica e fraudes educacionais | UNESCO (6M+ alunos travados), HireRight Benchmark | [Slide 2](/pitch) |
| **01:00 - 02:00** | **2. A Solução em Linguagem Simples** | Passaporte Acadêmico Soberano, carteira do aluno e validação &lt;1s | W3C Verifiable Credentials Data Model v2.0 | [Slide 3](/pitch) |
| **02:00 - 03:00** | **3. Por que Solana** | SAS nativo, Token-2022 Soulbound revogável, custo sub-centavo (&lt; R$0,01) e LGPD | Solana Labs SAS, SPL Token-2022 Extensions | [Slide 4](/pitch) |
| **03:00 - 04:00** | **4. Na Prática (Demo & IA)** | Emissão em 2s, Passaporte com QR Code, Validador instantâneo e Motor Gemini 1.5 Pro | Demo funcional /validator, /student, /university | [Slide 5](/pitch) |
| **04:00 - 05:00** | **5. Time, Stack & Roadmap** | Jovian Tech, stack MVP 100% open-source custo zero e expansão ECTS / Mainnet | EHEA Bologna Process & ECTS Users' Guide | [Slide 6](/pitch) |

---

## 🎬 Script de Apresentação (Fala Guiada de 5 Minutos)

### [00:00 - 01:00] Bloco 1: O Problema, Quem Sofre e Evidências Concretas
*(Slide 2 no app `/pitch`: Burocracia Paralisante & Fraudes)*

> **Narrador**:  
> "Hoje, validar diplomas e históricos escolares ainda depende de PDFs comuns e papéis carimbados — fáceis de forjar com qualquer ferramenta simples de edição.
> 
> Quem sofre diretamente com isso?  
> 1. **Os Estudantes**, que perdem prazos de intercâmbio, bolsas e vagas no exterior por semanas de espera burocrática e custos consulares.  
> 2. **As Secretarias Acadêmicas**, sobrecarregadas com validações manuais via e-mail e telefone, gastando até 30% da sua jornada de trabalho.  
> 3. **Os RHs e Universidades Estrangeiras**, que gastam tempo e dinheiro valiosos auditando históricos escolares.  
> 
> E como nós sabemos disso? De acordo com a **UNESCO**, a falta de padronização e a lentidão na validação de títulos são os maiores entraves para a mobilidade de mais de **6 milhões de estudantes transfronteiriços**. No mercado corporativo, os dados do **HireRight Global Benchmark Report** confirmam que adulterações educacionais lideram as inconsistências detectadas em triagens de candidatos em todo o mundo."

**Fontes Consultáveis**:
- **UNESCO**: *Global Convention on the Recognition of Qualifications* ([unesco.org](https://unesco.org))
- **HireRight**: *Global Employment Screening Benchmark Report* ([hireright.com](https://hireright.com))

---

### [01:00 - 02:00] Bloco 2: A Solução em Linguagem Simples
*(Slide 3 no app `/pitch`: O Passaporte Acadêmico Soberano)*

> **Narrador**:  
> "Apresentamos o **LattesChain**: um passaporte acadêmico digital e global hospedado na **Solana**.
> 
> O funcionamento é simples e direto:  
> 1. A universidade emite a credencial oficial assinada criptograficamente direto para a carteira digital do estudante.  
> 2. O aluno é o dono soberano do seu histórico: cada disciplina, extensão e diploma fica sob sua custódia pessoal.  
> 3. Para comprovar suas qualificações, o estudante compartilha apenas um link ou QR Code com qualquer recrutador ou universidade estrangeira.  
> 4. A validação ocorre em menos de 1 segundo direto na rede pública, eliminando intermediários, cartórios e carimbos físicos.  
> 
> Esse modelo segue rigorosamente o padrão internacional **W3C Verifiable Credentials Data Model v2.0**, permitindo que as credenciais sejam provadas matematicamente sem depender de servidores centrais da faculdade de origem."

**Fontes Consultáveis**:
- **W3C**: *Verifiable Credentials Data Model v2.0* ([w3.org/TR/vc-data-model-2.0](https://www.w3.org/TR/vc-data-model-2.0/))

---

### [02:00 - 03:00] Bloco 3: Por que Solana? O que só ela resolve
*(Slide 4 no app `/pitch`: Primitivas Nativas da Solana)*

> **Narrador**:  
> "Por que a Solana é indispensável nessa solução e o que a blockchain resolve aqui que outra tecnologia não resolveria?
> 
> Nós não criamos contratos mirabolantes e frágeis; usamos as primitivas nativas e consolidadas da Solana:
> 
> 1. **Solana Attestation Service (SAS)**: O padrão oficial de credenciais verificáveis da rede, garantindo interoperabilidade nativa com serviços globais de identidade como Civic e Solana ID.  
> 2. **Token-2022 (NonTransferable)**: O certificado nasce como um Soulbound Token que cola na carteira do aluno, impedindo que o título seja vendido ou transferido para terceiros.  
> 3. **PermanentDelegate**: Recurso nativo que permite à instituição emissora revogar o título on-chain em caso de fraude administrativa comprovada ou cancelamento judicial.  
> 4. **Custo Sub-Centavo (< R$ 0,01)**: Permite emitir centenas de milhares de matérias e certificados por frações de centavos de real — algo economicamente inviável no Ethereum ou Bitcoin.  
> 5. **Privacidade por Design (LGPD/GDPR)**: Nenhum dado pessoal sensível como CPF ou nome vai para a blockchain; apenas o hash criptográfico SHA-256 do documento canônico é ancorado on-chain."

**Fontes Consultáveis**:
- **Solana Labs**: *Solana Attestation Service Architecture* ([docs.solanalabs.com](https://docs.solanalabs.com))
- **SPL Docs**: *Token-2022 Extensions: NonTransferable & PermanentDelegate* ([spl.solana.com/token-2022/extensions](https://spl.solana.com/token-2022/extensions))

---

### [03:00 - 04:00] Bloco 4: Na Prática (Demo & Camada de IA)
*(Slide 5 no app `/pitch`: O Fluxo Tripartite em Ação & Motor Gemini 1.5 Pro)*

> **Narrador**:  
> "Vejamos isso funcionando na prática na nossa plataforma:
> 
> 1. **Emissão (/university)**: A universidade insere os dados curriculares com metadados do MEC, assina a transação na devnet da Solana via SAS e o token intransferível chega à carteira do aluno em apenas 2 segundos.  
> 2. **Custódia (/student)**: O estudante visualiza seus certificados na interface com a barra de horas complementares e gera um link ou QR Code instantâneo.  
> 3. **Validação Instantânea (/validator)**: O recrutador acessa o link, arrasta o PDF ou clica nos nossos botões de test drive, e a assinatura pública da universidade é auditada on-chain em menos de 400 milissegundos.  
> 4. **Camada de IA Curricular (Gemini 1.5 Pro)**: Em paralelo, nossa IA analisa as ementas e gera um **Trust Report** estruturado em linguagem natural, além de calcular a **equivalência curricular** automática entre as grades da instituição de origem e a de destino."

**Fontes Consultáveis**:
- **Demonstração Funcional On-Chain**: [`/validator`](/validator) (Com 4 presets de teste em 1 clique)
- **Repositório Oficial**: [github.com/alexmsza/LattesChain](https://github.com/alexmsza/LattesChain)

---

### [04:00 - 05:00] Bloco 5: Time, Stack MVP & Próximos Passos
*(Slide 6 no app `/pitch`: Execução Focada & Escalabilidade Global)*

> **Narrador**:  
> "Quem está por trás do LattesChain?
> 
> Nosso time é composto por **Alex Miqueias** e **Rogério Alencar Filho**, incubado pela **Jovian Tech**, combinando especializações em Engenharia de Dados, Segurança de Infraestrutura (DevSecOps), Inteligência Artificial e Arquitetura Distribuída Solana.
> 
> Toda a nossa **stack do MVP é 100% open-source com custo zero de infraestrutura**: Go ultraleve, Python com IA, Supabase (PostgreSQL + RLS) e SDKs Solana.
> 
> Nosso roadmap de execução possui 3 passos claros:  
> 1. **Piloto Beachhead**: Focado na emissão de horas complementares e certificados de extensão com Diretórios e Centros Acadêmicos parceiros (sem amarras regulatórias).  
> 2. **Expansão Internacional de IA**: Calibração dos modelos de IA para mapeamento de equivalência curricular nos padrões do **Processo de Bolonha (ECTS - Europa)** e universidades dos Estados Unidos.  
> 3. **Mainnet & Integração com ERPs**: Deploy na Solana Mainnet com State Compression e integração via API REST direta aos sistemas legados (TOTVS RM, Lyceum) e plataformas de RH (Gupy).
> 
> LattesChain: a soberania educacional na velocidade da Solana!"

**Fontes Consultáveis**:
- **European Higher Education Area (EHEA)**: *Bologna Process & ECTS Users' Guide* ([ehea.info](https://ehea.info))
- **Jovian Tech Venture Builder**: [jovian.foo](https://jovian.foo)

---

## 🖥️ Como Utilizar a Apresentação Web (`/pitch`)

Acesse [`http://localhost:3000/pitch`](/pitch) no navegador:
- **Setas `←` e `→` ou Barra de Espaço**: Avançar e retroceder slides.
- **Tecla `N`**: Abrir/fechar gaveta de Notas do Orador com o roteiro falado palavra por palavra.
- **Tecla `T`**: Iniciar/pausar o cronômetro oficial de 5 minutos.
- **Tecla `R`**: Reiniciar o cronômetro para zero.
- **Tecla `F`**: Alternar para o modo Tela Cheia (Fullscreen).
- **Teclas `1` a `6`**: Pular diretamente para qualquer um dos 6 slides.
