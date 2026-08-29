"""
sas_client.py — instruction builders + helper de envio de transação para o SAS.

Depende só de `solders` + `solana` (RPC). Nenhum SDK do SAS é usado —
as instruções são montadas à mão a partir do layout descrito em sas_core.py
(que por sua vez cita a linha do código-fonte oficial de onde cada detalhe
veio). Ver sas/README.md para setup.
"""

from __future__ import annotations

import os

from solders.instruction import AccountMeta, Instruction
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed

from sas_core import (
    ASSOCIATED_TOKEN_PROGRAM_ID,
    IX_CLOSE_TOKENIZED_ATTESTATION,
    IX_CREATE_ATTESTATION,
    IX_CREATE_CREDENTIAL,
    IX_CREATE_SCHEMA,
    IX_CREATE_TOKENIZED_ATTESTATION,
    IX_TOKENIZE_SCHEMA,
    SAS_PROGRAM_ID,
    SYSTEM_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    enc_bytes,
    enc_i64,
    enc_pubkey,
    enc_pubkey_vec,
    enc_string,
    enc_string_vec,
    enc_u16,
    enc_u64,
    find_event_authority_pda,
)

DEVNET_URL = "https://api.devnet.solana.com"


def get_client() -> Client:
    """RPC devnet. Defina EDUCORE_RPC_URL para trocar por Helius/QuickNode devnet."""
    return Client(os.environ.get("EDUCORE_RPC_URL", DEVNET_URL))


def load_keypair(env_var: str, generate_if_missing_path: str | None = None) -> Keypair:
    """Carrega uma keypair de um caminho apontado por variável de ambiente
    (arquivo JSON no formato `solana-keygen`, array de 64 bytes). Se não
    existir e `generate_if_missing_path` for passado, gera uma nova e salva
    (conveniente para atores de demo tipo "aluno-teste")."""
    path = os.environ.get(env_var)
    if path and os.path.exists(path):
        import json

        with open(path) as f:
            raw = json.load(f)
        return Keypair.from_bytes(bytes(raw))

    if generate_if_missing_path:
        kp = Keypair()
        import json

        with open(generate_if_missing_path, "w") as f:
            json.dump(list(bytes(kp)), f)
        print(f"[sas_client] gerou nova keypair em {generate_if_missing_path} — funde com faucet devnet antes de usar como payer")
        return kp

    raise RuntimeError(
        f"Defina {env_var} apontando para um keypair JSON (solana-keygen new -o <arquivo>)"
    )


def send_and_confirm(client: Client, payer: Keypair, ix: Instruction, extra_signers: list[Keypair] | None = None):
    """Monta, assina e envia uma única instrução. Skeleton simples — sem
    retry/backoff sofisticado, suficiente para o roteiro de demo."""
    signers = [payer] + (extra_signers or [])
    latest = client.get_latest_blockhash().value.blockhash
    tx = Transaction.new_signed_with_payer(
        [ix], payer.pubkey(), signers, latest
    )
    sig = client.send_transaction(tx).value
    client.confirm_transaction(sig, commitment=Confirmed)
    return sig


# ---------------------------------------------------------------------------
# Instruction builders (contas + args na ORDEM EXATA do processor Rust)
# ---------------------------------------------------------------------------


def build_create_credential_ix(
    payer: Pubkey, credential_pda: Pubkey, authority: Pubkey, name: str, signers: list[Pubkey]
) -> Instruction:
    data = bytes([IX_CREATE_CREDENTIAL]) + enc_string(name) + enc_pubkey_vec(signers)
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(credential_pda, is_signer=False, is_writable=True),
        AccountMeta(authority, is_signer=True, is_writable=False),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)


def build_create_schema_ix(
    payer: Pubkey,
    authority: Pubkey,
    credential: Pubkey,
    schema_pda: Pubkey,
    name: str,
    description: str,
    layout: bytes,
    field_names: list[str],
) -> Instruction:
    data = (
        bytes([IX_CREATE_SCHEMA])
        + enc_string(name)
        + enc_string(description)
        + enc_bytes(layout)
        + enc_string_vec(field_names)
    )
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(authority, is_signer=True, is_writable=False),
        AccountMeta(credential, is_signer=False, is_writable=False),
        AccountMeta(schema_pda, is_signer=False, is_writable=True),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)


def build_create_attestation_ix(
    payer: Pubkey,
    authorized_signer: Pubkey,
    credential: Pubkey,
    schema: Pubkey,
    attestation_pda: Pubkey,
    nonce: Pubkey,
    data_bytes: bytes,
    expiry: int = 0,
) -> Instruction:
    data = bytes([IX_CREATE_ATTESTATION]) + enc_pubkey(nonce) + enc_bytes(data_bytes) + enc_i64(expiry)
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(authorized_signer, is_signer=True, is_writable=False),
        AccountMeta(credential, is_signer=False, is_writable=False),
        AccountMeta(schema, is_signer=False, is_writable=False),
        AccountMeta(attestation_pda, is_signer=False, is_writable=True),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)


def build_tokenize_schema_ix(
    payer: Pubkey,
    authority: Pubkey,
    credential: Pubkey,
    schema: Pubkey,
    schema_mint_pda: Pubkey,
    sas_pda: Pubkey,
    max_size: int,
) -> Instruction:
    data = bytes([IX_TOKENIZE_SCHEMA]) + enc_u64(max_size)
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(authority, is_signer=True, is_writable=False),
        AccountMeta(credential, is_signer=False, is_writable=False),
        AccountMeta(schema, is_signer=False, is_writable=False),
        AccountMeta(schema_mint_pda, is_signer=False, is_writable=True),
        AccountMeta(sas_pda, is_signer=False, is_writable=False),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(TOKEN_2022_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)


def build_create_tokenized_attestation_ix(
    payer: Pubkey,
    authorized_signer: Pubkey,
    credential: Pubkey,
    schema: Pubkey,
    attestation_pda: Pubkey,
    schema_mint: Pubkey,
    attestation_mint_pda: Pubkey,
    sas_pda: Pubkey,
    recipient_token_account: Pubkey,
    recipient: Pubkey,
    nonce: Pubkey,
    data_bytes: bytes,
    name: str,
    uri: str,
    symbol: str,
    mint_account_space: int,
    expiry: int = 0,
) -> Instruction:
    data = (
        bytes([IX_CREATE_TOKENIZED_ATTESTATION])
        + enc_pubkey(nonce)
        + enc_bytes(data_bytes)
        + enc_i64(expiry)
        + enc_string(name)
        + enc_string(uri)
        + enc_string(symbol)
        + enc_u16(mint_account_space)
    )
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(authorized_signer, is_signer=True, is_writable=False),
        AccountMeta(credential, is_signer=False, is_writable=False),
        AccountMeta(schema, is_signer=False, is_writable=False),
        AccountMeta(attestation_pda, is_signer=False, is_writable=True),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(schema_mint, is_signer=False, is_writable=True),
        AccountMeta(attestation_mint_pda, is_signer=False, is_writable=True),
        AccountMeta(sas_pda, is_signer=False, is_writable=False),
        AccountMeta(recipient_token_account, is_signer=False, is_writable=True),
        AccountMeta(recipient, is_signer=False, is_writable=False),
        AccountMeta(TOKEN_2022_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(ASSOCIATED_TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)


def build_close_tokenized_attestation_ix(
    payer: Pubkey,
    authority: Pubkey,
    credential: Pubkey,
    attestation: Pubkey,
    attestation_mint: Pubkey,
    sas_pda: Pubkey,
    attestation_token_account: Pubkey,
) -> Instruction:
    """Revogação: só a `authority` da Credential (a universidade) pode
    chamar isso — é o mecanismo de 'permanent delegate' do Token-2022 que
    responde à pergunta clássica do júri: 'e se a universidade errar / for
    fraude?'. O token some da carteira do aluno sem a assinatura dele."""
    event_authority, _ = find_event_authority_pda()
    data = bytes([IX_CLOSE_TOKENIZED_ATTESTATION])
    accounts = [
        AccountMeta(payer, is_signer=True, is_writable=True),
        AccountMeta(authority, is_signer=True, is_writable=False),
        AccountMeta(credential, is_signer=False, is_writable=False),
        AccountMeta(attestation, is_signer=False, is_writable=True),
        AccountMeta(event_authority, is_signer=False, is_writable=False),
        AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(SAS_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(attestation_mint, is_signer=False, is_writable=True),
        AccountMeta(sas_pda, is_signer=False, is_writable=False),
        AccountMeta(attestation_token_account, is_signer=False, is_writable=True),
        AccountMeta(TOKEN_2022_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    return Instruction(SAS_PROGRAM_ID, data, accounts)
