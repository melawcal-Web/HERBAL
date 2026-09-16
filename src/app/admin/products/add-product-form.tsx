"use client";

import { useActionState, useState, type ReactNode } from "react";
import type { ProductType } from "@prisma/client";
import {
  createAdminProduct,
  updateAdminProduct,
  type AdminProductState,
} from "@/app/actions/admin-product";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { AudienceMultiSelect } from "@/components/forms/AudienceMultiSelect";
import { isStoredImageUrl } from "@/lib/stored-image-url";
import type { ContentAudienceId } from "@/lib/content-audience";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/product-metadata";

export type AdminTherapistOption = {
  id: string;
  name: string;
  email: string;
};

export type AdminProductFormValues = {
  id?: string;
  title: string;
  description: string;
  type: ProductType;
  price: string;
  memberPrice: string;
  imageUrl: string;
  audience: ContentAudienceId[];
  therapistId: string;
  downloadUrl: string;
};

function SubmitButton({ pending, disabled, label }: { pending: boolean; disabled?: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-500 disabled:opacity-60"
    >
      {pending ? "שומרים…" : label}
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full min-h-[48px] rounded-xl border border-herbal-200 bg-white px-3 py-2 text-right text-sm text-herbal-950 outline-none transition focus:border-herbal-500";

export function AddProductForm({
  therapists,
  initial,
  mode = "create",
}: {
  therapists: AdminTherapistOption[];
  initial?: AdminProductFormValues;
  mode?: "create" | "edit";
}) {
  const action = mode === "edit" ? updateAdminProduct : createAdminProduct;
  const [state, formAction, pending] = useActionState<AdminProductState | undefined, FormData>(
    action,
    undefined,
  );
  const [img, setImg] = useState(initial?.imageUrl ?? "");
  const [audience, setAudience] = useState<ContentAudienceId[]>(initial?.audience ?? []);

  const submitLabel = mode === "edit" ? "שמירת שינויים" : "הוספת מוצר";

  return (
    <form action={formAction} className="mt-6 space-y-4" dir="rtl">
      {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div>
        <FieldLabel htmlFor="ap-type">סוג מוצר</FieldLabel>
        <select
          id="ap-type"
          name="type"
          required
          defaultValue={initial?.type ?? "shelf_product"}
          className={inputClass}
        >
          {PRODUCT_TYPE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="ap-title">כותרת</FieldLabel>
        <input
          id="ap-title"
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="ap-description">תיאור</FieldLabel>
        <textarea
          id="ap-description"
          name="description"
          required
          rows={5}
          maxLength={8000}
          defaultValue={initial?.description ?? ""}
          className="mt-1 w-full rounded-xl border border-herbal-200 bg-white px-3 py-2 text-right text-sm text-herbal-950 outline-none transition focus:border-herbal-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="ap-price">מחיר (₪)</FieldLabel>
          <input
            id="ap-price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            defaultValue={initial?.price ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="ap-member">מחיר חברים (₪)</FieldLabel>
          <input
            id="ap-member"
            name="memberPrice"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            defaultValue={initial?.memberPrice ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      {audience.map((id) => (
        <input key={id} type="hidden" name="audience" value={id} />
      ))}

      <div>
        <FieldLabel htmlFor="ap-therapist">שיוך למטפל/ת (אופציונלי)</FieldLabel>
        <select
          id="ap-therapist"
          name="therapistId"
          defaultValue={initial?.therapistId ?? ""}
          className={inputClass}
        >
          <option value="">ללא שיוך</option>
          {therapists.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="ap-download">קישור הורדה / קובץ דיגיטלי</FieldLabel>
        <input
          id="ap-download"
          name="downloadUrl"
          type="text"
          inputMode="url"
          dir="ltr"
          placeholder="https://… או /uploads/…"
          defaultValue={initial?.downloadUrl ?? ""}
          className={`${inputClass} text-left`}
        />
        <p className="mt-1 text-xs text-slate-500">
          אופציונלי. נשמר ב־metadata.downloadUrl (PDF, קישור חיצוני, או נתיב /uploads).
        </p>
      </div>

      <input type="hidden" name="imageUrl" value={img} readOnly />
      <ImagePicker value={img} onChange={setImg} uploadPrefix="content" />

      {mode === "create" && audience.length === 0 ? (
        <p className="text-sm text-amber-700">יש לבחור לפחות קהל יעד אחד.</p>
      ) : null}
      {state && !state.ok && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-herbal-700">{state.message}</p>}

      <SubmitButton
        pending={pending}
        disabled={!isStoredImageUrl(img) || (mode === "create" && audience.length === 0)}
        label={submitLabel}
      />
    </form>
  );
}
