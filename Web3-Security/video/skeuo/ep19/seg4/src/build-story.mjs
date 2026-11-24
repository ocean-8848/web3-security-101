// ep19/seg4「④ 投毒与假币」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.poisonA（BRIEF）。
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
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// ends static on CAMS.casesD
const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E6, E7, E8, E11] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors
const wrapPut = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o);
  const sc = (p) => (Array.isArray(p) && typeof p[0] === "number" ? [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] : p);
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) A[key][n] = sc(A[key][n]);
};
const P = (o, dx = 0, dy = 0) => { const [x, y] = at(o); return [x + dx, y + dy]; };

// ---------------------------------------------------------------- 世界物件
// C 区（seg3 结尾状态，静态，镜头 L0 就离开）
put("bot", L.BOTS_C[0], E8.liqBot(L.BOTS_C[0], { id: "bot", scale: 0.9, scr: "$$$" }));
put("bot1", L.BOTS_C[1], E8.liqBot(L.BOTS_C[1], { id: "bot1", scale: 0.9, scr: "$$" }));
put("bot2", L.BOTS_C[2], E8.liqBot(L.BOTS_C[2], { id: "bot2", scale: 0.9, scr: "$" }));
["Inferno", "Pink", "Angel"].forEach((n, i) => put("kb" + i, L.KITS_C[i], E1.signBoard(L.KITS_C[i], { id: "kb" + i, text: n, style: "wood", size: 30 })));
{
  const [x0, y0] = at(L.DOTS_C), d = [];
  for (let i = 0; i < 49; i++) d.push(`<circle cx="${x0 + 10 + (i % 7) * 18}" cy="${y0 + 150 - Math.floor(i / 7) * 18}" r="6.5" fill="#e0453a"/>`);
  for (let i = 0; i < 8; i++) d.push(`<circle cx="${x0 + 190 + (i % 7) * 18}" cy="${y0 + 150 - Math.floor(i / 7) * 18}" r="6.5" fill="#e0453a" opacity="0.6"/>`);
  add(L.DOTS_C, `<g id="dotsC">${d.join("")}</g>`, 40);
}

// A 区·转账台
put("desk", L.DESK_A, E7.dispatchDesk(L.DESK_A, { id: "desk", scale: 0.9, shown: 1,
  entries: [{ text: "测试 50 USDT", kind: "ok" }, "0.005 USDT", "0 USDT", "0 USDT"] }));
put("user", L.USER_A, O.person(L.USER_A, { id: "user", role: "signer", scale: 0.6 }));
const SCR1 = `<rect width="76" height="26" fill="#ece7dd"/><text x="38" y="18" font-size="11" text-anchor="middle" fill="#1c1c1c" font-weight="700">最近转账</text>
  <rect x="6" y="38" width="64" height="22" rx="5" fill="#e3f3ea"/><text x="38" y="53" font-size="9.5" text-anchor="middle" fill="#1f9d55" font-family="monospace">0x7a3f…9c1e</text>`;
const SCR2 = `<rect width="76" height="26" fill="#ece7dd"/><text x="38" y="18" font-size="11" text-anchor="middle" fill="#1c1c1c" font-weight="700">最近转账</text>
  <rect x="6" y="38" width="64" height="22" rx="5" fill="#e3f3ea"/><text x="38" y="53" font-size="9.5" text-anchor="middle" fill="#1c1c1c" font-family="monospace">0x7a3f…9c1e</text>
  <rect x="6" y="68" width="64" height="22" rx="5" fill="#fbe4e1"/><text x="38" y="83" font-size="9.5" text-anchor="middle" fill="#1c1c1c" font-family="monospace">0x7a3f…9c1e</text>
  <text x="38" y="112" font-size="10" text-anchor="middle" fill="#c3352b" font-weight="700">中间被 … 遮住</text>`;
put("ph", L.PHONE_A, O.phone(L.PHONE_A, { id: "ph", screen: SCR1, screen2: SCR2 }));
put("lt0", L.LETTERS_A[0], E1.letter(L.LETTERS_A[0], { id: "lt0", w: 46, h: 30 }));
put("pl0", L.PLATES_A[0], E2.addrPlate(L.PLATES_A[0], { id: "pl0", text: "7a3f…9c1e" }));
put("pl1", L.PLATES_A[1], E2.addrPlate(L.PLATES_A[1], { id: "pl1", text: "7a3f…9c1e", state: "attacker" }), 0, { grow: true });
put("atk", L.ATK_A, O.person(L.ATK_A, { id: "atk", role: "attacker", scale: 0.6 }));
wrapPut("gpu", L.GPU_A, E2.gpuRig(L.GPU_A, { id: "gpu" }), 0.7);
put("roll", L.ROLL_A, E2.rollCounter(L.ROLL_A, { id: "roll", digits: 10, value: 0, z: L.ROLL_A.z }), 2);
put("clk", L.CLOCK_A, O.clock(L.CLOCK_A, { id: "clk" }));
put("mg", L.MAG_A, O.magnifier(L.MAG_A, { id: "mg" }));
put("oc0", L.ODD_A[0], E7.oddCoin(L.ODD_A[0], { id: "oc0", scale: 0.6, state: "attacker" }), 0, { grow: true });
put("oc1", L.ODD_A[1], E7.oddCoin(L.ODD_A[1], { id: "oc1", scale: 0.6, state: "attacker" }), 0, { grow: true });
// 攻击者头顶的小放大镜（0.5，隐藏）
{
  const mo = S.rel(L.ATK_A, 0, 0), r = O.magnifier(mo, { id: "mgw", z: 150 }), [gx, gy] = at(mo), k = 0.5;
  add(mo, S.hid("mgA", `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${r.svg}</g>`), 6);
}
// 68 点阵（每点约 100 万美元），65 点会变回绿色
{
  const [x0, y0] = at(L.DOTS_A), d = [];
  for (let i = 0; i < 68; i++) d.push(`<circle class="${i < 65 ? "dA-back" : "dA-keep"}" cx="${x0 + 10 + (i % 17) * 17}" cy="${y0 + 14 + Math.floor(i / 17) * 17}" r="6.5" fill="#e0453a"/>`);
  add(L.DOTS_A, S.hid("dotsA", d.join("")), 60);
}

// D 区·代币摊
wrapPut("tw", L.TOWER_D, O.tower(L.TOWER_D, { id: "tw" }), 0.6);
put("stall", L.STALL_D, E8.marketStall(L.STALL_D, { id: "stall", scale: 0.8, price: "↑", head: "新币", gold: 6 }));
put("pool", L.POOL_D, E8.ammPool(L.POOL_D, { id: "pool", scale: 0.8, labelL: "新币", labelR: "USDT", lvlL: 0.55, lvlR: 0.6 }));
put("team", L.TEAM_D, O.person(L.TEAM_D, { id: "team", role: "attacker", scale: 0.5 }));
L.ODD_D.forEach((q, i) => put("od" + i, q, E7.oddCoin(q, { id: "od" + i, scale: 0.6 })));
put("burn", L.BURN_D, E6.burnBox(L.BURN_D, { id: "burn", scale: 0.8, plate: "貔貅盘", sub: "只进不出", cards: 2 }));
put("mint", L.MINT_D, E11.mintPress(L.MINT_D, { id: "mint", scale: 0.6, plate: "隐藏增发", count: "1000", pile: 0.3 }));
["SQUID", "LIBRA", "979 个"].forEach((n, i) => put("cs" + i, L.CASES_D[i], E1.signBoard(L.CASES_D[i], { id: "cs" + i, text: n, style: "plate", size: 34 }), 0, { grow: true }));
// 979 个貔貅盘：一排小钢箱图标
{
  const [x0, y0] = at(L.CASES_D[2]), bx = [];
  for (let i = 0; i < 12; i++) {
    const x = x0 + 120 + (i % 6) * 34, y = y0 - 70 + Math.floor(i / 6) * 40;
    bx.push(S.hid("bx" + i, `<path d="M${x} ${y} l14 -7 l14 7 l-14 7z" fill="#8a8f96"/><path d="M${x} ${y} l14 7 v22 l-14 -7z" fill="#4b4f56"/><path d="M${x + 14} ${y + 7} l14 -7 v22 l-14 7z" fill="#646a72"/><path d="M${x + 9} ${y - 1} h10" stroke="#1c1c1c" stroke-width="2"/>`));
  }
  add(L.CASES_D[2], bx.join(""), 60);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pl0", up(A.pl0.top, 8), "真实收款方", "lab-gs lab-sm");
lb("lb-pl1", up(A.pl1.top, 110), "投毒地址", "lab-rs lab-sm");
lb("lb-zone", P(L.PLATES_A[0], 110, 120), "地址投毒", "lab-ink", "t");
lb("lb-watch", up(A.atk.top, 70), "监控链上转账", "lab-r lab-sm");
lb("lb-gpu", up(A.roll.top, 8), "生成相似地址", "lab-cs lab-sm");
lb("lb-roll", up(A.roll.top, 8), `16<sup>8</sup> ≈ 约 43 亿次 ${gtag("示例计算")}`, "lab-ink lab-sm");
const DT = up(A.desk.top, 10);
lb("lb-e0", [DT[0] - 150, DT[1] - 10], "测试 50 USDT", "lab-gs lab-sm");
lb("lb-e1", [DT[0] - 150, DT[1] + 75], "+ 0.005 USDT", "lab-rs lab-sm");
lb("lb-e2", [DT[0] - 150, DT[1] + 160], "+ 0 USDT · 假 USDT", "lab-rs lab-sm");
lb("lb-nosig", up(A.ph.top, 10), `签名框 <span style="display:inline-block;width:46px;height:22px;border:2px dashed #9a9488;border-radius:4px;vertical-align:middle"></span> 空`, "lab-g lab-sm");
lb("lb-noauth", up(A.ph.top, 115), "✕ 无需授权", "lab-rs lab-sm");
lb("lb-same", up(A.ph.top, 10), "看起来一样", "lab-r lab-sm");
lb("lb-dleg", P(L.DOTS_A, 150, 92), "每点约 100 万美元 · 约 6800 万美元", "lab-g lab-sm", "t");
lb("lb-week", P(L.DOTS_A, 150, -8), "约一周 · 退回绝大部分", "lab-gs lab-sm");
lb("lb-tw", up(A.tw.top, 8), "名人推广", "lab-cs lab-sm");
lb("lb-team", up(A.team.top, 8), "团队", "lab-rs lab-sm");
lb("lb-rug", up(A.pool.top, 10), "卷款 · 撤走流动性", "lab-rs lab-sm");
lb("lb-burn", up(A.burn.top, 10), "只能买 · 不能卖", "lab-ink lab-sm");
lb("lb-nosell", A.burn.plate, "✕ 卖不出", "lab-rs", "c");
lb("lb-mint", up(A.mint.top, 10), "owner 可无限铸币", "lab-rs lab-sm");
lb("lb-cs0", up(A.cs0.top, 8), "约 338 万美元", "lab-g lab-sm");
lb("lb-cs1", up(A.cs1.top, 80), "暴涨后崩盘", "lab-g lab-sm");
lb("lb-cs2", up(A.cs2.top, 8), "约 30 分钟一个", "lab-g lab-sm");
lb("lb-ns0", up(A.tw.top, 8), "不是安全信号", "lab-g lab-sm nsig");
lb("lb-ns1", up(A.stall.board, 70), "不是安全信号", "lab-g lab-sm nsig");

// ---------------------------------------------------------------- 屏幕层卡片
const G = (s) => `<span style="background:#d6efe0;color:#1f9d55">${s}</span>`, R = (s) => `<span style="background:#fbe0dc;color:#c3352b">${s}</span>`;
const html = [
  codeCard("addr", { x: 1180, y: 560, w: 660, head: "完整地址", tag: "示意", mono: true, rows: [
    `0x${G("7a3f")}${R("8b21c94d…e07fd40a")}${G("9c1e")}`, `0x${G("7a3f")}${R("e5c0177a…3b6c77b2")}${G("9c1e")}`] }),
  kw("kw-time", `<span style="color:#1f9d55">测试</span> → 几分钟 → <span style="color:#e0453a">投毒</span>`, { x: 1240, y: 300, size: 40 }),
  evt("ev-ct", `Cointelegraph 报道 · 2024.5<br>1155 枚 WBTC · 约 6800 万美元`, { color: "#e0453a" }),
  evt("ev-cd", `CoinDesk 报道 · 2021.11<br>SQUID · 约 338 万美元`, { color: "#e0453a" }),
  evt("ev-ns", `Nansen 统计 · LIBRA<br>亏损钱包合计约 2.51 亿美元<br><span style="color:#8a857c;font-size:0.8em">案件结果尚无定论</span>`, { color: "#8a857c" }),
  evt("ev-ck", `CertiK 分析 · 2023.8–10<br>一个地址部署 979 个貔貅盘代币`, { color: "#e0453a" }),
].join("");
const css = `.nsig { border-style: dashed !important; color: #6b665d !important; background: #f4f1ea; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  watch: w("看到", 2), gen: w("生成", 3), cnt: w("43", 4), dust: w("粉尘", 5), noauth: w("授权", 6),
  zero: w("0", 7), fake: w("假代币", 7), same: w("看起来一样", 8), min: w("几分钟", 9), wbtc: w("1155", 10), back: w("退回", 11),
  buy: w("买错", 12), rug: w("撤走", 13), sell: w("集中卖掉", 13), pixiu: w("只允许买", 14), nosell: w("不允许卖", 14),
  mint: w("无限铸币", 15), squid: w("SQUID", 16), libra: w("LIBRA", 17), pump: w("暴涨", 17), crash: w("崩盘", 17),
  nansen: w("Nansen", 18), certik: w("CertiK", 19), n979: w("979", 19), sig: w("安全信号", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "trendC", sub: "骗你转错，骗你买错",
  grid: { u0: -4000, u1: 4700, v0: -4100, v1: 4100 }, box: [-3300, -1300, 7200, 2400],   // 盖住 trendC / poisonA / stallD / casesD
  shown: [], css, html,
  terms: [
    { id: "t0", t: "十六进制", d: "用 0–9 和 a–f 共 16 个字符计数", at: w("十六进制", 4) },
    { id: "t1", t: "粉尘转账", d: "极小金额的转账，用来在记录里留痕", at: w("粉尘转账", 5) },
    { id: "t2", t: "WBTC", d: "以太坊上锚定比特币的代币", at: w("WBTC", 10) },
    { id: "t3", t: "流动性", d: "池子里供买卖兑换的资金", at: w("流动性", 13) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 回到开头那笔转账。 C → A；测试行 + 两个门牌
      cam(${t(LS[0])}, "poisonA", 1.5, "power2.inOut");
      pop("#lb-e0", ${t(LS[0] + 1.0)}); grow("pl1", ${t(LS[0] + 1.1)}); pop("#lb-pl0", ${t(LS[0] + 1.2)}); pop("#lb-pl1", ${t(LS[0] + 1.4)});
      // ===== L1 这叫地址投毒。
      pop("#lb-zone", ${t(LS[1] + 0.1)}, 0.3);
      // ===== L2 攻击者监控链上的转账，看到你的测试转账。
      fadeIn("#mgA", ${t(LS[2] + 0.2)}, 0.4); pop("#lb-watch", ${t(LS[2] + 0.4)});
      bump("#lt0", ${t(TM.watch)}, 1.25, 2);
      // ===== L3 生成首尾相同、中间不同的地址
      out("#lb-watch, #mgA", ${t(LS[3] - 0.2)}); pop("#lb-gpu", ${t(TM.gen)});
      KIT.fans(tl, "gpu", ${t(TM.gen)}, 4.2, 3); bump("#pl1", ${t(TM.gen + 1.6)}, 1.08, 2);
      // ===== L4 约 43 亿次（示例计算）
      out("#lb-gpu", ${t(LS[4] - 0.1)}); KIT.count(tl, "roll", ${t(LS[4] + 0.2)}, 3.2, 0, 4294967295, "power1.out");
      pop("#lb-roll", ${t(TM.cnt)});
      // ===== L5 塞一笔粉尘转账
      out("#lb-roll", ${t(LS[5] - 0.2)}); bump("#atk", ${t(LS[5] + 0.3)}, 1.08, 2); bump("#oc0, #oc1", ${t(LS[5] + 1.5)}, 1, 1); X7.entry(tl, "desk", ${t(TM.dust)}, 1, 0.6); bump("#desk", ${t(LS[5] + 1.8)}, 1.04, 1); pop("#lb-e1", ${t(TM.dust + 0.3)});
      // ===== L6 不需要任何授权
      pop("#lb-nosig", ${t(LS[6] + 0.1)}); pop("#lb-noauth", ${t(TM.noauth)});
      // ===== L7 0 个代币 / 同名假代币，落进登记簿
      out("#lb-nosig, #lb-noauth", ${t(LS[7] - 0.2)});
      grow("oc0", ${t(TM.zero)}); grow("oc1", ${t(TM.fake)});
      tl.to("#oc0", { y: 70, opacity: 0, duration: 0.6, ease: "power2.in" }, ${t(TM.fake + 0.9)});
      tl.to("#oc1", { y: 70, opacity: 0, duration: 0.6, ease: "power2.in" }, ${t(TM.fake + 1.2)});
      X7.entry(tl, "desk", ${t(TM.fake + 1.5)}, 2, 0.5); X7.entry(tl, "desk", ${t(TM.fake + 1.9)}, 3, 0.5); pop("#lb-e2", ${t(TM.fake + 1.7)});
      // ===== L8 关键画面：放大镜 + 完整地址卡；钱包只显示首尾
      out("#lb-e1, #lb-e2, #lb-zone", ${t(LS[8] - 0.2)});
      tl.to("#mg", { x: -230, y: -140, duration: 0.8, ease: "power2.inOut" }, ${t(LS[8])});
      KIT.swap(tl, "#ph-scr", "#ph-scr2", ${t(LS[8] + 0.4)}, 0.3);
      pop("#addr", ${t(LS[8] + 0.6)}); pop("#lb-same", ${t(TM.same)});
      // ===== L9 测试 → 几分钟 → 投毒
      out("#addr, #lb-same", ${t(LS[9] - 0.2)}); pop("#kw-time", ${t(LS[9] + 0.3)}); KIT.clock(tl, "clk", ${t(TM.min)}, 1.4, 26);
      // ===== L10 2024.5 · 1155 WBTC · 68 点
      out("#kw-time", ${t(LS[10] - 0.2)}); fadeIn("#dotsA", ${t(LS[10] + 0.3)}, 0.6); pop("#ev-ct", ${t(LS[10] + 0.5)});
      pop("#lb-dleg", ${t(TM.wbtc + 1.0)});
      // ===== L11 约一周内退回绝大部分
      tl.to("#dotsA .dA-back", { attr: { fill: "#1f9d55" }, duration: 0.2, stagger: 0.025 }, ${t(TM.back)});
      pop("#lb-week", ${t(TM.back + 0.4)});
      // ===== L12 → D 代币摊
      out("#ev-ct, #lb-week, #lb-dleg, #lb-pl0, #lb-pl1, #lb-e0", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "stallD", 1.4, "power2.inOut"); bump("#stall", ${t(TM.buy)}, 1.06, 2);
      // ===== L13 卷款：USDT 罐被抽空，价目牌掉到底
      pop("#lb-team", ${t(LS[13] + 0.1)}); bump("#team", ${t(TM.rug)}, 1.1, 2);
      X8.poolLevel(tl, "pool", ${t(TM.rug + 0.2)}, null, 0.03, 0.7); pop("#lb-rug", ${t(TM.rug + 0.4)});
      X8.stallPrice(tl, "stall", ${t(TM.sell)}, "↓", true);
      // ===== L14 貔貅盘：只进不出
      out("#lb-rug, #lb-team", ${t(LS[14] - 0.2)}); pop("#lb-burn", ${t(TM.pixiu)});
      X6.burn(tl, "burn", ${t(TM.pixiu + 0.3)}, 0); X6.burn(tl, "burn", ${t(TM.pixiu + 1.2)}, 1);
      pop("#lb-nosell", ${t(TM.nosell)}); flash("#lb-nosell", ${t(TM.nosell + 0.4)}, 2);
      // ===== L15 隐藏增发
      out("#lb-burn, #lb-nosell", ${t(LS[15] - 0.2)}); X11.mint(tl, "mint", ${t(LS[15] + 0.1)}, 1.8, 3, 1);
      X11.count(tl, "mint", ${t(LS[15] + 0.6)}, "∞", "red"); pop("#lb-mint", ${t(TM.mint)});
      // ===== L16 → 案例牌：SQUID
      out("#lb-mint", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "casesD", 1.3, "power2.inOut");
      grow("cs0", ${t(TM.squid)}); pop("#ev-cd", ${t(TM.squid + 0.4)}); pop("#lb-cs0", ${t(TM.squid + 2.0)});
      // ===== L17 LIBRA：推广 → 暴涨 → 崩盘
      out("#ev-cd", ${t(LS[17] - 0.2)}); grow("cs1", ${t(TM.libra)}); pop("#lb-tw", ${t(TM.libra + 0.8)});
      flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${t(TM.libra + 1.0)}, 4);
      X8.stallPrice(tl, "stall", ${t(TM.pump)}, "↑↑↑", false); X8.stallPrice(tl, "stall", ${t(TM.crash)}, "↓", true);
      pop("#lb-cs1", ${t(TM.crash + 0.2)});
      // ===== L18 Nansen 统计；结果尚无定论
      pop("#ev-ns", ${t(TM.nansen)}); bump("#cs1", ${t(LS[18] + 1.8)}, 1.06, 2); flash("#lb-cs1", ${t(LS[18] + 4.0)}, 2);
      // ===== L19 CertiK：979 个
      out("#ev-ns", ${t(LS[19] - 0.2)}); pop("#ev-ck", ${t(TM.certik)}); grow("cs2", ${t(TM.n979)});
      ${"[...Array(12).keys()]"}.forEach((i) => fadeIn("#bx" + i, ${t(TM.n979 + 0.4)} + i * 0.12, 0.15));
      pop("#lb-cs2", ${t(TM.n979 + 2.4)}); bump("#burn", ${t(LS[19] + 2.2)}, 1.06, 2); bump("#burn", ${t(LS[19] + 4.6)}, 1.06, 2);
      // ===== L20 名人推广和涨幅都不是安全信号（结束静止在 casesD）
      out("#ev-ck, #lb-tw", ${t(LS[20] - 0.2)}); pop("#lb-ns0", ${t(LS[20] + 0.2)}); pop("#lb-ns1", ${t(TM.sig)});
`,
});
