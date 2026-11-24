// ep20/seg5「⑤ 只对一人」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.cdnC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   devA         A 开发者工位：桌 + 开发者 + Docker + 代码仓库 + 会话令牌（seg5 L3–L5）
//   depsB        B 依赖传送带 + npm 牌 + 锁 + 维护者 / 攻击者 / 钓鱼邮件（seg4 L0–L5, L21）
//   buildB       B CI 机柜 + 离职清单 + 传送带（seg4 L6–L13）
//   hostC        C S3 桶（+ 第一台边缘节点、放大镜）（seg5 L6）
//   cdnC         C 边缘节点 ×3 + CDN 牌 + API Key + 5 小时沙漏 + 哈希日志（seg4 L14–L24 终点；seg5 起点）
//   dnsD         D 路牌 + 两台机柜（+ 两张证书）（seg3 L0–L8）
//   regD         D 注册商柜台 + 牌 + 攻击者 + 迁移时钟（seg3 L9–L16）
//   guardD       D 两把锁 + 硬件密钥 + 告警灯 + 备用域名牌 + 路牌（seg3 L17–L21 终点；seg4 起点）
//   userE        E 用户 + 浏览器 + 支票 + 钱包（+ 点阵）（seg1 起点 L0–L5；seg6 L0）
//   barE         E 地址栏 + 锁特写，右侧留题卡位（seg1 L9–L11 终点；seg6 L8）
//   contractE    E 用户 + 浏览器 + 合约（seg1 L6–L8；seg2 起点 L0–L5）
//   bankE        E 银行柜台比喻：柜台 + 金库 + 账本 + 三封汇款（seg2 L6–L10）
//   E            E 全区（seg6 L5–L7、L11 拉开）
//   msigF        F 多签全景（seg5 L0–L2）
//   signF        F 签名人 + 硬件钱包 + Safe 前端 + Bybit 牌（seg5 L7–L10, L17–L19）
//   coreF        F 保险柜 + 实现合约 + 门槛表（seg5 L11–L16）
//   toolF        F 独立工具 + 盾牌 + 关卡（+ 第三台硬件钱包，比哈希）（seg5 L20–L23 终点；seg6 起点）
//   A            各区全景（zone framings; seg5 L0 / L7 pans pass through them）
//   B            
//   C            
//   D            
//   F            
//   wide         发布街全景：A → F 全部（seg2 L11–L15 终点；seg3 起点；seg6 L12 结束卡）
// ends static on CAMS.toolF
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { G, dashCurve } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// ---- 段内专用镜头
const R = L.world.rects;
const fz = (X0, Y0) => { const q = G(L.ZONE_ANCHOR.F[0] + X0, L.ZONE_ANCHOR.F[1] + Y0); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const SG_X = [fz(-800, 250), fz(-120, 420)].map((q) => ({ ...q, scale: 0.5 }));   // 第四、第五名签名人（L19）
const HW_X = [fz(-800, 350), fz(-80, 540)];
const MID = [300, 300, 1620, 860];
const CAMS = {
  ...L.CAMS,
  // F 签名人近景：前端 + 签名人 + 硬件钱包（含 L19 新增两人）
  oneF: L.fit([R.safeui, ...R.signers, ...R.hws, ...SG_X.map((q) => L.rect(q, "person")), ...HW_X.map((q) => L.rect(q, "hwWallet"))], MID, 1.4),
  // F 独立工具 + 盾牌 + 关卡，右侧留出代码卡 / 小窗位置（L20–L23）
  toolF2: L.fit([R.laptop, R.shield, R.checkpt, R.hws[1], R.hws[2]], [100, 300, 1130, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E5, E10, E13, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const scaleA = (key, o, k) => { const [gx, gy] = at(o); for (const n in A[key]) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } };
const putW = (key, o, r, k, dy = 0, hidId) => { put(key, o, r, dy, { wrap: (svg) => { const s = wrapK(o, k)(svg); return hidId ? S.hid(hidId, s) : s; } }); scaleA(key, o, k); };
const FT = `font-family="Noto Sans SC, sans-serif"`;

// ---------------------------------------------------------------- 世界物件
// 街道 + 管道
{
  const q = L.ROAD, P = [Wp(q.u0, q.v0), Wp(q.u1, q.v0), Wp(q.u1, q.v1), Wp(q.u0, q.v1)].map((p) => p.map(f).join(",")).join(" ");
  S.add({ u: -2000, v: -2000 }, `<polygon points="${P}" fill="#dedad2" stroke="#d2cdc3" stroke-width="2"/>`, -200000);
}
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7 }), -100000);
// A 开发者工位
const deskScr = (bg, t1, c) => `<rect x="0" y="0" width="148" height="88" fill="${bg}"/><text x="74" y="56" text-anchor="middle" ${FT} font-size="30" font-weight="900" fill="${c}">${t1}</text>`;
put("desk", L.DESK, O.desk(L.DESK, { id: "desk", screen: deskScr("#1c2a33", "代码", "#9fd3e5"), screen2: deskScr("#e0453a", "失陷", "#ffffff") }));
put("dev", L.DEV, O.person(L.DEV, { id: "dev", role: "engineer", scale: L.DEV.scale }));
put("dock", L.DOCKER, E13.container(L.DOCKER, { id: "dock", label: "Docker", tone: "teal", scale: L.DOCKER.scale }));
putW("repo", L.REPO, O.dbLedger(L.REPO, { id: "repo", tag: "代码仓库" }), 0.7);
put("tok", L.TOKEN, O.key(L.TOKEN, { id: "tok" }));
const ATK_A = { u: L.TOKEN.u + 140, v: L.TOKEN.v - 40, scale: 0.55 };
put("atkA", ATK_A, O.person(ATK_A, { id: "atkA", role: "attacker", scale: 0.55 }), 0, { wrap: (s) => S.hid("atkAh", s) });
{ // 红色烟雾：Docker → 工位
  const a0 = A.dock.center, a1 = A.desk.screen ?? A.desk.center;
  const puffs = [0, 0.25, 0.5, 0.75, 1].map((k, i) => `<circle cx="${f(a0[0] + (a1[0] - a0[0]) * k)}" cy="${f(a0[1] + (a1[1] - a0[1]) * k - 30 * Math.sin(k * 3.14))}" r="${22 + i * 4}" fill="#e0453a" opacity="0.32"/>`).join("");
  S.add(L.DOCKER, S.hid("smoke", puffs), 400);
}
// B 依赖与构建（镜头经过）
put("npm", L.NPM, E1.signBoard(L.NPM, { id: "npm", style: "plate", text: "npm 仓库" }));
putW("ci", L.CI, O.rack(L.CI, { id: "ci", tag: "CI 构建" }), 0.7);
// C 托管与 CDN（段首 = 上段段尾）
put("s3", L.BUCKET, O.bucket(L.BUCKET, { id: "s3" }));
L.EDGES.forEach((q, i) => put("e" + i, q, O.rpc(q, { id: "e" + i })));
put("cdn", L.CDNSIGN, E1.signBoard(L.CDNSIGN, { id: "cdn", style: "plate", text: "CDN" }));
put("apik", L.APIKEY, O.key(L.APIKEY, { id: "apik" }));
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }));
put("hour", L.HOUR5, O.hourglass(L.HOUR5, { id: "hour" }));
put("hlog", L.HASHLOG, O.ledgerBook(L.HASHLOG, { id: "hlog", scale: L.HASHLOG.scale }));
{ // S3 里被改的那张 JS 文件
  const p = up(A.s3.top, 14), fl = (id, col) => `<g id="${id}" opacity="0"><path d="M${f(p[0] - 22)} ${f(p[1] - 30)}h32l12 12v48h-44z" fill="${col}" stroke="#ffffff" stroke-width="3"/><text x="${f(p[0])}" y="${f(p[1] + 14)}" text-anchor="middle" ${FT} font-size="16" font-weight="900" fill="#fff">JS</text></g>`;
  S.add(L.BUCKET, fl("s3bad", "#e0453a"), 300);
}
// D / E（L0 镜头经过）
put("dns", L.SIGNPOST, X.dnsSignpost(L.SIGNPOST, { id: "dns", domain: "curve.fi" }));
putW("real", L.REAL, O.rack(L.REAL, { id: "real", tag: "真服务器" }), 0.7);
put("brw", L.BROWSER, O.browserWin(L.BROWSER, { id: "brw", title: "curve.fi", heading: "Curve", button: "连接钱包" }));
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: L.VEND.scale, plate: "已审计" }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: L.USER.scale }));
// F 签名台
put("safe", L.SAFE, O.safe(L.SAFE, { id: "safe", plate: "冷钱包多签", gold: true }));
put("core", L.CORE, E10.coreModule(L.CORE, { id: "core", scale: L.CORE.scale, ver: "V1" }));
put("core2", L.CORE, E10.coreModule(L.CORE, { id: "core2", scale: L.CORE.scale, state: "attacker" }), 2, { wrap: (s) => S.hid("core2h", s) });
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 3, th: 3, thText: "门槛", state: "attacker" }));
putW("sui", L.SAFEUI, O.browserWin(L.SAFEUI, { id: "sui", title: "Safe 网页前端", heading: "转账", button: "确认签名" }), 0.7);
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: q.scale })));
L.HWS.forEach((q, i) => put("hw" + i, q, O.hwWallet(q, { id: "hw" + i, screenText: "0x3f…a9" })));
SG_X.forEach((q, i) => put("sg" + (i + 3), q, O.person(q, { id: "sg" + (i + 3), role: "signer", scale: q.scale }), 0, { grow: true }));
HW_X.forEach((q, i) => put("hw" + (i + 3), q, O.hwWallet(q, { id: "hw" + (i + 3), screenText: "0x3f…a9" }), 0, { grow: true }));
const lapScr = (line, btn, bt) => O.laptopDefaultScreen({ title: "独立工具", line, btn, btnText: bt });
putW("lap", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lap", screen: lapScr(undefined, "#1d93ba", "计算"), screen2: lapScr("0x7c…e1", "#e0453a", "不一致") }), 0.8);
put("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }));
put("gate", L.CHECKPT, O.checkpoint(L.CHECKPT, { id: "gate", n: "审", armUp: true }));
put("bybit", L.BYBIT, E1.signBoard(L.BYBIT, { id: "bybit", style: "plate", text: "Bybit 多签地址" }));
{ // 150 点红点阵（每点约 1000 万美元）
  const [x0, y0] = at(L.DOTS_F), d = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 25; c++) d.push(`<circle cx="${x0 + 8 + c * 16}" cy="${y0 + 8 + r * 16}" r="6" fill="#e0453a"/>`);
  S.add(L.DOTS_F, S.hid("dotsF", d.join("")), 600);
  lb("lb-dots", [x0 + 200, y0 - 6], "约 15 亿美元 · 每点约 1000 万美元", "lab-rs lab-sm");
}
{ // 金条飘出
  const p = A.safe.center, bar = (dx, dy) => `<polygon points="${f(p[0] + dx)},${f(p[1] + dy)} ${f(p[0] + dx + 44)},${f(p[1] + dy - 14)} ${f(p[0] + dx + 60)},${f(p[1] + dy - 4)} ${f(p[0] + dx + 16)},${f(p[1] + dy + 10)}" fill="#d9a520" stroke="#a87a12" stroke-width="2"/>`;
  S.add(L.SAFE, S.hid("gold", bar(-40, 40) + bar(10, 10) + bar(-10, -20)), 500);
}
// 单点：三条（+ 两条）红虚线从硬件钱包汇到前端；前端外红虚线框
const SUI_C = A.sui.center;
const lines = [...L.HWS, ...HW_X].map((q, i) => { const c = dashCurve("ln" + i, A["hw" + i].top, SUI_C, { color: "#e0453a", c1: [A["hw" + i].top[0], A["hw" + i].top[1] - 120], c2: [SUI_C[0] + 40, SUI_C[1] + 80] }); return c.svg; });
S.add(L.SAFE, lines.join(""), 5000);
{
  const q = R.safeui, pad = 14;
  S.add(L.SAFEUI, S.hid("suiX", `<rect x="${q[0] - pad}" y="${q[1] - pad}" width="${q[2] - q[0] + 2 * pad}" height="${q[3] - q[1] + 2 * pad}" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 10"/>`), 5001);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-desk", up(A.desk.top, 8), "开发者电脑", "lab-cs lab-sm");
lb("lb-2fa", up(A.dev.top, 8), "注册验证设备 ✕", "lab-r lab-sm");
lb("lb-tok", up(A.tok.top, 30), "AWS 会话令牌", "lab-ink lab-sm");
lb("lb-s3", up(A.s3.top, 70), "Safe 前端脚本被改", "lab-rs lab-sm");
lb("lb-q", up(A.sui.top, 10), "◆ 是不是目标多签？", "lab-ink");
lb("lb-no", [A.sui.center[0] - 120, A.sui.center[1]], "不是 → 一切正常", "lab-gs lab-sm", "r");
lb("lb-ui", up(A.sui.top, 10), "界面显示：转账", "lab-gs lab-sm");
lb("lb-hash", [A.hw2.top[0] + 30, A.hw2.top[1] + 10], "只看到一串哈希", "lab-ink lab-sm", "l");
lb("lb-core", up(A.core.top, 16), "实现合约被替换", "lab-rs lab-sm");
lb("lb-eth", up(A.safe.top, 10), "约 40 万枚 ETH 类资产", "lab-rs lab-sm");
lb("lb-cond", [A.sui.center[0] + 120, A.sui.center[1] + 40], "只在特定条件下激活", "lab-r lab-sm", "l");
lb("lb-noin", up(A.bybit.top, 6), "Bybit 系统：无入侵证据 ✓", "lab-gs lab-sm");
lb("lb-safe", up(A.core.top, 16), "Safe 称：合约不受影响", "lab-g lab-sm");
lb("lb-one", up(A.sui.top, 18), "单点", "lab-rs");
lb("lb-more", [A.hw4.top[0] + 30, A.hw4.top[1] + 20], `增加签名人 · 仍是同一个前端${gtag("解读")}`, "lab-ink lab-sm", "l");
lb("lb-lap", up(at(L.LAPTOP), 200), "独立工具 · 重新计算哈希", "lab-cs lab-sm");
lb("lb-neq", [A.hw2.top[0], A.hw2.top[1] - 40], "设备 0x3f…a9 ≠ 0x7c…e1", "lab-rs lab-sm");
lb("lb-shd", up(A.shd.top, 6), "例行转账 · 普通调用 ✓", "lab-gs lab-sm");
lb("lb-gate", [at(L.CHECKPT)[0], at(L.CHECKPT)[1] + 60], "委托调用 · 单独审批", "lab-ink lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const sc = (n, p) => S.scr(n, p);
// 代码卡 B（L9 前两行；L20 全卡在右侧）
const CB = { x: 80, y: 330, w: 760 }, CB2 = { x: 1170, y: 300, w: 690 };
const rowsB = [
  { html: `界面显示　转账 · <code>operation 0</code> · <code>CALL</code>` },
  { html: `实际构造　<code>operation 1</code> · <code>DELEGATECALL</code>` },
  { html: `<code>to</code>　未知合约` },
  { html: `设备哈希 ≠ 独立计算的哈希` },
];
const cardB = codeCard("cb", { ...CB, head: "签名人看到的 vs 实际交易", tag: "示意", rows: rowsB.slice(0, 2), rowHide: true });
const cardB2 = codeCard("cb2", { ...CB2, head: "签名人独立解码", tag: "示意", rows: rowsB });
S.curve("cv1", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], sc("signF", A.core.top), { color: "#e0453a" });
S.curve("cv2", [CB2.x - 4, codeRowY(CB2.y, 3)], sc("toolF2", A.hw2.top), { color: "#e0453a", c1: [CB2.x - 200, codeRowY(CB2.y, 3) + 120], c2: [sc("toolF2", A.hw2.top)[0] + 160, sc("toolF2", A.hw2.top)[1] - 40] });
// 小窗 C：S3 桶（L12 / L15）
const fileG = (id, col, x, y, op = 0) => `<g id="${id}" opacity="${op}"><path d="M${x - 20} ${y - 26}h28l12 12v40h-40z" fill="${col}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 10}" text-anchor="middle" ${FT} font-size="15" font-weight="900" fill="#fff">JS</text></g>`;
const pipBucket = O.bucket({ u: 0, v: 0 }, { id: "pb" }).svg;
const pip = `<div class="pip hide" id="pip" style="left:1440px;top:330px;width:410px">
  <div class="ph">小窗 · S3 托管</div>
  <svg data-layout-ignore width="352" height="220" viewBox="-130 -215 260 162">${pipBucket}${fileG("pip-fg", "#1d93ba", 0, -190, 1)}${fileG("pip-fr", "#e0453a", 0, -190)}
    <rect id="pip-x" x="-110" y="-212" width="220" height="156" rx="12" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9" opacity="0"/></svg>
  <div class="pt" id="pip-t1" style="opacity:0">约 2 分钟后换回干净版本</div>
  <div class="pt r" id="pip-t2" style="opacity:0">云存储账号或密钥很可能泄露</div></div>`;
// 小窗 2：发布方哈希比对（L22–L23）
const rpcs = [0, 1, 2].map((i) => `<g transform="translate(${-30 + i * 120},${70 + i * 0}) scale(0.5)">${O.rpc({ u: 0, v: 0 }, { id: "p2r" + i }).svg}</g>`).join("");
const magG = (id, x, y, k = 1) => `<g id="${id}" opacity="0" transform="translate(${x},${y}) scale(${k})"><circle cx="0" cy="0" r="22" fill="#e8f3f7" fill-opacity="0.6" stroke="#3b3e44" stroke-width="6"/><path d="M15 15L36 36" stroke="#3b3e44" stroke-width="9" stroke-linecap="round"/></g>`;
const pip2 = `<div class="pip hide" id="pip2" style="left:1180px;top:320px;width:660px">
  <div class="ph">发布方 · 独立比对哈希</div>
  <svg data-layout-ignore width="632" height="300" viewBox="-170 -175 632 300">
    <g transform="translate(-60,-20) scale(0.8)">${O.bucket({ u: 0, v: 0 }, { id: "pb2" }).svg}</g>${fileG("p2f", "#1d93ba", -60, -150, 1)}
    <g transform="translate(250,-60)"><rect x="-70" y="-60" width="140" height="90" rx="10" fill="#fffdf8" stroke="#1d93ba" stroke-width="3"/><text x="0" y="-18" text-anchor="middle" ${FT} font-size="24" font-weight="900" fill="#1c1c1c">构建产物</text><text x="0" y="14" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="#5f5a50">sha256</text></g>
    ${magG("p2m", 90, -70, 1.2)}
    <g id="p2ok" opacity="0"><circle cx="90" cy="-140" r="22" fill="#1f9d55"/><path d="M79 -140l8 8 15-16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>
    <g id="p2edges" opacity="0">${rpcs}${[0, 1, 2].map((i) => magG("p2m" + i, -30 + i * 120 + 34, 40, 0.6)).join("")}</g>
  </svg>
  <div class="pt" id="p2t1" style="opacity:0">线上文件 = 构建产物 ✓</div>
  <div class="pt" id="p2t2" style="opacity:0">只覆盖那一刻那个位置 → 多处比对 + 留日志</div></div>`;
const html = [
  evt("ev1", "<b>Bybit</b> · 2025 年 2 月", { color: "#e0453a" }),
  evt("src1", `FBI 公告${gtag("监管口径")}`, { top: 198 }),
  evt("src2", `FBI 公告 · 归因朝鲜${gtag("监管口径")}`, { top: 201 }),
  evt("src3", `Safe 初步报告（CryptoSlate 转述）`, { top: 204 }),
  evt("src4", `公开报道`, { top: 207 }),
  evt("src5", `Verichains 分析${gtag("第三方分析")}`, { top: 210 }),
  evt("src6", `Sygnia 分析 · 很可能${gtag("第三方分析")}`, { top: 213 }),
  ck("by0", "路人地址 A · 页面正常", { x: 80, y: 330, w: 520 }),
  ck("by1", "路人地址 B · 页面正常", { x: 80, y: 424, w: 520 }),
  ck("by2", "路人地址 C · 页面正常", { x: 80, y: 518, w: 520 }),
  ck("res", "外部研究者打开 · 一切正常", { x: 1400, y: 680, w: 460 }),
  cardB, cardB2, pip, pip2,
].join("");
const css = `
    .pip { position: absolute; background: #ffffff; border-radius: 16px; border-left: 6px solid #2aa3c9; box-shadow: 0 10px 24px rgba(70,60,40,0.14); padding: 10px 14px 12px; }
    .pip .ph { font-size: 30px; font-weight: 900; color: #1c1c1c; white-space: nowrap; }
    .pip .pt { font-size: 28px; font-weight: 800; color: #1f9d55; white-space: nowrap; margin-top: 4px; }
    .pip .pt.r { color: #c3352b; }
    #pip2 .pt { font-size: 28px; color: #1c1c1c; }
    .k-code code { font-family: "JetBrains Mono", monospace; font-weight: 800; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "cdnC", sub: "只对你一个人显示的假页面",
  grid: { u0: -1400, u1: 13000, v0: -7200, v1: 6800 }, box: [-900, -4000, 11100, 4500],   // 盖住上段终点 cdnC + msigF / devA / hostC / signF / coreF / toolF
  shown: [], css, html,
  terms: [
    { id: "t0", t: "冷钱包", d: "不联网保存私钥的钱包", at: w("冷钱包", 1) },
    { id: "t1", t: "Docker", d: "把程序和运行环境打包在一起的工具", at: w("Docker", 4) },
    { id: "t2", t: "会话令牌", d: "登录后不必再验证的凭据", at: w("会话令牌", 5) },
    { id: "t3", t: "S3", d: "亚马逊的云存储服务", at: w("S3", 6) },
    { id: "t4", t: "DELEGATECALL", d: "用别人的代码改写自己的存储", at: w("DELEGATECALL", 9) },
    { id: "t5", t: "实现合约", d: "代理合约背后真正执行的代码", at: w("实现合约", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 最难发现的篡改，只对一个目标生效。 C → 经 D、E → F 多签全景
      cam(${t(LS[0] + 0.1)}, "msigF", 3.2);
      // ===== L1 Bybit 约 15 亿美元：事件卡 + 150 点
      pop("#ev1", ${t(LS[1])}); fadeIn("#dotsF", ${t(LS[1] + 1.2)}, 0.6); pop("#lb-dots", ${t(LS[1] + 1.6)}); pop("#src1", ${t(LS[1] + 0.6)});
      // ===== L2 FBI 归因朝鲜
      out("#src1", ${t(LS[2] - 0.1)}, 0.15); pop("#src2", ${t(LS[2] + 0.1)});
      // ===== L3 开发者电脑失陷：快速回摇到 A
      out("#lb-dots, #dotsF", ${t(LS[3] - 0.3)}); out("#src2", ${t(LS[3])}, 0.15); pop("#src3", ${t(LS[3] + 0.2)});
      cam(${t(LS[3])}, "devA", 1.4); pop("#lb-desk", ${t(LS[3] + 1.5)}); KIT.swap(tl, "#desk-scr", "#desk-scr2", ${t(LS[3] + 2.2)}, 0.3);
      // ===== L4 受污染的 Docker：门开，红烟流进工位
      X13.door(tl, "dock", ${t(LS[4] + 0.3)}, true, 0.6); X13.inside(tl, "dock", ${t(LS[4] + 0.6)}, true, true); X13.seal(tl, "dock", ${t(LS[4] + 0.6)}, "red");
      fadeIn("#smoke", ${t(LS[4] + 1.0)}, 0.8);
      // ===== L5 验证设备注册失败 → 攻击者拿走会话令牌
      pop("#lb-2fa", ${t(LS[5] + 0.3)}); pop("#lb-tok", ${t(LS[5] + 1.6)}); fadeIn("#atkAh", ${t(LS[5] + 2.2)}, 0.4);
      tl.to("#atkAh, #tok, #lb-tok", { x: 300, y: -110, duration: 1.4, ease: "power2.inOut" }, ${t(LS[5] + 3.4)});
      // ===== L6 S3 上的前端脚本被改
      out("#lb-desk, #lb-2fa, #lb-tok, #smoke", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "hostC", 1.4); pop("#s3bad", ${t(LS[6] + 1.6)}); pop("#lb-s3", ${t(LS[6] + 1.9)});
      // ===== L7 脚本先判断是不是 Bybit 多签地址：一路右移到 F
      out("#lb-s3", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "signF", 2.2); pop("#lb-q", ${t(LS[7] + 2.4)}); bump("#bybit", ${t(LS[7] + 3.0)}, 1.06);
      // ===== L8 不是，就一切正常
      pop("#lb-no", ${t(LS[8])}); [0, 1, 2].forEach((i) => pop("#by" + i, ${t(LS[8])} + i * 0.15));
      // ===== L9 界面显示转账，实际构造 DELEGATECALL
      out("#by0, #by1, #by2", ${t(LS[9] + 0.4)}); out("#lb-no, #lb-q", ${t(LS[9] - 0.2)});
      pop("#cb", ${t(LS[9] + 0.7)}); pop("#cb-r0", ${t(LS[9] + 0.8)}); pop("#cb-r1", ${t(LS[9] + 2.6)}); hot("#cb-r1", ${t(LS[9] + 3.0)}); draw("cv1", ${t(LS[9] + 3.2)});
      // ===== L10 硬件钱包上只看到一串哈希
      out("#cb, #cv1, #lb-ui", ${t(LS[10] - 0.2)}); pop("#lb-hash", ${t(LS[10] + 0.5)});
      [0, 1, 2].forEach((i) => bump("#hw" + i + "-btn-0", ${t(LS[10] + 1.5)} + i * 0.5, 1.3));
      // ===== L11 凑够门槛，实现合约被替换
      out("#lb-hash", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "coreF", 1.2);
      X5.fill(tl, "meter", ${t(LS[11] + 1.3)}, 3, 1.4);
      X10.push(tl, "core", ${t(LS[11] + 3.2)}, [${f(A.core.ground[0] + 120)}, ${f(A.core.ground[1] + 150)}], 1.0); out("#core", ${t(LS[11] + 4.0)}, 0.3);
      fadeIn("#core2h", ${t(LS[11] + 4.2)}, 0.4); pop("#lb-core", ${t(LS[11] + 4.6)});
      // ===== L12 金条转走；小窗 C：约 2 分钟后脚本换回
      out("#lb-core", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "msigF", 1.2);
      KIT.door(tl, "safe", ${t(LS[12] + 1.0)}, 105, 1.0); fadeIn("#gold", ${t(LS[12] + 1.6)}, 0.3);
      tl.to("#gold", { x: 160, y: -200, opacity: 0, duration: 1.8, ease: "power1.in" }, ${t(LS[12] + 2.0)}); pop("#lb-eth", ${t(LS[12] + 1.8)});
      out("#src3", ${t(LS[12] + 0.2)}, 0.15); pop("#src4", ${t(LS[12] + 0.4)});
      pop("#pip", ${t(LS[12] + 2.2)}); tl.set("#pip-fr", { opacity: 1 }, ${t(LS[12] + 2.2)});
      out("#pip-fr", ${t(LS[12] + 3.0)}, 0.4); pop("#pip-t1", ${t(LS[12] + 3.0)});
      // ===== L13 外部研究者看到的一切正常
      out("#pip", ${t(LS[13] + 0.3)}); out("#lb-eth", ${t(LS[13] - 0.2)}); pop("#res", ${t(LS[13] + 0.6)});
      // ===== L14 Verichains：只在特定条件下激活
      out("#res", ${t(LS[14] - 0.2)}); out("#src4", ${t(LS[14])}, 0.15); pop("#src5", ${t(LS[14] + 0.2)});
      pop("#lb-q", ${t(LS[14] + 0.6)}); flash("#lb-q", ${t(LS[14] + 1.0)}, 3); pop("#lb-cond", ${t(LS[14] + 1.4)});
      // ===== L15 Sygnia：云存储账号或密钥很可能泄露
      out("#lb-q, #lb-cond", ${t(LS[15] - 0.2)}); out("#src5", ${t(LS[15])}, 0.15); pop("#src6", ${t(LS[15] + 0.2)});
      tl.set("#pip-t1", { opacity: 0 }, ${t(LS[15])}); pop("#pip", ${t(LS[15] + 0.6)}); fadeIn("#pip-x", ${t(LS[15] + 1.2)}, 0.3); pop("#pip-t2", ${t(LS[15] + 1.4)});
      // ===== L16 Bybit 无入侵证据；Safe 称合约不受影响
      out("#pip", ${t(LS[16] - 0.2)}); pop("#lb-noin", ${t(LS[16] + 0.4)}); pop("#lb-safe", ${t(LS[16] + 3.4)});
      // ===== L17 关键在这里
      out("#lb-noin, #lb-safe, #ev1, #src6", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "oneF", 1.3);
      // ===== L18 所有签名人共用一个前端 = 单点
      [0, 1, 2].forEach((i) => draw("ln" + i, ${t(LS[18] + 0.8)} + i * 0.5, 0.7));
      fadeIn("#suiX", ${t(LS[18] + 2.8)}, 0.3); pop("#lb-one", ${t(LS[18] + 3.0)}, 0.35);
      // ===== L19 增加签名人无法解决
      grow("sg3", ${t(LS[19] + 0.2)}); grow("hw3", ${t(LS[19] + 0.3)}); grow("sg4", ${t(LS[19] + 0.5)}); grow("hw4", ${t(LS[19] + 0.6)});
      draw("ln3", ${t(LS[19] + 1.0)}, 0.7); draw("ln4", ${t(LS[19] + 1.3)}, 0.7); pop("#lb-more", ${t(LS[19] + 1.8)});
      // ===== L20 独立工具重新计算哈希，在硬件钱包上核对
      out("#lb-one, #lb-more, #ln0, #ln1, #ln2, #ln3, #ln4, #suiX", ${t(LS[20] - 0.2)}); cam(${t(LS[20])}, "toolF2", 1.3);
      pop("#lb-lap", ${t(LS[20] + 1.6)}); pop("#cb2", ${t(LS[20] + 2.2)});
      KIT.swap(tl, "#lap-scr", "#lap-scr2", ${t(LS[20] + 4.0)}, 0.3); hot("#cb2-r3", ${t(LS[20] + 4.4)}); draw("cv2", ${t(LS[20] + 4.6)}); pop("#lb-neq", ${t(LS[20] + 5.3)});
      // ===== L21 普通调用 / 委托调用单独审批
      out("#cb2, #cv2, #lb-neq", ${t(LS[21] - 0.2)}); pop("#lb-shd", ${t(LS[21] + 0.4)}); bump("#shd", ${t(LS[21] + 0.6)}, 1.08);
      KIT.arm(tl, "gate", ${t(LS[21] + 2.4)}, false); pop("#lb-gate", ${t(LS[21] + 2.8)});
      // ===== L22 发布方独立比对线上文件与构建产物
      pop("#pip2", ${t(LS[22] + 0.3)}); fadeIn("#p2m", ${t(LS[22] + 1.0)}, 0.2);
      tl.fromTo("#p2m", { x: 0 }, { x: -120, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, ${t(LS[22] + 1.2)});
      pop("#p2ok", ${t(LS[22] + 3.8)}); pop("#p2t1", ${t(LS[22] + 4.0)});
      // ===== L23 只覆盖那一刻那个位置：多处反复比对 + 日志；镜头停在 toolF
      tl.set("#p2t1", { opacity: 0 }, ${t(LS[23] + 0.4)}); fadeIn("#p2edges", ${t(LS[23] + 0.4)}, 0.4);
      [0, 1, 2].forEach((i) => fadeIn("#p2m" + i, ${t(LS[23] + 1.2)} + i * 0.4, 0.2)); pop("#p2t2", ${t(LS[23] + 2.6)});
      out("#pip2, #lb-shd, #lb-gate", ${t(S.TOTAL - 3.2)}, 0.3); cam(${t(S.TOTAL - 2.8)}, "toolF", 1.4);
`,
});
