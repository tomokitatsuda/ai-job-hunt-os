import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const standaloneDirectory = join(projectRoot, ".next", "standalone");

if (!existsSync(standaloneDirectory)) {
  throw new Error(
    "Standalone output was not found. Set output: 'standalone' and run next build first.",
  );
}

const publicDirectory = join(projectRoot, "public");

if (existsSync(publicDirectory)) {
  cpSync(publicDirectory, join(standaloneDirectory, "public"), {
    recursive: true,
    force: true,
  });
}

const standaloneNextDirectory = join(standaloneDirectory, ".next");
mkdirSync(standaloneNextDirectory, { recursive: true });
cpSync(
  join(projectRoot, ".next", "static"),
  join(standaloneNextDirectory, "static"),
  {
    recursive: true,
    force: true,
  },
);
