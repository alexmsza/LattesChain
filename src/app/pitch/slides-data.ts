export interface SlideCitation {
  name: string;
  url: string;
  note: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
}

export interface SlideData {
  id: number;
  timeRange: string;
  badge: string;
  title: string;
  subtitle: string;
  category: string;
  speakerScript: string;
  keyObjective: string;
  citations: SlideCitation[];
  deliveryTip: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Alex Miqueias",
    role: "Lead Architect",
    description: "Arquitetura Web3, Smart Contracts Solana Token-2022/SAS e Governança On-Chain.",
  },
  {
    name: "Rogerio Alencar Filho",
    role: "Software Engineer",
    description: "Engenharia de Dados, Backend Go/Python, DevSecOps e Integrações Corporativas.",
  },
  {
    name: "Caio Vila Nova",
    role: "Systems & Operations",
    description: "Application Support, Automation & Data Workflows.",
  },
];

export const SLIDES_DATA: SlideData[] = [
  {
    id: 0,
    timeRange: "00:00 - 00:30",
    badge: "Superteam Brasil • Hackathon Universitário 2026",
    category: "Abertura & Visão Geral",
    title: "LattesChain",
    subtitle: "Passaporte Acadêmico Global Descentralizado e Soberano na Solana",
    keyObjective: "Apresentar a JOVIAN TECH e posicionar o LattesChain como a ponte de confiança universal entre faculdades, estudantes e empresas.",
    speakerScript:
      "Banca examinadora e comunidade Superteam Brasil: nós somos a JOVIAN TECH e apresentamos o LattesChain. Nascemos como a ponte de confiança universal que conecta faculdades, estudantes e empresas sobre a rede Solana. Transformamos a credibilidade acadêmica em um ativo digital soberano, verificável instantaneamente em escala global, unindo a autoridade das instituições de ensino à agilidade do mercado de trabalho com tecnologia de ponta.",
    citations: [
      { name: "Superteam Earn", url: "https://superteam.fun/earn", note: "Hackathon Universitário Superteam Brasil" },
      { name: "JOVIAN TECH", url: "https://jovian.foo", note: "Ecossistema Corporativo Autônomo • DataSecAIOps" },
    ],
    deliveryTip: "Fale com energia, confiança e postura firme. Posicione o LattesChain logo de início como uma ponte integradora tripartite.",
  },
  {
    id: 1,
    timeRange: "00:30 - 01:30 (~1 min)",
    badge: "Bloco 1 • O Problema & Quem Sofre",
    category: "O Problema",
    title: "Burocracia Paralisante & Epidemia de Fraudes",
    subtitle: "Documentos em PDF e papel custam semanas de espera e bilhões em validações manuais",
    keyObjective: "Demonstrar o impacto humano e financeiro do abismo de comunicação nos 3 envolvidos, respaldado pelos dados corporativos da HireRight e relatórios internacionais da UNESCO e EHEA.",
    speakerScript:
      "O modelo tradicional de validação acadêmica opera sob um abismo de comunicação: documentos em papel ou PDFs editáveis custam semanas de espera, paralisam carreiras e expõem a reputação das próprias faculdades a fraudes. Como comprova o HireRight Global Employment Screening Benchmark Report, a discrepância e adulteração em históricos acadêmicos e diplomas é a inconsistência número um detectada em triagens corporativas em todo o mundo — com até 85% dos empregadores já tendo flagrado currículos ou diplomas forjados. Na ponta dos estudantes, a UNESCO alerta que mais de 6 milhões de alunos internacionais enfrentam barreiras severas de mobilidade e equivalência de créditos, perdendo bolsas de pesquisa, intercâmbios e contratações urgentes por causa de semanas de espera e custos consulares abusivos. Ao mesmo tempo, secretarias acadêmicas gastam até 30% da sua jornada respondendo chamados manuais para atestar papéis, enquanto o prestígio da instituição fica refém de falsificações digitais que circulam livremente. O problema não é a competência das universidades, mas a ausência de um trilho digital comum e soberano que una estudante, faculdade e mercado com prova criptográfica instantânea.",
    citations: [
      { name: "HireRight Global Benchmark", url: "https://hireright.com", note: "Global Employment Screening Benchmark Report (Fraude em credenciais educacionais lidera o ranking #1 de inconsistências corporativas; até 85% dos empregadores detectam discrepâncias)" },
      { name: "UNESCO", url: "https://unesco.org", note: "Global Convention on the Recognition of Qualifications (6.3M+ estudantes internacionais com mobilidade travada por burocracia e equivalência)" },
      { name: "EHEA / Processo de Bolonha", url: "https://ehea.info", note: "ECTS Users' Guide (Perda média de 1 a 2 semestres letivos em transferências devido à lentidão na validação de créditos)" },
      { name: "W3C Verifiable Credentials", url: "https://w3.org/TR/vc-data-model-2.0", note: "Verifiable Credentials Data Model v2.0 (Padrão internacional aberto para atestações digitais soberanas e à prova de adulteração)" },
    ],
    deliveryTip: "Enfatize o impacto humano em cada uma das três pontas (estudante perdendo oportunidade, faculdade sobrecarregada/exposta e empresa no escuro), ancorando a fala nos dados concretos da HireRight e da UNESCO.",
  },
  {
    id: 2,
    timeRange: "01:30 - 02:30 (~1 min)",
    badge: "Bloco 2 • A Solução em Linguagem Simples",
    category: "A Solução",
    title: "Protocolo Unificado de Integridade Acadêmica",
    subtitle: "Transformando diplomas, históricos e certificados em credenciais criptográficas soberanas",
    keyObjective: "Apresentar a proposta de valor e a arquitetura conceitual da solução: fim do modelo de PDFs vulneráveis e instituição de um padrão comum de verdade compartilhada (W3C/LGPD) entre Universidade, Aluno e Mercado, sem antecipar o walkthrough prático do Bloco 4.",
    speakerScript:
      "O que o LattesChain propõe como solução definitiva? Nós criamos o Protocolo Unificado de Integridade Acadêmica: uma camada de infraestrutura descentralizada que transforma documentos educacionais vulneráveis — como diplomas, históricos e certificados — em credenciais digitais soberanas e matematicamente invioláveis. Em vez de depender de papéis carimbados ou PDFs editáveis que qualquer um forja no Photoshop, estabelecemos uma fonte única e compartilhada da verdade entre faculdade, estudante e mercado. A solução ancora a integridade dos dados através de impressões digitais criptográficas e assinaturas oficiais das universidades, garantindo custódia soberana ao aluno, eliminação total de intermediários manuais e conformidade estrita com a LGPD e o padrão internacional W3C Verifiable Credentials. Nós não apenas digitalizamos papéis; nós criamos uma nova arquitetura de confiança onde a veracidade é uma propriedade matemática irrefutável do documento.",
    citations: [
      { name: "W3C Verifiable Credentials", url: "https://w3.org/TR/vc-data-model-2.0", note: "Verifiable Credentials Data Model v2.0 Standard" },
      { name: "Solana Attestation Service", url: "https://docs.solanalabs.com", note: "Padrão de atestações nativas da Solana" },
      { name: "NIST SHA-256 Standard", url: "https://csrc.nist.gov/publications/detail/fips/180-4/final", note: "Padrão criptográfico de integridade documental" },
    ],
    deliveryTip: "Foque na proposta de valor e na mudança de paradigma: substituição de PDFs vulneráveis por um protocolo descentralizado de confiança mútua. Deixe o passo a passo de telas e a IA para o Bloco 4.",
  },
  {
    id: 3,
    timeRange: "02:30 - 03:30 (~1 min)",
    badge: "Bloco 3 • Por Que Solana? O Fator Blockchain",
    category: "Diferencial Tecnológico",
    title: "Primitivas Nativas Que Só a Solana Oferece",
    subtitle: "SAS nativo, Token-2022 Soulbound revogável, custo sub-centavo e privacidade LGPD",
    keyObjective: "Demonstrar a arquitetura corporativa em Solana: governança institucional garantida para a faculdade, privacidade e custo zero de onboarding.",
    speakerScript:
      "Para sustentar essa ponte com viabilidade institucional, a escolha da Solana é cirúrgica. Em vez de contratos experimentais, ancoramos o sistema no Solana Attestation Service e em extensões nativas do Token-2022. O diploma é emitido como um Soulbound intransferível, com governança mantida pela faculdade através de delegação permanente para revogação em casos legais. Garantimos conformidade com LGPD registrando apenas hashes criptográficos. Todos os envolvidos podem usar, por exemplo, a carteira Phantom diretamente no navegador para testar o MVP na Devnet e, futuramente, assinar e liquidar transações reais com essa mesma carteira em nosso ecossistema — com suporte a relayer corporativo gasless. É a sofisticação da Web3 com usabilidade corporativa.",
    citations: [
      { name: "Solana Labs", url: "https://docs.solanalabs.com", note: "Solana Attestation Service Architecture" },
      { name: "SPL Token-2022", url: "https://spl.solana.com/token-2022/extensions", note: "NonTransferable & PermanentDelegate Extensions" },
    ],
    deliveryTip: "Firmeza técnica: enfatize que os envolvidos usam a carteira Phantom hoje no MVP e farão transações reais com ela no futuro, com suporte gasless.",
  },
  {
    id: 4,
    timeRange: "03:30 - 04:30 (~1 min)",
    badge: "Bloco 4 • Na Prática (Demo & Camada de IA)",
    category: "Demonstração & IA",
    title: "O Fluxo Tripartite em Ação & Motor Gemini 1.5 Pro",
    subtitle: "Emissão em 2s, passaporte com QR Code, validador instantâneo e equivalência curricular por IA",
    keyObjective: "Apresentar o produto em produção conectando as três pontas em tempo real e o diferencial de equivalência por IA.",
    speakerScript:
      "E como essa arquitetura funciona na prática no nosso produto? Nosso protótipo está 100% funcional e operando ao vivo com as três pontas integradas: Primeiro, a secretaria acadêmica emite atestações oficiais no Portal da Universidade em 2 segundos com metadados do MEC. Segundo, o estudante conecta sua carteira Phantom, acessa seu passaporte com a contagem de horas complementares e gera seu QR Code soberano. Terceiro, o recrutador ou empresa audita qualquer documento no validador público em menos de 400 milissegundos, com prova irrefutável na Solana. E como salto de produtividade, ativamos o Google Gemini 1.5 Pro, que lê semanticamente as ementas, gera um Trust Report executivo e calcula automaticamente a equivalência curricular entre diferentes instituições.",
    citations: [
      { name: "Demo ao Vivo", url: "/validator", note: "Validador público funcional com 4 presets canônicos" },
      { name: "Passaporte do Aluno", url: "/student", note: "Carteira soberana com barra de horas MEC e QR Code" },
      { name: "Portal IES", url: "/university", note: "Emissor on-chain com metadados MEC e histórico" },
    ],
    deliveryTip: "Demonstração prática ao vivo: conduza os 4 passos operacionais (Portal IES, Passaporte com Phantom, Validador do RH e IA Gemini calculando equivalência).",
  },
  {
    id: 5,
    timeRange: "04:30 - 05:00 (30s)",
    badge: "Bloco 5 • Time, Stack MVP & Próximos Passos",
    category: "Time & Roadmap",
    title: "Execução Focada & Escalabilidade Global",
    subtitle: "Stack open-source custo zero, modelo B2B2C freemium e expansão para o Processo de Bolonha",
    keyObjective: "Transmitir maturidade executiva da JOVIAN TECH, integração com ERPs já existentes e convite final.",
    speakerScript:
      "Por trás do LattesChain está a JOVIAN TECH, formada por Alex Miqueias na liderança de arquitetura Web3 e contratos Solana, Rogério Alencar Filho em engenharia de dados, backend e DevSecOps, e Caio Vila Nova em operações de sistemas e automações. Desenvolvemos uma stack 100% open-source de custo zero no MVP: Go ultraleve, Python com IA, Supabase e Solana. Nosso plano de entrada inicia no piloto beachhead de horas complementares com centros acadêmicos, escala para equivalência internacional no padrão Bolonha e integra-se via API direta aos ERPs legados. LattesChain: a soberania educacional na velocidade da Solana!",
    citations: [
      { name: "EHEA Bologna Process", url: "https://ehea.info", note: "Bologna Process & ECTS Users' Guide" },
      { name: "JOVIAN TECH", url: "https://jovian.foo", note: "Ecossistema Corporativo Autônomo & DataSecAIOps" },
      { name: "Repositório GitHub", url: "https://github.com/alexmsza/LattesChain", note: "Código 100% Open-Source e Auditado" },
    ],
    deliveryTip: "Fechamento memorável: cite nominalmente os integrantes da JOVIAN TECH com postura firme e finalize cravando a frase de efeito com autoridade.",
  },
];
