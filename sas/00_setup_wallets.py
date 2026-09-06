"""
Ator "infraestrutura": gera (ou carrega) as duas carteiras devnet usadas na
demo — a Universidade (issuer/authority) e o Aluno (holder) — e pede airdrop
de SOL de teste. Rode isso primeiro.

Uso:
    python 00_setup_wallets.py
"""

from __future__ import annotations

import os
import time

from solders.keypair import Keypair

from sas_client import get_client
import registry

KEYS_DIR = os.path.join(os.path.dirname(__file__), "keys")


def load_or_create(name: str) -> Keypair:
    os.makedirs(KEYS_DIR, exist_ok=True)
    path = os.path.join(KEYS_DIR, f"{name}.json")
    if os.path.exists(path):
        import json

        with open(path) as f:
            return Keypair.from_bytes(bytes(json.load(f)))
    kp = Keypair()
    import json

    with open(path, "w") as f:
        json.dump(list(bytes(kp)), f)
    return kp


def airdrop(client, pubkey, sol=1.0):
    try:
        sig = client.request_airdrop(pubkey, int(sol * 1_000_000_000)).value
        client.confirm_transaction(sig)
        print(f"  airdrop de {sol} SOL confirmado ({sig})")
    except Exception as e:  # devnet faucet é rate-limited / instável
        print(f"  [aviso] airdrop falhou ({e}) — use https://faucet.solana.com manualmente")


def main():
    client = get_client()

    universidade = load_or_create("universidade")
    aluno = load_or_create("aluno")

    print(f"Universidade (issuer/authority): {universidade.pubkey()}")
    print(f"Aluno (holder):                  {aluno.pubkey()}")

    for name, kp in [("universidade", universidade), ("aluno", aluno)]:
        bal = client.get_balance(kp.pubkey()).value
        print(f"  saldo {name}: {bal / 1_000_000_000} SOL")
        if bal < 200_000_000:  # < 0.2 SOL
            print(f"  pedindo airdrop para {name}...")
            airdrop(client, kp.pubkey())
            time.sleep(1)

    registry.save(
        {
            "universidade_pubkey": str(universidade.pubkey()),
            "aluno_pubkey": str(aluno.pubkey()),
        }
    )
    print("\nOK — chaves em sas/keys/*.json, pubkeys salvas em sas/.demo_state.json")


if __name__ == "__main__":
    main()
