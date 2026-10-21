import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  FileDown,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import World from "./World";
import {
  chapters,
  dataset,
  datasetSamples,
  histories,
  profile,
  projects,
  retrievalFiles,
  stats,
  timeline,
  toolGroups,
} from "./content";
import { useExperience } from "./state";

gsap.registerPlugin(ScrollTrigger);
export function jumpTo(index: number) {
  const s = useExperience.getState();
  if (s.introRunning) s.set({ introRunning: false, introTime: 6.6 });
  if (s.reader) {
    s.set({ chapter: index, progress: index, flying: false });
    document
      .getElementById(chapters[index].id)
      ?.scrollIntoView({ behavior: s.reduced ? "instant" : "smooth" });
    return;
  }
  const target =
    (index * (document.documentElement.scrollHeight - innerHeight)) / 6;
  if (window.__latentLenis)
    window.__latentLenis.scrollTo(target, {
      immediate: s.reduced,
      duration: 1.2,
    });
  else scrollTo({ top: target, behavior: s.reduced ? "instant" : "smooth" });
}

function useWorldNavigation() {
  const reader = useExperience((s) => s.reader),
    reduced = useExperience((s) => s.reduced),
    intro = useExperience((s) => s.introRunning);
  useEffect(() => {
    const mobile = matchMedia("(max-width: 700px)"),
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      useExperience
        .getState()
        .set({ mobile: mobile.matches, reduced: motion.matches });
    update();
    mobile.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.reader = String(reader);
    // Reader and 3D have different scroll ranges. Re-enter at a known pose.
    useExperience.getState().set({ chapter: 0, progress: 0, flying: false });
    scrollTo(0, 0);
  }, [reader]);
  useEffect(() => {
    document.documentElement.dataset.intro = String(intro);
    document.body.style.overflow = intro ? "hidden" : "";
    // Wall-clock safety is independent of GPU frame rate and shader compilation.
    const cap = intro
      ? setTimeout(
          () =>
            useExperience
              .getState()
              .set({ introRunning: false, introTime: 6.6 }),
          reduced ? 1200 : 8000,
        )
      : undefined;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        useExperience
          .getState()
          .set({ introRunning: false, introTime: 6.6, hoverLabel: "" });
      }
      if ((event.target as HTMLElement).closest("input,textarea,select,button"))
        return;
      if (event.altKey && /^[0-6]$/.test(event.key)) {
        event.preventDefault();
        jumpTo(Number(event.key));
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(cap);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
    };
  }, [intro, reduced]);
  useEffect(() => {
    if (reader) return;
    const lenis = new Lenis({
      duration: reduced ? 0 : 1.05,
      smoothWheel: !reduced,
      syncTouch: false,
      anchors: true,
    });
    window.__latentLenis = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    const scroll = ScrollTrigger.create({
      trigger: ".scroll-rail",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const progress = self.progress * 6;
        useExperience.getState().set({
          progress,
          chapter: Math.round(progress),
          flying: Math.abs(progress - Math.round(progress)) > 0.18,
        });
      },
    });
    return () => {
      scroll.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__latentLenis;
    };
  }, [reader, reduced]);
}

function useSound() {
  const sound = useExperience((s) => s.sound);
  useEffect(() => {
    if (!sound) return;
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.025;
    gain.connect(context.destination);
    const tone = context.createOscillator();
    tone.type = "sine";
    tone.frequency.value = 58;
    tone.connect(gain);
    tone.start();
    const unsubscribe = useExperience.subscribe((s) =>
      tone.frequency.setTargetAtTime(
        58 + s.progress * 8,
        context.currentTime,
        0.25,
      ),
    );
    const visibility = () => {
      if (document.hidden) void context.suspend();
      else void context.resume();
    };
    document.addEventListener("visibilitychange", visibility);
    void context.resume();
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", visibility);
      tone.stop();
      void context.close();
    };
  }, [sound]);
}

function InferenceConsole() {
  const chapter = useExperience((s) => s.chapter),
    sound = useExperience((s) => s.sound),
    paused = useExperience((s) => s.paused),
    reader = useExperience((s) => s.reader);
  const [menu, setMenu] = useState(false);
  const coords = useRef<HTMLOutputElement>(null);
  const marker = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      const c = document.querySelector<HTMLCanvasElement>(".world canvas");
      if (coords.current)
        coords.current.value = c?.dataset.coords ?? "0.00 / 0.00 / 12.00";
      const p = useExperience.getState().progress / 6;
      marker.current?.setAttribute("cx", String(4 + p * 84));
      marker.current?.setAttribute(
        "cy",
        String(30 - 23 * (1 - Math.exp(-4 * p))),
      );
    }, 150);
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="inference-console">
      <a
        href="#identity"
        className="brand"
        onClick={(e) => {
          e.preventDefault();
          jumpTo(0);
        }}
        aria-label="Harsh Bhatt, back to identity"
      >
        <svg viewBox="0 0 40 32" fill="currentColor" aria-hidden="true">
          <path d="M0 1h6v11h7V1h6v30h-6V18H6v13H0zm23 0h7c12 0 13 11 6 15 8 5 5 15-6 15h-7v-6h7c5 0 5-6 0-6h-7v-6h7c4 0 4-6 0-6h-7z" />
        </svg>
        <span>/ 26</span>
      </a>
      <nav
        className={`chapter-nav ${menu ? "is-open" : ""}`}
        aria-label="Chapters"
      >
        {chapters.map((c, i) => (
          <button
            key={c.id}
            aria-label={`Jump to ${String(i).padStart(2, "0")} ${c.name}`}
            aria-current={chapter === i ? "step" : undefined}
            onClick={() => {
              jumpTo(i);
              setMenu(false);
            }}
          >
            <span>{String(i).padStart(2, "0")}</span>
            <span className="nav-name">
              {
                [
                  "Identity",
                  "PRISM",
                  "CommerceAI",
                  "Signals",
                  "OmniVision",
                  "Journey",
                  "Contact",
                ][i]
              }
            </span>
          </button>
        ))}
      </nav>
      <div className="console-tools">
        <button
          className="icon-control"
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          aria-pressed={sound}
          onClick={() => useExperience.getState().set({ sound: !sound })}
        >
          {sound ? <Volume2 /> : <VolumeX />}
        </button>
        <button
          className="icon-control"
          aria-label={paused ? "Resume motion" : "Pause motion"}
          aria-pressed={paused}
          onClick={() => useExperience.getState().set({ paused: !paused })}
        >
          {paused ? <Play /> : <Pause />}
        </button>
        <button
          className="reader-control"
          onClick={() => {
            useExperience
              .getState()
              .set({ reader: !reader, introRunning: false });
            scrollTo(0, 0);
          }}
        >
          {reader ? "Enter 3D" : "Read instead"}
        </button>
        <button
          className="icon-control menu-control"
          aria-label={menu ? "Close chapter menu" : "Open chapter menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
      <div className="console-telemetry">
        <span>LATENT / {chapters[chapter].short}</span>
        <span className="latent-coordinates">
          XYZ <output ref={coords}>0.00 / 0.00 / 12.00</output>
        </span>
        <svg
          className="loss-spark"
          viewBox="0 0 92 36"
          aria-label="Journey progress"
        >
          <path d="M4 30Q14 9 29 9T88 7" fill="none" stroke="currentColor" />
          <circle ref={marker} cx="4" cy="30" r="2.5" fill="currentColor" />
        </svg>
        <button
          className="skip-chapter"
          onClick={() => jumpTo(chapter === 6 ? 0 : chapter + 1)}
        >
          {chapter === 6 ? "Back to identity" : "Next chapter"}{" "}
          <ArrowDown size={13} />
        </button>
      </div>
    </header>
  );
}

function TrainingReadout() {
  const intro = useExperience((s) => s.introRunning),
    reduced = useExperience((s) => s.reduced);
  const [time, setTime] = useState(0),
    [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!intro) return;
    const timer = setInterval(() => {
      const s = useExperience.getState();
      setTime(s.introTime);
      setProgress(s.assetProgress);
    }, 80);
    return () => clearInterval(timer);
  }, [intro]);
  if (!intro) return null;
  const phase =
    time < 0.9
      ? "INITIALISE"
      : time < 2.25
        ? "GAUSSIAN FIELD"
        : time < 3.8
          ? "CONVERGENCE"
          : time < 4.7
            ? "SURFACE FOUND"
            : time < 5.1
              ? "REGISTER"
              : "ENTER LATENT";
  return (
    <div
      className={`training-overlay ${reduced ? "is-reduced" : ""}`}
      data-testid="training"
      data-phase={phase}
      data-time={time.toFixed(2)}
    >
      <span className="training-title">HB / THE TRAINING RUN</span>
      <button
        className="skip-intro"
        onClick={() =>
          useExperience.getState().set({ introRunning: false, introTime: 6.6 })
        }
      >
        Skip intro <ArrowRight size={16} />
      </button>
      {time > 0.9 && time < 3.2 && !reduced && (
        <div className="cluster-labels">
          <span>Language</span>
          <span>Learning</span>
          <span>The physical world</span>
        </div>
      )}
      <div className="training-readout">
        <p>
          epoch{" "}
          {String(Math.min(256, Math.floor((time / 6.6) * 256))).padStart(
            3,
            "0",
          )}{" "}
          / loss {(2.3026 * Math.exp(-time * 0.53)).toFixed(4)}
        </p>
        <div className="training-track">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <p className="training-meta">
          {phase} <span>ASSETS {Math.round(progress)}%</span>
        </p>
        <p className="training-note">
          Illustrative training sequence. Real asset progress.
        </p>
      </div>
    </div>
  );
}

function Metrics({ items }: { items: string[][] }) {
  return (
    <dl className="metrics">
      {items.map(([value, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function Stack({ items }: { items: string[] }) {
  return <p className="stack">{items.join(" / ")}</p>;
}
function Note({ children }: { children: ReactNode }) {
  return <p className="honesty-note">{children}</p>;
}
function Chapter({ index, children }: { index: number; children: ReactNode }) {
  const column = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const active = useExperience((s) => s.chapter === index),
    intro = useExperience((s) => s.introRunning),
    flying = useExperience((s) => s.flying),
    reader = useExperience((s) => s.reader);
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    const sync = () => {
      if (hint.current)
        hint.current.hidden =
          reader || el.scrollHeight - el.scrollTop - el.clientHeight < 16;
    };
    const resize = new ResizeObserver(sync);
    resize.observe(el);
    const changes = new MutationObserver(sync);
    changes.observe(el, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    el.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => {
      resize.disconnect();
      changes.disconnect();
      el.removeEventListener("scroll", sync);
    };
  }, [active, reader, intro]);
  return (
    <section
      id={chapters[index].id}
      className={`chapter chapter-${index}`}
      data-active={(active && !intro && !flying) || reader}
      inert={!reader && (!active || intro || flying)}
      aria-labelledby={`title-${index}`}
    >
      <div className="chapter-copy" ref={column}>
        {index === 0 ? (
          <>
            <h1 id="title-0">
              Harsh <br />
              Bhatt.
            </h1>
            <p className="hero-role">
              {profile.role}
              <br />
              {profile.location}
            </p>
            <p className="chapter-deck">{profile.tagline}</p>
          </>
        ) : (
          <>
            <h2 id={`title-${index}`}>{chapters[index].name}</h2>
            <p className="chapter-deck">{chapters[index].description}</p>
          </>
        )}
        {children}
      </div>
      <p className="notes-scroll-hint" ref={hint} hidden>
        Scroll notes <ArrowDown size={12} />
      </p>
    </section>
  );
}

function Identity() {
  return (
    <Chapter index={0}>
      <div className="chapter-controls identity-controls">
        <button className="primary" onClick={() => jumpTo(1)}>
          Enter the work <ArrowRight size={18} />
        </button>
        <p className="scene-hint">
          Scroll to fly. Move the light with your pointer.
        </p>
        <Note>
          A continuous collection of research and applied AI. Interactive scenes
          are illustrative. Reported results stay attached to the work.
        </Note>
      </div>
    </Chapter>
  );
}

function PrismChapter() {
  const index = useExperience((s) => s.sampleIndex),
    sample = datasetSamples[index];
  return (
    <Chapter index={1}>
      <div className="chapter-controls">
        <Metrics items={projects.prism.metrics} />
        <label className="field-label" htmlFor="prompt-choice">
          Route a labelled prompt
        </label>
        <select
          id="prompt-choice"
          value={index}
          onChange={(e) =>
            useExperience
              .getState()
              .set({ sampleIndex: Number(e.target.value) })
          }
        >
          {datasetSamples.map((s, i) => (
            <option key={s.row} value={i}>
              {String(i + 1).padStart(2, "0")} / {s.prompt}
            </option>
          ))}
        </select>
        <div className="prompt-result" aria-live="polite">
          <span className={`risk risk-${sample.risk.toLowerCase()}`}>
            {sample.risk}
          </span>
          <span>Dataset label / {sample.confidence}% confidence</span>
        </div>
        <p className="prompt-preview">“{sample.prompt}”</p>
        <Stack items={projects.prism.stack} />
        <div className="link-row">
          <a href={dataset.url} target="_blank" rel="noreferrer">
            {dataset.count} prompts <ArrowUpRight size={14} />
          </a>
          <a href={projects.prism.repository} target="_blank" rel="noreferrer">
            Repository <ArrowUpRight size={14} />
          </a>
        </div>
        <details>
          <summary>
            Research notes <ChevronDown size={14} />
          </summary>
          <p>{projects.prism.description}</p>
          <p>{dataset.note}</p>
        </details>
        <Note>
          {projects.prism.note} Prelabelled examples; no live inference.
        </Note>
      </div>
    </Chapter>
  );
}
function CommerceChapter() {
  const index = useExperience((s) => s.historyIndex);
  return (
    <Chapter index={2}>
      <div className="chapter-controls">
        <Metrics items={projects.commerce.metrics} />
        <fieldset className="history-field">
          <legend>Choose a purchase history</legend>
          <div className="choice-row">
            {histories.map((h, i) => (
              <button
                key={h.name}
                aria-pressed={index === i}
                onClick={() =>
                  useExperience.getState().set({ historyIndex: i })
                }
              >
                {h.name}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="history-sequence">{histories[index].items.join(" → ")}</p>
        <div className="recommendation" aria-live="polite">
          <span>Woven match</span>
          <strong>{histories[index].match}</strong>
          <ArrowUpRight size={22} />
        </div>
        <Stack items={projects.commerce.stack} />
        <details>
          <summary>
            Inside the two towers <ChevronDown size={14} />
          </summary>
          <p>{projects.commerce.description}</p>
        </details>
        <Note>{projects.commerce.note}</Note>
      </div>
    </Chapter>
  );
}
function SignalsChapter() {
  const mode = useExperience((s) => s.signalMode),
    boundary = useExperience((s) => s.boundary),
    file = useExperience((s) => s.fileIndex);
  const project = mode === "guard" ? projects.guard : projects.review;
  return (
    <Chapter index={3}>
      <div className="chapter-controls">
        <div className="choice-row" role="group" aria-label="Signal experiment">
          <button
            aria-pressed={mode === "guard"}
            onClick={() =>
              useExperience.getState().set({ signalMode: "guard" })
            }
          >
            InstaGuard
          </button>
          <button
            aria-pressed={mode === "review"}
            onClick={() =>
              useExperience.getState().set({ signalMode: "review" })
            }
          >
            Code Reviewer
          </button>
        </div>
        <Metrics items={project.metrics} />
        {mode === "guard" ? (
          <>
            <label className="field-label" htmlFor="boundary">
              Move the decision boundary
            </label>
            <input
              id="boundary"
              aria-label="Decision boundary"
              type="range"
              min="0"
              max="1"
              step=".01"
              value={boundary}
              onChange={(e) =>
                useExperience
                  .getState()
                  .set({ boundary: Number(e.target.value) })
              }
            />
            <p className="scene-hint">
              Drag the plane, or move this control. Watch what crosses it.
            </p>
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="retrieve">
              Retrieve repository context
            </label>
            <select
              id="retrieve"
              value={file}
              onChange={(e) =>
                useExperience
                  .getState()
                  .set({ fileIndex: Number(e.target.value) })
              }
            >
              {retrievalFiles.map((f, i) => (
                <option key={f.name} value={i}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="scene-hint" aria-live="polite">
              {retrievalFiles[file].role}: {retrievalFiles[file].description}
            </p>
          </>
        )}
        <Stack items={project.stack} />
        <details>
          <summary>
            Method & reported results <ChevronDown size={14} />
          </summary>
          <p>{project.description}</p>
        </details>
        <Note>{project.note}</Note>
      </div>
    </Chapter>
  );
}
function OmniChapter() {
  const goal = useExperience((s) => s.goal),
    status = useExperience((s) => s.robotStatus),
    fed = useExperience((s) => s.fedAvg);
  return (
    <Chapter index={4}>
      <div className="chapter-controls">
        <p className="research-status">Research in progress</p>
        <Metrics items={projects.omni.metrics} />
        <label className="field-label" htmlFor="destination">
          Tell the robot where
        </label>
        <div className="destination-row">
          <select
            id="destination"
            value={goal}
            onChange={(e) =>
              useExperience
                .getState()
                .set({ goal: e.target.value as typeof goal })
            }
          >
            <option value="plant">Go to the plant</option>
            <option value="desk">Go to the desk</option>
            <option value="door">Go to the door</option>
          </select>
          <button
            className="primary"
            onClick={() =>
              useExperience.getState().set({
                robotRun: useExperience.getState().robotRun + 1,
                fedAvg: false,
              })
            }
          >
            Plan & go <ArrowRight size={16} />
          </button>
        </div>
        <p className="robot-status" role="status">
          {status}
        </p>
        <button
          className="fed-control"
          aria-pressed={fed}
          onClick={() => useExperience.getState().set({ fedAvg: !fed })}
        >
          {fed ? "Return to navigation" : "Explore weight exchange"}{" "}
          <ArrowRight size={14} />
        </button>
        <Stack items={projects.omni.stack} />
        <details>
          <summary>
            How the real system works <ChevronDown size={14} />
          </summary>
          <p>{projects.omni.description}</p>
        </details>
        <Note>{projects.omni.note}</Note>
      </div>
    </Chapter>
  );
}
function JourneyChapter() {
  const node = useExperience((s) => s.nodeIndex),
    tool = useExperience((s) => s.toolIndex);
  return (
    <Chapter index={5}>
      <div className="chapter-controls journey-controls">
        <div className="journey-selector">
          <label htmlFor="journey-node">Follow a point on the curve</label>
          <select
            id="journey-node"
            value={node}
            onChange={(e) =>
              useExperience
                .getState()
                .set({ nodeIndex: Number(e.target.value) })
            }
          >
            {timeline.map((n, i) => (
              <option key={n.title} value={i}>
                {n.year} / {n.title}
              </option>
            ))}
          </select>
        </div>
        <div className="journey-detail" aria-live="polite">
          <span>{timeline[node].year}</span>
          <h3>{timeline[node].title}</h3>
          <p>{timeline[node].place}</p>
          <p>{timeline[node].detail}</p>
        </div>
        <div
          className="tool-tabs"
          role="group"
          aria-label="Tool constellations"
        >
          {toolGroups.map((g, i) => (
            <button
              key={g.name}
              aria-pressed={tool === i}
              onPointerEnter={() =>
                useExperience.getState().set({ toolIndex: i })
              }
              onFocus={() => useExperience.getState().set({ toolIndex: i })}
              onClick={() => useExperience.getState().set({ toolIndex: i })}
            >
              {g.name}
            </button>
          ))}
        </div>
        <p className="tool-list" aria-live="polite">
          {toolGroups[tool].tools.join(" / ")}
        </p>
        <details className="full-journey">
          <summary>
            Read the full journey <ChevronDown size={14} />
          </summary>
          <dl className="personal-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <ol>
            {timeline.map((n) => (
              <li key={n.title}>
                <span>{n.year}</span>
                <h3>{n.title}</h3>
                <p>
                  {n.place}. {n.detail}
                </p>
              </li>
            ))}
          </ol>
          <p>Languages: {profile.languages.join(" / ")}.</p>
        </details>
        <Note>
          The curve is an illustrative learning metaphor. Education and project
          details are from my CV; no loss values represent a training benchmark.
        </Note>
      </div>
    </Chapter>
  );
}
function ContactChapter() {
  const [copied, setCopied] = useState(false),
    [copyFailed, setCopyFailed] = useState(false),
    [compose, setCompose] = useState(false),
    [message, setMessage] = useState("");
  const resolved = useExperience((s) => s.portraitResolved);
  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true);
    }
  }
  function draft(e: FormEvent) {
    e.preventDefault();
    location.href = `mailto:${profile.email}?subject=${encodeURIComponent("A note from LATENT")}&body=${encodeURIComponent(message)}`;
  }
  return (
    <Chapter index={6}>
      <div className="chapter-controls">
        <p className="closing-line">{profile.closing}</p>
        <button className="liquid-button" onClick={copy}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span>{copied ? "Email copied" : profile.email}</span>
          <ArrowUpRight size={16} />
        </button>
        <p className="copy-status" role="status">
          {copyFailed ? (
            <>
              Copy is unavailable.{" "}
              <a href={`mailto:${profile.email}`}>Email directly</a>.
            </>
          ) : copied ? (
            "Ready when you are."
          ) : (
            ""
          )}
        </p>
        <div className="link-row contact-links">
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={14} />
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </a>
          <a href={profile.cv} download>
            CV <FileDown size={14} />
          </a>
          <a href={profile.vcard} download>
            vCard <ArrowDown size={14} />
          </a>
        </div>
        <button
          className="text-control"
          aria-expanded={compose}
          onClick={() => setCompose(!compose)}
        >
          Draft a note <ArrowRight size={14} />
        </button>
        {compose && (
          <form className="contact-composer" onSubmit={draft}>
            <label htmlFor="contact-message">Your message</label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              placeholder="What are you working on?"
            />
            <button className="primary" type="submit">
              Open email draft <ArrowUpRight size={16} />
            </button>
            <Note>Opens your email app. Nothing is sent from this page.</Note>
          </form>
        )}
        <button
          className="text-control portrait-control"
          aria-pressed={!resolved}
          onClick={() =>
            useExperience.getState().set({ portraitResolved: !resolved })
          }
        >
          {resolved ? "Disperse the portrait" : "Resolve the portrait"}{" "}
          <RotateCcw size={14} />
        </button>
        <img
          className="portrait-fallback"
          src={profile.portrait}
          width="906"
          height="805"
          alt="Harsh Bhatt smiling, wearing glasses, with a green hill behind him"
        />
        <span className="sr-only">
          The 3D portrait uses Harsh’s own photo, sampled into monochrome
          points.
        </span>
        <Note>
          {profile.location} / {profile.languages.join(" · ")}
        </Note>
      </div>
    </Chapter>
  );
}

function Probe() {
  const label = useExperience((s) => s.hoverLabel),
    mobile = useExperience((s) => s.mobile),
    reader = useExperience((s) => s.reader);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current)
        ref.current.style.transform = `translate3d(${e.clientX + 18}px,${e.clientY + 18}px,0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return !mobile && !reader ? (
    <div ref={ref} className="probe" data-visible={!!label} aria-hidden="true">
      <span />
      {label}
    </div>
  ) : null;
}

export default function App() {
  useWorldNavigation();
  useSound();
  const intro = useExperience((s) => s.introRunning),
    reader = useExperience((s) => s.reader);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={() =>
          useExperience.getState().set({ introRunning: false, introTime: 6.6 })
        }
      >
        Skip to portfolio content
      </a>
      <World />
      <InferenceConsole />
      <main id="main-content" tabIndex={-1}>
        <div className="scroll-rail" aria-hidden="true">
          {chapters.map((c) => (
            <div key={c.id} className="rail-anchor" />
          ))}
        </div>
        <div className={`chapter-overlays ${reader ? "reader-layout" : ""}`}>
          <Identity />
          <PrismChapter />
          <CommerceChapter />
          <SignalsChapter />
          <OmniChapter />
          <JourneyChapter />
          <ContactChapter />
        </div>
      </main>
      <div className="world-caption" aria-hidden="true">
        {intro ? "" : "NOISE → STRUCTURE → A PERSON"}
      </div>
      <Probe />
      <TrainingReadout />
    </>
  );
}
