// ep28/seg1「① 换个名字再来」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.daoA（BRIEF）。
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
import { ZONE } from "../../../kit/segbase.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.hallA

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
const CE = 0.866, VF = E2.VITRINE_FLOOR, RED = "#e0453a";
/** scale k around ground point o, lift by `lift` world units; stores rescaled anchors in A[key], returns wrapped svg */
const mk = (key, o, r, k = 1, lift = 0) => {
  const [gx, gy] = Wp(o.u, o.v, 0), ly = -lift * CE, pt = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k + ly];
  A[key] = {};
  for (const [n, p] of Object.entries(r.anchors)) A[key][n] = Array.isArray(p) && typeof p[0] === "number" ? pt(p) : Array.isArray(p) && Array.isArray(p[0]) ? p.map(pt) : p;
  return `<g transform="translate(${f(gx)},${f(gy + ly)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g>`;
};
const wrapK = (o, k) => { const [gx, gy] = at(o); return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] }; };

// 三只展柜，柜里各一台售货机（0.45，抬到柜内地面）
const NAMES = ["The DAO", "Curve", "Penpie"];
L.A_VIT.forEach((o, i) => {
  const vm = mk("vm" + i, L.A_VEND[i], E1.vending(L.A_VEND[i], { id: "vm" + i, sign: NAMES[i], scale: L.A_VEND[i].scale }), 1, VF);
  put("vit" + i, o, E2.vitrine(o, { id: "vit" + i, w: 300, d: 220, h: 260, plate: NAMES[i], inner: vm }));
});
// DAO 柜：账本、回调臂、币
put("led", L.A_LEDGER, O.ledgerBook(L.A_LEDGER, { id: "led", scale: L.A_LEDGER.scale }));
put("arm", L.A_ARM, E4.callbackArm(L.A_ARM, { id: "arm", scale: L.A_ARM.scale, target: A.vm0.coinSlot }));
const COINS = [...L.A_COINS, { u: L.A_COINS[1].u + 60, v: L.A_COINS[1].v + 40, scale: 0.4 }];   // 第三枚 = 回调里再取的一次
COINS.forEach((o, i) => put("coin" + i, o, E7.oddCoin(o, { id: "coin" + i, scale: o.scale }), 0, { grow: true }));
// Curve 柜：立杆上的重入锁 + Vyper 编译器手册
const HZ = 90, [hx, hy] = at(L.A_HASP);
add(L.A_HASP, `<ellipse cx="${hx}" cy="${hy}" rx="26" ry="11" fill="#7d838c"/><rect x="${hx - 5}" y="${hy - HZ * CE}" width="10" height="${HZ * CE}" fill="#9aa0a8" stroke="#5d6269" stroke-width="1.5"/>`, -2);
put("hasp", L.A_HASP, E4.hasp(L.A_HASP, { id: "hasp", z: HZ, scale: L.A_HASP.scale, locked: false }));
{ const W = wrapK(L.A_MANUAL, L.A_MANUAL.scale);
  put("man", L.A_MANUAL, E3.manual(L.A_MANUAL, { id: "man", title: "Vyper 编译器", sub: "编译器", pageTitle: "重入锁", pageText: "实现有误" }), 0, { wrap: W.wrap });
  for (const n of Object.keys(A.man)) if (Array.isArray(A.man[n]) && typeof A.man[n][0] === "number") A.man[n] = W.sc(A.man[n]); }
// Penpie 柜：按钮面板（存入 有锁 / 领奖 红虚线空锁框）
{ const W = wrapK(L.A_PANEL, L.A_PANEL.scale);
  put("pan", L.A_PANEL, E5.funcPanel(L.A_PANEL, { id: "pan", buttons: [{ name: "存入", guard: "card" }, { name: "领奖", guard: "broken" }], title: "PENPIE · FUNCTIONS" }), 0, { wrap: W.wrap });
  for (const n of Object.keys(A.pan)) { const p = A.pan[n]; if (Array.isArray(p) && typeof p[0] === "number") A.pan[n] = W.sc(p); else if (Array.isArray(p) && Array.isArray(p[0])) A.pan[n] = p.map(W.sc); } }
// 入口牌（L12 淡入）
put("sgnA", L.A_SIGN, E1.signBoard(L.A_SIGN, { id: "sgnA", style: "plate", text: "事故档案馆", size: 32 }), 0, { grow: true });

// 点阵：每点约 100 万美元，10 个一行
const DOTN = [60, 70, 27], DP = L.A_DOTS.map((o) => at(o));
DOTN.forEach((n, k) => { const [dx, dy] = DP[k], c = [];
  for (let i = 0; i < n; i++) c.push(`<circle id="d${k}-${i}" cx="${dx + 14 + (i % 10) * 28}" cy="${dy + 11 + Math.floor(i / 10) * 22}" r="9" fill="${RED}" opacity="0"/>`);
  add(L.A_DOTS[k], `<g id="dots${k}">${c.join("")}</g>`, -600); });
// 地面区牌
{ const [tx, ty] = at(L.A_TAG);
  add(L.A_TAG, `<g transform="translate(${tx},${ty}) skewY(-19.3)"><rect x="-100" y="-22" width="200" height="48" rx="10" fill="#f8f5ef" stroke="#2aa3c9" stroke-width="3"/><text x="0" y="12" text-anchor="middle" font-size="26" font-weight="800" fill="#1d93ba">A · 门厅</text></g>`, -50); }
// 回调后：账本红色虚线框
{ const q = L.rect(L.A_LEDGER, "ledgerBook");
  add(L.A_LEDGER, S.hid("ledFr", `<rect x="${q[0] - 12}" y="${q[1] - 12}" width="${q[2] - q[0] + 24}" height="${q[3] - q[1] + 24}" rx="12" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10"/>`), 300); }
// 锁扣：绿闪环 / 裂口 + 红叉；手册 → 锁扣红虚线
const LK = A.hasp.lock ?? A.hasp.center;
add(L.A_HASP, S.hid("haspOk", `<circle cx="${LK[0]}" cy="${LK[1]}" r="34" fill="rgba(31,157,85,0.18)" stroke="#1f9d55" stroke-width="5"/>`), 300);
add(L.A_HASP, S.hid("haspBrk", `<circle cx="${LK[0]}" cy="${LK[1]}" r="36" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="10 7"/>
  <path d="M${LK[0] - 4} ${LK[1] - 30}l9 14l-10 10l12 12l-6 14" fill="none" stroke="${RED}" stroke-width="4" stroke-linejoin="round"/>
  <g transform="translate(${LK[0] + 40},${LK[1] - 34})"><circle r="17" fill="#fff" stroke="${RED}" stroke-width="4"/><path d="M-7 -7L7 7M7 -7L-7 7" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></g>`), 310);
const MP = A.man.page ?? A.man.center;
add(L.A_HASP, S.hid("manLink", `<path d="M${MP[0]} ${MP[1]} C ${MP[0] + 120} ${MP[1] - 40}, ${LK[0] - 140} ${LK[1] + 40}, ${LK[0] - 34} ${LK[1]}" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/><circle cx="${MP[0]}" cy="${MP[1]}" r="7" fill="${RED}"/>`), 305);
// 串联红线：穿过三只展柜（玻璃中段高度）+ 三枚同样的红色徽章 ①
const LZ = 130, HL = L.A_VIT.map((o) => Wp(o.u, o.v, LZ));
add(L.A_VIT[2], S.hid("hallLine", `<path d="M${HL[0][0] - 170} ${HL[0][1]} L${HL[2][0] + 170} ${HL[2][1]}" fill="none" stroke="${RED}" stroke-width="6" stroke-dasharray="16 11" stroke-linecap="round"/>` +
  HL.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${RED}"/>`).join("")), 800);
const BADGE = (x, y) => `<g transform="translate(${x},${y})"><circle r="34" fill="${RED}" stroke="#fff" stroke-width="4"/><circle r="27" fill="none" stroke="#fff" stroke-width="2" opacity="0.7"/><text y="13" text-anchor="middle" font-size="38" font-weight="900" fill="#fff">①</text></g>`;
L.A_VIT.forEach((o, i) => { const [bx, by] = Wp(o.u, o.v, 0); add(o, S.hid("bdg" + i, BADGE(bx, by - 392)), 820); });
// 参观路线（地面 v = 0 一段，指向入口牌）
{ const r0 = Wp(1000, 0), r1 = Wp(1760, 0), ang = Math.atan2(r1[1] - r0[1], r1[0] - r0[0]) * 180 / Math.PI;
  add(L.A_SIGN, S.hid("route", `<path d="M${r0[0]} ${r0[1]} L${r1[0]} ${r1[1]}" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="18 12" stroke-linecap="round" fill="none"/>
    <path d="M0 0 L-24 -12 L-24 12 Z" fill="#2aa3c9" transform="translate(${r1[0]},${r1[1]}) rotate(${ang})"/>`), -500); }

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const VT = L.A_VIT.map((o) => Wp(o.u, o.v, 300));
lb("lb-dots0", [DP[0][0] + 300, DP[0][1] + 64], "The DAO · 2016<br>约 6000 万美元", "lab-r lab-sm", "l");
lb("lb-dots1", [DP[1][0] + 300, DP[1][1] + 74], "Curve · 2023<br>约 7000 万美元", "lab-r lab-sm", "l");
lb("lb-dots2", [DP[2][0] + 300, DP[2][1] + 36], "Penpie · 2024<br>约 2700 万美元", "lab-r lab-sm", "l");
lb("lb-s1", [VT[0][0] + 175, VT[0][1] + 10], "① 转账", "lab-r lab-sm", "l");
lb("lb-s2", [VT[0][0] + 175, VT[0][1] + 110], "→ ② 更新余额", "lab-g lab-sm", "l");
lb("lb-led", up(A.led.top, 6), "余额 100", "lab-cs lab-sm");
lb("lb-led2", up(A.led.top, 6), "余额 100 · 还没减", "lab-r lab-sm");
lb("lb-arm", [at(L.A_ARM)[0] - 30, at(L.A_ARM)[1] + 30], "回调", "lab-rs lab-sm", "t");
lb("lb-hasp", [LK[0] + 40, LK[1] - 10], "重入锁", "lab-cs lab-sm", "l");
lb("lb-hasp2", [LK[0] + 40, LK[1] - 10], "锁实现错了", "lab-r lab-sm", "l");
lb("lb-man", [at(L.A_MANUAL)[0], at(L.A_MANUAL)[1] + 40], "Vyper 编译器", "lab-ink lab-sm", "t");
const RD1 = A.pan.readers?.[1] ?? A.pan.top;
lb("lb-pan0", [at(L.A_PANEL)[0] - 40, at(L.A_PANEL)[1] + 80], "存入 · 有锁", "lab-gs lab-sm", "t");
lb("lb-pan1", [RD1[0] + 60, RD1[1] - 70], "领奖 · 没有锁", "lab-r lab-sm", "b");
lb("lb-hall", [(HL[1][0] + HL[2][0]) / 2, HL[1][1]], "先交互 → 后记账", "lab-r", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const SRC_TOP = ZONE.event.top + 150;
const html =
  evt("ev0", "<b>The DAO</b><br>2016 年 6 月 · 以太坊") + evt("src0", "来源：公开报道", { color: "#8a857c", top: SRC_TOP }) +
  evt("ev1", "<b>Curve</b><br>2023 年 7 月 · 以太坊", { top: ZONE.event.top + 3 }) + evt("src1", "来源：公开报道", { color: "#8a857c", top: SRC_TOP + 3 }) +
  evt("ev2", "<b>Penpie</b><br>2024 年 9 月 · 以太坊", { top: ZONE.event.top + 6 }) + evt("src2", "来源：公开报道", { color: "#8a857c", top: SRC_TOP + 6 }) +
  `<div class="qz hide" id="quiz"><div id="qz1" class="hide">修过的漏洞，为什么回来<i>?</i></div><div id="qz2" class="hide">读旧事故，能提前认出下一起吗<i>?</i></div></div>` +
  kw("kw-3", `三种写法 · <b>同一个错误</b> ${gtag("解读")}`, { x: 60, y: 790, size: 34, accent: "#e0453a" });
const css = `
  .qz { position: absolute; left: 470px; top: 116px; width: 980px; background: #ffffff; border-radius: 18px; border: 3px solid #1c1c1c; padding: 14px 30px 18px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); font-weight: 900; font-size: 38px; color: #1c1c1c; line-height: 1.45; }
  .qz-h { display: inline-block; background: #e0453a; color: #fff; font-size: 22px; padding: 2px 14px; border-radius: 14px; margin-bottom: 4px; }
  .qz i { font-style: normal; color: #e0453a; margin-left: 6px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  loss0: w("6000", 0), xfer: w("先转账", 1), upd: w("后更新余额", 1), out: w("转出去", 2), not: w("还没减", 2),
  cb: w("回调", 3), again: w("再取一次", 3), loss1: w("7000", 4), lock: w("重入锁", 5), comp: w("编译器", 6), wrong: w("实现错了", 6),
  loss2: w("2700", 7), nolock: w("没有加锁", 8), same: w("同一个错误", 9), ci: w("先交互", 9), back: w("一再回来", 10), next: w("下一起", 11), hall: w("档案馆", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "daoA", sub: "三个名字，同一个错误",
  grid: { u0: -2900, u1: 3300, v0: -3400, v1: 2700 }, box: [-2400, -1200, 4700, 2000],   // 盖住本段镜头 daoA · curveA · penpieA · hallA（daoA = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "回调", d: "收款时自动执行的对方合约代码", at: w("回调", 3) },
    { id: "t1", t: "重入锁", d: "防止函数执行中被再次进入的锁", at: w("重入锁", 5) },
    { id: "t2", t: "编译器", d: "把源码翻译成链上字节码的程序", at: w("编译器", 6) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#pan-gap-1", { opacity: 0 }, 0);
      const dots = (k, n, t0, d) => { for (let i = 0; i < n; i++) fadeIn("#d" + k + "-" + i, t0 + i * d, 0.12); };
      // ===== L0 2016 年 6 月，以太坊上的 The DAO 被攻击，损失约 6000 万美元。
      pop("#lb-led", 1.5); pop("#ev0", ${t(LS[0] + 0.3)}); pop("#src0", ${t(LS[0] + 0.7)});
      dots(0, 60, ${t(TM.loss0 - 0.6)}, 0.025); pop("#lb-dots0", ${t(TM.loss0 + 1.0)});
      // ===== L1 根因只有一句，先转账，后更新余额。
      out("#src0", ${t(LS[1] - 0.2)}); pop("#lb-s1", ${t(TM.xfer)}); pop("#lb-s2", ${t(TM.upd)});
      // ===== L2 钱已经转出去，账上的余额还没减。
      grow("coin0", ${t(TM.out - 0.3)}); X7.coinFlip(tl, "coin0", ${t(TM.out)}, 1, 0.6);
      grow("coin1", ${t(TM.out + 0.3)}); X7.coinFlip(tl, "coin1", ${t(TM.out + 0.6)}, 1, 0.6);
      bump("#lb-s1", ${t(TM.out)}, 1.12, 1);
      out("#lb-led", ${t(TM.not - 0.25)}, 0.2); pop("#lb-led2", ${t(TM.not)});
      // ===== L3 对方合约在收款的回调里，马上回来，再取一次。
      pop("#lb-arm", ${t(TM.cb - 0.2)}); X4.armPress(tl, "arm", ${t(TM.cb + 0.1)}, { hold: 0.5 });
      grow("coin2", ${t(TM.again)}); X7.coinFlip(tl, "coin2", ${t(TM.again + 0.3)}, 1, 0.6);
      fadeIn("#ledFr", ${t(TM.again + 0.2)}, 0.3); bump("#lb-led2", ${t(TM.again + 0.5)}, 1.12, 1);
      // ===== L4 七年后，2023 年 7 月，Curve 被攻击，损失约 7000 万美元。
      out("#lb-s1, #lb-s2, #lb-arm, #lb-led2, #ledFr, #ev0", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "curveA", 1.4);
      pop("#ev1", ${t(LS[4] + 0.6)}); pop("#src1", ${t(LS[4] + 1.0)});
      dots(1, 70, ${t(TM.loss1 - 0.6)}, 0.022); pop("#lb-dots1", ${t(TM.loss1 + 1.0)});
      // ===== L5 这一次，合约里写了重入锁。
      out("#src1", ${t(LS[5] - 0.2)});
      X4.hasp(tl, "hasp", ${t(TM.lock - 0.1)}, true); pop("#lb-hasp", ${t(TM.lock + 0.3)});
      fadeIn("#haspOk", ${t(TM.lock + 0.6)}, 0.2); out("#haspOk", ${t(TM.lock + 1.2)}, 0.4);
      // ===== L6 可是 Vyper 编译器，把这把锁实现错了。
      pop("#lb-man", ${t(TM.comp - 0.3)}); X3.book(tl, "man", ${t(TM.comp)}, 165, 0.8);
      fadeIn("#manLink", ${t(TM.comp + 0.8)}, 0.4);
      out("#lb-hasp", ${t(TM.wrong - 0.2)}, 0.2); pop("#lb-hasp2", ${t(TM.wrong)}); fadeIn("#haspBrk", ${t(TM.wrong + 0.1)}, 0.3);
      // ===== L7 又过了一年多，2024 年 9 月，Penpie 损失约 2700 万美元。
      out("#lb-man, #lb-hasp2, #manLink, #ev1, #lb-dots0", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "penpieA", 1.4);
      pop("#ev2", ${t(LS[7] + 0.6)}); pop("#src2", ${t(LS[7] + 1.0)});
      dots(2, 27, ${t(TM.loss2 - 0.5)}, 0.04); pop("#lb-dots2", ${t(TM.loss2 + 1.0)});
      pop("#lb-pan0", ${t(LS[7] + 2.4)});
      // ===== L8 它的领奖函数，没有加锁。
      out("#src2", ${t(LS[8] - 0.2)});
      fadeIn("#pan-gap-1", ${t(TM.nolock - 0.4)}, 0.3); flash("#pan-gap-1", ${t(TM.nolock)}, 2, 0.3); pop("#lb-pan1", ${t(TM.nolock)});
      // ===== L9 三个名字，三种写法，其实是同一个错误，先交互，后记账。（关键画面）
      out("#lb-pan0, #lb-pan1, #ev2", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "hallA", 1.6);
      fadeIn("#hallLine", ${t(TM.same - 0.2)}, 0.6); pop("#lb-hall", ${t(TM.ci)});
      [0, 1, 2].forEach((i) => fadeIn("#bdg" + i, ${t(TM.ci + 0.6)}, 0.3)); bump("#bdg0, #bdg1, #bdg2", ${t(TM.ci + 1.0)}, 1.15, 1);
      pop("#kw-3", ${t(TM.same + 0.8)}); bump("#lb-hall", ${t(TM.ci + 1.4)}, 1.12, 1); pop("#lb-dots0", ${t(LS[9] + 1.2)});
      // ===== L10 一个早就修过的漏洞，为什么会换个名字，一再回来？
      out("#kw-3, #lb-dots0, #lb-dots1, #lb-dots2", ${t(LS[10] - 0.2)}); pop("#quiz", ${t(LS[10] + 0.1)}); fadeIn("#qz1", ${t(LS[10] + 0.4)}, 0.3);
      // ===== L11 读旧事故，能不能让我们提前认出下一起？
      fadeIn("#qz2", ${t(LS[11] + 0.1)}, 0.3);
      // ===== L12 带着这两个问题，我们走进一座事故档案馆。
      tl.to("#quiz", { x: 356, y: 4, scale: 0.75, transformOrigin: "100% 0%", duration: 0.8, ease: "power2.inOut" }, ${t(LS[12])});
      fadeIn("#route", ${t(TM.hall - 0.8)}, 0.6); grow("sgnA", ${t(TM.hall - 0.4)});
`,
});
