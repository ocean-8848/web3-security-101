// ep20/seg4「④ 投毒与边缘」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.guardD（BRIEF）。
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
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import { applyM, G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.cdnC

// ---------------------------------------------------------------- 段内镜头
const R0 = L.world.rects;
const XC = {
  Bl: L.fit(L.ZONE_RECTS.B, [100, 290, 1160, 860], 1.4),                       // B 全区，右侧留画中画 / 浏览器网格
  BC: L.fit([R0.npm, R0.pin, R0.ci, R0.leave, R0.conv, ...R0.edges, R0.hour, R0.cdn], [100, 300, 1820, 860], 1.4), // 关键画面 B→C
  BCd: L.fit([R0.npm, R0.pin, R0.ci, R0.leave, R0.conv, ...R0.edges, R0.cdn], [100, 380, 1820, 870], 1.4),        // 防线：顶部留代码卡
  cdnW: L.fit([R0.bucket, ...R0.edges, R0.cdn, R0.apikey, R0.hour, R0.hlog, R0.mag], [100, 300, 1150, 860], 1.4), // C 全区，右侧留用户卡 / 点阵
};
const S = segInit(import.meta.url, { cams: { ...L.CAMS, ...XC }, ext: [X, E1, E2, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
const wrapK = (o, k, dx = 0, dy = 0) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${f(gx + dx)},${f(gy + dy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${svg}</g>`; };
const scA = (key, o, k) => { const [gx, gy] = at(o); for (const n in A[key]) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } };
const P2 = (p) => `[${f(p[0])},${f(p[1])}]`;
const BZ = 74;                                             // 传送带面高
const dataP = (o) => at(o, 0, 0, o.z ?? 0);                // parcel 的 data-px/py
const visP = (o) => at(o, 0, 0, (o.z ?? 0) * (o.scale ?? 1)); // parcel 看上去的落脚点
const tgt = (o, D) => { const a = dataP(o), b = visP(o); return [a[0] + D[0] - b[0], a[1] + D[1] - b[1]]; };
const belt = (du, dv) => ({ u: L.CONV.u + du, v: L.CONV.v + dv, z: 92.5, scale: 0.8 });
const mvWrap = (id) => (svg) => `<g id="${id}" opacity="0">${svg}</g>`;
const cubes = (red) => {                                   // 18 个小包：传送带上两排 × 9
  const cs = [];
  for (const dv of [-26, 26]) for (let i = 0; i < 9; i++) cs.push([L.CONV.u - 220 + i * 55, L.CONV.v + dv]);
  cs.sort((p, q) => (p[1] * 0.41 - p[0] * 0.287) - (q[1] * 0.41 - q[0] * 0.287));
  const C = red ? ["#e0867d", "#c8564b", "#f2aaa2", "#8f2620"] : ["#cfa168", "#b58650", "#e0bb85", "#7d5a30"];
  return cs.map(([u, v]) => {
    const s = 16, h = 30, z = BZ, P = (a, b, c) => P2(Wp(u + a, v + b, z + c)).slice(1, -1);
    return `<polygon points="${P(-s, -s, h)} ${P(s, -s, h)} ${P(s, s, h)} ${P(-s, s, h)}" fill="${C[2]}" stroke="${C[3]}" stroke-width="1"/>
      <polygon points="${P(-s, s, 0)} ${P(s, s, 0)} ${P(s, s, h)} ${P(-s, s, h)}" fill="${C[0]}" stroke="${C[3]}" stroke-width="1"/>
      <polygon points="${P(-s, -s, 0)} ${P(-s, s, 0)} ${P(-s, s, h)} ${P(-s, -s, h)}" fill="${C[1]}" stroke="${C[3]}" stroke-width="1"/>`;
  }).join("");
};
const fileG = (id, p, { red = false, stamp = false } = {}) => `<g id="${id}" data-px="${f(p[0])}" data-py="${f(p[1])}" opacity="0">
  <rect x="${f(p[0] - 16)}" y="${f(p[1] - 42)}" width="32" height="42" rx="3" fill="${red ? "#fde6e3" : "#ffffff"}" stroke="${red ? "#e0453a" : "#1d93ba"}" stroke-width="2.5"/>
  <path d="M${f(p[0] - 9)} ${f(p[1] - 32)}h18M${f(p[0] - 9)} ${f(p[1] - 23)}h18M${f(p[0] - 9)} ${f(p[1] - 14)}h12" stroke="${red ? "#e0453a" : "#2aa3c9"}" stroke-width="2.5"/>
  ${stamp ? `<g id="${id}-st" opacity="0"><circle cx="${f(p[0] + 8)}" cy="${f(p[1] - 14)}" r="13" fill="rgba(224,69,58,0.15)" stroke="#e0453a" stroke-width="3"/><path d="M${f(p[0] + 2)} ${f(p[1] - 20)}l12 12M${f(p[0] + 14)} ${f(p[1] - 20)}l-12 12" stroke="#e0453a" stroke-width="3"/></g>` : ""}</g>`;

// ---------------------------------------------------------------- 世界物件
// 街道：石板路 + 管道（最底层）
{ const Q = L.ROAD, c = [[Q.u0, Q.v0], [7000, Q.v0], [7000, Q.v1], [Q.u0, Q.v1]].map(([u, v]) => P2(Wp(u, v)).slice(1, -1)).join(" ");
  add({ u: Q.u0, v: 0 }, `<polygon points="${c}" fill="#dcd8d0" stroke="#cdc8bd" stroke-width="2"/>`, -1e6); }
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7, flow: true }), -9e5);
{ const a = L.STATIONS.B, b = L.STATIONS.cdn;
  add({ u: 0, v: 0 }, S.hid("piperd", `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}" stroke="#e0453a" stroke-width="9" stroke-dasharray="14 10" stroke-linecap="round" fill="none"/>`), -8e5); }

// D 域名路口（上段终点 guardD 的样子）
put("dns", L.SIGNPOST, X.dnsSignpost(L.SIGNPOST, { id: "dns", domain: "curve.fi" }));
put("real", L.REAL, O.rack(L.REAL, { id: "real", tag: "真服务器" }), 0, { wrap: wrapK(L.REAL, 0.7) });
put("clone", L.CLONE, O.rack(L.CLONE, { id: "clone", tag: "克隆站", state: "attacker", leds: ["red", "red", "red"] }), 0, { wrap: wrapK(L.CLONE, 0.7) });
const certOpts = (id) => ({ id, standing: true, w: 150, h: 190, title: "证书", lines: ["curve.fi", "有效 ✓"] });
put("cert", L.CERT, O.doc(L.CERT, certOpts("cert")));
put("cert2", L.CERT2, O.doc(L.CERT2, certOpts("cert2")));
put("regdesk", L.REGDESK, O.desk(L.REGDESK, { id: "regdesk" }), 0, { wrap: wrapK(L.REGDESK, 0.8) }); scA("regdesk", L.REGDESK, 0.8);
put("regsign", L.REGSIGN, E1.signBoard(L.REGSIGN, { id: "regsign", style: "plate", text: "注册商" }));
// seg3 终态：两把锁缩小 0.5 挂在立杆上；硬件密钥缩小 0.6 放到注册商柜台
const POLE = A.dns.pole, L0P = [POLE[0] - 26, POLE[1] + 10], L1P = [POLE[0] + 26, POLE[1] + 40];
const shrinkTo = (key, o, r, k, to) => { const [gx, gy] = at(o);
  put(key, o, r, 0, { wrap: (sv) => `<g transform="translate(${f(to[0] - gx)},${f(to[1] - gy)})"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${sv}</g></g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; } };
const cOf = (o, r, k) => { const [gx, gy] = at(o), c = r.anchors.center; return [gx + (c[0] - gx) * k, gy + (c[1] - gy) * k]; };
L.LOCKS.forEach((o, i) => { const r = O.padlock(o, { id: "lockD" + i }), c = cOf(o, r, 0.5), T = i ? L1P : L0P, g = at(o);
  shrinkTo("lockD" + i, o, r, 0.5, [g[0] + T[0] - c[0], g[1] + T[1] - c[1]]); });
{ const r = O.hwWallet(L.HWKEY, { id: "hwkey", screenText: "FIDO" }), c = cOf(L.HWKEY, r, 0.6), g = at(L.HWKEY), T = [A.regdesk.center[0] + 40, A.regdesk.center[1] + 30];
  shrinkTo("hwkey", L.HWKEY, r, 0.6, [g[0] + T[0] - c[0], g[1] + T[1] - c[1]]); }
put("bcnD", L.BEACON, O.beacon(L.BEACON, { id: "bcnD" }));
put("backup", L.BACKUP, E1.signBoard(L.BACKUP, { id: "backup", style: "wood", text: "备用域名" }));
put("clk", L.MIGCLOCK, O.clock(L.MIGCLOCK, { id: "clk" }));
const MINI = [[-860, 120], [-760, 190], [-900, 260]].map(([x, y]) => G(...L.ZONE_ANCHOR.D.map((c, j) => c + [x, y][j])));
["compound", "celer", "……"].forEach((d, i) => put("minid" + i, MINI[i], X.dnsSignpost(MINI[i], { id: "minid" + i, domain: d, label: "", scale: 0.55 })));
const B2 = G(...L.ZONE_ANCHOR.D.map((c, j) => c + [-650, 215][j]));
put("bcn2", B2, O.beacon(B2, { id: "bcn2" }));
put("adm", L.ATK_D, O.person(L.ATK_D, { id: "adm", role: "engineer", scale: L.ATK_D.scale }));
lb("lb-lk0", [L0P[0] - 60, L0P[1]], "注册商锁", "lab-cs lab-sm", "r");
lb("lb-lk1", [L1P[0] + 60, L1P[1]], "注册局锁", "lab-cs lab-sm", "l");
lb("lb-sec", up(A.dns.top, 10), "DNSSEC", "lab-cs");
lb("lb-mon", up(A.bcnD.top, 6), "监控：解析 · 委派 · 证书", "lab-g lab-sm");
lb("lb-bak", up(A.backup.top, 6), "提前公布", "lab-g lab-sm");

// B 依赖与构建
put("conv", L.CONV, E2.conveyor(L.CONV, { id: "conv", len: L.CONV.len }));
const PN = L.PARCELS.map((q) => ({ ...q, v: q.v - 28 }));                 // 正常包裹走后排
PN.forEach((o, i) => put("pk" + i, o, E7.parcel(o, { id: "pk" + i, z: o.z, scale: o.scale })));
put("npm", L.NPM, E1.signBoard(L.NPM, { id: "npm", style: "plate", text: "npm 仓库" }));
put("pin", L.PINLOCK, O.padlock(L.PINLOCK, { id: "pin" }), 0, { wrap: mvWrap("pinw") });
put("ci", L.CI, O.rack(L.CI, { id: "ci", tag: "CI 构建" }), 0, { wrap: wrapK(L.CI, 0.7) }); scA("ci", L.CI, 0.7);
put("maint", L.MAINT, O.person(L.MAINT, { id: "maint", role: "engineer", scale: 0.5 }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: 0.5 }));
{ const p = at(L.MAIL);
  put("mail", L.MAIL, O.envelope(L.MAIL, { id: "mail", state: "attacker" }), 0, { wrap: (s) => `<g id="mailh" opacity="0"><g id="mailmv" data-px="${f(p[0])}" data-py="${f(p[1])}">${s}</g></g>` }); }
{ const t0 = A.maint.top, g0 = at(L.MAINT);
  put("mk", L.MAINT, O.key(L.MAINT, { id: "mk" }), 2, { wrap: wrapK(L.MAINT, 0.32, t0[0] - g0[0] + 34, t0[1] - g0[1] - 4) });
  put("mkR", L.MAINT, O.key(L.MAINT, { id: "mkR", state: "attacker" }), 3, { wrap: (s) => `<g id="mkRh" opacity="0">${wrapK(L.MAINT, 0.32, t0[0] - g0[0] + 34, t0[1] - g0[1] - 4)(s)}</g>` }); }
put("leave", L.LEAVE, O.doc(L.LEAVE, { id: "leave", title: "离职清单", standing: true, lines: ["邮箱", "门禁", "代码仓库", "内部系统", "npm 发布"] }));
// 红包裹：新版本 / 三个恶意版本 / 修复版 / 被锁挡住的
const PR = belt(-235, 28), PR3 = [-150, -45, 60].map((du) => belt(du, 28)), PG = belt(-235, 28), PB = { u: L.PINLOCK.u - 120, v: L.PINLOCK.v + 20, z: 0, scale: 0.8 };
const PX = { u: L.NPM.u + 40, v: L.NPM.v + 60, z: 0, scale: 0.8 };      // L9：从 npm 牌下直接飞往 CDN 的那个
put("pr", PR, E7.parcel(PR, { id: "pr", z: PR.z, scale: 0.8, state: "attacker" }), 0, { wrap: mvWrap("prw") });
PR3.forEach((o, i) => put("pr" + (i + 1), o, E7.parcel(o, { id: "pr" + (i + 1), z: o.z, scale: 0.8, state: "attacker" }), 0, { wrap: mvWrap("prw" + (i + 1)) }));
put("pg", PG, E7.parcel(PG, { id: "pg", z: PG.z, scale: 0.8 }), 1, { wrap: mvWrap("pgw") });
put("pb", PB, E7.parcel(PB, { id: "pb", scale: 0.8, state: "attacker" }), 0, { wrap: mvWrap("pbw") });
put("px", PX, E7.parcel(PX, { id: "px", scale: 0.8, state: "attacker" }), 0, { wrap: mvWrap("pxw") });
add(L.CONV, S.hid("mini", cubes(false)), 30);
add(L.CONV, S.hid("miniR", cubes(true)), 31);

// C 托管与 CDN
put("s3", L.BUCKET, O.bucket(L.BUCKET, { id: "s3" }));
L.EDGES.forEach((o, i) => put("e" + i, o, O.rpc(o, { id: "e" + i })));
put("e1r", L.EDGES[1], O.rpc(L.EDGES[1], { id: "e1r", state: "attacker", led: "red" }), 1, { wrap: mvWrap("e1rh") });
put("cdn", L.CDNSIGN, E1.signBoard(L.CDNSIGN, { id: "cdn", style: "plate", text: "CDN" }));
put("akR", L.APIKEY, O.key(L.APIKEY, { id: "akR", state: "attacker" }), 0, { wrap: mvWrap("akRh") });
put("akG", L.APIKEY, O.key(L.APIKEY, { id: "akG", glow: true }), 1, { wrap: mvWrap("akGh") });
const ATKC = S.rel(L.APIKEY, 90, 60);
put("atkC", ATKC, O.person(ATKC, { id: "atkC", role: "attacker", scale: 0.5 }), 0, { wrap: mvWrap("atkCh") });
const BCN = S.rel(L.APIKEY, 150, -40);
put("bcnC", BCN, O.beacon(BCN, { id: "bcnC" }), 0, { wrap: mvWrap("bcnCh") });
put("hg5", L.HOUR5, O.hourglass(L.HOUR5, { id: "hg5" }), 0, { wrap: mvWrap("hg5h") });
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }));
put("hlog", L.HASHLOG, O.ledgerBook(L.HASHLOG, { id: "hlog", scale: 0.7 }));
// 文件：桶 → 三台边缘节点；L16 过边缘脚本被盖红戳；L22 红文件被弹回
const FS = up(A.s3.top, -10), ET = A.e0 ? L.EDGES.map((_, i) => up(A["e" + i].top, -40)) : [];
const files = [0, 1, 2].map((i) => fileG("f" + i, FS)).join("") + fileG("f3", FS, { stamp: true }) + fileG("fR", FS, { red: true });
add(L.EDGES[2], files, 400);

// ---------------------------------------------------------------- 世界标签
lb("lb-maint", up(A.maint.top, 30), "维护者", "lab-cs lab-sm");
lb("lb-mail", up(at(L.MAIL), 60), "请重置 2FA", "lab-r lab-sm");
lb("lb-pr", up(A.pr.top, 10), "新版本", "lab-rs lab-sm");
lb("lb-nolock", up(at(L.PINLOCK), 40), "没有锁版本", "lab-r lab-sm");
PR3.forEach((_, i) => lb("lb-pr" + (i + 1), up(A["pr" + (i + 1)].top, 6), String(i + 1), "lab-rs lab-sm"));
lb("lb-skip", up(A.ci.top, 20), "没经过构建", "lab-r lab-sm");
lb("lb-pg", up(A.pg.top, 10), "修复版 · 约 40 分钟", "lab-gs lab-sm");
lb("lb-hg", up(at(L.HOUR5, 0, 0, 220), 10), "约 5 小时", "lab-r lab-sm");
lb("lb-18", up(at(L.CONV, 0, -40, 130), 10), "chalk · debug 等 18 个包", "lab-rs lab-sm");
lb("lb-dl", at(L.CONV, 0, 120, 0), "周下载量 > 20 亿", "lab-ink lab-sm", "t");
lb("lb-script", up(A.e1.top, 30), "边缘脚本", "lab-rs lab-sm");
lb("lb-ak", up(at(L.APIKEY, 0, 0, 40), 20), "未经授权的 API Key", "lab-rs lab-sm");
lb("lb-inj", at(L.EDGES[1], 0, 60), "11 月起 · 周期性注入", "lab-rs lab-sm", "t");
lb("lb-pin", up(at(L.PINLOCK, 0, 0, 140), 10), "锁定版本", "lab-gs lab-sm");
lb("lb-block", at(PB, 0, 40), "挡在锁外", "lab-r lab-sm", "t");
lb("lb-sri", up(A.e1.top, 30), "哈希一致才执行", "lab-gs lab-sm");
lb("lb-short", at(L.LEAVE, 0, 0, 0), "短期凭证 · 当天回收", "lab-gs lab-sm", "t");
lb("lb-akG", up(at(L.APIKEY, 0, 0, 40), 20), "新密钥 · 最小权限 · 定期轮换", "lab-gs lab-sm");
lb("lb-bcn", up(at(BCN, 0, 0, 130), 10), "变更告警", "lab-cs lab-sm");
// 离职清单：每行右侧的勾
const LV = [0, 1, 2, 3, 4].map((i) => applyM(A.leave.m, 200 - 34, 84 + i * 30));
LV.forEach((p, i) => add(L.LEAVE, S.hid("tk" + i, `<path d="M${f(p[0] - 9)} ${f(p[1] - 2)}l7 8l13 -16" fill="none" stroke="#1f9d55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`), 5));
lb("tkx", applyM(A.leave.m, 200 + 8, 84 + 4 * 30), "未回收", "lab-rs lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const scrP = (cam, p) => S.scr(cam, p).map((v) => Math.round(v));
// 画中画：浏览器页面（L5 / L9）
const pip = (id, x, y, wd) => `<div class="pip hide" id="${id}" style="left:${x}px;top:${y}px;width:${wd}px">
  <div class="pip-bar"><i></i><i></i><i></i><span>DApp 页面</span></div>
  <div class="pip-body"><div class="pip-row">收款地址</div>
    <div class="pip-addr"><span>原收款地址</span><b id="${id}-st"></b></div>
    <div class="pip-addr red hide" id="${id}-a2">攻击者的地址</div>
    <div class="pip-pop hide" id="${id}-pop">授权？</div></div></div>`;
// 用户小卡（cdnW 下，三台边缘节点上方）
const UC = [0, 1, 2].map((i) => scrP("cdnW", up(A["e" + i].top, 50)));
const uchip = (id, p, red, i) => `<div class="uchip${red ? " red" : ""} hide" id="${id}" style="left:${p[0] + 20 + i * 55}px;top:${p[1] - 70}px"><span class="ud"></span>${red ? "授权？" : "用户"}</div>`;
// 点阵卡
const dots = (id, n, cols, color, legend, x, y) => {
  const r = 7, g = 19, rows = Math.ceil(n / cols); let s = "";
  for (let k = 0; k < n; k++) s += `<circle cx="${(k % cols) * g + r + 2}" cy="${Math.floor(k / cols) * g + r + 2}" r="${r}" fill="${color}"/>`;
  return `<div class="dots hide" id="${id}" style="left:${x}px;top:${y}px"><svg width="${cols * g + 4}" height="${rows * g + 4}">${s}</svg><div class="dl"><b>${n}</b> 点 · ${legend}</div></div>`;
};
// 浏览器网格（L13）
const grid = `<div class="bgrid hide" id="bgrid" style="left:1220px;top:300px"><div class="bg-h">一个包能进入的页面 ${gtag("解读")}</div><div class="bg-w">${
  Array.from({ length: 40 }, (_, i) => `<div class="bw" id="bw${i}"><i></i></div>`).join("")}</div></div>`;
const CA = { x: 640, y: 112, w: 780 };
const card = codeCard("cA", { ...CA, head: "锁定版本与完整性校验", tag: "示意", mono: true, rowHide: true, rows: [
  { html: `"connect-kit": "x.y.z"`, chip: "不用 latest", chipCls: "ok" },
  { html: `npm ci`, chip: "按 lockfile 安装", chipCls: "ok" },
  { html: `&lt;script integrity="sha384-…"&gt;`, chip: "哈希不对不执行", chipCls: "ok" }] });
S.curve("cv0", [CA.x - 4, codeRowY(CA.y, 0)], S.scr("BCd", up(at(L.PINLOCK, 0, 0, 60), 0)), { color: "#e0453a" });
S.curve("cv2", [CA.x + CA.w + 4, codeRowY(CA.y, 2)], S.scr("BCd", A.e1.top), { color: "#e0453a" });
S.curve("cvK", S.scr("cdnW", up(at(L.APIKEY, 0, 0, 40), 0)), S.scr("cdnW", A.cdn.center ?? A.cdn.top), { color: "#e0453a" });
const html = ck("ck-day0", "换服务商当天：核查账号 + 多因素认证", { x: 1150, y: 300, w: 710, kind: "g", hide: false }) + pip("pip", 1220, 330, 560) + pip("pip2", 1500, 620, 340) +
  [0, 1, 2].map((i) => uchip("u" + i, UC[i], false, i)).join("") + uchip("u1r", UC[1], true, 1) +
  dots("d60", 60, 15, "#e0453a", "每点约 1 万美元", 680, 112) + dots("d120", 120, 20, "#e0453a", "每点约 100 万美元", 1220, 560) +
  grid + ck("ckLoss", "已确认加密损失：很小", { x: 1220, y: 780, w: 560, kind: "g" }) + card +
  kw("kwCdn", `从 CDN 加载最新版 = <b>不经过你的构建</b>`, { x: 300, y: 112, size: 36, accent: "#e0453a" }) +
  evt("evL", "Ledger Connect Kit · 2023 年 12 月", { color: "#e0453a" }) + evt("srcL", "来源 · Ledger 事件报告", { top: 196 }) +
  evt("srcBC", "来源 · BleepingComputer 报道", { top: 272 }) +
  evt("evN", "chalk / debug 投毒 · 2025 年 9 月", { color: "#e0453a" }) + evt("srcN", "来源 · Aikido、Endor Labs 分析", { top: 196 }) +
  evt("evB", "BadgerDAO · 2021 年", { color: "#e0453a" }) + evt("srcB", "来源 · ForkLog 转述项目方复盘", { top: 196 });
const css = `
  #ck-day0 { }
  .pip { position:absolute; background:#fff; border:3px solid #1c1c1c; border-radius:14px; box-shadow:0 10px 24px rgba(70,60,40,.15); overflow:hidden; font-weight:800; }
  .pip-bar { background:#e9e4da; padding:8px 14px; display:flex; gap:8px; align-items:center; font-size:28px; color:#4a463f; }
  .pip-bar i { width:12px; height:12px; border-radius:50%; background:#c9c2b4; display:inline-block; }
  .pip-bar span { margin-left:8px; }
  .pip-body { padding:14px 20px 18px; position:relative; font-size:30px; color:#1c1c1c; }
  .pip-row { font-size:28px; color:#6d685e; margin-bottom:6px; }
  .pip-addr { position:relative; display:inline-block; padding:4px 12px; border:2px solid #b8b0a1; border-radius:8px; margin:4px 0; }
  .pip-addr b { position:absolute; left:-4px; right:-4px; top:50%; height:4px; background:#e0453a; transform:scaleX(0); transform-origin:0 50%; }
  .pip-addr.red { display:block; width:max-content; color:#c3352b; border-color:#e0453a; background:#fde6e3; }
  .pip-pop { position:absolute; right:16px; bottom:14px; background:#e0453a; color:#fff; padding:6px 18px; border-radius:10px; font-size:28px; }
  .uchip { position:absolute; display:flex; align-items:center; gap:8px; background:#fff; border:3px solid #2aa3c9; border-radius:12px; padding:4px 14px; font-size:28px; font-weight:800; color:#1c1c1c; }
  .uchip .ud { width:16px; height:16px; border-radius:50%; background:#3b3e44; }
  .uchip.red { border-color:#e0453a; background:#e0453a; color:#fff; } .uchip.red .ud { background:#fff; }
  .dots { position:absolute; background:#fffdf8; border-radius:14px; padding:12px 16px; box-shadow:0 10px 24px rgba(70,60,40,.12); }
  .dots .dl { font-size:28px; font-weight:800; color:#1c1c1c; margin-top:6px; } .dots .dl b { color:#e0453a; }
  .bgrid { position:absolute; width:560px; background:#fffdf8; border-radius:14px; padding:12px 16px; box-shadow:0 10px 24px rgba(70,60,40,.12); }
  .bg-h { font-size:28px; font-weight:900; color:#1c1c1c; margin-bottom:10px; }
  .bg-w { display:grid; grid-template-columns:repeat(8, 1fr); gap:10px; }
  .bw { height:40px; border:2.5px solid #e0453a; border-radius:6px; background:#fff; opacity:0; }
  .bw i { display:block; height:9px; background:#f2c2bc; }`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  npm: w("npm", 1), phish: w("钓鱼", 2), sess: w("会话", 2), newv: w("新版本", 3), dapp: w("DApp", 4), pull: w("拉进", 4),
  addr: w("替换", 5), auth: w("授权", 5), ledger: LS[6], miss: w("唯独", 7), three: w("3", 8), cdn9: w("CDN", 9), page9: w("页面", 9),
  fix: w("修复", 10), cache: w("缓存", 11), loss: w("损失", 11), chalk: w("chalk", 12), dl: w("周下载量", 12), small: w("很小", 13), many: w("页面", 13),
  edge: w("边缘节点", 15), near: w("就近", 15), script: w("脚本", 16), rewrite: w("改写", 16), badger: LS[17], key: w("API Key", 18),
  inj: w("注入", 19), part: w("部分用户", 19), money: w("转走", 20), lock: w("锁定", 21), nocdn: w("不从", 21), sri: w("子资源完整性", 22), nohash: w("哈希", 22),
  short: w("短期", 23), revoke: w("当天", 23), rot: w("轮换", 24), alert: w("告警", 24),
};
const t = (x) => f(x);
const PKN = `[${PN.map((o) => "[" + P2(tgt(o, at(o, 40, 0, BZ))) + "]").join(",")}]`;
// 路径：L9 红包裹从 npm 牌下越过 CI，直接落到中间那台边缘节点；L15–L16 文件 → 边缘节点；L21 红包裹被锁挡回；L22 红文件被弹回
const PX_PATH = [tgt(PX, at(L.CI, 0, 0, 520)), tgt(PX, at(L.EDGES[1], 0, 0, 300)), tgt(PX, at(L.EDGES[1], 0, 0, 150))].map(P2).join(",");
const PB_IN = P2(tgt(PB, at(L.PINLOCK, -40, 20))), PB_OUT = P2(tgt(PB, at(PB)));
const PR_IN = P2(tgt(PR, at(L.CONV, 250, 28, BZ)));
const FT = ET.map(P2), FBACK = P2(up(at(L.EDGES[1], -150, 0, 0), 60));

S.build({
  cam0: "guardD", sub: "别人的包，进了你的页面",
  grid: { u0: -500, u1: 7500, v0: -3800, v1: 4000 }, box: [-100, -2200, 6000, 2500],   // 盖住上段终点 guardD + depsB / buildB / cdnC
  shown: ["#lb-lk0", "#lb-lk1", "#lb-sec", "#lb-mon", "#lb-bak"], css, html,
  terms: [
    { id: "t0", t: "npm", d: "JavaScript 最常用的代码包仓库", at: w("npm", 1) },
    { id: "t1", t: "会话", d: "登录后保持身份的凭据", at: w("会话", 2) },
    { id: "t2", t: "DApp", d: "在浏览器里使用的链上应用", at: w("DApp", 4) },
    { id: "t3", t: "边缘节点", d: "CDN 分布在各地的服务器", at: w("边缘节点", 15) },
    { id: "t4", t: "API Key", d: "调用服务接口的密钥", at: w("API Key", 18) },
    { id: "t5", t: "子资源完整性", d: "浏览器先核对脚本哈希再执行", at: w("子资源完整性", 22) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      const drop = (sel, t, dy) => tl.fromTo(sel, { opacity: 0, y: -(dy || 120) }, { opacity: 1, y: 0, duration: 0.55, ease: "bounce.out", immediateRender: false }, t);
      X20.turn(tl, "dns", 0, ${L.SIGN_ANG.clone}, 0.01); X20.red(tl, "dns", 0, true, 0.01); X20.lit(tl, "dns", 0, true, 0.01);
      X20.hijack(tl, "minid0", 0, 0.01); X20.hijack(tl, "minid2", 0, 0.01); KIT.clock(tl, "clk", 0, 0.01, 180);
      out("#lb-lk0, #lb-lk1, #lb-sec, #lb-mon, #lb-bak, #ck-day0", ${t(LS[0] - 0.1)}, 0.3);
      // ===== L0 往里一环，是依赖包：D → B，传送带运转
      cam(${t(LS[0])}, "depsB", 1.5, "power2.inOut"); KIT.belt(tl, "conv", ${t(LS[0] + 0.6)}, 3.0, 160);
      X1.dash(tl, "pipe-flow", ${t(LS[0])}, 8, -400);
      // ===== L1 很多别人写的代码包，来自 npm
      bump("#npm", ${t(TM.npm - 0.2)}, 1.08, 1); KIT.belt(tl, "conv", ${t(LS[1] + 0.4)}, 4.0, 200); const PKN = ${PKN}; [0, 1, 2, 3].forEach((i) => X1.walk(tl, "pk" + i, ${t(LS[1] + 0.4)}, 3.0, PKN[i]));
      // ===== L2 钓鱼维护者，拿到会话
      fadeIn("#mailh", ${t(TM.phish - 0.3)}, 0.3); X1.walk(tl, "mailmv", ${t(TM.phish)}, 1.2, [${P2(S.up(at(L.MAINT, 0, 50), -6))}]);
      pop("#lb-mail", ${t(TM.phish + 0.2)}, 0.25); pop("#lb-maint", ${t(LS[2] + 0.1)}, 0.25);
      KIT.swap(tl, "#mk", "#mkRh", ${t(TM.sess)}, 0.3); bump("#mkRh", ${t(TM.sess + 0.3)}, 1.25, 2);
      // ===== L3 发布带恶意代码的新版本
      out("#lb-mail, #lb-maint, #mailh", ${t(LS[3] - 0.2)}); drop("#prw", ${t(TM.newv - 0.4)}); pop("#lb-pr", ${t(TM.newv + 0.2)}, 0.25);
      // ===== L4 不锁版本 → 下次构建拉进新版本
      cam(${t(LS[4] - 0.1)}, "Bl", 1.0); pop("#lb-nolock", ${t(TM.dapp)}, 0.25); out("#lb-pr", ${t(TM.pull - 0.3)});
      X1.walk(tl, "pr", ${t(TM.pull)}, 1.6, [${PR_IN}]); KIT.belt(tl, "conv", ${t(TM.pull)}, 1.6, 180);
      out("#prw", ${t(TM.pull + 1.5)}, 0.3); KIT.led(tl, "ci-led-0", ${t(TM.pull + 1.6)}, "red"); bump("#ci", ${t(TM.pull + 1.6)}, 1.04, 1);
      // ===== L5 恶意代码挂到钱包接口：画中画页面
      pop("#pip", ${t(LS[5])}, 0.3); tl.to("#pip-st", { scaleX: 1, duration: 0.35 }, ${t(TM.addr)}); pop("#pip-a2", ${t(TM.addr + 0.4)}, 0.25);
      pop("#pip-pop", ${t(TM.auth)}, 0.3);
      // ===== L6 Ledger 前员工被钓鱼
      out("#pip, #lb-nolock", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "buildB", 1.2);
      pop("#evL", ${t(LS[6] + 0.2)}, 0.3); pop("#srcL", ${t(LS[6] + 0.6)}, 0.3);
      // ===== L7 回收了其他权限，唯独漏了 npm
      [0, 1, 2, 3].forEach((i) => fadeIn("#tk" + i, ${t(LS[7] + 0.3)} + i * 0.35, 0.2)); pop("#tkx", ${t(TM.miss + 0.3)}, 0.3); flash("#tkx", ${t(TM.miss + 0.7)}, 2);
      // ===== L8 先后发布 3 个恶意版本
      [1, 2, 3].forEach((i) => { drop("#prw" + i, ${t(TM.three - 0.3)} + (i - 1) * 0.5); pop("#lb-pr" + i, ${t(TM.three)} + (i - 1) * 0.5, 0.2); });
      // ===== L9 关键画面：从 CDN 加载最新版 → 不经过构建，直接进页面
      out("#lb-pr1, #lb-pr2, #lb-pr3", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "BC", 1.4, "power2.inOut");
      fadeIn("#pxw", ${t(TM.cdn9)}, 0.25); X1.walk(tl, "px", ${t(TM.cdn9 + 0.3)}, 1.8, [${PX_PATH}], "power1.inOut");
      fadeIn("#piperd", ${t(TM.cdn9 + 0.6)}, 0.6); pop("#lb-skip", ${t(TM.cdn9 + 0.8)}, 0.25); pop("#kwCdn", ${t(TM.cdn9 + 0.5)}, 0.3);
      bump("#e1", ${t(TM.cdn9 + 2.1)}, 1.06, 1); pop("#pip2", ${t(TM.page9 - 0.3)}, 0.3); tl.set("#pip2-st", { scaleX: 1 }, ${t(TM.page9 - 0.3)});
      pop("#pip2-pop", ${t(TM.page9 + 0.2)}, 0.3);
      // ===== L10 约 40 分钟内发布修复版
      out("#kwCdn", ${t(LS[10] - 0.2)}); drop("#pgw", ${t(TM.fix - 0.2)}); pop("#lb-pg", ${t(TM.fix + 0.3)}, 0.25);
      // ===== L11 CDN 缓存约 5 小时，损失约 60 万美元
      out("#lb-skip", ${t(LS[11] - 0.2)}); fadeIn("#hg5h", ${t(TM.cache - 0.2)}, 0.3); KIT.sand(tl, "hg5", ${t(TM.cache + 0.2)}, 4.0); pop("#lb-hg", ${t(TM.cache + 0.4)}, 0.25);
      pop("#d60", ${t(TM.cache + 0.9)}, 0.3); pop("#srcBC", ${t(TM.loss - 0.6)}, 0.3);
      // ===== L12 2025 年 9 月，18 个包被投毒
      out("#evL, #srcL, #srcBC, #d60, #pip2, #lb-pg, #lb-hg", ${t(LS[12] - 0.25)}); out("#pgw, #pxw, #prw1, #prw2, #prw3, #pk0, #pk1, #pk2, #pk3, #hg5h, #piperd", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "Bl", 1.4, "power2.inOut"); pop("#evN", ${t(LS[12] + 0.6)}, 0.3); pop("#srcN", ${t(LS[12] + 1.0)}, 0.3);
      fadeIn("#mini", ${t(TM.chalk - 0.2)}, 0.4); KIT.swap(tl, "#mini", "#miniR", ${t(TM.chalk + 1.6)}, 0.5); pop("#lb-18", ${t(TM.chalk + 1.8)}, 0.25);
      pop("#lb-dl", ${t(TM.dl)}, 0.25);
      // ===== L13 已确认损失很小，但能进入的页面多到无法统计
      pop("#ckLoss", ${t(TM.small - 0.6)}, 0.3); pop("#bgrid", ${t(TM.many - 0.6)}, 0.3);
      for (let i = 0; i < 40; i++) tl.to("#bw" + i, { opacity: 1, duration: 0.2 }, ${t(TM.many - 0.3)} + i * 0.05);
      // ===== L14 再往里，是 CDN
      out("#evN, #srcN, #ckLoss, #bgrid, #lb-18, #lb-dl, #tkx", ${t(LS[14] - 0.2)}); out("#miniR", ${t(LS[14] + 1.0)}, 0.3); cam(${t(LS[14])}, "cdnW", 1.4, "power2.inOut");
      bump("#cdn", ${t(LS[14] + 1.4)}, 1.06, 1);
      // ===== L15 文件复制三份到边缘节点，就近发给用户
      [0, 1, 2].forEach((i) => fadeIn("#f" + i, ${t(TM.edge - 0.4)}, 0.2));
      X1.walk(tl, "f0", ${t(TM.edge - 0.2)}, 1.1, [${FT[0]}]); X1.walk(tl, "f1", ${t(TM.edge)}, 1.1, [${FT[1]}]); X1.walk(tl, "f2", ${t(TM.edge + 0.2)}, 1.1, [${FT[2]}]);
      out("#f0, #f1, #f2", ${t(TM.edge + 1.4)}, 0.2);
      [0, 1, 2].forEach((i) => { [0, 1, 2].forEach((j) => flash("#e" + i + "-wave-" + j, ${t(TM.near - 0.2)} + j * 0.1, 2, 0.2)); pop("#u" + i, ${t(TM.near)} + i * 0.2, 0.25); });
      // ===== L16 边缘节点运行脚本，改写页面
      pop("#lb-script", ${t(TM.script - 0.3)}, 0.25); fadeIn("#f3", ${t(TM.script)}, 0.2); X1.walk(tl, "f3", ${t(TM.script + 0.2)}, 1.0, [${FT[1]}]);
      tl.to("#f3-st", { opacity: 1, duration: 0.15 }, ${t(TM.rewrite)}); bump("#f3", ${t(TM.rewrite)}, 1.3, 1); out("#f3", ${t(LE[16] - 0.3)}, 0.2);
      // ===== L17 BadgerDAO：Cloudflare 注册流程漏洞
      pop("#evB", ${t(LS[17] + 0.2)}, 0.3); pop("#srcB", ${t(LS[17] + 0.6)}, 0.3);
      // ===== L18 未经授权的 API Key
      fadeIn("#atkCh", ${t(LS[18] + 0.2)}, 0.4); fadeIn("#akRh", ${t(TM.key - 0.6)}, 0.3); pop("#lb-ak", ${t(TM.key - 0.3)}, 0.25); draw("cvK", ${t(TM.key + 0.3)}, 0.6);
      // ===== L19 边缘脚本定期注入，只对部分用户弹出授权
      out("#lb-script, #lb-ak", ${t(LS[19] - 0.2)}); fadeIn("#e1rh", ${t(TM.inj - 0.3)}, 0.4); pop("#lb-inj", ${t(TM.inj)}, 0.25);
      KIT.swap(tl, "#u1", "#u1r", ${t(TM.part)}, 0.3); bump("#u1r", ${t(TM.part + 0.3)}, 1.12, 2);
      // ===== L20 12 月 2 日，转走约 1.2 亿美元
      pop("#d120", ${t(TM.money - 0.2)}, 0.3);
      // ===== L21 锁定依赖版本，不从 CDN 加载最新版
      out("#evB, #srcB, #d120, #u0, #u1r, #u2, #lb-inj, #lb-ak, #cvK", ${t(LS[21] - 0.25)}); out("#e1rh", ${t(LS[21] - 0.2)}, 0.3);
      cam(${t(LS[21])}, "BCd", 1.4, "power2.inOut"); pop("#cA", ${t(LS[21] + 1.2)}, 0.3); pop("#tkx", ${t(LS[21] + 1.4)}, 0.25);
      pop("#cA-r0", ${t(TM.lock - 0.2)}, 0.25); pop("#cA-c0", ${t(TM.lock + 0.2)}, 0.2); pop("#cA-r1", ${t(TM.lock + 0.6)}, 0.25); pop("#cA-c1", ${t(TM.lock + 1.0)}, 0.2);
      draw("cv0", ${t(TM.lock + 0.3)}, 0.6); fadeIn("#pinw", ${t(TM.lock + 0.8)}, 0.3); pop("#lb-pin", ${t(TM.lock + 1.0)}, 0.25);
      fadeIn("#pbw", ${t(TM.nocdn - 0.5)}, 0.2); X1.walk(tl, "pb", ${t(TM.nocdn - 0.3)}, 0.7, [${PB_IN}]); X1.walk(tl, "pb", ${t(TM.nocdn + 0.45)}, 0.5, [${PB_OUT}], "back.out(2)");
      pop("#lb-block", ${t(TM.nocdn + 0.6)}, 0.25);
      // ===== L22 子资源完整性：哈希不对就不执行
      out("#cv0, #lb-block", ${t(LS[22] - 0.2)}); pop("#cA-r2", ${t(TM.sri)}, 0.25); pop("#cA-c2", ${t(TM.sri + 0.4)}, 0.2); draw("cv2", ${t(TM.sri + 0.3)}, 0.6);
      fadeIn("#fR", ${t(TM.nohash - 0.8)}, 0.2); X1.walk(tl, "fR", ${t(TM.nohash - 0.6)}, 0.9, [${FT[1]}]); X1.walk(tl, "fR", ${t(TM.nohash + 0.35)}, 0.6, [${FBACK}], "back.out(2)");
      pop("#lb-sri", ${t(TM.nohash + 0.5)}, 0.25); out("#fR", ${t(LE[22] - 0.2)}, 0.2);
      // ===== L23 发布凭证用短期的，离职当天回收
      out("#cv2, #lb-sri, #lb-pin", ${t(LS[23] - 0.2)}); out("#tkx", ${t(TM.revoke - 0.2)}, 0.2); fadeIn("#tk4", ${t(TM.revoke)}, 0.25); pop("#lb-short", ${t(TM.short)}, 0.25);
      // ===== L24 CDN 密钥最小权限、轮换、告警；停在 cdnC
      out("#cA, #lb-short", ${t(LS[24] - 0.2)}); cam(${t(LS[24])}, "cdnC", 1.4, "power2.inOut");
      out("#atkCh, #akRh", ${t(TM.rot - 0.4)}, 0.3); fadeIn("#akGh", ${t(TM.rot - 0.1)}, 0.3); pop("#lb-akG", ${t(TM.rot + 0.1)}, 0.25);
      fadeIn("#bcnCh", ${t(TM.alert - 0.4)}, 0.3); pop("#lb-bcn", ${t(TM.alert - 0.2)}, 0.25);
`,
});
