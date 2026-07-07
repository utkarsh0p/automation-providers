// The storefront's engine catalog. The frontend stays engine-agnostic about the
// *embed mechanism* (see App/Builder — they switch on the session `kind`, never the
// engine name). This list is pure presentation data that drives the storefront grid.
//
// Routing is by `status`, not by id: "live" engines open the embedded builder,
// "planned" engines open the coming-soon page. Adding a live engine = flip its
// status once the backend adapter is wired up. No name-based branching.

export type EngineStatus = "live" | "planned";

export interface EngineInfo {
  id: string;
  name: string;
  /** One-line description shown on the card. */
  tagline: string;
  /** Short category label (kept to a single middle-dot separator). */
  category: string;
  /** Brand color used to tint the monogram tile. */
  brand: string;
  status: EngineStatus;
  /** Shown on the featured (live) card and coming-soon page. */
  highlights?: string[];
}

export const ENGINES: EngineInfo[] = [
  {
    id: "activepieces",
    name: "Activepieces",
    tagline: "Open-source, no-code automation with a visual flow builder.",
    category: "No-code · Open source",
    brand: "#6E41E2",
    status: "live",
    highlights: [
      "Visual flow builder with branching and loops",
      "Runs locally, embedded right on this page",
      "No license needed in iframe mode",
    ],
  },
  {
    id: "n8n",
    name: "n8n",
    tagline: "Source-available workflow automation for technical teams.",
    category: "Low-code · Self-hosted",
    brand: "#EA4B71",
    status: "planned",
    highlights: ["Self-hosted, you control auth", "Code steps beside no-code nodes"],
  },
  {
    id: "zapier",
    name: "Zapier",
    tagline: "The largest app directory, wired together with Zaps.",
    category: "No-code · 7,000+ apps",
    brand: "#FF4F00",
    status: "planned",
    highlights: ["Embedded via the Workflow Element", "Widest catalog of integrations"],
  },
  {
    id: "make",
    name: "Make",
    tagline: "Scenario-based automation with deep visual branching.",
    category: "No-code · Visual",
    brand: "#7D2AE8",
    status: "planned",
    highlights: ["Highly visual scenario canvas", "Fine-grained data mapping"],
  },
  {
    id: "pipedream",
    name: "Pipedream",
    tagline: "Code-first workflows that connect any API in seconds.",
    category: "Code-first · Developer",
    brand: "#0FA47F",
    status: "planned",
    highlights: ["Drop into Node or Python anywhere", "Thousands of prebuilt actions"],
  },
  {
    id: "windmill",
    name: "Windmill",
    tagline: "Turn scripts into internal tools and scheduled flows.",
    category: "Code-first · Open source",
    brand: "#0EA5B5",
    status: "planned",
    highlights: ["Scripts become UIs and cron jobs", "Open source, self-hostable"],
  },
];

/** The one engine live in the MVP. Builder embeds this. */
export const MVP_ENGINE = "activepieces";

export const LIVE_ENGINES = ENGINES.filter((e) => e.status === "live");
export const PLANNED_ENGINES = ENGINES.filter((e) => e.status === "planned");

export function getEngine(id: string): EngineInfo | undefined {
  return ENGINES.find((e) => e.id === id);
}
