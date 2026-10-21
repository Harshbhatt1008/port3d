const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let result;
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.stack));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(process.env.REFINEMENT_URL || "http://127.0.0.1:5175", {
      waitUntil: "networkidle",
    });
    const skip = page.getByRole("button", { name: "Skip intro", exact: true });
    if (await skip.isVisible()) await skip.click();
    await page.waitForFunction(
      () => document.querySelector("canvas")?.dataset.coords,
    );
    // The old finite incline budget hid haze after roughly four 2.5s checks.
    await page.waitForTimeout(13500);
    result = await page.evaluate(async () => {
      const { _roots } =
        await import("/node_modules/.vite/deps/@react-three_fiber.js");
      const r = _roots.get(document.querySelector("canvas")).store.getState();
      const background = r.scene.getObjectByName("laboratory-background");
      return {
        elapsed: background.children[0].material.uniforms.uTime.value,
        hazeVisible: background.children[0].visible,
        contourVisible: r.scene.getObjectByName("laboratory-contours").visible,
        dpr: r.gl.getPixelRatio(),
        nativeDpr: devicePixelRatio,
        telemetry: window.__latentPerf,
        contextLost: r.gl.getContext().isContextLost(),
      };
    });
    assert.ok(result.elapsed >= 12);
    assert.ok(result.hazeVisible && result.contourVisible);
    assert.ok(result.dpr <= result.nativeDpr);
    assert.equal(result.contextLost, false);
    assert.deepEqual(errors, []);
    result = { ...result, errors, passed: true };
  } catch (e) {
    result = { ...result, failure: e.stack };
    throw e;
  } finally {
    await browser.close();
    fs.mkdirSync(".qa/depth-world", { recursive: true });
    fs.writeFileSync(
      ".qa/depth-world/quality.json",
      JSON.stringify(result, null, 2),
    );
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
