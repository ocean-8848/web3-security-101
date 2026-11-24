// ep19/seg3「③ 钓鱼套件」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.shopC（BRIEF）。
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
// ends static on CAMS.trendC
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E6, E8, E9, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const FONT = `font-family="Noto Sans SC, sans-serif"`;

// 包层缩放（不支持 opts.scale 的 kit 物件）：绕地面点缩放并换算 anchors
const putW = (key, o, r, k, dy = 0) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of ["top", "center", "ground", "screen", "tip"]) if (Array.isArray(A[key][n])) A[key][n] = sc(A[key][n]);
};
const lift = (p, dx, dy) => [p[0] + dx, p[1] + dy];

// ---------------------------------------------------------------- 路面（原生 SVG，排在最底）
{
  const [[x0, y0], [x1, y1]] = L.ROAD;
  add({ u: -99999, v: -99999 }, `<path d="M${x0} ${y0 - 80}L${x1} ${y1 - 80}L${x1} ${y1 + 80}L${x0} ${y0 + 80}Z" fill="#dcd8d0"/>
    <path d="M${x0} ${y0}L${x1} ${y1}" stroke="#ccc7bd" stroke-width="3" stroke-dasharray="26 22"/>`, -1e6);
}

// ---------------------------------------------------------------- B 区收尾（与 seg2 末帧衔接：7702 委托牌 + 攻击者 + Permit2 支票）
put("b-addr", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "b-addr", text: "你的地址" }));
{ const h = E15.delegateTagOn(L.ADDR_B, { id: "b-tag", state: "attacker", target: "扫币合约" }); put("b-tag", h.o, E15.delegateTag(h.o, h.opts)); }
put("b-atk", L.ATK_B, O.person(L.ATK_B, { id: "b-atk", role: "attacker", scale: 0.6 }));
put("b-chq", L.CHEQUES_B[3], E9.cheque(L.CHEQUES_B[3], { id: "b-chq", scale: 0.8, copies: 3 }));

// ---------------------------------------------------------------- C 区物件
L.WINS_C.forEach((q, i) => putW(`win${i}`, q, O.browserWin(q, { id: `win${i}`, title: "领取空投", heading: "空投已到账", button: "签名领取" }), 0.5));
putW("rack", L.RACK_C, O.rack(L.RACK_C, { id: "rack", tag: "后台", leds: ["red", "green", "green"] }), 0.7);
putW("lap", L.LAPTOP_C, O.laptop(L.LAPTOP_C, { id: "lap", state: "attacker" }), 0.7);
put("dev", L.DEV_C, O.person(L.DEV_C, { id: "dev", role: "attacker", scale: 0.55 }));
put("dist", L.DIST_C, O.person(L.DIST_C, { id: "dist", role: "attacker", scale: 0.55 }));
putW("tw", L.TOWER_C, O.tower(L.TOWER_C, { id: "tw", state: "attacker" }), 0.7);
const scrMsg = (a, b, red) => `<rect x="0" y="0" width="76" height="150" fill="${red ? "#fdecea" : "#e8f3f7"}"/>
  <text x="38" y="62" text-anchor="middle" ${FONT} font-size="17" font-weight="900" fill="${red ? "#e0453a" : "#1d93ba"}">${a}</text>
  <text x="38" y="90" text-anchor="middle" ${FONT} font-size="17" font-weight="900" fill="#1c1c1c">${b}</text>
  ${red ? `<rect x="8" y="112" width="60" height="26" rx="7" fill="#e0453a"/>` : ""}`;
putW("ph", L.PHONE_C, O.phone(L.PHONE_C, { id: "ph", screen: scrMsg("私信", "领空投"), screen2: scrMsg("授权", "USDT", true) }), 0.7);
const PH2 = { u: L.PHONE_C.u + 90, v: L.PHONE_C.v + 70 };
putW("ph2", PH2, O.phone(PH2, { id: "ph2", screen: scrMsg("私信", "领空投"), screen2: scrMsg("授权", "NFT", true) }), 0.7);
S.grow("ph2");
put("pz", L.PIZZA_C, E6.pizza(L.PIZZA_C, { id: "pz", slices: 5, scale: 0.8 }));
L.BOTS_C.forEach((q, i) => put(`bot${i}`, q, E8.liqBot(q, { id: `bot${i}`, state: "attacker", scale: 0.9, scr: "$" })));
const KN = ["Inferno", "Pink", "Angel"];
L.KITS_C.forEach((q, i) => {
  put(`kit${i}`, q, E1.signBoard(q, { id: `kit${i}`, style: "wood", text: KN[i], size: 36, w: 150 }));
  S.add(q, S.hid(`kitn${i}`, E1.signBoard(q, { id: `kitn${i}-b`, style: "wood", text: "新名字", size: 36, w: 150 }).svg), 1);
});
// 回流的红信封（L5）：从右前方走回披萨盒
const LT0 = { u: L.PIZZA_C.u + 260, v: L.PIZZA_C.v + 60 };
S.add(LT0, S.hid("ltw", E1.letter(LT0, { id: "lt", state: "attacker" }).svg), 2);

// 趋势点阵（L16–L19）：左列 49 点（2024），右列 8 点（2025），每点约 1000 万美元
const [dx, dy] = at(L.DOTS_C), SP = 20;
const dot = (x, y, r = 7, c = "#e0453a") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const dL = [], dR = [], dS = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) dL.push(dot(dx + 14 + c * SP, dy + 16 + r * SP));
for (let r = 3; r < 7; r++) for (let c = 0; c < 2; c++) dR.push(dot(dx + 236 + c * SP, dy + 16 + r * SP));
for (let i = 0; i < 44; i++) { const a = (i * 137.5) % 360, rr = 8 + ((i * 37) % 60); dS.push(dot(dx + 246 + Math.cos(a) * rr * 1.1, dy + 108 + Math.sin(a) * rr * 0.6, 2.6)); }
S.add(L.DOTS_C, S.hid("dL", dL.join("")) + S.hid("dR", dR.join("")) + S.hid("dS", dS.join(""))
  + S.hid("dFr", `<rect x="${dx}" y="${dy + 2}" width="${7 * SP + 8}" height="${4 * SP + 8}" rx="6" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="9 7"/>`)
  + S.hid("dAr", `<path d="M${dx + 168} ${dy + 30}Q${dx + 205} ${dy + 34} ${dx + 222} ${dy + 66}" fill="none" stroke="#e0453a" stroke-width="4"/><path d="M${dx + 212} ${dy + 62}L${dx + 225} ${dy + 74}L${dx + 229} ${dy + 56}Z" fill="#e0453a"/>`), 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-zone", lift(at(L.WINS_C[1]), 0, 60), "Drainer 即服务", "lab-cs", "t");
lb("lb-fake", up(A.win2.top, 6), "仿冒站 · 外观一样", "lab-r lab-sm");
lb("lb-dev", up(A.dev.top, 6), "开发者", "lab-r lab-sm");
lb("lb-lap", up(A.lap.top, 4), "钓鱼套件", "lab-r lab-sm");
lb("lb-rack", up(A.rack.top, 4), "后台", "lab-ink lab-sm");
lb("lb-dist", up(A.dist.top, 6), "分发者", "lab-r lab-sm");
lb("lb-rent", lift(A.dist.top, -150, -20), "出租", "lab-cs lab-sm");
["仿冒网站", "买广告", "盗号"].forEach((s, i) => lb(`lb-d${i}`, lift(A.dist.top, 70, -6 - i * 72), s, "lab-rs lab-sm", "l"));
lb("lb-tw", up(A.tw.top, 4), "广告投放", "lab-r lab-sm");
lb("lb-ph", up(A.ph.top, 4), "私信", "lab-r lab-sm");
lb("lb-ch", lift(A.tw.top, 150, -10), "被盗 X / Discord · 搜索广告 · 假空投", "lab-ink lab-sm", "l");
lb("lb-split", up(A.pz.top, 4), "自动分账", "lab-r lab-sm");
lb("lb-p20", lift(A.dev.ground, 0, 14), "约 20%", "lab-rs", "t");
lb("lb-p80", lift(A.dist.ground, 0, 14), "约 80%", "lab-rs", "t");
lb("lb-vary", lift(A.pz.ground, 0, 18), "≈ 各家不同 · 也会变", "lab-ink lab-sm", "t");
["$", "$$", "$$$"].forEach((s, i) => lb(`lb-b${i}`, up(A[`bot${i}`].top, 6), s, "lab-r lab-sm"));
lb("lb-sort", lift(A.bot2.ground, 30, 20), "按价值排序 · 先要最值钱的", "lab-ink lab-sm", "t");
lb("lb-q0", lift(A.ph.top, -20, 10), "授权 USDT", "lab-r lab-sm", "r");
lb("lb-q1", lift(A.ph2.top, 20, 10), "授权 NFT", "lab-r lab-sm", "l");
const KST = ["已关停", "退休", "停止服务"], KAMT = ["约 7000 万美元", "约 2.1 万人 · 约 8500 万美元", "约 2500 万美元"];
L.KITS_C.forEach((q, i) => {
  lb(`lb-k${i}`, up(A[`kit${i}`].top, 4), KST[i], "lab-ink lab-sm");
  lb(`lb-ka${i}`, lift(at(q), 0, 22 + (i === 1 ? 34 : 0)), KAMT[i], "lab-ink lab-sm", "t");
});
lb("lb-k0x", up(A.kit0.top, 4), "<s>已关停</s> 仍在运行", "lab-r lab-sm");
lb("lb-k0b", lift(at(L.KITS_C[0]), 0, 84), "半年 约 900 万美元以上", "lab-r lab-sm", "t");
lb("lb-collab", lift(A.ph.top, 0, -40), "冒充 Collab.Land · 受害者 3 万多名", "lab-rs lab-sm");
lb("lb-back", lift(A.kit1.top, 0, -54), "换个名字回来", "lab-rs");
lb("lb-y24", [dx + 74, dy + 166], "2024 · 约 4.94 亿美元", "lab-r lab-sm", "t");
lb("lb-leg", [dx + 160, dy - 14], "每点约 1000 万美元", "lab-ink lab-sm");
lb("lb-permit", [dx - 10, dy + 48], "permit 类 56.7% · 百万美元以上大案", "lab-rs lab-sm", "r");
lb("lb-y25", [dx + 290, dy + 110], "2025 · 约 8385 万美元", "lab-r lab-sm", "l");
lb("lb-83", [dx + 230, dy + 34], "约 −83%", "lab-rs lab-sm", "l");
lb("lb-small", [dx + 290, dy + 172], "小额 · 高频", "lab-ink lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev0", `开发者 / 分发者分成 ${gtag("公开分析")}`, { top: 120 })
  + evt("ev1", `Inferno 关停前 ${gtag("ScamSniffer 统计")}`, { top: 122 })
  + evt("ev2", `2025.5 仍在运行 ${gtag("Check Point 分析")}`, { top: 124 })
  + evt("ev3", `Pink 退休 ${gtag("ScamSniffer 看板")}`, { top: 126 })
  + evt("ev4", `Angel 停止服务 ${gtag("Cointelegraph 报道")}`, { top: 128 })
  + evt("ev5", `年度钓鱼损失 ${gtag("ScamSniffer 年报")}`, { top: 130 })
  + ck("ck-scope", "只算 EVM 链 Drainer 钓鱼 · 不含私钥泄露和交易所被盗", { kind: "n", x: 680, y: 130, w: 1140 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const ww = (term, line, dt = 0.3) => { try { return w(term, line); } catch { return LS[line] + dt; } };
const TM = {
  rent: ww("出租", 2, 3.5), fake: ww("仿冒", 3, 1.5), ad: ww("买广告", 3, 2.6), hack: ww("盗社交", 3, 3.8),
  stolen: ww("被盗", 4, 0.8), search: ww("搜索广告", 4, 3), drop: ww("假空投", 4, 3.8), dm: ww("私信", 4, 4.6),
  sign: ww("签名", 5, 1), split: ww("自动分账", 5, 2.2), p20: ww("20", 6, 2.5), p80: ww("80", 6, 4.5), vary: ww("不同", 7, 1),
  bal: ww("余额", 8, 1.5), sort: ww("排序", 8, 3), top: ww("最值钱", 8, 4.5), diff: ww("不一样", 9, 3.5),
  shut: ww("关停", 10, 3), run: ww("仍在运行", 11, 3), amt9: ww("900", 11, 4.5), collab: ww("冒充", 12, 2),
  retire: ww("退休", 13, 2.5), angel: ww("停止服务", 14, 5), rename: ww("换个名字", 15, 3.5),
  y24: ww("4.94", 16, 3), permit: ww("permit", 17, 2.5), y25: ww("8385", 18, 1.5), down: ww("83%", 18, 4),
  small: ww("小额", 19, 1.5), scope: ww("不含", 20, 2.5),
};
const t = (x) => f(x);
// 披萨块搬运：1 块朝开发者，4 块朝分发者（世界位移）
const toward = (P, k) => [Math.round((P.u - L.PIZZA_C.u) * k), Math.round((P.v - L.PIZZA_C.v) * k)];
const [dvU, dvV] = toward(L.DEV_C, 0.32), [dsU, dsV] = toward(L.DIST_C, 0.45);
const atPizza = at(L.PIZZA_C);
S.curve("cv-rent", S.scr("splitC", A.lap.top), S.scr("splitC", up(A.dist.top, 4)), { color: "#2aa3c9" });

S.build({
  cam0: "delegB", sub: "钓鱼站背后，是一套出租的工具",
  grid: { u0: -6000, u1: 700, v0: -5400, v1: 1000 }, box: [-6200, -1100, 5500, 1900],   // 盖住 delegB / shopC / splitC / botsC / kitsC / trendC
  shown: [], css, html,
  terms: [
    { id: "t0", t: "分发者", d: "替套件引流、按比例分成的人", at: w("分发者", 3) },
    { id: "t1", t: "EVM", d: "以太坊及兼容链的执行环境", at: w("EVM", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 这些钓鱼网站，很多出自同一类工具。（B → C 全景）
      cam(${t(LS[0])}, "shopC", 2.2, "power2.inOut");
      [0, 1, 2].forEach((i) => bump("#win" + i, ${t(LS[0] + 2.4)} + i * 0.25, 1.06, 1)); pop("#lb-fake", ${t(LS[0] + 2.6)});
      // ===== L1 它叫 Drainer 即服务。
      pop("#lb-zone", ${t(LS[1] + 0.2)});
      // ===== L2 开发者维护钓鱼套件、合约和后台，把它当作产品出租。
      out("#lb-fake, #lb-zone", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "splitC", 1.4);
      pop("#lb-dev", ${t(LS[2] + 1.0)}); pop("#lb-lap", ${t(LS[2] + 1.6)}); pop("#lb-rack", ${t(LS[2] + 2.2)});
      pop("#lb-dist", ${t(TM.rent - 0.4)}); draw("cv-rent", ${t(TM.rent)}, 0.8); pop("#lb-rent", ${t(TM.rent + 0.5)});
      // ===== L3 分发者负责引流，搭仿冒网站，买广告，盗社交账号。
      out("#cv-rent, #lb-rent", ${t(LS[3] + 0.3)});
      pop("#lb-d0", ${t(TM.fake)}); pop("#lb-d1", ${t(TM.ad)}); pop("#lb-d2", ${t(TM.hack)});
      // ===== L4 链接投到被盗的 X 和 Discord 账号、搜索广告、假空投和私信里。
      out("#lb-d0, #lb-d1, #lb-d2", ${t(LS[4] - 0.2)});
      pop("#lb-tw", ${t(TM.stolen - 0.3)}); flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${t(TM.stolen)}, 4);
      pop("#lb-ch", ${t(TM.search)}); pop("#lb-ph", ${t(TM.dm)}); bump("#ph", ${t(TM.dm)}, 1.08, 2);
      // ===== L5 受害者一签名，转走的资产自动分账。
      out("#lb-ch, #lb-tw", ${t(LS[5] - 0.2)});
      fadeIn("#ltw", ${t(TM.sign)}, 0.3); X1.walk(tl, "lt", ${t(TM.sign + 0.3)}, 1.4, [[${atPizza[0] + 40}, ${atPizza[1] - 20}]]);
      out("#ltw", ${t(TM.sign + 1.8)}, 0.3); pop("#lb-split", ${t(TM.split)}); bump("#pz", ${t(TM.split + 0.2)}, 1.05, 1);
      // ===== L6 公开分析显示，开发者抽成约 20%，分发者拿约 80%。
      out("#lb-split", ${t(LS[6] - 0.2)}); pop("#ev0", ${t(LS[6] + 0.2)});
      X6.carry(tl, "pz-s-0", ${t(TM.p20 - 0.3)}, ${dvU}, ${dvV}, 0, 1.0); pop("#lb-p20", ${t(TM.p20 + 0.3)});
      [1, 2, 3, 4].forEach((i) => X6.carry(tl, "pz-s-" + i, ${t(TM.p80 - 0.3)} + (i - 1) * 0.1, ${dsU}, ${dsV}, 0, 1.0)); pop("#lb-p80", ${t(TM.p80 + 0.3)});
      // ===== L7 各家套件的比例不同，也会变。
      pop("#lb-vary", ${t(TM.vary)}); bump("#lb-p20, #lb-p80", ${t(TM.vary + 0.3)}, 1.08, 1);
      // ===== L8 套件会先读你钱包里的余额，按价值排序，先请求最值钱的那个授权。
      out("#ev0, #lb-dev, #lb-lap, #lb-rack, #lb-dist, #lb-ph, #lb-p20, #lb-p80, #lb-vary", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "botsC", 1.3);
      [0, 1, 2].forEach((i) => { X8.botLamp(tl, "bot" + i, ${t(TM.bal)} + i * 0.3, 1.2, 1, true); X8.botScr(tl, "bot" + i, ${t(TM.bal + 0.6)} + i * 0.3, ["$", "$$", "$$$"][i], true); pop("#lb-b" + i, ${t(TM.bal + 0.6)} + i * 0.3); });
      pop("#lb-sort", ${t(TM.sort)}); bump("#bot2", ${t(TM.top)}, 1.08, 1); X8.grab(tl, "bot2", ${t(TM.top + 0.3)});
      // ===== L9 所以同一个钓鱼站，对不同的人，弹出的签名请求不一样。
      out("#lb-sort", ${t(LS[9] - 0.2)}); grow("ph2", ${t(LS[9] + 0.2)});
      fadeIn("#ph-scr2", ${t(TM.diff - 1.2)}, 0.3); pop("#lb-q0", ${t(TM.diff - 1.0)});
      fadeIn("#ph2-scr2", ${t(TM.diff - 0.4)}, 0.3); pop("#lb-q1", ${t(TM.diff - 0.2)});
      // ===== L10 Inferno Drainer 在 2023 年 11 月宣布关停，此前约 7000 万美元。
      out("#lb-q0, #lb-q1, #lb-b0, #lb-b1, #lb-b2", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "kitsC", 1.3);
      bump("#kit0", ${t(LS[10] + 1.3)}, 1.08, 1); pop("#lb-k0", ${t(TM.shut)}); pop("#lb-ka0", ${t(TM.shut + 1.2)}); pop("#ev1", ${t(TM.shut + 0.6)});
      // ===== L11 2025 年 5 月，Check Point 发现它仍在运行，半年内盗走约 900 万美元以上。
      out("#ev1", ${t(LS[11] - 0.2)}); pop("#ev2", ${t(LS[11] + 0.3)});
      out("#lb-k0", ${t(TM.run - 0.1)}, 0.2); pop("#lb-k0x", ${t(TM.run)});
      [0, 1, 2].forEach((i) => X8.botLamp(tl, "bot" + i, ${t(TM.run + 0.3)} + i * 0.2, 1.2, 1, true));
      pop("#lb-k0b", ${t(TM.amt9)});
      // ===== L12 这次它在 Discord 冒充 Collab.Land 引流，受害者有 3 万多名。
      bump("#ph", ${t(LS[12] + 0.6)}, 1.08, 1); pop("#lb-collab", ${t(TM.collab)});
      tl.fromTo("#lb-collab", { y: 30 }, { y: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, ${t(TM.collab)});
      // ===== L13 Pink Drainer 在 2024 年 5 月宣布退休，约 2.1 万名受害者，约 8500 万美元。
      out("#ev2, #lb-collab, #lb-k0x, #lb-ka0, #lb-k0b", ${t(LS[13] - 0.2)}); pop("#ev3", ${t(LS[13] + 0.3)});
      bump("#kit1", ${t(LS[13] + 0.3)}, 1.08, 1); pop("#lb-k1", ${t(TM.retire)}); pop("#lb-ka1", ${t(TM.retire + 1.2)});
      // ===== L14 Angel Drainer 到 2024 年 2 月，约 2500 万美元，同年 7 月停止服务。
      out("#ev3, #lb-ka1", ${t(LS[14] - 0.2)}); pop("#ev4", ${t(LS[14] + 0.3)});
      bump("#kit2", ${t(LS[14] + 0.3)}, 1.08, 1); pop("#lb-ka2", ${t(LS[14] + 2.6)}); pop("#lb-k2", ${t(TM.angel)});
      // ===== L15 关停不等于消失，套件代码和分发网络，会换个名字回来。（关键画面：三块牌翻面，机器人照常排队）
      out("#ev4, #lb-k0x, #lb-k1, #lb-k2, #lb-ka0, #lb-ka1, #lb-ka2, #lb-k0b", ${t(LS[15] + 0.2)});
      [0, 1, 2].forEach((i) => {
        tl.to("#kit" + i, { scaleX: 0, transformOrigin: "50% 100%", duration: 0.25, ease: "power2.in" }, ${t(TM.rename - 0.6)} + i * 0.25);
        tl.fromTo("#kitn" + i, { opacity: 1, scaleX: 0, transformOrigin: "50% 100%" }, { scaleX: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, ${t(TM.rename - 0.35)} + i * 0.25);
      });
      pop("#lb-back", ${t(TM.rename + 0.6)});
      [0, 1, 2].forEach((i) => { X8.botLamp(tl, "bot" + i, ${t(TM.rename + 0.8)} + i * 0.25, 1.2, 1, true); bump("#bot" + i, ${t(TM.rename + 0.9)} + i * 0.25, 1.06, 1); });
      // ===== L16 整体看，2024 年的钓鱼损失约 4.94 亿美元。
      out("#lb-back", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "trendC", 1.3);
      fadeIn("#dL", ${t(LS[16] + 1.4)}, 0.8); pop("#lb-y24", ${t(TM.y24)}); pop("#lb-leg", ${t(TM.y24 + 0.5)}); pop("#ev5", ${t(TM.y24 + 0.3)});
      // ===== L17 其中百万美元以上的大案里，permit 类占损失的 56.7%。
      fadeIn("#dFr", ${t(TM.permit - 0.2)}, 0.4); pop("#lb-permit", ${t(TM.permit + 0.2)});
      // ===== L18 2025 年降到约 8385 万美元，下降约 83%。
      out("#dFr, #lb-permit", ${t(LS[18] - 0.2)});
      fadeIn("#dR", ${t(LS[18] + 0.8)}, 0.5); bump("#lb-y24", ${t(LS[18] + 2.2)}, 1.06, 1); pop("#lb-y25", ${t(TM.y25)}); fadeIn("#dAr", ${t(TM.down - 0.4)}, 0.4); pop("#lb-83", ${t(TM.down)});
      // ===== L19 报告说，攻击转向小额和高频。
      out("#dR", ${t(TM.small - 0.2)}, 0.4); fadeIn("#dS", ${t(TM.small)}, 0.6); pop("#lb-small", ${t(TM.small + 0.4)}); bump("#lb-small", ${t(LS[19] + 2.6)}, 1.08, 1);
      // ===== L20 这个统计只算 EVM 链上的 Drainer 钓鱼，不含私钥泄露和交易所被盗。（静止在 trendC）
      out("#ev5", ${t(LS[20] - 0.2)}); pop("#ck-scope", ${t(LS[20] + 0.6)});
`,
});
