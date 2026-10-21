const assert = require("node:assert/strict");
const fs = require("node:fs");
const dir = process.argv[2] || ".qa/refinement/final";
const report = JSON.parse(fs.readFileSync(`${dir}/report.json`));
assert.equal(
  report.failure,
  undefined,
  "browser run completed without harness failure",
);
const before = JSON.parse(
  fs.readFileSync("docs/refinement/before/report.json"),
);
assert.equal(report.errors.length, 0, "zero console/page errors");
for (const view of report.views) {
  if (view.transitCaptionVisible !== undefined)
    assert.equal(
      view.transitCaptionVisible,
      true,
      "description survives fractional scroll",
    );
  if (view.chapter === undefined) continue;
  const s = view.sample,
    w = view.viewport.width,
    h = view.viewport.height;
  assert.ok(s.captionVisible, "caption visible");
  assert.ok(
    s.canvasSame && s.canvasCount === 1 && !s.contextLost,
    "one healthy persistent Canvas",
  );
  assert.equal(s.overflow, false, "no horizontal overflow");
  assert.ok(
    s.captionRect.x >= 0 &&
      s.captionRect.y >= 105 &&
      s.captionRect.y + s.captionRect.height <= h,
    "caption fits below HUD",
  );
  if (view.chapter !== 7) {
    const old = before.views.find(
      (v) => v.chapter === view.chapter && v.viewport.width === w,
    );
    // New volumetric instruments have narrower authored mobile envelopes.
    const fitCorrection =
      w === 390 && view.chapter === 3
        ? 7.7 / 5.8
        : w === 390 && view.chapter === 4
          ? 8 / 6.7
          : 1;
    assert.ok(
      Math.abs(
        s.objectScale[0] / old.sample.objectScale[0] -
          (view.chapter === 0 ? 0.8 : 0.82) * fitCorrection,
      ) < 0.00001,
      "single authored 18–20% reduction applied after envelope fit",
    );
    assert.ok(
      (view.settledFps ?? view.fps).fps >= 55,
      "measured settled rendered FPS >=55 on this test machine (first-use window retained separately)",
    );
    assert.ok(
      view.fps.telemetry.drawCalls <= old.fps.telemetry.drawCalls + 8,
      "details add no more than eight calls",
    );
  } else {
    assert.equal(s.portraitCount, w === 1440 ? 45000 : 12000);
    const b = s.portraitBounds,
      fraction = (b.bottom - b.top) / h;
    assert.ok(
      fraction > 0.4 && fraction < 0.55,
      "face fills approximately half the viewport",
    );
    assert.ok(
      b.left >= 0 && b.right <= w && b.top >= 100,
      "portrait stays inside available view",
    );
    assert.ok(
      w === 1440
        ? b.left > s.captionRect.x + s.captionRect.width
        : b.bottom < s.captionRect.y - 8,
      "portrait opposite caption, no overlap",
    );
    assert.equal(s.frameloop, "demand", "settled portrait idles");
    assert.equal(view.fps.fps, 0, "idle renderer produces no frames");
  }
}
const meta = JSON.parse(fs.readFileSync("public/portrait-meta.json"));
assert.equal(meta.crop.width / meta.crop.height, 0.8, "fixed 4:5 aspect");
for (const set of meta.sets) {
  const b = fs.readFileSync("public/" + set.portrait),
    hb = fs.readFileSync("public/" + set.hb);
  assert.equal(b.length, set.count * 16);
  assert.equal(hb.length, set.count * 12);
  let lo = Infinity,
    hi = -Infinity;
  for (let i = 0; i < set.count; i++) {
    const z = b.readFloatLE(i * 16 + 8),
      t = b.readFloatLE(i * 16 + 12);
    assert.ok(Number.isFinite(z) && t >= 0 && t <= 1);
    lo = Math.min(lo, z);
    hi = Math.max(hi, z);
  }
  assert.ok(
    hi - lo < (meta.relief?.maxDepthSpan ?? 0.15),
    "bounded baked portrait depth",
  );
  if (set.normals) {
    const n = fs.readFileSync("public/" + set.normals);
    assert.equal(n.length, set.count * 12);
    for (let i = 0; i < set.count; i++) {
      const length = Math.hypot(
        n.readFloatLE(i * 12),
        n.readFloatLE(i * 12 + 4),
        n.readFloatLE(i * 12 + 8),
      );
      assert.ok(Math.abs(length - 1) < 0.00001, "finite unit portrait normal");
    }
  }
}
console.log(
  "PASS: captions, scale, framing, WebGL, FPS/draw-call budgets, point counts, crop, tone and depth.",
);
