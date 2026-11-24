// ep26/seg3「③ 四个入口」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.workshopB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整条智能体大街（seg2 L0–L5 放大器、seg6 L16 结束卡）
//   vaultA       A 奖池保险柜 + Freysa + 玩家 + 新会话文件 + 金币 + 点阵（seg1 起点 L0–L7）
//   ruleA        A 提示词文件 + 合约机器 + 转账请求信封（seg1 L8–L11 终点；seg2 起点）
//   aideA        A 右半助理角：新助理 + 支付卡 + 递纸条的人（seg2 L6–L15）
//   crossA       A 五岔路口五块牌（seg2 L16–L20）
//   workshopB    B 智能体 + 五个入口 + 钱包工具 + 链（seg2 L21 终点；seg3 起点 L0–L4）
//   injectB      B Grok + 智能体 + 会员 NFT 卡 + 屏蔽墙 + 20 点点阵（seg3 L5–L9）
//   memoryB      B 记忆柜 + 伪造历史记录 + 智能体（seg3 L10–L14）
//   toolB        B 工具说明手册 + MCP 包 + 两把私钥（seg3 L15–L18）
//   panelB       B 运维面板 + 攻击者 + 回复信封 + 55.5 ETH + 台秤 + 代币（seg3 L19–L24 终点；seg4 起点）
//   meetC        C 笔记本视频会议 + 扩展包裹 + 手机视频 + 换脸面具 + 诈骗集团 + 受害者（seg4 L0–L6）
//   kycC         C 相机 + 护照 + 注入电缆 + 钓鱼信 + 暗语 + 家人 + 换渠道确认 + 点阵（seg4 L7–L18 终点；seg5 起点）
//   benchD       D 阅卷机 + 答题卡 + 审计 AI + 放大镜 + 合约机器 + 沙漏 + 点阵（seg5 L0–L9）
//   oracleD      D 开发机 + 工程师 + 报价机 + 幽灵指针 + 坏账点阵（seg5 L10–L14；代码卡 A 在左侧）
//   supplyD      D 假扩展 + 荒地抢注 + 三张工位 + 内部 AI 机柜（seg5 L15–L18）
//   defendD      D 盾 + 工程师 + 审计 AI + 放大镜（seg5 L19–L20 终点；seg6 起点）
//   gateE        E 加固智能体 + 输入隔离墙 + 三道关卡 + 低额钱包 + 主资产 + 额度表 + 确认设备 + 记忆 / 余额 / 面板（seg6 L0–L9）
//   userE        E 右端用户角（seg6 L10–L11）
//   answerE      E 合约限额机器 + 被拒的信封 + 小提示词文件 + 三道关卡（seg6 L12–L15）
// ends static on CAMS.panelB
import { segInit, ck, kw, evt, gtag, at, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E5, E7, E8, X] });
const { A, put, add, lb, up, LS, w } = S;

const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";
/** B 区本地点（同 layout.mjs 的 zone(6000)） */
const b = (X, Y, extra = {}) => ({ u: Math.round(6000 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y), ...extra });
const sub = (p, q) => [Math.round(p[0] - q[0]), Math.round(p[1] - q[1])];
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
/** put 包一层 <g id="g-key">（可隐藏），k ≠ 1 时绕地面点缩放并换算 anchors */
function P(key, o, r, { k = 1, hide = false, dy = 0, extra = "" } = {}) {
  const [gx, gy] = at(o);
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const fix = (v) => (Array.isArray(v) ? (v.length >= 2 && typeof v[0] === "number" && typeof v[1] === "number" ? sc(v) : v.map(fix)) : v);
  put(key, o, r, dy, { wrap: (svg) => {
    const s = k === 1 ? svg : `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
    return `<g id="g-${key}"${hide ? ' opacity="0"' : ""}>${s}${extra}</g>`;
  } });
  if (k !== 1) for (const n in A[key]) A[key][n] = fix(A[key][n]);
}
const box = ([x0, y0, x1, y1], id = "", pad = 10) =>
  `<rect${id ? ` id="${id}" opacity="0"` : ""} x="${x0 - pad}" y="${y0 - pad}" width="${x1 - x0 + 2 * pad}" height="${y1 - y0 + 2 * pad}" rx="10" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="12 8"/>`;

// ---------------------------------------------------------------- 地面：石板路 + 资金管 + 入口细管 + 粗管
const [U0, U1] = [3300, 9000];
const road = [[U0, -110], [U1, -110], [U1, 110], [U0, 110]].map(([u, v]) => at({ u, v }).join(",")).join(" ");
add({ u: U0, v: 0 }, `<polygon points="${road}" fill="#d9d4ca" stroke="#c6c0b3" stroke-width="2"/>`, -1e5);
const pipeO = { u: U0, v: 0 };
put("mpipe", pipeO, E1.pipe(pipeO, { id: "mpipe", pts: [[0, 0, 4], [U1 - U0, 0, 4]], r: 8 }), at({ u: 6000, v: 0 })[1] - at(pipeO)[1]);
const INS = [L.B_PHONE, L.B_BROWSER, L.B_CABINET, L.B_MANUAL, L.B_PANEL];
const AG = at(L.B_AGENT);
const TUBE = INS.map((o) => [at(o), AG]);
let gsvg = "";
TUBE.forEach(([p, q], i) => {
  const d = `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`;
  gsvg += `<path d="${d}" stroke="#b7bfc2" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  gsvg += `<path id="tf-${i}" d="${d}" stroke="${TEAL}" stroke-width="5" stroke-dasharray="16 12" stroke-linecap="round" fill="none" opacity="0"/>`;
});
const CORE = [AG, at(L.B_HOTW), at(L.B_CHAIN)].map((p) => p.join(" ")).join(" L");
gsvg += `<path d="M${CORE}" stroke="#7f878c" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
gsvg += `<path id="cf" d="M${CORE}" stroke="${TEAL}" stroke-width="8" stroke-dasharray="20 14" stroke-linecap="round" fill="none" opacity="0"/>`;
add({ u: U0, v: 0 }, gsvg, -9e4);

// ---------------------------------------------------------------- 世界物件
const ATK1 = b(300, -500, { scale: 0.5 }), ATK2 = b(-680, 360, { scale: 0.5 });
P("bot", L.B_AGENT, E8.liqBot(L.B_AGENT, { id: "bot", scale: 1.4, scr: "待命" }));
P("hotw", L.B_HOTW, O.hotWallet(L.B_HOTW, { id: "hotw" }), { k: 0.7 });
P("chn", L.B_CHAIN, O.chain(L.B_CHAIN, { id: "chn", n: 3, title: "链上" }), { k: 0.6 });
P("phn", L.B_PHONE, O.phone(L.B_PHONE, { id: "phn" }), { k: 0.7 });
P("brw", L.B_BROWSER, O.browserWin(L.B_BROWSER, { id: "brw", title: "网页" }), { k: 0.45 });
P("cab", L.B_CABINET, E3.slotCabinet(L.B_CABINET, { id: "cab", title: "长期记忆" }), { k: 0.6 });
P("man", L.B_MANUAL, E3.manual(L.B_MANUAL, { id: "man", title: "工具说明", sub: "MCP", pageTitle: "工具说明", pageText: " " }), { k: 0.7 });
P("pnl", L.B_PANEL, E5.funcPanel(L.B_PANEL, { id: "pnl", title: "运维面板", buttons: ["reply", "tip", "post", "queue", "pause"] }), { k: 0.6,
  extra: box(L.rect(L.B_PANEL, "funcPanel"), "pnl-x") });
P("grok", L.B_GROK, E8.liqBot(L.B_GROK, { id: "grok", scale: 1.1, scr: "Grok" }), { hide: true });
P("fw", L.B_FW, E1.firewall(L.B_FW, { id: "fw", len: 120 }), { k: 0.6, hide: true, extra: box(L.rect(L.B_FW, "firewall120"), "fw-x") });
P("nft", L.B_NFT, E5.keycard(L.B_NFT, { id: "nft", scale: 0.55, text: "NFT", color: RED }), { hide: true });
P("ord", L.B_ORDER, E1.letter(L.B_ORDER, { id: "ord", state: "attacker" }), { hide: true });
P("atk1", ATK1, O.person(ATK1, { id: "atk1", role: "attacker", scale: 0.5 }), { hide: true });
P("hist", L.B_HIST, O.doc(L.B_HIST, { id: "hist", w: 130, h: 160, title: "历史记录", state: "attacker", lines: ["▆▆▆▆▆", "▆▆▆", "▆▆▆▆"] }),
  { hide: true, extra: box(L.rect(L.B_HIST, "docFlat"), "", 6) });
P("atk2", ATK2, O.person(ATK2, { id: "atk2", role: "attacker", scale: 0.5 }), { hide: true });
P("pcl", L.B_PARCEL, E7.parcel(L.B_PARCEL, { id: "pcl", scale: 0.9 }));
P("k0", L.B_KEYS[0], O.key(L.B_KEYS[0], { id: "k0" }), { k: 0.6 });
P("k1", L.B_KEYS[1], O.key(L.B_KEYS[1], { id: "k1", state: "attacker" }), { k: 0.6, hide: true });
P("atk3", L.B_ATK, O.person(L.B_ATK, { id: "atk3", role: "attacker", scale: 0.5 }), { hide: true });
L.B_REPLIES.forEach((o, i) => P("rp" + i, o, E1.letter(o, { id: "rp" + i, state: "attacker" }), { hide: true }));
P("eth", L.B_ETH, E7.oddCoin(L.B_ETH, { id: "eth", scale: 0.5, state: "attacker" }), { hide: true });
P("sc", L.B_SCALE, E7.scale(L.B_SCALE, { id: "sc", scale: 0.7, before: 3, after: 3, diff: "一致", diffOk: true }));
L.B_TOKENS.forEach((o, i) => P("tk" + i, o, E7.oddCoin(o, { id: "tk" + i, scale: 0.45 })));
P("sgnB", L.B_SIGN, E1.signBoard(L.B_SIGN, { id: "sgnB", text: "智能体车间", style: "plate" }));
// 20 点点阵（每点约 1 万美元；15 实 + 5 空）
const [DX, DY] = at(L.B_DOTS);
let dots = "";
for (let i = 0; i < 20; i++) {
  const cx = DX + 24 + (i % 10) * 28, cy = DY + 40 + Math.floor(i / 10) * 34;
  dots += `<circle id="dt-${i}" cx="${cx}" cy="${cy}" r="10" fill="${i < 15 ? RED : "none"}" stroke="${RED}" stroke-width="3"/>`;
}
add(L.B_DOTS, S.hid("g-dots", dots));

// ---------------------------------------------------------------- 世界标签
const sm = "lab-cs lab-sm";
lb("lb-bot", up(A.bot.top, 6), "智能体", "lab-cs");
lb("lb-bankr", up(A.bot.top, 6), "Bankr", "lab-rs");
lb("lb-perm", up(A.bot.top, 86), "权限 ↑", "lab-rs lab-sm");
lb("lb-hotw", up(A.hotw.top, 6), "钱包工具", "lab-cs");
lb("lb-ta", A.hotw.ground, "transfer / approve", "lab-ink lab-sm", "t");
lb("lb-chn", up(A.chn.top, 6), "链上", "lab-cs");
["用户消息", "网页", "长期记忆", "工具说明", "运维面板"].forEach((s, i) => {
  const k = ["phn", "brw", "cab", "man", "pnl"][i];
  if (i === 0) lb("lb-in0", A.phn.ground, s, sm, "t"); else lb("lb-in" + i, up(A[k].top, 6), s, sm);
  const fr = [0.3, 0.58, 0.45, 0.45, 0.62][i], [p0, q0] = TUBE[i], m = [p0[0] + (q0[0] - p0[0]) * fr, p0[1] + (q0[1] - p0[1]) * fr];
  lb("lb-inp" + i, m, "输入", sm, "c");
  lb("lb-x" + i, m, "✗", "lab-rs", "c");
});
const plate = (id, o, s) => lb(id, at(o), s, "lab-ink", "c");
plate("lb-p1", b(-600, -200), "1 · 提示注入");
plate("lb-p2", b(-200, 100), "2 · 记忆注入");
plate("lb-p3", b(-420, 330), "3 · 工具和插件");
plate("lb-p4", b(0, 250), "4 · 运维面板");
lb("lb-grok", up(A.grok.top, 6), "Grok", "lab-cs");
lb("lb-nft", up(A.nft.top, 6), "会员 NFT", "lab-r lab-sm");
lb("lb-ord", up(A.ord.top, 6), "转账指令", "lab-r lab-sm");
lb("lb-fw", up(A.fw.top, 6), "屏蔽模型间指令", sm);
lb("lb-fwx", up(A.fw.top, 6), "重写时被删", "lab-rs lab-sm");
lb("lb-d1", [DX - 10, DY + 57], `约 15 万–20 万美元 ${gtag("报道口径")}`, "lab-r lab-sm", "r");
lb("lb-d2", [DX + 150, DY + 112], "约 80% 已归还", "lab-gs lab-sm", "t");
lb("lb-hist", up(A.hist.top, 6), "伪造的历史记录", "lab-r lab-sm");
lb("lb-cab", up(A.cab.top, 6), "长期记忆", sm);
lb("lb-nonew", A.bot.ground, "无新提示", "lab-ink lab-sm", "t");
lb("lb-eliza", up(A.bot.top, 62), "ElizaOS · 研究", "lab-g lab-sm");
lb("lb-man", A.man.ground, "工具说明 · MCP", sm, "t");
lb("lb-hide", A.man.page, "▆▆▆ 隐藏指令（不展示）", "lab-g lab-sm", "c");
lb("lb-k0", up(A.k0.top, 6), "SSH 私钥", "lab-r lab-sm");
lb("lb-pcl", up(A.pcl.top, 6), "钱包 MCP 包", "lab-r lab-sm");
lb("lb-k1", up(A.k1.top, 30), "Solana 私钥", "lab-rs lab-sm");
lb("lb-pnl", up(A.pnl.top, 6), "运维面板", sm);
lb("lb-atk", up(A.atk3.top, 6), "攻击者", "lab-r lab-sm");
lb("lb-rp", up(A.rp2.top, 6), "恶意回复 ×3", "lab-r lab-sm");
lb("lb-eth", up(A.eth.top, 6), "55.5 ETH", "lab-rs");
lb("lb-ai", up(A.pnl.top, 6), `AI 未被说服 ${gtag("维护者称")}`, "lab-g lab-sm");
lb("lb-sc", up(A.sc.top, 6), "钱包状态", sm);
lb("lb-scx", up(A.sc.top, 6), "前 / 后对不上", "lab-rs lab-sm");
lb("lb-amt", A.sc.ground, `约 25 万–44 万美元 ${gtag("媒体口径")}`, "lab-r lab-sm", "t");
lb("lb-tk", [A.tk1.ground[0] + 40, A.tk1.ground[1] + 80], `故障 · 不是注入 ${gtag("据转述")}`, "lab-ink lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const ev = (id, s, top, color = RED) => evt(id, s, { top, color });
const html = [
  kw("kw-any", `任何输入都能影响 <b>转账</b>`, { x: 560, y: 130, size: 38, accent: RED }),
  ev("ev6", "Grok 和 Bankr · 2026 年 5 月 · Base", 120),
  ev("src9", "来源 · Cointelegraph 报道 · OECD AI 事件库", 204, TEAL),
  ev("src14", "来源 · 普林斯顿 · Sentient 论文", 208, TEAL),
  ev("ev17", "Invariant Labs · 2025 年 4 月 · 演示", 124),
  ev("src18", "来源 · OSV 恶意包公告", 212, TEAL),
  ev("ev20", "AIXBT · 2025 年 3 月 · Base", 128),
  ev("src20", "来源 · Cointelegraph 报道 · AI 事件库", 216, TEAL),
  ev("ev23", "Lobstar Wilde · 2026 年 2 月 · Solana", 132),
  ev("src24", "来源 · KuCoin News · Cryptonews 报道", 220, TEAL),
  ck("ck-u", "用户：看不到工具说明", { x: 1320, y: 560, w: 500, kind: "r" }),
  ck("ck-m", "模型：全部读进去", { x: 1320, y: 650, w: 500, kind: "c" }),
].join("\n");
const css = "";
const K0 = S.scr("toolB", A.k0.center), K1 = S.scr("toolB", A.k1.center);
S.curve("cv-k0", K0, [1840, 430], { color: RED });
S.curve("cv-k1", K1, [1840, 470], { color: RED });

// ---------------------------------------------------------------- 词语时刻
const TM = {
  grok: w("Grok", 7), bankr: w("Bankr", 7), wal: w("钱包", 6), nft: w("NFT", 6), perm: w("权限", 6), del: w("删掉", 8), ret: w("归还", 9),
  fake: w("伪造", 11), mem: w("长期记忆", 12), ssh: w("SSH", 17), sol: w("Solana", 18), eth: w("55.5", 20), hold: w("持仓", 23),
};
const t = (x) => f(x);
const V = {
  nft: sub(A.hotw.center, A.nft.center), ord: sub(A.bot.center, A.ord.center),
  histIn: sub(A.cab.drawers[2], A.hist.center), histBot: sub(A.bot.center, A.hist.center),
  k1: sub(A.pcl.top, A.k1.center), eth: sub(at(b(40, 0)), A.eth.ground),
  rp: [0, 1, 2].map((i) => sub(A.atk3.center, A["rp" + i].center)),
};

S.build({
  cam0: "workshopB", sub: "模型读到的每样东西都是入口",
  grid: { u0: 3300, u1: 9000, v0: -3200, v1: 2700 }, box: [3020, -2960, 3700, 2170],   // 盖住本段镜头 workshopB / injectB / memoryB / toolB / panelB（含上一段终点 workshopB）
  shown: [], css, html, hold: 1,
  terms: [
    { id: "t0", t: "NFT", d: "链上独一无二的数字凭证", at: w("NFT", 6) },
    { id: "t1", t: "SSH 私钥", d: "登录服务器用的私钥文件", at: w("SSH 私钥", 17) },
    { id: "t2", t: "运维面板", d: "管理和操控机器人的后台", at: w("运维面板", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      const mv = (sel, t, xy, d, o) => tl.to(sel, Object.assign({ x: xy[0], y: xy[1], duration: d || 0.8, ease: "power2.inOut" }, o || {}), t);
      const flow = (id, t, d) => tl.to("#" + id, { strokeDashoffset: -28 * Math.round(d * 4), duration: d, ease: "none" }, t);
      // ===== L0 持有钱包的智能体：智能体 → 钱包工具 → 链 依次亮起
      pop("#lb-bot", ${t(LS[0] + 0.3)}); bump("#g-bot", ${t(LS[0] + 0.3)}, 1.06); X8.botLamp(tl, "bot", ${t(LS[0] + 0.4)}, 1.4, 1);
      pop("#lb-hotw", ${t(LS[0] + 1.4)}); bump("#g-hotw", ${t(LS[0] + 1.4)}, 1.05);
      pop("#lb-chn", ${t(LS[0] + 2.4)}); bump("#g-chn", ${t(LS[0] + 2.4)}, 1.05);
      // ===== L1 四个入口的细管依次亮青蓝流动
      [0, 1, 2, 3].forEach((i) => { const t0 = ${t(LS[1] + 0.2)} + i * 1.1; fadeIn("#tf-" + i, t0, 0.3); pop("#lb-in" + i, t0, 0.25); flow("tf-" + i, t0, ${t(LS[5] - LS[1])}); });
      // ===== L2 决定调用哪个工具：transfer / approve，粗管通向链
      X8.botScr(tl, "bot", ${t(LS[2] + 0.4)}, "调用工具", false);
      pop("#lb-ta", ${t(LS[2] + 1.6)}); fadeIn("#cf", ${t(LS[2] + 2.0)}, 0.3); flow("cf", ${t(LS[2] + 2.0)}, ${t(LS[24] - LS[2] + 4)});
      // ===== L3 每一种内容都是输入；运维面板第五条细管
      [0, 1, 2, 3].forEach((i) => pop("#lb-inp" + i, ${t(LS[3] + 0.3)}, 0.25));
      fadeIn("#tf-4", ${t(LS[3] + 1.2)}, 0.3); pop("#lb-in4", ${t(LS[3] + 1.2)}); pop("#lb-inp4", ${t(LS[3] + 1.4)}); flow("tf-4", ${t(LS[3] + 1.2)}, ${t(LS[5] - LS[3])});
      // ===== L4 关键画面：五条细管依次闪红，入口处 ✗
      out("#lb-inp0, #lb-inp1, #lb-inp2, #lb-inp3, #lb-inp4", ${t(LS[4] - 0.1)}, 0.2);
      [0, 1, 2, 3, 4].forEach((i) => { const t0 = ${t(LS[4] + 0.3)} + i * 0.55; tl.to("#tf-" + i, { attr: { stroke: "${RED}" }, duration: 0.2 }, t0); pop("#lb-x" + i, t0, 0.2); });
      pop("#kw-any", ${t(LS[4] + 0.5)}); tl.to("#cf", { attr: { stroke: "${RED}" }, duration: 0.3 }, ${t(LS[4] + 3.0)});
      // ===== L5 第一条 · 提示注入 → injectB
      out("#kw-any, #lb-x0, #lb-x1, #lb-x2, #lb-x3, #lb-x4, #lb-in0, #lb-in1, #lb-in2, #lb-in3, #lb-in4, #lb-ta, #lb-chn, #lb-hotw", ${t(LS[5] - 0.2)}, 0.2);
      out("#tf-0, #tf-1, #tf-2, #tf-3, #tf-4", ${t(LS[5] - 0.2)}, 0.3); tl.to("#cf", { attr: { stroke: "${TEAL}" }, duration: 0.3 }, ${t(LS[5])});
      X8.botScr(tl, "bot", ${t(LS[5])}, "待命", false);
      cam(${t(LS[5])}, "injectB", 1.4); fadeIn("#g-grok", ${t(LS[5] + 0.6)}, 0.4); pop("#lb-grok", ${t(LS[5] + 0.9)}); pop("#lb-p1", ${t(LS[5] + 1.0)}, 0.3);
      // ===== L6 会员 NFT 送进钱包 → 权限提升，铭牌换成 Bankr
      fadeIn("#g-atk1", ${t(LS[6] + 0.3)}, 0.4); fadeIn("#g-nft", ${t(TM.wal - 0.2)}, 0.3); bump("#g-atk1", ${t(TM.wal)}, 1.06); X8.botLamp(tl, "bot", ${t(TM.wal + 0.8)}, 1.2, 1, false); pop("#lb-nft", ${t(TM.nft - 0.2)});
      pop("#ev6", ${t(LS[6] + 0.6)});
      out("#lb-nft", ${t(TM.nft + 0.5)}, 0.2); mv("#g-nft", ${t(TM.nft + 0.6)}, [${V.nft}], 0.9); out("#g-nft", ${t(TM.nft + 1.5)}, 0.3); bump("#g-hotw", ${t(TM.nft + 1.5)}, 1.06);
      out("#lb-bot", ${t(TM.perm - 0.3)}, 0.2); pop("#lb-bankr", ${t(TM.perm - 0.1)}); pop("#lb-perm", ${t(TM.perm + 0.1)});
      X8.botScr(tl, "bot", ${t(TM.perm + 0.1)}, "权限↑", true);
      // ===== L7 Grok 吐出转账指令 → Bankr 夹爪张开
      out("#g-atk1, #lb-perm", ${t(LS[7] - 0.2)}, 0.3);
      fadeIn("#g-ord", ${t(TM.grok + 0.2)}, 0.3); pop("#lb-ord", ${t(TM.grok + 0.3)}); X8.botLamp(tl, "grok", ${t(TM.grok)}, 1.0, 1, false);
      out("#lb-ord", ${t(TM.bankr - 0.3)}, 0.2); mv("#g-ord", ${t(TM.bankr - 0.2)}, [${V.ord}], 0.9); out("#g-ord", ${t(TM.bankr + 0.7)}, 0.3);
      X8.claw(tl, "bot", ${t(TM.bankr + 0.8)}, true, 0.4); X8.botScr(tl, "bot", ${t(TM.bankr + 0.8)}, "转账", true);
      tl.to("#cf", { attr: { stroke: "${RED}" }, duration: 0.3 }, ${t(TM.bankr + 0.9)});
      // ===== L8 屏蔽模型间指令的防护：显出 → 红虚线 → 淡出
      fadeIn("#g-fw", ${t(LS[8] + 0.2)}, 0.4); pop("#lb-fw", ${t(LS[8] + 0.5)});
      fadeIn("#fw-x", ${t(TM.del - 0.6)}, 0.3); out("#lb-fw", ${t(TM.del - 0.7)}, 0.2); pop("#lb-fwx", ${t(TM.del - 0.5)});
      out("#g-fw", ${t(TM.del + 0.3)}, 0.5);
      // ===== L9 20 点点阵：约 15 万–20 万美元 → 80% 变绿
      out("#lb-fwx, #ev6", ${t(LS[9] - 0.2)}, 0.2);
      fadeIn("#g-dots", ${t(LS[9] + 0.2)}, 0.4); pop("#lb-d1", ${t(LS[9] + 0.5)}); pop("#src9", ${t(LS[9] + 0.8)});
      for (let i = 0; i < 16; i++) tl.to("#dt-" + i, { attr: { fill: i < 15 ? "${GREEN}" : "none", stroke: "${GREEN}" }, duration: 0.15 }, ${t(TM.ret - 1.6)} + i * 0.05);
      pop("#lb-d2", ${t(TM.ret - 1.0)});
      // ===== L10 第二条 · 记忆注入 → memoryB
      out("#g-dots, #lb-d1, #lb-d2, #src9, #lb-p1, #lb-grok, #lb-bankr, #g-grok", ${t(LS[10] - 0.2)}, 0.2);
      X8.claw(tl, "bot", ${t(LS[10])}, false, 0.4); X8.botScr(tl, "bot", ${t(LS[10])}, "待命", false); tl.to("#cf", { attr: { stroke: "${TEAL}" }, duration: 0.3 }, ${t(LS[10])});
      cam(${t(LS[10])}, "memoryB", 1.4); pop("#lb-bot", ${t(LS[10] + 0.8)}); pop("#lb-p2", ${t(LS[10] + 1.0)}, 0.3); pop("#lb-cab", ${t(LS[10] + 1.2)});
      // ===== L11 攻击者写进伪造的历史记录
      fadeIn("#g-atk2", ${t(LS[11] + 0.2)}, 0.4); bump("#g-atk2", ${t(LS[11] + 2.0)}, 1.06); fadeIn("#g-hist", ${t(TM.fake - 0.3)}, 0.4); pop("#lb-hist", ${t(TM.fake)});
      // ===== L12 存进长期记忆抽屉（标签变红）→ 之后被拉出，当成事实
      out("#lb-hist", ${t(LS[12] - 0.1)}, 0.2); mv("#g-hist", ${t(TM.mem - 0.6)}, [${V.histIn}], 0.8); tl.to("#g-hist", { opacity: 0, duration: 0.25 }, ${t(TM.mem + 0.2)});
      X3.mark(tl, "cab", 2, ${t(TM.mem + 0.3)}, "red");
      X3.drawer(tl, "cab", 2, ${t(TM.mem + 1.0)}, true, 0.4);
      tl.to("#g-hist", { opacity: 1, duration: 0.2 }, ${t(TM.mem + 1.3)}); mv("#g-hist", ${t(TM.mem + 1.4)}, [${V.histBot}], 0.9, { scale: 0.5, transformOrigin: "50% 50%" });
      tl.to("#g-hist", { opacity: 0, duration: 0.25 }, ${t(TM.mem + 2.3)});
      X8.botScr(tl, "bot", ${t(TM.mem + 1.8)}, "事实？", false); X8.botScr(tl, "bot", ${t(TM.mem + 2.6)}, "事实", true);
      // ===== L13 攻击者离开；没有新提示也转账
      out("#g-atk2", ${t(LS[13] + 0.1)}, 0.5); X3.drawer(tl, "cab", 2, ${t(LS[13] + 0.2)}, false, 0.4);
      pop("#lb-nonew", ${t(LS[13] + 0.6)}); X8.claw(tl, "bot", ${t(LS[13] + 1.4)}, true, 0.4);
      tl.to("#cf", { attr: { stroke: "${RED}" }, duration: 0.3 }, ${t(LS[13] + 1.6)}); X8.botScr(tl, "bot", ${t(LS[13] + 1.6)}, "转账", true);
      // ===== L14 普林斯顿 · Sentient 在 ElizaOS 上证明
      out("#lb-bot", ${t(LS[14])}, 0.2); pop("#src14", ${t(LS[14] + 0.3)}); pop("#lb-eliza", ${t(LS[14] + 1.6)});
      // ===== L15 第三条 · 工具和插件 → toolB
      out("#src14, #lb-eliza, #lb-nonew, #lb-p2, #lb-cab, #lb-bot", ${t(LS[15] - 0.2)}, 0.2);
      X8.claw(tl, "bot", ${t(LS[15])}, false, 0.4); X8.botScr(tl, "bot", ${t(LS[15])}, "待命", false); tl.to("#cf", { attr: { stroke: "${TEAL}" }, duration: 0.3 }, ${t(LS[15])});
      X3.mark(tl, "cab", 2, ${t(LS[15])}, "off");
      cam(${t(LS[15])}, "toolB", 1.4); pop("#lb-p3", ${t(LS[15] + 1.0)}, 0.3); pop("#lb-man", ${t(LS[15] + 1.2)});
      // ===== L16 工具说明翻开：隐藏内容 · 用户看不到、模型看得到
      X3.book(tl, "man", ${t(LS[16] + 0.4)}, 170, 1.0); pop("#lb-hide", ${t(LS[16] + 1.6)});
      pop("#ck-u", ${t(LS[16] + 3.4)}); pop("#ck-m", ${t(LS[16] + 4.4)});
      // ===== L17 Invariant Labs 演示：SSH 私钥被读出外传
      out("#ck-u, #ck-m", ${t(LS[17] - 0.2)}, 0.2);
      pop("#ev17", ${t(LS[17] + 0.4)}); bump("#g-man", ${t(LS[17] + 4.2)}, 1.05); pop("#lb-k0", ${t(TM.ssh - 0.9)});
      draw("cv-k0", ${t(TM.ssh - 0.2)}, 0.6); mv("#g-k0", ${t(TM.ssh)}, [260, -170], 1.0, { opacity: 0 }); out("#lb-k0", ${t(TM.ssh + 0.9)}, 0.2);
      // ===== L18 钱包 MCP 包外传 Solana 私钥
      out("#ev17, #cv-k0", ${t(LS[18] + 0.3)}, 0.2);
      pop("#lb-pcl", ${t(LS[18] + 0.4)}); bump("#g-pcl", ${t(LS[18] + 0.6)}, 1.1); pop("#src18", ${t(LS[18] + 0.8)});
      tl.set("#g-k1", { x: ${V.k1[0]}, y: ${V.k1[1]} }, ${t(LS[18] + 2.4)}); fadeIn("#g-k1", ${t(LS[18] + 2.5)}, 0.3); mv("#g-k1", ${t(LS[18] + 2.6)}, [0, 0], 0.8);
      pop("#lb-k1", ${t(TM.sol - 1.0)});
      draw("cv-k1", ${t(TM.sol - 0.4)}, 0.6); mv("#g-k1", ${t(TM.sol - 0.2)}, [260, -170], 0.9, { opacity: 0 }); out("#lb-k1", ${t(TM.sol + 0.6)}, 0.2);
      // ===== L19 第四条 · 运维面板 → panelB
      out("#src18, #cv-k1, #lb-pcl, #lb-man, #lb-hide, #lb-p3", ${t(LS[19] - 0.2)}, 0.2);
      X3.book(tl, "man", ${t(LS[19])}, 0, 0.6);
      cam(${t(LS[19])}, "panelB", 1.4); pop("#lb-p4", ${t(LS[19] + 1.0)}, 0.3); pop("#lb-pnl", ${t(LS[19] + 1.2)});
      // ===== L20 攻击者进面板 → 排进恶意回复 → 55.5 ETH 转走
      out("#lb-p4", ${t(LS[20] - 0.1)}, 0.2);
      pop("#ev20", ${t(LS[20] + 0.4)}); fadeIn("#g-atk3", ${t(LS[20] + 1.0)}, 0.4); pop("#lb-atk", ${t(LS[20] + 1.3)});
      fadeIn("#pnl-x", ${t(LS[20] + 2.2)}, 0.3); flash("#pnl-x", ${t(LS[20] + 2.5)}, 2);
      [0, 1, 2].forEach((i, k) => { const t0 = ${t(LS[20] + 3.4)} + k * 0.45; const v = [${V.rp.map((p) => `[${p}]`).join(",")}][i];
        tl.set("#g-rp" + i, { x: v[0], y: v[1] }, t0); fadeIn("#g-rp" + i, t0, 0.2); mv("#g-rp" + i, t0 + 0.05, [0, 0], 0.7); });
      pop("#lb-rp", ${t(LS[20] + 4.8)});
      tl.set("#g-eth", { x: ${V.eth[0]}, y: ${V.eth[1]} }, ${t(TM.eth - 1.2)}); fadeIn("#g-eth", ${t(TM.eth - 1.2)}, 0.2); mv("#g-eth", ${t(TM.eth - 1.1)}, [0, 0], 1.0, { ease: "power1.out" });
      pop("#lb-eth", ${t(TM.eth)}); pop("#src20", ${t(LS[20] + 5.4)});
      // ===== L21 维护者称：不是在操纵 AI
      out("#lb-pnl", ${t(LS[21] - 0.1)}, 0.2); pop("#lb-ai", ${t(LS[21] + 0.3)});
      // ===== L22 还有一种：根本没人攻击
      out("#ev20, #src20, #lb-ai, #lb-atk, #lb-rp, #g-atk3, #pnl-x", ${t(LS[22] - 0.1)}, 0.4);
      pop("#lb-sc", ${t(LS[22] + 0.6)}); bump("#g-sc", ${t(LS[22] + 0.8)}, 1.06);
      // ===== L23 Lobstar Wilde：钱包状态读数对不上，三枚代币全部转出
      pop("#ev23", ${t(LS[23] + 0.4)});
      X7.read(tl, "sc", ${t(LS[23] + 4.0)}, "after", 0, 0.8); X7.diff(tl, "sc", ${t(LS[23] + 4.8)}, false, "不一致");
      out("#lb-sc", ${t(LS[23] + 4.8)}, 0.2); pop("#lb-scx", ${t(LS[23] + 5.0)});
      [0, 1, 2].forEach((i) => mv("#g-tk" + i, ${t(TM.hold - 1.0)} + i * 0.3, [220, 110], 1.0, { opacity: 0, ease: "power1.in" }));
      // ===== L24 约 25 万–44 万美元 · 据转述是故障，不是注入
      out("#ev23, #lb-scx", ${t(LS[24] - 0.1)}, 0.2);
      pop("#lb-amt", ${t(LS[24] + 0.3)}); pop("#src24", ${t(LS[24] + 1.6)}); pop("#lb-tk", ${t(LS[24] + 3.0)});
`,
});
