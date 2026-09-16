import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertAdmin, assertTherapist, therapistCanEditProfile } from "@/lib/formula";
import { parseProductAudience, parseProductMetadata } from "@/lib/product-metadata";
import { DigitalMaterialForm } from "@/components/dashboard/DigitalMaterialForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return { title: "עריכת חומר" };
  const product = await prisma.product.findFirst({
    where: { id, therapistId: session.user.id },
    select: { title: true },
  });
  return { title: product ? `עריכת ${product.title}` : "עריכת חומר" };
}

export default async function DashboardEditProductPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  if (!assertTherapist(session.user.role) && !assertAdmin(session.user.role)) {
    redirect("/herbal-index");
  }

  if (session.user.role === "therapist") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { certificateUrl: true },
    });
    if (!therapistCanEditProfile(session.user.role, me?.certificateUrl)) {
      redirect("/dashboard/profile");
    }
  }

  const product = await prisma.product.findFirst({
    where: { id, therapistId: session.user.id },
  });
  if (!product) notFound();

  const meta = parseProductMetadata(product.metadata);

  return (
    <div>
      <Link
        href="/dashboard/products"
        className="text-sm font-medium text-herbal-700 underline-offset-4 hover:underline"
      >
        חזרה לחומרים הדיגיטליים
      </Link>
      <h1 className="mt-4 font-display text-3xl text-herbal-900">עריכת חומר</h1>
      <p className="mt-2 text-sm text-slate-600">עדכון כותרת, סוג, תיאור, מחירים, קהל יעד וקישור הורדה.</p>
      <div className="mt-6 rounded-2xl border border-herbal-200/80 bg-white/90 p-5 shadow-sm sm:p-7">
        <DigitalMaterialForm
          mode="edit"
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            type: product.type,
            price: product.price.toString(),
            memberPrice: product.memberPrice.toString(),
            imageUrl: product.imageUrl ?? "",
            audience: parseProductAudience(product.audience),
            downloadUrl: meta.downloadUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
