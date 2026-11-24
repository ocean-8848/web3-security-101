// ep28/seg6「⑥ 写一份复盘」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.nftE（BRIEF）。
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
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { fit, R } from "../../shared/layout.mjs";

// 段内镜头：复盘台整组挪到画面右侧，左侧留给复盘清单卡 / 角色卡（x 60–640）
const CAMS = { ...L.CAMS, deskR: fit(R.desk, [720, 280, 1820, 860]) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E3, E11, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
// 不支持 opts.scale 的物件：绕地面点缩放，并换算 anchors（SEGBASE 常见坑 1）
const putW = (key, o, obj, k, dy = 0) => {
  const [gx, gy] = at(o);
  put(key, o, obj, dy, { wrap: (s) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${s}</g>` });
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  for (const n of Object.keys(A[key])) {
    const v = A[key][n];
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = sc(v);
    else if (Array.isArray(v) && Array.isArray(v[0])) A[key][n] = v.map(sc);
  }
};
const vit = (key, o, plate, size, inner) => put(key, o, E2.vitrine(o, { id: key, ...size, plate, inner: inner ? E2.liftSvg(inner, E2.VITRINE_FLOOR) : undefined }));
const VA = { w: 300, d: 220, h: 260 }, VC = { w: 420, d: 300, h: 280 }, VF = { w: 260, d: 200, h: 240 };
const plate = (key, o, text, extra = {}) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text, ...extra }));

// 参观路线（地面虚线箭头，最先画）
{
  const [x0, y0] = Wp(L.ROUTE_U[0], 0), [x1, y1] = Wp(L.ROUTE_U[1], 0);
  add({ u: 0, v: 0 }, `<g id="route"><path d="M${x0} ${y0}L${x1} ${y1}" stroke="#2aa3c9" stroke-width="7" stroke-dasharray="26 18" fill="none" opacity="0.75"/>
    <path d="M${x1} ${y1}l-34 -2l12 16z" fill="#2aa3c9" opacity="0.75"/></g>`, -1e6);
}
// A–E：全景用的远景展柜和展牌（远看只需认得出“展馆”）
["The DAO · 2016", "Curve · 2023", "Penpie · 2024"].forEach((p, i) =>
  vit(`vA${i}`, L.A_VIT[i], p, VA, E1.vending(L.A_VIT[i], { id: `vmA${i}`, sign: ["The DAO", "Curve", "Penpie"][i], scale: 0.45 }).svg));
plate("sgA", L.A_SIGN, "事故档案馆");
putW("towerB", L.B_TOWER, O.tower(L.B_TOWER, { id: "towerB" }), 0.6);
["以太坊与多链", "BNB Chain", "TRON", "Mantle", "代码之外", "NFT 与 GameFi"].forEach((tx, i) => plate(`wB${i}`, L.B_WALLS[i], tx, { size: 28 }));
[["vC1", L.C1_VIT, "Fei Rari · 2022"], ["vC2", L.C2_VIT, "Nomad · 2022"], ["vC3", L.C3_VIT, "Cream · 2021"],
 ["vD4", L.D4_VIT, "Euler · 2023"], ["vD5", L.D5_VIT, "Uranium · 2021"], ["vD6", L.D6_VIT, "Bybit · 2025"], ["vE7", L.E7_VIT, "Ronin · 2022"]]
  .forEach(([k, o, p]) => vit(k, o, p, VC, E1.vending(o, { id: `vm${k}`, sign: p.split(" · ")[0], scale: 0.55 }).svg));
L.E8_DESKS.forEach((o, i) => putW(`dE${i}`, o, O.desk(o, { id: `dE${i}` }), 0.5));
put("dataE", L.E8_DATA, O.ledgerBook(L.E8_DATA, { id: "dataE", scale: 0.5, title: "用户数据" }));
L.E8_PAIR.forEach((o, i) => put(`prE${i}`, o, O.person(o, { id: `prE${i}`, role: "engineer", scale: 0.45 })));
putW("keyE", L.E8_KEY, O.key(L.E8_KEY, { id: "keyE" }), 0.5);
// E · NFT 与 GameFi 墙（seg5 结尾画面，段首要在）
plate("sgN", L.EN_SIGN, "NFT 与 GameFi");
putW("phN", L.EN_PHONE, O.phone(L.EN_PHONE, { id: "phN" }), 0.5);
putW("uiN", L.EN_UI, O.browserWin(L.EN_UI, { id: "uiN", title: "前端" }), 0.35);
put("mintN", L.EN_MINT, E11.mintPress(L.EN_MINT, { id: "mintN", scale: 0.5 }));
put("inN", L.EN_INSIDER, O.person(L.EN_INSIDER, { id: "inN", scale: 0.4 }));

// F · 复盘台
putW("deskF", L.F_DESK, O.desk(L.F_DESK, { id: "deskF" }), 0.7);
put("docF", L.F_DOC, O.doc(L.F_DOC, { id: "docF", standing: true, w: 200, h: 280, title: "复盘",
  lines: ["摘要 · 损失", "时间线", "直接 · 根本原因", "哪个关口能拦", "被打破的不变量", "防御清单", "资料来源"] }));
putW("chF", L.F_CHAIN, O.chain(L.F_CHAIN, { id: "chF", n: 3, labels: ["T0", "T1", "T2"] }), 0.5);
putW("fsF", L.F_STACK, E3.frameStack(L.F_STACK, { id: "fsF", n: 3, labels: ["交易", "合约 A", "合约 B"], filled: 0 }), 0.6);
put("magF", L.F_MAG, O.magnifier(L.F_MAG, { id: "magF" }));
put("swF", L.F_FORK, E16.forkSwitch(L.F_FORK, { id: "swF", scale: 0.6, thrown: true, labels: ["本地 / 分叉", "主网"] }));
put("woodF", L.F_WOOD, E1.signBoard(L.F_WOOD, { id: "woodF", style: "wood", text: "事件库 = 线索", size: 24 }));
plate("sgF", L.F_SIGN, "复盘台");
vit("vitF", L.F_VIT, "新漏洞？", VF);
// 地面区牌 F
{
  const [x, y] = at(L.F_TAG);
  add(L.F_TAG, `<g transform="translate(${x},${y}) matrix(0.819,-0.287,0.574,0.41,0,0)"><rect x="-130" y="-34" width="260" height="68" rx="10" fill="#fffdf8" stroke="#2aa3c9" stroke-width="3"/>
    <text x="0" y="12" text-anchor="middle" font-size="34" font-weight="800" fill="#17809f" font-family="Noto Sans SC">F · 复盘台</text></g>`, -1e5);
}
// 八枚模式徽章（原生 SVG）：复盘台上方一行 + 空展柜旁一行
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
const badge = (cx, cy, r, i) => `<circle cx="${cx}" cy="${cy + 4}" r="${r}" fill="#000" opacity="0.12"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${i < 5 ? "#1d93ba" : "#1c1c1c"}" stroke="#ffffff" stroke-width="${r * 0.12}"/>
  <text x="${cx}" y="${cy + r * 0.36}" text-anchor="middle" font-size="${r * 1.05}" font-weight="900" fill="#ffffff">${NUM[i]}</text>`;
{
  const [gx, gy] = at(L.F_BADGES);
  for (let i = 0; i < 8; i++) add(L.F_BADGES, S.hid(`bdg${i}`, badge(gx - 350 + 100 * i, gy - 35, 34, i)), 1);
  const [hx, hy] = at(L.F_BADGES2);
  for (let i = 0; i < 8; i++) add(L.F_BADGES2, S.hid(`bdh${i}`, badge(hx - 262 + 75 * i, hy - 30, 27, i)), 1);
}
const BADGE_ROW = up(at(L.F_BADGES), 40);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-t0", [A.chF.blocks[0][0] - 50, A.chF.blocks[0][1]], "T0 引入", "lab-cs lab-sm", "r");
lb("lb-t1", up(A.chF.blocks[1], 70), "T1 攻击", "lab-rs lab-sm");
lb("lb-t2", [A.chF.blocks[2][0] + 50, A.chF.blocks[2][1]], "T2 响应", "lab-gs lab-sm", "l");
lb("lb-fs", up(A.fsF.top, 10), "调用树", "lab-cs lab-sm");
lb("lb-pace", [at(L.F_STACK)[0] + 120, at(L.F_STACK)[1] + 40], "示例节奏", "lab-g lab-sm", "l");
lb("lb-sw", up(A.swF.top, 8), "本地 / 分叉环境", "lab-gs lab-sm");
lb("lb-new", up(A.vitF.top, 14), "新漏洞？ 还没有展品", "lab-rs lab-sm");
lb("lb-old", [at(L.F_BADGES2)[0] + 315, at(L.F_BADGES2)[1] - 30], "只认得出旧模式", "lab-g lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const TC = { x: 60, y: 300, w: 580 };
const tpl = codeCard("tpl", { ...TC, head: "复盘模板", rows: ["一句话摘要 · 损失 · 是否追回", "时间线 · 引入 · 攻击 · 响应", "直接原因 · 根本原因", "哪个关口本可以拦住",
  "被打破的不变量", "防御清单", "资料来源"] });
S.curve("cv-doc", [TC.x + TC.w + 4, codeRowY(TC.y, 0)], S.scr("deskR", A.docF.center), { color: "#2aa3c9" });
const roleIcons = {
  badges: NUM.map((n, i) => `<span class="rb" style="background:${i < 5 ? "#1d93ba" : "#1c1c1c"}">${n}</span>`).join(""),
  key: `<svg width="64" height="40" viewBox="0 0 64 40"><circle cx="16" cy="20" r="13" fill="#d9a441" stroke="#a87a22" stroke-width="2.5"/><circle cx="13" cy="20" r="5" fill="#fffdf8"/>
    <path d="M29 17h30v6h-6v7h-5v-7h-5v5h-5v-5h-9z" fill="#d9a441" stroke="#a87a22" stroke-width="2"/></svg>`,
  lock: `<svg width="48" height="52" viewBox="0 0 48 52"><path d="M12 22v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#1d93ba" stroke-width="5"/><rect x="5" y="21" width="38" height="28" rx="6" fill="#1d93ba"/>
    <circle cx="24" cy="35" r="9" fill="#fffdf8"/><path d="M24 29v6l4 3" stroke="#1d93ba" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
};
// 全景（k 0.088）里的标记一律走屏幕层：A 三只展柜 → 徽章行 的青蓝虚线
const BW = S.scr("wide", BADGE_ROW);
L.A_VIT.forEach((o, i) => S.curve(`cv-ab${i}`, S.scr("wide", up(at(o), 30)), BW, { color: "#2aa3c9", c1: [S.scr("wide", at(o))[0] + 300, 520 + 20 * i], c2: [BW[0] - 400, 520] }));

const html = tpl
  + ck("ck-direct", "代码哪一行", { x: 60, y: 780, w: 280, kind: "r", icon: "直" })
  + ck("ck-root", "流程哪一环", { x: 360, y: 780, w: 280, kind: "c", icon: "根" })
  + ck("ck-src", "金额 · 根因 回一手资料核对", { x: 66, y: 796, w: 574, kind: "g" })
  + kw("kw-today", `今天就能做一件事${gtag("解读")}`, { x: 60, y: 300, size: 36 })
  + `<div class="rcard hide" id="rc-dev"><div class="rc-h">写代码的人</div><div class="rc-t">拿八个识别信号 查最近的改动</div><div class="rc-i">${roleIcons.badges}</div></div>`
  + `<div class="rcard hide" id="rc-ops" style="top:640px"><div class="rc-h">管资产的人</div><div class="rc-t">钥匙几把 · 有没有时间锁</div><div class="rc-i">${roleIcons.key}<span class="rc-x">×?</span>${roleIcons.lock}<span class="rc-x">?</span></div></div>`
  + `<div class="qcard hide" id="qc"><div class="q-row" id="q1">修过的漏洞，为什么回来？</div>
      <div class="q-ans" id="qa1"><span class="q-tag" id="qa1-0">新链</span><span class="q-tag" id="qa1-1">新分叉</span><span class="q-tag" id="qa1-2">新版本</span><span class="q-tag" id="qa1-3">新组合</span><span class="q-red" id="qa1-r">检查没跟上</span>${gtag("解读", "vertical-align:0")}</div>
      <div class="q-row" id="q2">读旧事故，能提前认出下一起吗？</div>
      <div class="q-ans" id="qa2"><span class="q-ok">能</span>前提：记住模式和信号</div></div>`
  + `<div class="sb-chip hide" id="ch-old" style="left:70px;top:870px">三起旧事故</div>`
  + `<div class="sb-chip hide" id="ch-pat" style="left:${Math.round(Math.min(BW[0] - 80, 1700))}px;top:${Math.round(BW[1] + 36)}px">八种模式</div>`
  + kw("kw-close", `同样的错误，会<b>换个名字</b>再来`, { x: 560, y: 150, size: 44, accent: "#e0453a" });
const css = `
  .rcard { position:absolute; left:60px; top:400px; width:580px; background:#fffdf8; border-radius:16px; padding:16px 26px 18px; box-shadow:0 10px 24px rgba(70,60,40,.12); border-left:8px solid #1d93ba; }
  .rc-h { font-size:38px; font-weight:900; } .rc-t { font-size:28px; font-weight:700; color:#4a463f; margin-top:6px; }
  .rc-i { display:flex; align-items:center; gap:8px; margin-top:12px; } .rb { display:inline-flex; width:46px; height:46px; border-radius:50%; color:#fff; font-size:28px; font-weight:900; align-items:center; justify-content:center; }
  .rc-x { font-size:30px; font-weight:900; color:#1d93ba; margin-right:18px; }
  .qcard { position:absolute; left:460px; top:110px; width:1000px; background:#fffdf8; border-radius:18px; padding:18px 34px 22px; box-shadow:0 12px 28px rgba(70,60,40,.14); }
  .q-row { font-size:44px; font-weight:900; } .q-ans { display:flex; align-items:center; gap:12px; height:62px; font-size:32px; font-weight:800; color:#1c1c1c; }
  .q-tag { background:#1d93ba; color:#fff; border-radius:10px; padding:2px 14px 4px; font-size:28px; }
  .q-red { background:#e0453a; color:#fff; border-radius:10px; padding:2px 14px 4px; font-size:28px; }
  .q-ok { background:#1f9d55; color:#fff; border-radius:10px; padding:2px 14px 4px; font-size:28px; }
  .sb-chip { position:absolute; background:#fffdf8; border:3px solid #2aa3c9; color:#17809f; border-radius:12px; padding:4px 16px 6px; font-size:30px; font-weight:900; }
  .hide { opacity:0; }`;
// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  sum: w("摘要", 1), tl: w("时间线", 2), intro: w("引入", 2), atk: w("攻击交易", 2), resp: w("发现", 2),
  direct: w("直接原因", 3), root: w("根本原因", 3), gate: w("关口", 4), inv: w("不变量", 4), list: w("防御清单", 4),
  hash: w("交易哈希", 5), tree: w("调用树", 5), cmp: w("对照复盘", 5), clue: w("线索", 6), src: w("一手资料", 6), local: w("本地", 6),
  dev: w("写代码的人", 8), sig: w("八个识别信号", 8), ops: w("管资产的人", 9), keys: w("钥匙", 9), lock: w("时间锁", 9),
  env: w("环境变了", 11), n0: w("新链", 11), n1: w("新分叉", 11), n2: w("新版本", 11), n3: w("新组合", 11), lag: w("没跟上", 11),
  pre: w("前提", 12), old: w("旧模式", 13), nov: w("新漏洞", 13), same: w("同样的错误", 14),
};
const t = (x) => f(x);
// 放大镜移到链的 T1 格上方
const MAGD = [A.chF.blocks[1][0] - A.magF.lens[0], A.chF.blocks[1][1] - 70 - A.magF.lens[1]];

S.build({
  cam0: "nftE", sub: "认出它，靠的是模式",
  grid: { u0: -5300, u1: 27300, v0: -16800, v1: 16600 }, box: [-2100, -9500, 22100, 12600],   // 盖住本段镜头 nftE · deskR · wide · vitrineF（nftE = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "不变量", d: "任何情况下都必须成立的条件", at: w("不变量", 4) },
    { id: "t1", t: "调用树", d: "一笔交易里各层合约调用的展开图", at: w("调用树", 5) },
  ],
  end: { title: "事故案例库", line: "同样的错误，会换个名字再来，认出它，靠的是模式", next: "2026 年的签名路径安全", at: LS[15], nextAt: w("下一集", 15) },
  js: `
      // SHOTS ———— ends static on CAMS.wide
      // ===== L0 认出模式之后，还要会写复盘：右移到复盘台，八枚徽章从左边各区飞回
      cam(${t(LS[0])}, "deskR", 2.4, "power2.inOut");
      [0,1,2,3,4,5,6,7].forEach((i) => tl.fromTo("#bdg" + i, { x: -900 + i * 40, y: 260, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, ${t(LS[0] + 1.4)} + i * 0.12));
      // ===== L1 一句话摘要 · 损失 · 是否追回
      pop("#tpl", ${t(LS[1])}); draw("cv-doc", ${t(LS[1] + 0.3)}); hot("#tpl-r0", ${t(TM.sum)}, "#d7eef6");
      // ===== L2 时间线：T0 引入 / T1 攻击 / T2 响应
      hot("#tpl-r1", ${t(TM.tl)}, "#d7eef6"); out("#cv-doc", ${t(TM.tl + 0.6)});
      pop("#lb-t0", ${t(TM.intro)}); pop("#lb-t1", ${t(TM.atk)}); pop("#lb-t2", ${t(TM.resp)});
      // ===== L3 根因两层：两个小签
      hot("#tpl-r2", ${t(LS[3])}, "#d7eef6"); pop("#ck-direct", ${t(TM.direct)}); pop("#ck-root", ${t(TM.root)});
      // ===== L4 关口 · 不变量 · 防御清单
      hot("#tpl-r3", ${t(TM.gate)}, "#d7eef6"); hot("#tpl-r4", ${t(TM.inv)}, "#d7eef6"); hot("#tpl-r5", ${t(TM.list)}, "#d7eef6");
      // ===== L5 练习：只看交易哈希，放大镜到 T1，调用树层层亮
      out("#ck-direct, #ck-root", ${t(LS[5] - 0.2)}); out("#lb-t0, #lb-t2", ${t(TM.hash - 0.2)});
      tl.to("#magF", { x: ${f(MAGD[0])}, y: ${f(MAGD[1])}, duration: 0.9, ease: "power2.inOut" }, ${t(TM.hash)});
      [0,1,2].forEach((i) => X3.push(tl, "fsF", i, ${t(TM.tree + 0.2)} + i * 0.45)); pop("#lb-fs", ${t(TM.tree)});
      pop("#lb-pace", ${t(TM.cmp)});
      // ===== L6 事件库只是线索；回一手资料；本地 / 分叉环境
      out("#lb-pace, #lb-t1", ${t(LS[6] - 0.2)}); bump("#woodF", ${t(TM.clue)}, 1.08, 1);
      hot("#tpl-r6", ${t(TM.src)}, "#d7f0e0"); pop("#ck-src", ${t(TM.src)});
      X16.flip(tl, "swF", ${t(TM.local)}, false); pop("#lb-sw", ${t(TM.local + 0.6)});
      // ===== L7 今天就能做一件事（解读）
      out("#tpl, #ck-src", ${t(LS[7] - 0.2)}); pop("#kw-today", ${t(LS[7] + 0.1)});
      // ===== L8 写代码的人：八个识别信号
      pop("#rc-dev", ${t(TM.dev)}); bump("#rc-dev .rc-i", ${t(TM.sig)}, 1.06, 1); bump("#bdg0, #bdg1, #bdg2, #bdg3, #bdg4, #bdg5, #bdg6, #bdg7", ${t(TM.sig)}, 1.1, 1);
      // ===== L9 管资产的人：钥匙几把 · 时间锁
      pop("#rc-ops", ${t(TM.ops)});
      // ===== L10 回到开头的问题：拉到全景，题卡回到中央
      out("#kw-today, #rc-dev, #rc-ops, #lb-sw, #lb-fs", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "wide", 1.6, "power2.inOut"); pop("#qc", ${t(LS[10] + 0.6)});
      // ===== L11 环境变了：四个小标签 + 检查没跟上（解读）
      tl.set("#qa1 > *", { opacity: 0 }, 0); tl.set("#qa2", { opacity: 0 }, 0);
      [${t(TM.n0)}, ${t(TM.n1)}, ${t(TM.n2)}, ${t(TM.n3)}].forEach((tt, i) => pop("#qa1-" + i, tt, 0.25));
      pop("#qa1-r", ${t(TM.lag)}); fadeIn("#qa1 .sb-gtag", ${t(TM.lag + 0.3)}, 0.3);
      // ===== L12 能，前提：记住模式和信号；A 三柜 → 徽章行 青蓝虚线（屏幕层）
      fadeIn("#qa2", ${t(TM.pre - 0.3)}, 0.4);
      [0,1,2].forEach((i) => draw("cv-ab" + i, ${t(TM.pre)} + i * 0.2)); pop("#ch-old", ${t(TM.pre + 0.2)}); pop("#ch-pat", ${t(TM.pre + 0.6)});
      // ===== L13 边界：推到空展柜，旁边八枚徽章 + 只认得出旧模式
      out("#qc, #cv-ab0, #cv-ab1, #cv-ab2, #ch-old, #ch-pat", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "vitrineF", 1.6, "power2.inOut");
      [0,1,2,3,4,5,6,7].forEach((i) => pop("#bdh" + i, ${t(TM.old - 0.6)} + i * 0.08, 0.25)); pop("#lb-old", ${t(TM.old + 0.2)});
      bump("#vitF", ${t(TM.nov)}, 1.04, 1); pop("#lb-new", ${t(TM.nov + 0.3)});
      // ===== L14 同样的错误会换个名字再来：拉回全景，收束句
      out("#lb-old, #lb-new", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "wide", 1.6, "power2.inOut"); pop("#kw-close", ${t(LS[14] + 0.8)});
      // ===== L15 结束卡
      out("#kw-close", ${t(LS[15] - 0.3)});
`,
});
