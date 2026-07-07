import { useEffect, useRef, useState } from "react";
import { ArrowSquareOut, CaretLeft, Warning } from "@phosphor-icons/react";
import { getEmbedSession, type EmbedSession } from "../api";
import { ProviderMark } from "../components/ProviderMark";
import type { EngineInfo } from "../engines";

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

/**
 * Renders a live engine's embedded builder. Stays engine-agnostic: it switches on
 * the session `kind` (iframe / sdk / web-component), never on the engine name.
 */
export function Builder({ engine, onBack }: { engine: EngineInfo; onBack: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session: EmbedSession = await getEmbedSession(engine.id);
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
          setIframeUrl(session.iframe_url);
          const frame = document.createElement("iframe");
          frame.src = session.iframe_url;
          frame.title = `${engine.name} builder`;
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
  }, [engine.id, engine.name]);

  const hidden = loading || error !== null;

  return (
    <div>
      <div className="view-head">
        <button className="btn btn-ghost btn-sm crumb" onClick={onBack}>
          <CaretLeft size={16} weight="bold" /> Engines
        </button>
        <ProviderMark engine={engine} size="sm" />
        <span style={{ fontWeight: 660 }}>{engine.name}</span>
        <span className="badge badge-live"><span className="dot" />Live</span>
        <span className="spacer" />
        {iframeUrl && (
          <a className="btn btn-secondary btn-sm" href={iframeUrl} target="_blank" rel="noreferrer">
            Open in new tab <ArrowSquareOut size={15} />
          </a>
        )}
      </div>

      {error && (
        <div className="notice">
          <div className="notice-title">
            <Warning size={18} weight="fill" /> Couldn&apos;t load the builder
          </div>
          <p>{error}</p>
          <p>
            Make sure Activepieces is running and the <code>ACTIVEPIECES_*</code> values are set in{" "}
            <code>backend/.env</code> (see <code>ACTIVEPIECES_SETUP.md</code>), then reload.
          </p>
        </div>
      )}

      {loading && !error && <div className="skeleton skeleton-frame" aria-hidden="true" />}

      <div
        id={CONTAINER_ID}
        ref={mountRef}
        className="builder-frame"
        style={{ display: hidden ? "none" : "block" }}
      />
    </div>
  );
}
