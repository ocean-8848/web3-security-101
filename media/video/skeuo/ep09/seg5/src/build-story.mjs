// ep09/seg5「⑤ 签名的陷阱」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.E（BRIEF 第 2 节镜头路线：seg5 起于 E 区）。
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
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.F

// ---- 本段专用位置与近景镜头（shared/layout.mjs 不改）
const SP = (Xc, Yc, e = {}) => { const q = G(Xc, Yc); return { u: Math.round(q.u), v: Math.round(q.v), ...e }; };
const BADSIG = SP(6890, -560, { scale: 0.6 });         // 无效签名纸（ZERO 左边）
const GATE = SP(7440, -470, { scale: 0.55 });          // 验签闸门（ZERO 右侧，签名纸后方）
const USED = SP(7470, -40, { scale: 0.45 });           // "已使用"夹板（两张签名纸右边）
const PVM = SP(8380, -70, { scale: 0.45 });            // permit 落点：存款合约（小号内存池出口右侧）
const PL2 = SP(7460, 150);                             // 钓鱼：签下的 permit 信封（硬件钱包右边）
const THIEF = SP(7720, 210, { scale: 0.9 });           // 钓鱼：拿走签名的人
const TXDOC = SP(9880, 170, { scale: 0.4 });           // 独立解码："交易数据"卡（放大镜左边）
const R = L.rect;
const MY = {
  tZero: L.fit([R(L.ZERO, "emptyLot"), R(L.ADMIN, "emptyLot"), R(BADSIG, "sigPaper"), [7340, -620, 7540, -430]], [860, 300, 1800, 820], 1.4),
  tSigs: L.fit([...L.SIGS.map((q) => R(q, "sigPaper")), R(USED, "doc")], [860, 300, 1800, 820], 1.4),
  tBytes: L.fit([[7600, -330, 7820, -110]], [860, 330, 1760, 800], 2.4),
  tWallet: L.fit([R(L.WALLET1271, "accountSafe")], [560, 300, 1360, 820], 1.4),
  tPermit: L.fit([R(L.PERMIT.pool, "mempool"), R(L.PERMIT.letter, "letter"), R(PVM, "vending")], [860, 300, 1800, 820], 1.4),
  tPhish: L.fit([R(L.EHW, "hwWallet"), R(L.ECLOCK2, "clock"), R(THIEF, "person"), R(PL2, "letter")], [360, 300, 1560, 820], 1.4),
};
const CAMS = { ...L.CAMS, ...MY };

const S = segInit(import.meta.url, { cams: CAMS, ext: [X, E1, E2, E3, E4, E5, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面原点整体缩放，anchors 一并换算
const sc = (o, r, s = o.scale ?? 1) => {
  if (s === 1) return r;
  const [ox, oy] = at(o);
  const m = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number" ? [ox + (v[0] - ox) * s, oy + (v[1] - oy) * s]
    : Array.isArray(v) ? v.map(m) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, m(x)])) : v;
  return { svg: `<g transform="translate(${f(ox)} ${f(oy)}) scale(${s}) translate(${f(-ox)} ${f(-oy)})">${r.svg}</g>`, anchors: m(r.anchors) };
};
const putS = (key, o, r, dy = 0, po = {}) => put(key, o, sc(o, r), dy, po);

// ---------------------------------------------------------------- 世界物件
// E 区（seg4 结尾的样子：五格全绿的支票 + 两台领取合约）
put("bank", L.BANK, E4.tellerCounter(L.BANK, { id: "bank", sign: "银行" }));
put("chq", L.CHEQUE, X.cheque(L.CHEQUE, { id: "chq", scale: 1.8, state: "filled", amount: "领取" }));
put("veth", L.CLAIM.eth, E1.vending(L.CLAIM.eth, { id: "veth", scale: 0.8, sign: "领取合约" }));
put("vbnb", L.CLAIM.bnb, E1.vending(L.CLAIM.bnb, { id: "vbnb", scale: 0.8, sign: "领取合约" }));
putS("seth", L.CLAIM.ethSign, E1.signBoard(L.CLAIM.ethSign, { id: "seth", style: "plate", text: "以太坊" }));
putS("sbnb", L.CLAIM.bnbSign, E1.signBoard(L.CLAIM.bnbSign, { id: "sbnb", style: "plate", text: "BNB Chain" }));
putS("reth", L.CLAIM.ethRoll, E2.rollCounter(L.CLAIM.ethRoll, { id: "reth", value: 0 }));
putS("rbnb", L.CLAIM.bnbRoll, E2.rollCounter(L.CLAIM.bnbRoll, { id: "rbnb", value: 0 }));
putS("seal", L.SEAL, O.seal(L.SEAL, { id: "seal", markText: "域" }));
putS("fun", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "fun", text: "类型哈希", inputs: ["类型", "字段"], output: "摘要", done: true }));
putS("skey", L.SKEY, E3.selectorKey(L.SKEY, { id: "skey", name: "claim(…)" }));
put("twin", L.TWIN, E1.vending(L.TWIN, { id: "twin", scale: 0.45, sign: "领取合约" }));
putS("eclk", L.ECLOCK, O.clock(L.ECLOCK, { id: "eclk" }));

// E 验签陷阱区
put("zero", L.ZERO, E7.emptyLot(L.ZERO, { id: "zero", scale: 0.8, plateText: "0" }));
put("admin", L.ADMIN, E7.emptyLot(L.ADMIN, { id: "admin", scale: 0.5, plateText: "0" }));
putS("badsig", BADSIG, E2.sigPaper(BADSIG, { id: "badsig", title: "无效签名", tag: "?", state: "attacker" }), 0, { grow: true });
putS("gate", GATE, O.checkpoint(GATE, { id: "gate", n: "验签" }));
putS("sig0", L.SIGS[0], E2.sigPaper(L.SIGS[0], { id: "sig0", tag: "s" }));
putS("sig1", L.SIGS[1], E2.sigPaper(L.SIGS[1], { id: "sig1", tag: "翻转" }));
putS("used", USED, O.doc(USED, { id: "used", title: "已使用", lines: ["签名本身"], standing: true }), 0, { grow: true });
putS("used2", USED, O.doc(USED, { id: "used2", title: "已使用", lines: ["nonce #7"], standing: true }), 1);
// 字节块：紧凑编码两排（ab|c、a|bc）→ 红色重合版 → 标准编码（每段先写长度）
const CELL = 40;
const row = (gid, o, segs, hidden) => {
  let u = 0, s = "";
  segs.forEach(([txt, color], k) => { const n = txt.length; s += E3.byteBlock({ u: o.u + u, v: o.v }, { id: `${gid}-${k}`, bytes: n, cell: CELL, depth: 40, h: 26, color, text: txt.split("").join(" ") }).svg; u += n * CELL; });
  add(o, hidden ? S.hid(gid, s) : `<g id="${gid}">${s}</g>`);
};
row("bc0", L.BYTES[0], [["ab", "teal"], ["c", "green"]]);
row("bc1", L.BYTES[1], [["a", "teal"], ["bc", "green"]]);
row("br0", L.BYTES[0], [["abc", "red"]], true);
row("br1", L.BYTES[1], [["abc", "red"]], true);
row("bs0", L.BYTES[0], [["2", "gray"], ["ab", "teal"], ["1", "gray"], ["c", "green"]], true);
row("bs1", L.BYTES[1], [["1", "gray"], ["a", "teal"], ["2", "gray"], ["bc", "green"]], true);
putS("aw", L.WALLET1271, E5.accountSafe(L.WALLET1271, { id: "aw" }));
// permit：小号内存池入口 + 存款合约 + 信封
putS("ppool", L.PERMIT.pool, E1.mempool(L.PERMIT.pool, { id: "ppool", n: 2 }));
put("pvm", PVM, E1.vending(PVM, { id: "pvm", scale: 0.45, sign: "存款合约" }));
put("pl", L.PERMIT.letter, E1.letter(L.PERMIT.letter, { id: "pl" }));
put("pc", L.PERMIT.letter, E1.letter(L.PERMIT.letter, { id: "pc", state: "attacker" }), -1, { wrap: (s) => S.hid("pc-w", s) });
putS("ehw", L.EHW, O.hwWallet(L.EHW, { id: "ehw", screenText: "0x…" }));
putS("eclk2", L.ECLOCK2, O.clock(L.ECLOCK2, { id: "eclk2", h: 3, m: 0 }), 0, { grow: true });
put("pl2", PL2, E1.letter(PL2, { id: "pl2" }), 0, { wrap: (s) => S.hid("pl2-w", s) });
put("thief", THIEF, O.person(THIEF, { id: "thief", role: "attacker", scale: 0.9 }), 0, { grow: true });

// F 多签金库
const page = (body) => `<rect x="0" y="0" width="148" height="88" fill="#ffffff"/><rect x="0" y="0" width="148" height="16" fill="#e9e4da"/><text x="6" y="12" font-size="10" font-weight="700" fill="#5d584f">多签钱包</text>${body}`;
const PAGE0 = page(`<rect x="10" y="28" width="90" height="8" rx="4" fill="#ddd6c9"/><rect x="10" y="44" width="120" height="8" rx="4" fill="#ddd6c9"/><rect x="10" y="62" width="60" height="16" rx="5" fill="#1d93ba"/>`);
const PAGE1 = page(`<text x="10" y="44" font-size="20" font-weight="900" fill="#1c1c1c">普通转账</text><circle cx="126" cy="38" r="11" fill="#1f9d55"/><path d="M120 38 l4 4 l8 -8" stroke="#fff" stroke-width="3" fill="none"/><rect x="10" y="62" width="60" height="16" rx="5" fill="#1d93ba"/>`)
  + `<rect x="1.5" y="1.5" width="145" height="85" fill="none" stroke="#e0453a" stroke-width="3"/>`;
put("vault", L.VAULT, sc(L.VAULT, O.safe(L.VAULT, { id: "vault", plate: "冷钱包", core: "blue" })));
L.DESKS.forEach((d, i) => put(`dk${i}`, d, O.desk(d, { id: `dk${i}`, screen: PAGE0, screen2: PAGE1 })));
L.SIGNERS.forEach((p, i) => put(`sg${i}`, p, O.person(p, { id: `sg${i}`, role: "signer" }), 0, { grow: true }));
const HW2 = (txt, bg) => `<rect x="0" y="0" width="70" height="40" fill="${bg}"/><text x="35" y="26" font-size="13" font-weight="900" text-anchor="middle" fill="#ffffff">${txt}</text>`;
L.SIGNER_HW.forEach((p, i) => putS(`hw${i}`, p, O.hwWallet(p, { id: `hw${i}`, screenText: "确认?", screen2: i === 1 ? HW2("升级多签", "#c3352b") : HW2("op 1 ✕", "#c3352b") })));
putS("fm", L.FMETER, E5.thresholdMeter(L.FMETER, { id: "fm", max: 3, th: 2, level: 0, pipe: 0, thText: "阈值" }));
putS("txd", TXDOC, O.doc(TXDOC, { id: "txd", title: "交易数据", lines: ["0x6a76 1202…", "0000 0001…"], standing: true }), 0, { grow: true });
putS("flens", L.FLENS, O.magnifier(L.FLENS, { id: "flens" }), 0, { grow: true });
putS("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }), 0, { grow: true });
putS("knife", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "knife", on: true, text: "审批" }), 0, { grow: true });
// 金条点阵：从金库门口往前流出（每点 = 一份，示意）
const [vx, vy] = at(L.VAULT);
let gold = "";
for (let k = 0; k < 24; k++) { const c = k % 6, r = Math.floor(k / 6); gold += `<circle cx="${f(vx + 40 + c * 30 + r * 14)}" cy="${f(vy + 20 + r * 24 + c * 8)}" r="10" fill="#d9a21b" stroke="#a87908" stroke-width="2" opacity="0"/>`; }
add(SP(vx + 120, vy + 120), `<g id="gold">${gold}</g>`);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const [cx0, cy0] = A.chq.top;
["①", "②", "③"].forEach((n, i) => lb(`lb-n${i}`, [cx0 - 110 + i * 110, cy0 - 30], n, "lab-ink"));
lb("lb-bad", up(A.badsig.top, 6), "无效签名", "lab-rs lab-sm");
lb("lb-ecr", up(A.zero.plate, 40), "ecrecover → 0", "lab-rs");
lb("lb-adm", up(A.admin.plate, 34), "admin = 0", "lab-r");
lb("lb-eq", [(A.zero.plate[0] + A.admin.plate[0]) / 2 + 20, (A.zero.plate[1] + A.admin.plate[1]) / 2 - 40], "=", "lab-rs");
lb("lb-pass", [A.gate.road[0] + 40, A.gate.road[1] + 20], "闸门放行", "lab-rs", "l");
lb("lb-v0", up(A.sig0.top, 6), "有效 ✓", "lab-gs lab-sm");
lb("lb-v1", up(A.sig1.top, 6), "有效 ✓", "lab-gs lab-sm");
lb("lb-new", up(A.sig1.top, 6), "新签名 → 放进去", "lab-rs lab-sm");
lb("lb-rej", up(A.sig1.top, 6), "翻转 → 拒绝", "lab-gs lab-sm");
const bl0 = at(L.BYTES[0]), bl1 = at(L.BYTES[1]);
lb("lb-r0", [bl0[0] - 20, bl0[1] - 8], "ab + c", "lab-cs lab-sm", "r");
lb("lb-r1", [bl1[0] - 20, bl1[1] - 8], "a + bc", "lab-cs lab-sm", "r");
lb("lb-same", [bl0[0] + 150, bl0[1] - 70], "结果相同 = abc", "lab-rs lab-sm");
lb("lb-std", [bl0[0] + 200, bl0[1] - 70], "补齐长度 → 不再相同", "lab-gs lab-sm");
lb("lb-nokey", up(A.aw.top, 6), "合约钱包 · 没有私钥", "lab-ink");
lb("lb-ecr2", [A.aw.front[0] - 150, A.aw.front[1]], "ecrecover ✕", "lab-rs");
lb("lb-1271", [A.aw.front[0] + 150, A.aw.front[1] - 40], "ERC-1271 接口 ✓", "lab-gs");
lb("lb-face1", [A.pl.top[0] - 70, A.pl.top[1] - 10], "拒绝服务", "lab-r lab-sm", "r");
lb("lb-face2", [A.pl.top[0] + 70, A.pl.top[1] - 10], "钓鱼", "lab-r lab-sm", "l");
lb("lb-mine", up(A.pl.top, 50), "你：permit + 存款", "lab-ink lab-sm");
lb("lb-copy", up(A.ppool.top, 6), "复制的 permit 抢先", "lab-rs lab-sm");
lb("lb-rev", up(A.pvm.top, 10), "nonce 已用 → 回滚", "lab-rs lab-sm");
lb("lb-ok", up(A.pvm.top, 10), "额度已足够 → 通过", "lab-gs lab-sm");
lb("lb-hex", up(A.ehw.top, 20), "0xd505accf 0000…", "lab-ink");
lb("lb-free", up(A.ehw.top, 90), "链下签 · 不花 gas", "lab-cs lab-sm");
lb("lb-any", up(A.eclk2.top, 6), "任意时间执行", "lab-r lab-sm");
// F
lb("lb-vault", up(A.vault.top, 6), "冷钱包多签", "lab-cs");
lb("lb-only", up(A.vault.top, 6), "只对这个钱包生效", "lab-r");
L.DESKS.forEach((d, i) => {
  lb(`lb-see${i}`, up(A[`dk${i}`].top, 4), "看到：普通转账 ✓", "lab-gs lab-sm");
  lb(`lb-dc${i}`, [A[`dk${i}`].screen[0], A[`dk${i}`].screen[1] + 60], "实际：delegatecall", "lab-rs lab-sm", "c");
});
lb("lb-core", up(A.vault.top, 6), "实现 → 恶意合约", "lab-rs");
lb("lb-fm", up(A.fm.top, 80),"签名真 · 内容假", "lab-r");
lb("lb-loss", [vx + 140, vy + 150], "约 15 亿美元 · 事发时估值", "lab-rs", "c");
lb("lb-daily", up(A.dk1.top, 4), "界面：日常交易", "lab-gs lab-sm");
lb("lb-up", [A.hw1.top[0], A.hw1.top[1] + 70], "硬件钱包：升级多签", "lab-rs lab-sm", "t");
lb("lb-neq", [A.hw1.top[0] - 70, A.hw1.top[1] - 70], "≠", "lab-rs");
lb("lb-loss2", up(A.vault.top, 6), "约 2.3 亿美元 · 公开分析", "lab-r");
lb("lb-dec", up(A.txd.top, 10), "解码：delegatecall", "lab-rs lab-sm");
lb("lb-wl", up(A.shd.top, 4), "白名单", "lab-gs lab-sm");
lb("lb-ap", up(A.knife.top, 4), "额外审批", "lab-cs lab-sm");
lb("lb-blk", [A.shd.center[0] - 90, A.shd.center[1] + 10], "delegatecall ✕", "lab-rs lab-sm", "r");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 60, y: 320, w: 720 };
const cB = codeCard("cB", { ...CB, mono: true, head: "验签", rows: [
  "claim(h, sig) {",
  { html: "  s = ecrecover(h, sig)", chip: "无效 → 0", chipCls: "x" },
  { html: "  require(s == admin)", chip: "admin = 0", chipCls: "x" },
  "}",
] });
const cC = codeCard("cC", { ...CB, mono: true, head: "修复", rows: [
  { html: "used[sig] = true", chip: "✕", chipCls: "x" },
  { html: "used[nonce] = true", chip: "✓", chipCls: "ok" },
  `<span class="c-cm">// 或 used[消息哈希]</span>`,
  { html: "ECDSA.recover(h, sig)", chip: "拒绝翻转", chipCls: "ok" },
] });
const cE = codeCard("cE", { ...CB, mono: true, head: "签多个动态类型", rows: [
  { html: "abi.encodePacked(a, b)", chip: "碰撞", chipCls: "x" },
  { html: "abi.encode(a, b)", chip: "补齐", chipCls: "ok" },
] });
const cD = codeCard("cD", { ...CB, mono: true, head: "permit 容错", rows: [
  { html: "try permit(…) {}", chip: "失败", chipCls: "x" },
  "catch {}",
  { html: "require(allowance ≥ amt)", chip: "已足够", chipCls: "ok" },
  { html: "deposit(amt)", chip: "通过", chipCls: "ok" },
] });
S.curve("cvB1", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], S.scr("tZero", A.zero.plate), { color: "#e0453a" });
S.curve("cvB2", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("tZero", A.admin.plate), { color: "#e0453a" });
S.curve("cvC3", [CB.x + CB.w + 4, codeRowY(CB.y, 3)], S.scr("tSigs", A.sig1.center), { color: "#1f9d55" });
S.curve("cvD2", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("tPermit", A.pvm.center), { color: "#1f9d55" });
const html = cB + cC + cE + cD
  + evt("ev-bybit", `2025 年 2 月 · <b>Bybit</b> · 冷钱包多签`, { color: "#e0453a" })
  + evt("ev-src", `Sygnia、Verichains 等公开分析${gtag("第三方分析")}`, { top: 210 })
  + evt("ev-wx", `2024 年 7 月 · <b>WazirX</b> · 6 人里需 4 人`, { color: "#e0453a" })
  + kw("kw-ms", `多签 <b>≠</b> 防假界面${gtag("解读")}`, { x: 560, y: 150, accent: "#e0453a" })
  + ck("ck1", "硬件钱包逐字段核对", { x: 520, y: 120, w: 700 })
  + ck("ck2", "独立工具解码交易数据", { x: 520, y: 204, w: 700 })
  + ck("ck3", "delegatecall 设白名单 / 额外审批", { x: 520, y: 288, w: 700 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const t = (x) => f(x);
const J = (p) => `[${f(p[0])}, ${f(p[1])}]`;
const PLF = [A.pvm.ground[0] - 95, A.pvm.ground[1] + 55];   // 你的信封停在存款合约前（地面）
const PCF = [A.pvm.ground[0] - 35, A.pvm.ground[1] + 40];   // 复制的红信封先到
const THF = [A.thief.center[0] - 30, A.thief.center[1] + 30];

S.build({
  cam0: "E", sub: "三个验签陷阱 · permit 两面 · 多签假界面",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "ecrecover", d: "从签名还原签名者地址的内置函数", at: w("ecrecover", 1) },
    { id: "t1", t: "紧凑编码", d: "不补齐长度、直接拼接的编码方式", at: w("紧凑编码", 6) },
    { id: "t2", t: "ERC-1271", d: "合约钱包校验签名的标准接口", at: w("ERC-1271", 8) },
    { id: "t3", t: "拒绝服务", d: "让正常交易无法完成的攻击", at: w("拒绝服务", 10) },
    { id: "t4", t: "冷钱包", d: "私钥不联网保管的钱包", at: w("冷钱包", 16) },
    { id: "t5", t: "delegatecall", d: "借用别的合约代码、改写自己存储的调用", at: w("delegatecall", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#used2", { opacity: 0 }, 0);
      X1.walk(tl, "pc", 0, 0.01, [${J(A.ppool.exit)}]);
      // ===== L0 字段齐了，验签的代码，还有三个经典陷阱。
      [0, 1, 2].forEach((i) => pop("#lb-n" + i, ${t(LS[0] + 2.2)} + i * 0.3, 0.3));
      // ===== L1 第一，ecrecover 遇到无效签名，不会报错，而是返回零地址。
      out("#lb-n0, #lb-n1, #lb-n2", ${t(LS[1] - 0.2)}); cam(${t(LS[1])}, "tZero", 1.3);
      pop("#cB", ${t(LS[1] + 1.0)}); hot("#cB-r1", ${t(LS[1] + 1.3)});
      grow("badsig", ${t(LS[1] + 1.6)}); pop("#lb-bad", ${t(LS[1] + 1.9)}, 0.25);
      draw("cvB1", ${t(LS[1] + 3.6)}); pop("#cB-c1", ${t(LS[1] + 3.8)}, 0.25); pop("#lb-ecr", ${t(LS[1] + 4.1)}, 0.25);
      X7.lotPlate(tl, "zero", ${t(LS[1] + 4.1)}, true, 3);
      // ===== L2 如果管理员地址没有初始化，它默认就是零。任何一个无效签名，都能通过。
      hot("#cB-r2", ${t(LS[2] + 0.3)}); draw("cvB2", ${t(LS[2] + 0.5)}); pop("#cB-c2", ${t(LS[2] + 1.0)}, 0.25);
      pop("#lb-adm", ${t(LS[2] + 1.3)}, 0.25); X7.lotPlate(tl, "admin", ${t(LS[2] + 1.3)}, true, 3);
      pop("#lb-eq", ${t(LS[2] + 3.0)}, 0.3); KIT.arm(tl, "gate", ${t(LS[2] + 4.2)}, true); pop("#lb-pass", ${t(LS[2] + 4.5)}, 0.25);
      // ===== L3 第二，签名可塑性：同一条消息，存在两份都有效的签名。
      out("#cB, #cvB1, #cvB2, #lb-bad, #lb-ecr, #lb-adm, #lb-eq, #lb-pass", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "tSigs", 1.2);
      pop("#lb-v0", ${t(LS[3] + 2.8)}, 0.25); pop("#lb-v1", ${t(LS[3] + 3.2)}, 0.25);
      // ===== L4 如果合约拿签名本身，标记已使用，翻转签名里的一个数值，就成了一份新签名。
      grow("used", ${t(LS[4] + 1.0)});
      out("#lb-v1", ${t(LS[4] + 3.0)}); KIT.swap(tl, "#sig1-tag", "#sig1-tag-red", ${t(LS[4] + 3.2)}); pop("#lb-new", ${t(LS[4] + 4.0)}, 0.25);
      // ===== L5 修复是，用 nonce 或消息哈希做标记，再用拒绝这种翻转的库，比如 OpenZeppelin 的 ECDSA。
      pop("#cC", ${t(LS[5] + 0.3)}); pop("#cC-c0", ${t(LS[5] + 0.9)}, 0.25); hot("#cC-r0", ${t(LS[5] + 0.9)});
      KIT.swap(tl, "#used", "#used2", ${t(LS[5] + 1.6)}, 0.4); pop("#cC-c1", ${t(LS[5] + 1.6)}, 0.25);
      out("#lb-new", ${t(LS[5] + 4.3)}); pop("#cC-c3", ${t(LS[5] + 4.6)}, 0.25); draw("cvC3", ${t(LS[5] + 4.8)});
      pop("#lb-rej", ${t(LS[5] + 5.5)}, 0.25); tl.to("#sig1", { opacity: 0.35, duration: 0.4 }, ${t(LS[5] + 5.5)});
      // ===== L6 第三，编码碰撞。紧凑编码会把相邻的动态数据，直接拼在一起。
      out("#cC, #cvC3, #lb-v0, #lb-rej", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "tBytes", 1.3);
      pop("#lb-r0", ${t(LS[6] + 3.6)}, 0.25); pop("#lb-r1", ${t(LS[6] + 4.0)}, 0.25);
      // ===== L7 ab 加 c，和 a 加 bc，结果完全相同。签多个动态类型时，用标准编码。
      pop("#cE", ${t(LS[7] + 0.3)}); pop("#cE-c0", ${t(LS[7] + 2.2)}, 0.25);
      fadeIn("#br0, #br1", ${t(LS[7] + 2.0)}, 0.4); pop("#lb-same", ${t(LS[7] + 2.4)}, 0.25);
      out("#br0, #br1, #bc0, #bc1, #lb-same", ${t(LS[7] + 5.0)}); fadeIn("#bs0, #bs1", ${t(LS[7] + 5.2)}, 0.4);
      hot("#cE-r1", ${t(LS[7] + 5.2)}, "#e3f4ea"); pop("#cE-c1", ${t(LS[7] + 5.4)}, 0.25); pop("#lb-std", ${t(LS[7] + 5.8)}, 0.25);
      // ===== L8 还有一点。合约钱包没有私钥，要用 ERC-1271 的接口校验，不能只靠 ecrecover。
      out("#cE, #bs0, #bs1, #lb-r0, #lb-r1, #lb-std", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "tWallet", 1.2);
      pop("#lb-nokey", ${t(LS[8] + 1.8)}, 0.25); pop("#lb-ecr2", ${t(LS[8] + 4.6)}, 0.25); pop("#lb-1271", ${t(LS[8] + 3.4)}, 0.25);
      // ===== L9 再看 permit 的两面。
      out("#lb-nokey, #lb-ecr2, #lb-1271", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "tPermit", 1.0);
      pop("#lb-face1", ${t(LS[9] + 0.9)}, 0.25); pop("#lb-face2", ${t(LS[9] + 1.2)}, 0.25);
      // ===== L10 一面是抢跑型的拒绝服务。你提交的交易里，带着 permit 签名。
      out("#lb-face2", ${t(LS[10] + 0.3)}); pop("#lb-mine", ${t(LS[10] + 3.0)}, 0.25);
      out("#lb-face1, #lb-mine", ${t(LS[10] + 4.6)}); X1.walk(tl, "pl", ${t(LS[10] + 4.7)}, 0.8, [${J(A.ppool.entry)}]);
      // ===== L11 别人从内存池复制这份签名，抢先单独提交。你的交易因为 nonce 已用，回滚。
      fadeIn("#pc-w", ${t(LS[11] + 0.8)}, 0.3); pop("#lb-copy", ${t(LS[11] + 1.0)}, 0.25);
      X1.walk(tl, "pc", ${t(LS[11] + 2.0)}, 0.9, [${J(PCF)}]);
      X1.walk(tl, "pl", ${t(LS[11] + 3.2)}, 1.4, [${J(A.ppool.exit)}, ${J(PLF)}]);
      X1.walk(tl, "pl", ${t(LS[11] + 4.7)}, 0.5, [${J(A.ppool.exit)}], "back.out(1.6)"); pop("#lb-rev", ${t(LS[11] + 4.9)}, 0.25);
      // ===== L12 修复是，把 permit 包在 try catch 里。失败后，检查授权额度是否已经足够。
      out("#lb-copy, #lb-rev, #pc-w", ${t(LS[12] - 0.1)});
      pop("#cD", ${t(LS[12] + 0.4)}); pop("#cD-c0", ${t(LS[12] + 3.4)}, 0.25);
      X1.walk(tl, "pl", ${t(LS[12] + 3.6)}, 0.8, [${J(PLF)}]);
      hot("#cD-r2", ${t(LS[12] + 4.4)}, "#e3f4ea"); pop("#cD-c2", ${t(LS[12] + 4.6)}, 0.25); draw("cvD2", ${t(LS[12] + 4.7)});
      pop("#cD-c3", ${t(LS[12] + 5.4)}, 0.25); pop("#lb-ok", ${t(LS[12] + 5.6)}, 0.25);
      // ===== L13 另一面是钓鱼。permit 在链下签，不花 gas，钱包常常只显示一串十六进制。
      out("#cD, #cvD2, #lb-ok", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "tPhish", 1.3);
      pop("#lb-free", ${t(LS[13] + 2.6)}, 0.25); pop("#lb-hex", ${t(LS[13] + 4.6)}, 0.25); flash("#ehw-scr", ${t(LS[13] + 4.8)}, 2, 0.3);
      // ===== L14 签下之后，对方可以随时拿去执行。
      out("#lb-free", ${t(LS[14])}); fadeIn("#pl2-w", ${t(LS[14] + 0.1)}, 0.3); grow("thief", ${t(LS[14] + 0.4)});
      X1.walk(tl, "pl2", ${t(LS[14] + 1.0)}, 1.0, [${J(THF)}]);
      grow("eclk2", ${t(LS[14] + 1.4)}); pop("#lb-any", ${t(LS[14] + 1.8)}, 0.25); KIT.clock(tl, "eclk2", ${t(LS[14] + 1.9)}, 1.0, 240);
      // ===== L15 签名再安全，签名人也可能签错东西。
      out("#lb-hex, #lb-any", ${t(LS[15] - 0.2)}); cam(${t(LS[15])}, "F", 1.8);
      [0, 1, 2].forEach((i) => grow("sg" + i, ${t(LS[15] + 1.9)} + i * 0.2));
      // ===== L16 2025 年 2 月，交易所 Bybit 的冷钱包多签被盗。
      pop("#ev-bybit", ${t(LS[16] + 0.3)}); pop("#lb-vault", ${t(LS[16] + 2.4)}, 0.25);
      // ===== L17 按 Sygnia、Verichains 等公开分析，攻击者篡改了 Safe Wallet 的前端，只对 Bybit 的多签地址生效。
      out("#lb-vault", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "desks", 1.2); pop("#ev-src", ${t(LS[17] + 1.0)});
      [0, 1, 2].forEach((i) => KIT.swap(tl, "#dk" + i + "-scr", "#dk" + i + "-scr2", ${t(LS[17] + 4.6)} + i * 0.2, 0.3));
      pop("#lb-only", ${t(LS[17] + 6.4)}, 0.25);
      // ===== L18 签名人看到的，是一笔普通转账。
      out("#ev-src", ${t(LS[18])}); [0, 1, 2].forEach((i) => pop("#lb-see" + i, ${t(LS[18] + 1.2)} + i * 0.2, 0.25));
      // ===== L19 实际签下的，是一次 delegatecall，把钱包的实现，换成恶意合约。
      out("#lb-only", ${t(LS[19])}); [0, 1, 2].forEach((i) => pop("#lb-dc" + i, ${t(LS[19] + 1.2)} + i * 0.2, 0.3));
      KIT.door(tl, "vault", ${t(LS[19] + 3.0)}, 105, 1.0); KIT.swap(tl, "#vault-core", "#vault-core-atk", ${t(LS[19] + 4.0)}, 0.3);
      pop("#lb-core", ${t(LS[19] + 4.3)}, 0.25);
      // ===== L20 多签合约只校验签名对不对、数量够不够。签名是真的，内容不是签名人以为的内容。
      out("#lb-see0, #lb-see1, #lb-see2, #lb-dc0, #lb-dc1, #lb-dc2, #lb-core", ${t(LS[20] - 0.2)}); cam(${t(LS[20])}, "F", 1.2);
      X5.fill(tl, "fm", ${t(LS[20] + 2.2)}, 3, 1.4); pop("#lb-fm", ${t(LS[20] + 5.0)}, 0.25);
      // ===== L21 按事发时估值，损失约 15 亿美元。
      tl.to("#gold circle", { opacity: 1, duration: 0.2, stagger: 0.05 }, ${t(LS[21] + 0.4)}); pop("#lb-loss", ${t(LS[21] + 1.8)}, 0.3);
      // ===== L22 多签防的是一把私钥被盗，防不了所有签名人，看到同一个假界面。
      pop("#kw-ms", ${t(LS[22] + 0.4)}); flash("#dk0-scr2, #dk1-scr2, #dk2-scr2", ${t(LS[22] + 3.4)}, 3, 0.3);
      // ===== L23 2024 年 7 月，印度交易所 WazirX 的多签冷钱包，也是这样。
      out("#kw-ms, #ev-bybit, #lb-loss, #lb-fm, #gold", ${t(LS[23] - 0.2)}); pop("#ev-wx", ${t(LS[23] + 0.3)});
      flash("#dk0-scr2, #dk1-scr2, #dk2-scr2", ${t(LS[23] + 2.2)}, 2, 0.3);
      // ===== L24 界面上是日常交易，硬件钱包签下的，却是升级多签的恶意数据。按公开分析，损失约 2.3 亿美元。
      pop("#lb-daily", ${t(LS[24] + 0.4)}, 0.25);
      KIT.swap(tl, "#hw1-scr", "#hw1-scr2", ${t(LS[24] + 2.4)}, 0.3); pop("#lb-up", ${t(LS[24] + 2.6)}, 0.25); pop("#lb-neq", ${t(LS[24] + 3.4)}, 0.3);
      pop("#lb-loss2", ${t(LS[24] + 6.6)}, 0.25);
      // ===== L25 防御有三条。用硬件钱包逐个字段核对。用独立工具解码交易数据。
      out("#ev-wx, #lb-daily, #lb-up, #lb-neq, #lb-loss2", ${t(LS[25] - 0.2)});
      pop("#ck1", ${t(LS[25] + 1.3)}); [0, 2].forEach((i) => KIT.swap(tl, "#hw" + i + "-scr", "#hw" + i + "-scr2", ${t(LS[25] + 1.6)}, 0.3));
      grow("txd", ${t(LS[25] + 3.6)}); grow("flens", ${t(LS[25] + 3.8)}); pop("#ck2", ${t(LS[25] + 3.8)});
      X5.fly(tl, "flens", ${t(LS[25] + 4.3)}, -70, -20, 0.8); pop("#lb-dec", ${t(LS[25] + 5.2)}, 0.25);
      // ===== L26 对 delegatecall 和修改实现地址的操作，设白名单或额外审批。
      pop("#ck3", ${t(LS[26] + 0.5)}); grow("shd", ${t(LS[26] + 1.0)}); pop("#lb-wl", ${t(LS[26] + 1.4)}, 0.25);
      grow("knife", ${t(LS[26] + 1.8)}); KIT.toggle(tl, "knife", ${t(LS[26] + 2.4)}, false); pop("#lb-ap", ${t(LS[26] + 2.6)}, 0.25);
      pop("#lb-blk", ${t(LS[26] + 3.2)}, 0.25);
`,
});
