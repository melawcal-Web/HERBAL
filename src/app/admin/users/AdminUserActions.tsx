"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { deleteAdminUser, updateAdminUser } from "@/app/actions/admin-users";

type Row = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function AdminUserActions({ user, isSelf }: { user: Row; isSelf: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);

  const onSave = () => {
    setErr(null);
    startTransition(async () => {
      try {
        await updateAdminUser({ userId: user.id, name, email, role });
        setOpen(false);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "שגיאה");
      }
    });
  };

  const onDelete = () => {
    const ok = window.confirm(
      `למחוק לצמיתות את המשתמש/ת "${user.name}" (${user.email})?\nפעולה זו אינה הפיכה.`,
    );
    if (!ok) return;
    setErr(null);
    startTransition(async () => {
      try {
        await deleteAdminUser(user.id);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "שגיאה");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setErr(null);
            setOpen(true);
          }}
          className="rounded-lg border border-herbal-200 bg-white px-3 py-1.5 text-xs font-semibold text-herbal-900 hover:bg-herbal-50"
        >
          עריכה
        </button>
        <button
          type="button"
          disabled={isSelf || pending}
          onClick={onDelete}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          מחיקה
        </button>
      </div>
      {err ? <p className="text-xs text-rose-600">{err}</p> : null}

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-herbal-100 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-herbal-900">עריכת משתמש/ת</h3>
            <div className="mt-4 space-y-3 text-right">
              <div>
                <label className="text-xs font-medium text-slate-600">שם</label>
                <input
                  className="mt-1 w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">אימייל</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">תפקיד</label>
                <select
                  className="mt-1 w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="client">לקוח/ה</option>
                  <option value="therapist">מטפל/ת</option>
                  <option value="admin">מנהל/ת</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-herbal-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-herbal-50"
                onClick={() => setOpen(false)}
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={onSave}
                className="rounded-lg bg-herbal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-50"
              >
                {pending ? "שומר…" : "שמירה"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
