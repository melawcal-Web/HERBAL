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

/* ── Types ── */

type ContentCategory =
  | "frontal"
  | "digital"
  | "recordings"
  | "articles"
  | "protocols";

type FormMode =
  | null
  | "workshop"
  | "lecture"
  | "zoom"
  | "recording"
  | "livestream"
  | "article"
  | "article-ai"
  | "plant"
  | "protocol";

/* ── Shared UI ── */

function fieldClass() {
  return "mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2 text-right";
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
      className="flex flex-col items-center gap-3 rounded-2xl border border-herbal-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-herbal-300 hover:shadow-md motion-reduce:transition-none"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-herbal-50 text-herbal-800">{icon}</span>
      <span className="font-display text-sm font-bold text-herbal-900">{title}</span>
      <span className="text-xs leading-relaxed text-slate-600">{subtitle}</span>
    </button>
  );
}

/* ── Icons ── */

function IconBuilding() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h6" strokeLinecap="round" />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3" strokeLinecap="round" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0014 0M12 17v4m-4 0h8" strokeLinecap="round" />
    </svg>
  );
}

function IconArticle() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" />
      <path d="M8 7h8M8 11h8" strokeLinecap="round" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 18l1 3 1-3 3-1-3-1-1-3-1 3-3 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function IconLive() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49" strokeLinecap="round" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" strokeLinecap="round" />
    </svg>
  );
}

/* ── Category sections config ── */

const categories: {
  id: ContentCategory;
  title: string;
  description: string;
  tiles: { mode: FormMode; icon: ReactNode; title: string; subtitle: string }[];
}[] = [
  {
    id: "frontal",
    title: "סדנאות והנחייה פרונטאליים",
    description: "אירועים פרונטאליים — סדנאות, הרצאות ומפגשי הנחייה פנים אל פנים.",
    tiles: [
      { mode: "workshop", icon: <IconBuilding />, title: "סדנה פרונטלית", subtitle: "מיקום, מועד, מחיר ומשתתפים" },
      { mode: "lecture", icon: <IconBuilding />, title: "הרצאה / הנחייה", subtitle: "מועד, מחירים וקהל יעד" },
    ],
  },
  {
    id: "digital",
    title: "סדנאות דיגיטליות",
    description: "מפגשים מקוונים — זום, וובינרים ושיעורים דיגיטליים.",
    tiles: [
      { mode: "zoom", icon: <IconVideo />, title: "מפגש זום", subtitle: "קישור, מועד, מחיר ומשתתפים" },
    ],
  },
  {
    id: "recordings",
    title: "הקלטות מוקלטות ושידורים חיים",
    description: "תוכן מוקלט ושידורים — פודקאסטים, הרצאות מצולמות ולייבים.",
    tiles: [
      { mode: "recording", icon: <IconMic />, title: "הקלטה / פודקאסט", subtitle: "כותרת, קישור, תמונה ותיאור" },
      { mode: "livestream", icon: <IconLive />, title: "שידור חי", subtitle: "מועד, קישור וקהל יעד" },
    ],
  },
  {
    id: "articles",
    title: "מאמרי עומק ומחקרים",
    description: "מאמרים מקצועיים, מחקרים וכתבות על צמחי מרפא.",
    tiles: [
      { mode: "article-ai", icon: <IconAI />, title: "מאמר עם AI", subtitle: "תארו את הנושא — ה-AI ינסח מאמר מלא עם טאבים" },
      { mode: "article", icon: <IconArticle />, title: "מאמר ידני", subtitle: "כותרת, קטגוריה, תוכן ותמונה" },
      { mode: "plant", icon: <IconArticle />, title: "מאמר צמח", subtitle: "שם הצמח, תוכן ותמונה" },
    ],
  },
  {
    id: "protocols",
    title: "פרוטוקולי טיפול",
    description: "פרוטוקולים מקצועיים — תכניות טיפול, מרשמים ונהלים.",
    tiles: [
      { mode: "protocol", icon: <IconClipboard />, title: "פרוטוקול טיפולי", subtitle: "שם, תיאור, שלבים ותמונה" },
    ],
  },
];

/* ── Main component ── */

export function DashboardAddContent() {
  const [mode, setMode] = useState<FormMode>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<ContentCategory>(categories[0].id);

  const close = () => {
    setMode(null);
    setMsg(null);
    setErr(null);
  };

  const formProps = {
    pending,
    onDone: (m: string) => { setMsg(m); close(); },
    onError: setErr,
    startTransition,
  };
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  return (
    <>
      {msg ? <p className="mt-4 text-sm text-herbal-700">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm text-rose-600">{err}</p> : null}

      <div className="mt-8 flex flex-col gap-6 lg:flex-row-reverse lg:items-start">
        <aside className="w-full lg:w-72">
          <div className="rounded-2xl border border-herbal-200/80 bg-white/90 p-3 shadow-sm">
            <nav className="space-y-2">
              {categories.map((cat) => {
                const active = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={[
                      "w-full rounded-xl px-3 py-3 text-right text-sm font-semibold transition",
                      active
                        ? "border border-herbal-300 bg-white text-herbal-900 shadow-sm"
                        : "border border-herbal-100 bg-white/60 text-slate-600 hover:border-herbal-200 hover:bg-white",
                    ].join(" ")}
                  >
                    {cat.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="flex-1 rounded-2xl border border-herbal-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-bold text-herbal-900">{activeCategory.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{activeCategory.description}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {activeCategory.tiles.map((tile) => (
              <ActionTile
                key={tile.mode}
                icon={tile.icon}
                title={tile.title}
                subtitle={tile.subtitle}
                onClick={() => setMode(tile.mode)}
              />
            ))}
          </div>
        </section>
      </div>

      <ModalBackdrop open={mode != null} onClose={close} />
      <ModalPanel open={mode === "article-ai"} title="מאמר עם AI" onClose={close}>
        <AIArticleForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "article"} title="הוספת מאמר" onClose={close}>
        <ArticleForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "plant"} title="מאמר צמח" onClose={close}>
        <PlantArticleForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "lecture"} title="הרצאה / הנחייה" onClose={close}>
        <LectureForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "workshop"} title="סדנה פרונטלית" onClose={close}>
        <WorkshopForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "zoom"} title="מפגש זום" onClose={close}>
        <ZoomForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "recording"} title="הקלטה / פודקאסט" onClose={close}>
        <RecordingForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "livestream"} title="שידור חי" onClose={close}>
        <LivestreamForm {...formProps} />
      </ModalPanel>
      <ModalPanel open={mode === "protocol"} title="פרוטוקול טיפולי" onClose={close}>
        <ProtocolForm {...formProps} />
      </ModalPanel>
    </>
  );
}

/* ── Form props type ── */

type FormHandlers = {
  pending: boolean;
  onDone: (m: string) => void;
  onError: (e: string | null) => void;
  startTransition: (fn: () => void) => void;
};

/* ── Existing forms (unchanged logic) ── */

function ArticleForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistArticle({ title, content, category, imageUrl: img });
            onDone("המאמר נשמר ופורסם.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} /></div>
      <div><label className="text-sm font-medium text-slate-700">קטגוריה</label><input required className={fieldClass()} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={120} /></div>
      <div><label className="text-sm font-medium text-slate-700">תוכן</label><textarea required className={`${fieldClass()} min-h-[160px]`} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img)} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירת מאמר"}</button>
    </form>
  );
}

function PlantArticleForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [plantName, setPlantName] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistPlantArticle({ title, content, plantName, imageUrl: img });
            onDone("מאמר הצמח נשמר ופורסם באינדקס.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">שם הצמח</label><input required className={fieldClass()} value={plantName} onChange={(e) => setPlantName(e.target.value)} maxLength={120} /></div>
      <div><label className="text-sm font-medium text-slate-700">כותרת המאמר</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} /></div>
      <div><label className="text-sm font-medium text-slate-700">תוכן</label><textarea required className={`${fieldClass()} min-h-[160px]`} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img)} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירת מאמר צמח"}</button>
    </form>
  );
}

function LectureForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [price, setPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [maxP, setMaxP] = useState("");
  const [img, setImg] = useState("");
  const [courseDetails, setCourseDetails] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      if (audience.length === 0) { onError("יש לבחור לפחות קהל יעד אחד"); return; }
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistLecture({ title, startsAt, price: Number(price), memberPrice: Number(memberPrice), maxParticipants: Number(maxP), imageUrl: img, courseDetails: courseDetails.trim() || undefined, audience });
            onDone("ההרצאה נוספה לפרופיל.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">מועד</label><input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-slate-700">מחיר (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label><input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">פירוט (אופציונלי)</label><textarea className={`${fieldClass()} min-h-[100px]`} value={courseDetails} onChange={(e) => setCourseDetails(e.target.value)} placeholder="נושא ההרצאה, קהל יעד, משך…" /></div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img) || audience.length === 0} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}

function WorkshopForm({ pending, onDone, onError, startTransition }: FormHandlers) {
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
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      if (audience.length === 0) { onError("יש לבחור לפחות קהל יעד אחד"); return; }
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistWorkshop({ title, location, startsAt, price: Number(price), memberPrice: Number(memberPrice), maxParticipants: Number(maxP), imageUrl: img, courseDetails: courseDetails.trim() || undefined, audience });
            onDone("הסדנה נוספה לפרופיל.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">מיקום</label><input required className={fieldClass()} value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">מועד</label><input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-slate-700">מחיר (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label><input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">פירוט (אופציונלי)</label><textarea className={`${fieldClass()} min-h-[100px]`} value={courseDetails} onChange={(e) => setCourseDetails(e.target.value)} placeholder="מה לומדים, למי מתאים, חומרים, משך…" /></div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img) || audience.length === 0} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}

function ZoomForm({ pending, onDone, onError, startTransition }: FormHandlers) {
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
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      if (audience.length === 0) { onError("יש לבחור לפחות קהל יעד אחד"); return; }
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistZoomSession({ title, zoomUrl, startsAt, price: Number(price), memberPrice: Number(memberPrice), maxParticipants: Number(maxP), imageUrl: img, courseDetails: courseDetails.trim() || undefined, audience });
            onDone("מפגש הזום נוסף.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">קישור זום (https)</label><input required type="url" className={`${fieldClass()} text-left font-mono text-sm`} dir="ltr" value={zoomUrl} onChange={(e) => setZoomUrl(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">מועד</label><input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-slate-700">מחיר (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium text-slate-700">משתתפים מקסימליים</label><input required type="number" min="1" className={fieldClass()} value={maxP} onChange={(e) => setMaxP(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">פירוט (אופציונלי)</label><textarea className={`${fieldClass()} min-h-[100px]`} value={courseDetails} onChange={(e) => setCourseDetails(e.target.value)} placeholder="מבנה המפגש, חומרים, דרישות מקדימות…" /></div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img) || audience.length === 0} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}

/* ── New forms ── */

function RecordingForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [img, setImg] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);
  const [price, setPrice] = useState("0");
  const [memberPrice, setMemberPrice] = useState("0");

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      if (audience.length === 0) { onError("יש לבחור לפחות קהל יעד אחד"); return; }
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistLecture({ title, startsAt: new Date().toISOString(), price: Number(price), memberPrice: Number(memberPrice), maxParticipants: 9999, imageUrl: img, courseDetails: `${description}\n\nקישור: ${mediaUrl}`.trim(), audience });
            onDone("ההקלטה נוספה.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">קישור להקלטה (YouTube, Spotify וכו׳)</label><input type="url" className={`${fieldClass()} text-left font-mono text-sm`} dir="ltr" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">תיאור</label><textarea required className={`${fieldClass()} min-h-[120px]`} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-slate-700">מחיר (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} /></div>
      </div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img) || audience.length === 0} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}

function LivestreamForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [img, setImg] = useState("");
  const [audience, setAudience] = useState<ContentAudienceId[]>([]);
  const [price, setPrice] = useState("0");
  const [memberPrice, setMemberPrice] = useState("0");

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      if (audience.length === 0) { onError("יש לבחור לפחות קהל יעד אחד"); return; }
      startTransition(() => {
        void (async () => {
          try {
            await createTherapistZoomSession({ title, zoomUrl: streamUrl, startsAt, price: Number(price), memberPrice: Number(memberPrice), maxParticipants: 9999, imageUrl: img, audience });
            onDone("השידור החי נוסף.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">כותרת</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">קישור לשידור</label><input required type="url" className={`${fieldClass()} text-left font-mono text-sm`} dir="ltr" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} /></div>
      <div><label className="text-sm font-medium text-slate-700">מועד</label><input required type="datetime-local" className={fieldClass()} dir="ltr" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-slate-700">מחיר (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-slate-700">מחיר חברים (₪)</label><input required type="number" min="0" step="0.01" className={fieldClass()} value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} /></div>
      </div>
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img) || audience.length === 0} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}

type AITab = { label: string; content: string };
type AIResult = { title: string; category: string; tabs: AITab[] };

function AIArticleForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [img, setImg] = useState("");

  async function generate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    onError(null);
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setResult(data);
      setActiveTab(0);
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה בייצור המאמר");
    } finally {
      setGenerating(false);
    }
  }

  function publish() {
    if (!result) return;
    onError(null);
    const fullContent = result.tabs
      .map((t) => `## ${t.label}\n\n${t.content}`)
      .join("\n\n---\n\n");
    startTransition(() => {
      void (async () => {
        try {
          await createTherapistArticle({
            title: result.title,
            content: fullContent,
            category: result.category,
            imageUrl: img,
          });
          onDone("המאמר נוצר ופורסם בהצלחה.");
        } catch (e) {
          onError(e instanceof Error ? e.message : "שגיאה");
        }
      })();
    });
  }

  if (!result) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">תארו את הנושא</label>
          <textarea
            className={`${fieldClass()} min-h-[140px]`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"למשל: מאמר מקיף על צמח האשוגנדה — השפעות על מערכת העצבים, מחקרים עדכניים, דרכי שימוש ומינון, אזהרות ואינטראקציות"}
            disabled={generating}
          />
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={generating || !prompt.trim()}
          className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
        >
          {generating ? "ה-AI כותב את המאמר…" : "צור מאמר עם AI"}
        </button>
      </div>
    );
  }

  const tab = result.tabs[activeTab];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">כותרת</label>
        <input
          className={fieldClass()}
          value={result.title}
          onChange={(e) => setResult({ ...result, title: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">קטגוריה</label>
        <input
          className={fieldClass()}
          value={result.category}
          onChange={(e) => setResult({ ...result, category: e.target.value })}
        />
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-herbal-200 bg-herbal-50/50">
        <div className="flex gap-0 overflow-x-auto border-b border-herbal-200">
          {result.tabs.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition ${
                i === activeTab
                  ? "border-b-2 border-herbal-600 text-herbal-900 bg-white"
                  : "text-slate-500 hover:text-herbal-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab && (
          <div className="p-4">
            <input
              className="mb-2 w-full rounded-lg border border-herbal-200 px-3 py-1.5 text-sm font-medium text-right"
              value={tab.label}
              onChange={(e) => {
                const tabs = [...result.tabs];
                tabs[activeTab] = { ...tabs[activeTab], label: e.target.value };
                setResult({ ...result, tabs });
              }}
              placeholder="שם הטאב"
            />
            <textarea
              className="w-full min-h-[200px] rounded-lg border border-herbal-200 px-3 py-2 text-sm leading-relaxed text-right"
              value={tab.content}
              onChange={(e) => {
                const tabs = [...result.tabs];
                tabs[activeTab] = { ...tabs[activeTab], content: e.target.value };
                setResult({ ...result, tabs });
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setResult(null); setActiveTab(0); }}
          className="rounded-full border border-herbal-300 px-4 py-2 text-sm font-medium text-herbal-700 hover:bg-herbal-50"
        >
          נסח מחדש
        </button>
      </div>

      <ImagePicker value={img} onChange={setImg} />

      <button
        type="button"
        onClick={publish}
        disabled={pending || !isStoredImageUrl(img)}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "מפרסם…" : "פרסום המאמר"}
      </button>
    </div>
  );
}

function ProtocolForm({ pending, onDone, onError, startTransition }: FormHandlers) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [img, setImg] = useState("");

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onError(null);
      startTransition(() => {
        void (async () => {
          try {
            const body = `${description}\n\n---\n\n### שלבי הטיפול\n${steps}`;
            await createTherapistArticle({ title, content: body, category: "פרוטוקול טיפולי", imageUrl: img });
            onDone("הפרוטוקול נשמר.");
          } catch (er) { onError(er instanceof Error ? er.message : "שגיאה"); }
        })();
      });
    }}>
      <div><label className="text-sm font-medium text-slate-700">שם הפרוטוקול</label><input required className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} /></div>
      <div><label className="text-sm font-medium text-slate-700">תיאור</label><textarea required className={`${fieldClass()} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="מטרת הפרוטוקול, מצבים מתאימים…" /></div>
      <div><label className="text-sm font-medium text-slate-700">שלבי טיפול</label><textarea required className={`${fieldClass()} min-h-[160px]`} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={"1. אבחון ראשוני\n2. בחירת צמחים\n3. הכנת תמצית\n4. מעקב"} /></div>
      <ImagePicker value={img} onChange={setImg} />
      <button type="submit" disabled={pending || !isStoredImageUrl(img)} className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50">{pending ? "שומרים…" : "שמירה"}</button>
    </form>
  );
}
