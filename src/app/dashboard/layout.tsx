import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>;
}
