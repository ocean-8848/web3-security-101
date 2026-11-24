// terms.mjs — ep29 术语卡（规格见 PIPELINE.md 第 0 节 / RETROFIT-deps.md 第 2 条，样式同 ep07）
// 用法：
//   import { termCards, termJs } from "../../kit/terms.mjs";
//   const TERMS = [{ id: "tc1", t1: "多签", t2: "多人各自签名 · 凑够人数才能执行", t0: 44.39, t1s: 47.9 }];
//   HTML（放在胶囊前）：${termCards(TERMS)}
//   时间线（tl 建好后、注册前）：${termJs(TERMS)}
// t0 / t1s 用段工程里的旧时间（timing.json = timing_old），revoice.py 会按句拉伸到新配音。
// 同一时间只显示一张；每张停留 3–4 秒。opts.left / opts.top 可覆盖默认位置 (48, 120)。
const CSS = `<style>
  .tcard { position: absolute; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
    padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; z-index: 40; }
  .tcard .t1 { font-size: 32px; font-weight: 900; line-height: 1.2; white-space: nowrap; }
  .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; line-height: 1.25; color: #3d3a35; white-space: nowrap; }
</style>`;

export const termCards = (terms) =>
  CSS + terms.map((c) => `<div class="tcard hide" id="${c.id}" style="left:${c.left ?? 48}px;top:${c.top ?? 120}px"><div class="t1">${c.t1}</div><div class="t2">${c.t2}</div></div>`).join("");

export const termJs = (terms, tl = "tl") =>
  terms.map((c) => `KIT.pop(${tl}, "#${c.id}", ${c.t0.toFixed(2)}, 0.3); ${tl}.to("#${c.id}", { opacity: 0, duration: 0.25, ease: "power2.in" }, ${c.t1s.toFixed(2)});`).join("\n      ");
