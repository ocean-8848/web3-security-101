// ep28/seg5「⑤ 钥匙与人」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.signD（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A–F 整座档案馆（seg2 L0–L2；seg6 L10–L12、L14–L15 结束卡）
//   A            分区全景：A 门厅
//   B            分区全景：B 阅览厅
//   C            分区全景：C 代码展厅
//   D            分区全景：D 改动展厅
//   E            分区全景：E 钥匙与人展厅
//   F            分区全景：F 复盘台
//   daoA         A DAO 展柜 + 账本 + 回调臂 + 币 + 60 点阵（seg1 起点 L0–L3）
//   curveA       A Curve 展柜：破锁 + 编译器手册 + 70 点阵（seg1 L4–L6）
//   penpieA      A Penpie 展柜：按钮面板 + 空锁框 + 27 点阵（seg1 L7–L8）
//   hallA        A 三只展柜 + 串联红线标签 + 入口牌（seg1 L9–L12 终点；seg2 起点）
//   aviationB    B 比喻角：塔台、黑匣子、公开报告、公章、项目复盘、安全公司分析、链 + 阅读位（seg2 L3–L11）
//   wallsB       B 档案柜 + 六面展墙 + 空白牌 + 阅读位（seg2 L12–L16）
//   patternsB    B 模式墙 + 档案柜（seg2 L17–L18 终点；seg3 起点）
//   reentryC     C ① 柜：Fei Rari + 回调臂 + 按钮面板 + 两把共享锁 + 牌（seg3 L0–L5；代码卡 A 在右侧）
//   zeroC        C ② 柜：Nomad 桥 + 可信根 + 零地址荒地 + 回执签 + 证明卡 + 牌（seg3 L6–L12）
//   priceC       C ③ 柜：池子 + 单一价格机 + 份额机 + 份额 + 防御预言机 + 内部账本 + 牌（seg3 L13–L18 终点；seg4 起点）
//   checkD       D ④ 柜：Euler + 按钮面板 + 关卡 + 天平 + 阅卷机 + 牌（seg4 L0–L5）
//   forkD        D ⑤ 柜：两台合约机器 + 差异卡 + 天平 + 放大镜 + 公章 + 牌（seg4 L6–L10）
//   signD        D ⑥ 柜：多签界面 + 签名人 + 支票 + 权限卡 + 硬件钱包 + 盾牌 + 牌（seg4 L11–L17 终点；seg5 起点）
//   keysE        E ⑦ 柜：九把钥匙 + 门槛表 + 机柜 + 云桶 + 保险柜 + 时间锁空框 + 闸刀 + 牌（seg5 L0–L6）
//   methE        E mETH 角：售货机 + 8 小时沙漏 + 暂停闸刀 + 三枚 cmETH（seg5 L7–L8）
//   peopleE      E ⑧ 柜：两张桌 + 隔板 + 员工 + 测试题 + PDF + 笔记本 + 客服 + 用户数据 + 两人确认 + 收回钥匙 + 牌（seg5 L9–L15）
//   nftE         E NFT 与 GameFi 墙：牌 + 手机 + 前端 + 铸币机 + 内部人（seg5 L16 终点；seg6 起点）
//   deskF        F 复盘台：复盘文件 + 链 + 调用树 + 放大镜 + 扳道器 + 木牌 + 徽章行 + 牌（seg6 L0–L9）
//   vitrineF     F 空展柜 + 八枚徽章（seg6 L13）
// ends static on CAMS.nftE
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
const CE = 0.866;
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${svg}</g>`; };
const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
/** 不支持 scale 的物件：绕地面点包一层，anchors 换算；mid = 外层可移动 / 隐藏的 <g id>（无 transform） */
function wput(key, o, r, { k = o.scale, dy = 0, mid, hide = false, grow = false } = {}) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const inner = wrapK(o, k)(r.svg);
  const svg = mid ? `<g id="${mid}"${hide ? ' opacity="0"' : ""}>${inner}</g>` : inner;
  put(key, o, { svg, anchors: r.anchors }, dy, { grow });
  for (const n of Object.keys(A[key])) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = sc(A[key][n]);
}
/** 外层 <g id> 包一层（可 fly / 隐藏） */
const mv = (mid, svg, hide = false) => `<g id="${mid}"${hide ? ' opacity="0"' : ""}>${svg}</g>`;
/** 地面区牌（原生 SVG）：贴地的白牌 + 文字 */
function zoneTag(o, text) {
  const [X, Y] = at(o), m = `matrix(0.819,-0.287,0.574,0.410,${f(X)},${f(Y)})`;
  return `<g transform="${m}"><rect x="-130" y="-30" width="260" height="60" rx="8" fill="#ffffff" stroke="#2aa3c9" stroke-width="3"/>
    <text x="0" y="12" font-size="32" font-weight="700" text-anchor="middle" fill="#1d93ba" font-family="Noto Sans SC, sans-serif">${text}</text></g>`;
}
/** 模式徽章（原生 SVG）：青蓝圆章，中心写编号 */
/** 模式徽章（原生 SVG，与 seg4 同款：r 30 青蓝圆章，放在牌子右上）；vis=true 开场即可见 */
const badge = (id, p, n, vis = false) => `<g id="${id}"${vis ? "" : ' opacity="0"'}><g transform="translate(${f(p[0])},${f(p[1])})"><circle r="30" fill="#1d93ba" stroke="#fff" stroke-width="4"/><text y="11" text-anchor="middle" font-size="32" font-weight="900" fill="#fff" font-family="sans-serif">${n}</text></g></g>`;
const RED_SCR = (W, H) => `<rect x="0" y="0" width="${W}" height="${H}" fill="#e0453a"/><text x="${W / 2}" y="${H / 2 + 22}" font-size="${Math.round(H * 0.6)}" font-weight="800" text-anchor="middle" fill="#ffffff">!</text>`;

// ---------------------------------------------------------------- 世界物件
// 参观路线 + 区牌（最底层）
{
  const P0 = Wp(12000, 0, 0), P1 = Wp(21000, 0, 0);
  add({ u: -99999, v: -99999 }, `<line x1="${f(P0[0])}" y1="${f(P0[1])}" x2="${f(P1[0])}" y2="${f(P1[1])}" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="22 16" opacity="0.55"/>`);
  add({ u: -99998, v: -99999 }, zoneTag(L.D_TAG, "D · 改动展厅") + zoneTag(L.E_TAG, "E · 钥匙与人展厅"));
}
// D ⑥ 柜（上一段结尾画面）
{
  const ui = L.D6_UI, inner = lift(wrapK(ui, 0.45)(O.browserWin({ u: ui.u, v: ui.v }, { id: "d6ui", title: "多签界面" }).svg), 40);
  put("d6vit", L.D6_VIT, E2.vitrine(L.D6_VIT, { id: "d6vit", w: 420, d: 300, h: 280, plate: "Bybit · 2025", inner }));
  L.D6_SIGNERS.forEach((q, i) => put("d6s" + i, q, O.person(q, { id: "d6s" + i, role: "signer", scale: 0.5 })));
  put("d6chq", L.D6_CHEQUE, E9.cheque(L.D6_CHEQUE, { id: "d6chq", scale: 0.8 }));
  put("d6kc", L.D6_KEYCARD, E5.keycard(L.D6_KEYCARD, { id: "d6kc", scale: 0.7 }));
  wput("d6hw", L.D6_HW, O.hwWallet(L.D6_HW, { id: "d6hw", screenText: "解码后内容" }));
  wput("d6sh", L.D6_SHIELD, O.shield(L.D6_SHIELD, { id: "d6sh" }));
  put("d6sign", L.D6_SIGN, E1.signBoard(L.D6_SIGN, { id: "d6sign", style: "plate", text: "⑥ 盲签", size: 28 }));
  // seg4 结尾画面里已在的 ④⑤ 牌子和 ④⑤⑥ 徽章（位置同 seg4）
  put("d4sign", L.D4_SIGN, E1.signBoard(L.D4_SIGN, { id: "d4sign", style: "plate", text: "④ 新函数绕过检查", size: 28 }));
  put("d5sign", L.D5_SIGN, E1.signBoard(L.D5_SIGN, { id: "d5sign", style: "plate", text: "⑤ 改动未重审", size: 28 }));
  add({ u: 0, v: 0 }, badge("bd4", [A.d4sign.top[0] + 150, A.d4sign.top[1] + 30], "④", true) + badge("bd5", [A.d5sign.top[0] + 140, A.d5sign.top[1] + 30], "⑤", true)
    + badge("bd6", [A.d6sign.top[0] + 110, A.d6sign.top[1] + 30], "⑥", true), 1e6);
}
// E ⑦ 密钥集中
{
  const keys = L.E7_KEYS.map((q, i) => {
    const g = { u: q.u, v: q.v }, W = wrapK(g, 0.4), [px, py] = at(g);
    const ped = `<g id="kp${i}" opacity="0"><ellipse cx="${f(px)}" cy="${f(py + 4)}" rx="34" ry="14" fill="#cfe9f2" stroke="#2aa3c9" stroke-width="2"/></g>`;
    return `<g id="kg${i}">${ped}${W(O.key(g, { id: "k" + i }).svg)}<g id="kr${i}" opacity="0">${W(O.key(g, { id: "kx" + i, state: "attacker" }).svg)}</g></g>`;
  }).join("");
  put("e7vit", L.E7_VIT, E2.vitrine(L.E7_VIT, { id: "e7vit", w: 420, d: 300, h: 280, plate: "Ronin · 2022", inner: lift(keys, 40) }));
}
wput("meter", L.E7_METER, E5.thresholdMeter(L.E7_METER, { id: "meter", max: 9, th: 5, thText: "5 / 9", level: 0 }));
wput("rack", L.E7_RACK, O.rack(L.E7_RACK, { id: "rack", tag: "MPC" }), { mid: "rackM" });
wput("bkt", L.E7_BUCKET, O.bucket(L.E7_BUCKET, { id: "bkt" }));
wput("msafe", L.E7_SAFE, O.safe(L.E7_SAFE, { id: "msafe" }));
{
  const [X, Y] = at(L.E7_NOLOCK);
  add(L.E7_NOLOCK, `<g id="nolock" opacity="0"><rect x="${f(X - 55)}" y="${f(Y - 130)}" width="110" height="130" rx="10" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>
    <path d="M${f(X - 24)} ${f(Y - 89)}L${f(X + 24)} ${f(Y - 41)}M${f(X + 24)} ${f(Y - 89)}L${f(X - 24)} ${f(Y - 41)}" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/></g>`);
}
wput("tlock", L.E7_TLOCK, E1.timeLock(L.E7_TLOCK, { id: "tlock", frac: 0.8, glow: true }), { mid: "tlockM", hide: true, dy: 1 });
wput("ksw", L.E7_SWITCH, O.knifeSwitch(L.E7_SWITCH, { id: "ksw", text: "暂停" }));
put("e7sign", L.E7_SIGN, E1.signBoard(L.E7_SIGN, { id: "e7sign", style: "plate", text: "⑦ 密钥集中", size: 28 }));
// mETH 角
put("mvend", L.EM_VEND, E1.vending(L.EM_VEND, { id: "mvend", scale: 0.5, sign: "mETH" }));
wput("hg", L.EM_HOUR, O.hourglass(L.EM_HOUR, { id: "hg" }));
const COIN_OFF = [190, 80];
L.EM_COINS.forEach((q, i) => put("cm" + i, q, { svg: mv("cmM" + i, E7.oddCoin(q, { id: "cm" + i, scale: 0.45 }).svg, true), anchors: E7.oddCoin(q, { id: "cmA" + i, scale: 0.45 }).anchors }));
{
  // 绿色回流箭头：从右下方回到售货机
  const [x0, y0] = at(L.EM_COINS[2]), [x1, y1] = at(L.EM_COINS[0]);
  const [vx, vy] = at(L.EM_VEND), sx = x0 + COIN_OFF[0] + 40, sy = y0 + COIN_OFF[1] + 10, ex = vx + 40, ey = vy + 30;
  add(L.EM_COINS[2], `<g id="backArr" opacity="0"><path d="M${f(sx)} ${f(sy)}Q${f(sx + 30)} ${f(ey + 10)} ${f(ex)} ${f(ey)}" fill="none" stroke="#1f9d55" stroke-width="7" stroke-dasharray="18 12" stroke-linecap="round"/>
    <path d="M${f(ex - 22)} ${f(ey + 2)}L${f(ex + 6)} ${f(ey - 14)}L${f(ex + 8)} ${f(ey + 16)}Z" fill="#1f9d55"/></g>`, 2);
}
// ⑧ 人是入口
L.E8_DESKS.forEach((q, i) => wput("desk" + i, q, O.desk(q, { id: "desk" + i, screen2: RED_SCR(148, 88) })));
{
  const o = L.E8_WALL, a = Wp(o.u, o.v - 70, 0), b = Wp(o.u, o.v + 70, 0), Hh = 190 * CE;
  add(o, `<g id="wall" opacity="0"><polygon points="${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])} ${f(b[0])},${f(b[1] - Hh)} ${f(a[0])},${f(a[1] - Hh)}" fill="rgba(42,163,201,0.35)" stroke="#1d93ba" stroke-width="4"/></g>`, 5);
}
L.E8_STAFF.forEach((q, i) => put("st" + i, q, O.person(q, { id: "st" + i, role: "engineer", scale: 0.45 })));
const QUIZ_TO = L.E8_DESKS[0];
put("quiz", L.E8_QUIZ, { svg: mv("quizM", O.doc(L.E8_QUIZ, { id: "quiz", title: "招聘测试题", w: 140, h: 110 }).svg), anchors: {} }, 40);
put("pdf", L.E8_PDF, O.doc(L.E8_PDF, { id: "pdf", title: "PDF", w: 140, h: 110 }));
wput("lap", L.E8_LAPTOP, O.laptop(L.E8_LAPTOP, { id: "lap", screen2: RED_SCR(400, 260) }));
put("agent", L.E8_AGENT, O.person(L.E8_AGENT, { id: "agent", role: "engineer", scale: 0.45 }));
put("udata", L.E8_DATA, { svg: mv("udataM", O.ledgerBook(L.E8_DATA, { id: "udata", scale: 0.5 }).svg), anchors: O.ledgerBook(L.E8_DATA, { id: "udA", scale: 0.5 }).anchors });
put("udcopy", L.E8_DATA, { svg: mv("udcM", O.ledgerBook(L.E8_DATA, { id: "udc", scale: 0.5 }).svg, true), anchors: {} }, 1);
L.E8_PAIR.forEach((q, i) => put("pr" + i, q, O.person(q, { id: "pr" + i, role: "signer", scale: 0.45 }), 0, { grow: true }));
const KEY_FROM = L.E8_STAFF[2];
wput("rkey", L.E8_KEY, O.key(L.E8_KEY, { id: "rkey" }), { mid: "rkeyM", hide: true });
put("e8sign", L.E8_SIGN, E1.signBoard(L.E8_SIGN, { id: "e8sign", style: "plate", text: "⑧ 人是入口", size: 28 }));
// NFT 与 GameFi 墙
put("ensign", L.EN_SIGN, E1.signBoard(L.EN_SIGN, { id: "ensign", style: "plate", text: "NFT 与 GameFi", size: 28 }));
wput("nphone", L.EN_PHONE, O.phone(L.EN_PHONE, { id: "nphone" }));
wput("nui", L.EN_UI, O.browserWin(L.EN_UI, { id: "nui", title: "前端" }));
put("mint", L.EN_MINT, E11.mintPress(L.EN_MINT, { id: "mint", scale: 0.5 }));
put("insider", L.EN_INSIDER, O.person(L.EN_INSIDER, { id: "insider", role: "signer", scale: 0.4 }));
// 徽章 ⑦ ⑧（牌子上方）
add({ u: 0, v: 0 }, badge("bd7", [A.e7sign.top[0] + 120, A.e7sign.top[1] + 30], "⑦"), 1e6);
add({ u: 0, v: 0 }, badge("bd8", [A.e8sign.top[0] + 120, A.e8sign.top[1] + 30], "⑧"), 1e6);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-ronin", up(A.meter.top, 10), "Ronin · 9 个中 5 个", "lab-rs lab-sm");
lb("lb-6", up(A.e7vit.top, 70), "约 6.2 亿美元", "lab-r");
lb("lb-mpc", up(A.rack.top, 10), "MPC 节点", "lab-cs lab-sm");
lb("lb-bkt", [A.bkt.ground[0], A.bkt.ground[1] + 12], "CEO 个人云账户", "lab-rs lab-sm", "t");
lb("lb-126", [A.bkt.ground[0], A.bkt.ground[1] + 125], "约 1.26 亿美元", "lab-r", "t");
lb("lb-safe", up(A.msafe.top, 10), "多签 · 5 人中 2 人", "lab-rs lab-sm");
lb("lb-nolock", [at(L.E7_NOLOCK)[0], at(L.E7_NOLOCK)[1] + 14], "时间锁", "lab-rs lab-sm", "t");
lb("lb-285", up(A.msafe.top, 110), "约 2.85 亿美元", "lab-r");
lb("lb-indep", up(A.e7vit.top, 10), "提高门槛 · 彼此独立", "lab-gs lab-sm");
lb("lb-tlock", [at(L.E7_NOLOCK)[0], at(L.E7_NOLOCK)[1] + 14], "时间锁", "lab-gs lab-sm", "t");
lb("lb-rate", up(A.ksw.top, 10), "速率限制", "lab-gs lab-sm");
lb("lb-hg", up(A.hg.top, 8), "8 小时提款延迟", "lab-cs lab-sm");
lb("lb-pause", up(A.ksw.top, 10), "暂停权限", "lab-cs lab-sm");
lb("lb-back", up(A.mvend.top, 14), "追回 15000 cmETH · 约 4300 万美元", "lab-g");
lb("lb-quiz", up(A.desk0.top, 10), "供应商员工终端", "lab-rs lab-sm");
lb("lb-305", up(A.e8sign.top, 70), "约 3.05 亿美元", "lab-r");
lb("lb-dev3", up(A.lap.top, 10), "3 名开发者的设备", "lab-rs lab-sm");
lb("lb-agent", up(A.agent.top, 8), "外包客服", "lab-cs lab-sm");
lb("lb-udata", [A.udata.ground[0], A.udata.ground[1] + 10], "用户数据", "lab-rs lab-sm", "t");
lb("lb-wall", up(Wp(L.E8_WALL.u, L.E8_WALL.v, 200), 6), "签名 / 开发分开", "lab-gs lab-sm");
lb("lb-pair", up(A.pr1.top, 8), "两人确认", "lab-gs lab-sm");
lb("lb-rkey", [A.rkey.ground[0] + 20, A.rkey.ground[1] + 14], "离职收回", "lab-gs lab-sm", "t");
lb("lb-min", [A.udata.ground[0], A.udata.ground[1] + 10], "只留必要", "lab-gs lab-sm", "t");
lb("lb-nphone", up(A.nphone.top, 8), "社交账号", "lab-rs lab-sm");
lb("lb-nui", up(A.nui.top, 8), "前端", "lab-rs lab-sm");
lb("lb-mint", up(A.mint.top, 8), "铸币权限", "lab-rs lab-sm");
lb("lb-ins", up(A.insider.top, 8), "内部人", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const ET = ZONE.event.top;
const SRC = gtag("公开报道");
const html = [
  evt("ev-ronin", `<b>Ronin</b> · 2022 年 3 月 ${SRC}`, { color: "#e0453a", top: ET }),
  evt("ev-multi", `<b>Multichain</b> · 2023 年 7 月 ${SRC}`, { color: "#e0453a", top: ET + 3 }),
  evt("ev-drift", `<b>Drift</b> · 2026 年 4 月 · Solana ${SRC}${gtag("仍在调查")}`, { color: "#e0453a", top: ET + 6 }),
  evt("ev-meth", `<b>mETH</b> · 2025 年 2 月 · Mantle ${SRC}`, { color: "#1f9d55", top: ET + 9 }),
  evt("ev-dmm", `<b>DMM Bitcoin</b> · 2024 年 5 月 ${SRC}`, { color: "#e0453a", top: ET + 12 }),
  evt("ev-rad", `<b>Radiant Capital</b> · 2024 年 10 月 ${SRC}`, { color: "#e0453a", top: ET + 15 }),
  evt("ev-cb", `<b>Coinbase 客服</b> · 2025 年 5 月 ${SRC}`, { color: "#e0453a", top: ET + 18 }),
  kw("kw-sig7", `识别信号 · <b>签名人少</b> · <b>没有时间锁</b>`, { x: 60, y: 790, size: 38, accent: "#e0453a" }),
  ck("ck0", "招聘测试题", { x: 60, y: 440, w: 330, kind: "r" }),
  ck("ck1", "外部文件", { x: 60, y: 530, w: 330, kind: "r" }),
  ck("ck2", "会议软件", { x: 60, y: 620, w: 330, kind: "r" }),
  ck("ck3", "被收买的员工", { x: 60, y: 710, w: 330, kind: "r" }),
  kw("kw-sig8", `<b>识别信号</b>`, { x: 60, y: 350, size: 38, accent: "#e0453a" }),
].join("");
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  five: w("5 个", 1), mpc: w("MPC", 2), cloud: w("个人云账户", 2), two: w("两人", 4), nolock: w("没有时间锁", 4), m285: w("2.85", 4),
  indep: w("彼此独立", 6), tl6: w("时间锁", 6), rate: w("速率限制", 6),
  hour: w("8 小时", 8), pause: w("暂停", 8), back: w("追回", 8),
  quiz: w("招聘测试题", 10), term: w("终端", 10), pdf: w("PDF", 12), dev: w("设备", 12),
  agent: w("外包客服", 13), export: w("导出", 13),
  k0: w("招聘测试题", 14), k1: w("外部文件", 14), k2: w("会议软件", 14), k3: w("被收买", 14),
  sep: w("分开", 15), pair: w("两人确认", 15), quit: w("离职", 15), min: w("必要", 15),
  social: w("社交账号", 16), front: w("前端", 16), mintW: w("铸币权限", 16), ins: w("内部人", 16),
};
const t = (x) => f(x);
const [qx, qy] = at(L.E8_QUIZ), [dx0, dy0] = at(QUIZ_TO);
const QUIZ_D = [f(dx0 - qx + 40), f(dy0 - qy - 40)];
const [kx, ky] = at(L.E8_KEY), [fx, fy] = at(KEY_FROM);
const KEY_D = [f(fx - kx), f(fy - ky - 60)];
const [ux, uy] = at(L.E8_DATA);
const KEYS_SPREAD = L.E7_KEYS.map((q) => { const p = at(q), c = at(L.E7_VIT); return [f((p[0] - c[0]) * 0.55), f((p[1] - c[1]) * 0.55)]; });

S.build({
  cam0: "signD", sub: "钥匙太少，人是入口",
  grid: { u0: 11700, u1: 21400, v0: -4100, v1: 5300 }, box: [10300, -6100, 7200, 3200],   // 盖住本段镜头 signD · keysE · methE · peopleE · nftE（signD = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "验证者", d: "为跨链消息签名放行的节点", at: w("验证者", 1) },
    { id: "t1", t: "MPC", d: "多方各持一片密钥共同签名", at: w("MPC", 2) },
    { id: "t2", t: "时间锁", d: "操作提交后要等一段时间才生效", at: w("时间锁", 4) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // 开场：mETH 回流币先停在右下方（隐藏）
      ${[0, 1, 2].map((i) => `X5.fly(tl, "cmM${i}", 0, ${COIN_OFF[0]}, ${COIN_OFF[1]}, 0.01);`).join(" ")}
      X5.fly(tl, "rkeyM", 0, ${KEY_D[0]}, ${KEY_D[1]}, 0.01);
      // ===== L0 第七种，少数几把钥匙，控制了全部资产。
      cam(${t(LS[0])}, "keysE", 1.8); bump("#e7sign", ${t(LS[0] + 1.9)}, 1.06); pop("#bd7", ${t(LS[0] + 2.1)}, 0.35);
      // ===== L1 Ronin：九把钥匙里五把变红，门槛表升到 5
      pop("#ev-ronin", ${t(LS[1])}); pop("#lb-ronin", ${t(LS[1] + 0.4)});
      ${[0, 1, 2, 3, 4].map((i) => `fadeIn("#kr${[0, 2, 4, 6, 8][i]}", ${t(TM.five - 0.6)} + ${i} * 0.22, 0.2);`).join(" ")}
      X5.fill(tl, "meter", ${t(TM.five - 0.6)}, 5, 1.2);
      pop("#lb-6", ${t(LS[1] + 4.6)});
      // ===== L2 Multichain：MPC 机柜整台落进个人云账户的桶
      out("#ev-ronin", ${t(LS[2] - 0.2)}); pop("#ev-multi", ${t(LS[2])});
      pop("#lb-mpc", ${t(TM.mpc)}); out("#lb-mpc", ${t(TM.cloud - 0.3)}, 0.2);
      X5.fly(tl, "rackM", ${t(TM.cloud - 0.2)}, 0, 230, 1.0, 70); pop("#lb-bkt", ${t(TM.cloud + 0.6)});
      // ===== L3 损失约 1.26 亿美元
      pop("#lb-126", ${t(LS[3] + 0.6)}); bump("#bkt", ${t(LS[3] + 2.2)}, 1.06); flash("#lb-126", ${t(LS[3] + 2.4)}, 2, 0.4);
      // ===== L4 Drift：五人中两人 · 时间锁空框
      out("#ev-multi", ${t(LS[4] - 0.2)}); pop("#ev-drift", ${t(LS[4])});
      pop("#lb-safe", ${t(TM.two - 0.3)}); bump("#msafe", ${t(TM.two)}, 1.05);
      fadeIn("#nolock", ${t(TM.nolock - 0.2)}, 0.3); pop("#lb-nolock", ${t(TM.nolock)});
      pop("#lb-285", ${t(TM.m285)});
      // ===== L5 识别信号
      out("#ev-drift, #lb-6, #lb-126, #lb-285", ${t(LS[5] - 0.2)}); pop("#kw-sig7", ${t(LS[5] + 0.2)});
      // ===== L6 防御：钥匙分散到各自底座、时间锁填进空框、速率限制
      out("#kw-sig7, #lb-ronin, #lb-safe", ${t(LS[6] + 0.1)});
      ${[0, 2, 4, 6, 8].map((i) => `out("#kr${i}", ${t(TM.indep - 0.4)}, 0.3);`).join(" ")}
      ${KEYS_SPREAD.map((d, i) => `X5.fly(tl, "kg${i}", ${t(TM.indep - 0.2)}, ${d[0]}, ${d[1]}, 0.9); fadeIn("#kp${i}", ${t(TM.indep + 0.3)}, 0.3);`).join(" ")}
      pop("#lb-indep", ${t(TM.indep + 0.5)});
      out("#nolock, #lb-nolock", ${t(TM.tl6 - 0.2)}, 0.25); fadeIn("#tlockM", ${t(TM.tl6)}, 0.35); grow("tlock", ${t(TM.tl6)}); pop("#lb-tlock", ${t(TM.tl6 + 0.4)});
      pop("#lb-rate", ${t(TM.rate)}); bump("#ksw", ${t(TM.rate + 0.1)}, 1.05);
      // ===== L7 延迟有多大用：镜头到 mETH 角
      out("#lb-indep, #lb-tlock, #lb-rate, #lb-bkt", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "methE", 1.6);
      // ===== L8 关键画面：沙漏流沙、闸刀拉下暂停、三枚 cmETH 沿绿箭头回流
      pop("#ev-meth", ${t(LS[8])});
      pop("#lb-hg", ${t(TM.hour)}); KIT.sand(tl, "hg", ${t(TM.hour)}, ${t(LS[9] - 0.4 - TM.hour)});
      pop("#lb-pause", ${t(TM.pause)}); KIT.toggle(tl, "ksw", ${t(TM.pause)}, false);
      fadeIn("#backArr", ${t(TM.back - 0.3)}, 0.3);
      ${[0, 1, 2].map((i) => `fadeIn("#cmM${i}", ${t(TM.back)} + ${i} * 0.25, 0.2); X5.fly(tl, "cmM${i}", ${t(TM.back)} + ${i} * 0.25, 0, 0, 1.1, 40);`).join(" ")}
      pop("#lb-back", ${t(TM.back + 1.6)});
      // ===== L9 第八种：镜头到 ⑧ 柜
      out("#ev-meth, #lb-hg, #lb-pause, #lb-back", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "peopleE", 1.6); bump("#e8sign", ${t(LS[9] + 1.7)}, 1.06); pop("#bd8", ${t(LS[9] + 1.9)}, 0.35);
      // ===== L10 DMM：招聘测试题滑到员工桌上，屏幕变红
      pop("#ev-dmm", ${t(LS[10])});
      X5.fly(tl, "quizM", ${t(TM.quiz)}, ${QUIZ_D[0]}, ${QUIZ_D[1]}, 1.1, 60);
      fadeIn("#desk0-scr2", ${t(TM.term - 0.3)}, 0.3); pop("#lb-quiz", ${t(TM.term)});
      // ===== L11 损失约 3.05 亿美元
      pop("#lb-305", ${t(LS[11] + 0.6)});
      // ===== L12 Radiant：伪装成 PDF 的后门，三台设备依次变红
      out("#ev-dmm, #lb-305", ${t(LS[12] - 0.2)}); pop("#ev-rad", ${t(LS[12])});
      bump("#pdf", ${t(TM.pdf)}, 1.12);
      fadeIn("#lap-scr2", ${t(TM.dev - 1.0)}, 0.25); fadeIn("#desk1-scr2", ${t(TM.dev - 0.6)}, 0.25); bump("#desk0", ${t(TM.dev - 0.2)}, 1.05);
      pop("#lb-dev3", ${t(TM.dev)});
      // ===== L13 Coinbase：外包客服把用户数据递出画面
      out("#ev-rad, #lb-quiz", ${t(LS[13] - 0.2)}); pop("#ev-cb", ${t(LS[13])});
      pop("#lb-agent", ${t(TM.agent)}); pop("#lb-udata", ${t(TM.agent + 0.3)});
      fadeIn("#udcM", ${t(TM.export - 0.2)}, 0.15); X5.fly(tl, "udcM", ${t(TM.export)}, 520, -120, 1.4, 40); out("#udcM", ${t(TM.export + 1.1)}, 0.3);
      // ===== L14 识别信号：四个关键词
      out("#ev-cb, #lb-dev3, #lb-agent, #lb-udata", ${t(LS[14] - 0.2)});
      pop("#kw-sig8", ${t(LS[14])});
      pop("#ck0", ${t(TM.k0)}); pop("#ck1", ${t(TM.k1)}); pop("#ck2", ${t(TM.k2)}); pop("#ck3", ${t(TM.k3)});
      // ===== L15 防御：隔板、两人确认、钥匙收回、数据只留必要
      out("#kw-sig8, #ck0, #ck1, #ck2, #ck3", ${t(LS[15] + 0.1)});
      out("#desk0-scr2, #desk1-scr2, #lap-scr2", ${t(TM.sep - 0.4)}, 0.4);
      fadeIn("#wall", ${t(TM.sep - 0.2)}, 0.4); pop("#lb-wall", ${t(TM.sep + 0.2)});
      grow("pr0", ${t(TM.pair - 0.2)}); grow("pr1", ${t(TM.pair)}); pop("#lb-pair", ${t(TM.pair + 0.3)});
      fadeIn("#rkeyM", ${t(TM.quit - 0.2)}, 0.2); X5.fly(tl, "rkeyM", ${t(TM.quit)}, 0, 0, 1.0, 60); pop("#lb-rkey", ${t(TM.quit + 0.9)});
      tl.to("#udataM", { scale: 0.7, svgOrigin: "${f(ux)} ${f(uy)}", duration: 0.5, ease: "power2.inOut" }, ${t(TM.min - 0.3)}); pop("#lb-min", ${t(TM.min)});
      // ===== L16 NFT 与 GameFi 墙：社交账号和前端 · 铸币权限 · 内部人
      out("#lb-wall, #lb-pair, #lb-rkey, #lb-min", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "nftE", 1.6); bump("#ensign", ${t(LS[16] + 1.7)}, 1.05);
      bump("#nphone", ${t(TM.social)}, 1.08); pop("#lb-nphone", ${t(TM.social)});
      bump("#nui", ${t(TM.front)}, 1.08); pop("#lb-nui", ${t(TM.front)});
      bump("#mint", ${t(TM.mintW)}, 1.06); pop("#lb-mint", ${t(TM.mintW)});
      bump("#insider", ${t(TM.ins)}, 1.08); pop("#lb-ins", ${t(TM.ins)});
`,
});
