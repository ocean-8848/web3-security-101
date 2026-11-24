// ep16/seg4「④ 检查点与客户端」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.deskC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   upgradeA     ---- A
//   deskA        近景：入账台 + 信号柱 + 检查点 + 告警灯（seg1 L6–L11 终点；seg2 起点；seg6 L1–L5、L10–L11）
//   chainA       近景：主链 + 扳道器 + 信号柱（seg2 L0–L4 主链与分叉示意）
//   A            A 全区
//   notaryB      ---- B
//   resourceB    B 资源分类板 + 沙漏 + 攻击者 + 印章（seg2 L12–L17 终点；seg3 起点）
//   B            
//   mineC        ---- C
//   forkC        近景：两条链 + 扳道器 + 矿机（seg3 L1–L5、L17–L21）
//   countC       近景：确认数计数器 + 沙漏 + 公开链尾（seg3 L6–L12）
//   dotsC        近景：点阵两簇 + 租来的矿机（seg3 L13–L16）
//   deskC        近景：入账台 + 重组告警 + 私下链尾（seg3 L22–L23 终点；seg4 起点）
//   gateD        ---- D
//   clientD      近景：三台客户端机柜 + 投票表（seg4 L3–L6）
//   shareD       近景：四块份额牌阶梯（seg4 L10–L14）
//   rangeD       近景：改写的历史 + 主链 + 旧私钥 + 新节点 + 两份检查点 + 放大镜（seg4 L15–L21 终点；seg5 起点）
//   D            
//   haltE        ---- E
//   seqE         近景：排序器 + 信封 + 信号柱 + L1 + 入账台（seg5 L9–L16）
//   voteE        近景：托管保险柜 + 见证人投票箱 + 手机（seg5 L17–L21 终点；seg6 起点、L6–L7）
//   E            
//   wide         ---- 全景：链上小镇五个区（seg6 L0、L12 → 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.rangeD

// segment-only camera: gate + meter + three client racks + main chain (L3–L9)
const R = (o, k) => L.rect(o, k);
const CAMS = { ...L.CAMS, cgD: L.fit([R(L.GATE, "checkpoint"), R(L.METERD, "thresholdMeter"), ...L.CLIENTS.map((q) => R(q, "rack")), R(L.CHAIND, "chain4")], [100, 280, 1820, 860], 1.4) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E5, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// D-zone local placer (world-canvas px relative to the D anchor 8200, −750)
const dz = (x, y, extra = {}) => { const q = G(8200 + x, -750 + y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
// wrap helper for objects without opts.scale (SEGBASE 常见坑 1)
const putK = (key, o, r, k, dy = 0, opts = {}) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...opts, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const sc = (v) => (Array.isArray(v) && typeof v[0] === "number" ? [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k] : Array.isArray(v) ? v.map(sc) : v);
  for (const n in A[key]) A[key][n] = sc(A[key][n]);
};
const P = (p) => p.map((q) => q.join(",")).join(" ");
const iso = (u, v, du, dv, h, c) => {   // flat iso slab: top, +v face, −u face
  const a = Wp(u - du, v - dv, h), b = Wp(u + du, v - dv, h), cc = Wp(u + du, v + dv, h), d = Wp(u - du, v + dv, h);
  const c0 = Wp(u + du, v + dv, 0), d0 = Wp(u - du, v + dv, 0), a0 = Wp(u - du, v - dv, 0);
  return `<polygon points="${P([d, cc, c0, d0])}" fill="${c[1]}"/><polygon points="${P([a, d, d0, a0])}" fill="${c[2]}"/><polygon points="${P([a, b, cc, d])}" fill="${c[0]}" stroke="#b9b2a5" stroke-width="1"/>`;
};

// ---------------------------------------------------------------- 世界物件
// C 区（seg3 段尾的画面，开场 1.6 秒内横移离开）
put("pbC", L.PUBCHAIN, O.chain(L.PUBCHAIN, { id: "pbC", n: 4 }));
put("pvC", L.PRIVCHAIN, O.chain(L.PRIVCHAIN, { id: "pvC", n: 5, blockStates: ["attacker", "attacker", "attacker", "attacker", "attacker"] }));
put("rlC", L.ROLLC, E2.rollCounter(L.ROLLC, { id: "rlC", digits: 3, value: 600 }));
put("dkC", L.DESKC, E7.dispatchDesk(L.DESKC, { id: "dkC", scale: 0.8, entries: ["充值 ✓", "提走 ✓"], shown: 2 }));
put("bcC", L.BEACONC, O.beacon(L.BEACONC, { id: "bcC" }));

// D 区
put("sgnD", L.SIGND, E1.signBoard(L.SIGND, { id: "sgnD", style: "plate", text: "PoS · 最终性" }));
put("gt", L.GATE, O.checkpoint(L.GATE, { id: "gt", n: "检查点", armUp: false }));
putK("mtD", L.METERD, E5.thresholdMeter(L.METERD, { id: "mtD", max: 3, th: 2, level: 1.6, thText: "2/3" }), 0.8);
L.CLIENTS.forEach((q, i) => putK("rk" + i, q, O.rack(q, { id: "rk" + i, tag: "客户端 " + "ABC"[i], leds: ["green", "green", "green"] }), 0.75));
const CHN5 = { u: L.CHAIND.u + 90, v: L.CHAIND.v };      // n 5, first four blocks sit where the layout's n 4 chain sits
put("chD", CHN5, O.chain(CHN5, { id: "chD", n: 5 }));
const SGD = dz(-120, 40);
put("sgD", SGD, X.finalitySignal(SGD, { id: "sgD", scale: 0.6, lit: 2 }));
put("rw", L.REWRITE, O.chain(L.REWRITE, { id: "rw", n: 3, labels: ["#1'", "#2'", "#3'"], blockStates: ["attacker", "attacker", "attacker"] }), 0, { grow: true });
L.SHARES.forEach((q, i) => {
  add(q, iso(q.u, q.v, 95, 70, 6 + i * 6, ["#e6e0d4", "#d3ccbf", "#c7bfb1"]), -300);
  put("sh" + i, q, E1.signBoard(q, { id: "sh" + i, style: "plate", text: ["约 33%", "约 34%", "约 51%", "约 66%"][i] }));
});
put("okey", L.OLDKEY, O.key(L.OLDKEY, { id: "okey", state: "attacker" }), 0, { grow: true });
put("nn", L.NEWNODE, O.person(L.NEWNODE, { id: "nn", role: "engineer", scale: 0.6 }), 0, { grow: true });
L.CPDOCS.forEach((q, i) => put("cp" + i, q, O.doc(q, { id: "cp" + i, title: "检查点", standing: true }), 0, { grow: true }));
put("mag", L.MAGD, O.magnifier(L.MAGD, { id: "mag" }), 0, { grow: true, wrap: (svg) => `<g id="magMv">${svg}</g>` });

// 原生 SVG：客户端占比条、关卡红地光、份额亮光、改写历史的分叉线
const BW = 130;
const bars = [0, 1, 2].map((i) => {
  const [x, y] = up(A["rk" + i].top, 22);
  return `<rect x="${x - BW / 2}" y="${y - 9}" width="${BW}" height="18" rx="4" fill="#fff" stroke="#1c1c1c" stroke-width="2"/>` +
    `<rect id="shb${i}-f" x="${x - BW / 2 + 2}" y="${y - 7}" width="${(BW - 4) / 3}" height="14" rx="3" fill="#2aa3c9"/>` +
    [1, 2].map((m) => `<line x1="${x - BW / 2 + (BW * m) / 3}" y1="${y - 13}" x2="${x - BW / 2 + (BW * m) / 3}" y2="${y + 13}" stroke="#1c1c1c" stroke-width="2" stroke-dasharray="3 2"/>`).join("");
});
add(L.CLIENTS[2], S.hid("shbars", bars.join("")), 400);
const [gx, gy] = at(L.GATE);
add(L.GATE, S.hid("gtRed", `<ellipse cx="${gx}" cy="${gy}" rx="230" ry="130" fill="#e0453a" opacity="0.32"/>`), -400);
L.SHARES.forEach((q, i) => { const [x, y] = at(q); add(q, S.hid("shg" + i, `<ellipse cx="${x}" cy="${y}" rx="125" ry="72" fill="${i === 3 ? "#e0453a" : "#2aa3c9"}" opacity="0.38"/>`), -200); });
const [fx0, fy0] = at({ u: CHN5.u - 360, v: CHN5.v }), [fx1, fy1] = at({ u: L.REWRITE.u - 180, v: L.REWRITE.v });
add(L.REWRITE, S.hid("rwLine", `<path d="M${fx0},${fy0 + 20} C${fx0 - 40},${fy0 + 110} ${fx1 - 60},${fy1 - 60} ${fx1},${fy1}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/>`), -500);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-gate", up(A.gt.top, 10), "检查点", "lab-ink");
lb("lb-meter", up(A.mtD.top, 10), "投票", "lab-ink");
lb("lb-fin", up(A.gt.armTip, 18), "已最终确定", "lab-gs");
lb("lb-nofin", up(A.gt.armTip, 18), "不再最终确定", "lab-rs");
lb("lb-cost", A.gt.ground, "回滚代价：1/3 质押被罚没", "lab-ink lab-sm", "t");
lb("lb-chain", up(A.chD.last ?? A.chD.top, 40), "继续出块", "lab-cs lab-sm");
lb("lb-sg", up(A.sgD.top, 6), "finalized 灯灭", "lab-r lab-sm");
[0, 1, 2].forEach((i) => {
  lb("lb-c" + i, A["rk" + i].ground, "客户端 " + "ABC"[i], "lab-cs lab-sm", "t");
  lb("lb-p" + i, A["rk" + i].ground, ["Prysm", "Teku", "Lighthouse"][i], i < 2 ? "lab-rs lab-sm" : "lab-gs lab-sm", "t");
  lb("lb-ok" + i, up(A["rk" + i].top, 44), "✓", "lab-g");
});
lb("lb-sh1", up(A.rk0.top, 50), "占比 > 1/3", "lab-r lab-sm");
lb("lb-sh2", up(A.rk0.top, 50), "占比 > 2/3", "lab-rs lab-sm");
lb("lb-wrong", A.gt.ground, "错误的链被最终确定", "lab-rs", "t");
lb("lb-t25", A.gt.ground, "约 25 分钟", "lab-r lab-sm", "t");
lb("lb-t60", up(A.gt.ground, -80), "约 1 小时", "lab-r lab-sm", "t");
lb("lb-nofund", up(A.rk2.top, 20), "无资金损失", "lab-g lab-sm");
const SHL = ["阻止最终性<br>不活跃惩罚", "双重最终性<br>最大比例罚没", "主导分叉选择<br>审查 · 短程重组", "最终确定自己的链<br>社会层恢复"];
L.SHARES.forEach((q, i) => lb("lb-s" + i, up(at(q), -40), SHL[i], i === 1 || i === 3 ? "lab-r lab-sm" : "lab-ink lab-sm", "t"));
lb("lb-key", up(A.okey.top, 10), "旧私钥", "lab-rs");
lb("lb-exit", A.okey.ground, "已退出 · 无质押", "lab-ink lab-sm", "t");
lb("lb-rw", up(A.rw.top, 10), "改写的历史", "lab-rs");
lb("lb-keep", up(A.chD.top, 30), "不回滚已最终确定的块", "lab-gs");
lb("lb-nn", up(A.nn.top, 8), "新节点 ?", "lab-cs");
lb("lb-trust", A.nn.ground, "信任入口：检查点", "lab-cs lab-sm", "t");
lb("lb-cp0", up(A.cp0.top, 8), "来源 1", "lab-ink lab-sm");
lb("lb-cp1", up(A.cp1.top, 8), "来源 2", "lab-ink lab-sm");
lb("lb-same", up(A.mag.top, 4), "比对一致 ✓", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  evt("ev-may", `以太坊主网 · 2023 年 5 月`, { color: "#e0453a" }) +
  evt("ev-src", `来源 · Prysm 事后报告`, { top: 210 }) +
  evt("ev-eth", `来源 · ethereum.org${gtag("以太坊口径")}`, { top: 126 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "deskC", sub: "超过三分之一的客户端，能让最终性停下",
  grid: { u0: 3300, u1: 10700, v0: -500, v1: 6600 }, box: [4700, -1900, 5600, 2300],   // 盖住 deskC / gateD / clientD / shareD / rangeD
  shown: [], css, html,
  terms: [
    { id: "t0", t: "PoS", d: "按质押权益出块和投票的共识方式", at: w("PoS", 0) },
    { id: "t1", t: "检查点", d: "PoS 链定期投票确定的区块", at: w("检查点", 1) },
    { id: "t2", t: "罚没", d: "违规验证者的质押被没收", at: w("罚没", 2) },
    { id: "t3", t: "客户端多样性", d: "网络里运行多种独立实现的节点软件", at: w("客户端多样性", 6) },
    { id: "t4", t: "社会层", d: "社区协调软件升级来恢复链的手段", at: w("社会层", 14) },
    { id: "t5", t: "弱主观性", d: "新节点要依赖可信的近期检查点", at: w("弱主观性", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      const bar = (i, s, t, red) => tl.to("#shb" + i + "-f", { attr: { width: ${BW - 4} * s, fill: red ? "#e0453a" : "#2aa3c9" }, duration: 0.6, ease: "power2.inOut" }, t);
      tl.set("#chD-b4, #chD-l3", { opacity: 0 }, 0);
      // ===== L0 再看以太坊这样的 PoS 链。
      cam(${t(LS[0] + 0.1)}, "gateD", 1.6);
      pop("#lb-gate", ${t(LS[0] + 1.6)}); pop("#lb-meter", ${t(LS[0] + 1.8)});
      // ===== L1 它要求三分之二的质押投票，才能让一个检查点最终确定。
      X5.fill(tl, "mtD", ${t(LS[1] + 0.4)}, 3, 1.0);
      KIT.arm(tl, "gt", ${t(LS[1] + 1.6)}, true); pop("#lb-fin", ${t(LS[1] + 2.2)});
      // ===== L2 最终确定以后，区块不能回滚，除非三分之一的质押被罚没。
      pop("#lb-cost", ${t(LS[2] + 0.8)});
      // ===== L3 bug 让大量验证者掉线，链继续出块，但检查点不再最终确定。
      out("#lb-fin, #lb-cost", ${t(LS[3])});
      X5.fill(tl, "mtD", ${t(LS[3] + 0.4)}, 1.6, 0.8);
      fadeIn("#chD-l3, #chD-b4", ${t(LS[3] + 1.2)}, 0.35); pop("#lb-chain", ${t(LS[3] + 1.4)});
      KIT.arm(tl, "gt", ${t(LS[3] + 2.0)}, false); pop("#lb-nofin", ${t(LS[3] + 2.5)});
      X16.sigLamp(tl, "sgD", ${t(LS[3] + 2.6)}, 2, false); pop("#lb-sg", ${t(LS[3] + 2.8)});
      // ===== L4 某个客户端占比超过三分之一，它的 bug 就能让最终性停下。
      out("#lb-chain, #lb-sg, #lb-gate, #lb-meter", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "cgD", 1.2);
      fadeIn("#shbars", ${t(LS[4] + 1.0)}); [0, 1, 2].forEach((i) => pop("#lb-c" + i, ${t(LS[4] + 1.0)} + i * 0.15));
      bar(0, 0.45, ${t(LS[4] + 1.6)}, true); bar(1, 0.3, ${t(LS[4] + 1.6)}); bar(2, 0.25, ${t(LS[4] + 1.6)});
      pop("#lb-sh1", ${t(LS[4] + 2.1)});
      [0, 1, 2].forEach((k) => KIT.led(tl, "rk0-led-" + k, ${t(LS[4] + 2.4)} + k * 0.1, "red"));
      // ===== L5 超过三分之二，它的 bug 可能把错误的链最终确定。
      out("#lb-sh1", ${t(LS[5])}); bar(0, 0.72, ${t(LS[5] + 0.2)}, true); bar(1, 0.16, ${t(LS[5] + 0.2)}); bar(2, 0.12, ${t(LS[5] + 0.2)});
      pop("#lb-sh2", ${t(LS[5] + 0.6)});
      X5.fill(tl, "mtD", ${t(LS[5] + 1.0)}, 3, 0.7); KIT.arm(tl, "gt", ${t(LS[5] + 1.4)}, true);
      out("#gt-glow", ${t(LS[5] + 1.8)}); fadeIn("#gtRed", ${t(LS[5] + 1.8)}, 0.4); out("#lb-nofin", ${t(LS[5] + 1.6)});
      pop("#lb-wrong", ${t(LS[5] + 2.0)});
      // ===== L6 所以客户端多样性，也是共识安全的一部分。
      out("#lb-wrong, #lb-sh2, #gtRed", ${t(LS[6])}); fadeIn("#gt-glow", ${t(LS[6] + 0.1)});
      [0, 1, 2].forEach((i) => bar(i, 1 / 3, ${t(LS[6] + 0.3)}));
      [0, 1, 2].forEach((k) => KIT.led(tl, "rk0-led-" + k, ${t(LS[6] + 0.6)}, "green"));
      [0, 1, 2].forEach((i) => pop("#lb-ok" + i, ${t(LS[6] + 1.0)} + i * 0.2));
      // ===== L7 2023 年 5 月，Prysm 和 Teku 处理旧投票时负载过高。
      out("#lb-ok0, #lb-ok1, #lb-ok2, #lb-c0, #lb-c1, #lb-c2, #shbars", ${t(LS[7])});
      pop("#ev-may", ${t(LS[7] + 0.1)}); pop("#ev-src", ${t(LS[7] + 0.5)});
      pop("#lb-p0", ${t(LS[7] + 0.6)}); pop("#lb-p1", ${t(LS[7] + 0.8)});
      [0, 1].forEach((r) => [0, 1, 2].forEach((k) => KIT.led(tl, "rk" + r + "-led-" + k, ${t(LS[7] + 1.4)} + r * 0.3 + k * 0.08, "red")));
      flash("#lb-p0, #lb-p1", ${t(LS[7] + 3.4)}, 2, 0.4);
      // ===== L8 主网先后约 25 分钟和约 1 小时，没有最终确定。
      X5.fill(tl, "mtD", ${t(LS[8] + 0.2)}, 1.6, 0.8); KIT.arm(tl, "gt", ${t(LS[8] + 0.6)}, false);
      pop("#lb-t25", ${t(LS[8] + 1.2)}); pop("#lb-t60", ${t(LS[8] + 2.0)});
      // ===== L9 Lighthouse 没受影响，这次没有资金损失。
      pop("#lb-p2", ${t(LS[9] + 0.1)}); flash("#rk2-led-0, #rk2-led-1, #rk2-led-2", ${t(LS[9] + 0.4)}, 2, 0.4);
      pop("#lb-nofund", ${t(LS[9] + 1.4)});
      // ===== L10 按攻击者的质押份额看，有四条线。
      out("#ev-may, #ev-src, #lb-p0, #lb-p1, #lb-p2, #lb-t25, #lb-t60, #lb-nofund", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "shareD", 1.3);
      pop("#ev-eth", ${t(LS[10] + 0.8)});
      // ===== L11 约 33%，能阻止最终性，代价是不活跃惩罚，逐步削减他的质押。
      fadeIn("#shg0", ${t(LS[11] + 0.1)}, 0.3); pop("#lb-s0", ${t(LS[11] + 0.6)});
      // ===== L12 约 34%，在能控制消息时序时，造成双重最终性，会被最大比例罚没。
      fadeIn("#shg1", ${t(LS[12] + 0.1)}, 0.3); pop("#lb-s1", ${t(LS[12] + 0.6)});
      // ===== L13 约 51%，能主导分叉选择，审查交易，做短程重组。
      fadeIn("#shg2", ${t(LS[13] + 0.1)}, 0.3); pop("#lb-s2", ${t(LS[13] + 0.6)});
      // ===== L14 约 66%，能在没有诚实方配合时，最终确定自己的链，只能靠社会层恢复。
      fadeIn("#shg3", ${t(LS[14] + 0.1)}, 0.3); pop("#lb-s3", ${t(LS[14] + 0.6)});
      // ===== L15 另一种攻击，用的是旧私钥。
      out("#ev-eth, #lb-s0, #lb-s1, #lb-s2, #lb-s3, #shg0, #shg1, #shg2, #shg3", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "rangeD", 1.3);
      grow("okey", ${t(LS[15] + 1.2)}); pop("#lb-key", ${t(LS[15] + 1.5)});
      // ===== L16 已经退出的验证者，取回了质押，不会再被罚没。
      pop("#lb-exit", ${t(LS[16] + 0.6)});
      // ===== L17 攻击者买下他们的旧私钥，从很久以前分叉，改写一段历史。
      fadeIn("#rwLine", ${t(LS[17] + 0.8)}, 0.4); grow("rw", ${t(LS[17] + 1.2)}, 0.6); pop("#lb-rw", ${t(LS[17] + 1.8)});
      // ===== L18 一直在线的节点不会接受，它不回滚已经最终确定的区块。
      pop("#lb-keep", ${t(LS[18] + 0.5)});
      // ===== L19 刚安装的新节点，要从一个可信的近期检查点开始同步。
      grow("nn", ${t(LS[19] + 0.3)}); pop("#lb-nn", ${t(LS[19] + 0.7)});
      // ===== L20 这叫弱主观性，检查点的来源，就是新节点的信任入口。
      pop("#lb-trust", ${t(LS[20] + 1.2)});
      // ===== L21 所以检查点要取自至少两个独立来源，再做比对。
      grow("cp0", ${t(LS[21] + 0.3)}); grow("cp1", ${t(LS[21] + 0.6)}); pop("#lb-cp0", ${t(LS[21] + 0.7)}); pop("#lb-cp1", ${t(LS[21] + 1.0)});
      grow("mag", ${t(LS[21] + 1.3)});
      tl.to("#magMv", { x: -150, duration: 0.6, ease: "power1.inOut" }, ${t(LS[21] + 1.6)});
      tl.to("#magMv", { x: 150, duration: 1.0, ease: "power1.inOut" }, ${t(LS[21] + 2.2)});
      tl.to("#magMv", { x: 0, duration: 0.5, ease: "power1.inOut" }, ${t(LS[21] + 3.2)});
      pop("#lb-same", ${t(LS[21] + 3.6)});
`,
});
