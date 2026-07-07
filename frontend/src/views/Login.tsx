import { useEffect, useRef, useState } from "react";
import { CircleNotch, EnvelopeSimple, Eye, EyeSlash, Info, LockSimple } from "@phosphor-icons/react";
import { BrandLogo, GodWebMark } from "../components/Logo";
import { ProviderMark } from "../components/ProviderMark";
import { ENGINES } from "../engines";

/**
 * Sign-in page. Pure front-end theater: both the credential form and the GodWeb
 * button call `onSignIn`. There is no auth, no backend call, no middleware.
 */
export function Login({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState<null | "godweb" | "email">(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function enter(method: "godweb" | "email") {
    if (pending) return;
    setPending(method);
    // Fake the round-trip so the loading state reads like a real sign-in.
    timer.current = window.setTimeout(onSignIn, 650);
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <BrandLogo />
        <div>
          <h2 className="aside-headline">Every automation engine. One doorway.</h2>
          <p className="aside-sub">
            Browse builders, connect once, and ship workflows without leaving the app.
          </p>
        </div>
        <div className="aside-marks">
          {ENGINES.slice(0, 4).map((e) => (
            <div className="aside-mark" key={e.id}>
              <ProviderMark engine={e} size="sm" />
              <div>
                <div className="am-name">{e.name}</div>
                <div className="am-tag">{e.category}</div>
              </div>
              <span className="spacer" />
              {e.status === "live" ? (
                <span className="badge badge-live"><span className="dot" />Live</span>
              ) : (
                <span className="badge badge-soon">Soon</span>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-card reveal">
          <div className="card-brand"><BrandLogo /></div>
          <h1>Sign in</h1>
          <p className="auth-lead">Welcome back. Continue to your automation storefront.</p>

          <button
            className="btn btn-oauth btn-block btn-lg"
            onClick={() => enter("godweb")}
            disabled={pending !== null}
          >
            {pending === "godweb" ? <CircleNotch className="spin" size={18} /> : <GodWebMark />}
            Continue with GodWeb
          </button>

          <div className="divider">or</div>

          <form className="stack" onSubmit={(e) => { e.preventDefault(); enter("email"); }}>
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <div className="input-wrap">
                <EnvelopeSimple className="lead-icon" size={18} />
                <input
                  id="email"
                  className="input has-lead"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <LockSimple className="lead-icon" size={18} />
                <input
                  id="password"
                  className="input has-lead has-trail"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending !== null}>
              {pending === "email" ? <><CircleNotch className="spin" size={18} /> Signing in</> : "Sign in"}
            </button>
          </form>

          <div className="demo-note">
            <Info size={14} />
            Demo mode. Any details work, and GodWeb signs you straight in.
          </div>

          <p className="auth-foot">
            New to UnifiedAgentic? <a href="#" onClick={(e) => e.preventDefault()}>Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
