import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isProductFileUrl, parseProductMetadata } from "@/lib/product-metadata";
import { storedImageSrc } from "@/lib/stored-image-url";
import { publicProductHref } from "@/lib/product-href";
import { OptionalCoverImage } from "@/components/products/OptionalCoverImage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: "גישה לתוכן",
  robots: { index: false, follow: false },
};

export default async function ProductAccessPage({ params }: Props) {
  const { token } = await params;
  const decoded = decodeURIComponent(token).trim();
  if (!decoded) notFound();

  const purchase = await prisma.contentAcquisition.findFirst({
    where: { accessToken: decoded, eventType: "acquisition" },
  });
  if (!purchase) notFound();
  if (purchase.purchaseStatus === "pending" || purchase.purchaseStatus === "unpaid") {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: { id: purchase.contentId },
  });

  const meta = product ? parseProductMetadata(product.metadata) : {};
  const cover = product ? storedImageSrc(product.imageUrl) : null;
  const downloadUrl = meta.downloadUrl && isProductFileUrl(meta.downloadUrl) ? meta.downloadUrl : null;
  const playbackUrl = meta.playbackUrl?.trim() || null;
  const externalUrl = meta.externalUrl?.trim() || null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6" dir="rtl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-herbal-700/85">גישה לתוכן שנרכש</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-herbal-900">{purchase.contentTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">
        שלום {purchase.guestName ?? "רוכש/ת"} — הרכישה אושרה
        {purchase.guestEmail ? ` עבור ${purchase.guestEmail}` : ""}.
      </p>

      {cover ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-herbal-100 bg-herbal-50">
          <OptionalCoverImage src={cover} className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-6 space-y-3 rounded-2xl border border-herbal-100 bg-white p-5 shadow-sm">
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-full bg-herbal-600 px-4 text-sm font-semibold text-white hover:bg-herbal-500"
          >
            הורדת החומר
          </a>
        ) : null}
        {playbackUrl ? (
          <a
            href={playbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-full border border-herbal-300 bg-herbal-50 px-4 text-sm font-semibold text-herbal-900 hover:bg-herbal-100"
          >
            צפייה בוידאו
          </a>
        ) : null}
        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-full border border-herbal-200 px-4 text-sm font-semibold text-herbal-800 hover:bg-herbal-50"
          >
            מעבר לתוכן החיצוני
          </a>
        ) : null}
        {!downloadUrl && !playbackUrl && !externalUrl ? (
          <p className="text-sm leading-relaxed text-slate-600">
            הרכישה נשמרה במערכת. למטפל/ת עדיין אין קישור הורדה מצורף לפריט — שמרו את כתובת הדף הזה, והמטפל/ת
            יוכל/תוכל לשלוח את הקובץ לאימייל שרשמתם.
          </p>
        ) : null}
      </div>

      {product ? (
        <p className="mt-8 text-center text-sm">
          <Link href={publicProductHref(product.id)} className="font-semibold text-herbal-700 hover:underline">
            חזרה לדף המוצר
          </Link>
        </p>
      ) : null}
    </div>
  );
}
