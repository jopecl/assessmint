/* ---------- site config: edit here ---------- */
const SITE = {
  name: "Assessmint",
  tagline: "Free timed practice for online aptitude tests",
  kofi: "https://ko-fi.com/assessmint",
  contact: "fixmi.app@gmail.com",
  repo: "",     // public source link in the footer (empty = hidden)
  author: "José Pérez",
  linkedin: "https://www.linkedin.com/in/joseperezclar/"
};

const SECTIONS = {
  NR: { name: "Numerical Reasoning", short: "Numerical", min: 10 },
  CT: { name: "Critical Thinking", short: "Logic", min: 12 },
  WwD: { name: "Working With Data", short: "Data", min: 10 },
  VR: { name: "Verbal Reasoning", short: "Verbal", min: 10 }
};
const ORDER = ["NR", "CT", "WwD", "VR"];
const LETTERS = "ABCDEFGH";
const LEVELS = { realistic: "Realistic", challenging: "Challenging", own: "Yours" };
const KEY_CUSTOM = "amint.custom.v1", KEY_HIST = "amint.history.v1", KEY_DONE = "amint.done.v1", KEY_THEME = "amint.theme", KEY_FILTER = "amint.filter";
const app = document.getElementById("app");

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>").replace(/`(.+?)`/g, "<code>$1</code>");
function md(src) {
  if (!src) return "";
  const blocks = String(src).replace(/\r/g, "").split(/\n\s*\n/);
  return blocks.map(b => {
    const lines = b.split("\n").filter(l => l.trim() !== "");
    if (!lines.length) return "";
    if (lines.every(l => l.trim().startsWith("|"))) {
      const rows = lines.filter(l => !/^\s*\|?\s*:?-{2,}/.test(l)).map(l => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
      const [h, ...body] = rows;
      return `<div class="scroll-x"><table><thead><tr>${h.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    if (lines.every(l => /^\s*-\s/.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*-\s/, ""))}</li>`).join("")}</ul>`;
    // paragraph possibly followed by a list
    let html = "", para = [], list = [];
    const flushP = () => { if (para.length) { html += `<p>${para.map(inline).join("<br>")}</p>`; para = []; } };
    const flushL = () => { if (list.length) { html += `<ul>${list.map(l => `<li>${inline(l)}</li>`).join("")}</ul>`; list = []; } };
    for (const l of lines) { if (/^\s*-\s/.test(l)) { flushP(); list.push(l.replace(/^\s*-\s/, "")); } else { flushL(); para.push(l); } }
    flushP(); flushL();
    return html;
  }).join("");
}
const fmt = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const norm = a => (a || "").toUpperCase().split("").filter(c => LETTERS.includes(c)).sort().join("");
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* ---------- icons ---------- */
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade9f"/><stop offset=".55" stop-color="#10b981"/><stop offset="1" stop-color="#047857"/></linearGradient><linearGradient id="lg-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#lg-a)"/><rect x="1" y="1" width="30" height="15" rx="8" fill="url(#lg-b)"/><path d="M9 21.5c0-6.4 5.1-11.5 14-12-.4 8.6-5.5 13.6-11.7 13.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 23.5c2.6-3.6 5.5-6.2 9-8.2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const I = {
  menu: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  sun: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  moon: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`,
  auto: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></svg>`,
  cup: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3v3M12 3v3"/></svg>`,
  play: `<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>`,
  chev: `<svg class="ico chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  close: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  check: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  linkedin: `<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63V21h-4z"/></svg>`,
  upload: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>`
};

/* ---------- theme ---------- */
function applyTheme() { const t = store.get(KEY_THEME, "auto"); if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; return t; }
function cycleTheme() { const t = store.get(KEY_THEME, "auto"); store.set(KEY_THEME, t === "auto" ? "light" : t === "light" ? "dark" : "auto"); applyTheme(); render(); }

/* ---------- charts ---------- */
const num = v => typeof v === "number" && Math.abs(v) >= 1000 ? v.toLocaleString("en-US") : String(v);
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p; return 10 * p; }
function chartHTML(c) {
  if (!c) return "";
  const col = i => `var(--s${(i % 4) + 1})`;
  const legend = c.series.length > 1 ? `<div class="legend">${c.series.map((s, i) => `<span><i style="background:${col(i)}"></i>${esc(s.name)}</span>`).join("")}</div>` : "";
  const W = 600, H = 280, L = 44, R = 16, T = 20, B = 34, pw = W - L - R, ph = H - T - B;
  const unit = c.unit || "";
  let svg = "";
  if (c.type === "stacked") {
    const n = c.categories.length, colW = 70, gap = (pw - n * colW) / (n + 1);
    const y = v => T + ph - (v / 100) * ph;
    for (let t = 0; t <= 100; t += 25) svg += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}%</text>`;
    c.categories.forEach((cat, ci) => {
      const x = L + gap + ci * (colW + gap); let acc = 0;
      c.series.forEach((s, si) => {
        const v = s.values[ci], y0 = y(acc), y1 = y(acc + v);
        svg += `<rect x="${x}" y="${y1 + 1}" width="${colW}" height="${Math.max(0, y0 - y1 - 2)}" fill="${col(si)}" rx="3"><title>${esc(s.name)} ${cat}: ${v}%</title></rect>`;
        svg += `<text class="val" x="${x + colW + 8}" y="${(y0 + y1) / 2 + 4}">${v}%</text>`;
        acc += v;
      });
      svg += `<text x="${x + colW / 2}" y="${H - 12}" text-anchor="middle">${esc(cat)}</text>`;
    });
  } else {
    const all = c.series.flatMap(s => s.values), min = c.type === "line" && c.yMin ? c.yMin : 0;
    const max = min + niceMax((Math.max(...all) - min) * 1.1);
    const y = v => T + ph - ((v - min) / (max - min)) * ph;
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) { const v = min + (max - min) / ticks * i; svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${num(+v.toFixed(2))}</text>`; }
    const n = c.categories.length;
    if (c.type === "line") {
      const x = i => L + 20 + i * ((pw - 40) / (n - 1));
      c.series.forEach((s, si) => {
        svg += `<polyline fill="none" stroke="${col(si)}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}"/>`;
      });
      c.series.forEach((s, si) => s.values.forEach((v, i) => {
        const others = c.series.map(o => o.values[i]).filter((_, j) => j !== si);
        const above = others.filter(o => o >= v), below = others.filter(o => o < v);
        const gapUp = above.length ? Math.min(...above) - v : Infinity, gapDown = below.length ? v - Math.max(...below) : Infinity;
        let ly = gapUp >= gapDown ? y(v) - 9 : y(v) + 17; if (ly > T + ph - 2) ly = y(v) - 9; if (ly < 12) ly = y(v) + 17;
        svg += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${col(si)}" stroke="var(--surface)" stroke-width="2"><title>${esc(s.name)} ${c.categories[i]}: ${v}${unit}</title></circle>`;
        svg += `<text class="val" x="${x(i)}" y="${ly}" text-anchor="middle">${num(v)}${unit}</text>`;
      }));
      c.categories.forEach((cat, i) => svg += `<text x="${x(i)}" y="${H - 12}" text-anchor="middle">${esc(cat)}</text>`);
    } else {
      const gw = pw / n, k = c.series.length, bw = Math.min(30, (gw - 16) / k - 2);
      c.categories.forEach((cat, ci) => {
        const gx = L + ci * gw + (gw - k * (bw + 2)) / 2;
        c.series.forEach((s, si) => {
          const v = s.values[ci], bx = gx + si * (bw + 2);
          svg += `<rect x="${bx}" y="${y(v)}" width="${bw}" height="${T + ph - y(v)}" fill="${col(si)}" rx="3"><title>${esc(s.name)} ${cat}: ${v}${unit}</title></rect>`;
          svg += `<text class="val" x="${bx + bw / 2}" y="${y(v) - 5}" text-anchor="middle" style="font-size:11px">${num(v)}</text>`;
        });
        svg += `<text x="${L + ci * gw + gw / 2}" y="${H - 12}" text-anchor="middle">${esc(cat)}</text>`;
      });
    }
  }
  svg += `<line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="var(--muted)" stroke-width="1"/>`;
  return `<div class="chart">${c.title ? `<div class="chart-title">${esc(c.title)}</div>` : ""}${legend}<div class="svgbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title || "Chart")}">${svg}</svg></div>${c.note ? `<div class="chart-note">${inline(c.note)}</div>` : ""}</div>`;
}

/* ---------- sets ---------- */
function allSets() { return [...BUILTIN_SETS, ...store.get(KEY_CUSTOM, []).map(s => ({ ...s, custom: true, level: "own" }))]; }
function getSet(id) { return allSets().find(s => s.id === id); }
function secMinutes(set, k) { return set.sections[k].minutes || SECTIONS[k].min; }
const hasSec = (s, k) => !!(s.sections[k] && s.sections[k].questions && s.sections[k].questions.length);
const totalQuestions = () => BUILTIN_SETS.reduce((a, s) => a + ORDER.reduce((b, k) => b + (hasSec(s, k) ? s.sections[k].questions.length : 0), 0), 0);

/* ---------- run state ---------- */
let run = null, tick = null;

function startRun(setId, order, label) {
  const set = getSet(setId);
  if (!set) return;
  const from = run ? run.from : curPath();
  run = { set, order, label, from, secIdx: 0, results: {}, startedAt: Date.now() };
  // an extra history entry so the browser's Back button exits the test instead of the site
  if (history.state && history.state.test) history.replaceState({ test: 1 }, "", location.href);
  else history.pushState({ test: 1 }, "", location.href);
  showIntro();
}
// Leave the current test (asks first if answers would be lost) and go to a page
function exitTest(to) {
  if (run && (run.cur || (run.secIdx > 0 && !run.finished)) && !confirm("Leave the test? This attempt will be lost.")) return false;
  const target = to ?? (run ? run.from : "");
  clearInterval(tick); window.onkeydown = null; run = null;
  if (history.state && history.state.test) history.replaceState(null, "", href(target));
  else if (PATH_MODE) history.pushState(null, "", href(target));
  else if (location.hash !== href(target)) { location.hash = href(target); return true; }
  render();
  return true;
}
function curKey() { return run.order[run.secIdx]; }
function curSec() { return run.set.sections[curKey()]; }

/* ---------- done tracking ---------- */
function sectionsDone(s, hist) {
  const done = new Set();
  hist.filter(h => h.setId === s.id).forEach(h => (h.sections || []).forEach(k => done.add(k)));
  return done;
}
function isDone(s, hist) {
  const manual = store.get(KEY_DONE, {});
  if (s.id in manual) return manual[s.id];
  const keys = ORDER.filter(k => hasSec(s, k));
  const core = keys.filter(k => k !== "VR");
  const d = sectionsDone(s, hist);
  return (core.length ? core : keys).every(k => d.has(k));
}

/* ---------- routing ---------- */
// "path" on the real site (one HTML file per page), "hash" in the single-file preview
const PATH_MODE = typeof ROUTER !== "undefined" && ROUTER === "path" && location.protocol !== "file:";
const href = p => (PATH_MODE ? "/" : "#/") + p;
const curPath = () => (PATH_MODE ? location.pathname : location.hash.replace(/^#/, "")).replace(/^\/+|\/+$/g, "").replace(/(^|\/)index$|\.html$/, "");
const TOPICS = { "numerical-reasoning-test": "NR", "critical-thinking-test": "CT", "data-interpretation-test": "WwD", "verbal-reasoning-test": "VR" };
const topicPath = k => Object.keys(TOPICS).find(p => TOPICS[p] === k);
const setNum = s => BUILTIN_SETS.findIndex(x => x.id === s.id) + 1; // 0 = one of your own tests
const setPath = s => setNum(s) ? `mock-tests/${setNum(s)}` : "my-tests";
function go(p) {
  if (PATH_MODE) { history.pushState(null, "", href(p)); render(); }
  else if (location.hash === href(p)) render();
  else location.hash = href(p);
}
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
  const h = a.getAttribute("href");
  if (!(PATH_MODE ? /^\/(?!\/)/ : /^#\//).test(h)) return;
  e.preventDefault();
  const p = h.replace(/^#?\//, "");
  if (run) exitTest(p); else go(p);
});
addEventListener("popstate", () => {
  if (!run) { if (PATH_MODE) render(true); return; }
  if (run.cur && !confirm("Leave the test? This attempt will be lost.")) { history.pushState({ test: 1 }, "", location.href); return; }
  clearInterval(tick); window.onkeydown = null; run = null; render();
});
addEventListener("hashchange", () => {
  if (PATH_MODE) return;
  if (run) { clearInterval(tick); window.onkeydown = null; run = null; }
  render();
});
addEventListener("beforeunload", e => { if (run && run.cur) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- shell ---------- */
const NAV_TOPICS = [["NR", "Percentages, tables, series"], ["CT", "Syllogisms, ordering, arguments"], ["WwD", "Charts, statistics, data quality"], ["VR", "True, False or Cannot Say"]];
const TOPIC_NAMES = { NR: "Numerical reasoning", CT: "Critical thinking", WwD: "Data interpretation", VR: "Verbal reasoning" };
function shell(inner, active) {
  const t = store.get(KEY_THEME, "auto");
  const link = (p, l) => `<a href="${href(p)}">${l}</a>`;
  return `<header class="topbar"><div class="wrap" style="position:relative">
      <nav class="nav glass" aria-label="Main">
        <a class="brand" href="${href("")}">${LOGO}<span>${esc(SITE.name)}</span></a>
        <div class="navlinks" id="navlinks">
          <a href="${href("")}"${active === "" ? ` aria-current="page"` : ""}>Mock tests</a>
          <div class="navgroup" id="navgroup"><button class="navdrop" id="navdrop" aria-expanded="false" aria-controls="dropmenu"${TOPICS[active] ? ` aria-current="page"` : ""}>Practice by topic${I.chev}</button>
            <div class="dropmenu" id="dropmenu">${NAV_TOPICS.map(([k, d]) => `<a href="${href(topicPath(k))}"${topicPath(k) === active ? ` aria-current="page"` : ""}><i class="dot dot-${k}"></i><span><strong>${TOPIC_NAMES[k]}</strong><small>${d}</small></span></a>`).join("")}</div></div>
          <a href="${href("history")}"${active === "history" ? ` aria-current="page"` : ""}>History</a>
          <a href="${href("about")}"${active === "about" ? ` aria-current="page"` : ""}>About</a>
        </div>
        ${SITE.kofi ? `<a class="btn btn-sm kofi" href="${esc(SITE.kofi)}" target="_blank" rel="noopener">${I.cup}<span class="kofi-label">Buy me a coffee</span></a>` : ""}
        <button class="btn iconbtn" id="theme" title="Theme: ${t === "auto" ? "automatic" : t === "light" ? "light" : "dark"}" aria-label="Change theme">${t === "auto" ? I.auto : t === "light" ? I.sun : I.moon}</button>
        <button class="btn iconbtn menu-toggle" id="menu" aria-label="Menu" aria-expanded="false">${I.menu}</button>
      </nav></div></header>
    <main class="wrap fade-in">${inner}</main>
    <footer class="wrap site-foot"><div class="glass foot-grid">
      <div class="foot-brand"><a class="brand" href="${href("")}">${LOGO}<span>${esc(SITE.name)}</span></a>
        <p>Free, independent practice for online aptitude tests. Not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original.</p>
        <p>Made by ${authorLink()}, free for everyone. ${link("about", "Why?")}</p></div>
      <nav aria-label="Practice"><h4>Practice</h4>${link("", "Mock tests")}${link("numerical-reasoning-test", "Numerical reasoning")}${link("critical-thinking-test", "Critical thinking")}${link("data-interpretation-test", "Data interpretation")}${link("verbal-reasoning-test", "Verbal reasoning")}</nav>
      <nav aria-label="Your practice"><h4>Yours</h4>${link("my-tests", "Your tests")}${link("history", "History")}</nav>
      <nav aria-label="Site"><h4>${esc(SITE.name)}</h4>${link("about", "About")}${link("privacy", "Privacy")}${SITE.contact ? `<a href="mailto:${esc(SITE.contact)}">Contact</a>` : ""}${SITE.repo ? `<a href="${esc(SITE.repo)}" target="_blank" rel="noopener">Source code</a>` : ""}${SITE.kofi ? `<a href="${esc(SITE.kofi)}" target="_blank" rel="noopener">Ko-fi</a>` : ""}</nav>
    </div></footer>`;
}
function wireShell() {
  const th = document.getElementById("theme"); if (th) th.onclick = cycleTheme;
  const m = document.getElementById("menu"), nl = document.getElementById("navlinks");
  if (m) m.onclick = () => { const o = nl.classList.toggle("open"); m.setAttribute("aria-expanded", o); };
  const g = document.getElementById("navgroup"), d = document.getElementById("navdrop");
  if (d) d.onclick = e => { e.stopPropagation(); d.setAttribute("aria-expanded", g.classList.toggle("open")); };
}
document.addEventListener("click", e => {
  const g = document.getElementById("navgroup");
  if (g && g.classList.contains("open") && !g.contains(e.target)) { g.classList.remove("open"); document.getElementById("navdrop").setAttribute("aria-expanded", "false"); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") document.getElementById("navgroup")?.classList.remove("open"); });
function render(keepScroll) {
  if (run) return;
  clearInterval(tick); window.onkeydown = null;
  const p = curPath(), m = p.match(/^mock-tests\/(\d+)$/), set = m && BUILTIN_SETS[+m[1] - 1];
  let key = p;
  if (TOPICS[p]) showTopic(TOPICS[p]);
  else if (set) showSetPage(set);
  else if (p === "my-tests") showMyTests();
  else if (p === "history") showHistory();
  else if (p === "about") showAbout();
  else if (p === "privacy") showPrivacy();
  else if (p === "" || p === "mock-tests") { key = ""; showHome(); }
  else { key = "404"; showNotFound(); }
  if (typeof PAGES !== "undefined" && PAGES[key]) document.title = PAGES[key].title;
  if (p === "mock-tests") document.getElementById("sims")?.scrollIntoView();
  else if (!keepScroll) window.scrollTo(0, 0);
  reveal();
}
function crumbs(list) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${list.map(([p, l], i) => i < list.length - 1 ? `<a href="${href(p)}">${esc(l)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(l)}</span>`).join("")}</nav>`;
}

/* ---------- motion: scroll reveal + ambient parallax ---------- */
const calm = matchMedia("(prefers-reduced-motion: reduce)");
let revealObs;
function reveal() {
  const els = app.querySelectorAll(".hero > div, .toolbar, .set, .how, .mission, .page > header, .page > .glass, .page > .sets, .topic-grid > .glass, .pager");
  if (calm.matches || !("IntersectionObserver" in window)) return;
  revealObs?.disconnect();
  revealObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  let row = -1, top = null;
  els.forEach(el => {
    // stagger cards that sit on the same row
    const t = Math.round(el.getBoundingClientRect().top);
    row = t === top ? row + 1 : 0; top = t;
    el.style.setProperty("--d", `${Math.min(row, 4) * 0.07}s`);
    el.classList.add("reveal");
    revealObs.observe(el);
  });
  measure(); float();
}
// home: the hero stays put while the mock cards float up over it, each column at its own pace.
// Scroll work writes plain (non-inherited) properties on a handful of elements and reads layout
// before writing, so a scroll frame never restyles the whole page.
const blobs = [...document.querySelectorAll(".ambient i")], BLOB_K = [-.12, -.22, .08];
let stage = null; // cached per render: { hero, bar, cards, cols, top }
function measure() {
  const hero = app.querySelector(".stage > .hero");
  stage = null;
  if (!hero || calm.matches) return;
  hero.style.top = "";
  const nav = app.querySelector(".nav")?.getBoundingClientRect().bottom || 0;
  const sets = app.querySelector(".sets");
  stage = {
    hero, bar: app.querySelector(".stage > .toolbar"), cards: [...app.querySelectorAll(".stage .set")],
    cols: sets ? getComputedStyle(sets).gridTemplateColumns.split(" ").length : 1,
    top: Math.min(nav + 8, innerHeight - hero.offsetHeight), q: -1, fy: []
  };
  hero.style.top = `${stage.top}px`;
}
function float() {
  if (calm.matches) return;
  const y = scrollY;
  blobs.forEach((b, i) => { b.style.translate = `0 ${Math.max(-180, Math.min(180, y * BLOB_K[i])).toFixed(1)}px`; });
  if (!stage) return;
  const vh = innerHeight, { hero, bar, cards, cols } = stage;
  // reads
  const r = hero.getBoundingClientRect(), barTop = bar ? bar.getBoundingClientRect().top : vh;
  const tops = cards.map((c, i) => c.getBoundingClientRect().top - (stage.fy[i] || 0));
  // writes
  const p = Math.max(0, Math.min(1, (r.bottom - barTop) / Math.max(1, r.height)));
  const q = Math.round(Math.min(1, p * 3.5) * 100) / 100; // gone once the cards cover under a third of it
  if (q !== stage.q) {
    stage.q = q;
    hero.style.opacity = 1 - q;
    hero.style.transform = q ? `scale(${1 - .04 * q})` : "";
    hero.style.visibility = q >= 1 ? "hidden" : "";
    hero.classList.toggle("covered", q > .5);
  }
  cards.forEach((c, i) => {
    const t = tops[i] / vh, fy = t > 1.2 || t < 0 ? (t < 0 ? 0 : stage.fy[i] ?? 0) : Math.round(Math.max(0, t - .3) * [70, 120, 95][i % cols % 3]);
    if (fy !== stage.fy[i]) { stage.fy[i] = fy; c.style.translate = fy ? `0 ${fy}px` : ""; }
  });
}
let sy = 0;
addEventListener("scroll", () => {
  if (calm.matches || sy) return;
  sy = requestAnimationFrame(() => { float(); sy = 0; });
}, { passive: true });
addEventListener("resize", () => { measure(); float(); });
function goHome() { exitTest(""); }

/* ---------- home ---------- */
function setCard(s, hist) {
  const done = isDone(s, hist), partial = sectionsDone(s, hist);
  const full = hasSec(s, "NR") && hasSec(s, "CT") && hasSec(s, "WwD"), verbal = hasSec(s, "NR") && hasSec(s, "CT") && hasSec(s, "VR");
  const keys = ORDER.filter(k => hasSec(s, k));
  const fullMin = o => o.reduce((a, k) => a + secMinutes(s, k), 0);
  const nQ = (full ? ["NR", "CT", "WwD"] : keys).reduce((a, k) => a + s.sections[k].questions.length, 0);
  // four fixed rows (head, main action, sections, footer) so buttons line up across cards
  return `<article class="set glass${s.level ? ` set-${esc(s.level)}` : ""}${done ? " set-done" : ""}">
    <div class="set-head"><div><h3>${setNum(s) ? `<a href="${href(setPath(s))}">${esc(s.title)}</a>` : esc(s.title)}${done ? ` <span class="pill ok">Done</span>` : ""}</h3><p class="meta">${nQ} questions · ${full ? fullMin(["NR", "CT", "WwD"]) : fullMin(keys)} min</p>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}</div>
      ${s.level ? `<span class="lvl lvl-${esc(s.level)}">${esc(LEVELS[s.level] || s.level)}</span>` : ""}</div>
    <div class="actions">
      ${full ? `<button class="btn btn-primary" data-run="${esc(s.id)}" data-order="NR,CT,WwD" data-label="Full mock">${I.play}<span>Start full mock</span><span>${fullMin(["NR", "CT", "WwD"])} min</span></button>` : ""}
      ${verbal ? `<button class="btn" data-run="${esc(s.id)}" data-order="NR,CT,VR" data-label="Full mock (verbal)"><span>Verbal version</span><span>${fullMin(["NR", "CT", "VR"])} min</span></button>` : ""}
    </div>
    <div><p class="split-lbl">${full || verbal ? "Or practise one section" : "Sections"}</p><div class="split" role="group" aria-label="Single sections">${keys.map(k => `<button class="seg-btn${partial.has(k) ? " is-done" : ""}" data-run="${esc(s.id)}" data-order="${k}" data-label="${SECTIONS[k].name}" title="${SECTIONS[k].name} · ${s.sections[k].questions.length} questions · ${secMinutes(s, k)} min">${partial.has(k) ? I.check : `<i class="dot dot-${k}"></i>`}<span>${SECTIONS[k].short}</span></button>`).join("")}</div></div>
    <div class="set-foot"><button class="btn btn-ghost btn-sm" data-mark="${esc(s.id)}" data-val="${done ? "0" : "1"}">${done ? "Move back to to-do" : `${I.check}Mark as done`}</button>
      ${s.custom ? `<span class="row" style="gap:4px"><button class="btn btn-ghost btn-sm" data-export="${esc(s.id)}">Download</button><button class="btn btn-ghost btn-sm" data-del="${esc(s.id)}">Delete</button></span>` : ""}</div>
  </article>`;
}
function wireCards() {
  app.querySelectorAll("[data-run]").forEach(b => b.onclick = () => startRun(b.dataset.run, b.dataset.order.split(","), b.dataset.label));
  app.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    if (b.dataset.armed) { store.set(KEY_CUSTOM, store.get(KEY_CUSTOM, []).filter(s => s.id !== b.dataset.del)); render(); }
    else { b.dataset.armed = "1"; b.textContent = "Sure?"; }
  });
  app.querySelectorAll("[data-export]").forEach(b => b.onclick = () => {
    const s = store.get(KEY_CUSTOM, []).find(x => x.id === b.dataset.export); if (!s) return;
    const { id, ...clean } = s;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" }));
    a.download = (s.title || "test").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json"; a.click();
  });
  app.querySelectorAll("[data-mark]").forEach(b => b.onclick = () => {
    const m = store.get(KEY_DONE, {}); m[b.dataset.mark] = b.dataset.val === "1"; store.set(KEY_DONE, m); render(true);
  });
}

function showHome() {
  const hist = store.get(KEY_HIST, []);
  const filter = store.get(KEY_FILTER, "all");
  const sets = allSets().filter(s => filter === "all" || s.level === filter || (filter === "todo" && !isDone(s, hist)));
  const next = BUILTIN_SETS.find(s => !isDone(s, hist)) || BUILTIN_SETS[0];
  const nSets = BUILTIN_SETS.filter(s => hasSec(s, "NR") && hasSec(s, "CT") && hasSec(s, "WwD")).length;
  const filters = [["all", "All"], ["todo", "To do"], ["realistic", "Realistic"], ["challenging", "Challenging"], ...(store.get(KEY_CUSTOM, []).length ? [["own", "Yours"]] : [])];
  app.innerHTML = shell(`
    <div class="stage">
    <section class="hero">
      <div>
        <h1>Beat the clock. <span class="serif grad-text">Ace the aptitude test.</span></h1>
        <p class="lead">Full, timed mock tests for the online assessments that screen applicants, with a worked solution for every question.</p>
        <div class="row cta"><button class="btn btn-primary btn-lg" data-run="${esc(next.id)}" data-order="NR,CT,WwD" data-label="Full mock">${I.play}Start ${esc(next.title)}</button><a class="btn btn-lg" href="${href("my-tests")}">${I.upload}Load your own test</a></div>
        <p class="fineprint"><span>${I.check}Free</span><span>${I.check}No account</span><span>${I.check}Runs in your browser</span></p>
      </div>
      <div class="hero-side">
        <p class="hs-eyebrow">One mock, three timed sections</p>
        <ol class="hs-list">
          ${["NR", "CT", "WwD"].map((k, i) => `<li><a href="${href(topicPath(k))}"><span class="hs-n hs-${k}">0${i + 1}</span><span class="hs-body"><span class="hs-name">${SECTIONS[k].name}</span><span class="hs-desc">${({ NR: "Percentages, tables, series and quick estimation.", CT: "Syllogisms, sequencing, assumptions and arguments.", WwD: "Charts, statistics and spotting bad data." })[k]}</span></span><span class="hs-meta">${({ NR: 12, CT: 16, WwD: 12 })[k]} q · ${SECTIONS[k].min} min</span></a></li>`).join("")}
        </ol>
        <p class="hs-foot"><span><b>${nSets}</b> mock tests</span><span><b>${totalQuestions()}</b> original questions</span><span><b>32</b> minutes each</span></p>
      </div>
    </section>
    <div class="toolbar" id="sims"><h2>Mock tests</h2><div class="seg" role="group" aria-label="Filter">${filters.map(([v, l]) => `<button data-filter="${v}" aria-pressed="${v === filter}">${l}</button>`).join("")}</div></div>
    ${sets.length ? `<section class="sets">${sets.map(s => setCard(s, hist)).join("")}</section>` : `<div class="glass empty"><p>No mock tests match this filter.</p></div>`}
    </div>
    <section class="how"><h2>How it works</h2><div class="glass steps">
      <div class="step"><span class="n">01</span><h3>Pick a level</h3><p class="muted small"><strong>Realistic</strong> mirrors the difficulty candidates report for the real thing. <strong>Challenging</strong> has longer calculations and subtler traps, so test day feels easy.</p></div>
      <div class="step"><span class="n">02</span><h3>Sit it in one go</h3><p class="muted small">Three timed sections back to back. Keep a calculator, pen and paper handy. A blank answer counts as wrong, and wrong answers cost nothing extra.</p></div>
      <div class="step"><span class="n">03</span><h3>Learn from your mistakes</h3><p class="muted small">See your score per section against an 80% target, the time you spent on each question and the fastest route to every answer.</p></div>
    </div></section>
    <section class="mission glass">
      <div><h2>Good preparation shouldn't depend on your budget.</h2>
      <p class="muted">Too many prep sites lock the basics behind subscriptions. ${esc(SITE.name)} is free, with no sign-up and no tracking, because knowing how these tests work should be the same for everyone. More sites for other kinds of jobs are on the way.</p>
      <p class="byline"><span class="avatar">JP</span><span>Made by ${authorLink()}</span></p></div>
      <div class="row"><a class="btn" href="${href("about")}">Read the story</a>${SITE.kofi ? `<a class="btn btn-primary" href="${esc(SITE.kofi)}" target="_blank" rel="noopener">${I.cup}Support it</a>` : ""}</div>
    </section>`, "");
  wireShell(); wireCards();
  app.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { store.set(KEY_FILTER, b.dataset.filter); render(true); });
}

/* ---------- other pages ---------- */
function showHistory() {
  const hist = store.get(KEY_HIST, []);
  app.innerHTML = shell(`<section class="page">
    <header><span class="eyebrow">Stored in this browser only</span><h1>History</h1></header>
    ${hist.length ? `<div class="glass panel"><div class="scroll-x"><table class="hist"><thead><tr><th>Date</th><th>Mock test</th><th>Mode</th><th>Score</th></tr></thead><tbody>${hist.slice().reverse().map(h => `<tr><td class="num">${esc(h.date)}</td><td>${esc(h.set)}</td><td>${esc(h.mode)}</td><td class="num">${esc(h.summary)}</td></tr>`).join("")}</tbody></table></div>
      <div class="row"><button class="btn btn-ghost btn-sm" id="clear">Clear history</button></div></div>`
      : `<div class="glass empty"><p>You haven't finished a mock test yet.</p><a class="btn btn-primary" href="${href("")}">See mock tests</a></div>`}
  </section>`, "history");
  wireShell();
  const c = document.getElementById("clear");
  if (c) c.onclick = () => { if (c.dataset.armed) { store.set(KEY_HIST, []); store.set(KEY_DONE, {}); render(); } else { c.dataset.armed = "1"; c.textContent = "Sure? Clear everything"; } };
}

function authorLink() { return SITE.linkedin ? `<a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">${esc(SITE.author)}</a>` : esc(SITE.author); }

function showAbout() {
  app.innerHTML = shell(`<section class="page about"><header><h1>About ${esc(SITE.name)}</h1><p class="sub">A free place to practise for the tests that decide who gets an interview.</p></header>
    <div class="glass panel prose story">
      <h2>What is this?</h2>
      <p>${esc(SITE.name)} is a practice site for online aptitude tests: numerical reasoning, critical thinking, working with data and verbal reasoning. They're often the first filter in a selection process, at consulting firms, banks, audit firms and graduate programmes, and in any hiring process that screens applicants online.</p>
      <p>You can sit full timed mock tests, read a worked solution for every question and load your own tests. There's no sign-up and no paywall, and your answers never leave your browser.</p>
      <h2>Who makes it?</h2>
      <div class="author"><span class="avatar avatar-lg">JP</span><div><b>${esc(SITE.author)}</b><span>Built ${esc(SITE.name)} while preparing for one of these tests, then opened it up for everyone.</span></div>${SITE.linkedin ? `<a class="btn btn-sm" href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">${I.linkedin}LinkedIn</a>` : ""}</div>
      <h2>Why?</h2>
      <blockquote>Preparation shouldn't depend on what you can pay.</blockquote>
      <p>An online test can decide whether you get a first interview, and a lot of apps and sites try to profit from that pressure, with subscriptions, "premium" question banks and paywalls in front of the basics. That hands a head start to whoever can afford it. How these tests work, and how to practise for them, is information that should be the same for everyone. So ${esc(SITE.name)} is free, and it will stay free.</p>
      <h2>What's next</h2>
      <p>This is the first of several. I'll publish more free practice sites like this one for other kinds of jobs and selection tests, also under the ${esc(SITE.name)} name, and I'll list them here as they go live.</p>
      <h2>How you can help</h2>
      <p>${SITE.kofi ? `If ${esc(SITE.name)} helped you, you can <a href="${esc(SITE.kofi)}" target="_blank" rel="noopener">support it on Ko-fi</a>. ` : ""}Donations cover hosting and give me time to keep building projects like this one, free for everyone. Sharing the site with someone who's preparing helps too.</p>
    </div>
    <div class="glass panel prose">
      <h2>Format</h2>
      <ul><li>Numerical Reasoning: 12 questions in 10 minutes.</li><li>Critical Thinking: 16 questions in 12 minutes.</li><li>Working With Data: 12 questions in 10 minutes.</li><li>Forward-only navigation: an unanswered question counts as wrong, and wrong answers cost nothing extra.</li><li>A calculator, pen and paper are allowed, as in most real tests.</li></ul>
      <h2>Levels</h2>
      <p><strong>Realistic</strong> aims for the difficulty candidates report. <strong>Challenging</strong> has longer calculations and subtler traps. The practice goal is 80% in every section within the time limit. Employers don't publish their pass marks, so treat that figure as a training benchmark only.</p>
      <h2>Disclaimer</h2>
      <p>This is an independent project. It is not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original and are not taken from any real test.</p>
      ${SITE.contact ? `<h2>Contact</h2><p>Spotted a mistake or have a suggestion? Write to <a href="mailto:${esc(SITE.contact)}">${esc(SITE.contact)}</a>.</p>` : ""}
    </div></section>`, "about");
  wireShell();
}

function showPrivacy() {
  app.innerHTML = shell(`<section class="page"><header><span class="eyebrow">Legal</span><h1>Privacy</h1></header>
    <div class="glass panel prose">
      <p>${esc(SITE.name)} runs entirely in your browser. There are no accounts and no forms, and your answers are never sent to a server.</p>
      <h2>What is stored, and where</h2>
      <ul><li>Your results history, the mock tests you mark as done, the tests you load and your theme choice are kept in your browser's local storage (<code>localStorage</code>).</li><li>You can delete them at any time from History, from Your tests, or by clearing this site's data in your browser.</li></ul>
      <h2>Third parties</h2>
      <ul><li>The site is served as a static page. The hosting provider may log technical access data (such as IP addresses) under its own policy.</li><li>If analytics or advertising are ever added, this page will be updated before they are switched on, and your consent will be requested where the law requires it.</li></ul>
      ${SITE.contact ? `<h2>Contact</h2><p><a href="mailto:${esc(SITE.contact)}">${esc(SITE.contact)}</a></p>` : ""}
    </div></section>`, "");
  wireShell();
}

/* ---------- topic pages ---------- */
const TOPIC_COPY = {
  NR: {
    h1: "Numerical reasoning test",
    sub: "Twelve questions, ten minutes and a calculator. Practise on tables, charts and percentages until the clock stops being the problem.",
    what: "Numerical reasoning tests check how quickly and accurately you can pull numbers out of tables and charts and work with them: percentages, ratios, growth rates, averages and unit conversions. The maths rarely goes beyond secondary school. What makes these tests hard is the time limit, under a minute per question, and the wrong options, which are built from the most common slips.",
    tips: ["Read the question before the table. It tells you which two or three numbers matter.", "Check the base of every percentage. “Up 20% on last year” and “20% of the total” need different denominators.", "Percentage points are not percent. A share that goes from 10% to 12% rose 2 points, which is 20%.", "Estimate first. When the options are far apart, a rough calculation is enough and saves a minute.", "Don't get stuck. A blank answer scores the same as a wrong one, so guess and move on."],
    faq: [["Can I use a calculator?", "Yes. Most online numerical tests allow one, and so does this practice. Keep pen and paper handy too."], ["How long is each question?", "Fifty seconds on average. Some table questions take two minutes and some series take twenty seconds, so pace yourself across the section, not per question."]]
  },
  CT: {
    h1: "Critical thinking test",
    sub: "Sixteen questions, twelve minutes. Syllogisms, ordering puzzles, assumptions and arguments: the logic section that filters many graduate applicants.",
    what: "Critical thinking tests measure whether you can reason from what you're given and nothing more. You'll decide whether a conclusion follows from its premises, put people or tasks in order from a set of rules, find the assumption an argument depends on, and judge which fact would strengthen or weaken it.",
    tips: ["Use only the information given. Real-world knowledge is the most common trap.", "“Some” means at least one, not “not all”. “Only A are B” means every B is an A.", "For ordering puzzles, sketch the slots and place the most constrained item first.", "An assumption is something the argument needs. Negate it: if the argument falls apart, you've found it.", "When two things rise together, look for a third factor that causes both."],
    faq: [["Do I need to know formal logic?", "No. A few rules about “all”, “some” and “only” cover most questions, and every solution here walks through the reasoning."], ["Why do the ordering puzzles take so long?", "Because people test options one by one. Start from the rule that fixes a position, and the rest usually falls into place in two or three steps."]]
  },
  WwD: {
    h1: "Data interpretation test",
    sub: "Twelve questions, ten minutes. Read charts and tables, decide which statements the data supports, and spot the problems in it.",
    what: "Data interpretation tests, sometimes called working with data, check whether you can read charts and tables correctly and draw only the conclusions they support. Expect select-all-that-apply questions about what the data shows, quick statistics such as averages and medians, data-quality problems such as duplicates or impossible values, and questions on which chart suits a message.",
    tips: ["In select-all-that-apply questions, judge each statement on its own. One wrong pick costs the whole question.", "A share can fall while the absolute number rises, if the total grows.", "Check the axes before the trend. A truncated or uneven axis exaggerates change.", "Statements about causes or about the future rarely follow from a table.", "Outliers move the mean, not the median."],
    faq: [["What's the difference from numerical reasoning?", "Less arithmetic and more judgement. You'll calculate less and spend more time deciding what a chart does and doesn't show."], ["Are partial answers marked?", "Not here, and often not in real tests either: a multi-select question only scores if you pick exactly the right set."]]
  },
  VR: {
    h1: "Verbal reasoning test",
    sub: "Short passages with True, False or Cannot Say statements, plus analogies and word logic.",
    what: "Verbal reasoning tests check how precisely you read. You get a short passage and decide whether each statement is true, false or can't be determined from the text alone. Some versions add analogies, synonyms and short word puzzles.",
    tips: ["“Cannot Say” is right whenever the passage doesn't settle the statement, even if it sounds likely.", "Watch the qualifiers. “Most”, “all”, “only” and “usually” change the meaning.", "Leave outside knowledge at the door, even when you know the topic well."],
    faq: [["How much verbal practice is there?", "One section for now, in Mock test 7. More is on the way."]]
  }
};
function questionTypes(k) {
  const n = {};
  BUILTIN_SETS.forEach(s => hasSec(s, k) && s.sections[k].questions.forEach(q => { if (q.type) n[q.type] = (n[q.type] || 0) + 1; }));
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([t]) => t);
}
function sampleQuestion(k) {
  const s = BUILTIN_SETS.findLast(x => hasSec(x, k)); if (!s) return "";
  const sec = s.sections[k], q = sec.questions.find(x => !x.multi) || sec.questions[0];
  const ctx = q.ctx && sec.contexts ? sec.contexts[q.ctx] : null;
  const ans = norm(q.answer);
  return `<div class="glass panel sample"><h2>Try a sample question</h2>
    ${ctx ? `<div class="md">${md(ctx.md.replace(/^\*\*Use the [^*]*\*\*\s*/, ""))}${chartHTML(ctx.chart)}</div>` : ""}${q.chart ? chartHTML(q.chart) : ""}
    <div class="md stem">${md(q.stem)}</div>
    <ol class="sample-opts">${q.options.map((o, i) => `<li><span class="mark">${LETTERS[i]}</span><span>${inline(o)}</span></li>`).join("")}</ol>
    <details class="reveal-ans"><summary>Show the answer</summary><p><strong>${ans.split("").join(", ")}.</strong></p>${q.explain ? `<div class="md">${md(q.explain)}</div>` : ""}</details>
  </div>`;
}
function showTopic(k) {
  const c = TOPIC_COPY[k], hist = store.get(KEY_HIST, []);
  const sets = allSets().filter(s => hasSec(s, k));
  const next = sets.find(s => !sectionsDone(s, hist).has(k)) || sets[0];
  const types = questionTypes(k);
  app.innerHTML = shell(`<section class="page topic">
    ${crumbs([["", "Home"], [topicPath(k), SECTIONS[k].name]])}
    <header><h1>${c.h1}</h1><p class="sub">${c.sub}</p>
      <div class="row cta">${next ? `<button class="btn btn-primary btn-lg" data-run="${esc(next.id)}" data-order="${k}" data-label="${SECTIONS[k].name}">${I.play}Start a ${SECTIONS[k].short.toLowerCase()} test</button>` : ""}<a class="btn btn-lg" href="${href("")}">Full mock tests</a></div></header>
    <div class="topic-grid">
      <div class="glass panel prose"><h2>What it tests</h2><p>${c.what}</p>
        ${types.length ? `<h2>Question types here</h2><div class="chips">${types.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}</div>
      <div class="glass panel"><h2>Practice sets</h2>
        <div class="setlist">${sets.map(s => { const d = sectionsDone(s, hist).has(k); return `<div class="setrow">
          <div><a href="${href(setPath(s))}"><strong>${esc(s.title)}</strong></a><span class="muted small num">${s.sections[k].questions.length} questions · ${secMinutes(s, k)} min${s.level ? ` · ${esc(LEVELS[s.level] || s.level)}` : ""}</span></div>
          ${d ? `<span class="pill ok">${I.check}Done</span>` : ""}
          <button class="btn btn-sm" data-run="${esc(s.id)}" data-order="${k}" data-label="${SECTIONS[k].name}">${d ? "Retake" : "Start"}</button></div>`; }).join("")}</div></div>
    </div>
    ${sampleQuestion(k)}
    <div class="glass panel prose"><h2>How to prepare</h2><ol class="tips">${c.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ol></div>
    <div class="glass panel prose faq"><h2>Questions</h2>
      ${[...c.faq, ["What score should I aim for?", "Employers don't publish pass marks. As a training benchmark, aim for 80% within the time limit."], ["Are these the real test questions?", "No. Every question is original. The format, timing and question types mirror common online tests, but nothing is copied from a real one."]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </section>`, topicPath(k));
  wireShell(); wireCards();
}

/* ---------- one page per mock test ---------- */
function showSetPage(s) {
  const hist = store.get(KEY_HIST, []), n = setNum(s), done = sectionsDone(s, hist);
  const keys = ORDER.filter(k => hasSec(s, k)), core = keys.filter(k => k !== "VR");
  const min = core.reduce((a, k) => a + secMinutes(s, k), 0), nq = core.reduce((a, k) => a + s.sections[k].questions.length, 0);
  const prev = BUILTIN_SETS[n - 2], next = BUILTIN_SETS[n];
  app.innerHTML = shell(`<section class="page setpage">
    ${crumbs([["", "Mock tests"], [setPath(s), s.title]])}
    <header><div class="row" style="gap:12px"><h1>${esc(s.title)}</h1>${s.level ? `<span class="lvl lvl-${esc(s.level)}">${esc(LEVELS[s.level] || s.level)}</span>` : ""}</div>
      <p class="sub">${nq} questions in ${min} minutes: ${core.map(k => SECTIONS[k].name.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}.${s.note ? ` ${esc(s.note)}` : ""}</p>
      <div class="row cta"><button class="btn btn-primary btn-lg" data-run="${esc(s.id)}" data-order="${core.join(",")}" data-label="Full mock">${I.play}Start full mock</button>
      ${hasSec(s, "VR") ? `<button class="btn btn-lg" data-run="${esc(s.id)}" data-order="NR,CT,VR" data-label="Full mock (verbal)">Verbal version</button>` : ""}</div></header>
    <div class="glass panel"><h2>Sections</h2><p class="muted small">Sit them in one go, as in the real thing, or one at a time.</p>
      <div class="setlist">${keys.map(k => `<div class="setrow">
        <div><a href="${href(topicPath(k))}"><strong>${SECTIONS[k].name}</strong></a><span class="muted small num">${s.sections[k].questions.length} questions · ${secMinutes(s, k)} min</span></div>
        ${done.has(k) ? `<span class="pill ok">${I.check}Done</span>` : ""}
        <button class="btn btn-sm" data-run="${esc(s.id)}" data-order="${k}" data-label="${SECTIONS[k].name}">${done.has(k) ? "Retake" : "Start"}</button></div>`).join("")}</div></div>
    <div class="glass panel prose"><h2>Before you start</h2><ul><li>Have a calculator, pen and paper ready.</li><li>One question per screen and no going back. A blank answer counts as wrong, and wrong answers cost nothing extra.</li><li>Each section has its own clock and closes at 0:00. You'll see every solution at the end.</li></ul></div>
    <nav class="pager" aria-label="Other mock tests">${prev ? `<a class="btn" href="${href(setPath(prev))}">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="btn" href="${href(setPath(next))}">${esc(next.title)} →</a>` : ""}</nav>
  </section>`, "");
  wireShell(); wireCards();
}

function showNotFound() {
  app.innerHTML = shell(`<section class="page"><header><h1>Page not found</h1><p class="sub">This page doesn't exist, or it moved.</p>
    <div class="row cta"><a class="btn btn-primary" href="${href("")}">Go to the mock tests</a></div></header></section>`, "");
  wireShell();
}

/* ---------- test screens ---------- */
// Where you are in a multi-section run: done ✓, current, still to come
function steps() {
  if (run.order.length < 2) return "";
  return `<ol class="steps-ind">${run.order.map((k, i) => `<li class="${i < run.secIdx ? "done" : i === run.secIdx ? "now" : ""}"${i === run.secIdx ? ` aria-current="step"` : ""}><span>${i < run.secIdx ? I.check : i + 1}</span>${SECTIONS[k].short}</li>`).join("")}</ol>`;
}
function testCrumbs() {
  const k = curKey();
  return crumbs(setNum(run.set) ? [["", "Mock tests"], [setPath(run.set), run.set.title], [setPath(run.set), run.order.length > 1 ? run.label : SECTIONS[k].name]] : [["my-tests", "Your tests"], ["my-tests", run.set.title]]);
}
function showIntro() {
  clearInterval(tick); window.onkeydown = null;
  const k = curKey(), sec = curSec(), n = sec.questions.length, min = secMinutes(run.set, k);
  const multi = sec.questions.some(q => q.multi);
  app.innerHTML = `<main class="wrap center fade-in">${testCrumbs()}<div class="glass">
    ${steps()}
    <h1>${SECTIONS[k].name}</h1>
    <div class="facts"><div class="fact"><b class="num">${n}</b><span class="muted small">questions</span></div><div class="fact"><b class="num">${min}:00</b><span class="muted small">minutes</span></div><div class="fact"><b class="num">${fmt(min * 60000 / n)}</b><span class="muted small">per question</span></div></div>
    <ul class="rules">
      <li>One question per screen. Once you press <strong>Next</strong>, you can't go back.</li>
      <li>An unanswered question counts as wrong, and wrong answers cost nothing extra. If in doubt, pick your best option and move on.</li>
      ${multi ? `<li><strong>Select all that apply</strong> questions only score if you pick exactly the right set.</li>` : ""}
      <li>The section closes automatically at 0:00.</li>
      <li>Shortcuts: <strong>A–E</strong> or <strong>1–5</strong> to select, <strong>Enter</strong> to move on.</li>
    </ul>
    <div class="row"><button class="btn btn-primary btn-lg" id="go">${I.play}Start the clock</button><button class="btn btn-ghost" id="quit">${run.secIdx ? "Exit test" : "Back"}</button></div>
  </div></main>`;
  document.getElementById("go").onclick = startSection;
  document.getElementById("quit").onclick = () => exitTest();
  document.getElementById("go").focus();
  window.scrollTo(0, 0);
}

function startSection() {
  const k = curKey(), sec = curSec();
  const limit = secMinutes(run.set, k) * 60000;
  run.cur = { key: k, qIdx: 0, answers: sec.questions.map(() => ({ sel: "", ms: 0 })), start: Date.now(), deadline: Date.now() + limit, limit };
  showQuestion();
  clearInterval(tick);
  tick = setInterval(updateTimer, 250);
}

function updateTimer() {
  if (!run || !run.cur) return;
  const left = run.cur.deadline - Date.now();
  const el = document.getElementById("timer");
  const txt = fmt(left);
  if (el && el.textContent !== txt) { el.textContent = txt; el.classList.toggle("low", left <= 60000); }
  if (left <= 0) finishSection(true);
}

function showQuestion() {
  const c = run.cur, sec = curSec(), q = sec.questions[c.qIdx], n = sec.questions.length;
  const ctx = q.ctx && sec.contexts ? sec.contexts[q.ctx] : null;
  c.qStart = Date.now();
  const last = c.qIdx === n - 1;
  app.innerHTML = `
  <div class="bar"><div class="wrap"><div class="bar-in glass">
    <button class="btn iconbtn exit" id="exit" title="Exit test" aria-label="Exit test">${I.close}</button>
    <div style="min-width:0"><div class="bar-title">${SECTIONS[c.key].name}</div><div class="bar-sub num">Question ${c.qIdx + 1} of ${n}${run.order.length > 1 ? ` · Section ${run.secIdx + 1} of ${run.order.length}` : ""}</div></div>
    <div class="timer num" id="timer" aria-live="off">${fmt(c.deadline - Date.now())}</div>
    <div class="progress"><div style="width:${(c.qIdx / n) * 100}%"></div></div>
  </div></div></div>
  <main class="wrap qwrap"><div class="qgrid">
    <section class="qbox glass">
      <div class="qnum">Question ${c.qIdx + 1}</div>
      ${ctx ? `<div class="md ctx">${md(ctx.md)}${chartHTML(ctx.chart)}</div>` : ""}
      ${q.chart ? chartHTML(q.chart) : ""}
      <div class="md stem">${md(q.stem)}</div>
    </section>
    <section class="answers" aria-label="Answers">
      <div class="hint">${q.multi ? "Select all that apply" : "Select one answer"}</div>
      ${q.options.map((o, i) => `<button class="opt${q.multi ? " multi" : ""}" data-l="${LETTERS[i]}" aria-pressed="false"><span class="mark">${LETTERS[i]}</span><span>${inline(o)}</span></button>`).join("")}
    </section>
  </div></main>
  <div class="foot"><div class="wrap"><div class="foot-in glass">
    <span class="hint" id="skiphint">No answer counts as wrong</span>
    <button class="btn btn-primary btn-lg" id="next">${last ? "Finish section" : "Next"}</button>
  </div></div></div>`;
  const opts = [...app.querySelectorAll(".opt")];
  const refresh = () => {
    const sel = c.answers[c.qIdx].sel;
    opts.forEach(b => b.setAttribute("aria-pressed", sel.includes(b.dataset.l) ? "true" : "false"));
    document.getElementById("skiphint").hidden = !!sel;
  };
  const pick = l => {
    const a = c.answers[c.qIdx];
    if (q.multi) a.sel = a.sel.includes(l) ? a.sel.replace(l, "") : norm(a.sel + l);
    else a.sel = l;
    refresh();
  };
  opts.forEach(b => b.onclick = () => pick(b.dataset.l));
  document.getElementById("next").onclick = nextQuestion;
  document.getElementById("exit").onclick = () => exitTest();
  window.onkeydown = e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toUpperCase();
    let l = null;
    if (/^[1-8]$/.test(k)) l = LETTERS[+k - 1];
    else if (LETTERS.includes(k) && k.length === 1) l = k;
    if (l && LETTERS.indexOf(l) < q.options.length) { e.preventDefault(); pick(l); }
    else if (e.key === "Enter") { e.preventDefault(); nextQuestion(); }
  };
  refresh();
  window.scrollTo(0, 0);
}

function nextQuestion() {
  const c = run.cur;
  c.answers[c.qIdx].ms += Date.now() - c.qStart;
  if (c.qIdx < curSec().questions.length - 1) { c.qIdx++; showQuestion(); }
  else finishSection(false);
}

function finishSection(timeout) {
  clearInterval(tick); window.onkeydown = null;
  const c = run.cur; if (!c) return;
  if (timeout) c.answers[c.qIdx].ms += Date.now() - c.qStart;
  const used = Math.min(Date.now() - c.start, c.limit);
  const sec = curSec();
  const items = sec.questions.map((q, i) => ({ q, sel: c.answers[i].sel, ms: c.answers[i].ms, ok: c.answers[i].sel !== "" && norm(c.answers[i].sel) === norm(q.answer), reached: timeout ? i <= c.qIdx : true }));
  run.results[c.key] = { items, used, limit: c.limit, timeout, unreached: timeout ? items.length - c.qIdx - 1 : 0 };
  run.cur = null;
  if (run.secIdx < run.order.length - 1) {
    run.secIdx++;
    const nk = curKey();
    app.innerHTML = `<main class="wrap center fade-in">${testCrumbs()}<div class="glass">
      ${steps()}
      <h1>${timeout ? "Time's up." : "Section complete."}</h1>
      <p class="muted">Results are shown at the end of the mock test. Next: <strong>${SECTIONS[nk].name}</strong> (${curSec().questions.length} questions, ${secMinutes(run.set, nk)} min). The clock starts when you press Start on the next screen, so take a breath first.</p>
      <div class="row"><button class="btn btn-primary btn-lg" id="go">Continue</button><button class="btn btn-ghost" id="quit">Exit test</button></div>
    </div></main>`;
    document.getElementById("go").onclick = showIntro;
    document.getElementById("quit").onclick = () => exitTest();
    window.scrollTo(0, 0);
  } else showResults(true);
}

// After a single section: the next section of the same mock. After a full mock: the next mock test.
function suggestNext() {
  const s = run.set, hist = store.get(KEY_HIST, []), n = setNum(s);
  if (run.order.length === 1) {
    const done = sectionsDone(s, hist); done.add(run.order[0]);
    const k = ["NR", "CT", "WwD"].find(x => hasSec(s, x) && !done.has(x));
    if (k) return { set: s, order: [k], runLabel: SECTIONS[k].name, label: `Next: ${SECTIONS[k].name}` };
  }
  const nx = n && BUILTIN_SETS.slice(n).find(x => !isDone(x, hist)) || (n && BUILTIN_SETS[n]);
  if (nx && ["NR", "CT", "WwD"].every(k => hasSec(nx, k))) return { set: nx, order: ["NR", "CT", "WwD"], runLabel: "Full mock", label: `Next: ${nx.title}` };
  return null;
}
function summaryLine() {
  const r = run.results;
  const parts = run.order.map(k => `${k} ${r[k].items.filter(x => x.ok).length}/${r[k].items.length} (${fmt(r[k].used)}/${fmt(r[k].limit)})`).join(" · ");
  return `${SITE.name} · ${today()} · ${run.set.title} · ${parts}`;
}

function showResults(save) {
  clearInterval(tick); window.onkeydown = null;
  run.finished = true;
  const r = run.results;
  const tot = run.order.reduce((a, k) => a + r[k].items.filter(x => x.ok).length, 0);
  const max = run.order.reduce((a, k) => a + r[k].items.length, 0);
  const line = summaryLine();
  const nextStep = suggestNext();
  if (save) {
    const h = store.get(KEY_HIST, []);
    h.push({ date: today(), setId: run.set.id, sections: run.order, set: run.set.title, mode: run.label, summary: run.order.map(k => `${k} ${r[k].items.filter(x => x.ok).length}/${r[k].items.length}`).join(" · "), line });
    store.set(KEY_HIST, h.slice(-100));
  }
  const scoreCard = k => {
    const s = r[k], ok = s.items.filter(x => x.ok).length, pct = Math.round(ok / s.items.length * 100);
    return `<a class="score glass" href="#rev-${k}" data-jump="rev-${k}"><span class="eyebrow">${SECTIONS[k].name}</span><span class="big num">${ok}/${s.items.length}</span>
      <div class="meter${pct >= 80 ? "" : " ko"}" title="Target 80%"><div style="width:${pct}%"></div></div>
      <div class="row" style="gap:6px"><span class="pill ${pct >= 80 ? "ok" : "ko"}">${pct}% · target 80%</span>${s.timeout ? `<span class="pill warn">time ran out</span>` : ""}</div>
      <span class="muted small num">Time ${fmt(s.used)} of ${fmt(s.limit)}${s.unreached ? ` · ${s.unreached} not reached` : ""}</span><span class="small jump">Review answers ↓</span></a>`;
  };
  const review = k => {
    const sec = run.set.sections[k];
    return `<section class="review" id="rev-${k}"><h2 style="font-size:20px">${SECTIONS[k].name}</h2>${r[k].items.map((x, i) => {
      const ctx = x.q.ctx && sec.contexts ? sec.contexts[x.q.ctx] : null;
      const ans = norm(x.q.answer);
      return `<details class="revq glass"${x.ok ? "" : " open"}>
        <summary><span class="tick ${x.ok ? "ok" : "ko"}">${x.ok ? "✔" : "✗"}</span><span><strong>${i + 1}.</strong> ${esc(x.q.type || "")} <span class="muted small">· you: ${x.sel ? x.sel.split("").join(",") : (x.reached ? "blank" : "not reached")} · correct: ${ans.split("").join(",")}</span></span><span class="muted small num">${x.ms ? fmt(x.ms) : "–"}</span></summary>
        <div class="body">
          ${ctx ? `<div class="md">${md(ctx.md)}${chartHTML(ctx.chart)}</div>` : ""}
          ${x.q.chart ? chartHTML(x.q.chart) : ""}
          <div class="md">${md(x.q.stem)}</div>
          <div style="display:grid;gap:4px">${x.q.options.map((o, j) => { const L = LETTERS[j], isC = ans.includes(L), isS = x.sel.includes(L);
            return `<div class="revopt ${isC ? "correct" : isS ? "wrong" : ""}"><strong>${L}</strong><span>${inline(o)}</span><span class="small">${isC && isS ? "✔ your answer" : isC ? "correct" : isS ? "✗ your answer" : ""}</span></div>`; }).join("")}</div>
          ${x.q.explain ? `<div class="explain md">${md(x.q.explain)}</div>` : ""}
        </div></details>`;
    }).join("")}</section>`;
  };
  app.innerHTML = `<main class="wrap res fade-in">
    <header class="res-hero glass"><span class="eyebrow">${esc(run.set.title)} · ${esc(run.label)}</span>
      <h1 class="num"><span class="grad-text">${tot}/${max}</span> <span class="muted" style="font-size:.5em;font-weight:600">${Math.round(tot / max * 100)}%</span></h1>
      <p class="muted">Wrong answers are expanded below with the solution. The time you spent on each question is on the right.</p>
      <div class="row">${nextStep ? `<button class="btn btn-primary" id="next">${I.play}${esc(nextStep.label)}</button>` : ""}<button class="btn${nextStep ? "" : " btn-primary"}" id="retake">Retake</button><a class="btn" href="${href(setNum(run.set) ? setPath(run.set) : "my-tests")}">${setNum(run.set) ? esc(run.set.title) : "Your tests"}</a><a class="btn btn-ghost" href="${href("")}">All mock tests</a><button class="btn btn-ghost" id="copy">Copy result</button><span class="msg-ok" id="copied" hidden>Copied</span></div>
      <div class="reg" id="reg">${esc(line)}</div></header>
    <div class="scores">${run.order.map(scoreCard).join("")}</div>
    ${run.order.map(review).join("")}
  </main>`;
  document.getElementById("copy").onclick = () => copyText(line, document.getElementById("reg"), document.getElementById("copied"));
  const { set, order, label } = run;
  document.getElementById("retake").onclick = () => startRun(set.id, order, label);
  if (nextStep) document.getElementById("next").onclick = () => startRun(nextStep.set.id, nextStep.order, nextStep.runLabel);
  app.querySelectorAll("[data-jump]").forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById(a.dataset.jump).scrollIntoView({ behavior: calm.matches ? "auto" : "smooth" }); });
  window.scrollTo(0, 0);
}

function copyText(text, el, ok) {
  const done = () => { ok.hidden = false; setTimeout(() => ok.hidden = true, 1800); };
  const fallback = () => { const range = document.createRange(); range.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(range); };
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
}

/* ---------- your own tests ---------- */
const TEMPLATE = {
  title: "My test 1",
  note: "Optional: a one-line description",
  sections: {
    NR: {
      minutes: 10,
      contexts: { g1: { md: "**Use the table for questions 1–2.**\n\n| Region | 2024 | 2025 |\n|---|---|---|\n| North | 120 | 138 |\n| South | 80 | 94 |" } },
      questions: [
        { type: "Table", ctx: "g1", stem: "Which region grew faster?", options: ["North", "South", "Both equally", "Cannot say"], answer: "B", explain: "South +17.5% vs North +15%." },
        { type: "Series", stem: "What comes next? 3, 7, 15, 31, ?", options: ["62", "63", "64", "47", "127"], answer: "B", explain: "×2 + 1." }
      ]
    },
    WwD: {
      questions: [
        { type: "Chart (multi)", multi: true, chart: { type: "line", title: "Users (k)", categories: ["Jan", "Feb", "Mar"], series: [{ name: "X", values: [40, 44, 47] }, { name: "Y", values: [60, 58, 55] }] },
          stem: "Which statements can be concluded? **Select all that apply.**", options: ["X grew every month.", "Y grew in March.", "X will pass Y in May."], answer: "A", explain: "Only A is supported by the data." }
      ]
    }
  }
};
const PROMPT = `Write an aptitude test for the ${SITE.name} practice site as valid JSON (no comments and no text outside the JSON), in this format:
{ "title": "...", "note": "...", "sections": { "NR": {...}, "CT": {...}, "WwD": {...}, "VR": {...} } }
Sections: NR = Numerical Reasoning (12 questions, 10 min), CT = Critical Thinking (16, 12 min), WwD = Working With Data (12, 10 min), VR = Verbal Reasoning (15, 10 min). You may include only some of them.
Each section: { "minutes": optional, "contexts": { "id": { "md": "text or markdown table", "chart": optional } }, "questions": [ ... ] }
Each question: { "type": "Table|Rule|Series|Syllogism|Sequencing|...", "ctx": "optional id", "stem": "markdown", "options": ["...", "..."], "answer": "B" or "AC" if multi, "multi": true for Select all that apply, "chart": optional, "explain": "short worked solution" }
chart = { "type": "line|bar|stacked", "title": "...", "categories": [...], "series": [{ "name": "...", "values": [...] }], "unit": "%" optional, "note": "optional text" }
Rules: options A–E, exactly one defensible answer, arithmetic checked twice, distractors based on real mistakes (wrong denominator, % vs percentage points, wrong year, reversed premise), each question solvable in about 50 seconds with a calculator.`;

function validateSet(s) {
  const errs = [];
  if (!s || typeof s !== "object") return ["The JSON is not an object."];
  if (!s.title) errs.push("Missing \"title\".");
  if (!s.sections || typeof s.sections !== "object") { errs.push("Missing \"sections\"."); return errs; }
  const keys = Object.keys(s.sections);
  if (!keys.length) errs.push("\"sections\" is empty.");
  keys.forEach(k => {
    if (!SECTIONS[k]) { errs.push(`Unknown section "${k}". Use NR, CT, WwD or VR.`); return; }
    const sec = s.sections[k];
    if (!Array.isArray(sec.questions) || !sec.questions.length) { errs.push(`${k}: missing "questions".`); return; }
    sec.questions.forEach((q, i) => {
      const at = `${k} question ${i + 1}`;
      if (!q.stem) errs.push(`${at}: missing "stem".`);
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8) errs.push(`${at}: "options" must have between 2 and 8 entries.`);
      const a = norm(q.answer);
      if (!a || a.length !== String(q.answer).replace(/[^A-Za-z]/g, "").length) errs.push(`${at}: "answer" must be letters (e.g. "B" or "AC").`);
      else if (Array.isArray(q.options) && [...a].some(l => LETTERS.indexOf(l) >= q.options.length)) errs.push(`${at}: answer ${a} is not one of the options.`);
      else if (a.length > 1 && !q.multi) errs.push(`${at}: several answers given; add "multi": true.`);
      if (q.ctx && !(sec.contexts && sec.contexts[q.ctx])) errs.push(`${at}: context "${q.ctx}" does not exist.`);
      if (q.chart && !(q.chart.categories && q.chart.series)) errs.push(`${at}: the chart needs "categories" and "series".`);
    });
  });
  return errs;
}

function showMyTests() {
  const hist = store.get(KEY_HIST, []);
  const mine = allSets().filter(s => s.custom);
  app.innerHTML = shell(`<section class="page">
    <header><span class="eyebrow">Stored in this browser only</span><h1>Your tests</h1><p class="muted" style="margin-top:8px;max-width:70ch">Load your own questions as JSON, from a file or pasted text. They are checked before saving and then work like any other mock test, with the same timer and the same marking.</p></header>
    ${mine.length ? `<section class="sets">${mine.map(s => setCard(s, hist)).join("")}</section>` : ""}
    <div class="glass panel">
      <h2>Add a test</h2>
      <textarea id="json" spellcheck="false" placeholder='{ "title": "My test 1", "sections": { "NR": { "questions": [ ... ] } } }'></textarea>
      <div class="row"><button class="btn btn-primary" id="save">Check and save</button><label class="btn" for="file">${I.upload}Load .json file</label><input type="file" id="file" accept=".json,application/json" hidden><button class="btn btn-ghost" id="tpl">Paste example template</button></div>
      <div id="msg"></div>
    </div>
    <div class="glass panel">
      <h2>Generate a test with AI</h2>
      <p class="muted small">Paste this prompt into your AI assistant, paste the JSON it returns above, and double-check the answers: models can get arithmetic wrong.</p>
      <div class="reg" id="prompt" style="white-space:pre-wrap">${esc(PROMPT)}</div>
      <div class="row"><button class="btn" id="cprompt">Copy prompt</button><span class="msg-ok" id="cok" hidden>Copied</span></div>
    </div>
  </section>`, "my-tests");
  wireShell(); wireCards();
  const ta = document.getElementById("json"), msg = document.getElementById("msg");
  document.getElementById("tpl").onclick = () => { ta.value = JSON.stringify(TEMPLATE, null, 2); };
  document.getElementById("cprompt").onclick = () => copyText(PROMPT, document.getElementById("prompt"), document.getElementById("cok"));
  document.getElementById("file").onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { ta.value = rd.result; }; rd.readAsText(f); };
  document.getElementById("save").onclick = () => {
    let data;
    const raw = ta.value.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    try { data = JSON.parse(raw); } catch (e) { msg.innerHTML = `<p class="msg-err">That text is not valid JSON: ${esc(e.message)}</p>`; return; }
    const list = Array.isArray(data) ? data : [data];
    const errs = list.flatMap((s, i) => validateSet(s).map(m => (list.length > 1 ? `Test ${i + 1}: ` : "") + m));
    if (errs.length) { msg.innerHTML = `<p class="msg-err">${esc(errs.slice(0, 12).join("\n"))}${errs.length > 12 ? `\n…and ${errs.length - 12} more` : ""}</p>`; return; }
    const cur = store.get(KEY_CUSTOM, []);
    list.forEach(s => { s.id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); cur.push(s); });
    if (!store.set(KEY_CUSTOM, cur)) { msg.innerHTML = `<p class="msg-err">This browser won't let the site save data (private mode or blocked storage). The test was not saved.</p>`; return; }
    render();
    const m2 = document.getElementById("msg"); if (m2) m2.innerHTML = `<p class="msg-ok">Saved: ${list.map(s => esc(s.title)).join(", ")}.</p>`;
  };
}

applyTheme();
render();
