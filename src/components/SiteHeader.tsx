import Link from "next/link";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";

const links = [
  { href: "/therapists", label: "מטפלים" },
  { href: "/marketplace", label: "שוק" },
  { href: "/herbal-index", label: "אינדקס צמחים" },
];

export function SiteHeader({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-50 animate-fade-in px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass-panel-strong mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
        <Link
          href="/"
          className="inline-block font-display text-lg font-bold text-gradient-herbal transition hover:opacity-90 sm:text-xl"
        >
          המרכז למטפלים בצמחי מרפא
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1.5 text-sm sm:gap-2 sm:text-base">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="link-pill min-h-[44px] inline-flex items-center">
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link href="/dashboard" className="link-pill min-h-[44px] inline-flex items-center">
                לוח בקרה
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="link-pill min-h-[44px] border-herbal-200/80 bg-white/70 text-herbal-900"
                >
                  יציאה
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="link-pill min-h-[44px] inline-flex items-center">
                כניסה
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white btn-shimmer sm:px-5"
              >
                הרשמה
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
