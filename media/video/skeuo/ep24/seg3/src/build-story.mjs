// ep24/seg3「③ 最弱的一家」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.backB（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.weakC

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E7, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";
const W = (word, i, fb) => { try { const v = w(word, i); return Number.isFinite(v) ? v : fb; } catch { return fb; } };
// 不支持 scale 的物件：绕地面点包一层，并换算 anchors
function wput(key, o, r, extra = "") {
  const [gx, gy] = at(o), k = o.scale ?? 1;
  put(key, o, r, 0, { wrap: (svg) => `<g${extra} transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length >= 2) A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
}
const dotsSvg = (x0, y0, n, cols, sp, r, fill, idp = "", from = 0) => Array.from({ length: n }, (_, i) => {
  const j = i + from, cx = x0 + (j % cols) * sp + sp / 2, cy = y0 + Math.floor(j / cols) * sp + sp / 2;
  return `<circle${idp ? ` id="${idp}${i}"` : ""} cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${fill}"/>`;
}).join("");

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 石板路（最底层）
{
  const R = L.ROAD, u0 = 1500, u1 = 7400, P = [[u0, R.v0], [u1, R.v0], [u1, R.v1], [u0, R.v1]].map(([u, v]) => Wp(u, v, 0).map((q) => q.toFixed(1)).join(","));
  add({ u: u0, v: 0 }, `<polygon points="${P.join(" ")}" fill="#ddd7cb" stroke="#cfc8ba" stroke-width="2"/>`, -30000);
}
// 数据管：客服后台 → 路面 → 四根支管
const ZC = L.ZONE_ANCHOR.C;
const PIPE_O = { u: L.LEDGER.u, v: L.LEDGER.v };
const BR = [L.PARCELS_C[1], L.PHONE_C, L.BUCKET_C, L.LETTERS_C[1]];   // 四个摊位的支管终点
const BU = BR.map((q) => q.u);
put("pp", PIPE_O, E1.pipe(PIPE_O, { id: "pp", r: 6, pts: [[0, 0, 6], [0, -L.LEDGER.v, 6], [Math.max(...BU) - PIPE_O.u, -L.LEDGER.v, 6]] }), -20000);
BR.forEach((q, i) => {
  const o = { u: q.u, v: 0 }, dv = q.v + (q.v < 0 ? 30 : -30);
  put("pb" + i, o, E1.pipe(o, { id: "pb" + i, r: 6, pts: [[0, 0, 6], [0, dv, 6]] }), -20000);
  if (i === 1) {   // 最弱的那一根：红色虚线叠层
    const a = Wp(o.u, 0, 6), b = Wp(o.u, dv, 6);
    add(o, S.hid("pbw", `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${RED}" stroke-width="9" stroke-dasharray="16 10" stroke-linecap="round"/>`), -19999);
  }
});

// ---- B 外包客服中心（上段段尾 backB 的画面）
put("ledger", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ledger", tag: "客服后台" }));
[0, 1, 2].forEach((i) => put("stk" + i, { ...L.STACK_B, z: i * 6 }, O.doc({ ...L.STACK_B, z: i * 6 }, { id: "stk" + i, w: L.STACK_B.w, h: L.STACK_B.h, title: "导出", lines: ["姓名", "证件图像", "余额", "交易记录"], standing: true }), i));
{
  const [x, y] = at(L.VAULT_B);
  add(L.VAULT_B, `<g><rect x="${x}" y="${y}" width="290" height="200" rx="14" fill="none" stroke="#9a9387" stroke-width="3" stroke-dasharray="12 9"/>
    <text x="${x + 145}" y="${y + 190}" text-anchor="middle" font-size="22" font-weight="700" fill="#6d685e">不在数据里</text></g>`, -400);
}
wput("padB", L.PADLOCK_B, O.padlock(L.PADLOCK_B, { id: "padB" }));
wput("keyB", L.KEY_B, O.key(L.KEY_B, { id: "keyB" }));
wput("desk1", L.DESKS[1], O.desk(L.DESKS[1], { id: "desk1" }));
put("agent1", L.AGENTS[1], O.person(L.AGENTS[1], { id: "agent1", role: "engineer", scale: L.AGENTS[1].scale }));
put("bribe", L.BRIBE, O.envelope(L.BRIBE, { id: "bribe", w: L.BRIBE.w, h: L.BRIBE.h }));
L.BRIBE_COINS.forEach((q, i) => put("bc" + i, q, E7.oddCoin(q, { id: "bc" + i, scale: q.scale }), 1));

// ---- C 第三方街
put("signC", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "signC", style: "plate", text: "第三方街", size: 40 }));
const PLATE_T = ["电商与营销库", "破产案服务商", "客服工单平台", "邮件供应商"];
L.STALL_PLATES.forEach((q, i) => put("pl" + i, q, E1.signBoard(q, { id: "pl" + i, style: "plate", text: PLATE_T[i], size: 32 })));
// ① 电商与营销库
L.PARCELS_C.forEach((q, i) => put("pc" + i, q, E7.parcel(q, { id: "pc" + i, scale: q.scale })));
put("order", L.ORDER_DOC, O.doc(L.ORDER_DOC, { id: "order", w: L.ORDER_DOC.w, h: L.ORDER_DOC.h, title: "订单 · 收货地址", lines: ["收货人", "地址", "电话"], standing: true }));
// ② 破产案服务商
wput("phoneC", L.PHONE_C, O.phone(L.PHONE_C, { id: "phoneC" }));
put("simC", L.SIM_C, E22.simCard(L.SIM_C, { id: "simC", scale: L.SIM_C.scale, label: "员工号码" }), 0, { wrap: (svg) => `<g id="simMv">${svg}</g>` });
put("cred", L.CRED_DOC, O.doc(L.CRED_DOC, { id: "cred", w: L.CRED_DOC.w, h: L.CRED_DOC.h, title: "债权人文件", lines: ["姓名", "地址", "邮箱", "余额"], standing: true }));
// ③ 客服工单平台
wput("bucketC", L.BUCKET_C, O.bucket(L.BUCKET_C, { id: "bucketC" }));
put("ticket", L.TICKET_DOC, O.doc(L.TICKET_DOC, { id: "ticket", w: L.TICKET_DOC.w, h: L.TICKET_DOC.h, title: "工单", lines: ["邮箱", "姓名", "问题"], standing: true }));
// ④ 邮件供应商（红色叠层在 L16 亮起）
L.LETTERS_C.forEach((q, i) => {
  put("lt" + i, q, E1.letter(q, { id: "lt" + i, w: q.w, h: q.h }));
  add(q, S.hid("ltr" + i, E1.letter(q, { id: "ltr" + i, w: q.w, h: q.h, state: "attacker" }).svg), 0.5);
});
put("atkC", L.ATK_C, O.person(L.ATK_C, { id: "atkC", role: "attacker", scale: L.ATK_C.scale }));
put("magC", L.MAG_C, O.magnifier(L.MAG_C, { id: "magC" }), 0, { wrap: (svg) => `<g id="magMv" opacity="0">${svg}</g>` });

// 泄露点：每块摊位牌上方一个红点
L.STALL_PLATES.forEach((q, i) => { const p = up(A["pl" + i].top, 22); add(q, S.hid("lk" + i, `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="${RED}" stroke="#fff" stroke-width="3"/>`), 2); });
// L2 第三方 API 密钥（灰）
{ const ko = S.rel(L.ORDER_DOC, -40, 150); const r = O.key(ko, { id: "apiKey" }); const [gx, gy] = at(ko), k = 0.55;
  add(ko, S.hid("apiKeyG", `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})"><g style="filter:grayscale(1)">${r.svg}</g></g>`), 3);
  A.apiKey = { top: [gx, gy - 30] }; }
// ① 的红色虚线框（L2 被进入 / L8 收货地址）
{ const xs = [...L.PARCELS_C.map((q) => at(q)), at(L.ORDER_DOC)]; const x0 = Math.min(...xs.map((p) => p[0])) - 50, x1 = Math.max(...xs.map((p) => p[0])) + 60;
  const y0 = Math.min(...xs.map((p) => p[1])) - 110, y1 = Math.max(...xs.map((p) => p[1])) + 26;
  add(L.ORDER_DOC, S.hid("box1", `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="12" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="14 9"/>`), 5);
  A.box1 = { tl: [x0, y0], tr: [x1, y0] }; }
// 点阵 ①：100 青蓝 + 27 红 + 2 虚线（修正）
const D1 = at(L.DOTS_C[0]);
add(L.DOTS_C[0], S.hid("d1a", dotsSvg(D1[0], D1[1], 100, 20, 15, 5, TEAL)), 10);
add(L.DOTS_C[0], S.hid("d1b", dotsSvg(D1[0], D1[1] + 82, 27, 20, 15, 5, RED)), 10);
add(L.DOTS_C[0], S.hid("d1c", Array.from({ length: 2 }, (_, i) => `<circle cx="${D1[0] + (7 + i) * 15 + 7.5}" cy="${D1[1] + 82 + 22.5}" r="5" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="3 2"/>`).join("")), 10);
lb("lb-d1a", [D1[0] + 308, D1[1] + 18], "约 100 万个邮箱", "lab-cs lab-sm", "l");
lb("lb-d1b", [D1[0] + 308, D1[1] + 100], "约 27.2 万条 · 姓名 住址 电话", "lab-rs lab-sm", "l");
lb("lb-d1u", [D1[0] + 150, D1[1] + 120], "每点约 1 万", "lab-ink lab-sm", "t");
lb("lb-d1c", [D1[0] + 308, D1[1] + 168], "修正：约 29.2 万名客户", "lab-rs lab-sm", "l");
// 论坛牌（L5）
{ const [x, y] = at(L.FORUM_C);
  add(L.FORUM_C, S.hid("forum", `<rect x="${x - 4}" y="${y - 18}" width="8" height="18" fill="#8a8478"/><rect x="${x - 80}" y="${y - 70}" width="160" height="54" rx="8" fill="#d9d4ca" stroke="#8a8478" stroke-width="3"/>
    <text x="${x}" y="${y - 33}" text-anchor="middle" font-size="26" font-weight="800" fill="#4a463f">论坛</text>`), 0);
  A.forum = { top: [x, y - 74], center: [x, y - 43] }; }
lb("lb-forum", up(A.forum.top, 4), "2020 年 12 月 · 公开", "lab-rs lab-sm");
// L5 订单文件复制成一摞飞上论坛
{ const [x, y] = A.order.top; const paper = (dx, dy) => `<rect x="${x - 15 + dx}" y="${y - 20 + dy}" width="30" height="38" rx="3" fill="#fff" stroke="${RED}" stroke-width="2.5"/>`;
  add(L.ORDER_DOC, S.hid("fly", paper(0, 0) + paper(6, -6) + paper(12, -12)), 40); }
// L6 钓鱼邮件 / 短信 / 威胁电话从论坛射向左边
{ const [x, y] = A.forum.center; const env = (i) => `<g id="bst${i}" opacity="0"><rect x="${x - 22}" y="${y - 14 + (i - 2) * 26}" width="44" height="28" rx="3" fill="#fde6e3" stroke="${RED}" stroke-width="2.5"/><path d="M${x - 22} ${y - 14 + (i - 2) * 26} l22 15 l22 -15" fill="none" stroke="${RED}" stroke-width="2.5"/></g>`;
  const tel = (i) => `<g id="bst${i}" opacity="0"><rect x="${x - 15}" y="${y - 22 + (i - 2) * 26}" width="30" height="46" rx="6" fill="#fff" stroke="${RED}" stroke-width="3"/><circle cx="${x}" cy="${y + 16 + (i - 2) * 26}" r="3" fill="${RED}"/></g>`;
  add(L.FORUM_C, [env(0), tel(1), env(2), tel(3), env(4)].join(""), 1); }
// L7 硬件钱包（设备没被攻破）
{ const pos = (() => { const [fx, fy] = at(L.FORUM_C); return [fx - 40, fy + 220]; })();
  const q = G(pos[0], pos[1]); const o = { u: q.u, v: q.v };
  add(o, S.hid("hwG", O.hwWallet(o, { id: "hw", glow: true, screenText: "OK" }).svg), 0);
  A.hw = { top: [pos[0], pos[1] - 70] }; }
lb("lb-hw", up(A.hw.top, 6), "设备没被攻破", "lab-g lab-sm");
lb("lb-label", up(A.box1.tl, 4), "谁买了 · 寄到哪", "lab-r", "b");
lb("lb-key", up(A.apiKey.top, 4), "第三方 API 密钥", "lab-ink lab-sm");
// ② 标签
lb("lb-atk", up(A.phoneC.top, 6), "你的攻击面", "lab-r lab-sm");
// ③ 工单从桶里飘出
{ const [x, y] = A.bucketC.top; add(L.BUCKET_C, [0, 1, 2].map((i) => `<g id="tk${i}" opacity="0"><rect x="${x - 14}" y="${y - 18}" width="28" height="36" rx="3" fill="#fff" stroke="${TEAL}" stroke-width="2.5"/><line x1="${x - 8}" y1="${y - 6}" x2="${x + 8}" y2="${y - 6}" stroke="${TEAL}" stroke-width="2"/><line x1="${x - 8}" y1="${y + 2}" x2="${x + 6}" y2="${y + 2}" stroke="${TEAL}" stroke-width="2"/></g>`).join(""), 30); }
// 点阵 ③：66 青蓝，最后一点放大成一圈 40 红点
const D3 = at(L.DOTS_C[1]);
add(L.DOTS_C[1], S.hid("d3", dotsSvg(D3[0], D3[1], 65, 11, 18, 6, TEAL) + `<circle id="d3hot" cx="${D3[0] + 10 * 18 + 9}" cy="${D3[1] + 5 * 18 + 9}" r="6" fill="${TEAL}"/>`), 10);
{ const cx = D3[0] + 10 * 18 + 9, cy = D3[1] + 5 * 18 + 9, rc = 26, rr = [cx + 38, cy - 40];
  const ring = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return `<circle cx="${(rr[0] + rc * Math.cos(a)).toFixed(1)}" cy="${(rr[1] + rc * Math.sin(a)).toFixed(1)}" r="2.4" fill="${RED}"/>`; }).join("");
  add(L.DOTS_C[1], S.hid("ring", `<line x1="${cx}" y1="${cy}" x2="${rr[0] - rc}" y2="${rr[1]}" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/>${ring}`), 11);
  lb("lb-ring", [rr[0], rr[1] - rc - 6], "约 40 名 · 索要助记词", "lab-rs lab-sm"); }
lb("lb-d3", [D3[0] + 99, D3[1] + 112], "最多约 6.6 万 · 每点约 1000 人", "lab-cs lab-sm", "t");
// 点阵 ④：57 点
const D4 = at(L.DOTS_C[2]);
add(L.DOTS_C[2], S.hid("d4", dotsSvg(D4[0], D4[1], 57, 12, 16, 5, TEAL)), 10);
lb("lb-d4", [D4[0] + 96, D4[1] + 86], "约 570 万行 · 每点约 10 万", "lab-cs lab-sm", "t");
lb("lb-weak", up(A.pl1.top, 30), "最弱的那一家", "lab-r");

// ---------------------------------------------------------------- 屏幕层卡片
const SRC = (t) => `<span style="color:#6d685e;font-size:28px">来源 · ${t}</span>`;
const EV = (t) => `<b>${t}</b>`;
const cred = codeCard("cc", { x: 1300, y: 330, w: 520, head: "债权人文件", rowHide: true, rows: [
  { html: "FTX · BlockFi · Genesis" }, { html: "姓名" }, { html: "地址" }, { html: "邮箱" }, { html: "账户余额", chip: "余额", chipCls: "x" }] });
const pW = S.scr("weakC", A.phoneC.center ?? A.phoneC.top), pA = S.scr("stall2C", A.phoneC.center ?? A.phoneC.top);
S.curve("cvAtk", pA, [80, 520], { color: RED });
S.curve("cvWeak", pW, [80, 560], { color: RED });
const html = [
  evt("ev1", EV("Ledger · 2020 年 6 月"), { color: RED }), evt("sr1", SRC("Ledger CEO 声明"), { top: 200, color: "#8a8478" }),
  evt("sr1b", SRC("Ledger 后续说明"), { top: 202, color: "#8a8478" }), evt("sr1c", SRC("SiliconANGLE 报道"), { top: 204, color: "#8a8478" }),
  evt("ev2", EV("Kroll · 2023 年 8 月"), { color: RED }), evt("sr2", SRC("BleepingComputer 报道"), { top: 200, color: "#8a8478" }),
  evt("ev3", EV("Trezor · 2024 年 1 月"), { color: RED }), evt("sr3", SRC("Trezor 官方博客"), { top: 200, color: "#8a8478" }),
  evt("ev4", EV("Gemini · 2022 年 12 月"), { color: RED }), evt("sr4", SRC("The Block 报道"), { top: 200, color: "#8a8478" }),
  evt("ev5", `安全取决于最弱的一家${gtag("解读")}`, { color: RED }),
  cred,
  ck("ckGem", `账户 · 系统：未受影响${gtag("项目方称")}`, { x: 1240, y: 330, w: 600, kind: "g" }),
  `<div class="s3tag hide" id="tgBack">← 客服后台</div>`, `<div class="s3tag hide" id="tgUser" style="top:${560 + 26}px">← 客服后台 · 用户</div>`,
].join("\n");
const css = `.s3tag{position:absolute;left:72px;top:${520 + 26}px;font-size:28px;font-weight:800;color:${RED};background:#fff;border-radius:10px;padding:4px 14px 6px;border:2px dashed ${RED}}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  leak: W("每一家", 1, LS[1] + 5),
  key: W("API", 2, LS[2] + 3), db: W("营销", 2, LS[2] + 6),
  d27: W("27.2", 3, LS[3] + 3),
  forum: W("黑客论坛", 5, LS[5] + 2.5),
  sim: W("SIM", 9, LS[9] + 3.5),
  bal: W("账户余额", 11, LS[11] + 2), surf: W("攻击面", 12, LS[12] + 2),
  tk: W("工单平台", 13, LS[13] + 2.5),
  d66: W("6.6", 14, LS[14] + 1), r40: W("40", 15, LS[15] + 2),
  d57: W("570", 17, LS[17] + 0.5), ok: W("没有受到影响", 18, LS[18] + 1.5),
  weak: W("最弱", 19, LS[19] + 3),
};
const t = (x) => f(x);

S.build({
  cam0: "backB", sub: "数据去了哪，风险就到哪",
  grid: { u0: 1400, u1: 9600, v0: -4100, v1: 4000 }, box: [1500, -3000, 5900, 2800],   // 覆盖本段镜头 backB / streetC / stall1C / stall2C / stall3C / stall4C / weakC（含上段段尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "KYC", d: "金融机构对客户身份的核验", at: w("KYC", 1) },
    { id: "t1", t: "API 密钥", d: "程序访问系统时用的一串凭证", at: w("API 密钥", 2) },
    { id: "t2", t: "SIM 卡劫持", d: "骗运营商把你的号码转到攻击者的卡上", at: w("SIM 卡劫持", 9) },
    { id: "t3", t: "助记词", d: "能恢复整个钱包的一组单词", at: w("助记词", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 镜头右移到 streetC；后台的数据管分出四根支管，青蓝流动
      cam(${t(LS[0])}, "streetC", 2.2, "power2.inOut");
      ["pp", "pb0", "pb1", "pb2", "pb3"].forEach((id, i) => { fadeIn("#" + id + "-flow", ${t(LS[0] + 0.4)} + i * 0.25, 0.4); X1.dash(tl, id + "-flow", ${t(LS[0] + 0.4)}, ${t(S.TOTAL - 1.4 - LS[0] - 0.4)}, -2400); });
      // ===== L1 四块摊位牌依次亮起，牌上红点＝泄露点
      [0, 1, 2, 3].forEach((i) => { bump("#pl" + i, ${t(LS[1] + 0.8)} + i * 0.7, 1.08, 1); pop("#lk" + i, ${t(TM.leak)} + i * 0.15, 0.25); });
      // ===== L2 镜头靠近摊位 ①；灰钥匙插进来，红框；事件卡 + 来源卡
      out("#lk0, #lk1, #lk2, #lk3", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "stall1C", 1.4);
      pop("#ev1", ${t(LS[2] + 0.3)}); pop("#sr1", ${t(LS[2] + 0.6)});
      fadeIn("#apiKeyG", ${t(TM.key)}, 0.3); tl.fromTo("#apiKeyG", { x: -140 }, { x: 0, duration: 0.8, ease: "power2.out" }, ${t(TM.key)}); pop("#lb-key", ${t(TM.key + 0.5)});
      fadeIn("#box1", ${t(TM.db)}, 0.3); flash("#box1", ${t(TM.db + 0.3)}, 2);
      // ===== L3 两行点阵：100 青蓝 + 27 红
      out("#lb-key, #apiKeyG", ${t(LS[3] - 0.2)});
      fadeIn("#d1a", ${t(LS[3] + 0.3)}, 0.6); pop("#lb-d1a", ${t(LS[3] + 0.6)}); pop("#lb-d1u", ${t(LS[3] + 0.8)});
      fadeIn("#d1b", ${t(TM.d27)}, 0.5); pop("#lb-d1b", ${t(TM.d27 + 0.3)});
      // ===== L4 修正：红行补 2 点
      out("#sr1", ${t(LS[4] - 0.1)}, 0.2); pop("#sr1b", ${t(LS[4] + 0.1)});
      fadeIn("#d1c", ${t(LS[4] + 0.6)}, 0.4); flash("#d1c", ${t(LS[4] + 1.0)}, 2); pop("#lb-d1c", ${t(LS[4] + 1.0)});
      // ===== L5 订单复制成一摞，飞上论坛牌
      out("#d1a, #d1b, #d1c, #lb-d1a, #lb-d1b, #lb-d1c, #lb-d1u, #box1", ${t(LS[5] - 0.2)});
      out("#sr1b", ${t(LS[5] - 0.1)}, 0.2); pop("#sr1c", ${t(LS[5] + 0.1)});
      fadeIn("#forum", ${t(LS[5] + 0.3)}, 0.4);
      fadeIn("#fly", ${t(LS[5] + 0.6)}, 0.2); tl.to("#fly", { x: ${f(A.forum.center[0] - A.order.top[0])}, y: ${f(A.forum.center[1] - A.order.top[1] + 4)}, duration: 1.1, ease: "power2.inOut" }, ${t(LS[5] + 0.8)});
      pop("#lb-forum", ${t(TM.forum)});
      // ===== L6 钓鱼邮件、短信、威胁电话射向左边
      [0, 1, 2, 3, 4].forEach((i) => { const t0 = ${t(LS[6] + 0.4)} + i * 0.35;
        tl.fromTo("#bst" + i, { x: 0, opacity: 0 }, { x: -520, opacity: 1, duration: 1.3, ease: "power1.in" }, t0); tl.to("#bst" + i, { opacity: 0, duration: 0.3 }, t0 + 1.3); });
      // ===== L7 设备没被攻破
      out("#lb-forum", ${t(LS[7] - 0.2)}); fadeIn("#hwG", ${t(LS[7] + 0.2)}, 0.4); pop("#lb-hw", ${t(LS[7] + 0.5)});
      // ===== L8 收货地址面单变红，红框：谁买了 · 寄到哪
      [0, 1, 2].forEach((i) => X7.parcelLabel(tl, "pc" + i, ${t(LS[8] + 0.4)} + i * 0.15, "red"));
      fadeIn("#box1", ${t(LS[8] + 0.6)}, 0.3); pop("#lb-label", ${t(LS[8] + 0.9)});
      // ===== L9 镜头靠近摊位 ②；SIM 卡从员工手机滑到攻击者手里
      out("#ev1, #sr1c, #hwG, #lb-hw, #lb-label, #box1, #forum, #fly", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "stall2C", 1.4); pop("#ev2", ${t(LS[9] + 0.3)}); pop("#sr2", ${t(LS[9] + 0.6)});
      tl.to("#simMv", { x: ${f(A.atkC.center[0] - A.simC.center[0] - 20)}, y: ${f(A.atkC.center[1] - A.simC.center[1])}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.sim + 0.2)});
      // ===== L10 债权人文件：FTX · BlockFi · Genesis
      pop("#cc", ${t(LS[10] + 0.3)}); pop("#cc-r0", ${t(LS[10] + 1.0)}); bump("#cred", ${t(LS[10] + 2.6)}, 1.06, 1); bump("#cc-r0", ${t(LS[10] + 4.0)}, 1.05, 1);
      // ===== L11 四个字段依次出现，账户余额红
      [1, 2, 3, 4].forEach((i) => pop("#cc-r" + i, ${t(LS[11] + 0.1)} + (i - 1) * 0.5, 0.25)); hot("#cc-r4", ${t(TM.bal + 0.3)}, "#fdeae7"); pop("#cc-c4", ${t(TM.bal + 0.3)});
      // ===== L12 红线从员工手机连回 B 的客服后台
      out("#cc", ${t(LS[12] - 0.2)}); draw("cvAtk", ${t(LS[12] + 0.2)}); pop("#tgBack", ${t(LS[12] + 0.9)}); pop("#lb-atk", ${t(TM.surf)});
      // ===== L13 镜头靠近摊位 ③；工单从桶里飘出
      out("#cvAtk, #tgBack, #lb-atk, #ev2, #sr2", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "stall3C", 1.4); pop("#ev3", ${t(LS[13] + 0.3)}); pop("#sr3", ${t(LS[13] + 0.6)});
      [0, 1, 2].forEach((i) => tl.fromTo("#tk" + i, { x: 0, y: 0, opacity: 0 }, { x: (i - 1) * 46, y: -70 - i * 18, opacity: 1, duration: 0.9, ease: "power2.out" }, ${t(TM.tk)} + i * 0.25));
      // ===== L14 66 点
      fadeIn("#d3", ${t(TM.d66)}, 0.6); pop("#lb-d3", ${t(TM.d66 + 0.4)});
      // ===== L15 一点放大成一圈 40 红点
      bump("#d3hot", ${t(LS[15] + 0.4)}, 1.8, 1); fadeIn("#ring", ${t(TM.r40)}, 0.5); pop("#lb-ring", ${t(TM.r40 + 0.3)});
      // ===== L16 镜头靠近摊位 ④；一排信封变红
      out("#d3, #ring, #lb-d3, #lb-ring, #ev3, #sr3, #tk0, #tk1, #tk2", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "stall4C", 1.4); pop("#ev4", ${t(LS[16] + 0.3)}); pop("#sr4", ${t(LS[16] + 0.6)});
      [0, 1, 2, 3].forEach((i) => fadeIn("#ltr" + i, ${t(LS[16] + 1.8)} + i * 0.15, 0.3));
      // ===== L17 57 点
      fadeIn("#d4", ${t(TM.d57)}, 0.6); pop("#lb-d4", ${t(TM.d57 + 0.4)});
      // ===== L18 项目方称：账户和系统未受影响
      pop("#ckGem", ${t(TM.ok - 0.6)});
      // ===== L19 weakC：放大镜扫过四家，停在 ②；那根支管变红，红线连回后台和用户
      out("#d4, #lb-d4, #ev4, #sr4, #ckGem, #ltr0, #ltr1, #ltr2, #ltr3", ${t(LS[19] - 0.2)});
      cam(${t(LS[19])}, "weakC", 1.2);
      tl.set("#magMv", { x: -320 }, ${t(LS[19])}); fadeIn("#magMv", ${t(LS[19] + 0.2)}, 0.3);
      tl.to("#magMv", { keyframes: [{ x: 140, duration: 0.6 }, { x: 600, duration: 0.6 }, { x: 1060, duration: 0.6 }, { x: 0, duration: 1.0 }], ease: "power1.inOut" }, ${t(LS[19] + 0.3)});
      out("#pb1-flow", ${t(LS[19] + 3.2)}, 0.2); fadeIn("#pbw", ${t(LS[19] + 3.2)}, 0.3); pop("#lb-weak", ${t(LS[19] + 3.3)});
      pop("#ev5", ${t(LS[19] + 3.0)}); draw("cvWeak", ${t(LS[19] + 3.4)}, 0.6); pop("#tgUser", ${t(LS[19] + 3.8)});
`,
});
