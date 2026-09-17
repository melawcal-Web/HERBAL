import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { MemberAuthWall } from "@/components/auth/MemberAuthWall";
import { ChaptersAccordion } from "@/components/content/ChaptersAccordion";
import { DigitalProductCheckout } from "@/components/products/DigitalProductCheckout";
import { WaitlistProductCard, type WaitlistProductModel } from "@/components/products/WaitlistProductCard";
import { audienceLabels, contentVisibleForViewer } from "@/lib/content-audience";
import { chaptersFromProductMeta } from "@/lib/content-description-chapters";
import { getContentViewer } from "@/lib/content-viewer";
import { prisma } from "@/lib/prisma";
import {
  isDigitalProductType,
  parseProductAudience,
  parseProductMetadata,
  productTypeLabel,
  publicSafeProductMetadata,
} from "@/lib/product-metadata";
import { storedImageSrc } from "@/lib/stored-image-url";
import { therapistPublicHref } from "@/lib/therapist-public";
import { configuredPaymentHandoffs, parseTherapistPaymentSettings } from "@/lib/therapist-payments";
import { DIGITAL_UNPAID_STRIKE_LIMIT, isBuyerProfileComplete } from "@/lib/buyer-profile";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function money(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(v);
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, active: true },
    select: { title: true, description: true },
  });
  if (!product) return { title: "מוצר לא נמצא" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

export default async function PublicProductDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const viewer = await getContentViewer();

  const product = await prisma.product.findFirst({
    where: { id, active: true },
    include: {
      therapist: {
        select: {
          id: true,
          name: true,
          therapistProfile: { select: { id: true, paymentSettings: true } },
        },
      },
    },
  });
  if (!product) notFound();

  if (!contentVisibleForViewer(product.audience, viewer)) {
    return <MemberAuthWall callbackPath={`/products/${product.id}`} />;
  }

  const meta = parseProductMetadata(product.metadata);
  const chapters = chaptersFromProductMeta(product.metadata, product.description, meta.courseDetails);
  const cover = storedImageSrc(product.imageUrl);
  const therapistProfileId = product.therapist?.therapistProfile?.id ?? null;
  const therapistHref = therapistProfileId ? therapistPublicHref(therapistProfileId) : null;
  const paymentSettings = parseTherapistPaymentSettings(product.therapist?.therapistProfile?.paymentSettings);

  const buyer = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subStatus: true, name: true, email: true, phone: true, digitalUnpaidStrikes: true },
      })
    : null;
  const amountNis = buyer?.subStatus === "active" ? Number(product.memberPrice) : Number(product.price);
  const priceCategoryLabel = buyer?.subStatus === "active" ? "מחיר חברים" : "מחיר מלא";

  const digital = isDigitalProductType(product.type) && !product.isWaitlist;
  const handoffs = digital
    ? configuredPaymentHandoffs(paymentSettings, { amountNis, description: product.title })
    : [];

  const waitlistModel: WaitlistProductModel = {
    id: product.id,
    type: product.type,
    title: product.title,
    description: product.description,
    imageUrl: product.imageUrl,
    price: Number(product.price),
    memberPrice: Number(product.memberPrice),
    minParticipants: product.minParticipants,
    currentRegistered: product.currentRegistered,
    isWaitlist: product.isWaitlist,
    metadata: publicSafeProductMetadata(product.metadata),
    tags: product.tags,
    audience: product.audience,
    therapistId: product.therapistId,
  };

  const aud = audienceLabels(parseProductAudience(product.audience));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" dir="rtl">
      <nav className="text-sm text-slate-600">
        {therapistHref ? (
          <>
            <Link href={therapistHref} className="font-medium text-herbal-700 hover:underline">
              {product.therapist?.name ?? "מטפל/ת"}
            </Link>
            <span className="mx-2 text-herbal-300">/</span>
          </>
        ) : (
          <>
            <Link href="/marketplace" className="font-medium text-herbal-700 hover:underline">
              קורסים וסדנאות
            </Link>
            <span className="mx-2 text-herbal-300">/</span>
          </>
        )}
        <span className="text-herbal-900">{product.title}</span>
      </nav>

      <article className="mt-6 overflow-hidden rounded-2xl border border-herbal-100 bg-white shadow-sm">
        {cover ? (
          <div className="aspect-[16/9] w-full bg-herbal-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-herbal-50 to-herbal-100" />
        )}

        <div className="p-5 sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-herbal-700/85">
            {productTypeLabel(product.type)}
            {aud ? (
              <>
                <span className="mx-2 text-herbal-300">·</span>
                {aud}
              </>
            ) : null}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-herbal-900 sm:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
            <p className="text-xl font-semibold text-herbal-900">{money(amountNis)}</p>
            <p className="text-xs text-slate-500">
              {priceCategoryLabel}
              {Number(product.memberPrice) !== Number(product.price)
                ? ` · חברים: ${money(product.memberPrice)}`
                : null}
            </p>
          </div>

          <ChaptersAccordion chapters={chapters} className="mt-6" />

          {digital ? (
            <div className="mt-8 border-t border-herbal-50 pt-6">
              <h2 className="font-display text-lg font-bold text-herbal-900">תשלום וגישה</h2>
              <div className="mt-4">
                <DigitalProductCheckout
                  productId={product.id}
                  amountNis={amountNis}
                  handoffs={handoffs}
                  signedIn={Boolean(session?.user?.id)}
                  profileComplete={isBuyerProfileComplete(buyer)}
                  blocked={(buyer?.digitalUnpaidStrikes ?? 0) >= DIGITAL_UNPAID_STRIKE_LIMIT}
                  callbackPath={`/products/${product.id}`}
                />
              </div>
            </div>
          ) : product.isWaitlist ? (
            <div className="mt-8 border-t border-herbal-50 pt-6">
              <h2 className="font-display text-lg font-bold text-herbal-900">הרשמה לרשימת המתנה</h2>
              <div className="mt-4">
                <WaitlistProductCard embedded product={waitlistModel} paymentSettings={paymentSettings} />
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-600">רכישה ישירה אינה זמינה לפריט זה.</p>
          )}
        </div>
      </article>
    </div>
  );
}
