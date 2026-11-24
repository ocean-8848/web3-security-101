// props.mjs — ep07/seg2 small helpers in the kit projection (kit / kit-ext untouched).
import { at, f, cyl, M, contactShadow } from "../../../kit/iso.mjs";

/** wrap an object's svg so it is drawn at scale k around its ground origin o */
export const scl = (svg, o, k) => {
  const [x, y] = at(o);
  return `<g transform="matrix(${k},0,0,${k},${f(x * (1 - k))},${f(y * (1 - k))})">${svg}</g>`;
};
/** scale a world-canvas point around ground origin o */
export const sp = (o, p, k) => { const [x, y] = at(o); return [x + k * (p[0] - x), y + k * (p[1] - y)]; };

/** grow-able wrapper group with ground origin */
export const grp = (id, o, svg, extra = "") => `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}" ${extra}>${svg}</g>`;

/** a pile of flat tokens (teal qXETH vouchers or gold): n coins in a few short stacks; each coin #ID-c-i */
export function coinPile(id, o, n, { color = "teal", r = 15, h = 6 } = {}) {
  const m = color === "teal" ? { f: "#3aa9cf", s: "#1f7f9f", t: "#8fd3ea", st: "#155e77" } : { f: "#f0c04a", s: "#d39b22", t: "#f8dc8a", st: "#8a6414" };
  const spots = [[0, 0], [36, 6], [-30, 18], [8, 36], [44, 40], [-24, -26], [30, -28]];
  let s = contactShadow(o, 70, 50), k = 0;
  const per = Math.ceil(n / spots.length);
  const coins = [];
  for (let j = 0; j < spots.length && k < n; j++) for (let l = 0; l < per && k < n; l++, k++) coins.push({ j, l, k });
  // draw back stacks first (smaller screen y), bottom coin first
  coins.sort((a, b) => (at(o, ...spots[a.j])[1] - at(o, ...spots[b.j])[1]) || a.l - b.l);
  for (const c of coins) {
    const [du, dv] = spots[c.j];
    s += `<g id="${id}-c-${c.k}">${cyl(o, du, dv, r, c.l * h, c.l * h + h - 1, m, { seg: 18, sw: 1.1 })}</g>`;
  }
  return `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`;
}

