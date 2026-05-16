"use client";

import { useRef, useState } from "react";
import { uploadUserImage } from "@/app/actions/upload-user-image";

export type UnsplashHit = { id: string; thumb: string; full: string };

type Mode = "search" | "upload";

export function ImagePicker({
  value,
  onChange,
  label = "תמונת כיסוי",
  uploadPrefix = "content",
  uploadOnly = false,
  onBusyChange,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** profiles | content — נתיב שמירה ב-public/uploads */
  uploadPrefix?: "profiles" | "content";
  /** רק העלאה מהמחשב — ללא Unsplash */
  uploadOnly?: boolean;
  /** נקרא בעת העלאה (לחסום «שמירה» בטופס עד סיום) */
  onBusyChange?: (busy: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>(uploadOnly ? "upload" : "search");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<UnsplashHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingThumb, setPendingThumb] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const previewUrl = pendingUrl ?? (value || null);
  const previewThumb = pendingThumb ?? previewUrl;

  async function search() {
    setLoading(true);
    setHint(null);
    setUploadError(null);
    try {
      const res = await fetch("/api/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = (await res.json()) as { error?: string; queryEn?: string; results?: UnsplashHit[] };
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setHits(data.results ?? []);
      if (data.queryEn) setHint(`חיפוש באנגלית: ${data.queryEn}`);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "שגיאה");
      setHits([]);
    } finally {
      setLoading(false);
    }
  }

  /** בחירת Unsplash — מיד מעדכנת את הטופס (ללא שלב «אישור» נפרד). */
  function selectUnsplash(full: string) {
    setPendingUrl(null);
    setPendingThumb(null);
    setUploadError(null);
    onChange(full);
    setHint("התמונה נבחרה — לחצו «שמירה» בטופס הראשי כדי לעדכן במסד.");
  }

  async function onFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    onBusyChange?.(true);
    setHint(null);
    let localPreview: string | null = null;
    try {
      localPreview = URL.createObjectURL(file);
      setPendingUrl(localPreview);
      setPendingThumb(localPreview);

      const fd = new FormData();
      fd.set("file", file);
      fd.set("prefix", uploadPrefix);
      const result = await uploadUserImage(fd);
      if ("error" in result) {
        throw new Error(result.error);
      }
      URL.revokeObjectURL(localPreview);
      localPreview = null;
      setPendingUrl(null);
      setPendingThumb(null);
      onChange(result.url);
      setHint("הקובץ הועלה — לחצו «שמירה» בטופס הראשי כדי לשמור במסד.");
    } catch (e) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setPendingUrl(null);
      setPendingThumb(null);
      const msg = e instanceof Error ? e.message : "שגיאה";
      setUploadError(msg);
      setHint(null);
    } finally {
      setUploading(false);
      onBusyChange?.(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-herbal-100 bg-herbal-50/30 p-4">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      {!uploadOnly ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === "search" ? "bg-herbal-600 text-white" : "border border-herbal-200 bg-white text-herbal-800"
            }`}
          >
            חיפוש Unsplash
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === "upload" ? "bg-herbal-600 text-white" : "border border-herbal-200 bg-white text-herbal-800"
            }`}
          >
            העלאת תמונה מהמחשב
          </button>
        </div>
      ) : null}

      {mode === "search" && !uploadOnly ? (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-h-[44px] min-w-[12rem] flex-1 rounded-xl border border-herbal-200 bg-white px-3 py-2 text-right"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="הקלידו מילת חיפוש בעברית…"
            />
            <button
              type="button"
              disabled={loading || !q.trim()}
              onClick={() => void search()}
              className="min-h-[44px] rounded-xl border border-herbal-300 bg-white px-4 text-sm font-semibold text-herbal-900 transition hover:bg-herbal-50 disabled:opacity-50"
            >
              {loading ? "מחפשים…" : "חיפוש חכם"}
            </button>
          </div>
          {hits.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {hits.map((h) => {
                const highlighted = value === h.full;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => selectUnsplash(h.full)}
                    className={`overflow-hidden rounded-xl border-2 transition ${
                      highlighted
                        ? "border-herbal-600 ring-2 ring-herbal-400/70 scale-[1.02]"
                        : "border-transparent hover:border-herbal-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.thumb} alt="" className="aspect-square w-full object-cover" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-herbal-300 bg-white px-4 py-8 text-sm font-semibold text-herbal-800 transition hover:border-herbal-500 hover:bg-herbal-50/80 disabled:opacity-60"
          >
            {uploading ? "מעלה…" : "בחרו קובץ מהמחשב (עד 5MB)"}
          </button>
        </div>
      )}

      {hint ? <p className="text-xs text-slate-600">{hint}</p> : null}
      {uploadError ? <p className="text-sm font-medium text-rose-700">{uploadError}</p> : null}

      {previewThumb ? (
        <div className="space-y-3 rounded-xl border border-herbal-200 bg-white p-3">
          <p className="text-xs font-semibold text-herbal-800">תצוגה מקדימה</p>
          <div className="overflow-hidden rounded-xl border border-herbal-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewThumb} alt="" className="max-h-48 w-full object-cover" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-800/90">בחרו תמונה — לאחר מכן לחצו «שמירה» בטופס הראשי כדי לעדכן במסד.</p>
      )}

      {value.trim() ? (
        <p className="truncate text-xs text-slate-500" dir="ltr" title={value}>
          כתובת בטופס (תישמר במסד אחרי «שמירה»): {value.slice(0, 80)}
          {value.length > 80 ? "…" : ""}
        </p>
      ) : null}
    </div>
  );
}
