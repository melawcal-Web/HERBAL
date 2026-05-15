"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const allowPassword = process.env.NEXT_PUBLIC_ALLOW_PASSWORD_AUTH === "true";

export default function SignInForm({
  callbackUrl,
  showRegisteredBanner,
  showPendingTherapistBanner,
}: {
  callbackUrl: string;
  showRegisteredBanner?: boolean;
  showPendingTherapistBanner?: boolean;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">כניסה</h1>
      {showRegisteredBanner && (
        <p className="mt-3 rounded-xl border border-herbal-200 bg-herbal-50 px-3 py-2 text-sm text-herbal-800">
          החשבון נוצר בהצלחה — התחברו עם Google.
        </p>
      )}
      {showPendingTherapistBanner && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          נרשמתם כמטפלים — חשבונכם במצב ממתין לאישור תעודה. לאחר אישור האדמין יופעלו הדף הציבורי, האינדקס ו-EMR.
        </p>
      )}
      <p className="mt-2 text-slate-600">
        גישה מאובטחת באמצעות חשבון Google בלבד. הזהות נשמרת לפי האימייל של Google.
      </p>

      <div className="mt-8">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>

      <p className="mt-6 rounded-xl border border-herbal-100 bg-herbal-50/60 px-3 py-2 text-xs text-slate-600">
        הגדרת OAuth: ראו <code className="text-herbal-800">GOOGLE_OAUTH_SETUP.md</code> בפרויקט.
      </p>

      {allowPassword ? (
        <p className="mt-4 text-center text-xs text-amber-800">
          מצב פיתוח: התחברות בסיסמה מושבתת ב-UI — הגדירו Google OAuth.
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/auth/register" className="font-semibold text-herbal-800 underline-offset-4 hover:underline">
          אין לכם חשבון? הרשמה
        </Link>
      </p>
    </div>
  );
}
