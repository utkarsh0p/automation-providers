from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration, loaded from environment / .env.

    All provider credentials live here (server-side) and never reach the browser.
    Field names map to UPPER_CASE env vars (e.g. zapier_client_id -> ZAPIER_CLIENT_ID).
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Frontend origin allowed to call this API (CORS) and to be allowlisted for embeds.
    frontend_origin: str = "http://localhost:5173"

    # --- Zapier (MVP) ---------------------------------------------------
    # Public embed client id. Empty => the Zapier engine reports as not configured.
    zapier_client_id: str = ""
    zapier_element_tag: str = "zapier-full-experience"
    zapier_script_url: str = ""

    # --- Activepieces (MVP) ---------------------------------------------
    # Self-hosted Activepieces. Two embed modes:
    #   "iframe" (default, license-free): frame the instance directly — for testing.
    #   "sdk"    (needs Enterprise license): mint a per-user RS256 JWT for auto-login.
    activepieces_url: str = ""
    activepieces_embed_mode: str = "iframe"
    activepieces_signing_key_id: str = ""    # "kid" from Platform Settings -> Signing Keys (sdk mode)
    activepieces_private_key: str = ""        # RSA private key PEM (RS256), sdk mode; \n escapes allowed
    activepieces_project_id: str = "agentegration"  # externalProjectId (sdk mode)

    # --- n8n (later) ----------------------------------------------------
    n8n_embed_url: str = ""


settings = Settings()
