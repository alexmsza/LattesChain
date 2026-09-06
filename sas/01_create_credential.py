"""
Ator "Universidade": registra-se como emissora confiável de atestações no
SAS (a peça "Credential" do modelo Credential -> Schema -> Attestation).

Isso é o equivalente on-chain de "esta pubkey é uma IES autorizada" — o
`MasterRegistry` que a arquitetura antiga (docs/03_smart_contracts_anchor.md)
propunha escrever do zero em Anchor já existe como primitiva nativa da
Solana (SAS), então não precisamos escrever nem auditar um smart contract
próprio para isso.

Uso:
    python 01_create_credential.py
"""

from __future__ import annotations

import json

from solders.keypair import Keypair
from solders.pubkey import Pubkey

from sas_client import build_create_credential_ix, get_client, send_and_confirm
from sas_core import find_credential_pda
import registry

UNIVERSIDADE_NOME = "Universidade Demo LattesChain"


def load_kp(path: str) -> Keypair:
    with open(path) as f:
        return Keypair.from_bytes(bytes(json.load(f)))


def main():
    import os

    keys_dir = os.path.join(os.path.dirname(__file__), "keys")
    universidade = load_kp(os.path.join(keys_dir, "universidade.json"))

    credential_pda, bump = find_credential_pda(universidade.pubkey(), UNIVERSIDADE_NOME)
    print(f"Credential PDA calculada: {credential_pda} (bump={bump})")

    # A própria universidade também é signatária autorizada a emitir
    # atestações (mais simples para a demo; em produção esse array poderia
    # incluir uma chave operacional separada da chave de admin).
    ix = build_create_credential_ix(
        payer=universidade.pubkey(),
        credential_pda=credential_pda,
        authority=universidade.pubkey(),
        name=UNIVERSIDADE_NOME,
        signers=[universidade.pubkey()],
    )

    client = get_client()
    sig = send_and_confirm(client, universidade, ix)
    print(f"Credential criada on-chain. tx={sig}")
    print(f"https://explorer.solana.com/tx/{sig}?cluster=devnet")

    registry.save(
        {
            "credential_pubkey": str(credential_pda),
            "credential_nome": UNIVERSIDADE_NOME,
        }
    )


if __name__ == "__main__":
    main()
