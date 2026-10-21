# Perception globe, memory archive and portrait depth

Verified 21 October 2026 on branch glass-revamp. Before images are the committed 7665daf catalogue build. Current images were captured from the real running app at 1440x900 and 390x844 and visually inspected. These are local changes; no Vercel deployment is claimed.

## Result

OmniVision is now a cutaway perception globe: three sensor ports converge into a rotating optical iris, while an articulated probe crosses a curved occupancy map with ultrasonic wavefronts and a heading indicator. The original obstacle grid and BFS goals remain. Federation reveals three robots in the globe, with local module updates followed by updates between robots; sealed raw-data jars stay beside each robot. Navigation, federation and all research figures remain explicitly illustrative.

Journey is an eight-leaf kinetic memory archive. Pierced, bent glass folios have bevelled edges, engraved lines and inner chrome cores. Keyboard focus, hover or selection opens the matching leaf. All eight factual milestone summaries remain visible together in HTML, with complete detail in Research notes and reader mode.

The background has five perspective layers of flowing contour rails with light sweeps, ink haze and faint dust. The rails batch into one additional draw call and depth-test behind solid models. Buffer attributes stay static; uniforms provide motion. Mobile reduces contour counts. Pause, reduced motion, hidden-state handling and the dust-off option remain.

A second cause of the empty appearance was found in the installed Drei PerformanceMonitor: each healthy incline callback increments its flip counter. The previous finite flipflops limit therefore triggered the forced haze-off fallback after roughly four healthy checks. Removing that finite limit/forced fallback preserves the background; genuine decline handling remains. DPR recovery is capped at the display's native ratio. The [extended quality check](interactions/quality.json) passes beyond the previous failure interval with haze/contours visible and no context loss. Two haze noise octaves keep the expanded background's fill cost controlled.

**Sizes are preserved.** All 16 chapter/viewport captures retain the previous wrapper scale, camera coordinates and object positions exactly: [preservation checks](preservation.json). Chapter scale constants, camera/FOV, responsive fit envelopes and caption CSS dimensions are unchanged. New geometry fits those frames; World changes only quality callbacks.

## Face depth

The source-aligned 2.5D relief adds skull, nose bridge, cheek, chin and neck depth, with offline unit normals for restrained key/rim lighting. The source is the owner's original photograph, with the same fixed face-centred 4:5 crop and hair/glasses/beard matte. The 45,000 desktop and 12,000 mobile samples retain every original x/y coordinate and tone bit-for-bit against 7665daf. Depth spans approximately 0.758 world units, under the 0.8 bake limit; pointer yaw is capped at 0.135 radians. This is a photographic relief, not a 3D scan of unseen surfaces.

Tone still determines point size/alpha: bright areas stay bright, shadows stay dark, with no mirroring. Position, normal, HB and ordinal attributes remain immutable during shader turns/morphs. The light-sculpture finale, Re-train and settled demand rendering remain functional.

- [Source / mask / flat points](../../portrait-debug.png)
- [Offline relief at three angles](../../portrait-depth-debug.png)
- Desktop shader turns: [left](interactions/1440-portrait-left.png), [right](interactions/1440-portrait-right.png)
- Mobile shader turns: [left](interactions/390-portrait-left.png), [right](interactions/390-portrait-right.png)

## Before and after

| Chapter | 1440x900 | 390x844 |
|---|---|---|
| Identity | [Before](../catalogue/after/1440-chapter-0.png) / [After](after/1440-chapter-0.png) | [Before](../catalogue/after/390-chapter-0.png) / [After](after/390-chapter-0.png) |
| PRISM | [Before](../catalogue/after/1440-chapter-1.png) / [After](after/1440-chapter-1.png) | [Before](../catalogue/after/390-chapter-1.png) / [After](after/390-chapter-1.png) |
| CommerceAI | [Before](../catalogue/after/1440-chapter-2.png) / [After](after/1440-chapter-2.png) | [Before](../catalogue/after/390-chapter-2.png) / [After](after/390-chapter-2.png) |
| InstaGuard | [Before](../catalogue/after/1440-chapter-3.png) / [After](after/1440-chapter-3.png) | [Before](../catalogue/after/390-chapter-3.png) / [After](after/390-chapter-3.png) |
| Code Reviewer | [Before](../catalogue/after/1440-chapter-4.png) / [After](after/1440-chapter-4.png) | [Before](../catalogue/after/390-chapter-4.png) / [After](after/390-chapter-4.png) |
| OmniVision | [Before](../catalogue/after/1440-chapter-5.png) / [After](after/1440-chapter-5.png) | [Before](../catalogue/after/390-chapter-5.png) / [After](after/390-chapter-5.png) |
| Journey | [Before](../catalogue/after/1440-chapter-6.png) / [After](after/1440-chapter-6.png) | [Before](../catalogue/after/390-chapter-6.png) / [After](after/390-chapter-6.png) |
| Contact | [Before](../catalogue/after/1440-chapter-7.png) / [After](after/1440-chapter-7.png) | [Before](../catalogue/after/390-chapter-7.png) / [After](after/390-chapter-7.png) |

Additional states: federation [desktop](interactions/1440-federation.png) / [mobile](interactions/390-federation.png); selected archive leaf [desktop](interactions/1440-archive-selected.png) / [mobile](interactions/390-archive-selected.png).

## Rendered FPS

Chrome through Playwright, ANGLE / NVIDIA GeForce RTX 3070, native DPR 1. Each sample counts actual R3F render callbacks. Full chapter captures retain the initial ~1.1-second window and a separate settled ~1.6-second window, rather than choosing the best result. Contact intentionally renders zero frames when idle. Short measurements vary and mobile is viewport emulation on this desktop GPU, not a physical-phone benchmark.

| Chapter | Desktop initial / settled FPS | Mobile initial / settled FPS | Draw calls |
|---|---:|---:|---:|
| Identity | 163.3 / 120.0 | 165.7 / 164.7 | 5 |
| PRISM | 163.1 / 162.9 | 165.4 / 165.4 | 100 |
| CommerceAI | 139.3 / 144.9 | 161.3 / 165.7 | 40 |
| InstaGuard | 146.1 / 144.8 | 165.6 / 165.6 | 19 |
| Code Reviewer | 129.6 / 119.4 | 165.3 / 165.3 | 17 |
| OmniVision | 143.2 / 163.6 | 165.6 / 165.4 | 42 |
| Journey | 163.0 / 153.5 | 165.4 / 165.4 | 35 |
| Contact | 0.0 / 0.0 | 0.0 / 0.0 | 4 |

Focused active-animation samples (~1.6 seconds each) with DevTools CPU throttling:

| Animation | Desktop 1x / 4x FPS | Mobile 1x / 4x FPS |
|---|---:|---:|
| OmniVision navigation | 164.3 / 114.9 | 163.4 / 124.6 |
| OmniVision federation | 161.4 / 89.7 | 160.7 / 110.0 |
| Journey archive | 165.4 / 106.1 | 164.4 / 126.8 |
| Portrait relief morph | 165.6 / 150.9 | 162.3 / 136.2 |

Draw calls with the new background: navigation 42, federation 60, archive 35, portrait 4. These include the single batched contour-field draw. [Full raw captures](after/report.json), [focused measurements](interactions/report.json).

An [earlier performance capture](quality-before.json) records a PRISM settled window below 55 FPS before the quality-monitor fix. Other exploratory runs also exposed compilation/quality-switch hitches; these are why first-use and settled windows are retained separately. The final run passes the existing budget checks, but does not certify universal or cold-start frame rates.

## Verification

- TypeScript + production build: PASS, Vite 2522 modules.
- Full eight-chapter browser capture and validation: PASS; one persistent healthy Canvas, visible captions, no horizontal overflow, portrait framing, counts and finite unit normals.
- [Focused checks](interactions/report.json): PASS at both viewports; moving BFS probe, pause, model-update orbs, stationary sealed jars, keyboard archive selection, immutable portrait attributes and reduced-motion operation.
- [Recovery checks](recovery.json): PASS; 12K-to-45K resize, Contact camera preservation, GPU morph, all three BFS destinations, federation toggle, Research notes/Escape and accessible reader with all eight notes.
- [Built-preview checks](production.json): PASS at both viewports; hero project picker, Journey, Contact/finale and reader. Body text contrast is at least 9.6:1 for the checked ink/ice pairs.
- [Quality regression](interactions/quality.json): PASS; background persists beyond the old fallback interval and DPR stays within native resolution.
- Zero console/page errors or WebGL context losses. The capture retains one existing ANGLE physical-material shader warning. Impeccable and Taste guidance plus direct screenshot review informed the work; focused source lint returned 0 failures and one intentional milestone-numbering warning. No new whole-site detector score is claimed.

Reproduce with the dev server on port 5175 and production preview on port 4175. Set PLAYWRIGHT_MODULE to the installed Playwright module if necessary. Run check-depth-world.cjs, check-refinement.cjs depth-final, validate-refinement.cjs .qa/refinement/depth-final, check-refinement-interactions.cjs, check-quality.cjs and check-production.cjs from scripts/. Bake debug output with npm run bake:portrait -- --debug.
