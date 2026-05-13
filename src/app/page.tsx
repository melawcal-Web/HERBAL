import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="animate-slide-up text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-sage">
          The Center for Herbal Therapists
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-herbal-900 sm:text-5xl">
          המרכז למטפלים בצמחי מרפא
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          קהילה, שוק, ויומן טיפולים דיגיטלי עם מחשבון נוסחאות. מותאם לנייד, לוח ומחשב.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/marketplace"
            className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-full bg-herbal-600 px-8 py-3 text-white shadow-lg shadow-herbal-600/25 transition hover:bg-herbal-500 active:scale-[0.98]"
          >
            גלו את השוק
          </Link>
          <Link
            href="/herbal-index"
            className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-full border border-herbal-300 bg-white px-8 py-3 text-herbal-800 transition hover:border-herbal-500 hover:bg-herbal-50 active:scale-[0.98]"
          >
            אינדקס צמחים
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
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
        ].map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-herbal-100 bg-white/90 p-6 shadow-sm shadow-herbal-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-display text-xl text-herbal-900">{c.title}</h2>
            <p className="mt-2 text-slate-600">{c.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border border-herbal-200 bg-gradient-to-br from-white to-herbal-50 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl text-herbal-900">התחלו עכשיו</h2>
        <p className="mt-2 text-slate-600">
          {session?.user
            ? `שלום, ${session.user.name}. עברו לאזור האישי.`
            : "הירשמו כמטפל או כלקוח כדי לגשת לכלים המלאים."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-herbal-600 px-6 py-3 text-white hover:bg-herbal-500"
              >
                אזור אישי
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-herbal-400 px-6 py-3 text-herbal-800 hover:bg-white"
                >
                  ניהול
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth/register"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-herbal-600 px-8 py-3 text-white hover:bg-herbal-500"
            >
              הרשמה
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
