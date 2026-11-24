// ep20/seg6「⑥ 页面之外」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.toolF（BRIEF）。
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
// ends static on CAMS.wide (last segment; end card)
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { G, applyM } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// ---- segment-local positions (E zone, around the hero browser; zone-local screen offsets like layout.mjs)
const [EX, EY] = L.ZONE_ANCHOR.E;
const e = (x, y, extra = {}) => { const q = G(EX + x, EY + y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const SRV = e(250, -480, { scale: 0.7 });          // kit rack "此刻指向的服务器" (wrap 0.7)
const OWN = e(400, -420, { scale: 0.5 });          // kit person engineer → attacker (换了主人)
const DNSE = e(60, -420, { scale: 0.5 });          // ep20 dnsSignpost small, arm toward SRV
const S3E = e(-640, -360);                         // kit bucket (前端文件) — L6
const CLKE = e(-380, -450);                        // kit clock "多久" — L6
const HWE = e(-120, 240);                          // kit hwWallet (独立核对) — L11
const R = L.world.rects;
const rSrv = L.rect(SRV, "rack"), rOwn = L.rect(OWN, "personAtk"), rDns = L.rect(DNSE, "dnsSignpost"), rHw = L.rect(HWE, "hwWallet");
const CAMS = {
  ...L.CAMS,
  userL: L.fit([R.user, R.browser, R.cheque, R.phone, rHw], [80, 300, 1240, 860], 1.4),     // E 用户 + 浏览器，右侧留清单
  keyE: L.fit([R.browser, rSrv, rOwn, rDns], [120, 300, 1220, 860], 1.4),                    // E 浏览器 + 此刻指向的服务器
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [X, E1, E2, E5, E9, E10] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// wrap helper for objects without opts.scale (SEGBASE 常见坑 1): scale around the ground point, rescale anchors
const putW = (key, o, r, k = o.scale) => {
  const [gx, gy] = at(o);
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  for (const [n, v] of Object.entries(A[key])) {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = sc(v);
    else if (Array.isArray(v) && v.length === 6 && typeof v[0] === "number") A[key][n] = [v[0] * k, v[1] * k, v[2] * k, v[3] * k, ...sc([v[4], v[5]])];
  }
};

// ---------------------------------------------------------------- 世界物件
// street: road strip + pipe (under everything)
{
  const q = L.ROAD, c = [[q.u0, q.v0], [q.u1, q.v0], [q.u1, q.v1], [q.u0, q.v1]].map(([u, v]) => Wp(u, v).map(Math.round).join(","));
  add({ u: q.u0, v: q.v0 }, `<polygon points="${c.join(" ")}" fill="#d9d4ca" stroke="#cdc7bb" stroke-width="3"/>`, -1e6);
}
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7 }), -5e5);
// A · B · C · D (seen in the closing wide shot)
put("desk", L.DESK, O.desk(L.DESK, { id: "desk" }));
put("dev", L.DEV, O.person(L.DEV, { id: "dev", role: "engineer", scale: L.DEV.scale }));
put("conv", L.CONV, E2.conveyor(L.CONV, { id: "conv", len: L.CONV.len }));
putW("ci", L.CI, O.rack(L.CI, { id: "ci", tag: "CI 构建" }));
put("s3c", L.BUCKET, O.bucket(L.BUCKET, { id: "s3c" }));
L.EDGES.forEach((q, i) => put("edge" + i, q, O.rpc(q, { id: "edge" + i })));
put("cdn", L.CDNSIGN, E1.signBoard(L.CDNSIGN, { id: "cdn", style: "plate", text: "CDN" }));
put("dns", L.SIGNPOST, X.dnsSignpost(L.SIGNPOST, { id: "dns", domain: "curve.fi" }));
putW("real", L.REAL, O.rack(L.REAL, { id: "real", tag: "真服务器" }));
putW("clone", L.CLONE, O.rack(L.CLONE, { id: "clone", tag: "克隆站", state: "attacker", leds: ["red", "red", "red"] }));

// E · 用户端 — hero browser page: bookmark bar (star), a search ad (struck out in L1), green lock over the bar's lock
const PAGE = `
  <path d="M96 17v-2a4 4 0 0 1 8 0v2M94 17h12v9h-12z" fill="#ffffff" stroke="#1f9d55" stroke-width="2.4"/>
  <rect x="0" y="42" width="380" height="26" fill="#f6f3ed"/>
  <path d="M22 47l3 6.2 6.8.8-5 4.6 1.4 6.7-6.2-3.4-6.2 3.4 1.4-6.7-5-4.6 6.8-.8z" fill="none" stroke="#9a9488" stroke-width="1.6"/>
  <g id="bm-on" opacity="0"><path d="M22 47l3 6.2 6.8.8-5 4.6 1.4 6.7-6.2-3.4-6.2 3.4 1.4-6.7-5-4.6 6.8-.8z" fill="#1f9d55" stroke="#1f9d55" stroke-width="1.6"/>
    <rect x="38" y="47" width="76" height="16" rx="8" fill="#dff1e6"/></g>
  <text x="44" y="60" font-family="ui-monospace, Menlo, monospace" font-size="12" font-weight="700" fill="#1c1c1c">curve.fi</text>
  <rect x="200" y="74" width="168" height="34" rx="6" fill="#fff6e8" stroke="#e7dcc6"/>
  <rect x="206" y="81" width="30" height="18" rx="4" fill="#e9e2d4"/><text x="221" y="94" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#7d776b">广告</text>
  <text x="242" y="96" font-family="ui-monospace, Menlo, monospace" font-size="13" fill="#5f5a50">curve-fi.app</text>
  <g id="ad-x" opacity="0"><rect x="198" y="72" width="172" height="38" rx="7" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="7 5"/>
    <path d="M204 104L364 78" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/></g>
  <text x="18" y="104" font-family="Inter, sans-serif" font-size="30" font-weight="900" fill="#1c1c1c">Curve</text>
  <rect x="18" y="124" width="344" height="92" rx="10" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>
  <rect x="34" y="142" width="140" height="12" rx="6" fill="#ddd6c9"/><rect x="34" y="166" width="220" height="12" rx="6" fill="#e8e3d9"/><rect x="34" y="190" width="180" height="12" rx="6" fill="#e8e3d9"/>
  <rect x="90" y="232" width="200" height="50" rx="12" fill="#1d93ba"/>
  <text x="190" y="265" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="#ffffff">连接钱包</text>`;
put("brw", L.BROWSER, O.browserWin(L.BROWSER, { id: "brw", title: "curve.fi", page: PAGE }));
put("user", L.USER, O.person(L.USER, { id: "user", role: "signer", scale: L.USER.scale }));
const PH1 = `<rect x="0" y="0" width="76" height="150" fill="#f4f1ea"/><text x="38" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#1c1c1c">签名？</text>
  ${["0x095ea7b3", "0000a9f2c1", "ffffffffff", "ffffffffff"].map((s, i) => `<text x="38" y="${54 + i * 18}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="10" fill="#7d776b">${s}</text>`).join("")}
  <rect x="10" y="122" width="56" height="18" rx="9" fill="#1d93ba"/>`;
const PH2 = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><text x="38" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#1d93ba">已解码</text>
  ${[["动作", "授权"], ["给谁", "0xa9f2…"], ["额度", "无限"]].map(([k, v], i) => `<rect x="6" y="${36 + i * 36}" width="64" height="30" rx="5" fill="${i === 2 ? "#fde8e6" : "#e8f3f7"}"/>
  <text x="11" y="${48 + i * 36}" font-family="Inter, sans-serif" font-size="9" fill="#5f5a50">${k}</text>
  <text x="11" y="${62 + i * 36}" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="${i === 2 ? "#e0453a" : "#1c1c1c"}">${v}</text>`).join("")}`;
put("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen: PH1, screen2: PH2 }));
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: L.VEND.scale }));
put("hwE", HWE, O.hwWallet(HWE, { id: "hwE", screenText: "核对" }));
// cheque split in two halves along a zig-zag tear (L3 撤销)
{
  const o = L.CHEQUE, [cx, cy] = at(o), zz = [[6, -300], [-6, -110], [8, -80], [-5, -50], [6, -20], [-4, 10], [6, 300]];
  const left = [[-400, -300], ...zz, [-400, 300]], right = [[400, -300], ...zz, [400, 300]];
  const poly = (pp) => pp.map(([x, y]) => `${cx + x},${cy + y}`).join(" ");
  const half = (k, pp) => { const r = E9.cheque(o, { id: "chq" + k, scale: o.scale, title: "授权", amount: "无限" });
    if (k === "a") A.chq = r.anchors;
    return `<clipPath id="chq-clip-${k}"><polygon points="${poly(pp)}"/></clipPath><g id="chq-${k}" clip-path="url(#chq-clip-${k})">${r.svg}</g>`; };
  add(o, half("a", left) + half("b", right));
}
// E · local props for L6 (frontend file + clock) and L10 (the server the domain points at right now)
put("s3E", S3E, O.bucket(S3E, { id: "s3E" }));
add(S3E, S.hid("s3E-red", (() => { const [x, y] = at(S3E, 0, 0, 0); return `<g transform="translate(${x - 18},${y - 168})"><path d="M0 0h26l10 10v34H0z" fill="#fde8e6" stroke="#e0453a" stroke-width="3"/><text x="18" y="32" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="11" font-weight="900" fill="#e0453a">JS</text></g>`; })()), 1);
put("clkE", CLKE, O.clock(CLKE, { id: "clkE", h: 9, m: 0 }));
putW("srv", SRV, O.rack(SRV, { id: "srv", tag: "服务器" }));
put("own", OWN, O.person(OWN, { id: "own", role: "engineer", scale: OWN.scale }));
put("own2", OWN, O.person(OWN, { id: "own2", role: "attacker", scale: OWN.scale }), 0.5, { wrap: (svg) => S.hid("own2w", svg) });
put("dnsE", DNSE, X.dnsSignpost(DNSE, { id: "dnsE", domain: "curve.fi", scale: DNSE.scale, label: "" }));
// red dashed frame "审计之外" around the browser (L11)
{
  const q = R.browser, p = 16;
  add(L.BROWSER, S.hid("brw-box", `<rect x="${q[0] - p}" y="${q[1] - p}" width="${q[2] - q[0] + 2 * p}" height="${q[3] - q[1] + 2 * p}" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 11"/>`), 400);
}

// F · 签名台 (start frame = seg5 end on toolF)
put("safe", L.SAFE, O.safe(L.SAFE, { id: "safe", plate: "冷钱包多签" }));
put("core", L.CORE, E10.coreModule(L.CORE, { id: "core", scale: L.CORE.scale }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter" }));
putW("safeui", L.SAFEUI, O.browserWin(L.SAFEUI, { id: "safeui", title: "Safe 网页前端" }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: q.scale })));
L.HWS.forEach((q, i) => put("hw" + i, q, O.hwWallet(q, { id: "hw" + i, screenText: "0x3f…a9" })));
putW("lap", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lap" }));
put("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }));
put("chk", L.CHECKPT, O.checkpoint(L.CHECKPT, { id: "chk" }));
put("bybit", L.BYBIT, E1.signBoard(L.BYBIT, { id: "bybit", style: "plate", text: "Bybit 多签地址", size: 34 }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-dec", [A.ph.top[0] - 30, A.ph.top[1] - 6], "解码：给谁 · 多少", "lab-cs");
["重新授权", "迁移资产", "验证钱包"].forEach((s, i) => lb("lb-ask" + i, [A.ph.top[0] - 150 + i * 150, A.ph.top[1] - 10 - (i % 2) * 52], `${s} ✕`, "lab-r"));
lb("lb-rev", up(A.chq.top, 6), "撤销授权", "lab-r");
lb("lb-s3", up(A.s3E.top, 4), "替换一个脚本文件", "lab-r lab-sm");
lb("lb-ui", up(A.safeui.top, 6), "Safe 网页前端", "lab-cs lab-sm");
lb("lb-path", [A.lap.top[0], A.lap.top[1] - 6], "独立工具 → 硬件钱包", "lab-g");
lb("lb-srv", up(A.srv.top, 4), "域名此刻指向这台", "lab-cs lab-sm");
lb("lb-own", up(A.own.top, 6), "主人？", "lab-r lab-sm");
lb("lb-vm", up(A.vm.top, 6), "审计 ✓ 合约", "lab-g");
lb("lb-brw", [A.brw.top[0], R.browser[1] - 24], "审计之外：页面", "lab-r");
lb("lb-hw", [A.hwE.top[0] - 20, A.hwE.top[1]], "签名前独立核对 ✓", "lab-g");

// ---------------------------------------------------------------- 屏幕层卡片
const LOCK = applyM(A.brw.pageM, 100, 21);   // the green lock in the address bar
S.curve("cv-lock", S.scr("keyE", LOCK), S.scr("keyE", A.srv.front), { color: "#2aa3c9", c1: S.scr("keyE", A.dnsE.tip), c2: S.scr("keyE", up(A.srv.front, 120)) });
S.curve("cv-path", S.scr("F", A.lap.screen), S.scr("F", A.hw2.screen), { color: "#1f9d55", c1: S.scr("F", up(A.lap.front, -160)), c2: S.scr("F", up(A.hw2.screen, -120)) });
const CKX = 1290, CKW = 570;
const html = [
  ck("ck1", "从收藏夹进入，不点广告链接", { x: CKX, y: 330, w: CKW }),
  ck("ck2", "域名对，也要解码再签", { x: CKX, y: 424, w: CKW }),
  ck("ck3", "前端出事：停手，撤销授权", { x: CKX, y: 518, w: CKW }),
  ck("ck4", "突然要求授权迁移：先核实", { x: CKX, y: 612, w: CKW, kind: "r", icon: "!" }),
  kw("rc1", "前端负责人：今天问一个问题", { x: 560, y: 130, size: 38, accent: "#2aa3c9" }),
  kw("rc1b", "替换一个文件 → <b>谁发现？多久？</b>", { x: 560, y: 210, size: 38, accent: "#e0453a" }),
  kw("rc2", "多签签名人：<b>不经过前端</b>的核对路径", { x: 520, y: 130, size: 38, accent: "#1f9d55" }),
  kw("kw-q", "域名对 + 锁在<br>= 页面是真的？", { x: 1320, y: 430, size: 44, accent: "#2aa3c9" }),
  kw("kw-no", "域名对 + 锁在<br><b>不能</b>证明页面是真的", { x: 1300, y: 440, size: 42, accent: "#e0453a" }),
  kw("kw-key", `锁 = 连上了这台<br>这台是谁的，<b>锁不管</b><br>${gtag("解读")}`, { x: 1260, y: 380, size: 40, accent: "#e0453a" }),
].join("");
const css = `#kw-q, #kw-no, #kw-key { line-height: 1.35; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  fav: w("收藏夹", 1), ad: w("广告", 1), dec: w("解码", 2), stop: w("停止交互", 3), rev: w("撤销", 3),
  ask: w("重新授权", 4), chk: w("核实", 4), swap: w("替换", 6), when: w("多久", 6), path: w("不经过", 7),
  no: w("不能证明", 9), srv: w("服务器", 10), owner: w("换了主人", 10), aud: w("管得住合约", 11), page: w("管不住页面", 11), self: w("独立核对", 11),
};
const t = (x) => f(x);

S.build({
  cam0: "toolF", sub: "签名之前，绕开页面核对一次",
  grid: { u0: -2600, u1: 13100, v0: -8000, v1: 8100 }, box: [-900, -4500, 10500, 6000],   // 盖住上段终点 toolF + userE / barE / E / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "撤销", d: "取消之前给出的授权", at: w("撤销", 3) },
  ],
  end: { title: "前端、DNS 与供应链安全", line: "审计管得住合约，管不住页面", next: "社会工程与内部人", at: LS[12], nextAt: w("下一集", 12) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 如果你是普通用户，先记住几条。 — F → E 用户 + 浏览器，右侧留清单
      cam(${t(LS[0])}, "userL", 1.6);
      // ===== L1 收藏官方网址，从收藏夹进入，不点搜索广告和私信链接。
      pop("#ck1", ${t(TM.fav)}); fadeIn("#bm-on", ${t(TM.fav + 0.2)}, 0.4); fadeIn("#ad-x", ${t(TM.ad)}, 0.3);
      // ===== L2 即使域名正确，签名前也要解码，看清你在签什么。
      pop("#ck2", ${t(LS[2] + 0.2)}); tl.to("#ph-scr", { opacity: 0, duration: 0.3 }, ${t(TM.dec)}); fadeIn("#ph-scr2", ${t(TM.dec)}, 0.3);
      pop("#lb-dec", ${t(TM.dec + 0.3)});
      // ===== L3 项目方公告前端异常，立刻停止交互，撤销近期的授权。
      pop("#ck3", ${t(TM.stop)});
      tl.to("#chq-a", { x: -22, y: 10, rotation: -8, svgOrigin: "${A.chq.ground.join(" ")}", duration: 0.5, ease: "power2.out" }, ${t(TM.rev)});
      tl.to("#chq-b", { x: 22, y: 10, rotation: 8, svgOrigin: "${A.chq.ground.join(" ")}", duration: 0.5, ease: "power2.out" }, ${t(TM.rev)});
      pop("#lb-rev", ${t(TM.rev + 0.3)});
      // ===== L4 熟悉的网站突然要你重新授权、迁移资产、验证钱包，先停下来核实。
      out("#lb-dec", ${t(TM.ask - 0.3)}, 0.2);
      [0, 1, 2].forEach((i) => pop("#lb-ask" + i, ${t(TM.ask)} + i * 0.5, 0.25));
      pop("#ck4", ${t(TM.ask + 0.2)}); flash("#lb-ask0, #lb-ask1, #lb-ask2", ${t(TM.chk)}, 2);
      // ===== L5 如果你负责前端，今天就问一个问题。 — 拉开到 E 全区
      out("#ck1, #ck2, #ck3, #ck4, #lb-ask0, #lb-ask1, #lb-ask2, #lb-rev", ${t(LS[5] - 0.2)}, 0.25);
      cam(${t(LS[5])}, "E", 1.3); pop("#rc1", ${t(LS[5] + 0.6)});
      // ===== L6 今晚有人替换了一个脚本文件，谁会在多久之后发现？
      fadeIn("#s3E-red", ${t(TM.swap)}, 0.3); pop("#lb-s3", ${t(TM.swap + 0.2)}); flash("#s3E-red", ${t(TM.swap + 0.6)}, 2);
      pop("#rc1b", ${t(TM.when - 0.6)}); KIT.clock(tl, "clkE", ${t(TM.when - 0.4)}, 1.8, 420);
      // ===== L7 如果你是多签签名人，确认自己有一条不经过这个前端的核对路径。 — 右移到 F
      out("#rc1, #rc1b, #lb-s3", ${t(LS[7] - 0.2)}, 0.25);
      cam(${t(LS[7])}, "F", 1.4); pop("#rc2", ${t(LS[7] + 1.0)}); pop("#lb-ui", ${t(LS[7] + 1.2)});
      draw("cv-path", ${t(TM.path)}, 1.0); pop("#lb-path", ${t(TM.path + 0.6)}); bump("#lb-ui", ${t(TM.path + 0.2)});
      // ===== L8 回到开头的问题。 — 地址栏 + 锁特写，题卡回来
      out("#rc2, #lb-ui, #lb-path, #cv-path", ${t(LS[8] - 0.2)}, 0.25);
      cam(${t(LS[8])}, "barE", 1.4); pop("#kw-q", ${t(LS[8] + 0.3)});
      // ===== L9 域名是对的，锁也在，不能证明页面是真的。
      out("#kw-q", ${t(TM.no - 0.5)}, 0.2); pop("#kw-no", ${t(TM.no - 0.3)});
      // ===== L10 它只说明你连上了域名此刻指向的服务器，而那台服务器，可能已经换了主人。 — 关键画面
      out("#kw-no", ${t(LS[10] + 0.9)}, 0.2); cam(${t(LS[10])}, "keyE", 1.2);
      draw("cv-lock", ${t(TM.srv)}, 0.9); pop("#lb-srv", ${t(TM.srv + 0.6)}); pop("#kw-key", ${t(TM.srv + 0.3)});
      out("#own", ${t(TM.owner)}, 0.4); fadeIn("#own2w", ${t(TM.owner)}, 0.4); pop("#lb-own", ${t(TM.owner + 0.4)});
      // ===== L11 审计管得住合约，管不住页面，签名之前，独立核对你在签什么。 — 拉开到 E 全区
      out("#kw-key, #cv-lock, #lb-srv, #lb-own", ${t(LS[11] - 0.2)}, 0.25); cam(${t(LS[11])}, "E", 1.2);
      pop("#lb-vm", ${t(TM.aud)}); fadeIn("#brw-box", ${t(TM.page)}, 0.4); pop("#lb-brw", ${t(TM.page + 0.2)});
      pop("#lb-hw", ${t(TM.self)});
      // ===== L12 下一集讲社会工程与内部人。 — 发布街全景 + 结束卡
      out("#lb-vm, #lb-brw, #lb-hw, #brw-box", ${t(LS[12] - 0.2)}, 0.25); cam(${t(LS[12])}, "wide", 1.0);
`,
});
