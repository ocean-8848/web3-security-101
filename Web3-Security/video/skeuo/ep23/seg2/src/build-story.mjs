// ep23/seg2「② 两张面孔」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.delegB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   intakeA      A 区块链 + 充值地址 ×3 + 扫描放大镜 + 台秤 + 真 / 假代币 + returnTag + Omni 交易（seg3 L0–L17）
//   checksA      A 四道入账检查 ①–④ + 确认数信号 + 两个节点 + 台秤（seg3 L18–L25 终点；seg4 起点）
//   vaultB       B 冷 / 温 / 热三层金库 + 水位表 + 管道（seg2 L12–L15）
//   hotB         B 三只热钱包 + 熔断闸刀 + 暂停闸 + 告警灯 + 时钟 + 点阵（seg1 起点 L0–L9；seg4 L16；seg6 L9）
//   delegB       B ETH 热钱包 + 地址立柱 + 委托挂牌 + 攻击者合约，题卡在右侧（seg1 L10–L14 终点；seg2 起点；seg4 L15；seg6 L0–L6）
//   signC        C 账本 → 风控 → 签名服务 + HSM + 容器 + 提现单 + 三条防线牌（seg4 L0–L6、L20–L24 终点；seg5 起点；seg6 L10）
//   devC         C 三个工位 + 工程师 + 部署令牌 + AI 工具 + 攻击者 + 签名服务 / 容器（seg4 L7–L14、L17–L19）
//   gateD        D 四道合规关卡 + 风险表 + 护照 + 另一家服务商 + 三类攻击者 + 门槛牌（seg5 L0–L14）
//   freezeD      D 冻结锁 + 两行点阵 + 原生币 + 代价天平 + 认罪协议 + 误冻的普通用户（seg5 L15–L23 终点；seg6 起点）
//   userE        E 用户柜台：手机 + 地址簿 + 冷却期时间锁 + 提币白名单 + 用户（seg6 L11–L14）
//   flowAC       A 充值扫描 → C 签名服务 → 回到 B 热钱包的整条流水线（seg2 L16–L24 终点；seg3 起点）
//   airport      A–D 中景，五块机场指示牌都在画内（seg2 L0–L11）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   wide         整座机场全景：A → E（seg6 L15–L16 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

// ends static on CAMS.flowAC
// 段内镜头：L13 归集（A 充值地址 → B 热钱包）
const R = L.world.rects;
const collectAB = L.fit([...R.addrA, ...R.hot, R.meter, R.chain], [100, 280, 1820, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, collectAB }, ext: [E1, E2, E5, E7, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 包层缩放助手（常见坑 1）
const isPt = (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number";
/** put + 绕地面点缩放 o.scale（wrap: true 的物件），anchors 一并换算；outer = 外层 <g id> 用于整体移动 / 隐藏 */
function putW(key, o, r, { dy = 0, grow = false, outer = null, k = o.scale ?? 1 } = {}) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const wrap = (svg) => {
    const s = k === 1 ? svg : `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
    return outer ? `<g id="${outer}"${outer.endsWith("-h") ? ' opacity="0"' : ""}>${s}</g>` : s;
  };
  put(key, o, r, dy, { wrap, grow });
  if (k !== 1) for (const n of Object.keys(A[key] || {})) {
    const v = A[key][n];
    if (isPt(v)) A[key][n] = sc(v); else if (Array.isArray(v) && v.every(isPt)) A[key][n] = v.map(sc);
  }
}
const ZA = L.ZONE_ANCHOR;
const zp = (z, X, Y, extra = {}) => { const q = G(ZA[z][0] + X, ZA[z][1] + Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };

// ---------------------------------------------------------------- 世界物件
// 五块机场指示牌（L6 长出）
const SIGNS = [["sga", L.SIGN_A, "入境口 · 充值"], ["sgb", L.SIGN_B, "金库 · 冷钱包"], ["sgc", L.SIGN_C, "登机口 · 提币"], ["sgd", L.SIGN_D, "安检 · 边检"], ["sge", L.SIGN_E, "用户柜台"]];
for (const [id, o, text] of SIGNS) put(id, o, E1.signBoard(o, { id, style: "plate", text, size: 40 }), 0, { grow: true });

// A 入境口
putW("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 4 }));
putW("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }), { outer: "magmv" });
L.ADDR_A.forEach((o, i) => putW("addr" + i, o, E2.addrPlate(o, { id: "addr" + i, text: `充值地址 ${i + 1}` })));
// 归集管：三根充值地址 → 沿 v=330 → B 区 XRP 热钱包左侧
const a0 = L.ADDR_A[0], h0 = L.HOT[0], dU = 2780 - a0.u, dV = 330 - a0.v, eU = h0.u - 72 - a0.u, eV = h0.v - a0.v;
put("cp", a0, E1.pipe(a0, { id: "cp", r: 9, pts: [[0, 0, 30], [0, dV, 30], [dU, dV, 30], [dU, eV, 30], [eU, eV, 30]] }), 2);
L.ADDR_A.slice(1).forEach((o, i) => put("cps" + i, o, E1.pipe(o, { id: "cps" + i, r: 9, pts: [[0, 0, 30], [0, 330 - o.v, 30]] }), 2));

// B 金库
put("cold", L.COLD, O.safe(L.COLD, { id: "cold", plate: "冷钱包", gold: true }));
putW("warm", L.WARM, O.safe(L.WARM, { id: "warm", plate: "温钱包" }));
putW("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 5, th: 3, level: 2, thText: "水位" }));
["XRP", "BTC", "ETH"].forEach((n, i) => putW("hot" + i, L.HOT[i], O.safe(L.HOT[i], { id: "hot" + i, variant: "hot", plate: `${n} 热钱包` })));
L.KNIFE.forEach((o, i) => putW("kn" + i, o, O.knifeSwitch(o, { id: "kn" + i, on: true })));
put("xp", L.TOLL, E1.pipe(L.TOLL, { id: "xp", r: 9, pts: [[-190, 0, 40], [260, 0, 40]] }), -1);
put("toll", L.TOLL, E7.tollClip(L.TOLL, { id: "toll", scale: L.TOLL.scale, z: 40 }));
put("addrb", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "addrb", text: "热钱包地址" }));
put("tag", L.TAG_B.o, E15.delegateTag(L.TAG_B.o, { id: "tag", ...L.TAG_B.opts, state: "attacker", target: "攻击者合约" }));
put("avm", L.MINIVEND, E1.miniVend(L.MINIVEND, { id: "avm", kind: "attacker", scale: L.MINIVEND.scale }));
// L4 流出的转账（红信封）
const LOUT = at(L.LETTER_OUT);
for (let i = 0; i < 3; i++) put("lt" + i, L.HOT_ETH, E1.letter(L.HOT_ETH, { id: "lt" + i, state: "attacker", w: 150, h: 98, z: 60 }), 30, { wrap: (s) => S.hid("lth" + i, s) });

// C 签名间
putW("ledger", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ledger", tag: "内部账本" }));
putW("shield", L.SHIELD, O.shield(L.SHIELD, { id: "shield" }));
putW("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "签名服务" }));
putW("hsm", L.HSM, O.hsm(L.HSM, { id: "hsm" }));
const WD = { ...L.WD_DOC, scale: 0.8 };
putW("wd", WD, O.doc(WD, { id: "wd", title: "提现单", standing: true }), { outer: "wdmv-h" });

// D 合规检查站
L.CKPT_D.forEach((o, i) => putW("ckd" + i, o, O.checkpoint(o, { id: "ckd" + i, n: "①②③④"[i] })));
const ATK = { ...L.ATK_D[0], scale: 1.0 };
put("atk", ATK, O.person(ATK, { id: "atk", role: "attacker", scale: 1.0 }), 0, { wrap: (s) => `<g id="atkmv-h" opacity="0">${s}</g>` });
const LAW = zp("D", 560, 220);
put("law", LAW, O.doc(LAW, { id: "law", title: "法律责任", standing: true, stamp: true }), 0, { wrap: (s) => S.hid("lawh", s) });
const TRV = zp("D", 760, 120);
put("trv", TRV, O.person(TRV, { id: "trv", color: "#a39d92", scale: 1.0 }), 0, { wrap: (s) => `<g id="trvmv-h" opacity="0">${s}</g>` });

// 内部人（L24，A–B 之间的路中央）
const INS = zp("A", 1500, -330);
put("ins", INS, O.person(INS, { id: "ins", role: "signer", scale: 1.6 }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
SIGNS.forEach(([id], i) => {
  lb("lbg-" + id, up(A[id].top, 14), SIGNS[i][2], "lab-g");
  lb("lbc-" + id, up(A[id].top, 14), SIGNS[i][2], "lab-cs");
});
lb("lb-d2", up(A.sgd.top, 14), "安检 · 边检", "lab-cs");
lb("lb-keep", up(A.hot1.top, 300), "保管者", "lab-ink");
lb("lb-gate", up(A.ckd1.top, 260), "检查站", "lab-ink");
lb("lb-cust", A.cold.ground, "托管 · 私钥和资产", "lab-gs lab-sm", "t");
lb("lb-fiat", [at(L.CKPT_D[3])[0] + 260, at(L.CKPT_D[3])[1] - 120], "⇄ 法币世界", "lab-cs lab-sm", "l");
lb("lb-lose", [LOUT[0] - 200, LOUT[1] - 120], "用户丢钱", "lab-rs lab-sm");
lb("lb-law", up(A.law.top, 10), "赃款洗白 · 交易所担责", "lab-rs lab-sm");
lb("lb-aml", [at(L.CKPT_D[1])[0], at(L.CKPT_D[1])[1] + 60], "安检 = 反洗钱 · 边检 = 制裁筛查", "lab-cs lab-sm", "t");
lb("lb-trv", up(A.trv.top, 10), "走了就走了", "lab-g lab-sm");
lb("lb-pub", A.chain.ground, "永久公开 · 可回查", "lab-cs lab-sm", "t");
// vaultB
lb("lb-col", [at(L.HOT[0])[0] - 400, at(L.HOT[0])[1] + 120], "归集", "lab-cs lab-sm");
lb("lb-wl", up(A.meter.top, 10), "水位", "lab-cs lab-sm");
lb("lb-back", up(A.cold.top, 10), "超出水位 → 回冷钱包", "lab-cs lab-sm");
lb("lb-sup", A.warm.ground, "冷 → 温 → 热 补充", "lab-cs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层（flowAC 静止 L16–L24）
const sc = (p, cam = "flowAC") => S.scr(cam, p).map((v) => Math.round(v));
const P = { mag: sc(A.mag.center), led: sc(A.ledger.center), sh: sc(A.shield.center), rack: sc(A.rack.center), hot: sc(A.hot2.center), ins: sc(A.ins.top) };
const BX = [
  { id: "bx0", c: P.mag, w: 110, h: 100, t: "假充值", below: true },
  { id: "bx1", c: P.led, w: 92, h: 96, t: "账号被盗", below: false },
  { id: "bx2", c: P.rack, w: 104, h: 128, t: "伪造请求", below: true },
  { id: "bx3", c: P.hot, w: 96, h: 104, t: "私钥泄露", below: true },
];
let html = "";
for (const b of BX) {
  const x = b.c[0] - b.w / 2, y = b.c[1] - b.h / 2;
  html += `<div class="bx" id="${b.id}" style="left:${x}px;top:${y}px;width:${b.w}px;height:${b.h}px">
    <svg width="${b.w}" height="${b.h}" viewBox="0 0 ${b.w} ${b.h}"><rect x="3" y="3" width="${b.w - 6}" height="${b.h - 6}" rx="8" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>
    <g id="${b.id}-x" opacity="0"><path d="M${b.w * 0.25} ${b.h * 0.25}L${b.w * 0.75} ${b.h * 0.75}M${b.w * 0.75} ${b.h * 0.25}L${b.w * 0.25} ${b.h * 0.75}" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/></g></svg></div>
  <div class="lab lab-rs lab-sm bl" id="${b.id}-l" style="left:${b.c[0]}px;top:${b.below ? y + b.h + 8 : y - 52}px">${b.t}</div>`;
}
html += kw("kw-acc", "准确表述 · 两个角色", { x: 700, y: 112, size: 34, accent: "#2aa3c9" });
html += kw("kw-met", `交易所 ≈ 一座<b>机场</b>${gtag("比喻")}`, { x: 690, y: 116, size: 34, accent: "#1d93ba" });
html += kw("kw-no", `比喻<b>不成立</b>：链上流向永久公开`, { x: 640, y: 120, size: 34, accent: "#e0453a" });
html += `<div class="lab lab-ink bl" id="lb-ins" style="left:${P.ins[0]}px;top:${P.ins[1] - 64}px">内部人</div>`;

// 屏幕层曲线
const sb = (p) => S.scr("airport", p);
S.curve("cv-pub", sb(A.chain.top), sb(A.ckd3.top), { color: "#2aa3c9" });
const sv = (p) => S.scr("vaultB", p);
S.curve("cv-hc", sv(A.hot0.top), sv(A.cold.center), { color: "#2aa3c9" });
S.curve("cv-cw", sv(A.cold.center), sv(A.warm.center), { color: "#1f9d55" });
S.curve("cv-wh", sv(A.warm.center), sv(A.hot0.center), { color: "#1f9d55" });
S.curve("cv-scan", P.mag, P.led, { color: "#2aa3c9" });
S.curve("cv-back", P.rack, P.hot, { color: "#2aa3c9" });
BX.forEach((b, i) => S.curve("cv-in" + i, P.ins, b.c, { color: "#e0453a" }));

const css = `
  .bx { position: absolute; opacity: 0; }
  .bx svg { display: block; }
  .bl { position: absolute; transform: translateX(-50%); opacity: 0; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  cust: w("托管", 2), fiat: w("法币", 3), law: w("法律责任", 5), vault: w("金库", 7),
  gate: w("登机口", 8), entry: w("入境口", 8), sec: w("安检", 9), bord: w("边检", 9),
  pub: w("永久公开", 11), col: w("归集", 13), wl: w("水位", 14), back: w("转回", 14),
  wc: w("温钱包", 15), wh: w("再补充", 15), ledg: w("内部账本", 17),
  risk: w("风控引擎", 18), sign: w("签名服务", 18), hot: w("热钱包", 18),
};
const t = (x) => f(x);
// 提现单在世界里移动的位移（世界画布 px）
const d0 = at(L.WD_DOC), dS = at(L.SHIELD), dR = at(L.RACK);
const mv = (p) => `{ x: ${f(p[0] - d0[0])}, y: ${f(p[1] - d0[1] + 40)} }`;
const ckA = at(L.ATK_D[0]), ck3 = at(L.CKPT_D[3]);

S.build({
  cam0: "delegB", sub: "保管者丢钱，检查站惹祸",
  grid: { u0: -4100, u1: 15900, v0: -11400, v1: 9100 }, box: [-2700, -6200, 13800, 8000],   // 盖住上段终点 delegB + airport / vaultB / flowAC
  shown: [], css, html,
  terms: [
    { id: "t0", t: "归集", d: "把各充值地址的钱集中到热钱包", at: w("归集", 13) },
    { id: "t1", t: "水位", d: "热钱包允许的余额区间", at: w("水位", 14) },
    { id: "t2", t: "签名服务", d: "按请求用私钥签出交易的内部系统", at: w("签名服务", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。 delegB → airport
      cam(${t(LS[0])}, "airport", 2.0); pop("#kw-acc", ${t(LS[0] + 0.3)});
      // ===== L1 交易所同时扮演两个角色。
      pop("#lb-keep", ${t(LS[1] + 0.3)}); pop("#lb-gate", ${t(LS[1] + 0.9)});
      // ===== L2 一个是保管者，替用户保管私钥和资产，这叫托管。
      out("#kw-acc", ${t(LS[2] - 0.2)}); fadeIn("#cold-glow", ${t(LS[2] + 0.3)}, 0.5); bump("#lb-keep", ${t(LS[2] + 0.2)}, 1.12, 1); pop("#lb-cust", ${t(TM.cust)});
      // ===== L3 另一个是检查站，链上的资金，从这里进出法币世界。
      bump("#lb-gate", ${t(LS[3] + 0.2)}, 1.12, 1);
      [0, 1, 2, 3].forEach((i) => { KIT.arm(tl, "ckd" + i, ${t(LS[3] + 0.6)} + i * 0.35, true, 0.5); KIT.arm(tl, "ckd" + i, ${t(LS[3] + 2.6)} + i * 0.2, false, 0.5); });
      pop("#lb-fiat", ${t(TM.fiat)});
      // ===== L4 保管者失误，用户丢钱。
      out("#lb-cust, #lb-fiat", ${t(LS[4] - 0.2)});
      KIT.door(tl, "hot2", ${t(LS[4] + 0.1)}, 105, 0.6);
      [0, 1, 2].forEach((i) => { fadeIn("#lth" + i, ${t(LS[4] + 0.5)} + i * 0.4, 0.15); X1.walk(tl, "lt" + i, ${t(LS[4] + 0.5)} + i * 0.4, 1.4, [[${f(LOUT[0])}, ${f(LOUT[1])}]], "power1.in"); out("#lth" + i, ${t(LS[4] + 1.8)} + i * 0.4, 0.2); });
      pop("#lb-lose", ${t(LS[4] + 1.0)});
      // ===== L5 检查站失误，赃款被洗白，交易所自己也要承担法律责任。
      out("#lb-lose", ${t(LS[5] - 0.2)}); KIT.door(tl, "hot2", ${t(LS[5])}, 0, 0.5);
      fadeIn("#atkmv-h", ${t(LS[5] + 0.2)}, 0.3);
      [0, 1, 2, 3].forEach((i) => { KIT.arm(tl, "ckd" + i, ${t(LS[5] + 0.4)}, true, 0.4); KIT.arm(tl, "ckd" + i, ${t(LS[5] + 3.6)}, false, 0.4); });
      tl.to("#atkmv-h", { x: ${f(ck3[0] - ckA[0] + 160)}, y: ${f(ck3[1] - ckA[1] + 20)}, duration: 2.6, ease: "none" }, ${t(LS[5] + 0.6)});
      fadeIn("#lawh", ${t(TM.law - 0.2)}, 0.3); pop("#lb-law", ${t(TM.law)});
      // ===== L6 打个比方，交易所像一座机场。 五块指示牌长出（灰）
      out("#lb-keep, #lb-gate, #lb-law, #lawh, #atkmv-h, #cold-glow", ${t(LS[6] - 0.2)});
      ["sga", "sgb", "sgc", "sgd", "sge"].forEach((id, i) => { grow(id, ${t(LS[6] + 0.3)} + i * 0.18); tl.set("#" + id, { opacity: 0.45 }, ${t(LS[6] + 0.3)}); pop("#lbg-" + id, ${t(LS[6] + 0.6)} + i * 0.18); });
      pop("#kw-met", ${t(LS[6] + 0.4)});
      // ===== L7 金库是冷钱包，要防盗。
      tl.to("#sgb", { opacity: 1, duration: 0.3 }, ${t(TM.vault)}); out("#lbg-sgb", ${t(TM.vault)}); pop("#lbc-sgb", ${t(TM.vault)});
      // ===== L8 登机口是提币，要验票，入境口是充值，要验真伪。
      tl.to("#sgc", { opacity: 1, duration: 0.3 }, ${t(TM.gate)}); out("#lbg-sgc", ${t(TM.gate)}); pop("#lbc-sgc", ${t(TM.gate)});
      tl.to("#sga", { opacity: 1, duration: 0.3 }, ${t(TM.entry)}); out("#lbg-sga", ${t(TM.entry)}); pop("#lbc-sga", ${t(TM.entry)});
      // ===== L9 安检是反洗钱，边检是制裁筛查，拦住名单上的人。
      tl.to("#sgd", { opacity: 1, duration: 0.3 }, ${t(TM.sec)}); out("#lbg-sgd", ${t(TM.sec)}); pop("#lbc-sgd", ${t(TM.sec)}); pop("#lb-aml", ${t(TM.bord)});
      // ===== L10 比喻在这里不成立，机场的旅客，走了就走了。
      out("#kw-met, #lb-aml", ${t(LS[10] - 0.2)}); pop("#kw-no", ${t(LS[10] + 0.2)});
      fadeIn("#trvmv-h", ${t(LS[10] + 0.4)}, 0.3); pop("#lb-trv", ${t(LS[10] + 0.6)});
      tl.to("#trvmv-h", { x: 520, y: -180, duration: 2.6, ease: "none" }, ${t(LS[10] + 0.8)}); out("#trvmv-h, #lb-trv", ${t(LE[10] - 0.4)}, 0.4);
      // ===== L11 链上的资金流向永久公开，执法机构几年以后，还能回头追查每一笔。
      flash("#chain", ${t(TM.pub)}, 2, 0.4); pop("#lb-pub", ${t(TM.pub)}); draw("cv-pub", ${t(TM.pub + 0.4)}, 1.6);
      // ===== L12 先看保管者这一面，钱在交易所里怎么流动。 airport → vaultB
      out("#kw-no, #lb-pub, #cv-pub, #sge, .lab[id^=lbc-], .lab[id^=lbg-]", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "vaultB", 1.8);
      // ===== L13 每个用户有自己的充值地址，钱到了，被归集到热钱包。
      cam(${t(LS[13])}, "collectAB", 1.4);
      fadeIn("#cp-flow, #cps0-flow, #cps1-flow", ${t(TM.col - 0.6)}, 0.3); X1.dash(tl, ["cp-flow", "cps0-flow", "cps1-flow"], ${t(TM.col - 0.6)}, 4.0, -260);
      pop("#lb-col", ${t(TM.col)});
      // ===== L14 热钱包负责日常提币，余额超出水位，多出来的转回冷钱包。
      out("#lb-col", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "vaultB", 1.2);
      X5.fill(tl, "meter", ${t(TM.wl)}, 4, 1.0); pop("#lb-wl", ${t(TM.wl)});
      draw("cv-hc", ${t(TM.back)}, 1.0); pop("#lb-back", ${t(TM.back + 0.4)}); X5.fill(tl, "meter", ${t(TM.back + 1.0)}, 3, 0.8);
      // ===== L15 冷钱包补充温钱包，温钱包再补充热钱包。
      out("#lb-back, #lb-wl, #cv-hc", ${t(LS[15] - 0.2)});
      draw("cv-cw", ${t(TM.wc - 0.4)}, 0.9); draw("cv-wh", ${t(TM.wh)}, 0.9); pop("#lb-sup", ${t(TM.wh + 0.5)});
      // ===== L16 链下还有一条流水线。 vaultB → flowAC
      out("#lb-sup, #cv-cw, #cv-wh", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "flowAC", 1.6); draw("cv-scan", ${t(LS[16] + 1.2)}, 1.0);
      // ===== L17 充值扫描服务读取链上数据，记进内部账本。
      tl.to("#magmv", { x: 110, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 3 }, ${t(LS[17] + 0.2)});
      bump("#ledger", ${t(TM.ledg)}, 1.12, 2);
      // ===== L18 提币请求从账本出发，经过风控引擎，再到签名服务，最后从热钱包发出。
      fadeIn("#wdmv-h", ${t(LS[18] + 0.2)}, 0.3);
      tl.to("#wdmv-h", { ...${mv(dS)}, duration: 0.8, ease: "power1.inOut" }, ${t(TM.risk)});
      tl.to("#wdmv-h", { ...${mv(dR)}, duration: 0.8, ease: "power1.inOut" }, ${t(TM.sign)});
      draw("cv-back", ${t(TM.hot - 0.3)}, 1.0); out("#wdmv-h", ${t(LE[18] - 0.3)}, 0.3);
      // ===== L19 攻击打在四个点上。 轨道变灰，四个空框
      tl.to("#cv-scan, #cv-back", { opacity: 0.3, duration: 0.4 }, ${t(LS[19])});
      [0, 1, 2, 3].forEach((i) => pop("#bx" + i, ${t(LS[19] + 0.3)} + i * 0.18, 0.25));
      // ===== L20 充值扫描，被假充值骗过。
      pop("#bx0-x", ${t(LS[20] + 0.3)}, 0.25); pop("#bx0-l", ${t(LS[20] + 0.4)});
      // ===== L21 账本，被盗来的用户账号拿去提币。
      pop("#bx1-x", ${t(LS[21] + 0.3)}, 0.25); pop("#bx1-l", ${t(LS[21] + 0.4)});
      // ===== L22 签名服务，被伪造的上游请求驱动。
      pop("#bx2-x", ${t(LS[22] + 0.3)}, 0.25); pop("#bx2-l", ${t(LS[22] + 0.4)});
      // ===== L23 热钱包，私钥泄露。
      pop("#bx3-x", ${t(LS[23] + 0.3)}, 0.25); pop("#bx3-l", ${t(LS[23] + 0.4)});
      // ===== L24 图里没画的还有内部人，他可以同时出现在这四个点上。
      grow("ins", ${t(LS[24] + 0.3)}); pop("#lb-ins", ${t(LS[24] + 0.8)});
      [0, 1, 2, 3].forEach((i) => draw("cv-in" + i, ${t(LS[24] + 1.8)}, 1.0));
`,
});
