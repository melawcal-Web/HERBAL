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
    <header className="sticky top-0 z-40 border-b border-herbal-200/80 bg-herbal-50/95 backdrop-blur-md animate-fade-in">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-herbal-800 transition hover:text-herbal-600 sm:text-xl"
        >
          המרכז למטפלים בצמחי מרפא
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3 sm:text-base">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[44px] items-center rounded-full px-3 py-2 text-herbal-800 transition hover:bg-herbal-100 active:scale-[0.98]"
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex min-h-[44px] items-center rounded-full px-3 py-2 text-herbal-800 transition hover:bg-herbal-100"
              >
                לוח בקרה
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-full border border-herbal-300 bg-white px-4 py-2 text-sm text-herbal-900 hover:bg-herbal-50"
                >
                  יציאה
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="flex min-h-[44px] items-center rounded-full px-3 py-2 text-herbal-800 transition hover:bg-herbal-100"
              >
                כניסה
              </Link>
              <Link
                href="/auth/register"
                className="flex min-h-[44px] items-center rounded-full bg-herbal-600 px-4 py-2 text-sm text-white hover:bg-herbal-500"
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
