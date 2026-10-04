import { readFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const appDir = join(root, "src", "app");

const markSvg = readFileSync(join(publicDir, "icon.svg"));
const maskSvg = readFileSync(join(publicDir, "icon-maskable.svg"));

async function png(svg, size, out) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log("wrote", out);
}

// Browser favicon + Apple touch icon (served by Next file conventions).
await png(markSvg, 64, join(appDir, "icon.png"));
await png(markSvg, 180, join(appDir, "apple-icon.png"));

// PWA icons referenced by the manifest.
await png(markSvg, 192, join(publicDir, "icon-192.png"));
await png(markSvg, 512, join(publicDir, "icon-512.png"));
await png(maskSvg, 512, join(publicDir, "icon-maskable-512.png"));

// Remove the stock create-next-app favicon so it does not shadow the brand.
const stockFavicon = join(appDir, "favicon.ico");
if (existsSync(stockFavicon)) {
  rmSync(stockFavicon);
  console.log("removed stock favicon.ico");
}

console.log("icons generated");
