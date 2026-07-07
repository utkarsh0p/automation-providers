from app.config import settings
from app.integrations.base import EngineAdapter
from app.schemas import EmbedSession


class N8nAdapter(EngineAdapter):
    """Deferred. Embed a self-hosted n8n instance via iframe; auth is yours to control.

    Verify n8n's embed license before commercial white-labeling. Implement
    get_embed_session to return kind="iframe" with iframe_url pointing at the instance.
    """

    engine = "n8n"

    @property
    def enabled(self) -> bool:
        return bool(settings.n8n_embed_url)

    def get_embed_session(self, user_id: str) -> EmbedSession:
        raise NotImplementedError("n8n adapter is deferred (see CLAUDE.md).")
