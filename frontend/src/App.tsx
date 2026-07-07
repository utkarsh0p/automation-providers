import { useEffect, useRef, useState } from "react";
import { getEmbedSession, type EmbedSession } from "./api";
import { MVP_ENGINE } from "./engines";

const CONTAINER_ID = "embed-container";

/** Load a script once (embed SDKs register a global or a custom element on load). */
function loadScriptOnce(src: string, asModule = false): Promise<void> {
  if (!src) return Promise.reject(new Error("No embed script URL configured"));
  if (document.querySelector(`script[data-embed-src="${src}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    if (asModule) s.type = "module";
    s.src = src;
    s.dataset.embedSrc = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load the embed script"));
    document.head.appendChild(s);
  });
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session: EmbedSession = await getEmbedSession(MVP_ENGINE);
        if (cancelled) return;

        if (session.kind === "sdk" && session.sdk) {
          // Activepieces: load the embed SDK, then hand it our per-user JWT.
          await loadScriptOnce(session.sdk.scriptUrl);
          const ap = (window as unknown as { activepieces?: any }).activepieces;
          if (!ap) throw new Error("Embed SDK loaded but window.activepieces is missing");
          ap.configure({
            instanceUrl: session.sdk.instanceUrl,
            jwtToken: session.sdk.jwtToken,
            embedding: { containerId: CONTAINER_ID },
          });
        } else if (session.kind === "web-component" && session.element) {
          // Zapier (later): mount the Workflow Element web component.
          await loadScriptOnce(session.element.script_url, true);
          const el = document.createElement(session.element.tag);
          for (const [k, v] of Object.entries(session.element.attributes)) {
            el.setAttribute(k, v);
          }
          mountRef.current?.replaceChildren(el);
        } else if (session.kind === "iframe" && session.iframe_url) {
          // Activepieces (license-free mode): frame the instance directly.
          const frame = document.createElement("iframe");
          frame.src = session.iframe_url;
          frame.style.width = "100%";
          frame.style.height = "100%";
          frame.style.border = "0";
          mountRef.current?.replaceChildren(frame);
        } else {
          setError(`Embed kind '${session.kind}' isn't wired up in the frontend yet.`);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ marginBottom: 4 }}>Automations</h1>
      <p style={{ color: "#667", marginTop: 0 }}>Build and manage your automations here.</p>

      {loading && <p>Loading builder…</p>}

      {error && (
        <div style={{ border: "1px solid #d99", background: "rgba(220,80,100,.08)", padding: 16, borderRadius: 8 }}>
          <strong>Couldn’t load the builder.</strong>
          <p style={{ margin: "6px 0 0" }}>{error}</p>
          <p style={{ margin: "8px 0 0", color: "#667", fontSize: 13 }}>
            Make sure Activepieces is running and the <code>ACTIVEPIECES_*</code> values are set in{" "}
            <code>backend/.env</code> (see <code>ACTIVEPIECES_SETUP.md</code>), then reload.
          </p>
        </div>
      )}

      <div id={CONTAINER_ID} ref={mountRef} style={{ marginTop: 16, height: "75vh", minHeight: 520 }} />
    </main>
  );
}
