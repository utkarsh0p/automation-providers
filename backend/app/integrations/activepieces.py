from datetime import datetime, timedelta, timezone

import jwt

from app.config import settings
from app.integrations.base import EngineAdapter
from app.schemas import EmbedSession

# Loaded by the embed SDK on the frontend; it injects the builder as an iframe.
_EMBED_SDK_URL = "https://cdn.activepieces.com/sdk/embed/0.9.0.js"


class ActivepiecesAdapter(EngineAdapter):
    """Activepieces embedded builder (MVP engine).

    Two modes (settings.activepieces_embed_mode):
      - "iframe": license-free. Return the instance URL for the frontend to frame
        directly. Use this to test the embed loop without an Enterprise license —
        the user sees Activepieces' own UI/login (not white-labeled, not auto-signed-in).
      - "sdk": mint a short-lived RS256 JWT ("managed users") signed with the Platform
        signing key so the builder loads already authenticated and scoped to one
        project. Requires an active Activepieces Enterprise license.
    """

    engine = "activepieces"

    @property
    def enabled(self) -> bool:
        if not settings.activepieces_url:
            return False
        if settings.activepieces_embed_mode == "sdk":
            return bool(
                settings.activepieces_signing_key_id
                and settings.activepieces_private_key
                and settings.activepieces_project_id
            )
        return True  # iframe mode needs only the instance URL

    def _mint_jwt(self, user_id: str) -> str:
        # Allow the PEM to be provided with escaped newlines in .env.
        private_key = settings.activepieces_private_key.replace("\\n", "\n")
        now = datetime.now(timezone.utc)
        payload = {
            "version": "v3",
            "externalUserId": user_id,
            "externalProjectId": settings.activepieces_project_id,
            "firstName": "Agentegration",
            "lastName": user_id,
            "role": "EDITOR",
            "exp": int((now + timedelta(hours=1)).timestamp()),
        }
        return jwt.encode(
            payload,
            private_key,
            algorithm="RS256",
            headers={"kid": settings.activepieces_signing_key_id},
        )

    def get_embed_session(self, user_id: str) -> EmbedSession:
        if settings.activepieces_embed_mode == "sdk":
            return EmbedSession(
                engine=self.engine,
                kind="sdk",
                sdk={
                    "instanceUrl": settings.activepieces_url,
                    "jwtToken": self._mint_jwt(user_id),
                    "scriptUrl": _EMBED_SDK_URL,
                },
            )
        # iframe (license-free) mode — the default for testing.
        return EmbedSession(
            engine=self.engine,
            kind="iframe",
            iframe_url=settings.activepieces_url,
        )
