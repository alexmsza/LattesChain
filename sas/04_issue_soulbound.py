"""
Ator "Universidade" -> "Aluno": trilha do DIPLOMA — cria o schema "diploma",
"tokeniza" esse schema (habilita mint de tokens Token-2022 pra ele) e emite
uma Attestation tokenizada: um token Token-2022 de fato aparece na carteira
do aluno (Phantom mostra ele), com duas extensões que respondem à pergunta
clássica do júri "o que impede o aluno de vender o diploma?":

  - NonTransferable  -> a própria transação de transferência é rejeitada
                        pelo token program, não é regra de aplicação.
  - PermanentDelegate -> a universidade (via `sas_pda`, autoridade do
                        programa) pode revogar/queimar o token depois,
                        sem precisar da assinatura do aluno (ver
                        06_revoke.py). A Solana até loga um aviso na
                        criação da conta avisando que isso é possível —
                        transparência embutida no protocolo.

Uso (depois de rodar 00, 01 e 03):
    python 04_issue_soulbound.py
"""

from __future__ import annotations

import hashlib
import json
import os

from solders.keypair import Keypair
from solders.pubkey import Pubkey

from sas_client import (
    build_create_schema_ix,
    build_create_tokenized_attestation_ix,
    build_tokenize_schema_ix,
    get_client,
    send_and_confirm,
)
from sas_core import (
    DIPLOMA_SCHEMA_FIELDS,
    DIPLOMA_SCHEMA_LAYOUT,
    DIPLOMA_SCHEMA_NAME,
    encode_diploma_attestation_data,
    find_associated_token_address,
    find_attestation_mint_pda,
    find_attestation_pda,
    find_sas_pda,
    find_schema_mint_pda,
    find_schema_pda,
)
import registry

# TODO(equipe): não validamos este número contra o programa real (sandbox
# sem Solana CLI/Python). E' um chute generoso para caber Mint base +
# extensões (GroupMemberPointer, NonTransferable, MetadataPointer,
# PermanentDelegate, MintCloseAuthority) + TokenMetadata (name/symbol/uri +
# 2 campos custom "attestation"/"schema" em base58, ~44 chars cada). Se a tx
# falhar com erro de espaço/rent insuficiente, aumente este valor.
MINT_ACCOUNT_SPACE = 1024

DIPLOMA_URI_PLACEHOLDER = "https://example.com/lattes-chain/diploma-metadata.json"


def load_kp(path: str) -> Keypair:
    with open(path) as f:
        return Keypair.from_bytes(bytes(json.load(f)))


def main():
    credential_str, aluno_str = registry.require("credential_pubkey", "aluno_pubkey")
    credential = Pubkey.from_string(credential_str)
    aluno_pubkey = Pubkey.from_string(aluno_str)

    keys_dir = os.path.join(os.path.dirname(__file__), "keys")
    universidade = load_kp(os.path.join(keys_dir, "universidade.json"))

    client = get_client()

    # 1) Schema "diploma" (separado do schema "disciplina" para não colidir
    #    PDAs de attestation quando o nonce = carteira do aluno em ambos).
    schema_pda, _ = find_schema_pda(credential, DIPLOMA_SCHEMA_NAME, version=1)
    print(f"[1/3] Schema 'diploma' PDA: {schema_pda}")
    ix_schema = build_create_schema_ix(
        payer=universidade.pubkey(),
        authority=universidade.pubkey(),
        credential=credential,
        schema_pda=schema_pda,
        name=DIPLOMA_SCHEMA_NAME,
        description="Diploma de graduacao — soulbound, revogavel pela IES",
        layout=DIPLOMA_SCHEMA_LAYOUT,
        field_names=DIPLOMA_SCHEMA_FIELDS,
    )
    sig1 = send_and_confirm(client, universidade, ix_schema)
    print(f"       tx={sig1}")

    # 2) Tokenizar o schema (cria o mint "de grupo" — 1x por schema).
    schema_mint_pda, _ = find_schema_mint_pda(schema_pda)
    sas_pda, _ = find_sas_pda()
    print(f"[2/3] Tokenizando schema. schema_mint={schema_mint_pda} sas_pda={sas_pda}")
    ix_tokenize = build_tokenize_schema_ix(
        payer=universidade.pubkey(),
        authority=universidade.pubkey(),
        credential=credential,
        schema=schema_pda,
        schema_mint_pda=schema_mint_pda,
        sas_pda=sas_pda,
        max_size=1000,  # quantos diplomas esse schema pode tokenizar no total
    )
    sig2 = send_and_confirm(client, universidade, ix_tokenize)
    print(f"       tx={sig2}")

    # 3) Emitir a Attestation tokenizada (soulbound) para o aluno.
    attestation_pda, _ = find_attestation_pda(credential, schema_pda, aluno_pubkey)
    attestation_mint_pda, _ = find_attestation_mint_pda(attestation_pda)
    recipient_ata, _ = find_associated_token_address(aluno_pubkey, attestation_mint_pda)

    diploma_texto = "Bacharelado em Ciencia da Computacao — Universidade Demo LattesChain"
    diploma_hash = hashlib.sha256(diploma_texto.encode("utf-8")).hexdigest()
    data_bytes = encode_diploma_attestation_data(
        curso="Bacharelado em Ciencia da Computacao",
        data_conclusao="2026-12-15",
        diploma_hash=diploma_hash,
    )

    print(f"[3/3] Attestation (diploma) PDA: {attestation_pda}")
    print(f"       attestation_mint: {attestation_mint_pda}")
    print(f"       ATA do aluno:     {recipient_ata}")

    ix_attest = build_create_tokenized_attestation_ix(
        payer=universidade.pubkey(),
        authorized_signer=universidade.pubkey(),
        credential=credential,
        schema=schema_pda,
        attestation_pda=attestation_pda,
        schema_mint=schema_mint_pda,
        attestation_mint_pda=attestation_mint_pda,
        sas_pda=sas_pda,
        recipient_token_account=recipient_ata,
        recipient=aluno_pubkey,
        nonce=aluno_pubkey,
        data_bytes=data_bytes,
        name="Diploma LattesChain",
        uri=DIPLOMA_URI_PLACEHOLDER,
        symbol="LCDIP",
        mint_account_space=MINT_ACCOUNT_SPACE,
        expiry=0,
    )
    sig3 = send_and_confirm(client, universidade, ix_attest)
    print(f"       tx={sig3}")
    print(f"       https://explorer.solana.com/tx/{sig3}?cluster=devnet")
    print(
        "\nToken soulbound mintado na carteira do aluno. Confira em "
        f"https://explorer.solana.com/address/{aluno_pubkey}?cluster=devnet "
        "(ou no Phantom, rede Devnet)."
    )

    registry.save(
        {
            "diploma_schema_pubkey": str(schema_pda),
            "diploma_schema_mint_pubkey": str(schema_mint_pda),
            "diploma_attestation_pubkey": str(attestation_pda),
            "diploma_attestation_mint_pubkey": str(attestation_mint_pda),
            "diploma_aluno_ata": str(recipient_ata),
            "sas_pda": str(sas_pda),
        }
    )


if __name__ == "__main__":
    main()
