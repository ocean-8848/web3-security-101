// ep21/seg5「⑤ 设备与流程」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.counterF（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   inviteA      A 招聘者 + 手机邀约 + 作业包裹 + 高薪牌（seg1 起点 L0–L3；seg3 L0–L2、L16–L17）
//   laptopC      C 工作电脑特写，右侧留题卡位（x > 1300）（seg1 L9–L11 终点；seg2 起点；seg3 L3；seg6 L8–L10）
//   deskC        C 三张工位 + 工作电脑 + 部署系统机柜 + 部署令牌 + 员工（seg1 L4–L8；seg2 L0–L2；seg3 L8–L14；seg6 L11–L13）
//   isoC         C 隔离环境集装箱 + 三类设备（硬件密钥 / 工作电脑 / 工位）+ 包裹（seg5 L1–L4）
//   signD        D 签名人 + 笔记本 + 多签前端 + 硬件钱包 + 门槛表（seg2 L3–L5、L10；seg3 L18–L21 终点；seg4 起点）
//   vaultD       D 金库三门比喻：金库 + 三名签名人 + 三把钥匙 + 三封信（seg2 L6–L9）
//   flowD        D 支票四角色 + 电话 + 公章 + 签名人（seg5 L5–L10）
//   meetE        E 会议桌 + 笔记本弹窗 + 高管 + 热钱包 + GrassCall（seg4 L0–L9）
//   gateB        B 门禁 + 权限板 + 匿名报告 + 离职清单 + 访问日志（seg5 L11、L13–L19 终点；seg6 起点）
//   hireB        B 护照核验 + 放大镜 + 门禁 + 攻击者（+ 点阵）（seg4 L10–L14；seg5 L12）
//   counterF     F 客服柜台 + 用户数据 + 攻击者 + 运营电脑 + 运营钱包 + 告警灯（seg4 L15–L20 终点；seg5 起点）
//   homeG        G 用户家（seg6 L0–L7）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   wide         园区全景：A → G 全部（seg2 L11–L18 终点；seg3 起点；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.gateB

// ---- 段内专用位置（layout.mjs 不改）
const rel = (o, du, dv, extra = {}) => ({ ...o, u: o.u + du, v: o.v + dv, ...extra });
const KEY_OFF = rel(L.LAPTOP, -330, 240);                 // C 办公电脑旁的私钥（L3 被移走）
const SIGNLAP = rel(L.HWKEY_C, 230, 30);                  // C 签名专用小笔记本（wrap 0.5）
const PARCEL5 = rel(L.ISO, -230, -20, { scale: 0.7 });    // C 外部项目包裹（L4 进集装箱）
const CHQ = { ...L.CHEQUE, scale: 1.4 };                  // D 支票放大到 1.4，四个字段读得清
const P9 = [[-330, 30], [-200, 60], [230, 60], [360, 30]].map(([du, dv]) => rel(L.CHEQUE, du, dv, { scale: 0.5 })); // 四个角色（第四名签名人在本段补）
const P9X = rel(L.CHEQUE, 520, -20, { scale: 0.5 });      // 第五个人：想一人签两格
const HG_D = rel(L.PHONE_D, 220, -160);                   // D 短会话沙漏
const BC_D = rel(L.PHONE_D, 300, 120);                    // D 异地登录告警灯
const KC = [[-150, 20, 175], [-150, 20, 95], [150, 20, 175], [150, 20, 95]].map(([du, dv, z]) => rel(L.ROLEBOARD, du, dv, { z, scale: 0.4 })); // 权限板边缘小卡 npm / 域名 / 社交 / 多签

const R = L.world.rects;
const CAMS5 = {
  ...L.CAMS,
  // D 支票 + 四个角色 + 第五个人（L9 关键画面）
  chequeD: L.fit([L.rect(CHQ, "cheque"), ...P9.map((q) => L.rect(q, "person")), L.rect(P9X, "person")], [300, 300, 1620, 820], 1.7),
  // B 权限板 + 边缘小卡 + 离职清单（L13–L15）
  boardB: L.fit([R.board, R.leave, ...KC.map((q) => L.rect(q, "key", 0.5))], [420, 300, 1500, 840], 1.6),
};

const S = segInit(import.meta.url, { cams: CAMS5, ext: [E1, E4, E5, E7, E9, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors（含数组）
function wput(key, o, r, k, dy = 0, extra = {}) {
  const [gx, gy] = at(o);
  const sc = (p) => (Array.isArray(p) && typeof p[0] === "number" ? [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] : Array.isArray(p) ? p.map(sc) : p);
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) A[key][n] = sc(A[key][n]);
}

// ---------------------------------------------------------------- 世界物件
// 石板路（最底层）
{ const p = [[L.ROAD.u0, L.ROAD.v0], [L.ROAD.u1, L.ROAD.v0], [L.ROAD.u1, L.ROAD.v1], [L.ROAD.u0, L.ROAD.v1]].map(([u, v]) => Wp(u, v).map((x) => x.toFixed(1)).join(","));
  add({ u: 0, v: 0 }, `<polygon points="${p.join(" ")}" fill="#e4e0d8" stroke="#d2ccc0" stroke-width="2"/>`, -1e6); }

// F 客服柜台（开场画面 = 上段终点）
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.7 }));
wput("dbF", L.DB, O.dbLedger(L.DB, { id: "dbF", tag: "用户数据" }), 0.7);
put("atkF", L.ATK_F, O.person(L.ATK_F, { id: "atkF", role: "attacker", scale: 0.5 }));
wput("opsF", L.OPSDESK, O.desk(L.OPSDESK, { id: "opsF" }), 0.7);
wput("opsSafe", L.OPSSAFE, O.safe(L.OPSSAFE, { id: "opsSafe", variant: "hot" }), 0.6);
put("bcF", L.BEACON_F, O.beacon(L.BEACON_F, { id: "bcF" }));
// E 会议室（镜头路过）
put("mdesk", L.MDESK, O.desk(L.MDESK, { id: "mdesk" }));
put("mlap", L.MLAPTOP, O.laptop(L.MLAPTOP, { id: "mlap" }));
put("exec", L.EXEC, O.person(L.EXEC, { id: "exec", role: "signer", scale: 0.55 }));
wput("hotE", L.HOTSAFE_E, O.safe(L.HOTSAFE_E, { id: "hotE", variant: "hot" }), 0.6);
// D 签名室
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", plate: "多签金库" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter" }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: 0.5 })));
L.HWS_D.forEach((q, i) => put("hwD" + i, q, O.hwWallet(q, { id: "hwD" + i })));
L.LAPTOPS_D.forEach((q, i) => wput("lapD" + i, q, O.laptop(q, { id: "lapD" + i }), 0.6));
wput("phD", L.PHONE_D, O.phone(L.PHONE_D, { id: "phD", screen2: `<rect width="76" height="150" fill="#1f9d55"/><text x="38" y="62" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">预登记</text><text x="38" y="84" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">电话</text><circle cx="38" cy="116" r="12" fill="#fff"/>` }), 0.7);
put("sealD", L.SEAL, O.seal(L.SEAL, { id: "sealD", text: "双人审批", stamped: false }));
put("chq", CHQ, E9.cheque(CHQ, { id: "chq", scale: 1.4, fields: ["blank", "blank", "blank", "blank", "blank"], labels: ["发起", "审批", "执行", "审计", "—"], signed: false, amount: "大额" }));
P9.forEach((q, i) => put("p9" + i, q, O.person(q, { id: "p9" + i, role: i % 3 === 0 ? "engineer" : "signer", scale: 0.5 }), 0, { grow: true }));
put("p9x", P9X, O.person(P9X, { id: "p9x", color: "#8a8f98", scale: 0.5 }), 0, { grow: true });
put("hgD", HG_D, O.hourglass(HG_D, { id: "hgD" }), 0, { grow: true });
put("bcD", BC_D, O.beacon(BC_D, { id: "bcD" }), 0, { grow: true });
// C 工程师工位
put("lapC", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lapC" }));
L.DESKS.forEach((q, i) => wput("deskC" + i, q, O.desk(q, { id: "deskC" + i }), 0.75));
wput("rackC", L.RACK, O.rack(L.RACK, { id: "rackC", tag: "部署系统" }), 0.6);
put("engC1", L.ENGS[1], O.person(L.ENGS[1], { id: "engC1", role: "engineer", scale: 0.5 }));
put("hwC", L.HWKEY_C, O.hwWallet(L.HWKEY_C, { id: "hwC", screenText: "签名" }));
wput("lapS", SIGNLAP, O.laptop(SIGNLAP, { id: "lapS" }), 0.5);
put("keyOff", KEY_OFF, O.key(KEY_OFF, { id: "keyOff" }));
put("iso", L.ISO, E13.container(L.ISO, { id: "iso", scale: 0.5, label: "隔离环境", tone: "teal" }));
put("pk5", PARCEL5, E7.parcel(PARCEL5, { id: "pk5", scale: 0.7 }));
// 签名专用一组的绿色外框（地面上的圆角框）
{ const q = [[-120, -95], [300, -95], [300, 120], [-120, 120]].map(([du, dv]) => Wp(L.HWKEY_C.u + du, L.HWKEY_C.v + dv).map((x) => x.toFixed(1)).join(","));
  add(rel(L.HWKEY_C, 0, -95), S.hid("signBox", `<polygon points="${q.join(" ")}" fill="rgba(31,157,85,0.08)" stroke="#1f9d55" stroke-width="5" stroke-linejoin="round"/>`), -2); }
// B 门禁与人事
put("gateB", L.GATE, O.checkpoint(L.GATE, { id: "gateB", n: "入" }));
wput("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb", hooks: 2, roles: ["upgrader", "param"], plates: ["REPO", "CLOUD"], holders: [null, null], delays: [null, null], title: "ACCESS" }), 0.7);
const KCN = ["npm", "域名注册商", "社交账号", "多签身份"];
KC.forEach((q, i) => put("kc" + i, q, E5.keycard(q, { id: "kc" + i, scale: 0.4, z: q.z, role: ["pauser", "param", "upgrader", "owner"][i], text: ["npm", "DNS", "SNS", "SAFE"][i] })));
put("leave", L.LEAVE, O.doc(L.LEAVE, { id: "leave", title: "离职清单", lines: ["代码仓库", "云", "npm …"], standing: true, w: 150, h: 200 }), 0, { grow: true });
put("passB", L.PASS_B, E13.passport(L.PASS_B, { id: "passB", scale: 0.8, title: "护照", fields: ["本人出镜", "证件履历", "设备所在地"] }));
put("magB", L.MAG, O.magnifier(L.MAG, { id: "magB" }));
put("logB", L.LOGBOOK, O.ledgerBook(L.LOGBOOK, { id: "logB", scale: 0.6 }));
put("repB", L.REPORT, E1.signBoard(L.REPORT, { id: "repB", style: "plate", text: "匿名报告", size: 36 }), 0, { grow: true });
put("envR", L.REPORT_ENV, O.envelope(L.REPORT_ENV, { id: "envR", w: 110, h: 70 }), 0, { wrap: (s) => S.hid("envRw", s) });
// 权限板红虚线框（L15）
{ const [x0, y0, x1, y1] = R.board, m = 40;
  add(rel(L.ROLEBOARD, 0, 60), S.hid("rbRed", `<rect x="${x0 - m - 30}" y="${y0 - m}" width="${x1 - x0 + 2 * m + 60}" height="${y1 - y0 + 2 * m}" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 10"/>`), 40); }

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-off", up(A.lapC.top, 10), "日常办公", "lab-cs");
lb("lb-sign", up(A.lapS.top, 12), "签名专用", "lab-gs");
lb("lb-dev", up(A.deskC1.top, 10), "开发", "lab-cs");
lb("lb-key", up(A.keyOff.top, 10), "私钥 · 生产凭证", "lab-rs lab-sm");
lb("lb-iso", up(A.iso.top, 10), "隔离环境", "lab-cs lab-sm");
lb("lb-2p", up(A.sealD.top, 14), "双人原则", "lab-gs");
lb("lb-ph", up(A.phD.top, 10), "预登记电话", "lab-cs lab-sm");
["发起", "审批", "执行", "审计"].forEach((s, i) => lb("lb-f" + i, up(A.chq.fields[i], i % 2 ? 78 : 24), s, "lab-ink lab-sm"));
lb("lb-sod", up(A.p9x.top, 10), "一人两格", "lab-rs lab-sm");
lb("lb-hw", up(A.hwD2.top, 10), "硬件密钥", "lab-cs lab-sm");
lb("lb-hg", up(A.hgD.top, 10), "短会话", "lab-cs lab-sm");
lb("lb-bc", up(A.bcD.top, 10), "异地登录告警", "lab-rs lab-sm");
lb("lb-c0", up(A.rb.cards[0], 34), "代码仓库", "lab-ink lab-sm", "b");
lb("lb-c1", up(A.rb.cards[1], -34), "云", "lab-ink lab-sm", "t");
KCN.forEach((s, i) => lb("lb-k" + i, [A["kc" + i].center[0] + (i < 2 ? -24 : 24), A["kc" + i].center[1]], s, "lab-cs lab-sm", i < 2 ? "r" : "l"));
lb("lb-door", up(A.rb.top, 46), "一扇没锁的门", "lab-rs");
lb("lb-log", up(A.logB.top, 8), "访问日志", "lab-cs lab-sm");
lb("lb-rep", up(A.repB.top, 8), "不受惩罚", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
// L7–L8 原请求的消息线（灰）与预登记电话线（绿）——flowD 期间镜头不动
const MSG = { x: 360, y: 300 };
const sg2 = S.scr("flowD", up(A.sg2.top, 4));
S.curve("cvMsg", [MSG.x + 300, MSG.y + 60], sg2, { color: "#8a8f98" });
S.curve("cvPh", S.scr("flowD", A.phD.top), [sg2[0] + 20, sg2[1] + 10], { color: "#1f9d55" });
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const xMsg = mid([MSG.x + 300, MSG.y + 60], sg2), okPh = mid(S.scr("flowD", A.phD.top), sg2);
// L9 四条绿线 + 第五个人两条线（chequeD 期间镜头不动）
P9.forEach((_, i) => S.curve("cv9" + i, S.scr("chequeD", up(A["p9" + i].top, 2)), S.scr("chequeD", A.chq.fields[i]), { color: "#1f9d55" }));
S.curve("cv9x0", S.scr("chequeD", A.p9x.top), S.scr("chequeD", A.chq.fields[2]), { color: "#8a8f98" });
S.curve("cv9x1", S.scr("chequeD", A.p9x.top), S.scr("chequeD", A.chq.fields[3]), { color: "#e0453a" });
// L16–L18 访问日志卡（gateB）+ 曲线到账本
const LOG = { x: 60, y: 470, w: 420 };
const logRows = ["查询岗位无关的数据", "短时间大量导出", "借口紧急 · 绕过审批", "拒绝休假 / 轮岗"];
S.curve("cvLog", [LOG.x + LOG.w + 4, codeRowY(LOG.y, 0)], S.scr("gateB", A.logB.top), { color: "#2aa3c9" });
const icon = (t, c) => `<div class="s5-ic" style="border-color:${c}">${t}</div>`;
const html = kw("kw0", `一人被骗 <b>≠</b> 损失${gtag("解读")}`, { x: 620, y: 130, size: 46 })
  + `<div id="ic-mail" class="s5-chip hide">${icon("✉", "#8a8f98")}邮件</div><div id="ic-tg" class="s5-chip hide">${icon("✈", "#8a8f98")}Telegram</div><div id="ic-file" class="s5-chip hide">${icon("📄", "#8a8f98")}外部文件</div>`
  + `<div id="msg" class="s5-msg hide" data-layout-ignore style="left:${MSG.x}px;top:${MSG.y}px"><span>原渠道消息</span>急，请马上批准转账</div>`
  + `<div id="xMsg" class="s5-mk s5-x hide" style="left:${xMsg[0] - 26}px;top:${xMsg[1] - 26}px">✕</div><div id="okPh" class="s5-mk s5-ok hide" style="left:${okPh[0] - 26}px;top:${okPh[1] - 26}px">✓</div>`
  + ck("ckP0", "视频面试 · 本人出镜", { x: 1300, y: 300, w: 480 }) + ck("ckP1", "核验证件和履历", { x: 1300, y: 390, w: 480 }) + ck("ckP2", "远程岗位 · 核验设备所在地", { x: 1300, y: 480, w: 480 })
  + evt("ev15", `${gtag("解读")} 漏掉一个边缘权限`, { color: "#8a8f98" })
  + codeCard("logc", { ...LOG, head: "访问日志", tag: "早期信号", rows: logRows.map((h) => ({ html: h })) })
  + `<div id="inset" class="s5-inset hide"><div class="s5-ih">F · 客服柜台</div><svg viewBox="0 0 120 90" width="150" height="112"><rect x="30" y="60" width="60" height="22" rx="4" fill="#fff" stroke="#1c1c1c" stroke-width="2"/><path d="M40 60 Q40 28 60 28 Q80 28 80 60Z" fill="#e0453a" stroke="#8f2620" stroke-width="2"/><g id="insetRay" stroke="#e0453a" stroke-width="4" stroke-linecap="round"><path d="M60 6V18M24 22L33 31M96 22L87 31M14 50H26M94 50H106"/></g></svg><div class="s5-it">异常查询告警</div></div>`;
const css = `
.s5-chip{position:absolute;display:flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;background:#fff;border:2px solid #8a8f98;border-radius:22px;font:600 24px/1 "Noto Sans SC",sans-serif;color:#1c1c1c}
.s5-ic{width:34px;height:34px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:18px}
#ic-mail{left:820px;top:470px}#ic-tg{left:1000px;top:420px}#ic-file{left:600px;top:760px}
.s5-msg{position:absolute;width:300px;padding:12px 16px;background:#fff;border:2px solid #8a8f98;border-radius:14px;font:600 24px/1.3 "Noto Sans SC",sans-serif;color:#1c1c1c}
.s5-msg span{display:block;font-size:18px;color:#8a8f98;margin-bottom:4px}
.s5-mk{position:absolute;width:52px;height:52px;border-radius:50%;color:#fff;font:900 32px/52px sans-serif;text-align:center}
.s5-x{background:#e0453a}.s5-ok{background:#1f9d55}
.s5-inset{position:absolute;left:1560px;top:560px;width:240px;padding:10px 12px;background:#fff;border:3px solid #e0453a;border-radius:14px;text-align:center}
.s5-ih{font:600 18px/1.2 "Noto Sans SC",sans-serif;color:#8a8f98}.s5-it{font:700 22px/1.2 "Noto Sans SC",sans-serif;color:#e0453a}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  mail: w("邮件", 2), tg: w("Telegram", 2), file: w("外部文件", 2), key: w("私钥", 3), ext: w("外部项目", 4),
  two: w("两人独立确认", 6), tel: w("预先登记的电话", 7), oob: w("带外确认", 7), notCh: w("不用", 8),
  r0: w("发起人", 9), r1: w("审批人", 9), r2: w("执行人", 9), r3: w("审计人", 9), same: w("同一个人", 9),
  hw: w("硬件密钥", 10), sess: w("短期有效", 10), geo: w("异地登录", 10),
  face: w("本人出镜", 12), docs: w("证件和履历", 12), loc: w("设备所在地", 12),
  repo: w("代码仓库", 14), cloud: w("云", 14), npm: w("npm", 14), dns: w("域名注册商", 14), sns: w("社交账号", 14), ms: w("多签", 14),
  q0: w("无关的数据", 17), q1: w("大量导出", 17), q2: w("绕过审批", 17), q3: w("拒绝休假", 18),
  rep: w("匿名报告", 19), safe: w("不受惩罚", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "counterF", sub: "一个人被骗，也转不走钱",
  grid: { u0: -900, u1: 12700, v0: -6400, v1: 6700 }, box: [-300, -3800, 10500, 4500],   // 盖住上段终点 counterF + isoC / flowD / gateB / B
  shown: [], css, html,
  terms: [
    { id: "t0", t: "独立解码", d: "在另一台设备上自己解析交易", at: w("独立解码", 2) },
    { id: "t3", t: "一次性环境", d: "用完即删、不留数据的运行环境", at: w("一次性环境", 4), low: true },
    { id: "t1", t: "带外确认", d: "换一个渠道确认请求是真的", at: w("带外确认", 7) },
    { id: "t2", t: "npm", d: "JavaScript 代码包的发布平台", at: w("npm", 14) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 镜头从 F 左移到 C；关键词卡（解读）
      cam(${t(LS[0] + 0.2)}, "isoC", 5.0, "power2.inOut"); pop("#kw0", ${t(LS[0] + 0.6)}); out("#kw0", ${t(LE[0] - 0.1)});
      // ===== L1 三类设备一字排开
      pop("#lb-off", ${t(LS[1] + 0.2)}); pop("#lb-sign", ${t(LS[1] + 0.6)}); pop("#lb-dev", ${t(LS[1] + 1.0)});
      // ===== L2 签名专用一组绿框；邮件 / Telegram / 文件撞框弹开
      fadeIn("#signBox", ${t(LS[2] + 0.2)}, 0.4); bump("#hwC", ${t(LS[2] + 0.5)}, 1.08);
      [["#ic-mail", ${t(TM.mail)}, 60, 70], ["#ic-tg", ${t(TM.tg)}, 0, 90], ["#ic-file", ${t(TM.file)}, 90, -40]].forEach(([s, t0, dx, dy]) => {
        tl.fromTo(s, { opacity: 0, x: -dx, y: -dy }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: "power2.in", immediateRender: false }, t0);
        tl.to(s, { x: -dx * 0.8, y: -dy * 0.8, borderColor: "#e0453a", duration: 0.35, ease: "back.out(2)" }, t0 + 0.35);
        tl.to(s, { opacity: 0, duration: 0.3 }, t0 + 1.4); });
      // ===== L3 办公电脑旁的私钥被移走
      out("#lb-sign", ${t(LS[3] + 0.1)}); pop("#lb-key", ${t(LS[3] + 0.3)}); bump("#lapC", ${t(LS[3] + 0.4)}, 1.05);
      X5.fly(tl, "keyOff", ${t(TM.key + 0.4)}, -240, 60, 0.9); fadeIn("#keyOff", 0, 0.01); out("#keyOff, #lb-key", ${t(TM.key + 1.0)}, 0.4);
      // ===== L4 外部项目包裹进隔离环境，门关上
      pop("#lb-iso", ${t(LS[4] + 0.2)}); X13.door(tl, "iso", ${t(TM.ext)}, true, 0.6);
      X5.moveUV(tl, "pk5", ${t(TM.ext + 0.7)}, 150, 20, 0, 1.0, 20); out("#pk5", ${t(TM.ext + 1.6)}, 0.3);
      X13.door(tl, "iso", ${t(TM.ext + 2.0)}, false, 0.6); X13.seal(tl, "iso", ${t(TM.ext + 2.6)}, "green");
      // ===== L5 镜头右移到 D 流程区
      out("#lb-off, #lb-dev, #lb-iso, #signBox", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "flowD", 2.0, "power2.inOut");
      // ===== L6 两名签名人各按一次，公章落下
      bump("#hwD1", ${t(TM.two)}, 1.15); bump("#hwD2", ${t(TM.two + 0.6)}, 1.15); KIT.stamp(tl, "sealD", ${t(TM.two + 1.3)}); pop("#lb-2p", ${t(TM.two + 2.2)});
      // ===== L7 原渠道消息线（灰）+ 预登记电话（绿）
      out("#lb-2p", ${t(LS[7] - 0.1)}); pop("#msg", ${t(LS[7] + 0.2)}); draw("cvMsg", ${t(LS[7] + 0.5)}, 0.8);
      fadeIn("#phD-scr2", ${t(TM.tel)}, 0.3); pop("#lb-ph", ${t(TM.tel + 0.2)}); draw("cvPh", ${t(TM.tel + 0.6)}, 0.8);
      // ===== L8 原渠道红叉，电话绿勾
      pop("#xMsg", ${t(TM.notCh)}); flash("#cvMsg", ${t(TM.notCh + 0.2)}, 2); pop("#okPh", ${t(TM.notCh + 1.0)});
      // ===== L9 关键画面：四人四格（职责分离），第五个人一人两格 → 红叉
      out("#msg, #xMsg, #okPh, #cvMsg, #cvPh, #lb-ph", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "chequeD", 1.0);
      [${t(TM.r0)}, ${t(TM.r1)}, ${t(TM.r2)}, ${t(TM.r3)}].forEach((t0, i) => { grow("p9" + i, t0); pop("#lb-f" + i, t0 + 0.1); draw("cv9" + i, t0 + 0.25, 0.4); X9.field(tl, "chq", t0 + 0.6, i, "filled"); });
      grow("p9x", ${t(TM.same - 0.3)}); draw("cv9x0", ${t(TM.same + 0.1)}, 0.4); draw("cv9x1", ${t(TM.same + 0.5)}, 0.4);
      X9.field(tl, "chq", ${t(TM.same + 0.9)}, 3, "bad"); pop("#lb-sod", ${t(TM.same + 1.0)}); flash("#cv9x0", ${t(TM.same + 1.0)}, 2);
      // ===== L10 硬件密钥 · 短会话 · 异地登录告警
      out("[id^=cv9], #lb-sod, [id^=lb-f]", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "flowD", 1.0);
      pop("#lb-hw", ${t(TM.hw)}); bump("#hwD2", ${t(TM.hw + 0.1)}, 1.15);
      grow("hgD", ${t(TM.sess - 0.2)}); KIT.sand(tl, "hgD", ${t(TM.sess + 0.2)}, 2.5); pop("#lb-hg", ${t(TM.sess + 0.1)});
      grow("bcD", ${t(TM.geo - 0.2)}); KIT.beacon(tl, "bcD", ${t(TM.geo + 0.1)}, 2.6, 0.6); pop("#lb-bc", ${t(TM.geo + 0.3)});
      // ===== L11 镜头左移到 B 门禁
      out("#lb-hw, #lb-hg, #lb-bc", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "gateB", 2.2, "power2.inOut");
      // ===== L12 护照翻开，三格绿勾，放大镜掠过
      cam(${t(LS[12])}, "hireB", 1.0); X13.cover(tl, "passB", ${t(LS[12] + 0.6)}, true, 0.6);
      [${t(TM.face)}, ${t(TM.docs)}, ${t(TM.loc)}].forEach((t0, i) => { pop("#ckP" + i, t0); X13.check(tl, "passB", t0 + 0.3, i, "ok"); });
      X5.fly(tl, "magB", ${t(TM.docs - 0.2)}, -90, -20, 0.9); X5.fly(tl, "magB", ${t(TM.loc + 0.8)}, 0, 0, 0.8);
      // ===== L13 离职清单立起；镜头到权限板
      out("#ckP0, #ckP1, #ckP2", ${t(LS[13] + 0.4)}); cam(${t(LS[13] + 0.3)}, "boardB", 1.2);
      grow("leave", ${t(LS[13] + 0.5)}); pop("#lb-c0", ${t(LS[13] + 0.9)}); pop("#lb-c1", ${t(LS[13] + 1.0)});
      [0, 1, 2, 3].forEach((i) => pop("#lb-k" + i, ${t(LS[13] + 1.3)} + i * 0.12));
      // ===== L14 大卡、边缘小卡逐一取下（npm 留下）
      X5.hang(tl, "rb", 0, ${t(TM.repo)}, false); out("#lb-c0", ${t(TM.repo + 0.2)});
      X5.hang(tl, "rb", 1, ${t(TM.cloud)}, false); out("#lb-c1", ${t(TM.cloud + 0.2)});
      bump("#lb-k0", ${t(TM.npm)}, 1.15);
      [[1, ${t(TM.dns)}], [2, ${t(TM.sns)}], [3, ${t(TM.ms)}]].forEach(([i, t0]) => { X5.fly(tl, "kc" + i, t0 + 0.1, i < 2 ? -60 : 60, 50, 0.6); out("#kc" + i + ", #lb-k" + i, t0 + 0.4, 0.3); });
      // ===== L15 npm 卡留在板上，权限板红虚线框（解读）
      fadeIn("#rbRed", ${t(LS[15] + 0.2)}, 0.4); flash("#lb-k0", ${t(LS[15] + 0.3)}, 3); pop("#lb-door", ${t(LS[15] + 1.4)}); pop("#ev15", ${t(LS[15] + 0.6)});
      // ===== L16 镜头拉开回 gateB；访问日志
      out("#rbRed, #lb-door, #ev15, #lb-k0", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "gateB", 1.2);
      pop("#lb-log", ${t(LS[16] + 1.0)}); pop("#logc", ${t(LS[16] + 1.4)}); draw("cvLog", ${t(LS[16] + 1.8)}, 0.6);
      // ===== L17 三行依次标红；右侧小窗 F 区告警灯闪
      [${t(TM.q0)}, ${t(TM.q1)}, ${t(TM.q2)}].forEach((t0, i) => hot("#logc-r" + i, t0));
      pop("#inset", ${t(TM.q0 + 0.3)}); flash("#insetRay", ${t(TM.q0 + 0.6)}, 6, 0.1);
      // ===== L18 第四行标红
      out("#inset", ${t(LS[18])}); hot("#logc-r3", ${t(TM.q3)});
      // ===== L19 匿名报告牌，信封投入，"不受惩罚"
      out("#logc, #cvLog, #lb-log", ${t(LS[19] - 0.1)}); grow("repB", ${t(TM.rep - 0.3)});
      fadeIn("#envRw", ${t(TM.rep + 0.4)}, 0.3); X5.fly(tl, "envR", ${t(TM.rep + 0.8)}, -20, -110, 0.8, 30); out("#envRw", ${t(TM.rep + 1.6)}, 0.3);
      pop("#lb-rep", ${t(TM.safe)});
`,
});
