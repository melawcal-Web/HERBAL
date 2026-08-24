/**
 * Push current branch HEAD to origin so Railway can auto-deploy from GitHub.
 * Usage: npm run deploy
 */
import { execSync } from "node:child_process";

function run(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

try {
  const branch = run("git rev-parse --abbrev-ref HEAD");
  const short = run("git rev-parse --short HEAD");
  const status = run("git status -sb");

  console.log(status);

  const dirty = run("git status --porcelain");
  if (dirty) {
    console.log(
      "שים לב: יש שינויים מקומיים שלא ב-commit — הם לא יידחפו. רק קומיטים קיימים עולים ל-GitHub.",
    );
  }

  console.log(`דוחף ${branch} (${short}) ל-origin…`);
  execSync("git push origin HEAD", { stdio: "inherit" });

  const after = run("git rev-parse --short HEAD");
  console.log(`נדחף בהצלחה: ${after}. Railway אמור להתחיל פריסה אוטומטית מ-main.`);
} catch (err) {
  const msg = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n").trim();
  console.error(msg || "הדחיפה נכשלה.");
  process.exit(typeof err.status === "number" ? err.status : 1);
}
