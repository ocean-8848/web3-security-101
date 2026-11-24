// ep27/seg2「② 八道关口」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.versionA（BRIEF）。ends static on CAMS.gatesB
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A 展台 + B–E 整条流水线，八道关口都在画内（seg2 L0–L3、L13–L17、L21；seg6 L1、L11 结束卡）
//   incidentA    A 售货机 + 攻击者 + 流出的币 + 点阵（seg1 起点 L0–L5）
//   versionA     A 两张版本卡 + 审计报告 + 公章 + 题卡 + 售货机（seg1 L6–L11 终点；seg2 起点）
//   planeB       B 比喻角：模型飞机 + 图纸 + 风洞 + 公章 + 黑匣子 + 塔 + 扳手 + 焊死投递箱（seg2 L4–L12）
//   gatesB       B 关口 ①②③ + 传送带 + 放大镜 + 告警灯（seg2 L18–L23 终点；seg3 起点）
//   specB        B 规格台 + 规格文件 + 天平 + 角色板 + 编码规范（seg3 L0–L3）
//   unitC        C 阅卷机 + 答题卡 + 关口 ④（seg3 L4–L5）
//   fuzzC        C 摇奖机 + 金库份额机 + 份额 + 台秤 + 取整刀（seg3 L6–L10；代码卡 A 在左侧）
//   invC         C 银行柜台 + 回调臂 + 顺序条 + 天平 + 按钮面板 + 不变量清单（seg3 L11–L21；代码卡 B 在右侧）
//   formalC      C 证明卡 + 数学库机器 + 小工程师 + 关口 ⑤（seg3 L22–L24 终点；seg4 起点）
//   auditD       D 冰封版本卡 + 规格文件 + 两名审计 + 竞赛小人 + 竞赛牌 + 修复单 + 编译器手册 + 关口 ⑥（seg4 L0–L7）
//   deployD      D 笔记本 + 链 + 浏览器 + 部署账户 + 钥匙 + 多签保险柜 + 时间锁 + 关口 ⑦（seg4 L8–L12）
//   chainD       D 三块链牌 + 刻度尺 + 时钟 + 回执签 + 两枚币 + 分叉扳道器（seg4 L13–L19 终点；seg5 起点）
//   monitorE     E 关口 ⑧ + 合约 + 监控墙 + 赏金（seg5 L0–L7）
//   warE         E 值班 + 闸刀 + 作战室 + 安全地址 + 冻结 + 公告，带上合约和告警灯（seg5 L8–L14）
//   methE        E mETH 售货机 + 沙漏 + 闸刀 + 塔 + cmETH 币（seg5 L15–L19 终点；seg6 起点 L0）
//   checkE       E 核对台：审计版本卡 + 线上字节码 + 放大镜 + 证明卡 + 改动小卡（seg6 L2–L10）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E4, E6, E22, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const K = 0.866;   // z → screen px

/** 不支持 scale 的物件：绕地面点包一层缩放（k），可再抬高 dz（传送带上），并换算 anchors */
function wput(key, o, r, k = 1, dz = 0, dy = 0, opts = {}) {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...opts, wrap: (svg) => `${opts.gid ? `<g id="${opts.gid}">` : ""}<g transform="translate(0,${f(-dz * K)}) translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>${opts.gid ? "</g>" : ""}` });
  for (const n in A[key]) if (Array.isArray(A[key][n])) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k - dz * K];
}

// ---------------------------------------------------------------- 世界物件
// A 事故展台（= seg1 末帧 versionA）
put("vmA", L.A_VEND, E1.vending(L.A_VEND, { id: "vmA", sign: "金库合约", scale: 0.9 }));
put("cdA", L.A_CARD_AUDIT, E4.punchCard(L.A_CARD_AUDIT, { id: "cdA", kind: "card", title: "审计版本", scale: 0.9 }));
put("cdL", L.A_CARD_LIVE, E4.punchCard(L.A_CARD_LIVE, { id: "cdL", kind: "card", title: "上线版本", scale: 0.9 }));
put("rpA", L.A_REPORT, O.doc(L.A_REPORT, { id: "rpA", title: "审计报告", stamp: true, w: 120, h: 150 }));
wput("slA", L.A_SEAL, O.seal(L.A_SEAL, { id: "slA" }), 0.7);
put("snA", L.A_SIGN, E1.signBoard(L.A_SIGN, { id: "snA", style: "plate", text: "事故展台" }));
{ const q = L.rect(L.A_CARD_LIVE, "punchCard"); add(L.A_CARD_LIVE, `<rect x="${f(q[0] - 14)}" y="${f(q[1] - 14)}" width="${f(q[2] - q[0] + 28)}" height="${f(q[3] - q[1] + 28)}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="14 10"/>`, 200);
  const [qx, qy] = at(L.A_QUIZ);
  add(L.A_QUIZ, `<g><rect x="${qx - 180}" y="${qy - 120}" width="360" height="110" rx="14" fill="#ffffff" stroke="#2aa3c9" stroke-width="3"/><text x="${qx}" y="${qy - 52}" font-family="Noto Sans SC" font-size="28" font-weight="900" fill="#1c1c1c" text-anchor="middle">通过审计 = 线上代码安全？</text></g>`); }
// 传送带 B–E + 八道关卡
L.BELT.forEach((s, i) => put("belt" + i, s.o, E2.conveyor(s.o, { id: "belt" + i, len: s.len, width: L.BELT_W }), -40));
const GATES = [...L.B_GATES, ...L.C_GATES, ...L.D_GATES, L.E_GATE];
const GN = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
GATES.forEach((g, i) => wput("g" + (i + 1), g, O.checkpoint(g, { id: "g" + (i + 1), n: GN[i], road: false }), 0.6));
[["snB", L.B_SIGN, "设计台"], ["snC", L.C_SIGN, "测试车间"], ["snD", L.D_SIGN, "审计与部署"], ["snE", L.E_SIGNS[0], "监控与应急"]]
  .forEach(([id, o, text]) => put(id, o, E1.signBoard(o, { id, style: "plate", text })));
put("vmE", L.E_VEND, E1.vending(L.E_VEND, { id: "vmE", sign: "合约", scale: 0.8 }));
// 版本卡：跑全程的 vc（L13 起）+ B 区停在 ②③ 之间的 bc（L18 起）
const RUN0 = L.BELT_U[0] + 120;
wput("vc", L.beltAt(RUN0), E4.punchCard(L.beltAt(RUN0), { id: "vc", kind: "card", title: "版本", scale: 0.7 }), 1, L.BELT_Z, 30, { gid: "vcm" });
wput("bc", L.B_CARD, E4.punchCard(L.B_CARD, { id: "bc", kind: "card", title: "版本", scale: 0.7 }), 1, L.BELT_Z, 30);
put("mag", L.B_MAG, O.magnifier(L.B_MAG, { id: "mag", z: 150 }), 60);
L.B_BEACONS.forEach((o, i) => put("bk" + i, o, O.beacon(o, { id: "bk" + i })));
// B 比喻角
put("plane", L.B_PLANE, X.planeModel(L.B_PLANE, { id: "plane", scale: 0.9 }), 0, { grow: true });
put("bp", L.B_BLUEPRINT, O.doc(L.B_BLUEPRINT, { id: "bp", title: "图纸", w: 140, h: 110 }), 0, { grow: true });
wput("sealB", L.B_SEAL, O.seal(L.B_SEAL, { id: "sealB", text: "适航认证", markText: "认证" }), 0.6, 0, 0, { grow: true });
wput("hsm", L.B_HSM, O.hsm(L.B_HSM, { id: "hsm" }), 0.6);
wput("tw", L.B_TOWER, O.tower(L.B_TOWER, { id: "tw" }), 0.5);
put("wr", L.B_WRENCH, E22.wrench(L.B_WRENCH, { id: "wr", scale: 0.8 }));
put("burn", L.B_BURN, E6.burnBox(L.B_BURN, { id: "burn", plate: "不可升级", sub: "", cards: 0, scale: 0.6 }));
// 原生 SVG：风洞气流线、螺丝、焊缝红光
{ const [cx, cy] = A.plane.center, P = [];
  for (const [dx, dy, bend] of [[-330, -40, -30], [-300, -130, 40], [-290, 60, -40], [-200, -190, 30], [-210, 130, -20]]) {
    const x0 = cx + dx, y0 = cy + dy, x1 = cx - 70 + dx * 0.15, y1 = cy + dy * 0.2;
    P.push(`<path d="M${f(x0)} ${f(y0)} Q${f((x0 + x1) / 2)} ${f((y0 + y1) / 2 + bend)} ${f(x1)} ${f(y1)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="16 10" stroke-linecap="round"/><path d="M${f(x1 - 12)} ${f(y1 - 8)} L${f(x1)} ${f(y1)} L${f(x1 - 12)} ${f(y1 + 8)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-linecap="round"/>`);
  }
  add(L.B_WIND, S.hid("wind", P.join("")), 400);
  const sc = [], hi = [];
  for (let i = 0; i < 6; i++) {
    const [sx, sy] = at(S.rel(L.B_BLUEPRINT, 150 + i * 45, 40));
    const g = `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="12" ry="7" fill="#b9b4aa" stroke="#7d786e" stroke-width="2"/><path d="M${f(sx - 7)} ${f(sy)}H${f(sx + 7)}" stroke="#6d685e" stroke-width="2.4"/>`;
    sc.push(g);
    if (i === 3) { A.spot = [sx, sy]; hi.push(`<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="22" ry="13" fill="none" stroke="#2aa3c9" stroke-width="4"/><ellipse cx="${f(sx)}" cy="${f(sy)}" rx="12" ry="7" fill="#2aa3c9"/>`); }
  }
  add(L.B_BLUEPRINT, `<g id="screws">${sc.join("")}</g>` + S.hid("screw-hi", hi.join("")), 60);
  const [bx, by] = A.burn.center;
  add(L.B_BURN, S.hid("weld", `<ellipse cx="${f(bx)}" cy="${f(by + 6)}" rx="70" ry="64" fill="none" stroke="#e0453a" stroke-width="6" stroke-dasharray="4 7" stroke-linecap="round"/><ellipse cx="${f(bx)}" cy="${f(by + 6)}" rx="80" ry="74" fill="none" stroke="#e0453a" stroke-width="2" opacity="0.5"/>`), 200);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-plane", up(A.plane.top, 10), "模型飞机", "lab-ink");
lb("lb-nb", [A.plane.wingL[0] - 60, A.plane.wingL[1] + 10], "任何情况下不能断", "lab-cs", "r");
lb("lb-inv", [A.plane.wingL[0] - 60, A.plane.wingL[1] + 62], "不变量", "lab-g lab-sm", "r");
const [wx, wy] = at(L.B_WIND);
lb("lb-unit", [wx - 130, wy - 150], "单元测试", "lab-cs lab-sm");
lb("lb-fuzz", [wx + 60, wy - 150], "模糊测试", "lab-cs lab-sm");
lb("lb-audit", up(A.sealB.top, 8), "审计 · 适航认证", "lab-ink");
lb("lb-spot", up(A.spot, 22), "抽查", "lab-cs lab-sm");
lb("lb-hsm", up(A.hsm.top, 8), "黑匣子", "lab-ink lab-sm");
lb("lb-tw", up(A.tw.top, 8), "地面雷达", "lab-ink lab-sm");
lb("lb-mon", [A.hsm.ground[0], A.hsm.ground[1] + 24], "监控 · 应急", "lab-cs", "t");
const WR_DX = -70, WR_DY = 10;   // 扳手靠到飞机旁（世界画布 px）
lb("lb-wr", [A.wr.top[0] + WR_DX - 10, A.wr.top[1] + WR_DY - 70], "召回维修 ✓", "lab-g");
lb("lb-wx", [A.wr.center[0] + WR_DX, A.wr.center[1] + WR_DY], "✕", "lab-r", "c");
lb("lb-burn", up(A.burn.top, 8), "不可升级", "lab-r");
// gatesB：三个告警灯各一张"已结论"（左 / 上 / 右错开）
lb("lb-ok0", [A.bk0.top[0] - 30, A.bk0.top[1] + 10], "✓ 已结论", "lab-g lab-sm", "r");
lb("lb-ok1", up(A.bk1.top, 14), "✓ 已结论", "lab-g lab-sm");
lb("lb-ok2", [A.bk2.top[0] + 30, A.bk2.top[1] + 10], "✓ 已结论", "lab-g lab-sm", "l");

// ---------------------------------------------------------------- 词语时刻
const TM = {
  gate: [w("规格与威胁模型", 14), w("安全编码规范", 14), w("静态分析", 14), w("单元", 15), w("形式化验证", 15), w("外部审计", 16), w("安全部署", 16), w("监控", 17)],
  bounty: w("漏洞赏金", 17), eight: w("八个", 13),
};
const t = (x) => f(x);

// ---------------------------------------------------------------- 屏幕层（wide k 0.115：标记一律屏幕层、大字号）
const sW = (p) => S.scr("wide", p), sG = (p) => S.scr("gatesB", p);
const MK = GATES.map((_, i) => { const p = sW(A["g" + (i + 1)].plate); return [p[0], p[1] - 24]; });   // 门牌圆点中心
const beltP = (u, dv = 0) => sW(Wp(u, dv, L.BELT_Z));
const box = (id, x, y, cls, inner, extra = "") => `<div id="${id}" class="${cls}" style="left:${f(x)}px;top:${f(y)}px;${extra}">${inner}</div>`;
let H = "", SV = "";
// 门牌圆点 ①–⑧
MK.forEach(([x, y], i) => { H += box("gm" + (i + 1), x - 22, y - 22, "gm h0", GN[i]); });
// 关口名牌：①–⑤ 左列，⑥–⑧ 右列，引线连到圆点
const NAMES = ["规格与威胁模型", "编码规范", "静态分析", "测试", "形式化验证", "外部审计", "安全部署", "监控 · 应急"];
const TAGY = [580, 510, 440, 370, 300, 600, 520, 400];
NAMES.forEach((n, i) => {
  const left = i < 5, x = left ? 70 : 1530, y = TAGY[i];
  H += box("gt" + (i + 1), x, y, "gt h0", `<i>${GN[i]}</i>${n}${i === 7 ? `<div id="gt8b" class="h0">赏金 · 保险</div>` : ""}`);
  const [mx, my] = MK[i], lx = left ? x + 300 : x, ly = y + 26;
  SV += `<line id="ld${i + 1}" x1="${lx}" y1="${ly}" x2="${f(mx + (left ? -16 : 16))}" y2="${f(my + 10)}" stroke="#1f9d55" stroke-width="3" stroke-dasharray="7 6" style="opacity:0"/>`;
});
// L1 起点？ / 终点？
{ const p0 = beltP(L.BELT_U[0]), p1 = beltP(L.BELT_U[1]);
  H += box("q0", p0[0] - 110, p0[1] + 40, "qt h0", `起点？<b>✕</b>`) + box("q1", p1[0] + 30, p1[1] - 120, "qt h0", `终点？<b>✕</b>`); }
// L2 ⑥ 外部审计；L3 之前 / 之后 色带
{ const [x6, y6] = MK[5]; H += box("ea", x6 - 100, y6 - 110, "gt gt-c h0", "外部审计");
  const band = (id, u0, u1) => { const P = [beltP(u0, -300), beltP(u1, -300), beltP(u1, 300), beltP(u0, 300)]; return `<polygon id="${id}" points="${P.map((p) => p.map(f).join(",")).join(" ")}" fill="#2aa3c9" fill-opacity="0.28" stroke="#1d93ba" stroke-width="2.5" style="opacity:0"/>`; };
  const m56 = (GATES[4].u + GATES[5].u) / 2, m67 = (GATES[5].u + GATES[6].u) / 2;
  SV += band("bandB", L.BELT_U[0], m56 - 250) + band("bandA", m67 + 250, L.BELT_U[1]);
  const pb = beltP((L.BELT_U[0] + m56) / 2, 0), pa = beltP((m67 + L.BELT_U[1]) / 2, 0);
  H += box("tb", pb[0] - 70, pb[1] + 50, "gt gt-c h0", "之前") + box("ta", pa[0] - 10, pa[1] + 50, "gt gt-c h0", "之后"); }
// L13–L17 跑全程的版本卡标记（8 个点逐个变绿）
{ const p = beltP(RUN0); H += box("run", p[0] - 98, p[1] + 34, "run h0", `版本${GN.map((_, i) => `<span id="rd${i}"></span>`).join("")}`); }
// L21 回到 wide：⑥→④ 补成测试；⑧→① 后方回流
S.curve("cvT", MK[5], MK[3], { color: "#2aa3c9", c1: [MK[5][0] - 80, MK[5][1] - 160], c2: [MK[3][0] + 60, MK[3][1] - 170] });
S.curve("cvR", MK[7], MK[0], { color: "#2aa3c9", c1: [MK[7][0] - 300, MK[7][1] - 260], c2: [MK[0][0] + 120, MK[0][1] - 420] });
H += box("lbT", (MK[5][0] + MK[3][0]) / 2 - 90, MK[3][1] - 230, "gt gt-c h0", "补成测试");
H += box("lbR", 640, 190, "gt gt-c h0", "发现问题 → 回到规格");
// gatesB：L18 修复成本条；L19 每次提交；L22 气泡；L23 没想到的
{ const g3 = sG(A.g3.top);
  H += `<div id="cost" class="h0" style="left:330px;top:300px"><div class="cost-t">修复成本</div><div class="cost-bar"></div><div class="cost-l">改文档</div><div class="cost-r">改线上</div></div>`;
  H += box("loop3", g3[0] - 100, g3[1] - 72, "gt gt-c h0", "↻ 每次提交");
  H += box("loop45", 1560, 470, "gt gt-c h0", "↻ ④ 测试 →", "width:270px") + box("loop5", 1560, 540, "gt gt-c h0", "↻ ⑤ 形式化 →", "width:270px");
  SV += `<ellipse id="bub" cx="860" cy="660" rx="430" ry="190" fill="#2aa3c9" fill-opacity="0.12" stroke="#1d93ba" stroke-width="4" stroke-dasharray="14 9" style="opacity:0"/>`;
  SV += `<rect id="grey" x="1300" y="470" width="540" height="390" rx="40" fill="#8a8478" fill-opacity="0.2" stroke="#8a8478" stroke-width="3" stroke-dasharray="10 8" style="opacity:0"/>`;
  H += box("lbBub", 760, 400, "gt gt-c h0", "你想到的") + box("lbGrey", 1330, 490, "qt h0", "没想到的");
  H += box("ux0", 1340, 580, "gt gt-r h0", "经济攻击") + box("ux1", 1340, 660, "gt gt-r h0", "跨协议组合") + box("ux2", 1340, 760, "gt gt-c h0", "→ 经济审计"); }
// L9 比喻的局限；L12 越早越严
H += box("lim", 1500, 130, "qt h0", "比喻的局限") + box("early", 640, 200, "gt gt-c h0", "← 越早越严", "font-size:40px");
// ---------------------------------------------------------------- 镜头时间线需要的 Node 侧数值
const W0 = Wp(0, 0, 0);
const RUNW = (u) => { const p = Wp(u - RUN0, 0, 0); return [p[0] - W0[0], p[1] - W0[1]]; };   // 世界画布位移
const RUNS = (u) => { const a = beltP(u), b = beltP(RUN0); return [a[0] - b[0], a[1] - b[1]]; };  // 屏幕位移
let runJs = "", prev = LS[13] + 1.6;
TM.gate.forEach((tg, i) => {
  const u = GATES[i].u + 70, t0 = Math.max(prev + 0.05, tg - 1.0), d = Math.max(0.3, tg - t0);
  const [wx2, wy2] = RUNW(u), [sx, sy] = RUNS(u);
  runJs += `tl.to("#vcm", { x: ${f(wx2)}, y: ${f(wy2)}, duration: ${f(d)}, ease: "power1.inOut" }, ${f(t0)}); tl.to("#run", { x: ${f(sx)}, y: ${f(sy)}, duration: ${f(d)}, ease: "power1.inOut" }, ${f(t0)});
      tl.to("#gm${i + 1}", { backgroundColor: "#1f9d55", duration: 0.2 }, ${f(tg)}); KIT.arm(tl, "g${i + 1}", ${f(tg)}, true, 0.5); fadeIn("#g${i + 1}-glow", ${f(tg)}, 0.3);
      pop("#gt${i + 1}", ${f(tg + 0.1)}); fadeIn("#ld${i + 1}", ${f(tg + 0.1)}); tl.set("#rd${i}", { backgroundColor: "#1f9d55" }, ${f(tg)});
      `;
  prev = tg;
});
TM.wideOut = [...GATES.map((_, i) => `#gm${i + 1}, #gt${i + 1}, #ld${i + 1}`), "#run"].join(", ");

const html = `<svg id="ovw" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${SV}</svg>` + H;
const css = `
    .h0 { opacity: 0; }
    .gm { position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #8a8478; color: #fff; font-size: 30px; font-weight: 900; line-height: 44px; text-align: center; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(70,60,40,0.25); }
    .gt { position: absolute; box-sizing: border-box; background: #ffffff; border-radius: 12px; padding: 6px 16px 8px; border-left: 7px solid #1f9d55; box-shadow: 0 8px 20px rgba(70,60,40,0.14); font-size: 30px; font-weight: 900; white-space: nowrap; color: #1c1c1c; }
    #gt1, #gt2, #gt3, #gt4, #gt5, #gt6, #gt7, #gt8 { width: 300px; }
    .gt i { font-style: normal; color: #1f9d55; margin-right: 8px; }
    #gt8b { font-size: 28px; color: #1d93ba; padding-left: 40px; }
    .gt-c { border-left-color: #1d93ba; color: #1d93ba; }
    .gt-r { border-left-color: #e0453a; color: #c23a30; }
    .qt { position: absolute; background: #ebe6dc; color: #6d685e; border-radius: 12px; padding: 6px 18px 8px; font-size: 30px; font-weight: 900; white-space: nowrap; box-shadow: 0 6px 16px rgba(70,60,40,0.12); }
    .qt b { color: #e0453a; margin-left: 10px; font-size: 34px; }
    .run { position: absolute; width: 196px; box-sizing: border-box; background: #fffdf8; border: 3px solid #1d93ba; border-radius: 10px; padding: 2px 8px 4px; font-size: 28px; font-weight: 900; color: #1c1c1c; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .run span { width: 10px; height: 10px; border-radius: 50%; background: #cfc9bd; flex: none; }
    #cost { position: absolute; width: 640px; height: 120px; }
    .cost-t { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 10px; padding: 2px 14px 4px; }
    .cost-bar { position: absolute; left: 0; top: 52px; width: 640px; height: 22px; border-radius: 11px; background: linear-gradient(90deg, #1f9d55, #e0453a); }
    .cost-l { position: absolute; left: 0; top: 80px; font-size: 28px; font-weight: 900; color: #1b8a4b; }
    .cost-r { position: absolute; right: 0; top: 80px; font-size: 28px; font-weight: 900; color: #e0453a; }`;

S.build({
  cam0: "versionA", sub: "审计是一个关口，不是起点也不是终点",
  grid: { u0: -3900, u1: 21200, v0: -12300, v1: 13400 }, box: [-1100, -7100, 17000, 9700],   // 盖住本段镜头 versionA · wide · planeB · gatesB
  shown: [], css, html,
  terms: [
    { id: "t0", t: "威胁模型", d: "列出谁会攻击、从哪攻击、损失多大", at: w("威胁模型", 14) },
    { id: "t1", t: "形式化验证", d: "用数学方法证明代码满足规格", at: w("形式化验证", 15) },
    { id: "t2", t: "漏洞赏金", d: "向报告漏洞的白帽支付奖励", at: w("漏洞赏金", 17) },
    { id: "t3", t: "静态分析", d: "不运行代码，通过分析源码发现问题", at: w("静态分析", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      tl.set("#vcm, #bc", { opacity: 0 }, 0); tl.set("${GATES.map((_, i) => `#g${i + 1}-glow`).join(", ")}", { opacity: 0 }, 0);
      // ===== L0 先给一句准确的说法。
      cam(${t(LS[0])}, "wide", 1.6, "power2.inOut");
      // ===== L1 审计不是安全的起点，也不是终点。
      pop("#q0", ${t(w("起点", 1))}); pop("#q1", ${t(w("终点", 1))});
      // ===== L2 它是流水线上的一个关口。
      tl.set("#gm6", { backgroundColor: "#1d93ba" }, 0); pop("#gm6", ${t(w("关口", 2))}); pop("#ea", ${t(w("关口", 2) + 0.2)});
      // ===== L3 它之前要有设计和测试，之后要有监控和应急。
      fadeIn("#bandB", ${t(w("设计", 3))}, 0.4); pop("#tb", ${t(w("设计", 3) + 0.2)}); fadeIn("#bandA", ${t(w("监控", 3))}, 0.4); pop("#ta", ${t(w("监控", 3) + 0.2)});
      out("#q0, #q1, #gm6, #ea, #bandB, #bandA, #tb, #ta", ${t(LS[4] - 0.25)});
      // ===== L4 打个比方，合约开发像造一架飞机。
      cam(${t(LS[4])}, "planeB", 1.5, "power2.inOut"); grow("plane", ${t(LS[4] + 1.1)}); pop("#lb-plane", ${t(LS[4] + 1.5)});
      // ===== L5 设计时画图纸，写下任何情况下机翼都不能断。
      grow("bp", ${t(w("图纸", 5))}); X27.wingRed(tl, "plane", ${t(w("机翼", 5))}, "L"); pop("#lb-nb", ${t(w("机翼", 5))}); pop("#lb-inv", ${t(w("机翼", 5) + 0.5)});
      X27.wingRed(tl, "plane", ${t(LE[5] - 0.2)}, "L", false);
      // ===== L6 每个零件出厂前都要测，还要放进风洞，用各种极端风向去吹。
      pop("#lb-unit", ${t(w("测", 6))}); fadeIn("#wind", ${t(w("风洞", 6))}, 0.4); tl.fromTo("#wind", { x: -30 }, { x: 12, duration: 3.2, ease: "none", immediateRender: false }, ${t(w("风洞", 6))}); pop("#lb-fuzz", ${t(w("风洞", 6) + 0.4)});
      // ===== L7 外部机构做适航认证，它不查每一颗螺丝，只抽查关键系统。
      grow("sealB", ${t(w("适航认证", 7))}); pop("#lb-audit", ${t(w("适航认证", 7) + 0.4)}); fadeIn("#screw-hi", ${t(w("抽查", 7))}); pop("#lb-spot", ${t(w("抽查", 7) + 0.1)});
      // ===== L8 飞上天以后，有黑匣子和地面雷达，出了事有应急程序。
      flash("#hsm", ${t(w("黑匣子", 8))}, 2, 0.4); pop("#lb-hsm", ${t(w("黑匣子", 8))}); flash("#tw", ${t(w("地面雷达", 8))}, 2, 0.4); pop("#lb-tw", ${t(w("地面雷达", 8))}); pop("#lb-mon", ${t(w("应急", 8))});
      // ===== L9 这个比方有一处不成立。
      pop("#lim", ${t(LS[9] + 0.3)});
      // ===== L10 飞机出厂后，还能召回维修。
      tl.to("#wr-mv", { x: ${WR_DX}, y: ${WR_DY}, duration: 0.8, ease: "power2.inOut" }, ${t(w("召回", 10) - 0.4)}); pop("#lb-wr", ${t(w("召回", 10) + 0.5)});
      // ===== L11 不可升级的合约，部署之后，就再也不能修改。
      fadeIn("#weld", ${t(w("不可升级", 11))}, 0.3); flash("#weld", ${t(w("不可升级", 11) + 0.4)}, 2, 0.4); pop("#lb-burn", ${t(w("不可升级", 11) + 0.2)});
      out("#lb-wr", ${t(w("再也不能", 11) - 0.1)}); pop("#lb-wx", ${t(w("再也不能", 11))});
      // ===== L12 所以前面的关口，必须更严。
      pop("#early", ${t(LS[12] + 0.5)});
      out("#lb-plane, #lb-nb, #lb-inv, #lb-unit, #lb-fuzz, #lb-audit, #lb-spot, #lb-hsm, #lb-tw, #lb-mon, #lb-wx, #lb-burn, #lim, #early", ${t(LS[13] - 0.25)});
      // ===== L13 把这条流水线展开，一共八个关口。
      cam(${t(LS[13])}, "wide", 1.5, "power2.inOut"); tl.set("#gm6", { backgroundColor: "#8a8478" }, ${t(LS[13])});
      ${GN.map((_, i) => `pop("#gm${i + 1}", ${t(TM.eight + i * 0.1)});`).join(" ")}
      fadeIn("#vcm", ${t(LS[13] + 1.4)}); pop("#run", ${t(LS[13] + 1.5)});
      // ===== L14–L17 关口依次亮绿（版本卡走到哪道就亮哪道）
      ${runJs}
      pop("#gt8b", ${t(TM.bounty)});
      out("${TM.wideOut}", ${t(LS[18] - 0.25)});
      // ===== L18 越靠左的关口，修复越便宜，规格阶段发现的问题，只要改文档。
      cam(${t(LS[18])}, "gatesB", 1.5, "power2.inOut"); fadeIn("#bc", ${t(LS[18] + 1.2)}); fadeIn("#cost", ${t(w("修复", 18))}, 0.4); bump(".cost-l", ${t(w("改文档", 18))}, 1.2);
      // ===== L19 静态分析、测试和形式化验证是自动的，每次提交代码都该跑一遍。
      pop("#loop3", ${t(w("静态分析", 19))}); pop("#loop45", ${t(w("测试", 19))}); pop("#loop5", ${t(w("形式化验证", 19))});
      // ===== L20 静态分析误报多，不求零告警，要求每个告警都有结论。
      tl.fromTo("#mag", { x: -50 }, { x: 50, duration: 1.0, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, ${t(LS[20])});
      ${[0, 1, 2].map((i) => `KIT.beacon(tl, "bk${i}", ${t(w("误报", 20) + i * 0.25)}, 3.0);`).join(" ")}
      ${[0, 1, 2].map((i) => `pop("#lb-ok${i}", ${t(w("结论", 20) + i * 0.2)});`).join(" ")}
      out("#cost, #loop3, #loop45, #loop5, #lb-ok0, #lb-ok1, #lb-ok2", ${t(LS[21] - 0.25)});
      // ===== L21 审计发现的问题，要反过来补成测试，防止以后再犯。（短暂拉到 wide）
      cam(${t(LS[21])}, "wide", 1.1, "power2.inOut"); pop("#gm1, #gm4, #gm6, #gm8", ${t(LS[21] + 1.0)});
      draw("cvT", ${t(LS[21] + 1.2)}, 0.7); pop("#lbT", ${t(LS[21] + 1.6)}); draw("cvR", ${t(LS[21] + 2.1)}, 0.9); pop("#lbR", ${t(LS[21] + 2.6)});
      out("#cvT, #cvR, #lbT, #lbR, #gm1, #gm4, #gm6, #gm8", ${t(LE[21] - 0.75)});
      cam(${t(LE[21] - 0.5)}, "gatesB", 1.0, "power2.inOut");
      // ===== L22 但所有关口都有一个前提，你想到了要检查什么。
      fadeIn("#bub", ${t(w("想到", 22))}, 0.4); pop("#lbBub", ${t(w("想到", 22) + 0.2)}); fadeIn("#grey", ${t(w("想到", 22) + 0.9)}, 0.4); pop("#lbGrey", ${t(w("想到", 22) + 1.1)});
      // ===== L23 经济攻击和跨协议的组合风险，常常要专门的经济审计。
      pop("#ux0", ${t(w("经济攻击", 23))}); pop("#ux1", ${t(w("组合", 23))}); pop("#ux2", ${t(w("经济审计", 23))});
`,
});
