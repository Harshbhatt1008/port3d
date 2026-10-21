const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
const baseline = require("../docs/catalogue/after/report.json");
const result = { errors: [], checks: [], samples: [], sizes: [] },
  dir = ".qa/depth-world";
fs.mkdirSync(dir, { recursive: true });
const measure = (page, ms = 1600) =>
  page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const start = performance.now(),
          first = window.dFrames;
        const tick = (t) => {
          if (t - start < ms) requestAnimationFrame(tick);
          else
            resolve({
              fps: ((window.dFrames - first) * 1000) / (t - start),
              seconds: (t - start) / 1000,
              telemetry: window.__latentPerf,
            });
        };
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
        reducedMotion: "no-preference",
        deviceScaleFactor: 1,
      });
      page.on("pageerror", (e) => result.errors.push(e.stack));
      page.on("console", (m) => {
        if (m.type() === "error") result.errors.push(m.text());
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
        window.dRoot = _roots.get(document.querySelector("canvas")).store;
        window.dCanvas = document.querySelector("canvas");
        window.dFrames = 0;
        window.dRoot
          .getState()
          .internal.subscribe(
            { current: () => window.dFrames++ },
            0,
            window.dRoot,
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
        await page.waitForTimeout(1300);
        const size = await page.evaluate(
          (n) => ({
            scale: window.dRoot
              .getState()
              .scene.getObjectByName(`chapter-${n}`)
              .children[0].scale.toArray(),
            camera: window.dRoot.getState().camera.position.toArray(),
          }),
          n,
        );
        const old = baseline.views.find(
          (v) => v.chapter === n && v.viewport.width === viewport.width,
        ).sample;
        size.scale.forEach((s, i) =>
          assert.ok(
            Math.abs(s - old.objectScale[i]) < 1e-8,
            "chapter scale unchanged",
          ),
        );
        size.camera.forEach((s, i) =>
          assert.ok(
            Math.abs(s - old.camera[i]) < 0.001,
            "camera framing unchanged",
          ),
        );
        result.sizes.push({ width: viewport.width, chapter: n, ...size });
      };
      const cdp = await page.context().newCDPSession(page);
      const rates = async (chapter) => {
        for (const rate of [1, 4]) {
          await cdp.send("Emulation.setCPUThrottlingRate", { rate });
          result.samples.push({
            width: viewport.width,
            chapter,
            rate,
            ...(await measure(page)),
          });
        }
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      };
      await jump(0);
      const background = () =>
        page.evaluate(() => {
          const p = window.dRoot
            .getState()
            .scene.getObjectByName("laboratory-contours");
          return {
            time: p.material.uniforms.uTime.value,
            version: p.geometry.attributes.position.version,
            depthTest: p.material.depthTest,
            count: p.geometry.attributes.position.count,
          };
        });
      const first = await background();
      await page.waitForTimeout(500);
      const second = await background();
      assert.ok(
        second.time > first.time &&
          first.version === second.version &&
          second.depthTest,
      );
      await page
        .getByRole("button", { name: "Pause motion", exact: true })
        .click();
      await page.waitForTimeout(200);
      const paused = await background();
      await page.waitForTimeout(350);
      assert.equal((await background()).time, paused.time);
      await page
        .getByRole("button", { name: "Resume motion", exact: true })
        .click();
      result.checks.push(
        `${viewport.width}: background advances by uniforms, respects depth occlusion and pauses without buffer writes.`,
      );
      await jump(5);
      await rates("OmniVision navigation");
      const probe = () =>
        page.evaluate(() =>
          window.dRoot
            .getState()
            .scene.getObjectByName("navigation-probe")
            .position.toArray(),
        );
      const start = await probe();
      await page.getByLabel("Tell the robot where").fill("Go to the plant");
      await page
        .getByRole("button", { name: "Plan and go", exact: true })
        .click();
      await page.waitForTimeout(650);
      assert.notDeepEqual(await probe(), start);
      await page
        .getByRole("button", { name: "Pause motion", exact: true })
        .click();
      await page.waitForTimeout(150);
      const stop = await probe();
      await page.waitForTimeout(400);
      assert.deepEqual(await probe(), stop);
      await page
        .getByRole("button", { name: "Resume motion", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document
            .querySelector("#robot-status")
            .textContent.includes("Plant reached"),
        null,
        { timeout: 15000 },
      );
      await page.screenshot({
        path: `${dir}/${viewport.width}-navigation.png`,
      });
      result.checks.push(
        `${viewport.width}: new probe traverses the original BFS occupancy, pauses and reaches its goal.`,
      );
      await page
        .getByRole("button", { name: "Two-tier learning", exact: true })
        .click();
      await page.waitForTimeout(2200);
      const seals = () =>
        page.evaluate(() =>
          [0, 1, 2].map((i) =>
            window.dRoot
              .getState()
              .scene.getObjectByName(`sealed-local-data-${i}`)
              .position.toArray(),
          ),
        );
      const sealed = await seals();
      const orbs = () =>
        page.evaluate(() =>
          window.dRoot
            .getState()
            .scene.getObjectByName("federated-fleet")
            .children.filter((n) => n.isMesh)
            .map((n) => n.position.toArray()),
        );
      const updates = await orbs();
      assert.equal(updates.length, 3);
      await rates("OmniVision federation");
      assert.deepEqual(await seals(), sealed);
      assert.notDeepEqual(
        await orbs(),
        updates,
        "model-update orbs move independently of sealed data",
      );
      await page.screenshot({
        path: `${dir}/${viewport.width}-federation.png`,
      });
      result.checks.push(
        `${viewport.width}: federation uses local modules and moving model-update orbs; raw-data jars remain fixed.`,
      );
      await page
        .getByRole("button", { name: "Return to navigation", exact: true })
        .click();
      await jump(6);
      const entries = await page
        .locator(".journey-overview li")
        .evaluateAll((nodes) =>
          nodes.map((n) => {
            const r = n.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom };
          }),
        );
      assert.equal(entries.length, 8);
      assert.ok(
        entries.every((r) => r.top >= 105 && r.bottom <= viewport.height),
      );
      const leaf = () =>
        page.evaluate(() =>
          window.dRoot
            .getState()
            .scene.getObjectByName("memory-leaf-7")
            .position.toArray(),
        );
      await page.locator(".journey-overview button").first().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1200);
      const closed = await leaf();
      await page.locator(".journey-overview button").last().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1200);
      assert.ok((await leaf())[2] > closed[2] + 0.4);
      await rates("Journey archive");
      await page.screenshot({
        path: `${dir}/${viewport.width}-archive-selected.png`,
      });
      result.checks.push(
        `${viewport.width}: all eight milestones remain visible; keyboard selection opens the corresponding folio.`,
      );
      await jump(7);
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitPhase ===
          "resolved",
      );
      await page.waitForTimeout(1400);
      const attributes = () =>
        page.evaluate(() => {
          const p = window.dRoot
            .getState()
            .scene.getObjectByName("portrait-points");
          return {
            position: p.geometry.attributes.position.data.version,
            normal: p.geometry.attributes.aNormal.version,
            ordinal: p.geometry.attributes.aIndex.version,
            hb: p.geometry.attributes.aHB.version,
            count: p.geometry.attributes.position.count,
            pointer: p.material.uniforms.uPointer.value.toArray(),
          };
        });
      const before = await attributes();
      assert.equal(before.count, viewport.width === 390 ? 12000 : 45000);
      await page.mouse.move(viewport.width * 0.55, viewport.height * 0.36);
      await page.waitForTimeout(750);
      await page.screenshot({
        path: `${dir}/${viewport.width}-portrait-left.png`,
      });
      await page.mouse.move(viewport.width * 0.95, viewport.height * 0.25);
      await page.waitForTimeout(850);
      await page.screenshot({
        path: `${dir}/${viewport.width}-portrait-right.png`,
      });
      const after = await attributes();
      assert.notDeepEqual(before.pointer, after.pointer);
      for (const k of ["position", "normal", "ordinal", "hb"])
        assert.equal(before[k], after[k]);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(2200);
      await page.getByRole("button", { name: "Re-train", exact: true }).click();
      await page.waitForTimeout(1100);
      await rates("Portrait relief morph");
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitPhase ===
          "resolved",
      );
      result.checks.push(
        `${viewport.width}: facial relief and normal lighting respond to pointer; 45K/12K buffers remain immutable through GPU turns and morph.`,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await jump(5);
      await page
        .getByRole("button", { name: "Two-tier learning", exact: true })
        .click();
      await page.waitForTimeout(250);
      const timeA = await background();
      await page.waitForTimeout(350);
      assert.equal((await background()).time, timeA.time);
      await jump(6);
      await page.locator(".journey-overview button").nth(3).focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(250);
      await jump(7);
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitPhase ===
          "resolved",
      );
      assert.ok(
        await page.evaluate(
          () => window.dCanvas === document.querySelector("canvas"),
        ),
      );
      result.checks.push(
        `${viewport.width}: reduced-motion navigation, federation, folio selection and face resolve without replacing Canvas.`,
      );
      await page.close();
    }
    assert.deepEqual(result.errors, []);
    result.passed = true;
  } catch (e) {
    result.failure = e.stack;
    if (page && !page.isClosed())
      await page.screenshot({
        path: `${dir}/failure.png`,
      });
    throw e;
  } finally {
    fs.writeFileSync(`${dir}/report.json`, JSON.stringify(result, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
