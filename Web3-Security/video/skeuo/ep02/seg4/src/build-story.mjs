// Generates compositions/story.html for ep02/seg4「④ nonce泄密」.
// Run: node src/build-story.mjs
// One isometric world: the signing branch off the private-key line. Stations run along +canvas-X:
//  S0 signing desk · S1 public vitrine (reuse) · S2 cloth (metaphor) · S3 bias · S4 computable ·
//  S5 RFC 6979 k-machine · S6 Android 2013 · S7 2019 lattice · S8 SecondFi 2026 · S9 lesson.
import fs from "node:fs";
import { G, at, f, CE, Wp, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, checkSvg } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wrap, glassCup, latticeTile, casing, pedestal, walletScreen } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const LE = (i) => L(i).end;

// ---------------------------------------------------------------- stations
// World anchor shared with seg1 (ep02/seg1/src/layout.mjs): line at v = LINE.v, ⑤ private key at u = 1060,
// signing branch from ⑤ toward +v to SIGN_DESK. Later stations sit to the right of the desk (canvas +X).
import { LINE, STATIONS, SIGN_DESK } from "../../seg1/src/layout.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";
const DESK = Wp(SIGN_DESK.u, SIGN_DESK.v, 0);
const BY = DESK[1];
const SX = [DESK[0], 1300, 2600, 3900, 5200, 6500, 7900, 9200, 10500, 12300].map((x, i) => (i ? DESK[0] + x : x));
const P = (i, dx = 0, dy = 0) => G(SX[i] + dx, BY + dy);
const camS = (i, dx = 0, dy = -110, k = 1.3, sx = 1000, sy = 600) => camAt([SX[i] + dx, BY + dy], sx, sy, k);

const items = [];
const A = {};
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(o, r.svg, dy); return r; };

// ---- S0 the ⑤ private-key station on the line, a branch toward +v, the signing desk
const K5 = { u: STATIONS[4].u, v: LINE.v };
const o0 = { lock: { u: K5.u, v: K5.v + 150 }, belt: { u: K5.u, v: K5.v }, board: { u: SIGN_DESK.u - 60, v: SIGN_DESK.v - 210 },
  cup: { u: SIGN_DESK.u - 230, v: SIGN_DESK.v + 40 }, seal: { u: SIGN_DESK.u + 40, v: SIGN_DESK.v + 40 }, sig: { u: SIGN_DESK.u + 330, v: SIGN_DESK.v + 80 } };
put("belt0", X.conveyor(o0.belt, { id: "belt0", len: 760, width: 2 * LINE.half }), o0.belt);
put("lock0", O.padlock(o0.lock, { id: "lock0" }), o0.lock);
{ // branch track: a flat steel lane from the line to the desk
  const u0 = K5.u - 60, u1 = K5.u + 60, v0 = K5.v + 220, v1 = SIGN_DESK.v - 120;
  const q = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => Wp(u, v, 0));
  const dash = [Wp(K5.u, v0, 0), Wp(K5.u, v1, 0)];
  add({ u: K5.u, v: v0 }, `<g id="lane0"><polygon points="${q.map((p) => f(p[0]) + "," + f(p[1])).join(" ")}" fill="#ddd7cb" stroke="#c3bbac" stroke-width="2"/><path d="M${f(dash[0][0])} ${f(dash[0][1])}L${f(dash[1][0])} ${f(dash[1][1])}" stroke="#1d93ba" stroke-width="5" stroke-dasharray="18 14"/></g>`, -1);
}
put("ec", X.curveBoard(o0.board, { id: "ec" }), o0.board);
put("cup0", X.diceCup(o0.cup, { id: "cup0", dice: [2, 5] }), o0.cup);
put("seal0", O.seal(o0.seal, { id: "seal0", stamped: false, text: "签名", markText: "签名" }), o0.seal);
put("sig0", X.sigPaper(o0.sig, { id: "sig0" }), o0.sig);

// ---- S1 two signatures with the same k → public vitrine → solve
const vo = P(1, 0, 0);
const s1o = { u: vo.u - 175, v: vo.v + 20 }, s2o = { u: vo.u + 15, v: vo.v + 20 };
const h1o = { u: vo.u + 190, v: vo.v - 55 }, h2o = { u: vo.u + 190, v: vo.v + 65 };
const s1 = X.sigPaper(s1o, { id: "s1", title: "签名 1" }), s2 = X.sigPaper(s2o, { id: "s2", title: "签名 2" });
const h1 = O.doc(h1o, { id: "h1", title: "哈希 1", w: 120, h: 100, lines: ["", ""] }), h2 = O.doc(h2o, { id: "h2", title: "哈希 2", w: 120, h: 100, lines: ["", ""] });
const inner1 = X.liftSvg(`<g id="h1w">${h1.svg}</g>` + s1.svg + `<g id="h2w">${h2.svg}</g>` + s2.svg, X.VITRINE_FLOOR);
let vit1 = X.vitrine(vo, { id: "vit1", w: 580, d: 260, h: 250, inner: inner1 });
// mark the glass parts so they can stay invisible until "公开"
vit1.svg = vit1.svg.replace(/<polygon points="([^"]+)" fill="rgba\(208,234,244,0\.28\)"/g, '<polygon class="vback" points="$1" fill="rgba(208,234,244,0.28)"');
put("vit1", vit1, vo);
const tagLift = (p) => [p[0], p[1] - X.VITRINE_FLOOR * CE];
A.s1 = { tag: tagLift(s1.anchors.tag), top: tagLift(s1.anchors.top) }; A.s2 = { tag: tagLift(s2.anchors.tag), top: tagLift(s2.anchors.top) };
const d1o = { u: s1o.u + 10, v: vo.v + 210 }, d2o = { u: s2o.u + 10, v: vo.v + 210 };
put("dA", X.die(d1o, { id: "dA", top: 4, size: 52 }), d1o);
put("dB", X.die(d2o, { id: "dB", top: 4, size: 52 }), d2o);
const atkO = P(1, 520, 70);
put("atk1", O.person(atkO, { id: "atk1", role: "attacker" }), atkO);
const rk1o = P(1, 330, 150);
put("rk1", O.key(rk1o, { id: "rk1", state: "attacker" }), rk1o);
const rlink = `<path id="rlink" d="M${f(A.s1.tag[0] + 14)} ${f(A.s1.tag[1])}Q${f((A.s1.tag[0] + A.s2.tag[0]) / 2)} ${f(A.s1.tag[1] - 90)} ${f(A.s2.tag[0] - 14)} ${f(A.s2.tag[1])}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 9" opacity="0"/>`;
items.push({ y: 1e6, svg: rlink });

// ---- S2 cloth metaphor
const clo = P(2, 0, 40);
const cl1 = X.cloth(clo, { id: "cl1" });
const cl2 = X.cloth(clo, { id: "cl2" });
A.cl1 = cl1.anchors;
add(clo, `<g id="st2">${wrap("cl1w", clo, cl1.svg)}<g id="cl2-mv" opacity="0">${cl2.svg}</g></g>`);

// ---- S3 bias: blackened die, a growing pile of signatures, lattice, red key
const o3 = { die: P(3, -330, 40), pile: P(3, -20, 20), lat: P(3, 330, 40), key: P(3, 470, -170) };
put("bd", X.die(o3.die, { id: "bd", top: 3, size: 96, black: true }), o3.die);
const NP = 9;
for (let k = 0; k < NP; k++) {
  const d = O.doc(o3.pile, { id: "pl" + k, title: "签名", w: 150, h: 180, lines: ["", ""] });
  items.push({ y: at(o3.pile)[1] + 0.01 * k, svg: `<g id="pl${k}-mv" opacity="0">${X.liftSvg(d.svg, 6 + k * 9)}</g>` });
}
A.pile = { top: at(o3.pile, 0, 0, 6 + NP * 9 + 40) };
put("lat3", latticeTile(o3.lat, { id: "lat3", hot: false }), o3.lat);
put("rk3", O.key(o3.key, { id: "rk3", state: "attacker" }), o3.key);

// ---- S4 computable: public data → glass cup → one signature → red key
const o4 = { vit: P(4, -380, -60), cup: P(4, 0, 60), sig: P(4, 300, 40), key: P(4, 500, 130) };
const pub4 = O.doc({ u: o4.vit.u, v: o4.vit.v }, { id: "pd4", title: "交易数据", w: 150, h: 110, lines: ["", ""] });
put("vit4", X.vitrine(o4.vit, { id: "vit4", w: 240, d: 180, h: 170, inner: X.liftSvg(pub4.svg, X.VITRINE_FLOOR) }), o4.vit);
const cup4 = X.diceCup(o4.cup, { id: "cup4", dice: [6, 1] });
const gl4 = glassCup(o4.cup, { id: "gl4" });
A.cup4 = cup4.anchors;
add(o4.cup, `<g id="cup4w" data-ox="${f(at(o4.cup)[0])}" data-oy="${f(at(o4.cup)[1])}">${cup4.svg}<g id="gl4w" opacity="0">${gl4.svg}</g></g>`);
put("sig4", X.sigPaper(o4.sig, { id: "sig4" }), o4.sig);
put("rk4", O.key(o4.key, { id: "rk4", state: "attacker" }), o4.key);
const dc4 = dashCurve("dc4", A.vit4.top, [A.cup4.top[0] - 20, A.cup4.top[1] + 10], { color: "#1d93ba", c1: [A.vit4.top[0] + 120, A.vit4.top[1] - 120], c2: [A.cup4.top[0] - 80, A.cup4.top[1] - 160] });
items.push({ y: 1e6, svg: dc4.svg });

// ---- S5 RFC 6979: green k machine fed by private key + message; a modified one missing the key pipe
const o5 = { km: P(5, -120, 40), km2: P(5, 560, 120) };
const kmBuild = (id, o, missing) => {
  const r = X.kMachine(o, { id, missing });
  const kIn = { u: o.u - 270, v: o.v - 8 }, mIn = { u: o.u + 30, v: o.v - 250 };
  const lock = O.padlock(kIn, { id: id + "-lk" });
  const ped = pedestal(kIn, { r: 40, z: 168 });
  const msg = O.doc(mIn, { id: id + "-msg", title: "消息", standing: true, w: 110, h: 120, lines: ["", ""] });
  const pedM = pedestal(mIn, { r: 46, z: 110 });
  add(mIn, wrap(id + "-mw", mIn, pedM + X.liftSvg(msg.svg, 110)));
  if (!missing) add(kIn, wrap(id + "-kw", kIn, ped + X.liftSvg(lock.svg, 168)));
  add(o, r.svg);
  A[id] = { ...r.anchors, lockTop: at(kIn, 0, 0, 168 + 150), msgTop: at(mIn, 0, 0, 110 + 160), kIn: at(kIn, 0, 0, 200) };
  return r;
};
kmBuild("km5", o5.km, null);
kmBuild("km6", o5.km2, "key");

// ---- S6 Android 2013: phone with a dice cup; bitcoin wallets turn red
const o6 = { ph: P(6, -400, 20), cup: P(6, -140, 90), w: [P(6, 200, -60), P(6, 400, 30), P(6, 600, 120)] };
put("ph6", O.phone(o6.ph, { id: "ph6", screen: walletScreen("Android", "#3b3e44") }), o6.ph);
put("cup6", X.diceCup(o6.cup, { id: "cup6", dice: [3, 6] }), o6.cup);
o6.w.forEach((o, k) => put("hw6-" + k, O.hotWallet(o, { id: "hw6-" + k }), o));

// ---- S7 2019: lattice under a magnifier
const o7 = { lat: P(7, -40, 60), mag: P(7, 40, 160) };
put("lat7", latticeTile(o7.lat, { id: "lat7", w: 460, h: 320 }), o7.lat);
const mag7 = O.magnifier(o7.mag, { id: "mag7", z: 60 }); A.mag7 = mag7.anchors;
items.push({ y: 1e6, svg: `<g id="mag7-mv" opacity="0">${mag7.svg}</g>` });

// ---- S8 SecondFi 2026: phone app + k machine whose only input is public tx data; passers-by
const o8 = { ph: P(8, -560, 60), km: P(8, -60, 60), ps: [P(8, 380, -250), P(8, 530, -150), P(8, 680, -50)], sig: P(8, 270, 130), key: P(8, 480, 190), hw: P(8, -700, -230) };
put("ph8", O.phone(o8.ph, { id: "ph8", screen: walletScreen("SecondFi", "#1d93ba") }), o8.ph);
{ const r = X.kMachine(o8.km, { id: "km8", missing: "key" }); const mIn = { u: o8.km.u + 30, v: o8.km.v - 330 };
  const pd = O.doc(mIn, { id: "pd8", title: "交易数据", w: 150, h: 110, lines: ["", ""] });
  put("vit8", X.vitrine(mIn, { id: "vit8", w: 220, d: 170, h: 130, inner: X.liftSvg(pd.svg, X.VITRINE_FLOOR) }), mIn);
  put("km8", r, o8.km); }
o8.ps.forEach((o, k) => put("ps8-" + k, O.person(o, { id: "ps8-" + k, color: "#9a958c" }), o));
put("sig8", X.sigPaper(o8.sig, { id: "sig8" }), o8.sig);
put("rk8", O.key(o8.key, { id: "rk8", state: "attacker" }), o8.key);
put("hw8", O.hwWallet(o8.hw, { id: "hw8", glow: true }), o8.hw);
A.hw8chk = [A.hw8.top[0] + 90, A.hw8.top[1] - 10];
items.push({ y: 1e6, svg: checkSvg("hw8-ok", A.hw8chk, 30, 0) });

// ---- S9 lesson: green k machine inside a casing, under a magnifier
const o9 = { km: P(9, -40, 20), mag: P(9, 380, 260) };
const cs9 = casing({ u: o9.km.u - 110, v: o9.km.v - 80 }, { id: "cs9", w: 600, d: 420, h: 300 });
add({ u: o9.km.u - 110, v: o9.km.v - 400 }, `<g id="cs9b" opacity="0">${cs9.back}</g>`);
kmBuild("km9", o9.km, null);
add({ u: o9.km.u - 110, v: o9.km.v + 300 }, `<g id="cs9f" opacity="0">${cs9.front}</g>`);
A.cs9 = cs9.anchors;
const mag9 = O.magnifier(o9.mag, { id: "mag9", z: 80 }); A.mag9 = mag9.anchors;
items.push({ y: 1e6 + 1, svg: `<g id="mag9-mv" opacity="0">${mag9.svg}</g>` });

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2400, u1: 16000, v0: -9000, v1: 4000 }) + items.map((x) => x.svg).join("\n"), [-1600, -1400, 15200, 3200]);

// ---------------------------------------------------------------- world labels
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
let labels = "";
labels += wlab("lb-key0", A.lock0.top, "私钥", "lab-ink hide");
labels += wlab("lb-desk", rt(A.seal0.top, 120, 0), "签名台 · ECDSA", "hide");
labels += wlab("lb-k1", rt(A.cup0.top, -40, 0), "k = nonce · 一次性", "lab-cs hide");
labels += wlab("lb-r0", rt(A.sig0.tag, 40, 0), "r", "hide", "l");
// S1
labels += wlab("lb-same", up([(A.s1.tag[0] + A.s2.tag[0]) / 2, A.s1.tag[1]], 92), "同一个 k → r 相同", "lab-rs hide");
labels += wlab("lb-dsame", rt(at(d1o, 0, 0, 0), -60, -70), "两次点数相同", "lab-r hide", "r");
labels += wlab("lb-q", up(A.atk1.top, 4), "？", "lab-r hide");
labels += wlab("lb-pub", up(A.vit1.top, 0), "公开 · 链上可见", "lab-cs hide");
labels += wlab("lb-rk1", rt(at(rk1o, 0, 0, 0), 60, 50), "私钥", "lab-rs hide", "l");
// S2
labels += wlab("lb-meta", up(A.cl1.top, 120), "解读 · 比喻", "lab-g hide");
labels += wlab("lb-cloth", rt(A.cl1.center, 190, -10), "遮布 = nonce", "lab-cs hide", "l");
labels += wlab("lb-cover", rt(A.cl1.center, -190, 20), "下面是私钥", "lab-g hide", "r");
labels += wlab("lb-twice", up(A.cl1.top, 40), "同一块布 · 第 2 次", "lab-r hide");
labels += wlab("lb-shown", rt(A.cl1.key, 160, 40), "私钥显出来", "lab-rs hide", "l");
labels += wlab("lb-real", up(A.cl1.top, 40), "实际是解方程", "lab-cs hide");
// S3
labels += wlab("lb-bias", up(A.bd.top, 30), "k 有偏置 · 高几位总是 0", "lab-r hide");
labels += wlab("lb-pile", up(A.pile.top, 10), "收集足够多签名", "hide");
labels += wlab("lb-lat3", up(A.lat3.top, 0), "格方法", "lab-cs hide");
labels += wlab("lb-rk3", up(at(o3.key, 40, 0, 0), 50), "恢复私钥", "lab-rs hide");
// S4
labels += wlab("lb-pd4", up(A.vit4.top, 0), "公开数据", "lab-cs hide");
labels += wlab("lb-gl4", up(A.cup4.top, 30), "k 由公开数据算出", "lab-r hide");
labels += wlab("lb-sig4", up(A.sig4.top, 10), "单个签名", "hide");
labels += wlab("lb-rk4", rt(at(o4.key, 0, 0, 0), 60, 50), "反推私钥", "lab-rs hide", "l");
// S5
labels += wlab("lb-lk5", up(A.km5.lockTop, 0), "私钥", "lab-ink hide");
labels += wlab("lb-msg5", up(A.km5.msgTop, 0), "消息", "hide");
labels += wlab("lb-km5", rt(A.km5.top, 170, -10), "RFC 6979 · 确定性派生 k", "lab-gs hide");
labels += wlab("lb-km5b", rt(A.km5.top, 170, 54), "EdDSA 标准 · 同样要求", "lab-gs hide");
labels += wlab("lb-km6", up(A.km6.top, 10), "偏离标准 · 缺私钥", "lab-rs hide");
// S6
labels += wlab("lb-ph6", up(A.ph6.top, 0), "Android", "lab-g hide");
labels += wlab("lb-same6", up(A.cup6.top, 20), "相同 nonce", "lab-rs hide");
labels += wlab("lb-hw6", up(A["hw6-1"].top, 20), "多款比特币钱包受影响", "lab-rs hide");
// S7
labels += wlab("lb-lat7", rt(A.lat7.center, -40, -170), "格方法 · 分析链上签名", "lab-cs hide");
// S8
labels += wlab("lb-ph8", up(A.ph8.top, 0), "SecondFi · Android 版", "lab-g hide");
labels += wlab("lb-pd8", up(A.vit8.top, 0), "公开交易数据", "lab-cs hide");
labels += wlab("lb-miss8", rt(A.km8.inKey, -30, 30), "漏掉秘密部分", "lab-rs hide", "r");
labels += wlab("lb-ps8", up(A["ps8-1"].top, 20), "人人可算", "lab-r hide");
labels += wlab("lb-rk8", up(at(o8.key, 40, 0, 0), 50), "单个签名 → 私钥", "lab-rs hide");
labels += wlab("lb-hw8", rt(A.hw8.top, 0, -40), "硬件钱包 · 另一条路径 · 不受影响", "lab-gs hide");
// S9
labels += wlab("lb-cs9", A.cs9.backL, "封装层", "lab-cs hide", "r");
labels += wlab("lb-km9", rt(A.km9.top, 220, -20), "确定性派生 + 私钥秘密材料", "lab-gs hide");
labels += wlab("lb-lk9", up(A.km9.lockTop, 0), "私钥", "lab-ink hide");
labels += wlab("lb-msg9", up(A.km9.msgTop, 0), "消息", "hide");

// ---------------------------------------------------------------- cameras
const CAMS = {
  start: (() => { const c = Wp(K5.u, K5.v + 200, 0); return camAt([c[0], c[1] - 90], 960, 560, 1.2); })(),
  s0: camAt([DESK[0] + 60, DESK[1] - 120], 980, 580, 1.25),
  s1: camS(1, 160, -110, 1.25, 1000, 620),
  s2: camS(2, 0, -60, 1.5, 960, 600),
  s3: camS(3, 30, -90, 1.3, 1010, 610),
  s4: camS(4, 40, -60, 1.25, 1010, 680),
  s5: camS(5, -60, -150, 1.3, 1000, 580),
  s5b: camS(5, 220, -120, 1.05, 1000, 640),
  s6: camS(6, 80, -80, 1.15, 1000, 640),
  s7: camS(7, 0, -40, 1.25, 600, 640),
  s8: camS(8, 0, -80, 1.1, 1000, 640),
  s8b: camS(8, 0, -80, 1.0, 640, 660),
  s8c: camS(8, -300, -80, 1.0, 960, 640),
  s9: camS(9, 40, -160, 1.0, 1000, 560),
};

// dot matrices (HTML)
const dots = (id, n, cols, cls = "") => `<div class="dm" id="${id}" style="grid-template-columns:repeat(${cols}, 1fr)">` + Array.from({ length: n }, (_, k) => `<i class="d ${cls}" id="${id}-${k}"></i>`).join("") + `</div>`;
const RED19 = [7, 23, 41, 58, 66, 89, 104, 117, 133, 150];

// ---------------------------------------------------------------- times
const TM = {
  sig0: w("签名", 0), ecdsa1: w("ECDSA", 1), once1: w("一次性", 1), k1: w("叫", 1), nonce1: w("nonce", 1),
  three2: w("三种情况", 2), first2: w("第一种", 2), same2: w("同一个", 2),
  atk3: w("攻击者", 3), no4: w("不需要", 4), pub4: w("公开", 4), eq4: w("解方程", 4), key4: w("私钥", 4),
  meta5: w("打个比方", 5), cloth5: w("遮布", 5), key5: w("私钥", 5),
  twice6: w("两次", 6), cmp6: w("对比", 6), gone6: w("消掉", 6), show6: w("显出来", 6),
  lim7: w("局限", 7), eq7: w("解方程", 7), two7: w("下面两种", 7), cant7: w("无法解决", 7),
  s8: w("第二种", 8), bias8: w("偏置", 8), hi8: w("高几位", 8), col8: w("收集", 8), lat8: w("格方法", 8), rec8: w("恢复私钥", 8),
  s9: w("第三种", 9), pub9: w("公开数据", 9), one9: w("单个签名", 9), back9: w("反推", 9),
  rfc10: w("RFC", 10), km10: w("私钥和消息", 10), det10: w("确定性", 10), two10: w("前两种", 10),
  ed11: w("EdDSA", 11), sec11: w("秘密部分", 11), dev11: w("偏离标准", 11),
  c12: w("三个案例", 12), y12: w("2013", 12), and12: w("Android", 12), same12: w("相同的", 12), btc12: w("比特币钱包", 12),
  y13: w("2019", 13), lat13: w("格方法", 13), bt13: w("数百个", 13), eth13: w("数十个", 13),
  y14: w("2026", 14), sf14: w("SecondFi", 14), pub14: w("公开交易数据", 14), miss14: w("漏掉", 14),
  all15: w("人人可算", 15), one15: w("单个签名", 15),
  n16: w("374", 16), ada16: w("1600", 16), usd16: w("240", 16), off16: w("官方口径", 16), sm16: w("SlowMist", 16),
  hw17: w("硬件钱包", 17), ok17: w("不受影响", 17),
  det18: w("确定性派生", 18), sec18: w("秘密材料", 18), kat18: w("已知答案测试", 18), lib18: w("底层库", 18),
};
for (const [k, v] of Object.entries(TM)) if (!(v >= 0)) throw new Error("bad time " + k);

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "格方法", t2: "从大量有偏差的签名中解出私钥的数学方法", at: w("格方法", 8), top: 328 },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .card { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.14); }
    #cases { left: 56px; top: 36px; width: 640px; padding: 14px 22px 16px; }
    #cases .ch { font-size: 32px; font-weight: 900; height: 50px; line-height: 46px; }
    #cases .cr { position: relative; display: flex; align-items: center; height: 58px; border-radius: 12px; padding: 0 12px; margin-top: 4px; }
    #cases .cn { width: 42px; height: 42px; border-radius: 50%; background: #e2ddd3; color: #1c1c1c; font-size: 28px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin-right: 14px; }
    #cases .ct { font-size: 32px; font-weight: 900; width: 130px; }
    #cases .cx { font-size: 30px; font-weight: 700; color: #c3352b; white-space: nowrap; }
    #cases .ok { position: absolute; right: 14px; top: 8px; height: 42px; padding: 0 14px; border-radius: 10px; background: #1f9d55; color: #fff; font-size: 30px; font-weight: 900; line-height: 40px; white-space: nowrap; }
    #cases .hl { position: absolute; inset: 0; border-radius: 12px; background: #e4f2f7; z-index: -1; }
    #cases .hlr { position: absolute; inset: 0; border-radius: 12px; background: #fdeae7; z-index: -1; }
    #cant { position: absolute; left: 720px; top: 196px; }
    #eq { right: 56px; top: 116px; width: 620px; padding: 18px 28px 20px; }
    #eq .eh { display: flex; align-items: center; font-size: 34px; font-weight: 900; height: 52px; }
    #eq .eh .tg { margin-left: auto; font-size: 28px; font-weight: 700; color: #ffffff; background: #1d93ba; border-radius: 10px; padding: 0 12px 2px; }
    #eq .er { font-size: 34px; font-weight: 800; height: 56px; line-height: 56px; white-space: nowrap; border-radius: 10px; padding: 0 10px; margin: 0 -10px; }
    #eq .er b { font-family: "JetBrains Mono", monospace; color: #1d93ba; }
    #eq .er .red { color: #e0453a; }
    .ev { left: 56px; top: 36px; width: 760px; padding: 16px 24px 18px; border-left: 10px solid #e0453a; }
    .ev .eh { font-size: 40px; font-weight: 900; white-space: nowrap; display: flex; align-items: center; gap: 16px; }
    .ev .eh .yr { font-family: "JetBrains Mono", monospace; color: #e0453a; }
    .ev .eb { margin-top: 6px; font-size: 32px; font-weight: 700; white-space: nowrap; color: #3b3e44; }
    .ev .src { display: inline-block; margin-left: 10px; font-size: 28px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 10px; padding: 0 10px 2px; }
    .mx { padding: 20px 26px 22px; }
    .mx .mh { font-size: 36px; font-weight: 900; white-space: nowrap; }
    .mx .ms { font-size: 30px; font-weight: 700; color: #6d685e; margin-top: 4px; white-space: nowrap; }
    .dm { display: grid; gap: 7px; margin-top: 16px; }
    .dm .d { width: 22px; height: 22px; border-radius: 50%; background: #c9c3b6; display: block; }
    .dm .d.red { background: #e0453a; }
    #mx13 { left: 1020px; top: 150px; width: 820px; }
    #mx16 { right: 56px; top: 110px; width: 840px; }
    #mx16 .dm { gap: 5px; }
    #mx16 .d { width: 18px; height: 18px; background: #e0453a; opacity: 0; }
    .tagrow { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .chip { font-size: 30px; font-weight: 800; border-radius: 12px; padding: 3px 14px 5px; white-space: nowrap; }
    .chip-r { background: #e0453a; color: #fff; }
    .chip-ink { background: #1c1c1c; color: #fff; }
    .chip-g { background: #ffffff; color: #3b3e44; border: 3px solid #cfc7b8; }
    #kat { left: 56px; top: 36px; width: 640px; padding: 18px 26px 20px; }
    #kat .kh { font-size: 36px; font-weight: 900; height: 54px; }
    #kat .kr { display: flex; align-items: center; gap: 14px; font-size: 32px; font-weight: 700; height: 58px; white-space: nowrap; }
    #kat .bx { width: 38px; height: 38px; border-radius: 8px; border: 3px solid #1f9d55; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 26px; }
    
    #kat .kr.no { color: #c3352b; }
    #kat .bx.x { border-color: #e0453a; background: #e0453a; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="card hide" id="cases"><div class="ch">k 出错的三种情况</div>
        ${[["1", "重用", "两个签名 → 私钥"], ["2", "偏置", "大量签名 + 格方法"], ["3", "可算出", "单个签名 → 私钥"]].map(([n, t, x]) =>
          `<div class="cr" id="cr${n}"><div class="hl" id="crh${n}" style="opacity:0"></div><div class="hlr" id="crr${n}" style="opacity:0"></div><span class="cn">${n}</span><span class="ct">${t}</span><span class="cx hide" id="cx${n}">${x}</span><span class="ok hide" id="ok${n}">RFC 6979 ✓</span></div>`).join("")}
      </div>
      <div class="chip chip-r hide" id="cant">一次对比解决不了</div>
      <div class="card hide" id="eq"><div class="eh">解方程<span class="tg">输入全是公开数据</span></div>
        <div class="er" id="er0">签名 1 + 签名 2 <span style="color:#6d685e">· 同一个 <b>k</b></span></div>
        <div class="er" id="er1">→ 算出 <b>k</b></div>
        <div class="er" id="er2">→ 算出 <span class="red">私钥</span></div></div>
      <div class="card ev hide" id="ev12"><div class="eh"><span class="yr">2013 年 8 月</span>Android 随机数缺陷</div><div class="eb">不同签名用了相同的 nonce</div></div>
      <div class="card ev hide" id="ev13"><div class="eh"><span class="yr">2019 年</span>一项研究 · 格方法</div><div class="eb">k 有偏置的链上签名</div></div>
      <div class="card mx hide" id="mx13"><div class="mh">从链上签名里恢复的私钥</div><div class="ms">示意 · 不按比例</div>
        ${dots("dm13", 160, 20)}
        <div class="tagrow"><span class="chip chip-r hide" id="t13a">数百个比特币私钥</span><span class="chip chip-r hide" id="t13b">数十个以太坊私钥</span></div></div>
      <div class="card ev hide" id="ev14"><div class="eh"><span class="yr">2026 年 6 月</span>SecondFi · Cardano 钱包</div><div class="eb">Android 版 · 用公开交易数据派生 nonce</div></div>
      <div class="card mx hide" id="mx16"><div class="mh">374 个钱包被盗 <span style="font-size:30px;color:#6d685e">· 每点 = 1 个钱包</span></div>
        ${dots("dm16", 374, 34)}
        <div class="tagrow"><span class="chip chip-ink hide" id="t16a">约 1600 万 ADA</span><span class="chip chip-ink hide" id="t16b">约 240 万美元</span><span class="chip chip-g hide" id="t16c">SecondFi 官方口径</span></div>
        <div class="tagrow"><span class="chip chip-g hide" id="t16d">SlowMist 分析 · 估计更高</span></div></div>
      <div class="card hide" id="kat"><div class="kh">封装层 · 已知答案测试</div>
        <div class="kr" id="kr0"><span class="bx" id="kb0">✓</span>固定私钥 + 消息 → 固定的 k</div>
        <div class="kr" id="kr1"><span class="bx" id="kb1">✓</span>结果与标准测试向量一致</div>
        <div class="kr no hide" id="kr2"><span class="bx x" id="kb2">✗</span>只信任底层库</div></div>

      ${termHtml(TERMS)}      ${pills(4, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ nonce泄密</div><div class="t-sub">签名里的第二处随机性</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const hideObj = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const slideIn = (sel, t) => tl.fromTo(sel, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t);
      const slideOut = (sel, t) => tl.to(sel, { opacity: 0, y: -16, duration: 0.25, ease: "power2.in" }, t);
      const flyKey = (id, t) => { const g = $(id); tl.fromTo("#" + id, { scale: 0.2, opacity: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, { scale: 1, opacity: 1, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, t); };
      KIT.camSet(tl, CAMS.start);

      // everything except the start station is hidden until its beat
      ["ec", "cup0", "seal0", "sig0", "vit1", "dA", "dB", "atk1", "cl1w", "bd", "lat3", "vit4", "cup4w", "sig4",
       "km5", "km5-kw", "km5-mw", "km6", "km6-mw", "ph6", "cup6", "hw6-0", "hw6-1", "hw6-2", "lat7", "ph8", "vit8", "km8", "ps8-0", "ps8-1", "ps8-2", "sig8", "hw8",
       "km9", "km9-kw", "km9-mw"].forEach(hideObj);
      ["rk1", "rk3", "rk4", "rk8"].forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      tl.set("#vit1-glass, #vit1 .vback, #h1w, #h2w", { opacity: 0 }, 0);
      tl.set("#cl2-key", { opacity: 0 }, 0);
      for (let k = 0; k < ${NP}; k++) tl.set("#pl" + k + "-mv", { opacity: 0 }, 0);

      // ===== 0–1.6 title card → into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 from the private key along the branch to the signing desk
      pop("#lb-key0", 1.0);
      KIT.belt(tl, "belt0", 1.4, 3.0, 260);
      KIT.cam(tl, ${f(TM.sig0 - 0.9)}, CAMS.s0, 1.8);
      ["ec", "seal0", "cup0"].forEach((id, k) => grow(id, ${f(TM.sig0 - 0.3)} + k * 0.15, 0.5));
      KIT.drawPath(tl, "ec-curve", ${f(TM.sig0 + 0.2)}, 1.2);
      pop("#lb-desk", ${f(TM.sig0 + 0.4)});
      out("#lb-key0", ${f(L(1).start - 0.3)});
      // ===== L1 the cup is shaken: k = nonce, used once; a signature with its r tag
      KIT.cupShake(tl, "cup0", ${f(TM.ecdsa1)}, 1.0);
      KIT.roll(tl, "cup0-d0", ${f(TM.ecdsa1 + 0.3)}, 6); KIT.roll(tl, "cup0-d1", ${f(TM.ecdsa1 + 0.5)}, 1);
      KIT.roll(tl, "cup0-d0", ${f(TM.ecdsa1 + 0.7)}, 3); KIT.roll(tl, "cup0-d1", ${f(TM.ecdsa1 + 0.8)}, 5);
      KIT.cup(tl, "cup0", ${f(TM.once1 - 0.2)}, true, 0.6);
      pop("#lb-k1", ${f(TM.k1)});
      KIT.stamp(tl, "seal0", ${f(TM.k1 + 0.4)});
      grow("sig0", ${f(TM.nonce1 + 0.1)}, 0.5);
      pop("#lb-r0", ${f(TM.nonce1 + 0.5)});

      // ===== L2 three cases · case 1: same k twice
      slideIn("#cases", ${f(TM.three2)});
      out("#lb-desk, #lb-r0", ${f(TM.first2 - 0.6)});
      KIT.cam(tl, ${f(TM.first2 - 0.6)}, CAMS.s1, 1.2);
      tl.to("#crh1", { opacity: 1, duration: 0.25 }, ${f(TM.first2)});
      grow("vit1", ${f(TM.first2 - 0.1)}, 0.5);
      grow("dA", ${f(TM.first2 + 0.3)}, 0.4); grow("dB", ${f(TM.first2 + 0.5)}, 0.4);
      pop("#lb-dsame", ${f(TM.same2)});
      KIT.swap(tl, "#s1-tag", "#s1-tag-red", ${f(TM.same2 + 0.4)}, 0.25); KIT.swap(tl, "#s2-tag", "#s2-tag-red", ${f(TM.same2 + 0.4)}, 0.25);
      fadeIn("#rlink", ${f(TM.same2 + 0.6)}, 0.3);
      pop("#lb-same", ${f(TM.same2 + 0.7)});
      // ===== L3 what else does the attacker need?
      grow("atk1", ${f(TM.atk3 - 0.2)}, 0.5);
      pop("#lb-q", ${f(TM.atk3 + 0.6)});
      // ===== L4 nothing: everything is public → solve → private key
      out("#lb-q, #lb-dsame", ${f(TM.no4)});
      fadeIn("#h1w", ${f(TM.pub4 - 0.5)}, 0.3); fadeIn("#h2w", ${f(TM.pub4 - 0.35)}, 0.3);
      fadeIn("#vit1-glass, #vit1 .vback", ${f(TM.pub4)}, 0.4);
      out("#lb-same", ${f(TM.pub4 - 0.1)}); pop("#lb-pub", ${f(TM.pub4 + 0.1)});
      out("#dA, #dB", ${f(TM.pub4 + 0.2)}, 0.3);
      slideIn("#eq", ${f(TM.eq4 - 0.4)});
      tl.fromTo("#er1", { backgroundColor: "rgba(228,242,247,0)" }, { backgroundColor: "rgba(228,242,247,1)", duration: 0.2, immediateRender: false }, ${f(TM.eq4 + 0.2)});
      tl.fromTo("#er2", { backgroundColor: "rgba(253,234,231,0)" }, { backgroundColor: "rgba(253,234,231,1)", duration: 0.2, immediateRender: false }, ${f(TM.key4 - 0.2)});
      flyKey("rk1", ${f(TM.key4)});
      pop("#lb-rk1", ${f(TM.key4 + 0.3)});
      pop("#cx1", ${f(TM.key4 + 0.5)});

      // ===== L5 metaphor: a cloth over the key
      slideOut("#eq", ${f(L(5).start - 0.4)}); out("#lb-rk1, #lb-pub", ${f(L(5).start - 0.4)});
      KIT.cam(tl, ${f(L(5).start - 0.4)}, CAMS.s2, 1.3);
      grow("cl1w", ${f(L(5).start + 0.2)}, 0.5);
      pop("#lb-meta", ${f(TM.meta5)});
      pop("#lb-cloth", ${f(TM.cloth5)});
      pop("#lb-cover", ${f(TM.key5)});
      // ===== L6 the same cloth twice → cancels → key shows
      out("#lb-cover", ${f(TM.twice6 - 0.3)});
      tl.fromTo("#cl2-mv", { opacity: 0, y: -200 }, { opacity: 1, y: -200, duration: 0.25, immediateRender: false }, ${f(TM.twice6 - 0.2)});
      tl.to("#cl2-mv", { y: 0, duration: 0.8, ease: "power2.inOut" }, ${f(TM.twice6 + 0.1)});
      pop("#lb-twice", ${f(TM.twice6 + 0.2)});
      tl.to("#cl1-cloth, #cl2-cloth", { opacity: 0, duration: 0.7, ease: "power1.inOut" }, ${f(TM.gone6 - 0.3)});
      out("#lb-cloth, #lb-twice", ${f(TM.gone6 - 0.3)});
      pop("#lb-shown", ${f(TM.show6 - 0.1)});
      // ===== L7 limit of the metaphor: it is really solving equations; and the next two cases are different
      tl.to("#st2", { opacity: 0.3, duration: 0.5 }, ${f(TM.lim7)});
      out("#lb-shown, #lb-meta", ${f(TM.lim7)});
      slideIn("#eq", ${f(TM.eq7 - 0.4)});
      pop("#lb-real", ${f(TM.eq7)});
      tl.to("#crh1", { opacity: 0, duration: 0.2 }, ${f(TM.two7)});
      [2, 3].forEach((n) => { tl.to("#crr" + n, { opacity: 1, duration: 0.2 }, ${f(TM.two7)}); tl.to("#crr" + n, { opacity: 0.0, duration: 0.3 }, ${f(TM.two7 + 0.6)}); tl.to("#crr" + n, { opacity: 1, duration: 0.2 }, ${f(TM.two7 + 1.0)}); });
      pop("#cant", ${f(TM.cant7 - 0.4)});

      // ===== L8 case 2: bias
      slideOut("#eq", ${f(TM.s8 - 0.5)}); out("#cant, #lb-real", ${f(TM.s8 - 0.5)});
      [2, 3].forEach((n) => out("#crr" + n, ${f(TM.s8 - 0.5)}));
      KIT.cam(tl, ${f(TM.s8 - 0.5)}, CAMS.s3, 1.2);
      tl.to("#crh2", { opacity: 1, duration: 0.25 }, ${f(TM.s8)});
      grow("bd", ${f(TM.s8 + 0.1)}, 0.5);
      [${[6, 2, 5, 4].join(",")}].forEach((v, k) => KIT.roll(tl, "bd-d", ${f(TM.bias8)} + k * 0.35, v));
      pop("#lb-bias", ${f(TM.hi8)});
      for (let k = 0; k < ${NP}; k++) tl.fromTo("#pl" + k + "-mv", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, ${f(TM.col8)} + k * 0.13);
      pop("#lb-pile", ${f(TM.col8 + 0.4)});
      grow("lat3", ${f(TM.lat8 - 0.2)}, 0.45);
      pop("#lb-lat3", ${f(TM.lat8 + 0.1)});
      fadeIn("#lat3-hot", ${f(TM.lat8 + 0.5)}, 0.3);
      flyKey("rk3", ${f(TM.rec8)});
      pop("#lb-rk3", ${f(TM.rec8 + 0.3)});
      pop("#cx2", ${f(TM.rec8 + 0.4)});

      // ===== L9 case 3: computable from public data
      out("#lb-bias, #lb-pile, #lb-rk3, #lb-lat3", ${f(TM.s9 - 0.5)});
      KIT.cam(tl, ${f(TM.s9 - 0.5)}, CAMS.s4, 1.2);
      tl.to("#crh2", { opacity: 0, duration: 0.2 }, ${f(TM.s9)}); tl.to("#crh3", { opacity: 1, duration: 0.25 }, ${f(TM.s9)});
      grow("cup4w", ${f(TM.s9 + 0.1)}, 0.5);
      grow("vit4", ${f(TM.pub9 - 0.6)}, 0.5);
      pop("#lb-pd4", ${f(TM.pub9)});
      KIT.swap(tl, "#cup4-cup", "#gl4w", ${f(TM.pub9 - 0.2)}, 0.4);
      KIT.draw(tl, "dc4", ${f(TM.pub9 + 0.2)}, 0.6);
      pop("#lb-gl4", ${f(TM.pub9 + 0.6)});
      grow("sig4", ${f(TM.one9 - 0.3)}, 0.45);
      pop("#lb-sig4", ${f(TM.one9)});
      flyKey("rk4", ${f(TM.back9)});
      pop("#lb-rk4", ${f(TM.back9 + 0.3)});
      pop("#cx3", ${f(TM.back9 + 0.3)});

      // ===== L10 RFC 6979: k derived from private key + message
      out("#lb-gl4, #lb-sig4, #lb-pd4, #lb-rk4", ${f(L(10).start - 0.4)});
      KIT.cam(tl, ${f(L(10).start - 0.4)}, CAMS.s5, 1.2);
      tl.to("#crh3", { opacity: 0, duration: 0.2 }, ${f(L(10).start)});
      grow("km5", ${f(TM.rfc10 - 0.1)}, 0.5);
      pop("#lb-km5", ${f(TM.rfc10 + 0.3)});
      grow("km5-kw", ${f(TM.km10 - 0.1)}, 0.45); pop("#lb-lk5", ${f(TM.km10 + 0.2)});
      grow("km5-mw", ${f(TM.km10 + 0.5)}, 0.45); pop("#lb-msg5", ${f(TM.km10 + 0.8)});
      KIT.emit(tl, "km5", ${f(TM.det10)}, 1.0);
      out("#cx1, #cx2", ${f(TM.two10 - 0.2)}, 0.2); pop("#ok1", ${f(TM.two10)}); pop("#ok2", ${f(TM.two10 + 0.2)});
      // ===== L11 EdDSA too; risk = deviating implementations
      pop("#lb-km5b", ${f(TM.ed11 + 0.2)});
      KIT.cam(tl, ${f(TM.dev11 - 1.0)}, CAMS.s5b, 0.9); grow("km6", ${f(TM.dev11 - 0.4)}, 0.5); grow("km6-mw", ${f(TM.dev11 - 0.4)}, 0.4);
      pop("#lb-km6", ${f(TM.dev11)});
      slideOut("#cases", ${f(LE(11) - 0.4)});

      // ===== L12 Android 2013
      out("#lb-km5, #lb-km5b, #lb-lk5, #lb-msg5, #lb-km6", ${f(L(12).start - 0.3)});
      KIT.cam(tl, ${f(L(12).start - 0.3)}, CAMS.s6, 1.3);
      slideIn("#ev12", ${f(TM.y12)});
      grow("ph6", ${f(TM.and12 - 0.3)}, 0.45); pop("#lb-ph6", ${f(TM.and12)});
      grow("cup6", ${f(TM.and12 + 0.1)}, 0.45);
      KIT.cupShake(tl, "cup6", ${f(TM.same12 - 1.6)}, 0.6); KIT.cup(tl, "cup6", ${f(TM.same12 - 1.0)}, true, 0.4);
      KIT.cup(tl, "cup6", ${f(TM.same12 - 0.4)}, false, 0.3); KIT.cupShake(tl, "cup6", ${f(TM.same12 - 0.1)}, 0.5);
      KIT.cup(tl, "cup6", ${f(TM.same12 + 0.4)}, true, 0.4);
      pop("#lb-same6", ${f(TM.same12 + 0.6)});
      [0, 1, 2].forEach((k) => grow("hw6-" + k, ${f(TM.btc12 - 1.0)} + k * 0.12, 0.45));
      [0, 1, 2].forEach((k) => KIT.broke(tl, "hw6-" + k, ${f(TM.btc12 + 0.2)} + k * 0.2, { ghost: 0.35 }));
      pop("#lb-hw6", ${f(TM.btc12 + 0.5)});
      // ===== L13 2019 research
      slideOut("#ev12", ${f(TM.y13 - 0.4)}); out("#lb-ph6, #lb-same6, #lb-hw6", ${f(TM.y13 - 0.4)});
      KIT.cam(tl, ${f(TM.y13 - 0.4)}, CAMS.s7, 1.2);
      slideIn("#ev13", ${f(TM.y13 + 0.1)});
      grow("lat7", ${f(TM.y13 + 0.3)}, 0.5);
      pop("#lb-lat7", ${f(TM.lat13)});
      fadeIn("#mag7-mv", ${f(TM.lat13 + 0.2)}, 0.3);
      tl.fromTo("#mag7-mv", { x: -90, y: 20 }, { x: 70, y: -30, duration: 3.2, ease: "power1.inOut", immediateRender: false }, ${f(TM.lat13 + 0.2)});
      fadeIn("#lat7-hot", ${f(TM.lat13 + 1.0)}, 0.3);
      slideIn("#mx13", ${f(TM.lat13 + 0.3)});
      ${JSON.stringify(RED19)}.forEach((i, k) => tl.to("#dm13-" + i, { backgroundColor: "#e0453a", duration: 0.15 }, ${f(TM.bt13 - 0.6)} + k * 0.12));
      pop("#t13a", ${f(TM.bt13)}); pop("#t13b", ${f(TM.eth13)});
      // ===== L14 SecondFi 2026
      slideOut("#ev13, #mx13", ${f(L(14).start + 0.2)}); out("#lb-lat7, #mag7-mv", ${f(L(14).start - 0.4)});
      KIT.cam(tl, ${f(L(14).start - 0.4)}, CAMS.s8, 1.3);
      slideIn("#ev14", ${f(TM.y14 + 0.2)});
      grow("ph8", ${f(TM.sf14 - 0.4)}, 0.45); pop("#lb-ph8", ${f(TM.sf14)});
      grow("km8", ${f(TM.pub14 - 0.8)}, 0.5);
      grow("vit8", ${f(TM.pub14 - 0.4)}, 0.5); pop("#lb-pd8", ${f(TM.pub14)});
      pop("#lb-miss8", ${f(TM.miss14)});
      // ===== L15 anyone can compute it; one signature → key
      KIT.emit(tl, "km8", ${f(TM.all15 - 0.4)}, 0.9);
      [0, 1, 2].forEach((k) => grow("ps8-" + k, ${f(TM.all15 - 0.2)} + k * 0.12, 0.45));
      pop("#lb-ps8", ${f(TM.all15 + 0.4)});
      grow("sig8", ${f(TM.one15 - 0.2)}, 0.4);
      flyKey("rk8", ${f(TM.one15 + 0.6)}); pop("#lb-rk8", ${f(TM.one15 + 0.9)});
      // ===== L16 374 wallets · amounts with their sources
      KIT.cam(tl, ${f(L(16).start - 0.3)}, CAMS.s8b, 1.0);
      out("#lb-ps8, #lb-pd8, #lb-rk8, #lb-ph8", ${f(L(16).start - 0.3)});
      slideOut("#ev14", ${f(L(16).start - 0.3)});
      slideIn("#mx16", ${f(TM.n16 - 0.2)});
      tl.fromTo("#dm16 .d", { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.004, immediateRender: false }, ${f(TM.n16)});
      pop("#t16a", ${f(TM.ada16)}); pop("#t16b", ${f(TM.usd16)}); pop("#t16c", ${f(TM.off16)}); pop("#t16d", ${f(TM.sm16)});
      // ===== L17 hardware wallets: another path, not affected
      slideOut("#mx16", ${f(L(17).start - 0.3)});
      KIT.cam(tl, ${f(L(17).start - 0.3)}, CAMS.s8c, 0.9);
      grow("hw8", ${f(TM.hw17 - 0.1)}, 0.45);
      pop("#lb-ph8", ${f(L(17).start + 0.3)});
      pop("#lb-hw8", ${f(TM.hw17 + 0.4)});
      fadeIn("#hw8-ok", ${f(TM.ok17)}, 0.25);

      // ===== L18 lesson: deterministic, includes the secret; test the wrapper
      out("#lb-hw8, #lb-miss8, #lb-rk8, #lb-ph8", ${f(L(18).start - 0.4)});
      KIT.cam(tl, ${f(L(18).start - 0.4)}, CAMS.s9, 1.3);
      grow("km9", ${f(L(18).start + 0.3)}, 0.5); grow("km9-kw", ${f(L(18).start + 0.5)}, 0.45); grow("km9-mw", ${f(L(18).start + 0.65)}, 0.45);
      pop("#lb-km9", ${f(TM.det18)});
      
      KIT.emit(tl, "km9", ${f(TM.sec18 + 0.3)}, 1.0);
      fadeIn("#cs9b, #cs9f", ${f(TM.kat18 - 0.6)}, 0.4); pop("#lb-cs9", ${f(TM.kat18 - 0.4)});
      slideIn("#kat", ${f(TM.kat18)});
      fadeIn("#mag9-mv", ${f(TM.kat18 + 0.3)}, 0.3);
      tl.fromTo("#mag9-mv", { x: 60, y: 30 }, { x: -60, y: -20, duration: 2.6, ease: "power1.inOut", immediateRender: false }, ${f(TM.kat18 + 0.3)});
      tl.to("#kb0", { backgroundColor: "#1f9d55", duration: 0.2 }, ${f(TM.kat18 + 0.8)}); tl.to("#kb1", { backgroundColor: "#1f9d55", duration: 0.2 }, ${f(TM.kat18 + 1.3)});
      pop("#kr2", ${f(TM.lib18 - 0.3)});
      tl.set({}, {}, ${f(TOTAL)});

      ${termJs(TERMS)}      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
