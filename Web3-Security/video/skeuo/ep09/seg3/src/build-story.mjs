// ep09/seg3「③ 防夹与排序」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.A（BRIEF 第 2 节镜头路线：seg3 起于 A 区）。
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import { BADGE, ENV } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.C

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const P = (o, z = 0) => Wp(o.u, o.v, z);                                   // ground point → world-canvas px
const inv = (cam, [sx, sy]) => { const c = L.CAMS[cam]; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; }; // screen px under cam → world-canvas px
const topOf = (o, kind) => { const r = L.rect(o, kind); return [(r[0] + r[2]) / 2, r[1]]; }; // for scaled E01 objects whose anchors are not scaled
// A 交易广场
put("ptx", L.AMM, E1.pipe(L.AMM, { id: "ptx", pts: L.PIPE.tx }), -2);
put("ppv", L.AMM, E1.pipe(L.AMM, { id: "ppv", pts: L.PIPE.private, flow: true, flowColor: "#1f9d55" }), -1, { wrap: (s) => S.hid("ppv-h", s) });
put("pool", L.AMM, E8.ammPool(L.AMM, { id: "pool" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 5, th: 2, level: 4, thText: "最小输出" }));
put("you", L.YOU, O.person(L.YOU, { id: "you", role: "signer" }));
put("lt", L.LETTER, E1.letter(L.LETTER, { id: "lt", z: L.LETTER.z }), 2);
// B 内存池与构建场
put("mp", L.MEMPOOL, E1.mempool(L.MEMPOOL, { id: "mp", n: 5 }));
put("srch", L.SEARCHER, O.person(L.SEARCHER, { id: "srch", role: "attacker" }));
put("lens", L.LENS, O.magnifier(L.LENS, { id: "lens" }), 1);
put("sorter", L.SORTER, E1.sorter(L.SORTER, { id: "sorter", letters: 2 }));
put("chn", L.CHAIN, O.chain(L.CHAIN, { id: "chn", n: 3 }));
put("prop", L.PROPOSER, O.person(L.PROPOSER, { id: "prop", role: "engineer" }));
// D 协议设计角（commitBox / bot / 批量拍卖牌按讲到的时候长出）
put("vm", L.SWAPVM, E1.vending(L.SWAPVM, { id: "vm", scale: L.SWAPVM.scale }));
put("cb", L.COMMIT, X.commitBox(L.COMMIT, { id: "cb", scale: L.COMMIT.scale, name: "" }), 0, { grow: true });
put("bot", L.BOT, E8.liqBot(L.BOT, { id: "bot", scale: L.BOT.scale, scr: "复制" }), 0, { grow: true });
put("batch", L.BATCH, E1.signBoard(L.BATCH, { id: "batch", style: "wood", text: "批量拍卖", sub: "统一价格", size: 36 }), 0, { grow: true });
// C 三链排序台（L13 镜头到达时依次长出）
put("bsign", L.BNB.sign, E1.signBoard(L.BNB.sign, { id: "bsign", style: "plate", text: "BNB Chain", size: 34 }), 0, { grow: true });
put("bw", L.BNB.wheel, X.rotaWheel(L.BNB.wheel, { id: "bw", n: 6, speed: 3, at: 1, plate: "验证者" }), 0, { grow: true });
put("bclk", L.BNB.clock, O.clock(L.BNB.clock, { id: "bclk" }), 0, { grow: true });
put("bmp", L.BNB.mempool, E1.mempool(L.BNB.mempool, { id: "bmp", n: 3, red: [0, 2], scale: L.BNB.mempool.scale }), 0, { grow: true });
put("tsign", L.TRON.sign, E1.signBoard(L.TRON.sign, { id: "tsign", style: "plate", text: "TRON", size: 34 }), 0, { grow: true });
put("tw", L.TRON.wheel, X.rotaWheel(L.TRON.wheel, { id: "tw", n: 27, scale: L.TRON.wheel.scale, at: 3, plate: "27 席" }), 0, { grow: true });
put("tg", L.TRON.gauge, E3.gasGauge(L.TRON.gauge, { id: "tg", label: "优先费", value: 0.5 }), 0, { grow: true });
put("msign", L.MANTLE.sign, E1.signBoard(L.MANTLE.sign, { id: "msign", style: "plate", text: "Mantle", size: 34 }), 0, { grow: true });
put("msort", L.MANTLE.sorter, E1.sorter(L.MANTLE.sorter, { id: "msort", letters: 2, scale: L.MANTLE.sorter.scale }), 0, { grow: true });
put("op", L.MANTLE.operator, O.person(L.MANTLE.operator, { id: "op", role: "engineer" }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const MU = (A.meter.levels[0][1] - A.meter.levels[5][1]) / 5;   // 量筒一格的高度（世界画布 px）
lb("lb-you", up(A.you.top, 6), "你", "lab-ink lab-sm");
lb("lb-slip", up(A.meter.top, 6), "滑点设得合理", "lab-gs lab-sm");
lb("lb-ppv", up(A.ppv.mid, 30), "私有通道", "lab-gs");
lb("lb-blind", up(A.mp.top, 10), "打包前看不到", "lab-rs");
lb("lb-q", A.lens.lens, "?", "lab-r", "c");
lb("lb-fe", up(A.pool.top, 10), "默认滑点 · 按池子深度", "lab-cs");
const ruler = (id) => `<div class="ruler" id="${id}">${[0, 1, 2, 3, 4].map(() => "<i></i>").join("")}</div>`;
pin("dep-l", [A.pool.tankL[0] - 92, A.pool.tankL[1] - 40], ruler("rul-l"));
pin("dep-r", [A.pool.tankR[0] + 92, A.pool.tankR[1] - 40], ruler("rul-r"));
lb("lb-p1", [A.vm.panel[0] + 70, A.vm.panel[1] - 60], "minOut", "lab-gs lab-sm", "l");
lb("lb-p2", [A.vm.panel[0] + 70, A.vm.panel[1] + 10], "deadline", "lab-gs lab-sm", "l");
pin("x-meter", A.meter.center, BADGE("xm", 64));
["金库", "自动复投", "清算"].forEach((s, i) => lb(`lb-v${i}`, inv("AD", [860, 600 + i * 58]), s, "lab-rs lab-sm", "c"));
lb("lb-commit", up(A.cb.top, 10), "① 提交：答案的哈希", "lab-cs");
lb("lb-reveal", up(A.cb.top, 10), "② 揭示：公开答案", "lab-gs");
lb("lb-noname", up(A.cb.top, 10), "没绑定发送者 → 复制也能揭示", "lab-rs");
lb("lb-bound", up(A.cb.top, 10), "绑定发送者 → 复制被弹回", "lab-gs");
lb("lb-bot", up(A.bot.top, 8), "机器人", "lab-r lab-sm");
const envs = (ids, red) => ids.map((id, i) => `<span class="oe" id="${id}" style="left:${i * 70}px">${ENV(red.includes(i))}</span>`).join("");
pin("tray", inv("D", [1500, 770]), `<div class="tray" id="tray-in">${envs(["be0", "be1", "be2", "be3"], [])}<div class="tray-box" id="tray-box"></div><div class="tray-stamp" id="tray-st">统一价格</div></div>`);
lb("lb-clk", up(A.bclk.top, 6), "0.45 秒 · 2026 年 1 月", "lab-cs");
lb("lb-sand", up(topOf(L.BNB.mempool, "mempool"), 8), "三明治依然存在", "lab-rs");
lb("lb-27", up(A.tw.top, 10), "27 个超级代表轮流", "lab-cs");
pin("x-gauge", A.tg.dial, BADGE("xg", 64));
lb("lb-seat", [A.tw.seats[9][0] - 10, A.tw.seats[9][1] - 70], "出块者决定顺序", "lab-rs", "b");
pin("ord-t", up(A.tw.seats[9], 26), `<div class="ord" id="ordT">${envs(["oT0", "oT1", "oT2"], [2])}</div>`);
lb("lb-msort", up(topOf(L.MANTLE.sorter, "sorter"), 8), "单一排序器", "lab-cs");
pin("ord-m", up(topOf(L.MANTLE.sorter, "sorter"), 64), `<div class="ord" id="ordM">${envs(["oM0", "oM1", "oM2"], [2])}</div>`);
lb("lb-op", inv("C", [1650, 760]), "排序权 → 一个运营者", "lab-r", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 560, y: 110, w: 820 };
const card = codeCard("cs", { ...C, head: "交换函数", tag: "合约层", mono: true, rowHide: true, rows: [
  { html: "swap(amountIn, <b>minOut</b>, <b>deadline</b>)", chip: "两个参数", chipCls: "ok" },
  { html: "require(out >= minOut && now <= deadline)" },
  { html: "minOut = <b>现货价</b> × amountIn × 0.99", chip: "可被推高", chipCls: "x" },
  { html: "minOut = <b>0</b>", chip: "任何价格", chipCls: "x" },
] });
S.curve("cv0", [C.x + C.w + 4, codeRowY(C.y, 0)], S.scr("AD", A.vm.panel), { color: "#1f9d55" });
S.curve("cv2", [C.x - 4, codeRowY(C.y, 2)], S.scr("AD", A.pool.dial), { color: "#e0453a" });
S.curve("cv3", [C.x - 4, codeRowY(C.y, 3)], S.scr("AD", A.meter.center), { color: "#e0453a" });
const steps = ["用户", "前端", "合约", "协议设计"].map((s, i) => `<div class="stp" id="st${i}" style="left:${1400 + i * 70}px;top:${262 - i * 54}px">${s}</div>`).join("");
const html = card + steps
  + kw("kw-follow", `现货价被推高 → 保护线 <b>跟着失守</b>`, { x: 600, y: 440, size: 40, accent: "#e0453a" })
  + kw("kw-zero", `minOut = 0 → <b>接受任何价格</b>`, { x: 600, y: 440, size: 44, accent: "#e0453a" })
  + kw("kw-mev", `没有公开内存池 <b>≠</b> 没有 MEV`, { x: 560, y: 130, size: 50, accent: "#e0453a" })
  + evt("ev-bnb", `${gtag("公开资料")} BNB Chain · 2026 年 1 月出块间隔 0.45 秒`)
  + evt("ev-tron", `${gtag("TRON 官方文档")} 没有优先费`)
  + evt("ev-l2b", `${gtag("L2BEAT")} 运营者可以抢跑用户交易`, { color: "#e0453a" });
const css = `
    .stp { position: absolute; font: 900 28px "Noto Sans SC", sans-serif; padding: 6px 20px 8px; border-radius: 12px; background: #fffdf8; color: #6b665c;
      border: 3px solid #2aa3c9; box-shadow: 0 8px 18px rgba(70,60,40,0.12); opacity: 0; white-space: nowrap; }
    .ruler { width: 18px; height: 120px; border-left: 4px solid #1d93ba; display: flex; flex-direction: column; justify-content: space-between; opacity: 0; }
    .ruler i { display: block; width: 18px; height: 3px; background: #1d93ba; }
    #xm, #xg { opacity: 0; }
    .tray { position: relative; width: 300px; height: 110px; }
    .tray .oe { top: 0; opacity: 0; margin-left: 16px; }
    .oe { position: absolute; }
    .tray-box { position: absolute; left: 0; bottom: 0; width: 300px; height: 44px; border: 4px solid #6b665c; border-top: none; border-radius: 0 0 14px 14px; background: rgba(255,253,248,0.7); opacity: 0; }
    .tray-stamp { position: absolute; left: 70px; top: 30px; padding: 4px 16px; border: 4px solid #1f9d55; border-radius: 10px; color: #1f9d55; font: 900 30px "Noto Sans SC", sans-serif;
      background: #fffdf8; transform: rotate(-8deg); opacity: 0; white-space: nowrap; }
    .ord { position: relative; width: 210px; height: 44px; opacity: 0; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  priv: w("私有交易通道", 1), slip: w("滑点", 1),
  blind: w("看不到", 2),
  depth: w("深度", 3),
  two: w("两个参数", 4),
  spot: w("现货价", 5),
  push: w("推高", 6), none: w("等于没有保护", 6),
  zero: w("写成", 7),
  any: w("任何价格", 8), vault: w("金库", 8),
  hash: w("哈希", 10), reveal: w("公开答案", 10),
  bind: w("绑定发送者", 11), nope: w("不然", 11), copy: w("机器人复制", 11),
  batch: w("批量拍卖", 12), uni: w("统一价格", 12),
  bnb: w("0.45", 14),
  sand: w("三明治依然存在", 15),
  prio: w("优先费", 17), doc: w("官方文档", 17),
  order: w("决定顺序", 18),
  op: w("抢跑", 20),
  conc: w("一个运营者", 22),
};
const t = (x) => f(x);
// letter walk: ground point rides along the private pipe (letter z 70 + lift → its bottom sits on the pipe top)
const walkPts = L.PIPE.private.map(([du, dv]) => P({ u: L.AMM.u + du, v: L.AMM.v + dv }, 0));
// world canvas must cover every framing used here
const VIEW = ["A", "poolSorter", "mempool", "AD", "D", "C", "bnb", "tron", "mantle"].map((k) => [...inv(k, [0, 0]), ...inv(k, [1920, 1080])]);
const BX0 = Math.min(...VIEW.map((r) => r[0])) - 200, BY0 = Math.min(...VIEW.map((r) => r[1])) - 200;
const BX1 = Math.max(...VIEW.map((r) => r[2])) + 200, BY1 = Math.max(...VIEW.map((r) => r[3])) + 200;

S.build({
  cam0: "A", sub: "四层防夹 · 各链排序",
  grid: { u0: -3000, u1: 4200, v0: -2200, v1: 2600 }, box: [Math.round(BX0), Math.round(BY0), Math.round(BX1 - BX0), Math.round(BY1 - BY0)],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "私有交易通道", d: "不经公开内存池、直接交给构建者", at: w("私有交易通道", 1) },
    { id: "t1", t: "超级代表", d: "TRON 上由投票选出的出块节点", at: w("超级代表", 16) },
    { id: "t2", t: "优先费", d: "为了排得更靠前额外付给出块者的费", at: w("优先费", 17) },
    { id: "t3", t: "排序器", d: "L2 上决定交易顺序的节点", at: w("排序器", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 怎么防？分四层。
      const lit = (i, t) => { tl.to("#st" + i, { backgroundColor: "#1d93ba", color: "#ffffff", duration: 0.25 }, t); if (i > 0) tl.to("#st" + (i - 1), { backgroundColor: "#fffdf8", color: "#6b665c", duration: 0.25 }, t); };
      pop("#lb-you", 1.7); [0, 1, 2, 3].forEach((i) => pop("#st" + i, 1.9 + i * 0.2, 0.3));
      // ===== L1 用户这一层，把滑点设得合理。大额交易，走私有交易通道，比如 Flashbots Protect 一类的服务。
      lit(0, ${t(LS[1] + 0.1)}); cam(${t(LS[1] + 0.2)}, "poolSorter", 1.4);
      tl.to("#meter-th", { y: ${t(-1.5 * MU)}, duration: 0.8, ease: "power2.out" }, ${t(TM.slip)}); pop("#lb-slip", ${t(TM.slip + 0.2)});
      fadeIn("#ppv-h", ${t(TM.priv)}, 0.6); pop("#lb-ppv", ${t(TM.priv + 0.4)}); X1.dash(tl, "ppv-flow", ${t(TM.priv + 0.4)}, 4.2, -260);
      // ===== L2 交易不进公开内存池，搜索者在打包之前，就看不到它。
      out("#lb-slip", ${t(LS[2] - 0.2)}); X1.walk(tl, "lt", ${t(LS[2] + 0.1)}, 2.2, ${JSON.stringify(walkPts)}, "power1.inOut"); out("#lt", ${t(LS[2] + 2.3)}, 0.3);
      out("#lb-ppv", ${t(LS[2] + 2.3)}); cam(${t(LS[2] + 2.4)}, "mempool", 1.0); pop("#lb-blind", ${t(LS[2] + 3.5)}); pop("#lb-q", ${t(TM.blind)}); flash("#lb-q", ${t(TM.blind + 0.4)}, 2, 0.4);
      // ===== L3 前端这一层，默认滑点要保守，按池子的深度来计算。
      out("#lb-blind, #lb-q", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "A", 1.2); lit(1, ${t(LS[3] + 0.1)});
      pop("#lb-fe", ${t(LS[3] + 1.3)}); fadeIn("#rul-l, #rul-r", ${t(TM.depth - 0.5)}, 0.4);
      // ===== L4 合约这一层，所有交换函数，都要接受最小输出和截止时间两个参数。
      out("#lb-fe, #rul-l, #rul-r", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "AD", 1.3); lit(2, ${t(LS[4] + 0.1)});
      pop("#cs", ${t(LS[4] + 1.3)}); pop("#cs-r0", ${t(LS[4] + 1.5)}); pop("#cs-r1", ${t(LS[4] + 1.7)});
      hot("#cs-r0", ${t(TM.two)}, "#e3f4ea"); pop("#cs-c0", ${t(TM.two + 0.2)}); draw("cv0", ${t(TM.two + 0.2)}); pop("#lb-p1", ${t(TM.two + 0.6)}); pop("#lb-p2", ${t(TM.two + 0.8)});
      // ===== L5 常见的错误，是在合约内部，用现货价算出最小输出。
      pop("#cs-r2", ${t(LS[5] + 0.3)}); hot("#cs-r2", ${t(TM.spot)}); draw("cv2", ${t(TM.spot + 0.1)}); pop("#cs-c2", ${t(TM.spot + 0.3)});
      // ===== L6 那个现货价，在同一个区块里就能被推高。按它算出的保护，等于没有保护。
      X8.poolPump(tl, "pool", ${t(TM.push - 0.8)}, { side: "R", n: 2, gap: 0.4, deg: 55, read: "2,600" });
      tl.to("#meter-th", { y: ${t(MU)}, duration: 1.2, ease: "power2.inOut" }, ${t(TM.push + 0.2)}); pop("#kw-follow", ${t(TM.push + 0.6)});
      // ===== L7 更糟的写法，是把最小输出直接写成 0。
      out("#kw-follow", ${t(LS[7] - 0.2)}); pop("#cs-r3", ${t(LS[7] + 0.3)});
      hot("#cs-r3", ${t(TM.zero)}); draw("cv3", ${t(TM.zero + 0.1)}); pop("#cs-c3", ${t(TM.zero + 0.3)});
      tl.to("#meter-th", { y: ${t(2 * MU)}, duration: 0.6, ease: "power3.in" }, ${t(TM.zero + 0.3)}); pop("#xm", ${t(TM.zero + 1.0)});
      // ===== L8 这等于告诉所有人：我接受任何价格。金库、自动复投合约、清算合约，常犯这个错误。
      pop("#kw-zero", ${t(TM.any)}); [0, 1, 2].forEach((i) => pop("#lb-v" + i, ${t(TM.vault)} + i * 0.5, 0.25));
      // ===== L9 协议设计这一层，有两种做法。
      out("#cs, #cv0, #cv2, #cv3, #kw-zero, #lb-v0, #lb-v1, #lb-v2, #lb-p1, #lb-p2, #xm", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "D", 1.3); lit(3, ${t(LS[9] + 0.1)});
      // ===== L10 一是提交揭示：先提交答案的哈希，下一阶段再公开答案。
      grow("cb", ${t(LS[10] + 0.1)}); pop("#lb-commit", ${t(LS[10] + 0.8)}); X9.drop(tl, "cb", ${t(TM.hash - 0.2)});
      out("#lb-commit", ${t(TM.reveal - 0.6)}); pop("#lb-reveal", ${t(TM.reveal - 0.4)}); const rEnd = X9.reveal(tl, "cb", ${t(TM.reveal - 0.5)}, "答案");
      // ===== L11 这个承诺，必须绑定发送者的地址。不然，机器人复制你的承诺，也能完成揭示。
      out("#lb-reveal", ${t(LS[11] - 0.1)}); X9.flap(tl, "cb", Math.max(rEnd + 0.1, ${t(LS[11])}), 0, 0.5); X9.lock(tl, "cb", Math.max(rEnd + 0.6, ${t(LS[11] + 0.5)}), false, 0.3);
      grow("bot", ${t(LS[11] + 0.2)}); pop("#lb-bot", ${t(LS[11] + 0.6)}); X8.botLamp(tl, "bot", ${t(LS[11] + 0.6)});
      X9.nameTag(tl, "cb", ${t(TM.bind)}, "发送者"); pop("#lb-bound", ${t(TM.bind + 0.2)}); X9.copyIn(tl, "cb", ${t(TM.bind + 0.6)}, false);
      out("#lb-bound", ${t(TM.nope - 0.1)}); X9.nameTag(tl, "cb", ${t(TM.nope)}, ""); X9.nameBad(tl, "cb", ${t(TM.nope + 0.1)}, true);
      pop("#lb-noname", ${t(TM.nope + 0.2)}); X9.copyIn(tl, "cb", ${t(TM.copy)}, true);
      // ===== L12 二是批量拍卖：同一批订单，按统一价格清算。
      out("#lb-noname", ${t(LS[12] - 0.2)}); grow("batch", ${t(LS[12] + 0.1)}); fadeIn("#tray-box", ${t(LS[12] + 0.4)}, 0.3);
      [0, 1, 2, 3].forEach((i) => tl.fromTo("#be" + i, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "bounce.out", immediateRender: false }, ${t(TM.batch + 0.3)} + i * 0.3));
      pop("#tray-st", ${t(TM.uni)}, 0.35);
      // ===== L13 顺序由谁决定，每条链也不一样。
      out("#tray-in, #lb-bot, #st0, #st1, #st2, #st3", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "C", 2.0);
      ["bsign", "bw", "bclk", "bmp", "tsign", "tw", "tg", "msign", "msort", "op"].forEach((id, i) => grow(id, ${t(LS[13] + 0.5)} + i * 0.13));
      // ===== L14 BNB Chain，验证者轮流出块。2026 年 1 月，出块间隔缩短到 0.45 秒。
      cam(${t(LS[14])}, "bnb", 1.2); X9.spin(tl, "bw", ${t(LS[14] + 1.4)}, 2.4, 4, 1); X9.spin(tl, "bw", ${t(TM.bnb - 0.4)}, 1.4, 3, 1);
      pop("#lb-clk", ${t(TM.bnb)}); pop("#ev-bnb", ${t(TM.bnb + 0.3)});
      // ===== L15 抢跑的窗口更短，但它有公开内存池和构建者市场，三明治依然存在。
      X9.spin(tl, "bw", ${t(LS[15] + 0.4)}, 1.2, 2, 1); pop("#lb-sand", ${t(LS[15] + 3.4)}); flash("#lb-sand", ${t(TM.sand - 0.3)}, 2, 0.5); out("#ev-bnb", ${t(LS[16] - 0.3)});
      // ===== L16 TRON，27 个超级代表轮流出块。
      out("#lb-clk, #lb-sand", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "tron", 1.2); pop("#lb-27", ${t(LS[16] + 1.2)}); X9.tick(tl, "tw", ${t(LS[16] + 1.4)}, 6, 0.4);
      // ===== L17 按 TRON 官方文档，它没有优先费，不能靠出更高的价格插队。
      pop("#ev-tron", ${t(TM.doc)}); pop("#xg", ${t(TM.prio)});
      // ===== L18 但出块的人，仍然可以决定顺序。
      X9.seat(tl, "tw", ${t(LS[18] + 0.3)}, 9, "red"); out("#lb-27", ${t(LS[18] + 0.2)}); fadeIn("#ordT", ${t(LS[18] + 0.5)}, 0.3); pop("#lb-seat", ${t(LS[18] + 0.7)});
      tl.to("#oT2", { x: -140, duration: 0.6, ease: "power2.inOut" }, ${t(TM.order)}); tl.to("#oT0, #oT1", { x: 70, duration: 0.6, ease: "power2.inOut" }, ${t(TM.order)});
      // ===== L19 Mantle，只有一个中心化排序器。
      out("#ev-tron, #xg, #lb-seat, #ordT", ${t(LS[19] - 0.2)}); cam(${t(LS[19])}, "mantle", 1.2); pop("#lb-msort", ${t(LS[19] + 1.3)});
      // ===== L20 L2BEAT 列出的风险是：运营者可以抢跑用户交易，提取 MEV。
      pop("#ev-l2b", ${t(LS[20] + 0.3)}); tl.set("#oM2", { opacity: 0, x: 90 }, 0); fadeIn("#ordM", ${t(TM.op - 1.2)}, 0.3);
      tl.to("#oM2", { opacity: 1, duration: 0.2 }, ${t(TM.op)}); tl.to("#oM2", { x: -140, duration: 0.7, ease: "power2.inOut" }, ${t(TM.op + 0.2)}); tl.to("#oM0, #oM1", { x: 70, duration: 0.7, ease: "power2.inOut" }, ${t(TM.op + 0.2)});
      // ===== L21 没有公开内存池，不等于没有 MEV。
      out("#ev-l2b, #ordM, #lb-msort", ${t(LS[21] - 0.2)}); cam(${t(LS[21])}, "C", 1.4); pop("#kw-mev", ${t(LS[21] + 0.8)});
      // ===== L22 它只是把排序权，从市场集中到一个运营者手里。
      X9.seats(tl, "bw", ${t(LS[22] + 0.3)}, "dim"); X9.seats(tl, "tw", ${t(LS[22] + 0.5)}, "dim", [], 0.8);
      if ($("op-glow")) tl.to("#op-glow", { opacity: 1, duration: 0.4 }, ${t(LS[22] + 1.4)}); pop("#lb-op", ${t(LS[22] + 1.5)});
`,
});
