import Link from "next/link";

import { styles } from "./style-constants";

const sections = [
  {
    title: "Profile",
    href: "/profile",
    items: [
      "Add your contact info, headline, and summary once",
      "Store skills (grouped by category), experience, projects, education, and certifications",
      "Update anytime — this is what resume generation uses",
    ],
  },
  {
    title: "Tailor Resume",
    href: "/tailor-resume",
    items: [
      "Paste a job description to generate a tailored draft",
      "Preview the result and adjust layout/spacing before exporting",
      "Your saved profile is never overwritten by generated text",
      "Download a clean PDF from the preview",
    ],
  },
] as const;

export function HomeLayout() {
  return (
    <div className={styles.pageRoot}>
      <section className={styles.heroCard}>
        <Link
          href="/"
          aria-label="Go to overview"
          className={`${styles.heroEyebrow} inline-block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:underline`}
        >
          FitResume
        </Link>
        <h1 className={styles.heroTitle}>Tailor your resume to any job you paste.</h1>
        <p className={styles.heroBody}>
          Save your profile once, paste a job description, and generate a tailored resume
          draft you can preview and export.
        </p>
        <div className={styles.pillRow}>
          <span className={styles.pill}>Save your profile once</span>
          <span className={styles.pill}>Paste a job description</span>
          <span className={styles.pill}>Generate a tailored draft</span>
          <span className={styles.pill}>Export PDF</span>
        </div>
      </section>

      <section className={styles.cardsGrid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Link
                href={section.href}
                className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:underline"
              >
                {section.title}
              </Link>
            </h2>
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
