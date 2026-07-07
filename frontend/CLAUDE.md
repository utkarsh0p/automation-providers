# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in `frontend/`.
For the whole-repo architecture and the product vision, see the root `../CLAUDE.md`.

## What this is

The React + Vite + TypeScript app. It renders the embedded automation builder for the MVP
(Activepieces). Its defining constraint: **it is engine-agnostic.** It asks the backend for an
embed session and renders whatever `kind` comes back — it must never branch on the engine *name*
(`activepieces` / `zapier` / …). Provider-specific logic belongs in a backend adapter, not here.

## Commands

Run from `frontend/`:

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # type-check (tsc) + production build
npm run preview    # serve the production build
```

There is no test runner yet.

## Layout

```
src/api.ts       getEmbedSession(engine) — typed client for the backend embed API
src/engines.ts   Engine list + MVP_ENGINE (Activepieces live; Zapier/n8n planned)
src/App.tsx      Automations page: fetch session, render by `kind`, show config prompt on error
src/main.tsx     React root
```

## How the embed renders

`App.tsx` calls `getEmbedSession(MVP_ENGINE)` (MVP engine = `activepieces`) and switches on
`session.kind`:

- `iframe` (Activepieces today, license-free mode): put `session.iframe_url` into an
  `<iframe>`. Simplest path; used for the MVP so the builder renders with no license/keys.
- `sdk` (Activepieces with an Enterprise license): load the embed SDK script
  (`session.sdk.scriptUrl`) once, then call `window.activepieces.configure({ instanceUrl,
  jwtToken, embedding: { containerId } })`. Auto-login + white-label.
- `web-component` (Zapier, later): `document.createElement(session.element.tag)`, apply
  `session.element.attributes`, mount it.

Keep this switch the *only* place engine mechanics live. Adding an engine that reuses an
existing `kind` should require zero frontend changes.

## Config / env

`VITE_API_BASE` (see `.env.example`, default `http://localhost:8000`) points at the backend.
Copy `.env.example` → `.env`. The frontend holds no provider secrets — only whatever the
backend hands back in an embed session (in Activepieces iframe mode, just the instance URL to frame).

## Expected "broken" state

With the backend running but Activepieces unreachable/unconfigured, the page shows a
configuration prompt instead of the builder. In the default license-free `iframe` mode this
just needs Activepieces running and `ACTIVEPIECES_URL` set in `backend/.env` (both preset for
local dev). Not a frontend bug — see `ACTIVEPIECES_SETUP.md`.
