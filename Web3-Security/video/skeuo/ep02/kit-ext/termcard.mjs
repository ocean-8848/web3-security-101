// termcard.mjs — ep02 术语卡（规格见 hf/RETROFIT-deps.md 第 2 类，样式同 ep07 seg1）
// 用法（在 build-story.mjs 里）：
//   import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";
//   const TERMS = [{ id: "tc1", t1: "术语", t2: "一句话定义", at: 秒, dur: 3.6, top: 120 }];
//   CSS 里放 ${termCss}；画面层放 ${termHtml(TERMS)}；时间线里放 ${termJs(TERMS)}（需要已有 tl、KIT）。
// 位置默认左上 (48, 120)；个别段左上已有卡片时用 top 下移。同一时间只显示一张。
const r2 = (x) => Math.round(x * 100) / 100;

export const termCss = `
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; z-index: 5; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; line-height: 1.3; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; line-height: 1.3; }
    .tcard code { font-family: "JetBrains Mono", monospace; font-weight: 800; }`;

export const termHtml = (cards) =>
  cards.map((c) => `<div class="tcard hide" id="${c.id}"${c.top != null ? ` style="top:${c.top}px"` : ""}><div class="t1">${c.t1}</div><div class="t2">${c.t2}</div></div>`).join("\n      ");

export function termJs(cards) {
  const s = [...cards].sort((a, b) => a.at - b.at);
  for (let i = 1; i < s.length; i++) {
    const prevEnd = s[i - 1].at + (s[i - 1].dur ?? 3.6) + 0.25;
    if (s[i].at < prevEnd) throw new Error(`termcard: ${s[i].id} overlaps ${s[i - 1].id}`);
  }
  return s.map((c) => `KIT.pop(tl, "#${c.id}", ${r2(c.at)}, 0.3); tl.to("#${c.id}", { opacity: 0, duration: 0.25, ease: "power2.in" }, ${r2(c.at + (c.dur ?? 3.6))});`).join("\n      ");
}
