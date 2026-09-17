import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BuyerAccountProfileForm } from "@/app/account/profile/buyer-profile-form";

export const metadata = { title: "פרטי חשבון" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

function safeCallback(raw: string | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default async function BuyerAccountProfilePage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  const callbackPath = safeCallback(sp.callbackUrl);
  if (!session?.user?.id) {
    const next = callbackPath ?? "/account/profile";
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(next)}`);
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });
  if (!user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6" dir="rtl">
      <h1 className="font-display text-3xl font-bold text-herbal-900">פרטי חשבון לרכישה</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        רכישת חומר דיגיטלי משתמשת בשם, אימייל וטלפון מהפרופיל. אין טופס אורח בקופה.
      </p>
      <BuyerAccountProfileForm
        initialName={user.name}
        email={user.email}
        initialPhone={user.phone ?? ""}
        callbackPath={callbackPath}
      />
    </div>
  );
}
