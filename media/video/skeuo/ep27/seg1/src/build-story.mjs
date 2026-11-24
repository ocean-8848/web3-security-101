// ep27/seg1「① 审计过也被打穿」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.incidentA（BRIEF）。ends static on CAMS.versionA
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A 展台 + B–E 整条流水线，八道关口都在画内（seg2 L0–L3、L13–L17、L21；seg6 L1、L11 结束卡）
//   incidentA    A 售货机 + 攻击者 + 流出的币 + 点阵（seg1 起点 L0–L5）
//   versionA     A 两张版本卡 + 审计报告 + 公章 + 题卡 + 售货机（seg1 L6–L11 终点；seg2 起点）
//   planeB       B 比喻角：模型飞机 + 图纸 + 风洞 + 公章 + 黑匣子 + 塔 + 扳手 + 焊死投递箱（seg2 L4–L12）
//   gatesB       B 关口 ①②③ + 传送带 + 放大镜 + 告警灯（seg2 L18–L23 终点；seg3 起点）
//   specB        B 规格台 + 规格文件 + 天平 + 角色板 + 编码规范（seg3 L0–L3）
//   unitC        C 阅卷机 + 答题卡 + 关口 ④（seg3 L4–L5）
//   fuzzC        C 摇奖机 + 金库份额机 + 份额 + 台秤 + 取整刀（seg3 L6–L10；代码卡 A 在左侧）
//   invC         C 银行柜台 + 回调臂 + 顺序条 + 天平 + 按钮面板 + 不变量清单（seg3 L11–L21；代码卡 B 在右侧）
//   formalC      C 证明卡 + 数学库机器 + 小工程师 + 关口 ⑤（seg3 L22–L24 终点；seg4 起点）
//   auditD       D 冰封版本卡 + 规格文件 + 两名审计 + 竞赛小人 + 竞赛牌 + 修复单 + 编译器手册 + 关口 ⑥（seg4 L0–L7）
//   deployD      D 笔记本 + 链 + 浏览器 + 部署账户 + 钥匙 + 多签保险柜 + 时间锁 + 关口 ⑦（seg4 L8–L12）
//   chainD       D 三块链牌 + 刻度尺 + 时钟 + 回执签 + 两枚币 + 分叉扳道器（seg4 L13–L19 终点；seg5 起点）
//   monitorE     E 关口 ⑧ + 合约 + 监控墙 + 赏金（seg5 L0–L7）
//   warE         E 值班 + 闸刀 + 作战室 + 安全地址 + 冻结 + 公告，带上合约和告警灯（seg5 L8–L14）
//   methE        E mETH 售货机 + 沙漏 + 闸刀 + 塔 + cmETH 币（seg5 L15–L19 终点；seg6 起点 L0）
//   checkE       E 核对台：审计版本卡 + 线上字节码 + 放大镜 + 证明卡 + 改动小卡（seg6 L2–L10）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1, E4, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const wrapK = (o, k) => { const [gx, gy] = at(o); return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] }; };
put("vm", L.A_VEND, E1.vending(L.A_VEND, { id: "vm", sign: "金库合约", scale: L.A_VEND.scale }));
put("atk", L.A_ATK, O.person(L.A_ATK, { id: "atk", role: "attacker", scale: L.A_ATK.scale }));
L.A_COINS.forEach((o, i) => put("coin" + i, o, E7.oddCoin(o, { id: "coin" + i, scale: o.scale }), 0, { grow: true }));
put("sgnA", L.A_SIGN, E1.signBoard(L.A_SIGN, { id: "sgnA", style: "plate", text: "事故展台", size: 32 }));
put("cAud", L.A_CARD_AUDIT, E4.punchCard(L.A_CARD_AUDIT, { id: "cAud", kind: "card", title: "审计版本", scale: 0.9 }), 0, { grow: true });
put("cLive", L.A_CARD_LIVE, E4.punchCard(L.A_CARD_LIVE, { id: "cLive", kind: "card", title: "上线版本", scale: 0.9 }), 0, { grow: true });
put("rep", L.A_REPORT, O.doc(L.A_REPORT, { id: "rep", title: "审计报告", stamp: true, w: 120, h: 150 }), 0, { grow: true });
{ const W = wrapK(L.A_SEAL, 0.7); put("seal", L.A_SEAL, O.seal(L.A_SEAL, { id: "seal", paper: false }), 0, { wrap: W.wrap, grow: true });
  for (const n of ["top", "center", "ground", "mark"]) if (A.seal[n]) A.seal[n] = W.sc(A.seal[n]); }
put("mag", L.A_REPORT, O.magnifier(L.A_REPORT, { id: "mag", z: 120 }), 30, { grow: true });

// 点阵：45 点（9 × 5），每点约 100 万美元
const [dx, dy] = at(L.A_DOTS), dots = [];
for (let r = 0, i = 0; r < 5; r++) for (let c = 0; c < 9; c++, i++) dots.push(`<circle id="dt${i}" cx="${dx + 14 + c * 34}" cy="${dy + 12 + r * 22}" r="8" fill="#e0453a" opacity="0"/>`);
add(L.A_DOTS, `<g id="dots">${dots.join("")}</g>`, -400);

// 版本卡：上线版本外圈红色虚线框；右卡 → 售货机红虚线；两卡之间地面"审计 → 上线"红虚线 + 红叉
const RL = L.rect(L.A_CARD_LIVE, "punchCard");
add(L.A_CARD_LIVE, S.hid("liveFr", `<rect x="${RL[0] - 12}" y="${RL[1] - 12}" width="${RL[2] - RL[0] + 24}" height="${RL[3] - RL[1] + 24}" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10"/>`), 200);
const pLive = [at(L.A_CARD_LIVE)[0] - 60, at(L.A_CARD_LIVE)[1] - 70], pVm = A.vm.glass ?? A.vm.center;
add(L.A_CARD_LIVE, S.hid("liveLink", `<path d="M${pLive[0]} ${pLive[1]} C ${pLive[0] - 150} ${pLive[1] - 120}, ${pVm[0] + 220} ${pVm[1] - 120}, ${pVm[0] + 40} ${pVm[1]}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/><circle cx="${pVm[0] + 40}" cy="${pVm[1]}" r="9" fill="#e0453a"/>`), 210);
const g0 = Wp(L.A_CARD_AUDIT.u + 40, L.A_CARD_AUDIT.v + 150), g1 = Wp(L.A_CARD_LIVE.u - 40, L.A_CARD_LIVE.v + 150), gm = [(g0[0] + g1[0]) / 2, (g0[1] + g1[1]) / 2];
add(L.A_CARD_LIVE, S.hid("gapLine", `<path d="M${g0[0]} ${g0[1]} L${g1[0]} ${g1[1]}" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10" fill="none"/><circle cx="${g0[0]}" cy="${g0[1]}" r="7" fill="#1f9d55"/><circle cx="${g1[0]}" cy="${g1[1]}" r="7" fill="#e0453a"/>`), 220);
add(L.A_CARD_LIVE, S.hid("gapX", `<g transform="translate(${gm[0]},${gm[1]})"><circle r="22" fill="#fff" stroke="#e0453a" stroke-width="4"/><path d="M-10 -10L10 10M10 -10L-10 10" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/></g>`), 230);

// 题卡（原生 SVG，立在展台后方）
const [qx, qy] = at(L.A_QUIZ);
add(L.A_QUIZ, S.hid("quiz", `<rect x="${qx - 180}" y="${qy - 120}" width="360" height="118" rx="16" fill="#ffffff" stroke="#1c1c1c" stroke-width="3"/>
  <rect x="${qx - 160}" y="${qy - 106}" width="84" height="34" rx="17" fill="#e0453a"/><text x="${qx - 118}" y="${qy - 81}" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">先猜</text>
  <g id="quizQ" opacity="0"><text x="${qx}" y="${qy - 26}" text-anchor="middle" font-size="26" font-weight="700" fill="#1c1c1c">通过审计 = 线上代码安全？</text></g>`), -300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-vm", up(A.vm.top, 8), "金库合约", "lab-ink");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-dots", [dx + 330, dy + 56], "约 4500 万美元<br><span style='font-size:22px'>1 点 ≈ 100 万美元</span>", "lab-r", "l");
lb("lb-rep", up(A.rep.top, 6), "✓ 审计报告", "lab-gs lab-sm");
lb("lb-aud", up(A.cAud.top, 8), "审计版本", "lab-gs");
lb("lb-live", up(A.cLive.top, 8), "上线版本", "lab-rs");
lb("lb-ne", [(at(L.A_CARD_AUDIT)[0] + at(L.A_CARD_LIVE)[0]) / 2, at(L.A_CARD_LIVE)[1] - 70], "<span style='font-size:64px;line-height:1'>≠</span>", "lab-r", "c");
lb("lb-gap", [gm[0], gm[1] + 30], `审计 → 上线 ${gtag("解读")}`, "lab-r lab-sm", "t");
lb("lb-pass", up(A.vm.top, 70), "我们通过了审计", "lab-cs");
lb("lb-repv", up(A.rep.top, 6), "审计版本", "lab-gs lab-sm");
lb("lb-q", up(A.cLive.top, 70), "<span style='font-size:56px;line-height:1'>?</span>", "lab-r", "b");

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev-inc", "<b>PancakeBunny</b><br>2021 年 5 月 · BNB Chain") +
  evt("ev-src", "来源：审计方说明", { color: "#1f9d55", top: ZONE.event.top + 4 }) +
  evt("ev-quiz", "通过审计 = 线上代码安全？", { color: "#e0453a", top: ZONE.event.top + 8 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = { loss: w("4500", 0), audit: w("审计", 1), after: w("审计之后", 2), one: w("一份代码", 3), other: w("另一份", 3),
  unaud: w("没被审过", 4), gap: w("之间", 5), pass: w("通过了审计", 6), q: w("能不能用", 8), which: w("哪一份", 9), who: w("谁来看", 10) };
const t = (x) => f(x);

S.build({
  cam0: "incidentA", sub: "审计看的是一份代码，链上跑的是另一份",
  grid: { u0: -2000, u1: 2500, v0: -2700, v1: 1900 }, box: [-1500, -1100, 3000, 1700],   // 盖住本段镜头 incidentA · versionA
  shown: [], css, html,
  terms: [
    { id: "t0", t: "审计", d: "外部团队对一份代码做的安全审查", at: w("审计", 1) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2021 年 5 月，PancakeBunny 被攻击，损失约 4500 万美元。
      pop("#lb-vm", 1.4); pop("#lb-atk", 1.6); pop("#ev-inc", ${t(LS[0] + 0.3)});
      [0, 1, 2, 3].forEach((i) => grow("coin" + i, ${t(LS[0] + 0.8)} + i * 0.35));
      tl.to(".vm-stock", { opacity: 0.25, duration: 1.4 }, ${t(LS[0] + 0.8)});
      for (let i = 0; i < 45; i++) fadeIn("#dt" + i, ${t(TM.loss - 0.6)} + i * 0.03, 0.12);
      pop("#lb-dots", ${t(TM.loss + 0.9)});
      // ===== L1 这个项目，做过审计。
      grow("rep", ${t(TM.audit - 0.2)}); pop("#lb-rep", ${t(TM.audit + 0.4)});
      // ===== L2 可审计方事后说明，被利用的那份代码，是审计之后才上线的版本。
      out("#ev-inc", ${t(LS[2] - 0.1)}); pop("#ev-src", ${t(LS[2] + 0.2)});
      out("#dots, #lb-dots", ${t(LS[2] + 0.2)}, 0.4);
      grow("cAud", ${t(TM.after)}); grow("cLive", ${t(TM.after + 0.35)});
      // ===== L3 审计看的是一份代码，链上跑的是另一份。（关键画面）
      out("#ev-src", ${t(LS[3] + 0.6)}); pop("#lb-aud", ${t(TM.one)}); grow("seal", ${t(TM.one + 0.2)});
      pop("#lb-live", ${t(TM.other)}); fadeIn("#liveFr", ${t(TM.other + 0.1)}, 0.3);
      fadeIn("#liveLink", ${t(TM.other + 0.5)}, 0.5); pop("#lb-ne", ${t(TM.other + 0.9)});
      // ===== L4 攻击，就发生在那个没被审过的版本上。
      bump("#lb-atk", ${t(LS[4])}, 1.15, 1); flash("#liveFr", ${t(TM.unaud)}, 2, 0.2); bump("#lb-live", ${t(TM.unaud)}, 1.12, 1); bump("#lb-ne", ${t(TM.unaud + 1.6)}, 1.15, 1);
      // ===== L5 审计本身没有失败，出问题的，是审计和上线之间的那一段。
      fadeIn("#gapLine", ${t(TM.gap - 0.6)}, 0.4); pop("#lb-gap", ${t(TM.gap - 0.3)}); pop("#gapX", ${t(TM.gap + 0.3)}, 0.3);
      // ===== L6 项目上线时，常常会说一句，我们通过了审计。
      out("#lb-atk, #lb-ne, #liveLink, #lb-gap, #gapX, #gapLine", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "versionA", 1.4);
      pop("#lb-pass", ${t(TM.pass)});
      // ===== L7 先猜一道题。
      fadeIn("#quiz", ${t(LS[7])}, 0.4);
      // ===== L8 项目方能不能用，我们通过了审计，来证明线上的代码是安全的？
      fadeIn("#quizQ", ${t(TM.q)}, 0.4);
      // ===== L9 想一想，审计报告证明的，到底是哪一份代码。
      out("#lb-rep, #lb-pass", ${t(LS[9] - 0.1)}); grow("mag", ${t(LS[9] + 0.3)}); pop("#lb-repv", ${t(TM.which)}); bump("#lb-aud", ${t(TM.which + 0.3)}, 1.12, 1);
      // ===== L10 还有，审计之后改过的代码，谁来看？
      pop("#lb-q", ${t(TM.who - 0.3)}); bump("#lb-q", ${t(TM.who + 0.3)}, 1.2, 1); flash("#liveFr", ${t(TM.who + 1.3)}, 2, 0.3);
      // ===== L11 带着这两个问题，我们看看，安全怎样写进开发的每一步。
      out("#quiz", ${t(LS[11] + 0.2)}, 0.4); pop("#ev-quiz", ${t(LS[11] + 0.5)});
`,
});
