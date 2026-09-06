# Documento Técnico 15: Conformidade Regulatória MEC, Parser de XML, RVDD e LGPD

**Protocolo:** LattesChain (EduCore Protocol)  
**Versão:** 1.4.0  
**Data:** Setembro de 2026  
**Responsável Técnico:** Alex Miqueias (Jovian Tech)  
**Status:** Implementado & Homologado

---

## 1. Contexto Regulatória e Objetivos

Este documento formaliza as implementações técnicas do LattesChain destinadas a suprir os requisitos regulatórios do **Ministério da Educação (MEC)** para o Diploma Digital e da **Autoridade Nacional de Proteção de Dados (ANPD / LGPD)**:

1. **Portaria MEC nº 330/2018:** Fixa a obrigatoriedade da emissão e do registro de diplomas de graduação em formato digital pelas Instituições de Educação Superior (IES).
2. **Portaria MEC nº 554/2019:** Estabelece as especificações técnicas de geração do XML estruturado assinado com certificado ICP-Brasil, a Representação Visual do Diploma Digital (RVDD) e o mecanismo de validação pública.
3. **Lei nº 13.709/2018 (LGPD):** Disciplina o tratamento de dados pessoais, impondo princípios de finalidade, adequação, necessidade, livre acesso e segurança da informação.
4. **W3C Verifiable Credentials Data Model v1.1 / Open Badges 3.0:** Padrão internacional de credenciais digitais soberanas e interoperáveis.

---

## 2. Parser do XML do Diploma Digital do MEC (IES Portal)

### 2.1 Desafio Operacional
No modelo tradicional, as secretarias de graduação emitem centenas de diplomas por semestre, possuindo arquivos XML assinados no padrão XMLDSig/XAdES com certificados ICP-Brasil (A3 ou nuvem). A digitação manual de cada dado do aluno é propensa a erros de digitação e custosa em termos de horas de secretaria.

### 2.2 Arquitetura de Processamento Client-Side
O módulo implementado em [`src/app/university/page.tsx`](../src/app/university/page.tsx) opera em camada client-side resiliente:
- **Extração Semântica Tolerante via `DOMParser`:** Mapeia árvores XSD oficiais do MEC (`dadosDiploma`, `diplomado`, `dadosCurso`, `dadosRegistro`).
- **Extração Automática:**
  - `diplomado/nome` → Nome do Estudante
  - `diplomado/cpf` → CPF do Estudante
  - `dadosCurso/nomeCurso` → Curso / Titulação
  - `dadosCurso/cargaHoraria` → Carga Horária Total
  - `dadosRegistro/numeroRegistro` + `livroRegistro` + `numeroFolhaDoRegistro` → Livro, Folha e Registro Acadêmico
- **Cálculo Canônico SHA-256:** A função nativa `crypto.subtle.digest("SHA-256", arrayBuffer)` calcula o hash canônico do arquivo XML original antes de qualquer manipulação, ancorando o exato digest do documento ICP-Brasil na Solana.
- **Princípio do Fallback Manual:** O formulário é preenchido automaticamente, mas permanece **100% editável**. Se a faculdade não possuir o XML ou houver inconformidade de namespace, a secretaria pode preencher ou corrigir qualquer dado manualmente.

---

## 3. Representação Visual do Diploma Digital (RVDD) & QR Code Dinâmico

### 3.1 Requisito Legal (Art. 7º da Portaria MEC nº 554/2019)
A RVDD deve disponibilizar mecanismo de validação com código de verificação e código bidimensional (QR Code) que aponte diretamente para o endereço de consulta e auditoria do diploma.

### 3.2 Implementação Vetorial SVG (`DynamicQRCode.tsx`)
Substituindo ícones estáticos decorativos, o componente [`DynamicQRCode`](../src/components/DynamicQRCode.tsx) utiliza renderização vetorial SVG (`qrcode.react`), garantindo:
- **Resolução Infinita:** Perfeito para visualização em telas Retina e impressão física em alta definição (300+ DPI).
- **Link Direto de Validação:**
  ```text
  https://latteschain.vercel.app/validator?hash=<DOCUMENT_HASH_SHA256>
  ```
- **Folha Oficial de Certidão de Veracidade:** Integrada no [`/validator`](../src/app/validator/page.tsx) com estilos `@media print`, gerando certidões acadêmicas prontas para arquivamento ou anexação com o selo e o QR Code escaneável por qualquer smartphone.

---

## 4. Emissão em Lote (Batch Issuance via Planilha CSV)

Para atender à demanda de turmas com dezenas ou centenas de formandos:
1. **Template CSV Padronizado:** A IES pode baixar diretamente o modelo `modelo_emissao_lote_lattes_chain.csv` com as colunas:
   ```csv
   nome,cpf,email,curso,tipo_documento,carga_horaria,semestre
   ```
2. **Pré-visualização e Validação:** Os dados são validados em memória antes do envio.
3. **Ancoragem Sequencial com Barra de Progresso:** Feedback em tempo real com porcentagem concluída (`Progresso: 18 / 20 emitidos`).
4. **Relatório Imediato:** Cada registro processado exibe o link direto para inspeção no Solana Explorer.

---

## 5. Padrão Internacional W3C Verifiable Credentials (VC)

O validador público e o portal do estudante contam com o botão **Exportar W3C Credential (JSON-LD)**, que gera um arquivo `.json` aderente ao schema internacional:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
  ],
  "id": "urn:uuid:...",
  "type": ["VerifiableCredential", "AcademicCredential", "EduCoreAttestation"],
  "issuer": {
    "id": "did:solana:3xmiVKqEs25voqLmWRvrjrnGrkEDMqyXUstW34vwZWcH",
    "name": "Universidade Federal de Minas Gerais (UFMG)",
    "cnpj": "17217985000104"
  },
  "issuanceDate": "2026-09-06T22:00:00.000Z",
  "credentialSubject": {
    "id": "did:solana:student_wallet_address",
    "name": "Nome do Aluno",
    "course": "Engenharia de Software",
    "workloadHours": 3600
  },
  "proof": {
    "type": "SolanaAttestationService2024",
    "created": "2026-09-06T22:00:00.000Z",
    "proofPurpose": "assertionMethod",
    "solanaTxSignature": "5...",
    "documentHashSha256": "...",
    "verificationUrl": "https://latteschain.vercel.app/validator?hash=..."
  }
}
```

---

## 6. Governança e Privacidade LGPD (`/privacidade`)

### 6.1 Princípio do Zero-PII On-Chain
Nenhum Dado Pessoal Identificável (PII) é registrado no estado público da blockchain Solana. Apenas a função matemática unidirecional SHA-256 do arquivo original é ancorada. É tecnicamente inviável reverter o hash para obter nome, CPF ou histórico do estudante.

### 6.2 Página Institucional e Direitos do Titular
Criada a página oficial [`/privacidade`](../src/app/privacidade/page.tsx), vinculada ao rodapé global e no consentimento do formulário de cadastro, esclarecendo:
- Bases legais (Art. 7º, I, II e V da Lei 13.709/2018).
- Canal direto com o Encarregado de Dados (DPO) da Jovian Tech (`dpo@jovian.foo`).
- Exercício pleno dos direitos do titular (Art. 18 da LGPD).
