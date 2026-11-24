// ep15/seg6「⑥ 先做这几件」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.permitF（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            ---- A 托管机房
//   hotA         
//   clockA       
//   bankB        ---- B 银行柜台
//   flowC        ---- C 4337 流水线
//   hashC        
//   payC         
//   ownerC       
//   bicoC        
//   envC         
//   D            ---- D 7702
//   plateD       
//   chainsD      
//   batchD       
//   devD         
//   E            ---- E 钥匙与守护人
//   passE        
//   sessionE     
//   F            ---- F 意图集市
//   intentF      
//   permitF      
//   EF           ---- across zones
//   wide         
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.wide (last segment; end card)

// ---- segment-only positions / cameras
const SA = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const CLR = SA(-10, 110);                                 // A: "清零授权" cheque final spot (left of the hot-wallet plate)
const RIGHT = [700, 300, 1820, 860];                       // close-ups that leave the left column for a code card
const R = (o, k) => L.rect(o, k);
const CAMS = {
  ...L.CAMS,
  acctC: L.fit([R(L.ACCOUNT, "accountSafe"), R(L.CHAIN_A, "chain3"), R(L.CHAIN_B, "chain3")], RIGHT),
  walletD: L.fit([R(L.PLATE_D, "addrPlate"), R(L.DCORE_OK, "coreModule"), R(L.BATCH, "docStanding"), R(L.MAG_D, "magnifier")], RIGHT),
  userD: L.fit([R(L.BATCH, "docStanding"), R(L.MAG_D, "magnifier"), R(L.BROWSER_D, "browserWin")], [300, 300, 1620, 860]),
  clrA: L.fit([R(L.PLATE_A, "addrPlate"), R(L.CORE_A, "coreModule"), R(L.SWITCH, "knifeSwitch"), R(L.CLOCK, "clock"), R(L.BEACON, "beacon"), R(CLR, "cheque")], [300, 300, 1620, 860]),
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E3, E4, E5, E9, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// wrap an object that ignores opts.scale around its ground point, rescale its anchors
const wrapK = (key, o, k) => {
  const [gx, gy] = at(o);
  return {
    wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`,
    fix: () => { for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } },
  };
};
const mv = (gid) => ({ wrap: (svg) => `<g id="${gid}">${svg}</g>` });   // movable wrapper (never id cam / root)

// ---------------------------------------------------------------- 世界物件
// A 托管机房 (aftermath: service switched off, leds red, red tag still hanging)
put("sgA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "sgA", style: "plate", text: "托管机房" }));
put("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "内部签名服务", leds: ["red", "red", "red"] }));
put("hot", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hot", variant: "hot" }));
put("plA", L.PLATE_A, E2.addrPlate(L.PLATE_A, { id: "plA", text: "热钱包地址" }));
put("tag", L.TAG_A.o, X.delegateTag(L.TAG_A.o, { id: "tag", ...L.TAG_A.opts, state: "attacker", target: "攻击者合约" }));
put("coreA", L.CORE_A, E10.coreModule(L.CORE_A, { id: "coreA", state: "attacker", scale: 0.7, ver: "攻击者合约" }));
put("sw", L.SWITCH, O.knifeSwitch(L.SWITCH, { id: "sw", on: false, text: "提现服务" }));
put("clk", L.CLOCK, O.clock(L.CLOCK, { id: "clk", h: 12, m: 0 }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("clr", CLR, E9.cheque(CLR, { id: "clr", title: "清零授权", labels: ["链 ID", "地址 = 0", "nonce"], signed: false }), 0, mv("clrMv"));
// B 银行柜台 (only seen in the street-wide shots)
put("sgB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "sgB", style: "plate", text: "比喻 · 银行柜台" }));
put("ctr", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "ctr", scale: 0.8 }));
put("chqB", L.CHEQUE_B, E9.cheque(L.CHEQUE_B, { id: "chqB", title: "转账单", scale: 0.8 }));
// C 4337 流水线
put("sgC", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "sgC", style: "plate", text: "ERC-4337" }));
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "EntryPoint" }));
put("acct", L.ACCOUNT, E5.accountSafe(L.ACCOUNT, { id: "acct" }));
put("pump", L.PUMP, X.gasPump(L.PUMP, { id: "pump" }));
put("uchq", L.UCHEQUE, E9.cheque(L.UCHEQUE, { id: "uchq", title: "用户签名", labels: ["链 ID", "nonce", "有效期", "…", "…"] }));
put("chA", L.CHAIN_A, O.chain(L.CHAIN_A, { id: "chA", n: 3, title: "链 A" }));
put("chB", L.CHAIN_B, O.chain(L.CHAIN_B, { id: "chB", n: 3, title: "链 B" }));
{ // green "防重放" barrier on the ground between chain A and chain B (native SVG)
  const cx = 5450, cy = -215, du = [0.819 * 230, -0.287 * 230];
  const g1 = [cx - du[0], cy - du[1]], g2 = [cx + du[0], cy + du[1]], hh = 46;
  add(SA(cx, cy), S.hid("bar", `<polygon points="${g1[0]},${g1[1]} ${g2[0]},${g2[1]} ${g2[0]},${g2[1] - hh} ${g1[0]},${g1[1] - hh}" fill="#1f9d55" fill-opacity="0.28" stroke="#1f9d55" stroke-width="4"/>`
    + `<line x1="${g1[0]}" y1="${g1[1] - hh / 2}" x2="${g2[0]}" y2="${g2[1] - hh / 2}" stroke="#1f9d55" stroke-width="4" stroke-dasharray="14 10"/>`));
  lb("lb-bar", [cx + 60, cy - 70], "防重放", "lab-gs");
}
// D 7702 门牌街
put("sgD", L.SIGN_D, E1.signBoard(L.SIGN_D, { id: "sgD", style: "plate", text: "EIP-7702" }));
const kD = wrapK("plD", L.PLATE_D, 1.3);
put("plD", L.PLATE_D, E2.addrPlate(L.PLATE_D, { id: "plD", text: "普通地址" }), 0, { wrap: kD.wrap }); kD.fix();
put("tagD", L.TAG_D.o, X.delegateTag(L.TAG_D.o, { id: "tagD", ...L.TAG_D.opts, state: "normal", target: "钱包实现" }));
put("dchq", L.DCHEQUE, E9.cheque(L.DCHEQUE, { id: "dchq", title: "授权", labels: ["链 ID", "合约地址", "nonce"] }));
put("okD", L.DCORE_OK, E10.coreModule(L.DCORE_OK, { id: "okD", scale: 0.7, ver: "钱包实现" }));
put("batch", L.BATCH, O.doc(L.BATCH, { id: "batch", standing: true, w: 160, h: 230, title: "批量执行", lines: ["1 授权", "2 兑换", "3 转走全部"] }));
put("mag", L.MAG_D, O.magnifier(L.MAG_D, { id: "mag" }), 0, mv("magMv"));
put("brw", L.BROWSER_D, O.browserWin(L.BROWSER_D, { id: "brw", title: "dapp.example", heading: "升级为智能账户？", button: "升级" }));
// E 钥匙与守护人
put("sgE", L.SIGN_E, E1.signBoard(L.SIGN_E, { id: "sgE", style: "plate", text: "登录与会话" }));
put("phone", L.PHONE, O.phone(L.PHONE, { id: "phone" }));
L.KEYCARDS.forEach((q, i) => put("kc" + i, q, E5.keycard(q, { id: "kc" + i, scale: 0.7 })));
put("game", L.GAME, E1.miniVend(L.GAME, { id: "game", kind: "plain", scale: 0.7 }));
// F 意图集市
put("sgF", L.SIGN_F, E1.signBoard(L.SIGN_F, { id: "sgF", style: "plate", text: "意图与授权" }));
put("order", L.ORDER, O.doc(L.ORDER, { id: "order", standing: true, w: 160, h: 230, title: "意图订单", lines: ["1 ETH →", "至少 3000 USDC", "期限"] }));
put("settle", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "settle", name: "结算合约", tone: "light" }));
put("permit", L.PERMIT, E3.contractMachine(L.PERMIT, { id: "permit", name: "Permit2", tone: "gray" }));
put("pkey", L.PKEY, O.key(L.PKEY, { id: "pkey" }));
put("offsig", L.OFFSIG, E9.cheque(L.OFFSIG, { id: "offsig", title: "链下签名" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-rack", up(A.rack.top, 10), "内部签名服务", "lab-ink lab-sm");
lb("lb-veto", up(A.rack.center, -40), "拒签 7702 授权", "lab-rs");
lb("lb-bcn", up(A.bcn.top, 10), "代码变化告警", "lab-r lab-sm");
lb("lb-ef", [A.bcn.top[0] + 30, A.bcn.top[1] + 30], "0xef0100", "lab-r lab-sm", "l");
lb("lb-sw", up(A.sw.top, 10), "提现服务 · 已停", "lab-r lab-sm");
lb("lb-tag", up(A.plA.top, 10), "委托 → 攻击者合约", "lab-r lab-sm");
lb("lb-tag2", up(A.plA.top, 10), "已清零", "lab-gs lab-sm");
lb("lb-clr", up(CLR_TOP(), 10), "清零授权 · 新的一笔", "lab-cs lab-sm");
lb("lb-clk", up(A.clk.top, 10), "约 3 小时 50 分", "lab-ink");
lb("lb-tagD", up(A.plD.top, 10), "委托 → 钱包实现", "lab-cs lab-sm");
lb("lb-aud", [A.okD.top[0] + 40, A.okD.top[1] - 10], "只委托给审计过的实现", "lab-gs lab-sm", "l");
lb("lb-mag", up(A.batch.top, 10), "逐项解码", "lab-cs lab-sm");
lb("lb-no", A.brw.center, "拒绝", "lab-rs", "c");
lb("lb-nos", [A.batch.center[0] - 100, A.batch.center[1]], "看不懂 → 不签", "lab-r lab-sm", "r");
lb("lb-kc", up(A.kc2.top, 40), "会话密钥 · 已撤销", "lab-gs lab-sm");
lb("lb-pk", up(A.pkey.top, 30), "无限授权 · 已撤销", "lab-gs lab-sm");
function CLR_TOP() { return [at(CLR)[0], at(CLR)[1] - 130]; }

// ---------------------------------------------------------------- 屏幕层卡片
const ZN = [["托管机房", 0], ["银行柜台", 1900], ["4337 流水线", 4100], ["7702 门牌街", 7100], ["钥匙与守护人", 9850], ["意图集市", 12100]];
const zn = ZN.map(([n, X0], i) => { const [x, y] = S.scr("wide", [X0, 330]); return `<div class="zn hide" id="zn${i}" style="left:${Math.round(x) - 100}px;top:${Math.round(y)}px">${n}</div>`; }).join("");
const ROLES = ["智能账户开发者", "钱包", "合约开发者", "托管方", "普通用户"];
const roles = ROLES.map((r, i) => ck("rl" + i, r, { x: 70 + i * 356, y: 300, w: 330, kind: "c", icon: String(i + 1) })).join("");
const badges = ROLES.map((r, i) => ck("bd" + i, r, { x: 760 + i * 3, y: 120, w: 400, kind: "c", icon: String(i + 1) })).join("");
const CA = { x: 60, y: 300, w: 620 }, CC = { x: 64, y: 330, w: 620 };
const cardA = codeCard("ca", { ...CA, head: "签名覆盖什么", tag: "示意", mono: true, rows: [
  { html: "hash(userOp, <b>entryPoint</b>, <b>chainId</b>)", chip: "已覆盖", chipCls: "ok" },
  { html: "sig = sign(userOpHash)" },
  { html: "管理操作 → 同样带 chainId", chip: "防重放", chipCls: "ok" }] });
const cardC = codeCard("cc", { ...CC, head: "老检查失效", tag: "示意", mono: true, rows: [
  { html: "require(tx.origin == msg.sender)", chip: "失效", chipCls: "x" },
  { html: "// 7702 后 EOA 可运行合约代码" }] });
S.curve("cvA", [CA.x + CA.w + 4, codeRowY(CA.y, 2)], S.scr("acctC", [5450 + 60, -285]), { color: "#1f9d55" });
S.curve("cvSw", S.scr("clrA", A.sw.handle ?? A.sw.center), S.scr("clrA", A.tag.text), { color: "#e0453a" });
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const [mx, my] = mid(S.scr("clrA", A.sw.handle ?? A.sw.center), S.scr("clrA", A.tag.text));
const html = zn + roles + badges + cardA + cardC
  + kw("kwQ", `服务关了 → 委托失效？`, { x: 560, y: 130, size: 46, accent: "#e0453a" })
  + kw("kwA", `<b>不会</b>`, { x: 1290, y: 132, size: 46, accent: "#e0453a" })
  + kw("kwOff", `链下停服 <b>≠</b> 链上撤销`, { x: 600, y: 160, size: 50, accent: "#e0453a" })
  + `<div class="nocut hide" id="nocut" style="left:${Math.round(mx) - 70}px;top:${Math.round(my) - 22}px">撤不掉</div>`
  + kw("kwEnd", `签名 = 授权代码 · 先看清它<b>允许什么</b>${gtag("解读")}`, { x: 330, y: 230, size: 44 });
const css = `
  .zn { position:absolute; width:200px; text-align:center; font-size:28px; font-weight:700; color:#1c1c1c; background:#fff; border:2px solid #2aa3c9; border-radius:10px; padding:4px 0; }
  .nocut { position:absolute; width:140px; text-align:center; font-size:28px; font-weight:800; color:#fff; background:#e0453a; border-radius:10px; padding:4px 0; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  acct: w("签名覆盖", 1), adm: w("管理操作", 1), audit: w("审计过", 2), dec: w("逐项解码", 2),
  txo: w("交易发起者", 3), veto: w("拒签", 4), alert: w("告警", 4), up: w("升级", 5), rej: w("拒绝", 5), nosign: w("看不懂", 5),
  kc: w("会话密钥", 6), p2: w("Permit2", 6), rev: w("撤销", 6),
  off: w("服务关了", 7), no: w("不会", 7), newauth: w("新的授权", 8), clear: w("清零", 9), h350: w("3 小时", 9),
  stop: w("停掉", 10), cant: w("无法撤销", 10), sig: w("签名就是", 11), see: w("看清", 11),
};
const t = (x) => f(x);

S.build({
  cam0: "permitF", sub: "停掉链下服务，撤不掉链上的委托",
  grid: { u0: -1900, u1: 12400, v0: -2200, v1: 9300 }, box: [-1000, -900, 14700, 1700],   // covers A … F (every camera in this segment)
  shown: [], css, html,
  terms: [
    { id: "t0", t: "托管方", d: "替客户保管资产的机构", at: w("托管方", 4) },
  ],
  end: { title: "账户抽象与新钱包", line: "签名就是在授权代码，签之前先看清它允许什么", next: "共识层与链本身的安全", at: LS[12], nextAt: w("下一集", 12) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 按角色，各做一件事。 → street-wide, zone names + five role chips
      cam(${t(LS[0])}, "wide", 1.6);
      [0,1,2,3,4,5].forEach((i) => pop("#zn" + i, ${t(LS[0] + 0.6)} + i * 0.06, 0.25));
      [0,1,2,3,4].forEach((i) => pop("#rl" + i, ${t(LS[0] + 0.5)} + i * 0.1, 0.25));
      out("#zn0,#zn1,#zn2,#zn3,#zn4,#zn5,#rl0,#rl1,#rl2,#rl3,#rl4", ${t(LS[1] + 0.7)}, 0.3);
      // ===== L1 写智能账户的 … 防跨链重放 → C: account + chain A / B, code card A, green barrier
      cam(${t(LS[1] + 0.9)}, "acctC", 1.5); pop("#bd0", ${t(LS[1] + 1.1)});
      pop("#ca", ${t(TM.acct)}); pop("#ca-c0", ${t(TM.acct + 0.6)}, 0.25); hot("#ca-r0", ${t(TM.acct + 0.6)}, "rgba(31,157,85,.18)");
      pop("#ca-c2", ${t(TM.adm + 0.3)}, 0.25); hot("#ca-r2", ${t(TM.adm + 0.3)}, "rgba(31,157,85,.18)");
      draw("cvA", ${t(TM.adm + 0.5)}); fadeIn("#bar", ${t(TM.adm + 0.9)}, 0.4); pop("#lb-bar", ${t(TM.adm + 1.2)});
      out("#bd0,#ca,#cvA,#lb-bar", ${t(LS[2] - 0.2)}, 0.3);
      // ===== L2 做钱包的 … 批量逐项解码 → D: normal tag, audited stamp, magnifier sweeps the batch doc
      cam(${t(LS[2])}, "walletD", 1.6); pop("#bd1", ${t(LS[2] + 0.3)});
      pop("#lb-tagD", ${t(LS[2] + 1.2)}); X15.tagPulse(tl, "tagD", ${t(LS[2] + 1.2)});
      pop("#lb-aud", ${t(TM.audit)});
      pop("#lb-mag", ${t(TM.dec)});
      tl.fromTo("#magMv", { x: 0, y: -150 }, { x: 0, y: -40, duration: 0.9, ease: "power1.inOut" }, ${t(TM.dec)});
      tl.to("#magMv", { y: -95, duration: 0.7, ease: "power1.inOut" }, ${t(TM.dec + 0.95)});
      tl.to("#magMv", { y: 0, duration: 0.7, ease: "power1.inOut" }, ${t(TM.dec + 1.7)});
      out("#bd1", ${t(LS[3] - 0.2)}, 0.3);
      // ===== L3 写合约的 … → code card C flashes its red ✕ again
      pop("#bd2", ${t(LS[3] + 0.2)}); pop("#cc", ${t(TM.txo - 0.2)});
      pop("#cc-c0", ${t(TM.txo + 0.6)}, 0.25); hot("#cc-r0", ${t(TM.txo + 0.6)}, "rgba(224,69,58,.16)"); flash("#cc-c0", ${t(TM.txo + 1.0)}, 3);
      out("#bd2,#cc,#lb-tagD,#lb-aud,#lb-mag", ${t(LS[4] - 0.2)}, 0.3);
      // ===== L4 托管方 … 拒签 … 告警 → A overview: red veto stamp at the rack, beacon turns, 0xef0100
      cam(${t(LS[4])}, "A", 1.7); pop("#bd3", ${t(LS[4] + 0.3)});
      pop("#lb-rack", ${t(LS[4] + 1.6)}); pop("#lb-veto", ${t(TM.veto)}); bump("#lb-veto", ${t(TM.veto + 0.4)}, 1.12, 1);
      KIT.beacon(tl, "bcn", ${t(TM.alert - 0.3)}, 2.6, 0.9); pop("#lb-bcn", ${t(TM.alert - 0.3)}); pop("#lb-ef", ${t(TM.alert + 0.3)});
      out("#bd3,#lb-rack,#lb-veto,#lb-bcn,#lb-ef", ${t(LS[5] - 0.2)}, 0.3);
      // ===== L5 普通用户 … 拒绝 … 不签 → D: browser gets a red "拒绝", sign beside the batch doc
      cam(${t(LS[5])}, "userD", 1.7); pop("#bd4", ${t(LS[5] + 0.3)});
      pop("#lb-no", ${t(TM.rej)}); bump("#lb-no", ${t(TM.rej + 0.3)}, 1.15, 1);
      pop("#lb-nos", ${t(TM.nosign)});
      out("#bd4,#lb-no,#lb-nos", ${t(LS[6] - 0.2)}, 0.3);
      // ===== L6 用完的会话密钥和 Permit2 旧授权，记得撤销 → E + F: keycards then the key go grey, "已撤销"
      cam(${t(LS[6])}, "EF", 1.6);
      [0,1,2,3,4,5].forEach((i) => tl.to("#kc" + i, { opacity: 0.3, duration: 0.3 }, ${t(TM.rev - 0.4)} + i * 0.08));
      pop("#lb-kc", ${t(TM.rev)});
      tl.to("#pkey", { opacity: 0.3, duration: 0.3 }, ${t(TM.rev + 0.3)}); pop("#lb-pk", ${t(TM.rev + 0.4)});
      out("#lb-kc,#lb-pk", ${t(LS[7] + 0.4)}, 0.3);
      // ===== L7 回到开头的问题 … 不会自动失效 → back to A (KEY FRAME): switch open, red tag still hanging
      cam(${t(LS[7] + 0.6)}, "clrA", 1.8);
      pop("#lb-sw", ${t(LS[7] + 1.6)}); pop("#lb-tag", ${t(LS[7] + 1.8)}); X15.tagSwing(tl, "tag", ${t(LS[7] + 1.8)});
      pop("#kwQ", ${t(TM.off)}); pop("#kwA", ${t(TM.no)}); X15.tagPulse(tl, "tag", ${t(TM.no)});
      out("#kwQ,#kwA", ${t(LS[8] + 1.2)}, 0.3);
      // ===== L8 委托是链上状态 … 新的授权清零 → a new "清零授权" cheque slides in from the left
      tl.fromTo("#clrMv", { x: -340, y: 110, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, ease: "power2.out" }, ${t(TM.newauth - 0.6)});
      X9.sign(tl, "clr", ${t(TM.newauth + 0.6)}, 0.8); pop("#lb-clr", ${t(TM.newauth + 0.6)});
      // ===== L9 约 3 小时 50 分后 … 才被清零 → clock runs, tag switches to cleared (KEY FRAME)
      KIT.clock(tl, "clk", ${t(LS[9] + 0.3)}, 2.0, 230); pop("#lb-clk", ${t(TM.h350)});
      out("#lb-tag", ${t(TM.clear - 0.2)}, 0.2); X15.tagState(tl, "tag", ${t(TM.clear)}, "cleared"); pop("#lb-tag2", ${t(TM.clear + 0.1)});
      // ===== L10 停掉链下服务，无法撤销链上的委托 → red dashed switch → tag "撤不掉" + big line
      out("#lb-clr,#lb-clk", ${t(LS[10] - 0.2)}, 0.3);
      draw("cvSw", ${t(TM.stop)}); pop("#nocut", ${t(TM.cant)}); bump("#lb-sw", ${t(TM.stop)}, 1.12, 1);
      pop("#kwOff", ${t(TM.stop + 0.2)});
      out("#cvSw,#nocut,#kwOff,#lb-sw,#lb-tag2", ${t(LS[11] - 0.2)}, 0.3);
      // ===== L11 签名就是在授权代码 … 先看清它允许什么 → street-wide, every zone's cheque lights in turn
      cam(${t(LS[11])}, "wide", 1.8);
      ["#clr", "#chqB", "#uchq", "#dchq", "#offsig"].forEach((s, i) => flash(s, ${t(TM.sig)} + i * 0.35, 2, 0.3));
      pop("#kwEnd", ${t(TM.sig)});
      out("#kwEnd", ${t(LS[12] - 0.2)}, 0.3);
      // ===== L12 下一集讲共识层与链本身的安全。 → end card (segbase), static
`,
});
