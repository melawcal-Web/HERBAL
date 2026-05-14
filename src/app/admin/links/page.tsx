import { getSiteServiceLabels } from "@/lib/site-config";
import { AdminLinksForm } from "./links-form";

export default async function AdminLinksPage() {
  const initial = await getSiteServiceLabels();

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-herbal-900">קישורים לשירותים</h2>
        <p className="mt-1 text-slate-600">
          קישורים מהירים ל-GitHub, Vercel, Railway ו-Unsplash, ומקום לרשום שמות משתמש ומפתח Access ל-Unsplash (או רק
          תיעוד — עדיפות ל־UNSPLASH_ACCESS_KEY בשרת).
        </p>
      </div>
      <AdminLinksForm initial={initial} />
    </div>
  );
}
