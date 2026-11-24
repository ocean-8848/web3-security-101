// props.mjs — seg2 small props in the kit projection (kit / kit-ext untouched).
import { at, f, box, cyl, frustum, faceTop, faceV, faceU, M, CE, contactShadow, darken } from "../../../kit/iso.mjs";

export const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
const G_ = (m, inner) => `<g transform="${m}">${inner}</g>`;

/** one isometric coin at (o, z); wrapped in #id (opacity 0 until shown) */
export function coin(id, o, z = 0, opts = {}) {
  const g = opts.red ? { f: "#e0453a", s: "#b8322a", t: "#f0786e", st: "#7a1d17" } : { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  const r = opts.r ?? 20;
  const s = cyl(o, 0, 0, r, z, z + 7, g, { seg: 24, sw: 1.4 }) + G_(faceTop(o, 0, 0, z + 7), `<circle cx="0" cy="0" r="${r * 0.6}" fill="none" stroke="${g.st}" stroke-width="2"/>`);
  return `<g id="${id}" opacity="${opts.shown ? 1 : 0}">${s}</g>`;
}

/**
 * office(o, {id}) — the metaphor building: a three-storey office block, 520(u) × 280(v) × 430(z).
 * Front (+v): a wide glass lobby door (left, held open) and a steel machine-room door (right) with a card reader.
 * Movable: ID-dc (closed steel door) / ID-do (open doorway) — KIT.swap; ID-rdA (old reader) / ID-rdB (new reader);
 *          ID-led (old reader LED) / ID-ledB (new reader LED) — KIT.led.
 * anchors: top, lobby (doorway centre on the ground), room (machine-room door centre), reader, readerB
 */
export function office(o, opts = {}) {
  const p = opts.id ?? "of";
  const wall = { f: "#f3efe6", s: "#ddd6c8", t: "#faf8f3", st: "#8f887c" };
  const u0 = -260, u1 = 260, v0 = -140, v1 = 140, H = 430, W = u1 - u0, D = v1 - v0;
  const [ox, oy] = at(o);
  let s = contactShadow(o, 330, 220);
  s += box(o, u0 - 10, u1 + 10, v0 - 10, v1 + 10, 0, 8, M.plinth ?? M.white, 1.4);
  s += box(o, u0, u1, v0, v1, 8, H, wall, 2);
  s += box(o, u0 - 6, u1 + 6, v0 - 6, v1 + 6, H, H + 14, { f: "#5d636b", s: "#474c53", t: "#767c84", st: "#25282c" }, 1.6);
  // storey bands
  let fr = "";
  for (const z of [170, 300]) fr += `<rect x="0" y="${H - z - 4}" width="${W}" height="8" fill="#d6cfc1"/>`;
  // upper-floor windows (front)
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#9ad9ee" stroke="#4b5560" stroke-width="2"/><path d="M${x + w / 2} ${y}V${y + h}" stroke="#4b5560" stroke-width="1.6"/><path d="M${x + 5} ${y + h - 8}L${x + 18} ${y + 6}" stroke="#ffffff" stroke-width="3" opacity="0.6"/>`;
  for (const y of [H - 430 + 30, H - 300 + 26]) for (let i = 0; i < 6; i++) fr += win(24 + i * 82, y, 58, 70);
  // ground floor: lobby (left) — open double glass doors on a dark interior
  const gy = H - 170; // local y of the ground storey top
  fr += `<rect x="40" y="${gy + 16}" width="200" height="154" fill="#2f3439"/>`;
  fr += `<rect x="40" y="${gy + 16}" width="200" height="154" fill="none" stroke="#5d636b" stroke-width="5"/>`;
  fr += `<path d="M46 ${gy + 22}L86 ${gy + 30}V${gy + 166}L46 ${gy + 170}Z" fill="rgba(170,215,232,0.55)" stroke="#4b5560" stroke-width="2"/>`;
  fr += `<path d="M234 ${gy + 22}L194 ${gy + 30}V${gy + 166}L234 ${gy + 170}Z" fill="rgba(170,215,232,0.55)" stroke="#4b5560" stroke-width="2"/>`;
  fr += `<rect x="60" y="${gy - 4}" width="160" height="16" rx="3" fill="#1d93ba"/><text x="140" y="${gy + 8}" font-family="JetBrains Mono, monospace" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">LOBBY</text>`;
  // machine-room door frame (right)
  fr += `<rect x="326" y="${gy + 30}" width="96" height="140" fill="none" stroke="#5d636b" stroke-width="5"/>`;
  fr += `<rect x="330" y="${gy + 10}" width="88" height="16" rx="3" fill="#1c1c1c"/><text x="374" y="${gy + 22}" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">SERVER</text>`;
  s += G_(faceV(o, u0, v1, H), fr);
  // closed steel door / open doorway
  s += `<g id="${p}-dc">` + G_(faceV(o, u0, v1, H), `<rect x="330" y="${gy + 34}" width="88" height="136" fill="#8c939b" stroke="#33383e" stroke-width="2"/>
    <rect x="340" y="${gy + 46}" width="68" height="50" rx="3" fill="none" stroke="#6d747c" stroke-width="2"/><rect x="340" y="${gy + 104}" width="68" height="54" rx="3" fill="none" stroke="#6d747c" stroke-width="2"/>
    <rect x="404" y="${gy + 98}" width="8" height="18" rx="3" fill="#d4d7db" stroke="#33383e" stroke-width="1.2"/>`) + `</g>`;
  s += `<g id="${p}-do" opacity="0">` + G_(faceV(o, u0, v1, H), `<rect x="330" y="${gy + 34}" width="88" height="136" fill="#1f2327"/>
    <rect x="336" y="${gy + 120}" width="22" height="44" fill="#2aa3c9" opacity="0.55"/><rect x="364" y="${gy + 112}" width="22" height="52" fill="#2aa3c9" opacity="0.4"/>
    <path d="M418 ${gy + 34}L452 ${gy + 24}V${gy + 178}L418 ${gy + 170}Z" fill="#8c939b" stroke="#33383e" stroke-width="2"/>`) + `</g>`;
  // card readers (old, new) beside the door
  const reader = (id, ledId, body, ledFill) => `<g id="${id}">` + G_(faceV(o, u0, v1 + 1, H), `<rect x="430" y="${gy + 72}" width="26" height="40" rx="4" fill="${body}" stroke="#0f1113" stroke-width="1.6"/>
    <rect x="434" y="${gy + 78}" width="18" height="4" rx="2" fill="#000"/><circle id="${ledId}" cx="443" cy="${gy + 100}" r="4.5" fill="${ledFill}"/>`) + `</g>`;
  s += reader(`${p}-rdA`, `${p}-led`, "#2f3338", "#3c3f45");
  s += `<g id="${p}-rdBw" opacity="0">` + reader(`${p}-rdB`, `${p}-ledB`, "#1d5f78", "#3c3f45") + `</g>`;
  // −u side: windows
  let side = "";
  for (const y of [30, 156]) for (let i = 0; i < 3; i++) side += win(20 + i * 86, y, 58, 70);
  side += win(20, 296, 58, 70) + win(106, 296, 58, 70) + win(192, 296, 58, 70);
  s += G_(faceU(o, u0, v0, H), side);
  const anchors = {
    top: at(o, 0, 0, H + 40), lobby: at(o, u0 + 140, v1 + 60, 0), lobbyIn: at(o, u0 + 140, v1, 0),
    room: at(o, u0 + 374, v1, 70), roomFront: at(o, u0 + 374, v1 + 70, 0), reader: at(o, u0 + 443, v1, 70), upper: at(o, -60, v1, 340),
  };
  return { svg: `<g id="${p}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors };
}

/** rivet lines on a contractMachine front face + −u face (machine u ±110, v ±100, body z 14..190) */
export function rivets(id, o) {
  let s = "";
  const dot = (p, i) => `<g class="${id}-r" opacity="0"><circle cx="${f(p[0])}" cy="${f(p[1])}" r="5" fill="#9aa0a8" stroke="#3b3f45" stroke-width="1.4"/><circle cx="${f(p[0] - 1.4)}" cy="${f(p[1] - 1.4)}" r="1.8" fill="#e6e8eb"/></g>`;
  const P = [];
  for (let z = 30; z <= 180; z += 24) { P.push(at(o, -104, 104, z)); P.push(at(o, 104, 104, z)); }
  for (let u = -80; u <= 80; u += 26) P.push(at(o, u, 104, 186));
  for (let v = -80; v <= 80; v += 26) P.push(at(o, -112, v, 186));
  P.sort((a, b) => a[1] - b[1]);
  s = P.map(dot).join("");
  return `<g id="${id}">${s}</g>`;
}

/**
 * glassCase(o, {id}) — a transparent back housing bolted to the machine's −u face, with one small internal button inside.
 * o = the machine origin. Movable: ID-btn (cap; turns red), ID-btnR (red cap), ID-fl (flash).
 * anchors: btn, top
 */
export function glassCase(o, opts = {}) {
  const p = opts.id ?? "gc";
  const u0 = -190, u1 = -112, v0 = -55, v1 = 55, z0 = 50, z1 = 160;
  let s = "";
  // back walls (inside, faint)
  s += `<g opacity="0.9">` + box(o, u0, u1, v0, v1, z0, z0 + 6, { f: "#9aa0a8", s: "#7d838b", t: "#b8bdc3", st: "#3b3f45" }, 1.2) + `</g>`;
  // the internal button on a little post
  s += box(o, -160, -140, -12, 12, z0 + 6, z0 + 30, M.dark, 1.2);
  const cap = (m) => frustum(o, -150, 0, 17, 15, z0 + 30, z0 + 42, m, { sw: 1.3, seg: 24 });
  s += `<g id="${p}-btn">${cap({ f: "#3aa9cf", s: "#1f7f9f", t: "#7fd0ea", st: "#155e77" })}</g>`;
  s += `<g id="${p}-btnR" opacity="0">${cap({ f: "#e0453a", s: "#b8322a", t: "#f0786e", st: "#7a1d17" })}</g>`;
  const ct = at(o, -150, 0, z0 + 42);
  s += `<ellipse id="${p}-fl" cx="${f(ct[0])}" cy="${f(ct[1])}" rx="26" ry="14" fill="#ffffff" opacity="0"/>`;
  // glass shell (front faces, translucent) with frame
  const glass = { f: "rgba(196,228,240,0.30)", s: "rgba(178,216,232,0.32)", t: "rgba(226,246,252,0.40)", st: "rgba(42,140,175,0.95)" };
  s += box(o, u0, u1, v0, v1, z0 + 6, z1, glass, 2);
  const hl = [at(o, u0, v0 + 18, z1 - 12), at(o, u0, v0 + 60, z0 + 26)];
  s += `<path d="M${f(hl[0][0])} ${f(hl[0][1])}L${f(hl[1][0])} ${f(hl[1][1])}" stroke="#ffffff" stroke-width="4" opacity="0.7"/>`;
  for (const [u, v] of [[u0 + 6, v0 + 6], [u0 + 6, v1 - 6]]) { const q = at(o, u, v, z1 - 6); s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="3.4" fill="#c9cdd2" stroke="#3b3f45" stroke-width="1"/>`; }
  const [ox, oy] = at(o, (u0 + u1) / 2, 0, 0);
  return { svg: `<g id="${p}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors: { btn: ct, top: at(o, (u0 + u1) / 2, 0, z1 + 20), side: at(o, u0, 0, (z0 + z1) / 2) } };
}

/** a paper sticker over funcPanel nameplate i (panel origin o, n buttons, pitch, depth 170, height 150) */
export function sticker(id, o, i, text, opts = {}) {
  const n = opts.n ?? 5, pitch = opts.pitch ?? 104, W = n * pitch + 48, u0 = -W / 2;
  const zF = 150 - 170 * Math.tan(20 * Math.PI / 180);
  const cu = u0 + 24 + pitch * (i + 0.5), w = 90;
  const inner = `<rect x="0" y="0" width="${w}" height="26" rx="3" fill="#ffffff" stroke="#1d93ba" stroke-width="2"/><path d="M${w - 12} 0L${w} 12V0Z" fill="#d6eef6"/>` +
    `<text x="${w / 2}" y="19" font-family="JetBrains Mono, monospace" font-size="16" font-weight="800" fill="#1d93ba" text-anchor="middle">${text}</text>`;
  return `<g id="${id}" opacity="0">${G_(faceV(o, cu - w / 2, 86, zF - 50), inner)}</g>`;
}

/** an empty-plate outline (dashed, teal) that reads "should have been here" over funcPanel button i */
export function plateGhost(id, o, i, opts = {}) {
  const n = opts.n ?? 2, pitch = opts.pitch ?? 104, W = n * pitch + 48, u0 = -W / 2;
  const D = 170, ang = 20 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), v0 = -D / 2, zB = 150, L = D / ca;
  const cu = u0 + 24 + pitch * (i + 0.5), sB = L * 0.4;
  const A = (du, s_, h) => at(o, du, v0 + s_ * ca - h * sa, zB - s_ * sa + h * ca);
  const sq = (h) => [A(cu - 42, sB - 42, h), A(cu + 42, sB - 42, h), A(cu + 42, sB + 42, h), A(cu - 42, sB + 42, h)];
  const top = sq(46), bot = sq(38);
  const poly = (q) => `M${q.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}Z`;
  let d = poly(top) + poly(bot);
  for (let k = 0; k < 4; k++) d += `M${f(top[k][0])} ${f(top[k][1])}L${f(bot[k][0])} ${f(bot[k][1])}`;
  for (const [x, ss] of [[cu - 34, sB + 34], [cu + 34, sB + 34], [cu - 34, sB - 34], [cu + 34, sB - 34]]) { const a = A(x, ss, 38), b = A(x, ss, 0); d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`; }
  return `<path id="${id}" d="${d}" fill="rgba(42,163,201,0.10)" stroke="#1d93ba" stroke-width="3" stroke-dasharray="9 6" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>`;
}
