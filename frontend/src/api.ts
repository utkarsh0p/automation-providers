// Thin client for the backend embed API. The frontend is engine-agnostic: it asks
// the backend for an embed session and renders whatever `kind` comes back.

export interface EmbedElement {
  tag: string;
  script_url: string;
  attributes: Record<string, string>;
}

export interface EmbedSession {
  engine: string;
  kind: "web-component" | "iframe" | "sdk";
  element?: EmbedElement;
  iframe_url?: string;
  sdk?: Record<string, string>;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function getEmbedSession(engine: string): Promise<EmbedSession> {
  const res = await fetch(
    `${API_BASE}/api/embed-session?engine=${encodeURIComponent(engine)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Failed to load ${engine} (HTTP ${res.status})`);
  }
  return res.json();
}
