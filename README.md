# Assessmint

**Beat the clock. Ace the aptitude test.**

Free, timed mock tests for online aptitude assessments, the kind used in consulting, finance, graduate programmes and any hiring process with an online test: Numerical Reasoning, Critical Thinking, Working With Data and Verbal Reasoning. One question per screen, forward-only navigation, a timer per section and a worked solution for every question at the end.

It is a single-file static site. No server, no accounts, no cookies: history and your own tests are kept in the browser's `localStorage`.

> Independent project. Not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original.

## What's inside

- 10 full mock tests (NR 12 · CT 16 · WwD 12; test 7 also has a 15-question Verbal Reasoning section), 415 questions in total.
- Two levels: **Realistic** (1–5) and **Challenging** (6–10).
- A "Your tests" page to load your own questions as JSON (format in [`docs/json-format.md`](docs/json-format.md)).

## Structure

```
src/styles.css      styles (colour tokens, light and dark themes)
src/app.js          the app; site settings live at the top (SITE)
sets/*.json         one file per mock test, same format as user-loaded tests
public/             static files (favicon, robots.txt, _headers); the build writes index.html here
build.mjs           bundles everything into public/index.html
```

## Development

Requires Node 18+. No dependencies.

```
node build.mjs        # writes public/index.html
open public/index.html
```

To add a mock test, create `sets/simulacro-11.json` in the same format and run the build again. Sets are ordered by file name.

## Deploying to Cloudflare Pages

1. Workers & Pages → Create → Pages → Connect to Git, and pick this repository.
2. Build command: `node build.mjs` · Build output directory: `public`.
3. Custom domains → add your domain.

## Settings

Edit the `SITE` object at the top of `src/app.js`:

- `name`: site name.
- `kofi`: Ko-fi link (empty = button hidden).
- `contact`: contact email (empty = hidden).
- `repo`: link to this repository.

## Licence

Code under the MIT licence (see `LICENSE`). The questions in `sets/` are published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): you may reuse them with attribution, for non-commercial purposes, under the same licence.
