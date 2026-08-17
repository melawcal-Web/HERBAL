# HERBAL — פרויקט האתר

אתר קהילת מטפלי צמחי מרפא (Next.js + MySQL). הקוד בשורש הריפו `HERBAL` — ב־Vercel **אל** תגדירו Root Directory.

## הרצה מקומית

1. התקינו Docker Desktop והריצו `docker compose up -d`
2. העתיקו `.env.example` ל־`.env` (ברירת המחדל מתאימה ל-Docker המקומי)
3. `npm install`
4. `npx prisma db push`
5. `npm run db:seed` (תוכן דמו — אופציונלי אבל מומלץ)
6. `npm run dev` → http://localhost:3000

מדריכים: `SETUP-SIMPLE-HE.md` (עברית), `DEPLOY.md` (אנגלית), **`DATABASE.md`** (מתי מסד הנתונים מתעדכן ב-Vercel).

## פריסה (Vercel)

אחרי **Push** ל־`main`, Vercel בונה אוטומטית את **הקומיט העדכני**. ודאו שמוגדרים `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL`, ו־`SUPER_ADMIN_EMAIL`. להעלאת תמונות בפרודקשן נדרש `BLOB_READ_WRITE_TOKEN`.
