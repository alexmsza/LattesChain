/**
 * LattesChain — Mock Showcase Dataset (Branch: demo/mock-showcase)
 * Dados canônicos para apresentação ao vivo do pitch de 5 minutos do Hackathon.
 */

export const MOCK_SHOWCASE_INSTITUTIONS = [
  {
    id: "ufmg",
    name: "Universidade Federal de Minas Gerais (UFMG)",
    cnpj: "17.217.985/0001-04",
    solana_pubkey: "3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH",
    is_verified: true,
  },
  {
    id: "usp",
    name: "Universidade de São Paulo (USP)",
    cnpj: "63.025.530/0001-04",
    solana_pubkey: "7yW1J9kLmNoPqRsTuVwXyZ1234567890abcdef12345",
    is_verified: true,
  },
  {
    id: "pucminas",
    name: "Pontifícia Universidade Católica de Minas Gerais (PUC Minas)",
    cnpj: "17.178.195/0001-67",
    solana_pubkey: "9zX2K0mNoPqRsTuVwXyZ1234567890abcdef1234567",
    is_verified: true,
  },
];

export const MOCK_SHOWCASE_STUDENT = {
  name: "Alexandre Silva",
  cpf: "123.456.789-00",
  course: "Bacharelado em Ciência da Computação",
  university: "Universidade Federal de Minas Gerais (UFMG)",
  solanaWallet: "EDFKFcXnx1XbqDCo6D5DXBdxxCWT3eLdMDyX1RMpDgtK",
  totalHours: 188,
  requiredHours: 200,
  records: [
    {
      id: "rec-mock-1",
      type: "DIPLOMA",
      title: "Bacharelado em Ciência da Computação",
      institution: "Universidade Federal de Minas Gerais (UFMG)",
      date: "Agosto 2026",
      hours: 3200,
      grade: "10.0 (Magna Cum Laude)",
      status: "TOKEN-2022 SOULBOUND",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      tx: "5K2UeXmJ6aP7vN4tL8qR1wZ9yD3bC2fE4gH7jK9mP1rT3vX57890abcdef1234567890",
    },
    {
      id: "rec-mock-2",
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
      id: "rec-mock-3",
      type: "HORAS_COMPLEMENTARES",
      title: "Hackathon Universitário Superteam Brasil",
      institution: "Superteam Brasil",
      date: "Agosto 2026",
      hours: 60,
      grade: "1º Lugar Nacional",
      status: "ATESTADO NO SAS",
      hash: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72",
      tx: "4N9pGxL3wQ5yM0rU8zE6cD2gF4hI7kL9nQ1sU3wY51234567890abcdef1234567890",
    },
    {
      id: "rec-mock-4",
      type: "HORAS_COMPLEMENTARES",
      title: "Monitoria de Programação Concorrente",
      institution: "Universidade Federal de Minas Gerais (UFMG)",
      date: "Fevereiro 2026",
      hours: 48,
      grade: "10.0",
      status: "ATESTADO NO SAS",
      hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      tx: "2L7mEvJ1uO3wK8pS6xD4aB0eD2fG5iJ7lO9qS1uW31234567890abcdef1234567890",
    },
    {
      id: "rec-mock-5",
      type: "HORAS_COMPLEMENTARES",
      title: "Iniciação Científica em Sistemas Descentralizados",
      institution: "DCC / UFMG",
      date: "Novembro 2025",
      hours: 80,
      grade: "Aprovado com Louvor",
      status: "ATESTADO NO SAS",
      hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
      tx: "1Q2wErTyUiOpAsDfGhJkLzXcVbNm1234567890poiuytrewqasdfghjklmnbvcxz",
    },
  ],
};

export const MOCK_REVOKED_DIPLOMA = {
  hash: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  tx: "9999999999999999999999999999999999999999999999999999999999999999",
  status: "REVOGADO PELA IES (PERMANENT DELEGATE TOKEN-2022)",
  reason: "Fraude documental detectada no histórico acadêmico prévio.",
};

export function evaluateMockEquivalence(disciplinaA: any, disciplinaB: any) {
  const chA = parseInt(String(disciplinaA?.carga_horaria || "72"), 10);
  const chB = parseInt(String(disciplinaB?.carga_horaria || "60"), 10);
  const aproveitavel = Math.min(chA, chB);

  return {
    success: true,
    integridade_onchain_ok: true,
    ementa_hash_calculado:
      disciplinaA?.ementa_hash ||
      "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    disciplina_origem: {
      instituicao: disciplinaA?.instituicao || "Universidade Federal de Minas Gerais (UFMG)",
      disciplina: disciplinaA?.disciplina || "Estruturas de Dados e Algoritmos Avançados",
      carga_horaria: chA,
    },
    disciplina_destino: {
      instituicao: disciplinaB?.instituicao || "Universidade de São Paulo (USP)",
      disciplina: disciplinaB?.disciplina || "Algoritmos e Estruturas de Dados I",
      carga_horaria: chB,
    },
    veredito: {
      equivalente: true,
      confianca_pct: 92,
      carga_horaria_aproveitavel: aproveitavel,
      justificativa:
        "Análise semântica e curricular positiva: 4 núcleos temáticos coincidentes (complexidade assintótica, estruturas lineares, grafos, algoritmos de busca e ordenação). Integridade da ementa validada on-chain com 100% de precisão no Solana Attestation Service. Carga horária de " +
        chA +
        "h atende aos requisitos da instituição receptora.",
      topicos_coincidentes: [
        "complexidade assintótica",
        "estruturas lineares (listas, pilhas, filas)",
        "árvores binárias e balanceadas",
        "tabelas hash e dispersão",
        "grafos e percursos",
        "algoritmos de busca e ordenação",
      ],
      topicos_faltantes: [],
    },
  };
}
