// ep14/seg4「④ 规则之外」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.verifD

const Z = L.ZONE_RECTS;
const CAMS = { ...L.CAMS, ABCD: L.fit([...Z.A, ...Z.B, ...Z.C, ...Z.D], [60, 200, 1860, 860], 1) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E2, E3, E5, E6, E7, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
// 缩放不支持 scale 的物件：绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1）
const putW = (key, o, obj, k) => {
  const [gx, gy] = at(o);
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, obj, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const isPt = (v) => Array.isArray(v) && typeof v[0] === "number";
  for (const [n, v] of Object.entries(A[key])) {
    if (isPt(v)) A[key][n] = sc(v);
    else if (Array.isArray(v) && v.every(isPt)) A[key][n] = v.map(sc);
  }
};
const plate = (key, o, text, size = 30) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, size }));

// 传送路 + 链下 | 链上 分界线（原生 SVG，压在最底层）
{
  const R = L.ROAD, hw = R.halfWidth, P = (u, v) => Wp(u, v).map((x) => Math.round(x)).join(",");
  add(R.from, `<polygon points="${P(R.from.u, -hw)} ${P(4700, -hw)} ${P(4700, hw)} ${P(R.from.u, hw)}" fill="#ddd7cb" stroke="#cfc7b8" stroke-width="3"/>`, -9000);
  add(R.from, `<line x1="${Wp(3250, -320)[0]}" y1="${Wp(3250, -320)[1]}" x2="${Wp(3250, 320)[0]}" y2="${Wp(3250, 320)[1]}" stroke="#2aa3c9" stroke-width="5"/>`, -8999);
}
plate("pdv", L.DIVSIGN, "链下 | 链上", 22);

// A 出题台（起始画面，静态）
plate("pA", L.PLATE_A, "电路 · 出题台");
put("rule", L.RULE, O.doc(L.RULE, { id: "rule", standing: true, title: "评分规则 = 电路", lines: ["约束 1", "约束 2", "约束 3", "约束 4", "约束 5"] }));
put("sheet", L.SHEET, X.answerSheet(L.SHEET, { id: "sheet", scale: L.SHEET.scale }));
put("gm", L.GRADER, X.gradingMachine(L.GRADER, { id: "gm", title: "阅卷机" }));
put("author", L.AUTHOR, O.person(L.AUTHOR, { id: "author", role: "engineer", scale: 0.7 }));
put("patk", L.PROVER_ATK, O.person(L.PROVER_ATK, { id: "patk", role: "attacker", scale: 0.7 }));
put("bits", L.BITS, E3.byteBlock(L.BITS, { id: "bits", bytes: 5, cell: 40 }));
put("magA", L.MAG_A, O.magnifier(L.MAG_A, { id: "magA" }));
put("tg0", L.TAGS[0], E7.returnTag(L.TAGS[0], { id: "tg0", face: "ok" }));
put("tg1", L.TAGS[1], E7.returnTag(L.TAGS[1], { id: "tg1", face: "false" }));

// B 设置仪式
plate("pB", L.PLATE_B, "可信设置");
put("pz", L.PUZZLE, E2.puzzleSet(L.PUZZLE, { id: "pz" }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: q.scale })));
put("jar", L.JAR, E2.seedJar(L.JAR, { id: "jar", label: "有毒废料", lit: true }));
const ATK_B = { u: L.JAR.u - 170, v: L.JAR.v + 60 };
put("batk", ATK_B, O.person(ATK_B, { id: "batk", role: "attacker", scale: 0.6 }), 0, { grow: true });
put("bn", L.BURN, E6.burnBox(L.BURN, { id: "bn", scale: L.BURN.scale, plate: "销毁", sub: "", cards: 1 }));
put("k0", L.KEYS_B[0], O.key(L.KEYS_B[0], { id: "k0" }), 0, { grow: true });
put("k1", L.KEYS_B[1], O.key(L.KEYS_B[1], { id: "k1" }), 0, { grow: true });
// 缺口：被销毁那块的位置画青蓝虚线轮廓
{
  const [x, y] = A.pz.piecesTogether?.[0] ?? A.pz.pieces[0];
  add(L.PUZZLE, S.hid("pz-gap", `<ellipse cx="${x}" cy="${y}" rx="70" ry="38" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="10 8"/>`), 200);
}
// Zcash 角
put("zdoc", L.ZDOC, O.doc(L.ZDOC, { id: "zdoc", standing: true, title: "设置产物", lines: ["参数 1", "参数 2", "参数 3", "多余元素", "多余元素"] }), 0, { grow: true });
put("zm", L.ZMINT, E11.mintPress(L.ZMINT, { id: "zm", scale: L.ZMINT.scale, plate: "ZEC", count: "0", pile: 0.2 }));
const PCZ = { u: L.ZDOC.u - 230, v: L.ZDOC.v + 110 };
{
  const pc = E2.proofCard(PCZ, { id: "pcz" }), [tx, ty] = up(pc.anchors.top, 14);
  const tag = (id, s, c) => `<g id="${id}"${id.endsWith("b") ? ' opacity="0"' : ""}><rect x="${tx - 62}" y="${ty - 30}" width="124" height="40" rx="10" fill="${c}"/><text x="${tx}" y="${ty - 1}" text-anchor="middle" font-size="24" font-weight="900" fill="#fff" font-family="Noto Sans SC">${s}</text></g>`;
  add(PCZ, S.hid("pcz-g", pc.svg + tag("pcz-a", "陈述 A", "#1f9d55") + tag("pcz-b", "陈述 B", "#e0453a")), 0);
}

// C 证明器
plate("pC", L.PLATE_C, "证明器 · 链下");
put("pv", L.PROVER, E3.contractMachine(L.PROVER, { id: "pv", name: "证明器", tone: "gray" }));
put("zv", L.ZKVM, E10.coreModule(L.ZKVM, { id: "zv", scale: L.ZKVM.scale, ver: "zkVM" }));
putW("lk", L.LOOKUP, E3.slotCabinet(L.LOOKUP, { id: "lk", n: 4, title: "查找表", labels: ["0", "0", "0", "0"] }), L.LOOKUP.scale);
putW("cm", L.COMMITTEE, E5.thresholdMeter(L.COMMITTEE, { id: "cm", max: 3, th: 2, thText: "安全委员会" }), L.COMMITTEE.scale);
put("psw", L.PSWITCH, O.knifeSwitch(L.PSWITCH, { id: "psw", text: "证明生产", on: true }));
const PCK = { u: L.PROVER.u + 260, v: L.PROVER.v + 120 };
let PCK_TOP;
{
  const pc = E2.proofCard(PCK, { id: "pck" }), [x0, y0] = up(pc.anchors.ground, 4), [x1, y1] = up(pc.anchors.top, -4);
  PCK_TOP = pc.anchors.top;
  add(PCK, S.hid("pck-g", pc.svg + `<rect x="${(x0 + x1) / 2}" y="${y1}" width="54" height="${y0 - y1}" fill="rgba(224,69,58,0.18)" stroke="#e0453a" stroke-width="4" stroke-dasharray="9 7"/>`), 0);
}

// D 验证器
plate("pD", L.PLATE_D, "验证器 · 链上");
put("l1", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1", n: 4, title: "L1" }));
put("vf", L.VERIFIER, X.gradingMachine(L.VERIFIER, { id: "vf", title: "验证器", scale: L.VERIFIER.scale }));
putW("clk", L.CLOCK_D, O.clock(L.CLOCK_D, { id: "clk", h: 1, m: 0 }), L.CLOCK_D.scale);
put("lg", L.LEDGER, E7.dispatchDesk(L.LEDGER, { id: "lg", scale: L.LEDGER.scale, entries: ["x ✓", { text: "x + r ✓", kind: "ghost" }], shown: 1 }));
const proofX = (key, o, s, c) => {
  const pc = E2.proofCard(o, { id: key }), [tx, ty] = up(pc.anchors.top, 14);
  add(o, S.hid(key + "-g", pc.svg + `<rect x="${tx - 58}" y="${ty - 32}" width="116" height="42" rx="10" fill="${c}"/><text x="${tx}" y="${ty - 1}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Noto Sans SC">${s}</text>`), 0);
  return pc.anchors;
};
const PX = L.INCARD, PXR = { u: L.INCARD.u - 40, v: L.INCARD.v + 140 };
const aPX = proofX("px", PX, "x", "#1c1c1c"), aPXR = proofX("pxr", PXR, "x + r", "#e0453a");
const toSlot = (a) => [Math.round(A.vf.slot[0] - a.center[0]), Math.round(A.vf.slot[1] - a.center[1])];
const dPX = toSlot(aPX), dPXR = toSlot(aPXR);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const big = (s) => `<span style="font-size:2.6em;line-height:1">${s}</span>`;
lb("n1", up(A.pB.top, 10), big("一"), "lab-cs");
lb("n2", up(A.pC.top, 10), big("二"), "lab-cs");
lb("n3", up(A.pD.top, 10), big("三"), "lab-cs");
lb("lb-grth", up(A.pB.top, 10), "Groth16 等方案", "lab-g lab-sm");
lb("lb-k0", up(A.k0.top, 6), "证明密钥", "lab-cs lab-sm");
lb("lb-k1", up(A.k1.top, 6), "验证密钥", "lab-cs lab-sm", "l");
lb("lb-atk", up(A.jar.top, 16), "留着它 = 伪造任意证明", "lab-rs");
lb("lb-safe", up(A.pz.top, 40), "拼不回来 = 安全", "lab-gs");
lb("lb-zx", [A.zdoc.center[0] + 70, A.zdoc.center[1] + 10], "多余元素", "lab-rs lab-sm", "l");
lb("lb-mint", up(A.zm.top, 8), "凭空增发 ZEC", "lab-rs");
lb("lb-f0", up(A.lk.top, 8), "f(0) = 0 总能被证明", "lab-rs");
lb("lb-miss", up(PCK_TOP, 30), "漏掉的状态", "lab-rs lab-sm");
lb("lb-13", up(A.clk.top, 10), "13 点 = 1 点", "lab-ink");
lb("lb-meta", up(A.clk.top, 70), "比喻", "lab-g lab-sm");
lb("lb-x", up(A.lg.entries[0], 34), "x ✓", "lab-ink lab-sm", "r");
lb("lb-xr", up(A.lg.entries[1], -6), "x + r ✓", "lab-rs lab-sm", "t");
lb("lb-once", up(A.lg.top, 10), "只能用一次的记录", "lab-cs lab-sm", "l");
lb("lb-up", up(A.vf.top, 16), "跟踪上游公告", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 1240, y: 300, w: 580 };
const ccard = codeCard("cc", {
  ...CC, mono: true, head: "验证器的域检查", tag: "示意", rows: [
    { html: `require(input &lt; r)<span class="c-chip ok hide" id="cc-ok">补上</span>`, chip: "缺这一行", chipCls: "x" },
    { html: "verify(proof, input)", chip: "两个都过", chipCls: "x" },
    { html: "used[input] = true", chip: "新值", chipCls: "x" },
  ],
});
S.curve("cv", [CC.x - 4, codeRowY(CC.y, 2)], S.scr("clockD", A.lg.entries[1]), { color: "#e0453a" });
const html = ccard
  + evt("ev-ecc", `来源 · ECC 公告`)
  + evt("ev-pl", `<b>Plonky2 · 2025 年 1 月</b><br>来源 · OSV`, { color: "#e0453a" })
  + evt("ev-zk", `<b>ZKsync · 2025 年 7 月</b><br>来源 · ZKsync 治理论坛<span id="ev-zk-x" style="opacity:0"><br><b style="color:#1f9d55">没有损失</b></span>`, { color: "#e0453a" })
  + evt("ev-sj", `来源 · snarkjs 代码库`)
  + `<div class="z-tl hide" id="ztl"><div class="z-st" id="ztl-0"><b>2018 年 3 月</b>内部发现</div><div class="z-ar" id="ztl-a0">→</div><div class="z-st" id="ztl-1"><b>2018 年 10 月</b>升级换参数</div><div class="z-ar" id="ztl-a1">→</div><div class="z-st" id="ztl-2"><b>2019 年 2 月</b>公开</div><div class="z-cl" id="ztl-c">${gtag("项目方称", "margin-left:0")} 未发现被利用</div></div>`
  + `<svg class="hide" id="nl" style="position:absolute;left:1440px;top:300px" width="400" height="320" viewBox="0 0 400 320">
      <g id="nl-line"><line x1="30" y1="250" x2="370" y2="250" stroke="#1c1c1c" stroke-width="5"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="${30 + i * 42.5}" y1="240" x2="${30 + i * 42.5}" y2="260" stroke="#1c1c1c" stroke-width="3"/>`).join("")}
        <text x="30" y="296" text-anchor="middle" font-size="30" font-weight="900" fill="#1c1c1c">0</text><text x="370" y="296" text-anchor="middle" font-size="30" font-weight="900" fill="#2aa3c9">r</text></g>
      <g id="nl-ring" opacity="0"><circle cx="200" cy="140" r="100" fill="none" stroke="#1c1c1c" stroke-width="5"/><circle cx="200" cy="240" r="10" fill="#2aa3c9"/>
        <text x="200" y="296" text-anchor="middle" font-size="30" font-weight="900" fill="#1c1c1c">0 = r</text></g></svg>`
  + `<div class="z-bar hide" id="bar"><div class="z-b12" id="bar-12"></div></div>`
  + kw("kw-big", `有限域的阶 <b>极大</b>${gtag("比喻不成立处")}`, { x: 120, y: 760, size: 38, accent: "#e0453a" })
  + `<div class="z-b12t hide" id="bar-t">钟面 12 格</div>`;
const css = `
  .z-tl { position: absolute; left: 640px; top: 130px; width: 1180px; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; background: #fffdf8; border-radius: 16px; padding: 18px 24px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
  .z-st { font-size: 30px; font-weight: 800; color: #1c1c1c; background: #eef7fa; border: 3px solid #2aa3c9; border-radius: 12px; padding: 6px 16px; }
  .z-st b { color: #1d93ba; margin-right: 10px; }
  .z-ar { font-size: 34px; font-weight: 900; color: #6d685e; }
  .z-cl { width: 100%; font-size: 28px; font-weight: 800; color: #1c1c1c; }
  .z-bar { position: absolute; left: 120px; top: 868px; width: 1680px; height: 12px; background: #1c1c1c; border-radius: 6px; transform-origin: left center; }
  .z-b12 { position: absolute; left: 0; top: -6px; width: 26px; height: 24px; background: #2aa3c9; border-radius: 4px; }
  .z-b12t { position: absolute; left: 1500px; top: 818px; font-size: 28px; font-weight: 800; color: #1d93ba; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  pk: w("证明密钥", 2), vk: w("验证密钥", 2), toxic: w("有毒废料", 3), keep: w("谁留着它", 3),
  multi: w("多方仪式", 4), burn: w("销毁", 4), noback: w("拼不回来", 4),
  zprod: w("设置产物", 5), extra: w("多出了", 5), remake: w("改造成", 6), mint: w("增发", 6),
  t18: w("2018", 7), swap: w("换掉参数", 7), t19: w("2019", 7), claim: w("团队称", 7),
  zero: w("用 0", 9), fixed: w("固定的等式", 9), miss: w("漏掉", 10), fake: w("伪装成", 10),
  upg: w("紧急升级", 11), pause: w("暂停", 11), noloss: w("没有损失", 11),
  field: w("有限域", 13), wrap: w("绕回", 13), same: w("同一个位置", 14),
  nocheck: w("不检查", 15), xr: w("x 加 r", 15), valid: w("照样有效", 15),
  newnum: w("新数", 16), again: w("再用一次", 16), huge: w("极大", 17), both: w("两个值", 18),
  check: w("校验", 19), track: w("跟踪", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "ruleA", sub: "规则写对了，还有三处会坏",
  grid: { u0: -1400, u1: 4900, v0: -1000, v1: 1000 }, box: [-1600, -1400, 6400, 2800],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "zkVM", d: "为通用程序执行生成证明的系统", at: w("zkVM", 8) },
    { id: "t1", t: "查找表", d: "预先列好输入输出对的表", at: w("查找表", 9) },
    { id: "t2", t: "承诺", d: "先锁定一组数据，事后可核对的值", at: w("承诺", 10) },
    { id: "t3", t: "安全委员会", d: "有权紧急升级合约的多签", at: w("安全委员会", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 电路写对之后，仍有三个地方会坏。（A 横移到 B/C/D 全貌，三块牌子依次浮出编号）
      cam(${t(LS[0] + 0.1)}, "ABCD", 1.6); pop("#n1", ${t(LS[0] + 1.3)}, 0.25); pop("#n2", ${t(LS[0] + 1.75)}, 0.25); pop("#n3", ${t(LS[0] + 2.2)}, 0.25);
      // ===== L1 第一个，是可信设置。
      out("#n1, #n2, #n3", ${t(LS[1] - 0.2)}, 0.2); cam(${t(LS[1])}, "setupB", 1.4); bump("#sg0, #sg1, #sg2", ${t(LS[1] + 1.2)}, 1.06, 1);
      // ===== L2 生成证明密钥和验证密钥
      pop("#lb-grth", ${t(LS[2] + 0.2)}, 0.25);
      grow("k0", ${t(TM.pk)}); pop("#lb-k0", ${t(TM.pk + 0.3)}, 0.25); grow("k1", ${t(TM.vk)}); pop("#lb-k1", ${t(TM.vk + 0.3)}, 0.25);
      // ===== L3 有毒废料：谁留着它，谁就能伪造任意证明
      out("#lb-grth", ${t(LS[3] - 0.2)}, 0.2); bump("#jar", ${t(TM.toxic)}, 1.1, 2);
      grow("batk", ${t(TM.keep - 0.3)}); KIT.swap(tl, "#jar-seed", "#jar-seed-atk", ${t(TM.keep + 0.3)}, 0.3); pop("#lb-atk", ${t(TM.keep + 0.5)}, 0.25);
      // ===== L4 多方仪式：一人销毁自己那份，秘密拼不回来
      out("#lb-atk, #batk", ${t(LS[4] - 0.2)}, 0.2); KIT.swap(tl, "#jar-seed-atk", "#jar-seed", ${t(LS[4] - 0.2)}, 0.3);
      bump("#sg0, #sg1, #sg2", ${t(TM.multi)}, 1.06, 1);
      out("#pz-pc-0", ${t(TM.burn - 0.3)}, 0.3); X6.burn(tl, "bn", ${t(TM.burn - 0.2)}, 0);
      KIT.assemble(tl, "pz", ${t(TM.noback - 0.6)}, true, 0.6); fadeIn("#pz-gap", ${t(TM.noback)}, 0.3); pop("#lb-safe", ${t(TM.noback + 0.3)}, 0.25);
      // ===== L5 Zcash 设置产物多出元素（ECC 公告）
      out("#lb-k0, #lb-k1, #lb-safe", ${t(LS[5] - 0.2)}, 0.2); cam(${t(LS[5])}, "zcashB", 1.4); pop("#ev-ecc", ${t(LS[5] + 0.4)}, 0.3);
      grow("zdoc", ${t(TM.zprod)}); pop("#lb-zx", ${t(TM.extra + 0.2)}, 0.25);
      // ===== L6 证明被改造成另一个陈述，仍是绿勾；凭空增发 ZEC
      fadeIn("#pcz-g", ${t(LS[6] + 0.2)}, 0.3); KIT.swap(tl, "#pcz-a", "#pcz-b", ${t(TM.remake + 0.3)}, 0.3);
      X11.ram(tl, "zm", ${t(TM.mint - 0.3)}, 2, 0.5); X11.count(tl, "zm", ${t(TM.mint + 0.2)}, "增发", "red"); X11.lamp(tl, "zm", ${t(TM.mint + 0.2)}, "red");
      flash("#zm", ${t(TM.mint + 0.3)}, 3, 0.5); out("#lb-zx", ${t(TM.mint + 0.1)}, 0.2); pop("#lb-mint", ${t(TM.mint + 0.4)}, 0.25);
      // ===== L7 时间条：2018 发现 → 换参数 → 2019 公开；项目方称未被利用
      out("#ev-ecc", ${t(LS[7] - 0.2)}, 0.2); pop("#ztl", ${t(LS[7])}, 0.3);
      tl.set("#ztl-1, #ztl-a0, #ztl-2, #ztl-a1, #ztl-c", { opacity: 0 }, 0);
      fadeIn("#ztl-a0, #ztl-1", ${t(TM.swap - 0.3)}, 0.3); fadeIn("#ztl-a1, #ztl-2", ${t(TM.t19)}, 0.3); fadeIn("#ztl-c", ${t(TM.claim)}, 0.3);
      // ===== L8 第二个，是证明器和 zkVM 本身
      out("#ztl, #lb-zx, #lb-mint, #pcz-g", ${t(LS[8] - 0.2)}, 0.2); cam(${t(LS[8])}, "proverC", 1.4);
      pop("#n2", ${t(LS[8] + 1.0)}, 0.25); bump("#pv", ${t(LS[8] + 1.2)}, 1.05, 1); bump("#zv", ${t(LS[8] + 1.8)}, 1.1, 1);
      // ===== L9 Plonky2 查找表用 0 填充
      out("#n2", ${t(LS[9] - 0.2)}, 0.2); pop("#ev-pl", ${t(LS[9] + 0.2)}, 0.3);
      X3.mark(tl, "lk", 1, ${t(TM.zero)}, "red"); bump("#lk", ${t(TM.zero)}, 1.04, 1); pop("#lb-f0", ${t(TM.fixed - 0.4)}, 0.25);
      // ===== L10 ZKsync 承诺漏掉内部状态
      out("#ev-pl, #lb-f0", ${t(LS[10] - 0.2)}, 0.2); cam(${t(LS[10])}, "committeeC", 1.4); pop("#ev-zk", ${t(LS[10] + 0.4)}, 0.3);
      fadeIn("#pck-g", ${t(TM.miss - 0.2)}, 0.3); pop("#lb-miss", ${t(TM.miss + 0.3)}, 0.25);
      // ===== L11 安全委员会紧急升级，暂停证明生产，没有损失
      X5.fill(tl, "cm", ${t(TM.upg)}, 2, 0.9); KIT.toggle(tl, "psw", ${t(TM.pause)}, false); fadeIn("#ev-zk-x", ${t(TM.noloss)}, 0.3);
      // ===== L12 第三个，是验证器（跨过分界线）
      out("#ev-zk, #lb-miss, #pck-g", ${t(LS[12] - 0.2)}, 0.2); cam(${t(LS[12])}, "verifD", 1.4); pop("#n3", ${t(LS[12] + 0.9)}, 0.25); bump("#vf", ${t(LS[12] + 1.1)}, 1.06, 1);
      // ===== L13 有限域：数轴卷成一圈，0 和 r 重合
      out("#n3", ${t(LS[13] - 0.1)}, 0.2); pop("#nl", ${t(TM.field)}, 0.3);
      tl.to("#nl-line", { opacity: 0, duration: 0.4 }, ${t(TM.wrap - 0.2)}); tl.to("#nl-ring", { opacity: 1, duration: 0.4 }, ${t(TM.wrap)});
      // ===== L14 钟面：13 点和 1 点在同一位置（关键画面）
      out("#nl", ${t(LS[14] - 0.2)}, 0.2); cam(${t(LS[14])}, "clockD", 1.2);
      pop("#lb-meta", ${t(LS[14] + 1.0)}, 0.25); KIT.clock(tl, "clk", ${t(LS[14] + 1.2)}, 2.0, 720); pop("#lb-13", ${t(TM.same - 0.2)}, 0.25);
      // ===== L15 不检查 < r：x 与 x + r 都通过（关键画面）
      out("#lb-13, #lb-meta", ${t(LS[15] - 0.2)}, 0.2); pop("#cc", ${t(LS[15])}, 0.3);
      pop("#cc-c0", ${t(TM.nocheck)}, 0.2); tl.to("#cc-r0", { opacity: 0.35, duration: 0.3 }, ${t(TM.nocheck + 0.1)});
      fadeIn("#px-g", ${t(TM.nocheck + 0.6)}, 0.3); tl.to("#px-g", { x: ${dPX[0]}, y: ${dPX[1]}, duration: 0.7, ease: "power1.inOut" }, ${t(TM.nocheck + 1.0)});
      out("#px-g", ${t(TM.nocheck + 1.7)}, 0.2); X14.card(tl, "vf", ${t(TM.nocheck + 1.6)}, true, 0.3); X14.grade(tl, "vf", ${t(TM.nocheck + 2.0)}, "green");
      fadeIn("#pxr-g", ${t(TM.xr - 0.2)}, 0.3); tl.to("#pxr-g", { x: ${dPXR[0]}, y: ${dPXR[1]}, duration: 0.7, ease: "power1.inOut" }, ${t(TM.xr + 0.3)});
      X14.lamp(tl, "vf", ${t(TM.xr + 0.3)}, "off"); out("#pxr-g", ${t(TM.xr + 1.0)}, 0.2); X14.card(tl, "vf", ${t(TM.xr + 0.9)}, true, 0.3);
      X14.grade(tl, "vf", ${t(TM.valid - 0.3)}, "green"); pop("#cc-c1", ${t(TM.valid)}, 0.2);
      // ===== L16 合约当成新数：登记簿再写一行 x + r ✓（关键画面）
      pop("#lb-x", ${t(LS[16])}, 0.25); pop("#cc-c2", ${t(TM.newnum)}, 0.2); hot("#cc-r2", ${t(TM.newnum)}, "#fde3e0");
      draw("cv", ${t(TM.newnum + 0.3)}); X7.entry(tl, "lg", ${t(TM.newnum + 0.6)}, 1, 0.6); pop("#lb-xr", ${t(TM.newnum + 1.1)}, 0.25);
      pop("#lb-once", ${t(TM.again - 0.8)}, 0.25); bump("#lb-xr", ${t(TM.again)}, 1.15, 2);
      // ===== L17 比喻不成立：钟面 12 格，域的阶极大
      out("#lb-once", ${t(LS[17] - 0.2)}, 0.2);
      fadeIn("#bar, #bar-t", ${t(LS[17] + 1.0)}, 0.2); tl.fromTo("#bar", { scaleX: 0.02 }, { scaleX: 1, duration: 1.6, ease: "power2.in" }, ${t(TM.huge - 1.6)});
      pop("#kw-big", ${t(LS[17] + 1.4)}, 0.3);
      // ===== L18 snarkjs 验证器过去接受两个值
      out("#bar, #bar-t, #kw-big, #cv", ${t(LS[18] - 0.2)}, 0.2); cam(${t(LS[18])}, "verifD", 1.2);
      pop("#ev-sj", ${t(LS[18] + 0.4)}, 0.3); X14.ring(tl, "vf", ${t(TM.both - 0.3)}, true);
      // ===== L19 校验在域内、跟踪上游公告（段尾静止在 verifD）
      out("#cc-c0, #cc-c1, #cc-c2", ${t(TM.check - 0.1)}, 0.2); tl.to("#cc-r0", { opacity: 1, duration: 0.3 }, ${t(TM.check)}); hot("#cc-r0", ${t(TM.check)}, "#dff3e7"); pop("#cc-ok", ${t(TM.check + 0.2)}, 0.2); hot("#cc-r2", ${t(TM.check + 0.5)}, "rgba(255,255,255,0)");
      X7.eraseEntry(tl, "lg", ${t(TM.check + 0.5)}, 1); out("#lb-xr", ${t(TM.check + 0.5)}, 0.3); X14.ring(tl, "vf", ${t(TM.check + 0.6)}, false);
      out("#ev-sj", ${t(TM.track - 0.3)}, 0.2); pop("#lb-up", ${t(TM.track)}, 0.25);
`,
});
