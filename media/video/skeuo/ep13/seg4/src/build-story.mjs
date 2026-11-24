// ep13/seg4「④ 资源不等于安全」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         五关全景：五座海关 + 关名牌（seg2 L0–L4、L10–L16；seg6 L14–L15 结束卡）
//   evmA         A EVM 关：道闸 + 售货机 + 存储柜 + 参数包裹 + 外部调用（seg2 L5、L12）
//   solB         B Solana 关全景：道闸 + 程序机器 + 护照一字排开 + 调用者 / 攻击者 + 铸币机（seg1 L12–L13 终点；seg2 起点、L6、L17 终点；seg6 L10、L12）
//   passB        近景：护照 ×4 + 程序机器 + "无状态"框 + 调用者 / 攻击者（seg1 L2–L3、L7、L10–L11；seg3 起点 L0–L5；seg6 L11）
//   mintB        近景：wETH 铸币机 + 程序机器 + 守护者签名证明卡 + 伪造的"系统账户"护照 PASS[3]（seg1 起点 L0–L1、L4）
//   yardB        B后 账户链 + 可信根 + Cashio 点阵 + Anchor 盾（seg3 L6–L13）
//   driftB       B后 Drift 角：门限表 + 两张审批 + 沙漏 + 时间锁（seg3 L14–L20 终点；seg4 起点）
//   moveC        C Move 关：道闸 + 资源包裹（复制框）+ Cetus 角全貌（seg2 L7、L12；seg4 L0–L1）
//   cetusC       近景：Cetus 角：池子 + 开源数学库 + 位移格 + 份额机 + 份额凭证 + 攻击者 + 冻结冰壳（seg4 L2–L10）
//   verifC       近景：C 岗亭 + 放大镜"字节码验证器"（seg4 L11–L13）
//   upgC         C后 升级与部署：未审计模块 + 审计版本卡 + 单签钥匙 + 时间锁 + 多签（seg4 L14–L17 终点；seg5 起点）
//   btcD         D Bitcoin 关：道闸 + 集装箱 + Bitcoin 链 + 两台索引器（seg2 L8、L13；seg5 L0–L4）
//   lnD          D 闪电角：mempool + 截止时间钟 + 超时交易信封（seg5 L5–L7）
//   liquidD      D Liquid 角：联盟签名门限表 + L-BTC 铸币机 + 储备对账天平 + 红点阵（seg5 L8–L12）
//   cosmosE      E Cosmos 关：道闸 + 两条应用链 + 海关章 + 证明卡 + 超时牌 + 托管保险箱（seg2 L9、L13；seg5 L13–L14；seg6 起点 L0）
//   haltE        E Jackfruit 角：三台节点 + 头顶三只钟 + 出块闸刀 + 停机警报灯（seg5 L15–L17 终点）
//   cexF         F 交易所接入台全景（seg6 L0–L9）
//   listF        近景：接入清单 + 失败牌 / 同名假币 / 不可回滚沙漏 / SDK 包裹 + 柜台（seg6 L2–L5、L8）
//   world        全部区（含后院和接入台）：远景备用
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.upgC

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E5, E6, E7, E8, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (o) => at(o);                                    // ground point → world canvas px
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const scaleA = (key, o, k) => { const [gx, gy] = at(o); for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; } };

// ---------------------------------------------------------------- 世界物件
// 大道（原生 SVG 石板），排在最底层
{ const R = L.ROAD, h = R.w / 2, pts = [Wp(R.a.u, R.a.v - h), Wp(R.b.u, R.b.v - h), Wp(R.b.u, R.b.v + h), Wp(R.a.u, R.a.v + h)];
  add({ u: R.a.u, v: R.a.v }, `<polygon points="${pts.map((q) => q.join(",")).join(" ")}" fill="#d9d4ca" stroke="#c9c2b5" stroke-width="3"/>`, -1e6); }
// 关卡 B C D + 关名牌
const GN = [null, ["B", "Solana · 查护照"], ["C", "Move · 防伪芯片"], ["D", "Bitcoin · 只查封条"]];
for (const i of [1, 2, 3]) {
  put(`gt${i}`, L.GATES[i], O.checkpoint(L.GATES[i], { id: `gt${i}`, n: GN[i][0] }));
  put(`sg${i}`, L.SIGNS[i], E1.signBoard(L.SIGNS[i], { id: `sg${i}`, style: "plate", text: GN[i][1], size: 34 }));
}
// B后（起始画面：Drift 角 + 账户链边缘）
L.CHAIN_P.forEach((q, i) => put(`cp${i}`, q, X.passport(q, { id: `cp${i}` })));
put("root", L.ROOT, E2.addrPlate(L.ROOT, { id: "root", text: "可信根" }));
put("ash", L.ANCHOR_SHIELD, O.shield(L.ANCHOR_SHIELD, { id: "ash" }));
put("dm", L.DMETER, E5.thresholdMeter(L.DMETER, { id: "dm", max: 5, th: 2, level: 2, thText: "5 人 2 签" }), 0, { wrap: wrapK(L.DMETER, 0.7) });
scaleA("dm", L.DMETER, 0.7);
L.SIGS.forEach((q, i) => put(`sp${i}`, q, E2.sigPaper(q, { id: `sp${i}`, title: "审批" })));
put("dgl", L.DGLASS, O.hourglass(L.DGLASS, { id: "dgl" }));
put("dlk", L.DLOCK, E1.timeLock(L.DLOCK, { id: "dlk", frac: 1 }));

// C 关：资源包裹 + 芯片贴 + 复制框 + 丢弃箭头
put("pc", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "pc", scale: 0.8 }));
{ const [cx, cy] = Wp(L.PARCEL_C.u, L.PARCEL_C.v, 36);
  add(L.PARCEL_C, `<path d="M${cx - 11} ${cy}L${cx} ${cy - 6}L${cx + 11} ${cy}L${cx} ${cy + 6}Z" fill="#2aa3c9" stroke="#1d93ba" stroke-width="1.5"/><path d="M${cx - 4} ${cy}H${cx + 4}" stroke="#ffffff" stroke-width="1.5"/>`, 1); }
{ const r = L.rect(L.DUP_C, "dup");
  add(L.DUP_C, S.hid("dup", `<rect x="${r[0]}" y="${r[1]}" width="${r[2] - r[0]}" height="${r[3] - r[1]}" rx="4" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="7 5"/>
    <path d="M${r[0] + 12} ${r[1] + 12}L${r[2] - 12} ${r[3] - 12}M${r[2] - 12} ${r[1] + 12}L${r[0] + 12} ${r[3] - 12}" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/>`), 5);
  const [px, py] = P(L.PARCEL_C);
  add(L.PARCEL_C, S.hid("drop", `<path d="M${px - 40} ${py + 6}L${px - 92} ${py + 24}" stroke="#6b665c" stroke-width="4" stroke-dasharray="8 5"/><path d="M${px - 92} ${py + 24}l12 -12m-12 12l16 4" stroke="#6b665c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M${px - 70} ${py + 0}L${px - 60} ${py + 32}" stroke="#e0453a" stroke-width="8" stroke-linecap="round"/>`), 6); }
// C 岗亭放大镜（字节码验证器）+ 镜片上的小流程图
put("mg", L.VERIF, O.magnifier(L.VERIF, { id: "mg" }), 400);
{ const [lx, ly] = A.mg.lens, bx = (x, y) => `<rect x="${lx + x - 13}" y="${ly + y - 8}" width="26" height="16" rx="3" fill="#ffffff" stroke="#1c1c1c" stroke-width="2"/>`;
  add(L.VERIF, S.hid("flow", bx(-22, -24) + bx(22, -24) + bx(0, 24) +
    `<path d="M${lx - 9} ${ly - 24}H${lx + 9}M${lx - 18} ${ly - 16}L${lx - 6} ${ly + 16}" stroke="#1c1c1c" stroke-width="2.5"/>
     <g id="fe-r"><path d="M${lx + 18} ${ly - 16}L${lx + 6} ${ly + 16}" stroke="#e0453a" stroke-width="3" stroke-dasharray="4 3"/></g>
     <g id="fe-g" opacity="0"><path d="M${lx + 18} ${ly - 16}L${lx + 6} ${ly + 16}" stroke="#1f9d55" stroke-width="3.5"/></g>`), 401); }
// Cetus 角
put("pool", L.POOL, E8.ammPool(L.POOL, { id: "pool", scale: 0.7 }));
put("man", L.MANUAL, E3.manual(L.MANUAL, { id: "man", title: "开源数学库", sub: "", open: 0 }));
{ const r = L.rect(L.MANUAL, "manual"), box = (id, pad, st, dash) => S.hid(id, `<rect x="${r[0] - pad}" y="${r[1] - pad}" width="${r[2] - r[0] + 2 * pad}" height="${r[3] - r[1] + 2 * pad}" rx="10" fill="none" stroke="${st}" stroke-width="4" stroke-dasharray="${dash}"/>`);
  add(L.MANUAL, box("mfr", 8, "#e0453a", "10 6") + box("mscope", 30, "#2aa3c9", "12 7"), 300); }
const BU = L.BYTE, cell = 20, mv = (gid) => (svg) => `<g id="${gid}">${svg}</g>`;
put("bh", BU, E3.byteBlock(BU, { id: "bh", bytes: 3, cell, h: 26, depth: 30 }), 0, { wrap: mv("bhm"), grow: true });
put("bl", S.rel(BU, 60, 0), E3.byteBlock(S.rel(BU, 60, 0), { id: "bl", bytes: 5, cell, h: 26, depth: 30 }), 0, { wrap: mv("blm"), grow: true });
put("bz", S.rel(BU, 100, 0), E3.byteBlock(S.rel(BU, 100, 0), { id: "bz", bytes: 3, cell, h: 26, depth: 30, color: "gray" }), 1, { wrap: (s) => S.hid("bzw", s) });
const RVO = S.rel(BU, 40, -120);
put("rv", RVO, E3.byteBlock(RVO, { id: "rv", bytes: 2, cell, h: 26, depth: 30, color: "red" }), 0, { wrap: (s) => `<g id="rvm" opacity="0">${s}</g>` });
const SHIFT = (() => { const a = Wp(BU.u, BU.v), b = Wp(BU.u - 60, BU.v); return [b[0] - a[0], b[1] - a[1]]; })();
const RVD = (() => { const a = Wp(RVO.u, RVO.v), b = Wp(BU.u + 40, BU.v + 70); return [b[0] - a[0], b[1] - a[1]]; })();
put("disp", L.DISP, E6.shareDispenser(L.DISP, { id: "disp", scale: 0.7, tickets: 6, digits: 5, value: 0 }));
put("crt", L.CERT, E6.shareCert(L.CERT, { id: "crt", n: 14 }), 0, { grow: true });
put("atk", L.ATK_C, O.person(L.ATK_C, { id: "atk", role: "attacker", scale: 0.7 }), 0, { grow: true });
{ const p = off(A.atk.center, -26, -6); add(L.ATK_C, S.hid("coin", `<g id="coinm"><ellipse cx="${p[0]}" cy="${p[1]}" rx="11" ry="7" fill="#e3b341" stroke="#a87d14" stroke-width="2"/></g>`), 2); }
const COIN = (() => { const a = off(A.atk.center, -26, -6), b = A.disp.coin; return [b[0] - a[0], b[1] - a[1]]; })();
{ const [gx, gy] = P(L.ICE_DOTS), d = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) d.push(`<circle cx="${gx - 56 + c * 14 + (r % 2) * 7}" cy="${gy - 18 + r * 11}" r="5" fill="#e3b341" stroke="#a87d14" stroke-width="1"/>`);
  add(L.ICE_DOTS, S.hid("icd", d.join(""))); }
put("ice", L.ICE, E5.iceShell(L.ICE, { id: "ice", w: 160, d: 110, h: 80, on: false }));
// C后 升级与部署
put("kc", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kc", scale: 0.7, role: "upgrader" }));
put("core", L.CORE, E10.coreModule(L.CORE, { id: "core", ver: "V2" }));
put("ukey", L.UKEY, O.key(L.UKEY, { id: "ukey", state: "attacker" }), 0, { grow: true });
put("ulk", L.ULOCK, E1.timeLock(L.ULOCK, { id: "ulk", frac: 1 }), 0, { grow: true });
put("ums", L.UMSIG, E5.thresholdMeter(L.UMSIG, { id: "ums", max: 3, th: 2, level: 2, thText: "多签" }), 0, { grow: true });
const COREOFF = Wp(L.CORE.u + 200, L.CORE.v);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pc", up(A.pc.top, 4), "资源", "lab-cs lab-sm");
lb("lb-dup", off(L.rect(L.DUP_C, "dup").slice(2, 4), 10, -20), "复制", "lab-r lab-sm", "l");
lb("lb-drop", off(P(L.PARCEL_C), -100, 40), "丢弃", "lab-r lab-sm", "r");
const SG = P(L.SIGNS[2]);
["数学", "权限", "升级"].forEach((s, i) => lb(`lb-q${i}`, off(SG, -175 + i * 165, 30), `${s} ?`, "lab-g", "t"));
lb("lb-pool", up(A.pool.top, 6), "池子", "lab-cs lab-sm");
lb("lb-man", off(A.man.top, 0, -16), "开源数学库", "lab-r lab-sm");
lb("lb-man2", off(A.man.top, 0, -14), "开源数学库", "lab-cs lab-sm");
lb("lb-scope", off(L.rect(L.MANUAL, "manual").slice(0, 2), -30, -40), "审计范围", "lab-cs lab-sm", "b");
lb("lb-sh", off(A.bl.top, -20, 0), "位移 &lt;&lt; 64", "lab-ink lab-sm");
lb("lb-pass", off(A.bl.right, 30, 70), "被放行", "lab-rs lab-sm", "l");
lb("lb-cut", off(A.bh.left, -30, 70), "截断", "lab-g", "r");
lb("lb-run", up(A.pool.top, 8), "照常执行", "lab-gs lab-sm");
lb("lb-disp", off(A.disp.top, 0, -4), "流动性份额", "lab-cs lab-sm");
lb("lb-crt", off(A.crt.top, 30, 10), "巨量份额", "lab-rs lab-sm", "l");
lb("lb-atk", up(A.atk.top, 4), "攻击者", "lab-rs lab-sm");
lb("lb-coin", off(A.atk.center, -60, 40), "约 1 个代币", "lab-r lab-sm", "r");
lb("lb-ice", up(A.ice.top, 10), "冻结 约 1.62 亿美元", "lab-cs lab-sm");
lb("lb-gov", off(A.ice.front, 0, 40), "治理投票 → 共管多签 → 赔付", "lab-ink lab-sm", "t");
lb("lb-mg", off(A.mg.lens, -110, -70), "字节码验证器", "lab-cs", "r");
lb("lb-flow", off(A.mg.lens, 80, -10), "两道检查被绕过", "lab-r", "l");
lb("lb-fix", off(A.mg.lens, 80, 30), "已修复 · 无损失", "lab-gs", "l");
lb("lb-kc", up(A.kc.top, 6), "审计版本", "lab-cs lab-sm");
lb("lb-core2", up(A.core.top, 34), "未审计版本", "lab-r lab-sm");
lb("lb-in", off(A.core.gears, 70, 0), "内部", "lab-ink lab-sm", "l");
lb("lb-pub", off(A.core.gears, 70, 2), "公开", "lab-rs lab-sm", "l");
lb("lb-key", off(A.ukey.top, 20, -6), "单签升级", "lab-rs lab-sm");
lb("lb-ulk", up(A.ulk.top, 6), "时间锁", "lab-cs lab-sm");
lb("lb-ums", up(A.ums.top, 6), "多签", "lab-cs lab-sm");
lb("lb-eq", [(A.kc.center[0] + A.core.center[0]) / 2, (A.kc.center[1] + A.core.center[1]) / 2], "＝", "lab-gs", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 1250, y: 560, w: 600 };
const html = codeCard("cb", { ...CB, head: "位移溢出检查", tag: "数学库", mono: true, rows: [
  { html: "// 先判断 n &lt;&lt; 64 会不会溢出" },
  { html: "if (n &gt; LIMIT) abort", chip: "写错", chipCls: "x" },
  { html: "let liq = n &lt;&lt; 64", chip: "截断", chipCls: "x" },
  { html: "显式检查位移和乘法", chip: "修复", chipCls: "ok" },
] }) +
  kw("kw-q", `位移溢出 → <b>中止？</b>`, { x: 60, y: 780, size: 40, accent: "#e0453a" }) +
  evt("ev-c", `Cetus · Sui · 2025 年 5 月 22 日<span id="ev-c-amt" style="opacity:0"><br>损失 约 2.23 亿美元</span>`, { color: "#e0453a" }) +
  evt("src-c", `来源 · Dedaub 分析 · Cyfrin 分析<br>The Block 报道`, { color: "#6b665c", top: 250 }) +
  evt("src-z", `来源 · Zellic`, { color: "#6b665c", top: 126 }) +
  evt("ev-n", `Nemo · Sui · 2025 年 9 月<span id="ev-n-amt" style="opacity:0"><br>损失 约 240 万到约 260 万美元</span>`, { color: "#e0453a", top: 132 }) +
  evt("src-n", `来源 · The Block 报道<br>Cointelegraph 报道`, { color: "#6b665c", top: 262 });
S.curve("cv1", [CB.x - 4, codeRowY(CB.y, 1)], S.scr("cetusC", off(A.man.center, 40, 0)), { color: "#e0453a" });
S.curve("cv2", [CB.x - 4, codeRowY(CB.y, 2)], S.scr("cetusC", off(A.bh.left, -6, 0)), { color: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  copy: w("复制", 0), drop: w("丢掉", 0),
  math: w("数学", 1), perm: w("权限", 1), upg: w("升级", 1),
  lib: w("开源数学库", 3), shl: w("左移", 4), judge: w("判断", 4),
  limit: w("常量", 5), pass: w("放了过去", 5),
  cut: w("截断", 7), run: w("照常执行", 7),
  dep: w("存入", 8), share: w("流动性份额", 8), amt: w("2.23", 8),
  frz: w("冻结", 9), gov: w("治理投票", 9),
  scope: w("审计范围", 10), chk: w("显式检查", 10),
  zel: w("Zellic", 12), edge: w("控制流边", 12), byp: w("绕过", 12), fix: w("已修复", 13),
  nemo: w("Nemo", 15), unaud: w("未审计", 15), pub: w("公开", 16), single: w("单签", 16), loss: w("240", 16),
  msig: w("多签", 17), lock: w("时间锁", 17), eq: w("等于", 17),
};
const t = (x) => f(x);
// 画布：B后（driftB）→ C → C后，外加 D 关边缘
const BOX = [0, -2900, 6600, 2700];
const GRID = (() => { const cs = [[BOX[0], BOX[1]], [BOX[0] + BOX[2], BOX[1]], [BOX[0], BOX[1] + BOX[3]], [BOX[0] + BOX[2], BOX[1] + BOX[3]]].map(([x, y]) => G(x, y));
  return { u0: Math.min(...cs.map((q) => q.u)), u1: Math.max(...cs.map((q) => q.u)), v0: Math.min(...cs.map((q) => q.v)), v1: Math.max(...cs.map((q) => q.v)) }; })();

S.build({
  cam0: "driftB", sub: "芯片防伪，不防算错",
  grid: GRID, box: BOX,
  shown: [], css, html,
  terms: [
    { id: "t0", t: "截断", d: "超出位数的高位被直接丢掉", at: w("截断", 7) },
    { id: "t1", t: "字节码验证器", d: "部署前检查 Move 字节码安全性的组件", at: w("字节码验证器", 12) },
    { id: "t2", t: "单签", d: "一把私钥就能执行的权限", at: w("单签", 16) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      // ===== L0 不能复制、不能丢弃：横移到 C 关
      cam(${t(LS[0] + 0.1)}, "moveC", 2.4); pop("#lb-pc", ${t(Math.max(LS[0] + 2.4, TM.copy - 0.5))});
      fadeIn("#dup", ${t(TM.copy)}, 0.3); pop("#lb-dup", ${t(TM.copy + 0.2)}); fadeIn("#drop", ${t(TM.drop)}, 0.3); pop("#lb-drop", ${t(TM.drop + 0.2)});
      // ===== L1 三块问号牌
      pop("#lb-q0", ${t(TM.math)}); pop("#lb-q1", ${t(TM.perm)}); pop("#lb-q2", ${t(TM.upg)});
      // ===== L2 Cetus 角 + 事件卡
      out("#lb-pc, #lb-dup, #lb-drop, #lb-q0, #lb-q1, #lb-q2", ${t(LS[2] - 0.2)});
      cam(${t(LS[2])}, "cetusC", 1.5); pop("#ev-c", ${t(LS[2] + 0.8)}); pop("#lb-pool", ${t(LS[2] + 1.6)});
      // ===== L3 来源卡 + 数学库红框
      pop("#src-c", ${t(LS[3] + 0.3)}); fadeIn("#mfr", ${t(TM.lib)}, 0.3); pop("#lb-man", ${t(TM.lib + 0.2)});
      // ===== L4 位移格 + 代码卡第 1、2 行
      grow("bh", ${t(TM.shl - 0.3)}); grow("bl", ${t(TM.shl - 0.2)}); pop("#lb-sh", ${t(TM.shl + 0.3)});
      pop("#cb", ${t(LS[4] + 0.2)}); hot("#cb-r0", ${t(TM.shl)}); hot("#cb-r1", ${t(TM.judge)});
      // ===== L5 LIMIT 写错 → 红线到数学库；红数块被放行
      hot("#cb-r1", ${t(TM.limit)}, "#fde6e3"); pop("#cb-c1", ${t(TM.limit)}); draw("cv1", ${t(TM.limit + 0.2)});
      fadeIn("#rvm", ${t(TM.pass - 0.9)}, 0.3); tl.to("#rvm", { x: ${t(RVD[0])}, y: ${t(RVD[1])}, duration: 0.9, ease: "power1.inOut" }, ${t(TM.pass - 0.5)});
      pop("#lb-pass", ${t(TM.pass + 0.4)});
      // ===== L6 题卡
      out("#rvm, #lb-pass, #cv1", ${t(LS[6] - 0.1)}); pop("#kw-q", ${t(LS[6] + 0.2)});
      // ===== L7 截断，照常执行（关键画面）
      out("#kw-q, #lb-sh", ${t(TM.cut - 0.3)});
      tl.to(["#bhm", "#blm"], { x: ${t(SHIFT[0])}, y: ${t(SHIFT[1])}, duration: 0.6, ease: "power2.inOut" }, ${t(TM.cut)});
      tl.to("#bhm", { y: ${t(SHIFT[1] + 90)}, opacity: 0, duration: 0.6, ease: "power2.in" }, ${t(TM.cut + 0.65)});
      fadeIn("#bzw", ${t(TM.cut + 0.8)}, 0.3); hot("#cb-r2", ${t(TM.cut)}, "#fde6e3"); pop("#cb-c2", ${t(TM.cut + 0.2)}); draw("cv2", ${t(TM.cut + 0.1)});
      pop("#lb-cut", ${t(TM.cut + 0.9)}); out("#lb-pool", ${t(TM.run - 0.2)}, 0.15); pop("#lb-run", ${t(TM.run)});
      // ===== L8 约 1 个代币 → 巨量份额（关键画面）
      out("#cb, #cv2, #lb-cut, #lb-run, #lb-man, #mfr", ${t(LS[8] - 0.2)});
      grow("atk", ${t(LS[8] + 0.1)}); pop("#lb-atk", ${t(LS[8] + 0.5)});
      fadeIn("#coin", ${t(TM.dep)}, 0.2); pop("#lb-coin", ${t(TM.dep + 0.1)}); tl.to("#coinm", { x: ${t(COIN[0])}, y: ${t(COIN[1])}, duration: 0.7, ease: "power1.in" }, ${t(TM.dep + 0.5)});
      out("#coin, #lb-coin", ${t(TM.dep + 1.3)});
      pop("#lb-disp", ${t(TM.share - 0.3)}); X6.tally(tl, "disp", ${t(TM.share)}, 1.6, 0, 99999);
      [0, 1, 2, 3, 4, 5].forEach((i) => X6.issue(tl, "disp", ${t(TM.share + 0.1)} + i * 0.22, i));
      grow("crt", ${t(TM.share + 1.0)}); pop("#lb-crt", ${t(TM.share + 1.5)});
      X8.poolLevel(tl, "pool", ${t(TM.share + 1.2)}, 0.06, 0.06, 1.4); fadeIn("#ev-c-amt", ${t(TM.amt)}, 0.3);
      // ===== L9 冻结 + 共管多签
      out("#lb-atk, #lb-crt, #lb-disp, #ev-c, #src-c", ${t(LS[9] - 0.2)});
      fadeIn("#icd", ${t(LS[9] + 0.3)}, 0.4); bump("#lb-pool", ${t(TM.frz - 0.6)}); X5.freeze(tl, "ice", ${t(TM.frz)}, 1.0, "up"); pop("#lb-ice", ${t(TM.frz + 0.8)}); pop("#lb-gov", ${t(TM.gov)});
      // ===== L10 审计范围 + 显式检查
      out("#lb-gov", ${t(LS[10] - 0.2)}); tl.set("#cb-r3", { opacity: 0 }, 0);
      fadeIn("#mscope", ${t(TM.scope)}, 0.4); pop("#lb-man2", ${t(TM.scope + 0.1)}); pop("#lb-scope", ${t(TM.scope + 0.3)});
      pop("#cb", ${t(TM.chk - 0.5)}); fadeIn("#cb-r3", ${t(TM.chk - 0.3)}, 0.3); pop("#cb-c3", ${t(TM.chk)});
      // ===== L11 C 岗亭近景：字节码验证器
      out("#lb-scope, #mscope, #lb-man2, #lb-ice", ${t(LS[11] - 0.2)}); out("#cb", ${t(LS[11] + 0.6)});
      cam(${t(LS[11])}, "verifC", 1.5); pop("#lb-mg", ${t(LS[11] + 1.3)});
      // ===== L12 Zellic：漏掉控制流边
      pop("#src-z", ${t(TM.zel)}); fadeIn("#flow", ${t(TM.edge - 0.5)}, 0.3); flash("#fe-r", ${t(TM.edge)}, 3); pop("#lb-flow", ${t(TM.byp)});
      // ===== L13 已修复
      out("#lb-flow, #fe-r", ${t(TM.fix - 0.2)}); fadeIn("#fe-g", ${t(TM.fix)}, 0.3); pop("#lb-fix", ${t(TM.fix + 0.2)});
      // ===== L14 C后 升级与部署
      out("#lb-fix, #lb-mg, #src-z, #flow", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "upgC", 1.6);
      // ===== L15 Nemo：未审计版本被推进位置
      X10.push(tl, "core", 0.05, [${t(COREOFF[0])}, ${t(COREOFF[1])}], 0.01);
      pop("#ev-n", ${t(TM.nemo)}); pop("#lb-kc", ${t(LS[15] + 0.6)});
      X10.push(tl, "core", ${t(TM.unaud - 0.6)}, null, 1.2); X10.skin(tl, "core", ${t(TM.unaud + 0.7)}, "red"); X10.plate(tl, "core", ${t(TM.unaud + 0.7)}, "未审计", "red");
      pop("#lb-core2", ${t(TM.unaud + 0.8)}); pop("#src-n", ${t(TM.unaud + 1.4)});
      // ===== L16 内部 → 公开；单签钥匙；损失
      pop("#lb-in", ${t(LS[16] + 0.4)}); bump("#lb-core2", ${t(LS[16] + 2.2)}); out("#lb-in", ${t(TM.pub - 0.15)}, 0.15); pop("#lb-pub", ${t(TM.pub)});
      grow("ukey", ${t(TM.single - 0.3)}); pop("#lb-key", ${t(TM.single + 0.3)}); fadeIn("#ev-n-amt", ${t(TM.loss)}, 0.3);
      // ===== L17 多签 + 时间锁 + 部署 = 审计（段尾静止）
      out("#src-n", ${t(LS[17] - 0.2)});
      grow("ums", ${t(TM.msig - 0.3)}); pop("#lb-ums", ${t(TM.msig + 0.3)}); KIT.broke(tl, "ukey", ${t(TM.msig + 0.4)}, { badge: false, ghost: 0.35 }); out("#lb-key", ${t(TM.msig + 0.4)});
      grow("ulk", ${t(TM.lock - 0.3)}); pop("#lb-ulk", ${t(TM.lock + 0.3)});
      out("#lb-core2, #lb-pub", ${t(TM.eq - 0.2)}); X10.skin(tl, "core", ${t(TM.eq)}, "blue"); X10.plate(tl, "core", ${t(TM.eq)}, "审计版", "normal"); pop("#lb-eq", ${t(TM.eq + 0.1)});
`,
});
