# Career Engine Guide

> A free, step-by-step guide to building a personal **AI career engine** with NotebookLM and Claude — generate CVs, cover letters, bios, and more from your own real history, not generic templates.

A plain static site (HTML/CSS/vanilla JS, no build tools, no framework) built to run as-is on GitHub Pages.

## What this is

A structured walkthrough that takes someone from "I have a messy folder of old CVs and certificates" to "I have a working Claude Project that generates accurate, personalised career documents on demand." It's the same underlying method used to build and maintain the CV/portfolio workflow in this account's own projects.

## What's in this build

```
career-engine-guide/
├── index.html                    Home — overview of the 4-phase method
├── phase-1-about-me.html          Phase 1 — build an "About Me" source document
├── phase-2-master-cv.html         Phase 2 — build a Master CV (everything, no editing down)
├── phase-3-claude-setup.html      Phase 3 — set up a Claude Project with the source documents
├── phase-4-generate.html          Phase 4 — generate tailored career documents from the Project
├── portfolio.html                 Bonus — build & publish a portfolio webpage on GitHub Pages
├── tips.html                      Pro tips for sharper, more accurate output
├── maintenance.html               Keeping the knowledge base current over time
└── css/, js/                      Shared styles and page interactions
```

## The method, in short

1. **About Me** — write a single honest source document covering background, work history, and voice.
2. **Master CV** — an exhaustive, uncut CV with every job, project, and credential (the source of truth, not the output).
3. **Claude Project setup** — load both documents (plus certificates, references, past applications) into a Claude Project as project knowledge.
4. **Generate** — ask for tailored CVs, cover letters, or statements; Claude pulls from the real source material instead of inventing generic filler.

The bonus **portfolio** phase covers turning the same material into a public GitHub Pages site, and **maintenance** covers keeping the knowledge base accurate as your career changes (new jobs, corrected dates, dropped plans).

## Run locally

No build step required — open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch (root).
3. The guide will be live at `https://<your-username>.github.io/career-engine-guide/`.

No build configuration needed — it's plain static HTML/CSS/JS throughout.
