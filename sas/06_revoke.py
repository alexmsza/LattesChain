"""
Ator "Universidade": revoga o diploma tokenizado do aluno (fraude
descoberta, erro de emissão, etc.). Fecha a Attestation e queima o token
Token-2022 — SEM precisar da assinatura do aluno, porque o mint foi
inicializado com `permanent delegate = sas_pda` (ver 04_issue_soulbound.py).

Momento forte pra demo ao vivo: mostrar o token sumindo da carteira/Explorer
do aluno em tempo real, e depois rodar `05_verify.py diploma` de novo pra
mostrar que agora dá FAIL.

Uso (depois de rodar 04):
    python 06_revoke.py
"""

from __future__ import annotations

import json
import os

from solders.keypair import Keypair
from solders.pubkey import Pubkey

from sas_client import build_close_tokenized_attestation_ix, get_client, send_and_confirm
import registry


def load_kp(path: str) -> Keypair:
    with open(path) as f:
        return Keypair.from_bytes(bytes(json.load(f)))


def main():
    (
        credential_str,
        attestation_str,
        attestation_mint_str,
        ata_str,
        sas_pda_str,
    ) = registry.require(
        "credential_pubkey",
        "diploma_attestation_pubkey",
        "diploma_attestation_mint_pubkey",
        "diploma_aluno_ata",
        "sas_pda",
    )

    keys_dir = os.path.join(os.path.dirname(__file__), "keys")
    universidade = load_kp(os.path.join(keys_dir, "universidade.json"))

    ix = build_close_tokenized_attestation_ix(
        payer=universidade.pubkey(),
        authority=universidade.pubkey(),
        credential=Pubkey.from_string(credential_str),
        attestation=Pubkey.from_string(attestation_str),
        attestation_mint=Pubkey.from_string(attestation_mint_str),
        sas_pda=Pubkey.from_string(sas_pda_str),
        attestation_token_account=Pubkey.from_string(ata_str),
    )

    client = get_client()
    sig = send_and_confirm(client, universidade, ix)
    print(f"Diploma revogado on-chain. tx={sig}")
    print(f"https://explorer.solana.com/tx/{sig}?cluster=devnet")
    print("Rode `python 05_verify.py diploma` de novo — agora deve dar FAIL.")


if __name__ == "__main__":
    main()
