# Content audit against the supplied CV

Source: `CV.md`, extracted from the owner's `Harsh-Bhatt-CV (3).pdf` on 21 October 2026. The original PDF is the authority. The public Markdown and downloadable PDF omit the phone number. No phone field is allowed in the site or vCard.

The audit covers the factual strings exported by `src/content.ts` and their visible use in `App.tsx`. Interaction instructions, chapter names and visual metaphors are authored interface copy, not additional CV claims. The six dataset rows and exact dataset count have a separately identified public dataset source; they are not represented as CV quotations.

| Prior mismatch / omission | Correction | Source in CV |
| --- | --- | --- |
| PRISM displayed a 12ms latency with no CV source. | Removed. No replacement latency claim. | PRISM research entry lists accuracy, precision and recall, not latency. |
| PRISM called 88% a high-risk recall. | Uses **0.88 reported recall**; removes the unsupported class-specific qualification. | “0.84 precision, 0.88 recall.” |
| PRISM precision was missing. | Adds **0.84 reported precision** beside 81.3% reported accuracy. | PRISM research entry. |
| PRISM research note lacked the explicit reported-results prefix. | Preserves Dr. Avani Dadhania, LDRP-ITR and manuscript in preparation; labels results as reported. | Research author/manuscript context. |
| InstaGuard recall was omitted. | Adds **91.7% recall**. | InstaGuard selected-project entry. |
| InstaGuard parameter sharing/reduction was omitted. | Adds **40% fewer parameters than a comparable transformer**, with a reused ALBERT block in its illustration. | InstaGuard selected-project entry. |
| InstaGuard and Code Reviewer shared one section, making their unrelated 40% figures easy to confuse. | Separate chapters and separately qualified metrics: parameters for InstaGuard; hallucinated bug reports for Code Reviewer. | Two separate selected-project entries. |
| InstaGuard's Instagram Graph API and Python stack were absent. | Adds them, retaining ALBERT, NLTK and FastAPI. | InstaGuard stack. |
| Code Reviewer stack omitted Python, GitHub API and the explicit RAG label. | Adds them; preserves LangChain, ChromaDB and Groq. | Code Reviewer stack and description. |
| Code Reviewer reduction lacked the exact comparison baseline in its compact note. | Specifies **versus single-prompt review**; no live repository/model request. | Code Reviewer selected-project entry. |
| CommerceAI copy referred to a TF-IDF/KNN alternative not present in the CV. | Removes that aside. Preserves the actual two-tower purchase-sequence recommender and reported +23% CTR / under100ms serving. | CommerceAI selected-project entry. |
| CommerceAI stack omitted Python, React and PostgreSQL. | Adds them alongside TensorFlow, FastAPI and Redis. | CommerceAI stack. |
| OmniVision used a generic Raspberry Pi and abbreviated sensors/software. | Specifies Raspberry Pi 4, Python, OpenCV, YOLOv8, IMU, ultrasonic, MQTT and FedAvg. | OmniVision research entry. |
| OmniVision's visual point scan implied a sensing modality not described as the fusion inputs. | Replaces it with ultrasonic pulses, IMU heading and weighted camera/ultrasonic/IMU fusion; separates module-level and fleet-level learning. | OmniVision research bullets. |
| Degree dates were only 2023–26 and completion was implicit. | **Sep2023–Jul2026; completed Jul2026**, B.E. graduate, CGPA7.42/10, First Class. | Education and CV heading. |
| Diploma dates/institution/honours were abbreviated. | Sep2020–Jul2023, full college/GTU, completedJul2023, CGPA7.75/10, First Class with Distinction. | Education. |
| English proficiency was absent. | Adds **IELTS Academic7.5, CEFR C1, May2026**, including L8.5/R7.5/W6.5/S8.0 in notes. | CV heading/spoken skills. |
| JSTECHNO employer case/location and work detail were abbreviated. | Full name/location and the GPT support/document-summarisation apps with Dockerised REST APIs. | Professional experience. |
| Tanish employer location/client/workforce-management context was missing. | Adds Ahmedabad and GUVNL/Iskraemeco Workforce Management System; preserves10,000+ records,140+ tests,35% bug-rate reduction. | Professional experience. |
| Hackathon title was generic. | Names the Azadi ka Amrit Mahotsav National Hackathon; preserves state finalist/co-leader and embedded crash-detection SOS. | Awards. |
| Smart umbrella's weather-response context was absent. | Adds it; retains first place in college-fest IoT. No award date invented. | Awards. |
| Course titles were shortened. | Uses the full Columbia, Stanford Online/Coursera, NVIDIA/Coursera and NPTEL titles. | Certifications. |
| A TypeScript skills entry was not in this CV. | Removes it from the personal skills list; JavaScript, C++ and Java are included. The website's TypeScript implementation remains an engineering fact. | Technical skills. |
| Downloadable CV exposed a telephone field. | Redacts the actual text from the public PDF and omits it from CV.md; vCard/site checked for telephone fields. | Owner's explicit privacy instruction. |

Verified and retained: Ahmedabad; email and LinkedIn; 2 manuscripts in preparation; 5 named projects; ~100K labelled prompts; 3+6months of internships; both CGPAs; CommerceAI +23% CTR and under100ms; InstaGuard45K comments and under80ms; OmniVision91% less transmission and4.2% gap. GitHub and the dataset URL/count are owner-supplied/public-source facts rather than CV-derived claims.

The public dataset's pre-existing risk/confidence values are preserved. Difficulty/domain placements, comment samples, purchase histories, retrieval chunks, robot commands and particle readouts are explicitly illustrative. They perform no inference, training or remote code analysis. Every manuscript and reported-results qualification remains available in the caption or Research notes.
