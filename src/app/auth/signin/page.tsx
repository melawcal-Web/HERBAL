import SignInForm from "./sign-in-form";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, registered } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  return (
    <SignInForm callbackUrl={safeCallback} showRegisteredBanner={registered === "1"} />
  );
}
