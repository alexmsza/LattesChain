"""
Ator "Universidade": define o Schema "disciplina_concluida_v1" — o template
dos campos que toda atestação de disciplina vai carregar
(disciplina, carga_horaria, nota, semestre, ementa_hash).

Note o campo `ementa_hash`: a ementa completa (PDF/texto) fica off-chain;
on-chain só entra o hash SHA-256 dela. Esse é o trade-off de privacidade que
`context.md` (a conversa de planejamento) aponta como o detalhe que
demonstra maturidade de arquitetura para o júri — dado pesado/PII fora da
chain, prova criptográfica dentro.

Uso:
    python 02_create_schema.py
"""

from __future__ import annotations

import json
import os

from solders.keypair import Keypair

from sas_client import build_create_schema_ix, get_client, send_and_confirm
from sas_core import (
    DISCIPLINA_SCHEMA_FIELDS,
    DISCIPLINA_SCHEMA_LAYOUT,
    DISCIPLINA_SCHEMA_NAME,
    find_schema_pda,
)
from solders.pubkey import Pubkey
import registry


def load_kp(path: str) -> Keypair:
    with open(path) as f:
        return Keypair.from_bytes(bytes(json.load(f)))


def main():
    (credential_pubkey_str,) = registry.require("credential_pubkey")
    credential = Pubkey.from_string(credential_pubkey_str)

    keys_dir = os.path.join(os.path.dirname(__file__), "keys")
    universidade = load_kp(os.path.join(keys_dir, "universidade.json"))

    schema_pda, bump = find_schema_pda(credential, DISCIPLINA_SCHEMA_NAME, version=1)
    print(f"Schema PDA calculada: {schema_pda} (bump={bump})")
    print(f"Campos: {DISCIPLINA_SCHEMA_FIELDS}")
    print(f"Layout (tipos): {list(DISCIPLINA_SCHEMA_LAYOUT)}")

    ix = build_create_schema_ix(
        payer=universidade.pubkey(),
        authority=universidade.pubkey(),
        credential=credential,
        schema_pda=schema_pda,
        name=DISCIPLINA_SCHEMA_NAME,
        description="Disciplina de graduacao concluida com aproveitamento",
        layout=DISCIPLINA_SCHEMA_LAYOUT,
        field_names=DISCIPLINA_SCHEMA_FIELDS,
    )

    client = get_client()
    sig = send_and_confirm(client, universidade, ix)
    print(f"Schema criado on-chain. tx={sig}")
    print(f"https://explorer.solana.com/tx/{sig}?cluster=devnet")

    registry.save({"schema_pubkey": str(schema_pda)})


if __name__ == "__main__":
    main()
