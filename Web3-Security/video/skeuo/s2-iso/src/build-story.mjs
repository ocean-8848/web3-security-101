// Generates compositions/story.html for the isometric-channel style.
// Run: node src/build-story.mjs   (static geometry is baked into the HTML so Studio can edit it)
import fs from "node:fs";

const D = Math.PI / 180;
const CA = Math.cos(35 * D), SA = Math.sin(35 * D); // azimuth 35°
const SE = 0.5, CE = Math.cos(30 * D);               // elevation 30°
const OX = 900, OY = 1700;
const W = (u, v, z = 0) => [OX + u * CA + v * SA, OY - u * SA * SE + v * CA * SE - z * CE];
const f = (n) => Math.round(n * 10) / 10;
const pts = (arr) => arr.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

const STROKE = 'stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"';
function box(u0, u1, v0, v1, z0, z1) {
  const front = [W(u0, v0, z0), W(u0, v1, z0), W(u0, v1, z1), W(u0, v0, z1)];
  const side = [W(u0, v1, z0), W(u1, v1, z0), W(u1, v1, z1), W(u0, v1, z1)];
  const top = [W(u0, v0, z1), W(u1, v0, z1), W(u1, v1, z1), W(u0, v1, z1)];
  return `<polygon class="fs" points="${pts(side)}" ${STROKE}/><polygon class="ff" points="${pts(front)}" ${STROKE}/><polygon class="ft" points="${pts(top)}" ${STROKE}/>`;
}

const GATES = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const GU = (i) => i * 420;
const VAULT_U0 = 2820, VAULT_U1 = 3080;

// ground grid
let grid = "";
for (let k = -24; k <= 48; k++) { const u = k * 120; grid += `M${pts([W(u, -2600)])}L${pts([W(u, 2600)])}`; }
for (let k = -22; k <= 22; k++) { const v = k * 120; grid += `M${pts([W(-2900, v)])}L${pts([W(5800, v)])}`; }

// road
const road = pts([W(-900, -120), W(VAULT_U0, -120), W(VAULT_U0, 120), W(-900, 120)]);
let dashes = "";
for (let u = -880; u < VAULT_U0 - 60; u += 90) dashes += `M${pts([W(u, 0)])}L${pts([W(u + 40, 0)])}`;

// gates, far to near
let gates = "";
for (let i = 6; i >= 0; i--) {
  const u = GU(i);
  gates += `<g id="gate-${i}" class="gate">` +
    box(u - 18, u + 18, -178, -142, 0, 280) +
    box(u - 18, u + 18, 142, 178, 0, 280) +
    box(u - 24, u + 24, -200, 200, 280, 330) + `</g>`;
}

// vault (cold wallet) with door drawn on its front face via an affine frame
const [fx, fy] = W(VAULT_U0, -150, 300);
const faceM = `matrix(${f4(SA)},${f4(CA * SE)},0,${f4(CE)},${f(fx)},${f(fy)})`;
function f4(n) { return Math.round(n * 10000) / 10000; }
const vault =
  `<g id="vault-plinth">${box(VAULT_U0 - 30, VAULT_U1 + 30, -180, 180, 0, 16)}</g>` +
  `<g id="vault">${box(VAULT_U0, VAULT_U1, -150, 150, 16, 300)}` +
  `<g transform="${faceM}">` +
  `<rect x="22" y="22" width="256" height="240" rx="10" fill="#f6f4ef" ${STROKE}/>` +
  `<circle cx="96" cy="142" r="54" fill="#ffffff" ${STROKE}/>` +
  `<circle cx="96" cy="142" r="14" fill="#1b1b1b"/>` +
  `<path d="M96 92V112M96 172V192M46 142H66M126 142H146" stroke="#1b1b1b" stroke-width="5" stroke-linecap="round"/>` +
  `<rect x="176" y="62" width="78" height="96" rx="8" fill="#ffffff" ${STROKE}/>` +
  `<g id="vault-key"><circle cx="198" cy="110" r="13" fill="none" stroke="#1b1b1b" stroke-width="5"/>` +
  `<path d="M211 110H244M232 110V122M242 110V119" stroke="#1b1b1b" stroke-width="5" stroke-linecap="round"/></g>` +
  `<circle id="vault-lamp" cx="215" cy="200" r="16" fill="#ffffff" stroke="#1b1b1b" stroke-width="4"/>` +
  `</g></g>`;

// HTML pins: absolutely positioned at a world point, no transforms
const pin = (id, u, v, z, inner, extra = "") => {
  const [x, y] = W(u, v, z);
  return `<div class="pin" id="${id}" style="left:${f(x)}px;top:${f(y)}px"${extra}>${inner}</div>`;
};

const labels = GATES.map((name, i) =>
  pin(`lbl-pin-${i}`, GU(i), 0, 360,
    `<div class="bc"><div class="lbl${i === 3 ? " lbl-red" : ""}" id="lbl-${i}"><span class="lbl-n">${NUM[i]}</span>${name}</div></div>`)).join("\n        ");

const svg = `<svg id="world-svg" width="4000" height="2200" viewBox="0 0 4000 2200" overflow="visible">
          <path id="grid" d="${grid}" stroke="#e2dfd7" stroke-width="2" fill="none"/>
          <polygon id="road" points="${road}" fill="#f8f7f3" stroke="#cdc8bd" stroke-width="3"/>
          <path id="road-dash" d="${dashes}" stroke="#d6d1c6" stroke-width="5" stroke-linecap="round" fill="none"/>
          ${vault}
          ${gates}
        </svg>`;

// small red gate for the end card
const endGate = `<svg id="end-gate-svg" width="420" height="580" viewBox="730 1340 340 470">` +
  `<g class="gate-red">${box(-18, 18, -178, -142, 0, 280)}${box(-18, 18, 142, 178, 0, 280)}${box(-24, 24, -200, 200, 280, 330)}</g></svg>`;

const tpl = fs.readFileSync(new URL("./story.tpl", import.meta.url), "utf8");
const final = tpl
  .replace("<!--SVG-->", svg)
  .replace("<!--LABELS-->", labels)
  .replace("<!--ENDGATE-->", endGate)
  .replace(/data-at="([-\d.]+),([-\d.]+),([-\d.]+)"/g, (_, u, v, z) => {
    const [x, y] = W(+u, +v, +z);
    return `style="left:${f(x)}px;top:${f(y)}px"`;
  });
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), final);
console.log("wrote compositions/story.html", final.length);
