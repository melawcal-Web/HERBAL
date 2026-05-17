import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRoleToggle } from "./user-role-toggle";
import { DuplicateTherapistButton } from "./DuplicateTherapistButton";
import { AdminUserActions } from "./AdminUserActions";

export const metadata = {
  title: "ניהול משתמשים",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const selfId = session?.user?.id;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      therapistProfile: { select: { id: true } },
    },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">ניהול משתמשים</h2>
      <p className="mt-2 text-sm text-slate-600">
        שם, אימייל ותפקיד. מתג המצב מחליף בין <strong>USER</strong> (לקוח/ה או מטפל/ת) לבין <strong>ADMIN</strong> (מנהל/ת).
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-herbal-100 bg-white/90 shadow-sm">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b border-herbal-100 bg-herbal-50/80 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3 font-semibold">שם</th>
              <th className="px-4 py-3 font-semibold">אימייל</th>
              <th className="px-4 py-3 font-semibold">תפקיד</th>
              <th className="px-4 py-3 font-semibold">USER / ADMIN</th>
              <th className="px-4 py-3 font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-herbal-100">
            {users.map((u) => (
              <tr key={u.id} id={`admin-user-${u.id}`} className="hover:bg-herbal-50/40">
                <td className="px-4 py-3 font-medium text-herbal-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {u.role === "admin" ? "מנהל/ת" : u.role === "therapist" ? "מטפל/ת" : "לקוח/ה"}
                  {u.therapistProfile ? (
                    <span className="mr-1 block text-[11px] text-slate-500">(פרופיל מטפל/ת)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <UserRoleToggle userId={u.id} currentRole={u.role} isSelf={selfId === u.id} />
                  {u.therapistProfile ? (
                    <DuplicateTherapistButton userId={u.id} userName={u.name} />
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top">
                  <AdminUserActions user={{ id: u.id, name: u.name, email: u.email, role: u.role }} isSelf={selfId === u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
