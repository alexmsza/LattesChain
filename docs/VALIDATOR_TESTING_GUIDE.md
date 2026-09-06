# Guia de Testes com Validador Local e Gerador de Templates — LattesChain

Este documento descreve a arquitetura de testes locais do **LattesChain / EduCore**, inspirada nas melhores práticas do [create-solana-dapp](https://github.com/solana-foundation/create-solana-dapp) e [solana-foundation/templates](https://github.com/solana-foundation/templates).

---

## 1. Por que Validador Local com Clonagem?

O LattesChain possui duas dependências on-chain externas fundamentais:
1. **SPL Memo (`Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo`)**: consumido via CPI pela instrução `log_academic_event` dos smart contracts Anchor em `educore_contracts/`.
2. **Solana Attestation Service (`22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG`)**: consumido pelo pipeline de atestações acadêmicas e diplomas Token-2022 em `sas/`.

Se rodarmos um `solana-test-validator` padrão vazio, essas chamadas falharão. Com a **clonagem automática da Devnet**, o validador local faz o download desses programas uma única vez no boot e roda 100% offline, sem gastar faucets e com confirmação em milissegundos.

---

## 2. Comandos Rápidos no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm run validator:start` | Inicia o `solana-test-validator` clonando **Memo** e **SAS** da Devnet |
| `npm run validator:check` | Executa diagnóstico de saúde do validador e verifica programas clonados |
| `npm run validator:template -- <tipo> <nome>` | Gera um novo arquivo de teste customizado (anchor, python ou bankrun) |
| `npm run anchor:build` | Compila o programa Rust do EduCore no workspace Anchor |
| `npm run anchor:test` | Executa a suíte de testes Anchor contra o validador local ativo |

---

## 3. O Gerador de Templates (`scripts/validator-template-generator.mjs`)

O gerador automatiza a criação de novos cenários de teste, eliminando trabalho repetitivo com derivação de PDAs e setup de contas:

### Tipos de Template Disponíveis:

1. **`anchor`**: Cria um arquivo TypeScript em `educore_contracts/tests/<nome>.spec.ts` com setup de `Provider`, derivação de PDAs do `MasterRegistry` e `UniversityRecord`, e financiamento de keypair de teste.
   ```bash
   npm run validator:template -- anchor test_batch_emissions
   ```

2. **`python`**: Cria um arquivo de teste em `sas/tests/<nome>.py` configurado para apontar para `http://127.0.0.1:8899`, importando o cliente SAS de baixo nível.
   ```bash
   npm run validator:template -- python test_revocation_flow
   ```

3. **`bankrun`**: Cria um teste de execução ultra-rápida (in-memory, ~10ms) usando `solana-bankrun`, ideal para testes de CI leves.
   ```bash
   npm run validator:template -- bankrun test_isolated_runtime
   ```

---

## 4. Fluxo Completo de Desenvolvimento e Teste

### Passo 1: Iniciar o Validador Local
Em um terminal dedicado:
```bash
npm run validator:start
```
*(O validador iniciará na porta `8899`, clonando o SPL Memo e o SAS).*

### Passo 2: Validar o Ambiente
Em outro terminal:
```bash
npm run validator:check
```
Saída esperada:
```
✔ Validador ativo e respondendo!
  • Versão Solana : 1.18.x
  • Slot Atual    : 42
✔ [OK] SPL Memo Program
✔ [OK] Solana Attestation Service (SAS)
Ambiente pronto para testes Anchor e pipeline SAS local.
```

### Passo 3: Rodar os Testes Anchor (Rust / TypeScript)
```bash
npm run anchor:build
npm run anchor:test
```

### Passo 4: Rodar o Pipeline SAS em Python Localmente
Basta apontar a variável de ambiente para a porta local:
```bash
export EDUCORE_RPC_URL="http://127.0.0.1:8899"
python sas/00_setup_wallets.py
python sas/01_create_credential.py
python sas/02_create_schema.py
python sas/03_issue_attestation.py
python sas/05_verify.py disciplina
```

---

## 5. Como Usar como Template via `create-solana-dapp`

Este repositório está pronto para ser instanciado via CLI do `create-solana-dapp` usando qualquer branch ou fork do GitHub:

```bash
npx create-solana-dapp@latest -t <seu-usuario-github>/LattesChain
```
O `package.json` inclui as diretivas `"create-solana-dapp"` com as instruções pós-clone exibidas automaticamente para o usuário.
