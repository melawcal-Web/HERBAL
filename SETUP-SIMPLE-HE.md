# מדריך הקמה — כמו לילד (GitHub + MySQL + Railway)

מטרה: שיהיה לך **אתר חי באינטרנט** + **מסד נתונים SQL (MySQL)** + הכל ב־**Railway** באותו פרויקט.

תעבוד **לפי הסדר מהלמעלה למטה**. אל תדלג.

---

## לפני הכל (חשוב מאוד)

1. אתה צריך **את תיקיית הקוד** `HERBAL` במחשב (או שמישהו מטפל בזה בשבילך).  
   בלי זה אי אפשר להעלות לגיטהאב.

2. ב־Railway נבנה את האתר עם הפקודה (כבר מוכן בפרויקט):  
   `prisma generate && prisma db push && next build`  
   כלומר בכל **Deploy** מוצלח — **מבנה** מסד הנתונים (טבלאות/עמודות לפי `prisma/schema.prisma`) מתעדכן אוטומטית מול ה־`DATABASE_URL`. **לא צריך** ללחוץ שום דבר במסד. שינוי שעלול למחוק נתונים יכשיל את הבילד במקום למחוק בשקט.

3. **תוכן התחלה** (מוצרים/מאמרים/משתמשים מה־seed) **לא** רץ אוטומטית ב-Railway. אם צריך — מריצים פעם מהמחשב: `npm run db:seed` (ראו `DATABASE.md` ושלב 4 למטה).

**קישורים רשמיים ל-Prisma:** מבנה הטבלאות + seed — בקובץ **[DATABASE.md](./DATABASE.md)** (עברית + לינקים).

---

## שלב 1 — פתח חשבון ב־GitHub (מקום לאחסן את הקוד)

1. גש לאתר: [https://github.com/signup](https://github.com/signup)
2. מלא אימייל, סיסמה, שם משתמש.
3. אשר את המייל אם ביקשו.

### צור “ריפו” (Repository) חדש

1. גש ל: [https://github.com/new](https://github.com/new)
2. בשדה **Repository name** כתוב למשל: `herbal-therapists-center`
3. בחר **Public** (מספיק להתחלה).
4. לחץ **Create repository**.

עכשיו יש לך דף של ריפו ריק עם הוראות.

### איך מעלים את הקבצים בלי טרמינל (הכי פשוט)

1. הורד והתקן: [GitHub Desktop](https://desktop.github.com/)
2. התחבר עם חשבון ה־GitHub שלך.
3. ב־GitHub Desktop: **File → Clone repository** ובחר את הריפו שיצרת.
4. פתח את התיקייה במחשב (ב־GitHub Desktop יש כפתור **Show in Explorer**).
5. **העתק** לתוכה את כל הקבצים מתוך `HERBAL` (כך ש־`package.json` יהיה **בשורש** תיקיית הריפו).

חזור ל־GitHub Desktop:

1. תראה רשימת קבצים שהשתנו.
2. למטה כתוב **Summary**: כתוב למשל `Initial import`
3. לחץ **Commit to main**
4. לחץ **Push origin**

עכשיו הקוד בענן, ב־GitHub.

---

## שלב 2 — פתח חשבון ב־Railway (האתר + MySQL)

אנחנו צריכים **MySQL** (לא PostgreSQL) כי הפרויקט מוגדר כך, ואת האתר עצמו גם נשים ב־Railway.

1. גש ל: [https://railway.app](https://railway.app)
2. **Login** עם GitHub (זה הכי נוח).
3. לחץ **New Project**.
4. בחר משהו בסגנון **Provision MySQL** / **Database** / **MySQL** (המילה MySQL חייבת להופיע).
5. אחרי שנוצר השירות, נכנסים ל־**MySQL** → לשונית **Variables** או **Connect** (שמות משתנים משתנים מעט בין גרסאות).

מה אתה מחפש?

- מחרוזת חיבור שמתחילה ב־`mysql://`  
  או משתנה שנקרא דומה ל־`DATABASE_URL` / `MYSQL_URL` / `MYSQL_PUBLIC_URL`.

6. **העתק** את מחרוזת ה־`mysql://...` לקובץ טקסט אצלך (זה סודי!).

אם אין מחרוזת אחת מוכנה: לפעמים יש שדות נפרדים (host, user, password, port, database). אם תיתקע כאן — צלם מסך (בלי סיסמה גלויה) ושלח למפתח, או כתוב לי מה מופיע בשמות המשתנים.

### הרשאת חיבור מהאינטרנט

ב־Railway ברירת המחדל בדרך כלל מאפשרת גישה חיצונית ל־MySQL. אם יש אופציה של **Public networking** / **TCP Proxy** — אפשר להפעיל אם תרצה להתחבר גם מכלי חיצוני.

---

## שלב 3 — העלה את האתר ל־Railway

1. בתוך Railway לחץ **New** → **GitHub Repo**
2. בחר את הריפו `HERBAL`
3. Railway יזהה שזה פרויקט Node/Next.js
4. היכנס לשירות האתר → **Variables**

הוסף משתנים (שמות **בדיוק** ככה):

| Name | Value (מה להדביק) |
| --- | --- |
| `DATABASE_URL` | בחר Reference Variable מהשירות של MySQL |
| `AUTH_SECRET` | מחרוזת ארוכה ואקראית (ראה למטה איך לייצר) |
| `NEXTAUTH_URL` | הכתובת הציבורית של האתר ב־Railway |
| `AUTH_URL` | אותו דבר כמו `NEXTAUTH_URL` |
| `SUPER_ADMIN_EMAIL` | המייל שלך — יוענק תפקיד אדמין. בלי זה אף אחד לא מקודם אוטומטית בפריסה. |

#### איך לייצר `AUTH_SECRET` (בלי קסמים)

ב־Windows PowerShell:

```powershell
[Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

העתק את הפלט — זה `AUTH_SECRET`.

5. היכנס ל־**Settings → Networking** ולחץ **Generate Domain**
6. חזור ל־**Variables** והדבק את הכתובת שקיבלת ב־`NEXTAUTH_URL` וגם ב־`AUTH_URL`
7. לחץ **Deploy** והמתן כמה דקות
8. חשוב: היכנס ל־**Volumes** וחבר Volume אל הנתיב:

```text
/app/public/uploads
```

### אחרי שהפריסה הצליחה

1. למעלה יופיע לינק ציבורי של Railway
2. פתח אותו ובדוק שהאתר עולה
3. אם שינית `NEXTAUTH_URL` / `AUTH_URL` אחרי יצירת הדומיין — עשה **Redeploy**

---

## שלב 4 — “זריעה” (משתמשי דמו) — אופציונלי

אחרי שהאתר עלה, אם אתה רוצה משתמש אדמין לדוגמה:

צריך מחשב אחד עם Node.js, ואז (פעם אחת):

```powershell
cd path\to\HERBAL
npm install
$env:DATABASE_URL="הדבק כאן את אותו mysql מרילוויי"
$env:ADMIN_EMAIL="you@yourdomain.com"
$env:ADMIN_PASSWORD="סיסמה-חזקה-שלך"
npx prisma db seed
```

זה ייצור משתמשים לדוגמה (אם כבר קיימים — יעדכן חלק מהם).

---

## מה יש לך בסוף?

- **GitHub**: גיבוי הקוד + היסטוריית שינויים  
- **Railway MySQL**: מסד SQL אמיתי  
- **Railway**: האתר + MySQL + נפח קבצים באותו פרויקט

---

## אם משהו נשבר (הכי נפוץ)

1. **Build נכשל ב־Railway**  
   פתח **Deployments / Logs** וחפש שורות אדומות.  
   בדרך כלל זה `DATABASE_URL` לא מחובר נכון או שחסר `AUTH_SECRET`.

2. **האתר עלה אבל התחברות לא עובדת**  
   כמעט תמיד `NEXTAUTH_URL` / `AUTH_URL` לא תואמים לכתובת האתר המדויקת. תקן ו־Redeploy.

3. **אין לך בכלל את תיקיית הקוד**  
   צריך מישהו שיעתיק לך את תיקיית `HERBAL` לפני שאפשר לעלות לגיטהאב.

---

## קישורים שימושיים (שמרי אותם)

- GitHub הרשמה: [https://github.com/signup](https://github.com/signup)
- יצירת ריפו חדש: [https://github.com/new](https://github.com/new)
- GitHub Desktop: [https://desktop.github.com/](https://desktop.github.com/)
- Railway: [https://railway.app](https://railway.app)
- **מסד נתונים — מתי מתעדכן אוטומטית / מה ידני / לינקים ל-Prisma:** [DATABASE.md](./DATABASE.md)
- `prisma db push` (תיעוד): [https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push)
- Seeding: [https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

---

## עוד משהו?

כן — אבל **לא חובה ביום 1**:

- דומיין משלך (למשל ב־Cloudflare / Namecheap) וחיבור ל־Railway (מדריך נפרד כשתהיה מוכן).
- סליקה (Stripe וכו’) — כשתרצו מכירות אמיתיות בקורסים וסדנאות.

מדריך טכני יותר באנגלית עדיין קיים בקובץ `DEPLOY.md`. **מסד נתונים (מתי מתעדכן / לינקים ל-Prisma):** `DATABASE.md`.
