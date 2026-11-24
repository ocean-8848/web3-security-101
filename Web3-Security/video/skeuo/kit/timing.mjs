// timing.mjs — 按讲稿词语查配音时间（所有段共用）
// timing.json 的 words 现在是"逐字/逐英文词"的（百炼配音按停顿 + 字数估算），不再是整词。
// 用 wordAt 按词语查：把一句里的字连起来匹配，返回这个词的开始和结束秒数。
//
//   import { loadTiming, wordAt, lineAt } from "../../kit/timing.mjs";
//   const T = loadTiming(new URL("../timing.json", import.meta.url));
//   wordAt(T, "实现合约")            // 第一次出现 → { start, end, line }
//   wordAt(T, "调用", { nth: 1 })     // 第二次出现
//   wordAt(T, "签名", { line: 5 })    // 只在第 5 句（从 0 起）里找
//   wordAt(T, "签名", { after: 30 })  // 30 秒之后第一次出现
//   lineAt(T, 5)                     // 第 5 句 { start, end, speechStart, speechEnd, text }
// 找不到会抛错，避免画面悄悄错位。
import fs from "node:fs";

export const loadTiming = (url) => JSON.parse(fs.readFileSync(url, "utf8"));

const norm = (s) => s.replace(/[\s，。：、！？；,.!?;:()\-]/g, "");

export function wordAt(T, term, { nth = 0, line = null, after = 0 } = {}) {
  const want = norm(term);
  const lines = [...new Set(T.words.map((w) => w.line))];
  let seen = 0;
  for (const li of lines) {
    if (line !== null && li !== line) continue;
    const ws = T.words.filter((w) => w.line === li);
    // 逐字拼接，记录每个字在拼接串里的起点
    let joined = ""; const at = [];
    for (const w of ws) { at.push(joined.length); joined += norm(w.text); }
    let from = 0, k;
    while ((k = joined.indexOf(want, from)) >= 0) {
      const i0 = at.findLastIndex((p) => p <= k);
      const i1 = at.findLastIndex((p) => p <= k + want.length - 1);
      const hit = { start: ws[i0].start, end: ws[i1].end, line: li };
      if (hit.start >= after) { if (seen === nth) return hit; seen++; }
      from = k + 1;
    }
  }
  throw new Error(`timing: 找不到「${term}」(nth=${nth}, line=${line}, after=${after})`);
}

export function lineAt(T, i) {
  const L = T.lines[i];
  return { start: L.start, end: L.start + L.dur, speechStart: L.speechStart, speechEnd: L.speechEnd, text: L.text };
}
