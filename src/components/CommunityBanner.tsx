import Link from "next/link";

type Props = {
  therapistName: string;
};

export function CommunityBanner({ therapistName }: Props) {
  return (
    <section className="mt-12 rounded-2xl border border-dashed border-herbal-300 bg-herbal-50/80 p-6 text-center animate-fade-in">
      <p className="text-xs font-semibold uppercase tracking-wider text-sage">Community Banner</p>
      <h3 className="mt-2 font-display text-xl text-herbal-900">
        הצטרפו לקהילת המרכז · Join the Center community
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
        {therapistName} · חלק מהקהילה המקצועית של המרכז — סדנאות, השגחה, ותוכן משותף.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href="/marketplace"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-5 py-2 text-sm text-white hover:bg-herbal-500"
        >
          גלו פעילויות ושירותים
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-herbal-300 bg-white px-5 py-2 text-sm text-herbal-800 hover:bg-white"
        >
          חזרה לדף הבית של המרכז
        </Link>
      </div>
    </section>
  );
}
