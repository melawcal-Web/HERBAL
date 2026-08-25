"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImagePicker } from "@/components/dashboard/ImagePicker";
import { uploadTherapistCertificate } from "@/app/actions/therapist-certificate";
import { isStoredImageUrl } from "@/lib/stored-image-url";

export function CertificateUploadPanel({
  initialUrl,
}: {
  initialUrl: string | null;
}) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit() {
    setErr(null);
    if (!isStoredImageUrl(url)) {
      setErr("יש להעלות תמונת תעודה");
      return;
    }
    startTransition(() => {
      void (async () => {
        try {
          await uploadTherapistCertificate(url);
          await updateSession();
          router.refresh();
        } catch (e) {
          setErr(e instanceof Error ? e.message : "שגיאה");
        }
      })();
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-herbal-200 bg-white/90 p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold text-herbal-900">העלאת תעודה</h2>
      <p className="mt-2 text-sm text-slate-600">
        העלו תמונה של התעודה. אחרי ההעלאה תוכלו לערוך את הפרופיל. צוות המרכז יבדוק ויאשר את התעודה בנפרד — עד אז הדף הציבורי ו-EMR לא יופעלו.
      </p>
      <div className="mt-4">
        <ImagePicker
          value={url}
          onChange={setUrl}
          label="תמונת תעודה"
          uploadPrefix="content"
          uploadOnly
          onBusyChange={setBusy}
        />
      </div>
      {err ? <p className="mt-3 text-sm text-rose-600">{err}</p> : null}
      <button
        type="button"
        onClick={submit}
        disabled={pending || busy || !isStoredImageUrl(url)}
        className="mt-4 w-full min-h-[48px] rounded-full bg-herbal-600 py-3 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
      >
        {pending ? "שומרים…" : initialUrl ? "עדכון תעודה" : "שמירת תעודה והמשך לפרופיל"}
      </button>
    </section>
  );
}
