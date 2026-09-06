/**
 * LattesChain / EduCore Protocol — Dataset Canônico de Demonstração (Demo Showcase)
 * Utilizado exclusivamente na branch demo/mock-showcase para pitch e apresentação ao vivo.
 */

export interface AcademicRecordMock {
  id: string;
  type: "DIPLOMA" | "DISCIPLINA" | "HORAS_COMPLEMENTARES" | "CERTIFICADO_CURSO" | "HISTORICO_ESCOLAR";
  title: string;
  institution: string;
  date: string;
  hours: number | null;
  grade: string | null;
  status: string;
  hash: string;
  tx: string;
}

export const MOCK_SHOWCASE_STUDENT = {
  name: "Alexandre Silva",
  course: "Bacharelado em Ciência da Computação",
  university: "Universidade Federal de Minas Gerais (UFMG)",
  solanaWallet: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
  totalHours: 180,
  requiredHours: 200,
  records: [
    {
      id: "rec-1",
      type: "DIPLOMA",
      title: "Bacharelado em Ciência da Computação",
      institution: "Universidade Federal de Minas Gerais (UFMG)",
      date: "Agosto 2026",
      hours: null,
      grade: "Excelente (10.0)",
      status: "TOKEN-2022 SOULBOUND",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      tx: "5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE4gH7jK9mP1rT3vX57890abcdef1234567890",
    },
    {
      id: "rec-2",
      type: "DISCIPLINA",
      title: "Estruturas de Dados e Algoritmos Avançados",
      institution: "Universidade Federal de Minas Gerais (UFMG)",
      date: "Julho 2026",
      hours: 72,
      grade: "9.5",
      status: "ATESTADO NO SAS",
      hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      tx: "3M8nFwK2vP4xL9qT7yD5bC1fE3gH6jK8mP0rT2vX41234567890abcdef1234567890",
    },
    {
      id: "rec-3",
      type: "HORAS_COMPLEMENTARES",
      title: "Hackathon Universitário Superteam Brasil",
      institution: "Superteam Brasil",
      date: "Agosto 2026",
      hours: 60,
      grade: "1º Lugar",
      status: "ATESTADO NO SAS",
      hash: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72",
      tx: "4N9pGxL3wQ5yM0rU8zE6cD2gF4hI7kL9nQ1sU3wY51234567890abcdef1234567890",
    },
    {
      id: "rec-4",
      type: "HORAS_COMPLEMENTARES",
      title: "Monitoria de Introdução à Programação",
      institution: "Universidade Federal de Minas Gerais (UFMG)",
      date: "Dezembro 2025",
      hours: 48,
      grade: "10.0",
      status: "ATESTADO NO SAS",
      hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      tx: "2L7mEvJ1uO3wK8pS6xD4aB0eD2fG5iJ7lO9qS1uW31234567890abcdef1234567890",
    },
  ] as AcademicRecordMock[],
};

// Solicitações de Validação Acadêmica (Aluno ➔ IES)
export const MOCK_VALIDATION_REQUESTS = [
  {
    id: "req-1",
    student_id: "stud-1",
    student_name: "Alexandre Silva",
    student_cpf: "11122233344",
    title: "Workshop de Rust e Smart Contracts na Solana",
    document_type: "HORAS_COMPLEMENTARES",
    origin_type: "EXTERNAL",
    external_issuer_name: "Superteam Academy",
    workload_hours: 40,
    document_hash: "8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4",
    notes: "Curso intensivo de desenvolvimento on-chain concluído com projeto prático de memopad.",
    status: "PENDING",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    institutions: { name: "Universidade Federal de Minas Gerais (UFMG)" },
  },
  {
    id: "req-2",
    student_id: "stud-1",
    student_name: "Alexandre Silva",
    student_cpf: "11122233344",
    title: "Introdução ao Aprendizado Profundo e Visão Computacional",
    document_type: "CERTIFICADO_CURSO",
    origin_type: "EXTERNAL",
    external_issuer_name: "Coursera / Stanford Online",
    workload_hours: 60,
    document_hash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    status: "APPROVED",
    solana_tx_signature: "4N9pGxL3wQ5yM0rU8zE6cD2gF4hI7kL9nQ1sU3wY51234567890abcdef1234567890",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    institutions: { name: "Universidade Federal de Minas Gerais (UFMG)" },
  },
  {
    id: "req-3",
    student_id: "stud-1",
    student_name: "Alexandre Silva",
    student_cpf: "11122233344",
    title: "Palestra de Inteligência Artificial sem Código",
    document_type: "HORAS_COMPLEMENTARES",
    origin_type: "EXTERNAL",
    external_issuer_name: "Comunidade Tech Livre",
    workload_hours: 8,
    document_hash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    status: "REJECTED",
    rejection_reason: "Carga horária inferior ao mínimo aceito pelo colegiado de Ciência da Computação para extensão (mínimo 20h).",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    institutions: { name: "Universidade Federal de Minas Gerais (UFMG)" },
  },
];

// Solicitações de Compliance de RH (Empresa ➔ Aluno)
export const MOCK_COMPLIANCE_REQUESTS = [
  {
    id: "comp-1",
    employer_name: "Nubank",
    employer_email: "recrutamento.tech@nubank.com.br",
    student_identifier: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
    purpose: "ESTAGIO",
    requested_items: ["Comprovante de Matrícula Ativa", "Histórico Escolar Oficial", "Horas Complementares"],
    status: "PENDING",
    access_token: "nubank-intern-verify-7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "comp-2",
    employer_name: "Google Brasil",
    employer_email: "university-programs-latam@google.com",
    student_identifier: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
    purpose: "ESTAGIO",
    requested_items: ["Histórico Escolar On-Chain", "Diploma ou Declaração de Formatura"],
    status: "SHARED",
    shared_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    access_token: "google-intern-proof-9b71d224bd62f3785d96d46ad3ea3d73319bfbc289",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

// Diretório Geral de Alunos para a IES
export const MOCK_STUDENTS_DIRECTORY = [
  {
    id: "stud-1",
    full_name: "Alexandre Silva",
    cpf: "11122233344",
    email: "alexandre.silva@aluno.educore.org",
    solana_wallet_custodial: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
    total_records: 4,
    total_hours: 180,
    records: MOCK_SHOWCASE_STUDENT.records,
  },
  {
    id: "stud-2",
    full_name: "Beatriz Lima",
    cpf: "22233344455",
    email: "beatriz.lima@aluno.educore.org",
    solana_wallet_custodial: "7yW1J9kLmNoPqRsTuVwXyZ1234567890abcdef12345",
    total_records: 3,
    total_hours: 140,
    records: [
      {
        id: "rec-b1",
        title: "Algoritmos e Estruturas de Dados I",
        document_type: "DISCIPLINA",
        document_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        solana_tx_signature: "5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE4gH7jK9mP1rT3vX57890abcdef1234567890",
        metadata: { workload_hours: 60 },
      },
      {
        id: "rec-b2",
        title: "Iniciação Científica em Blockchain",
        document_type: "HORAS_COMPLEMENTARES",
        document_hash: "3b2f1e4a5d6c7b8a9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        solana_tx_signature: "3M8nFwK2vP4xL9qT7yD5bC1fE3gH6jK8mP0rT2vX41234567890abcdef1234567890",
        metadata: { workload_hours: 80 },
      },
    ],
  },
  {
    id: "stud-3",
    full_name: "Carlos Eduardo Santos",
    cpf: "33344455566",
    email: "carlos.eduardo@aluno.educore.org",
    solana_wallet_custodial: "9zX2K0mNoPqRsTuVwXyZ1234567890abcdef1234567",
    total_records: 2,
    total_hours: 90,
    records: [
      {
        id: "rec-c1",
        title: "Banco de Dados Relacionais e SQL",
        document_type: "DISCIPLINA",
        document_hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        solana_tx_signature: "2L7mEvJ1uO3wK8pS6xD4aB0eD2fG5iJ7lO9qS1uW31234567890abcdef1234567890",
        metadata: { workload_hours: 60 },
      },
      {
        id: "rec-c2",
        title: "Monitoria de Cálculo I",
        document_type: "HORAS_COMPLEMENTARES",
        document_hash: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
        solana_tx_signature: "4N9pGxL3wQ5yM0rU8zE6cD2gF4hI7kL9nQ1sU3wY51234567890abcdef1234567890",
        metadata: { workload_hours: 30 },
      },
    ],
  },
];

// Motor de Equivalência Curricular Canônico Determinístico
export function evaluateMockEquivalence(disciplinaA: any, disciplinaB: any) {
  const cargaA = disciplinaA?.carga_horaria || 60;
  const cargaB = disciplinaB?.carga_horaria || 60;
  const diferencaCarga = Math.abs(cargaA - cargaB) / Math.max(cargaA, cargaB);

  const topicosComuns = [
    "Estruturas Lineares (Listas, Pilhas, Filas)",
    "Árvores Binárias Balanceadas",
    "Tabelas Hash com Tratamento de Colisões",
    "Algoritmos de Ordenação em Memória Primária (QuickSort, MergeSort)",
    "Análise de Complexidade Assintótica",
  ];

  const aproveitavel = Math.min(cargaA, cargaB);
  const confianca = Math.round(92 - diferencaCarga * 15);

  return {
    disciplina_origem: `${disciplinaA?.instituicao || "IES A"} - ${disciplinaA?.disciplina || "Disciplina A"}`,
    disciplina_destino: `${disciplinaB?.instituicao || "IES B"} - ${disciplinaB?.disciplina || "Disciplina B"}`,
    integridade_criptografica: "HASH_VERIFICADO_ONCHAIN",
    ementa_hash_calculado: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    veredito: {
      equivalente: true,
      confianca_pct: confianca,
      carga_horaria_aproveitavel: aproveitavel,
      topicos_coincidentes: topicosComuns,
      justificativa: `O parecer técnico de inteligência artificial deferiu a equivalência curricular entre ${disciplinaA?.instituicao || "UFMG"} e ${disciplinaB?.instituicao || "USP"}. As ementas apresentam sobreposição de conteúdo programático superior a 85%, abrangendo estruturas fundamentais, recursão e análise assintótica. A carga horária de ${aproveitavel} horas é compatível para aproveitamento integral de créditos acadêmicos.`,
    },
  };
}
