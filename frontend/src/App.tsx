import { useCallback, useState } from "react";
import { Shell } from "./components/Shell";
import { Login } from "./views/Login";
import { Storefront } from "./views/Storefront";
import { Builder } from "./views/Builder";
import { ComingSoon } from "./views/ComingSoon";
import { getEngine, MVP_ENGINE, type EngineInfo } from "./engines";

type View =
  | { name: "storefront" }
  | { name: "builder"; engineId: string }
  | { name: "coming-soon"; engineId: string };

// Demo "session" flag. Front-end theater only — no auth, no backend, no middleware.
const SESSION_KEY = "ua_demo_session";

export default function App() {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [view, setView] = useState<View>({ name: "storefront" });

  const signIn = useCallback(() => {
    try {
      localStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — session just won't persist */
    }
    setView({ name: "storefront" });
    setSignedIn(true);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setSignedIn(false);
  }, []);

  // Route by status, never by engine name: live -> builder, planned -> coming-soon.
  const openEngine = useCallback((engine: EngineInfo) => {
    setView(
      engine.status === "live"
        ? { name: "builder", engineId: engine.id }
        : { name: "coming-soon", engineId: engine.id },
    );
  }, []);

  const goHome = useCallback(() => setView({ name: "storefront" }), []);

  if (!signedIn) return <Login onSignIn={signIn} />;

  const engine = view.name === "storefront" ? undefined : getEngine(view.engineId);

  return (
    <Shell onHome={goHome} onSignOut={signOut}>
      {view.name === "storefront" && <Storefront onOpen={openEngine} />}
      {view.name === "builder" && engine && <Builder engine={engine} onBack={goHome} />}
      {view.name === "coming-soon" && engine && (
        <ComingSoon
          engine={engine}
          onBack={goHome}
          onOpenLive={() => {
            const live = getEngine(MVP_ENGINE);
            if (live) setView({ name: "builder", engineId: live.id });
          }}
        />
      )}
    </Shell>
  );
}
