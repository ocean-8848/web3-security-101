// ep19/seg5「⑤ 拦在每一步」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.guardE（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：确认街五个区（seg6 L13–L14 → 结束卡）
//   A            A 转账台全景
//   deskA        A 近景：用户 + 钱包 + 交易记录 + 测试信封 + 真实收款方（seg1 起点 L0–L2）
//   platesA      A 交易记录 + 两个门牌 + 时钟 + 攻击者 + 点阵（seg1 L3–L5）
//   userA        A 用户全身 + 钱包（seg1 L6–L8）
//   quizA        A 门牌特写，右侧留题卡位（seg1 L9–L11 终点；seg2 起点；seg6 L9–L12）
//   poisonA      A 投毒机制：门牌 + GPU + 计数器 + 交易记录 + 点阵（seg4 起点 L0–L11）
//   signB        B 签名柜台全景（seg2 L0–L2）
//   B            
//   receiptB     B 签收单比喻：空投窗口 + 用户 + 手机 + 包裹 + 签收单 + 钥匙（seg2 L3–L6）
//   chequesB     B 五张支票展台 + 链 + 油泵 + NFT（seg2 L7–L17）
//   vaultB       B 金库 + owner 卡 + 铸币机 + 点阵（seg2 L18–L22）
//   delegB       B 7702 委托牌 + 攻击者 + 小点阵（seg2 L23–L25 终点；seg3 起点）
//   shopC        C 钓鱼工坊全景（seg3 L0–L1）
//   C            
//   splitC       C 开发者 / 分发者 / 渠道 / 披萨（seg3 L2–L7）
//   botsC        C 扫币机器人（seg3 L8–L9）
//   kitsC        C 三块套件牌 + 机器人（seg3 L10–L15）
//   trendC       C 年度趋势点阵（seg3 L16–L20 终点；seg4 起点）
//   stallD       D 代币摊全景（seg4 L12–L15）
//   D            
//   casesD       D 三块案例牌 + 名人推广 + 摊位（seg4 L16–L20 终点；seg5 起点）
//   guardE       E 防线全景（seg5 L0–L3）
//   E            
//   walletE      E 钱包层：手机 + 支票 + 盾牌 + 台秤 + 关卡 + 委托牌（seg5 L4–L11）
//   exchE        E 交易所层：白名单 + 沙漏 + 账本 + 门牌 + 放大镜（seg5 L12–L18 终点）
//   rolesE       E 角色板（seg6 起点 L0–L8）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import { G } from "../../../kit/iso.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.rolesE (seg6 cam0)

// 段内镜头：钱包层 / 交易所层整体右移，左侧留给代码卡和清单卡
const CAMS5 = {
  ...L.CAMS,
  walletR: L.fit(L.GROUPS.walletE, [640, 290, 1830, 860], 1.4),
  exchR: L.fit(L.GROUPS.exchE, [640, 290, 1830, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS5, ext: [E1, E2, E6, E7, E8, E9, E11, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层，并换算 anchors
const wrapK = (key, o, k) => {
  const [gx, gy] = at(o);
  return {
    wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`,
    fix: () => { for (const n of ["top", "center", "ground", "screen"]) if (A[key][n]) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k]; },
  };
};
const C2 = (X, Y) => { const q = G(X, Y); return { u: q.u, v: q.v }; };   // 世界画布点 → 地面点

// ---------------------------------------------------------------- 世界物件
// 石板路（原生 SVG，画在所有物件后面）
{
  const [[, RY]] = L.ROAD, x0 = 1300, x1 = 8600;
  let s = `<rect x="${x0}" y="${RY - 80}" width="${x1 - x0}" height="160" fill="#dcd7cd"/>`
    + `<path d="M${x0} ${RY - 80}H${x1}M${x0} ${RY + 80}H${x1}" stroke="#c9c2b4" stroke-width="3"/>`;
  for (let x = x0; x < x1; x += 90) s += `<path d="M${x} ${RY - 80}V${RY}M${x + 45} ${RY}V${RY + 80}" stroke="#cfc8bb" stroke-width="2"/>`;
  s += `<path d="M${x0} ${RY}H${x1}" stroke="#cfc8bb" stroke-width="2"/>`;
  add(L.ACTS_E[0], s, -1e6);
}

// ---- D 代币摊（开场画面 = 上段结尾 casesD）
{ const k = wrapK("towD", L.TOWER_D, 0.6); put("towD", L.TOWER_D, O.tower(L.TOWER_D, { id: "towD" }), 0, { wrap: k.wrap }); k.fix(); }
put("stall", L.STALL_D, E8.marketStall(L.STALL_D, { id: "stall", scale: 0.8, price: "↑", head: "新币" }));
put("pool", L.POOL_D, E8.ammPool(L.POOL_D, { id: "pool", scale: 0.8, labelL: "新币", labelR: "USDT" }));
put("team", L.TEAM_D, O.person(L.TEAM_D, { id: "team", role: "attacker", scale: 0.5 }));
L.ODD_D.forEach((q, i) => put("oddD" + i, q, E7.oddCoin(q, { id: "oddD" + i, scale: 0.6 })));
put("burn", L.BURN_D, E6.burnBox(L.BURN_D, { id: "burn", scale: 0.8, plate: "貔貅盘", sub: "只进不出", cards: 0 }));
put("mintD", L.MINT_D, E11.mintPress(L.MINT_D, { id: "mintD", scale: 0.6, plate: "隐藏增发" }));
["SQUID", "LIBRA", "979 个"].forEach((tx, i) => put("case" + i, L.CASES_D[i], E1.signBoard(L.CASES_D[i], { id: "case" + i, style: "plate", text: tx, size: 34 })));

// ---- E 防线
// 四个动作图标（原生 SVG）+ 每个前面的道闸
const ACT_N = ["点击", "签名", "复制", "粘贴"];
const glyph = [
  `<path d="M-10 -78L-10 -40L-1 -48L6 -32L12 -35L5 -51L17 -51Z" fill="#1c1c1c"/>`,
  `<path d="M-18 -42q8 -14 14 -2t14 -4" fill="none" stroke="#1c1c1c" stroke-width="4" stroke-linecap="round"/><path d="M4 -52L18 -76L24 -72L10 -48Z" fill="#1d93ba"/>`,
  `<rect x="-18" y="-76" width="24" height="28" rx="3" fill="#ffffff" stroke="#1c1c1c" stroke-width="3.5"/><rect x="-6" y="-64" width="24" height="28" rx="3" fill="#ffffff" stroke="#1c1c1c" stroke-width="3.5"/>`,
  `<rect x="-16" y="-72" width="32" height="38" rx="3" fill="#ffffff" stroke="#1c1c1c" stroke-width="3.5"/><rect x="-8" y="-78" width="16" height="10" rx="2" fill="#1d93ba"/><path d="M-9 -56H9M-9 -46H5" stroke="#1c1c1c" stroke-width="3"/>`,
];
const ACT_P = L.ACTS_E.map((q) => at(q));
ACT_P.forEach(([X, Y], i) => {
  const icon = `<ellipse cx="${X}" cy="${Y}" rx="46" ry="16" fill="#1c1c1c" opacity="0.12"/>`
    + `<g transform="translate(${X},${Y})"><rect x="-36" y="-96" width="72" height="72" rx="14" fill="#c9c2b4"/><rect x="-36" y="-100" width="72" height="72" rx="14" fill="#ffffff" stroke="#1d93ba" stroke-width="4"/><rect x="-5" y="-26" width="10" height="24" fill="#8d939b"/>${glyph[i]}</g>`;
  add(L.ACTS_E[i], S.hid("glw" + i, `<ellipse cx="${X}" cy="${Y}" rx="70" ry="24" fill="#1f9d55" opacity="0.35"/>`), -2);
  add(L.ACTS_E[i], S.hid("act" + i, icon));
  const px = X - 62, py = Y + 6;   // 道闸立柱在图标左前方，横杆向右横过图标
  add(L.ACTS_E[i], S.hid("bar" + i, `<rect x="${px - 6}" y="${py - 64}" width="12" height="64" rx="3" fill="#4b4f56"/>`
    + `<g id="arm${i}"><rect x="${px}" y="${py - 64}" width="128" height="12" rx="6" fill="#ffffff" stroke="#c3352b" stroke-width="2"/>`
    + [0, 1, 2, 3].map((j) => `<rect x="${px + 10 + j * 30}" y="${py - 64}" width="14" height="12" fill="#e0453a"/>`).join("") + `</g>`), 4);
  lb("lb-act" + i, [X, Y + 12], ACT_N[i], "lab-cs lab-sm", "t");
});

{ const k = wrapK("phE", L.PHONE_E, 1.4);
  const hex = `<rect width="76" height="150" fill="#f4f2ee"/><rect width="76" height="22" fill="#d9d3c7"/><text x="38" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="#5f5a50" font-family="Noto Sans SC">签名请求</text>`
    + ["0x095ea7b3", "00000000", "3f9a…e9c4", "ffffffff", "ffffffff", "00000000"].map((s, i) => `<text x="7" y="${40 + i * 15}" font-size="9" font-family="monospace" fill="#8d939b">${s}</text>`).join("");
  const row = (y, k1, v, c) => `<text x="7" y="${y}" font-size="9" fill="#5f5a50" font-family="Noto Sans SC">${k1}</text><text x="7" y="${y + 13}" font-size="11" font-weight="700" fill="${c}" font-family="Noto Sans SC">${v}</text>`;
  const dec = `<g id="phE-dec"><rect width="76" height="150" fill="#ffffff"/><rect width="76" height="22" fill="#1f9d55"/><text x="38" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Noto Sans SC">已解码</text>`
    + row(38, "授权给", "0x3f…e9", "#1c1c1c") + row(66, "额度", "无限", "#e0453a") + row(94, "期限", "永久", "#e0453a") + row(122, "委托", "扫币合约", "#e0453a") + `</g>`;
  const bad = `<g id="phE-bad" opacity="0"><rect width="76" height="150" fill="#fbe9e7"/><rect width="76" height="22" fill="#e0453a"/><text x="38" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Noto Sans SC">警告</text><text x="38" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#e0453a" font-family="Noto Sans SC">无法解析</text><path d="M26 98L50 122M50 98L26 122" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/></g>`;
  put("phE", L.PHONE_E, O.phone(L.PHONE_E, { id: "phE", screen: hex, screen2: dec + bad }), 0, { wrap: k.wrap }); k.fix(); }
put("chq", L.CHEQUE_E, E9.cheque(L.CHEQUE_E, { id: "chq", scale: 1.3, amount: "授权", title: "签名请求",
  labels: ["授权给", "额度", "期限", "委托", "网站"], vals: ["0x3f…", "无限", "永久", "扫币", "…"] }));
put("shd", L.SHIELD_E, O.shield(L.SHIELD_E, { id: "shd" }));
put("adE", L.ADDR_E, E2.addrPlate(L.ADDR_E, { id: "adE", text: "我的地址" }));
{ const h = E15.delegateTagOn(L.ADDR_E, { id: "tagE", state: "attacker", target: "扫币合约" }); put("tagE", h.o, E15.delegateTag(h.o, h.opts)); }
put("scE", L.SCALE_E, E7.scale(L.SCALE_E, { id: "scE", scale: 0.9 }));
put("gate", L.CHECK_E, O.checkpoint(L.CHECK_E, { id: "gate", n: "域", armUp: true }));
// 网站发起的委托信封 / 仿冒域名信封（从左边走来，被拦下弹回）
const L8a = at(L.ADDR_E), L8o = C2(L8a[0] - 230, L8a[1] + 40);
put("lt8", L8o, E1.letter(L8o, { id: "lt8", state: "attacker" }));
const GA = at(L.CHECK_E), L10o = C2(GA[0] - 330, GA[1] + 60);
put("lt10", L10o, E1.letter(L10o, { id: "lt10", state: "attacker" }));
S.grow("lt8", "lt10");

put("wl", L.WL_E, E1.signBoard(L.WL_E, { id: "wl", style: "plate", text: "白名单", size: 34 }));
put("hrE", L.HOUR_E, O.hourglass(L.HOUR_E, { id: "hrE" }));
put("oddE", L.ODD_E, E7.oddCoin(L.ODD_E, { id: "oddE", scale: 0.6, state: "attacker" }));
put("ad0", L.ADDR2_E[0], E2.addrPlate(L.ADDR2_E[0], { id: "ad0", text: "历史" }));
put("ad1", L.ADDR2_E[1], E2.addrPlate(L.ADDR2_E[1], { id: "ad1", text: "新" }));
put("magE", L.MAG_E, O.magnifier(L.MAG_E, { id: "magE" }), 0, { grow: true });
put("led0", L.LEDGERS_E[0], O.ledgerBook(L.LEDGERS_E[0], { id: "led0", scale: 0.8 }));
put("led1", L.LEDGERS_E[1], O.ledgerBook(L.LEDGERS_E[1], { id: "led1", scale: 0.8 }));
put("docE", L.DOC_E, O.doc(L.DOC_E, { id: "docE", standing: true, title: "提示", lines: ["官方从不要求", "签名领取"], w: 150, h: 200 }), 0, { grow: true });
put("userE", L.USER_E, O.person(L.USER_E, { id: "userE", role: "signer", scale: 0.55 }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-shd", up(A.shd.top, 10), "强警告", "lab-rs lab-sm");
["无限授权", "批量授权", "7702 委托"].forEach((tx, i) => lb("lb-w" + i, [A.shd.center[0] + 70, A.shd.center[1] - 90 + i * 64], tx, "lab-r lab-sm", "l"));
lb("lb-tagE", up(A.adE.top, 10), "7702 委托", "lab-cs lab-sm");
lb("lb-x8", up(A.lt8.top, 40), "✕ 网站发起", "lab-rs lab-sm");
lb("lb-sim", up(A.scE.top, 10), "交易模拟", "lab-cs lab-sm");
lb("lb-sim2", [A.scE.center[0] + 80, A.scE.center[1]], "签完 余额 −全部", "lab-rs lab-sm", "l");
lb("lb-gate", up(A.gate.plate, 30), "域名信誉", "lab-cs lab-sm");
lb("lb-x10", up(A.lt10.top, 40), "仿冒域名 · 拦下", "lab-rs lab-sm");
lb("lb-amt", up(A.chq.top, 14), "额度 100 USDT", "lab-gs lab-sm");
lb("lb-hr", up(A.hrE.top, 10), "冷却期", "lab-cs lab-sm");
lb("lb-a0", [A.ad0.ground[0] - 10, A.ad0.ground[1] + 16], "0x7a3<b>d41e</b>c1", "lab-ink lab-sm", "t");
lb("lb-a1", [A.ad1.ground[0] + 60, A.ad1.ground[1] + 96], "0x7a3<b style='color:#ffb3ab'>f09b</b>c1", "lab-ink lab-sm", "t");
lb("lb-hint", up(A.ad1.top, 14), "首尾相同 中间不同", "lab-rs lab-sm");
lb("lb-led0", up(A.led0.top, 40), "交易记录", "lab-cs lab-sm");
lb("lb-z0", [A.led0.center[0], A.led0.center[1] - 8], "0 USDT 转入", "lab-r lab-sm", "c");
lb("lb-z1", [A.led0.center[0], A.led0.center[1] + 66], "陌生代币", "lab-r lab-sm", "c");
lb("lb-fold", [A.led0.center[0], A.led0.center[1] + 30], "已折叠 2 条", "lab-g lab-sm", "c");
lb("lb-odd", up(A.oddE.top, 10), "假 USDT", "lab-rs lab-sm");
lb("lb-oddx", [A.oddE.center[0] + 120, A.oddE.center[1] - 20], "✕ 不入账", "lab-rs lab-sm", "l");
lb("lb-led1", up(A.led1.top, 40), "风控名单", "lab-ink lab-sm");
lb("lb-r0", [A.led1.center[0], A.led1.center[1] - 8], "Drainer 收款地址", "lab-r lab-sm", "c");
lb("lb-r1", [A.led1.center[0], A.led1.center[1] + 66], "投毒地址", "lab-r lab-sm", "c");
lb("lb-doc", up(A.docE.top, 10), "官方从不要求签名领取", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 330, w: 540 };
const cardA = codeCard("cA", { ...CA, head: "解码后的签名请求", tag: "示例", rowHide: true, rows: [
  { html: "授权给 0x3f…e9" }, { html: "额度 无限", chip: "危险", chipCls: "x" }, { html: "期限 永久", chip: "危险", chipCls: "x" }, { html: "委托合约 扫币合约", chip: "危险", chipCls: "x" }] });
const cardB = codeCard("cB", { x: 64, y: 336, w: 540, head: "交易模拟 签完以后", tag: "示例", rows: [
  { html: "USDT 12,400 → 0", chip: "−全部", chipCls: "x" }, { html: "NFT 3 → 0", chip: "−全部", chipCls: "x" }] });
const html = cardA + cardB
  + ck("ck-k", "私钥 · 攻击者拿不到", { x: 610, y: 110, w: 700, kind: "g" })
  + ck("ck-c", "合约逻辑 · 攻击者改不了", { x: 610, y: 196, w: 700, kind: "g" })
  + ck("ck-s0", "卖出限制", { x: 60, y: 330, w: 500, kind: "g" })
  + ck("ck-s1", "持仓集中度", { x: 60, y: 420, w: 500, kind: "g" })
  + ck("ck-s2", "增发权限", { x: 60, y: 510, w: 500, kind: "g" })
  + kw("kw-list", "上币前 <b>检查</b>", { x: 60, y: 240, size: 40, accent: "#1d93ba" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  key: w("私钥", 1), logic: w("逻辑", 1),
  a0: w("点击", 2), a1: w("签名", 2), a2: w("复制", 2), a3: Math.max(w("粘贴", 2), w("复制", 2) + 0.45),
  dec: w("解码", 4), f0: w("授权给谁", 5), f1: w("额度", 5), f2: w("期限", 5), f3: w("委托", 5),
  bad: w("无法解析", 6), u0: w("无限授权", 7), u1: w("批量授权", 7), u2: w("7702", 7), warn: w("强警告", 7),
  audit: w("审计过", 8), reject: w("拒绝", 8), sim: w("交易模拟", 9), bal: w("余额", 9),
  dom: w("仿冒", 10), stop: w("拦下", 10), exact: w("精确额度", 11),
  wl: w("白名单", 12), cool: w("冷却期", 12), head: w("首尾相同", 13), mid: w("中间不同", 13),
  fold: w("折叠", 14), dep: w("充值", 15), fake: w("不入账", 15),
  s0: w("卖出限制", 16), s1: w("持仓集中度", 16), s2: w("增发权限", 16),
  drn: w("Drainer", 17), poi: w("投毒地址", 17), off: w("官方", 18),
};
console.log("TM", Object.fromEntries(Object.entries(TM).map(([k, v]) => [k, +v.toFixed(2)])), "LS", LS.map((x) => +x.toFixed(1)), "TOTAL", S.TOTAL);
const t = (x) => f(x);
const lt8P = at(L8o), gP = at(L10o);

S.build({
  cam0: "casesD", sub: "每一次点击，都能被拦下",
  grid: { u0: -100, u1: 8600, v0: -1100, v1: 6200 }, box: [1300, -1100, 7300, 2100],   // 盖住 casesD / guardE / walletE / exchE
  shown: [], css, html,
  terms: [
    { id: "t0", t: "DApp", d: "链上应用的网页前端", at: w("DApp", 11) },
    { id: "t1", t: "交易模拟", d: "签名前预演一遍，看余额怎么变", at: w("交易模拟", 9) },
    { id: "t2", t: "白名单", d: "只允许名单里的地址或合约", at: w("白名单", 12) },
    { id: "t3", t: "冷却期", d: "新地址要等一段时间才能提币", at: w("冷却期", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 这些骗局有一个共同点。镜头从 D 右移到 E 全景
      cam(${t(LS[0] + 0.1)}, "guardE", 2.4, "power2.inOut");
      // ===== L1 攻击者控制不了你的私钥，也控制不了链上合约的逻辑。两张绿卡
      pop("#ck-k", ${t(TM.key)}); pop("#ck-c", ${t(TM.logic)});
      // ===== L2 每一步都要你的一个动作，点击、签名、复制、粘贴。四个图标依次亮
      [${[TM.a0, TM.a1, TM.a2, TM.a3].map(t).join(",")}].forEach((x, i) => { fadeIn("#act" + i, x, 0.3); pop("#lb-act" + i, x + 0.1, 0.25); });
      [0, 1, 2, 3].forEach((i) => tl.to("#act" + i, { opacity: 0.3, duration: 0.3 }, ${t(LS[2] + 0.3)} + i * 0.25));
      // ===== L3 每一个动作，都是一个可以拦截的点。道闸落下 + 绿光（关键画面）
      out("#ck-k, #ck-c", ${t(LS[3])}, 0.3);
      [0, 1, 2, 3].forEach((i) => {
        const x = ${t(LS[3] + 0.3)} + i * 0.35, el = document.getElementById("bar" + i), r = el.querySelector("rect");
        const ox = +r.getAttribute("x") + 6, oy = +r.getAttribute("y") + 6;
        fadeIn("#bar" + i, x - 0.1, 0.15);
        tl.fromTo("#arm" + i, { rotation: -80, svgOrigin: ox + " " + oy }, { rotation: 0, svgOrigin: ox + " " + oy, duration: 0.5, ease: "back.out(1.6)", immediateRender: true }, x);
        fadeIn("#glw" + i, x + 0.4, 0.3);
      });
      // ===== L4 钱包这一层，先把签名请求解码成看得懂的字段。
      out("#lb-act0, #lb-act1, #lb-act2, #lb-act3", ${t(LS[4] - 0.2)}, 0.2);
      cam(${t(LS[4])}, "walletR", 1.4);
      KIT.swap(tl, "#phE-scr", "#phE-scr2", ${t(TM.dec + 0.2)}, 0.4);
      pop("#cA", ${t(TM.dec + 0.4)});
      // ===== L5 授权给谁，额度多少，期限到哪天，委托哪个合约。字段槽依次亮，代码卡逐行
      [${[TM.f0, TM.f1, TM.f2, TM.f3].map(t).join(",")}].forEach((x, i) => {
        X9.field(tl, "chq", x, i, i === 0 ? "filled" : "bad");
        fadeIn("#cA-r" + i, x, 0.25);
        if (i > 0) { hot("#cA-r" + i, x + 0.3, "#fbe1de"); pop("#cA-c" + i, x + 0.3, 0.2); }
      });
      // ===== L6 无法解码，就明确显示无法解析。
      out("#phE-dec", ${t(TM.bad - 0.3)}, 0.25); fadeIn("#phE-bad", ${t(TM.bad - 0.1)}, 0.3); bump("#phE", ${t(TM.bad + 0.1)}, 1.04, 1);
      // ===== L7 无限授权、批量授权、7702 委托，默认强警告。盾牌 + 三块小牌
      out("#phE-bad", ${t(LS[7])}, 0.25); fadeIn("#phE-dec", ${t(LS[7])}, 0.25);
      pop("#lb-shd", ${t(LS[7] + 0.1)}); bump("#shd", ${t(TM.warn)}, 1.08, 2);
      [${[TM.u0, TM.u1, TM.u2].map(t).join(",")}].forEach((x, i) => pop("#lb-w" + i, x, 0.25));
      // ===== L8 7702 只指向审计过的实现，拒绝网站发起。挂牌换绿；网站信封被弹回
      out("#lb-w0, #lb-w1, #lb-w2, #lb-shd", ${t(LS[8])}, 0.25);
      pop("#lb-tagE", ${t(LS[8] + 0.5)}); X15.tagPulse(tl, "tagE", ${t(LS[8] + 1.3)});
      X15.tagState(tl, "tagE", ${t(TM.audit)}, "normal", "审计过的实现");
      grow("lt8", ${t(TM.reject - 0.6)});
      X1.walk(tl, "lt8", ${t(TM.reject - 0.2)}, 0.6, [[${lt8P[0] + 150}, ${lt8P[1] - 30}]]);
      pop("#lb-x8", ${t(TM.reject + 0.4)});
      X1.walk(tl, "lt8", ${t(TM.reject + 0.6)}, 0.5, [[${lt8P[0] - 40}, ${lt8P[1] + 10}]]);
      out("#lt8", ${t(TM.reject + 1.2)}, 0.3);
      // ===== L9 交易模拟，在签名之前，显示签完以后余额怎么变。台秤读数 + 代码卡 B
      out("#cA, #lb-x8, #lb-tagE", ${t(LS[9] - 0.2)}, 0.2);
      pop("#lb-sim", ${t(TM.sim)}); pop("#cB", ${t(TM.sim + 0.3)});
      X7.read(tl, "scE", ${t(TM.sim + 0.2)}, "before", 12400, 0.5);
      X7.read(tl, "scE", ${t(TM.bal)}, "after", 0, 0.6);
      X7.diff(tl, "scE", ${t(TM.bal + 0.5)}, false, "差 = −全部");
      pop("#lb-sim2", ${t(TM.bal + 0.6)});
      [0, 1].forEach((i) => pop("#cB-c" + i, ${t(TM.bal + 0.6)} + i * 0.2, 0.2));
      // ===== L10 新注册、仿冒的域名，直接拦下。道闸落下，仿冒信封被挡
      out("#cB, #lb-sim, #lb-sim2", ${t(LS[10] - 0.2)}, 0.2);
      pop("#lb-gate", ${t(LS[10])});
      grow("lt10", ${t(TM.dom - 0.3)});
      X1.walk(tl, "lt10", ${t(TM.dom)}, 0.9, [[${gP[0] + 170}, ${gP[1] - 50}]]);
      KIT.arm(tl, "gate", ${t(TM.stop - 0.3)}, false, 0.5);
      pop("#lb-x10", ${t(TM.stop + 0.1)});
      // ===== L11 DApp 只请求精确额度的授权，用完就停。额度槽变绿
      out("#lb-gate, #lb-x10", ${t(LS[11])}, 0.25);
      X9.field(tl, "chq", ${t(TM.exact)}, 1, "filled");
      pop("#lb-amt", ${t(TM.exact + 0.1)});
      // ===== L12 交易所这一层，白名单 + 冷却期
      out("#lb-amt", ${t(LS[12] - 0.2)}, 0.2);
      cam(${t(LS[12])}, "exchR", 1.4);
      bump("#wl", ${t(TM.wl)}, 1.06, 1);
      pop("#lb-hr", ${t(TM.cool)}); KIT.sand(tl, "hrE", ${t(TM.cool)}, 4);
      // ===== L13 首尾相同、中间不同，强提示
      out("#lb-hr", ${t(LS[13])}, 0.2);
      grow("magE", ${t(LS[13] + 0.1)});
      pop("#lb-a0", ${t(TM.head)}); pop("#lb-a1", ${t(TM.head + 0.2)});
      pop("#lb-hint", ${t(TM.mid + 0.2)}); bump("#lb-hint", ${t(TM.mid + 0.8)}, 1.08, 2);
      // ===== L14 交易记录默认折叠零额转账和陌生代币。
      out("#lb-a0, #lb-a1, #lb-hint", ${t(LS[14])}, 0.25);
      pop("#lb-led0", ${t(LS[14] + 0.1)}); pop("#lb-z0", ${t(LS[14] + 0.3)}); pop("#lb-z1", ${t(LS[14] + 0.5)});
      out("#lb-z0, #lb-z1", ${t(TM.fold + 0.3)}, 0.3); pop("#lb-fold", ${t(TM.fold + 0.6)}); bump("#lb-fold", ${t(TM.fold + 1.6)}, 1.06, 1);
      // ===== L15 充值只认白名单里的代币合约，假 USDT 不入账。
      out("#lb-led0, #lb-fold", ${t(LS[15])}, 0.25);
      pop("#lb-odd", ${t(TM.dep)});
      X6.carry(tl, "oddE", ${t(TM.dep + 0.3)}, 60, 0, 0, 0.6);
      pop("#lb-oddx", ${t(TM.fake - 0.2)});
      X6.carry(tl, "oddE", ${t(TM.fake + 0.2)}, 0, 0, 0, 0.5);
      // ===== L16 上币前，检查卖出限制、持仓集中度和增发权限。
      out("#lb-odd, #lb-oddx", ${t(LS[16])}, 0.25);
      pop("#kw-list", ${t(LS[16])});
      [${[TM.s0, TM.s1, TM.s2].map(t).join(",")}].forEach((x, i) => pop("#ck-s" + i, x, 0.25));
      // ===== L17 Drainer 收款地址和投毒地址，进风控名单。
      out("#kw-list, #ck-s0, #ck-s1, #ck-s2", ${t(LS[17])}, 0.25);
      pop("#lb-led1", ${t(LS[17] + 0.1)}); pop("#lb-r0", ${t(TM.drn)}); pop("#lb-r1", ${t(TM.poi)});
      // ===== L18 提示官方从不要求签名领取。镜头落到 rolesE（下一段起点），提示单立起
      out("#lb-led1, #lb-r0, #lb-r1", ${t(LS[18] - 0.2)}, 0.2);
      cam(${t(LS[18])}, "rolesE", 1.4);
      grow("docE", ${t(TM.off - 0.4)}); pop("#lb-doc", ${t(TM.off + 0.2)});
`,
});
