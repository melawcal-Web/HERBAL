import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TherapistSpotlight } from "@/components/TherapistSpotlight";

export const dynamic = "force-dynamic";

function rotateList<T>(items: T[], offset: number): T[] {
  if (!items.length) return items;
  const o = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(o), ...items.slice(0, o)];
}

export default async function HomePage() {
  const session = await auth();

  const raw = await prisma.therapistProfile.findMany({
    include: { user: { select: { name: true, image: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const spotlight = raw.map((p) => ({
    slug: p.slug,
    name: p.user.name,
    image: p.user.image,
    bio: p.bio,
    specialty1: p.specialty1,
    specialty2: p.specialty2,
    specialty3: p.specialty3,
  }));

  const hourSlot = new Date().getUTCHours() + new Date().getUTCDate();
  const therapistsForSlider = rotateList(spotlight, hourSlot);

  const cards = [
    {
      title: "למטפלים",
      body: "דפי נחיתה אישיים, כלי EMR, יומן טיפולים, והעלאת פתקים בכתב יד.",
    },
    {
      title: "ללקוחות",
      body: "הרשמה מאובטחת, חיפוש מטפלים, וקריאת מאמרים מקושרים לאינדקס הצמחים.",
    },
    {
      title: "לניהול",
      body: "לוח בקרה עם תמונת מצב, ביקורת פעילות, ומקום לאימות תשלומים.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="animate-slide-up text-center opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards] motion-reduce:animate-none motion-reduce:opacity-100">
        <p className="inline-flex items-center gap-2 rounded-full border border-herbal-200/60 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-herbal-700 shadow-sm backdrop-blur-sm sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          The Center for Herbal Therapists
        </p>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-gradient-herbal sm:text-5xl md:text-6xl">
          המרכז למטפלים בצמחי מרפא
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          קהילה, שוק, ויומן טיפולים דיגיטלי עם מחשבון נוסחאות. מותאם לנייד, לוח ומחשב.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/marketplace"
            className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-full px-10 py-3.5 text-base font-semibold btn-shimmer"
          >
            גלו את השוק
          </Link>
          <Link
            href="/herbal-index"
            className="glass-panel inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-full border-herbal-200/90 px-10 py-3.5 text-base font-semibold text-herbal-800 transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            אינדקס צמחים
          </Link>
        </div>
      </section>

      <section className="mt-12 opacity-0 animate-slide-up [animation-delay:200ms] [animation-fill-mode:forwards] motion-reduce:animate-none motion-reduce:opacity-100 sm:mt-16">
        <TherapistSpotlight therapists={therapistsForSlider} />
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-3 sm:mt-16">
        {cards.map((c, idx) => (
          <article
            key={c.title}
            style={{ animationDelay: `${280 + idx * 90}ms` }}
            className="glass-panel group p-6 opacity-0 shadow-glass animate-slide-up [animation-fill-mode:forwards] transition duration-500 hover:-translate-y-1 hover:border-herbal-200/90 hover:shadow-lift motion-reduce:opacity-100 motion-reduce:animate-none"
          >
            <div className="mb-3 h-1 w-12 rounded-full bg-gradient-to-l from-herbal-500 to-emerald-400 transition-all duration-500 group-hover:w-20" />
            <h2 className="font-display text-xl font-bold text-herbal-900">{c.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{c.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 opacity-0 animate-slide-up [animation-delay:520ms] [animation-fill-mode:forwards] motion-reduce:animate-none motion-reduce:opacity-100 sm:mt-16">
        <div className="relative glass-panel-strong overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,146,80,0.08),transparent_50%)]" />
          <h2 className="relative font-display text-2xl font-bold text-gradient-herbal sm:text-3xl">התחלו עכשיו</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-slate-600">
            {session?.user
              ? `שלום, ${session.user.name}. עברו לאזור האישי.`
              : "הירשמו כמטפל או כלקוח כדי לגשת לכלים המלאים."}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-white btn-shimmer"
              >
                אזור אישי
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full px-10 py-3 text-base font-semibold text-white btn-shimmer"
              >
                הרשמה
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
