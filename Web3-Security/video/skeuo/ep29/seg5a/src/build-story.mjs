// seg5a「⑤ 怎么守」— 示例架构 + 四个重点。node src/build-story.mjs → compositions/story.html
import fs from "node:fs";
import { at, Wp, f, camAt, worldSvg, gridSvg, wlab, dashCurve, badgeSvg, kitCss, runtimeJs } from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import * as X from "./objects5a.mjs";

const T = JSON.parse(fs.readFileSync(new URL("../timing.json", import.meta.url), "utf8"));
const TOTAL = T.total;

// ------------------------------------------------------------------ layout (world u,v)
const SP = 480;
const uS = (i) => SP * i;
const P = (u, v) => ({ u, v });
const W = (u, v, z = 0) => Wp(u, v, z);

const statics = []; // {Y, svg}
const add = (r, o) => { statics.push({ Y: W(o.u, o.v)[1], svg: r.svg }); return r; };

// checkpoints (seg2 road) — booth at v −146, road centre v 62
const GATES = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const cps = GATES.map((_, i) => add(O.checkpoint(P(uS(i), 0), { id: `cp${i}`, n: NUM[i], road: false }), P(uS(i), 0)));

// devices (grow in place of the checkpoints)
const dev = {};
dev.db = add(O.dbLedger(P(uS(0), -150), { id: "d-db" }), P(uS(0), -150));
dev.is = add(O.hsm(P(uS(1), -150), { id: "d-is" }), P(uS(1), -150));
dev.pe = add(O.shield(P(uS(2), -150), { id: "d-pe" }), P(uS(2), -150));
dev.apP = add(O.person(P(uS(3) - 70, -190), { id: "d-apP", role: "signer", scale: 1.0 }), P(uS(3) - 70, -190));
dev.ap = add(X.approveBtn(P(uS(3) + 50, -140), { id: "d-ap" }), P(uS(3) + 50, -140));
dev.r1 = add(O.rack(P(uS(4) - 95, -165), { id: "d-r1", tag: "MPC A" }), P(uS(4) - 95, -165));
dev.r2 = add(O.rack(P(uS(4) + 95, -165), { id: "d-r2", tag: "MPC B" }), P(uS(4) + 95, -165));
dev.br = add(O.tower(P(uS(5), -150), { id: "d-br" }), P(uS(5), -150));
dev.ch = add(O.chain(P(uS(6), -150), { id: "d-ch", n: 3 }), P(uS(6), -150));
// independent monitoring (behind the right end)
const MON = P(2420, -720), BEA = P(2250, -800);
dev.mc = add(X.cctv(MON, { id: "d-mc" }), MON);
dev.mb = add(O.beacon(BEA, { id: "d-mb" }), BEA);

// L2 forbidden route
const DESK = P(1280, -820), WALL = P(1600, -520);
const desk = add(O.desk(DESK, { id: "desk" }), DESK);
const wall = add(X.wall(WALL, { id: "fw", len: 260, h: 150 }), WALL);

// P1 ledger binding — barrier in front of the signing cluster
const BAR1 = P(1650, 0);
const bar1 = add(X.barrier(BAR1, { id: "bar1" }), BAR1);
const FL1 = P(1500, 330);
const fl1 = add(X.flag(FL1, { id: "fl1" }), FL1);

// P2 policy engine
const SAFE = P(1180, 470), GRD = P(1000, 470);
const safe1 = add(O.safe(SAFE, { id: "sf", plate: "SAFE", gold: true }), SAFE);
const bar2 = add(X.barrier(GRD, { id: "bar2", armUp: false }), GRD);
const hw1 = add(O.hotWallet(SAFE, { id: "hw1" }), SAFE);
const FL2 = P(420, 400), FL3 = P(300, 610);
const fl2 = add(X.flag(FL2, { id: "fl2" }), FL2);
const fl3 = add(X.flag(FL3, { id: "fl3" }), FL3);
const MAG2 = P(760, 200);
const mag2 = add(O.magnifier(MAG2, { id: "mag2", z: 10 }), MAG2);

// P3 per-chain breakers (front, between tower and chain; scaled 0.65)
const SWS = 0.65;
const scaled = (r, o, s) => { const [ox, oy] = at(o); const sc = (q) => [f(ox + (q[0] - ox) * s), f(oy + (q[1] - oy) * s)];
  return { svg: `<g transform="translate(${f(ox)},${f(oy)}) scale(${s}) translate(${f(-ox)},${f(-oy)})">${r.svg}</g>`, anchors: Object.fromEntries(Object.entries(r.anchors).map(([k, v]) => [k, Array.isArray(v) && typeof v[0] === "number" ? sc(v) : v])) }; };
const SWU = [2500, 2720, 2940], SWV = 420;
const sws = SWU.map((u, i) => add(scaled(O.knifeSwitch(P(u, SWV), { id: `sw${i}`, text: ["以太坊", "比特币", "Solana"][i] }), P(u, SWV), SWS), P(u, SWV)));
const CBOX = P(3250, 470);
const cbox = add(X.ctrlBox(CBOX, { id: "cbox" }), CBOX);

// P4 emergency revocation (in front of the chain)
const HW2 = P(2560, 900), ATK = P(2910, 900);
const hw2 = add(O.hotWallet(HW2, { id: "hw2" }), HW2);
const atk = add(X.atkCode(ATK, { id: "atkc" }), ATK);
const rch = X.redChain(P(0, 0), [HW2.u + 95, HW2.v + 20, 150], [ATK.u - 52, ATK.v, 70], 5, { id: "rch" });
statics.push({ Y: W(2740, 900)[1] + 1, svg: rch.svg });
const KEY = P(2330, 1180), BGL = P(2240, 1020), CAL = P(2860, 1180), STW = P(3080, 1080), MAG4 = P(2760, 1080);
const key4 = add(O.key(KEY, { id: "key4", stand: true, state: "broken", ghost: 0.4 }), KEY);
const bgl = add(X.breakGlass(BGL, { id: "bgl" }), BGL);
const cal = add(X.calendar(CAL, { id: "cal" }), CAL);
const stw = add(X.stopwatch(STW, { id: "stw" }), STW);
const mag4 = add(O.magnifier(MAG4, { id: "mag4", z: 60 }), MAG4);

// P5 limits — three-key cabinet
const LCK = P(1720, 800), A1 = P(1540, 960), A2 = P(1890, 1000), A3 = P(1990, 900);
const lck = add(X.lockPanel(LCK, { id: "lk" }), LCK);
const at1 = add(O.person(A1, { id: "at1", role: "attacker", scale: 1.0 }), A1);
const at2 = add(O.person(A2, { id: "at2", role: "attacker", scale: 1.0 }), A2);
const at3 = add(O.person(A3, { id: "at3", role: "attacker", scale: 1.0 }), A3);

// ------------------------------------------------------------------ moving props (fx layer, on top)
// each built at its STOP position; the wrapper starts offset by (start − stop)
const movers = [];
const mover = (id, r, stopO, startO) => {
  const off = startO ? [f(W(startO.u, startO.v)[0] - W(stopO.u, stopO.v)[0]), f(W(startO.u, startO.v)[1] - W(stopO.u, stopO.v)[1])] : [0, 0];
  movers.push({ Y: W(stopO.u, stopO.v)[1], svg: `<g id="${id}" transform="translate(${off[0]},${off[1]})" opacity="0">${r.svg}${badgeSvg(id + "-x", r.anchors.center ? [r.anchors.center[0], r.anchors.center[1] - 30] : at(stopO, 0, 0, 40), 26, 0)}</g>` });
  return { r, off };
};
const dOff = (a, b) => [f(W(a.u, a.v)[0] - W(b.u, b.v)[0]), f(W(a.u, a.v)[1] - W(b.u, b.v)[1])];
// P1
const D1S = P(1760, 62), ROAD0 = P(1280, 62), D2S = P(1520, 62);
const d1 = mover("mv-d1", O.doc(D1S, { id: "d1", w: 150, h: 190, title: "提现单" }), D1S, ROAD0);
const d2 = mover("mv-d2", O.doc(D2S, { id: "d2", w: 150, h: 190, title: "提现单" }), D2S, ROAD0);
const e1 = mover("mv-e1", O.envelope(D2S, { id: "e1", state: "attacker" }), D2S, ROAD0);
// P2
const E2S = P(880, 62), ROAD2 = P(600, 62);
const e2 = mover("mv-e2", O.envelope(E2S, { id: "e2" }), E2S, ROAD2);
const e3 = mover("mv-e3", O.envelope(E2S, { id: "e3", state: "attacker" }), E2S, ROAD2);
const d3 = mover("mv-d3", O.doc(E2S, { id: "d3", w: 150, h: 190, title: "授权" }), E2S, ROAD2);
const BOUNCE = P(640, 160);
// P4
const D4S = P(2560, 1100), D4A = P(2300, 640);
const d4 = mover("mv-d4", O.doc(D4S, { id: "d4", w: 150, h: 190, title: "新授权" }), D4S, D4A);
// P3 gold bars flowing out of chain A
const golds = [0, 1, 2, 3, 4, 5].map((k) => mover(`mv-g${k}`, X.goldBar(P(SWU[0], SWV + 70), { id: `gb${k}` }), P(SWU[0], SWV + 70)));
const GOLD_END = dOff(P(SWU[0] - 60, SWV + 520), P(SWU[0], SWV + 70));

// ------------------------------------------------------------------ lines
const lines = [];
const deskA = desk.anchors.screen, wallP = at(WALL, 0, 0, 120);
const ln1 = dashCurve("ln-dev", [deskA[0] + 30, deskA[1] + 40], wallP, { c1: [deskA[0] + 60, deskA[1] + 120], c2: [wallP[0] - 40, wallP[1] - 60] });
lines.push(ln1.svg);
const monA = at(MON, -60, 0, 270);
const ln2 = dashCurve("ln-m1", monA, dev.br.anchors.tip ?? at(P(uS(5), -150), 0, 0, 300), { color: "#2aa3c9", c1: [monA[0] - 120, monA[1] - 120], c2: [W(uS(5), -150, 380)[0] + 120, W(uS(5), -150, 380)[1] - 80] });
const rTop = at(P(uS(4) + 95, -165), 0, 0, 340);
const ln3 = dashCurve("ln-m2", monA, rTop, { color: "#2aa3c9", c1: [monA[0] - 300, monA[1] - 330], c2: [rTop[0] + 260, rTop[1] - 260] });
lines.push(ln2.svg, ln3.svg);
const cp = cbox.anchors.port;
const swLines = sws.map((s, i) => { const tgt = at(P(SWU[i], SWV), 0, 10, 330 * SWS); const c = dashCurve(`ln-s${i}`, cp, tgt, { color: "#1d93ba", c1: [cp[0] - 80, cp[1] + 60 + i * 10], c2: [tgt[0] + 60, tgt[1] + 70] }); lines.push(c.svg); return c; });
const bgA = at(BGL, 0, 0, 160), hwA = at(HW2, -60, 0, 120);
const ln4 = dashCurve("ln-bg", bgA, hwA, { color: "#1d93ba", c1: [bgA[0] + 60, bgA[1] - 140], c2: [hwA[0] - 120, hwA[1] - 120] });
lines.push(ln4.svg);
const wallX = badgeSvg("fw-x", [wallP[0], wallP[1] - 10], 30, 0);

// ------------------------------------------------------------------ world svg
const FLOOR = X.floor(P(0, 0), -420, 3500, -1000, 1340, "floor");
const ROAD = `<g id="road">${X.road(P(0, 0), -380, 3460)}</g>`;
const objSvg = statics.slice().sort((a, b) => a.Y - b.Y).map((s) => s.svg).join("\n");
const fxSvg = movers.slice().sort((a, b) => a.Y - b.Y).map((m) => m.svg).join("\n");
const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 7000, v0: -4000, v1: 5000 }) + `<g id="floor-w" opacity="0">${FLOOR}</g>` + ROAD + objSvg + lines.join("") + wallX + fxSvg, [-1600, -2400, 6600, 4200]);

// ------------------------------------------------------------------ labels (world, counter-scaled)
let L = "";
const lab = (id, p, html, cls = "", anchor = "b") => { L += wlab(id, p, html, cls + " hide", anchor); };
GATES.forEach((g, i) => { L += wlab(`lb-cp${i}`, cps[i].anchors.top, `<span class="gn">${NUM[i]}</span>${g}`, "lab-g", "b"); });
lab("lb-db", dev.db.anchors.top, "账本");
lab("lb-is", dev.is.anchors.top, "意图签发");
lab("lb-pe", dev.pe.anchors.top, "策略引擎");
lab("lb-ap", at(P(uS(3), -150), 0, 0, 250), "审批");
lab("lb-sg", at(P(uS(4), -165), 0, 0, 380), "签名集群");
lab("lb-br", dev.br.anchors.top, "广播");
lab("lb-ch", dev.ch.anchors.top, "链上", "", "l");
lab("lb-mon", at(MON, -60, 0, 360), "独立监控");
lab("lb-desk", desk.anchors.top, "开发电脑");
lab("lb-forbid", wall.anchors.top, "禁止：没有网络路由", "lab-rs", "b");
// P1
lab("lb-d1", d1.r.anchors.top, "提现单 #1024");
lab("lb-d2", d2.r.anchors.top, "同一张 #1024");
lab("lb-e1", e1.r.anchors.top, "伪造的提现指令", "lab-rs");
const FLAG = (who, what) => `<div class="fl-l1"><span class="ok">✓ 挡住</span></div><div class="fl-l2">${who} · <span class="what">${what}</span></div>`;
lab("lb-fl1", fl1.anchors.tip, FLAG("Bitget", "伪造指令"), "lab-flag", "l");
// P2
lab("lb-desc", at(E2S, 40, 180, 50), "上游描述：普通提现", "lab-g strike", "l");
lab("lb-raw", at(E2S, 40, 180, -40), "原始待签字节 <span class='mono'>0x02f8…</span>", "lab-ink", "l");
lab("lb-e3", e3.r.anchors.top, "Bybit · operation = 1", "lab-rs");
lab("lb-d3", d3.r.anchors.top, "EIP-7702 授权", "lab-r");
lab("lb-sf", safe1.anchors.top, "Safe 多签");
lab("lb-grd", at(GRD, -40, 260, 0), "Guard 合约 · 链上再拒", "lab-cs", "t");
lab("lb-hw1", hw1.anchors.top, "热钱包");
lab("lb-fl2", fl2.anchors.tip, FLAG("Bybit", "operation = 1"), "lab-flag", "l");
lab("lb-fl3", fl3.anchors.tip, `<div class="fl-l1"><span class="ok ip">解读</span>如果覆盖这一条</div><div class="fl-l2">Binance · <span class="what">那批委托签不出来</span></div>`, "lab-flag lab-interp", "l");
lab("lb-fs1", fl1.anchors.tip, `<span class="ok">✓ 挡住</span>Bitget`, "lab-flag lab-fs", "l");
lab("lb-fs2", fl2.anchors.tip, `<span class="ok">✓ 挡住</span>Bybit`, "lab-flag lab-fs", "l");
lab("lb-fs3", fl3.anchors.tip, `<span class="ok ip">解读</span>Binance`, "lab-flag lab-fs lab-interp", "l");
// P3
const SWN = ["以太坊", "比特币", "Solana"];
sws.forEach((s, i) => { lab(`lb-sw${i}`, s.anchors.top, SWN[i]); lab(`lb-swo${i}`, s.anchors.top, SWN[i], "lab-rs"); });
lab("lb-out", at(P(SWU[0] - 120, SWV + 330), 0, 0, 40), "以太坊 · 流出异常", "lab-rs", "r");
lab("lb-noord", at(P(SWU[0] - 170, SWV), 0, 0, 160), "账本里没有对应订单的流出", "lab-r", "r");
lab("lb-allstop", at(P(SWU[0] - 170, SWV), 0, 0, 160), "所有链一起停", "lab-rs", "r");
lab("lb-cbox", cbox.anchors.top, "独立通道", "lab-cs", "b");
lab("lb-cbox2", at(CBOX, 0, 0, 0), "不依赖被攻击的系统", "lab-g", "t");
// P4
lab("lb-hw2", hw2.anchors.top, "热钱包", "", "r");
lab("lb-deleg", rch.anchors.mid, "7702 委托 → 攻击者代码", "lab-rs");
lab("lb-d4", at(D4S, 0, 0, 40), "新授权：委托地址 = 零地址", "", "t");
lab("lb-clear", rch.anchors.mid, "委托已清掉 ✓", "lab-gs");
lab("lb-key", key4.anchors.top, "MPC：没有一把单独私钥", "lab-r");
lab("lb-bg", bgl.anchors.top, "独立撤销路径", "lab-cs");
lab("lb-pre", at(BGL, 0, 0, 0), "预先批准", "lab-gs", "t");
lab("lb-cal", cal.anchors.top, "每季度演练");
lab("lb-stw", stw.anchors.top, "记录用时");
lab("lb-code", at(MAG4, 0, 0, 330), "账户代码", "", "b");
lab("lb-empty", at(MAG4, 0, 0, 330), "结果：空 ✓", "lab-gs", "b");
// P5
lab("lb-at1", [lck.anchors.keys[0][0] - 20, lck.anchors.keys[0][1] - 150], "一个人打不开", "lab-r", "r");
lab("lb-lim", lck.anchors.top, "挡不住所有内部人", "lab-g");
lab("lb-coll", at(LCK, 0, 170, 0), "单人作恶 → 需要多人共谋", "lab-rs", "t");

// ------------------------------------------------------------------ cameras
const K = (p, sx, sy, k) => camAt(p, sx, sy, k);
const CAM = {
  wide: K([1490, -548], 960, 515, 0.54),
  l2: K(W(1600, -500, 120), 960, 560, 0.8),
  p1: K(W(1650, 40, 80), 1240, 600, 0.98),
  p2: K(W(800, 250, 80), 1150, 560, 0.85),
  p3: K(W(2700, 430, 120), 1080, 560, 1.05),
  p4: K(W(2620, 1000, 100), 1000, 560, 1.0),
  p5: K(W(1760, 880, 130), 960, 580, 1.05),
};

// ------------------------------------------------------------------ html
const row = (id, inner, extra = "") => `<div class="c-row dim ${extra}" id="${id}">${inner}</div>`;
const ledgerCard = `<div class="k-code card hide" id="card-l">
  <div class="c-head">账本 · 提现单 #1024<span class="c-tag">独立存储</span></div>
  ${row("lr0", `存在于账本<b class="ok">✓</b>`)}
  ${row("lr1", `状态 = 已批准<b class="ok">✓</b>`)}
  ${row("lr2", `金额一致<b class="ok">✓</b>`)}
  ${row("lr3", `已签名？<span id="lr3-no" class="v">否</span><span id="lr3-yes" class="v hide">是 · 同一单只签一次</span>`)}
  ${row("lr4", `目标、金额 ← <span class="mono">parse(原始交易)</span>`, "sep")}
  ${row("lr5", `<s>上游写的描述</s><span class="v">不读</span>`)}
  ${row("lr6", `伪造指令：账本查无此单<b class="no">✗</b>`)}
</div>`;
const rulesCard = `<div class="k-code card hide" id="card-r">
  <div class="c-head">策略规则表<span class="c-tag">默认拒绝</span></div>
  ${row("rr0", `没有明确规则的类型 → <b class="red">拒签</b>`)}
  ${row("rr1", `Safe 多签：<span class="mono">operation</span> 只允许 <span class="mono">0</span>`)}
  ${row("rr2", `<span class="mono">operation = 1</span> → 只能指向 <span class="mono">MultiSendCallOnly</span>`)}
  ${row("rr3", `链上 Guard 合约再拒一次`)}
  ${row("rr4", `热钱包：EIP-7702 授权 → <b class="red">一律拒签</b>`)}
</div>`;
const heads = [["", "四个重点"], ["1", "账本绑定签名"], ["2", "策略读原始字节 · 默认拒绝"], ["3", "分链熔断"], ["4", "紧急撤销"], ["", "局限"]];
const headHtml = heads.map(([n, t], i) => `<div class="hd hide" id="hd${i}">${n ? `<span class="hd-n">重点${"一二三四"[+n - 1]}</span>` : ""}${t}</div>`).join("");

// ------------------------------------------------------------------ timeline script (browser)
const wt = (line, text, nth = 0) => { const ws = T.words.filter((w) => w.line === line && w.text.startsWith(text)); if (!ws[nth]) throw new Error(`word ${line}:${text}`); return Math.round(ws[nth].start * 100) / 100; };
const tw = {
  arch: wt(0, "架构"), example: wt(0, "示例"),
  db: wt(1, "账本"), is: wt(1, "意图"), pe: wt(1, "策略"), ap: wt(1, "审批"), sg: wt(1, "签名"), br: wt(1, "广播"), ch: wt(1, "链"), mon: wt(1, "独立"), mon2: wt(1, "监控"),
  dev: wt(2, "开发"), sg2: wt(2, "签名"), zhe: wt(2, "这"), forbid: wt(2, "禁止"), net: wt(2, "网络"),
  four: wt(3, "四"), first: wt(3, "第一"),
  exist: wt(4, "存在"), state: wt(4, "状态"), amt: wt(4, "金额"), signed: wt(4, "签名", 1), same: wt(4, "同"), once: wt(4, "只能"), ledger4: wt(4, "账本"),
  target: wt(5, "目标"), parse: wt(5, "解析"), notread: wt(5, "不"), forge: wt(5, "伪造"), here5: wt(5, "这里"), dui: wt(5, "对"),
  second: wt(6, "第二"), read6: wt(6, "读"), raw6: wt(6, "原始"), deny: wt(6, "默认"), norule: wt(6, "没有"), never: wt(6, "一律"),
  safe7: wt(7, "Safe"), op7: wt(7, "operation"), zero7: wt(7, "等于"),
  one8: wt(8, "1"), multi8: wt(8, "批量"), guard8: wt(8, "Guard"), lan8: wt(8, "拦"),
  bybit: wt(9, "Bybit"), op9: wt(9, "operation"), here9: wt(9, "这里"), rej9: wt(9, "拒绝"),
  hot10: wt(10, "热钱包"), eip10: wt(10, "EIP"), auth10: wt(10, "授权"), never10: wt(10, "一律"), rej10: wt(10, "拒签"), bin10: wt(10, "Binance"),
  third: wt(11, "第三"), cb11: wt(11, "熔断"), some11: wt(11, "某"), out11: wt(11, "流出"), abn11: wt(11, "异常"), stop11: wt(11, "停"),
  find12: wt(12, "发现"), noord12: wt(12, "对应"), all12: wt(12, "所有"), stop12: wt(12, "停"), sw12: wt(12, "开关"), dep12: wt(12, "依赖"),
  fourth: wt(13, "四"), rev13: wt(13, "撤销"), d7702: wt(13, "7702"), deleg13: wt(13, "委托"), new13: wt(13, "新"), addr13: wt(13, "委托", 1), zero13: wt(13, "零"), clear13: wt(13, "清掉"),
  mpc14: wt(14, "MPC"), key14: wt(14, "私钥"), path14: wt(14, "一条"), rev14: wt(14, "撤销"), pre14: wt(14, "预先"), drill14: wt(14, "演练"), q14: wt(14, "季度"), time14: wt(14, "记"),
  check15: wt(15, "查"), code15: wt(15, "账户"), empty15: wt(15, "空"),
  lim16: wt(16, "局限"), arch16: wt(16, "架构"), insider16: wt(16, "内部"), one16: wt(16, "一个"), multi16: wt(16, "多"), coll16: wt(16, "共谋"),
};
const OFF = { d1: d1.off, d2: d2.off, e1: e1.off, e2: e2.off, e3: e3.off, d3: d3.off, d4: d4.off, bounce: dOff(BOUNCE, E2S), gold: GOLD_END, d1in: dOff(P(1860, -90), D1S) };

const script = `
(function () {
  const TW = ${JSON.stringify(tw)};
  const CAM = ${JSON.stringify(CAM)};
  const OFF = ${JSON.stringify(OFF)};
  const tl = gsap.timeline({ paused: true });
  const $ = (id) => document.getElementById(id);
  KIT.camSet(tl, CAM.wide);
  // ---- helpers -------------------------------------------------------------
  const org = (id) => { const g = $(id); return g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"); };
  const hidden = new Set();
  function hideObj(id) { tl.set("#" + id, { scaleY: 0, svgOrigin: org(id) }, 0); }
  function growIn(id, t, d) { tl.fromTo("#" + id, { scaleY: 0, svgOrigin: org(id) }, { scaleY: 1, svgOrigin: org(id), duration: d || 0.45, ease: "back.out(1.4)", immediateRender: false }, t); }
  function sinkOut(id, t, d) { tl.fromTo("#" + id, { scaleY: 1, svgOrigin: org(id) }, { scaleY: 0, svgOrigin: org(id), duration: d || 0.3, ease: "power2.in", immediateRender: false }, t); }
  function show(sel, t, d) { tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t); }
  function hide(sel, t, d) { tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power1.in" }, t); }
  const pos = {};
  function fly(id, t, dur, from, to, lift, ease) {
    const el = $(id), o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      const k = o.k, x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k - (lift || 0) * 4 * k * (1 - k);
      el.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
    } }, t);
  }
  const Z = [0, 0];
  function lit(sel, t) { tl.fromTo(sel, { opacity: 0.16 }, { opacity: 1, duration: 0.3, ease: "power1.out", immediateRender: false }, t); tl.fromTo(sel, { backgroundColor: "rgba(42,163,201,0.16)" }, { backgroundColor: "rgba(42,163,201,0)", duration: 0.9, ease: "power1.out", immediateRender: false }, t); }

  // ---- objects that appear later start sunk
  ["d-db","d-is","d-pe","d-apP","d-ap","d-r1","d-r2","d-br","d-ch","d-mc","d-mb","desk","fw","bar1","fl1","sf","bar2","hw1","fl2","fl3","mag2",
   "sw0","sw1","sw2","cbox","hw2","atkc","key4","bgl","cal","stw","mag4","lk","at1","at2","at3"].forEach(hideObj);
  tl.set("#rch", { opacity: 0 }, 0);

  // ---- 0–1.6 title card, then the road
  tl.fromTo("#ttl", { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.86, duration: 0.45, ease: "power2.in", immediateRender: false }, 1.55);
  show("#note0", TW.example, 0.3);
  show("#floor-w", TW.arch, 0.6);

  // ---- L1 upgrade: each checkpoint sinks, its device grows
  const UP = [["cp0", ["d-db"], "lb-db", TW.db], ["cp1", ["d-is"], "lb-is", TW.is], ["cp2", ["d-pe"], "lb-pe", TW.pe], ["cp3", ["d-apP", "d-ap"], "lb-ap", TW.ap],
    ["cp4", ["d-r1", "d-r2"], "lb-sg", TW.sg], ["cp5", ["d-br"], "lb-br", TW.br], ["cp6", ["d-ch"], "lb-ch", TW.ch]];
  UP.forEach(([cp, ds, lb, t]) => {
    sinkOut(cp, t - 0.1, 0.28); hide("#lb-" + cp, t - 0.1, 0.2);
    ds.forEach((d, k) => growIn(d, t + 0.2 + k * 0.12));
    KIT.pop(tl, "#" + lb, t + 0.45);
  });
  growIn("d-mc", TW.mon); growIn("d-mb", TW.mon + 0.15); KIT.pop(tl, "#lb-mon", TW.mon + 0.4);
  KIT.draw(tl, "ln-m1", TW.mon2 + 0.1, 0.7); KIT.draw(tl, "ln-m2", TW.mon2 + 0.3, 0.7);
  KIT.beacon(tl, "d-mb", TW.mon2, 1.4, 0.7);

  // ---- L2 forbidden route
  KIT.cam(tl, TW.dev - 0.1, CAM.l2, 1.0);
  growIn("desk", TW.dev + 0.1); KIT.pop(tl, "#lb-desk", TW.dev + 0.4);
  KIT.draw(tl, "ln-dev", TW.sg2, 0.9);
  growIn("fw", TW.zhe - 0.3);
  KIT.pop(tl, "#fw-x", TW.forbid); KIT.pop(tl, "#lb-forbid", TW.net);

  // ---- L3 four key points
  hide("#note0", TW.four - 0.3, 0.3);
  KIT.pop(tl, "#hd0", TW.four);
  KIT.cam(tl, TW.first, CAM.p1, 1.1);
  hide("#hd0", TW.first, 0.2); KIT.pop(tl, "#hd1", TW.first + 0.2);
  growIn("bar1", TW.first + 0.9);
  hide("#lb-desk,#lb-forbid,#lb-mon,#lb-db,#lb-is,#lb-ap,#lb-pe,#lb-br,#lb-ch", TW.first, 0.3);

  // ---- L4 ledger-bound signing
  show("#mv-d1", TW.ledger4 - 1.2, 0.2); fly("mv-d1", TW.ledger4 - 1.2, 1.0, OFF.d1, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-d1", TW.ledger4 - 0.2);
  KIT.pop(tl, "#card-l", TW.ledger4, 0.3);
  lit("#lr0", TW.exist); lit("#lr1", TW.state); lit("#lr2", TW.amt); lit("#lr3", TW.amt + 0.6);
  tl.fromTo("#d1-stampmark", { opacity: 0, scale: 1.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, TW.signed);
  KIT.swap(tl, "#lr3-no", "#lr3-yes", TW.signed + 0.1, 0.2);
  hide("#lb-d1", TW.signed + 0.3);
  fly("mv-d1", TW.signed + 0.4, 0.6, Z, OFF.d1in, 60, "power2.in"); hide("#mv-d1", TW.signed + 0.8, 0.2);
  show("#mv-d2", TW.same - 0.2, 0.2); fly("mv-d2", TW.same - 0.2, 0.9, OFF.d2, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-d2", TW.same + 0.5);
  KIT.arm(tl, "bar1", TW.once - 0.2, false, 0.45);
  tl.to("#lr3", { backgroundColor: "#fdeae7", duration: 0.2 }, TW.once);
  KIT.pop(tl, "#mv-d2-x", TW.once + 0.2);
  hide("#lb-d2", TW.once + 1.0); hide("#mv-d2", TW.once + 1.1, 0.3);
  tl.to("#lr3", { backgroundColor: "rgba(253,234,231,0)", duration: 0.3 }, TW.target);
  KIT.arm(tl, "bar1", TW.target, true, 0.6);
  // L5
  lit("#lr4", TW.parse); lit("#lr5", TW.notread);
  show("#mv-e1", TW.forge - 0.3, 0.2); fly("mv-e1", TW.forge - 0.3, 0.9, OFF.e1, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-e1", TW.forge + 0.5);
  lit("#lr6", TW.here5);
  KIT.arm(tl, "bar1", TW.here5, false, 0.45);
  KIT.pop(tl, "#mv-e1-x", TW.dui);
  growIn("fl1", TW.dui + 0.2); KIT.pop(tl, "#lb-fl1", TW.dui + 0.55);

  // ---- L6–L10 policy engine
  KIT.cam(tl, TW.second, CAM.p2, 1.1);
  hide("#lb-sg,#lb-fl1,#mv-e1", TW.second, 0.2); KIT.pop(tl, "#lb-pe", TW.second + 0.6);
  hide("#card-l", TW.second - 0.2, 0.3); hide("#hd1", TW.second, 0.2); KIT.pop(tl, "#hd2", TW.second + 0.2);
  hide("#lb-e1", TW.dui + 0.4, 0.2);
  show("#mv-e2", TW.second + 0.4, 0.2); fly("mv-e2", TW.second + 0.4, 0.9, OFF.e2, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-desc", TW.read6);
  tl.fromTo("#lb-desc", { opacity: 1 }, { opacity: 0.45, duration: 0.3, immediateRender: false }, TW.raw6 + 0.4);
  growIn("mag2", TW.raw6); KIT.pop(tl, "#lb-raw", TW.raw6 + 0.35);
  KIT.pop(tl, "#card-r", TW.deny, 0.3);
  lit("#rr0", TW.norule);
  KIT.pop(tl, "#mv-e2-x", TW.never);
  hide("#lb-desc,#lb-raw", TW.never + 0.5, 0.25); hide("#mv-e2", TW.never + 0.7, 0.3); sinkOut("mag2", TW.never + 0.6, 0.3);
  // L7–L8 Safe
  growIn("sf", TW.safe7); KIT.pop(tl, "#lb-sf", TW.safe7 + 0.4);
  lit("#rr1", TW.op7);
  lit("#rr2", TW.one8);
  growIn("bar2", TW.guard8 - 0.3); KIT.pop(tl, "#lb-grd", TW.guard8 + 0.2); lit("#rr3", TW.guard8);
  // L9 Bybit
  show("#mv-e3", TW.bybit - 0.2, 0.2); fly("mv-e3", TW.bybit - 0.2, 0.9, OFF.e3, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-e3", TW.op9);
  tl.to("#rr2", { backgroundColor: "#fdeae7", duration: 0.2 }, TW.op9 + 0.3);
  hide("#lb-e3", TW.here9 - 0.1, 0.15);
  fly("mv-e3", TW.here9, 0.6, Z, OFF.bounce, 90, "power2.out");
  KIT.pop(tl, "#mv-e3-x", TW.rej9);
  tl.to("#rr2", { backgroundColor: "rgba(253,234,231,0)", duration: 0.3 }, TW.rej9 + 0.6);
  growIn("fl2", TW.rej9 + 0.1); KIT.pop(tl, "#lb-fl2", TW.rej9 + 0.4);
  // L10 hot wallet + 7702
  hide("#mv-e3", TW.hot10 - 0.5, 0.3);
  sinkOut("sf", TW.hot10 - 0.4); sinkOut("bar2", TW.hot10 - 0.4); hide("#lb-sf,#lb-grd", TW.hot10 - 0.4, 0.2);
  growIn("hw1", TW.hot10); KIT.pop(tl, "#lb-hw1", TW.hot10 + 0.4);
  show("#mv-d3", TW.eip10 - 0.1, 0.2); fly("mv-d3", TW.eip10 - 0.1, 0.9, OFF.d3, Z, 0, "power2.out");
  KIT.pop(tl, "#lb-d3", TW.auth10);
  lit("#rr4", TW.never10);
  KIT.pop(tl, "#mv-d3-x", TW.rej10);
  hide("#lb-d3", TW.rej10 + 0.6); hide("#mv-d3", TW.rej10 + 0.7, 0.3);
  growIn("fl3", TW.bin10 - 0.3); KIT.pop(tl, "#lb-fl3", TW.bin10);

  // ---- L11–L12 per-chain breakers
  KIT.cam(tl, TW.third, CAM.p3, 1.1);
  hide("#card-r", TW.third - 0.2, 0.3); hide("#hd2", TW.third, 0.2); KIT.pop(tl, "#hd3", TW.third + 0.2);
  hide("#lb-hw1,#lb-pe,#lb-fl1,#lb-fl2,#lb-fl3", TW.third, 0.2); sinkOut("hw1", TW.third + 0.2);
  [0, 1, 2].forEach((i) => { growIn("sw" + i, TW.cb11 + i * 0.16); KIT.pop(tl, "#lb-sw" + i, TW.cb11 + 0.4 + i * 0.16); });
  for (let k = 0; k < 6; k++) {
    const t = TW.some11 + 0.1 + k * 0.28;
    show("#mv-g" + k, t, 0.08); fly("mv-g" + k, t, 0.75, Z, OFF.gold, 30, "power1.in"); hide("#mv-g" + k, t + 0.62, 0.12);
  }
  KIT.pop(tl, "#lb-out", TW.abn11);
  KIT.toggle(tl, "sw0", TW.stop11, false, 0.5);
  KIT.swap(tl, "#lb-sw0", "#lb-swo0", TW.stop11 + 0.4, 0.2);
  hide("#lb-out", TW.stop11 + 0.5);
  KIT.pop(tl, "#lb-noord", TW.noord12);
  KIT.toggle(tl, "sw1", TW.all12 + 0.1, false, 0.5); KIT.toggle(tl, "sw2", TW.all12 + 0.25, false, 0.5);
  KIT.swap(tl, "#lb-sw1", "#lb-swo1", TW.all12 + 0.5, 0.2); KIT.swap(tl, "#lb-sw2", "#lb-swo2", TW.all12 + 0.65, 0.2);
  KIT.swap(tl, "#lb-noord", "#lb-allstop", TW.stop12, 0.2);
  growIn("cbox", TW.sw12 - 0.4);
  [0, 1, 2].forEach((i) => KIT.draw(tl, "ln-s" + i, TW.sw12 + i * 0.12, 0.6));
  KIT.pop(tl, "#lb-cbox", TW.sw12 + 0.3); KIT.pop(tl, "#lb-cbox2", TW.dep12);

  // ---- L13–L15 emergency revocation
  KIT.cam(tl, TW.fourth - 0.1, CAM.p4, 1.1);
  hide("#hd3", TW.fourth, 0.2); KIT.pop(tl, "#hd4", TW.fourth + 0.2);
  hide("#lb-allstop,#lb-cbox,#lb-cbox2", TW.fourth, 0.25);
  growIn("hw2", TW.rev13); KIT.pop(tl, "#lb-hw2", TW.rev13 + 0.4);
  growIn("atkc", TW.d7702 - 0.4);
  for (let i = 0; i < 5; i++) tl.fromTo("#rch-" + i, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, TW.d7702 + i * 0.1);
  tl.set("#rch", { opacity: 1 }, TW.d7702 - 0.01);
  KIT.pop(tl, "#lb-deleg", TW.deleg13);
  show("#mv-d4", TW.new13 - 0.4, 0.2); fly("mv-d4", TW.new13 - 0.4, 0.9, OFF.d4, Z, 60, "power2.out");
  KIT.pop(tl, "#lb-d4", TW.addr13);
  hide("#lb-deleg", TW.clear13 - 0.3, 0.2);
  for (let i = 0; i < 5; i++) tl.to("#rch-" + i, { opacity: 0, y: 40 + (i % 2) * 14, duration: 0.45, ease: "power2.in" }, TW.clear13 + Math.abs(i - 2) * 0.05);
  tl.to("#atkc", { opacity: 0.25, duration: 0.4 }, TW.clear13 + 0.2);
  tl.to("#atkc", { opacity: 0, duration: 0.3 }, TW.mpc14);
  KIT.pop(tl, "#lb-clear", TW.clear13 + 0.4);
  hide("#mv-d4,#lb-d4", TW.mpc14 - 0.3, 0.3);
  // L14
  hide("#lb-clear", TW.mpc14 + 0.6, 0.2);
  growIn("key4", TW.key14 - 0.4); KIT.pop(tl, "#lb-key", TW.key14);
  sinkOut("key4", TW.path14 - 0.7); hide("#lb-key", TW.path14 - 0.8, 0.2);
  growIn("bgl", TW.path14 - 0.2); KIT.draw(tl, "ln-bg", TW.rev14, 0.8); KIT.pop(tl, "#lb-bg", TW.rev14 + 0.2);
  KIT.pop(tl, "#lb-pre", TW.pre14);
  growIn("cal", TW.q14 - 0.2); KIT.pop(tl, "#lb-cal", TW.drill14);
  [0, 1, 2, 3].forEach((i) => KIT.pop(tl, "#cal-q" + i, TW.drill14 + 0.15 + i * 0.12));
  growIn("stw", TW.time14 - 0.3); KIT.pop(tl, "#lb-stw", TW.time14 + 0.2);
  KIT.rot(tl, "stw-hand", TW.time14 + 0.2, 300, 1.4, "power1.inOut");
  // L15
  hide("#lb-pre,#lb-bg", TW.check15 - 0.2, 0.2);
  sinkOut("cal", TW.check15 - 0.3); sinkOut("stw", TW.check15 - 0.3); hide("#lb-cal,#lb-stw", TW.check15 - 0.3, 0.2);
  growIn("mag4", TW.check15); KIT.pop(tl, "#lb-code", TW.code15);
  KIT.swap(tl, "#lb-code", "#lb-empty", TW.empty15, 0.2);

  // ---- L16 limits
  KIT.cam(tl, TW.lim16 - 0.5, CAM.p5, 1.0);
  hide("#hd4", TW.lim16 - 0.4, 0.2);
  hide("#lb-fl1,#lb-fl2,#lb-fl3", TW.lim16 - 0.4, 0.2); KIT.pop(tl, "#hd5", TW.lim16);
  hide("#lb-empty,#lb-hw2", TW.lim16 - 0.4, 0.25);
  growIn("lk", TW.lim16 + 0.3);
  growIn("at1", TW.arch16);
  KIT.rot(tl, "lk-k0", TW.insider16 - 0.4, 90, 0.4);
  KIT.led(tl, "lk-dot0", TW.insider16 - 0.05, "red");
  KIT.pop(tl, "#lb-at1", TW.insider16);
  KIT.pop(tl, "#lb-lim", TW.insider16 + 0.3);
  hide("#lb-at1", TW.one16 - 0.3, 0.2);
  growIn("at2", TW.one16); growIn("at3", TW.one16 + 0.15);
  show("#lk-k1,#lk-k2", TW.one16 + 0.5, 0.2);
  KIT.rot(tl, "lk-k1", TW.multi16 - 0.2, 90, 0.4); KIT.rot(tl, "lk-k2", TW.multi16 - 0.1, 90, 0.4);
  KIT.led(tl, "lk-dot1", TW.multi16 + 0.15, "red"); KIT.led(tl, "lk-dot2", TW.multi16 + 0.25, "red");
  hide("#lb-lim", TW.multi16 - 0.3, 0.2);
  KIT.pop(tl, "#lb-coll", TW.multi16 - 0.1);
  ["mag4"].forEach((id) => sinkOut(id, TW.lim16 - 0.4));
  KIT.cam(tl, TW.coll16 + 0.3, CAM.wide, 1.0);
  [1, 2, 3].forEach((i) => KIT.pop(tl, "#lb-fs" + i, TW.coll16 + 1.0 + i * 0.05));
  hide("#hd5", TW.coll16 + 0.3, 0.2);
  ["#lb-db","#lb-is","#lb-pe","#lb-ap","#lb-sg","#lb-br","#lb-ch","#lb-mon"].forEach((s, i) => KIT.pop(tl, s, TW.coll16 + 0.9 + i * 0.05));
  tl.set({}, {}, ${TOTAL});
  window.__timelines["story"] = tl;
})();
`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab-flag { border-color: #e0453a; color: #1c1c1c; flex-direction: column; align-items: flex-start; gap: 4px; padding: 6px 16px 8px; }
    .lab-flag.lab-fs { flex-direction: row; align-items: center; gap: 10px; }
    .fl-l1 { display: flex; gap: 10px; align-items: center; }
    .lab-flag .ok { background: #1f9d55; color: #fff; border-radius: 8px; padding: 0 10px 2px; }
    .lab-flag .what { color: #c3352b; }
    .lab-interp .ok.ip { background: #8a8478; }
    .lab-interp { border-color: #b8b0a1; color: #6d685e; }
    .lab-interp .what { color: #6d685e; }
    .strike { text-decoration: line-through; text-decoration-thickness: 3px; }
    .mono { font-family: "JetBrains Mono", monospace; font-weight: 700; }
    .hd { position: absolute; left: 44px; top: 26px; padding: 4px 16px 8px; border-radius: 14px; background: rgba(239,235,227,0.94); font-size: 44px; font-weight: 900; white-space: nowrap; }
    .hd-n { display: inline-block; margin-right: 16px; font-size: 32px; font-weight: 900; color: #fff; background: #1d93ba; border-radius: 10px; padding: 2px 14px 4px; vertical-align: 6px; }
    #note0 { position: absolute; left: 56px; top: 40px; }
    .card { left: 56px; top: 124px; }
    #card-l { width: 640px; }
    #card-r { width: 900px; }
    .k-code .c-row.dim { opacity: 0.16; }
    .k-code .c-row { font-family: "Noto Sans SC", sans-serif; font-weight: 700; padding-left: 12px; border-radius: 10px; }
    .k-code .c-row.sep { margin-top: 10px; border-top: 2px dashed #e2ddd3; }
    .k-code .c-row .ok { color: #1f9d55; margin-left: 14px; }
    .k-code .c-row .no { color: #e0453a; margin-left: 14px; }
    .k-code .c-row .red { color: #e0453a; }
    .k-code .c-row .v { margin-left: 14px; color: #1d93ba; }
    .k-code .c-row s { color: #8a8478; text-decoration-thickness: 3px; }
    .k-code .c-row #lr3-yes { position: absolute; left: 150px; color: #1f9d55; }
    #ttl { left: 460px; top: 330px; min-height: 0; padding: 56px 40px 60px; }
    #ttl .t-main { font-size: 84px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${L}</div>
      </div>
      <div id="note0" class="hide"><div class="lab lab-g">示例架构 · 不是任何交易所公布的方案</div></div>
      ${headHtml}
      ${ledgerCard}
      ${rulesCard}
      <div class="k-title" id="ttl"><div class="t-main">怎么守</div><div class="t-sub">示例架构 + 四个重点</div></div>
      ${pills(5)}
    </div>
  </div>
  <script>
${runtimeJs()}
${script}
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
