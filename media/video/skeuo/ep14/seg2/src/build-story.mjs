// ep14/seg2「② 阅卷机」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.ruleA

// 段内镜头：规则文件 + 向上拉长的约束长条（L14–L15）
const RW = 240, RH = 260;
const rr = L.rect(L.RULE, "docStanding");
const stripA = L.fit([[rr[0], rr[1] - 470, rr[2] + 40, rr[3]], L.rect(L.SHEET, "answerSheet"), L.rect(L.GRADER, "gradingMachine"),
  L.rect(L.AUTHOR, "person"), L.rect(L.PROVER_ATK, "personAtk")], [360, 200, 1600, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, stripA }, ext: [E1, E2, E3, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (u, v, z = 0) => Wp(u, v, z);
const pp = (arr) => arr.map((q) => `${f(q[0])},${f(q[1])}`).join(" ");
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];

// ---------------------------------------------------------------- 地面：传送路、分界线、F 观察台（原生 SVG）
{
  const { from: R0, to: R1, halfWidth: hw } = L.ROAD;
  let s = `<polygon points="${pp([P(R0.u, -hw), P(R1.u, -hw), P(R1.u, hw), P(R0.u, hw)])}" fill="#dcd6cb" stroke="#c2baac" stroke-width="3"/>`;
  for (let u = R0.u + 200; u < R1.u; u += 200) s += `<line x1="${f(P(u, -hw)[0])}" y1="${f(P(u, -hw)[1])}" x2="${f(P(u, hw)[0])}" y2="${f(P(u, hw)[1])}" stroke="#c9c2b5" stroke-width="2"/>`;
  add(R0, s, -6000);
  const D = L.DIVIDE;
  add(D, `<line x1="${f(P(D.u, -300)[0])}" y1="${f(P(D.u, -300)[1])}" x2="${f(P(D.u, 300)[0])}" y2="${f(P(D.u, 300)[1])}" stroke="#2aa3c9" stroke-width="6" stroke-linecap="round"/>`, -5900);
  // 贯穿五区的青蓝虚线（L8）
  add(R0, S.hid("flow", `<polyline points="${pp([P(-200, 0), P(5400, 0)])}" fill="none" stroke="#2aa3c9" stroke-width="16" stroke-dasharray="40 30" stroke-linecap="round"/>`), -5800);
  // F 观察台：抬高一级的石板
  const F = L.PLATFORM, u0 = F.u - 900, u1 = F.u + 900, v0 = F.v - 450, v1 = F.v + 450, h = 40;
  const top = [P(u0, v0, h), P(u1, v0, h), P(u1, v1, h), P(u0, v1, h)];
  add(F, `<polygon points="${pp([P(u0, v1), P(u1, v1), P(u1, v1, h), P(u0, v1, h)])}" fill="#cfc8bb" stroke="#b5ad9f" stroke-width="2"/>`
    + `<polygon points="${pp([P(u0, v0), P(u0, v1), P(u0, v1, h), P(u0, v0, h)])}" fill="#d8d1c5" stroke="#b5ad9f" stroke-width="2"/>`
    + `<polygon points="${pp(top)}" fill="#e6e0d5" stroke="#b5ad9f" stroke-width="2"/>`, -1200);
}

// ---------------------------------------------------------------- 世界物件
const plate = (key, o, text, size = 30) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, size }));
// A 出题台
plate("plA", L.PLATE_A, "电路 · 出题台");
put("rule", L.RULE, O.doc(L.RULE, { id: "rule", standing: true, title: "评分规则 = 电路", lines: [], w: RW, h: RH }));
put("sheet", L.SHEET, X.answerSheet(L.SHEET, { id: "sheet", scale: 1.2, blank: true }));
put("gm", L.GRADER, X.gradingMachine(L.GRADER, { id: "gm", title: "阅卷机" }));
put("author", L.AUTHOR, O.person(L.AUTHOR, { id: "author", role: "engineer", scale: 0.7 }));
put("atk", L.PROVER_ATK, O.person(L.PROVER_ATK, { id: "atk", role: "attacker", scale: 0.7 }));
// B 设置仪式
plate("plB", L.PLATE_B, "可信设置");
put("pz", L.PUZZLE, E2.puzzleSet(L.PUZZLE, { id: "pz", glow: true }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: 0.6 })));
L.KEYS_B.forEach((q, i) => put("k" + i, q, O.key(q, { id: "k" + i }), 0, { grow: true }));
// C 证明器
plate("plC", L.PLATE_C, "证明器 · 链下");
put("pv", L.PROVER, E3.contractMachine(L.PROVER, { id: "pv", name: "证明器", tone: "gray" }));
plate("dvs", L.DIVSIGN, "链下 | 链上", 22);
// D 验证器
plate("plD", L.PLATE_D, "验证器 · 链上");
put("vf", L.VERIFIER, X.gradingMachine(L.VERIFIER, { id: "vf", title: "验证器", scale: 1.2 }));
put("l1", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1", n: 4, title: "L1" }));
// E 结算
plate("plE", L.PLATE_E, "结算 · 业务合约");
put("st", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "st", name: "结算", tone: "light" }));
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", gold: true }));
// F
plate("plF", L.PLATE_F, "L2");
// 证明卡：C 出口吐出 → 沿路送进 D 验证器；E 另一张进结算机
const CC = { u: L.PROVER.u + 40, v: 190 };
put("pcC", CC, E2.proofCard(CC, { id: "pcC" }), 0, { wrap: (s) => `<g id="pcC-mv" opacity="0">${s}</g>` });
const EC = L.ECARDS[0];
put("pcE", EC, E2.proofCard(EC, { id: "pcE" }), 0, { wrap: (s) => `<g id="pcE-mv" opacity="0">${s}</g>` });
const d1 = sub(P(L.INCARD.u, L.INCARD.v), P(CC.u, CC.v));
const d2 = sub(A.vf.slot, P(CC.u, CC.v));
const d3 = sub(A.st.slot, P(EC.u, EC.v));

// 规则文件正面的覆盖层：5 行约束、绿勾、漏写框、向上拉长的长条
{
  const [ox, oy] = at(L.RULE, -RW / 2, 0, RH + 6), U = sub(P(1, 0), P(0, 0)), CE = P(0, 0, -1)[1] - P(0, 0)[1];
  const face = (c) => `<g transform="matrix(${U[0]},${U[1]},0,${CE},${f(ox)},${f(oy)})">${c}</g>`;
  const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-family="'Noto Sans SC','PingFang SC',sans-serif" font-weight="700" font-size="${o.size ?? 19}" fill="${o.fill ?? "#4a463f"}">${t}</text>`;
  let c = "";
  for (let i = 0; i < 5; i++) {
    c += `<g id="rl${i}" opacity="0">${T(18, 92 + i * 30, `约束 ${i + 1}`)}</g>`;
    c += `<g id="rk${i}" opacity="0">${T(RW - 52, 93 + i * 30, "✓", { size: 24, fill: "#1f9d55" })}</g>`;
  }
  c += `<g id="rmiss" opacity="0"><rect x="10" y="${92 + 4 * 30 - 22}" width="${RW - 20}" height="30" rx="4" fill="#fff1ef" stroke="#e0453a" stroke-width="2.5" stroke-dasharray="7 5"/>${T(18, 92 + 4 * 30, "漏写", { fill: "#c3352b" })}</g>`;
  let st = `<rect x="0" y="-500" width="${RW}" height="500" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.6"/>`;
  for (let i = 0; i < 34; i++) st += `<rect class="sbar" opacity="0" x="16" y="${-18 - i * 14.4}" width="${[150, 120, 176, 98, 140, 164][i % 6]}" height="5" rx="2" fill="#6d685e"/>`;
  st += `<rect id="seam" opacity="0" x="10" y="${-18 - 21 * 14.4 - 3}" width="${RW - 20}" height="9" rx="2" fill="#e0453a"/>`;
  c += `<g id="strip" opacity="0">${st}</g>`;
  add(L.RULE, face(c), 3);
  // 红虚线：规则 5 行 → 答题卡 5 行（L10）
  let k = "";
  for (let i = 0; i < 5; i++) {
    const a0 = at(L.RULE, -RW / 2 + RW - 8, 0, RH + 6 - (85 + i * 30)), b0 = A.sheet.rows[i];
    k += `<line id="lk${i}" x1="${f(a0[0])}" y1="${f(a0[1])}" x2="${f(b0[0] - 30)}" y2="${f(b0[1])}" stroke="#e0453a" stroke-width="2.6" stroke-dasharray="9 7" stroke-linecap="round"/>`;
  }
  add(L.SHEET, S.hid("links", k), 400);
}
const ruleAt = (x, y) => at(L.RULE, -RW / 2 + x, 0, RH + 6 - y);   // 规则文件正面的局部点

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-off", up(A.pv.top, 10), "链下", "lab-cs lab-sm");
lb("lb-on", up(A.vf.top, 10), "链上", "lab-cs lab-sm");
lb("lb-k0", up(A.k0.top, 8), "证明密钥", "lab-cs lab-sm", "r");
lb("lb-k1", up(A.k1.top, 8), "验证密钥", "lab-cs lab-sm", "l");
lb("lb-pub", up(A.pcE.top, 8), "公开输入", "lab-cs lab-sm");
const ZN = ["电路", "设置", "证明器", "验证器", "结算"], ZP = [A.rule.top, A.pz.top, A.pv.top, A.vf.top, A.st.top];
ZN.forEach((n, i) => { lb("z" + i, up(ZP[i], 30), n, "lab-cs lab-sm"); lb("zr" + i, up(ZP[i], 30), n, "lab-rs lab-sm"); });
lb("lb-meta", up(A.gm.top, 24), "比喻", "lab-g lab-sm");
lb("lb-author", [A.author.center[0] - 34, A.author.center[1]], "出题人", "lab-cs lab-sm", "r");
lb("lb-atk", up(A.atk.top, 6), "考生", "lab-rs lab-sm");
lb("lb-miss", [at(L.RULE)[0], at(L.RULE)[1] + 14], "漏写：第 5 题只能涂一格", "lab-rs lab-sm", "t");
lb("lb-judged", [A.sheet.mark[0] + 26, A.sheet.mark[1]], "照样判对", "lab-r lab-sm", "l");
lb("lb-ok", up(A.gm.top, 24), "机器正常", "lab-gs lab-sm");
lb("lb-gap", ruleAt(-14, 150), "规则漏了", "lab-rs lab-sm", "r");
lb("lb-notlike", ruleAt(-14, -250), "比喻不成立处", "lab-g lab-sm", "r");
lb("lb-au", ruleAt(RW + 24, -420), "审计", "lab-cs lab-sm", "l");
lb("lb-fv", ruleAt(RW + 24, -300), "形式化验证", "lab-cs lab-sm", "l");
lb("lb-te", ruleAt(RW + 24, -180), "测试", "lab-cs lab-sm", "l");
lb("lb-vf2", up(A.vf.top, 30), "验证器", "lab-gs lab-sm");
lb("lb-rule2", up(A.rule.top, 10), "评分规则", "lab-cs lab-sm");
// L17 红虚线：验证器 → 评分规则（全景下屏幕层），中点标"不检查这里"
const W0 = S.CAMS.wide, P0 = S.scr("wide", up(A.vf.top, 60)), P3 = S.scr("wide", up(A.rule.top, 60));
const C1 = [P0[0] - 120, P0[1] - 250], C2 = [P3[0] + 220, P3[1] - 280];
S.curve("cv-nc", P0, P3, { color: "#e0453a", c1: C1, c2: C2 });
const MID = [0, 1].map((j) => (P0[j] + 3 * C1[j] + 3 * C2[j] + P3[j]) / 8);
lb("lb-nc", [(MID[0] - W0.x) / W0.scale, (MID[1] - W0.y) / W0.scale], "不检查这里", "lab-r lab-sm", "b");

// ---------------------------------------------------------------- 屏幕层卡片
const html = kw("kw-def", `零知识证明 ${gtag("准确表述")}`, { x: 660, y: 180, size: 40 })
  + kw("kw-a", "相信结果<b>正确</b>", { x: 660, y: 270, size: 36 })
  + kw("kw-b", "<b>不用</b>自己重算", { x: 660, y: 345, size: 36 })
  + kw("kw-c", "看不到<b>秘密输入</b>", { x: 660, y: 420, size: 36 })
  + kw("kw-only", "只检查是否<b>满足</b><br>不检查是否<b>写对</b>", { x: 1180, y: 660, size: 46, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  l1: [w("正确", 1), w("重算", 1), w("秘密输入", 1)],
  l3: w("满足", 3), l4off: w("链下", 4), l4gen: w("生成证明", 4), l5on: w("链上", 5),
  l6set: w("可信设置", 6), l6par: w("参数", 6), l7pub: w("公开输入", 7), l7set: w("结算", 7),
  l8: ZN.map((n, i) => w(["电路", "设置", "证明器", "验证器", "结算"][i], 8)), l8err: w("出错", 8),
  l10: w("阅卷机", 10), l10g: w("格子", 10), l11: w("漏写", 11),
  l12fill: w("全涂上", 12), l12ok: w("判对", 12), l13a: w("没坏", 13), l13b: w("规则", 13),
  l15a: w("看不出", 15), au: w("审计", 15), fv: w("形式化验证", 15), te: w("测试", 15),
  l17a: w("满足电路", 17), l17b: w("写对", 17),
};
const t = (x) => f(x);
const mx = Math.max;

S.build({
  cam0: "wide", sub: "规则漏一条，阅卷机照样判对",
  grid: { u0: -3200, u1: 10000, v0: -4200, v1: 3200 }, box: [-1900, -4000, 9600, 5500],   // 全景 wide 覆盖 A–F
  shown: [], css, html,
  terms: [
    { id: "t0", t: "可信设置", d: "生成证明参数的仪式，秘密必须销毁", at: w("可信设置", 6) },
    { id: "t1", t: "公开输入", d: "证明里验证者可见、业务合约使用的数据", at: w("公开输入", 7) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。
      pop("#kw-def", ${t(LS[0] + 0.2)});
      // ===== L1 零知识证明 = 相信结果正确 · 不用重算 · 看不到秘密输入
      pop("#kw-a", ${t(TM.l1[0])}); pop("#kw-b", ${t(TM.l1[1])}); pop("#kw-c", ${t(TM.l1[2] - 0.5)});
      // ===== L2 计算写成约束 = 电路：到 A，规则文件 5 行逐行写入
      out("#kw-def, #kw-a, #kw-b, #kw-c", ${t(LS[2] - 0.3)}); cam(${t(LS[2])}, "ruleA", 1.4);
      [0, 1, 2, 3, 4].forEach((i) => fadeIn("#rl" + i, ${t(LS[2] + 1.4)} + i * 0.4, 0.25));
      // ===== L3 满足全部约束才算正确：逐行绿勾
      [0, 1, 2, 3, 4].forEach((i) => fadeIn("#rk" + i, ${t(TM.l3)} + i * 0.3, 0.2));
      // ===== L4 证明器在链下：到 C，吐出证明卡
      cam(${t(LS[4])}, "proverC", 1.3); pop("#lb-off", ${t(mx(TM.l4off, LS[4] + 1.2))});
      X3.spin(tl, "pv", ${t(LS[4] + 1.2)}, 1.2, 1); fadeIn("#pcC-mv", ${t(mx(TM.l4gen, LS[4] + 1.6))}, 0.3);
      // ===== L5 验证器在链上：过分界线到 D，证明卡进验证器，绿灯
      out("#lb-off", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "verifD", 1.4);
      tl.to("#pcC-mv", { x: ${f(d1[0])}, y: ${f(d1[1])}, duration: 1.4, ease: "power1.inOut" }, ${t(LS[5])});
      pop("#lb-on", ${t(mx(TM.l5on, LS[5] + 1.3))});
      tl.to("#pcC-mv", { x: ${f(d2[0])}, y: ${f(d2[1])}, opacity: 0, duration: 0.5, ease: "power1.in" }, ${t(LS[5] + 1.7)});
      X14.card(tl, "vf", ${t(LS[5] + 1.9)}, true); X14.scr(tl, "vf", ${t(LS[5] + 2.2)}, "满足电路？", "white");
      X14.grade(tl, "vf", ${t(LS[5] + 3.0)}, "green");
      // ===== L6 可信设置：到 B，三块拼图亮，两把钥匙
      out("#lb-on", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "setupB", 1.4);
      fadeIn("#pz-glow", ${t(mx(TM.l6set, LS[6] + 1.3))}, 0.4);
      grow("k0", ${t(mx(TM.l6par, LS[6] + 1.8))}); grow("k1", ${t(mx(TM.l6par, LS[6] + 1.8) + 0.3)});
      pop("#lb-k0", ${t(mx(TM.l6par, LS[6] + 1.8) + 0.4)}); pop("#lb-k1", ${t(mx(TM.l6par, LS[6] + 1.8) + 0.7)});
      // ===== L7 业务合约按公开输入结算：到 E，证明卡带"公开输入"送进结算机
      out("#lb-k0, #lb-k1", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "settleE", 1.4);
      fadeIn("#pcE-mv", ${t(LS[7] + 1.2)}, 0.3); pop("#lb-pub", ${t(mx(TM.l7pub, LS[7] + 1.5))});
      out("#lb-pub", ${t(mx(TM.l7set, LS[7] + 2.4))}); X3.slot(tl, "st", ${t(mx(TM.l7set, LS[7] + 2.4))}, true);
      tl.to("#pcE-mv", { x: ${f(d3[0])}, y: ${f(d3[1])}, opacity: 0, duration: 0.6, ease: "power1.in" }, ${t(mx(TM.l7set, LS[7] + 2.4))});
      X3.spin(tl, "st", ${t(mx(TM.l7set, LS[7] + 2.4) + 0.5)}, 1.2, 1);
      // ===== L8 五个环节都可能出错：全景，五区依次点名，再一起闪红
      cam(${t(LS[8])}, "wide", 1.4);
      [${TM.l8.map((x, i) => f(mx(x, LS[8] + 1.2 + i * 0.3))).join(", ")}].forEach((x, i) => pop("#z" + i, x));
      fadeIn("#flow", ${t(TM.l8err - 0.4)}, 0.4);
      [0, 1, 2, 3, 4].forEach((i) => { fadeIn("#zr" + i, ${t(TM.l8err)} + i * 0.15, 0.15); out("#z" + i, ${t(TM.l8err)} + i * 0.15, 0.15); });
      // ===== L9 打个比方：推到 A 近景
      out("#z0, #z1, #z2, #z3, #z4, #zr0, #zr1, #zr2, #zr3, #zr4, #flow", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "sheetA", 1.2);
      pop("#lb-meta", ${t(LS[9] + 1.0)});
      // ===== L10 阅卷机只核对格子：规则连到答题卡，逐行涂格，阅卷机绿灯
      fadeIn("#links", ${t(TM.l10 + 0.2)}, 0.4);
      X14.sheetFill(tl, "sheet", ${t(TM.l10g)});
      X14.card(tl, "gm", ${t(TM.l10g + 1.3)}, true); X14.grade(tl, "gm", ${t(TM.l10g + 1.9)}, "green");
      X14.sheetMark(tl, "sheet", ${t(TM.l10g + 2.5)}, "ok");
      // ===== L11 出题人漏写一条：第 5 行变红虚线框（关键画面）
      out("#lb-meta", ${t(LS[11] - 0.2)}); X14.sheetMark(tl, "sheet", ${t(LS[11])}, "none"); X14.lamp(tl, "gm", ${t(LS[11])}, "off");
      X14.scr(tl, "gm", ${t(LS[11])}, "");
      pop("#lb-author", ${t(LS[11] + 0.2)});
      out("#rl4, #rk4, #lk4", ${t(TM.l11)}, 0.3); fadeIn("#rmiss", ${t(TM.l11 + 0.2)}, 0.3); pop("#lb-miss", ${t(TM.l11 + 0.5)});
      // ===== L12 4 格全涂，照样判对（关键画面）
      pop("#lb-atk", ${t(LS[12] + 0.2)});
      X14.sheetExtra(tl, "sheet", ${t(Math.min(TM.l12fill, LS[12] + 1.5))});
      X14.card(tl, "gm", ${t(TM.l12fill + 0.8)}, true); X14.grade(tl, "gm", ${t(TM.l12fill + 1.3)}, "green");
      X14.sheetMark(tl, "sheet", ${t(mx(TM.l12ok, TM.l12fill + 1.9))}, "ok"); pop("#lb-judged", ${t(mx(TM.l12ok, TM.l12fill + 1.9) + 0.1)});
      // ===== L13 阅卷机没坏，规则漏了一条（关键画面）
      out("#lb-judged", ${t(LS[13] - 0.2)});
      pop("#lb-ok", ${t(TM.l13a)}); flash("#rmiss", ${t(TM.l13b)}, 3); pop("#lb-gap", ${t(TM.l13b + 0.3)});
      // ===== L14 比喻不成立：规则文件向上拉长成一长条
      out("#lb-ok, #lb-gap, #lb-miss, #lb-author, #lb-atk, #links", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "stripA", 1.2);
      pop("#lb-notlike", ${t(LS[14] + 0.9)});
      fadeIn("#strip", ${t(LS[14] + 1.0)}, 0.3);
      tl.to("#strip .sbar", { opacity: 1, duration: 0.08, stagger: 0.06 }, ${t(LS[14] + 1.2)});
      // ===== L15 从外面看不出：细缝闪一下就消失；审计 · 形式化验证 · 测试
      fadeIn("#seam", ${t(TM.l15a)}, 0.1); out("#seam", ${t(TM.l15a + 0.45)}, 0.2);
      pop("#lb-au", ${t(TM.au)}); pop("#lb-fv", ${t(TM.fv)}); pop("#lb-te", ${t(TM.te)});
      // ===== L16 记住一句话：拉到全景
      out("#lb-notlike, #lb-au, #lb-fv, #lb-te", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "wide", 1.4); out("#strip", ${t(LS[16] + 0.4)}, 0.4);
      // ===== L17 验证器只检查是否满足电路，不检查电路是否写对
      pop("#lb-vf2", ${t(TM.l17a)}); X14.lamp(tl, "vf", ${t(TM.l17a)}, "green"); pop("#lb-rule2", ${t(TM.l17a + 0.3)});
      draw("cv-nc", ${t(TM.l17a + 0.6)}); pop("#lb-nc", ${t(TM.l17a + 1.3)}); pop("#kw-only", ${t(LS[17] + 0.5)});
      // ===== L18 先看电路：推到 A，段尾静止
      out("#lb-vf2, #lb-rule2, #lb-nc, #cv-nc, #kw-only", ${t(LS[18] - 0.2)}); cam(${t(LS[18])}, "ruleA", 1.4);
`,
});
