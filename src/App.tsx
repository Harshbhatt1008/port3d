import {
  lazy,
  Suspense,
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
  Copy,
  FileDown,
  Menu,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
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
import { Choice } from "./components/Choice";
import { ResearchDrawer } from "./components/ResearchDrawer";

gsap.registerPlugin(ScrollTrigger);
// Paint the DOM/Skip control before downloading and initializing WebGL.
const World = lazy(() => import("./World"));
const LAST = chapters.length - 1;
const navigationNames = [
  "Identity",
  "PRISM",
  "CommerceAI",
  "InstaGuard",
  "Reviewer",
  "OmniVision",
  "Journey",
  "Contact",
];
export function jumpTo(index: number) {
  const s = useExperience.getState();
  s.set({
    introRunning: false,
    introTime: 6.6,
    notesOpen: false,
    hoverLabel: "",
  });
  if (s.reader) {
    s.set({ chapter: index, progress: index, flying: false });
    document
      .getElementById(chapters[index].id)
      ?.scrollIntoView({ behavior: s.reduced ? "instant" : "smooth" });
    return;
  }
  const target =
    (index * (document.documentElement.scrollHeight - innerHeight)) / LAST;
  if (window.__latentLenis)
    window.__latentLenis.scrollTo(target, {
      immediate: s.reduced,
      duration: 1.15,
    });
  else scrollTo({ top: target, behavior: s.reduced ? "instant" : "smooth" });
}
function useNavigation() {
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
    useExperience.getState().set({ chapter: 0, progress: 0, flying: false });
    scrollTo(0, 0);
  }, [reader]);
  useEffect(() => {
    document.documentElement.dataset.intro = String(intro);
    document.body.style.overflow = intro ? "hidden" : "";
    const cap = intro
      ? setTimeout(
          () =>
            useExperience
              .getState()
              .set({ introRunning: false, introTime: 6.6 }),
          reduced ? 1200 : 8000,
        )
      : undefined;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useExperience.getState().introRunning)
        useExperience.getState().set({ introRunning: false, introTime: 6.6 });
      if (
        e.altKey &&
        /^[0-7]$/.test(e.key) &&
        !(e.target as HTMLElement).closest("input,textarea")
      ) {
        e.preventDefault();
        jumpTo(Number(e.key));
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
        const progress = self.progress * LAST;
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
    const audio = new AudioContext(),
      gain = audio.createGain(),
      tone = audio.createOscillator();
    gain.gain.value = 0.025;
    gain.connect(audio.destination);
    tone.type = "sine";
    tone.frequency.value = 58;
    tone.connect(gain);
    tone.start();
    const unsubscribe = useExperience.subscribe((s) =>
      tone.frequency.setTargetAtTime(
        58 + s.progress * 8,
        audio.currentTime,
        0.25,
      ),
    );
    const visibility = () => {
      if (document.hidden) void audio.suspend();
      else void audio.resume();
    };
    document.addEventListener("visibilitychange", visibility);
    void audio.resume();
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", visibility);
      tone.stop();
      void audio.close();
    };
  }, [sound]);
}
function InferenceConsole() {
  const chapter = useExperience((s) => s.chapter),
    sound = useExperience((s) => s.sound),
    paused = useExperience((s) => s.paused),
    reader = useExperience((s) => s.reader);
  const [menu, setMenu] = useState(false);
  const coords = useRef<HTMLOutputElement>(null),
    marker = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const id = setInterval(() => {
      const s = useExperience.getState();
      if (coords.current)
        coords.current.value = reader
          ? "READING VIEW"
          : (document.querySelector<HTMLCanvasElement>(".world canvas")?.dataset
              .coords ?? "0.00 / 0.00 / 12.00");
      marker.current?.setAttribute("cx", String(4 + (s.progress / LAST) * 84));
      marker.current?.setAttribute(
        "cy",
        String(30 - 23 * (1 - Math.exp((-4 * s.progress) / LAST))),
      );
    }, 150);
    return () => clearInterval(id);
  }, [reader]);
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
            <span className="nav-name">{navigationNames[i]}</span>
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
          onClick={() =>
            useExperience
              .getState()
              .set({ reader: !reader, introRunning: false, notesOpen: false })
          }
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
          onClick={() => jumpTo(chapter === LAST ? 0 : chapter + 1)}
        >
          {chapter === LAST ? "Back to identity" : "Next chapter"}
          <ArrowDown size={13} />
        </button>
      </div>
    </header>
  );
}
function TrainingReadout() {
  const intro = useExperience((s) => s.introRunning),
    reduced = useExperience((s) => s.reduced);
  const [state, setState] = useState({ time: 0, progress: 0 });
  useEffect(() => {
    if (!intro) return;
    const id = setInterval(() => {
      const s = useExperience.getState();
      setState({ time: s.introTime, progress: s.assetProgress });
    }, 60);
    return () => clearInterval(id);
  }, [intro]);
  if (!intro) return null;
  const t = state.time,
    phase =
      t < 0.9
        ? "INITIALISE"
        : t < 2.25
          ? "GAUSSIAN FIELD"
          : t < 3.8
            ? "CONVERGENCE"
            : t < 4.65
              ? "SURFACE FOUND"
              : t < 5.1
                ? "REGISTER / HOLD"
                : "ENTER LATENT";
  return (
    <div
      className={`training-overlay ${reduced ? "is-reduced" : ""}`}
      data-testid="training"
      data-time={t.toFixed(2)}
      data-phase={phase}
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
      <div
        className="cluster-labels"
        aria-hidden="true"
        data-visible={t > 0.9 && t < 3.2 && !reduced}
      >
        {["Language", "Learning", "The physical world"].map((label, i) => (
          <span id={`cluster-label-${i}`} key={label}>
            {label}
          </span>
        ))}
      </div>
      <div className="training-readout">
        <p>
          epoch{" "}
          {String(Math.min(256, Math.floor((t / 6.6) * 256))).padStart(3, "0")}{" "}
          / loss {(2.3026 * Math.exp(-t * 0.53)).toFixed(4)}
        </p>
        <div className="training-track">
          <span style={{ transform: `scaleX(${state.progress / 100})` }} />
        </div>
        <p className="training-meta">
          {phase}
          <span>
            ASSETS {String(Math.round(state.progress)).padStart(3, "0")}%
          </span>
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
function Note({ children }: { children: ReactNode }) {
  return <p className="honesty-note">{children}</p>;
}
function Stack({ items }: { items: string[] }) {
  return <p className="stack">{items.join(" / ")}</p>;
}
function NotesButton() {
  return (
    <button
      className="notes-button"
      onClick={() => useExperience.getState().set({ notesOpen: true })}
    >
      Research notes <Plus size={16} />
    </button>
  );
}
function Chapter({ index, children }: { index: number; children: ReactNode }) {
  const active = useExperience((s) => s.chapter === index),
    intro = useExperience((s) => s.introRunning),
    reader = useExperience((s) => s.reader);
  return (
    <section
      id={chapters[index].id}
      className={`chapter chapter-${index}`}
      data-active={(active && !intro) || reader}
      inert={!reader && (!active || intro)}
      aria-labelledby={`title-${index}`}
    >
      <div className="caption-card">
        {index === 0 ? (
          <>
            <h1 id="title-0" className="hero-hidden-title">
              Harsh Bhatt.
            </h1>
            <p className="hero-role">
              {profile.role}
              <span>{profile.location}</span>
            </p>
            <p className="chapter-deck hero-tagline">{profile.tagline}</p>
          </>
        ) : (
          <>
            <h2 id={`title-${index}`}>{chapters[index].name}</h2>
            <p className="chapter-deck">{chapters[index].caption}</p>
          </>
        )}
        {children}
        {reader && (
          <div className="inline-research">
            <NotesContent index={index} />
          </div>
        )}
      </div>
    </section>
  );
}
function Identity() {
  return (
    <Chapter index={0}>
      <div className="caption-actions">
        <button className="primary" onClick={() => jumpTo(1)}>
          Enter the work <ArrowRight size={17} />
        </button>
        <NotesButton />
      </div>
      <p className="scene-hint">
        Scroll to fly. Move the light with your pointer.
      </p>
    </Chapter>
  );
}
function PrismChapter() {
  const index = useExperience((s) => s.sampleIndex),
    sample = datasetSamples[index];
  return (
    <Chapter index={1}>
      <Metrics items={projects.prism.metrics} />
      <Choice
        label="Route a labelled prompt"
        value={String(index)}
        options={datasetSamples.map((s, i) => ({
          value: String(i),
          label: `${String(i + 1).padStart(2, "0")} / ${s.prompt}`,
          description: `${s.risk} · stored dataset label`,
        }))}
        onChange={(v) =>
          useExperience.getState().set({ sampleIndex: Number(v) })
        }
      />
      <div className="prompt-result" aria-live="polite">
        <span className={`risk risk-${sample.risk.toLowerCase()}`}>
          {sample.risk}
        </span>
        <span>Stored label / {sample.confidence}% confidence</span>
      </div>
      <div className="caption-footer">
        <span>Reported results. Manuscript in preparation.</span>
        <NotesButton />
      </div>
    </Chapter>
  );
}
function CommerceChapter() {
  const index = useExperience((s) => s.historyIndex);
  return (
    <Chapter index={2}>
      <Metrics items={projects.commerce.metrics} />
      <div className="choice-row" role="group" aria-label="Purchase history">
        {histories.map((h, i) => (
          <button
            key={h.name}
            aria-pressed={index === i}
            onClick={() => useExperience.getState().set({ historyIndex: i })}
          >
            {h.name}
          </button>
        ))}
      </div>
      <p className="recommendation" aria-live="polite">
        <span>Woven match</span>
        <strong>{histories[index].match}</strong>
      </p>
      <div className="caption-footer">
        <span>Illustrative histories. Reported results.</span>
        <NotesButton />
      </div>
    </Chapter>
  );
}
const commentChoices = [
  {
    label: "A useful comment",
    value: "0",
    description: "Illustrative, grounded conversation",
  },
  {
    label: "A repeated promotion",
    value: "1",
    description: "Illustrative, unwanted comment",
  },
  {
    label: "A meaningful question",
    value: "2",
    description: "Illustrative, useful conversation",
  },
];
function GuardChapter() {
  const choice = useExperience((s) => s.guardSample);
  return (
    <Chapter index={3}>
      <Metrics items={projects.guard.metrics.slice(0, 3)} />
      <Choice
        label="Send a comment through the sieve"
        value={String(choice)}
        options={commentChoices}
        onChange={(v) =>
          useExperience.getState().set({ guardSample: Number(v) })
        }
      />
      <div className="caption-footer">
        <span>Reported results. Illustrative comment routes.</span>
        <NotesButton />
      </div>
      <p className="selection-result" role="status">
        {choice === 1
          ? "Illustrative route: unwanted comment"
          : "Illustrative route: useful conversation"}
      </p>
    </Chapter>
  );
}
function ReviewerChapter() {
  const file = useExperience((s) => s.fileIndex);
  return (
    <Chapter index={4}>
      <Metrics items={projects.review.metrics} />
      <Choice
        label="Retrieve repository context"
        value={String(file)}
        options={retrievalFiles.map((f, i) => ({
          value: String(i),
          label: f.name,
          description: f.role,
        }))}
        onChange={(v) => useExperience.getState().set({ fileIndex: Number(v) })}
      />
      <div className="caption-footer">
        <span>Versus single-prompt review. No live inference.</span>
        <NotesButton />
      </div>
      <p className="selection-result" role="status">
        {retrievalFiles[file].description}
      </p>
    </Chapter>
  );
}
function OmniChapter() {
  const fed = useExperience((s) => s.fedAvg),
    status = useExperience((s) => s.robotStatus);
  const [command, setCommand] = useState("Go to the plant"),
    [error, setError] = useState("");
  function run(e: FormEvent) {
    e.preventDefault();
    const goal = (["plant", "desk", "door"] as const).find((g) =>
      new RegExp(`\\b${g}\\b`, "i").test(command),
    );
    if (!goal) {
      setError("Try ‘Go to the plant’, ‘desk’ or ‘door’.");
      return;
    }
    setError("");
    useExperience.getState().set({
      goal,
      robotRun: useExperience.getState().robotRun + 1,
      fedAvg: false,
    });
  }
  return (
    <Chapter index={5}>
      <Metrics items={projects.omni.metrics} />
      <form className="command-form" onSubmit={run}>
        <label htmlFor="robot-command">Tell the robot where</label>
        <div>
          <input
            id="robot-command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="robot-status"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="primary" type="submit" aria-label="Plan and go">
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
      <p id="robot-status" className="robot-status" role="status">
        {error || status}
      </p>
      <div className="caption-actions">
        <button
          className="text-control"
          aria-pressed={fed}
          onClick={() => useExperience.getState().set({ fedAvg: !fed })}
        >
          {fed ? "Return to navigation" : "Two-tier learning"}
          <ArrowRight size={15} />
        </button>
        <NotesButton />
      </div>
      <p className="caption-qualifier">
        Research in progress. Manuscript in preparation.
      </p>
    </Chapter>
  );
}
function JourneyChapter() {
  const node = useExperience((s) => s.nodeIndex),
    tool = useExperience((s) => s.toolIndex);
  return (
    <Chapter index={6}>
      <Choice
        label="Follow a point on the curve"
        value={String(node)}
        options={timeline.map((n, i) => ({
          value: String(i),
          label: n.title,
          description: n.year,
        }))}
        onChange={(v) => useExperience.getState().set({ nodeIndex: Number(v) })}
      />
      <p className="journey-detail" aria-live="polite">
        <strong>{timeline[node].year}</strong>
        {timeline[node].detail}
      </p>
      <div className="tool-tabs" role="group" aria-label="Tool constellations">
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
      <div className="caption-footer">
        <span>Completed Jul 2026 · IELTS 7.5 / C1</span>
        <NotesButton />
      </div>
    </Chapter>
  );
}
function PortraitReadout() {
  const output = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    const tick = () => {
      const c = document.querySelector<HTMLCanvasElement>(".world canvas");
      const t = Number(c?.dataset.portraitTime ?? 0);
      if (output.current)
        output.current.value = `epoch ${String(Math.min(256, Math.floor((t / 4.4) * 256))).padStart(3, "0")} / loss ${(2.3026 * Math.exp(-t * 0.82)).toFixed(4)}`;
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, []);
  return (
    <output
      ref={output}
      className="portrait-readout"
      aria-label="Illustrative portrait training readout"
    >
      epoch 000 / loss 2.3026
    </output>
  );
}
function ContactChapter() {
  const reader = useExperience((s) => s.reader);
  const [copied, setCopied] = useState(false),
    [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyFailed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true);
    }
  }
  return (
    <Chapter index={7}>
      <p className="closing-line">{profile.closing}</p>
      <PortraitReadout />
      <span className="sequence-note">Illustrative sequence</span>
      <button
        className="liquid-button"
        onClick={copy}
        aria-label="Copy email address"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        <span>{copied ? "Email copied" : profile.email}</span>
      </button>
      <p className="copy-status" role="status">
        {copyFailed ? (
          <a href={`mailto:${profile.email}`}>
            Copy unavailable. Email directly.
          </a>
        ) : copied ? (
          "Ready when you are."
        ) : (
          ""
        )}
      </p>
      <div className="contact-links">
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
          <ArrowUpRight size={13} />
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub
          <ArrowUpRight size={13} />
        </a>
        <a href={profile.cv} download>
          CV
          <FileDown size={13} />
        </a>
        <a href={profile.vcard} download>
          vCard
          <ArrowDown size={13} />
        </a>
      </div>
      <div className="caption-actions">
        <button
          className="text-control"
          onClick={() =>
            useExperience
              .getState()
              .set({ portraitRun: useExperience.getState().portraitRun + 1 })
          }
        >
          Re-train
          <RotateCcw size={15} />
        </button>
        <NotesButton />
      </div>
      {reader && (
        <img
          className="portrait-fallback"
          src="/images/portrait-cutout.png"
          alt="Harsh Bhatt smiling, wearing glasses"
          width="906"
          height="805"
        />
      )}
    </Chapter>
  );
}
function ContactComposer() {
  const [message, setMessage] = useState("");
  function draft(e: FormEvent) {
    e.preventDefault();
    location.href = `mailto:${profile.email}?subject=${encodeURIComponent("A note from LATENT")}&body=${encodeURIComponent(message)}`;
  }
  return (
    <form className="contact-composer" onSubmit={draft}>
      <h3>Draft a note</h3>
      <label htmlFor="contact-message">Your message</label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={5}
        placeholder="What are you working on?"
      />
      <button className="primary" type="submit">
        Open email draft
        <ArrowUpRight size={16} />
      </button>
      <Note>Opens your email app. Nothing is sent from this page.</Note>
    </form>
  );
}
function NotesContent({ index }: { index: number }) {
  const sampleIndex = useExperience((s) => s.sampleIndex);
  if (index === 0)
    return (
      <>
        <h3>Language. Learning. The physical world.</h3>
        <p>{chapters[0].description}</p>
        <Metrics items={stats.map((s) => [s.value, s.label])} />
        <p>
          {profile.location}. English (IELTS7.5, CEFR C1), Hindi and Gujarati.
        </p>
        <Note>
          The scenes are illustrative. Model and project figures are reported
          results, not live inference or training.
        </Note>
      </>
    );
  if (index === 1)
    return (
      <>
        <h3>{projects.prism.subtitle}</h3>
        <p>{projects.prism.description}</p>
        <Metrics items={projects.prism.metrics} />
        <blockquote>{datasetSamples[sampleIndex].prompt}</blockquote>
        <p>
          The unlit LLM is never asked to generate an answer here. Selecting a
          dataset row highlights its existing label. Difficulty/domain positions
          and model destinations illustrate DARF; they are not new predictions.
        </p>
        <Stack items={projects.prism.stack} />
        <div className="link-row">
          <a href={dataset.url} target="_blank" rel="noreferrer">
            {dataset.count} prompts
            <ArrowUpRight size={15} />
          </a>
          <a href={projects.prism.repository} target="_blank" rel="noreferrer">
            PRISM repository
            <ArrowUpRight size={15} />
          </a>
        </div>
        <Note>
          {projects.prism.note} {dataset.note}
        </Note>
      </>
    );
  if (index === 2)
    return (
      <>
        <h3>{projects.commerce.subtitle}</h3>
        <p>{projects.commerce.description}</p>
        <p>
          Ordered purchases enter the user tower. The two vectors meet at a dot
          product; a Redis shelf holds cached embeddings. The loom and the three
          history/match examples are illustrative.
        </p>
        <Metrics items={projects.commerce.metrics} />
        <ol>
          {histories.map((h) => (
            <li key={h.name}>
              <strong>{h.name}</strong>
              <p>
                {h.items.join(" → ")} / {h.match}
              </p>
            </li>
          ))}
        </ol>
        <Stack items={projects.commerce.stack} />
        <Note>{projects.commerce.note}</Note>
      </>
    );
  if (index === 3)
    return (
      <>
        <h3>{projects.guard.subtitle}</h3>
        <p>{projects.guard.description}</p>
        <Metrics items={projects.guard.metrics} />
        <p>
          A single ALBERT parameter block is reused across the sieve's
          processing stages. The few hand-authored comment examples only
          demonstrate filtering; their labels are illustrative.
        </p>
        <Stack items={projects.guard.stack} />
        <Note>{projects.guard.note}</Note>
      </>
    );
  if (index === 4)
    return (
      <>
        <h3>{projects.review.subtitle}</h3>
        <p>{projects.review.description}</p>
        <Metrics items={projects.review.metrics} />
        <p>
          Files become vectors, a query retrieves code chunks, and supported
          flags are connected to those chunks. Floating unsupported flags
          deliberately have no source thread. Code Reviewer reports bugs,
          security issues and refactors.
        </p>
        <Stack items={projects.review.stack} />
        <Note>{projects.review.note}</Note>
      </>
    );
  if (index === 5)
    return (
      <>
        <h3>{projects.omni.subtitle}</h3>
        <p>{projects.omni.description}</p>
        <Metrics items={projects.omni.metrics} />
        <p>
          Ultrasonic pulses measure depth; the IMU supplies heading; the camera
          identifies objects. The three streams meet in a weighted fusion node.
          Shown weights are an illustrative visual balance, not measured sensor
          coefficients.
        </p>
        <p>
          Tier1 shares module updates inside each robot. Tier2 exchanges robot
          weights across the fleet with FedAvg. The jars keep their raw data.
          The room activity uses a real breadth-first shortest-path planner over
          its occupied grid.
        </p>
        <Stack items={projects.omni.stack} />
        <Note>{projects.omni.note}</Note>
      </>
    );
  if (index === 6)
    return (
      <>
        <Metrics items={stats.map((s) => [s.value, s.label])} />
        <ol className="full-journey">
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
        {toolGroups.map((g) => (
          <div key={g.name}>
            <h3>{g.name}</h3>
            <p>{g.tools.join(" / ")}</p>
          </div>
        ))}
        <Note>
          The curve is an illustrative learning metaphor, not a training
          benchmark. Education, projects, work and qualifications are from the
          supplied CV.
        </Note>
      </>
    );
  return (
    <>
      <p>{profile.closing}</p>
      <p>
        The same authored HB geometry is sampled offline and paired spatially
        with the actual-photo portrait points. Re-train returns the points to
        noise, through HB, and into the person. The epoch/loss readout is
        illustrative, not browser training.
      </p>
      <ContactComposer />
      <Note>
        {profile.location}. English (IELTS7.5/C1), Hindi and Gujarati. The
        public CV and vCard omit the phone number.
      </Note>
    </>
  );
}
function Probe() {
  const label = useExperience((s) => s.hoverLabel),
    mobile = useExperience((s) => s.mobile),
    reader = useExperience((s) => s.reader);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0,
      x = 0,
      y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf)
        raf = requestAnimationFrame(() => {
          if (ref.current)
            ref.current.style.transform = `translate3d(${Math.min(x + 18, innerWidth - 270)}px,${Math.min(y + 18, innerHeight - 65)}px,0)`;
          raf = 0;
        });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return !mobile && !reader ? (
    <div ref={ref} className="probe" data-visible={!!label} aria-hidden="true">
      <span />
      {label}
    </div>
  ) : null;
}
export default function App() {
  useNavigation();
  useSound();
  const chapter = useExperience((s) => s.chapter),
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
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <InferenceConsole />
      <main id="main-content" tabIndex={-1}>
        <div className="scroll-rail" aria-hidden="true" />
        <div className={`chapter-overlays ${reader ? "reader-layout" : ""}`}>
          <Identity />
          <PrismChapter />
          <CommerceChapter />
          <GuardChapter />
          <ReviewerChapter />
          <OmniChapter />
          <JourneyChapter />
          <ContactChapter />
        </div>
      </main>
      <ResearchDrawer title={chapters[chapter].name}>
        <NotesContent index={chapter} />
      </ResearchDrawer>
      <Probe />
      <TrainingReadout />
    </>
  );
}
