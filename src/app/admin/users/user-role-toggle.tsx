"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { UserRole } from "@prisma/client";
import { setUserAdminRole } from "@/app/actions/admin-users";

function roleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "מנהל/ת";
    case "therapist":
      return "מטפל/ת";
    default:
      return "לקוח/ה";
  }
}

export function UserRoleToggle({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isAdmin = currentRole === "admin";

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        await setUserAdminRole(userId, !isAdmin);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        dir="ltr"
        disabled={pending}
        onClick={toggle}
        className={`relative inline-flex h-8 w-[3.25rem] shrink-0 cursor-pointer rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-600 disabled:opacity-50 ${
          isAdmin ? "border-amber-400 bg-amber-100" : "border-herbal-200 bg-white"
        }`}
        role="switch"
        aria-checked={isAdmin}
        aria-label={isAdmin ? "הסר הרשאת מנהל" : "הפוך למנהל/ת"}
        title={isAdmin ? "מצב: ADMIN — לחצו ל-USER" : "מצב: USER — לחצו ל-ADMIN"}
      >
        <span
          className={`pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-herbal-600 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none ${
            isAdmin ? "end-0.5" : "start-0.5"
          }`}
        />
      </button>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {isAdmin ? "ADMIN" : "USER"} · {roleLabel(currentRole)}
      </span>
      {isSelf ? <span className="text-[10px] text-slate-400">(אתם)</span> : null}
      {error ? <span className="max-w-[12rem] text-right text-[11px] text-rose-600">{error}</span> : null}
    </div>
  );
}
