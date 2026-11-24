// ep16/seg6「⑥ 按链定确认」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.voteE（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   upgradeA     ---- A
//   deskA        近景：入账台 + 信号柱 + 检查点 + 告警灯（seg1 L6–L11 终点；seg2 起点；seg6 L1–L5、L10–L11）
//   chainA       近景：主链 + 扳道器 + 信号柱（seg2 L0–L4 主链与分叉示意）
//   A            A 全区
//   notaryB      ---- B
//   resourceB    B 资源分类板 + 沙漏 + 攻击者 + 印章（seg2 L12–L17 终点；seg3 起点）
//   B            
//   mineC        ---- C
//   forkC        近景：两条链 + 扳道器 + 矿机（seg3 L1–L5、L17–L21）
//   countC       近景：确认数计数器 + 沙漏 + 公开链尾（seg3 L6–L12）
//   dotsC        近景：点阵两簇 + 租来的矿机（seg3 L13–L16）
//   deskC        近景：入账台 + 重组告警 + 私下链尾（seg3 L22–L23 终点；seg4 起点）
//   gateD        ---- D
//   clientD      近景：三台客户端机柜 + 投票表（seg4 L3–L6）
//   shareD       近景：四块份额牌阶梯（seg4 L10–L14）
//   rangeD       近景：改写的历史 + 主链 + 旧私钥 + 新节点 + 两份检查点 + 放大镜（seg4 L15–L21 终点；seg5 起点）
//   D            
//   haltE        ---- E
//   seqE         近景：排序器 + 信封 + 信号柱 + L1 + 入账台（seg5 L9–L16）
//   voteE        近景：托管保险柜 + 见证人投票箱 + 手机（seg5 L17–L21 终点；seg6 起点、L6–L7）
//   E            
//   wide         ---- 全景：链上小镇五个区（seg6 L0、L12 → 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world

// 段内镜头：A 区近景让出右侧给代码卡（x 1220–1840）
const RR = (o, k) => L.rect(o, k);
const CHAIN5 = { u: L.CHAINA.u + 90, v: L.CHAINA.v };   // n 5：前 4 块落在 n 4 的位置，第 5 块往 +u 长
const MYCAMS = {
  ...L.CAMS,
  deskA6: L.fit([RR(L.DESKA, "dispatchDesk"), RR(L.FSIGA, "finalitySignal"), RR(L.CKPTA, "checkpoint"), RR(L.BEACONA, "beacon"), RR(L.FORKA, "forkSwitch")], [100, 300, 1170, 860], 1.3),
  replayA: L.fit([RR(L.ROTA, "rotaWheel"), RR(L.RACKA, "rack"), RR(L.METERA, "thresholdMeter"), RR(CHAIN5, "chain5"), RR(L.DESKA, "dispatchDesk"),
    RR(L.FSIGA, "finalitySignal"), RR(L.CKPTA, "checkpoint"), RR(L.BEACONA, "beacon")], [100, 300, 1170, 860], 1.3),
};
const S = segInit(import.meta.url, { cams: MYCAMS, ext: [E1, E2, E5, E7, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
/** 不支持 scale 的物件：绕地面点包一层缩放，并换算 anchors */
const wput = (key, o, obj, dy = 0) => {
  const k = o.scale ?? 1, [gx, gy] = at(o);
  put(key, o, obj, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const plate = (id, o, text) => put(id, o, E1.signBoard(o, { id, style: "plate", text }));
// A 升级机房
plate("signA", L.SIGNA, "主网升级 · Fusaka");
put("rotaA", L.ROTA, E9.rotaWheel(L.ROTA, { id: "rotaA", n: 12, plate: "验证者" }));
put("rackA", L.RACKA, O.rack(L.RACKA, { id: "rackA", tag: "Prysm" }));
wput("meterA", L.METERA, E5.thresholdMeter(L.METERA, { id: "meterA", max: 3, th: 2, thText: "2/3", level: 3 }));
put("chainA", CHAIN5, O.chain(CHAIN5, { id: "chainA", n: 5 }));
put("forkA", L.FORKA, X.forkSwitch(L.FORKA, { id: "forkA" }));
put("deskA", L.DESKA, E7.dispatchDesk(L.DESKA, { id: "deskA", scale: L.DESKA.scale, entries: ["以太坊", "PoW 小链", "PoSA", "L2", "比特币"], shown: 0 }));
put("fsigA", L.FSIGA, X.finalitySignal(L.FSIGA, { id: "fsigA", lit: 2 }));
wput("ckptA", L.CKPTA, O.checkpoint(L.CKPTA, { id: "ckptA", n: "检查点", armUp: true }));
put("beaconA", L.BEACONA, O.beacon(L.BEACONA, { id: "beaconA" }));
// B 公证处
plate("signB", L.SIGNB, "比喻 · 公证处");
put("docB", L.CONTRACT, O.doc(L.CONTRACT, { id: "docB", title: "房产买卖合同", stamp: true, standing: true }));
L.NOTARIES.forEach((q, i) => put("nt" + i, q, O.person(q, { id: "nt" + i, role: "signer", scale: q.scale })));
put("atkB", L.ATKB, O.person(L.ATKB, { id: "atkB", role: "attacker", scale: L.ATKB.scale }));
put("sealB", L.SEALB, O.seal(L.SEALB, { id: "sealB", markText: "公证" }));
put("hourB", L.HOURB, O.hourglass(L.HOURB, { id: "hourB" }));
put("rolesB", L.ROLES, E5.roleBoard(L.ROLES, { id: "rolesB", hooks: 6, title: "攻击者控制了什么" }));
// C 矿场
plate("signC", L.SIGNC, "PoW · 算力");
L.RIGS.forEach((q, i) => wput("rig" + i, q, E2.gpuRig(q, { id: "rig" + i })));
L.ARIGS.forEach((q, i) => wput("arig" + i, q, E2.gpuRig(q, { id: "arig" + i, state: "attacker" })));
put("forkC", L.FORKC, X.forkSwitch(L.FORKC, { id: "forkC", thrown: true }));
put("pubC", L.PUBCHAIN, O.chain(L.PUBCHAIN, { id: "pubC", n: 4 }));
put("privC", L.PRIVCHAIN, O.chain(L.PRIVCHAIN, { id: "privC", n: 5, blockStates: Array(5).fill("attacker") }));
put("rollC", L.ROLLC, E2.rollCounter(L.ROLLC, { id: "rollC", digits: 3, value: 600 }));
put("hourC", L.HOURC, O.hourglass(L.HOURC, { id: "hourC" }));
put("deskC", L.DESKC, E7.dispatchDesk(L.DESKC, { id: "deskC", scale: L.DESKC.scale, entries: ["充值 ✓", "提走 ✓"], shown: 2 }));
put("beaconC", L.BEACONC, O.beacon(L.BEACONC, { id: "beaconC" }));
// D 检查点关卡
plate("signD", L.SIGND, "PoS · 最终性");
put("gateD", L.GATE, O.checkpoint(L.GATE, { id: "gateD", n: "检查点", armUp: true }));
wput("meterD", L.METERD, E5.thresholdMeter(L.METERD, { id: "meterD", max: 3, th: 2, thText: "2/3", level: 3 }));
L.CLIENTS.forEach((q, i) => wput("cl" + i, q, O.rack(q, { id: "cl" + i, tag: "客户端 " + "ABC"[i] })));
put("chainD", L.CHAIND, O.chain(L.CHAIND, { id: "chainD", n: 4 }));
put("rewD", L.REWRITE, O.chain(L.REWRITE, { id: "rewD", n: 3, blockStates: Array(3).fill("attacker") }));
["约 33%", "约 34%", "约 51%", "约 66%"].forEach((s, i) => plate("sh" + i, L.SHARES[i], s));
put("keyD", L.OLDKEY, O.key(L.OLDKEY, { id: "keyD", state: "attacker" }));
put("nodeD", L.NEWNODE, O.person(L.NEWNODE, { id: "nodeD", role: "engineer", scale: L.NEWNODE.scale }));
L.CPDOCS.forEach((q, i) => put("cpd" + i, q, O.doc(q, { id: "cpd" + i, title: "检查点 · 来源 " + (i + 1), standing: true })));
put("magD", L.MAGD, O.magnifier(L.MAGD, { id: "magD" }));
// E 停链广场
plate("signE", L.SIGNE, "停链与回滚");
put("knifeE", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "knifeE", on: false, text: "出块" }));
put("clockE", L.CLOCKE, O.clock(L.CLOCKE, { id: "clockE" }));
wput("bridgeE", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "bridgeE", booth: "attacker" }));
put("minE", L.MINORITY, E9.rotaWheel(L.MINORITY, { id: "minE", n: 6, plate: "少数验证者", scale: L.MINORITY.scale }));
put("freezeE", L.FREEZE, O.seal(L.FREEZE, { id: "freezeE", markText: "冻结" }));
put("sorterE", L.SORTER, E1.sorter(L.SORTER, { id: "sorterE", blockLabel: "unsafe" }));
L.LETTERS.forEach((q, i) => put("let" + i, q, E1.letter(q, { id: "let" + i, z: 0 })));
put("fsigE", L.FSIGE, X.finalitySignal(L.FSIGE, { id: "fsigE", lit: 2 }));
wput("l1E", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1E", n: 3, title: "L1" }));
put("pipeE", L.FPIPE.o, E1.pipe(L.FPIPE.o, { id: "pipeE", pts: L.FPIPE.pts }), 0.4);
put("deskE", L.DESKE, E7.dispatchDesk(L.DESKE, { id: "deskE", scale: L.DESKE.scale, entries: ["L1 批次 ✓"], shown: 1 }));
wput("safeE", L.CUSTODY, O.safe(L.CUSTODY, { id: "safeE", gold: true }));
put("voteBox", L.WITNESS, E9.commitBox(L.WITNESS, { id: "voteBox", name: "见证人投票", scale: L.WITNESS.scale }));
const PH2 = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="26" fill="#e3f4ea"/>
  <g transform="translate(38,72)" fill="none" stroke="#1f9d55" stroke-width="3"><path d="M-12,-22 H12 M-12,22 H12 M-9,-22 C-9,-6 9,-6 9,0 C9,6 -9,6 -9,22 M9,-22 C9,-6 -9,-6 -9,0 C-9,6 9,6 9,22"/></g>
  <text x="38" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="#1f9d55">等待确认</text>`;
put("phE", L.PHONE, O.phone(L.PHONE, { id: "phE", screen2: PH2 }));
// 石板路（原生 SVG，铺在最底下）
const road = `<polyline points="${L.ROAD.map((q) => at(q).map((x) => Math.round(x)).join(",")).join(" ")}" fill="none" stroke="#dcd6ca" stroke-width="120" stroke-linejoin="round" stroke-linecap="round"/>`;

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pause", up(A.deskA.top, 12), "暂停充提", "lab-rs");
lb("lb-recon", up(A.deskA.top, 14), "恢复后逐笔对账 ✓", "lab-g");
lb("lb-nofin", up(A.ckptA.top, 8), "不再最终确定", "lab-rs");
lb("lb-cred", up(A.deskA.top, 12), "N 个区块 ✓ 照样入账", "lab-rs");
lb("lb-stop", up(A.deskA.top, 14), "暂停入账", "lab-g");
lb("lb-bug", up(A.rackA.top, 8), "超过 1/3 出 bug", "lab-rs lab-sm");
lb("lb-wait", up(A.phE.top, 10), "耐心等", "lab-g");
lb("lb-check", up(A.knifeE.top, 10), "恢复后先查状态", "lab-cs");
lb("lb-nore", up(A.let1.top, 14), "不反复提交", "lab-rs");

// ---------------------------------------------------------------- 屏幕层卡片
const CX = 1220, CW = 620;
const POL = { x: CX, y: 292, w: CW };
const pol = codeCard("pol", { ...POL, head: "入账条件 · 每条链单独定", tag: "示意", rows: [
  { html: "以太坊", chip: 'getBlock("finalized")', chipCls: "ok" },
  { html: "PoW 小链", chip: "rentCost > 可双花金额", chipCls: "ok" },
  "PoSA", "L2", "比特币"], rowHide: true });
const CA = { x: CX, y: 312, w: CW };
const cardA = codeCard("ca", { ...CA, head: "凭什么入账", tag: "示意", mono: true, rowHide: true, rows: [
  "// 只数区块",
  { html: "if (head - blk >= N)", chip: "✗", chipCls: "x" },
  "&nbsp;&nbsp;credit(tx)",
  "// 看最终性",
  { html: 'if (blk <= get("finalized"))', chip: "✓", chipCls: "ok" },
  "&nbsp;&nbsp;credit(tx)"] });
S.curve("cv-pol", [POL.x - 4, codeRowY(POL.y, 0)], S.scr("deskA6", A.fsigA.finalized), { color: "#e0453a" });
S.curve("cv-a1", [CA.x - 4, codeRowY(CA.y, 1)], S.scr("replayA", A.deskA.book), { color: "#e0453a" });
S.curve("cv-a3", [CA.x - 4, codeRowY(CA.y, 4)], S.scr("replayA", A.fsigA.finalized), { color: "#e0453a" });
const roles = ["交易所", "节点运营", "普通用户"].map((s, i) => ck("rl" + i, s, { x: 560 + i * 280, y: 112, w: 260, kind: "c" })).join("");
const states = ck("st0", "⏸ 出块但不最终确定", { x: CX, y: 700, w: 420, kind: "n" }) + ck("st1", "⏸ 完全停止", { x: CX, y: 786, w: 420, kind: "r" });
const clients = kw("kw-cl", "客户端 A <b>=</b> 客户端 B", { x: CX, y: 704, size: 34, accent: "#1f9d55" });
const quest = kw("kw-q", "超过 <b>1/3</b> 的客户端出 bug，会看到什么？", { x: 560, y: 116, size: 32 });
const RES = ["身份与连接", "算力", "区块时机", "权益或旧私钥", "别人的动机", "停链份额"];
const res = kw("kw-ctl", `先问控制了<b>什么</b>${gtag("解读")}`, { x: 70, y: 112, size: 28 })
  + RES.map((s, i) => ck("rs" + i, s, { x: 540 + (i % 3) * 330, y: 104 + Math.floor(i / 3) * 84, w: 310, kind: "r" })).join("");
const html = pol + cardA + roles + states + clients + quest + res;
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  each: w("每条链", 1), fin: w("finalized 标签", 2), rent: w("租算力", 2),
  noFin: w("不最终确定", 3), stop: w("完全停止", 3),
  delay: w("最终性延迟", 4), gap: w("出块间隔", 4), pause: w("自动暂停", 4), recon: w("逐笔对账", 4),
  two: w("两种客户端", 5), cross: w("交叉核对", 5),
  wait: w("等待确认", 6), patient: w("耐心等", 6),
  resend: w("反复提交", 7), check: w("先查状态", 7),
  third: w("三分之一", 9), ckpt: w("检查点", 9),
  grow: w("照样出块", 10), nblk: w("N 个区块", 10), cred: w("继续入账", 10),
  fin2: w("finalized 标签", 11), mon: w("监控", 11), halt: w("停下", 11),
  ctl: w("控制了什么", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "voteE", sub: "看 finalized，不要只数区块",
  grid: { u0: -5800, u1: 16000, v0: -8400, v1: 13800 }, box: [-1700, -4500, 14900, 8300],   // 盖住 voteE / wide / deskA / E / upgradeA
  extraSvg: road, shown: [], css, html,
  terms: [
    { id: "t0", t: "finalized 标签", d: "节点返回的已最终确定区块", at: w("finalized 标签", 2) },
  ],
  end: { title: "共识层与链级安全", line: "已确认只是一个赌注，先问攻击者控制了什么", next: "节点、RPC 与验证者基础设施的安全", at: LS[13], nextAt: w("下一集", 13) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#chainA-b4, #chainA-l3", { opacity: 0 }, 0);
      // ===== L0 按角色，各做一件事。
      cam(${t(LS[0])}, "wide", 1.6);
      [0, 1, 2].forEach((i) => pop("#rl" + i, ${t(LS[0] + 0.5)} + i * 0.3, 0.25));
      // ===== L1 交易所，每条链单独定入账条件。
      cam(${t(LS[1] - 0.1)}, "deskA6", 1.4); bump("#rl0", ${t(LS[1])}, 1.12, 1);
      pop("#pol", ${t(TM.each)}); [0, 1, 2, 3, 4].forEach((i) => { pop("#pol-r" + i, ${t(TM.each + 0.3)} + i * 0.3, 0.2); X7.entry(tl, "deskA", ${t(TM.each + 0.3)} + i * 0.3, i, 0.3); });
      // ===== L2 以太坊看 finalized 标签，PoW 小链按租算力的成本定确认数。
      pop("#pol-c0", ${t(TM.fin)}); draw("cv-pol", ${t(TM.fin + 0.2)}); X16.sigBlink(tl, "fsigA", ${t(TM.fin + 0.4)}, 2, 2);
      pop("#pol-c1", ${t(TM.rent)}); flash("#pol-c1", ${t(TM.rent + 0.3)}, 2);
      // ===== L3 区分两种状态，继续出块但不最终确定，和完全停止。
      out("#cv-pol", ${t(LS[3])});
      pop("#st0", ${t(TM.noFin - 0.3)}); X16.sig(tl, "fsigA", ${t(TM.noFin)}, 1);
      pop("#st1", ${t(TM.stop)}); X16.sig(tl, "fsigA", ${t(TM.stop + 0.2)}, -1);
      // ===== L4 最终性延迟或出块间隔超过阈值，自动暂停充提，恢复后逐笔对账。
      KIT.beacon(tl, "beaconA", ${t(TM.delay)}, ${t(TM.recon - TM.delay)}, 1.2); bump("#st0", ${t(TM.delay)}, 1.06, 1);
      bump("#forkA", ${t(TM.gap)}, 1.12, 1); bump("#st1", ${t(TM.gap)}, 1.06, 1);
      KIT.led(tl, "deskA-led", ${t(TM.pause)}, "red"); pop("#lb-pause", ${t(TM.pause)});
      out("#lb-pause", ${t(TM.recon - 0.1)}, 0.2); X16.sig(tl, "fsigA", ${t(TM.recon)}, 2); KIT.led(tl, "deskA-led", ${t(TM.recon)}, "green"); pop("#lb-recon", ${t(TM.recon + 0.1)});
      // ===== L5 运营节点的，至少运行两种客户端，交叉核对。
      out("#st0, #st1", ${t(LS[5] - 0.2)}); bump("#rl1", ${t(LS[5])}, 1.12, 1);
      pop("#kw-cl", ${t(TM.two)}); bump("#kw-cl", ${t(TM.cross)}, 1.06, 1);
      // ===== L6 普通用户，交易所显示等待确认时，耐心等。
      out("#pol, #kw-cl, #lb-recon", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "voteE", 1.6); bump("#rl2", ${t(LS[6] + 0.2)}, 1.12, 1);
      fadeIn("#phE-scr2", ${t(TM.wait)}, 0.4); KIT.sand(tl, "hourC", ${t(TM.wait)}, 2); pop("#lb-wait", ${t(TM.patient)});
      // ===== L7 链停摆时，不要反复提交交易，恢复后先查状态。
      out("#lb-wait", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "E", 1.2); pop("#lb-nore", ${t(TM.resend)});
      KIT.toggle(tl, "knifeE", ${t(TM.check - 0.4)}, true); pop("#lb-check", ${t(TM.check)});
      // ===== L8 回到开头的问题。
      out("#lb-nore, #lb-check, #rl0, #rl1, #rl2", ${t(LS[8] - 0.2)});
      cam(${t(LS[8] - 0.1)}, "replayA", 1.5); pop("#kw-q", ${t(LS[8] + 0.3)}); bump("#kw-q", ${t(LS[9] + 0.6)}, 1.05, 1);
      // ===== L9 同样的 bug 出在超过三分之一的客户端上，检查点不再最终确定。
      [0, 1, 2, 3, 4].forEach((k) => X9.seat(tl, "rotaA", ${t(TM.third)} + k * 0.12, k, "red"));
      [0, 1, 2].forEach((k) => KIT.led(tl, "rackA-led-" + k, ${t(TM.third + 0.2)} + k * 0.1, "red")); pop("#lb-bug", ${t(TM.third + 0.3)});
      X5.fill(tl, "meterA", ${t(TM.third + 0.5)}, 1.6, 1.2);
      KIT.arm(tl, "ckptA", ${t(TM.ckpt)}, false); pop("#lb-nofin", ${t(TM.ckpt + 0.5)});
      // ===== L10 链照样出块，N 个区块的条件照样满足，系统继续入账。
      out("#kw-q, #lb-nofin", ${t(LS[10] - 0.2)});
      fadeIn("#chainA-l3, #chainA-b4", ${t(TM.grow)}, 0.5); bump("#chainA-b4", ${t(TM.grow + 0.5)}, 1.08, 1);
      pop("#ca", ${t(TM.nblk - 0.3)}); pop("#ca-r0", ${t(TM.nblk - 0.1)}, 0.2); pop("#ca-r1, #ca-r2", ${t(TM.nblk + 0.1)}, 0.2);
      draw("cv-a1", ${t(TM.nblk + 0.4)}); pop("#ca-c1", ${t(TM.cred)}); pop("#lb-cred", ${t(TM.cred)}); X7.slotFlash(tl, "deskA", ${t(TM.cred + 0.2)}, 2);
      // ===== L11 只有看 finalized 标签、监控最终性延迟的系统，才会停下。
      out("#cv-a1, #lb-cred", ${t(LS[11])});
      pop("#ca-r3", ${t(LS[11] + 0.2)}, 0.2); pop("#ca-r4, #ca-r5", ${t(TM.fin2)}, 0.2); draw("cv-a3", ${t(TM.fin2 + 0.3)});
      X16.sigLamp(tl, "fsigA", ${t(TM.fin2 + 0.6)}, 2, false);
      KIT.beacon(tl, "beaconA", ${t(TM.mon)}, 2.4, 1.2);
      pop("#ca-c4", ${t(TM.halt)}); KIT.led(tl, "deskA-led", ${t(TM.halt)}, "red"); pop("#lb-stop", ${t(TM.halt)});
      // ===== L12 已确认只是一个赌注，先问攻击者控制了什么，再定防线。
      out("#ca, #cv-a3, #lb-stop, #lb-bug", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "world", 1.6);
      pop("#kw-ctl", ${t(LS[12] + 0.8)});
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#rs" + i, ${t(LS[12] + 1.2)} + i * 0.3, 0.2));
      bump("#rolesB", ${t(TM.ctl + 0.3)}, 1.1, 2);
      // ===== L13 下一集讲节点、RPC 与验证者基础设施的安全。
      out("#kw-ctl, #rs0, #rs1, #rs2, #rs3, #rs4, #rs5", ${t(LS[13] - 0.2)});
`,
});
