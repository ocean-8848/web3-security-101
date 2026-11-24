// ep10/seg2「② 代理与实现」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.B（BRIEF 第 2 节镜头路线：起始区 B）。
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
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.C

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1, E3] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const VEC = new Set(["cellStep", "openVec", "maxOut"]);
const wrapK = (key, o, k) => {
  const [gx, gy] = at(o);
  return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`,
    fix: () => { const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
      for (const n in A[key]) { if (VEC.has(n)) continue; const v = A[key][n];
        if (Array.isArray(v) && typeof v[0] === "number" && v.length === 2) A[key][n] = sc(v);
        else if (Array.isArray(v) && Array.isArray(v[0])) A[key][n] = v.map(sc); } } };
};

// ---------------------------------------------------------------- 世界物件
// B 维修间
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", sign: "代理", maintDoor: true }));
const stW = wrapK("st", L.STORE, 0.8);
put("st", L.STORE, E3.slotCabinet(L.STORE, { id: "st", n: 4, title: "存储",
  fill: { 0: [{ bytes: 32, color: "teal" }], 1: [{ bytes: 20, color: "teal" }], 2: [{ bytes: 8, color: "teal" }] } }), 0, { wrap: stW.wrap });
stW.fix();
put("core", L.CORE, X.coreModule(L.CORE, { id: "core", ver: "V2" }));
const V1OUT = G(-690, 50);                                       // 推出来的 V1 停在这里（段内专用位置）
put("v1", V1OUT, X.coreModule(V1OUT, { id: "v1", ver: "V1" }), 0, { wrap: (svg) => S.hid("v1h", svg) });
const DOORG = Wp(L.VEND.u - 150, L.VEND.v + 10);                  // 维修门外的地面点（推车停这里）
put("eng", L.ENGINEER, O.person(L.ENGINEER, { id: "eng", role: "engineer" }));
L.USERS.forEach((q, i) => put("us" + i, q, O.person(q, { id: "us" + i, role: "signer" })));
L.ULETTERS.forEach((q, i) => put("ul" + i, q, E1.letter(q, { id: "ul" + i, z: q.z })));
put("hg", L.HOURGLASS, O.hourglass(L.HOURGLASS, { id: "hg" }), 0, { grow: true });
put("tlx", L.TLOCK_X, E1.timeLock(L.TLOCK_X, { id: "tlx" }), 0, { grow: true });
// C 展台：透明代理
const T = L.TRANS, U = L.UUPS, B = L.BEACON;
put("tsign", T.sign, E1.signBoard(T.sign, { id: "tsign", style: "plate", text: "透明代理" }));
put("tvend", T.vend, E1.vending(T.vend, { id: "tvend", sign: "代理", scale: T.vend.scale }));
put("adm", T.admin, O.person(T.admin, { id: "adm", role: "engineer" }));
put("tkey", T.key, O.key(T.key, { id: "tkey" }), 0.5);
put("trule", T.rule, E1.signBoard(T.rule, { id: "trule", style: "wood", text: "管理员：不转发", sub: "其他人：只转发", size: 22 }));
const LA = G(-600, -1095), LU = G(-830, -1065);
put("la", LA, E1.letter(LA, { id: "la", z: 60 }), 0.6, { wrap: (svg) => S.hid("lah", svg) });
put("lu", LU, E1.letter(LU, { id: "lu", z: 0 }), 0, { wrap: (svg) => S.hid("luh", svg) });
// UUPS
put("usign", U.sign, E1.signBoard(U.sign, { id: "usign", style: "plate", text: "UUPS" }));
put("uvend", U.vend, E1.vending(U.vend, { id: "uvend", sign: "代理", scale: U.vend.scale, maintDoor: true }));
const UC = G(A.uvend.impl[0], A.uvend.impl[1] + 14);
put("uc1", UC, X.coreModule(UC, { id: "uc1", ver: "V1", cart: false, scale: 0.25 }), 300);
put("uc2", UC, X.coreModule(UC, { id: "uc2", ver: "V2", cart: false, scale: 0.25, state: "broken", bad: "lever" }), 301,
  { wrap: (svg) => S.hid("uc2h", svg) });
// 信标代理
put("bsign", B.sign, E1.signBoard(B.sign, { id: "bsign", style: "plate", text: "信标代理" }));
const twW = wrapK("tw", B.tower, 0.6);
put("tw", B.tower, O.tower(B.tower, { id: "tw" }), 0, { wrap: twW.wrap });
twW.fix();
B.vaults.forEach((q, i) => put("bv" + i, q, E1.vending(q, { id: "bv" + i, sign: "金库", scale: q.scale, maintDoor: true })));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const lbs = [];
const L_ = (id, p, html, cls, an) => { lbs.push("#" + id); lb(id, p, html, cls, an); };
L_("lb-exact", up(A.vm.top, 100), "准确说法", "lab-ink lab-sm");
L_("lb-meta", up(A.vm.top, 100), "比喻", "lab-ink lab-sm");
L_("lb-proxy", up(A.vm.top, 8), "代理合约", "lab-cs");
L_("lb-impl", up(A.vm.maintTop, 8), "实现合约", "lab-cs");
L_("lb-code", up(A.vm.maintTop, 8), "只有代码", "lab-cs lab-sm");
const d0 = A.st.drawers[0];
L_("lb-s0a", [d0[0] - 130, d0[1]], "0 号槽 · 100", "lab-ink lab-sm", "r");
L_("lb-s0b", [d0[0] - 130, d0[1]], "0 号槽 · 90", "lab-r lab-sm", "r");
L_("lb-dc", up(A.st.top, 8), "用实现的代码 · 改代理的存储", "lab-rs lab-sm");
L_("lb-v2", up(A.core.top, 6), "新实现 V2", "lab-cs lab-sm");
L_("lb-still", up(A.st.top, 8), "原地不动", "lab-gs");
L_("lb-body", up(A.vm.top, 8), "机身 = 代理（货和钱）", "lab-cs");
L_("lb-mech", up(A.vm.maintTop, 8), "机芯 = 实现（怎么动）", "lab-cs");
L_("lb-eng", up(A.eng.top, 6), "维修工", "lab-cs lab-sm");
L_("lb-swapd", up(A.vm.maintTop, 8), "换上 V2 · 金条不动", "lab-gs lab-sm");
L_("lb-hg", up(A.hg.top, 6), "真实机器：要花时间", "lab-cs lab-sm");
L_("lb-tl", up(A.tlx.top, 6), "没有时间锁：一笔交易", "lab-rs lab-sm");
["tvend", "uvend", "tw"].forEach((k, i) => L_("lb-sw" + i, up(A[k].top, 10), "升级开关 ?", "lab-ink lab-sm"));
L_("lb-up0", up(A.tvend.top, 10), "升级函数在代理", "lab-cs lab-sm");
L_("lb-adm", up(A.adm.top, 6), "管理员", "lab-cs lab-sm");
L_("lb-nf", up(A.tvend.coinSlot, 40), "不转发", "lab-r lab-sm");
L_("lb-up1", up(A.uvend.top, 10), "升级函数在实现", "lab-cs lab-sm");
L_("lb-lost", up(A.uvend.top, 10), "再也不能升级", "lab-rs lab-sm");
L_("lb-bt1", up(A.tw.top, 8), "存实现地址 · V1", "lab-cs lab-sm");
L_("lb-bt2", up(A.tw.top, 8), "存实现地址 · V2", "lab-gs lab-sm");
B.vaults.forEach((_, i) => { L_("lb-bva" + i, up(A["bv" + i].top, 4), "V1", "lab-cs lab-sm"); L_("lb-bvb" + i, up(A["bv" + i].top, 4), "V2", "lab-gs lab-sm"); });

// ---------------------------------------------------------------- 屏幕层（曲线 + 关键词卡）
const sc = (cam, p) => S.scr(cam, p);
S.curve("cv-dc", sc("anatomy", A.vm.coinSlot), sc("anatomy", A.vm.impl), { color: "#2aa3c9" });
S.curve("cv-st", sc("anatomy", A.vm.impl), sc("anatomy", A.st.drawers[0]), { color: "#e0453a" });
S.curve("cv-new", sc("anatomy", A.vm.maint), sc("anatomy", A.core.top), { color: "#2aa3c9" });
S.curve("cv-own", sc("anatomy", A.vm.maint), sc("anatomy", A.vm.stock), { color: "#e0453a" });
B.vaults.forEach((_, i) => S.curve("cv-bc" + i, sc("beacon", A.tw.tip ?? A.tw.top), sc("beacon", A["bv" + i].maint), { color: "#2aa3c9" }));
const KX = 900, KY = 800;
[A.tvend.ground, A.uvend.ground, A.tw.ground].forEach((p, i) => S.curve("cv-sc" + i, sc("C", p), [KX + 110, KY], { color: "#e0453a" }));
const html = kw("kw-dc", `<b>delegatecall</b>：借代码 · 改自己的存储`, { x: 1340, y: 470, size: 30, accent: "#2aa3c9" })
  + kw("kw-own", `换实现 = 拿走<b>全部资金</b>`, { x: 1340, y: 330, size: 40, accent: "#e0453a" })
  + kw("kw-sc", `<b>存储冲突</b>`, { x: KX, y: KY, size: 40, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);
const LBS = lbs.join(", ");

S.build({
  cam0: "B", sub: "数据在代理，代码在实现",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "存储冲突", d: "两份代码对同一槽位有不同解释", at: LS[19] + 2.4 },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。
      pop("#lb-exact", ${t(LS[0] + 0.2)}, 0.25);
      // ===== L1 一个可升级合约，其实是两个合约。
      pop("#lb-proxy", ${t(LS[1] + 0.3)}, 0.25); pop("#lb-impl", ${t(LS[1] + 0.8)}, 0.25); bump("#vm-impl", ${t(LS[1] + 0.8)}, 1.15, 1);
      // ===== L2 代理合约，保存数据和资金。用户的每次调用，都先到它这里。
      flash("#vm-shelf-0, #vm-shelf-1, #vm-shelf-2", ${t(LS[2] + 0.3)}, 3, 0.4);
      [0, 1, 2, 3].forEach((i) => X3.mark(tl, "st", i, ${t(LS[2] + 0.5)} + i * 0.1, "teal"));
      X1.walk(tl, "ul0", ${t(LS[2] + 3.0)}, 1.2, [[${f(A.vm.coinSlot[0])}, ${f(A.vm.coinSlot[1] + 30)}]]); out("#ul0", ${t(LS[2] + 4.3)}, 0.3);
      // ===== L3 实现合约，只提供代码。
      out("#lb-impl", ${t(LS[3] - 0.2)}, 0.2); cam(${t(LS[3])}, "anatomy", 1.2);
      [0, 1, 2, 3].forEach((i) => X3.mark(tl, "st", i, ${t(LS[3] + 0.2)}, "off"));
      X1.sideDoor(tl, "vm", ${t(LS[3] + 0.4)}, 105, 1.0); bump("#vm-impl", ${t(LS[3] + 1.4)}, 1.15, 2); pop("#lb-code", ${t(LS[3] + 1.5)}, 0.25);
      // ===== L4 delegatecall（关键画面）
      draw("cv-dc", ${t(LS[4] + 0.4)}, 0.9); X1.gears(tl, "vm", ${t(LS[4] + 1.3)}, 2.0, 1);
      draw("cv-st", ${t(LS[4] + 3.2)}, 0.9); X3.drawer(tl, "st", 0, ${t(LS[4] + 3.6)}, true, 0.6); X3.mark(tl, "st", 0, ${t(LS[4] + 3.6)}, "red");
      pop("#lb-s0a", ${t(LS[4] + 3.8)}, 0.25); out("#lb-s0a", ${t(LS[4] + 5.0)}, 0.15); pop("#lb-s0b", ${t(LS[4] + 5.1)}, 0.25);
      pop("#lb-dc", ${t(LS[4] + 5.4)}, 0.25); pop("#kw-dc", ${t(LS[4] + 5.6)}, 0.3);
      // ===== L5 升级 = 指向新实现
      out("#cv-dc, #cv-st, #lb-s0b, #lb-dc, #kw-dc, #lb-code, #lb-proxy", ${t(LS[5] - 0.2)}, 0.2);
      X3.drawer(tl, "st", 0, ${t(LS[5])}, false, 0.5); X3.mark(tl, "st", 0, ${t(LS[5])}, "off");
      X10.gears(tl, "core", ${t(LS[5] + 0.6)}, 1.2, 1); pop("#lb-v2", ${t(LS[5] + 0.6)}, 0.25); draw("cv-new", ${t(LS[5] + 1.0)}, 0.9);
      // ===== L6 数据和资金原地不动
      out("#cv-new", ${t(LS[6] - 0.2)}, 0.2);
      [0, 1, 2, 3].forEach((i) => X3.mark(tl, "st", i, ${t(LS[6] + 0.2)}, "green"));
      flash("#vm-shelf-0, #vm-shelf-1, #vm-shelf-2", ${t(LS[6] + 0.3)}, 2, 0.5); pop("#lb-still", ${t(LS[6] + 0.4)}, 0.25);
      // ===== L7 谁能换实现，谁拥有全部资金
      out("#lb-still", ${t(LS[7] - 0.2)}, 0.2);
      [0, 1, 2, 3].forEach((i) => X3.mark(tl, "st", i, ${t(LS[7])}, "off"));
      bump("#vm-dlock", ${t(LS[7] + 0.3)}, 1.6, 2); draw("cv-own", ${t(LS[7] + 1.0)}, 0.9); pop("#kw-own", ${t(LS[7] + 1.8)}, 0.3);
      // ===== L8 比喻：机身
      out("#cv-own, #kw-own, #lb-exact", ${t(LS[8] - 0.2)}, 0.2);
      pop("#lb-meta", ${t(LS[8] + 0.1)}, 0.25); bump("#vm", ${t(LS[8] + 1.0)}, 1.04, 1); pop("#lb-body", ${t(LS[8] + 1.2)}, 0.25);
      // ===== L9 机芯决定怎么动
      pop("#lb-mech", ${t(LS[9] + 0.4)}, 0.25); bump("#vm-impl", ${t(LS[9] + 0.6)}, 1.15, 1);
      X1.press(tl, "vm", 2, ${t(LS[9] + 2.8)}); X1.gears(tl, "vm", ${t(LS[9] + 3.0)}, 1.6, 1);
      // ===== L10 换一块新机芯（关键画面）
      out("#lb-mech, #lb-v2, #lb-body", ${t(LS[10] - 0.2)}, 0.2); pop("#lb-eng", ${t(LS[10])}, 0.25);
      X10.push(tl, "v1", ${t(LS[10] + 0.1)}, [${f(DOORG[0])}, ${f(DOORG[1])}], 0.01);
      out("#vm-impl", ${t(LS[10] + 0.3)}, 0.25); fadeIn("#v1h", ${t(LS[10] + 0.3)}, 0.25);
      X10.push(tl, "v1", ${t(LS[10] + 0.5)}, null, 1.0);
      X10.push(tl, "core", ${t(LS[10] + 1.6)}, [${f(DOORG[0])}, ${f(DOORG[1])}], 1.1);
      out("#core", ${t(LS[10] + 2.8)}, 0.25); fadeIn("#vm-impl", ${t(LS[10] + 2.8)}, 0.25); pop("#lb-swapd", ${t(LS[10] + 3.0)}, 0.25);
      // ===== L11 比喻不成立
      out("#lb-swapd, #lb-eng, #lb-meta, #v1h", ${t(LS[11] - 0.2)}, 0.2); cam(${t(LS[11])}, "B", 1.2);
      grow("hg", ${t(LS[11] + 1.2)}); pop("#lb-hg", ${t(LS[11] + 1.6)}, 0.25); KIT.sand(tl, "hg", ${t(LS[11] + 1.8)}, 3.0);
      grow("tlx", ${t(LS[11] + 5.0)}); KIT.broke(tl, "tlx", ${t(LS[11] + 5.6)}, { badge: true, ghost: 0.5 }); pop("#lb-tl", ${t(LS[11] + 5.8)}, 0.25);
      // ===== L12 三种代理：开关在哪
      out("#lb-hg, #lb-tl", ${t(LS[12] - 0.2)}, 0.2); cam(${t(LS[12])}, "C", 1.6);
      ["#tsign", "#usign", "#bsign"].forEach((s, i) => bump(s, ${t(LS[12] + 1.8)} + i * 0.5, 1.06, 1));
      [0, 1, 2].forEach((i) => pop("#lb-sw" + i, ${t(LS[12] + 3.2)} + i * 0.3, 0.25));
      // ===== L13 透明代理：升级函数在代理里
      out("#lb-sw1, #lb-sw2", ${t(LS[13] - 0.2)}, 0.2); cam(${t(LS[13])}, "trans", 1.2);
      out("#lb-sw0", ${t(LS[13] + 2.0)}, 0.15); pop("#lb-up0", ${t(LS[13] + 2.1)}, 0.25); bump("#tvend", ${t(LS[13] + 2.2)}, 1.04, 1);
      pop("#lb-adm", ${t(LS[13] + 3.8)}, 0.25); bump("#tkey", ${t(LS[13] + 4.0)}, 1.2, 1);
      // ===== L14 管理员不转发，其他人只转发
      fadeIn("#lah, #luh", ${t(LS[14] + 0.2)}, 0.25);
      X1.walk(tl, "la", ${t(LS[14] + 0.5)}, 1.2, [[${f(A.tvend.coinSlot[0] + 10)}, ${f(A.tvend.coinSlot[1] + 30)}]]);
      X1.walk(tl, "lu", ${t(LS[14] + 0.5)}, 1.4, [[${f(A.tvend.coinSlot[0] - 10)}, ${f(A.tvend.coinSlot[1] + 34)}]]);
      flash("#la", ${t(LS[14] + 1.8)}, 2, 0.4); pop("#lb-nf", ${t(LS[14] + 1.8)}, 0.25);
      out("#lu", ${t(LS[14] + 2.2)}, 0.25); X1.gears(tl, "tvend", ${t(LS[14] + 2.3)}, 1.4, 1); bump("#trule", ${t(LS[14] + 3.6)}, 1.06, 1);
      // ===== L15 UUPS：升级函数在实现里
      out("#lb-up0, #lb-adm, #lb-nf, #lah", ${t(LS[15] - 0.2)}, 0.2); cam(${t(LS[15])}, "uups", 1.2);
      X1.sideDoor(tl, "uvend", ${t(LS[15] + 1.4)}, 105, 1.0); out("#lb-sw1", ${t(LS[15] + 3.0)}, 0.15);
      pop("#lb-up1", ${t(LS[15] + 3.1)}, 0.25); X10.pull(tl, "uc1", ${t(LS[15] + 3.4)}, 0.7);
      // ===== L16 忘了带升级函数
      X10.gears(tl, "uc1", ${t(LS[16] + 0.2)}, 1.4, 1); bump("#uvend", ${t(LS[16] + 0.4)}, 1.04, 1);
      out("#uc1", ${t(LS[16] + 2.0)}, 0.3); fadeIn("#uc2h", ${t(LS[16] + 2.2)}, 0.3);
      X10.leverBad(tl, "uc2", ${t(LS[16] + 2.6)}, true); out("#lb-up1", ${t(LS[16] + 3.6)}, 0.15);
      pop("#lb-lost", ${t(LS[16] + 3.7)}, 0.25); bump("#uvend-dlock", ${t(LS[16] + 3.9)}, 1.6, 2);
      // ===== L17 信标代理
      out("#lb-lost", ${t(LS[17] - 0.2)}, 0.2); cam(${t(LS[17])}, "beacon", 1.2);
      bump("#tw", ${t(LS[17] + 2.0)}, 1.05, 1); flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${t(LS[17] + 2.2)}, 3, 0.3);
      [0, 1, 2].forEach((i) => draw("cv-bc" + i, ${t(LS[17] + 3.0)} + i * 0.25, 0.8));
      out("#lb-sw2", ${t(LS[17] + 4.6)}, 0.15); pop("#lb-bt1", ${t(LS[17] + 4.7)}, 0.25);
      [0, 1, 2].forEach((i) => pop("#lb-bva" + i, ${t(LS[17] + 5.2)} + i * 0.15, 0.25));
      // ===== L18 改一次信标，所有代理一起换
      out("#lb-bt1", ${t(LS[18] + 4.4)}, 0.15); pop("#lb-bt2", ${t(LS[18] + 4.5)}, 0.25);
      flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${t(LS[18] + 4.6)}, 2, 0.3);
      [0, 1, 2].forEach((i) => { out("#lb-bva" + i, ${t(LS[18] + 5.2)}, 0.15); pop("#lb-bvb" + i, ${t(LS[18] + 5.3)}, 0.25);
        X1.gears(tl, "bv" + i, ${t(LS[18] + 5.3)}, 1.0, 1); });
      // ===== L19 都依赖 delegatecall：存储冲突
      out("${LBS}, #cv-bc0, #cv-bc1, #cv-bc2", ${t(LS[19] - 0.2)}, 0.2); cam(${t(LS[19])}, "C", 1.4);
      [0, 1, 2].forEach((i) => draw("cv-sc" + i, ${t(LS[19] + 1.6)}, 0.9)); pop("#kw-sc", ${t(LS[19] + 2.4)}, 0.3);
`,
});
