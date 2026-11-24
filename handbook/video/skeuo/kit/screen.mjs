// screen.mjs — 屏幕层（不随相机移动）的共用组件与版面分区。新段一律用它，不要再自己写术语卡、结束卡。
//
// 版面分区（1920×1080，单位 px）。各类卡片只放进自己的区，互不抢位：
//   ZONE.pills   右上胶囊        x 1240–1880, y 24–84
//   ZONE.term    术语卡（首选）  左上 left 48, top 120，宽 ≤ 560
//   ZONE.termLow 术语卡（备选）  左下 left 48, top 770（左上被事件卡或面板占用时用，仍在字幕上方）
//   ZONE.event   事件卡 / 来源卡  右上 right 48, top 120，宽 ≤ 760
//   ZONE.caption 字幕            底部居中，卡片底边距画面底 84，高约 78（渲染后叠加，DOM 里没有）
//   ZONE.safe    其余标签与代码卡尽量留在 x 60–1860、y 100–900 之内
// 布局后用 `node tools/layout_lint.mjs <段目录>` 检查重叠、出框、截字，不要靠截图逐张看。
//
// 用法（build-story.mjs 里）：
//   import { ZONE, screenCss, termCards, endCard } from "../../../kit/screen.mjs";
//   const TC = termCards([{ id: "dc", t: "delegatecall", d: "在自己的存储上执行别人的代码", at: w("delegatecall", 3) }]);
//   const EC = endCard({ title: SCRIPT.title, line: "把顺序写对 · 第二层读到的就是 0", next: "访问控制与权限：谁有权按这个按钮",
//                        at: T.lines.at(-1).start, total: TOTAL, nextAt: w("下一集", 9) });
//   CSS：${screenCss()}   HTML：${TC.html}${EC.html}   时间线里（已有 tl 和 KIT）：${TC.js}${EC.js}
//   TC.report 是一行文字：每张卡的出现时刻、停留秒数、是否被推迟，写进段的 REVIEW.md。

export const ZONE = {
  pills: { x: 1240, y: 24, w: 640, h: 60 },
  term: { left: 48, top: 120, maxW: 560 },
  termLow: { left: 48, top: 770, maxW: 560 },
  event: { right: 48, top: 120, maxW: 760 },
  caption: { bottom: 84, h: 78 },
  safe: { x0: 60, y0: 100, x1: 1860, y1: 900 },
};

export const screenCss = () => `
    .term { position: absolute; left: ${ZONE.term.left}px; top: ${ZONE.term.top}px; max-width: ${ZONE.term.maxW}px; background: #ffffff; border-left: 6px solid #2aa3c9;
      border-radius: 12px; padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); opacity: 0; z-index: 40;
      font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .term.low { top: ${ZONE.termLow.top}px; }
    .term .tm-t { font-size: 32px; font-weight: 900; line-height: 1.3; white-space: nowrap; }
    .term .tm-d { margin-top: 4px; font-size: 29px; font-weight: 700; line-height: 1.35; color: #3a3832; white-space: nowrap; }
    .term code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    #endcard { position: absolute; left: 160px; top: 200px; width: 1600px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 50px 40px 54px; opacity: 0; z-index: 60; font-family: "Noto Sans SC", sans-serif; }
    #endcard .e-main { font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 32px auto 28px; }
    #endcard .e-note { margin-bottom: 18px; font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    #endcard .e-next { font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endveil { position: absolute; inset: 0; background: #efebe3; opacity: 0; z-index: 59; }`;

const r2 = (x) => Math.round(x * 100) / 100;

/**
 * 术语卡：说到这个词时出现，停留 hold 秒（默认 3.6），同一时间只有一张。
 * list 每项 { id, t: 术语, d: 一句话定义（≤ 24 字）, at: 出现时刻, low?: true 放左下, hold?: 秒 }
 * 两张挨得太近时，后一张推迟到前一张收起后 0.15 秒；前一张至少停 MIN 秒。推迟和偏短都写进 report。
 */
export function termCards(list, { hold = 3.6, min = 3.0 } = {}) {
  const T = [...list].sort((a, b) => a.at - b.at).map((x) => ({ ...x }));
  const notes = [];
  T.forEach((x, i) => {
    if ([...x.d].length > 24) throw new Error(`术语卡 ${x.id}：定义超过 24 字`);
    const prev = T[i - 1];
    x.at0 = x.at;
    if (prev && x.at < prev.at + min + 0.15) x.at = prev.at + min + 0.15;   // 前一张至少停 min 秒
    if (x.at - x.at0 > 0.05) notes.push(`${x.t} 推迟 ${r2(x.at - x.at0)}s`);
  });
  T.forEach((x, i) => {
    const nx = T[i + 1];
    x.end = Math.min(x.at + (x.hold ?? hold), nx ? nx.at - 0.15 : 1e9);
    if (x.end - x.at < min - 0.01) notes.push(`${x.t} 只停 ${r2(x.end - x.at)}s`);
  });
  const html = T.map((x) => `<div class="term${x.low ? " low" : ""}" id="tm-${x.id}"><div class="tm-t">${x.t}</div><div class="tm-d">${x.d}</div></div>`).join("");
  const js = `
      ${JSON.stringify(T.map((x) => ["#tm-" + x.id, r2(x.at), r2(x.end)]))}.forEach(function (x) {
        KIT.pop(tl, x[0], x[1], 0.3);
        tl.to(x[0], { opacity: 0, duration: 0.2, ease: "power2.in" }, x[2] - 0.2);
      });`;
  const report = `术语卡 ${T.length} 张：` + T.map((x) => `${x.t}@${r2(x.at)}s×${r2(x.end - x.at)}s${x.low ? "(左下)" : ""}`).join("，") + (notes.length ? `；注意：${notes.join("，")}` : "");
  return { html, js, list: T, report };
}

/**
 * 结束卡：本集标题 + 一句收束 + "下一集 · 主题"。最后 hold 秒保持静止。
 * { title, line, next, at: 卡片出现时刻, total: 段总长, nextAt?: 说到"下一集"的时刻, hold?: 2.5 }
 * next 为空时（系列最后一集）不显示下一集那一行。
 */
export function endCard({ title, line, next, at, total, nextAt, hold = 2.5 }) {
  if (/第\s*\d+\s*[章节集]|手册/.test(title + line + (next || ""))) throw new Error("结束卡不写章节编号，也不提手册");
  const last = total - hold - 0.35;
  const html = `<div id="endveil"></div><div id="endcard"><div class="e-main">${title}</div><div class="e-rule"></div>` +
    `<div class="e-note" id="e-note">${line}</div>${next ? `<div class="e-next" id="e-next">下一集 · ${next}</div>` : ""}</div>`;
  const js = `
      tl.to("#endveil", { opacity: 0.85, duration: 0.5, ease: "power1.out" }, ${r2(at)});
      tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, ${r2(at + 0.1)});
      tl.set("#e-note${next ? ", #e-next" : ""}", { opacity: 0 }, 0);
      tl.to("#e-note", { opacity: 1, duration: 0.3 }, ${r2(Math.min(at + 0.45, last))});
      ${next ? `tl.to("#e-next", { opacity: 1, duration: 0.3 }, ${r2(Math.min((nextAt ?? at + 1.2) + 0.9, last))});` : ""}`;
  return { html, js };
}
