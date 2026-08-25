import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";
import { ensureBootstrapAdmins } from "@/lib/bootstrap-super-admin";
import { postLoginPath } from "@/lib/post-login-path";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapAdmins();
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/log");
  }
  if (session.user.role !== "admin") {
    redirect(postLoginPath(session));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-herbal-900 sm:text-3xl">הגדרות אתר</h1>
        <Link href="/" className="text-sm font-medium text-herbal-700 underline-offset-4 hover:underline">
          חזרה לדף הבית
        </Link>
      </div>

      {/*
        RTL grid במחשב: עמודה 1 (תוכן) מימין, עמודה 2 (תפריט) משמאל.
        במובייל: תפריט קודם (למעלה), ואז תוכן.
      */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_15.5rem]">
        <aside className="w-full lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <details className="rounded-2xl border border-herbal-200/80 bg-white/90 p-3 shadow-sm lg:hidden">
            <summary className="cursor-pointer list-none text-sm font-semibold text-herbal-900 [&::-webkit-details-marker]:hidden">
              תפריט
            </summary>
            <div className="mt-3">
              <AdminNav />
            </div>
          </details>
          <div className="hidden lg:block">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">תפריט</p>
            <AdminNav />
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">{children}</div>
      </div>
    </div>
  );
}
