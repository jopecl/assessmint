// Build: node build.mjs → public/index.html (static site) + dist/artifact.html (fragment for preview)
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";

const css = readFileSync("src/styles.css", "utf8");
const app = readFileSync("src/app.js", "utf8");
const sets = readdirSync("sets").filter(f => f.endsWith(".json")).sort()
  .map(f => JSON.parse(readFileSync(`sets/${f}`, "utf8")));
const name = (app.match(/name:\s*"([^"]+)"/) || [])[1] || "Site";
const desc = "Free, timed mock tests in numerical reasoning, critical thinking and working with data to prepare for online aptitude tests in consulting, finance, graduate programmes and any hiring process.";
// Fonts are self-hosted (inlined), so the page makes no third-party requests
const face = (family, file, style = "normal", weight = "100 900") =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${readFileSync(`src/fonts/${file}`).toString("base64")}) format("woff2");font-style:${style};font-weight:${weight};font-display:swap}`;
const fonts = `<style>${[face("Geist", "geist.woff2"), face("Newsreader", "newsreader.woff2", "normal", "200 800"), face("Newsreader", "newsreader-italic.woff2", "italic", "200 800"), face("JetBrains Mono", "jetbrains-mono.woff2", "normal", "100 800")].join("\n")}</style>`;
const body = `<div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
<div id="app"></div>
<script>
const BUILTIN_SETS = ${JSON.stringify(sets)};
${app}
</script>`;

mkdirSync("public", { recursive: true }); mkdirSync("dist", { recursive: true });
writeFileSync("public/index.html", `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${name} · Beat the clock, ace the aptitude test</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0d9668">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://assessmint.app/">
<link rel="canonical" href="https://assessmint.app/">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
${fonts}
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`);
writeFileSync("dist/artifact.html", `<title>${name}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}
</style>
${body}
`);
const n = sets.reduce((a, s) => a + Object.values(s.sections).reduce((b, x) => b + x.questions.length, 0), 0);
console.log(`${sets.length} sets, ${n} questions → public/index.html, dist/artifact.html`);
