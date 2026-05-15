"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; exact?: boolean };

const LINKS: NavLink[] = [
  { href: "/dashboard", label: "סקירה", exact: true },
  { href: "/dashboard/profile", label: "פרופיל" },
  { href: "/dashboard/reports", label: "דוח צפיות" },
  { href: "/dashboard/approvals", label: "אישורים" },
  { href: "/dashboard/finance", label: "כספים" },
];

export function TherapistDashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b border-herbal-100 pb-4"
      aria-label="ניווט מטפל/ת"
    >
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-herbal-600 bg-herbal-600 text-white"
                : "border-herbal-200 text-herbal-800 hover:border-herbal-400 hover:bg-herbal-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
