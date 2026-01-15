# WebAR 4 Gummies

A static, front-end-only Playground for learning WebAR concepts by editing code in the browser and previewing results instantly.

The Playground currently focuses on:

- A-Frame basics
- Google's `<model-viewer>` for device-native AR (WebXR / Scene Viewer / Quick Look)

## What’s included

- Theme toggle (light/dark) persisted in localStorage
- Playground: in-browser editor + sandboxed iframe preview (templates are stored in each exercise page)
- QR modal on exercise pages (for quick “open on phone” testing)
- Landing page 3D hero (Three.js + a gummy GLB)

## Prerequisites

- A modern browser with WebGL enabled (Chrome / Edge / Safari).
- For AR features on mobile: serve the site over HTTPS (or use `localhost` for local testing).
- For the `model-viewer` AR button:
	- Android: Google Scene Viewer (Chrome)
	- iOS: AR Quick Look (Safari)

## Run locally

This is plain HTML/CSS/JS. Any static server works.

- Python: `python -m http.server 8080`
- Node: `npx serve .`

Then open `http://localhost:8080/`.

## Dependency notes

- This project is intentionally “no build step” (plain HTML/CSS/JS).
- Some pages load libraries from CDNs (A-Frame, `<model-viewer>`, Three.js). If a CDN is blocked (ad blockers / corporate Wi‑Fi), those pages may fail.
- The Playground persists edits in localStorage. If you’re not seeing your latest template updates, clear site storage or use a new browser profile.

## Key files

- `index.html`: landing page + 3D hero
- `exercise.js`: Playground engine (editor + iframe preview + localStorage persistence/migrations)
- `pages/exercises.html`: Playground entry point
- `script.js`: copy-to-clipboard helpers + UI behavior
- `landing-3d.js`: Three.js hero setup + gummy GLB loading
- `styles/`: shared + per-page CSS

## Playground notes

- Entry point: `pages/exercises.html`
- Each Playground exercise page (in `pages/playground/`) contains one or more templates stored as JSON in the HTML.
- User edits are saved per page in localStorage (so template fixes may need migration code in `exercise.js`).

## Deploy

### GitHub Pages (recommended)

This repo includes a GitHub Actions workflow that deploys the site to GitHub Pages on every push to the `main` branch.

1. Push this repo to GitHub (if you haven’t already).
2. In GitHub: **Settings → Pages**
3. Under **Build and deployment**, select **Source: GitHub Actions**.
4. Push to `main` — the workflow will publish the site.

### Other static hosts

You can also host this folder on any static host (Netlify, Vercel static, S3, etc.).

## TODO

See `TODO.md` for the live checklist. Current highlights:

1. Replace external gist embeds with local snippets (optional) for fully-offline usage.
2. Add a minimal “live demo” section per framework (not just instructions).
