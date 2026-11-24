// ep15/seg4「④ 地址上的委托」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.flowC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            ---- A 托管机房
//   hotA         
//   clockA       
//   bankB        ---- B 银行柜台
//   flowC        ---- C 4337 流水线
//   hashC        
//   payC         
//   ownerC       
//   bicoC        
//   envC         
//   D            ---- D 7702
//   plateD       
//   chainsD      
//   batchD       
//   devD         
//   E            ---- E 钥匙与守护人
//   passE        
//   sessionE     
//   F            ---- F 意图集市
//   intentF      
//   permitF      
//   EF           ---- across zones
//   wide         
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G, applyM } from "../../../kit/iso.mjs";
// ends static on CAMS.devD

const CAMX = { ...L.CAMS,
  // 段内专用：三条链往下让出代码卡 B 的位置（L8–L10）
  chainsDc: L.fit([L.rect(L.PLATE_D, "addrPlate"), L.rect(L.DCORE_OK, "coreModule"), L.rect(L.DCORE_BAD, "coreModule"), ...L.CHAINS_D.map((q) => L.rect(q, "chain2"))], [420, 420, 1720, 870]) };
const S = segInit(import.meta.url, { cams: CAMX, ext: [E1, E2, E3, E5, E9, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";

// wrap helper (SEGBASE 常见坑 1): scale k around the ground point, rescale [x,y] anchors
const wrapK = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const sc = (o, k) => { const [gx, gy] = at(o); return (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; };
const wput = (key, o, mk, k, dy = 0, extra = {}) => {
  put(key, o, mk(o), dy, { wrap: wrapK(o, k), ...extra });
  const s = sc(o, k);
  for (const [n, v] of Object.entries(A[key])) {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = s(v);
    else if (Array.isArray(v) && Array.isArray(v[0])) A[key][n] = v.map(s);
  }
};

// ---------------------------------------------------------------- 世界物件
// C 区（起始镜头 flowC 的流水线全景，静止陪衬）
put("signC", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "signC", style: "plate", text: "ERC-4337" }));
put("sorter", L.SORTER, E1.sorter(L.SORTER, { id: "sorter", letters: 3, blockLabel: "一笔交易" }));
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "EntryPoint" }));
put("acct", L.ACCOUNT, E5.accountSafe(L.ACCOUNT, { id: "acct" }));
put("pump", L.PUMP, X.gasPump(L.PUMP, { id: "pump", title: "Paymaster" }));
put("funnel", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "funnel", inputs: ["字段", "字段"], output: "用户操作哈希" }));
// D 区
put("signD", L.SIGN_D, E1.signBoard(L.SIGN_D, { id: "signD", style: "plate", text: "EIP-7702" }));
wput("dsafe", L.DSAFE, (o) => O.safe(o, { id: "dsafe" }), 0.7);
wput("plate", L.PLATE_D, (o) => E2.addrPlate(o, { id: "plate", text: "普通地址" }), 1.3);
put("tag", L.TAG_D.o, X.delegateTag(L.TAG_D.o, { id: "tag", ...L.TAG_D.opts, on: false }));
put("dchq", L.DCHEQUE, E9.cheque(L.DCHEQUE, { id: "dchq", title: "授权", amount: "委托", labels: ["链 ID", "合约地址", "nonce", "—", "—"] }), 0, { grow: true });
put("dcok", L.DCORE_OK, E10.coreModule(L.DCORE_OK, { id: "dcok", scale: 0.7, ver: "钱包实现", cart: false, lever: false, owner: "本人" }));
put("dcbad", L.DCORE_BAD, E10.coreModule(L.DCORE_BAD, { id: "dcbad", scale: 0.7, state: "attacker", ver: "恶意合约", cart: false, lever: false }), 0, { grow: true });
L.CHAINS_D.forEach((q, i) => {
  wput("ch" + i, q, (o) => O.chain(o, { id: "ch" + i, n: 2, labels: ["#1", "#2"] }), 0.7);
  add(q, S.hid("chr" + i, wrapK(q, 0.7)(O.chain(q, { id: "chrx" + i, n: 2, state: "attacker", labels: ["#1", "#2"] }).svg)), 2);
});
const BD = O.doc(L.BATCH, { id: "batch", standing: true, w: 200, h: 220, title: "批量执行", lines: ["1 授权", "2 兑换", "3 转走全部"] });
put("batch", L.BATCH, BD, 0, { grow: true });
const rowPt = (i) => applyM(A.batch.m, 100, 85 + i * 30);          // 批量文件第 i 行中心（世界画布）
const m = A.batch.m;
add(L.BATCH, S.hid("bframe", `<g transform="matrix(${m.join(",")})"><rect x="8" y="${70 + 60}" width="184" height="30" rx="4" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="9 6"/></g>`), 4);
put("mag", L.MAG_D, O.magnifier(L.MAG_D, { id: "mag" }), 0, { grow: true });
L.SWEEPS.forEach((q, i) => put("sw" + i, q, E1.miniVend(q, { id: "sw" + i, kind: "attacker", scale: 0.6, label: "扫币" }), 0, { grow: true }));
// D 区 · 开发者角
wput("slots", L.SLOTS, (o) => E3.slotCabinet(o, { id: "slots", title: "存储", n: 5, labels: ["0", "1", "2", "3", "4"],
  fill: { 1: [{ bytes: 20, color: "teal" }], 3: [{ bytes: 12, color: "gray" }] } }), 0.7);
put("dcd", L.DCORE_DEV, E10.coreModule(L.DCORE_DEV, { id: "dcd", scale: 0.7, ver: "新委托", cart: false, lever: false, owner: "" }));
const ATKP = { ...G(7100 + 560, 420), scale: 0.5 };
put("atkp", ATKP, O.person(ATKP, { id: "atkp", role: "attacker", scale: 0.5 }), 0, { grow: true });
const MINI = G(7100 + 560, 250);
put("mchq", MINI, E9.cheque(MINI, { id: "mchq", title: "私钥签名", scale: 0.55, fields: ["filled", "filled", "filled", "filled", "filled"] }), 0, { grow: true });
const PAGE = `<rect x="20" y="58" width="340" height="226" rx="12" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>
  <text x="190" y="128" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="30" font-weight="900" fill="#1c1c1c">升级为智能账户？</text>
  <rect x="44" y="150" width="292" height="12" rx="6" fill="#ddd6c9"/><rect x="44" y="174" width="220" height="12" rx="6" fill="#ddd6c9"/>
  <rect x="44" y="206" width="292" height="58" rx="12" fill="#1d93ba"/><text x="190" y="246" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="28" font-weight="900" fill="#ffffff">签名授权</text>`;
put("brw", L.BROWSER_D, O.browserWin(L.BROWSER_D, { id: "brw", title: "dapp.example", page: PAGE }));

// 点阵、ETH 币（原生 SVG）
const [dx, dy0] = at(L.DOTS_D);
const dotGrid = (pre, n, cols, x0, y0, sp = 18) => Array.from({ length: n }, (_, i) =>
  `<circle id="${pre}${i}" cx="${x0 + (i % cols) * sp}" cy="${y0 + Math.floor(i / cols) * sp}" r="6.5" fill="${RED}" opacity="0"/>`).join("");
add(L.DOTS_D, dotGrid("dA", 15, 5, dx + 20, dy0 + 10), 60);
add(L.DOTS_D, dotGrid("dB", 10, 5, dx - 10, dy0 + 10) + dotGrid("dC", 15, 5, dx + 110, dy0 + 10), 60);
const coinTo = A.plate.top, coin0 = [coinTo[0], coinTo[1] - 150];
add(L.PLATE_D, S.hid("coin", `<g><circle cx="${coin0[0]}" cy="${coin0[1]}" r="20" fill="#8c8fe0" stroke="#4b4fa8" stroke-width="3"/><text x="${coin0[0]}" y="${coin0[1] + 7}" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" font-weight="900" fill="#fff">Ξ</text></g>`), 80);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-state", A.plate.ground, "链上状态", "lab-cs lab-sm", "t");
L.CHAINS_D.forEach((q, i) => {
  lb("lb-ch" + i, up(A["ch" + i].top, 4), `链 ${i + 1}`, "lab-cs lab-sm");
  lb("lb-n" + i, A["ch" + i].ground, "nonce = ✓", "lab-gs lab-sm", "t");
});
lb("lb-goplus", up(A.dsafe.top, 6), "GoPlus 归因：Inferno Drainer", "lab-g lab-sm");
lb("lb-leg1", [dx + 60, dy0 + 80], "每点约 1 万美元", "lab-r lab-sm", "t");
lb("lb-leg2", [dx + 70, dy0 + 82], "每点约 10 万美元", "lab-r lab-sm", "t");
lb("lb-sw", up(A.sw1.top, 6), "扫币合约 · 复制来的", "lab-rs lab-sm");
["授权", "兑换", "转走全部"].forEach((x, i) => lb("lb-row" + i, [rowPt(i)[0] + 130, rowPt(1)[1] + (i - 1) * 80], x, i === 2 ? "lab-rs lab-sm" : "lab-cs lab-sm", "l"));
lb("lb-init", up(A.dcd.top, 6), "抢先初始化", "lab-rs lab-sm");
lb("lb-init2", up(A.dcd.top, 8), "初始化数据 · 私钥签名", "lab-gs lab-sm");
lb("lb-mchq", A.mchq.ground, "✓", "lab-gs lab-sm", "t");
lb("lb-old", A.slots.drawers[1], "旧数据", "lab-rs lab-sm", "c");
lb("lb-read", up(A.dcd.top, 10), "✕ 读到旧数据", "lab-rs lab-sm");
lb("lb-nsA", A.slots.drawers[3], "合约 A 区", "lab-cs lab-sm", "c");
lb("lb-nsB", A.slots.drawers[1], "合约 B 区", "lab-cs lab-sm", "c");
lb("lb-rej", [A.brw.center[0] + 10, A.brw.center[1] + 60], "拒绝", "lab-rs", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 600, y: 112, w: 820 };
const cardB = codeCard("cb", { ...CB, mono: true, head: "EIP-7702 授权", tag: "示意", rows: [
  { html: "authorization = [chain_id, address, nonce]" },
  { html: "code(EOA) = 0xef0100 ‖ address <span class='cm'>// 指针</span>" },
  { html: "chain_id = 0 → 所有链有效", chip: "默认拒绝", chipCls: "ok" },
] });
const CC = { x: 600, y: 112, w: 980 };
const cardC = codeCard("cc", { ...CC, mono: true, head: "老检查", tag: "示意", rows: [
  { html: "require(tx.origin == msg.sender); <span class='cm'>// 普通地址？</span>", chip: "✕ 失效", chipCls: "x" },
  { html: "<span class='cm'>// 7702 之后：普通地址也能运行合约代码</span>" },
] });
const box3 = (pre, items, y0) => items.map((x, i) => `<div class="rk hide" id="${pre}${i}" style="top:${y0 + i * 74}px"><b>${i + 1}</b><span id="${pre}${i}t" class="rkt">${x}</span></div>`).join("");
// 曲线（屏幕层）
S.curve("cv0", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("plateD", A.dchq.fields[1]), { color: RED });
S.curve("cv1", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], S.scr("plateD", A.tag.text), { color: RED });
S.curve("cvok", S.scr("plateD", A.tag.text), S.scr("plateD", A.dcok.front), { color: TEAL });
S.curve("cvbad", S.scr("plateD", A.tag.text), S.scr("plateD", A.dcbad.front), { color: RED });
S.curve("cvsw", S.scr("batchD", rowPt(2)), S.scr("batchD", A.dsafe.center), { color: RED });
const html = cardB + cardC
  + box3("rk", ["恶意合约", "链 ID = 0", "合法委托 + 恶意批量"], 330)
  + box3("dv", ["初始化", "存储", "老检查"], 336)
  + `<div class="cx hide" id="cb-x">✕</div>`
  + evt("ev0", `以太坊官方博客 · EIP-7702 规范${gtag("来源")}`)
  + evt("ev1", `<b>7702 批量钓鱼</b> · 2025 年 5 月 · 约 14.6 万美元<br><small>GoPlus · The Block 报道</small>`, { color: RED })
  + evt("ev2", `<b>两起大额 7702 钓鱼</b> · 2025 年 8 月<br><small>约 100 万 · 约 154 万美元 · ScamSniffer 记录</small>`, { color: RED, top: 124 })
  + evt("ev3", `Cointelegraph 报道（引用 Wintermute）${gtag("第三方分析")}`, { top: 128 })
  + evt("ev4", `EIP-7702 规范原文${gtag("来源")}`, { top: 122 })
  + kw("kw-main", `主要风险：<b>合法委托 + 恶意批量</b>${gtag("解读")}`, { x: 560, y: 120, size: 40, accent: RED });
const css = `
  .k-code .cm { color: #8a8478; }
  .rk { position: absolute; left: 60px; display: flex; align-items: center; gap: 12px; background: #fff; border: 3px solid ${TEAL}; border-radius: 14px;
        padding: 8px 18px 8px 10px; font: 800 28px "Noto Sans SC", sans-serif; color: #1c1c1c; box-shadow: 0 8px 18px rgba(70,60,40,0.12); }
  .rk b { display: inline-flex; width: 44px; height: 44px; border-radius: 50%; background: #17809f; color: #fff; align-items: center; justify-content: center; }
  .rkt { opacity: 0; font-size: 0; }
  #dv0, #dv1, #dv2 { left: 66px; } #dv0 .rkt, #dv1 .rkt, #dv2 .rkt { opacity: 1; font-size: 28px; }
  #cb-r2 { opacity: 0; }
  .cx { position: absolute; left: ${CB.x + CB.w - 70}px; top: ${codeRowY(CB.y, 2) - 30}px; font: 900 52px Inter, sans-serif; color: ${RED}; }
  #cc-r0.badrow { outline: 3px dashed ${RED}; outline-offset: 2px; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  three: w("三样", 1), cid: w("链 ID", 2), addr: w("地址", 2), nonce: w("nonce", 2), ptr: w("指针", 3),
  l7: w("恶意合约", 7), zero: w("填 0", 8), rej: w("拒绝", 10), batch: w("批量执行", 11), out: w("转走", 12),
  g5: w("14.6", 13), sc: w("ScamSniffer", 14), wm: w("扫币合约", 15), eth: w("ETH", 16), dec: w("逐项解码", 18),
  pre: w("抢先", 20), sig: w("签名", 21), old: w("旧存储", 22), ns: w("命名空间", 23), orig: w("交易发起者", 24),
  no: w("不应该", 25), deny: w("默认拒绝", 26),
};
const t = (x) => f(x);
const cs = [G(2700, -1200), G(9300, -1200), G(2700, 900), G(9300, 900)];
const GRID = { u0: Math.min(...cs.map((q) => q.u)), u1: Math.max(...cs.map((q) => q.u)), v0: Math.min(...cs.map((q) => q.v)), v1: Math.max(...cs.map((q) => q.v)) };
console.log("TM", JSON.stringify(Object.fromEntries(Object.entries(TM).map(([k, v]) => [k, +v.toFixed(2)]))));
const magTo = (p) => { const l = A.mag.lens; return `{ x: ${f(p[0] - l[0] - 40)}, y: ${f(p[1] - l[1])} }`; };
const coinD = [coinTo[0] - coin0[0], coinTo[1] - coin0[1] + 40], coinS = [A.sw0.center[0] - coin0[0], A.sw0.center[1] - coin0[1]];

S.build({
  cam0: "flowC", sub: "最常见的风险，是合法委托上的恶意批量",
  grid: GRID, box: [2700, -1200, 6600, 2100],
  shown: [], css, html,
  terms: [
    { id: "t0", t: "Pectra", d: "以太坊 2025 年 5 月的一次网络升级", at: w("Pectra", 0) },
    { id: "t1", t: "EVM", d: "以太坊虚拟机，很多链都兼容它", at: w("EVM", 8) },
    { id: "t2", t: "扫币合约", d: "自动转走地址收到资金的合约", at: w("扫币合约", 15) },
    { id: "t3", t: "初始化", d: "合约第一次写入所有者等初始数据", at: w("初始化", 20) },
    { id: "t4", t: "命名空间存储", d: "每个合约的数据各占一块独立位置", at: w("命名空间存储", 23) },
    { id: "t5", t: "交易发起者", d: "签名发出这笔交易的那个地址", at: w("交易发起者", 24) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      // ===== L0 横移到 D；EIP-7702 牌亮；来源卡
      cam(${t(LS[0])}, "plateD", 1.6); bump("#signD", ${t(LS[0] + 1.8)}); fadeIn("#ev0", ${t(LS[0] + 1.7)}); out("#ev0", ${t(LS[1] - 0.2)});
      // ===== L1 授权支票立在门牌旁；代码卡 B
      grow("dchq", ${t(TM.three - 0.3)}); pop("#cb", ${t(LS[1] + 0.4)});
      // ===== L2 三个字段槽依次亮；第 1 行连到支票
      X9.fields(tl, "dchq", ${t(TM.cid)}, ["filled", "filled", "filled", null, null], 0.6); hot("#cb-r0", ${t(TM.cid)}); draw("cv0", ${t(TM.cid + 0.2)});
      // ===== L3 挂牌落下；第 2 行连到挂牌
      out("#cv0", ${t(LS[3] - 0.1)}); X15.tagDrop(tl, "tag", ${t(TM.ptr - 0.3)}); hot("#cb-r1", ${t(TM.ptr)}); draw("cv1", ${t(TM.ptr + 0.3)});
      // ===== L4 挂牌青蓝虚线连到钱包实现，齿轮转
      out("#cv1", ${t(LS[4] - 0.1)}); draw("cvok", ${t(LS[4] + 0.2)}); X10.gears(tl, "dcok", ${t(LS[4] + 0.7)}, 2.2, 2);
      // ===== L5 链上状态
      pop("#lb-state", ${t(LS[5] + 0.5)}); X15.tagPulse(tl, "tag", ${t(LS[5] + 1.6)});
      // ===== L6 三层风险小牌
      out("#cvok, #cb", ${t(LS[6] - 0.15)}); [0, 1, 2].forEach((i) => pop("#rk" + i, ${t(LS[6] + 0.1)} + i * 0.25, 0.25));
      // ===== L7 第一层：恶意合约
      grow("dcbad", ${t(LS[7] + 0.1)}); X15.tagState(tl, "tag", ${t(TM.l7)}, "attacker", "恶意合约"); draw("cvbad", ${t(TM.l7 + 0.3)}); tl.set("#rk0t", { fontSize: 28 }, ${t(TM.l7)}); fadeIn("#rk0t", ${t(TM.l7)});
      // ===== L8 第二层：链 ID = 0，三条链亮红
      out("#cvbad, #lb-state", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "chainsDc", 1.2); pop("#cb", ${t(LS[8] + 0.8)}); fadeIn("#cb-r2", ${t(TM.zero)});
      tl.set("#rk1t", { fontSize: 28 }, ${t(TM.zero)}); fadeIn("#rk1t", ${t(TM.zero)}); [0, 1, 2].forEach((i) => pop("#lb-ch" + i, ${t(LS[8] + 1.3)} + i * 0.15, 0.25)); fadeIn("#chr0, #chr1, #chr2", ${t(TM.zero + 0.3)}, 0.4);
      // ===== L9 nonce 对得上
      [0, 1, 2].forEach((i) => pop("#lb-n" + i, ${t(LS[9] + 0.6)} + i * 0.3, 0.25));
      // ===== L10 默认拒绝；挂牌回到钱包实现
      pop("#cb-x", ${t(TM.rej)}); pop("#cb-c2", ${t(TM.rej + 0.3)}); out("#chr0, #chr1, #chr2, #lb-n0, #lb-n1, #lb-n2", ${t(TM.rej + 0.6)}, 0.4);
      X15.tagState(tl, "tag", ${t(TM.rej + 0.8)}, "normal", "钱包实现");
      // ===== L11 第三层：合法委托 + 批量执行（关键画面）
      out("#cb, #cb-x, #lb-ch0, #lb-ch1, #lb-ch2", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "batchD", 1.4); grow("batch", ${t(TM.batch)}); tl.set("#rk2t", { fontSize: 28 }, ${t(TM.batch)}); fadeIn("#rk2t", ${t(TM.batch)});
      X15.tagPulse(tl, "tag", ${t(LS[11] + 2)});
      // ===== L12 放大镜扫过第 3 行；红线连到资产柜（关键画面）
      grow("mag", ${t(LS[12])}); tl.to("#mag", { ...${magTo(rowPt(2))}, duration: 0.5, ease: "power2.out" }, ${t(LS[12] + 0.2)});
      fadeIn("#bframe", ${t(TM.out)}); draw("cvsw", ${t(TM.out + 0.3)});
      // ===== L13 2025 年 5 月约 14.6 万美元
      fadeIn("#ev1", ${t(LS[13] + 0.2)}); pop("#lb-goplus", ${t(LS[13] + 0.8)}); for (let i = 0; i < 15; i++) fadeIn("#dA" + i, ${t(TM.g5)} + i * 0.07, 0.15); pop("#lb-leg1", ${t(TM.g5 + 1.2)});
      // ===== L14 ScamSniffer 两起
      out("#ev1, #lb-goplus, #lb-leg1", ${t(LS[14] - 0.2)}); for (let i = 0; i < 15; i++) out("#dA" + i, ${t(LS[14] - 0.2)}, 0.2);
      fadeIn("#ev2", ${t(LS[14] + 0.2)}); for (let i = 0; i < 10; i++) fadeIn("#dB" + i, ${t(TM.sc + 1.5)} + i * 0.07, 0.15);
      for (let i = 0; i < 15; i++) fadeIn("#dC" + i, ${t(TM.sc + 2.4)} + i * 0.07, 0.15); pop("#lb-leg2", ${t(TM.sc + 3.6)}); bump("#ev2", ${t(TM.sc + 1.4)});
      // ===== L15 Wintermute：扫币合约复制排开
      out("#ev2, #lb-leg2, #cvsw", ${t(LS[15] - 0.2)}); for (let i = 0; i < 10; i++) out("#dB" + i, ${t(LS[15] - 0.2)}, 0.2); for (let i = 0; i < 15; i++) out("#dC" + i, ${t(LS[15] - 0.2)}, 0.2);
      fadeIn("#ev3", ${t(LS[15] + 0.2)}); [0, 1, 2].forEach((i) => grow("sw" + i, ${t(TM.wm - 0.4)} + i * 0.3)); pop("#lb-sw", ${t(TM.wm + 0.8)});
      // ===== L16 ETH 落进信箱，立刻被扫走
      out("#ev3", ${t(LS[16] - 0.1)}); fadeIn("#coin", ${t(TM.eth - 0.4)}, 0.2);
      tl.to("#coin", { x: 0, y: ${f(coinD[1])}, duration: 0.5, ease: "bounce.out" }, ${t(TM.eth - 0.2)});
      tl.to("#coin", { x: ${f(coinS[0])}, y: ${f(coinS[1])}, duration: 0.7, ease: "power2.in" }, ${t(TM.eth + 0.8)}); out("#coin", ${t(TM.eth + 1.5)}, 0.2); bump("#sw0", ${t(TM.eth + 1.5)});
      // ===== L17 主要风险：合法委托 + 恶意批量；小牌 3 变红放大
      pop("#kw-main", ${t(LS[17] + 0.3)}); tl.to("#rk2", { borderColor: "${RED}", scale: 1.1, transformOrigin: "left center", duration: 0.35 }, ${t(LS[17] + 1)});
      tl.to("#rk2 b", { backgroundColor: "${RED}", duration: 0.35 }, ${t(LS[17] + 1)}); bump("#kw-main", ${t(LS[17] + 3.2)});
      // ===== L18 逐项解码
      out("#kw-main", ${t(LS[18] - 0.1)}); out("#bframe", ${t(LS[18])});
      [${[0, 1, 2].map((i) => magTo(rowPt(i))).join(", ")}].forEach((p, i) => { tl.to("#mag", { ...p, duration: 0.45, ease: "power2.inOut" }, ${t(LS[18] + 0.2)} + i * 1.1); pop("#lb-row" + i, ${t(LS[18] + 0.6)} + i * 1.1, 0.25); });
      // ===== L19 开发者三个坑
      out("#mag, #lb-row0, #lb-row1, #lb-row2, #rk0, #rk1, #rk2, #lb-sw", ${t(LS[19] - 0.2)}); cam(${t(LS[19])}, "devD", 1.4);
      [0, 1, 2].forEach((i) => pop("#dv" + i, ${t(LS[19] + 0.6)} + i * 0.2, 0.25));
      // ===== L20 抢先初始化
      bump("#dv0", ${t(LS[20])}); grow("atkp", ${t(LS[20] + 0.3)}); X10.card(tl, "dcd", ${t(TM.pre)}, "攻击者", "red"); X10.cardBad(tl, "dcd", ${t(TM.pre + 0.3)}, true); pop("#lb-init", ${t(TM.pre + 0.4)});
      // ===== L21 初始化数据由私钥签名
      out("#lb-init, #atkp", ${t(LS[21] - 0.1)}); X10.cardBad(tl, "dcd", ${t(LS[21] + 0.2)}, false); X10.card(tl, "dcd", ${t(TM.sig)}, "本人", "green");
      grow("mchq", ${t(LS[21] + 0.4)}); pop("#lb-mchq", ${t(TM.sig + 0.4)}); pop("#lb-init2", ${t(TM.sig + 0.6)});
      // ===== L22 旧存储仍在，新合约读错
      out("#lb-init2, #lb-mchq, #mchq", ${t(LS[22] - 0.1)}); bump("#dv1", ${t(LS[22])}); X3.mark(tl, "slots", 1, ${t(TM.old)}, "red"); pop("#lb-old", ${t(TM.old + 0.2)});
      pop("#lb-read", ${t(TM.old + 1.6)});
      // ===== L23 命名空间存储
      out("#lb-old, #lb-read", ${t(LS[23] - 0.1)}); X3.mark(tl, "slots", 1, ${t(TM.ns)}, "teal"); X3.mark(tl, "slots", 3, ${t(TM.ns)}, "teal");
      pop("#lb-nsA", ${t(TM.ns + 0.2)}); pop("#lb-nsB", ${t(TM.ns + 0.4)});
      // ===== L24 老检查失效
      out("#lb-nsA, #lb-nsB", ${t(LS[24] - 0.1)}); bump("#dv2", ${t(LS[24])}); pop("#cc", ${t(TM.orig)});
      tl.set("#cc-r0", { outline: "3px dashed ${RED}", outlineOffset: "2px" }, ${t(TM.orig + 1.6)}); pop("#cc-c0", ${t(TM.orig + 1.8)});
      // ===== L25 规范原文：应用不应请求委托授权
      out("#cc", ${t(LS[25] - 0.1)}); fadeIn("#ev4", ${t(LS[25] + 0.3)}); bump("#brw", ${t(TM.no)});
      // ===== L26 默认拒绝（段尾静止）
      out("#ev4", ${t(LS[26])}); out("#dv0, #dv1, #dv2", ${t(LS[26])}); pop("#lb-rej", ${t(TM.deny)}, 0.3);
`,
});
