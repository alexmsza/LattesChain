# SAS skeleton — LattesChain

Cliente Python escrito à mão contra o **Solana Attestation Service (SAS)**,
sem SDK oficial (só existe em TS/Rust) e sem depender do pacote PyPI de
terceiros `saslibpy` (não auditado). Todo o layout de instruções/contas foi
extraído diretamente do [código-fonte oficial](https://github.com/solana-foundation/solana-attestation-service)
em 2026-08-29 — ver os comentários no topo de `sas_core.py` para as
referências exatas de arquivo/linha.

**Program ID (mesma em devnet e mainnet):**
`22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG`

## Por que assim (e não com `sas-lib` em TS)

O time manja de Go/Python/IA, não de Rust/TS. Em vez de forçar TypeScript
pra usar o SDK oficial, montamos as instruções manualmente em Python a
partir do código-fonte Rust do programa (que é open-source e legível) —
mesma técnica de reverse-engineering de IDL que builders sérios usam quando
não existe um client pronto na sua stack. É mais trabalho, mas é o que dá
"profundidade técnica on-chain" real pro pitch, em vez de só empacotar uma
lib de terceiros.

## ⚠️ Status honesto

Este código foi escrito lendo o source do programa, mas **não foi executado**
neste ambiente (sandbox sem Python real, Node, Go ou Solana CLI instalados —
só um stub do Windows Store). Antes da demo ao vivo:

1. Rode tudo numa máquina com Python 3.10+ de verdade.
2. `pip install -r requirements.txt`
3. Rode os scripts na ordem abaixo, **horas antes** da apresentação, não em
   cima da hora.
4. Se `04_issue_soulbound.py` falhar por espaço/rent insuficiente na conta
   do mint, aumente `MINT_ACCOUNT_SPACE` no topo do arquivo (não conseguimos
   validar o número exato sem rodar contra o programa real — ver o TODO no
   código).

## Ordem de Execução (com `uv`)

```bash
# Na raiz do projeto:
uv venv .venv
.venv\Scripts\activate
uv pip install -r sas/requirements.txt -r ai/requirements.txt

# Execução do pipeline SAS:
python sas/00_setup_wallets.py       # gera carteiras devnet (universidade + aluno)
python sas/01_create_credential.py   # universidade vira Issuer (Credential) no SAS
python sas/02_create_schema.py       # define o schema "disciplina_concluida_v1" e "diploma_v1"
python sas/03_issue_attestation.py   # emite atestação simples (trilha rápida, tipo "horas/disciplina")
python sas/05_verify.py disciplina   # "RH" verifica direto da chain -> PASS

python sas/04_issue_soulbound.py     # trilha "diploma": Token-2022 soulbound na carteira do aluno
python sas/05_verify.py diploma      # verifica o diploma tokenizado -> PASS
python sas/06_revoke.py              # universidade revoga (fraude/erro) -> token some
python sas/05_verify.py diploma      # verifica de novo -> FAIL

# Camada de IA (Multi-provedor ou Fallback local):
python ai/trust_report.py            # gera resumo de confiança para RH
python ai/equivalence_check.py       # analisa equivalência de ementa
```

O estado (pubkeys geradas a cada etapa) fica em `sas/.demo_state.json` (ignorado pelo git) —
apague esse arquivo para reiniciar a demonstração do zero.

## Modelo de dados

| Camada SAS | Papel no LattesChain |
| :--- | :--- |
| **Credential** | A universidade (issuer confiável), registrada 1x |
| **Schema** `disciplina_concluida_v1` | Disciplina cursada — trilha barata, sem token (~o SPL Memo do plano antigo) |
| **Schema** `diploma_v1` (tokenizado) | Diploma — trilha soulbound, Token-2022 non-transferable + permanent-delegate (substitui o Metaplex Core do plano antigo) |
| **Attestation** | Uma emissão individual pra um aluno — PDA determinística a partir de `(credential, schema, nonce)`; usamos `nonce = carteira do aluno` |

Ver `sas_core.py::DISCIPLINA_SCHEMA_*` e `DIPLOMA_SCHEMA_*` para os campos
exatos.

## Se algo quebrar na hora

- **Faucet devnet sem SOL**: https://faucet.solana.com (manual) ou trocar
  `EDUCORE_RPC_URL` pra um endpoint Helius devnet com faucet próprio.
- **`InvalidCredential`/`InvalidSchema`/`InvalidAttestation`**: PDA calculada
  no cliente não bateu com a esperada pelo programa — geralmente nome
  diferente do que foi usado na criação. Confira `sas/.demo_state.json`.
- **Erro de espaço em `04_issue_soulbound.py`**: ver nota acima sobre
  `MINT_ACCOUNT_SPACE`.
