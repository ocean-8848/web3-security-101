#!/usr/bin/env node
// 版面检查：不用截图，用文字报告画面上的卡片、标签、胶囊、字幕之间的重叠、出框和截字。
// 用法：node tools/layout_lint.mjs <段目录> [--step 0.5] [--from 0] [--to 999] [--min 0.08] [--json]
//   每隔 step 秒把时间线拨到该时刻，量出所有"看得见的卡片"（有底色或描边、里面有字的元素）的位置。
//   字幕按 timing.json 的 captions 在画面底部的实际位置参与比较（渲染后叠字幕，DOM 里没有它）。
// 报告三类问题，同一对元素连续出现的时间段合并成一行：
//   重叠  两张卡片的交叠面积 ≥ 较小那张的 min（默认 8%）
//   出框  卡片超出 1920×1080 画面
//   截字  文字比容器宽（被截断或溢出）
// 有意叠放的元素（如调用栈层层叠起）加属性 data-layout-allow-overlap，本检查跳过它。
// 退出码：有问题为 1，没问题为 0。
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import os from "node:os";
import { createRequire } from "node:module";

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const seg = path.resolve(argv[0] || ".");
const STEP = +opt("--step", 0.5), FROM = +opt("--from", 0), TO = +opt("--to", 1e9), MIN = +opt("--min", 0.08);
const JSON_OUT = argv.includes("--json");

function findPuppeteer() {
  const roots = [path.join(path.dirname(new URL(import.meta.url).pathname), "node_modules"),
    ...(() => { try { return fs.readdirSync(path.join(os.homedir(), ".npm/_npx")).map((d) => path.join(os.homedir(), ".npm/_npx", d, "node_modules")); } catch { return []; } })()];
  for (const r of roots) if (fs.existsSync(path.join(r, "puppeteer-core/package.json"))) return createRequire(path.join(r, "x.js"))("puppeteer-core");
  throw new Error("找不到 puppeteer-core：在 hf/tools 下运行 npm i puppeteer-core@25");
}
function findChrome() {
  const base = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell");
  for (const v of fs.readdirSync(base).sort().reverse()) {
    for (const sub of fs.readdirSync(path.join(base, v))) {
      const p = path.join(base, v, sub, "chrome-headless-shell"); if (fs.existsSync(p)) return p;
    }
  }
  throw new Error("找不到 HyperFrames 的 Chrome：先运行一次 npx hyperframes render 或 npx hyperframes browser ensure");
}

const T = JSON.parse(fs.readFileSync(path.join(seg, "timing.json"), "utf8"));
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(seg, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(seg) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const puppeteer = findPuppeteer();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--no-sandbox", "--force-device-scale-factor=1"] });
let issues = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.on("pageerror", (e) => console.error("页面错误：", e.message));
  await page.evaluateOnNewDocument(() => { window.__timelines = {}; });
  await page.setRequestInterception(true);
  page.on("request", (r) => (["media"].includes(r.resourceType()) ? r.abort() : r.continue()));
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.gsap, { timeout: 30000 });
  // 自己挂载子合成（代替 HyperFrames 运行时），字幕层不挂（渲染后才叠）
  await page.evaluate(async () => {
    window.__timelines = window.__timelines || {};
    for (const host of document.querySelectorAll("[data-composition-src]")) {
      if (host.id === "captions") continue;
      const html = await (await fetch(host.getAttribute("data-composition-src"))).text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const tpl = doc.querySelector("template");
      const frag = (tpl ? tpl.content : doc.body).cloneNode(true);
      const scripts = [...frag.querySelectorAll("script")]; scripts.forEach((s) => s.remove());
      host.appendChild(frag);
      for (const s of scripts) {
        const n = document.createElement("script");
        if (s.src) { n.src = s.src; await new Promise((r) => { n.onload = n.onerror = r; document.head.appendChild(n); }); }
        else { n.textContent = s.textContent; host.appendChild(n); }
      }
    }
    await document.fonts.ready;
  });
  // 字幕卡宽度：在页面里用同样的字体样式量一次
  const capBoxes = await page.evaluate((caps) => {
    const s = document.createElement("span");
    s.style.cssText = "position:absolute;left:0;top:0;white-space:nowrap;font-family:'Noto Sans SC';font-weight:900;font-size:46px;line-height:1.25;letter-spacing:0.02em;padding:10px 28px;visibility:hidden";
    document.body.appendChild(s);
    const out = caps.map((c) => { s.textContent = c.text; const r = s.getBoundingClientRect(); const w = r.width, h = r.height; return { ...c, x: (1920 - w) / 2, y: 1080 - 84 - h, w, h }; });
    s.remove(); return out;
  }, T.captions || []);

  if (process.env.LINT_EL) console.error(await page.evaluate((txt, t) => { for (const tl of Object.values(window.__timelines)) tl.seek(t, false); const e = [...document.querySelectorAll(".lab")].find((x) => x.innerText.includes(txt)); const ch = []; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); ch.push((x.id || x.className) + ":" + c.opacity + "/" + c.visibility + "/" + c.transform.slice(0, 40) + "/" + (c.clipPath || "")); } return JSON.stringify([e.getBoundingClientRect(), ch]); }, process.env.LINT_EL, +process.env.LINT_T));
  if (process.env.LINT_DEBUG) console.error(await page.evaluate(() => JSON.stringify({ tl: Object.keys(window.__timelines), n: document.querySelectorAll("#story *").length, labs: document.querySelectorAll(".lab").length, lab0: (() => { const e = document.querySelector(".lab"); if (!e) return null; const cs = getComputedStyle(e); return [e.outerHTML.slice(0, 120), cs.backgroundColor, cs.borderTopWidth, cs.borderTopColor, cs.opacity, e.getBoundingClientRect().width, (() => { const ch = []; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); ch.push((x.id || x.className) + ":" + c.opacity + "/" + c.visibility + "/" + c.display); } return ch.join(" < "); })(), e.innerText]; })() })));
  const samples = [];
  for (let t = Math.max(0, FROM); t <= Math.min(T.total - 0.05, TO); t += STEP) samples.push(+t.toFixed(3));
  const seen = new Map();
  const note = (kind, key, t, desc) => {
    const k = kind + "|" + key; const e = seen.get(k);
    if (e && t - e.t1 <= STEP * 1.5 + 1e-6) { e.t1 = t; e.desc = desc; } else { const n = { kind, key, t0: t, t1: t, desc }; seen.set(k, n); issues.push(n); }
  };
  for (const t of samples) {
    const boxes = await page.evaluate((t) => {
      for (const tl of Object.values(window.__timelines)) { try { tl.seek(t, false); } catch {} }
      const effOp = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
      const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(",").map((x) => +x); return p.length > 3 ? p[3] : 1; };
      const isCard = (el) => {
        const cs = getComputedStyle(el);
        const bg = alpha(cs.backgroundColor) > 0.3 || (cs.backgroundImage && cs.backgroundImage !== "none");
        const bd = ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(cs["border" + s + "Width"]) >= 2 && alpha(cs["border" + s + "Color"]) > 0.3);
        return (bg || bd) && (el.innerText || "").trim().length > 0;
      };
      const out = [];
      const walk = (el) => {
        for (const c of el.children) {
          if (c.tagName === "SCRIPT" || c.tagName === "STYLE" || c.namespaceURI === "http://www.w3.org/2000/svg") continue;
          const rr = c.getBoundingClientRect();
          if (rr.width * rr.height < 0.4 * 1920 * 1080 && isCard(c)) {
            const r = rr; const op = effOp(c);
            const inScreen = r.x < 1920 && r.y < 1080 && r.x + r.width > 0 && r.y + r.height > 0;
            if (op > 0.15 && inScreen && r.width * r.height > 400 && r.width * r.height < 0.4 * 1920 * 1080) {
              const txt = (c.innerText || "").replace(/\s+/g, " ").trim().slice(0, 24);
              const clip = c.scrollWidth > c.clientWidth + 3 && getComputedStyle(c).overflowX !== "visible";
              const ok = !!c.closest("[data-layout-allow-overlap]");
              out.push({ ok, id: c.id || "", cls: (c.className && c.className.baseVal === undefined ? c.className : "").split(" ")[0], txt, x: r.x, y: r.y, w: r.width, h: r.height, clip });
            }
            continue; // 只取最外层卡片
          }
          walk(c);
        }
      };
      walk(document.body);
      return out;
    }, t);
    if (process.env.LINT_DEBUG && Math.abs(t - +process.env.LINT_DEBUG) < STEP / 2) console.error(t, JSON.stringify(boxes.map((b) => [b.cls, b.txt, Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)])));
    for (const c of capBoxes) if (c.start <= t && t < c.end) boxes.push({ id: "字幕", cls: "cap", txt: c.text, x: c.x, y: c.y, w: c.w, h: c.h });
    const OVERLAY = /^(k-title|k-veil|k-big|e-|end|title)/;
    const name = (b) => `[${b.cls || b.id || "卡"}「${b.txt}」]`;
    for (const b of boxes) {
      if (b.x < -4 || b.y < -4 || b.x + b.w > 1924 || b.y + b.h > 1084) note("出框", name(b) + `@${Math.round(b.x / 8)},${Math.round(b.y / 8)}`, t, `x=${Math.round(b.x)} y=${Math.round(b.y)} w=${Math.round(b.w)} h=${Math.round(b.h)}`);
      if (b.clip && !b.ok) note("截字", name(b), t, "文字比容器宽");
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (OVERLAY.test(a.cls) || OVERLAY.test(b.cls) || a.ok || b.ok) continue;
      const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ix <= 0 || iy <= 0) continue;
      const r = (ix * iy) / Math.min(a.w * a.h, b.w * b.h);
      if (r >= MIN && ix * iy > 300) note("重叠", name(a) + " × " + name(b), t, `${Math.round(r * 100)}%`);
    }
  }
} finally {
  await browser.close(); server.close();
}
// 镜头移动时标签滑出画面是正常的：位置不变且持续 ≥ 1 秒的出框才算问题
issues = issues.filter((e) => e.kind !== "出框" || e.t1 - e.t0 >= 1.0).map((e) => ({ ...e, key: e.key.replace(/@-?\d+,-?\d+$/, "") }));
const lineOf = (t) => { const i = T.lines.findIndex((l) => t >= l.start && t < l.start + l.dur + 0.4); return i < 0 ? "" : `第${i}句`; };
if (JSON_OUT) console.log(JSON.stringify(issues, null, 1));
else if (!issues.length) console.log(`${path.basename(seg)}: 版面检查通过（每 ${STEP}s 一次，共检查到 ${T.total.toFixed(1)}s）`);
else {
  console.log(`${path.basename(seg)}: ${issues.length} 处版面问题`);
  for (const e of issues) console.log(`  ${e.t0.toFixed(1)}–${e.t1.toFixed(1)}s ${lineOf(e.t0)} ${e.kind} ${e.key} ${e.desc}`);
}
process.exit(issues.length ? 1 : 0);
