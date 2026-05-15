import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

try {
  const out = execSync("npx tsc --noEmit", { encoding: "utf8", stdio: "pipe" });
  writeFileSync("tsc-result.txt", out || "OK\n");
} catch (e) {
  writeFileSync("tsc-result.txt", `${e.stdout || ""}\n${e.stderr || ""}\nexit ${e.status}\n`);
  process.exit(1);
}
