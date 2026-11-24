// ep16/seg5「⑤ 停链与回滚」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.rangeD（BRIEF）。ends static on CAMS.voteE
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E7, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 包一层缩放（常见坑 1）：绕地面点 translate·scale·translate，并换算 anchors
const wrapPut = (key, o, r, k, dy = 0) => {
  const [gx, gy] = at(o);
  const sc = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const isPt = (q) => Array.isArray(q) && q.length >= 2 && typeof q[0] === "number";
  for (const n of Object.keys(A[key])) {
    const q = A[key][n];
    if (isPt(q)) A[key][n] = sc(q);
    else if (Array.isArray(q) && q.length && isPt(q[0])) A[key][n] = q.map(sc);
  }
};
// 石板路（原生 SVG，画在最底下）
S.add(L.ROAD[0], `<polyline points="${L.ROAD.map((q) => Wp(q.u, q.v).join(",")).join(" ")}" fill="none" stroke="#dcd6cb" stroke-width="90" stroke-linejoin="round" stroke-linecap="round" opacity="0.8"/>`, -1e6);

// ---- D（起始镜头 rangeD 的静态布景，接上一段）
put("chD", L.CHAIND, O.chain(L.CHAIND, { id: "chD", n: 4 }));
put("rwD", L.REWRITE, O.chain(L.REWRITE, { id: "rwD", n: 3, state: "attacker" }));
put("keyD", L.OLDKEY, O.key(L.OLDKEY, { id: "keyD", state: "attacker" }));
put("nnD", L.NEWNODE, O.person(L.NEWNODE, { id: "nnD", role: "engineer", scale: 0.6 }));
L.CPDOCS.forEach((q, i) => put("cpD" + i, q, O.doc(q, { id: "cpD" + i, standing: true, title: "检查点 · 来源 " + (i + 1) })));
put("magD", L.MAGD, O.magnifier(L.MAGD, { id: "magD" }));

// ---- E 停链广场
put("sgE", L.SIGNE, E1.signBoard(L.SIGNE, { id: "sgE", style: "plate", text: "停链与回滚" }));
put("knife", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "knife", on: true, text: "出块" }));
put("clk", L.CLOCKE, O.clock(L.CLOCKE, { id: "clk", h: 10, m: 0 }));
wrapPut("brg", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "brg" }), 0.6);
put("mino", L.MINORITY, E9.rotaWheel(L.MINORITY, { id: "mino", n: 6, scale: 0.7, plate: "少数验证者" }));
put("frz", L.FREEZE, O.seal(L.FREEZE, { id: "frz", stamped: false, text: "攻击者地址", markText: "冻结" }));
// 洪泛的小信封（L3）：从左侧涌向转台
const FLOOD = [[-260, -40], [-300, 30], [-230, 90], [-330, -100], [-280, 150], [-360, 60]].map(([du, dv], i) => ({ u: L.MINORITY.u + du, v: L.MINORITY.v + dv, i }));
FLOOD.forEach((q) => put("fl" + q.i, q, E1.letter(q, { id: "fl" + q.i, w: 44, h: 30 }), 0, { grow: false }));
L.LETTERS.forEach((q, i) => put("lt" + i, q, E1.letter(q, { id: "lt" + i })));
put("sorter", L.SORTER, E1.sorter(L.SORTER, { id: "sorter", letters: 2, blockLabel: "unsafe" }));
put("sigE", L.FSIGE, X.finalitySignal(L.FSIGE, { id: "sigE", lit: -1 }));
wrapPut("l1c", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1c", n: 3, labels: ["L1", "L1", "L1"], glow: true }), 0.7);
put("fpipe", L.FPIPE.o, E1.pipe(L.FPIPE.o, { id: "fpipe", pts: L.FPIPE.pts }), -20);
put("deskE", L.DESKE, E7.dispatchDesk(L.DESKE, { id: "deskE", scale: 0.8, entries: ["unsafe ✓", "提走 ✓", "损失", "L1 最终确定"] }));
wrapPut("cust", L.CUSTODY, O.safe(L.CUSTODY, { id: "cust", gold: true, plate: "托管" }), 0.8);
put("wit", L.WITNESS, E9.commitBox(L.WITNESS, { id: "wit", scale: 0.8, name: "见证人" }));
put("phE", L.PHONE, O.phone(L.PHONE, { id: "phE" }));
// 金条（L18）：从保险柜门口移向投票箱
const GOLD0 = A.cust.front ?? A.cust.center;
const goldBar = (x, y) => `<path d="M${x - 18},${y} l18,-9 l18,9 l-18,9 z" fill="#f0c04a" stroke="#a87a12" stroke-width="1.5"/><path d="M${x - 18},${y} v8 l18,9 l18,-9 v-8 l-18,9 z" fill="#d9a52c" stroke="#a87a12" stroke-width="1.5"/>`;
S.add(L.WITNESS, S.hid("gold", goldBar(GOLD0[0] - 14, GOLD0[1] + 20) + goldBar(GOLD0[0] + 14, GOLD0[1] + 12) + goldBar(GOLD0[0], GOLD0[1] + 4)), 400);
const GOLD_D = [A.wit.slot[0] - GOLD0[0], A.wit.slot[1] - 12 - GOLD0[1] - 12];
if (process.env.DBG) {
  for (const c of ["haltE", "seqE", "voteE"]) console.log(c, JSON.stringify(Object.fromEntries(Object.entries(A).filter(([k]) => !/D$|^cpD|^fl/.test(k)).map(([k, v]) => [k, S.scr(c, v.top).map(Math.round)]))));
  console.log(Object.keys(A.cust), Object.keys(A.sorter), Object.keys(A.fpipe));
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const sh = (q, dx, dy = 0) => [q[0] + dx, q[1] + dy];
lb("lb-knife", up(A.knife.top, 6), "停止出块", "lab-rs");
lb("lb-clk", up(A.clk.top, 6), "约 17 小时", "lab-r");
lb("lb-brg", up(A.brg.booth, 10), "跨链桥 · 伪造证明", "lab-rs lab-sm");
lb("lb-mino", up(A.mino.top, 6), "少数验证者", "lab-cs lab-sm");
lb("lb-frz", up(A.frz.top, 6), "冻结攻击者地址", "lab-rs lab-sm");
["停链", "冻结", "回滚"].forEach((x, i) => lb("lb-p" + i, sh(up(A.mino.top, 95), (i - 1) * 230), x, "lab-r lab-sm"));
lb("lb-sorter", up(A.sorter.top, 6), "排序器 · 一个运营方", "lab-cs");
lb("lb-blk", up(A.sorter.blockTop, 8), "unsafe 头 · 只是承诺", "lab-cs lab-sm");
lb("lb-rb", up(A.sorter.blockTop, 10), "回滚 × 2", "lab-rs lab-sm");
lb("lb-20", up(A.sorter.blockTop, 12), "回滚约 20 分钟的交易", "lab-rs lab-sm");
lb("lb-sigU", sh(A.sigE.plates[0], 0, 22), "unsafe", "lab-cs lab-sm", "l");
lb("lb-sigF", sh(A.sigE.plates[2], 0, -30), "finalized", "lab-gs lab-sm", "l");
lb("lb-sigX", sh(A.sigE.plates[2], 2, -30), "被回滚", "lab-rs lab-sm", "l");
const DE = [A.deskE.center[0] + 105, A.deskE.top[1] - 10];
[["unsafe 入账 ✓", "lab-cs lab-sm"], ["用户提走 ✓", "lab-cs lab-sm"], ["损失：交易所", "lab-rs"], ["大额 · L1 最终确定", "lab-gs"]]
  .forEach(([x, c], i) => lb("lb-e" + i, [DE[0], DE[1] + i * 72], x, c, "l"));
lb("lb-l1", up(A.l1c.top, 6), "L1 · 最终确定的批次", "lab-gs lab-sm");
lb("lb-pipe", up(A.fpipe.mid, 30), "强制包含", "lab-cs lab-sm");
lb("lb-cust", up(A.cust.top, 6), "托管的客户 STEEM", "lab-cs");
lb("lb-nov", up(A.cust.top, 9), "默认不投票", "lab-gs");
lb("lb-exc", [A.cust.center[0] - 150, A.cust.center[1]], "例外：书面授权", "lab-cs lab-sm", "r");
lb("lb-wit", up(A.wit.top, 6), "见证人投票", "lab-cs");
lb("lb-seat", up(A.wit.top, 9), "控制见证人席位", "lab-rs");
lb("lb-huobi", up(A.wit.ground, -20), "Huobi 承认动用客户资金", "lab-r lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const html = [
  kw("kw-live", `活性 = 能继续处理<b>新交易</b>`, { x: 100, y: 130, size: 36 }),
  kw("kw-safe", `安全性 = 确认过的结果<b>不被推翻</b>`, { x: 100, y: 214, size: 36, accent: "#2aa3c9" }),
  evt("ev-sol", `<b>Solana</b> · 2021 年 9 月`, { top: 120, color: "#e0453a" }),
  evt("src-sol", `${gtag("第三方分析")} Jump Crypto`, { top: 204 }),
  evt("ev-bsc", `<b>BSC</b> · 2022 年 10 月`, { top: 122, color: "#e0453a" }),
  evt("src-bsc", `${gtag("公开报道")} The Block、Halborn`, { top: 206 }),
  kw("kw-imm", `不可篡改 · <b>有前提</b>${gtag("解读")}`, { x: 560, y: 130, size: 48, accent: "#e0453a" }),
  evt("ev-stk", `<b>Starknet</b> · 2025 年 9 月`, { top: 124, color: "#e0453a" }),
  evt("src-stk", `${gtag("官方复盘")} Starknet 事件报告`, { top: 208 }),
  kw("kw-mot", `攻击者控制了什么 · <b>别人的动机</b>`, { x: 560, y: 136, size: 38, accent: "#e0453a" }),
  evt("ev-stm", `<b>Steem</b> · 2020 年 3 月`, { top: 126, color: "#e0453a" }),
  evt("src-stm", `${gtag("公开报道")} Decrypt、Cointelegraph`, { top: 210 }),
  kw("kw-pow", `托管资产 = <b>共识权力</b>${gtag("解读")}`, { x: 520, y: 150, size: 52, accent: "#e0453a" }),
].join("");
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  stop: w("停下", 0), live: w("活性", 1), safe: w("安全性", 2), flood: w("洪泛", 3), oom: w("内存溢出", 4), halt: w("停止出块", 4),
  forge: w("伪造证明", 5), pause: w("暂停出块", 6), frz: w("冻结", 6), p0: w("停链", 7), p1: w("冻结", 7), p2: w("回滚", 7),
  imm: w("不可篡改", 8), seq: w("排序器", 9), uns: w("unsafe", 10), rb2: w("两次回滚", 11), min20: w("分钟", 12),
  book: w("入账", 13), wd: w("提走", 13), rb: w("回滚", 13), loss: w("损失", 14), l1: w("L1", 15), fin: w("最终确定", 15),
  down: w("宕机", 16), force: w("强制提交", 16), mot: w("别人的动机", 17), cust: w("托管", 18), vote: w("投票", 18),
  seat: w("见证人席位", 19), huobi: w("承认", 19), pow: w("共识权力", 20), nov: w("默认不参与", 21), exc: w("书面授权", 21),
};
const FL = FLOOD.map((q, i) => ({ id: "fl" + q.i, to: sh(A.mino.center, (i % 3 - 1) * 40, (i % 2) * 20) }));
const t = (x) => f(x);

S.build({
  cam0: "rangeD", sub: "unsafe 头可以被回滚，损失由入账方承担",
  grid: { u0: 5800, u1: 13100, v0: 900, v1: 8000 }, box: [7600, -2100, 5400, 2400],   // 盖住 rangeD / haltE / seqE / voteE
  shown: [], css, html,
  terms: [
    { id: "t0", t: "排序器", d: "L2 中决定交易顺序并出块的角色", at: w("排序器", 9) },
    { id: "t1", t: "unsafe 头", d: "排序器已出、尚未提交到 L1 的块", at: w("unsafe 头", 10) },
    { id: "t2", t: "见证人", d: "Steem 上负责出块的节点", at: w("见证人", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#l1c-glow", { opacity: 0 }, 0);
      // ===== L0 链也可能整条停下。
      cam(${t(LS[0])}, "haltE", 1.8); KIT.toggle(tl, "knife", ${t(Math.max(TM.stop, LS[0] + 1.6))}, false); pop("#lb-knife", ${t(LS[0] + 2.0)});
      // ===== L1 活性，是链能继续处理新交易。
      pop("#kw-live", ${t(TM.live)});
      // ===== L2 安全性，是已经确认的结果不被推翻。
      pop("#kw-safe", ${t(TM.safe)});
      // ===== L3 2021 年 9 月，一次代币发行引来机器人交易洪泛。
      out("#kw-live, #kw-safe, #lb-knife", ${t(LS[3] - 0.2)}); pop("#ev-sol", ${t(LS[3] + 0.1)}); pop("#src-sol", ${t(LS[3] + 0.6)}); pop("#lb-mino", ${t(LS[3] + 0.4)});
      ${JSON.stringify(FL)}.forEach((q, i) => { X1.walk(tl, q.id, ${t(TM.flood - 0.6)} + i * 0.18, 1.1, [q.to]); out("#" + q.id, ${t(TM.flood + 0.6)} + i * 0.18, 0.25); });
      // ===== L4 Solana 验证者内存溢出，全网停止出块约 17 小时。
      X9.seats(tl, "mino", ${t(TM.oom)}, "red", [], 0.5); KIT.clock(tl, "clk", ${t(TM.halt)}, 2.2, 1020); pop("#lb-clk", ${t(TM.halt + 0.3)});
      // ===== L5 2022 年 10 月，BSC 上的跨链桥被伪造证明攻击。
      out("#ev-sol, #src-sol, #lb-clk", ${t(LS[5] - 0.2)}); X9.seats(tl, "mino", ${t(LS[5])}, "normal", [], 0.4);
      pop("#ev-bsc", ${t(LS[5] + 0.1)}); pop("#src-bsc", ${t(LS[5] + 0.6)}); X9.spin(tl, "mino", ${t(LS[5] + 0.3)}, 3.6, 3, 0);
      KIT.led(tl, "brg-booth-led", ${t(TM.forge)}, "red"); KIT.broke(tl, "brg-booth", ${t(TM.forge + 0.2)}, { badge: true }); pop("#lb-brg", ${t(TM.forge + 0.4)});
      // ===== L6 BNB Chain 要求验证者暂停出块，新版本冻结了攻击者地址。
      X9.lamp(tl, "mino", ${t(TM.pause)}, false); bump("#lb-mino", ${t(TM.pause)}); KIT.stamp(tl, "frz", ${t(TM.frz - 0.3)}); pop("#lb-frz", ${t(TM.frz + 0.5)});
      // ===== L7 验证者少的链，可以在几小时内协调停链、冻结，甚至回滚。
      out("#ev-bsc, #src-bsc", ${t(LS[7] - 0.2)}); X9.seats(tl, "mino", ${t(LS[7] + 0.3)}, "hot", [], 0.3);
      pop("#lb-p0", ${t(TM.p0)}); pop("#lb-p1", ${t(TM.p1)}); pop("#lb-p2", ${t(TM.p2)});
      // ===== L8 这能救急，也说明这条链的不可篡改，是有前提的。
      pop("#kw-imm", ${t(TM.imm)});
      // ===== L9 L2 的排序器，通常由一个运营方负责出块。
      out("#kw-imm, #lb-brg, #lb-mino, #lb-frz, #lb-p0, #lb-p1, #lb-p2", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "seqE", 1.3);
      pop("#lb-sorter", ${t(TM.seq + 0.2)}); X1.dash(tl, ${JSON.stringify(A.sorter.beltIds)}, ${t(LS[9] + 0.8)}, 3, -120);
      X1.walk(tl, "lt2", ${t(LS[9] + 1.0)}, 1.4, [${JSON.stringify(A.sorter.in)}]); out("#lt2", ${t(LS[9] + 2.5)}, 0.3);
      // ===== L10 它刚出的 unsafe 头，只是排序器的承诺，可以被回滚。
      X16.sig(tl, "sigE", ${t(TM.uns)}, 0); pop("#lb-sigU", ${t(TM.uns + 0.4)}); pop("#lb-blk", ${t(TM.uns + 0.6)});
      // ===== L11 2025 年 9 月，Starknet 升级后停链，并两次回滚。
      const flipBack = (t0) => { tl.to("#sorter-block", { x: -46, y: -16, opacity: 0.35, duration: 0.35, ease: "power2.in" }, t0); tl.to("#sorter-block", { x: 0, y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, t0 + 0.5); };
      pop("#ev-stk", ${t(LS[11] + 0.1)}); pop("#src-stk", ${t(LS[11] + 0.6)});
      out("#lb-blk", ${t(TM.rb2 - 0.2)}); flipBack(${t(TM.rb2)}); flipBack(${t(TM.rb2 + 1.0)}); pop("#lb-rb", ${t(TM.rb2 + 0.4)});
      // ===== L12 第二次回滚掉约 20 分钟的交易。
      out("#lb-rb", ${t(TM.min20 - 0.5)}); pop("#lb-20", ${t(TM.min20 - 0.3)}); tl.to("#lt0, #lt1", { opacity: 0.3, duration: 0.5 }, ${t(TM.min20)});
      // ===== L13 如果交易所按 unsafe 头入账，用户随即提走，块又被回滚。
      out("#ev-stk, #src-stk, #lb-20", ${t(LS[13] - 0.2)}); bump("#lb-sigU", ${t(TM.book - 0.3)});
      X7.entry(tl, "deskE", ${t(TM.book)}, 0); pop("#lb-e0", ${t(TM.book + 0.2)}); X7.entry(tl, "deskE", ${t(TM.wd)}, 1); pop("#lb-e1", ${t(TM.wd + 0.2)});
      flipBack(${t(TM.rb)}); X16.sigBad(tl, "sigE", ${t(TM.rb + 0.4)}, true); pop("#lb-sigX", ${t(TM.rb + 0.6)});
      // ===== L14 这笔损失，由交易所承担。
      X7.entry(tl, "deskE", ${t(TM.loss)}, 2); KIT.led(tl, "deskE-led", ${t(TM.loss)}, "red"); pop("#lb-e2", ${t(TM.loss + 0.2)}); bump("#lb-e2", ${t(TM.loss + 1.0)});
      // ===== L15 所以大额要等 L1 上最终确定的批次。
      fadeIn("#l1c-glow", ${t(TM.l1)}, 0.5); pop("#lb-l1", ${t(TM.l1 + 0.2)});
      out("#lb-sigX", ${t(TM.fin - 0.2)}); X16.sigBad(tl, "sigE", ${t(TM.fin)}, false); X16.sig(tl, "sigE", ${t(TM.fin + 0.2)}, 2); pop("#lb-sigF", ${t(TM.fin + 0.8)});
      X7.entry(tl, "deskE", ${t(TM.fin + 0.5)}, 3); pop("#lb-e3", ${t(TM.fin + 0.7)});
      // ===== L16 排序器宕机时，用户可以通过 L1 合约，强制提交交易。
      ${JSON.stringify(A.sorter.ledIds)}.forEach((id) => KIT.led(tl, id, ${t(TM.down)}, "red"));
      fadeIn("#fpipe-flow", ${t(TM.force - 0.3)}, 0.3); X1.dash(tl, "fpipe-flow", ${t(TM.force - 0.3)}, 3.6, -240); pop("#lb-pipe", ${t(TM.force)});
      // ===== L17 最后一种资源，是别人的动机。
      out("#lb-sorter, #lb-sigU, #lb-sigF, #lb-e0, #lb-e1, #lb-e2, #lb-e3, #lb-l1, #lb-pipe", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "voteE", 1.4);
      pop("#kw-mot", ${t(LS[17] + 0.4)});
      // ===== L18 2020 年 3 月的 Steem 事件，报道称 Huobi、Binance 和 Poloniex，用托管的客户 STEEM 投票。
      out("#kw-mot", ${t(LS[18] - 0.2)}); pop("#ev-stm", ${t(LS[18] + 0.1)}); pop("#src-stm", ${t(LS[18] + 0.6)});
      pop("#lb-cust", ${t(TM.cust - 0.4)}); pop("#lb-wit", ${t(TM.cust)}); KIT.door(tl, "cust", ${t(TM.cust)}, 105, 1.0);
      fadeIn("#gold", ${t(TM.vote - 0.9)}, 0.3); tl.to("#gold", { x: ${GOLD_D[0].toFixed(1)}, y: ${GOLD_D[1].toFixed(1)}, duration: 1.2, ease: "power2.inOut" }, ${t(TM.vote - 0.6)});
      out("#gold", ${t(TM.vote + 0.6)}, 0.3); X9.slot(tl, "wit", ${t(TM.vote + 0.6)}, 2);
      // ===== L19 帮助 Justin Sun 控制了见证人席位，Huobi 承认动用了客户资金。
      X9.slotOn(tl, "wit", ${t(TM.seat)}, true); out("#lb-wit", ${t(TM.seat - 0.2)}); pop("#lb-seat", ${t(TM.seat)}); pop("#lb-huobi", ${t(TM.huobi)});
      // ===== L20 交易所的托管资产，本身就是共识权力。
      out("#ev-stm, #src-stm", ${t(LS[20] - 0.2)}); pop("#kw-pow", ${t(TM.pow - 0.4)});
      // ===== L21 客户资产默认不参与投票，例外要有书面授权。
      out("#kw-pow, #lb-huobi", ${t(LS[21] - 0.2)}); KIT.door(tl, "cust", ${t(TM.nov - 0.3)}, 0, 0.9); X9.slotOn(tl, "wit", ${t(TM.nov)}, false);
      out("#lb-cust", ${t(TM.nov - 0.2)}); pop("#lb-nov", ${t(TM.nov + 0.4)}); pop("#lb-exc", ${t(TM.exc)});
`,
});
