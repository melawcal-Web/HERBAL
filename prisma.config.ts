import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

/** Prisma 6+ no longer auto-loads `.env` when `prisma.config.ts` exists. */
function loadDotEnv(filename: string) {
  try {
    const raw = readFileSync(resolve(process.cwd(), filename), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // file is optional
  }
}

loadDotEnv(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});
