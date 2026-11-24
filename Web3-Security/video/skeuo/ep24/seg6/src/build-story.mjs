// ep24/seg6「⑥ 真客服吗」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.archiveE（BRIEF）。
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
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

const R = L.world.rects;
// 段内镜头：B 客服后台 + 三个工位 + 导出摞（L1 "多少人能查到"）
const deskB = L.fit([R.ledger, R.stack, ...R.desks, ...R.agents], [300, 300, 1620, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, deskB }, ext: [X, E1, E2, E3, E4, E7, E9, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const wput = (key, o, r) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n in A[key]) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const sign = (key, o, text) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, size: 34 }));
const docS = (key, o, title, lines) => put(key, o, O.doc(o, { id: key, w: o.w, h: o.h, title, lines, standing: true }));

// 石板路 + 路面数据管（原生 SVG，压在最底层）
{
  const q = L.ROAD, P = [[q.u0, q.v0], [q.u1, q.v0], [q.u1, q.v1], [q.u0, q.v1]].map(([u, v]) => Wp(u, v).map(Math.round).join(","));
  const [p0, p1] = [Wp(q.u0, 0), Wp(q.u1, 0)].map((p) => p.map(Math.round));
  add({ u: 0, v: 0 }, `<polygon points="${P.join(" ")}" fill="#dcd8d0" stroke="#cbc5ba" stroke-width="3"/>` +
    `<line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="#2aa3c9" stroke-width="10" stroke-linecap="round" opacity="0.75"/>`, -100000);
}

// A 用户家：手机屏幕 = 社交页 / 来电页 / 已挂断 / 官方 App（本地 76×150）
const T = (x, y, s, fill, txt, wt = 700) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${wt}" fill="${fill}" font-family="Noto Sans SC, sans-serif">${txt}</text>`;
const phoneScr =
  `<rect width="76" height="150" fill="#ffffff"/><rect width="76" height="22" fill="#ece7dd"/>${T(6, 15, 10, "#6b665c", "社交主页")}` +
  `<circle cx="20" cy="42" r="11" fill="#cfc7b8"/>${T(36, 40, 9, "#1c1c1c", "name.eth")}${T(36, 52, 9, "#6b665c", "0x7a…")}` +
  `<rect x="6" y="64" width="64" height="7" rx="3.5" fill="#ddd6c9"/><rect x="6" y="78" width="48" height="7" rx="3.5" fill="#ddd6c9"/>` +
  `<g id="ph-stk" opacity="0"><rect x="3" y="28" width="70" height="30" rx="4" fill="#8f897e" transform="rotate(-4 38 43)"/>${T(14, 47, 10, "#ffffff", "已隐藏")}</g>` +
  `<g id="ph-call" opacity="0"><rect width="76" height="150" fill="#22303a"/>${T(24, 28, 10, "#a9c3cf", "来电")}${T(8, 50, 11, "#ffffff", "交易所客服")}` +
  `<circle cx="20" cy="124" r="10" fill="#e0453a"/><circle cx="56" cy="124" r="10" fill="#1f9d55"/></g>` +
  `<g id="ph-end" opacity="0"><rect width="76" height="150" fill="#9a958c"/>${T(16, 80, 12, "#ffffff", "已挂断")}</g>` +
  `<g id="ph-app" opacity="0"><rect width="76" height="150" fill="#ffffff"/><rect width="76" height="26" fill="#1d93ba"/>${T(6, 18, 10, "#ffffff", "官方 App")}` +
  `<rect x="8" y="40" width="60" height="7" rx="3.5" fill="#ddd6c9"/><rect x="8" y="110" width="60" height="26" rx="7" fill="#1d93ba"/>${T(14, 127, 10, "#ffffff", "联系客服")}</g>`;
sign("sgA", L.SIGN_A, "用户家");
put("usr", L.USER_A, O.person(L.USER_A, { id: "usr", role: "signer", scale: L.USER_A.scale }));
wput("ph", L.PHONE_A, O.phone(L.PHONE_A, { id: "ph", screen: phoneScr }));
put("mbox", L.ADDR_A, E2.addrPlate(L.ADDR_A, { id: "mbox", text: "住址" }));
put("hw", L.HW_A, O.hwWallet(L.HW_A, { id: "hw" }));
put("pcl", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pcl", scale: L.PARCEL_A.scale }));
put("sim", L.SIM_A, E22.simCard(L.SIM_A, { id: "sim", scale: L.SIM_A.scale, label: "手机号" }));
L.ENV_A.forEach((o, i) => put("envA" + i, o, O.envelope(o, { id: "envA" + i, w: o.w, h: o.h })));
docS("wl", L.WL_A, "提币白名单", ["地址 1 ✓", "地址 2 ✓"]);
put("caller", L.ATK_CALL, O.person(L.ATK_CALL, { id: "caller", role: "attacker", scale: L.ATK_CALL.scale }));
wput("book", L.MANUAL, E3.manual(L.MANUAL, { id: "book", title: "肥羊通讯录", open: true }));

// B 外包客服中心
sign("sgB", L.SIGN_B, "外包客服中心");
put("db", L.LEDGER, O.dbLedger(L.LEDGER, { id: "db", tag: "客服后台" }));
L.DESKS.forEach((o, i) => wput("dk" + i, o, O.desk(o, { id: "dk" + i })));
L.AGENTS.forEach((o, i) => put("ag" + i, o, O.person(o, { id: "ag" + i, role: "engineer", scale: o.scale })));
[0, 1, 2].forEach((i) => docS("ex" + i, { ...L.STACK_B, z: i * 6 }, "导出", ["姓名", "证件图像", "余额", "交易记录"]));
put("brb", L.BRIBE, O.envelope(L.BRIBE, { id: "brb", w: L.BRIBE.w, h: L.BRIBE.h }));
wput("lkB", L.PADLOCK_B, O.padlock(L.PADLOCK_B, { id: "lkB" }));
wput("kyB", L.KEY_B, O.key(L.KEY_B, { id: "kyB" }));
{ // 灰色虚线框"不在数据里"（VAULT_B）
  const [x, y] = at(L.VAULT_B), [w0, h0] = [290, 200];
  add(L.VAULT_B, `<rect x="${x}" y="${y}" width="${w0}" height="${h0}" rx="14" fill="none" stroke="#9a958c" stroke-width="3" stroke-dasharray="12 9"/>`, -400);
}

// C 第三方街
sign("sgC", L.SIGN_C, "第三方街");
["电商与营销库", "破产案服务商", "客服工单平台", "邮件供应商"].forEach((s, i) => sign("st" + i, L.STALL_PLATES[i], s));
L.PARCELS_C.forEach((o, i) => put("pc" + i, o, E7.parcel(o, { id: "pc" + i, scale: o.scale })));
docS("odoc", L.ORDER_DOC, "订单", ["收货地址"]);
wput("phC", L.PHONE_C, O.phone(L.PHONE_C, { id: "phC" }));
put("simC", L.SIM_C, E22.simCard(L.SIM_C, { id: "simC", scale: L.SIM_C.scale }));
docS("cdoc", L.CRED_DOC, "债权人文件", ["姓名", "地址", "邮箱", "余额"]);
wput("bkt", L.BUCKET_C, O.bucket(L.BUCKET_C, { id: "bkt" }));
docS("tdoc", L.TICKET_DOC, "工单", []);
L.LETTERS_C.forEach((o, i) => put("ltr" + i, o, E1.letter(o, { id: "ltr" + i, w: o.w, h: o.h })));
put("magC", L.MAG_C, O.magnifier(L.MAG_C, { id: "magC" }));

// D 链上广场 + 法庭
sign("sgD", L.SIGN_D, "链上广场");
wput("chD", L.CHAIN_D, O.chain(L.CHAIN_D, { id: "chD", n: 4 }));
L.ADDR_D.forEach((o, i) => wput("adD" + i, o, E2.addrPlate(o, { id: "adD" + i, text: `地址 ${i + 1}` })));
put("tlr", L.TELLER_D, E4.tellerCounter(L.TELLER_D, { id: "tlr", scale: L.TELLER_D.scale, sign: "交易所 · KYC" }));
wput("lot", L.LOTTERY_D, E2.lottery(L.LOTTERY_D, { id: "lot", plate: "混币器" }));
wput("phD", L.PHONE_D, O.phone(L.PHONE_D, { id: "phD" }));
sign("sgCt", L.SIGN_COURT, "法庭");
wput("bal", L.BALANCE, E1.balance(L.BALANCE, { id: "bal" }));
put("magD", L.MAG_COURT, O.magnifier(L.MAG_COURT, { id: "magD" }));
L.DOCS_COURT.forEach((o, i) => docS("jd" + i, o, ["判决", "上诉维持"][i], []));

// E 控制室（全景用）+ 链上档案（段首 archiveE）
sign("sgE1", L.SIGN_E1, "控制室");
wput("dkE", L.DESK_E, O.desk(L.DESK_E, { id: "dkE" }));
wput("shE", L.SHIELD_E, O.shield(L.SHIELD_E, { id: "shE" }));
wput("gtE", L.CKPT_E, O.checkpoint(L.CKPT_E, { id: "gtE" }));
put("bcE", L.BEACON_E, O.beacon(L.BEACON_E, { id: "bcE" }));
L.DOCS_E.forEach((o, i) => docS("dE" + i, o, ["合同", "泄露通知"][i], []));
sign("sgE2", L.SIGN_E2, "链上档案");
wput("chE", L.CHAIN_E, O.chain(L.CHAIN_E, { id: "chE", n: 3 }));
wput("fnl", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "fnl", inputs: ["邮箱"], output: "哈希" }));
wput("gpu", L.GPU, E2.gpuRig(L.GPU, { id: "gpu" }));
put("salt", L.SALT, X.saltShaker(L.SALT, { id: "salt", label: "盐 · 32 字节" }));
put("cmt", L.COMMIT, E9.commitBox(L.COMMIT, { id: "cmt", scale: L.COMMIT.scale }));
wput("kyE", L.KEY_E, O.key(L.KEY_E, { id: "kyE", state: "broken" }));
wput("lkE", L.PADLOCK_E, O.padlock(L.PADLOCK_E, { id: "lkE" }));
wput("rk", L.RACK_E, O.rack(L.RACK_E, { id: "rk", tag: "节点" }));

// L11 全景：整条街上的红色虚线（A 来电、B 导出、C 支管、D 连线），闪一下后换成青蓝
const g = (o) => at(o);
const LINKS = [
  [g(L.ATK_CALL), g(L.PHONE_A)],
  [g(L.LEDGER), g(L.STACK_B)],
  ...L.STALL_PLATES.map((o) => [g(L.LEDGER), g(o)]),
  ...L.ADDR_D.map((o) => [g(o), g(L.CHAIN_D)]),
];
const lines = (col) => LINKS.map(([a, b]) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${col}" stroke-width="30" stroke-dasharray="80 50" stroke-linecap="round"/>`).join("");
add({ u: 14800, v: 2000 }, S.hid("redln", lines("#e0453a")) + S.hid("cyanln", lines("#2aa3c9")), 0);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-ex", up(A.db.top, 10), "交易所", "lab-cs lab-sm");
L.AGENTS.forEach((o, i) => lb("lb-q" + i, up(A["ag" + i].top, 8), "?", "lab-grey lab-sm"));
lb("lb-full", up(A.ex2.top, 10), "完整记录", "lab-ink lab-sm");
lb("lb-who", up(A.db.top, 70), "谁能看到？", "lab-r lab-sm");
lb("lb-usr", up(A.usr.top, 8), "用户", "lab-cs lab-sm");
lb("lb-pc1", up(A.pcl.top, 8), "收件：住址", "lab-rs lab-sm");
lb("lb-pc2", up(A.pcl.top, 8), "收件：代收点", "lab-gs lab-sm");
lb("lb-e0", up(A.envA0.top, 6), "交易所邮箱", "lab-cs lab-sm", "t");
lb("lb-e1", up(A.envA1.top, -60), "电商邮箱", "lab-cs lab-sm", "t");
lb("lb-soc", up(A.ph.top, 10), `地址 · ENS ↔ 真实身份<span class="stk" id="stk"></span>`, "lab-ink lab-sm");
lb("lb-wl", up(A.wl.top, 8), "白名单已开", "lab-gs lab-sm");
lb("lb-alert", up(A.wl.top, 64), "至少几个月保持警惕", "lab-g lab-sm");
lb("lb-caller", up(A.caller.top, 8), "自称客服", "lab-r lab-sm");
lb("lb-app", up(A.ph.top, 10), "官方 App → 联系客服", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片（homeA 镜头静止 L2–L10）
const P = (o) => S.scr("homeA", o).map(Math.round);
const phT = P(A.ph.top), clT = P(A.caller.top);
const BX = clT[0] - 40;                            // 来电气泡：冒充者头顶左侧一列
const bub = ["你的名字", "你的余额", "你的工单"];
const QC = { x: 1390, y: 300, w: 440 };
const html =
  bub.map((s, i) => `<div class="bub hide" id="bb${i}" style="left:${BX - 300}px;top:${clT[1] - 130 + i * 62}px"><span class="ic">✓</span>${s}</div>`).join("") +
  `<div class="qcard hide" id="qc" style="left:${QC.x}px;top:${QC.y}px;width:${QC.w}px"><div class="qh">开头的题</div>` +
  `<div class="qb">对方说得出你的名字、余额和工单</div><div class="qb">是真客服吗</div><div class="qa hide" id="qa">不代表</div></div>` +
  `<div class="warn hide" id="ask" style="left:${phT[0] - 190}px;top:${phT[1] - 150}px">请转到安全钱包<span class="sk" id="sk"></span></div>` +
  `<div class="ok hide" id="ok1" style="left:${phT[0] - 600}px;top:${phT[1] - 90}px">交易所永远不会这样要求</div>` +
  `<div class="ok hide" id="ok2" style="left:${phT[0] - 600}px;top:${phT[1] - 20}px">也不会索要助记词</div>` +
  `<div class="leak hide" id="leak" style="left:${QC.x}px;top:${QC.y + 300}px">可能早就泄露 →</div>` +
  evt("ev-int", `数据告诉骗子 该骗谁 · 该怎么说 ${gtag("解读")}`, { color: "#9a958c" });
S.curve("cv-leak", [BX - 80, clT[1] + 60], [QC.x - 6, QC.y + 330], { color: "#e0453a" });
const css = `
  .lab-grey { background:#e7e2d8; border-color:#b9b2a5; color:#6b665c; }
  .stk { position:absolute; left:-4px; right:-4px; top:-4px; bottom:-4px; border-radius:12px; background:#8f897e; opacity:0; transform:rotate(-2deg); }
  .bub, .warn, .ok, .leak, .qcard { position:absolute; font-family:"Noto Sans SC",sans-serif; font-weight:700; border-radius:16px; box-shadow:0 6px 14px rgba(70,60,40,.12); }
  .bub { font-size:30px; padding:6px 18px; background:#ffffff; border:3px solid #1f9d55; color:#1c1c1c; white-space:nowrap; }
  .bub .ic { display:inline-block; width:34px; height:34px; line-height:34px; margin-right:10px; border-radius:50%; background:#1f9d55; color:#fff; text-align:center; font-size:22px; vertical-align:2px; }
  .qcard { background:#ffffff; border:3px solid #1c1c1c; padding:16px 22px 18px; }
  .qh { font-size:28px; color:#6b665c; margin-bottom:6px; }
  .qb { font-size:32px; color:#1c1c1c; line-height:1.35; }
  .qa { margin-top:12px; display:inline-block; font-size:40px; color:#fff; background:#e0453a; border-radius:12px; padding:2px 18px 6px; }
  .warn { font-size:32px; padding:8px 20px; background:#fde6e3; border:3px solid #e0453a; color:#c3352b; white-space:nowrap; }
  .sk { position:absolute; left:-8px; right:-8px; top:48%; height:5px; background:#e0453a; transform:rotate(-5deg); opacity:0; }
  .ok { font-size:32px; padding:8px 20px; background:#1f9d55; color:#ffffff; white-space:nowrap; }
  .leak { font-size:28px; padding:6px 18px; background:#ffffff; border:3px dashed #e0453a; color:#c3352b; white-space:nowrap; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  cdz: w("代收地址", 3), mail: w("不同的邮箱", 3), ens: w("真实身份", 4), notice: w("泄露通知", 5), wl: w("提币白名单", 5), alert: w("保持警惕", 5),
  no: w("不代表", 7), leak: w("早就泄露", 8), safe: w("安全地址", 9), seed: w("助记词", 9), hang: w("挂断", 10), app: w("官方", 10),
};
const t = (x) => f(x);
console.log("homeA phone top", phT, "caller top", clT);

S.build({
  cam0: "archiveE", sub: "说得出细节，不等于是真的",
  grid: { u0: -3900, u1: 17300, v0: -10800, v1: 10900 }, box: [-1600, -6000, 14200, 8200],   // 覆盖本段镜头 archiveE / backB / deskB / homeA / wide（含上段段尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "代收地址", d: "不是自己住址的收货点", at: w("代收地址", 3) },
    { id: "t1", t: "提币白名单", d: "只能提到事先登记过的地址", at: w("提币白名单", 5) },
  ],
  end: { title: "数据与隐私安全", line: "数据里没有密码，可它告诉骗子该骗谁、该怎么说", next: "资金追踪与事后处置", at: LS[12], nextAt: w("下一集", 12) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 交易所今天就能做一件事。
      cam(${t(LS[0])}, "backB", 2.0, "power2.inOut"); bump("#db", ${t(LS[0] + 2.0)}, 1.08, 1); pop("#lb-ex", ${t(LS[0] + 2.1)});
      // ===== L1 查一查，客服后台有多少人，能查到一条完整的用户记录。
      cam(${t(LS[1])}, "deskB", 1.0); [0, 1, 2].forEach((i) => pop("#lb-q" + i, ${t(LS[1] + 1.0)} + i * 0.25, 0.25));
      pop("#lb-full", ${t(LS[1] + 2.2)}); bump("#ex2", ${t(LS[1] + 2.2)}, 1.06, 1); pop("#lb-who", ${t(LS[1] + 3.0)});
      // ===== L2 普通用户也有几件事。
      out("#lb-ex, #lb-q0, #lb-q1, #lb-q2, #lb-full, #lb-who", ${t(LS[2] - 0.2)}, 0.2);
      cam(${t(LS[2])}, "homeA", 1.8, "power2.inOut"); pop("#lb-usr", ${t(LS[2] + 1.6)});
      // ===== L3 买硬件钱包用代收地址，交易所和电商用不同的邮箱。
      out("#lb-usr", ${t(LS[3] - 0.1)}, 0.2); pop("#lb-pc1", ${t(LS[3] + 0.2)});
      out("#lb-pc1", ${t(TM.cdz)}, 0.2); pop("#lb-pc2", ${t(TM.cdz + 0.2)});
      pop("#lb-e0", ${t(TM.mail)}); pop("#lb-e1", ${t(TM.mail + 0.3)});
      // ===== L4 不在社交媒体上，把自己的地址或 ENS 名称，和真实身份连在一起。
      out("#lb-pc2, #lb-e0, #lb-e1", ${t(LS[4] - 0.2)}, 0.2); pop("#lb-soc", ${t(LS[4] + 0.3)});
      fadeIn("#ph-stk", ${t(TM.ens + 0.4)}, 0.3); fadeIn("#stk", ${t(TM.ens + 0.4)}, 0.3);
      // ===== L5 收到交易所的泄露通知，开启提币白名单，至少几个月保持警惕。
      out("#lb-soc", ${t(LS[5] - 0.2)}, 0.2); bump("#envA0", ${t(TM.notice)}, 1.1, 1);
      bump("#wl", ${t(TM.wl)}, 1.08, 1); pop("#lb-wl", ${t(TM.wl + 0.3)}); pop("#lb-alert", ${t(TM.alert)});
      // ===== L6 回到开头的题。
      out("#lb-wl, #lb-alert", ${t(LS[6] - 0.2)}, 0.2); pop("#qc", ${t(LS[6])}, 0.35);
      fadeIn("#ph-call", ${t(LS[6] + 0.2)}, 0.3); pop("#lb-caller", ${t(LS[6] + 0.4)});
      // ===== L7 对方说得出你的名字、余额和工单，不代表他是真客服。
      [0, 1, 2].forEach((i) => pop("#bb" + i, ${t(LS[7] + 0.3)} + i * 0.45, 0.25));
      tl.to("#bb0, #bb1, #bb2", { backgroundColor: "#ece8e0", borderColor: "#b9b2a5", color: "#8f897e", duration: 0.4 }, ${t(TM.no)});
      tl.to("#bb0 .ic, #bb1 .ic, #bb2 .ic", { backgroundColor: "#b9b2a5", duration: 0.4 }, ${t(TM.no)});
      pop("#qa", ${t(TM.no + 0.2)});
      // ===== L8 这些数据，可能早就泄露了。
      draw("cv-leak", ${t(LS[8] + 0.2)}, 0.8); pop("#leak", ${t(TM.leak)});
      // ===== L9 交易所和钱包厂商，永远不会让你把资产转到安全地址，也不会索要助记词。
      out("#bb0, #bb1, #bb2", ${t(LS[9] - 0.2)}, 0.2); out("#cv-leak, #leak, #qc", ${t(TM.safe + 0.1)}, 0.2);
      pop("#ask", ${t(LS[9] + 0.3)}); fadeIn("#sk", ${t(TM.safe + 0.3)}, 0.25); pop("#ok1", ${t(TM.safe + 0.5)}); pop("#ok2", ${t(TM.seed)});
      // ===== L10 主动打来的电话、短信、邮件，说你的账户有风险，一律挂断，再从官方 App 里联系客服。
      fadeIn("#ph-end", ${t(TM.hang)}, 0.3); out("#lb-caller", ${t(TM.hang)}, 0.3); out("#caller", ${t(TM.hang + 0.2)}, 0.5);
      out("#ask, #ok1, #ok2", ${t(TM.app - 0.3)}, 0.2); fadeIn("#ph-app", ${t(TM.app)}, 0.3); pop("#lb-app", ${t(TM.app + 0.2)});
      // ===== L11 数据里没有密码，可它告诉骗子，该骗谁，该怎么说。
      out("#lb-app", ${t(LS[11] - 0.2)}, 0.2); cam(${t(LS[11])}, "wide", 1.8, "power2.inOut");
      fadeIn("#redln", ${t(LS[11] + 1.9)}, 0.3); flash("#redln", ${t(LS[11] + 2.2)}, 2);
      fadeIn("#cyanln", ${t(LS[11] + 3.0)}, 0.4); out("#redln", ${t(LS[11] + 3.0)}, 0.4);
      fadeIn("#ev-int", ${t(LS[11] + 0.8)}, 0.3);
      // ===== L12 下一集讲资金追踪与事后处置。
      out("#ev-int", ${t(LS[12] - 0.2)}, 0.2);
`,
});
