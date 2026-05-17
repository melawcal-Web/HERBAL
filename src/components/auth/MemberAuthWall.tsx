"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * מסך מודאלי — משתמש/ת לא מחובר/ת שניסו/ה לצפות בתוכן שמוגבל לחברים רשומים.
 * מאמרי `/herbal-index` נשארים ציבוריים (קישור בתחתית).
 */
export function MemberAuthWall({ callbackPath }: { callbackPath: string }) {
  const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
  const encoded = encodeURIComponent(path);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/55 px-4 py-8 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-title"
    >
      <div className="max-h-[min(92vh,640px)] w-full max-w-md overflow-y-auto rounded-2xl border border-herbal-100 bg-white p-6 shadow-2xl shadow-herbal-900/25 sm:p-8">
        <h2 id="member-auth-title" className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">
          נדרשת הרשמה והתחברות
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          כדי לצפות בפרטי מטפלים, בחומרים ובתוכן המפורט באתר, יש להתחבר לחשבון רשום. מאמרי האינדקס נשארים פתוחים לכולם.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
          <Link
            href={`/auth/register?callbackUrl=${encoded}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-5 text-sm font-semibold text-white transition hover:bg-herbal-500"
          >
            הרשמה
          </Link>
          <Link
            href={`/auth/signin?callbackUrl=${encoded}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-herbal-200 bg-white px-5 text-sm font-semibold text-herbal-900 transition hover:bg-herbal-50"
          >
            כניסה
          </Link>
        </div>
        <p className="mt-5 border-t border-herbal-100 pt-5 text-center text-sm text-slate-600">
          <Link href="/herbal-index" className="font-semibold text-herbal-700 underline-offset-2 hover:underline">
            המשך לאינדקס המאמרים (ללא התחברות)
          </Link>
        </p>
      </div>
    </div>
  );
}
