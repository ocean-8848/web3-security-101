// ep28/seg3「③ 代码里的旧病」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.patternsB（BRIEF）。
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
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.priceC

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E6, E7, E8] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手：anchors 换算（缩放包裹 / 抬进展柜）
const mapA = (an, fn) => {
  const isP = (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number";
  const o = {};
  for (const [k, v] of Object.entries(an)) o[k] = isP(v) ? fn(v) : Array.isArray(v) && v.every(isP) ? v.map(fn) : v;
  return o;
};
const wrapK = (o, k) => {
  const [gx, gy] = at(o);
  return { wrap: (svg) => `<g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${svg}</g>`,
    sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] };
};
const LIFT = E2.VITRINE_FLOOR * 0.866;
const lift = (p) => [p[0], p[1] - LIFT];
/** 展柜 + 柜内物件：inner 抬到柜内地面，anchors 一并抬高 */
const showcase = (vid, o, plate, iid, r, wrapOpt) => {
  const svg = wrapOpt ? wrapOpt.wrap(r.svg) : r.svg;
  put(vid, o, E2.vitrine(o, { id: vid, w: 420, d: 300, h: 280, plate, inner: E2.liftSvg(svg, E2.VITRINE_FLOOR) }));
  A[iid] = mapA(r.anchors, (p) => lift(wrapOpt ? wrapOpt.sc(p) : p));
};
const putK = (key, o, r, k, dy = 0, opts = {}) => {
  const W = wrapK(o, k);
  put(key, o, r, dy, { ...opts, wrap: W.wrap });
  A[key] = mapA(A[key], W.sc);
};
/** 模式徽章（原生 SVG）：青蓝圆章 + 编号 */
const badge = (p, n, r = 30) => `<circle cx="${f(p[0])}" cy="${f(p[1] + 4)}" r="${r}" fill="#155e77" opacity="0.35"/>
  <circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="#1d93ba" stroke="#ffffff" stroke-width="4"/>
  <circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r - 8}" fill="none" stroke="#bfe6f3" stroke-width="2"/>
  <text x="${f(p[0])}" y="${f(p[1] + r * 0.36)}" text-anchor="middle" font-family="Noto Sans SC" font-weight="900" font-size="${f(r * 1.05)}" fill="#ffffff">${n}</text>`;
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
const redBox = (q, pad = 10) => `<rect x="${f(q[0] - pad)}" y="${f(q[1] - pad)}" width="${f(q[2] - q[0] + 2 * pad)}" height="${f(q[3] - q[1] + 2 * pad)}" rx="10"
  fill="rgba(224,69,58,0.05)" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`;

// ---------------------------------------------------------------- 世界物件：B 模式墙 + 档案柜（上一段结尾画面）
{
  const [gx, gy] = at(L.B_PATTERNS);
  let s = `<ellipse cx="${f(gx)}" cy="${f(gy + 2)}" rx="390" ry="16" fill="#000" opacity="0.07"/>`;
  for (const dx of [-330, 330]) s += `<rect x="${f(gx + dx - 7)}" y="${f(gy - 150)}" width="14" height="154" rx="4" fill="#8d857a"/>`;
  s += `<rect x="${f(gx - 384)}" y="${f(gy - 156)}" width="768" height="120" rx="14" fill="#d2c9b9"/>
    <rect x="${f(gx - 380)}" y="${f(gy - 160)}" width="760" height="116" rx="14" fill="#fffdf8" stroke="#1c1c1c" stroke-width="2.5"/>`;
  for (let i = 0; i < 8; i++) {
    const cx = gx - 329 + i * 94, cy = gy - 118, col = i < 5 ? "#2aa3c9" : "#1c1c1c";
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="30" fill="#f4f0e8" stroke="${col}" stroke-width="3" stroke-dasharray="8 6"/>
      <text x="${f(cx)}" y="${f(cy + 11)}" text-anchor="middle" font-family="Noto Sans SC" font-weight="800" font-size="30" fill="#b8b0a1">${NUM[i]}</text>`;
  }
  s += `<text x="${f(gx - 329 + 2 * 94)}" y="${f(gy - 58)}" text-anchor="middle" font-family="Noto Sans SC" font-weight="800" font-size="20" fill="#1d93ba">代码与版本</text>
    <text x="${f(gx - 329 + 6 * 94)}" y="${f(gy - 58)}" text-anchor="middle" font-family="Noto Sans SC" font-weight="800" font-size="20" fill="#1c1c1c">签名 · 密钥 · 人</text>`;
  add(L.B_PATTERNS, s);
  add(L.B_PATTERNS, S.hid("slot1on", badge([gx - 329, gy - 118], "①")), 1);
}
putK("cab", L.B_CABINET, E3.slotCabinet(L.B_CABINET, { id: "cab", title: "根因类别", labels: ["重入", "零值", "价格", "检查", "签名", "密钥"] }), 0.7);

// 参观路线（地面青蓝虚线，最先画）
{
  const P0 = Wp(4600, 0, 0), P1 = Wp(11000, 0, 0);
  add({ u: 0, v: -99999 }, `<path d="M${f(P0[0])} ${f(P0[1])}L${f(P1[0])} ${f(P1[1])}" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="22 16" opacity="0.55" fill="none"/>`);
}

// ---------------------------------------------------------------- C ① 先交互后记账
showcase("vit1", L.C1_VIT, "Fei Rari · 2022", "vm1", E1.vending(L.C1_VIT, { id: "vm1", scale: 0.6, sign: "Fei Rari" }));
put("arm1", L.C1_ARM, E4.callbackArm(L.C1_ARM, { id: "arm1", scale: 0.55, target: A.vm1.tray }));
putK("fp", L.C1_PANEL, E5.funcPanel(L.C1_PANEL, { id: "fp", buttons: [{ name: "借款", guard: "card" }, { name: "还款", guard: "card" }, { name: "退出" }] }), 0.5);
{
  const chainPts = A.fp.btns;
  let s = "";
  L.C1_HASPS.forEach((o, i) => { const r = E4.hasp(o, { id: `hs${i}`, z: 60, scale: 0.5, shared: true, chainTo: chainPts, chainShown: false }); A[`hs${i}`] = r.anchors; s += r.svg; });
  add(L.C1_HASPS[1], S.hid("hsG", s), 2);
}
put("sg1", L.C1_SIGN, E1.signBoard(L.C1_SIGN, { id: "sg1", style: "plate", text: "① 先交互后记账", size: 28 }));
add(L.C1_VIT, S.hid("bdg1", badge(up(A.vit1.top, 40), "①")), 400);

// ---------------------------------------------------------------- C ② 零值有含义
{
  const W = wrapK(L.C2_VIT, 0.4);
  showcase("vit2", L.C2_VIT, "Nomad · 2022", "br", E1.bridge(L.C2_VIT, { id: "br", river: 80 }), W);
}
put("trust", L.C2_ROOT, O.doc(L.C2_ROOT, { id: "trust", w: 120, h: 150, standing: true, title: "可信根", lines: ["全零"] }));
put("lot", L.C2_LOT, E7.emptyLot(L.C2_LOT, { id: "lot", scale: 0.5, zero: true, plateText: "零地址" }));
{
  const r = E7.returnTag(L.C2_TAG, { id: "rtag", scale: 0.8, face: "ok" });
  A.rtag = r.anchors; add(L.C2_TAG, S.hid("rtagG", r.svg), 1);
}
put("proof", L.C2_PROOF, E2.proofCard(L.C2_PROOF, { id: "proof", text: "零 = 无效" }), 0, { grow: true });
put("sg2", L.C2_SIGN, E1.signBoard(L.C2_SIGN, { id: "sg2", style: "plate", text: "② 零值有含义", size: 28 }));
add(L.C2_VIT, S.hid("bdg2", badge(up(A.vit2.top, 40), "②")), 400);
add(L.C2_ROOT, S.hid("rbox", redBox(L.rect(L.C2_ROOT, "docStanding"), 12)), 3);
add(L.C2_TAG, S.hid("tbox", redBox(L.rect(L.C2_TAG, "returnTag"), 16)), 3);

// ---------------------------------------------------------------- C ③ 可变数据当事实
showcase("vit3", L.C3_VIT, "Cream · 2021", "amm", E8.ammPool(L.C3_VIT, { id: "amm", scale: 0.6 }));
put("orc", L.C3_ORACLE, E1.miniVend(L.C3_ORACLE, { id: "orc", kind: "oracle", scale: 0.6 }));
put("shd", L.C3_SHARE, E6.shareDispenser(L.C3_SHARE, { id: "shd", scale: 0.6, value: 100 }));
put("cert", L.C3_CERT, E6.shareCert(L.C3_CERT, { id: "cert", scale: 0.8 }));
put("orc2", L.C3_GOOD, E1.miniVend(L.C3_GOOD, { id: "orc2", kind: "oracle", scale: 0.6, glow: true }), 0, { grow: true });
put("ldg", L.C3_LEDGER, O.ledgerBook(L.C3_LEDGER, { id: "ldg", scale: 0.6 }), 0, { grow: true });
put("sg3", L.C3_SIGN, E1.signBoard(L.C3_SIGN, { id: "sg3", style: "plate", text: "③ 可变数据当事实", size: 28 }));
add(L.C3_VIT, S.hid("bdg3", badge(up(A.vit3.top, 40), "③")), 400);
{ // L17 同一笔交易：三处顶上一条红色虚线"先推高再拉回"
  const P = [up(A.amm.top, 30), up(A.orc.top, 30), up(A.shd.top, 30)];
  const d = `M${f(P[0][0])} ${f(P[0][1])} Q${f((P[0][0] + P[1][0]) / 2)} ${f(Math.min(P[0][1], P[1][1]) - 90)} ${f(P[1][0])} ${f(P[1][1])} Q${f(P[1][0] + 90)} ${f((P[1][1] + P[2][1]) / 2)} ${f(P[2][0])} ${f(P[2][1])}`;
  add(L.C3_SHARE, S.hid("arc3", `<path d="${d}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/>`
    + P.map((p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="#e0453a"/>`).join("")), 500);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-arm", up(A.arm1.top, 8), "回调", "lab-rs lab-sm");
lb("lb-dao", S.up(at(S.rel(L.C1_VIT, -230, -120)), 330), "The DAO", "lab-rs lab-sm");
lb("lb-crv", S.up(at(S.rel(L.C1_VIT, -230, -120)), 220), "Curve", "lab-rs lab-sm");
lb("lb-amt1", up(A.vit1.top, 110), "约 8000 万美元", "lab-r");
lb("lb-exit", up(A.fp.btns[2], 34), "退出：没上锁", "lab-rs lab-sm");
lb("lb-lock", up(A.hs1.top, 16), "共享重入锁", "lab-gs lab-sm");
{ const q = L.rect(L.C2_ROOT, "docStanding"); lb("lb-root", [q[0] - 14, q[1] + 40], "可信根 = 全零", "lab-rs lab-sm", "r"); }
lb("lb-amt2", up(A.vit2.top, 110), "约 1.9 亿美元", "lab-r");
lb("lb-lot", up(A.lot.plateTop ?? A.lot.top, 10), "零地址", "lab-cs lab-sm");
lb("lb-true", [A.rtag.top[0] + 34, A.rtag.top[1] + 10], "返回 true", "lab-gs lab-sm", "l");
{
  const a = at(L.C2_TAG), b = at(L.C2_ROOT);
  lb("lb-mid", [(a[0] + b[0]) / 2 + 30, (a[1] + b[1]) / 2 + 20], "零被当成合法值", "lab-r", "c");
}
lb("lb-amt3", [at(L.C2_TAG)[0] - 120, at(L.C2_TAG)[1] + 30], "约 8000 万美元", "lab-r", "r");
lb("lb-proof", up(A.proof.top, 10), "零 = 无效", "lab-gs");
lb("lb-orc", up(A.orc.top, 10), "单一 DEX 价格", "lab-cs lab-sm");
lb("lb-bzx", up(A.orc.top, 84), "bZx · 2020 年 2 月", "lab-rs lab-sm");
lb("lb-amm", up(A.vit3.top, 10), "池子储备", "lab-cs lab-sm");
lb("lb-bunny", up(A.vit3.top, 84), "PancakeBunny · 2021 年 5 月 · BNB Chain", "lab-rs lab-sm");
lb("lb-shd", [A.shd.top[0] + 70, A.shd.top[1] + 40], "份额价格", "lab-cs lab-sm", "l");
lb("lb-amt4", [A.shd.top[0] + 70, A.shd.top[1] - 60], "约 1.3 亿美元", "lab-r", "l");
lb("lb-same", up(A.orc.top, 150), "同一笔交易 ↑↓", "lab-r");
lb("lb-good", up(A.orc2.top, 10), "抗操纵预言机", "lab-gs lab-sm");
lb("lb-ldg", [A.ldg.top[0], A.ldg.top[1] + 120], "内部记账 ✓", "lab-gs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1316, y: 300, w: 540 }, CB = { x: 1350, y: 300, w: 512 };
const cardA = codeCard("cA", { ...CA, head: "先交互后记账", tag: "示意", mono: true, rows: [
  "function withdraw(amt) {",
  "  msg.sender.call{value: amt}",
  "  balances[msg.sender] -= amt;",
  "}"] });
const cardA2 = codeCard("cA2", { x: CA.x + 4, y: CA.y + 4, w: CA.w, head: "先改状态再交互", tag: "示意", mono: true, rows: [
  "function withdraw(amt)",
  `    <span class="ok-g">nonReentrant</span> {`,
  "  balances[msg.sender] -= amt;",
  "  msg.sender.call{value: amt}",
  "}"] });
const cardB = codeCard("cB", { ...CB, head: "零值有含义", tag: "示意", mono: true, rows: [
  { html: "if (rec[id] == 0) …", chip: "等于零", chipCls: "x" },
  { html: "token.safeTransfer(…)", chip: "零地址", chipCls: "x" },
  { html: "uint v = map[key];", chip: "未初始化", chipCls: "x" }] });
S.curve("cvA1", [CA.x + CA.w + 4 - CA.w - 8, codeRowY(CA.y, 1)], S.scr("reentryC", A.arm1.top), { color: "#e0453a" });
S.curve("cvA2", [CA.x - 4, codeRowY(CA.y, 2)], S.scr("reentryC", A.vm1.glass ?? A.vm1.center), { color: "#e0453a" });
S.curve("cvA3", [CA.x, codeRowY(CA.y + 4, 1)], S.scr("reentryC", A.hs0.top), { color: "#1f9d55" });
S.curve("cvB0", [CB.x - 4, codeRowY(CB.y, 0)], S.scr("zeroC", up(L.rect(L.C2_ROOT, "docStanding").slice(2, 4).map((v, i) => i ? v - 60 : v), 0)), { color: "#e0453a" });
S.curve("cvB1", [CB.x - 4, codeRowY(CB.y, 1)], S.scr("zeroC", A.rtag.top), { color: "#e0453a" });

const html = cardA + cardA2 + cardB
  + kw("kwA", `识别信号：<b>调用之后还写状态</b>`, { x: 60, y: 740, size: 38, accent: "#e0453a" })
  + kw("kwD", `先检查 → 改状态 → <b>最后交互</b>`, { x: 62, y: 742, size: 38 })
  + kw("kwB", `零 = 没有？→ <b>合法值</b>`, { x: 60, y: 740, size: 40, accent: "#e0453a" })
  + kw("kwE", `零 = <b>无效</b> · 存在另记标记`, { x: 62, y: 742, size: 38 })
  + kw("kwF", `同一笔交易里 <b>先推高再拉回</b>${gtag("解读")}`, { x: 60, y: 740, size: 38, accent: "#e0453a" })
  + evt("e1", `Fei Rari · 2022 年 4 月 · 以太坊${gtag("公开报道")}`, { color: "#e0453a" })
  + evt("e2", `Nomad · 2022 年 8 月 · 多链${gtag("公开报道")}`, { color: "#e0453a", top: 122 })
  + evt("e3", `Qubit · 2022 年 1 月 · BNB Chain${gtag("公开报道")}`, { color: "#e0453a", top: 124 })
  + evt("e4", `Cream · 2021 年 10 月 · 以太坊${gtag("公开报道")}`, { color: "#e0453a", top: 126 });
const css = `
    #cA .c-row, #cA2 .c-row, #cB .c-row { font-size: 24px; }
    #cA .c-head, #cA2 .c-head, #cB .c-head { font-size: 30px; }

    .ok-g { color: #1f9d55; font-weight: 800; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  call: w("外部调用", 1), write: w("状态写入", 1), dao: w("DAO", 2), crv: w("Curve", 2),
  fei: w("Fei", 3), send: w("先发送", 3), amt1: w("8000", 3), exit: w("退出", 4),
  chk: w("先检查", 5), chg: w("再改状态", 5), ext5: w("最后", 5), shared: w("共享", 5),
  nomad: w("Nomad", 7), zero7: w("全零", 7), loss7: w("损失", 7), legal: w("合法", 8),
  qubit: w("Qubit", 9), zaddr: w("零地址", 9), ok9: w("成功", 9), amt3: w("8000", 10),
  eq0: w("等于零", 11), za11: w("零地址", 11), map: w("映射", 11), inval: w("无效", 12), flag: w("单独", 12),
  bzx: w("bZx", 14), dex: w("DEX", 14), rsv: w("储备", 15), cream: w("Cream", 16), pump: w("抬高", 16), loss16: w("损失", 16),
  up17: w("推高", 17), back17: w("拉回", 17), orc18: w("预言机", 18), ldg18: w("内部记账", 18),
};
const t = (x) => f(x);

S.build({
  cam0: "patternsB", sub: "先交互后记账，零值有含义，可变数据当事实",
  grid: { u0: 2100, u1: 11700, v0: -4400, v1: 5000 }, box: [2200, -3400, 7200, 3100],   // 盖住本段镜头 patternsB · reentryC · zeroC · priceC（patternsB = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "跨链桥", d: "在两条链之间转移资产的合约系统", at: w("跨链桥", 7) },
    { id: "t1", t: "零地址", d: "全零的地址，没有人持有它", at: w("零地址", 9) },
    { id: "t2", t: "预言机", d: "把外部价格送进合约的服务", at: w("预言机", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 第一种，先交互，后记账。（模式墙 ① 亮 → 右移到 C ① 柜，徽章落柜顶）
      pop("#slot1on", ${t(LS[0] + 0.1)}, 0.35); cam(${t(LS[0] + 0.5)}, "reentryC", 1.8, "power2.inOut");
      pop("#bdg1", ${t(LS[0] + 2.3)}, 0.35); bump("#sg1", ${t(LS[0] + 2.5)}, 1.06, 1);
      // ===== L1 识别信号是，外部调用之后，还有状态写入。
      pop("#cA", ${t(LS[1] + 0.05)}); pop("#lb-arm", ${t(TM.call - 0.2)}, 0.25);
      hot("#cA-r1", ${t(TM.call)}); draw("cvA1", ${t(TM.call + 0.1)});
      hot("#cA-r2", ${t(TM.write)}, "#fdeae7"); draw("cvA2", ${t(TM.write + 0.1)}); pop("#kwA", ${t(TM.write + 0.3)});
      // ===== L2 The DAO 是它，Curve 也是它。
      pop("#lb-dao", ${t(TM.dao)}, 0.3); pop("#lb-crv", ${t(TM.crv)}, 0.3);
      // ===== L3 2022 年 4 月的 Fei Rari，先发送 ETH，后记账，损失约 8000 万美元。
      out("#kwA, #lb-dao, #lb-crv", ${t(LS[3] - 0.2)}); pop("#e1", ${t(TM.fei)});
      X4.armPress(tl, "arm1", ${t(TM.send - 0.4)}); X1.dispense(tl, "vm1", ${t(TM.send)}, { n: 3 });
      pop("#lb-amt1", ${t(TM.amt1)}, 0.3);
      // ===== L4 其中一个退出函数，没被重入锁覆盖。
      out("#e1, #lb-amt1", ${t(LS[4] - 0.2)});
      X5.guard(tl, "fp", 2, ${t(TM.exit)}, "broken"); pop("#lb-exit", ${t(TM.exit + 0.3)}, 0.25);
      // ===== L5 防御是先检查，再改状态，最后才和外部交互，再加一把所有函数共享的重入锁。
      out("#cA, #lb-arm", ${t(TM.chk - 0.25)}); tl.set("#cvA1, #cvA2", { opacity: 0 }, ${t(TM.chk - 0.25)});
      pop("#cA2", ${t(TM.chk)}); hot("#cA2-r2", ${t(TM.chg)}, "#e3f4ea"); hot("#cA2-r3", ${t(TM.ext5)}, "#e3f4ea"); pop("#kwD", ${t(TM.chk + 0.3)});
      fadeIn("#hsG", ${t(TM.shared - 0.2)}, 0.3); X4.chainOn(tl, "hs0", ${t(TM.shared)}, 0.8); X4.chainOn(tl, "hs1", ${t(TM.shared + 0.1)}, 0.8);
      hot("#cA2-r1", ${t(TM.shared)}, "#e3f4ea"); draw("cvA3", ${t(TM.shared + 0.2)});
      X5.guard(tl, "fp", 2, ${t(TM.shared + 0.6)}, "card"); out("#lb-exit", ${t(TM.shared + 0.5)}); pop("#lb-lock", ${t(TM.shared + 0.8)}, 0.25);
      // ===== L6 第二种，零值或默认值有含义。（→ C ② 柜）
      out("#cA2, #kwD, #lb-lock", ${t(LS[6] - 0.2)}); tl.set("#cvA3", { opacity: 0 }, ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "zeroC", 1.4); pop("#bdg2", ${t(LS[6] + 1.5)}, 0.35); bump("#sg2", ${t(LS[6] + 1.7)}, 1.06, 1);
      // ===== L7 2022 年 8 月，Nomad 跨链桥的可信根，被设成了全零，损失约 1.9 亿美元。
      pop("#e2", ${t(TM.nomad)}); fadeIn("#rbox", ${t(TM.zero7)}, 0.3); pop("#lb-root", ${t(TM.zero7 + 0.2)}, 0.25);
      pop("#lb-amt2", ${t(TM.loss7)}, 0.3);
      // ===== L8 零本该表示什么都没有，在这里却成了合法的值。
      pop("#kwB", ${t(TM.legal - 0.6)});
      // ===== L9 同年 1 月，BNB Chain 上的 Qubit 跨链桥，对零地址发起的转账，也返回了成功。（关键画面）
      out("#kwB, #e2, #lb-amt2", ${t(LS[9] - 0.2)}); pop("#e3", ${t(TM.qubit)});
      pop("#lb-lot", ${t(TM.zaddr)}, 0.25); X7.lotPlate(tl, "lot", ${t(TM.zaddr)}, true, 2);
      fadeIn("#rtagG", ${t(TM.ok9 - 0.3)}, 0.2); X7.tagPop(tl, "rtag", ${t(TM.ok9 - 0.3)}, 0.4);
      fadeIn("#tbox", ${t(TM.ok9 + 0.1)}, 0.3); pop("#lb-true", ${t(TM.ok9 + 0.1)}, 0.25);
      pop("#cB", ${t(TM.ok9 + 0.5)}); hot("#cB-r1", ${t(TM.ok9 + 0.8)}); draw("cvB1", ${t(TM.ok9 + 0.9)});
      pop("#lb-mid", ${t(TM.ok9 + 1.4)}, 0.3);
      // ===== L10 这一次，损失约 8000 万美元。
      pop("#lb-amt3", ${t(TM.amt3)}, 0.3);
      // ===== L11 识别信号是，等于零，零地址，没初始化的映射，被当成了合法值。
      out("#e3, #lb-amt3", ${t(LS[11] - 0.2)});
      pop("#cB-c0", ${t(TM.eq0)}, 0.2); hot("#cB-r0", ${t(TM.eq0)}); draw("cvB0", ${t(TM.eq0 + 0.1)});
      pop("#cB-c1", ${t(TM.za11)}, 0.2); pop("#cB-c2", ${t(TM.map)}, 0.2); hot("#cB-r2", ${t(TM.map)});
      // ===== L12 防御是零值一律视为无效，存在与否，用单独的标记来记。
      out("#lb-mid, #lb-true", ${t(LS[12] - 0.2)});
      grow("proof", ${t(TM.inval - 0.3)}); pop("#lb-proof", ${t(TM.inval + 0.2)}, 0.25); pop("#kwE", ${t(TM.flag - 0.3)});
      // ===== L13 第三种，一笔交易里能被改变的数据，被当成了事实。（→ C ③ 柜）
      out("#cB, #kwE, #lb-proof, #lb-root, #lb-lot", ${t(LS[13] - 0.2)}); tl.set("#cvB0, #cvB1", { opacity: 0 }, ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "priceC", 1.4); pop("#bdg3", ${t(LS[13] + 1.5)}, 0.35); bump("#sg3", ${t(LS[13] + 1.7)}, 1.06, 1);
      // ===== L14 2020 年 2 月的 bZx，只看一个 DEX 的价格。
      pop("#lb-bzx", ${t(TM.bzx)}, 0.25); pop("#lb-orc", ${t(TM.dex)}, 0.25);
      X1.needle(tl, "orc", ${t(TM.dex)}, 55, 0.3); X1.needle(tl, "orc", ${t(TM.dex + 0.35)}, -35, 0.3);
      X1.needle(tl, "orc", ${t(TM.dex + 0.7)}, 60, 0.3); X1.needle(tl, "orc", ${t(TM.dex + 1.05)}, 0, 0.4);
      // ===== L15 2021 年 5 月的 PancakeBunny，按池子储备给 LP 定价。
      out("#lb-bzx", ${t(LS[15] - 0.2)}); pop("#lb-bunny", ${t(LS[15] + 0.6)}, 0.25); pop("#lb-amm", ${t(TM.rsv - 0.2)}, 0.25);
      X8.poolLevel(tl, "amm", ${t(TM.rsv)}, 0.2, 0.95, 0.8);
      // ===== L16 同年 10 月的 Cream Finance，份额价格可以被捐赠抬高，损失约 1.3 亿美元。
      out("#lb-bunny", ${t(LS[16] - 0.2)}); pop("#e4", ${t(TM.cream)}); pop("#lb-shd", ${t(TM.pump - 0.6)}, 0.25);
      X6.tally(tl, "shd", ${t(TM.pump)}, 1.0, 100, 9800); pop("#lb-amt4", ${t(TM.loss16)}, 0.3);
      // ===== L17 池子储备，合约余额，份额价格，在同一笔交易里，都能先推高再拉回。
      out("#e4, #lb-amt4", ${t(LS[17] - 0.2)}); fadeIn("#arc3", ${t(LS[17] + 0.2)}, 0.5); pop("#lb-same", ${t(LS[17] + 0.5)}, 0.3);
      pop("#kwF", ${t(LS[17] + 0.6)}); X1.needle(tl, "orc", ${t(TM.up17)}, 60, 0.4);
      X8.poolLevel(tl, "amm", ${t(TM.back17)}, 0.55, 0.55, 0.8); X1.needle(tl, "orc", ${t(TM.back17)}, 0, 0.6); X6.tally(tl, "shd", ${t(TM.back17)}, 0.8, 9800, 100);
      // ===== L18 防御是用抗操纵的预言机，资产用内部记账，不直接读合约余额。（静止在 priceC）
      out("#kwF, #arc3, #lb-same, #lb-orc, #lb-amm, #lb-shd", ${t(LS[18] - 0.2)});
      grow("orc2", ${t(TM.orc18 - 0.6)}); pop("#lb-good", ${t(TM.orc18)}, 0.25);
      grow("ldg", ${t(TM.ldg18 - 0.4)}); pop("#lb-ldg", ${t(TM.ldg18 + 0.1)}, 0.25);
`,
});
