import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { ProviderMark } from "../components/ProviderMark";
import { LIVE_ENGINES, PLANNED_ENGINES, type EngineInfo } from "../engines";

/** The storefront: a featured live engine, then a grid of coming-soon engines. */
export function Storefront({ onOpen }: { onOpen: (engine: EngineInfo) => void }) {
  return (
    <div>
      <header className="page-head reveal">
        <h1 className="h1">Automation engines</h1>
        <p className="sub" style={{ marginTop: 10 }}>
          One storefront for every workflow builder. Activepieces is live today; more land soon.
        </p>
      </header>

      {LIVE_ENGINES.map((engine, i) => (
        <section
          key={engine.id}
          className="featured reveal"
          style={{ animationDelay: `${80 + i * 60}ms`, marginTop: 24 }}
        >
          <div>
            <div className="ft-top">
              <ProviderMark engine={engine} size="lg" />
              <div>
                <div className="ft-title-row">
                  <span className="ft-name">{engine.name}</span>
                  <span className="badge badge-live"><span className="dot" />Live</span>
                  <span className="tag">{engine.category}</span>
                </div>
                <p className="ft-tagline">{engine.tagline}</p>
              </div>
            </div>
            {engine.highlights && (
              <ul className="ft-highlights" style={{ marginTop: 18 }}>
                {engine.highlights.map((h) => (
                  <li key={h}><CheckCircle size={16} weight="fill" /> {h}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="ft-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onOpen(engine)}>
              Open builder <ArrowRight size={17} weight="bold" />
            </button>
          </div>
        </section>
      ))}

      <div className="section-head">
        <h2 className="h2">Coming soon</h2>
        <span className="count">{PLANNED_ENGINES.length} engines in the pipeline</span>
      </div>

      <div className="engine-grid">
        {PLANNED_ENGINES.map((engine, i) => (
          <button
            key={engine.id}
            className="engine-card reveal"
            style={{ animationDelay: `${120 + i * 55}ms` }}
            onClick={() => onOpen(engine)}
          >
            <div className="ec-head">
              <ProviderMark engine={engine} />
              <span className="badge badge-soon">Soon</span>
            </div>
            <div>
              <div className="ec-name">{engine.name}</div>
              <p className="ec-tagline" style={{ marginTop: 6 }}>{engine.tagline}</p>
            </div>
            <div className="ec-foot">
              <span className="tag">{engine.category}</span>
              <span className="ec-cta">Preview <ArrowRight size={15} weight="bold" /></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
