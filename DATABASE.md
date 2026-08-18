# מסד הנתונים (MySQL) — מתי הוא מתעדכם ומה עושים ידנית

## בקצרה: האם צריך לעדכן משהו ב-Railway / MySQL?

| מה | אוטומטי ב-Railway? | מה לעשות |
| --- | --- | --- |
| **שינויים בסכימה** (טבלאות, עמודות, אינדקסים לפי `prisma/schema.prisma`) | כן — בכל **Deploy** רץ `prisma db push` בתוך `npm run build` (בלי `--accept-data-loss`) | רק לוודא ש־`DATABASE_URL` מוגדר בשירות של Railway. אם הבילד נכשל בגלל שינוי הרסני — לתקן את הסכמה במפורש, לא לדרוס נתונים בשקט. |
| **מילוי תוכן התחלה** (מוצרים, מאמרים, משתמשי seed) | לא — ה-seed **לא** רץ בבילד | להריץ **פעם** (או כשצריך) מהמחשב שלך — ראו למטה. |

כלומר: **מבנה הטבלאות** מתעדכן עם כל פריסה מוצלחת. **נתונים** (תוכן דמו) לא — אלא אם אתה מריץ seed בעצמך.

---

## איך זה עובד טכנית (קישורים רשמיים)

1. **`db push`** — מסנכרן את הסכמה למסד בלי להחיל קבצי מיגרציה (מתאים לפריסת Railway הנוכחית).  
   [תיעוד `prisma db push`](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push)

2. **בלי `--accept-data-loss` בבילד** — שינוי שעלול למחוק נתונים **יכשיל** את הפריסה במקום למחוק בשקט. לפיתוח מקומי בלבד, אם מבינים את הסיכון: `npm run db:push:force`.

3. **מיגרציות (`migrate`)** — קבצים קיימים תחת `prisma/migrations/` לפיתוח מקומי. המסד בפרודקשן סונכרן עד היום עם `db push`, לכן הפריסה **לא** רצה עם `migrate deploy` כרגע (זה עלול להיכשל על טבלאות שכבר קיימות).  
   [Prototyping vs migrate](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema)  
   [Deploy migrations (`migrate deploy`)](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)

4. **Seed** — טעינת נתונים ראשוניים:  
   [תיעוד Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

5. **חיבור MySQL** (`DATABASE_URL`):  
   [Datasource — MySQL](https://www.prisma.io/docs/orm/overview/databases/mysql)

`prisma.config.ts` טוען את קובץ `.env` — אפשר להריץ `npx prisma db push` בלי להעתיק ידנית את `DATABASE_URL` לטרמינל.

ב־Railway, ה־`DATABASE_URL` של שירות ה־MySQL צריך להיות מחובר כ־Reference Variable לשירות האתר.

---

## להריץ seed מהמחשב (תוכן התחלה / עדכון דמו)

בתיקיית הפרויקט, אחרי `npm install` ו־`docker compose up -d`:

```powershell
cd C:\Users\cohen\OneDrive\Documents\GitHub\HERBAL
npm run db:seed
```

או: `npx prisma db seed` (מוגדר ב־`prisma.config.ts`).

בסוף ההרצה יודפסו בטרמינל מיילים וסיסמאות ברירת מחדל — **החלף אותן בפרודקשן**.

---

## מקומי (פיתוח)

```powershell
docker compose up -d
npx prisma db push
npm run db:seed
npm run dev
```

אם Prisma מבקש אישור לאובדן נתונים, אפשר: `npm run db:push:force` (רק אם אתה מבין מה השתנה).

---

מדריך צעד-אחר-צעד בעברית: `SETUP-SIMPLE-HE.md` · Checklist באנגלית: `DEPLOY.md`.
