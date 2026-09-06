# Documento Técnico 16: Especificação de Migração para Solana Mainnet-Beta & Relayer Gasless

**Protocolo:** LattesChain (EduCore Protocol)  
**Versão:** 1.5.0  
**Data:** Setembro de 2026  
**Responsável Técnico:** Alex Miqueias (Jovian Tech)  
**Status:** Planejado & Mainnet-Ready

---

## 1. Visão Geral da Transição Devnet → Mainnet-Beta

A **Solana Devnet** opera como ambiente de homologação e demonstração pública. Para viabilizar contratos comerciais com Instituições de Ensino Superior (IES) e operação corporativa contínua, o protocolo estabelece a transição para a **Solana Mainnet-Beta** sob quatro premissas:

1. **SLA e Resiliência:** Nenhuma dependência de endpoints públicos gratuitos da Solana.
2. **Zero Atrito Cripto (Gasless / Fee Payer):** Faculdades e alunos não compram nem manuseiam SOL diretamente.
3. **Custo Operacional Industrial:** Adoção de State Compression (Merkle Trees) para viabilizar emissões massivas abaixo de R$ 0,005 por diploma.
4. **Governança Segura:** Upgrade Authority dos smart contracts transferida para cofre multisig (Squads Protocol).

---

## 2. Topologia de Infraestrutura Mainnet

```text
  [ Aluno / IES / RH ]
           │
           │ Assinatura ed25519 (Chave Pública do Usuário)
           ▼
  [ LattesChain API Relayer ]
           │
           │ Injeção de feePayer Corporativo (Jovian Tech Infra Wallet)
           │ Injeção de ComputeBudget & Priority Fee
           ▼
  [ Cluster RPC Enterprise: Helius / QuickNode ]
           │
           │ WebSockets & Gossip
           ▼
  [ Solana Mainnet-Beta ]
     ├── Solana Attestation Service (SAS Program)
     ├── Token-2022 Soulbound Extensions
     └── Concurrent Merkle Trees (State Compression)
```

---

## 3. Especificação do Relayer Gasless (Fee Payer)

### 3.1 O Problema do Gás no Setor Educacional
Exigir que uma universidade federal ou privada mantenha saldo em criptomoeda (SOL) viola normas contábeis públicas e gera atrito burocrático com departamentos de compras.

### 3.2 Solução: Transações Patrocinadas
- O aluno ou a IES assina as instruções do documento com sua carteira (garantindo autoria e não-repúdio).
- A transação é enviada para o endpoint `/api/relayer/sponsor`.
- O servidor adiciona a assinatura de `feePayer` utilizando a chave corporativa da Jovian Tech.
- A taxa de rede em SOL é debitada da infraestrutura do protocolo.
- A faculdade é faturada em **Reais (BRL)** mensalmente via contrato SaaS.

---

## 4. Otimização de Custos via State Compression

| Tecnologia | Custo Médio por 100.000 Diplomas | Tempo de Ancoragem | Imutabilidade |
| :--- | :--- | :--- | :--- |
| **Token-2022 Clássico (Contas Individuais)** | ~200 SOL (~R$ 160.000,00) | Instantânea | 100% |
| **State Compression (Concurrent Merkle Trees)** | **~0.5 SOL (~R$ 400,00)** | Instantânea | 100% (Verificável por Prova de Merkle) |

Com State Compression, o LattesChain viabiliza o registro de colações de grau inteiras (5.000 a 20.000 formandos) por frações insignificantes de centavos de dólar.

---

## 5. Checklist para o Cutover de Produção

1. [ ] **Contratação de RPC**: Criação de conta corporativa Helius / QuickNode com endpoint Mainnet dedicado.
2. [ ] **Chave Fee Payer**: Provisionamento de carteira Solana com 2 a 5 SOL para cobertura operacional de gás.
3. [ ] **Deploy Anchor Mainnet**: Compilação verificável (`anchor build --verifiable`) e deploy do programa.
4. [ ] **Governança Squads**: Criação de cofre Multisig 3-de-5 e transferência da autoridade de upgrade.
5. [ ] **Cluster Switch**: Alteração das variáveis no ambiente Vercel:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK="mainnet-beta"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=CHAVE_AQUI"
   ```
6. [ ] **Validação E2E**: Teste de ponta a ponta com emissão real, validação por QR Code e verificação no Solscan.
