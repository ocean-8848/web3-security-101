// terms.mjs — ep05 term cards (RETROFIT-deps rule 2; same spec as ep07).
// Top-left white card, teal 6px left border, radius 12, max 560px wide.
// Line 1: term, 900 / 32px. Line 2: one-sentence definition, 700 / 29px, <= 24 chars.
// Shows when the word is spoken, stays ~3.6 s, never two at once.
//
//   import { termCss, termCards } from "../../kit-ext/terms.mjs";
//   const TC = termCards([{ id: "dc", t: "delegatecall", d: "…", at: w("delegatecall", 1), top: 280 }]);
//   css: ${termCss()}   html: ${TC.html}   inside the timeline IIFE (tl + KIT in scope): ${TC.js}
export const termCss = () => `
    .term { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px; padding: 14px 26px 18px 22px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.14); opacity: 0; z-index: 40; }
    .term .tm-t { font-size: 32px; font-weight: 900; line-height: 1.3; white-space: nowrap; color: #1c1c1c; }
    .term .tm-d { margin-top: 4px; font-size: 29px; font-weight: 700; line-height: 1.35; color: #3a3832; white-space: nowrap; }`;

export function termCards(list, { hold = 3.6 } = {}) {
  const T = [...list].sort((a, b) => a.at - b.at);
  T.forEach((x, i) => {
    const nx = T[i + 1];
    x.end = x.end ?? Math.min(x.at + hold, nx ? nx.at - 0.15 : 1e9);
    if ([...x.d].length > 24) throw new Error(`term ${x.id}: definition longer than 24 chars`);
  });
  const style = (x) => [x.top != null ? `top:${x.top}px` : "", x.left != null ? `left:${x.left}px` : ""].filter(Boolean).join(";");
  const html = T.map((x) => `<div class="term" id="tm-${x.id}" style="${style(x)}"><div class="tm-t">${x.t}</div><div class="tm-d">${x.d}</div></div>`).join("");
  const js = `${JSON.stringify(T.map((x) => ["#tm-" + x.id, +x.at.toFixed(3), +x.end.toFixed(3)]))}.forEach(function (x) {
        KIT.pop(tl, x[0], x[1], 0.3);
        tl.to(x[0], { opacity: 0, duration: 0.2, ease: "power2.in" }, x[2] - 0.2);
      });`;
  return { html, js, list: T };
}
