# LATENT | Harsh Bhatt

A portfolio you travel through: noise becomes structure, then a person. Seven research instruments occupy one persistent WebGL world. Real project facts and accessible controls remain HTML layered over the scene.

## Run locally

Requires Node.js 22.12+ and npm. This project lives at `K:\port3d\harsh-portfolio-3d`; neither previous portfolio is a dependency.

```powershell
cd K:\port3d\harsh-portfolio-3d
npm ci
npm run dev
```

Open **http://localhost:5173**. The port is strict: an occupied port is reported rather than silently changed.

```powershell
npm run build
npm run preview
```

The production preview is **http://localhost:4173**. `dist/` is the complete static deployment output. There is no backend, API key, inference service or account requirement.

On Windows, `powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1` starts a hidden local development process. Add `-Mode preview` after building for a hidden production preview. It records the process in gitignored `.qa/`, refuses occupied ports and never stops another service.

## Inside the world

| Chapter | Set piece | Hands-on control |
| --- | --- | --- |
| Training Run | 120K GPU particles, three clusters, sampled HB, chrome stamp, counter flight | Immediate Skip intro / Escape |
| Identity | Extruded Archivo Black name, neutral moving light | Pointer lean and light |
| PRISM | Transmissive dispersive glass on an optical bench | Six curated public dataset rows route their stored risk |
| CommerceAI | Two spool towers joined by an affinity loom | Three purchase histories re-form the weave and match |
| Signal / Noise | Decision cloud and repository retrieval lattice | Drag/keyboard boundary; switch mode and retrieved context |
| OmniVision | Furnished room, procedural rover, depth scan and detection boxes | BFS navigation to plant, desk or door; federated weight exchange |
| Journey | Descending learning curve and three tool constellations | Select seven true milestones; reshape tool connections |
| Contact | Authentic portrait sampled into 60K monochrome depth points | Disperse/resolve, copy email, compose an email draft, downloads |

The loader is an illustration of training, **not browser model training**. Its asset percentage is real Drei loading progress. Project metrics are reported results; interactive recommendations, classification boundaries, retrieval, robot federation and the learning curve are illustrative. PRISM selections use existing dataset labels and perform no inference. OmniVision is research in progress. Manuscript qualifications stay visible with the projects.

## Controls and accessibility

- Scroll travels along the camera rail. The left notes column has its own native scrollbar when needed; “Scroll notes” appears only while more content remains.
- The console provides named chapter destinations, next/return, sound, motion pause and **Read instead**. The mobile chapter menu exposes the same destinations.
- `Alt+0` through `Alt+6` jump chapters while focus is outside a form control. All interactions also have native keyboard-operable HTML controls.
- Sound is off by default and uses a quiet procedural WebAudio oscillator after explicit opt-in. No audio files load.
- Reduced motion uses a 1.2-second opening fade, direct chapter poses and static scene states. Pausing stops continuous motion while preserving controls.
- Reader mode removes the Canvas and presents every chapter as normal, selectable HTML. It activates automatically on WebGL creation/context failure. Contact includes a real photo with descriptive alt text in this mode.
- Copy failure exposes a direct email link. “Draft a note” opens the visitor's configured email application; the website sends nothing.

## Structure and editing

```text
src/
  content.ts             Biography, metrics, dataset samples, journey, tools, links
  App.tsx                HTML console, chapters, forms, navigation, audio
  World.tsx              Single Canvas, camera spline, asset progress, adaptive DPR
  state.ts               Small shared Zustand store and scene contracts
  styles.css             OKLCH tokens, type, responsive layout, reader mode
  scenes/
    Training.tsx         GPU particle morph and chrome register sequence
    monogram.ts          Original extruded HB paths, with real B counters
    Hero.tsx             Subset Archivo Black 3D lettering
    Prism.tsx            Physical glass and prelabelled routing
    Loom.tsx             Cached woven threads and moving shuttles
    Signals.tsx          Point classification and retrieval geometry
    Omni.tsx             Room occupancy, shortest-path planner and rover
    Journey.tsx          Loss-curve metaphor and tool topology
    Portrait.tsx         Actual-photo sampling and luminance depth
    researchGeometry.tsx Shared rods and particle shaders
public/
  images/                Owner's AVIF, compatible WebP, provenance sidecars
  fonts/                 4.5KB decorative name glyph subset
  Harsh-Bhatt-CV.pdf      Original CV
  Harsh-Bhatt.vcf         Original contact card
  og-latent.png          Actual rendered social preview
```

Edit factual copy in **`src/content.ts`**. Keep source metrics, qualifications and manuscript status together. Add curated dataset examples only from the real public dataset, preserving labels and confidence. UI interaction instructions live next to their controls in `App.tsx`.

Tune the palette/type/spacing in `styles.css`; the authoritative rationale is in `DESIGN.md`. Tune room origins and camera damping in `World.tsx`, desktop/mobile counts and sequence beats in `Training.tsx`, and each experiment's geometry in its chapter module. Scene materials use matching warm sRGB neutrals because WebGL material values are not CSS strings. Colour is reserved for PRISM's spectrum and risk labels.

## Rendering and verification

GPU particle shaders, instancing, procedural meshes and cached geometry avoid large model downloads. Current and adjacent chapters load lazily. An adaptive DPR controller, reduced mobile counts, demand rendering when paused/reduced, and hidden-document suspension bound continuous work. Geometry and materials are disposed on unmount. The environment map is captured once; restrained bloom is disabled on mobile/lower settings.

See **[TESTING.md](TESTING.md)** for the actual browser matrix, measured frame rates, checks and remaining hardware limits. A successful build is not a claim of integrated-GPU or physical-iPhone certification. The Three engine remains a substantial first load, and first-time shader compilation can briefly reduce frame rate.

## Sources and design tooling

**[PRODUCT.md](PRODUCT.md)** records the brief and truth rules. **[DESIGN.md](DESIGN.md)** and `.impeccable/design.json` document the shipped design. **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)** records fonts, dependencies, original owner assets and ThreeUI Community research.

Impeccable and Taste Skill were used. The installed Taste package has no separate `output-skill`. 21st.dev Magic had no connected key, so the explicitly permitted handmade controls were built. ThreeUI Community was studied from an ignored local clone, with its MIT notice preserved; no paid components, template layouts or Envato assets ship. No tracking, external fonts or remote texture runtime dependency is required.

This is an independent repository. Pushing it does not modify the existing Netlify/Vercel portfolio.
