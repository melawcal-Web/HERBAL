"use client";

import { signIn } from "next-auth/react";

type Props = {
  callbackUrl?: string;
  className?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/dashboard/profile",
  className = "w-full min-h-[48px] rounded-full border border-herbal-200 bg-white py-3 text-sm font-semibold text-herbal-900 shadow-sm transition hover:bg-herbal-50 disabled:opacity-60",
}: Props) {
  return (
    <button type="button" className={className} onClick={() => signIn("google", { callbackUrl })}>
      הרשמה באמצעות חשבון גוגל
    </button>
  );
}
