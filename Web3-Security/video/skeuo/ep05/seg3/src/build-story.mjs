// Generates compositions/story.html for ep05/seg3「③ 借出的权限」.
// Run: node src/build-story.mjs
// World = "权限街区": Parity corner on the left (Library machine + three Parity wallets on delegatecall pipes),
// the main avenue to the right (contract machine + function button console + execute add-on, token machine,
// storage cabinet behind), and a row of three roadside signboards further right (the three easy-to-miss checks).
// One camera travels left → right.
import fs from "node:fs";
import { G, at, f, Wp, M, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { LY } from "./layout.mjs";
import { termCss, termCards } from "../../kit-ext/terms.mjs";
import { wrap, lift, coin, goldBar, slotPost, recoverBox, shredder, tray, smoke, scaffold } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const items = [];
const A = {};
const add = (y, svg) => items.push({ y, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };
const hid = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, `<g id="${name}-w" opacity="0">${r.svg}</g>`); return r; };
const ofs = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
// contractMachine sizes its nameplate from the name; long names squeeze the code screen to a negative width.
// Build with a 6-letter placeholder, then print the real name smaller on the same plate.
const machine = (o, opts, name, size = 30) => {
  const r = E3.contractMachine(o, { ...opts, name: "Walle" });
  r.svg = r.svg.replace(/font-size="40"([^>]*)>Walle<\/text>/, `font-size="${size}"$1>${name}</text>`);
  return r;
};

// ================================================================ Parity corner
put("lib", E3.contractMachine(LY.LIB, { id: "lib", name: "LIB" }), LY.LIB);
put("lp", X.funcPanel(LY.LIB_PANEL, { id: "lp", buttons: [{ name: "initialize", guard: "none" }, { name: "kill", guard: "card" }] }), LY.LIB_PANEL);
put("smk", smoke(LY.LIB, { id: "smk", z: 240 }), LY.LIB, 400);
LY.WALLETS.forEach((o, i) => put("wal" + i, O.hotWallet(o, { id: "wal" + i, gold: true }), o));
{ // delegatecall pipes, same construction as seg1: risers + one manifold into the Library's −u face
  const far = LY.WALLETS[LY.WALLETS.length - 1].u - LY.LIB.u;
  let ps = E1.pipe(LY.LIB, { id: "pm", flow: true, pts: [[far, 0, 232], [far, 0, LY.PIPE_Z], [-150, 0, LY.PIPE_Z], [-150, 0, LY.PIPE_IN_Z], [-112, 0, LY.PIPE_IN_Z]] }).svg;
  LY.WALLETS.slice(0, -1).forEach((W, i) => { ps += E1.pipe(W, { id: "pr" + i, flow: true, pts: [[0, 0, 232], [0, 0, LY.PIPE_Z]] }).svg; });
  add(at(LY.WALLETS[0])[1] + 1500, `<g id="pipes">${ps}</g>`);
}
put("lesson", E1.signBoard(LY.LESSON, { id: "lesson", text: "实现合约本身：初始化或锁死", size: 40 }), LY.LESSON);
// July: letter, library manual, attacker, gold bars
const W1 = LY.WALLETS[0];
put("let1", E1.letter(ofs(W1, 0, 150), { id: "let1" }), ofs(W1, 0, 150), 2000);
put("man", E3.manual(ofs(LY.LIB, 0, 0), { id: "man", title: "库的代码", sub: "Library", pageTitle: "§ initWallet", pageText: "owner = 调用者" }), LY.LIB, 2001);
put("atkP", O.person(LY.ATK_P, { id: "atkP", role: "attacker" }), LY.ATK_P);
put("let2", E1.letter(ofs(LY.ATK_P, 60, -40), { id: "let2", state: "attacker" }), ofs(LY.ATK_P, 60, -40), 2002);
const bars = [0, 1, 2].map((k) => put("gb" + k, goldBar(ofs(W1, 0, 60), { id: "gb" + k, z: 60, op: 0 }), ofs(W1, 0, 60), 2010 + k));

// ================================================================ main avenue
put("cab", E3.slotCabinet(LY.CAB, { id: "cab", n: 5, title: "Storage", fill: { 0: [{ bytes: 20, color: "teal" }], 1: [{ bytes: 8, color: "ink" }], 2: [{ bytes: 1, color: "green" }] } }), LY.CAB);
put("mc", E3.contractMachine(LY.MC, { id: "mc", name: "APP" }), LY.MC);
const BTNS = ["mint", "initialize", "kill", "upgrade", "pause"].map((name) => ({ name, guard: "card" }));
put("fp", X.funcPanel(LY.FP, { id: "fp", buttons: BTNS }), LY.FP);
put("ex", X.funcPanel(LY.EX, { id: "ex", buttons: [{ name: "execute", guard: "none", color: "#2aa3c9" }], title: "EXT" }), LY.EX);
put("dial", E2.comboDial(LY.DIAL, { id: "dial", text: "target" }), LY.DIAL);
put("post", slotPost(LY.POST, { id: "post" }), LY.POST);
put("tok", E1.miniVend(LY.TOK, { id: "tok", kind: "token" }), LY.TOK);
put("vic", O.person(LY.VIC, { id: "vic", role: "signer" }), LY.VIC);
put("vkey", O.key(LY.VKEY, { id: "vkey", stand: true }), LY.VKEY);
put("atk", O.person(LY.ATK, { id: "atk", role: "attacker" }), LY.ATK);
put("auth", O.doc(LY.AUTH0, { id: "auth", standing: true, title: "授权书", lines: ["代币 allowance", "spender: 合约"], w: 150, h: 190 }), LY.AUTH0, 2100);
put("let3", E1.letter(ofs(LY.ATK, 60, -40), { id: "let3", state: "attacker" }), ofs(LY.ATK, 60, -40), 2101);
put("man2", E3.manual(ofs(LY.ATK, 80, -60), { id: "man2", title: "攻击者的代码", sub: "delegatecall" }), ofs(LY.ATK, 80, -60), 2102);
const tcoins = [0, 1, 2].map((k) => put("tc" + k, coin(ofs(LY.TOK, 0, 70), { id: "tc" + k, z: 20, op: 0 }), ofs(LY.TOK, 0, 70), 2110 + k));
put("mag", O.magnifier(LY.MAG, { id: "mag" }), LY.MAG, 2120);
// ownership
put("own", O.person(LY.OWN, { id: "own", role: "signer" }), LY.OWN);
put("kc", X.keycard(LY.KC, { id: "kc", role: "owner", z: 110, scale: 1.3 }), LY.KC, 2200);
{ // mailbox ×1.6 around its ground point
  const r = E2.addrPlate(LY.MBX, { id: "mbx0", text: "新地址" }), [gx, gy] = at(LY.MBX), k = 1.6;
  const S = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k];
  r.svg = r.svg.replace('id="mbx0-flag"', 'id="mbx-flag"');
  A.mbx = { top: S(r.anchors.top), center: S(r.anchors.center), plate: S(r.anchors.plate) };
  add(gy, `<g id="mbx" data-ox="${f(gx)}" data-oy="${f(gy)}"><g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g></g>`);
}
put("tray", tray(LY.TRAY, { id: "tray" }), LY.TRAY);
// signature
put("rec", recoverBox(LY.REC, { id: "rec" }), LY.REC);
put("sig", E2.sigPaper(LY.SIG, { id: "sig", title: "签名" }), LY.SIG, 2300);
put("k0", X.keycard(ofs(LY.REC, 0, 80), { id: "k0", blank: true, z: 40, scale: 1.8 }), ofs(LY.REC, 0, 80), 2301);
put("kadm", X.keycard(LY.KADM, { id: "kadm", blank: true, z: 120, scale: 1.8 }), LY.KADM, 2302);

// ================================================================ three signboards
const SBT = [
  { n: "i", myth: "代码长度 0 = 外部账户", fact: "构造中的合约代码长度也是 0", impact: "不能用它判断 EOA" },
  { n: "ii", myth: "renounce 之后还能找回", fact: "owner 权限无法恢复", impact: "先确认没有函数依赖 owner" },
  { n: "iii", myth: "合约改名不影响构造函数", fact: "0.4 时期构造函数与合约同名", impact: "改名后旧构造函数成公共函数" },
];
LY.SB.forEach((o, i) => put("sb" + i, E3.signboard(o, { id: "sb" + i, blank: true, ...SBT[i] }), o));
// i: contract under construction + magnifier
put("scm", E3.contractMachine(LY.SCM, { id: "scm", name: "新合约", tone: "gray" }), LY.SCM);
put("scf", scaffold(LY.SCM, { id: "scf" }), LY.SCM, 1);
put("mag2", O.magnifier(ofs(LY.SCM, 120, 160), { id: "mag2" }), ofs(LY.SCM, 120, 160), 2);
// ii: owner + shredder + upgrade-only panel
put("own2", O.person(LY.OWN2, { id: "own2", role: "signer" }), LY.OWN2);
put("shr", shredder(LY.SHR, { id: "shr" }), LY.SHR);
put("up", X.funcPanel(LY.UP, { id: "up", buttons: [{ name: "upgrade", guard: "card" }], title: "onlyOwner" }), LY.UP);
put("kc2", X.keycard(ofs(LY.OWN2, 70, 20), { id: "kc2", role: "owner", z: 110, scale: 1.3 }), ofs(LY.OWN2, 70, 20), 2400);
// iii: Wallet → MyWallet; the old constructor becomes a public button
put("wm", machine(LY.WM, { id: "wm" }, "Wallet", 32), LY.WM);
hid("wm2", machine(LY.WM, { id: "wm2" }, "MyWallet", 25), LY.WM, 0.5);
put("ctor", X.funcPanel(LY.CTOR, { id: "ctor", buttons: [{ name: "Wallet()", guard: "none", color: "red" }], title: "PUBLIC" }), LY.CTOR);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2400, u1: 6400, v0: -2600, v1: 3200 }) + items.map((x) => x.svg).join("\n"), [-2000, -2600, 9000, 5200]);

// ================================================================ cameras
const P = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const CAMS = {
  park: camAt(P(LY.LIB, -440, 200, 120), 1100, 600, 0.95),
  parkL: camAt(P(W1, 120, 0, 120), 800, 620, 1.05),
  exec: camAt(P(LY.EX, 0, 120, 60), 1340, 700, 0.8),
  main: camAt(P(LY.FP, 220, -40, 60), 1220, 570, 0.72),
  lesson: camAt(P(LY.LIB, 190, 315, 80), 960, 600, 1.0),
  own: camAt(P(LY.FP, -650, 150, 0), 1180, 760, 1.05),
  sig: camAt(P(LY.FP, 420, 60, 40), 1150, 680, 1.2),
  row: camAt(P(LY.SB[1], 0, 0, 200), 1080, 600, 0.62),
  sb0: camAt(P(LY.SB[0], 180, 260, 150), 960, 560, 1.15),
  sb1: camAt(P(LY.SB[1], 180, 260, 150), 960, 560, 1.15),
  sb2: camAt(P(LY.SB[2], 180, 260, 150), 960, 560, 1.15),
};
const sc = (cam, p) => toScreen(CAMS[cam], p);

// ================================================================ world labels
let labels = "";
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
labels += wlab("lb-lib", A.lib.top, "库合约 Library", "hide");
labels += wlab("lb-wal", rt(A.wal1.top, 0, 0), "Parity 多签钱包 · 共用库合约", "lab-g hide");
labels += wlab("lb-dc", P(LY.LIB, -150, 0, LY.PIPE_Z + 60), "delegatecall · 用钱包自己的存储", "lab-cs hide");
labels += wlab("lb-iw", rt(A.wal0.top, 0, -110), "initWallet · 没有保护", "lab-r hide");
labels += wlab("lb-own1", up(A.wal0.top, 10), "owner = 攻击者", "lab-rs hide");
labels += wlab("lb-atkP", rt(A.atkP.head, 0, -70), "攻击者", "lab-rs hide");
labels += wlab("lb-libown", up(A.lib.top, 10), "被接管的是库合约自己", "lab-rs hide");
labels += wlab("lb-kill", rt(A.lib.center, 150, 0), "销毁", "lab-rs hide", "l");
// main avenue
labels += wlab("lb-mc", rt(A.mc.top, 40, 40), "合约", "lab-g hide", "l");
labels += wlab("lb-ex", rt(A.ex.top, 0, -10), "execute · 公开", "hide");
labels += wlab("lb-dial", rt(A.dial.top ?? P(LY.DIAL, 0, 0, 260), -30, 30), "目标地址", "hide", "r");
labels += wlab("lb-post", A.post.top, "调用数据", "hide");
labels += wlab("lb-who", rt(P(LY.DIAL, 90, 140, 0), 0, 30), "全由调用者决定", "lab-rs hide", "t");
labels += wlab("lb-vic", rt(A.vic.head, 0, -70), "受害者", "lab-g hide");
labels += wlab("lb-tok", A.tok.top, "代币合约", "hide");
labels += wlab("lb-auth", rt(A.mc.front, -130, -60), "持有授权 · 代币", "lab-cs hide", "r");
labels += wlab("lb-key", rt(A.vkey.top ?? P(LY.VKEY, 0, 0, 120), 0, 0), "私钥：仍在受害者手里 ✓", "lab-gs hide");
labels += wlab("lb-atk", rt(A.atk.head, 60, -20), "攻击者", "lab-rs hide", "l");
labels += wlab("lb-tgt", P(LY.DIAL, -40, 90, 0), "目标：代币合约", "lab-rs hide", "t");
labels += wlab("lb-tf", rt(A.post.top, 0, 0), "transferFrom", "lab-rs hide");
labels += wlab("lb-caller", up(A.tok.top, 90), "调用方 = 被授权的合约", "lab-cs hide");
labels += wlab("lb-pass", up(A.tok.top, 0), "额度检查 · 通过", "lab-gs hide");
labels += wlab("lb-out", rt(A.atk.head, 60, -20), "币到了攻击者手里", "lab-rs hide", "l");
labels += wlab("lb-dlg", rt(A.post.top, 0, 0), "delegatecall · 攻击者的代码", "lab-rs hide");
labels += wlab("lb-cab", rt(A.cab.top, -100, 160), "合约的存储 · 被改写", "lab-rs hide");
// ownership
labels += wlab("lb-own", rt(A.own.head, 0, -70), "owner", "lab-ink hide");
labels += wlab("lb-mbx", rt(A.mbx.top, 0, 0), "<span>新地址 0x7a3f…c9<b style='color:#e0453a'>1f</b></span>", "lab-r hide");
labels += wlab("lb-mbxok", rt(A.mbx.top, 0, 0), "新地址 0x7a3f…c91e", "hide");
labels += wlab("lb-one", rt(A.mbx.top, 0, -90), "一步生效", "lab-rs hide");
labels += wlab("lb-lost", rt(A.fp.readers[2], 0, 40), "只认一个不存在的地址 · 权限永久丢失", "lab-rs hide", "r");
labels += wlab("lb-redo", rt(A.mbx.top, 0, -110), "两步转移", "lab-cs hide");
labels += wlab("lb-tray", rt(A.tray.top, 0, 0), "待接收", "lab-g hide");
labels += wlab("lb-acc", rt(A.mbx.top, 0, -90), "acceptOwnership()", "lab-cs hide");
labels += wlab("lb-done", rt(A.mbx.top, 0, -90), "新 owner 确认 · 转移完成 ✓", "lab-gs hide");
// signature
labels += wlab("lb-rec", A.rec.top, "ecrecover", "hide");
labels += wlab("lb-sig", rt(A.sig.tag ?? P(LY.SIG, 0, 0, 260), 0, -40), "无效签名", "lab-r hide");
labels += wlab("lb-zero", rt(P(LY.REC, 0, 80, 40), 60, 30), "返回 address(0)", "lab-rs hide", "l");
labels += wlab("lb-adm", rt(A.kadm.top, 0, 0), "admin 未设置 = 0", "lab-g hide");
labels += wlab("lb-eq", rt(A.fp.readers[3], 0, 40), "0 == 0 · 检查通过 ✗", "lab-rs hide", "t");
// signboards
LY.SB.forEach((o, i) => { labels += wlab("lb-sb" + i, rt(A["sb" + i].top, 0, 0), ["一 · 代码长度", "二 · renounceOwnership", "三 · 构造函数同名"][i], "lab-g hide"); });
labels += wlab("lb-len", rt(A.mag2.top, 0, 0), "代码长度 = 0", "lab-cs hide");
labels += wlab("lb-scm", rt(A.scf.top, -40, 0), "构造中的合约", "lab-g hide");
labels += wlab("lb-eoa", rt(A.mag2.lens, 100, 70), "外部账户？ ✗", "lab-rs hide", "l");
labels += wlab("lb-own2", rt(A.own2.head, 0, -70), "owner", "lab-ink hide");
labels += wlab("lb-ren", rt(A.shr.top, 0, 0), "renounceOwnership()", "lab-r hide");
labels += wlab("lb-up", rt(A.up.top, 0, 0), "upgrade · 只认 owner", "hide");
labels += wlab("lb-never", rt(A.up.top, 0, 0), "upgrade · 永远按不下", "lab-g hide");
labels += wlab("lb-wm", rt(A.wm.top, 0, 0), "Solidity 0.4 · 构造函数 = Wallet()", "hide");
labels += wlab("lb-wm2", rt(A.wm.top, 0, 0), "改名为 MyWallet", "lab-r hide");
labels += wlab("lb-ctor", rt(A.ctor.front, 90, 30), "Wallet() · 谁都能调用", "lab-rs hide", "l");

// ================================================================ times
const TM = {
  two0: w("两次事", 0),
  jul1: w("7 月", 1), call1: w("不认识的调用", 1), dc1: w("delegatecall", 1), lib1: w("库合约", 1),
  iw2: w("initWallet", 2), atk2: w("攻击者", 2), via2: w("通过钱包", 2), own2: w("owner", 2),
  eth3: w("15.3", 3), go3: w("转走", 3), usd3: w("3000", 3),
  nov4: w("11 月", 4), self4: w("库合约自己", 4), kill4: w("销毁", 4),
  same5: w("教训相同", 5), impl5: w("实现合约本身", 5), lock5: w("锁死", 5),
  s6: L(6).start, n4_6: w("第四种", 6), any6: w("任意外部调用", 6),
  ex7: w("execute", 7), tgt7: w("目标地址", 7), data7: w("调用数据", 7), who7: w("调用者决定", 7),
  hold8: w("持有", 8), auth8: w("授权", 8),
  key9: w("私钥", 9),
  s10: L(10).start, tok10: w("调用代币", 10), tf10: w("transferFrom", 10), self10: w("转给自己", 10),
  caller11: w("调用方", 11), authd11: w("被授权的合约", 11), pass11: w("通过", 11),
  dc12: w("delegatecall", 12), code12: w("攻击者的代码", 12), rw12: w("改写", 12),
  steal13: w("没有被偷", 13), lend13: w("借走", 13),
  s14: L(14).start, n5_14: w("第五种", 14),
  new15: w("新地址", 15), one15: w("一步就生效", 15), typo15: w("地址输错", 15), lost15: w("永久丢失", 15),
  fix16: w("两步转移", 16), self16: w("必须自己调用", 16), acc16: w("acceptOwnership", 16), prove16: w("真的能用", 16),
  s17: L(17).start, n6_17: w("第六种", 17),
  sig18: w("用签名", 18), ecr18: w("ecrecover", 18), bad18: w("无效签名", 18), zero18: w("零地址", 18),
  var19: w("签名人变量", 19), def19: w("默认值", 19), eq19: w("两边相等", 19), pass19: w("通过了", 19),
  zx20: w("排除零地址", 20),
  s21: L(21).start, three21: w("三个", 21),
  s22: L(22).start, len22: w("代码长度是零", 22), eoa22: w("外部账户", 22), ctor22: w("构造函数里", 22), len22b: w("代码长度也是零", 22),
  s23: L(23).start, ren23: w("renounceOwnership", 23), no23: w("无法恢复", 23), chk23: w("先确认", 23),
  s24: L(24).start, sol24: w("Solidity", 24), same24: w("同名", 24), rn24: w("一改名", 24), pub24: w("公共函数", 24),
};

// ================================================================ screen-layer HTML
const codeRow = (id, txt) => `<div class="c-row" id="${id}"><span class="c-bar" id="${id}-bar" style="opacity:0"></span>${txt}</div>`;
const CD = { x: 56, y: 118, w: 1000 }, CE_ = { x: 56, y: 118, w: 1180 }, CF = { x: 56, y: 118, w: 1290 };
const rowY = (c, r) => c.y + 24 + 56 + r * 50 + 25;
const cardD = `<div class="k-code hide" id="cardD"><div class="c-head">任意外部调用<span class="c-tag">示例</span></div>
  ${codeRow("cd0", "function execute(address target, bytes calldata data)")}
  ${codeRow("cd1", "    external {")}
  ${codeRow("cd2", "  target.call(data);  <span class=\"c-red\">// ✗ 目标和数据都由调用者决定</span>")}
  ${codeRow("cd3", "}")}
  <div class="c-row hide" id="cd2x" data-layout-allow-overlap>  target.<span class="c-red">delegatecall</span>(data);  <span class="c-red">// ✗ 执行攻击者的代码</span></div>
  <div class="c-row c-cm hide" id="cd4">// data = transferFrom(受害者, 攻击者, 金额)</div></div>`;
const cardE = `<div class="k-code hide" id="cardE"><div class="c-head">单步所有权转移<span class="c-tag">示例</span></div>
  ${codeRow("ce0", "function transferOwnership(address newOwner)")}
  ${codeRow("ce1", "    external onlyOwner { owner = newOwner; }  <span class=\"c-red\">// ✗ 一步生效</span>")}
  ${codeRow("ce2", "<span class=\"c-ok\">// ✓ Ownable2Step：新 owner 必须调用 acceptOwnership()</span>")}</div>`;
const cardF = `<div class="k-code hide" id="cardF"><div class="c-head">签名鉴权写错<span class="c-tag">示意</span></div>
  ${codeRow("cf0", "address signer = ecrecover(hash, v, r, s);  <span class=\"c-cm\">// 无效签名 → address(0)</span>")}
  ${codeRow("cf1", "require(signer == admin);  <span class=\"c-red\">// admin 未设置 = address(0) → 通过 ✗</span>")}</div>`;
const DEF = ["缺少权限检查", "tx.origin", "未保护的初始化", "任意 call / delegatecall", "单步所有权转移", "签名鉴权写错"];
const slots = `<div id="slots" class="hide" data-layout-allow-overflow><span class="sl-h">六种缺陷</span>${DEF.map((d, i) => `<span class="sl${i < 3 ? " sl-on" : ""}" id="sl${i}">${i + 1}</span>`).join("")}
  ${DEF.map((d, i) => `<span class="sl-name hide" id="sln${i}">${d}</span>`).join("")}</div>`;
const tline = `<div id="tline" class="hide"><div class="tl-h">Parity · 2017 · 以太坊</div><div class="tl-bar"></div>
  <div class="tl-n" id="tn0"><i></i><b>7 月</b><span>钱包被接管</span></div>
  <div class="tl-n" id="tn1"><i></i><b>11 月</b><span>库合约被接管 · 销毁</span></div>
  <div class="tl-src">公开报道</div></div>`;
const dotsHtml = Array.from({ length: 16 }, (_, i) => `<span class="dt${i === 15 ? " dt-h" : ""}" id="dt${i}"></span>`).join("");
const loss = `<div id="loss" class="hide"><div class="ls-big">约 15.3 万 ETH</div><div class="ls-sub">被转走</div>
  <div class="ls-dots">${dotsHtml}</div><div class="ls-leg"><span class="dt"></span>每点 = 1 万 ETH · 最后一点表示"约"</div>
  <div class="ls-usd hide" id="lsusd">约合 3000 万美元</div><div class="ls-src">公开报道</div></div>`;
const bigBorrow = `<div id="borrow" class="hide"><div class="bw-t">权限没有被偷 · 是<b>被借走</b>了</div><span class="bw-tag">解读</span></div>`;
const zchk = `<div id="zchk" class="hide">比对前先排除零地址</div>`;
// term cards (RETROFIT-deps rule 2) — moved down when a timeline / code card holds the top-left
const TC = termCards([
  { id: "dc", t: "delegatecall", d: "在自己的存储上执行别的合约的代码", at: TM.dc1, top: 280 },
  { id: "auth", t: "代币授权", d: "允许某个地址代你转走一定额度的币", at: TM.auth8, top: 320 },
  { id: "ecr", t: "ecrecover", d: "从签名算出签名人地址的函数", at: TM.ecr18, top: 360 },
  { id: "ren", t: "renounceOwnership", d: "放弃 owner 权限的函数", at: TM.ren23, top: 240 },
]);

// red / teal dashed lines from code rows to the scene (screen layer)
const exBtn = A.ex.btns[0];
const dD = dashCurve("dD", [CD.x + CD.w - 20, rowY(CD, 2)], sc("exec", exBtn), { c1: [CD.x + CD.w + 120, rowY(CD, 2) + 40], c2: [sc("exec", exBtn)[0] - 60, sc("exec", exBtn)[1] - 200] });
const flagP = [A.mbx.top[0] - 40, A.mbx.top[1] + 30];
const dE = dashCurve("dE", [CE_.x + CE_.w - 20, rowY(CE_, 2)], sc("own", flagP), { color: "#1d93ba", c1: [CE_.x + CE_.w + 60, rowY(CE_, 2) + 120], c2: [sc("own", flagP)[0] + 200, sc("own", flagP)[1] - 200] });
const rd3 = A.fp.readers[3];
const dF = dashCurve("dF", [CF.x + CF.w - 20, rowY(CF, 1)], sc("sig", rd3), { c1: [CF.x + CF.w + 80, rowY(CF, 1) + 120], c2: [sc("sig", rd3)[0] + 60, sc("sig", rd3)[1] - 220] });
// world: authorization doc → token machine (teal)
const dT = dashCurve("dT", P(LY.MC, 60, 120, 140), P(LY.TOK, -40, 40, 140), { color: "#1d93ba", c1: P(LY.MC, 300, 160, 340), c2: P(LY.TOK, -200, 40, 340), sw: 5 });
const worldLines = `<svg class="wsvg" style="left:0;top:0" width="10" height="10" overflow="visible">${dT.svg}</svg>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .k-code .c-row { font-size: 30px; font-variant-ligatures: none; overflow: hidden; }
    .k-code .c-ok { color: #1f9d55; font-weight: 800; }
    .k-code .c-tag { font-size: 30px; }
    #cd2x { position: absolute; left: 34px; top: 80px; right: 34px; background: #ffffff; }
    #cardD { left: ${CD.x}px; top: ${CD.y}px; width: ${CD.w}px; }
    #cardE { left: ${CE_.x}px; top: ${CE_.y}px; width: ${CE_.w}px; }
    #cardF { left: ${CF.x}px; top: ${CF.y}px; width: ${CF.w}px; }
    #slots { position: absolute; left: 56px; top: 34px; height: 56px; display: flex; align-items: center; gap: 10px; }
    #slots .sl-h { font-size: 30px; font-weight: 900; margin-right: 8px; }
    #slots .sl { width: 46px; height: 46px; border-radius: 50%; border: 3px dashed #bdb5a6; display: inline-flex; align-items: center; justify-content: center;
      font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 800; color: #7d776b; background: #f6f3ec; }
    #slots .sl.sl-on { border: 3px solid #1c1c1c; background: #1c1c1c; color: #ffffff; }
    #slots .sl-name { position: absolute; left: 520px; top: 6px; white-space: nowrap; font-size: 30px; font-weight: 900; color: #ffffff; background: #e0453a; border-radius: 10px; padding: 2px 14px 4px; }
    #tline { position: absolute; left: 56px; top: 40px; width: 760px; height: 210px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #tline .tl-h { position: absolute; left: 28px; top: 16px; font-size: 34px; font-weight: 900; }
    #tline .tl-bar { position: absolute; left: 60px; right: 60px; top: 112px; height: 6px; background: #d9d3c7; border-radius: 3px; }
    #tline .tl-n { position: absolute; top: 96px; width: 320px; }
    #tline #tn0 { left: 60px; } #tline #tn1 { left: 400px; }
    #tline .tl-n i { position: absolute; left: 0; top: 0; width: 38px; height: 38px; border-radius: 50%; background: #ffffff; border: 5px solid #bdb5a6; }
    #tline .tl-n b { position: absolute; left: 50px; top: -4px; font-size: 34px; font-weight: 900; color: #6d685e; }
    #tline .tl-n span { position: absolute; left: 0; top: 54px; white-space: nowrap; font-size: 30px; font-weight: 800; color: #6d685e; }
    #tline .tl-src { position: absolute; right: 22px; top: 18px; font-size: 28px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 10px; padding: 0 10px 2px; }
    #loss { position: absolute; left: 1220px; top: 130px; width: 640px; background: #fffdf8; border-radius: 18px; padding: 22px 28px 26px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); border-left: 10px solid #e0453a; }
    #loss .ls-big { font-size: 72px; font-weight: 900; line-height: 1.05; white-space: nowrap; }
    #loss .ls-sub { font-size: 32px; font-weight: 800; color: #c3352b; margin-top: 4px; }
    #loss .ls-dots { display: grid; grid-template-columns: repeat(8, 48px); gap: 14px; margin-top: 18px; }
    #loss .dt { display: inline-block; width: 44px; height: 44px; border-radius: 50%; background: #e0453a; }
    #loss .dt-h { opacity: 0.35; }
    #loss .ls-leg { display: flex; align-items: center; gap: 10px; margin-top: 16px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #loss .ls-leg .dt { width: 22px; height: 22px; }
    #loss .ls-usd { font-size: 44px; font-weight: 900; margin-top: 12px; white-space: nowrap; }
    #loss .ls-src { position: absolute; right: 24px; bottom: 26px; font-size: 28px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 10px; padding: 0 10px 2px; }
    #borrow { position: absolute; left: 0; right: 0; top: 420px; text-align: center; }
    #borrow .bw-t { display: inline-block; font-size: 64px; font-weight: 900; background: #fffdf8; border-radius: 20px; padding: 18px 40px; box-shadow: 0 14px 30px rgba(70,60,40,0.14); }
    #borrow .bw-t b { color: #e0453a; }
    #borrow .bw-tag { position: relative; top: -40px; margin-left: 14px; font-size: 30px; font-weight: 700; color: #6d685e; background: #fffdf8; border: 2px solid #cfc7b8; border-radius: 10px; padding: 2px 12px 4px; }
    #zchk { position: absolute; right: 48px; top: 110px; font-size: 32px; font-weight: 800; background: #fffdf8; border: 3px solid #cfc7b8; border-radius: 12px; padding: 6px 18px 8px; }
${termCss()}
    .scr-layer { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: visible; pointer-events: none; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        ${worldLines}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg class="scr-layer" id="scr" data-layout-ignore viewBox="0 0 1920 1080" width="1920" height="1080">${dD.svg}${dE.svg}${dF.svg}</svg>
      ${tline}${loss}${slots}${cardD}${cardE}${cardF}${bigBorrow}${zchk}
      ${pills(3, { sections: SCRIPT.sections })}
      ${TC.html}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 借出的权限</div><div class="t-sub">任意调用 · 单步转移 · 签名鉴权</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const K5 = window.KITX05, K3 = window.KITX03, K1 = window.KITX01;
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const op = (sel, t, to, d) => K5.fade(tl, sel, t, to, d);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const slideIn = (sel, t) => tl.fromTo(sel, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t);
      const slideOut = (sel, t) => tl.to(sel, { opacity: 0, x: -40, duration: 0.3, ease: "power2.in" }, t);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.35, ease: "power2.in" }, t); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d || 0.45);
      const flyTo = (id, from, to, t, d, liftH) => K5.fly(tl, id, t, to[0] - from[0], to[1] - from[1], d || 0.7, liftH || 60);
      const flyBack = (id, t, d) => K5.fly(tl, id, t, 0, 0, d || 0.5, 0);
      const slotOn = (i, t) => { tl.to("#sl" + i, { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", borderStyle: "solid", color: "#ffffff", duration: 0.25 }, t); pop("#sln" + i, t + 0.1); };
      KIT.camSet(tl, CAMS.park);
      // things that are not there yet
      ["atkP", "mc", "fp", "ex", "dial", "post", "tok", "vic", "vkey", "atk", "mag", "cab", "own", "mbx", "tray", "rec", "sig", "kadm",
       "lesson", "sb0", "sb1", "sb2", "scm", "scf", "mag2", "own2", "shr", "up", "wm", "ctor"].forEach(hideG);
      ["#let1", "#let2", "#let3", "#man", "#man2", "#auth", "#kc", "#k0", "#kc2"].forEach((s) => tl.set(s, { opacity: 0 }, 0));
      tl.set("#scm", { opacity: 0.5 }, 0);

      // ===== 0–1.6 title card → flies into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);

      // ===== L0 two incidents in one year; Parity corner intact
      pop("#tline", ${f(TM.two0 - 0.3)}, 0.35);
      pop("#lb-lib", 1.8); pop("#lb-wal", 2.1);
      K1.dash(tl, ["pm-flow", "pr0-flow", "pr1-flow"], 1.6, 24, 900);

      // ===== L1 July: the wallet forwards an unknown call via delegatecall; library code comes back
      tl.to("#tn0 i", { borderColor: "#e0453a", backgroundColor: "#e0453a", duration: 0.25 }, ${f(TM.jul1)});
      tl.to("#tn0 b, #tn0 span", { color: "#1c1c1c", duration: 0.25 }, ${f(TM.jul1)});
      out("#lb-wal, #lb-lib", ${f(TM.jul1)}, 0.2);
      KIT.cam(tl, ${f(TM.jul1)}, CAMS.parkL, 1.4);
      op("#let1", ${f(TM.call1 - 0.3)}, 1, 0.2);
      flyTo("let1", ${JSON.stringify(A.let1.center)}, ${JSON.stringify(P(W1, 0, 0, 120))}, ${f(TM.call1 + 0.3)}, 0.6, 30);
      op("#let1", ${f(TM.call1 + 0.85)}, 0, 0.1);
      flyTo("let1", ${JSON.stringify(A.let1.center)}, ${JSON.stringify(P(LY.LIB, -150, 0, LY.PIPE_Z + 10))}, ${f(TM.dc1 - 0.2)}, 0.9, 40);
      op("#let1", ${f(TM.dc1 - 0.2)}, 1, 0.1); op("#let1", ${f(TM.dc1 + 0.7)}, 0, 0.1);
      
      K3.spin(tl, "lib", ${f(TM.dc1 + 0.6)}, 1.2, 1);
      op("#man", ${f(TM.lib1 + 0.2)}, 1, 0.2);
      K3.fly(tl, "man", ${f(TM.lib1 + 0.3)}, ${f(P(W1, 70, 210, 0)[0] - P(LY.LIB, 0, 0, 0)[0])}, ${f(P(W1, 70, 210, 0)[1] - P(LY.LIB, 0, 0, 0)[1])}, 1.0, 140);
      pop("#lb-dc", ${f(TM.lib1 + 0.6)});

      // ===== L2 initWallet unprotected; attacker calls it through the wallet → owner
      out("#lb-dc", ${f(TM.iw2 - 0.3)}, 0.2);
      K3.book(tl, "man", ${f(TM.iw2 - 0.2)}, 180, 0.7);
      pop("#lb-iw", ${f(TM.iw2 + 0.2)});
      grow("atkP", ${f(TM.atk2 - 0.2)}); pop("#lb-atkP", ${f(TM.atk2 + 0.2)});
      op("#let2", ${f(TM.via2 - 0.1)}, 1, 0.15);
      flyTo("let2", ${JSON.stringify(A.let2.center)}, ${JSON.stringify(P(W1, 0, 0, 120))}, ${f(TM.via2 + 0.1)}, 0.7, 50);
      op("#let2", ${f(TM.via2 + 0.8)}, 0, 0.1);
      out("#lb-iw", ${f(TM.own2 - 0.3)}, 0.2);
      pop("#lb-own1", ${f(TM.own2)});

      // ===== L3 ~153k ETH out of the wallet
      KIT.door(tl, "wal0", ${f(TM.eth3 - 0.6)}, 105, 0.8);
      op("#man", ${f(TM.eth3 - 0.6)}, 0, 0.3);
      ${JSON.stringify([0, 1, 2])}.forEach((k) => { op("#gb" + k, ${f(TM.eth3)} + k * 0.2, 1, 0.1);
        flyTo("gb" + k, ${JSON.stringify(A.gb0.c)}, ${JSON.stringify(P(LY.ATK_P, 40, 40, 60))}, ${f(TM.eth3 + 0.05)} + k * 0.2, 0.8, 80); });
      pop("#loss", ${f(TM.eth3 - 0.2)}, 0.3);
      for (let i = 0; i < 16; i++) tl.fromTo("#dt" + i, { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.eth3 + 0.2)} + i * 0.08);
      pop("#lsusd", ${f(TM.usd3)});

      // ===== L4 November: the library itself is taken over, then destroyed
      out("#loss", ${f(L(4).start - 0.2)}, 0.25);
      KIT.door(tl, "wal0", ${f(L(4).start - 0.2)}, 0, 0.6);
      out("#lb-own1, #lb-atkP, #gb0, #gb1, #gb2", ${f(L(4).start - 0.2)}, 0.2);
      shrink("atkP", ${f(L(4).start - 0.1)});
      KIT.cam(tl, ${f(L(4).start - 0.2)}, CAMS.park, 1.2);
      tl.to("#tn1 i", { borderColor: "#e0453a", backgroundColor: "#e0453a", duration: 0.25 }, ${f(TM.nov4)});
      tl.to("#tn1 b, #tn1 span", { color: "#1c1c1c", duration: 0.25 }, ${f(TM.nov4)});
      tl.to("#tn0 i", { backgroundColor: "#ffffff", duration: 0.25 }, ${f(TM.nov4)});
      pop("#lb-libown", ${f(TM.self4 - 0.1)});
      out("#lb-lib", ${f(TM.self4 - 0.1)}, 0.15);
      K5.press(tl, "lp", 1, ${f(TM.kill4 - 0.4)}, { status: "red" });
      KIT.broke(tl, "lib", ${f(TM.kill4)}, { ghost: 0.3 });
      tl.fromTo("#smk", { opacity: 0, y: 20 }, { opacity: 1, y: -30, duration: 0.6, ease: "power2.out", immediateRender: false }, ${f(TM.kill4)});
      tl.to("#smk", { opacity: 0, y: -80, duration: 0.9, ease: "power1.in" }, ${f(TM.kill4 + 1.0)});
      pop("#lb-kill", ${f(TM.kill4 + 0.2)});
      out("#pm-flow, #pr0-flow, #pr1-flow", ${f(TM.kill4 + 0.3)}, 0.6);

      // ===== L5 same lesson: initialise or lock the implementation itself
      out("#lb-libown, #lb-kill", ${f(TM.same5 - 0.2)}, 0.2);
      tl.to("#tn0 i", { backgroundColor: "#e0453a", duration: 0.25 }, ${f(TM.same5)});
      grow("lesson", ${f(TM.impl5 - 0.2)}, 0.5);
      KIT.cam(tl, ${f(TM.impl5 - 0.4)}, CAMS.lesson, 1.2);

      // ===== L6 → main avenue; defect 4; card D
      out("#tline", ${f(TM.s6 - 0.2)}, 0.25); shrink("lesson", ${f(TM.s6)});
      ["mc", "fp", "cab"].forEach((id, k) => grow(id, ${f(TM.s6 - 0.2)} + k * 0.12, 0.5));
      KIT.cam(tl, ${f(TM.s6 - 0.3)}, CAMS.exec, 1.6);
      pop("#lb-mc", ${f(TM.s6 + 1.2)});
      pop("#slots", ${f(TM.n4_6 - 0.2)}, 0.3);
      slotOn(3, ${f(TM.n4_6 + 0.2)});
      slideIn("#cardD", ${f(TM.any6)});

      // ===== L7 public execute: target dial + data slot, both set by the caller
      grow("ex", ${f(TM.ex7 - 0.3)}); pop("#lb-ex", ${f(TM.ex7 + 0.2)});
      op("#cd0-bar", ${f(TM.ex7)}, 1, 0.15);
      grow("dial", ${f(TM.tgt7 - 0.3)}); pop("#lb-dial", ${f(TM.tgt7)});
      grow("post", ${f(TM.data7 - 0.3)}); pop("#lb-post", ${f(TM.data7)});
      op("#cd0-bar", ${f(TM.who7 - 0.2)}, 0, 0.15); op("#cd2-bar", ${f(TM.who7 - 0.2)}, 1, 0.15);
      KIT.draw(tl, "dD", ${f(TM.who7 - 0.1)}, 0.5);
      pop("#lb-who", ${f(TM.who7)});

      // ===== L8 the contract holds the victim's token allowance
      out("#dD, #lb-who", ${f(L(8).start - 0.1)}, 0.25); op("#cd2-bar", ${f(L(8).start - 0.1)}, 0, 0.15);
      ["#cd0", "#cd1", "#cd3"].forEach((r) => tl.to(r, { height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut" }, ${f(L(8).start - 0.1)}));
      KIT.cam(tl, ${f(L(8).start - 0.1)}, CAMS.main, 1.2);
      grow("vic", ${f(L(8).start)}); pop("#lb-vic", ${f(L(8).start + 0.4)});
      grow("tok", ${f(L(8).start + 0.3)}); pop("#lb-tok", ${f(L(8).start + 0.7)});
      op("#auth", ${f(TM.hold8 - 0.1)}, 1, 0.2);
      flyTo("auth", ${JSON.stringify(A.auth.center)}, ${JSON.stringify(P(LY.AUTH1, 0, 0, 95))}, ${f(TM.hold8 + 0.2)}, 1.0, 80);
      pop("#lb-auth", ${f(TM.auth8 + 0.3)});

      // ===== L9 no private key needed — the key stays with the victim
      grow("vkey", ${f(TM.key9 - 0.4)}, 0.4);
      pop("#lb-key", ${f(TM.key9 + 0.1)});

      // ===== L10 attacker dials the token, posts transferFrom → contract calls the token with the allowance
      grow("atk", ${f(TM.s10 - 0.1)}); pop("#lb-atk", ${f(TM.s10 + 0.3)});
      out("#lb-dial", ${f(TM.tok10 - 0.2)}, 0.15);
      KIT.rot(tl, "dial-ring-0", ${f(TM.tok10)}, 220, 0.9, "power2.inOut");
      pop("#lb-tgt", ${f(TM.tok10 + 0.4)});
      op("#let3", ${f(TM.tf10 - 0.5)}, 1, 0.15);
      out("#lb-post", ${f(TM.tf10 - 0.3)}, 0.15);
      flyTo("let3", ${JSON.stringify(A.let3.center)}, ${JSON.stringify(A.post.slot)}, ${f(TM.tf10 - 0.3)}, 0.7, 60);
      op("#let3", ${f(TM.tf10 + 0.4)}, 0, 0.1);
      tl.to("#post-glow", { opacity: 1, duration: 0.15 }, ${f(TM.tf10 + 0.3)});
      pop("#lb-tf", ${f(TM.tf10 + 0.3)});
      pop("#cd4", ${f(TM.tf10 + 0.3)});
      K5.press(tl, "ex", 0, ${f(TM.self10 - 0.4)}, { status: "red" });
      K3.spin(tl, "mc", ${f(TM.self10 - 0.2)}, 1.4, 1.2);
      KIT.draw(tl, "dT", ${f(TM.self10)}, 0.6);

      // ===== L11 token sees the authorised contract → allowance check passes → coins to the attacker (key frame)
      out("#lb-tgt, #lb-tf, #lb-auth", ${f(TM.caller11 - 0.3)}, 0.2);
      tl.to("#post-glow", { opacity: 0, duration: 0.2 }, ${f(TM.caller11 - 0.3)});
      grow("mag", ${f(TM.caller11 - 0.2)}, 0.4);
      pop("#lb-caller", ${f(TM.authd11)});
      pop("#lb-pass", ${f(TM.pass11 - 0.1)}); out("#lb-tok", ${f(TM.pass11 - 0.1)}, 0.2);
      [0, 1, 2].forEach((k) => { op("#tc" + k, ${f(TM.pass11)} + k * 0.15, 1, 0.1);
        flyTo("tc" + k, ${JSON.stringify(A.tc0.c)}, ${JSON.stringify(P(LY.ATK, 30, 50, 90))}, ${f(TM.pass11 + 0.05)} + k * 0.15, 0.8, 90); });
      out("#lb-atk", ${f(TM.pass11 + 0.6)}, 0.15); pop("#lb-out", ${f(TM.pass11 + 0.8)});

      // ===== L12 with delegatecall the attacker's code rewrites this contract's storage
      out("#lb-caller, #lb-pass, #dT, #tc0, #tc1, #tc2", ${f(L(12).start - 0.1)}, 0.25);
      shrink("mag", ${f(L(12).start - 0.1)});
      out("#lb-out", ${f(TM.dc12 - 0.1)}, 0.2);
      op("#cd2x", ${f(TM.dc12)}, 1, 0.25); op("#cd2", ${f(TM.dc12)}, 0, 0.2);
      op("#man2", ${f(TM.dc12 - 0.2)}, 1, 0.2);
      pop("#lb-dlg", ${f(TM.dc12 + 0.1)});
      K3.fly(tl, "man2", ${f(TM.code12)}, ${f(A.post.slot[0] - P(LY.ATK, 80, -60, 0)[0])}, ${f(A.post.slot[1] - P(LY.ATK, 80, -60, 0)[1])}, 0.8, 70);
      op("#man2", ${f(TM.code12 + 0.75)}, 0, 0.1);
      K3.spin(tl, "mc", ${f(TM.code12 + 0.6)}, 1.6, -1.5);
      KIT.led(tl, "mc-led", ${f(TM.code12 + 0.6)}, "red");
      [0, 1, 2].forEach((i, k) => { K3.drawer(tl, "cab", i, ${f(TM.rw12 - 0.3)} + k * 0.15, 60 + k * 15, 0.4); K3.mark(tl, "cab", i, ${f(TM.rw12)} + k * 0.15, "red"); });
      pop("#lb-cab", ${f(TM.rw12 + 0.2)});
      out("#lb-dlg", ${f(TM.rw12 + 0.8)}, 0.2);

      // ===== L13 not stolen — borrowed
      out("#lb-cab", ${f(TM.steal13 - 0.3)}, 0.2);
      pop("#borrow", ${f(TM.steal13 - 0.2)}, 0.35);
      out("#borrow", ${f(TM.s14 + 0.3)}, 0.25);
      K5.fly(tl, "auth", ${f(TM.lend13 - 0.3)}, ${f(P(LY.AUTH1, 0, 0, 95)[0] - A.auth.center[0])}, ${f(P(LY.AUTH1, 0, 0, 95)[1] - A.auth.center[1] - 60)}, 0.4, 0);
      K5.fly(tl, "auth", ${f(TM.lend13 + 0.4)}, ${f(P(LY.AUTH1, 0, 0, 95)[0] - A.auth.center[0])}, ${f(P(LY.AUTH1, 0, 0, 95)[1] - A.auth.center[1])}, 0.4, 0);
      tl.to("#auth-body", { filter: "drop-shadow(0 0 6px #e0453a)", duration: 0.2 }, ${f(TM.lend13 - 0.3)});

      // ===== L14 defect 5: one-step ownership transfer
      const c14 = ${f(TM.s14 - 0.25)};
      out("#lb-vic, #lb-key, #lb-tok, #lb-ex, #cd4, #auth, #lb-mc", c14, 0.25);
      ["vic", "vkey", "atk", "tok", "dial", "post"].forEach((id) => shrink(id, c14));
      [0, 1, 2].forEach((i) => { K3.drawer(tl, "cab", i, c14, 0, 0.4); K3.mark(tl, "cab", i, c14, "off"); });
      KIT.led(tl, "mc-led", c14, "green");
      slideOut("#cardD", c14); out("#sln3", c14, 0.2);
      KIT.cam(tl, c14, CAMS.own, 1.3);
      slotOn(4, ${f(TM.n5_14)});
      slideIn("#cardE", ${f(TM.n5_14 + 0.2)});
      grow("own", ${f(TM.n5_14 + 0.1)}); pop("#lb-own", ${f(TM.n5_14 + 0.6)});
      op("#kc", ${f(TM.n5_14 + 0.5)}, 1, 0.25);

      // ===== L15 typed one wrong character → the keycard is gone; readers only accept a non-existent address
      grow("mbx", ${f(TM.new15 - 0.3)}); pop("#lb-mbx", ${f(TM.new15 + 0.2)});
      op("#ce1-bar", ${f(TM.new15)}, 1, 0.15);
      flyTo("kc", ${JSON.stringify(A.kc.center)}, ${JSON.stringify(P(LY.MBX, 0, 0, 160))}, ${f(TM.one15 - 0.2)}, 0.8, 90);
      op("#kc", ${f(TM.one15 + 0.55)}, 0, 0.1);
      pop("#lb-one", ${f(TM.one15 + 0.2)});
      out("#lb-one", ${f(TM.lost15 - 0.4)}, 0.2);
      tl.to("#mbx", { opacity: 0, filter: "blur(10px)", duration: 1.0, ease: "power1.in" }, ${f(TM.lost15 - 0.3)});
      out("#lb-mbx", ${f(TM.lost15 + 0.2)}, 0.4);
      [0, 1, 2, 3, 4].forEach((i) => K5.rd(tl, "fp", i, ${f(TM.lost15)} + i * 0.06, "red"));
      pop("#lb-lost", ${f(TM.lost15 + 0.3)});

      // ===== L16 fix: two-step transfer — pending tray, the new owner raises the acceptOwnership flag
      const r16 = ${f(TM.fix16 - 0.6)};
      out("#lb-lost", r16, 0.2); op("#ce1-bar", r16, 0, 0.15);
      [0, 1, 2, 3, 4].forEach((i) => K5.rd(tl, "fp", i, r16, "off"));
      tl.to("#mbx", { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, r16);
      flyBack("kc", r16, 0.01); op("#kc", r16 + 0.1, 1, 0.3);
      pop("#lb-redo", ${f(TM.fix16)}); pop("#lb-mbxok", r16 + 0.3);
      op("#ce2-bar", ${f(TM.fix16)}, 1, 0.15);
      grow("tray", ${f(TM.fix16 + 0.1)}); pop("#lb-tray", ${f(TM.fix16 + 0.5)});
      flyTo("kc", ${JSON.stringify(A.kc.center)}, ${JSON.stringify(P(LY.TRAY, 0, 0, 66 + 26))}, ${f(TM.fix16 + 0.6)}, 0.7, 60);
      KIT.rot(tl, "mbx-flag", ${f(TM.self16 + 0.3)}, -90, 0.6, "back.out(1.6)");
      out("#lb-redo", ${f(TM.acc16 - 0.4)}, 0.2);
      pop("#lb-acc", ${f(TM.acc16 - 0.2)});
      KIT.draw(tl, "dE", ${f(TM.acc16)}, 0.5);
      flyTo("kc", ${JSON.stringify(A.kc.center)}, ${JSON.stringify(P(LY.MBX, 0, 0, 160))}, ${f(TM.prove16 - 0.4)}, 0.8, 80);
      op("#kc", ${f(TM.prove16 + 0.35)}, 0, 0.15);
      KIT.swap(tl, "#lb-acc", "#lb-done", ${f(TM.prove16 + 0.3)}, 0.25);

      // ===== L17 defect 6: signature auth
      const c17 = ${f(TM.s17 - 0.2)};
      out("#dE, #lb-done, #lb-tray, #lb-redo, #lb-own, #lb-mbxok", c17, 0.2); op("#ce2-bar", c17, 0, 0.15);
      ["own", "mbx", "tray"].forEach((id) => shrink(id, c17));
      slideOut("#cardE", c17); out("#sln4", c17, 0.2);
      KIT.cam(tl, c17, CAMS.sig, 1.3);
      slotOn(5, ${f(TM.n6_17)});
      slideIn("#cardF", ${f(TM.n6_17 + 0.3)});

      // ===== L18 an invalid signature → ecrecover returns address(0)
      grow("rec", ${f(TM.sig18)}); pop("#lb-rec", ${f(TM.ecr18)});
      grow("sig", ${f(TM.sig18 + 0.3)});
      op("#cf0-bar", ${f(TM.ecr18)}, 1, 0.15);
      tl.to("#sig-tag", { opacity: 0, duration: 0.01 }, 0);
      pop("#lb-sig", ${f(TM.bad18 - 0.1)});
      out("#lb-sig", ${f(TM.bad18 + 0.9)}, 0.15);
      { const g = $("sig"); tl.to("#sig", { x: ${f(A.rec.in[0] - P(LY.SIG)[0])}, y: ${f(A.rec.in[1] - P(LY.SIG)[1] - 80)}, scale: 0.5, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.6, ease: "power2.inOut" }, ${f(TM.bad18 + 0.9)});
        tl.to("#sig", { y: ${f(A.rec.in[1] - P(LY.SIG)[1] + 20)}, opacity: 0, duration: 0.3, ease: "power2.in" }, ${f(TM.bad18 + 1.5)}); }
      KIT.led(tl, "rec-led", ${f(TM.bad18 + 1.6)}, "blue");
      op("#k0", ${f(TM.zero18 - 0.3)}, 1, 0.2);
      tl.fromTo("#k0", { y: -40 }, { y: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, ${f(TM.zero18 - 0.3)});
      pop("#lb-zero", ${f(TM.zero18)});

      // ===== L19 the unset admin is also 0 → equal → passes
      op("#cf0-bar", ${f(TM.var19)}, 0, 0.15); op("#cf1-bar", ${f(TM.var19)}, 1, 0.15);
      grow("kadm", ${f(TM.var19)}, 0.3); op("#kadm", ${f(TM.var19)}, 1, 0.2);
      pop("#lb-adm", ${f(TM.def19)});
      KIT.draw(tl, "dF", ${f(TM.eq19 - 0.3)}, 0.5);
      K5.swipe(tl, "fp", 3, ${f(TM.eq19)}, true);
      pop("#lb-eq", ${f(TM.eq19 + 0.4)});
      K5.press(tl, "fp", 3, ${f(TM.pass19)}, { status: "red", hold: true });

      // ===== L20 so: rule out the zero address before comparing
      pop("#zchk", ${f(TM.zx20 - 0.1)});

      // ===== L21 three easy-to-miss checks: signboards along the road
      const c21 = ${f(TM.s21 - 0.2)};
      out("#dF, #lb-eq, #lb-adm, #lb-zero, #lb-rec, #k0, #kadm", c21, 0.2); out("#zchk", ${f(TM.three21 + 0.3)}, 0.2); op("#cf1-bar", c21, 0, 0.15);
      shrink("rec", c21); slideOut("#cardF", c21); out("#sln5", c21, 0.2);
      KIT.cam(tl, c21, CAMS.row, 1.6);
      [0, 1, 2].forEach((i) => { grow("sb" + i, ${f(TM.s21 + 0.3)} + i * 0.25, 0.5); pop("#lb-sb" + i, ${f(TM.s21 + 0.8)} + i * 0.25); });

      // ===== L22 i: code length 0 ≠ externally owned account
      KIT.cam(tl, ${f(TM.s22 - 0.1)}, CAMS.sb0, 1.2);
      out("#lb-sb1, #lb-sb2", ${f(TM.s22 - 0.1)}, 0.2);
      K3.sign(tl, "sb0", ${f(TM.len22)}, "myth");
      grow("scm", ${f(TM.len22 - 0.2)}); grow("scf", ${f(TM.len22)}); pop("#lb-scm", ${f(TM.len22 + 0.3)});
      grow("mag2", ${f(TM.len22 + 0.4)}, 0.4); pop("#lb-len", ${f(TM.len22 + 0.8)});
      pop("#lb-eoa", ${f(TM.eoa22)});
      K3.sign(tl, "sb0", ${f(TM.eoa22 + 0.3)}, "strike");
      K3.sign(tl, "sb0", ${f(TM.ctor22)}, "fact");
      K3.sign(tl, "sb0", ${f(TM.len22b)}, "impact");
      K3.sign(tl, "sb0", ${f(TM.len22b + 0.8)}, "lamp");

      // ===== L23 ii: renounceOwnership cannot be undone
      KIT.cam(tl, ${f(TM.s23 - 0.2)}, CAMS.sb1, 1.2);
      out("#lb-sb0, #lb-scm, #lb-len, #lb-eoa", ${f(TM.s23 - 0.2)}, 0.2);
      pop("#lb-sb1", ${f(TM.s23)});
      grow("own2", ${f(TM.s23 - 0.1)}); grow("shr", ${f(TM.s23 + 0.1)}); grow("up", ${f(TM.s23 + 0.2)});
      op("#kc2", ${f(TM.s23 + 0.2)}, 1, 0.2);
      pop("#lb-own2", ${f(TM.s23 + 0.4)}); pop("#lb-up", ${f(TM.s23 + 0.6)});
      K5.rd(tl, "up", 0, ${f(TM.s23 + 0.6)}, "green");
      K3.sign(tl, "sb1", ${f(TM.ren23)}, "myth");
      pop("#lb-ren", ${f(TM.ren23 + 0.2)});
      flyTo("kc2", ${JSON.stringify(A.kc2.center)}, ${JSON.stringify(A.shr.in)}, ${f(TM.ren23 + 0.6)}, 0.7, 70);
      op("#kc2", ${f(TM.ren23 + 1.25)}, 0, 0.1);
      op("#shr-strips", ${f(TM.ren23 + 1.3)}, 1, 0.3);
      K3.sign(tl, "sb1", ${f(TM.no23 - 0.2)}, "strike");
      K3.sign(tl, "sb1", ${f(TM.no23)}, "fact");
      K5.rd(tl, "up", 0, ${f(TM.no23)}, "red");
      K5.swipe(tl, "up", 0, ${f(TM.no23 + 0.3)}, false);
      KIT.swap(tl, "#lb-up", "#lb-never", ${f(TM.no23 + 0.5)}, 0.25);
      tl.to("#up-btn-0", { filter: "grayscale(1) brightness(0.8)", duration: 0.4 }, ${f(TM.no23 + 0.5)});
      K3.sign(tl, "sb1", ${f(TM.chk23)}, "impact");
      K3.sign(tl, "sb1", ${f(TM.chk23 + 0.8)}, "lamp");

      // ===== L24 iii: in 0.4 the constructor shares the contract name; rename → public function
      KIT.cam(tl, ${f(TM.s24 - 0.2)}, CAMS.sb2, 1.2);
      out("#lb-sb1, #lb-own2, #lb-ren, #lb-never", ${f(TM.s24 - 0.2)}, 0.2);
      pop("#lb-sb2", ${f(TM.s24)});
      grow("wm", ${f(TM.s24)}); pop("#lb-wm", ${f(TM.sol24 + 0.3)});
      K3.sign(tl, "sb2", ${f(TM.same24 - 0.4)}, "myth");
      K3.sign(tl, "sb2", ${f(TM.same24)}, "fact");
      K3.sign(tl, "sb2", ${f(TM.rn24 - 0.2)}, "strike");
      op("#wm2-w", ${f(TM.rn24)}, 1, 0.35); op("#wm", ${f(TM.rn24)}, 0, 0.35);
      KIT.swap(tl, "#lb-wm", "#lb-wm2", ${f(TM.rn24)}, 0.25);
      grow("ctor", ${f(TM.pub24 - 0.6)}, 0.5);
      K5.press(tl, "ctor", 0, ${f(TM.pub24 + 0.3)}, { status: "red" });
      pop("#lb-ctor", ${f(TM.pub24)});
      K3.sign(tl, "sb2", ${f(TM.pub24 + 0.4)}, "impact");
      K3.sign(tl, "sb2", ${f(TM.pub24 + 1.2)}, "lamp");
      // end: all six slots lit, still
      ${TC.js}
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
