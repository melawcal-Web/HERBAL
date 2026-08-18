import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
if (!existsSync(standalone)) process.exit(0);

const publicDir = join(root, "public");
const standalonePublic = join(standalone, "public");
mkdirSync(standalonePublic, { recursive: true });
if (existsSync(publicDir)) {
  cpSync(publicDir, standalonePublic, { recursive: true });
}

mkdirSync(join(standalone, ".next"), { recursive: true });
const staticDir = join(root, ".next", "static");
if (existsSync(staticDir)) {
  cpSync(staticDir, join(standalone, ".next", "static"), { recursive: true });
}
