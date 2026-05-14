import { getSiteTitle, getVisionSlides } from "@/lib/site-config";
import { ContentSettingsForm } from "./content-form";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [siteTitle, visionSlides] = await Promise.all([getSiteTitle(), getVisionSlides()]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">ניהול תוכן</h2>
        <p className="mt-2 text-sm text-slate-600">
          עריכת כותרת האתר (בכותרת העליונה) ושקופיות דף הבית — טקסט, צבעי רקע רכים (אופציונלי) ותמונת כיסוי (https). השינויים נשמרים במסד הנתונים (MySQL) ומתעדכנים בדף הבית לאחר שמירה.
        </p>
      </div>
      <ContentSettingsForm initialTitle={siteTitle} initialSlides={visionSlides} />
    </div>
  );
}
