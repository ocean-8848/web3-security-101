// ep26/seg2「② 放大器」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// starts on CAMS.ruleA; ends static on CAMS.workshopB
// 读 kit/SEGBASE.md。起始镜头 CAMS.ruleA（BRIEF）。
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 opts.scale 的物件：绕地面点包一层缩放，并换算 anchors（SEGBASE 常见坑 1）
const scP = (g, k) => (p) => [g[0] + (p[0] - g[0]) * k, g[1] + (p[1] - g[1]) * k];
const scA = (v, fn) => Array.isArray(v) ? (v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number" ? fn(v) : v.map((x) => scA(x, fn))) : v;
function wput(key, o, r, dy = 0, extra = {}) {
  const k = o.scale ?? 1, g = at(o);
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${g[0]},${g[1]}) scale(${k}) translate(${-g[0]},${-g[1]})">${svg}</g>` });
  const fn = scP(g, k); for (const n of Object.keys(A[key])) A[key][n] = scA(A[key][n], fn);
}
const mv = (gid, svg) => `<g id="${gid}">${svg}</g>`;   // 平移用外包层（X5.fly 只动它）

// 石板路 + 资金管：放在最远处，先画
{
  const R = L.ROAD, q = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v).map((x) => x.toFixed(1)).join(","));
  add({ u: 0, v: 0 }, `<polygon points="${q.join(" ")}" fill="#dcd6cb" stroke="#cfc8bb" stroke-width="3"/>`, -1e6);
  put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8 }), -1e6 + 1 - (at(L.PIPE.o)[1] - at({ u: 0, v: 0 })[1]));
}
// 区牌
[[L.A_SIGN, "奖池金库"], [L.B_SIGN, "智能体车间"], [L.C_SIGN[0], "会议室"], [L.C_SIGN[1], "开户台"], [L.D_SIGN[0], "找漏洞"], [L.D_SIGN[1], "写代码"],
  [L.E_SIGN[0], "控制闸口"], [L.E_SIGN[1], "用户角"]].forEach(([o, t], i) => put("zs" + i, o, E1.signBoard(o, { id: "zs" + i, style: "plate", text: t, size: 40 })));

// A 左半：奖池 + Freysa；规则对照（上一段终点 ruleA 的物件）
put("vault", L.A_SAFE, O.safe(L.A_SAFE, { id: "vault", gold: true, plate: "奖池" }));
put("freysa", L.A_FREYSA, E8.liqBot(L.A_FREYSA, { id: "freysa", scale: 1.4, scr: "绝不转账" }));
put("prompt", L.A_PROMPT, O.doc(L.A_PROMPT, { id: "prompt", standing: true, title: "提示词", lines: ["绝不转账"], w: 150, h: 190 }));
wput("cm", L.A_CM, E3.contractMachine(L.A_CM, { id: "cm", name: "合约" }));
put("req", L.A_LETTER, E1.letter(L.A_LETTER, { id: "req", w: 60, h: 40 }));
lb("lb-prompt", up(A.prompt.top, 8), "提示词", "lab-ink lab-sm");
lb("lb-cm", up(A.cm.top, 8), "合约 · 绝不转账", "lab-ink lab-sm");

// A 右半：助理角
put("aide", L.A_AIDE, E8.liqBot(L.A_AIDE, { id: "aide", scale: 1.1, scr: "待命" }));
const cardR = E5.keycard(L.A_CARD, { id: "card", scale: 0.55, role: "owner", text: "支付卡" });
A.card = cardR.anchors; add(L.A_CARD, S.hid("card-h", mv("card-mv", cardR.svg)), 60);
put("anyone", L.A_ANYONE, O.person(L.A_ANYONE, { id: "anyone", role: "signer", scale: 0.5 }), 0, { grow: true });
const noteR = O.doc(L.A_NOTE, { id: "note", title: "纸条", lines: ["老板说……"], w: 90, h: 110 });
A.note = noteR.anchors; add(L.A_NOTE, S.hid("note-h", mv("note-mv", noteR.svg)), 5);
const INJ = S.rel(L.A_AIDE, -330, 120);            // 注入文件起点（机器人左前方）
const injR = O.doc(INJ, { id: "inj", title: "网页", lines: ["▒▒▒▒▒▒", "……"], w: 90, h: 110 });
A.inj = injR.anchors; add(INJ, S.hid("inj-h", mv("inj-mv", injR.svg)), 0);
const dA = (p, q) => [q[0] - p[0], q[1] - p[1]];
const INJ_GO = dA(at(INJ), [at(L.A_AIDE)[0] - 70, at(L.A_AIDE)[1] + 10]);                       // 飞到机器人脚边
const NOTE_FROM = dA(at(L.A_NOTE), [at(L.A_ANYONE)[0] - 40, at(L.A_ANYONE)[1] - 60]);           // 从"任何人"手里出发

// A 五岔路口：五块牌 + 亮色版本（隐藏，按句亮起）
const CR = ["AI 是目标", "攻击人", "攻击代码", "开发工具", "防御工具"];
const CRC = ["#e0453a", "#e0453a", "#e0453a", "#1d93ba", "#1f9d55"];
CR.forEach((t, i) => {
  const o = L.A_CROSS[i];
  put("cr" + i, o, E1.signBoard(o, { id: "cr" + i, style: "plate", text: t, size: 32 }));
  const c = E1.signBoard(o, { id: "crc" + i, style: "plate", text: t, size: 32, color: CRC[i], ink: CRC[i] });
  A["crc" + i] = c.anchors; add(o, S.hid("crc" + i + "-h", c.svg), 1);
});

// B 智能体车间（本段终点 workshopB 的物件）
put("agent", L.B_AGENT, E8.liqBot(L.B_AGENT, { id: "agent", scale: 1.4, scr: "待命" }));
wput("hotw", L.B_HOTW, O.hotWallet(L.B_HOTW, { id: "hotw", screen: "transfer / approve" }));
wput("chainB", L.B_CHAIN, O.chain(L.B_CHAIN, { id: "chainB", n: 3, title: "链上" }));
wput("phoneB", L.B_PHONE, O.phone(L.B_PHONE, { id: "phoneB" }));
wput("browB", L.B_BROWSER, O.browserWin(L.B_BROWSER, { id: "browB", title: "网页" }));
wput("cabB", L.B_CABINET, E3.slotCabinet(L.B_CABINET, { id: "cabB", title: "长期记忆" }));
wput("manB", L.B_MANUAL, E3.manual(L.B_MANUAL, { id: "manB", title: "工具说明" }));
wput("panB", L.B_PANEL, E5.funcPanel(L.B_PANEL, { id: "panB", title: "运维面板" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-agent", up(A.aide.top, 70), "AI 智能体", "lab-cs");
lb("lb-tools", up(A.aide.top, 22), "调用工具 · 执行操作", "lab-ink lab-sm");
lb("lb-ex1", up(A.aide.top, 120), "例：自动交易", "lab-ink lab-sm");
lb("lb-ex2", up(A.aide.top, 120), "例：自动回复 · 打赏", "lab-ink lab-sm");
lb("lb-pi", [A.aide.top[0] - 250, A.aide.top[1] - 20], "提示注入", "lab-cs");
lb("lb-inj", up(A.inj.top, 10), "藏起来的指令", "lab-ink lab-sm");
lb("lb-card", [A.card.center[0] + 60, A.card.center[1] + 10], "支付卡", "lab-cs lab-sm", "l");
lb("lb-any", up(A.anyone.top, 8), "任何人", "lab-ink lab-sm");
lb("lb-note", [A.note.center[0], A.note.center[1] + 50], "纸条", "lab-ink lab-sm", "t");
lb("lb-key", [at(L.A_AIDE)[0] + 40, at(L.A_AIDE)[1] + 95], "问题不在聪明，而在把卡交给了谁", "lab-rs", "t");
const HEAD = (c) => `<svg width="26" height="26" viewBox="0 0 26 26" style="vertical-align:-6px;margin-right:6px"><circle cx="13" cy="9" r="6" fill="${c}"/><path d="M2 25c1-7 6-9 11-9s10 2 11 9z" fill="${c}"/></svg>`;
lb("lb-boss", [A.aide.top[0] - 170, A.aide.top[1] - 60], `${HEAD("#1f9d55")}老板 ✓`, "lab-g");
lb("lb-boss2", [A.aide.top[0] - 170, A.aide.top[1] - 60], `${HEAD("#e0453a")}<s>老板</s> → 陌生人 ✗`, "lab-r");
lb("lb-mem", [A.aide.top[0] + 120, A.aide.top[1] - 30], "记忆被写假 → 记忆柜", "lab-rs lab-sm", "l");
lb("lb-c0", [A.crc0.board[0], A.crc0.board[1] - 70], "持有钱包的智能体", "lab-r lab-sm");
lb("lb-c3", [A.crc3.board[0], A.crc3.board[1] - 70], "合约 · 配置 · 插件", "lab-cs lab-sm");
lb("lb-c4", [A.crc4.board[0], A.crc4.board[1] - 70], "初筛 · 告警", "lab-g lab-sm");
S.curve("cv-key", S.scr("aideA", A.note.center), S.scr("aideA", A.card.center), { color: "#e0453a" });

// ---------------------------------------------------------------- 屏幕层卡片（wide 镜头 0.105 太小，放大器整块放屏幕层）
const I = {
  mail: `<svg viewBox="0 0 80 80"><path d="M10 58 L40 72 L70 58 L70 26 L40 12 L10 26 Z" fill="#fdeae7" stroke="#e0453a" stroke-width="4" stroke-linejoin="round"/><path d="M10 26 L40 44 L70 26" fill="none" stroke="#e0453a" stroke-width="4"/></svg>`,
  mask: `<svg viewBox="0 0 80 80"><path d="M14 18 Q40 6 66 18 Q70 44 56 62 Q40 74 24 62 Q10 44 14 18 Z" fill="#fff" stroke="#e0453a" stroke-width="4"/><ellipse cx="29" cy="34" rx="7" ry="4.5" fill="#e0453a"/><ellipse cx="51" cy="34" rx="7" ry="4.5" fill="#e0453a"/><path d="M40 38 L37 52 L43 52" fill="none" stroke="#e0453a" stroke-width="3"/></svg>`,
  mag: `<svg viewBox="0 0 80 80"><circle cx="34" cy="34" r="20" fill="#fdeae7" stroke="#e0453a" stroke-width="5"/><path d="M48 48 L68 68" stroke="#e0453a" stroke-width="9" stroke-linecap="round"/></svg>`,
  audit: `<svg viewBox="0 0 80 80"><path d="M18 8 H50 L62 20 V72 H18 Z" fill="#e8f5ec" stroke="#1f9d55" stroke-width="4" stroke-linejoin="round"/><path d="M26 30 H52 M26 40 H52 M26 50 H40" stroke="#1f9d55" stroke-width="3"/><path d="M40 58 L48 66 L64 48" fill="none" stroke="#1f9d55" stroke-width="5" stroke-linecap="round"/></svg>`,
  mon: `<svg viewBox="0 0 80 80"><rect x="8" y="14" width="64" height="44" rx="5" fill="#e8f5ec" stroke="#1f9d55" stroke-width="4"/><path d="M14 38 H28 L34 26 L42 50 L48 36 H66" fill="none" stroke="#1f9d55" stroke-width="4" stroke-linejoin="round"/><path d="M30 70 H50 M40 58 V70" stroke="#1f9d55" stroke-width="4"/></svg>`,
  amp: `<svg viewBox="0 0 120 80"><rect x="6" y="10" width="108" height="62" rx="8" fill="#1c1c1c"/><rect x="14" y="18" width="40" height="46" rx="4" fill="#333"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<circle cx="${22 + c * 12}" cy="${26 + r * 11}" r="3.5" fill="#555"/>`).join("")).join("")}<circle cx="74" cy="34" r="9" fill="#2aa3c9"/><circle cx="98" cy="34" r="9" fill="#2aa3c9"/><path d="M74 34 L78 27 M98 34 L103 29" stroke="#fff" stroke-width="2.5"/><rect x="64" y="52" width="44" height="8" rx="2" fill="#1f9d55"/></svg>`,
  bot: `<svg viewBox="0 0 160 100"><g stroke="#e0453a" stroke-width="4" stroke-linejoin="round"><rect x="14" y="20" width="62" height="54" rx="10" fill="#2aa3c9"/><rect x="24" y="30" width="42" height="20" rx="3" fill="#fff"/><rect x="34" y="8" width="22" height="12" rx="3" fill="#1c1c1c"/><rect x="10" y="74" width="70" height="10" rx="3" fill="#1c1c1c"/><rect x="90" y="36" width="60" height="44" rx="8" fill="#f4f1ea"/><path d="M90 48 H150" fill="none"/><rect x="128" y="54" width="22" height="14" rx="3" fill="#d4a017"/></g><path d="M76 52 H90" stroke="#e0453a" stroke-width="5"/></svg>`,
};
const ic = (id, svg, t, c) => `<div class="amp-ic" id="${id}"><div class="amp-svg">${svg}</div><div class="amp-t" style="color:${c}">${t}</div></div>`;
const html = `
<div id="amp" class="hide" data-layout-allow-overlap>
  <div class="amp-col"><div class="amp-h" style="color:#e0453a">攻击者</div>
    ${ic("ia0", I.mail, "钓鱼 · 更快", "#e0453a")}${ic("ia1", I.mask, "伪造 · 更像", "#e0453a")}${ic("ia2", I.mag, "找漏洞 · 更便宜", "#e0453a")}</div>
  <div class="amp-mid"><div class="amp-big">${I.amp}<div>放大器</div></div>
    <div class="amp-sub">不是一类新漏洞</div>
    <div class="amp-slot hide" id="amp-slot"><div class="amp-new hide" id="amp-new">${I.bot}<div class="amp-cap">持有钱包的智能体<br>说服它 = 转走资产</div></div></div></div>
  <div class="amp-col"><div class="amp-h" style="color:#1f9d55">防御者</div>
    ${ic("id0", I.audit, "审计 · 更广", "#1f9d55")}${ic("id1", I.mon, "监控 · 更快", "#1f9d55")}</div>
</div>
${evt("ev-lim", "比喻的局限", { color: "#8a8a8a" })}`;
const css = `
#amp { position:absolute; left:300px; top:250px; width:1320px; height:600px; background:#fffdf8; border:3px solid #1c1c1c; border-radius:22px;
  box-shadow:0 14px 40px rgba(0,0,0,.18); display:flex; align-items:stretch; padding:28px 34px; box-sizing:border-box; gap:24px; }
.amp-col { width:300px; display:flex; flex-direction:column; align-items:center; gap:16px; }
.amp-h { font:800 40px/1 var(--font, sans-serif); margin-bottom:6px; }
.amp-ic { display:flex; align-items:center; gap:14px; width:290px; }
.amp-svg { width:96px; height:96px; flex:none; } .amp-svg svg { width:100%; height:100%; }
.amp-t { font:700 30px/1.15 var(--font, sans-serif); }
.amp-mid { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; border-left:2px dashed #cfc8bb; border-right:2px dashed #cfc8bb; padding-top:10px; }
.amp-big { display:flex; align-items:center; gap:18px; font:900 78px/1 var(--font, sans-serif); color:#1c1c1c; }
.amp-big svg { width:130px; height:88px; }
.amp-sub { font:700 30px/1 var(--font, sans-serif); color:#6b665e; margin-top:16px; }
.amp-slot { margin-top:30px; width:420px; height:300px; border:4px dashed #8a8a8a; border-radius:18px; display:flex; align-items:center; justify-content:center; }
.amp-new { display:flex; flex-direction:column; align-items:center; gap:10px; }
.amp-new svg { width:260px; height:162px; }
.amp-cap { font:800 30px/1.3 var(--font, sans-serif); color:#e0453a; text-align:center; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  amp: w("放大器", 1), phish: w("钓鱼", 2), fake: w("伪造", 2), bug: w("漏洞", 2), aud: w("审计", 3), mon: w("监控", 3),
  wal: w("钱包", 5), persuade: w("说服", 5),
  tools: w("调用工具", 6), trade: w("自动交易", 7), tip: w("自动回复", 7), pi: w("提示注入", 8), hide: w("藏", 9), exec: w("执行", 9),
  card: w("支付卡", 10), any: w("任何人", 11), note: w("纸条", 11), boss: w("老板", 11),
  key: w("支付卡", 12), lim: w("不成立", 13), real: w("老板", 14), mem: w("记忆", 15), fake2: w("假内容", 15),
  c0: w("目标", 17), c1: w("对着人", 18), c2: w("对着代码", 18), c3: w("开发工具", 19), c4: w("防御工具", 20), last: w("最新", 21),
};
const t = (x) => f(x);
const B0 = A.crc0.board;

S.build({
  cam0: "ruleA", sub: "AI 是放大器，新的只有一件事",
  grid: { u0: -4700, u1: 22600, v0: -13900, v1: 14100 }, box: [-1890, -7790, 18500, 10490],   // 盖住本段镜头 ruleA / wide / aideA / crossA / workshopB（含上一段终点 ruleA）
  shown: ["#lb-prompt", "#lb-cm"], css, html,
  terms: [
    { id: "t0", t: "大语言模型", d: "用海量文本训练、能生成文字的模型", at: w("大语言模型", 6) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给一句准确的说法。 拉到全景
      out("#lb-prompt, #lb-cm", ${t(LS[0] - 0.2)}); cam(${t(LS[0] + 0.1)}, "wide", 1.8, "power2.inOut");
      // ===== L1 放大器大牌（屏幕层）
      pop("#amp", ${t(TM.amp - 0.3)}, 0.4);
      // ===== L2 攻击者三枚红图标依次放大
      tl.set("#ia0, #ia1, #ia2, #id0, #id1", { opacity: 0 }, 0);
      [${t(TM.phish)}, ${t(TM.fake)}, ${t(TM.bug)}].forEach((x, i) => { pop("#ia" + i, x, 0.3); bump("#ia" + i + " .amp-svg", x + 0.3, 1.18); });
      // ===== L3 防御者两枚绿图标
      [${t(TM.aud)}, ${t(TM.mon)}].forEach((x, i) => { pop("#id" + i, x, 0.3); bump("#id" + i + " .amp-svg", x + 0.3, 1.18); });
      // ===== L4 两侧变灰，中间亮出空格
      tl.to(".amp-ic", { opacity: 0.3, filter: "grayscale(1)", duration: 0.4 }, ${t(LS[4] + 0.2)}); pop("#amp-slot", ${t(LS[4] + 0.6)}, 0.35);
      // ===== L5 空格里：机器人 + 钱包，红描边
      pop("#amp-new", ${t(TM.wal)}, 0.35); tl.to("#amp-slot", { borderColor: "#e0453a", duration: 0.3 }, ${t(TM.persuade)});
      // ===== L6 AI 智能体定义：移到助理角
      out("#amp", ${t(LS[6] - 0.4)}, 0.3); cam(${t(LS[6] - 0.1)}, "aideA", 1.6, "power2.inOut");
      X8.botLamp(tl, "aide", ${t(LS[6] + 1.2)}, 1.4, 1); pop("#lb-agent", ${t(LS[6] + 1.4)}); pop("#lb-tools", ${t(TM.tools)});
      // ===== L7 自动交易 / 自动回复打赏
      X8.botScr(tl, "aide", ${t(TM.trade)}, "交易"); pop("#lb-ex1", ${t(TM.trade)});
      out("#lb-ex1", ${t(TM.tip - 0.2)}); X8.botScr(tl, "aide", ${t(TM.tip)}, "打赏"); pop("#lb-ex2", ${t(TM.tip)});
      // ===== L8 提示注入
      out("#lb-ex2, #lb-tools", ${t(LS[8] - 0.2)}); X8.botScr(tl, "aide", ${t(LS[8])}, "待命"); pop("#lb-pi", ${t(TM.pi)});
      // ===== L9 藏着指令的文件飞进机器人，小屏变红
      fadeIn("#inj-h", ${t(LS[9])}); pop("#lb-inj", ${t(TM.hide)});
      out("#lb-inj", ${t(TM.exec - 0.8)}); X5.fly(tl, "inj-mv", ${t(TM.exec - 0.6)}, ${INJ_GO[0].toFixed(1)}, ${INJ_GO[1].toFixed(1)}, 0.7, 40);
      X8.botScr(tl, "aide", ${t(TM.exec + 0.2)}, "照做", true); out("#inj-h", ${t(TM.exec + 0.4)}, 0.3);
      // ===== L10 支付卡挂到胸前
      out("#lb-pi, #lb-agent", ${t(LS[10] - 0.2)}); X8.botScr(tl, "aide", ${t(LS[10])}, "待命");
      X5.fly(tl, "card-mv", 0, 0, -90, 0.01); fadeIn("#card-h", ${t(TM.card - 0.2)}); X5.fly(tl, "card-mv", ${t(TM.card)}, 0, 0, 0.6); pop("#lb-card", ${t(TM.card + 0.6)});
      // ===== L11 任何人递来纸条
      grow("anyone", ${t(TM.any)}); pop("#lb-any", ${t(TM.any + 0.4)});
      X5.fly(tl, "note-mv", 0, ${NOTE_FROM[0].toFixed(1)}, ${NOTE_FROM[1].toFixed(1)}, 0.01); fadeIn("#note-h", ${t(TM.note - 0.2)});
      X5.fly(tl, "note-mv", ${t(TM.note + 0.2)}, 0, 0, 0.8, 30); pop("#lb-note", ${t(TM.note + 1.0)}); X8.botScr(tl, "aide", ${t(TM.boss + 0.6)}, "转账", true);
      // ===== L12 关键画面：纸条 → 支付卡红虚线
      draw("cv-key", ${t(TM.key)}); flash("#card-h", ${t(TM.key + 0.6)}, 2, 0.4); pop("#lb-key", ${t(TM.key + 1.0)});
      // ===== L13 比喻的局限
      out("#cv-key, #lb-key, #lb-any, #lb-note", ${t(LS[13] - 0.2)}); pop("#ev-lim", ${t(TM.lim)});
      // ===== L14 真实助理记得老板
      pop("#lb-boss", ${t(TM.real)}); X8.botScr(tl, "aide", ${t(TM.real)}, "待命");
      // ===== L15 记忆也能被写假
      out("#lb-boss", ${t(TM.fake2 - 0.1)}, 0.15); pop("#lb-boss2", ${t(TM.fake2)}); pop("#lb-mem", ${t(TM.fake2 + 0.6)});
      // ===== L16 五岔路口
      out("#lb-boss2, #lb-mem, #lb-card, #ev-lim", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "crossA", 1.6, "power2.inOut");
      [0, 1, 2, 3, 4].forEach((i) => flash("#cr" + i, ${t(LS[16] + 1.7)} + i * 0.3, 1, 0.4));
      // ===== L17 AI 是目标
      fadeIn("#crc0-h", ${t(TM.c0)}); pop("#lb-c0", ${t(TM.c0 + 0.4)});
      // ===== L18 攻击人 / 攻击代码
      fadeIn("#crc1-h", ${t(TM.c1)}); fadeIn("#crc2-h", ${t(TM.c2)});
      // ===== L19 开发工具
      fadeIn("#crc3-h", ${t(TM.c3)}); pop("#lb-c3", ${t(TM.c3 + 1.8)});
      // ===== L20 防御工具
      fadeIn("#crc4-h", ${t(TM.c4)}); pop("#lb-c4", ${t(TM.c4 + 0.4)});
      // ===== L21 第一块牌放大，右移到智能体车间
      tl.to("#crc0-h", { scale: 1.18, svgOrigin: "${B0[0].toFixed(1)} ${B0[1].toFixed(1)}", duration: 0.35, yoyo: true, repeat: 1 }, ${t(TM.last)});
      out("#lb-c0, #lb-c3, #lb-c4", ${t(LS[21] + 1.2)}); cam(${t(LS[21] + 1.3)}, "workshopB", 2.1, "power2.inOut");
`,
});
