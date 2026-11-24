// ep20/seg3「③ 域名劫持」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（BRIEF）。ends static on CAMS.guardD
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
import { G } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E5, E7, E9, E10, E13, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const mid = (i, k) => LS[i] + k * (LE[i] - LS[i]);   // 第 i 句里 k 比例处

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const putW = (key, o, r, extra = "") => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const P = (q) => q.map((v) => v.toFixed(1)).join(",");
// 石板路 + 管道（沿 u 贯穿全街；排在最底层）
const RD = L.ROAD;
add({ u: 30000, v: -9000 }, `<polygon points="${[Wp(RD.u0, RD.v0), Wp(RD.u1, RD.v0), Wp(RD.u1, RD.v1), Wp(RD.u0, RD.v1)].map(P).join(" ")}" fill="#dcd8d0" stroke="#cbc6bc" stroke-width="3"/>`);
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7, flow: true }), -20000);

// 全街其他区（只为全景开场和上段末帧一致；本段不动它们）
put("aDesk", L.DESK, O.desk(L.DESK, { id: "aDesk" }));
put("aDev", L.DEV, O.person(L.DEV, { id: "aDev", role: "engineer", scale: L.DEV.scale }));
put("aDock", L.DOCKER, E13.container(L.DOCKER, { id: "aDock", label: "Docker", scale: L.DOCKER.scale }));
putW("aRepo", L.REPO, O.dbLedger(L.REPO, { id: "aRepo", tag: "代码仓库" }));
put("aTok", L.TOKEN, O.key(L.TOKEN, { id: "aTok" }));
put("bConv", L.CONV, E2.conveyor(L.CONV, { id: "bConv", len: L.CONV.len }));
L.PARCELS.forEach((q, i) => put("bPar" + i, q, E7.parcel(q, { id: "bPar" + i, z: q.z, scale: q.scale })));
put("bNpm", L.NPM, E1.signBoard(L.NPM, { id: "bNpm", style: "plate", text: "npm 仓库" }));
put("bPin", L.PINLOCK, O.padlock(L.PINLOCK, { id: "bPin" }));
putW("bCi", L.CI, O.rack(L.CI, { id: "bCi", tag: "CI 构建" }));
put("bMnt", L.MAINT, O.person(L.MAINT, { id: "bMnt", role: "engineer", scale: L.MAINT.scale }));
put("cBkt", L.BUCKET, O.bucket(L.BUCKET, { id: "cBkt" }));
L.EDGES.forEach((q, i) => put("cEdge" + i, q, O.rpc(q, { id: "cEdge" + i })));
put("cCdn", L.CDNSIGN, E1.signBoard(L.CDNSIGN, { id: "cCdn", style: "plate", text: "CDN" }));
put("cLog", L.HASHLOG, O.ledgerBook(L.HASHLOG, { id: "cLog", scale: L.HASHLOG.scale }));
put("eBrw", L.BROWSER, O.browserWin(L.BROWSER, { id: "eBrw", title: "curve.fi", heading: "Curve", button: "连接钱包" }));
put("eUser", L.USER, O.person(L.USER, { id: "eUser", role: "signer", scale: L.USER.scale }));
put("ePhone", L.PHONE, O.phone(L.PHONE, { id: "ePhone" }));
put("eVend", L.VEND, E1.vending(L.VEND, { id: "eVend", plate: "已审计", scale: L.VEND.scale }));
put("eChq", L.CHEQUE, E9.cheque(L.CHEQUE, { id: "eChq", scale: L.CHEQUE.scale }));
put("fSafe", L.SAFE, O.safe(L.SAFE, { id: "fSafe", plate: "冷钱包多签" }));
put("fCore", L.CORE, E10.coreModule(L.CORE, { id: "fCore", scale: L.CORE.scale }));
put("fMeter", L.METER, E5.thresholdMeter(L.METER, { id: "fMeter" }));
putW("fUi", L.SAFEUI, O.browserWin(L.SAFEUI, { id: "fUi", title: "Safe 网页前端" }));
L.SIGNERS.forEach((q, i) => put("fSig" + i, q, O.person(q, { id: "fSig" + i, role: "signer", scale: q.scale })));
L.HWS.forEach((q, i) => put("fHw" + i, q, O.hwWallet(q, { id: "fHw" + i, screenText: "0x3f…a9" })));
putW("fLap", L.LAPTOP, O.laptop(L.LAPTOP, { id: "fLap" }));
put("fBy", L.BYBIT, E1.signBoard(L.BYBIT, { id: "fBy", style: "plate", text: "Bybit 多签地址" }));

// ---- D 域名路口（本段主场）
put("dns", L.SIGNPOST, X.dnsSignpost(L.SIGNPOST, { id: "dns", domain: "curve.fi", dir: 1 }));
putW("real", L.REAL, O.rack(L.REAL, { id: "real", tag: "真服务器" }));
putW("clone", L.CLONE, O.rack(L.CLONE, { id: "clone", tag: "克隆站", state: "attacker", leds: ["red", "red", "red"] }));
const certOpts = (id) => ({ id, standing: true, w: 150, h: 190, title: "证书", lines: ["curve.fi", "有效 ✓"] });
put("cert", L.CERT, O.doc(L.CERT, certOpts("cert")));
put("cert2", L.CERT2, O.doc(L.CERT2, certOpts("cert2")), 0, { grow: true });
const scrN = `<rect width="148" height="88" fill="#e8f5fa"/><text x="74" y="40" text-anchor="middle" font-size="17" font-weight="800" fill="#1d93ba" font-family="Noto Sans SC">注册商后台</text><text x="74" y="66" text-anchor="middle" font-size="13" fill="#555" font-family="Noto Sans SC">curve.fi · 解析</text>`;
const scrR = `<rect width="148" height="88" fill="#fbe3e0"/><text x="74" y="40" text-anchor="middle" font-size="17" font-weight="800" fill="#e0453a" font-family="Noto Sans SC">已被控制</text><text x="74" y="66" text-anchor="middle" font-size="13" fill="#e0453a" font-family="Noto Sans SC">解析 → 克隆站</text>`;
putW("reg", L.REGDESK, O.desk(L.REGDESK, { id: "reg", screen: scrN, screen2: scrR }));
put("regSign", L.REGSIGN, E1.signBoard(L.REGSIGN, { id: "regSign", style: "plate", text: "注册商" }));
put("atk", L.ATK_D, O.person(L.ATK_D, { id: "atk", role: "attacker", scale: L.ATK_D.scale }), 0, { wrap: (s) => `<g id="atkw" opacity="0">${s}</g>` });
// 锁、硬件密钥缩小后再挂上去（包一层：外层 id 负责位移，内层绕地面点缩放）
const shrink = (key, o, r, gid, k) => { const [gx, gy] = at(o);
  put(key, o, r, 0, { wrap: (s) => `<g id="${gid}" opacity="0"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${s}</g></g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } };
L.LOCKS.forEach((q, i) => shrink("lk" + i, q, O.padlock(q, { id: "lk" + i }), "lkw" + i, 0.5));
shrink("hwk", L.HWKEY, O.hwWallet(L.HWKEY, { id: "hwk", screenText: "FIDO" }), "hwkw", 0.6);
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }), 0, { grow: true });
put("bak", L.BACKUP, E1.signBoard(L.BACKUP, { id: "bak", style: "wood", text: "备用域名" }), 0, { grow: true });
put("clk", L.MIGCLOCK, O.clock(L.MIGCLOCK, { id: "clk" }), 0, { grow: true });
// L14：三块小路牌（其他项目的域名），放在注册商柜台左后
const MINI = [[-860, 120], [-760, 190], [-900, 260]].map(([x, y]) => G(...L.ZONE_ANCHOR.D.map((c, j) => c + [x, y][j])));
const MINI_D = ["compound", "celer", "……"];
MINI.forEach((q, i) => put("mini" + i, q, X.dnsSignpost(q, { id: "mini" + i, domain: MINI_D[i], label: "", scale: 0.55 }), 0, { grow: true }));
const B2 = G(...L.ZONE_ANCHOR.D.map((c, j) => c + [-650, 215][j]));
put("bcn2", B2, O.beacon(B2, { id: "bcn2" }), 0, { grow: true });
put("adm", L.ATK_D, O.person(L.ATK_D, { id: "adm", role: "engineer", scale: L.ATK_D.scale }), 0, { grow: true });
// L12 红色虚线框：注册商柜台
{ const [gx, gy] = at(L.REGDESK);
  add(L.SIGNPOST, S.hid("regBox", `<rect x="${gx - 140}" y="${gy - 240}" width="280" height="320" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 10"/>`), 900); }

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const ARM = A.dns.arm, POLE = A.dns.pole;
lb("q1", ARM, "?", "lab-cs", "c");
lb("lb-real", up(A.real.top, 8), "真服务器", "lab-g lab-sm");
lb("lb-clone", up(A.clone.top, 8), "克隆站", "lab-r lab-sm");
lb("lb-c1", up(A.cert.top, 8), "有效证书", "lab-gs lab-sm");
lb("lb-c2", up(A.cert2.top, 8), "有效证书", "lab-gs lab-sm");
lb("lb-here", up(A.clone.top, 50), "锁 = 连上了此刻这台", "lab-cs");
lb("lb-reg", up(A.reg.top, 10), "注册商", "lab-ink lab-sm");
lb("lb-deleg", up(A.dns.top, 10), "委派 → 攻击者服务器", "lab-r");
lb("lb-risk", up(A.reg.top, 70), "注册商 = 要管理的风险", "lab-r");
lb("lb-gd", up(A.regSign.top, 6), "Google Domains", "lab-ink lab-sm");
lb("lb-sq", up(A.regSign.top, 6), "→ Squarespace", "lab-ink lab-sm");
lb("lb-mig", [A.clk.ground[0], A.clk.ground[1] + 10], "迁移 · 2024 年 7 月", "lab-cs lab-sm", "t");
lb("lb-defi", up(A.mini0.top, 70), "多个 DeFi 项目", "lab-r lab-sm");
lb("lb-celer", up(A.bcn2.top, 6), "监控拦下 ✓", "lab-g lab-sm");
const L0P = [POLE[0] - 26, POLE[1] + 10], L1P = [POLE[0] + 26, POLE[1] + 40];
lb("lb-lk0", [L0P[0] - 60, L0P[1]], "注册商锁", "lab-cs lab-sm", "r");
lb("lb-lk1", [L1P[0] + 60, L1P[1]], "注册局锁", "lab-cs lab-sm", "l");
lb("lb-hwk", up(A.reg.top, 10), "硬件密钥登录", "lab-cs lab-sm");
lb("lb-adm", up(A.adm.top, 6), "仅少数人", "lab-cs lab-sm");
lb("lb-sec", up(A.dns.top, 10), "DNSSEC", "lab-cs");
lb("lb-mon", up(A.bcn.top, 6), "监控：解析 · 委派 · 证书", "lab-g lab-sm");
lb("lb-bak", up(A.bak.top, 6), "提前公布", "lab-g lab-sm");
// 锁 / 硬件密钥的位移（世界画布 px）
const mv = (from, to) => ({ x: Math.round(to[0] - from[0]), y: Math.round(to[1] - from[1]) });
const LK0 = mv(A.lk0.center, L0P), LK1 = mv(A.lk1.center, L1P), HWK = mv(A.hwk.center, [A.reg.center[0] + 40, A.reg.center[1] + 30]);
const Q0 = mv(Wp(L.SIGNPOST.u + 1100, L.PIPE_V, L.PIPE_Z + 60), ARM);   // 问号从 E 方向沿管道飞来

// ---------------------------------------------------------------- 屏幕层卡片
const IB = { x: 680, y: 130, w: 440 };   // 浏览器小窗（E 区不在画面里）
const lockSvg = (c) => `<svg width="18" height="22" viewBox="0 0 18 22"><path d="M4 10V6a5 5 0 0 1 10 0v4" fill="none" stroke="${c}" stroke-width="2.6"/><rect x="1" y="9" width="16" height="12" rx="3" fill="${c}"/></svg>`;
const html = `<div class="ib hide" id="ib" style="left:${IB.x}px;top:${IB.y}px;width:${IB.w}px">
  <div class="ib-bar">${lockSvg("#1f9d55")}<span class="ib-url">https://curve.fi</span></div>
  <div class="ib-page"><span class="ib-h">Curve</span><span class="ib-btn" id="ib-b1">连接钱包</span><span class="ib-btn ib-red hide" id="ib-b2">授权</span></div>
  <div class="ib-chips"><span class="ib-chip hide" id="ib-c0">✓ 域名</span><span class="ib-chip hide" id="ib-c1">✓ 锁</span><span class="ib-chip hide" id="ib-c2">✓ 证书</span></div>
</div>`
  + kw("kw-q", `地址对 + 有锁 = 真页面<b>？</b>`, { x: 1250, y: 132, size: 36, accent: "#2aa3c9" })
  + kw("kw-no", `地址对 + 有锁 = 真页面？<b>不能</b>`, { x: 1180, y: 136, size: 36, accent: "#e0453a" })
  + evt("ev-curve", `<b>Curve 域名劫持</b> · 2025 年 5 月`, { color: "#e0453a" })
  + evt("ev-src1", `${gtag("来源")} Curve 官方说明`, { top: 200 })
  + evt("ev-src2", `${gtag("来源")} The Block 报道`, { top: 292 })
  + ck("ck-new", "Curve：引导用户到新域名", { x: 1290, y: 420, w: 570, kind: "c", icon: "→" })
  + ck("ck-slow", "公开批评注册商响应迟缓", { x: 1290, y: 490, w: 570, kind: "r", icon: "!" })
  + evt("ev-mig", `<b>域名业务迁移</b> · 2024 年 7 月`, { top: 124 })
  + evt("ev-src3", `${gtag("来源")} BleepingComputer、The Block 报道`, { top: 204 })
  + ck("ck-mfa", `迁移期多因素认证失效 ${gtag("研究者观点")}`, { x: 1230, y: 560, w: 630, kind: "n", icon: "?" })
  + ck("ck-root", "官方根因：未公布", { x: 1230, y: 630, w: 630, kind: "n", icon: "?" })
  + ck("ck-day", "换服务商当天：核查账号 + 多因素认证", { x: 1150, y: 300, w: 710, kind: "g" });
const css = `
  .ib { position:absolute; background:#fff; border-radius:14px; box-shadow:0 10px 24px rgba(70,60,40,.16); border:2px solid #d9d3c7; padding:10px 14px 12px; font-family:"Noto Sans SC",sans-serif; }
  .ib-head { font-size:15px; color:#888; margin-bottom:6px; }
  .ib-bar { display:flex; align-items:center; gap:10px; background:#f1efea; border-radius:20px; padding:6px 14px; }
  .ib-url { font-family:"JetBrains Mono",monospace; font-size:28px; font-weight:700; color:#1c1c1c; }
  .ib-page { position:relative; display:flex; align-items:center; justify-content:space-between; padding:14px 6px 6px; height:58px; }
  .ib-h { font-size:30px; font-weight:900; }
  .ib-btn { position:absolute; right:6px; top:12px; background:#1d93ba; color:#fff; font-weight:800; font-size:28px; border-radius:10px; padding:4px 18px; }
  .ib-btn.ib-red { background:#e0453a; }
  .ib-chips { display:flex; gap:10px; margin-top:8px; height:44px; }
  .ib-chip { background:#e3f4ea; color:#1f9d55; font-weight:800; font-size:28px; border-radius:18px; padding:2px 14px; }
`;
const LOCK_XY = [IB.x + 32, IB.y + 34];
S.curve("cv-ok", S.scr("dnsD", A.real.center), [1930, 120], { color: "#2aa3c9" });
S.curve("cv-bad", S.scr("dnsD", A.clone.center), [1930, 150], { color: "#e0453a", c1: [900, 120], c2: [1500, 60] });
S.curve("cv-lock", [LOCK_XY[0], LOCK_XY[1] + 12], S.scr("dnsD", A.clone.top), { color: "#2aa3c9" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "wide", sub: "域名对了，服务器换了",
  grid: { u0: -2600, u1: 13100, v0: -8000, v1: 8100 }, box: [-900, -4500, 10500, 6000],   // 盖住上段终点 wide + dnsD / regD / guardD
  shown: [], css, html,
  terms: [
    { id: "t0", t: "DNS", d: "把域名翻译成服务器地址的系统", at: w("DNS", 1) },
    { id: "t1", t: "注册商", d: "替你登记和管理域名的公司", at: w("注册商", 2) },
    { id: "t2", t: "证书", d: "证明网站拥有这个域名的电子凭证", at: w("证书", 6) },
    { id: "t3", t: "委派", d: "指定由哪台服务器负责解析", at: w("委派", 10) },
    { id: "t4", t: "注册局锁", d: "在域名管理机构一层锁住，改动要人工核验", at: w("注册局锁", 17) },
    { id: "t5", t: "DNSSEC", d: "给解析结果加签名，防止被伪造", at: w("DNSSEC", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先看链路最外面的一环，域名。
      cam(${t(LS[0] + 0.2)}, "dnsD", 2.2, "power2.inOut");
      X20.turn(tl, "dns", ${t(LS[0] + 0.3)}, ${L.SIGN_ANG.real}, 0.6);
      pop("#lb-real, #lb-clone", ${t(LS[0] + 2.5)});
      // ===== L1 浏览器先问 DNS，这个域名指向哪台服务器。
      tl.fromTo("#q1", { x: ${Q0.x * -1}, y: ${Q0.y * -1}, opacity: 1 }, { x: 0, y: 0, opacity: 1, duration: 1.3, ease: "power2.inOut", immediateRender: false }, ${t(LS[1] + 0.2)});
      out("#q1", ${t(LS[1] + 1.6)}); X20.lit(tl, "dns", ${t(LS[1] + 1.5)}); bump("#dns-arm", ${t(LS[1] + 1.5)}, 1.08, 1);
      draw("cv-ok", ${t(mid(1, 0.7))}, 0.8);
      // ===== L2 攻击者控制域名注册商的账号，或者攻破注册商本身。
      X20.lit(tl, "dns", ${t(LS[2] - 0.3)}, false); out("#lb-real, #lb-clone, #cv-ok", ${t(LS[2] - 0.2)});
      cam(${t(LS[2])}, "regD", 1.3, "power2.inOut"); pop("#lb-reg", ${t(LS[2] + 1.2)});
      tl.fromTo("#atkw", { x: 160, y: 80, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.0, ease: "power2.out", immediateRender: false }, ${t(LS[2] + 1.3)});
      KIT.swap(tl, "#reg-scr", "#reg-scr2", ${t(LS[2] + 2.4)}); flash("#reg-scr2", ${t(LS[2] + 2.7)}, 2);
      // ===== L3 再把解析记录，指向自己的服务器。
      out("#lb-reg", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "dnsD", 1.2, "power2.inOut");
      pop("#lb-real, #lb-clone", ${t(LS[3] + 1.2)});
      X20.turn(tl, "dns", ${t(LS[3] + 1.3)}, ${L.SIGN_ANG.clone}, 1.0); X20.red(tl, "dns", ${t(LS[3] + 1.7)});
      bump("#lb-clone", ${t(LS[3] + 2.3)}, 1.15, 1);
      // ===== L4 你访问正确的域名，打开的却是克隆页面。
      fadeIn("#ib", ${t(LS[4] + 0.1)}, 0.3); draw("cv-bad", ${t(LS[4] + 0.5)}, 0.9);
      KIT.swap(tl, "#ib-b1", "#ib-b2", ${t(LS[4] + 1.4)}, 0.4); bump("#ib-b2", ${t(LS[4] + 1.7)}, 1.15, 1);
      KIT.swap(tl, "#reg-scr2", "#reg-scr", ${t(LS[4] + 1)}, 0.01); out("#atkw", ${t(LS[4] + 1)}, 0.01);
      // ===== L5 回到开头的题，不能证明。
      pop("#kw-q", ${t(LS[4] + 1.6)}); out("#kw-q", ${t(LS[5] + 0.4)}, 0.15); pop("#kw-no", ${t(LS[5] + 0.6)});
      // ===== L6 控制了解析的人，可以用常见的域名验证方式，申请到有效证书。
      out("#kw-no", ${t(LS[6] + 2.2)}); out("#cv-bad", ${t(LS[6])});
      pop("#lb-c1", ${t(LS[6] + 0.4)}); grow("cert2", ${t(mid(6, 0.6))}, 0.6); pop("#lb-c2", ${t(mid(6, 0.6) + 0.5)});
      bump("#lb-c1, #lb-c2", ${t(mid(6, 0.6) + 1.2)}, 1.12, 1);
      // ===== L7 锁标志只说明，浏览器连上了域名此刻指向的服务器。
      out("#lb-c1, #lb-c2, #lb-clone", ${t(LS[7] - 0.1)});
      draw("cv-lock", ${t(LS[7] + 0.3)}, 0.9); pop("#lb-here", ${t(LS[7] + 1.2)});
      // ===== L8 地址栏这一层的检查，在这里全部失效。
      out("#lb-here, #cv-lock", ${t(LS[8] - 0.1)});
      [0, 1, 2].forEach(function (i) { pop("#ib-c" + i, ${t(LS[8] + 0.2)} + i * 0.2); tl.to("#ib-c" + i, { filter: "grayscale(1)", opacity: 0.45, duration: 0.3 }, ${t(LS[8] + 1.3)} + i * 0.35); });
      // ===== L9 2025 年 5 月，攻击者进入同一家注册商的系统。
      out("#ib, #lb-real", ${t(LS[9] - 0.2)}); X20.turn(tl, "dns", ${t(LS[9] - 0.2)}, ${L.SIGN_ANG.real}, 0.6); X20.red(tl, "dns", ${t(LS[9] - 0.1)}, false);
      cam(${t(LS[9])}, "regD", 1.3, "power2.inOut");
      pop("#ev-curve", ${t(LS[9] + 0.2)}); pop("#ev-src1", ${t(LS[9] + 0.6)}); pop("#lb-reg", ${t(LS[9] + 1.2)});
      tl.fromTo("#atkw", { x: 160, y: 80, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power2.out", immediateRender: false }, ${t(LS[9] + 1.4)});
      KIT.swap(tl, "#reg-scr", "#reg-scr2", ${t(LS[9] + 2.4)}); flash("#reg-scr2", ${t(LS[9] + 2.6)}, 2); bump("#ev-curve", ${t(LS[9] + 3.4)}, 1.06, 1);
      // ===== L10 又一次把 Curve 的域名委派，改到自己的服务器。
      X20.hijack(tl, "dns", ${t(LS[10] + 0.3)}); pop("#lb-deleg", ${t(LS[10] + 1.1)});
      // ===== L11 Curve 把用户引导到新域名，并公开批评注册商响应迟缓。
      out("#lb-deleg", ${t(LS[11] - 0.1)});
      pop("#ck-new", ${t(LS[11] + 0.3)}); pop("#ck-slow", ${t(mid(11, 0.5))}); pop("#ev-src2", ${t(mid(11, 0.5) + 0.3)});
      // ===== L12 同一家注册商出两次事，说明换个强密码不够，注册商本身就是风险。
      out("#lb-reg", ${t(LS[12])}); fadeIn("#regBox", ${t(LS[12] + 0.3)}, 0.4); pop("#lb-risk", ${t(mid(12, 0.55))});
      // ===== L13 2024 年 7 月，Google Domains 的域名业务，迁到 Squarespace。
      out("#ev-curve, #ev-src1, #ev-src2, #ck-new, #ck-slow, #lb-risk, #regBox, #atkw", ${t(LS[13] - 0.2)});
      KIT.swap(tl, "#reg-scr2", "#reg-scr", ${t(LS[13] - 0.2)});
      pop("#ev-mig", ${t(LS[13] + 0.2)}); grow("clk", ${t(LS[13] + 0.4)}); pop("#lb-mig", ${t(LS[13] + 0.9)});
      pop("#lb-gd", ${t(LS[13] + 1.2)}); KIT.swap(tl, "#lb-gd", "#lb-sq", ${t(mid(13, 0.7))}, 0.35);
      // ===== L14 之后，Compound 等多个 DeFi 项目的域名被劫持，指向盗币页面。
      [0, 1, 2].forEach(function (i) { grow("mini" + i, ${t(LS[14] + 0.2)} + i * 0.25); X20.hijack(tl, "mini" + i, ${t(LS[14] + 1.6)} + i * 0.55, 0.7); });
      pop("#lb-defi", ${t(LS[14] + 1.0)});
      // ===== L15 研究者认为，这和迁移期间多因素认证失效有关，官方没有公布根因。
      pop("#ck-mfa", ${t(LS[15] + 0.3)}); pop("#ck-root", ${t(mid(15, 0.6))}); pop("#ev-src3", ${t(mid(15, 0.6) + 0.3)});
      // ===== L16 Celer 靠域名监控，拦下了劫持尝试。
      out("#ck-mfa, #ck-root, #ev-mig, #ev-src3", ${t(LS[16] - 0.1)});
      grow("bcn2", ${t(LS[16] + 0.1)}); KIT.beacon(tl, "bcn2", ${t(LS[16] + 0.4)}, 1.6);
      X20.restore(tl, "mini1", ${t(LS[16] + 1.0)}, 0.8); pop("#lb-celer", ${t(LS[16] + 1.8)});
      // ===== L17 所以域名这一环，要开注册商锁和注册局锁。
      out("#lb-celer, #lb-defi, #lb-mig, #lb-sq", ${t(LS[17] - 0.2)});
      cam(${t(LS[17])}, "guardD", 1.3, "power2.inOut");
      [[0, ${JSON.stringify(LK0)}], [1, ${JSON.stringify(LK1)}]].forEach(function (a, i) {
        var t0 = ${t(LS[17] + 1.4)} + i * 0.9;
        fadeIn("#lkw" + a[0], t0, 0.25);
        tl.to("#lkw" + a[0], { x: a[1].x, y: a[1].y, duration: 0.7, ease: "power2.inOut" }, t0 + 0.25);
        pop("#lb-lk" + a[0], t0 + 1.0);
      });
      // ===== L18 注册商账号用硬件密钥登录，只给少数人权限。
      fadeIn("#hwkw", ${t(LS[18] + 0.1)}, 0.25);
      tl.to("#hwkw", { x: ${HWK.x}, y: ${HWK.y}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[18] + 0.4)});
      pop("#lb-hwk", ${t(LS[18] + 1.3)}); grow("adm", ${t(mid(18, 0.55))}); pop("#lb-adm", ${t(mid(18, 0.55) + 0.5)});
      // ===== L19 开启 DNSSEC，监控解析记录、委派和证书的变化。
      out("#lb-hwk, #lb-adm", ${t(LS[19] - 0.1)});
      X20.lit(tl, "dns", ${t(LS[19] + 0.3)}); pop("#lb-sec", ${t(LS[19] + 0.5)});
      grow("bcn", ${t(mid(19, 0.45))}); pop("#lb-mon", ${t(mid(19, 0.45) + 0.5)});
      // ===== L20 换服务商的当天，重新核查账号和多因素认证。
      KIT.clock(tl, "clk", ${t(LS[20] + 0.2)}, 1.2, 180); pop("#ck-day", ${t(LS[20] + 0.6)});
      // ===== L21 再提前公布一个备用域名。
      grow("bak", ${t(LS[21] + 0.3)}); pop("#lb-bak", ${t(LS[21] + 0.9)});
`,
});
