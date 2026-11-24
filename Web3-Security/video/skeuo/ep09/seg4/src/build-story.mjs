// ep09/seg4「④ 签名五字段」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.C（BRIEF 第 2 节镜头路线：seg4 起于 C 区）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.E

// 本段局部镜头（只在本段用；layout.mjs 不改）
const R = L.rect;
const LOCAL = {
  // 银行柜台 + 支票 + 以太坊领取合约（L1–L3、L7），右上留给用途条
  BC: L.fit([R(L.BANK, "tellerCounter"), R(L.CHEQUE, "cheque"), R(L.CLAIM.eth, "vending"), R(L.CLAIM.ethSign, "signPlate")], [100, 300, 1200, 860], 1.4),
  // 支票在右，代码卡 B 在左（L8）
  chqL: L.fit([R(L.CHEQUE, "cheque")], [960, 320, 1760, 820], 2.4),
  // 支票 + 印章 + 漏斗在右，代码卡 C 在左（L20–L22）
  fix: L.fit([R(L.CHEQUE, "cheque"), R(L.SEAL, "seal"), R(L.FUNNEL, "hashFunnel"), R(L.CLAIM.ethRoll, "rollCounter")], [940, 300, 1800, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: { ...L.CAMS, ...LOCAL }, ext: [E1, E2, E3, E4, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 没有 scale 参数的物件：外包一层以地面原点缩放，anchors 同步换算
const scl = (o, k, r) => {
  const [X0, Y0] = Wp(o.u, o.v);
  const m = (a) => Array.isArray(a) ? (a.length >= 2 && typeof a[0] === "number" ? [X0 + (a[0] - X0) * k, Y0 + (a[1] - Y0) * k, ...a.slice(2)] : a.map(m))
    : a && typeof a === "object" ? Object.fromEntries(Object.entries(a).map(([q, v]) => [q, m(v)])) : a;
  return { svg: `<g transform="translate(${f(X0)} ${f(Y0)}) scale(${k}) translate(${f(-X0)} ${f(-Y0)})">${r.svg}</g>`, anchors: m(r.anchors) };
};
const putS = (key, o, r, dy = 0, opts = {}) => put(key, o, (o.scale ?? 1) === 1 ? r : scl(o, o.scale, r), dy, opts);

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// C 三链排序台（段首镜头，seg3 终态的静止版）
putS("bnbSign", L.BNB.sign, E1.signBoard(L.BNB.sign, { id: "bnbSign", style: "plate", text: "BNB Chain" }));
put("bnbWheel", L.BNB.wheel, X.rotaWheel(L.BNB.wheel, { id: "bnbWheel", n: 6, at: 2, plate: "多座" }));
putS("bnbClock", L.BNB.clock, O.clock(L.BNB.clock, { id: "bnbClock" }));
putS("bnbMp", L.BNB.mempool, E1.mempool(L.BNB.mempool, { id: "bnbMp", n: 3, red: [0, 2] }));
putS("trSign", L.TRON.sign, E1.signBoard(L.TRON.sign, { id: "trSign", style: "plate", text: "TRON" }));
put("trWheel", L.TRON.wheel, X.rotaWheel(L.TRON.wheel, { id: "trWheel", n: 27, at: 5, plate: "27 座" }));
putS("trGauge", L.TRON.gauge, E3.gasGauge(L.TRON.gauge, { id: "trGauge", label: "优先费", state: "broken" }));
putS("mnSign", L.MANTLE.sign, E1.signBoard(L.MANTLE.sign, { id: "mnSign", style: "plate", text: "Mantle" }));
putS("mnSorter", L.MANTLE.sorter, E1.sorter(L.MANTLE.sorter, { id: "mnSorter", letters: 3 }));
putS("mnOp", L.MANTLE.operator, O.person(L.MANTLE.operator, { id: "mnOp", role: "engineer" }));

// E 签名柜台
putS("bank", L.BANK, E4.tellerCounter(L.BANK, { id: "bank", sign: "银行" }));
put("chq", L.CHEQUE, X.cheque(L.CHEQUE, { id: "chq", scale: L.CHEQUE.scale, signed: false }), 4);
put("eth", L.CLAIM.eth, E1.vending(L.CLAIM.eth, { id: "eth", scale: L.CLAIM.eth.scale, sign: "CLAIM" }));
put("bnb", L.CLAIM.bnb, E1.vending(L.CLAIM.bnb, { id: "bnb", scale: L.CLAIM.bnb.scale, sign: "CLAIM" }));
putS("ethSign", L.CLAIM.ethSign, E1.signBoard(L.CLAIM.ethSign, { id: "ethSign", style: "plate", text: "以太坊" }));
putS("bnbSign2", L.CLAIM.bnbSign, E1.signBoard(L.CLAIM.bnbSign, { id: "bnbSign2", style: "plate", text: "BNB Chain" }));
putS("ethRoll", L.CLAIM.ethRoll, E2.rollCounter(L.CLAIM.ethRoll, { id: "ethRoll", digits: 3, value: 0 }));
putS("bnbRoll", L.CLAIM.bnbRoll, E2.rollCounter(L.CLAIM.bnbRoll, { id: "bnbRoll", digits: 3, value: 0 }));
putS("seal", L.SEAL, O.seal(L.SEAL, { id: "seal", markText: "域", text: "域分隔符", stamped: false }));
putS("fnl", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "fnl", inputs: ["消息结构"], output: "类型哈希", text: "typehash" }));
putS("skey", L.SKEY, E3.selectorKey(L.SKEY, { id: "skey", name: "A()", selector: "0a0a0a0a" }));
put("twin", L.TWIN, E1.vending(L.TWIN, { id: "twin", scale: L.TWIN.scale, sign: "CLAIM" }), 0, { grow: true });
putS("eclk", L.ECLOCK, O.clock(L.ECLOCK, { id: "eclk" }));
// 右缘露出的陷阱区（与 seg5 起始画面一致）
putS("zero", L.ZERO, E7.emptyLot(L.ZERO, { id: "zero", zero: true }));
putS("sig0", L.SIGS[0], E2.sigPaper(L.SIGS[0], { id: "sig0", tag: "s" }));
putS("sig1", L.SIGS[1], E2.sigPaper(L.SIGS[1], { id: "sig1", tag: "翻转" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const C = A.chq, FX = C.fields.map((p) => p[0]);
const yTop = Math.min(C.top[1], C.amt[1] - 30), yBot = C.ground[1];
lb("lb-claim", up(A.eth.top, 8), "领取合约", "lab-cs lab-sm");
// L5 比喻：三个没写的格
const META = [[3, "没写日期"], [1, "没写收款银行"], [0, "没写编号"]];
META.forEach(([i, s], k) => lb(`lb-m${k}`, k === 1 ? [FX[i], yTop - 4] : [FX[i], yBot + 4], s, "lab-r lab-sm", k === 1 ? "b" : "t"));
lb("lb-ledger", up(A.bank.ledger, 14), "已兑 ✓", "lab-gs lab-sm");
lb("lb-nolog", up(A.eth.top, 8), `<span style="display:inline-block;width:46px;height:30px;border:3px dashed #e0453a;border-radius:6px"></span>合约不记 · 除非代码让它记`, "lab-r lab-sm");
// L8 五个字段名（上下交错）
const FN = ["nonce", "链 ID", "合约地址", "截止时间", "函数意图"];
FN.forEach((s, i) => lb(`lb-f${i}`, i % 2 ? [FX[i], yTop - 4] : [FX[i], yBot + 4], s, "lab-cs lab-sm", i % 2 ? "b" : "t"));
// L9–L13 远景里的当前字段名（支票下方，同一位置换字）
const FQ = [C.center[0], yBot + 6];
FN.forEach((s, i) => lb(`lb-q${i}`, FQ, `${"①②③④⑤"[i]} 缺 ${s}`, "lab-ink lab-sm", "t"));
lb("lb-r0", up(A.eth.top, 8), "同一合约重放", "lab-rs lab-sm");
lb("lb-r1", up(A.bnb.top, 8), "跨链重放", "lab-rs lab-sm");
lb("lb-r2", up(A.twin.top, 6), "跨合约重放", "lab-rs lab-sm");
lb("lb-r3", up(A.eclk.top, 40), "撤销后仍被使用", "lab-rs lab-sm");
lb("lb-lockB", [A.skey.tip[0] + 70, A.skey.tip[1]], "B() 的锁", "lab-r lab-sm", "l");
lb("lb-r4", up(A.skey.top, 10), "跨函数重放", "lab-rs lab-sm");
// L15–L19 猜题
lb("lb-q", FQ, "凭证：绑了 nonce · 没绑链 ID", "lab-ink lab-sm", "t");
lb("lb-addr0", up(A.eth.top, 8), "同一地址", "lab-g lab-sm");
lb("lb-addr1", up(A.bnb.top, 8), "同一地址", "lab-g lab-sm");
lb("lb-ask", up(A.bnb.top, 70), "?", "lab-r");
lb("lb-n0", [A.ethRoll.center[0], A.ethRoll.ground[1] + 6], "nonce 1", "lab-cs lab-sm", "t");
lb("lb-n1", [A.bnbRoll.center[0], A.bnbRoll.ground[1] + 6], "nonce 仍是 0", "lab-rs lab-sm", "t");
lb("lb-dg0", up(A.eth.top, 8), "摘要 7f3a…c9", "lab-ink lab-sm");
lb("lb-dg1", up(A.bnb.top, 8), "摘要 7f3a…c9", "lab-ink lab-sm");
lb("lb-same", [(A.eth.top[0] + A.bnb.top[0]) / 2, A.eth.top[1] - 70], "完全相同", "lab-rs lab-sm");
// L21–L23 修复
lb("lb-dom", [A.seal.center[0], A.seal.ground[1] + 6], "名称 · 版本 · 链 ID · 合约地址", "lab-cs lab-sm", "t");
lb("lb-th", [A.fnl.top[0], A.fnl.top[1] - 6], "类型哈希", "lab-cs lab-sm");
lb("lb-inc", [FX[0], yTop - 4], "合约自己 +1", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const USES = ["免 gas 授权 permit", "元交易", "订单簿挂单", "跨链桥验证者签名", "空投领取凭证"];
const usesHtml = `<div id="uses">${USES.map((s, i) => `<span class="lab lab-cs use hide" id="use${i}">${s}</span>`).join("")}</div>`;
const CB = { x: 60, y: 330, w: 900 };
const cardB = codeCard("cb", { ...CB, head: "漏洞版签名", tag: "示例", mono: true, rows: [
  `h = keccak256(abi.encodePacked(to, amount))`,
  `<span class="c-cm">// 只签了 to 和 amount</span>`,
  `signer = ecrecover(toEthSigned(h), v, r, s)`,
  `require(signer == admin)`,
] });
S.curve("cv-b", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("chqL", C.fields[2]), { color: "#e0453a" });
const CC = { x: 60, y: 300, w: 880 };
const cardC = codeCard("cc", { ...CC, head: "修复版签名", tag: "EIP-712", mono: true, rows: [
  `h = keccak256(abi.encode(CLAIM_TYPEHASH,`,
  `    to, amount, nonces[to]++, deadline))`,
  `digest = _hashTypedDataV4(h)`,
  `signer = ECDSA.recover(digest, sig)`,
  `require(signer == admin)`,
  `require(block.timestamp <= deadline)`,
] });
S.curve("cv-c2", [CC.x + CC.w + 4, codeRowY(CC.y, 2)], S.scr("fix", A.seal.top), { color: "#2aa3c9" });
S.curve("cv-c0", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("fix", A.fnl.hopper ?? A.fnl.top), { color: "#2aa3c9" });
const html = usesHtml + cardB + cardC
  + kw("kw-ask", `一份签名 → 能用 <b>几次</b>？`, { x: 1240, y: 150, accent: "#e0453a" })
  + kw("kw-cmp", `签一张 <b>100 元</b> 支票${gtag("比喻")}`, { x: 56, y: 120, size: 38 })
  + kw("kw-guess", `先猜一道题`, { x: 760, y: 140 })
  + kw("kw-712", `<b>EIP-712</b>`, { x: 60, y: 140, size: 56, accent: "#1d93ba" });
const css = `
    #uses { position: absolute; left: 640px; top: 120px; width: 1220px; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 14px 16px; }
    #uses .use { font-size: 32px; padding: 6px 18px 8px; border-radius: 12px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  sig: w("链下", 1), ver: w("合约验证", 1),
  uses: [w("permit", 2), w("元交易", 2), w("订单簿", 2), w("跨链桥", 2), w("空投", 2)],
  times: w("几次", 3), chq: w("支票", 4),
  miss: [w("日期", 5), w("收款", 5), w("编号", 5)],
  copy: w("复印", 6), cash: w("各兑", 6),
  ledger: w("记下", 7), nolog: w("合约不会", 7),
  five: w("五个字段", 8),
  lack: [9, 10, 11, 12, 13].map((i) => w("缺了它", i)),
  rep9: w("反复提交", 9), perm: w("永久有效", 12), mind: w("改主意", 12), callB: w("调用", 13),
  addr: w("相同的地址", 16), used: w("用过", 17), claim: w("领取吗", 17),
  sep: w("各自计数", 18), zero: w("还是", 18), same: w("完全相同", 19),
  dom: w("域分隔符", 21), th: w("类型哈希", 22),
  four: w("后四个", 23), inc: w("加一", 23),
};
const t = (x) => f(x);

S.build({
  cam0: "C", sub: "绑定五个字段",
  grid: { u0: 300, u1: 9900, v0: -3200, v1: 6000 }, box: [1200, -2400, 7700, 3000],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "元交易", d: "用户签名、由别人代付 gas 提交的交易", at: w("元交易", 2) },
    { id: "t1", t: "nonce", d: "每次使用都递增的一次性编号", at: w("nonce", 9) },
    { id: "t2", t: "摘要", d: "签名前对消息做哈希得到的定长值", at: w("摘要", 19) },
  ],
  js: `
      // SHOTS
      // ===== L0 再看另一半：签名 — 镜头从 C 区右移到柜台
      cam(${t(LS[0] + 0.1)}, "BC", 2.2, "power2.inOut");
      // ===== L1 链下签名、交给合约验证
      X9.sign(tl, "chq", ${t(TM.sig)}, 1.0); pop("#lb-claim", ${t(TM.ver)}); bump("#lb-claim", ${t(TM.ver + 0.4)});
      // ===== L2 用途列表
      ${TM.uses.map((u, i) => `pop("#use${i}", ${t(u)}, 0.25);`).join(" ")}
      // ===== L3 能被用几次
      out("#uses .use, #lb-claim", ${t(LS[3] - 0.2)}); pop("#kw-ask", ${t(LS[3] + 0.1)});
      // ===== L4 支票比喻：镜头推到银行
      out("#kw-ask", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "bank", 1.3); pop("#kw-cmp", ${t(TM.chq)}); bump("#chq", ${t(TM.chq + 0.3)}, 1.06);
      // ===== L5 没写日期 / 收款银行 / 编号：推近支票
      cam(${t(LS[5] - 0.1)}, "cheque", 1.0);
      ${[3, 1, 0].map((i, k) => `X9.field(tl, "chq", ${t(TM.miss[k])}, ${i}, "warn"); pop("#lb-m${k}", ${t(TM.miss[k] + 0.1)});`).join(" ")}
      // ===== L6 复印、各兑一次：回到柜台
      out("#lb-m0, #lb-m1, #lb-m2", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "bank", 1.0);
      X9.copies(tl, "chq", ${t(TM.copy)}, 3, 0.6, true);
      X9.copyTo(tl, "chq", ${t(TM.cash - 0.6)}, 0, [${A.bank.window1.map(f)}], 0.8); X9.copyTo(tl, "chq", ${t(TM.cash - 0.2)}, 1, [${A.bank.window2.map(f)}], 0.8);
      X4.cashOut(tl, "bank", 0, ${t(TM.cash + 0.4)}, 0.6); X4.cashOut(tl, "bank", 1, ${t(TM.cash + 0.9)}, 0.6);
      // ===== L7 比喻不完全成立：银行记账，合约不记
      out("#kw-cmp", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "BC", 1.2);
      X4.pen(tl, "bank", ${t(TM.ledger)}, true, 0.5); pop("#lb-ledger", ${t(TM.ledger + 0.4)});
      pop("#lb-nolog", ${t(TM.nolog)}); hot("#eth", ${t(TM.nolog)}, "#e0453a");
      // ===== L8 五个字段：链上版支票 + 代码卡 B
      out("#lb-ledger, #lb-nolog", ${t(LS[8] - 0.2)}); X9.copies(tl, "chq", ${t(LS[8] - 0.2)}, 0, 0.4);
      ${[3, 1, 0].map((i) => `X9.field(tl, "chq", ${t(LS[8])}, ${i}, "blank");`).join(" ")}
      cam(${t(LS[8])}, "chqL", 1.2); X9.amt(tl, "chq", ${t(LS[8] + 0.6)}, "领取");
      pop("#cb", ${t(LS[8] + 0.8)}); hot("#cb-r0", ${t(TM.five)}); draw("cv-b", ${t(TM.five + 0.1)});
      ${[0, 1, 2, 3, 4].map((i) => `pop("#lb-f${i}", ${t(Math.min(TM.five, LS[8] + 1.2) + 0.2 + i * 0.25)}, 0.2);`).join(" ")}
      // ===== L9 nonce：同一合约反复提交（远景 E）
      out("#cb, #cv-b, ${[0, 1, 2, 3, 4].map((i) => `#lb-f${i}`).join(", ")}", ${t(LS[9] + 0.8)}); cam(${t(LS[9] + 1.0)}, "E", 1.4);
      ${[0, 1, 2, 3, 4].map((i) => {
        const L0 = LS[9 + i], lk = TM.lack[i];
        const prev = i ? `out("#lb-q${i - 1}", ${t(L0 - 0.2)});` : "";
        return `${prev} pop("#lb-q${i}", ${t(i ? L0 + 0.3 : LS[9] + 2.0)}); X9.field(tl, "chq", ${t(L0 + 0.3)}, ${i}, "bad"); flash("#chq-f${i}", ${t(lk)}, 2);`;
      }).join("\n      ")}
      X9.copies(tl, "chq", ${t(TM.lack[0] + 0.2)}, 1, 0.5, true);
      X9.copyTo(tl, "chq", ${t(TM.lack[0] + 0.8)}, 0, [${A.eth.coinSlot.map(f)}], 0.7); X9.copyTo(tl, "chq", ${t(TM.lack[0] + 1.6)}, 0, null, 0.5);
      X9.copyTo(tl, "chq", ${t(TM.rep9 - 0.2)}, 0, [${A.eth.coinSlot.map(f)}], 0.6); pop("#lb-r0", ${t(TM.rep9)}); bump("#ethRoll", ${t(TM.rep9 + 0.5)}, 1.08);
      // ===== L10 链 ID：跨链重放
      out("#lb-r0", ${t(LS[10] - 0.2)}); X9.copyTo(tl, "chq", ${t(LS[10] - 0.2)}, 0, null, 0.4);
      X9.copies(tl, "chq", ${t(TM.lack[1] + 0.1)}, 2, 0.5, true);
      X9.copyTo(tl, "chq", ${t(TM.lack[1] + 0.6)}, 1, [${A.bnb.coinSlot.map(f)}], 1.0); pop("#lb-r1", ${t(TM.lack[1] + 1.4)}); hot("#bnbSign2", ${t(w("多链部署", 10))}); bump("#lb-r1", ${t(w("同样有效", 10))});
      // ===== L11 合约地址：孪生合约也收
      out("#lb-r1", ${t(LS[11] - 0.2)}); X9.copyTo(tl, "chq", ${t(LS[11] - 0.2)}, 1, null, 0.4);
      grow("twin", ${t(TM.lack[2] + 0.1)});
      X9.copies(tl, "chq", ${t(TM.lack[2] + 0.4)}, 3, 0.5, true);
      X9.copyTo(tl, "chq", ${t(TM.lack[2] + 1.0)}, 2, [${A.twin.coinSlot.map(f)}], 0.9); pop("#lb-r2", ${t(TM.lack[2] + 1.8)});
      // ===== L12 截止时间：时钟转很多圈，复印件仍被收下
      out("#lb-r2", ${t(LS[12] - 0.2)}); X9.copyTo(tl, "chq", ${t(LS[12] - 0.2)}, 2, null, 0.4);
      KIT.clock(tl, "eclk", ${t(TM.perm - 0.2)}, 3.0, 2160); pop("#lb-r3", ${t(TM.perm + 0.4)});
      X9.copyTo(tl, "chq", ${t(TM.mind)}, 0, [${A.eth.coinSlot.map(f)}], 0.8);
      // ===== L13 函数意图：A 钥匙插进 B 锁
      out("#lb-r3", ${t(LS[13] - 0.2)}); X9.copyTo(tl, "chq", ${t(LS[13] - 0.2)}, 0, null, 0.4);
      pop("#lb-lockB", ${t(TM.lack[4] + 0.3)}); tl.to("#skey", { x: 40, duration: 0.6, ease: "power2.inOut" }, ${t(TM.callB - 0.3)}); pop("#lb-r4", ${t(TM.callB + 0.3)});
      // ===== L14 先猜一道题（场景清空）
      out("#lb-q4, #lb-r4, #lb-lockB, #twin", ${t(LS[14] - 0.2)}); tl.to("#skey", { x: 0, duration: 0.4 }, ${t(LS[14] - 0.2)});
      X9.copies(tl, "chq", ${t(LS[14] - 0.2)}, 0, 0.4); X9.copyRed(tl, "chq", ${t(LS[14])}, false);
      X9.fields(tl, "chq", ${t(LS[14])}, ["blank", "blank", "blank", "blank", "blank"], 0.05); pop("#kw-guess", ${t(LS[14] + 0.1)});
      // ===== L15 绑 nonce、没绑链 ID
      out("#kw-guess", ${t(LS[15] + 0.8)}); pop("#lb-q", ${t(LS[15] + 0.4)});
      X9.field(tl, "chq", ${t(w("nonce", 15))}, 0, "filled"); X9.field(tl, "chq", ${t(w("链 ID", 15))}, 1, "bad");
      // ===== L16 同一份合约、同一地址、两条链
      hot("#ethSign", ${t(w("以太坊", 16))}); hot("#bnbSign2", ${t(w("BNB", 16))});
      pop("#lb-addr0", ${t(TM.addr)}); pop("#lb-addr1", ${t(TM.addr + 0.2)});
      // ===== L17 在以太坊用过，还能在 BNB Chain 领取吗
      X9.copies(tl, "chq", ${t(LS[17])}, 1, 0.4, false);
      X9.copyTo(tl, "chq", ${t(LS[17] + 0.4)}, 0, [${A.eth.coinSlot.map(f)}], 0.8); KIT.count(tl, "ethRoll", ${t(TM.used)}, 0.6, 0, 1);
      X9.copyTo(tl, "chq", ${t(TM.claim - 0.5)}, 0, [${up(A.bnb.top, 30).map(f)}], 0.9); out("#lb-addr0, #lb-addr1", ${t(TM.claim - 0.6)}); pop("#lb-ask", ${t(TM.claim + 0.4)});
      // ===== L18 能：nonce 各自计数，BNB Chain 上还是 0
      out("#lb-ask", ${t(LS[18])}); X9.copyRed(tl, "chq", ${t(LS[18])}, true);
      X9.copyTo(tl, "chq", ${t(LS[18] + 0.1)}, 0, [${A.bnb.coinSlot.map(f)}], 0.7);
      pop("#lb-n0", ${t(TM.sep)}); pop("#lb-n1", ${t(TM.zero)}); flash("#bnbRoll", ${t(TM.zero + 0.2)}, 2);
      // ===== L19 摘要相同
      pop("#lb-dg0", ${t(w("摘要", 19) + 0.2)}); pop("#lb-dg1", ${t(w("摘要", 19) + 0.5)}); pop("#lb-same", ${t(TM.same)});
      // ===== L20 EIP-712：代码卡 C
      out("#lb-dg0, #lb-dg1, #lb-same, #lb-n0, #lb-n1, #lb-q", ${t(LS[20] - 0.2)}); X9.copies(tl, "chq", ${t(LS[20] - 0.2)}, 0, 0.4); X9.copyRed(tl, "chq", ${t(LS[20] + 0.3)}, false);
      cam(${t(LS[20])}, "fix", 1.3); pop("#kw-712", ${t(LS[20] + 0.6)}); pop("#cc", ${t(LS[20] + 1.0)});
      // ===== L21 域分隔符：印章盖到链 ID、合约地址两格
      hot("#cc-r2", ${t(TM.dom - 0.3)}); draw("cv-c2", ${t(TM.dom - 0.2)}); pop("#lb-dom", ${t(w("名称", 21))});
      KIT.stamp(tl, "seal", ${t(TM.dom + 0.2)}); X9.field(tl, "chq", ${t(TM.dom + 0.9)}, 1, "filled"); X9.field(tl, "chq", ${t(TM.dom + 1.2)}, 2, "filled");
      // ===== L22 类型哈希：贴到第五格
      out("#lb-dom", ${t(LS[22] - 0.2)}); hot("#cc-r0", ${t(LS[22])}); draw("cv-c0", ${t(LS[22] + 0.1)});
      X3.hash(tl, "fnl", ${t(LS[22] + 0.3)}); pop("#lb-th", ${t(TM.th)}); X9.field(tl, "chq", ${t(TM.th + 0.6)}, 4, "filled");
      // ===== L23 后四个一次解决，nonce 合约自己 +1 — 回到 E，段尾静止
      out("#cc, #cv-c0, #cv-c2, #kw-712, #lb-th", ${t(LS[23] - 0.2)}); cam(${t(LS[23])}, "E", 1.4);
      X9.field(tl, "chq", ${t(TM.four)}, 3, "filled"); flash("#chq-f1, #chq-f2, #chq-f3, #chq-f4", ${t(TM.four + 0.3)}, 2);
      pop("#lb-inc", ${t(TM.inc - 1.4)}); KIT.count(tl, "ethRoll", ${t(TM.inc - 0.6)}, 0.6, 1, 2); flash("#chq-f0", ${t(TM.inc - 0.4)}, 1);
`,
});
