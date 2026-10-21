# LATENT | Harsh Bhatt

Noise becomes structure, then a person. Eight chapters share one persistent WebGL Canvas; factual copy and keyboard controls remain HTML. This independent Vite/React/TypeScript project does not modify either earlier portfolio.

## Run

Node.js 22.12+ and npm:

```powershell
cd K:\port3d\harsh-portfolio-3d
npm ci
npm run dev
```

Open **http://localhost:5173**. For the production build:

```powershell
npm run build
npm run preview
```

Preview runs at **http://localhost:4173**; `dist/` is deployable static output. Ports are strict. `Start-Local.ps1` starts a hidden Windows process and records it in ignored `.qa/`; it never stops another service. No backend or runtime API key is required.

## Chapters

| Chapter | Instrument | Interaction |
| --- | --- | --- |
| Training Run | 120K desktop / 30K mobile particles, projected cluster names, chrome HB, stamp and counter flight | Immediate Skip intro / Escape |
| 00 Identity | Reflected Archivo Black name beside a readable biography | Bounded pointer lean |
| 01 PRISM | Idle LLM, dispersive glass, three risk beams, difficulty/domain grid and model destinations | Six stored dataset rows; no inference |
| 02 CommerceAI | Affinity loom, ordered purchase tower, dot-product meeting and Redis shelf | Three histories reweave the match |
| 03 InstaGuard | Comment sieve and one reused ALBERT parameter block | Three illustrative comment routes |
| 04 Code Reviewer | Files become vectors; retrieved chunks thread into a report | Four repository-context choices |
| 05 OmniVision | Room, rover, ultrasonic cones, IMU heading and weighted fusion | Plain-English destinations, BFS and two-tier learning |
| 06 Journey | Descending curve and three tool constellations | Eight milestones and tool-group selection |
| 07 Contact | Exact loader HB positions morph into an offline-matted particle bust | Re-train, copy email, draft, links and downloads |

All metrics are **reported results**. PRISM and OmniVision retain **manuscript in preparation**; OmniVision is **research in progress**. Histories, routes, retrieval, sensor exchange and epoch/loss are explicitly illustrative. The website performs no model inference, training or remote code review.

## Controls and accessibility

Scroll travels along the camera rail. The console has named destinations, next/return, sound off by default, pause and **Read instead**. `Alt+0` through `Alt+7` jump chapters outside forms. Mobile has the same destinations in its chapter menu. The custom comboboxes support arrows, Home/End, typeahead, Enter and Escape.

Chapter descriptions stay visible during scrolling, beside the model on desktop and below it on mobile. Floating captions never have an internal scrollbar. **Research notes** opens a native modal drawer for full context, qualifications, stacks and the email composer. Escape closes it and returns focus. The composer opens a correctly encoded `mailto:` draft in the visitor's email application; the page sends nothing. Clipboard failure supplies a direct email link.

Reduced motion uses a short opening fade and static resolved scenes. Reader mode removes the Canvas and exposes all substantive notes as normal HTML; it also handles WebGL failure. The Contact image has meaningful alternative text in this mode. Sound uses procedural WebAudio after opt-in; no audio files load.

## Structure and content

```text
src/content.ts             Biography, project metrics, dataset rows, journey, tools, links
src/App.tsx                DOM console, captions, controls, drawers and email composer
src/World.tsx              Lazy engine, persistent Canvas, camera rail, lighting, adaptive DPR
src/state.ts               Zustand state and shared scene contracts
src/styles.css             OKLCH palette, typography, responsive layout and reader mode
src/components/            Keyboard combobox and research drawer
src/scenes/                One procedural instrument per chapter
scripts/bake-portrait.mjs  Offline matte/importance sampling and spatial HB pairing
CV.md                     Owner-supplied CV transcription, phone omitted
CONTENT_AUDIT.md           Mismatches and corrections against that source
public/                    Baked points, owner assets, redacted CV, vCard and OG image
```

Edit factual content in **`src/content.ts`**, preserving result qualifiers and source labels. Interaction instructions are beside controls in `App.tsx`. `CV.md` is transcribed from the supplied `Harsh-Bhatt-CV (3).pdf`; the phone is removed from the public PDF and vCard. The six dataset examples preserve their published wording, labels and confidence. Difficulty/domain placement is an illustration, not a new prediction.

Palette, type and motion rationale are in `DESIGN.md` and `.impeccable/design.json`. `src/sceneSettings.ts` owns one scale multiplier per chapter (0.80 for Identity, 0.82 for the other chapters), the 0.65 structural gauge and connector instance caps (128 high / 36 mobile / 24 low). Chamfered shells, turned profiles, merged wire/band geometry and instanced connectors keep detail bounded. Room fits use the fixed resting camera distance so resizing after deep navigation does not enlarge the scenes. Contact uses a fixed 4:5 portrait frame at about half the viewport height, opposite its caption. The low-contrast dust can be disabled for comparison with `?dust=off`.

## Rebuild the portrait

The shipped binaries require no Python or image decoding at runtime. To regenerate the matte, install Python 3.11+ and the isolated requirements:

```powershell
python -m venv .qa/bake-venv
.qa/bake-venv/Scripts/python.exe -m pip install -r scripts/portrait-requirements.txt
npm run bake:portrait -- --remask --debug
```

On another platform set `BAKE_PYTHON` to the Python executable. The first matte run downloads the `u2net_human_seg` model into ignored `.qa/models`; it runs locally on CPU. Existing mask/cutout files are reused without `--remask`.

The source is the owner's original 906×805 AVIF. A fixed 596×745 (4:5) face-centred crop preserves the original orientation. Alpha matting retains hair, glasses and beard edges. Re-run the bake after any image/monogram change. Edge/luminance importance sampling, percentile-normalised tone and gentle depth are baked offline. Desktop: **45,000 points**, mobile: **12,000**. `--debug` writes **portrait-debug.png** at the project root: source crop | alpha mask | flat rendering of the exact baked points, without WebGL. Portrait stride is four little-endian Float32 values (`x,y,z,tone`); HB stride is three. The deterministic shared surface stream makes each HB set an exact prefix of loader positions, then spatial sorting pairs it with the face. `portrait-meta.json` records crop, orientation, tone range, sizes and hashes.

At runtime one portrait Points object morphs/parallaxes in its vertex shader. No per-frame CPU buffer writes, image sampling or Canvas2D readback occurs. Contact disables bloom, caps DPR at 1.25, removes other chapter scenes and uses demand rendering once settled.

## Verification and limits

See **[the portrait/model repair report](docs/refinement/REPORT.md)** for the current before/after images of every chapter, frame rates, draw calls and browser checks. **[TESTING.md](TESTING.md)** retains the earlier verification history. GPU measurements on an RTX 3070 do not certify an integrated laptop or physical phone. First-time engine initialization and shader compilation remain more expensive than settled animation.

**[PRODUCT.md](PRODUCT.md)** records the brief; **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)** records sources and licences. Impeccable and Taste Skill were used. No Magic key was connected, so the owner-permitted handmade controls ship. Only ThreeUI Community techniques were studied, with attribution; no Pro or Envato assets are included. Source pushes target the authorised `Harshbhatt1008/port3d` repository, not the old site's deployment.
