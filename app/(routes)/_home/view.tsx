import Link from "next/link";

import { styles } from "./style-constants";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M12 2l1.1 5.2L18 8l-4.9 1.1L12 14l-1.1-4.9L6 8l4.9-.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.7 3.2L23 17l-3.3.8L19 21l-.7-3.2L15 17l3.3-.8L19 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sections = [
  {
    title: "Profile",
    href: "/profile",
    icon: <ProfileIcon />,
    flow: ["Fill out your profile", "Use it everywhere"],
    detail:
      "Add your basics plus experience, projects, education, certifications, and skills. You can also download a JSON backup to save it.",
  },
  {
    title: "Tailor Resume",
    href: "/tailor-resume",
    icon: <SparkIcon />,
    flow: ["Paste a job description", "Generate a draft", "Preview + download PDF"],
    detail:
      "Generate a targeted summary and stronger bullets. Preview the result, adjust layout, then download a PDF. Your saved Profile stays unchanged.",
  },
] as const;

export function HomeLayout() {
  return (
    <div className={styles.pageRoot}>
      <section className={styles.heroCard}>
        <div className={styles.heroBackdrop} aria-hidden />

        <Link
          href="/"
          aria-label="Go to overview"
          className={`${styles.heroEyebrow} inline-block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:underline`}
        >
          FitResume
        </Link>

        <h1 className={styles.heroTitle}>Tailor your resume to any job you paste.</h1>
        <p className={styles.heroSubtitle}>
          Build your Profile once, then generate a targeted draft for each job description — without overwriting your saved
          info.
        </p>
      </section>

      <section className={styles.cardsGrid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.card}>
            <div className={styles.cardTopRow}>
              <div className="flex items-center gap-3">
                <span className={styles.cardIcon} aria-hidden>
                  {section.icon}
                </span>
                <h2 className={styles.cardTitle}>
                  <Link
                    href={section.href}
                    className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:underline"
                  >
                    {section.title}
                  </Link>
                </h2>
              </div>
              <Link href={section.href} aria-label={`Open ${section.title}`} className={styles.cardArrow}>
                <ArrowIcon />
              </Link>
            </div>

            <p className={styles.cardFlow}>
              {section.flow.map((step, index) => (
                <span key={step}>
                  {step}
                  {index < section.flow.length - 1 ? " \u2192 " : null}
                </span>
              ))}
            </p>
            <p className={styles.cardDetail}>{section.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
