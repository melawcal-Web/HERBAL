import SignInForm from "./sign-in-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { postLoginPath } from "@/lib/post-login-path";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; pendingTherapist?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const session = await auth();
  const { callbackUrl, registered, pendingTherapist } = await searchParams;

  if (session?.user && !registered && !pendingTherapist) {
    const dest =
      callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") && callbackUrl !== "/dashboard"
        ? callbackUrl
        : postLoginPath(session);
    redirect(dest);
  }

  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") && callbackUrl !== "/dashboard"
      ? callbackUrl
      : postLoginPath(session);

  return (
    <SignInForm
      callbackUrl={safeCallback}
      showRegisteredBanner={registered === "1"}
      showPendingTherapistBanner={pendingTherapist === "1"}
    />
  );
}
