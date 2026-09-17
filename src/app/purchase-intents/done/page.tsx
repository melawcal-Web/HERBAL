import Link from "next/link";
import { DIGITAL_UNPAID_STRIKE_LIMIT } from "@/lib/buyer-profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "טיפול בכוונת רכישה", robots: { index: false, follow: false } };

type Props = {
  searchParams: Promise<{ ok?: string; kind?: string; error?: string; strikes?: string; mail?: string; access?: string }>;
};

export default async function PurchaseIntentDonePage({ searchParams }: Props) {
  const sp = await searchParams;
  const ok = sp.ok === "1";
  const kind = sp.kind === "paid" ? "paid" : "unpaid";
  const strikes = Number(sp.strikes ?? "0");
  const mail = sp.mail === "1";
  const access = sp.access?.startsWith("/access/") ? sp.access : null;

  if (!ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
        <h1 className="font-display text-2xl font-bold text-herbal-900">לא ניתן לעדכן</h1>
        <p className="mt-3 text-sm text-slate-600">{sp.error || "הכוונה לא נמצאה או כבר טופלה."}</p>
        <Link href="/dashboard/approvals" className="mt-6 inline-flex min-h-[44px] items-center font-semibold text-herbal-700 hover:underline">
          ללוח האישורים
        </Link>
      </div>
    );
  }

  if (kind === "unpaid") {
    return (
      <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
        <h1 className="font-display text-2xl font-bold text-herbal-900">התשלום לא התקבל</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          סימנו את כוונת הרכישה כלא משולמת. נשלחה הודעה לרוכש/ת
          {mail ? "" : " (המייל דלג אם Resend לא מוגדר)"}. מספר ההתראות בחשבון: {Number.isFinite(strikes) ? strikes : "—"}.
          {strikes >= DIGITAL_UNPAID_STRIKE_LIMIT ? " הרכישות הדיגיטליות נחסמו." : ""}
        </p>
        <Link href="/dashboard/approvals" className="mt-6 inline-flex min-h-[44px] items-center font-semibold text-herbal-700 hover:underline">
          ללוח האישורים
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-herbal-900">התשלום אושר</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        נפתחה גישה לרוכש/ת{mail ? " ונשלח קישור לאימייל." : ". שליחת המייל דלגה — אפשר להעביר את קישור הגישה ידנית."}
      </p>
      {access ? (
        <a
          href={access}
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-herbal-600 text-sm font-semibold text-white hover:bg-herbal-500"
        >
          צפייה בדף הגישה
        </a>
      ) : null}
    </div>
  );
}
