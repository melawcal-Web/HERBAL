"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import {
  createTherapistArticle,
  createTherapistLecture,
  createTherapistPlantArticle,
  createTherapistWorkshop,
  createTherapistZoomSession,
} from "@/app/actions/therapist-content";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { isStoredImageUrl } from "@/lib/stored-image-url";
import { AudienceMultiSelect } from "@/components/forms/AudienceMultiSelect";
import type { ContentAudienceId } from "@/lib/content-audience";

type Mode = null | "article" | "plant" | "lecture" | "workshop" | "zoom";

function ActionTile({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-2xl border border-herbal-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-herbal-300 hover:shadow-md motion-reduce:transition-none"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-herbal-50 text-herbal-800">{icon}</span>
      <span className="font-display text-base font-bold text-herbal-900">{title}</span>
      <span className="text-xs leading-relaxed text-slate-600">{subtitle}</span>
    </button>
  );
}

function IconArticle() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" />
      <path d="M8 7h8M8 11h8" strokeLinecap="round" />
    </svg>
  );
}

function IconCourseFrontal() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h6" strokeLinecap="round" />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3" strokeLinecap="round" />
    </svg>
  );
}

function ModalBackdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <button
      type="button"
      aria-label="סגירה"
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[1px] motion-reduce:backdrop-blur-none"
      onClick={onClose}
    />
  );
}

function ModalPanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-x-4 bottom-4 z-[201] mx-auto max-h-[min(92vh,720px)] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[min(92vh,720px)] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-herbal-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-herbal-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-herbal-50 hover:text-herbal-900"
          >
            סגירה
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function DashboardAddContent() {
  const [mode, setMode] = useState<Mode>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    setMode(null);
    setMsg(null);
    setErr(null);
  };

  return (
    <section className="mt-10 rounded-2xl border border-herbal-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-bold text-herbal-900">הוספת תוכן</h2>
      <p className="mt-2 text-sm text-slate-600">
        בחרו סוג פריט. התוכן ישויך לפרופיל שלכם ויוצג ללקוחות. חיפוש תמונות בעברית דרך Unsplash (דורש מפתח בשרת).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionTile
          icon={<IconArticle />}
          title="מאמר"
          subtitle="כותרת, תוכן, קטגוריה ותמונה"
          onClick={() => setMode("article")}
        />
        <ActionTile
          icon={<IconArticle />}
          title="צמח"
          subtitle="מאמר צמח לאינדקס — שם הצמח, תוכן ותמונה"
          onClick={() => setMode("plant")}
        />
        <ActionTile
          icon={<IconVideo />}
          title="הרצאה"
          subtitle="מועד, מחירים, קהל יעד ומשתתפים"
          onClick={() => setMode("lecture")}
        />
        <ActionTile
          icon={<IconVideo />}
          title="זום"
          subtitle="קישור זום, מועד, מחירים ומשתתפים"
          onClick={() => setMode("zoom")}
        />
        <ActionTile
          icon={<IconCourseFrontal />}
          title="סדנה"
          subtitle="מיקום פיזי, מועד, מחירים ומשתתפים"
          onClick={() => setMode("workshop")}
        />
      </div>

      {msg ? <p className="mt-4 text-sm text-herbal-700">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm text-rose-600">{err}</p> : null}

      <ModalBackdrop open={mode != null} onClose={close} />
      <ModalPanel
        open={mode === "article"}
        title="הוספת מאמר"
        onClose={close}
      >
        <ArticleForm
          pending={pending}
          onDone={(m) => {
            setMsg(m);
            close();
          }}
          onError={setErr}
          startTransition={startTransition}
        />
      </ModalPanel>
      <ModalPanel open={mode === "plant"} title="מאמר צמח" onClose={close}>
        <PlantArticleForm
          pending={pending}
          onDone={(m) => {
            setMsg(m);
            close();
          }}
          onError={setErr}
          startTransition={startTransition}
        />
      </ModalPanel>
      <ModalPanel open={mode === "lecture"} title="הרצאה" onClose={close}>
        <LectureForm
          pending={pending}
          onDone={(m) => {
            setMsg(m);
            close();
          }}
          onError={setErr}
          startTransition={startTransition}
        />
      </ModalPanel>
      <ModalPanel open={mode === "workshop"} title="סדנה" onClose={close}>
        <WorkshopForm
          pending={pending}
          onDone={(m) => {
            setMsg(m);
            close();
          }}
          onError={setErr}
          startTransition={startTransition}
        />
      </ModalPanel>
      <ModalPanel open={mode === "zoom"} title="מפגש זום" onClose={close}>
        <ZoomForm
          pending={pending}
          onDone={(m) => {
            setMsg(m);
            close();
          }}
          onError={setErr}
          startTransition={startTransition}
        />
      </ModalPanel>
    </section>
  );
}

function fieldClass() {
  return "mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2 text-right";
}

function ArticleForm({
  pending,
  onDone,
  onError,
  startTransition,
}: {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");

  function submit() {
    onError(null);
    startTransition(() => {
      void (async () => {
        try {
          await createTherapistArticle({ title, content, category, imageUrl: img });
          onDone("המאמר נשמר ופורסם.");
        } catch (e) {
          onError(e instanceof Error ? e.message : "שגיאה");
        }
      })();
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת</label>
        <input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">קטגוריה</label>
        <input required className={fieldClass()} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">תוכן</label>
        <textarea required className={`${fieldClass()} min-h-[160px]`} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <ImagePicker value={img} onChange={setImg} />
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img)}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירת מאמר"}
      </button>
    </form>
  );
}

function PlantArticleForm({
  pending,
  onDone,
  onError,
  startTransition,
}: {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [plantName, setPlantName] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onError(null);
        startTransition(() => {
          void (async () => {
            try {
              await createTherapistPlantArticle({ title, content, plantName, imageUrl: img });
              onDone("מאמר הצמח נשמר ופורסם באינדקס.");
            } catch (er) {
              onError(er instanceof Error ? er.message : "שגיאה");
            }
          })();
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-slate-700">שם הצמח</label>
        <input required className={fieldClass()} value={plantName} onChange={(e) => setPlantName(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת המאמר</label>
        <input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">תוכן</label>
        <textarea required className={`${fieldClass()} min-h-[160px]`} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <ImagePicker value={img} onChange={setImg} />
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img)}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירת מאמר צמח"}
      </button>
    </form>
  );
}

function LectureForm({
  pending,
  onDone,
  onError,
  startTransition,
}: {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [price, setPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [maxP, setMaxP] = useState("");
  const [img, setImg] = useState("");
  const [courseDetails, setCourseDetails] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onError(null);
        if (audience.length === 0) {
          onError("יש לבחור לפחות קהל יעד אחד");
          return;
        }
        startTransition(() => {
          void (async () => {
            try {
              await createTherapistLecture({
                title,
                startsAt,
                price: Number(price),
                memberPrice: Number(memberPrice),
                maxParticipants: Number(maxP),
                imageUrl: img,
                courseDetails: courseDetails.trim() || undefined,
                audience,
              });
              onDone("ההרצאה נוספה לפרופיל.");
            } catch (er) {
              onError(er instanceof Error ? er.message : "שגיאה");
            }
          })();
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת</label>
        <input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">מועד</label>
        <input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר (₪)</label>
          <input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className={fieldClass()}
            value={memberPrice}
            onChange={(e) => setMemberPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label>
        <input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">פירוט (אופציונלי)</label>
        <textarea
          className={`${fieldClass()} min-h-[100px]`}
          value={courseDetails}
          onChange={(e) => setCourseDetails(e.target.value)}
          placeholder="נושא ההרצאה, קהל יעד, משך…"
        />
      </div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img) || audience.length === 0}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירה"}
      </button>
    </form>
  );
}

function WorkshopForm({
  pending,
  onDone,
  onError,
  startTransition,
}: {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [price, setPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [maxP, setMaxP] = useState("");
  const [img, setImg] = useState("");
  const [courseDetails, setCourseDetails] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onError(null);
        if (audience.length === 0) {
          onError("יש לבחור לפחות קהל יעד אחד");
          return;
        }
        startTransition(() => {
          void (async () => {
            try {
              await createTherapistWorkshop({
                title,
                location,
                startsAt,
                price: Number(price),
                memberPrice: Number(memberPrice),
                maxParticipants: Number(maxP),
                imageUrl: img,
                courseDetails: courseDetails.trim() || undefined,
                audience,
              });
              onDone("הסדנה נוספה לפרופיל.");
            } catch (er) {
              onError(er instanceof Error ? er.message : "שגיאה");
            }
          })();
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת</label>
        <input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">מיקום</label>
        <input required className={fieldClass()} value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">מועד</label>
        <input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר (₪)</label>
          <input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className={fieldClass()}
            value={memberPrice}
            onChange={(e) => setMemberPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label>
        <input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">פירוט על הקורס (אופציונלי)</label>
        <textarea
          className={`${fieldClass()} min-h-[100px]`}
          value={courseDetails}
          onChange={(e) => setCourseDetails(e.target.value)}
          placeholder="מה לומדים, למי מתאים, חומרים, משך…"
        />
      </div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img) || audience.length === 0}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירה"}
      </button>
    </form>
  );
}

function ZoomForm({
  pending,
  onDone,
  onError,
  startTransition,
}: {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [zoomUrl, setZoomUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [price, setPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [maxP, setMaxP] = useState("");
  const [img, setImg] = useState("");
  const [courseDetails, setCourseDetails] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onError(null);
        if (audience.length === 0) {
          onError("יש לבחור לפחות קהל יעד אחד");
          return;
        }
        startTransition(() => {
          void (async () => {
            try {
              await createTherapistZoomSession({
                title,
                zoomUrl,
                startsAt,
                price: Number(price),
                memberPrice: Number(memberPrice),
                maxParticipants: Number(maxP),
                imageUrl: img,
                courseDetails: courseDetails.trim() || undefined,
                audience,
              });
              onDone("מפגש הזום נוסף.");
            } catch (er) {
              onError(er instanceof Error ? er.message : "שגיאה");
            }
          })();
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת</label>
        <input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">קישור זום (https)</label>
        <input required type="url" className={`${fieldClass()} text-left font-mono text-sm`} dir="ltr" value={zoomUrl} onChange={(e) => setZoomUrl(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">מועד</label>
        <input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר (₪)</label>
          <input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className={fieldClass()}
            value={memberPrice}
            onChange={(e) => setMemberPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label>
        <input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">פירוט על המפגש (אופציונלי)</label>
        <textarea
          className={`${fieldClass()} min-h-[100px]`}
          value={courseDetails}
          onChange={(e) => setCourseDetails(e.target.value)}
          placeholder="מבנה המפגש, חומרים, דרישות מקדימות…"
        />
      </div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img) || audience.length === 0}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירה"}
      </button>
    </form>
  );
}

