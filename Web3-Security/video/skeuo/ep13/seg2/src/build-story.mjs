// ep13/seg2「② 五个海关」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         五关全景：五座海关 + 关名牌（seg2 L0–L4、L10–L16；seg6 L14–L15 结束卡）
//   evmA         A EVM 关：道闸 + 售货机 + 存储柜 + 参数包裹 + 外部调用（seg2 L5、L12）
//   solB         B Solana 关全景：道闸 + 程序机器 + 护照一字排开 + 调用者 / 攻击者 + 铸币机（seg1 L12–L13 终点；seg2 起点、L6、L17 终点；seg6 L10、L12）
//   passB        近景：护照 ×4 + 程序机器 + "无状态"框 + 调用者 / 攻击者（seg1 L2–L3、L7、L10–L11；seg3 起点 L0–L5；seg6 L11）
//   mintB        近景：wETH 铸币机 + 程序机器 + 守护者签名证明卡 + 伪造的"系统账户"护照 PASS[3]（seg1 起点 L0–L1、L4）
//   yardB        B后 账户链 + 可信根 + Cashio 点阵 + Anchor 盾（seg3 L6–L13）
//   driftB       B后 Drift 角：门限表 + 两张审批 + 沙漏 + 时间锁（seg3 L14–L20 终点；seg4 起点）
//   moveC        C Move 关：道闸 + 资源包裹（复制框）+ Cetus 角全貌（seg2 L7、L12；seg4 L0–L1）
//   cetusC       近景：Cetus 角：池子 + 开源数学库 + 位移格 + 份额机 + 份额凭证 + 攻击者 + 冻结冰壳（seg4 L2–L10）
//   verifC       近景：C 岗亭 + 放大镜"字节码验证器"（seg4 L11–L13）
//   upgC         C后 升级与部署：未审计模块 + 审计版本卡 + 单签钥匙 + 时间锁 + 多签（seg4 L14–L17 终点；seg5 起点）
//   btcD         D Bitcoin 关：道闸 + 集装箱 + Bitcoin 链 + 两台索引器（seg2 L8、L13；seg5 L0–L4）
//   lnD          D 闪电角：mempool + 截止时间钟 + 超时交易信封（seg5 L5–L7）
//   liquidD      D Liquid 角：联盟签名门限表 + L-BTC 铸币机 + 储备对账天平 + 红点阵（seg5 L8–L12）
//   cosmosE      E Cosmos 关：道闸 + 两条应用链 + 海关章 + 证明卡 + 超时牌 + 托管保险箱（seg2 L9、L13；seg5 L13–L14；seg6 起点 L0）
//   haltE        E Jackfruit 角：三台节点 + 头顶三只钟 + 出块闸刀 + 停机警报灯（seg5 L15–L17 终点）
//   cexF         F 交易所接入台全景（seg6 L0–L9）
//   listF        近景：接入清单 + 失败牌 / 同名假币 / 不可回滚沙漏 / SDK 包裹 + 柜台（seg6 L2–L5、L8）
//   world        全部区（含后院和接入台）：远景备用
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.passB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E7, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const gp = (X0, Y0) => { const q = G(X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v) }; };

// ---------------------------------------------------------------- 世界物件
// 大道（原生 SVG 石板，最先画）
{
  const { a, b, w: rw } = L.ROAD, h = rw / 2;
  const P = [Wp(a.u, a.v - h), Wp(b.u, b.v - h), Wp(b.u, b.v + h), Wp(a.u, a.v + h)];
  add(a, `<polygon points="${P.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="#ddd8ce" stroke="#cfc9bd" stroke-width="3"/>`, -1e6);
}
// 五座海关 + 关名牌
const GN = ["A", "B", "C", "D", "E"], GK = ["gA", "gB", "gC", "gD", "gE"];
const SIGN_T = ["EVM · 查行李", "Solana · 查护照", "Move · 防伪芯片", "Bitcoin · 只查封条", "Cosmos · 互认海关章"];
L.GATES.forEach((g, i) => put(GK[i], g, O.checkpoint(g, { id: GK[i], n: GN[i] })));
L.SIGNS.forEach((s, i) => put("sg" + GN[i], s, E1.signBoard(s, { id: "sg" + GN[i], style: "plate", text: SIGN_T[i], size: 34 })));
// A · EVM
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", sign: "合约", scale: 0.7 }));
{
  const [gx, gy] = at(L.SLOT), k = 0.6, sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put("sc", L.SLOT, E3.slotCabinet(L.SLOT, { id: "sc", title: "Storage" }), 0, {
    wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of ["top", "center", "ground"]) if (A.sc[n]) A.sc[n] = sc(A.sc[n]);
}
put("pa", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pa", scale: 0.8 }));
put("mv", L.MINI_A, E1.miniVend(L.MINI_A, { id: "mv", kind: "plain", scale: 0.6 }));
put("ap", L.APIPE.o, E1.pipe(L.APIPE.o, { id: "ap", pts: L.APIPE.pts }), 2);
const ATK_A = gp(100, -430);
put("atkA", ATK_A, O.person(ATK_A, { id: "atkA", role: "attacker", scale: 0.7 }), 0, { grow: true });
// B · Solana
put("pm", L.MACH, E3.contractMachine(L.MACH, { id: "pm", name: "程序", tone: "light" }));
{
  const [x, y] = at(L.STATELESS);
  add(L.STATELESS, S.hid("stl", `<rect x="${x - 60}" y="${y - 160}" width="120" height="170" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`), 1);
}
L.PASS.forEach((p, i) => put("ps" + i, p, X.passport(p, i === 3 ? { id: "ps3", title: "系统账户", state: "broken" } : { id: "ps" + i })));
put("sgr", L.SIGNER, O.person(L.SIGNER, { id: "sgr", role: "signer", scale: 0.7 }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: 0.7 }));
put("mp", L.MINT_B, E11.mintPress(L.MINT_B, { id: "mp", plate: "wETH", count: "wETH", scale: 0.6 }));
put("pf", L.PROOF_B, E2.proofCard(L.PROOF_B, { id: "pf", text: "守护者签名" }));
// C · Move
put("pc", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "pc", scale: 0.8 }));
{
  const [x, y] = A.pc.top;
  add(L.PARCEL_C, S.hid("chip", `<polygon points="${x},${y - 12} ${x + 18},${y - 2} ${x},${y + 8} ${x - 18},${y - 2}" fill="#1d93ba" stroke="#fff" stroke-width="2"/>`
    + `<rect x="${x - 5}" y="${y - 5}" width="10" height="6" fill="#bfe6f2"/>`), 2);
}
put("mn", L.MANUAL, E3.manual(L.MANUAL, { id: "mn", title: "开源数学库", sub: "math", open: 180, pageTitle: "数学库" }));
// D · Bitcoin
put("ctr", L.CTR, X.container(L.CTR, { id: "ctr", label: "UTXO" }));
put("btc", L.BTC, O.chain(L.BTC, { id: "btc", n: 4 }));
const scrTxt = (t1, t2) => `<rect x="0" y="0" width="222" height="146" fill="#f7f4ee"/><rect x="0" y="0" width="222" height="28" fill="#ece7dd"/>`
  + `<text x="10" y="20" font-size="15" font-weight="700" fill="#5f5a50">${t1}</text><text x="111" y="98" text-anchor="middle" font-size="34" font-weight="900" fill="#1d93ba">${t2}</text>`;
L.IDX.forEach((p, i) => put("ix" + i, p, O.laptop(p, { id: "ix" + i, screen: scrTxt(i ? "索引器 B" : "索引器 A", "余额") })));
// E · Cosmos
put("ch1", L.CH1, O.chain(L.CH1, { id: "ch1", n: 3 }));
put("ch2", L.CH2, O.chain(L.CH2, { id: "ch2", n: 3 }));
put("es", L.CSEAL, O.seal(L.CSEAL, { id: "es", text: "海关章", markText: "互认", stamped: false }));
put("cp", L.CPROOF, E2.proofCard(L.CPROOF, { id: "cp", text: "Merkle 证明" }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
GK.forEach((k, i) => (i === 4 ? lb("lb-g4", [A[k].top[0] + 40, A[k].top[1] + 40], SIGN_T[i], "lab-ink lab-sm", "r") : lb("lb-g" + i, up(A[k].top, 8), SIGN_T[i], "lab-ink lab-sm")));
lb("lb-vm", up(A.vm.top, 6), "合约", "lab-ink lab-sm");
lb("lb-sc", up(A.sc.top, 6), "自己的存储", "lab-cs");
lb("lb-atkA", up(A.atkA.top, 6), "换不掉", "lab-rs lab-sm");
lb("lb-pa", up(A.pa.top, 6), "参数", "lab-cs lab-sm");
lb("lb-mv", up(A.mv.top, 6), "外部调用", "lab-cs lab-sm");
lb("lb-stl", up(at(L.STATELESS), 172), "无状态", "lab-rs lab-sm");
lb("lb-pm", up(A.pm.top, 6), "程序", "lab-ink lab-sm");
lb("lb-sgr", [A.sgr.ground[0] - 30, A.sgr.ground[1] + 14], "账户由调用者传入", "lab-cs", "t");
lb("lb-pc", up(A.pc.top, 22), "带类型的对象", "lab-cs");
lb("lb-mn", up(A.mn.top, 10), "开源数学库", "lab-r lab-sm");
lb("lb-btc", up(A.btc.top, 8), "Bitcoin · 只记录交易", "lab-ink");
lb("lb-ctr", [A.ctr.ground[0], A.ctr.ground[1] + 14], "铭文余额？", "lab-gs lab-sm", "t");
lb("lb-ix0", up(A.ix0.top, 6), "索引器 A", "lab-cs lab-sm");
lb("lb-ix1", up(A.ix1.top, 6), "索引器 B", "lab-cs lab-sm");
lb("lb-ch1", up(A.ch1.top, 8), "应用链 1", "lab-ink lab-sm");
lb("lb-ch2", [A.ch2.ground[0], A.ch2.ground[1] + 14], "应用链 2", "lab-ink lab-sm", "t");
lb("lb-cp", up(A.cp.top, 6), "Merkle 证明", "lab-cs lab-sm");
lb("lb-ps", [A.ps1.ground[0], A.ps1.ground[1] + 16], "护照 = 账户", "lab-cs", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const WS = (p) => S.scr("wide", p).map(Math.round);
const ROADP = L.GATES.map((g) => WS(Wp(g.u, g.v + 40)));
const GSC = GK.map((k) => WS(A[k].ground));
// 放大小圈（L12–L13）：A 在道闸右侧，其余在道闸前下方
const CIRC = [["行李", "#1d93ba"], ["护照", "#1d93ba"], ["芯片", "#1d93ba"], ["封条", "#1f9d55"], ["海关章", "#e0453a"]];
const CPOS = GSC.map(([x, y], i) => (i === 0 ? [x + 130, y - 10] : [x - 10, y + 110]));
let html = CIRC.map(([tx, c], i) => `<div class="s2-circ hide" id="cc${i}" style="left:${CPOS[i][0] - 50}px;top:${CPOS[i][1] - 50}px;border-color:${c}">${tx}</div>`).join("");
html += GSC.map(([x, y], i) => `<div class="s2-ring hide" id="rg${i}" style="left:${x - 60}px;top:${y - 100}px"></div>`).join("");
html += `<div class="s2-walk hide" id="walk" style="left:${ROADP[0][0] - 14}px;top:${ROADP[0][1] - 40}px"></div>`;
const [bx, by] = ROADP[1];
html += `<div class="s2-gold hide" id="gold" data-layout-allow-overflow style="left:${bx - 18}px;top:${by - 18}px"><div class="s2-sq"></div><div class="s2-gl" data-layout-allow-overflow>同一笔资产</div>`
  + ["Solana 检查项", "Move 检查项", "Bitcoin 检查项"].map((tx, i) => `<div class="s2-chk hide" id="gk${i}" data-layout-allow-overflow style="top:${46 + i * 46}px">${tx}</div>`).join("") + `</div>`;
html += kw("kw-acc", `先给 <b>准确表述</b>`, { x: 700, y: 110, size: 40, accent: "#1d93ba" });
html += ["怎么存状态", "怎么调用程序", "谁能改什么"].map((tx, i) => kw("kw-m" + i, `<b>·</b> ${tx}`, { x: 700, y: 196 + i * 80, size: 36, accent: "#1d93ba" })).join("");
html += kw("kw-in", `相信了不该相信的 <b>输入</b>`, { x: 640, y: 130, size: 54, accent: "#e0453a" });
html += kw("kw-sh", `变的是输入的 <b>样子</b>`, { x: 660, y: 236, size: 38, accent: "#1d93ba" });
html += kw("kw-bf", `打个比方 ${gtag("比喻")}`, { x: 720, y: 120, size: 40 });
html += kw("kw-nb", `同一笔资产 <b>穿过好几关</b> ${gtag("比喻不成立处")}`, { x: 640, y: 126, size: 38, accent: "#e0453a" });
S.curve("arc", S.scr("cosmosE", up(A.ch1.top, 10)), S.scr("cosmosE", up(A.ch2.top, 10)), { color: "#2aa3c9", c1: S.scr("cosmosE", up(A.ch1.top, 160)), c2: S.scr("cosmosE", up(A.ch2.top, 200)) });
const css = `
  .s2-circ { position:absolute; width:100px; height:100px; border-radius:50%; background:#fffdf8; border:6px solid; box-sizing:border-box;
    display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:900; box-shadow:0 8px 18px rgba(70,60,40,0.16); }
  .s2-ring { position:absolute; width:120px; height:120px; border-radius:50%; border:6px solid #e0453a; box-sizing:border-box; }
  .s2-walk { position:absolute; width:28px; height:40px; border-radius:14px 14px 6px 6px; background:#e0453a; box-shadow:0 4px 10px rgba(224,69,58,0.35); }
  .s2-gold { position:absolute; width:36px; height:36px; }
  .s2-sq { width:36px; height:36px; border-radius:6px; background:#d9a520; border:3px solid #a87a10; box-sizing:border-box; }
  .s2-gl { position:absolute; left:46px; top:-2px; font-size:28px; font-weight:900; white-space:nowrap; background:#fffdf8; border-radius:8px; padding:0 10px; }
  .s2-chk { position:absolute; left:-20px; width:240px; height:40px; line-height:40px; font-size:28px; font-weight:800; background:#fff; border-left:6px solid #1d93ba;
    border-radius:6px; padding-left:10px; box-shadow:0 4px 10px rgba(70,60,40,0.14); white-space:nowrap; }`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  m0: w("存状态", 1), m1: w("调用程序", 1), m2: w("谁能改什么", 1),
  own: w("自己的存储", 5), swap: w("换不掉", 5), par: w("参数", 5), ext: w("外部调用", 5),
  nost: w("不存状态", 6), caller: w("调用者", 6),
  obj: w("带类型的对象", 7), math: w("数学库", 7),
  rec: w("只记录交易", 8), idx: w("索引器", 8),
  ibc: w("IBC", 9), ver: w("验证", 9),
  bag: w("查行李", 12), pp: w("查护照", 12), chip: w("防伪芯片", 12),
  seal: w("封条", 13), stamp: w("海关章", 13),
  same: w("同一笔资产", 15),
};
// 世界盒：盖住本段用到的所有镜头
const USED = ["solB", "wide", "evmA", "moveC", "btcD", "cosmosE", "passB"];
const VIS = USED.map((n) => { const c = L.CAMS[n]; return [-c.x / c.scale, -c.y / c.scale, (1920 - c.x) / c.scale, (1080 - c.y) / c.scale]; });
const BX = [Math.min(...VIS.map((q) => q[0])) - 300, Math.min(...VIS.map((q) => q[1])) - 300, Math.max(...VIS.map((q) => q[2])) + 300, Math.max(...VIS.map((q) => q[3])) + 300];
const CRN = [[BX[0], BX[1]], [BX[2], BX[1]], [BX[0], BX[3]], [BX[2], BX[3]]].map(([x, y]) => G(x, y));
const GRID = { u0: Math.floor(Math.min(...CRN.map((q) => q.u))), u1: Math.ceil(Math.max(...CRN.map((q) => q.u))), v0: Math.floor(Math.min(...CRN.map((q) => q.v))), v1: Math.ceil(Math.max(...CRN.map((q) => q.v))) };
const mv = (sel, t0, dur, [x0, y0], [x1, y1]) => `tl.to("${sel}", { x: ${x1 - x0}, y: ${y1 - y0}, duration: ${dur}, ease: "power1.inOut" }, ${f(t0)});`;

S.build({
  cam0: "solB", sub: "同一个错，五种样子",
  grid: GRID, box: [Math.round(BX[0]), Math.round(BX[1]), Math.round(BX[2] - BX[0]), Math.round(BX[3] - BX[1])],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "索引器", d: "读链上数据、计算元协议余额的链下软件", at: w("索引器", 8) },
    { id: "t1", t: "IBC", d: "Cosmos 生态的跨链通信协议", at: w("IBC", 9) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。 B → 五关全景
      cam(${f(LS[0])}, "wide", 2.0); pop("#kw-acc", ${f(LS[0] + 0.3)});
      // ===== L1 执行模型：存状态 / 调用程序 / 谁能改什么
      pop("#kw-m0", ${f(TM.m0)}); pop("#kw-m1", ${f(TM.m1)}); pop("#kw-m2", ${f(TM.m2)});
      // ===== L2 本质一样：五座道闸同时闪
      out("#kw-acc, #kw-m0, #kw-m1, #kw-m2", ${f(LS[2] - 0.2)});
      [0, 1, 2, 3, 4].forEach((i) => KIT.arm(tl, ["gA","gB","gC","gD","gE"][i], ${f(LS[2] + 0.4)}, true, 0.5));
      [0, 1, 2, 3, 4].forEach((i) => KIT.arm(tl, ["gA","gB","gC","gD","gE"][i], ${f(LS[2] + 1.3)}, false, 0.5));
      // ===== L3 相信了不该相信的输入
      pop("#kw-in", ${f(LS[3] + 0.2)});
      // ===== L4 变的是输入的样子
      pop("#kw-sh", ${f(LS[4] + 0.1)});
      // ===== L5 EVM：自己的存储，攻击者换不掉；参数 + 外部调用
      out("#kw-in, #kw-sh", ${f(LS[5] - 0.2)}); cam(${f(LS[5])}, "evmA", 1.4);
      pop("#lb-vm", ${f(LS[5] + 1.0)});
      pop("#lb-sc", ${f(TM.own)}); X3.mark(tl, "sc", 5, ${f(TM.own)}, "teal");
      grow("atkA", ${f(TM.own + 0.6)}); pop("#lb-atkA", ${f(TM.swap)}); bump("#lb-atkA", ${f(TM.swap + 0.4)}, 1.12);
      pop("#lb-pa", ${f(TM.par)}); pop("#lb-mv", ${f(TM.ext)}); fadeIn("#ap-flow", ${f(TM.ext)}); X1.dash(tl, "ap-flow", ${f(TM.ext)}, 2.0, -120);
      // ===== L6 Solana：程序不存状态；账户由调用者传入
      out("#lb-vm, #lb-sc, #lb-atkA, #lb-pa, #lb-mv", ${f(LS[6] - 0.2)}); cam(${f(LS[6])}, "solB", 1.4);
      pop("#lb-pm", ${f(LS[6] + 1.2)}); fadeIn("#stl", ${f(TM.nost)}, 0.3); pop("#lb-stl", ${f(TM.nost + 0.2)});
      pop("#lb-sgr", ${f(TM.caller)}); X13.cover(tl, "ps0", ${f(TM.caller + 0.3)}, true, 0.6);
      // ===== L7 Move：带类型的对象；数学库和权限
      out("#lb-pm, #stl, #lb-stl, #lb-sgr", ${f(LS[7] - 0.2)}); X13.cover(tl, "ps0", ${f(LS[7] - 0.2)}, false, 0.3); cam(${f(LS[7])}, "moveC", 1.4);
      fadeIn("#chip", ${f(TM.obj)}, 0.3); pop("#lb-pc", ${f(TM.obj + 0.2)});
      pop("#lb-mn", ${f(TM.math)}); flash("#mn", ${f(TM.math + 0.3)}, 2, 0.4);
      // ===== L8 Bitcoin：链只记录交易；索引器解释
      out("#chip, #lb-pc, #lb-mn", ${f(LS[8] - 0.2)}); cam(${f(LS[8])}, "btcD", 1.4);
      pop("#lb-btc", ${f(TM.rec)}); X13.door(tl, "ctr", ${f(TM.rec + 0.8)}, 30, 0.6); pop("#lb-ctr", ${f(TM.rec + 1.0)});
      fadeIn("#ix0-scr, #ix1-scr", ${f(TM.idx)}, 0.3); pop("#lb-ix0", ${f(TM.idx + 0.1)}); pop("#lb-ix1", ${f(TM.idx + 0.3)});
      // ===== L9 Cosmos：IBC 验证对方链上的状态
      out("#lb-btc, #lb-ctr, #lb-ix0, #lb-ix1", ${f(LS[9] - 0.2)}); X13.door(tl, "ctr", ${f(LS[9] + 0.6)}, false, 0.4); cam(${f(LS[9])}, "cosmosE", 1.4);
      pop("#lb-ch1", ${f(LS[9] + 1.2)}); pop("#lb-ch2", ${f(LS[9] + 1.4)});
      draw("arc", ${f(TM.ibc)}, 0.8); grow("cp", ${f(TM.ver)}); pop("#lb-cp", ${f(TM.ver + 0.3)});
      // ===== L10 打个比方：拉回全景
      out("#lb-ch1, #lb-ch2, #lb-cp, #arc", ${f(LS[10] - 0.2)}); cam(${f(LS[10])}, "wide", 1.4); pop("#kw-bf", ${f(LS[10] + 0.3)});
      // ===== L11 五国海关：五个关名牌落下
      [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#lb-g" + i, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)", immediateRender: false }, ${f(LS[11] + 0.1)} + i * 0.18));
      // ===== L12 查行李 / 查护照 / 防伪芯片
      out("#kw-bf", ${f(LS[12] - 0.2)});
      pop("#cc0", ${f(TM.bag)}); pop("#cc1", ${f(TM.pp)}); pop("#cc2", ${f(TM.chip)});
      // ===== L13 只查封条；互认海关章
      pop("#cc3", ${f(TM.seal)}); X13.seal(tl, "ctr", ${f(TM.seal + 0.2)}, "green"); pop("#cc4", ${f(TM.stamp)}); KIT.stamp(tl, "es", ${f(TM.stamp)});
      // ===== L14 走私者沿大道走，每关一处闪红
      out("#cc0, #cc1, #cc2, #cc3, #cc4", ${f(LS[14] - 0.2)});
      fadeIn("#walk", ${f(LS[14])}, 0.2);
      ${[1, 2, 3, 4].map((i) => mv("#walk", LS[14] + 0.3 + (i - 1) * 0.95, 0.6, ROADP[0], ROADP[i])).join(" ")}
      ${[0, 1, 2, 3, 4].map((i) => `flash("#rg${i}", ${f(LS[14] + 0.1 + i * 0.95)}, 1, 0); out("#rg${i}", ${f(LS[14] + 0.45 + i * 0.95)}, 0.1);`).join(" ")}
      // ===== L15 比喻不成立：同一笔资产连穿几关
      out("#walk", ${f(LS[15] - 0.2)}); pop("#kw-nb", ${f(LS[15] + 0.3)}); pop("#gold", ${f(TM.same)});
      // ===== L16 每穿过一关多一张检查项
      pop("#gk0", ${f(LS[16])}, 0.25);
      ${mv("#gold", LS[16] + 0.4, 0.9, ROADP[1], ROADP[2])} pop("#gk1", ${f(LS[16] + 1.4)}, 0.25);
      ${mv("#gold", LS[16] + 1.8, 0.9, ROADP[1], ROADP[3]).replace("tl.to", "tl.to")} pop("#gk2", ${f(LS[16] + 2.8)}, 0.25);
      // ===== L17 先看护照这一关：推到 B 关护照近景（ends static on passB）
      out("#kw-nb, #gold, #lb-g0, #lb-g1, #lb-g2, #lb-g3, #lb-g4", ${f(LS[17] - 0.2)}); cam(${f(LS[17])}, "passB", 1.4);
      pop("#lb-ps", ${f(LS[17] + 1.0)}); X13.cover(tl, "ps1", ${f(LS[17] + 1.0)}, true, 0.6);
`,
});
