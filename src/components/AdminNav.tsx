"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/log", label: "לוג" },
  { href: "/admin/links", label: "קישורים" },
  { href: "/admin/content", label: "ניהול תוכן (Content)" },
  { href: "/admin/products", label: "מוצרים" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
      {tabs.map((t) => {
        const active = pathname === t.href || (t.href === "/admin/log" && pathname === "/admin");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition lg:text-right ${
              active
                ? "bg-herbal-600 text-white shadow-md shadow-herbal-600/25"
                : "glass-panel border-herbal-200/80 text-herbal-900 hover:border-herbal-300 hover:bg-white/90"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
