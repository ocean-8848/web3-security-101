// props.mjs — seg2 small props in the kit projection (kit / kit-ext untouched).
import { at, f, box, cyl, faceTop, faceV, M, CE, contactShadow } from "../../../kit/iso.mjs";

const WOOD = { f: "#c9a77a", s: "#a8865b", t: "#dcc29c", st: "#6e5434" };
const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
export { lift };

/** ledger pedestal (seg1 numbers): steel body u ±80, v ±100, wooden top at z = top */
export function desk(id, o, top = 100) {
  const [ox, oy] = at(o);
  let s = contactShadow(o, 150, 110);
  s += box(o, -72, 72, -92, 92, 0, top - 10, M.white, 1.6);
  s += `<g transform="${faceV(o, -72, 92, top - 22)}"><rect x="10" y="8" width="124" height="8" fill="#2aa3c9"/><rect x="18" y="26" width="108" height="${top - 58}" rx="4" fill="none" stroke="#d6d0c4" stroke-width="2.4"/></g>`;
  s += box(o, -80, 80, -100, 100, top - 10, top, WOOD, 1.6);
  return { svg: `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>` };
}

/** one isometric coin at (o, z); red = attacker colour. Wrapped in #id for KITX.fly + opacity */
export function coin(id, o, z = 0, opts = {}) {
  const g = opts.red ? { f: "#e0453a", s: "#b8322a", t: "#f0786e", st: "#7a1d17" } : opts.teal ? { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" } : { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  const r = opts.r ?? 22;
  const s = cyl(o, 0, 0, r, z, z + 8, g, { seg: 24, sw: 1.4 }) + `<g transform="${faceTop(o, 0, 0, z + 8)}"><circle cx="0" cy="0" r="${r * 0.6}" fill="none" stroke="${g.st}" stroke-width="2"/></g>`;
  return `<g id="${id}" opacity="${opts.shown ? 1 : 0}">${s}</g>`;
}

/** NFT card: a small standing picture card on a little foot (id for fly) */
export function nftCard(id, o, z = 0) {
  const W = 70, H = 88;
  let s = `<g transform="${faceTop(o, 0, 0, z)}"><ellipse cx="0" cy="0" rx="40" ry="12" fill="url(#shadowG)"/></g>`;
  s += `<g transform="${faceV(o, -W / 2, 0, z + H + 8)}"><rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#ffffff" stroke="#1f7896" stroke-width="3"/>
    <rect x="7" y="7" width="${W - 14}" height="${H - 30}" rx="3" fill="#9ad9ee"/><circle cx="${W - 22}" cy="20" r="7" fill="#ffffff"/>
    <path d="M7 ${H - 23}L26 36L40 52L48 44L${W - 7} ${H - 23}Z" fill="#1d93ba"/>
    <rect x="10" y="${H - 17}" width="30" height="7" rx="3" fill="#1c1c1c"/><rect x="44" y="${H - 17}" width="16" height="7" rx="3" fill="#2aa3c9"/></g>`;
  return `<g id="${id}" opacity="0">${s}</g>`;
}

/** a round signal lamp on a short post (two "both windows serving" lamps); #id-on glows teal */
export function lamp(id, o, z) {
  const [ox, oy] = at(o);
  let s = box(o, -4, 4, -4, 4, z, z + 30, M.dark, 1);
  const [x, y] = at(o, 0, 0, z + 48);
  s += `<circle cx="${f(x)}" cy="${f(y)}" r="20" fill="#d9dde1" stroke="#4b4f56" stroke-width="2.4"/>`;
  s += `<g id="${id}-on" opacity="0"><circle cx="${f(x)}" cy="${f(y)}" r="40" fill="#2aa3c9" opacity="0.22"/><circle cx="${f(x)}" cy="${f(y)}" r="20" fill="#2aa3c9" stroke="#1f7896" stroke-width="2.4"/><circle cx="${f(x - 6)}" cy="${f(y - 6)}" r="6" fill="#ffffff" opacity="0.8"/></g>`;
  return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`;
}
