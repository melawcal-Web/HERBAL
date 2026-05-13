import Link from "next/link";

function deployLabel() {
  const iso = process.env.NEXT_PUBLIC_BUILD_TIME_ISO;
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  if (!iso) return "זמן בילד לא זמין";
  const when = new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const shortSha = sha && sha.length >= 7 ? sha.slice(0, 7) : null;
  return shortSha ? `${when} · קומיט ${shortSha}` : when;
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-herbal-200 bg-white/80 py-10 text-center text-sm text-slate-600 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-display text-herbal-800">
          The Center for Herbal Therapists · המרכז למטפלים בצמחי מרפא
        </p>
        <p className="mt-2 max-w-2xl mx-auto">
          פלטפורמה לקהילה, לימודים ותיעוד קליני. Community, learning, and clinical documentation in one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/herbal-index" className="text-herbal-700 underline-offset-4 hover:underline min-h-[44px] inline-flex items-center">
            Herbal Index
          </Link>
          <Link href="/marketplace" className="text-herbal-700 underline-offset-4 hover:underline min-h-[44px] inline-flex items-center">
            Marketplace
          </Link>
          <Link href="/auth/register" className="text-herbal-700 underline-offset-4 hover:underline min-h-[44px] inline-flex items-center">
            Join
          </Link>
          <Link
            href="/admin"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-amber-400 bg-amber-50 px-4 text-amber-950 hover:bg-amber-100"
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
