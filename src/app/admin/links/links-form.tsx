"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteServiceUsernames } from "@/app/actions/site-config";

const rows = [
  {
    key: "github" as const,
    title: "GitHub",
    description: "קוד האתר (ריפו HERBAL)",
    href: "https://github.com/melawcal-Web/HERBAL",
    placeholder: "למשל melawcal-Web",
  },
  {
    key: "vercel" as const,
    title: "Vercel",
    description: "אירוח ופריסה",
    href: "https://vercel.com/dashboard",
    placeholder: "שם משתמש או צוות ב-Vercel",
  },
  {
    key: "railway" as const,
    title: "Railway",
    description: "מסד MySQL ושירותים",
    href: "https://railway.app/dashboard",
    placeholder: "שם משתמש ב-Railway",
  },
];

type Initial = { github: string; vercel: string; railway: string };

export function AdminLinksForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [github, setGithub] = useState(initial.github);
  const [vercel, setVercel] = useState(initial.vercel);
  const [railway, setRailway] = useState(initial.railway);
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    setMsg(null);
    startTransition(async () => {
      try {
        await updateSiteServiceUsernames({ githubUsername: github, vercelUsername: vercel, railwayUsername: railway });
        setMsg("נשמר.");
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  const values = { github, vercel, railway };
  const setters = {
    github: setGithub,
    vercel: setVercel,
    railway: setRailway,
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-herbal-100 bg-white/80">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead>
            <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3 font-semibold">שירות</th>
              <th className="px-4 py-3 font-semibold">קישור</th>
              <th className="px-4 py-3 font-semibold">שם משתמש / הערה (ללא סיסמה)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-herbal-100">
            {rows.map((r) => (
              <tr key={r.key} className="align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-herbal-900">{r.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{r.description}</p>
                </td>
                <td className="px-4 py-4">
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-xs text-herbal-700 underline underline-offset-2 hover:text-herbal-900"
                  >
                    {r.href}
                  </a>
                </td>
                <td className="px-4 py-4">
                  <input
                    className="w-full min-h-[44px] rounded-xl border border-herbal-200 bg-white px-3 py-2 text-sm"
                    dir="ltr"
                    value={values[r.key]}
                    onChange={(e) => setters[r.key](e.target.value)}
                    placeholder={r.placeholder}
                    autoComplete="off"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="min-h-[48px] rounded-full bg-herbal-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-herbal-500 disabled:opacity-50"
        >
          {pending ? "שומרים…" : "שמירת שמות משתמש"}
        </button>
        {msg && <p className={`text-sm ${msg === "נשמר." ? "text-herbal-700" : "text-rose-600"}`}>{msg}</p>}
      </div>

      <p className="text-xs text-slate-500">
        הקישורים הם לדפי הדשבורד הרשמיים. ניתן להחליף את כתובת הריפו ב-GitHub בקוד ב־
        <code className="mx-1 rounded bg-herbal-50 px-1">src/app/admin/links/links-form.tsx</code> אם הריפו שונה.
      </p>
    </div>
  );
}
