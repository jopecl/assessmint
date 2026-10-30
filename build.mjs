// Build: node build.mjs → public/ (static site: one HTML file per page + hashed assets) and dist/artifact.html (single-file preview)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { createHash } from "node:crypto";

const ORIGIN = "https://assessmint.app";
const css = readFileSync("src/styles.css", "utf8");
const app = readFileSync("src/app.js", "utf8");
const pages = JSON.parse(readFileSync("src/pages.json", "utf8"));
const sets = readdirSync("sets").filter(f => f.endsWith(".json")).sort()
  .map(f => JSON.parse(readFileSync(`sets/${f}`, "utf8")));
const name = (app.match(/name:\s*"([^"]+)"/) || [])[1] || "Site";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// One page per mock test: /mock-tests/1 … /mock-tests/N
const LEVEL = { realistic: "Realistic", challenging: "Challenging" };
sets.forEach((s, i) => {
  const n = ["NR", "CT", "WwD"].reduce((a, k) => a + (s.sections[k]?.questions.length || 0), 0);
  const min = ["NR", "CT", "WwD"].reduce((a, k) => a + (s.sections[k] ? s.sections[k].minutes || { NR: 10, CT: 12, WwD: 10 }[k] : 0), 0);
  pages[`mock-tests/${i + 1}`] = {
    title: `${s.title} · Free aptitude test practice · ${name}`,
    description: `${s.title}${s.level ? ` (${LEVEL[s.level] || s.level})` : ""}: ${n} questions in ${min} minutes across numerical reasoning, critical thinking and data interpretation, with a worked solution for every question.`
  };
});
pages["404"] = { title: `Page not found · ${name}`, description: "This page doesn't exist.", noindex: true };

// Fonts: separate files on the site, inlined in the single-file preview
const FONTS = [["Geist", "geist.woff2", "normal", "100 900"], ["Newsreader", "newsreader.woff2", "normal", "200 800"], ["Newsreader", "newsreader-italic.woff2", "italic", "200 800"], ["JetBrains Mono", "jetbrains-mono.woff2", "normal", "100 800"]];
const faces = src => FONTS.map(([family, file, style, weight]) => `@font-face{font-family:"${family}";src:url(${src(file)}) format("woff2");font-style:${style};font-weight:${weight};font-display:swap}`).join("\n");
const js = router => `const ROUTER = "${router}";\nconst PAGES = ${JSON.stringify(pages)};\nconst BUILTIN_SETS = ${JSON.stringify(sets)};\n${app}`;
const hash = s => createHash("sha256").update(s).digest("hex").slice(0, 10);

// ---------- static site ----------
rmSync("public", { recursive: true, force: true });
mkdirSync("public/assets/fonts", { recursive: true });
cpSync("static", "public", { recursive: true });
FONTS.forEach(([, file]) => cpSync(`src/fonts/${file}`, `public/assets/fonts/${file}`));
const siteCss = `${faces(f => `/assets/fonts/${f}`)}\n${css}`;
const siteJs = js("path");
const cssFile = `assets/style.${hash(siteCss)}.css`, jsFile = `assets/app.${hash(siteJs)}.js`;
writeFileSync(`public/${cssFile}`, siteCss);
writeFileSync(`public/${jsFile}`, siteJs);

for (const [path, p] of Object.entries(pages)) {
  const url = path === "404" ? "" : `${ORIGIN}/${path}`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#0d9668">
<meta property="og:site_name" content="${name}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:type" content="website">
${url ? `<meta property="og:url" content="${url}">` : ""}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/${cssFile}">
<script>try{var t=localStorage.getItem("amint.theme");t=t&&JSON.parse(t);if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body>
<div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
<div id="app"><main class="wrap"><h1>${esc(p.title.split(" · ")[0])}</h1><p>${esc(p.description)}</p></main></div>
<script src="/${jsFile}"></script>
</body>
</html>
`;
  const out = `public/${path || "index"}.html`;
  mkdirSync(out.slice(0, out.lastIndexOf("/")), { recursive: true });
  writeFileSync(out, html);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(pages).filter(([, p]) => !p.noindex).map(([path]) => `  <url><loc>${ORIGIN}/${path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);

// ---------- single-file preview (hash routing, everything inline) ----------
mkdirSync("dist", { recursive: true });
const b64 = f => `data:font/woff2;base64,${readFileSync(`src/fonts/${f}`).toString("base64")}`;
writeFileSync("dist/artifact.html", `<title>${name}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
${faces(b64)}
${css}
</style>
<div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
<div id="app"></div>
<script>
${js("hash")}
</script>
`);

const n = sets.reduce((a, s) => a + Object.values(s.sections).reduce((b, x) => b + x.questions.length, 0), 0);
console.log(`${sets.length} sets, ${n} questions, ${Object.keys(pages).length} pages → public/, dist/artifact.html`);
