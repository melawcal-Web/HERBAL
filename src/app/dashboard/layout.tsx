import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertTherapist } from "@/lib/formula";
import { TherapistDashboardNav } from "@/components/dashboard/TherapistDashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {assertTherapist(session.user.role) ? <TherapistDashboardNav /> : null}
      {children}
    </div>
  );
}
