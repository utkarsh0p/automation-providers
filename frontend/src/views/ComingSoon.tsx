import { useState } from "react";
import { ArrowRight, BellSimple, CaretLeft, CheckCircle } from "@phosphor-icons/react";
import { ProviderMark } from "../components/ProviderMark";
import type { EngineInfo } from "../engines";

/** The "to be implemented" page shown for any planned (non-live) engine. */
export function ComingSoon({
  engine,
  onBack,
  onOpenLive,
}: {
  engine: EngineInfo;
  onBack: () => void;
  onOpenLive: () => void;
}) {
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  return (
    <div>
      <div className="view-head">
        <button className="btn btn-ghost btn-sm crumb" onClick={onBack}>
          <CaretLeft size={16} weight="bold" /> Engines
        </button>
      </div>

      <div className="coming reveal">
        <ProviderMark engine={engine} size="lg" />
        <span className="badge badge-soon" style={{ marginTop: 14 }}>Coming soon</span>
        <h1 className="h1">{engine.name} isn&apos;t wired up yet</h1>
        <p className="sub">
          We&apos;re building the {engine.name} adapter, so it isn&apos;t available in this demo.
          Activepieces is live today, or leave your email and we&apos;ll ping you when {engine.name} lands.
        </p>

        {engine.highlights && (
          <ul className="ft-highlights" style={{ justifyContent: "center", marginTop: 18 }}>
            {engine.highlights.map((h) => (
              <li key={h}><CheckCircle size={16} weight="fill" /> {h}</li>
            ))}
          </ul>
        )}

        {notified ? (
          <div className="notify-done">
            <CheckCircle size={18} weight="fill" /> Thanks, we&apos;ll let you know.
          </div>
        ) : (
          <form
            className="notify"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setNotified(true);
            }}
          >
            <div className="input-wrap" style={{ flex: 1 }}>
              <BellSimple className="lead-icon" size={17} />
              <input
                className="input has-lead"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label={`Notify me when ${engine.name} is available`}
              />
            </div>
            <button className="btn btn-secondary" type="submit">Notify me</button>
          </form>
        )}

        <div className="coming-actions">
          <button className="btn btn-primary" onClick={onOpenLive}>
            Explore Activepieces <ArrowRight size={16} weight="bold" />
          </button>
          <button className="btn btn-ghost" onClick={onBack}>Back to engines</button>
        </div>
      </div>
    </div>
  );
}
