// Factual source: CV.md, extracted from the owner's Harsh-Bhatt-CV (3).pdf.
// Demonstrations below are illustrative; reported metrics are never recomputed.
export const profile = {
  name: "Harsh Bhatt",
  role: "AI & ML Researcher",
  location: "Ahmedabad, India",
  languages: ["English", "Hindi", "Gujarati"],
  email: "harshbhattd@gmail.com",
  github: "https://github.com/Harshbhatt1008",
  linkedin: "https://www.linkedin.com/in/harshbhatt-in/",
  cv: "/Harsh-Bhatt-CV.pdf",
  vcard: "/Harsh-Bhatt.vcf",
  // Same owner photo as the preserved AVIF; WebP also decodes in Windows WebKit.
  portrait: "/images/harsh-hero-906.webp",
  tagline: "Language. Learning. The physical world.",
  closing: "I keep looking for the point where noise starts to mean something.",
};
export const stats = [
  { value: "2", label: "manuscripts in preparation" },
  { value: "5", label: "projects" },
  { value: "~100K", label: "prompts labelled" },
  { value: "9 months", label: "industry experience" },
];
export const chapters = [
  {
    id: "identity",
    caption: "Language. Learning. The physical world.",
    name: "Harsh Bhatt",
    short: "Identity",
    statement: "Research, made tangible.",
    description:
      "I work on language models, learning systems and robots. The questions are different. The habit is the same: build it, test it, look closer.",
  },
  {
    id: "prism",
    caption: "What can a prompt tell us before a model speaks?",
    name: "PRISM",
    short: "Language",
    statement: "Before the answer.",
    description:
      "What can a prompt tell us before a model speaks? A prompt-level risk classifier and dual-axis routing framework.",
  },
  {
    id: "commerce",
    caption: "Purchase sequences become an affinity loom.",
    name: "CommerceAI",
    short: "Learning",
    statement: "A thread between things.",
    description:
      "Two towers learn from purchase sequences. An affinity loom makes that relationship visible.",
  },
  {
    id: "instaguard",
    caption: "One ALBERT block, reused across the comment sieve.",
    name: "InstaGuard",
    short: "Comments",
    statement: "Share the parameters. Keep the signal.",
    description:
      "ALBERT shares one parameter block across layers. A comment sieve makes that reuse visible.",
  },
  {
    id: "reviewer",
    caption: "Every grounded flag has a thread back to code.",
    name: "Code Reviewer",
    short: "Retrieval",
    statement: "A flag needs a source.",
    description:
      "Repository files become searchable vectors. Retrieved code gives each grounded review flag something to stand on.",
  },
  {
    id: "omni",
    caption: "Plain-English commands. Camera, depth and heading.",
    name: "OmniVision",
    short: "Physical world",
    statement: "Give an idea a body.",
    description:
      "A semantic navigation robot that combines sensors and learns collaboratively without sharing raw data.",
  },
  {
    id: "journey",
    caption: "Two degrees. Nine months in industry. Still learning.",
    name: "Still learning.",
    short: "Journey",
    statement: "2020 to 2026",
    description:
      "Two degrees, two internships, a few things that worked, and plenty of reasons to keep building.",
  },
  {
    id: "contact",
    caption: "Noise starts to mean something.",
    name: "A person, after all.",
    short: "Contact",
    statement: "Let’s compare notes.",
    description:
      "Research, a collaboration, or a question you are still working through. I would like to hear it.",
  },
];
export const projects = {
  prism: {
    title: "PRISM",
    subtitle: "Pre-inference Risk Identification for Spurious Model outputs",
    status: "Built",
    stack: ["DeBERTa-v3", "PyTorch", "DARF"],
    metrics: [
      ["81.3%", "reported accuracy"],
      ["0.84", "reported precision"],
      ["0.88", "reported recall"],
    ],
    note: "Reported results. With Dr. Avani Dadhania, LDRP-ITR. Manuscript in preparation.",
    description:
      "A DeBERTa-v3 prompt classifier predicts hallucination risk before inference. DARF combines difficulty and domain to route harder or niche queries to stronger models and routine queries to cheaper ones.",
    repository:
      "https://github.com/Harshbhatt1008/PreInference_Hallucination_Risk_Prediction_in_LLMs",
  },
  commerce: {
    title: "CommerceAI",
    subtitle: "Two-tower recommendation engine",
    status: "Created",
    stack: ["Python", "TensorFlow", "FastAPI", "React", "PostgreSQL", "Redis"],
    metrics: [
      ["+23%", "CTR over baseline"],
      ["<100ms", "serving latency"],
    ],
    note: "Reported project results. Histories and matches here are illustrative, not live recommendations.",
    description:
      "A two-tower neural recommender learns from ordered purchase sequences and serves Redis-cached embeddings. Reported click-through rate is 23% above the baseline, with serving latency under 100ms.",
  },
  guard: {
    title: "InstaGuard",
    subtitle: "Comment spam classification",
    status: "Created",
    stack: ["Python", "ALBERT", "NLTK", "Instagram Graph API", "FastAPI"],
    metrics: [
      ["94.3%", "precision"],
      ["91.7%", "recall"],
      ["40%", "fewer parameters"],
      ["45K", "comments"],
      ["<80ms", "latency"],
    ],
    note: "Reported project results. The 40% parameter reduction is relative to a comparable transformer model. Comment routes are illustrative, not live ALBERT inference.",
    description:
      "ALBERT fine-tuned on 45K labelled Instagram comments, with 94.3% precision, 91.7% recall and 40% fewer parameters than a comparable transformer. Deployed as a FastAPI microservice with sub-80ms inference.",
  },
  review: {
    title: "LLM-Based Code Reviewer",
    subtitle: "Repository-aware retrieval",
    status: "Created",
    stack: ["Python", "LangChain", "ChromaDB", "Groq", "GitHub API", "RAG"],
    metrics: [["~40%", "fewer hallucinated bug reports"]],
    note: "Reported comparison: about 40% fewer hallucinated bug reports versus single-prompt review. This is separate from InstaGuard's parameter reduction. Retrieval is illustrative; no live model request is made.",
    description:
      "Retrieval-augmented review pulls relevant repository context into the model’s input to reduce unsupported bug reports.",
  },
  omni: {
    title: "OmniVision",
    subtitle: "Semantic navigation with dual-level federated learning",
    status: "Research in progress",
    stack: [
      "Raspberry Pi 4",
      "Python",
      "OpenCV",
      "YOLOv8",
      "IMU",
      "Ultrasonic",
      "MQTT",
      "FedAvg",
    ],
    metrics: [
      ["91%", "less data transmission"],
      ["4.2%", "gap to centralised accuracy"],
    ],
    note: "Reported results. With Dr. Avani Dadhania, LDRP-ITR. Manuscript in preparation. Research in progress. Navigation and federation are illustrative, not live model inference or training.",
    description:
      "Weighted fusion combines vision, ultrasonic depth and IMU orientation. Intra-robot module learning and inter-robot FedAvg let a fleet collaborate over MQTT while raw data stays local.",
  },
};
export const dataset = {
  title: "Generalized Hallucination Risk Level",
  count: "107,584",
  url: "https://huggingface.co/datasets/hb0810/Generalized_Hallucination_Risk_Level_100k_Prompts",
  note: "Six curated public dataset rows. Selecting one routes its existing label; there is no live inference. The numeric risk_score is the dataset’s confidence field, not a new severity prediction.",
};
export const histories = [
  {
    name: "Desk days",
    items: ["Keyboard", "Notebook", "Desk light"],
    match: "Task lamp",
  },
  {
    name: "Outside hours",
    items: ["Day pack", "Walking shoes", "Water bottle"],
    match: "Trail headphones",
  },
  {
    name: "Slow mornings",
    items: ["Coffee beans", "Ceramic mug", "Kitchen scale"],
    match: "Coffee grinder",
  },
];
export const retrievalFiles = [
  {
    name: "request_handler.py",
    role: "Input validation",
    description: "Relevant checks and request contracts.",
  },
  {
    name: "retriever.py",
    role: "Context retrieval",
    description: "Repository search and ranked context.",
  },
  {
    name: "tests/test_review.py",
    role: "Existing tests",
    description: "Expected behaviour and regression coverage.",
  },
  {
    name: "README.md",
    role: "Project intent",
    description: "Usage constraints and documented behaviour.",
  },
];
export const projectPicker = {
  title: "Choose a project",
  note: "Five experiments. One continuous flight.",
  items: [
    { chapter: 1, name: "PRISM", topic: "Language / risk", glyph: "prism" },
    {
      chapter: 2,
      name: "CommerceAI",
      topic: "Sequence / match",
      glyph: "towers",
    },
    {
      chapter: 3,
      name: "InstaGuard",
      topic: "Language / filter",
      glyph: "sieve",
    },
    {
      chapter: 4,
      name: "Code Reviewer",
      topic: "Retrieval / grounding",
      glyph: "lattice",
    },
    {
      chapter: 5,
      name: "OmniVision",
      topic: "Perception / robotics",
      glyph: "rover",
    },
  ],
};
export const sceneCopy = {
  guard: {
    core: "ALBERT / shared weights",
    incoming: "Comment stream",
    pass: "Genuine / through",
    deflect: "Spam / deflect",
  },
  review: {
    report: "Grounded report",
    unsupported: "Unsupported / untethered",
    repository: "Repository / nearest chunks",
  },
  journey: {
    note: "Every milestone, together.",
    tools: "Explore the full timeline and tools",
  },
};
export const finaleCopy = {
  unfold: "Unfold the signal",
  resolve: "Return to the person",
  hint: "A portrait, folded into a light sculpture. Move your pointer to turn it.",
  reducedHint: "A portrait, folded into a still light sculpture.",
};
export const timeline = [
  {
    shortTitle: "Diploma · Computer Engineering",
    proof: "GTU · 7.75 CGPA · Distinction",
    year: "Sep 2020 – Jul 2023",
    title: "Diploma, Computer Engineering",
    place: "Gyanmanjari Diploma Engineering College / GTU",
    detail: "Completed Jul 2023. CGPA 7.75/10, First Class with Distinction.",
  },
  {
    year: "Sep 2023 – Jul 2026",
    shortTitle: "BE · Computer Engineering",
    proof: "LDRP-ITR · Completed · 7.42 CGPA",
    title: "BE, Computer Engineering",
    place: "LDRP-ITR / KSV University, Gandhinagar",
    detail:
      "Completed Jul 2026. CGPA 7.42/10, First Class. B.E. Computer Engineering graduate.",
  },
  {
    year: "3 months",
    shortTitle: "JSTECHNO · Full stack intern",
    proof: "GPT support tools · Dockerised APIs",
    title: "Full Stack Developer Intern",
    place: "JSTECHNO Solutions, Ahmedabad",
    detail:
      "Built and deployed a GPT-based support tool and LLM document summarisation app with Dockerised REST APIs. Agile sprints, daily standups and code reviews.",
  },
  {
    year: "6 months",
    shortTitle: "Tanish · Development & QA",
    proof: "140+ Selenium tests · 35% fewer bugs",
    title: "Software Development & QA Intern",
    place: "Tanish Info Services, Ahmedabad",
    detail:
      "Workforce Management System for GUVNL/Iskraemeco in PHP/MySQL, across 10,000+ records. Wrote 140+ Selenium tests, cutting the production bug rate by 35%.",
  },
  {
    year: "Hackathon",
    shortTitle: "State finalist & co-leader",
    proof: "National Hackathon · Crash-detection SOS",
    title: "State finalist & co-leader",
    place: "Azadi ka Amrit Mahotsav National Hackathon",
    detail:
      "Embedded crash-detection SOS. A team project connecting sensing with a useful response.",
  },
  {
    year: "College fest",
    shortTitle: "First place · IoT",
    proof: "Smart umbrella · Weather response",
    title: "First place, IoT",
    place: "Smart umbrella",
    detail:
      "First place in the IoT category for a smart umbrella/weather-response system.",
  },
  {
    year: "May 2026",
    shortTitle: "IELTS Academic · 7.5 / C1",
    proof: "L 8.5 · R 7.5 · W 6.5 · S 8.0",
    title: "IELTS Academic 7.5 / C1",
    place: "English proficiency",
    detail: "CEFR C1. Listening 8.5, Reading 7.5, Writing 6.5, Speaking 8.0.",
  },
  {
    year: "Continuing",
    shortTitle: "Learning beyond the classroom",
    proof: "Columbia · Stanford · NVIDIA · NPTEL",
    title: "Courses beyond the classroom",
    place: "Columbia · Stanford Online · NVIDIA · NPTEL",
    detail:
      "Prompt Engineering & Programming with the OpenAI API (Columbia University); Supervised Machine Learning & Advanced Learning Algorithms (Stanford Online / Coursera); AI Infrastructure and Operations Fundamentals (NVIDIA / Coursera); Fundamentals of Operating Systems (NPTEL).",
  },
];
export const toolGroups = [
  {
    name: "AI & ML",
    tools: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "Hugging Face",
      "LangChain",
      "DeBERTa-v3",
      "ALBERT",
      "YOLOv8",
    ],
  },
  {
    name: "Robotics & embedded",
    tools: [
      "Raspberry Pi",
      "Arduino",
      "Sensor fusion",
      "Embedded C++",
      "MQTT",
      "ROS basics",
    ],
  },
  {
    name: "Building & shipping",
    tools: [
      "React",
      "JavaScript",
      "C++",
      "Java",
      "PHP",
      "SQL",
      "FastAPI",
      "Flask",
      "Docker",
      "Git",
      "Redis",
      "ChromaDB",
    ],
  },
];
export type DatasetSample = {
  row: number;
  prompt: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
};
// Curated exact rows are appended from the public first-rows response in .qa/dataset.json.

export const datasetSamples: DatasetSample[] = [
  {
    row: 0,
    prompt: "Describe the structure and function of a photosynthetic cell.",
    risk: "LOW",
    confidence: 95,
  },
  {
    row: 1,
    prompt:
      "What were some key events leading to the fall of the Roman Empire?",
    risk: "MEDIUM",
    confidence: 87,
  },
  {
    row: 2,
    prompt:
      "Predict the development of artificial intelligence in the next 50 years.",
    risk: "HIGH",
    confidence: 78,
  },
  {
    row: 3,
    prompt:
      "In a fantasy world, describe a dragon's physical characteristics and magical abilities.",
    risk: "LOW",
    confidence: 95,
  },
  {
    row: 13,
    prompt:
      "What are the side effects and risks associated with long-term use of ibuprofen?",
    risk: "MEDIUM",
    confidence: 78,
  },
  {
    row: 18,
    prompt:
      "In a parallel universe, what if dragons existed as real creatures in medieval Europe?",
    risk: "HIGH",
    confidence: 98,
  },
];
