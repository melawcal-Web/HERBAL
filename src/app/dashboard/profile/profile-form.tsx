"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateTherapistProfile } from "@/app/actions/profile";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";

type TimelineRow = { yearFrom: string; yearTo: string; description: string };

type Initial = {
  slug: string;
  bio: string;
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
  showPublicCalendar: boolean;
  portfolioTimeline: TimelineRow[];
};

function profileFormSnapshot(i: Initial): string {
  return JSON.stringify({
    slug: i.slug,
    bio: i.bio,
    specialty1: i.specialty1,
    specialty2: i.specialty2,
    specialty3: i.specialty3,
    publicTherapistTitle: i.publicTherapistTitle,
    profileImageUrl: i.profileImageUrl,
    acceptsSupervisionRequests: i.acceptsSupervisionRequests,
    supervisionHourlyRate: i.supervisionHourlyRate,
    contactPhone: i.contactPhone,
    contactCity: i.contactCity,
    contactWhatsapp: i.contactWhatsapp,
    contactPublicEmail: i.contactPublicEmail,
    website: i.website,
    instagram: i.instagram,
    facebook: i.facebook,
    tiktok: i.tiktok,
    showPublicCalendar: i.showPublicCalendar,
    portfolioTimeline: i.portfolioTimeline,
  });
}

function parseYearSafe(raw: string): number {
  const t = raw.trim();
  if (!t) return NaN;
  const n = Number(t);
  if (!Number.isFinite(n)) return NaN;
  const y = Math.floor(n);
  if (y < 1900 || y > 2100) return NaN;
  return y;
}

function normalizeTimeline(rows: TimelineRow[]): { yearFrom: number; yearTo?: number | null; description: string }[] {
  const out: { yearFrom: number; yearTo?: number | null; description: string }[] = [];
  for (const row of rows) {
    const y1 = parseYearSafe(row.yearFrom);
    const y2 = row.yearTo.trim() ? parseYearSafe(row.yearTo) : NaN;
    const desc = row.description.trim();
    if (!Number.isFinite(y1) || !desc) continue;
    const yearTo = Number.isFinite(y2) ? y2 : null;
    out.push({ yearFrom: y1, yearTo, description: desc });
  }
  out.sort((a, b) => b.yearFrom - a.yearFrom);
  return out.slice(0, 12);
}

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { update: updateSession } = useSession();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [imageUploadBusy, setImageUploadBusy] = useState(false);

  const isDirty = useMemo(() => profileFormSnapshot(form) !== profileFormSnapshot(initial), [form, initial]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

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
          publicTherapistTitle: form.publicTherapistTitle,
          profileImageUrl: form.profileImageUrl.trim() === "" ? null : form.profileImageUrl.trim(),
          acceptsSupervisionRequests: form.acceptsSupervisionRequests,
          supervisionHourlyRate:
            form.acceptsSupervisionRequests && form.supervisionHourlyRate.trim() !== ""
              ? Number(form.supervisionHourlyRate)
              : null,
          portfolioTimeline: normalizeTimeline(form.portfolioTimeline),
          contactPhone: form.contactPhone,
          contactCity: form.contactCity,
          contactWhatsapp: form.contactWhatsapp,
          contactPublicEmail: form.contactPublicEmail,
          website: form.website,
          instagram: form.instagram,
          facebook: form.facebook,
          tiktok: form.tiktok,
          showPublicCalendar: form.showPublicCalendar,
        });
        setOk(true);
        try {
          await updateSession?.();
        } catch {
          /* רענון סשן אופציונלי — לא לכשל שמירה */
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  const showStickySave = isDirty || imageUploadBusy;

  return (
    <form ref={formRef} onSubmit={onSubmit} className={`space-y-4 ${showStickySave ? "pb-28 sm:pb-32" : ""}`}>
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
            uploadOnly
            onBusyChange={setImageUploadBusy}
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

      <fieldset className="rounded-2xl border border-herbal-200/80 bg-white/80 p-4">
        <legend className="text-sm font-medium text-herbal-900">ניסיון והכשרה (ציר זמן)</legend>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          לדוגמה: <span dir="ltr">2006–2018</span> · לימודים/הכשרה/ניסיון קליני. יוצג בפאנל השמאלי בדף הציבורי.
        </p>

        <div className="mt-4 space-y-3">
          {form.portfolioTimeline.map((row, idx) => (
            <div key={idx} className="rounded-2xl border border-herbal-100 bg-herbal-50/40 p-3">
              <div className="grid gap-3 sm:grid-cols-[140px_140px_1fr]">
                <div>
                  <label className="text-xs font-semibold text-slate-700">שנה התחלה</label>
                  <input
                    inputMode="numeric"
                    placeholder="2006"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
                    dir="ltr"
                    value={row.yearFrom}
                    onChange={(e) => {
                      const next = [...form.portfolioTimeline];
                      next[idx] = { ...next[idx]!, yearFrom: e.target.value };
                      setForm({ ...form, portfolioTimeline: next });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">שנה סיום (אופציונלי)</label>
                  <input
                    inputMode="numeric"
                    placeholder="2018"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
                    dir="ltr"
                    value={row.yearTo}
                    onChange={(e) => {
                      const next = [...form.portfolioTimeline];
                      next[idx] = { ...next[idx]!, yearTo: e.target.value };
                      setForm({ ...form, portfolioTimeline: next });
                    }}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-700">תיאור</label>
                  <input
                    required
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2"
                    value={row.description}
                    onChange={(e) => {
                      const next = [...form.portfolioTimeline];
                      next[idx] = { ...next[idx]!, description: e.target.value };
                      setForm({ ...form, portfolioTimeline: next });
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-start">
                <button
                  type="button"
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    const next = form.portfolioTimeline.filter((_, i) => i !== idx);
                    setForm({ ...form, portfolioTimeline: next });
                  }}
                >
                  מחיקה
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="w-full rounded-2xl border border-dashed border-herbal-200 bg-white/70 px-4 py-3 text-sm font-semibold text-herbal-900 hover:bg-herbal-50"
            onClick={() => {
              setForm({
                ...form,
                portfolioTimeline: [...form.portfolioTimeline, { yearFrom: "", yearTo: "", description: "" }],
              });
            }}
          >
            הוספת שורה
          </button>
        </div>
      </fieldset>
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
        disabled={pending || imageUploadBusy}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : imageUploadBusy ? "ממתינים לסיום העלאת תמונה…" : "שמירת פרופיל"}
      </button>

      {showStickySave ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-herbal-200/95 bg-white/95 px-4 py-3 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-6"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          role="region"
          aria-label="שמירת פרופיל"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-right text-sm font-medium text-herbal-900">
              {imageUploadBusy
                ? "מעלים תמונה — המתינו לסיום לפני שמירה."
                : isDirty
                  ? "יש שינויים שלא נשמרו במסד. לפני מעבר לדף אחר או סגירת הדפדפן — שמרו."
                  : null}
            </p>
            <button
              type="button"
              disabled={pending || imageUploadBusy}
              onClick={() => formRef.current?.requestSubmit()}
              className="min-h-[48px] shrink-0 rounded-full bg-herbal-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-herbal-500 disabled:opacity-50 sm:min-w-[11rem]"
            >
              {pending ? "שומרים…" : imageUploadBusy ? "ממתינים להעלאה…" : "שמירת פרופיל"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
