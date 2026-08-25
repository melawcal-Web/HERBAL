"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/log", label: "לוג" },
  { href: "/admin/users", label: "ניהול משתמשים" },
  { href: "/admin/referrals", label: "דוח פניות" },
  { href: "/admin/therapist-approvals", label: "אישור תעודות" },
  { href: "/admin/links", label: "קישורים" },
  { href: "/admin/content", label: "ניהול תוכן (Content)" },
  { href: "/admin/products", label: "קורסים וסדנאות" },
  { href: "/admin/deploy", label: "העלאה לאוויר" },
];

function navPillClass(active: boolean) {
  return [
    "min-h-[40px] w-full rounded-xl px-4 py-2.5 text-right text-sm font-semibold transition",
    active
      ? "bg-herbal-600 text-white shadow-md shadow-herbal-600/25"
      : "glass-panel border border-herbal-200/80 bg-white text-herbal-900 shadow-sm hover:border-herbal-300 hover:bg-white",
  ].join(" ");
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {tabs.map((t) => {
        const active =
          pathname === t.href ||
          (t.href === "/admin/log" && (pathname === "/admin" || pathname === "/admin/log")) ||
          (t.href !== "/admin/log" && pathname.startsWith(t.href));
        return (
          <Link key={t.href} href={t.href} className={navPillClass(active)}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
