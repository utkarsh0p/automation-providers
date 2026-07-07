from app.config import settings
from app.integrations.base import EngineAdapter
from app.schemas import EmbedElement, EmbedSession


class ZapierAdapter(EngineAdapter):
    """Zapier "Powered by Zapier" Workflow Element (MVP engine).

    The Element is a client-side web component keyed by a PUBLIC client id, so there
    is no server-minted token here (that's the approval-gated Workflow API, phase 2).
    End users authenticate with Zapier via Quick Account Creation on first use.
    """

    engine = "zapier"

    @property
    def enabled(self) -> bool:
        return bool(settings.zapier_client_id and settings.zapier_script_url)

    def get_embed_session(self, user_id: str) -> EmbedSession:
        return EmbedSession(
            engine=self.engine,
            kind="web-component",
            element=EmbedElement(
                tag=settings.zapier_element_tag,
                script_url=settings.zapier_script_url,
                attributes={
                    "client-id": settings.zapier_client_id,
                    "theme": "auto",
                    "app-search-bar-display": "show",
                },
            ),
        )
