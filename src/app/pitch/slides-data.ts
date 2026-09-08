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
    title: "O Passaporte Acadêmico Soberano",
    subtitle: "Propriedade real do histórico escolar na carteira do aluno com validação em menos de 1 segundo",
    keyObjective: "Explicar como a ponte LattesChain potencializa os sistemas acadêmicos existentes com tecnologia de ponta, sem fricção nem ataques a servidores legados.",
    speakerScript:
      "O LattesChain atua exatamente como essa ponte integradora. Não viemos substituir nem concorrer com os sistemas consolidados das faculdades, mas potencializá-los com tecnologia de ponta. Quando a instituição emite uma credencial, ela assina digitalmente no protocolo e estende essa autenticidade diretamente para a carteira do estudante. O histórico ganha custódia perene e portabilidade universal no padrão W3C Verifiable Credentials. Na outra ponta, qualquer recrutador ou universidade no mundo audita a veracidade em menos de 1 segundo via QR Code, sem sobrecarregar a secretaria e blindando o nome da faculdade contra fraudes.",
    citations: [
      { name: "W3C Verifiable Credentials", url: "https://w3.org/TR/vc-data-model-2.0", note: "Verifiable Credentials Data Model v2.0 Standard" },
      { name: "Convenção de Haia", url: "https://hcch.net", note: "Equivalência de Apostilamento Digital transfronteiriço" },
    ],
    deliveryTip: "Destaque a harmonia: a faculdade continua como autoridade emissora com sua reputação protegida, enquanto o aluno ganha mobilidade global.",
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
      "Para sustentar essa ponte com viabilidade institucional, a escolha da Solana é cirúrgica. Em vez de contratos experimentais, ancoramos o sistema no Solana Attestation Service e em extensões nativas do Token-2022. O diploma é emitido como um Soulbound intransferível, com governança mantida pela faculdade através de delegação permanente para revogação em casos legais. Garantimos conformidade total com LGPD registrando apenas hashes criptográficos, enquanto nosso relayer corporativo viabiliza custo sub-centavo com experiência 'gasless': nem a faculdade nem o aluno precisam comprar criptoativos. É a sofisticação da Web3 com simplicidade de software corporativo.",
    citations: [
      { name: "Solana Labs", url: "https://docs.solanalabs.com", note: "Solana Attestation Service Architecture" },
      { name: "SPL Token-2022", url: "https://spl.solana.com/token-2022/extensions", note: "NonTransferable & PermanentDelegate Extensions" },
    ],
    deliveryTip: "Firmeza técnica: enfatize que a universidade mantém a autoridade de revogação legal e que a barreira de entrada é zero graças ao relayer corporativo.",
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
      "E isso não é apenas conceito — nosso protótipo está 100% funcional e operando ao vivo. Cobrimos as três pontas em tempo real: a secretaria acadêmica ancora credenciais com metadados do MEC em dois segundos; o aluno acompanha seu passaporte e compartilha seu QR Code; e o recrutador audita qualquer documento em menos de 400 milissegundos direto na Devnet. Como salto qualitativo, integramos a inteligência do Google Gemini 1.5 Pro, que analisa semanticamente as ementas e resolve um dos maiores atritos históricos da educação: o cálculo automático de equivalência curricular entre instituições nacionais e internacionais.",
    citations: [
      { name: "Demo ao Vivo", url: "/validator", note: "Validador público funcional com 4 presets canônicos" },
      { name: "Passaporte do Aluno", url: "/student", note: "Carteira soberana com barra de horas MEC e QR Code" },
      { name: "Portal IES", url: "/university", note: "Emissor on-chain com metadados MEC e histórico" },
    ],
    deliveryTip: "Convide a banca com os olhos na tela. Ressalte que a IA resolve a dor prática da equivalência de matérias entre faculdades.",
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
      "Por trás do LattesChain está a JOVIAN TECH, combinando arquitetura Web3 em Solana, engenharia de dados, DevSecOps e operações de sistemas. Nosso plano de entrada inicia na gestão de horas complementares com centros acadêmicos, escala para equivalência internacional e integra-se diretamente aos ERPs já utilizados pelas faculdades. O LattesChain é a ponte que une tradição acadêmica e vanguarda tecnológica. Convidamos todos a testar nossa demo ao vivo!",
    citations: [
      { name: "EHEA Bologna Process", url: "https://ehea.info", note: "Bologna Process & ECTS Users' Guide" },
      { name: "JOVIAN TECH", url: "https://jovian.foo", note: "Ecossistema Corporativo Autônomo & DataSecAIOps" },
      { name: "Repositório GitHub", url: "https://github.com/alexmsza/LattesChain", note: "Código 100% Open-Source e Auditado" },
    ],
    deliveryTip: "Fechamento memorável: reforce o valor da ponte entre tradição acadêmica e vanguarda tecnológica, chamando a banca para a ação.",
  },
];
