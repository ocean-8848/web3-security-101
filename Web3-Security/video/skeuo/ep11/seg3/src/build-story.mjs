// ep11/seg3「③ 借来的投票」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.B（BRIEF 第 2 节镜头路线）。
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
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.reward

// 段内专用镜头：把物件挤到右侧 x 900–1820，左侧留给代码卡
const RIGHT = [900, 300, 1820, 860];
const CAMS = {
  ...L.CAMS,
  voteL: L.fit([L.rect(L.SNAP, "snapshotCamera"), L.rect(L.BALLOT, "commitBox"), L.rect(L.METER, "thresholdMeter"), L.rect(L.PROPOSAL, "docStanding"), L.rect(L.DAYGLASS, "hourglass")], RIGHT, 1.4),
  guardR: L.fit([L.rect(L.METER, "thresholdMeter"), L.rect(L.TLOCK, "timeLock"), L.rect(L.TREASURY, "safe"), L.rect(L.VETO, "knifeSwitch")], RIGHT, 1.4),
  rewardL: L.fit(L.ZONE_RECTS.R, RIGHT, 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E5, E8, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// B 清算市场（起点静景，承接 seg2 结尾）
put("xvs", L.XVS, E1.miniVend(L.XVS, { id: "xvs", kind: "token", scale: L.XVS.scale, label: "XVS" }));
put("capb", L.CAP, E1.signBoard(L.CAP, { id: "capb", style: "plate", text: "供应上限" }));
put("rate", L.RATE, E1.signBoard(L.RATE, { id: "rate", style: "plate", text: "抵押率 ↓" }));
put("price", L.PRICE, E8.twapRecorder(L.PRICE, { id: "price" }));
put("orc", L.ORACLE, E1.miniVend(L.ORACLE, { id: "orc", kind: "oracle", scale: L.ORACLE.scale }));
put("ohour", L.OHOUR, O.hourglass(L.OHOUR, { id: "ohour" }));
put("cpool", L.CPOOL, E8.ammPool(L.CPOOL, { id: "cpool", scale: L.CPOOL.scale, lvlL: 0.2 }));
L.STALLS.forEach((q, i) => put("stall" + i, q, E8.marketStall(q, { id: "stall" + i, scale: q.scale, gold: i ? 0 : 9 })));
L.BLIQ.forEach((q, i) => put("bliq" + i, q, E8.liqBot(q, { id: "bliq" + i, scale: q.scale, open: true, scr: ["gas", "滑点", "gas"][i] })));
{
  const [gx, gy] = at(L.BADB), dots = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) dots.push(`<circle cx="${gx - 80 + c * 22 + r * 6}" cy="${gy - 20 + r * 18}" r="6" fill="#e0453a"/>`);
  add(L.BADB, `<g id="badb">${dots.join("")}</g>`, 0);
}
// C 治理议事厅
put("prop", L.PROPOSAL, O.doc(L.PROPOSAL, { id: "prop", title: "提案", standing: true }), 0, { grow: true });
put("ballot", L.BALLOT, E9.commitBox(L.BALLOT, { id: "ballot", scale: L.BALLOT.scale, name: "投票箱" }), 0, { grow: true });
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 3, th: 2, thText: "2/3", level: 0.6 }), 0, { grow: true });
put("tre", L.TREASURY, O.safe(L.TREASURY, { id: "tre", gold: true }), 0, { grow: true });
put("dayg", L.DAYGLASS, O.hourglass(L.DAYGLASS, { id: "dayg" }));
put("fd", L.FLASH, E1.flashDesk(L.FLASH, { id: "fd", gold: false, frame: false }));
put("snap", L.SNAP, X.snapshotCamera(L.SNAP, { id: "snap" }));
put("tlk", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlk", frac: 1 }), 0, { grow: true });
put("veto", L.VETO, O.knifeSwitch(L.VETO, { id: "veto", on: true }), 0, { grow: true });
put("plk", L.PLOCK, O.padlock(L.PLOCK, { id: "plk" }), 0, { grow: true });
put("rclk", L.RECLOCK, O.clock(L.RECLOCK, { id: "rclk" }), 0, { grow: true });
L.VOTERS.forEach((q, i) => put("voter" + i, q, O.person(q, { id: "voter" + i, role: "signer", scale: q.scale })));
// C 前排奖励站
put("rw", L.REWARD, E1.vending(L.REWARD, { id: "rw", scale: L.REWARD.scale, sign: "REWARD" }));
put("rh", L.RHOUR, O.hourglass(L.RHOUR, { id: "rh" }));
put("rp", L.RPOOL, E8.ammPool(L.RPOOL, { id: "rp", scale: L.RPOOL.scale }));
{ // 金币点阵：rc = 一次喷出；rs-i = 一粒一粒慢慢出
  const [gx, gy] = at(L.RCOINS), burst = [], slow = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) burst.push(`<circle cx="${gx + 12 + c * 30}" cy="${gy - 8 + r * 26}" r="8" fill="#d9a521" stroke="#9a7212" stroke-width="1.5"/>`);
  for (let i = 0; i < 6; i++) slow.push(`<circle id="rs-${i}" opacity="0" cx="${gx + 12 + i * 30}" cy="${gy + 18}" r="8" fill="#d9a521" stroke="#9a7212" stroke-width="1.5"/>`);
  add(L.RCOINS, S.hid("rc", burst.join("")) + slow.join(""), 0);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-prop", up(A.prop.top, 8), "提案", "lab-cs lab-sm");
lb("lb-early", up(A.prop.top, 8), "提前 1 天提交", "lab-r lab-sm");
lb("lb-ballot", up(A.ballot.top, 8), "投票箱", "lab-cs lab-sm");
lb("lb-tre", up(A.tre.top, 8), "国库", "lab-cs lab-sm");
lb("lb-legal", up(A.tre.top, 120), "合法地转走资产", "lab-r");
lb("lb-nosnap", up(A.snap.top, 8), "没有快照", "lab-r lab-sm");
lb("lb-emg", A.ballot.door, "紧急通道", "lab-r lab-sm", "r");
lb("lb-day", up(A.dayg.top, 6), "1 天", "lab-cs lab-sm");
lb("lb-now", up(A.meter.top, 8), "2/3 → 立刻执行", "lab-r lab-sm");
lb("lb-fd", up(A.fd.top, 8), "闪电贷", "lab-cs lab-sm");
lb("lb-photo", A.snap.photo, "提案前的区块", "lab-gs lab-sm", "r");
lb("lb-nogold", up(A.fd.top, 8), "那时没有借来的金条", "lab-g lab-sm");
lb("lb-tlk", up(A.tlk.top, 8), "时间锁", "lab-cs lab-sm");
lb("lb-veto", up(A.veto.top, 8), "守护者否决", "lab-gs lab-sm");
lb("lb-quorum", A.meter.th, "法定人数", "lab-gs lab-sm", "l");
lb("lb-plk", up(A.plk.top, 8), "内容锁定", "lab-gs lab-sm");
lb("lb-rclk", up(A.rclk.top, 8), "一改就重新计时", "lab-r lab-sm");
lb("lb-rw", up(A.rw.top, 8), "奖励合约", "lab-ink lab-sm");
lb("lb-same", A.rw.trayOut ?? A.rw.tray, "同一笔交易：存入 · 领奖 · 取出", "lab-r lab-sm", "t");
lb("lb-rh", up(A.rh.top, 8), "随时间累积", "lab-gs lab-sm");
lb("lb-minlock", A.rw.tray, "最短锁定期", "lab-gs lab-sm", "t");
lb("lb-pool", up(A.rp.top, 8), "本区块成交量 · 池子价格", "lab-rs lab-sm");
const mid = [(A.rw.center[0] + A.rp.center[0]) / 2, (A.rw.center[1] + A.rp.center[1]) / 2];
lb("lb-x", mid, "✕", "lab-r", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 60, y: 300, w: 830 }, CD = { x: 60, y: 312, w: 830 };
const cardC = codeCard("cc", { ...CC, head: "投票权怎么算", tag: "示意", mono: true, rows: [
  { html: "votes = token.balanceOf(voter)", chip: "当前余额", chipCls: "x" },
  { html: "votes = getPastVotes(voter, snapshot)", chip: "提案前快照", chipCls: "ok" },
  { html: "timelock.schedule(proposal, delay)", chip: "先排队", chipCls: "ok" },
] });
const cardD = codeCard("cd", { ...CD, head: "奖励怎么算", tag: "示意", mono: true, rows: [
  { html: "reward = balanceOf(user) * rate", chip: "存入那一刻", chipCls: "x" },
  { html: "rewardPerToken += rate * (now - lastUpdate)", chip: "随时间累积", chipCls: "ok" },
] });
const cR = (C, i) => [C.x + C.w + 4, codeRowY(C.y, i)];
S.curve("cv-ballot", cR(CC, 0), S.scr("voteL", A.ballot.slot ?? A.ballot.top), { color: "#e0453a" });
S.curve("cv-photo", cR(CC, 1), S.scr("voteL", A.snap.photo), { color: "#1f9d55" });
S.curve("cv-tlk", cR(CC, 2), S.scr("guardR", A.tlk.top), { color: "#1f9d55" });
S.curve("cv-tray", cR(CD, 0), S.scr("rewardL", A.rw.tray), { color: "#e0453a" });
S.curve("cv-rh", cR(CD, 1), S.scr("rewardL", A.rh.top), { color: "#1f9d55" });
S.curve("cv-pool", S.scr("rewardL", A.rw.center), S.scr("rewardL", A.rp.center), { color: "#e0453a" });
// L8「一笔交易」大框：罩住柜台、投票箱、门限表、国库（镜头 C）
const box = [L.rect(L.FLASH, "flashDesk"), L.rect(L.BALLOT, "commitBox"), L.rect(L.METER, "thresholdMeter"), L.rect(L.TREASURY, "safe")]
  .flatMap((q) => [S.scr("C", [q[0], q[1]]), S.scr("C", [q[2], q[3]])]);
const FX0 = Math.round(Math.min(...box.map((p) => p[0])) - 14), FY0 = Math.round(Math.min(...box.map((p) => p[1])) - 14);
const FX1 = Math.round(Math.max(...box.map((p) => p[0])) + 14), FY1 = Math.min(890, Math.round(Math.max(...box.map((p) => p[1])) + 14));
const STEPS = ["借款", "存入", "投票", "执行", "还款"];
const steps = STEPS.map((s, i) => `<div id="st-${i}" class="st" style="left:${FX0 + 150 + i * 150}px;top:${FY0 - 62}px">${i + 1} ${s}</div>`).join("");
const strikeY = codeRowY(CC.y, 0);
const html = cardC + cardD
  + kw("kw-not", `规则被组合利用 <b>不只借贷</b>`, { x: 780, y: 150 })
  + evt("ev-bs", `Beanstalk · 2022 年 4 月 · 以太坊`)
  + evt("ev-ck", `${gtag("CertiK 分析")}<br>提案满 <b>1 天</b> · 拿到 <b>2/3</b> 票 → 立刻执行`)
  + kw("kw-q", `<b>先猜</b>`, { x: 720, y: 140 })
  + kw("kw-q2", `借来的票能过吗？`, { x: 720, y: 250 })
  + `<div id="tx-frame" style="left:${FX0}px;top:${FY0}px;width:${FX1 - FX0}px;height:${FY1 - FY0}px"><span>一笔交易</span></div>` + steps
  + ck("ck-ret", "已归还", { x: 60, y: 520, w: 270, kind: "g" })
  + ck("ck-no", "挡住了吗：没有", { x: 60, y: 600, w: 270, kind: "r" })
  + evt("ev-amt", `获利口径各方不同<br>CertiK 称 约 7600 万美元<br>Beanstalk 称 约 7700 万美元<br>PeckShield 估 约 8000 万美元<br>${gtag("Cointelegraph 报道")}`)
  + kw("kw-fix", `修复 <b>①②</b>`, { x: 860, y: 170 })
  + `<div id="cc-strike" data-layout-allow-occlusion style="left:${CC.x + 18}px;top:${strikeY - 2}px;width:${CC.w - 220}px"></div>`;
const KS = S.scr("reward", A.rc ?? [at(L.RCOINS)[0] + 90, at(L.RCOINS)[1] + 30]), KT = S.scr("reward", A.rh.center);
const html2 = kw("kw-scale", `借来的是 <b>规模</b>${gtag("解读")}`, { x: Math.round(KS[0] - 120), y: Math.round(KS[1] - 150) })
  + kw("kw-time", `利用的是 <b>时间</b>`, { x: Math.round(KT[0] - 100), y: Math.round(KT[1] - 250) });
const css = `
  #tx-frame{position:absolute;border:4px solid #2aa3c9;border-radius:14px;background:rgba(42,163,201,.06);opacity:0}
  #tx-frame span{position:absolute;left:14px;top:-22px;background:#1d93ba;color:#fff;font-weight:700;font-size:28px;padding:4px 14px;border-radius:8px}
  .st{position:absolute;width:132px;text-align:center;background:#fff;border:3px solid #2aa3c9;color:#1c1c1c;font-weight:700;font-size:28px;padding:6px 0;border-radius:10px;opacity:0}
  #cc-strike{position:absolute;height:4px;background:#e0453a;transform-origin:0 50%;opacity:0}
  #ev-ck{margin-top:8px} #ev-amt{margin-top:16px}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  cur: w("当前", 3), emg: w("紧急通道", 4), day: w("天", 5), two3: w("三分之二", 5), now: w("立刻执行", 5),
  borrow: w("借款", 8), dep: w("存入", 8), vote: w("投票", 8), exe: w("执行", 8), repay: w("还款", 8),
  ret: w("归还", 9), early: w("提前", 10),
  snap: w("快照", 13), notin: w("并不在", 13),
  tlk: w("时间锁", 14), veto: w("否决", 14),
  quorum: w("法定人数", 15), lockc: w("锁定", 15), recount: w("重新计时", 15),
  dep17: w("存入", 17), claim: w("领奖", 17), accu: w("累积", 18), minlock: w("最短锁定期", 18),
  vol: w("成交量", 19), pool: w("池子", 19), scale: w("规模", 20), time: w("时间", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "B", sub: "借来的票也是票",
  grid: { u0: -2400, u1: 7600, v0: -5500, v1: 4500 }, box: [-1800, -2700, 7200, 3500],   // 盖住 B → C 议事厅 → C 奖励站
  shown: [], css, html: html + html2,
  terms: [
    { id: "t0", t: "闪电贷", d: "同一笔交易内借出并归还的无抵押贷款", at: w("闪电贷", 7) },
    { id: "t1", t: "时间锁", d: "通过后必须等一段时间才能执行", at: w("时间锁", 14) },
    { id: "t2", t: "法定人数", d: "提案生效所需的最低投票量", at: w("法定人数", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#cc-r1, #cc-r2, #cd-r1", { opacity: 0 }, 0);
      // ===== L0 不只借贷：从 B 右移到 C 议事厅远景
      cam(${t(LS[0])}, "Cwide", 2.6, "power2.inOut"); pop("#kw-not", ${t(LS[0] + 1.2)});
      // ===== L1 治理攻击：提案 → 投票箱 → 门限表 → 国库依次入画
      out("#kw-not", ${t(LS[1] - 0.2)}); cam(${t(LS[1])}, "C", 1.4);
      grow("prop", ${t(LS[1] + 0.6)}); pop("#lb-prop", ${t(LS[1] + 1.0)});
      grow("ballot", ${t(LS[1] + 1.4)}); pop("#lb-ballot", ${t(LS[1] + 1.8)});
      grow("meter", ${t(LS[1] + 2.2)}); grow("tre", ${t(LS[1] + 3.0)}); pop("#lb-tre", ${t(LS[1] + 3.4)});
      pop("#lb-legal", ${t(w("合法地", 1))});
      // ===== L2 事件卡
      out("#lb-legal", ${t(LS[2] - 0.2)}); pop("#ev-bs", ${t(LS[2] + 0.2)});
      // ===== L3 按当前存款计票：相机没有快照 + 代码卡 C 第 1 行
      out("#ev-bs, #lb-prop, #lb-ballot, #lb-tre", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "voteL", 1.2);
      X11.lensBad(tl, "snap", ${t(LS[3] + 1.0)}, true); pop("#lb-nosnap", ${t(LS[3] + 1.1)});
      pop("#cc", ${t(TM.cur - 0.3)}); draw("cv-ballot", ${t(TM.cur + 0.3)}); hot("#cc-r0", ${t(TM.cur + 0.3)}, "#e0453a");
      // ===== L4 紧急通道：投票箱前门翻开
      X9.flap(tl, "ballot", ${t(TM.emg - 0.2)}, 60); pop("#lb-emg", ${t(TM.emg + 0.2)});
      // ===== L5 CertiK：1 天 + 2/3 → 立刻执行（换到 C 看到国库）
      out("#cc, #cv-ballot, #lb-nosnap", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "C", 1.2); pop("#ev-ck", ${t(LS[5] + 0.3)});
      pop("#lb-day", ${t(TM.day)}); bump("#meter", ${t(TM.two3)}, 1.06, 1); pop("#lb-now", ${t(TM.now - 0.2)}); bump("#tre", ${t(TM.now + 0.3)}, 1.05, 1);
      // ===== L6 先猜
      out("#ev-ck, #lb-day, #lb-now", ${t(LS[6] - 0.2)}); pop("#kw-q", ${t(LS[6] + 0.1)});
      // ===== L7 闪电贷柜台亮，金条上台 + 题目
      pop("#lb-fd", ${t(LS[7] + 0.2)}); X1.pileIn(tl, "fd", ${t(LS[7] + 0.4)}); pop("#kw-q2", ${t(w("借来的", 7))});
      // ===== L8 一笔交易大框 + 五步
      out("#kw-q, #kw-q2, #lb-emg, #lb-fd", ${t(LS[8] - 0.2)}); fadeIn("#tx-frame", ${t(LS[8] + 0.2)}, 0.4);
      pop("#st-0", ${t(TM.borrow)}); bump("#fd", ${t(TM.borrow)}, 1.04, 1);
      pop("#st-1", ${t(TM.dep)}); X9.drop(tl, "ballot", ${t(TM.dep)});
      pop("#st-2", ${t(TM.vote)}); X5.fill(tl, "meter", ${t(TM.vote)}, 3, 0.8);
      pop("#st-3", ${t(TM.exe)}); KIT.door(tl, "tre", ${t(TM.exe)}, 105, 0.9);
      pop("#st-4", ${t(TM.repay)}); X1.pileOut(tl, "fd", ${t(TM.repay)});
      // ===== L9 已归还 ✓ / 挡住了吗：没有 ✗
      pop("#ck-ret", ${t(TM.ret)}); pop("#ck-no", ${t(TM.ret + 0.4)});
      // ===== L10 提前一天提交，沙漏流完
      out("#tx-frame, .st, #ck-ret, #ck-no", ${t(LS[10] - 0.2)});
      pop("#lb-early", ${t(TM.early)}); pop("#lb-day", ${t(TM.early + 0.2)}); KIT.sand(tl, "dayg", ${t(TM.early + 0.2)}, 1.8);
      // ===== L11 获利三种口径
      out("#lb-early, #lb-day", ${t(LS[11] - 0.2)}); pop("#ev-amt", ${t(LS[11] + 0.2)});
      // ===== L12 修复两步
      out("#ev-amt", ${t(LS[12] - 0.2)}); pop("#kw-fix", ${t(LS[12] + 0.1)});
      // ===== L13 快照：相机修好、闪光出片；第 1 行划掉，第 2 行亮绿
      out("#kw-fix", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "voteL", 1.2); X9.flap(tl, "ballot", ${t(LS[13] + 0.2)}, 0);
      X11.lensBad(tl, "snap", ${t(LS[13] + 0.8)}, false); X11.snap(tl, "snap", ${t(TM.snap - 0.4)});
      pop("#cc", ${t(LS[13] + 0.6)}); fadeIn("#cc-strike", ${t(LS[13] + 1.0)}, 0.2);
      tl.fromTo("#cc-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, ${t(LS[13] + 1.0)});
      fadeIn("#cc-r1", ${t(TM.snap)}, 0.3); hot("#cc-r1", ${t(TM.snap + 0.3)}, "#1f9d55");
      draw("cv-photo", ${t(TM.snap + 1.3)}); pop("#lb-photo", ${t(TM.snap + 1.4)});
      // ===== L14 时间锁 + 守护者否决；第 3 行
      out("#cv-photo, #lb-photo", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "guardR", 1.2);
      grow("tlk", ${t(TM.tlk - 0.3)}); pop("#lb-tlk", ${t(TM.tlk)}); fadeIn("#cc-r2", ${t(TM.tlk)}, 0.3); hot("#cc-r2", ${t(TM.tlk + 0.3)}, "#1f9d55");
      draw("cv-tlk", ${t(TM.tlk + 0.4)}); X1.countdown(tl, "tlk", ${t(TM.tlk + 1.0)}, 2.5, 0.2);
      grow("veto", ${t(TM.veto - 0.5)}); pop("#lb-veto", ${t(TM.veto)});
      // ===== L15 法定人数 · 内容锁定 · 重新计时
      out("#cc, #cc-strike, #cv-tlk", ${t(LS[15] - 0.2)}); cam(${t(LS[15])}, "guard", 1.2);
      pop("#lb-quorum", ${t(TM.quorum)}); grow("plk", ${t(TM.lockc - 0.3)}); pop("#lb-plk", ${t(TM.lockc)});
      grow("rclk", ${t(TM.recount - 1.0)}); KIT.clock(tl, "rclk", ${t(TM.recount)}, 0.6, -230); pop("#lb-rclk", ${t(TM.recount)});
      // ===== L16 奖励站
      out("#lb-tlk, #lb-veto, #lb-quorum, #lb-plk, #lb-rclk", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "rewardL", 2.0, "power2.inOut");
      pop("#lb-rw", ${t(LS[16] + 1.6)}); bump("#rw", ${t(LS[16] + 1.9)}, 1.04, 1);
      // ===== L17 按存入那一刻的余额：代码卡 D 第 1 行 + 金币一次喷出
      pop("#cd", ${t(LS[17] + 0.2)}); hot("#cd-r0", ${t(LS[17] + 0.6)}, "#e0453a"); draw("cv-tray", ${t(LS[17] + 0.8)});
      X1.dispense(tl, "rw", ${t(TM.claim - 0.3)}, { n: 5 }); fadeIn("#rc", ${t(TM.claim)}, 0.3); pop("#lb-same", ${t(TM.claim + 0.2)});
      // ===== L18 随时间累积 + 最短锁定期
      out("#cv-tray, #rc, #lb-same", ${t(LS[18] - 0.2)}); fadeIn("#cd-r1", ${t(LS[18])}, 0.3); hot("#cd-r1", ${t(TM.accu)}, "#1f9d55");
      draw("cv-rh", ${t(TM.accu + 0.2)}); pop("#lb-rh", ${t(TM.accu + 0.3)}); KIT.sand(tl, "rh", ${t(TM.accu)}, 5);
      [0, 1, 2, 3, 4, 5].forEach((i) => fadeIn("#rs-" + i, ${t(TM.accu + 0.6)} + i * 0.7, 0.3));
      pop("#lb-minlock", ${t(TM.minlock)});
      // ===== L19 不能读一笔交易内可变的数据：奖励合约 → 池子 红虚线 + 红叉
      out("#cd, #cv-rh, #lb-minlock", ${t(LS[19] - 0.2)}); draw("cv-pool", ${t(TM.vol - 0.3)}); pop("#lb-pool", ${t(TM.vol)}); pop("#lb-x", ${t(TM.pool)});
      // ===== L20 规模 / 时间（解读）——镜头回到 reward 静止
      out("#cv-pool, #lb-pool, #lb-x, #lb-rh, #lb-rw", ${t(LS[20] - 0.2)}); cam(${t(LS[20])}, "reward", 1.4);
      fadeIn("#rc", ${t(TM.scale - 0.3)}, 0.3); pop("#kw-scale", ${t(TM.scale)}); pop("#kw-time", ${t(w("利用的", 20))}); bump("#rh", ${t(TM.time + 0.1)}, 1.05, 1);
`,
});
