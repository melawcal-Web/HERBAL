import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { postLoginPath } from "@/lib/post-login-path";

export const metadata = {
  title: "כניסה והרשמה",
};

export default async function AuthHubPage() {
  const session = await auth();
  if (session?.user) redirect(postLoginPath(session));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl text-herbal-900">כניסה והרשמה</h1>
      <p className="mt-2 text-slate-600">בחרו התחברות עם אימייל וסיסמה או עם גוגל.</p>

      <div className="mt-8 space-y-3">
        <GoogleSignInButton />
      </div>

      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">או</span>
        <span className="h-px flex-1 bg-herbal-200" aria-hidden />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/auth/signin"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-herbal-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-500"
        >
          כניסה באימייל
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-herbal-300 bg-white px-6 py-3 text-center text-sm font-semibold text-herbal-900 transition hover:bg-herbal-50"
        >
          הרשמה באימייל
        </Link>
      </div>
    </div>
  );
}
