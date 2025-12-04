# Career Companion

Career Companion is an AI-powered job search assistant: add keywords to scrape boards, save promising roles, and generate tailored resumes with a fixed template powered by your maintained profile.

## ✨ Features (planned)
- **Keyword-driven scraping** across boards (Indeed, LinkedIn, etc.) with normalized metadata and match hints.
- **Profile-driven tailoring**: About Me stores summary, skills (with categories), experience, projects, education, certifications; tailoring uses this + job descriptions to fill a fixed resume template.
- **Saved jobs workspace**: track roles, statuses, and notes; generate/download a tailored resume per job.
- **Dashboard UI**: Overview, Job Search, Saved Jobs, Resume Template, About Me, Settings; accessible light-only theme.
- **Agentic automation**: OpenAI Codex CLI driven workflow, linting/formatting/CI-friendly setup.

## Database Setup
- Uses PostgreSQL via Prisma.
- Copy `.env.example` to `.env` and set `DATABASE_URL`.
- Install deps: `pnpm install`.
- Generate client and apply schema: `pnpm db:generate && pnpm db:push` (or `pnpm db:migrate` once migrations are defined).
- Prisma schema: `prisma/schema.prisma`; client helper: `lib/prisma.ts`.
  - Models include Profile (contact/title), Experience, Project, Education, Certification, Skill (with category), Job, SavedJob (Profile-Skill join).

## Current State
- UI is mostly static placeholders; About Me page reads live profile data from Prisma. Other pages are not yet wired to the database.
- Prisma schema and server action stubs exist for profile and jobs.
- Next step: connect remaining UI to Prisma actions and add CRUD flows.

## Getting Started
```bash
pnpm install
pnpm db:generate && pnpm db:push   # once DATABASE_URL is set
pnpm dev
```

Visit http://localhost:3000 to view the UI.
