// Generates compositions/story.html for s3-whiteboard. Deterministic: wobble comes from a fixed sine table, no random.
import fs from "fs";
const OUT = "/Users/k/Workon/Learning/web3/web3-security-101/media/video/skeuo/s3-whiteboard/compositions/story.html";

let K = 1;
const S = (k) => Math.sin(k * 12.9898 + 1.7) * 0.6 + Math.sin(k * 4.1414 + 0.3) * 0.4;
const j = (a) => S(K++) * a;
const f = (n) => (Math.round(n * 10) / 10).toString();

function line(x1, y1, x2, y2, w = 5) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L, b = j(w);
  return `M${f(x1 + j(1.5))} ${f(y1 + j(1.5))} Q${f(mx + nx * b + j(3))} ${f(my + ny * b + j(3))} ${f(x2 + j(1.5))} ${f(y2 + j(1.5))}`;
}
function rect(x1, y1, x2, y2, w = 5, o = 7) {
  return [
    line(x1 - o, y1 + j(2), x2 + o * 0.6, y1 + j(3), w),
    line(x2 + j(2), y1 - o * 0.5, x2 + j(3), y2 + o, w),
    line(x2 + o * 0.5, y2 + j(2), x1 - o, y2 + j(3), w),
    line(x1 + j(2), y2 + o * 0.4, x1 + j(3), y1 - o, w),
  ].join(" ");
}
function ellipse(cx, cy, rx, ry, start = -110, sweep = 380, n = 44, wob = 0.035) {
  let d = "";
  const k0 = K; K += 3;
  for (let i = 0; i <= n; i++) {
    const a = ((start + (sweep * i) / n) * Math.PI) / 180;
    const r = 1 + wob * S(k0 + i * 0.37) + (i / n) * 0.05; // spiral slightly outward -> overshoot doesn't close perfectly
    d += (i ? " L" : "M") + f(cx + Math.cos(a) * rx * r) + " " + f(cy + Math.sin(a) * ry * r);
  }
  return d;
}
function check(x, y, s) {
  return `M${f(x)} ${f(y + s * 0.5)} Q${f(x + s * 0.18)} ${f(y + s * 0.68)} ${f(x + s * 0.36)} ${f(y + s * 0.92)} Q${f(x + s * 0.62)} ${f(y + s * 0.38)} ${f(x + s * 1.05)} ${f(y - s * 0.06)}`;
}
function cross(x, y, s) { return line(x, y, x + s, y + s, 4) + " " + line(x + s, y + s * 0.05, x - s * 0.05, y + s, 4); }
function arrow(x1, y1, cx, cy, x2, y2, h = 26) {
  const a = Math.atan2(y2 - cy, x2 - cx);
  const l = (d) => `${f(x2 - Math.cos(a + d) * h)} ${f(y2 - Math.sin(a + d) * h)}`;
  return `M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)} M${l(0.5)} L${f(x2)} ${f(y2)} L${l(-0.5)}`;
}

// ---------- world paths ----------
const P = []; // {id, d, cls, w}
const add = (id, d, cls = "k", w = 6, pre = false) => P.push({ id, d, cls, w, pre });

// safe (world 950-1450 x 330-780). Outer box is already on the board at frame 0.
add("p-safe-out", rect(950, 330, 1450, 780, 4, 8), "k", 7, true);
add("p-safe-in", rect(988, 368, 1352, 742, 4, 6), "k", 5, true);
add("p-safe-dial", ellipse(1402, 470, 30, 30, -90, 370, 36) + " " + line(1402, 440, 1402, 456, 1) + " " + line(1432, 470, 1418, 470, 1) + " " + line(1372, 470, 1386, 470, 1), "k", 5, true);
add("p-safe-handle", line(1402, 560, 1404, 660, 3) + " " + ellipse(1403, 552, 11, 11, 0, 370, 16) + " " + line(1385, 662, 1422, 660, 2), "k", 6, true);
add("p-safe-feet", line(990, 782, 986, 812, 2) + " " + line(1410, 782, 1414, 812, 2), "k", 7, true);
// amount underline
add("p-amt-ul", line(1500, 452, 2000, 446, 7) + " " + line(1540, 464, 1960, 462, 5), "k", 6);
// key + its check
add("p-key", ellipse(1050, 455, 34, 34, -10, 375, 36) + " " + ellipse(1048, 455, 11, 11, 0, 370, 16) + " " + line(1084, 455, 1250, 457, 3) + " " + line(1205, 456, 1206, 492, 1) + " " + line(1232, 457, 1232, 484, 1), "k", 6);
add("p-key-ok", check(1262, 420, 66), "b", 8);
// signers
const signers = [300, 500, 700];
signers.forEach((x, i) => {
  add(`p-sg${i}`, ellipse(x, 500, 40, 42, -100, 375, 32) + " " + line(x + 1, 543, x - 2, 700, 4) + " " + line(x - 62, 610, x, 574, 3) + " " + line(x, 574, x + 60, 606, 3) + " " + line(x - 2, 700, x - 46, 800, 3) + " " + line(x - 2, 700, x + 44, 802, 3), "k", 6);
  add(`p-sg${i}-ok`, check(x - 32, 388, 64), "b", 8);
});
// screen
add("p-scr", rect(3050, 260, 3750, 700, 4, 8) + " " + rect(3078, 288, 3722, 672, 3, 0), "k", 6);
add("p-scr-stand", line(3388, 704, 3384, 792, 2) + " " + line(3412, 704, 3416, 792, 2) + " " + line(3280, 796, 3520, 793, 3), "k", 6);
add("p-scr-ok", check(3490, 405, 100), "b", 10);
// paper with folded corner
add("p-paper", line(2142, 222, 2792, 218, 4) + " " + line(2792, 218, 2852, 280, 2) + " " + line(2852, 280, 2850, 892, 4) + " " + line(2852, 890, 2146, 894, 4) + " " + line(2148, 894, 2144, 214, 4) + " " + line(2792, 222, 2796, 282, 2) + " " + line(2796, 282, 2850, 282, 2), "k", 6);
// climax: red 1, circle, arrow to DELEGATECALL
add("p-one", `M2607 600 Q2627 588 2647 566 Q2645 640 2644 716`, "r", 15);
add("p-one-ring", ellipse(2637, 648, 74, 88, -60, 385, 44, 0.05), "r", 7);
add("p-one-arr", arrow(2606, 745, 2596, 772, 2588, 800, 20), "r", 6);
// l5: arrow from paper into the safe, strike, wobble
add("p-l5-arr", arrow(2132, 655, 1800, 622, 1478, 650, 34), "r", 8);
add("p-strike", line(1050, 650, 1290, 642, 3) + " " + line(1052, 662, 1286, 656, 2), "r", 6);
// l6: key check, question mark, cross
add("p-l6-ok", check(1262, 186, 66), "b", 9);
add("p-q", `M1716 150 C1712 82 1792 58 1826 92 C1862 128 1840 176 1802 198 C1778 212 1776 236 1778 262`, "k", 13);
add("p-q-dot", ellipse(1779, 302, 9, 9, 0, 370, 14), "k", 12);
add("p-l6-x", cross(2500, 120, 66), "k", 9);

// ---------- end layer (screen space) ----------
const E = [];
const BX = (i) => 175 + i * 230, BY1 = 520, BY2 = 710;
let route = "";
for (let i = 0; i < 7; i++) {
  route += (route ? " " : "") + rect(BX(i), BY1, BX(i) + 190, BY2, 3, 6);
  if (i < 6) {
    const x1 = BX(i) + 196, x2 = BX(i + 1) - 6, y = 615 + j(4);
    route += " " + `M${f(x1)} ${f(y)} L${f(x2)} ${f(y + j(3))} M${f(x2 - 13)} ${f(y - 11)} L${f(x2)} ${f(y)} L${f(x2 - 13)} ${f(y + 11)}`;
  }
}
E.push({ id: "e-route", d: route, cls: "k", w: 6 });
E.push({ id: "e-ring4", d: ellipse(BX(3) + 95, 615, 140, 128, -120, 390, 48, 0.05), cls: "r", w: 8 });

// ---------- residue blobs (world, static) ----------
const blobs = [
  [520, 260, 340, 70, -6], [1880, 820, 420, 60, 4], [2620, 120, 300, 50, -3], [3460, 880, 380, 70, 5], [160, 900, 260, 60, 2], [1240, 120, 260, 44, -2], [3180, 160, 220, 40, 8],
];

const pathTag = (p) => `<g id="${p.id}" class="${p.cls}" stroke-width="${p.w}">` + p.d.split(/ (?=M)/).map((d) => `<path${p.pre ? "" : ' class="d"'} pathLength="1" d="${d}"/>`).join("") + "</g>";

const html = `<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: #fbfbf8; font-family: "LXGW WenKai", serif; color: #222; }
    #wb-world { position: absolute; left: 0; top: 0; width: 3900px; height: 1080px; }
    #wb-svg, #wb-end-svg { position: absolute; left: 0; top: 0; overflow: visible; }
    path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .k path { stroke: #222; } .b path { stroke: #1f5fbf; } .r path { stroke: #d23a2a; }
    path.d { stroke-dasharray: 1 2; stroke-dashoffset: 1; }
    .w { position: absolute; white-space: nowrap; line-height: 1.2; clip-path: inset(-40% 100% -40% -6%); }
    .mono { font-family: "JetBrains Mono", monospace; font-weight: 500; }
    .kai { font-family: "LXGW WenKai", serif; }
    .cb { color: #1f5fbf; } .cr { color: #d23a2a; } .ck { color: #222; }
    #wb-erase { position: absolute; inset: 0; background: #fbfbf8; clip-path: inset(0 100% 0 0); }
    #wb-felt { position: absolute; left: 0; top: 330px; width: 150px; height: 330px; }
    #wb-felt-pad { position: absolute; left: 0; top: 0; width: 150px; height: 330px; background: #dcd8cf; border-radius: 10px; }
    #wb-felt-top { position: absolute; left: 34px; top: 0; width: 116px; height: 330px; background: #3a3a3a; border-radius: 10px 16px 16px 10px; }
    #wb-end { position: absolute; inset: 0; }
    .bl { position: absolute; width: 190px; text-align: center; }
    .bl .w { position: relative; display: inline-block; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div id="wb-world" data-layout-allow-overflow>
      <svg id="wb-svg" width="3900" height="1080" viewBox="0 0 3900 1080">
        <defs><filter id="wb-soft" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="12"/></filter></defs>
        <g id="wb-ghosts" filter="url(#wb-soft)" fill="#f0f0ec">
${blobs.map(([x, y, w, h, r], i) => `          <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" transform="rotate(${r} ${x + w / 2} ${y + h / 2})"/>`).join("\n")}
        </g>
${P.map((p) => "        " + pathTag(p)).join("\n")}
      </svg>
      <!-- l1 -->
      <div id="t-date" class="w" style="left:220px;top:40px;font-size:72px;rotate:-1deg">2025 年 2 月 21 日</div>
      <div id="t-bybit" class="w" style="left:1000px;top:808px;font-size:52px">Bybit</div>
      <div id="t-cold" class="w" style="left:1160px;top:808px;font-size:52px;rotate:-0.6deg">冷钱包</div>
      <div id="t-amt" class="w" style="left:1508px;top:330px;font-size:92px;rotate:-1.2deg">≈ 15 亿美元</div>
      <div id="t-fbi" class="w" style="left:1520px;top:484px;font-size:36px">FBI 口径 · 事发时估值</div>
      <!-- l2 -->
      <div id="t-signers" class="w" style="left:418px;top:820px;font-size:52px">签名人</div>
      <!-- l3 -->
      <div id="t-seen" class="w cb" style="left:3104px;top:300px;font-size:52px;rotate:-0.8deg">签名人看到的</div>
      <div id="t-xfer" class="w cb" style="left:3220px;top:400px;font-size:124px">转账</div>
      <!-- l4 -->
      <div id="t-real" class="w" style="left:2200px;top:250px;font-size:76px;rotate:-0.8deg">真正签下的</div>
      <div id="t-to" class="w" style="left:2206px;top:400px;font-size:44px"><span class="mono">to = </span><span class="kai">攻击者合约</span></div>
      <div id="t-data" class="w mono" style="left:2206px;top:490px;font-size:44px">data = transfer(…)</div>
      <div id="t-op" class="w mono" style="left:2206px;top:612px;font-size:46px">operation =</div>
      <div id="t-dc" class="w mono cr" style="left:2300px;top:800px;font-size:42px;font-weight:700">DELEGATECALL</div>
      <!-- l5 -->
      <div id="t-run" class="w" style="left:1640px;top:562px;font-size:40px;rotate:-1.5deg">代码在钱包里运行</div>
      <div id="t-slot" class="w mono" style="left:1012px;top:566px;font-size:36px">slot 0</div>
      <div id="t-impl" class="w" style="left:1060px;top:618px;font-size:46px">实现合约</div>
      <div id="t-atk" class="w cr" style="left:1048px;top:680px;font-size:46px;rotate:-1deg">攻击者合约</div>
      <!-- l6 -->
      <div id="t-key" class="w" style="left:1080px;top:168px;font-size:80px;rotate:-1deg">钥匙</div>
      <div id="t-doc" class="w" style="left:2330px;top:102px;font-size:80px;rotate:0.8deg">文件</div>
    </div>
    <div id="wb-erase">
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">
        <defs><filter id="wb-soft2" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="14"/></filter></defs>
        <g filter="url(#wb-soft2)" fill="#f0f0ec"><ellipse cx="550" cy="345" rx="310" ry="40"/><ellipse cx="1250" cy="880" rx="360" ry="36"/><ellipse cx="1560" cy="170" rx="250" ry="34"/></g>
      </svg>
    </div>
    <div id="wb-felt" data-layout-ignore><div id="wb-felt-pad"></div><div id="wb-felt-top"></div></div>
    <div id="wb-end">
      <svg id="wb-end-svg" width="1920" height="1080" viewBox="0 0 1920 1080">
${E.map((p) => "        " + pathTag(p)).join("\n")}
      </svg>
${["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"].map((n, i) => `      <div class="bl" style="left:${BX(i)}px;top:540px"><div id="e-n${i}" class="w" style="font-size:46px">${"①②③④⑤⑥⑦"[i]}</div></div>
      <div class="bl" style="left:${BX(i)}px;top:622px"><div id="e-l${i}" class="w" style="font-size:${n.length > 4 ? 32 : 36}px">${n}</div></div>`).join("\n")}
      <div id="e-bybit" class="w" style="left:842px;top:756px;font-size:42px">Bybit 断在这一关</div>
      <div id="e-title" class="w" style="left:172px;top:150px;font-size:96px;rotate:-0.8deg">攻击者不再偷私钥</div>
      <div id="e-sub" class="w" style="left:180px;top:300px;font-size:52px">第 29 章 · 签名路径</div>
    </div>
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      // draw a stroke (pathLength=1)
      // strokes inside a group are drawn one after another, time split by length
      function D(sel, t, dur, ease) {
        const ps = Array.from(document.querySelectorAll(sel + " path"));
        const L = ps.map((p) => p.getTotalLength());
        const T = L.reduce((a, b) => a + b, 0);
        let c = t;
        ps.forEach((p, i) => {
          const d = (dur * L[i]) / T;
          tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: ps.length > 1 ? "none" : ease || "power1.inOut" }, c);
          c += d;
        });
        return t + dur;
      }
      // write text left to right, ~0.07 s per glyph
      function W(sel, t, rate) {
        const el = document.querySelector(sel);
        const n = Array.from(el.textContent.replace(/\\s/g, "")).length;
        const dur = Math.max(0.14, n * (rate || 0.07));
        tl.fromTo(sel, { clipPath: "inset(-40% 100% -40% -6%)" }, { clipPath: "inset(-40% -6% -40% -6%)", duration: dur, ease: "none" }, t);
        return t + dur;
      }
      // camera: frame = (x, y) + s * world
      let cam = { x: -150, y: 0, scale: 1 };
      tl.set("#wb-world", { transformOrigin: "0 0", x: cam.x, y: cam.y, scale: cam.scale }, 0);
      function CAM(t, x, y, scale, dur) {
        const to = { x: x, y: y, scale: scale };
        tl.fromTo("#wb-world", Object.assign({}, cam), Object.assign({ duration: dur || 0.8, ease: "power2.inOut", immediateRender: false }, to), t);
        cam = to;
      }

      // l1 0.70-6.10 : date, Bybit, cold wallet, amount
      W("#t-date", 0.70, 0.07);
      W("#t-bybit", 2.46, 0.07);
      W("#t-cold", 3.60, 0.08);
      W("#t-amt", 5.23, 0.08);
      D("#p-amt-ul", 5.80, 0.35);
      W("#t-fbi", 6.25, 0.06);

      // l2 7.53-12.90 : key ✓, three signers ✓ ✓ ✓
      D("#p-key", 7.53, 0.75);
      D("#p-key-ok", 8.68, 0.28);
      D("#p-sg0", 9.56, 0.5);
      D("#p-sg1", 9.96, 0.5);
      D("#p-sg2", 10.36, 0.5);
      W("#t-signers", 10.86, 0.08);
      D("#p-sg0-ok", 11.30, 0.22);
      D("#p-sg1-ok", 11.82, 0.22);
      D("#p-sg2-ok", 12.34, 0.22);

      // l3 14.40-16.94 : the screen
      CAM(13.5, -2440, 0, 1);
      D("#p-scr", 14.40, 0.6);
      D("#p-scr-stand", 14.95, 0.3);
      W("#t-seen", 15.15, 0.07);
      W("#t-xfer", 16.09, 0.08);
      D("#p-scr-ok", 16.30, 0.3);

      // l4 18.13-22.39 : the paper actually signed; climax operation = 1
      CAM(17.3, -2060, 0, 1);
      D("#p-paper", 17.90, 0.5);
      W("#t-real", 18.30, 0.07);
      W("#t-to", 18.85, 0.07);
      W("#t-data", 19.62, 0.06);
      CAM(20.95, -2460, -268, 1.2);
      W("#t-op", 20.80, 0.06);
      // 0.4 s hold, then the red 1
      D("#p-one", 21.86, 0.26, "power2.out");
      D("#p-one-ring", 22.14, 0.34);
      D("#p-one-arr", 22.50, 0.16);
      W("#t-dc", 22.64, 0.06);

      // l5 23.76-29.66 : arrow into the safe, implementation swapped
      CAM(23.40, -750, 80, 0.9);
      D("#p-l5-arr", 24.20, 0.7);
      W("#t-slot", 25.00, 0.07);
      W("#t-impl", 25.45, 0.07);
      W("#t-run", 26.07, 0.07);
      D("#p-strike", 27.80, 0.3);
      W("#t-atk", 28.63, 0.08);

      // l6 31.40-36.58 : key ✓ ? document ✗
      W("#t-key", 31.40, 0.08);
      D("#p-l6-ok", 32.53, 0.28);
      D("#p-q", 33.81, 0.5);
      D("#p-q-dot", 34.33, 0.1);
      W("#t-doc", 35.43, 0.08);
      D("#p-l6-x", 35.70, 0.35);

      // l7 38.10-42.93 : erase, then the seven gates in one stroke
      tl.fromTo("#wb-erase", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power1.inOut" }, 37.30);
      tl.fromTo("#wb-felt", { x: -170 }, { x: 1940, duration: 0.86, ease: "power1.inOut" }, 37.30);
      D("#e-route", 38.90, 3.0, "none");
      for (let i = 0; i < 7; i++) {
        const t0 = 38.90 + 3.0 * (i + 0.72) / 7;
        W("#e-n" + i, t0, 0.07);
        W("#e-l" + i, t0 + 0.08, 0.06);
      }
      D("#e-ring4", 42.36, 0.4);
      W("#e-bybit", 42.62, 0.05);

      // end card 43.2-47.16 : title written, then 2.5 s+ dead still
      W("#e-title", 43.22, 0.065);
      W("#e-sub", 43.84, 0.055);
      tl.set({}, {}, 47.16);

      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(OUT, html);
console.log("ok", P.length, "paths");
