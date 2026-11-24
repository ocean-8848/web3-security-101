// ep09/seg2「② 被买走的顺序」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.B（BRIEF 第 2 节镜头路线：seg2 起于 B 区）。
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
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import { G, BADGE } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.A

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// B 区：内存池、搜索者 + 放大镜、构建者（传送带空着，信封单独建）、区块链、提议者 + 区块单
put("mp", L.MEMPOOL, E1.mempool(L.MEMPOOL, { id: "mp", n: 5 }));
put("ch", L.CHAIN, O.chain(L.CHAIN, { id: "ch", n: 3, labels: ["#1", "#2", "#3"] }));
put("pr", L.PROPOSER, O.person(L.PROPOSER, { id: "pr", role: "engineer" }));
put("bdoc", L.BLOCKDOC, O.doc(L.BLOCKDOC, { id: "bdoc", title: "区块", scale: L.BLOCKDOC.scale }), 0, { grow: true });
put("tx", L.AMM, E1.pipe(L.AMM, { id: "tx", pts: L.PIPE.tx }), -850);
put("se", L.SEARCHER, O.person(L.SEARCHER, { id: "se", role: "attacker" }));
put("so", L.SORTER, E1.sorter(L.SORTER, { id: "so", letters: 0 }));
put("lens", L.LENS, O.magnifier(L.LENS, { id: "lens" }));
const BOT = G(40, -590);   // 抢跑机器人（本段局部位置：搜索者与构建者入口之间，L7 长出）
put("bot", BOT, E8.liqBot(BOT, { id: "bot", scr: "复制" }), 0, { grow: true });
// A 区：池子、最小输出量筒、你
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm" }));
const mt = E5.thresholdMeter(L.METER, { id: "mt", max: 5, th: 3, level: 5, thText: "最少 19000", scale: L.METER.scale });
mt.svg = mt.svg.replace(/<text([^>]*)>最少 19000<\/text>/, '<text id="mt-tt"$1>最少 19000</text><text id="mt-tt2" opacity="0"$1>最少 ↓</text>');
put("mt", L.METER, mt);
put("you", L.YOU, O.person(L.YOU, { id: "you", role: "signer" }));
// A′ 拍卖比喻
put("stand", L.AUCTION.stand, E7.auctionStand(L.AUCTION.stand, { id: "stand", name: "—", amount: "起拍" }));
put("you2", L.AUCTION.you, O.person(L.AUCTION.you, { id: "you2", role: "signer" }));
put("oth", L.AUCTION.other, O.person(L.AUCTION.other, { id: "oth", role: "engineer" }));

// 信封：传送带面 z 78，BP(d) = 入口往 +u 走 d 处的带面点（d 0..400，400 = 出口区块箱）
const BZ = 78, BU = (d) => ({ u: L.SORTER.u - 230 + d, v: L.SORTER.v });
const BP = (d) => { const o = BU(d); return Wp(o.u, o.v, BZ).map((x) => Math.round(x * 10) / 10); };
const lift = (p, h) => [p[0], p[1] - h];
const badge = (id, top, text, fill, show) =>
  `<g id="${id}-bdg" opacity="${show ? 1 : 0}"><circle cx="${f(top[0])}" cy="${f(top[1] - 20)}" r="17" fill="${fill}" stroke="#fff" stroke-width="3"/>` +
  `<text x="${f(top[0])}" y="${f(top[1] - 13.5)}" font-family="Noto Sans SC, sans-serif" font-size="19" font-weight="900" fill="#fff" text-anchor="middle">${text}</text></g>`;
/** 信封（带可选徽记），外包一层隐藏 <g id="h-ID">，fadeIn 出现、walk 移动 */
function env(id, o, z, red, bdg, bdgShow = true, dy = 300) {
  const r = E1.letter(o, { id, z, state: red ? "attacker" : "normal" });
  const svg = bdg ? r.svg.replace(/<\/g>\s*$/, badge(id, r.anchors.top, bdg, red ? "#e0453a" : "#1d93ba", bdgShow) + "</g>") : r.svg;
  A[id] = r.anchors; add(o, S.hid("h-" + id, svg), dy);
}
// L1 三封普通信 + 一封插入的红信
env("ea", BU(40), BZ, false); env("eb", BU(160), BZ, false); env("ec", BU(280), BZ, false); env("er1", BU(40), BZ, true);
// L5–L11 你的信 + 三封红信
env("ly", BU(200), BZ, false, "你"); env("er2", BU(300), BZ, true); env("er3", BU(300), BZ, true); env("er4", BU(100), BZ, true);
// L13–L18 三明治：内存池里的你，带上的 买 · 你 · 卖
const MPS = A.mp.slots[13];
env("my", G(MPS[0], MPS[1]), 10, false, "你", true, 60);
env("s1", BU(300), BZ, true, "买"); env("sy", BU(220), BZ, false, "你"); env("s2", BU(140), BZ, true, "卖");
/** 捆绑包：三封小信 + 绳子；根 <g> 带 data-px/py，可 walk */
function bundle(id, P, reds, bdgs) {
  const o = G(P[0], P[1]), parts = [], tops = [];
  [-56, 0, 56].forEach((du, i) => {
    const r = E1.letter({ u: o.u + du, v: o.v }, { id: `${id}-l${i}`, z: 40, w: 46, h: 32, state: reds[i] ? "attacker" : "normal" });
    tops.push(r.anchors); parts.push(bdgs ? r.svg.replace(/<\/g>\s*$/, badge(`${id}-l${i}`, r.anchors.top, bdgs[i], reds[i] ? "#e0453a" : "#1d93ba", true) + "</g>") : r.svg);
  });
  const c0 = tops[0].center, c2 = tops[2].center, mid = tops[1].center;
  const rope = `<path d="M${f(c0[0] - 30)} ${f(c0[1] + 9)}L${f(c2[0] + 30)} ${f(c2[1] + 9)}" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="${f(mid[0])}" cy="${f(mid[1] + 1)}" r="7" fill="#8a5a2b" stroke="#fff" stroke-width="2"/>`;
  const [px, py] = Wp(o.u, o.v, 40);
  A[id] = { top: tops[1].top, center: mid };
  add(o, S.hid("h-" + id, `<g id="${id}" data-px="${f(px)}" data-py="${f(py)}">${parts.join("")}${rope}</g>`), 0);
}
bundle("bun1", [80, -540], [true, false, true]);
bundle("bun2", [80, -540], [true, false, true], ["买", "你", "卖"]);
const HOP = [A.amm.hopR[0], A.amm.hopR[1] - 18];   // 信封落进池子的进料斗上方

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// L1 排序 / 插入 / 排除
lb("lb-ord", lift(BP(360), 70), "安排顺序", "lab-cs lab-sm");
lb("lb-ins", lift(BP(40), 70), "插入", "lab-rs lab-sm");
const TOSS = [BP(160)[0] + 40, BP(160)[1] + 120];
lb("lb-exc", [TOSS[0] + 40, TOSS[1] + 6], "排除", "lab-gs lab-sm", "t");
lb("lb-bun", up(A.bun1.top, 34), "捆绑包", "lab-rs lab-sm");
lb("lb-so", up(A.so.top, 8), "构建者", "lab-cs");
lb("lb-pr", up(A.pr.top, 8), "提议者", "lab-cs");
lb("lb-bid", up(A.bdoc.top, 8), "出价", "lab-rs lab-sm");
lb("lb-buy", up(A.bdoc.top, 8), "排序权 · 可购买", "lab-r");
// L7 / L9 抢跑小费、滑点签
lb("lb-tip", lift(BP(300), 82), "小费 ↑", "lab-rs lab-sm");
lb("lb-slip", lift(BP(200), 92), "滑点 5%", "lab-rs lab-sm");
// L13–L19 三明治步骤
lb("lb-st1", [MPS[0] - 50, MPS[1] - 40], "① 进内存池", "lab-cs lab-sm", "r");
lb("lb-st2", up(A.bun2.top, 34), "② 捆成一包", "lab-rs lab-sm");
lb("lb-st3", lift(BP(400), 120), "③ 按序打包", "lab-cs lab-sm");
lb("lb-up", up(A.amm.top, 10), "价格 ↑", "lab-r lab-sm");
lb("lb-just", [A.mt.th[0] + 120, A.mt.th[1]], "刚好压线", "lab-cs lab-sm", "l");
const DOT0 = [-250, -770];
for (let i = 0; i < 12; i++) pin(`pd${i}`, [DOT0[0] + (i % 6) * 30, DOT0[1] + Math.floor(i / 6) * 30], `<div class="pdot hide" id="pd${i}"></div>`);
lb("lb-prof", [DOT0[0] + 75, DOT0[1] - 22], "利润", "lab-rs lab-sm");
// L20–L22 拍卖
lb("lb-say", up(A.you2.top, 10), "最高出价 100", "lab-ink");
pin("pa-ana", [A.stand.top[0], A.stand.top[1] - 40], `<span class="sb-gtag hide" id="pa-ana" style="margin:0">比喻</span>`);
lb("lb-re", up(A.oth.top, 10), "90 买下 → 100 卖你", "lab-rs");
lb("lb-see", [A.stand.top[0], A.stand.top[1] - 40], "拍卖会 · 看得见插队", "lab-ink");
pin("px-see", [A.stand.top[0] + 190, A.stand.top[1] - 70], BADGE("bx-see", 56, "hide"));
// L23 回执
lb("lb-rcpt", up(A.you.top, 10), "回执 · 成交价 ↓", "lab-rs");

// ---------------------------------------------------------------- 屏幕层卡片
const FX = [560, 960, 1360], FN = ["抢跑", "三明治", "尾随"];
const blkEnv = (t, red) => `<span class="bk-e${red ? " r" : ""}">${t}</span>`;
const html = kw("kw-mev", `<b>MEV</b> · 最大可提取价值`, { x: 600, y: 130, size: 56 }) +
  FN.map((n, i) => ck(`fm${i}`, n, { x: FX[i], y: 130, w: 340, kind: "n", icon: i + 1 }) + ck(`fr${i}`, n, { x: FX[i], y: 130, w: 340, kind: "r", icon: i + 1 })).join("") +
  `<div id="fm-note" class="hide">通常无直接受害者</div>` +
  kw("kw-wide", `滑点越宽 → 被夹<b>越狠</b>`, { x: 1180, y: 560, size: 40, accent: "#e0453a" }) +
  `<div id="blk" class="hide"><div class="bk-h">同一个区块</div><div class="bk-row">${blkEnv("买", true)}${blkEnv("你")}${blkEnv("卖", true)}</div></div>`;
const css = `
    .pdot { width: 18px; height: 18px; border-radius: 50%; background: #e0453a; box-shadow: 0 0 0 2px #fff; }
    #fm-note { position: absolute; left: ${FX[2] + 20}px; top: 218px; font-size: 28px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 14px 4px; }
    #blk { position: absolute; left: 610px; top: 120px; width: 700px; background: #ffffff; border: 4px solid #1d93ba; border-radius: 18px; padding: 14px 28px 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    #blk .bk-h { font-size: 34px; font-weight: 900; color: #1d93ba; margin-bottom: 12px; }
    #blk .bk-row { display: flex; gap: 28px; justify-content: center; }
    #blk .bk-e { width: 150px; height: 88px; border: 4px solid #6b665c; border-radius: 10px; background: #fff; font-size: 40px; font-weight: 900; color: #1c1c1c;
      display: flex; align-items: center; justify-content: center; }
    #blk .bk-e.r { border-color: #e0453a; background: #fde6e3; color: #e0453a; }`;
// 红虚线：L9 滑点签 → 搜索者（镜头 B 静止）
S.curve("cv-slip", S.scr("B", lift(BP(200), 120)), S.scr("B", A.se.head), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  arr: w("安排", 1), ins: w("插入", 1), exc: w("排除", 1), bun: w("捆成", 2),
  give: w("交给", 3), sell: w("卖给", 3), buy: w("排序权", 4), three: w("三种", 5),
  front: w("前面", 6), bot: w("机器人", 7), copy: w("复制", 7), tip: w("小费", 7), first: w("先成交", 7),
  sw1: w("先买", 8), sw3: w("最后卖", 8), slip: w("滑点", 9), back: w("后面", 10),
  mp: w("公开内存池", 13), bun2: w("捆成", 14), up: w("推高", 16), just: w("刚好", 17),
  sell2: w("卖回去", 18), prof: w("利润", 18), wide: w("滑点", 19), hard: w("越狠", 19),
  max: w("最高出价", 20), grab: w("抢先", 21), resell: w("加价", 21), see: w("插了队", 22),
  blk: w("同一个区块", 23), px: w("成交价", 23),
};
const Bp = (d, h = 0) => JSON.stringify(lift(BP(d), h));
const drop = (id, d, t) => `X1.walk(tl, "${id}", ${f(t - 0.06)}, 0.04, [${Bp(d, 90)}]); fadeIn("#h-${id}", ${f(t)}, 0.2); X1.walk(tl, "${id}", ${f(t)}, 0.5, [${Bp(d)}], "power2.in");`;
const intoPool = (id, d, t) => `X1.walk(tl, "${id}", ${f(t)}, 0.9, [${Bp(d, 60)}, ${JSON.stringify(lift(HOP, 80))}, ${JSON.stringify(HOP)}]); out("#h-${id}", ${f(t + 0.85)}, 0.2); X8.poolSwap(tl, "amm", ${f(t + 0.9)}, "R");`;
const LV = A.mt.levels, THD = f(LV[2][1] - LV[3][1]);
const t = (x) => f(x);

S.build({
  cam0: "B", sub: "MEV 与三种形态",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-2200, -1800, 4200, 2650],   // 覆盖 B / build / poolSorter / auction / A
  shown: [], css, html,
  terms: [
    { id: "t0", t: "区块构建者", d: "把交易排进区块、再卖给提议者的人", at: w("区块构建者", 3) },
    { id: "t1", t: "提议者", d: "负责把区块提交上链的验证者", at: w("提议者", 4) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先说一个词：MEV，最大可提取价值。
      tl.set("#ch-b2, #ch-l1", { opacity: 0 }, 0);
      pop("#kw-mev", ${t(LS[0] + 0.3)});
      // ===== L1 它指的是，区块生产者或者搜索者，通过安排交易顺序、插入或排除交易，拿到的额外收益。
      out("#kw-mev", ${t(LS[1] - 0.2)}); cam(${t(LS[1])}, "build", 1.2);
      ["ea", "eb", "ec"].forEach((id, i) => fadeIn("#h-" + id, ${t(LS[1] + 1.0)} + i * 0.15, 0.25));
      X1.reach(tl, "so", ${t(TM.arr)}, -170, 124, 0.5);
      X1.walk(tl, "ea", ${t(TM.arr + 0.5)}, 0.9, [${Bp(40, 50)}, ${Bp(360, 50)}, ${Bp(360)}]); X1.reach(tl, "so", ${t(TM.arr + 0.5)}, 150, 124, 0.9);
      X1.reach(tl, "so", ${t(TM.arr + 1.5)}, 60, 70, 0.5); pop("#lb-ord", ${t(TM.arr + 1.3)}, 0.25);
      ${drop("er1", 40, TM.ins)} pop("#lb-ins", ${t(TM.ins + 0.5)}, 0.25);
      X1.walk(tl, "eb", ${t(TM.exc)}, 0.7, [${Bp(160, 50)}, ${JSON.stringify(TOSS)}]); tl.to("#h-eb", { opacity: 0.35, duration: 0.3 }, ${t(TM.exc + 0.7)}); pop("#lb-exc", ${t(TM.exc + 0.6)}, 0.25);
      // ===== L2 搜索者，是专门寻找这类机会，把交易捆成一组提交的人或程序。
      out("#lb-ord, #lb-ins, #lb-exc, #h-ea, #h-eb, #h-ec, #h-er1", ${t(LS[2] - 0.2)});
      fadeIn("#h-bun1", ${t(TM.bun)}, 0.3); pop("#lb-bun", ${t(TM.bun + 0.4)}, 0.25);
      // ===== L3 搜索者把捆绑包交给区块构建者，构建者再把整个区块，卖给提议者。
      out("#lb-bun", ${t(TM.give - 0.1)}); pop("#lb-so", ${t(LS[3] + 0.3)}, 0.25);
      X1.walk(tl, "bun1", ${t(TM.give)}, 0.8, [${Bp(20, 30)}, ${Bp(20)}]); X1.walk(tl, "bun1", ${t(TM.give + 0.9)}, 1.2, [${Bp(385)}], "none");
      out("#h-bun1", ${t(TM.give + 2.0)}); fadeIn("#so-lid", ${t(TM.give + 2.1)}, 0.3);
      fadeIn("#ch-b2, #ch-l1", ${t(TM.sell)}, 0.35); pop("#lb-pr", ${t(TM.sell)}, 0.25);
      grow("bdoc", ${t(TM.sell + 0.5)}); pop("#lb-bid", ${t(TM.sell + 1.0)}, 0.25);
      // ===== L4 这叫提议者与构建者分离。结果是，排序权可以被购买。
      out("#lb-bid", ${t(TM.buy - 0.2)}); pop("#lb-buy", ${t(TM.buy)}, 0.3); bump("#lb-buy", ${t(TM.buy + 0.6)}, 1.12, 1);
      // ===== L5 MEV 有三种形态。
      out("#lb-so, #lb-pr, #lb-buy", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "B", 1.2);
      [0, 1, 2].forEach((i) => pop("#fm" + i, ${t(TM.three)} + i * 0.2, 0.25));
      // ===== L6 第一种，抢跑：攻击者排在你前面。
      fadeIn("#h-ly", ${t(LS[6])}, 0.3); pop("#fr0", ${t(LS[6] + 0.2)}, 0.25); out("#fm0", ${t(LS[6] + 0.2)}, 0.1);
      ${drop("er2", 300, TM.front)}
      // ===== L7 比如一道谜题，第一个提交答案的人领奖。机器人复制你的答案，出更高的小费，先成交。
      grow("bot", ${t(TM.bot)}); X8.botLamp(tl, "bot", ${t(TM.copy)}, 1.2, 2, true);
      pop("#lb-tip", ${t(TM.tip)}, 0.25);
      X1.walk(tl, "er2", ${t(TM.first)}, 0.6, [${Bp(395)}]); out("#h-er2, #lb-tip", ${t(TM.first + 0.6)});
      // ===== L8 第二种，三明治：攻击者先买，你再买，攻击者最后卖。
      out("#fr0", ${t(LS[8])}); fadeIn("#fm0", ${t(LS[8] + 0.1)}, 0.2); pop("#fr1", ${t(LS[8] + 0.2)}, 0.25); out("#fm1", ${t(LS[8] + 0.2)}, 0.1);
      ${drop("er3", 300, TM.sw1)} ${drop("er4", 100, TM.sw3)}
      // ===== L9 他利用的，是你设定的滑点容忍度。
      pop("#lb-slip", ${t(TM.slip)}, 0.25); draw("cv-slip", ${t(TM.slip + 0.3)});
      // ===== L10 第三种，尾随：攻击者排在你后面，吃掉你的交易留下的套利或清算机会。
      out("#lb-slip, #cv-slip, #fr1", ${t(LS[10] - 0.2)}); fadeIn("#fm1", ${t(LS[10] - 0.1)}, 0.2); pop("#fr2", ${t(LS[10] + 0.2)}, 0.25); out("#fm2", ${t(LS[10] + 0.2)}, 0.1);
      out("#h-er3", ${t(TM.back - 0.3)}); X1.walk(tl, "er4", ${t(TM.back)}, 0.5, [${Bp(140)}]);
      // ===== L11 尾随通常没有直接的受害者。
      pop("#fm-note", ${t(LS[11] + 0.3)}, 0.25);
      // ===== L12 回到三明治，拆开看。
      out("#fm0, #fm1, #fr2, #fm-note, #h-ly, #h-er4, #bot", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "poolSorter", 1.6);
      // ===== L13 你的交易进入公开内存池。
      fadeIn("#h-my", ${t(TM.mp - 0.3)}, 0.25); flash("#h-my", ${t(TM.mp + 0.1)}, 3, 0.3); pop("#lb-st1", ${t(TM.mp)}, 0.25);
      // ===== L14 搜索者发现它，捆成一包：自己买入，你的交易，自己卖出。
      out("#h-my", ${t(TM.bun2 - 0.2)}); fadeIn("#h-bun2", ${t(TM.bun2)}, 0.3); pop("#lb-st2", ${t(TM.bun2 + 0.3)}, 0.25);
      // ===== L15 构建者按这个顺序打包。
      out("#h-bun2", ${t(LS[15])}); pop("#lb-st3", ${t(LS[15])}, 0.25);
      ${drop("s1", 300, LS[15] + 0.1)} ${drop("sy", 220, LS[15] + 0.5)} ${drop("s2", 140, LS[15] + 0.9)}
      // ===== L16 搜索者先买，把价格推高。
      out("#lb-st1, #lb-st2, #lb-st3", ${t(LS[16] - 0.2)});
      ${intoPool("s1", 300, LS[16] + 0.1)} X8.poolNeedle(tl, "amm", ${t(LS[16] + 1.0)}, 40, 0.6); X8.poolRed(tl, "amm", ${t(LS[16] + 1.0)}, true);
      pop("#lb-up", ${t(TM.up)}, 0.25);
      // ===== L17 你按更坏的价格成交，刚好满足最小输出。
      ${intoPool("sy", 220, LS[17] + 0.1)} X5.fill(tl, "mt", ${t(LS[17] + 1.0)}, 3, 0.9); pop("#lb-just", ${t(TM.just)}, 0.25);
      // ===== L18 搜索者再卖回去，赚走中间的利润。
      out("#lb-up, #lb-just", ${t(LS[18] - 0.2)});
      ${intoPool("s2", 140, LS[18] + 0.1)} X8.poolNeedle(tl, "amm", ${t(LS[18] + 1.0)}, -6, 0.6); X8.poolRed(tl, "amm", ${t(LS[18] + 1.0)}, false);
      [0, 1, 2, 3, 4, 5].forEach((i) => tl.fromTo("#pd" + i, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35, immediateRender: false }, ${t(LS[18] + 1.4)} + i * 0.08));
      pop("#lb-prof", ${t(TM.prof)}, 0.25);
      // ===== L19 他最多能赚多少，由你的最小输出决定。滑点设得越宽，被夹得越狠。
      tl.to("#mt-th", { y: ${THD}, duration: 0.6, ease: "power2.inOut" }, ${t(TM.wide)}); tl.set("#mt-tt", { opacity: 0 }, ${t(TM.wide + 0.3)}); tl.set("#mt-tt2", { opacity: 1 }, ${t(TM.wide + 0.3)});
      X5.fill(tl, "mt", ${t(TM.wide + 0.3)}, 2, 0.6);
      [6, 7, 8, 9, 10, 11].forEach((i) => tl.fromTo("#pd" + i, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35, immediateRender: false }, ${t(TM.wide + 0.8)} + (i - 6) * 0.08));
      pop("#kw-wide", ${t(TM.wide + 0.6)}, 0.3);
      // ===== L20 打个比方。你在拍卖会上举牌之前，大声说出了自己的最高出价。
      out("#lb-prof", ${t(LS[20] - 0.2)}); out("#kw-wide", ${t(LS[20] + 0.5)}); cam(${t(LS[20])}, "auction", 1.4);
      pop("#pa-ana", ${t(LS[20] + 1.5)}, 0.25); pop("#lb-say", ${t(TM.max)}, 0.3);
      // ===== L21 旁边的人抢先用低一点的价格买下，再加价转卖给你。
      // 镜头已离开 A 区：量筒和红点复原到三明治成交后的状态（段尾回到 A 区要用）
      tl.set("#mt-th", { y: 0 }, ${t(LS[21])}); tl.set("#mt-tt", { opacity: 1 }, ${t(LS[21])}); tl.set("#mt-tt2", { opacity: 0 }, ${t(LS[21])});
      X5.fill(tl, "mt", ${t(LS[21])}, 3, 0.05); tl.set(".pdot", { opacity: 0 }, ${t(LS[21])});
      X7.board(tl, "stand", ${t(TM.grab)}, { name: "90", amount: "旁边的人买下" }, 0.5); X7.gavel(tl, "stand", ${t(TM.grab + 0.2)});
      X7.board(tl, "stand", ${t(TM.resell)}, { name: "100", amount: "转卖给你", red: true }, 0.5); pop("#lb-re", ${t(TM.resell + 0.2)}, 0.25);
      // ===== L22 比喻在这里不成立：拍卖会上，你能看到谁插了队。
      out("#lb-say, #lb-re, #pa-ana", ${t(LS[22])}); pop("#lb-see", ${t(TM.see - 0.4)}, 0.25); pop("#bx-see", ${t(TM.see + 0.2)}, 0.25);
      // ===== L23 链上的三明治，和你的交易在同一个区块里。普通用户往往只看到，成交价比预期低。
      out("#lb-see, #bx-see", ${t(LS[23] - 0.2)}); cam(${t(LS[23])}, "A", 1.4);
      pop("#blk", ${t(TM.blk)}, 0.3); pop("#lb-rcpt", ${t(TM.px)}, 0.3);
`,
});
