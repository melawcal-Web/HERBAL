# Google OAuth 2.0 — הגדרה (התחברות חובה)

האתר משתמש ב-**Google OAuth 2.0 בלבד** לכניסת משתמשים. הגישה קשורה לזהות Google של המשתמש/ת.

## 1. Google Cloud Console

1. פתחו [Google Cloud Console](https://console.cloud.google.com/).
2. צרו פרויקט או בחרו קיים.
3. **APIs & Services → OAuth consent screen**
   - User Type: External (או Internal לארגון)
   - מלאו שם האפליקציה, אימייל תמיכה, דומיין (למשל `your-app.vercel.app`)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (פיתוח)
     - `https://YOUR-PRODUCTION-DOMAIN` (פרודקשן)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://YOUR-PRODUCTION-DOMAIN/api/auth/callback/google`

## 2. משתני סביבה

ב־`.env` מקומי וב־Vercel (Settings → Environment Variables):

```env
AUTH_SECRET=openssl-rand-base64-32   # או: npx auth secret
AUTH_GOOGLE_ID=xxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxx
```

חלופות נתמכות: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## 3. בדיקה מקומית

```bash
npm run dev
```

גלשו ל־`/auth/signin` — כפתור «התחברות עם Google» בלבד (ללא סיסמה בפרודקשן).

## 4. אבטחה

- אל תפרסמו `AUTH_GOOGLE_SECRET` בצד לקוח.
- בפרודקשן הגדירו `AUTH_URL=https://YOUR-PRODUCTION-DOMAIN` אם NextAuth דורש URL מפורש.
- לפיתוח בלבד: `ALLOW_PASSWORD_AUTH=true` מאפשר טופס אימייל/סיסמה (לא מומלץ בפרודקשן).

## 5. קישור חשבון קיים

משתמשים שנרשמו בעבר עם אימייל+סיסמה יכולים להתחבר עם Google **באותו אימייל** — החשבון מתמזג (`allowDangerousEmailAccountLinking`).
