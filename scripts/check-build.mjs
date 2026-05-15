import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const steps = [
  ["npx prisma generate", "prisma"],
  ["npx tsc --noEmit", "tsc"],
  ["npx next build", "next"],
];

let log = "";
for (const [cmd, name] of steps) {
  log += `\n=== ${name} ===\n`;
  try {
    log += execSync(cmd, { encoding: "utf8", stdio: "pipe", maxBuffer: 10 * 1024 * 1024 });
    log += `\n${name}: OK\n`;
  } catch (e) {
    const err = e;
    log += err.stdout ?? "";
    log += err.stderr ?? "";
    log += `\n${name}: FAILED (code ${err.status})\n`;
    writeFileSync("build-check-log.txt", log);
    process.exit(err.status ?? 1);
  }
}
writeFileSync("build-check-log.txt", log + "\nALL OK\n");
console.log("ALL OK");
