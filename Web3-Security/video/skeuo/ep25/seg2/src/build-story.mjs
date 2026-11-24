// ep25/seg2「② 以小时计」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.mintB（BRIEF）。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.exitC

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors
const putW = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale ?? 1;
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const P = (pts) => pts.map((q) => q.map((x) => x.toFixed(1)).join(",")).join(" ");
const quad = (u0, u1, v0, v1) => [at({ u: u0, v: v0 }), at({ u: u1, v: v0 }), at({ u: u1, v: v1 }), at({ u: u0, v: v1 })];

// ---------------------------------------------------------------- 世界物件
// 石板路 + 资金管（全世界）
add({ u: 0, v: -2000 }, `<polygon points="${P(quad(L.ROAD.u0, L.ROAD.u1, L.ROAD.v0, L.ROAD.v1))}" fill="#d9d4ca" stroke="#c4bdb0" stroke-width="3"/>`, -99999);
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8, flowColor: "#e0453a" }), -99990);
// 国道（C 出城后的灰色宽路，在大路前方）
const c = (du, dv) => ({ u: 6900 + du, v: dv });
add({ u: 0, v: -1990 }, `<polygon points="${P(quad(8550, 9600, 130, 430))}" fill="#bdb8ae" stroke="#a49e92" stroke-width="3"/>`
  + `<polyline points="${P([at(c(1650, 280)), at(c(2700, 280))])}" stroke="#ffffff" stroke-width="8" stroke-dasharray="40 30" fill="none"/>`, -99980);

// A 被盗现场（只在全景里看到）
put("hsafe", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hsafe", variant: "hot", plate: "热钱包", open: 105, state: "broken" }));
L.CMETH.forEach((q, i) => put("cm" + i, q, E6.shareCert(q, { id: "cm" + i, scale: q.scale, text: "cmETH", stand: true })));

// B 发行方路口（与 seg1 末帧一致）
// 与 seg1 末帧对齐：五枚主角币排在 B 区路面（带币名、高亮底、问号），两把锁抬高 70，钟 12:40，ETH/TRX 换出币
const TX = (x, y, sz, txt, fill = "#1c1c1c") => `<text x="${f(x)}" y="${f(y)}" font-size="${sz}" font-weight="900" text-anchor="middle" fill="${fill}" font-family="inherit">${txt}</text>`;
["USDT", "USDC", "BTC", "XRP", "SOL"].forEach((tk, i) => { const o = { u: 2000 + 110 * i, v: 0 }, [gx, gy] = at(o), k = 0.55;
  put("h" + i, o, E7.oddCoin(o, { id: "h" + i, scale: k }), 0, { wrap: (svg) => `<g id="hw${i}">${svg}`
    + `<g id="hl${i}"><rect x="${f(gx - 34)}" y="${f(gy + 14)}" width="68" height="26" rx="13" fill="#d4f0f8" stroke="#2aa3c9" stroke-width="2.5"/></g>`
    + TX(gx, gy + 34, 17, tk) + `<g id="qm${i}">${TX(gx, gy - 109 * k - 12, 34, "?", "#1d93ba")}</g></g>` }); });
put("mp0", L.MINT[0], E11.mintPress(L.MINT[0], { id: "mp0", scale: 0.55, plate: "USDT", count: "—", pile: 0.4 }));
put("mp1", L.MINT[1], E11.mintPress(L.MINT[1], { id: "mp1", scale: 0.55, plate: "USDC", count: "—", pile: 0.4 }));
L.ADDR_B.forEach((q, i) => putW("ab" + i, q, E2.addrPlate(q, { id: "ab" + i, text: "攻击者地址" })));
L.LOCK_B.forEach((q, i) => { const [gx, gy] = at(q), k = q.scale;
  put("lk" + i, q, O.padlock(q, { id: "lk" + i }), 0, { wrap: (svg) => `<g id="lkw${i}" transform="translate(0,-70)"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g></g>` }); });
put("clkb", L.CLOCK_B[0], O.clock(L.CLOCK_B[0], { id: "clkb", h: 12, m: 40 }));
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm", scale: 0.6, labelL: "USDT", labelR: "ETH", lvlL: 0.85, lvlR: 0.5 }));
L.OUTCOIN.forEach((q, i) => { const [gx, gy] = at(q);
  put("oc" + i, q, E7.oddCoin(q, { id: "oc" + i, scale: q.scale }), 0, { wrap: (svg) => `${svg}${TX(gx, gy + 30, 16, ["ETH", "TRX"][i], "#e0453a")}` }); });
put("sgb", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "sgb", style: "plate", text: "发行方路口" }));
lb("lb-mp0", up(A.mp0.top, 8), "Tether · USDT 发行方", "lab-cs lab-sm");
lb("lb-mp1", up(A.mp1.top, 8), "Circle · USDC 发行方", "lab-cs lab-sm");

// C 出城口
putW("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
putW("lot", L.LOTTERY, E2.lottery(L.LOTTERY, { id: "lot", plate: "混币器" }));
put("stall", L.STALL, E8.marketStall(L.STALL, { id: "stall", scale: 0.55, head: "场外交易" }));
put("tc", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "tc", scale: 0.6, sign: "交易所 · 风控" }));
L.CHECKS.forEach((q, i) => putW("chk" + i, q, O.checkpoint(q, { id: "chk" + i, n: "①②③④"[i], armUp: true })));
putW("rdoc", { ...L.RISKDOC, scale: 0.7 }, O.doc(L.RISKDOC, { id: "rdoc", title: "风控名单", standing: true }));
L.ADDR_C.forEach((q, i) => putW("ac" + i, q, E2.addrPlate(q, { id: "ac" + i, text: "地址 " + (i + 1) })));
L.COINS_C.forEach((q, i) => put("cc" + i, q, E7.oddCoin(q, { id: "cc" + i, scale: q.scale }), 0,
  { wrap: (svg) => `<g id="mvc${i}">${svg}</g>` }));
put("sgc", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "sgc", style: "plate", text: "出城口" }));
// 劫匪 + 车牌（一起走上国道）
{
  const [rx, ry] = at(L.ROBBER), pl = (txt, fill, id, op) => `<g id="${id}" opacity="${op}"><rect x="${rx - 260}" y="${ry - 130}" width="170" height="78" rx="12" fill="${fill}" stroke="#ffffff" stroke-width="5"/>`
    + `<text x="${rx - 175}" y="${ry - 76}" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-weight="900" font-size="50" fill="#ffffff">${txt}</text></g>`;
  put("rob", L.ROBBER, O.person(L.ROBBER, { id: "rob", role: "attacker", scale: 0.5 }), 0,
    { wrap: (svg) => `<g id="rob-mv">${pl("USDT", "#1d93ba", "plt-a", 1)}${pl("BTC", "#1c1c1c", "plt-b", 0)}${svg}</g>` });
}
lb("lb-br", up(A.br.top, 8), "跨链桥 · 兑换服务", "lab-cs lab-sm");
lb("lb-lot", up(A.lot.top, 8), "混币器", "lab-cs lab-sm");
lb("lb-stall", up(A.stall.top, 8), "场外交易", "lab-cs lab-sm");
lb("lb-tc", up(A.tc.top, 8), "交易所 · 风控", "lab-cs lab-sm");
lb("lb-rob", up(A.rob.top, 70), "劫匪", "lab-rs lab-sm");
lb("lb-hw", at(c(2450, 470)), "国道", "lab-g lab-sm", "t");
lb("lb-stop", up(A.cc1.top, 10), "拦住", "lab-gs lab-sm");
lb("lb-free", at(c(-400, -820)), "去中心化 · 没有义务配合", "lab-g", "b");
lb("lb-op1", up(A.br.top, 10), "兑换服务 · 有运营方", "lab-gs lab-sm");
lb("lb-op2", up(A.tc.top, 10), "交易所 · 有运营方", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层（全景 0.10 下的标记一律画在屏幕层，画大）
const WS = (u, v = 0) => S.scr("wide", at({ u, v })).map((x) => Math.round(x));
const pA = WS(120), pE = WS(19520), sh = WS(L.CMETH[1].u, L.CMETH[1].v), sb = WS(L.ADDR_B[1].u, 0), sx = WS(L.COUNTER.u, L.COUNTER.v);
const nodes = [3500, 5600, 6900, 8200].map((u) => WS(u));
const amm = WS(L.AMM.u, L.AMM.v), pC = WS(6900), lockAt = WS(L.ADDR_B[1].u, L.ADDR_B[1].v);
const ring = (id, [x, y], col = "#1f9d55", r = 52) => `<circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="9" opacity="0"/>`;
const lead = (id, x0, y0, [x1, y1]) => `<line id="${id}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8" opacity="0"/>`;
const fan = [0, 1, 2, 3, 4, 5].map((i) => { const x = 560 + i * 44, y = 790; return `<line x1="${nodes[1][0]}" y1="${nodes[1][1]}" x2="${x}" y2="${y}" stroke="#e0453a" stroke-width="4"/><rect x="${x - 14}" y="${y}" width="28" height="34" rx="6" fill="#ffffff" stroke="#e0453a" stroke-width="5"/>`; }).join("");
const mag = `<g id="ic-mag" opacity="0"><g transform="translate(${pA[0]},${pA[1] - 70})"><line x1="22" y1="22" x2="58" y2="58" stroke="#1c1c1c" stroke-width="14" stroke-linecap="round"/><circle r="36" fill="#d8f0f8" stroke="#1c1c1c" stroke-width="10"/></g></g>`;
const lock = `<g id="ic-lock" opacity="0"><g transform="translate(${lockAt[0]},${lockAt[1] - 40})"><path d="M-22 -10 V-30 A22 22 0 0 1 22 -30 V-10" fill="none" stroke="#1d93ba" stroke-width="10"/><rect x="-36" y="-12" width="72" height="56" rx="10" fill="#1d93ba" stroke="#ffffff" stroke-width="4"/><circle cy="12" r="8" fill="#ffffff"/></g></g>`;
const hg = `<g id="ic-hg" opacity="0" transform="translate(1000,470)"><path d="M-30 -46 H30 L0 0 L30 46 H-30 L0 0 Z" fill="#f3e3b8" stroke="#1c1c1c" stroke-width="7" stroke-linejoin="round"/><path d="M-14 34 H14 L0 18 Z" fill="#c9a24a"/><line x1="-40" y1="-46" x2="40" y2="-46" stroke="#1c1c1c" stroke-width="9"/><line x1="-40" y1="46" x2="40" y2="46" stroke="#1c1c1c" stroke-width="9"/></g>`;
const nodeSvg = nodes.map(([x, y], i) => `<g id="nd${i}" opacity="0"><circle cx="${x}" cy="${y}" r="26" fill="#e0453a" stroke="#ffffff" stroke-width="5"/><text x="${x}" y="${y + 11}" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-weight="900" font-size="32" fill="#fff">${i + 1}</text></g>`).join("");
const wsvg = `<svg id="wsv" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible" data-layout-ignore>
  <line id="wpipe" x1="${pA[0]}" y1="${pA[1]}" x2="${pE[0]}" y2="${pE[1]}" stroke="#e0453a" stroke-width="7" stroke-linecap="round" opacity="0"/>
  <line id="trail" x1="${pA[0]}" y1="${pA[1] - 4}" x2="${pC[0]}" y2="${pC[1] - 4}" stroke="#2aa3c9" stroke-width="12" stroke-linecap="round" stroke-dasharray="${Math.ceil(Math.hypot(pC[0] - pA[0], pC[1] - pA[1]))} 9999" opacity="0"/>
  ${ring("rg-sh", sh)}${ring("rg-st", sb)}${ring("rg-ex", sx)}
  <g id="end-mk" opacity="0"><circle cx="${pE[0]}" cy="${pE[1]}" r="20" fill="#e0453a"/><line x1="${pE[0] - 10}" y1="${pE[1] + 20}" x2="1640" y2="470" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8"/></g>
  ${ring("rg-amm", amm, "#e0453a", 60)}
  <g id="fan" opacity="0">${fan}</g>
  ${nodeSvg}
  <g id="cut" opacity="0"><rect x="${nodes[2][0] + 22}" y="${nodes[2][1] - 30}" width="34" height="40" fill="#efebe3"/><path d="M${nodes[2][0] + 26} ${nodes[2][1] - 34} l26 26 m0 -26 l-26 26" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/></g>
  ${lead("ld0", 380, 622, nodes[0])}${lead("ld1", 560, 482, nodes[1])}${lead("ld2", 820, 362, nodes[2])}${lead("ld3", 1000, 640, nodes[3])}
  ${mag}${lock}${hg}
  <g id="grad" opacity="0"><defs><linearGradient id="gr" x1="0" x2="1"><stop offset="0" stop-color="#1f9d55"/><stop offset="1" stop-color="#e0453a"/></linearGradient></defs>
    <path d="M520 214 H1040 V196 L1090 230 L1040 264 V246 H520 Z" fill="url(#gr)"/></g>
</svg>`;
const card = (id, x, y, txt, cls = "") => `<div class="wc ${cls} hide" id="${id}" style="left:${x}px;top:${y}px">${txt}</div>`;
// 100 点：72 红实心（THORChain → BTC）、16 红空心（eXch）、12 灰（其他）
const dots = []; for (let i = 0; i < 100; i++) { const r = Math.floor(i / 20), q = i % 20, x = 22 + q * 28, y = 22 + r * 28;
  dots.push(i < 72 ? `<circle cx="${x}" cy="${y}" r="10" fill="#e0453a"/>` : i < 88 ? `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#e0453a" stroke-width="4"/>` : `<circle cx="${x}" cy="${y}" r="10" fill="#c9c3b7"/>`); }
const dotCard = `<div class="dcard hide" id="dots"><svg width="580" height="160" viewBox="0 0 580 160">${dots.join("")}</svg>
  <div class="dleg"><span id="lg0"><i style="background:#e0453a"></i>约 72% THORChain → BTC</span><span id="lg1"><i style="border:4px solid #e0453a"></i>约 16% eXch</span><span><i style="background:#c9c3b7"></i>其他</span></div></div>`;
const html = wsvg
  + kw("kw-hr", `追回窗口 <b>以小时计</b>`, { x: 700, y: 130, size: 56, accent: "#e0453a" })
  + card("c-st", 300, 548, "可冻结的稳定币", "g") + card("c-ex", 660, 410, "交易所里的充值", "g") + card("c-sh", 64, 620, "可暂停的合约份额", "g")
  + card("c-n1", 1300, 470, "跨链后的原生币", "r") + card("c-n2", 1300, 550, "混币器里的存款", "r") + card("c-n3", 1300, 630, "场外交易的现金", "r")
  + kw("kw-tr", `资金<b>追踪</b>`, { x: 700, y: 120, size: 52, accent: "#1d93ba" })
  + kw("kw-fz", `<b>冻结</b> · 阻止地址转出`, { x: 1000, y: 120, size: 52, accent: "#1d93ba" })
  + `<div class="meta hide" id="meta">比喻</div><div class="metabox hide" id="metabox"></div>`
  + card("s1", 80, 562, "① 换掉稳定币 · 躲开发行方冻结", "r") + card("s2", 330, 424, "② 分散到大量地址", "r")
  + card("s3", 560, 304, "③ 跨链 / 进混币器 · 切断关联", "r") + card("s4", 960, 640, "④ 场外交易 · 小额进交易所 → 现金", "r")
  + card("s5", 1050, 438, "等关注度下降", "n")
  + dotCard + card("c-iss", 70, 430, "← 稳定币发行方", "")
  + evt("ev-by", `<b>Bybit</b> · 2025 年 2 月`, { color: "#e0453a" }) + evt("ev-src", gtag("公开报道", "margin:0"), { top: 200 })
  + `<div class="gcap hide" id="gcap"><span>拦截点 靠前</span><b>成功率</b><span>靠后</span></div>`;
const css = `
  .wc { position: absolute; background: #ffffff; border-radius: 14px; padding: 8px 20px 10px; font-size: 32px; font-weight: 900; white-space: nowrap;
    border-left: 8px solid #1d93ba; box-shadow: 0 8px 20px rgba(70,60,40,0.14); }
  .wc.g { border-left-color: #1f9d55; color: #17733f; } .wc.r { border-left-color: #e0453a; color: #b8322a; } .wc.n { border-left-color: #8a8478; color: #4a463f; }
  .meta { position: absolute; left: 1100px; top: 128px; font-size: 38px; font-weight: 900; color: #6d685e; background: #ebe6dc; border-radius: 10px; padding: 4px 20px 6px; }
  .metabox { position: absolute; left: 1086px; top: 114px; width: 144px; height: 84px; border: 5px dashed #e0453a; border-radius: 12px; }
  .dcard { position: absolute; left: 470px; top: 112px; width: 620px; background: #fffdf8; border-radius: 16px; padding: 10px 14px 12px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
  .dleg { display: flex; flex-wrap: wrap; gap: 4px 22px; font-size: 28px; font-weight: 800; color: #1c1c1c; white-space: nowrap; }
  .dleg i { display: inline-block; width: 18px; height: 18px; border-radius: 50%; margin-right: 6px; vertical-align: -2px; box-sizing: border-box; }
  .gcap { position: absolute; left: 520px; top: 270px; width: 570px; display: flex; justify-content: space-between; align-items: baseline; font-size: 30px; font-weight: 900; }
  .gcap span:first-child { color: #17733f; } .gcap span:last-child { color: #b8322a; } .gcap b { font-size: 38px; }`;

// ---------------------------------------------------------------- 词语时刻
const TM = {
  hr: w("以小时计", 1), st: w("稳定币", 2), dep: w("充值", 2), sh: w("合约份额", 2),
  n1: w("原生币", 3), n2: w("混币器", 3), n3: w("场外交易", 3),
  tr: w("资金追踪", 5), fz: w("冻结", 6), ad: w("地址", 6),
  meta: w("打个比方", 7), exits: w("出口", 7),
  e0: w("稳定币发行方", 8), e1: w("交易所", 8), e2: w("跨链桥", 8), e3: w("混币器", 8),
  hw: w("国道", 10), plate: w("换了车牌", 10), no: w("没有义务", 13), op: w("中心化运营方", 14),
  s1: w("换掉", 16), s2: w("分散", 17), s3: w("跨链", 18), cut: w("切断", 18), s4: w("场外交易", 19), s4b: w("小额分批", 19), s5: w("关注度", 20),
  by: LS[21], gr: w("拦截点", 22), rate: w("成功率", 22),
};
const t = (x) => f(x);
// 世界画布位移（u, v）→ (dx, dy)
const dXY = (du, dv) => [du * 0.819 + dv * 0.574, -du * 0.287 + dv * 0.41].map((x) => x.toFixed(1));
const [cdx, cdy] = dXY(150, 0), [rdx, rdy] = dXY(750, 70);
const mdx = pC[0] - pA[0], mdy = pC[1] - pA[1], TL = Math.ceil(Math.hypot(mdx, mdy));

S.build({
  cam0: "mintB", sub: "越早设卡，拦住越多",
  grid: { u0: -4800, u1: 24000, v0: -14900, v1: 14600 }, box: [-1990, -8360, 19510, 11110],   // 盖住本段镜头 mintB / wide / exitC（含上一段终点）
  shown: ["#lb-mp0", "#lb-mp1"], css, html,
  terms: [
    { id: "t0", t: "原生币", d: "链自身的币，没有发行方", at: w("原生币", 3) },
    { id: "t1", t: "混币器", d: "把多人的币混在一起、切断关联的服务", at: w("混币器", 18) },
    { id: "t2", t: "跨链桥", d: "把资产从一条链转到另一条链的服务", at: w("跨链桥", 8) },
    { id: "t3", t: "场外交易", d: "不经交易所撮合、双方直接买卖", at: w("场外交易", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给一句准确的说法（mintB，续 seg1 末帧）
      out("#qm0, #qm1, #qm2, #qm3, #qm4, #hl0, #hl1, #hl2, #hl3, #hl4", 1.0, 0.4);   // 标题卡期间收起 seg1 的题卡残留
      tl.to("#lkw0, #lkw1", { y: 0, duration: 0.6, ease: "bounce.out" }, ${t(LS[0] + 0.4)});
      // ===== L1 以小时计
      pop("#kw-hr", ${t(LS[1])});
      // ===== L2 拉到全景：三处绿圈（屏幕层，画大）
      out("#kw-hr", ${t(LS[2] + 0.3)}); out("#lb-mp0, #lb-mp1", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "wide", 1.6);
      fadeIn("#wpipe", ${t(LS[2] + 1.0)}, 0.5);
      fadeIn("#rg-st", ${t(TM.st)}); pop("#c-st", ${t(TM.st + 0.1)});
      fadeIn("#rg-ex", ${t(TM.dep)}); pop("#c-ex", ${t(TM.dep + 0.1)});
      fadeIn("#rg-sh", ${t(TM.sh)}); pop("#c-sh", ${t(TM.sh + 0.1)});
      // ===== L3 几小时之后：绿圈变红，资金管右端三种去向
      tl.to("#rg-st, #rg-ex, #rg-sh", { attr: { stroke: "#e0453a" }, duration: 0.4 }, ${t(LS[3] + 0.1)});
      tl.to("#c-st, #c-ex, #c-sh", { color: "#b8322a", borderLeftColor: "#e0453a", opacity: 0.55, duration: 0.4 }, ${t(LS[3] + 0.1)});
      fadeIn("#end-mk", ${t(TM.n1 - 0.3)}); pop("#c-n1", ${t(TM.n1)}); pop("#c-n2", ${t(TM.n2)}); pop("#c-n3", ${t(TM.n3)});
      // ===== L4–L6 追踪（放大镜沿管滑过）与冻结（锁挂上地址）
      out("#rg-st, #rg-ex, #rg-sh, #c-st, #c-ex, #c-sh, #c-n1, #c-n2, #c-n3, #end-mk", ${t(LS[4])});
      fadeIn("#ic-mag", ${t(TM.tr - 0.3)}); pop("#kw-tr", ${t(TM.tr)});
      tl.fromTo("#ic-mag", { x: 0, y: 0 }, { x: ${mdx}, y: ${mdy}, duration: 3.0, ease: "power1.inOut", immediateRender: false }, ${t(TM.tr + 0.2)});
      tl.fromTo("#trail", { attr: { "stroke-dashoffset": ${TL} } }, { attr: { "stroke-dashoffset": 0 }, duration: 3.0, ease: "power1.inOut", immediateRender: false }, ${t(TM.tr + 0.2)}); fadeIn("#trail", ${t(TM.tr + 0.2)}, 0.2);
      out("#kw-tr, #ic-mag, #trail", ${t(LS[6] - 0.2)});
      pop("#kw-fz", ${t(TM.fz)});
      tl.fromTo("#ic-lock", { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out", immediateRender: false }, ${t(TM.ad)});
      // ===== L7 比喻：右移到出城口，四座关卡依次亮
      out("#kw-fz, #ic-lock, #wpipe", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "exitC", 1.6);
      pop("#meta", ${t(TM.meta + 0.3)});
      [0, 1, 2, 3].forEach((i) => flash("#chk" + i, ${t(TM.exits + 0.2)} + i * 0.35, 2, 0.35));
      // ===== L8 四个出口的门牌依次亮（发行方出口指向 B）
      pop("#c-iss", ${t(Math.min(TM.e0, LS[8] + 0.3))}); pop("#lb-tc", ${t(TM.e1)}); pop("#lb-br", ${t(TM.e2)}); pop("#lb-lot", ${t(TM.e3)}); pop("#lb-stall", ${t(TM.e3 + 0.5)});
      // ===== L9 设卡越早：一号道闸先落，币挡在闸前
      KIT.arm(tl, "chk0", ${t(LS[9])}, false, 0.6);
      [0, 1, 2].forEach((i) => tl.to("#mvc" + i, { x: ${cdx}, y: ${cdy}, duration: 0.8, ease: "power2.out" }, ${t(LS[9] + 0.4)} + i * 0.1));
      pop("#lb-stop", ${t(LS[9] + 1.3)});
      // ===== L10 关键画面：劫匪开上国道，车牌 USDT → BTC，身后道闸落下
      out("#lb-stop", ${t(LS[10] - 0.2)}); pop("#lb-rob", ${t(LS[10])});
      tl.to("#rob-mv", { x: ${rdx}, y: ${rdy}, duration: 1.8, ease: "power1.inOut" }, ${t(TM.hw - 0.3)});
      out("#lb-rob", ${t(TM.hw - 0.4)}); pop("#lb-hw", ${t(TM.hw)});
      out("#plt-a", ${t(TM.plate)}, 0.25); fadeIn("#plt-b", ${t(TM.plate + 0.15)}, 0.25);
      [1, 2, 3].forEach((i) => KIT.arm(tl, "chk" + i, ${t(TM.plate + 0.4)} + (i - 1) * 0.25, false, 0.5));
      // ===== L11 比方有一处不成立
      pop("#metabox", ${t(LS[11] + 0.3)}); flash("#metabox", ${t(LS[11] + 0.7)}, 2, 0.3);
      // ===== L12–L13 桥和混币器的关卡变灰：没人管
      tl.to("#chk0, #chk1", { opacity: 0.4, filter: "grayscale(1)", duration: 0.6 }, ${t(LS[12] + 0.4)});
      out("#lb-hw", ${t(LS[12])}); pop("#lb-free", ${t(TM.no - 0.2)});
      // ===== L14 有中心化运营方的出口亮绿
      out("#lb-tc", ${t(TM.op - 0.2)}); pop("#lb-op2", ${t(TM.op)}); out("#lb-br", ${t(TM.op + 0.1)}); pop("#lb-op1", ${t(TM.op + 0.3)}); tl.to("#chk3", { scale: 1.0 }, ${t(TM.op)});
      // ===== L15 拉回全景：资金管上四个编号节点
      out("#meta, #metabox, #lb-free, #lb-op1, #lb-op2, #c-iss, #lb-tc, #lb-br, #lb-lot, #lb-stall", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "wide", 1.6); fadeIn("#wpipe", ${t(LS[15] + 1.0)}, 0.4);
      [0, 1, 2, 3].forEach((i) => pop("#nd" + i, ${t(LS[15] + 1.7)} + i * 0.25, 0.25));
      // ===== L16 ① 换掉稳定币（AMM 池闪）
      fadeIn("#rg-amm", ${t(TM.s1 - 0.2)}); flash("#rg-amm", ${t(TM.s1 + 0.1)}, 2, 0.3); fadeIn("#ld0", ${t(TM.s1)}); pop("#s1", ${t(TM.s1 + 0.1)});
      out("#rg-amm", ${t(LS[17] - 0.2)});
      // ===== L17 ② 分散到六个地址
      fadeIn("#ld1", ${t(TM.s2)}); pop("#s2", ${t(TM.s2 + 0.1)}); pop("#fan", ${t(TM.s2 + 0.4)}, 0.4);
      // ===== L18 ③ 跨链 / 混币器：红线断开
      fadeIn("#ld2", ${t(TM.s3)}); pop("#s3", ${t(TM.s3 + 0.1)}); pop("#cut", ${t(TM.cut)});
      // ===== L19 ④ 场外交易 / 小额进交易所
      fadeIn("#ld3", ${t(TM.s4)}); pop("#s4", ${t(TM.s4 + 0.1)});
      // ===== L20 等关注度下降（沙漏）
      pop("#ic-hg", ${t(TM.s5 - 0.4)}); pop("#s5", ${t(TM.s5)});
      tl.to("#ic-hg", { rotation: 180, svgOrigin: "1000 470", duration: 0.8, ease: "power2.inOut" }, ${t(TM.s5 + 0.6)});
      // ===== L21 回到出城口：Bybit 100 点
      out("#wpipe, #nd0, #nd1, #nd2, #nd3, #ld0, #ld1, #ld2, #ld3, #s1, #s2, #s3, #s4, #s5, #fan, #cut, #ic-hg", ${t(LS[21] - 0.2)});
      cam(${t(LS[21])}, "exitC", 1.6);
      pop("#ev-by", ${t(LS[21] + 0.6)}); pop("#ev-src", ${t(LS[21] + 1.0)}); pop("#dots", ${t(LS[21] + 1.8)}, 0.4);
      flash("#lg0", ${t(LS[21] + 4.4)}, 2, 0.35); flash("#lg1", ${t(LS[21] + 7.6)}, 2, 0.35); flash("#lg0", ${t(LS[21] + 10.2)}, 1, 0.5);
      // ===== L22 拦截点越靠前越好：绿 → 红渐变箭头
      out("#dots, #ev-by, #ev-src", ${t(LS[22] - 0.2)});
      fadeIn("#grad", ${t(TM.gr)}, 0.5); pop("#gcap", ${t(TM.rate - 0.1)});
`,
});
