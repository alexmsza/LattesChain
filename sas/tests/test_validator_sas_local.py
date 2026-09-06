"""
test_validator_sas_local.py — Teste de Validador Local para Solana Attestation Service (SAS)

Executa contra o validador local clonado (http://127.0.0.1:8899).
"""

import os
import sys
from pathlib import Path

# Adiciona o diretório sas ao path para importar sas_client e sas_core
SAS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SAS_DIR))

# Força URL do validador local se não especificada
os.environ.setdefault("EDUCORE_RPC_URL", "http://127.0.0.1:8899")

from sas_client import get_client, DEVNET_URL
from sas_core import SAS_PROGRAM_ID

def test_local_validator_connection():
    client = get_client()
    version = client.get_version()
    print(f"✔ Conectado ao Validador: {version.value}")
    
    # Verifica se o programa SAS está presente no validador
    acc_info = client.get_account_info(SAS_PROGRAM_ID)
    assert acc_info.value is not None, "Programa SAS não encontrado! Execute com programas clonados."
    assert acc_info.value.executable, "Conta SAS não está marcada como executável!"
    print(f"✔ Programa SAS {SAS_PROGRAM_ID} presente e executável no validador local!")

if __name__ == "__main__":
    print("=== Executando Teste SAS Local ===")
    test_local_validator_connection()
    print("=== Teste Concluído com Sucesso ===")
