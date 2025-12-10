# Career Companion

Career Companion is an AI-powered job search assistant: add keywords to scrape boards, save promising roles, and generate tailored resumes powered by your maintained profile.

## Features (current & planned)
- Keyword-driven scraping across boards (Indeed, LinkedIn, etc.) with normalized metadata and match hints.
- Profile-driven tailoring: About Me stores summary, contact info, skills (with categories), experience, projects, education, certifications; resume generation will use this data per job.
- Saved jobs workspace: track roles, statuses, and notes; generate/download a tailored resume per job (planned).
- Dashboard UI: Overview, Job Search, Saved Jobs, About Me, Settings; accessible light-only theme.
- Agentic automation: OpenAI Codex CLI driven workflow, linting/formatting/CI-friendly setup.

## Database Setup
- PostgreSQL via Prisma. Local dev can run Postgres in Docker; prod should use a hosted Postgres (e.g., Vercel Postgres/Neon) for serverless deployments.
- Copy `.env.example` to `.env`. The example points at the local Docker container (`postgresql://careercompanion:careercompanion@localhost:5432/career_companion?sslmode=disable`); update as needed.
- Install deps: `pnpm install`.
- Start local DB (optional helper scripts):
  - `pnpm db:dev:up` (docker compose) / `pnpm db:dev:down`
  - or run your own Postgres and set `DATABASE_URL`.
- Apply schema: `pnpm db:generate && pnpm db:migrate` (or `pnpm db:push` for quick dev sync).
- Schema: `prisma/schema.prisma`; client helper: `lib/prisma.ts`.
  - Models: Profile (contact/title), Experience, Project, Education, Certification, Skill (category is a free-form string), ProfileSkill join, Job (with optional `expiresAt` for unsaved scrape entries), SavedJob, Category.
- Migrations live in `prisma/migrations/`; run `pnpm db:migrate` to apply.

## Current State
- About Me page is DB-backed with modal-based CRUD for profile, experience, projects, education, certifications, and skills; actions revalidate on submit.
- Skill add flow normalizes categories and handles unknown values; delete works via inline buttons.
- Jobs, Saved Jobs, and Settings pages are placeholders pending wiring to Prisma/scraper.
- API: `GET /api/skills/categories` returns distinct skill categories from the DB.

## Getting Started
```bash
pnpm install
pnpm db:generate && pnpm db:migrate   # requires DATABASE_URL
pnpm dev
```
Visit http://localhost:3000 to view the UI. About Me will show your seeded/entered data.

 