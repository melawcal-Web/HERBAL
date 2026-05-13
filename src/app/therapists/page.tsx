import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "מטפלים",
};

export default async function TherapistsDirectoryPage() {
  const therapists = await prisma.therapistProfile.findMany({
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-herbal-900">מטפלים רשומים</h1>
      <p className="mt-2 text-slate-600">בחרו מטפל/ת ועברו לדף הנחיתה האישי.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {therapists.map((t) => (
          <li key={t.id}>
            <Link
              href={`/t/${t.slug}`}
              className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-herbal-50">
                {t.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.user.image}
                    alt=""
                    className="h-full w-full object-cover therapist-photo-bw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg text-herbal-400">
                    {t.user.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-herbal-900">{t.user.name}</p>
                <p className="text-sm text-slate-600">
                  {t.specialty1} · {t.specialty2}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
