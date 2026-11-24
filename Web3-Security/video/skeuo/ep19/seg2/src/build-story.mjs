// ep19/seg2「② 五类签名」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.signB（BRIEF）。
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
// 段首 = seg1 段尾 CAMS.quizA（A 区门牌静止复刻），L0 向左摇到 signB。ends static on CAMS.delegB
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：L17 推近 permit 支票 + 手机（关键画面）
const loginB = L.fit([L.rect(L.PHONE_B, "phone"), L.rect(L.CHEQUES_B[0], "cheque"), L.rect(L.CHEQUES_B[1], "cheque"),
  L.rect(L.GAS_B, "gasPump"), L.rect(L.CHAIN_B, "chain3")], [300, 300, 1620, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, loginB }, ext: [E1, E2, E5, E6, E7, E9, E11, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 包层缩放（不支持 opts.scale 的物件），anchors 一并换算
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const fixK = (key, o, k) => { const [gx, gy] = at(o); const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = sc(v); } };

// ---------------------------------------------------------------- A 区（段首复刻 seg1 段尾 quizA 画面）
put("deskA", L.DESK_A, E7.dispatchDesk(L.DESK_A, { id: "deskA", scale: L.DESK_A.scale, shown: 2,
  entries: [{ text: "测试 50 USDT", kind: "ok" }, { text: "0.005 USDT", kind: "ghost" }] }));
put("p1", L.PLATES_A[0], E2.addrPlate(L.PLATES_A[0], { id: "p1", text: "0x7a…c1" }));
put("p2", L.PLATES_A[1], E2.addrPlate(L.PLATES_A[1], { id: "p2", text: "0x7a…c1", state: "attacker" }));
put("atkA", L.ATK_A, O.person(L.ATK_A, { id: "atkA", role: "attacker", scale: L.ATK_A.scale }));
put("clkA", L.CLOCK_A, O.clock(L.CLOCK_A, { id: "clkA" }));
lb("lb-p1", up(A.p1.top, 6), "真实收款方", "lab-gs lab-sm");
lb("lb-p2", up(A.p2.top, 6), "投毒地址", "lab-rs lab-sm");
lb("q1", A.p1.plate, "?", "lab-r", "c");
lb("q2", [A.p2.plate[0] + 2, A.p2.plate[1] + 2], "?", "lab-r", "c");

// ---------------------------------------------------------------- B 区物件
// 手机屏幕（本地 76×150）：私钥绿钥匙 / 十六进制 / 登录
const PH = `<rect width="76" height="150" fill="#f4f1ea"/>
  <g id="phk"><circle cx="26" cy="72" r="11" fill="none" stroke="#1f9d55" stroke-width="4"/><rect x="36" y="69" width="26" height="6" fill="#1f9d55"/><rect x="52" y="75" width="4" height="8" fill="#1f9d55"/><rect x="58" y="75" width="4" height="6" fill="#1f9d55"/></g>
  <g id="phx" opacity="0">${["0x095ea7b3", "0000000000", "c1a4f09e2e", "ffffffffff", "ffffffffff", "0000000000"].map((s, i) => `<text x="6" y="${30 + i * 18}" font-family="monospace" font-size="10" fill="#8a8a8a">${s}</text>`).join("")}</g>
  <g id="phl" opacity="0"><text x="38" y="62" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="20" font-weight="900" fill="#1c1c1c">登录</text><rect x="10" y="98" width="56" height="24" rx="7" fill="#1d93ba"/><text x="38" y="115" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="12" fill="#fff">签名</text></g>`;
put("winB", L.WIN_B, O.browserWin(L.WIN_B, { id: "winB", title: "领取空投", heading: "领取空投", button: "签名领取" }));
put("userB", L.USER_B, O.person(L.USER_B, { id: "userB", role: "signer", scale: L.USER_B.scale }));
put("phoneB", L.PHONE_B, O.phone(L.PHONE_B, { id: "phoneB", screen: PH }));
put("parcelB", L.PARCEL_B, E7.parcel(L.PARCEL_B, { id: "parcelB" }));
put("docB", L.DOC_B, O.doc(L.DOC_B, { id: "docB", title: "签收单", standing: true, lines: ["收件人 ____", "日期 ____"] }));
put("keyB", L.KEY_B, O.key(L.KEY_B, { id: "keyB" }));
// L1 飘向攻击者的那张支票（签名后来才描出）
const CHQF = { u: L.WIN_B.u + 60, v: L.WIN_B.v + 160 };
put("chqF", CHQF, E9.cheque(CHQF, { id: "chqF", scale: 0.8, signed: false, amount: "授权" }), 30, { wrap: (svg) => S.hid("chqFw", svg) });
// 五张展台：approve / permit / setApprovalForAll / Permit2，第五个是门牌 + 委托牌
const CQ = [
  { labels: ["spender", "额度", "期限", "nonce", "用途"], vals: ["0xC1…", "无限", "无", "#7", "授权"] },
  { labels: ["spender", "额度", "期限", "nonce", "用途"], vals: ["0xC1…", "无限", "无", "#8", "permit"] },
  { labels: ["operator", "范围", "期限", "nonce", "用途"], vals: ["0xC1…", "全部", "无", "#9", "NFT"] },
  { labels: ["spender", "代币", "期限", "nonce", "用途"], vals: ["0xC1…", "多种", "无", "#3", "批量"] },
];
CQ.forEach((c, i) => put(`chq${i}`, L.CHEQUES_B[i], E9.cheque(L.CHEQUES_B[i], { id: `chq${i}`, scale: L.CHEQUES_B[i].scale, amount: "授权",
  labels: c.labels, vals: c.vals, fields: ["blank", "blank", "blank", "blank", "blank"], copies: 0 })));
put("addrB", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "addrB", text: "你的地址" }));
const TAG = E15.delegateTagOn(L.ADDR_B, { id: "tagB", state: "attacker", target: "扫币合约", on: false });
put("tagB", TAG.o, E15.delegateTag(TAG.o, TAG.opts));
const BN = [["approve"], ["permit"], ["setApproval", "ForAll"], ["Permit2"], ["EIP-7702"]];
BN.forEach(([text, sub], i) => put(`bd${i}`, L.BOARDS_B[i], E1.signBoard(L.BOARDS_B[i], { id: `bd${i}`, style: "plate", text, sub, size: 20, w: 196 }), 0, { grow: true }));
put("shareB", L.SHARE_B, E6.shareCert(L.SHARE_B, { id: "shareB", n: 4, scale: L.SHARE_B.scale }));
put("chainB", L.CHAIN_B, O.chain(L.CHAIN_B, { id: "chainB", n: 3, labels: ["#1", "#2", "#3"] }), 0, { wrap: wrapK(L.CHAIN_B, 0.6), grow: true });
fixK("chainB", L.CHAIN_B, 0.6);
put("gasB", L.GAS_B, E15.gasPump(L.GAS_B, { id: "gasB", scale: L.GAS_B.scale, title: "Gas", scr: "待付", level: 0.6 }));
put("safeB", L.SAFE_B, O.safe(L.SAFE_B, { id: "safeB", plate: "金库合约" }), 0, { wrap: wrapK(L.SAFE_B, 0.7) });
fixK("safeB", L.SAFE_B, 0.7);
put("kcB", L.KEYCARD_B, E5.keycard(L.KEYCARD_B, { id: "kcB", role: "owner", scale: L.KEYCARD_B.scale }));
put("kcX", L.KEYCARD_B, E5.keycard(L.KEYCARD_B, { id: "kcX", role: "owner", state: "attacker", scale: L.KEYCARD_B.scale }), 1, { wrap: (svg) => S.hid("kcXw", svg) });
put("mintB", L.MINT_B, E11.mintPress(L.MINT_B, { id: "mintB", scale: L.MINT_B.scale, count: "0", plate: "DAI", pile: 0.1 }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: L.ATK_B.scale }));
// L25 可信设备（硬件钱包）+ 放大镜，放在委托牌右侧空地
const HW = { u: L.ADDR_B.u + 330, v: L.ADDR_B.v - 40 };
const HWS = `<rect width="70" height="40" fill="#e9ecef"/><text x="4" y="16" font-family="monospace" font-size="8" fill="#8a8a8a">0x095ea7b3</text><text x="4" y="30" font-family="monospace" font-size="8" fill="#8a8a8a">ffffffffff…</text>`;
const HWS2 = `<rect width="70" height="40" fill="#eef8f1"/><text x="4" y="12" font-family="Noto Sans SC, sans-serif" font-size="8" fill="#1f9d55">spender 0xC1…</text><text x="4" y="24" font-family="Noto Sans SC, sans-serif" font-size="8" fill="#e0453a">额度 无限</text><text x="4" y="36" font-family="Noto Sans SC, sans-serif" font-size="8" fill="#e0453a">期限 无</text>`;
put("hwB", HW, O.hwWallet(HW, { id: "hwB", screen: HWS, screen2: HWS2 }), 0, { wrap: (svg) => S.hid("hwBw", svg) });
const MAGP = { u: HW.u + 60, v: HW.v + 150 };
put("magB", MAGP, O.magnifier(MAGP, { id: "magB" }), 0, { wrap: (svg) => S.hid("magBw", svg) });

// 无记录红虚线框（permit 支票身后、本该有链的位置）
const [nx, ny] = at(L.CHEQUES_B[1]);
add(L.CHEQUES_B[1], S.hid("noRec", `<rect x="${nx - 70}" y="${ny - 215}" width="140" height="80" rx="8" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>
  <path d="M${nx - 22} ${ny - 197}l44 44M${nx + 22} ${ny - 197}l-44 44" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/>`), -60);
// L15 信箱里的金币
const [ax, ay] = A.addrB.plate;
add(L.ADDR_B, S.hid("coinsB", [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${ax - 30 + i * 15}" cy="${ay + 34 + (i % 2) * 6}" rx="11" ry="7" fill="#d4a017" stroke="#9c7410" stroke-width="2"/>`).join("")), 12);
// 点阵：L18 32 点（permit），L20 55 点（DAI），L23 2 + 1 点（7702）
const [d1x, d1y] = [nx - 180, ny - 500];
const dots32 = []; for (let i = 0; i < 32; i++) dots32.push(`<circle cx="${d1x + (i % 8) * 18}" cy="${d1y + Math.floor(i / 8) * 18}" r="6.5" fill="#e0453a"/>`);
add(L.CHAIN_B, S.hid("d32", dots32.join("")), -300);
const [gx, gy] = at(L.DOTS_B);
const dots55 = []; for (let i = 0; i < 55; i++) dots55.push(`<circle cx="${gx + (i % 11) * 24}" cy="${gy + Math.floor(i / 11) * 22}" r="8" fill="#d4a017"/>`);
add(L.DOTS_B, S.hid("d55", dots55.join("")), 40);
add(L.DOTS_B, S.hid("d77", `<circle cx="${gx + 20}" cy="${gy + 40}" r="11" fill="#e0453a"/><circle cx="${gx + 48}" cy="${gy + 40}" r="11" fill="#e0453a"/>
  <circle cx="${gx + 250}" cy="${gy + 40}" r="11" fill="#e0453a"/>`), 40);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-win", up(A.winB.top, 6), "领取空投 · 签名领取", "lab-cs lab-sm");
lb("lb-atkB", up(A.atkB.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-userB", up(A.userB.top, 6), "用户", "lab-ink lab-sm");
const FEND = [at(L.ATK_B)[0] - 150, at(L.ATK_B)[1] - 30];          // L1 支票飘到攻击者身边
lb("lb-ctrl", [FEND[0] - 30, FEND[1] - 110], "控制权 → 攻击者", "lab-rs lab-sm", "r");
lb("lb-real", [FEND[0], FEND[1] + 20], "真名签的", "lab-ink lab-sm", "t");
lb("lb-pk", [A.phoneB.top[0] + 60, A.phoneB.top[1] + 30], "私钥在手 ✓", "lab-gs lab-sm", "l");
lb("lb-parcel", up(A.parcelB.top, 6), "快递", "lab-cs lab-sm");
lb("lb-doc", up(A.docB.top, 6), "签收单 · 比喻", "lab-cs lab-sm");
lb("lb-back", A.docB.center, "背面：同意交出房门钥匙", "lab-r lab-sm", "c");
const KEYTO = [at(L.PARCEL_B)[0] + 170, at(L.PARCEL_B)[1] - 40];
lb("lb-hold", [KEYTO[0], KEYTO[1] - 50], "持单人", "lab-rs lab-sm");
lb("lb-see", [A.docB.top[0] - 120, A.docB.top[1] + 60], "能看背面 ✓", "lab-g lab-sm", "r");
lb("lb-hex", [A.phoneB.top[0] + 60, A.phoneB.top[1] + 30], "只有十六进制 · 看不懂 ?", "lab-ink lab-sm", "l");
lb("lb-c0", up(A.chq0.top, 6), "spender · 额度", "lab-cs lab-sm");
lb("lb-c1", up(A.chq1.top, 6), "链下", "lab-rs lab-sm");
lb("lb-c2", up(A.chq2.top, 6), "operator · 全部", "lab-cs lab-sm");
lb("lb-c3", up(A.chq3.top, 30), "一次签名 · 多种代币", "lab-cs lab-sm");
lb("lb-chain", up(A.chainB.top, 6), "上链", "lab-cs lab-sm");
lb("lb-gas", up(A.gasB.top, 6), "花 Gas", "lab-cs lab-sm");
lb("lb-sub", [A.chainB.last[0] + 40, A.chainB.last[1] - 70], "别人代为提交", "lab-rs lab-sm", "l");
lb("lb-nft", up(A.shareB.top, 8), "NFT 系列 · 全部", "lab-cs lab-sm");
lb("lb-addr", up(A.addrB.top, 6), "你的地址", "lab-ink lab-sm");
lb("lb-tag", [A.tagB.text[0] + 40, A.tagB.text[1]], "委托 → 扫币合约", "lab-rs lab-sm", "l");
lb("lb-all", [A.atkB.ground[0], A.atkB.ground[1] + 12], "全部资产转走", "lab-r lab-sm", "t");
lb("lb-norec", [nx, ny - 228], "无交易记录", "lab-r lab-sm");
lb("lb-nogas", up(A.gasB.top, 6), "不花 Gas", "lab-rs lab-sm");
lb("lb-login", [A.phoneB.top[0] + 60, A.phoneB.top[1] + 30], "以为：只是登录", "lab-cs lab-sm", "l");
lb("lb-back2", [A.chq1.center[0], A.chq1.center[1] + 4], "背面：可提交上链", "lab-r lab-sm", "c");
lb("lb-d32", [d1x + 63, d1y + 82], "约 3243 万美元 spWETH · 每点约 100 万美元", "lab-r lab-sm", "t");
lb("lb-safe", up(A.safeB.top, 6), "金库合约", "lab-ink lab-sm");
lb("lb-kc", [A.kcB.ground[0], A.kcB.ground[1] + 14], "owner", "lab-ink lab-sm", "t");
lb("lb-kcx", [A.kcB.ground[0], A.kcB.ground[1] + 14], "owner → 攻击者", "lab-rs lab-sm", "t");
lb("lb-20m", [A.mintB.ground[0] + 20, A.mintB.ground[1] + 120], "约 20 分钟后 · 铸出 DAI", "lab-cs lab-sm", "t");
lb("lb-d55", [gx + 120, gy + 106], "约 5547 万美元 DAI · 每点约 100 万美元", "lab-r lab-sm", "t");
lb("lb-own", [A.kcB.top[0] - 70, A.kcB.top[1] - 60], "改 owner", "lab-rs lab-sm", "r");
lb("lb-unsafe", up(A.chq1.top, 6), "不上链 ≠ 安全", "lab-r lab-sm");
lb("lb-d77a", [gx + 34, gy + 60], "约 154 万", "lab-r lab-sm", "t");
lb("lb-d77b", [gx + 250, gy + 60], "约 100 万", "lab-r lab-sm", "t");
lb("lb-d77", [gx + 140, gy + 10], "每点约 100 万美元（取整）", "lab-ink lab-sm");
lb("lb-hw", [A.hwB.top[0] + 60, A.hwB.top[1] - 4], "可信设备 · 逐字段解码", "lab-gs lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1390, y: 260, w: 470 };
const cardA = codeCard("cA", { ...CA, head: "授权解码后", tag: "示意", mono: true, rows: [{ html: "approve(spender, amount)" }] });
S.curve("cvA", [CA.x - 4, codeRowY(CA.y, 0)], S.scr("chequesB", A.chq0.fields[0]), { color: "#e0453a" });
S.curve("cv32", S.scr("chequesB", A.chq1.top), S.scr("chequesB", [d1x + 63, d1y + 60]), { color: "#e0453a" });
S.curve("cv15", S.scr("chequesB", A.addrB.plate), S.scr("chequesB", A.atkB.center), { color: "#e0453a" });
S.curve("cv21", S.scr("vaultB", [A.kcB.top[0] - 120, A.kcB.top[1] - 40]), S.scr("vaultB", A.chq1.top), { color: "#8a8a8a" });
lb("lb-diff", [(A.kcB.top[0] - 120 + A.chq1.top[0]) / 2 - 30, (A.kcB.top[1] - 40 + A.chq1.top[1]) / 2], "不同手法", "lab-ink lab-sm", "r");
const html = cardA
  + evt("ev18", `The Block 报道 · 2024 年 9 月`, { color: "#e0453a" })
  + evt("ev19", `BlockSec 分析 · 2024 年 8 月`, { color: "#e0453a", top: 126 })
  + evt("ev23", `ScamSniffer 年报 · 2025 年 8 月`, { color: "#e0453a", top: 132 })
  + kw("kw24", `根因仍是 <b>私钥泄露</b>，委托只让转账更快${gtag("研究者观点")}`, { x: 1180, y: 430, size: 28, accent: "#6b6b6b" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "quizA", sub: "你签的是真名，授权给了别人",
  grid: { u0: -7600, u1: 2900, v0: -6800, v1: 2500 }, box: [-7800, -1400, 9300, 2400],   // 盖住 quizA / signB / receiptB / chequesB / vaultB / delegB
  shown: ["#lb-p1", "#lb-p2", "#q1", "#q2"], css, html,
  terms: [
    { id: "t0", t: "授权", d: "允许另一个地址转走你一定数量的代币", at: w("授权", 1) },
    { id: "t1", t: "Gas", d: "链上交易要付的手续费", at: w("Gas", 9) },
    { id: "t2", t: "链下签名", d: "不发交易、只在本地签的一段消息", at: w("链下签名", 10) },
    { id: "t3", t: "NFT", d: "每个都独一无二的链上代币", at: w("NFT", 12) },
    { id: "t4", t: "Permit2", d: "统一授权合约，支持批量和带期限授权", at: w("Permit2", 13) },
    { id: "t5", t: "EIP-7702", d: "让普通地址执行指定合约代码的授权", at: w("EIP-7702", 14) },
    { id: "t6", t: "owner", d: "合约里拥有管理权限的地址", at: w("owner", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      // ===== L0 先给准确的说法 —— 从 A 门牌左摇，经过 C，到 B 全景
      out("#lb-p1, #lb-p2, #q1, #q2", ${t(LS[0])}, 0.3); cam(${t(LS[0] + 0.1)}, "signB", 3.0);
      // ===== L1 钓鱼签名：空投窗口吐出一张支票，飘向攻击者
      pop("#lb-win", ${t(LS[1])}); pop("#lb-atkB", ${t(LS[1] + 0.2)}); pop("#lb-userB", ${t(LS[1] + 0.3)});
      fadeIn("#chqFw", ${t(LS[1] + 0.5)}, 0.3); X1.walk(tl, "chqF", ${t(LS[1] + 0.9)}, 1.8, [[${FEND[0]}, ${FEND[1]}]]);
      pop("#lb-ctrl", ${t(LS[1] + 2.8)});
      // ===== L2 真名签名 + 私钥仍在手里
      X9.sign(tl, "chqF", ${t(LS[2] + 0.2)}, 0.9); pop("#lb-real", ${t(LS[2] + 0.6)}); pop("#lb-pk", ${t(LS[2] + 1.0)});
      // ===== L3 签收单比喻
      out("#lb-win, #lb-atkB, #lb-ctrl, #lb-real, #chqFw", ${t(LS[3] - 0.2)}, 0.3); cam(${t(LS[3])}, "receiptB", 1.2);
      pop("#lb-parcel", ${t(LS[3] + 0.9)}); pop("#lb-doc", ${t(LS[3] + 1.1)});
      // ===== L4 翻面：同意交出房门钥匙；钥匙飞到持单人
      tl.to("#docB", { scaleX: 0, transformOrigin: "50% 50%", duration: 0.2, ease: "power1.in" }, ${t(LS[4] + 0.2)});
      tl.to("#docB", { scaleX: 1, duration: 0.2, ease: "power1.out" }, ${t(LS[4] + 0.4)});
      pop("#lb-back", ${t(LS[4] + 0.6)}); X5.fly(tl, "keyB", ${t(LS[4] + 1.4)}, ${f(KEYTO[0] - at(L.KEY_B)[0])}, ${f(KEYTO[1] - at(L.KEY_B)[1])}, 0.9, 40);
      pop("#lb-hold", ${t(LS[4] + 2.1)});
      // ===== L5 比喻不成立：签收单能翻过来看
      out("#lb-back", ${t(LS[5] + 0.1)}, 0.2);
      tl.to("#docB", { scaleX: 0, transformOrigin: "50% 50%", duration: 0.2, ease: "power1.in" }, ${t(LS[5] + 0.2)});
      tl.to("#docB", { scaleX: 1, duration: 0.2, ease: "power1.out" }, ${t(LS[5] + 0.4)});
      pop("#lb-see", ${t(LS[5] + 0.7)});
      // ===== L6 钱包只显示十六进制
      out("#lb-pk", ${t(LS[6])}, 0.2); KIT.swap(tl, "#phk", "#phx", ${t(LS[6] + 0.3)}, 0.4); pop("#lb-hex", ${t(LS[6] + 0.8)});
      // ===== L7 五类：展台牌依次长出
      out("#keyB, #lb-parcel, #lb-doc, #lb-hold, #lb-see, #lb-hex, #lb-userB", ${t(LS[7] - 0.2)}, 0.3); cam(${t(LS[7])}, "chequesB", 1.4);
      [0, 1, 2, 3, 4].forEach((i) => grow("bd" + i, ${t(LS[7] + 1.2)} + i * 0.25));
      // ===== L8 approve：字段 + 代码卡 A 第 1 行
      X9.fields(tl, "chq0", ${t(LS[8] + 0.6)}, ["filled", "filled", null, null, null], 0.3); pop("#lb-c0", ${t(LS[8] + 1.0)});
      pop("#cA", ${t(LS[8] + 1.4)}); draw("cvA", ${t(LS[8] + 1.8)});
      // ===== L9 上链，花 Gas
      grow("chainB", ${t(LS[9])}); pop("#lb-chain", ${t(LS[9] + 0.4)});
      X15.pumpScr(tl, "gasB", ${t(LS[9] + 0.6)}, "0.002 ETH"); X15.pumpNozzle(tl, "gasB", ${t(LS[9] + 0.6)}, true); pop("#lb-gas", ${t(LS[9] + 0.8)});
      // ===== L10 permit：链下签名
      out("#cA, #cvA", ${t(LS[10])}, 0.3); X15.pumpNozzle(tl, "gasB", ${t(LS[10])}, false);
      X9.fields(tl, "chq1", ${t(LS[10] + 0.5)}, ["filled", "filled", null, null, null], 0.3); pop("#lb-c1", ${t(LS[10] + 1.2)});
      // ===== L11 由别人提交上链
      X9.copies(tl, "chq1", ${t(LS[11])}, 1, 0.5); X9.copyTo(tl, "chq1", ${t(LS[11] + 0.6)}, 0, [${f(A.chainB.last[0] + 40)}, ${f(A.chainB.last[1] - 30)}], 0.9);
      out("#lb-gas", ${t(LS[11] + 0.8)}, 0.2); pop("#lb-sub", ${t(LS[11] + 1.2)});
      // ===== L12 setApprovalForAll：NFT 整叠滑走
      out("#lb-sub", ${t(LS[12])}, 0.2); X9.fields(tl, "chq2", ${t(LS[12] + 0.5)}, ["filled", "filled", null, null, null], 0.3);
      pop("#lb-c2", ${t(LS[12] + 1.0)}); pop("#lb-nft", ${t(LS[12] + 1.2)});
      X6.carry(tl, "shareB", ${t(LS[12] + 2.4)}, 260, 120, 0, 1.0); out("#shareB, #lb-nft", ${t(LS[12] + 3.0)}, 0.4);
      // ===== L13 Permit2：复印件错开滑出
      X9.fields(tl, "chq3", ${t(LS[13] + 0.4)}, ["filled", "filled", null, null, null], 0.3);
      out("#lb-c2", ${t(LS[13] + 0.2)}, 0.2); X9.copies(tl, "chq3", ${t(LS[13] + 0.9)}, 3, 0.6); pop("#lb-c3", ${t(LS[13] + 1.4)});
      // ===== L14 7702 委托：门牌挂上扫币合约
      pop("#lb-addr", ${t(LS[14] + 0.3)}); fadeIn("#coinsB", ${t(LS[14] + 0.5)}, 0.3);
      X15.tagDrop(tl, "tagB", ${t(LS[14] + 1.2)}); pop("#lb-tag", ${t(LS[14] + 1.7)});
      // ===== L15 代码可以直接转走全部资产
      draw("cv15", ${t(LS[15] + 0.2)}); pop("#lb-atkB", ${t(LS[15] + 0.2)});
      tl.to("#coinsB ellipse", { x: ${f(A.atkB.center[0] - ax)}, y: ${f(A.atkB.center[1] - ay - 34)}, opacity: 0, duration: 1.0, stagger: 0.08, ease: "power1.in" }, ${t(LS[15] + 0.6)});
      pop("#lb-all", ${t(LS[15] + 1.4)});
      // ===== L16 最危险是链下签名：不花 Gas，无记录
      out("#cv15, #lb-all", ${t(LS[16])}, 0.3); bump("#lb-c1", ${t(LS[16] + 0.2)}, 1.25, 2);
      X15.pumpLamp(tl, "gasB", ${t(LS[16] + 0.8)}, "off"); X15.pumpScr(tl, "gasB", ${t(LS[16] + 0.8)}, "—"); pop("#lb-nogas", ${t(LS[16] + 1.0)});
      out("#lb-c1", ${t(LS[16] + 1.3)}, 0.2); fadeIn("#noRec", ${t(LS[16] + 1.6)}, 0.3); pop("#lb-norec", ${t(LS[16] + 1.8)});
      // ===== L17 关键画面：以为只是登录，其实签下支票
      out("#lb-c0, #lb-c3, #lb-addr, #lb-tag, #lb-chain", ${t(LS[17] - 0.2)}, 0.2); cam(${t(LS[17])}, "loginB", 1.0);
      KIT.swap(tl, "#phx", "#phl", ${t(LS[17] + 0.4)}, 0.3); pop("#lb-login", ${t(LS[17] + 0.7)});
      flash("#chq1", ${t(LS[17] + 1.3)}, 2, 0.4); pop("#lb-back2", ${t(LS[17] + 1.7)});
      // ===== L18 2024.9 permit 约 3243 万美元
      out("#lb-login, #lb-back2, #lb-nogas, #lb-norec, #noRec", ${t(LS[18] - 0.2)}, 0.2); cam(${t(LS[18])}, "chequesB", 1.0);
      pop("#ev18", ${t(LS[18] + 0.6)}); draw("cv32", ${t(LS[18] + 1.2)});
      fadeIn("#d32", ${t(LS[18] + 1.6)}, 0.6); pop("#lb-d32", ${t(LS[18] + 2.2)});
      // ===== L19 同年 8 月：金库 owner 改成攻击者
      out("#ev18, #cv32, #d32, #lb-d32", ${t(LS[19] - 0.2)}, 0.3); cam(${t(LS[19])}, "vaultB", 1.2);
      pop("#lb-safe", ${t(LS[19] + 0.8)}); pop("#lb-kc", ${t(LS[19] + 1.0)}); pop("#ev19", ${t(LS[19] + 1.2)});
      KIT.swap(tl, "#kcB", "#kcXw", ${t(LS[19] + 2.4)}, 0.4); out("#lb-kc", ${t(LS[19] + 2.4)}, 0.2); pop("#lb-kcx", ${t(LS[19] + 2.6)});
      // ===== L20 约 20 分钟后铸出约 5547 万美元 DAI
      pop("#lb-20m", ${t(LS[20] + 0.3)}); X11.mint(tl, "mintB", ${t(LS[20] + 0.6)}, 1.6, 2, 0.9); X11.count(tl, "mintB", ${t(LS[20] + 1.8)}, "5547万", "red");
      fadeIn("#d55", ${t(LS[20] + 1.6)}, 0.6); pop("#lb-d55", ${t(LS[20] + 2.0)});
      tl.to("#d55 circle", { attr: { fill: "#e0453a" }, duration: 0.5, stagger: 0.01 }, ${t(LS[20] + 2.8)});
      // ===== L21 不是 permit，是改 owner
      out("#ev19, #lb-20m", ${t(LS[21])}, 0.3); pop("#lb-own", ${t(LS[21] + 0.3)}); draw("cv21", ${t(LS[21] + 0.6)}); pop("#lb-diff", ${t(LS[21] + 1.2)});
      // ===== L22 链下签名不上链也能转移资产
      out("#lb-own, #cv21, #lb-diff", ${t(LS[22] - 0.1)}, 0.2); flash("#chq1", ${t(LS[22] + 0.2)}, 2, 0.4); pop("#lb-unsafe", ${t(LS[22] + 0.6)});
      // ===== L23 2025.8 两起 7702 委托钓鱼
      out("#lb-unsafe, #lb-safe, #lb-kcx, #d55, #lb-d55", ${t(LS[23] - 0.2)}, 0.3); cam(${t(LS[23])}, "delegB", 1.2);
      pop("#lb-tag", ${t(LS[23] + 0.8)}); X15.tagPulse(tl, "tagB", ${t(LS[23] + 1.0)}); pop("#ev23", ${t(LS[23] + 1.2)});
      fadeIn("#d77", ${t(LS[23] + 1.8)}, 0.4); pop("#lb-d77a", ${t(LS[23] + 2.1)}); pop("#lb-d77b", ${t(LS[23] + 2.3)}); pop("#lb-d77", ${t(LS[23] + 2.5)});
      // ===== L24 研究者观点：根因仍是私钥泄露（分歧，不打叉）
      out("#ev23", ${t(LS[24])}, 0.3); pop("#kw24", ${t(LS[24] + 0.4)});
      // ===== L25 大额签名：可信设备上逐字段解码
      out("#kw24", ${t(LS[25])}, 0.3); fadeIn("#hwBw", ${t(LS[25] + 0.3)}, 0.3);
      fadeIn("#magBw", ${t(LS[25] + 0.8)}, 0.3); X5.fly(tl, "magB", ${t(LS[25] + 0.8)}, -60, -10, 0.8, 0);
      KIT.swap(tl, "#hwB-scr", "#hwB-scr2", ${t(LS[25] + 1.6)}, 0.4); pop("#lb-hw", ${t(LS[25] + 1.8)});
`,
});
