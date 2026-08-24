import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `אתה כותב תוכן מקצועי בתחום צמחי מרפא ורפואה משלימה.
המשתמש הוא מטפל/ת בצמחי מרפא שרוצה לפרסם מאמר באתר מקצועי.

כתוב מאמר מקצועי, מעמיק ומעניין בעברית בהתבסס על הנושא שהמשתמש מתאר.

הפלט חייב להיות JSON תקין בלבד (בלי markdown, בלי backticks) בפורמט הבא:
{
  "title": "כותרת המאמר",
  "category": "קטגוריה מתאימה",
  "tabs": [
    {
      "label": "שם הטאב",
      "content": "תוכן הטאב — פסקאות מלאות, מפורטות ומקצועיות"
    }
  ]
}

הנחיות:
- חלק את המאמר ל-3-6 טאבים לפי נושאים (למשל: רקע, מנגנון פעולה, שימושים קליניים, מחקרים, מינון והכנה, אזהרות)
- כתוב תוכן מקצועי ומעמיק בכל טאב — לפחות 2-3 פסקאות בכל טאב
- השתמש בעברית תקנית ומקצועית
- אל תמציא מחקרים ספציפיים — כתוב באופן כללי על הידע המדעי
- החזר JSON בלבד, ללא תוספות`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY לא מוגדר" }, { status: 500 });
  }

  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "יש לכתוב תיאור לנושא המאמר" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nנושא המאמר:\n${prompt.trim()}` }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);

    if (!parsed.title || !Array.isArray(parsed.tabs)) {
      return NextResponse.json({ error: "תשובת AI לא תקינה" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Gemini error:", e);
    const msg = e instanceof Error ? e.message : "שגיאה בייצור המאמר";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
