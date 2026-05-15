"use client";

import { useState } from "react";

export function VideoUploadPanel() {
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState<"bunny" | "vimeo">("bunny");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestUpload() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, title }),
      });
      const data = (await res.json()) as { error?: string; uploadUrl?: string; videoId?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMsg(
        data.uploadUrl
          ? `נוצר וידאו ${data.videoId}. העלאה: ${data.uploadUrl}${data.message ? ` — ${data.message}` : ""}`
          : "נוצר בהצלחה",
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold text-herbal-900">העלאת וידאו (Vimeo / Bunny)</h2>
      <p className="mt-1 text-sm text-slate-600">העלאה ישירה מהדפדפן — מפתחות API בשרת בלבד.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-herbal-200 px-3 py-2 text-sm"
          value={provider}
          onChange={(e) => setProvider(e.target.value as "bunny" | "vimeo")}
        >
          <option value="bunny">Bunny.net</option>
          <option value="vimeo">Vimeo</option>
        </select>
        <input
          className="min-w-[12rem] flex-1 rounded-xl border border-herbal-200 px-3 py-2 text-sm"
          placeholder="כותרת וידאו"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void requestUpload()}
          className="rounded-full bg-herbal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
        >
          {loading ? "יוצר…" : "קבלת כתובת העלאה"}
        </button>
      </div>
      {msg ? <p className="mt-3 break-all text-xs text-herbal-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-xs text-rose-600">{err}</p> : null}
    </section>
  );
}
