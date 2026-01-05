# FitResume

FitResume is an AI-powered resume tailoring companion. Build your Profile once, paste a job description, and generate tailored resume sections you can download.

## Features
- Profile: stored locally in your browser (experience, projects, education, certifications, skills, and contact details).
- Tailor Resume: paste a job description, generate suggestions, review edits, preview, and download PDF.
- AI (BYOK): bring your own Claude API key to enable generation (entered in the UI; not stored, cleared on refresh).

## Getting Started
```bash
pnpm install
pnpm dev
```
Visit http://localhost:3000 to view the UI.

## How To Use
- Open `http://localhost:3000/profile` and fill out your profile (saved to your browser). Consider exporting a backup so you can restore it later if you clear site data or switch browsers/devices.
- Open `http://localhost:3000/tailor-resume`, paste a job description, enter your Claude API key, and generate suggestions.
- Review the output, edit/format it how you like, then download your resume as a PDF.
