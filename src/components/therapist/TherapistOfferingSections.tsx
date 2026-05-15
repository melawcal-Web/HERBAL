import type { WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { WaitlistProductCard } from "@/components/products/WaitlistProductCard";
import {
  classifyProductForProfile,
  parseProductMetadata,
  type TherapistOfferingSection,
} from "@/lib/product-metadata";

const SECTION_META: Record<TherapistOfferingSection, { title: string; subtitle: string }> = {
  tours: { title: "סדנאות וסיורים", subtitle: "מפגשים בשטח, סדנאות מעשיות וחוויות" },
  courses: { title: "קורסים (זום ופרונטלי)", subtitle: "למידה מקוונת או פרונטלית" },
  meetings: { title: "פגישות וסופרוויז׳ן", subtitle: "ליווי אישי, קבוצות והשגחה מקצועית" },
};

function bucketProducts(products: WaitlistProductModel[]) {
  const buckets: Record<TherapistOfferingSection, WaitlistProductModel[]> = {
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

export function TherapistOfferingSections({ products }: { products: WaitlistProductModel[] }) {
  const buckets = bucketProducts(products);
  const order: TherapistOfferingSection[] = ["tours", "courses", "meetings"];

  return (
    <>
      {order.map((key) => {
        const items = buckets[key];
        if (items.length === 0) return null;
        const meta = SECTION_META[key];
        return (
          <section key={key} className="mt-14 border-t border-neutral-200/90 pt-12" aria-labelledby={`section-${key}`}>
            <p id={`section-${key}`} className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
              {meta.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{meta.subtitle}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <WaitlistProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
