# Assessmint

**Beat the clock. Ace the aptitude test.**

Free, timed mock tests for online aptitude assessments, the kind used in consulting, finance, graduate programmes and any hiring process with an online test: Numerical Reasoning, Critical Thinking, Working With Data and Verbal Reasoning. One question per screen, forward-only navigation, a timer per section and a worked solution for every question at the end.

It is a static site with no server code, no accounts and no cookies: history and your own tests are kept in the browser's `localStorage`. Each page (home, one per test type, one per mock test, About…) is its own HTML file with its own title and description, so search engines can index them.

> Independent project. Not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original.

## What's inside

- 10 full mock tests (NR 12 · CT 16 · WwD 12; test 7 also has a 15-question Verbal Reasoning section), 415 questions in total.
- Two levels: **Realistic** (1–5) and **Challenging** (6–10).
- A "Your tests" page to load your own questions as JSON (format in [`docs/json-format.md`](docs/json-format.md)).

## Structure

```
src/app.js          the app (router, pages, test engine); site settings at the top (SITE)
src/styles.css      styles (colour tokens, light and dark themes)
src/pages.json      title and meta description for each page
src/fonts/          self-hosted fonts
sets/*.json         one file per mock test, same format as user-loaded tests
static/             copied as-is into public/ (favicon, robots.txt, _headers)
build.mjs           writes public/ (one HTML per page, hashed CSS/JS, sitemap.xml) and dist/artifact.html
```

## Development

Requires Node 18+. No dependencies.

```
node build.mjs                 # writes public/
npx wrangler dev               # serves public/ like production, with clean URLs
```

To add a mock test, create `sets/simulacro-11.json` in the same format and run the build again. Sets are ordered by file name.

## Deploying to Cloudflare

The site is served as Workers static assets (`wrangler.jsonc` points at `public/`).

1. Workers & Pages → Create → Import a repository, and pick this repository.
2. Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
3. In the Worker: Settings → Domains & Routes → Add → Custom domain.

Cloudflare Pages also works: build command `node build.mjs`, output directory `public`.

## Settings

Edit the `SITE` object at the top of `src/app.js`:

- `name`: site name.
- `kofi`: Ko-fi link (empty = button hidden).
- `contact`: contact email (empty = hidden).
- `repo`: public link to the source code in the footer (empty = hidden).
- `author`, `linkedin`: shown on the About page and in the footer.

## Licence

Code under the MIT licence (see `LICENSE`). The questions in `sets/` are published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): you may reuse them with attribution, for non-commercial purposes, under the same licence.

Fonts in `src/fonts/` (Geist, Newsreader, JetBrains Mono) are under the [SIL Open Font License 1.1](https://openfontlicense.org) and are inlined into the page at build time, so the site makes no third-party requests.
