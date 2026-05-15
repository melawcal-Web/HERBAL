# מסד הנתונים (MySQL) — מתי הוא מתעדכם ומה עושים ידנית

## בקצרה: האם צריך לעדכן משהו ב-Railway / MySQL?

| מה | אוטומטי ב-Vercel? | מה לעשות |
| --- | --- | --- |
| **שינויים בסכימה** (טבלאות, עמודות, אינדקסים לפי `prisma/schema.prisma`) | כן — בכל **Deploy** רץ `prisma db push --accept-data-loss` בתוך `npm run build` | רק לוודא ש־`DATABASE_URL` מוגדר ב־Vercel (אותו `mysql://...` מ-Railway). |
| **מילוי תוכן התחלה** (מוצרים, מאמרים, משתמשי seed) | לא — ה-seed **לא** רץ בבילד של Vercel | להריץ **פעם** (או כשצריך) מהמחשב שלך — ראו למטה. |

כלומר: **מבנה הטבלאות** מתעדכן עם כל פריסה מוצלחת. **נתונים** (תוכן דמו) לא — אלא אם אתה מריץ seed בעצמך.

---

## איך זה עובד טכנית (קישורים רשמיים)

1. **`db push`** — מסנכרן את הסכמה למסד בלי קבצי מיגרציה ידניים (מתאים לפרויקטים כמו שלנו בבילד).  
   [תיעוד `prisma db push`](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push)

2. **דגל `--accept-data-loss`** — נדרש לפעמים ב-CI (כמו Vercel) כש-Prisma מזהיר לפני שינויים “מסוכנים”; אצלנו זה בשימוש ב-build כדי שהוספת אינדקסים/עמודות לא תעצור את הפריסה.  
   אותו עמוד תיעוד למעלה — סעיף על `--accept-data-loss`.

3. **מיגרציות (`migrate`)** — אם בעתיד תעברו לזרימה עם קבצי migration בלבד:  
   [Prototyping vs migrate](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema)  
   [Deploy migrations (`migrate deploy`)](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)

4. **Seed** — טעינת נתונים ראשוניים:  
   [תיעוד Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

5. **חיבור MySQL** (`DATABASE_URL`):  
   [Datasource — MySQL](https://www.prisma.io/docs/orm/overview/databases/mysql)

---

## להריץ seed מהמחשב (תוכן התחלה / עדכון דמו)

בתיקיית הפרויקט, אחרי `npm install`:

```powershell
cd C:\Users\cohen\OneDrive\Documents\GitHub\HERBAL
$env:DATABASE_URL="mysql://..."   # אותו ערך כמו ב-Vercel
npm run db:seed
```

או: `npx prisma db seed` (אם מוגדר ב־`prisma.config.ts`).

בסוף ההרצה יודפסו בטרמינל מיילים וסיסמאות ברירת מחדל — **החלף אותן בפרודקשן**.

---

## מקומי (פיתוח)

```powershell
npx prisma db push
npm run dev
```

אם Prisma מבקש אישור לאובדן נתונים, אפשר: `npx prisma db push --accept-data-loss` (רק אם אתה מבין מה השתנה).

---

מדריך צעד-אחר-צעד בעברית: `SETUP-SIMPLE-HE.md` · Checklist באנגלית: `DEPLOY.md`.
