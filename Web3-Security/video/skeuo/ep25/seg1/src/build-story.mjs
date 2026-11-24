// ep25/seg1「① 37 分钟」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.heistA（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整座追赃城（seg2 L2–L6、L15–L20；seg6 L7–L13 结束卡）
//   heistA       A 被盗现场：热钱包 + 五枚币 + 攻击者 + 暂停闸 + 时间锁 + mETH 机器 + cmETH 份额（seg1 起点 L0–L1；seg3 L1–L4）
//   mintB        B 发行方：两台铸币机 + 攻击者地址牌 + 冻结锁 + 37 分钟钟 + AMM 池 + 点阵（seg1 L2–L12 终点；seg2 起点 L0–L1；seg3 L5–L10）
//   lawB         B 右半法规角：限制令 / 解除冻结 / 公章 / T3 牌 / GENIUS / 6 小时钟，右边缘露出 C 的跨链桥（seg3 L11–L17）
//   exitC        C 出城口：四个出口 + 关卡 + 分散地址 + 国道 + 劫匪（seg2 L7–L14、L21–L22 终点；seg3 起点 L0）
//   counterC     C 交易所柜台 + 风控名单 + 关卡特写（seg3 L18–L20 终点；seg4 起点 L0）
//   chainD       D 链级冻结：链 + 验证者转台 + 多签保险箱 + 安全委员会（seg4 L1–L9）
//   talkD        D 谈判：喊话塔 + 赏金信封 + 归还签 + 点阵（seg4 L10–L15）
//   courtD       D 法院：天平 + 云存储桶 + 私钥 + 沙漏 + 两份文件（seg4 L16–L20 终点；seg5 起点）
//   warE         E 作战室：工位 + 告警灯 + 时钟 + 暂停闸 + 地址清单（seg5 L0–L3、L15–L16）
//   notifyE      E 通知：地址清单 + 五封信 + 五块收件牌 + 登记台（seg5 L4–L6）
//   prepE        E 准备：喊话塔（左）+ 证据保全相机 + 机柜 + 报案 + 安全港盾 + 监控放大镜 + 值守板（seg5 L7–L14、L17 终点；seg6 起点）
//   userE        E 用户角：你 + 手机 + 全新地址 + 新助记词 + 新设备 + 两份记录 + 追回诈骗者（seg6 L0–L6）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.mintB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E7, E8, E11] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (o) => Wp(o.u, o.v);                       // 地面点 → 世界画布坐标
const BACK = { u: 30000, v: -3000 };                 // 纵深最远：路面和资金管垫底
/** 不支持 opts.scale 的物件：绕地面点缩放（并换算 anchors）；hidId 给外层可动 / 隐藏的 <g> */
const wrapK = (key, o, k, hidId) => {
  const [gx, gy] = at(o);
  return {
    wrap: (svg) => { const s = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hidId ? `<g id="${hidId}" opacity="0">${s}</g>` : s; },
    fix: () => { for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } },
  };
};
const T = (x, y, s, txt, fill = "#1c1c1c", extra = "") => `<text x="${f(x)}" y="${f(y)}" font-size="${s}" font-weight="900" text-anchor="middle" fill="${fill}" font-family="inherit"${extra}>${txt}</text>`;

// ---------------------------------------------------------------- 世界物件
// 石板路 + 红色资金管（全片贯穿）
{
  const R = L.ROAD, c = [P({ u: R.u0, v: R.v0 }), P({ u: R.u1, v: R.v0 }), P({ u: R.u1, v: R.v1 }), P({ u: R.u0, v: R.v1 })];
  add(BACK, `<polygon points="${c.map((q) => q.map(f).join(",")).join(" ")}" fill="#dcd8d0" stroke="#c9c3b8" stroke-width="2"/>`, -1);
  put("pipe", BACK, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8, flowColor: "#e0453a" }));
}
// A 被盗现场
put("hs", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hs", variant: "hot", plate: "热钱包", open: 0 }));
{ const [x0, y0, x1, y1] = L.rect(L.HOTSAFE, "safeHot");
  add(L.HOTSAFE, S.hid("hsX", `<rect x="${f(x0 - 12)}" y="${f(y0 - 12)}" width="${f(x1 - x0 + 24)}" height="${f(y1 - y0 + 24)}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`), 200); }
put("atk", L.ATK_A, O.person(L.ATK_A, { id: "atk", role: "attacker", scale: L.ATK_A.scale }), 0, { wrap: (s) => `<g id="atkw" opacity="0">${s}</g>` });
put("sgA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "sgA", style: "plate", text: "被盗现场" }));
// 五枚主角币：从热钱包滚出，沿资金管滚到 B 区路面排成一排（ROW）
const TICK = ["USDT", "USDC", "BTC", "XRP", "SOL"];
const ROW = TICK.map((_, i) => ({ u: 2000 + 110 * i, v: 0 }));     // B 区路面（避开地址牌 / 钟 / 点阵）
const HERO_D = L.HERO.map((o, i) => { const a = P(o), b = P(ROW[i]), s = P(L.HOTSAFE); return { bx: b[0] - a[0], by: b[1] - a[1], sx: s[0] - a[0], sy: s[1] - a[1] + 40 }; });
L.HERO.forEach((o, i) => {
  const [gx, gy] = P(o), k = o.scale;
  put("h" + i, o, E7.oddCoin(o, { id: "h" + i, scale: k }), 0, { wrap: (s) => `<g id="hw${i}" opacity="0">${s}`
    + `<g id="hl${i}" opacity="0"><rect x="${f(gx - 34)}" y="${f(gy + 14)}" width="68" height="26" rx="13" fill="#d4f0f8" stroke="#2aa3c9" stroke-width="2.5"/></g>`
    + T(gx, gy + 34, 17, TICK[i]) + `<g id="qm${i}" opacity="0">${T(gx, gy - 109 * k - 12, 34, "?", "#1d93ba")}</g></g>` });
});
// B 发行方路口
const ISS = [["Tether", "USDT"], ["Circle", "USDC"]];
L.MINT.forEach((o, i) => put("m" + i, o, E11.mintPress(o, { id: "m" + i, scale: o.scale, plate: ISS[i][1], count: "—", pile: 0.4 })));
L.ADDR_B.forEach((o, i) => { const W = wrapK("ad" + i, o, o.scale); put("ad" + i, o, E2.addrPlate(o, { id: "ad" + i, text: "攻击者地址" }), 0, { wrap: W.wrap }); W.fix(); });
L.LOCK_B.forEach((o, i) => { const W = wrapK("lk" + i, o, o.scale, "lkw" + i); put("lk" + i, o, O.padlock(o, { id: "lk" + i }), 0, { wrap: W.wrap }); W.fix(); });
put("ckB", L.CLOCK_B[0], O.clock(L.CLOCK_B[0], { id: "ckB", h: 12, m: 0 }));
{ const c = A.ckB.center; add(L.CLOCK_B[0], S.hid("ckRing", `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="78" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`), 200); }
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm", scale: L.AMM.scale, labelL: "USDT", labelR: "ETH", lvlL: 0.85, lvlR: 0.5 }));
const OUTT = ["ETH", "TRX"];
L.OUTCOIN.forEach((o, i) => {
  const [gx, gy] = P(o);
  put("oc" + i, o, E7.oddCoin(o, { id: "oc" + i, scale: o.scale }), 0, { wrap: (s) => `<g id="ocw${i}" opacity="0">${s}${T(gx, gy + 30, 16, OUTT[i], "#e0453a")}</g>` });
});
// 换走的两枚币：红虚线框 + 红叉
const [o0, o1] = L.OUTCOIN.map(P), XB = [o0[0] - 40, o1[1] - 70, o1[0] + 40, o0[1] + 44];
add({ u: 3800, v: 200 }, S.hid("xbox", `<rect x="${f(XB[0])}" y="${f(XB[1])}" width="${f(XB[2] - XB[0])}" height="${f(XB[3] - XB[1])}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`
  + `<g stroke="#e0453a" stroke-width="6" stroke-linecap="round"><line x1="${f(XB[2] - 8)}" y1="${f(XB[1] - 22)}" x2="${f(XB[2] + 22)}" y2="${f(XB[1] + 8)}"/><line x1="${f(XB[2] + 22)}" y1="${f(XB[1] - 22)}" x2="${f(XB[2] - 8)}" y2="${f(XB[1] + 8)}"/></g>`));
// 资金管上向右的箭头（L12）
{ const ar = [2560, 2660, 2760].map((u) => { const [x, y] = P({ u, v: 0 }), a = P({ u: u + 50, v: 0 }), l = P({ u, v: -40 }), r = P({ u, v: 40 });
    return `<polygon points="${f(a[0])},${f(a[1])} ${f(l[0])},${f(l[1])} ${f(x + (a[0] - x) * 0.35)},${f(y + (a[1] - y) * 0.35)} ${f(r[0])},${f(r[1])}" fill="#e0453a"/>`; });
  add({ u: 2600, v: 0 }, S.hid("arrR", ar.join("")), -2); }
// 点阵（DOTS_B，屏幕平铺圆点）
const [DX, DY] = P(L.DOTS_B);
const dotsG = (n, from, { cols = 27, gap = 19, r = 6, fill = "#2aa3c9", ox = 0, oy = 0, colMajor = false, rows = 2, style } = {}) => {
  const out = [];
  for (let j = 0; j < n; j++) {
    const i = from + j, c = colMajor ? Math.floor(i / rows) : i % cols, rr = colMajor ? i % rows : Math.floor(i / cols);
    const st = style ? style(j) : `fill="${fill}"`;
    out.push(`<circle cx="${f(DX + ox + 8 + c * gap)}" cy="${f(DY + oy + 8 + rr * gap)}" r="${r}" ${st}/>`);
  }
  return out.join("");
};
add(L.DOTS_B, S.hid("dU", dotsG(97, 0)), 40);
add(L.DOTS_B, S.hid("dC", dotsG(82, 97, { fill: "#1d93ba" })), 41);
add(L.DOTS_B, S.hid("dR", dotsG(79, 0, { fill: "#e0453a" })), 42);
add(L.DOTS_B, S.hid("dG", dotsG(27, 0, { cols: 9, gap: 34, r: 12, fill: "#1f9d55", ox: 80, oy: 10 })), 43);
add(L.DOTS_B, S.hid("dBar", dotsG(100, 0, { colMajor: true, rows: 2, gap: 10.2, r: 4.2, oy: 50,
  style: (j) => (j < 44 ? `fill="#1f9d55"` : `fill="none" stroke="#e0453a" stroke-width="1.6"`) })), 44);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-hs", up(A.hs.top, 18), "热钱包 · 被撬开", "lab-rs");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
ISS.forEach(([n, tk], i) => lb("lb-m" + i, up(A["m" + i].top, 8), `${n} · ${tk} 发行方`, "lab-cs lab-sm"));
lb("lb-37", up(A.ckB.top, 10), "37 分钟", "lab-cs");
lb("lb-3", [A.ckB.center[0] + 70, A.ckB.center[1]], "+3 分钟", "lab-cs lab-sm", "l");
lb("lb-4h", up(A.ckB.top, 10), "约 4 小时", "lab-gs");
lb("lb-ok", up(A.lk1.top, 14), "✓ 已冻结", "lab-g lab-sm");
lb("lb-amm", up(A.amm.top, 8), "DEX 换币", "lab-cs lab-sm");
lb("lb-gone", [(XB[0] + XB[2]) / 2, XB[3] + 6], "已换走", "lab-rs lab-sm", "t");
lb("lb-noiss", [(XB[0] + XB[2]) / 2 - 150, XB[1] - 60], "没有发行方", "lab-rs");
const DL = [DX + 540, DY + 40];                          // 点阵右侧的读数标签
lb("lb-dU", DL, "9.711 亿 USDT", "lab-cs", "l");
lb("lb-dC", [DL[0], DL[1] + 95], "8.23 亿 USDC", "lab-cs", "l");
lb("lb-dR", DL, "约 7.86 亿美元 · 冻结前换走", "lab-rs", "l");
lb("lb-dG", DL, "约 27 亿美元 · 约 4 小时", "lab-gs", "l");
lb("lb-dB", [DL[0], DL[1] + 20], "冻结覆盖 约 44%", "lab-gs", "l");
lb("lb-s1", [DX + 260, DY - 6], "1 点 ≈ 1000 万美元", "lab-ink lab-sm");
lb("lb-s2", [DX + 260, DY - 6], "1 点 ≈ 1 亿美元", "lab-ink lab-sm");
lb("lb-s3", [DX + 260, DY + 36], "1 点 = 1% 损失", "lab-ink lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
// L6：两台铸币机的"锁链"停在换走的币前（屏幕层虚线，mintB 静止期间）
const XL = S.scr("mintB", [XB[0] - 30, (XB[1] + XB[3]) / 2]);
[0, 1].forEach((i) => S.curve("cv" + i, S.scr("mintB", A["m" + i].center), XL, { color: "#e0453a" }));
const html = evt("ev0", "Binance · 2026 年 10 月 · 大规模盗窃", { color: "#e0453a" })
  + evt("ev1", `Elliptic 分析 · TRM 分析 ${gtag("第三方分析")}`, { top: 124 })
  + evt("ev2", `Elliptic 分析 ${gtag("第三方分析")}`, { top: 128 })
  + evt("ev3", `TRM 分析 ${gtag("第三方分析")}`, { top: 132 })
  + kw("kw-guess", "<b>先猜</b> 一道题", { x: 760, y: 150, size: 44, accent: "#1d93ba" })
  + kw("kw-q", "发行方冻结 能管到 <b>哪几种</b>？", { x: 120, y: 150, size: 42, accent: "#1d93ba" })
  + `<div class="x-mark hide" id="xm" style="left:${f(XL[0] - 22)}px;top:${f(XL[1] - 30)}px">✕</div>`;
const css = `.x-mark{position:absolute;font-size:44px;font-weight:900;color:#e0453a;line-height:60px}
    #kw-q{transform-origin:100% 0}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  steal: w("盗窃", 0), sweep: w("清扫交易", 1), out1: w("转了出去", 1),
  frz2: w("冻结", 2), frz3: w("冻结", 3), slow: w("慢了一步", 4),
  swap: w("换成", 5), eth: w("ETH", 5), noiss: w("管不到", 6),
  h4: w("4 小时", 7), b27: w("27", 7), p44: w("44%", 8),
  tk: TICK.map((x) => w(x, 10)), which: w("哪几种", 11), gone: w("转走", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "heistA", sub: "37 分钟，还是慢了一步",
  grid: { u0: -2000, u1: 5400, v0: -3900, v1: 3300 }, box: [-1460, -1810, 5430, 2430],   // 盖住本段镜头 heistA / mintB（含上一段终点）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "清扫交易", d: "把被盗资金集中转走的链上交易", at: w("清扫交易", 1) },
    { id: "t1", t: "稳定币", d: "与美元挂钩、由发行方管理的代币", at: w("稳定币", 5) },
  ],
  js: `
      // SHOTS
      const HD = ${JSON.stringify(HERO_D.map((d) => [d.bx, d.by, d.sx, d.sy].map((x) => Math.round(x))))};
      // ===== L0 Binance 遭遇大规模盗窃：热钱包门被撬开 + 红虚线框 + 事件卡
      pop("#ev0", ${t(LS[0] + 0.3)});
      KIT.door(tl, "hs", ${t(TM.steal - 0.6)}, 105, 1.0); fadeIn("#hsX", ${t(TM.steal)}, 0.4); pop("#lb-hs", ${t(TM.steal + 0.3)}, 0.25);
      // ===== L1 五枚币从热钱包滚出，沿资金管向右；攻击者站在一旁
      fadeIn("#atkw", ${t(LS[1])}, 0.4); pop("#lb-atk", ${t(LS[1] + 0.3)}, 0.25);
      HD.forEach((d, i) => {
        tl.fromTo("#hw" + i, { x: d[2], y: d[3], opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, ${t(TM.sweep - 0.4)} + i * 0.22);
        tl.to("#hw" + i, { x: d[0], y: d[1], duration: 3.6, ease: "power1.inOut" }, ${t(TM.out1 - 0.2)} + i * 0.08);
      });
      // ===== L2 右移到 mintB；钟走 37 分钟；Tether 落锁；97 点
      out("#lb-hs, #lb-atk, #ev0", ${t(LS[2] - 0.3)});
      cam(${t(LS[2] - 0.1)}, "mintB", 1.6);
      pop("#lb-m0", ${t(LS[2] + 1.2)}, 0.25); pop("#lb-m1", ${t(LS[2] + 1.35)}, 0.25);
      KIT.clock(tl, "ckB", ${t(LS[2] + 1.2)}, 1.2, 37); pop("#lb-37", ${t(LS[2] + 1.6)}, 0.25);
      pop("#ev1", ${t(LS[2] + 1.6)});
      X11.ram(tl, "m0", ${t(TM.frz2 - 0.5)}, 1, 0.4);
      tl.fromTo("#lkw0", { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }, ${t(TM.frz2)});
      fadeIn("#dU", ${t(TM.frz2 + 0.8)}, 0.5); pop("#lb-s1", ${t(TM.frz2 + 0.9)}, 0.25); pop("#lb-dU", ${t(TM.frz2 + 1.1)}, 0.25); bump("#lb-dU", ${t(TM.frz2 + 2.2)}, 1.12, 1); bump("#lb-m0", ${t(TM.frz2 + 3.0)}, 1.12, 1);
      // ===== L3 Circle 落第二把锁；钟 +3 分钟；点阵加 82 点
      KIT.clock(tl, "ckB", ${t(LS[3] + 0.2)}, 0.6, 3); pop("#lb-3", ${t(LS[3] + 0.3)}, 0.25);
      X11.ram(tl, "m1", ${t(TM.frz3 - 0.5)}, 1, 0.4);
      tl.fromTo("#lkw1", { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }, ${t(TM.frz3)});
      fadeIn("#dC", ${t(TM.frz3 + 0.8)}, 0.5); pop("#lb-dC", ${t(TM.frz3 + 1.0)}, 0.25);
      // ===== L4 绿勾闪一下，随即钟面一圈红虚线
      pop("#lb-ok", ${t(LS[4])}, 0.25); flash("#lb-ok", ${t(LS[4] + 0.3)}, 2); out("#lb-ok", ${t(TM.slow - 0.2)}, 0.3);
      fadeIn("#ckRing", ${t(TM.slow)}, 0.4); bump("#lb-37", ${t(TM.slow + 0.1)}, 1.15, 1);
      // ===== L5 关键画面：USDT 被抽走，换出 ETH / TRX 滚向右边；79 红点；已换走
      out("#ev1", ${t(LS[5] - 0.2)}); pop("#ev2", ${t(LS[5] + 0.2)});
      out("#dU, #dC, #lb-dU, #lb-dC, #lb-3", ${t(LS[5])}, 0.4);
      pop("#lb-amm", ${t(TM.swap - 0.6)}, 0.25);
      X8.poolSwap(tl, "amm", ${t(TM.swap)}, "L", 0.7); X8.poolSwap(tl, "amm", ${t(TM.swap + 0.8)}, "L", 0.7);
      X8.poolLevel(tl, "amm", ${t(TM.swap)}, 0.08, 0.9, 1.6);
      fadeIn("#dR", ${t(TM.swap + 0.3)}, 0.6); pop("#lb-dR", ${t(TM.swap + 0.6)}, 0.25);
      ["#ocw0", "#ocw1"].forEach((s, i) => tl.fromTo(s, { x: -${f(L.OUTCOIN[0].u - L.AMM.u) * 0.819 * 0.6}, y: ${f((L.OUTCOIN[0].u - L.AMM.u) * 0.287 * 0.6)}, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, ease: "power2.out" }, ${t(TM.eth - 0.4)} + i * 0.5));
      fadeIn("#xbox", ${t(TM.eth + 1.4)}, 0.4); pop("#lb-gone", ${t(TM.eth + 1.6)}, 0.25);
      // ===== L6 锁链停在 ETH / TRX 前，红叉，没有发行方
      out("#lb-amm", ${t(LS[6])}, 0.3); draw("cv0", ${t(LS[6] + 0.1)}); draw("cv1", ${t(LS[6] + 0.3)}); pop("#xm", ${t(LS[6] + 1.0)}, 0.25);
      pop("#lb-noiss", ${t(TM.noiss)}, 0.25);
      // ===== L7 钟拨到约 4 小时；27 绿点（每点约 1 亿）
      out("#ev2, #cv0, #cv1, #xm, #lb-noiss, #lb-gone, #xbox, #dR, #lb-dR, #lb-s1, #lb-37, #ckRing", ${t(LS[7] - 0.2)}, 0.4);
      pop("#ev3", ${t(LS[7] + 0.2)});
      KIT.clock(tl, "ckB", ${t(TM.h4 - 0.4)}, 1.2, 200); pop("#lb-4h", ${t(TM.h4 + 0.4)}, 0.25);
      fadeIn("#dG", ${t(TM.b27 - 0.3)}, 0.5); pop("#lb-s2", ${t(TM.b27 - 0.2)}, 0.25); pop("#lb-dG", ${t(TM.b27 + 0.2)}, 0.25);
      // ===== L8 100 点横条：44 绿 / 56 红空心
      out("#dG, #lb-dG, #lb-s2", ${t(LS[8] - 0.1)}, 0.3);
      fadeIn("#dBar", ${t(LS[8] + 0.3)}, 0.5); pop("#lb-s3", ${t(LS[8] + 0.4)}, 0.25); pop("#lb-dB", ${t(TM.p44)}, 0.25); bump("#lb-dB", ${t(TM.p44 + 0.5)}, 1.15, 1);
      // ===== L9 题卡"先猜"
      out("#ev3", ${t(LS[9] - 0.2)}); pop("#kw-guess", ${t(LS[9])});
      // ===== L10 五枚币依次亮起标签
      out("#dBar, #lb-dB, #lb-s3, #lb-4h", ${t(LS[10] - 0.1)}, 0.4);
      ${JSON.stringify(TM.tk.map((x) => Math.round(x * 100) / 100))}.forEach((tt, i) => { fadeIn("#hl" + i, tt, 0.25); });
      // ===== L11 每枚币上方一个"?"；两把锁悬在空中不落
      out("#kw-guess", ${t(LS[11] - 0.2)}); pop("#kw-q", ${t(LS[11])});
      [0, 1, 2, 3, 4].forEach((i) => pop("#qm" + i, ${t(TM.which - 0.3)} + i * 0.12, 0.25));
      tl.to("#lkw0, #lkw1", { y: -70, duration: 0.7, ease: "power2.out" }, ${t(LS[11] + 0.4)});
      // ===== L12 题卡缩到右上胶囊下方；资金管向右的箭头闪烁
      tl.to("#kw-q", { x: 1150, y: -25, scale: 0.7, duration: 0.8, ease: "power2.inOut" }, ${t(LS[12] + 0.3)});
      fadeIn("#arrR", ${t(TM.gone - 0.6)}, 0.3); flash("#arrR", ${t(TM.gone)}, 4);
`,
});
