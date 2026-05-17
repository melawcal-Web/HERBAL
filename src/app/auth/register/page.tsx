"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type Persona = "therapist" | "student" | "interested";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [persona, setPersona] = useState<Persona>("interested");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, persona, certificateUrl, phone }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; pendingTherapistApproval?: boolean };
    if (!res.ok) {
      setError(data.error ?? "שגיאה בהרשמה");
      setLoading(false);
      return;
    }
    const q = data.pendingTherapistApproval ? "registered=1&pendingTherapist=1" : "registered=1";
    router.push(`/auth/signin?${q}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">הרשמה מאובטחת</h1>
      <p className="mt-2 text-slate-600">
        בחרו מסלול: מטפל/ת (נדרשת תעודה ואישור מנהל), סטודנט/ת, או חבר קהילה — גלישה בקהילה ובאינדקס.
      </p>
      <div className="mt-8 space-y-3">
        <GoogleSignInButton callbackUrl="/dashboard/profile" />
      </div>

      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">או הרשמה באימייל</span>
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">שם מלא</label>
          <input
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">אימייל</label>
          <input
            type="email"
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">טלפון (אופציונלי)</label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 font-mono text-sm"
            dir="ltr"
            placeholder="050-0000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">משמש לדוחות פניות ויצירת קשר כשתפנו למטפלים.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">סיסמה</label>
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">מסלול</legend>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
            <input type="radio" name="persona" checked={persona === "therapist"} onChange={() => setPersona("therapist")} />
            מטפל/ת — דף ציבורי ו-EMR לאחר אישור תעודה
          </label>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
            <input type="radio" name="persona" checked={persona === "student"} onChange={() => setPersona("student")} />
            סטודנט/ית
          </label>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
            <input type="radio" name="persona" checked={persona === "interested"} onChange={() => setPersona("interested")} />
            חבר קהילה
          </label>
        </fieldset>
        {persona === "therapist" ? (
          <div>
            <label className="text-sm font-medium text-slate-700">קישור לתעודה (https)</label>
            <input
              required
              type="url"
              className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 font-mono text-sm"
              dir="ltr"
              placeholder="https://..."
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-600">יש להעלות את קובץ התעודה לשירות ענן ולהדביק כאן כתובת ציבורית ב-https.</p>
          </div>
        ) : null}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {loading ? "נרשמים…" : "צור חשבון"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/auth/signin" className="font-semibold text-herbal-800 underline-offset-4 hover:underline">
          כבר רשומים? כניסה
        </Link>
        {" · "}
        <Link href="/auth" className="text-herbal-700 underline-offset-4 hover:underline">
          דף כניסה והרשמה
        </Link>
      </p>
    </div>
  );
}
