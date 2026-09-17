import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPurchaseIntentAction, type PurchaseIntentEmailAction } from "@/lib/purchase-intent-token";
import { executeSignedPurchaseIntentAction } from "@/app/actions/digital-purchase";

function isAction(v: string): v is PurchaseIntentEmailAction {
  return v === "unpaid" || v === "paid";
}

type Props = {
  params: Promise<{ action: string }>;
  searchParams: Promise<{ id?: string; sig?: string }>;
};

export const dynamic = "force-dynamic";
export const metadata = { title: "אישור פעולה בכוונת רכישה", robots: { index: false, follow: false } };

export default async function PurchaseIntentActionPage({ params, searchParams }: Props) {
  const { action } = await params;
  const sp = await searchParams;
  const id = sp.id ?? "";
  const sig = sp.sig ?? "";

  if (!isAction(action) || !id || !sig || !verifyPurchaseIntentAction(id, action, sig)) {
    return (
      <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
        <h1 className="font-display text-2xl font-bold text-herbal-900">קישור לא תקין</h1>
        <p className="mt-3 text-sm text-slate-600">הקישור חסר, פגום או שפג תוקפו. אפשר לפעול מלוח האישורים אחרי כניסה.</p>
        <Link href="/dashboard/approvals" className="mt-6 inline-flex min-h-[44px] items-center font-semibold text-herbal-700 hover:underline">
          ללוח האישורים
        </Link>
      </div>
    );
  }

  const row = await prisma.contentAcquisition.findFirst({
    where: { id, eventType: "acquisition" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!row) notFound();

  if (row.purchaseStatus !== "pending") {
    return (
      <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
        <h1 className="font-display text-2xl font-bold text-herbal-900">הכוונה כבר טופלה</h1>
        <p className="mt-3 text-sm text-slate-600">סטטוס נוכחי: {row.purchaseStatus ?? "לא ידוע"}.</p>
        <Link href="/dashboard/approvals" className="mt-6 inline-flex min-h-[44px] items-center font-semibold text-herbal-700 hover:underline">
          ללוח האישורים
        </Link>
      </div>
    );
  }

  const buyerName = row.user?.name ?? row.guestName ?? "רוכש/ת";
  const buyerEmail = row.user?.email ?? row.guestEmail ?? "";
  const buyerPhone = row.user?.phone ?? row.guestPhone ?? "";
  const unpaid = action === "unpaid";

  return (
    <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-herbal-900">
        {unpaid ? "סימון: התשלום לא התקבל" : "אישור תשלום ופתיחת גישה"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {unpaid
          ? "פעולה זו שולחת לרוכש/ת «התשלום לא התקבל», נרשמת במערכת, ומתווספת כהתראה (שלוש התראות חוסמות רכישות דיגיטליות)."
          : "פעולה זו מאשרת שהתשלום התקבל, יוצרת קישור גישה ושולחת אותו לרוכש/ת."}
      </p>
      <dl className="mt-6 space-y-2 rounded-2xl border border-herbal-100 bg-white p-4 text-sm shadow-sm">
        <div>
          <dt className="text-xs text-slate-500">מוצר</dt>
          <dd className="font-semibold text-herbal-900">{row.contentTitle}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">רוכש/ת</dt>
          <dd className="text-slate-800">
            {buyerName}
            {buyerEmail ? ` · ${buyerEmail}` : ""}
            {buyerPhone ? ` · ${buyerPhone}` : ""}
          </dd>
        </div>
      </dl>
      <form action={executeSignedPurchaseIntentAction} className="mt-6 space-y-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value={action} />
        <input type="hidden" name="sig" value={sig} />
        <button
          type="submit"
          className={`flex min-h-[48px] w-full items-center justify-center rounded-full px-4 text-sm font-semibold ${
            unpaid
              ? "border border-rose-200 text-rose-800 hover:bg-rose-50"
              : "bg-herbal-600 text-white hover:bg-herbal-500"
          }`}
        >
          {unpaid ? "אישור: התשלום לא התקבל" : "אישור תשלום וגישה"}
        </button>
      </form>
      <Link href="/dashboard/approvals" className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-herbal-700 hover:underline">
        ביטול · ללוח האישורים
      </Link>
    </div>
  );
}
