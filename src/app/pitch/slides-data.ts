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
      "Olá banca examinadora e comunidade Superteam Brasil! Nós somos a equipe da Jovian Tech e hoje apresentamos o LattesChain: o protocolo descentralizado que transforma diplomas, créditos e históricos acadêmicos em atestações soberanas, imutáveis e verificáveis em menos de 1 segundo na Solana. Estamos eliminando décadas de burocracia e fraudes com a melhor infraestrutura Web3 do planeta.",
    citations: [
      { name: "Superteam Earn", url: "https://superteam.fun/earn", note: "Hackathon Universitário Superteam Brasil" },
      { name: "Jovian Tech", url: "https://jovian.foo", note: "GovTech • DataSecAIOps • Web3" },
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
      "Hoje, validar diplomas e históricos escolares ainda depende de PDFs comuns e papéis carimbados — fáceis de forjar com qualquer software de edição. Quem sofre com isso? Primeiro, os estudantes, que perdem prazos de intercâmbio, bolsas e vagas no exterior por semanas de espera burocrática e taxas consulares. Segundo, as secretarias acadêmicas, sobrecarregadas com validações manuais por e-mail e telefone, gastando até 30% da sua jornada de trabalho. E terceiro, empresas e recrutadores que gastam até 15 dias e milhares de reais auditando históricos escolares. E como nós sabemos disso? Segundo a UNESCO, a falta de padronização e lentidão documental é o maior entrave para mais de 6 milhões de estudantes transfronteiriços. E no mercado corporativo, o relatório global da HireRight comprova que adulterações educacionais lideram as inconsistências detectadas em triagens de candidatos.",
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
      "A nossa solução é o LattesChain: um passaporte acadêmico digital e global hospedado na Solana. O fluxo é simples: a universidade emite a credencial oficial assinada criptograficamente direto para a carteira digital do estudante. O aluno não precisa mais pedir 'segunda via' nem implorar carimbos: ele é o dono soberano do seu histórico. Para comprovar suas qualificações, ele compartilha apenas um link ou QR Code com qualquer recrutador ou instituição estrangeira. A validação ocorre em menos de 1 segundo direto na rede pública, eliminando intermediários e custos cartorários. O modelo segue rigorosamente o padrão internacional W3C Verifiable Credentials v2.0, permitindo que as credenciais sejam provadas matematicamente sem depender de servidores centrais da faculdade de origem.",
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
      "Por que a Solana é indispensável nessa solução e o que ela resolve que outra tecnologia não resolveria? Nós não reinventamos a roda com smart contracts frágeis: usamos as primitivas nativas e auditadas da Solana. Primeiro: o Solana Attestation Service (SAS), o padrão oficial de credenciais abertas da rede, que confere interoperabilidade nativa com Civic e Solana ID. Segundo: o Token-2022 com a extensão NonTransferable — o certificado nasce como um Soulbound Token que cola na carteira do estudante, impedindo a venda ou transferência do diploma. Terceiro: PermanentDelegate — se a universidade detectar fraude administrativa ou anulação judicial, ela revoga a credencial on-chain de forma transparente. Quarto: Custo Sub-Centavo — emitir centenas de milhares de matérias e certificados custa frações de centavos de real, algo economicamente impossível no Ethereum ou Bitcoin. E quinto: Privacidade por Design — em total conformidade com a LGPD e o GDPR, nenhum dado pessoal sensível como CPF ou nome vai para a blockchain; ancoramos apenas o hash criptográfico SHA-256 do documento canônico.",
    citations: [
      { name: "Solana Labs", url: "https://docs.solanalabs.com", note: "Solana Attestation Service Architecture" },
      { name: "SPL Token-2022", url: "https://spl.solana.com/token-2022/extensions", note: "NonTransferable & PermanentDelegate Extensions" },
    ],
    deliveryTip: "Este é o slide de maior peso técnico. Destaque o 'Token-2022 NonTransferable + PermanentDelegate' com firmeza.",
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
      "Vejam como isso funciona na prática nas nossas 4 pontas ativas: Na Emissão (/university), a instituição preenche os dados curriculares, assina a transação na devnet da Solana via SAS e o token intransferível chega à carteira do aluno em menos de 2 segundos. Na Custódia (/student), o estudante acessa seu passaporte unificado com acompanhamento de horas complementares do MEC e gera seu QR Code instantâneo. Na Validação (/validator), qualquer empresa arrasta o PDF ou clica nos nossos presets de teste rápido e a autenticidade é checada na Solana em menos de 400 milissegundos. E como grande diferencial, integramos o motor de IA com Google Gemini 1.5 Pro: ele traduz a blockchain em um 'Trust Report' executivo em linguagem natural e resolve o maior pesadelo acadêmico — a equivalência curricular automática entre ementas de faculdades diferentes.",
    citations: [
      { name: "Demo ao Vivo", url: "/validator", note: "Validador público funcional com 4 presets canônicos" },
      { name: "Passaporte do Aluno", url: "/student", note: "Carteira soberana com barra de horas MEC e QR Code" },
      { name: "Portal IES", url: "/university", note: "Emissor on-chain com metadados MEC e histórico" },
    ],
    deliveryTip: "Aponte para os cards na tela e convide a banca a testar o /validator ao vivo com 1 clique.",
  },
  {
    id: 5,
    timeRange: "04:30 - 05:00 (~1 min)",
    badge: "Bloco 5 • Time, Stack MVP & Próximos Passos",
    category: "Time & Roadmap",
    title: "Execução Focada & Escalabilidade Global",
    subtitle: "Stack open-source custo zero, modelo B2B2C freemium e expansão para o Processo de Bolonha",
    keyObjective: "Transmitir maturidade de produto, clareza no go-to-market e sustentabilidade econômica.",
    speakerScript:
      "Quem está por trás do LattesChain? O time é composto por Alex Miqueias, Rogério Alencar Filho e Caio Vila Nova, com a incubação da Jovian Tech, unindo forte especialização em Engenharia de Dados, DevSecOps, Sistemas & Operações, Inteligência Artificial e Arquitetura Distribuída Solana. Toda a nossa stack do MVP é 100% open-source e com custo zero de infraestrutura: Go ultraleve, Python com IA, Supabase e SDKs Solana. O nosso roadmap possui 3 passos claros: Primeiro, piloto beachhead focado em horas complementares e certificados de extensão com centros acadêmicos parceiros, sem depender de aprovações ministeriais lentas. Segundo, calibração da IA para mapeamento curricular no padrão europeu do Processo de Bolonha (ECTS) e universidades norte-americanas. E terceiro, deploy na mainnet da Solana com State Compression e integração via API REST direta aos ERPs acadêmicos como TOTVS. LattesChain: a soberania educacional na velocidade da Solana!",
    citations: [
      { name: "EHEA Bologna Process", url: "https://ehea.info", note: "Bologna Process & ECTS Users' Guide" },
      { name: "Jovian Tech", url: "https://jovian.foo", note: "Venture Builder & GovTech Incubadora" },
      { name: "Repositório GitHub", url: "https://github.com/alexmsza/LattesChain", note: "Código 100% Open-Source e Auditado" },
    ],
    deliveryTip: "Feche com impacto, energia alta e convite final para a banca inspecionar o código e a demo.",
  },
];
