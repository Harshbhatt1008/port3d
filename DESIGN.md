---
name: LATENT — Harsh Bhatt
description: Noise becomes structure, then a person, in one continuous research world.
colors:
  obsidian: "oklch(17% 0.008 85)"
  deep: "oklch(13% 0.006 85)"
  bone: "oklch(92% 0.016 85)"
  muted: "oklch(73% 0.015 85)"
  metal: "oklch(82% 0.009 85)"
  rule: "oklch(39% 0.012 85)"
  low: "oklch(82% 0.1 145)"
  medium: "oklch(84% 0.12 85)"
  high: "oklch(76% 0.14 30)"
typography:
  display:
    fontFamily: '"Archivo Black", system-ui, sans-serif'
    fontSize: "clamp(60px, 6.4vw, 98px)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Archivo Black", system-ui, sans-serif'
    fontSize: "clamp(40px, 4.2vw, 64px)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  title:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  deck:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  control:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.65
  label:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  telemetry:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  control: "4px"
spacing:
  gutter: "clamp(24px, 4vw, 64px)"
  control-gap: "6px"
  field-inset: "11px 12px"
  primary-inset: "12px 18px"
  section-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "{spacing.primary-inset}"
  button-primary-hover:
    backgroundColor: "{colors.metal}"
    textColor: "{colors.deep}"
  button-choice:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-choice-selected:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep}"
  field:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    padding: "{spacing.field-inset}"
    width: "100%"
  icon-control:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    width: "44px"
  chapter-current:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  text-toggle-pressed:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0"
---

# Design System: LATENT — Harsh Bhatt

## Overview

**Creative North Star: "Noise → structure → a person"**

LATENT makes Harsh's language, learning and robotics research tangible inside a continuous spatial world. Warm obsidian, bone, chrome and dark glass connect the scenes. Geometry supplies the imagery; substantial DOM copy and working controls supply the explanation. The owner's pinned world and code-led brief are the visual authority; the earlier portfolios supply no inherited theme.

The experience is dense like a research instrument, with quiet factual prose beside a large physical object. A continuous camera rail connects seven rooms, while a persistent inference console gives visitors chapter navigation, motion and sound controls, and a complete reading alternative. This records the implemented system, refreshing the provisional document that preceded the UI. The direction contract remains in `.impeccable/surface-brief.md`, including the confirmed FORM reference `seed:0165dcf1c61f4b13`; no alternative approved comp is implied.

**Key Characteristics:**

- Warm monochrome materials; colour has a specific research meaning.
- Heavy display geometry paired with readable monospaced facts and controls.
- One continuous world with real HTML content and native scrolling.
- Illustrative interactions explicitly separated from reported research results.
- Motion, graphics and sound always have visitor-controlled alternatives.

## Colors

The CSS palette is warm and low in chroma. Its OKLCH declarations in the frontmatter are normative; Three.js uses corresponding warm-neutral sRGB material and lighting values, rather than literal CSS colour strings. The sidecar's eight-step tonal strips are synthesized panel previews, not additional runtime palette tokens.

### Primary

- **Bone:** primary text, selection, focused outlines, active controls and neutral feedback.
- **Metal:** brighter instrument edges and the primary action's hover treatment.

### Neutral

- **Obsidian:** the page ground and opaque console backing that keeps moving geometry clear of navigation.
- **Deep:** recessed fields, menus, intro skip control and small informational surfaces.
- **Muted:** secondary prose, qualification notes, stack lists and telemetry.
- **Rule:** thin structural edges, dividers and resting control outlines.

Risk-only accents are **Low**, **Medium** and **High**. These name the stored dataset categories in text. The three sRGB routes in the PRISM scene are `#6ab77d`, `#dfb64d` and `#d87c65`; they belong to its optical illustration, not a second interface palette.

**The Colour Means Something Rule.** Colour is reserved for PRISM's refracted spectrum and LOW/MEDIUM/HIGH labels. Other selection, focus, status and contact feedback use warm neutrals.

## Typography

**Display Font:** self-hosted Archivo Black, with system-ui and sans-serif fallbacks.
**Body and Label Font:** self-hosted IBM Plex Mono (400 and 500), with ui-monospace and monospace fallbacks.

Archivo Black makes headings and extruded lettering dense and physical. IBM Plex Mono carries readable sentence-case prose as well as the compact instrument data. Mesh lettering is decorative duplication; the identity remains a real HTML heading.

### Hierarchy

- **Display:** the frontmatter display role is the desktop identity heading. The actual mobile identity override is 44px with 1.05 line height; its line break is suppressed. The generic mobile h1 rule is 58px but is overridden on this identity surface.
- **Headline:** the frontmatter headline role is used for chapter titles. Mobile uses 38px; short desktop viewports use 43px.
- **Title:** monospaced h3 uses the frontmatter title role. Journey detail changes to 17px on mobile; the complete journey list uses 16px.
- **Body:** root text and sustained qualification/journey prose use the body role. The final cascade explicitly sets honesty notes and journey detail paragraphs to 15px desktop and 14px at mobile widths. This supersedes earlier compact-note declarations.
- **Deck:** chapter introductions use the deck role, ordinarily up to 44ch. The desktop identity deck is 17px, bone, and 25ch; other paragraphs allow 62ch. Mobile chapter decks are 14px, and reader decks allow 65ch.
- **Control and label:** primary buttons are 13px/500; native fields and field labels are 13px. Choice controls, stack lists and metric captions are 12px. Individual compact readouts remain 10–12px; mobile prompt-result metadata is 11px. Console telemetry is the 10px role, not the prose scale.
- **Metrics:** tabular numeric figures use `clamp(23px, 2.2vw, 32px)`, 500 weight, 1.1 line height and -0.035em tracking; mobile uses 23px and the intermediate desktop layout uses 24px.

**The Prose Is Not Telemetry Rule.** Sustained factual qualifications and journey explanation keep the 15px desktop/14px mobile body scale. Compact coordinates, chapter metadata and numerical instruments retain their separate scale.

## Layout

The fixed world fills the viewport behind the DOM. Desktop copy begins at the shared responsive gutter, 17.5vh from the top, with width `min(32.5vw, 450px)` and a 75vh scrolling height. The object occupies the remaining spatial field. The fixed console shares the gutter, begins 22px from the top, and has an opaque obsidian backing. The scene is continuous rather than a stack of background panels.

A 1000svh native scroll rail drives camera progress across seven chapter anchors. Chapter jumps, the next-chapter control and Alt+0 through Alt+6 provide equivalent navigation. The copy column has its own native thin scrollbar; a measured “Scroll notes” hint appears while more content remains. Closed/inactive chapters are inert and invisible. Details use native disclosure rather than a second reading surface.

At widths 701–1100px, copy becomes 39vw and the console tightens. At desktop heights of 760px or less, copy starts at 20vh with a 73vh cap and denser introductory spacing. At widths of 700px or less, the gutter becomes 22px, the console becomes two columns with an expanded vertical chapter menu, and copy starts at 126px with a `calc(100svh - 162px)` height cap. A 250–270px gap before mobile controls makes room for the object; content remains reachable by native notes scrolling. Final mobile icons are 44px wide.

Reading mode removes the WebGL world and scroll rail. Every chapter becomes a normal, visible HTML section, with an 800px maximum copy width, an optional grayscale owner portrait, and the same working controls. Its control column caps at 670px. Mobile reading sections use 58px vertical padding. Do not turn the 3D overlay dimensions into the reading layout.

## Elevation & Depth

DOM controls and containers use tonal separation and thin rules, with no box-shadow vocabulary. Depth belongs to original scene geometry, warm neutral lighting and bounded physical materials. The shared chrome is sRGB `#c9c6bd`, metalness 1 and roughness 0.2; the shared dark instrument material is `#252520`, metalness 0.7 and roughness 0.28. Scene-specific roughness varies with the object. Rectangular neutral environment lights are captured once at resolution 128.

PRISM uses an extruded, bevelled physical glass mesh with transmission 1, IOR 1.5, thickness 1.35, roughness 0.07 and dispersion 0.6. Real calibration bars behind it make transmitted displacement visible. Dark glass is also used in the federation illustration. Small bloom is enabled only for desktop at higher DPR (intensity 0.12, threshold 2.2); it does not supply the material's shape.

**The Geometry Carries Depth Rule.** Material thickness, light, silhouette and occlusion establish depth. CSS cards, ambient page glows and coloured atmosphere are not substitutes for the owner's physical world.

## Shapes

Controls are rectangular with the shared small corner radius. Fields and choices have one-pixel rules; active states become bone-filled. Instrument geometry uses actual rods, rails, housings, woven curves, calibration marks, glass and point fields. Circles occur where the world calls for them: particles, dials, joints, and the Training Run shockwave. They are not a general container shape.

The contact copy control carries a neutral metallic gradient and a restrained travelling highlight. This is a native material echo within the monochrome world; the PRISM-only colour rule does not prohibit neutral gradients. Small SVG icons are functional control glyphs with accessible labels, not decorative text-symbol substitutes.

## Components

### Buttons

Primary actions are bone on deep, with a thin bone edge, the shared radius and the frontmatter primary inset. Hover changes the fill to metal. Outlined choices use rule borders, compact insets and bone text; selected `aria-pressed` choices invert to deep on bone. General hover uses a warmer raised neutral (`oklch(24% 0.008 85)`) and metal border. Standard button minimum height is 44px, and final icon controls are 44px square. Disabled buttons use 0.45 opacity. Text controls omit the border and background while retaining the 44px target.

All focusable controls use a bone 2px outline with 5px offset; fields use 3px offset. Pressed text controls, including the portrait resolve action, remain bone on transparent at rest, hover and keyboard focus; they do not inherit the filled-choice inversion. Colour does not signal ordinary success. Keep actual labels, pressed/current states and SVG icons in the DOM.

### Inputs / Fields

Native select and textarea controls use deep backgrounds, rule borders, bone text and the shared radius/inset. Their minimum height is 46px; textareas begin at 95px, resize vertically, and use muted placeholders. Range controls are bone-accented, 36px high, with an equivalent native keyboard interaction for the draggable decision boundary.

### Navigation

The inference console combines the original HB SVG mark, chapter coordinates, real camera coordinates and journey progress. Current chapter buttons use bone fill and deep text. Desktop widths at or above 1200px show chapter names inline; intermediate widths reveal them on hover/focus. Mobile opens a vertical menu with visible names. Sound defaults off; pause and reader controls remain available. The console's telemetry describes position and navigation, not model inference.

### Disclosures and result instruments

Research notes and the full journey use native details/summary with thin rule edges and a 44px summary target. Metric rows reverse visual label/value ordering using semantic description lists. CommerceAI's recommendation is an open ruled row, not a card. Risk labels spell out LOW/MEDIUM/HIGH as well as applying their permitted colour. There is no generic card library or separate drawer component in the current artifact.

### Persistent world and Training Run

One R3F Canvas follows a Catmull-Rom camera rail, coordinated with Lenis and GSAP ScrollTrigger. Seven lazy room modules mount only for the current chapter and its neighbours; room visibility is bounded to nearby progress. Repeated objects use instancing where implemented, and custom geometries/materials include unmount disposal. No GLB imports supply the world. Portrait pixel sampling uses an offscreen 2D canvas, not an additional scene Canvas.

Training Run samples an original extruded HB with MeshSurfaceSampler: one point becomes Gaussian noise, three semantic clusters, a sampled surface, liquid chrome, a brief stamp/shockwave, then a flight through the B counter. Its actual point counts are 120,000 desktop and 30,000 mobile. Asset progress is real; epoch/loss readouts are explicitly illustrative. Normal choreography is 6.6 seconds, with an 8-second wall-clock safety timer and immediate Skip intro/Escape. Reduced motion uses a 1.2-second fade. Browser startup and scheduling can add navigation-to-completion time; the regression report's slow-CPU observation is 9.153 seconds, not evidence of a universal eight-second navigation budget.

Continuous decorative movement respects pause/reduced motion; after the intro those settings use demand rendering, and hidden documents use `frameloop="never"`. State changes invalidate demand frames. Reduced motion removes the camera's interpolation/roll and settles interaction states directly. Standard DOM feedback is 160ms; chapter visibility uses 320ms with the shared ease `cubic-bezier(0.16, 1, 0.3, 1)`. The contact sheen is 700ms. Native reduced-motion CSS removes transitions and the sheen.

### Authentic portrait and factual content

The final photographic field samples 60,000 points desktop and 15,000 mobile from the owner's real portrait, using luminance for monochrome intensity and depth. Its subtle pointer rotation is bounded, and a real button disperses/resolves it. `src/content.ts` owns the portfolio facts and asset references. The active portrait is WebP, a format-only conversion of the preserved original AVIF following a WebKit decoding issue; the original crop is retained and public provenance records both assets. No generated portrait or invented research result belongs to the system.

The stored PRISM dataset labels, purchase histories, decision boundary, retrieval context and navigation/federation controls are illustrations. Their qualification copy stays attached to the relevant interaction; manuscript preparation and research-in-progress statuses remain explicit. Contact opens a real mailto draft; copying email has a selectable-text fallback.

## Do's and Don'ts

### Do:

- **Do** use warm neutral CSS tokens and corresponding scene materials; reserve colour for PRISM's spectrum and the three risk labels.
- **Do** keep all substantive content and controls in real HTML, with a complete reader and no-WebGL recovery path.
- **Do** preserve the 15px desktop/14px mobile sustained-prose scale, native notes scrolling and visible continuation hint.
- **Do** keep the seven rooms inside one persistent scene Canvas, with lazy neighbours, bounded visibility, resource cleanup and visitor-controlled motion.
- **Do** preserve source qualifications, authentic assets and provenance alongside every reported metric and illustrative control.

### Don't:

- **Don't** inherit an earlier portfolio theme, add coloured atmospheric decoration, or replace the continuous world with generic card sections.
- **Don't** present stored examples or scripted visualisations as live trained-model inference or browser training.
- **Don't** replace readable HTML with mesh text, conceal overflowing notes, or auto-enable sound.
- **Don't** generalize one desktop GPU's measured frame rate into a universal 60fps or physical-device compatibility claim.

Recorded verification is evidence, not a token: `.qa/regression.json` records 25 passing interaction checks and no runtime errors; `.qa/final-browsers.json` supersedes its stale initial browser harness results and records Chrome, Firefox and WebKit passing with empty error arrays. Driver shader precision warnings, Firefox's deprecated renderer diagnostic and expected context teardown remain recorded. RTX 3070 samples are mostly 165fps, with a 58fps first PRISM sample during shader warm-up; integrated-GPU 60fps and physical mobile testing are unverified. The final review's ship disposition covers its three scored fixes, not a new whole-surface audit. These limits are not canonized as visual rules, and this documentation pass does not repair unrelated product/configuration drift.
