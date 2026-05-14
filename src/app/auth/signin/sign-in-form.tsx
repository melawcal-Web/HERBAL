"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignInForm({
  callbackUrl,
  showRegisteredBanner,
}: {
  callbackUrl: string;
  showRegisteredBanner?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("פרטי התחברות שגויים");
        return;
      }
      router.push(res?.url ?? callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">כניסה</h1>
      {showRegisteredBanner && (
        <p className="mt-3 rounded-xl border border-herbal-200 bg-herbal-50 px-3 py-2 text-sm text-herbal-800">
          החשבון נוצר בהצלחה — ניתן להתחבר.
        </p>
      )}
      <p className="mt-2 text-slate-600">התחברו לחשבון המטפל או הלקוח שלכם.</p>

      <div className="mt-8 space-y-3">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>

      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">או</span>
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">אימייל</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">סיסמה</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {loading ? "מתחברים…" : "כניסה"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/auth/register" className="font-semibold text-herbal-800 underline-offset-4 hover:underline">
          אין לכם חשבון? הרשמה
        </Link>
        {" · "}
        <Link href="/auth" className="text-herbal-700 underline-offset-4 hover:underline">
          דף כניסה והרשמה
        </Link>
      </p>
    </div>
  );
}
