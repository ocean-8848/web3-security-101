// ep11/seg5「⑤ 顺序规模时间」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.D（BRIEF 第 2 节镜头路线）。
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
// ends static on CAMS.E
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：全景整体下移，给上空的三个旋钮留出 y 100–300（L1–L2）
const ZR = L.ZONE_RECTS;
const worldHi = L.fit([...ZR.A, ...ZR.B, ...ZR.C, ...ZR.R, ...ZR.D, ...ZR.E], [60, 330, 1860, 880], 1);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, worldHi }, ext: [E1, E5, E8, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
// A 借贷大厅
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", sign: "借贷合约" }));
put("fp", L.PANEL, E5.funcPanel(L.PANEL, { id: "fp", title: "入口", buttons: [
  { name: "存入", guard: "card" }, { name: "借款", guard: "card" }, { name: "取出", guard: "card" }, { name: "捐赠", guard: "broken" },
  { name: "新函数", guard: "none", color: "gray" }] }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal" }));
put("res", L.RESERVE, O.safe(L.RESERVE, { id: "res", gold: true }));
// B 清算市场
put("xvs", L.XVS, E1.miniVend(L.XVS, { id: "xvs", kind: "token", label: "XVS", scale: 0.8 }));
put("cap", L.CAP, E1.signBoard(L.CAP, { id: "cap", style: "plate", text: "供应上限" }));
put("rate", L.RATE, E1.signBoard(L.RATE, { id: "rate", style: "plate", text: "抵押率", size: 36 }));
put("price", L.PRICE, E8.twapRecorder(L.PRICE, { id: "price" }));
put("orc", L.ORACLE, E1.miniVend(L.ORACLE, { id: "orc", kind: "oracle", label: "预言机", scale: 0.6 }));
put("ohg", L.OHOUR, O.hourglass(L.OHOUR, { id: "ohg" }));
put("cpool", L.CPOOL, E8.ammPool(L.CPOOL, { id: "cpool", scale: 0.8 }));
L.STALLS.forEach((o, i) => put(`st${i}`, o, E8.marketStall(o, { id: `st${i}`, scale: 0.7, price: "¥ 90", gold: i ? 0 : 4 })));
const BOTSCR = ["gas", "滑点", "gas"];
L.BLIQ.forEach((o, i) => put(`bq${i}`, o, E8.liqBot(o, { id: `bq${i}`, scale: 0.8, open: true, scr: BOTSCR[i] })));
add(L.XVS, S.hid("xvs-ring", `<ellipse cx="${f(A.xvs.center[0])}" cy="${f(A.xvs.center[1] + 10)}" rx="66" ry="24" fill="none" stroke="#2aa3c9" stroke-width="8"/>`), 4);
// C 议事厅 + 奖励站
put("prop", L.PROPOSAL, O.doc(L.PROPOSAL, { id: "prop", title: "提案", standing: true }));
put("ballot", L.BALLOT, E9.commitBox(L.BALLOT, { id: "ballot", scale: 0.8, name: "投票箱" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 3, th: 2, thText: "2/3" }));
put("tre", L.TREASURY, O.safe(L.TREASURY, { id: "tre", gold: true }));
put("dayg", L.DAYGLASS, O.hourglass(L.DAYGLASS, { id: "dayg" }));
put("snap", L.SNAP, X.snapshotCamera(L.SNAP, { id: "snap" }));
put("tlock", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlock" }));
put("veto", L.VETO, O.knifeSwitch(L.VETO, { id: "veto", on: true }));
L.VOTERS.forEach((o, i) => put(`vt${i}`, o, O.person(o, { id: `vt${i}`, role: "signer", scale: 0.6 })));
put("rwd", L.REWARD, E1.vending(L.REWARD, { id: "rwd", sign: "REWARD", scale: 0.6 }));
put("rhg", L.RHOUR, O.hourglass(L.RHOUR, { id: "rhg" }));
put("rpool", L.RPOOL, E8.ammPool(L.RPOOL, { id: "rpool", scale: 0.5 }));
// D 铸币厂（开场 = seg4 终点：下游三路管道全景）
put("mint", L.MINT, X.mintPress(L.MINT, { id: "mint", keys: 3, keyIn: 1, limit: false }));
put("resv", L.RESV, O.safe(L.RESV, { id: "resv", gold: true }));
put("svb", L.SVB, O.safe(L.SVB, { id: "svb", state: "broken" }), 0, { wrap: wrapK(L.SVB, 0.7) });
put("offs", L.OFFSIGN, E1.signBoard(L.OFFSIGN, { id: "offs", text: "链下" }));
put("usdc", L.USDC, E1.miniVend(L.USDC, { id: "usdc", kind: "token", label: "USDC", scale: 0.6 }));
put("usr", L.USR, E1.miniVend(L.USR, { id: "usr", kind: "token", label: "USR", scale: 0.6 }));
put("lend", L.LENDER, E1.vending(L.LENDER, { id: "lend", sign: "LENDING", scale: 0.5 }));
put("dex", L.DEX, E8.ammPool(L.DEX, { id: "dex", scale: 0.6 }));
const EXP = ["0.90+", "0.90+", "0.65"];
L.EXCH.forEach((o, i) => put(`ex${i}`, o, E8.marketStall(o, { id: `ex${i}`, scale: 0.6, head: "USDC", price: EXP[i], state: i === 2 ? "attacker" : "normal" })));
put("upr", L.UPRICE, E8.twapRecorder(L.UPRICE, { id: "upr", scale: 0.8, avg: "0.87" }));
put("msig", L.MSIG, E5.thresholdMeter(L.MSIG, { id: "msig", max: 3, th: 1, thText: "1/3", level: 1 }));
for (const k of ["reserve", "lender", "dex", "exch"]) { const r = L.DPIPE[k]; put(`dp-${k}`, r.o, E1.pipe(r.o, { id: `dp-${k}`, pts: r.pts }), -4); }
// E 赎回窗口
put("queue", L.QUEUE, E1.mempool(L.QUEUE, { id: "queue", sign: "赎回队列", n: 6 }));
put("w8", L.WAIT8, E1.timeLock(L.WAIT8, { id: "w8", frac: 1 }));
put("pause", L.PAUSE, O.knifeSwitch(L.PAUSE, { id: "pause", on: true, text: "暂停" }));
put("alarm", L.ALARM, O.beacon(L.ALARM, { id: "alarm" }));
L.TEAM.forEach((o, i) => put(`tm${i}`, o, O.person(o, { id: `tm${i}`, role: "engineer" })));
put("atk", L.ATTACKER, O.person(L.ATTACKER, { id: "atk", role: "attacker" }));
put("cmeth", L.CMETH, E1.miniVend(L.CMETH, { id: "cmeth", kind: "token", label: "cmETH", scale: 0.6 }));
put("shield", L.SHIELD, O.shield(L.SHIELD, { id: "shield", glow: true }), 0, { grow: true });
L.WAITERS.forEach((o, i) => put(`wt${i}`, o, O.person(o, { id: `wt${i}`, role: "signer", scale: 0.7 })));
// 排队用户头顶的小沙漏：hourglass 不支持 scale，绕地面点缩 0.4 再抬到头顶
L.WAITERS.forEach((o, i) => { const [gx, gy] = at(o);
  add(o, S.hid(`whg${i}`, `<g transform="translate(${gx},${gy - 185}) scale(0.4) translate(${-gx},${-gy})">${O.hourglass(o, { id: `whg${i}-o` }).svg}</g>`), 2); });
// 攻击者的红信封（cmETH 赎回请求），开场隐藏
const LET0 = S.rel(L.ATTACKER, 70, -10);
put("qlet", LET0, E1.letter(LET0, { id: "qlet", state: "attacker" }), 0, { wrap: (svg) => S.hid("qlet-h", svg) });
const QSLOT = A.queue.slots[6];

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-fp", up(A.fp.top, 10), "入口 · 健康检查", "lab-cs");
for (let i = 0; i < 4; i++) lb(`lb-ok${i}`, up(A.fp.readers[i], 16), "✓", "lab-g lab-sm");
lb("lb-don", A.fp.plates[3], "捐赠", "lab-rs lab-sm", "t");
lb("lb-new", A.fp.plates[4], "新函数", "lab-cs lab-sm", "t");
lb("lb-ok4", up(A.fp.readers[4], 16), "✓", "lab-g lab-sm");
lb("lb-capok", up(A.cap.top, 6), "✓ 有上限", "lab-g lab-sm");
lb("lb-xring", [A.xvs.center[0] - 70, A.xvs.center[1] + 10], "额外限制", "lab-cs lab-sm", "r");
lb("lb-gas", up(A.bq0.top, 8), "gas", "lab-rs lab-sm");
lb("lb-slip", up(A.bq2.top, 8), "滑点", "lab-rs lab-sm");
lb("lb-rew", up(A.bq1.top, 56), "清算奖励 ✓", "lab-gs");
lb("lb-disc", [A.bq0.claw[0] - 30, A.bq0.claw[1]], "清算折扣", "lab-cs lab-sm", "r");
lb("lb-disc2", [A.bq0.claw[0] - 30, A.bq0.claw[1]], "折扣 ≤ 上限", "lab-gs lab-sm", "r");
lb("lb-lim", up(A.mint.top, 14), "单笔 / 每日限额", "lab-gs lab-sm");
lb("lb-fuse", [A.mint.lamp[0] - 30, A.mint.lamp[1]], "熔断", "lab-rs lab-sm", "r");
lb("lb-13", up(A.msig.top, 8), "1/3", "lab-rs");
lb("lb-23", up(A.msig.top, 8), "<s>1/3</s> → ≥ 2/3", "lab-gs");
lb("lb-single", [A.msig.center[0] + 70, A.msig.center[1]], "1/3 = 单签", "lab-r lab-sm", "l");
lb("lb-snap", up(A.snap.top, 6), "历史快照", "lab-cs lab-sm");
lb("lb-tlock", up(A.tlock.top, 6), "时间锁", "lab-cs lab-sm");
lb("lb-w8a", up(A.w8.top, 6), "提款延迟", "lab-cs lab-sm");
lb("lb-w8b", up(A.w8.top, 6), "8 小时", "lab-cs");
lb("lb-qlet", up(QSLOT, 70), "cmETH", "lab-rs lab-sm");
lb("lb-pause", [A.pause.top[0] + 40, A.pause.top[1]], "暂停", "lab-rs", "l");
lb("lb-team", up(A.tm1.top, 6), "团队", "lab-cs lab-sm");
lb("lb-cost", [A.wt0.center[0] - 50, A.wt0.center[1]], `<span class="sb-gtag" style="margin:0 10px 0 0">代价</span>正常用户也要等`, "lab-ink lab-sm", "r");
lb("lb-shield", up(A.shield.top, 10), "延迟 = 安全参数", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
// L0 全景：四个区的红框（屏幕层，按 world 镜头换算）
const zb = (z, cam) => { const rs = ZR[z];
  const a = S.scr(cam, [Math.min(...rs.map((q) => q[0])), Math.min(...rs.map((q) => q[1]))]);
  const b = S.scr(cam, [Math.max(...rs.map((q) => q[2])), Math.max(...rs.map((q) => q[3]))]);
  return [Math.max(62, a[0] - 8), Math.max(196, a[1] - 8), Math.min(1858, b[0] + 8), Math.min(870, b[1] + 8)]; };
const frames = ["A", "B", "C", "D"].map((z) => { const [x0, y0, x1, y1] = zb(z, "world");
  return `<div class="zf hide" id="zf-${z}" style="left:${f(x0)}px;top:${f(y0)}px;width:${f(x1 - x0)}px;height:${f(y1 - y0)}px"></div>`; }).join("");
// L1 三个旋钮（worldHi 镜头上空），各拉青蓝细线到区
const KX = [380, 960, 1540], KY = 118;
const KN = ["顺序", "规模", "时间"];
const knobs = KN.map((n, i) => `<div class="knob hide" id="kn${i}" style="left:${KX[i] - 110}px;top:${KY}px"><span class="kd" id="kd${i}"></span>${n}</div>`
  + `<div class="dfl hide" id="dfl${i}" style="left:${KX[i] - 60}px;top:${KY + 112}px">防线</div>`).join("");
const zc = (z) => { const [x0, y0, x1, y1] = zb(z, "worldHi"); return [(x0 + x1) / 2, (y0 + y1) / 2]; };
const KT = [["A"], ["B", "D"], ["C", "E"]];
KT.forEach((zs, i) => zs.forEach((z, j) => S.curve(`ck${i}${j}`, [KX[i] + (j ? 30 : -30), KY + 160], zc(z), { color: "#2aa3c9", sw: 3 })));
// 卡 A（L4）、卡 E（L7–L8）
const CA = { x: 60, y: 120, w: 700 };
const cardA = codeCard("cA", { ...CA, head: "donateToReserves", tag: "示意", mono: true, rows: [
  "function donate(uint amt) {", "  balance[msg.sender] -= amt;", "  reserves += amt;",
  { html: "  require(healthFactor(user) >= 1);", chip: "✓", chipCls: "ok" }, "}"] });
S.curve("cvA", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("donate", A.fp.readers[4]), { color: "#2aa3c9" });
const CE = { x: 60, y: 300, w: 660 };
const cardE = codeCard("cE", { ...CE, head: "铸币限额", tag: "示意", mono: true, rows: [
  "require(amt <= perTxCap);", "require(today + amt <= dailyCap);", "require(approvals >= 2); // 多人审批"] });
S.curve("cvE0", [CE.x + CE.w + 4, codeRowY(CE.y, 1)], S.scr("mint", A.mint.limit));
S.curve("cvE2", [CE.x + CE.w + 4, codeRowY(CE.y, 2)], S.scr("mint", A.msig.center));
// L9 估值汇聚点
const VP = [1480, 590];
[...[0, 1, 2].map((i) => A[`ex${i}`].board), A.dex.dial].forEach((p, i) =>
  S.curve(`cv9-${i}`, S.scr("market", p), VP, { color: "#2aa3c9", sw: i === 2 ? 1.5 : 4, c1: [S.scr("market", p)[0] + 160, S.scr("market", p)[1]], c2: [VP[0] - 160, VP[1]] }));
// L15 时间轴
const tl15 = `<div class="tlx hide" id="tl15">
  <div class="tlx-axis"></div><div class="tlx-bar" id="tl15-bar"></div>
  <div class="tlx-l">一笔交易</div><div class="tlx-r hide" id="tl15-hr">几个小时</div>
  <div class="tlx-i hide" id="tl15-m" style="left:330px">监控</div><div class="tlx-i hide" id="tl15-h" style="left:580px">人工响应</div></div>`;
const html = frames + knobs + `<span class="sb-gtag hide" id="tag-l1" style="position:absolute;left:1120px;top:150px;margin:0">解读</span>`
  + kw("kw-nobug", `攻击者大多 <b>没有</b> 找到代码 bug`, { x: 600, y: 110, size: 40, accent: "#e0453a" })
  + cardA + cardE
  + kw("kw-val", `<b>估值</b> · 多个来源`, { x: 1500, y: 548, size: 36, accent: "#1d93ba" })
  + evt("ev-meth", `<b>mETH</b> · 2025 年 2 月`, { color: "#e0453a" })
  + evt("ev-src", `来源 · <b>The Block 报道</b>`, { top: ZONE.event.top + 6 })
  + kw("kw-rec", `追回 <b>15000</b> 枚 cmETH · 约 <b>4300 万</b>美元`, { x: 440, y: 130, size: 38 })
  + tl15;
const css = `
    .zf { position: absolute; border: 4px dashed #e0453a; border-radius: 14px; }
    .knob { position: absolute; width: 220px; height: 96px; box-sizing: border-box; display: flex; align-items: center; gap: 16px; padding: 0 22px;
      background: #fffdf8; border-radius: 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); font-size: 42px; font-weight: 900; color: #1c1c1c; }
    .knob .kd { width: 58px; height: 58px; flex: none; border-radius: 50%; background: #1d93ba; border: 6px solid #cfe9f2; box-sizing: border-box; position: relative; }
    .knob .kd::after { content: ""; position: absolute; left: 50%; top: 4px; width: 6px; height: 18px; margin-left: -3px; background: #fff; border-radius: 3px; }
    .dfl { position: absolute; width: 120px; text-align: center; background: #1f9d55; color: #fff; font-size: 28px; font-weight: 900; border-radius: 10px; padding: 3px 0 5px; }
    #cA-r3 { color: #9a9488; }
    .tlx { position: absolute; left: 400px; top: 120px; width: 1120px; height: 150px; background: #fffdf8; border-radius: 18px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tlx-axis { position: absolute; left: 40px; right: 40px; top: 96px; height: 4px; background: #c9c2b4; }
    .tlx-bar { position: absolute; left: 40px; top: 86px; width: 40px; height: 24px; border-radius: 6px; background: #e0453a; }
    .tlx-l { position: absolute; left: 30px; top: 22px; font-size: 32px; font-weight: 900; color: #e0453a; }
    .tlx-r { position: absolute; right: 30px; top: 22px; font-size: 32px; font-weight: 900; color: #1d93ba; }
    .tlx-i { position: absolute; top: 20px; font-size: 30px; font-weight: 900; color: #fff; background: #1f9d55; border-radius: 10px; padding: 2px 16px 4px; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  bug: w("代码", 0), shun: w("顺序", 1), gui: w("规模", 1), shi: Math.max(w("时间", 1), w("规模", 1) + 0.5), fang: w("防御", 2),
  chk3: w("检查", 3), add4: w("新增", 4), chk4: w("检查", 4), eul: w("Euler", 4),
  cap5: w("供应上限", 5), ext5: w("额外限制", 5),
  rew6: Math.max(w("吸引力", 6), LS[6] + 2.4), disc6: w("折扣", 6), cap6: w("上限", 6),
  lim7: w("限额", 7), multi7: w("多人审批", 7), fuse7: w("熔断", 7),
  one8: w("一人", 8), val9: w("估值", 9), one9: w("一家", 9),
  snap10: w("快照", 10), tl10: w("时间锁", 10), delay11: w("延迟", 11),
  red12: w("赎回", 12), hr13: w("小时", 13), pause14: w("暂停", 14), rec14: w("追回", 14),
  long15: w("拉长", 15), mon15: w("监控", 15), man15: w("人工", 15), wait16: w("等", 16), safe17: w("安全参数", 17),
};
const t = (x) => f(x);

S.build({
  cam0: "D", sub: "三个旋钮，三道防线",
  grid: { u0: -3400, u1: 9300, v0: -5700, v1: 6800 }, box: [-2000, -2760, 9440, 4280],   // 盖住 world / donate / xvs / liq / mint / market / Cwide / E / queue
  shown: [], css, html,
  terms: [
    { id: "t0", t: "熔断", d: "异常时自动暂停关键操作的开关", at: w("熔断", 7) },
    { id: "t1", t: "cmETH", d: "质押 ETH 所得凭证再质押后的凭证", at: w("cmETH", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#fp-btn-4", { opacity: 0 }, 0);
      // ===== L0 回头看这些事故，攻击者大多没有找到代码 bug。  D → 全景，四区红框淡闪
      cam(${t(LS[0])}, "world", 2.2, "power2.inOut");
      fadeIn("#zf-A, #zf-B, #zf-C, #zf-D", ${t(LS[0] + 2.3)}, 0.3); flash("#zf-A, #zf-B, #zf-C, #zf-D", ${t(LS[0] + 2.7)}, 2, 0.3);
      pop("#kw-nobug", ${t(LS[0] + 0.8)});
      // ===== L1 他们改变的，是三样东西：顺序，规模，时间。  上空三个旋钮
      out("#zf-A, #zf-B, #zf-C, #zf-D, #kw-nobug", ${t(LS[1] - 0.2)});
      cam(${t(LS[1])}, "worldHi", 0.8);
      pop("#tag-l1", ${t(LS[1] + 0.6)}, 0.25);
      pop("#kn0", ${t(TM.shun)}); tl.to("#kd0", { rotation: 90, duration: 0.5 }, ${t(TM.shun + 0.2)}); draw("ck00", ${t(TM.shun + 0.3)}, 0.6);
      pop("#kn1", ${t(TM.gui)}); tl.to("#kd1", { rotation: 90, duration: 0.5 }, ${t(TM.gui + 0.2)}); draw("ck10", ${t(TM.gui + 0.3)}, 0.6); draw("ck11", ${t(TM.gui + 0.4)}, 0.6);
      pop("#kn2", ${t(TM.shi)}); tl.to("#kd2", { rotation: 90, duration: 0.5 }, ${t(TM.shi + 0.2)}); draw("ck20", ${t(TM.shi + 0.3)}, 0.6); draw("ck21", ${t(TM.shi + 0.4)}, 0.6);
      // ===== L2 防御也按这三样来设计。  三块"防线"绿牌
      [0, 1, 2].forEach((i) => pop("#dfl" + i, ${t(TM.fang + 0.2)} + i * 0.25, 0.25));
      // ===== L3 先说顺序。任何会减少抵押品，或者增加债务的路径，都必须在结束时检查健康因子。  A 入口面板四格变绿勾
      out("#kn0, #kn1, #kn2, #dfl0, #dfl1, #dfl2, #tag-l1, #ck00, #ck10, #ck11, #ck20, #ck21", ${t(LS[3] - 0.2)});
      cam(${t(LS[3])}, "donate", 1.4);
      pop("#lb-fp", ${t(LS[3] + 1.3)}, 0.25); pop("#lb-don", ${t(LS[3] + 1.5)}, 0.25);
      [0, 1, 2].forEach((i) => { X5.rd(tl, "fp", i, ${t(TM.chk3)} + i * 0.3, "green"); pop("#lb-ok" + i, ${t(TM.chk3)} + i * 0.3, 0.2); });
      X5.guard(tl, "fp", 3, ${t(TM.chk3 + 1.0)}, "card"); X5.rd(tl, "fp", 3, ${t(TM.chk3 + 1.5)}, "green"); pop("#lb-ok3", ${t(TM.chk3 + 1.5)}, 0.25);
      // ===== L4 新增一个函数，就要确认它走了这道检查。Euler 缺的，就是这一步。  第五个按钮 + 卡 A 第 4 行变绿
      pop("#fp-btn-4", ${t(TM.add4)}, 0.3); pop("#lb-new", ${t(TM.add4 + 0.2)}, 0.25);
      out("#lb-fp", ${t(TM.add4 + 0.2)}, 0.2); pop("#cA", ${t(TM.add4 + 0.5)});
      X5.guard(tl, "fp", 4, ${t(TM.chk4)}, "card"); draw("cvA", ${t(TM.chk4 + 0.2)}, 0.7);
      tl.to("#cA-r3", { color: "#1f9d55", duration: 0.3 }, ${t(TM.chk4 + 0.9)}); pop("#cA-c3", ${t(TM.chk4 + 0.9)}, 0.2);
      X5.rd(tl, "fp", 4, ${t(TM.chk4 + 0.9)}, "green"); pop("#lb-ok4", ${t(TM.chk4 + 0.9)}, 0.2);
      flash("#lb-don", ${t(TM.eul)}, 2, 0.3);
      // ===== L5 再说规模。低流动性抵押品要有供应上限，自家代币做抵押，要有额外限制。  B：供应上限牌亮 + XVS 青蓝箍
      out("#cA, #cvA, #lb-don, #lb-new, #lb-ok0, #lb-ok1, #lb-ok2, #lb-ok3, #lb-ok4", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "xvs", 1.4);
      bump("#cap", ${t(TM.cap5)}, 1.08, 2); pop("#lb-capok", ${t(TM.cap5 + 0.3)}, 0.25);
      fadeIn("#xvs-ring", ${t(TM.ext5)}, 0.4); pop("#lb-xring", ${t(TM.ext5 + 0.2)}, 0.25);
      // ===== L6 清算奖励在极端行情下也要有吸引力，清算折扣要有上限。  liqBot 屏幕"奖励"盖过红签
      out("#lb-capok, #lb-xring", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "liq", 1.0);
      pop("#lb-gas", ${t(LS[6] + 1.0)}, 0.2); pop("#lb-slip", ${t(LS[6] + 1.1)}, 0.2); flash("#lb-gas, #lb-slip", ${t(LS[6] + 1.5)}, 2, 0.4);
      [0, 1, 2].forEach((i) => X8.botScr(tl, "bq" + i, ${t(TM.rew6)} + i * 0.12, "奖励"));
      out("#lb-gas, #lb-slip", ${t(TM.rew6)}, 0.2); pop("#lb-rew", ${t(TM.rew6 + 0.2)}, 0.25);
      pop("#lb-disc", ${t(Math.max(TM.disc6, TM.rew6 + 0.4))}, 0.25); out("#lb-disc", ${t(TM.cap6)}, 0.15); pop("#lb-disc2", ${t(TM.cap6 + 0.1)}, 0.25);
      // ===== L7 铸币要有单笔和每日的累计限额，多人审批，异常时熔断。  D：限额柱出现、挡块卡住飞轮，熔断灯红再绿
      out("#lb-rew, #lb-disc2", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "mint", 1.6);
      pop("#cE", ${t(LS[7] + 1.7)});
      X11.limitBad(tl, "mint", ${t(TM.lim7)}, false); X11.limitShow(tl, "mint", ${t(TM.lim7)}, true); pop("#lb-lim", ${t(TM.lim7 + 0.2)}, 0.25);
      hot("#cE-r0", ${t(TM.lim7)}); hot("#cE-r1", ${t(TM.lim7 + 0.2)}); draw("cvE0", ${t(TM.lim7 + 0.3)}, 0.6);
      X11.mint(tl, "mint", ${t(TM.lim7 + 0.5)}, 1.0, 2); X11.limit(tl, "mint", ${t(TM.lim7 + 1.6)}, true);
      hot("#cE-r2", ${t(TM.multi7)});
      X11.lamp(tl, "mint", ${t(TM.fuse7)}, "red"); pop("#lb-fuse", ${t(TM.fuse7)}, 0.25); X11.lamp(tl, "mint", ${t(TM.fuse7 + 1.4)}, "green");
      // ===== L8 三个签名人里一人就够，等于只有一个签名人。  1/3 划掉 → ≥ 2/3
      out("#lb-fuse, #lb-lim", ${t(LS[8] - 0.2)});
      draw("cvE2", ${t(LS[8] + 0.1)}, 0.6); pop("#lb-13", ${t(LS[8] + 0.3)}, 0.25);
      pop("#lb-single", ${t(TM.one8)}, 0.25);
      out("#lb-13", ${t(LE[8] - 1.2)}, 0.15); pop("#lb-23", ${t(LE[8] - 1.1)}, 0.3);
      // ===== L9 抵押品估值，不能只看一家交易所的订单簿。  三摊 + 池各拉线汇到"估值"
      out("#cE, #cvE0, #cvE2, #lb-23, #lb-single", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "market", 1.0);
      [0, 1, 2, 3].forEach((i) => draw("cv9-" + i, ${t(TM.val9 + 0.1)} + i * 0.15, 0.6));
      pop("#kw-val", ${t(TM.val9 + 0.8)}); flash("#cv9-2", ${t(TM.one9)}, 2, 0.3);
      // ===== L10 最后是时间。投票权用历史快照，提案执行要过时间锁。  拉高带过 C：相机闪光、时间锁亮
      out("#kw-val, #cv9-0, #cv9-1, #cv9-2, #cv9-3", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "Cwide", 1.5);
      X11.snap(tl, "snap", ${t(TM.snap10)}); pop("#lb-snap", ${t(TM.snap10 + 0.2)}, 0.25);
      bump("#tlock", ${t(TM.tl10)}, 1.15, 2); pop("#lb-tlock", ${t(TM.tl10 + 0.1)}, 0.25);
      // ===== L11 提款和赎回，也可以设延迟。  落到 E：赎回队列
      out("#lb-snap, #lb-tlock", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "E", 1.6);
      pop("#lb-w8a", ${t(Math.max(TM.delay11, LS[11] + 1.6))}, 0.25);
      // ===== L12 2025 年 2 月 Bybit 被盗以后，攻击者尝试赎回 cmETH。  红信封投进队列
      pop("#ev-meth", ${t(LS[12] + 0.2)});
      fadeIn("#qlet-h", ${t(TM.red12 - 0.4)}, 0.3);
      X1.walk(tl, "qlet", ${t(TM.red12)}, 1.8, ${JSON.stringify([A.queue.entry, QSLOT])});
      pop("#lb-qlet", ${t(TM.red12 + 1.9)}, 0.25);
      // ===== L13 按 The Block 报道，mETH 协议有 8 小时的提款延迟。  来源卡 + 8 小时表盘倒计时
      out("#ev-meth", ${t(LS[13] - 0.2)}); pop("#ev-src", ${t(LS[13] + 0.2)});
      cam(${t(LS[13])}, "queue", 1.0);
      out("#lb-w8a", ${t(TM.hr13 - 0.1)}, 0.15); pop("#lb-w8b", ${t(TM.hr13)}, 0.25);
      X1.countdown(tl, "w8", ${t(TM.hr13 + 0.3)}, ${t(TM.pause14 - TM.hr13)}, 0.45);
      // ===== L14 团队趁这段时间暂停了合约，追回 15000 枚 cmETH，约 4300 万美元。  警报灯转、拉下暂停、信封退回
      KIT.beacon(tl, "alarm", ${t(LS[14] + 0.1)}, 3.2, 0.8); pop("#lb-team", ${t(LS[14] + 0.3)}, 0.25);
      KIT.toggle(tl, "pause", ${t(TM.pause14)}, false); pop("#lb-pause", ${t(TM.pause14 + 0.2)}, 0.25);
      out("#lb-qlet", ${t(TM.pause14 + 0.5)}, 0.2);
      X1.walk(tl, "qlet", ${t(TM.pause14 + 0.6)}, 1.2, ${JSON.stringify([A.queue.entry])}); out("#qlet-h", ${t(TM.pause14 + 1.8)}, 0.4);
      out("#ev-src", ${t(TM.rec14 - 0.2)}); pop("#kw-rec", ${t(TM.rec14)});
      // ===== L15 延迟把攻击者完成攻击的时间，从一笔交易拉长到几个小时，让监控和人工响应有机会介入。  时间轴拉伸
      out("#kw-rec, #lb-team, #lb-w8b", ${t(LS[15] - 0.2)});
      pop("#tl15", ${t(LS[15] + 0.1)});
      tl.to("#tl15-bar", { width: 1040, backgroundColor: "#1d93ba", duration: 1.2, ease: "power2.inOut" }, ${t(TM.long15)}); pop("#tl15-hr", ${t(TM.long15 + 1.0)}, 0.25);
      pop("#tl15-m", ${t(TM.mon15)}, 0.25); pop("#tl15-h", ${t(TM.man15)}, 0.25);
      // ===== L16 代价是，正常用户也要等。  队列用户头顶小沙漏
      out("#tl15, #lb-pause", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "E", 1.0);
      [0, 1, 2].forEach((i) => fadeIn("#whg" + i, ${t(TM.wait16)} + i * 0.15, 0.3));
      pop("#lb-cost", ${t(LS[16] + 0.6)}, 0.25);
      // ===== L17 所以延迟是一种安全参数，不只是体验问题。  盾牌立起；静止在 E
      grow("shield", ${t(LS[17] + 0.2)}); pop("#lb-shield", ${t(Math.max(TM.safe17, LS[17] + 1.0))}, 0.3);
`,
});
