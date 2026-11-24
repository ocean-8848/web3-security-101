// ep19/seg6「⑥ 签名之前」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.rolesE（BRIEF）。
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world (= wide)

// 段内专用位置（世界画布 px → 地面点）。E 区角色板右侧的"普通用户工具台"，A 区门牌前的时间线
const P = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const CQ6 = [P(7000, 40, { scale: 0.7 }), P(7180, 40, { scale: 0.7 })];   // cheque ×2（撤销）
const COIN6 = P(7360, 60, { scale: 0.6 });                                 // oddCoin 新币（卖出测试）
const PH6 = P(7020, 300), PH6B = P(7200, 300, { scale: 1.2 });            // phone 日常 / 大额（wrap 1.2）
const OP6 = P(7010, 560), NP6 = P(7330, 560);                              // addrPlate 旧地址 / 新地址
const LT6 = P(7060, 590);                                                  // letter 剩余资产
const TL0 = [140, 205], TL1 = [420, 205];                                  // A 区时间线两端（世界画布 px）
const LTA = P(TL0[0], TL0[1] + 4), LTB = P(TL1[0], TL1[1] + 4);            // 时间线两端的小信封

const kitRects = [L.rect(L.ROLES_E, "roleBoard"), L.rect(L.USER_E, "person"), ...CQ6.map((q) => L.rect(q, "cheque")), L.rect(COIN6, "oddCoin"),
  L.rect(PH6, "phone"), L.rect(PH6B, "phone"), L.rect(OP6, "addrPlate"), L.rect(NP6, "addrPlate")];
const CAMS = {
  ...L.CAMS,
  kitE: L.fit(kitRects, [300, 300, 1620, 860], 1.2),                                                     // E 普通用户工具台 + 角色板（L2–L8）
  bookA: L.fit([...L.PLATES_A.map((q) => L.rect(q, "addrPlate")), L.rect(L.MAG_A, "magnifier"), L.rect(L.PHONE_A, "phone")], [300, 300, 1620, 860], 1.3), // A 钱包地址簿 + 门牌（L12）
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E5, E6, E7, E8, E9, E11, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 包层缩放（常见坑 1）：不支持 opts.scale 的物件
const putK = (key, o, obj, k) => {
  const [gx, gy] = at(o);
  put(key, o, obj, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k]; }
};
const FONT = `font-family="Noto Sans SC, PingFang SC, sans-serif"`;

// ---------------------------------------------------------------- 世界物件
// 石板路（画在最底层）
add(P(0, -6000), `<polygon points="-7000,480 7600,480 7600,640 -7000,640" fill="#dcd7cd" stroke="#cfc9bd" stroke-width="2"/>`);

// ---- B 签名柜台
put("winB", L.WIN_B, O.browserWin(L.WIN_B, { id: "winB", title: "领取空投", button: "签名领取" }));
put("usrB", L.USER_B, O.person(L.USER_B, { id: "usrB", role: "signer", scale: 0.6 }));
put("phB", L.PHONE_B, O.phone(L.PHONE_B, { id: "phB" }));
put("pcB", L.PARCEL_B, E7.parcel(L.PARCEL_B, { id: "pcB" }));
put("docB", L.DOC_B, O.doc(L.DOC_B, { id: "docB", title: "签收单", standing: true, w: 160, h: 200 }));
put("keyB", L.KEY_B, O.key(L.KEY_B, { id: "keyB" }));
L.CHEQUES_B.forEach((q, i) => put("cqB" + i, q, E9.cheque(q, { id: "cqB" + i, scale: 0.8, copies: i === 3 ? 3 : 0, fields: Array(5).fill("filled") })));
put("adB", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "adB", text: "我的地址" }));
{ const h = E15.delegateTagOn(L.ADDR_B, { id: "dgB", state: "attacker", target: "扫币合约" }); put("dgB", h.o, E15.delegateTag(h.o, h.opts)); }
["approve", "permit", "setApprovalForAll", "Permit2", "7702"].forEach((s, i) => put("bdB" + i, L.BOARDS_B[i], E1.signBoard(L.BOARDS_B[i], { id: "bdB" + i, style: "plate", text: s, size: 22 })));
put("shB", L.SHARE_B, E6.shareCert(L.SHARE_B, { id: "shB", n: 4, scale: 1.2 }));
putK("chB", L.CHAIN_B, O.chain(L.CHAIN_B, { id: "chB", n: 3 }), 0.6);
put("gasB", L.GAS_B, E15.gasPump(L.GAS_B, { id: "gasB", scale: 0.6, title: "Gas" }));
putK("sfB", L.SAFE_B, O.safe(L.SAFE_B, { id: "sfB", plate: "金库合约" }), 0.7);
put("kcB", L.KEYCARD_B, E5.keycard(L.KEYCARD_B, { id: "kcB", scale: 0.7, state: "attacker" }));
put("mtB", L.MINT_B, E11.mintPress(L.MINT_B, { id: "mtB", scale: 0.6 }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", state: "attacker", scale: 0.6 }));

// ---- C 钓鱼工坊
L.WINS_C.forEach((q, i) => putK("wC" + i, q, O.browserWin(q, { id: "wC" + i, title: "领取空投", button: "签名领取", state: "attacker" }), 0.5));
putK("rkC", L.RACK_C, O.rack(L.RACK_C, { id: "rkC", tag: "后台" }), 0.7);
putK("lpC", L.LAPTOP_C, O.laptop(L.LAPTOP_C, { id: "lpC" }), 0.7);
put("devC", L.DEV_C, O.person(L.DEV_C, { id: "devC", state: "attacker", scale: 0.55 }));
put("disC", L.DIST_C, O.person(L.DIST_C, { id: "disC", state: "attacker", scale: 0.55 }));
putK("twC", L.TOWER_C, O.tower(L.TOWER_C, { id: "twC" }), 0.7);
putK("phC", L.PHONE_C, O.phone(L.PHONE_C, { id: "phC", state: "attacker" }), 0.7);
put("pzC", L.PIZZA_C, E6.pizza(L.PIZZA_C, { id: "pzC", slices: 5, scale: 0.8 }));
L.BOTS_C.forEach((q, i) => put("btC" + i, q, E8.liqBot(q, { id: "btC" + i, state: "attacker", scale: 0.9, scr: "$".repeat(i + 1) })));
["Inferno", "Pink", "Angel"].forEach((s, i) => put("ktC" + i, L.KITS_C[i], E1.signBoard(L.KITS_C[i], { id: "ktC" + i, style: "wood", text: s, size: 24 })));

// ---- A 转账台
put("dkA", L.DESK_A, E7.dispatchDesk(L.DESK_A, { id: "dkA", scale: 0.9, entries: [{ text: "测试 50 USDT", kind: "ok" }, { text: "0.005 USDT", kind: "ghost" }], shown: 2 }));
put("usrA", L.USER_A, O.person(L.USER_A, { id: "usrA", role: "signer", scale: 0.6 }));
const scrBook = `<rect x="0" y="0" width="76" height="24" fill="#e3f4ea"/><text x="38" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="#1f9d55" ${FONT}>地址簿</text>
  <rect x="5" y="34" width="66" height="30" rx="5" fill="#ffffff" stroke="#1f9d55" stroke-width="1.6"/><text x="10" y="47" font-size="9" fill="#1c1c1c" ${FONT}>收款方</text><text x="10" y="59" font-size="8" fill="#1f9d55" font-family="monospace">0x7a3f…9c1 ✓</text>
  <rect x="5" y="70" width="66" height="24" rx="5" fill="#f4f1ea"/><rect x="10" y="78" width="40" height="6" rx="3" fill="#ddd6c9"/>
  <rect x="5" y="100" width="66" height="24" rx="5" fill="#f4f1ea"/><rect x="10" y="108" width="34" height="6" rx="3" fill="#ddd6c9"/>`;
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA", screen2: scrBook }));
put("atkA", L.ATK_A, O.person(L.ATK_A, { id: "atkA", state: "attacker", scale: 0.6 }));
put("pl0", L.PLATES_A[0], E2.addrPlate(L.PLATES_A[0], { id: "pl0", text: "0x7a3f…9c1" }));
put("pl1", L.PLATES_A[1], E2.addrPlate(L.PLATES_A[1], { id: "pl1", text: "0x7a8d…9c1", state: "attacker" }));
put("ltA0", L.LETTERS_A[0], E1.letter(L.LETTERS_A[0], { id: "ltA0", w: 44, h: 30 }));
put("ltA1", L.LETTERS_A[1], E1.letter(L.LETTERS_A[1], { id: "ltA1", state: "attacker" }));
put("clA", L.CLOCK_A, O.clock(L.CLOCK_A, { id: "clA" }));
putK("gpA", L.GPU_A, E2.gpuRig(L.GPU_A, { id: "gpA" }), 0.7);
put("rcA", L.ROLL_A, E2.rollCounter(L.ROLL_A, { id: "rcA", z: L.ROLL_A.z, value: 4294967295 }));
put("mgA", L.MAG_A, O.magnifier(L.MAG_A, { id: "mgA" }));
L.ODD_A.forEach((q, i) => put("ocA" + i, q, E7.oddCoin(q, { id: "ocA" + i, state: "attacker", scale: 0.6 })));
// A 时间线（L11 关键画面）：只有起点那一小段是绿的，后面灰虚线，终点红问号
add(P(280, 260), S.hid("tl11", `<line x1="${TL0[0]}" y1="${TL0[1]}" x2="${TL1[0]}" y2="${TL1[1]}" stroke="#9b958a" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round"/>
  <line x1="${TL0[0]}" y1="${TL0[1]}" x2="${TL0[0] + 62}" y2="${TL0[1]}" stroke="#1f9d55" stroke-width="9" stroke-linecap="round"/>
  <circle cx="${TL0[0]}" cy="${TL0[1]}" r="9" fill="#1f9d55"/><polygon points="${TL1[0] + 4},${TL1[1] - 10} ${TL1[0] + 22},${TL1[1]} ${TL1[0] + 4},${TL1[1] + 10}" fill="#9b958a"/>`));
put("ltT0", LTA, E1.letter(LTA, { id: "ltT0", w: 40, h: 28 }), 0, { grow: true });
put("ltT1", LTB, E1.letter(LTB, { id: "ltT1", state: "attacker", w: 56, h: 38 }), 0, { grow: true });

// ---- D 代币摊
putK("twD", L.TOWER_D, O.tower(L.TOWER_D, { id: "twD" }), 0.6);
put("stD", L.STALL_D, E8.marketStall(L.STALL_D, { id: "stD", scale: 0.8, price: "↑" }));
put("poD", L.POOL_D, E8.ammPool(L.POOL_D, { id: "poD", scale: 0.8, labelL: "新币", labelR: "USDT" }));
put("tmD", L.TEAM_D, O.person(L.TEAM_D, { id: "tmD", state: "attacker", scale: 0.5 }));
L.ODD_D.forEach((q, i) => put("ocD" + i, q, E7.oddCoin(q, { id: "ocD" + i, scale: 0.6 })));
put("bbD", L.BURN_D, E6.burnBox(L.BURN_D, { id: "bbD", scale: 0.8, plate: "貔貅盘" }));
put("mtD", L.MINT_D, E11.mintPress(L.MINT_D, { id: "mtD", scale: 0.6, state: "attacker" }));
["SQUID", "LIBRA", "979 个"].forEach((s, i) => put("csD" + i, L.CASES_D[i], E1.signBoard(L.CASES_D[i], { id: "csD" + i, style: "plate", text: s, size: 22 })));

// ---- E 防线（seg5 结束时的状态）
const decoded = (id, rows) => `<rect x="0" y="0" width="76" height="24" fill="#e3f4ea"/><text x="38" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#1f9d55" ${FONT}>签名请求</text>` +
  rows.map((r, i) => `<g id="${id}-f${i}"${id === "ph6" ? ` opacity="0"` : ""}><rect x="4" y="${32 + i * 30}" width="68" height="25" rx="4" fill="#eaf6ef" stroke="#1f9d55" stroke-width="1.5"/><text x="9" y="${49 + i * 30}" font-size="10" fill="#1f9d55" ${FONT}>${r}</text></g>`).join("") +
  `<rect x="8" y="124" width="60" height="18" rx="5" fill="#1d93ba"/>`;
const hex = `<rect x="0" y="0" width="76" height="24" fill="#eceae6"/><text x="38" y="16" text-anchor="middle" font-size="10" fill="#7d828a" ${FONT}>签名请求</text>` +
  ["0x095ea7b3", "000000000000", "a1f0…ffffff", "ffffffffffff", "0000…01b2"].map((s, i) => `<text x="6" y="${44 + i * 16}" font-size="9" fill="#7d828a" font-family="monospace">${s}</text>`).join("") +
  `<rect x="8" y="124" width="60" height="18" rx="5" fill="#b7bcc3"/>`;
put("shE", L.SHIELD_E, O.shield(L.SHIELD_E, { id: "shE" }));
putK("phE", L.PHONE_E, O.phone(L.PHONE_E, { id: "phE", screen: decoded("phE", ["给谁 0xA1…", "额度 100", "期限 7 天"]) }), 1.4);
put("cqE", L.CHEQUE_E, E9.cheque(L.CHEQUE_E, { id: "cqE", scale: 1.3, fields: Array(5).fill("filled") }));
put("adE", L.ADDR_E, E2.addrPlate(L.ADDR_E, { id: "adE", text: "我的地址" }));
{ const h = E15.delegateTagOn(L.ADDR_E, { id: "dgE", target: "审计过的实现" }); put("dgE", h.o, E15.delegateTag(h.o, h.opts)); }
put("scE", L.SCALE_E, E7.scale(L.SCALE_E, { id: "scE", scale: 0.9 }));
put("ckE", L.CHECK_E, O.checkpoint(L.CHECK_E, { id: "ckE", n: "域名" }));
put("wlE", L.WL_E, E1.signBoard(L.WL_E, { id: "wlE", style: "plate", text: "白名单", size: 26 }));
put("hgE", L.HOUR_E, O.hourglass(L.HOUR_E, { id: "hgE" }));
put("ocE", L.ODD_E, E7.oddCoin(L.ODD_E, { id: "ocE", state: "attacker", scale: 0.6 }));
L.ADDR2_E.forEach((q, i) => put("a2E" + i, q, E2.addrPlate(q, { id: "a2E" + i, text: i ? "0x7a8d…9c1" : "0x7a3f…9c1", state: i ? "attacker" : "normal" })));
put("mgE", L.MAG_E, O.magnifier(L.MAG_E, { id: "mgE" }));
L.LEDGERS_E.forEach((q, i) => put("lgE" + i, q, O.ledgerBook(q, { id: "lgE" + i, scale: 0.8 })));
put("docE", L.DOC_E, O.doc(L.DOC_E, { id: "docE", title: "官方从不要求", lines: ["签名领取空投", "签名验证钱包"], standing: true, w: 160, h: 200 }));
put("rb", L.ROLES_E, E5.roleBoard(L.ROLES_E, { id: "rb", hooks: 3, title: "今天做一件事", plates: ["普通用户", "钱包产品", "交易所"],
  roles: ["user", "wallet", "cex"], blank: [true, true, true], holders: ["person", "contract", "multisig"], delays: ["看清再签", "能否解码", "首尾比对"] }));
put("usrE", L.USER_E, O.person(L.USER_E, { id: "usrE", role: "signer", scale: 0.55 }));

// ---- E 普通用户工具台（本段新增，L2–L6）
CQ6.forEach((q, i) => put("cq6" + i, q, E9.cheque(q, { id: "cq6" + i, scale: 0.7, fields: Array(5).fill("filled") })));
put("oc6", COIN6, E7.oddCoin(COIN6, { id: "oc6", scale: 0.6 }));
put("ph6", PH6, O.phone(PH6, { id: "ph6", screen: decoded("ph6", ["给谁 0xA1…", "多少 100", "到期 7 天"]), screen2: hex }));
putK("ph6b", PH6B, O.phone(PH6B, { id: "ph6b" }), 1.2);
put("op6", OP6, E2.addrPlate(OP6, { id: "op6", text: "旧地址", state: "attacker" }));
put("np6", NP6, E2.addrPlate(NP6, { id: "np6", text: "新地址" }));
put("lt6", LT6, E1.letter(LT6, { id: "lt6", w: 48, h: 32 }));
// 支票上的红色划线（撤销）
CQ6.forEach((q, i) => { const c = A["cq6" + i].center; add(q, S.hid("x6" + i, `<line x1="${c[0] - 58}" y1="${c[1] + 22}" x2="${c[0] + 58}" y2="${c[1] - 26}" stroke="#e0453a" stroke-width="6" stroke-linecap="round"/>`), 30); });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-r0", up(A.rb.cards[0], 70), "普通用户", "lab-gs");
lb("lb-r1", up(A.rb.cards[1], 70), "钱包产品", "lab-gs");
lb("lb-r2", up(A.rb.cards[2], 70), "交易所", "lab-gs");
lb("lb-air", up(A.docE.top, 10), "签名领取空投 ✗", "lab-rs");
lb("lb-ph6", up(A.ph6.top, 8), "看三样", "lab-gs lab-sm");
lb("lb-hex", up(A.ph6.top, 8), "看不懂 → 不签", "lab-rs lab-sm");
lb("lb-gas", [A.ph6.ground[0] - 10, A.ph6.ground[1] + 40], "不花 Gas ≠ 安全", "lab-r lab-sm", "t");
lb("lb-day", up(A.ph6.top, 8), "日常", "lab-ink lab-sm");
lb("lb-big", up(A.ph6b.top, 8), "大额", "lab-ink lab-sm");
lb("lb-rv0", up(A.cq60.top, 6), "撤销", "lab-rs lab-sm");
lb("lb-rv1", up(A.cq61.top, 6), "撤销", "lab-rs lab-sm");
lb("lb-sell", up(A.oc6.top, 6), "卖出测试 ✓", "lab-gs lab-sm");
lb("lb-op", up(A.op6.top, 6), "撤销授权", "lab-rs lab-sm");
lb("lb-np", up(A.np6.top, 6), "转到新地址", "lab-gs lab-sm");
lb("lb-dec", up(A.rb.tags[1], 0), "可读字段", "lab-cs lab-sm", "t");
lb("lb-cmp", up(A.rb.tags[2], 0), "两个门牌 + 放大镜", "lab-cs lab-sm", "t");
lb("lb-pl0", up(A.pl0.top, 6), "真实收款方", "lab-gs lab-sm");
lb("lb-pl1", up(A.pl1.top, 6), "投毒地址", "lab-rs lab-sm");
lb("lb-t0", [TL0[0] - 20, TL0[1] + 16], "✓ 测试那一刻", "lab-g lab-sm", "t");
lb("lb-t1", [TL1[0] + 10, TL1[1] + 16], "? 之后复制", "lab-r lab-sm", "t");
lb("lb-full", up(A.pl0.top, 6), "核对完整地址", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const Q = { x: 1180, y: 330, w: 620 };
S.curve("cvBook", S.scr("bookA", A.phA.screen), S.scr("bookA", A.pl0.top), { color: "#1f9d55" });
const zoneNames = [["签名柜台", L.WIN_B], ["钓鱼工坊", L.TOWER_C], ["转账台", L.PLATES_A[0]], ["代币摊", L.STALL_D], ["防线", L.CHECK_E]];
const zp = zoneNames.map(([n, o], i) => { const [x, y] = S.scr("wide", up(at(o), 380)); return `<div id="zp${i}" class="zp" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${n}</div>`; }).join("");
const html = [
  kw("kw-q", `测试到账后<br>从记录里 <b>复制地址</b><br>安全吗？`, { x: Q.x, y: Q.y, size: 40 }),
  ck("ck-no", "不安全", { x: Q.x, y: Q.y + 250, w: 300, kind: "r" }),
  kw("kw-once", `测试只证明 <b>那一刻</b>${gtag("解读")}`, { x: Q.x, y: Q.y + 360, size: 34 }),
  kw("kw-book", `地址从 <b>地址簿</b> 取<br>核对 <b>完整地址</b>`, { x: 1150, y: 730, size: 34, accent: "#1f9d55" }),
  zp,
].join("");
const css = `.zp{position:absolute;transform:translate(-50%,-100%);opacity:0;padding:6px 14px;border-radius:10px;background:#fff;border:2px solid #2aa3c9;color:#1d93ba;font:700 26px "Noto Sans SC",sans-serif;white-space:nowrap}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  gas: w("不花", 3), big: w("大额", 4), rev: w("撤销", 5), sell: w("先确认", 5),
  rev6: w("撤销", 6), mv6: w("剩余资产", 6), dec: w("解码", 7), cmp: w("比对", 8),
  no: w("并不安全", 10), once: w("那一刻", 11), full: w("完整地址", 12), book: w("地址簿", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "rolesE", sub: "先看清，再确认",
  grid: { u0: -11100, u1: 11900, v0: -11600, v1: 11900 }, box: [-7500, -4400, 15800, 8700],   // 盖住 exchE / rolesE / kitE / quizA / bookA / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "地址簿", d: "钱包里存好并核对过的常用地址", at: w("地址簿", 12) },
  ],
  end: { title: "用户侧诈骗", line: "每次确认之前，先看清你在签什么", next: "前端、DNS 与供应链安全", at: LS[14], nextAt: w("下一集", 14) },
  js: `
      // 角色板的三块吊牌先收起，按角色逐个亮
      [0, 1, 2].forEach((i) => tl.set("#rb-tag-" + i, { opacity: 0 }, 0));
      // ===== L0 如果你是普通用户，先记住几条。（exchE → rolesE）
      cam(${t(LS[0])}, "rolesE", 1.2);
      pop("#lb-r0", ${t(LS[0] + 1.0)}); fadeIn("#rb-tag-0", ${t(LS[0] + 1.1)}, 0.3); flash("#rb-card-0", ${t(LS[0] + 1.3)}, 2, 0.4);
      // ===== L1 官方从不要求你签名领取空投，或者签名验证钱包。
      bump("#docE", ${t(LS[1] + 0.3)}, 1.06, 1); pop("#lb-air", ${t(LS[1] + 0.6)});
      // ===== L2 签名前看三样，授权给谁，授权多少，到什么时候。（→ kitE）
      out("#lb-air", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "kitE", 1.2);
      pop("#lb-ph6", ${t(LS[2] + 1.2)}); [0, 1, 2].forEach((i) => fadeIn("#ph6-f" + i, ${t(LS[2] + 1.6)} + i * 0.9, 0.3));
      // ===== L3 看不懂就不签，不花 Gas，不等于没有风险。
      out("#lb-ph6, #ph6-scr", ${t(LS[3])}, 0.3); fadeIn("#ph6-scr2", ${t(LS[3] + 0.1)}, 0.3); pop("#lb-hex", ${t(LS[3] + 0.4)}); pop("#lb-gas", ${t(TM.gas)});
      // ===== L4 大额资产和日常交互，用不同的钱包。
      out("#lb-hex, #lb-gas", ${t(LS[4] - 0.2)}); pop("#lb-day", ${t(LS[4] + 0.2)}); pop("#lb-big", ${t(TM.big)}); bump("#ph6b", ${t(TM.big + 0.1)}, 1.05, 1);
      // ===== L5 每个月撤销不用的授权，买新币前，先确认它能卖出去。
      out("#lb-day, #lb-big", ${t(LS[5] - 0.2)});
      [0, 1].forEach((i) => { fadeIn("#x6" + i, ${t(TM.rev + 0.2)} + i * 0.5, 0.25); pop("#lb-rv" + i, ${t(TM.rev + 0.3)} + i * 0.5); });
      pop("#lb-sell", ${t(TM.sell + 0.2)}); bump("#oc6", ${t(TM.sell + 0.3)}, 1.08, 1);
      // ===== L6 已经签下钓鱼签名，就立刻撤销授权，把剩余资产转到新地址。
      out("#lb-rv0, #lb-rv1, #lb-sell", ${t(LS[6] - 0.2)}); pop("#lb-op", ${t(TM.rev6)});
      X1.walk(tl, "lt6", ${t(TM.mv6)}, 1.6, [[${A.np6.ground[0] - 44}, ${A.np6.ground[1] + 26}]]); pop("#lb-np", ${t(TM.mv6 + 1.4)});
      // ===== L7 钱包产品：签名请求能不能解码成可读字段。
      out("#lb-op, #lb-np, #lb-r0", ${t(LS[7] - 0.2)});
      pop("#lb-r1", ${t(LS[7] + 0.4)}); fadeIn("#rb-tag-1", ${t(LS[7] + 0.5)}, 0.3); flash("#rb-card-1", ${t(LS[7] + 0.7)}, 2, 0.4); pop("#lb-dec", ${t(TM.dec)});
      // ===== L8 交易所：比对首尾相同的历史地址。
      out("#lb-r1, #lb-dec", ${t(LS[8] - 0.2)}); pop("#lb-r2", ${t(LS[8] + 0.4)}); fadeIn("#rb-tag-2", ${t(LS[8] + 0.5)}, 0.3); flash("#rb-card-2", ${t(LS[8] + 0.7)}, 2, 0.4); bump("#lb-r2", ${t(LS[8] + 3.0)}, 1.08, 1); pop("#lb-cmp", ${t(TM.cmp)}); bump("#lb-cmp", ${t(TM.cmp + 1.6)}, 1.08, 1); flash("#rb-tag-2", ${t(TM.cmp + 2.8)}, 2, 0.4);
      // ===== L9 回到开头的问题。（kitE → quizA）
      out("#lb-r2, #lb-cmp", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "quizA", 1.6);
      pop("#lb-pl0", ${t(LS[9] + 1.4)}); pop("#lb-pl1", ${t(LS[9] + 1.5)}); pop("#kw-q", ${t(LS[9] + 1.0)});
      // ===== L10 并不安全。
      pop("#ck-no", ${t(TM.no)});
      // ===== L11 测试只证明那一刻（关键画面：时间线 + 绿勾 + 红问号）
      fadeIn("#tl11", ${t(LS[11] + 0.2)}, 0.4); grow("ltT0", ${t(LS[11] + 0.3)}); pop("#lb-t0", ${t(TM.once)});
      grow("ltT1", ${t(TM.once + 1.4)}); pop("#lb-t1", ${t(TM.once + 1.8)}); pop("#kw-once", ${t(TM.once + 0.4)});
      // ===== L12 地址簿 + 核对完整地址（quizA → bookA）
      out("#kw-q, #ck-no, #kw-once, #lb-t0, #lb-t1, #lb-pl1", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "bookA", 1.0);
      fadeIn("#phA-scr2", ${t(TM.book)}, 0.3); out("#phA-scr", ${t(TM.book)}, 0.3); draw("cvBook", ${t(TM.book + 0.6)}, 0.8);
      pop("#kw-book", ${t(TM.book + 0.4)});
      X5.fly(tl, "mgA", ${t(TM.full - 0.4)}, -440, -215, 0.7); X5.fly(tl, "mgA", ${t(TM.full + 0.4)}, -320, -215, 1.4); out("#lb-pl0", ${t(TM.full + 0.3)}, 0.2); pop("#lb-full", ${t(TM.full + 0.6)});
      // ===== L13 私钥完好无损，资产也可能没了……（bookA → wide，五个区依次轻亮）
      out("#kw-book, #cvBook, #lb-full, #tl11, #ltT0, #ltT1", ${t(LS[13] - 0.2)}); X5.fly(tl, "mgA", ${t(LS[13])}, 0, 0, 1.0);
      cam(${t(LS[13])}, "wide", 2.0);
      [0, 1, 2, 3, 4].forEach((i) => { pop("#zp" + i, ${t(LS[13] + 2.0)} + i * 0.5); bump("#zp" + i, ${t(LS[13] + 2.3)} + i * 0.5, 1.08, 1); });
      // ===== L14 下一集讲前端、DNS 与供应链安全。（结束卡；镜头静止在 wide）
      out(".zp", ${t(LS[14] - 0.3)}, 0.3);
`,
});
