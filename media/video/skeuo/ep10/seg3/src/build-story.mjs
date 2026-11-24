// ep10/seg3「③ 存储冲突」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.C（BRIEF 第 2 节镜头路线：起始区 C）。
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
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.D

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const wrapK = (key, o, k) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`,
    fix: () => { for (const [n, v] of Object.entries(A[key])) if (Array.isArray(v)) A[key][n] = typeof v[0] === "number" ? sc(v) : v.map((q) => (Array.isArray(q) && typeof q[0] === "number" ? sc(q) : q)); } };
};
const hidW = (id) => (svg) => `<g id="${id}" opacity="0">${svg}</g>`;
// C 区三个展台（起始镜头，与 seg2 段尾一致）
put("tsign", L.TRANS.sign, E1.signBoard(L.TRANS.sign, { id: "tsign", style: "plate", text: "透明代理" }));
put("tvend", L.TRANS.vend, E1.vending(L.TRANS.vend, { id: "tvend", scale: L.TRANS.vend.scale, sign: "代理" }));
put("admin", L.TRANS.admin, O.person(L.TRANS.admin, { id: "admin", role: "engineer" }));
put("tkey", L.TRANS.key, O.key(L.TRANS.key, { id: "tkey" }));
put("trule", L.TRANS.rule, E1.signBoard(L.TRANS.rule, { id: "trule", text: "管理员：不转发", sub: "其他人：只转发", size: 22 }));
put("usign", L.UUPS.sign, E1.signBoard(L.UUPS.sign, { id: "usign", style: "plate", text: "UUPS" }));
put("uvend", L.UUPS.vend, E1.vending(L.UUPS.vend, { id: "uvend", scale: L.UUPS.vend.scale, sign: "代理", maintDoor: true, mdoorOpen: 105 }));
put("bsign", L.BEACON.sign, E1.signBoard(L.BEACON.sign, { id: "bsign", style: "plate", text: "信标代理" }));
{ const W = wrapK("tower", L.BEACON.tower, L.BEACON.tower.scale); put("tower", L.BEACON.tower, O.tower(L.BEACON.tower, { id: "tower" }), 0, { wrap: W.wrap }); W.fix(); }
L.BEACON.vaults.forEach((q, i) => put("vault" + i, q, E1.vending(q, { id: "vault" + i, scale: q.scale, sign: "金库" })));
// D 区档案室
put("cab", L.CAB, E3.slotCabinet(L.CAB, { id: "cab", n: 5, title: "代理存储",
  fill: { 0: [{ bytes: 20, color: "teal" }], 1: [{ bytes: 32, color: "gray" }], 2: [{ bytes: 32, color: "green" }] } }));
{ const W = wrapK("eip", L.EIP, L.EIP.scale); put("eip", L.EIP, E3.slotCabinet(L.EIP, { id: "eip", n: 1, labels: ["0x3608…"], title: "EIP-1967" }), 0, { wrap: W.wrap }); W.fix(); }
put("man0", L.MANUALS[0], E3.manual(L.MANUALS[0], { id: "man0", title: "实现 V1", sub: "变量顺序", pageTitle: "V1", pageText: "owner · total" }));
put("man1", L.MANUALS[1], E3.manual(L.MANUALS[1], { id: "man1", title: "实现 V2", sub: "变量顺序", pageTitle: "V2", pageText: "fee · owner" }));
const BY2 = { ...L.BYTES, u: L.BYTES.u + 120 };
put("bA", L.BYTES, E3.byteBlock(L.BYTES, { id: "bA", bytes: 12, color: "gray" }), 0, { wrap: hidW("bAw") });
put("bB", BY2, E3.byteBlock(BY2, { id: "bB", bytes: 20, color: "gray" }), 0, { wrap: hidW("bBw") });
put("bR", BY2, E3.byteBlock(BY2, { id: "bR", bytes: 20, color: "red" }), 0, { wrap: hidW("bRw") });
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag", z: L.MAG.z }), 0, { wrap: hidW("magw") });
put("key0", L.KEYS[0], E3.selectorKey(L.KEYS[0], { id: "key0", name: "burn(uint256)", selector: "42966c68" }));
put("key1", L.KEYS[1], E3.selectorKey(L.KEYS[1], { id: "key1", name: "collate_propagate_storage(bytes16)", selector: "42966c68" }));
put("svend", L.SVEND, E1.vending(L.SVEND, { id: "svend", scale: L.SVEND.scale, sign: "代理", maintDoor: true, mdoorOpen: 105 }));

// 抽屉面上的点：i 号抽屉，沿 u 偏 du 格，再上下偏 dy
const DR = A.cab.drawers, CS = Array.isArray(A.cab.cellStep) ? A.cab.cellStep : [8.19, -2.87];
const fp = (i, du = 0, dy = 0) => [DR[i][0] + CS[0] * du, DR[i][1] + CS[1] * du + dy];
const mv = (p, q) => [Math.round(q[0] - p[0]), Math.round(q[1] - p[1])];
const E0 = A.eip.drawers[0];
// 派生位置被挡住 + 长距离虚线（L7）
const P4 = fp(4, 0), mid = [(P4[0] + E0[0]) / 2, (P4[1] + E0[1]) / 2];
const cabTop = A.cab.top, ar = (k) => [cabTop[0] + (E0[0] - cabTop[0]) * k, cabTop[1] + (E0[1] - cabTop[1]) * k];
const [a1, a2] = [ar(0.18), ar(0.42)];
add(L.EIP, S.hid("dist", `<path d="M${P4[0]},${P4[1]} L${E0[0]},${E0[1]}" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10" fill="none"/>
  <circle cx="${E0[0]}" cy="${E0[1]}" r="8" fill="#2aa3c9"/>`), 200);
add(L.EIP, S.hid("deriv", `<path d="M${cabTop[0] - 30},${cabTop[1] - 10} L${a1[0] - 30},${a1[1] - 40}" stroke="#1d93ba" stroke-width="5" fill="none" marker-end="none"/>
  <path d="M${cabTop[0] + 30},${cabTop[1] - 10} L${a1[0] + 20},${a1[1] - 10}" stroke="#1d93ba" stroke-width="5" fill="none"/>
  <line x1="${a2[0] - 70}" y1="${a2[1] - 30}" x2="${a2[0] + 40}" y2="${a2[1] + 30}" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/>`), 200);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lv0", fp(0, 4), "owner", "lab-cs lab-sm", "c");
lb("lv1", fp(1, 4), "totalDeposits", "lab-cs lab-sm", "c");
lb("lv2", fp(2, 4), "balances", "lab-cs lab-sm", "c");
const P0 = fp(0, 4);
const PV0 = fp(0, -30, -10), IM0 = fp(0, 34, -10);
lb("lpv", PV0, "代理的变量", "lab-cs lab-sm", "c");
lb("lim", IM0, "实现的变量", "lab-gs lab-sm", "c");
const L3 = [P0[0], P0[1] - 14], L4 = [P0[0] + 80, P0[1] + 48];
lb("l3", L3, "实现地址", "lab-cs lab-sm", "c");
lb("l3r", [L3[0] + 3, L3[1]], "实现地址", "lab-rs lab-sm", "c");
lb("l4", L4, "管理员", "lab-rs lab-sm", "c");
const L6a = [P0[0] - 60, P0[1] - 32], L6b = [P0[0] + 60, P0[1] + 32];
lb("l6a", L6a, "实现地址", "lab-cs lab-sm", "c");
lb("l6b", L6b, "管理员地址", "lab-cs lab-sm", "c");
const T6a = [E0[0] - 160, E0[1] - 50], T6b = [E0[0] - 160, E0[1] + 40];
lb("lk1", up(mid, 30), "keccak − 1", "lab-cs lab-sm");
lb("lder", up(a2, 40), "映射 / 数组的派生位置", "lab-rs lab-sm");
lb("lm0", up(A.man0.top, 10), "实现 V1", "lab-ink lab-sm");
lb("lm1", up(A.man1.top, 10), "实现 V2", "lab-ink lab-sm");
lb("lbad", up(A.bR.top, 10), "被当成地址", "lab-rs lab-sm");
lb("lfee", [P0[0] + 3, P0[1] + 2], "feeBps", "lab-rs lab-sm", "c");
const X3P = [A.cab.drawersOpen[3][0] + CS[0] * 26, A.cab.drawersOpen[3][1] + CS[1] * 26];
lb("lx3", X3P, "余额：空 ✕", "lab-rs lab-sm", "c");
lb("lres", fp(4, 4), "预留空槽", "lab-gs lab-sm", "c");
lb("lcut", up(A.svend.top, 10), "被代理截下", "lab-rs");
const DSTEP = mv(DR[0], DR[1]);

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 300, w: 680 };
const cardA = codeCard("cA", { ...CA, mono: true, head: "朴素代理", tag: "示例", rows: [
  "contract NaiveProxy {", `  address implementation; <span class="c-cm">// slot 0</span>`,
  "contract Impl {", `  address owner;          <span class="c-cm">// slot 0</span>`] });
S.curve("cvA1", [CA.x + CA.w + 4, codeRowY(CA.y, 1)], S.scr("cab", P0), { color: "#e0453a" });
S.curve("cvA3", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("cab", P0), { color: "#e0453a" });
S.curve("cv5", S.scr("CD", fp(0, 0)), S.scr("CD", A.uvend.impl), { color: "#e0453a" });
const CB = { x: 60, y: 300, w: 640 };
const cardB = codeCard("cB", { ...CB, mono: true, head: "修复：EIP-1967 槽位", rows: [
  "bytes32 IMPL_SLOT = bytes32(", "  uint256(keccak256(", `    "eip1967.proxy.implementation"`, `  )) <span class="c-red">- 1</span>);`] });
S.curve("cvB", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("eip", E0), { color: "#e0453a" });
const cr = (a, b, c) => `<span class="k1">${a}</span><span class="k2">${b}</span><span class="k3">${c}</span>`;
const arw = `<span class="c-red ar">↓</span>`;
const cardC = codeCard("cC", { x: 60, y: 300, w: 840, mono: true, head: "存储布局", tag: "示例", rows: [
  cr("V1", `V2 <span class="c-red">✗</span>`, `V2 <span class="ok">✓</span>`),
  cr("0 owner", `<span class="c-red">0 feeBps</span> ${arw}`, "0 owner"),
  cr("1 totalDeposits", `1 owner ${arw}`, "1 totalDeposits"),
  cr("2 balances", `2 totalDeposits ${arw}`, "2 balances"),
  cr("", `3 balances ${arw}`, `<span class="ok">3 feeBps</span>`)] });
const cardRep = codeCard("cRep", { x: 60, y: 300, w: 470, head: "布局比对报告", tag: "工具", rows: [
  `<span class="c-red">slot 0：owner → feeBps</span>`, "OpenZeppelin 升级插件", "forge inspect"] });
const cardP = codeCard("cP", { x: 60, y: 300, w: 530, mono: true, head: "代理的函数", rows: [
  "upgradeTo(address)", { html: "burn(uint256)", chip: "42966c68", chipCls: "x" }] });
const cardI = codeCard("cI", { x: 60, y: 540, w: 530, mono: true, head: "实现的函数", rows: [
  "collate_propagate_storage(bytes16)", { html: "→", chip: "42966c68", chipCls: "x" }] });
const smag = `<svg id="smag" class="hide" style="position:absolute;left:500px;top:330px" width="90" height="90" viewBox="0 0 90 90">
  <circle cx="36" cy="36" r="26" fill="rgba(42,163,201,0.12)" stroke="#1c1c1c" stroke-width="7"/><line x1="56" y1="56" x2="84" y2="84" stroke="#1c1c1c" stroke-width="10" stroke-linecap="round"/></svg>`;
const html = cardA + cardB + cardC + cardRep + cardP + cardI + smag
  + kw("kw-guess", "先猜一道题", { x: 1330, y: 330, size: 40, accent: "#2aa3c9" })
  + kw("kw-q", "升级后读 <b>owner</b>，读到？", { x: 1320, y: 310, size: 34, accent: "#e0453a" })
  + kw("kw-rule", "升级规则 <b>4</b> 条", { x: 1330, y: 300, size: 36 })
  + ck("r1", "只在末尾追加", { x: 1330, y: 390, w: 530 })
  + ck("r2", "不删 · 不重排 · 不改类型", { x: 1330, y: 474, w: 530 })
  + ck("r3", "预留空槽 / ERC-7201", { x: 1330, y: 558, w: 530 })
  + ck("r4", "工具比对布局", { x: 1330, y: 642, w: 530 })
  + ck("x1", "删除", { x: 1330, y: 570, w: 170, kind: "r" }) + ck("x2", "换位", { x: 1510, y: 570, w: 170, kind: "r" }) + ck("x3", "改类型", { x: 1690, y: 570, w: 170, kind: "r" })
  + kw("kw-sel", `同一个选择器 <b>42966c68</b>${gtag("示例")}`, { x: 60, y: 290, size: 32, accent: "#e0453a" })
  + ck("ck-tr", "透明代理：管理员不转发 / 其他人只转发", { x: 60, y: 300, w: 760 });
const css = `
    #cA .c-row, #cB .c-row { font-size: 26px; }
    #cC .c-row { font-size: 24px; display: grid; grid-template-columns: 230px 290px 250px; }
    #cC .k2, #cC .k3 { opacity: 0; } #cC .ok { color: #1f9d55; font-weight: 800; }
    #cI .c-row { font-size: 22px; } #cP .c-row { font-size: 24px; }
    #x1, #x2, #x3 { font-size: 28px; padding: 0 14px; gap: 10px; }
    #ck-tr { font-size: 28px; }
    #lv0, #lv1, #lv2 { font-size: 22px; padding: 0 10px 2px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const W = (s, i, d) => { try { const v = w(s, i); return v == null || isNaN(v) ? LS[i] + d : v; } catch { return LS[i] + d; } };
const TM = { admin4: W("管理员", 4, 1.5), rewrite: W("改写", 5, 1.6), minus: W("减去", 7, 3.5), cut: W("截掉", 12, 2.0),
  gone: W("消失", 14, 4.0), readAdmin: W("读管理员", 11, 3.6), intercept: W("截下", 22, 2.2), tool: W("工具", 23, 4.0) };
const t = (x) => f(x);

S.build({
  cam0: "C", sub: "代码只认格子编号",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "EIP-1967", d: "代理存放实现地址的标准槽位", at: w("EIP-1967", 6) },
    { id: "t1", t: "映射", d: "按键存取的表，位置由哈希派生", at: w("映射", 7) },
    { id: "t2", t: "ERC-7201", d: "按命名空间分配存储位置的标准", at: w("ERC-7201", 18) },
    { id: "t3", t: "函数选择器", d: "函数签名哈希的前 4 字节", at: w("函数选择器", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 代理的存储，是一排编了号的格子，叫槽位。
      cam(${t(LS[0] + 0.1)}, "cab", 2.4);
      [0, 1, 2, 3, 4].forEach((i) => X3.mark(tl, "cab", i, ${t(LS[0] + 2.6)} + i * 0.18, "teal"));
      pop("#lv0, #lv1, #lv2", ${t(LS[0] + 3.4)});
      // ===== L1 代码不认变量名，只认格子的编号。
      out("#lv0, #lv1, #lv2", ${t(LS[1] + 0.8)}, 0.5);
      [0, 1, 2, 3, 4].forEach((i) => X3.mark(tl, "cab", i, ${t(LS[1] + 1.6)} + i * 0.12, "green"));
      [0, 1, 2, 3, 4].forEach((i) => X3.mark(tl, "cab", i, ${t(LE[1] - 0.2)}, "off"));
      // ===== L2 第一种冲突：代理自己的变量，和实现的变量，撞进同一个格子。
      pop("#lpv", ${t(LS[2] + 1.0)}); pop("#lim", ${t(LS[2] + 2.6)});
      tl.to("#lpv", { x: ${mv(PV0, [P0[0] - 40, P0[1] - 14])[0]}, y: ${mv(PV0, [P0[0] - 40, P0[1] - 14])[1]}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[2] + 3.6)});
      tl.to("#lim", { x: ${mv(IM0, [P0[0] + 40, P0[1] + 14])[0]}, y: ${mv(IM0, [P0[0] + 40, P0[1] + 14])[1]}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[2] + 3.7)});
      X3.mark(tl, "cab", 0, ${t(LS[2] + 4.5)}, "red");
      // ===== L3 一个朴素的代理，把实现地址放在 0 号槽位。
      out("#lpv, #lim", ${t(LS[3] - 0.2)}, 0.3); X3.mark(tl, "cab", 0, ${t(LS[3])}, "off");
      pop("#cA", ${t(LS[3] + 0.3)}); hot("#cA-r1", ${t(LS[3] + 1.2)});
      draw("cvA1", ${t(LS[3] + 1.5)}); pop("#l3", ${t(LS[3] + 2.2)});
      // ===== L4 实现合约的第一个变量是管理员，也在 0 号槽位。
      hot("#cA-r3", ${t(TM.admin4)}); draw("cvA3", ${t(TM.admin4 + 0.3)});
      out("#l3", ${t(TM.admin4 + 1.0)}, 0.2); pop("#l3r, #l4", ${t(TM.admin4 + 1.0)});
      X3.mark(tl, "cab", 0, ${t(TM.admin4 + 1.1)}, "red"); flash("#l3r, #l4", ${t(TM.admin4 + 1.6)}, 2, 0.4);
      // ===== L5 于是，写管理员，就是改写实现地址。
      out("#cA, #cvA1, #cvA3, #l3r, #l4", ${t(LS[5] - 0.2)}, 0.3);
      cam(${t(LS[5])}, "CD", 1.2);
      X3.clearDrawer(tl, "cab", 0, ${t(TM.rewrite)});
      draw("cv5", ${t(LS[5] + 1.4)}, 0.8);
      KIT.swap(tl, "#uvend-impl", "#uvend-impl-atk", ${t(LS[5] + 2.3)}, 0.4);
      // ===== L6 修复是 EIP-1967。它用一个哈希算出的固定槽位，存放实现地址和管理员地址。
      out("#cv5", ${t(LS[6] - 0.2)}, 0.3); X3.mark(tl, "cab", 0, ${t(LS[6])}, "off"); X3.fillDrawer(tl, "cab", 0, ${t(LS[6])});
      KIT.swap(tl, "#uvend-impl-atk", "#uvend-impl", ${t(LS[6])}, 0.3);
      cam(${t(LS[6])}, "eip", 1.4);
      pop("#cB", ${t(LS[6] + 1.2)}); hot("#cB-r2", ${t(LS[6] + 2.2)}); draw("cvB", ${t(LS[6] + 2.5)});
      pop("#l6a, #l6b", ${t(LS[6] + 3.6)});
      tl.to("#l6a", { x: ${mv(L6a, T6a)[0]}, y: ${mv(L6a, T6a)[1]}, duration: 1.0, ease: "power2.inOut" }, ${t(LS[6] + 4.4)});
      tl.to("#l6b", { x: ${mv(L6b, T6b)[0]}, y: ${mv(L6b, T6b)[1]}, duration: 1.0, ease: "power2.inOut" }, ${t(LS[6] + 4.6)});
      X3.mark(tl, "eip", 0, ${t(LS[6] + 5.6)}, "teal");
      // ===== L7 这个位置远离普通变量。算法里还减去 1，让映射和数组的派生位置，碰不到它。
      out("#cvB", ${t(LS[7])}, 0.3);
      fadeIn("#dist", ${t(LS[7] + 0.4)}, 0.6); pop("#lk1", ${t(TM.minus)});
      hot("#cB-r3", ${t(TM.minus)});
      fadeIn("#deriv", ${t(TM.minus + 1.2)}, 0.5); pop("#lder", ${t(TM.minus + 1.6)});
      // ===== L8 第二种冲突：升级前后，变量的顺序变了。
      out("#cB, #dist, #deriv, #lk1, #lder, #l6a, #l6b", ${t(LS[8] - 0.2)}, 0.3); X3.mark(tl, "eip", 0, ${t(LS[8])}, "off");
      cam(${t(LS[8])}, "cab", 1.3);
      X3.book(tl, "man0", ${t(LS[8] + 1.2)}, 180, 0.9); X3.book(tl, "man1", ${t(LS[8] + 1.5)}, 180, 0.9);
      pop("#lm0, #lm1", ${t(LS[8] + 2.3)});
      // ===== L9 先猜一道题。
      pop("#kw-guess", ${t(LS[9])});
      // ===== L10 旧版本里，0 号槽位是管理员，1 号是存款总额。
      out("#lm0, #lm1", ${t(LS[10])}, 0.2); pop("#cC", ${t(LS[10] + 0.2)}); pop("#lv0, #lv1, #lv2", ${t(LS[10] + 1.0)});
      // ===== L11 新版本在最前面，插入了一个手续费变量。升级以后读管理员，读到的是什么？
      fadeIn("#cC .k2", ${t(LS[11] + 0.6)}, 0.5); 
      out("#kw-guess", ${t(TM.readAdmin - 0.3)}, 0.2); pop("#kw-q", ${t(TM.readAdmin)});
      // ===== L12 读到的是旧的存款总额，截掉一部分，被解释成一个地址。
      X3.drawer(tl, "cab", 1, ${t(LS[12])}, true, 0.6);
      fadeIn("#bAw, #bBw", ${t(LS[12] + 0.8)}, 0.4);
      X3.fly(tl, "bA", ${t(TM.cut)}, -90, 60, 0.6, 30); out("#bAw", ${t(TM.cut + 0.4)}, 0.4);
      KIT.swap(tl, "#bBw", "#bRw", ${t(TM.cut + 0.9)}, 0.4); pop("#lbad", ${t(TM.cut + 1.3)});
      // ===== L13 因为新代码把管理员挪到了 1 号，而 1 号里还是旧数据。
      out("#kw-q", ${t(LS[13] - 0.2)}, 0.2);
      tl.to("#lv0, #lv1, #lv2", { x: ${DSTEP[0]}, y: ${DSTEP[1]}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[13] + 0.4)});
      flash("#cC .ar", ${t(LS[13] + 0.4)}, 2); pop("#lfee", ${t(LS[13] + 1.3)});
      X3.mark(tl, "cab", 1, ${t(LS[13] + 1.6)}, "red"); bump("#lv0", ${t(LS[13] + 1.8)}, 1.15, 2);
      // ===== L14 后面每一格都错开一位。映射的基址变了，所有余额看上去都消失了。
      X3.drawer(tl, "cab", 1, ${t(LS[14])}, false, 0.5); out("#lbad, #bRw", ${t(LS[14])}, 0.3);
      X3.mark(tl, "cab", 2, ${t(LS[14] + 0.6)}, "red"); bump("#lv1, #lv2", ${t(LS[14] + 0.6)}, 1.12, 1);
      X3.drawer(tl, "cab", 3, ${t(TM.gone - 0.6)}, true, 0.6); X3.mark(tl, "cab", 3, ${t(TM.gone)}, "red"); pop("#lx3", ${t(TM.gone + 0.2)});
      // ===== L15 规则有四条。
      X3.drawer(tl, "cab", 3, ${t(LS[15] - 0.2)}, false, 0.4); out("#lx3, #lfee", ${t(LS[15] - 0.2)}, 0.3);
      [1, 2, 3].forEach((i) => X3.mark(tl, "cab", i, ${t(LS[15] - 0.2)}, "off"));
      tl.to("#lv0, #lv1, #lv2", { x: 0, y: 0, duration: 0.4 }, ${t(LS[15] - 0.2)});
      pop("#kw-rule", ${t(LS[15] + 0.2)});
      // ===== L16 只在末尾追加变量。
      fadeIn("#cC .k3", ${t(LS[16] + 0.2)}, 0.5); pop("#r1", ${t(LS[16] + 0.6)});
      // ===== L17 不删除，不重新排序，不改类型。
      pop("#r2", ${t(LS[17] + 0.2)});
      pop("#x1", ${t(LS[17] + 0.5)}); pop("#x2", ${t(LS[17] + 1.0)}); pop("#x3", ${t(LS[17] + 1.6)});
      // ===== L18 父合约预留一段空槽位，或者用 ERC-7201 的命名空间存储。
      out("#x1, #x2, #x3", ${t(LS[18] - 0.2)}, 0.2);
      pop("#r3", ${t(LS[18] + 0.2)}); X3.mark(tl, "cab", 4, ${t(LS[18] + 1.0)}, "green"); pop("#lres", ${t(LS[18] + 1.2)});
      // ===== L19 用工具比对新旧布局，比如 OpenZeppelin 的升级插件，或者 forge inspect。不要靠肉眼核对。
      out("#cC, #lv0, #lv1, #lv2", ${t(LS[19] - 0.2)}, 0.3);
      pop("#r4", ${t(LS[19] + 0.2)}); pop("#lm0, #lm1", ${t(LS[19] + 0.4)}); fadeIn("#magw", ${t(LS[19] + 0.5)}, 0.4);
      X3.fly(tl, "mag", ${t(LS[19] + 1.0)}, ${mv(A.mag.lens ?? A.mag.center, A.man0.page)[0]}, ${mv(A.mag.lens ?? A.mag.center, A.man0.page)[1]}, 1.0, 20);
      X3.fly(tl, "mag", ${t(LS[19] + 2.4)}, ${mv(A.mag.lens ?? A.mag.center, A.man1.page)[0]}, ${mv(A.mag.lens ?? A.mag.center, A.man1.page)[1]}, 1.0, 20);
      pop("#cRep", ${t(LS[19] + 3.6)});
      // ===== L20 还有一种撞车，不在存储里，而在函数选择器上。
      out("#cRep, #kw-rule, #r1, #r2, #r3, #r4, #lres, #lm0, #lm1", ${t(LS[20] - 0.2)}, 0.3);
      X3.mark(tl, "cab", 4, ${t(LS[20])}, "off");
      cam(${t(LS[20])}, "keys", 1.4);
      // ===== L21 选择器是函数签名哈希的前 4 个字节。两个名字完全不同的函数，可能算出同一个选择器。
      bump("#key0-name", ${t(LS[21] + 2.6)}, 1.06, 1); bump("#key1-name", ${t(LS[21] + 3.0)}, 1.06, 1);
      X3.fade(tl, "#key0-teeth-hl", ${t(LS[21] + 4.2)}, 1, 0.3); X3.fade(tl, "#key1-teeth-hl", ${t(LS[21] + 4.4)}, 1, 0.3);
      pop("#kw-sel", ${t(LS[21] + 4.8)});
      // ===== L22 代理自己有这个函数时，调用会被代理截下，不会转给实现。
      X3.fade(tl, "#key0-teeth-hl, #key1-teeth-hl", ${t(LS[22])}, 0, 0.3);
      X3.fly(tl, "key1", ${t(LS[22] + 0.3)}, ${mv(A.key1.tip, A.svend.coinSlot)[0]}, ${mv(A.key1.tip, A.svend.coinSlot)[1]}, 1.0, 40);
      flash("#svend-lcd", ${t(TM.intercept - 0.4)}, 2); tl.to("#svend-impl", { opacity: 0.25, duration: 0.4 }, ${t(TM.intercept)});
      pop("#lcut", ${t(TM.intercept + 0.2)});
      // ===== L23 编译器只检查同一个合约内部的冲突。代理和实现之间，要在部署前用工具比对。
      out("#kw-sel", ${t(LS[23] - 0.2)}, 0.2);
      pop("#cP", ${t(LS[23] + 0.3)}); pop("#cI", ${t(LS[23] + 0.8)});
      pop("#smag", ${t(TM.tool)}); tl.to("#smag", { y: 300, duration: 1.4, ease: "power1.inOut" }, ${t(TM.tool + 0.2)});
      hot("#cP-r1", ${t(TM.tool + 1.7)}); hot("#cI-r1", ${t(TM.tool + 1.9)});
      // ===== L24 透明代理靠管理员不转发、其他人只转发，绕开了这个问题。
      out("#cP, #cI, #smag, #lcut", ${t(LS[24] - 0.2)}, 0.3);
      cam(${t(LS[24])}, "D", 1.6);
      pop("#ck-tr", ${t(LS[24] + 1.2)});
`,
});
