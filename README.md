# Career Companion

Career Companion is an AI-powered job search assistant designed to automate the most painful parts of finding a job. It scrapes job listings from multiple platforms, analyzes your match fit using AI, and automatically tailors your resume for each role.

## ✨ Features (planned)

### Keyword-Driven Scraping
- User-provided keywords drive scraping across job boards (Indeed, LinkedIn, etc.).
- Normalize metadata (title, company, salary, stack, location) and refresh on a schedule.
- Match hints via keywords/embeddings and simple rules.

### Profile-Driven Tailoring
- About Me page to maintain summary, skills, and experience.
- Tailoring pulls from profile and job description; cover letters later.
- Fixed resume template for consistent exports (PDF/Markdown planned).

### Saved Jobs Workspace
- Save promising roles and track status.
- Generate a tailored resume per saved job and download it.
- Job details, notes, and match hints in one view.

### Dashboard UI
- Modern Next.js + Tailwind interface.
- Pages: Overview, Job Search, Saved Jobs, Resume Template, About Me, Settings.
- Accessible, light-only theme with keyboard-friendly focus styles.

### Agentic Automation
- Built with OpenAI Codex CLI for project automation.
- Automatic code suggestions, diffs, and improvements with approval workflow.
- Linting, formatting, and CI-friendly architecture.

## Current State
- Static UI scaffold only; no live scraping, persistence, or export wiring yet.
- Placeholder data for Job Search, Saved Jobs, About Me, and Resume Template preview.
- Next steps: add a mock data layer/server actions, then real DB (Prisma + Postgres) and scraper integration.

## 🧰 Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- shadcn/ui + Radix UI
- TypeScript

### Backend
- Next.js API Routes + Server Actions
- Node.js
- OpenAI SDK (GPT-5.1, embeddings, text analysis)

### Database
- PostgreSQL (Neon / Supabase / PlanetScale)
- Prisma ORM

### Infrastructure & Automation
- Vercel (hosting)
- Vercel Cron Jobs or node-cron
- Codex CLI (development agent)
- GitHub for version control
- ESLint + Prettier

### Future Enhancements
- Multi-board scraping (LinkedIn, ZipRecruiter, Indeed)
- Browser extension for 1-click “analyze this job”
- OAuth login (Clerk/Auth.js)
- ML-based match ranking

## 🎯 Purpose

To give job seekers a fast, intelligent, and automated way to discover the best jobs and submit a perfectly tailored resume — effortlessly.
