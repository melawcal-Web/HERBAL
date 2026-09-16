"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminProductActive } from "@/app/actions/admin-product";

export function ProductActiveToggle({
  productId,
  active,
  title,
}: {
  productId: string;
  active: boolean;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const next = !active;
          const ok = window.confirm(
            next ? `להפעיל מחדש את «${title}»?` : `להשבית את «${title}»? המוצר יוסתר מהאתר הציבורי.`,
          );
          if (!ok) return;
          setError(null);
          startTransition(async () => {
            try {
              await setAdminProductActive(productId, next);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "שגיאה");
            }
          });
        }}
        className={
          active
            ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            : "rounded-lg border border-herbal-200 bg-herbal-50 px-3 py-1.5 text-xs font-semibold text-herbal-900 hover:bg-herbal-100 disabled:opacity-50"
        }
      >
        {pending ? "מעדכנים…" : active ? "השבתה" : "הפעלה"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
