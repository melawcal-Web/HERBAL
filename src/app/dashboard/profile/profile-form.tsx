"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTherapistProfile } from "@/app/actions/profile";

type Initial = {
  slug: string;
  bio: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
  contactPhone: string;
  contactCity: string;
  website: string;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    startTransition(async () => {
      try {
        await updateTherapistProfile({
          slug: form.slug,
          bio: form.bio,
          specialty1: form.specialty1,
          specialty2: form.specialty2,
          specialty3: form.specialty3,
          contactPhone: form.contactPhone,
          contactCity: form.contactCity,
          website: form.website,
        });
        setOk(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">כתובת דף ציבורית (slug)</label>
        <input
          required
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 font-mono text-left"
          dir="ltr"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">ביו</label>
        <textarea
          required
          className="mt-1 w-full min-h-[140px] rounded-xl border border-herbal-200 px-3 py-2"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["specialty1", "specialty2", "specialty3"] as const).map((k, idx) => (
          <div key={k}>
            <label className="text-sm font-medium text-slate-700">מומחיות {idx + 1}</label>
            <input
              required
              className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">טלפון</label>
          <input
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">עיר</label>
          <input
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            value={form.contactCity}
            onChange={(e) => setForm({ ...form, contactCity: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">אתר / רשת חברתית</label>
        <input
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          dir="ltr"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {ok && <p className="text-sm text-herbal-700">הפרופיל עודכן.</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירה"}
      </button>
    </form>
  );
}
