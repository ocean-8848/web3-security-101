// ep09/seg6「⑥ 今天能做什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.F（BRIEF 第 2 节镜头路线：seg6 起于 F 区）。
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E7, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (Xc, Yc, extra = {}) => { const q = G(Xc, Yc); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };

// ---------------------------------------------------------------- 本段局部位置（world-canvas px，layout.mjs 不改）
const CHQ6 = P(9230, 150, { scale: 2.0 });           // F 区左侧工作台：五格全绿的支票（L2–L4、L11）
const CLAIM6 = P(9480, -40, { scale: 0.55 });         // 同一工作台：领取合约（L3–L4 重放）
const HW6 = P(-530, 70, { scale: 0.6 });              // A 区"你"左侧：硬件钱包（L6）

// ---------------------------------------------------------------- 世界物件（全世界都摆上，L10–L12 全景要用）
// A′ 拍卖比喻
put("auc", L.AUCTION.stand, E7.auctionStand(L.AUCTION.stand, { id: "auc" }));
put("auc-you", L.AUCTION.you, O.person(L.AUCTION.you, { id: "auc-you", role: "signer" }));
put("auc-oth", L.AUCTION.other, O.person(L.AUCTION.other, { id: "auc-oth", role: "engineer" }));
// B 内存池与构建场
put("mp", L.MEMPOOL, E1.mempool(L.MEMPOOL, { id: "mp", n: 4, red: [0, 3] }));
put("srch", L.SEARCHER, O.person(L.SEARCHER, { id: "srch", role: "attacker" }));
put("lens", L.LENS, O.magnifier(L.LENS, { id: "lens" }));
put("sorter", L.SORTER, E1.sorter(L.SORTER, { id: "sorter", letters: 3, red: [0, 2] }));
put("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 3 }));
put("prop", L.PROPOSER, O.person(L.PROPOSER, { id: "prop", role: "engineer" }));
put("bdoc", L.BLOCKDOC, O.doc(L.BLOCKDOC, { id: "bdoc", title: "区块", scale: L.BLOCKDOC.scale }));
// A 交易广场
put("pool", L.AMM, E8.ammPool(L.AMM, { id: "pool" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 5, th: 4, level: 3, thText: "最少 19000", scale: L.METER.scale }));
put("you", L.YOU, O.person(L.YOU, { id: "you", role: "signer" }));
put("ptx", L.AMM, E1.pipe(L.AMM, { id: "ptx", pts: L.PIPE.tx }));
put("ppv", L.AMM, E1.pipe(L.AMM, { id: "ppv", pts: L.PIPE.private, flowColor: "#1f9d55" }), 0, { grow: true });
put("hw6", HW6, O.hwWallet(HW6, {
  id: "hw6", scale: HW6.scale,
  screen: `<rect width="70" height="40" fill="#0f2a33"/>` + [0, 1, 2, 3].map((i) => `<circle cx="9" cy="${7 + i * 9}" r="3" fill="#2bd46f"/><rect x="16" y="${5 + i * 9}" width="${40 - i * 4}" height="4" rx="2" fill="#9ad9ee"/>`).join(""),
  screen2: `<rect width="70" height="40" fill="#2a0f0f"/><text x="35" y="25" font-size="12" text-anchor="middle" fill="#ff8a80" font-family="monospace">0x9f…3a</text>`,
}), 0, { grow: true });
// 你的信封最后画（在池子前）
put("ltr", L.LETTER, E1.letter(L.LETTER, { id: "ltr", z: L.LETTER.z }));
// D 协议设计角
put("swapvm", L.SWAPVM, E1.vending(L.SWAPVM, { id: "swapvm", scale: L.SWAPVM.scale, sign: "交换合约" }));
put("commit", L.COMMIT, X.commitBox(L.COMMIT, { id: "commit", scale: L.COMMIT.scale }));
put("bot", L.BOT, E8.liqBot(L.BOT, { id: "bot", scale: L.BOT.scale, scr: "复制" }));
put("batch", L.BATCH, E1.signBoard(L.BATCH, { id: "batch", style: "wood", text: "批量拍卖", sub: "统一价格" }));
// C 三链排序台
put("bnb-s", L.BNB.sign, E1.signBoard(L.BNB.sign, { id: "bnb-s", style: "plate", text: "BNB Chain" }));
put("bnb-w", L.BNB.wheel, X.rotaWheel(L.BNB.wheel, { id: "bnb-w", n: 6, plate: "多座" }));
put("bnb-c", L.BNB.clock, O.clock(L.BNB.clock, { id: "bnb-c" }));
put("bnb-m", L.BNB.mempool, E1.mempool(L.BNB.mempool, { id: "bnb-m", n: 3, scale: L.BNB.mempool.scale }));
put("tron-s", L.TRON.sign, E1.signBoard(L.TRON.sign, { id: "tron-s", style: "plate", text: "TRON" }));
put("tron-w", L.TRON.wheel, X.rotaWheel(L.TRON.wheel, { id: "tron-w", n: 27, plate: "27 座", scale: L.TRON.wheel.scale }));
put("tron-g", L.TRON.gauge, E3.gasGauge(L.TRON.gauge, { id: "tron-g", label: "优先费" }));
put("man-s", L.MANTLE.sign, E1.signBoard(L.MANTLE.sign, { id: "man-s", style: "plate", text: "Mantle" }));
put("man-so", L.MANTLE.sorter, E1.sorter(L.MANTLE.sorter, { id: "man-so", letters: 2, scale: L.MANTLE.sorter.scale }));
put("man-op", L.MANTLE.operator, O.person(L.MANTLE.operator, { id: "man-op", role: "engineer" }));
// E 签名柜台
put("bank", L.BANK, E4.tellerCounter(L.BANK, { id: "bank", sign: "银行" }));
put("eth-s", L.CLAIM.ethSign, E1.signBoard(L.CLAIM.ethSign, { id: "eth-s", style: "plate", text: "以太坊", scale: 0.8 }));
put("bnb2-s", L.CLAIM.bnbSign, E1.signBoard(L.CLAIM.bnbSign, { id: "bnb2-s", style: "plate", text: "BNB Chain", scale: 0.8 }));
put("eth-v", L.CLAIM.eth, E1.vending(L.CLAIM.eth, { id: "eth-v", scale: 0.8, sign: "领取合约" }));
put("bnb-v", L.CLAIM.bnb, E1.vending(L.CLAIM.bnb, { id: "bnb-v", scale: 0.8, sign: "领取合约" }));
put("eth-r", L.CLAIM.ethRoll, E2.rollCounter(L.CLAIM.ethRoll, { id: "eth-r", digits: 3, scale: 0.5 }));
put("bnb-r", L.CLAIM.bnbRoll, E2.rollCounter(L.CLAIM.bnbRoll, { id: "bnb-r", digits: 3, scale: 0.5 }));
put("echq", L.CHEQUE, X.cheque(L.CHEQUE, { id: "echq", scale: L.CHEQUE.scale, amount: "领取", copies: 2, state: "attacker" }));
put("seal", L.SEAL, O.seal(L.SEAL, { id: "seal", markText: "域", scale: L.SEAL.scale }));
put("funnel", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "funnel", text: "类型哈希", scale: L.FUNNEL.scale }));
put("zero", L.ZERO, E7.emptyLot(L.ZERO, { id: "zero", zero: true, scale: L.ZERO.scale }));
put("w1271", L.WALLET1271, E5.accountSafe(L.WALLET1271, { id: "w1271", scale: L.WALLET1271.scale }));
put("pmp", L.PERMIT.pool, E1.mempool(L.PERMIT.pool, { id: "pmp", n: 2, scale: L.PERMIT.pool.scale }));
// F 多签金库 + 三个角色 + 左侧工作台
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", scale: L.VAULT.scale }));
L.DESKS.forEach((d, i) => put(`desk${i}`, d, O.desk(d, { id: `desk${i}` })));
L.SIGNERS.forEach((d, i) => put(`sgn${i}`, d, O.person(d, { id: `sgn${i}`, role: "signer" })));
L.SIGNER_HW.forEach((d, i) => put(`shw${i}`, d, O.hwWallet(d, { id: `shw${i}`, scale: d.scale })));
put("fmeter", L.FMETER, E5.thresholdMeter(L.FMETER, { id: "fmeter", max: 3, th: 2, level: 2, thText: "2 / 3", scale: L.FMETER.scale }));
put("shield", L.SHIELD, O.shield(L.SHIELD, { id: "shield", scale: L.SHIELD.scale }));
put("knife", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "knife", scale: L.KNIFE.scale }));
put("claim6", CLAIM6, E1.vending(CLAIM6, { id: "claim6", scale: CLAIM6.scale, sign: "领取合约" }), 0, { grow: true });
put("chq", CHQ6, X.cheque(CHQ6, { id: "chq", scale: CHQ6.scale, amount: "领取", fields: ["blank", "blank", "blank", "blank", "blank"] }), 0, { grow: true });
put("eng", L.ROLES.eng, O.person(L.ROLES.eng, { id: "eng", role: "engineer" }), 0, { grow: true });
put("aud", L.ROLES.aud, O.person(L.ROLES.aud, { id: "aud", role: "signer" }), 0, { grow: true });
put("flens", L.FLENS, O.magnifier(L.FLENS, { id: "flens", scale: L.FLENS.scale }), 0, { grow: true });
put("user", L.ROLES.user, O.person(L.ROLES.user, { id: "user", role: "signer" }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-eng", up(A.eng.top, 8), "写合约的人", "lab-cs lab-sm");
lb("lb-aud", up(A.aud.top, 8), "审计", "lab-cs lab-sm");
lb("lb-user", up(A.user.top, 8), "普通用户", "lab-cs lab-sm");
lb("lb-chq", up(A.chq.top, 10), "EIP-712 · nonce · 截止时间", "lab-gs");
lb("lb-claim", up(A.claim6.ground, -40), "领取合约", "lab-ink lab-sm");
lb("lb-1st", up(A.claim6.top, 40), "第 1 次 · 成功", "lab-gs lab-sm");
lb("lb-2nd", up(A.claim6.top, 40), "第 2 次也成功 = 漏洞", "lab-rs");
lb("lb-blk", up(A.claim6.top, 40), "第 2 次 · 被拦下", "lab-gs");
lb("lb-slip", up(A.meter.top, 8), "合理的滑点", "lab-gs lab-sm");
lb("lb-ppv", up(A.ppv.mid ?? A.ppv.center, 30), "私有交易通道", "lab-gs");
lb("lb-you", up(A.you.top, 8), "你 · 普通用户", "lab-cs lab-sm");
lb("lb-ltr", up(A.ltr.top, 12), "最少 19000", "lab-r");
lb("lb-miss", up(A.lens.top, 10), "看不到", "lab-rs");
lb("lb-pub", up(A.ptx.mid ?? A.ptx.center, 30), "走公开内存池时成立", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 60, y: 440, w: 600 };
const cardA = codeCard("csw", {
  ...CC, head: "交换函数", tag: "代码卡 A · 第 1 行",
  rows: [{ html: `swap(amountIn, <b>minOut</b>, <b>deadline</b>)`, chip: "调用者传入", chipCls: "ok" }],
});
const html = [
  cardA,
  ck("fx0", "修复前 · 重放成功", { x: 640, y: 150, w: 420, kind: "r" }),
  ck("fx1", "修复后 · 被拦下", { x: 1080, y: 150, w: 400, kind: "g" }),
  ck("hw-ok", "链 ID · 合约地址 · 数额 · 期限", { x: 80, y: 330, w: 560, kind: "g" }),
  ck("hw-no", "只显示哈希 / 提示盲签 → 不签", { x: 80, y: 420, w: 560, kind: "r" }),
  kw("kw-q", `滑点 <b>5%</b> → 真的付 5%？`, { x: 680, y: 150, size: 54 }),
  kw("kw-bid", `滑点 = 你公开的 <b>最差报价</b>${gtag("解读")}`, { x: 680, y: 150, size: 54 }),
  kw("kw-ord", `顺序可以被<b>买</b>`, { x: 140, y: 230, size: 50, accent: "#e0453a" }),
  kw("kw-sig", `签名可以被<b>重放</b>`, { x: 1180, y: 230, size: 50, accent: "#e0453a" }),
].join("\n");
const css = `
  #fx0, #fx1 { font-size: 30px; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  minOut: w("最小输出", 1), deadline: w("截止时间", 1), caller: w("调用者", 1),
  sig2: w("EIP-712", 2), nonce: w("nonce", 2),
  second: w("第二次", 3), bug: w("漏洞", 3),
  before: w("修复前", 4), after: w("修复后", 4),
  slip: w("滑点", 5), priv: w("私有交易通道", 5),
  look: w("链 ID", 6), hash: w("哈希", 6), noSign: we("不签", 6),
  back: w("回到开头", 7), q: w("滑点设", 7),
  pub: w("公开", 8), worst: w("最差报价", 8),
  mp: w("公开内存池", 9), priv9: w("私有通道", 9), cant: w("看不到", 9),
  buy: w("被买", 10), replay: w("重放", 10),
  look11: w("看清内容", 11), who: w("谁会先看到", 11),
};
const t = (x) => f(x);
const J = (v) => JSON.stringify(v);

// 曲线 / 光环（屏幕层）
S.curve("cv", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("roles", A.eng.top), { color: "#1d93ba" });
S.curve("cv-ord", [330, 316], S.scr("world", A.bdoc.top), { color: "#e0453a" });
S.curve("cv-sig", [1330, 316], S.scr("world", A.echq.top), { color: "#e0453a" });
const ring = (id, [x, y], text) => `<div class="ring6 hide" id="${id}" style="left:${Math.round(x - 70)}px;top:${Math.round(y - 70)}px"><span>${text}</span></div>`;
const R_PPV = S.scr("world", A.ppv.mid ?? A.ppv.center), R_CHQ = S.scr("world", A.chq.center);
const htmlAll = html + ring("rg-ppv", R_PPV, "私有通道") + ring("rg-chq", R_CHQ, "五格全绿");
const cssAll = css + `
  .ring6 { position: absolute; width: 140px; height: 140px; border: 6px solid #1f9d55; border-radius: 50%; box-shadow: 0 0 28px rgba(31,157,85,.65), inset 0 0 18px rgba(31,157,85,.4); }
  .ring6 span { position: absolute; left: 50%; top: 150px; transform: translateX(-50%); white-space: nowrap; background: #1f9d55; color: #fff; font: 600 30px/1 system-ui, sans-serif; padding: 8px 14px; border-radius: 10px; }
`;
// 信封走私有通道：PIPE.private 折线（相对 AMM）→ 世界画布点
const PRIV = L.PIPE.private.map(([du, dv, z]) => Wp(L.AMM.u + du, L.AMM.v + dv, z).map((n) => Math.round(n)));
const SLOT = ((p) => [Math.round(p[0] - 145), Math.round(p[1] + 35)])(Wp(CLAIM6.u, CLAIM6.v));   // copyTo 位移按支票 scale 放大，这里按实测反算（见 REVIEW）

S.build({
  cam0: "F", sub: "按角色 · 回答开头",
  grid: { u0: -2700, u1: 12400, v0: -4900, v1: 8300 }, box: [-1900, -2300, 13700, 3200],
  shown: [], css: cssAll, html: htmlAll,
  terms: [
    { id: "t0", t: "盲签", d: "签名人看不懂自己所签的内容", at: w("盲签", 6) },
  ],
  end: { line: "签之前看清内容，发之前想好谁会先看到", next: "可升级合约与代理", at: LS[12], nextAt: w("下一集", 12) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 最后，每个人今天就能做一件事。
      cam(${t(LS[0] + 0.2)}, "roles", 1.4);
      grow("eng", ${t(LS[0] + 0.6)}); grow("aud", ${t(LS[0] + 0.9)}); grow("flens", ${t(LS[0] + 1.0)}); grow("user", ${t(LS[0] + 1.2)});
      pop("#lb-eng", ${t(LS[0] + 1.1)}, 0.25); pop("#lb-aud", ${t(LS[0] + 1.4)}, 0.25); pop("#lb-user", ${t(LS[0] + 1.7)}, 0.25);
      // ===== L1 写合约的人，检查每个交换函数：最小输出和截止时间，是不是由调用者传进来。
      bump("#lb-eng", ${t(LS[1])}, 1.15, 1); pop("#csw", ${t(LS[1] + 0.8)}); draw("cv", ${t(LS[1] + 1.2)});
      hot("#csw-r0", ${t(TM.minOut)}); pop("#csw-c0", ${t(TM.deadline)}, 0.3);
      // ===== L2 所有签名，用 EIP-712，带上 nonce 和截止时间。
      out("#csw, #cv", ${t(LS[2] - 0.2)});
      grow("chq", ${t(LS[2] + 0.2)}); X9.fields(tl, "chq", ${t(TM.sig2)}, ["filled", "filled", "filled", "filled", "filled"], 0.25);
      pop("#lb-chq", ${t(TM.nonce)}, 0.3);
      // ===== L3 审计的人，拿同一份签名提交第二次。第二次也成功，就是漏洞。
      out("#lb-chq", ${t(LS[3] - 0.2)}); bump("#lb-aud", ${t(LS[3])}, 1.15, 1);
      grow("claim6", ${t(LS[3] + 0.2)}); pop("#lb-claim", ${t(LS[3] + 0.6)}, 0.25);
      X9.copies(tl, "chq", ${t(LS[3] + 0.8)}, 1, 0.5);
      X9.copyTo(tl, "chq", ${t(LS[3] + 1.2)}, 0, ${J(SLOT)}, 0.7); pop("#lb-1st", ${t(LS[3] + 1.9)}, 0.25);
      X9.copyTo(tl, "chq", ${t(TM.second - 0.5)}, 0, null, 0.5);
      out("#lb-1st", ${t(TM.second + 0.2)}); X9.copyRed(tl, "chq", ${t(TM.second + 0.1)}, true);
      X9.copyTo(tl, "chq", ${t(TM.second + 0.2)}, 0, ${J(SLOT)}, 0.7); pop("#lb-2nd", ${t(TM.second + 0.9)}, 0.3);
      flash("#lb-2nd", ${t(TM.bug)}, 2);
      // ===== L4 修复要两个结果：修复前，重放成功；修复后，被拦下。
      X9.copyTo(tl, "chq", ${t(LS[4] + 0.1)}, 0, null, 0.5);
      pop("#fx0", ${t(TM.before - 0.1)}, 0.3);
      out("#lb-2nd", ${t(TM.after - 0.4)}); X9.copyRed(tl, "chq", ${t(TM.after - 0.4)}, false);
      X9.copyTo(tl, "chq", ${t(TM.after - 0.3)}, 0, ${J(SLOT)}, 0.6);
      X9.copyTo(tl, "chq", ${t(TM.after + 0.4)}, 0, null, 0.5); pop("#lb-blk", ${t(TM.after + 0.3)}, 0.25);
      pop("#fx1", ${t(TM.after - 0.1)}, 0.3);
      // ===== L5 普通用户，大额兑换设合理的滑点，不用自动的高滑点，可以走私有交易通道。
      out("#fx0, #fx1, #lb-blk, #lb-claim, #lb-eng, #lb-aud, #lb-user", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "world", 1.5, "power2.inOut"); cam(${t(LS[5] + 1.6)}, "A", 1.8, "power2.inOut");
      pop("#lb-you", ${t(LS[5] + 3.5)}, 0.25);
      pop("#lb-slip", ${t(TM.slip + 0.6)}, 0.25); bump("#meter", ${t(TM.slip + 0.6)}, 1.04, 1);
      grow("ppv", ${t(TM.priv - 0.3)}); fadeIn("#ppv-flow", ${t(TM.priv + 0.3)}, 0.3); X1.dash(tl, "ppv-flow", ${t(TM.priv + 0.3)}, ${t(LS[10] - TM.priv)}, -1600);
      pop("#lb-ppv", ${t(TM.priv + 0.2)}, 0.25);
      // ===== L6 签名前看清链 ID、合约地址、数额和期限。钱包只显示哈希，或者提示盲签，就不签。
      out("#lb-slip, #lb-ppv, #lb-you", ${t(LS[6] - 0.2)});
      grow("hw6", ${t(LS[6] + 0.1)}); pop("#hw-ok", ${t(TM.look)}, 0.3);
      tl.to("#hw6-scr", { opacity: 0, duration: 0.25 }, ${t(TM.hash)}); tl.to("#hw6-scr2", { opacity: 1, duration: 0.25 }, ${t(TM.hash)});
      pop("#hw-no", ${t(TM.hash + 0.3)}, 0.3);
      // ===== L7 回到开头。滑点设 5%，为什么可能真的付 5%？
      out("#hw-ok, #hw-no, #hw6", ${t(LS[7] - 0.2)});
      pop("#kw-q", ${t(TM.q)}, 0.35); pop("#lb-you", ${t(LS[7] + 0.2)}, 0.25);
      // ===== L8 因为交易在打包之前是公开的，滑点就是你公开的最差报价。
      out("#kw-q", ${t(LS[8] - 0.2)});
      pop("#lb-ltr", ${t(TM.pub)}, 0.3); bump("#lb-ltr", ${t(TM.pub + 0.5)}, 1.15, 1);
      pop("#kw-bid", ${t(TM.pub + 0.1)}, 0.35);
      // ===== L9 这在交易走公开内存池时成立。走私有通道，搜索者在打包前看不到它。
      out("#kw-bid, #lb-ltr, #lb-you", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "poolSorter", 1.4);
      pop("#lb-pub", ${t(TM.mp)}, 0.3);
      X1.walk(tl, "ltr", ${t(TM.priv9 - 0.3)}, 1.6, ${J(PRIV)}); out("#ltr", ${t(TM.priv9 + 1.2)}, 0.3);
      flash("#lens", ${t(TM.cant - 0.4)}, 2); pop("#lb-miss", ${t(TM.cant)}, 0.3);
      // ===== L10 顺序可以被买，签名可以被重放。
      out("#lb-pub, #lb-miss", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "world", 2.0, "power2.inOut");
      pop("#kw-ord", ${t(TM.buy - 0.6)}, 0.35); draw("cv-ord", ${t(TM.buy)});
      pop("#kw-sig", ${t(TM.replay - 1.4)}, 0.35); draw("cv-sig", ${t(TM.replay)});
      // ===== L11 签之前看清内容，发之前想好，谁会先看到它。
      out("#kw-ord, #kw-sig, #cv-ord, #cv-sig", ${t(LS[11] - 0.2)});
      pop("#rg-chq", ${t(TM.look11)}, 0.35); pop("#rg-ppv", ${t(TM.who)}, 0.35);
      flash("#rg-chq, #rg-ppv", ${t(TM.who - 0.2)}, 1); out("#rg-chq, #rg-ppv", ${t(LS[12] - 0.15)});
      // ===== L12 下一集讲可升级合约与代理。（结束卡由 segbase 叠加，镜头静止在 world）
`,
});
