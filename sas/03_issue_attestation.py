"""
Ator "Universidade" -> "Aluno": emite uma Attestation simples (trilha
"barata", sem token) para uma disciplina concluída pelo aluno.

Convenção usada aqui (documentada porque não é imposta pelo programa): o
`nonce` da atestação é a própria pubkey da carteira do aluno. O campo
`nonce` do SAS "pode ser aleatório OU associado à carteira de um usuário" —
usar a carteira do aluno como nonce torna a PDA da atestação *determinística*
a partir de (credential, schema, carteira do aluno), então o validador (ver
05_verify.py) não precisa escanear a chain: ele deriva o endereço
diretamente. Isso é o equivalente funcional da trilha "SPL Memo para
horas complementares" do ADR-007 antigo — barato, sem mint de token.

Uso:
    python 03_issue_attestation.py
"""

from __future__ import annotations

import hashlib
import json
import os

from solders.keypair import Keypair
from solders.pubkey import Pubkey

from sas_client import build_create_attestation_ix, get_client, send_and_confirm
from sas_core import encode_disciplina_attestation_data, find_attestation_pda
import registry

# Dado de exemplo — em produção viria do sistema acadêmico (LMS) da IES.
EMENTA_TEXTO_OFFCHAIN = (
    "Estruturas de Dados e Algoritmos: complexidade assintótica, listas, "
    "árvores, grafos, tabelas hash, algoritmos de ordenação e busca."
)


def load_kp(path: str) -> Keypair:
    with open(path) as f:
        return Keypair.from_bytes(bytes(json.load(f)))


def main():
    credential_str, schema_str, aluno_str = registry.require(
        "credential_pubkey", "schema_pubkey", "aluno_pubkey"
    )
    credential = Pubkey.from_string(credential_str)
    schema = Pubkey.from_string(schema_str)
    aluno_pubkey = Pubkey.from_string(aluno_str)

    keys_dir = os.path.join(os.path.dirname(__file__), "keys")
    universidade = load_kp(os.path.join(keys_dir, "universidade.json"))

    ementa_hash = hashlib.sha256(EMENTA_TEXTO_OFFCHAIN.encode("utf-8")).hexdigest()

    data_bytes = encode_disciplina_attestation_data(
        disciplina="Estruturas de Dados e Algoritmos",
        carga_horaria=60,
        nota=88,  # 8.8
        semestre="2026.1",
        ementa_hash=ementa_hash,
    )

    attestation_pda, bump = find_attestation_pda(credential, schema, aluno_pubkey)
    print(f"Attestation PDA calculada: {attestation_pda} (bump={bump})")
    print(f"ementa_hash (off-chain -> on-chain): {ementa_hash}")

    ix = build_create_attestation_ix(
        payer=universidade.pubkey(),
        authorized_signer=universidade.pubkey(),
        credential=credential,
        schema=schema,
        attestation_pda=attestation_pda,
        nonce=aluno_pubkey,
        data_bytes=data_bytes,
        expiry=0,  # nunca expira
    )

    client = get_client()
    sig = send_and_confirm(client, universidade, ix)
    print(f"Attestation emitida on-chain. tx={sig}")
    print(f"https://explorer.solana.com/tx/{sig}?cluster=devnet")

    registry.save(
        {
            "attestation_pubkey": str(attestation_pda),
            "attestation_ementa_texto": EMENTA_TEXTO_OFFCHAIN,
        }
    )


if __name__ == "__main__":
    main()
