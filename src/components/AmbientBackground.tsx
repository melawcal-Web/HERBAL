/** Soft animated backdrop (CSS-only). */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f3f8f4]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(74,146,80,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(92,122,94,0.12),transparent_50%),radial-gradient(ellipse_60%_45%_at_0%_80%,rgba(74,146,80,0.1),transparent_45%)]" />
      <div className="animate-float-slow absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl motion-reduce:animate-none" />
      <div className="animate-float-delayed absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-teal-400/15 blur-3xl motion-reduce:animate-none" />
      <div className="animate-pulse-glow absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-lime-200/20 blur-3xl motion-reduce:animate-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.35)_40%,rgba(243,248,244,0.92))]" />
    </div>
  );
}
