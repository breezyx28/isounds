import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(import.meta.dir, "..");
const iconsDir = path.join(root, "public", "icons");

function svgToPng(svgPath: string, outPath: string, size: number) {
  const svg = readFileSync(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
  });
  const png = resvg.render().asPng();
  writeFileSync(outPath, png);
  console.log(`Wrote ${path.relative(root, outPath)}`);
}

svgToPng(
  path.join(iconsDir, "icon.svg"),
  path.join(iconsDir, "icon-192.png"),
  192,
);
svgToPng(
  path.join(iconsDir, "icon.svg"),
  path.join(iconsDir, "icon-512.png"),
  512,
);
svgToPng(
  path.join(iconsDir, "icon-maskable.svg"),
  path.join(iconsDir, "icon-maskable-512.png"),
  512,
);
