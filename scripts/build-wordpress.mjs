import { execFileSync } from "node:child_process";
import { cp, mkdir, writeFile, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";
const env = {
  ...process.env,
  STOREFRONT_ASSET_BASE: "/wp-content/themes/saalankruta/",
};
for (const args of [
  ["node_modules/typescript/bin/tsc", "--noEmit"],
  ["node_modules/vite/bin/vite.js", "build"],
  [
    "node_modules/vite/bin/vite.js",
    "build",
    "--ssr",
    "scripts/render.tsx",
    "--outDir",
    ".prerender",
  ],
  ["scripts/prerender.mjs"],
])
  execFileSync(process.execPath, args, { env, stdio: "inherit" });
const release = resolve(".wordpress-release/saalankruta");
if (dirname(release) !== resolve(".wordpress-release")) throw new Error("Unexpected release path");
await rm(release, { recursive: true, force: true });
await mkdir(release, { recursive: true });
await cp("dist", ".wordpress-release/saalankruta", { recursive: true });
await cp("wordpress-theme", ".wordpress-release/saalankruta", {
  recursive: true,
});
await cp("server/wordpress-adapter.php", ".wordpress-release/saalankruta/api/wordpress-host.php");
// Direct theme-file URLs are duplicate content; customer URLs go through WordPress.
await writeFile(
  ".wordpress-release/saalankruta/.htaccess",
  `Options -Indexes\n<IfModule mod_headers.c>\nHeader always set X-Robots-Tag "noindex, nofollow"\nHeader always set X-Content-Type-Options "nosniff"\n</IfModule>\n`,
);
console.log(
  "WordPress storefront prepared at .wordpress-release/saalankruta; no Node runtime is used by hosting.",
);
