"""Engine registry. Add a new engine by implementing an EngineAdapter and listing it here."""

from app.integrations.activepieces import ActivepiecesAdapter
from app.integrations.base import EngineAdapter
from app.integrations.n8n import N8nAdapter
from app.integrations.zapier import ZapierAdapter

_ADAPTERS: dict[str, EngineAdapter] = {
    adapter.engine: adapter
    for adapter in (ZapierAdapter(), N8nAdapter(), ActivepiecesAdapter())
}


def get_adapter(engine: str) -> EngineAdapter | None:
    return _ADAPTERS.get(engine)


def available_engines() -> list[dict]:
    return [{"engine": e, "enabled": a.enabled} for e, a in _ADAPTERS.items()]
