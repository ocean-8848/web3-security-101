// ep14/seg3「③ 漏写一条」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（默认（请确认））。
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E12 from "../../../ep12/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { frameV, matStr, G } from "../../../kit/iso.mjs";
// ends static on CAMS.ruleA

// 段内镜头：A 区物件靠左，右侧留给代码卡 A；Tornado 角同理
const RA = [L.rect(L.RULE, "docStanding"), L.rect(L.SHEET, "answerSheet"), L.rect(L.GRADER, "gradingMachine"), L.rect(L.AUTHOR, "person"), L.rect(L.PROVER_ATK, "personAtk")];
const CAMX = { ...L.CAMS, codeA: L.fit(RA, [80, 300, 1180, 860], 1.4), tornR: L.fit(L.ZONE_RECTS.T, [60, 290, 1200, 860], 1.4) };
const S = segInit(import.meta.url, { cams: CAMX, ext: [X, E3, E7, E12] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const mx = (m, inner) => `<g transform="${matStr(m)}">${inner}</g>`;
const RED = "#e0453a", GRN = "#1f9d55", INK = "#1c1c1c", TEAL = "#2aa3c9";
// A 出题台
put("plA", L.PLATE_A, E1.signBoard(L.PLATE_A, { id: "plA", style: "plate", text: "电路 · 出题台", size: 30 }));
const RW = 240, RH = 260;   // 与 seg2 一致
put("rule", L.RULE, O.doc(L.RULE, { id: "rule", standing: true, w: RW, h: RH, title: "评分规则 = 电路", lines: ["约束 1", "约束 2", "约束 3", "约束 4", "约束 5"] }));
const rm = frameV(L.RULE, -RW / 2, 0, RH + 6);
add(L.RULE, S.hid("rule-miss", mx(rm, `<rect x="10" y="190" width="${RW - 20}" height="30" rx="4" fill="#fff1ef" stroke="${RED}" stroke-width="2.5" stroke-dasharray="7 5"/><text x="18" y="212" font-size="19" font-weight="700" fill="#c3352b">漏写</text><text x="${RW - 18}" y="211" text-anchor="end" font-size="16" font-weight="800" fill="${RED}">未约束</text>`)), 1);
add(L.RULE, S.hid("rule-x6", mx(rm, `<rect x="10" y="222" width="${RW - 20}" height="28" rx="4" fill="#fffdf8" stroke="${INK}" stroke-width="3.4"/><text x="18" y="242" font-size="17" font-weight="800" fill="${INK}">多加的一条</text>`)), 1);
put("sheet", L.SHEET, X.answerSheet(L.SHEET, { id: "sheet", scale: L.SHEET.scale }));
put("gm", L.GRADER, X.gradingMachine(L.GRADER, { id: "gm", title: "阅卷机" }));
put("author", L.AUTHOR, O.person(L.AUTHOR, { id: "author", role: "engineer", scale: 0.7 }));
put("atk", L.PROVER_ATK, O.person(L.PROVER_ATK, { id: "atk", role: "attacker", scale: 0.7 }));
const BH = 40, CELL = 40;
put("bits", L.BITS, E3.byteBlock(L.BITS, { id: "bits", bytes: 5, cell: CELL, h: BH, over: 1 }));
const cellTxt = (i, id, s, col) => S.hid(id, mx(frameV(L.BITS, i * CELL, 12, BH), `<text x="${CELL / 2}" y="${BH / 2 + 7}" text-anchor="middle" font-size="19" font-weight="800" fill="${col}" font-family="ui-monospace,Menlo,monospace">${s}</text>`));
add(L.BITS, [0, 1, 2, 3, 4].map((i) => cellTxt(i, "bt" + i, "b" + i, "#ffffff")).join("") + cellTxt(4, "bt30", "30", "#ffffff"), 2);
const cellTop = (i) => at({ u: L.BITS.u + (i + 0.5) * CELL, v: L.BITS.v }, 0, 0, BH);
put("mag", L.MAG_A, O.magnifier(L.MAG_A, { id: "mag" }), 0, { wrap: (s) => S.hid("mag-h", s) });
// 形式化验证小卡：规则文件和答题卡之间、偏前
const gpt = (dx, dy) => { const [X0, Y0] = at(L.SHEET); const q = G(X0 + dx, Y0 + dy); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const FVP = gpt(-135, 70);
put("fv", FVP, O.doc(FVP, { id: "fv", standing: true, w: 170, h: 110, title: "形式化验证", lines: [] }), 0, { wrap: (s) => S.hid("fv-h", s) });
const KEYP = gpt(500, -20);
put("lk", KEYP, O.key(KEYP, { id: "lk", state: "broken" }), 0, { wrap: (s) => S.hid("lk-h", s) });
put("tg0", L.TAGS[0], E7.returnTag(L.TAGS[0], { id: "tg0", face: "ok" }), 0, { wrap: (s) => S.hid("tg0-h", s) });
put("tg1", L.TAGS[1], E7.returnTag(L.TAGS[1], { id: "tg1", face: "false" }), 0, { wrap: (s) => S.hid("tg1-h", s) });

// A后 Tornado 角
put("mk", L.MERKLE, E12.merkleTree(L.MERKLE, { id: "mk", scale: 0.8, rootText: "根" }));
put("hb", L.HASHBOOK, E3.manual(L.HASHBOOK, { id: "hb", title: "哈希实现", sub: "MiMC", open: 0, pageTitle: "MiMC", pageText: "输出 out" }));
const BW = 200, BHt = 260;
put("bug", L.BUGLIST, O.doc(L.BUGLIST, { id: "bug", standing: true, w: BW, h: BHt, title: "公开漏洞清单", lines: [] }), 0, { grow: true });
const bm = frameV(L.BUGLIST, -BW / 2, 0, BHt + 6);
add(L.BUGLIST, [0, 1, 2, 3, 4, 5].map((i) => S.hid("bug-l" + i, mx(bm, `<rect x="16" y="${72 + i * 24}" width="${[150, 120, 160, 110, 140, 130][i]}" height="10" rx="4" fill="${i % 2 ? "#b8b0a1" : "#8f887b"}"/>`))).join(""), 1);
const wrapK = (o, k) => { const [gx, gy] = at(o); return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] }; };
const wp = wrapK(L.POOL, 0.7), wq = wrapK(L.PROTECT, 0.7);
put("pool", L.POOL, O.safe(L.POOL, { id: "pool", gold: true }), 0, { wrap: wp.wrap });
for (const n of ["top", "front", "center", "ground"]) if (A.pool[n]) A.pool[n] = wp.sc(A.pool[n]);
put("prot", L.PROTECT, O.safe(L.PROTECT, { id: "prot", open: 105, glow: true }), 0, { wrap: wq.wrap });
for (const n of ["top", "front", "center", "ground"]) if (A.prot[n]) A.prot[n] = wq.sc(A.prot[n]);
put("team", L.TEAM_T, O.person(L.TEAM_T, { id: "team", role: "engineer", scale: 0.7 }), 0, { grow: true });
put("shT", L.SHADOW_T, O.person(L.SHADOW_T, { id: "shT", role: "attacker", scale: 0.7 }), 0, { wrap: (s) => S.hid("shT-h", s) });
// 金色点阵（资金）：资金池前方地面，L14 搬到"保护"前方
const [px0, py0] = at(L.POOL), [qx0, qy0] = at(L.PROTECT);
const DOT0 = [px0 - 30, py0 + 62];
const gold = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) gold.push(`<circle cx="${DOT0[0] + c * 13 + r * 6}" cy="${DOT0[1] + r * 10}" r="4.6" fill="#d9a520" stroke="#a87a12" stroke-width="1"/>`);
add(L.POOL, `<g id="gold">${gold.join("")}</g>`, 120);
const GDX = qx0 - px0, GDY = qy0 - py0;

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const rTop = up(A.rule.top, 4);
lb("lb-val", [rTop[0] - 6, rTop[1]], "值：已算出", "lab-g lab-sm", "r");
lb("lb-con", [rTop[0] + 6, rTop[1]], "约束：无", "lab-rs lab-sm", "l");
const r4 = A.sheet.rows[4];
["7", "42", "999"].forEach((n, i) => lb("lb-n" + i, [r4[0] + 34, r4[1] + 2], n, "lab-r lab-sm", "l"));
lb("lb-bit01", up(at({ u: L.BITS.u + 2.5 * CELL, v: L.BITS.v }, 0, 0, BH), 12), "每一位：0 或 1 ✓", "lab-g lab-sm");
lb("lb-bit03", up(at({ u: L.BITS.u + 2 * CELL, v: L.BITS.v }, 0, 0, BH), 12), "b0–b3：0 或 1 ✓", "lab-g lab-sm");
lb("lb-b4", up(cellTop(4), 62), "b4：不再约束", "lab-rs lab-sm");
lb("lb-pass", up(A.gm.top, 6), "提款 25 通过", "lab-r");
lb("lb-dos", up(A.gm.top, 10), "拒绝服务", "lab-r");
lb("lb-lock", up(at(KEYP, 0, 0, 40), 8), "资金被锁", "lab-rs");
lb("lb-mag", up(A.mag.top, 6), "静态分析", "lab-cs lab-sm");
lb("lb-fvok", A.fv.stamp, "✓", "lab-g", "c");
lb("lb-tg0", up(A.tg0.top, 6), "正测试", "lab-g lab-sm");
lb("lb-tg1", up(A.tg1.top, 6), "反测试", "lab-r lab-sm");
lb("lb-hb", up(A.hb.page, 6), "只赋值", "lab-rs");
lb("lb-pool", up(A.pool.top, 6), "资金池", "lab-cs lab-sm");
lb("lb-steal", up(A.pool.top, 6), "本可以取走", "lab-rs lab-sm");
lb("lb-prot", up(A.prot.top, 6), "保护", "lab-g lab-sm");
lb("lb-team", up(A.team.top, 6), "团队 · 项目方称", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1240, y: 300, w: 620 };
const cardA = codeCard("ca", { ...CA, mono: true, rowHide: true, head: "Circom 两种写法", tag: "示意", rows: [
  { html: `<span style="color:#8f887b">// ✗ out 只被赋值，没有约束</span>` },
  { html: `<span style="color:${RED}">out &lt;-- in * in;</span>`, chip: "只赋值", chipCls: "x" },
  { html: `<span style="color:#8f887b">// ✓ 赋值，同时约束</span>` },
  { html: `out &lt;== in * in;`, chip: "有约束", chipCls: "ok" },
] });
S.curve("cvA", [CA.x - 4, codeRowY(CA.y, 1)], S.scr("codeA", r4), { color: RED });
S.curve("cvA2", [CA.x - 4, codeRowY(CA.y, 1)], S.scr("tornR", up(A.hb.page, 2)), { color: RED });
const CB = { x: 60, y: 300, w: 580 };
const cardB = codeCard("cb", { ...CB, mono: true, rowHide: true, head: "玩具电路：位分解", tag: "教学例子 · 模 97", rows: [
  { html: `r = 20 − 25  <span style="color:#8f887b">// = 92</span>` },
  { html: `r = b0+2·b1+4·b2+8·b3+16·b4` },
  { html: `b0 … b3 只能是 0 或 1` },
  { html: `b4 只能是 0 或 1`, chip: "去掉", chipCls: "x" },
  { html: `<span style="color:${RED}">b4=30：16×30=480≡92</span>`, chip: "成立", chipCls: "x" },
] });
S.curve("cvB", [CB.x + CB.w + 4, codeRowY(CB.y, 3)], S.scr("bitsA", up(cellTop(4), 4)), { color: RED });
const toy = `<div class="s3-toy hide" id="toy">余额 <b>20</b><span class="s3-sep"></span>提款 <b style="color:${RED}">25</b>${gtag("教学例子")}</div>`;
const wrap = `<div class="s3-wrap hide" id="wrapc"><svg width="64" height="64" viewBox="0 0 64 64"><path d="M50 18A22 22 0 1 0 54 38" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round"/><path d="M42 12L52 18L44 27" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>数到 97 绕回 0</span>${gtag("域：模 97")}</div>`;
const evTC = evt("ev-tc", `Tornado Cash · 2019 年<span id="ev-ok" style="opacity:0;color:${GRN}"> · 没有资金被盗</span>`);
const srcT = evt("src-tob", `来源：Trail of Bits 介绍`, { top: 200, color: "#8f887b" });
const src0 = evt("src-0x", `来源：0xPARC zk-bug-tracker`, { top: 204, color: "#8f887b" });
const html = cardA + cardB + toy + wrap + evTC + srcT + src0
  + kw("kw-under", "约束<b>不足</b>", { x: 700, y: 130, accent: RED })
  + kw("kw-over", "过度<b>约束</b>", { x: 704, y: 134, accent: RED })
  + kw("kw-def", "<b>防御</b> · 三条", { x: 708, y: 138, accent: GRN });
const css = `
  .s3-toy { position:absolute; left:64px; top:310px; background:#fff; border-radius:16px; padding:14px 24px; font-size:38px; font-weight:900; box-shadow:0 10px 24px rgba(70,60,40,.12); white-space:nowrap; }
  .s3-toy .s3-sep { display:inline-block; width:28px; }
  .s3-wrap { position:absolute; left:60px; top:676px; background:#fff; border-radius:16px; padding:8px 20px; font-size:30px; font-weight:900; display:flex; align-items:center; gap:12px; box-shadow:0 10px 24px rgba(70,60,40,.12); white-space:nowrap; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  val: w("算出来", 1), con: w("没有被约束", 1),
  only: w("只赋值", 2), other: w("另一种写法", 2),
  any: Math.min(w("填任何值", 3), LS[4] - 2.0),
  bits: w("二进制位", 5), b01: w("0 或 1", 5),
  drop: w("去掉", 6), fill30: w("填成 30", 6),
  wrapc: w("绕回去", 7), holds: w("照样成立", 7),
  pass: w("通过了验证", 8),
  dos: w("拒绝服务", 10), lock: w("锁住", 10),
  tob: w("Trail of Bits", 12), only2: w("只被赋值", 12),
  forge: w("伪造", 13), take: w("取走", 13),
  move: w("转走", 14), fix: w("修复", 14),
  list: w("公开漏洞清单", 16),
  sa: w("静态分析", 18), fvt: w("形式化验证", 19),
  both: w("正反", 20), bad: w("恶意", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "ruleA", sub: "算出来了，却没有被约束",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "Circom", d: "一种编写 ZK 电路的编程语言", at: w("Circom", 2) },
    { id: "t1", t: "信号", d: "电路里的一个变量", at: w("信号", 3) },
    { id: "t2", t: "Merkle 根", d: "把一组数据压成一个值的树根", at: w("Merkle 根", 13) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#bits-over", { opacity: 0 }, 0);
      // 接 seg2 末帧：规则第 5 行"漏写"、答题卡第 5 行 4 格全涂、阅卷机绿灯 + 绿勾；第一次运镜时复位
      tl.set("#rule-miss", { opacity: 1 }, 0); X14.sheetExtra(tl, "sheet", 0, true, 0); X14.sheetMark(tl, "sheet", 0, "ok"); X14.lamp(tl, "gm", 0, "green"); X14.scr(tl, "gm", 0, "通过");
      X14.sheetExtra(tl, "sheet", ${t(LS[2] + 0.2)}, false, 0); X14.sheetMark(tl, "sheet", ${t(LS[2] + 0.2)}, "none"); X14.lamp(tl, "gm", ${t(LS[2] + 0.2)}, "off"); X14.scr(tl, "gm", ${t(LS[2] + 0.2)}, "");
      // A后 Tornado 角只在 L11–L16 出现（其余时间它在 A 的镜头上沿露出）
      tl.set("#pool, #prot, #gold, #mk, #hb, #bug, #team", { opacity: 0 }, 0);
      fadeIn("#pool, #prot, #gold, #mk, #hb, #bug, #team", ${t(LS[11] - 0.3)}, 0.5); out("#pool, #prot, #gold, #mk, #hb, #bug, #team", ${t(LS[17] + 0.3)}, 0.5);
      // ===== L0 电路最常见的漏洞，叫约束不足。
      pop("#kw-under", ${t(LS[0] + 0.5)});
      // ===== L1 某个值被算出来了，却没有被约束。
      pop("#lb-val", ${t(TM.val)}, 0.25); pop("#lb-con", ${t(TM.con)}, 0.25); flash("#rule-miss", ${t(TM.con + 0.2)}, 2, 0.3);
      // ===== L2 Circom 两种写法：卡 A，第 2 行红
      out("#kw-under, #lb-val, #lb-con", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "codeA", 1.2);
      pop("#ca", ${t(LS[2] + 0.9)}); pop("#ca-r0", ${t(TM.only - 0.3)}, 0.25); pop("#ca-r1", ${t(TM.only)}, 0.25); pop("#ca-c1", ${t(TM.only + 0.4)}, 0.2);
      hot("#ca-r1", ${t(TM.only + 0.4)});
      pop("#ca-r2", ${t(TM.other)}, 0.25); pop("#ca-r3", ${t(TM.other + 0.4)}, 0.25); pop("#ca-c3", ${t(TM.other + 0.9)}, 0.2);
      // ===== L3 恶意证明者反复改填那一格
      draw("cvA", ${t(LS[3] + 0.2)}); bump("#atk", ${t(TM.any - 0.4)}, 1.08, 1);
      [0, 1, 2].forEach((i) => { pop("#lb-n" + i, ${t(TM.any)} + i * 0.7, 0.2); if (i < 2) out("#lb-n" + i, ${t(TM.any)} + i * 0.7 + 0.55, 0.15); });
      X14.sheetRow(tl, "sheet", ${t(TM.any)}, 4, false); X14.sheetRow(tl, "sheet", ${t(TM.any + 0.7)}, 4, true); X14.sheetRow(tl, "sheet", ${t(TM.any + 1.4)}, 4, false); X14.sheetRow(tl, "sheet", ${t(TM.any + 2.1)}, 4, true);
      // ===== L4 玩具例子：余额 20、提款 25
      out("#ca, #cvA, #lb-n2", ${t(LS[4] - 0.2)}); out("#rule-miss", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "bitsA", 1.2);
      pop("#toy", ${t(w("余额", 4))});
      // ===== L5 5 个二进制位，每一位 0 或 1；卡 B 第 1–4 行
      out("#toy", ${t(LS[5] - 0.2)}); pop("#cb", ${t(LS[5])}); [0, 1, 2, 3].forEach((i) => pop("#cb-r" + i, ${t(LS[5] + 0.4)} + i * 0.35, 0.25));
      [0, 1, 2, 3, 4].forEach((i) => fadeIn("#bt" + i, ${t(TM.bits)} + i * 0.15, 0.2)); pop("#lb-bit01", ${t(TM.b01)}, 0.25);
      // ===== L6 去掉最高位这一条，填 30
      out("#lb-bit01", ${t(TM.drop - 0.1)}); pop("#lb-bit03", ${t(TM.drop)}, 0.25); pop("#lb-b4", ${t(TM.drop + 0.2)}, 0.25);
      pop("#cb-c3", ${t(TM.drop + 0.2)}, 0.2); hot("#cb-r3", ${t(TM.drop + 0.2)}); draw("cvB", ${t(TM.drop + 0.4)});
      bump("#atk", ${t(TM.fill30 - 0.4)}, 1.08, 1); out("#bt4", ${t(TM.fill30)}); fadeIn("#bits-over", ${t(TM.fill30)}, 0.3); fadeIn("#bt30", ${t(TM.fill30 + 0.1)}, 0.3);
      // ===== L7 绕回去，等式照样成立
      pop("#wrapc", ${t(TM.wrapc)}); pop("#cb-r4", ${t(TM.holds - 0.3)}, 0.25); pop("#cb-c4", ${t(TM.holds + 0.3)}, 0.2);
      // ===== L8 提款 25 通过验证
      X14.sheetExtra(tl, "sheet", ${t(LS[8])}, true); X14.card(tl, "gm", ${t(LS[8] + 0.6)}, true, 0.4); X14.grade(tl, "gm", ${t(TM.pass - 0.3)}, "green");
      X14.sheetMark(tl, "sheet", ${t(TM.pass + 0.3)}, "ok"); pop("#lb-pass", ${t(TM.pass)});
      // ===== L9 过度约束：回到 A，规则多出一条
      out("#cb, #cvB, #wrapc, #lb-bit03, #lb-b4, #lb-pass", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "ruleA", 1.2);
      X14.sheetExtra(tl, "sheet", ${t(LS[9] + 0.3)}, false); X14.sheetMark(tl, "sheet", ${t(LS[9] + 0.3)}, "none"); X14.lamp(tl, "gm", ${t(LS[9] + 0.3)}, "off"); X14.scr(tl, "gm", ${t(LS[9] + 0.3)}, "");
      pop("#kw-over", ${t(w("过度约束", 9))}); fadeIn("#rule-x6", ${t(w("太严", 9))}, 0.3);
      // ===== L10 合法输入证明不了，拒绝服务，资金被锁
      bump("#author", ${t(LS[10])}, 1.08, 1); X14.card(tl, "gm", ${t(LS[10] + 0.3)}, true, 0.4); X14.grade(tl, "gm", ${t(LS[10] + 1.0)}, "red");
      pop("#lb-dos", ${t(TM.dos)}); fadeIn("#lk-h", ${t(TM.lock - 0.5)}, 0.3); pop("#lb-lock", ${t(TM.lock)});
      // ===== L11 2019 年：去 A后 Tornado 角
      out("#kw-over, #lb-dos, #lb-lock, #lk-h", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "tornR", 1.4); pop("#ev-tc", ${t(LS[11] + 1.0)});
      pop("#lb-pool", ${t(LS[11] + 1.2)}, 0.25);
      // ===== L12 哈希实现里一个输出只被赋值
      pop("#src-tob", ${t(TM.tob)}); X3.book(tl, "hb", ${t(LS[12] + 1.2)}, 170, 0.9);
      tl.set("#ca-c3, #ca-r2, #ca-r3", { opacity: 0.35 }, ${t(LS[12])}); pop("#ca", ${t(TM.only2 - 1.2)});
      pop("#lb-hb", ${t(TM.only2)}); draw("cvA2", ${t(TM.only2 + 0.3)});
      // ===== L13 本可以伪造 Merkle 根
      out("#ca, #cvA2, #src-tob", ${t(LS[13] - 0.2)});
      X12.leaf(tl, "mk", ${t(TM.forge - 0.3)}, true); X12.pathTone(tl, "mk", ${t(TM.forge - 0.3)}, "red", 0.1); X12.path(tl, "mk", ${t(TM.forge)}, true, 0.8); X12.rootText(tl, "mk", ${t(TM.forge + 0.8)}, "伪造", "red");
      tl.to("#shT-h", { opacity: 0.55, duration: 0.4 }, ${t(TM.take - 0.6)}); out("#lb-pool", ${t(TM.take - 0.2)}); pop("#lb-steal", ${t(TM.take)});
      // ===== L14 团队抢先转走保护
      out("#lb-steal", ${t(LS[14] - 0.2)}); tl.to("#shT-h", { opacity: 0, duration: 0.3 }, ${t(LS[14] - 0.2)});
      pop("#lb-pool", ${t(LS[14])}, 0.25); grow("team", ${t(LS[14])}); pop("#lb-team", ${t(LS[14] + 0.5)});
      tl.to("#gold", { x: ${GDX}, y: ${GDY}, duration: 1.4, ease: "power2.inOut" }, ${t(TM.move)}); pop("#lb-prot", ${t(TM.move + 1.2)});
      // ===== L15 没有资金被盗
      tl.to("#ev-ok", { opacity: 1, duration: 0.3 }, ${t(LS[15])});
      // ===== L16 公开漏洞清单
      grow("bug", ${t(LS[16] + 0.3)}); pop("#src-0x", ${t(TM.list)});
      [0, 1, 2, 3, 4, 5].forEach((i) => fadeIn("#bug-l" + i, ${t(TM.list + 0.4)} + i * 0.4, 0.2));
      // ===== L17 防御三条：回到 A
      out("#ev-tc, #src-0x, #lb-pool, #lb-prot, #lb-team, #lb-hb", ${t(LS[17] - 0.2)}); cam(${t(LS[17] - 0.1)}, "ruleA", 1.2);
      out("#rule-x6", ${t(LS[17])}); X14.lamp(tl, "gm", ${t(LS[17])}, "off"); X14.scr(tl, "gm", ${t(LS[17])}, ""); pop("#kw-def", ${t(LS[17] + 0.5)});
      // ===== L18 静态分析：放大镜停在缺的那一行
      tl.fromTo("#mag-h", { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, ${t(TM.sa)});
      pop("#lb-mag", ${t(TM.sa + 0.6)}); fadeIn("#rule-miss", ${t(TM.sa + 1.0)}, 0.2); flash("#rule-miss", ${t(TM.sa + 1.3)}, 3, 0.2);
      // ===== L19 形式化验证
      fadeIn("#fv-h", ${t(TM.fvt - 0.2)}, 0.3); pop("#lb-fvok", ${t(TM.fvt + 0.8)});
      // ===== L20 正反测试，恶意输入被拒
      fadeIn("#tg0-h", ${t(TM.both)}, 0.3); pop("#lb-tg0", ${t(TM.both + 0.2)}, 0.25); fadeIn("#tg1-h", ${t(TM.both + 0.5)}, 0.3); pop("#lb-tg1", ${t(TM.both + 0.7)}, 0.25);
      X14.sheetExtra(tl, "sheet", ${t(TM.bad)}, true); X14.card(tl, "gm", ${t(TM.bad + 0.6)}, true, 0.4); X14.grade(tl, "gm", ${t(TM.bad + 1.1)}, "red");
      X14.sheetMark(tl, "sheet", ${t(TM.bad + 1.7)}, "bad");
`,
});
