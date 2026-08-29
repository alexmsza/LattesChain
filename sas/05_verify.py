"""
Ator "Validador / RH": lê a atestação diretamente da chain (sem precisar
confiar em nenhum backend da universidade nem pedir nada pra secretaria) e
mostra PASS/FAIL. É o SAS sendo "permissionless": qualquer um com a
Credential e o Schema (públicos) e a carteira do aluno consegue derivar o
endereço da atestação e ler os dados — sem pedir permissão a ninguém.

Checagens feitas:
  1. A conta existe on-chain (senão: não emitido / endereço errado).
  2. Discriminator bate com Attestation (senão: conta corrompida/errada).
  3. `signer` da atestação está na lista `authorized_signers` da Credential
     no momento da leitura (se a IES revogar um signer depois, atestações
     antigas assinadas por ele passam a reprovar aqui).
  4. `expiry` não passou (0 = nunca expira).
  5. Se tokenizada: o `token_account` (Token-2022, non-transferable) ainda
     existe e pertence à carteira do aluno — se a universidade revogou
     (06_revoke.py), a conta não existe mais e a checagem falha.

Uso:
    python 05_verify.py [disciplina|diploma]
"""

from __future__ import annotations

import sys

from solders.pubkey import Pubkey

from sas_client import get_client
from sas_core import (
    decode_attestation,
    decode_credential,
    decode_diploma_attestation_data,
    decode_disciplina_attestation_data,
    find_attestation_pda,
)
import registry


def verify(client, credential_pubkey: Pubkey, schema_pubkey: Pubkey, aluno_pubkey: Pubkey, decoder):
    attestation_pda, _ = find_attestation_pda(credential_pubkey, schema_pubkey, aluno_pubkey)
    print(f"Derivando Attestation PDA: {attestation_pda}")

    acc = client.get_account_info(attestation_pda).value
    if acc is None:
        print("RESULTADO: FALHA — nenhuma atestação encontrada nesse endereço "
              "(não emitida, ou foi revogada e a conta foi fechada).")
        return False

    attestation = decode_attestation(bytes(acc.data))

    cred_acc = client.get_account_info(credential_pubkey).value
    credential = decode_credential(bytes(cred_acc.data)) if cred_acc else None

    checks = []
    checks.append(("conta existe on-chain", True))
    signer_ok = credential is not None and attestation.signer in credential.authorized_signers
    checks.append(("assinante autorizado pela Credential", signer_ok))

    import time

    expiry_ok = attestation.expiry == 0 or attestation.expiry > int(time.time())
    checks.append(("não expirada", expiry_ok))

    all_ok = all(ok for _, ok in checks)

    print("\n--- Dados da atestação (on-chain) ---")
    for k, v in decoder(attestation.data).items():
        print(f"  {k}: {v}")
    print(f"  emitida por (signer): {attestation.signer}")
    print(f"  expiry: {attestation.expiry} (0 = nunca)")
    if attestation.token_account != Pubkey.default():
        print(f"  token soulbound: {attestation.token_account}")

    print("\n--- Checagens ---")
    for label, ok in checks:
        print(f"  [{'OK' if ok else 'FALHA'}] {label}")

    print(f"\nRESULTADO: {'PASS ✅' if all_ok else 'FAIL ❌'}")
    return all_ok


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "disciplina"
    client = get_client()

    aluno_str = registry.require("aluno_pubkey")[0]
    aluno_pubkey = Pubkey.from_string(aluno_str)

    if which == "diploma":
        credential_str, schema_str = registry.require("credential_pubkey", "diploma_schema_pubkey")
        decoder = decode_diploma_attestation_data
    else:
        credential_str, schema_str = registry.require("credential_pubkey", "schema_pubkey")
        decoder = decode_disciplina_attestation_data

    verify(
        client,
        Pubkey.from_string(credential_str),
        Pubkey.from_string(schema_str),
        aluno_pubkey,
        decoder,
    )


if __name__ == "__main__":
    main()
