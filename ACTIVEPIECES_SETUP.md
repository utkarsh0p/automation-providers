# Activepieces setup (MVP)

There are two ways to embed, controlled by `ACTIVEPIECES_EMBED_MODE` in `backend/.env`:

- **`iframe` (default — license-free, use this to test now):** the backend hands the
  frontend the instance URL and it frames Activepieces directly. **No license, no keys.**
  The user sees Activepieces' own login/UI (not white-labeled, not auto-signed-in) — fine
  for testing the embed loop and your frontend. **Setup = just steps 1 + 5 below.**
- **`sdk` (needs an Enterprise license):** the backend mints a per-user JWT so the builder
  loads already logged in and branded as you. Requires the full setup (steps 1–5). Embedding
  is an Activepieces **Enterprise** feature — free for dev/testing, paid at launch.

## Fast path (license-free iframe, to test today)

1. Start Activepieces (below).
2. `cp backend/.env.example backend/.env` (already defaults to `ACTIVEPIECES_EMBED_MODE=iframe`
   and `ACTIVEPIECES_URL=http://localhost:8080`) — done, no keys needed.

The steps below (license + signing key) are only for `sdk` mode.

---

Do these once, then fill `backend/.env`.

## 1. Start Activepieces

```bash
docker compose -f deploy/activepieces/docker-compose.yml up -d
```

Wait ~30s, then open http://localhost:8080 and create the first (admin) account.

## 2. Turn on Enterprise with a free trial key

Embedding needs the Enterprise edition active.
- Get a free **14-day trial license key** (in-app prompt, or from activepieces.com).
- In the admin UI: **Platform Admin → Setup → License Keys** → paste and activate it.

## 3. Generate a signing key (this is what mints logins)

- **Platform Settings → Signing Keys → Generate Signing Key.**
- Copy the **Key ID** (`kid`) → goes in `ACTIVEPIECES_SIGNING_KEY_ID`.
- Copy/download the **PRIVATE key** (PEM). Activepieces does **not** store it — this is
  your only chance. It goes in `ACTIVEPIECES_PRIVATE_KEY`.

## 4. Allow your app's origin to embed (if AP asks)

In the embedding/platform settings, add `http://localhost:5173` to the allowed origins so
the builder is permitted to render inside the dev frontend.

## 5. Fill `backend/.env`

```
ACTIVEPIECES_URL=http://localhost:8080
ACTIVEPIECES_SIGNING_KEY_ID=<the kid from step 3>
ACTIVEPIECES_PRIVATE_KEY=<the PEM from step 3 — one line with \n, or paste multiline>
ACTIVEPIECES_PROJECT_ID=agentegration
```

`ACTIVEPIECES_PROJECT_ID` can be any stable string — Activepieces provisions that project
for your embedded users automatically on first use.

## 6. Run the app

```bash
# backend
cd backend && uv venv .venv && uv pip install -p .venv -r requirements-dev.txt
. .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

Open http://localhost:5173 → the **Automations** page should load the Activepieces builder,
signed in as the demo user. Empty/blank instead? Re-check steps 2–5 — usually the license
isn't active, the signing key values are off, or the origin isn't allowed.
