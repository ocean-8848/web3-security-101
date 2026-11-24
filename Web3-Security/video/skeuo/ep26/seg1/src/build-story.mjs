// ep26/seg1「① 说服机器人」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.vaultA（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整条智能体大街（seg2 L0–L5 放大器、seg6 L16 结束卡）
//   vaultA       A 奖池保险柜 + Freysa + 玩家 + 新会话文件 + 金币 + 点阵（seg1 起点 L0–L7）
//   ruleA        A 提示词文件 + 合约机器 + 转账请求信封（seg1 L8–L11 终点；seg2 起点）
//   aideA        A 右半助理角：新助理 + 支付卡 + 递纸条的人（seg2 L6–L15）
//   crossA       A 五岔路口五块牌（seg2 L16–L20）
//   workshopB    B 智能体 + 五个入口 + 钱包工具 + 链（seg2 L21 终点；seg3 起点 L0–L4）
//   injectB      B Grok + 智能体 + 会员 NFT 卡 + 屏蔽墙 + 20 点点阵（seg3 L5–L9）
//   memoryB      B 记忆柜 + 伪造历史记录 + 智能体（seg3 L10–L14）
//   toolB        B 工具说明手册 + MCP 包 + 两把私钥（seg3 L15–L18）
//   panelB       B 运维面板 + 攻击者 + 回复信封 + 55.5 ETH + 台秤 + 代币（seg3 L19–L24 终点；seg4 起点）
//   meetC        C 笔记本视频会议 + 扩展包裹 + 手机视频 + 换脸面具 + 诈骗集团 + 受害者（seg4 L0–L6）
//   kycC         C 相机 + 护照 + 注入电缆 + 钓鱼信 + 暗语 + 家人 + 换渠道确认 + 点阵（seg4 L7–L18 终点；seg5 起点）
//   benchD       D 阅卷机 + 答题卡 + 审计 AI + 放大镜 + 合约机器 + 沙漏 + 点阵（seg5 L0–L9）
//   oracleD      D 开发机 + 工程师 + 报价机 + 幽灵指针 + 坏账点阵（seg5 L10–L14；代码卡 A 在左侧）
//   supplyD      D 假扩展 + 荒地抢注 + 三张工位 + 内部 AI 机柜（seg5 L15–L18）
//   defendD      D 盾 + 工程师 + 审计 AI + 放大镜（seg5 L19–L20 终点；seg6 起点）
//   gateE        E 加固智能体 + 输入隔离墙 + 三道关卡 + 低额钱包 + 主资产 + 额度表 + 确认设备 + 记忆 / 余额 / 面板（seg6 L0–L9）
//   userE        E 右端用户角（seg6 L10–L11）
//   answerE      E 合约限额机器 + 被拒的信封 + 小提示词文件 + 三道关卡（seg6 L12–L15）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.ruleA

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E7, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// wrap helper for objects without opts.scale (SEGBASE 常见坑 1)
const wrapK = (key, o, r, k, extra = (s) => s) => {
  const [gx, gy] = at(o);
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, 0, { wrap: (svg) => extra(`<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`) });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number" && p.length === 2) A[key][n] = sc(p); }
};

// ---------------------------------------------------------------- 世界物件
// 石板路 + 资金管（整段最底层）
const R = L.ROAD, rp = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => at({ u, v }).map((n) => n.toFixed(1)).join(",")).join(" ");
add({ u: 0, v: -9000 }, `<polygon points="${rp}" fill="#d9d5cc" stroke="#c9c3b6" stroke-width="2"/>`);
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8, flow: true }), -8000);

put("safe", L.A_SAFE, O.safe(L.A_SAFE, { id: "safe", gold: true, plate: "奖池" }));
put("freysa", L.A_FREYSA, E8.liqBot(L.A_FREYSA, { id: "freysa", scr: "", scale: 1.4 }));
// 玩家：从左边沿路走进（外层 g 用 GSAP x/y 平移）
put("player", L.A_PLAYER, O.person(L.A_PLAYER, { id: "player", role: "attacker", scale: 0.55 }), 0, { wrap: (s) => S.hid("player-h", s) });
// 新会话文件 + 红色虚线框
const sr = L.rect(L.A_SESSION, "docFlat");
put("sess", L.A_SESSION, O.doc(L.A_SESSION, { id: "sess", title: "新会话", w: 110, h: 130 }), 0, {
  wrap: (s) => S.hid("sess-h", s + `<rect x="${sr[0] - 10}" y="${sr[1] - 10}" width="${sr[2] - sr[0] + 20}" height="${sr[3] - sr[1] + 20}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`) });
// 四枚金币：从保险柜前沿资金管滚向玩家
const COIN0 = [-20, 7];   // 起点（屏幕 px 偏移，柜前路面）
L.A_COINS.forEach((o, i) => {
  const X0 = [-150, -240, -330, -420][i];
  put(`coin${i}`, o, E7.oddCoin(o, { id: `coin${i}`, scale: 0.5 }), 0, { wrap: (s) => S.hid(`coin${i}-h`, s) });
  A[`coin${i}`].dx = COIN0[0] - X0; A[`coin${i}`].dy = COIN0[1] + 0.35 * X0;
});
// 47 点金色点阵（每点约 1000 美元）
const [dx0, dy0] = at(L.A_DOTS), dots = [];
for (let i = 0; i < 47; i++) dots.push(`<circle cx="${(dx0 + 12 + (i % 12) * 23).toFixed(1)}" cy="${(dy0 + 14 + Math.floor(i / 12) * 24).toFixed(1)}" r="8" fill="#f0c04a" stroke="#b8862b" stroke-width="2" style="opacity:0"/>`);
add(L.A_DOTS, `<g id="dotsA">${dots.join("")}</g>`, -2000);
// 角落钥匙（私钥完好）
wrapK("key", L.A_KEY, O.key(L.A_KEY, { id: "key" }), 0.5, (s) => S.hid("key-h", s));
// 规则对照：提示词文件 + 合约机器 + 转账请求信封
put("prompt", L.A_PROMPT, O.doc(L.A_PROMPT, { id: "prompt", title: "提示词", lines: ["绝不转账"], standing: true, w: 150, h: 190 }), 0, { grow: true });
wrapK("cm", L.A_CM, E3.contractMachine(L.A_CM, { id: "cm", name: "合约" }), 0.55);
S.grow("cm");
put("ltr", L.A_LETTER, E1.letter(L.A_LETTER, { id: "ltr", w: 60, h: 40 }), 0, { wrap: (s) => S.hid("ltr-h", s) });

// ---------------------------------------------------------------- 世界标签
const pl = at(L.A_PLAYER);
lb("lb-safe", up(A.safe.top, 8), "奖池", "lab-ink");
lb("lb-fr", [A.freysa.ground[0], A.freysa.ground[1] + 30], "Freysa", "lab-cs lab-sm", "t");
lb("lb-rule", up(A.freysa.top, 62), "绝不转账", "lab-gs");
lb("lb-q", up(A.freysa.top, 62), "转账 → 收款？", "lab-rs");
lb("lb-eq", up(A.freysa.top, 62), "转账 = 收款", "lab-rs");
lb("lb-conv", up(A.freysa.top, 62), "被说服", "lab-rs conv");
lb("lb-pl", [pl[0], pl[1] - 229 * 0.55 - 8], "玩家", "lab-rs lab-sm");
lb("lb-sess", [(sr[0] + sr[2]) / 2 + 110, sr[1] - 72], "新会话 · 伪造", "lab-rs lab-sm");
lb("lb-game", [pl[0] - 40, pl[1] + 40], "对抗游戏", "lab-ink lab-sm", "t");
lb("lb-dots", [dx0 + 140, dy0 - 6], "约 4.7 万美元 · 每点约 1000 美元", "lab-ink lab-sm");
const sg = at(L.A_SAFE);
lb("lb-core", [sg[0] - 195, sg[1] - 200], "✓ 代码完好", "lab-gs lab-sm", "r");
lb("lb-key", [A.key.ground[0] + 55, A.key.ground[1] - 12], `✓ 私钥完好 ${gtag("解读")}`, "lab-gs lab-sm", "l");
lb("lb-pr", up(A.prompt.top, 8), "提示词 · 绝不转账", "lab-gs");
lb("lb-cm", up(A.cm.top, 8), "合约 · 绝不转账", "lab-gs");
lb("lb-ltr", up(A.ltr.top, 6), "转账请求", "lab-rs lab-sm");
lb("lb-q1", up(A.prompt.top, 70), "?", "lab-rs qm");
lb("lb-q2", up(A.cm.top, 70), "?", "lab-rs qm");

// ---------------------------------------------------------------- 屏幕层卡片
S.curve("cv-conv", S.scr("vaultA", A.freysa.scr), S.scr("vaultA", A.safe.center), { color: "#e0453a" });
const html = evt("ev0", `<b>Freysa</b> · 2024 年 11 月 · Base`)
  + evt("ev-src", `来源 · The Block · Cointelegraph 报道`, { top: 128, color: "#e0453a" })
  + kw("kw-guess", "先猜", { x: 820, y: 150, size: 56, accent: "#2aa3c9" })
  + kw("kw-q", "规则写在哪里，才挡得住<b>说服</b>？", { x: 560, y: 150, size: 46, accent: "#e0453a" });
const css = `.conv { font-size: 1.5em; } .qm { font-size: 1.6em; padding: 2px 18px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  rule: w("绝不转账", 1), game: w("对抗游戏", 2), forge: w("伪造", 3), recv: w("收款", 4),
  did: w("照做", 5), amt: w("4.7", 5), code: w("破解代码", 6), key: w("偷私钥", 6), conv: w("说服", 7),
  prompt: w("提示词", 9), contract: w("合约", 9), conv2: w("说服", 10), carry: w("带着", 11),
};
const t = (x) => f(x);
const coinJs = [0, 1, 2, 3].map((i) => `tl.fromTo("#coin${i}-h", { x: ${f(A["coin" + i].dx)}, y: ${f(A["coin" + i].dy)}, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: ${f(1.0 + i * 0.25)}, ease: "power1.out" }, ${t(TM.did + 0.6 + i * 0.15)});`).join(" ");

S.build({
  cam0: "vaultA", sub: "没人偷私钥，钱是被说服走的",
  grid: { u0: -2300, u1: 3000, v0: -2900, v1: 2500 }, box: [-1650, -1160, 3580, 1940],   // 盖住本段镜头 vaultA / ruleA（第一段）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "AI 智能体", d: "能调用工具、执行操作的大语言模型程序", at: w("AI 智能体", 0) },
    { id: "t1", t: "提示词", d: "交给模型的指令和设定文字", at: w("提示词", 9) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2024 年 11 月，一个叫 Freysa 的 AI 智能体，守着一笔奖池。
      pop("#lb-safe", ${t(LS[0] + 0.4)}); pop("#lb-fr", ${t(LS[0] + 0.8)}); pop("#ev0", ${t(LS[0] + 1.0)});
      X8.botLamp(tl, "freysa", ${t(LS[0] + 1.6)}, 1.4, 1, false);
      // ===== L1 它只有一条规则，绝不转账。
      X8.botScr(tl, "freysa", ${t(TM.rule)}, "绝不转账", false); pop("#lb-rule", ${t(TM.rule)});
      // ===== L2 这是一场对抗游戏，玩家的目标，就是让它破例。
      tl.fromTo("#player-h", { x: -260, y: 91, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.4, ease: "power1.out" }, ${t(LS[2])});
      pop("#lb-pl", ${t(LS[2] + 1.3)}); pop("#lb-game", ${t(TM.game)});
      // ===== L3 一名玩家伪造了一个新会话。
      out("#ev0, #lb-game", ${t(LS[3] - 0.2)});
      tl.fromTo("#sess-h", { x: -120, y: -40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6 }, ${t(TM.forge)});
      tl.to("#sess-h", { x: 110, y: -60, duration: 0.9, ease: "power2.inOut" }, ${t(TM.forge + 0.9)}); pop("#lb-sess", ${t(TM.forge + 1.8)});
      // ===== L4 让它相信，转账函数是用来收款的。
      out("#lb-rule", ${t(LS[4] - 0.1)}); pop("#lb-q", ${t(LS[4])}); X8.botScr(tl, "freysa", ${t(LS[4])}, "转账→收款?", true);
      flash("#lb-q", ${t(LS[4] + 0.4)}, 2); out("#lb-q", ${t(TM.recv + 0.1)}, 0.15); pop("#lb-eq", ${t(TM.recv + 0.2)});
      X8.botScr(tl, "freysa", ${t(TM.recv + 0.2)}, "转账=收款", true);
      // ===== L5 它照做了，约 4.7 万美元的奖池被转走。
      out("#sess-h, #lb-sess", ${t(LS[5] - 0.2)}); X8.claw(tl, "freysa", ${t(TM.did)}, true, 0.4); KIT.door(tl, "safe", ${t(TM.did + 0.2)}, 105, 1.0);
      tl.to("#pipe-flow", { stroke: "#e0453a", duration: 0.3 }, ${t(TM.did + 0.4)}); X1.dash(tl, "pipe-flow", ${t(TM.did + 0.4)}, 3.2, 180);
      ${coinJs}
      tl.to("#dotsA circle", { opacity: 1, duration: 0.12, stagger: 0.025 }, ${t(TM.amt)}); pop("#lb-dots", ${t(TM.amt + 0.9)});
      pop("#ev-src", ${t(TM.amt + 0.3)});
      // ===== L6 没有人破解代码，也没有人偷私钥。
      out("#lb-dots, #ev-src", ${t(LS[6] - 0.2)}); pop("#lb-core", ${t(TM.code)});
      tl.to("#key-h", { opacity: 1, duration: 0.3 }, ${t(TM.key - 0.2)}); pop("#lb-key", ${t(TM.key)});
      // ===== L7 钱是被说服走的。
      out("#lb-core, #lb-key, #lb-eq", ${t(LS[7] - 0.2)}); pop("#lb-conv", ${t(TM.conv)}); draw("cv-conv", ${t(TM.conv + 0.2)}, 0.6);
      // ===== L8 先猜一道题。
      out("#lb-conv, #lb-pl, #lb-fr, #lb-safe, #cv-conv, #dotsA", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "ruleA", 1.3); pop("#kw-guess", ${t(LS[8] + 0.3)});
      // ===== L9 如果绝不转账这条规则，写在提示词里，同时也写在合约里。
      grow("prompt", ${t(TM.prompt)}); pop("#lb-pr", ${t(TM.prompt + 0.4)});
      grow("cm", ${t(TM.contract)}); pop("#lb-cm", ${t(TM.contract + 0.4)});
      // ===== L10 玩家说服了模型，钱还会被转走吗？
      out("#kw-guess", ${t(LS[10] - 0.2)});
      tl.fromTo("#ltr-h", { x: -260, y: 91, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.0, ease: "power2.out" }, ${t(LS[10])}); pop("#lb-ltr", ${t(LS[10] + 1.0)});
      pop("#lb-q1", ${t(TM.conv2 + 0.6)}); pop("#lb-q2", ${t(TM.conv2 + 0.8)});
      // ===== L11 带着这个问题，我们看看，AI 给 Web3 安全带来了什么。
      out("#lb-q1, #lb-q2", ${t(TM.carry - 0.2)}); pop("#kw-q", ${t(TM.carry)});
      tl.to("#kw-q", { x: 640, y: 10, scale: 0.6, transformOrigin: "right top", duration: 0.7, ease: "power2.inOut" }, ${t(TM.carry + 2.0)});
`,
});
