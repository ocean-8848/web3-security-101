#!/usr/bin/env node
// 物件目录：把共用 kit 和各集 kit-ext 里的全部拟物物件列成一份目录和一张缩略图总览。
// 代理选物件时只读 kit/OBJECTS.md（每个物件一行）和 kit/objects-sheet*.png，不要读物件源码。
// 用法：node tools/catalog.mjs [--no-sheet]   新增物件后重跑一次。
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const HF = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const files = [path.join(HF, "kit/objects.mjs"),
  ...fs.readdirSync(HF).filter((d) => /^ep\d+$/.test(d)).sort().map((d) => path.join(HF, d, "kit-ext/objects-ext.mjs")).filter((p) => fs.existsSync(p))];
const { isoDefs } = await import(pathToFileURL(path.join(HF, "kit/iso.mjs")));

const rows = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8").split("\n");
  const mod = await import(pathToFileURL(file));
  const rel = path.relative(HF, file);
  const imp = rel.startsWith("kit/") ? `O`
    : `E${rel.match(/^ep(\d+)/)[1]}`;
  src.forEach((line, i) => {
    const m = line.match(/^export\s+(?:function\s+(\w+)\s*\(\s*o\b|const\s+(\w+)\s*=\s*\(\s*o\b)/);
    if (!m) return;
    const name = m[1] || m[2];
    if (typeof mod[name] !== "function") return;
    // 说明：紧挨在上面的注释（跳过分隔线）
    const doc = [];
    for (let j = i - 1; j >= 0 && /^\s*\/\//.test(src[j]); j--) {
      const t = src[j].replace(/^\s*\/\/\s?/, "").trim();
      if (/^[=\-─]{6,}$/.test(t) || !t) continue;
      doc.unshift(t);
    }
    // 常用 opts：函数体里出现的 opts.xxx
    let body = "";
    for (let j = i; j < src.length && (j === i || !/^export\s/.test(src[j])); j++) body += src[j] + "\n";
    const opts = [...new Set([...body.matchAll(/opts\.(\w+)/g)].map((x) => x[1]))].filter((k) => k !== "id").slice(0, 10);
    let anchors = [], svg = "";
    try { const r = mod[name]({ u: 0, v: 0 }, { id: `c${rows.length}` }); anchors = Object.keys(r.anchors || {}); svg = r.svg; } catch (e) { anchors = ["(默认参数调用失败：" + e.message.slice(0, 40) + ")"]; }
    rows.push({ file: rel, imp, name, doc: doc.join(" ").slice(0, 120), opts, anchors, svg });
  });
}

let md = `# 拟物物件目录（自动生成：node tools/catalog.mjs）\n\n选物件只看这份目录和缩略图 \`kit/objects-sheet*.png\`，不要读源码；确定要用哪几个后，再去源码里看那几个函数的参数。\n\n` +
  `调用方式都是 \`名称(origin, opts) → { svg, anchors }\`；\`opts.id\` 必填且同一画面唯一；通用 \`opts.state\` = normal | broken | attacker，\`opts.glow\` 加绿色地光。\n` +
  `导入：kit 用 \`import * as O from "../../../kit/objects.mjs"\`，第 NN 集的扩展用 \`import * as ENN from "../../../epNN/kit-ext/objects-ext.mjs"\`。\n\n共 ${rows.length} 个。缩略图编号与下表 # 列一致。\n`;
let cur = "";
rows.forEach((r, k) => {
  if (r.file !== cur) { cur = r.file; md += `\n## ${r.file}（${r.imp}）\n\n| # | 名称 | 说明 | 常用 opts | anchors |\n|---|---|---|---|---|\n`; }
  md += `| ${k + 1} | \`${r.imp}.${r.name}\` | ${r.doc.replace(/\|/g, "／") || "—"} | ${r.opts.join(" ") || "—"} | ${r.anchors.join(" ") || "—"} |\n`;
});
fs.writeFileSync(path.join(HF, "kit/OBJECTS.md"), md);
console.log(`kit/OBJECTS.md：${rows.length} 个物件`);

if (!process.argv.includes("--no-sheet")) {
  const req = (() => {
    for (const d of fs.readdirSync(path.join(os.homedir(), ".npm/_npx"))) {
      const r = path.join(os.homedir(), ".npm/_npx", d, "node_modules");
      if (fs.existsSync(path.join(r, "puppeteer-core/package.json"))) return createRequire(path.join(r, "x.js"));
    }
    throw new Error("找不到 puppeteer-core");
  })();
  const puppeteer = req("puppeteer-core");
  const base = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell");
  const ver = fs.readdirSync(base).sort().reverse()[0];
  const exe = path.join(base, ver, fs.readdirSync(path.join(base, ver))[0], "chrome-headless-shell");
  const PER = 48, COLS = 8, CW = 240, CH = 230;
  const font = pathToFileURL(path.join(HF, "template/assets/fonts/NotoSansSC.woff2"));
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const page = await browser.newPage();
  for (let p = 0; p * PER < rows.length; p++) {
    const part = rows.slice(p * PER, (p + 1) * PER);
    const H = Math.ceil(part.length / COLS) * CH;
    await page.setViewport({ width: COLS * CW, height: H });
    const cells = part.map((r, i) => `<div class="c"><svg id="s${i}" width="${CW - 10}" height="${CH - 40}">${isoDefs()}<g id="g${i}">${r.svg}</g></svg><div class="n">${p * PER + i + 1} ${r.imp}.${r.name}</div></div>`).join("");
    await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:"Noto Sans SC";src:url("${font}")}
      body{margin:0;background:#efebe3;font-family:"Noto Sans SC";display:grid;grid-template-columns:repeat(${COLS},${CW}px)}
      .c{width:${CW}px;height:${CH}px;box-sizing:border-box;border:1px solid #e2ddd3;text-align:center}.n{font-size:15px;font-weight:700;color:#1c1c1c;white-space:nowrap;overflow:hidden}
      .lab,.ctr,.pin{display:none}</style></head><body>${cells}</body></html>`, { waitUntil: "load" });
    await page.evaluate((n) => {
      for (let i = 0; i < n; i++) {
        const g = document.getElementById("g" + i); const s = document.getElementById("s" + i);
        try { const b = g.getBBox(); const pad = 12; if (b.width > 0) s.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`); } catch {}
      }
    }, part.length);
    const out = path.join(HF, `kit/objects-sheet${p ? p + 1 : ""}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(path.relative(HF, out));
  }
  await browser.close();
}
