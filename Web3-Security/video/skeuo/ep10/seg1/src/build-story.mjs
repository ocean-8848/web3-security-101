// ep10/seg1「① 一次初始化」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.A（BRIEF 第 2 节镜头路线：起始区 A）。
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
// ends static on CAMS.B
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// A 桥头
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
put("bv", L.BVEND, E1.vending(L.BVEND, { id: "bv", scale: 0.8, maintDoor: true, mdoorOpen: 0, sign: "BRIDGE" }));
put("bc", L.BCORE, X.coreModule(L.BCORE, { id: "bc", ver: "升级" }));
put("gt", L.GATE, O.checkpoint(L.GATE, { id: "gt", n: "根" }));
put("rs", L.ROOTSIGN, E1.signBoard(L.ROOTSIGN, { id: "rs", style: "plate", text: "可信根" }));
put("cf", L.CONFIRM, O.doc(L.CONFIRM, { id: "cf", standing: true, title: "确认表", lines: ["全零 → 已确认"] }), 0, { grow: true });
L.LETTERS.forEach((q, i) => put("lt" + i, q, E1.letter(q, { id: "lt" + i })));
L.COPIERS.forEach((q, i) => {
  put("cp" + i, q, O.person(q, { id: "cp" + i, role: "attacker", scale: q.scale }), 0, { grow: true });
  const lq = { u: q.u + 40, v: q.v + 30 };
  put("cl" + i, lq, E1.letter(lq, { id: "cl" + i, z: 40, w: 44, h: 30 }), 0, { wrap: (s) => S.hid("clw" + i, s) });
});
// B 维修间（段尾）
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", maintDoor: true, mdoorOpen: 0 }));
{
  const [gx, gy] = at(L.STORE), k = L.STORE.scale;
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put("st", L.STORE, E3.slotCabinet(L.STORE, { id: "st", n: 4, title: "存储" }), 0, {
    wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of ["top", "center", "ground", "header"]) if (A.st[n]) A.st[n] = sc(A.st[n]);
}
put("core", L.CORE, X.coreModule(L.CORE, { id: "core", ver: "V2" }));
put("eng", L.ENGINEER, O.person(L.ENGINEER, { id: "eng", role: "engineer" }));
L.USERS.forEach((q, i) => put("u" + i, q, O.person(q, { id: "u" + i, role: "signer" })));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-br", up(A.br.top, 10), "Nomad 跨链桥", "lab-cs");
lb("lb-bv", up(A.bv.top, 8), "桥合约", "lab-ink");
lb("lb-bc", up(A.bc.top, 8), "升级", "lab-cs lab-sm");
lb("lb-cf", up(A.cf.top, 6), "确认表", "lab-g lab-sm");
lb("lb-row", A.cf.center, `<span style="color:#1d93ba">全零</span> → 已确认`, "lab-ink lab-sm", "c");
const TAG = up(A.lt0.top, 6);
lb("lb-tq", TAG, "根：？", "lab-cs lab-sm");
lb("lb-tz", TAG, "根：全零", "lab-rs lab-sm");
lb("lb-def", [TAG[0] - 84, TAG[1] - 20], "默认值", "lab-g lab-sm", "r");
lb("lb-cp", [A.cp2.ground[0] + 60, A.cp2.ground[1] + 40], "数百个地址 · 只换收款地址", "lab-rs", "t");
lb("lb-par", up(A.cf.top, 6), "升级参数", "lab-rs lab-sm");
lb("lb-vm", up(A.vm.top, 8), "代理", "lab-ink");
lb("lb-who", up(A.core.top, 8), "谁能换？", "lab-r");

// ---------------------------------------------------------------- 屏幕层卡片
const EQ = { x: 900, y: 168 };
const P_EQ = [EQ.x + 62, EQ.y + 70];
S.curve("cv-tag", S.scr("gate", [TAG[0], TAG[1] - 46]), P_EQ, { color: "#e0453a" });
S.curve("cv-row", S.scr("gate", [A.cf.center[0] - 96, A.cf.center[1]]), [P_EQ[0] + 30, P_EQ[1]], { color: "#e0453a" });
const XB = S.scr("door", A.cf.center);
const html =
  evt("ev", `2022.8.1 · 约 1.9 亿美元 ${gtag("事发时估值")}`, { color: "#e0453a" }) +
  evt("src", `Immunefi 复盘 · The Block 报道`, { top: 128 }) +
  kw("kw-q", "<b>先猜</b>", { x: 70, y: 300, accent: "#1d93ba" }) +
  ck("q1", "查到的根？", { x: 70, y: 392, w: 330, kind: "n" }) +
  ck("q2", "能通过吗？", { x: 70, y: 470, w: 330, kind: "n" }) +
  kw("kw-eq", "<b>全零</b>", { x: EQ.x, y: EQ.y, size: 36, accent: "#e0453a" }) +
  ck("ck-code", "代码", { x: 1300, y: 340, w: 260, kind: "g" }) +
  `<div class="xbox hide" id="xbox" style="left:${Math.round(XB[0] - 86)}px;top:${Math.round(XB[1] - 140)}px"><span>✕</span></div>`;
const css = `
.xbox { position:absolute; width:172px; height:270px; border:4px dashed #e0453a; border-radius:10px; box-sizing:border-box; }
.xbox span { position:absolute; right:-22px; top:-22px; width:40px; height:40px; border-radius:50%; background:#e0453a; color:#fff;
  font:700 26px/40px sans-serif; text-align:center; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const LP = (i) => [at({ u: L.GATE.u + 220, v: L.GATE.v + 30 }), at({ u: L.CONFIRM.u, v: L.CONFIRM.v + 120 }), A.br.deck[0], A.br.deck[6], A.br.deck[12 - i]];
const CP = (i) => [A.br.deck[1], A.br.deck[6], A.br.deck[11 - (i % 3)]];
const TM = {
  zero2: w("全零", 2), check: w("先查", 3), zero6: w("全零", 6), mark: w("标记成了可信", 7),
  any: w("任何消息", 8), many: w("数百个地址", 9), param: w("参数", 11), who: w("谁能换掉", 12),
};
const t = (x) => f(x);
const J = (o) => JSON.stringify(o);

S.build({
  cam0: "A", sub: "升级把全零标记成可信",
  grid: { u0: -4400, u1: 2400, v0: -2600, v1: 2600 }, box: [-3700, -1100, 4700, 2200],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "初始化函数", d: "部署后设置初始状态的函数", at: w("初始化函数", 2) },
    { id: "t1", t: "消息根", d: "一批跨链消息汇总成的摘要", at: w("消息根", 2) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2022 年 8 月 1 日，跨链桥 Nomad 被提走约 1.9 亿美元，按事发时估值。
      pop("#lb-br", ${t(LS[0] + 0.4)}, 0.25); pop("#ev", ${t(LS[0] + 0.8)}); pop("#lb-bv", ${t(LS[0] + 2.4)}, 0.25);
      X1.dash(tl, "br-ripple", ${t(LS[0])}, ${t(LE[0] - LS[0])}, -120);
      // ===== L1 起因，是此前的一次升级。
      out("#ev, #lb-br", ${t(LS[1] - 0.2)}); cam(${t(LS[1])}, "door", 1.2);
      pop("#lb-bc", ${t(LS[1] + 0.6)}, 0.25); X1.sideDoor(tl, "bv", ${t(LS[1] + 0.9)}, 105, 0.8);
      // ===== L2 这次升级调用了初始化函数，把可信的消息根，设成了全零。
      out("#lb-bc", ${t(LS[2] - 0.1)}); X10.push(tl, "bc", ${t(LS[2])}, ${J(at({ u: L.BVEND.u - 150, v: L.BVEND.v + 10 }))}, 1.2);
      X10.gears(tl, "bc", ${t(LS[2])}, 1.2, 1); out("#bc", ${t(LS[2] + 1.3)}, 0.4); X1.sideDoor(tl, "bv", ${t(LS[2] + 1.6)}, 20, 0.6);
      grow("cf", ${t(LS[2] + 2.0)}); pop("#lb-cf", ${t(LS[2] + 2.5)}, 0.25); pop("#lb-row", ${t(TM.zero2)}, 0.3);
      // ===== L3 桥合约收到一条消息，先查它对应的根，再看这个根是否可信。
      out("#lb-bv, #lb-cf", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "gate", 1.4);
      pop("#lb-tq", ${t(TM.check)}, 0.25); bump("#lb-tq", ${t(TM.check + 1.2)}, 1.15, 1);
      // ===== L4 先猜一道题。
      pop("#kw-q", ${t(LS[4] + 0.1)});
      // ===== L5 一条从没被证明过的消息，查到的根是什么？它能通过吗？
      pop("#q1", ${t(w("查到的根", 5))}); pop("#q2", ${t(w("能通过吗", 5))}); bump("#lb-tq", ${t(w("查到的根", 5) + 0.3)}, 1.2, 2);
      // ===== L6 它查到的是默认值，全零。
      out("#lb-tq", ${t(TM.zero6 - 0.3)}, 0.2); pop("#lb-tz", ${t(TM.zero6)}, 0.3); pop("#lb-def", ${t(w("默认值", 6))}, 0.25);
      // ===== L7 而全零，刚刚被这次升级，标记成了可信。
      out("#kw-q, #q1, #q2, #lb-def", ${t(LS[7] - 0.2)});
      flash("#lb-row", ${t(LS[7] + 0.1)}, 2); pop("#kw-eq", ${t(LS[7] + 0.5)});
      draw("cv-tag", ${t(LS[7] + 0.7)}); draw("cv-row", ${t(TM.mark)});
      // ===== L8 所以，任何消息都被视为已经证明。
      out("#cv-tag, #cv-row, #kw-eq, #lb-tz", ${t(LS[8] - 0.2)});
      KIT.arm(tl, "gt", ${t(TM.any)}, true);
      [0, 1, 2].forEach((i) => X1.walk(tl, "lt" + i, ${t(TM.any + 0.5)} + i * 0.6, 3.0, ${J([0, 1, 2].map(LP))}[i]));
      // ===== L9 按 Immunefi 的复盘和 The Block 的报道，第一笔提款成功后，数百个地址复制了这笔交易，只换掉收款地址。
      cam(${t(LS[9])}, "A", 1.4); pop("#src", ${t(LS[9] + 0.6)});
      [0, 1, 2, 3, 4, 5].forEach((i) => { grow("cp" + i, ${t(TM.many - 0.4)} + i * 0.12); fadeIn("#clw" + i, ${t(TM.many)} + i * 0.12, 0.3); });
      pop("#lb-cp", ${t(TM.many + 0.9)}, 0.3);
      [0, 1, 2, 3, 4, 5].forEach((i) => X1.walk(tl, "cl" + i, ${t(TM.many + 2.2)} + i * 0.35, 2.4, ${J([0, 1, 2, 3, 4, 5].map(CP))}[i]));
      // ===== L10 升级的代码，可以没有错。
      out("#src, #lb-cp, #cp0, #cp1, #cp2, #cp3, #cp4, #cp5", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "door", 1.4);
      X1.sideDoor(tl, "bv", ${t(LS[10] + 1.0)}, 105, 0.7); X1.gears(tl, "bv", ${t(LS[10] + 1.2)}, 2.0, 1.5);
      pop("#ck-code", ${t(w("没有错", 10))});
      // ===== L11 错的，是升级时传进去的参数。
      out("#lb-row", ${t(TM.param - 0.15)}, 0.15);
      pop("#xbox", ${t(TM.param + 0.2)}, 0.3); pop("#lb-par", ${t(TM.param + 0.5)}, 0.25);
      // ===== L12 能升级的合约，是怎么搭起来的？谁能换掉它的代码？
      out("#ck-code, #xbox, #lb-par", ${t(LS[12] - 0.2)}); cam(${t(LS[12])}, "B", 2.4);
      pop("#lb-vm", ${t(LS[12] + 2.0)}, 0.25); X1.sideDoor(tl, "vm", ${t(TM.who - 0.2)}, 35, 0.8); pop("#lb-who", ${t(TM.who + 0.3)}, 0.25);
`,
});
