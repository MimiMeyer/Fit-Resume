# FitResume

FitResume is an AI-powered resume tailoring companion. Maintain an About Me source of truth, paste a job description, and let an agentic flow plan and draft tailored sections you can download (AI output stays in-memory unless you export).

## Features (current & planned)
- About Me: DB-backed profile with contact info, headline/title, summary, skills (with categories), experience, projects, education, certifications.
- Create Resume: paste a job description, run the agentic flow (JD → profile retrieval → AI-generated summary/experience/projects/skills), and download PDF/Doc; generated text is not persisted.
- Agentic workflow: deterministic pipeline that extracts signals, highlights matched skills vs. gaps, and proposes tailored bullets from your inventory; backed by Anthropic via `/api/generate-resume`.
- UI: Overview landing, About Me editor, Create Resume workspace; accessible light theme with keyboard-focus states.
- Automation (later): scheduler for reminders or job description ingestion; Playwright hooks for autofill/apply flows.

## Database Setup
- PostgreSQL via Prisma. Local dev can run Postgres in Docker; prod should use a hosted Postgres (e.g., Vercel Postgres/Neon) for serverless deployments.
- Copy `.env.example` to `.env`. The example points at the local Docker container (`postgresql://careercompanion:careercompanion@localhost:5432/career_companion?sslmode=disable`); update as needed.
- Install deps: `pnpm install`.
- Start local DB (optional helper scripts):
  - `pnpm db:dev:up` (docker compose) / `pnpm db:dev:down`
  - or run your own Postgres and set `DATABASE_URL`.
- Apply schema: `pnpm db:generate && pnpm db:migrate` (or `pnpm db:push` for quick dev sync).
- Schema: `prisma/schema.prisma`; client helper: `lib/prisma.ts`.
  - Models: Profile (contact/title), Experience, Project, Education, Certification, Skill (category is a free-form string), Category.
- Migrations live in `prisma/migrations/`; run `pnpm db:migrate` to apply.
- AI: set `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`) to enable resume generation.

## Current State
- About Me page is DB-backed with modal-based CRUD for profile, experience, projects, education, certifications, and skills; actions revalidate on submit.
- Skill add flow normalizes categories and handles unknown values; delete works via inline buttons.
- Create Resume page calls `/api/generate-resume` to generate tailored summary/experience/projects/skills from your profile + pasted JD; output lives in state only (not saved) and supports PDF/Doc download with auto-pagination.
- API: `POST /api/generate-resume` runs the agent pipeline; `GET /api/skills/categories` returns distinct skill categories from the DB.
- CLI scaffold: `scripts/agentic-cli.ts` to run the agentic flow locally against Prisma data.

## Getting Started
```bash
pnpm install
pnpm db:generate && pnpm db:migrate   # requires DATABASE_URL
pnpm dev
```
Visit http://localhost:3000 to view the UI. About Me will show your seeded/entered data.
