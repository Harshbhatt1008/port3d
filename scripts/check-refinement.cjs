const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
const path = require("node:path");
const phase = process.argv[2] || "after";
const dir = path.resolve(`.qa/refinement/${phase}`);
fs.mkdirSync(dir, { recursive: true });
const chapters = process.env.CHAPTERS
  ? process.env.CHAPTERS.split(",").map(Number)
  : [0, 1, 2, 3, 4, 5, 6, 7];
const report = {
  phase,
  at: new Date().toISOString(),
  errors: [],
  warnings: [],
  views: [],
};
async function measure(page, ms = 1100) {
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const start = performance.now(),
          first = window.qaFrames;
        function tick(t) {
          if (t - start < ms) requestAnimationFrame(tick);
          else
            resolve({
              fps: ((window.qaFrames - first) * 1000) / (t - start),
              seconds: (t - start) / 1000,
              telemetry: window.__latentPerf,
            });
        }
        requestAnimationFrame(tick);
      }),
    ms,
  );
}
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({
        viewport,
        deviceScaleFactor: 1,
        reducedMotion: "no-preference",
      });
      page.on("pageerror", (e) => report.errors.push(e.stack));
      page.on("console", (m) => {
        if (m.type() === "error") report.errors.push(m.text());
        if (m.type() === "warning") report.warnings.push(m.text());
      });
      await page.goto(process.env.REFINEMENT_URL || "http://127.0.0.1:5175", {
        waitUntil: "networkidle",
      });
      const skip = page.getByRole("button", {
        name: "Skip intro",
        exact: true,
      });
      if (await skip.isVisible()) await skip.click();
      await page.waitForFunction(
        () => document.querySelector("canvas")?.dataset.coords,
      );
      await page.evaluate(async () => {
        const { _roots } =
          await import("/node_modules/.vite/deps/@react-three_fiber.js");
        window.qaRoot = _roots.get(document.querySelector("canvas")).store;
        window.qaCanvas = document.querySelector("canvas");
        window.qaFrames = 0;
        window.qaRoot
          .getState()
          .internal.subscribe(
            { current: () => window.qaFrames++ },
            0,
            window.qaRoot,
          );
      });
      for (const chapter of chapters) {
        await page.evaluate(
          (i) =>
            window.__latentLenis.scrollTo(
              (i / 7) * (document.documentElement.scrollHeight - innerHeight),
              { immediate: true },
            ),
          chapter,
        );
        await page.waitForFunction(
          (i) =>
            Math.abs(
              Number(document.querySelector("canvas")?.dataset.railProgress) -
                i,
            ) < 0.001,
          chapter,
        );
        await page.waitForTimeout(1600);
        if (chapter === 7) {
          await page.waitForFunction(
            () =>
              document.querySelector("canvas")?.dataset.portraitPhase ===
              "resolved",
            null,
            { timeout: 25000 },
          );
          await page.waitForTimeout(1300);
        }
        const name = `${viewport.width}-chapter-${chapter}.png`;
        await page.screenshot({ path: path.join(dir, name) });
        const sample = await page.evaluate((i) => {
          const r = window.qaRoot.getState(),
            c = document.querySelector(`.chapter-${i} .caption-card`),
            b = c.getBoundingClientRect(),
            style = getComputedStyle(c.parentElement);
          const room = r.scene.getObjectByName(`chapter-${i}`),
            object = room?.children[0];
          const portrait = r.scene.getObjectByName("portrait-points");
          const coords = [];
          if (portrait) {
            const pos = portrait.geometry.attributes.position;
            for (let n = 0; n < pos.count; n += 30) {
              const v = r.camera.position
                .clone()
                .set(pos.getX(n), pos.getY(n), pos.getZ(n));
              portrait.localToWorld(v);
              v.project(r.camera);
              coords.push([
                (v.x * 0.5 + 0.5) * r.size.width,
                (-v.y * 0.5 + 0.5) * r.size.height,
              ]);
            }
          }
          return {
            chapter: i,
            captionVisible:
              style.visibility === "visible" && Number(style.opacity) > 0.9,
            captionRect: { x: b.x, y: b.y, width: b.width, height: b.height },
            description: c.querySelector(".chapter-deck")?.textContent,
            canvasSame: window.qaCanvas === document.querySelector("canvas"),
            canvasCount: document.querySelectorAll("canvas").length,
            contextLost: r.gl.getContext().isContextLost(),
            frameloop: r.frameloop,
            objectScale: object?.scale.toArray(),
            objectPosition: object?.position.toArray(),
            camera: r.camera.position.toArray(),
            portraitCount: portrait?.geometry.attributes.position.count,
            portraitBounds: coords.length
              ? {
                  left: Math.min(...coords.map((v) => v[0])),
                  right: Math.max(...coords.map((v) => v[0])),
                  top: Math.min(...coords.map((v) => v[1])),
                  bottom: Math.max(...coords.map((v) => v[1])),
                }
              : null,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        }, chapter);
        const fps = await measure(page);
        report.views.push({ viewport, chapter, name, sample, fps });
        console.log(
          `${phase} ${viewport.width} chapter ${chapter}: ${fps.fps.toFixed(1)} FPS; caption ${sample.captionVisible}`,
        );
      }
      if (phase !== "before" && chapters.includes(7)) {
        const cdp = await page.context().newCDPSession(page);
        const rates = [];
        for (const rate of [1, 4]) {
          await cdp.send("Emulation.setCPUThrottlingRate", { rate });
          await page
            .getByRole("button", { name: "Re-train", exact: true })
            .click();
          await page.waitForTimeout(1000);
          rates.push({ rate, ...(await measure(page, 1800)) });
          await page.waitForFunction(
            () =>
              document.querySelector("canvas")?.dataset.portraitPhase ===
              "resolved",
          );
        }
        report.views.push({ viewport, portraitAnimation: rates });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
        // Fractional scroll must retain the active chapter's description.
        await page.evaluate(() =>
          window.__latentLenis.scrollTo(
            (0.9 / 7) * (document.documentElement.scrollHeight - innerHeight),
            { immediate: true },
          ),
        );
        await page.waitForTimeout(2200);
        report.views.push({
          viewport,
          transitCaptionVisible: await page
            .locator(".chapter-1")
            .evaluate((e) => getComputedStyle(e).visibility === "visible"),
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(
      path.join(dir, "report.json"),
      JSON.stringify(report, null, 2),
    );
  }
  if (report.errors.length) {
    console.error(report.errors);
    process.exitCode = 1;
  }
})().catch((e) => {
  console.error(e);
  fs.writeFileSync(
    path.join(dir, "report.json"),
    JSON.stringify({ ...report, failure: e.stack }, null, 2),
  );
  process.exitCode = 1;
});
