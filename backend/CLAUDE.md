# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in `backend/`.
For the whole-repo architecture and the product vision, see the root `../CLAUDE.md`.

## What this is

The FastAPI backend. Its one job is to serve **embed sessions**: given an engine id, return
everything the frontend needs to render that engine's builder. It also holds all provider
config/secrets — the frontend never sees a raw provider key.

## Commands

Run from `backend/`. Note: this machine has no system `pip`/`venv` (Python 3.14, `python3-venv`
absent); use `uv` (already bootstrapped at `~/.local/bin/uv`) to manage the env:

```bash
uv venv .venv
uv pip install -p .venv -r requirements-dev.txt   # runtime deps + pytest/httpx
. .venv/bin/activate
uvicorn app.main:app --reload --port 8000          # dev server
pytest                                             # all tests
pytest tests/test_embed.py::test_health            # a single test
```

If a normal `python -m venv` + `pip` works in your environment, that's fine too.

## Layout

```
app/main.py          FastAPI app, CORS (allows FRONTEND_ORIGIN), mounts the router
app/config.py        Settings from env/.env via pydantic-settings
app/schemas.py       EmbedSession / EmbedElement — the response contract
app/api/embed.py     GET /api/engines, GET /api/embed-session
app/integrations/    One adapter per engine (the seam)
tests/test_embed.py  API tests (FastAPI TestClient)
```

## The adapter pattern — how to add an engine

This is the core rule: engines are added, never special-cased. To add one:

1. Create `app/integrations/<engine>.py` with a class subclassing `EngineAdapter`
   (`app/integrations/base.py`). Implement `enabled` (True once its config is present) and
   `get_embed_session(user_id) -> EmbedSession`.
2. Register an instance in the `_ADAPTERS` tuple in `app/integrations/__init__.py`.
3. Add its config fields to `app/config.py` (and document them in `.env.example`).
4. If it needs a new embed mechanism, add a `kind` value in `app/schemas.py` — and the
   frontend must add a matching handler (see `../frontend/CLAUDE.md`).

`get_embed_session` returns one of three `kind`s: `iframe` (Activepieces license-free mode, and
future n8n), `sdk` (Activepieces licensed mode), or `web-component` (Zapier). Populate exactly
the matching field (`iframe_url` / `sdk` / `element`).

## Engine status

- `activepieces.py` — **live** (MVP), two modes via `ACTIVEPIECES_EMBED_MODE`:
  - `iframe` (default, **license-free** — current MVP): returns `kind: iframe`, `iframe_url =
    ACTIVEPIECES_URL`. Frontend frames the instance directly. `enabled` needs only
    `ACTIVEPIECES_URL`. No keys, no Enterprise license — the user sees AP's own login/UI.
  - `sdk` (**needs Enterprise license**): mints a per-user **RS256 JWT** (`version: v3`,
    externalUserId/externalProjectId/role) signed with `ACTIVEPIECES_PRIVATE_KEY` + `kid =
    ACTIVEPIECES_SIGNING_KEY_ID`; returns `kind: sdk`. Auto-login, white-label. Needs PyJWT +
    cryptography.
  Disabled (→ 409) when `ACTIVEPIECES_URL` is unset (or, in sdk mode, the signing values).
- `zapier.py` — **deferred** stub. Returns a Workflow Element config, but is gated behind
  publishing a reviewed Zapier integration (see root `../CLAUDE.md`).
- `n8n.py` — **deferred**; `get_embed_session` raises `NotImplementedError` (HTTP 501).

## Config / env

Field names in `config.py` map to UPPER_CASE env vars (`activepieces_private_key` →
`ACTIVEPIECES_PRIVATE_KEY`). Copy `.env.example` → `.env` and fill in. Never commit `.env`.
For the MVP, the `ACTIVEPIECES_*` values come from a running Activepieces instance — see
`../ACTIVEPIECES_SETUP.md` (license key + signing key). The Zapier vars belong to the
deferred adapter.
