from abc import ABC, abstractmethod

from app.schemas import EmbedSession


class EngineAdapter(ABC):
    """One adapter per automation engine.

    This is the seam that keeps the product engine-agnostic: adding an engine means
    writing a new adapter, never touching the frontend or the API layer.
    """

    engine: str

    @property
    @abstractmethod
    def enabled(self) -> bool:
        """True once this engine has the config it needs to serve an embed."""

    @abstractmethod
    def get_embed_session(self, user_id: str) -> EmbedSession:
        """Return everything the frontend needs to render this engine's builder."""
