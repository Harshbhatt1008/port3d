// Factual source: owner's brief and read-only K:/pp/lib/portfolio.ts.
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
    name: "Harsh Bhatt",
    short: "Identity",
    statement: "Research, made tangible.",
    description:
      "I work on language models, learning systems and robots. The questions are different. The habit is the same: build it, test it, look closer.",
  },
  {
    id: "prism",
    name: "PRISM",
    short: "Language",
    statement: "Before the answer.",
    description:
      "What can a prompt tell us before a model speaks? A prompt-level risk classifier and dual-axis routing framework.",
  },
  {
    id: "commerce",
    name: "CommerceAI",
    short: "Learning",
    statement: "A thread between things.",
    description:
      "Two towers learn from purchase sequences. An affinity loom makes that relationship visible.",
  },
  {
    id: "signals",
    name: "Signal / Noise",
    short: "Signals",
    statement: "Keep what matters.",
    description:
      "Two ways of finding useful signal: recognise an unwanted comment, or retrieve the context a code review needs.",
  },
  {
    id: "omni",
    name: "OmniVision",
    short: "Physical world",
    statement: "Give an idea a body.",
    description:
      "A semantic navigation robot that combines sensors and learns collaboratively without sharing raw data.",
  },
  {
    id: "journey",
    name: "Still learning.",
    short: "Journey",
    statement: "2020 to 2026",
    description:
      "Two degrees, two internships, a few things that worked, and plenty of reasons to keep building.",
  },
  {
    id: "contact",
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
      ["12ms", "reported latency"],
      ["88%", "high-risk recall"],
    ],
    note: "With Dr. Avani Dadhania, LDRP-ITR. Manuscript in preparation.",
    description:
      "A DeBERTa-v3 prompt classifier predicts hallucination risk before inference. DARF combines difficulty and domain to route harder or niche queries to stronger models and routine queries to cheaper ones.",
    repository:
      "https://github.com/Harshbhatt1008/PreInference_Hallucination_Risk_Prediction_in_LLMs",
  },
  commerce: {
    title: "CommerceAI",
    subtitle: "Two-tower recommendation engine",
    status: "Created",
    stack: ["TensorFlow", "FastAPI", "Redis"],
    metrics: [
      ["+23%", "CTR over baseline"],
      ["<100ms", "serving latency"],
    ],
    note: "Reported project results. Histories and matches here are illustrative, not live recommendations.",
    description:
      "A two-tower neural recommender learns from purchase sequences and serves Redis-cached embeddings. This is the existing implementation; TF-IDF/KNN was only an alternative under consideration.",
  },
  guard: {
    title: "InstaGuard",
    subtitle: "Comment spam classification",
    status: "Created",
    stack: ["ALBERT", "NLTK", "FastAPI"],
    metrics: [
      ["94.3%", "precision"],
      ["45K", "comments"],
      ["<80ms", "latency"],
    ],
    note: "Reported project results. The movable boundary is an illustrative classifier, not live ALBERT inference.",
    description:
      "An ALBERT-based comment classifier for distinguishing unwanted comments from useful conversation.",
  },
  review: {
    title: "LLM-Based Code Reviewer",
    subtitle: "Repository-aware retrieval",
    status: "Created",
    stack: ["LangChain", "ChromaDB", "Groq"],
    metrics: [["~40%", "fewer hallucinated bug reports"]],
    note: "Reported comparison. Retrieval geometry is illustrative; no code or repository is sent to a model.",
    description:
      "Retrieval-augmented review pulls relevant repository context into the model’s input to reduce unsupported bug reports.",
  },
  omni: {
    title: "OmniVision",
    subtitle: "Semantic navigation with dual-level federated learning",
    status: "Research in progress",
    stack: ["Raspberry Pi", "YOLOv8", "Sensor fusion", "MQTT", "FedAvg"],
    metrics: [
      ["91%", "less data transmission"],
      ["4.2%", "gap to centralised accuracy"],
    ],
    note: "With Dr. Avani Dadhania, LDRP-ITR. Manuscript in preparation. This room is an illustrative path-planning activity, not live YOLO or federated training.",
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
export const timeline = [
  {
    year: "2020–23",
    title: "Diploma, Computer Engineering",
    place: "Gyanmanjari / GTU",
    detail:
      "7.75 CGPA. A foundation in building software and understanding the machine underneath it.",
  },
  {
    year: "2023–26",
    title: "BE, Computer Engineering",
    place: "LDRP-ITR / KSV University",
    detail:
      "7.42 CGPA. Language models, machine learning and embedded systems.",
  },
  {
    year: "3 months",
    title: "Full Stack Developer Intern",
    place: "JSTechno Solutions",
    detail: "Two production LLM applications and Docker-based delivery.",
  },
  {
    year: "6 months",
    title: "Software Development & QA Intern",
    place: "Tanish Info Services",
    detail:
      "PHP/MySQL systems with 10,000+ records, 140+ Selenium tests and 35% fewer production bugs.",
  },
  {
    year: "Hackathon",
    title: "State finalist & co-leader",
    place: "National hackathon",
    detail:
      "Embedded crash-detection SOS. A team project connecting sensing with a useful response.",
  },
  {
    year: "College fest",
    title: "First place, IoT",
    place: "Smart umbrella",
    detail: "A physical prototype built for a college IoT competition.",
  },
  {
    year: "Continuing",
    title: "Courses beyond the classroom",
    place: "Columbia · Stanford Online · NVIDIA · NPTEL",
    detail:
      "Prompt Engineering & OpenAI API (Columbia); Machine Learning (Stanford Online / Coursera); AI Infrastructure (NVIDIA / Coursera); Operating Systems (NPTEL).",
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
      "TypeScript",
      "React",
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
