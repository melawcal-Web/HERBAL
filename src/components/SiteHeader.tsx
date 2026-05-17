"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";
import { HeaderSearch } from "@/components/HeaderSearch";
import { UserAccountMenu } from "@/components/UserAccountMenu";

const menuLinks = [
  { href: "/therapists", label: "מטפלים" },
  { href: "/marketplace", label: "קורסים וסדנאות" },
  { href: "/content-hub", label: "מרכז תוכן" },
  { href: "/herbal-index", label: "אינדקס צמחים" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-center gap-1.5" aria-hidden>
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-transform duration-200 ease-out motion-reduce:transition-none ${
          open ? "translate-y-[5px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-transform duration-200 ease-out motion-reduce:transition-none ${
          open ? "-translate-y-[5px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function UserGuestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
      <path d="M4 4l16 16" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader({ session, siteTitle }: { session: Session | null; siteTitle: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="glass-panel-strong flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 shadow-glass transition-shadow duration-300 ease-out sm:gap-3 sm:px-5 sm:py-3.5">
        <Link
          href="/"
          className="min-w-0 flex-1 font-display text-base font-bold leading-snug text-gradient-herbal transition-opacity duration-200 hover:opacity-90 sm:text-lg"
          onClick={() => setOpen(false)}
        >
          {siteTitle}
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HeaderSearch />
          {session?.user ? (
            <UserAccountMenu session={session} />
          ) : (
            <Link
              href="/auth/signin"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-herbal-200/80 bg-white/80 text-herbal-700 shadow-sm transition hover:border-herbal-300 hover:bg-white motion-reduce:transition-none"
              aria-label="אורח — כניסה והרשמה"
              title="כניסה והרשמה"
            >
              <UserGuestIcon className="h-6 w-6" />
            </Link>
          )}

          <div ref={wrapRef} className="relative">
            <button
              type="button"
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-herbal-200/80 bg-white/80 px-2.5 py-1.5 text-sm font-semibold text-herbal-900 shadow-sm transition-colors duration-200 hover:border-herbal-300 hover:bg-white motion-reduce:transition-none sm:px-3"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label={open ? "סגירת תפריט" : "תפריט ראשי"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="hidden sm:inline">תפריט</span>
              <MenuIcon open={open} />
            </button>

            {open ? (
              <div
                role="menu"
                className="absolute end-0 top-full z-[60] mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-herbal-100 bg-white py-2 shadow-xl shadow-herbal-900/10"
              >
                {menuLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm font-medium text-herbal-900 transition hover:bg-herbal-50"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-herbal-100" />
                {session?.user ? (
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="w-full px-4 py-2.5 text-right text-sm font-medium text-herbal-900 transition hover:bg-herbal-50"
                    >
                      יציאה
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/auth/signin"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm font-medium text-herbal-900 transition hover:bg-herbal-50"
                    onClick={() => setOpen(false)}
                  >
                    כניסה / הרשמה
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
