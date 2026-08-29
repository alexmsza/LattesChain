"""
Camada de IA #2 — motor de equivalência de créditos entre universidades.

Ideia (de context.md, direção #2 do brainstorm): duas IES que não confiam
plenamente uma na outra precisam decidir se uma disciplina cursada numa
conta como equivalente na outra. A ementa completa é dado pesado/privado e
fica off-chain (cada IES guarda a sua); on-chain só existe o hash SHA-256
dela, dentro da Attestation (ver sas/03_issue_attestation.py). Este script:

  1. Pega a Attestation da disciplina emitida pela "Universidade A" (via
     sas/) e o texto off-chain correspondente (aqui, simulado localmente —
     em produção seria uma consulta ao LMS da IES A).
  2. RECOMPUTA o hash do texto e confere contra o `ementa_hash` gravado
     on-chain — prova de integridade antes de mandar qualquer coisa pro LLM.
  3. Compara com a ementa (mockada) de uma "Universidade B" e pede pro
     Claude um veredito estruturado de equivalência.

Uso:
    ANTHROPIC_API_KEY=... python equivalence_check.py
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sas"))

from solders.pubkey import Pubkey  # noqa: E402

from sas_client import get_client  # noqa: E402
from sas_core import decode_attestation, decode_disciplina_attestation_data, find_attestation_pda  # noqa: E402
import registry  # noqa: E402

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")

# Mock da ementa da "Universidade B" — em produção viria do sistema
# acadêmico dela via API/zkTLS (fase 2 mencionada no relatório de ideação).
EMENTA_UNIVERSIDADE_B = {
    "instituicao": "Universidade B (mock)",
    "disciplina": "Algoritmos e Estruturas de Dados I",
    "carga_horaria": 72,
    "ementa": (
        "Análise de complexidade, estruturas lineares (listas, pilhas, filas), "
        "árvores binárias e balanceadas, tabelas de dispersão, grafos e "
        "principais algoritmos de busca, ordenação e percurso."
    ),
}


def fetch_disciplina_a_direto() -> dict:
    """Busca a Attestation da disciplina emitida pela universidade A (a que
    o sas/ já registrou) e confere o hash da ementa off-chain."""
    client = get_client()
    credential_str, schema_str, aluno_str = registry.require(
        "credential_pubkey", "schema_pubkey", "aluno_pubkey"
    )
    attestation_pda, _ = find_attestation_pda(
        Pubkey.from_string(credential_str), Pubkey.from_string(schema_str), Pubkey.from_string(aluno_str)
    )
    acc = client.get_account_info(attestation_pda).value
    if acc is None:
        raise RuntimeError("Attestation de disciplina não encontrada — rode sas/03_issue_attestation.py primeiro.")
    attestation = decode_attestation(bytes(acc.data))
    dados = decode_disciplina_attestation_data(attestation.data)

    # O texto real da ementa não fica on-chain (só o hash). Aqui, pra
    # demo, reusamos o mesmo texto que sas/03_issue_attestation.py usou —
    # em produção isso viria de uma consulta autenticada ao LMS da IES A.
    from importlib import import_module

    mod = import_module("03_issue_attestation")
    texto_offchain = mod.EMENTA_TEXTO_OFFCHAIN
    hash_recomputado = hashlib.sha256(texto_offchain.encode("utf-8")).hexdigest()

    integridade_ok = hash_recomputado == dados["ementa_hash"]

    return {
        "instituicao": registry.load().get("credential_nome", "Universidade A"),
        "disciplina": dados["disciplina"],
        "carga_horaria": dados["carga_horaria"],
        "ementa": texto_offchain,
        "ementa_hash_onchain": dados["ementa_hash"],
        "ementa_hash_recomputado": hash_recomputado,
        "integridade_onchain_ok": integridade_ok,
    }


def render_prompt(disciplina_a: dict, disciplina_b: dict) -> str:
    return f"""Você é um motor de equivalência de créditos acadêmicos entre duas
instituições que não têm um sistema compartilhado. Cada uma forneceu sua
ementa (a da Instituição A foi verificada criptograficamente contra um hash
gravado on-chain — campo `integridade_onchain_ok`).

Disciplina A (on-chain, íntegra={disciplina_a['integridade_onchain_ok']}):
{json.dumps(disciplina_a, ensure_ascii=False, indent=2)}

Disciplina B:
{json.dumps(disciplina_b, ensure_ascii=False, indent=2)}

Responda em JSON estrito com as chaves:
  "equivalente": true|false,
  "confianca_pct": 0-100,
  "carga_horaria_aproveitavel": <int, horas>,
  "justificativa": "<até 3 frases em português>"

Considere conteúdo programático e carga horária. Seja conservador: só marque
"equivalente": true se o conteúdo cobrir a maior parte da ementa B.
"""


def main():
    disciplina_a = fetch_disciplina_a_direto()
    prompt = render_prompt(disciplina_a, EMENTA_UNIVERSIDADE_B)

    try:
        import anthropic
    except ImportError:
        print("[aviso] pacote `anthropic` não instalado (`pip install anthropic`).")
        print("Dados coletados (sem veredito por IA):\n")
        print(json.dumps({"disciplina_a": disciplina_a, "disciplina_b": EMENTA_UNIVERSIDADE_B}, ensure_ascii=False, indent=2))
        return

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    print("=== Veredito de equivalência (IA) ===\n")
    print(resp.content[0].text)


if __name__ == "__main__":
    main()
