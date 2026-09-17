"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBuyerAccountProfile } from "@/app/actions/buyer-profile";

export function BuyerAccountProfileForm({
  initialName,
  email,
  initialPhone,
  callbackPath,
}: {
  initialName: string;
  email: string;
  initialPhone: string;
  callbackPath: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-4"
      dir="rtl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setErr(null);
        startTransition(async () => {
          try {
            await updateBuyerAccountProfile({
              name: String(fd.get("name") ?? ""),
              phone: String(fd.get("phone") ?? ""),
            });
            router.push(callbackPath && callbackPath.startsWith("/") ? callbackPath : "/account/profile");
            router.refresh();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "שגיאה");
          }
        });
      }}
    >
      <label className="block text-sm font-medium text-slate-700">
        שם מלא
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={initialName}
          className="mt-1 min-h-[48px] w-full rounded-xl border border-herbal-200 px-3 py-2"
        />
      </label>
      <div>
        <p className="text-sm font-medium text-slate-700">אימייל</p>
        <p className="mt-1 min-h-[48px] rounded-xl border border-herbal-100 bg-herbal-50/70 px-3 py-2 text-sm text-slate-700" dir="ltr">
          {email}
        </p>
        <p className="mt-1 text-xs text-slate-500">האימייל מגיע מהחשבון ולא ניתן לשנות אותו כאן.</p>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        טלפון נייד
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          dir="ltr"
          placeholder="0501234567"
          defaultValue={initialPhone}
          className="mt-1 min-h-[48px] w-full rounded-xl border border-herbal-200 px-3 py-2 text-left"
        />
      </label>
      {err ? <p className="text-sm text-rose-600">{err}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
      >
        {pending ? "שומרים…" : "שמירת פרטים"}
      </button>
    </form>
  );
}
