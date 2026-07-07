from typing import Dict, Literal, Optional

from pydantic import BaseModel


class EmbedElement(BaseModel):
    """A custom-element embed (e.g. Zapier's Workflow Element web component)."""

    tag: str
    script_url: str
    attributes: Dict[str, str]


class EmbedSession(BaseModel):
    """Uniform embed payload returned by every engine adapter.

    Exactly one of `element` / `iframe_url` / `sdk` is populated, per `kind`:
      - "web-component": Zapier Workflow Element        -> element
      - "iframe":        self-hosted n8n instance        -> iframe_url
      - "sdk":           Activepieces JWT embed          -> sdk
    The frontend switches on `kind` and never special-cases the engine otherwise.
    """

    engine: str
    kind: Literal["web-component", "iframe", "sdk"]
    element: Optional[EmbedElement] = None
    iframe_url: Optional[str] = None
    sdk: Optional[Dict[str, str]] = None
