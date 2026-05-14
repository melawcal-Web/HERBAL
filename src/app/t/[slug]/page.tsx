import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CommunityBanner } from "@/components/CommunityBanner";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.therapistProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return { title: "מטפל לא נמצא" };
  return {
    title: `${profile.user.name} | מטפל/ת צמחי מרפא`,
    description: profile.bio.slice(0, 160),
    openGraph: { title: profile.user.name, description: profile.bio.slice(0, 200) },
  };
}

export default async function TherapistPublicPage({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.therapistProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, image: true } },
    },
  });
  if (!profile) notFound();

  const articles = await prisma.herbalArticle.findMany({
    where: { therapistId: profile.userId, published: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <>
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <div className="relative h-[min(44vh,480px)] w-full overflow-hidden bg-gradient-to-br from-herbal-900 to-herbal-950">
          {profile.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.user.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-herbal-700 to-herbal-950 text-[clamp(4rem,18vw,10rem)] font-bold text-white/20">
              {profile.user.name.slice(0, 1)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-45% to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-12 pt-24 sm:px-8 sm:pb-14">
            <div className="mx-auto max-w-4xl text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90">מטפל/ת צמחי מרפא</p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
                {profile.user.name}
              </h1>
              <p className="mt-3 text-base font-medium text-white/95 sm:text-lg">
                {profile.specialty1} · {profile.specialty2} · {profile.specialty3}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <article className="animate-slide-up rounded-3xl border border-herbal-100 bg-white/95 p-6 shadow-lg shadow-herbal-900/5 sm:p-10">
          <section>
            <h2 className="font-display text-xl text-herbal-900">אודות</h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700">{profile.bio}</p>
          </section>

          <section className="mt-10 border-t border-herbal-100 pt-8">
            <h2 className="font-display text-xl text-herbal-900">מאמרים באינדקס הצמחים</h2>
            {articles.length === 0 ? (
              <p className="mt-3 text-slate-600">טרם פורסמו מאמרים.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/herbal-index/${a.slug}`}
                      className="block min-h-[44px] rounded-xl border border-transparent px-2 py-2 hover:border-herbal-200 hover:bg-herbal-50"
                    >
                      <span className="font-medium text-herbal-900">{a.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{a.excerpt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

      <CommunityBanner therapistName={profile.user.name} therapistSlug={profile.slug} />
    </div>
    </>
  );
}
