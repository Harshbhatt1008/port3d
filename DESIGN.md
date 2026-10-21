---
name: LATENT - Harsh Bhatt
description: Noise becomes structure, then a person, in one continuous research world.
colors:
  obsidian: "oklch(17% 0.008 85)"
  deep: "oklch(13% 0.006 85)"
  bone: "oklch(92% 0.016 85)"
  muted: "oklch(78% 0.015 85)"
  metal: "oklch(82% 0.009 85)"
  rule: "oklch(39% 0.012 85)"
  hover: "oklch(24% 0.008 85)"
  option-active: "oklch(27% 0.008 85)"
  chrome-type: "#b9b9b3"
  low: "oklch(82% 0.1 145)"
  medium: "oklch(84% 0.12 85)"
  high: "oklch(76% 0.14 30)"
typography:
  display:
    fontFamily: '"Archivo Black", system-ui, sans-serif'
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Archivo Black", system-ui, sans-serif'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  deck:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
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
    lineHeight: 1.65
  metric:
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.035em"
rounded:
  control: "4px"
  compact: "2px"
spacing:
  gutter: "clamp(24px, 3.2vw, 52px)"
  choice-gap: "5px"
  field-inset: "10px 12px"
  primary-inset: "11px 15px"
  caption-inset: "22px 24px 18px"
  drawer-inset: "24px"
  mobile-gutter: "16px"
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
    padding: "8px"
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
    width: "40px"
  chapter-current:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep}"
    typography: "{typography.telemetry}"
    rounded: "{rounded.control}"
    padding: "0 7px"
  text-toggle-pressed:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0"
  combobox:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    width: "100%"
  caption:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    padding: "{spacing.caption-inset}"
    width: "min(400px, 31vw)"
  research-drawer:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    width: "min(560px, calc(100vw - 32px))"
  scene-label:
    backgroundColor: "oklch(17% 0.008 85 / 0.9)"
    textColor: "{colors.bone}"
    rounded: "{rounded.compact}"
    padding: "4px 6px"
---

# Design System: LATENT - Harsh Bhatt

## Overview

**Creative North Star: "Noise → structure → a person"**

LATENT makes Harsh's language, learning and robotics research tangible inside one continuous spatial world. Warm obsidian, bone, chrome and dark glass connect the scenes. Physical geometry supplies imagery; real HTML supplies readable facts and usable controls. The owner's pinned world is the visual authority, and no earlier portfolio theme is inherited.

The revised experience places a compact floating caption over each full-bleed scene. Eight chapters share a persistent inference console and deliberate Research notes expansion. The approved revision in `.impeccable/surface-brief.md` supersedes the old split copy column and seven-room layout. The direction record `.impeccable/latent-seed.txt` and FORM reference `seed:0165dcf1c61f4b13` remain provenance; their open-field assignments do not override the owner-pinned LATENT world.

**Key Characteristics:**

- Warm monochrome materials; colour has a specific research meaning.
- Heavy display geometry paired with monospaced facts and controls.
- Full-bleed scenes, floating captions and deliberate Research notes drawers.
- Illustrative interactions kept distinct from reported research results.
- Motion, graphics and sound have visitor-controlled alternatives.

## Colors

Warm, low-chroma CSS colours form the normative interface palette above. Three.js uses sRGB material and lighting colours rather than literal CSS OKLCH strings. Sidecar tonal strips are synthesized panel previews, not additional runtime colours.

### Primary

- **Bone:** primary text, focus outlines, selected controls and neutral feedback.
- **Metal:** instrument edges and primary-action hover.
- **Type chrome:** intentionally neutral sRGB material for Training Run HB and extruded name. Its slight channel variation belongs to reflected metal, not an accent palette or accidental gray drift.

### Neutral

- **Warm Obsidian:** page ground, opaque captions, drawer and console backing.
- **Deep:** recessed inputs, options and intro skip control.
- **Muted:** secondary prose, source qualifications and telemetry; revised source raises its lightness from the former system.
- **Rule:** thin structural edges and control outlines.
- **Hover / Option active:** restrained neutral lift for pointer and combobox keyboard state.

Risk-only accents are **Low**, **Medium** and **High**, always accompanied by text. PRISM's scene beams use `#81bd92`, `#e1bd62` and `#e68c76`; they belong to its optical illustration rather than a second interface palette.

**The Colour Means Something Rule.** Colour is reserved for PRISM's refracted spectrum and LOW/MEDIUM/HIGH labels. Ordinary selection, focus, status and contact feedback use warm neutrals.

## Typography

**Display Font:** self-hosted Archivo Black (400), with system-ui/sans-serif fallback.
**Body and Label Font:** self-hosted IBM Plex Mono (400 and 500), with ui-monospace/monospace fallback.

Dense Archivo geometry gives the identity physical mass. IBM Plex Mono carries sentence-case facts as well as compact instrument data. Mesh lettering is decorative duplication: identity has a real DOM h1, visually hidden in the spatial experience and visible in reading mode.

### Hierarchy

- **Display:** the frontmatter display role is the visible reader h1; mobile reader size is 42px. The spatial name is extruded geometry, not a CSS display-size token.
- **Headline:** chapter h2 uses the headline role. Floating mobile captions use 27px, with Contact at 25px; short desktop uses 28px. Drawer headings are 32px desktop and 28px mobile.
- **Title:** monospaced research h3 uses the title role.
- **Body:** root text is the body role. Drawer/inline research paragraphs use 15px at 1.75, becoming 14px mobile. Paragraphs allow up to 65ch. Journey detail intentionally uses 13px at 1.55 (1.5 mobile) as a short active-item readout.
- **Deck:** caption introductions use the deck role, becoming 13px at 1.5 mobile and 15px on wide desktops. Identity's tagline is 20px at 1.5, becoming 19px mobile and 18px on short desktops.
- **Control and label:** primary actions use 13px/500; combobox triggers use 13px/400. Standard entry text is 14px; mobile command input and composer textarea are 16px. Field labels and metric captions are 12px, with mobile metric captions at 11px.
- **Telemetry and annotations:** desktop chapter navigation and console data are 10px. Supporting results, portrait readout and compact tabs are 11px. Projected labels use 11px at 1.35 with 9px subordinate labels; mobile uses 10px labels and 9px comments/subordinates. These are intentional compact instrument exceptions, not the sustained-prose scale.
- **Metrics:** tabular figures use the metric role, with 25px mobile, 24px short desktop and 30px wide desktop overrides. Model recommendations use a separate 19px figure.

These observed control-font sizes and compact mobile labels are conscious system entries. They do not authorize reducing research-note prose or inventing new display families.

**The Prose Is Not Telemetry Rule.** Sustained research notes use 15px desktop and 14px mobile prose. Compact scene annotations, navigation and instruments keep their explicitly documented smaller roles.

## Layout

The portrait/model recovery keeps the full-viewport Canvas and restores persistent chapter descriptions. Desktop captions sit at the left near vertical centre; instruments occupy the adjacent right-hand space. Mobile captions remain below the instruments. Captions no longer disappear while scrolling or waiting for camera easing. Desktop shows the existing complete chapter description; mobile keeps the short source caption, with full notes available in the drawer/reader. The responsive envelope below is the base fit: `CHAPTER_SCALE` applies 0.80 for Identity and 0.82 for the other chapters. Contact uses the 0.82 multiplier against a dedicated 0.61-height frame, yielding approximately half-height, with the portrait to the right on desktop and above the caption on mobile.

One fixed Canvas fills the viewport behind real HTML. Eight chapters run 00 Identity, 01 PRISM, 02 CommerceAI, 03 InstaGuard, 04 Code Reviewer, 05 OmniVision, 06 Journey and 07 Contact. A native 1100svh scroll rail drives the camera spline. Chapter buttons, next/back navigation and Alt+0 through Alt+7 provide equivalent jumps. Inactive chapters are invisible and inert.

Each chapter owns a full-viewport overlay with a bottom-left floating caption. Base captions use the frontmatter width/padding, shared gutter and 32px bottom inset, with visible overflow and no internal scrollbar. Scene envelopes fit both axes at rest: ordinary desktop objects occupy up to 74% width and 70% height; Identity uses up to 84% width and Contact 62% height. Mobile fits up to 90% width and 45% height with objects lifted above captions. OmniVision uses its own lower framing offset to retain the complete apparatus.

Console top is 18px desktop with shared gutter and opaque backing. At 701-1199px, captions become 350px wide, inset 24px left/bottom with 20px padding, and chapter names hide. At desktop heights up to 760px, captions use a 20px bottom inset, 350px width and 18px 20px padding; Journey's deck hides. At widths at least 1600px, captions widen to 430px with 26px padding.

At widths up to 700px, gutter is 16px; captions inset 16px on sides/bottom with 16px 18px 12px padding. Console top is 12px, tools retain 44px targets and navigation opens as a two-column menu. Coordinates hide from compact telemetry. The drawer insets 8px on every side and body padding becomes 20px.

Reading mode removes Canvas and scroll rail. All chapters become ordinary visible sections with inline complete notes, an 850px maximum caption width and no caption border. Desktop chapters use 50px vertical padding plus gutter, with 32px caption padding. Mobile sections use 20px 16px with 14px 0 caption padding. The authentic grayscale portrait appears in the reader. Ordinary document scroll is distinct from deliberate drawer body scroll.

## Elevation & Depth

Current instrument geometry uses two-segment chamfered boxes and lathed profiles with two shoulder/bevel steps, a structural gauge of 0.65, thin seams/ring bands/wires and exposed cores. Seams and bands are merged by material; small connectors are instanced with 128/36/24 high/mobile/low caps. A restrained neutral rear point light catches the finer silhouettes without adding a shadow render pass. HB/name extrusion is 35% shallower; the original counters and H/B separation survive. Contact now samples the original AVIF in a fixed 596×745 face-centred crop with soft alpha matting and 45K/12K points. Normalised tone controls colour, opacity and size; depth spans less than 0.15 world units and pointer tilt is limited to 0.035 radians. The root `portrait-debug.png` exposes source, matte and a flat CPU rendering for comparison.

Most DOM surfaces use opaque tonal separation and one-pixel rules. The hand-built combobox popover is the explicit diffuse-shadow exception (`0 14px 40px rgb(0 0 0 / 0.3)`), separating it from the spatial scene. Research notes use a neutral scrim (`rgb(13 12 10 / 0.62)`) and native modal layering. These observed treatments belong to the system; a blanket no-shadow rule would misdescribe the artifact.

Shared chrome is sRGB `#c9c6bd`, metalness 1 and roughness 0.2; dark instruments use `#252520`, metalness 0.7 and roughness 0.28. HB/name use the frontmatter type-chrome colour. Name roughness is 0.13 with clearcoat 0.65 and environment intensity 1.7. Mobile-specific narrow environment strips preserve bright/dark reflected bands at neutral rest. The one-shot neutral environment capture uses resolution 128.

PRISM's bevelled physical prism uses transmission 1, thickness 1.25, IOR 1.5, dispersion 1.1 and roughness 0.035, with real calibration bars behind it. Desktop bloom is bounded to intensity 0.075/threshold 2.4 at DPR above 1.2; mobile and Contact omit it. Quiet atmosphere is four-octave warm procedural FBM plus 4,200 desktop/1,050 mobile dust points. Dust is toggleable, reduces strongly at Contact and respects pause/reduced motion; performance fallback can disable haze independently.

**The Geometry Carries Depth Rule.** Material thickness, reflected light, silhouette and occlusion establish the world's depth. The floating option menu alone uses a diffuse DOM shadow to separate it from the scene.

## Shapes

Rectangular controls, captions, fields, menus and drawer share small corners. Compact option rows and projected labels intentionally use the compact radius (2px), an exception to the general 4px control radius. One-pixel rules establish boundaries. Circles occur as particles, joints, dials and the single Training Run shockwave, rather than as a generic container system.

Contact copy echoes liquid metal with a neutral gradient and travelling sheen. Neutral gradients and warm procedural haze belong to this physical world. Inline SVG icons serve labelled controls; decorative text-symbol icons do not define a separate language.

## Components

### Buttons

Primary actions use bone fill, deep text, shared corners and primary inset; hover changes fill to metal. Choice buttons use rule borders and transparent fill, then invert for `aria-pressed=true`. Generic hover uses hover neutral and metal edge. Base minimum height is 44px. Desktop icon controls are 40px wide with 44px minimum height; mobile makes them 44px wide. Disabled buttons use 0.5 opacity and wait cursor. Focus uses a 2px bone outline with 4px offset.

Text actions remain transparent on hover. Pressed text toggles remain bone on transparent instead of inheriting choice inversion. Full-width contact copy uses a neutral metallic gradient, 12px padding/text and a 700ms sheen. Copy feedback stays factual and neutral, with an email fallback if clipboard access fails.

### Inputs / Fields

Native inputs and textareas use deep backgrounds, rule borders, shared corners and field inset. Minimum height is 46px; textareas start at 120px and resize vertically. Invalid input uses a dashed bone border. Placeholder text is muted. Mobile entry fields use the explicit 16px exceptions above.

### Choice combobox

The handmade select-only ARIA combobox has one tab stop, full-width deep trigger, portalled listbox and real option labels/descriptions. Arrow keys, Home/End, typeahead, Enter/Space, Escape, Tab and pointer selection have implemented behavior. Active options use raised neutral; selected options receive an inset rule outline. Options have at least 52px height, 12px padding and compact corners. The popover is viewport-positioned, bounded and independently scrollable, with the documented diffuse-shadow exception.

### Navigation

The fixed inference console combines original HB SVG, 00-07 chapter buttons, progress and coordinates, plus pause, opt-in sound, dust and reading controls. Current chapter uses bone fill/deep text with `aria-current=step`. Names show at 1200px and above. Intermediate layouts show numbers; mobile opens a two-column named menu with 46px targets. Telemetry describes navigation, not inference.

### Floating captions and Research notes

Captions are opaque obsidian plates with rules, shared corners and short factual copy. Metrics use semantic description lists with values visually above captions. Result instruments remain open rows. Qualifications remain accessible through Research notes and the complete reader.

Research notes use native `dialog.showModal()` for modal focus behavior, Escape and background inertness. The right drawer insets 16px, fills available viewport height and has a fixed header plus scrolling body. Header/body padding is 24px desktop. Heading and close control stand directly in the header: there is no field-label kicker or invented eyebrow. Clicking outside closes it. Reading mode places the same notes inline.

### Persistent world and Training Run

One R3F Canvas uses a Catmull-Rom rail. Eight lazy scenes mount current/adjacent chapters; Contact mounts only its own room. Geometry/materials dispose on unmount. Three.js uses revision 182 compatibility (the package requests ^0.182.0; the lockfile is the resolved engine authority). Original geometry, shaders and instancing supply objects; no imported GLB or external texture defines the world.

Training Run samples original separated, bevelled HB with MeshSurfaceSampler: one point, Gaussian field, three clusters, surface convergence, liquid chrome, stamp/hit-stop, one shockwave, ejection and flight through the actual B counter. Counts are 120,000 desktop/30,000 mobile. Normal choreography is 6.6 seconds with an 8-second wall timer, immediate Skip intro/Escape and a 1.2-second reduced-motion fade. Real asset progress is labelled separately from illustrative epoch/loss. The asset percentage uses three zero-padded digits and a fixed readout width. Skip intro holds a 154px width and 44px minimum height with no wrapping; stable root scrollbar gutter prevents scroll-lock shifts.

State changes invalidate demand frames. After intro, pause/reduced motion use demand rendering, hidden documents use `never`, and reduced motion settles camera/interaction states directly. Self-hosted Archivo Black 400 and IBM Plex Mono 400/500 are preloaded. Production skips synchronous renderer compiler-log queries while development retains shader diagnostics. These stability changes do not alter the art direction. DOM feedback is 160ms; chapter opacity is 280ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced-motion CSS removes transitions, probe and sheen.

### Authentic portrait and factual instruments

Contact uses the owner's portrait with offline rembg u2net_human_seg alpha matte. Baked attributes contain 45,000 desktop/12,000 mobile portrait points and the exact deterministic prefix of Training Run HB samples. One Points object performs morph, noise and bounded parallax through vertex uniforms; runtime does no image decode, 2D canvas readback or per-frame CPU attribute writes. Data preloads near Contact. Retrain replays noise-to-HB-to-person with an explicitly illustrative epoch/loss echo. Arrival lets HB rest before face resolution. Reduced motion resolves immediately; completed portrait idles with demand rendering, DPR capped at 1.25 and no bloom. Reader uses authentic photographic fallback.

CV.md is factual authority and src/content.ts centralizes copy. PRISM shows a pre-inference gate, labelled routes and difficulty/domain grid; CommerceAI shows ordered history, dot-product affinity and cache. InstaGuard's sieve/ALBERT sharing and repository-grounded Code Reviewer are distinct chapters. OmniVision shows ultrasonic/IMU/camera fusion and two-tier federation. These controls are illustrative, not live model claims. Manuscript/research-in-progress qualifications stay attached. Contact uses real mailto/copy/download links; phone stays absent from public CV and vCard.

## Do's and Don'ts

### Do:

- **Do** use warm neutral interface tokens and corresponding physical materials; reserve colour for PRISM and named risk categories.
- **Do** preserve all eight chapters, real HTML facts and controls, and the complete reader/no-WebGL alternative.
- **Do** keep floating captions free of internal scrolling; put expanded prose in Research notes or inline reader content.
- **Do** preserve the offline portrait matte, exact HB sample correspondence, bounded rendering and visitor motion controls.
- **Do** retain source qualifications, authentic assets and provenance alongside reported metrics and illustrative interactions.

### Don't:

- **Don't** inherit an earlier portfolio theme, introduce coloured atmosphere, or replace the continuous world with generic stacked card sections.
- **Don't** present stored examples, scripted visualisations or epoch/loss readouts as live inference or browser training.
- **Don't** replace readable HTML with mesh lettering, add decorative heading kickers, or auto-enable sound.
- **Don't** generalize one GPU's frame measurements into universal 60fps or physical-device compatibility claims.

This source-derived refresh is not a new visual or detector audit. `.impeccable/review/v2/finish-verdict-2.md` gives a ship disposition for three scored fixes only: mobile chrome/reflections, OmniVision framing and removed drawer eyebrows. The revision matrix reuses the v2 production capture paths. Later font-preload and asset-readout-width edits were outside that captured build and need separate measurement. No new audit, universal frame-rate result or physical-device validation is asserted here. No craft-floor defect becomes a future rule: heading kickers remain excluded, and obsolete drawer-kind CSS is not a component pattern.
