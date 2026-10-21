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
const source = path.join(publicDir, "images/harsh-hero-906.avif");
// Fixed 4:5 head/bust crop in the original 906×805 owner photograph.
// The face is centred; no mirroring, stretching or generated retouch.
const crop = { left: 138, top: 60, width: 596, height: 745 };
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
  .extract(crop)
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
const minX = 0,
  maxX = width,
  minY = 0,
  maxY = height;
const spanX = width,
  spanY = height;
const tones = [];
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++)
    if (data[(y * width + x) * 4 + 3] > 200) tones.push(toneAt(x, y));
tones.sort((a, b) => a - b);
const black = tones[Math.floor(tones.length * 0.025)];
const white = tones[Math.floor(tones.length * 0.985)];
const mapTone = (l) =>
  Math.pow(Math.max(0, Math.min(1, (l - black) / (white - black))), 0.95);
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
      a > 0.12
        ? a *
          (0.18 + mapTone(l) * 0.65 + Math.min(1, edge * 6) * 0.7) *
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
  source: "images/harsh-hero-906.avif",
  mask: "images/portrait-mask.png",
  cutout: "images/portrait-cutout.png",
  model: "rembg u2net_human_seg + alpha matting, CPU, offline",
  sourceWidth: 906,
  sourceHeight: 805,
  crop,
  aspect: "4:5",
  orientation:
    "source left-to-right, image y inverted only for world up; not mirrored",
  toneRange: { black, white },
  worldHeight: 5.3,
  bounds: { minX, maxX, minY, maxY },
  format:
    "LE Float32, portrait stride4 (xyz,tone), HB stride3 (xyz), no headers",
  sets: [],
};
for (const [count, suffix] of [
  [45000, ""],
  [12000, "-mobile"],
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
      Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.5) * 2, 2))) * 0.085 +
      (mapTone(l) - 0.5) * 0.045;
    const alpha =
      data[
        (Math.min(height - 1, Math.max(0, Math.floor(y))) * width +
          Math.min(width - 1, Math.max(0, Math.floor(x)))) *
          4 +
          3
      ] / 255;
    face.push({
      key: morton(u, 1 - v),
      values: [
        ((u - 0.5) * 5.3 * spanX) / spanY,
        (0.5 - v) * 5.3,
        depth,
        mapTone(l) * Math.sqrt(alpha) * rim,
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
  if (process.argv.includes("--debug") && !suffix) {
    // CPU-only flat raster of the exact baked buffers and shader tone transfer.
    // x follows source x; world-up y becomes image-down y once here.
    const w = 596,
      h = 745,
      pixels = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) pixels.set([16, 17, 24], i * 3);
    for (let i = 0; i < count; i++) {
      const x = (faceData[i * 4] / (5.3 * 0.8) + 0.5) * w,
        y = (0.5 - faceData[i * 4 + 1] / 5.3) * h,
        t = faceData[i * 4 + 3];
      const radius = ((0.55 + 2.05 * Math.pow(t, 0.7)) * (h / 450)) / 2;
      for (let yy = Math.floor(y - radius); yy <= y + radius; yy++)
        for (let xx = Math.floor(x - radius); xx <= x + radius; xx++) {
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y) / radius;
          if (d > 1) continue;
          const a = (1 - Math.pow(d, 2)) * (0.015 + 0.96 * Math.pow(t, 1.15));
          const k = (yy * w + xx) * 3,
            light = 35 + 210 * Math.pow(t, 0.65);
          for (let c = 0; c < 3; c++)
            pixels[k + c] = Math.round(pixels[k + c] * (1 - a) + light * a);
        }
    }
    const panels = await Promise.all([
      sharp(source).extract(crop).png().toBuffer(),
      sharp(maskPath).extract(crop).removeAlpha().png().toBuffer(),
      sharp(pixels, { raw: { width: w, height: h, channels: 3 } })
        .png()
        .toBuffer(),
    ]);
    const labels = Buffer.from(
      `<svg width="${w * 3}" height="32"><style>text{fill:#f1f3f8;font:16px sans-serif}</style><text x="12" y="22">Original · fixed 4:5 crop</text><text x="${w + 12}" y="22">Alpha mask</text><text x="${w * 2 + 12}" y="22">45,000 baked points · flat, no WebGL</text></svg>`,
    );
    await sharp({
      create: {
        width: w * 3,
        height: h + 32,
        channels: 3,
        background: "#101118",
      },
    })
      .composite([
        { input: labels, left: 0, top: 0 },
        ...panels.map((input, i) => ({ input, left: i * w, top: 32 })),
      ])
      .png()
      .toFile(path.join(root, "portrait-debug.png"));
  }
}
geometry.dispose();
fs.writeFileSync(
  path.join(publicDir, "portrait-meta.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
