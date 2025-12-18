import { styles } from "./style-constants";

const sections = [
  {
    title: "About Me",
    items: [
      "Single source of truth for profile, skills, projects, highlights",
      "Modal-based add/edit for experience, education, certifications, skills",
      "Keep contact, title, summary, and links ready for generation",
    ],
  },
  {
    title: "Create Resume",
    items: [
      "Paste a job description; run agents to tailor summary/experience/projects/skills",
      "Auto-pagination to A4; download PDF/Doc from in-memory output",
      "AI output is not saved - export only when you're ready",
    ],
  },
  {
    title: "Agentic Flow",
    items: [
      "JD parsing + profile retrieval + AI agents for summary/bullets/projects/skills",
      "Runs via /api/generate-resume (Anthropic); no DB writes from generation",
      "CLI scaffold in scripts/agentic-cli.ts for local runs against Prisma",
    ],
  },
] as const;

export function HomeLayout() {
  return (
    <div className={styles.pageRoot}>
      <section className={styles.heroCard}>
        <p className={styles.heroEyebrow}>FitResume</p>
        <h1 className={styles.heroTitle}>
          Agentic copilot for tailoring resumes to any job you paste.
        </h1>
        <p className={styles.heroBody}>
          Maintain an About Me profile, paste a job description, and let the
          agent extract signals, match against your inventory, and draft a
          tailored resume you can copy or download.
        </p>
        <div className={styles.pillRow}>
          <span className={styles.pill}>About Me source of truth</span>
          <span className={styles.pill}>Job description parsing + mapping</span>
          <span className={styles.pill}>Tailored resume sections</span>
          <span className={styles.pill}>Copy / download actions</span>
        </div>
      </section>

      <section className={styles.cardsGrid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{section.title}</h2>
            <ul className={styles.cardList}>
              {section.items.map((item) => (
                <li key={item} className={styles.bulletRow}>
                  <span aria-hidden className={styles.bulletDot} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

