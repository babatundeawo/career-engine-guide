<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
  <img src="docs/assets/logo-light.svg" alt="Career Engine" width="300">
</picture>

**A free, step-by-step guide to building a personal AI career engine with NotebookLM and Claude.**

[![Deploy](https://github.com/babatundeawo/career-engine-guide/actions/workflows/deploy.yml/badge.svg)](https://github.com/babatundeawo/career-engine-guide/actions/workflows/deploy.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fbabatundeawo.github.io%2Fcareer-engine-guide%2F&label=live%20site)](https://babatundeawo.github.io/career-engine-guide/)

[Live site](https://babatundeawo.github.io/career-engine-guide/) · [Start the guide](https://babatundeawo.github.io/career-engine-guide/phase-1-about-me.html) · [Report an issue](https://github.com/babatundeawo/career-engine-guide/issues/new/choose)

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/preview-dark.png">
  <img src="docs/assets/preview-light.png" alt="The Career Engine home page: a headline reading 'Build your personal AI career engine', two buttons, and a diagram of four connected phases.">
</picture>

## About

Career Engine walks you from a messy folder of old CVs and certificates to a working Claude Project that writes accurate, personalised career documents on demand. It is for anyone who applies for jobs, grants, scholarships or speaking slots and is tired of starting from a blank page. Every document is generated from your own verified history, so nothing is invented.

## Features

- Four short phases that take about 30 minutes in total
- A saved checklist that remembers your progress in your own browser
- Eight ready-to-copy prompts: tailored CV, cover letter, LinkedIn summary, GitHub README, short and long bio, scholarship essay, career pivot summary
- A bonus guide for publishing a portfolio on GitHub Pages
- A quick reference for which file to update when your career changes
- Light and dark themes that follow your system setting
- Works on phones, tablets and desktops, and is usable without JavaScript

## How to use it

1. Open the [live site](https://babatundeawo.github.io/career-engine-guide/) and choose **Start the guide**.
2. **About Me**: use NotebookLM to draft a grounded first-person introduction.
3. **Master CV**: write the complete, uncut record of your career.
4. **Claude Setup**: upload both files to a Claude Project and paste in the system prompt.
5. **Generate**: copy any prompt, paste it into your project, and get a tailored document.

Tick each step as you go. Progress is stored only in your browser and is never uploaded.

## Tech stack

Plain HTML, CSS and vanilla JavaScript with no framework and no build step. Fonts are served by Google Fonts. Hosted on GitHub Pages and deployed by GitHub Actions.

## Project structure

```
.
├── index.html, phase-*.html, portfolio.html,
│   maintenance.html, tips.html, 404.html   Pages
├── css/        Design tokens and styles (base, home, guide)
├── js/         Theme, page behaviour and checklist scripts
├── assets/     Icons, favicon set and social preview image
├── docs/       Guides for maintaining the site
└── .github/    Workflows, issue templates and security automation
```

## Contributing

Spotted a typo or have an idea? [Open an issue](https://github.com/babatundeawo/career-engine-guide/issues/new/choose) or edit a file on GitHub and propose the change as a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## Credits

Fonts: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), [Inter](https://fonts.google.com/specimen/Inter), [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), all under the SIL Open Font License. Icons and logo are original artwork for this project.

Maintained by [Babatunde Awoyemi](https://github.com/babatundeawo). Guides for maintainers are in [`docs/`](docs/DEPLOYMENT.md).
