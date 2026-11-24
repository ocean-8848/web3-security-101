// ep10/seg6「⑥ 今天能做什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.F（BRIEF 第 2 节镜头路线：起始区 F）。
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
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.world

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 段内位置：F 区 zone 帮手（同 layout.mjs 的 ff = zone(-6500, 0)）
const ffp = (X0, Y0) => { const q = G(-6500 + X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const PADL = ffp(-960, 440), LD = [ffp(-790, 470), ffp(-660, 470)], UKEY = ffp(250, 330);
const LSTOP = { u: L.GATE.u - 70, v: L.GATE.v };                // 信封停在横杆前

// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const putK = (key, o, svgObj, k) => {
  const [gx, gy] = at(o);
  put(key, o, svgObj, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};

// ---------------------------------------------------------------- 世界物件
// F 审批路（seg5 段尾的画面，起始镜头 F）
L.GATES.forEach((o, i) => putK("g" + i, o, O.checkpoint(o, { id: "g" + i, n: String(i + 1) }), 0.6));
["只追加", "布局比对", "分叉测试", "审计", "时间锁", "部署后验证"].forEach((s, i) => put("gs" + i, L.GSIGNS[i], E1.signBoard(L.GSIGNS[i], { id: "gs" + i, style: "plate", text: s, size: 34 })));
put("re", L.ROADEND, E1.vending(L.ROADEND, { id: "re", scale: 0.5, maintDoor: true }));
put("sh", L.SHIELD, O.shield(L.SHIELD, { id: "sh" }));
// F 角色区（L0–L5）
put("eng", L.ROLES.eng, O.person(L.ROLES.eng, { id: "eng", role: "engineer" }), 0, { grow: true });
put("aud", L.ROLES.aud, O.person(L.ROLES.aud, { id: "aud", role: "engineer", color: "#3c7d5a" }), 0, { grow: true });
put("usr", L.ROLES.user, O.person(L.ROLES.user, { id: "usr", role: "signer" }), 0, { grow: true });
put("lens", L.RLENS, O.magnifier(L.RLENS, { id: "lens" }), 0, { grow: true });
put("pl", PADL, O.padlock(PADL, { id: "pl" }), 0, { grow: true });
LD.forEach((o, i) => put("ld" + i, o, E1.letter(o, { id: "ld" + i }), 0, { grow: true }));
put("ukey", UKEY, O.key(UKEY, { id: "ukey" }), 0, { grow: true });
L.CHAINS.forEach((o, i) => put("ch" + i, o, E1.vending(o, { id: "ch" + i, scale: o.scale }), 0, { grow: true }));
// A 桥头
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
put("bv", L.BVEND, E1.vending(L.BVEND, { id: "bv", scale: L.BVEND.scale, maintDoor: true, mdoorOpen: 105 }));
put("bc", L.BCORE, X.coreModule(L.BCORE, { id: "bc", ver: "升级" }));
put("gt", L.GATE, O.checkpoint(L.GATE, { id: "gt", n: "根", armUp: true }));
put("rs", L.ROOTSIGN, E1.signBoard(L.ROOTSIGN, { id: "rs", style: "plate", text: "可信根" }));
put("cf", L.CONFIRM, O.doc(L.CONFIRM, { id: "cf", title: "确认表", lines: ["全零 → 已确认"], standing: true }));
put("lt", L.LETTERS[0], E1.letter(L.LETTERS[0], { id: "lt" }));
// B 维修间
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", maintDoor: true, mdoorOpen: 105 }));
put("core", L.CORE, X.coreModule(L.CORE, { id: "core", ver: "V2" }));
// C / D / E（只为结尾全景）
put("tv", L.TRANS.vend, E1.vending(L.TRANS.vend, { id: "tv", scale: 0.55 }));
put("uv", L.UUPS.vend, E1.vending(L.UUPS.vend, { id: "uv", scale: 0.55, maintDoor: true, mdoorOpen: 105 }));
L.BEACON.vaults.forEach((o, i) => put("bk" + i, o, E1.vending(o, { id: "bk" + i, scale: 0.4 })));
put("cab", L.CAB, E3.slotCabinet(L.CAB, { id: "cab", n: 5 }));
put("ep", L.EPROXY, E1.vending(L.EPROXY, { id: "ep", scale: 0.7 }));
put("ei", L.EIMPL, E1.vending(L.EIMPL, { id: "ei", scale: 0.7 }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-eng", up(A.eng.top, 8), "写合约的人", "lab-cs lab-sm");
lb("lb-aud", up(A.aud.top, 52), "审计的人", "lab-cs lab-sm");
lb("lb-usr", up(A.usr.top, 8), "普通用户", "lab-cs lab-sm");
lb("lb-pl", up(A.pl.top, 6), "禁用初始化", "lab-cs lab-sm");
lb("lb-ld0", up(A.ld0.top, 8), "部署", "lab-cs lab-sm", "r");
lb("lb-ld1", up(A.ld1.top, 8), "初始化", "lab-cs lab-sm", "l");
lb("lb-one", up(A.ld0.top, 8), "同一笔交易", "lab-gs lab-sm");
lb("lb-key", up(A.ukey.top, 10), "升级钥匙", "lab-rs lab-sm");
["链 A", "链 B", "链 C"].forEach((s, i) => { lb("lb-ch" + i, up(A["ch" + i].top, 6), s, "lab-cs lab-sm"); lb("lb-chk" + i, up(A["ch" + i].top, 56), "✓ 已核对", "lab-g lab-sm"); });
lb("lb-cf0", A.cf.center, "全零 → 已确认", "lab-r lab-sm", "c");
lb("lb-cf1", A.cf.center, "全零 → 已确认", "lab-r lab-sm strike", "c");
lb("lb-cf2", [A.cf.center[0], A.cf.center[1] + 34], "非零根 → 已确认", "lab-gs lab-sm", "t");
lb("lb-store", [A.cf.center[0] + 92, A.cf.center[1] + 40], "参数写进了存储", "lab-rs lab-sm", "l");
lb("lb-lt0", up(A.lt.top, 8), "根：全零", "lab-rs lab-sm");
const [lx, ly] = at(LSTOP);
lb("lb-lt1", [lx, ly - 72], "根：全零", "lab-rs lab-sm");
lb("lb-stop", up(A.gt.top, 8), "✓ 拦下", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const CD = { x: 60, y: 600, w: 790 }, LY = { x: 60, y: 560, w: 680 }, IP = { x: 64, y: 590, w: 640 }, UL = { x: 1240, y: 560, w: 560 };
const html =
  codeCard("cd", { ...CD, head: "写合约的人", mono: true, rows: [
    { html: "constructor() { _disableInitializers(); }", chip: "禁用", chipCls: "ok" },
    { html: "new ERC1967Proxy(impl, initData);", chip: "同一笔", chipCls: "ok" }] }) +
  codeCard("ly", { ...LY, head: "存储布局比对", tag: "工具", rows: [
    { html: "旧：owner · totalDeposits · balances" },
    { html: "新：owner · totalDeposits · balances · feeBps", chip: "末尾追加", chipCls: "ok" }] }) +
  codeCard("ip", { ...IP, head: "升级交易 · 初始化参数", tag: "解码", rows: [
    { html: "参数 1 · 地址" , chip: "非零", chipCls: "ok" },
    { html: "参数 2 · 根", chip: "零值？", chipCls: "x" }] }) +
  codeCard("ul", { ...UL, head: "存款前查一查", rows: [
    { html: "能不能升级？", chip: "能" },
    { html: "由谁升级？", chip: "持有人" },
    { html: "有没有时间锁？", chip: "无延迟 ✕", chipCls: "x" }] }) +
  kw("kw-q", `代码没错 <b>钱为什么被提走？</b>`, { x: 470, y: 150, size: 50, accent: "#e0453a" }) +
  kw("kw-cond", `默认值 ≠ 合法值时成立`, { x: 560, y: 180, size: 44, accent: "#1f9d55" }) +
  kw("kw-proxy", `代理 = <b>存着钱</b>`, { x: 1250, y: 430, size: 46, accent: "#2aa3c9" }) +
  kw("kw-impl", `实现 = <b>给出规则</b>${gtag("解读")}`, { x: 110, y: 410, size: 46, accent: "#2aa3c9" });
const css = `.strike { text-decoration: line-through; text-decoration-thickness: 4px; }
  #endcard .e-main { font-size: 66px; }`;
S.curve("cv-ip", [IP.x + IP.w + 4, codeRowY(IP.y, 1)], S.scr("roles", A.lens.lens ?? A.lens.center), { color: "#e0453a" });
S.curve("cv-key", S.scr("roles", A.usr.center), S.scr("roles", A.ukey.center), { color: "#e0453a" });
S.curve("cv-cf", S.scr("door", A.bv.impl), S.scr("door", [A.cf.center[0] - 70, A.cf.center[1]]), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dis: w("禁用初始化", 1), same: w("同一笔交易", 1), lay: w("存储布局", 2), dec: w("解码", 2), zero: w("零值", 2),
  canUp: w("能不能升级", 3), who: w("由谁升级", 3), tlk: w("时间锁", 3), nodl: w("无延迟", 4), hold: w("持有人", 4),
  chk: w("分别核对", 5), store: w("写进了存储", 7), allz: w("全零", 7), zero8: w("零值", 8), stop: w("拦得住", 8),
  rule: w("实现给出规则", 9),
};
const t = (x) => f(x);
const [p0x, p0y] = at(LD[0]);
// 世界画布范围 → grid（u/v）与 box
const BOX = [-7600, -2200, 11800, 3500];
const GC = [[BOX[0], BOX[1]], [BOX[0] + BOX[2], BOX[1]], [BOX[0], BOX[1] + BOX[3]], [BOX[0] + BOX[2], BOX[1] + BOX[3]]].map(([x, y]) => G(x, y));
const GRID = { u0: Math.floor(Math.min(...GC.map((q) => q.u))), u1: Math.ceil(Math.max(...GC.map((q) => q.u))), v0: Math.floor(Math.min(...GC.map((q) => q.v))), v1: Math.ceil(Math.max(...GC.map((q) => q.v))) };

S.build({
  cam0: "F", sub: "按角色各做一件事",
  grid: GRID, box: BOX,   // 盖住 F（X ≈ −7110）到 D/E（X ≈ 3760）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "存储布局", d: "变量在槽位里的排列方式", at: w("存储布局", 2) },
  ],
  end: { line: "谁能换规则，谁就拥有这笔钱", next: "DeFi 经济安全", at: LS[10], nextAt: w("下一集", 10) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 最后，每个人今天就能做一件事。
      cam(${t(LS[0])}, "roles", 1.6);
      grow("eng", ${t(LS[0] + 0.6)}); grow("aud", ${t(LS[0] + 0.9)}); grow("lens", ${t(LS[0] + 1.0)}); grow("usr", ${t(LS[0] + 1.2)});
      pop("#lb-eng", ${t(LS[0] + 1.4)}); pop("#lb-aud", ${t(LS[0] + 1.6)}); pop("#lb-usr", ${t(LS[0] + 1.8)});
      // ===== L1 写合约的人，在实现合约的构造函数里禁用初始化，把部署和初始化放进同一笔交易。
      bump("#lb-eng", ${t(LS[1])}, 1.12); pop("#cd", ${t(LS[1] + 0.3)});
      grow("pl", ${t(TM.dis)}); pop("#lb-pl", ${t(TM.dis + 0.4)}); hot("#cd-r0", ${t(TM.dis)}); pop("#cd-c0", ${t(TM.dis + 0.4)});
      grow("ld0", ${t(TM.same - 1.6)}); grow("ld1", ${t(TM.same - 1.4)}); pop("#lb-ld0", ${t(TM.same - 1.2)}); pop("#lb-ld1", ${t(TM.same - 1.1)});
      hot("#cd-r1", ${t(TM.same)}); out("#lb-ld0, #lb-ld1", ${t(TM.same)}, 0.2);
      X1.walk(tl, "ld1", ${t(TM.same + 0.1)}, 0.6, [[${f(p0x)}, ${f(p0y)}]]); out("#ld1", ${t(TM.same + 0.7)}, 0.2);
      pop("#lb-one", ${t(TM.same + 0.8)}); pop("#cd-c1", ${t(TM.same + 0.8)});
      // ===== L2 审计的人，把新旧存储布局交给工具比对，再解码升级交易的初始化参数，看有没有零值。
      out("#cd, #lb-pl, #lb-one, #pl, #ld0", ${t(LS[2] - 0.2)});
      bump("#lb-aud", ${t(LS[2])}, 1.12); pop("#ly", ${t(TM.lay)}); pop("#ly-c1", ${t(TM.lay + 1.2)}); bump("#lens", ${t(TM.lay + 0.6)}, 1.08);
      out("#ly", ${t(TM.dec - 0.3)}); pop("#ip", ${t(TM.dec)}); pop("#ip-c0", ${t(TM.dec + 0.8)});
      hot("#ip-r1", ${t(TM.zero)}, "#fde3df"); pop("#ip-c1", ${t(TM.zero)}); draw("cv-ip", ${t(TM.zero + 0.2)});
      // ===== L3 普通用户，存款前查一查：这个协议能不能升级，由谁升级，有没有时间锁。
      out("#ip, #cv-ip", ${t(LS[3] - 0.2)});
      bump("#lb-usr", ${t(LS[3])}, 1.12); pop("#ul", ${t(LS[3] + 0.5)});
      pop("#ul-c0", ${t(TM.canUp + 0.3)}); pop("#ul-c1", ${t(TM.who + 0.3)}); bump("#ul-r2", ${t(TM.tlk)}, 1.04, 1);
      // ===== L4 能无延迟升级的协议，等于你把资金交给了升级权限的持有人。
      pop("#ul-c2", ${t(TM.nodl)}); hot("#ul-r2", ${t(TM.nodl)}, "#fde3df");
      grow("ukey", ${t(TM.nodl + 0.5)}); pop("#lb-key", ${t(TM.nodl + 0.9)}); draw("cv-key", ${t(TM.hold - 0.4)}); bump("#lb-key", ${t(TM.hold)}, 1.12);
      // ===== L5 同一个协议在不同的链上，升级权限要分别核对。
      out("#ul, #cv-key, #lb-key, #ukey", ${t(LS[5] - 0.2)});
      [0, 1, 2].forEach((i) => { grow("ch" + i, ${t(LS[5] + 0.2)} + i * 0.25); pop("#lb-ch" + i, ${t(LS[5] + 0.7)} + i * 0.25); pop("#lb-chk" + i, ${t(TM.chk)} + i * 0.35); });
      // ===== L6 回到开头。升级的代码没有错，为什么钱还是被提走了？
      out("#lb-eng, #lb-aud, #lb-usr, #lb-ch0, #lb-ch1, #lb-ch2, #lb-chk0, #lb-chk1, #lb-chk2", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "A", 2.6); pop("#kw-q", ${t(LS[6] + 1.6)});
      // ===== L7 因为升级换掉的不只是代码。初始化参数写进了存储，把全零变成了可信。
      out("#kw-q", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "door", 1.4);
      flash("#bv-impl", ${t(LS[7] + 1.6)}, 2); draw("cv-cf", ${t(TM.store - 0.4)}); pop("#lb-store", ${t(TM.store)});
      pop("#lb-cf0", ${t(TM.allz)}); bump("#lb-cf0", ${t(TM.allz + 0.5)}, 1.1);
      // ===== L8 这在默认值和合法值无法区分时成立。零值没有业务含义，这一步就拦得住。
      out("#cv-cf, #lb-store", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "gate", 1.4);
      pop("#kw-cond", ${t(LS[8] + 1.0)}); pop("#lb-lt0", ${t(LS[8] + 1.4)});
      out("#lb-cf0", ${t(TM.zero8)}, 0.15); pop("#lb-cf1", ${t(TM.zero8)}, 0.15); pop("#lb-cf2", ${t(TM.zero8 + 0.5)});
      out("#lb-lt0", ${t(TM.stop - 1.4)}, 0.2); X1.walk(tl, "lt", ${t(TM.stop - 1.3)}, 1.1, [[${f(lx)}, ${f(ly)}]]);
      KIT.arm(tl, "gt", ${t(TM.stop - 0.6)}, false); pop("#lb-lt1", ${t(TM.stop - 0.1)}); pop("#lb-stop", ${t(TM.stop + 0.2)});
      // ===== L9 代理存着钱，实现给出规则。谁能换规则，谁就拥有这笔钱。
      out("#kw-cond, #lb-cf1, #lb-cf2, #lb-lt1, #lb-stop", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "B", 1.6);
      pop("#kw-proxy", ${t(LS[9] + 1.0)}); pop("#kw-impl", ${t(TM.rule)}); bump("#vm-impl", ${t(TM.rule + 0.3)}, 1.06);
      // ===== L10 下一集讲 DeFi 经济安全。
      out("#kw-proxy, #kw-impl", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "world", 1.8);
`,
});
