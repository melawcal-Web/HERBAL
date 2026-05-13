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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <article className="animate-slide-up rounded-3xl border border-herbal-100 bg-white/95 p-6 shadow-lg shadow-herbal-900/5 sm:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-herbal-100 bg-herbal-50">
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt=""
                className="h-full w-full object-cover therapist-photo-bw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-herbal-400">
                {profile.user.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h1 className="font-display text-3xl text-herbal-900">{profile.user.name}</h1>
            <p className="mt-2 text-sm text-sage">
              {profile.specialty1} · {profile.specialty2} · {profile.specialty3}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-slate-700">{profile.bio}</p>
          </div>
        </div>

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
  );
}
