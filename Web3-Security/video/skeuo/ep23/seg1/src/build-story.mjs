// ep23/seg1「① 暂停之后」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.hotB（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.delegB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E7, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 包层缩放（常见坑 1）：绕地面点缩放并换算 anchors
const wput = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) {
    const v = A[key][n];
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k];
  }
};
const P = (u, v, z = 0) => Wp(u, v, z).map(Math.round);

// ---------------------------------------------------------------- 世界物件
// 石板路（最底层）
{
  const R = L.ROAD, q = [P(R.u0, R.v0), P(R.u1, R.v0), P(R.u1, R.v1), P(R.u0, R.v1)];
  add({ u: -9000, v: -9000 }, `<polygon points="${q.map((p) => p.join(",")).join(" ")}" fill="#e4e6ea" stroke="#cfd3d9" stroke-width="2"/>`, -99999);
}
put("signB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "signB", style: "plate", text: "金库 · 冷钱包" }));
put("cold", L.COLD, O.safe(L.COLD, { id: "cold", plate: "冷钱包", gold: true }));
wput("warm", L.WARM, O.safe(L.WARM, { id: "warm", plate: "温钱包" }));
const HN = ["XRP", "BTC", "ETH"];
L.HOT.forEach((o, i) => wput("hot" + i, o, O.safe(o, { id: "hot" + i, variant: "hot", plate: HN[i] + " 热钱包" })));
L.KNIFE.forEach((o, i) => wput("kn" + i, o, O.knifeSwitch(o, { id: "kn" + i, on: true, text: "熔断" })));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("clk", L.CLOCK, O.clock(L.CLOCK, { id: "clk", h: 23, m: 20 }));
// 出口管：三根短管 → 汇流管（沿 v）→ 出口（沿 u，过暂停闸）
const PZ = 50, MU = 3580, EV = L.TOLL.v, EU = 3900;
L.HOT.forEach((o, i) => {
  const s = { u: o.u + 64, v: o.v };
  put("st" + i, s, E1.pipe(s, { id: "st" + i, pts: [[0, 0, PZ], [MU - s.u, 0, PZ]] }), 2);
});
{
  const m = { u: MU, v: L.HOT[0].v };
  put("mf", m, E1.pipe(m, { id: "mf", pts: [[0, 0, PZ], [0, EV - m.v, PZ], [EU - MU, EV - m.v, PZ]] }), 330);
}
put("toll", L.TOLL, E7.tollClip(L.TOLL, { id: "toll", scale: L.TOLL.scale, z: PZ / L.TOLL.scale, r: 9 / L.TOLL.scale, axis: "u", pile: 0 }), 3);
put("addr", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "addr", text: "热钱包地址" }));
put("tag", L.TAG_B.o, E15.delegateTag(L.TAG_B.o, { id: "tag", ...L.TAG_B.opts, state: "attacker", target: "攻击者合约", on: false }));
put("vend", L.MINIVEND, E1.miniVend(L.MINIVEND, { id: "vend", kind: "attacker", scale: L.MINIVEND.scale }));
// 新转入的真币（L13 从左飞来，停在半空）
const COIN = S.rel(L.ADDR_B, -260, -40);
put("coin", COIN, E7.oddCoin(COIN, { id: "coin", kind: "plain", scale: 0.7 }), 500,
  { wrap: (svg) => `<g id="coinMv" opacity="0">${svg}</g>` });

// 流出的转账（红信封）：L2 每只热钱包 3 封，L4 ETH 绕闸 3 封
const OFF = P(5400, 250), LOUT = P(L.LETTER_OUT.u, L.LETTER_OUT.v, PZ);
const MAIN = (i) => [P(MU, L.HOT[i].v, PZ), P(MU, EV, PZ), P(EU, EV, PZ), LOUT, OFF];
const H2 = L.HOT[2];
const BYP = [P(H2.u + 70, H2.v + 90, PZ), P(L.TOLL.u, EV + 190, PZ + 40), P(EU, EV + 60, PZ), LOUT, OFF];
const LET = [];
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) LET.push({ id: `lt${i}${j}`, from: L.HOT[i], path: MAIN(i), wal: i, j });
for (let j = 0; j < 3; j++) LET.push({ id: `lb${j}`, from: H2, path: BYP, wal: 2, j, byp: true });
for (const l of LET) {
  const o = { u: l.from.u + 64, v: l.from.v };
  put(l.id, o, E1.letter(o, { id: l.id, state: "attacker", z: PZ - 10, w: 62, h: 42 }), 800,
    { wrap: (svg) => `<g id="${l.id}W" opacity="0">${svg}</g>` });
}
// 绕过闸门的红虚线
{
  const a = P(H2.u + 70, H2.v, PZ), b = P(L.TOLL.u, EV + 190, PZ + 40), c = P(EU, EV + 20, PZ);
  add(L.TOLL, S.hid("byp", `<path d="M${a} Q${b[0] - 60},${b[1] + 10} ${b} T${c}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/>`), 700);
}
// 点阵 63（9 × 7，每点约 1 亿美元）
const [dx, dy0] = at(L.DOTS_B), DS = 25;
{
  let rows = "";
  for (let r = 0; r < 7; r++) {
    let c = "";
    for (let k = 0; k < 9; k++) c += `<circle cx="${dx + 10 + k * DS}" cy="${dy0 + 10 + r * DS}" r="8.5" fill="#e0453a"/>`;
    rows += S.hid("dr" + r, c);
  }
  add(L.DOTS_B, rows + S.hid("dfr", `<rect x="${dx - 6}" y="${dy0 - 6}" width="${9 * DS + 7}" height="${7 * DS + 7}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>`), 2000);
}
// 问号 + 指向画外（C 区方向）的灰虚线
const QP = up(A.hot1.top, 70);
add(L.HOT[1], S.hid("qm", `<text x="${QP[0]}" y="${QP[1]}" font-size="150" font-weight="800" fill="#1c1c1c" text-anchor="middle" font-family="sans-serif">?</text>`
  + `<path d="M${QP[0] + 70},${QP[1] - 50} Q${QP[0] + 600},${QP[1] - 260} ${QP[0] + 1500},${QP[1] - 300}" fill="none" stroke="#8a8f96" stroke-width="5" stroke-dasharray="12 9"/>`), 2000);
// 委托挂牌 → 攻击者合约 的红虚线
{
  const [ax, ay] = A.tag.text, [bx, by] = A.vend.front;
  add(L.MINIVEND, S.hid("dl", `<path d="M${ax + 22},${ay} Q${(ax + bx) / 2 + 40},${Math.min(ay, by) - 90} ${bx},${by}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/>`), 1200);
}

// ---------------------------------------------------------------- 世界标签
HN.forEach((n, i) => lb("lb-h" + i, up(A["hot" + i].top, 10), ["① ", "② ", "③ "][i] + n, "lab-rs lab-sm"));
lb("lb-toll", up(A.toll.top, 12), "暂停提现", "lab-gs lab-sm");
lb("lb-toll2", up(A.toll.top, 12), "暂停提现", "lab-gs lab-sm");
lb("lb-byp", [BYP[1][0] + 20, BYP[1][1] + 34], "未授权转账", "lab-rs lab-sm", "t");
lb("lb-clk", up(A.clk.top, 8), "最后一笔 23:56 UTC", "lab-ink lab-sm");
lb("lb-dots", [dx + 9 * DS / 2, dy0 + 7 * DS + 14], "每点约 1 亿美元 · 约 63.4 亿美元 · 项目方口径", "lab-ink lab-sm", "t");
lb("lb-rec", [dx + 9 * DS / 2, dy0 - 14], "有记录以来最大", "lab-r");
lb("lb-cold", up(A.cold.top, 10), "私钥：未见泄露证据", "lab-gs lab-sm");
lb("lb-kn", [A.kn2.center[0] - 40, A.kn2.center[1] + 30], "热钱包服务：已关", "lab-ink lab-sm", "r");
lb("lb-vend", up(A.vend.top, 8), "攻击者合约", "lab-r lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev0", "Binance · 2026 年 10 月 29 日", { color: "#e0453a" })
  + evt("src0", "来源：Binance 初步报告", { top: 196 })
  + `<div id="qc" class="qc hide"><div class="qc-h">先猜</div><div id="qc-b" class="qc-b"><div>提现已停</div><div>服务已关</div><div class="qc-q">新进的钱安全吗？</div></div></div>`
  + `<div id="sil-l" class="sil hide" style="left:1380px;top:600px">保管者</div>`
  + `<div id="sil-r" class="sil hide" style="left:1630px;top:600px">检查站</div>`;
const css = `
  .qc { position:absolute; left:1420px; top:300px; width:420px; background:#fff; border-radius:18px; border:3px solid #1c1c1c;
        box-shadow:0 8px 24px rgba(0,0,0,.12); padding:22px 28px; font-family:sans-serif; transform-origin: top right; }
  .qc-h { display:inline-block; background:#1c1c1c; color:#fff; font-size:36px; font-weight:700; padding:4px 16px; border-radius:10px; }
  .qc-b { margin-top:14px; font-size:36px; line-height:1.5; color:#1c1c1c; opacity:0; }
  .qc-q { color:#e0453a; font-weight:700; }
  .sil { position:absolute; width:220px; padding:16px 0; text-align:center; font:700 40px sans-serif; color:#7d828a;
         border:3px dashed #a9aeb5; border-radius:14px; background:rgba(255,255,255,.45); }
`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  xrp: w("XRP", 1), btc: w("比特币", 1), eth: w("以太坊", 1),
};
const t = (x) => f(x);
// 信封 js：每只热钱包出口一串（L2），ETH 绕闸一串（L4）
const letJs = LET.map((l) => {
  const t0 = l.byp ? LS[4] + 1.2 + l.j * 1.3 : LS[2] + l.wal * 0.7 + l.j * 0.45, d = 2.6;
  return `fadeIn("#${l.id}W", ${t(t0)}, 0.2); X1.walk(tl, "${l.id}", ${t(t0)}, ${d}, ${JSON.stringify(l.path)}, "none"); out("#${l.id}W", ${t(t0 + d - 0.35)}, 0.3);`;
}).join("\n      ");

S.build({
  cam0: "hotB", sub: "提现停了，钱还在流",
  grid: { u0: 1100, u1: 6200, v0: -2600, v1: 2600 }, box: [1100, -2200, 3600, 2200],   // 盖住 hotB → delegB
  shown: [], css, html,
  terms: [
    { id: "t0", t: "热钱包", d: "联网、随时能签名出款的钱包", at: w("热钱包", 0) },
    { id: "t1", t: "EIP-7702 委托", d: "让普通账户执行某个合约的代码", at: w("EIP-7702 委托", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2026 年 10 月 29 日，Binance 的热钱包，开始大额转出。
      KIT.beacon(tl, "bcn", ${t(LS[0] + 1.6)}, ${t(LE[9] - LS[0] - 1.8)}, 1.6);
      pop("#ev0", ${t(LS[0] + 1.8)}); pop("#src0", ${t(LS[0] + 2.4)});
      // ===== L1 先是 XRP，再是比特币，然后是以太坊。
      ${[TM.xrp, TM.btc, TM.eth].map((x, i) => `pop("#lb-h${i}", ${t(x)}, 0.25); bump("#hot${i}", ${t(x)}, 1.06, 1);`).join(" ")}
      // ===== L2 一条链接着一条链，资产往外流。
      ${[0, 1, 2].map((i) => `KIT.door(tl, "hot${i}", ${t(LS[2] + i * 0.7 - 0.3)}, 90, 0.8);`).join(" ")}
      ${letJs}
      // ===== L3 交易所发现之后，暂停了提现。
      out("#ev0, #src0, #lb-h0, #lb-h1, #lb-h2", ${t(LS[3] - 0.2)});
      X7.tollBlade(tl, "toll", ${t(w("暂停", 3))}, true); pop("#lb-toll", ${t(w("暂停", 3) + 0.2)}, 0.25);
      // ===== L4 可按项目方的初步报告，暂停提现，没有挡住全部的未授权转账。
      fadeIn("#byp", ${t(LS[4] + 0.4)}, 0.5); pop("#lb-byp", ${t(LS[4] + 1.3)}, 0.25);
      // ===== L5 最后一笔，到世界协调时 23 点 56 分，才转完。
      KIT.clock(tl, "clk", ${t(LS[5] + 0.4)}, 2.4, 36); pop("#lb-clk", ${t(LS[5] + 2.8)}, 0.25); bump("#lb-clk", ${t(LS[5] + 4.4)}, 1.12, 1);
      // ===== L6 项目方的口径是，约 63.4 亿美元。
      
      ${[0, 1, 2, 3, 4, 5, 6].map((r) => `fadeIn("#dr${r}", ${t(LS[6] + 0.3 + r * 0.25)}, 0.2);`).join(" ")}
      pop("#lb-dots", ${t(LS[6] + 2.2)}, 0.25);
      // ===== L7 这是有记录以来，最大的一起加密资产盗窃案。
      fadeIn("#dfr", ${t(LS[7] + 0.3)}, 0.4); pop("#lb-rec", ${t(LS[7] + 0.6)}, 0.25);
      // ===== L8 更反常的是，Binance 称，没有发现私钥泄露的证据。
      pop("#src0", ${t(LS[8] + 0.6)}); pop("#lb-cold", ${t(LS[8] + 1.4)}, 0.25); bump("#cold", ${t(LS[8] + 1.4)}, 1.03, 1);
      // ===== L9 没有私钥，钱是怎么签出去的？
      fadeIn("#qm", ${t(LS[9] + 0.2)}, 0.3);
      // ===== L10 先猜一道题。
      out("#src0, #lb-toll, #lb-byp, #lb-clk, #lb-dots, #lb-rec, #lb-cold, #qm, #byp, #dfr, ${[0, 1, 2, 3, 4, 5, 6].map((r) => "#dr" + r).join(", ")}", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "delegB", 1.3); pop("#qc", ${t(LS[10] + 0.6)}, 0.3);
      // ===== L11 提现已经暂停，热钱包服务也关掉了。
      pop("#lb-toll2", ${t(LS[11] + 0.3)}, 0.25); bump("#toll", ${t(LS[11] + 0.3)}, 1.1, 1);
      KIT.toggle(tl, "kn2", ${t(w("关掉", 11))}, false); pop("#lb-kn", ${t(w("关掉", 11) + 0.3)}, 0.25);
      // ===== L12 以太坊热钱包上，还留着一个恶意的 EIP-7702 委托。
      X15.tagDrop(tl, "tag", ${t(LS[12] + 1.4)}); fadeIn("#dl", ${t(LS[12] + 2.4)}, 0.5); pop("#lb-vend", ${t(LS[12] + 3.0)}, 0.25);
      // ===== L13 这时候，新转进这个地址的钱，安全吗？
      tl.fromTo("#coinMv", { x: -520, y: 60, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.4, ease: "power2.out" }, ${t(LS[13] + 0.3)});
      tl.to("#qc-b", { opacity: 1, duration: 0.35 }, ${t(LS[13] + 0.8)});
      // ===== L14 带着这个问题，我们看看交易所的两张面孔。
      tl.to("#qc", { scale: 0.8, x: 20, y: -180, duration: 0.6, ease: "power2.inOut" }, ${t(LS[14] + 0.2)});
      pop("#sil-l", ${t(LS[14] + 1.4)}, 0.3); pop("#sil-r", ${t(LS[14] + 1.7)}, 0.3);
`,
});
