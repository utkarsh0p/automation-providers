from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.embed import router as embed_router
from app.config import settings

app = FastAPI(title="UnifiedAgentic API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(embed_router)
