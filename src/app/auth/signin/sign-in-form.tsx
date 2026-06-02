"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

export default function SignInForm({
  callbackUrl,
  showRegisteredBanner,
  showPendingTherapistBanner,
}: {
  callbackUrl: string;
  showRegisteredBanner?: boolean;
  showPendingTherapistBanner?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">כניסה</h1>
      {showRegisteredBanner && (
        <p className="mt-3 rounded-xl border border-herbal-200 bg-herbal-50 px-3 py-2 text-sm text-herbal-800">
          החשבון נוצר בהצלחה — אפשר להתחבר עם אימייל+סיסמה או עם Google.
        </p>
      )}
      {showPendingTherapistBanner && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          נרשמתם כמטפלים — חשבונכם במצב ממתין לאישור תעודה. לאחר אישור האדמין יופעלו הדף הציבורי, האינדקס ו-EMR.
        </p>
      )}
      <p className="mt-2 text-slate-600">אפשר להתחבר עם אימייל+סיסמה (כולל Yahoo) או עם חשבון Google.</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          startTransition(() => {
            void (async () => {
              const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl,
              });
              if (res?.error) {
                setErr("אימייל או סיסמה שגויים.");
                return;
              }
              if (res?.ok) {
                window.location.assign(res.url ?? callbackUrl);
                return;
              }
              setErr("שגיאה בהתחברות.");
            })();
          });
        }}
      >
        <div>
          <label className="text-sm font-medium text-slate-700">אימייל</label>
          <input
            type="email"
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">סיסמה</label>
          <input
            type="password"
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {err ? <p className="text-sm text-rose-600">{err}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {pending ? "מתחברים…" : "כניסה"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">או</span>
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
      </div>

      <GoogleSignInButton callbackUrl={callbackUrl} />

      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/auth/register" className="font-semibold text-herbal-800 underline-offset-4 hover:underline">
          אין לכם חשבון? הרשמה
        </Link>
      </p>
    </div>
  );
}
