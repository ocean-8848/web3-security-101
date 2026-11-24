// ep14/seg5「⑤ 证明与结算」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：证明流水线 A → F（seg1 终点 L11、seg2 起点 L0–L1、L8、L16–L17；seg6 L0、L9–L11）
//   ruleA        A 出题台：规则文件 + 出题人 + 答题卡 + 阅卷机（seg2 L2–L3、L18 终点；seg3 起点 L0–L2、L9–L10、L17–L20 防御；seg4 起点；seg6 L1）
//   sheetA       近景：答题卡 + 阅卷机 + 规则文件 + 两个小人（seg2 L9–L15 阅卷机比喻；seg3 L3、L8）
//   bitsA        近景：5 个二进制位 + 答题卡 + 阅卷机（seg3 L4–L8 玩具例子，留左侧给代码卡 B）
//   tornA        A后 Tornado 角（seg3 L11–L16）
//   setupB       B 设置仪式：三人 + 拼图 + 种子罐 + 销毁箱 + 两把钥匙（seg2 L6；seg4 L1–L4）
//   zcashB       近景：B 的 Zcash 角（seg4 L5–L7）
//   proverC      C 证明器 + zkVM + 查找表（seg2 L4；seg4 L8–L9）
//   committeeC   近景：C 的 ZKsync 角：安全委员会 + 证明生产闸刀 + 证明器出口（seg4 L10–L11）
//   verifD       D 验证器 + L1 链 + 进料证明卡（seg1 L9；seg2 L5、L17；seg4 L12–L13、L15、L18–L19 终点；seg5 起点；seg6 L7）
//   clockD       近景：D 钟面 + 登记簿 + 验证器（seg4 L14–L17）
//   aztecE       E 近景：Aztec Connect 保险柜 + 一排证明卡 + 结算机 + 攻击者 + 点阵（seg1 起点 L0–L7；seg5 L0–L1；seg6 L6）
//   settleE      E 近景：结算机 + 32 格板 + 笔数字段（seg1 L8；seg2 L7；seg5 L2–L9；seg6 L2、L8）
//   l2F          F 观察台全景（seg5 L10–L15；seg6 起点、L3–L5）
//   stageF       近景：F Stage 台阶 + 安全委员会 + 时间锁（seg5 L16–L17 终点）
//   DE           中景：D + E（seg1 L9 从 E 往左带到 D、seg5 L0 从 D 横移到 E 的中途）
//   EF           中景：E + F + D 的 L1 链（seg5 L10 拉高看到 F 与 L1 的连线）
// ends static on CAMS.l2F
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { G, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内专用镜头：Stage 台阶偏右，左侧留给 Stages 清单卡
const stageL = L.fit([L.rect(L.STAIRS, "stairs"), ...L.STAGES.map((q) => L.rect(q, "plateS")), L.rect(L.METER_F, "thresholdMeter"), L.rect(L.TLOCK_F, "timeLock")], [820, 300, 1820, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, stageL }, ext: [E1, E2, E3, E5, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 原生 SVG 助手
const pt = (p) => `${f(p[0])},${f(p[1])}`;
const poly = (ps, fill, st = "none", sw = 0, extra = "") => `<polygon points="${ps.map(pt).join(" ")}" fill="${fill}" stroke="${st}" stroke-width="${sw}" ${extra}/>`;
const slab = (u0, u1, v0, v1, z0, z1, c) =>
  poly([Wp(u0, v1, z0), Wp(u1, v1, z0), Wp(u1, v1, z1), Wp(u0, v1, z1)], c.f, c.st, 1.5) +
  poly([Wp(u0, v0, z0), Wp(u0, v1, z0), Wp(u0, v1, z1), Wp(u0, v0, z1)], c.s, c.st, 1.5) +
  poly([Wp(u0, v0, z1), Wp(u1, v0, z1), Wp(u1, v1, z1), Wp(u0, v1, z1)], c.t, c.st, 1.5);
const STONE = { t: "#dcd6ca", f: "#c4bdb0", s: "#cfc8bb", st: "#a9a194" };
// 不支持 scale 的物件：绕地面点包一层并换算 anchors
const wrapK = (key, o, r, k) => {
  const [gx, gy] = at(o);
  put(key, o, r, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n in A[key]) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
// E 区局部屏幕偏移 → 世界点（同 layout 的 zone 写法）
const E0 = Wp(L.SETTLE.u, L.SETTLE.v);
const eP = (dx, dy) => { const q = G(E0[0] + dx, E0[1] + dy); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ---------------------------------------------------------------- 地面：传送路、分界线、L2 观察台
add({ u: 4500, v: -3000 }, slab(2900, 6100, -70, 70, -6, 0, STONE), -4000);
add({ u: 3250, v: -3000 }, `<line x1="${f(Wp(3250, -420)[0])}" y1="${f(Wp(3250, -420)[1])}" x2="${f(Wp(3250, 420)[0])}" y2="${f(Wp(3250, 420)[1])}" stroke="#2aa3c9" stroke-width="4"/>`, -3900);
add({ u: 7000, v: -3000 }, slab(L.PLATFORM.u - 800, L.PLATFORM.u + 1400, L.PLATFORM.v - 560, L.PLATFORM.v + 620, -34, 0, { t: "#e6e0d4", f: "#c9c1b2", s: "#d6cfc1", st: "#a9a194" }), -4000);

// ---------------------------------------------------------------- D 区（段首镜头，静态）
put("plD", L.PLATE_D, E1.signBoard(L.PLATE_D, { id: "plD", style: "plate", text: "验证器 · 链上", size: 30 }));
put("vf", L.VERIFIER, X.gradingMachine(L.VERIFIER, { id: "vf", title: "验证器", scale: 1.2 }));
put("l1", L.L1CHAIN, O.chain(L.L1CHAIN, { id: "l1", n: 4, title: "L1" }));
put("inc", L.INCARD, E2.proofCard(L.INCARD, { id: "inc" }));
wrapK("clkD", L.CLOCK_D, O.clock(L.CLOCK_D, { id: "clkD" }), 1.3);
put("ldg", L.LEDGER, E7.dispatchDesk(L.LEDGER, { id: "ldg", scale: 0.8, entries: ["x ✓", "x + r ✓"], shown: 2 }));
put("dvs", L.DIVSIGN, E1.signBoard(L.DIVSIGN, { id: "dvs", style: "plate", text: "链下 | 链上", size: 22 }));

// ---------------------------------------------------------------- E 区
put("plE", L.PLATE_E, E1.signBoard(L.PLATE_E, { id: "plE", style: "plate", text: "结算 · 业务合约", size: 30 }));
put("dep", L.DEPREC, E1.signBoard(L.DEPREC, { id: "dep", style: "plate", text: "已弃用", size: 30, color: "#8a8478" }));
put("stl", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "stl", name: "结算", tone: "light" }));
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault" }));
L.ECARDS.slice(0, 3).forEach((q, i) => put("pc" + i, q, E2.proofCard(q, { id: "pc" + i })));
put("ctr", L.COUNTER, E2.rollCounter(L.COUNTER, { id: "ctr", digits: 2, value: 32 }));
put("akey", L.ADMINKEY, O.key(L.ADMINKEY, { id: "akey", state: "broken" }), 0, { grow: true });
put("bcn", L.BEACON_E, O.beacon(L.BEACON_E, { id: "bcn" }), 0, { grow: true });
put("bty", L.BOUNTY, O.doc(L.BOUNTY, { id: "bty", standing: true, title: "赏金范围", lines: ["监控告警", "漏洞赏金"] }), 0, { grow: true });
const ATK0 = eP(360, 150), ATK0_FROM = [L.ATTACKERS[0], ATK0].map((q) => Wp(q.u, q.v));
put("atk0", ATK0, O.person(ATK0, { id: "atk0", role: "attacker", scale: 0.7 }), 0, { wrap: (svg) => `<g id="atk0W" opacity="0">${svg}</g>` });
put("atk1", L.ATTACKERS[1], O.person(L.ATTACKERS[1], { id: "atk1", role: "attacker", scale: 0.7 }), 0, { grow: true });
// 32 格板（4 × 8，地面原生 SVG）：底板常显，绿格 L2 亮起；第 1 格以外 L5 变灰
{
  const g = L.GRID32, c = 28; let base = slab(g.u - 118, g.u + 118, g.v - 62, g.v + 62, 0, 4, { t: "#f6f2ea", f: "#cfc8bb", s: "#ddd6c9", st: "#a9a194" }), cells = "";
  for (let i = 0; i < 32; i++) {
    const u0 = g.u - 112 + (i % 8) * c, v0 = g.v - 56 + Math.floor(i / 8) * c;
    base += poly([Wp(u0 + 3, v0 + 3, 4), Wp(u0 + c - 3, v0 + 3, 4), Wp(u0 + c - 3, v0 + c - 3, 4), Wp(u0 + 3, v0 + c - 3, 4)], "none", "#b9b1a3", 1);
    cells += poly([Wp(u0 + 3, v0 + 3, 4), Wp(u0 + c - 3, v0 + 3, 4), Wp(u0 + c - 3, v0 + c - 3, 4), Wp(u0 + 3, v0 + c - 3, 4)], "#1f9d55", "#16733e", 1, `id="g32-${i}" class="g32c${i ? " g32o" : ""}" opacity="0"`);
  }
  add(g, base + cells, -600);
}
// 证明卡 ↔ 计数器：没绑定（红虚线断口 + 红叉）/ 已绑定（绿实线）
const PCC = A.pc0.center, CTC = A.ctr.center, MID = lerp(PCC, CTC, 0.5);
{
  const a = lerp(PCC, CTC, 0.42), b = lerp(PCC, CTC, 0.58), x = 13;
  add(L.COUNTER, S.hid("unb", `<line x1="${f(PCC[0])}" y1="${f(PCC[1])}" x2="${f(a[0])}" y2="${f(a[1])}" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 9"/>
    <line x1="${f(b[0])}" y1="${f(b[1])}" x2="${f(CTC[0])}" y2="${f(CTC[1])}" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 9"/>
    <path d="M${f(MID[0] - x)} ${f(MID[1] - x)}L${f(MID[0] + x)} ${f(MID[1] + x)}M${f(MID[0] + x)} ${f(MID[1] - x)}L${f(MID[0] - x)} ${f(MID[1] + x)}" stroke="#e0453a" stroke-width="6" stroke-linecap="round"/>`), 3000);
  add(L.COUNTER, S.hid("bok", `<line x1="${f(PCC[0])}" y1="${f(PCC[1])}" x2="${f(CTC[0])}" y2="${f(CTC[1])}" stroke="#1f9d55" stroke-width="6" stroke-linecap="round"/>`), 3001);
}
// 红点阵（每点 = 约 2 万美元）：110 + 4
const [DX, DY] = at(L.DOTS_E), DB_MOVE = [150, -80];
{
  let a = "", b = "";
  for (let r = 0; r < 10; r++) for (let c = 0; c < 11; c++) a += `<circle cx="${DX + 10 + c * 11}" cy="${DY + r * 11}" r="4" fill="#e0453a"/>`;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) b += `<circle cx="${DX + 140 + c * 11}" cy="${DY + 40 + r * 11}" r="4" fill="#e0453a"/>`;
  add(L.DOTS_E, S.hid("dA", a) + S.hid("dB", b), 2000);
}

// ---------------------------------------------------------------- F 区（L2 观察台）
put("plF", L.PLATE_F, E1.signBoard(L.PLATE_F, { id: "plF", style: "plate", text: "L2", size: 30 }));
wrapK("l2c", L.L2CHAIN, O.chain(L.L2CHAIN, { id: "l2c", n: 3, title: "L2" }), 0.8);
add(L.L2CHAIN, S.hid("l2link", `<line x1="${f(A.l2c.center[0])}" y1="${f(A.l2c.center[1])}" x2="${f(A.l1.center[0])}" y2="${f(A.l1.center[1])}" stroke="#2aa3c9" stroke-width="7" stroke-dasharray="20 14" stroke-linecap="round"/>`), 9000);
put("chl", L.CHALLENGER, O.person(L.CHALLENGER, { id: "chl", role: "engineer", scale: 0.7 }), 0, { grow: true });
put("magF", L.MAG_F, O.magnifier(L.MAG_F, { id: "magF" }), 0, { grow: true });
put("hgD", L.HOUR_DAYS, O.hourglass(L.HOUR_DAYS, { id: "hgD" }), 0, { grow: true });
put("vpf", L.VPROOF, E2.proofCard(L.VPROOF, { id: "vpf" }), 0, { grow: true });
put("hgH", L.HOUR_HRS, O.hourglass(L.HOUR_HRS, { id: "hgH" }), 0, { grow: true });
put("mode", L.MODE, O.knifeSwitch(L.MODE, { id: "mode", text: "证明模式" }));
put("rclk", L.RCLOCK, O.clock(L.RCLOCK, { id: "rclk" }));
// Stage 台阶：三级，越往右上越高；牌子立在台阶顶上
const STEP_H = [26, 52, 78];
L.STAGES.forEach((q, i) => {
  add(q, slab(q.u - 115, q.u + 115, q.v - 125, q.v + 125, 0, STEP_H[i], { t: "#e9e3d7", f: "#c4bdb0", s: "#d3ccbf", st: "#9f978a" }), -40);
  const lift = STEP_H[i] * CE;
  put("stg" + i, q, E1.signBoard(q, { id: "stg" + i, style: "plate", text: "Stage " + i, size: 22 }), 1, { grow: true, wrap: (svg) => `<g transform="translate(0,${f(-lift)})">${svg}</g>` });
  for (const n in A["stg" + i]) { const p = A["stg" + i][n]; if (Array.isArray(p) && typeof p[0] === "number") A["stg" + i][n] = [p[0], p[1] - lift]; }
});
wrapK("mtr", L.METER_F, E5.thresholdMeter(L.METER_F, { id: "mtr", max: 3, th: 2, level: 2, thText: "安全委员会" }), 0.7);
put("tlk", L.TLOCK_F, E1.timeLock(L.TLOCK_F, { id: "tlk", frac: 0.6 }));

// ---------------------------------------------------------------- 世界标签
lb("lb-az", up(A.vault.top, 10), "Aztec Connect", "lab-ink");
lb("lb-money", A.vault.ground, "合约里仍有资金", "lab-cs lab-sm", "t");
lb("lb-akey", up(A.akey.top, 8), "管理员密钥 · 已放弃", "lab-r lab-sm");
lb("lb-g32", up(Wp(L.GRID32.u + 40, L.GRID32.v - 62, 4), 6), "证明覆盖 32 笔", "lab-gs lab-sm");
lb("lb-unrec", up(Wp(L.GRID32.u, L.GRID32.v + 62, 0), -8), "其余 31 格 · 未记账", "lab-g lab-sm", "t");
lb("lb-ctr", up(A.ctr.ground, -8), "笔数字段 numRealTxs", "lab-ink lab-sm", "t");
lb("lb-unb", up(MID, 22), "没绑定", "lab-rs lab-sm");
lb("lb-valid", up(A.pc0.top, 8), "证明仍有效", "lab-gs lab-sm");
lb("lb-bind", up(MID, 22), "绑定", "lab-r lab-dash");
lb("lb-dA", [DX + 65, DY + 118], "约 219 万美元", "lab-rs lab-sm", "t");
lb("lb-dB", [DX + 146 + DB_MOVE[0], DY + 30 + DB_MOVE[1]], "约 8.8 万美元", "lab-rs lab-sm");
const GC = at(L.GRID32);
["数量", "索引", "长度"].forEach((s, i) => lb("tg" + i, [GC[0] + 215, GC[1] - 62 + i * 50], "✓ " + s, "lab-gs lab-sm", "c"));
lb("lb-dep2", up(A.dep.ground, -6), "停用或继续监控", "lab-ink lab-sm", "t");
lb("lb-bcn", up(A.bcn.top, 8), "监控", "lab-cs lab-sm");
lb("lb-chl", up(A.chl.top, 8), "挑战者", "lab-cs lab-sm");
lb("lb-days", [A.hgD.center[0] - 50, A.hgD.center[1]], "几天", "lab-ink lab-sm", "r");
lb("lb-asmF", up(A.hgD.ground, -22), "假设：至少一个诚实挑战者", "lab-g lab-sm", "t");
lb("lb-vpf", up(A.vpf.top, 8), "有效性证明", "lab-gs lab-sm");
lb("lb-hrs", up(A.hgH.ground, -6), "几小时", "lab-ink lab-sm", "t");
lb("lb-asmV", up(A.vpf.ground, -150), "假设：证明系统可靠 · 电路正确", "lab-g lab-sm", "t");
lb("lb-sw", up(A.mode.top, 8), "运营方可切换 · 暂停", "lab-ink lab-sm");
lb("lb-perm", up(A.mode.top, 8), "许可模式", "lab-rs lab-sm");
lb("lb-rclk", up(A.rclk.ground, -10), "回滚 约 1.5 小时", "lab-r lab-sm", "t");
lb("lb-mtr", up(A.mtr.top, 10), "依赖运营方 · 多签", "lab-r lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CD = { x: 1090, y: 290, w: 770 };
const cardD = codeCard("cd", { ...CD, head: "L1 结算合约", mono: true, rows: [
  { html: `<span class="c-cm">// 证明覆盖 32 笔</span>` },
  { html: "for (i = 0; i &lt; numRealTxs; i++)" },
  { html: "    settle(tx[i])" },
  { html: `<span class="c-red">// numRealTxs 由提交者填写</span>` },
] });
S.curve("cvD", [CD.x - 4, codeRowY(CD.y, 1)], S.scr("settleE", up(A.ctr.top, 4)), { color: "#e0453a" });
const cardStage = codeCard("stc", { x: 60, y: 300, w: 700, head: "L2BEAT Stages", rowHide: true, rows: [
  { html: "<b>Stage 0</b>  状态根和数据上 L1" }, { html: "         有证明系统" },
  { html: "<b>Stage 1</b>  安全委员会 ≥ 8 人" }, { html: "         阈值 ≥ 75% · 退出窗口 ≥ 5 天" },
  { html: "<b>Stage 2</b>  证明无需许可" }, { html: "         退出窗口 ≥ 30 天" },
] });
const html = cardD + cardStage +
  ck("ckD", "笔数也是公开输入 · 由证明覆盖", { x: CD.x, y: 612, w: CD.w, kind: "g" }) +
  kw("kw-bind", `问题在 <b>证明 ↔ 结算</b> 的绑定${gtag("安全研究者结论")}`, { x: 1040, y: 300, size: 44, accent: "#e0453a" }) +
  evt("ev-az", "<b>Aztec Connect</b>") +
  evt("ev-src", `<span class="ev-s">来源 · rekt.news · SlowMist 分析 · Halborn 分析</span>`, { top: 124 }) +
  evt("ev-op", `<b>OP Mainnet</b> · 2024 年 8 月<br><span class="ev-s">来源 · The Block 报道 · Optimism 治理</span>`, { top: 128, color: "#e0453a" }) +
  evt("ev-sk", `<b>Starknet</b> · 2025 年 9 月<br><span class="ev-s">来源 · Starknet 事件报告</span>`, { top: 132, color: "#e0453a" }) +
  evt("ev-l2b", `<span class="ev-s">来源 · L2BEAT 规范</span>${gtag("截至 2026 年")}`, { top: 136 });
const css = `
    .ev-s { font-size: 28px; font-weight: 800; }
    .lab-dash { border: 4px dashed #e0453a !important; background: #fffdf8; color: #c3352b; }
    #cd-r1 { border-radius: 10px; }
    #cd-r3 { opacity: 0; }
    .k-code .c-row b { color: #1d93ba; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dep: w("弃用", 1), akey: w("管理员密钥", 1), money: w("有钱", 1),
  n32: w("32", 2), num: w("笔数", 3), unb: w("没有和证明绑定", 4), atk: w("攻击者", 4),
  set1: w("设成", 5), fake: w("伪造", 5), valid: w("仍然有效", 5),
  first: w("第一名", 6), second: w("第二名", 6), bind: w("绑定", 7),
  all: w("全部公开输入", 8), qty: w("数量", 8), idx: w("索引", 8), len: w("长度", 8), cov: w("覆盖", 8),
  stop: w("彻底停用", 9), mon: w("监控", 9), bty: w("赏金", 9),
  chl: w("挑战者", 11), days: w("几天", 11), rel: w("可靠", 12), hrs: w("几小时", 12),
  sw: w("切换", 13), rb: w("回滚", 13), perm: w("许可模式", 14), rb2: w("回滚", 15),
};
const t = (x) => f(x);
const STG = [0, 1, 2].map((i) => LS[16] + 1.5 + i * 1.5);
const END = { out: S.TOTAL - 2.6, cam: S.TOTAL - 2.5 };

S.build({
  cam0: "verifD", sub: "证明是对的，结算没用全",
  grid: { u0: 1500, u1: 10800, v0: -5400, v1: 4100 }, box: [1550, -3850, 6250, 3600],   // D → E → F 全部镜头（含 DE / EF / stageL）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "Rollup", d: "链下执行交易、结果提交到 L1 的 L2", at: w("Rollup", 11) },
    { id: "t1", t: "许可模式", d: "只有指定方能提交证明或挑战", at: w("许可模式", 14) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#atk0W", { x: ${f(ATK0_FROM[0][0] - ATK0_FROM[1][0])}, y: ${f(ATK0_FROM[0][1] - ATK0_FROM[1][1])} }, 0);
      // ===== L0 回到开头的 Aztec Connect。
      cam(${t(LS[0] + 0.1)}, "aztecE", 2.0); pop("#ev-az", ${t(LS[0] + 0.9)}); pop("#lb-az", ${t(LS[0] + 1.4)}, 0.25);
      // ===== L1 它已经弃用，管理员密钥已经放弃，合约里却仍然有钱。
      flash("#dep", ${t(TM.dep)}, 2);
      grow("akey", ${t(TM.akey)}); pop("#lb-akey", ${t(TM.akey + 0.4)}, 0.25);
      KIT.door(tl, "vault", ${t(TM.money - 0.2)}, 40, 1.0); pop("#lb-money", ${t(TM.money + 0.5)}, 0.25);
      // ===== L2 证明按 32 笔交易一组校验。
      out("#ev-az, #lb-az, #lb-akey, #lb-money", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "settleE", 1.2);
      tl.to(".g32c", { opacity: 1, duration: 0.12, stagger: 0.025 }, ${t(TM.n32)}); pop("#lb-g32", ${t(TM.n32 + 0.8)}, 0.25);
      pop("#cd", ${t(LS[2] + 1.3)});
      // ===== L3 L1 上的结算，只处理到一个字段写的笔数。
      pop("#lb-ctr", ${t(TM.num)}, 0.25); hot("#cd-r1", ${t(TM.num)}); draw("cvD", ${t(TM.num + 0.2)});
      // ===== L4 这个字段，没有和证明绑定，由攻击者填写。
      fadeIn("#unb", ${t(TM.unb)}, 0.3); pop("#lb-unb", ${t(TM.unb + 0.3)}, 0.25); pop("#cd-r3", ${t(TM.unb + 0.5)});
      fadeIn("#atk0W", ${t(TM.atk)}, 0.3); tl.to("#atk0W", { x: 0, y: 0, duration: 1.2, ease: "power1.inOut" }, ${t(TM.atk + 0.3)});
      // ===== L5 攻击者把它设成 1。伪造的存款不被记账，证明仍然有效。
      KIT.count(tl, "ctr", ${t(TM.set1)}, 0.8, 32, 1);
      tl.to(".g32o", { attr: { fill: "#c9c3b7", stroke: "#a9a194" }, duration: 0.25, stagger: 0.015 }, ${t(TM.fake)}); pop("#lb-unrec", ${t(TM.fake + 0.6)}, 0.25);
      pop("#lb-valid", ${t(TM.valid)}, 0.25);
      // ===== L6 按 rekt.news、SlowMist 和 Halborn 的分析，第一名攻击者取走约 219 万美元，第二名又取走约 8.8 万美元。
      out("#cd, #cvD, #lb-ctr, #lb-unb, #lb-valid, #lb-g32, #lb-unrec", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "aztecE", 1.2);
      fadeIn("#dA, #dB", ${t(LS[6] + 1.0)}, 0.5); pop("#ev-src", ${t(LS[6] + 1.2)});
      pop("#lb-dA", ${t((TM.first + TM.second) / 2)}, 0.25);
      grow("atk1", ${t(TM.second)}); tl.to("#dB", { x: ${DB_MOVE[0]}, y: ${DB_MOVE[1]}, duration: 0.8, ease: "power2.inOut" }, ${t(TM.second + 0.3)}); pop("#lb-dB", ${t(TM.second + 1.1)}, 0.25);
      // ===== L7 安全研究者的结论是，问题在证明和结算之间的绑定。
      out("#ev-src, #lb-dA, #lb-dB, #dA, #dB", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "settleE", 1.2);
      pop("#lb-bind", ${t(TM.bind)}, 0.25); flash("#unb", ${t(TM.bind)}, 2); pop("#kw-bind", ${t(LS[7] + 1.0)});
      // ===== L8 所以结算要用证明里的全部公开输入。数量、索引、长度，也必须被证明覆盖。
      out("#kw-bind, #lb-bind", ${t(LS[8] - 0.2)}); pop("#cd", ${t(LS[8] + 0.1)}); pop("#ckD", ${t(TM.all + 0.4)});
      pop("#tg0", ${t(TM.qty)}, 0.25); pop("#tg1", ${t(TM.idx)}, 0.25); pop("#tg2", ${t(TM.len)}, 0.25);
      out("#unb, #atk0W", ${t(TM.cov)}, 0.3); fadeIn("#bok", ${t(TM.cov + 0.2)}, 0.4);
      KIT.count(tl, "ctr", ${t(TM.cov + 0.2)}, 0.8, 1, 32);
      tl.to(".g32o", { attr: { fill: "#1f9d55", stroke: "#16733e" }, duration: 0.25, stagger: 0.01 }, ${t(TM.cov + 0.3)});
      // ===== L9 已经弃用的合约，要么彻底停用，要么继续放在监控和赏金范围里。
      out("#cd, #ckD, #tg0, #tg1, #tg2", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "aztecE", 1.2);
      pop("#lb-dep2", ${t(TM.stop)}, 0.25);
      grow("bcn", ${t(TM.mon - 0.3)}); pop("#lb-bcn", ${t(TM.mon + 0.1)}, 0.25); KIT.beacon(tl, "bcn", ${t(TM.mon + 0.2)}, ${f(LE[9] - TM.mon - 0.2)}, 0.9);
      grow("bty", ${t(TM.bty - 0.2)}); flash("#lb-bcn", ${t(LE[9] - 1.4)}, 2);
      // ===== L10 同样的问题，放大到整条 L2。
      out("#lb-dep2, #lb-bcn", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "EF", 2.0); fadeIn("#l2link", ${t(LS[10] + 1.2)}, 0.6);
      // ===== L11 欺诈证明的 Rollup，假设挑战期里至少有一个诚实的挑战者，提款要等几天。
      cam(${t(LS[11])}, "l2F", 1.5);
      grow("chl", ${t(TM.chl - 0.5)}); grow("magF", ${t(TM.chl - 0.2)}); pop("#lb-chl", ${t(TM.chl + 0.2)}, 0.25); pop("#lb-asmF", ${t(TM.chl + 0.6)}, 0.25);
      grow("hgD", ${t(TM.days - 0.5)}); pop("#lb-days", ${t(TM.days)}, 0.25); KIT.sand(tl, "hgD", ${t(TM.days)}, 2.5);
      // ===== L12 有效性证明的 Rollup，假设证明系统可靠、电路正确，提款通常几小时。
      grow("vpf", ${t(LS[12] + 0.3)}); pop("#lb-vpf", ${t(LS[12] + 0.7)}, 0.25); pop("#lb-asmV", ${t(TM.rel)}, 0.25);
      grow("hgH", ${t(TM.hrs - 0.5)}); pop("#lb-hrs", ${t(TM.hrs)}, 0.25); KIT.sand(tl, "hgH", ${t(TM.hrs)}, 1.0);
      // ===== L13 两种证明系统，都能被运营方切换或暂停，链也能回滚。
      flash("#mode", ${t(TM.sw)}, 3); pop("#lb-sw", ${t(TM.sw)}, 0.25); KIT.clock(tl, "rclk", ${t(TM.rb)}, 0.8, -10);
      // ===== L14 2024 年 8 月，OP Mainnet 的故障证明在审计中发现漏洞，守护者把它切回许可模式。
      out("#lb-sw", ${t(LS[14] - 0.2)}); pop("#ev-op", ${t(LS[14] + 0.3)}); flash("#mode", ${t(LS[14] + 2.9)}, 2);
      KIT.toggle(tl, "mode", ${t(TM.perm)}, false); pop("#lb-perm", ${t(TM.perm + 0.5)}, 0.25);
      // ===== L15 2025 年 9 月，Starknet 的证明层发现状态不一致，拒绝出证明，链回滚约 1.5 小时。
      out("#ev-op", ${t(LS[15] - 0.2)}); pop("#ev-sk", ${t(LS[15] + 0.3)});
      KIT.clock(tl, "rclk", ${t(TM.rb2)}, 1.2, -90); pop("#lb-rclk", ${t(TM.rb2 + 0.4)}, 0.25);
      // ===== L16 L2BEAT 的 Stages 框架，按去掉运营方之后剩下多少保障，给 L2 分级。
      out("#ev-sk, #lb-chl, #lb-days, #lb-asmF, #lb-vpf, #lb-asmV, #lb-hrs, #lb-perm, #lb-rclk", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "stageL", 1.4);
      pop("#stc", ${t(LS[16] + 0.9)}); pop("#ev-l2b", ${t(LS[16] + 1.1)});
      ${STG.map((s, i) => `grow("stg${i}", ${t(s)}); pop("#stc-r${2 * i}", ${t(s + 0.2)}, 0.25); pop("#stc-r${2 * i + 1}", ${t(s + 0.4)}, 0.25);`).join("\n      ")}
      // ===== L17 Stage 越低，安全越依赖运营方和多签。
      flash("#stg0", ${t(LS[17] + 0.1)}, 2); hot("#stc-r0", ${t(LS[17] + 0.1)}); hot("#stc-r1", ${t(LS[17] + 0.1)});
      pop("#lb-mtr", ${t(LS[17] + 0.7)}, 0.25); flash("#mtr", ${t(LS[17] + 0.8)}, 2);
      out("#stc, #ev-l2b, #lb-mtr", ${t(END.out)}); cam(${t(END.cam)}, "l2F", 1.3);
`,
});
