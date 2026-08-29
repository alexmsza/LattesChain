# Runbook da demo ao vivo

Preparação (fazer **antes**, não na frente do júri):

```bash
cd sas && pip install -r requirements.txt
cd ../ai && pip install -r requirements.txt
export ANTHROPIC_API_KEY=...          # pra ai/trust_report.py e equivalence_check.py
export EDUCORE_RPC_URL=...            # opcional: Helius/QuickNode devnet (senão usa o RPC público)
```

Rode a sequência inteira uma vez antes da apresentação pra confirmar que
passa (devnet pode estar congestionado; airdrop é rate-limited). Se algo
falhar, ver `sas/README.md` § "Se algo quebrar na hora".

## Sequência (comando → o que dizer)

| # | Comando | Fala |
| :-: | :--- | :--- |
| 1 | `python sas/00_setup_wallets.py` | "Aqui estão as duas carteiras da demo: a universidade e o aluno, na devnet real da Solana." |
| 2 | `python sas/01_create_credential.py` | "A universidade se registra como emissora confiável — isso é uma transação real on-chain, não um mock." *(mostrar o link do Explorer)* |
| 3 | `python sas/02_create_schema.py` | "Definimos o template dos dados de uma disciplina concluída — e reparem no campo `ementa_hash`: o conteúdo pesado fica fora da chain, só a prova entra." |
| 4 | `python sas/03_issue_attestation.py` | "A universidade emite a credencial pro aluno. Menos de um centavo de taxa." |
| 5 | `python sas/05_verify.py disciplina` | "Agora, sem pedir nada pra secretaria, qualquer um lê isso direto da chain e confere." → **PASS** |
| 6 | `python sas/04_issue_soulbound.py` | "Agora o diploma — esse é tokenizado de verdade: um token Token-2022 vai aparecer na carteira do aluno." *(abrir o Explorer/Phantom com a devnet)* |
| 7 | `python ai/trust_report.py` | "E aqui a nossa camada de IA traduz tudo isso pra linguagem de RH." |
| 8 | `python sas/06_revoke.py` | "Momento de virada: e se a universidade descobrir uma fraude? Ela revoga — sem precisar da assinatura do aluno." *(mostrar o token sumindo)* |
| 9 | `python sas/05_verify.py diploma` | "Verificando de novo..." → **FAIL** — "revogação garantida pelo protocolo, não por uma regra de aplicação que a gente escreveu." |
| 10 (bônus) | `python ai/equivalence_check.py` | "E se sobrar tempo: duas universidades decidindo automaticamente se um crédito é equivalente, com o conteúdo real verificado por hash on-chain." |

## Se o devnet estiver instável no dia

Tenha os links do Explorer das transações já rodadas com antecedência
salvos/abertos em abas — a narrativa funciona mesmo mostrando transações
gravadas minutos antes, não precisa ser 100% ao vivo se o RPC engasgar.
