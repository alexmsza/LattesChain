"""Persistência simples entre os scripts numerados da demo (cada um roda como
processo separado). Nada de banco de dados — é um "esqueleto", não um
produto: um JSON local em sas/.demo_state.json guarda as pubkeys geradas em
cada etapa para a próxima etapa (e para o roteiro de apresentação) usar."""

from __future__ import annotations

import json
import os

_PATH = os.path.join(os.path.dirname(__file__), ".demo_state.json")


def load() -> dict:
    if os.path.exists(_PATH):
        with open(_PATH) as f:
            return json.load(f)
    return {}


def save(patch: dict) -> dict:
    state = load()
    state.update(patch)
    with open(_PATH, "w") as f:
        json.dump(state, f, indent=2)
    return state


def require(*keys: str) -> list[str]:
    state = load()
    missing = [k for k in keys if k not in state]
    if missing:
        raise RuntimeError(
            f"Faltam chaves no estado da demo: {missing}. Rode os scripts anteriores primeiro "
            f"(veja sas/README.md) — estado atual: {list(state.keys())}"
        )
    return [state[k] for k in keys]
