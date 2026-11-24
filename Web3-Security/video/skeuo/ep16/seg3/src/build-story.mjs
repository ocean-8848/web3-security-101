// ep16/seg3「③ 算力与重组」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.resourceB（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.deskC

// ---- 段内镜头：留出左侧给步骤条 / 代码卡
const RC = {
  pub: L.rect(L.PUBCHAIN, "chain4"), priv: L.rect(L.PRIVCHAIN, "chain5"), fsw: L.rect(L.FORKC, "forkSwitch"),
  rig2: L.rect(L.RIGS[2], "gpuRig"), arig2: L.rect(L.ARIGS[2], "gpuRig"), arigs: L.ARIGS.map((q) => L.rect(q, "gpuRig")),
  desk: L.rect(L.DESKC, "dispatchDesk"), roll: L.rect(L.ROLLC, "rollCounter"), hour: L.rect(L.HOURC, "hourglass"), dots: L.rect(L.DOTSC, "dotsC"),
};
const CAMS = {
  ...L.CAMS,
  forkCL: L.fit([RC.pub, RC.priv, RC.fsw, ...L.RIGS.map((q) => L.rect(q, "gpuRig")), ...RC.arigs, RC.desk], [590, 290, 1820, 860], 1.4),
  countCR: L.fit([RC.roll, RC.hour, RC.pub], [820, 330, 1800, 840], 1.4),
  caseC: L.fit([RC.dots, ...RC.arigs, RC.desk], [100, 300, 1820, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
/** 不支持 scale 的物件：绕地面点包一层并换算 anchors */
const wrapPut = (key, o, r, k, dy = 0) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of ["top", "center", "ground"]) if (A[key][n]) A[key][n] = sc(A[key][n]);
};
put("signC", L.SIGNC, E1.signBoard(L.SIGNC, { id: "signC", style: "plate", text: "PoW · 算力" }));
L.RIGS.forEach((q, i) => wrapPut(`rig${i}`, q, E2.gpuRig(q, { id: `rig${i}` }), 0.7));
L.ARIGS.forEach((q, i) => wrapPut(`arig${i}`, q, E2.gpuRig(q, { id: `arig${i}`, state: "attacker" }), 0.7));
put("pub", L.PUBCHAIN, O.chain(L.PUBCHAIN, { id: "pub", n: 4 }));
put("priv", L.PRIVCHAIN, O.chain(L.PRIVCHAIN, { id: "priv", n: 5, blockStates: Array(5).fill("attacker") }), 0, { grow: true });
put("fsw", L.FORKC, X.forkSwitch(L.FORKC, { id: "fsw", labels: ["公开链", "私下链"] }), 40);
const DEP = { u: L.PUBCHAIN.u - 90, v: L.PUBCHAIN.v };   // 公开链第 2 块顶上
put("dep", DEP, E1.letter(DEP, { id: "dep", z: 100 }), 30);
put("roll", L.ROLLC, E2.rollCounter(L.ROLLC, { id: "roll", digits: 3, value: 6 }));
put("hg", L.HOURC, O.hourglass(L.HOURC, { id: "hg" }));
put("desk", L.DESKC, E7.dispatchDesk(L.DESKC, { id: "desk", scale: 0.8, entries: ["+ 充值", "+ 提走"], shown: 0 }));
put("bcn", L.BEACONC, O.beacon(L.BEACONC, { id: "bcn" }));
// 点阵：11 点（约 110 万美元）+ 56 点（约 560 万美元），每点约 10 万美元
const [dx, dy0] = at(L.DOTSC), DS = 24;
const dots = (n, cols, x0) => Array.from({ length: n }, (_, i) =>
  `<circle cx="${x0 + (i % cols) * DS + 10}" cy="${dy0 + Math.floor(i / cols) * DS + 10}" r="8" fill="#e0453a"/>`).join("");
add(L.DOTSC, S.hid("dots1", dots(11, 4, dx)), 200);
add(L.DOTSC, S.hid("dots2", dots(56, 14, dx + 190)), 200);
// 自私挖矿：私下链最后两块外的红虚线框（扣住）
const [b3, b4] = [A.priv.blocks[3], A.priv.blocks[4]];
add(L.PRIVCHAIN, S.hid("hold", `<rect x="${b3[0] - 95}" y="${b3[1] - 70}" width="${b4[0] - b3[0] + 190}" height="${b4[1] - b3[1] + 230}" rx="14" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10"/>`), 400);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-rig", up(A.rig2.top, 10), "诚实矿工", "lab-cs lab-sm");
lb("lb-arig", up(A.arig2.top, 10), "租来的算力", "lab-rs lab-sm");
lb("lb-pub", up(A.pub.blocks[3], 40), "公开链", "lab-cs lab-sm");
lb("lb-priv", [A.priv.blocks[4][0] + 70, A.priv.blocks[4][1] + 60], "私下链", "lab-rs lab-sm", "l");
lb("lb-dep", up(A.dep.top, 6), "充值", "lab-ink lab-sm");
lb("lb-e0", up(A.desk.entries[0], 34), "充值 ✓", "lab-gs lab-sm", "r");
lb("lb-e0x", up(A.desk.entries[0], 34), "不存在的充值", "lab-rs lab-sm", "r");
lb("lb-e1", [A.desk.entries[1][0], A.desk.entries[1][1] + 42], "提走 ✓", "lab-gs lab-sm", "r");
lb("lb-roll", up(A.roll.top, 8), "确认数", "lab-ink lab-sm");
lb("lb-hg", up(A.hg.top, 8), "租用时长", "lab-ink lab-sm");
lb("lb-d1", [dx + 48, dy0 + 90], "约 110 万美元", "lab-r lab-sm", "t");
lb("lb-d2", [dx + 190 + 168, dy0 + 112], "约 560 万美元 · 第一次", "lab-r lab-sm", "t");
lb("lb-dleg", [dx + 250, dy0 - 18], "每点约 10 万美元", "lab-g lab-sm");
lb("lb-pause", up(A.desk.top, 10), "暂停 ETC", "lab-g lab-sm");
lb("lb-2w", up(A.desk.top, 60), "确认时间：约两周", "lab-ink lab-sm");
lb("lb-ghost", [A.arig2.center[0], A.arig2.center[1]], "不必一直多数", "lab-r lab-sm", "c");
lb("lb-hold", [b4[0] + 60, b4[1] + 170], "先扣住", "lab-rs lab-sm", "t");
lb("lb-rel", [b4[0] + 60, b4[1] + 170], "一次释放", "lab-rs lab-sm", "t");
lb("lb-18", up(A.fsw.top, 14), "18 块 · 史上最深", "lab-rs lab-sm");
lb("lb-cap1", up(A.desk.entries[0], 34), "单笔上限", "lab-gs lab-sm", "r");
lb("lb-cap2", [A.desk.entries[1][0], A.desk.entries[1][1] + 42], "单日上限", "lab-gs lab-sm", "r");
lb("lb-bcn", up(A.bcn.top, 8), "重组告警", "lab-r lab-sm");
lb("lb-stop", up(A.desk.top, 64), "暂停充提", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const STEPS = ["充值 · 私下挖", "等确认 · 提走", "公开长链 · 重组", "充值消失"];
const steps = STEPS.map((s, i) => ck(`st${i}`, s, { x: 60, y: 330 + i * 92, w: 470, kind: i < 2 ? "c" : "r", icon: String(i + 1) })).join("");
const CB = { x: 60, y: 300, w: 720 };
const CB_ROWS = ["if (q &gt;= 0.5) P(双花) = 1", "rentCost(k 个块) &gt; 可双花金额", "单笔上限、单日上限"];
const cardB = codeCard("cb", { ...CB, head: "确认数是经济问题", tag: "示意", mono: true, rowHide: true, rows: CB_ROWS })
  + codeCard("cb2", { x: 60, y: 120, w: 720, head: "确认数是经济问题", tag: "示意", mono: true, rowHide: true, rows: CB_ROWS });
S.curve("cv-hg", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], S.scr("countCR", A.hg.center), { color: "#e0453a" });
const html = steps + cardB
  + kw("kw-guess", "再猜一道题", { x: 760, y: 130, size: 46, accent: "#2aa3c9" })
  + kw("kw-60", `攻击者算力 <b>60%</b>${gtag("示例")}`, { x: 820, y: 140, size: 42, accent: "#e0453a" })
  + kw("kw-no", `成功概率：<b>不降</b>`, { x: 1100, y: 240, size: 50, accent: "#e0453a" })
  + kw("kw-econ", `确认数 = <b>经济问题</b>`, { x: 840, y: 150, size: 50, accent: "#1d93ba" })
  + kw("kw-qubic", `Qubic：<b>自私挖矿</b>${gtag("矿池自称")}`, { x: 640, y: 136, size: 40, accent: "#e0453a" })
  + kw("kw-51", `日均算力 <b>&lt; 51%</b>`, { x: 646, y: 222, size: 40, accent: "#1d93ba" })
  + evt("ev-etc1", "<b>Ethereum Classic</b> · 2019 年 1 月", { color: "#e0453a" })
  + evt("ev-etc2", "<b>Ethereum Classic</b> · 2020 年 8 月 · 三次", { color: "#e0453a", top: 122 })
  + evt("ev-xmr", "<b>Monero</b> · 2025 年 9 月", { color: "#e0453a", top: 124 })
  + evt("src1", `来源 · The Hacker News`, { color: "#6d685e", top: 200 })
  + evt("src2", `来源 · Bitquery、Decrypt`, { color: "#6d685e", top: 202 })
  + evt("src3", `来源 · ForkLog`, { color: "#6d685e", top: 204 })
  + evt("src4", `来源 · Cointelegraph、Decrypt`, { color: "#6d685e", top: 206 })
  + evt("src5", `来源 · arXiv 研究`, { color: "#6d685e", top: 208 });
const css = `#src1,#src2,#src3,#src4,#src5{font-size:28px;font-weight:800;color:#5f5a50}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dep: w("充值", 2), priv: w("私下挖", 2), conf: w("确认数", 3), sell: w("提走", 3), pubL: w("公开", 4), reorg: w("重组", 4),
  gone: w("消失", 5), fake: w("不存在", 5), r600: w("600", 7), no: w("不降", 8), sand: w("时间", 10), econ: w("经济问题", 11),
  cost: w("成本", 12), usd1: w("110", 13), pause: w("暂停", 14), usd2: w("560", 15), wk: w("两周", 16),
  hold: w("扣住", 18), rel: w("释放", 18), m18: w("18", 19), qubic: w("自私挖矿", 20), d51: w("没有达到", 21),
  caps: w("单笔", 22), stop: w("自动暂停", 23),
};
const t = (x) => f(x);

S.build({
  cam0: "resourceB", sub: "算力过半，加确认数没用",
  grid: { u0: 900, u1: 8000, v0: -1700, v1: 5100 }, box: [1900, -1700, 5400, 2200],   // 盖住 resourceB / mineC / forkC / countC / dotsC / deskC
  shown: [], css, html,
  terms: [
    { id: "t0", t: "确认数", d: "交易所在入账前等待的区块数", at: w("确认数", 3) },
    { id: "t1", t: "矿池", d: "矿工合并算力、分摊收益的组织", at: w("矿池", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先看算力。
      cam(${t(LS[0])}, "mineC", 1.8, "power2.inOut");
      pop("#lb-rig", ${t(LS[0] + 1.6)}); pop("#lb-arig", ${t(LS[0] + 1.8)});
      // ===== L1 51% 攻击分四步。
      cam(${t(LS[1] + 0.5)}, "forkCL", 1.3);
      [0, 1, 2, 3].forEach((i) => pop("#st" + i, ${t(LS[1] + 1.2)} + i * 0.18, 0.25));
      tl.to("#st0,#st1,#st2,#st3", { opacity: 0.4, duration: 0.25 }, ${t(LS[2] - 0.3)});
      pop("#lb-pub", ${t(LS[1] + 1.6)});
      // ===== L2 攻击者在交易所充值一大笔币，同时私下挖一条不包含这笔充值的链。
      tl.to("#st0", { opacity: 1, duration: 0.2 }, ${t(LS[2])}); bump("#st0", ${t(LS[2])}, 1.05, 1);
      pop("#dep", ${t(TM.dep)}); pop("#lb-dep", ${t(TM.dep + 0.2)});
      grow("priv", ${t(TM.priv)}, 0.8); pop("#lb-priv", ${t(TM.priv + 0.6)});
      // ===== L3 交易所等够确认数入账，他把币卖掉，提走别的资产。
      tl.to("#st1", { opacity: 1, duration: 0.2 }, ${t(LS[3])}); bump("#st1", ${t(LS[3])}, 1.05, 1);
      X7.entry(tl, "desk", ${t(TM.conf)}, 0, 0.5); pop("#lb-e0", ${t(TM.conf + 0.4)});
      X7.entry(tl, "desk", ${t(TM.sell)}, 1, 0.5); pop("#lb-e1", ${t(TM.sell + 0.3)});
      // ===== L4 然后他公开私下那条更长的链，网络发生重组。
      tl.to("#st2", { opacity: 1, duration: 0.2 }, ${t(LS[4])}); bump("#st2", ${t(LS[4])}, 1.05, 1);
      bump("#lb-priv", ${t(TM.pubL)}, 1.15, 1);
      X16.flip(tl, "fsw", ${t(TM.reorg)}, true, 0.9);
      tl.to("#pub", { opacity: 0.45, duration: 0.5 }, ${t(TM.reorg + 0.8)});
      // ===== L5 充值交易消失，币回到他手里，交易所账上多出一笔不存在的充值。
      tl.to("#st3", { opacity: 1, duration: 0.2 }, ${t(LS[5])}); bump("#st3", ${t(LS[5])}, 1.05, 1);
      tl.to("#dep", { filter: "grayscale(1)", duration: 0.3 }, ${t(TM.gone - 0.3)}); out("#dep, #lb-dep", ${t(TM.gone + 0.2)}, 0.4);
      out("#lb-e0", ${t(TM.fake - 0.1)}); pop("#lb-e0x", ${t(TM.fake)}); bump("#lb-e0x", ${t(TM.fake + 0.6)}, 1.1, 2);
      // ===== L6 再猜一道题。
      out("#st0,#st1,#st2,#st3,#lb-e0x,#lb-e1,#lb-rig,#lb-arig,#lb-priv,#lb-pub", ${t(LS[6] - 0.1)}, 0.3);
      pop("#kw-guess", ${t(LS[6] - 0.05)});
      // ===== L7 攻击者有 60% 算力，确认数从 6 提高到 600，成功概率降多少？
      out("#kw-guess", ${t(LS[7] + 0.5)}); cam(${t(LS[7])}, "countCR", 1.3);
      pop("#lb-roll", ${t(LS[7] + 1.2)}); pop("#kw-60", ${t(LS[7] + 1.0)});
      KIT.count(tl, "roll", ${t(TM.r600 - 0.6)}, 1.4, 6, 600);
      // ===== L8 答案是不降。
      out("#kw-60", ${t(LS[8] - 0.2)}); pop("#kw-no", ${t(TM.no)}); bump("#kw-no", ${t(TM.no + 0.5)}, 1.08, 1);
      // ===== L9 算力超过一半，攻击者最终一定能追上。
      out("#kw-no", ${t(LS[9] + 0.4)}); pop("#cb", ${t(LS[9] + 0.2)}); pop("#cb-r0", ${t(LS[9] + 0.6)}); hot("#cb-r0", ${t(LS[9] + 1.0)}, "#fde4e1");
      // ===== L10 加确认数，只增加他租算力的时间和成本。
      pop("#lb-hg", ${t(LS[10] + 0.3)}); KIT.sand(tl, "hg", ${t(TM.sand)}, 3.0);
      // ===== L11 所以小算力链的确认数，是一个经济问题。
      pop("#kw-econ", ${t(TM.econ - 0.3)});
      // ===== L12 租算力的成本，必须高于能双花的金额。
      pop("#cb-r1", ${t(LS[12] + 0.2)}); hot("#cb-r1", ${t(TM.cost)}, "#fde4e1"); draw("cv-hg", ${t(TM.cost + 0.2)}); bump("#lb-hg", ${t(TM.cost + 0.8)}, 1.1, 1);
      // ===== L13 2019 年 1 月，Ethereum Classic 被深度重组和双花，约 110 万美元。
      out("#cb, #cv-hg, #kw-econ, #lb-hg, #lb-roll", ${t(LS[13] - 0.3)}, 0.25); cam(${t(LS[13])}, "caseC", 1.4);
      pop("#ev-etc1", ${t(LS[13] + 0.4)}); pop("#src1", ${t(LS[13] + 0.8)});
      fadeIn("#dots1", ${t(TM.usd1 - 0.5)}, 0.4); pop("#lb-d1", ${t(TM.usd1)}); pop("#lb-dleg", ${t(TM.usd1 + 0.4)});
      // ===== L14 Coinbase 发现后，暂停了 ETC 的收付。
      pop("#lb-pause", ${t(TM.pause)});
      // ===== L15 2020 年 8 月，它一个月内被攻击三次，第一次双花约 560 万美元。
      out("#ev-etc1, #src1", ${t(LS[15] - 0.1)}); pop("#ev-etc2", ${t(LS[15] + 0.2)}); pop("#src2", ${t(LS[15] + 0.6)});
      fadeIn("#dots2", ${t(TM.usd2 - 1.2)}, 0.3);
      tl.fromTo("#dots2 circle", { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.02, immediateRender: false }, ${t(TM.usd2 - 1.2)});
      pop("#lb-d2", ${t(TM.usd2 + 0.2)});
      // ===== L16 之后，Coinbase 把 ETC 的充值确认时间，提高到约两周。
      out("#src2", ${t(LS[16] - 0.1)}); pop("#src3", ${t(LS[16] + 0.2)}); pop("#lb-2w", ${t(TM.wk - 0.2)}); bump("#lb-2w", ${t(TM.wk + 0.4)}, 1.1, 1);
      // ===== L17 多数算力，也不一定要持续拥有。
      out("#ev-etc2, #src3, #lb-d1, #lb-d2, #lb-dleg, #lb-pause, #lb-2w, #dots1, #dots2", ${t(LS[17] - 0.3)}, 0.25);
      X16.flip(tl, "fsw", ${t(LS[17] - 0.3)}, false, 0.2); tl.to("#pub", { opacity: 1, duration: 0.2 }, ${t(LS[17] - 0.3)});
      cam(${t(LS[17])}, "forkCL", 1.3);
      tl.to("#arig2", { opacity: 0.3, duration: 0.5 }, ${t(LS[17] + 1.4)}); pop("#lb-ghost", ${t(LS[17] + 1.7)});
      // ===== L18 自私挖矿，是把挖到的块先扣住，再择机一次性释放。
      out("#lb-ghost", ${t(LS[18] - 0.1)}); tl.to("#arig2", { opacity: 1, duration: 0.3 }, ${t(LS[18])});
      fadeIn("#hold", ${t(TM.hold - 0.2)}, 0.3); pop("#lb-hold", ${t(TM.hold)});
      out("#lb-hold", ${t(TM.rel - 0.15)}, 0.15); out("#hold", ${t(TM.rel)}, 0.3); pop("#lb-rel", ${t(TM.rel)}); bump("#priv", ${t(TM.rel + 0.1)}, 1.04, 1);
      // ===== L19 2025 年 9 月，Monero 出现史上最深的 18 块重组。
      out("#lb-rel", ${t(LS[19] - 0.1)}); pop("#ev-xmr", ${t(LS[19] + 0.2)}); pop("#src4", ${t(LS[19] + 0.6)});
      X16.flip(tl, "fsw", ${t(TM.m18 - 0.4)}, true, 0.9); tl.to("#pub", { opacity: 0.45, duration: 0.5 }, ${t(TM.m18 + 0.4)}); pop("#lb-18", ${t(TM.m18 + 0.3)});
      // ===== L20 矿池 Qubic 公开说用了自私挖矿。
      pop("#kw-qubic", ${t(TM.qubic - 0.3)});
      // ===== L21 研究者认为，它的日均算力没有达到 51%。
      out("#src4", ${t(LS[21] - 0.1)}); pop("#src5", ${t(LS[21] + 0.2)}); pop("#kw-51", ${t(TM.d51 - 0.4)});
      // ===== L22 交易所要按租算力的成本和充值金额，定确认数，设单笔和单日上限。
      out("#ev-xmr, #src5, #kw-qubic, #kw-51, #lb-18", ${t(LS[22] - 0.3)}, 0.25); cam(${t(LS[22])}, "deskC", 1.3);
      pop("#cb2", ${t(LS[22] + 0.8)}); pop("#cb2-r0", ${t(LS[22] + 0.9)}); pop("#cb2-r1", ${t(LS[22] + 1.0)}); hot("#cb2-r0", ${t(LS[22] + 0.9)}, "#fde4e1"); hot("#cb2-r1", ${t(LS[22] + 1.0)}, "#fde4e1");
      pop("#cb2-r2", ${t(TM.caps - 0.6)}); hot("#cb2-r2", ${t(TM.caps - 0.3)}, "#dff3e7");
      pop("#lb-cap1", ${t(TM.caps)}); pop("#lb-cap2", ${t(TM.caps + 0.5)});
      // ===== L23 重组深度超过阈值，自动暂停这条链的充提。
      pop("#lb-bcn", ${t(LS[23] + 0.3)}); KIT.beacon(tl, "bcn", ${t(LS[23] + 0.3)}, 2.8, 0.9);
      KIT.led(tl, "desk-led", ${t(TM.stop)}, "red"); pop("#lb-stop", ${t(TM.stop + 0.1)});
`,
});
