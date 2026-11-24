// Generates compositions/story.html for ep02/seg2「② 各管什么」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: kit/objects.mjs + ep02/kit-ext/objects-ext.mjs (import only) + ./props.mjs. World layout: ./layout.mjs (see SPEC.md).
import fs from "node:fs";
import { at, Wp, G, f, camAt, gridSvg, worldSvg, wlab, wpin, wireSvg, dashCurve, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { profMachine, seg1Line, seg1Wide, signboard, plinth, PLINTH_Z, groundFrame, groundRing, groundPath, hashPress } from "./props.mjs";
import * as L from "./layout.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const lift = (svg, z) => X.liftSvg(svg, z);
const off = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

// ---------------------------------------------------------------- objects
const items = [];
const A = {};
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const put = (fn, o, opts, dy = 0, wrap) => { const r = fn(o, opts); A[opts.id] = r.anchors; add(o, wrap ? wrap(r.svg) : r.svg, dy); return r; };

// notice zone: signboard + three exhibits on plinths
put(signboard, L.NOTICE.sign, { id: "sign", line1: "算法几乎从不被破解", line2a: "被攻破的，是", word: "实现" });
L.NOTICE.ex.forEach((o, i) => add(o, plinth(o, "pl" + i, 210, 170), -1));
const big = (o, k) => (s) => { const [x, y] = at(o); return `<g transform="translate(${f(x)},${f(y)}) scale(${k}) translate(${f(-x)},${f(-y)})">${s}</g>`; };
put(X.prngCounter, L.NOTICE.ex[0], { id: "ex0" }, 1, (s) => big(L.NOTICE.ex[0], 1.5)(lift(s, PLINTH_Z / 1.5)));
put(X.die, L.NOTICE.ex[1], { id: "ex1", top: 5, size: 70, z: PLINTH_Z / 1.5 }, 1, big(L.NOTICE.ex[1], 1.5));
put(X.proofCard, L.NOTICE.ex[2], { id: "ex2", missing: true }, 1, (s) => big(L.NOTICE.ex[2], 1.5)(lift(s, PLINTH_Z / 1.5)));
const frames = L.NOTICE.ex.map((o, i) => groundFrame("fr" + i, o, 330, 280));

// production line
put(X.conveyor, { u: L.BELT.u, v: L.BELT.v }, { id: "bt0", len: L.BELT.len, width: L.BELT.width }, -50);
// seg1 end state: Wintermute vault (door open) + mailbox, 256-bit dial, Profanity machine (ghosted) with the 32-bit dial, shaft
{ const S1 = L.S1;
  const v = O.safe(S1.VAULT, { id: "vault", plate: "金库", gold: false, open: 105 });
  const mb = X.addrPlate(S1.MAILBOX, { id: "mb", text: "地址" });
  add(S1.VAULT, v.svg + X.liftSvg(mb.svg, S1.MAILBOX.z));
  add(S1.DIAL256, X.comboDial(S1.DIAL256, { id: "d256", rings: 8 }).svg);
  const d32 = X.comboDial(S1.DIAL32, { id: "d32" });
  const sh = X.shaft(S1.PROF, { id: "sh", a: [S1.SHAFT_A[0] - S1.PROF.u, S1.SHAFT_A[1] - S1.PROF.v, S1.SHAFT_A[2]], b: [S1.SHAFT_B[0] - S1.PROF.u, S1.SHAFT_B[1] - S1.PROF.v, S1.SHAFT_B[2]] });
  items.push({ y: at(S1.PROF)[1], svg: profMachine(S1.PROF, "prof", d32.svg).svg + sh.svg });
}
put(X.lottery, L.S.ent, { id: "ent", glow: true }, -3000);
add(L.S.ent, `<g id="entw" opacity="0">${wireSvg("entw-p", L.S.ent, [[-126, 126, -86, 86, 0, 62], [-92, 92, -96, 96, 92, 284]])}</g>`, -2999);
put(X.mnemonicPlate, L.S.mn, { id: "mn" }, -3000);
put(X.seedJar, L.S.seed, { id: "seed" }, -3000);
put(X.deriveTree, L.S.tree, { id: "tree" }, -3000);
put(O.padlock, L.S.key, { id: "lock" }, -3000);
const plates = L.ADDR_IN.map((d, i) => X.addrPlate(off(L.S.addr, d.du, d.dv), { id: "ad" + i, text: "地址 " + (i + 1) }));
A.ad = plates.map((p) => p.anchors);
const vitInner = lift(plates.map((p) => p.svg).join(""), X.VITRINE_FLOOR);
put(X.vitrine, L.S.addr, { id: "vit", w: L.VIT.w, d: L.VIT.d, h: L.VIT.h, inner: vitInner }, -3000);
put(O.chain, L.CHAIN, { id: "chain", n: 3 });
const zLift0 = 0;
const zLift = (p) => [p[0], p[1] - X.VITRINE_FLOOR * 0.866];
A.ad = A.ad.map((a) => ({ plate: zLift(a.plate), top: zLift(a.top) }));

// signing branch + hash press
put(X.diceCup, L.SIGN.cup, { id: "cup", dice: [3, 5] });
put(O.doc, L.SIGN.msg, { id: "msg", title: "消息" });
put(O.doc, L.SIGN.msg, { id: "msgx", title: "消息", state: "attacker" }, 0.5);
put(O.seal, L.SIGN.seal, { id: "sl", stamped: false, markText: "签名" });
put(X.sigPaper, L.SIGN.out, { id: "sig" });
put(hashPress, L.SIGN.hash, { id: "hp" });

// metaphor zone + attacker workbench
put(O.safe, L.META.safe, { id: "safe", plate: "保险柜" });
L.META.gpu.forEach((o, i) => put(X.gpuRig, o, { id: "gpu" + i, cable: i === 0 ? "cut" : "none" }));
put(O.beacon, L.META.beacon, { id: "bcn" });
items.sort((a, b) => a.y - b.y);

// moving things drawn on top
const thief = O.person(L.META.thief, { id: "thf", role: "attacker" }); A.thf = thief.anchors;
const kfly = O.key(L.S.key, { id: "kf" });
const KF_Z = 150;

// ground layer
let ground = seg1Line() + frames.join("");
ground += groundPath("bpath", L.SIGN.path[0], L.SIGN.path[1]);
ground += groundRing("rEnt", L.S.ent, 230) + groundRing("rCup", L.SIGN.cup, 175);
ground += groundFrame("frMust", off(L.META.thief, 0, -60), 300, 420, "#8a8478");

// tree keys → address plates (teal dashed)
const cvA = A.tree.keys.map((k, i) => dashCurve("cva" + i, k, A.ad[i].plate, { color: "#2aa3c9", c1: [k[0] + 120, k[1] - 120], c2: [A.ad[i].plate[0] - 160, A.ad[i].plate[1] - 120] }));

const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 4600, v0: -1800, v1: 2200 }) + ground + items.map((x) => x.svg).join("\n") +
  cvA.map((c) => c.svg).join("") +
  `<g id="thmv">${thief.svg}</g><g id="kfmv" opacity="0"><g transform="translate(0,${f(-KF_Z * 0.866)})">${kfly.svg}</g></g>`, [-2600, -2400, 7400, 4400]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lab = (id, p, html, cls = "", anc = "b") => { labels += wlab(id, p, html, cls + " hide", anc); };
const dy = (p, d) => [p[0], p[1] + d];
// notice
["随机数不够随机", "nonce 能被算出", "省掉一步证明"].forEach((t, i) => lab("lb-ex" + i, at(L.NOTICE.ex[i], 0, 0, 290), t, "lab-r", "b"));
// L2
lab("lb-key", A.lock.top, "私钥", "lab-cs");
lab("lb-gen", at({ u: -100, v: L.BELT.v }, 0, 0, 200), "生成 · 使用 → 决定安全上限", "");
// L5–L8 metaphor
lab("lb-thf", dy(A.thf.top, 0), "小偷 · 试几万个生日", "lab-r", "b");
lab("lb-must", at(L.META.thief, 170, -60, 0), "必须站在柜前", "lab-g", "l");
lab("lb-pub", A.vit.top, "链上 · 公钥和地址全部公开", "lab-cs");
lab("lb-off", dy(A.gpu0.cut, 20), "离线", "lab-rs", "t");
lab("lb-par", A.gpu1.top, "并行", "lab-rs");
lab("lb-inf", A.gpu2.top, "∞ 无限次", "lab-rs");
lab("lb-al", A.bcn.top, "不触发告警", "lab-g");
// L10–L12
lab("lb-sl", dy(A.sl.top, -10), "签名 · ECDSA / EdDSA", "lab-cs");
lab("lb-forge", at(L.SIGN.seal, -120, 170, 0), "✓ 无私钥不能伪造", "lab-gs", "t");
["私钥质量", "nonce 质量", "用户看没看懂"].forEach((t, i) => lab("lb-no" + i, [at(L.SIGN.cup, 130, 60, 0)[0], at(L.SIGN.cup, 130, 60, 0)[1] - 150 + i * 50], t, "lab-r lab-sm", "l"));
lab("lb-hp1", A.hp.top, "✓ 未被改动", "lab-gs");
lab("lb-hp2", at(L.SIGN.hash, -110, 110, 0), "数据本身对不对 · 不保证", "lab-r", "t");
// L13
lab("lb-mn", A.mn.top, "可抄写 · 可恢复", "lab-gs");
lab("lb-entq", at(L.S.ent, 0, 0, 340), "生成时熵够吗？", "lab-rs");
// L14
lab("lb-hd", A.tree.top, "分层派生", "lab-cs");
lab("lb-bk", A.seed.top, "一份备份 → 恢复全部", "lab-gs");
lab("lb-lk", A.tree.top, "一个种子泄露 → 全部泄露", "lab-rs");
// L15 station names
// seg1's station names (visible from frame 0, as seg1 left them) + its theme label
L.S1.STATIONS.forEach((st, i) => { labels += wlab("lb-st" + i, at({ u: st.u, v: L.S1.LINE.v - 10 }), st.name, "lab-g lab-sm", "t"); });
labels += wlab("lb-line", at({ u: (L.S1.STATIONS[2].u + L.S1.STATIONS[3].u) / 2, v: L.S1.LINE.v - 520 }), "私钥生产线 · 本集主题", "lab-cs lab-xl", "b");
// L16–L18
lab("lb-msg", at(L.SIGN.msg, 0, 0, 80), "消息", "lab-sm");
lab("lb-non", at(L.SIGN.cup, 120, -30, 60), "nonce", "lab-sm", "l");
lab("lb-sig", at(L.SIGN.out, 0, 70, 0), "签名", "lab-cs lab-sm", "t");
lab("lb-f1", A.ent.top, "① 熵", "lab-cs");
lab("lb-f2", at(L.SIGN.cup, 120, -30, 60), "② nonce", "lab-cs", "l");
lab("lb-calc", at(L.S.key, 0, 0, 260), "私钥可被算出", "lab-rs");
lab("lb-c19", at(L.SIGN.msg, -60, 150, 0), "签的内容 · 图上没画", "lab-r", "t");
lab("lb-look", ((p) => [p[0] - 170, p[1]])(at(L.SIGN.msg, -60, 150, 0)), "签之前 · 看清签的是什么", "lab-gs", "t");

// password strip on the safe (77 digits, deterministic)
let seed = 20261114; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const DIG = Array.from({ length: 77 }, () => Math.floor(rnd() * 10));
const cells = DIG.map((d, i) => `<span class="dg" id="dg${i}">${d}</span>`);
const rows = [cells.slice(0, 26), cells.slice(26, 52), cells.slice(52)].map((r) => `<div class="dr">${r.join("")}</div>`).join("");
labels += wpin("pw", at(L.META.safe, -40, 0, 400), `<div class="pwc hide" id="pwc"><div class="pwh">保险柜密码 · <b>77</b> 位数字<span class="pwt hide" id="pwt-bd">前 8 位 = 生日</span></div>${rows}</div>`, "b");

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  start: seg1Wide(camAt, Wp),
  notice: camAt([1980, 150], 960, 540, 0.95),
  line: camAt([-700, -880], 960, 520, 0.66),
  safe: C(L.META.safe.u, L.META.safe.v + 120, 260, 0.96, 1120, 540),
  attack: camAt([1250, -1225], 960, 540, 0.62),
  desk: camAt([440, -820], 1340, 580, 1.0),
  mn: camAt([-1340, -660], 1350, 600, 1.0),
  hd: camAt([-260, -1000], 1380, 600, 0.7),
  sign: camAt([300, -860], 960, 560, 0.85),
};
CAMS.wide = camAt([-330, -960], 960, 500, 0.64);

// ---------------------------------------------------------------- screen overlay
const BOARD = { x: 48, y: 258, w: 760 };  // 下移，把左上 (48, 120) 留给术语卡
const brow = (id, a, b, c) => `<div class="br" id="${id}"><span class="bk">${a}</span><span class="bg hide" id="${id}-g">${b}</span><span class="bn hide" id="${id}-n">${c}</span></div>`;
const board = `<div class="board hide" id="board" style="left:${BOARD.x}px;top:${BOARD.y}px;width:${BOARD.w}px">
  <div class="bh"><span class="bk">原语</span><span class="bg">保护 ✓</span><span class="bn">不保护 ✗</span></div>
  ${brow("r0", "签名", "无私钥不能伪造", "私钥 · nonce 质量<br>用户看没看懂")}
  ${brow("r1", "哈希", "数据没被改动", "数据本身对不对")}
  ${brow("r2", "助记词", "抄写 · 恢复", "生成时熵够不够")}
  ${brow("r3", "分层派生", "一份备份恢复全部", "一个泄露全部泄露")}
</div>`;
// dot-matrix comparison (L4)
const dots = `<div class="dots hide" id="dots">
  <div class="dt" style="left:44px;top:34px">256 位熵 · 要试约 <b>2 的 256 次方</b> 次</div>
  <div class="dfield" style="left:44px;top:100px"></div>
  <div class="dsm" id="dsm"><div class="dt" style="left:0;top:0">32 位熵</div><div class="dt" style="left:0;top:50px">约 <b class="rd">43 亿</b> 次</div>
    <div class="dbox" id="dbox">${Array.from({ length: 36 }, () => "<i></i>").join("")}</div></div>
  <div class="dnote">示意 · 不按比例</div></div>`;
const kwEnt = `<div class="kw hide" id="kwEnt"><b>熵</b> = 随机性的度量 · 单位：<b>位</b></div>`;
const kwMeta0 = `<div class="kw hide" id="kwMeta0">比喻</div>`;
const kwMeta = `<div class="kw hide" id="kwMeta">比喻不成立之处：小偷必须<b class="rd">到场</b></div>`;

// ---------------------------------------------------------------- times
const TM = {
  core: w("核心", 0), impl: w("实现", 0), alg: w("密码学算法", 0),
  r1: w("随机数", 1), n1: w("nonce", 1), p1: w("门限签名", 1),
  key2: w("私钥", 2), gen2: w("生成", 2),
  ent3: w("熵", 3), unit3: w("单位", 3),
  b256: w("256", 4), pow: w("2的256次方", 4), b32: w("只有32位熵", 4), b43: w("43亿", 4),
  meta5: w("打个比方", 5), safe5: w("保险柜", 5), d77: w("77位数字", 5),
  bd6: w("生日", 6), fix6: w("固定数字", 6), thief6: w("小偷", 6), try6: w("几万个生日", 6),
  no7: w("不成立", 7), must7: w("必须站在", 7),
  pub8: w("全部公开", 8), off8: w("离线", 8), par8: w("并行", 8), inf8: w("无限次", 8), al8: w("告警", 8),
  prim9: w("原语", 9),
  sig10: w("ECDSA", 10), forge10: w("无法伪造", 10),
  q11: w("私钥和nonce的质量", 11), view11: w("看没看懂", 11),
  hash12: w("哈希", 12), mod12: w("没被改动", 12), right12: w("数据本身", 12),
  mn13: w("助记词", 13), rec13: w("恢复钱包", 13), ent13: w("熵够不够", 13),
  hd14: w("分层派生", 14), set14: w("一组地址", 14), bk14: w("一份备份", 14), leak14: w("泄露", 14), all14: w("全部泄露", 14),
  chain15: w("整条链路", 15), ent15: w("随机数源", 15), mn15: w("助记词", 15), seed15: w("种子", 15), key15: w("私钥", 15), addr15: w("地址", 15),
  sig16: w("签名时", 16), key16: w("私钥", 16), msg16: w("消息", 16), n16: w("nonce", 16), calc16: w("算出签名", 16),
  two17: w("两处", 17), ent17: w("熵", 17), n17: w("nonce", 17), err17: w("任何一处出错", 17), calc17: w("算出来", 17),
  draw18: w("没画的", 18), atk18: w("攻击者的交易", 18), look18: w("看清", 18),
};

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "nonce", t2: "每次签名都要用的一次性数值", at: w("nonce", 1), dur: 3.1 },
  { id: "tc2", t1: "门限签名", t2: "多方各持分片 · 合作产生签名", at: w("nonce", 1) + 3.35, dur: 3.3 },
  { id: "tc3", t1: "公钥", t2: "由私钥算出 · 地址由它而来 · 可公开", at: w("公钥", 8) },
  { id: "tc4", t1: "原语", t2: "签名、哈希这类密码学基本组件", at: w("原语", 9), dur: 2.7 },
  { id: "tc5", t1: "ECDSA / EdDSA", t2: "签名算法 · 以太坊、Solana 等链都在用", at: w("ECDSA", 10) },
  { id: "tc6", t1: "哈希", t2: "由数据算出的指纹 · 数据一改就对不上", at: w("哈希", 12) },
  { id: "tc7", t1: "助记词", t2: "和种子一一对应 · 可抄写的钱包备份", at: w("助记词", 13) },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .lab-xl { font-size: 56px; font-weight: 900; padding: 6px 28px 10px; border-radius: 16px; letter-spacing: 0.02em; }
    .kw { position: absolute; left: 56px; top: 108px; font-size: 44px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; } .kw b.rd { color: #e0453a; }
    .board { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 18px 24px 14px; }
    .board .bh, .board .br { display: flex; align-items: center; gap: 12px; }
    .board .bh { height: 58px; border-bottom: 3px solid #1c1c1c; font-size: 30px; font-weight: 900; }
    .board .br { min-height: 86px; border-bottom: 2px dashed #e2ddd3; }
    .board .bk { width: 150px; flex: none; font-size: 30px; font-weight: 900; }
    .board .bg, .board .bn { flex: 1; font-size: 28px; font-weight: 800; line-height: 1.25; }
    .board .bh .bg { color: #1f9d55; } .board .bh .bn { color: #e0453a; }
    .board .br .bg { color: #17804a; } .board .br .bn { color: #c3352b; }
    .dots { position: absolute; left: 150px; top: 120px; width: 1620px; height: 720px; background: #fffdf8; border-radius: 22px; box-shadow: 0 16px 36px rgba(70,60,40,0.14); overflow: hidden; }
    .dots .dt { position: absolute; font-size: 36px; font-weight: 900; white-space: nowrap; }
    .dots .dt b { color: #1d93ba; } .dots .dt b.rd { color: #e0453a; }
    .dots .dfield { position: absolute; width: 1000px; height: 560px; border-radius: 10px; background-color: #f1ede5;
      background-image: radial-gradient(circle, #1f9d55 1.3px, transparent 1.6px); background-size: 5px 5px; }
    .dots .dsm { position: absolute; left: 1120px; top: 34px; width: 460px; height: 620px; }
    .dots .dbox { position: absolute; left: 120px; top: 230px; width: 209px; display: grid; grid-template-columns: repeat(6, 24px); gap: 7px; padding: 12px; border: 3px dashed #e0453a; border-radius: 12px; }
    .dots .dbox i { display: block; width: 24px; height: 24px; border-radius: 50%; background: #e0453a; }
    .dots .dnote { position: absolute; right: 40px; bottom: 26px; font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 10px; padding: 4px 14px 6px; }
    .pwc { background: #fffdf8; border-radius: 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); padding: 12px 18px 14px; }
    .pwc .pwh { font-size: 30px; font-weight: 900; white-space: nowrap; margin-bottom: 8px; display: flex; gap: 14px; align-items: center; }
    .pwc .pwh b { color: #1d93ba; }
    .pwc .pwt { font-size: 28px; font-weight: 800; color: #ffffff; background: #1d93ba; border-radius: 8px; padding: 0 12px 2px; }
    .pwc .dr { display: flex; gap: 2px; }
    .pwc .dg { width: 26px; text-align: center; font-family: "JetBrains Mono", monospace; font-size: 32px; font-weight: 800; color: #1c1c1c; line-height: 42px; border-radius: 4px; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${kwEnt}${kwMeta0}${kwMeta}${board}${dots}

      ${termHtml(TERMS)}      ${pills(2, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 各管什么</div><div class="t-sub">两处随机性 · 每种原语保护什么</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const hidden = ["sign", "pl0", "pl1", "pl2", "ex0", "ex1", "ex2", "bt0", "ent", "mn", "seed", "tree", "lock", "vit", "chain",
        "cup", "msg", "sl", "sig", "hp", "safe", "gpu0", "gpu1", "gpu2", "bcn", "thf"];
      hidden.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.3, ease: "power2.in" }, t); };
      const move = (id, t, dx, dy, dur, ease) => tl.to("#" + id, { x: dx, y: dy, duration: dur, ease: ease || "power2.inOut" }, t);

      KIT.camSet(tl, CAMS.start);
      // seg1's dials were left turned; match roughly
      KIT.dialTurn(tl, "d256", 0, 270, 0.01);
      const padOut = (id, t) => out("#" + id, t, 0.35);
      out("#lb-line, #lb-st0, #lb-st1, #lb-st2, #lb-st3, #lb-st4, #lb-st5", 0.3, 0.3);
      KIT.cam(tl, 0.8, CAMS.notice, 1.6);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 notice: algorithms are rarely broken; implementations are
      grow("sign", ${f(TM.core - 0.4)}, 0.6);
      tl.set("#sign-word", { opacity: 0.15 }, 0);
      tl.fromTo("#sign-word", { opacity: 0.15, scale: 1.25, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.impl)});
      // ===== L1 three implementation failures
      [["ex0", "r1"], ["ex1", "n1"], ["ex2", "p1"]].forEach(([id, k], i) => {
        const t = { r1: ${f(TM.r1)}, n1: ${f(TM.n1)}, p1: ${f(TM.p1)} }[k];
        grow("pl" + i, t - 0.3, 0.3); grow(id, t - 0.1, 0.4); fadeIn("#fr" + i, t + 0.2, 0.3); pop("#lb-ex" + i, t + 0.3);
      });
      KIT.tick(tl, "ex0", ${f(TM.r1 + 0.4)}, 3, 1.2);
      KIT.roll(tl, "ex1-d", ${f(TM.n1 + 0.3)}, 2); KIT.roll(tl, "ex1-d", ${f(TM.n1 + 0.6)}, 6);
      // ===== L2 the key at the end of a belt: generation and use set the ceiling
      out("#lb-ex0, #lb-ex1, #lb-ex2", ${f(LS[2] - 0.3)});
      KIT.cam(tl, ${f(LS[2] - 0.45)}, CAMS.line, 1.6);
      ["sign", "pl0", "pl1", "pl2", "ex0", "ex1", "ex2"].forEach((id) => shrink(id, ${f(LS[2] + 1.4)}));
      out("#fr0, #fr1, #fr2", ${f(LS[2] + 1.4)});
      ["vault", "mb", "d256", "prof", "sh"].forEach((id) => shrink(id, ${f(LS[2] + 0.2)}));
      grow("bt0", ${f(LS[2] + 0.9)}, 0.5); padOut("ln-belt", ${f(LS[2] + 0.9)});
      grow("lock", ${f(TM.key2 + 0.3)}, 0.5); padOut("ln-p4", ${f(TM.key2 + 0.3)}); pop("#lb-key", ${f(TM.key2 + 0.6)});
      KIT.belt(tl, "bt0", ${f(TM.gen2 - 0.3)}, 3.0, 220);
      pop("#lb-gen", ${f(TM.gen2)});
      // ===== L3 entropy definition
      pop("#kwEnt", ${f(TM.ent3)}, 0.3);
      // ===== L4 dot matrix: 2^256 vs ~4.3 billion
      out("#kwEnt", ${f(LS[4] - 0.1)});
      pop("#dots", ${f(TM.b256 - 0.1)}, 0.35);
      tl.set("#dsm", { opacity: 0 }, 0); fadeIn("#dsm", ${f(TM.b32)}, 0.3);
      tl.to(".dfield", { opacity: 0.3, duration: 0.5 }, ${f(TM.b43 - 0.4)});
      tl.fromTo("#dbox", { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.45, duration: 0.9, ease: "power2.inOut", immediateRender: false }, ${f(TM.b43 - 0.4)});
      // ===== L5 metaphor: a safe with a 77-digit code
      out("#dots", ${f(LS[5] - 0.15)}, 0.3);
      out("#lb-key, #lb-gen", ${f(LS[5] - 0.15)});
      KIT.cam(tl, ${f(TM.b43 + 0.9)}, CAMS.safe, 1.4);
      grow("safe", ${f(TM.meta5 + 0.1)}, 0.5); pop("#kwMeta0", ${f(TM.meta5)}, 0.3);
      pop("#pwc", ${f(TM.d77 - 0.2)}, 0.35);
      // ===== L6 birthday + fixed digits; the thief tries birthdays
      const BD = 8;
      for (let i = BD; i < 77; i++) tl.to("#dg" + i, { color: "#c4bcae", duration: 0.25 }, ${f(TM.fix6)} + (i - BD) * 0.004);
      for (let i = 0; i < BD; i++) tl.to("#dg" + i, { color: "#ffffff", backgroundColor: "#1d93ba", duration: 0.2 }, ${f(TM.bd6)} + i * 0.03);
      pop("#pwt-bd", ${f(TM.bd6 + 0.2)});
      grow("thf", ${f(TM.thief6 - 0.2)}, 0.4); pop("#lb-thf", ${f(TM.thief6 + 0.2)});
      { const o = { k: 0 }, N = 60, A0 = ${JSON.stringify(DIG.slice(0, 8))};
        tl.fromTo(o, { k: 0 }, { k: 1, duration: ${f(LS[8] - TM.try6 + 0.2)}, ease: "none", immediateRender: false, onUpdate: function () {
          const s = Math.floor(o.k * N);
          for (let i = 0; i < 8; i++) $("dg" + i).textContent = o.k >= 1 || o.k <= 0 ? A0[i] : ((s * (7 + i * 3) + i * 5) % 10);
        } }, ${f(TM.try6 - 0.3)}); }
      // ===== L7 where the metaphor fails: the thief must stand at the safe
      out("#kwMeta0", ${f(TM.no7 - 0.2)}, 0.2); pop("#kwMeta", ${f(TM.no7)}, 0.3);
      fadeIn("#frMust", ${f(TM.must7 - 0.2)}, 0.3); pop("#lb-must", ${f(TM.must7)});
      // ===== L8 on-chain: public, offline, parallel, unlimited, no alarm  (key frame 1)
      out("#kwMeta, #lb-thf, #lb-must, #frMust, #pwc", ${f(LS[8] - 0.1)});
      KIT.cam(tl, ${f(LS[8] - 0.15)}, CAMS.attack, 1.3);
      grow("vit", ${f(LS[8] + 0.2)}, 0.5); grow("chain", ${f(LS[8] + 0.4)}, 0.5); padOut("ln-p5", ${f(LS[8] + 0.2)}); padOut("ln-ch", ${f(LS[8] + 0.4)});
      pop("#lb-pub", ${f(TM.pub8 - 0.1)});
      grow("gpu0", ${f(TM.pub8 + 0.4)}, 0.5); grow("bcn", ${f(TM.pub8 + 0.6)}, 0.4);
      move("thmv", ${f(TM.pub8 + 0.2)}, ${f(Wp(L.META.thiefAtGpu.u - L.META.thief.u, L.META.thiefAtGpu.v - L.META.thief.v)[0])}, ${f(Wp(L.META.thiefAtGpu.u - L.META.thief.u, L.META.thiefAtGpu.v - L.META.thief.v)[1])}, 1.4);
      pop("#lb-off", ${f(TM.off8)});
      grow("gpu1", ${f(TM.par8 - 0.1)}, 0.4); grow("gpu2", ${f(TM.par8 + 0.1)}, 0.4); pop("#lb-par", ${f(TM.par8 + 0.2)});
      [0, 1, 2].forEach((i) => KIT.fans(tl, "gpu" + i, ${f(TM.off8)} + i * 0.25, ${f(LS[9] - TM.off8 - 0.4)}, 3));
      pop("#lb-inf", ${f(TM.inf8)});
      pop("#lb-al", ${f(TM.al8 - 0.3)});
      // ===== L9 which primitive protects what: board
      out("#lb-pub, #lb-off, #lb-par, #lb-inf, #lb-al", ${f(LS[9] - 0.1)});
      KIT.cam(tl, ${f(LS[9] - 0.15)}, CAMS.desk, 1.2);
      pop("#board", ${f(TM.prim9)}, 0.35);
      out("#thmv", ${f(LS[9] - 0.1)}, 0.3); out("#chain", ${f(LS[9] - 0.1)}, 0.3); fadeIn("#chain", ${f(LS[15])}, 0.4);
      ["gpu0", "gpu1", "gpu2", "bcn", "safe"].forEach((id) => shrink(id, ${f(LS[9] - 0.1)}));
      ["#r0", "#r1", "#r2", "#r3"].forEach((r, i) => tl.to(r + " .bk", { color: "#1d93ba", duration: 0.2 }, ${f(TM.sig10)} + [0, ${f(TM.hash12 - TM.sig10)}, ${f(TM.mn13 - TM.sig10)}, ${f(TM.hd14 - TM.sig10)}][i]));
      // ===== L10 signatures: no key → no forgery
      grow("sl", ${f(LS[9] + 1.2)}, 0.4); padOut("ln-br", ${f(LS[9] + 1.2)}); grow("msg", ${f(LS[9] + 1.4)}, 0.4);
      pop("#lb-sl", ${f(TM.sig10 + 0.2)});
      
      KIT.stamp(tl, "sl", ${f(TM.forge10 - 1.6)});
      pop("#lb-forge", ${f(TM.forge10)});
      pop("#r0-g", ${f(TM.forge10)}, 0.3);
      // ===== L11 what signatures don't manage
      grow("cup", ${f(TM.q11 - 0.4)}, 0.4);
      pop("#lb-no0", ${f(TM.q11)}); pop("#lb-no1", ${f(TM.q11 + 0.6)}); pop("#lb-no2", ${f(TM.view11)});
      pop("#r0-n", ${f(TM.q11 + 0.3)}, 0.3);
      // ===== L12 hash
      out("#lb-no0, #lb-no1, #lb-no2, #lb-forge", ${f(LS[12] - 0.15)});
      grow("hp", ${f(TM.hash12 - 0.3)}, 0.4); 
      tl.fromTo("#hp-pl", { y: 0 }, { y: 62, duration: 0.25, ease: "power3.in", immediateRender: false }, ${f(TM.hash12 + 0.3)});
      tl.to("#hp-pl", { y: 0, duration: 0.4, ease: "power2.out" }, ${f(TM.hash12 + 0.6)});
      fadeIn("#hp-fp", ${f(TM.hash12 + 0.55)}, 0.2);
      pop("#lb-hp1", ${f(TM.mod12)}); pop("#r1-g", ${f(TM.mod12)}, 0.3);
      pop("#lb-hp2", ${f(TM.right12)}); pop("#r1-n", ${f(TM.right12)}, 0.3);
      // ===== L13 mnemonic
      out("#lb-hp1, #lb-hp2, #lb-sl", ${f(LS[13] - 0.15)});
      KIT.cam(tl, ${f(LS[13] - 0.2)}, CAMS.mn, 1.0);
      grow("mn", ${f(TM.mn13 - 0.1)}, 0.45); padOut("ln-p1", ${f(TM.mn13 - 0.1)});
      
      pop("#lb-mn", ${f(TM.rec13 - 0.2)}); pop("#r2-g", ${f(TM.rec13 - 0.2)}, 0.3);
      fadeIn("#entw", ${f(TM.ent13 - 0.6)}, 0.3); padOut("ln-p0", ${f(TM.ent13 - 0.6)}); pop("#lb-entq", ${f(TM.ent13 - 0.4)}); pop("#r2-n", ${f(TM.ent13 - 0.4)}, 0.3);
      // ===== L14 HD derivation: one seed → many addresses; one leak → all leak
      out("#lb-mn, #lb-entq, #entw", ${f(LS[14] - 0.15)});
      KIT.cam(tl, ${f(LS[14] - 0.2)}, CAMS.hd, 1.1);
      grow("seed", ${f(TM.hd14 - 0.2)}, 0.4); grow("tree", ${f(TM.hd14 + 0.1)}, 0.6); padOut("ln-p2", ${f(TM.hd14 - 0.2)}); padOut("ln-p3", ${f(TM.hd14 + 0.1)});
      pop("#lb-hd", ${f(TM.hd14 + 0.4)}); 
      [0, 1, 2].forEach((i) => { KIT.draw(tl, "cva" + i, ${f(TM.set14 - 0.6)} + i * 0.2, 0.7); KIT.rot(tl, "ad" + i + "-flag", ${f(TM.set14)} + i * 0.2, -90, 0.4); });
      pop("#lb-bk", ${f(TM.bk14)}); pop("#r3-g", ${f(TM.bk14)}, 0.3);
      KIT.swap(tl, "#seed-seed", "#seed-seed-atk", ${f(TM.leak14 - 0.2)}, 0.25);
      KIT.leak(tl, "tree", ${f(TM.leak14 + 0.1)}, 0.14);
      [0, 1, 2].forEach((i) => tl.to("#cva" + i + " path[stroke]", { attr: { stroke: "#e0453a" }, duration: 0.2 }, ${f(TM.all14)} + i * 0.1));
      out("#lb-hd", ${f(TM.leak14 - 0.3)}, 0.15); pop("#lb-lk", ${f(TM.leak14 - 0.1)}); pop("#r3-n", ${f(TM.all14 - 0.2)}, 0.3);
      // ===== L15 the whole chain, station by station
      out("#board, #lb-bk, #lb-lk, #lb-hd, #cva0, #cva1, #cva2", ${f(LS[15] - 0.1)}, 0.3);
      KIT.swap(tl, "#seed-seed-atk", "#seed-seed", ${f(LS[15])}, 0.3);
      KIT.leak(tl, "tree", ${f(LS[15])}, 0.02, true);
      fadeIn("#lb-st0, #lb-st1, #lb-st2, #lb-st3, #lb-st4, #lb-st5", ${f(LS[15] + 0.1)}, 0.3);
      KIT.cam(tl, ${f(LS[15] - 0.15)}, CAMS.wide, 1.4);
      grow("ent", ${f(TM.ent15 - 0.3)}, 0.5);
      KIT.drum(tl, "ent", ${f(TM.ent15)}, 2.0, 1.5);
      [${f(TM.ent15)}, ${f(TM.mn15)}, ${f(TM.seed15)}, ${f(TM.seed15 + 0.6)}, ${f(TM.key15)}, ${f(TM.addr15)}].forEach((t, i) => {
        tl.to("#lb-st" + i, { backgroundColor: "#1d93ba", borderColor: "#1d93ba", color: "#ffffff", duration: 0.2 }, t);
        tl.fromTo("#lb-st" + i, { scale: 1 }, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1, immediateRender: false }, t); });
      KIT.belt(tl, "bt0", ${f(TM.ent15)}, ${f(TM.addr15 - TM.ent15 + 0.6)}, 360);
      // ===== L16 signing branch: key + message + nonce → signature
      KIT.cam(tl, ${f(LS[16] - 0.2)}, CAMS.sign, 1.1);
      fadeIn("#bpath", ${f(TM.sig16)}, 0.4);
      fadeIn("#kfmv", ${f(TM.key16 - 0.1)}, 0.2);
      { const d = [${f(at(L.SIGN.seal, -40, -30, 30)[0] - at(L.S.key, 0, 0, KF_Z)[0])}, ${f(at(L.SIGN.seal, -40, -30, 30)[1] - at(L.S.key, 0, 0, KF_Z)[1])}];
        tl.fromTo("#kfmv", { x: 0, y: 0 }, { x: d[0], y: d[1], duration: 1.0, ease: "power2.inOut", immediateRender: false }, ${f(TM.key16)}); }
      pop("#lb-msg", ${f(TM.msg16)});
      KIT.cupShake(tl, "cup", ${f(TM.n16 - 0.2)}, 0.7); KIT.roll(tl, "cup-d0", ${f(TM.n16 + 0.1)}, 6); KIT.roll(tl, "cup-d1", ${f(TM.n16 + 0.2)}, 2);
      pop("#lb-non", ${f(TM.n16)});
      tl.set("#sl-mark", { opacity: 0 }, ${f(TM.calc16 - 0.6)});
      KIT.stamp(tl, "sl", ${f(TM.calc16 - 0.6)});
      out("#kfmv", ${f(TM.calc16 + 0.1)}, 0.2);
      grow("sig", ${f(TM.calc16 + 0.2)}, 0.45); pop("#lb-sig", ${f(TM.calc16 + 0.5)});
      // ===== L17 two places need randomness; either fails → key computable (key frame)
      out("#lb-msg, #lb-non", ${f(LS[17] - 0.1)});
      KIT.cam(tl, ${f(LS[17] - 0.15)}, CAMS.wide, 1.2);
      fadeIn("#rEnt", ${f(TM.two17)}, 0.3); fadeIn("#rCup", ${f(TM.two17)}, 0.3);
      pop("#lb-f1", ${f(TM.ent17 - 0.1)}); pop("#lb-f2", ${f(TM.n17 - 0.1)});
      ["#rEnt-c", "#rCup-c"].forEach((s, i) => {
        tl.to(s, { attr: { stroke: "#e0453a", fill: "rgba(224,69,58,0.18)" }, duration: 0.15 }, ${f(TM.err17)} + i * 0.35);
        tl.to(s, { attr: { stroke: "#2aa3c9", fill: "rgba(42,163,201,0.16)" }, duration: 0.2 }, ${f(TM.err17 + 0.6)} + i * 0.35);
      });
      tl.to("#lb-f1, #lb-f2", { backgroundColor: "#e0453a", borderColor: "#e0453a", duration: 0.15 }, ${f(TM.err17)});
      tl.to("#lb-f1, #lb-f2", { backgroundColor: "#1d93ba", borderColor: "#1d93ba", duration: 0.2 }, ${f(TM.err17 + 0.9)});
      KIT.broke(tl, "lock", ${f(TM.calc17 - 0.6)}, { ghost: 0.35 });
      pop("#lb-calc", ${f(TM.calc17 - 0.6)});
      // ===== L18 not drawn: the content being signed → look before you sign
      KIT.swap(tl, "#msg", "#msgx", ${f(TM.atk18 - 0.3)}, 0.3);
      pop("#lb-c19", ${f(TM.atk18)});
      out("#lb-c19", ${f(TM.look18 - 0.45)}, 0.2); pop("#lb-look", ${f(TM.look18 - 0.2)});
      tl.set({}, {}, ${f(TOTAL)});

      ${termJs(TERMS)}      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
// frame-0 safety: objects that start hidden carry opacity 0 in the markup (KIT.grow restores opacity 1 when they rise)
const HIDE0 = ["sign", "pl0", "pl1", "pl2", "ex0", "ex1", "ex2", "bt0", "ent", "mn", "seed", "tree", "lock", "vit", "chain", "cup", "msg", "msgx", "sl", "sig", "hp", "safe", "gpu0", "gpu1", "gpu2", "bcn", "thf"];
let out = html;
for (const id of HIDE0) { const k = `<g id="${id}" `; if (!out.includes(k)) throw new Error("no " + id); out = out.replace(k, `<g id="${id}" style="opacity:0" `); }
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), out);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
