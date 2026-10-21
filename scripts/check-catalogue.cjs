const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const dir = ".qa/catalogue";
fs.mkdirSync(dir, { recursive: true });
const report = {
  at: new Date().toISOString(),
  errors: [],
  checks: [],
  samples: [],
};
const measure = (page, ms = 1400) =>
  page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const start = performance.now(),
          before = window.cFrames;
        function tick(t) {
          if (t - start < ms) requestAnimationFrame(tick);
          else
            resolve({
              fps: ((window.cFrames - before) * 1000) / (t - start),
              seconds: (t - start) / 1000,
              telemetry: window.__latentPerf,
            });
        }
        requestAnimationFrame(tick);
      }),
    ms,
  );
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let page;
  try {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      page = await browser.newPage({
        viewport,
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      page.on("pageerror", (e) => report.errors.push(e.stack));
      page.on("console", (m) => {
        if (m.type() === "error") report.errors.push(m.text());
      });
      await page.goto(process.env.REFINEMENT_URL || "http://127.0.0.1:5175", {
        waitUntil: "networkidle",
      });
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.coords &&
          document.documentElement.dataset.intro === "false",
      );
      await page.evaluate(async () => {
        const { _roots } =
          await import("/node_modules/.vite/deps/@react-three_fiber.js");
        window.cRoot = _roots.get(document.querySelector("canvas")).store;
        window.cCanvas = document.querySelector("canvas");
        window.cFrames = 0;
        window.cRoot
          .getState()
          .internal.subscribe(
            { current: () => window.cFrames++ },
            0,
            window.cRoot,
          );
      });
      const jump = async (n) => {
        await page.evaluate(
          (n) =>
            window.__latentLenis.scrollTo(
              (n / 7) * (document.documentElement.scrollHeight - innerHeight),
              { immediate: true },
            ),
          n,
        );
        await page.waitForFunction(
          (n) =>
            Math.abs(
              Number(document.querySelector("canvas")?.dataset.railProgress) -
                n,
            ) < 0.001,
          n,
        );
        await page.waitForTimeout(300);
      };
      for (let n = 1; n <= 5; n++) {
        await jump(0);
        const button = page.locator(".picker-items button").nth(n - 1);
        assert.ok(await button.isVisible());
        const b = await button.boundingBox();
        assert.ok(b.y >= 105 && b.y + b.height <= viewport.height);
        await button.focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(
          (n) =>
            document.querySelector("canvas")?.dataset.chapter === String(n),
          n,
        );
      }
      report.checks.push(
        `${viewport.width}: all five hero project buttons navigate by keyboard.`,
      );
      await jump(6);
      const entries = await page
        .locator(".journey-overview li")
        .evaluateAll((nodes) =>
          nodes.map((n) => {
            const b = n.getBoundingClientRect();
            return { top: b.top, bottom: b.bottom, text: n.textContent };
          }),
        );
      assert.equal(entries.length, 8);
      assert.ok(
        entries.every((b) => b.top >= 105 && b.bottom < viewport.height),
      );
      assert.ok(
        entries.some((b) => b.text.includes("IELTS")) &&
          entries.some((b) => b.text.includes("7.42")),
      );
      report.checks.push(
        `${viewport.width}: all eight Journey milestones and proof lines visible together.`,
      );
      const cdp = await page.context().newCDPSession(page);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      for (const chapter of [3, 4, 6]) {
        await jump(chapter);
        await page.waitForTimeout(1200);
        for (const rate of [1, 4]) {
          await cdp.send("Emulation.setCPUThrottlingRate", { rate });
          const sample = await measure(page);
          report.samples.push({
            width: viewport.width,
            chapter,
            rate,
            ...sample,
          });
          assert.ok(sample.fps >= 50, "active instrument FPS >=50 on test GPU");
        }
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      }
      await jump(3);
      const commentVersion = () =>
        page.evaluate(
          () =>
            window.cRoot.getState().scene.getObjectByName("guard-comments")
              .instanceMatrix.version,
        );
      const first = await commentVersion();
      await page.waitForTimeout(400);
      assert.ok((await commentVersion()) > first);
      await page
        .getByRole("button", { name: "Pause motion", exact: true })
        .click();
      await page.waitForTimeout(250);
      const paused = await commentVersion();
      await page.waitForTimeout(400);
      assert.equal(await commentVersion(), paused);
      await page
        .getByRole("button", { name: "Resume motion", exact: true })
        .click();
      const sieve = page.getByRole("combobox", {
        name: "Send a comment through the sieve",
      });
      await sieve.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.ok(
        (
          await page.locator(".chapter-3 .selection-result").textContent()
        ).includes("unwanted"),
      );
      report.checks.push(
        `${viewport.width}: comment flow animates, pauses and changes its illustrative route with keyboard selection.`,
      );
      await jump(4);
      const chunkVersion = () =>
        page.evaluate(
          () =>
            window.cRoot.getState().scene.getObjectByName("review-chunks")
              .instanceMatrix.version,
        );
      const before = await chunkVersion();
      const files = page.getByRole("combobox", {
        name: "Retrieve repository context",
      });
      await files.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(450);
      assert.ok((await chunkVersion()) > before);
      report.checks.push(
        `${viewport.width}: changing repository file lifts a new retrieved chunk selection.`,
      );
      await jump(7);
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitPhase ===
          "resolved",
      );
      const buffers = () =>
        page.evaluate(() => {
          const p = window.cRoot
            .getState()
            .scene.getObjectByName("portrait-points");
          return {
            position: p.geometry.attributes.position.data.version,
            hb: p.geometry.attributes.aHB.version,
            count: p.geometry.attributes.position.count,
          };
        });
      const attributes = await buffers();
      await page
        .getByRole("button", { name: "Unfold the signal", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          Number(document.querySelector("canvas")?.dataset.portraitFinale) >
          0.99,
      );
      for (const rate of [1, 4]) {
        await cdp.send("Emulation.setCPUThrottlingRate", { rate });
        report.samples.push({
          width: viewport.width,
          chapter: "finale",
          rate,
          ...(await measure(page)),
        });
      }
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      await page.mouse.move(viewport.width * 0.75, viewport.height * 0.3);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${dir}/${viewport.width}-finale.png` });
      assert.deepEqual(await buffers(), attributes);
      await page
        .getByRole("button", { name: "Return to the person", exact: true })
        .click();
      await page.mouse.move(0, 0);
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitFinale === "0.0000",
      );
      await page.waitForTimeout(500);
      assert.equal(
        await page.evaluate(() => window.cRoot.getState().frameloop),
        "demand",
      );
      assert.ok(
        await page.evaluate(
          () => window.cCanvas === document.querySelector("canvas"),
        ),
      );
      report.checks.push(
        `${viewport.width}: reversible GPU light sculpture keeps the portrait buffers/Canvas and returns to demand idle.`,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await jump(7);
      await page
        .getByRole("button", { name: "Unfold the signal", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitFinale === "1.0000",
      );
      await page.waitForTimeout(600);
      assert.equal(
        await page.evaluate(() => window.cRoot.getState().frameloop),
        "demand",
      );
      report.checks.push(
        `${viewport.width}: reduced-motion finale resolves directly as a still sculpture.`,
      );
      await page.close();
    }
    assert.deepEqual(report.errors, []);
  } catch (e) {
    report.failure = e.stack;
    if (page && !page.isClosed())
      await page.screenshot({ path: `${dir}/failure.png` });
    throw e;
  } finally {
    fs.writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
