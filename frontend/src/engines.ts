// MVP renders Zapier only. n8n / Activepieces are declared so the UI can show
// what's coming, but the backend gates them until their adapter is configured.
export type EngineStatus = "live" | "planned";

export interface EngineInfo {
  id: string;
  name: string;
  status: EngineStatus;
}

export const ENGINES: EngineInfo[] = [
  { id: "activepieces", name: "Activepieces", status: "live" },
  { id: "zapier", name: "Zapier", status: "planned" },
  { id: "n8n", name: "n8n", status: "planned" },
];

export const MVP_ENGINE = "activepieces";
