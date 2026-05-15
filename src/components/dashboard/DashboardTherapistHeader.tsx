import Link from "next/link";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";

export function DashboardTherapistHeader({
  name,
  imageUrl,
  userId,
}: {
  name: string;
  imageUrl: string | null;
  userId: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-4 rounded-2xl border border-herbal-100 bg-white/90 p-4 shadow-sm">
      <ProfileAvatar imageUrl={imageUrl} name={name} seed={`dash-${userId}`} size="md" />
      <div className="min-w-0 flex-1 text-right">
        <p className="text-xs font-semibold uppercase tracking-wide text-herbal-700/80">לוח בקרה</p>
        <p className="font-display text-xl font-bold text-herbal-900">{name}</p>
        <Link href="/dashboard/profile" className="mt-1 inline-block text-sm font-semibold text-herbal-700 hover:underline">
          עריכת פרופיל ותמונה
        </Link>
      </div>
    </div>
  );
}
