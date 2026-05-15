"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { assertAdmin, assertTherapist, therapistCanUseClinicalTools } from "@/lib/formula";
import { therapistOperationsPath } from "@/lib/post-login-path";

type MenuItem = { href: string; label: string };

function buildMenuItems(session: Session): MenuItem[] {
  const role = session.user.role;
  const items: MenuItem[] = [];

  if (assertTherapist(role) || assertAdmin(role)) {
    items.push({ href: "/dashboard/profile", label: "פרופיל שלי" });
  }

  if (assertTherapist(role)) {
    items.push({ href: "/dashboard/finance", label: "הכספים שלי" });
    items.push({ href: therapistOperationsPath(), label: "אישורי תשלום וצפיות" });
    if (therapistCanUseClinicalTools(role, session.user.therapistVerification)) {
      items.push({ href: "/dashboard/emr", label: "יומן קליני" });
    }
  }

  if (assertAdmin(role)) {
    items.push({ href: "/admin/content", label: "ניהול תוכן" });
    items.push({ href: "/admin", label: "מרכז ניהול" });
  } else if (assertTherapist(role)) {
    items.push({ href: "/dashboard/content", label: "ניהול תוכן" });
  }

  return items;
}

export function UserAccountMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const displayName = session.user.name?.trim() || session.user.email?.trim() || "חשבון";
  const items = buildMenuItems(session);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[min(11rem,42vw)] items-center gap-1.5 rounded-xl border border-transparent px-1 py-1 text-sm font-semibold text-herbal-900 transition hover:border-herbal-200/80 hover:bg-white/60 sm:max-w-[14rem] sm:gap-2 sm:px-2"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate">{displayName}</span>
        <ProfileAvatar imageUrl={session.user.image} name={displayName} seed={session.user.id} size="sm" className="!h-9 !w-9 !ring-1" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 top-full z-[60] mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-herbal-100 bg-white py-2 shadow-xl shadow-herbal-900/10"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-herbal-900 transition hover:bg-herbal-50"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-herbal-100" />
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-right text-sm font-medium text-herbal-900 transition hover:bg-herbal-50"
            >
              יציאה
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
