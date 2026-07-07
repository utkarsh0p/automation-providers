# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Working skeleton, Activepieces MVP — running & verified** (as of 2026-07-07). Stack: **frontend** = React + Vite + TypeScript; **backend** = Python + FastAPI. The Activepieces path works today in **license-free `iframe` mode**: Activepieces runs locally (Docker, `deploy/activepieces/`), the backend serves an embed session at `/api/embed-session`, and the frontend frames the builder. `backend/.env` is preset to iframe mode, so **no keys/license are needed to run it**. The paid **`sdk` mode** (per-user RS256 JWT → auto-login + white-label) is implemented behind `ACTIVEPIECES_EMBED_MODE=sdk` for later. Verified: backend `pytest` 6/6; `GET /api/embed-session?engine=activepieces` → `{kind:iframe, iframe_url:…}`; frontend builds clean. Runbook: `ACTIVEPIECES_SETUP.md`.

## What this is

UnifiedAgentic is a **storefront / aggregator**: one place where users browse several automation engines, build workflows in each engine's embedded builder without leaving the app, and (long-term) pay UnifiedAgentic, which settles usage costs with each provider. It is a standalone product, not a feature bolted onto another app.

**MVP scope:** the free **storefront** (browse/compare providers — needs no license) plus **one live engine: Activepieces**, embedded in license-free `iframe` mode. Other providers appear as "coming soon." Embed licenses and the billing/settlement layer are deferred until users prove they want engine choice.

**Hard-won reality (verified across Zapier, n8n, Activepieces):** no mature engine offers *free* white-label commercial embedding — it's their business model. The MVP sidesteps this by (a) keeping the storefront itself license-free and (b) running Activepieces in iframe mode; the paid seamless embed is a launch-time cost.

The product filter is strict: only integrate platforms that ship an **embeddable end-user workflow-builder UI**. Connect-only / unified-API tools (Paragon, Prismatic, Nango, Merge, Apideck) are explicitly out of scope — they don't give users a builder.

## Repository layout

```
frontend/                 React + Vite + TypeScript
  src/App.tsx             Automations page: fetches an embed session, renders the builder
  src/api.ts              Backend embed client (engine-agnostic)
  src/engines.ts          Engine list (Activepieces live; Zapier/n8n planned)
backend/                  Python + FastAPI
  app/main.py             App + CORS + router
  app/config.py           Settings/secrets from env (.env)
  app/schemas.py          EmbedSession contract shared by all engines
  app/api/embed.py        GET /api/engines, GET /api/embed-session
  app/integrations/       One adapter per engine — THE SEAM
    base.py               EngineAdapter ABC
    activepieces.py       MVP — live; iframe (license-free) or sdk (JWT) mode
    zapier.py             deferred (Workflow Element web component)
    n8n.py                deferred (iframe)
  tests/test_embed.py     API tests
deploy/activepieces/      docker-compose for a local Activepieces (AP_EDITION=ee)
ACTIVEPIECES_SETUP.md     run Activepieces + get keys; iframe (free) vs sdk (licensed) mode
```

## Core architectural rule: the engine-adapter pattern

This is the single most important design decision — **do not break it.** Every engine sits behind one uniform backend interface so the frontend never special-cases a provider, and adding an engine is a new adapter, not a rewrite.

- The frontend asks the backend for an embed session for the currently selected engine — conceptually `getEmbedSession(user, engine) → { provider, embedConfig }` — and renders whatever the adapter returns (a web-component config, an iframe URL, or an SDK token).
- All provider API keys / client IDs / signing secrets live in the **backend only**. The frontend receives short-lived, per-user embed config/tokens — never raw provider secrets.
- New engines are added by implementing a new adapter under `backend/integrations/`, not by editing frontend engine logic.

## Engines and their embed models

The embed mechanism differs per engine. **Reality check learned the hard way: every mature engine gates white-label embedding behind a paid tier — it's their business model. There is no free commercial white-label embed.**

- **Activepieces (MVP, implemented) — two modes via `ACTIVEPIECES_EMBED_MODE`:**
  - **`iframe` (default, license-free — the current MVP):** the backend returns the instance URL and the frontend frames it directly. No keys, no license. Trade-off: the user sees Activepieces' own login/branding (not auto-signed-in, not white-labeled) — enough to test and demo.
  - **`sdk` (needs an Enterprise license):** embed SDK (`https://cdn.activepieces.com/sdk/embed/0.9.0.js`); the backend mints a short-lived **RS256 JWT** ("managed users", `version: v3`) signed with the key from **Platform Settings → Signing Keys** (`kid`), so the user is auto-signed-in, scoped to one project, and the builder is white-labeled. Enterprise = **free for dev/testing, paid for production** (14-day trial keys exist); requires `AP_EDITION=ee` + an active license.
  Full runbook: `ACTIVEPIECES_SETUP.md`.
- **Zapier (later):** "Powered by Zapier" **Workflow Element** web component. No paid contract, BUT the embed `client_id` requires **publishing a reviewed public/Beta integration** backed by your own API (OAuth + trigger/action + Zap templates) — a heavy, gated prerequisite. Deferred.
- **n8n (later):** self-hosted, embedded via iframe; you control auth. Its **Sustainable Use License requires a paid Embed license** for commercial embedding. Deferred.

## Deferred — do not build these for the MVP

- Multi-engine picker in the frontend (Activepieces only until demand is proven).
- Billing / metering / settlement machinery.
- `zapier` and `n8n` adapters exist as stubs — leave them until the Activepieces MVP proves demand.
- Production Activepieces licensing — the MVP runs on a free dev/trial license; buy a commercial embed license before launching to real users.

## Commands

Backend (from `backend/`):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt        # runtime deps + pytest/httpx
uvicorn app.main:app --reload --port 8000  # dev server
pytest                                     # all tests
pytest tests/test_embed.py::test_health    # a single test
```

Frontend (from `frontend/`):

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # type-check (tsc) + production build
npm run preview    # serve the production build
```

There is no frontend test runner yet.

## The embed contract

`GET /api/embed-session?engine=<id>` returns an `EmbedSession` (`app/schemas.py`) with a
`kind` of `iframe` (Activepieces license-free mode, and future n8n), `sdk` (Activepieces
licensed mode), or `web-component` (Zapier, later). The frontend switches on `kind` only — it
never branches on the engine name (`App.tsx` currently handles `iframe`, `sdk`, and
`web-component`). Adding an engine = a new `EngineAdapter` subclass registered in
`app/integrations/__init__.py`, plus a `kind` handler in `App.tsx` only if it introduces a new
embed mechanism.

## Working agreements

- **Verify provider embed/auth specifics against live docs before coding.** These products (especially Zapier's embed program) get renamed and reorganized often; don't rely on memory.
- Keep the frontend engine-agnostic — anything provider-specific belongs in a backend adapter.
