/* ---------- site config: edit here ---------- */
const SITE = {
  name: "Assessmint",
  tagline: "Free timed practice for online aptitude tests",
  kofi: "",      // e.g. "https://ko-fi.com/yourname" (empty = hidden)
  contact: "fixmi.app@gmail.com",
  repo: "https://github.com/jopecl/assessmint"
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
  run = { set, order, label, secIdx: 0, results: {}, startedAt: Date.now() };
  showIntro();
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

/* ---------- shell ---------- */
const ROUTES = { "": "Mock tests", "my-tests": "Your tests", "history": "History", "about": "About" };
const route = () => (location.hash.replace(/^#\/?/, "").split("/")[0] || "");
function shell(inner, active) {
  const t = store.get(KEY_THEME, "auto");
  return `<header class="topbar"><div class="wrap" style="position:relative">
      <nav class="nav glass" aria-label="Main">
        <a class="brand" href="#/">${LOGO}<span>${esc(SITE.name)}</span></a>
        <div class="navlinks" id="navlinks">${Object.entries(ROUTES).map(([r, l]) => `<a href="#/${r}"${r === active ? ` aria-current="page"` : ""}>${l}</a>`).join("")}</div>
        ${SITE.kofi ? `<a class="btn btn-sm" href="${esc(SITE.kofi)}" target="_blank" rel="noopener">${I.cup}<span class="kofi-label">Buy me a coffee</span></a>` : ""}
        <button class="btn iconbtn" id="theme" title="Theme: ${t === "auto" ? "automatic" : t === "light" ? "light" : "dark"}" aria-label="Change theme">${t === "auto" ? I.auto : t === "light" ? I.sun : I.moon}</button>
        <button class="btn iconbtn menu-toggle" id="menu" aria-label="Menu" aria-expanded="false">${I.menu}</button>
      </nav></div></header>
    <main class="wrap fade-in">${inner}</main>
    <footer class="wrap site-foot"><div class="glass">
      <nav><a href="#/about">About</a><a href="#/privacy">Privacy</a>${SITE.contact ? `<a href="mailto:${esc(SITE.contact)}">Contact</a>` : ""}${SITE.repo ? `<a href="${esc(SITE.repo)}" target="_blank" rel="noopener">Source code</a>` : ""}${SITE.kofi ? `<a href="${esc(SITE.kofi)}" target="_blank" rel="noopener">Ko-fi</a>` : ""}</nav>
      <p>${esc(SITE.name)} is a free, independent practice site. It is not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original. Section names describe common test formats.</p>
    </div></footer>`;
}
function wireShell() {
  const th = document.getElementById("theme"); if (th) th.onclick = cycleTheme;
  const m = document.getElementById("menu"), nl = document.getElementById("navlinks");
  if (m) m.onclick = () => { const o = nl.classList.toggle("open"); m.setAttribute("aria-expanded", o); };
}
function render() {
  if (run) return;
  clearInterval(tick); window.onkeydown = null;
  const r = route();
  if (r === "my-tests") showMyTests();
  else if (r === "history") showHistory();
  else if (r === "about") showAbout();
  else if (r === "privacy") showPrivacy();
  else showHome();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => {
  if (run) {
    if (confirm("Leave the test? This attempt will be lost.")) { clearInterval(tick); run = null; render(); }
    else history.replaceState(null, "", "#/");
    return;
  }
  render();
});
function goHome() { clearInterval(tick); run = null; window.onkeydown = null; if (route() !== "") location.hash = "#/"; else render(); }

/* ---------- home ---------- */
function setCard(s, hist) {
  const done = isDone(s, hist), partial = sectionsDone(s, hist);
  const full = hasSec(s, "NR") && hasSec(s, "CT") && hasSec(s, "WwD"), verbal = hasSec(s, "NR") && hasSec(s, "CT") && hasSec(s, "VR");
  const keys = ORDER.filter(k => hasSec(s, k));
  const fullMin = o => o.reduce((a, k) => a + secMinutes(s, k), 0);
  return `<article class="set glass${done ? " set-done" : ""}">
    <div class="set-head"><div><h3>${esc(s.title)}${done ? ` <span class="pill ok">Done</span>` : ""}</h3>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}</div>
      ${s.level ? `<span class="lvl lvl-${esc(s.level)}">${esc(LEVELS[s.level] || s.level)}</span>` : ""}</div>
    <div class="chips">${keys.map(k => `<span class="chip${partial.has(k) ? " chip-done" : ""}">${partial.has(k) ? "✓ " : ""}${k} · ${s.sections[k].questions.length}</span>`).join("")}</div>
    <div class="actions">
      ${full ? `<button class="btn btn-primary" data-run="${esc(s.id)}" data-order="NR,CT,WwD" data-label="Full mock"><span>Full mock test</span><span>NR → CT → WwD · ${fullMin(["NR", "CT", "WwD"])} min</span></button>` : ""}
      ${verbal ? `<button class="btn" data-run="${esc(s.id)}" data-order="NR,CT,VR" data-label="Full mock (verbal)"><span>Verbal variant</span><span>NR → CT → VR · ${fullMin(["NR", "CT", "VR"])} min</span></button>` : ""}
    </div>
    <div class="split">${keys.map(k => `<button class="btn btn-sm" data-run="${esc(s.id)}" data-order="${k}" data-label="${SECTIONS[k].name}">${k} · ${secMinutes(s, k)} min</button>`).join("")}</div>
    <div class="set-foot"><button class="btn btn-ghost btn-sm" data-mark="${esc(s.id)}" data-val="${done ? "0" : "1"}">${done ? "Move back to to-do" : "Mark as done"}</button>
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
    const m = store.get(KEY_DONE, {}); m[b.dataset.mark] = b.dataset.val === "1"; store.set(KEY_DONE, m); render();
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
    <section class="hero">
      <div>
        <span class="badge"><span class="dot"></span>Free · No sign-up · ${totalQuestions()} original questions</span>
        <h1>Beat the clock. <span class="grad-text">Ace the aptitude test.</span></h1>
        <p class="lead">Timed mock tests in numerical reasoning, critical thinking and working with data, the online aptitude tests used to screen applicants in consulting, finance, graduate programmes and any hiring process with an online test. One question per screen, no going back, and a worked solution for every question when you finish.</p>
        <div class="row cta"><button class="btn btn-primary btn-lg" data-run="${esc(next.id)}" data-order="NR,CT,WwD" data-label="Full mock">${I.play}Start ${esc(next.title)}</button><a class="btn btn-lg" href="#/my-tests">${I.upload}Load your own test</a></div>
      </div>
      <div class="hero-card glass">
        <div class="hero-stats"><div class="stat"><b>${nSets}</b><span>full mock tests</span></div><div class="stat"><b>${totalQuestions()}</b><span>original questions</span></div><div class="stat"><b>32</b><span>minutes per mock</span></div></div>
        <div class="sections-list">
          ${["NR", "CT", "WwD"].map(k => `<div class="secrow"><span class="k">${k}</span><span><strong>${SECTIONS[k].name}</strong><br><small>${({ NR: "Percentages, tables, series, estimation", CT: "Syllogisms, sequencing, assumptions", WwD: "Charts, statistics, data quality" })[k]}</small></span><span class="muted small num">${({ NR: 12, CT: 16, WwD: 12 })[k]} · ${SECTIONS[k].min}′</span></div>`).join("")}
        </div>
      </div>
    </section>
    <div class="toolbar" id="sims"><h2>Mock tests</h2><div class="seg" role="group" aria-label="Filter">${filters.map(([v, l]) => `<button data-filter="${v}" aria-pressed="${v === filter}">${l}</button>`).join("")}</div></div>
    ${sets.length ? `<section class="sets">${sets.map(s => setCard(s, hist)).join("")}</section>` : `<div class="glass empty"><p>No mock tests match this filter.</p></div>`}
    <section class="how">
      <div class="glass"><span class="n">1</span><h3>Pick a level</h3><p class="muted small"><strong>Realistic</strong> mirrors the difficulty candidates report for the real thing. <strong>Challenging</strong> has longer calculations and subtler traps, so test day feels easy.</p></div>
      <div class="glass"><span class="n">2</span><h3>Sit it in one go</h3><p class="muted small">Three timed sections back to back. Keep a calculator, pen and paper handy. A blank answer counts as wrong, and wrong answers cost nothing extra.</p></div>
      <div class="glass"><span class="n">3</span><h3>Learn from your mistakes</h3><p class="muted small">See your score per section against an 80% target, the time you spent on each question and the fastest route to every answer.</p></div>
    </section>`, "");
  wireShell(); wireCards();
  app.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { store.set(KEY_FILTER, b.dataset.filter); render(); });
}

/* ---------- other pages ---------- */
function showHistory() {
  const hist = store.get(KEY_HIST, []);
  app.innerHTML = shell(`<section class="page">
    <header><span class="eyebrow">Stored in this browser only</span><h1>History</h1></header>
    ${hist.length ? `<div class="glass panel"><div class="scroll-x"><table class="hist"><thead><tr><th>Date</th><th>Mock test</th><th>Mode</th><th>Score</th></tr></thead><tbody>${hist.slice().reverse().map(h => `<tr><td class="num">${esc(h.date)}</td><td>${esc(h.set)}</td><td>${esc(h.mode)}</td><td class="num">${esc(h.summary)}</td></tr>`).join("")}</tbody></table></div>
      <div class="row"><button class="btn btn-ghost btn-sm" id="clear">Clear history</button></div></div>`
      : `<div class="glass empty"><p>You haven't finished a mock test yet.</p><a class="btn btn-primary" href="#/">See mock tests</a></div>`}
  </section>`, "history");
  wireShell();
  const c = document.getElementById("clear");
  if (c) c.onclick = () => { if (c.dataset.armed) { store.set(KEY_HIST, []); store.set(KEY_DONE, {}); render(); } else { c.dataset.armed = "1"; c.textContent = "Sure? Clear everything"; } };
}

function showAbout() {
  app.innerHTML = shell(`<section class="page"><header><span class="eyebrow">About</span><h1>${esc(SITE.name)}</h1></header>
    <div class="glass panel prose">
      <p>${esc(SITE.name)} is a free practice site for online aptitude tests: numerical reasoning, critical thinking, working with data and verbal reasoning. They are the first screening step at consulting firms, banks, audit firms and graduate programmes, and in any selection process that uses online tests.</p>
      <h2>Format</h2>
      <ul><li>Numerical Reasoning: 12 questions in 10 minutes.</li><li>Critical Thinking: 16 questions in 12 minutes.</li><li>Working With Data: 12 questions in 10 minutes.</li><li>Forward-only navigation: an unanswered question counts as wrong, and wrong answers cost nothing extra.</li><li>A calculator, pen and paper are allowed, as in most real tests.</li></ul>
      <h2>Levels</h2>
      <p><strong>Realistic</strong> aims for the difficulty candidates report. <strong>Challenging</strong> has longer calculations and subtler traps. The practice goal is 80% in every section within the time limit. Employers don't publish their pass marks, so treat that figure as a training benchmark only.</p>
      <h2>Disclaimer</h2>
      <p>This is an independent project. It is not affiliated with, sponsored by or endorsed by any employer or assessment provider. All questions are original and are not taken from any real test.</p>
      ${SITE.contact || SITE.kofi ? `<h2>Contact</h2><p>${SITE.contact ? `Spotted a mistake or have a suggestion? Write to <a href="mailto:${esc(SITE.contact)}">${esc(SITE.contact)}</a>.` : ""} ${SITE.kofi ? `If the site helped you, you can <a href="${esc(SITE.kofi)}" target="_blank" rel="noopener">buy me a coffee</a>.` : ""}</p>` : ""}
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

/* ---------- test screens ---------- */
function showIntro() {
  clearInterval(tick); window.onkeydown = null;
  const k = curKey(), sec = curSec(), n = sec.questions.length, min = secMinutes(run.set, k);
  const multi = sec.questions.some(q => q.multi);
  const step = run.order.length > 1 ? `Test ${run.secIdx + 1} of ${run.order.length}` : "Test";
  app.innerHTML = `<main class="wrap center fade-in"><div class="glass">
    <span class="eyebrow">${esc(run.set.title)} · ${step}</span>
    <h1>${SECTIONS[k].name}</h1>
    <div class="facts"><div class="fact"><b class="num">${n}</b><span class="muted small">questions</span></div><div class="fact"><b class="num">${min}:00</b><span class="muted small">minutes</span></div><div class="fact"><b class="num">${fmt(min * 60000 / n)}</b><span class="muted small">per question</span></div></div>
    <ul class="rules">
      <li>One question per screen. Once you press <strong>Next</strong>, you can't go back.</li>
      <li>An unanswered question counts as wrong, and wrong answers cost nothing extra. If in doubt, pick your best option and move on.</li>
      ${multi ? `<li><strong>Select all that apply</strong> questions only score if you pick exactly the right set.</li>` : ""}
      <li>The section closes automatically at 0:00.</li>
      <li>Shortcuts: <strong>A–E</strong> or <strong>1–5</strong> to select, <strong>Enter</strong> to move on.</li>
    </ul>
    <div class="row"><button class="btn btn-primary btn-lg" id="go">${I.play}Start</button><button class="btn btn-ghost" id="quit">Back to home</button></div>
  </div></main>`;
  document.getElementById("go").onclick = startSection;
  document.getElementById("quit").onclick = goHome;
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
  if (el) { el.textContent = fmt(left); el.classList.toggle("low", left <= 60000); }
  if (left <= 0) finishSection(true);
}

function showQuestion() {
  const c = run.cur, sec = curSec(), q = sec.questions[c.qIdx], n = sec.questions.length;
  const ctx = q.ctx && sec.contexts ? sec.contexts[q.ctx] : null;
  c.qStart = Date.now();
  const last = c.qIdx === n - 1;
  app.innerHTML = `
  <div class="bar"><div class="wrap"><div class="bar-in glass">
    <div style="min-width:0"><div class="bar-title">${SECTIONS[c.key].name}</div><div class="bar-sub num">Question ${c.qIdx + 1} of ${n}</div></div>
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
    app.innerHTML = `<main class="wrap center fade-in"><div class="glass">
      <span class="eyebrow">${esc(run.set.title)}</span>
      <h1>${timeout ? "Time's up." : "Section complete."}</h1>
      <p class="muted">Results are shown at the end of the mock test. Next: <strong>${SECTIONS[nk].name}</strong> (${curSec().questions.length} questions, ${secMinutes(run.set, nk)} min). The clock starts when you press the button.</p>
      <button class="btn btn-primary btn-lg" id="go">Continue</button>
    </div></main>`;
    document.getElementById("go").onclick = showIntro;
    window.scrollTo(0, 0);
  } else showResults(true);
}

function summaryLine() {
  const r = run.results;
  const parts = run.order.map(k => `${k} ${r[k].items.filter(x => x.ok).length}/${r[k].items.length} (${fmt(r[k].used)}/${fmt(r[k].limit)})`).join(" · ");
  return `${SITE.name} · ${today()} · ${run.set.title} · ${parts}`;
}

function showResults(save) {
  clearInterval(tick); window.onkeydown = null;
  const r = run.results;
  const tot = run.order.reduce((a, k) => a + r[k].items.filter(x => x.ok).length, 0);
  const max = run.order.reduce((a, k) => a + r[k].items.length, 0);
  const line = summaryLine();
  if (save) {
    const h = store.get(KEY_HIST, []);
    h.push({ date: today(), setId: run.set.id, sections: run.order, set: run.set.title, mode: run.label, summary: run.order.map(k => `${k} ${r[k].items.filter(x => x.ok).length}/${r[k].items.length}`).join(" · "), line });
    store.set(KEY_HIST, h.slice(-100));
  }
  const scoreCard = k => {
    const s = r[k], ok = s.items.filter(x => x.ok).length, pct = Math.round(ok / s.items.length * 100);
    return `<div class="score glass"><span class="eyebrow">${SECTIONS[k].name}</span><span class="big num">${ok}/${s.items.length}</span>
      <div class="meter${pct >= 80 ? "" : " ko"}" title="Target 80%"><div style="width:${pct}%"></div></div>
      <div class="row" style="gap:6px"><span class="pill ${pct >= 80 ? "ok" : "ko"}">${pct}% · target 80%</span>${s.timeout ? `<span class="pill warn">time ran out</span>` : ""}</div>
      <span class="muted small num">Time ${fmt(s.used)} of ${fmt(s.limit)}${s.unreached ? ` · ${s.unreached} not reached` : ""}</span></div>`;
  };
  const review = k => {
    const sec = run.set.sections[k];
    return `<section style="display:grid;gap:8px"><h2 style="font-size:20px">${SECTIONS[k].name}</h2>${r[k].items.map((x, i) => {
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
      <div class="row"><button class="btn btn-primary" id="home">Back to home</button><button class="btn" id="copy">Copy result</button><span class="msg-ok" id="copied" hidden>Copied</span></div>
      <div class="reg" id="reg">${esc(line)}</div></header>
    <div class="scores">${run.order.map(scoreCard).join("")}</div>
    ${run.order.map(review).join("")}
  </main>`;
  document.getElementById("copy").onclick = () => copyText(line, document.getElementById("reg"), document.getElementById("copied"));
  document.getElementById("home").onclick = goHome;
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
