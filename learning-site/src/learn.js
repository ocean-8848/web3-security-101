/* ---------- 学习层：学习状态、笔记、高亮、思考题作答、复习队列、学习台 ----------
 * 用法：LearnLayer.init({ key, name, root(), current(), chapters(), watch, onDoneClick? , legacyDone? })
 * 存储：优先使用 artifact db（data/users/<id>/…，仅本人可见、跨设备同步）；不可用时只存浏览器。
 */
(() => {
const L = {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (n, from) => { const d = from ? new Date(from + 'T00:00:00') : new Date(); d.setDate(d.getDate() + n); return today(d); };
const IVL = [1, 2, 4, 7, 15, 30, 60];
const STATUS = { 0: '未开始', 1: '在读', 3: '已读', 2: '已掌握' };
const ORDER = [0, 1, 3, 2]; // 3 = 读完但还没掌握；不进入复习队列
const SITES = [
  ['w3hb', 'Web3 从 0 到 1', 'https://claude.ai/artifact/PBJN64zKKK7eQEdvntySLE'],
  ['sca', '合约审计 101', 'https://claude.ai/artifact/NqWHfGnuG6Rr5VqWyaNThF'],
  ['w3chb', 'Web3 合约', 'https://claude.ai/artifact/N9JeR3FGfxaUEbaaMZhUXm'],
  ['cshb', 'Web3 安全', 'https://claude.ai/artifact/SYLKgrVxjJsVs1xhaJ2fZH'],
  ['scsb', 'Web3 智能合约安全', 'https://claude.ai/artifact/4De32TJHKpSUA1n5gbVaXi'],
  ['cexhb', 'CEX 交易所', 'https://claude.ai/artifact/CZQ2YzWa9SFvivd4MhZgFv'],
  ['losshb', 'Web3 资损 101', 'https://claude.ai/artifact/4GZXdMUp33hjcv1Ai8jYru']
];

let C, S, N, mode = 'local', db = null, uid = null, curId = null, lastTick = Date.now(), lastAct = Date.now();

/* ---------- storage ---------- */
const lsKey = () => 'll:' + C.key;
function blank() { return { v: 1, ch: {}, days: {}, last: null, up: 0 }; }
function loadLocal() {
  try { const o = JSON.parse(localStorage.getItem(lsKey()) || 'null'); if (o && o.S) { S = o.S; N = o.N || {}; return; } } catch (e) {}
  S = blank(); N = {};
}
function saveLocal() { try { localStorage.setItem(lsKey(), JSON.stringify({ S, N })); } catch (e) {} }
const docIdFor = id => 'n_' + String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
const pending = new Set(); let flushT = null, busy = false;
function touch(what) {
  S.up = Date.now(); saveLocal();
  if (mode !== 'cloud') return;
  pending.add(what); clearTimeout(flushT); flushT = setTimeout(flush, 1500);
}
async function flush() {
  if (busy || mode !== 'cloud' || !pending.size) return;
  busy = true;
  for (const what of [...pending]) {
    pending.delete(what);
    const isState = what === 'state';
    const body = isState ? S : N[what];
    if (!body) continue;
    try { await db.doc(`data/users/${uid}/${isState ? 'state' : docIdFor(what)}`).set(JSON.parse(JSON.stringify(body))); }
    catch (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { mode = 'readonly'; break; }
      if (e && e.code === 'quota_exceeded') { mode = 'readonly'; toast('云端空间已满，新的更改只保存在本浏览器。'); break; }
      pending.add(what);
    }
  }
  busy = false;
  chip();
  if (mode === 'cloud' && pending.size) flushT = setTimeout(flush, 4000);
}
function mergeState(a, b) { // per-chapter newest wins
  const out = blank();
  const ids = new Set([...Object.keys(a.ch || {}), ...Object.keys(b.ch || {})]);
  ids.forEach(id => { const x = (a.ch || {})[id], y = (b.ch || {})[id]; out.ch[id] = !x ? y : !y ? x : ((x.u || 0) >= (y.u || 0) ? x : y); });
  const days = new Set([...Object.keys(a.days || {}), ...Object.keys(b.days || {})]);
  days.forEach(d => { out.days[d] = Math.max((a.days || {})[d] || 0, (b.days || {})[d] || 0); });
  out.last = (a.up || 0) >= (b.up || 0) ? a.last : b.last;
  out.up = Math.max(a.up || 0, b.up || 0);
  return out;
}
async function connect() {
  if (!window.claude || !window.claude.use) { chip(); return; }
  try {
    const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    const id = u && await u.id();
    if (!d || !id) { chip(); return; }
    db = d; uid = id;
    const snap = await db.collection(`data/users/${uid}`).get();
    let remoteS = null; const remoteN = {};
    snap.docs.forEach(doc => { const v = doc.data(); if (!v) return; if (doc.id === 'state') remoteS = v; else if (v.ch) remoteN[v.ch] = v; });
    const localS = S;
    S = remoteS ? mergeState(localS, remoteS) : localS;
    const pushState = !remoteS || JSON.stringify(S.ch) !== JSON.stringify(remoteS.ch);
    const pushNotes = [];
    new Set([...Object.keys(N), ...Object.keys(remoteN)]).forEach(k => {
      const x = N[k], y = remoteN[k];
      if (!y) { N[k] = x; pushNotes.push(k); } else if (!x || (y.up || 0) >= (x.up || 0)) N[k] = y; else pushNotes.push(k);
    });
    mode = 'cloud';
    remapIds();
    saveLocal();
    if (pushState) pending.add('state');
    pushNotes.forEach(k => pending.add(k));
    if (pending.size) flushT = setTimeout(flush, 800);
    refreshAll();
  } catch (e) { console.warn('learn-layer db', e); mode = 'local'; }
  chip();
}

// Renamed chapter ids (cfg.aliases: old -> new): move progress and notes once; newest wins.
function remapIds() {
  const A = C.aliases || {}; let changed = false;
  Object.entries(A).forEach(([o, n]) => {
    const x = S.ch[o];
    if (x) { const y = S.ch[n]; if (!y || (x.u || 0) > (y.u || 0)) S.ch[n] = x; delete S.ch[o]; changed = true; }
    const m = N[o];
    if (m) { const k = N[n]; if (!k || (m.up || 0) > (k.up || 0)) { N[n] = Object.assign({}, m, { ch: n }); if (mode === 'cloud') pending.add(n); } delete N[o]; changed = true; }
    if (S.last === o) { S.last = n; changed = true; }
    if (S.last && S.last.id === o) { S.last = Object.assign({}, S.last, { id: n }); changed = true; }
  });
  if (changed) { saveLocal(); if (mode === 'cloud') pending.add('state'); }
  return changed;
}

/* ---------- model helpers ---------- */
function E(id) { return S.ch[id] || (S.ch[id] = { s: 0, u: 0 }); }
function note(id) { return N[id] || (N[id] = { ch: id, title: titleOf(id), text: '', hl: [], ans: {}, up: 0 }); }
function hasNote(n) { return n && (n.text.trim() || (n.hl && n.hl.length) || Object.values(n.ans || {}).some(v => String(v).trim())); }
function chList() { try { return C.chapters() || []; } catch (e) { return []; } }
function titleOf(id) { const c = chList().find(x => x.id === id); return c ? c.title : id; }
function setStatus(id, s) {
  const e = E(id); if (e.s === s) return;
  e.s = s; e.u = Date.now();
  if (s === 2) { e.m = e.m || today(); if (!e.rv) e.rv = { due: addDays(1), step: 0 }; }
  if (C.onStatus) try { C.onStatus(id, s); } catch (x) {}
  touch('state'); refreshAll();
}
function setHard(id, v) { const e = E(id); e.h = !!v; e.u = Date.now(); if (v) e.rv = { due: today(), step: 0 }; touch('state'); refreshAll(); }
function dueList() { const t = today(); return Object.entries(S.ch).filter(([, e]) => e.rv && e.rv.due <= t && (e.s === 2 || e.h || e.qw)).map(([id, e]) => ({ id, e })).sort((a, b) => a.e.rv.due.localeCompare(b.e.rv.due)); }
function review(id, ok) {
  const e = E(id), step = ok ? Math.min((e.rv ? e.rv.step : 0) + 1, IVL.length - 1) : 0;
  e.rv = { due: addDays(ok ? IVL[step] : 1), step, last: today() };
  if (ok && step >= 2) e.qw = 0;
  e.u = Date.now(); touch('state'); refreshAll();
}

/* ---------- time tracking (active reading only) ---------- */
function tick() {
  const now = Date.now(), dt = Math.min(now - lastTick, 30000); lastTick = now;
  if (!curId || document.hidden || now - lastAct > 120000) return;
  const e = E(curId); e.sec = (e.sec || 0) + dt / 1000;
  const d = today(); S.days[d] = (S.days[d] || 0) + dt / 1000;
  const keys = Object.keys(S.days); if (keys.length > 400) keys.sort().slice(0, keys.length - 400).forEach(k => delete S.days[k]);
}
function flushTime() { tick(); if (curId) { E(curId).u = Date.now(); touch('state'); } }
const fmtMin = s => { const m = Math.round((s || 0) / 60); return m < 60 ? m + ' 分钟' : (m / 60).toFixed(1) + ' 小时'; };

/* ---------- styles ---------- */
const CSS = `
:root{--ll-acc:var(--accent,var(--gold,#0a7a69));--ll-acc-soft:var(--accent-soft,var(--gold-soft,#d3eee8));--ll-ok:var(--ok,var(--low,var(--buy,#1d8a4b)));--ll-ok-soft:var(--ok-soft,var(--low-soft,var(--buy-soft,#dcf1e3)));--ll-warn:var(--warn,var(--med,#b0650a));--ll-warn-soft:var(--warn-soft,var(--med-soft,#f9ead3));--ll-risk:var(--risk,var(--crit,var(--sell,#c3304b)));--ll-risk-soft:var(--risk-soft,var(--crit-soft,var(--sell-soft,#f9e0e5)));--ll-hl:var(--ll-warn-soft)}
.ll-btn{border:1px solid var(--rule);background:var(--paper);color:var(--ink);border-radius:8px;min-height:32px;padding:4px 10px;cursor:pointer;font:inherit;font-size:13.5px;line-height:1.4;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.ll-btn:hover{border-color:var(--ll-acc)}.ll-btn.pri{background:var(--ll-acc);border-color:var(--ll-acc);color:var(--paper);font-weight:600}
.ll-btn[aria-pressed="true"]{background:var(--ll-acc-soft);border-color:var(--ll-acc);font-weight:600}
.ll-btn:focus-visible,.ll-tab:focus-visible{outline:2px solid var(--ll-acc);outline-offset:2px}
.ll-open{height:34px}.ll-open svg{width:20px;height:20px;flex:none}.ll-open .ll-n{font-family:var(--f-mono,monospace);font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink-2)}
@media (max-width:640px){.ll-open .ll-lbl{display:none}}
.ll-open .ll-due{display:none;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--ll-risk);color:var(--paper);font-size:10.5px;font-weight:700;line-height:16px;text-align:center}
@media (max-width:520px){.ll-open .ll-n{display:none}.ll-open .ll-due{display:inline-block}.ll-open{padding:4px 7px}}
.ll-strip{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:14px 0 18px;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);font-size:13.5px;line-height:1.5}
.ll-seg{display:inline-flex;border:1px solid var(--rule);border-radius:8px;overflow:hidden}
.ll-seg button{border:0;background:var(--paper);color:var(--ink);padding:5px 10px;cursor:pointer;font:inherit;font-size:13px;display:inline-flex;align-items:center;gap:5px}
.ll-seg button+button{border-left:1px solid var(--rule)}
.ll-seg button[aria-pressed="true"]{font-weight:700}
.ll-seg button[data-s="1"][aria-pressed="true"]{background:var(--ll-warn-soft);color:var(--ll-warn)}
.ll-seg button[data-s="3"][aria-pressed="true"]{background:var(--ll-info-soft,#e2e8fa);color:var(--ll-info,#3756c8)}
.ll-seg button[data-s="2"][aria-pressed="true"]{background:var(--ll-ok-soft);color:var(--ll-ok)}
.ll-dot{width:9px;height:9px;border-radius:50%;border:1.5px solid currentColor;display:inline-block}
.ll-dot.s1{background:linear-gradient(90deg,currentColor 50%,transparent 50%)}.ll-dot.s2{background:currentColor}.ll-dot.s3{background:conic-gradient(currentColor 0 75%,transparent 0)}
.ll-meta{color:var(--ink-2);font-family:var(--f-mono,monospace);font-size:12px;font-variant-numeric:tabular-nums}
.ll-sp{flex:1}
.ll-chip{font-size:12px;padding:2px 8px;border-radius:999px;background:var(--tint);color:var(--ink-2);white-space:nowrap}
.ll-chip.cloud{background:var(--ll-ok-soft);color:var(--ll-ok)}
.ll-card{margin:40px 0 8px;padding:16px;border:1.5px solid var(--ll-acc);border-radius:12px;background:var(--paper);display:grid;gap:12px}
.ll-card h3{margin:0!important;font-size:17px!important;border:0!important;padding:0!important}
.ll-card textarea,.ll-ans textarea,.ll-pop textarea,.ll-drawer textarea{width:100%;min-height:96px;resize:vertical;font:inherit;font-size:14.5px;line-height:1.7;padding:10px 12px;border:1px solid var(--rule);border-radius:8px;background:var(--ground);color:var(--ink)}
.ll-card .ll-hint,.ll-hint{font-size:12.5px;color:var(--ink-2);line-height:1.6}
.ll-hls{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.ll-hls li{display:grid;gap:4px;padding:8px 10px;border-radius:8px;background:var(--ground);border-left:3px solid var(--ll-warn);font-size:14px;line-height:1.6;max-width:none!important}
.ll-hls q{quotes:none;cursor:pointer}.ll-hls .n{color:var(--ink-2);font-size:13px}
mark.ll-hl{background:var(--ll-hl);color:inherit;border-bottom:2px solid var(--ll-warn);padding:0 1px;border-radius:2px;cursor:pointer}
mark.ll-hl.has-n{border-bottom-style:dashed}
.ll-ans{margin:6px 0 10px}.ll-ans summary{cursor:pointer;font-size:13px;color:var(--ll-acc);list-style:none;display:inline-flex;gap:6px;align-items:center}
.ll-ans summary::-webkit-details-marker{display:none}.ll-ans textarea{min-height:70px;margin-top:6px}
.ll-refbox{margin-top:8px;display:grid;gap:8px;justify-items:start}
.ll-ref{width:100%;padding:10px 12px;border-radius:8px;background:var(--ll-ok-soft);border-left:3px solid var(--ll-ok);font-size:14.5px;line-height:1.75;display:grid;gap:8px}
.ll-ref-h{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--ll-ok)}
.ll-ref-b code{font-family:var(--f-mono,monospace);font-size:.88em;background:var(--paper);padding:1px 5px;border-radius:4px}
.ll-ck .ll-btn[aria-pressed="true"]{background:var(--paper)}
.ll-ck .ll-btn[data-c="2"][aria-pressed="true"]{border-color:var(--ll-ok);color:var(--ll-ok)}.ll-ck .ll-btn[data-c="1"][aria-pressed="true"]{border-color:var(--ll-warn);color:var(--ll-warn)}.ll-ck .ll-btn[data-c="0"][aria-pressed="true"]{border-color:var(--ll-risk);color:var(--ll-risk)}
.ll-ans.ck2 summary::before{content:"✓ ";color:var(--ll-ok)}.ll-ans.ck1 summary::before{content:"◐ ";color:var(--ll-warn)}.ll-ans.ck0 summary::before{content:"✗ ";color:var(--ll-risk)}
.ll-ans.filled summary::after{content:"已作答";font-size:11px;padding:0 6px;border-radius:999px;background:var(--ll-ok-soft);color:var(--ll-ok)}
.ll-sel{position:fixed;z-index:95;display:flex;gap:4px;padding:4px;border-radius:10px;background:var(--ink);box-shadow:0 6px 20px rgba(0,0,0,.25)}
.ll-sel button{border:0;background:transparent;color:var(--paper);font:inherit;font-size:13px;padding:5px 10px;border-radius:6px;cursor:pointer}
.ll-sel button:hover{background:rgba(127,127,127,.3)}
.ll-pop{position:fixed;z-index:96;width:min(340px,calc(100vw - 32px));padding:12px;border-radius:10px;background:var(--paper);border:1px solid var(--rule);box-shadow:0 10px 30px rgba(0,0,0,.2);display:grid;gap:8px;font-size:14px}
.ll-pop q{quotes:none;color:var(--ink-2);font-size:13px;line-height:1.6;max-height:5.2em;overflow:hidden}
.ll-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.navlink.ll-s1{box-shadow:inset 3px 0 0 var(--ll-warn)}.navlink.ll-s2{box-shadow:inset 3px 0 0 var(--ll-ok)}.navlink.ll-s3{box-shadow:inset 3px 0 0 var(--ll-info,#3756c8)}
.navlink.ll-h>span:last-child::before{content:"★ ";color:var(--ll-warn)}
.ll-scrim{position:fixed;inset:0;z-index:89;background:rgba(0,0,0,.28)}
.ll-drawer{position:fixed;z-index:90;top:0;right:0;bottom:0;width:min(440px,100vw);display:flex;flex-direction:column;background:var(--paper);border-left:1px solid var(--rule);box-shadow:-10px 0 30px rgba(0,0,0,.15);padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-right:env(safe-area-inset-right,0px);color:var(--ink);font-size:14.5px;line-height:1.6}
.ll-dh{display:flex;align-items:center;gap:8px;padding:12px 16px 0}
.ll-dh b{font-size:16px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ll-tabs{display:flex;gap:4px;padding:10px 16px 0;border-bottom:1px solid var(--rule);overflow-x:auto}
.ll-tab{border:0;background:transparent;color:var(--ink-2);font:inherit;font-size:14px;padding:8px 10px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.ll-tab[aria-selected="true"]{color:var(--ink);font-weight:700;border-bottom-color:var(--ll-acc)}
.ll-tab .c{font-family:var(--f-mono,monospace);font-size:11px;margin-left:4px;padding:0 5px;border-radius:999px;background:var(--ll-risk-soft);color:var(--ll-risk)}
.ll-body{flex:1;overflow-y:auto;padding:16px;display:grid;gap:16px;align-content:start}
.ll-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ll-kpi{padding:10px;border-radius:10px;background:var(--ground);border:1px solid var(--rule);min-width:0}
.ll-kpi .k{font-size:12px;color:var(--ink-2)}.ll-kpi .v{font-family:var(--f-mono,monospace);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3}
.ll-kpi .v small{font-size:12px;color:var(--ink-2);font-weight:400}
.ll-sec h4{margin:0 0 8px;font-size:12px;letter-spacing:.1em;color:var(--ink-2);font-weight:700}
.ll-bar{height:8px;border-radius:4px;background:var(--tint);overflow:hidden;display:flex}
.ll-bar i{display:block;height:100%}.ll-bar i.m{background:var(--ll-ok)}.ll-bar i.r{background:var(--ll-warn)}.ll-bar i.d{background:var(--ll-info,#3756c8)}
.ll-grp{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;font-size:13.5px}
.ll-grp .ll-bar{grid-column:1/-1}.ll-grp .ll-meta{text-align:right}
.ll-grps{display:grid;gap:10px}
.ll-heat{display:grid;grid-template-columns:repeat(15,minmax(0,1fr));gap:3px}
.ll-heat i{aspect-ratio:1;border-radius:3px;background:var(--tint);max-width:100%}
.ll-heat i.l1{background:var(--ll-acc-soft)}.ll-heat i.l2{background:color-mix(in srgb,var(--ll-acc) 55%,var(--ll-acc-soft))}.ll-heat i.l3{background:var(--ll-acc)}
.ll-list{display:grid;gap:8px}
.ll-item{display:grid;gap:4px;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--ground);min-width:0}
.ll-item a{color:var(--ink);font-weight:600;text-decoration:none}.ll-item a:hover{color:var(--ll-acc)}
.ll-item .x{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere;white-space:pre-wrap;max-height:7.5em;overflow:hidden}
.ll-empty{padding:18px;border:1px dashed var(--rule);border-radius:10px;color:var(--ink-2);font-size:13.5px;text-align:center}
.ll-search{width:100%;font:inherit;font-size:14px;padding:8px 10px;border:1px solid var(--rule);border-radius:8px;background:var(--ground);color:var(--ink)}
.ll-sites{display:flex;flex-wrap:wrap;gap:8px}.ll-sites a{text-decoration:none}
.ll-toast{position:fixed;z-index:120;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);padding:8px 14px;border-radius:8px;background:var(--ink);color:var(--paper);font-size:13.5px;max-width:calc(100vw - 32px)}
@media (prefers-reduced-motion:no-preference){.ll-drawer{animation:ll-in .18s ease-out}@keyframes ll-in{from{transform:translateX(24px);opacity:.6}}}
`;

/* ---------- UI: top-bar button ---------- */
function ring(p) {
  const r = 8, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="${r}" fill="none" stroke="var(--tint)" stroke-width="3"/><circle cx="10" cy="10" r="${r}" fill="none" stroke="var(--ll-ok)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 10 10)"/></svg>`;
}
function stats() {
  const list = chList(), ids = list.map(c => c.id);
  const m = ids.filter(id => (S.ch[id] || {}).s === 2).length, r = ids.filter(id => (S.ch[id] || {}).s === 1).length, d = ids.filter(id => (S.ch[id] || {}).s === 3).length;
  return { list, total: ids.length, m, r, d };
}
function mountOpenBtn() {
  if ($('.ll-open')) return;
  const bar = $(C.bar || '.bar'); if (!bar) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'll-btn ll-open'; b.setAttribute('aria-label', '打开学习台');
  b.addEventListener('click', () => openDrawer());
  const sp = $('.spacer', bar); sp ? sp.after(b) : bar.appendChild(b);
  updOpenBtn();
}
function updOpenBtn() {
  const b = $('.ll-open'); if (!b) return;
  const st = stats(), due = dueList().length;
  b.innerHTML = `${ring(st.total ? st.m / st.total : 0)}<span class="ll-lbl">学习台</span><span class="ll-n">${st.m}/${st.total}${due ? ` · 复习 ${due}` : ''}</span>${due ? `<span class="ll-due" aria-label="今天要复习 ${due} 篇">${due}</span>` : ''}`;
}

/* ---------- UI: per-chapter strip and notes card ---------- */
function stripHtml(id) {
  const e = E(id), n = N[id], qz = e.qz ? Object.values(e.qz) : [];
  const nc = n ? (n.hl || []).length + (n.text.trim() ? 1 : 0) : 0;
  return `<span class="ll-seg" role="group" aria-label="学习状态">${ORDER.map(i => [STATUS[i], i]).map(([t, i]) => `<button type="button" data-ll-s="${i}" data-s="${i}" aria-pressed="${(e.s || 0) === i}"><span class="ll-dot s${i}"></span>${t}</button>`).join('')}</span>
  <button type="button" class="ll-btn" data-ll-hard aria-pressed="${!!e.h}">${e.h ? '★ 难点' : '☆ 标为难点'}</button>
  <button type="button" class="ll-btn" data-ll-goto-notes>✎ 笔记${nc ? ' · ' + nc : ''}</button>
  <span class="ll-sp"></span>
  <span class="ll-meta">${qz.length ? `自测 ${qz.filter(Boolean).length}/${qz.length} · ` : ''}已读 ${fmtMin(e.sec)}</span>
  <span class="ll-chip" data-ll-chip></span>`;
}
function cardHtml(id) {
  const n = N[id] || { text: '', hl: [] }, e = E(id);
  const hl = (n.hl || []).map(h => `<li data-h="${h.id}"><q data-ll-jump="${h.id}">${esc(h.q)}</q>${h.n ? `<span class="n">批注：${esc(h.n)}</span>` : ''}</li>`).join('');
  const rv = e.rv ? `下次复习：${e.rv.due}` : '标记为“已掌握”后，本篇会进入复习队列。';
  return `<h3>我的笔记 · 本篇</h3>
  <textarea id="ll-note-${esc(id)}" data-ll-note placeholder="写下你的理解、疑问、要回头看的地方。自动保存。">${esc(n.text)}</textarea>
  <div class="ll-hint">在正文里选中一段文字，可以高亮并加批注。${esc(rv)}</div>
  ${hl ? `<div><div class="ll-hint" style="margin-bottom:6px">本篇高亮 ${n.hl.length} 处（点击跳到原文）</div><ul class="ll-hls">${hl}</ul></div>` : ''}
  <div class="ll-row"><button type="button" class="ll-btn ${e.s === 2 ? '' : 'pri'}" data-ll-master>${e.s === 2 ? '✓ 已掌握（点击改回已读）' : '我已掌握本篇'}</button><button type="button" class="ll-btn" data-ll-drawer="notes">打开笔记本</button></div>`;
}
function rootEl() { try { return C.root(); } catch (e) { return null; } }
const syncHooks = [], homeHooks = [];
function sync() { sync0(); syncHooks.forEach(f => { try { f(); } catch (e) { console.warn(e); } }); }
function sync0() {
  const root = rootEl();
  let cur = null; try { cur = C.current(); } catch (e) {}
  const id = cur ? cur.id : null;
  if (id !== curId) { if (curId) flushTime(); curId = id; if (id) { const e = E(id); e.l = Date.now(); if (!e.f) e.f = e.l; if (!e.s) e.s = 1; e.u = Date.now(); S.last = id; touch('state'); updOpenBtn(); decorateNav(); } }
  if (!root || !id) return;
  if (cur.title) { const n = N[id]; if (n && n.title !== cur.title) n.title = cur.title; }
  if (!$('.ll-strip', root)) {
    const s = document.createElement('div'); s.className = 'll-strip'; s.dataset.llFor = id; s.innerHTML = stripHtml(id);
    const h1 = $('h1', root); h1 ? h1.after(s) : root.prepend(s);
    chip();
  }
  if (!$('.ll-card', root)) {
    const c = document.createElement('section'); c.className = 'll-card'; c.id = 'll-notes'; c.dataset.llFor = id; c.innerHTML = cardHtml(id);
    const anchor = C.cardBefore ? $(C.cardBefore, root) : null;
    anchor ? anchor.before(c) : root.appendChild(c);
  }
  decorateQuestions(root, id);
  applyHighlights(root, id);
  bindQuiz(root, id);
  if (C.after) try { C.after(root, id); } catch (e) {}
}
function refreshCur() {
  const root = rootEl(); if (!root || !curId) return;
  const s = $('.ll-strip', root); if (s) { s.innerHTML = stripHtml(curId); chip(); }
  const c = $('.ll-card', root);
  if (c) { const ta = $('[data-ll-note]', c); const focused = ta && document.activeElement === ta; if (!focused) c.innerHTML = cardHtml(curId); }
}
function refreshAll() { refreshCur(); updOpenBtn(); decorateNav(); if ($('.ll-drawer')) renderDrawer(); }
function chip() {
  const t = mode === 'cloud' ? ['cloud', '已同步到账号'] : mode === 'readonly' ? ['', '仅保存在本浏览器'] : ['', '保存在本浏览器'];
  $$('[data-ll-chip]').forEach(c => { c.className = 'll-chip ' + t[0]; c.textContent = t[1]; c.title = mode === 'cloud' ? '学习记录保存在你的 Claude 账号下，只有你自己能看到，换设备也在。' : '当前无法同步到账号，记录只保存在这个浏览器里。'; });
}
function decorateNav() {
  $$(C.navSel || '.navlink').forEach(a => {
    const id = (a.getAttribute('href') || '').replace(/^#/, '') || a.dataset.id;
    const e = S.ch[id] || {};
    a.classList.toggle('ll-s1', e.s === 1); a.classList.toggle('ll-s2', e.s === 2); a.classList.toggle('ll-s3', e.s === 3); a.classList.toggle('ll-h', !!e.h);
  });
}

/* ---------- 思考题: inline answer boxes ---------- */
function decorateQuestions(root, id) {
  const hs = $$('h2, h3', root).filter(h => /思考题/.test(h.textContent) && !h.closest('.ll-card'));
  let idx = 0;
  hs.forEach(h => {
    let ol = h.nextElementSibling; while (ol && !/^(OL|UL)$/.test(ol.tagName) && !/^H[1-3]$/.test(ol.tagName)) ol = ol.nextElementSibling;
    if (!ol || !/^(OL|UL)$/.test(ol.tagName)) return;
    $$(':scope > li', ol).forEach(li => {
      const k = idx++;
      if ($('.ll-ans', li)) return;
      const v = (N[id] && N[id].ans && N[id].ans[k]) || '';
      const d = document.createElement('details'); d.className = 'll-ans' + (v.trim() ? ' filled' : '');
      const ref = ((window.LL_ANSWERS || {})[id] || [])[k];
      const ck = N[id] && N[id].ck ? N[id].ck[k] : undefined;
      d.innerHTML = `<summary>✎ 写下我的答案${ref ? ' · 参考答案' : ''}</summary><textarea id="ll-ans-${esc(id)}-${k}" data-ll-ans="${k}" placeholder="用自己的话回答。自动保存。写完再对照参考答案。">${esc(v)}</textarea>`
        + (ref ? `<div class="ll-refbox" data-k="${k}"><button type="button" class="ll-btn" data-ll-ref="${k}">${v.trim() ? '对照参考答案' : '直接看参考答案'}</button><div class="ll-ref" hidden><div class="ll-ref-h">参考答案</div><div class="ll-ref-b">${ref}</div>
          <div class="ll-row ll-ck" role="group" aria-label="自评">${[[2, '答对了'], [1, '部分对'], [0, '没答对']].map(([c, t]) => `<button type="button" class="ll-btn" data-ll-ck="${k}" data-c="${c}" aria-pressed="${ck === c}">${t}</button>`).join('')}<span class="ll-hint">“没答对”会把本篇加入今天的复习。</span></div></div></div>` : '');
      if (ref && ck !== undefined) d.classList.add('checked', 'ck' + ck);
      li.appendChild(d);
    });
  });
}

/* ---------- quiz capture (.quiz[data-a] with button[data-qi]) ---------- */
function bindQuiz(root, id) {
  const e = E(id);
  $$('.quiz', root).forEach((q, i) => {
    if (q.dataset.llq) return; q.dataset.llq = '1';
    if (e.qz && i in e.qz) { const w = document.createElement('div'); w.className = 'll-hint'; w.textContent = e.qz[i] ? '上次首答：正确' : '上次首答：错误（已加入复习）'; q.appendChild(w); }
  });
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('.quiz button[data-qi]'); if (!b || !curId) return;
  const root = rootEl(); if (!root || !root.contains(b)) return;
  const q = b.closest('.quiz'), i = $$('.quiz', root).indexOf(q); if (i < 0) return;
  const e = E(curId); e.qz = e.qz || {};
  if (q.dataset.llAnswered) return; q.dataset.llAnswered = '1';
  const ok = +b.dataset.qi === +q.dataset.a; e.qz[i] = ok ? 1 : 0;
  if (!ok) { e.qw = 1; e.rv = { due: today(), step: 0 }; }
  e.u = Date.now(); touch('state'); refreshCur(); updOpenBtn();
}, true);

/* ---------- highlights ---------- */
const SKIP = 'script,style,svg,textarea,input,button,select,.ll-strip,.ll-card,.ll-ans,.lab,.lab-body,.mmd-body,.mmd-wrap,figure.mmd,.code-wrap,pre';
function textNodes(root) {
  const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (!n.nodeValue.trim() || (n.parentElement && n.parentElement.closest(SKIP))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; while ((n = w.nextNode())) out.push(n);
  return out;
}
const strip = s => s.replace(/\s+/g, '');
function locate(root, quote) { // match ignoring whitespace; returns [{node,start,end}]
  const target = strip(quote); if (!target) return null;
  const nodes = textNodes(root), map = []; let flat = '';
  nodes.forEach(n => { const v = n.nodeValue; for (let i = 0; i < v.length; i++) if (!/\s/.test(v[i])) { flat += v[i]; map.push([n, i]); } });
  const at = flat.indexOf(target); if (at < 0) return null;
  const segs = [];
  for (let k = at; k < at + target.length; k++) {
    const [n, i] = map[k], last = segs[segs.length - 1];
    if (last && last.node === n) last.end = i + 1; else segs.push({ node: n, start: i, end: i + 1 });
  }
  return segs;
}
function wrap(segs, h) {
  for (let i = segs.length - 1; i >= 0; i--) {
    const { node, start, end } = segs[i];
    const r = document.createRange(); r.setStart(node, start); r.setEnd(node, end);
    const m = document.createElement('mark'); m.className = 'll-hl' + (h.n ? ' has-n' : ''); m.dataset.h = h.id; m.title = h.n || '高亮';
    try { r.surroundContents(m); } catch (e) {}
  }
}
function applyHighlights(root, id) {
  const n = N[id]; if (!n || !n.hl || !n.hl.length) return;
  n.hl.forEach(h => { if (root.querySelector(`mark.ll-hl[data-h="${h.id}"]`)) return; const segs = locate(root, h.q); if (segs) wrap(segs, h); });
}
function unwrap(root, hid) { $$(`mark.ll-hl[data-h="${hid}"]`, root).forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); }); }

let selBox = null;
function hideSel() { if (selBox) { selBox.remove(); selBox = null; } }
function onSelect() {
  const root = rootEl(); const sel = window.getSelection();
  if (!root || !curId || !sel || sel.isCollapsed || !sel.rangeCount) { hideSel(); return; }
  const r = sel.getRangeAt(0); const txt = sel.toString().trim();
  if (!txt || txt.length < 2 || !root.contains(r.commonAncestorContainer)) { hideSel(); return; }
  const anc = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
  if (anc && anc.closest(SKIP)) { hideSel(); return; }
  const rect = r.getBoundingClientRect();
  hideSel();
  selBox = document.createElement('div'); selBox.className = 'll-sel';
  selBox.innerHTML = `<button type="button" data-ll-mk="0">高亮</button><button type="button" data-ll-mk="1">高亮并批注</button><button type="button" data-ll-mk="2">记到笔记</button>`;
  document.body.appendChild(selBox);
  const w = selBox.offsetWidth, x = Math.max(8, Math.min(window.innerWidth - w - 8, rect.left + rect.width / 2 - w / 2));
  const y = rect.bottom + 8 + 40 > window.innerHeight ? rect.top - 44 : rect.bottom + 8;
  selBox.style.left = x + 'px'; selBox.style.top = Math.max(8, y) + 'px';
  selBox.dataset.q = txt.replace(/ℹ/g, '').slice(0, 400); // drop glossary-marker buttons from the quote
  selBox.addEventListener('mousedown', e => e.preventDefault());
}
function addHighlight(q, withNote, toNote) {
  const id = curId, root = rootEl(); if (!id || !root) return;
  const n = note(id); n.title = titleOf(id);
  if (toNote) { n.text = (n.text.trim() ? n.text.replace(/\s+$/, '') + '\n\n' : '') + '> ' + q.replace(/\n+/g, ' ') + '\n'; n.up = Date.now(); touch(id); refreshCur(); toast('已记到本篇笔记'); return; }
  const h = { id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), q, n: '', t: Date.now() };
  n.hl.push(h); n.up = Date.now(); touch(id);
  window.getSelection().removeAllRanges();
  const segs = locate(root, q); if (segs) wrap(segs, h);
  refreshCur(); updOpenBtn();
  if (withNote) { const m = $(`mark.ll-hl[data-h="${h.id}"]`, root); if (m) openPop(m, h.id, true); }
}
let pop = null;
function closePop() { if (pop) { pop.remove(); pop = null; } }
function openPop(mark, hid, focus) {
  closePop();
  const n = N[curId]; const h = n && n.hl.find(x => x.id === hid); if (!h) return;
  pop = document.createElement('div'); pop.className = 'll-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', '高亮批注');
  pop.innerHTML = `<q>${esc(h.q)}</q><textarea id="ll-pop-note" placeholder="批注（可选）。自动保存。">${esc(h.n)}</textarea><div class="ll-row"><button type="button" class="ll-btn" data-ll-delhl="${hid}">删除高亮</button><span class="ll-sp"></span><button type="button" class="ll-btn pri" data-ll-closepop>完成</button></div>`;
  document.body.appendChild(pop);
  const r = mark.getBoundingClientRect(), w = pop.offsetWidth, hgt = pop.offsetHeight;
  pop.style.left = Math.max(16, Math.min(window.innerWidth - w - 16, r.left)) + 'px';
  pop.style.top = (r.bottom + hgt + 16 > window.innerHeight ? Math.max(16, r.top - hgt - 8) : r.bottom + 8) + 'px';
  const ta = $('textarea', pop); let t;
  ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { h.n = ta.value; n.up = Date.now(); touch(curId); $$(`mark.ll-hl[data-h="${hid}"]`).forEach(m => { m.classList.toggle('has-n', !!h.n); m.title = h.n || '高亮'; }); }, 600); });
  ta.addEventListener('blur', () => { clearTimeout(t); if (h.n !== ta.value) { h.n = ta.value; n.up = Date.now(); touch(curId); } refreshCur(); });
  if (focus) ta.focus();
}

/* ---------- drawer: overview / review / notebook ---------- */
let tab = 'home';
function openDrawer(t) {
  if (t) tab = t;
  closeDrawer();
  flushTime();
  const s = document.createElement('div'); s.className = 'll-scrim'; s.addEventListener('click', closeDrawer);
  const d = document.createElement('aside'); d.className = 'll-drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', '学习台');
  document.body.append(s, d);
  renderDrawer();
  const f = $('.ll-tab[aria-selected="true"]', d); if (f) f.focus();
}
function closeDrawer() { $$('.ll-drawer, .ll-scrim').forEach(x => x.remove()); }
function renderDrawer() {
  const d = $('.ll-drawer'); if (!d) return;
  const due = dueList().length;
  const q = $('#ll-nb-q', d) ? $('#ll-nb-q', d).value : '';
  d.innerHTML = `<div class="ll-dh"><b>学习台 · ${esc(C.name)}</b><span class="ll-chip" data-ll-chip></span><button type="button" class="ll-btn" data-ll-close aria-label="关闭">✕</button></div>
  <div class="ll-tabs" role="tablist">${[['home', '概览'], ['review', '复习'], ['notes', '笔记本']].map(([k, t]) => `<button type="button" class="ll-tab" role="tab" data-ll-tab="${k}" aria-selected="${tab === k}">${t}${k === 'review' && due ? `<span class="c">${due}</span>` : ''}</button>`).join('')}</div>
  <div class="ll-body">${tab === 'home' ? homeHtml() : tab === 'review' ? reviewHtml() : notesHtml(q)}</div>`;
  chip();
  const qi = $('#ll-nb-q', d); if (qi) { qi.value = q; qi.addEventListener('input', () => { $('.ll-nb-list', d).innerHTML = notesList(qi.value); }); }
}
function link(id, label) { return `<a href="#${esc(id)}" data-ll-nav>${esc(label || titleOf(id))}</a>`; }
const label = c => (c.code && !c.title.startsWith(c.code) ? c.code + ' ' : '') + c.title;
function homeHtml() {
  const st = stats(), days = S.days || {}, t = today();
  const totalSec = Object.values(days).reduce((a, b) => a + b, 0);
  let streak = 0; for (let k = 0; k < 400; k++) { const dd = addDays(-k); if ((days[dd] || 0) >= 60) streak++; else if (k > 0) break; }
  const nNotes = Object.values(N).filter(hasNote).length, nHl = Object.values(N).reduce((a, n) => a + ((n.hl || []).length), 0);
  const last = S.last && st.list.find(c => c.id === S.last);
  const next = st.list.find(c => ![2, 3].includes((S.ch[c.id] || {}).s) && c.id !== S.last);
  const heat = []; for (let k = 44; k >= 0; k--) { const dd = addDays(-k), m = (days[dd] || 0) / 60; heat.push(`<i class="${m >= 45 ? 'l3' : m >= 15 ? 'l2' : m >= 1 ? 'l1' : ''}" title="${dd} · ${Math.round(m)} 分钟"></i>`); }
  return `<div class="ll-kpis">
    <div class="ll-kpi"><div class="k">已掌握</div><div class="v">${st.m}<small> / ${st.total}</small></div></div>
    <div class="ll-kpi"><div class="k">连续学习</div><div class="v">${streak}<small> 天</small></div></div>
    <div class="ll-kpi"><div class="k">累计用时</div><div class="v">${Math.round(totalSec / 3600 * 10) / 10}<small> 小时</small></div></div>
  </div>
  <div class="ll-bar" role="img" aria-label="已掌握 ${st.m} 篇，已读 ${st.d} 篇，在读 ${st.r} 篇，共 ${st.total} 篇"><i class="m" style="width:${st.total ? st.m / st.total * 100 : 0}%"></i><i class="d" style="width:${st.total ? st.d / st.total * 100 : 0}%"></i><i class="r" style="width:${st.total ? st.r / st.total * 100 : 0}%"></i></div>
  <div class="ll-hint">绿色：已掌握 ${st.m} 篇 · 蓝色：已读 ${st.d} 篇 · 橙色：在读 ${st.r} 篇 · 笔记 ${nNotes} 篇 · 高亮 ${nHl} 处</div>
  <div class="ll-sec"><h4>继续学习</h4><div class="ll-list">
    ${last ? `<div class="ll-item"><span class="ll-meta">上次读到</span>${link(last.id, label(last))}</div>` : ''}
    ${next ? `<div class="ll-item"><span class="ll-meta">建议下一篇（按目录顺序，第一篇还没读完的）</span>${link(next.id, label(next))}</div>` : ''}
    ${!last && !next ? '<div class="ll-empty">全部掌握了。去“复习”看看今天要回顾的内容。</div>' : ''}
  </div></div>
  ${homeHooks.map(f => { try { const g = (st.list.find(c => c.id === S.last) || {}).group; return f(st.list, S, g); } catch (e) { return ''; } }).join('')}
  <div class="ll-sec"><h4>最近 45 天</h4><div class="ll-heat" aria-label="最近 45 天每天学习时长">${heat.join('')}</div><div class="ll-hint" style="margin-top:6px">颜色越深，当天读得越久。今天已读 ${fmtMin(days[t])}。</div></div>
  <div class="ll-sec"><h4>我的学习站</h4><div class="ll-sites">${SITES.map(([k, t, u]) => k === C.key ? `<span class="ll-chip cloud">${esc(t)} · 当前</span>` : `<a class="ll-btn" href="${u}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join('')}</div><div class="ll-hint" style="margin-top:6px">每个学习站单独记录进度和笔记。</div></div>`;
}
function reviewHtml() {
  const due = dueList();
  const upcoming = Object.entries(S.ch).filter(([, e]) => e.rv && e.rv.due > today() && (e.s === 2 || e.h || e.qw)).sort((a, b) => a[1].rv.due.localeCompare(b[1].rv.due)).slice(0, 8);
  const why = e => [e.h ? '难点' : '', e.qw ? '自测答错' : '', e.s === 2 ? '已掌握·定期回顾' : ''].filter(Boolean).join(' · ');
  return `<div class="ll-hint">复习规则：标记“已掌握”的文章第二天进入复习；标为难点或自测答错的文章当天进入。每次“记得”，间隔按 1、2、4、7、15、30、60 天拉长；“模糊”就明天再看。</div>
  <div class="ll-sec"><h4>今天要复习（${due.length}）</h4><div class="ll-list">${due.length ? due.map(({ id, e }) => {
    const n = N[id], hl = n && n.hl && n.hl.length ? n.hl[n.hl.length - 1].q : '';
    return `<div class="ll-item">${link(id)}<span class="ll-meta">${why(e)} · 应复习 ${e.rv.due}</span>${hl ? `<span class="x">“${esc(hl.slice(0, 120))}”</span>` : ''}<div class="ll-row"><button type="button" class="ll-btn pri" data-ll-rv="${esc(id)}" data-ok="1">记得</button><button type="button" class="ll-btn" data-ll-rv="${esc(id)}" data-ok="0">模糊，明天再看</button></div></div>`;
  }).join('') : '<div class="ll-empty">今天没有要复习的内容。读完一篇后点“我已掌握本篇”，它会按间隔回到这里。</div>'}</div></div>
  ${upcoming.length ? `<div class="ll-sec"><h4>接下来</h4><div class="ll-list">${upcoming.map(([id, e]) => `<div class="ll-item">${link(id)}<span class="ll-meta">${e.rv.due} · ${why(e)}</span></div>`).join('')}</div></div>` : ''}`;
}
function notesList(q) {
  const order = chList().map(c => c.id);
  const items = Object.values(N).filter(hasNote).sort((a, b) => { const x = order.indexOf(a.ch), y = order.indexOf(b.ch); return (x < 0 ? 1e9 : x) - (y < 0 ? 1e9 : y); });
  const ql = (q || '').trim().toLowerCase();
  const txt = n => [n.title, n.text, ...(n.hl || []).map(h => h.q + ' ' + h.n), ...Object.values(n.ans || {})].join(' ').toLowerCase();
  const shown = ql ? items.filter(n => txt(n).includes(ql)) : items;
  if (!items.length) return '<div class="ll-empty">还没有笔记。在文章里选中文字可以高亮，文章末尾可以写笔记，思考题下面可以写答案。</div>';
  if (!shown.length) return '<div class="ll-empty">没有匹配的笔记。换一个关键词。</div>';
  return shown.map(n => {
    const ans = Object.entries(n.ans || {}).filter(([, v]) => String(v).trim());
    return `<div class="ll-item">${link(n.ch, titleOf(n.ch))}${n.text.trim() ? `<span class="x">${esc(n.text.trim())}</span>` : ''}${(n.hl || []).map(h => `<span class="x">“${esc(h.q)}”${h.n ? ` — ${esc(h.n)}` : ''}</span>`).join('')}${ans.length ? `<span class="ll-meta">思考题已作答 ${ans.length} 题</span>` : ''}</div>`;
  }).join('');
}
function notesHtml(q) {
  return `<input class="ll-search" id="ll-nb-q" type="search" placeholder="搜索笔记、高亮、思考题答案" autocomplete="off">
  <div class="ll-row"><button type="button" class="ll-btn" data-ll-export>导出 Markdown</button><button type="button" class="ll-btn" data-ll-copy>复制全部笔记</button></div>
  <div class="ll-list ll-nb-list">${notesList(q)}</div>`;
}
function exportMd() {
  const order = chList().map(c => c.id);
  const items = Object.values(N).filter(hasNote).sort((a, b) => order.indexOf(a.ch) - order.indexOf(b.ch));
  let md = `# ${C.name} · 学习笔记\n\n导出时间：${new Date().toLocaleString()}\n\n`;
  items.forEach(n => {
    const e = S.ch[n.ch] || {};
    md += `## ${titleOf(n.ch)}\n\n状态：${STATUS[e.s || 0]}${e.h ? ' · 难点' : ''}\n\n`;
    if (n.text.trim()) md += n.text.trim() + '\n\n';
    (n.hl || []).forEach(h => { md += `> ${h.q.replace(/\n+/g, ' ')}\n${h.n ? '\n批注：' + h.n + '\n' : ''}\n`; });
    const ans = Object.entries(n.ans || {}).filter(([, v]) => String(v).trim());
    if (ans.length) { md += `### 思考题答案\n\n`; ans.forEach(([k, v]) => { md += `${+k + 1}. ${String(v).trim().replace(/\n/g, '\n   ')}\n`; }); md += '\n'; }
  });
  return md;
}
async function doExport() {
  const md = exportMd();
  try {
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename: `${C.name}-学习笔记-${today()}.md`, data: md }); toast('已导出'); return; }
  } catch (e) { if (e && e.code === 'declined') return; }
  copyText(md);
}
function copyText(s) {
  const done = () => toast('已复制到剪贴板');
  try { navigator.clipboard.writeText(s).then(done, () => fallbackCopy(s)); } catch (e) { fallbackCopy(s); }
}
function fallbackCopy(s) {
  const d = $('.ll-drawer .ll-body'); if (!d) return;
  const ta = document.createElement('textarea'); ta.value = s; ta.style.minHeight = '240px'; d.prepend(ta); ta.select();
  toast('浏览器不允许直接复制。已选中全部笔记，请手动复制。');
}
let toastT;
function toast(msg) { let t = $('.ll-toast'); if (!t) { t = document.createElement('div'); t.className = 'll-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }

/* ---------- events ---------- */
function bind() {
  document.addEventListener('click', ev => {
    const t = ev.target;
    let b;
    if ((b = t.closest('[data-ll-mk]'))) { const q = selBox && selBox.dataset.q; hideSel(); if (q) addHighlight(q, b.dataset.llMk === '1', b.dataset.llMk === '2'); return; }
    if ((b = t.closest('[data-ll-s]')) && curId) { setStatus(curId, +b.dataset.llS); return; }
    if ((b = t.closest('[data-ll-hard]')) && curId) { setHard(curId, !E(curId).h); return; }
    if ((b = t.closest('[data-ll-master]')) && curId) { setStatus(curId, E(curId).s === 2 ? 3 : 2); if (E(curId).s === 2) toast('已掌握。明天它会出现在“复习”里。'); return; }
    if (t.closest('[data-ll-goto-notes]')) { const c = $('#ll-notes'); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'start' }); const ta = $('[data-ll-note]', c); setTimeout(() => ta && ta.focus({ preventScroll: true }), 300); } return; }
    if ((b = t.closest('[data-ll-drawer]'))) { openDrawer(b.dataset.llDrawer); return; }
    if ((b = t.closest('[data-ll-tab]'))) { tab = b.dataset.llTab; renderDrawer(); const f = $(`.ll-tab[data-ll-tab="${tab}"]`); if (f) f.focus(); return; }
    if (t.closest('[data-ll-close]')) { closeDrawer(); return; }
    if (t.closest('[data-ll-nav]')) { closeDrawer(); return; }
    if ((b = t.closest('[data-ll-rv]'))) { review(b.dataset.llRv, b.dataset.ok === '1'); return; }
    if (t.closest('[data-ll-export]')) { doExport(); return; }
    if (t.closest('[data-ll-copy]')) { copyText(exportMd()); return; }
    if ((b = t.closest('[data-ll-jump]'))) { const m = $(`mark.ll-hl[data-h="${b.dataset.llJump}"]`); if (m) { m.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => openPop(m, m.dataset.h), 350); } return; }
    if ((b = t.closest('[data-ll-delhl]'))) { const hid = b.dataset.llDelhl, n = N[curId]; if (n) { n.hl = n.hl.filter(h => h.id !== hid); n.up = Date.now(); touch(curId); } unwrap(rootEl() || document.body, hid); closePop(); refreshCur(); return; }
    if (t.closest('[data-ll-closepop]')) { closePop(); return; }
    if ((b = t.closest('[data-ll-ref]'))) { const r = b.nextElementSibling; r.hidden = !r.hidden; b.textContent = r.hidden ? '对照参考答案' : '收起参考答案'; return; }
    if ((b = t.closest('[data-ll-ck]')) && curId) {
      const id = curId, k = b.dataset.llCk, c = +b.dataset.c, n = note(id); n.ck = n.ck || {}; n.ck[k] = c; n.title = titleOf(id); n.up = Date.now(); touch(id);
      $$('[data-ll-ck="' + k + '"]', b.parentElement).forEach(x => x.setAttribute('aria-pressed', x === b));
      const d = b.closest('.ll-ans'); d.classList.remove('ck0', 'ck1', 'ck2'); d.classList.add('checked', 'ck' + c);
      if (c === 0) { const e = E(id); e.qw = 1; e.rv = { due: today(), step: 0 }; e.u = Date.now(); touch('state'); updOpenBtn(); toast('已加入今天的复习。'); }
      return;
    }
    if ((b = t.closest('mark.ll-hl'))) { openPop(b, b.dataset.h); return; }
    if (pop && !t.closest('.ll-pop')) closePop();
    const dsel = C.doneSel || (C.doneAttr ? `[${C.doneAttr}]` : null);
    if (dsel && (b = t.closest(dsel))) { const id = C.doneAttr ? b.getAttribute(C.doneAttr) : b.dataset.id; setTimeout(() => setStatus(id, C.isDone ? (C.isDone(id) ? 2 : 1) : (E(id).s === 2 ? 1 : 2)), 0); }
  });
  let noteT = {};
  document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.matches('[data-ll-note]') && curId) { const id = curId; clearTimeout(noteT.n); noteT.n = setTimeout(() => { const n = note(id); n.text = t.value; n.title = titleOf(id); n.up = Date.now(); touch(id); updOpenBtn(); const s = $('.ll-strip'); if (s) { s.innerHTML = stripHtml(id); chip(); } }, 700); }
    if (t.matches('[data-ll-ans]') && curId) { const id = curId, k = t.dataset.llAns; clearTimeout(noteT['a' + k]); noteT['a' + k] = setTimeout(() => { const n = note(id); n.ans[k] = t.value; n.title = titleOf(id); n.up = Date.now(); touch(id); t.closest('.ll-ans').classList.toggle('filled', !!t.value.trim()); }, 700); }
  });
  document.addEventListener('selectionchange', () => { clearTimeout(noteT.sel); noteT.sel = setTimeout(onSelect, 250); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (pop) closePop(); else if ($('.ll-drawer')) closeDrawer(); hideSel(); } });
  ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => { lastAct = Date.now(); }, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { flushTime(); flush(); } else lastTick = Date.now(); });
  window.addEventListener('pagehide', () => { flushTime(); });
  window.addEventListener('hashchange', () => { closePop(); hideSel(); setTimeout(sync, 60); });
  setInterval(tick, 15000);
  const w = $(C.watch || 'main');
  if (w) { let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(sync, 120); }).observe(w, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }); }
}

L.init = cfg => {
  C = cfg;
  loadLocal();
  remapIds();
  if (C.legacyDone) { // migrate the old “marked as done” list once per browser
    try {
      if (!localStorage.getItem(lsKey() + ':mig')) {
        C.legacyDone().forEach(id => { const e = E(id); if (!e.s || e.s < 2) { e.s = 2; e.u = Date.now(); e.m = e.m || today(); } });
        localStorage.setItem(lsKey() + ':mig', '1'); saveLocal();
      }
    } catch (e) {}
  }
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  mountOpenBtn();
  bind();
  sync();
  decorateNav();
  connect();
};
L.state = () => ({ S, N, mode });
L.autoRead = id => { if (id && E(id).s === 1) { setStatus(id, 3); toast('已读到结尾，状态改为“已读”。掌握后可点“已掌握”。'); } };
L.ctx = () => { let cur = null; try { cur = C.current(); } catch (e) {} return { root: rootEl(), cur, chapters: chList() }; };
L.onSync = f => syncHooks.push(f);
L.addHome = f => homeHooks.push(f);
window.LearnLayer = L;
})();
