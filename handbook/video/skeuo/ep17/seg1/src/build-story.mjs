// ep17/seg1「① 只对你说谎」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.bridgeA（BRIEF）。ends static on CAMS.monitorA
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
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const wrapK = (o, k) => { const [gx, gy] = at(o); return { gx, gy, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k],
  wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` }; };
put("sgA", L.SIGNA, E1.signBoard(L.SIGNA, { id: "sgA", style: "plate", text: "跨链桥 · KelpDAO" }));
// 桥：E01 bridge 不支持 scale，按常见坑 1 包一层 0.6 并换算 anchors
const BW = wrapK(L.BRIDGE, 0.6);
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", booth: "normal" }), 0, { wrap: BW.wrap });
for (const n of ["top", "crown", "booth", "nearRoad", "farBank", "river"]) if (A.br[n]) A.br[n] = BW.sc(A.br[n]);
A.br.deck = A.br.deck.map(BW.sc);
// 两台 RPC：正常版 + 被替换版（攻击者红，初始隐藏，L3 交叉淡入）
L.FAKE.forEach((o, i) => {
  put("fk" + i, o, O.rpc(o, { id: "fk" + i }));
  const r = O.rpc(o, { id: "fk" + i + "a", state: "attacker" }); A["fk" + i + "a"] = r.anchors; add(o, S.hid("fk" + i + "ag", r.svg), 0.5);
});
L.EXTRPC.forEach((o, i) => put("ex" + i, o, O.rpc(o, { id: "ex" + i })));
put("fkA", L.FORKA, E16.forkSwitch(L.FORKA, { id: "fkA", scale: 0.8, labels: ["外部 RPC", "被替换的节点"] }));
put("atk", L.ATKA, O.person(L.ATKA, { id: "atk", state: "attacker", scale: 0.7 }), 0, { grow: true });
put("dkA", L.DESKA, O.desk(L.DESKA, { id: "dkA", screen2: `<rect x="0" y="0" width="148" height="88" fill="#e3f4ea"/><text x="74" y="56" text-anchor="middle" font-size="26" font-weight="900" fill="#1f9d55">正常 ✓</text>` }));
// 管道：RPC → 岗亭（假数据，L2 出现）；外部 RPC → 扳道器（开场就在）；被替换节点 → "别的 IP"（L5 出现）
const PF = [L.APIPE.fake0, L.APIPE.fake1];
PF.forEach((r, i) => { const q = E1.pipe(r.o, { id: "pf" + i, pts: r.pts, flow: true }); A["pf" + i] = q.anchors; add(r.o, S.hid("pf" + i + "g", q.svg), 1); });
put("pe", L.APIPE.ext.o, E1.pipe(L.APIPE.ext.o, { id: "pe", pts: L.APIPE.ext.pts, flow: true }), 1);
const RP = { o: L.FAKE[1], pts: [[50, 0, 40], [260, 0, 40]] };
{ const q = E1.pipe(RP.o, { id: "pr", pts: RP.pts, flow: true }); A.pr = q.anchors; add(RP.o, S.hid("prg", q.svg), -1); }
// 信封：L0 跨链消息过桥（青蓝 → L1 变红）；L4 / L7 伪造数据；L5 真实数据
const d0 = A.br.deck[0], deckPts = A.br.deck.slice(1, 7);
const letterAt = (key, o, opts) => { const q = E1.letter(o, { id: key, ...opts }); A[key] = q.anchors; add(o, S.hid(key + "g", q.svg), 30); };
letterAt("msg", G(...d0), { w: 44, h: 30 });
letterAt("msgR", G(...d0), { w: 44, h: 30, state: "attacker" });
const pipeWalk = (r) => { const p0 = r.pts[0]; return { o: { u: r.o.u + p0[0], v: r.o.v + p0[1] }, z: p0[2], pts: r.pts.slice(1).map((p) => at(r.o, ...p)) }; };
const WF = PF.map(pipeWalk), WR = pipeWalk(RP);
WF.forEach((q, i) => { letterAt("lf" + i, q.o, { z: q.z, lift: 0, w: 44, h: 30, state: "attacker" }); letterAt("lg" + i, q.o, { z: q.z, lift: 0, w: 44, h: 30, state: "attacker" }); });
letterAt("lr", WR.o, { z: WR.z, lift: 0, w: 44, h: 30 });
// 源链上没有：桥左端红虚线空框 + 红叉
{ const [x, y] = S.up(d0, 10);
  add(L.BRIDGE, S.hid("nosrc", `<rect x="${x - 70}" y="${y - 50}" width="70" height="46" rx="6" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="8 6"/>
    <path d="M${x - 50} ${y - 37}l30 20M${x - 20} ${y - 37}l-30 20" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/>`), 400); }
// DDoS：外部 RPC 右上方密集小红箭头
{ let s = ""; L.EXTRPC.forEach((_, i) => { const [cx, cy] = A["ex" + i].center;
    for (let k = 0; k < 5; k++) { const sx = cx + 70 + k * 16, sy = cy - 90 + k * 34, ex = cx + 22, ey = cy - 30 + k * 14;
      const a = Math.atan2(ey - sy, ex - sx), h = 11;
      s += `<path d="M${sx} ${sy}L${ex} ${ey}" stroke="#e0453a" stroke-width="3.5" stroke-linecap="round"/><path d="M${ex} ${ey}L${ex - h * Math.cos(a - 0.5)} ${ey - h * Math.sin(a - 0.5)}M${ex} ${ey}L${ex - h * Math.cos(a + 0.5)} ${ey - h * Math.sin(a + 0.5)}" stroke="#e0453a" stroke-width="3.5" stroke-linecap="round"/>`; } });
  add(L.EXTRPC[1], S.hid("ddos", `<g id="ddos-m">${s}</g>`), 400); }
// 点阵：29 点，每点约 1000 万美元，从桥面飘到左下
const DOT = []; { const [gx, gy] = at(L.DOTSA); for (let i = 0; i < 29; i++) { const r = Math.floor(i / 10), c = i % 10; DOT.push([gx + 15 + c * 30, gy + 15 + r * 30]); }
  add(L.DOTSA, DOT.map(([x, y], i) => `<circle id="dA-${i}" cx="${x}" cy="${y}" r="10" fill="#e0453a" opacity="0"/>`).join(""), 0); }
const DOTOFF = DOT.map(([x, y]) => [Math.round(A.br.crown[0] - x), Math.round(A.br.crown[1] - y)]);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-booth", up(A.br.booth, 30), "跨链验证者", "lab-cs lab-sm");
lb("lb-nosrc", S.up(d0, 66), "源链上没有", "lab-r lab-sm", "r");
lb("lb-f0", up(A.fk0.top, 6), "RPC 节点 1", "lab-cs lab-sm");
lb("lb-f1", up(A.fk1.top, 6), "RPC 节点 2", "lab-cs lab-sm");
lb("lb-f0x", up(A.fk0.top, 6), "被替换的节点", "lab-rs lab-sm");
lb("lb-f1x", up(A.fk1.top, 6), "被替换的节点", "lab-rs lab-sm");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-r lab-sm");
lb("lb-fake", up(A.pf0.mid, 34), "伪造数据 → 验证者", "lab-r lab-sm");
lb("lb-ip", up(A.pr.end, 30), "别的 IP", "lab-ink lab-sm", "l");
lb("lb-real", up(A.pr.mid, -24), "真实数据", "lab-cs lab-sm", "t");
lb("lb-ex0", up(A.ex0.top, 6), "外部 RPC", "lab-cs lab-sm");
lb("lb-ex1", up(A.ex1.top, 6), "外部 RPC", "lab-cs lab-sm");
lb("lb-sw", up(A.fkA.top, 8), "自动切换", "lab-ink lab-sm");
lb("lb-dots", up(DOT[0], 24), "约 2.9 亿美元", "lab-r", "b");
lb("lb-dleg", [DOT[0][0] - 6, DOT[20][1] + 26], "每点 ≈ 1000 万美元", "lab-ink lab-sm", "t");
lb("lb-mon", [A.dkA.top[0] - 120, A.dkA.top[1] + 40], "监控", "lab-ink lab-sm", "r");
lb("lb-ok", up(A.dkA.top, 52), "一切正常 ✓", "lab-g");

// ---------------------------------------------------------------- 屏幕层卡片
S.curve("cvMon", S.scr("monitorA", A.dkA.screen), S.scr("monitorA", A.fk1.center), { color: "#2aa3c9" });
const html = evt("ev", "<b>KelpDAO</b> · 2026 年 4 月", { color: "#e0453a" })
  + evt("src", `来源 · LayerZero 声明`, { top: 200 })
  + kw("kw-guess", "先猜", { x: 1440, y: 400, size: 44, accent: "#2aa3c9" })
  + kw("kw-q", "监控能<b>发现</b>吗？", { x: 1440, y: 486, size: 44, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  ver: w("验证者", 0), pass: w("放行", 0), src: w("源链", 1), two: w("两个", 2), rpc: w("RPC", 2), swap: w("替换", 3),
  fake: w("伪造数据", 4), real: w("真实数据", 5), ddos: w("DDoS", 6), kill: w("打掉", 6), auto: w("自动切换", 7), dirty: w("被污染", 7),
  stmt: w("声明", 8), loss: w("2.9", 8), guess: w("先猜", 9), mon: w("查询", 10), ok: w("一切正常", 10),
};
const t = (x) => f(x);
const JSA = JSON.stringify;
S.build({
  cam0: "bridgeA", sub: "两个节点只对验证者说谎",
  grid: { u0: -2700, u1: 3200, v0: -3000, v1: 3000 }, box: [-1600, -1100, 3600, 2100],   // 盖住 bridgeA / failA / monitorA / A
  shown: [], css, html,
  terms: [
    { id: "t0", t: "跨链验证者", d: "核对源链消息、决定是否放行的节点", at: w("验证者", 0) },
    { id: "t1", t: "RPC 节点", d: "对外提供读链和广播交易接口的节点", at: w("RPC 节点", 2) },
    { id: "t2", t: "DDoS", d: "用海量请求把服务打瘫", at: w("DDoS", 6) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2026 年 4 月，LayerZero 给 KelpDAO 确认跨链消息的验证者，放行了一条消息。
      pop("#ev", ${t(LS[0] + 0.3)}); pop("#src", ${t(LS[0] + 0.9)});
      pop("#lb-booth", ${t(TM.ver)}); flash("#br-wave-0, #br-wave-1", ${t(TM.pass - 0.4)}, 3);
      fadeIn("#msgg", ${t(TM.pass)}, 0.25); fadeIn("#msgRg", ${t(TM.pass)}, 0.01); tl.set("#msgR", { opacity: 0 }, ${t(TM.pass)});
      X1.walk(tl, "msg", ${t(TM.pass + 0.1)}, 1.6, ${JSA(deckPts)}); X1.walk(tl, "msgR", ${t(TM.pass + 0.1)}, 1.6, ${JSA(deckPts)});
      // ===== L1 这条消息，在源链上根本不存在。
      KIT.swap(tl, "#msg", "#msgR", ${t(LS[1])}, 0.3); bump("#msgRg", ${t(LS[1] + 0.3)}, 1.15, 1);
      fadeIn("#nosrc", ${t(TM.src)}, 0.3); pop("#lb-nosrc", ${t(TM.src + 0.2)});
      // ===== L2 验证者读链，靠的是两个 RPC 节点。
      out("#msgg, #msgRg, #nosrc, #lb-nosrc", ${t(LS[2] - 0.2)});
      pop("#lb-f0", ${t(TM.two)}); pop("#lb-f1", ${t(TM.two + 0.15)});
      fadeIn("#pf0g, #pf1g", ${t(TM.rpc)}, 0.4); X1.dash(tl, ["pf0-flow", "pf1-flow"], ${t(TM.rpc)}, ${t(LE[5] - TM.rpc)}, 220);
      // ===== L3 攻击者控制了这两个节点，替换了节点程序。
      grow("atk", ${t(LS[3])}); pop("#lb-atk", ${t(LS[3] + 0.4)});
      KIT.swap(tl, "#fk0, #fk1", "#fk0ag, #fk1ag", ${t(TM.swap)}, 0.4);
      out("#lb-f0, #lb-f1", ${t(TM.swap)}, 0.2); pop("#lb-f0x", ${t(TM.swap + 0.25)}); pop("#lb-f1x", ${t(TM.swap + 0.4)});
      // ===== L4 被替换的节点，只对验证者返回伪造数据。
      out("#lb-atk", ${t(LS[4] - 0.1)});
      fadeIn("#lf0g, #lf1g", ${t(TM.fake - 0.5)}, 0.2);
      X1.walk(tl, "lf0", ${t(TM.fake - 0.4)}, 2.2, ${JSA(WF[0].pts)}); X1.walk(tl, "lf1", ${t(TM.fake - 0.2)}, 2.2, ${JSA(WF[1].pts)});
      pop("#lb-fake", ${t(TM.fake)}); flash("#br-booth-led", ${t(TM.fake + 1.6)}, 2);
      // ===== L5 对别的 IP 来的查询，它返回真实数据。
      out("#lf0g, #lf1g", ${t(LS[5] + 0.3)});
      fadeIn("#prg", ${t(LS[5])}, 0.4); pop("#lb-ip", ${t(LS[5] + 0.3)});
      fadeIn("#lrg", ${t(TM.real - 0.6)}, 0.2); X1.walk(tl, "lr", ${t(TM.real - 0.5)}, 1.8, ${JSA(WR.pts)}); pop("#lb-real", ${t(TM.real)});
      X1.dash(tl, "pr-flow", ${t(LS[5])}, ${t(LE[5] - LS[5])}, 120);
      // ===== L6 攻击者再用 DDoS，打掉没被攻破的外部 RPC。
      out("#lb-fake, #lb-ip, #lb-real, #lrg, #lb-booth", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "failA", 1.2);
      pop("#lb-ex0", ${t(LS[6] + 1.0)}); pop("#lb-ex1", ${t(LS[6] + 1.15)});
      X1.dash(tl, "pe-flow", ${t(LS[6])}, ${t(TM.kill - LS[6])}, 140);
      fadeIn("#ddos", ${t(TM.ddos)}, 0.15);
      [0, 1, 2, 3].forEach(function (k) { tl.fromTo("#ddos-m", { x: 50, y: -24 }, { x: 0, y: 0, duration: 0.38, ease: "power1.in", immediateRender: false }, ${t(TM.ddos)} + k * 0.4); });
      KIT.broke(tl, "ex0", ${t(TM.kill)}); KIT.broke(tl, "ex1", ${t(TM.kill + 0.15)}); out("#pe-flow", ${t(TM.kill)}, 0.3);
      out("#ddos", ${t(TM.kill + 0.9)}, 0.3);
      // ===== L7 系统自动切换，切到了被污染的节点上。
      X16.flip(tl, "fkA", ${t(TM.auto)}, true); pop("#lb-sw", ${t(TM.auto)});
      fadeIn("#lg0g, #lg1g", ${t(TM.dirty - 0.3)}, 0.2);
      X1.walk(tl, "lg0", ${t(TM.dirty - 0.2)}, 2.0, ${JSA(WF[0].pts)}); X1.walk(tl, "lg1", ${t(TM.dirty)}, 2.0, ${JSA(WF[1].pts)});
      bump("#lb-f0x, #lb-f1x", ${t(TM.dirty)}, 1.12, 1);
      // ===== L8 LayerZero 的声明写，损失约 2.9 亿美元。
      out("#lg0g, #lg1g, #lb-ex0, #lb-ex1, #lb-sw, #lb-f0x, #lb-f1x", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "A", 1.1);
      bump("#src", ${t(TM.stmt)}, 1.06, 1);
      ${JSA(DOTOFF)}.forEach(function (d, i) { tl.fromTo("#dA-" + i, { opacity: 0, x: d[0], y: d[1] }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, ${t(TM.loss - 0.3)} + i * 0.04); });
      pop("#lb-dots", ${t(TM.loss + 0.9)}); pop("#lb-dleg", ${t(TM.loss + 1.2)});
      // ===== L9 先猜一道题。
      out("#lb-dots, #lb-dleg", ${t(LS[9] - 0.2)});
      cam(${t(LS[9] - 0.1)}, "monitorA", 1.2);
      pop("#kw-guess", ${t(TM.guess + 0.2)});
      // ===== L10 监控系统也查询了这两个节点，结果一切正常。
      pop("#lb-mon", ${t(LS[10])}); pop("#lb-f0x", ${t(LS[10] + 0.1)}); pop("#lb-f1x", ${t(LS[10] + 0.2)});
      draw("cvMon", ${t(TM.mon)}, 0.8);
      KIT.swap(tl, "#dkA-scr", "#dkA-scr2", ${t(TM.ok)}, 0.3); pop("#lb-ok", ${t(TM.ok + 0.1)});
      // ===== L11 它能发现这次攻击吗？
      pop("#kw-q", ${t(LS[11])});
      // ===== L12 先记住这个问题。
      out("#ev, #src", ${t(LS[12] - 0.3)}, 0.25);
      tl.to("#kw-guess, #kw-q", { y: -250, duration: 0.6, ease: "power2.inOut" }, ${t(LS[12])});
`,
});
