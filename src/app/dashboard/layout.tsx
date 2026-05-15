import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { TherapistDashboardNav } from "@/components/dashboard/TherapistDashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const showTherapistNav = assertTherapist(session.user.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {showTherapistNav ? <TherapistDashboardNav /> : null}
      {children}
    </div>
  );
}
