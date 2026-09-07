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
    keyObjective: "Capturar atenção imediata da banca demonstrando autoridade técnica e relevância institucional.",
    speakerScript:
      "Banca examinadora e comunidade Superteam Brasil: nós somos a ASZA COMPANY e apresentamos o LattesChain. Transformamos diplomas, históricos escolares e horas curriculares em credenciais soberanas, imutáveis e verificáveis em menos de 1 segundo na rede Solana. Estamos substituindo décadas de lentidão burocrática e fraudes documentais pela infraestrutura Web3 mais rápida e eficiente do mundo.",
    citations: [
      { name: "Superteam Earn", url: "https://superteam.fun/earn", note: "Hackathon Universitário Superteam Brasil" },
      { name: "ASZA COMPANY", url: "https://github.com/alexmsza/ASZA-COMPANY", note: "Ecossistema Corporativo Autônomo • DataSecAIOps" },
    ],
    deliveryTip: "Fale com energia, confiança e postura firme. Faça contato visual com a câmera.",
  },
  {
    id: 1,
    timeRange: "00:30 - 01:30 (~1 min)",
    badge: "Bloco 1 • O Problema & Quem Sofre",
    category: "O Problema",
    title: "Burocracia Paralisante & Epidemia de Fraudes",
    subtitle: "Documentos em PDF e papel custam semanas de espera e bilhões em validações manuais",
    keyObjective: "Comprovar que a dor é real, aguda e validada por dados da UNESCO e relatórios de mercado.",
    speakerScript:
      "A validação acadêmica global ainda é refém de papéis carimbados e PDFs vulneráveis a qualquer software de edição. Isso gera três gargalos críticos: primeiro, para os estudantes, que perdem prazos de bolsas, intercâmbios e vagas internacionais aguardando semanas por carimbos e apostilamentos caros. Segundo, para as secretarias acadêmicas, que perdem até 30% da rotina respondendo checagens manuais por telefone e e-mail. E terceiro, para os recrutadores, que gastam dias auditando históricos. Os dados comprovam: segundo a UNESCO, a lentidão documental é o maior obstáculo para mais de 6 milhões de estudantes transfronteiriços. E no mercado de trabalho, o relatório global da HireRight atesta que discrepâncias em históricos escolares lideram as fraudes detectadas em processos seletivos.",
    citations: [
      { name: "UNESCO", url: "https://unesco.org", note: "Global Convention on the Recognition of Qualifications (6M+ estudantes transfronteiriços)" },
      { name: "HireRight", url: "https://hireright.com", note: "Global Employment Screening Benchmark Report (Fraude educacional lidera inconsistências)" },
    ],
    deliveryTip: "Enfatize os números: '6 milhões de estudantes' e '15 dias de espera'. Mostre indignação com o status quo do PDF editável.",
  },
  {
    id: 2,
    timeRange: "01:30 - 02:30 (~1 min)",
    badge: "Bloco 2 • A Solução em Linguagem Simples",
    category: "A Solução",
    title: "O Passaporte Acadêmico Soberano",
    subtitle: "Propriedade real do histórico escolar na carteira do aluno com validação em menos de 1 segundo",
    keyObjective: "Explicar o produto com metáforas simples: não é mais um PDF, é um passaporte digital criptográfico.",
    speakerScript:
      "A resposta é o LattesChain: um passaporte acadêmico soberano na Solana, sem intermediários. O fluxo opera em 4 etapas: a universidade emite a credencial oficial assinada digitalmente direto para a carteira do estudante. O aluno torna-se o único dono do seu histórico, sem depender da estabilidade de servidores legados da faculdade. Para comprovar suas qualificações, ele compartilha um link seguro ou QR Code com recrutadores e instituições de qualquer país. A validação ocorre em menos de 1 segundo direto na blockchain, com custo zero para quem audita. A arquitetura adota o padrão internacional W3C Verifiable Credentials v2.0, garantindo equivalência transfronteiriça e validade jurídica internacional por criptografia assimétrica.",
    citations: [
      { name: "W3C Verifiable Credentials", url: "https://w3.org/TR/vc-data-model-2.0", note: "Verifiable Credentials Data Model v2.0 Standard" },
      { name: "Convenção de Haia", url: "https://hcch.net", note: "Equivalência de Apostilamento Digital transfronteiriço" },
    ],
    deliveryTip: "Mantenha a explicação em linguagem simples. Use a analogia do 'passaporte físico' vs 'passaporte na blockchain'.",
  },
  {
    id: 3,
    timeRange: "02:30 - 03:30 (~1 min)",
    badge: "Bloco 3 • Por Que Solana? O Fator Blockchain",
    category: "Diferencial Tecnológico",
    title: "Primitivas Nativas Que Só a Solana Oferece",
    subtitle: "SAS nativo, Token-2022 Soulbound revogável, custo sub-centavo e privacidade LGPD",
    keyObjective: "Responder com autoridade técnica por que a Solana é insubstituível (e não Ethereum ou banco de dados).",
    speakerScript:
      "Por que a Solana é insubstituível nessa arquitetura? Construímos tudo sobre primitivas nativas e auditadas da rede: Primeiro, o Solana Attestation Service (SAS), padrão oficial para atestações interoperáveis com Civic e Solana ID. Segundo, o SPL Token-2022 NonTransferable: o diploma nasce como Soulbound Token intransferível, impossível de ser vendido. Terceiro, o PermanentDelegate: permite que a universidade revogue a credencial on-chain em caso de fraude. Quarto, Custo Sub-Centavo: registrar milhares de matérias custa frações de centavo, inviável em outras blockchains. Quinto, Privacidade e LGPD: zero dados pessoais na rede; gravamos apenas hashes SHA-256 canônicos. E sexto, Zero Cripto Onboarding: nosso relayer corporativo assume as taxas gasless. A faculdade e o aluno usam a Web3 sem precisar comprar tokens.",
    citations: [
      { name: "Solana Labs", url: "https://docs.solanalabs.com", note: "Solana Attestation Service Architecture" },
      { name: "SPL Token-2022", url: "https://spl.solana.com/token-2022/extensions", note: "NonTransferable & PermanentDelegate Extensions" },
    ],
    deliveryTip: "Este é o slide de maior peso técnico. Destaque o 'Token-2022 NonTransferable + PermanentDelegate' e o 'Zero Cripto Onboarding' com firmeza.",
  },
  {
    id: 4,
    timeRange: "03:30 - 04:30 (~1 min)",
    badge: "Bloco 4 • Na Prática (Demo & Camada de IA)",
    category: "Demonstração & IA",
    title: "O Fluxo Tripartite em Ação & Motor Gemini 1.5 Pro",
    subtitle: "Emissão em 2s, passaporte com QR Code, validador instantâneo e equivalência curricular por IA",
    keyObjective: "Mostrar que o sistema está construído, funciona ponta a ponta e possui diferenciais de IA reais.",
    speakerScript:
      "O LattesChain já é um protótipo 100% funcional em 4 pontas: No Portal da Universidade, a emissão com metadados do MEC e ancoragem no SAS é concluída em menos de 2 segundos. No Passaporte do Aluno, o estudante monitora o progresso de horas curriculares e exibe seu QR Code soberano. No Validador Público, qualquer recrutador arrasta o PDF ou usa nossos presets rápidos para auditar a autenticidade na devnet em menos de 400 milissegundos. E como grande diferencial, integramos o motor Google Gemini 1.5 Pro: ele traduz dados criptográficos em um relatório executivo de confiança e soluciona o maior gargalo acadêmico global: a equivalência curricular automática e semântica entre ementas de faculdades distintas.",
    citations: [
      { name: "Demo ao Vivo", url: "/validator", note: "Validador público funcional com 4 presets canônicos" },
      { name: "Passaporte do Aluno", url: "/student", note: "Carteira soberana com barra de horas MEC e QR Code" },
      { name: "Portal IES", url: "/university", note: "Emissor on-chain com metadados MEC e histórico" },
    ],
    deliveryTip: "Aponte para os cards na tela e convide a banca a testar o validador ao vivo com 1 clique.",
  },
  {
    id: 5,
    timeRange: "04:30 - 05:00 (30s)",
    badge: "Bloco 5 • Time, Stack MVP & Próximos Passos",
    category: "Time & Roadmap",
    title: "Execução Focada & Escalabilidade Global",
    subtitle: "Stack open-source custo zero, modelo B2B2C freemium e expansão para o Processo de Bolonha",
    keyObjective: "Transmitir maturidade de produto, clareza no go-to-market e sustentabilidade econômica.",
    speakerScript:
      "O LattesChain é impulsionado pelo ecossistema tecnológico da ASZA COMPANY, reunindo Alex Miqueias na arquitetura Web3 Solana, Rogério Alencar em engenharia de dados e DevSecOps, e Caio Vila Nova em sistemas e operações. Nossa stack é open-source com Go, Python e Solana. Nosso roadmap ataca primeiro o piloto beachhead em horas complementares, expande para equivalência de IA no padrão de Bolonha e culmina na Mainnet com compressão de estado integrada a ERPs. LattesChain: soberania acadêmica na velocidade da Solana. Convidamos a banca a testar o validador ao vivo!",
    citations: [
      { name: "EHEA Bologna Process", url: "https://ehea.info", note: "Bologna Process & ECTS Users' Guide" },
      { name: "ASZA COMPANY", url: "https://github.com/alexmsza/ASZA-COMPANY", note: "Ecossistema Corporativo Autônomo & DataSecAIOps" },
      { name: "Repositório GitHub", url: "https://github.com/alexmsza/LattesChain", note: "Código 100% Open-Source e Auditado" },
    ],
    deliveryTip: "Feche com impacto, energia alta e convite final para a banca inspecionar o código e a demo.",
  },
];
