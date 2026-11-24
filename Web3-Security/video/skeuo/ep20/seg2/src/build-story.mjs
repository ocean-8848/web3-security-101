// ep20/seg2「② 页面链路」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.contractE（BRIEF）。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const KW = L.CAMS.wide.scale;                       // 全景缩放（世界标签保持字号，叠放间距要除以它）
const FT = `font-family="Inter, 'Noto Sans SC', sans-serif"`;

// 不支持 scale 的物件：绕地面点包一层，并换算 anchors
function putW(key, o, r, k) {
  const [gx, gy] = at(o);
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
}
const pts = (arr) => arr.map((p) => p.map((v) => Math.round(v)).join(",")).join(" ");

// ---------------------------------------------------------------- 街道：路面 + 管道 + 管道点亮层
{ const R = L.ROAD; const q = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v, 0));
  add({ u: 0, v: 0 }, `<polygon points="${pts(q)}" fill="#dcd8d0" stroke="#cbc5ba" stroke-width="3"/>`, -100000); }
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7 }), -99999);
const P0 = Wp(L.PIPE.o.u, L.PIPE_V, L.PIPE_Z), ST = L.STATIONS;
const STEPS = [["A", "开发者"], ["repo", "代码仓库"], ["B", "依赖包"], ["ci", "构建"], ["C", "托管"], ["cdn", "CDN"], ["D", "域名"]];
{ let prev = P0, s = "";
  STEPS.forEach(([k], i) => { s += S.hid(`pl-${i}`, `<line x1="${prev[0]}" y1="${prev[1]}" x2="${ST[k][0]}" y2="${ST[k][1]}" stroke="#2aa3c9" stroke-width="30" stroke-linecap="round"/>`); prev = ST[k]; });
  ["A", "B", "C", "D"].forEach((k) => {
    s += S.hid(`pr-${k}`, `<line x1="${ST[k][0]}" y1="${ST[k][1]}" x2="${ST.E[0]}" y2="${ST.E[1]}" stroke="#e0453a" stroke-width="34" stroke-linecap="round"/>`);
    s += S.hid(`ph-${k}`, `<circle cx="${ST[k][0]}" cy="${ST[k][1]}" r="150" fill="#e0453a" fill-opacity="0.25" stroke="#e0453a" stroke-width="18"/>`);
  });
  add({ u: 0, v: 0 }, s, -99998); }

// ---------------------------------------------------------------- A 开发者工位
put("desk", L.DESK, O.desk(L.DESK, { id: "desk", screen: `<rect width="148" height="88" fill="#1c1c1c"/><text x="74" y="56" text-anchor="middle" ${FT} font-size="30" font-weight="900" fill="#9fd3e5">代码</text>` }));
put("dev", L.DEV, O.person(L.DEV, { id: "dev", role: "engineer", scale: 0.55 }));
putW("repo", L.REPO, O.dbLedger(L.REPO, { id: "repo", tag: "代码仓库" }), 0.7);
// ---------------------------------------------------------------- B 依赖与构建
put("conv", L.CONV, E2.conveyor(L.CONV, { id: "conv", len: 520 }));
L.PARCELS.forEach((q, i) => put(`pc${i}`, q, E7.parcel(q, { id: `pc${i}`, z: q.z, scale: 0.8 }), 1));
put("npm", L.NPM, E1.signBoard(L.NPM, { id: "npm", style: "plate", text: "npm 仓库", size: 34 }));
putW("ci", L.CI, O.rack(L.CI, { id: "ci", tag: "CI 构建" }), 0.7);
// ---------------------------------------------------------------- C 托管与 CDN
put("s3", L.BUCKET, O.bucket(L.BUCKET, { id: "s3" }));
L.EDGES.forEach((q, i) => put(`edge${i}`, q, O.rpc(q, { id: `edge${i}` })));
put("cdns", L.CDNSIGN, E1.signBoard(L.CDNSIGN, { id: "cdns", style: "plate", text: "CDN", size: 40 }));
// ---------------------------------------------------------------- D 域名路口
put("dns", L.SIGNPOST, X.dnsSignpost(L.SIGNPOST, { id: "dns", domain: "curve.fi" }));
putW("real", L.REAL, O.rack(L.REAL, { id: "real", tag: "真服务器" }), 0.7);
putW("clone", L.CLONE, O.rack(L.CLONE, { id: "clone", tag: "克隆站", state: "attacker", leds: ["red", "red", "red"] }), 0.7);
// ---------------------------------------------------------------- E 用户端
const PAGE_HEAD = `<rect x="0" y="42" width="380" height="258" fill="#ffffff"/>
  <rect x="16" y="54" width="348" height="112" rx="10" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>
  <text x="32" y="88" ${FT} font-size="22" font-weight="800" fill="#7d776b">兑换</text>`;
const ROW = `<text x="32" y="140" ${FT} font-size="34" font-weight="900" fill="#1c1c1c">100 USDC</text>`;
const jsIcon = (i, hl) => `<g ${hl ? `id="jsh-${i}" opacity="0"` : ""}><rect x="${32 + i * 64}" y="178" width="52" height="34" rx="6" fill="${hl ? "#1d93ba" : "#ece7dd"}" stroke="${hl ? "#17809f" : "#cfc7b8"}" stroke-width="2"/><text x="${58 + i * 64}" y="202" text-anchor="middle" font-family="monospace" font-size="17" font-weight="800" fill="${hl ? "#ffffff" : "#7d776b"}">JS</text></g>`;
const btn = (txt, col) => `<rect x="16" y="226" width="348" height="58" rx="12" fill="${col}"/><text x="190" y="266" text-anchor="middle" ${FT} font-size="28" font-weight="900" fill="#ffffff">${txt}</text>`;
const page = PAGE_HEAD + `<g id="brw-row" opacity="0">${ROW}</g>` + [0, 1, 2].map((i) => jsIcon(i, false) + jsIcon(i, true)).join("") + btn("确认兑换", "#1d93ba");
const page2 = PAGE_HEAD + ROW + [0, 1, 2].map((i) => jsIcon(i, false)).join("") + btn("授权", "#e0453a");
put("brw", L.BROWSER, O.browserWin(L.BROWSER, { id: "brw", title: "curve.fi", page, page2 }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: 0.6 }));
put("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen2: `<rect width="76" height="150" fill="#ffffff"/><rect width="76" height="26" fill="#ece7dd"/><text x="38" y="84" text-anchor="middle" ${FT} font-size="18" font-weight="900" fill="#1c1c1c">签名？</text><rect x="8" y="110" width="60" height="26" rx="7" fill="#1d93ba"/>` }));
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: 0.7, sign: "AUDITED" }));
const LT0 = S.rel(L.BROWSER, -170, 160), LT1 = S.rel(L.PHONE, 40, 90);
put("lt", LT0, E1.letter(LT0, { id: "lt" }), 0, { wrap: (s) => S.hid("ltw", s) });
put("ltr", LT1, E1.letter(LT1, { id: "ltr", state: "attacker" }), 0, { wrap: (s) => S.hid("ltrw", s) });
{ const R = L.rect(L.BROWSER, "browserWin"), p = 22;
  add(L.BROWSER, S.hid("fe-box", `<rect x="${R[0] - p}" y="${R[1] - p}" width="${R[2] - R[0] + 2 * p}" height="${R[3] - R[1] + 2 * p}" rx="18" fill="none" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="18 12"/>`), 400); }
{ const R = L.rect(L.VEND, "vending"), p = 50;
  add(L.VEND, S.hid("aud-box", `<rect x="${R[0] - p}" y="${R[1] - p}" width="${R[2] - R[0] + 2 * p}" height="${R[3] - R[1] + 2 * p}" rx="30" fill="none" stroke="#2aa3c9" stroke-width="22" stroke-dasharray="60 36"/>`), 400); }
// 银行柜台比喻
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.7 }));
putW("vault", L.VAULT, O.safe(L.VAULT, { id: "vault" }), 0.5);
put("bbook", L.BANKBOOK, O.ledgerBook(L.BANKBOOK, { id: "bbook", scale: 0.5 }));
const CU = L.LETTERS.map((q) => S.rel(q, -130, 0));
CU.forEach((q, i) => put(`cu${i}`, q, O.person(q, { id: `cu${i}`, role: "signer", scale: 0.45 })));
L.LETTERS.forEach((q, i) => put(`bl${i}`, q, E1.letter(q, { id: `bl${i}`, w: 50, h: 34 }), 2));
{ const D = S.rel(L.TELLER, -380, 140), [x0, y0] = Wp(D.u - 70, D.v, 0), [x1, y1] = Wp(D.u + 70, D.v, 0), [x2, y2] = Wp(D.u + 70, D.v, 230), [x3, y3] = Wp(D.u - 70, D.v, 230), [kx, ky] = Wp(D.u + 45, D.v, 110);
  add(D, S.hid("door", `<polygon points="${pts([[x0, y0], [x1, y1], [x2, y2], [x3, y3]])}" fill="#e8dcc8" stroke="#1c1c1c" stroke-width="5"/><circle cx="${kx}" cy="${ky}" r="7" fill="#1c1c1c"/>`), 50);
  S.A.door = { top: Wp(D.u, D.v, 240) }; }
// ---------------------------------------------------------------- F 签名台（全景里要有）
put("safe", L.SAFE, O.safe(L.SAFE, { id: "safe", plate: "冷钱包多签" }));
L.SIGNERS.forEach((q, i) => put(`sg${i}`, q, O.person(q, { id: `sg${i}`, role: "signer", scale: 0.5 })));
L.HWS.forEach((q, i) => put(`hw${i}`, q, O.hwWallet(q, { id: `hw${i}`, screenText: "0x3f…a9" })));

// ---------------------------------------------------------------- 世界标签
lb("lb-noread", up(A.vm.top, 10), "✗ 不读", "lab-g lab-sm");
lb("lb-read", up(A.brw.top, 10), "读", "lab-gs lab-sm");
lb("lb-row", [A.brw.top[0] + 230, A.brw.top[1] + 60], "示意", "lab-g lab-sm", "l");
lb("lb-aud", up(A.vm.top, 10), "已审计 ✓", "lab-gs lab-sm");
lb("lb-fe", up(A.brw.top, 30), "前端 = 网页 + 全部脚本", "lab-cs");
lb("stk-g", A.tc.window1, "收款账号", "lab-gs lab-sm", "c");
lb("stk-r", A.tc.window1, "收款账号", "lab-rs lab-sm", "c");
lb("ok-vault", up(A.vault.top, 6), "金库 ✓", "lab-g lab-sm");
lb("ok-book", [A.bbook.top[0] + 70, A.bbook.top[1]], "账本 ✓", "lab-g lab-sm", "l");
lb("ok-guard", up(A.tc.teller, 30), "保安 ✓", "lab-g lab-sm");
lb("lb-door", up(A.door.top, 6), "进大厅", "lab-ink lab-sm");
CU.forEach((_, i) => lb(`see${i}`, up(A[`cu${i}`].top, 8), "收款账号", `${i === 1 ? "lab-rs" : "lab-gs"} lab-sm`));
// 全景：各区站名（每区一列，叠放）
const ZA = L.ZONE_ANCHOR, colTop = (zk, ...keys) => [ZA[zk][0], Math.min(...keys.map((k) => A[k].top[1])) - 20];
const COL = { A: colTop("A", "desk", "repo"), B: colTop("B", "ci", "npm"), C: colTop("C", "cdns"), D: colTop("D", "dns") };
const STL = [["A", 0, "开发者电脑"], ["A", 1, "代码仓库"], ["B", 0, "依赖包"], ["B", 1, "构建"], ["C", 0, "托管"], ["C", 1, "CDN"], ["D", 0, "域名"]];
STL.forEach(([z, r, txt], i) => lb(`st-${i}`, up(COL[z], r * 52 / KW), txt, "lab-cs lab-sm"));
["A", "B", "C", "D"].forEach((z) => lb(`nc-${z}`, Wp(L.world.ZU[z], 700, 0), "未覆盖", "lab-g lab-sm", "t"));
lb("lb-clone", up(A.brw.top, 10), "克隆页", "lab-rs lab-sm");
lb("lb-audr", [L.rect(L.VEND, "vending")[2] + 60, A.vm.center[1]], "审计范围", "lab-cs lab-sm", "l");
// 供应链大括号（路前方）
{ const v = 300, a = Wp(L.world.ZU.A - 400, v, 0), b = Wp(L.world.ZU.D + 400, v, 0), a0 = Wp(L.world.ZU.A - 400, v - 140, 0), b0 = Wp(L.world.ZU.D + 400, v - 140, 0);
  const um = (L.world.ZU.A + L.world.ZU.D) / 2, m = Wp(um, v, 0), m1 = Wp(um, v + 120, 0);
  add({ u: um, v: v + 200 }, S.hid("brace", `<polyline points="${pts([a0, a, m, m1, m, b, b0])}" fill="none" stroke="#1d93ba" stroke-width="26" stroke-linejoin="round" stroke-linecap="round"/>`), 0);
  lb("lb-chain", m1, "供应链", "lab-cs", "t"); }

// ---------------------------------------------------------------- 屏幕层
S.curve("eye", S.scr("contractE", A.usr.head ?? A.usr.top), S.scr("contractE", A.brw.center), { color: "#2aa3c9" });
S.curve("far", [1850, 300], S.scr("bankE", A.tc.window1), { color: "#e0453a" });
const html = `<div id="dim"></div>` + evt("ev-no", `比喻 · 不成立处 ${gtag("解读")}`, { color: "#7d776b" });
const css = `#dim{position:absolute;left:0;top:0;width:1920px;height:1080px;background:#1c1c1c;opacity:0;pointer-events:none}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  st: STEPS.map(([, word]) => w(word, 12)),
  web: w("网页", 5), js: w("脚本", 5),
  vault: w("金库", 7), book: w("账本", 7), guard: w("保安", 7), swap: w("换了", 7),
  far: w("千里之外", 10), one: w("某一个客户", 10),
};
const t = (x) => f(x);
const walkTo = (i) => { const c = A.tc.customer; return [[c[0] - 30 + i * 30, c[1] + i * 14]]; };

S.build({
  cam0: "barE", sub: "你签的交易，是页面写的",
  grid: { u0: -2600, u1: 13100, v0: -8000, v1: 8100 }, box: [-900, -4500, 10500, 6000],   // 盖住上段终点 barE + contractE / bankE / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "依赖包", d: "别人写好、被项目引用的代码包", at: w("依赖包", 12) },
    { id: "t1", t: "CDN", d: "把文件缓存到各地、就近发给用户的网络", at: w("CDN", 12) },
    { id: "t2", t: "合约审计", d: "上线前请专家检查合约代码", at: w("合约审计", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。（从上段 barE 拉开到 contractE）
      cam(${t(LS[0])}, "contractE", 1.3);
      // ===== L1 用户不读合约，用户读页面。
      pop("#lb-noread", ${t(w("不读合约", 1))}, 0.25); pop("#lb-read", ${t(w("读页面", 1))}, 0.25); draw("eye", ${t(w("读页面", 1))}, 0.6);
      // ===== L2 页面告诉你，这笔交易是什么。
      out("#lb-read, #eye", ${t(LS[2] - 0.2)}, 0.2); fadeIn("#brw-row", ${t(LS[2] + 0.3)}, 0.4); pop("#lb-row", ${t(LS[2] + 0.5)}, 0.25);
      // ===== L3 钱包再把页面构造好的交易，交给你签名。
      out("#lb-row", ${t(LS[3] - 0.2)}, 0.2); fadeIn("#ltw", ${t(LS[3])}, 0.3);
      X1.walk(tl, "lt", ${t(LS[3] + 0.4)}, 1.6, [[${f(at(LT1)[0])}, ${f(at(LT1)[1])}]]);
      fadeIn("#ph-scr2", ${t(LS[3] + 2.0)}, 0.3); out("#ph-scr", ${t(LS[3] + 2.0)}, 0.3);
      // ===== L4 攻击者改掉页面……签下攻击交易：页面翻成克隆页，交易变红，合约仍绿
      out("#lb-noread", ${t(LS[4] - 0.2)}, 0.2);
      fadeIn("#brw-page2", ${t(LS[4] + 0.2)}, 0.35); fadeIn("#ltrw", ${t(w("签下", 4))}, 0.3); out("#ltw", ${t(w("签下", 4))}, 0.3);
      pop("#lb-aud", ${t(w("审计过的合约", 4))}, 0.25);
      // ===== L5 前端 = 网页 + 全部脚本
      out("#brw-page2, #ltrw, #lb-aud", ${t(LS[5] - 0.2)}, 0.2);
      fadeIn("#fe-box", ${t(LS[5] + 0.1)}, 0.4); pop("#lb-fe", ${t(LS[5] + 0.3)}, 0.3);
      [0, 1, 2].forEach((i) => fadeIn("#jsh-" + i, ${t(TM.js - 0.3)} + i * 0.3, 0.2));
      // ===== L6 银行柜台的玻璃上，贴着收款账号
      out("#fe-box, #lb-fe", ${t(LS[6] - 0.2)}, 0.2); cam(${t(LS[6])}, "bankE", 1.4);
      pop("#stk-g", ${t(w("收款账号", 6))}, 0.3);
      // ===== L7 金库、账本、保安都没问题，夜里换了贴纸
      pop("#ok-vault", ${t(TM.vault)}, 0.25); pop("#ok-book", ${t(TM.book)}, 0.25); pop("#ok-guard", ${t(TM.guard)}, 0.25);
      tl.to("#dim", { opacity: 0.5, duration: 0.3 }, ${t(TM.swap - 0.4)}); tl.to("#dim", { opacity: 0, duration: 0.4 }, ${t(TM.swap + 0.5)});
      out("#stk-g", ${t(TM.swap)}, 0.1); pop("#stk-r", ${t(TM.swap + 0.1)}, 0.3);
      // ===== L8 客户都把钱汇进新账号
      out("#ok-vault, #ok-book, #ok-guard", ${t(LS[8] - 0.2)}, 0.2);
      X1.walk(tl, "bl0", ${t(LS[8] + 0.3)}, 1.4, [[${walkTo(0)[0]}]]);
      X1.walk(tl, "bl1", ${t(LS[8] + 0.7)}, 1.4, [[${walkTo(1)[0]}]]);
      X1.walk(tl, "bl2", ${t(LS[8] + 1.1)}, 1.4, [[${walkTo(2)[0]}]]);
      // ===== L9 比喻不成立：换贴纸要进大厅
      pop("#ev-no", ${t(LS[9] + 0.1)}, 0.3); fadeIn("#door", ${t(w("大厅", 9) - 0.3)}, 0.4); pop("#lb-door", ${t(w("大厅", 9))}, 0.25);
      // ===== L10 千里之外，只对某一个客户显示假贴纸
      draw("far", ${t(TM.far)}, 0.8); bump("#stk-r", ${t(TM.far + 0.8)}, 1.15, 1);
      [0, 1, 2].forEach((i) => pop("#see" + i, ${t(TM.one)} + i * 0.2, 0.25)); bump("#see1", ${t(TM.one + 1.0)}, 1.2, 1); bump("#stk-r", ${t(LE[10] - 1.2)}, 1.15, 1);
      // ===== L11 一整串环节：拉到全景，管道灰
      out("#ev-no, #door, #lb-door, #far, #stk-r, #see0, #see1, #see2", ${t(LS[11] - 0.2)}, 0.2);
      cam(${t(LS[11])}, "wide", 1.8);
      // ===== L12 按词逐站点亮
      ${STEPS.map((_, i) => `fadeIn("#pl-${i}", ${t(TM.st[i])}, 0.35); pop("#st-${i}", ${t(TM.st[i])}, 0.25);`).join("\n      ")}
      // ===== L13 供应链大括号
      fadeIn("#brace", ${t(LS[13])}, 0.4); pop("#lb-chain", ${t(w("供应链", 13))}, 0.3);
      // ===== L14 任意一站闪红 → 红色流到浏览器 → 同一个克隆页
      ${["A", "B", "C", "D"].map((k, i) => { const t0 = LS[14] + 0.2 + i * 1.1;
        return `fadeIn("#ph-${k}", ${t(t0)}, 0.2); fadeIn("#pr-${k}", ${t(t0 + 0.2)}, 0.3); fadeIn("#brw-page2", ${t(t0 + 0.45)}, 0.2);` +
          (i === 0 ? ` pop("#lb-clone", ${t(t0 + 0.5)}, 0.25);` : ` bump("#lb-clone", ${t(t0 + 0.5)}, 1.15, 1);`) +
          (i < 3 ? ` out("#ph-${k}, #pr-${k}, #brw-page2", ${t(t0 + 0.95)}, 0.15);` : ""); }).join("\n      ")}
      // ===== L15 合约审计覆盖不到：审计框只罩合约，每站"未覆盖"
      out("#ph-D, #pr-D", ${t(LS[15] - 0.2)}, 0.2);
      fadeIn("#aud-box", ${t(LS[15])}, 0.4); pop("#lb-audr", ${t(LS[15] + 0.2)}, 0.25);
      ${["A", "B", "C", "D"].map((k, i) => `pop("#nc-${k}", ${t(w("覆盖不到", 15) + 0.1 + i * 0.2)}, 0.2);`).join(" ")}
`,
});
