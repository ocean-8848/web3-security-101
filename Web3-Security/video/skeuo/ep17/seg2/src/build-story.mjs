// ep17/seg2「② 你读的是谁的链」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.monitorA（BRIEF）。ends static on CAMS.windowB
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   bridgeA      A 近景：桥岗亭 + 两个被替换的 RPC + 桥头牌 + 攻击者（seg1 起点 L0–L5；seg5 L0–L2 回摇）
//   failA        A 近景：外部 RPC ×2 + 扳道器 + 被替换的 RPC（seg1 L6–L8；seg5 L10 插回）
//   monitorA     A 监控工位 + 被替换的 RPC（连线），右侧留题卡位置（seg1 L9–L12 终点、seg2 起点；seg6 L6–L9）
//   A            A 全区（点阵 29 点在左下）
//   pipeB        B 数据管线全景：链 → 节点 → RPC → 索引器 → 入账台 + 三块层牌 + 少数派分叉（seg2 L0–L4、L10–L11 横移到这里）
//   clientB      B 近景：节点客户端 + 少数派分叉 + 主链（seg2 L5–L9）
//   routeB       B 近景：扳道器 + 攻击者服务器 + 钓鱼站 + 网络路由牌 + 三簇点阵（seg2 L12–L16）
//   windowB      B 窗户比喻：只有一扇窗 + 看窗的人 + 比喻牌（seg2 L17–L21 终点、seg3 起点；seg5 L14）
//   B            B 全区
//   peerC        C 近景：插线板 + 地址表 + 攻击者节点 + 攻击者给的链 + P2P 牌（seg3 L0–L10；seg5 L13 插镜）
//   nodeC        C 近景：受害节点 + 重启闸刀 + 备用节点（seg3 L11–L16）
//   portC        C 近景：防火墙 + JWT + 扫描放大镜 + 8545 RPC + 执行 / 共识客户端（seg3 L17–L21 终点、seg4 起点）
//   C            C 全区
//   slashD       D 两台机柜 + 密钥 + 运维 + 时钟 + 以太坊网络 + 防罚没数据 / 等待 / 分身检测（seg4 L0–L11）
//   relayD       D relay 区：构建者 + relay 投标箱 + 区块头 + 提议者 + 交易包 + 点阵（seg4 L12–L19 终点、seg5 起点；seg6 L3）
//   D            D 全区
//   quorumE      E 多源仲裁台：三个 RPC + 比对 + 法定数表 + 入账台 + 入账闸刀 + 客户端 A / B（seg5 L3–L16 终点、seg6 起点）
//   rolesE       E 角色板 + 手机（seg6 L0–L5）
//   E            E 全区
//   wide         读链大街全景 A → E（seg6 L10–L11 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1, E7, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const scA = (key, o, k) => { const [gx, gy] = at(o); for (const [n, p] of Object.entries(A[key])) if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; };
const putK = (key, o, r, opts = {}) => { put(key, o, r, 0, { ...opts, wrap: wrapK(o, o.scale) }); scA(key, o, o.scale); };

// 石板路（原生 SVG，最底层）
{
  const [[x0, y0], [x1, y1]] = L.ROAD, dx = 0.574 * 150, dy = 0.41 * 150;
  add({ u: 0, v: 0 }, `<polygon points="${x0},${y0 - dy} ${x1},${y1 - dy} ${x1 + dx},${y1} ${x0 + dx},${y0}" fill="#dcd7cd" stroke="#cdc6b8" stroke-width="3"/>`, -1e6);
}

// ---- A 区（seg1 段尾状态：两个被替换的 RPC 已变红、外部 RPC 已打掉、扳道器已扳过去、监控仍显示正常）
putK("brg", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "brg", booth: "normal" }));
L.FAKE.forEach((o, i) => put("fake" + i, o, O.rpc(o, { id: "fake" + i, state: "attacker", led: "red" })));
L.EXTRPC.forEach((o, i) => put("ext" + i, o, O.rpc(o, { id: "ext" + i, state: "broken" })));
put("fkA", L.FORKA, E16.forkSwitch(L.FORKA, { id: "fkA", scale: L.FORKA.scale, thrown: true, labels: ["外部 RPC", "被替换的节点"] }));
put("pa0", L.APIPE.fake0.o, E1.pipe(L.APIPE.fake0.o, { id: "pa0", pts: L.APIPE.fake0.pts }), -0.5);
put("pa1", L.APIPE.fake1.o, E1.pipe(L.APIPE.fake1.o, { id: "pa1", pts: L.APIPE.fake1.pts }), -0.5);
put("deskA", L.DESKA, O.desk(L.DESKA, { id: "deskA", screen: `<rect width="148" height="88" fill="#e8f5ec"/><text x="74" y="54" text-anchor="middle" font-size="22" font-weight="700" fill="#1f9d55" font-family="Noto Sans SC">一切正常 ✓</text>` }));

// ---- B 区：管线
put("chB", L.CHAINB, O.chain(L.CHAINB, { id: "chB", n: 4 }));
put("node", L.NODEB, O.rack(L.NODEB, { id: "node", tag: "节点客户端" }));
put("rpcb", L.RPCB, O.rpc(L.RPCB, { id: "rpcb" }));
put("idx", L.IDXB, O.dbLedger(L.IDXB, { id: "idx", tag: "索引器" }));
put("exch", L.EXCHB, E7.dispatchDesk(L.EXCHB, { id: "exch", scale: L.EXCHB.scale, entries: [{ text: "提币 暂停", kind: "ghost" }], shown: 0 }));
["node", "rpc", "idx", "desk"].forEach((k, i) => put("p" + i, L.BPIPE[k].o, E1.pipe(L.BPIPE[k].o, { id: "p" + i, pts: L.BPIPE[k].pts }), -0.5));
const LAYN = ["节点客户端", "RPC 服务", "索引器", "网络路由"];
L.LAYERS.forEach((o, i) => put("lay" + i, o, E1.signBoard(o, { id: "lay" + i, style: "plate", text: LAYN[i] })));
putK("minor", L.MINORITY, O.chain(L.MINORITY, { id: "minor", n: 3, blockStates: ["attacker", "attacker", "attacker"] }), { grow: true });
// ---- B 区：路由
put("fkB", L.FORKB, E16.forkSwitch(L.FORKB, { id: "fkB", scale: L.FORKB.scale, thrown: false, labels: ["真实服务器", "攻击者服务器"] }));
putK("atk", L.ATKSRV, O.rack(L.ATKSRV, { id: "atk", tag: "攻击者服务器", state: "attacker", leds: ["red", "red", "red"] }), { grow: true });
putK("phish", L.PHISH, O.browserWin(L.PHISH, { id: "phish", title: "钓鱼站", state: "attacker" }), { grow: true });
// 三簇点阵（每点约 5 万美元）：MyEtherWallet 3、KLAYswap 38、Celer 5
const DOTN = [3, 38, 5], DCOL = [2, 10, 3], DSP = 18;
{
  const [gx, gy] = at(L.DOTSB); let x = gx;
  DOTN.forEach((n, k) => {
    const c = []; for (let i = 0; i < n; i++) c.push(`<circle cx="${x + (i % DCOL[k]) * DSP + 7}" cy="${gy + Math.floor(i / DCOL[k]) * DSP + 7}" r="7" fill="#e0453a"/>`);
    add(L.DOTSB, S.hid("dots" + k, c.join("")), 40);
    x += DCOL[k] * DSP + 40;
  });
}
// ---- B 区：窗户比喻
put("sgw", L.SIGNWIN, E1.signBoard(L.SIGNWIN, { id: "sgw", style: "plate", text: "比喻 · 窗户" }), 0, { grow: true });
put("win", L.WINDOW, X.viewWindow(L.WINDOW, { id: "win", scale: 1, mode: "live", label: "屏幕" }), 0, { grow: true });
put("watch", L.WATCHER, O.person(L.WATCHER, { id: "watch", role: "signer", scale: L.WATCHER.scale }), 0, { grow: true });
const WIN2 = { ...S.rel(L.WINDOW, 240, 160), scale: 1 };   // 第二扇窗：半透明虚影，在第一扇窗右侧
const w2 = X.viewWindow(WIN2, { id: "win2", scale: 1, mode: "live", label: "屏幕" });
A.win2 = w2.anchors; add(WIN2, S.hid("win2g", w2.svg));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-chB", up(A.chB.top, 8), "P2P 网络", "lab-cs lab-sm");
lb("lb-node", up(A.node.top, 8), "节点", "lab-cs lab-sm");
lb("lb-node2", up(A.node.top, 8), "Infura · 旧版 Geth", "lab-rs lab-sm");
lb("lb-rpc", up(A.rpcb.top, 8), "RPC", "lab-cs lab-sm");
lb("lb-idx", up(A.idx.top, 8), "索引器", "lab-cs lab-sm");
L.LAYERS.forEach((o, i) => {
  const p = [A["lay" + i].board[0] + A["lay" + i].w / 2 + 14, A["lay" + i].board[1]];
  lb("xs" + i, p, "✗", "xslot lab-sm", "l");
  lb("xr" + i, p, "✗", "lab-rs lab-sm", "l");
});
lb("lb-minor", up(A.minor.top, 6), "少数派分叉", "lab-rs lab-sm", "b");
lb("lb-mm", up(A.rpcb.top, 8), "MetaMask 等", "lab-cs lab-sm");
lb("lb-wd", A.exch.top, "ETH / ERC-20 提币 暂停", "lab-rs lab-sm");
lb("lb-down", [A.rpcb.top[0] - 130, A.rpcb.top[1]], "宕机", "lab-rs lab-sm");
lb("lb-rate", A.rpcb.top, "限流", "lab-rs lab-sm");
lb("lb-stale", [A.rpcb.top[0] + 130, A.rpcb.top[1]], "过期", "lab-rs lab-sm");
const HG = `<svg width="16" height="22" viewBox="0 0 16 22"><path d="M2 2h12M2 20h12M4 2c0 6 8 6 8 9s-8 3-8 9M12 2c0 6-8 6-8 9s8 3 8 9" stroke="currentColor" fill="none" stroke-width="2"/></svg>`;
lb("lb-lag", up(A.idx.top, 66), `${HG}延迟`, "lab-rs lab-sm");
lb("lb-mis", up(A.idx.top, 4), "解释错", "lab-rs lab-sm");
lb("lb-sdk", up(A.phish.top, 6), "SDK 下载域名 → 恶意脚本", "lab-rs lab-sm");
lb("lb-sub", up(A.phish.top, 6), "合约地址子域", "lab-rs lab-sm");
lb("lb-delay", up(A.win.top, 8), "延迟", "lab-cs lab-sm");
lb("lb-rec", up(A.win.top, 8), "● 播录像", "lab-rs lab-sm");
lb("lb-alt", up(A.win2.top, 8), "✓ 换一扇再看", "lab-gs lab-sm");
lb("lb-x2", A.win2.center, "✗", "lab-rs", "c");
lb("lb-one", [A.win.ground[0] - 40, A.win.ground[1] + 24], "只有一个 RPC", "lab-rs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
// L1 "直接读链" 红虚线（pipeB 镜头下）
const P0 = S.scr("pipeB", A.exch.top), P3 = S.scr("pipeB", A.chB.top);
const C1 = [P0[0] - 150, P0[1] - 230], C2 = [P3[0] + 150, P3[1] - 230];
const MID = [0.125 * P0[0] + 0.375 * C1[0] + 0.375 * C2[0] + 0.125 * P3[0], 0.125 * P0[1] + 0.375 * C1[1] + 0.375 * C2[1] + 0.125 * P3[1]];
S.curve("cv-direct", P0, P3, { color: "#e0453a", c1: C1, c2: C2 });
// L7 节点 → 少数派分叉（clientB）
S.curve("cv-fork", S.scr("clientB", A.node.center), S.scr("clientB", A.minor.top), { color: "#e0453a" });
// L13 流量 → 扳道器 → 攻击者服务器（routeB）
const FK = S.scr("routeB", A.fkB.disc);
S.curve("cv-in", S.scr("routeB", A.exch.top), FK, { color: "#2aa3c9", c1: [S.scr("routeB", A.exch.top)[0] + 40, S.scr("routeB", A.exch.top)[1] - 80], c2: [FK[0] - 60, FK[1] - 60] });
S.curve("cv-atk", FK, S.scr("routeB", A.atk.center), { color: "#e0453a", c1: [FK[0] + 40, FK[1] - 80], c2: [S.scr("routeB", A.atk.center)[0] - 80, S.scr("routeB", A.atk.center)[1]] });
const LG = [["每点约 5 万美元", "lg-h"], ["MyEtherWallet · 约 15 万美元", ""], ["KLAYswap · 约 190 万美元", ""], ["Celer cBridge · 约 24 万美元", ""]];
const html = `<div id="x-direct" class="lab lab-rs hide" style="position:absolute;left:${Math.round(MID[0])}px;top:${Math.round(MID[1])}px;transform:translate(-50%,-50%)">✗ 直接读链</div>`
  + `<div id="lg" class="lgc hide">${LG.map(([t, c], i) => `<div id="lg-r${i}" class="lgr ${c}${i ? " hide" : ""}"><i></i>${t}</div>`).join("")}</div>`
  + evt("ev-inf", "<b>Infura</b> · 2020 年 11 月", { top: 120 })
  + evt("src-inf", "来源 · The Block、rekt.news", { color: "#6b665c", top: 200 })
  + evt("ev-mew", "<b>MyEtherWallet</b> · 2018 年 4 月", { top: 122, color: "#e0453a" })
  + evt("src-mew", "来源 · The Register", { color: "#6b665c", top: 202 })
  + evt("ev-klay", "<b>KLAYswap</b> · 2022 年", { top: 124, color: "#e0453a" })
  + evt("src-klay", "来源 · S2W 事后分析", { color: "#6b665c", top: 204 })
  + evt("ev-celer", "<b>Celer cBridge</b> · 2022 年", { top: 126, color: "#e0453a" })
  + evt("src-celer", "来源 · Coinbase 分析、Kentik", { color: "#6b665c", top: 206 });
const css = `
.xslot { background: #f7f4ee; border: 3px dashed #b3ab9c; color: #b3ab9c; }
.lgc { position: absolute; left: 1310px; top: 470px; width: 500px; background: #fff; border: 3px solid #e0453a; border-radius: 16px; padding: 14px 22px; font-family: "Noto Sans SC", sans-serif; }
.lgr { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 700; color: #1c1c1c; line-height: 46px; }
.lgr i { width: 16px; height: 16px; border-radius: 50%; background: #e0453a; flex: none; }
.lgr.lg-h { color: #c3352b; border-bottom: 2px solid #f0d6d3; margin-bottom: 4px; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  node: w("节点", 2), rpc: w("RPC", 2), idx: w("索引器", 2),
  infura: w("Infura", 6), fork: w("少数派分叉", 7), mm: w("MetaMask", 8), pause: w("暂停", 9),
  down: w("宕机", 10), rate: w("限流", 10), stale: w("过期", 10), lag: w("延迟", 11), mis: w("解释错", 11),
  bgp: w("引到", 13), mew: w("MyEtherWallet", 14), klay: w("KLAYswap", 15), celer: w("Celer", 16),
  flow: w("车流", 18), delay: w("延迟", 19), rec: w("录像", 19), alt: w("换一扇窗", 20), one: w("只接了", 21),
};
const t = (x) => f(x);

S.build({
  cam0: "monitorA", sub: "你读到的，是某个节点告诉你的链",
  grid: { u0: -2100, u1: 6800, v0: -3900, v1: 4800 }, box: [-1000, -1900, 6300, 2800], shown: ["#lb-chB"],   // 盖住 monitorA / pipeB / clientB / routeB / windowB / B
  css, html,
  terms: [
    { id: "t0", t: "索引器", d: "把链上数据整理成可查询数据库的服务", at: w("索引器", 2) },
    { id: "t1", t: "共识 bug", d: "让节点对哪条链正确判断出错的缺陷", at: w("共识 bug", 7) },
    { id: "t2", t: "BGP 劫持", d: "用错误的路由宣告把流量引走", at: w("BGP 劫持", 13) },
    { id: "t3", t: "SDK", d: "嵌进网页或应用里的第三方代码包", at: w("SDK", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 横移到 B 管线全景
      cam(${t(LS[0])}, "pipeB", 1.5, "power2.inOut");
      // ===== L1 直接读链：红虚线打红叉
      draw("cv-direct", ${t(LS[1] + 0.2)}, 0.8); pop("#x-direct", ${t(w("直接", 1))});
      // ===== L2 节点 / RPC / 索引器依次亮起
      pop("#lb-node", ${t(TM.node)}); bump("#node", ${t(TM.node)}, 1.04, 1);
      pop("#lb-rpc", ${t(TM.rpc)}); bump("#rpcb", ${t(TM.rpc)}, 1.06, 1);
      pop("#lb-idx", ${t(TM.idx)}); bump("#idx", ${t(TM.idx)}, 1.06, 1);
      out("#cv-direct, #x-direct", ${t(LS[3] - 0.2)});
      // ===== L3 数据流向（关键画面）
      [0, 1, 2, 3].forEach((i) => fadeIn("#p" + i + "-flow", ${t(LS[3] + 0.3)} + i * 0.9, 0.3));
      X1.dash(tl, ["p0-flow", "p1-flow", "p2-flow", "p3-flow"], ${t(LS[3] + 0.3)}, ${t(LE[11] - LS[3])}, 1400);
      // ===== L4 每一层都可能出错：灰色 ✗ 位（关键画面）
      [0, 1, 2, 3].forEach((i) => pop("#xs" + i, ${t(LS[4] + 0.3)} + i * 0.25, 0.25));
      // ===== L5 节点客户端
      out("#lb-rpc, #lb-idx, #lb-chB", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "clientB", 1.3);
      bump("#lay0", ${t(LS[5] + 1.0)}, 1.08, 2);
      // ===== L6 Infura 旧版 Geth
      out("#lb-node", ${t(TM.infura - 0.1)}, 0.2); pop("#lb-node2", ${t(TM.infura)});
      pop("#ev-inf", ${t(LS[6] + 0.2)}); pop("#src-inf", ${t(LS[6] + 0.6)});
      // ===== L7 少数派分叉
      grow("minor", ${t(LS[7] + 0.4)}); draw("cv-fork", ${t(TM.fork - 0.4)}, 0.7); pop("#lb-minor", ${t(TM.fork)});
      out("#xs0", ${t(TM.fork + 0.3)}, 0.15); pop("#xr0", ${t(TM.fork + 0.5)}, 0.25);
      // ===== L8 MetaMask 等受影响（变灰）
      pop("#lb-mm", ${t(TM.mm)}); tl.to("#lb-mm", { opacity: 0.4, filter: "grayscale(1)", duration: 0.4 }, ${t(TM.mm + 1.2)});
      // ===== L9 交易所暂停提币
      out("#ev-inf, #src-inf, #lb-mm, #lb-minor, #cv-fork", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "pipeB", 1.2);
      X7.entry(tl, "exch", ${t(TM.pause)}, 0, 0.5); KIT.led(tl, "exch-led", ${t(TM.pause)}, "red"); pop("#lb-wd", ${t(TM.pause + 0.2)});
      // ===== L10 RPC：宕机 / 限流 / 过期
      out("#lb-wd", ${t(LS[10])});
      KIT.led(tl, "rpcb-led-0", ${t(TM.down)}, "red"); pop("#lb-down", ${t(TM.down)});
      flash("#rpcb-wave-0, #rpcb-wave-1, #rpcb-wave-2", ${t(TM.rate)}, 2, 0.1); pop("#lb-rate", ${t(TM.rate)});
      KIT.led(tl, "rpcb-led-0", ${t(TM.stale)}, "#9a958c"); tl.to("#rpcb-wave-0, #rpcb-wave-1, #rpcb-wave-2", { opacity: 0.2, duration: 0.3 }, ${t(TM.stale)}); pop("#lb-stale", ${t(TM.stale)});
      out("#xs1", ${t(TM.stale + 0.4)}, 0.15); pop("#xr1", ${t(TM.stale + 0.6)}, 0.25);
      // ===== L11 索引器：延迟 / 解释错
      pop("#lb-lag", ${t(TM.lag)}); pop("#lb-mis", ${t(TM.mis)});
      out("#xs2", ${t(TM.mis + 0.4)}, 0.15); pop("#xr2", ${t(TM.mis + 0.6)}, 0.25);
      // ===== L12 网络路由
      out("#lb-down, #lb-rate, #lb-stale, #lb-lag, #lb-mis, #lb-node2", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "routeB", 1.3);
      bump("#lay3", ${t(LS[12] + 1.0)}, 1.08, 2);
      // ===== L13 BGP 劫持：扳道器扳到攻击者服务器
      draw("cv-in", ${t(LS[13] + 0.2)}, 0.6); grow("atk", ${t(LS[13] + 0.8)});
      X16.flip(tl, "fkB", ${t(TM.bgp - 0.6)}, true); draw("cv-atk", ${t(TM.bgp)}, 0.7);
      out("#xs3", ${t(TM.bgp + 0.5)}, 0.15); pop("#xr3", ${t(TM.bgp + 0.7)}, 0.25);
      // ===== L14 MyEtherWallet：钓鱼站 + 3 点
      grow("phish", ${t(TM.mew)}); pop("#ev-mew", ${t(LS[14] + 0.2)}); pop("#src-mew", ${t(LS[14] + 0.6)});
      pop("#lg", ${t(TM.mew + 0.6)}); pop("#lg-r1", ${t(TM.mew + 0.8)}); fadeIn("#dots0", ${t(TM.mew + 0.8)}, 0.4);
      // ===== L15 KLAYswap：SDK 下载域名 + 38 点
      out("#ev-mew, #src-mew", ${t(LS[15] - 0.1)}, 0.2); pop("#ev-klay", ${t(LS[15] + 0.1)}); pop("#src-klay", ${t(LS[15] + 0.5)});
      pop("#lb-sdk", ${t(w("SDK", 15))}); pop("#lg-r2", ${t(w("190", 15))}); fadeIn("#dots1", ${t(w("190", 15))}, 0.6);
      // ===== L16 Celer cBridge：合约地址子域 + 5 点
      out("#ev-klay, #src-klay, #lb-sdk", ${t(LS[16] - 0.1)}, 0.2); pop("#ev-celer", ${t(LS[16] + 0.1)}); pop("#src-celer", ${t(LS[16] + 0.5)});
      pop("#lb-sub", ${t(w("子域", 16))}); pop("#lg-r3", ${t(LS[16] + 0.8)}); fadeIn("#dots2", ${t(LS[16] + 0.8)}, 0.4);
      // ===== L17 打个比方：镜头到窗户
      out("#ev-celer, #src-celer, #lb-sub, #lg, #cv-in, #cv-atk", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "windowB", 1.3);
      grow("sgw", ${t(LS[17] + 0.3)});
      // ===== L18 隔着窗看车流
      grow("win", ${t(LS[18])}); grow("watch", ${t(LS[18] + 0.4)});
      X17.winFlow(tl, "win", ${t(TM.flow)}, ${t(TM.delay - TM.flow)}, 40);
      // ===== L19 延迟 → 播录像
      X17.winMode(tl, "win", ${t(TM.delay)}, "delayed"); pop("#lb-delay", ${t(TM.delay)});
      X17.winFlow(tl, "win", ${t(TM.delay + 0.1)}, ${t(TM.rec - TM.delay - 0.2)}, 12);
      X17.winMode(tl, "win", ${t(TM.rec)}, "replay"); out("#lb-delay", ${t(TM.rec - 0.1)}, 0.15); pop("#lb-rec", ${t(TM.rec)});
      // ===== L20 换一扇窗：第二扇窗虚影 + 绿勾
      fadeIn("#win2g", ${t(TM.alt)}, 0.5); tl.set("#win2g", { opacity: 0.45 }, ${t(TM.alt + 0.5)}); pop("#lb-alt", ${t(TM.alt + 0.3)});
      // ===== L21 只有一个 RPC：虚影打红叉（段尾静止在 windowB）
      out("#lb-alt", ${t(TM.one)}, 0.2); KIT.broke(tl, "win2", ${t(TM.one + 0.1)}, { badge: false }); pop("#lb-one", ${t(TM.one + 0.3)}); pop("#lb-x2", ${t(TM.one + 0.2)});
`,
});
