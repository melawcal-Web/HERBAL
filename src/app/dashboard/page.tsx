import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { postLoginPath } from "@/lib/post-login-path";

/** לוח הבקרה הכללי הוסר — הפניה ישירה לפרופיל / ניהול תוכן */
export default async function DashboardRedirectPage() {
  const session = await auth();
  redirect(postLoginPath(session));
}
