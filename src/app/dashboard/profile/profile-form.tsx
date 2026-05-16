"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateTherapistProfile } from "@/app/actions/profile";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { PortfolioTimelineEditor } from "@/components/dashboard/PortfolioTimelineEditor";
import type { PortfolioTimelineEntry } from "@/lib/portfolio-timeline";

type Initial = {
  slug: string;
  bio: string;
  clinicalExperience: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
  publicTherapistTitle: "male" | "female";
  profileImageUrl: string;
  acceptsSupervisionRequests: boolean;
  supervisionHourlyRate: string;
  contactPhone: string;
  contactCity: string;
  contactWhatsapp: string;
  contactPublicEmail: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolioTimeline: PortfolioTimelineEntry[];
  showPublicCalendar: boolean;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
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
          clinicalExperience: form.clinicalExperience,
          specialty1: form.specialty1,
          specialty2: form.specialty2,
          specialty3: form.specialty3,
          publicTherapistTitle: form.publicTherapistTitle,
          profileImageUrl: form.profileImageUrl.trim() === "" ? null : form.profileImageUrl.trim(),
          acceptsSupervisionRequests: form.acceptsSupervisionRequests,
          supervisionHourlyRate:
            form.acceptsSupervisionRequests && form.supervisionHourlyRate.trim() !== ""
              ? Number(form.supervisionHourlyRate)
              : null,
          contactPhone: form.contactPhone,
          contactCity: form.contactCity,
          contactWhatsapp: form.contactWhatsapp,
          contactPublicEmail: form.contactPublicEmail,
          website: form.website,
          instagram: form.instagram,
          facebook: form.facebook,
          tiktok: form.tiktok,
          portfolioTimeline: form.portfolioTimeline,
          showPublicCalendar: form.showPublicCalendar,
        });
        setOk(true);
        await updateSession?.();
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
      <fieldset className="space-y-2 rounded-2xl border border-herbal-200/80 bg-white/80 p-4">
        <legend className="text-sm font-medium text-herbal-900">כותרת מקצועית בדף הציבורי</legend>
        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
          <input
            type="radio"
            name="publicTherapistTitle"
            checked={form.publicTherapistTitle === "female"}
            onChange={() => setForm({ ...form, publicTherapistTitle: "female" })}
          />
          מטפלת בצמחי מרפא
        </label>
        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-herbal-200 px-3 py-2 has-[:checked]:border-herbal-500 has-[:checked]:bg-herbal-50">
          <input
            type="radio"
            name="publicTherapistTitle"
            checked={form.publicTherapistTitle === "male"}
            onChange={() => setForm({ ...form, publicTherapistTitle: "male" })}
          />
          מטפל בצמחי מרפא
        </label>
      </fieldset>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ProfileAvatar
          imageUrl={form.profileImageUrl}
          name="תמונת פרופיל"
          seed="profile-form-preview"
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <ImagePicker
            label="תמונת פרופיל"
            value={form.profileImageUrl}
            uploadPrefix="profiles"
            onChange={(url) => setForm({ ...form, profileImageUrl: url })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">ביו — אודותיי (מוצג בדף הציבורי)</label>
        <textarea
          required
          className="mt-1 w-full min-h-[140px] rounded-xl border border-herbal-200 px-3 py-2"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <PortfolioTimelineEditor
        value={form.portfolioTimeline}
        onChange={(portfolioTimeline) => setForm({ ...form, portfolioTimeline })}
      />
      <div>
        <label className="text-sm font-medium text-slate-700">ניסיון קליני והשכלה — טקסט חופשי (אופציונלי)</label>
        <textarea
          className="mt-1 w-full min-h-[120px] rounded-xl border border-herbal-200 px-3 py-2"
          placeholder="הכשרות, קורסים, שנות ניסיון בתחומים ספציפיים…"
          value={form.clinicalExperience}
          onChange={(e) => setForm({ ...form, clinicalExperience: e.target.value })}
        />
      </div>
      <div className="rounded-2xl border border-herbal-200/80 bg-herbal-50/40 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-herbal-900">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-herbal-300 text-herbal-700"
            checked={form.showPublicCalendar}
            onChange={(e) => setForm({ ...form, showPublicCalendar: e.target.checked })}
          />
          <span>להציג בדף הציבורי יומן / מועדים פנויים (אם הוגדרו שעות זמינות)</span>
        </label>
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
      <div className="rounded-2xl border border-herbal-200/80 bg-herbal-50/60 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-herbal-900">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-herbal-300 text-herbal-700"
            checked={form.acceptsSupervisionRequests}
            onChange={(e) =>
              setForm({
                ...form,
                acceptsSupervisionRequests: e.target.checked,
                supervisionHourlyRate: e.target.checked ? form.supervisionHourlyRate : "",
              })
            }
          />
          <span>לאפשר פניות להשגחה מקצועית מהדף הציבורי</span>
        </label>
        {form.acceptsSupervisionRequests ? (
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">מחיר לשעה (₪)</label>
            <input
              type="number"
              min="1"
              step="1"
              className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
              dir="ltr"
              value={form.supervisionHourlyRate}
              onChange={(e) => setForm({ ...form, supervisionHourlyRate: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-600">יוצג בדף הציבורי לצד פרטי ההשגחה.</p>
          </div>
        ) : null}
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
        <label className="text-sm font-medium text-slate-700">מספר WhatsApp (לינק צ׳אט — ספרות בלבד מומלץ)</label>
        <input
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          dir="ltr"
          placeholder="972501234567"
          value={form.contactWhatsapp}
          onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">אימייל ליצירת קשר (מוצג בדף הציבורי בלבד אם מולא)</label>
        <input
          type="email"
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          dir="ltr"
          value={form.contactPublicEmail}
          onChange={(e) => setForm({ ...form, contactPublicEmail: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Instagram (שם משתמש או קישור מלא)</label>
          <input
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            dir="ltr"
            placeholder="@username"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Facebook (קישור לעמוד או שם עמוד)</label>
          <input
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            dir="ltr"
            placeholder="https://facebook.com/..."
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">TikTok (שם משתמש או קישור מלא)</label>
          <input
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
            dir="ltr"
            placeholder="@username"
            value={form.tiktok}
            onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">אתר אישי (כתובת מלאה)</label>
        <input
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          dir="ltr"
          placeholder="https://..."
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
