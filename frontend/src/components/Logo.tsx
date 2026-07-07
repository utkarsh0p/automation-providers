// Brand marks. These are simple geometric marks (a rounded-square app glyph and an
// orbit SSO glyph), not decorative illustrations — kept intentionally minimal.

export function BrandLogo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ua-brand" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3f74ff" />
            <stop offset="1" stopColor="#7d2ae8" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#ua-brand)" />
        <g stroke="#fff" strokeWidth="1.9" strokeLinecap="round" opacity="0.92" fill="none">
          <path d="M11 11 C 16 11, 17 16, 22 16" />
          <path d="M11 21 C 16 21, 17 16, 22 16" />
        </g>
        <g fill="#fff">
          <circle cx="11" cy="11" r="2.7" />
          <circle cx="11" cy="21" r="2.7" />
          <circle cx="22" cy="16" r="2.7" />
        </g>
      </svg>
      {showWordmark && (
        <span style={{ fontWeight: 660, fontSize: "1.02rem", letterSpacing: "-0.02em" }}>UnifiedAgentic</span>
      )}
    </span>
  );
}

/** The mark for the "Continue with GodWeb" button — a small orbit/sphere glyph. */
export function GodWebMark({ size = 20 }: { size?: number }) {
  return (
    <svg className="godweb-glyph" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="gw-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f7cff" />
          <stop offset="1" stopColor="#8a3ff0" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="12" rx="10.5" ry="4.6" transform="rotate(-32 12 12)" stroke="url(#gw-g)" strokeWidth="1.7" opacity="0.5" />
      <circle cx="12" cy="12" r="6" fill="url(#gw-g)" />
      <circle cx="9.7" cy="9.9" r="1.7" fill="#fff" opacity="0.55" />
      <circle cx="20.3" cy="7.3" r="1.5" fill="url(#gw-g)" />
    </svg>
  );
}
