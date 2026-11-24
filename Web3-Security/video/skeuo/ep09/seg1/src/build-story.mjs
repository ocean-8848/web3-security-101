// ep09/seg1「① 宽松的滑点」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.A（BRIEF 第 2 节镜头路线：seg1 起于 A 区）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            A 池子与"你"（seg1 起点、seg2 终点、seg3 起点、seg6 收尾前）— k 1.40 · you 490,502–630,803 · pool 734,366–1114,753 · meter 1181,
//   auction      A′ 拍卖比喻（seg2 L20–L22）— k 1.23 · 你 627,595–751,860 · stand 832,300–1082,782 · 旁边的人 1169,595–1293,860
//   B            B 内存池 + 构建场全景（seg1 终点、seg2 起点）— k 0.75 · mempool 219,280–677,644 · searcher 696,609–771,770 (lens 675,645 in h
//   mempool      近景：内存池 + 搜索者 + 放大镜（seg1 L5–L6，seg3 L2 扑空）— k 0.86 · mempool 623,300–1147,716 · searcher 1168,676–1253,860 · le
//   build        近景：构建者 → 区块 → 提议者 + 价签（seg2 L1–L4）— k 0.84 · sorter 492,559–883,860 · chain 904,348–1263,564 · proposer 1303,3
//   poolSorter   池子 + 构建者同框（seg2 L12–L19 三明治三步；seg3 L1–L2 私有通道）— k 0.64 · sorter 955,200–1253,429 · pool 779,660–953,837 · mete
//   D            D 协议设计角（seg3 L9–L12）— k 1.20 · swapvm 300,430–511,752 · commitBox 738,435–1032,769 · bot 1121,659–1253,810 · b
//   AD           A + D 同框：代码卡 A 的红线落到量筒 / 现货价表 / 交换合约（seg3 L4–L8；代码卡放上方 y < 420）— k 0.72 · you 80,610–151,764 · pool 204,540–39
//   C            C 三站并排（seg3 L13、L21–L22，seg3 终点、seg4 起点）— k 0.79 · BNB sign 100,330–319,569 · wheel 251,586–427,719 · clock 42
//   bnb          近景：各站（seg3 L14–L15 / L16–L18 / L19–L20）；左右会露出相邻站的边
//   tron         tron k 1.07 · sign 659,300–956,623 · wheel 861,643–1148,860 · gauge 1168,483–1361,790
//   mantle       mantle k 1.05 · sign 661,300–953,618 · sorter 931,635–1224,860 · operator 1254,614–1359,840
//   E            E 领取合约 ×2 + 支票 + 印章（seg4 L8–L23，seg4 终点、seg5 起点）— k 0.71 · cheque 476,475–667,665 · ETH vending 820,340–963,55
//   bank         近景：银行柜台 + 支票（seg4 L1–L7 支票比喻）— k 0.96 · teller 572,300–1020,716 · cheque 1092,605–1348,860
//   cheque       近景：支票（seg4 L5、L8–L9 五格；seg5 L0）— k 1.88 · cheque 708,340–1212,840
//   traps        E 验签陷阱区（seg5 L1–L14）— k 0.67 · zero 580,354–751,467 · admin 813,280–920,351 · sigPaper 620,519–708,678 / 741,5
//   F            F 多签金库（seg5 L15–L26，seg5 终点、seg6 起点）— k 0.76 · desks 230,401–454,665 / 573,402–797,666 / 917,401–1141,665 · hw
//   desks        近景：三个工位 + 保险柜（seg5 L17–L22 假界面）— k 1.02 · desks 120,484–421,838 / 580,484–881,838 / 1041,484–1341,838 · vault 
//   roles        F 三角色站位（seg6 L0–L4）— k 0.68 · desks 557,280–756,514 / 861,280–1059,514 / 1164,280–1363,514 · lens 962,560–1059
//   world        全景：所有区（seg6 L10–L12 拉远收尾）— k 0.14
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
// ends static on CAMS.B
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// A 交易广场
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", h: 243, r: 31, max: 20, th: 19, level: 0, thText: " " }), 0, { grow: true });
put("you", L.YOU, O.person(L.YOU, { id: "you", role: "signer" }));
put("pp", L.AMM, E1.pipe(L.AMM, { id: "pp", pts: L.PIPE.tx }), -40);
put("tx", L.LETTER, E1.letter(L.LETTER, { id: "tx", z: L.LETTER.z }), 0, { wrap: (s) => S.hid("tx-h", s) });
// 脚边 10 枚金币（ETH），每枚一个 <g>
const coinAt = (i) => { const c = i % 5, r = Math.floor(i / 5); return [L.DOTS[0] + c * 18 + r * 13, L.DOTS[1] - c * 6.3 + r * 9]; };
add({ u: G(...L.DOTS).u, v: G(...L.DOTS).v }, `<g id="coins">${Array.from({ length: 10 }, (_, i) => { const [x, y] = coinAt(i);
  return `<g id="coin-${i}" opacity="0"><ellipse cx="${f(x)}" cy="${f(y + 3)}" rx="9" ry="5.2" fill="#a87b12"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="9" ry="5.2" fill="#e2b33c" stroke="#a87b12" stroke-width="1.2"/></g>`; }).join("")}</g>`, 30);
// 搜索者利润：池子出料口旁一小撮红点
const OUT = A.amm.outR;
add(L.METER, `<g id="profit" opacity="0">${[[0, 0], [16, -6], [8, 10], [24, 6], [-6, 12]].map(([dx, dy]) => `<circle cx="${f(OUT[0] + 20 + dx)}" cy="${f(OUT[1] - 30 + dy)}" r="7" fill="#e0453a"/>`).join("")}</g>`, 60);

// B 内存池与构建场
put("mp", L.MEMPOOL, E1.mempool(L.MEMPOOL, { id: "mp", n: 5 }));
put("srch", L.SEARCHER, O.person(L.SEARCHER, { id: "srch", role: "attacker" }));
put("lens", L.LENS, O.magnifier(L.LENS, { id: "lens" }), 20);
put("sorter", L.SORTER, E1.sorter(L.SORTER, { id: "sorter", letters: 3, red: [0, 2] }));
put("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 3 }));
put("prop", L.PROPOSER, O.person(L.PROPOSER, { id: "prop", role: "engineer" }));
put("bdoc", L.BLOCKDOC, O.doc(L.BLOCKDOC, { id: "bdoc", w: 100, h: 130, title: "区块" }));
// 两封红信（搜索者的交易），从搜索者脚边出发
const RL0 = S.rel(L.SEARCHER, -60, 30), RL1 = S.rel(L.SEARCHER, -20, 60);
put("rl0", RL0, E1.letter(RL0, { id: "rl0", state: "attacker" }), 0, { wrap: (s) => S.hid("rl0-h", s) });
put("rl1", RL1, E1.letter(RL1, { id: "rl1", state: "attacker" }), 0, { wrap: (s) => S.hid("rl1-h", s) });
// 你的信封进队后的位置 = slots[6]；红信夹在 slots[5] / slots[7]
const SL = A.mp.slots;
const ring = [SL[6][0], SL[6][1] - 32];
S.raw(`<svg id="seen" style="position:absolute;left:0;top:0;overflow:visible;opacity:0" width="1" height="1"><line x1="${f(A.lens.lens[0])}" y1="${f(A.lens.lens[1])}" x2="${f(ring[0] + 30)}" y2="${f(ring[1] + 8)}" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8"/><ellipse cx="${f(ring[0])}" cy="${f(ring[1])}" rx="48" ry="42" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/></svg>`);

// 远处右侧（E 区方向）一张支票的轮廓：放在 CAMS.B 画面右缘（本段局部位置，不进 layout）
const scrInv = (cam, [sx, sy]) => { const c = L.CAMS[cam]; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; };
const CHQ = { ...G(...scrInv("B", [1780, 480])), scale: 0.7 };
put("chq", CHQ, X.cheque(CHQ, { id: "chq", scale: CHQ.scale, signed: true }), 0, { wrap: (s) => S.hid("chq-h", s) });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-you", up(A.you.top, 6), "你", "lab-ink lab-sm");
lb("lb-tx", up(A.tx.top, 4), "10 ETH → USDC", "lab-cs lab-sm");
lb("lb-coins", [L.DOTS[0] + 40, L.DOTS[1] + 40], "10 ETH", "lab-g lab-sm", "t");
lb("lb-px", up(A.amm.top, 10), `现价 1 ETH = 2000 USDC ${gtag("示例")}`, "lab-ink lab-sm");
lb("lb-slip", up(A.meter.top, 8), "滑点 5%", "lab-cs lab-sm");
lb("lb-th", [A.meter.th[0] + 6, A.meter.th[1]], "最少 19000", "lab-rs lab-sm", "l");
lb("lb-rb", [A.meter.th[0] + 6, A.meter.th[1] + 52], "低于 → 回滚", "lab-r lab-sm", "l");
lb("lb-x", [A.meter.th[0] - 40, A.meter.th[1] + 60], "✕", "lab-rs lab-sm");
lb("lb-ok", up(A.you.top, 52), "✓ 成功", "lab-gs");
lb("lb-worst", up(A.you.top, 6), "按允许的最差价格", "lab-g lab-sm");
lb("lb-prof", [OUT[0] + 50, OUT[1] - 70], "→ 搜索者", "lab-r lab-sm", "l");
lb("lb-mp", up(A.mp.top, 10), "公开内存池", "lab-cs lab-sm");
lb("lb-mine", [ring[0] - 56, ring[1]], "你的交易", "lab-ink lab-sm", "r");
lb("lb-srch", up(A.srch.top, 6), "搜索者", "lab-rs lab-sm");
lb("lb-sw", [SL[7][0] - 10, SL[7][1] + 40], "红 · 你 · 红", "lab-r lab-sm", "t");
lb("lb-ord", up(A.sorter.top, 12), "打包前公开 · 顺序由别人决定", "lab-ink lab-sm");
lb("lb-chq", [A.chq.top[0] - 10, A.chq.top[1] - 4], "签名用过仍在", "lab-g lab-sm", "r");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  kw("kw-q", "先猜", { x: 64, y: 320, size: 44, accent: "#2aa3c9" }) +
  ck("q0", "最少收到？", { x: 64, y: 410, w: 400, kind: "n" }) +
  ck("q1", "能更少吗？", { x: 64, y: 500, w: 400, kind: "n" }) +
  ck("a0", "最少 19000", { x: 64, y: 410, w: 400, kind: "g" }) +
  ck("a1", "不能更少", { x: 64, y: 500, w: 400, kind: "g" }) +
  ck("a2", "他也赚不到", { x: 64, y: 590, w: 400, kind: "r" }) +
  kw("kw-5", `滑点 5% <b>≈</b> 可能真付 5%`, { x: 560, y: 150, size: 56, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  ex: w("示例", 1), slip: w("滑点", 2), min: w("最少", 3), rb: w("回滚", 3), sent: w("发出去", 4), read: w("读到", 5),
  jia: w("夹在", 6), guess: w("猜", 7), q1: w("更少", 8), ans: w("19000", 9), no: w("不能", 9), rb2: w("回滚", 10), earn: w("赚不到", 10),
  push: w("推到", 11), ok: w("没有失败", 12), worst: w("最差价格", 12), pub: w("公开", 14), order: w("顺序", 14), sig: w("签名", 15),
};
// 信封路线：手里 → 管口 → 沿管（管面上方）→ 内存池入口 → 沿蛇形通道到队尾 slots[6]
const PZ = L.PIPE_Z;
const pipePts = L.PIPE.tx.map(([du, dv]) => Wp(L.AMM.u + du, L.AMM.v + dv, PZ));
const qPts = [A.mp.entry, ...[14, 13, 12, 11, 10, 9, 8, 7, 6].map((k) => SL[k])];
const txRoute = JSON.stringify([...pipePts, ...qPts].map((p) => [+f(p[0]), +f(p[1])]));
const rl0Route = JSON.stringify([[+f(SL[5][0]), +f(SL[5][1])]]);
const rl1Route = JSON.stringify([[+f(SL[7][0]), +f(SL[7][1])]]);
const t = (x) => f(x);

S.build({
  cam0: "A", sub: "宽松的滑点",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "滑点", d: "成交价相对报价可接受的最大偏离", at: w("滑点", 2) },
    { id: "t1", t: "内存池", d: "交易打包前公开排队等待的地方", at: w("内存池", 4) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 你在一个去中心化交易所，用 10 个 ETH 换 USDC。
      pop("#lb-you", ${t(LS[0] + 0.3)}, 0.25);
      for (let i = 0; i < 10; i++) fadeIn("#coin-" + i, ${t(LS[0] + 0.8)} + i * 0.08, 0.2);
      pop("#lb-coins", ${t(LS[0] + 1.7)}, 0.25);
      fadeIn("#tx-h", ${t(w("USDC", 0) - 0.5)}, 0.3); pop("#lb-tx", ${t(w("USDC", 0) - 0.2)}, 0.25);
      // ===== L1 池子现价，1 个 ETH 换 2000 USDC。这是示例。
      pop("#lb-px", ${t(LS[1] + 0.3)}, 0.3); X8.hop(tl, "amm", ${t(LS[1] + 0.5)}, "R", 2);
      // ===== L2 你把滑点设成 5%。
      out("#lb-coins", ${t(LS[2] - 0.2)});
      grow("meter", ${t(TM.slip)}, 0.5); X5.fill(tl, "meter", ${t(TM.slip + 0.5)}, 20, 0.8); pop("#lb-slip", ${t(TM.slip + 0.6)}, 0.25);
      // ===== L3 意思是，最少拿到 19000 USDC。少于这个数，交易就回滚。
      pop("#lb-th", ${t(TM.min)}, 0.3); pop("#lb-rb", ${t(TM.rb)}, 0.3);
      // ===== L4 交易发出去，先进入公开的内存池，排队等着打包。
      out("#lb-px, #lb-slip, #lb-th, #lb-rb, #lb-tx, #lb-you", ${t(LS[4] - 0.2)});
      out("#coins", ${t(TM.sent)}, 0.4);
      X1.walk(tl, "tx", ${t(TM.sent)}, 3.4, ${txRoute});
      cam(${t(LS[4] + 0.4)}, "B", 1.8);
      pop("#lb-mp", ${t(LS[4] + 2.3)}, 0.25);
      // ===== L5 有人在打包之前，读到了它。
      out("#lb-mp", ${t(LS[5] - 0.2)});
      cam(${t(LS[5] - 0.1)}, "mempool", 1.0);
      pop("#lb-srch", ${t(LS[5] + 0.5)}, 0.25);
      fadeIn("#seen", ${t(TM.read)}, 0.3); pop("#lb-mine", ${t(TM.read + 0.2)}, 0.25); flash("#seen", ${t(TM.read + 0.5)}, 2, 0.4);
      // ===== L6 他把你的交易，夹在自己的两笔交易中间。
      out("#seen", ${t(TM.jia - 0.2)});
      fadeIn("#rl0-h, #rl1-h", ${t(TM.jia)}, 0.25);
      X1.walk(tl, "rl0", ${t(TM.jia + 0.1)}, 1.1, ${rl0Route});
      X1.walk(tl, "rl1", ${t(TM.jia + 0.3)}, 1.1, ${rl1Route});
      pop("#lb-sw", ${t(TM.jia + 1.5)}, 0.25);
      // ===== L7 先猜一道题。
      out("#lb-sw, #lb-mine, #lb-srch", ${t(LS[7] - 0.2)});
      pop("#kw-q", ${t(TM.guess)}, 0.3);
      // ===== L8 你最少收到多少？他能让你收到更少吗？
      cam(${t(LS[8])}, "A", 1.4);
      pop("#q0", ${t(LS[8] + 0.1)}, 0.25); pop("#q1", ${t(TM.q1 - 0.5)}, 0.25);
      // ===== L9 你最少收到 19000。他不能让你更少。
      out("#q0", ${t(TM.ans - 0.15)}, 0.15); pop("#a0", ${t(TM.ans)}, 0.25); pop("#lb-th", ${t(TM.ans + 0.1)}, 0.25);
      out("#q1", ${t(TM.no - 0.15)}, 0.15); pop("#a1", ${t(TM.no)}, 0.25);
      // ===== L10 低于这个数，你的交易回滚，他也赚不到钱。
      pop("#lb-rb", ${t(TM.rb2 - 0.2)}, 0.25); pop("#lb-x", ${t(TM.rb2)}, 0.25); flash("#lb-x", ${t(TM.rb2 + 0.3)}, 2, 0.3);
      pop("#a2", ${t(TM.earn)}, 0.25);
      // ===== L11 所以，他会把价格推到刚好够 19000 的位置。
      out("#lb-x", ${t(LS[11])});
      X8.poolPump(tl, "amm", ${t(TM.push)}, { side: "L", n: 2, gap: 0.5, L: 0.8, R: 0.35, deg: 40, read: "1,900" });
      X5.fill(tl, "meter", ${t(TM.push + 0.7)}, 19, 2.0);
      // ===== L12 你的交易没有失败。它只是按你允许的最差价格，成交了。
      out("#kw-q, #a0, #a1, #a2", ${t(LS[12] - 0.2)});
      pop("#lb-ok", ${t(TM.ok)}, 0.3);
      pop("#lb-worst", ${t(TM.worst)}, 0.25);
      fadeIn("#profit", ${t(TM.worst + 0.3)}, 0.25); pop("#lb-prof", ${t(TM.worst + 0.4)}, 0.25);
      tl.to("#profit", { x: 40, y: -260, opacity: 0, duration: 1.4, ease: "power1.in" }, ${t(TM.worst + 1.2)});
      // ===== L13 滑点设 5%，就可能真的付 5%。
      out("#lb-rb, #lb-prof", ${t(LS[13] - 0.2)});
      pop("#kw-5", ${t(LS[13] + 0.2)}, 0.35);
      // ===== L14 交易在打包之前是公开的，顺序由别人决定。
      out("#kw-5, #lb-th, #lb-ok, #lb-worst", ${t(LS[14] - 0.2)});
      cam(${t(LS[14])}, "B", 1.6);
      pop("#lb-ord", ${t(TM.order - 0.3)}, 0.3);
      flash(${JSON.stringify(A.sorter.envIds.map((i) => "#" + i).join(", "))}, ${t(TM.order)}, 3, 0.25);
      X1.dash(tl, ${JSON.stringify(A.sorter.beltIds)}, ${t(TM.order)}, 1.6, 60);
      // ===== L15 签名在用过之后仍然存在。能不能再用，取决于你签了什么。
      out("#lb-ord", ${t(LS[15] - 0.1)});
      fadeIn("#chq-h", ${t(TM.sig)}, 0.5); pop("#lb-chq", ${t(TM.sig + 0.3)}, 0.25); flash("#chq-h", ${t(TM.sig + 0.9)}, 1, 0.4);
      out("#chq-h, #lb-chq", ${t(67.2)}, 0.4);
`,
});
