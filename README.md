# FitResume

FitResume is an AI-powered resume tailoring companion. Build your Profile once, paste a job description, and generate tailored resume sections you can download.

## Features
- Profile: stored locally in your browser (experience, projects, education, certifications, skills, and contact details).
- Tailor Resume: paste a job description, generate suggestions, review edits, preview, and download PDF.
- AI (BYOK): bring your own Claude API key (`ANTHROPIC_API_KEY`) to enable generation.

## Backup & Restore
- On the Profile page, you can download a JSON backup of your Profile and upload it later to restore.
- Uploading a backup replaces your current Profile data.
- Profile data is saved in your browser storage. Clearing site data will remove it.

## Getting Started
```bash
pnpm install
pnpm dev
```
Visit http://localhost:3000 to view the UI.
