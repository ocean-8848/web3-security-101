// ep17/seg3「③ 节点被蒙住眼」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.windowB（BRIEF）。ends static on CAMS.portC
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const R = L.RECTS;
// 段内镜头：插线板 + 地址表 + 攻击者节点 + P2P 牌（比 peerC 近，L7 关键画面用）
const panelC = L.fit([R.signC, R.peer, R.addr, R.atkN0, R.atkN1, R.atkN2], [300, 300, 1620, 860], 1.0);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, panelC }, ext: [X, E1, E3, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 缩放包一层（常见坑 1）：绕地面点 translate·scale·translate，并换算 anchors
const putK = (key, o, obj, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), sc = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k];
  put(key, o, obj, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && typeof q[0] === "number") A[key][n] = sc(q); }
};
// B 窗户（开场构图 = seg2 结尾）
put("signwin", L.SIGNWIN, E1.signBoard(L.SIGNWIN, { id: "signwin", style: "plate", text: "比喻 · 窗户" }));
put("win", L.WINDOW, X.viewWindow(L.WINDOW, { id: "win", scale: 1, mode: "replay" }));
// seg2 结尾状态：第二扇窗虚影（红虚线 + ✗）、"● 播录像"、"只有一个 RPC"——开场照样画出，L0 横移时收起
const WIN2 = { ...S.rel(L.WINDOW, 240, 160), scale: 1 };
const w2 = X.viewWindow(WIN2, { id: "win2", scale: 1, mode: "live", state: "broken", badge: false });
A.win2 = w2.anchors; add(WIN2, S.hid("win2g", w2.svg));
put("watcher", L.WATCHER, O.person(L.WATCHER, { id: "watcher", role: "signer", scale: 0.6 }));
// C 节点小屋
put("signc", L.SIGNC, E1.signBoard(L.SIGNC, { id: "signc", style: "plate", text: "P2P 网络" }));
put("peer", L.PEER, X.peerPanel(L.PEER, { id: "peer", scale: 1 }));
put("addr", L.ADDR, E3.slotCabinet(L.ADDR, { id: "addr", title: "地址表", labels: ["1", "2", "3", "4", "5", "6"], fill: { 5: [{ bytes: 32, color: "red" }] } }));
L.ATKNODES.forEach((q, i) => put("atk" + i, q, O.person(q, { id: "atk" + i, role: "attacker", scale: 0.55 }), 0, { grow: true }));
put("atkch", L.ATKCHAIN, O.chain(L.ATKCHAIN, { id: "atkch", n: 3, state: "attacker", labels: ["?", "?", "?"] }), 0, { grow: true });
put("victim", L.VICTIM, O.rack(L.VICTIM, { id: "victim", tag: "受害节点" }));
put("restart", L.RESTART, O.knifeSwitch(L.RESTART, { id: "restart", text: "重启", on: true }));
put("backup", L.BACKUP, O.rpc(L.BACKUP, { id: "backup", state: "attacker" }), 0, { grow: true });
const BP = { o: { u: L.VICTIM.u, v: L.VICTIM.v }, pts: [[90, 60, 60], [L.BACKUP.u - L.VICTIM.u, 60, 60], [L.BACKUP.u - L.VICTIM.u, L.BACKUP.v - L.VICTIM.v + 30, 60]] };
put("bp", BP.o, E1.pipe(BP.o, { id: "bp", pts: BP.pts }), 0.5, { grow: true });
put("lt", BP.o, E1.letter(BP.o, { id: "lt", z: 75, state: "attacker" }), 1);
put("prpc", L.PORTRPC, O.rpc(L.PORTRPC, { id: "prpc" }), 0, { grow: true });
put("fw", L.FIREWALL, E1.firewall(L.FIREWALL, { id: "fw", len: 200 }), 0, { grow: true });
put("jwt", L.JWT, E5.keycard(L.JWT, { id: "jwt", scale: 0.8, text: "JWT", color: "#1d93ba" }), 2, { grow: true });
put("scan", L.SCAN, O.magnifier(L.SCAN, { id: "scan" }), 0, { grow: true, wrap: (svg) => `<g id="scanmv">${svg}</g>` });
putK("exec", L.EXEC, O.rack(L.EXEC, { id: "exec", tag: "执行客户端" }), 0.7, 0, { grow: true });
putK("cons", L.CONS, O.rack(L.CONS, { id: "cons", tag: "共识客户端" }), 0.7, 0, { grow: true });
put("eng", L.ENGINE.o, E1.pipe(L.ENGINE.o, { id: "eng", pts: L.ENGINE.pts }), 0.5, { grow: true });

// 原生 SVG：受害节点周围的"网络"圈、P2P 小节点、插线板红框、金币
const [vx, vy] = at(L.VICTIM), [px, py] = at(L.PEER), [rx, ry] = at(L.PORTRPC);
add(L.VICTIM, S.hid("vring", `<ellipse cx="${vx}" cy="${vy}" rx="250" ry="120" fill="none" stroke="#9a948a" stroke-width="4" stroke-dasharray="14 10"/>`), -3);
const DOTP = [[-150, -250], [-60, -300], [40, -310], [140, -280], [190, -200], [-120, -175]].map(([dx, dy]) => [px + dx, py + dy]);
add(L.PEER, S.hid("p2p", DOTP.map(([x, y]) => `<line x1="${A.peer.top[0]}" y1="${A.peer.top[1]}" x2="${x}" y2="${y}" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="8 7"/>`).join("") +
  DOTP.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="13" fill="${i % 2 ? "#1d93ba" : "#3b3b3b"}" stroke="#fff" stroke-width="3"/>`).join("")), -2);
const [q0, q1, q2, q3] = R.peer;
add(L.PEER, S.hid("pframe", `<rect x="${q0 - 18}" y="${q1 - 18}" width="${q2 - q0 + 36}" height="${q3 - q1 + 36}" rx="10" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/>`), 5);
const coins = []; for (let k = 0; k < 6; k++) coins.push(`<ellipse cx="${rx + 110}" cy="${ry + 10 - k * 9}" rx="26" ry="11" fill="#e7b73a" stroke="#a87b12" stroke-width="2"/>`);
for (let k = 0; k < 4; k++) coins.push(`<ellipse cx="${rx + 160}" cy="${ry + 30 - k * 9}" rx="26" ry="11" fill="#e7b73a" stroke="#a87b12" stroke-width="2"/>`);
add(L.PORTRPC, S.hid("coins", coins.join("")), 3);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-rec", up(A.win.top, 8), "● 播录像", "lab-rs lab-sm");
lb("lb-x2", A.win2.center, "✗", "lab-rs", "c");
lb("lb-one", [A.win.ground[0] - 40, A.win.ground[1] + 24], "只有一个 RPC", "lab-rs lab-sm", "t");
lb("lb-victim", up(A.victim.top, 10), "受害节点", "lab-ink");
lb("lb-net", [vx, vy + 130], "它看到的网络", "lab-cs lab-sm", "t");
lb("lb-peer", up(A.peer.top, 26), "对等连接", "lab-cs lab-sm");
lb("lb-atk", up(A.atk1.top, 12), "日蚀攻击", "lab-rs");
lb("lb-atkch", [at(L.ATKCHAIN)[0], at(L.ATKCHAIN)[1] + 60], "攻击者给的链", "lab-r lab-sm", "t");
lb("lb-restart", up(A.restart.top, 8), "重启", "lab-ink");
lb("lb-addr", up(A.addr.top, 8), "地址表 · 一半攻击者", "lab-cs lab-sm");
lb("lb-addr2", up(A.addr.top, 8), "地址表 · 全是攻击者", "lab-r lab-sm");
lb("lb-lamp", [A.peer.lamp[0] - 30, A.peer.lamp[1]], "灯仍是绿的", "lab-g lab-sm", "r");
lb("lb-geth", up(A.addr.top, 8), "Geth 1.8.0 · 同一网段限数", "lab-ink lab-sm");
lb("lb-anchor", [A.peer.ground[0] - 40, A.peer.ground[1] + 40], "锚点 · 重启时优先恢复", "lab-g lab-sm", "t");
lb("lb-sync", [A.victim.front[0] - 150, A.victim.front[1] - 60], "同步 ✓", "lab-g", "r");
lb("lb-conn", [A.victim.front[0] - 150, A.victim.front[1] + 10], "连接 8 · 新块 ✓", "lab-cs lab-sm", "r");
lb("lb-lag", [A.victim.front[0] - 150, A.victim.front[1] + 70], "落后 / 错误分支", "lab-r lab-sm", "r");
lb("lb-backup", up(A.backup.top, 8), "备用节点 · 不可信", "lab-r lab-sm");
lb("lb-dos", [A.bp.mid[0], A.bp.mid[1] + 40], "DoS → 数据污染", "lab-rs lab-sm", "t");
lb("lb-8545", [A.prpc.center[0] - 70, A.prpc.center[1] - 30], "端口 8545", "lab-r lab-sm", "r");
lb("lb-coins", [rx + 135, ry + 40], "约 3.8 万个 ETH", "lab-r lab-sm", "t");
lb("lb-local", [A.prpc.center[0] - 70, A.prpc.center[1] + 45], "默认：只听本机 ✓", "lab-g lab-sm", "r");
lb("lb-open", [A.prpc.center[0] - 70, A.prpc.center[1] + 120], "运营者自己打开 ✗", "lab-r lab-sm", "r");
lb("lb-fw", [A.fw.ground[0], A.fw.ground[1] + 70], "只放行 P2P 端口", "lab-cs lab-sm", "t");
lb("lb-eng", up(A.eng.top, -10), "Engine API", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 760, y: 110, w: 640 };
const cardB = codeCard("cb", { ...CB, head: "节点的端口", tag: "示意", mono: true, rowHide: true, rows: [
  "--http.addr 127.0.0.1", "--authrpc.addr 127.0.0.1", "--authrpc.jwtsecret jwt.hex"] });
S.curve("cv0", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("portC", A.fw.top), { color: "#e0453a" });
S.curve("cv2", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("portC", A.jwt.top), { color: "#e0453a" });
const ET = 120;
const html = cardB +
  kw("kw-hosts", `<b>2</b> 台主机 · 各 <b>1</b> 个 IP`, { x: 700, y: 160, size: 36, accent: "#e0453a" }) +
  kw("kw-indep", `连接数 <b>≠</b> 独立${gtag("解读")}`, { x: 720, y: 150, size: 40, accent: "#e0453a" }) +
  kw("kw-open", `开头 · 外部 RPC <b>✗</b> → 被替换的节点`, { x: 600, y: 140, size: 30, accent: "#e0453a" }) +
  evt("ev-paper", `来源 · Marcus 等论文（2018）`, { top: ET }) +
  evt("ev-optech", `来源 · Bitcoin Optech`, { top: ET + 4 }) +
  evt("ev-2018", `2018 年<br>BleepingComputer 报道（360 Netlab 发现）`, { top: ET + 8, color: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  atk: w("日蚀攻击", 3), give: w("攻击者给的", 4), rs: w("重启", 5), pick: w("挑选", 6), full: w("填满", 7), all: w("全是攻击者", 7),
  hosts: w("两台主机", 8), geth: w("Geth", 9), anc: w("锚点连接", 10), sync: w("同步状态", 11), conn: w("有连接", 12), lag: w("落后", 12),
  indep: w("不说明", 13), crash: w("崩溃", 14), backup: w("备用节点", 15), dos: w("DoS", 15), scanW: w("扫描", 18), eth: w("3.8", 18),
  local: w("本机", 19), open: w("自己打开", 19), bind: w("只绑", 20), engW: w("Engine API", 21), jwtW: w("JWT", 21),
};
const t = (x) => f(x);
const A_BP = [A.bp.start, A.bp.end].map((q) => `[${f(q[0])},${f(q[1])}]`).join(",");

S.build({
  cam0: "windowB", sub: "连接数正常，不等于来源独立",
  grid: { u0: 2800, u1: 10200, v0: -3700, v1: 4000 }, box: [3200, -3200, 4500, 2800],   // 盖住 windowB / peerC / nodeC / portC / C
  shown: ["#lb-rec", "#lb-x2", "#lb-one"], css, html,
  terms: [
    { id: "t0", t: "P2P 网络", d: "节点之间直接交换区块和交易的网络", at: w("P2P 网络", 2) },
    { id: "t1", t: "日蚀攻击", d: "占满受害节点的全部对等连接", at: w("日蚀攻击", 3) },
    { id: "t2", t: "对等连接", d: "节点和其他节点之间的直连", at: w("对等连接", 3) },
    { id: "t3", t: "JSON-RPC", d: "节点对外提供查询和交易的接口", at: w("JSON-RPC", 18) },
    { id: "t4", t: "Engine API", d: "共识客户端调用执行客户端的认证接口", at: w("Engine API", 21) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 前面是你问节点，节点答错。 —— 窗户（B）横移到节点小屋全区
      tl.set("#win2g", { opacity: 0.45 }, 0); cam(${t(LS[0] + 0.2)}, "C", 2.6);
      out("#lb-rec, #lb-x2, #lb-one", ${t(LS[0] + 0.4)}, 0.3); out("#win2g", ${t(LS[0] + 0.4)}, 0.4);
      // ===== L1 节点自己看到的网络被操纵 —— 受害节点 + 灰色虚线"网络"圈
      pop("#lb-victim", ${t(LS[1] + 0.2)}); fadeIn("#vring", ${t(LS[1] + 0.5)}, 0.5); pop("#lb-net", ${t(LS[1] + 1.2)});
      // ===== L2 P2P 网络 —— 推到插线板，线连向四周的小节点
      out("#lb-victim, #lb-net, #vring", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "panelC", 1.6);
      fadeIn("#p2p", ${t(LS[2] + 1.2)}, 0.5); pop("#lb-peer", ${t(LS[2] + 1.5)});
      // ===== L3 日蚀攻击 —— 三个攻击者节点长出，小节点退场
      [0, 1, 2].forEach((i) => grow("atk" + i, ${t(TM.atk)} + i * 0.2)); out("#p2p", ${t(TM.atk + 0.8)}, 0.4); pop("#lb-atk", ${t(TM.atk + 0.9)});
      // ===== L4 只看到攻击者给的 —— 稍拉远，红色"攻击者给的链"
      out("#lb-atk", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "peerC", 1.0);
      grow("atkch", ${t(TM.give)}); pop("#lb-atkch", ${t(TM.give + 0.5)});
      // ===== L5 关键在重启 —— 全区，闸刀拉下再合上，受害节点灯一灭一亮
      out("#lb-atkch, #lb-peer, #atkch", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "C", 1.0); pop("#lb-restart", ${t(TM.rs)});
      KIT.toggle(tl, "restart", ${t(TM.rs + 0.3)}, false); [0, 1, 2].forEach((i) => KIT.led(tl, "victim-led-" + i, ${t(TM.rs + 0.7)}, "off"));
      KIT.toggle(tl, "restart", ${t(TM.rs + 1.6)}, true); [0, 1, 2].forEach((i) => KIT.led(tl, "victim-led-" + i, ${t(TM.rs + 2.0)} + i * 0.1, "green"));
      // ===== L6 从地址表挑选 —— 回到插线板，抽屉签一半青蓝一半红
      out("#lb-restart", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "panelC", 1.2);
      [0, 1, 2, 3, 4, 5].forEach((i) => X3.mark(tl, "addr", i, ${t(TM.pick)} + i * 0.12, i % 2 ? "red" : "teal")); pop("#lb-addr", ${t(TM.pick + 0.6)});
      // ===== L7 地址表被填满 —— 抽屉签全红，线缆逐根变红，状态灯仍绿（关键画面）
      [0, 2, 4].forEach((i) => X3.mark(tl, "addr", i, ${t(TM.full)} + i * 0.1, "red")); out("#lb-addr", ${t(TM.full)}, 0.15); pop("#lb-addr2", ${t(TM.full + 0.2)});
      X17.peerRed(tl, "peer", ${t(TM.all)}, "all", true, 0.14); pop("#lb-lamp", ${t(TM.all + 1.3)}); bump("#lb-lamp", ${t(TM.all + 2.0)}, 1.12, 2);
      // ===== L8 两台主机、各一个 IP —— 关键词卡 + 来源卡
      pop("#kw-hosts", ${t(TM.hosts)}); fadeIn("#ev-paper", ${t(LS[8] + 0.3)});
      // ===== L9 Geth 1.8.0 限制同一网段 —— 顶层抽屉拉开，红签被弹出
      out("#kw-hosts, #ev-paper, #lb-addr2", ${t(LS[9] - 0.2)}); pop("#lb-geth", ${t(TM.geth)});
      X3.drawer(tl, "addr", 5, ${t(TM.geth + 0.5)}, true, 0.6); X3.clearDrawer(tl, "addr", 5, ${t(TM.geth + 1.3)});
      [5, 3].forEach((i, k) => X3.mark(tl, "addr", i, ${t(TM.geth + 1.6)} + k * 0.2, "teal"));
      // ===== L10 锚点连接 —— 两只绿色锚点插头弹入
      out("#lb-geth", ${t(LS[10] - 0.2)}); X3.drawer(tl, "addr", 5, ${t(LS[10] - 0.2)}, false, 0.4);
      X17.peerMode(tl, "peer", ${t(TM.anc)}, "anchored"); X17.peerAnchor(tl, "peer", ${t(TM.anc + 0.2)}, true);
      pop("#lb-anchor", ${t(TM.anc + 0.6)}); fadeIn("#ev-optech", ${t(LS[10] + 0.3)});
      // ===== L11 同步状态看起来正常 —— 受害节点近景，小屏"同步 ✓"
      out("#lb-anchor, #ev-optech, #lb-lamp", ${t(LS[11] - 0.2)}); X17.peerMode(tl, "peer", ${t(LS[11])}, "eclipsed", 0); X17.peerAnchor(tl, "peer", ${t(LS[11])}, false);
      cam(${t(LS[11])}, "nodeC", 1.4); pop("#lb-sync", ${t(TM.sync)});
      // ===== L12 有连接有新块，只是落后或在错误分支
      pop("#lb-conn", ${t(TM.conn)}); pop("#lb-lag", ${t(TM.lag)}); bump("#lb-lag", ${t(TM.lag + 0.6)}, 1.1, 2);
      // ===== L13 连接数不说明独立 —— 拉到全区，插线板红框 + 关键词
      out("#lb-sync, #lb-conn, #lb-lag", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "C", 1.2);
      fadeIn("#pframe", ${t(TM.indep)}, 0.4); pop("#kw-indep", ${t(TM.indep + 0.2)});
      // ===== L14 节点崩溃 —— 受害节点 broken
      out("#kw-indep, #pframe", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "nodeC", 1.0); KIT.broke(tl, "victim", ${t(w("崩溃", 14) + 0.2)});
      // ===== L15 切到不可信的备用节点 —— 管道改道到红色备用节点，红信封走过去
      grow("backup", ${t(TM.backup)}); pop("#lb-backup", ${t(TM.backup + 0.5)}); grow("bp", ${t(TM.backup + 0.3)});
      X1.walk(tl, "lt", ${t(TM.backup + 0.9)}, 2.4, [${A_BP}]); pop("#lb-dos", ${t(TM.dos)});
      // ===== L16 开头的事件正是这样 —— 回闪小卡
      pop("#kw-open", ${t(LS[16] + 0.1)});
      // ===== L17 节点自己的配置 —— 端口近景，8545 亮红
      out("#lb-backup, #lb-dos", ${t(LS[17] - 0.2)}); out("#kw-open", ${t(LS[17] + 1.0)}); cam(${t(LS[17])}, "portC", 1.4);
      grow("prpc", ${t(LS[17] + 0.8)}); pop("#lb-8545", ${t(LS[17] + 1.5)}); flash("#lb-8545", ${t(LS[17] + 2.0)}, 2);
      // ===== L18 扫描暴露的节点 —— 放大镜扫过，端口吐出金币
      grow("scan", ${t(TM.scanW - 0.2)}); tl.fromTo("#scanmv", { x: -60, y: 30 }, { x: 70, y: -25, duration: 1.6, ease: "sine.inOut", immediateRender: false }, ${t(TM.scanW + 0.3)});
      fadeIn("#coins", ${t(TM.eth - 0.3)}, 0.4); pop("#lb-coins", ${t(TM.eth)}); fadeIn("#ev-2018", ${t(LS[18] + 0.3)});
      // ===== L19 默认只监听本机，接口是运营者自己打开的
      out("#ev-2018", ${t(LS[19] - 0.2)}); pop("#lb-local", ${t(TM.local)}); pop("#lb-open", ${t(TM.open)});
      // ===== L20 只绑内网或本机 —— 防火墙立起，代码卡第 1 行连到防火墙
      out("#lb-local, #lb-open, #lb-coins", ${t(LS[20] - 0.2)}); out("#scan", ${t(LS[20] - 0.2)}, 0.3);
      grow("fw", ${t(LS[20] + 0.1)}); pop("#lb-fw", ${t(LS[20] + 0.8)});
      pop("#cb", ${t(TM.bind - 0.2)}); pop("#cb-r0", ${t(TM.bind)}); draw("cv0", ${t(TM.bind + 0.4)}); KIT.led(tl, "fw-led", ${t(TM.bind + 1.0)}, "green");
      // ===== L21 Engine API 只对共识客户端开放 + JWT —— 两台客户端 + 管道 + 门卡；代码卡第 2–3 行
      out("#cv0, #lb-fw", ${t(LS[21] - 0.2)}); grow("exec", ${t(LS[21])}); grow("cons", ${t(LS[21] + 0.2)}); grow("eng", ${t(TM.engW)});
      pop("#lb-eng", ${t(TM.engW + 0.4)}); fadeIn("#eng-flow", ${t(TM.engW + 0.5)}, 0.3); X1.dash(tl, "eng-flow", ${t(TM.engW + 0.5)}, 3.0, -120);
      pop("#cb-r1", ${t(TM.engW + 0.2)}); pop("#cb-r2", ${t(TM.engW + 0.9)}); grow("jwt", ${t(TM.jwtW)}); draw("cv2", ${t(TM.jwtW + 0.5)});
`,
});
