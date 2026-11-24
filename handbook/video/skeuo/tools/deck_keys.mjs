// Pick each slide's key frame (the moment with the most knowledge on screen) and save a still.
// Usage: node tools/deck_keys.mjs ep11 [ep12 ...]   (run make_deck.py first; rerun make_deck.py after)
// Writes epNN/deck-keys.json and <repo>/handbook/decks/skeuomorphic/chNN/img/NN.webp
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PUP = fs.readdirSync(path.join(os.homedir(), '.npm/_npx')).map(d => path.join(os.homedir(), '.npm/_npx', d, 'node_modules/puppeteer-core'))
  .find(p => fs.existsSync(p));
const puppeteer = require(PUP);
const CHROME = (() => {
  const base = path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell');
  const v = fs.readdirSync(base)[0];
  return path.join(base, v, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
})();
const HF = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DECK = path.join(os.homedir(), 'Workon/Learning/web3/web3-security-101/handbook/deck');
const STEP = 0.25;
const GSAP_JS = fs.readFileSync(path.join(path.dirname(PUP), 'hyperframes/dist/vendor/npm/gsap@3.15.0/dist/gsap.min.js'), 'utf8');

// In-page: how much readable knowledge is on screen, and where the camera is.
const PROBE = () => {
  const vis = el => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= +cs.opacity;
      if (o < 0.6) return 0;
    }
    return o;
  };
  let score = 0;
  const seen = new Set();
  for (const el of document.querySelectorAll('#root *')) {
    if (el.childElementCount || el.tagName === 'STYLE' || el.tagName === 'SCRIPT') continue;
    const t = (el.textContent || '').trim();
    if (!t) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.right < 0 || r.left > 1920 || r.bottom < 0 || r.top > 1080) continue;
    if (!vis(el)) continue;
    const key = t + '|' + Math.round(r.left / 40) + ',' + Math.round(r.top / 40);
    if (seen.has(key)) continue;
    seen.add(key);
    score += 4 + Math.min(t.length, 24);
  }
  const cam = document.getElementById('cam');
  return { score, cam: cam ? getComputedStyle(cam).transform : '' };
};

async function doEp(browser, ep) {
  const num = ep.replace(/\D/g, '');
  const dir = path.join(DECK, 'ch' + num);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const D = JSON.parse(html.match(/var D = (\{.*?\});\n/s)[1]);
  fs.mkdirSync(path.join(dir, 'img'), { recursive: true });
  const keys = [];
  const bySeg = {};
  D.slides.forEach((s, i) => (bySeg[s.seg] = bySeg[s.seg] || []).push(i));
  for (const [seg, idxs] of Object.entries(bySeg)) {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('pageerror', seg, e.message.slice(0, 160)));
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (u.includes('gsap@3.15.0/dist/gsap.min.js')) req.respond({ status: 200, contentType: 'text/javascript', body: GSAP_JS });
      else if (u.startsWith('file:')) req.continue();
      else req.respond({ status: 200, contentType: 'text/css', body: '' }); // web fonts: local JetBrains-less fallback is fine for scoring
    });
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 / 3 });
    await page.goto('file://' + path.join(dir, `s${seg}.html`), { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.evaluate(() => !!(window.__timelines && window.__timelines.story)))) throw new Error('no timeline in ' + ep + ' seg' + seg);
    for (const i of idxs) {
      const s = D.slides[i];
      const from = Math.min(s.t0 + 0.3, s.t1), samples = [];
      for (let t = from; t <= s.t1 + 1e-6; t += STEP) samples.push(+t.toFixed(2));
      if (samples[samples.length - 1] !== s.t1) samples.push(s.t1);
      const res = [];
      for (const t of samples) {
        const r = await page.evaluate((t, probe) => {
          const tl = window.__timelines.story; tl.pause(); tl.seek(t, false);
          return (0, eval)('(' + probe + ')')();
        }, t, PROBE.toString());
        res.push({ t, ...r });
      }
      // stable = camera has not moved for the last 0.5 s
      const stable = res.map((r, j) => j >= 2 && res[j - 1].cam === r.cam && res[j - 2].cam === r.cam);
      let pool = res.filter((r, j) => stable[j]);
      if (!pool.length) pool = res;
      const best = Math.max(...pool.map(r => r.score));
      const pick = pool.filter(r => r.score >= best * 0.95).pop(); // latest among the near-best
      await page.evaluate(t => { const tl = window.__timelines.story; tl.seek(t, false); }, pick.t);
      await page.screenshot({ path: path.join(dir, 'img', String(i + 1).padStart(2, '0') + '.webp'), type: 'webp', quality: 78 });
      keys.push({ i, k: pick.t, score: pick.score, endScore: res[res.length - 1].score });
    }
    await page.close();
  }
  keys.sort((a, b) => a.i - b.i);
  fs.writeFileSync(path.join(HF, ep, 'deck-keys.json'), JSON.stringify(keys.map(({ k, score, endScore }) => ({ k, score, endScore }))));
  const moved = keys.filter(x => Math.abs(x.k - D.slides[x.i].t1) > 0.3).length;
  console.log(`${ep}: ${keys.length} slides, keyframe moved earlier on ${moved}, avg score ${(keys.reduce((a, x) => a + x.score, 0) / keys.length).toFixed(0)} vs end ${(keys.reduce((a, x) => a + x.endScore, 0) / keys.length).toFixed(0)}`);
}

const eps = process.argv.slice(2);
const conc = 3;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files'] });
const queue = [...eps];
await Promise.all(Array.from({ length: conc }, async () => { while (queue.length) await doEp(browser, queue.shift()); }));
await browser.close();
