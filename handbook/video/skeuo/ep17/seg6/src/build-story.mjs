// ep17/seg6「⑥ 今天做一件事」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.quorumE（BRIEF）。
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7, E9, E16, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const scalePts = (v, sc) => Array.isArray(v) && v.length >= 2 && typeof v[0] === "number" && typeof v[1] === "number" ? sc(v)
  : Array.isArray(v) ? v.map((x) => scalePts(x, sc)) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k2, x]) => [k2, scalePts(x, sc)])) : v;
const wput = (key, o, r, k = o.scale) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k, ...p.slice(2)];
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  A[key] = scalePts(A[key], sc);
};
const sign = (key, o, text) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text }));

// 石板路（最底层）
add(L.SIGNA, `<polyline points="${L.ROAD.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#dcd6ca" stroke-width="150" stroke-linecap="round"/>
  <polyline points="${L.ROAD.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#cfc8ba" stroke-width="4" stroke-dasharray="40 30"/>`, -9000);

// 各区地面亮块（L10 依次亮起）：区内物件地面点的 u/v 包围盒 → 等距四边形
const ZPTS = {
  A: [L.SIGNA, L.BRIDGE, ...L.FAKE, ...L.EXTRPC, L.FORKA, L.DESKA, L.DOTSA],
  B: [L.CHAINB, L.NODEB, L.RPCB, L.IDXB, L.EXCHB, ...L.LAYERS, L.MINORITY, L.WINDOW, L.WATCHER, L.ATKSRV],
  C: [L.SIGNC, L.PEER, L.ADDR, L.VICTIM, L.BACKUP, L.FIREWALL, L.CONS, L.SCAN],
  D: [L.SIGND, ...L.HOSTS, L.ETHCHAIN, L.BUILDER, L.RELAY, L.PROPOSER, L.DOTS100],
  E: [L.SIGNE, ...L.QRPC, L.METERE, L.DESKE, L.KNIFEE, ...L.CLIENTS, L.ROLES, L.PHONE],
};
const ZNAME = { A: "跨链桥头", B: "数据管线街", C: "节点小屋", D: "验证者机房", E: "仲裁台" };
const ZTOP = {};
for (const [z, ps] of Object.entries(ZPTS)) {
  const pad = 140, u0 = Math.min(...ps.map((p) => p.u)) - pad, u1 = Math.max(...ps.map((p) => p.u)) + pad;
  const v0 = Math.min(...ps.map((p) => p.v)) - pad, v1 = Math.max(...ps.map((p) => p.v)) + pad;
  const q = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => Wp(u, v).map((n) => Math.round(n)));
  add(L.SIGNA, S.hid("zp-" + z, `<polygon points="${q.map((p) => p.join(",")).join(" ")}" fill="#2aa3c9" fill-opacity="0.16" stroke="#1d93ba" stroke-width="10" stroke-dasharray="40 24"/>`), -8000);
  const R = L.ZONE_RECTS[z];
  ZTOP[z] = [Math.round((Math.min(...R.map((r) => r[0])) + Math.max(...R.map((r) => r[2]))) / 2), Math.min(...R.map((r) => r[1])) - 40];
}

// A 跨链桥头
sign("sgA", L.SIGNA, "跨链桥 · KelpDAO");
wput("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", booth: "normal" }));
L.FAKE.forEach((o, i) => put("fk" + i, o, O.rpc(o, { id: "fk" + i, state: "attacker" })));
L.EXTRPC.forEach((o, i) => put("ex" + i, o, O.rpc(o, { id: "ex" + i })));
put("fkA", L.FORKA, E16.forkSwitch(L.FORKA, { id: "fkA", scale: 0.8, labels: ["外部 RPC", "被替换的节点"], thrown: true }));
for (const [k2, r] of Object.entries({ p0: L.APIPE.fake0, p1: L.APIPE.fake1 })) put("ap" + k2, r.o, E1.pipe(r.o, { id: "ap" + k2, pts: r.pts }), -1);
put("dk", L.DESKA, O.desk(L.DESKA, { id: "dk", screen: `<rect width="148" height="88" fill="#e9f6ee"/><circle cx="74" cy="34" r="16" fill="#1f9d55"/><path d="M66 34l6 6 11-12" stroke="#fff" stroke-width="4" fill="none"/><rect x="34" y="60" width="80" height="8" rx="4" fill="#9fd3b4"/>` }));
put("atkA", L.ATKA, O.person(L.ATKA, { id: "atkA", role: "attacker", state: "attacker", scale: 0.7 }));
// B 数据管线街
put("chB", L.CHAINB, O.chain(L.CHAINB, { id: "chB", n: 4 }));
put("ndB", L.NODEB, O.rack(L.NODEB, { id: "ndB", tag: "节点客户端" }));
put("rpB", L.RPCB, O.rpc(L.RPCB, { id: "rpB" }));
put("ixB", L.IDXB, O.dbLedger(L.IDXB, { id: "ixB", tag: "索引器" }));
put("xcB", L.EXCHB, E7.dispatchDesk(L.EXCHB, { id: "xcB", scale: 0.8 }));
put("winB", L.WINDOW, X.viewWindow(L.WINDOW, { id: "winB" }));
put("wtB", L.WATCHER, O.person(L.WATCHER, { id: "wtB", role: "signer", scale: 0.6 }));
// C 节点小屋
sign("sgC", L.SIGNC, "P2P 网络");
put("pnC", L.PEER, X.peerPanel(L.PEER, { id: "pnC" }));
put("vcC", L.VICTIM, O.rack(L.VICTIM, { id: "vcC", tag: "受害节点" }));
put("prC", L.PORTRPC, O.rpc(L.PORTRPC, { id: "prC" }));
put("fwC", L.FIREWALL, E1.firewall(L.FIREWALL, { id: "fwC", len: 200 }));
// D 验证者机房
sign("sgD", L.SIGND, "验证者机房");
L.HOSTS.forEach((o, i) => put("hs" + i, o, O.rack(o, { id: "hs" + i, tag: ["主机 A", "备用机 B"][i] })));
put("ecD", L.ETHCHAIN, O.chain(L.ETHCHAIN, { id: "ecD", n: 4 }));
put("bdD", L.BUILDER, E1.sorter(L.BUILDER, { id: "bdD", blockLabel: "区块" }));
put("rlD", L.RELAY, E9.commitBox(L.RELAY, { id: "rlD", scale: 0.8, name: "relay" }));
// E 仲裁台（seg5 段尾状态：三台 RPC + 法定数表 + 入账台）
sign("sgE", L.SIGNE, "多源仲裁");
L.QRPC.forEach((o, i) => put("q" + i, o, O.rpc(o, { id: "q" + i })));
wput("mtE", L.METERE, E5.thresholdMeter(L.METERE, { id: "mtE", max: 3, th: 2, level: 2, thText: "法定数 2" }));
put("cmE", L.CMPE, O.magnifier(L.CMPE, { id: "cmE" }));
put("dsE", L.DESKE, E7.dispatchDesk(L.DESKE, { id: "dsE", scale: 0.8 }));
put("knE", L.KNIFEE, O.knifeSwitch(L.KNIFEE, { id: "knE", text: "入账", on: true }));
L.CLIENTS.forEach((o, i) => wput("cl" + i, o, O.rack(o, { id: "cl" + i, tag: ["客户端 A", "客户端 B"][i] })));
put("rb", L.ROLES, E5.roleBoard(L.ROLES, { id: "rb", title: "今天做一件事", plates: ["交易所/桥", "节点运维", "验证者", "普通用户"],
  holders: ["contract", "bot", "multisig", "person"], delays: ["数据源", "公网端口", "人工确认", "交叉确认"], empty: [0, 1, 2, 3] }));
const SCR1 = `<rect width="76" height="150" fill="#fffdf8"/><text x="38" y="34" text-anchor="middle" font-size="13" font-weight="800" fill="#1c1c1c">余额</text>
  <text x="38" y="60" text-anchor="middle" font-size="18" font-weight="900" fill="#e0453a">0.00 ?</text>
  <rect x="8" y="96" width="60" height="30" rx="8" fill="#1d93ba"/><text x="38" y="116" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">换 RPC</text>`;
put("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen2: SCR1 }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-q0", up(A.q0.top, 8), "自建节点", "lab-cs lab-sm");
lb("lb-q1", up([(A.q1.top[0] + A.q2.top[0]) / 2, Math.min(A.q1.top[1], A.q2.top[1])], 8), "第三方 A × 2", "lab-cs lab-sm");
lb("lb-ph", up(A.ph.top, 6), "钱包", "lab-ink lab-sm");
lb("lb-dk", up(A.dk.top, 8), "监控 · 一切正常 ✓", "lab-gs");
lb("lb-fk", up(A.fk1.top, 8), "被替换的节点", "lab-rs lab-sm");
lb("lb-bth", up(A.br.booth, 30), "验证者实际收到的结果", "lab-gs lab-sm");
for (const z of Object.keys(ZNAME)) lb("lb-z" + z, ZTOP[z], ZNAME[z], "lab-cs");

// ---------------------------------------------------------------- 屏幕层卡片
const RC = { x: 1320, y: 300, w: 530 };
const rc = (id, i, head, body) => `<div class="rc hide" id="${id}" style="left:${RC.x}px;top:${RC.y + i * 6}px;width:${RC.w}px"><div class="rc-h">${head}</div>${body}</div>`;
const ICON_WALL = `<svg width="92" height="64" viewBox="0 0 92 64"><g stroke="#7a3b2a" stroke-width="2"><rect x="2" y="8" width="28" height="16" fill="#c4674a"/><rect x="32" y="8" width="28" height="16" fill="#b85d42"/><rect x="62" y="8" width="28" height="16" fill="#c4674a"/><rect x="2" y="26" width="13" height="16" fill="#b85d42"/><rect x="17" y="26" width="28" height="16" fill="#c4674a"/><rect x="47" y="26" width="28" height="16" fill="#b85d42"/><rect x="77" y="26" width="13" height="16" fill="#c4674a"/><rect x="2" y="44" width="28" height="16" fill="#c4674a"/><rect x="32" y="44" width="28" height="16" fill="#b85d42"/><rect x="62" y="44" width="28" height="16" fill="#c4674a"/></g></svg>`;
const ICON_KEY = `<svg width="92" height="50" viewBox="0 0 92 50"><circle cx="20" cy="25" r="15" fill="#d9a632" stroke="#8a6414" stroke-width="3"/><circle cx="20" cy="25" r="5" fill="#fffdf8"/><path d="M35 21h46v8h-6v8h-7v-8h-8v6h-7v-6H35z" fill="#d9a632" stroke="#8a6414" stroke-width="2"/></svg>`;
const html = [
  rc("rc1", 0, "交易所和跨链桥", `<div class="rc-b">列出资金决策读取的数据源</div>
    <div class="rc-l" id="rc1-l0">自建节点<span class="rc-t" data-layout-ignore>运营方 1</span></div>
    <div class="rc-grp" id="rc1-g"><div class="rc-l">第三方 A · 节点 1<span class="rc-t" data-layout-ignore>运营方 A</span></div><div class="rc-l">第三方 A · 节点 2<span class="rc-t" data-layout-ignore>运营方 A</span></div></div>
    <div class="rc-r hide" id="rc1-res">去掉重复运营方 → 剩 <b>2</b> 个</div>`),
  rc("rc2", 1, "节点运维", `<div class="rc-row">${ICON_WALL}<div class="rc-b">RPC 与 Engine API<br><b>不暴露在公网</b></div></div>`),
  rc("rc3", 2, "验证者团队", `<div class="rc-b">故障切换改成 <b>人工确认</b></div>
    <div class="rc-st"><span class="rc-s1">原实例停止 ✓</span><span class="rc-ar">→</span><span class="rc-s2">再启动备用</span></div>
    <div class="rc-row">${ICON_KEY}<div class="rc-sm">同一把密钥只在一处签名</div></div>`),
  rc("rc4", 3, "普通用户", `<div class="rc-b">余额显示异常时</div><div class="rc-b">换一个 <b>RPC</b> 或 <b>区块浏览器</b></div><div class="rc-b">交叉确认</div>`),
  ck("ck5", "只添加官方文档列出的 RPC", { x: 1270, y: 700, w: 580, kind: "g" }),
  `<div class="qc hide" id="qc"><div class="qc-s">开头的问题</div><div class="qc-m">监控能发现这次攻击吗？</div><div class="qc-a hide" id="qc-a">不能</div></div>`,
  `<div class="xm hide" id="xm">✕</div>`,
  `<div class="ins hide" id="ins"><div class="ins-h">不同运营方的数据源</div>
    ${["自建节点", "运营方 B", "运营方 C"].map((n, i) => `<div class="ins-r" id="ins-r${i}"><span class="ins-n">${n}</span><span class="ins-ok hide" id="ins-ok${i}">✓</span></div>`).join("")}
    <div class="ins-c hide" id="ins-c">比对一致 ✓</div></div>`,
  kw("kw9", `成立条件：来源 <b>真正独立</b>`, { x: 1300, y: 330, size: 40, accent: "#1f9d55" }),
  kw("kw10", `先问几家 <b>独立</b> 的节点，再签名，再入账${gtag("解读")}`, { x: 330, y: 120, size: 38 }),
].join("\n");
const css = `
  .rc { position: absolute; background: #fffdf8; border-radius: 16px; border-left: 8px solid #1d93ba; padding: 16px 24px 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
  .rc-h { font-size: 38px; font-weight: 900; color: #1d93ba; margin-bottom: 8px; }
  .rc-b { font-size: 30px; font-weight: 800; line-height: 1.35; }
  .rc-b b, .rc-r b { color: #1d93ba; }
  .rc-l { font-size: 28px; font-weight: 700; display: flex; justify-content: space-between; padding: 8px 12px; margin-top: 6px; background: #f3efe7; border-radius: 8px; }
  .rc-t { font-size: 26px; color: #fff; background: #2aa3c9; border-radius: 6px; padding: 0 10px; }
  .rc-grp { margin-top: 6px; padding: 2px 6px 8px; border-radius: 12px; border: 4px dashed transparent; }
  .rc-grp.on { border-color: #e0453a; }
  .rc-r { margin-top: 12px; font-size: 30px; font-weight: 900; }
  .rc-row { display: flex; align-items: center; gap: 18px; margin-top: 8px; }
  .rc-st { display: flex; align-items: center; gap: 12px; margin: 12px 0 4px; font-size: 28px; font-weight: 800; }
  .rc-s1 { background: #e9f6ee; color: #1f9d55; border-radius: 8px; padding: 4px 10px; }
  .rc-s2 { background: #e6f4f9; color: #1d93ba; border-radius: 8px; padding: 4px 10px; }
  .rc-ar { color: #6d685e; }
  .rc-sm { font-size: 28px; font-weight: 700; color: #4a463f; }
  .qc { position: absolute; left: 1430px; top: 290px; width: 410px; background: #fffdf8; border-radius: 16px; padding: 16px 24px 18px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); border-left: 8px solid #1c1c1c; }
  .qc-s { font-size: 28px; font-weight: 700; color: #6d685e; }
  .qc-m { font-size: 32px; font-weight: 900; margin-top: 4px; }
  .qc-a { display: inline-block; margin-top: 10px; font-size: 34px; font-weight: 900; color: #fff; background: #e0453a; border-radius: 10px; padding: 2px 18px 4px; }
  .xm { position: absolute; width: 56px; height: 56px; border-radius: 50%; background: #8a8478; color: #fff; font-size: 36px; font-weight: 900; line-height: 56px; text-align: center; }
  .ins { position: absolute; left: 1430px; top: 520px; width: 410px; background: #fffdf8; border-radius: 16px; padding: 14px 22px 18px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); border-left: 8px solid #1f9d55; }
  .ins-h { font-size: 28px; font-weight: 900; color: #1f9d55; margin-bottom: 6px; }
  .ins-r { display: flex; align-items: center; gap: 12px; padding: 6px 12px; margin-top: 6px; background: #f3efe7; border-radius: 8px; font-size: 28px; font-weight: 800; }
  .ins-n::before { content: ""; display: inline-block; width: 18px; height: 24px; margin-right: 10px; vertical-align: -3px; background: #4a5058; border-radius: 3px; box-shadow: inset 0 -6px 0 #2aa3c9; }
  .ins-ok { margin-left: auto; width: 34px; height: 34px; border-radius: 50%; background: #1f9d55; color: #fff; text-align: center; line-height: 34px; font-size: 28px; }
  .ins-c { margin-top: 10px; font-size: 28px; font-weight: 900; color: #fff; background: #1f9d55; border-radius: 10px; padding: 4px 14px; display: inline-block; }`;

// 曲线：监控 → 被替换的节点（青蓝）；岗亭 → 右侧小框（绿）
const DK = S.scr("monitorA", A.dk.screen ?? A.dk.top), FK = S.scr("monitorA", A.fk0.top), BTH = S.scr("monitorA", A.br.booth);
S.curve("cvM", DK, FK, { color: "#2aa3c9", c1: [DK[0] - 60, DK[1] - 120], c2: [FK[0] + 120, FK[1] + 20] });
const XM = [Math.round((DK[0] + FK[0]) / 2 + 20), Math.round((DK[1] + FK[1]) / 2 - 50)];
const INS = [1424, 690];
S.curve("cvG", BTH, INS, { color: "#1f9d55", c1: [BTH[0] + 250, 890], c2: [INS[0] - 380, 880] });
const html2 = html.replace(`id="xm">`, `id="xm" style="left:${XM[0] - 28}px;top:${XM[1] - 28}px">`);
console.log("screen pts", { DK, FK, BTH, XM });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dup: w("去掉重复", 1), left: w("剩下几个", 1), rpc2: w("RPC", 2), pub: w("公网", 2),
  man: w("人工确认", 3), stop: w("原实例停止", 3), bak: w("才启动备用", 3), user: w("普通用户", 4), swap: w("换一个", 4),
  off: w("官方文档", 5), mon: w("监控", 7), real: w("真实数据", 7), cant: w("无法发现", 7),
  got: w("实际收到的结果", 8), diff: w("不同运营方", 8), cmp: w("比对", 8), ind: w("真正独立", 9),
};
const t = (x) => f(x);

S.build({
  cam0: "quorumE", sub: "按角色，各做一件事",
  grid: { u0: -4500, u1: 19100, v0: -11700, v1: 12400 }, box: [-1700, -6400, 15700, 8900],   // 盖住 quorumE / rolesE / monitorA / wide
  shown: ["#lb-q0", "#lb-q1"], css, html: html2,
  terms: [
    { id: "t0", t: "区块浏览器", d: "用网页查询链上交易和余额的服务", at: w("区块浏览器", 4) },
  ],
  end: { title: "节点、RPC 与验证者基础设施", line: "先问几家独立的节点，再签名，再入账", next: "钱包与密钥管理的安全", at: LS[11], nextAt: w("下一集", 11) },
  js: `
      // 外部 RPC 在 seg1 已被打掉（世界状态延续）
      ["ex0", "ex1"].forEach((id) => KIT.broke(tl, id, 0.05, { badge: false, ghost: 0.35 }));
      // ===== L0 按角色，各做一件事：镜头推到角色板，四张卡挂上
      out("#lb-q0, #lb-q1", ${t(LS[0] - 0.2)}); cam(${t(LS[0])}, "rolesE", 1.4);
      [0, 1, 2, 3].forEach((i) => X5.hang(tl, "rb", i, ${t(LS[0] + 1.0)} + i * 0.25, true)); pop("#lb-ph", ${t(LS[0] + 1.6)});
      // ===== L1 交易所和跨链桥：数据源清单，两行同一运营方被圈起，剩 2 个
      flash("#rb-card-0", ${t(LS[1])}, 2); pop("#rc1", ${t(LS[1] + 0.3)});
      tl.to("#rc1-g", { borderColor: "#e0453a", duration: 0.3 }, ${t(TM.dup)}); pop("#rc1-res", ${t(TM.dup + 0.5)});
      // ===== L2 节点运维：RPC / Engine API 不上公网
      out("#rc1", ${t(LS[2] - 0.2)}); flash("#rb-card-1", ${t(LS[2])}, 2); pop("#rc2", ${t(LS[2] + 0.2)}); flash("#rc2 svg", ${t(TM.pub)}, 2);
      // ===== L3 验证者团队：人工确认，原实例停止后才启动备用
      out("#rc2", ${t(LS[3] - 0.2)}); flash("#rb-card-2", ${t(LS[3])}, 2); pop("#rc3", ${t(LS[3] + 0.2)});
      // ===== L4 普通用户：换一个 RPC 交叉确认，手机屏幕切换
      out("#rc3", ${t(LS[4] - 0.2)}); flash("#rb-card-3", ${t(LS[4])}, 2); pop("#rc4", ${t(LS[4] + 0.2)});
      out("#ph-scr", ${t(TM.swap)}); fadeIn("#ph-scr2", ${t(TM.swap)}, 0.3);
      // ===== L5 自定义 RPC 只添加官方文档列出的地址
      pop("#ck5", ${t(LS[5] + 0.2)});
      // ===== L6 回到开头的问题：镜头回 A 监控工位，题卡
      out("#rc4, #ck5, #lb-ph", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "monitorA", 1.4);
      pop("#qc", ${t(LS[6] + 0.9)}); pop("#lb-dk", ${t(LS[6] + 1.2)}); pop("#lb-fk", ${t(LS[6] + 1.3)});
      // ===== L7 监控查同一个节点，看到真实数据：青蓝虚线打灰叉，答案"不能"（关键画面）
      draw("cvM", ${t(TM.mon)}); pop("#xm", ${t(TM.real + 0.4)}); pop("#qc-a", ${t(TM.cant)});
      // ===== L8 拿验证者实际收到的结果和不同运营方比对：绿虚线 → 右侧小框，逐行绿勾（关键画面）
      pop("#lb-bth", ${t(TM.got)}); draw("cvG", ${t(TM.got + 0.4)}, 1.2); pop("#ins", ${t(TM.got + 0.6)});
      [0, 1, 2].forEach((i) => pop("#ins-ok" + i, ${t(TM.diff)} + i * 0.2, 0.2)); pop("#ins-c", ${t(TM.cmp)});
      // ===== L9 成立条件：来源真正独立
      out("#qc", ${t(LS[9] - 0.1)}); pop("#kw9", ${t(TM.ind)});
      // ===== L10 拉到读链大街全景，A → E 依次亮起
      out("#cvG, #cvM, #xm, #lb-bth, #lb-dk, #lb-fk", ${t(LS[10] - 0.2)}); out("#kw9, #ins", ${t(LS[10] + 0.5)}); cam(${t(LS[10])}, "wide", 2.0);
      pop("#kw10", ${t(LS[10] + 0.6)});
      ["A", "B", "C", "D", "E"].forEach((z, i) => { fadeIn("#zp-" + z, ${t(LS[10] + 2.0)} + i * 0.5, 0.4); pop("#lb-z" + z, ${t(LS[10] + 2.0)} + i * 0.5, 0.25); });
      // ===== L11 结束卡（静止于 CAMS.wide）
      out("#kw10, #lb-zA, #lb-zB, #lb-zC, #lb-zD, #lb-zE", ${t(LS[11] - 0.2)});
`,
});
