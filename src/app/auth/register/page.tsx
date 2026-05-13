"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "therapist">("client");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "שגיאה בהרשמה");
      setLoading(false);
      return;
    }
    router.push("/auth/signin?registered=1");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">הרשמה מאובטחת</h1>
      <p className="mt-2 text-slate-600">בחרו תפקיד: לקוח לגלישה במטפלים ובאינדקס, או מטפל לכלי EMR.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
          <legend className="text-sm font-medium text-slate-700">סוג משתמש</legend>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={() => setRole("client")}
            />
            לקוח — גלישה במטפלים ובאינדקס הצמחים
          </label>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
            <input
              type="radio"
              name="role"
              value="therapist"
              checked={role === "therapist"}
              onChange={() => setRole("therapist")}
            />
            מטפל — דף נחיתה ו-EMR (אישור פרופיל בהמשך)
          </label>
        </fieldset>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {loading ? "נרשמים…" : "צור חשבון"}
        </button>
      </form>
    </div>
  );
}
