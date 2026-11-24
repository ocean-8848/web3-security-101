// ep19/seg1「① 测试之后」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.deskA（BRIEF）。ends static on CAMS.quizA
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：转账台 + 钱包 + 两个门牌 + 时钟 + 点阵（L3–L5，红虚线从登记簿连到钱包，期间镜头不动）
const xferA = L.fit([...L.GROUPS.deskA, ...L.GROUPS.platesA, L.rect(L.PHONE_A, "phone")], [100, 280, 1820, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, xferA }, ext: [E1, E2, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const PH_SCR = `<rect x="0" y="0" width="76" height="26" fill="#ece7dd"/><text x="38" y="17" font-size="10" text-anchor="middle" fill="#1c1c1c" font-weight="700">钱包</text>
  <text x="8" y="48" font-size="9" fill="#6b6b6b">收款地址</text><text x="8" y="66" font-size="11" fill="#1c1c1c" font-family="monospace" font-weight="700">0x7a…c1</text>
  <rect x="8" y="80" width="60" height="6" rx="3" fill="#ddd6c9"/>
  <rect x="8" y="110" width="60" height="26" rx="7" fill="#1d93ba"/><text x="38" y="127" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">转账</text>
  <g id="ph-cf" opacity="0"><rect x="4" y="106" width="68" height="34" rx="9" fill="#1f9d55"/><text x="38" y="128" font-size="13" text-anchor="middle" fill="#fff" font-weight="700">确认</text></g>`;
const PH_SCR2 = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/>
  <g transform="translate(38,58)"><circle cx="-14" cy="0" r="12" fill="none" stroke="#1f9d55" stroke-width="5"/><path d="M-2 -2H22V2H18V9H14V2H10V7H6V2H-2Z" fill="#1f9d55" stroke="#1f9d55" stroke-width="2" stroke-linejoin="round"/></g>
  <circle cx="38" cy="100" r="13" fill="#1f9d55"/><path d="M31 100l5 5 9-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

put("desk", L.DESK_A, E7.dispatchDesk(L.DESK_A, { id: "desk", scale: L.DESK_A.scale, shown: 0,
  entries: [{ text: "测试 50 USDT", kind: "ok" }, { text: "0.005 USDT", kind: "ghost" }] }));
put("user", L.USER_A, O.person(L.USER_A, { id: "user", role: "signer", scale: L.USER_A.scale }));
put("ph", L.PHONE_A, O.phone(L.PHONE_A, { id: "ph", screen: PH_SCR, screen2: PH_SCR2 }));
put("p1", L.PLATES_A[0], E2.addrPlate(L.PLATES_A[0], { id: "p1", text: "0x7a…c1" }));
put("p2", L.PLATES_A[1], E2.addrPlate(L.PLATES_A[1], { id: "p2", text: "0x7a…c1", state: "attacker" }), 0, { grow: true });
put("atk", L.ATK_A, O.person(L.ATK_A, { id: "atk", role: "attacker", scale: L.ATK_A.scale }), 0, { grow: true });
put("clk", L.CLOCK_A, O.clock(L.CLOCK_A, { id: "clk" }));
put("lt1", L.LETTERS_A[0], E1.letter(L.LETTERS_A[0], { id: "lt1", w: 50, h: 34 }), 0, { wrap: (svg) => S.hid("lt1w", svg) });
put("lt2", L.LETTERS_A[1], E1.letter(L.LETTERS_A[1], { id: "lt2", w: 84, h: 56, state: "attacker" }), 0, { wrap: (svg) => S.hid("lt2w", svg) });

// 点阵：50 个红点（每点约 100 万美元）
const [gx, gy] = at(L.DOTS_A);
const dots = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) dots.push(`<circle cx="${gx + 12 + c * 28}" cy="${gy + 14 + r * 22}" r="8" fill="#e0453a"/>`);
add(L.DOTS_A, S.hid("dots", dots.join("")), 40);

// 信封路线（世界画布点；终点抬到信箱口高度后淡出 = 投进信箱）
const [p1x, p1y] = at(L.PLATES_A[0]), [p2x, p2y] = at(L.PLATES_A[1]);
const R1 = [[p1x - 120, p1y + 70], [p1x, p1y + 20], [p1x, p1y - 95]];
const R2 = [[p2x - 200, p2y + 110], [p2x, p2y + 30], [p2x, p2y - 95]];

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-user", up(A.user.top, 6), "用户", "lab-ink lab-sm");
lb("lb-ph", up(A.ph.top, 6), "钱包", "lab-cs lab-sm");
lb("lb-p1", up(A.p1.top, 6), "真实收款方", "lab-gs lab-sm");
lb("lb-p1ok", up(A.p1.top, 6), "到账 ✓", "lab-gs lab-sm");
lb("lb-p2", up(A.p2.top, 6), "投毒地址", "lab-rs lab-sm");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-e0", [A.desk.entries[0][0] + 150, A.desk.entries[0][1] + 8], "测试 50 USDT ✓", "lab-g lab-sm", "l");
lb("lb-e1", [A.desk.entries[1][0] + 150, A.desk.entries[1][1] + 60], "0.005 USDT", "lab-r lab-sm", "l");
lb("lb-clk", up(A.clk.top, 6), "约 26 分钟", "lab-cs lab-sm");
lb("lb-dots", [gx + 150, gy - 6], "约 5000 万美元 · 每点约 100 万美元", "lab-r lab-sm");
lb("lb-key", [A.ph.top[0] + 70, A.ph.top[1] + 40], "私钥完好", "lab-gs lab-sm", "l");
lb("lb-cf", [A.ph.top[0] + 70, A.ph.top[1] + 40], "每一步：他自己点确认", "lab-cs lab-sm", "l");
lb("q1", A.p1.plate, "?", "lab-r", "c");
lb("q2", [A.p2.plate[0] + 2, A.p2.plate[1] + 2], "?", "lab-r", "c");

// 红虚线：登记簿第 2 行 → 钱包（xferA 镜头期间画）
S.curve("cvcp", S.scr("xferA", A.desk.entries[1]), S.scr("xferA", A.ph.screen), { color: "#e0453a" });

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev", `<b>地址投毒</b> · 2025 年 12 月 ${gtag("Cointelegraph 报道")}`, { color: "#e0453a" })
  + kw("kw8", `不偷钥匙 · 骗你<b>动手</b>`, { x: 600, y: 150, size: 52, accent: "#e0453a" })
  + `<div id="q" class="hide"><div class="q-h">先猜</div><div id="q-b" class="q-b">测试已到账<br>从记录复制地址<br>安全吗？</div></div>`;
const css = `#q{position:absolute;left:1220px;top:330px;width:560px;background:#fff;border-radius:18px;border-left:8px solid #2aa3c9;
  box-shadow:0 6px 24px rgba(0,0,0,.12);padding:22px 30px;transform-origin:top right;font-family:inherit;color:#1c1c1c}
  #q .q-h{font-size:40px;font-weight:800;color:#1d93ba;margin-bottom:8px}#q .q-b{font-size:40px;font-weight:700;line-height:1.35;opacity:0}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = { walk1: LS[1] + 1.2, walk2: LS[4] + 3.0, land2: LS[5] + 1.0 };
const t = (x) => f(x);

S.build({
  cam0: "deskA", sub: "测试到账了，钱却没了",
  grid: { u0: -2100, u1: 2000, v0: -1700, v1: 2400 }, box: [-1200, -600, 2700, 1500],   // 盖住 deskA / platesA / userA / quizA
  shown: [], css, html,
  terms: [
    { id: "t0", t: "USDT", d: "与美元挂钩的稳定币", at: w("USDT", 0) },
    { id: "t1", t: "交易记录", d: "钱包里列出的历史转账，谁都能往里转", at: w("交易记录", 3) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2025 年 12 月，一名用户要转出一大笔 USDT。
      pop("#ev", ${t(LS[0] + 0.4)}); pop("#lb-user", ${t(LS[0] + 1.2)}, 0.25); pop("#lb-ph", ${t(LS[0] + 1.6)}, 0.25);
      // ===== L1 他很谨慎，先转 50 USDT，测试收款地址。
      pop("#lb-p1", ${t(LS[1] + 0.2)}, 0.25); fadeIn("#lt1w", ${t(LS[1] + 0.5)}, 0.3);
      X1.walk(tl, "lt1", ${t(TM.walk1)}, 2.8, ${JSON.stringify(R1)}); out("#lt1w", ${t(TM.walk1 + 2.85)}, 0.2);
      // ===== L2 测试到账，地址没错。
      KIT.rot(tl, "p1-flag", ${t(LS[2] + 0.1)}, -90); out("#lb-p1", ${t(LS[2] + 0.1)}, 0.15); pop("#lb-p1ok", ${t(LS[2] + 0.3)}, 0.25);
      X7.entry(tl, "desk", ${t(LS[2] + 0.4)}, 0, 0.7); pop("#lb-e0", ${t(LS[2] + 0.9)}, 0.25);
      // ===== L3 几分钟后，他的交易记录里，多出一笔 0.005 USDT 的转账。
      out("#lb-user, #lb-ph, #lb-p1ok", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "xferA", 1.2);
      grow("atk", ${t(LS[3] + 1.2)}); pop("#lb-atk", ${t(LS[3] + 1.6)}, 0.25);
      X7.entry(tl, "desk", ${t(LS[3] + 2.4)}, 1, 0.7); pop("#lb-e1", ${t(LS[3] + 2.9)}, 0.25);
      grow("p2", ${t(LS[3] + 3.6)}); pop("#lb-p1", ${t(LS[3] + 4.0)}, 0.25); pop("#lb-p2", ${t(LS[3] + 4.2)}, 0.25);
      // ===== L4 约 26 分钟后，他从记录里复制地址，转出约 5000 万美元。
      KIT.clock(tl, "clk", ${t(LS[4] + 0.1)}, 1.6, 26); pop("#lb-clk", ${t(LS[4] + 0.3)}, 0.25);
      draw("cvcp", ${t(LS[4] + 1.6)}); bump("#lb-e1", ${t(LS[4] + 1.6)}, 1.15, 1);
      fadeIn("#lt2w", ${t(LS[4] + 2.6)}, 0.3);
      X1.walk(tl, "lt2", ${t(TM.walk2)}, ${t(TM.land2 - TM.walk2)}, ${JSON.stringify(R2)});
      fadeIn("#dots", ${t(LS[4] + 3.4)}, 0.1); tl.from("#dots circle", { opacity: 0, y: 14, duration: 0.3, stagger: 0.025, immediateRender: false }, ${t(LS[4] + 3.4)});
      pop("#lb-dots", ${t(LS[4] + 4.2)}, 0.25);
      // ===== L5 这一笔，到了攻击者的地址。
      out("#cvcp", ${t(LS[5])}); out("#lt2w", ${t(TM.land2 + 0.05)}, 0.2);
      KIT.rot(tl, "p2-flag", ${t(TM.land2 + 0.2)}, -90); bump("#lb-p2", ${t(TM.land2 + 0.3)}, 1.2, 1);
      // ===== L6 私钥没被偷，钱包也没被攻破。
      out("#ev, #lb-p1, #lb-p2, #lb-atk, #lb-e0, #lb-e1, #lb-clk, #lb-dots, #dots", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "userA", 1.2);
      fadeIn("#ph-scr2", ${t(LS[6] + 1.1)}, 0.3); pop("#lb-key", ${t(LS[6] + 1.4)}, 0.25);
      // ===== L7 每一步，都是他自己点的确认。
      out("#ph-scr2, #lb-key", ${t(LS[7] - 0.1)}); pop("#lb-cf", ${t(LS[7] + 0.2)}, 0.25);
      [0, 0.65, 1.3].forEach((d) => { tl.to("#ph-cf", { opacity: 1, duration: 0.08 }, ${t(LS[7] + 0.5)} + d); tl.to("#ph-cf", { opacity: 0, duration: 0.2 }, ${t(LS[7] + 0.85)} + d); });
      // ===== L8 这类骗局不偷钥匙，它骗你自己动手。
      out("#lb-cf", ${t(LS[8] - 0.1)}); pop("#kw8", ${t(LS[8] + 0.3)});
      // ===== L9 先猜一道题。
      out("#kw8", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "quizA", 1.2); pop("#q", ${t(LS[9] + 0.3)});
      // ===== L10 测试转账已经到账，从记录里复制同一个地址，转大额，安全吗？
      fadeIn("#q-b", ${t(LS[10] + 0.2)}, 0.35); pop("#q1", ${t(LS[10] + 1.0)}, 0.25); pop("#q2", ${t(LS[10] + 1.2)}, 0.25);
      bump("#q1, #q2", ${t(LS[10] + 2.6)}, 1.25, 1); bump("#q-b", ${t(LS[10] + 4.0)}, 1.04, 1);
      // ===== L11 先记住这个问题。
      tl.to("#q", { x: 60, y: -205, scale: 0.75, duration: 0.6, ease: "power2.inOut" }, ${t(LS[11] + 0.1)});
`,
});
