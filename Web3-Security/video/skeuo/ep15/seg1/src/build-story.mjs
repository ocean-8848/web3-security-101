// ep15/seg1「① 服务关了」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.hotA（BRIEF）。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.bankB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E4, E9, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 石板路（原生 SVG，画在最底层）
{
  const R = L.ROAD, x0 = -1400, x1 = 3800;
  add(G(0, -3000), `<rect x="${x0}" y="${R.y0}" width="${x1 - x0}" height="${R.y1 - R.y0}" fill="#e4e6ea" stroke="#cfd3d9" stroke-width="2"/>`
    + Array.from({ length: 27 }, (_, i) => `<line x1="${x0 + i * 200}" y1="${R.y0}" x2="${x0 + i * 200}" y2="${R.y1}" stroke="#d3d6db" stroke-width="2"/>`).join(""));
}
// A 托管机房
put("signA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "signA", style: "plate", text: "托管机房" }));
put("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "内部签名服务", leds: ["green", "green", "green"] }));
put("atk", L.ATK_A, O.person(L.ATK_A, { id: "atk", role: "attacker", scale: 0.7 }), 0, { grow: true });
put("hot", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hot", variant: "hot" }));
put("plateA", L.PLATE_A, E2.addrPlate(L.PLATE_A, { id: "plateA", text: "热钱包地址" }));
put("tagA", L.TAG_A.o, X.delegateTag(L.TAG_A.o, { id: "tagA", ...L.TAG_A.opts, state: "attacker", target: "攻击者合约", on: false }));
put("coreA", L.CORE_A, E10.coreModule(L.CORE_A, { id: "coreA", state: "attacker", ver: "攻击者合约", cart: false, scale: 0.7 }), 0, { grow: true });
put("sw", L.SWITCH, O.knifeSwitch(L.SWITCH, { id: "sw", on: true, text: "提现服务" }));
put("clk", L.CLOCK, O.clock(L.CLOCK, { id: "clk" }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
// 机柜吐出的那张授权支票（L2 飞到门牌）
const CHQ0 = S.rel(L.RACK, 40, 150);
put("chqA", CHQ0, E9.cheque(CHQ0, { id: "chqA", state: "attacker", title: "委托授权", copies: 0, scale: 0.45 }), 0, { grow: true });
// 挂牌 → 攻击者合约 的红虚线；挂牌外的问号虚线圈
{
  const [ax, ay] = A.tagA.text, [bx, by] = A.coreA.center;
  add(L.CORE_A, S.hid("lnA", `<path d="M${ax + 20},${ay} Q${(ax + bx) / 2},${Math.min(ay, by) - 60} ${bx - 30},${by}" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>`), 400);
  add(L.TAG_A.o, S.hid("qring", `<ellipse cx="${ax}" cy="${ay - 6}" rx="52" ry="62" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="9 7"/>`
    + `<text x="${ax - 66}" y="${ay - 52}" font-size="44" font-weight="700" fill="#e0453a" font-family="sans-serif">?</text>`), 400);
}
// B 银行柜台
put("signB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "signB", style: "plate", text: "比喻 · 银行柜台" }));
put("counter", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "counter", scale: 0.8 }));
put("signer", L.SIGNER_B, O.person(L.SIGNER_B, { id: "signer", role: "signer", scale: 0.7 }));
put("chqB", L.CHEQUE_B, E9.cheque(L.CHEQUE_B, { id: "chqB", title: "转账单", amount: "100", scale: 0.8,
  labels: ["金额", "收款人", "", "", ""], vals: ["100", "小王", "", "", ""], fields: ["filled", "filled", "blank", "blank", "blank"] }), 0, { grow: true });
{
  const [gx, gy] = at(L.AUTH_B);
  const shadow = `<polygon id="authSh" opacity="0" points="${gx - 80},${gy + 8} ${gx + 80},${gy + 8} ${gx + 210},${gy - 70} ${gx + 50},${gy - 70}" fill="#1b1f24" fill-opacity="0.13"/>`;
  put("auth", L.AUTH_B, O.doc(L.AUTH_B, { id: "auth", title: "授权书", lines: ["每天 100 元以内", "代付账单"], standing: true }), 0,
    { grow: true, wrap: (svg) => `<g id="authS">${shadow}${svg}</g>` });
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-rack", up(A.rack.top, 8), "内部签名服务", "lab-ink");
lb("lb-hot", up(A.hot.top, 8), "以太坊热钱包", "lab-ink");
lb("lb-plate", [A.plateA.top[0] - 70, A.plateA.top[1] + 30], "热钱包地址", "lab-cs lab-sm", "r");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-tag", [A.tagA.text[0] - 50, A.tagA.text[1] + 40], "委托 → 攻击者合约", "lab-rs lab-sm", "r");
lb("lb-core", up(A.coreA.top, 8), "攻击者合约", "lab-rs");
lb("lb-sw", up(A.sw.top, 8), "提现服务", "lab-ink");
lb("lb-swoff", up(A.sw.top, 8), "提现服务 · 已关闭", "lab-rs");
lb("lb-chqB", up(A.chqB.top, 8), "转账单：金额 · 收款人", "lab-ink lab-sm");
lb("lb-auth", up(A.auth.top, 8), "授权书", "lab-cs");

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev", `Binance 热钱包 · 2026 年 10 月 ${gtag("公开复盘")}`, { color: "#e0453a" })
  + `<div id="qcard" class="hide"><div class="q1">先猜</div><div class="q2 hide" id="q2">服务关了 → 委托失效？</div></div>`
  + kw("kw8", "签名 = <b>转这笔钱</b>", { x: 600, y: 150, size: 54, accent: "#299fc4" })
  + kw("kw9", "签名 = <b>允许代码替我做事</b>", { x: 470, y: 152, size: 54, accent: "#e0453a" })
  + kw("kw10", "签错一次，后果更大", { x: 640, y: 250, size: 34 });
const css = `
#qcard{position:absolute;left:500px;top:160px;width:600px;padding:18px 28px;background:#fff;border:3px solid #e0a52a;border-radius:14px;
  box-shadow:0 6px 18px rgba(0,0,0,.12);text-align:center;transform-origin:100% 0}
#qcard .q1{font-size:46px;font-weight:800;color:#b07a10}
#qcard .q2{font-size:40px;font-weight:700;color:#1b1f24;margin-top:6px}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  atk: w("攻击者", 1), dlg: w("委托", 2), tgt: w("攻击者", 3), off: w("关闭", 4),
  q6: w("委托", 6), old: w("转这笔钱", 8), now: w("允许", 9), big: w("变大", 10), cost: w("后果", 10),
};
const t = (x) => f(x);
const CHQ_TO = at(S.rel(L.PLATE_A, 0, 30)), CHQ_FROM = at(CHQ0);
const CHQ_MID = [(CHQ_TO[0] + CHQ_FROM[0]) / 2, Math.min(CHQ_TO[1], CHQ_FROM[1]) - 120];
const [AX, AY] = at(L.AUTH_B);

S.build({
  cam0: "hotA", sub: "提现服务关了，地址上的委托还挂着",
  grid: { u0: -1900, u1: 4000, v0: -2200, v1: 3400 }, box: [-1400, -800, 5200, 1500],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "热钱包", d: "保持联网、随时能签名出款的钱包", at: w("热钱包", 0) },
    { id: "t1", t: "EIP-7702", d: "让普通地址执行指定合约代码的标准", at: w("EIP-7702", 2) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2026 年 10 月，一个以太坊热钱包出了事。
      pop("#ev", ${t(LS[0] + 0.3)}); pop("#lb-hot", ${t(LS[0] + 0.6)}, 0.25); pop("#lb-plate", ${t(LS[0] + 1.0)}, 0.25);
      bump("#hot", ${t(LS[0] + 0.6)}, 1.04, 1);
      // ===== L1 攻击者控制了 Binance 的内部签名服务。
      pop("#lb-rack", ${t(LS[1] + 0.1)}, 0.25);
      [0, 1, 2].forEach((i) => KIT.led(tl, "rack-led-" + i, ${t(LS[1] + 0.5)} + i * 0.35, "red"));
      grow("atk", ${t(TM.atk)}); pop("#lb-atk", ${t(TM.atk + 0.4)}, 0.25);
      // ===== L2 他通过这个服务，给热钱包设置了一份 EIP-7702 委托。
      grow("chqA", ${t(LS[2] + 0.4)}, 0.4);
      X1.walk(tl, "chqA", ${t(LS[2] + 1.0)}, 1.4, [${JSON.stringify(CHQ_MID)}, ${JSON.stringify(CHQ_TO)}]);
      out("#chqA", ${t(TM.dlg - 0.1)}, 0.3);
      X15.tagDrop(tl, "tagA", ${t(TM.dlg)}); pop("#lb-tag", ${t(TM.dlg + 0.6)}, 0.25);
      // ===== L3 委托的目标，是攻击者自己的合约。
      grow("coreA", ${t(LS[3] + 0.2)}); pop("#lb-core", ${t(LS[3] + 0.6)}, 0.25);
      fadeIn("#lnA", ${t(TM.tgt)}, 0.5); X15.tagPulse(tl, "tagA", ${t(TM.tgt + 0.2)});
      // ===== L4 随后，Binance 关闭了提现服务。
      out("#lb-rack, #lb-hot, #lb-atk", ${t(LS[4] - 0.2)}, 0.2);
      cam(${t(LS[4])}, "clockA", 1.2); pop("#lb-sw", ${t(LS[4] + 1.0)}, 0.25);
      KIT.toggle(tl, "sw", ${t(TM.off)}, false);
      out("#lb-sw", ${t(TM.off + 0.3)}, 0.15); pop("#lb-swoff", ${t(TM.off + 0.4)}, 0.25);
      X15.tagSwing(tl, "tagA", ${t(TM.off + 0.6)});
      // ===== L5 先猜一道题。
      out("#lb-swoff", ${t(LS[5] - 0.1)}, 0.2);
      pop("#qcard", ${t(LS[5] + 0.1)});
      // ===== L6 服务关了，这份委托会自动失效吗？
      pop("#q2", ${t(LS[6] + 0.2)}, 0.3);
      fadeIn("#qring", ${t(TM.q6)}, 0.4); X15.tagSwing(tl, "tagA", ${t(TM.q6 + 0.3)}, 6, 1.6);
      // ===== L7 先记住这个问题。
      out("#ev", ${t(LS[7])}, 0.3);
      tl.to("#qcard", { x: 688, y: 140, scale: 0.72, duration: 0.6, ease: "power2.inOut" }, ${t(LS[7] + 0.3)});
      // ===== L8 在旧的模型里，签名的意思是，转这笔钱。
      out("#lb-plate, #lb-tag, #lb-core", ${t(LS[8] - 0.2)}, 0.2);
      cam(${t(LS[8])}, "bankB", 1.6);
      grow("chqB", ${t(LS[8] + 1.5)}); pop("#lb-chqB", ${t(LS[8] + 1.9)}, 0.25);
      pop("#kw8", ${t(TM.old)});
      // ===== L9 现在，签名的意思变成，允许这段代码替我做事。
      out("#kw8", ${t(TM.now - 0.2)}, 0.2);
      grow("auth", ${t(TM.now - 0.2)}); fadeIn("#authSh", ${t(TM.now)}, 0.4); pop("#lb-auth", ${t(TM.now + 0.4)}, 0.25);
      pop("#kw9", ${t(TM.now)});
      // ===== L10 签名的含义变大，签错一次的后果，也跟着变大。
      out("#lb-auth", ${t(TM.big - 0.2)}, 0.15);
      tl.to("#authS", { scale: 2, svgOrigin: "${AX} ${AY}", duration: 1.0, ease: "power2.inOut" }, ${t(TM.big)});
      pop("#kw10", ${t(TM.cost)});
`,
});
