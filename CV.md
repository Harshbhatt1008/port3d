# CV | Harsh Bhatt

Source: owner-supplied Harsh-Bhatt-CV (3).pdf. Phone omitted from the public source and download.

HARSH BHATT
 AI & ML Research · B.E. Computer Engineering Graduate, LDRP-ITR (KSV University)
 Ahmedabad, India · harshbhattd@gmail.com · linkedin.com/in/harshbhatt-in
 CGPA 7.42/10 (First Class) · IELTS Academic (May 2026): 7.5, CEFR C1 · L 8.5 · R 7.5 · W 6.5 · S 8.0
RESEARCH PROJECTS
OmniVision: Semantic Navigation Robot with Dual-Level Federated Learning
 Jan 2026 – Present
With Dr. Avani Dadhania, LDRP-ITR · manuscript in preparation · Raspberry Pi 4, Python, OpenCV, YOLOv8, IMU, ultrasonic
sensors, federated learning (FedAvg), MQTT
-  Built a low-cost robot that follows plain-English navigation commands and avoids obstacles in real time, fusing YOLOv8
detection, ultrasonic depth, and IMU orientation through a custom weighted sensor-fusion algorithm.
-  Designed a two-tier federated learning scheme, intra-robot FL across sensor modules and inter-robot FedAvg across the
fleet, reaching within 4.2% of centralised-training accuracy while cutting data transmission by 91%, with no raw data leaving
any robot.
Pre-Inference Hallucination Risk Prediction in Large Language Models
 Jan 2026 – Present
With Dr. Avani Dadhania, LDRP-ITR · manuscript in preparation · Python, DeBERTa-v3, HuggingFace Transformers, PyTorch,
GPT-4, Gemini, Claude APIs
-  Trained a DeBERTa-v3 classifier that predicts hallucination risk directly from prompt text before inference, using multi-model
consensus labels (GPT-4, Gemini 1.5 Pro, Claude) over ~100K prompts: 81.3% accuracy, 0.84 precision, 0.88 recall.
-  Extended the classifier into DARF, a dual-axis routing layer that scores prompts by difficulty and domain to route hard/niche
queries to stronger models and routine queries to cheaper ones, lowering hallucination rate while reducing inference cost.
AWARDS & RECOGNITION
-  State Finalist and Co-Leader, Azadi ka Amrit Mahotsav National Hackathon, for an embedded crash-detection SOS system.
-  1st Place, IoT Category, College Fest, for a smart umbrella/weather-response system.
SELECTED PROJECTS
CommerceAI: E-Commerce Recommendation Engine
 2024
Python, FastAPI, React, TensorFlow, PostgreSQL, Redis
-  Built a two-tower deep neural recommender over purchase sequences, lifting click-through rate 23% over a baseline; served
in under 100ms via Redis-cached embeddings.
LLM-Based Code Reviewer
 2024
Python, LangChain, Groq (Llama 3 / Mixtral), GitHub API, ChromaDB, RAG
-  RAG pipeline that embeds a GitHub repo into ChromaDB and generates structured review reports (bugs, security, refactors)
via chain-of-thought prompting, cutting hallucinated bug reports by ~40% versus single-prompt review.
InstaGuard: Instagram Spam Detection
 2023
Python, ALBERT, NLTK, Instagram Graph API, FastAPI
-  Fine-tuned ALBERT on 45K labelled comments, reaching 94.3% precision / 91.7% recall with 40% fewer parameters than a
comparable transformer model. Deployed as a FastAPI microservice, sub-80ms inference.
PROFESSIONAL EXPERIENCE
Full Stack Developer Intern, JSTECHNO Solutions, Ahmedabad
 3 months
-  Built and deployed two production apps (GPT-based support tool, LLM document summarisation) with Dockerised REST
APIs; worked in agile sprints with daily standups and code reviews.
Software Development & QA Intern, Tanish Info Services, Ahmedabad
 6 months
-  Built a Workforce Management System for GUVNL/Iskraemeco in PHP/MySQL across 10,000+ records; wrote 140+
Selenium tests, cutting production bug rate 35%.
EDUCATION
B.E. Computer Engineering, LDRP-ITR, KSV University, Gandhinagar
 Sep 2023 – Jul 2026
CGPA 7.42/10 (First Class) · Coursework: Artificial Intelligence, Machine Learning, Neural Networks & Deep Learning, Soft
Computing, Big Data Analytics, Design & Analysis of Algorithms, Data Structures & Algorithms, Discrete Mathematics,
Probability, Statistics & Numerical Methods, Theory of Computation, Distributed Systems, Operating Systems, Computer
Networks
Diploma in Computer Engineering, Gyanmanjari Diploma Engineering College, GTU
 Sep 2020 – Jul 2023
CGPA 7.75/10 (First Class with Distinction) · Coursework: Basic Mathematics, Advanced Mathematics, Data Structure,
Programming in C++, Java Programming, Database Management System, Computer Networks, Computer & Network Security,
Microprocessor & Assembly Language
TECHNICAL SKILLS
AI / ML: PyTorch, TensorFlow, HuggingFace Transformers, LangChain, DeBERTa-v3, ALBERT, YOLOv8
Robotics: Raspberry Pi 4, Arduino, sensor fusion (IMU, GPS, ultrasonic, RGB camera), Embedded C++, MQTT, ROS (basic)
Languages & Tools: Python, C++, Java, JavaScript, PHP, SQL · Git, Docker, FastAPI, Flask, Redis, ChromaDB
Spoken: English (IELTS 7.5, C1), Hindi (native), Gujarati (native)
CERTIFICATIONS
Columbia University: Prompt Engineering & Programming with the OpenAI API · Stanford Online / Coursera: Supervised
Machine Learning & Advanced Learning Algorithms · NVIDIA / Coursera: AI Infrastructure and Operations Fundamentals ·
NPTEL: Fundamentals of Operating Systems
