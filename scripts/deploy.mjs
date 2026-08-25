/**
 * Push current branch HEAD to origin so Railway can auto-deploy from GitHub.
 * Usage: npm run deploy
 * Also invoked by admin «העלה לאוויר» via `node scripts/deploy.mjs`.
 */
import { execFileSync } from "node:child_process";

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  }).trim();
}

try {
  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const short = runGit(["rev-parse", "--short", "HEAD"]);
  const status = runGit(["status", "-sb"]);

  console.log(status);

  const dirty = runGit(["status", "--porcelain"]);
  if (dirty) {
    console.log(
      "שים לב: יש שינויים מקומיים שלא ב-commit — הם לא יידחפו. רק קומיטים קיימים עולים ל-GitHub.",
    );
  }

  console.log(`דוחף ${branch} (${short}) ל-origin…`);
  execFileSync("git", ["push", "origin", "HEAD"], {
    stdio: "inherit",
    windowsHide: true,
  });

  const after = runGit(["rev-parse", "--short", "HEAD"]);
  console.log(`נדחף בהצלחה: ${after}. Railway אמור להתחיל פריסה אוטומטית מ-main.`);
} catch (err) {
  const msg = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n").trim();
  console.error(msg || "הדחיפה נכשלה.");
  process.exit(typeof err.status === "number" ? err.status : 1);
}
