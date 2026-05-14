import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CommunityBanner } from "@/components/CommunityBanner";
import { TherapistProfileContact } from "@/components/TherapistProfileContact";
import { parseContactInfo, parseSocialLinks } from "@/lib/therapist-contact";

type Props = { params: Promise<{ slug: string }> };

const overlayTextShadow = {
  textShadow:
    "0 2px 20px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1)",
} as const;

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

function specialtyLine(s1: string, s2: string, s3: string) {
  return [s1, s2, s3].filter(Boolean).join(" · ");
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

  const contact = parseContactInfo(profile.contactInfo);
  const social = parseSocialLinks(profile.socialLinks);
  const spec = specialtyLine(profile.specialty1, profile.specialty2, profile.specialty3);

  return (
    <>
      <div className="mx-auto max-w-6xl px-0 pb-12 sm:px-4 lg:px-6 lg:pb-16">
        <div className="overflow-hidden border-herbal-100/80 bg-white/50 shadow-lg shadow-herbal-900/8 sm:rounded-3xl lg:rounded-[2rem] lg:border lg:bg-white/60 lg:shadow-xl">
          <div className="flex flex-col lg:grid lg:min-h-[min(88vh,920px)] lg:grid-cols-2 lg:items-stretch">
            {/* Hero — full-bleed on mobile, first column on desktop (RTL: appears on the right) */}
            <div className="relative min-h-[min(52vh,520px)] w-full lg:min-h-full">
              {profile.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center therapist-photo-bw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-herbal-800 to-herbal-950">
                  <span className="font-display text-[clamp(4rem,22vw,9rem)] font-bold text-white/20">
                    {profile.user.name.slice(0, 1)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-50% to-black/15" />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32 lg:px-10 lg:pb-14">
                <div className="text-right">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200/95 sm:text-[11px]"
                    style={overlayTextShadow}
                  >
                    מטפל/ת צמחי מרפא
                  </p>
                  <h1
                    className="mt-2 font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-[2.65rem] lg:leading-tight"
                    style={overlayTextShadow}
                  >
                    {profile.user.name}
                  </h1>
                  <p
                    className="mt-3 text-sm font-semibold leading-snug text-white/95 sm:text-base lg:text-lg"
                    style={overlayTextShadow}
                  >
                    {spec}
                  </p>
                </div>
              </div>
            </div>

            {/* Details column */}
            <div className="flex flex-col bg-white/95 px-5 py-8 sm:px-8 sm:py-10 lg:justify-between lg:px-10 lg:py-12">
              <div>
                <section>
                  <h2 className="font-display text-2xl text-herbal-900">אודות</h2>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700 sm:text-[1.05rem]">
                    {profile.bio}
                  </p>
                </section>

                <TherapistProfileContact contact={contact} social={social} />

                <section className="mt-10 border-t border-herbal-100/90 pt-8">
                  <h2 className="font-display text-xl text-herbal-900">מאמרים באינדקס הצמחים</h2>
                  {articles.length === 0 ? (
                    <p className="mt-3 text-slate-600">טרם פורסמו מאמרים.</p>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {articles.map((a) => (
                        <li key={a.id}>
                          <Link
                            href={`/herbal-index/${a.slug}`}
                            className="block min-h-[48px] rounded-xl border border-transparent px-2 py-3 transition hover:border-herbal-200 hover:bg-herbal-50/90"
                          >
                            <span className="font-semibold text-herbal-900">{a.title}</span>
                            <span className="mt-1 block text-sm text-slate-600">{a.excerpt}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <CommunityBanner therapistName={profile.user.name} therapistSlug={profile.slug} />
      </div>
    </>
  );
}
