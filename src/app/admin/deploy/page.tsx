import { DeployToLiveButton } from "@/components/admin/DeployToLiveButton";

export const metadata = { title: "העלאה לאוויר" };

export default function AdminDeployPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-herbal-900">העלאה לאוויר</h2>
        <p className="mt-1 text-slate-600">
          דוחף את ה-commit הנוכחי ל-GitHub (<code className="rounded bg-herbal-50 px-1">origin</code>
          ). Railway פורס אוטומטית מ-<code className="rounded bg-herbal-50 px-1">main</code>.
        </p>
      </div>

      <section className="glass-panel space-y-4 p-6">
        <p className="text-sm text-slate-600">
          הכפתור עובד רק כשהאתר רץ <strong className="font-semibold text-herbal-900">מקומית</strong>{" "}
          (<code className="rounded bg-herbal-50 px-1">npm run dev</code>) עם גישה ל-git. אפשר גם מהטרמינל:{" "}
          <code className="rounded bg-herbal-50 px-1">npm run deploy</code>.
        </p>
        <DeployToLiveButton />
      </section>
    </div>
  );
}
