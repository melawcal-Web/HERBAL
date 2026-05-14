"use client";

import { useActionState } from "react";
import { createAdminProduct, type CreateAdminProductState } from "@/app/actions/admin-product";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-500 disabled:opacity-60"
    >
      {pending ? "שומרים…" : "הוספת מוצר"}
    </button>
  );
}

export function AddProductForm() {
  const [state, action, pending] = useActionState<CreateAdminProductState | undefined, FormData>(
    createAdminProduct,
    undefined,
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="ap-title" className="text-sm font-medium text-slate-700">
          כותרת
        </label>
        <input
          id="ap-title"
          name="title"
          required
          maxLength={200}
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 text-right"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-price" className="text-sm font-medium text-slate-700">
            מחיר (₪)
          </label>
          <input
            id="ap-price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 text-right"
          />
        </div>
        <div>
          <label htmlFor="ap-member" className="text-sm font-medium text-slate-700">
            מחיר חברים (₪)
          </label>
          <input
            id="ap-member"
            name="memberPrice"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 text-right"
          />
        </div>
      </div>
      <div>
        <label htmlFor="ap-image" className="text-sm font-medium text-slate-700">
          כתובת תמונה (https בלבד)
        </label>
        <input
          id="ap-image"
          name="imageUrl"
          type="url"
          required
          placeholder="https://…"
          className="mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 px-3 py-2 text-left font-mono text-sm"
        />
      </div>
      {state && !state.ok && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-herbal-700">{state.message}</p>}
      <SubmitButton pending={pending} />
    </form>
  );
}
