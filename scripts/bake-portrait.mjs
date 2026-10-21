/** Run with: node --experimental-strip-types scripts/bake-portrait.mjs
 *  All decoding, background removal, importance sampling and pairing happen here.
 *  Runtime files contain little-endian Float32 x/y/z/tone; HB contains x/y/z.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import sharp from "sharp";
import { Mesh, Vector3 } from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import {
  createMonogramGeometry,
  createMonogramRandom,
} from "../src/scenes/monogram.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const maskPath = path.join(publicDir, "images/portrait-mask.png");
const cutoutPath = path.join(publicDir, "images/portrait-cutout.png");
const source = path.join(publicDir, "images/harsh-hero-906.webp");
const python =
  process.env.BAKE_PYTHON ||
  (process.platform === "win32"
    ? path.join(root, ".qa/bake-venv/Scripts/python.exe")
    : "python3");
if (!fs.existsSync(maskPath) || process.argv.includes("--remask")) {
  const mask = spawnSync(
    python,
    [
      path.join(root, "scripts/remove-background.py"),
      source,
      maskPath,
      cutoutPath,
    ],
    { stdio: "inherit" },
  );
  if (mask.status !== 0)
    throw Error(
      "Offline matte failed. Install scripts/portrait-requirements.txt and set BAKE_PYTHON.",
    );
}
const { data, info } = await sharp(cutoutPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
let seed = 0x484226;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const toneAt = (x, y) => {
  const k =
    (Math.min(height - 1, Math.max(0, y)) * width +
      Math.min(width - 1, Math.max(0, x))) *
    4;
  return (data[k] * 0.2126 + data[k + 1] * 0.7152 + data[k + 2] * 0.0722) / 255;
};
let minX = width,
  maxX = 0,
  minY = height,
  maxY = 0;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++)
    if (data[(y * width + x) * 4 + 3] > 160) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
const spanX = maxX - minX,
  spanY = maxY - minY;
const cdf = new Float64Array(width * height);
let mass = 0;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const i = y * width + x,
      a = data[i * 4 + 3] / 255,
      l = toneAt(x, y);
    const edge = Math.hypot(
      toneAt(x + 1, y) - toneAt(x - 1, y),
      toneAt(x, y + 1) - toneAt(x, y - 1),
    );
    const bottom = Math.max(0, Math.min(1, (maxY - y) / (spanY * 0.12)));
    // Luminance plus edge importance retains glasses/eyes/beard without rectangle fill.
    mass +=
      a > 0.7
        ? a *
          a *
          (0.25 + Math.sqrt(l) * 0.5 + Math.min(1, edge * 8) * 1.8) *
          Math.sqrt(bottom)
        : 0;
    cdf[i] = mass;
  }
function morton(x, y) {
  x = Math.min(65535, Math.max(0, Math.floor(x * 65535)));
  y = Math.min(65535, Math.max(0, Math.floor(y * 65535)));
  function spread(v) {
    v = (v | (v << 8)) & 0x00ff00ff;
    v = (v | (v << 4)) & 0x0f0f0f0f;
    v = (v | (v << 2)) & 0x33333333;
    return (v | (v << 1)) & 0x55555555;
  }
  return (spread(x) | (spread(y) << 1)) >>> 0;
}
const geometry = createMonogramGeometry();
const sampler = new MeshSurfaceSampler(new Mesh(geometry))
  .setRandomGenerator(random)
  .build();
const p = new Vector3();
const manifest = {
  source: "images/harsh-hero-906.webp",
  mask: "images/portrait-mask.png",
  cutout: "images/portrait-cutout.png",
  model: "rembg u2net_human_seg, CPU, offline",
  sourceWidth: width,
  sourceHeight: height,
  bounds: { minX, maxX, minY, maxY },
  format:
    "LE Float32, portrait stride4 (xyz,tone), HB stride3 (xyz), no headers",
  sets: [],
};
for (const [count, suffix] of [
  [28000, ""],
  [11200, "-mobile"],
]) {
  // A fresh shared stream yields the exact prefix of the loader's HB positions.
  sampler.setRandomGenerator(createMonogramRandom());
  const face = [],
    hb = [];
  for (let i = 0; i < count; i++) {
    const target = random() * mass;
    let lo = 0,
      hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (cdf[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const x = (lo % width) + random() - 0.5,
      y = Math.floor(lo / width) + random() - 0.5;
    const u = (x - minX) / spanX,
      v = (y - minY) / spanY,
      l = toneAt(Math.floor(x), Math.floor(y));
    const rim = Math.min(
      1,
      Math.max(0, Math.min(u, 1 - u) / 0.055),
      Math.max(0, (1 - v) / 0.14),
    );
    const depth =
      Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.51) * 1.65, 2))) * 0.24 +
      (l - 0.45) * 0.65;
    face.push({
      key: morton(u, 1 - v),
      values: [
        ((u - 0.5) * 5.3 * spanX) / spanY,
        (0.5 - v) * 5.3,
        depth,
        Math.max(0.025, l) * rim,
      ],
    });
    sampler.sample(p);
    hb.push({
      key: morton((p.x + 2.6) / 5.2, (p.y + 1.5) / 3),
      values: [p.x, p.y, p.z],
    });
  }
  face.sort((a, b) => a.key - b.key);
  hb.sort((a, b) => a.key - b.key);
  const faceData = new Float32Array(face.flatMap((v) => v.values)),
    hbData = new Float32Array(hb.flatMap((v) => v.values));
  const f = `portrait-points${suffix}.bin`,
    h = `hb-points${suffix}.bin`;
  fs.writeFileSync(path.join(publicDir, f), Buffer.from(faceData.buffer));
  fs.writeFileSync(path.join(publicDir, h), Buffer.from(hbData.buffer));
  manifest.sets.push({
    count,
    portrait: f,
    hb: h,
    portraitBytes: faceData.byteLength,
    hbBytes: hbData.byteLength,
    sha256: crypto
      .createHash("sha256")
      .update(Buffer.from(faceData.buffer))
      .digest("hex"),
  });
  console.log(
    `Baked ${count.toLocaleString()} coherently paired portrait/HB points (${faceData.byteLength + hbData.byteLength} bytes).`,
  );
}
geometry.dispose();
fs.writeFileSync(
  path.join(publicDir, "portrait-meta.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
