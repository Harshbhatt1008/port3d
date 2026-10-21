const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const phase = process.argv[2] || "verified";
const out = path.resolve(`.qa/glass-run1/${phase}`);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(page) {
  await page.goto(process.env.FLIGHT_URL || "http://127.0.0.1:5174", {
    waitUntil: "networkidle",
  });
  const skip = page.getByRole("button", { name: "Skip intro", exact: true });
  if (await skip.isVisible()) await skip.click();
  await page.waitForFunction(
    () => document.querySelector("canvas")?.dataset.coords,
  );
  await page.evaluate(async () => {
    const { _roots } =
      await import("/node_modules/.vite/deps/@react-three_fiber.js");
    const canvas = document.querySelector("canvas");
    window.qaRoot = _roots.get(canvas).store;
    window.qaCanvas = canvas;
    window.qaRenders = 0;
    window.qaFrames = 0;
    window.qaRoot
      .getState()
      .internal.subscribe(
        { current: () => window.qaFrames++ },
        0,
        window.qaRoot,
      );
    const gl = window.qaRoot.getState().gl;
    const render = gl.render.bind(gl);
    gl.render = (...args) => {
      window.qaRenders++;
      return render(...args);
    };
  });
  await page.waitForTimeout(2500);
}
async function scroll(page, progress, immediate = true) {
  await page.evaluate(
    ({ progress, immediate }) => {
      window.__latentLenis.scrollTo(
        (progress / 7) * (document.documentElement.scrollHeight - innerHeight),
        { immediate, duration: 1.15 },
      );
    },
    { progress, immediate },
  );
}
async function sample(page) {
  return page.evaluate(() => {
    const r = window.qaRoot.getState();
    const canvas = r.gl.domElement;
    const progress =
      (scrollY / (document.documentElement.scrollHeight - innerHeight)) * 7;
    r.scene.updateMatrixWorld(true);
    const rooms = r.scene.children
      .filter((o) => o.name.startsWith("chapter-"))
      .map((o) => {
        const center = o.position.clone().project(r.camera);
        return {
          name: o.name,
          z: o.position.z,
          visible: o.visible,
          ndc: center.toArray(),
        };
      });
    const rect = r.gl.domElement.getBoundingClientRect();
    return {
      progress,
      chapter: Number(canvas.dataset.chapter),
      renderedProgress: Number(r.gl.domElement.dataset.railProgress),
      renderChapter: Math.round(Number(canvas.dataset.railProgress)),
      camera: r.camera.position.toArray(),
      rotation: r.camera.rotation.toArray(),
      fov: r.camera.fov,
      frameloop: r.frameloop,
      paused: !!document.querySelector('[aria-label="Resume motion"]'),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      reader: document.documentElement.dataset.reader === "true",
      contextLost: r.gl.getContext().isContextLost(),
      canvasCount: document.querySelectorAll("canvas").length,
      sameCanvas: window.qaCanvas === document.querySelector("canvas"),
      cssSize: [rect.width, rect.height],
      bufferSize: [r.gl.domElement.width, r.gl.domElement.height],
      scrollY,
      rooms,
      perf: window.__latentPerf,
      renders: window.qaRenders,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}
async function measure(page, ms = 2200) {
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const start = performance.now(),
          first = window.qaRenders,
          firstFrame = window.qaFrames;
        let frames = 0;
        function tick(now) {
          frames++;
          if (now - start < ms) requestAnimationFrame(tick);
          else
            resolve({
              wallSeconds: (now - start) / 1000,
              browserRafFPS: (frames * 1000) / (now - start),
              r3fFPS: ((window.qaFrames - firstFrame) * 1000) / (now - start),
              renderCallsPerSecond:
                ((window.qaRenders - first) * 1000) / (now - start),
              r3f: window.__latentPerf,
            });
        }
        requestAnimationFrame(tick);
      }),
    ms,
  );
}
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const report = {
    phase,
    at: new Date().toISOString(),
    viewports: [],
    errors: [],
    warnings: [],
    transitions: [],
    modes: {},
  };
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
      page.on("pageerror", (e) => report.errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") report.errors.push(m.text());
        if (m.type() === "warning") report.warnings.push(m.text());
      });
      await boot(page);
      const row = { viewport, positions: [] };
      for (const p of [0.75, 1, 1.25]) {
        await scroll(page, p);
        await page.waitForTimeout(2600);
        const filename = `${viewport.width}-${String(p).replace(".", "-")}.png`;
        await page.screenshot({ path: path.join(out, filename) });
        row.positions.push({
          filename,
          sample: await sample(page),
          fps: await measure(page),
        });
      }
      for (const { sample: s } of row.positions) {
        assert.equal(s.contextLost, false, "WebGL context stays alive");
        assert.equal(s.canvasCount, 1, "one persistent Canvas");
        assert.equal(s.sameCanvas, true, "Canvas survives scroll");
        assert.equal(
          s.frameloop,
          "always",
          "normal motion renders continuously",
        );
        assert.ok(
          Math.abs(s.cssSize[0] - viewport.width) <= 16 &&
            s.cssSize[1] === viewport.height,
          "Canvas fills viewport minus reserved scrollbar",
        );
        assert.equal(s.overflow, false, "no horizontal overflow");
        assert.ok(
          s.rooms.some((r) => r.name === "chapter-1" && r.visible),
          "PRISM remains visible throughout approach and pass",
        );
      }
      assert.ok(
        row.positions[0].sample.camera[2] - row.positions[2].sample.camera[2] >
          9,
        "scroll moves camera through depth",
      );
      report.viewports.push(row);
      if (viewport.width === 1440) {
        await scroll(page, 0);
        await page.waitForTimeout(1600);
        await scroll(page, 5);
        for (let i = 0; i < 9; i++) {
          report.transitions.push(await sample(page));
          await sleep(45);
        }
        await page.waitForTimeout(2400);
        await page
          .getByRole("button", { name: "Pause motion", exact: true })
          .click();
        await page.waitForTimeout(1200);
        report.modes.paused = {
          sample: await sample(page),
          fps: await measure(page, 1200),
        };
        await scroll(page, 4);
        await page.waitForTimeout(2400);
        report.modes.pausedNavigation = await sample(page);
        assert.ok(
          Math.abs(
            report.modes.pausedNavigation.progress -
              report.modes.pausedNavigation.renderedProgress,
          ) < 0.00002,
          "paused navigation has no residual camera flight",
        );
        await page
          .getByRole("button", { name: "Resume motion", exact: true })
          .click();
        await page.emulateMedia({ reducedMotion: "reduce" });
        await scroll(page, 2);
        await page.waitForTimeout(1500);
        report.modes.reduced = {
          sample: await sample(page),
          fps: await measure(page, 1200),
        };
        assert.equal(report.modes.paused.sample.frameloop, "demand");
        assert.equal(report.modes.reduced.sample.frameloop, "demand");
        assert.equal(
          report.modes.paused.fps.r3fFPS,
          0,
          "pause idles the real renderer",
        );
        assert.equal(
          report.modes.reduced.fps.r3fFPS,
          0,
          "reduced motion idles the real renderer",
        );
        await page
          .getByRole("button", { name: "Read instead", exact: true })
          .click();
        report.modes.reader = await page.evaluate(() => ({
          canvasCount: document.querySelectorAll("canvas").length,
          headings: Array.from(document.querySelectorAll("h2")).map(
            (h) => h.textContent,
          ),
          reader: document.documentElement.dataset.reader,
        }));
        assert.equal(
          report.modes.reader.canvasCount,
          0,
          "reader removes WebGL",
        );
        await page
          .getByRole("button", { name: "Enter 3D", exact: true })
          .click();
        await page.waitForTimeout(1800);
        report.modes.returnFromReader = await page.evaluate(() => ({
          canvasCount: document.querySelectorAll("canvas").length,
          coords: document.querySelector("canvas")?.dataset.coords,
          reader: document.documentElement.dataset.reader,
        }));
        assert.equal(
          report.modes.returnFromReader.canvasCount,
          1,
          "reader returns to one Canvas",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
        // Rebind the new renderer after the intentional reader unmount.
        await boot(page);
        await scroll(page, 7);
        await page.waitForFunction(
          () =>
            document.querySelector("canvas")?.dataset.portraitPhase ===
            "resolved",
          null,
          { timeout: 30000 },
        );
        await page.waitForTimeout(1200);
        report.modes.contactIdle = {
          sample: await sample(page),
          fps: await measure(page, 1200),
        };
        assert.equal(
          report.modes.contactIdle.sample.frameloop,
          "demand",
          "settled Contact idles",
        );
        assert.equal(report.modes.contactIdle.fps.r3fFPS, 0);
        await page
          .getByRole("button", { name: "Re-train", exact: true })
          .click();
        await page.waitForTimeout(350);
        report.modes.contactRetrain = {
          sample: await sample(page),
          fps: await measure(page, 1200),
        };
        assert.ok(
          report.modes.contactRetrain.fps.r3fFPS > 0,
          "Contact interaction wakes rendering",
        );
        await scroll(page, 1);
        await page.waitForTimeout(2500);
        report.modes.leaveContact = await sample(page);
        assert.equal(
          report.modes.leaveContact.frameloop,
          "always",
          "leaving Contact wakes continuous rendering",
        );
        // Test the visibility handler explicitly; this is simulated visibility,
        // not a claim about physical background-tab behavior.
        await page.evaluate(() => {
          Object.defineProperty(document, "hidden", {
            configurable: true,
            get: () => true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await page.waitForTimeout(250);
        report.modes.hidden = {
          sample: await sample(page),
          fps: await measure(page, 1200),
        };
        assert.equal(report.modes.hidden.sample.frameloop, "never");
        assert.equal(report.modes.hidden.fps.r3fFPS, 0);
        await page.evaluate(() => {
          delete document.hidden;
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await page.waitForTimeout(600);
        report.modes.visibleAgain = await sample(page);
        assert.equal(report.modes.visibleAgain.frameloop, "always");
        // Native wheel input must also drive the rail, independently of jumpTo.
        const wheelBefore = await sample(page);
        await page.mouse.wheel(0, 450);
        await page.waitForTimeout(2200);
        const wheelAfter = await sample(page);
        report.modes.wheel = {
          before: wheelBefore.camera,
          after: wheelAfter.camera,
        };
        assert.ok(
          wheelAfter.camera[2] < wheelBefore.camera[2] - 1,
          "real wheel input moves camera z",
        );
      }
      await page.close();
    }
    assert.equal(report.errors.length, 0, "no runtime or console errors");
    assert.ok(
      report.transitions.some(
        (s) =>
          s.renderChapter < s.chapter &&
          s.rooms.some(
            (r) => r.visible && Number(r.name.slice(8)) < s.chapter - 1,
          ),
      ),
      "intermediate rooms survive a distant jump",
    );
    assert.ok(
      report.transitions.every((s) => Math.abs(s.rotation[1]) < 0.00001),
      "camera aim follows the rendered rail without yaw snaps",
    );
    report.passed = true;
    fs.writeFileSync(
      path.join(out, "report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
