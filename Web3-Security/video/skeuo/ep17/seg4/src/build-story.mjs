// ep17/seg4「④ 签名之前」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.portC（BRIEF）。
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
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.relayD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// wrap helper for objects without opts.scale (SEGBASE 常见坑 1)
const wrapK = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o);
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = sc(A[key][n]);
};

// ---------------------------------------------------------------- 世界物件
// C 区（seg3 结尾的 portC 画面，开场带过）
put("fwC", L.FIREWALL, E1.firewall(L.FIREWALL, { id: "fwC", len: 200 }));
put("jwtC", L.JWT, E5.keycard(L.JWT, { id: "jwtC", scale: 0.8 }));
put("scanC", L.SCAN, O.magnifier(L.SCAN, { id: "scanC" }));
put("rpcC", L.PORTRPC, O.rpc(L.PORTRPC, { id: "rpcC" }));
wrapK("execC", L.EXEC, O.rack(L.EXEC, { id: "execC", tag: "执行客户端" }), 0.7);
wrapK("consC", L.CONS, O.rack(L.CONS, { id: "consC", tag: "共识客户端" }), 0.7);
put("engC", L.EXEC, E1.pipe(L.ENGINE.o, { id: "engC", pts: L.ENGINE.pts }), 0.5);

// D 区 · 罚没
put("signD", L.SIGND, E1.signBoard(L.SIGND, { id: "signD", style: "plate", text: "验证者机房" }));
put("hostA", L.HOSTS[0], O.rack(L.HOSTS[0], { id: "hostA", tag: "主机 A" }));
put("hostB", L.HOSTS[1], O.rack(L.HOSTS[1], { id: "hostB", tag: "备用机 B" }));
put("hostAx", L.HOSTS[0], O.rack(L.HOSTS[0], { id: "hostAx", tag: "主机 A", state: "attacker", leds: ["red", "red", "red"] }), 1, { wrap: (s) => S.hid("hostAxG", s) });
put("hostBx", L.HOSTS[1], O.rack(L.HOSTS[1], { id: "hostBx", tag: "备用机 B", state: "attacker", leds: ["red", "red", "red"] }), 1, { wrap: (s) => S.hid("hostBxG", s) });
put("key0", L.VKEYS[0], O.key(L.VKEYS[0], { id: "key0" }));
put("key1", L.VKEYS[1], O.key(L.VKEYS[1], { id: "key1" }), 0, { grow: true });
put("ops", L.OPS, O.person(L.OPS, { id: "ops", role: "engineer", scale: 0.6 }));
put("clockD", L.CLOCKD, O.clock(L.CLOCKD, { id: "clockD", h: 3, m: 0 }));
put("eth", L.ETHCHAIN, O.chain(L.ETHCHAIN, { id: "eth", n: 4 }));
put("slashDb", L.SLASHDB, O.ledgerBook(L.SLASHDB, { id: "slashDb", scale: 0.8 }));
put("waitD", L.WAITD, O.hourglass(L.WAITD, { id: "waitD" }));
put("doppel", L.DOPPEL, O.shield(L.DOPPEL, { id: "doppel" }), 0, { grow: true });
// 罚没印记（原生 SVG）
{
  const [mx, my] = up(A.eth.blocks[1], 150);
  add(L.ETHCHAIN, S.hid("slashMark", `<g transform="translate(${mx},${my}) rotate(-10)"><circle r="64" fill="#fff6f4" stroke="#e0453a" stroke-width="7"/><circle r="52" fill="none" stroke="#e0453a" stroke-width="2.5"/>
    <text x="0" y="16" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="44" font-weight="900" fill="#e0453a">罚没</text></g>`), 400);
}

// D 区 · relay
put("builder", L.BUILDER, E1.sorter(L.BUILDER, { id: "builder", blockLabel: "区块" }));
put("relay", L.RELAY, E9.commitBox(L.RELAY, { id: "relay", name: "relay", scale: 0.8, seal: "区块" }));
put("header", L.HEADER, O.doc(L.HEADER, { id: "header", standing: true, title: "区块头", w: 160, h: 210, stampText: "已签" }), 0, { grow: true });
put("proposer", L.PROPOSER, O.person(L.PROPOSER, { id: "proposer", role: "signer", scale: 0.6 }));
put("propX", L.PROPOSER, O.person(L.PROPOSER, { id: "propX", state: "attacker", scale: 0.7 }), 1, { wrap: (s) => S.hid("propXG", s) });
L.BUNDLES.forEach((o, i) => {
  put("bd" + i, o, E1.letter(o, { id: "bd" + i, z: 0 }), 0, { wrap: (s) => S.hid("bdG" + i, s) });
  put("bdr" + i, o, E1.letter(o, { id: "bdr" + i, z: 0, state: "attacker" }), 1, { wrap: (s) => S.hid("bdrG" + i, s) });
});
// 点阵（原生 SVG）：20 点（每点约 100 万美元）；100 点方阵（每点 = 1% 区块）
{
  const [gx, gy] = at(L.DOTS20), d = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 10; c++) d.push(`<circle cx="${gx + 13 + c * 26}" cy="${gy + 20 + r * 32}" r="10" fill="#e0453a"/>`);
  add(L.DOTS20, S.hid("dots20", d.join("")), 300);
  const [hx, hy] = at(L.DOTS100), e = [];
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10;
    const col = i < 40 ? "#1d93ba" : i < 74 ? "#7cc9e2" : "#cfc9be";
    e.push(`<circle cx="${hx + 10 + c * 20}" cy="${hy + 10 + r * 20}" r="7.5" fill="${col}"/>`);
  }
  add(L.DOTS100, S.hid("dots100", e.join("")), 300);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-hostA", up(A.hostA.top, 6), "主机 A", "lab-ink lab-sm");
lb("lb-hostB", up(A.hostB.top, 6), "备用机 B", "lab-ink lab-sm");
lb("lb-eth", A.eth.ground ? [A.eth.ground[0] + 330, A.eth.ground[1] + 60] : A.eth.center, "以太坊网络", "lab-cs lab-sm", "l");
lb("lb-slash", up(A.eth.blocks[1], 240), "扣质押 · 强制退出", "lab-rs lab-sm");
lb("lb-m1", [S.A.key0.center[0] - 70, S.A.key0.center[1] + 30], "消息 1", "lab-cs lab-sm", "r");
lb("lb-m2", [S.A.key0.center[0] + 100, S.A.key0.center[1] + 30], "消息 2", "lab-rs lab-sm", "l");
lb("lb-clock", up(A.clockD.top, 6), "凌晨 3 点", "lab-ink lab-sm");
lb("lb-down", up(A.hostA.top, 96), "失去响应？", "lab-r lab-sm");
lb("lb-ops", up(A.ops.top, 6), "运维", "lab-cs lab-sm");
lb("lb-key1", [A.key1.center[0] + 70, A.key1.center[1] - 26], "同一把密钥", "lab-cs lab-sm", "l");
lb("lb-dbl", up(A.eth.blocks[2], 110), "✕ 双签", "lab-r");
lb("lb-fail", up(A.hostA.top, 96), "故障切换 · 迁移", "lab-r lab-sm");
lb("lb-exp", up(A.slashDb.top, 6), "防罚没数据", "lab-cs lab-sm");
lb("lb-stop", up(A.hostA.top, 96), "已停止 ✓", "lab-gs lab-sm");
lb("lb-wait", up(A.waitD.top, 6), "至少 2 个 epoch", "lab-cs lab-sm");
lb("lb-doppel", [A.doppel.center[0] + 60, A.doppel.center[1]], "分身检测 · 最后一道", "lab-gs lab-sm", "l");
lb("lb-builder", up(A.builder.top, 6), "构建者", "lab-cs lab-sm");
lb("lb-relay", up(A.relay.top, 6), "relay", "lab-cs lab-sm");
lb("lb-full", [A.relay.center[0] - 70, A.relay.center[1] + 40], "完整区块", "lab-ink lab-sm", "r");
lb("lb-header", up(A.header.top, 6), "区块头", "lab-cs lab-sm");
lb("lb-prop", up(A.proposer.top, 6), "提议者", "lab-ink lab-sm");
lb("lb-propX", up(A.propX.top, 6), "恶意提议者", "lab-rs lab-sm");
lb("lb-pay", [A.relay.top[0] + 40, A.relay.top[1] - 70], "发布 + 付款？", "lab-cs lab-sm");
lb("lb-bad", [A.header.center[0], A.header.center[1] + 20], "无效", "lab-rs");
lb("lb-bd", [A.bd1.top[0], A.bd1.top[1] - 8], "交易包", "lab-cs lab-sm");
lb("lb-bdr", [A.bd1.top[0], A.bd1.top[1] - 8], "交易包 · 被拆开", "lab-rs lab-sm");
lb("lb-d20", [at(L.DOTS20)[0] + 130, at(L.DOTS20)[1] + 92], "约 2000 万美元 · 每点约 100 万", "lab-r lab-sm", "t");
lb("lb-fix", [A.relay.top[0] + 40, A.relay.top[1] - 70], "① 广播 ② 交给提议者 ✓", "lab-gs lab-sm");
lb("lb-trust", [A.relay.center[0] - 70, A.relay.center[1] + 40], "可信中间人", "lab-cs lab-sm", "r");
lb("lb-d100", [at(L.DOTS100)[0] + 210, at(L.DOTS100)[1] + 60], "前两大构建者 约 74%<br>每点 = 1% 区块", "lab-cs lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层（slashD / relayD 镜头期间镜头不动，曲线按镜头算）
const sc = (p) => S.scr("slashD", p), sr = (p) => S.scr("relayD", p);
const blk = A.eth.blocks[2];
S.curve("cv-m1", sc(A.key0.center), sc(blk), { color: "#2aa3c9", c1: [sc(A.key0.center)[0] - 80, sc(A.key0.center)[1] + 120], c2: [sc(blk)[0] - 60, sc(blk)[1] + 60] });
S.curve("cv-m2", sc(A.key0.center), sc(blk), { color: "#e0453a", c1: [sc(A.key0.center)[0] + 120, sc(A.key0.center)[1] - 40], c2: [sc(blk)[0] + 80, sc(blk)[1] - 30] });
S.curve("cv-a", sc(A.hostA.front), sc(blk), { color: "#2aa3c9" });
S.curve("cv-b", sc(A.hostB.front), sc(blk), { color: "#e0453a", c1: [sc(A.hostB.front)[0] + 60, sc(A.hostB.front)[1] + 100], c2: [sc(blk)[0] + 80, sc(blk)[1] - 60] });
S.curve("cv-exp", sc(A.hostA.front), sc(A.slashDb.center), { color: "#2aa3c9" });
S.curve("cv-imp", sc(A.slashDb.center), sc(A.hostB.front), { color: "#2aa3c9", c1: [sc(A.slashDb.center)[0] - 40, sc(A.slashDb.center)[1] - 120], c2: [sc(A.hostB.front)[0] + 120, sc(A.hostB.front)[1] + 20] });
S.curve("cv-hd", sr(A.relay.top), sr(A.header.center), { color: "#2aa3c9", c1: [sr(A.relay.top)[0] + 20, sr(A.relay.top)[1] - 120], c2: [sr(A.header.center)[0] - 120, sr(A.header.center)[1] - 20] });

// 75 个验证者小人偶（每个 = 1 个验证者）
const figs = [];
for (let i = 0; i < 75; i++) {
  const r = Math.floor(i / 15), c = i % 15, x = 10 + c * 21, y = 6 + r * 27;
  figs.push(`<g class="fg"><circle cx="${x}" cy="${y + 5}" r="5"/><rect x="${x - 6}" y="${y + 12}" width="12" height="12" rx="5"/></g>`);
}
const html = [
  kw("kw-dbl", `<b>双签</b>`, { x: 820, y: 130, size: 64, accent: "#e0453a" }),
  `<div class="s4card" id="fig75" style="left:1450px;top:320px;width:390px"><svg width="320" style="display:block;margin:0 auto" height="136" viewBox="0 0 320 136">${figs.join("")}</svg><div class="s4t">75 个验证者 · 约 18 ETH</div></div>`,
  `<div class="s4card" id="lidossv" style="left:1430px;top:330px;width:400px"><div class="s4r">2023 年 10 月 · Lido · <b>20 个</b></div><div class="s4r">2025 年 9 月 · SSV · <b>39 个</b></div></div>`,
  evt("ev-21", `<b>2021 年 2 月</b> · 质押服务商重启出错`, { color: "#e0453a" }),
  evt("src-21", `来源 · The Block`, { top: 206 }),
  evt("src-ls", `来源 · Lido、SSV 事后报告`, { top: 126 }),
  kw("kw-blind", `看不见就<b>签</b>`, { x: 700, y: 140, size: 60, accent: "#e0453a" }),
  evt("ev-mev", `<b>MEV-Boost</b> · 2023 年 4 月`, { color: "#e0453a", top: 132 }),
  evt("src-fb", `来源 · Flashbots 事后报告`, { top: 216 }),
  ck("ck-list", "relay 列表 · 定期复核", { x: 1440, y: 660, w: 400, kind: "c" }),
  evt("src-rs", `relayscan.io · 2026 年 11 月单日快照`, { top: 140 }),
].join("");
const css = `
    .s4card { position: absolute; background: #ffffff; border-radius: 14px; padding: 12px 10px 12px; box-shadow: 0 8px 20px rgba(70,60,40,0.12); opacity: 0;
      font-family: "Noto Sans SC", sans-serif; font-weight: 900; color: #1c1c1c; border-left: 6px solid #e0453a; }
    .s4card .fg { fill: #8a8478; }
    .s4card .s4t { font-size: 28px; text-align: center; margin-top: 4px; }
    .s4card .s4r { font-size: 28px; padding: 6px 8px; white-space: nowrap; }
    .s4card .s4r b { color: #e0453a; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dbl: w("双签", 2), dawn: w("凌晨", 4), bkp: w("备用机", 4), slot: w("slot", 5), net: w("网络", 6),
  pubB: w("广播", 17),
};
const t = (x) => f(x);
const ledsA = JSON.stringify(A.hostA.leds), ledsB = JSON.stringify(A.hostB.leds);

S.build({
  cam0: "portC", sub: "同一把密钥，同一时刻只在一处",
  grid: { u0: 4900, u1: 13900, v0: -3900, v1: 5100 }, box: [5000, -4000, 6100, 3100],   // 盖住 portC / slashD / relayD / D
  shown: [], css, html,
  terms: [
    { id: "t0", t: "罚没", d: "验证者违规被扣质押并强制退出", at: w("罚没", 1) },
    { id: "t1", t: "slot", d: "PoS 链上每个出块位置的时间格", at: w("slot", 5) },
    { id: "t2", t: "防罚没数据", d: "记录已签位置、防止重复签名的数据", at: w("防罚没数据", 10) },
    { id: "t3", t: "epoch", d: "以太坊 32 个 slot 组成的时间段", at: w("epoch", 11) },
    { id: "t4", t: "分身检测", d: "启动时先观察同一密钥是否已在别处运行", at: w("分身检测", 11) },
    { id: "t5", t: "relay", d: "在构建者和提议者之间托管区块的中间人", at: w("relay", 13) },
    { id: "t6", t: "构建者", d: "组装完整区块并竞价的角色", at: w("构建者", 13) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 验证者这一端，风险出在签名上。
      cam(${t(LS[0])}, "slashD", 2.0); pop("#lb-hostA", ${t(LS[0] + 1.9)}); pop("#lb-hostB", ${t(LS[0] + 2.0)}); pop("#lb-eth", ${t(LS[0] + 2.1)});
      // ===== L1 罚没，是 PoS 验证者违反协议，被扣除部分质押并强制退出。
      pop("#slashMark", ${t(LS[1] + 0.3)}, 0.35); pop("#lb-slash", ${t(LS[1] + 2.4)});
      // ===== L2 最常见的原因是双签。
      out("#slashMark, #lb-slash", ${t(LS[2] - 0.2)}); pop("#kw-dbl", ${t(TM.dbl)}, 0.3);
      // ===== L3 同一把密钥，对同一个位置，签了两个不同的消息。
      out("#kw-dbl", ${t(LS[3])}); bump("#key0", ${t(LS[3] + 0.2)}, 1.12, 1);
      draw("cv-m1", ${t(LS[3] + 1.2)}, 0.7); pop("#lb-m1", ${t(LS[3] + 1.6)}); draw("cv-m2", ${t(LS[3] + 2.2)}, 0.7); pop("#lb-m2", ${t(LS[3] + 2.6)});
      // ===== L4 凌晨，运维看到主机 A 失去响应，就在备用机 B 上启动同一把密钥。
      out("#cv-m1, #cv-m2, #lb-m1, #lb-m2", ${t(LS[4] - 0.2)});
      pop("#lb-clock", ${t(TM.dawn)}); KIT.clock(tl, "clockD", ${t(TM.dawn)}, 1.4, 20); bump("#clockD", ${t(TM.dawn + 0.1)}, 1.08, 1);
      ${ledsA}.forEach((id) => KIT.led(tl, id, ${t(TM.dawn + 1.4)}, "off")); pop("#lb-down", ${t(TM.dawn + 1.6)});
      pop("#lb-ops", ${t(TM.bkp - 0.6)}); bump("#ops", ${t(TM.bkp - 0.4)}, 1.1, 1); grow("key1", ${t(TM.bkp + 0.4)}); pop("#lb-key1", ${t(TM.bkp + 0.9)});
      // ===== L5 其实 A 没有停，两台机器对同一个 slot 各签一票。
      out("#lb-down, #lb-clock, #lb-ops", ${t(LS[5] - 0.2)}); ${ledsA}.forEach((id) => KIT.led(tl, id, ${t(LS[5] + 0.5)}, "green"));
      draw("cv-a", ${t(TM.slot + 0.2)}, 0.6); draw("cv-b", ${t(TM.slot + 0.5)}, 0.6); pop("#lb-dbl", ${t(TM.slot + 1.2)}, 0.3);
      // ===== L6 网络检测到双签，验证者被罚没。
      fadeIn("#hostAxG, #hostBxG", ${t(LS[6] + 0.6)}, 0.4); pop("#slashMark", ${t(LS[6] + 1.4)}, 0.35); bump("#lb-dbl", ${t(LS[6] + 0.3)}, 1.12, 1);
      // ===== L7 公开的罚没事件，几乎都发生在故障切换或迁移时。
      out("#cv-a, #cv-b, #lb-dbl, #lb-key1", ${t(LS[7] - 0.2)}); pop("#lb-fail", ${t(LS[7] + 1.6)}); bump("#lb-fail", ${t(LS[7] + 3.4)}, 1.08, 1);
      // ===== L8 2021 年 2 月，一家质押服务商重启出错，75 个验证者被罚没，约 18 ETH。
      pop("#ev-21", ${t(LS[8] + 0.1)}); pop("#src-21", ${t(LS[8] + 0.4)}); pop("#fig75", ${t(LS[8] + 2.6)});
      tl.to("#fig75 .fg", { fill: "#e0453a", duration: 0.12, stagger: 0.025 }, ${t(LS[8] + 3.3)});
      // ===== L9 2023 年 10 月和 2025 年 9 月，Lido 和 SSV 网络上，也各有一批验证者被罚没。
      out("#ev-21, #src-21, #fig75", ${t(LS[9] - 0.2)}); pop("#lidossv", ${t(LS[9] + 0.3)}); pop("#src-ls", ${t(LS[9] + 0.5)});
      // ===== L10 防线在流程，迁移前导出防罚没数据，确认旧实例已经停止。
      out("#lidossv, #src-ls, #lb-fail, #slashMark", ${t(LS[10] - 0.2)}); out("#hostAxG, #hostBxG", ${t(LS[10])}, 0.4);
      draw("cv-exp", ${t(LS[10] + 1.6)}, 0.6); pop("#lb-exp", ${t(LS[10] + 1.8)}); draw("cv-imp", ${t(LS[10] + 2.4)}, 0.6);
      ${ledsA}.forEach((id) => KIT.led(tl, id, ${t(LS[10] + 3.4)}, "off")); out("#key0", ${t(LS[10] + 3.4)}); pop("#lb-stop", ${t(LS[10] + 3.6)});
      // ===== L11 再等待至少 2 个 epoch，并开启分身检测，作为最后一道防线。
      out("#cv-exp, #cv-imp", ${t(LS[11] - 0.2)}); pop("#lb-wait", ${t(LS[11] + 0.6)}); KIT.sand(tl, "waitD", ${t(LS[11] + 0.6)}, 3.0);
      grow("doppel", ${t(LS[11] + 3.0)}); pop("#lb-doppel", ${t(LS[11] + 3.4)});
      // ===== L12 签名的另一个风险，是看不见就签。
      out("#lb-hostA, #lb-hostB, #lb-eth, #lb-exp, #lb-stop, #lb-wait, #lb-doppel", ${t(LS[12] - 0.2)});
      cam(${t(LS[12] - 0.1)}, "relayD", 1.4); pop("#kw-blind", ${t(LS[12] + 1.4)}, 0.3);
      // ===== L13 在 MEV-Boost 里，relay 托管构建者组装的完整区块，只给提议者区块头。
      out("#kw-blind", ${t(LS[13])}); pop("#lb-builder", ${t(LS[13] + 0.3)}); pop("#lb-relay", ${t(LS[13] + 1.2)});
      [0, 1, 2].forEach((i) => fadeIn("#bdG" + i, ${t(LS[13] + 0.5)} + i * 0.15, 0.3)); pop("#lb-bd", ${t(LS[13] + 0.9)});
      X9.drop(tl, "relay", ${t(LS[13] + 2.2)}, 0.8); pop("#lb-full", ${t(LS[13] + 3.0)});
      draw("cv-hd", ${t(LS[13] + 4.4)}, 0.6); grow("header", ${t(LS[13] + 4.8)}); pop("#lb-header", ${t(LS[13] + 5.2)}); pop("#lb-prop", ${t(LS[13] + 5.6)});
      // ===== L14 提议者签名区块头，相信 relay 会发布完整区块并付款。
      out("#lb-full, #cv-hd", ${t(LS[14] - 0.2)}); bump("#proposer", ${t(LS[14] + 0.3)}, 1.1, 1); fadeIn("#header-stampmark", ${t(LS[14] + 1.0)}, 0.2);
      pop("#lb-pay", ${t(LS[14] + 2.2)});
      // ===== L15 2023 年 4 月，一个恶意提议者，签了一个无效的区块头。
      out("#lb-pay, #lb-prop", ${t(LS[15] - 0.2)}); pop("#ev-mev", ${t(LS[15] + 0.1)});
      out("#proposer", ${t(LS[15] + 1.4)}, 0.3); fadeIn("#propXG", ${t(LS[15] + 1.4)}, 0.3); pop("#lb-propX", ${t(LS[15] + 1.8)}); pop("#lb-bad", ${t(LS[15] + 3.6)}, 0.3);
      // ===== L16 旧代码照样返回区块体，他拆开三明治机器人的交易包，获利约 2000 万美元。
      pop("#src-fb", ${t(LS[16] + 0.2)}); X9.flap(tl, "relay", ${t(LS[16] + 0.6)}, 90);
      out("#lb-bd", ${t(LS[16] + 2.6)}); [0, 1, 2].forEach((i) => { out("#bdG" + i, ${t(LS[16] + 2.8)} + i * 0.2, 0.25); fadeIn("#bdrG" + i, ${t(LS[16] + 2.8)} + i * 0.2, 0.25); });
      pop("#lb-bdr", ${t(LS[16] + 3.2)}); fadeIn("#dots20", ${t(LS[16] + 5.0)}, 0.5); pop("#lb-d20", ${t(LS[16] + 5.4)});
      // ===== L17 修复后，relay 先广播区块，再把区块交给提议者。
      out("#lb-bdr, #lb-bad, #lb-propX, #propXG, #ev-mev, #src-fb, #lb-d20, #dots20", ${t(LS[17] - 0.2)});
      [0, 1, 2].forEach((i) => out("#bdrG" + i, ${t(LS[17] - 0.2)})); fadeIn("#proposer", ${t(LS[17])}, 0.3); out("#header-stampmark", ${t(LS[17])}, 0.2);
      X9.flap(tl, "relay", ${t(LS[17] + 0.3)}, 0); pop("#lb-fix", ${t(TM.pubB)}); bump("#lb-fix", ${t(LS[17] + 3.2)}, 1.08, 1);
      // ===== L18 relay 是可信中间人，验证者要评估自己用的 relay 和它的运营方。
      pop("#lb-trust", ${t(LS[18] + 0.4)}); pop("#ck-list", ${t(LS[18] + 2.6)});
      // ===== L19 这个市场也很集中，2026 年 11 月的一个单日快照里，前两大构建者约占 74% 的区块。
      out("#lb-fix, #ck-list", ${t(LS[19] - 0.2)}); pop("#src-rs", ${t(LS[19] + 1.0)});
      fadeIn("#dots100", ${t(LS[19] + 2.0)}, 0.6); pop("#lb-d100", ${t(LS[19] + 4.6)}); bump("#lb-builder", ${t(LS[19] + 5.2)}, 1.1, 1);
`,
});
