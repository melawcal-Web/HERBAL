import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProductAudience, parseProductMetadata } from "@/lib/product-metadata";
import { AddProductForm } from "../add-product-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: product ? `עריכת ${product.title}` : "עריכת מוצר" };
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, therapists] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: {
        OR: [{ role: "therapist" }, { therapistProfile: { isNot: null } }],
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  const meta = parseProductMetadata(product.metadata);

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm font-medium text-herbal-700 underline-offset-4 hover:underline"
      >
        חזרה לרשימת המוצרים
      </Link>
      <h2 className="mt-4 font-display text-xl font-bold text-herbal-900 sm:text-2xl">עריכת מוצר</h2>
      <p className="mt-2 text-sm text-slate-600">עדכון סוג, תיאור, קהל יעד, מטפל/ת, מחירים וקישור הורדה.</p>

      <div className="mt-2 rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <AddProductForm
          mode="edit"
          therapists={therapists}
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            type: product.type,
            price: product.price.toString(),
            memberPrice: product.memberPrice.toString(),
            imageUrl: product.imageUrl ?? "",
            audience: parseProductAudience(product.audience),
            therapistId: product.therapistId ?? "",
            downloadUrl: meta.downloadUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
