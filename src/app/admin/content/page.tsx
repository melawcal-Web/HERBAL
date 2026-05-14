import { getHomeHeroCopy, getSiteTitle, getVisionSlides } from "@/lib/site-config";
import { ContentSettingsForm } from "./content-form";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [siteTitle, visionSlides, homeHero] = await Promise.all([
    getSiteTitle(),
    getVisionSlides(),
    getHomeHeroCopy(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">ניהול תוכן</h2>
        <p className="mt-2 text-sm text-slate-600">
          כותרת האתר בכותרת העליונה, טקסטים מעל סליידר החזון בדף הבית, ומנהל השקופיות (יצירה / עריכה / מחיקה / סידור). חיפוש תמונות דרך Unsplash דורש מפתח בסביבה.
        </p>
      </div>
      <ContentSettingsForm initialTitle={siteTitle} initialSlides={visionSlides} initialHomeHero={homeHero} />
    </div>
  );
}
