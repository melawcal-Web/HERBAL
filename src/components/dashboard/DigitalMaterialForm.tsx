"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProductType } from "@prisma/client";
import {
  createTherapistDigitalProduct,
  updateTherapistDigitalProduct,
} from "@/app/actions/therapist-product";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { AudienceMultiSelect } from "@/components/forms/AudienceMultiSelect";
import { isStoredImageUrl } from "@/lib/stored-image-url";
import type { ContentAudienceId } from "@/lib/content-audience";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/product-metadata";

export type DigitalMaterialFormValues = {
  id?: string;
  title: string;
  description: string;
  type: ProductType;
  price: string;
  memberPrice: string;
  imageUrl: string;
  audience: ContentAudienceId[];
  downloadUrl: string;
};

function fieldClass() {
  return "mt-1 w-full min-h-[44px] rounded-xl border border-herbal-200 px-3 py-2 text-right";
}

export function DigitalMaterialForm({
  initial,
  mode = "create",
  onDone,
  onError,
}: {
  initial?: DigitalMaterialFormValues;
  mode?: "create" | "edit";
  onDone?: (message: string) => void;
  onError?: (message: string | null) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [localOk, setLocalOk] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<ProductType>(initial?.type ?? "shelf_product");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [memberPrice, setMemberPrice] = useState(initial?.memberPrice ?? "");
  const [img, setImg] = useState(initial?.imageUrl ?? "");
  const [audience, setAudience] = useState<ContentAudienceId[]>(initial?.audience ?? []);
  const [downloadUrl, setDownloadUrl] = useState(initial?.downloadUrl ?? "");

  const setErr = (msg: string | null) => {
    setLocalErr(msg);
    onError?.(msg);
  };

  return (
    <form
      className="space-y-4"
      dir="rtl"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        setLocalOk(null);
        if (audience.length === 0) {
          setErr("יש לבחור לפחות קהל יעד אחד");
          return;
        }
        startTransition(() => {
          void (async () => {
            try {
              const payload = {
                type,
                title,
                description,
                price: Number(price),
                memberPrice: Number(memberPrice),
                imageUrl: img,
                audience,
                downloadUrl: downloadUrl.trim() || undefined,
              };
              if (mode === "edit" && initial?.id) {
                await updateTherapistDigitalProduct(initial.id, payload);
                const msg = "החומר עודכן ומוצג בדף הציבורי.";
                setLocalOk(msg);
                onDone?.(msg);
              } else {
                await createTherapistDigitalProduct(payload);
                const msg = "החומר הדיגיטלי נוסף לפרופיל הציבורי ולקורסים וסדנאות.";
                setLocalOk(msg);
                onDone?.(msg);
                setTitle("");
                setDescription("");
                setPrice("");
                setMemberPrice("");
                setImg("");
                setAudience([]);
                setDownloadUrl("");
                setType("shelf_product");
              }
              router.refresh();
            } catch (er) {
              setErr(er instanceof Error ? er.message : "שגיאה");
            }
          })();
        });
      }}
    >
      <div>
        <label htmlFor="dm-type" className="text-sm font-medium text-slate-700">
          סוג חומר
        </label>
        <select
          id="dm-type"
          className={fieldClass()}
          value={type}
          onChange={(e) => setType(e.target.value as ProductType)}
          disabled={pending}
        >
          {PRODUCT_TYPE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dm-title" className="text-sm font-medium text-slate-700">
          כותרת
        </label>
        <input
          id="dm-title"
          required
          maxLength={200}
          className={fieldClass()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="dm-description" className="text-sm font-medium text-slate-700">
          תיאור
        </label>
        <textarea
          id="dm-description"
          required
          maxLength={8000}
          className={`${fieldClass()} min-h-[120px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dm-price" className="text-sm font-medium text-slate-700">
            מחיר (₪)
          </label>
          <input
            id="dm-price"
            required
            type="number"
            min="0"
            step="0.01"
            className={fieldClass()}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="dm-member" className="text-sm font-medium text-slate-700">
            מחיר חברים (₪)
          </label>
          <input
            id="dm-member"
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
      <AudienceMultiSelect value={audience} onChange={setAudience} disabled={pending} />
      <div>
        <label htmlFor="dm-download" className="text-sm font-medium text-slate-700">
          קישור הורדה / קובץ דיגיטלי
        </label>
        <input
          id="dm-download"
          type="text"
          inputMode="url"
          dir="ltr"
          placeholder="https://… או /uploads/…"
          className={`${fieldClass()} text-left font-mono text-sm`}
          value={downloadUrl}
          onChange={(e) => setDownloadUrl(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">אופציונלי. נשמר ב־metadata.downloadUrl.</p>
      </div>
      <ImagePicker value={img} onChange={setImg} uploadPrefix="content" />
      {audience.length === 0 ? (
        <p className="text-sm text-amber-700">יש לבחור לפחות קהל יעד אחד.</p>
      ) : null}
      {localErr ? <p className="text-sm text-rose-600">{localErr}</p> : null}
      {localOk && !onDone ? <p className="text-sm text-herbal-700">{localOk}</p> : null}
      <button
        type="submit"
        disabled={pending || !isStoredImageUrl(img) || audience.length === 0}
        className="w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : mode === "edit" ? "שמירת שינויים" : "פרסום חומר דיגיטלי"}
      </button>
    </form>
  );
}
