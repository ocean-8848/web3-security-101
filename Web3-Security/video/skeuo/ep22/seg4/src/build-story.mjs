// ep22/seg4「④ 找上门来」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.staffD（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   chainA       A 区块链 + 区块浏览器 + 放大镜 + "链上数据"（seg2 L10–L12）
//   linkB        B 线索桌 + 三类线索 + 目标档案 + 住址牌（seg2 L13–L17、L19 终点；seg3 起点）
//   simC         C SIM 卡 ×2 + 两部手机特写，题卡位置在右侧（seg1 L5–L11 终点；seg2 起点；seg3 L3–L8；seg6 L9–L13）
//   counterC     C 运营商柜台 + 伪造证件 + 号码转移锁 + 受害者手机 / 攻击者新卡（seg3 L0–L2；seg5 L14）
//   postD        D 广播塔 + 官方账号帖子 + 粉丝 + 粉丝钱包 + 入口牌 + 点阵（seg1 起点 L0–L4；seg3 L9–L18）
//   acctD        D 账号设置笔记本 + 硬件密钥 + 关键人员板 + 专用邮箱 + 被盗预案（seg5 L12–L20 终点；seg6 起点 L6–L8）
//   staffD       D 交易所员工工位 + 员工 + 手机 + 交易所金库 + 点阵（seg3 L19–L23 终点；seg4 起点）
//   homeE        E 门牌 + 家（书桌 / 窗）+ 持币人 + 家属 + 海报 + 暗号手机 + 点阵（seg4 L0–L7、L16–L17、L21 终点；seg5 起点 L0–L5；seg6 L0–L5）
//   safeE        E 多签金库 + 时间锁 + 扳手 / 算力机比喻 + 持币人 + 随身设备（seg2 L0–L9；seg5 L6–L11）
//   eventsE      E 门口旁的事件牌（seg4 L8–L15、L18–L20，"镜头稍右移"）
//   remoteF      E 右侧（金库 / 时间锁 / 持币人）到草地对面的 F 异地（门槛表）（seg5 L7、L10）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   F            
//   wide         整条街全景：A → F（seg2 L18；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
// ends static on CAMS.homeE
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E17 from "../../../ep17/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

// ---- 段内专用几何 / 镜头
const P = (X, Y) => { const q = G(X, Y); return { u: q.u, v: q.v }; };   // 世界画布点 → 地面点
const DE = at(L.DOTS_E), EV = at(L.EVENTS);
const PITCH = 8.6, DX0 = DE[0] + 135, ROWY = (r) => DE[1] + 4 + r * 44;       // 点阵：每行 5 点高，按列排
const BW = 236, STEP = 254, BH = 196, BZ = 26, bx = (i) => EV[0] + i * STEP, BY = EV[1] - BZ - BH; // 事件牌（屏幕朝向的立牌）
const LIST_DOC = P(8360, -3380), GOV = P(10150, -2870);
const docR = [8297, -3551, 8422, -3357];
const cams = {
  ...L.CAMS,
  listE: L.fit([[DE[0] - 10, DE[1] - 60, DE[0] + 700, DE[1] + 200], docR], [240, 300, 1680, 850], 1.5),
  evts: L.fit([[bx(0) - 10, -3070, 10380, EV[1] + 12]], [240, 290, 1680, 850], 1.4),
};

const S = segInit(import.meta.url, { cams, ext: [E1, E2, E17, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors
const wput = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key] || {})) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = sc(A[key][n]);
};
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const T_ = (x, y, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" ${FONT} font-size="${o.size ?? 16}" font-weight="${o.w ?? 700}" fill="${o.fill ?? "#4a463f"}" text-anchor="${o.a ?? "start"}">${s}</text>`;
const tw = (s, size) => [...s].reduce((a, ch) => a + (/[\x00-\xff]/.test(ch) ? size * 0.6 : size), 0);
const pill = (x, y, s, bg, fg = "#ffffff", size = 15) => { const wd = tw(s, size) + 22; return `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="28" rx="14" fill="${bg}"/>` + T_(x + 11, y + 20, s, { size, w: 800, fill: fg }); };

// ---------------------------------------------------------------- 世界物件
// 石板路（最底层）
{ const R = L.ROAD, c = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v).map((n) => f(n)).join(",")).join(" ");
  add({ u: 0, v: 0 }, `<polygon points="${c}" fill="#dcd7cf" stroke="#c9c2b6" stroke-width="2"/>`, -1e6); }

// D 区（上段终点 staffD 的画面）
wput("stDesk", L.STAFF_DESK, O.desk(L.STAFF_DESK, { id: "stDesk" }), 0.7);
put("staff", L.STAFF, O.person(L.STAFF, { id: "staff", role: "engineer", scale: 0.5 }));
wput("stPhone", L.STAFF_PHONE, O.phone(L.STAFF_PHONE, { id: "stPhone" }), 0.7);
put("exch", L.EXCH_SAFE, O.safe(L.EXCH_SAFE, { id: "exch", plate: "交易所" }));
put("acct", L.ACCT_LAPTOP, O.laptop(L.ACCT_LAPTOP, { id: "acct" }));
put("fido", L.FIDO, O.hwWallet(L.FIDO, { id: "fido", screenText: "FIDO2" }));
put("mail", L.MAILBOX, O.envelope(L.MAILBOX, { id: "mail", w: 140, h: 70 }));
put("pbook", L.PLAYBOOK, O.doc(L.PLAYBOOK, { id: "pbook", title: "被盗预案", standing: true }));

// E 区·家
put("door", L.DOOR_PLATE, E2.addrPlate(L.DOOR_PLATE, { id: "door", text: "门牌" }));
put("poster", L.POSTER, E1.signBoard(L.POSTER, { id: "poster", style: "wood", text: "海报" }));
put("win", L.WINDOW, E17.viewWindow(L.WINDOW, { id: "win", scale: 0.6, label: "日常路线" }));
wput("hDesk", L.HOME_DESK, O.desk(L.HOME_DESK, { id: "hDesk" }), 0.8);
wput("cPhone", L.CODE_PHONE, O.phone(L.CODE_PHONE, { id: "cPhone" }), 0.7);
put("holder", L.HOLDER, O.person(L.HOLDER, { id: "holder", role: "signer", scale: 0.6 }));
L.FAMILY.forEach((q, i) => put("fam" + i, q, O.person(q, { id: "fam" + i, color: "#b3ada3", scale: 0.5 })));
put("carry", L.CARRY_HW, O.hwWallet(L.CARRY_HW, { id: "carry" }));
wput("msig", L.MSIG_SAFE, O.safe(L.MSIG_SAFE, { id: "msig", plate: "多签" }), 0.9);
put("tlock", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlock" }));
wput("gpu", L.GPU, E2.gpuRig(L.GPU, { id: "gpu" }), 0.7);
put("wr", L.WRENCH, X.wrench(L.WRENCH, { id: "wr", scale: 0.9 }));

// 门牌外一圈红虚线（L0）
add(L.DOOR_PLATE, S.hid("doorRing", `<rect x="8424" y="-3372" width="146" height="214" rx="18" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 9"/>`), 400);
// 公开清单（L2）
put("listDoc", LIST_DOC, O.doc(LIST_DOC, { id: "listDoc", title: "公开清单", lines: ["GitHub"], standing: true, w: 150, h: 170 }), 0, { grow: true });

// 点阵：四行（每点 = 1 起），2026 行前 52 点青蓝 = 法国
const YEARS = [["2023", 74], ["2024", 106], ["2025", 170], ["2026", 147]];
YEARS.forEach(([y, n], r) => {
  let s = T_(DE[0], ROWY(r) + 24, `${y} · ${n}`, { size: 20, w: 900, fill: "#1c1c1c" });
  if (r === 3) s += T_(DE[0], ROWY(r) + 42, "至 10 月底", { size: 13, w: 700, fill: "#6d685e" });
  for (let i = 0; i < n; i++) s += `<circle cx="${f(DX0 + Math.floor(i / 5) * PITCH)}" cy="${f(ROWY(r) + (i % 5) * PITCH)}" r="3.1" fill="#3b3e44"/>`;
  add(L.DOTS_E, S.hid("row" + r, s), 300);
});
{ let s = ""; for (let i = 0; i < 52; i++) s += `<circle cx="${f(DX0 + Math.floor(i / 5) * PITCH)}" cy="${f(ROWY(3) + (i % 5) * PITCH)}" r="3.4" fill="#1d93ba"/>`;
  add(L.DOTS_E, S.hid("frDots", s), 301); }
const endX = DX0 + 29 * PITCH, extY = ROWY(3) + 2 * PITCH;
add(L.DOTS_E, S.hid("lowExt", `<path d="M${f(endX + 8)} ${f(extY)}H${f(DE[0] + 560)}" stroke="#6d685e" stroke-width="3" stroke-dasharray="8 7" fill="none"/>`), 302);
lb("lb-legend", [DE[0] + 300, DE[1] - 14], "每点 = 1 起 · Jameson Lopp 公开清单", "lab-g lab-sm");
lb("lb-fr", [DX0 + 5 * PITCH, ROWY(3) + 46], "其中法国 52", "lab-cs lab-sm", "t");
lb("lb-calib", [DX0 + 34 * PITCH + 34, ROWY(1) + 18], "口径不同", "lab-g lab-sm", "l");
lb("lb-low", [DE[0] + 570, extY], "低估", "lab-g lab-sm", "l");
lb("lb-phys", A.listDoc.center, "实体攻击", "lab-r lab-sm", "c");
lb("lb-door", up(A.door.top, 26), "找上门", "lab-r lab-sm");

// 事件牌（L8–L20）：屏幕朝向的立牌，原生 SVG
const board = (i, title, date) => { const x = bx(i);
  return `<ellipse cx="${f(x + BW / 2)}" cy="${f(EV[1])}" rx="${f(BW * 0.46)}" ry="10" fill="rgba(70,60,40,0.12)"/>` +
    [38, BW - 46].map((d) => `<rect x="${f(x + d)}" y="${f(EV[1] - BZ - 4)}" width="8" height="${BZ + 4}" fill="#8a7a62"/>`).join("") +
    `<rect x="${f(x)}" y="${f(BY)}" width="${BW}" height="${BH}" rx="10" fill="#fffdf8" stroke="#b8b0a1" stroke-width="2"/>` +
    `<rect x="${f(x)}" y="${f(BY)}" width="${BW}" height="9" rx="4" fill="#1c1c1c"/>` +
    T_(x + 14, BY + 40, title, { size: 20, w: 900, fill: "#1c1c1c" }) + T_(x + 14, BY + 66, date, { size: 16 }) +
    `<rect x="${f(x + 14)}" y="${f(BY + 78)}" width="${BW - 28}" height="2" fill="#e3ddd1"/>`; };
const line = (i, k, s, o = {}) => T_(bx(i) + 14, BY + 104 + k * 24, s, { size: 17, w: 800, fill: "#1c1c1c", ...o });
const tagAt = (i, s, bg, fg) => pill(bx(i) + 14, BY + BH - 40, s, bg, fg);
const EVD = 500;
add(L.EVENTS, S.hid("ev0", board(0, "Ledger 联合创始人", "2025 年 1 月 · 法国")), EVD);
add(L.EVENTS, S.hid("ev1", board(1, "企业家的父亲", "2025 年 5 月初 · 巴黎")), EVD);
add(L.EVENTS, S.hid("ev2", board(2, "Paymium CEO 家属", "2025 年 5 月 13 日 · 巴黎")), EVD);
add(L.EVENTS, S.hid("ev3", board(3, "纽约 · 2025 年 5 月", "检方指控")), EVD);
add(L.EVENTS, S.hid("ev0x", line(0, 0, "主谋：判 25 年") + line(0, 1, "（当地法院）", { size: 15, w: 700, fill: "#6d685e" })), EVD + 1);
add(L.EVENTS, S.hid("ev0t", tagAt(0, "已获救", "#1f9d55")), EVD + 1);
add(L.EVENTS, S.hid("ev1t", tagAt(1, "已获救 · 未付赎金", "#1f9d55")), EVD + 1);
add(L.EVENTS, S.hid("ev2t", tagAt(2, "未遂", "#1f9d55")), EVD + 1);
add(L.EVENTS, S.hid("ev3x", line(3, 0, "囚禁 17 天", { size: 20, w: 900 })), EVD + 1);
add(L.EVENTS, S.hid("ev3t", tagAt(3, "审理中 · 未查到判决", "#ebe6dc", "#6d685e")), EVD + 1);
{ const x1 = bx(1) + BW / 2, x2 = bx(2) + BW / 2;
  add(L.EVENTS, S.hid("evLink", `<path d="M${f(x1)} ${f(BY + 4)}Q${f((x1 + x2) / 2)} ${f(BY - 80)} ${f(x2)} ${f(BY + 4)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="11 8"/>`), EVD + 2);
  lb("lb-link", [(x1 + x2) / 2, BY - 44], "检方认为有关联", "lab-cs lab-sm"); }
put("gov", GOV, E1.signBoard(GOV, { id: "gov", style: "plate", text: "法国政府", size: 32, sub: "安全简报 · 紧急呼叫优先响应 · 住宅安防检查", w: 420 }), 0, { grow: true });

// 家属外圈（L16）、临时招募（L17）、熟人（L21）
{ const fr = L.world.rects.family, x0 = Math.min(...fr.map((r) => r[0])) - 24, y0 = Math.min(...fr.map((r) => r[1])) - 18,
    x1 = Math.max(...fr.map((r) => r[2])) + 24, y1 = Math.max(...fr.map((r) => r[3])) + 14;
  add(L.FAMILY[1], S.hid("famRing", `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" rx="26" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 9"/>`), 400);
  lb("lb-fam", [(x0 + x1) / 2, y0 - 6], "家属也是攻击面", "lab-r lab-sm"); }
const RECR = [P(8300, -3015), P(8380, -3030), P(8460, -3015)];
RECR.forEach((q, i) => put("rc" + i, q, O.person(q, { id: "rc" + i, role: "attacker", scale: 0.5 }), 0,
  { wrap: (svg) => S.hid("rcg" + i, `<g opacity="0.5">${svg}</g>`) }));
lb("lb-rc", up(A.rc1.top, 12), "临时招募", "lab-r lab-sm");
const VIS = [P(8320, -3020), P(8440, -3020)];
VIS.forEach((q, i) => put("vs" + i, q, O.person(q, { id: "vs" + i, color: "#a9a399", scale: 0.5 }), 0, { wrap: (svg) => S.hid("vsg" + i, svg) }));
{ const [vx, vy] = at(VIS[1]);
  add(VIS[1], S.hid("vsRing", `<rect x="${f(vx - 34)}" y="${f(vy - 118)}" width="68" height="128" rx="30" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8"/>`), 10);
  lb("lb-vs", [vx + 10, vy - 124], "熟人也可能", "lab-r lab-sm"); }

// ---------------------------------------------------------------- 屏幕层卡片
const SRC = [
  ["sc0", "Jameson Lopp 公开清单（GitHub）"], ["sc1", "Fortune · The Block"], ["sc2", "The Block"],
  ["sc3", "CoinDesk 报道"], ["sc4", "Cointelegraph（媒体转述）"], ["sc5", "ABC7 · Decrypt"],
];
const html = `<div class="note hide" id="note">只引用公开报道 · 不写个人细节</div>` +
  SRC.map(([id, s], i) => evt(id, `<b>来源</b> ${s}`, { top: 120 + i * 4 })).join("");
const css = `.note { position: absolute; left: 960px; top: 210px; transform: translate(-50%, -50%); background: #e6e1d7; color: #3d3a35;
  font-family: "Noto Sans SC", sans-serif; font-weight: 800; font-size: 40px; padding: 18px 40px 22px; border-radius: 16px; white-space: nowrap;
  box-shadow: 0 8px 20px rgba(70, 60, 40, 0.12); }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  list: w("公开清单", 2), phys: w("实体攻击", 3),
  y23: w("2023", 4), y24: w("2024", 4), y25: w("2025", 4), y26: w("2026", 5), fr: w("法国", 5),
  calib: w("口径", 6), low: w("低估", 7),
  rescue1: w("救出", 9), caught: w("落网", 10), y26b: w("2026", 10), sent: w("判处", 10), ev1: w("父亲", 11), rescue2: w("解救", 12),
  ev2: w("Paymium", 13), fail: w("未遂", 13), link: w("关联", 14), gov: w("宣布", 15),
  fam: w("家属", 16), rc: w("临时招募", 17), ev3: w("纽约", 18), days: w("囚禁", 19), trial: w("不认罪", 20), acq: w("熟人", 21),
};
const t = (x) => f(x);

S.build({
  cam0: "staffD", sub: "目标不只本人，还有家属",
  grid: { u0: 5500, u1: 14000, v0: -4300, v1: 4500 }, box: [5300, -4500, 5500, 3500],   // 盖住上段终点 staffD + homeE / eventsE
  shown: [], css, html,
  terms: [
    { id: "t0", t: "实体攻击", d: "在线下针对人身的攻击", at: w("实体攻击", 3) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      const EVOLD = "#ev0, #ev0x, #ev0t, #ev1, #ev1t, #ev2, #ev2t, #evLink";
      // ===== L0 再看另一条路，找上门。
      cam(${t(LS[0])}, "homeE", 1.8); fadeIn("#doorRing", ${t(LS[0] + 1.3)}, 0.3); pop("#lb-door", ${t(LS[0] + 1.5)});
      // ===== L1 只讲公开报道的事实，不讲个人细节
      pop("#note", ${t(LS[1] + 0.2)}); out("#note", ${t(LS[1] + 3.6)}, 0.3);
      // ===== L2 Jameson Lopp 公开清单
      out("#doorRing, #lb-door", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "listE", 1.4);
      grow("listDoc", ${t(TM.list)}); pop("#sc0", ${t(TM.list)});
      // ===== L3 实体攻击
      pop("#lb-phys", ${t(TM.phys)});
      // ===== L4 2023 / 2024 / 2025 点阵
      pop("#lb-legend", ${t(LS[4] + 0.2)});
      [["#row0", ${t(TM.y23)}], ["#row1", ${t(TM.y24)}], ["#row2", ${t(TM.y25)}], ["#row3", ${t(TM.y26)}]].forEach(([sel, at]) => {
        fadeIn(sel, at, 0.1); tl.fromTo(sel + " circle", { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.006, immediateRender: false }, at);
      });
      // ===== L5 2026 至 10 月底 147，其中法国 52（青蓝）
      fadeIn("#frDots", ${t(TM.fr)}, 0.4); pop("#lb-fr", ${t(TM.fr + 0.2)});
      // ===== L6 口径不同
      pop("#lb-calib", ${t(TM.calib)});
      // ===== L7 低估
      fadeIn("#lowExt", ${t(TM.low)}, 0.4); pop("#lb-low", ${t(TM.low + 0.3)});
      // ===== L8 Ledger 联合创始人（事件牌 1）
      out("#lb-legend, #lb-fr, #lb-calib, #lb-low, #lb-phys, #sc0", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "evts", 1.4);
      fadeIn("#ev0", ${t(LS[8] + 1.2)}, 0.35); pop("#sc1", ${t(LS[8] + 1.2)});
      // ===== L9 已获救
      fadeIn("#ev0t", ${t(TM.rescue1)}, 0.3);
      // ===== L10 主谋：判 25 年（当地法院）
      fadeIn("#ev0x", ${t(TM.caught)}, 0.3); flash("#ev0x", ${t(TM.sent)}, 3, 0.35);
      // ===== L11 企业家的父亲（事件牌 2）
      out("#sc1", ${t(TM.ev1 - 0.2)}); fadeIn("#ev1", ${t(TM.ev1)}, 0.35); pop("#sc2", ${t(TM.ev1)});
      // ===== L12 已获救 · 未付赎金
      fadeIn("#ev1t", ${t(TM.rescue2)}, 0.3);
      // ===== L13 Paymium CEO 家属（事件牌 3）· 未遂
      out("#sc2", ${t(TM.ev2 - 0.2)}); fadeIn("#ev2", ${t(TM.ev2)}, 0.35); pop("#sc3", ${t(TM.ev2)}); fadeIn("#ev2t", ${t(TM.fail)}, 0.3);
      // ===== L14 检方认为有关联
      fadeIn("#evLink", ${t(TM.link)}, 0.4); pop("#lb-link", ${t(TM.link + 0.3)});
      // ===== L15 法国政府：三项措施
      out("#sc3", ${t(LS[15] - 0.2)}); grow("gov", ${t(LS[15] + 0.3)}); pop("#sc4", ${t(LS[15] + 0.3)});
      // ===== L16 家属也是攻击面
      out("#sc4, #lb-link, #gov, #row0, #row1, #row2, #row3, #frDots, #lowExt, #listDoc, " + EVOLD, ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "homeE", 1.4);
      fadeIn("#famRing", ${t(TM.fam)}, 0.3); pop("#lb-fam", ${t(TM.fam + 0.2)});
      // ===== L17 临时招募
      [0, 1, 2].forEach((i) => fadeIn("#rcg" + i, ${t(TM.rc)} + i * 0.2, 0.3)); pop("#lb-rc", ${t(TM.rc + 0.6)});
      // ===== L18 纽约（事件牌 4）· 检方指控
      out("#famRing, #lb-fam, #rcg0, #rcg1, #rcg2, #lb-rc", ${t(LS[18] - 0.2)}); cam(${t(LS[18])}, "evts", 1.4); fadeIn(EVOLD, ${t(LS[18] + 0.6)}, 0.4);
      fadeIn("#ev3", ${t(TM.ev3)}, 0.35); pop("#sc5", ${t(TM.ev3)});
      // ===== L19 囚禁 17 天（只出文字）
      fadeIn("#ev3x", ${t(TM.days)}, 0.3);
      // ===== L20 审理中 · 未查到判决
      fadeIn("#ev3t", ${t(TM.trial)}, 0.3);
      // ===== L21 熟人也可能（回到家门口，末尾收起，静止在 homeE）
      out("#sc5, " + EVOLD + ", #ev3, #ev3x, #ev3t", ${t(LS[21] - 0.2)}); cam(${t(LS[21])}, "homeE", 1.4);
      fadeIn("#vsg0", ${t(LS[21] + 1.0)}, 0.3); fadeIn("#vsg1", ${t(LS[21] + 1.2)}, 0.3);
      fadeIn("#vsRing", ${t(Math.max(TM.acq, LS[21] + 1.6))}, 0.3); pop("#lb-vs", ${t(Math.max(TM.acq, LS[21] + 1.6) + 0.2)});
      out("#vsg0, #vsg1, #vsRing, #lb-vs", ${t(LE[21] - 0.5)}, 0.3);
`,
});
