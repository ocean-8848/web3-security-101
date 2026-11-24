// ep13/seg6「⑥ 接入一条新链」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world（全集最后一段：结束卡）

// 段内镜头：F 接入台整体放在画面右侧，左侧留给"接入清单"卡
const cexL = L.fit(L.ZONE_RECTS.F, [700, 280, 1820, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, cexL }, ext: [X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 大道（原生 SVG 石板，最底层）
{
  const R = L.ROAD, h = R.w / 2;
  const P = [Wp(R.a.u, R.a.v - h), Wp(R.b.u, R.b.v - h), Wp(R.b.u, R.b.v + h), Wp(R.a.u, R.a.v + h)].map((q) => q.map((x) => x.toFixed(1)).join(",")).join(" ");
  add(R.a, `<polygon points="${P}" fill="#dcd7cd" stroke="#c9c2b5" stroke-width="2"/>`, -1e6);
}
// 五座海关 + 关名牌
const GN = ["A", "B", "C", "D", "E"];
const SIGNT = ["EVM · 查行李", "Solana · 查护照", "Move · 防伪芯片", "Bitcoin · 只查封条", "Cosmos · 互认海关章"];
L.GATES.forEach((g, i) => put("g" + GN[i], g, O.checkpoint(g, { id: "g" + GN[i], n: GN[i] })));
L.SIGNS.forEach((g, i) => put("sg" + GN[i], g, E1.signBoard(g, { id: "sg" + GN[i], style: "plate", text: SIGNT[i], size: 34 })));
// 各关的输入（L12 远景用）
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: 0.7, sign: "合约" }));
put("pa", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pa", scale: 0.8 }));
put("pc", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "pc", scale: 0.8 }));
put("ctr", L.CTR, X.container(L.CTR, { id: "ctr", label: "UTXO" }));
put("btc", L.BTC, O.chain(L.BTC, { id: "btc", n: 4, title: "Bitcoin" }));
// E Cosmos 关（段首）
put("ch1", L.CH1, O.chain(L.CH1, { id: "ch1", n: 3, title: "应用链 1" }));
put("ch2", L.CH2, O.chain(L.CH2, { id: "ch2", n: 3, title: "应用链 2" }));
put("cseal", L.CSEAL, O.seal(L.CSEAL, { id: "cseal", text: "海关章", markText: "互认" }));
put("cproof", L.CPROOF, E2.proofCard(L.CPROOF, { id: "cproof", text: "Merkle 证明" }));
put("ctag", L.CTAG, E7.returnTag(L.CTAG, { id: "ctag", face: "false" }));
put("escrow", L.ESCROW, O.safe(L.ESCROW, { id: "escrow", plate: "托管账户" }));
// F 交易所接入台
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.8, sign: "接入" }));
put("list", L.LIST, O.doc(L.LIST, { id: "list", standing: true, title: "接入清单", lines: ["", "", "", ""] }), 0, { grow: true });
put("ftag", L.FTAG, E7.returnTag(L.FTAG, { id: "ftag", face: "false" }), 0, { grow: true });
put("fodd", L.FODD, E7.oddCoin(L.FODD, { id: "fodd", scale: 0.8, state: "attacker" }), 0, { grow: true });
put("fglass", L.FGLASS, O.hourglass(L.FGLASS, { id: "fglass" }));
L.FRPC.forEach((q, i) => put("rpc" + i, q, O.rpc(q, { id: "rpc" + i })));
add(L.FHSM, S.hid("hsmiso", `<polygon points="${[[-120, -95], [120, -95], [120, 95], [-120, 95]].map(([du, dv]) => at(L.FHSM, du, dv).map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="rgba(42,163,201,0.10)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9"/>`), -1);
put("hsm", L.FHSM, O.hsm(L.FHSM, { id: "hsm" }));
const scrA = `<rect width="222" height="146" fill="#f7f8f9"/><text x="16" y="56" font-size="24" font-weight="800" fill="#1c1c1c">索引器 A · 102</text><text x="16" y="104" font-size="24" font-weight="800" fill="#e0453a">索引器 B · 98</text>`;
const scrB = `<rect width="222" height="146" fill="#f7f8f9"/><text x="111" y="84" text-anchor="middle" font-size="28" font-weight="900" fill="#1f9d55">✓ 结果一致</text>`;
put("flap", L.FLAPTOP, O.laptop(L.FLAPTOP, { id: "flap", screen: scrA, screen2: scrB }));
L.SDK.forEach((q, i) => put("sdk" + i, q, E7.parcel(q, { id: "sdk" + i, scale: 0.6 })));
add(L.SDK[1], S.hid("sdkr", E7.parcel(L.SDK[1], { id: "sdk1r", scale: 0.6, state: "attacker" }).svg), 1);
const phScr = `<rect width="76" height="150" fill="#ffffff"/><text x="38" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#1c1c1c">签名确认</text>`
  + `<rect x="6" y="34" width="64" height="24" rx="5" fill="#e3f3f9"/><text x="38" y="51" text-anchor="middle" font-size="11" font-weight="700" fill="#1d93ba">账户</text>`
  + `<rect x="6" y="64" width="64" height="24" rx="5" fill="#e3f3f9"/><text x="38" y="81" text-anchor="middle" font-size="11" font-weight="700" fill="#1d93ba">程序</text>`
  + `<rect x="6" y="94" width="64" height="24" rx="5" fill="#fde3e0" stroke="#e0453a" stroke-width="2"/><text x="38" y="111" text-anchor="middle" font-size="10" font-weight="800" fill="#e0453a">陌生程序</text>`;
put("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen: phScr }));
// B Solana 关（L10–L11 回到开头）
put("mach", L.MACH, E3.contractMachine(L.MACH, { id: "mach", name: "程序", tone: "light" }));
L.PASS.forEach((q, i) => put("ps" + i, q, X.passport(q, i === 3 ? { id: "ps3", title: "系统账户", state: "attacker" } : { id: "ps" + i })));
put("signer", L.SIGNER, O.person(L.SIGNER, { id: "signer", role: "signer", scale: 0.7 }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-tc", up(A.tc.top, 10), "交易所接入", "lab-cs");
["假充值", "错账", "资金丢失"].forEach((s, i) => lb("lb-r" + i, [A.tc.top[0] + (i - 1) * 240, A.tc.top[1] - 90], s, "lab-rs"));
lb("lb-ftag", up(A.ftag.top, 6), "失败", "lab-rs lab-sm");
lb("lb-fodd", [A.fodd.center[0] + 40, A.fodd.center[1]], "同名假币", "lab-r lab-sm", "l");
lb("lb-fglass", up(A.fglass.top, 6), "不可回滚", "lab-cs lab-sm");
lb("lb-rpc", up(A.rpc1.top, 6), "独立节点 ×2", "lab-cs lab-sm");
lb("lb-hsm", up(A.hsm.top, 6), "签名算法", "lab-cs lab-sm");
lb("lb-iso", at(L.FHSM, 0, 110), "隔离", "lab-cs lab-sm", "t");
lb("lb-flap", up(A.flap.top, 6), "索引器版本", "lab-cs lab-sm");
lb("lb-sdk", up(A.sdk1.top, 8), "SDK 也是供应链", "lab-r lab-sm");
lb("lb-ph", up(A.ph.top, 6), "陌生程序 · 不签", "lab-rs lab-sm");
lb("lb-signer", up(A.signer.top, 8), "调用者传入", "lab-cs lab-sm");
lb("lb-ps0", A.ps0.ground, "owner ✓ 类型 ✓ 地址 ✓", "lab-g lab-sm", "t");
lb("lb-ps3", A.ps3.ground, "类型 ✗ 拒收", "lab-rs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const ROWS = ["失败交易上不上链 · 到账金额", "唯一标识 · 同名假币", "最终性 · 停链历史", "独立节点 · 签名算法", "索引器版本 · 结果一致", "SDK 隔离 · 不共用依赖"];
const GL = ["参数", "账户", "资源对象", "UTXO 解释", "IBC 证明"];
const gpos = GN.map((n) => S.scr("wide", up(A["g" + n].top, 10)));
let html = codeCard("cl", { x: 60, y: 280, w: 580, head: "接入清单", rows: ROWS, rowHide: true })
  + kw("kw-q", "账户由<b>谁</b>提供？", { x: 785, y: 140, accent: "#1d93ba" })
  + kw("kw-a", `调用者传入 → <b>程序自己查</b>`, { x: 680, y: 160 })
  + kw("kw-s", `这个答案只对 <b>Solana</b> 成立${gtag("解读")}`, { x: 560, y: 112, accent: "#1d93ba" })
  + kw("kw-w", `谁决定这个输入<b>可信</b>？`, { x: 690, y: 128, accent: "#1d93ba" })
  + kw("kw-end", `换一种账户模型，<b>换一组漏洞</b>`, { x: 650, y: 120, size: 48, accent: "#e0453a" });
gpos.forEach(([x, y], i) => {
  html += `<div class="lab lab-cs gl hide" id="gl-${i}" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${GL[i]}</div>`;
  html += `<div class="lab lab-ink gl gq hide" id="gq-${i}" style="left:${Math.round(x - [...GL[i]].reduce((a, c) => a + (/[\x00-\xff]/.test(c) ? 16 : 28), 0) / 2 - 56)}px;top:${Math.round(y)}px">?</div>`;
});
const css = `.gl { position: absolute; transform: translate(-50%, -100%); font-size: 28px; }
    .gq { font-size: 34px; font-weight: 900; color: #1d93ba; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  r: [w("假充值", 1), w("错账", 1), w("资金丢失", 1)],
  fail: w("失败的交易", 3), id: w("唯一标识", 4), odd: w("同名假币", 4), fin: w("不可回滚", 5),
  node: w("独立运营", 6), sig: w("签名算法", 6), idx: w("索引器", 7), same: w("一致", 7),
  sdk: w("SDK", 8), svc: w("签名服务", 8), strange: w("陌生程序", 9),
  who: w("由谁提供", 10), pass: w("传进来", 11), own: w("owner", 11), typ: w("类型", 11), adr: w("地址", 11),
  sol: w("Solana", 12), other: w("换一条链", 12), q: w("谁决定", 13),
};
const t = (x) => f(x);

S.build({
  cam0: "haltE", sub: "每条链都要重新设计",
  grid: { u0: -1900, u1: 11800, v0: -7300, v1: 6200 }, box: [-1300, -4000, 10000, 4700],   // 覆盖 E、F、B、wide、world
  shown: [], css, html,
  terms: [
    { id: "t0", t: "denom", d: "Cosmos 里代币的唯一标识名", at: w("denom", 4) },
    { id: "t1", t: "回滚", d: "已上链的交易被撤销", at: w("回滚", 5) },
  ],
  end: { title: "非 EVM 生态安全", line: "换一种账户模型，就换一组漏洞", next: "ZK 与证明系统的安全", at: LS[15], nextAt: w("下一集", 15) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 放到一个具体场景里。交易所要接入一条新链。
      cam(1.7, "cexF", 2.0); fadeIn("#tc-glow", 3.2, 0.5); pop("#lb-tc", 3.4);
      // ===== L1 照搬以太坊的接入逻辑，是假充值、错账和资金丢失的主要来源。
      ${JSON.stringify(TM.r.map((x) => +f(x)))}.forEach(function (x, i) { pop("#lb-r" + i, x, 0.3); });
      // ===== L2 接入的人，先问这几件事。
      out("#lb-r0, #lb-r1, #lb-r2, #lb-tc", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "cexL", 1.2);
      grow("list", ${t(LS[2] + 0.4)}); pop("#cl", ${t(LS[2] + 0.8)});
      // ===== L3 失败的交易会不会上链，实际到账金额怎么读。
      pop("#cl-r0", ${t(TM.fail)}); hot("#cl-r0", ${t(TM.fail + 0.1)}); grow("ftag", ${t(TM.fail + 0.4)}); pop("#lb-ftag", ${t(TM.fail + 0.8)});
      // ===== L4 代币由什么唯一标识，合约地址、mint 地址、对象类型，还是 denom。有没有同名假币。
      pop("#cl-r1", ${t(TM.id)}); hot("#cl-r1", ${t(TM.id + 0.1)}); grow("fodd", ${t(TM.odd)}); pop("#lb-fodd", ${t(TM.odd + 0.3)});
      KIT.broke(tl, "fodd", ${t(TM.odd + 0.9)}, { badge: false });
      // ===== L5 多少个区块之后不可回滚，历史上有没有停链。
      pop("#cl-r2", ${t(TM.fin)}); hot("#cl-r2", ${t(TM.fin + 0.1)}); pop("#lb-fglass", ${t(TM.fin + 0.3)}); KIT.sand(tl, "fglass", ${t(TM.fin + 0.3)}, 3);
      // ===== L6 有没有两个独立运营的节点。现有的 HSM 和 MPC，支不支持这条链的签名算法。
      pop("#cl-r3", ${t(TM.node)}); hot("#cl-r3", ${t(TM.node + 0.1)}); fadeIn("#rpc0-glow", ${t(TM.node + 0.2)}, 0.4); fadeIn("#rpc1-glow", ${t(TM.node + 0.5)}, 0.4);
      pop("#lb-rpc", ${t(TM.node + 0.6)}); fadeIn("#hsm-glow", ${t(TM.sig)}, 0.4); pop("#lb-hsm", ${t(TM.sig + 0.2)});
      // ===== L7 资产是否依赖链下索引器，用哪个版本，多个索引器的结果是否一致。
      pop("#cl-r4", ${t(TM.idx)}); hot("#cl-r4", ${t(TM.idx + 0.1)}); pop("#lb-flap", ${t(TM.idx + 0.3)});
      KIT.swap(tl, "#flap-scr", "#flap-scr2", ${t(TM.same)}, 0.5);
      // ===== L8 链官方的 SDK 也是供应链。签名服务不要和业务代码共用依赖。
      pop("#cl-r5", ${t(TM.sdk)}); hot("#cl-r5", ${t(TM.sdk + 0.1)}); fadeIn("#sdkr", ${t(TM.sdk + 0.6)}, 0.4); pop("#lb-sdk", ${t(TM.sdk + 0.8)});
      fadeIn("#hsmiso", ${t(TM.svc)}, 0.5); pop("#lb-iso", ${t(TM.svc + 0.4)});
      // ===== L9 普通用户，跨链前确认代币的唯一标识，不只看名称。在 Solana 上签名时，看到陌生程序，不签。
      out("#lb-ftag, #lb-fodd, #lb-fglass, #lb-rpc, #lb-flap, #lb-sdk", ${t(LS[9] - 0.2)});
      pop("#lb-ph", ${t(TM.strange)}); bump("#ph", ${t(TM.strange + 0.3)});
      // ===== L10 回到开头的问题。Solana 程序要读的账户，由谁提供？
      out("#cl, #lb-ph, #lb-hsm, #lb-iso", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "passB", 1.8);
      pop("#kw-q", ${t(TM.who)}); X13.fake(tl, "ps3", ${t(LS[10] + 1.8)});
      // ===== L11 由调用者在交易里传进来。所以程序必须自己核对每个账户的 owner、类型和地址。
      out("#kw-q", ${t(TM.pass - 0.3)}); pop("#lb-signer", ${t(TM.pass)}); pop("#kw-a", ${t(TM.pass + 0.4)});
      X13.cover(tl, "ps0", ${t(TM.pass + 0.6)}); X13.cover(tl, "ps3", ${t(TM.pass + 0.8)});
      X13.check(tl, "ps0", ${t(TM.own)}, 0, "ok"); X13.check(tl, "ps3", ${t(TM.own + 0.2)}, 0, "ok");
      X13.check(tl, "ps0", ${t(TM.typ)}, 1, "ok"); X13.check(tl, "ps3", ${t(TM.typ + 0.2)}, 1, "bad");
      X13.check(tl, "ps0", ${t(TM.adr)}, 2, "ok"); pop("#lb-ps0", ${t(TM.adr + 0.3)});
      KIT.broke(tl, "ps3", ${t(TM.adr + 0.3)}, { badge: false }); pop("#lb-ps3", ${t(TM.adr + 0.5)});
      // ===== L12 这个答案只对 Solana 成立。换一条链，输入换了样子。
      out("#kw-a, #lb-signer, #lb-ps0, #lb-ps3", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "wide", 1.6);
      pop("#kw-s", ${t(LS[12] + 0.6)}); pop("#gl-1", ${t(TM.sol + 0.4)});
      [0, 2, 3, 4].forEach(function (i, k) { pop("#gl-" + i, ${t(TM.other)} + k * 0.3, 0.3); });
      // ===== L13 要问的仍是同一个问题，谁决定这个输入可信。
      out("#kw-s", ${t(LS[13] - 0.2)}); pop("#kw-w", ${t(LS[13] + 0.1)});
      [0, 1, 2, 3, 4].forEach(function (i) { pop("#gq-" + i, ${t(TM.q)} + i * 0.12, 0.25); });
      // ===== L14 换一种账户模型，就换一组漏洞。
      out("#kw-w, .gl", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "world", 1.6); pop("#kw-end", ${t(LS[14] + 0.4)});
      // ===== L15 下一集讲 ZK 与证明系统的安全。
      out("#kw-end", ${t(LS[15] - 0.2)});
`,
});
