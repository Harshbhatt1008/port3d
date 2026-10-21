const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const result = { errors: [], views: [] };
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      page.on("pageerror", (e) => result.errors.push(e.stack));
      page.on("console", (m) => {
        if (m.type() === "error") result.errors.push(m.text());
      });
      await page.goto(process.env.PRODUCTION_URL || "http://127.0.0.1:4175", {
        waitUntil: "networkidle",
      });
      await page.waitForFunction(
        () =>
          document.documentElement.dataset.intro === "false" &&
          document.querySelector("canvas")?.dataset.coords,
      );
      const contrast = await page.evaluate(() => {
        const ctx = document.createElement("canvas").getContext("2d"),
          css = getComputedStyle(document.documentElement);
        const luminance = (token) => {
          ctx.fillStyle = css.getPropertyValue(token).trim();
          ctx.fillRect(0, 0, 1, 1);
          const rgb = [...ctx.getImageData(0, 0, 1, 1).data]
            .slice(0, 3)
            .map((v) => v / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            );
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const ratios = {};
        for (const ink of ["--ink-950", "--ink-900"])
          for (const ice of ["--ice-50", "--ice-300"])
            ratios[`${ice}/${ink}`] =
              (luminance(ice) + 0.05) / (luminance(ink) + 0.05);
        return ratios;
      });
      assert.ok(Object.values(contrast).every((v) => v >= 7));
      await page.locator(".picker-items button").last().click();
      await page.waitForFunction(
        () => document.querySelector("canvas")?.dataset.chapter === "5",
      );
      await page
        .getByRole("button", { name: "Next chapter", exact: true })
        .click();
      await page.waitForFunction(
        () => document.querySelector("canvas")?.dataset.chapter === "6",
      );
      assert.equal(await page.locator(".journey-overview li").count(), 8);
      await page
        .getByRole("button", { name: "Next chapter", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitPhase ===
          "resolved",
      );
      assert.equal(
        Number(
          await page.locator("canvas").getAttribute("data-portrait-points"),
        ),
        viewport.width === 390 ? 12000 : 45000,
      );
      await page
        .getByRole("button", { name: "Unfold the signal", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitFinale === "1.0000",
      );
      await page
        .getByRole("button", { name: "Return to the person", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector("canvas")?.dataset.portraitFinale === "0.0000",
      );
      await page
        .getByRole("button", { name: "Read instead", exact: true })
        .click();
      assert.equal(await page.locator("canvas").count(), 0);
      assert.equal(await page.locator(".inline-research").count(), 8);
      result.views.push({
        viewport,
        contrast,
        projectPicker: true,
        journey: true,
        portrait: true,
        finale: true,
        reader: true,
      });
      await page.close();
    }
    assert.deepEqual(result.errors, []);
    result.passed = true;
  } catch (e) {
    result.failure = e.stack;
    throw e;
  } finally {
    await browser.close();
    fs.mkdirSync(".qa/production", { recursive: true });
    fs.writeFileSync(
      ".qa/production/report.json",
      JSON.stringify(result, null, 2),
    );
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
