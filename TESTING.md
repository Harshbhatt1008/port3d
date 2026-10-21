# Verification record

**Current portrait/model recovery:** see [docs/refinement/REPORT.md](docs/refinement/REPORT.md) for all eight chapters before/after at 1440×900 and 390×844, the 45K/12K portrait bake, measured FPS/draw calls and current checks. The sections below are retained as the earlier implementation's historical record, not fresh results for the recovery.

Tested locally on 21 October 2026. Browser automation drove the actual running application; screenshots were opened and inspected. This is a measured local verification record, not a claim of universal device performance.

## Build and runtime

`npm run build` passes TypeScript project checking and the Vite production build. The production output serves successfully at `http://localhost:4173`; development runs at `http://localhost:5173`. The main engine chunk is approximately **1.43 MB minified / 417 KB gzip**, with separate lazy chapter chunks. Vite's large-chunk advisory remains visible. No model, texture, font or API account is downloaded from a third-party runtime service.

## Browser and viewport coverage

| Environment | Evidence and result |
| --- | --- |
| Chrome, 1440x900 | Four timed loader frames and all seven settled chapters inspected; all functional checks below passed. |
| Chrome, 390x844, touch emulated | All seven chapters inspected at initial and native-notes-scroll positions; chapter menu and robot control operated; no horizontal overflow. |
| Chrome, 1280x720 | PRISM's dense notes/control layout inspected; no horizontal overflow. |
| Firefox, desktop | Reduced-motion entry, real WebGL room navigation, history choice, authentic portrait, reader navigation and return to Identity passed; zero runtime/console errors in this smoke check. |
| WebKit, desktop | Same smoke flow passed with WebP texture; zero runtime/console errors. This is Playwright's Windows WebKit build, not a physical iPhone or macOS Safari test. |
| Reduced motion | Short opening, direct camera poses and working controls verified. Intro disappearance was observed about 1.70 seconds after navigation, including application startup; the intro timer itself is 1.2 seconds. |
| Chrome, 4x CPU slowdown | Intro exits through its independent wall-clock cap. Measured navigation-to-exit was 9.15 seconds including startup/compilation; this does not mean an 8-second timer can interrupt a blocked JavaScript main thread. |
| WebGL deliberately unavailable | Automatic reader mode exposes all seven chapters and removes the renderer. Forced context failure naturally produces renderer diagnostics in that dedicated failure context. |

An early cross-browser harness mistakenly waited to click Skip after the reduced intro had already disappeared. The corrected final browser smoke waits for the reduced intro to finish; its results supersede that harness timeout. WebKit also exposed a genuine AVIF decoder incompatibility: the original owner image is retained, and the identical crop is now served as a 90.7 KB WebP for consistent texture decoding.

## Functional checks

The production regression completed **25 checks with no failures and zero runtime/console errors** in the normal Chrome session. The final three-browser smoke separately passed. Verified behavior:

- Immediate Skip intro and Escape; normal motion, reduced motion and the independent cap under CPU throttling.
- One and the same Canvas element survives all seven chapter jumps; camera coordinates settle at each room and only its relevant scene is shown.
- Sound starts off, explicitly toggles on/off; global motion pause/resume remains operable.
- All six PRISM examples expose the stored risk and confidence: LOW/95, MEDIUM/87, HIGH/78, LOW/95, MEDIUM/78, HIGH/98. No model request occurs.
- Desk days, Outside hours and Slow mornings update the loom and their corresponding illustrative matches.
- InstaGuard's range supports Home/End/arrow keys. A genuine pointer drag on the 3D decision plane changed the shared range from 0.50 to 0.68.
- Both Signal modes and all four repository-context selections operate.
- OmniVision reaches plant, desk and door through the actual occupancy map. Sequential routes measured 7, 4 and 6 grid steps from the rover's respective current positions. Weight-exchange mode enters/exits normally. The planner was also checked against all 147 legal source/destination pairs and a blocked destination.
- All seven journey choices, all three tool constellations and the full journey disclosure expose the supplied content.
- Clipboard readback equals `harshbhattd@gmail.com`.
- The composer requests a real `mailto:` navigation with the exact encoded multiline message and subject, including ampersand, plus sign and question mark. No message is sent by the page.
- Portrait disperse/resolve, CV/vCard download URLs and external contact links are available. Original owner assets match the source files byte for byte.
- Back to identity, Alt+3, reader chapter highlighting and return from reader to the first 3D pose work. A reader highlighting bug discovered during this pass was fixed and rechecked in all three browsers.
- The mobile chapter menu, native notes scroll and Plan & go work with touch emulation.

The Chrome and cross-browser success statements cover runtime/page errors. NVIDIA/ANGLE still emits physical-material shader compiler precision warnings. Firefox also warns about its diagnostic renderer-info extension and expected context release when leaving 3D for reader mode. These are recorded, not suppressed or described as a completely silent console.

## Real frame-rate observations

Measured through actual R3F frame deltas, sampled once per second after scene navigation. Hardware renderer: **ANGLE / NVIDIA RTX 3070 / Direct3D11** on the local high-refresh display. These are not simulated values or integrated-GPU results.

| Chapter | Three production samples, fps | DPR |
| --- | --- | --- |
| Identity | 165 / 165 / 165 | 1.5 |
| PRISM | 58 / 165 / 165 | 1.0 |
| CommerceAI | 165 / 165 / 165 | 1.0 |
| Signal / Noise | 165 / 165 / 165 | 1.0 |
| OmniVision | 165 / 165 / 165 | 1.0 |
| Journey | 165 / 165 / 165 | 1.0 |
| Contact | 165 / 165 / 165 | 1.0 |

The first PRISM sample includes first-use shader work despite the initial settling delay. Earlier mobile-emulated entry samples also dipped to 33 fps during warmup; later settled samples were 129–165 fps on the same desktop GPU. The implementation reduces particle counts to one quarter on mobile, caps mobile DPR at 1.5 and adaptively lowers resolution, but **60 fps on an integrated GPU and a physical phone remains unverified**. Rendering pauses in hidden documents; paused/reduced states use demand rendering.

## Design review and evidence

Impeccable milestone critique used two independent assessments: visual/heuristic critique and DOM/detector evidence. One detector run returned zero findings. Material fixes addressed mobile object/copy collisions, dark chrome, adjacent-room leakage, patterned portrait sampling, named navigation, targets, notes discoverability, independent intro timing and return navigation.

A fresh finish reviewer inspected all 25 final required captures. Its first disposition was **fix** for PRISM optical legibility, substantive prose size and the recorded seed reference. The same reviewer scored all three corrections **resolved**, with disposition **ship at the scope of those three fixes**. This is not represented as an unrestricted accessibility or performance certification. A separate fresh documenter recorded the final implementation tokens.

The supplemental interaction review found a real pressed/hover contrast failure on “Resolve the portrait.” Explicit bone text on the transparent text-toggle background corrected it; hovered, keyboard-focused and mobile captures were rechecked, and the same reviewer scored that single finding resolved. The final documenter reconciled the corrected state. Runtime dependency audit reported zero vulnerabilities at the time of verification.

Local raw reports, scripts and captures are kept under gitignored `.qa/` and `.impeccable/review/`. They include timed loader captures at approximately 0.53, 2.05, 4.06 and 6.05 seconds, every chapter at both required sizes, and interaction/fallback/browser states. Public raster origins are recorded in `public/ASSET_ORIGINS.json`; the provenance scan found no missing raster origins.

## Repeat before deployment

1. Run `npm ci`, `npm run build`, then `npm run preview`; check the console and every downloadable asset.
2. Replay/skip the intro, jump and scroll through all chapters at 1440x900 and 390x844, and scroll the notes columns to their ends.
3. Exercise every native control with Tab, Enter, Space and arrow keys. Verify focus remains visible and inactive chapters stay inert.
4. Enable reduced motion, pause/resume, deny clipboard permission, disable WebGL, and verify recovery through reader mode/email links.
5. Test a physical iOS Safari device and an integrated-GPU laptop, including orientation changes, low-power mode and first-use shader warmup. Measure those devices before claiming their frame rate.
6. Set deployment-specific absolute OG/canonical URLs when a public domain is chosen. The current artifact is local and source-controlled; the previous hosted portfolio is unchanged.

21st.dev Magic integration was not available without a key; the owner-authorized handmade interface shipped instead. No live ML inference or training backend is part of this portfolio.


## Catalogue revision

Current browser evidence lives in `docs/catalogue/REPORT.md`. `scripts/check-catalogue.cjs` checks all five hero links by keyboard, all eight visible Journey rows, comment animation/pause/selection, repository selection, reversible GPU finale buffers, reduced-motion static output and demand idle after return. It records 1x/4x CPU samples of the three rebuilt chapters and the finale at 1440x900 and 390x844. `scripts/check-refinement.cjs catalogue-final` captures all eight resting chapters, and `scripts/validate-refinement.cjs .qa/refinement/catalogue-final` verifies bounds, counts, actual rendered FPS and draw-call budgets. The mobile fit corrections for the new sieve/repository are explicit in validation.
