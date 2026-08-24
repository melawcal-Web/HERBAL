"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { auth } from "@/auth";
import { writeAudit } from "@/lib/audit";
import { assertAdmin } from "@/lib/formula";

const execFileAsync = promisify(execFile);

export type DeployToLiveResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function isRailwayHost(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID,
  );
}

/**
 * Admin-only: push local git HEAD to origin (triggers Railway from GitHub).
 * Intended for local `npm run dev` / local Next — not for the Railway runtime.
 */
export async function pushToLive(): Promise<DeployToLiveResult> {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    return { ok: false, message: "אין הרשאה. פעולה זו למנהלים בלבד." };
  }

  if (isRailwayHost()) {
    return {
      ok: false,
      message:
        "העלאה לאוויר זמינה רק מהמחשב המקומי (npm run dev), לא משרת Railway. הריצו את האתר מקומית ולחצו שוב.",
    };
  }

  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

  try {
    const { stdout, stderr } = await execFileAsync(npmBin, ["run", "deploy"], {
      cwd: process.cwd(),
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
      env: process.env,
      windowsHide: true,
    });

    const out = `${stdout ?? ""}\n${stderr ?? ""}`.trim();
    await writeAudit({
      actorId: session.user.id,
      action: "deploy.push",
      entityType: "Deploy",
      entityId: "origin",
      metadata: { snippet: out.slice(0, 800) },
    });

    return {
      ok: true,
      message:
        out ||
        "נדחף ל-GitHub בהצלחה. Railway אמור להתחיל פריסה אוטומטית מ-main.",
    };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const detail = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n").trim();
    return {
      ok: false,
      message:
        detail ||
        "הדחיפה נכשלה. בדקו ש-git מחובר ל-GitHub, שיש קומיטים לדחוף, ושאתם רצים מקומית.",
    };
  }
}
