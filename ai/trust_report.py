"""
Camada de IA #1 — "Relatório de Confiança" para o Validador/RH.

Resolve a dor citada em context.md: "empregador não sabe ler blockchain".
Em vez de o RH olhar pubkeys e bytes crus, este script:
  1. Lê on-chain (via sas/) todas as atestações de um aluno que a demo
     conhece (disciplina + diploma).
  2. Roda as mesmas checagens de sas/05_verify.py (assinante autorizado,
     expiry, revogação).
  3. Manda o resultado estruturado pra um LLM (Claude) gerar um resumo em
     linguagem natural, pronto pra colar num painel de RH/ATS.

Isso é o diferencial "IA em cima da camada on-chain" que o time tem como
força (Go/Python/IA) e que poucos outros times do hackathon vão ter.

Uso:
    ANTHROPIC_API_KEY=... python trust_report.py
"""

from __future__ import annotations

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sas"))

from solders.pubkey import Pubkey  # noqa: E402

from sas_client import get_client  # noqa: E402
from sas_core import (  # noqa: E402
    decode_attestation,
    decode_credential,
    decode_diploma_attestation_data,
    decode_disciplina_attestation_data,
    find_attestation_pda,
)
import registry  # noqa: E402

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")


def collect_facts() -> dict:
    """Reaproveita a lógica de sas/05_verify.py mas junta tudo num dict só,
    pronto pra virar prompt — sem precisar reimplementar as checagens."""
    client = get_client()
    aluno_str = registry.require("aluno_pubkey")[0]
    aluno_pubkey = Pubkey.from_string(aluno_str)

    state = registry.load()
    facts = {"aluno_pubkey": aluno_str, "atestacoes": []}

    schemas_to_check = []
    if "credential_pubkey" in state and "schema_pubkey" in state:
        schemas_to_check.append(("disciplina", state["schema_pubkey"], decode_disciplina_attestation_data))
    if "credential_pubkey" in state and "diploma_schema_pubkey" in state:
        schemas_to_check.append(("diploma", state["diploma_schema_pubkey"], decode_diploma_attestation_data))

    if not schemas_to_check:
        raise RuntimeError("Nenhuma atestação conhecida — rode os scripts em sas/ primeiro.")

    credential_pubkey = Pubkey.from_string(state["credential_pubkey"])
    cred_acc = client.get_account_info(credential_pubkey).value
    credential = decode_credential(bytes(cred_acc.data)) if cred_acc else None
    facts["emissor_credential"] = state.get("credential_nome", state["credential_pubkey"])

    for tipo, schema_str, decoder in schemas_to_check:
        schema_pubkey = Pubkey.from_string(schema_str)
        attestation_pda, _ = find_attestation_pda(credential_pubkey, schema_pubkey, aluno_pubkey)
        acc = client.get_account_info(attestation_pda).value
        if acc is None:
            facts["atestacoes"].append({"tipo": tipo, "status": "nao_encontrada"})
            continue

        attestation = decode_attestation(bytes(acc.data))
        signer_ok = credential is not None and attestation.signer in credential.authorized_signers
        expiry_ok = attestation.expiry == 0 or attestation.expiry > int(time.time())
        revogavel_ativo = str(attestation.token_account) != "11111111111111111111111111111111"

        facts["atestacoes"].append(
            {
                "tipo": tipo,
                "status": "valida" if (signer_ok and expiry_ok) else "invalida",
                "assinante_autorizado": signer_ok,
                "nao_expirada": expiry_ok,
                "tokenizada_soulbound": revogavel_ativo,
                "dados": decoder(attestation.data),
                "endereco_onchain": str(attestation_pda),
            }
        )

    return facts


def render_prompt(facts: dict) -> str:
    import json

    return f"""Você é o motor de confiança do LattesChain, um validador de credenciais
acadêmicas construído sobre o Solana Attestation Service. Um RH acabou de
consultar as credenciais on-chain de um candidato. Os fatos abaixo já foram
verificados criptograficamente (assinatura do emissor autorizado, validade,
status de revogação) — você NÃO precisa reverificar nada, apenas traduzir
para um resumo curto e confiável em português para quem não entende de
blockchain.

Fatos verificados (JSON):
{json.dumps(facts, ensure_ascii=False, indent=2)}

Escreva um resumo de no máximo 120 palavras, em tom profissional, que:
- diga claramente se as credenciais são válidas ou não;
- cite o emissor (universidade) e o que foi verificado on-chain;
- se algo estiver revogado/expirado/inválido, destaque isso primeiro;
- não invente nenhum dado que não esteja no JSON.
"""


def main():
    facts = collect_facts()
    prompt = render_prompt(facts)

    from llm_client import complete_prompt

    print("=== Relatório de Confiança (gerado por IA a partir de fatos on-chain) ===\n")
    report = complete_prompt(prompt)
    print(report)


if __name__ == "__main__":
    main()

