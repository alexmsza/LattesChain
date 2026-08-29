"""
sas_core.py — Cliente Python "do zero" para o Solana Attestation Service (SAS).

Por que este arquivo existe: a Solana Foundation só publica SDK oficial em
TypeScript (`sas-lib`) e Rust. Não há SDK oficial em Python nem em Go. O time
deste hackathon manja de Go/Python/IA, não de Rust/TS — então, em vez de
depender de um pacote PyPI de terceiros não auditado (`saslibpy`), este módulo
fala DIRETO com o programa on-chain: monta as instruções manualmente (contas +
bytes), a partir da leitura do código-fonte real do programa.

Toda constante e todo layout de bytes abaixo foi extraído do repositório
oficial (lido em 2026-08-29):
  https://github.com/solana-foundation/solana-attestation-service
  - program/src/lib.rs            -> program ID
  - program/src/constants.rs      -> seeds das PDAs
  - program/src/instructions.rs   -> shape de cada instrução (ShankInstruction)
  - program/src/state/*.rs        -> layout de bytes das contas (Credential/Schema/Attestation)
  - program/src/processor/*.rs    -> ordem exata das contas em cada instrução

O programa NÃO é Anchor (é escrito com o framework "Pinocchio", mais leve) —
por isso os discriminators de instrução são 1 byte (não os 8 bytes do sighash
do Anchor) e não dá pra usar `anchorpy`. Os argumentos, porém, seguem
convenções compatíveis com Borsh (u32 LE de tamanho + bytes para
String/Vec<u8>/Vec<Pubkey>/Vec<String>), então a codificação abaixo é só isso,
sem lib externa de Borsh.

IMPORTANTE (honestidade técnica): este código foi escrito lendo o
código-fonte do programa, mas NÃO foi executado neste ambiente (sandbox sem
Python/Solana CLI instalados). Rodar `python 01_create_credential.py` etc. em
uma máquina com as dependências instaladas, numa carteira devnet com SOL,
ANTES da demo ao vivo. Ver sas/README.md.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass
from enum import IntEnum

from solders.pubkey import Pubkey

# ---------------------------------------------------------------------------
# Program & well-known IDs
# ---------------------------------------------------------------------------

SAS_PROGRAM_ID = Pubkey.from_string("22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG")
SYSTEM_PROGRAM_ID = Pubkey.from_string("11111111111111111111111111111111111111111")
TOKEN_2022_PROGRAM_ID = Pubkey.from_string("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")

# Seeds (program/src/constants.rs)
CREDENTIAL_SEED = b"credential"
SCHEMA_SEED = b"schema"
ATTESTATION_SEED = b"attestation"
SAS_SEED = b"sas"
EVENT_AUTHORITY_SEED = b"__event_authority"
SCHEMA_MINT_SEED = b"schemaMint"
ATTESTATION_MINT_SEED = b"attestationMint"

# Instruction discriminants (1 byte — program/src/instructions.rs)
IX_CREATE_CREDENTIAL = 0
IX_CREATE_SCHEMA = 1
IX_CHANGE_SCHEMA_STATUS = 2
IX_CHANGE_AUTHORIZED_SIGNERS = 3
IX_CHANGE_SCHEMA_DESCRIPTION = 4
IX_CHANGE_SCHEMA_VERSION = 5
IX_CREATE_ATTESTATION = 6
IX_CLOSE_ATTESTATION = 7
IX_TOKENIZE_SCHEMA = 9
IX_CREATE_TOKENIZED_ATTESTATION = 10
IX_CLOSE_TOKENIZED_ATTESTATION = 11

# Account discriminators (1 byte — program/src/state/discriminator.rs)
ACC_CREDENTIAL = 0
ACC_SCHEMA = 1
ACC_ATTESTATION = 2


class SchemaDataType(IntEnum):
    """program/src/state/schema.rs::SchemaDataTypes — só os tipos usados na demo."""

    U8 = 0
    U16 = 1
    U32 = 2
    U64 = 3
    I64 = 8
    BOOL = 10
    STRING = 12


# ---------------------------------------------------------------------------
# Codec — equivalente Borsh mínimo (sem dependência externa)
# ---------------------------------------------------------------------------


def enc_u8(v: int) -> bytes:
    return struct.pack("<B", v)


def enc_u16(v: int) -> bytes:
    return struct.pack("<H", v)


def enc_u64(v: int) -> bytes:
    return struct.pack("<Q", v)


def enc_i64(v: int) -> bytes:
    return struct.pack("<q", v)


def enc_bool(v: bool) -> bytes:
    return struct.pack("<B", 1 if v else 0)


def enc_bytes(b: bytes) -> bytes:
    """Vec<u8> / bytes cru do 'layout' do schema: u32 LE len + bytes."""
    return struct.pack("<I", len(b)) + b


def enc_string(s: str) -> bytes:
    """String: u32 LE len + utf8 bytes."""
    return enc_bytes(s.encode("utf-8"))


def enc_pubkey(p: Pubkey) -> bytes:
    return bytes(p)


def enc_pubkey_vec(pubkeys: list[Pubkey]) -> bytes:
    """Vec<Pubkey>: u32 LE count + 32 bytes cada."""
    out = struct.pack("<I", len(pubkeys))
    for p in pubkeys:
        out += enc_pubkey(p)
    return out


def enc_string_vec(strings: list[str]) -> bytes:
    """Vec<String>: u32 LE count + (u32 LE len + bytes) por item."""
    out = struct.pack("<I", len(strings))
    for s in strings:
        out += enc_string(s)
    return out


def dec_u8(data: bytes, off: int) -> tuple[int, int]:
    return data[off], off + 1


def dec_u16(data: bytes, off: int) -> tuple[int, int]:
    return struct.unpack_from("<H", data, off)[0], off + 2


def dec_i64(data: bytes, off: int) -> tuple[int, int]:
    return struct.unpack_from("<q", data, off)[0], off + 8


def dec_bytes(data: bytes, off: int) -> tuple[bytes, int]:
    n = struct.unpack_from("<I", data, off)[0]
    off += 4
    return data[off : off + n], off + n


def dec_string(data: bytes, off: int) -> tuple[str, int]:
    raw, off = dec_bytes(data, off)
    return raw.decode("utf-8"), off


def dec_pubkey(data: bytes, off: int) -> tuple[Pubkey, int]:
    return Pubkey.from_bytes(data[off : off + 32]), off + 32


# ---------------------------------------------------------------------------
# PDA derivation (mirrors program/src/processor/*.rs find_program_address calls)
# ---------------------------------------------------------------------------


def find_credential_pda(authority: Pubkey, name: str) -> tuple[Pubkey, int]:
    return Pubkey.find_program_address(
        [CREDENTIAL_SEED, bytes(authority), name.encode("utf-8")], SAS_PROGRAM_ID
    )


def find_schema_pda(credential: Pubkey, name: str, version: int = 1) -> tuple[Pubkey, int]:
    return Pubkey.find_program_address(
        [SCHEMA_SEED, bytes(credential), name.encode("utf-8"), bytes([version])],
        SAS_PROGRAM_ID,
    )


def find_attestation_pda(credential: Pubkey, schema: Pubkey, nonce: Pubkey) -> tuple[Pubkey, int]:
    return Pubkey.find_program_address(
        [ATTESTATION_SEED, bytes(credential), bytes(schema), bytes(nonce)], SAS_PROGRAM_ID
    )


def find_sas_pda() -> tuple[Pubkey, int]:
    return Pubkey.find_program_address([SAS_SEED], SAS_PROGRAM_ID)


def find_event_authority_pda() -> tuple[Pubkey, int]:
    return Pubkey.find_program_address([EVENT_AUTHORITY_SEED], SAS_PROGRAM_ID)


def find_schema_mint_pda(schema: Pubkey) -> tuple[Pubkey, int]:
    return Pubkey.find_program_address([SCHEMA_MINT_SEED, bytes(schema)], SAS_PROGRAM_ID)


def find_attestation_mint_pda(attestation: Pubkey) -> tuple[Pubkey, int]:
    return Pubkey.find_program_address(
        [ATTESTATION_MINT_SEED, bytes(attestation)], SAS_PROGRAM_ID
    )


def find_associated_token_address(wallet: Pubkey, mint: Pubkey) -> tuple[Pubkey, int]:
    """ATA padrão (mesma fórmula independente do token program dono do mint)."""
    return Pubkey.find_program_address(
        [bytes(wallet), bytes(TOKEN_2022_PROGRAM_ID), bytes(mint)],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    )


# ---------------------------------------------------------------------------
# Account state decoders (mirrors program/src/state/*.rs try_from_bytes)
# ---------------------------------------------------------------------------


@dataclass
class CredentialAccount:
    authority: Pubkey
    name: str
    authorized_signers: list[Pubkey]


@dataclass
class SchemaAccount:
    credential: Pubkey
    name: str
    description: str
    layout: bytes
    field_names: list[str]
    is_paused: bool
    version: int


@dataclass
class AttestationAccount:
    nonce: Pubkey
    credential: Pubkey
    schema: Pubkey
    data: bytes
    signer: Pubkey
    expiry: int
    token_account: Pubkey


def decode_credential(raw: bytes) -> CredentialAccount:
    if raw[0] != ACC_CREDENTIAL:
        raise ValueError("conta não é uma Credential SAS (discriminator mismatch)")
    off = 1
    authority, off = dec_pubkey(raw, off)
    name, off = dec_string(raw, off)
    n_signers = struct.unpack_from("<I", raw, off)[0]
    off += 4
    signers = []
    for _ in range(n_signers):
        pk, off = dec_pubkey(raw, off)
        signers.append(pk)
    return CredentialAccount(authority=authority, name=name, authorized_signers=signers)


def decode_schema(raw: bytes) -> SchemaAccount:
    if raw[0] != ACC_SCHEMA:
        raise ValueError("conta não é uma Schema SAS (discriminator mismatch)")
    off = 1
    credential, off = dec_pubkey(raw, off)
    name, off = dec_string(raw, off)
    description, off = dec_string(raw, off)
    layout, off = dec_bytes(raw, off)
    field_names_bytes, off = dec_bytes(raw, off)
    field_names = []
    fn_off = 0
    while fn_off < len(field_names_bytes):
        s, fn_off = dec_string(field_names_bytes, fn_off)
        field_names.append(s)
    is_paused = raw[off] == 1
    off += 1
    version = raw[off]
    return SchemaAccount(
        credential=credential,
        name=name,
        description=description,
        layout=layout,
        field_names=field_names,
        is_paused=is_paused,
        version=version,
    )


def decode_attestation(raw: bytes) -> AttestationAccount:
    if raw[0] != ACC_ATTESTATION:
        raise ValueError("conta não é uma Attestation SAS (discriminator mismatch)")
    off = 1
    nonce, off = dec_pubkey(raw, off)
    credential, off = dec_pubkey(raw, off)
    schema, off = dec_pubkey(raw, off)
    data, off = dec_bytes(raw, off)
    signer, off = dec_pubkey(raw, off)
    expiry, off = dec_i64(raw, off)
    token_account, off = dec_pubkey(raw, off)
    return AttestationAccount(
        nonce=nonce,
        credential=credential,
        schema=schema,
        data=data,
        signer=signer,
        expiry=expiry,
        token_account=token_account,
    )


# ---------------------------------------------------------------------------
# Schema da demo: "Disciplina Concluída" — disciplina, carga_horaria, nota,
# semestre, ementa_hash (SHA-256 hex da ementa off-chain).
# Espelha o exemplo do briefing de arquitetura (context.md): dado pesado/PII
# fica fora da chain; on-chain só a prova.
# ---------------------------------------------------------------------------

DISCIPLINA_SCHEMA_NAME = "disciplina_concluida_v1"
DISCIPLINA_SCHEMA_FIELDS = ["disciplina", "carga_horaria", "nota", "semestre", "ementa_hash"]
DISCIPLINA_SCHEMA_LAYOUT = bytes(
    [
        SchemaDataType.STRING,  # disciplina
        SchemaDataType.U16,  # carga_horaria (horas)
        SchemaDataType.U8,  # nota (0-100, ex.: 85 = 8.5)
        SchemaDataType.STRING,  # semestre (ex.: "2026.1")
        SchemaDataType.STRING,  # ementa_hash (sha256 hex da ementa, 64 chars)
    ]
)


def encode_disciplina_attestation_data(
    disciplina: str, carga_horaria: int, nota: int, semestre: str, ementa_hash: str
) -> bytes:
    """Codifica o payload da Attestation seguindo DISCIPLINA_SCHEMA_LAYOUT.
    Precisa bater exatamente com a ordem/tipos do schema, ou o programa
    rejeita em Attestation::validate_data."""
    return (
        enc_string(disciplina)
        + enc_u16(carga_horaria)
        + enc_u8(nota)
        + enc_string(semestre)
        + enc_string(ementa_hash)
    )


def decode_disciplina_attestation_data(raw: bytes) -> dict:
    off = 0
    disciplina, off = dec_string(raw, off)
    carga_horaria, off = dec_u16(raw, off)
    nota, off = dec_u8(raw, off)
    semestre, off = dec_string(raw, off)
    ementa_hash, off = dec_string(raw, off)
    return {
        "disciplina": disciplina,
        "carga_horaria": carga_horaria,
        "nota": nota,
        "semestre": semestre,
        "ementa_hash": ementa_hash,
    }


# ---------------------------------------------------------------------------
# Segundo schema: "Diploma" — trilha tokenizada/soulbound (ADR-007 antigo
# dizia "Memo p/ horas + Metaplex Core p/ diploma"; aqui o equivalente
# nativo é "Attestation simples p/ horas + Tokenized Attestation p/
# diploma", trocando Metaplex Core por Token-2022 non-transferable +
# permanent-delegate, que já vem de fábrica no SAS).
# ---------------------------------------------------------------------------

DIPLOMA_SCHEMA_NAME = "diploma_v1"
DIPLOMA_SCHEMA_FIELDS = ["curso", "data_conclusao", "diploma_hash"]
DIPLOMA_SCHEMA_LAYOUT = bytes(
    [
        SchemaDataType.STRING,  # curso
        SchemaDataType.STRING,  # data_conclusao (ISO, ex.: "2026-12-15")
        SchemaDataType.STRING,  # diploma_hash (sha256 hex do PDF do diploma)
    ]
)


def encode_diploma_attestation_data(curso: str, data_conclusao: str, diploma_hash: str) -> bytes:
    return enc_string(curso) + enc_string(data_conclusao) + enc_string(diploma_hash)


def decode_diploma_attestation_data(raw: bytes) -> dict:
    off = 0
    curso, off = dec_string(raw, off)
    data_conclusao, off = dec_string(raw, off)
    diploma_hash, off = dec_string(raw, off)
    return {"curso": curso, "data_conclusao": data_conclusao, "diploma_hash": diploma_hash}
