import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });

const svg = (size, maskable) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#059669"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
    font-family="Arial, sans-serif" font-weight="800"
    font-size="${size * (maskable ? 0.34 : 0.42)}" fill="#ffffff">24</text>
</svg>`;

const targets = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon.png", size: 180, maskable: false },
];

for (const t of targets) {
  const out = new URL(`../public/icons/${t.name}`, import.meta.url);
  await sharp(Buffer.from(svg(t.size, t.maskable))).png().toFile(out.pathname);
  console.log("wrote", t.name);
}
