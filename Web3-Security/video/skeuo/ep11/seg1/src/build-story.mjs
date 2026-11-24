// ep11/seg1「① 一个捐赠函数」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.donate（BRIEF 第 2 节镜头路线）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   donate       近景：入口面板（捐赠按钮）+ 借贷合约（seg1 起点 L0–L2、L4、L11–L12；seg5 L3–L4；seg6 L2、L5–L6）
//   balance      近景：天平 + 点阵 + 坏账框 + 两台清算机器人（seg1 L3、L6–L10；seg2 L0–L10；seg6 L1、L7）
//   A            A 借贷大厅中景：售货机 + 入口 + 天平 + 储备 + 坏账框（seg1 终点 L13、seg2 起点、seg2 L11–L12、seg6 结束前回到 A）
//   B            B 清算市场全景（seg2 L13、seg2 终点 L23 供应上限牌、seg3 起点）
//   xvs          近景：XVS + 供应上限 / 抵押率牌 + 价格曲线 + 反身性环（seg2 L17–L23；seg5 L5）
//   liq          近景：价格曲线 + 预言机 / 延迟 + 卖不出的摊位 + 三台清算机器人 + 红点坏账（seg2 L14–L16、L20；seg5 L6）
//   C            C 治理议事厅全景（seg3 L1–L2、L8 一笔交易大框、L10–L11）
//   vote         近景：快照相机 + 投票箱 + 门限表 + 提案 + 1 天沙漏（seg3 L3–L7、L13）
//   guard        近景：门限表 → 时间锁 → 国库 + 守护者否决 + 提案 / 锁 / 重新计时（seg3 L14–L15）
//   reward       C 前排奖励站（seg3 L16–L20；seg3 终点、seg4 起点）
//   Cwide        C 议事厅 + 奖励站远景（seg3 L0 从 B 移过来、seg5 L10 带过快照相机和时间锁）
//   D            D 铸币厂全景：铸币机 + 储备 + 下游三路（seg4 L0、L19 终点；seg5 起点）
//   offchain     近景：链下储备 / 硅谷银行 + 铸币机 + 提货单 / 作废章 + 链下管理人（seg4 L1–L10、L15）
//   mint         近景：铸币机钥匙面板 + 1/3 门限表 + 红钥匙 + USDC / USR（seg4 L11–L14；seg5 L7–L8）
//   market       近景：DEX 池 + 三个交易所摊位 + USDC 价格 + 下游借贷协议（seg4 L9、L16–L18；seg5 L9）
//   E            E 赎回窗口全景（seg5 L11–L12、L16–L17 终点；seg6 起点 L0）
//   queue        近景：赎回队列 + 8 小时时间锁 + 暂停闸刀 + 警报灯 + 团队（seg5 L13–L15）
//   world        全景：所有区（seg5 L0–L2 从 D 拉远、seg6 L8 结束卡前拉远）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.A

// 段内镜头：L2–L4 代码卡在右，入口 + 售货机 + 储备 + 天平挤在左边 1100 px 里（曲线期间不动镜头）
const codeA = L.fit([L.rect(L.PANEL, "funcPanel"), L.rect(L.VEND, "vending"), L.rect(L.RESERVE, "safe"), L.rect(L.BAL, "balance")], [60, 280, 1100, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, codeA }, ext: [E1, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
put("res", L.RESERVE, O.safe(L.RESERVE, { id: "res", gold: true }));
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm" }));
put("pr", L.APIPE.reserve.o, E1.pipe(L.APIPE.reserve.o, { id: "pr", pts: L.APIPE.reserve.pts, flowColor: "#d9a521" }), 0.4);
put("pb", L.APIPE.bal.o, E1.pipe(L.APIPE.bal.o, { id: "pb", pts: L.APIPE.bal.pts }), 0.4);
put("fp", L.PANEL, E5.funcPanel(L.PANEL, { id: "fp", title: "入口", buttons: [
  { name: "存入", guard: "card" }, { name: "借款", guard: "card" }, { name: "取出", guard: "card" }, { name: "捐赠", guard: "none" }] }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal", tilt: 6 }));
put("brw", L.BORROWER, O.person(L.BORROWER, { id: "brw", role: "signer" }));
put("lq0", L.ALIQ[0], E8.liqBot(L.ALIQ[0], { id: "lq0", scr: "HF" }));
put("lq1", L.ALIQ[1], E8.liqBot(L.ALIQ[1], { id: "lq1", scr: "HF" }));

// 点阵（1 点 = 1 美元，示例）：绿 100 = 20 列 × 5 行（右 6 列 = 捐出的 30）；墨 90 = 18 列 × 5 行（右 4 列 = 多出的 20）
const [gx, gy] = at(L.DOTS), SP = 14, DY = 62;
const dots = (x0, c0, c1, color) => { const s = []; for (let c = c0; c < c1; c++) for (let r = 0; r < 5; r++) s.push(`<circle cx="${x0 + c * SP}" cy="${gy + DY + r * SP}" r="5" fill="${color}"/>`); return s.join(""); };
const GX = gx + 10, KX = gx + 290;
add(L.DOTS, S.hid("dg", `<g id="dg70m">${dots(GX, 0, 14, "#1f9d55")}</g><g id="dg30m">${dots(GX, 14, 20, "#1f9d55")}</g>`), 0);
add(L.DOTS, S.hid("dk", `<g id="dk70m">${dots(KX, 0, 14, "#1c1c1c")}</g><g id="dk20m">${dots(KX, 14, 18, "#1c1c1c")}</g>`), 0);
add(L.DOTS, S.hid("dr20", `<g id="dr20m">${dots(KX, 14, 18, "#e0453a")}</g>`), 0);
// 坏账框（BADA）+ 两根红细线
const [bx, by] = at(L.BADA);
add(L.BADA, S.hid("badbox", `<rect x="${bx - 90}" y="${by - 20}" width="240" height="90" rx="10" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="3" stroke-dasharray="10 7"/>`), 0);
add(L.BADA, S.hid("badln", `<path d="M${bx + 150},${by + 10} L${bx + 215},${by - 30} M${bx + 150},${by + 45} L${bx + 215},${by + 85}" stroke="#e0453a" stroke-width="2.5" fill="none"/>`), 0);
// 红点飞进坏账框的位移（Node 侧算好）
const D20 = [bx + 30 - (KX + 15.5 * SP), by + 25 - (gy + DY + 2 * SP)];
const D30 = [A.res.front[0] - (GX + 16.5 * SP), A.res.front[1] - (gy + DY + 2 * SP)];
// L12 组合折线：存入 → 借款 → 捐赠（按钮上方 30）
const cb = [0, 1, 3].map((i) => up(A.fp.btns[i], 70));
add(L.PANEL, S.hid("combo", `<path d="M${cb.map((p) => p.join(",")).join(" L")}" stroke="#ffffff" stroke-width="14" fill="none" stroke-linejoin="round"/><path d="M${cb.map((p) => p.join(",")).join(" L")}" stroke="#1d93ba" stroke-width="8" fill="none" stroke-linejoin="round"/>${cb.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="12" fill="#1d93ba" stroke="#ffffff" stroke-width="3"/>`).join("")}`), 400);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-vm", up(A.vm.top, 8), "借贷合约", "lab-ink");
lb("lb-fp", up(A.fp.top, 8), "入口", "lab-cs");
lb("lb-ok", up(A.fp.top, 8), "单独看：都对", "lab-gs");
lb("lb-rule", up(A.fp.top, 8), "规则内操作", "lab-g");
lb("lb-don", up(A.fp.btns[3], 40), "捐赠", "lab-cs lab-sm");
lb("lb-combo", up(cb[2], 22), "组合", "lab-rs lab-sm");
lb("lb-res", up(A.res.top, 8), "协议储备", "lab-cs lab-sm");
lb("lb-bal", up(A.bal.top, 8), "健康因子", "lab-cs lab-sm");
lb("lb-cdown", up(A.bal.panL, 6), "抵押品 ↓", "lab-r lab-sm");
[0, 1, 2].forEach((i) => lb(`lb-v${i}`, [A.fp.readers[i][0], A.fp.readers[i][1] + 14], "✓", "lab-gs lab-sm", "t"));
lb("lb-x", [A.fp.readers[3][0] + 40, A.fp.readers[3][1] + 30], "✕ 缺检查", "lab-rs lab-sm", "l");
lb("lb-d100", [GX + 9.5 * SP, gy + DY - 14], "抵押品 100", "lab-gs lab-sm");
lb("lb-d70", [GX + 6.5 * SP, gy + DY - 14], "抵押品 70", "lab-gs lab-sm");
lb("lb-k90", [KX + 8.5 * SP, gy + DY - 14], "借款 90", "lab-ink lab-sm");
lb("lb-eg", [gx - 20, gy + DY + 2 * SP], `示例`, "lab-g lab-sm", "r");
lb("lb-bad", [bx + 30, by - 24], "坏账 20", "lab-rs lab-sm");
lb("lb-dep", [bx + 220, by - 30], "存款人", "lab-r lab-sm", "l");
lb("lb-ins", [bx + 220, by + 85], "保险基金", "lab-r lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 1150, y: 300, w: 700 };
const cardA = codeCard("ca", { ...C, head: "捐赠函数", tag: "示意", mono: true, rowHide: true, rows: [
  { html: "function donateToReserves(amount) {" },
  { html: "&nbsp;&nbsp;balance[msg.sender] -= amount;", chip: "抵押品 ↓", chipCls: "x" },
  { html: "&nbsp;&nbsp;reserves += amount;" },
  { html: "&nbsp;&nbsp;// 缺：require(healthFactor &gt;= 1)", chip: "缺", chipCls: "x" },
] });
S.curve("cv1", [C.x - 4, codeRowY(C.y, 1)], S.scr("codeA", A.bal.panL), { color: "#e0453a" });
S.curve("cv3", [C.x - 4, codeRowY(C.y, 3)], S.scr("codeA", A.fp.readers[3]), { color: "#e0453a" });
const html = cardA
  + evt("ev", `Euler Finance · 2023 年 3 月 13 日<br>约 1.97 亿美元 ${gtag("事发时估值")}`, { color: "#e0453a" })
  + evt("src", `来源：Omniscia 复盘 · BlockSec 分析`, { top: ZONE.event.top + 8 })
  + kw("kw-q", `先猜：<b>缺口？</b>`, { x: 1290, y: 190, size: 46, accent: "#e0453a" })
  + kw("kw-gap", `缺口 <b>20</b> 美元`, { x: 1294, y: 186, size: 64, accent: "#e0453a" })
  + kw("kw-end", `规则 → <b>亏钱？</b>`, { x: 720, y: 140, size: 52, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  donate: w("捐赠", 1), res: w("储备", 2), less: w("少了", 3), nochk: w("不检查", 4),
  ex: w("例子", 6), loan: w("借了", 6), give: w("捐出", 7), gapq: w("缺口", 7), gap: w("缺口", 8),
  left: w("只剩", 9), owe: w("欠着", 9), bad: w("坏账", 10), dep: w("存款人", 10), ins: w("保险基金", 10),
  alone: w("单独看", 11), rules: w("规则", 12), combo: w("组合", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "donate", sub: "减少抵押品却不检查",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "抵押品", d: "借款时押给协议、可被没收的资产", at: w("抵押品", 3) },
    { id: "t1", t: "储备", d: "协议自留、用来吸收损失的资金", at: w("储备", 2) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2023 年 3 月 13 日，借贷协议 Euler Finance，损失约 1.97 亿美元，按事发时估值。
      pop("#lb-fp", 2.2); pop("#ev", 2.6);
      // ===== L1 入口，是一个捐赠函数。
      out("#ev", ${t(LS[1] - 0.2)}); pop("#lb-vm", ${t(LS[1] + 0.1)}); pop("#src", ${t(LS[1] + 0.3)});
      [0, 1, 2, 3].forEach((i) => X5.press(tl, "fp", i, ${t(LS[1] + 0.2)} + i * 0.3));
      pop("#lb-don", ${t(TM.donate)}); bump("#lb-don", ${t(TM.donate + 0.4)}, 1.15, 2);
      // ===== L2 它让用户把自己的存款，捐给协议的储备。
      out("#src, #lb-don", ${t(LS[2] - 0.2)}); cam(${t(LS[2] - 0.1)}, "codeA", 1.0);
      pop("#ca", ${t(LS[2] + 0.9)}); [0, 1, 2].forEach((i) => pop("#ca-r" + i, ${t(LS[2] + 1.1)} + i * 0.25, 0.2));
      pop("#lb-res", ${t(TM.res - 0.3)}); fadeIn("#pr-flow", ${t(TM.res)}, 0.3); X1.dash(tl, "pr-flow", ${t(TM.res)}, 2.2, -120);
      KIT.door(tl, "res", ${t(TM.res + 0.6)}, 70, 0.5); KIT.door(tl, "res", ${t(TM.res + 1.8)}, 0, 0.5); out("#pr-flow", ${t(TM.res + 2.3)}, 0.3);
      // ===== L3 捐出去，账户的抵押品就少了。
      pop("#ca-c1", ${t(TM.less - 0.4)}, 0.2); hot("#ca-r1", ${t(TM.less - 0.4)}, "#fde4e1"); draw("cv1", ${t(TM.less - 0.3)});
      pop("#lb-bal", ${t(TM.less - 0.2)}); X1.tilt(tl, "bal", ${t(TM.less)}, -2, 1.0); pop("#lb-cdown", ${t(TM.less + 0.3)});
      // ===== L4 但这个函数，不检查账户是否仍然健康。
      out("#cv1", ${t(LS[4] - 0.2)}); pop("#ca-r3", ${t(TM.nochk - 0.3)}, 0.2); pop("#ca-c3", ${t(TM.nochk)}, 0.2); hot("#ca-r3", ${t(TM.nochk)}, "#fde4e1");
      draw("cv3", ${t(TM.nochk + 0.2)}); X5.guard(tl, "fp", 3, ${t(TM.nochk + 0.6)}, "broken"); pop("#lb-x", ${t(TM.nochk + 0.8)});
      [0, 1, 2].forEach((i) => { X5.rd(tl, "fp", i, ${t(TM.nochk + 1.3)} + i * 0.2, "green"); pop("#lb-v" + i, ${t(TM.nochk + 1.3)} + i * 0.2, 0.2); });
      // ===== L5 先猜一道题。
      out("#ca, #cv3, #lb-cdown, #lb-res, #lb-fp", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "balance", 1.0); pop("#kw-q", ${t(LS[5] + 0.3)});
      // ===== L6 举个例子。一个账户有 100 美元抵押品，借了 90 美元。
      pop("#lb-eg", ${t(TM.ex)}); fadeIn("#dg", ${t(TM.ex + 0.3)}, 0.5); pop("#lb-d100", ${t(TM.ex + 0.6)});
      fadeIn("#dk", ${t(TM.loan)}, 0.5); pop("#lb-k90", ${t(TM.loan + 0.3)}); X1.tilt(tl, "bal", ${t(TM.loan + 0.3)}, 3, 0.9);
      // ===== L7 它捐出 30 美元抵押品，没人检查，也没人偿还。协议的缺口是多少？
      cam(${t(LS[7] - 0.1)}, "A", 1.2); pop("#lb-res", ${t(LS[7] + 1.0)}); pop("#lb-fp", ${t(LS[7] + 1.1)});
      KIT.door(tl, "res", ${t(TM.give - 0.2)}, 70, 0.4);
      tl.to("#dg30m", { x: ${D30[0]}, y: ${D30[1]}, opacity: 0, duration: 1.1, ease: "power2.in" }, ${t(TM.give)});
      KIT.door(tl, "res", ${t(TM.give + 1.3)}, 0, 0.4); out("#lb-d100", ${t(TM.give + 1.0)}, 0.2); pop("#lb-d70", ${t(TM.give + 1.2)});
      bump("#kw-q", ${t(TM.gapq)}, 1.08, 1);
      // ===== L8 缺口是 20 美元。
      out("#kw-q", ${t(LS[8] - 0.2)}); pop("#kw-gap", ${t(TM.gap)});
      // ===== L9 账户只剩 70 美元抵押品，却欠着 90 美元。
      bump("#lb-d70", ${t(TM.left)}, 1.15, 1); X1.tilt(tl, "bal", ${t(TM.left + 0.3)}, -16, 1.0, "power3.in");
      fadeIn("#dr20", ${t(TM.owe)}, 0.4); out("#dk20m", ${t(TM.owe + 0.3)}, 0.2); bump("#lb-k90", ${t(TM.owe + 1.6)}, 1.15, 2); flash("#dr20", ${t(TM.owe + 2.6)}, 2, 0.4);
      // ===== L10 这 20 美元成了坏账，最后由存款人或保险基金承担。
      out("#kw-gap", ${t(LS[10] - 0.2)}); fadeIn("#badbox", ${t(LS[10] + 0.1)}, 0.4);
      tl.to("#dr20m", { x: ${D20[0]}, y: ${D20[1]}, duration: 0.9, ease: "power2.in" }, ${t(TM.bad - 0.3)}); pop("#lb-bad", ${t(TM.bad + 0.6)});
      flash("#fp-gap-3", ${t(TM.bad + 0.6)}, 3); bump("#lb-x", ${t(TM.bad + 0.6)}, 1.2, 2);
      fadeIn("#badln", ${t(TM.dep - 0.2)}, 0.3); pop("#lb-dep", ${t(TM.dep)}); pop("#lb-ins", ${t(TM.ins)}); flash("#badbox", ${t(TM.ins + 1.6)}, 3, 0.4); bump("#lb-bad", ${t(TM.ins + 2.8)}, 1.15, 2);
      // ===== L11 每个函数单独看，都没有错。
      out("#lb-dep, #lb-ins, #badln, #lb-eg, #lb-d70, #lb-k90, #lb-res, #lb-bad, #lb-bal", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "donate", 1.2);
      out("#lb-fp", ${t(TM.alone - 0.2)}, 0.2); pop("#lb-ok", ${t(TM.alone)});
      [0, 1, 2, 3].forEach((i) => X5.press(tl, "fp", i, ${t(TM.alone + 0.2)} + i * 0.3, { status: "#1f9d55" }));
      // ===== L12 攻击者也没有利用代码 bug。他只是按规则操作，换了一种设计者没想到的组合。
      out("#lb-ok", ${t(TM.rules - 0.2)}, 0.2); pop("#lb-rule", ${t(TM.rules)});
      fadeIn("#combo", ${t(TM.rules + 0.6)}, 0.8); pop("#lb-combo", ${t(TM.rules + 1.6)}); bump("#lb-combo", ${t(TM.combo)}, 1.15, 1);
      // ===== L13 规则本身，怎么会让协议亏钱？
      out("#lb-rule, #combo, #lb-combo", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "A", 1.4);
      pop("#lb-fp", ${t(LS[13] + 0.6)}); pop("#lb-bad", ${t(LS[13] + 0.8)}); pop("#lb-bal, #lb-res", ${t(LS[13] + 0.7)}); pop("#kw-end", ${t(LS[13] + 1.0)});
`,
});
