import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";
import { ensureBootstrapAdmins } from "@/lib/bootstrap-super-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapAdmins();
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/log");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-herbal-900 sm:text-3xl">מרכז ניהול</h1>
        <Link href="/" className="text-sm font-medium text-herbal-700 underline-offset-4 hover:underline">
          חזרה לדף הבית
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="shrink-0 lg:order-first lg:w-48">
          <p className="mb-2 hidden text-xs font-medium uppercase tracking-wide text-slate-500 lg:block">תפריט</p>
          <AdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
