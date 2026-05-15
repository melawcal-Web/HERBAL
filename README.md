# HERBAL — פרויקט האתר

הקבצים הועתקו לתיקייה הזו (`C:\Users\cohen\OneDrive\Documents\GitHub\HERBAL`).

## מה לעשות עכשיו (3 צעדים)

1. פתחו **GitHub Desktop** → בחרו את הריפו `HERBAL` (או הוסיפו Repository from disk לתיקייה הזו).
2. אמורים לראות את כל הקבצים כשינוי → **Commit** → **Push**.
3. ב־**Vercel**: ייבאו את הריפו. **אל** תגדירו Root Directory ל־`herbal-platform` (הכל כבר בשורש).

לפני הרצה מקומית: `npm install` ואז צרו `.env` לפי `.env.example`.

מדריכים: `SETUP-SIMPLE-HE.md` (עברית), `DEPLOY.md` (אנגלית), **`DATABASE.md`** (מתי מסד הנתונים מתעדכן ב-Vercel, מה ידני, וקישורים ל-Prisma).

## פריסה (Vercel)

אחרי **Push** ל־`main`, Vercel בונה אוטומטית את **הקומיט העדכני**. אם לחצתם **Redeploy** על דיפלוי ישן, ייתכן שיבנה שוב קומיט ישן — עדיף תמיד **Push** חדש או דיפלוי שמציג את ה־SHA העדכני בראש הלוג. (עדכון: middleware משתמש ב־`auth.config.ts` בלי Prisma כדי לשמור על גודל Edge סביר.)
