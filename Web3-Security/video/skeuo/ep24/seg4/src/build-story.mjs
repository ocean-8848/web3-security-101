// ep24/seg4「④ 地址变成人」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.weakC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   homeA        A 用户 + 来电手机 + 信箱 + 硬件钱包 + 包裹 + SIM + 两只邮箱 + 白名单 + 两个攻击者，右侧留给题卡（seg1 L8–L13 终点；seg2 起点、L8–L12；seg6 L2–L10）
//   bookA        A–B 之间的肥羊通讯录 + 银行流水卡 + 上方链条 + 用户家（seg2 L3–L7 比喻）
//   callB        B 三个客服工位 + 客服后台 + 招募者 + 收买信封 + 导出摞 + 密码私钥框 + 点阵（seg1 起点 L0–L7）
//   backB        B 客服后台特写 + 导出摞 + 密码私钥框 + 收买信封 + 客服 2 工位（seg2 L13–L19 终点；seg3 起点；seg6 L0–L1）
//   streetC      C 四个摊位全景 + 点阵 + 论坛牌，支管从左边 B 接过来（seg3 L0–L1、L5–L6）
//   stall1C      C 摊位近景 ①–④（seg3 L2–L8 / L9–L12 / L13–L15 / L16–L18），①③④ 含各自的点阵 DOTS_C[0..2]
//   stall2C      
//   stall3C      
//   stall4C      
//   weakC        C 放大镜停在一个摊位上，四家都在画内（seg3 L19 终点；seg4 起点）
//   plazaD       D 链 + 四个地址 + 放大镜 + 交易所柜台 + 混币器 + 时钟 + 社交页手机（seg4 L0–L10）
//   coinjoinD    D 四个人 + 4 进 4 出的币 + 交易节点（seg4 L11–L14）
//   courtD       D 法庭天平 + 判决 / 上诉维持 + 放大镜落点 + 混币器 + 交易所柜台（seg4 L15–L23 终点；seg5 起点）
//   ctrlE        E 控制室全部防御物件（遮蔽屏幕、最小权限、导出审批、查询登记、告警、水印、合同 / 通知、提币冷却、工单权限、数据清单、暗网牌）；
//   archiveE     E 链上档案：公链、哈希漏斗、枚举机、盐罐、承诺箱、密钥、挂锁、节点（seg5 L14–L21 终点；seg6 起点）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   wide         整条数据街全景：A → E（seg6 L11–L12 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import { G as GG } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.courtD

// ---------------------------------------------------------------- 段内专用位置与镜头
const D0 = L.ZONE_ANCHOR.D;
const dz = (X, Y, extra = {}) => { const q = GG(D0[0] + X, D0[1] + Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const REAL = dz(-80, 400, { scale: 0.5 });      // L1–L2 "真人" 剪影（广场前排）
const TX1 = dz(-640, 430);                      // L4–L5 一笔交易节点（地址下方）
const PAY = dz(-300, 380);                      // L5 付款去向
const REAL2 = dz(330, 210, { scale: 0.5 });     // L22 柜台连到的真人（法庭镜头内）
const UC = dz(700, 330);                        // L19 卧底交易小文件（天平左盘前）
const SRC = dz(1380, 300);                      // L20 灰色"源代码"文件夹
const RW = L.world.rects;
const plazaL = L.fit([RW.chainD, ...RW.addrD, RW.magD, RW.teller, RW.lottery, RW.clockD, RW.phoneD, L.rect(REAL, "person"), L.rect(TX1, "txD")],
  [100, 290, 1400, 860], 1.4);                 // plazaD 让出右侧给"五种方法"清单卡
const CAMS = { ...L.CAMS, plazaL };

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E4, E7, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 包一层缩放（不支持 opts.scale 的物件），并换算 anchors
const wput = (key, o, r, k, dy = 0, outer = (s) => s) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { wrap: (svg) => outer(`<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`) });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const P = (o) => at(o);
const ln = (p, q, c = "#2aa3c9", wd = 4, dash = "10 8") => `<path d="M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
const arc = (p, q, lift, c = "#2aa3c9", wd = 4) => `<path d="M${f(p[0])} ${f(p[1])}Q${f((p[0] + q[0]) / 2)} ${f(Math.min(p[1], q[1]) - lift)} ${f(q[0])} ${f(q[1])}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-dasharray="10 8" stroke-linecap="round"/>`;
const ring = (pts, padX, padY, c, wd = 4) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const ang = Math.atan2(pts.at(-1)[1] - pts[0][1], pts.at(-1)[0] - pts[0][0]) * 180 / Math.PI;
  const rx = Math.hypot(pts.at(-1)[0] - pts[0][0], pts.at(-1)[1] - pts[0][1]) / 2 + padX;
  return { svg: `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${padY}" transform="rotate(${f(ang)} ${f(cx)} ${f(cy)})" fill="none" stroke="${c}" stroke-width="${wd}" stroke-dasharray="12 9"/>`, c: [cx, cy], rx, ang };
};
const TOP = 3000;                               // 叠加线画在所有物件之上

// ---------------------------------------------------------------- C 区（开场 weakC：上一段末帧）
L.STALL_PLATES.forEach((o, i) => put("cpl" + i, o, E1.signBoard(o, { id: "cpl" + i, style: "plate", text: ["电商与营销库", "破产案服务商", "客服工单平台", "邮件供应商"][i], size: 30 })));
L.PARCELS_C.forEach((o, i) => put("cpa" + i, o, E7.parcel(o, { id: "cpa" + i, scale: o.scale })));
put("cord", L.ORDER_DOC, O.doc(L.ORDER_DOC, { id: "cord", standing: true, w: 120, h: 150, title: "订单", lines: ["收货地址"] }));
wput("cphn", L.PHONE_C, O.phone(L.PHONE_C, { id: "cphn" }), 0.6);
put("csim", L.SIM_C, E22.simCard(L.SIM_C, { id: "csim", scale: 0.7, label: "手机号" }));
put("ccred", L.CRED_DOC, O.doc(L.CRED_DOC, { id: "ccred", standing: true, w: 120, h: 150, title: "债权人", lines: ["姓名", "地址", "邮箱", "余额"] }));
wput("cbkt", L.BUCKET_C, O.bucket(L.BUCKET_C, { id: "cbkt" }), 0.8);
put("ctkt", L.TICKET_DOC, O.doc(L.TICKET_DOC, { id: "ctkt", standing: true, w: 120, h: 150, title: "工单" }));
L.LETTERS_C.forEach((o, i) => put("clt" + i, o, E1.letter(o, { id: "clt" + i, w: 60, h: 40 })));
put("cmag", L.MAG_C, O.magnifier(L.MAG_C, { id: "cmag" }));

// ---------------------------------------------------------------- D 区 · 链上广场
put("sgd", L.SIGN_D, E1.signBoard(L.SIGN_D, { id: "sgd", style: "plate", text: "链上广场", size: 34 }));
wput("chn", L.CHAIN_D, O.chain(L.CHAIN_D, { id: "chn", n: 4 }), 0.8);
L.ADDR_D.forEach((o, i) => wput("ad" + i, o, E2.addrPlate(o, { id: "ad" + i, text: `地址 ${i + 1}` }), 0.7));
put("magd", L.MAG_D, O.magnifier(L.MAG_D, { id: "magd" }), 0, { wrap: (s) => `<g id="magmv">${s}</g>` });
put("tel", L.TELLER_D, E4.tellerCounter(L.TELLER_D, { id: "tel", scale: 0.6, sign: "交易所 · KYC" }));
wput("lot", L.LOTTERY_D, E2.lottery(L.LOTTERY_D, { id: "lot", plate: "混币器" }), 0.6);
put("clk", L.CLOCK_D, O.clock(L.CLOCK_D, { id: "clk" }));
const SOC2 = `<rect x="0" y="0" width="76" height="26" fill="#1d93ba"/><circle cx="38" cy="56" r="20" fill="#f3b04a" stroke="#1c1c1c" stroke-width="2"/><circle cx="31" cy="52" r="3" fill="#1c1c1c"/><circle cx="45" cy="52" r="3" fill="#1c1c1c"/><rect x="8" y="88" width="60" height="8" rx="4" fill="#1d93ba"/><rect x="8" y="104" width="44" height="7" rx="3.5" fill="#ddd6c9"/><rect x="8" y="118" width="54" height="7" rx="3.5" fill="#ddd6c9"/>`;
wput("phd", L.PHONE_D, O.phone(L.PHONE_D, { id: "phd", screen2: SOC2 }), 0.7);
put("real", REAL, O.person(REAL, { id: "real", scale: 0.5, color: "#6d685e" }), 0, { wrap: (s) => S.hid("realg", s) });
// CoinJoin：四个人 + 4 进 4 出
L.PEOPLE_D.forEach((o, i) => put("pp" + i, o, O.person(o, { id: "pp" + i, scale: 0.45, role: "signer" }), 0, { grow: true }));
L.PEOPLE_D.forEach((o, i) => { if (i) put("pr" + i, o, O.person(o, { id: "pr" + i, scale: 0.45, color: "#e0453a" }), 0.2, { wrap: (s) => S.hid("prg" + i, s) }); });
L.COINS_IN.forEach((o, i) => put("ci" + i, o, E7.oddCoin(o, { id: "ci" + i, scale: 0.55 }), 0, { grow: true }));
L.COINS_OUT.forEach((o, i) => put("co" + i, o, E7.oddCoin(o, { id: "co" + i, scale: 0.55 }), 0, { grow: true }));
const txNode = (o, id, txt) => { const [x, y] = P(o); return S.hid(id, `<path d="M${x} ${y - 34}L${x + 46} ${y - 18}L${x} ${y - 2}L${x - 46} ${y - 18}Z" fill="#ffffff" stroke="#1d93ba" stroke-width="4"/><text x="${x}" y="${y - 10}" text-anchor="middle" font-size="22" font-weight="900" fill="#1d93ba">${txt}</text>`); };
add(L.TX_D, txNode(L.TX_D, "txd", "交易"), 1);
add(TX1, txNode(TX1, "tx1", "交易"), 1);
// 法庭
put("sgc", L.SIGN_COURT, E1.signBoard(L.SIGN_COURT, { id: "sgc", style: "plate", text: "法庭", size: 34 }));
wput("bal", L.BALANCE, E1.balance(L.BALANCE, { id: "bal", tilt: 0, glow: false }), 0.7);
put("dj", L.DOCS_COURT[0], O.doc(L.DOCS_COURT[0], { id: "dj", standing: true, w: 120, h: 150, title: "判决", lines: ["陪审团", "四项罪名", "成立"] }), 0, { grow: true });
put("ds", L.DOCS_COURT[1], O.doc(L.DOCS_COURT[1], { id: "ds", standing: true, w: 120, h: 150, title: "上诉", lines: ["维持定罪"], stamp: true, stampText: "维持" }), 0, { grow: true });
put("uc", UC, O.doc(UC, { id: "uc", standing: true, w: 90, h: 110, title: "卧底", lines: ["交易"] }), 0, { grow: true });
{ const [x, y] = P(SRC); add(SRC, S.hid("srcf", `<path d="M${x - 60} ${y - 70}h40l10 -10h70v80h-120z" fill="#c9c3b6" stroke="#8a8478" stroke-width="3"/><rect x="${x - 60}" y="${y - 62}" width="120" height="62" rx="4" fill="#ddd7cb" stroke="#8a8478" stroke-width="3"/><text x="${x}" y="${y - 22}" text-anchor="middle" font-size="22" font-weight="900" fill="#6d685e">源代码</text>`)); }
put("real2", REAL2, O.person(REAL2, { id: "real2", scale: 0.5, color: "#6d685e" }), 0, { wrap: (s) => S.hid("real2g", s) });

// ---------------------------------------------------------------- 叠加线（原生 SVG，默认隐藏）
const ad = [0, 1, 2, 3].map((i) => A["ad" + i]);
const adG = ad.map((a) => a.ground), adT = ad.map((a) => a.top);
add(REAL, S.hid("l1", ln(up(adT[0], -40), A.real.center, "#8a8478")), TOP);
const ent = ring(adT.slice(0, 3).map((p) => up(p, -50)), 70, 95, "#2aa3c9");
add(REAL, S.hid("ent", ent.svg + ln([ent.c[0] + ent.rx * 0.9, ent.c[1] + 20], A.real.center, "#2aa3c9")), TOP);
const tx1 = up(P(TX1), 18);
add(TX1, S.hid("l4", ln(adG[0], tx1) + ln(adG[1], tx1)), TOP);
const own = ring([adG[0], adG[1]].map((p) => up(p, 60)), 60, 110, "#2aa3c9");
add(TX1, S.hid("own", own.svg), TOP);
add(TX1, S.hid("l5", ln(tx1, P(PAY), "#1c1c1c") + arc(tx1, adG[3], 60, "#1d93ba", 5)), TOP);
add(L.TELLER_D, S.hid("l7", ln(adG[3], A.tel.customer ?? A.tel.center, "#2aa3c9", 5)), TOP);
const lotIn = up(A.lot.drum, -10), lotOut = A.lot.tray;
add(L.LOTTERY_D, S.hid("l8", arc([lotIn[0] - 150, lotIn[1] + 40], [lotOut[0] + 120, lotOut[1] + 30], 230, "#2aa3c9", 4)), TOP);
add(L.PHONE_D, S.hid("l9", ln(A.phd.screen, up(adT[1], -60), "#2aa3c9", 4)), TOP);
const cin = L.COINS_IN.map((o, i) => A["ci" + i]);
const txd = up(P(L.TX_D), 18);
add(L.TX_D, S.hid("lcj", cin.map((c) => ln(c.ground, txd, "#8a8478", 3)).join("") + L.COINS_OUT.map((o, i) => ln(txd, A["co" + i].ground, "#8a8478", 3)).join("")), TOP);
const same = ring(cin.map((c) => c.center), 60, 80, "#e0453a", 5);
add(L.TX_D, S.hid("same", same.svg), TOP);
add(L.TX_D, S.hid("samex", `<path d="M${f(same.c[0] - 40)} ${f(same.c[1] - 40)}l80 80M${f(same.c[0] + 40)} ${f(same.c[1] - 40)}l-80 80" stroke="#e0453a" stroke-width="10" stroke-linecap="round"/>`), TOP);
const pph = [0, 1, 2, 3].map((i) => A["pp" + i].head ?? A["pp" + i].top);
[1, 2, 3].forEach((i) => add(L.PEOPLE_D[i], S.hid("sp" + i, arc(up(pph[0], 10), up(pph[i], 10), 50 + i * 20, "#e0453a", 4)), TOP));
add(L.LOTTERY_D, S.hid("l21", arc(A.lot.tray, A.tel.center, 140, "#e0453a", 4)), TOP);
add(REAL2, S.hid("l22", ln(A.tel.center, A.real2.center, "#e0453a", 9, "16 10")), TOP);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pub", up(A.chn.top, 8), "公开", "lab-cs");
ad.forEach((a, i) => lb("q" + i, up(a.top, 6), "?", "lab-g lab-sm"));
lb("lb-real", up(A.real.top, 6), "真人", "lab-ink lab-sm");
lb("lb-ent", [ent.c[0] - ent.rx * 0.6, ent.c[1] - 70], "实体", "lab-cs lab-sm");
lb("lb-own", [own.c[0], own.c[1] + 130], "同一所有者", "lab-cs lab-sm", "t");
lb("lb-chg", [adG[3][0] - 40, adG[3][1] + 40], "找零 → 自己", "lab-cs lab-sm", "t");
lb("lb-pay", [P(PAY)[0] + 12, P(PAY)[1]], "付款", "lab-g lab-sm", "l");
lb("lb-kyc", up(A.tel.top, 6), "身份 · KYC", "lab-cs");
lb("lb-tin", [lotIn[0] - 150, lotIn[1] + 50], "等额进", "lab-cs lab-sm", "t");
lb("lb-tout", [lotOut[0] + 120, lotOut[1] + 40], "等额出", "lab-cs lab-sm", "t");
lb("lb-time", up(A.clk.top, 6), "时间相近", "lab-cs lab-sm");
lb("lb-ens", up(A.phd.top, 6), "0x… · name.eth", "lab-cs lab-sm");
[0, 1, 2, 3].forEach((i) => lb("n" + i, up(A["pp" + i].top, 6), String(i + 1), "lab-cs lab-sm"));
lb("lb-same", [same.c[0], same.c[1] + 90], "同一个人？", "lab-r", "t");
lb("lb-kyc0", [A.pp0.center[0] - 40, A.pp0.center[1]], "KYC", "lab-rs lab-sm", "r");
lb("lb-court", up(A.sgc.top, 6), "已进法庭", "lab-ink lab-sm");
lb("lb-fog", up(A.lot.top, 74), "Bitcoin Fog", "lab-ink");
lb("lb-btc", up(A.lot.top, 4), "120 万余枚 BTC", "lab-cs lab-sm");
lb("lb-chk", up(A.dj.top, 6), "✓ ✓ ✓ ✓", "lab-r lab-sm");
const MC = P(L.MAG_COURT), MD = P(L.MAG_D);
const magTop = [A.magd.top[0] + MC[0] - MD[0], A.magd.top[1] + MC[1] - MD[1]];
lb("lb-evid", up(magTop, -10), "分析可作证据", "lab-gs");
lb("lb-uc", up(A.uc.top, 6), "其他证据印证", "lab-g lab-sm");
lb("lb-src", up(P(SRC), 90), "未要求公开", "lab-g lab-sm");
lb("lb-anon", up(A.tel.top, 6), "≠ 匿名", "lab-rs");
lb("lb-key", [(A.tel.center[0] + A.real2.center[0]) / 2 + 30, (A.tel.center[1] + A.real2.center[1]) / 2 + 30], "关键一环", "lab-rs lab-sm", "l");
lb("lb-gd", [magTop[0] - 70, magTop[1] + 40], "追踪被盗资金", "lab-gs", "r");
lb("lb-bad", [magTop[0] + 70, magTop[1] + 40], "筛选目标", "lab-rs", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const MTH = { x: 1440, y: 300, w: 420 };
const html = codeCard("mth", { ...MTH, head: "五种方法", rows: ["① 共同输入", "② 找零地址", "③ 交易所出入金", "④ 时间与金额", "⑤ 链下关联"] })
  + kw("kw-heu", `启发式 · <b>可能误判</b>`, { x: 1440, y: 680, size: 36, accent: "#e0453a" })
  + kw("kw-ex", `CoinJoin ${gtag("示例 · 误判")}`, { x: 1300, y: 300, size: 36, accent: "#e0453a" })
  + evt("ev-fog", `<b>Bitcoin Fog</b> 案`)
  + evt("ev-irs", `来源 · IRS-CI 新闻稿`, { top: 210, color: "#8a8478" })
  + evt("ev-cs", `来源 · CryptoSlate 报道`, { top: 210, color: "#8a8478" });
const css = `#mth .c-row { transition: none; } .mth-dim { color: #9a9387 !important; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);
// 放大镜：扫过地址的位移（以镜片为准）、落到天平托盘的位移（以地面点为准）
const sweep = [0, 1, 2].map((i) => [adT[i][0] - A.magd.lens[0], adT[i][1] - 90 - A.magd.lens[1]].map((v) => Math.round(v)));
const toCourt = [Math.round(MC[0] - MD[0]), Math.round(MC[1] - MD[1])];

S.build({
  cam0: "weakC", sub: "一个地址，牵出一个人",
  grid: { u0: 4100, u1: 12400, v0: -4200, v1: 4000 }, box: [3700, -3800, 6000, 2800],   // 覆盖本段镜头 weakC / plazaD / coinjoinD / courtD（含上段段尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "去匿名化", d: "把匿名地址关联到真实身份", at: w("去匿名化", 1) },
    { id: "t1", t: "ENS", d: "以太坊上的域名，像 name.eth", at: w("ENS", 9) },
    { id: "t2", t: "启发式规则", d: "经验判断，不保证正确", at: w("启发式规则", 10) },
    { id: "t3", t: "CoinJoin", d: "多人合成一笔交易来混淆来源", at: w("CoinJoin", 13) },
    { id: "t4", t: "混币器", d: "把多人资金混在一起再分出的服务", at: w("混币器", 16) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 右移到广场，链一节节亮起
      out("#cmag", ${t(LS[0])}, 0.3); cam(${t(LS[0])}, "plazaL", 1.6);
      [0, 1, 2, 3].forEach((i) => flash("#chn-b" + i, ${t(LS[0] + 1.6)} + i * 0.3, 1, 0.35)); pop("#lb-pub", ${t(LS[0] + 2.4)});
      // ===== L1 地址上方问号；虚线连到真人剪影
      [0, 1, 2, 3].forEach((i) => pop("#q" + i, ${t(LS[1] + 0.3)} + i * 0.15, 0.25));
      fadeIn("#realg", ${t(LS[1] + 1.4)}, 0.4); pop("#lb-real", ${t(LS[1] + 1.7)}); fadeIn("#l1", ${t(LS[1] + 2.2)}, 0.5);
      // ===== L2 放大镜扫过地址 → 圈成实体 → 连到真人
      out("#l1, #q0, #q1, #q2, #q3", ${t(LS[2] - 0.1)}, 0.2);
      const MV = (t0, a, b, d) => tl.fromTo("#magmv", { x: a[0], y: a[1] }, { x: b[0], y: b[1], duration: d, ease: "power2.inOut", immediateRender: false }, t0);
      const SW = ${JSON.stringify(sweep)}; [[0, 0], ...SW].slice(0, 3).forEach((a, i) => MV(${t(LS[2])} + i * 0.7, a, SW[i], 0.6));
      MV(${t(LS[2] + 2.2)}, SW[2], [0, 0], 0.6);
      fadeIn("#ent", ${t(LS[2] + 2.4)}, 0.5); pop("#lb-ent", ${t(LS[2] + 2.6)});
      // ===== L3 五种方法清单，第一行亮
      out("#ent, #lb-ent", ${t(LS[3] - 0.2)}, 0.2); pop("#mth", ${t(LS[3])}); hot("#mth-r0", ${t(LS[3] + 0.5)}, "#e3f3f9");
      // ===== L4 两个地址进同一笔交易 → 同一所有者
      fadeIn("#tx1", ${t(LS[4])}, 0.3); fadeIn("#l4", ${t(LS[4] + 0.4)}, 0.5); fadeIn("#own", ${t(LS[4] + 2.0)}, 0.5); pop("#lb-own", ${t(LS[4] + 2.2)});
      // ===== L5 找零折回自己的地址
      hot("#mth-r0", ${t(LS[5])}, "#ffffff"); hot("#mth-r1", ${t(LS[5])}, "#e3f3f9");
      out("#own, #lb-own", ${t(LS[5])}, 0.2); fadeIn("#l5", ${t(LS[5] + 1.2)}, 0.5); pop("#lb-pay", ${t(LS[5] + 1.5)}); pop("#lb-chg", ${t(LS[5] + 2.4)});
      // ===== L6 交易所出入金
      hot("#mth-r1", ${t(LS[6])}, "#ffffff"); hot("#mth-r2", ${t(LS[6])}, "#e3f3f9");
      out("#l4, #l5, #lb-pay, #lb-chg, #tx1", ${t(LS[6])}, 0.2); flash("#tel", ${t(LS[6] + 0.5)}, 2, 0.5);
      // ===== L7 地址 4 连到柜台，柜台亮出身份
      fadeIn("#l7", ${t(LS[7] + 0.3)}, 0.5); pop("#lb-kyc", ${t(w("KYC", 7))});
      // ===== L8 混币器转、时钟走、进出等额配对
      hot("#mth-r2", ${t(LS[8])}, "#ffffff"); hot("#mth-r3", ${t(LS[8])}, "#e3f3f9");
      out("#l7, #lb-kyc", ${t(LS[8])}, 0.2); KIT.drum(tl, "lot", ${t(LS[8] + 0.2)}, 1.6, 1); KIT.clock(tl, "clk", ${t(LS[8] + 0.4)}, 1.4, 90);
      pop("#lb-tin", ${t(LS[8] + 1.6)}); pop("#lb-tout", ${t(LS[8] + 2.0)}); fadeIn("#l8", ${t(LS[8] + 2.2)}, 0.5); pop("#lb-time", ${t(LS[8] + 2.6)});
      // ===== L9 社交页贴出 name.eth，连到地址 2
      hot("#mth-r3", ${t(LS[9])}, "#ffffff"); hot("#mth-r4", ${t(LS[9])}, "#e3f3f9");
      out("#l8, #lb-tin, #lb-tout, #lb-time", ${t(LS[9])}, 0.2); fadeIn("#phd-scr2", ${t(LS[9] + 0.4)}, 0.3); pop("#lb-ens", ${t(LS[9] + 0.8)});
      fadeIn("#l9", ${t(LS[9] + 1.6)}, 0.5);
      // ===== L10 五种方法一齐变灰 + 启发式会误判
      hot("#mth-r4", ${t(LS[10])}, "#ffffff"); tl.to("#mth .c-row", { color: "#a49d90", duration: 0.3 }, ${t(LS[10] + 0.3)});
      pop("#kw-heu", ${t(w("启发式规则", 10))});
      // ===== L11 推到 coinjoinD：四人各出一枚币，4 进 4 出
      out("#mth, #kw-heu, #l9, #lb-ens, #lb-pub, #realg, #lb-real", ${t(LS[11] - 0.2)}, 0.2); cam(${t(LS[11])}, "coinjoinD", 1.4);
      [0, 1, 2, 3].forEach((i) => { grow("pp" + i, ${t(LS[11] + 1.0)} + i * 0.15); grow("ci" + i, ${t(LS[11] + 1.6)} + i * 0.15); });
      fadeIn("#txd", ${t(LS[11] + 2.2)}, 0.3); fadeIn("#lcj", ${t(LS[11] + 2.4)}, 0.5);
      [0, 1, 2, 3].forEach((i) => grow("co" + i, ${t(LS[11] + 2.8)} + i * 0.12)); pop("#kw-ex", ${t(LS[11] + 1.4)});
      // ===== L12 红圈：同一个人？
      fadeIn("#same", ${t(LS[12] + 0.6)}, 0.5); pop("#lb-same", ${t(LS[12] + 1.0)});
      // ===== L13 四人头上 1–4，圈上红叉
      [0, 1, 2, 3].forEach((i) => pop("#n" + i, ${t(w("CoinJoin", 13))} + i * 0.2, 0.25)); fadeIn("#samex", ${t(LS[13] + 2.6)}, 0.3);
      // ===== L14 关键画面：KYC 身份沿红虚线扩散到另外 3 人
      out("#n1, #n2, #n3", ${t(LS[14])}, 0.2); pop("#lb-kyc0", ${t(LS[14] + 0.3)});
      [1, 2, 3].forEach((i) => { fadeIn("#sp" + i, ${t(LS[14] + 1.3)} + (i - 1) * 0.6, 0.4); fadeIn("#prg" + i, ${t(LS[14] + 1.6)} + (i - 1) * 0.6, 0.3); });
      // ===== L15 移向法庭
      out("#kw-ex, #same, #samex, #lb-same, #lb-kyc0, #n0, #sp1, #sp2, #sp3, #lcj, #txd, #prg1, #prg2, #prg3", ${t(LS[15] - 0.2)}, 0.2); cam(${t(LS[15])}, "courtD", 1.4);
      pop("#lb-court", ${t(LS[15] + 1.5)});
      // ===== L16 Bitcoin Fog · 120 万余枚 BTC
      out("#lb-court", ${t(LS[16])}, 0.2); pop("#lb-fog", ${t(LS[16] + 0.2)}); pop("#lb-btc", ${t(w("120", 16))}); pop("#ev-fog", ${t(LS[16] + 0.4)}); pop("#ev-irs", ${t(LS[16] + 1.0)});
      // ===== L17 判决立起，四个红勾
      grow("dj", ${t(LS[17] + 0.4)}); pop("#lb-chk", ${t(LS[17] + 3.0)});
      // ===== L18 放大镜落到天平左盘，天平倾向"证据"
      MV(${t(LS[18])}, [${toCourt[0] - 500}, ${toCourt[1] - 120}], [${toCourt[0]}, ${toCourt[1]}], 0.9);
      X1.tilt(tl, "bal", ${t(LS[18] + 1.2)}, 12); pop("#lb-evid", ${t(LS[18] + 2.0)});
      // ===== L19 卧底交易同侧印证
      grow("uc", ${t(LS[19] + 0.3)}); pop("#lb-uc", ${t(LS[19] + 1.0)}); X1.tilt(tl, "bal", ${t(LS[19] + 0.8)}, 16);
      // ===== L20 上诉维持 + 源代码合着
      out("#ev-irs", ${t(LS[20])}, 0.2); out("#lb-chk", ${t(LS[20])}, 0.2); grow("ds", ${t(LS[20] + 0.4)}); fadeIn("#srcf", ${t(LS[20] + 2.8)}, 0.4); pop("#lb-src", ${t(LS[20] + 3.4)});
      pop("#ev-cs", ${t(LS[20] + 0.8)});
      // ===== L21 混币器出口一路连到柜台：≠ 匿名
      out("#ev-fog, #ev-cs, #lb-evid, #lb-uc, #lb-src, #lb-btc", ${t(LS[21] - 0.2)}, 0.2); fadeIn("#l21", ${t(LS[21] + 0.3)}, 0.6); pop("#lb-anon", ${t(LS[21] + 1.0)});
      // ===== L22 柜台到真人的红粗线：关键一环
      fadeIn("#real2g", ${t(LS[22] + 0.4)}, 0.4); fadeIn("#l22", ${t(LS[22] + 1.4)}, 0.5); pop("#lb-key", ${t(LS[22] + 2.2)});
      // ===== L23 放大镜两侧：追踪被盗资金 / 筛选目标（停在 courtD）
      out("#lb-anon", ${t(LS[23] - 0.2)}, 0.2); pop("#lb-gd", ${t(LS[23] + 0.6)}); pop("#lb-bad", ${t(w("攻击者", 23))});
`,
});
