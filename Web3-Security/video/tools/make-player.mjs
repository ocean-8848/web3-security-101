// Build video/index.html — the episode player for the whole handbook.
// Usage: node make-player.mjs   (no dependencies; re-run after adding slides, decks or rendered MP4s)
//
// One entry per handbook chapter (01–30), assessment chapter (A01–A11) and chain topic (C00–C03).
// Each entry offers up to six views, picked automatically from what exists on disk:
//   vs     → video/skeuo/epNN/out/epNN-full.mp4 (+ .srt, chapters.txt)   拟物化 video
//   v3     → video/3b1b/output/EPNN-*.mp4 (+ .srt)                        3b1b video
//   vt     → video/output/<slides-name>.mp4 (+ .srt)                      讲解页 video
//   talk   → video/slides/<EPnn|Ann|Cnn>-*.html  (narrated explainer; EPnn = chapter nn)
//   deck   → deck/chNN/index.html               (拟物化 knowledge deck)
//   d3b    → deck3b/chNN.html                   (3b1b-style knowledge deck)
// MP4s are not in git: they live in the main checkout. Run this where they exist (or symlink them in) so they are detected.
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const video = path.join(here, '..');
const book = path.join(video, '..');
const rd = p => fs.readFileSync(p, 'utf8');
const ls = p => (fs.existsSync(p) ? fs.readdirSync(p).sort() : []);

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };
const text = h => h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m))
  .replace(/\s+/g, ' ').trim();

// Chapter title from the first Markdown heading: "# 04 重入攻击：..." → "重入攻击：..."
const mdTitle = f => text(rd(f).split('\n').find(l => l.startsWith('# ')).slice(2)).replace(/^[A-Z]?\d+\s+/, '');

// Parts (第一篇 …) come from the Mermaid map in the handbook README.
const parts = [];
{
  let cur = null;
  for (const l of rd(path.join(book, 'README.md')).split('\n')) {
    const g = l.match(/subgraph \w+\["([^"]+)"\]/);
    if (g) { cur = { name: g[1], ids: [] }; parts.push(cur); continue; }
    const s = l.match(/^\s+S(\d\d)\["/);
    if (s && cur) cur.ids.push(s[1]);
    if (/^```\s*$/.test(l) && parts.length) cur = null;
  }
}

// Narrated explainer slides: scene titles + one narration line per step.
function talk(file) {
  const h = rd(file);
  const scenes = [...h.matchAll(/<section class="scene\b[^"]*"([^>]*)>([\s\S]*?)<\/section>/g)].map(([, attrs, body], i) => {
    const t = (attrs.match(/data-title="([^"]*)"/) || [])[1];
    const lines = [...body.matchAll(/<ol class="say">([\s\S]*?)<\/ol>/g)].flatMap(([, ol]) => [...ol.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(m => text(m[1])));
    return [t ? text(t) : '场景 ' + (i + 1), lines.length ? lines : ['']];
  });
  return { src: path.relative(video, file), scenes };
}

// Knowledge decks embed their data as `var D = {...};` — read slide titles and narration notes from it.
function deckData(file) {
  const h = rd(file), i = h.indexOf('var D = ');
  if (i < 0) return null;
  let depth = 0, str = false, j = i + 8;
  for (; j < h.length; j++) {
    const c = h[j];
    if (str) { if (c === '\\') j++; else if (c === '"') str = false; }
    else if (c === '"') str = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) break;
  }
  const D = JSON.parse(h.slice(i + 8, j + 1));
  return { src: path.relative(video, file), scenes: D.slides.map(s => [s.title, s.notes && s.notes.length ? s.notes : s.points || ['']]) };
}

// ffmetadata chapters.txt → [[start seconds, title]]
function chapters(file) {
  if (!fs.existsSync(file)) return [];
  return rd(file).split('[CHAPTER]').slice(1).map(b => {
    const tb = (b.match(/TIMEBASE=1\/(\d+)/) || [, 1000])[1], st = +(b.match(/START=(\d+)/) || [, 0])[1];
    return [+(st / tb).toFixed(2), (b.match(/title=(.*)/) || [, ''])[1].trim()];
  });
}
const vid = (mp4, chap) => fs.existsSync(mp4) ? { src: path.relative(video, mp4), cues: fs.existsSync(mp4.replace(/\.mp4$/, '.srt')) ? srt(mp4.replace(/\.mp4$/, '.srt')) : [], ch: chap ? chapters(chap) : [] } : null;
const find = (dir, re) => { const f = ls(dir).find(x => re.test(x)); return f ? path.join(dir, f) : null; };

// SRT → [[start, end, text]]
function srt(file) {
  const t = s => { const [h, m, r] = s.replace(',', '.').split(':'); return +h * 3600 + +m * 60 + +r; };
  return rd(file).split(/\r?\n\r?\n/).map(b => b.trim().split(/\r?\n/)).filter(b => b.length >= 3)
    .map(b => { const [a, z] = b[1].split(' --> '); return [+t(a).toFixed(2), +t(z).toFixed(2), b.slice(2).join(' ')]; });
}

const slidesDir = path.join(video, 'slides'), outDir = path.join(video, 'output');
const slideFor = {};
for (const f of ls(slidesDir)) { const m = f.match(/^(EP|A|C)(\d\d)-.*\.html$/); if (m) slideFor[(m[1] === 'EP' ? '' : m[1]) + m[2]] = f; }

function entry(id, md, deckFile, d3bFile) {
  const e = { id, title: mdTitle(md), md: path.relative(video, md), v: {} };
  if (/^\d\d$/.test(id)) {
    const sk = path.join(video, 'skeuo', 'ep' + id, 'out');
    e.v.vs = vid(path.join(sk, `ep${id}-full.mp4`), path.join(sk, 'chapters.txt'));
    const v3 = find(path.join(video, '3b1b', 'output'), new RegExp(`^EP${id}-.*\\.mp4$`));
    if (v3) e.v.v3 = vid(v3);
  }
  const sf = slideFor[id];
  if (sf) {
    e.v.vt = vid(path.join(outDir, sf.replace(/\.html$/, '.mp4')));
    e.v.talk = talk(path.join(slidesDir, sf));
  }
  if (deckFile && fs.existsSync(deckFile)) e.v.deck = deckData(deckFile);
  if (d3bFile && fs.existsSync(d3bFile)) e.v.d3b = deckData(d3bFile);
  for (const k in e.v) if (!e.v[k]) delete e.v[k];
  return e;
}

const groups = [];
const main = ls(book).filter(f => /^\d\d-.*\.md$/.test(f)).map(f => {
  const n = f.slice(0, 2);
  return entry(n, path.join(book, f), path.join(book, 'deck', 'ch' + n, 'index.html'), path.join(book, 'deck3b', 'ch' + n + '.html'));
});
for (const p of parts) groups.push({ name: p.name, items: main.filter(e => p.ids.includes(e.id)) });
const rest = main.filter(e => !parts.some(p => p.ids.includes(e.id)));
if (rest.length) groups.push({ name: '专题 · 签名路径与许可链', items: rest });
groups.push({ name: '评估篇 · 交易所 / DeFi / 上币尽调', items: ls(path.join(book, 'assessment')).filter(f => /^A\d\d-.*\.md$/.test(f)).map(f => entry(f.slice(0, 3), path.join(book, 'assessment', f))) });
groups.push({ name: '链专题 · ETH / BNB / TRON / Mantle', items: ls(path.join(book, 'chains')).filter(f => /^C\d\d-.*\.md$/.test(f)).map(f => entry(f.slice(0, 3), path.join(book, 'chains', f))) });

const all = groups.flatMap(g => g.items);
const json = JSON.stringify(groups).replace(/</g, '\\u003c');
const html = rd(path.join(here, 'player.tpl.html')).replace('/*DATA*/[]', json);
fs.writeFileSync(path.join(video, 'index.html'), html);
const n = k => all.filter(e => e.v[k]).length;
console.log(`index.html: ${all.length} 章 · 视频 拟物化 ${n('vs')} / 3b1b ${n('v3')} / 讲解页 ${n('vt')} · 幻灯 讲解页 ${n('talk')} / 拟物化 ${n('deck')} / 3b1b ${n('d3b')} · 无内容 ${all.filter(e => !Object.keys(e.v).length).length}`);
