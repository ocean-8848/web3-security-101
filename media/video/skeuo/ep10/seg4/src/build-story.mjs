// ep10/seg4「④ 初始化缺失」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.D（BRIEF 第 2 节镜头路线：起始区 D）。ends static on CAMS.A
// 段内镜头：E2（E 区整体右移，左侧留给卡 D）、nomad（检查口近景左移，右侧留给卡 E）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            A 桥头全景（seg1 起点、seg4 终点、seg5 起点、seg6 L6–L8）
//   gate         近景：检查口 + 可信根牌 + 确认表 + 排队的信（seg1 L3–L8、seg4 L15–L20、seg6 L8）
//   door         近景：桥合约维修门 + 机芯推车 + 确认表（seg1 L1–L2、L10，seg6 L7）
//   B            B 维修间（seg1 终点、seg2 起点、seg6 L9）
//   anatomy      近景：代理解剖 — 售货机 + 存储柜 + 推车机芯（seg2 L1–L10）
//   C            C 三个展台并排（seg2 L12、L19，seg2 终点、seg3 起点）
//   trans        近景：各展台（seg2 L13–L14 / L15–L16 / L17–L18；seg3 L24 回指透明台；seg5 L2 不用，在 F 区）
//   uups         k 1.4 · usign 710,363–1034,765 · uvend 1075,500–1310,797
//   beacon       k 1.185 · bsign 548,313–823,654 · tower 899,300–1050,634 · vault0 1093,559–1212,741 · vault1 1222,618–1342,801
//   CD           C + D 同框：0 号抽屉的红虚线连到展台方向的售货机（seg3 L5）— k 0.373
//   D            D 档案室全景（seg3 终点、seg4 起点）
//   cab          近景：大抽屉柜 + 两本手册 + 字节条（seg3 L0–L5、L8–L19）
//   eip          近景：抽屉柜 + 高架 EIP-1967 小柜（seg3 L6–L7 镜头抬向高架）
//   keys         近景：档案室角落 — 两把选择器钥匙 + 小售货机（seg3 L20–L23）
//   E            E 初始化台（seg4 L0–L13）
//   F            F 审批路：6 道关卡 + 路尽头的代理（seg5 L15–L19；seg5 终点、seg6 起点）
//   gov          多签 + 时间锁 + 两只排队机芯（seg5 L3–L4、L9–L10）
//   compound     Compound 小站（seg5 L5–L8）
//   mantle       Mantle 小站（seg5 L11–L14）
//   rollback     路尽头 + 回滚（seg5 L19–L20）
//   roles        三个角色 + 三条链的小副本（seg6 L0–L5）
//   world        全景：所有区（seg6 L10 结束卡前拉远）— k 0.166
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const R = L.rect;
const CAMS = {
  ...L.CAMS,
  E2: L.fit([R(L.EPROXY, "vending"), R(L.EIMPL, "vending"), R(L.DEPLOYER, "person"), R(L.ATTACKER, "person"), ...L.ELETTERS.map((q) => R(q, "letter")),
    R(L.EHOUR, "hourglass"), R(L.PADLOCK, "padlock"), ...L.VICTIMS.map((q) => R(q, "vending"))], [840, 360, 1820, 860], 1.4),
  nomad: L.fit([R(L.GATE, "checkpoint"), R(L.ROOTSIGN, "signPlate"), R(L.CONFIRM, "doc"), ...L.LETTERS.map((q) => R(q, "letter"))], [100, 300, 1060, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E3, E5, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const hidW = (id) => ({ wrap: (svg) => S.hid(id, svg) });
const putK = (key, o, obj, k, dy = 0) => {             // 不支持 scale 的物件：绕地面点缩放并换算 anchors（常见坑 1）
  const [gx, gy] = at(o);
  put(key, o, obj, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of ["top", "center", "ground"]) if (A[key][n]) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k];
};

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// D 存储档案室（起始镜头）
put("cab", L.CAB, E3.slotCabinet(L.CAB, { id: "cab", n: 5, title: "代理存储" }));
putK("eip", L.EIP, E3.slotCabinet(L.EIP, { id: "eip", n: 1, title: "EIP-1967", labels: ["0x3608…"] }), 0.5);
L.MANUALS.forEach((q, i) => put("man" + i, q, E3.manual(q, { id: "man" + i, title: i ? "实现 V2" : "实现 V1", open: 180 })));
put("bytes", L.BYTES, E3.byteBlock(L.BYTES, { id: "bytes", bytes: 20 }));
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }));
L.KEYS.forEach((q, i) => put("key" + i, q, E3.selectorKey(q, { id: "key" + i, selector: "42966c68", name: i ? "collate_propagate_storage(bytes16)" : "burn(uint256)" })));
put("svend", L.SVEND, E1.vending(L.SVEND, { id: "svend", sign: "PROXY", scale: 0.5 }));
// B 维修间（L14 镜头经过）
put("vend", L.VEND, E1.vending(L.VEND, { id: "vend", sign: "PROXY", maintDoor: true }));
putK("store", L.STORE, E3.slotCabinet(L.STORE, { id: "store", n: 4, title: "存储" }), 0.8);
put("core", L.CORE, X.coreModule(L.CORE, { id: "core", ver: "V2" }));
put("eng", L.ENGINEER, O.person(L.ENGINEER, { id: "eng", role: "engineer" }));
L.USERS.forEach((q, i) => put("usr" + i, q, O.person(q, { id: "usr" + i, role: "signer" })));
// A 桥头（L14–L20，段尾）
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
put("bvend", L.BVEND, E1.vending(L.BVEND, { id: "bvend", sign: "BRIDGE", scale: 0.8, maintDoor: true, mdoorOpen: 105 }));
put("bcore", L.BCORE, X.coreModule(L.BCORE, { id: "bcore", ver: "升级" }));
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "根", armUp: true }));
put("rsign", L.ROOTSIGN, E1.signBoard(L.ROOTSIGN, { id: "rsign", text: "可信根", style: "plate" }));
put("cf", L.CONFIRM, O.doc(L.CONFIRM, { id: "cf", title: "确认表", lines: ["全零 → 已确认"], standing: true }));
L.LETTERS.forEach((q, i) => put("ql" + i, q, E1.letter(q, { id: "ql" + i })));
put("rl", L.LETTERS[0], E1.letter(L.LETTERS[0], { id: "rl", state: "attacker" }), 1, hidW("rl-h"));
const LENS = S.rel(L.CONFIRM, -70, 60);
put("lens", LENS, O.magnifier(LENS, { id: "lens" }), 2, hidW("lens-h"));
// E 初始化台（L0–L13）
L.VICTIMS.forEach((q, i) => put("v" + i, q, E1.vending(q, { id: "v" + i, sign: "PROXY", scale: 0.4 })));
const VUV = L.VICTIMS.map((q) => [q.u - L.EIMPL.u, q.v - L.EIMPL.v]);
const BU = Math.min(...VUV.map((d) => d[0])) - 110;
VUV.forEach(([du, dv], i) => put("pp" + i, L.EIMPL, E1.pipe(L.EIMPL, { id: "pp" + i, pts: [[60, 0, 40], [BU, 0, 40], [BU, dv, 40], [du - 40, dv, 40]], flow: true, flowColor: "#e0453a" }), -1, hidW("pp" + i + "-h")));
put("ep", L.EPROXY, E1.vending(L.EPROXY, { id: "ep", sign: "PROXY", scale: 0.7 }));
put("ei", L.EIMPL, E1.vending(L.EIMPL, { id: "ei", sign: "IMPL", scale: 0.7, coins: false }));
const card = (key, q, o2, shown) => put(key, q, E5.keycard(q, { id: key, z: q.z, scale: q.scale, ...o2 }), 5, shown ? {} : hidW(key + "-h"));
card("pB", L.ECARDS[0], { blank: true }, true);
card("iB", L.ECARDS[1], { blank: true }, true);
card("pD", L.ECARDS[0], { role: "owner", color: "#1f9d55", text: "OWNER" });
card("iD", L.ECARDS[1], { role: "owner" });
card("pA", L.ECARDS[0], { state: "attacker" });
card("iA", L.ECARDS[1], { state: "attacker" });
const PC = A.pB.center, IC = A.iB.center;
const ring = (id, q, [cx, cy]) => add(q, S.hid(id, `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="50" fill="none" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="9 6"/>`), 8);
ring("rgP", L.ECARDS[0], PC);
ring("rgI", L.ECARDS[1], IC);
put("dep", L.DEPLOYER, O.person(L.DEPLOYER, { id: "dep", role: "signer" }));
put("atk", L.ATTACKER, O.person(L.ATTACKER, { id: "atk", role: "attacker" }));
put("lD", L.ELETTERS[0], E1.letter(L.ELETTERS[0], { id: "lD" }), 0, hidW("lD-h"));
put("lI", L.ELETTERS[1], E1.letter(L.ELETTERS[1], { id: "lI" }), 0, hidW("lI-h"));
put("hg", L.EHOUR, O.hourglass(L.EHOUR, { id: "hg" }), 0, hidW("hg-h"));
const MID = S.rel(L.EHOUR, 0, 40);
put("lM", MID, E1.letter(MID, { id: "lM", glow: true }), 2, hidW("lM-h"));
const LR0 = S.rel(L.ATTACKER, -70, 40);
put("lR", LR0, E1.letter(LR0, { id: "lR", state: "attacker" }), 3, hidW("lR-h"));
const LI0 = S.rel(L.DEPLOYER, 70, 30);
put("lI2", LI0, E1.letter(LI0, { id: "lI2" }), 0, hidW("lI2-h"));
put("lock", L.PADLOCK, O.padlock(L.PADLOCK, { id: "lock" }), 0, hidW("lock-h"));
// 世界画布上的移动终点
const P_I2 = at(S.rel(L.EPROXY, 0, 110));
const P_R = at(S.rel(L.EHOUR, -10, 80));
const P_RL = at({ u: L.GATE.u - 110, v: L.GATE.v });
// 红点：确认表的"全零"与信封的"全零"
const DA = A.cf.center, DB = up(A.ql0.top, 6), DM = [(DA[0] + DB[0]) / 2, (DA[1] + DB[1]) / 2 - 20];
add(L.LETTERS[0], S.hid("dA", `<circle id="dA-c" cx="${DA[0]}" cy="${DA[1]}" r="11" fill="#e0453a"/>`), 20);
add(L.LETTERS[0], S.hid("dB", `<circle id="dB-c" cx="${DB[0]}" cy="${DB[1]}" r="11" fill="#e0453a"/>`), 21);
add(L.CONFIRM, S.hid("rgC", `<rect x="${DA[0] - 70}" y="${DA[1] - 20}" width="140" height="40" rx="6" fill="none" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="9 6"/>`), 22);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-ep", up(A.pB.top, 8), "代理", "lab-ink");
lb("lb-ei", up(A.iB.top, 8), "实现合约", "lab-ink");
lb("lb-iD", [IC[0] + 48, IC[1] + 20], "主人写在实现自己这里", "lab-cs lab-sm", "l");
lb("lb-no", [PC[0] - 48, PC[1] + 20], "写不进代理", "lab-r lab-sm", "r");
lb("lb-i2", up(A.lI2.top, 6), "初始化函数", "lab-cs lab-sm");
lb("lb-lD", up(A.lD.top, 6), "① 部署", "lab-cs lab-sm");
lb("lb-lI", up(A.lI.top, 6), "② 初始化", "lab-cs lab-sm");
lb("lb-hg", up(A.hg.top, 6), "空隙", "lab-r lab-sm");
lb("lb-pA", [PC[0] - 48, PC[1] - 20], "主人 = 抢先者", "lab-rs lab-sm", "r");
lb("lb-lM", up(A.lM.top, 4), "部署 + 初始化 · 同一笔", "lab-gs lab-sm", "t");
lb("lb-rep", [PC[0] - 48, PC[1] - 34], "✗ 反复重置", "lab-r lab-sm", "r");
lb("lb-once", [PC[0] + 48, PC[1] + 6], "只能一次", "lab-gs lab-sm", "l");
lb("lb-pOK", [PC[0] - 48, PC[1] + 44], "已初始化", "lab-gs lab-sm", "r");
lb("lb-iNo", [IC[0] + 48, IC[1] - 24], "没初始化", "lab-rs lab-sm", "l");
lb("lb-sp", A.ep.glass, "存储：主人 = 部署者", "lab-gs lab-sm", "c");
lb("lb-si", A.ei.glass, "存储：空", "lab-rs lab-sm", "c");
lb("lb-iA", [IC[0] + 48, IC[1] + 22], "主人 = 攻击者", "lab-rs lab-sm", "l");
lb("lb-vic", up(A.v1.top, 50), "指向它的代理", "lab-r lab-sm");
lb("lb-lock", [A.lock.center[0] + 60, A.lock.center[1]], "禁用初始化", "lab-gs lab-sm", "l");
lb("lb-cf0", up(A.cf.top, 8), "全零 → 已确认", "lab-r");
lb("lb-l0", up(A.ql0.top, 10), "根：全零", "lab-r lab-sm");
lb("lb-eq", up(DM, 18), "默认值 = 合法值", "lab-r");
lb("lb-ok", up(A.gate.top, 10), "✓ 未授权消息被拦下", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const CD = { x: 60, y: 330, w: 740 };
const cardD = codeCard("cdD", { ...CD, head: "初始化的三处修复", tag: "Solidity", rows: [
  { html: "constructor() { _disableInitializers(); }" },
  { html: "function initialize(…) external <b>initializer</b>" },
  { html: "new ERC1967Proxy(impl, initCall);   // 同一笔" },
] });
S.curve("cv2", [CD.x + CD.w + 4, codeRowY(CD.y, 2)], S.scr("E2", A.lM.top), { color: "#1f9d55" });
S.curve("cv1", [CD.x + CD.w + 4, codeRowY(CD.y, 1)], S.scr("E2", [PC[0] - 34, PC[1]]), { color: "#1f9d55" });
S.curve("cv0", [CD.x + CD.w + 4, codeRowY(CD.y, 0)], S.scr("E2", A.lock.center), { color: "#1f9d55" });
const CE = { x: 1150, y: 330, w: 700 };
const cardE = codeCard("cdE", { ...CE, head: "Nomad 的判断", tag: "Solidity", rows: [
  { html: "confirmAt[0x00] = 1;", chip: "初始化参数", chipCls: "x" },
  { html: "bytes32 root = messages[hash];", chip: "默认 0x00", chipCls: "x" },
  { html: "require(acceptableRoot(root));", chip: "0x00 = 可信", chipCls: "x" },
] });
S.curve("ce0", [CE.x - 4, codeRowY(CE.y, 0)], S.scr("nomad", [A.cf.center[0] + 60, A.cf.center[1]]), { color: "#e0453a" });
S.curve("ce1", [CE.x - 4, codeRowY(CE.y, 1)], S.scr("nomad", up(A.ql0.top, 4)), { color: "#e0453a" });
const html = cardD + cardE
  + kw("kw-q", "先猜 · 能直接初始化 <b>实现合约</b> 吗", { x: 80, y: 430, size: 40 })
  + evt("ev-oz", `OpenZeppelin 安全公告 · 2021 年 9 月<br><span style="font-size:0.8em">UUPS 4.1.0–4.3.1 受影响 · 4.3.2 修复</span>`)
  + ck("ck0", "初始化参数和代码一样审计", { x: 1180, y: 660, w: 660, kind: "c" })
  + ck("ck1", "零值不带业务含义", { x: 1180, y: 740, w: 660, kind: "c" })
  + ck("ck2", "回归测试：未授权消息必须被拒绝", { x: 1180, y: 820, w: 660, kind: "g" });
const css = `#cdD [id^="cdD-r"], #cdE [id^="cdE-r"] { font-size: 22px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  noProxy: w("写不进代理", 1), initFn: w("初始化函数", 2), gap: w("空隙", 5), fix5: w("同一笔交易", 5), once: w("修饰器", 6),
  implNo: w("实现合约本身", 7), empty: w("还是空的", 8), fail: w("失效", 11), dis: w("禁用初始化", 13),
  zero15: w("全零", 15), zero16: w("全零", 16), audit: w("审计", 18), unauth: w("未授权", 20),
};
TM.stop = Math.min(TM.unauth + 1.0, S.TOTAL - 2.6);   // 横杆落下；末尾 hold 前做完
const t = (x) => f(x);

S.build({
  cam0: "D", sub: "谁先初始化，谁就是主人",
  grid: { u0: -4400, u1: 6200, v0: -6000, v1: 4000 }, box: [-4000, -2300, 8400, 3400],   // D → E → B → A
  shown: [], css, html,
  terms: [
    { id: "t0", t: "构造函数", d: "合约部署时只执行一次的函数", at: w("构造函数", 0) },
    { id: "t1", t: "修饰器", d: "附加在函数上的前置检查", at: w("修饰器", 6) },
    { id: "t2", t: "自毁", d: "删除合约代码的操作", at: w("自毁", 11) },
    { id: "t3", t: "回归测试", d: "改动后重跑旧测试，确认没改坏", at: w("回归测试", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 普通合约用构造函数设置主人。代理合约不行。
      cam(${t(LS[0] + 0.2)}, "E2", 1.8); pop("#lb-ep", ${t(LS[0] + 2.1)}, 0.25); pop("#lb-ei", ${t(LS[0] + 2.4)}, 0.25);
      // ===== L1 构造函数只在实现合约自己的存储里运行，写不进代理。
      bump("#dep", ${t(LS[1] + 0.2)}); fadeIn("#iD-h", ${t(LS[1] + 0.6)}, 0.4); pop("#lb-iD", ${t(LS[1] + 1.0)}, 0.25); X1.gears(tl, "ei", ${t(LS[1] + 1.2)}, 2.4, 1);
      pop("#lb-no", ${t(TM.noProxy)}, 0.25); flash("#lb-no", ${t(TM.noProxy + 0.4)}, 2);
      // ===== L2 所以可升级合约用一个初始化函数代替，部署以后再调用一次。
      out("#lb-no, #lb-iD, #iD-h", ${t(LS[2] - 0.2)}, 0.3);
      fadeIn("#lI2-h", ${t(TM.initFn - 0.4)}, 0.3); pop("#lb-i2", ${t(TM.initFn - 0.2)}, 0.25);
      X1.walk(tl, "lI2", ${t(TM.initFn + 0.6)}, 1.6, [${JSON.stringify(P_I2)}]); out("#lb-i2", ${t(TM.initFn + 0.5)}, 0.2);
      fadeIn("#pD-h", ${t(TM.initFn + 2.3)}, 0.3); out("#lI2-h", ${t(TM.initFn + 2.4)}, 0.3);
      // ===== L3 这一次调用，就是风险所在。
      fadeIn("#rgP", ${t(LS[3] + 0.3)}, 0.3); flash("#rgP", ${t(LS[3] + 0.7)}, 3);
      // ===== L4 第一种情况：部署代理和初始化，分成了两笔交易。
      out("#pD-h, #rgP", ${t(LS[4] - 0.2)}, 0.3);
      fadeIn("#lD-h", ${t(LS[4] + 0.4)}, 0.3); pop("#lb-lD", ${t(LS[4] + 0.6)}, 0.25);
      fadeIn("#hg-h", ${t(LS[4] + 1.0)}, 0.3); pop("#lb-hg", ${t(LS[4] + 1.2)}, 0.25); KIT.sand(tl, "hg", ${t(LS[4] + 1.4)}, 3);
      fadeIn("#lI-h", ${t(LS[4] + 1.6)}, 0.3); pop("#lb-lI", ${t(LS[4] + 1.8)}, 0.25);
      // ===== L5 中间有空隙，别人可以抢先初始化，成为主人。修复是在同一笔交易里完成。
      bump("#lb-hg", ${t(TM.gap)}); bump("#atk", ${t(TM.gap + 0.2)}); fadeIn("#lR-h", ${t(TM.gap + 0.3)}, 0.3);
      X1.walk(tl, "lR", ${t(TM.gap + 0.5)}, 1.3, [${JSON.stringify(P_R)}]);
      fadeIn("#pA-h", ${t(TM.gap + 2.0)}, 0.3); pop("#lb-pA", ${t(TM.gap + 2.2)}, 0.25);
      out("#lR-h, #pA-h, #lb-pA, #lD-h, #lI-h, #hg-h, #lb-lD, #lb-lI, #lb-hg", ${t(TM.fix5 - 0.7)}, 0.3);
      pop("#cdD", ${t(TM.fix5 - 0.4)}); hot("#cdD-r2", ${t(TM.fix5 + 0.1)}, "#e3f4ea");
      fadeIn("#lM-h", ${t(TM.fix5)}, 0.3); pop("#lb-lM", ${t(TM.fix5 + 0.3)}, 0.25); draw("cv2", ${t(TM.fix5 + 0.3)});
      fadeIn("#pD-h", ${t(TM.fix5 + 0.8)}, 0.3);
      // ===== L6 第二种：初始化函数可以重复调用，任何人都能重置主人。修复是加上只能调用一次的修饰器。
      out("#lM-h, #lb-lM, #cv2", ${t(LS[6] - 0.2)}, 0.3);
      [0, 1, 2, 3, 4, 5].forEach((k) => { const tt = ${t(LS[6] + 0.8)} + k * 0.55;
        tl.set("#pA-h", { opacity: k % 2 ? 0 : 1 }, tt); tl.set("#pD-h", { opacity: k % 2 ? 1 : 0 }, tt); });
      X1.gears(tl, "ep", ${t(LS[6] + 0.2)}, 3.2, 1.5);
      pop("#lb-rep", ${t(LS[6] + 1.6)}, 0.25); fadeIn("#rgP", ${t(LS[6] + 1.6)}, 0.3);
      out("#lb-rep, #rgP", ${t(TM.once - 0.9)}, 0.3);
      hot("#cdD-r1", ${t(TM.once - 0.6)}, "#e3f4ea"); draw("cv1", ${t(TM.once - 0.4)}); pop("#lb-once", ${t(TM.once)}, 0.25);
      // ===== L7 第三种：代理初始化了，实现合约本身没有。
      out("#cdD, #cv1, #lb-once", ${t(LS[7] - 0.2)}, 0.3);
      pop("#lb-pOK", ${t(LS[7] + 0.4)}, 0.25); fadeIn("#rgI", ${t(TM.implNo)}, 0.3); pop("#lb-iNo", ${t(TM.implNo + 0.3)}, 0.25);
      // ===== L8 代理的初始化，写在代理的存储里。实现合约自己的存储，还是空的。
      pop("#lb-sp", ${t(LS[8] + 0.4)}, 0.25); pop("#lb-si", ${t(TM.empty)}, 0.25); flash("#lb-si", ${t(TM.empty + 0.4)}, 2);
      // ===== L9 先猜一道题。别人能直接调用实现合约的初始化函数吗？
      out("#lb-sp, #lb-si, #lb-pOK", ${t(LS[9] - 0.2)}, 0.3); pop("#kw-q", ${t(LS[9] + 0.3)}); bump("#atk", ${t(LS[9] + 2.6)}); X1.gears(tl, "ei", ${t(LS[9] + 1.5)}, 3, 1);
      // ===== L10 能。他会成为实现合约的主人。
      out("#kw-q", ${t(LS[10] - 0.1)}, 0.3); bump("#atk", ${t(LS[10] + 0.2)});
      out("#lb-iNo", ${t(LS[10] + 0.5)}, 0.2); fadeIn("#iA-h", ${t(LS[10] + 0.8)}, 0.3); pop("#lb-iA", ${t(LS[10] + 1.1)}, 0.25);
      // ===== L11 如果实现合约里有 delegatecall 或者自毁的路径，所有指向它的代理，都可能失效。
      fadeIn("#pp0-h, #pp1-h, #pp2-h", ${t(LS[11] + 0.3)}, 0.6); X1.dash(tl, ["pp0-flow", "pp1-flow", "pp2-flow"], ${t(LS[11] + 0.9)}, 4.5, -240);
      pop("#lb-vic", ${t(LS[11] + 1.2)}, 0.25);
      [0, 1, 2].forEach((i) => KIT.broke(tl, "v" + i, ${t(TM.fail - 1.0)} + i * 0.4, { badge: false }));
      // ===== L12 2021 年 9 月，OpenZeppelin 发布安全公告：它的 UUPS 实现，有几个版本存在这个问题，随后发布了修复版本。
      pop("#ev-oz", ${t(LS[12] + 0.3)});
      // ===== L13 修复是在实现合约的构造函数里，禁用初始化。这样谁都不能再初始化它。
      out("#ev-oz, #lb-iA, #lb-vic", ${t(LS[13] - 0.2)}, 0.3); pop("#cdD", ${t(LS[13] + 0.3)}); hot("#cdD-r0", ${t(TM.dis - 0.4)}, "#e3f4ea");
      fadeIn("#lock-h", ${t(TM.dis)}, 0.3); draw("cv0", ${t(TM.dis)}); pop("#lb-lock", ${t(TM.dis + 0.3)}, 0.25);
      tl.to("#iA-h", { y: -70, opacity: 0, duration: 0.5, ease: "power2.in" }, ${t(TM.dis + 0.7)}); out("#rgI", ${t(TM.dis + 0.7)}, 0.3);
      out("#pp0-h, #pp1-h, #pp2-h", ${t(TM.dis + 1.2)}, 0.4); [0, 1, 2].forEach((i) => KIT.fixed(tl, "v" + i, ${t(TM.dis + 1.3)} + i * 0.2));
      // ===== L14 回到开头的 Nomad。它的问题，出在升级时的初始化参数。
      out("#cdD, #cv0, #lb-lock, #lb-ep, #lb-ei", ${t(LS[14] - 0.2)}, 0.3);
      cam(${t(LS[14] + 0.1)}, "A", 3.8, "power2.inOut");
      // ===== L15 合约用一张表，记录每个根什么时候被确认。升级把全零这个根，标记成了已确认。
      cam(${t(LS[15])}, "nomad", 1.2); pop("#cdE", ${t(LS[15] + 1.4)});
      hot("#cdE-r0", ${t(TM.zero15)}, "#fbe3e1"); draw("ce0", ${t(TM.zero15 + 0.2)}); pop("#lb-cf0", ${t(TM.zero15 + 0.5)}, 0.25);
      // ===== L16 而没被证明过的消息，查到的根，默认也是全零。
      hot("#cdE-r1", ${t(TM.zero16 - 0.4)}, "#fbe3e1"); draw("ce1", ${t(TM.zero16 - 0.2)}); pop("#lb-l0", ${t(TM.zero16 + 0.1)}, 0.25);
      // ===== L17 默认值和合法值，撞在了一起。
      out("#lb-cf0, #lb-l0, #ce0, #ce1", ${t(LS[17] - 0.1)}, 0.25); fadeIn("#dA, #dB", ${t(LS[17] + 0.1)}, 0.25);
      tl.to("#dA-c, #dB-c", { attr: { cx: ${f(DM[0])}, cy: ${f(DM[1])} }, duration: 1.0, ease: "power2.inOut" }, ${t(LS[17] + 0.4)});
      out("#dB", ${t(LS[17] + 1.4)}, 0.1); tl.to("#dA-c", { attr: { r: 18 }, duration: 0.3, yoyo: true, repeat: 1 }, ${t(LS[17] + 1.4)});
      hot("#cdE-r2", ${t(LS[17] + 1.2)}, "#fbe3e1"); pop("#lb-eq", ${t(LS[17] + 1.6)}, 0.25);
      // ===== L18 教训有三条。初始化参数，和代码一样需要审计。
      out("#cdE, #lb-eq, #dA", ${t(LS[18] - 0.2)}, 0.3); cam(${t(LS[18])}, "A", 1.4);
      pop("#ck0", ${t(LS[18] + 1.6)}); fadeIn("#lens-h", ${t(TM.audit - 0.6)}, 0.4);
      // ===== L19 零值不能带有业务含义，默认值必须和合法值区分开。
      out("#lens-h", ${t(LS[19] - 0.1)}, 0.3); pop("#ck1", ${t(LS[19] + 0.3)}); fadeIn("#rgC", ${t(LS[19] + 0.8)}, 0.3); flash("#rgC", ${t(LS[19] + 1.1)}, 2);
      // ===== L20 升级以后要跑回归测试，覆盖这一条：未授权的消息必须被拒绝。
      pop("#ck2", ${t(LS[20] + 0.3)}); out("#ql0", ${t(TM.stop - 2.0)}, 0.2); fadeIn("#rl-h", ${t(TM.stop - 2.0)}, 0.2);
      X1.walk(tl, "rl", ${t(TM.stop - 1.8)}, 1.2, [${JSON.stringify(P_RL)}]); KIT.arm(tl, "gate", ${t(TM.stop - 1.0)}, false, 0.6);
      pop("#lb-ok", ${t(TM.stop)}, 0.25);
`,
});
