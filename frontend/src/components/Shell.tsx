import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaretDown, SignOut } from "@phosphor-icons/react";
import { BrandLogo } from "./Logo";

/** App chrome once signed in: a slim sticky top bar + centered content. */
export function Shell({
  onHome,
  onSignOut,
  children,
}: {
  onHome: () => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-btn" onClick={onHome} aria-label="UnifiedAgentic home">
            <BrandLogo />
          </button>

          <div className="account" ref={ref}>
            <button
              className="account-chip"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Account menu"
            >
              <span className="avatar">U</span>
              <CaretDown size={14} weight="bold" />
            </button>
            {open && (
              <div className="account-menu" role="menu">
                <div className="am-head">
                  <div className="am-name">Utkarsh Singh</div>
                  <div className="am-meta">Signed in with GodWeb</div>
                </div>
                <button className="menu-item" role="menuitem" onClick={onSignOut}>
                  <SignOut size={17} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="shell-main">
        <div className="container">{children}</div>
      </main>
    </>
  );
}
