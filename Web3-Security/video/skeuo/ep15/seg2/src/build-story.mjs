// ep15/seg2「② 授权书」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// starts on CAMS.bankB; ends static on CAMS.hashC
// 读 kit/SEGBASE.md。起始镜头 CAMS.bankB（BRIEF）。
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E4, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const P = (o) => Wp(o.u, o.v);
// 石板路 + 区牌（最底层）
{ const R = L.ROAD, x0 = 200, x1 = 6400;
  add(G(0, -3000), `<rect x="${x0}" y="${R.y0}" width="${x1 - x0}" height="${R.y1 - R.y0}" fill="#dcd6ca" stroke="#c9c1b2" stroke-width="3"/>` +
    [...Array(40)].map((_, i) => `<line x1="${x0 + i * 160}" y1="${R.y0}" x2="${x0 + i * 160 - 40}" y2="${R.y1}" stroke="#cbc3b4" stroke-width="2"/>`).join(""));
  for (const [k, t] of [["B", "B · 银行柜台"], ["C", "C · ERC-4337 流水线"]]) { const [zx, zy] = P(L.ZTAGS[k]);
    add(G(0, -2990), `<rect x="${zx - 70}" y="${zy - 22}" width="${t.length * 26 + 40}" height="44" rx="10" fill="#f6f2ea" stroke="#b8b0a1" stroke-width="2"/><text x="${zx - 50}" y="${zy + 10}" font-size="28" font-weight="800" fill="#6d685e" font-family="Noto Sans SC">${t}</text>`); } }
// ---- B 银行柜台
put("sgb", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "sgb", style: "plate", text: "比喻 · 银行柜台" }));
put("tc", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "tc", scale: 0.8 }));
put("pS", L.SIGNER_B, O.person(L.SIGNER_B, { id: "pS", role: "signer", scale: 0.7 }));
put("pH", L.HELPER_B, O.person(L.HELPER_B, { id: "pH", role: "engineer", scale: 0.7 }), 0, { grow: true });
put("chq", L.CHEQUE_B, E9.cheque(L.CHEQUE_B, { id: "chq", scale: 0.8, title: "转账单", amount: "一笔", signed: false, labels: ["金额", "收款人", "日期", "用途", "编号"] }));
put("auth", L.AUTH_B, O.doc(L.AUTH_B, { id: "auth", standing: true, title: "授权书", lines: ["每天 100 元以内", "代付账单"] }), 0, { grow: true });
put("auth2", L.AUTH2_B, O.doc(L.AUTH2_B, { id: "auth2", standing: true, state: "attacker", title: "授权书 · 全部财产", lines: ["处理全部财产", "不限金额"] }), 0, { grow: true });
put("seal", L.SEAL_B, O.seal(L.SEAL_B, { id: "seal", text: "本人签字", stamped: false }));
put("key", L.KEY_B, O.key(L.KEY_B, { id: "key", stand: true }));
// 三条原生短链（L9）
{ const [lx, ly] = P(L.LINKS_B); let g = "", on = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = lx + 20 + c * 66, y = ly - 60 + r * 52;
    g += `<rect x="${x}" y="${y}" width="42" height="30" rx="5" fill="#f6f2ea" stroke="#3a9ec2" stroke-width="3"/>` + (c < 2 ? `<line x1="${x + 42}" y1="${y + 15}" x2="${x + 66}" y2="${y + 15}" stroke="#3a9ec2" stroke-width="4"/>` : "");
    on += `<rect x="${x}" y="${y}" width="42" height="30" rx="5" fill="#e0453a" stroke="#c23a30" stroke-width="3"/>`; }
  add(L.LINKS_B, S.hid("lnk", g) + S.hid("lnk-on", on), -10); }
// ---- C ERC-4337 流水线
put("sgc", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "sgc", style: "plate", text: "ERC-4337" }));
L.LETTERS.forEach((q, i) => put("l" + i, q, E1.letter(q, { id: "l" + i }), 0, { wrap: (svg) => S.hid("lw" + i, svg) }));
put("so", L.SORTER, E1.sorter(L.SORTER, { id: "so", letters: 0, blockLabel: "一笔交易" }));
const BDL = G(3910, -33);
put("bdl", BDL, E1.letter(BDL, { id: "bdl", z: 78, w: 90, h: 56 }), 60, { wrap: (svg) => S.hid("bdlw", svg) });
put("gt", L.GATE, O.checkpoint(L.GATE, { id: "gt", n: "EntryPoint" }));
put("acc", L.ACCOUNT, E5.accountSafe(L.ACCOUNT, { id: "acc" }));
put("pump", L.PUMP, X.gasPump(L.PUMP, { id: "pump", title: "Paymaster" }));
put("hf", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "hf", inputs: ["字段", "字段"], output: "用户操作哈希" }));
const CL = ["链 ID", "nonce", "有效期", "…", "…"];
put("uchq", L.UCHEQUE, E9.cheque(L.UCHEQUE, { id: "uchq", title: "用户签名", labels: CL }));
put("pchq", L.PCHEQUE, E9.cheque(L.PCHEQUE, { id: "pchq", title: "Paymaster 签名", labels: CL }));
put("chA", L.CHAIN_A, O.chain(L.CHAIN_A, { id: "chA", n: 3 }));
put("chB", L.CHAIN_B, O.chain(L.CHAIN_B, { id: "chB", n: 3 }));
put("impl", L.IMPL, E10.coreModule(L.IMPL, { id: "impl" }));
put("skey", L.SKEY, E5.keycard(L.SKEY, { id: "skey", scale: 0.8 }));
// 地面两格 "1 验证" "2 执行" + 青蓝分隔线 + 红虚线圈
const ST = L.STEPS, tile = (du0, du1, fill, st) => `<polygon points="${[[du0, -45], [du1, -45], [du1, 45], [du0, 45]].map(([a, b]) => Wp(ST.u + a, ST.v + b).join(",")).join(" ")}" fill="${fill}" stroke="${st}" stroke-width="3"/>`;
add(ST, S.hid("st", tile(-300, -20, "#f6f2ea", "#3a9ec2") + tile(20, 300, "#f6f2ea", "#3a9ec2")) + S.hid("st1on", tile(-300, -20, "#bfe6cd", "#1f9d55")) + S.hid("st2on", tile(20, 300, "#bfe6cd", "#1f9d55")) +
  S.hid("stdiv", `<line x1="${Wp(ST.u, ST.v - 70)[0]}" y1="${Wp(ST.u, ST.v - 70)[1]}" x2="${Wp(ST.u, ST.v + 70)[0]}" y2="${Wp(ST.u, ST.v + 70)[1]}" stroke="#1d93ba" stroke-width="10" stroke-linecap="round"/>`), -300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pS", up(A.pS.top, 6), "本人", "lab-ink lab-sm");
lb("lb-pH", up(A.pH.top, 6), "助理", "lab-cs lab-sm");
lb("lb-eq", [A.key.center[0] - 90, A.key.center[1]], "一把私钥 = 签一笔", "lab-ink lab-strike", "r");
lb("lb-eqx", [A.key.center[0] - 90, A.key.center[1] + 95], "不再写死", "lab-rs lab-sm", "r");
lb("lb-seal", [A.seal.center[0] + 160, A.seal.center[1]], "本人签字", "lab-ink lab-sm", "l");
lb("lb-auth", up(A.auth.top, 10), "授权书 · 每天 100 元以内", "lab-cs lab-sm");
lb("lb-ex", [A.auth.top[0] + 110, A.auth.top[1] + 60], "示例", "lab-gt lab-sm", "l");
["账单 ✓", "账单 ✓", "账单 ✓"].forEach((t, i) => lb("lb-bill" + i, [1440 - i * 30, 215 + i * 88], t, "lab-gs lab-sm", "c"));
lb("lb-auth2", up(A.auth.top, 10), "授权书 · 全部财产", "lab-rs");
lb("lb-gz", [A.seal.center[0] + 160, A.seal.center[1] + 60], "要公证", "lab-ink lab-sm", "l");
const [LX, LY] = P(L.LINKS_B);
lb("lb-rv", [LX + 120, LY + 60], "可撤销", "lab-gs lab-sm", "t");
lb("lb-rv2", [LX + 120, LY + 60], "撤销？", "lab-off lab-sm", "t");
lb("lb-now", [LX + 120, LY - 75], "立刻生效 · 多链同时", "lab-rs lab-sm");
lb("lb-uo", [A.l1.ground[0], A.l1.ground[1] + 30], "用户操作 · UserOperation", "lab-cs lab-sm", "t");
lb("lb-so", [A.so.top[0] - 60, A.so.top[1] + 40], "Bundler · 打包者", "lab-cs", "r");
lb("lb-blk", [A.so.blockTop[0] + 60, A.so.blockTop[1] + 10], "一笔交易", "lab-ink lab-sm", "l");
lb("lb-gt", up(A.gt.top, 10), "EntryPoint · 入口合约", "lab-cs");
lb("lb-acc", up(A.acc.top, 10), "智能账户", "lab-cs");
lb("lb-sig", [A.acc.top[0] + 270, A.acc.top[1] + 120], "签名 ✓", "lab-gs", "l");
lb("lb-pump", [A.pump.top[0] + 90, A.pump.top[1] + 10], "Paymaster", "lab-cs", "l");
lb("lb-gas", [A.pump.center[0] + 90, A.pump.center[1] + 50], "愿意付 Gas ✓", "lab-gs lab-sm", "l");
lb("lb-st1", Wp(ST.u - 160, ST.v), "1 验证", "lab-cs lab-sm", "c");
lb("lb-st2", Wp(ST.u + 160, ST.v), "2 执行", "lab-ink lab-sm", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const html = kw("kw-acc", `账户抽象 ${gtag("准确表述")}`, { x: 700, y: 120 }) +
  kw("kw-def", `<span id="d0" class="hide">合约代码决定</span> · <span id="d1" class="hide">怎么<b>验证</b></span> · <span id="d2" class="hide">怎么<b>执行</b></span>`, { x: 640, y: 214, size: 38 }) +
  kw("kw-ana", `银行柜台 ${gtag("比喻")}`, { x: 760, y: 128 }) +
  kw("kw-no", `纸质授权书要公证 · 能撤销 ${gtag("比喻不成立处")}`, { x: 620, y: 136, size: 38 }) +
  kw("kw-two", `<b>验证</b> 和 <b>执行</b> 拆成两步`, { x: 700, y: 140 });
const css = `.lab-strike { text-decoration: line-through; text-decoration-color: #e0453a; text-decoration-thickness: 5px; }
  .lab-gt { background: #ebe6dc; border-color: #ebe6dc; color: #6d685e; }
  .lab-off { background: #d8d3c9; border-color: #b8b0a1; color: #8a8478; text-decoration: line-through; }`;
S.curve("cvA", S.scr("envC", up(A.gt.top, 0)), S.scr("envC", A.acc.dials.owner), { color: "#e0453a" });
S.curve("cvP", S.scr("envC", A.gt.center), S.scr("envC", A.pump.scr), { color: "#e0453a" });
const RING = [["r0", [Math.round(A.gt.armTip[0] + 120), Math.round(A.gt.armTip[1] - 60)], 90, 70], ["r1", A.so.center, 290, 220], ["r2", A.gt.center, 250, 220], ["r3", A.acc.center, 300, 250], ["r4", A.pump.center, 110, 120]];
for (const [id, [cx, cy], rx, ry] of RING) add(G(cx, cy), S.hid(id, `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#e0453a" stroke-width="8" stroke-dasharray="22 14"/>`), 3000);

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  def0: w("合约代码", 1), def1: w("验证", 1), def2: w("执行", 1), noFix: w("不再写死", 2),
  sign: w("本人签字", 4), auth: w("授权书", 5), helper: w("助理", 5), all: w("全部财产", 7),
  gz: w("公证", 8), rv: w("撤销", 8), now: w("立刻生效", 9), multi: w("多条链", 9),
  uo: w("用户操作", 11), pack: w("打包成", 12), ver: w("验证", 13), exe: w("执行", 13),
  acc: w("智能账户", 14), sig: w("签名", 14), pm: w("Paymaster", 15), settle: w("结算", 16), bill: w("账单", 5), day: w("每天", 5),
};
const t = (x) => f(x);

S.build({
  cam0: "bankB", sub: "签名从一笔转账变成一份授权书",
  grid: { u0: -1400, u1: 7100, v0: -2200, v1: 6300 }, box: [200, -1300, 6200, 2300],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "智能账户", d: "由合约代码管理验证和执行的账户", at: w("智能账户", 14) },
    { id: "t1", t: "Paymaster", d: "替用户支付 Gas 的合约", at: w("Paymaster", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      X15.pumpLamp(tl, "pump", 0, "off");
      // ===== L0 先给准确的说法。
      pop("#kw-acc", ${t(LS[0] + 0.1)});
      // ===== L1 账户抽象，是让合约代码来决定，账户怎么验证、怎么执行。
      pop("#kw-def", ${t(TM.def0 - 0.1)}); fadeIn("#d0", ${t(TM.def0)}, 0.3); fadeIn("#d1", ${t(TM.def1)}, 0.3); fadeIn("#d2", ${t(TM.def2)}, 0.3);
      // ===== L2 协议不再写死，一把私钥签一笔交易。
      pop("#lb-eq", ${t(LS[2] + 0.1)}); bump("#key", ${t(LS[2] + 0.3)}, 1.08, 1); pop("#lb-eqx", ${t(TM.noFix)});
      out("#kw-acc, #kw-def", ${t(LE[2] - 0.1)});
      // ===== L3 打个比方。
      out("#lb-eq, #lb-eqx", ${t(LS[3] - 0.1)}); pop("#kw-ana", ${t(LS[3])});
      // ===== L4 以前去银行，每笔转账都要本人签字。
      pop("#lb-pS", ${t(LS[4] + 0.2)}); X9.sign(tl, "chq", ${t(TM.sign - 0.3)}, 0.9); KIT.stamp(tl, "seal", ${t(TM.sign)}); pop("#lb-seal", ${t(TM.sign + 0.5)});
      // ===== L5 现在你可以签一份授权书，允许助理每天替你付 100 元以内的账单。
      out("#lb-seal", ${t(TM.auth - 0.2)}); grow("auth", ${t(TM.auth)}); pop("#lb-auth", ${t(TM.auth + 0.5)}); pop("#lb-ex", ${t(TM.day)});
      grow("pH", ${t(TM.helper)}); pop("#lb-pH", ${t(TM.helper + 0.4)}); bump("#lb-auth", ${t((TM.day + TM.bill) / 2)}, 1.08, 1);
      // ===== L6 授权书让生活方便很多。
      [0, 1, 2].forEach((i) => pop("#lb-bill" + i, ${t(LS[6] + 0.1)} + i * 0.45, 0.25));
      // ===== L7 可如果签的是，允许持有人处理我全部财产，后果比签错一笔转账严重得多。
      out("#lb-bill0, #lb-bill1, #lb-bill2, #lb-ex", ${t(LS[7])}); out("#lb-auth", ${t(TM.all - 0.2)});
      grow("auth2", ${t(TM.all)}); pop("#lb-auth2", ${t(TM.all + 0.4)});
      [0, 1, 2, 3].forEach((i) => X4.cashOut(tl, "tc", i, ${t(TM.all + 0.6)} + i * 0.35, 0.6));
      bump("#lb-auth2", ${t(TM.all + 2.4)}, 1.08, 2);
      // ===== L8 比喻不成立的地方是，纸质授权书要公证，也能去银行撤销。
      out("#kw-ana", ${t(LS[8] - 0.2)}); pop("#kw-no", ${t(LS[8] + 0.1)});
      pop("#lb-gz", ${t(TM.gz)}); KIT.stamp(tl, "seal", ${t(TM.gz + 0.1)}); pop("#lb-rv", ${t(TM.rv)});
      // ===== L9 链上的委托签名立刻生效，有时在多条链上同时生效。
      fadeIn("#lnk", ${t(LS[9])}, 0.4); pop("#lb-now", ${t(TM.now)}); fadeIn("#lnk-on", ${t(TM.multi)}, 0.25); flash("#lnk-on", ${t(TM.multi + 0.3)}, 2, 0.4);
      out("#lb-rv", ${t(TM.multi + 0.4)}); pop("#lb-rv2", ${t(TM.multi + 0.6)});
      // ===== L10 新流程里有哪些角色？先看 ERC-4337。
      out("#kw-no, #lb-pS, #lb-pH, #lb-auth2, #lb-gz, #lb-rv2, #lb-now", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "flowC", 1.8); bump("#sgc", ${t(LS[10] + 2.4)}, 1.06, 2);
      // ===== L11 用户不直接发交易，而是提交一个用户操作，UserOperation。
      cam(${t(LS[11] - 0.3)}, "envC", 1.0);
      [0, 1, 2].forEach((i) => fadeIn("#lw" + i, ${t(TM.uo - 0.4)} + i * 0.25, 0.3)); pop("#lb-uo", ${t(TM.uo + 0.3)});
      // ===== L12 Bundler 是打包者，把很多个用户操作，打包成一笔链上交易。
      pop("#lb-so", ${t(LS[12] + 0.1)}); out("#lb-uo", ${t(LS[12] + 0.6)});
      [0, 1, 2].forEach((i) => X1.walk(tl, "l" + i, ${t(LS[12] + 0.8)} + i * 0.45, 1.6, [[${A.so.in.map(Math.round)}], [${Math.round(A.so.blockIn[0] - 30)}, ${Math.round(A.so.blockIn[1] + 4)}]]));
      [0, 1, 2].forEach((i) => out("#lw" + i, ${t(LS[12] + 2.5)} + i * 0.45, 0.2));
      X1.reach(tl, "so", ${t(TM.pack - 0.2)}, 170, 124, 0.5); X1.reach(tl, "so", ${t(TM.pack + 0.6)}, 0, 40, 0.5);
      tl.to("#so-lid", { opacity: 1, duration: 0.3 }, ${t(TM.pack + 0.5)}); pop("#lb-blk", ${t(TM.pack + 0.7)});
      // ===== L13 EntryPoint 是统一的入口合约，它先验证，再执行。
      pop("#lb-gt", ${t(LS[13] + 0.1)}); fadeIn("#bdlw", ${t(LS[13] + 0.3)}, 0.3); out("#lb-blk", ${t(LS[13] + 0.6)});
      X1.walk(tl, "bdl", ${t(LS[13] + 0.6)}, 1.4, [[${Math.round(A.gt.road[0] - 140)}, ${Math.round(A.gt.road[1] - 20)}]]);
      fadeIn("#st", ${t(TM.ver - 0.4)}, 0.3); pop("#lb-st1", ${t(TM.ver - 0.2)}); pop("#lb-st2", ${t(TM.exe - 0.2)}); fadeIn("#st1on", ${t(TM.ver)}, 0.3);
      // ===== L14 第一步，问智能账户，签名对不对。
      pop("#lb-acc", ${t(TM.acc - 0.3)}); draw("cvA", ${t(TM.acc)}); pop("#lb-sig", ${t(TM.sig + 0.3)});
      // ===== L15 第二步，问 Paymaster，愿不愿意替用户付 Gas。
      pop("#lb-pump", ${t(TM.pm - 0.3)}); draw("cvP", ${t(TM.pm)}); X15.pumpLamp(tl, "pump", ${t(TM.pm + 0.9)}, "green"); pop("#lb-gas", ${t(TM.pm + 1.1)});
      // ===== L16 两步都通过，才执行用户要做的调用，最后结算 Gas。
      out("#cvA, #cvP", ${t(LS[16] + 0.1)}); KIT.arm(tl, "gt", ${t(LS[16] + 0.3)}, true); fadeIn("#st2on", ${t(LS[16] + 0.5)}, 0.3); bump("#lb-st2", ${t(LS[16] + 0.5)}, 1.1, 1);
      X1.walk(tl, "bdl", ${t(LS[16] + 0.9)}, 1.3, [[${Math.round(A.gt.armTip[0] + 120)}, ${Math.round(A.gt.armTip[1] - 30)}]]);
      X15.pumpNozzle(tl, "pump", ${t(TM.settle - 0.3)}, [${A.acc.front.map(Math.round)}]); X15.pumpLevel(tl, "pump", ${t(TM.settle + 0.2)}, 0.6);
      // ===== L17 验证和执行，被拆成了两步。
      out("#lb-sig, #lb-gas, #lb-acc, #lb-so, #lb-gt, #lb-pump, #lb-st1, #lb-st2, #lb-blk, #lb-uo", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "hashC", 1.2);
      fadeIn("#stdiv", ${t(LS[17] + 0.8)}, 0.4); pop("#kw-two", ${t(LS[17] + 0.4)});
      // ===== L18 每一步的边界，都可能出错。
      out("#kw-two", ${t(LS[18] - 0.15)});
      ["#r0", "#r1", "#r2", "#r3", "#r4"].forEach((s, i) => fadeIn(s, ${t(LS[18] + 0.1)} + i * 0.2, 0.3));
`,
});
