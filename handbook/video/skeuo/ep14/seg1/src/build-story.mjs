// ep14/seg1「① 证明全都有效」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import { ZONE } from "../../../kit/segbase.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (pts) => pts.map((q) => q.map((n) => Math.round(n * 10) / 10).join(",")).join(" ");
const BOTTOM = -1e6;   // native ground SVG goes under everything

// ---------------------------------------------------------------- 原生地面：传送路、链下|链上分界、F 台
{
  const { from, to, halfWidth: h } = L.ROAD;
  add({ u: 0, v: 0 }, `<polygon points="${P([Wp(from.u, -h), Wp(to.u, -h), Wp(to.u, h), Wp(from.u, h)])}" fill="#d9d4ca" stroke="#c7c0b3" stroke-width="2"/>`, BOTTOM);
  add({ u: 0, v: 0 }, `<line x1="${Wp(3250, -420)[0]}" y1="${Wp(3250, -420)[1]}" x2="${Wp(3250, 420)[0]}" y2="${Wp(3250, 420)[1]}" stroke="#2aa3c9" stroke-width="4"/>`, BOTTOM + 1);
  const pu = L.PLATFORM.u, pv = L.PLATFORM.v, du = 950, dv = 520;
  const c = [[pu - du, pv - dv], [pu + du, pv - dv], [pu + du, pv + dv], [pu - du, pv + dv]];
  add({ u: 0, v: 0 }, `<polygon points="${P([Wp(pu + du, pv - dv), Wp(pu + du, pv + dv), Wp(pu + du, pv + dv, -26), Wp(pu + du, pv - dv, -26)])}" fill="#cfc8bb"/>`
    + `<polygon points="${P([Wp(pu - du, pv + dv), Wp(pu + du, pv + dv), Wp(pu + du, pv + dv, -26), Wp(pu - du, pv + dv, -26)])}" fill="#bdb5a7"/>`
    + `<polygon points="${P(c.map(([u, v]) => Wp(u, v)))}" fill="#e6e1d7" stroke="#c7c0b3" stroke-width="2"/>`, BOTTOM + 2);
}

// ---------------------------------------------------------------- 世界物件
const plate = (key, o, text, extra = {}) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, size: 30, ...extra }));
// A 出题台（全景用）
put("sheet", L.SHEET, X.answerSheet(L.SHEET, { id: "sheet", scale: L.SHEET.scale }));
put("gr", L.GRADER, X.gradingMachine(L.GRADER, { id: "gr", title: "阅卷机" }));
put("rule", L.RULE, O.doc(L.RULE, { id: "rule", standing: true, title: "评分规则 = 电路", lines: ["约束 1", "约束 2", "约束 3", "约束 4", "约束 5"] }));
plate("plA", L.PLATE_A, "电路 · 出题台");
// B 设置仪式
put("pz", L.PUZZLE, E2.puzzleSet(L.PUZZLE, { id: "pz" }));
L.SIGNERS.forEach((q, i) => put(`sg${i}`, q, O.person(q, { id: `sg${i}`, role: "signer", scale: q.scale ?? 0.6 })));
plate("plB", L.PLATE_B, "可信设置");
// C 证明器
put("prv", L.PROVER, E3.contractMachine(L.PROVER, { id: "prv", name: "证明器", tone: "gray" }));
plate("plC", L.PLATE_C, "证明器 · 链下");
// 分界牌
plate("plDiv", L.DIVSIGN, "链下 | 链上", { size: 22 });
// D 验证器
put("vf", L.VERIFIER, X.gradingMachine(L.VERIFIER, { id: "vf", title: "验证器", scale: L.VERIFIER.scale }));
put("l1", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1", n: 4, title: "L1" }));
put("inc", L.INCARD, E2.proofCard(L.INCARD, { id: "inc" }));
plate("plD", L.PLATE_D, "验证器 · 链上");
// E 结算
put("settle", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "settle", name: "结算", tone: "light", led: "off" }));
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault" }));
L.ATTACKERS.forEach((q, i) => put(`atk${i}`, q, O.person(q, { id: `atk${i}`, role: "attacker", scale: q.scale }), 0, { grow: true }));
L.ECARDS.forEach((q, i) => put(`pc${i}`, q, E2.proofCard(q, { id: `pc${i}` }), 0, { wrap: (svg) => `<g id="pcw${i}">${svg}</g>` }));
plate("plE", L.PLATE_E, "结算 · 业务合约");
plate("dep", L.DEPREC, "已弃用", { color: "#9a958c", ink: "#7a756c" });
// F 观察台（全景用）
{
  const [gx, gy] = at(L.L2CHAIN), k = L.L2CHAIN.scale;
  put("l2", L.L2CHAIN, O.chain(L.L2CHAIN, { id: "l2", n: 3, title: "L2" }), 0, {
    wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
}
plate("plF", L.PLATE_F, "L2");

// 红点阵：每点 = 约 2 万美元，110 + 4 = 114 点，从保险柜门口流出
const [dx0, dy0] = at(L.DOTS_E);
const VF = A.vault.front ?? A.vault.center;
{
  const a = [], b = [];
  for (let i = 0; i < 110; i++) { const r = Math.floor(i / 11), c = i % 11; a.push(`<circle class="dA${i < 100 ? "1" : "2"}" cx="${dx0 + 8 + c * 12}" cy="${dy0 + r * 12}" r="4.2" fill="#e0453a"/>`); }
  for (let i = 0; i < 4; i++) b.push(`<circle cx="${dx0 + 152 + (i % 2) * 12}" cy="${dy0 + 96 + Math.floor(i / 2) * 12}" r="4.2" fill="#e0453a"/>`);
  add(L.DOTS_E, `<g id="dA">${a.join("")}</g>` + S.hid("dB", b.join("")), 60);
}
// 32 格板（4 × 8，原生 SVG 地面格）
{
  const cs = 30, u0 = L.GRID32.u - 4 * cs, v0 = L.GRID32.v - 2 * cs, cells = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) {
    const u = u0 + i * cs, v = v0 + j * cs, first = i === 0 && j === 0;
    cells.push(`<polygon id="g32-${j * 8 + i}" points="${P([Wp(u + 2, v + 2), Wp(u + cs - 2, v + 2), Wp(u + cs - 2, v + cs - 2), Wp(u + 2, v + cs - 2)])}" fill="${first ? "#1f9d55" : "#cfc9bd"}" stroke="${first ? "#167a41" : "#b3ab9c"}" stroke-width="1.5"/>`);
  }
  add(L.GRID32, S.hid("g32", cells.join("")), BOTTOM / 2);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-vault", [at(L.VAULT)[0] - 185, at(L.VAULT)[1] - 150], "Aztec Connect", "lab-ink", "r");
lb("lb-dots", [dx0 + 70, dy0 + 136], "约 228 万美元", "lab-rs lab-sm", "t");
L.ECARDS.forEach((q, i) => lb(`ck${i}`, up(A[`pc${i}`].top, 6), "✓", "lab-gs lab-sm"));
lb("lb-settle-ok", up(A.settle.top, 8), "结算 · 收下凭据", "lab-cs lab-sm");
lb("lb-g32", [at(L.GRID32)[0] + 10, at(L.GRID32)[1] + 72], `证明覆盖 32 笔 · <span style="color:#1f9d55">1 笔记账</span> · 其余未记账`, "lab-ink lab-sm", "t");
const WRENCH = `<svg width="26" height="26" viewBox="0 0 24 24" style="vertical-align:-5px;margin-right:6px"><path d="M22 6.5a5.5 5.5 0 0 1-7.4 5.2L6 20.3a2 2 0 0 1-2.8-2.8l8.6-8.6A5.5 5.5 0 0 1 17.5 1l-3 3 .5 3 3 .5 3-3c.6.6 1 1.3 1 2z" fill="#e0453a"/></svg>`;
lb("lb-fix", up(A.vf.top, 26), `${WRENCH}只修这里？`, "lab-r");
const ZQ = [["plA", "电路"], ["plB", "可信设置"], ["plC", "证明器"], ["plD", "验证器"], ["plE", "结算"]];
ZQ.forEach(([k, name]) => lb(`zq-${k}`, up(A[k].top, 10), `${name} <span style="color:#e0453a;font-weight:800">?</span>`, "lab-cs lab-sm"));

// ---------------------------------------------------------------- 屏幕层卡片
const QC = { x: 1370, y: 300, w: 470 };
const html = evt("ev", `<b>Aztec Connect</b> · 2026 年 6 月<br>约 228 万美元 <span id="ev-tag" class="hide">${gtag("两人合计 · 事发时估值")}</span>`
    + `<div id="src" class="hide" style="font-size:28px;color:#555;margin-top:6px">来源：rekt.news · SlowMist 分析 · Halborn 分析</div>`, { color: "#e0453a" })
  + kw("kw-crypto", `密码学 <b>没有失效</b>`, { x: 640, y: 120, size: 50 })
  + kw("kw-math", `没有破解 <b>数学题</b>`, { x: 660, y: 215, size: 30 })
  + `<div id="big" class="hide"><div class="bc-head"><span class="bc-tick">✓</span>证明</div><div class="bc-row">这一批交易</div><div class="bc-row">算对了</div></div>`
  + `<div id="qc" class="hide"><div class="qc-head">先猜</div><div class="qc-row hide" id="qc-r0">证明全部有效 · 结算少处理</div><div class="qc-row hide" id="qc-r1">只修验证器，够吗？</div></div>`;
const css = `
  #big { position:absolute; left:120px; top:330px; width:330px; background:#fff; border:5px solid #1f9d55; border-radius:16px; padding:18px 22px; box-shadow:0 8px 24px rgba(0,0,0,.12); font-family:inherit; }
  #big .bc-head { font-size:34px; font-weight:800; color:#1f9d55; margin-bottom:10px; display:flex; align-items:center; gap:12px; }
  #big .bc-tick { display:inline-flex; width:46px; height:46px; border-radius:50%; background:#1f9d55; color:#fff; align-items:center; justify-content:center; font-size:30px; }
  #big .bc-row { font-size:32px; color:#1c1c1c; padding:6px 0; border-top:2px dashed #cfc7b8; }
  #qc { position:absolute; left:${QC.x}px; top:${QC.y}px; width:${QC.w}px; background:#fff; border:3px solid #1c1c1c; border-radius:14px; padding:14px 20px; box-shadow:0 6px 18px rgba(0,0,0,.1); }
  #qc .qc-head { font-size:36px; font-weight:800; color:#1c1c1c; margin-bottom:6px; }
  #qc .qc-row { font-size:34px; color:#1c1c1c; padding:6px 0; border-top:2px solid #e2ddd3; }
  #qc #qc-r1 { color:#c3352b; font-weight:700; }
`;
S.curve("cv-big", [120 + 330 + 8, 420], S.scr("aztecE", A.pc0.top), { color: "#1f9d55" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  deprec: w("弃用", 0), took: w("被取走", 0), atk: w("攻击者", 1), est: w("估值", 1),
  every: w("每一个", 2), pass: w("通过", 2), math: w("数学题", 4),
  cred: w("凭据", 5), right: w("算对了", 5), check: w("检查", 6), take: w("取走", 6),
  settle: w("结算", 8), vf: w("验证器", 9), link: w("环节", 11), bad: w("怎么坏", 11),
};
const t = (x) => f(x);
// 证明卡 0 滑进结算机投信口（世界画布位移）
const SL = A.settle.slot, PC0 = A.pc0.center;
const MV = { x: Math.round(SL[0] - PC0[0]), y: Math.round(SL[1] - PC0[1]) };
const QSHIFT = ZONE.event.top - QC.y;

S.build({
  cam0: "aztecE", sub: "每一张证明都打了绿勾",
  grid: { u0: -1600, u1: 9000, v0: -2400, v1: 1400 }, box: [-1400, -2600, 10200, 4600],
  shown: ["#lb-vault"], css, html,
  terms: [
    { id: "t0", t: "验证器", d: "链上检查证明是否成立的合约", at: w("验证器", 9) },
    { id: "t1", t: "弃用", d: "项目方宣布停止维护和使用", at: w("弃用", 0) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // 开场：一排证明卡暗着（L2 依次亮），点阵未出
      tl.set("[id^=pcw]", { opacity: 0.25 }, 0); tl.set("#dA circle", { opacity: 0 }, 0);
      // ===== L0 2026 年 6 月，一个已经弃用的合约，Aztec Connect，被取走约 228 万美元。
      pop("#ev", ${t(LS[0] + 0.3)}); pop("#src", ${t(LS[0] + 0.6)});
      bump("#dep", ${t(TM.deprec)}, 1.12, 1);
      KIT.door(tl, "vault", ${t(TM.took - 0.6)}, 105, 1.0);
      tl.fromTo(".dA1", { x: (i, el) => ${VF[0]} - +el.getAttribute("cx"), y: (i, el) => ${VF[1]} - +el.getAttribute("cy"), opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.022, immediateRender: false }, ${t(TM.took)});
      fadeIn("#dB", ${t(TM.took + 2.2)}, 0.3);
      pop("#lb-dots", ${t(TM.took + 1.2)});
      // ===== L1 这是两名攻击者的合计，按事发时的估值。
      grow("atk0", ${t(TM.atk - 0.2)}); grow("atk1", ${t(TM.atk + 0.1)});
      tl.to("#dB", { x: 70, y: 24, duration: 0.6, ease: "power2.inOut" }, ${t(TM.atk + 0.4)});
      pop("#ev-tag", ${t(TM.est - 0.3)});
      // ===== L2 奇怪的是，每一个证明，都通过了验证。
      [0, 1, 2, 3, 4].forEach((i) => { tl.to("#pcw" + i, { opacity: 1, duration: 0.25 }, ${t(TM.every)} + i * 0.38); pop("#ck" + i, ${t(TM.every + 0.15)} + i * 0.38); });
      // ===== L3 密码学没有失效。
      pop("#kw-crypto", ${t(LS[3])}, 0.3);
      // ===== L4 攻击者没有破解任何一道数学题。
      pop("#kw-math", ${t(LS[4] + 0.1)}); flash("#ck0, #ck1, #ck2, #ck3, #ck4", ${t(TM.math)}, 2, 0.3);
      // ===== L5 证明是一张数学凭据，它说，这一批交易算对了。
      out("#kw-crypto, #kw-math", ${t(LS[5] - 0.2)});
      pop("#big", ${t(TM.cred - 0.2)}, 0.35); draw("cv-big", ${t(TM.cred + 0.2)}); bump("#pcw0", ${t(TM.cred + 0.3)}, 1.1, 1);
      bump("#big", ${t(TM.right)}, 1.05, 1);
      // ===== L6 合约检查了凭据，钱还是被取走。
      out("#big, #cv-big", ${t(LS[6] - 0.2)}); out("#ck0", ${t(LS[6] - 0.2)});
      tl.to("#pcw0", { x: ${MV.x}, y: ${MV.y}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[6])});
      tl.to("#pcw0", { opacity: 0, duration: 0.25 }, ${t(LS[6] + 0.7)});
      KIT.led(tl, "settle-led", ${t(TM.check + 0.3)}, "green"); pop("#lb-settle-ok", ${t(TM.check + 0.3)});
      tl.fromTo(".dA2", { x: (i, el) => ${VF[0]} - +el.getAttribute("cx"), y: (i, el) => ${VF[1]} - +el.getAttribute("cy"), opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.06, immediateRender: false }, ${t(TM.take - 0.6)});
      bump("#lb-dots", ${t(TM.take + 0.2)}, 1.12, 1);
      // ===== L7 先猜一道题。
      out("#ev, #src", ${t(LS[7] - 0.2)});
      pop("#qc", ${t(LS[7])}, 0.3);
      // ===== L8 证明全部有效，结算却少处理了一部分交易。
      out("#lb-vault, #lb-dots, #lb-settle-ok, #ck1, #ck2, #ck3, #ck4", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "settleE", 1.1);
      fadeIn("#g32", ${t(TM.settle)}, 0.4); pop("#lb-g32", ${t(TM.settle + 0.4)});
      pop("#qc-r0", ${t(TM.settle + 0.2)});
      // ===== L9 只修验证器合约，能堵住这个洞吗？
      out("#lb-g32", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "verifD", 1.4);
      pop("#lb-fix", ${t(TM.vf + 0.4)}); pop("#qc-r1", ${t(TM.vf + 0.6)});
      // ===== L10 先记住这个问题。
      tl.to("#qc", { y: ${QSHIFT}, scale: 0.85, transformOrigin: "100% 0%", duration: 0.5, ease: "power2.inOut" }, ${t(LS[10])});
      // ===== L11 一套证明系统，有哪几个环节，每个环节会怎么坏？
      out("#lb-fix", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "wide", 1.4);
      ${JSON.stringify(ZQ.map(([k]) => k))}.forEach((k, i) => { bump("#" + k, ${t(TM.link)} + i * 0.3, 1.15, 1); pop("#zq-" + k, ${t(TM.link)} + i * 0.3); });
`,
});
