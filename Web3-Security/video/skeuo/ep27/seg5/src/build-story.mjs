// ep27/seg5「⑤ 监控与应急」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.chainD（BRIEF）。
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
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.methE

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E6, E7, E16, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const wput = (key, o, r, k, dy = 0, opt = {}) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...opt, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key] || {})) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const sc = (o) => o.scale;
const DASH = (id, pts, color, extra = "") => S.hid(id, `<path d="M${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L")}" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round" ${extra}/>`);
const GLOW = (id, p, rx = 90, color = "#1f9d55") => S.hid(id, `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${rx}" ry="${rx * 0.5}" fill="${color}" opacity="0.28"/><ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${rx}" ry="${rx * 0.5}" fill="none" stroke="${color}" stroke-width="4"/>`);

// ---------------------------------------------------------------- 世界物件
// D 区链差异角（seg4 末镜 chainD 的画面，开场要在）+ 关口 ⑦ + 传送带 D/E
const [bD, bE] = [L.BELT[2], L.BELT[3]];
put("beltD", bD.o, E2.conveyor(bD.o, { id: "beltD", len: bD.len, width: L.BELT_W }));
put("beltE", bE.o, E2.conveyor(bE.o, { id: "beltE", len: bE.len, width: L.BELT_W }));
wput("gate7", L.D_GATES[1], O.checkpoint(L.D_GATES[1], { id: "gate7", n: "⑦", road: false }), 0.6, 2);
["BNB Chain", "TRON", "Mantle"].forEach((tx, i) => put("chs" + i, L.D_CHAINS[i], E1.signBoard(L.D_CHAINS[i], { id: "chs" + i, style: "plate", text: tx, size: 28 })));
put("ruler", L.D_RULER, E6.decimalRuler(L.D_RULER, { id: "ruler", places: 18, chain: "BSC-USD", scale: sc(L.D_RULER) }));
wput("dclock", L.D_CLOCK, O.clock(L.D_CLOCK, { id: "dclock" }), 0.6);
put("rettag", L.D_RETTAG, E7.returnTag(L.D_RETTAG, { id: "rettag" }));
put("mnt", L.D_COINS[0], E7.oddCoin(L.D_COINS[0], { id: "mnt", scale: 0.6 }));
put("ethc", L.D_COINS[1], E7.oddCoin(L.D_COINS[1], { id: "ethc", scale: 0.6 }));
put("fork", L.D_FORK, E16.forkSwitch(L.D_FORK, { id: "fork", scale: 0.6 }));

// E 区：关口 ⑧ + 版本卡 + 合约
wput("gate8", L.E_GATE, O.checkpoint(L.E_GATE, { id: "gate8", n: "⑧", road: false }), 0.6, 2);
const CARD0 = L.beltAt(L.U_E - 800 / 0.8192);           // 关口 ⑧ 之前
const cardDots = (cid) => {                              // 卡面右上角 8 个过关绿点（第 8 个 L0 亮）
  return (svg) => { const [x, y] = Wp(CARD0.u, CARD0.v, L.BELT_Z); const d = [];
    for (let i = 0; i < 8; i++) d.push(`<circle ${i === 7 ? `id="${cid}-d7" opacity="0"` : ""} cx="${(x + 22 + i * 9).toFixed(1)}" cy="${(y - 100 - i * 3.1).toFixed(1)}" r="3.6" fill="#1f9d55" stroke="#fff" stroke-width="1"/>`);
    return `<g id="${cid}-mv">${svg}${d.join("")}</g>`; };
};
put("card", CARD0, E4.punchCard(CARD0, { id: "card", kind: "card", title: "版本", scale: 0.7, z: L.BELT_Z }), 3, { wrap: cardDots("card") });
put("vend", L.E_VEND, E1.vending(L.E_VEND, { id: "vend", sign: "合约", scale: 0.8 }));
// 监控墙
wput("rack", L.E_RACK, O.rack(L.E_RACK, { id: "rack", tag: "监控" }), 0.6);
put("gauge", L.E_GAUGE, E3.gasGauge(L.E_GAUGE, { id: "gauge", label: "TVL", value: 0.85, scale: 0.8 }));
put("beacon", L.E_BEACON, O.beacon(L.E_BEACON, { id: "beacon" }));
wput("flash", L.E_FLASH, E1.flashDesk(L.E_FLASH, { id: "flash", sign: "FLASH" }), 0.45);
wput("admin", L.E_ADMIN, E5.funcPanel(L.E_ADMIN, { id: "admin", title: "管理员函数", buttons: ["upgrade", "setOracle", "pause"] }), 0.5);
wput("queue", L.E_QUEUE, E1.timeLock(L.E_QUEUE, { id: "queue", frac: 0.6 }), 0.5);
put("oracle", L.E_ORACLE, E1.miniVend(L.E_ORACLE, { id: "oracle", kind: "oracle", label: "预言机", scale: 0.7 }));
put("lockL", L.E_LEDGERS[0], O.ledgerBook(L.E_LEDGERS[0], { id: "lockL", scale: 0.6 }));
put("mintL", L.E_LEDGERS[1], O.ledgerBook(L.E_LEDGERS[1], { id: "mintL", scale: 0.6 }));
put("bounty", L.E_BOUNTY, E1.signBoard(L.E_BOUNTY, { id: "bounty", style: "wood", text: "漏洞赏金", size: 32 }));
put("whitehat", L.E_WHITEHAT, O.person(L.E_WHITEHAT, { id: "whitehat", role: "engineer", scale: 0.5 }));
put("gold", L.E_GOLD, E7.oddCoin(L.E_GOLD, { id: "gold", scale: 0.5 }), 0, { wrap: (s) => S.hid("gold-g", s) });
put("signE", L.E_SIGNS[0], E1.signBoard(L.E_SIGNS[0], { id: "signE", style: "plate", text: "监控与应急", size: 30 }));
// 作战区
put("duty", L.E_DUTY, O.person(L.E_DUTY, { id: "duty", role: "engineer", scale: 0.5 }));
wput("pause", L.E_PAUSE, O.knifeSwitch(L.E_PAUSE, { id: "pause", on: true }), 0.6);
L.E_DESKS.forEach((o, i) => wput("desk" + i, o, O.desk(o, { id: "desk" + i }), 0.5));
L.E_CREW.forEach((o, i) => put("crew" + i, o, O.person(o, { id: "crew" + i, role: i === 1 ? "signer" : "engineer", scale: 0.45 }), 0, { grow: true }));
wput("safe", L.E_SAFE, O.safe(L.E_SAFE, { id: "safe", plate: "SAFE" }), 0.6);
const FZ = L.E_FREEZE;
[[-40, 0], [40, 0]].forEach(([du, dv], i) => { const o = S.rel(FZ, du, dv); put("rc" + i, o, E7.oddCoin(o, { id: "rc" + i, state: "attacker", scale: 0.5 }), 0, { wrap: (s) => S.hid("rc" + i + "-g", s) }); });
wput("ice", FZ, E5.iceShell(FZ, { id: "ice", w: 220, d: 140, h: 150, on: false }), 0.5, 30);
put("notice", L.E_NOTICE, O.doc(L.E_NOTICE, { id: "notice", title: "公告 · 复盘", standing: true, w: 120, h: 150, lines: ["时间线", "根因", "修复"] }), 0, { grow: true });
// mETH 角
put("meth", L.E_METH, E1.vending(L.E_METH, { id: "meth", sign: "mETH", scale: 0.6 }));
wput("hour", L.E_HOUR, O.hourglass(L.E_HOUR, { id: "hour" }), 0.6);
wput("pause2", L.E_PAUSE2, O.knifeSwitch(L.E_PAUSE2, { id: "pause2", on: true }), 0.6);
wput("tower", L.E_TOWER, O.tower(L.E_TOWER, { id: "tower" }), 0.5);
put("cmeth", L.E_CMETH, E7.oddCoin(L.E_CMETH, { id: "cmeth", scale: 0.5 }), 0, { wrap: (s) => S.hid("cmeth-g", s) });

// 原生 SVG：连线、地光、救援币、日历
const P = (o, z = 0) => Wp(o.u, o.v, z);
const vendIn = up(A.vend.ground, 120);
add(L.E_FLASH, DASH("fl-line", [up(A.flash.ground, 40), up(A.vend.ground, 60)], "#e0453a"), 400);
add(L.E_VEND, DASH("rescue-line", [up(A.vend.ground, 70), up(A.safe.ground, 60)], "#2aa3c9"), 400);
const RC0 = up(A.vend.ground, 70), RC1 = up(A.safe.ground, 60);
add(L.E_SAFE, S.hid("rescue-c", [0, 1, 2].map((i) => `<g transform="translate(${-i * 26},${i * 9})"><ellipse cx="${RC0[0]}" cy="${RC0[1]}" rx="13" ry="13" fill="#f0c04a" stroke="#b8860b" stroke-width="2.5"/></g>`).join("")), 420);
const methIn = up(A.meth.ground, 90);
add(L.E_CMETH, DASH("cm-line", [up(A.cmeth.ground, 30), [(A.cmeth.ground[0] + methIn[0]) / 2 + 30, methIn[1] + 40], methIn], "#2aa3c9"), 300);
add(L.E_METH, GLOW("g-meth", A.meth.ground, 110, "#2aa3c9"), -5);
[["g-hour", "hour", 55], ["g-pause2", "pause2", 80], ["g-tower", "tower", 65]].forEach(([id, k, rx]) => add(L["E_" + k.toUpperCase()] || L.E_HOUR, GLOW(id, A[k].ground, rx), -5));
// 三样 → 售货机内部
[["ln-hour", "hour"], ["ln-pause2", "pause2"], ["ln-tower", "tower"]].forEach(([id, k]) => {
  const p0 = up(A[k].ground, 50), p1 = up(A.meth.ground, 110);
  add(L.E_METH, DASH(id, [p0, [(p0[0] + p1[0]) / 2, Math.min(p0[1], p1[1]) - 60], p1], "#2aa3c9", 'stroke-width="4"'), 500);
});
// 日历小图标"事先"
const cal = (id, p) => S.hid(id, `<g transform="translate(${(p[0] + 52).toFixed(1)},${(p[1] - 30).toFixed(1)})"><rect x="0" y="0" width="36" height="32" rx="4" fill="#fff" stroke="#1c1c1c" stroke-width="2.5"/><rect x="0" y="0" width="36" height="10" rx="3" fill="#2aa3c9"/><line x1="9" y1="-4" x2="9" y2="5" stroke="#1c1c1c" stroke-width="2.5"/><line x1="27" y1="-4" x2="27" y2="5" stroke="#1c1c1c" stroke-width="2.5"/><path d="M9 21 l6 6 l12 -12" fill="none" stroke="#1f9d55" stroke-width="3.5"/></g>`);
["hour", "pause2", "tower"].forEach((k) => add(L.E_HOUR, cal("cal-" + k, A[k].ground), 600));
// 队列多一格
const QX = up(A.queue.top, -10);
add(L.E_QUEUE, S.hid("q-new", `<rect x="${QX[0] + 34}" y="${QX[1] - 6}" width="44" height="28" rx="4" fill="#fff" stroke="#e0453a" stroke-width="3"/><text x="${QX[0] + 56}" y="${QX[1] + 14}" font-size="18" font-weight="900" fill="#e0453a" text-anchor="middle">+1</text>`), 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// D 区开场标签（seg4 末镜）
lb("lb-chs", up(A.ruler.top, 4), "18 位小数", "lab-cs lab-sm");
lb("lb-dclock", up(A.dclock.top, 6), "0.45 秒", "lab-cs lab-sm");
lb("lb-ret", up(A.rettag.top, 6), "USDT 返回值", "lab-cs lab-sm");
lb("lb-mnt", up(A.mnt.top, 6), "MNT", "lab-ink lab-sm");
lb("lb-eth", A.ethc.ground, "ETH · ERC-20", "lab-ink lab-sm", "t");
lb("lb-fork", A.fork.ground, "主网分叉", "lab-cs lab-sm", "t");
// E 区
lb("lb-gate8", up(A.gate8.plate, 30), "监控与应急", "lab-cs lab-sm");
lb("lb-vend", up(A.vend.top, 6), "合约", "lab-ink");
lb("lb-rack", up(A.rack.top, 6), "监控", "lab-cs");
lb("lb-bounty", up(A.bounty.top, 6), "白帽先来报告", "lab-gs lab-sm");
lb("lb-white", A.whitehat.ground, "白帽", "lab-cs lab-sm", "t");
lb("lb-gauge", up(A.gauge.top, 6), `10 分钟 · 跌超 10% <span class="sb-gtag">示例</span>`, "lab-rs lab-sm");
lb("lb-flash", [(A.flash.ground[0] + A.vend.ground[0]) / 2, (A.flash.ground[1] + A.vend.ground[1]) / 2 - 60], "同一笔交易", "lab-r lab-sm");
lb("lb-admin", up(A.admin.top, 8), "实现地址变了", "lab-rs lab-sm");
lb("lb-queue", [A.queue.ground[0] - 40, A.queue.ground[1] - 30], "队列 +1", "lab-r lab-sm", "r");
lb("lb-oracle", A.oracle.ground, "偏离 · 心跳超时", "lab-rs lab-sm", "t");
lb("lb-lockL", A.lockL.ground, "锁定量", "lab-cs lab-sm", "t");
lb("lb-mintL", A.mintL.ground, "铸造量", "lab-cs lab-sm", "t");
lb("lb-neq", [(A.lockL.top[0] + A.mintL.top[0]) / 2, (A.lockL.top[1] + A.mintL.top[1]) / 2 - 45], "≠", "lab-r", "c");
lb("lb-duty", up(A.duty.top, 6), "值班 · 确认", "lab-cs lab-sm");
lb("lb-pause", up(A.pause.top, 6), "暂停 · 守护者 · 无延迟", "lab-gs lab-sm");
lb("lb-crew", A.crew1.ground, "开发 · 审计方 · 安全响应", "lab-cs lab-sm", "t");
lb("lb-seal", up(A.desk1.top, 10), "SEAL 911 一类社区应急组织", "lab-ink lab-sm");
lb("lb-safe", up(A.safe.top, 6), "安全地址", "lab-gs lab-sm");
lb("lb-ice", up(A.ice.top, 6), "冻结", "lab-rs lab-sm");
lb("lb-notice", up(A.notice.top, 6), "公告 · 复盘", "lab-ink lab-sm");
lb("lb-meth", up(A.meth.top, 6), "mETH", "lab-ink");
lb("lb-hour", A.hour.ground, "提款延迟", "lab-gs lab-sm", "t");
lb("lb-pause2", A.pause2.ground, "暂停权限", "lab-gs lab-sm", "t");
lb("lb-tower", A.tower.ground, "安全社区", "lab-gs lab-sm", "t");
lb("lb-cmeth", up(A.cmeth.top, 4), "cmETH 追回", "lab-cs lab-sm");
lb("lb-pre", up(A.pause2.top, 40), `事先 ${'<span class="sb-gtag">解读</span>'}`, "lab-cs");

// ---------------------------------------------------------------- 屏幕层卡片
const STEPS = ["确认", "暂停", "作战室", "白帽救援", "冻结", "公告复盘"];
const html = `<div id="flow" class="hide">${STEPS.map((s, i) => `<div class="fl-c" id="fl-${i}"><b>${i + 1}</b>${s}</div>`).join(`<i>›</i>`)}</div>`
  + evt("ev-meth", `Bybit 事故 · mETH 追回 cmETH<br>${gtag("The Block 报道")}`)
  + kw("kw-end", `应急能力 <b>事先</b> 写进合约`, { x: 640, y: 150, size: 44, accent: "#2aa3c9" });
const css = `
  #flow { position: absolute; left: 640px; top: 128px; display: flex; align-items: center; gap: 6px; background: #fffdf8; border-radius: 16px; padding: 12px 16px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
  #flow i { font-style: normal; color: #9a9384; font-size: 30px; font-weight: 900; }
  .fl-c { font-size: 28px; font-weight: 900; color: #5c5850; background: #eeeae2; border-radius: 10px; padding: 8px 14px; white-space: nowrap; }
  .fl-c b { display: inline-block; margin-right: 6px; color: #fff; background: #5c5850; border-radius: 50%; width: 36px; height: 36px; line-height: 36px; text-align: center; font-size: 28px; }
  .fl-c.on { color: #fff; background: #1f9d55; } .fl-c.on b { background: #fff; color: #1f9d55; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  bounty: w("漏洞赏金", 2), tvl: w("锁仓总量", 3), flash: w("闪电贷", 4),
  admin: w("管理员函数", 5), impl: w("实现地址", 5), queue: w("时间锁", 5),
  oracle: w("预言机", 6), beat: w("心跳", 6), lock: w("锁定量", 7), mint: w("铸造量", 7),
  duty: w("值班", 9), pause: w("触发暂停", 10), nodelay: w("没有延迟", 10),
  war: w("作战室", 11), seal: w("社区应急", 11), rescue: w("白帽救援", 12), safe: w("安全的地方", 12),
  freeze: w("冻结", 13), notice: w("公告", 14), review: w("复盘", 14),
  hour: w("提款延迟", 17), p2: w("暂停权限", 17), tower: w("外部安全社区", 17), today: w("出事当天", 18), pre: w("事先", 19),
};
const t = (x) => f(x);
// 版本卡沿 +u 的屏幕位移
const du = (d) => [0.8192 * d, -0.2868 * d];
const CMV1 = du(450 / 0.8192), CMV2 = du(780 / 0.8192);
const [gx0, gy0] = at(L.E_GOLD), [bx0, by0] = at(L.E_BOUNTY);
const DUTY_TO = [-150, -40];

S.build({
  cam0: "chainD", sub: "应急能力要在出事之前写进合约",
  grid: { u0: 9700, u1: 18600, v0: -4000, v1: 4800 }, box: [8500, -5400, 6600, 3000],   // 盖住本段镜头 chainD · monitorE · warE · methE
  shown: ["#lb-chs", "#lb-dclock", "#lb-ret", "#lb-mnt", "#lb-eth", "#lb-fork"], css, html,
  terms: [
    { id: "t0", t: "锁仓总量", d: "协议里锁着的资产总价值", at: w("锁仓总量", 3) },
    { id: "t1", t: "闪电贷", d: "同一笔交易内借出并归还的贷款", at: w("闪电贷", 4) },
    { id: "t2", t: "预言机", d: "把链外价格等数据喂给合约的服务", at: w("预言机", 6) },
    { id: "t3", t: "作战室", d: "事故发生时的临时应急协作小组", at: w("作战室", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      const on = (i, tt) => { tl.set("#fl-" + i, { className: "fl-c on" }, tt); bump("#fl-" + i, tt, 1.12, 1); };
      // ===== L0 上线不是终点。
      out("#lb-chs, #lb-dclock, #lb-ret, #lb-mnt, #lb-eth, #lb-fork", ${t(LS[0] - 0.1)}, 0.3);
      cam(${t(LS[0])}, "monitorE", 2.0, "power2.inOut");
      KIT.belt(tl, "beltE", ${t(LS[0])}, 3.4, 260);
      KIT.arm(tl, "gate8", ${t(LS[0] + 1.6)}, true, 0.4);
      tl.to("#card-mv", { x: ${t(CMV1[0])}, y: ${t(CMV1[1])}, duration: 1.4, ease: "none" }, ${t(LS[0] + 1.7)});
      pop("#card-d7", ${t(LS[0] + 2.4)}, 0.25); pop("#lb-gate8", ${t(LS[0] + 2.2)});
      KIT.arm(tl, "gate8", ${t(LS[0] + 3.2)}, false, 0.4);
      tl.to("#card-mv", { x: ${t(CMV2[0])}, y: ${t(CMV2[1])}, duration: 0.8, ease: "power1.in" }, ${t(LS[0] + 3.1)});
      out("#card-mv", ${t(LS[0] + 3.7)}, 0.3); pop("#lb-vend", ${t(LS[0] + 3.8)});
      // ===== L1 合约上线以后，要有人一直盯着。
      pop("#lb-rack", ${t(LS[1] + 0.3)});
      [0, 1, 2].forEach((i) => { for (let k = 0; k < 4; k++) KIT.led(tl, "rack-led-" + i, ${t(LS[1] + 0.4)} + k * 0.5 + i * 0.15, k % 2 ? "green" : "blue"); });
      // ===== L2 同时开一个漏洞赏金，让发现问题的白帽，有动力先来报告。
      pop("#lb-bounty", ${t(TM.bounty)}); pop("#lb-white", ${t(TM.bounty + 0.3)});
      fadeIn("#gold-g", ${t(TM.bounty + 0.8)}, 0.3);
      tl.fromTo("#gold-g", { x: ${t(bx0 - gx0 + 40)}, y: ${t(by0 - gy0 - 10)} }, { x: 0, y: 0, duration: 0.9, ease: "power2.out" }, ${t(TM.bounty + 0.8)});
      // ===== L3 盯什么？锁仓总量突然下跌，比如 10 分钟内跌了超过 10%。
      X3.gauge(tl, "gauge", ${t(TM.tvl + 0.3)}, 0.45, 1.6, "steps(8)");
      pop("#lb-gauge", ${t(TM.tvl + 0.8)});
      KIT.beacon(tl, "beacon", ${t(TM.tvl + 1.2)}, 2.4, 0.8);
      // ===== L4 同一笔交易里，出现大额闪电贷和本协议的调用。
      out("#lb-gauge, #lb-bounty", ${t(LS[4] - 0.2)}, 0.25);
      fadeIn("#fl-line", ${t(TM.flash + 0.2)}, 0.4); pop("#lb-flash", ${t(TM.flash + 0.5)});
      // ===== L5 任何管理员函数被调用，实现地址变了，时间锁队列里多了新操作。
      out("#fl-line, #lb-flash", ${t(LS[5] - 0.2)}, 0.25);
      X5.press(tl, "admin", 0, ${t(TM.admin + 0.3)}, { hold: true, status: "red" });
      pop("#lb-admin", ${t(TM.impl)});
      fadeIn("#q-new", ${t(TM.queue + 0.3)}, 0.3); pop("#lb-queue", ${t(TM.queue + 0.4)});
      // ===== L6 预言机价格偏离其他来源，或者超过心跳时间没有更新。
      out("#lb-admin, #lb-queue", ${t(LS[6] - 0.2)}, 0.25);
      X1.needle(tl, "oracle", ${t(TM.oracle + 0.3)}, 58, 0.7);
      pop("#lb-oracle", ${t(TM.beat - 0.2)});
      // ===== L7 跨链两侧，锁定量和铸造量对不上。
      out("#lb-oracle", ${t(LS[7] - 0.2)}, 0.25);
      pop("#lb-lockL", ${t(TM.lock)}); pop("#lb-mintL", ${t(TM.mint)}); pop("#lb-neq", ${t(TM.mint + 0.6)});
      // ===== L8 告警响起，接下来是应急流程。
      out("#lb-lockL, #lb-mintL, #lb-neq, #lb-rack, #lb-white, #lb-gate8", ${t(LS[8] - 0.2)}, 0.25);
      cam(${t(LS[8])}, "warE", 1.6, "power2.inOut");
      KIT.beacon(tl, "beacon", ${t(LS[8] + 0.2)}, ${t(LE[10] - LS[8] - 0.4)}, 0.7);
      pop("#flow", ${t(LS[8] + 1.2)}, 0.35);
      // ===== L9 值班人员先确认异常。
      tl.to("#duty", { x: ${DUTY_TO[0]}, y: ${DUTY_TO[1]}, duration: 1.0, ease: "power1.inOut" }, ${t(TM.duty)});
      pop("#lb-duty", ${t(TM.duty + 1.0)}); on(0, ${t(TM.duty + 1.1)});
      // ===== L10 确认后触发暂停，守护者的暂停权限没有延迟。
      out("#lb-duty", ${t(LS[10] - 0.2)}, 0.25);
      KIT.toggle(tl, "pause", ${t(TM.pause + 0.2)}, false, 0.5);
      tl.fromTo("#vend", { filter: "grayscale(0) brightness(1)" }, { filter: "grayscale(1) brightness(0.92)", duration: 0.6 }, ${t(TM.pause + 0.5)});
      on(1, ${t(TM.pause + 0.5)}); pop("#lb-pause", ${t(TM.nodelay)});
      // ===== L11 然后组建作战室，里面有开发和审计方，还有安全响应团队，比如 SEAL 911 这类社区应急组织。
      out("#lb-pause", ${t(LS[11] - 0.2)}, 0.25);
      [0, 1, 2].forEach((i) => grow("crew" + i, ${t(TM.war + 0.1)} + i * 0.2));
      on(2, ${t(TM.war + 0.3)}); pop("#lb-crew", ${t(TM.war + 0.9)}); pop("#lb-seal", ${t(TM.seal)});
      // ===== L12 评估能不能白帽救援，抢先把剩余资金转到安全的地方。
      out("#lb-crew, #lb-seal", ${t(LS[12] - 0.2)}, 0.25);
      on(3, ${t(TM.rescue)}); fadeIn("#rescue-line", ${t(TM.rescue + 0.2)}, 0.4);
      fadeIn("#rescue-c", ${t(TM.safe - 0.6)}, 0.2);
      tl.to("#rescue-c", { x: ${t(RC1[0] - RC0[0])}, y: ${t(RC1[1] - RC0[1])}, duration: 1.2, ease: "power1.inOut" }, ${t(TM.safe - 0.5)});
      out("#rescue-c", ${t(TM.safe + 0.7)}, 0.3); pop("#lb-safe", ${t(TM.safe + 0.4)});
      // ===== L13 联系交易所和稳定币发行方，冻结被盗资金。
      out("#rescue-line, #lb-safe", ${t(LS[13] - 0.2)}, 0.25);
      fadeIn("#rc0-g, #rc1-g", ${t(LS[13] + 0.2)}, 0.3);
      X5.freeze(tl, "ice", ${t(TM.freeze)}, 0.8, "up"); on(4, ${t(TM.freeze + 0.2)}); pop("#lb-ice", ${t(TM.freeze + 0.6)});
      // ===== L14 最后发布公告和复盘。
      grow("notice", ${t(TM.notice)}); pop("#lb-notice", ${t(TM.notice + 0.4)}); on(5, ${t(TM.review)});
      // ===== L15 看一个例子。
      out("#flow, #lb-ice, #lb-notice", ${t(LS[15] - 0.2)}, 0.3);
      cam(${t(LS[15])}, "methE", 1.6, "power2.inOut");
      // ===== L16 在 Bybit 事故里，mETH 协议追回了 cmETH。
      pop("#ev-meth", ${t(LS[16] + 0.1)}); fadeIn("#g-meth", ${t(LS[16] + 0.3)}, 0.4); pop("#lb-meth", ${t(LS[16] + 0.4)});
      fadeIn("#cmeth-g", ${t(LS[16] + 2.6)}, 0.3); pop("#lb-cmeth", ${t(LS[16] + 2.8)}); bump("#lb-meth", ${t(LS[16] + 3.6)}, 1.1, 1);
      // ===== L17 靠的是三样东西，协议本身有提款延迟，团队有暂停权限，外部安全社区快速牵线。
      fadeIn("#g-hour", ${t(TM.hour)}, 0.3); pop("#lb-hour", ${t(TM.hour + 0.1)}); KIT.sand(tl, "hour", ${t(TM.hour)}, 2.0);
      fadeIn("#g-pause2", ${t(TM.p2)}, 0.3); pop("#lb-pause2", ${t(TM.p2 + 0.1)}); KIT.toggle(tl, "pause2", ${t(TM.p2 + 0.1)}, false, 0.5);
      fadeIn("#g-tower", ${t(TM.tower)}, 0.3); pop("#lb-tower", ${t(TM.tower + 0.1)});
      [0, 1, 2, 3].forEach((i) => flash("#tower-wave-" + i, ${t(TM.tower + 0.2)} + i * 0.1, 2, 0.2));
      fadeIn("#cm-line", ${t(TM.tower + 0.8)}, 0.3);
      tl.to("#cmeth-g", { x: ${t(methIn[0] - A.cmeth.ground[0])}, y: ${t(methIn[1] + 40 - A.cmeth.ground[1])}, duration: 1.2, ease: "power1.inOut" }, ${t(TM.tower + 1.4)});
      out("#cmeth-g", ${t(TM.tower + 2.5)}, 0.3);
      // ===== L18 这三样，没有一样是出事当天才能加上的。
      out("#ev-meth, #cm-line, #lb-cmeth", ${t(LS[18] - 0.2)}, 0.3);
      ["hour", "pause2", "tower"].forEach((k, i) => fadeIn("#cal-" + k, ${t(LS[18] + 0.3)} + i * 0.9, 0.3));
      pop("#lb-pre", ${t(LS[18] + 2.9)});
      // ===== L19 应急能力，要事先设计进合约。
      out("#lb-pre", ${t(LS[19] - 0.2)}, 0.25);
      ["hour", "pause2", "tower"].forEach((k, i) => fadeIn("#ln-" + k, ${t(LS[19] + 0.1)} + i * 0.2, 0.4));
      pop("#kw-end", ${t(TM.pre)});
`,
});
