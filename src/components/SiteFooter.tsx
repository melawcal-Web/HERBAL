import Link from "next/link";

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
        </div>
      </div>
    </footer>
  );
}
