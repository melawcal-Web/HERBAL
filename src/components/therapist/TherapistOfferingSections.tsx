import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { WaitlistProductCard } from "@/components/products/WaitlistProductCard";
import { DigitalProductCard } from "@/components/products/DigitalProductCard";
import {
  classifyProductForProfile,
  parseProductMetadata,
  type TherapistOfferingSection,
} from "@/lib/product-metadata";
import type { TherapistPaymentSettings } from "@/lib/therapist-payments";

const SECTION_META: Record<TherapistOfferingSection, { title: string; subtitle: string }> = {
  digital: { title: "חומרים דיגיטליים", subtitle: "PDF, וידאו, מתכונים ומוצרי מדף" },
  tours: { title: "סדנאות וסיורים", subtitle: "מפגשים בשטח, סדנאות מעשיות וחוויות" },
  courses: { title: "קורסים (זום ופרונטלי)", subtitle: "למידה מקוונת או פרונטלית" },
  meetings: { title: "פגישות וסופרוויז׳ן", subtitle: "ליווי אישי, קבוצות והשגחה מקצועית" },
};

function bucketProducts(products: WaitlistProductModel[]) {
  const buckets: Record<TherapistOfferingSection, WaitlistProductModel[]> = {
    digital: [],
    tours: [],
    courses: [],
    meetings: [],
  };
  for (const p of products) {
    const meta = classifyProductForProfile(p.type, parseProductMetadata(p.metadata));
    buckets[meta].push(p);
  }
  return buckets;
}

export function TherapistOfferingSections({
  products,
  paymentSettings,
}: {
  products: WaitlistProductModel[];
  paymentSettings: TherapistPaymentSettings;
}) {
  const buckets = bucketProducts(products);
  const order: TherapistOfferingSection[] = ["digital", "tours", "courses", "meetings"];

  return (
    <>
      {order.map((key) => {
        const items = buckets[key];
        if (items.length === 0) return null;
        const meta = SECTION_META[key];
        const digital = key === "digital";
        return (
          <section key={key} className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby={`section-${key}`}>
            <p id={`section-${key}`} className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
              {meta.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{meta.subtitle}</p>
            <div
              className={
                digital
                  ? "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  : "mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {items.map((p) =>
                digital ? (
                  <DigitalProductCard key={p.id} product={p} paymentSettings={paymentSettings} />
                ) : (
                  <WaitlistProductCard key={p.id} product={p} paymentSettings={paymentSettings} />
                ),
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
