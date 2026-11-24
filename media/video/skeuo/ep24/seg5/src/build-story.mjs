// ep24/seg5「⑤ 收窄出口」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.courtD（BRIEF）。
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
// ends static on CAMS.archiveE
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：左侧留给代码卡（x 60–740），物件挤到右边
const R = L.world.rects;
const ctrlR = [R.deskE, R.shieldE, R.ckptE, R.dispatch, R.beaconE, R.sealE, ...R.docsE, R.tlock, R.keycard, R.listE, R.darkweb];
const archR = [R.chainE, R.funnel, R.gpu, R.salt, R.commit, R.keyE, R.padlockE, R.rackE];
const CAMX = { ...L.CAMS, ctrlEr: L.fit(ctrlR, [780, 270, 1840, 860], 1.4), archEr: L.fit(archR, [840, 340, 1840, 870], 1.4) };

const S = segInit(import.meta.url, { cams: CAMX, ext: [E1, E2, E3, E4, E5, E7, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1）
function putW(key, o, r, dy = 0) {
  const [gx, gy] = at(o), k = o.scale;
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const isP = (v) => Array.isArray(v) && typeof v[0] === "number";
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) {
    const v = A[key][n];
    if (isP(v)) A[key][n] = sc(v); else if (Array.isArray(v)) A[key][n] = v.map((q) => (isP(q) ? sc(q) : q));
  }
}

// ---------------------------------------------------------------- 石板路 + 数据管（原生 SVG，最底层）
{
  const P = (u, v) => at({ u, v }).map((x) => x.toFixed(1)).join(",");
  const u0 = 8200, u1 = 14800;
  add({ u: u0, v: -3000 }, `<polygon points="${P(u0, -110)} ${P(u1, -110)} ${P(u1, 110)} ${P(u0, 110)}" fill="#d9d5cd" stroke="#c9c3b8" stroke-width="2"/>
    <line x1="${P(u0, 0).split(",")[0]}" y1="${P(u0, 0).split(",")[1]}" x2="${P(u1, 0).split(",")[0]}" y2="${P(u1, 0).split(",")[1]}" stroke="#2aa3c9" stroke-width="5" opacity="0.55"/>`, -4000);
}

// ---------------------------------------------------------------- D 法庭（上段段尾 courtD 的画面）
put("sgCt", L.SIGN_COURT, E1.signBoard(L.SIGN_COURT, { id: "sgCt", style: "plate", text: "法庭" }));
putW("bal", L.BALANCE, E1.balance(L.BALANCE, { id: "bal" }));
L.DOCS_COURT.forEach((o, i) => put("dcC" + i, o, O.doc(o, { id: "dcC" + i, standing: true, w: o.w, h: o.h, title: ["判决", "上诉维持"][i] })));
putW("lot", L.LOTTERY_D, E2.lottery(L.LOTTERY_D, { id: "lot", plate: "混币器" }));
put("tlr", L.TELLER_D, E4.tellerCounter(L.TELLER_D, { id: "tlr", scale: 0.6, sign: "交易所 · KYC" }));
put("magD", L.MAG_COURT, O.magnifier(L.MAG_COURT, { id: "magD" }));

// ---------------------------------------------------------------- E 控制室
const SCR_ROW = (y, t, c = "#1c1c1c") => `<text x="10" y="${y}" font-size="15" font-weight="700" fill="${c}">${t}</text>`;
const scrRaw = `<rect width="148" height="16" fill="#ece7dd"/>${SCR_ROW(36, "证件号 1234 5678")}${SCR_ROW(58, "住址 某路 12 号")}${SCR_ROW(80, "余额 8.20 BTC")}`;
const scrMask = `<rect width="148" height="88" fill="#ffffff"/><rect width="148" height="16" fill="#2aa3c9"/>${SCR_ROW(36, "证件号 ****", "#2a7f9e")}<g id="dskE-m1">${SCR_ROW(58, "住址 ****", "#2a7f9e")}</g><g id="dskE-u1" opacity="0"><rect x="4" y="44" width="140" height="20" fill="#dff3e6"/>${SCR_ROW(58, "住址 某路 12 号", "#1f9d55")}</g>${SCR_ROW(80, "余额 ****", "#2a7f9e")}`;
put("sgE1", L.SIGN_E1, E1.signBoard(L.SIGN_E1, { id: "sgE1", style: "plate", text: "控制室" }));
putW("dskE", L.DESK_E, O.desk(L.DESK_E, { id: "dskE", screen: scrRaw, screen2: scrMask }));
putW("shE", L.SHIELD_E, O.shield(L.SHIELD_E, { id: "shE" }));
putW("ckE", L.CKPT_E, O.checkpoint(L.CKPT_E, { id: "ckE", n: "审", armUp: true }));
put("dsp", L.DISPATCH_E, E7.dispatchDesk(L.DISPATCH_E, { id: "dsp", scale: 0.6, entries: ["查询人", "时间", "对象", "理由", { text: "凌晨 · 200 人", kind: "ghost" }] }));
put("bcE", L.BEACON_E, O.beacon(L.BEACON_E, { id: "bcE" }));
putW("slE", L.SEAL_E, O.seal(L.SEAL_E, { id: "slE", text: "导出", markText: "水印", stamped: false }));
L.DOCS_E.forEach((o, i) => put("dcE" + i, o, O.doc(o, { id: "dcE" + i, standing: true, w: o.w, h: o.h, title: ["合同", "泄露通知"][i], lines: i ? ["范围", "监管", "用户"] : ["用途", "保存期限", "通知时限", "审计权"] })));
putW("tlk", L.TIMELOCK_E, E1.timeLock(L.TIMELOCK_E, { id: "tlk", frac: 1 }));
put("kcE", L.KEYCARD_E, E5.keycard(L.KEYCARD_E, { id: "kcE", scale: 0.55, role: "pauser", text: "工单" }), 0, { grow: true });
put("lstE", L.LIST_E, O.doc(L.LIST_E, { id: "lstE", standing: true, w: L.LIST_E.w, h: L.LIST_E.h, title: "数据清单", lines: ["姓名", "邮箱", "证件", "期限"] }));
{ // 暗网牌（原生 SVG）
  const [gx, gy] = at(L.DARKWEB_E);
  add(L.DARKWEB_E, `<g id="dweb"><rect x="${gx - 4}" y="${gy - 30}" width="8" height="30" fill="#6e747c"/>
    <rect x="${gx - 70}" y="${gy - 62}" width="140" height="40" rx="6" fill="#5b6068" stroke="#3d4148" stroke-width="2"/>
    <text x="${gx}" y="${gy - 34}" font-size="22" font-weight="700" fill="#e8e5df" text-anchor="middle">暗网</text></g>`);
}

// ---------------------------------------------------------------- E 链上档案
put("sgE2", L.SIGN_E2, E1.signBoard(L.SIGN_E2, { id: "sgE2", style: "plate", text: "链上档案" }));
putW("chE", L.CHAIN_E, O.chain(L.CHAIN_E, { id: "chE", n: 3 }));
putW("hfn", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "hfn", inputs: ["邮箱"], output: "哈希" }));
putW("gpu", L.GPU, E2.gpuRig(L.GPU, { id: "gpu" }));
put("salt", L.SALT, X.saltShaker(L.SALT, { id: "salt", label: "盐 · 32 字节" }));
put("cbx", L.COMMIT, E9.commitBox(L.COMMIT, { id: "cbx", scale: 0.7, name: "承诺", seal: "承诺" }));
putW("keyE", L.KEY_E, O.key(L.KEY_E, { id: "keyE" }));
putW("lkE", L.PADLOCK_E, O.padlock(L.PADLOCK_E, { id: "lkE" }));
putW("rkE", L.RACK_E, O.rack(L.RACK_E, { id: "rkE", tag: "节点" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const ICON = (inner) => `<svg width="46" height="34" viewBox="0 0 46 34" style="vertical-align:middle">${inner}<path d="M6 4L40 30M40 4L6 30" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/></svg>`;
const camIcon = ICON(`<rect x="6" y="9" width="34" height="20" rx="4" fill="#1c1c1c"/><circle cx="23" cy="19" r="6" fill="#8d939b"/><rect x="15" y="5" width="10" height="5" fill="#1c1c1c"/>`);
const usbIcon = ICON(`<rect x="8" y="12" width="22" height="12" rx="2" fill="#1c1c1c"/><rect x="30" y="14" width="10" height="8" fill="#8d939b"/>`);
// D
lb("lb-ctrl", up(A.lstE.top, 10), "数据清单", "lab-cs lab-sm");
lb("lb-mask", up(A.dskE.top, 10), "证件号 · 住址 · 余额 → ****", "lab-ink lab-sm");
lb("lb-ask", up(A.dskE.top, 70), "申请查看 · 写明原因", "lab-g lab-sm");
lb("lb-kc", up(A.kcE.top, 6), "工单权限 · 仅本单用户", "lab-gs lab-sm", "l");
lb("lb-ck", up(A.ckE.top, 6), "导出审批", "lab-cs lab-sm");
lb("lb-sl", up(A.slE.top, 6), "导出 · 带水印", "lab-cs lab-sm");
lb("lb-dsp", up(A.dsp.top, 8), "查询登记", "lab-cs lab-sm");
lb("lb-bc", up(A.bcE.top, 8), "异常告警", "lab-rs lab-sm");
lb("lb-dev", up(A.dskE.top, 10), `${camIcon} ${usbIcon} 公司管理的设备`, "lab-cs lab-sm");
lb("lb-ct", up(A.dcE0.top, 8), "合同 · 四项写明", "lab-cs lab-sm");
lb("lb-nt", up(A.dcE1.top, 8), "范围 → 监管 · 用户", "lab-cs lab-sm");
lb("lb-tl", up(A.tlk.top, 8), "提币冷却", "lab-cs lab-sm");
lb("lb-sh", up(A.shE.top, 8), "拦截异常登录", "lab-gs lab-sm");
{ const [gx, gy] = at(L.DARKWEB_E); lb("lb-dw", [gx, gy - 72], "盯住数据售卖", "lab-ink lab-sm"); }
// E 链上档案
lb("lb-ch", up(A.chE.ground, -40), "公链 · 很难删除", "lab-rs lab-sm", "t");
const B0 = A.chE.blocks[0];
lb("lb-hs", [B0[0] - 90, B0[1]], "0x9f3a…", "lab-ink lab-sm", "r");
lb("lb-hit", [B0[0] - 90, B0[1] + 56], "枚举命中", "lab-rs lab-sm", "r");
lb("lb-weak", [B0[0] - 90, B0[1] + 56], "通常不够", "lab-rs lab-sm", "r");
lb("lb-pd", [B0[0] - 90, B0[1] + 112], "个人数据", "lab-rs lab-sm", "r");
lb("lb-gpu", up(A.gpu.top, 8), "alice@… · bob@… · chen@…", "lab-r lab-sm");
lb("lb-salt", up(A.salt.top, 8), "盐 · 32 字节随机", "lab-cs lab-sm");
lb("lb-saltx", up(A.salt.top, 8), "盐已删除", "lab-rs lab-sm");
lb("lb-cbx", up(A.cbx.top, 8), "承诺还在 · 关联不到人", "lab-gs lab-sm");
lb("lb-cut", [A.salt.center[0] * 0.25 + A.cbx.center[0] * 0.75, A.salt.center[1] * 0.25 + A.cbx.center[1] * 0.75 + 30], "✕", "lab-r lab-sm", "c");
lb("lb-key", up(A.keyE.top, 8), "密钥已销毁", "lab-rs lab-sm");
lb("lb-lk", up(A.lkE.top, 8), "密文", "lab-ink lab-sm");
lb("lb-rk", up(A.rkE.top, 8), "密文还在 · 每个节点", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CL = { x: 64, y: 304, w: 600 };                        // 数据清单（L1）
const CA = { x: 60, y: 300, w: 640 };                        // 卡 A（L2–L7）
const CC = { x: 62, y: 300, w: 620 };                        // 合同（L9）
const CN = { x: 60, y: 302, w: 660 };                        // 泄露通知（L12）
const CB = { x: 60, y: 300, w: 740 };                        // 卡 B（L15–L20）
const cardL = codeCard("cl", { ...CL, head: "数据清单", tag: "示意", rows: [
  { html: "姓名 · 联系方式", chip: "⧗ 期限", chipCls: "ok" }, { html: "证件 · KYC", chip: "⧗ 期限", chipCls: "ok" },
  { html: "兴趣标签", chip: "✕ 不收", chipCls: "x" }, { html: "通讯录", chip: "✕ 不收", chipCls: "x" }] });
const cardA = codeCard("ca", { ...CA, head: "客服后台查询策略", tag: "示意", rows: [
  { html: "证件号 · 住址 · 余额：遮蔽", chip: "✓", chipCls: "ok" }, { html: "看完整字段：逐条 + 原因", chip: "✓", chipCls: "ok" },
  { html: "查询范围：仅本工单用户", chip: "✓", chipCls: "ok" }, { html: "导出：默认关 · 审批 · 水印", chip: "✓", chipCls: "ok" },
  { html: "每次查询：谁 · 何时 · 查谁 · 为什么", chip: "✓", chipCls: "ok" }] });
const cardC = codeCard("cc", { ...CC, head: "第三方合同写明", tag: "示意", rows: ["用途", "保存期限", "泄露通知时限", "审计权"] });
const cardN = codeCard("cn", { ...CN, head: "泄露通知 · 告诉用户", tag: "示意", rows: [
  { html: "可能有人冒充客服联系你" }, { html: "我们永远不会索要助记词" }, { html: "也不会让你把币转走" }] });
const cardB = codeCard("cb", { ...CB, head: "链上只存什么", tag: "示意", mono: true, rows: [
  { html: "✗ id = keccak256(email)", chip: "可枚举", chipCls: "x" },
  { html: "✓ c = keccak256(salt, rec)", chip: "承诺", chipCls: "ok" },
  { html: "  salt：32 字节 · 链下", chip: "可删除", chipCls: "ok" }] });
const html = cardL + cardA + cardC + cardN + cardB
  + kw("kw-b", `连到 <b>客服后台</b>`, { x: 70, y: 760, size: 36, accent: "#2aa3c9" })
  + kw("kw-c", `← 通往 <b>第三方街</b>`, { x: 72, y: 700, size: 36, accent: "#2aa3c9" })
  + ck("ck-raw", "原始数据 · 不给", { x: 60, y: 310, w: 520, kind: "r" })
  + ck("ck-msk", "脱敏数据 **** · 可以给", { x: 60, y: 400, w: 520, kind: "g" })
  + ck("ck-del", "业务结束 · 确认已删除", { x: 60, y: 490, w: 520, kind: "g" })
  + evt("ev-eng", `链上删除 ${gtag("工程整理 · 非法律意见")}`, { color: "#8d939b", top: 120 })
  + evt("ev-edpb", `EDPB 区块链与个人数据指南 ${gtag("监管口径")}<br>不加盐、不带密钥的哈希：公链上通常不够`, { color: "#e0453a", top: 212 });
const css = "";

// 屏幕虚线（镜头静止期间才显示）
S.curve("cv-b", S.scr("ctrlE", A.dskE.screen ?? A.dskE.top), [30, 760], { color: "#2aa3c9" });
S.curve("cv-a0", [CA.x + CA.w + 4, codeRowY(CA.y, 0)], S.scr("ctrlEr", A.dskE.screen ?? A.dskE.top), { color: "#e0453a" });
S.curve("cv-a2", [CA.x + CA.w + 4, codeRowY(CA.y, 2)], S.scr("ctrlEr", A.kcE.center), { color: "#e0453a" });
S.curve("cv-a3", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("ctrlEr", A.ckE.top), { color: "#e0453a" });
S.curve("cv-a4", [CA.x + CA.w + 4, codeRowY(CA.y, 4)], S.scr("ctrlEr", A.dsp.top), { color: "#e0453a" });
S.curve("cv-c", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("ctrlEr", A.dcE0.center), { color: "#2aa3c9" });
S.curve("cv-b0", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("archEr", A.hfn.hopper ?? A.hfn.top), { color: "#e0453a" });
S.curve("cv-b1", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], S.scr("archEr", A.cbx.top), { color: "#e0453a" });
S.curve("cv-b2", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("archEr", A.salt.center), { color: "#e0453a" });
S.curve("cv-lnk", S.scr("archEr", A.salt.center), S.scr("archEr", A.cbx.center), { color: "#2aa3c9" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  mask: w("证件号", 2), ask: w("逐条申请", 3), tk: w("当前工单", 4), exOff: w("导出", 5), wm: w("水印", 5),
  log: w("留痕", 6), alarm: w("自动告警", 7), shot: w("截屏", 8), dev: w("公司管理", 8),
  dd: w("尽调", 9), msk: w("脱敏", 10), del: w("删除", 10), scope: w("确认范围", 11), notify: w("通知", 11),
  never: w("永远不会", 12), cool: w("提币冷却", 13), login: w("异常登录", 13), dark: w("暗网", 13),
  hard: w("很难删掉", 14), hash: w("哈希", 15), enum: w("逐个", 16), match: w("对上", 16), edpb: w("EDPB", 17), weak: w("通常不够", 17),
  pd: w("个人数据", 18), salt: w("随机盐", 19), commit: w("承诺", 19), delSalt: w("删掉盐", 20), noLink: w("关联不到", 20),
  key: w("销毁密钥", 21), node: w("每个节点", 21),
};
const t = (x) => f(x);
const SD = [A.hfn.hopper[0] - A.salt.spout[0], A.hfn.hopper[1] - A.salt.spout[1]].map((x) => Math.round(x));   // 盐撒向漏斗口

S.build({
  cam0: "courtD", sub: "少存、少看、能删",
  grid: { u0: 7800, u1: 15600, v0: -3600, v1: 4200 }, box: [6900, -4600, 5700, 2700],   // 覆盖本段镜头 courtD / ctrlE / archiveE（含上段段尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "数据最小化", d: "只收集和保存必需的数据", at: w("数据最小化", 0) },
    { id: "t1", t: "尽调", d: "签约前对供应商做的安全调查", at: w("尽调", 9) },
    { id: "t2", t: "哈希", d: "把任意数据压成固定长度的指纹", at: w("哈希", 15) },
    { id: "t3", t: "盐", d: "和原文一起算哈希的随机值", at: w("盐", 19) },
    { id: "t4", t: "承诺", d: "绑定一个值又不泄露这个值", at: w("承诺", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 防守从源头开始，数据最小化。 → 右移到控制室，青蓝线连回客服后台
      cam(${t(LS[0] + 0.1)}, "ctrlE", 2.6, "power2.inOut");
      draw("cv-b", ${t(LS[0] + 2.8)}); pop("#kw-b", ${t(LS[0] + 3.0)});
      // ===== L1 只收集业务和合规必需的数据，写清每类数据保存多久。 → 数据清单卡
      out("#kw-b, #cv-b", ${t(LS[1] + 1.6)}); cam(${t(LS[1] + 1.8)}, "ctrlEr", 1.2);
      pop("#lb-ctrl", ${t(LS[1] + 2.4)}); pop("#cl", ${t(LS[1] + 2.8)});
      [0, 1, 2, 3].forEach((i) => pop("#cl-c" + i, ${t(LS[1] + 3.3)} + i * 0.3, 0.2));
      // ===== L2 客服后台默认遮蔽敏感字段 → 卡 A，屏幕变 ****
      out("#cl, #lb-ctrl", ${t(LS[2] - 0.2)}); pop("#ca", ${t(LS[2] + 0.1)});
      out("#dskE-scr", ${t(TM.mask)}, 0.4); fadeIn("#dskE-scr2", ${t(TM.mask)}, 0.4); pop("#lb-mask", ${t(TM.mask + 0.3)});
      draw("cv-a0", ${t(TM.mask + 0.4)}); hot("#ca-r0", ${t(TM.mask + 0.6)}, "#dff3e6"); pop("#ca-c0", ${t(TM.mask + 0.6)}, 0.2);
      // ===== L3 逐条申请，写明原因 → 只亮一栏
      out("#cv-a0, #lb-mask", ${t(LS[3] - 0.1)}); pop("#lb-ask", ${t(TM.ask)});
      out("#dskE-m1", ${t(TM.ask + 0.6)}, 0.3); fadeIn("#dskE-u1", ${t(TM.ask + 0.6)}, 0.3);
      hot("#ca-r1", ${t(TM.ask + 0.5)}, "#dff3e6"); pop("#ca-c1", ${t(TM.ask + 0.5)}, 0.2);
      // ===== L4 只能查当前工单的用户 → 工单权限卡
      out("#lb-ask, #dskE-u1", ${t(LS[4] - 0.1)}); fadeIn("#dskE-m1", ${t(LS[4] - 0.1)}, 0.3);
      grow("kcE", ${t(TM.tk)}); pop("#lb-kc", ${t(TM.tk + 0.4)}); draw("cv-a2", ${t(TM.tk + 0.5)});
      hot("#ca-r2", ${t(TM.tk + 0.7)}, "#dff3e6"); pop("#ca-c2", ${t(TM.tk + 0.7)}, 0.2);
      // ===== L5 导出默认关闭，审批，水印 → 道闸落下 + 盖水印
      out("#cv-a2, #lb-kc", ${t(LS[5] - 0.1)});
      KIT.arm(tl, "ckE", ${t(TM.exOff + 0.2)}, false); pop("#lb-ck", ${t(TM.exOff + 0.3)}); draw("cv-a3", ${t(TM.exOff + 0.4)});
      KIT.stamp(tl, "slE", ${t(TM.wm - 0.4)}); pop("#lb-sl", ${t(TM.wm + 0.4)});
      hot("#ca-r3", ${t(TM.wm)}, "#dff3e6"); pop("#ca-c3", ${t(TM.wm)}, 0.2);
      // ===== L6 每次敏感查询留痕 → 登记簿写入四栏
      out("#cv-a3, #lb-ck, #lb-sl", ${t(LS[6] - 0.1)}); pop("#lb-dsp", ${t(TM.log)}); draw("cv-a4", ${t(TM.log + 0.3)});
      [0, 1, 2, 3].forEach((i) => X7.entry(tl, "dsp", ${t(TM.log + 0.6)} + i * 0.7, i, 0.5));
      hot("#ca-r4", ${t(TM.log + 0.8)}, "#dff3e6"); pop("#ca-c4", ${t(TM.log + 0.8)}, 0.2);
      // ===== L7 异常查询自动告警 → 一条记录变红，告警灯旋转
      X7.entry(tl, "dsp", ${t(LS[7] + 1.0)}, 4, 0.6); KIT.led(tl, "dsp-led", ${t(LS[7] + 1.6)}, "red");
      KIT.beacon(tl, "bcE", ${t(TM.alarm - 0.2)}, 4, 1.0); pop("#lb-bc", ${t(TM.alarm)});
      // ===== L8 禁止截屏和外接存储，公司管理的设备
      out("#ca, #cv-a4, #lb-dsp, #lb-bc", ${t(LS[8] - 0.2)}); pop("#lb-dev", ${t(TM.shot)});
      // ===== L9 第三方尽调，合同写明四项
      out("#lb-dev", ${t(LS[9] - 0.1)}); pop("#cc", ${t(LS[9] + 0.3)}); pop("#kw-c", ${t(LS[9] + 0.6)});
      draw("cv-c", ${t(LS[9] + 0.9)}); pop("#lb-ct", ${t(LS[9] + 1.1)});
      [${[w("用途", 9), w("保存期限", 9), w("泄露通知", 9), w("审计权", 9)].map(f).join(", ")}].forEach((x, i) => hot("#cc-r" + i, x, "#dff3e6"));
      // ===== L10 给脱敏数据，业务结束确认删除
      out("#cc, #cv-c, #kw-c, #lb-ct", ${t(LS[10] - 0.2)});
      pop("#ck-raw", ${t(LS[10] + 0.2)}); pop("#ck-msk", ${t(TM.msk + 0.2)}); pop("#ck-del", ${t(w("业务结束", 10))});
      // ===== L11 先确认范围，按时限通知
      out("#ck-raw, #ck-msk, #ck-del", ${t(LS[11] - 0.2)}); pop("#lb-nt", ${t(TM.scope)});
      // ===== L12 告诉用户：攻击者会怎么联系，交易所永远不会做什么
      pop("#cn", ${t(LS[12] + 0.2)}); hot("#cn-r0", ${t(w("攻击者", 12))}, "#fbe3e1");
      hot("#cn-r1", ${t(TM.never)}, "#dff3e6"); hot("#cn-r2", ${t(TM.never + 0.6)}, "#dff3e6");
      // ===== L13 提币冷却、异常登录拦截、盯住暗网
      out("#cn, #lb-nt", ${t(LS[13] - 0.2)});
      X1.countdown(tl, "tlk", ${t(TM.cool)}, 1.0, 0.6); pop("#lb-tl", ${t(TM.cool)});
      pop("#lb-sh", ${t(TM.login)}); pop("#lb-dw", ${t(TM.dark)});
      // ===== L14 写上链就很难删 → 右移到链上档案
      out("#lb-tl, #lb-sh, #lb-dw", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "archEr", 2.0, "power2.inOut");
      pop("#ev-eng", ${t(LS[14] + 0.4)}); pop("#lb-ch", ${t(TM.hard)});
      // ===== L15 只存邮箱的哈希 → 卡 B，漏斗出哈希
      pop("#cb", ${t(LS[15] + 0.1)}); draw("cv-b0", ${t(LS[15] + 0.5)});
      X3.hash(tl, "hfn", ${t(TM.hash + 0.1)}); pop("#lb-hs", ${t(TM.hash + 1.7)});
      // ===== L16 常见邮箱逐个算哈希 → 枚举命中
      KIT.fans(tl, "gpu", ${t(TM.enum - 0.5)}, 4, 2); pop("#lb-gpu", ${t(TM.enum)});
      pop("#lb-hit", ${t(TM.match)}); hot("#cb-r0", ${t(TM.match)}, "#fbe3e1"); pop("#cb-c0", ${t(TM.match)}, 0.2);
      // ===== L17 EDPB：通常不够
      out("#ev-eng, #lb-hit", ${t(LS[17] - 0.1)}); pop("#ev-edpb", ${t(TM.edpb)}); pop("#lb-weak", ${t(TM.weak)});
      // ===== L18 哈希本身也算个人数据
      pop("#lb-pd", ${t(TM.pd)});
      // ===== L19 加 32 字节随机盐 → 承诺
      out("#cv-b0, #lb-gpu, #lb-weak, #lb-pd, #lb-hs, #ev-edpb", ${t(LS[19] - 0.2)});
      pop("#lb-salt", ${t(TM.salt)}); draw("cv-b2", ${t(TM.salt + 0.2)});
      X24.shake(tl, "salt", ${t(TM.salt + 0.4)}, [${SD.join(", ")}], 0.9);
      X3.hashReset(tl, "hfn", ${t(TM.salt + 1.4)}); X3.hash(tl, "hfn", ${t(TM.salt + 1.6)});
      hot("#cb-r1", ${t(TM.salt + 0.4)}, "#dff3e6"); pop("#cb-c1", ${t(TM.salt + 0.4)}, 0.2);
      hot("#cb-r2", ${t(TM.salt + 0.6)}, "#dff3e6"); pop("#cb-c2", ${t(TM.salt + 0.6)}, 0.2);
      X9.drop(tl, "cbx", ${t(TM.commit)}); draw("cv-b1", ${t(TM.commit + 0.2)});
      // ===== L20 删掉盐，承诺关联不到人（关键画面）
      out("#cv-b1, #cv-b2, #lb-salt", ${t(LS[20] - 0.1)}); draw("cv-lnk", ${t(LS[20] + 0.3)});
      X24.empty(tl, "salt", ${t(TM.delSalt)}); pop("#lb-saltx", ${t(TM.delSalt + 0.4)});
      out("#cv-lnk", ${t(TM.delSalt + 0.8)}, 0.3); pop("#lb-cut", ${t(TM.delSalt + 0.8)}); pop("#lb-cbx", ${t(TM.noLink)});
      // ===== L21 加密上链再销毁密钥，密文还在 → 回到 archiveE（下一段起点）
      out("#cb, #lb-cbx, #lb-cut, #lb-saltx, #lb-ch", ${t(LS[21] - 0.2)}); cam(${t(LS[21])}, "archiveE", 1.2);
      KIT.broke(tl, "keyE", ${t(TM.key)}, { badge: true, ghost: 0.35 }); pop("#lb-key", ${t(TM.key + 0.3)});
      pop("#lb-lk", ${t(TM.key + 0.7)}); pop("#lb-rk", ${t(Math.min(TM.node, TM.key + 1.4))});
`,
});
