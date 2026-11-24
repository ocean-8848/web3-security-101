// ep10/seg5「⑤ 谁能换实现」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.F

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 opts.scale 的物件（checkpoint）绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1）
const putK = (key, o, svg, k, opt = {}) => {
  const [gx, gy] = at(o);
  put(key, o, svg, 0, { ...opt, wrap: (s) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${s}</g>` });
  for (const [n, p] of Object.entries(A[key])) if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
};
const og = ([X0, Y0]) => { const q = G(X0, Y0); return { u: q.u, v: q.v }; };   // 世界画布点 → 地面点
const mv = (p, d, k = 1) => [Math.round(p[0] + d[0] * k), Math.round(p[1] + d[1] * k)];
const STEP = [311, -109];                                  // 相邻两道关卡（同 layout）

// A 桥头：承接上段末镜（开场可见）
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
put("bvend", L.BVEND, E1.vending(L.BVEND, { id: "bvend", scale: 0.8, sign: "BRIDGE", maintDoor: true, mdoorOpen: 105 }));
put("agate", L.GATE, O.checkpoint(L.GATE, { id: "agate" }));
put("rootsign", L.ROOTSIGN, E1.signBoard(L.ROOTSIGN, { id: "rootsign", style: "plate", text: "可信根" }));
put("confirm", L.CONFIRM, O.doc(L.CONFIRM, { id: "confirm", title: "确认表", lines: ["全零 → 已确认"], standing: true }));

// F 审批路：6 道关卡（0.6 包一层）+ 门牌（L15 依次长出）+ 路尽头的代理
const GN = ["①", "②", "③", "④", "⑤", "⑥"], GT = ["只追加", "布局比对", "分叉测试", "审计", "时间锁", "部署后验证"];
L.GATES.forEach((o, i) => putK("g" + i, o, O.checkpoint(o, { id: "g" + i, n: GN[i] }), 0.6));
L.GSIGNS.forEach((o, i) => put("gs" + i, o, E1.signBoard(o, { id: "gs" + i, style: "plate", text: GT[i] }), 0, { grow: true }));
put("re", L.ROADEND, E1.vending(L.ROADEND, { id: "re", scale: 0.5, sign: "PROXY", maintDoor: true, mdoorOpen: 105 }));
put("sh", L.SHIELD, O.shield(L.SHIELD, { id: "sh" }), 0, { grow: true });
// gov / compound
put("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 5, th: 3, thText: "多签" }), 0, { grow: true });
put("tl", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tl", frac: 1 }), 0, { grow: true });
put("qc0", L.QCORES[0], X.coreModule(L.QCORES[0], { id: "qc0", ver: "V2" }), 0, { grow: true });
put("qc1", L.QCORES[1], X.coreModule(L.QCORES[1], { id: "qc1", ver: "修复", skin: "green" }), 0, { grow: true });
put("kn", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "kn" }), 0, { grow: true });
put("comp", L.COMP, E1.vending(L.COMP, { id: "comp", scale: 0.45, sign: "COMP" }), 0, { grow: true });
// 超发的 COMP 点阵：金点 9×4，右侧 3 列再叠红点
const [cx, cy] = at(L.COMP);
const dots = (red) => { const a = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) if (!red || c >= 6) a.push(`<circle cx="${cx + 110 + c * 22 + r * 8}" cy="${cy + 25 + r * 22 + c * 5}" r="6.5" fill="${red ? "#e0453a" : "#d4a72c"}"/>`); return a.join(""); };
add(L.COMP, S.hid("cdots", dots(false)) + S.hid("cdots-r", dots(true)), 60);
// mantle
const M = L.MANTLE;
put("ms1", M.l1Sign, E1.signBoard(M.l1Sign, { id: "ms1", text: "L1" }), 0, { grow: true });
put("l1v", M.l1Vend, E1.vending(M.l1Vend, { id: "l1v", scale: 0.45, sign: "BRIDGE", maintDoor: true }), 0, { grow: true });
put("l1m", M.l1Meter, E5.thresholdMeter(M.l1Meter, { id: "l1m", max: 14, th: 6, thText: "6/14" }), 0, { grow: true });
put("l1t", M.l1Lock, E1.timeLock(M.l1Lock, { id: "l1t", frac: 0 }), 0, { grow: true });
put("ms2", M.l2Sign, E1.signBoard(M.l2Sign, { id: "ms2", text: "L2" }), 0, { grow: true });
put("l2v", M.l2Vend, E1.vending(M.l2Vend, { id: "l2v", scale: 0.45, sign: "DAPP" }), 0, { grow: true });
// 走审批路的新实现 V2 + 回滚用的 V1 + 放大镜
const R = (i) => A["g" + i].road;
const START = mv(R(0), STEP, -0.7);
put("nv", og(START), X.coreModule(og(START), { id: "nv", ver: "V2", scale: 0.6 }), 0, { grow: true });
put("v1", L.ROLLBACK[1], X.coreModule(L.ROLLBACK[1], { id: "v1", ver: "V1", scale: 0.6 }), 0, { grow: true });
const MAGP = og(mv(R(3), [70, 30]));
put("mag", MAGP, O.magnifier(MAGP, { id: "mag" }), 0, { grow: true });
const [rx, ry] = at(L.ROADEND);
const DOOR = [rx - 55, ry + 19];                           // 维修门（−u 面）前的地面点
const RB0 = at(L.ROLLBACK[0]), RB1 = at(L.ROLLBACK[1]);
// 弯回箭头：V2 退出的位置 → 弯回维修门（世界层，跟镜头无关）
const ap = [RB1[0] - 10, RB1[1] - 120], aq = [DOOR[0] + 10, DOOR[1] - 140];
add(L.ROLLBACK[1], S.hid("rbarrow", `<path d="M${ap} C${ap[0] + 40},${ap[1] - 190} ${aq[0] + 80},${aq[1] - 200} ${aq}" fill="none" stroke="#1d93ba" stroke-width="7" stroke-linecap="round"/>`
  + `<path d="M${aq[0] - 16},${aq[1] - 22} L${aq[0]},${aq[1] + 4} L${aq[0] + 20},${aq[1] - 18}" fill="none" stroke="#1d93ba" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`), 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-sh", up(A.sh.top, 8), "最高等级", "lab-cs");
lb("lb-mtr", up(A.mtr.top, 8), "多签", "lab-cs");
lb("lb-tl", up(A.tl.top, 8), "时间锁", "lab-cs");
lb("lb-tl7", up(A.tl.top, 10), "约 7 天", "lab-r");
lb("lb-tlslow", up(A.tl.top, 12), "升级：慢", "lab-cs");
lb("lb-pub", A.tl.ground, "公开升级内容", "lab-ink lab-sm", "t");
lb("lb-qc0", up(A.qc0.top, 6), "V2 排队", "lab-cs lab-sm");
lb("lb-q0", up(A.qc0.top, 8), "恶意升级 · 挡住 ✓", "lab-g lab-sm");
lb("lb-qc1", up(A.qc1.top, 6), "紧急修复", "lab-gs lab-sm");
lb("lb-q1", up(A.qc1.top, 8), "紧急修复 · 也挡住 ✗", "lab-r lab-sm");
lb("lb-kn", up(A.kn.top, 8), "暂停：没有", "lab-r");
lb("lb-kn2", up(A.kn.top, 10), "暂停：快", "lab-g");
lb("lb-comp", up(A.comp.top, 6), "奖励合约", "lab-ink lab-sm");
lb("lb-l1v", up(A.l1v.top, 6), "桥 · 门户", "lab-ink lab-sm");
lb("lb-l2v", up(A.l2v.top, 6), "你的协议", "lab-ink lab-sm");
lb("lb-l2ok", up(A.l2v.top, 8), "你的协议 ✓", "lab-g lab-sm");
lb("lb-l1t", up(A.l1t.top, 6), "无延迟", "lab-r lab-sm");
lb("lb-cap", [Math.round((A.l1t.top[0] + A.l2v.top[0]) / 2) + 60, Math.min(A.l1t.top[1], A.l2v.top[1]) - 70], "安全上限", "lab-rs");
lb("lb-nv", up(A.nv.top, 6), "新实现 V2", "lab-cs lab-sm");
lb("lb-mag", up(A.mag.top, 6), "初始化参数", "lab-cs lab-sm");
lb("lb-rb", [Math.round((ap[0] + aq[0]) / 2) + 40, Math.min(ap[1], aq[1]) - 170], "能回滚吗？", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
const KEY = `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="7" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M11.5 12h10M18 12v4M21.2 12v3" stroke="#fff" stroke-width="2.6" fill="none"/></svg>`;
const capScr = [S.scr("mantle", up(A.l2v.top, -40)), S.scr("mantle", A.l1v.maint)];
S.curve("cv-cap", [capScr[0][0] - 60, capScr[0][1]], capScr[1], { color: "#e0453a" });
const html = kw("kw-all", `换实现 = 拿走<b>全部资金</b>`, { x: 560, y: 160, accent: "#e0453a" })
  + ck("pm0", "透明代理 · 管理员槽位", { x: 110, y: 300, w: 540, kind: "c", icon: KEY })
  + ck("pm1", "UUPS · 实现里的授权函数", { x: 110, y: 390, w: 540, kind: "c", icon: KEY })
  + ck("pm2", "信标 · 信标拥有者", { x: 110, y: 480, w: 540, kind: "c", icon: KEY })
  + evt("ev-comp", `<b>Compound 提案 62</b> · 2021 年 9 月`, { color: "#e0453a" })
  + kw("kw-comp", `最坏约 <b>28 万枚 COMP</b> · 约 8000 万美元 ${gtag("The Block 报道")}`, { x: 110, y: 210, size: 34, accent: "#e0453a" })
  + kw("kw-split", `暂停可以<b>快</b> · 升级必须<b>慢</b> ${gtag("解读")}`, { x: 560, y: 170, size: 40 })
  + evt("ev-l2b", `<b>L2BEAT</b> 页面 · Mantle`, { top: 126 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  all: w("全部资金", 0), top: w("最高等级", 1), p0: w("透明代理", 2), p1: w("UUPS", 2), p2: w("信标", 2),
  ms: w("多签", 3), tlk: w("时间锁", 3), queue: w("排队", 4), pub: w("公开", 4),
  over: w("超额", 6), sw: w("紧急开关", 8), gov7: w("治理", 8), fix8: w("修复", 8),
  bad9: w("恶意升级", 9), fix9: w("紧急修复", 9), fast: w("快", 10), slow: w("慢", 10),
  sign12: w("签名", 12), nodelay: w("无需延迟", 12), portal: w("门户", 12), cap: w("安全上限", 13), away: w("转走", 14),
  app: w("只追加", 16), cmp: w("比对", 16), fork: w("主网分叉", 17), aud: w("审计", 18), init: w("初始化参数", 18),
  tlk19: w("时间锁", 19), ver: w("验证", 19), rb: w("回滚", 20), back: w("升级回", 20),
};
const t = (x) => f(x);
// 关卡通过：抬杆 → 推过 → 落杆；pass 依次不重叠
let lastPass = 0;
const pass = (i, t0) => {
  const s = Math.max(t0, lastPass + 0.1); lastPass = s + 1.6;
  return `KIT.arm(tl, "g${i}", ${f(s)}, true, 0.5); X10.push(tl, "nv", ${f(s + 0.3)}, [${mv(R(i), STEP, 0.5)}], 1.0); KIT.arm(tl, "g${i}", ${f(s + 1.4)}, false, 0.5);`;
};

S.build({
  cam0: "A", sub: "升级权就是资金控制权",
  grid: { u0: -8400, u1: 1500, v0: -7400, v1: 2300 }, box: [-7800, -1700, 7000, 3300],   // A（X ≈ −3490..−1630）到 F（X ≈ −7110..−4130）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "多签", d: "多把私钥里凑够数量才能签名", at: w("多签", 3) },
    { id: "t1", t: "时间锁", d: "操作要排队等一段时间才能执行", at: w("时间锁", 4) },
    { id: "t2", t: "主网分叉", d: "复制主网状态的本地测试环境", at: w("主网分叉", 17) },
    { id: "t3", t: "回滚", d: "退回旧版本的实现", at: w("回滚", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 谁能换实现，谁就拥有全部资金。
      cam(${t(LS[0] + 0.2)}, "F", 3.8); pop("#kw-all", ${t(TM.all - 0.3)});
      // ===== L1 所以升级权限，要按最高等级来保护。
      grow("sh", ${t(TM.top)}); pop("#lb-sh", ${t(TM.top + 0.4)}, 0.25); out("#kw-all", ${t(LS[1] + 1.6)});
      // ===== L2 透明代理的权限，在代理的管理员槽位。UUPS 在实现合约的授权函数里。信标在信标的拥有者手里。
      pop("#pm0", ${t(TM.p0)}); pop("#pm1", ${t(TM.p1)}); pop("#pm2", ${t(TM.p2)});
      // ===== L3 无论在哪，都应该经过多签和时间锁。
      out("#pm0, #pm1, #pm2, #lb-sh", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "gov", 1.3);
      grow("mtr", ${t(TM.ms)}); X5.fill(tl, "mtr", ${t(TM.ms + 0.5)}, 3, 0.8); pop("#lb-mtr", ${t(TM.ms + 0.4)}, 0.25);
      grow("tl", ${t(TM.tlk)}); pop("#lb-tl", ${t(TM.tlk + 0.4)}, 0.25);
      // ===== L4 时间锁让升级先排队、再公开，给社区留出复核的时间。
      X1.countdown(tl, "tl", ${t(LS[4] + 0.2)}, 5.4, 0.15); grow("qc0", ${t(TM.queue - 0.2)}); pop("#lb-qc0", ${t(TM.queue + 0.3)}, 0.25);
      pop("#lb-pub", ${t(TM.pub)}, 0.25);
      // ===== L5 但时间锁有另一面。
      out("#lb-qc0, #lb-pub, #lb-mtr", ${t(LS[5] - 0.2)}); flash("#tl", ${t(LS[5] + 0.1)}, 2, 0.4);
      cam(${t(LS[5] + 0.5)}, "compound", 1.3); grow("comp", ${t(LS[5] + 0.9)}); pop("#lb-comp", ${t(LS[5] + 1.3)}, 0.25);
      // ===== L6 2021 年 9 月，Compound 第 62 号提案升级了奖励逻辑，里面有错误，部分用户可以超额领取 COMP。
      pop("#ev-comp", ${t(LS[6] + 0.2)}); X1.dispense(tl, "comp", ${t(TM.over - 0.4)}, { n: 5 });
      fadeIn("#cdots", ${t(TM.over)}, 0.5); fadeIn("#cdots-r", ${t(TM.over + 1.2)}, 0.4); flash("#cdots-r", ${t(TM.over + 1.7)}, 2, 0.4);
      X1.gears(tl, "comp", ${t(LS[6] + 0.4)}, 8.5, 4);
      // ===== L7 按 The Block 报道，最坏情况约 28 万枚，约 8000 万美元。
      pop("#kw-comp", ${t(LS[7] + 0.3)});
      // ===== L8 协议没有能停止分发的紧急开关。任何修复，都要走约 7 天的治理流程。
      out("#kw-comp", ${t(LS[8] - 0.2)}); grow("kn", ${t(TM.sw - 0.3)}); KIT.broke(tl, "kn", ${t(TM.sw)}, { badge: true, ghost: 0.35 }); pop("#lb-kn", ${t(TM.sw + 0.3)}, 0.25);
      out("#lb-tl", ${t(TM.fix8 - 0.2)}); pop("#lb-tl7", ${t(TM.fix8)}, 0.25); grow("qc1", ${t(TM.fix8 + 0.2)}); pop("#lb-qc1", ${t(TM.gov7 + 0.4)}, 0.25);
      // ===== L9 时间锁挡住了恶意升级，也挡住了紧急修复。
      out("#ev-comp, #lb-comp, #lb-qc1, #lb-tl7", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "gov", 1.1);
      X10.skin(tl, "qc0", ${t(TM.bad9 - 0.3)}, "red"); X10.plate(tl, "qc0", ${t(TM.bad9 - 0.3)}, "恶意", "red"); pop("#lb-q0", ${t(TM.bad9 + 0.2)}, 0.25);
      pop("#lb-q1", ${t(TM.fix9 + 0.2)}, 0.25);
      // ===== L10 所以暂停权和升级权要分开设计：暂停可以快，升级必须慢。
      out("#lb-q0, #lb-q1", ${t(LS[10] + 0.6)}); pop("#kw-split", ${t(LS[10] + 0.4)});
      out("#lb-kn", ${t(TM.fast - 0.3)}); KIT.fixed(tl, "kn", ${t(TM.fast - 0.2)}); pop("#lb-kn2", ${t(TM.fast + 0.1)}, 0.25);
      pop("#lb-tlslow", ${t(TM.slow + 0.1)}, 0.25);
      // ===== L11 再往下一层，链本身也可能被升级。
      out("#kw-split, #lb-kn2, #lb-tlslow", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "mantle", 1.4);
      out("#mtr, #tl, #qc0, #qc1, #kn, #comp, #cdots, #cdots-r", ${t(LS[11] + 0.1)}, 0.6);
      grow("ms1", ${t(LS[11] + 0.9)}); grow("l1v", ${t(LS[11] + 1.1)}); grow("ms2", ${t(LS[11] + 1.3)}); grow("l2v", ${t(LS[11] + 1.5)});
      pop("#lb-l1v", ${t(LS[11] + 1.6)}, 0.25); pop("#lb-l2v", ${t(LS[11] + 1.9)}, 0.25);
      // ===== L12 比如 Mantle。按 L2BEAT 的页面，一个 14 人里 6 人签名的多签，无需延迟就能升级 L1 上的桥和门户合约。
      pop("#ev-l2b", ${t(LS[12] + 0.6)}); grow("l1m", ${t(TM.sign12 - 1.2)}); X5.fill(tl, "l1m", ${t(TM.sign12 - 0.6)}, 6, 1.0);
      grow("l1t", ${t(TM.nodelay - 0.3)}); KIT.broke(tl, "l1t", ${t(TM.nodelay + 0.2)}, { badge: true, ghost: 0.6 }); pop("#lb-l1t", ${t(TM.nodelay + 0.4)}, 0.25);
      X1.sideDoor(tl, "l1v", ${t(TM.portal - 0.4)}, 105, 0.8); flash("#lb-l1t", ${t(TM.portal + 1.6)}, 3, 0.4);
      // ===== L13 部署在 L2 上的协议，安全上限就是这条 L2 的升级权限。
      out("#ev-l2b", ${t(LS[13] - 0.2)}); draw("cv-cap", ${t(TM.cap - 0.3)}); pop("#lb-cap", ${t(TM.cap + 0.4)}, 0.25);
      // ===== L14 合约写得再好，资产也可能在 L1 那一端被转走。
      KIT.swap(tl, "#l1v-impl", "#l1v-impl-atk", ${t(LS[14] + 0.6)}, 0.3); X1.dispense(tl, "l1v", ${t(TM.away - 0.5)}, { n: 5, color: "red" });
      out("#lb-l2v", ${t(LS[14] + 0.9)}); pop("#lb-l2ok", ${t(LS[14] + 1.1)}, 0.25);
      // ===== L15 一次安全的升级，按这个顺序走。
      out("#cv-cap, #lb-cap, #lb-l2ok, #lb-l1v, #lb-l1t", ${t(LS[15] - 0.2)}); cam(${t(LS[15])}, "F", 1.4);
      out("#ms1, #l1v, #l1m, #l1t, #ms2, #l2v", ${t(LS[15] + 0.2)}, 0.6);
      [0, 1, 2, 3, 4, 5].forEach((i) => grow("gs" + i, ${t(LS[15] + 0.7)} + i * 0.25));
      // ===== L16 写新实现，只追加变量。用工具比对存储布局。
      grow("nv", ${t(LS[16])}); pop("#lb-nv", ${t(LS[16] + 0.3)}, 0.25); out("#lb-nv", ${t(TM.app - 0.1)});
      ${pass(0, TM.app)} ${pass(1, TM.cmp)}
      // ===== L17 在主网分叉环境里执行升级，跑全部回归测试。
      ${pass(2, TM.fork)} X10.gears(tl, "nv", ${t(TM.fork + 1.6)}, 1.4, 1);
      // ===== L18 审计新实现，也审计升级交易本身，包括初始化参数。
      grow("mag", ${t(TM.aud - 0.2)}); pop("#lb-mag", ${t(TM.init)}, 0.25); ${pass(3, TM.init + 1.0)}
      // ===== L19 通过时间锁排队，公开升级内容。执行以后，立刻跑部署后验证。
      out("#mag, #lb-mag", ${t(LS[19] - 0.2)}); cam(${t(LS[19])}, "rollback", 1.3);
      ${pass(4, TM.tlk19)} ${pass(5, TM.ver - 1.0)} X10.push(tl, "nv", ${t(LE[19] - 1.3)}, [${DOOR}], 1.0);
      // ===== L20 最后，留好回滚方案：新实现有问题时，能不能升级回旧实现？
      X10.push(tl, "nv", ${t(LS[20] + 0.2)}, [${RB0}], 1.0); grow("v1", ${t(LS[20] + 0.4)});
      fadeIn("#rbarrow", ${t(TM.rb + 0.6)}, 0.5); X10.push(tl, "v1", ${t(TM.rb + 1.2)}, [${DOOR}], 1.0); pop("#lb-rb", ${t(TM.back - 0.4)}, 0.25);
      cam(${t(LE[20] - 2.4)}, "F", 1.3);
`,
});
