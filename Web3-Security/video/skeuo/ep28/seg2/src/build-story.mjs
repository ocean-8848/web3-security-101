// ep28/seg2「② 事故档案馆」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.hallA（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A–F 整座档案馆（seg2 L0–L2；seg6 L10–L12、L14–L15 结束卡）
//   A            分区全景：A 门厅
//   B            分区全景：B 阅览厅
//   C            分区全景：C 代码展厅
//   D            分区全景：D 改动展厅
//   E            分区全景：E 钥匙与人展厅
//   F            分区全景：F 复盘台
//   daoA         A DAO 展柜 + 账本 + 回调臂 + 币 + 60 点阵（seg1 起点 L0–L3）
//   curveA       A Curve 展柜：破锁 + 编译器手册 + 70 点阵（seg1 L4–L6）
//   penpieA      A Penpie 展柜：按钮面板 + 空锁框 + 27 点阵（seg1 L7–L8）
//   hallA        A 三只展柜 + 串联红线标签 + 入口牌（seg1 L9–L12 终点；seg2 起点）
//   aviationB    B 比喻角：塔台、黑匣子、公开报告、公章、项目复盘、安全公司分析、链 + 阅读位（seg2 L3–L11）
//   wallsB       B 档案柜 + 六面展墙 + 空白牌 + 阅读位（seg2 L12–L16）
//   patternsB    B 模式墙 + 档案柜（seg2 L17–L18 终点；seg3 起点）
//   reentryC     C ① 柜：Fei Rari + 回调臂 + 按钮面板 + 两把共享锁 + 牌（seg3 L0–L5；代码卡 A 在右侧）
//   zeroC        C ② 柜：Nomad 桥 + 可信根 + 零地址荒地 + 回执签 + 证明卡 + 牌（seg3 L6–L12）
//   priceC       C ③ 柜：池子 + 单一价格机 + 份额机 + 份额 + 防御预言机 + 内部账本 + 牌（seg3 L13–L18 终点；seg4 起点）
//   checkD       D ④ 柜：Euler + 按钮面板 + 关卡 + 天平 + 阅卷机 + 牌（seg4 L0–L5）
//   forkD        D ⑤ 柜：两台合约机器 + 差异卡 + 天平 + 放大镜 + 公章 + 牌（seg4 L6–L10）
//   signD        D ⑥ 柜：多签界面 + 签名人 + 支票 + 权限卡 + 硬件钱包 + 盾牌 + 牌（seg4 L11–L17 终点；seg5 起点）
//   keysE        E ⑦ 柜：九把钥匙 + 门槛表 + 机柜 + 云桶 + 保险柜 + 时间锁空框 + 闸刀 + 牌（seg5 L0–L6）
//   methE        E mETH 角：售货机 + 8 小时沙漏 + 暂停闸刀 + 三枚 cmETH（seg5 L7–L8）
//   peopleE      E ⑧ 柜：两张桌 + 隔板 + 员工 + 测试题 + PDF + 笔记本 + 客服 + 用户数据 + 两人确认 + 收回钥匙 + 牌（seg5 L9–L15）
//   nftE         E NFT 与 GameFi 墙：牌 + 手机 + 前端 + 铸币机 + 内部人（seg5 L16 终点；seg6 起点）
//   deskF        F 复盘台：复盘文件 + 链 + 调用树 + 放大镜 + 扳道器 + 木牌 + 徽章行 + 牌（seg6 L0–L9）
//   vitrineF     F 空展柜 + 八枚徽章（seg6 L13）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.patternsB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const CE = 0.866, RED = "#e0453a", TEAL = "#1d93ba", INK = "#1c1c1c", GREEN = "#1f9d55";

// wrap helper (SEGBASE 常见坑 1): objects without opts.scale are scaled around their ground point, anchors rescaled
const scAnch = (an, gx, gy, k) => {
  const m = (v) => (Array.isArray(v) && v.length === 2 && typeof v[0] === "number" ? [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k]
    : Array.isArray(v) ? v.map(m) : v);
  const r = {}; for (const n in an) r[n] = m(an[n]); return r;
};
const putW = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  A[key] = scAnch(A[key], gx, gy, k);
};
const P = (o) => at(o);

// ---------------------------------------------------------------- 参观路线（地面，最先画）
{
  const p0 = P(L.routeAt(L.ROUTE_U[0])), p1 = P(L.routeAt(L.ROUTE_U[1]));
  add(L.routeAt(L.ROUTE_U[0]), `<g id="route"><path d="M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}" stroke="#2aa3c9" stroke-width="10" stroke-dasharray="34 22" stroke-linecap="round" fill="none" opacity="0.7"/>` +
    `<path d="M${p1[0] - 40} ${p1[1] - 4}L${p1[0]} ${p1[1]}L${p1[0] - 22} ${p1[1] + 32}" stroke="#2aa3c9" stroke-width="10" fill="none" stroke-linecap="round"/></g>`, -1e6);
}
const zoneTag = (o, text) => { const [x, y] = P(o);
  add(o, `<g><rect x="${x - 110}" y="${y - 24}" width="220" height="54" rx="12" fill="#fffdf8" stroke="#2aa3c9" stroke-width="3"/><text x="${x}" y="${y + 12}" font-size="28" font-weight="800" text-anchor="middle" fill="${INK}">${text}</text></g>`, -500); };

// ---------------------------------------------------------------- A 门厅（seg1 结尾状态，开场即可见）
const VNAME = ["The DAO", "Curve", "Penpie"], VPLATE = ["The DAO · 2016", "Curve · 2023", "Penpie · 2024"];
L.A_VIT.forEach((o, i) => {
  const v = E1.vending({ u: o.u, v: o.v }, { id: `av${i}`, sign: VNAME[i], scale: 0.45 });
  put(`avit${i}`, o, E2.vitrine(o, { id: `avit${i}`, w: 300, d: 220, h: 260, plate: VPLATE[i], inner: E2.liftSvg(v.svg, E2.VITRINE_FLOOR) }));
  A[`av${i}`] = scAnch(v.anchors, 0, -E2.VITRINE_FLOOR * CE, 1);   // lift anchors by the vitrine floor
  for (const n in A[`av${i}`]) { const q = A[`av${i}`][n]; if (Array.isArray(q) && typeof q[0] === "number") A[`av${i}`][n] = [q[0], q[1] - E2.VITRINE_FLOOR * CE]; }
});
put("aled", L.A_LEDGER, O.ledgerBook(L.A_LEDGER, { id: "aled", scale: 0.45 }));
put("aarm", L.A_ARM, E4.callbackArm(L.A_ARM, { id: "aarm", scale: 0.45, target: A.av0.coinSlot ?? A.av0.center }));
L.A_COINS.forEach((o, i) => put(`acoin${i}`, o, E7.oddCoin(o, { id: `acoin${i}`, scale: 0.4 })));
put("ahasp", L.A_HASP, E4.hasp(L.A_HASP, { id: "ahasp", scale: 0.5, z: 0, state: "broken" }));
putW("aman", L.A_MANUAL, E3.manual(L.A_MANUAL, { id: "aman", title: "Vyper 编译器" }), 0.5);
putW("apan", L.A_PANEL, E5.funcPanel(L.A_PANEL, { id: "apan", buttons: ["存入", "领奖"] }), 0.45);
{ // red dot matrices 60 / 70 / 27 (10 per row)
  [60, 70, 27].forEach((n, j) => { const [gx, gy] = P(L.A_DOTS[j]); let s = "";
    for (let i = 0; i < n; i++) s += `<circle cx="${gx + 14 + (i % 10) * 28}" cy="${gy + 11 + Math.floor(i / 10) * 21}" r="8" fill="${RED}"/>`;
    add(L.A_DOTS[j], `<g id="adots${j}">${s}</g>`, -400); });
  // red dashed line through the three vitrines + label
  const q = L.A_VIT.map((o) => up(P(o), 150));
  add(L.A_VIT[2], `<path id="aline" d="M${q[0][0]} ${q[0][1]}L${q[1][0]} ${q[1][1]}L${q[2][0]} ${q[2][1]}" stroke="${RED}" stroke-width="6" stroke-dasharray="18 12" fill="none"/>`, 400);
}
lb("lb-aline", P(L.A_LINE), "先交互 → 后记账", "lab-rs");
put("asign", L.A_SIGN, E1.signBoard(L.A_SIGN, { id: "asign", style: "plate", text: "事故档案馆", size: 34 }));
zoneTag(L.A_TAG, "A · 门厅");

// ---------------------------------------------------------------- B 阅览厅
putW("tower", L.B_TOWER, O.tower(L.B_TOWER, { id: "tower" }), 0.5);
putW("bhsm", L.B_HSM, O.hsm(L.B_HSM, { id: "bhsm" }), 0.6);
put("brep", L.B_REPORT, O.doc(L.B_REPORT, { id: "brep", standing: true, w: 120, h: 150, title: "公开报告", lines: ["1970 年代"] }), 0, { grow: true });
putW("bseal", L.B_SEAL, O.seal(L.B_SEAL, { id: "bseal", stamped: false, markText: "独立", text: "独立机构" }), 0.6);
put("bpm", L.B_POSTMORTEM, O.doc(L.B_POSTMORTEM, { id: "bpm", standing: true, w: 120, h: 150, title: "项目复盘" }), 0, { grow: true });
put("bfirm", L.B_FIRM, O.doc(L.B_FIRM, { id: "bfirm", w: 140, h: 110, title: "安全公司分析" }), 0, { grow: true });
putW("bchain", L.B_CHAIN, O.chain(L.B_CHAIN, { id: "bchain", n: 3 }), 0.45, 0, { grow: true });
putW("bdesk", L.B_DESK, O.desk(L.B_DESK, { id: "bdesk" }), 0.6);
put("bread", L.B_READER, O.person(L.B_READER, { id: "bread", role: "engineer", scale: 0.5 }));
const CATS = ["重入", "访问控制", "价格", "零值", "分叉", "签名", "密钥", "社工"];
putW("bcab", L.B_CABINET, E3.slotCabinet(L.B_CABINET, { id: "bcab", n: 8, dh: 50, title: "根因类别", labels: CATS }), 0.7);
const WALLS = ["以太坊与多链", "BNB Chain", "TRON", "Mantle", "代码之外", "NFT 与 GameFi"];
L.B_WALLS.forEach((o, i) => put(`bw${i}`, o, E1.signBoard(o, { id: `bw${i}`, style: "plate", text: WALLS[i], size: 28 }), 0, { grow: true }));
put("bblank", L.B_BLANK, E1.signBoard(L.B_BLANK, { id: "bblank", style: "plate", text: "", size: 28, w: 200 }), 0, { grow: true });
zoneTag(L.B_TAG, "B · 阅览厅");
{ // native SVG: overlap "多方一致", postmortem gap + "?", report stamp, blank-board red frame, falling case card
  const [ox, oy] = P(L.B_OVERLAP);
  add(L.B_OVERLAP, S.hid("bover", `<ellipse cx="${ox}" cy="${oy}" rx="130" ry="60" fill="#2aa3c9" fill-opacity="0.18" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9"/>`), 600);
  const pt = A.bpm.top;
  add(L.B_POSTMORTEM, S.hid("bgap", `<path d="M${pt[0] + 14} ${pt[1] + 2}l34 0l0 34" stroke="${RED}" stroke-width="4" stroke-dasharray="9 6" fill="none"/><circle cx="${pt[0] + 62}" cy="${pt[1] - 22}" r="22" fill="#fffdf8" stroke="${RED}" stroke-width="4"/><text x="${pt[0] + 62}" y="${pt[1] - 10}" font-size="34" font-weight="900" fill="${RED}" text-anchor="middle">?</text>`), 40);
  const rc = A.brep.center ?? A.brep.top;
  add(L.B_REPORT, S.hid("brstamp", `<circle cx="${rc[0] + 18}" cy="${rc[1] + 30}" r="30" fill="none" stroke="${GREEN}" stroke-width="5"/><text x="${rc[0] + 18}" y="${rc[1] + 39}" font-size="22" font-weight="900" fill="${GREEN}" text-anchor="middle">独立</text>`), 40);
  const bt = A.bblank.board ?? A.bblank.top;
  add(L.B_BLANK, S.hid("bbframe", `<rect x="${bt[0] - 125}" y="${bt[1] - 50}" width="250" height="100" rx="10" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="16 10"/>`), 40);
}
// pattern wall (native SVG, upright board): 8 slots ①–⑧; ①–⑤ teal "代码与版本", ⑥–⑧ ink "签名 · 密钥 · 人"
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
const [px, py] = P(L.B_PATTERNS), SX = (i) => px - 315 + i * 90 + (i >= 5 ? 10 : 0), SY = py - 62;
{
  let s = `<rect x="${px - 380}" y="${py - 160}" width="760" height="168" rx="14" fill="#fffdf8" stroke="#b8b0a1" stroke-width="3"/>`;
  for (let i = 0; i < 8; i++) s += `<circle cx="${SX(i)}" cy="${SY}" r="32" fill="none" stroke="#b8b0a1" stroke-width="3" stroke-dasharray="8 6"/>`;
  add(L.B_PATTERNS, s, 0);
  add(L.B_PATTERNS, S.hid("pgA", `<rect x="${px - 368}" y="${py - 150}" width="452" height="146" rx="12" fill="none" stroke="#2aa3c9" stroke-width="5"/><text x="${px - 142}" y="${py - 116}" font-size="24" font-weight="800" fill="${TEAL}" text-anchor="middle">代码与版本</text>`), 1);
  add(L.B_PATTERNS, S.hid("pgB", `<rect x="${px + 94}" y="${py - 150}" width="274" height="146" rx="12" fill="none" stroke="${INK}" stroke-width="5"/><text x="${px + 231}" y="${py - 116}" font-size="24" font-weight="800" fill="${INK}" text-anchor="middle">签名 · 密钥 · 人</text>`), 1);
  for (let i = 0; i < 8; i++) add(L.B_PATTERNS, S.hid(`pb${i}`, `<circle cx="${SX(i)}" cy="${SY}" r="30" fill="${i < 5 ? TEAL : INK}" stroke="#fffdf8" stroke-width="3"/><text x="${SX(i)}" y="${SY + 13}" font-size="36" font-weight="900" fill="#fff" text-anchor="middle">${NUM[i]}</text>`), 2);
  // red dashed lines: drawer i (open) → badge i
  const dO = A.bcab.drawersOpen ?? [];
  for (let i = 0; i < 8; i++) { const d0 = dO[i] ?? A.bcab.center;
    add(L.B_PATTERNS, S.hid(`pl${i}`, `<path d="M${d0[0]} ${d0[1]}Q${(d0[0] + SX(i)) / 2 + 40} ${(d0[1] + SY) / 2} ${SX(i)} ${SY - 34}" stroke="${RED}" stroke-width="3.5" stroke-dasharray="10 7" fill="none"/>`), 3); }
}

// ---------------------------------------------------------------- C–F：只在全景里远远看到的展柜（seg3–seg6 的区）
[[L.C1_VIT, "Fei Rari · 2022"], [L.C2_VIT, "Nomad · 2022"], [L.C3_VIT, "Cream · 2021"], [L.D4_VIT, "Euler · 2023"], [L.D5_VIT, "Uranium · 2021"],
  [L.D6_VIT, "Bybit · 2025"], [L.E7_VIT, "Ronin · 2022"]].forEach(([o, pl], i) =>
  put(`fv${i}`, o, E2.vitrine(o, { id: `fv${i}`, w: 420, d: 300, h: 280, plate: pl })));
put("fvF", L.F_VIT, E2.vitrine(L.F_VIT, { id: "fvF", w: 260, d: 200, h: 240, plate: "新漏洞？" }));
putW("fdesk", L.F_DESK, O.desk(L.F_DESK, { id: "fdesk" }), 0.7);
[[L.C_TAG, "C · 代码展厅"], [L.D_TAG, "D · 改动展厅"], [L.E_TAG, "E · 钥匙与人"], [L.F_TAG, "F · 复盘台"]].forEach(([o, tx]) => zoneTag(o, tx));

// ---------------------------------------------------------------- 世界标签（默认隐藏）
lb("lb-tower", up(A.tower.top, 10), "塔台", "lab-cs lab-sm");
lb("lb-hsm", up(A.bhsm.top, 10), "黑匣子", "lab-cs lab-sm");
lb("lb-1970", [A.brep.top[0] - 70, A.brep.top[1] - 12], "1970 年代 ✓", "lab-gs lab-sm", "r");
lb("lb-chain", up(A.bchain.top, 10), "链上数据", "lab-cs lab-sm");
lb("lb-read", up(A.bread.top, 8), "读报告", "lab-cs lab-sm");
lb("lb-seal", up(A.bseal.top, 10), "独立机构", "lab-gs lab-sm");
lb("lb-pmby", [A.bpm.ground[0], A.bpm.ground[1] + 14], "项目方", "lab-ink lab-sm", "t");
lb("lb-firmby", [A.bfirm.ground[0] + 30, A.bfirm.ground[1] + 30], "安全公司", "lab-ink lab-sm", "t");
lb("lb-agree", [P(L.B_OVERLAP)[0], P(L.B_OVERLAP)[1] + 4], "多方一致", "lab-gs", "c");
lb("lb-cab", up(A.bcab.top, 10), "根因类别 + 链", "lab-cs");
lb("lb-blank", up(A.bblank.top, 10), "没上墙 ≠ 没发生", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层（全景 k 0.088：标记一律放屏幕层）
const RP = [L.U_B, L.U_C, L.U_D, L.U_E].map((u, i) => { const [x, y] = S.scr("wide", P(L.routeAt(u))); return { x: Math.round(x) - 70, y: Math.round(y) - 110 - (i % 2) * 40 }; });
const RPT = ["新链", "分叉", "新版本", "新组合"];
const html = kw("kw-old", `旧漏洞 + 新环境 = <b>复发</b>`, { x: 600, y: 130, size: 48, accent: RED }) +
  RPT.map((tx, i) => `<div class="rp hide" id="rp${i}" style="left:${RP[i].x}px;top:${RP[i].y}px">${tx}</div>`).join("") +
  kw("kw-cheap", `<b>成本最低</b>的安全训练`, { x: 1180, y: 130, size: 40 }) +
  `<div class="sb-lim hide" id="gl-lim">${gtag("比喻的局限")}</div>` +
  kw("kw-usd", `金额 = <b>事发时估值</b> · 只当约数`, { x: 1040, y: 150, size: 38, accent: TEAL });
const css = `.rp { position:absolute; background:#1d93ba; color:#fff; font-weight:800; font-size:30px; padding:6px 18px; border-radius:22px; white-space:nowrap; box-shadow:0 6px 14px rgba(70,60,40,0.15); }
  .sb-lim { position:absolute; left:1300px; top:150px; font-size:34px; } .sb-lim .sb-gtag { font-size:34px; padding:6px 16px; }`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  old: w("旧漏洞", 1), rp: [w("新链", 2), w("分叉", 2), w("新版本", 2), w("组合", 2)],
  rep: w("公开报告", 3), y70: w("1970", 4), pm: w("项目复盘", 5), firm: w("安全公司", 5), data: w("链上数据", 5),
  cheap: w("成本最低", 6), lim: w("不成立", 7), ind: w("独立机构", 8), pub: w("发布", 9), gap: w("不完整", 10), dis: w("争议", 10),
  agree: w("一致", 11), file: w("归档", 12), walls: [w("以太坊", 13), w("BNB", 13), w("TRON", 13), w("Mantle", 13)],
  w4: w("代码之外", 14), w5: w("NFT", 14), usd: w("估值", 15), blank: w("没有摆上", 16), eight: w("八种", 17),
  five: w("前五种", 18), three: w("后三种", 18),
};
const t = (x) => f(x);

S.build({
  cam0: "hallA", sub: "旧漏洞，新环境",
  grid: { u0: -5300, u1: 27300, v0: -16800, v1: 16600 }, box: [-2100, -9500, 22100, 12600],   // 盖住本段镜头 hallA · wide · aviationB · wallsB · patternsB（hallA = 上一段结尾）
  shown: ["#lb-aline"], css, html,
  terms: [
    { id: "t0", t: "分叉", d: "复制一个项目的代码再改成新项目", at: w("分叉", 2) },
    { id: "t1", t: "复盘", d: "事故后对原因、过程和改进的书面分析", at: w("复盘", 9) },
    { id: "t2", t: "根因", d: "去掉它事故就不会发生的最深层原因", at: w("根因", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给一句准确的说法：从 hallA 拉到全景，整座档案馆亮出
      out("#lb-aline", ${t(LS[0] + 0.1)}, 0.3); cam(${t(LS[0] + 0.2)}, "wide", 2.4, "power2.inOut");
      // ===== L1 旧漏洞 + 新环境 = 复发（屏幕层关键词）
      pop("#kw-old", ${t(TM.old)});
      // ===== L2 四个青蓝小标签沿参观路线依次弹出（屏幕层）
      ${TM.rp.map((x, i) => `pop("#rp${i}", ${t(x)}, 0.25);`).join(" ")}
      // ===== L3 镜头到比喻角：塔台、黑匣子亮，公开报告立起
      out("#kw-old, #rp0, #rp1, #rp2, #rp3", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "aviationB", 1.8, "power2.inOut");
      pop("#lb-tower", ${t(LS[3] + 1.6)}); pop("#lb-hsm", ${t(LS[3] + 1.9)}); grow("brep", ${t(TM.rep)});
      // ===== L4 1970 年代 + 绿勾
      pop("#lb-1970", ${t(TM.y70)});
      // ===== L5 对照区三样依次立起
      grow("bpm", ${t(TM.pm)}); grow("bfirm", ${t(TM.firm)}); grow("bchain", ${t(TM.data)}); pop("#lb-chain", ${t(TM.data + 0.3)});
      // ===== L6 读报告 + 成本最低
      pop("#lb-read", ${t(LS[6])}); pop("#kw-cheap", ${t(TM.cheap)});
      // ===== L7 比喻的局限
      out("#kw-cheap, #lb-read", ${t(LS[7] - 0.2)}); pop("#gl-lim", ${t(TM.lim)});
      // ===== L8 独立机构盖章，公开报告上出现绿章
      KIT.stamp(tl, "bseal", ${t(TM.ind - 0.3)}); pop("#lb-seal", ${t(TM.ind)}); fadeIn("#brstamp", ${t(TM.ind + 0.3)}, 0.3);
      // ===== L9 项目方 / 安全公司，没有章
      out("#lb-tower, #lb-hsm", ${t(LS[9] - 0.2)}); pop("#lb-pmby", ${t(TM.pub - 0.4)}); pop("#lb-firmby", ${t(TM.pub - 0.1)});
      // ===== L10 项目复盘一角红色虚线缺口 + 红 ?
      fadeIn("#bgap", ${t(TM.gap)}, 0.3); bump("#bgap", ${t(TM.dis)}, 1.15, 1);
      // ===== L11 三份资料之间的重叠区 → 多方一致
      out("#gl-lim", ${t(LS[11])}); fadeIn("#bover", ${t(TM.agree - 0.4)}, 0.4); pop("#lb-agree", ${t(TM.agree)});
      // ===== L12 镜头到展墙区：档案柜抽屉拉开
      out("#lb-1970, #lb-chain, #lb-seal, #lb-pmby, #lb-firmby, #lb-agree", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "wallsB", 1.6, "power2.inOut"); pop("#lb-cab", ${t(TM.file)}); X3.drawer(tl, "bcab", 0, ${t(TM.file + 0.2)}, true, 0.6);
      // ===== L13 四条链各一面展墙
      ${[0, 1, 2, 3].map((i) => `grow("bw${i}", ${t(TM.walls[i])});`).join(" ")}
      // ===== L14 代码之外、NFT 与 GameFi
      grow("bw4", ${t(TM.w4)}); grow("bw5", ${t(TM.w5)});
      // ===== L15 金额 = 事发时估值 · 约数
      pop("#kw-usd", ${t(TM.usd)});
      // ===== L16 展墙尽头空白牌 + 红色虚线框
      out("#kw-usd", ${t(LS[16])}); grow("bblank", ${t(TM.blank)}); fadeIn("#bbframe", ${t(TM.blank + 0.5)}, 0.3); pop("#lb-blank", ${t(TM.blank + 0.8)});
      // ===== L17 镜头到模式墙：八枚徽章依次亮，抽屉拉出，红线连到徽章
      out("#lb-cab, #lb-blank", ${t(LS[17] - 0.2)}); X3.drawer(tl, "bcab", 0, ${t(LS[17])}, false, 0.4); cam(${t(LS[17])}, "patternsB", 1.6, "power2.inOut");
      ${Array.from({ length: 8 }, (_, i) => `X3.drawer(tl, "bcab", ${i}, ${t(TM.eight - 0.4 + i * 0.4)}, 0.6, 0.4); fadeIn("#pb${i}", ${t(TM.eight + i * 0.4)}, 0.25); fadeIn("#pl${i}", ${t(TM.eight + 0.1 + i * 0.4)}, 0.25);`).join("\n      ")}
      // ===== L18 两个分组框：代码与版本 / 签名 · 密钥 · 人
      fadeIn("#pgA", ${t(TM.five)}, 0.4); fadeIn("#pgB", ${t(TM.three)}, 0.4);
`,
});
