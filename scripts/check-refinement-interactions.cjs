const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const result = { errors: [], checks: [], routes: [] };
  let page;
  try {
    page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => result.errors.push(e.stack));
    page.on("console", (m) => {
      if (m.type() === "error") result.errors.push(m.text());
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
      window.rootStore = _roots.get(document.querySelector("canvas")).store;
    });
    const jump = async (n) => {
      await page.evaluate(
        (i) =>
          window.__latentLenis.scrollTo(
            (i / 7) * (document.documentElement.scrollHeight - innerHeight),
            { immediate: true },
          ),
        n,
      );
      await page.waitForFunction(
        (i) => document.querySelector("canvas")?.dataset.chapter === String(i),
        n,
      );
    };
    await jump(7);
    await page.waitForFunction(
      () =>
        window.rootStore.getState().scene.getObjectByName("portrait-points")
          ?.geometry.attributes.position.count === 12000,
    );
    assert.equal(
      await page.evaluate(
        () =>
          window.rootStore.getState().scene.getObjectByName("portrait-points")
            .material.uniforms.uMorph.value,
      ),
      1,
    );
    result.checks.push(
      "Reduced-motion mobile portrait resolves directly with 12,000 points.",
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(
      () =>
        window.rootStore.getState().scene.getObjectByName("portrait-points")
          ?.geometry.attributes.position.count === 45000,
    );
    result.checks.push(
      "Responsive resize installs the 45,000-point desktop geometry.",
    );
    await page.waitForFunction(() => Math.abs(Number(document.querySelector('canvas')?.dataset.railProgress)-7)<.001);
    result.checks.push('Resize preserves the Contact camera position.');
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: "Re-train", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector("canvas")?.dataset.portraitPhase === "morph",
    );
    const version = () =>
      page.evaluate(() => {
        const p = window.rootStore
          .getState()
          .scene.getObjectByName("portrait-points");
        return {
          position: p.geometry.attributes.position.data.version,
          hb: p.geometry.attributes.aHB.version,
          morph: p.material.uniforms.uMorph.value,
        };
      });
    const a = await version();
    await page.waitForTimeout(1100);
    const b = await version();
    assert.equal(a.position, b.position);
    assert.equal(a.hb, b.hb);
    assert.ok(b.morph > a.morph);
    result.checks.push(
      "Morph advances through shader uniforms without writing position/HB buffers.",
    );
    await page
      .getByRole("button", { name: "Read instead", exact: true })
      .click();
    assert.equal(await page.locator("canvas").count(), 0);
    assert.equal(await page.locator(".inline-research").count(), 8);
    assert.ok(
      await page
        .getByAltText("Harsh Bhatt smiling, wearing glasses")
        .isVisible(),
    );
    result.checks.push(
      "Reader removes Canvas and exposes all eight research notes plus the authentic portrait.",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Enter 3D", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector("canvas")?.dataset.coords,
    );
    await jump(5);
    for (const goal of ["plant", "desk", "door"]) {
      await page.getByLabel("Tell the robot where").fill("Go to the " + goal);
      await page
        .getByRole("button", { name: "Plan and go", exact: true })
        .click();
      await page.waitForFunction(
        (g) =>
          document
            .querySelector("#robot-status")
            ?.textContent.toLowerCase()
            .includes(g + " reached"),
        goal,
      );
      result.routes.push(await page.locator("#robot-status").innerText());
    }
    await page
      .getByRole("button", { name: "Two-tier learning", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Return to navigation", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page
      .getByRole("button", { name: "Return to navigation", exact: true })
      .click();
    result.checks.push(
      "BFS reaches all three destinations and federation/navigation toggles work.",
    );
    await page
      .getByRole("button", { name: "Research notes", exact: false })
      .filter({ visible: true })
      .first()
      .click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    result.checks.push("Research notes opens and closes with Escape.");
    assert.equal(result.errors.length, 0);
    result.passed = true;
  } catch (e) {
    result.failure = e.stack;
    result.debug = await page
      .evaluate(() => {
        const r = window.rootStore?.getState(),
          p = r?.scene.getObjectByName("portrait-points");
        return {
          canvas: document.querySelector("canvas")?.dataset,
          mode: r?.frameloop,
          morph: p?.material.uniforms.uMorph.value,
          time: p?.material.uniforms.uTime.value,
          description: document
            .querySelector(".chapter-7")
            ?.getAttribute("data-active"),
          url: location.href,
        };
      })
      .catch(() => null);
    throw e;
  } finally {
    await browser.close();
    fs.mkdirSync(".qa/refinement", { recursive: true });
    fs.writeFileSync(
      ".qa/refinement/interactions.json",
      JSON.stringify(result, null, 2),
    );
  }
  console.log(JSON.stringify(result, null, 2));
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
