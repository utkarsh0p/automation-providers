import type { CSSProperties } from "react";
import type { EngineInfo } from "../engines";

/** Brand-tinted monogram tile for an engine. Tint comes from `engine.brand`. */
export function ProviderMark({
  engine,
  size = "md",
}: {
  engine: EngineInfo;
  size?: "sm" | "md" | "lg";
}) {
  const cls = size === "sm" ? "mark mark-sm" : size === "lg" ? "mark mark-lg" : "mark";
  const initial = engine.name.charAt(0).toUpperCase();
  return (
    <div className={cls} style={{ "--brand": engine.brand } as CSSProperties} aria-hidden="true">
      {initial}
    </div>
  );
}
