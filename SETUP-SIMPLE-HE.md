# מדריך הקמה — כמו לילד (GitHub + MySQL + Vercel)

מטרה: שיהיה לך **אתר חי באינטרנט** (כתובת כמו `https://משהו.vercel.app`) + **מסד נתונים SQL (MySQL)** + הקוד ב־**GitHub**.

תעבוד **לפי הסדר מהלמעלה למטה**. אל תדלג.

---

## לפני הכל (חשוב מאוד)

1. אתה צריך **את תיקיית הקוד** `herbal-platform` במחשב (או שמישהו מטפל בזה בשבילך).  
   בלי זה אי אפשר להעלות לגיטהאב.

2. ב־Vercel נבנה את האתר עם הפקודה (כבר מוכן בפרויקט):  
   `prisma generate && prisma db push && next build`  
   כלומר בכל בנייה המסד מתעדכן לפי הסכימה. זה בסיסי לתחילת דרך; אחר כך אפשר “להבשיל” עם מיגרציות.

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
5. **העתק** לתוכה את כל הקבצים מתוך `herbal-platform` (כך ש־`package.json` יהיה **בתוך** תיקיית הריפו, לא בתוך תיקייה כפולה בשם `herbal-platform` אם אפשר — הכי פשוט ל־Vercel).

חזור ל־GitHub Desktop:

1. תראה רשימת קבצים שהשתנו.
2. למטה כתוב **Summary**: כתוב למשל `Initial import`
3. לחץ **Commit to main**
4. לחץ **Push origin**

עכשיו הקוד בענן, ב־GitHub.

---

## שלב 2 — פתח חשבון ב־Railway (MySQL בענן)

אנחנו צריכים **MySQL** (לא PostgreSQL) כי הפרויקט מוגדר כך.

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

ב־Railway ברירת המחדל בדרך כלל מאפשרת גישה חיצונית ל־MySQL. אם יש אופציה של **Public networking** / **TCP Proxy** — הפעל, כדי ש־Vercel יוכל להתחבר.

---

## שלב 3 — פתח חשבון ב־Vercel (האתר רץ כאן)

1. גש ל: [https://vercel.com/signup](https://vercel.com/signup)
2. בחר **Continue with GitHub** והתחבר.
3. **Add New… → Project**
4. בחר את הריפו `herbal-therapists-center` (או השם שנתת).
5. לפני Deploy, לחץ **Configure Project** (או **Environment Variables**):

הוסף משתנים (שמות **בדיוק** ככה):

| Name | Value (מה להדביק) |
| --- | --- |
| `DATABASE_URL` | מה שהעתקת מ־Railway (`mysql://...`) |
| `AUTH_SECRET` | מחרוזת ארוכה ואקראית (ראה למטה איך לייצר) |
| `NEXTAUTH_URL` | בשלב ראשון: `https://PLACEHOLDER.vercel.app` (נתקן אחרי שיש כתובת אמיתית) |
| `AUTH_URL` | אותו דבר כמו `NEXTAUTH_URL` |

#### איך לייצר `AUTH_SECRET` (בלי קסמים)

ב־Windows PowerShell:

```powershell
[Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

העתק את הפלט — זה `AUTH_SECRET`.

6. אם הקוד שלך בגיטהאב יושב בתוך תיקייה פנימית `herbal-platform` (ולא בשורש הריפו):  
   ב־Vercel תחת **Root Directory** כתוב: `herbal-platform`

7. לחץ **Deploy** והמתן כמה דקות.

### אחרי שהפריסה הצליחה

1. למעלה יופיע לינק כמו `https://herbal-therapists-center-xxx.vercel.app`
2. חזור ל־**Project → Settings → Environment Variables**
3. עדכן:

- `NEXTAUTH_URL` = הלינק המדויק עם `https://`
- `AUTH_URL` = אותו דבר

4. עשה **Redeploy** (חשוב — אחרת התחברות עלולה להשתבש).

---

## שלב 4 — “זריעה” (משתמשי דמו) — אופציונלי

אחרי שהאתר עלה, אם אתה רוצה משתמש אדמין לדוגמה:

צריך מחשב אחד עם Node.js, ואז (פעם אחת):

```powershell
cd path\to\herbal-platform
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
- **Vercel**: האתר באוויר עם HTTPS

---

## אם משהו נשבר (הכי נפוץ)

1. **Build נכשל ב־Vercel**  
   פתח **Deployments → לחץ על הבילד האחרון → Logs** וחפש שורות אדומות.  
   בדרך כלל זה `DATABASE_URL` לא נכון או MySQL לא נגיש מהאינטרנט.

2. **האתר עלה אבל התחברות לא עובדת**  
   כמעט תמיד `NEXTAUTH_URL` / `AUTH_URL` לא תואמים לכתובת האתר המדויקת. תקן ו־Redeploy.

3. **אין לך בכלל את תיקיית הקוד**  
   צריך מישהו שיעתיק לך את `herbal-platform` לפני שאפשר לעלות לגיטהאב.

---

## קישורים שימושיים (שמרי אותם)

- GitHub הרשמה: [https://github.com/signup](https://github.com/signup)
- יצירת ריפו חדש: [https://github.com/new](https://github.com/new)
- GitHub Desktop: [https://desktop.github.com/](https://desktop.github.com/)
- Railway: [https://railway.app](https://railway.app)
- Vercel הרשמה: [https://vercel.com/signup](https://vercel.com/signup)

---

## עוד משהו?

כן — אבל **לא חובה ביום 1**:

- דומיין משלך (למשל ב־Cloudflare / Namecheap) וחיבור ל־Vercel (מדריך נפרד כשתהיה מוכן).
- סליקה (Stripe וכו’) — כשתרצו מכירות אמיתיות בקורסים וסדנאות.

מדריך טכני יותר באנגלית עדיין קיים בקובץ `DEPLOY.md`.
