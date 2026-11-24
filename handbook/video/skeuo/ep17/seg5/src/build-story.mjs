// ep17/seg5「⑤ 多源不降级」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.relayD（BRIEF）。
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
// ends static on CAMS.quorumE

// 段内镜头 quorumEc：E 仲裁台核心（三台 RPC + 比对 + 法定数 + 入账台 + 闸刀），右侧留给代码卡 A（L3–L11）
const R = L.RECTS;
const CAMS = { ...L.CAMS, quorumEc: L.fit([R.q0, R.q1, R.q2, R.cmpE, R.meterE, R.deskE, R.knifeE], [90, 300, 1220, 830], 1.4) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [X, E1, E5, E7, E9, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点缩放，anchors 一并换算（常见坑 1）
const isPt = (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number";
function putK(key, o, r, k, dy = 0) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const [n, v] of Object.entries(A[key])) {
    if (isPt(v)) A[key][n] = sc(v);
    else if (Array.isArray(v) && v.length && isPt(v[0])) A[key][n] = v.map(sc);
  }
}
const eP = (X0, Y0) => [11400 + X0, -3995 + Y0];          // E 区局部 → 世界画布 px
const BACK = -100000, FRONT = 100000;

// ---------------------------------------------------------------- 世界物件
// 石板路（原生 SVG，最底层）
{ const [p0, p1] = L.ROAD, o = [-172, -123];
  add(L.SIGNA, `<polygon points="${p0} ${p1} ${p1[0] + o[0]},${p1[1] + o[1]} ${p0[0] + o[0]},${p0[1] + o[1]}" fill="#e6e1d7" stroke="#d6cfc2" stroke-width="3"/>`, 2 * BACK); }
// D（开场，上段段尾）
put("signD", L.SIGND, E1.signBoard(L.SIGND, { id: "signD", text: "验证者机房", style: "plate" }));
put("bld", L.BUILDER, E1.sorter(L.BUILDER, { id: "bld", blockLabel: "区块" }));
put("rly", L.RELAY, E9.commitBox(L.RELAY, { id: "rly", name: "relay", scale: 0.8 }));
put("hdr", L.HEADER, O.doc(L.HEADER, { id: "hdr", standing: true, title: "区块头", w: 140, h: 200 }));
put("prp", L.PROPOSER, O.person(L.PROPOSER, { id: "prp", role: "signer", scale: 0.6 }));
L.BUNDLES.forEach((o, i) => put("bdl" + i, o, E1.letter(o, { id: "bdl" + i, z: 0 })));
{ const [gx, gy] = at(L.DOTS100), d = [];
  for (let i = 0; i < 100; i++) d.push(`<circle cx="${gx + (i % 10) * 20 + 10}" cy="${gy + Math.floor(i / 10) * 20 + 10}" r="6.5" fill="${i < 50 ? "#1d93ba" : i < 74 ? "#7cc6de" : "#cfc8bb"}"/>`);
  add(L.DOTS100, `<g>${d.join("")}</g>`, -40); }
// C 路标（回摇 / 推镜时路过）
put("signC", L.SIGNC, E1.signBoard(L.SIGNC, { id: "signC", text: "P2P 网络", style: "plate" }));
// A 跨链桥头
put("signA", L.SIGNA, E1.signBoard(L.SIGNA, { id: "signA", text: "跨链桥 · KelpDAO", style: "plate" }));
putK("brg", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "brg", booth: "normal" }), 0.6);
L.FAKE.forEach((o, i) => put("fk" + i, o, O.rpc(o, { id: "fk" + i, state: "attacker" })));
L.EXTRPC.forEach((o, i) => put("ex" + i, o, O.rpc(o, { id: "ex" + i })));
put("forkA", L.FORKA, E16.forkSwitch(L.FORKA, { id: "forkA", labels: ["外部 RPC", "被替换的节点"], scale: 0.8 }));
put("atkA", L.ATKA, O.person(L.ATKA, { id: "atkA", role: "attacker", scale: 0.7 }));
{ const pv = L.APIPE.fake0, pe = L.APIPE.ext;
  put("pVd", pv.o, E1.pipe(pv.o, { id: "pVd", pts: pv.pts, flowColor: "#e0453a" }), 5);
  put("pIp", L.FAKE[1], E1.pipe(L.FAKE[1], { id: "pIp", pts: [[0, 50, 40], [0, 280, 40]] }), 5);
  put("pExt", pe.o, E1.pipe(pe.o, { id: "pExt", pts: pe.pts, flow: true }), 5); }
// E 仲裁台
put("signE", L.SIGNE, E1.signBoard(L.SIGNE, { id: "signE", text: "多源仲裁", style: "plate" }));
L.QRPC.forEach((o, i) => put("q" + i, o, O.rpc(o, { id: "q" + i })));
put("cmp", L.CMPE, O.magnifier(L.CMPE, { id: "cmp" }));
putK("meter", L.METERE, E5.thresholdMeter(L.METERE, { id: "meter", max: 3, th: 2, level: 2, thText: "2" }), 0.8);
put("deskE", L.DESKE, E7.dispatchDesk(L.DESKE, { id: "deskE", scale: 0.8, entries: ["+ 入账", "+ 跨链放行", "暂停 · 人工确认"], shown: 2 }));
put("knife", L.KNIFEE, O.knifeSwitch(L.KNIFEE, { id: "knife", text: "入账" }));
L.CLIENTS.forEach((o, i) => putK("cl" + i, o, O.rack(o, { id: "cl" + i, tag: "客户端 " + "AB"[i] }), 0.75));
L.QRPC.forEach((o, i) => put("lt" + i, o, E1.letter(o, { id: "lt" + i, z: 135, ...(i === 2 ? { state: "attacker" } : {}) }), 3, { wrap: (svg) => S.hid("ltg" + i, svg) }));
// 数据流（地面虚线）：三台 RPC → 比对 → 入账台（L5）
{ const gP = at(L.CMPE), gD = at(L.DESKE);
  const d = L.QRPC.map((o) => { const [x, y] = at(o); return `<path d="M${x},${y} L${gP[0]},${gP[1]}"/>`; }).join("") + `<path d="M${gP[0]},${gP[1]} L${gD[0]},${gD[1]}"/>`;
  add(L.SIGNE, S.hid("dlines", `<g fill="none" stroke="#2aa3c9" stroke-width="7" stroke-dasharray="16 10" stroke-linecap="round">${d}</g>`), BACK); }
// 同一上游（L16）：三台 RPC 背后汇成一根红管
const UM = eP(-700, 200), UU = eP(-1000, 330);
{ const d = L.QRPC.map((o) => { const [x, y] = at(o); return `<path d="M${x},${y} L${UM[0]},${UM[1]}" stroke-width="9"/>`; }).join("") + `<path d="M${UM[0]},${UM[1]} L${UU[0]},${UU[1]}" stroke-width="18"/>`;
  add(L.SIGNE, S.hid("upl", `<g fill="none" stroke="#e0453a" stroke-linecap="round" opacity="0.9">${d}</g>`), BACK); }
// 同一家服务商的两个节点：同色虚线框（L6）
const [gx1, gy1] = at(L.QRPC[1]), [gx2, gy2] = at(L.QRPC[2]);
add(L.QRPC[2], S.hid("grp", `<rect x="${gx1 - 100}" y="${gy1 - 300}" width="${gx2 - gx1 + 200}" height="${gy2 - gy1 + 350}" rx="24" fill="rgba(42,163,201,0.07)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9"/>`), FRONT);
// 法定数被下调的虚影刻线 + 红叉（L8）
{ const [lx, ly] = A.meter.levels[1];
  add(L.METERE, S.hid("ghost", `<g stroke="#e0453a" stroke-width="3.5" stroke-linecap="round"><line x1="${lx - 64}" y1="${ly}" x2="${lx + 6}" y2="${ly}" stroke-dasharray="7 5"/><line x1="${lx + 14}" y1="${ly - 10}" x2="${lx + 34}" y2="${ly + 10}"/><line x1="${lx + 34}" y1="${ly - 10}" x2="${lx + 14}" y2="${ly + 10}"/></g>`), FRONT); }
// 两种客户端互相比对（L14）：双向虚线
{ const [ax, ay] = A.cl0.center, [bx, by] = A.cl1.center, x0 = ax + 70, x1 = bx - 70, y0 = ay + 8, y1 = by - 8;
  add(L.CLIENTS[1], S.hid("cmpl", `<g stroke="#1d93ba" stroke-width="5" fill="#1d93ba"><line x1="${x0 + 12}" y1="${y0}" x2="${x1 - 12}" y2="${y1}" stroke-dasharray="9 6"/><polygon points="${x0},${y0} ${x0 + 18},${y0 - 9} ${x0 + 16},${y0 + 11}" stroke="none"/><polygon points="${x1},${y1} ${x1 - 18},${y1 + 9} ${x1 - 16},${y1 - 11}" stroke="none"/></g>`), FRONT); }

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// A
lb("lb-fk", up(A.fk1.top, 6), "被替换的节点", "lab-rs lab-sm");
lb("lb-vd", up(A.pVd.mid, 24), "给验证者", "lab-rs lab-sm");
lb("lb-ip", [A.pIp.mid[0] + 26, A.pIp.mid[1]], "给别的 IP", "lab-cs lab-sm", "l");
lb("lb-ok", [A.pIp.end[0], A.pIp.end[1] + 18], "监控 · 一切正常 ✓", "lab-gs lab-sm", "t");
lb("lb-ex", up(A.ex1.top, 6), "外部 RPC 被打掉", "lab-rs lab-sm");
lb("lb-fork", [A.forkA.center[0] - 40, A.forkA.center[1]], "自动切换", "lab-r lab-sm", "r");
// E
["自建节点", "第三方 A", "第三方 B"].forEach((s, i) => { const [x, y] = A["q" + i].ground; lb("lb-q" + i, [x, y + 16], s, "lab-cs lab-sm", "t"); });
lb("lb-q2b", [A.q2.ground[0] + 34, A.q2.ground[1] + 16], "第三方 A<br>第二个节点", "lab-cs lab-sm", "t");
lb("lb-one", [(gx1 + gx2) / 2, gy1 - 306], "只算一个", "lab-ink lab-sm");
lb("lb-cmp", up(A.cmp.top, 4), "比对", "lab-cs lab-sm");
lb("lb-neq", A.cmp.lens, "≠", "lab-rs", "c");
lb("lb-meter", up(A.meter.top, 10), "法定数 ≥ 2", "lab-cs lab-sm");
lb("lb-to", up(A.q1.top, 4), "超时", "lab-rs lab-sm");
{ const [x, y] = A.deskE.ground;
  lb("lb-desk", [x, y + 16], "入账台", "lab-cs lab-sm", "t");
  lb("lb-pause", [x + 2, y + 18], "暂停 · 人工确认", "lab-rs lab-sm", "t");
  lb("lb-pause2", [x + 4, y + 20], "冲突 · 暂停入账", "lab-rs lab-sm", "t"); }
[0, 1, 2].forEach((i) => { lb("lb-h" + i, up(A["q" + i].top, 4), "#N", "lab-cs lab-sm"); lb("lb-hk" + i, up(A["q" + i].top, 6), "#N ✓", "lab-gs lab-sm"); });
[0, 1].forEach((i) => { const [x, y] = A["cl" + i].ground; lb("lb-cl" + i, [x, y + 14], "客户端 " + "AB"[i], "lab-cs lab-sm", "t"); });
lb("lb-cmpl", [A.cl0.center[0] - 95, A.cl0.center[1]], "互相比对 ⇄", "lab-cs lab-sm", "r");
lb("lb-fork2", [A.cl1.center[0] + 95, A.cl1.center[1]], "硬分叉前升级", "lab-ink lab-sm", "l");
lb("lb-up", [UM[0] - 16, UM[1]], "同一上游", "lab-rs lab-sm", "r");
lb("lb-nouse", eP(-860, 300), `数量再多也没用${gtag("解读")}`, "lab-r lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1250, y: 300, w: 610 };
const card = codeCard("ca", { ...CA, head: "读链的取法", tag: "示意", mono: true, rowHide: true, rows: [
  `src = [自建, 三方A, 三方B] <i>// 按运营方去重</i>`,
  `if (responded &lt; k) pause() <i>// 超时不降级</i>`,
  `if (!allEqual(results)) pause() <i>// 冲突就暂停</i>`,
  `credit(tx)`,
] });
const cvS = (i) => [CA.x - 6, codeRowY(CA.y, i)];
S.curve("cv0", cvS(0), S.scr("quorumEc", A.q2.top), { color: "#e0453a" });
S.curve("cv1", cvS(1), S.scr("quorumEc", A.meter.top), { color: "#e0453a" });
S.curve("cv2", cvS(2), S.scr("quorumEc", A.knife.top), { color: "#e0453a" });
const NT = ["多源校验", "不降级", "冲突暂停", "链头比对"];
const ntags = NT.map((s, i) => `<div class="ntag hide" id="nt${i}" style="left:${640 + i * 196}px"><b>${i + 1}</b>${s}</div>`).join("");
const pp = X.peerPanel({ u: 0, v: 0 }, { id: "ipp" });
const inset = `<div class="inset hide" id="inset"><svg viewBox="-100 -180 200 230" width="226" height="260">${pp.svg}</svg><div class="cap">对等连接<br>来自不同网络</div></div>`;
const cks = [["被替换的节点", 640], ["被日蚀的节点", 720], ["错误分叉上的节点", 800]].map(([s, y], i) => ck("ck" + i, s, { x: 1440, y, w: 400 })).join("");
const html = card + ntags + inset + cks
  + kw("kw-ops", "比对不同<b>运营方</b>", { accent: "#1d93ba" })
  + kw("kw-deg", "这就是<b>降级</b>", { x: 60, y: 126, accent: "#e0453a" });
const css = `
  .ntag { position:absolute; top:112px; height:46px; box-sizing:border-box; padding:4px 18px 0 10px; background:#fff; border:2px solid #1d93ba; border-radius:12px;
    font:600 26px "Noto Sans SC", sans-serif; color:#1c1c1c; white-space:nowrap; box-shadow:0 6px 14px rgba(70,60,40,.12); }
  .ntag b { display:inline-block; width:28px; height:28px; margin-right:10px; border-radius:50%; background:#1d93ba; color:#fff; font-size:20px; line-height:28px; text-align:center; vertical-align:2px; }
  .inset { position:absolute; left:1600px; top:290px; width:250px; box-sizing:border-box; padding:10px 12px 14px; background:#fbf9f5; border:3px solid #1d93ba; border-radius:16px;
    box-shadow:0 10px 24px rgba(70,60,40,.16); text-align:center; font:600 22px "Noto Sans SC", sans-serif; color:#1c1c1c; }
  .inset .cap { margin-top:4px; line-height:1.3; }
  .k-code .c-row i { font-style:normal; color:#8a8478; }
  #ca .c-row { font-size:23px; white-space:nowrap; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  ops: w("比对", 3), two: w("两个独立", 5), same: w("同一家", 6), one: w("只算一个", 6), to: w("超时", 8), q: w("法定数", 8),
  pause: w("暂停", 9), hit: w("打掉", 10), sw: w("切到", 10), deg: w("降级", 10), conf: w("冲突", 11), pause2: w("暂停", 11),
  peer: w("对等连接", 13), cli: w("客户端", 14), mut: w("互相比对", 14), hf: w("硬分叉", 14),
  c0: w("被替换", 15), c1: w("被日蚀", 15), c2: w("错误分叉", 15), up: w("同一个上游", 16), nouse: w("没用", 16),
};
const t = (x) => f(x);

S.build({
  cam0: "relayD", sub: "按运营方数来源，超时不降级",
  grid: { u0: -2200, u1: 17300, v0: -9600, v1: 9000 }, box: [-1500, -5200, 15000, 5800],   // 盖住 relayD / bridgeA / failA / quorumE / E
  shown: [], css, html,
  terms: [
    { id: "t0", t: "法定数", d: "至少要几个来源结果一致才算数", at: w("法定数", 8) },
    { id: "t1", t: "客户端多样性", d: "不同节点选用不同团队写的客户端", at: w("客户端", 14) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 回到开头的节点：D → A 回摇
      cam(${t(LS[0])}, "bridgeA", 1.5, "power2.inOut"); pop("#lb-fk", ${t(LS[0] + 1.3)});
      // ===== L1 按来源区别对待：红管给验证者、青蓝管给别的 IP
      fadeIn("#pVd-flow, #pIp-flow", ${t(LS[1] + 0.1)}, 0.3); X1.dash(tl, ["pVd-flow", "pIp-flow"], ${t(LS[1] + 0.1)}, 5.6, -140);
      pop("#lb-vd", ${t(LS[1] + 0.4)}); pop("#lb-ip", ${t(LS[1] + 0.8)});
      // ===== L2 别的 IP 查到真数据
      out("#lb-ip", ${t(LS[2] + 0.2)}); pop("#lb-ok", ${t(LS[2] + 0.4)});
      // ===== L3 推到 E：三台不同运营方的 RPC
      out("#lb-fk, #lb-vd, #lb-ip, #lb-ok", ${t(LS[3] - 0.2)}); cam(${t(LS[3] + 0.1)}, "quorumEc", 2.0, "power2.inOut");
      [0, 1, 2].forEach((i) => pop("#lb-q" + i, ${t(LS[3] + 2.0)} + i * 0.15));
      pop("#kw-ops", ${t(TM.ops - 0.2)}); out("#kw-ops", ${t(LS[4] - 0.3)});
      // ===== L4 第一条：多源校验
      pop("#nt0", ${t(LS[4] + 0.2)});
      // ===== L5 至少两个独立来源：管子汇到比对再到入账台；代码卡第 1 行
      fadeIn("#dlines", ${t(LS[5] + 0.3)}, 0.5); pop("#lb-cmp", ${t(LS[5] + 0.7)}); pop("#lb-desk", ${t(LS[5] + 1.0)});
      pop("#ca", ${t(TM.two - 0.4)}); pop("#ca-r0", ${t(TM.two)}); draw("cv0", ${t(TM.two + 0.3)});
      // ===== L6 按运营方算：第三方 B 其实是第三方 A 的第二个节点
      out("#lb-q2", ${t(TM.same)}); pop("#lb-q2b", ${t(TM.same + 0.1)}); fadeIn("#grp", ${t(TM.same + 0.3)}, 0.4);
      pop("#lb-one", ${t(TM.one)}); hot("#ca-r0", ${t(TM.one)}, "rgba(224,69,58,0.14)");
      // ===== L7 第二条：不降级
      pop("#nt1", ${t(LS[7] + 0.2)});
      // ===== L8 一台超时，法定数刻线不动（下移的虚影被划掉）；代码卡第 2 行
      pop("#lb-meter", ${t(LS[8] + 0.1)}); KIT.broke(tl, "q1", ${t(TM.to)}, { badge: false, ghost: 0.35 }); pop("#lb-to", ${t(TM.to + 0.1)});
      X5.fill(tl, "meter", ${t(TM.to + 0.4)}, 1, 0.6); fadeIn("#ghost", ${t(TM.q + 0.3)}, 0.3);
      pop("#ca-r1", ${t(TM.q + 0.2)}); draw("cv1", ${t(TM.q + 0.5)});
      // ===== L9 达不到就暂停：闸刀拉下，登记簿写暂停
      KIT.toggle(tl, "knife", ${t(TM.pause - 0.3)}, false); X7.entry(tl, "deskE", ${t(TM.pause)}, 2);
      out("#lb-desk", ${t(TM.pause)}); pop("#lb-pause", ${t(TM.pause + 0.1)});
      // ===== L10 插回 A：外部 RPC 被打掉 + 扳道器扳过去 = 降级
      out("#ca, #cv0, #cv1, #lb-to", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "failA", 1.6, "power2.inOut");
      KIT.broke(tl, "ex0", ${t(TM.hit)}); KIT.broke(tl, "ex1", ${t(TM.hit + 0.15)}); out("#pExt-flow", ${t(TM.hit)}); pop("#lb-ex", ${t(TM.hit + 0.3)});
      X16.flip(tl, "forkA", ${t(TM.sw)}); pop("#lb-fork", ${t(TM.sw + 0.5)});
      pop("#kw-deg", ${t(TM.deg - 0.4)}); out("#kw-deg", ${t(LS[11] + 0.25)});
      // E 区在镜头外复位，准备 L11
      KIT.fixed(tl, "q1", ${t(TM.hit)}); out("#ghost, #lb-pause", ${t(TM.hit)}); X5.fill(tl, "meter", ${t(TM.hit)}, 2, 0.3);
      KIT.toggle(tl, "knife", ${t(TM.hit + 0.2)}, true); pop("#lb-desk", ${t(TM.hit + 0.3)});
      // ===== L11 第三条：结果冲突就暂停入账；代码卡第 3 行，第 4 行变绿
      cam(${t(LS[11] + 0.1)}, "quorumEc", 1.5, "power2.inOut"); out("#lb-ex, #lb-fork", ${t(LS[11] + 0.4)});
      fadeIn("#ca, #cv0, #cv1", ${t(LS[11] + 1.6)}, 0.3); pop("#nt2", ${t(TM.conf)});
      [0, 1, 2].forEach((i) => fadeIn("#ltg" + i, ${t(TM.conf)} + i * 0.1, 0.2));
      X1.walk(tl, "lt0", ${t(TM.conf + 0.3)}, 0.8, [[${A.cmp.lens[0] - 70}, ${A.cmp.lens[1] + 70}]]);
      X1.walk(tl, "lt1", ${t(TM.conf + 0.4)}, 0.8, [[${A.cmp.lens[0]}, ${A.cmp.lens[1] + 90}]]);
      X1.walk(tl, "lt2", ${t(TM.conf + 0.5)}, 0.8, [[${A.cmp.lens[0] + 70}, ${A.cmp.lens[1] + 110}]]);
      pop("#lb-neq", ${t(TM.conf + 1.3)}); KIT.toggle(tl, "knife", ${t(TM.conf + 1.4)}, false);
      out("#lb-desk", ${t(TM.conf + 1.5)}); pop("#lb-pause2", ${t(TM.conf + 1.6)});
      pop("#ca-r2", ${t(TM.pause2 + 0.2)}); draw("cv2", ${t(TM.pause2 + 0.5)});
      pop("#ca-r3", ${t(LS[12] - 1.0)}); hot("#ca-r3", ${t(LS[12] - 0.8)}, "rgba(31,157,85,0.18)");
      // ===== L12 第四条：节点本身也要比对
      out("#ca, #cv0, #cv1, #cv2", ${t(LS[12] - 0.2)}); out("#ltg0, #ltg1, #ltg2, #lb-neq, #grp, #lb-one, #lb-pause2", ${t(LS[12])});
      cam(${t(LS[12] + 0.1)}, "quorumE", 1.4, "power2.inOut"); pop("#nt3", ${t(LS[12] + 0.3)});
      // ===== L13 链头两两比对；右侧小框：对等连接来自不同网络
      [0, 1, 2].forEach((i) => pop("#lb-h" + i, ${t(LS[13] + 0.3)} + i * 0.15));
      out("#lb-h0, #lb-h1, #lb-h2", ${t(LS[13] + 2.4)}); [0, 1, 2].forEach((i) => pop("#lb-hk" + i, ${t(LS[13] + 2.5)} + i * 0.2));
      pop("#inset", ${t(TM.peer - 0.3)}); X17.peerAnchor(tl, "ipp", ${t(TM.peer + 0.6)}, true);
      // ===== L14 两种客户端互相比对；硬分叉前升级
      out("#inset", ${t(LS[14] - 0.1)});
      pop("#lb-cl0", ${t(TM.cli)}); pop("#lb-cl1", ${t(TM.cli + 0.15)});
      fadeIn("#cmpl", ${t(TM.mut)}, 0.4); pop("#lb-cmpl", ${t(TM.mut + 0.2)}); pop("#lb-fork2", ${t(TM.hf)});
      // ===== L15 三种情况都有效
      pop("#ck0", ${t(TM.c0)}); pop("#ck1", ${t(TM.c1)}); pop("#ck2", ${t(TM.c2)});
      // ===== L16 局限：所有来源接同一上游
      out("#lb-cmpl", ${t(TM.up - 0.6)}); fadeIn("#upl", ${t(TM.up - 0.4)}, 0.6); pop("#lb-up", ${t(TM.up + 0.2)});
      tl.to("#ck0, #ck1, #ck2, #lb-hk0, #lb-hk1, #lb-hk2", { filter: "grayscale(1)", opacity: 0.45, duration: 0.4 }, ${t(TM.up + 0.6)});
      pop("#lb-nouse", ${t(TM.nouse - 0.4)});
`,
});
