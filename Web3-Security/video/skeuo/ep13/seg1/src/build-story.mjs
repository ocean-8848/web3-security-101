// ep13/seg1「① 没校验的账户」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.solB

const gr = (i) => [L.rect(L.GATES[i], "checkpoint"), L.rect(L.SIGNS[i], "signPlate")];
const mintR = [L.rect(L.MINT_B, "mintPress"), L.rect(L.MACH, "contractMachine"), L.rect(L.PROOF_B, "proofCard")];
mintR.push([mintR[0][2], mintR[0][1], mintR[0][2] + 60, mintR[0][3] + 60]);   // dot matrix spill to the right of the tray
// mintB is redefined locally (seg1 is the first segment): the shared framing puts the mint press under the event card
const CAMS = { ...L.CAMS, mintB: L.fit(mintR, [300, 440, 1500, 860], 1.4), roadB: L.fit([...gr(0), ...gr(1), ...gr(2), ...L.ZONE_RECTS.B], [100, 280, 1820, 860], 1) };   // L12 local: A–B–C along the road
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E3, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
// 大道（原生 SVG 石板）：只画 B 关前后一段
{
  const v = L.GATES[1].v + 40, hw = L.ROAD.w / 2, u0 = L.GATES[0].u + 300, u1 = L.GATES[2].u - 300;
  const P = [[u0, v - hw], [u1, v - hw], [u1, v + hw], [u0, v + hw]].map(([u, vv]) => Wp(u, vv).map((n) => n.toFixed(1)).join(",")).join(" ");
  add({ u: u0, v: v - 400 }, `<polygon points="${P}" fill="#dcd6ca" stroke="#cfc7b8" stroke-width="2"/>`);
}
// 远处另外几座海关（L12 淡入）
const FAR = [0, 2];
FAR.forEach((i) => {
  const n = "ABCDE"[i];
  put("g" + n, L.GATES[i], O.checkpoint(L.GATES[i], { id: "g" + n, n }), 0, { wrap: (svg) => S.hid("far" + n, svg) });
});
put("gB", L.GATES[1], O.checkpoint(L.GATES[1], { id: "gB", n: "B" }));
put("sgB", L.SIGNS[1], E1.signBoard(L.SIGNS[1], { id: "sgB", style: "plate", text: "Solana · 查护照" }));
put("mach", L.MACH, E3.contractMachine(L.MACH, { id: "mach", name: "程序", tone: "light" }));
put("mp", L.MINT_B, E11.mintPress(L.MINT_B, { id: "mp", scale: 0.6, plate: "wETH", count: "0", pile: 0.2 }));
put("pf", L.PROOF_B, E2.proofCard(L.PROOF_B, { id: "pf", text: "守护者签名" }));
L.PASS.forEach((q, i) => {
  const o = i === 3 ? { title: "系统账户", state: "attacker" } : {};
  put("ps" + i, q, X.passport(q, { id: "ps" + i, ...o }));
});
put("atk", L.ATK_B, O.person(L.ATK_B, { id: "atk", role: "attacker", scale: 0.7 }), 0, { grow: true });

// 红点阵：约 12 万枚 wETH（120 点，每点 1000 枚），从铸币机托盘前冒出
const [dx0, dy0] = A.mp.tray;
{
  const dots = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++)
    dots.push(`<circle cx="${(dx0 - 66 + c * 12).toFixed(1)}" cy="${(dy0 + 22 + r * 10).toFixed(1)}" r="3.6" fill="#e0453a"/>`);
  add({ u: L.MINT_B.u, v: L.MINT_B.v + 200 }, S.hid("dots", dots.join("")), 60);
}
// L3 护照滑到程序机器前
const PS_TO = G(1975, -330), [p0x, p0y] = Wp(L.PASS[3].u, L.PASS[3].v), [p1x, p1y] = Wp(PS_TO.u, PS_TO.v);
const MV = { x: p1x - p0x, y: p1y - p0y };
const PS3top = [A.ps3.top[0] + MV.x, A.ps3.top[1] + MV.y];

// ---------------------------------------------------------------- 世界标签
lb("lb-mp", [A.mp.ground[0] - 130, A.mp.ground[1] - 40], "wETH 铸币", "lab-cs lab-sm", "r");
lb("lb-dots", [dx0 + 2, dy0 + 128], `约 12 万枚 wETH`, "lab-rs lab-sm", "t");
lb("lb-mach", [A.mach.ground[0], A.mach.ground[1] + 70], "程序", "lab-ink lab-sm", "t");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-ps3", up(A.ps3.top, 6), "系统账户？", "lab-r lab-sm");
lb("lb-nochk", up(PS3top, 8), "？ 没查", "lab-r lab-sm");
lb("lb-pf", [A.pf.center[0] - 70, A.pf.center[1]], "守护者签名", "lab-cs lab-sm", "r");
lb("lb-pfx", [A.pf.center[0] - 70, A.pf.center[1]], "被绕开", "lab-rs lab-sm", "r");
lb("lb-fake", up(PS3top, 8), "伪造", "lab-rs lab-sm");
const rowTop = A.ps0.top, rowEnd = A.ps2.top;
lb("lb-q", up([(rowTop[0] + rowEnd[0]) / 2, (rowTop[1] + rowEnd[1]) / 2], 40), "？", "lab-ink");
lb("lb-trust", up([(rowTop[0] + rowEnd[0]) / 2, (rowTop[1] + rowEnd[1]) / 2], 40), "相信什么？", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
// L6 小插画框：EVM 一侧（售货机 + 存储柜，一格写"地址"）
const ivO = { u: 0, v: 0 }, isO = G(400, 10);
const iv = E1.vending(ivO, { id: "iv", sign: "合约" }), isl = E3.slotCabinet(isO, { id: "isl", n: 4, labels: ["0", "1", "2", "地址"], open: { 3: true }, title: "Storage" });
const inset = `<div class="k-inset hide" id="inset"><div class="in-h">EVM ${gtag("示意")}</div>
  <svg data-layout-ignore viewBox="-240 -510 950 660" width="440" height="306">${iv.svg}${isl.svg}</svg>
  <div class="in-c">地址写在 <b>代码或存储</b> 里</div></div>`;
const CC = { x: 120, y: 100, w: 760 };
const card = codeCard("cA", { ...CC, head: "读取系统账户", tag: "示意", mono: true, rowHide: true, rows: [
  { html: `<s>let ix = read_sysvar(acct)</s>`, chip: "已弃用的读取方式", chipCls: "x" },
  { html: `require(acct.key == SYSVAR_ID)`, chip: "带校验", chipCls: "ok" },
] });
S.curve("cv", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("passB", PS3top), { color: "#e0453a" });
const html = [
  evt("ev", `<div><b>Wormhole</b> · 2022 年 2 月 · Solana 一侧</div><div>铸出 <b>约 12 万枚 wETH</b></div>
    <div class="hide" id="ev-usd">约 3.2 亿美元 ${gtag("事发时估值")}</div>
    <div class="ev-src">来源：Kudelski 分析 · Halborn 分析</div>`, { color: "#e0453a" }),
  evt("src", `来源：Kudelski 分析 · Halborn 分析`, { color: "#8a8478", top: 126 }),
  inset,
  kw("kw-guess", `<b>先猜</b>`, { x: 860, y: 150, size: 60, accent: "#1d93ba" }),
  kw("kw-who", `账户由<b>谁</b>提供？`, { x: 760, y: 140, size: 56, accent: "#e0453a" }),
  kw("kw-who2", `先记住：账户由<b>谁</b>提供？`, { x: 1250, y: 220, size: 32, accent: "#e0453a" }),
  card,
  ck("ck-jump", "Jump Crypto 补足全部 ETH", { x: 1230, y: 300, w: 600, kind: "g" }),
].join("\n");
const css = `
    .k-inset { position: absolute; left: 70px; top: 300px; width: 470px; background: #fffdf8; border: 3px solid #cfc7b8; border-radius: 16px;
      padding: 12px 14px 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); font-family: "Noto Sans SC", sans-serif; z-index: 30; }
    .k-inset .in-h { font-size: 30px; font-weight: 900; color: #1c1c1c; }
    .k-inset .in-c { font-size: 28px; font-weight: 700; color: #3a3832; text-align: center; }
    .k-inset .in-c b { color: #1d93ba; }
    .ev-src { margin-top: 4px; font-size: 28px; font-weight: 700; color: #6b665c; }`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  mint: w("铸出", 0), usd: w("亿美元", 1), fake: w("伪造", 2), read: w("读了", 3), nochk: w("没有核对", 3),
  guard: w("守护者", 4), byp: w("绕开", 4), eth: w("以太坊", 6), addr: w("代码或存储", 6), who: w("由谁提供", 7),
  dep: w("弃用", 9), real: w("真的系统账户", 10), fix: w("带校验", 11), jump: w("Jump", 11), chain: w("换一条链", 12), trust: w("相信", 13),
};
const t = (x) => f(x);
const FARS = FAR.map((i) => "#far" + "ABCDE"[i]).join(", ");

S.build({
  cam0: "mintB", sub: "程序读了一本假护照",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "系统账户", d: "Solana 内置的存放系统信息的特殊账户", at: w("系统账户", 2) },
    { id: "t1", t: "守护者", d: "替 Wormhole 跨链消息签名的验证节点", at: w("守护者", 4) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2022 年 2 月，Wormhole 跨链桥在 Solana 一侧，被铸出约 12 万枚 wETH。
      pop("#lb-mp", ${t(LS[0] + 0.4)}); pop("#ev", ${t(LS[0] + 0.6)});
      X11.wheel(tl, "mp", ${t(LS[0] + 2.0)}, 1.4, 1); X11.mint(tl, "mp", ${t(TM.mint)}, 1.6, 2, 1); X11.count(tl, "mp", ${t(TM.mint + 1.0)}, "12万", "red");
      fadeIn("#dots", ${t(TM.mint + 0.8)}, 1.0); pop("#lb-dots", ${t(TM.mint + 1.6)});
      // ===== L1 按事发时的价格，约 3.2 亿美元。
      pop("#ev-usd", ${t(TM.usd - 0.6)});
      // ===== L2 攻击者往程序里，传了一个伪造的系统账户。
      out("#lb-mp, #lb-dots", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "passB", 1.2);
      grow("atk", ${t(LS[2] + 0.8)}); pop("#lb-atk", ${t(LS[2] + 1.2)});
      bump("#ps3", ${t(TM.fake)}, 1.15, 1); pop("#lb-ps3", ${t(TM.fake + 0.3)});
      // ===== L3 程序读了这个账户，没有核对它是不是真的。
      out("#lb-ps3", ${t(TM.read - 0.2)}); pop("#lb-mach", ${t(TM.read - 0.2)});
      tl.to("#ps3", { x: ${f(MV.x)}, y: ${f(MV.y)}, duration: 0.9, ease: "power2.inOut" }, ${t(TM.read)});
      X3.spin(tl, "mach", ${t(TM.read + 0.9)}, 1.6, 1);
      pop("#lb-nochk", ${t(TM.nochk)});
      // ===== L4 守护者的签名验证，就这样被绕开。
      out("#lb-atk, #lb-mach, #lb-nochk", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "mintB", 1.0);
      pop("#lb-pf", ${t(TM.guard)});
      out("#pf-card, #lb-pf", ${t(TM.byp - 0.1)}, 0.3); fadeIn("#pf-slot", ${t(TM.byp)}, 0.3); pop("#lb-pfx", ${t(TM.byp + 0.2)});
      KIT.arm(tl, "gB", ${t(TM.byp + 0.2)}, true); flash("#dots", ${t(TM.byp + 0.6)}, 2);
      // ===== L5 先猜一道题。
      out("#ev, #lb-pfx", ${t(LS[5] - 0.2)}); pop("#kw-guess", ${t(LS[5])});
      // ===== L6 在以太坊上，合约要读另一个合约，地址写在代码或存储里。
      pop("#inset", ${t(TM.eth)});
      // ===== L7 在 Solana 上，程序要读的账户，由谁提供？
      out("#inset, #kw-guess", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "passB", 1.2);
      pop("#lb-q", ${t(TM.who - 0.3)}); pop("#kw-who", ${t(TM.who)});
      // ===== L8 先记住这个问题。
      out("#kw-who, #lb-q", ${t(LS[8] + 0.4)}); pop("#kw-who2", ${t(LS[8] + 0.6)});
      // ===== L9 按 Kudelski 和 Halborn 的分析，问题出在一个已经弃用的读取函数。
      pop("#src", ${t(LS[9] + 0.3)}); pop("#cA", ${t(TM.dep - 0.6)}); pop("#cA-r0", ${t(TM.dep - 0.4)}); pop("#cA-c0", ${t(TM.dep + 0.2)});
      // ===== L10 它不检查传进来的系统账户，是不是真的系统账户。
      draw("cv", ${t(LS[10] + 0.2)}); hot("#cA-r0", ${t(LS[10] + 0.2)});
      X13.fake(tl, "ps3", ${t(TM.real)}); pop("#lb-fake", ${t(TM.real + 0.2)});
      // ===== L11 修复的办法，是改用带校验的函数。Jump Crypto 补足了全部 ETH。
      out("#cv", ${t(TM.fix - 0.3)}); pop("#cA-r1", ${t(TM.fix)}); pop("#cA-c1", ${t(TM.fix + 0.3)});
      out("#lb-fake", ${t(TM.fix + 0.4)}); KIT.broke(tl, "ps3", ${t(TM.fix + 0.5)});
      out("#src", ${t(TM.jump - 0.4)}); pop("#ck-jump", ${t(TM.jump)});
      // ===== L12 同样的错误，换一条链，就换了一副样子。
      out("#cA, #ck-jump", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "roadB", 1.4);
      fadeIn("${FARS}", ${t(TM.chain)}, 1.0);
      // ===== L13 每种链上的程序，到底在相信什么？
      cam(${t(LS[13])}, "solB", 1.2); pop("#lb-trust", ${t(TM.trust + 0.3)});
`,
});
