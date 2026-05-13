"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import type { FormulaJson } from "@/lib/formula";
import { createClinicalLog } from "@/app/actions/emr";

type ClientOption = { id: string; name: string; email: string };

export function NewClinicalLogForm({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [formula, setFormula] = useState<FormulaJson>({
    ingredients: [
      { name: "", grams: 0 },
      { name: "", grams: 0 },
    ],
  });
  const [notesPreview, setNotesPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(file: File | null) {
    setNotesPreview(null);
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("הקובץ גדול מדי (מקסימום 4MB בהעלאה זו).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNotesPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const id = await createClinicalLog({
          clientId,
          date,
          summary,
          formula,
          notesImageDataUrl: notesPreview,
        });
        router.push(`/dashboard/emr/${id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-700">לקוח</label>
        <select
          required
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          {clients.length === 0 && <option value="">אין לקוחות רשומים — הזמינו לקוחות להירשם</option>}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">תאריך מפגש</label>
        <input
          type="date"
          required
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">סיכום טיפול</label>
        <textarea
          required
          className="mt-1 w-full min-h-[120px] rounded-xl border border-herbal-200 px-3 py-2"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <FormulaCalculator value={formula} onChange={setFormula} />
      <div>
        <label className="text-sm font-medium text-slate-700">צילום פתק בכתב יד (אופציונלי)</label>
        <input
          type="file"
          accept="image/*"
          className="mt-2 block w-full min-h-[48px] text-sm"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        {notesPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={notesPreview} alt="" className="mt-3 max-h-64 rounded-xl border border-herbal-100" />
        )}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={pending || !clientId}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 font-medium text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : "שמירה"}
      </button>
    </form>
  );
}
