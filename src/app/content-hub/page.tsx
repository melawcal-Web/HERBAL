import Link from "next/link";
import { listContentHubItems } from "@/lib/content-hub";
import { auth } from "@/auth";
import { MemberAuthWall } from "@/components/auth/MemberAuthWall";

export const metadata = {
  title: "מרכז תוכן",
  description: "כל התוכן במקום אחד — מאמרים, קורסים, מתכונים והרצאות",
};

export const dynamic = "force-dynamic";

export default async function ContentHubPage() {
  const session = await auth();
  if (!session?.user) return <MemberAuthWall callbackPath="/content-hub" />;

  const items = await listContentHubItems(100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" dir="rtl">
      <h1 className="font-display text-3xl font-bold text-herbal-900">מרכז תוכן</h1>
      <p className="mt-2 text-slate-600">רשימה אנכית — כותרת, סוג, תאריך ומטפל/ת.</p>

      <ul className="mt-10 divide-y divide-herbal-100 rounded-2xl border border-herbal-100 bg-white shadow-sm">
        {items.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-slate-600">אין תוכן מפורסם עדיין.</li>
        ) : (
          items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link
                href={item.href}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-herbal-50/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-herbal-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.kindLabel}
                    {item.therapistProfileId ? (
                      <>
                        {" · "}
                        <span className="text-herbal-700">{item.therapistName}</span>
                      </>
                    ) : (
                      <> · {item.therapistName}</>
                    )}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs font-medium text-slate-500"
                  dateTime={item.date.toISOString()}
                >
                  {item.date.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
