import type { Session } from "next-auth";
import { assertAdmin, assertTherapist, therapistCanUseClinicalTools } from "@/lib/formula";
import { memberLandingPath } from "@/lib/herbal-index-flag";

/** יעד ברירת מחדל אחרי התחברות — ללא לוח בקרה כללי */
export function postLoginPath(session: Session | null): string {
  if (!session?.user) return "/auth/signin";
  const { role, therapistVerification } = session.user;
  if (assertAdmin(role)) return "/admin/content";
  if (assertTherapist(role)) return "/dashboard/profile";
  if (therapistCanUseClinicalTools(role, therapistVerification)) return "/dashboard/emr";
  return memberLandingPath();
}

export function therapistOperationsPath(): string {
  return "/dashboard/approvals";
}
