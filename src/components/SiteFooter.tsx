import Link from "next/link";

function deployLabel() {
  const iso = process.env.NEXT_PUBLIC_BUILD_TIME_ISO;
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  if (!iso) return "זמן בילד לא זמין";
  const when = new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  });
  const shortSha = sha && sha.length >= 7 ? sha.slice(0, 7) : null;
  return shortSha ? `${when} · קומיט ${shortSha}` : when;
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto w-full pb-6 pt-8">
      <div className="glass-panel w-full px-4 py-8 text-center text-sm text-slate-600 transition-opacity duration-500 ease-out animate-fade-in sm:py-10">
        <p className="inline-block font-display text-base font-semibold text-gradient-herbal sm:text-lg">
          The Center for Herbal Therapists · המרכז למטפלים בצמחי מרפא
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          פלטפורמה לקהילה, לימודים ותיעוד קליני. Community, learning, and clinical documentation in one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
          <Link href="/herbal-index" className="link-pill min-h-[44px] inline-flex items-center">
            Herbal Index
          </Link>
          <Link href="/marketplace" className="link-pill min-h-[44px] inline-flex items-center">
            Marketplace
          </Link>
          <Link href="/auth/register" className="link-pill min-h-[44px] inline-flex items-center">
            Join
          </Link>
          <Link
            href="/admin"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-amber-300/80 bg-gradient-to-br from-amber-50 to-amber-100/90 px-4 text-amber-950 shadow-sm backdrop-blur-sm transition hover:scale-[1.02] hover:shadow-md"
          >
            כניסה לניהול
          </Link>
        </div>
        <p className="mt-8 text-xs text-slate-500" title="נקבע בזמן בילד האחרון ב-Vercel">
          עדכון אתר (פריסה): <span className="font-mono text-slate-600">{deployLabel()}</span>
        </p>
      </div>
    </footer>
  );
}
