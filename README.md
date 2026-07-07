# UnifiedAgentic

Embed automation **workflow builders** inside the product so users build and run
automations without leaving the app. The MVP embeds **Activepieces** (self-hosted);
`Zapier` and `n8n` adapters are scaffolded for later behind the same interface.

- `frontend/` — React + Vite (TypeScript). Renders the embedded builder.
- `backend/` — FastAPI (Python). One adapter per engine under `app/integrations/`.

See [CLAUDE.md](./CLAUDE.md) for architecture, the engine-adapter pattern, and setup.

## Run it

First bring up Activepieces and grab its signing key — see **[ACTIVEPIECES_SETUP.md](./ACTIVEPIECES_SETUP.md)**.

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # or: uv venv .venv
pip install -r requirements-dev.txt
cp .env.example .env          # fill in the ACTIVEPIECES_* values
uvicorn app.main:app --reload --port 8000

# frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

Until Activepieces is running and the `ACTIVEPIECES_*` values are set, the Automations
page shows a configuration prompt — that's expected.
# automation-providers
