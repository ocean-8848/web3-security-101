// termcards.mjs — 第 03 集术语卡（规格见 ../../RETROFIT-deps.md 第 2 节，样式同 ep07 seg1–seg5b）
// 用法：
//   import { termCss, termHtml, termJs } from "../../kit-ext/termcards.mjs";
//   const TERMS = [{ id: "tm1", term: "EVM", def: "以太坊虚拟机 · 执行合约字节码", at: 12.3 }, ...];
//   可选 top：与本段左上角面板冲突时，把卡片下移/上移到空处（left 不变）
//   CSS 里放 ${termCss}；舞台里（胶囊之前）放 ${termHtml(TERMS)}；时间线注册前放 ${termJs(TERMS)}
// 每张卡停留 3.6 秒；若下一张在这之前出现，提前 0.35 秒收起，保证同一时间只有一张。
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const code = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

export const termCss = `
    .termc { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; z-index: 40; }
    .termc .t1 { font-size: 32px; font-weight: 900; line-height: 1.25; white-space: nowrap; }
    .termc .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; line-height: 1.3; color: #3d3a35; white-space: nowrap; }
    .termc code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
`;

export const termHtml = (list) => list.map((t) =>
  `<div class="termc hide" id="${t.id}"${t.top != null ? ` style="top:${t.top}px"` : ""}><div class="t1">${code(t.term)}</div><div class="t2">${code(t.def)}</div></div>`).join("\n      ");

export function termWindows(list, hold = 3.6) {
  const s = [...list].sort((a, b) => a.at - b.at);
  return s.map((t, i) => {
    let t1 = t.at + (t.hold ?? hold);
    if (i + 1 < s.length) t1 = Math.min(t1, s[i + 1].at - 0.35);
    if (t.until != null) t1 = Math.min(t1, t.until);
    return { id: t.id, t0: +t.at.toFixed(3), t1: +t1.toFixed(3) };
  });
}

export const termJs = (list) => termWindows(list).map(({ id, t0, t1 }) =>
  `      tl.fromTo("#${id}", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, ${t0});
      tl.to("#${id}", { opacity: 0, duration: 0.25, ease: "power2.in" }, ${t1});`).join("\n");
