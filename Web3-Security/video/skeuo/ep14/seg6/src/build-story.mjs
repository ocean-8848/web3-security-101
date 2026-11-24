// ep14/seg6「⑥ 先查这几件」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.l2F；ends static on CAMS.wide（结束卡）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：证明流水线 A → F（seg1 终点 L11、seg2 起点 L0–L1、L8、L16–L17；seg6 L0、L9–L11）
//   ruleA        A 出题台：规则文件 + 出题人 + 答题卡 + 阅卷机（seg2 L2–L3、L18 终点；seg3 起点 L0–L2、L9–L10、L17–L20 防御；seg4 起点；seg6 L1）
//   sheetA       近景：答题卡 + 阅卷机 + 规则文件 + 两个小人（seg2 L9–L15 阅卷机比喻；seg3 L3、L8）
//   bitsA        近景：5 个二进制位 + 答题卡 + 阅卷机（seg3 L4–L8 玩具例子，留左侧给代码卡 B）
//   tornA        A后 Tornado 角（seg3 L11–L16）
//   setupB       B 设置仪式：三人 + 拼图 + 种子罐 + 销毁箱 + 两把钥匙（seg2 L6；seg4 L1–L4）
//   zcashB       近景：B 的 Zcash 角（seg4 L5–L7）
//   proverC      C 证明器 + zkVM + 查找表（seg2 L4；seg4 L8–L9）
//   committeeC   近景：C 的 ZKsync 角：安全委员会 + 证明生产闸刀 + 证明器出口（seg4 L10–L11）
//   verifD       D 验证器 + L1 链 + 进料证明卡（seg1 L9；seg2 L5、L17；seg4 L12–L13、L15、L18–L19 终点；seg5 起点；seg6 L7）
//   clockD       近景：D 钟面 + 登记簿 + 验证器（seg4 L14–L17）
//   aztecE       E 近景：Aztec Connect 保险柜 + 一排证明卡 + 结算机 + 攻击者 + 点阵（seg1 起点 L0–L7；seg5 L0–L1；seg6 L6）
//   settleE      E 近景：结算机 + 32 格板 + 笔数字段（seg1 L8；seg2 L7；seg5 L2–L9；seg6 L2、L8）
//   l2F          F 观察台全景（seg5 L10–L15；seg6 起点、L3–L5）
//   stageF       近景：F Stage 台阶 + 安全委员会 + 时间锁（seg5 L16–L17 终点）
//   DE           中景：D + E（seg1 L9 从 E 往左带到 D、seg5 L0 从 D 横移到 E 的中途）
//   EF           中景：E + F + D 的 L1 链（seg5 L10 拉高看到 F 与 L1 的连线）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E12 from "../../../ep12/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

// 段内专用镜头：手机特写（L4–L5）
const CAMS = { ...L.CAMS, phoneF: L.fit([L.rect(L.PHONE_F, "phone")], [700, 300, 1120, 860], 2.4) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E5, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const pl = (key, o, text, size = 30) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, size }));
/** 不支持 opts.scale 的物件：绕地面点缩放并换算 anchors（SEGBASE 常见坑 1） */
const wput = (key, o, r, k = o.scale) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = sc(p); }
};
const pts = (arr) => arr.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
const quad = (o, u0, u1, v0, v1, z = 0) => pts([Wp(o.u + u0, o.v + v0, z), Wp(o.u + u1, o.v + v0, z), Wp(o.u + u1, o.v + v1, z), Wp(o.u + u0, o.v + v1, z)]);
/** 等距方块：顶面 + 可见的 +v 面与 −u 面 */
const box3 = (o, u0, u1, v0, v1, z0, z1, top, sv, su) => {
  const P = (u, v, z) => Wp(o.u + u, o.v + v, z);
  return `<polygon points="${pts([P(u0, v1, z0), P(u1, v1, z0), P(u1, v1, z1), P(u0, v1, z1)])}" fill="${sv}" stroke="#8d8576" stroke-width="1.5"/>`
    + `<polygon points="${pts([P(u0, v0, z0), P(u0, v1, z0), P(u0, v1, z1), P(u0, v0, z1)])}" fill="${su}" stroke="#8d8576" stroke-width="1.5"/>`
    + `<polygon points="${pts([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)])}" fill="${top}" stroke="#8d8576" stroke-width="1.5"/>`;
};
const FLOOR = -1e6;

// 地面：传送路、链下 | 链上分界、F 观察台、L1–L2 连线
const R0 = { u: 0, v: 0 };
add(R0, `<polygon points="${quad(R0, L.ROAD.from.u, L.ROAD.to.u, -70, 70)}" fill="#d9d4ca" stroke="#c3bcae" stroke-width="2"/>`
  + `<line x1="${Wp(L.ROAD.from.u, 0)[0]}" y1="${Wp(L.ROAD.from.u, 0)[1]}" x2="${Wp(L.ROAD.to.u, 0)[0]}" y2="${Wp(L.ROAD.to.u, 0)[1]}" stroke="#c9c2b4" stroke-width="2" stroke-dasharray="18 14"/>`, FLOOR);
add(L.DIVIDE, `<line x1="${at(L.DIVIDE, 0, -420)[0]}" y1="${at(L.DIVIDE, 0, -420)[1]}" x2="${at(L.DIVIDE, 0, 420)[0]}" y2="${at(L.DIVIDE, 0, 420)[1]}" stroke="#2aa3c9" stroke-width="5"/>`, FLOOR + 1);
add(L.PLATFORM, box3(L.PLATFORM, -650, 650, -400, 400, -34, 0, "#e6e0d4", "#cfc7b8", "#d8d1c3"), FLOOR + 2);
add(L.PLATFORM, `<line x1="${at(L.L2CHAIN)[0]}" y1="${at(L.L2CHAIN)[1]}" x2="${at(L.L1CHAIN)[0]}" y2="${at(L.L1CHAIN)[1]}" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 12"/>`, FLOOR + 3);
// Stage 三级台阶
L.STAGES.forEach((q, i) => add(q, box3(q, -110, 110, -90, 90, 0, 26 * (i + 1), "#f4f0e8", "#d2cabb", "#e0d9cc"), -2));
// 32 格板：只有第 1 格记账（绿），其余灰
{ const g = L.GRID32, c = 30; let s = "";
  for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) s += `<polygon points="${quad(g, -120 + k * c, -120 + (k + 1) * c - 4, -60 + r * c, -60 + (r + 1) * c - 4)}" fill="${r === 0 && k === 0 ? "#1f9d55" : "#cbc4b6"}"/>`;
  add(g, s, -300); }
// 红色点阵（每点 = 约 2 万美元）：110 + 4，L6 回到开头时淡入
{ const [gx, gy] = at(L.DOTS_E); let s = "";
  for (let i = 0; i < 110; i++) s += `<circle cx="${gx + 12 + (i % 14) * 14}" cy="${gy + (i / 14 | 0) * 14}" r="5" fill="#e0453a"/>`;
  for (let i = 0; i < 4; i++) s += `<circle cx="${gx + 230 + (i % 2) * 14}" cy="${gy + 20 + (i / 2 | 0) * 14}" r="5" fill="#e0453a"/>`;
  add(L.DOTS_E, S.hid("dots", s), 200); }

// A 出题台
pl("pa", L.PLATE_A, "电路 · 出题台");
put("rule", L.RULE, O.doc(L.RULE, { id: "rule", title: "评分规则 = 电路", lines: ["约束 1", "约束 2", "约束 3", "约束 4", "约束 5"], standing: true }));
put("sheet", L.SHEET, X.answerSheet(L.SHEET, { id: "sheet", scale: L.SHEET.scale }));
put("gm", L.GRADER, X.gradingMachine(L.GRADER, { id: "gm", title: "阅卷机" }));
put("author", L.AUTHOR, O.person(L.AUTHOR, { id: "author", role: "engineer", scale: 0.7 }));
put("patk", L.PROVER_ATK, O.person(L.PROVER_ATK, { id: "patk", state: "attacker", scale: 0.7 }));
put("bits", L.BITS, E3.byteBlock(L.BITS, { id: "bits", n: 5 }));
put("magA", L.MAG_A, O.magnifier(L.MAG_A, { id: "magA" }));
put("tagT", L.TAGS[0], E7.returnTag(L.TAGS[0], { id: "tagT", face: "ok", scale: 1 }));
put("tagF", L.TAGS[1], E7.returnTag(L.TAGS[1], { id: "tagF", face: "false", scale: 1 }), 0, { grow: true });
// A后 Tornado 角
put("merkle", L.MERKLE, E12.merkleTree(L.MERKLE, { id: "merkle", rootText: "根", scale: 0.8 }));
put("hashbook", L.HASHBOOK, E3.manual(L.HASHBOOK, { id: "hashbook", title: "哈希实现", open: true }));
put("buglist", L.BUGLIST, O.doc(L.BUGLIST, { id: "buglist", title: "公开漏洞清单", lines: ["—", "—", "—"], standing: true }));
wput("pool", L.POOL, O.safe(L.POOL, { id: "pool", gold: true }));
wput("protect", L.PROTECT, O.safe(L.PROTECT, { id: "protect", open: 105, glow: true }));
put("teamT", L.TEAM_T, O.person(L.TEAM_T, { id: "teamT", role: "engineer", scale: 0.7 }));
put("shadowT", L.SHADOW_T, O.person(L.SHADOW_T, { id: "shadowT", state: "attacker", scale: 0.7 }));
// B 设置仪式
pl("pb", L.PLATE_B, "可信设置");
put("puzzle", L.PUZZLE, E2.puzzleSet(L.PUZZLE, { id: "puzzle", assembled: false }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: 0.6 })));
put("jar", L.JAR, E2.seedJar(L.JAR, { id: "jar", label: "有毒废料", lit: true }));
put("burn", L.BURN, E6.burnBox(L.BURN, { id: "burn", plate: "销毁", scale: 0.7 }));
L.KEYS_B.forEach((q, i) => put("kb" + i, q, O.key(q, { id: "kb" + i })));
put("zdoc", L.ZDOC, O.doc(L.ZDOC, { id: "zdoc", title: "设置产物", lines: ["—", "—", "—"], standing: true }));
put("zmint", L.ZMINT, E11.mintPress(L.ZMINT, { id: "zmint", scale: 0.6 }));
// C 证明器
pl("pc", L.PLATE_C, "证明器 · 链下");
put("prover", L.PROVER, E3.contractMachine(L.PROVER, { id: "prover", name: "证明器", tone: "gray" }));
wput("zkvm", L.ZKVM, E10.coreModule(L.ZKVM, { id: "zkvm", ver: "zkVM" }));
wput("lookup", L.LOOKUP, E3.slotCabinet(L.LOOKUP, { id: "lookup", title: "查找表" }));
wput("comC", L.COMMITTEE, E5.thresholdMeter(L.COMMITTEE, { id: "comC", max: 3, th: 2, thText: "安全委员会" }));
put("pswitch", L.PSWITCH, O.knifeSwitch(L.PSWITCH, { id: "pswitch", text: "证明生产" }));
pl("divsign", L.DIVSIGN, "链下 | 链上", 22);
// D 验证器
pl("pd", L.PLATE_D, "验证器 · 链上");
put("vf", L.VERIFIER, X.gradingMachine(L.VERIFIER, { id: "vf", title: "验证器", scale: L.VERIFIER.scale }));
put("l1", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1", n: 4, title: "L1" }));
put("incard", L.INCARD, E2.proofCard(L.INCARD, { id: "incard" }));
wput("clockD", L.CLOCK_D, O.clock(L.CLOCK_D, { id: "clockD" }));
put("ledger", L.LEDGER, E7.dispatchDesk(L.LEDGER, { id: "ledger", scale: 0.8 }));
// E 结算
pl("pe", L.PLATE_E, "结算 · 业务合约");
pl("deprec", L.DEPREC, "已弃用");
put("settle", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "settle", name: "结算", tone: "light" }));
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", gold: true }));
L.ATTACKERS.forEach((q, i) => put("atk" + i, q, O.person(q, { id: "atk" + i, state: "attacker", scale: 0.7 })));
put("adminkey", L.ADMINKEY, O.key(L.ADMINKEY, { id: "adminkey", state: "broken" }));
put("ctr", L.COUNTER, E2.rollCounter(L.COUNTER, { id: "ctr", digits: 2, value: 1 }));
L.ECARDS.forEach((q, i) => put("ec" + i, q, E2.proofCard(q, { id: "ec" + i })));
put("beaconE", L.BEACON_E, O.beacon(L.BEACON_E, { id: "beaconE" }));
put("bounty", L.BOUNTY, O.doc(L.BOUNTY, { id: "bounty", title: "赏金范围", lines: ["—", "—"], standing: true }));
// F L2 观察台
pl("pf", L.PLATE_F, "L2");
wput("l2", L.L2CHAIN, O.chain(L.L2CHAIN, { id: "l2", n: 3, title: "L2" }));
put("chal", L.CHALLENGER, O.person(L.CHALLENGER, { id: "chal", role: "engineer", scale: 0.7 }));
put("magF", L.MAG_F, O.magnifier(L.MAG_F, { id: "magF" }));
put("hDays", L.HOUR_DAYS, O.hourglass(L.HOUR_DAYS, { id: "hDays" }));
put("vproof", L.VPROOF, E2.proofCard(L.VPROOF, { id: "vproof" }));
put("hHrs", L.HOUR_HRS, O.hourglass(L.HOUR_HRS, { id: "hHrs" }));
put("mode", L.MODE, O.knifeSwitch(L.MODE, { id: "mode", text: "证明模式" }));
put("rclock", L.RCLOCK, O.clock(L.RCLOCK, { id: "rclock" }));
L.STAGES.forEach((q, i) => pl("stg" + i, q, "Stage " + i, 22));
wput("meterF", L.METER_F, E5.thresholdMeter(L.METER_F, { id: "meterF", max: 3, th: 2, thText: "安全委员会" }));
put("tlk", L.TLOCK_F, E1.timeLock(L.TLOCK_F, { id: "tlk", frac: 1 }));
// 手机：屏幕四态（Stage ? → Stage 1 → 已弃用 / 取回资产 → 电路审计 / 赏金计划）
const T_ = (x, y, s, c, txt, wgt = 700) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${wgt}" fill="${c}" text-anchor="middle" font-family="Noto Sans SC, sans-serif">${txt}</text>`;
const phoneScr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="24" fill="#1d93ba"/>${T_(38, 17, 11, "#fff", "L2BEAT")}`
  + `<g id="ph-s0">${T_(38, 72, 16, "#1c1c1c", "Stage")}${T_(38, 102, 30, "#e0453a", "?")}</g>`
  + `<g id="ph-s1" opacity="0">${T_(38, 72, 16, "#1c1c1c", "Stage")}${T_(38, 104, 32, "#1f9d55", "1")}</g>`
  + `<g id="ph-s2" opacity="0"><rect x="6" y="38" width="64" height="30" rx="6" fill="#ece7dd"/>${T_(38, 59, 14, "#6b655b", "已弃用")}${T_(38, 90, 14, "#1c1c1c", "↓")}<rect x="6" y="100" width="64" height="34" rx="8" fill="#1f9d55"/>${T_(38, 122, 13, "#fff", "取回资产")}</g>`
  + `<g id="ph-s3" opacity="0">${T_(38, 52, 12, "#1c1c1c", "电路审计")}${T_(38, 76, 20, "#1f9d55", "✓")}${T_(38, 104, 12, "#1c1c1c", "赏金计划")}${T_(38, 128, 20, "#1f9d55", "✓")}</g>`;
put("phone", L.PHONE_F, O.phone(L.PHONE_F, { id: "phone", screen: phoneScr }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const ico = (c) => `<svg width="22" height="28" viewBox="0 0 22 28" style="vertical-align:-5px;margin-right:8px"><circle cx="11" cy="7" r="6" fill="${c}"/><rect x="2" y="15" width="18" height="13" rx="7" fill="${c}"/></svg>`;
lb("ro-a", up(A.author.top, 10), ico("#2aa3c9") + "写电路的人", "lab-ink lab-sm");
lb("ro-e", up(A.settle.top, 10), ico("#2aa3c9") + "写结算合约的人", "lab-ink lab-sm");
lb("ro-f", up(A.pf.top, 10), ico("#2aa3c9") + "运营 L2 / 桥", "lab-ink lab-sm");
lb("ro-u", A.phone.ground, ico("#3b3e44") + "普通用户", "lab-ink lab-sm", "l");
lb("lb-mal", up(A.sheet.top, 8), "恶意输入", "lab-rs lab-sm");
lb("lb-rej", up(A.gm.top, 8), "拒收", "lab-rs lab-sm");
lb("lb-neg", up(A.tagF.top, 8), "反测试", "lab-r lab-sm");
lb("lb-tlk", up(A.tlk.top, 8), "升级 · 时间锁", "lab-cs lab-sm");
lb("lb-emg", up(A.meterF.top, 8), "紧急权限 · 公开", "lab-cs lab-sm");
lb("lb-vf", up(A.vf.top, 10), "对这些公开输入成立", "lab-gs");
lb("lb-nb", A.ctr.ground, "笔数字段", "lab-ink lab-sm", "t");
lb("lb-pa", up(A.pa.top, 8), "电路", "lab-cs");
lb("lb-pb", up(A.pb.top, 8), "设置", "lab-cs");
lb("lb-pd", up(A.pd.top, 8), "验证器", "lab-cs");

// ---------------------------------------------------------------- 屏幕层卡片
// L2 公开输入清单（示意）→ 红线连到笔数字段
const PI = { x: 1240, y: 290, w: 580 };
const piCard = codeCard("pi", { ...PI, head: "证明的公开输入", tag: "示意", rows: [
  { html: "数量", chip: "已证明", chipCls: "ok" }, { html: "索引", chip: "已证明", chipCls: "ok" },
  { html: "长度", chip: "已证明", chipCls: "ok" }, { html: "笔数 numRealTxs", chip: "只读取 没证明", chipCls: "x" }] });
S.curve("cv-pi", [PI.x - 4, codeRowY(PI.y, 3)], S.scr("settleE", A.ctr.top), { color: "#e0453a" });
// L8 笔数字段 ↔ 证明卡：没绑定
const B0 = S.scr("settleE", up(A.ctr.top, 6)), B1 = S.scr("settleE", A.ec0.top);
S.curve("cv-bind", B0, B1, { color: "#e0453a" });
const BM = [(B0[0] + B1[0]) / 2, (B0[1] + B1[1]) / 2 - 30];
const html = piCard
  + `<div class="s6-x hide" id="nb-x" style="left:${f(BM[0])}px;top:${f(BM[1])}px">✕</div>`
  + `<div class="s6-nb hide" id="nb-t" style="left:${f(BM[0] + 34)}px;top:${f(BM[1] - 30)}px">没绑定</div>`
  + kw("kw-phone1", `在 L2BEAT 查 <b>Stage</b>`, { x: 1180, y: 380, size: 44, accent: "#1d93ba" })
  + kw("kw-phone2", `宣布弃用 → <b>及时取回</b>`, { x: 1180, y: 480, size: 44, accent: "#1f9d55" })
  + kw("kw-phone3", `<b>电路审计</b> + <b>赏金计划</b>`, { x: 1182, y: 600, size: 44, accent: "#1f9d55" })
  + kw("kw-q", `只修验证器 <b>够吗？</b>`, { x: 660, y: 150, size: 50, accent: "#e0453a" })
  + kw("kw-bug", `漏洞在 <b>业务合约</b>`, { x: 1120, y: 170, size: 50, accent: "#e0453a" })
  + kw("kw-pre", `前提：电路 · 设置 · 验证器都没出错${gtag("解读")}`, { x: 660, y: 110, size: 38, accent: "#1d93ba" })
  + kw("kw-lie", `任何一环出错 <b>有效的证明也会说谎</b>`, { x: 664, y: 196, size: 34, accent: "#e0453a" })
  + kw("kw-end", `证明对了 ≠ <b>电路对了</b> ≠ <b>钱算对了</b>`, { x: 700, y: 140, size: 52, accent: "#e0453a" });
const css = `
  .s6-x { position:absolute; transform:translate(-50%,-50%); width:52px; height:52px; border-radius:50%; background:#e0453a; color:#fff; font-size:34px; font-weight:800; display:flex; align-items:center; justify-content:center; }
  .s6-nb { position:absolute; padding:4px 14px; border-radius:10px; background:#fff; border:3px solid #e0453a; color:#c3352b; font-size:30px; font-weight:700; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  mal: w("恶意输入", 1), test: w("测试", 1),
  pin: w("公开输入", 2), read: w("只被读取", 2),
  tlk: w("时间锁", 3), emg: w("紧急权限", 3),
  stage: w("Stage", 4), dep: w("弃用", 4), take: w("取回", 4),
  audit: w("电路审计", 5), bounty: w("赏金", 5),
  q: w("只修验证器", 6), pubin: w("公开输入", 7),
  bug: w("业务合约", 8), bind: w("绑定", 8),
  c: w("电路", 9), s: w("设置", 9), v: w("验证器", 9), lie: w("任何一环", 9),
  end: w("证明对了", 10),
};
// 世界画布范围：盖住 wide 镜头可见区域（再放宽）
const W0 = S.scr("wide", [0, 0]), W1 = S.scr("wide", [1000, 1000]), kW = (W1[0] - W0[0]) / 1000;
const VIS = [(-W0[0]) / kW - 600, (-W0[1]) / kW - 600, 1920 / kW + 1200, 1080 / kW + 1200];
const cs = [[VIS[0], VIS[1]], [VIS[0] + VIS[2], VIS[1]], [VIS[0], VIS[1] + VIS[3]], [VIS[0] + VIS[2], VIS[1] + VIS[3]]].map(([x, y]) => G(x, y));
const GRID = { u0: Math.min(...cs.map((q) => q.u)), u1: Math.max(...cs.map((q) => q.u)), v0: Math.min(...cs.map((q) => q.v)), v1: Math.max(...cs.map((q) => q.v)) };
const t = (x) => f(x);

S.build({
  cam0: "l2F", sub: "证明对了，不等于钱算对了",
  grid: GRID, box: VIS,
  shown: [], css, html,
  terms: [
    { id: "t0", t: "时间锁", d: "操作公开后要等一段时间才能执行", at: w("时间锁", 3) },
    { id: "t1", t: "Stage", d: "L2BEAT 按去掉运营方后的保障分级", at: w("Stage", 4) },
  ],
  end: { title: "ZK 与证明系统安全", line: "证明对了，不等于钱算对了", next: "账户抽象与新钱包的安全", at: LS[11], nextAt: w("下一集", 11) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 具体到每个角色：F 拉到全景，四个角色浮出
      cam(${t(LS[0] + 0.1)}, "wide", 1.5);
      ["#ro-a", "#ro-e", "#ro-f", "#ro-u"].forEach((s, i) => pop(s, ${t(LS[0] + 1.3)} + i * 0.25, 0.25));
      out("#ro-a, #ro-e, #ro-f, #ro-u", ${t(LS[1] - 0.2)}, 0.2);
      // ===== L1 写电路的人：恶意输入被阅卷机红灯拒收，反测试弹出
      cam(${t(LS[1])}, "ruleA", 1.2);
      pop("#lb-mal", ${t(TM.mal - 0.2)}, 0.25); X14.sheetExtra(tl, "sheet", ${t(TM.mal - 0.1)});
      X14.card(tl, "gm", ${t(TM.mal + 0.3)}, true); X14.grade(tl, "gm", ${t(TM.mal + 0.6)}, "red", "不通过");
      X14.sheetMark(tl, "sheet", ${t(TM.mal + 1.1)}, "bad"); pop("#lb-rej", ${t(TM.mal + 1.1)}, 0.25);
      grow("tagF", ${t(TM.mal + 0.9)}); pop("#lb-neg", ${t(TM.mal + 1.3)}, 0.25);
      out("#lb-mal, #lb-rej, #lb-neg", ${t(LS[2] + 0.7)}, 0.2);   // 留到推镜途中再收，给"恶意输入 / 拒收"读的时间
      // ===== L2 写结算合约的人：公开输入清单，笔数只读取没证明 → 红线连到笔数字段
      cam(${t(LS[2])}, "settleE", 1.2);
      pop("#pi", ${t(TM.pin)}); [0, 1, 2].forEach((i) => pop("#pi-c" + i, ${t(TM.pin + 0.5)} + i * 0.3, 0.2));
      pop("#pi-c3", ${t(TM.read)}, 0.25); hot("#pi-r3", ${t(TM.read)}, "#fde3e0");
      draw("cv-pi", ${t(TM.read + 0.4)}); pop("#lb-nb", ${t(TM.read + 0.9)}, 0.25); bump("#ctr", ${t(TM.read + 1.2)}, 1.12, 2);
      out("#pi, #cv-pi, #lb-nb", ${t(LS[3] - 0.2)}, 0.2);
      // ===== L3 运营 L2 或桥的人：升级时间锁转动，安全委员会权限公开
      cam(${t(LS[3])}, "stageF", 1.4);
      pop("#lb-tlk", ${t(TM.tlk)}, 0.25); X1.countdown(tl, "tlk", ${t(TM.tlk + 0.2)}, 3, 0.35);
      pop("#lb-emg", ${t(TM.emg)}, 0.25); X5.fill(tl, "meterF", ${t(TM.emg + 0.2)}, 2, 0.8);
      out("#lb-tlk, #lb-emg", ${t(LS[4] - 0.2)}, 0.2);
      // ===== L4 普通用户：手机查 Stage → Stage 1；弃用 → 取回资产
      cam(${t(LS[4])}, "phoneF", 1.4);
      pop("#kw-phone1", ${t(TM.stage)}); out("#ph-s0", ${t(TM.stage + 0.6)}, 0.2); fadeIn("#ph-s1", ${t(TM.stage + 0.7)}, 0.3);
      out("#ph-s1", ${t(TM.dep)}, 0.2); fadeIn("#ph-s2", ${t(TM.dep + 0.1)}, 0.3); pop("#kw-phone2", ${t(TM.dep + 0.2)});
      // ===== L5 隐私 / ZK 协议：电路审计 + 赏金计划
      out("#ph-s2", ${t(TM.audit - 0.3)}, 0.2); fadeIn("#ph-s3", ${t(TM.audit - 0.2)}, 0.3); pop("#kw-phone3", ${t(TM.audit)});
      out("#kw-phone1, #kw-phone2, #kw-phone3", ${t(LS[6] - 0.2)}, 0.2);
      // ===== L6 回到开头的问题：E 保险柜 + 点阵，题卡重现
      cam(${t(LS[6])}, "aztecE", 1.4);
      fadeIn("#dots", ${t(LS[6] + 0.8)}, 0.5); pop("#kw-q", ${t(TM.q)});
      out("#kw-q, #dots", ${t(LS[7] - 0.2)}, 0.2);
      // ===== L7 不能：验证器绿灯，对这些公开输入成立
      cam(${t(LS[7])}, "verifD", 1.2);
      X14.card(tl, "vf", ${t(LS[7] + 0.9)}, true); X14.grade(tl, "vf", ${t(TM.pubin - 0.5)}, "green", "通过");
      pop("#lb-vf", ${t(TM.pubin - 0.3)}, 0.3);
      out("#lb-vf", ${t(LS[8] - 0.2)}, 0.2);
      // ===== L8 漏洞在业务合约：笔数字段与证明卡没绑定
      cam(${t(LS[8])}, "settleE", 1.2);
      pop("#kw-bug", ${t(TM.bug)}); pop("#lb-nb", ${t(TM.bug + 0.3)}, 0.25);
      draw("cv-bind", ${t(TM.bind - 2.0)}); pop("#nb-x", ${t(TM.bind - 1.2)}, 0.25); pop("#nb-t", ${t(TM.bind - 1.1)}, 0.25); bump("#ctr", ${t(TM.bind + 0.3)}, 1.12, 2);
      out("#kw-bug, #lb-nb, #cv-bind, #nb-x, #nb-t", ${t(LS[9] - 0.2)}, 0.2);
      // ===== L9 前提：电路、设置、验证器依次亮；任何一环出错
      cam(${t(LS[9])}, "wide", 1.6);
      pop("#kw-pre", ${t(TM.c - 0.2)}); pop("#lb-pa", ${t(TM.c)}, 0.25); pop("#lb-pb", ${t(TM.s)}, 0.25); pop("#lb-pd", ${t(TM.v)}, 0.25);
      pop("#kw-lie", ${t(TM.lie)});
      out("#kw-pre, #kw-lie, #lb-pa, #lb-pb, #lb-pd", ${t(LS[10] - 0.2)}, 0.2);
      // ===== L10 证明对了 ≠ 电路对了 ≠ 钱算对了
      pop("#kw-end", ${t(TM.end)});
      out("#kw-end", ${t(LS[11] - 0.2)}, 0.2);
      // ===== L11 下一集：结束卡（endCard），全景静止
`,
});
