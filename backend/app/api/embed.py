from fastapi import APIRouter, HTTPException, Query

from app.integrations import available_engines, get_adapter
from app.schemas import EmbedSession

router = APIRouter(prefix="/api", tags=["embed"])


@router.get("/engines")
def list_engines() -> dict:
    """All known engines and whether each is configured/available."""
    return {"engines": available_engines()}


@router.get("/embed-session", response_model=EmbedSession)
def embed_session(
    engine: str = Query(..., description="Engine id, e.g. 'zapier'"),
    # Stand-in for the authenticated user; wire to real auth when the host app has it.
    user_id: str = Query("demo-user"),
) -> EmbedSession:
    """Return the embed payload the frontend needs to render `engine`'s builder."""
    adapter = get_adapter(engine)
    if adapter is None:
        raise HTTPException(status_code=404, detail=f"Unknown engine '{engine}'")
    if not adapter.enabled:
        raise HTTPException(
            status_code=409,
            detail=f"Engine '{engine}' is not configured yet — see backend/.env.example",
        )
    try:
        return adapter.get_embed_session(user_id)
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc))
