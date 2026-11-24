// Generates compositions/story.html for ep07/seg4「④ 一个卡住全部」（外部调用导致的拒绝服务）.
// Run: node src/build-story.mjs
// World: 收发站 · 右区（拍卖场与分发线）. 拍卖台 = seg1 layout AUCTION_ZONE. Camera pans left → right:
//   DoS 路牌 + 被封住按钮的合约 → 拍卖台（A 拒收、B 出价）→ 取件柜 → 快递比喻 → 四种 DoS → Akutars.
import fs from "node:fs";
import { G, at, f, M, box, faceV, camAt, gridSvg, worldSvg, wlab, wpin, BADGE, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as LY from "./layout.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const items = [];
const A = {};
const add = (y, svg) => items.push({ y, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const S = LY.SWp;
const groupAt = (id, o, svg, op = 1) => { const g = at(o); return `<g id="${id}" data-ox="${f(g[0])}" data-oy="${f(g[1])}" opacity="${op}">${svg}</g>`; };

// gold bars (same look as ep06)
const GB = { l: 56, w: 26, h: 16 };
function goldStack(o, layers, z0 = 0, gap = 4) {
  const boxes = [];
  layers.forEach(([nc, nr], k) => {
    const W = nc * GB.l + (nc - 1) * gap, D = nr * GB.w + (nr - 1) * gap;
    for (let c = 0; c < nc; c++) for (let r = 0; r < nr; r++) boxes.push({ u0: -W / 2 + c * (GB.l + gap), v0: -D / 2 + r * (GB.w + gap), z: z0 + k * GB.h });
  });
  boxes.sort((a, b) => a.z - b.z || a.v0 - b.v0 || b.u0 - a.u0);
  return boxes.map((b) => box(o, b.u0, b.u0 + GB.l, b.v0, b.v0 + GB.w, b.z, b.z + GB.h, M.gold, 1.2)).join("");
}
// a small stack of coins (cylinders) — the "USDT" each recipient gets
function coinPile(o, n, z0 = 0) {
  let s = "";
  const c = (z) => {
    const p = at(o, 0, 0, z), q = at(o, 0, 0, z + 6), rx = 20, ry = 11.5;
    return `<path d="M${f(p[0] - rx)} ${f(p[1])}A${rx} ${ry} 0 0 0 ${f(p[0] + rx)} ${f(p[1])}L${f(q[0] + rx)} ${f(q[1])}A${rx} ${ry} 0 0 1 ${f(q[0] - rx)} ${f(q[1])}Z" fill="#cf9520" stroke="#8a6414" stroke-width="1.2"/>
      <ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="${rx}" ry="${ry}" fill="#f0c04a" stroke="#8a6414" stroke-width="1.2"/><ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="${rx * 0.6}" ry="${ry * 0.6}" fill="none" stroke="#ffe08a" stroke-width="1.4"/>`;
  };
  for (let k = 0; k < n; k++) s += c(z0 + k * 7);
  return s;
}

// ================================================================ objects
// ---- L0–L1: DoS signboard + a contract whose buttons are taped shut (money still inside)
put("sign", E1.signBoard(LY.SIGN, { id: "sign", text: "拒绝服务 · DoS", size: 44 }), LY.SIGN);
put("vm", E1.vending(LY.VM, { id: "vm", sign: "CONTRACT" }), LY.VM);
{
  const p = A.vm.panel, b = A.vm.buttons;
  const top = b ? b[0] : up(p, 30), bot = b ? b[b.length - 1] : rt(p, 0, 60);
  const c = lerp(top, bot, 0.5), hh = Math.max(70, (bot[1] - top[1]) / 2 + 34);
  const strip = (a, z) => `<path d="M${f(a[0])} ${f(a[1])}L${f(z[0])} ${f(z[1])}" stroke="#a8322a" stroke-width="24" stroke-linecap="butt"/><path d="M${f(a[0])} ${f(a[1])}L${f(z[0])} ${f(z[1])}" stroke="#e0453a" stroke-width="20" stroke-linecap="butt"/>
    <path d="M${f(a[0])} ${f(a[1])}L${f(z[0])} ${f(z[1])}" stroke="#f08a80" stroke-width="3" stroke-dasharray="10 12" stroke-linecap="butt"/>`;
  const tape = `<g id="tape" opacity="0">${strip(rt(c, -44, -hh), rt(c, 44, hh))}${strip(rt(c, 44, -hh), rt(c, -44, hh))}</g>`;
  add(at(LY.VM)[1] + 1, tape);
  A.tape = c;
}

// ---- L2–L10: the auction stand, A (rejecting contract), B (new bidder), the queue, the pickup locker
put("auc", X.auctionStand(LY.STAND, { id: "auc", scale: 1.5, name: "A", amount: " " }), LY.STAND);
put("lk", E4.pickupLocker(LY.LOCKER, { id: "lk", amounts: { 0: "A" }, coins: [0] }), LY.LOCKER);
put("atk", E1.miniVend(LY.ATK, { id: "atk", kind: "attacker" }), LY.ATK);
const ARM_TGT = up(lerp(A.auc.chuteTop, A.auc.chute, 0.8), 8);
put("cbA", E4.callbackArm(LY.ARM, { id: "cbA", target: ARM_TGT, s: 0 }), LY.ARM, 2);
put("bB", O.person(LY.BID, { id: "bB", role: "engineer" }), LY.BID);
LY.QUEUE.forEach((q, i) => put("q" + i, O.person(q, { id: "q" + i, role: "signer" }), q));

// ---- L7–L8: metaphor — 100 parcels, the first one refused at the door
{
  const o = LY.HOUSE, wall = { f: "#efe7da", s: "#d9cdb9", t: "#f7f2e9", st: "#7d7466" }, roof = { f: "#b5523e", s: "#93412f", t: "#cf6a52", st: "#5e2519" };
  let s = "";
  s += box(o, -70, 70, -60, 60, 0, 120, wall, 1.6);
  s += box(o, -80, 80, -70, 70, 120, 136, roof, 1.6);
  s += box(o, -60, 60, -50, 50, 136, 150, roof, 1.4);
  s += `<g transform="${faceV(o, -70, 60, 120)}"><rect x="20" y="28" width="44" height="92" rx="3" fill="#7b4a26" stroke="#4a2c14" stroke-width="1.8"/>
    <circle cx="56" cy="76" r="3.2" fill="#e3b341" stroke="#8a6414" stroke-width="1"/><rect x="82" y="30" width="40" height="34" rx="2" fill="#bfe6f2" stroke="#7d7466" stroke-width="1.8"/>
    <path d="M102 30V64M82 47H122" stroke="#7d7466" stroke-width="1.6"/></g>`;
  add(at(o)[1], `<g id="house">${s}</g>`);
  A.house = { top: at(o, 0, 0, 190), door: at(o, -28, 60, 50) };
}
const PK = [];
for (let i = 0; i < LY.P_N; i++) {
  const o = { u: LY.PARCEL0.u + i * LY.P_STEP, v: LY.PARCEL0.v };
  const r = X.parcel(o, { id: "pc" + i, scale: 1.35 });
  PK.push(r.anchors);
  add(at(o)[1], r.svg);
}
const P_END = { u: LY.PARCEL0.u + LY.P_N * LY.P_STEP + 30, v: LY.PARCEL0.v + 10 };
put("cour", O.person(P_END, { id: "cour", role: "engineer" }), P_END);
const ARM_P = { u: LY.PARCEL0.u - 40, v: LY.PARCEL0.v + 115 };
put("cbP", E4.callbackArm(ARM_P, { id: "cbP", target: up(PK[0].center, 4), s: 0 }), ARM_P, 2);

// ---- L11–L15: unbounded loop on the distribution line, frozen recipient
put("srt", E1.sorter(LY.SORTER, { id: "srt", letters: 4 }), LY.SORTER);
const QL = [];
for (let k = 0; k < 7; k++) {
  const o = { u: LY.SORTER.u - 300 - k * 78, v: LY.SORTER.v };
  const r = E1.letter(o, { id: "ql" + k });
  QL.push(r.anchors);
  add(at(o)[1], groupAt("qlw" + k, o, r.svg, 1));
}
put("gg", E3.gasGauge(LY.GAUGE, { id: "gg", value: 0.75 }), LY.GAUGE);
LY.RCPT.forEach((o, i) => put("r" + i, O.person(o, { id: "r" + i, role: "signer", scale: 1.0 }), o));
put("ice", E5.iceShell(LY.RCPT[1], { id: "ice", box: [-34, 34, -30, 30, 0, 222], on: false, seed: "r1" }), LY.RCPT[1], 3);
LY.RCPT.forEach((o, i) => { const c = { u: o.u + 30, v: o.v + 50 }; add(at(c)[1] + 5, groupAt("rc" + i, c, coinPile(c, 4), 0)); A["rc" + i] = at(c, 0, 0, 40); });
put("lk2", E4.pickupLocker(LY.LOCKER2, { id: "lk2", cols: 2, rows: 1, amounts: { 0: "USDT" }, coins: [0], title: "PICKUP" }), LY.LOCKER2);

// ---- L16–L17: the balance — forced 1 wei breaks "==", ">=" still holds
put("bal", E1.balance(LY.BAL, { id: "bal", tilt: 0 }), LY.BAL);
{
  const p = A.bal.panL;
  add(at(LY.BAL)[1] + 10, `<g id="speck" opacity="0"><rect x="${f(p[0] - 7)}" y="${f(p[1] - 150)}" width="14" height="9" rx="2" fill="#f0c04a" stroke="#8a6414" stroke-width="1.4"/></g>`);
}

// ---- L18–L19: Ethereum vs TRON, 80 ms CPU time
put("chE", O.chain(LY.CH_ETH, { id: "chE", n: 3 }), LY.CH_ETH);
put("chT", O.chain(LY.CH_TRON, { id: "chT", n: 3 }), LY.CH_TRON);
put("hg", O.hourglass(LY.HG, { id: "hg" }), LY.HG);

// ---- L20–L25: Akutars
put("ak", E3.contractMachine(LY.AK, { id: "ak", name: "AK", tone: "gray" }), LY.AK);
put("auc2", X.auctionStand(LY.AK_STAND, { id: "auc2", scale: 0.85, name: "?", amount: " " }), LY.AK_STAND);
put("atk2", E1.miniVend(LY.AK_ATK, { id: "atk2", kind: "attacker", scale: 0.7 }), LY.AK_ATK);
put("wd", O.checkpoint(LY.AK_GATE, { id: "wd", n: "" }), LY.AK_GATE);
{
  const o = LY.AK_GOLD;
  add(at(o)[1], groupAt("akg", o, goldStack(o, [[4, 3], [4, 3], [3, 3], [3, 2], [2, 2], [2, 1], [1, 1]])));
  // chain loop around the pile
  const c = at(o, 0, 0, 40), rx = 175, ry = 92;
  const chainSvg = `<g id="akch" opacity="0"><ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${rx}" ry="${ry}" fill="none" stroke="#3f444b" stroke-width="12" stroke-dasharray="20 7"/>
    <ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${rx}" ry="${ry}" fill="none" stroke="#9aa0a8" stroke-width="5" stroke-dasharray="20 7"/></g>`;
  add(at(o)[1] + 2, chainSvg);
  A.akg = at(o, 0, 0, 110);
}
put("akl", O.padlock(LY.AK_LOCK, { id: "akl", key: false }), LY.AK_LOCK, 3);
put("wdl", O.padlock({ u: LY.AK_GATE.u + 20, v: LY.AK_GATE.v + 60 }, { id: "wdl", key: false }), { u: LY.AK_GATE.u + 20, v: LY.AK_GATE.v + 60 }, 3);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -1500, u1: 9000, v0: -2400, v1: 5200 }) + items.map((x) => x.svg).join("\n"), [-1000, -2600, 12000, 4600]);

// ================================================================ cameras
const SA = A.auc;
const CAMS = {
  pre: camAt(S(-1900, -160), 960, 520, 1.0),
  sign: camAt(S(-1330, -140), 960, 540, 1.2),
  auc: camAt(S(10, -130), 940, 520, 1.12),
  aucW: camAt(S(110, -140), 900, 530, 0.98),
  par: camAt(S(1950, -150), 960, 520, 1.0),
  loop: camAt(S(LY.XS.E + 20, -120), 960, 520, 1.0),
  batch: camAt(S(LY.XS.E + 420, -110), 960, 520, 0.95),
  bal: camAt(S(LY.XS.E + 2000, -150), 960, 520, 1.25),
  tron: camAt(S(LY.XS.E + 3420, -130), 960, 520, 0.92),
  ak: camAt(S(LY.XS.F, -150), 960, 440, 0.86),
};

// ================================================================ times
const TM = {
  s0: L(0).start, dos0: w("拒绝服务", 0),
  s1: L(1).start, steal1: w("不偷钱", 1), fn1: w("某个功能", 1), no1: w("用不了", 1),
  s2: L(2).start, guess2: w("再猜一道题", 2), nb2: w("收到新出价", 2), back2: w("退给", 2), prev2: w("上一位出价者", 2),
  s3: L(3).start, con3: w("是一个合约", 3), rcv3: w("receive", 3), rb3: w("总是回滚", 3),
  s4: L(4).start, q4: w("新出价", 4),
  s5: L(5).start, no5: w("不能", 5), fail5: w("退款失败", 5), rb5: w("整笔新出价回滚", 5),
  s6: L(6).start, hold6: w("一直占着", 6), pos6: w("最高出价者", 6),
  s7: L(7).start, ex7: w("快递", 7), h7: w("100 个包裹", 7), ord7: w("按顺序", 7),
  s8: L(8).start, rej8: w("被拒收", 8), n99: w("99 个", 8),
  s9: L(9).start, pull9: w("拉取式支付", 9), led9: w("只记账", 9), take9: w("自己来取", 9),
  s10: L(10).start, one10: w("一个人拒收", 10), self10: w("只影响他自己", 10),
  s11: L(11).start, more11: w("还有几种", 11),
  s12: L(12).start, all12: w("遍历所有用户", 12), many12: w("用户一多", 12), lim12: w("区块 gas 上限", 12),
  s13: L(13).start, page13: w("分页", 13), acc13: w("累计奖励因子", 13),
  s14: L(14).start, usdt14: w("批量分发", 14), frz14: w("被冻结", 14), fail14: w("整批失败", 14),
  s15: L(15).start, each15: w("逐个捕获失败", 15), led15: w("记账", 15), claim15: w("等对方来领", 15),
  s16: L(16).start, eq16: w("严格等于", 16), force16: w("强制转入", 16), wei16: w("1 wei", 16), miss16: w("对不上", 16),
  s17: L(17).start, ge17: w("大于等于", 17),
  s18: L(18).start, tron18: w("TRON", 18), ms18: w("80 毫秒", 18),
  s19: L(19).start, eth19: w("以太坊上够用", 19), to19: w("超时", 19),
  s20: L(20).start, real20: w("真实案例", 20), date20: w("2022 年 4 月", 20), ak20: w("Akutars", 20), nft20: w("NFT", 20),
  s21: L(21).start, push21: w("推送退款", 21), stuck21: w("卡死", 21),
  s22: L(22).start, wd22: w("项目方提款", 22), var22: w("错误的变量", 22), never22: w("永远不成立", 22),
  s23: L(23).start, n23: w("11539", 23), lock23: w("永久锁定", 23),
  s24: L(24).start, bs24: w("BlockSec", 24), two24: w("第二个缺陷", 24),
  s25: L(25).start, one25: w("第一个", 25), dos25: w("DoS", 25),
};

// ================================================================ labels (world)
let labels = "";
// L0–L1
labels += wlab("lb-vm", up(A.vm.top, 10), "某个合约", "lab-ink hide");
labels += wlab("lb-money", rt(A.vm.glass, -150, -20), "钱还在", "lab-gs hide", "r");
labels += wlab("lb-noacc", rt(A.tape, 80, 20), "功能用不了", "lab-rs hide", "l");
labels += wlab("lb-steal", up(A.vm.top, 10), "不偷钱", "lab-g hide");
// L2–L6
labels += wlab("lb-auc", up(SA.top, 0), "拍卖合约", "lab-ink hide");
labels += wlab("lb-A", rt(up(A.atk.top, 0), 30, 0), "A · 上一位出价者", "lab-ink hide");
labels += wlab("lb-Arej", rt(up(A.atk.top, 0), 30, 0), "A 是合约 · receive 总是回滚", "lab-rs hide");
labels += wlab("lb-ref", rt(SA.chute, 120, -60), "退款", "hide", "l");
labels += wlab("lb-B", up(A.bB.head ?? A.bB.top, 30), "B · 新出价", "hide");
labels += wpin("bx-gav", up(SA.gavel, 70), BADGE("bx-gavi", 60, "hide"), "c");
labels += wlab("lb-rb", rt(SA.board, 120, 70), "整笔新出价回滚", "lab-rs hide", "l");
labels += wlab("lb-stuck", rt(SA.board, 120, -40), "一直占着最高出价", "lab-rs hide", "l");
labels += wlab("lb-q", up(A.q1.head ?? A.q1.top, 40), "后面的人都出不了价", "lab-r hide");
// bid card (rises from B toward the board, bounces back)
labels += wpin("bid", up(A.bB.head ?? A.bB.top, 100), `<div class="bid hide" id="bidc"><span class="bq" id="bidq">?</span>B 的出价</div>`, "c");
// L7–L8 parcels
labels += wlab("lb-meta", up(A.house.top, 20), "比喻 · 示例", "lab-g hide");
labels += wlab("lb-100", up(PK[6].top, 70), "100 个包裹 · 按顺序送", "hide");
labels += wlab("lb-rej", rt(A.house.door, -60, 30), "第 1 个被拒收", "lab-rs hide", "r");
labels += wlab("lb-99", up(PK[8].top, 70), "后面 99 个 · 都送不出去", "lab-r hide");
labels += wpin("bx-p0", up(PK[0].top, 60), BADGE("bx-p0i", 52, "hide"), "c");
// L9–L10 pull payment
labels += wlab("lb-push", rt(SA.chute, 110, -40), "推送退款", "lab-r hide", "l");
labels += wpin("bx-chute", rt(SA.chute, 40, -50), BADGE("bx-chutei", 52, "hide"), "c");
labels += wlab("lb-lk", up(A.lk.top, 0), "拉取式支付 · 合约只记账", "lab-cs hide");
labels += wlab("lb-c0", rt(A.lk.cells[0], 0, -10), "A · 待取", "lab-ink hide", "c");
labels += wlab("lb-take", rt(A.lk.front, 0, 80), "收款人自己来取", "hide", "t");
labels += wlab("lb-ok", rt(SA.board, 120, 70), "新出价成功", "lab-gs hide", "l");
labels += wlab("lb-self", rt(A.atk.top, 30, 0), "只影响 A 自己", "lab-r hide");
// L12–L15
labels += wlab("lb-loop", up(A.srt.top, 10), "遍历所有用户 · 发奖励", "hide");
labels += wlab("lb-gg", up(A.gg.top, 10), "区块 gas 上限", "lab-ink hide");
labels += wlab("lb-ggx", rt(A.gg.dial, 90, 0), "超了", "lab-rs hide", "l");
labels += wlab("lb-pg0", up(A.srt.beltSlots[1], 120), "第 1 页", "lab-cs hide");
labels += wlab("lb-pg1", up(QL[1].top, 60), "第 2 页", "lab-g hide");
labels += wlab("lb-pg2", up(QL[5].top, 60), "第 3 页", "lab-g hide");
labels += wlab("lb-acc", rt(A.srt.top, 0, -90), "或：累计奖励因子", "lab-g hide");
labels += wlab("lb-batch", up(A.srt.top, 10), "批量分发 USDT", "hide");
labels += wlab("lb-frz", up(A.r1.head ?? A.r1.top, 50), "地址被冻结", "lab-rs hide");
labels += wpin("bx-batch", rt(A.srt.top, 0, 60), BADGE("bx-batchi", 64, "hide"), "c");
labels += wlab("lb-bfail", rt(A.srt.top, 50, 60), "整批失败", "lab-rs hide", "l");
labels += wlab("lb-skip", up(A.r1.head ?? A.r1.top, 50), "单独失败 · 跳过", "lab-r hide");
labels += wlab("lb-wait", up(A.lk2.cells[0], 60), "记账 · 待领", "lab-ink hide");
[0, 2, 3].forEach((i) => { labels += wpin("ck-r" + i, up(A["rc" + i], 40), CHECK("ck-r" + i + "i", 44, "hide"), "c"); });
// L16–L17
labels += wlab("lb-panL", rt(A.bal.panL, -80, 30), "余额", "hide", "r");
labels += wlab("lb-panR", rt(A.bal.panR, 80, 30), "记录值", "hide", "l");
labels += wlab("lb-eq", up(A.bal.top, 40), "要求：余额 == 记录值", "lab-ink hide");
labels += wlab("lb-eqx", up(A.bal.top, 40), "余额 == 记录值 ✗", "lab-rs hide");
labels += wlab("lb-ge", up(A.bal.top, 40), "余额 ≥ 记录值 ✓", "lab-gs hide");
labels += wlab("lb-wei", rt(A.bal.panL, -60, -150), "强制转入 1 wei", "lab-r hide", "r");
// L18–L19
labels += wlab("lb-chE", up(A.chE.top, 10), "以太坊", "hide");
labels += wlab("lb-chT", up(A.chT.top, 10), "TRON", "hide");
labels += wlab("lb-80", up(A.hg.top, 20), "每次执行 · 80 毫秒 CPU 时间", "lab-ink hide");
const bar = (id, label) => `<div class="loopb hide" id="${id}"><div class="lt">同样长的循环</div><div class="lbar"><div class="lfill" id="${id}-f"></div></div><div class="lres hide" id="${id}-r">${label}</div></div>`;
labels += wpin("lpE", rt(A.chE.ground ?? at(LY.CH_ETH), 150, 110), bar("lpE", "跑完 ✓"), "t");
labels += wpin("lpT", rt(A.chT.ground ?? at(LY.CH_TRON), 150, 110), bar("lpT", "超时 ✗"), "t");
// L20–L25
labels += wlab("lb-ak", up(A.ak.top, 20), "Akutars 合约", "lab-ink hide");
labels += wlab("lb-d1", up(A.auc2.top, 10), "缺陷 1 · 推送退款", "lab-r hide");
labels += wlab("lb-d1b", up(A.auc2.top, 10), "缺陷 1 · 现成的 DoS 入口", "lab-rs hide");
labels += wlab("lb-d2", up(A.wd.top ?? A.wd.plate, 20), "缺陷 2 · 提款条件比错变量", "lab-r hide");
labels += wlab("lb-d2b", up(A.wd.top ?? A.wd.plate, 20), "缺陷 2 · 直接锁死资金", "lab-rs hide");
labels += wpin("cmp", rt(at(LY.AK_GATE), 40, 50), `<div class="cmp hide" id="cmpc">提款条件：比较了 <b>错误的变量</b><div class="cn">→ 永远不成立</div></div>`, "t");
labels += wlab("lb-eth", rt(A.akg, -20, 150), "11539.5 ETH", "lab-ink big hide", "t");
labels += wlab("lb-lock", rt(A.akg, -320, 200), "永久锁定", "lab-rs hide", "r");
labels += wlab("lb-3p", rt(up(A.wd.top ?? A.wd.plate, 20), 0, -70), "第三方分析 · BlockSec", "lab-g hide");

// ================================================================ screen layer
const TERMS = [
  ["receive 函数", "合约收到 ETH 时会执行的函数", TM.rcv3],
  ["区块 gas 上限", "一个区块能容纳的 gas 总量", TM.lim12],
  ["累计奖励因子", "只记每份额累计多少奖励 · 领取时再算", TM.acc13],
  ["强制转入 1 wei · ETH 最小单位", "不经过 receive · 硬把 ETH 塞进合约", TM.force16],
  ["NFT", "不可互换的代币 · 每一枚都不同", TM.nft20],
];
const termHtml = TERMS.map(([t, d], i) => `<div class="term hide" id="tm${i}"><div class="tt">${t}</div><div class="td">${d}</div></div>`).join("");
const CHIPS = ["① 无界循环", "② 冻结地址", "③ 余额等式", "④ TRON 超时"];
const dosHtml = `<div id="dos" class="hide"><div class="dh">类似的毛病</div>${CHIPS.map((c, i) => `<div class="dc" id="dc${i}"><span class="db" id="db${i}">？</span><span class="dt hide" id="dt${i}">${c}</span></div>`).join("")}</div>`;
const evHtml = `<div id="ev" class="hide"><div class="eh">真实案例</div><div class="en">Akutars NFT</div><div class="ed">2022 年 4 月 · 以太坊</div></div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .term { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 16px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); }
    .term .tt { font-size: 32px; font-weight: 900; line-height: 1.25; white-space: nowrap; }
    .term .td { margin-top: 4px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    #dos { position: absolute; left: 48px; top: 30px; display: flex; align-items: center; gap: 12px; }
    #dos .dh { font-size: 36px; font-weight: 900; margin-right: 4px; white-space: nowrap; }
    #dos .dc { position: relative; min-width: 176px; height: 50px; border-radius: 10px; background: #ffffff; border: 3px solid #d3ccbf; color: #8a8478;
      font-size: 30px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 14px; white-space: nowrap; }
    #dos .db { position: absolute; } #dos .dt { position: relative; }
    #ev { position: absolute; right: 48px; top: 110px; width: 470px; background: #fffdf8; border-radius: 18px; padding: 16px 26px 20px; border-left: 8px solid #1c1c1c;
      box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #ev .eh { font-size: 30px; font-weight: 800; color: #6d685e; }
    #ev .en { font-size: 52px; font-weight: 900; line-height: 1.15; white-space: nowrap; }
    #ev .ed { font-size: 32px; font-weight: 800; color: #1d93ba; white-space: nowrap; }
    .bid { display: inline-flex; align-items: center; gap: 10px; background: #ffffff; border: 4px solid #2aa3c9; border-radius: 12px; padding: 6px 18px 8px;
      font-size: 34px; font-weight: 900; color: #1c1c1c; white-space: nowrap; box-shadow: 0 8px 18px rgba(70,60,40,0.16); }
    .bid .bq { display: inline-flex; width: 40px; height: 40px; border-radius: 50%; background: #1d93ba; color: #fff; align-items: center; justify-content: center; font-size: 30px; }
    .lab.big { font-size: 56px; font-weight: 900; padding: 8px 26px 10px; }
    .cmp { background: #ffffff; border: 3px solid #cfc7b8; border-radius: 12px; padding: 8px 18px 10px; font-size: 32px; font-weight: 800; white-space: nowrap;
      box-shadow: 0 6px 14px rgba(70,60,40,0.10); }
    .cmp b { color: #c3352b; } .cmp .cn { font-size: 32px; color: #c3352b; }
    .loopb { width: 320px; background: #fffdf8; border-radius: 12px; padding: 8px 16px 12px; box-shadow: 0 6px 14px rgba(70,60,40,0.10); }
    .loopb .lt { font-size: 30px; font-weight: 800; white-space: nowrap; }
    .loopb .lbar { position: relative; margin-top: 8px; height: 22px; border-radius: 11px; background: #e2ddd3; overflow: hidden; }
    .loopb .lfill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: #1f9d55; transform-origin: 0 50%; transform: scaleX(0); }
    .loopb .lres { margin-top: 6px; font-size: 32px; font-weight: 900; color: #1f9d55; }
    #lpT .lres { color: #c3352b; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${termHtml}${dosHtml}${evHtml}
      ${pills(4, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ 一个卡住全部</div><div class="t-sub">外部调用导致的拒绝服务</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const K1 = window.KITX01, K3 = window.KITX03, K4 = window.KITX04, K5 = window.KITX05, K7 = window.KITX07;
      const $ = (id) => document.getElementById(id);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const op = (sel, t, to, d) => tl.to(sel, { opacity: to, duration: d == null ? 0.3 : d, ease: "power1.inOut" }, t);
      const out = (sel, t, d) => op(sel, t, 0, d || 0.2);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const term = (i, t, t1) => { pop("#tm" + i, t, 0.3); out("#tm" + i, t1, 0.25); };
      const chipOn = (i, t) => {
        tl.to("#dc" + i, { scaleY: 0, duration: 0.14, ease: "power2.in" }, t);
        tl.set("#db" + i, { opacity: 0 }, t + 0.14); tl.set("#dt" + i, { opacity: 1 }, t + 0.14);
        tl.set("#dc" + i, { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff" }, t + 0.14);
        tl.to("#dc" + i, { scaleY: 1, duration: 0.2, ease: "power2.out" }, t + 0.14);
        if (i > 0) tl.to("#dc" + (i - 1), { backgroundColor: "#ffffff", borderColor: "#d3ccbf", color: "#6d685e", duration: 0.25 }, t);
      };
      KIT.camSet(tl, CAMS.pre);
      ["atk", "cbA", "bB", "q0", "q1", "q2", "lk", "cour", "cbP", "lk2", "wdl", "akl"].forEach(hideG);

      // ===== 0–1.6 title card → into the pill; camera pans right into the 右区
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, 1.3);
      KIT.cam(tl, 0.9, CAMS.sign, 1.4);

      // ===== L0 DoS signboard
      tl.fromTo("#sign-solid", { opacity: 0.35 }, { opacity: 1, duration: 0.4, immediateRender: false }, ${f(TM.dos0 - 0.3)});
      // ===== L1 doesn't steal — the function stops working
      pop("#lb-steal", ${f(TM.steal1)});
      pop("#lb-money", ${f(TM.steal1 + 0.4)});
      out("#lb-steal", ${f(TM.fn1 - 0.2)});
      pop("#lb-vm", ${f(TM.fn1)});
      tl.fromTo("#tape", { opacity: 0, scale: 1.25, svgOrigin: "${f(A.tape[0])} ${f(A.tape[1])}" }, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out", immediateRender: false }, ${f(TM.fn1 + 0.2)});
      pop("#lb-noacc", ${f(TM.no1 - 0.1)});

      // ===== L2 auction: refund the previous bidder directly
      out("#lb-vm, #lb-money, #lb-noacc", ${f(TM.s2)});
      KIT.cam(tl, ${f(TM.s2 - 0.1)}, CAMS.auc, 1.3);
      pop("#lb-auc", ${f(TM.guess2 + 0.6)});
      KIT.grow(tl, "bB", ${f(TM.nb2 - 0.2)}, 0.45);
      pop("#bidc", ${f(TM.nb2 + 0.2)});
      K7.gavelTo(tl, "auc", ${f(TM.nb2 + 0.4)}, true);
      out("#lb-auc", ${f(TM.back2 - 0.2)});
      K7.refund(tl, "auc", ${f(TM.back2)}, "out", 0.8);
      pop("#lb-ref", ${f(TM.back2 + 0.3)});
      KIT.grow(tl, "atk", ${f(TM.prev2 - 0.1)}, 0.45);
      pop("#lb-A", ${f(TM.prev2 + 0.3)});

      // ===== L3 A is a contract whose receive always reverts
      out("#lb-ref", ${f(TM.s3)});
      out("#auc-refund", ${f(TM.s3)}, 0.15);
      KIT.swap(tl, "#lb-A", "#lb-Arej", ${f(TM.con3)}, 0.25);
      KIT.grow(tl, "cbA", ${f(TM.con3 + 0.2)}, 0.35);
      K7.refund(tl, "auc", ${f(TM.rb3 - 0.4)}, "bounce", 0.8);
      K4.armPress(tl, "cbA", ${f(TM.rb3)}, { target: ${JSON.stringify(ARM_TGT)}, hold: 0.3 });
      ${"" /* term card: receive */}
      term(0, ${f(TM.rcv3)}, ${f(Math.min(TM.rcv3 + 3.6, TM.s4 + 1.0))});

      // ===== L4 can the new bid succeed?
      K7.chuteOk(tl, "auc", ${f(TM.s4)});
      tl.fromTo("#bidq", { scale: 1 }, { scale: 1.35, duration: 0.25, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.q4)});
      tl.to("#bidc", { x: 150, y: -150, duration: 0.6, ease: "power2.out" }, ${f(TM.q4)});

      // ===== L5 no: the refund fails, the whole new bid reverts
      K7.refund(tl, "auc", ${f(TM.no5)}, "bounce", 0.7);
      K4.armPress(tl, "cbA", ${f(TM.no5 + 0.3)}, { target: ${JSON.stringify(ARM_TGT)}, hold: 0.3 });
      K7.gavel(tl, "auc", ${f(TM.fail5)}, { blocked: true });
      tl.to("#bidc", { x: 0, y: 0, duration: 0.5, ease: "back.out(1.6)" }, ${f(TM.rb5 - 0.1)});
      tl.to("#bidc", { borderColor: "#e0453a", duration: 0.2 }, ${f(TM.rb5 - 0.1)});
      tl.to("#bidq", { backgroundColor: "#e0453a", duration: 0.2 }, ${f(TM.rb5 - 0.1)});
      pop("#bx-gavi", ${f(TM.rb5)});
      pop("#lb-rb", ${f(TM.rb5 + 0.2)});

      // ===== L6 A keeps the top spot forever (key frame)
      out("#lb-rb", ${f(TM.s6)});
      K7.board(tl, "auc", ${f(TM.hold6 - 0.2)}, { red: true }, 0.5);
      pop("#lb-stuck", ${f(TM.hold6 + 0.2)});
      KIT.cam(tl, ${f(TM.s6)}, CAMS.aucW, 1.2);
      KIT.grow(tl, "q0", ${f(TM.s6 + 0.2)}, 0.4); KIT.grow(tl, "q1", ${f(TM.s6 + 0.35)}, 0.4); KIT.grow(tl, "q2", ${f(TM.s6 + 0.5)}, 0.4);
      pop("#lb-q", ${f(TM.pos6)});

      // ===== L7 metaphor: 100 parcels in order
      out("#lb-stuck, #lb-q, #bidc, #bx-gavi, #lb-Arej, #lb-B", ${f(TM.s7 - 0.1)});
      KIT.cam(tl, ${f(TM.s7 - 0.1)}, CAMS.par, 1.4);
      pop("#lb-meta", ${f(TM.ex7)});
      KIT.grow(tl, "cour", ${f(TM.ex7)}, 0.4);
      pop("#lb-100", ${f(TM.h7)});
      ${PK.map((_, i) => `tl.fromTo("#pc${i}", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, ${f(TM.s7 + 0.3 + (LY.P_N - 1 - i) * 0.09)});`).join("\n      ")}
      tl.set(${JSON.stringify(PK.map((_, i) => "#pc" + i).join(","))}, { opacity: 0 }, 0);

      // ===== L8 the 1st refused, the other 99 stuck
      KIT.grow(tl, "cbP", ${f(TM.rej8 - 0.6)}, 0.3);
      K4.armPress(tl, "cbP", ${f(TM.rej8 - 0.2)}, { target: ${JSON.stringify(up(PK[0].center, 4))}, hold: 0.4 });
      tl.to("#pc0", { x: 30, y: -10, duration: 0.25, ease: "power2.out" }, ${f(TM.rej8 + 0.25)});
      pop("#bx-p0i", ${f(TM.rej8 + 0.4)});
      pop("#lb-rej", ${f(TM.rej8 + 0.3)});
      out("#lb-100", ${f(TM.n99 - 0.3)});
      tl.to(${JSON.stringify(PK.slice(1).map((_, i) => "#pc" + (i + 1)).join(","))}, { opacity: 0.35, duration: 0.5, stagger: 0.04 }, ${f(TM.n99 - 0.3)});
      pop("#lb-99", ${f(TM.n99)});

      // ===== L9 fix: pull payment (locker)
      out("#lb-meta, #lb-rej, #lb-99, #bx-p0i", ${f(TM.s9 - 0.1)});
      KIT.cam(tl, ${f(TM.s9 - 0.1)}, CAMS.aucW, 1.3);
      pop("#lb-push", ${f(TM.pull9 - 0.3)}); pop("#bx-chutei", ${f(TM.pull9 - 0.2)});
      KIT.grow(tl, "lk", ${f(TM.pull9)}, 0.6);
      pop("#lb-lk", ${f(TM.pull9 + 0.5)});
      K4.lockerWrite(tl, "lk", 0, ${f(TM.led9)});
      pop("#lb-c0", ${f(TM.led9 + 0.3)});
      pop("#lb-take", ${f(TM.take9)});
      K7.board(tl, "auc", ${f(TM.pull9 + 0.2)}, { red: false }, 0.4);

      // ===== L10 B bids, the gavel lands; only A misses out
      out("#lb-take", ${f(TM.s10)});
      tl.set("#bidc", { borderColor: "#2aa3c9" }, ${f(TM.s10)}); tl.set("#bidq", { backgroundColor: "#1d93ba" }, ${f(TM.s10)});
      pop("#bidc", ${f(TM.s10)});
      tl.to("#bidc", { x: 150, y: -150, duration: 0.5, ease: "power2.out" }, ${f(TM.s10 + 0.2)});
      out("#bidc", ${f(TM.s10 + 0.75)}, 0.15);
      K7.gavel(tl, "auc", ${f(TM.s10 + 0.7)});
      K7.board(tl, "auc", ${f(TM.s10 + 1.1)}, { name: "B" }, 0.5);
      pop("#lb-ok", ${f(TM.s10 + 1.3)});
      pop("#lb-self", ${f(TM.self10)});
      tl.fromTo("#lb-c0", { scale: 1 }, { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.self10 + 0.3)});

      // ===== L11 a few similar problems
      out("#lb-ok, #lb-self, #lb-push, #bx-chutei, #lb-lk, #lb-c0, #lb-A", ${f(TM.s11)});
      KIT.cam(tl, ${f(TM.s11 - 0.1)}, CAMS.loop, 1.6);
      pop("#dos", ${f(TM.s11 + 0.3)});

      // ===== L12 unbounded loop over all users → block gas limit
      chipOn(0, ${f(TM.s12)});
      pop("#lb-loop", ${f(TM.all12)});
      K1.dash(tl, ["srt-belt-0", "srt-belt-1"], ${f(TM.all12)}, ${f(L(13).end - TM.all12)}, -400);
      ${QL.map((_, k) => `tl.fromTo("#qlw${k}", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, ${f(TM.many12 + k * 0.18)});`).join("\n      ")}
      tl.set(${JSON.stringify(QL.map((_, k) => "#qlw" + k).join(","))}, { opacity: 0 }, 0);
      pop("#lb-gg", ${f(TM.lim12 - 0.6)});
      K3.gauge(tl, "gg", ${f(TM.many12)}, 0.0, ${f(TM.lim12 - TM.many12 + 0.3)}, "power1.in");
      pop("#lb-ggx", ${f(TM.lim12 + 0.4)});
      term(1, ${f(TM.lim12)}, ${f(TM.acc13 - 0.25)});

      // ===== L13 paginate, or an accumulated reward factor
      out("#lb-ggx, #lb-gg", ${f(TM.page13 - 0.2)});
      pop("#lb-pg0", ${f(TM.page13)}); pop("#lb-pg1", ${f(TM.page13 + 0.25)}); pop("#lb-pg2", ${f(TM.page13 + 0.5)});
      tl.to(${JSON.stringify(QL.map((_, k) => "#qlw" + k).join(","))}, { opacity: 0.4, duration: 0.4 }, ${f(TM.page13 + 0.2)});
      K3.gauge(tl, "gg", ${f(TM.page13 + 0.3)}, 0.7, 0.8, "power2.out");
      pop("#lb-acc", ${f(TM.acc13 + 0.2)});
      term(2, ${f(TM.acc13)}, ${f(TM.acc13 + 3.6)});

      // ===== L14 batch USDT payout — one frozen address fails the whole batch
      out("#lb-pg0, #lb-pg1, #lb-pg2, #lb-acc, #lb-loop, #lb-gg", ${f(TM.s14 - 0.1)});
      out(${JSON.stringify(QL.map((_, k) => "#qlw" + k).join(","))}, ${f(TM.s14 - 0.1)}, 0.3);
      KIT.cam(tl, ${f(TM.s14 - 0.1)}, CAMS.batch, 1.0);
      chipOn(1, ${f(TM.s14)});
      pop("#lb-batch", ${f(TM.usdt14)});
      K5.freeze(tl, "ice", ${f(TM.frz14 - 0.3)}, 0.8);
      pop("#lb-frz", ${f(TM.frz14 + 0.3)});
      op("#rc0", ${f(TM.usdt14 + 0.6)}, 1, 0.2);
      out("#rc0", ${f(TM.fail14)}, 0.25);
      K1.dash(tl, ["srt-belt-0", "srt-belt-1"], ${f(TM.usdt14)}, ${f(TM.fail14 - TM.usdt14)}, -200);
      pop("#bx-batchi", ${f(TM.fail14)}); pop("#lb-bfail", ${f(TM.fail14 + 0.2)});

      // ===== L15 catch each failure, record, let them claim
      out("#bx-batchi, #lb-bfail, #lb-frz", ${f(TM.s15)});
      pop("#lb-skip", ${f(TM.each15)});
      op("#rc0", ${f(TM.each15 + 0.3)}, 1, 0.2); op("#rc2", ${f(TM.each15 + 0.5)}, 1, 0.2); op("#rc3", ${f(TM.each15 + 0.7)}, 1, 0.2);
      pop("#ck-r0i", ${f(TM.each15 + 0.5)}); pop("#ck-r2i", ${f(TM.each15 + 0.7)}); pop("#ck-r3i", ${f(TM.each15 + 0.9)});
      KIT.grow(tl, "lk2", ${f(TM.led15 - 0.4)}, 0.5);
      K4.lockerWrite(tl, "lk2", 0, ${f(TM.led15)});
      pop("#lb-wait", ${f(TM.claim15)});

      // ===== L16 strict equality + forced 1 wei
      out("#lb-skip, #lb-wait, #lb-batch, #ck-r0i, #ck-r2i, #ck-r3i", ${f(TM.s16 - 0.1)});
      KIT.cam(tl, ${f(TM.s16 - 0.1)}, CAMS.bal, 1.2);
      chipOn(2, ${f(TM.s16)});
      pop("#lb-panL", ${f(TM.s16 + 0.5)}); pop("#lb-panR", ${f(TM.s16 + 0.8)});
      pop("#lb-eq", ${f(TM.eq16)});
      op("#speck", ${f(TM.force16)}, 1, 0.15);
      pop("#lb-wei", ${f(TM.wei16 - 0.2)});
      tl.fromTo("#speck", { y: 0 }, { y: 140, duration: 0.6, ease: "power2.in", immediateRender: false }, ${f(TM.wei16 + 0.2)});
      K1.tilt(tl, "bal", ${f(TM.wei16 + 0.75)}, 9, 0.8);
      KIT.swap(tl, "#lb-eq", "#lb-eqx", ${f(TM.miss16)}, 0.25);
      term(3, ${f(TM.force16)}, ${f(TM.s17 + 0.2)});

      // ===== L17 use >=
      KIT.swap(tl, "#lb-eqx", "#lb-ge", ${f(TM.ge17)}, 0.3);

      // ===== L18 TRON: 80 ms CPU time per execution
      out("#lb-ge, #lb-wei, #lb-panL, #lb-panR", ${f(TM.s18 - 0.1)});
      KIT.cam(tl, ${f(TM.s18 - 0.1)}, CAMS.tron, 1.3);
      chipOn(3, ${f(TM.s18)});
      pop("#lb-chT", ${f(TM.tron18)}); pop("#lb-chE", ${f(TM.tron18 + 0.3)});
      pop("#lb-80", ${f(TM.ms18)});
      KIT.sand(tl, "hg", ${f(TM.ms18)}, ${f(TM.to19 - TM.ms18)});

      // ===== L19 enough on Ethereum, times out on TRON
      pop("#lpE", ${f(TM.eth19 - 0.4)}); pop("#lpT", ${f(TM.eth19 - 0.2)});
      tl.to("#lpE-f", { scaleX: 1, duration: 1.4, ease: "none" }, ${f(TM.eth19)});
      pop("#lpE-r", ${f(TM.eth19 + 1.45)});
      tl.to("#lpT-f", { scaleX: 0.62, duration: ${f(TM.to19 - TM.eth19)}, ease: "none" }, ${f(TM.eth19)});
      tl.to("#lpT-f", { backgroundColor: "#e0453a", duration: 0.15 }, ${f(TM.to19)});
      pop("#lpT-r", ${f(TM.to19)});

      // ===== L20 real case: Akutars
      out("#dos", ${f(TM.s20 - 0.1)});
      out("#lpE, #lpT, #lb-80, #lb-chE, #lb-chT", ${f(TM.s20 - 0.1)});
      KIT.cam(tl, ${f(TM.s20 - 0.1)}, CAMS.ak, 1.6);
      pop("#ev", ${f(TM.real20 + 0.3)});
      pop("#lb-ak", ${f(TM.ak20)});
      term(4, ${f(TM.nft20)}, ${f(TM.nft20 + 3.5)});

      // ===== L21 defect 1: push refund can be blocked
      pop("#lb-d1", ${f(TM.push21)});
      K7.refund(tl, "auc2", ${f(TM.push21 + 0.2)}, "bounce", 0.7);
      K7.refund(tl, "auc2", ${f(TM.stuck21)}, "bounce", 0.6);

      // ===== L22 defect 2: withdraw condition compares the wrong variable
      pop("#lb-d2", ${f(TM.wd22)});
      pop("#cmpc", ${f(TM.var22 - 0.1)});
      KIT.broke(tl, "wd", ${f(TM.never22)}, { ghost: 1, badge: false });
      KIT.grow(tl, "wdl", ${f(TM.never22 + 0.2)}, 0.4);

      // ===== L23 more than 11539 ETH locked forever
      out("#ev", ${f(TM.s23)});
      pop("#lb-eth", ${f(TM.n23)});
      op("#akch", ${f(TM.lock23 - 0.4)}, 1, 0.4);
      KIT.grow(tl, "akl", ${f(TM.lock23 - 0.2)}, 0.4);
      pop("#lb-lock", ${f(TM.lock23)});

      // ===== L24 per BlockSec: the direct cause is defect 2
      pop("#lb-3p", ${f(TM.bs24)});
      KIT.swap(tl, "#lb-d2", "#lb-d2b", ${f(TM.two24)}, 0.25);

      // ===== L25 defect 1 is still a ready-made DoS entry
      KIT.swap(tl, "#lb-d1", "#lb-d1b", ${f(TM.dos25 - 0.3)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL, "aligned:", LY.ALIGNED);
