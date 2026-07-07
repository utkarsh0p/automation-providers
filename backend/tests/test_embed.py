from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_engines_lists_all_three():
    engines = {e["engine"] for e in client.get("/api/engines").json()["engines"]}
    assert engines == {"zapier", "n8n", "activepieces"}


def test_activepieces_not_configured_returns_409(monkeypatch):
    monkeypatch.setattr(settings, "activepieces_url", "")
    resp = client.get("/api/embed-session", params={"engine": "activepieces"})
    assert resp.status_code == 409


def test_activepieces_iframe_mode_returns_iframe(monkeypatch):
    monkeypatch.setattr(settings, "activepieces_url", "http://localhost:8080")
    monkeypatch.setattr(settings, "activepieces_embed_mode", "iframe")
    resp = client.get("/api/embed-session", params={"engine": "activepieces"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["kind"] == "iframe"
    assert body["iframe_url"] == "http://localhost:8080"


def test_unknown_engine_returns_404():
    resp = client.get("/api/embed-session", params={"engine": "make"})
    assert resp.status_code == 404
