"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";

const menuLinks = [
  { href: "/therapists", label: "מטפלים" },
  { href: "/marketplace", label: "שוק" },
  { href: "/herbal-index", label: "אינדקס צמחים" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-center gap-1.5" aria-hidden>
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-y-[5px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`block h-0.5 rounded-full bg-herbal-800 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "-translate-y-[5px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function SiteHeader({ session, siteTitle }: { session: Session | null; siteTitle: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="glass-panel-strong flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-glass transition-shadow duration-300 ease-out sm:px-5 sm:py-3.5">
        <Link
          href="/"
          className="min-w-0 flex-1 font-display text-base font-bold leading-snug text-gradient-herbal transition-opacity duration-200 hover:opacity-90 sm:text-lg"
          onClick={() => setOpen(false)}
        >
          {siteTitle}
        </Link>
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-herbal-200/80 bg-white/80 text-herbal-900 shadow-sm transition-colors duration-200 hover:border-herbal-300 hover:bg-white motion-reduce:transition-none"
          aria-expanded={open}
          aria-controls="site-nav-drawer"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          onClick={() => setOpen((o) => !o)}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <nav
        id="site-nav-drawer"
        className={`fixed left-0 top-0 z-[101] flex h-full w-[min(100vw,20rem)] flex-col border-herbal-100/90 bg-white/95 shadow-2xl shadow-herbal-900/15 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:max-w-sm ${
          open ? "pointer-events-auto translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-herbal-100/80 px-4 py-3">
          <p className="text-sm font-semibold text-herbal-800">תפריט</p>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-slate-600 transition hover:bg-herbal-50 hover:text-herbal-900"
            onClick={() => setOpen(false)}
          >
            סגירה
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {menuLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="min-h-[48px] rounded-xl px-3 py-3 text-base font-medium text-herbal-900 transition-colors duration-200 hover:bg-herbal-50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="my-2 border-t border-herbal-100/90" />
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="min-h-[48px] rounded-xl px-3 py-3 text-base font-medium text-herbal-900 transition-colors duration-200 hover:bg-herbal-50"
                onClick={() => setOpen(false)}
              >
                לוח בקרה
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="min-h-[48px] w-full rounded-xl px-3 py-3 text-right text-base font-medium text-herbal-900 transition-colors duration-200 hover:bg-herbal-50"
                >
                  יציאה
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="min-h-[48px] rounded-xl px-3 py-3 text-base font-medium text-herbal-900 transition-colors duration-200 hover:bg-herbal-50"
                onClick={() => setOpen(false)}
              >
                כניסה
              </Link>
              <Link
                href="/auth/register"
                className="min-h-[48px] rounded-xl px-3 py-3 text-base font-semibold text-herbal-700 transition-colors duration-200 hover:bg-herbal-50"
                onClick={() => setOpen(false)}
              >
                הרשמה
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

