# LATENT glass revamp

Owner brief, recorded for the five-run revision. One run = one task. The current run is **Run 1: diagnosis and flight blockers only**.

## Project and constraints

Harsh Bhatt's 3D portfolio: Vite, React, TypeScript, R3F, drei, postprocessing, GSAP/Lenis and zustand. Read README.md, PRODUCT.md, DESIGN.md, TESTING.md, src/content.ts, src/World.tsx and src/scenes/ before changes. Use the installed impeccable and taste-skill skills. Use 21st.dev Magic for reskinned 2D controls if its MCP is available.

Keep content.ts as the single source of copy, reader mode and accessibility, reduced-motion support, the single persistent Canvas, the noise → structure → person loader idea and HB monogram. Replace the palette, materials, camera, scene models, animations and layout in their assigned runs.

Problems: scenes feel like flat boards viewed head-on in small windows beside text; the murky warm-grey palette looks bad; rods, boxes and animations feel generic.

## Direction: Glass laboratory

Dark ink space with glass instruments that bend light. Colour comes only from light through glass (dispersion, thin-film edges) and risk labels, with signal reserved for focus and interaction.

- Tokens in styles.css, DESIGN.md and scene constants: ink-950 `oklch(0.13 0.025 265)` background; ink-900 `oklch(0.17 0.03 265)` surfaces; ice-50 `oklch(0.97 0.01 240)` text; ice-300 `oklch(0.78 0.02 250)` muted; signal `oklch(0.72 0.19 40)` focus/interactive states only; LOW `oklch(0.8 0.15 165)`; MEDIUM `oklch(0.82 0.15 85)`; HIGH = signal. Body contrast ≥7:1. No purple-to-blue gradients, neon cyan or CSS glassmorphism card grids.
- Materials in src/materials/: GlassHeavy (drei MeshTransmissionMaterial, chromatic aberration, low resolution, few samples); GlassLite (environment reflection and fresnel, no transmission); Chrome; Obsidian; Fibre (emissive thin tubes/lines). At most three visible GlassHeavy objects. Mobile and low tier use GlassLite.
- HDR Lightformers with bright strip panels, rim lights and restrained bloom.
- True perspective flight, FOV 45–55, spline rail, look-ahead and slight roll. Foreground/midground/background objects, depth fog, optional depth of field, fly past/through objects. No flat head-on boards.
- Full-bleed scenes behind one floating caption per chapter; thin border, no blur grid or inner scrollbar. Overflow belongs in Research notes.
- Scroll-linked enter-from-depth, settle, exit-past-camera choreography; pointer parallax/tilt, glass light sweeps and portal/ring fly-through transitions without hard cuts. Respect reduced motion.

## Models

- HB and name: thick bevelled glass/chrome, real counters, clear H/B gap, no blown-out half.
- PRISM: large faceted prism; prompt beam through thin token tiles, spectrum fan onto difficulty × domain grid, routes to dark strong-model monolith or cheap node. Selected stored dataset row lights its beam. No inference.
- CommerceAI: two tall glass towers, glowing embedding strands, purchase glass cubes climbing the user tower, woven fibres, bright dot-product match, small Redis cache shelf.
- InstaGuard: glass sieve plate, instanced streaming comment cards, spam deflected/genuine passed, one reused ALBERT block showing sharing.
- Code Reviewer: instanced glass-cube repository lattice, query ray, nearest chunks lift/thread to report; unsupported flags float, grounded flags tether to chunks.
- OmniVision: glossy rover, dark reflective floor, ultrasonic expanding translucent rings, IMU heading arrow, camera/ultrasonic/IMU streams into fusion crystal. Two-tier federation exchanges orbs within robots then between robots; sealed raw-data jars. Keep BFS.
- Journey: glass ribbon falling loss curve, lens milestone nodes.
- Contact: HB particles morph into face bust; background masked, offline bake, GPU shader morph, about 28K points, no per-frame CPU buffer writes.

## Content truth

Invent nothing; retain all qualifiers.

- PRISM: DeBERTa-v3 prompt risk prediction before inference; consensus labels from GPT-4, Gemini 1.5 Pro and Claude over about 100K prompts; accuracy 81.3%, precision 0.84, recall 0.88; DARF difficulty/domain routing. Remove unsourced 12ms. Manuscript in preparation with Dr. Avani Dadhania.
- OmniVision: Raspberry Pi 4, YOLOv8, ultrasonic depth, IMU, weighted sensor fusion; two-tier federated learning; within 4.2% of centralised accuracy, 91% less transmission. Manuscript in preparation; research in progress.
- CommerceAI (2024): two-tower purchase-sequence recommender, +23% CTR over baseline, <100ms through Redis-cached embeddings.
- LLM Code Reviewer (2024): RAG, LangChain, Groq, ChromaDB; about 40% fewer hallucinated bug reports versus single-prompt review.
- InstaGuard (2023): ALBERT on 45K comments, precision 94.3%, recall 91.7%, 40% fewer parameters than comparable transformer, sub-80ms. The two 40% claims stay distinct.
- IELTS Academic May 2026: 7.5, C1. B.E. completed Jul 2026, CGPA 7.42. No phone on site or vCard.
- Interactions labelled illustrative; no live-inference presentation.

## Runs and verification

After each run, start the dev server and verify in real Playwright: console, WebGL, measured FPS and screenshots at 1440×900 and 390×844 at three scroll positions. Never claim unseen success. If images cannot be viewed, disclose and use programmatic checks. Commit at each run's end on glass-revamp.

1. **Diagnose, no redesign.** Read this brief; find why flight feels flat. Check console, WebGL context, reduced motion, pause, reader, demand/static rendering, Canvas dimensions and camera z versus scroll. Write DIAGNOSIS.md. Fix only real-time flight blockers. Show three visibly different perspective screenshots.
2. **Look system.** Palette, material library, lighting, quality tiers, full-bleed/caption layout, HUD, DESIGN.md and accessible custom controls (Magic if available).
3. **Camera/world.** Rebuild depth-flight rail, look-ahead, multi-depth placement, fog, fly-through transitions, faint monochrome ink dust with slow parallax.
4. **4a models.** Loader HB, hero name, PRISM and CommerceAI models/animation. **4b models.** InstaGuard and Code Reviewer as separate chapters, HUD 00–07, OmniVision and Journey models/animation.
5. **Portrait/content/polish.** Offline portrait/HB morph, content corrections, absolute share-card URLs, README sync, impeccable critique/polish; report FPS at 1×/4× CPU throttle and build result.

References: https://porthb.vercel.app/ and https://github.com/Harshbhatt1008/port3d. Owner CV source: `I:\Downloads\Harsh-Bhatt-CV (3).pdf`.
