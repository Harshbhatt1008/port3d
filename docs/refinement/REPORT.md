# Portrait and model recovery

Verified locally on 21 October 2026 using the actual Vite application, installed Chrome and Playwright. The starting revision is `2ac2a77`; `8ff8dff` records the portrait/caption repair, followed by the model/detail recovery commit. No deployment is implied.

## What changed

Chapter captions no longer disappear at fractional scroll positions or while the camera eases. Desktop shows the existing full descriptions beside the instruments; mobile retains concise descriptions below them. The reader and Research notes still expose complete content. Resizing preserves the normalized camera position. Portrait animation now waits for actual camera settling rather than treating an indefinitely stationary position between chapters as perpetual flight.

`src/sceneSettings.ts` contains the single size multiplier for every chapter: 0.80 for the name, 0.82 for the other chapters. Contact combines that multiplier with its dedicated half-height framing. Slabs, rods and tall structures use a 0.65 gauge; CommerceAI's tower cross-sections are narrowed without shrinking their vertical arrangement. Active instrument boxes now use two-segment chamfers, and cylinders use lathed profiles with bevelled shoulders. Fine seams, ring bands, connectors, wires and exposed cores add detail without changing the research meaning. Seams/bands are merged by material; connectors are instanced and capped at 128 high / 36 mobile / 24 low. A neutral rear light catches the finer silhouettes without a shadow pass. The name and HB are 35% shallower; their real counters and separation remain. The offline HB pairing was regenerated after changing its geometry.

## Portrait bake

The original owner AVIF supplies a **596×745, fixed 4:5, face-centred crop**. Offline u2net human segmentation with alpha matting preserves soft hair, glasses and beard edges. Luminance and edge importance sampling yields **45,000 desktop / 12,000 mobile** points. Source luminance is normalized between its 2.5th and 98.5th foreground percentiles. Bright areas produce brighter, larger and more opaque points; shadows remain dark. Source x is preserved and image y is converted to world up once: no mirroring or tone inversion.

Measured baked depth spans only **0.1112 world units**. Pointer tilt is bounded to 0.035 radians. Runtime morphing still uses one Points object and shader uniforms. A browser regression observes changing morph uniforms while position/HB buffer versions stay unchanged. Crossing the mobile breakpoint installs the appropriate point set.

Run `node --experimental-strip-types scripts/bake-portrait.mjs --debug` (or `npm run bake:portrait -- --debug`). Add `--remask` to regenerate the alpha matte. **[portrait-debug.png](../../portrait-debug.png)** shows source | mask | exact baked points rendered flat on the CPU, with the runtime tone/point transfer. It was opened and compared with the source; the face is recognisable without WebGL. Source, crop, tone range and point hashes are in [portrait-meta.json](../../public/portrait-meta.json).

At 1440×900 the face sits to the right of the caption; at 390×844 it sits above it. Projected bounds occupy about 47% of viewport height, stay below the HUD, and do not intersect the caption. The phone caption is compact; the illustrative training explanation remains in Research notes.

## Before and after, every chapter

All 32 PNGs below were captured in the real browser at 1× device scale and inspected. Model controls use their default illustrative selections. The fixed Canvas reserves a 15px scrollbar gutter; there is no horizontal document overflow.

| Chapter | 1440×900 before | 1440×900 after | 390×844 before | 390×844 after |
| --- | --- | --- | --- | --- |
| Identity | [Before](before/1440-chapter-0.png) | [After](after/1440-chapter-0.png) | [Before](before/390-chapter-0.png) | [After](after/390-chapter-0.png) |
| PRISM | [Before](before/1440-chapter-1.png) | [After](after/1440-chapter-1.png) | [Before](before/390-chapter-1.png) | [After](after/390-chapter-1.png) |
| CommerceAI | [Before](before/1440-chapter-2.png) | [After](after/1440-chapter-2.png) | [Before](before/390-chapter-2.png) | [After](after/390-chapter-2.png) |
| InstaGuard | [Before](before/1440-chapter-3.png) | [After](after/1440-chapter-3.png) | [Before](before/390-chapter-3.png) | [After](after/390-chapter-3.png) |
| Code Reviewer | [Before](before/1440-chapter-4.png) | [After](after/1440-chapter-4.png) | [Before](before/390-chapter-4.png) | [After](after/390-chapter-4.png) |
| OmniVision | [Before](before/1440-chapter-5.png) | [After](after/1440-chapter-5.png) | [Before](before/390-chapter-5.png) | [After](after/390-chapter-5.png) |
| Journey | [Before](before/1440-chapter-6.png) | [After](after/1440-chapter-6.png) | [Before](before/390-chapter-6.png) | [After](after/390-chapter-6.png) |
| Contact | [Before](before/1440-chapter-7.png) | [After](after/1440-chapter-7.png) | [Before](before/390-chapter-7.png) | [After](after/390-chapter-7.png) |

## FPS and draw calls

Frames are counted through actual R3F callbacks over wall time, not cached telemetry or browser RAF alone. Each chapter sample lasts about 1.1 seconds after camera settling. Renderer: **ANGLE / NVIDIA RTX 3070 / Direct3D11**. The 390px profile runs on that same desktop GPU; it is not a physical-phone measurement.

| Chapter | Desktop FPS | Mobile-emulated FPS | Desktop calls, before → after | Mobile calls, before → after |
| --- | --- | --- | --- | --- |
| Identity | 165.8 | 165.2 | 21 → 21 | 4 → 4 |
| PRISM | 165.9 | 165.4 | 110 → 116 | 93 → 99 |
| CommerceAI | **89.1** | 165.3 | 53 → 57 | 36 → 39 |
| InstaGuard | 165.3 | 165.7 | 34 → 37 | 34 → 37 |
| Code Reviewer | 165.3 | 165.3 | 32 → 35 | 32 → 35 |
| OmniVision | 165.7 | 165.6 | 62 → 66 | 62 → 66 |
| Journey | 165.6 | 165.8 | 104 → 106 | 104 → 106 |
| Contact, settled | **0, demand idle** | **0, demand idle** | 2 → 2, last active sample | 2 → 2, last active sample |

The lower first-use CommerceAI sample is retained. Shader/material initialization and adaptive DPR changes remain relevant; these measurements do not promise hitch-free cold navigation on every device. Added detail costs at most six observed calls per chapter, and the largest observed scene remains below 60K triangles. Identical postprocessing/DPR settings should be used for stricter hardware comparisons; the adaptive system can select different DPR values between samples.

| Contact Re-train, ~1.8-second samples | 1× CPU | 4× CPU slowdown |
| --- | --- | --- |
| 1440×900, 45K face points | 165.4 FPS | 165.5 FPS |
| 390×844, 12K face points | 165.5 FPS | 165.3 FPS |

Raw [before](before/report.json) and [after](after/report.json) reports include DPR, camera poses, projected face bounds and renderer statistics. Expected demand-mode idle produces zero frames; that is an optimization, not a stalled animation.

## Checks and limits

`npm run build` passes TypeScript and Vite (2519 modules). Normal browser captures have zero page/console errors; the existing ANGLE physical-shader precision/division warning remains. A separate interaction regression checks reduced-motion portrait entry, responsive point-set replacement, camera preservation on resize, GPU-only morph buffers, reader recovery, native Research notes/Escape, all three BFS destinations, and federation/navigation switching. [Interaction results](interactions.json) record its outcome.

`scripts/check-refinement.cjs` reproduces the captures and FPS at `http://127.0.0.1:5175` (override with `REFINEMENT_URL`; optional `PLAYWRIGHT_MODULE` can point to a cached package). `scripts/validate-refinement.cjs` verifies caption bounds/visibility, exact scale reductions, portrait aspect/framing, point counts, gentle depth and measured FPS/call budgets. `scripts/check-refinement-interactions.cjs` exercises the state transitions. These require Playwright and an installed Chrome; the capture harness observes the development R3F store and therefore targets the Vite dev server.

Impeccable and Taste Skill guidance informed the composition and direct screenshot review. Source lint on the new geometry/settings files reports 0 FAIL / 0 WARN. The standalone taste browser inspector was not used as a substitute for these Playwright checks; no fresh all-site design score, accessibility certification, cross-browser result or integrated/physical-phone FPS claim is asserted. Content facts and qualifiers were preserved.
