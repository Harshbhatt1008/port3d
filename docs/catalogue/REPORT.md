# LATENT: project catalogue and optical instruments

Verified in installed Chrome at **1440x900** and **390x844**, 21 October 2026. Build: **PASS**, TypeScript + Vite, 2,520 modules. All screenshots were opened and visually reviewed. The development server remains at http://127.0.0.1:5175; the production preview is at http://127.0.0.1:4175.

## Delivered

- Five working hero project destinations, with geometric instrument icons, keyboard navigation and a compact mobile catalogue.
- InstaGuard rebuilt as a suspended three-layer perforated sieve, with bevelled apertures, rim graduations, a shared ALBERT core, instanced speech bubbles and a separate rejection path. Comment choice changes the illustrative routing. Bubble counts: 28 desktop, 16 low-core, 12 mobile.
- Code Reviewer rebuilt as a repository volume, query ray, lifted chunks, curved evidence threads, travelling pulses and a layered report. Unsupported flags remain detached. Repository counts: 48 desktop / 32 mobile; report rulings merge into one draw.
- Journey rebuilt as a descending folded ribbon with eight lens nodes. **All eight milestone summaries and proofs are visible together** on both viewports. Full dates, employers, course names and qualifications remain in Research notes and the reader.
- Contact keeps the corrected, half-height 45K/12K face. **Unfold the signal** folds those same particles into a pointer-responsive light sculpture; **Return to the person** restores the face and demand idle. The ordinal attribute, positions, tones and HB correspondence are immutable after installation. All animation uses shader uniforms. Reduced motion resolves directly to a still sculpture.
- Ink/ice tokens replace the warm interface, Canvas ground, haze, shared metal/obsidian materials and strip lighting. Signal is the single focus/interactive accent; risk colours have matching Three.js constants. Body and muted text exceed 7:1 against both ink surfaces (see the production check).

The earlier portrait/caption/size repairs are committed separately. Their [report](../refinement/REPORT.md) contains the original before/after gallery and the offline [portrait debug image](../../portrait-debug.png). The new materials use reflection-only physical shells; this revision does not claim completion of every later REVAMP camera/material-library run.

## Before and after: every chapter

Before images below are the immediately preceding repair (`b4d67e2`); after images show this revision. The earlier report also preserves the pre-repair baseline.

| Chapter | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Identity | [Before](../refinement/after/1440-chapter-0.png) | [After](after/1440-chapter-0.png) | [Before](../refinement/after/390-chapter-0.png) | [After](after/390-chapter-0.png) |
| PRISM | [Before](../refinement/after/1440-chapter-1.png) | [After](after/1440-chapter-1.png) | [Before](../refinement/after/390-chapter-1.png) | [After](after/390-chapter-1.png) |
| CommerceAI | [Before](../refinement/after/1440-chapter-2.png) | [After](after/1440-chapter-2.png) | [Before](../refinement/after/390-chapter-2.png) | [After](after/390-chapter-2.png) |
| InstaGuard | [Before](../refinement/after/1440-chapter-3.png) | [After](after/1440-chapter-3.png) | [Before](../refinement/after/390-chapter-3.png) | [After](after/390-chapter-3.png) |
| Code Reviewer | [Before](../refinement/after/1440-chapter-4.png) | [After](after/1440-chapter-4.png) | [Before](../refinement/after/390-chapter-4.png) | [After](after/390-chapter-4.png) |
| OmniVision | [Before](../refinement/after/1440-chapter-5.png) | [After](after/1440-chapter-5.png) | [Before](../refinement/after/390-chapter-5.png) | [After](after/390-chapter-5.png) |
| Journey | [Before](../refinement/after/1440-chapter-6.png) | [After](after/1440-chapter-6.png) | [Before](../refinement/after/390-chapter-6.png) | [After](after/390-chapter-6.png) |
| Contact | [Before](../refinement/after/1440-chapter-7.png) | [After](after/1440-chapter-7.png) | [Before](../refinement/after/390-chapter-7.png) | [After](after/390-chapter-7.png) |

Finale: [desktop](1440-finale.png), [mobile](390-finale.png). The initial sparse GPU hash distribution was replaced with a continuous ordinal; the final captures show the full woven surface.

## Measured performance

Actual R3F render callbacks are counted over wall time. GPU: **NVIDIA RTX 3070 / ANGLE / Direct3D11**. Mobile is viewport emulation on the same desktop GPU, **not a physical-phone result**. Adaptive DPR and bloom remain active, so CPU rates are not a controlled comparison at identical rendering quality. Short first-use samples include shader/material work and can be slower; display pacing is near 165 Hz.

| Settled chapter sample | Desktop FPS | Mobile-emulated FPS | Desktop draw calls | Mobile draw calls |
| --- | ---: | ---: | ---: | ---: |
| Identity | 165.7 | 165.2 | 21 | 4 |
| PRISM | 165.4 | 165.8 | 116 | 99 |
| CommerceAI | **86.4** | 165.2 | 57 | 39 |
| InstaGuard | 165.9 | 165.2 | 17 | 17 |
| Code Reviewer | 165.6 | 165.9 | 15 | 15 |
| OmniVision | 165.3 | 165.3 | 66 | 66 |
| Journey | 165.6 | 165.8 | 20 | 20 |
| Contact, idle | **0 (demand)** | **0 (demand)** | 2, last active frame | 2, last active frame |

The maximum observed settled scene was about 65K triangles. Draw-call differences include adaptive postprocessing; raw reports preserve DPR rather than implying that every comparison used the same quality.

| Interaction sample | Desktop 1x CPU | Desktop 4x CPU | Mobile emulation 1x CPU | Mobile emulation 4x CPU |
| --- | ---: | ---: | ---: | ---: |
| InstaGuard, first-use sequence | **69.9** | 154.1 | 165.4 | 165.5 |
| Code Reviewer | 165.6 | 150.5 | 165.4 | 165.4 |
| Journey | 165.5 | 165.5 | 165.4 | 165.4 |
| GPU light sculpture | 165.3 | 165.4 | 165.3 | 165.4 |
| HB-to-face Re-train | 165.3 | 165.3 | 165.1 | 165.3 |

The lower cold InstaGuard and CommerceAI results are retained. These samples do not establish hitch-free cold navigation or universal frame rates. One earlier throttled Re-train completion wait timed out; a separate isolated run and the final complete run passed. Its cause was not reproduced.

## Verification and visual review

- [Full capture report](after/report.json): all eight chapters at both sizes; zero page/console errors, one healthy persistent Canvas, descriptions visible during fractional scroll, no horizontal overflow, half-height face opposite its caption, exact point counts, fixed aspect and gentle depth.
- [Catalogue interaction report](report.json): all five links by keyboard, all eight Journey rows visible, comment animation/pause/selection, repository selection, GPU-only finale buffers, reversible return to demand idle and static reduced-motion finale. All checks pass at both sizes.
- [Recovery regression](recovery-checks.json): responsive 12K/45K geometry switch, camera preserved on resize, GPU morph, all eight reader notes, authentic photo, all three BFS destinations, federation switch and Research notes/Escape. Pass.
- [Production build check](production-checks.json): project picker, Journey, portrait, finale and reader pass on the built app at both sizes; body/muted contrast passes 7:1.
- The existing ANGLE physical-material precision/division warning remains in development. No new page or console errors were observed. No cross-browser or physical-device certification is asserted.

Impeccable and Taste Skill guided the review. Render review caught and corrected the sparse finale distribution, clipped mobile sieve annotation, overlapping repository annotations and a Journey node behind the HUD. The hero catalogue fills the opening with useful destinations; the wider Journey caption exposes substance rather than hiding it behind selection. Source lint on the five rebuilt shader/scene/helper files has **0 FAIL / 1 WARN**: the retained node numbers match the visible milestone sequence. No all-site detector score is claimed; real Playwright capture was used because the standalone taste inspector's CDP setup was unavailable earlier in the recovery.

Reproduce against the Vite dev server with `scripts/check-refinement.cjs catalogue-final`, `scripts/validate-refinement.cjs .qa/refinement/catalogue-final`, `scripts/check-catalogue.cjs` and `scripts/check-refinement-interactions.cjs`. `scripts/check-production.cjs` targets the built preview on port 4175. Set `PLAYWRIGHT_MODULE` to an installed Playwright package if it is not available through normal Node resolution. `REFINEMENT_URL` and `PRODUCTION_URL` override their respective local URLs.
