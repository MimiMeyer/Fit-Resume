# Career Companion

Career Companion is an AI-powered resume tailoring companion. Maintain an About Me source of truth, paste a job description, and let an agentic flow plan and draft tailored sections you can copy or download.

## Features (current & planned)
- About Me: DB-backed profile with contact info, headline/title, summary, skills (with categories), experience, projects, education, certifications.
- Create Resume: paste a job description, run the agentic stub (parse the job description → map to profile → plan content → format summary/bullets/skills/cover note), copy or download text output.
- Agentic workflow: deterministic pipeline that extracts signals, highlights matched skills vs. gaps, and proposes tailored bullets from your inventory; ready to swap for an LLM chain.
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

## Current State
- About Me page is DB-backed with modal-based CRUD for profile, experience, projects, education, certifications, and skills; actions revalidate on submit.
- Skill add flow normalizes categories and handles unknown values; delete works via inline buttons.
- Create Resume page simulates the agent flow and produces tailored sections from your profile data; copy and download actions are included.
- API: `GET /api/skills/categories` returns distinct skill categories from the DB.

## Getting Started
```bash
pnpm install
pnpm db:generate && pnpm db:migrate   # requires DATABASE_URL
pnpm dev
```
Visit http://localhost:3000 to view the UI. About Me will show your seeded/entered data.

### Optional: seed sample profile data
- Run `node scripts/seed-profile.js` once to populate Mimi (Miriam) Meyer’s profile into the DB for demos. The script is git-ignored; adjust the fields in `scripts/seed-profile.js` before running if you want different defaults.
- The Create Resume page now renders directly from the stored profile (no hardcoded resume data), so keeping your profile filled is required for meaningful output.

 
