// ep25/seg4「④ 最后手段」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.counterC（BRIEF）。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.courtD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7, E9] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 包一层缩放（不支持 opts.scale 的物件），anchors 一并换算
const scA = (a, sc) => Array.isArray(a) && typeof a[0] === "number" ? sc(a)
  : Array.isArray(a) ? a.map((x) => scA(x, sc))
  : a && typeof a === "object" ? Object.fromEntries(Object.entries(a).map(([k, v]) => [k, scA(v, sc)])) : a;
function wput(key, o, r, k, dy = 0, extra = {}) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  A[key] = scA(A[key], sc);
}
const sc_ = (o) => o.scale;

// ---------------------------------------------------------------- 石板路 + 资金管（本段范围 u 6000–14600）
{
  const U0 = 6000, U1 = 14600, V0 = L.ROAD.v0, V1 = L.ROAD.v1;
  const P = [Wp(U0, V0), Wp(U1, V0), Wp(U1, V1), Wp(U0, V1)].map((q) => q.join(",")).join(" ");
  let seams = "";
  for (let u = U0 + 200; u < U1; u += 200) { const [x0, y0] = Wp(u, V0), [x1, y1] = Wp(u, V1); seams += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#cdc7bb" stroke-width="2"/>`; }
  add({ u: U0, v: 0 }, `<polygon points="${P}" fill="#dcd7cd" stroke="#c4beb1" stroke-width="3"/>${seams}`, -1e6);
  put("pipe", { u: U0, v: 0 }, E1.pipe({ u: U0, v: 0 }, { id: "pipe", pts: [[0, 0, 4], [U1 - U0, 0, 4]], r: 8, flow: true, flowColor: "#e0453a" }), -1e6 + 1);
}

// ---------------------------------------------------------------- C 出城口（开场 counterC）
put("ctr", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "ctr", scale: sc_(L.COUNTER), sign: "交易所 · 风控" }));
L.CHECKS.slice(2).forEach((q, i) => wput("ckp" + i, q, O.checkpoint(q, { id: "ckp" + i, n: ["③", "④"][i] }), q.scale));
put("rdoc", L.RISKDOC, O.doc(L.RISKDOC, { id: "rdoc", title: "风控名单", standing: true }));
put("stall", L.STALL, E8.marketStall(L.STALL, { id: "stall", scale: sc_(L.STALL), head: "场外交易" }));
put("robber", L.ROBBER, O.person(L.ROBBER, { id: "robber", role: "attacker", scale: sc_(L.ROBBER) }));

// ---------------------------------------------------------------- D 左：链级冻结
wput("chn", L.CHAIN, O.chain(L.CHAIN, { id: "chn", n: 4, title: "Sui" }), L.CHAIN.scale);
put("rota", L.ROTA, E9.rotaWheel(L.ROTA, { id: "rota", scale: sc_(L.ROTA), n: 8, plate: "验证者" }));
wput("msig", L.MSIG, E5.accountSafe(L.MSIG, { id: "msig", keys: { owner: [1], active: [1], witness: [1] }, inserted: true }), L.MSIG.scale);
put("kcard", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kcard", scale: sc_(L.KEYCARD), text: "安全委员会" }), 0, { grow: true });
L.ENG_D.forEach((q, i) => put("engd" + i, q, O.person(q, { id: "engd" + i, role: "engineer", scale: q.scale }), 0, { grow: true }));
const SIGNS = ["链级冻结", "谈判", "法院"];
L.SIGN_D.forEach((q, i) => put("sgd" + i, q, E1.signBoard(q, { id: "sgd" + i, style: "plate", text: SIGNS[i] })));

// 点阵（原生 SVG 圆）
const dotGrid = (pre, o, n, cols, sp, r, fill, x0 = 10, y0 = 14) => {
  const [X, Y] = at(o); const c = [];
  for (let i = 0; i < n; i++) c.push(`<circle id="${pre}-${i}" cx="${X + x0 + (i % cols) * sp}" cy="${Y + y0 + Math.floor(i / cols) * sp}" r="${r}" fill="${fill}" stroke="${fill === "none" ? "#8a8478" : "none"}" stroke-width="2"/>`);
  return c.join("");
};
const DD = at(L.DOTS_D);
add(L.DOTS_D, S.hid("dd", dotGrid("dd", L.DOTS_D, 22, 11, 22, 8, "#e0453a")), 2000);
const dLock = { u: L.DOTS_D.u + 110, v: L.DOTS_D.v + 52 };
wput("dlock", dLock, O.padlock(dLock, { id: "dlock" }), 0.5, 2001);
// 6 个红点沿资金管滚出：先落到管上，再沿 +u
const pipeIn = at({ u: L.DOTS_D.u + 300, v: 0 }), pipeOut = at({ u: L.DOTS_D.u + 2600, v: 0 });

// 投票条（转台上方）
const VB = up(A.rota.top, 46);
add(L.ROTA, `<g id="vote" opacity="0"><rect x="${VB[0] - 90}" y="${VB[1] - 9}" width="180" height="18" rx="9" fill="#e9e4d9" stroke="#8a8478" stroke-width="2"/>
  <rect id="vbar" x="${VB[0] - 90}" y="${VB[1] - 9}" width="180" height="18" rx="9" fill="#1f9d55"/>
  <line x1="${VB[0] - 90 + 180 * 0.667}" y1="${VB[1] - 15}" x2="${VB[0] - 90 + 180 * 0.667}" y2="${VB[1] + 15}" stroke="#1c1c1c" stroke-width="3" stroke-dasharray="4 3"/></g>`, 3000);

// 关键画面：每个区块旁投出淡红锁影 + 攻击者区块上一把实锁
const lockIcon = (x, y, solid) => `<g transform="translate(${x},${y})"><path d="M-12,-8 v-10 a12,12 0 0 1 24,0 v10" fill="none" stroke="#e0453a" stroke-width="5"/>
  <rect x="-18" y="-9" width="36" height="28" rx="5" fill="${solid ? "#e0453a" : "rgba(224,69,58,0.22)"}" stroke="#e0453a" stroke-width="3" ${solid ? "" : 'stroke-dasharray="6 4"'}/><circle cx="0" cy="4" r="4" fill="${solid ? "#fff" : "#e0453a"}"/></g>`;
const BL = A.chn.blocks;
add(L.CHAIN, S.hid("lk0", lockIcon(BL[0][0], BL[0][1] - 70, true)) + BL.slice(1).map((p, i) => S.hid("lks" + (i + 1), lockIcon(p[0], p[1] - 70, false))).join(""), 4000);

// ---------------------------------------------------------------- D 中：谈判
wput("tower", L.TOWER_D, O.tower(L.TOWER_D, { id: "tower" }), L.TOWER_D.scale);
add(L.ENVELOPE, S.hid("envg", O.envelope(L.ENVELOPE, { id: "env", w: 90, h: 56 }).svg));
L.BOUNTY.forEach((q, i) => put("bty" + i, q, E7.oddCoin(q, { id: "bty" + i, scale: q.scale }), 0, { grow: true }));
L.RTAG.forEach((q, i) => { const r = E7.returnTag(q, { id: "rtag" + i, scale: q.scale, face: "ok" }); A["rtag" + i] = r.anchors; add(q, S.hid("rtg" + i, r.svg)); });
add(L.DOTS_TALK, S.hid("dpn", dotGrid("dp", L.DOTS_TALK, 61, 13, 22, 8, "#2aa3c9")) + S.hid("deu", dotGrid("de", L.DOTS_TALK, 20, 10, 22, 8, "#e0453a")), 2000);
const SB1 = L.rect(L.SIGN_D[1], "signPlate");
add(L.SIGN_D[1], S.hid("negbox", `<rect x="${SB1[0] - 14}" y="${SB1[1] - 14}" width="${SB1[2] - SB1[0] + 28}" height="${SB1[3] - SB1[1] + 28}" rx="10" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/>`), 5000);

// ---------------------------------------------------------------- D 右：法院
wput("bal", L.BAL, E1.balance(L.BAL, { id: "bal", tilt: 0 }), L.BAL.scale);
wput("bkt", L.BUCKET, O.bucket(L.BUCKET, { id: "bkt" }), L.BUCKET.scale);
{ const k = L.KEY_D.scale, [gx, gy] = at(L.KEY_D);
  add(L.KEY_D, S.hid("keyr", `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${O.key(L.KEY_D, { id: "keyd", stand: true }).svg}</g>`), 10); }
wput("lockd", L.LOCK_D, O.padlock(L.LOCK_D, { id: "lockd" }), L.LOCK_D.scale);
wput("hg", L.HOURGLASS, O.hourglass(L.HOURGLASS, { id: "hg" }), L.HOURGLASS.scale);
put("dseize", L.DOC_SEIZE, O.doc(L.DOC_SEIZE, { id: "dseize", title: "没收", standing: true, stamp: false }));
add(L.DOC_RETURN, S.hid("dretg", O.doc(L.DOC_RETURN, { id: "dret", title: "实物返还申请", standing: true }).svg));
add(L.DOTS_COURT, S.hid("dbtc", dotGrid("db", L.DOTS_COURT, 95, 19, 17, 6.5, "#d9a514", 8, 12)), 2000);

// ---------------------------------------------------------------- 世界标签
const DDc = [DD[0] + 120, DD[1] + 60];
lb("lb-dd", [DD[0] + 120, DD[1] + 64], "约 2.23 亿美元 · 被盗", "lab-rs lab-sm", "t");
lb("lb-dd2", [DD[0] + 120, DD[1] + 64], "约 1.62 亿 · 冻结", "lab-gs lab-sm", "t");
const pipeMid = at({ u: L.DOTS_D.u + 900, v: 0 });
lb("lb-out", [pipeMid[0], pipeMid[1] + 24], "约 6300 万 · 跨链走", "lab-rs lab-sm", "t");
lb("lb-ovf", up(A.chn.top, 20), "算术溢出", "lab-r lab-sm", "b");
lb("lb-2016", up(A.dseize.top, 8), "2016 年从 Bitfinex 被盗", "lab-grey lab-sm", "b");
lb("lb-vote", up(VB, 22), "质押权 约 90.9%", "lab-gs lab-sm", "b");
lb("lb-msig", up(A.msig.top, 10), "三方共管多签", "lab-cs lab-sm", "b");
lb("lb-saved", A.msig.front ?? A.msig.center, "钱保住了", "lab-gs lab-sm", "c");
lb("lb-q", [A.rota.center[0] + 120, A.rota.center[1] - 40], "?", "lab-rs", "l");
const ST = A.rota.seats;
const sL = ST.reduce((m, p, i) => (p[0] < ST[m][0] ? i : m), 0), sR = ST.reduce((m, p, i) => (p[0] > ST[m][0] ? i : m), 0);
lb("lb-res0", up(ST[sL], 12), "保留", "lab-grey lab-sm", "r");
lb("lb-res1", up(ST[sR], 12), "保留", "lab-grey lab-sm", "l");
lb("lb-any", up(A.chn.top, 60), `可以干预任意地址${gtag("解读")}`, "lab-rs", "b");
lb("lb-kc", up(A.kcard.top, 8), "Arbitrum 安全委员会", "lab-cs lab-sm", "b");
const DT = at(L.DOTS_TALK);
lb("lb-poly", [DT[0] + 150, DT[1] + 128], "约 6.1 亿美元", "lab-cs lab-sm", "t");
lb("lb-poly2", [DT[0] + 150, DT[1] + 128], "约 15 天内归还", "lab-gs lab-sm", "t");
lb("lb-eul", [DT[0] + 150, DT[1] + 128], "约 1.97 亿美元", "lab-rs lab-sm", "t");
lb("lb-eul2", [DT[0] + 150, DT[1] + 128], "可追回资金已归还", "lab-gs lab-sm", "t");
const ENVP = at(L.ENVELOPE);
lb("lb-env", up(ENVP, 40), "赏金 10%", "lab-ink lab-sm", "b");
lb("lb-bounty", up(A.tower.top, 10), "悬赏 100 万美元 · 征集线索", "lab-ink lab-sm", "b");
lb("lb-rt0", up(A.rtag0.top, 8), "归还", "lab-gs lab-sm", "b");
lb("lb-rt1", up(A.rtag1.top, 8), "归还", "lab-gs lab-sm", "b");
lb("lb-why0", up(A.rtag0.top, 8), "?", "lab-grey", "b");
lb("lb-why1", up(A.rtag1.top, 8), "?", "lab-grey", "b");
lb("lb-notmain", [SB1[0] + (SB1[2] - SB1[0]) / 2, SB1[3] + 18], "不是预案主线", "lab-rs lab-sm", "t");
lb("lb-key", up(at(L.KEY_D), 40), "私钥文件", "lab-cs lab-sm", "b");
lb("lb-bkt", [at(L.BUCKET)[0], at(L.BUCKET)[1] + 30], "云存储", "lab-cs lab-sm", "t");
lb("lb-dec", up(A.lockd.top, 6), "解密", "lab-gs lab-sm", "b");
const DC = at(L.DOTS_COURT);
lb("lb-btc", [DC[0] + 165, DC[1] + 116], "约 94636 BTC · 当时约 36 亿美元", "lab-ink lab-sm", "t");
lb("lb-hg", up(A.hg.top, 8), "好几年", "lab-rs lab-sm", "b");
lb("lb-disp", up(A.bal.top, 8), "仍有争议", "lab-grey lab-sm", "b");

// ---------------------------------------------------------------- 屏幕层卡片
const SRC = (t) => `<span class="src-k">来源</span>${t}`;
const html = [
  ck("r-chain", "链级冻结", { x: 1400, y: 300, w: 420, kind: "c" }),
  ck("r-talk", "谈判", { x: 1400, y: 392, w: 420, kind: "c" }),
  ck("r-court", "法院", { x: 1400, y: 484, w: 420, kind: "c" }),
  evt("ev-cetus", "<b>Cetus</b> · 2025 年 5 月 · Sui", { top: 120 }),
  evt("sr-cetus", SRC("The Block 报道 · Cointelegraph 报道"), { top: 200, color: "#8a8478" }),
  evt("sr-cf", SRC("Chainflow 声明"), { top: 202, color: "#8a8478" }),
  evt("ev-bn", "<b>Binance</b> · 2026 年 10 月", { top: 122 }),
  evt("sr-bn", SRC("TRM 分析 · Elliptic 分析"), { top: 204, color: "#8a8478" }),
  kw("kw-arb", `强制转走 <b>8426 ETH · 7460 万 ARB</b>`, { x: 80, y: 760, size: 38, accent: "#e0453a" }),
  evt("ev-poly", "<b>Poly Network</b> · 2021 年 8 月", { top: 124 }),
  evt("sr-poly", SRC("Poly Network 复盘 · CertiK"), { top: 206, color: "#8a8478" }),
  evt("ev-eul", "<b>Euler Finance</b> · 2023 年 3 月", { top: 126 }),
  evt("sr-eul", SRC("The Block 报道 · Cointelegraph 报道"), { top: 208, color: "#8a8478" }),
  evt("ev-bfx", "<b>Bitfinex 被盗资金</b> · 2022 年 2 月", { top: 128 }),
  evt("sr-doj", SRC("美国司法部"), { top: 210, color: "#8a8478" }),
  evt("sr-ret", SRC("The Block 报道 · Cointelegraph 报道"), { top: 212, color: "#8a8478" }),
  `<div class="tline hide" id="tline"><div class="tl-bar"></div>
     <div class="tl-p" id="tl-0"><i></i><b>2016</b><span>被盗</span></div>
     <div class="tl-p" id="tl-1"><i></i><b>2022</b><span>没收</span></div>
     <div class="tl-p" id="tl-2"><i class="r"></i><b>2025</b><span>仍在争议</span></div></div>`,
].join("\n");
const css = `
    .lab-grey { background: #8a8478; border-color: #8a8478; color: #ffffff; }
    .sb-evt .src-k { font-size: 28px; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 10px 4px; margin-right: 12px; vertical-align: 4px; }
    .sb-evt[id^="sr-"] { font-size: 30px; }
    .tline { position: absolute; left: 120px; top: 770px; width: 800px; box-sizing: border-box; height: 110px; background: #fffdf8; border-radius: 16px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); padding: 0 50px; }
    .tline .tl-bar { position: absolute; left: 130px; right: 130px; top: 34px; height: 6px; background: #8a8478; border-radius: 3px; }
    .tline .tl-p { position: absolute; top: 18px; width: 200px; text-align: center; transform: translateX(-100px); white-space: nowrap; }
    .tline .tl-p i { display: block; width: 26px; height: 26px; margin: 0 auto 4px; border-radius: 50%; background: #1d93ba; border: 4px solid #fffdf8; }
    .tline .tl-p i.r { background: #e0453a; }
    .tline .tl-p b { font-size: 30px; font-weight: 900; margin-right: 8px; } .tline .tl-p span { font-size: 28px; font-weight: 700; color: #6d685e; }
    #tl-0 { left: 130px; } #tl-1 { left: 400px; } #tl-2 { left: 670px; }`;

// ---------------------------------------------------------------- 词语时刻
const M = (i, fr) => LS[i] + (LE[i] - LS[i]) * fr;
const TM = {};
const t = (x) => f(x);
// 红点 / 绿点位移（Node 侧算好）
const dd = (i) => { const c = [DD[0] + 10 + (i % 11) * 22, DD[1] + 14 + Math.floor(i / 11) * 22]; return c; };
const RED6 = [16, 17, 18, 19, 20, 21];
const GREEN16 = [...Array(16).keys()];
const redMoves = RED6.map((i, j) => { const c = dd(i); return { id: "dd-" + i, a: [pipeIn[0] - c[0] - j * 14 * 0.819, pipeIn[1] - c[1] + j * 14 * 0.287], b: [pipeOut[0] - c[0] - j * 14 * 0.819, pipeOut[1] - c[1] + j * 14 * 0.287] }; });
const IN = A.msig.inSlot ?? A.msig.top;
const greenMoves = GREEN16.map((i) => { const c = dd(i); return { id: "dd-" + i, d: [IN[0] - c[0], IN[1] - c[1]] }; });

S.build({
  cam0: "counterC", sub: "能救急，也有代价",
  grid: { u0: 6300, u1: 15100, v0: -4600, v1: 3800 }, box: [5140, -4590, 6770, 2730],   // 盖住本段镜头 counterC / chainD / talkD / courtD（含上一段终点）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "验证者", d: "负责出块和确认交易的节点", at: w("验证者", 4) },
    { id: "t1", t: "多签", d: "需要多人共同签名才能动用的钱包", at: w("多签", 5) },
    { id: "t2", t: "白帽", d: "发现漏洞后善意处理的安全研究者", at: w("白帽", 10) },
    { id: "t3", t: "闪电贷", d: "同一笔交易内借出并还清的贷款", at: w("闪电贷", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 前排拦不住，后面还有三条更重的路（counterC，右侧三块牌）
      pop("#r-chain", ${t(M(0, 0.45))}); pop("#r-talk", ${t(M(0, 0.6))}); pop("#r-court", ${t(M(0, 0.75))});
      // ===== L1 链级冻结：第一块牌闪一下，镜头右移到 chainD
      bump("#r-chain", ${t(LS[1])}, 1.08); out("#r-chain, #r-talk, #r-court", ${t(LS[1] + 0.4)}, 0.3);
      cam(${t(LS[1] + 0.3)}, "chainD", 2.2, "power2.inOut");
      // ===== L2 Cetus 被盗约 2.23 亿美元：事件卡 + 22 红点 + 来源卡
      pop("#ev-cetus", ${t(LS[2] + 0.1)}); fadeIn("#dd", ${t(M(2, 0.2))}, 0.5); pop("#lb-dd", ${t(M(2, 0.28))});
      pop("#sr-cetus", ${t(M(2, 0.42))}); pop("#lb-ovf", ${t(M(2, 0.66))}); bump("#lb-dd", ${t(M(2, 0.9))}, 1.08);
      // ===== L3 约 6300 万跨链：6 个红点落到资金管上，沿 +u 滚出画面
      out("#lb-dd, #lb-ovf", ${t(LS[3] - 0.2)});
      ${JSON.stringify(redMoves)}.forEach((m, j) => {
        tl.to("#" + m.id, { x: m.a[0], y: m.a[1], duration: 0.6, ease: "power2.inOut" }, ${t(LS[3] + 0.2)} + j * 0.08);
        tl.to("#" + m.id, { x: m.b[0], y: m.b[1], duration: 1.8, ease: "power1.in" }, ${t(LS[3] + 1.0)} + j * 0.08);
        tl.to("#" + m.id, { opacity: 0, duration: 0.3 }, ${t(LS[3] + 2.6)} + j * 0.08); });
      pop("#lb-out", ${t(LS[3] + 1.4)}); out("#lb-out", ${t(LE[3] - 0.1)});
      // ===== L4 验证者冻结约 1.62 亿：转台转动，16 点变绿，挂锁
      X9.spin(tl, "rota", ${t(LS[4] + 0.1)}, 1.6, 2);
      ${JSON.stringify(GREEN16)}.forEach((i, j) => tl.to("#dd-" + i, { attr: { fill: "#1f9d55" }, duration: 0.2 }, ${t(M(4, 0.4))} + j * 0.04));
      fadeIn("#dlock", ${t(M(4, 0.55))}, 0.3); pop("#lb-dd2", ${t(M(4, 0.6))});
      // ===== L5 约 90.9% 质押权通过，16 点飞进三方共管多签
      fadeIn("#vote", ${t(LS[5] + 0.2)}, 0.3); tl.fromTo("#vbar", { scaleX: 0 }, { scaleX: 0.909, svgOrigin: "${VB[0] - 90} ${VB[1]}", duration: 1.4, ease: "power2.out", immediateRender: false }, ${t(LS[5] + 0.4)});
      pop("#lb-vote", ${t(LS[5] + 1.0)}); bump("#rota", ${t(LS[5] + 2.6)}, 1.05);
      out("#lb-dd2, #dlock", ${t(M(5, 0.5) - 0.2)}); pop("#lb-msig", ${t(M(5, 0.45))});
      ${JSON.stringify(greenMoves)}.forEach((m, j) => {
        tl.to("#" + m.id, { x: m.d[0], y: m.d[1], duration: 1.1, ease: "power2.inOut" }, ${t(M(5, 0.5))} + j * 0.05);
        tl.to("#" + m.id, { opacity: 0, duration: 0.2 }, ${t(M(5, 0.5) + 1.0)} + j * 0.05); });
      // ===== L6 钱保住了，争议也来了：多签亮绿 + 转台旁红问号
      out("#lb-vote, #vote", ${t(LS[6] - 0.2)}); pop("#lb-saved", ${t(LS[6] + 0.1)}); bump("#msig", ${t(LS[6] + 0.2)}, 1.04);
      pop("#lb-q", ${t(M(6, 0.55))}, 0.35);
      // ===== L7 部分验证者表达保留意见：两个座位举灰牌 + 来源卡
      out("#sr-cetus", ${t(LS[7] - 0.2)}); out("#lb-saved, #lb-q", ${t(LS[7] - 0.2)});
      pop("#lb-res0", ${t(LS[7] + 0.3)}); pop("#lb-res1", ${t(LS[7] + 0.55)}); pop("#sr-cf", ${t(LS[7] + 0.4)});
      // ===== L8 关键画面：验证者可以干预任意地址 —— 攻击者区块一把实锁，其余区块都投出淡红锁影
      out("#lb-res0, #lb-res1", ${t(LS[8] - 0.2)});
      X9.seat(tl, "rota", ${t(LS[8] + 0.1)}, 0, "hot");
      pop("#lk0", ${t(M(8, 0.15))}, 0.35);
      ["#lks1", "#lks2", "#lks3"].forEach((s, j) => fadeIn(s, ${t(M(8, 0.5))} + j * 0.25, 0.4));
      pop("#lb-any", ${t(M(8, 0.6))}, 0.35);
      // ===== L9 Arbitrum 安全委员会强制转走：门卡 + 三名工程师 + 关键词 + 事件卡 + 来源卡
      out("#ev-cetus, #sr-cf, #lb-any", ${t(LS[9] - 0.2)});
      grow("kcard", ${t(LS[9] + 0.1)}); grow("engd0", ${t(LS[9] + 0.3)}); grow("engd1", ${t(LS[9] + 0.45)}); grow("engd2", ${t(LS[9] + 0.6)});
      pop("#lb-kc", ${t(LS[9] + 0.7)}); pop("#ev-bn", ${t(LS[9] + 0.2)}); pop("#kw-arb", ${t(M(9, 0.3))}); pop("#sr-bn", ${t(M(9, 0.55))}); bump("#kcard", ${t(M(9, 0.8))}, 1.1);
      // ===== L10 谈判与白帽赎回：镜头右移到 talkD，喊话塔信号弧亮
      out("#lb-kc, #ev-bn, #sr-bn, #kw-arb", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "talkD", 1.6, "power2.inOut");
      flash("#tower-wave-0, #tower-wave-1, #tower-wave-2, #tower-wave-3", ${t(LS[10] + 1.6)}, 2, 0.2);
      // ===== L11 Poly Network 约 6.1 亿美元，约 15 天内归还：61 点逐点变绿，归还签弹出
      pop("#ev-poly", ${t(LS[11] + 0.1)}); fadeIn("#dpn", ${t(LS[11] + 0.5)}, 0.4); pop("#lb-poly", ${t(LS[11] + 0.7)});
      pop("#sr-poly", ${t(M(11, 0.35))});
      Array.from({ length: 61 }, (_, i) => i).forEach((i) => tl.to("#dp-" + i, { attr: { fill: "#1f9d55" }, duration: 0.12 }, ${t(M(11, 0.6))} + i * 0.03));
      out("#lb-poly", ${t(M(11, 0.6) - 0.2)}); pop("#lb-poly2", ${t(M(11, 0.6))});
      fadeIn("#rtg0", ${t(M(11, 0.8))}, 0.3); bump("#rtg0", ${t(M(11, 0.8))}, 1.1); pop("#lb-rt0", ${t(M(11, 0.85))});
      // ===== L12 Euler 被闪电贷攻击约 1.97 亿：20 点红
      out("#ev-poly, #sr-poly, #lb-poly2, #dpn, #lb-rt0", ${t(LS[12] - 0.2)});
      pop("#ev-eul", ${t(LS[12] + 0.1)}); fadeIn("#deu", ${t(M(12, 0.55))}, 0.4); pop("#lb-eul", ${t(M(12, 0.6))});
      // ===== L13 10% 赏金 + 100 万美元悬赏
      fadeIn("#envg", ${t(LS[13] + 0.4)}, 0.3); pop("#lb-env", ${t(LS[13] + 0.6)}); grow("bty0", ${t(LS[13] + 0.7)}); grow("bty1", ${t(LS[13] + 0.85)});
      pop("#lb-bounty", ${t(M(13, 0.45))}); pop("#sr-eul", ${t(M(13, 0.6))});
      // ===== L14 全部可追回资金已归还：20 点变绿，第二个归还签
      out("#lb-eul", ${t(LS[14] + 0.6)}); pop("#lb-eul2", ${t(LS[14] + 0.8)});
      Array.from({ length: 20 }, (_, i) => i).forEach((i) => tl.to("#de-" + i, { attr: { fill: "#1f9d55" }, duration: 0.15 }, ${t(LS[14] + 0.8)} + i * 0.05));
      fadeIn("#rtg1", ${t(M(14, 0.55))}, 0.3); bump("#rtg1", ${t(M(14, 0.55))}, 1.1); pop("#lb-rt1", ${t(M(14, 0.6))});
      // ===== L15 原因不公开，谈判不能当主线：归还签上方灰问号 + 红虚线框框住"谈判"牌
      out("#ev-eul, #sr-eul, #lb-bounty, #lb-env, #lb-rt1", ${t(LS[15] - 0.2)});
      pop("#lb-why0", ${t(M(15, 0.15))}); pop("#lb-why1", ${t(M(15, 0.25))});
      fadeIn("#negbox", ${t(M(15, 0.55))}, 0.35); pop("#lb-notmain", ${t(M(15, 0.62))});
      // ===== L16 执法与司法：镜头右移到 courtD，天平亮
      out("#lb-why0, #lb-why1, #lb-notmain, #lb-eul2, #negbox", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "courtD", 1.6, "power2.inOut");
      X1.tilt(tl, "bal", ${t(LS[16] + 1.6)}, 6); bump("#bal", ${t(LS[16] + 1.6)}, 1.04);
      // ===== L17 Bitfinex：解密云存储里的私钥文件 —— 桶里升起钥匙，挂锁打开
      pop("#ev-bfx", ${t(LS[17] + 0.1)}); pop("#sr-doj", ${t(LS[17] + 0.5)}); pop("#lb-bkt", ${t(M(17, 0.3))});
      tl.fromTo("#keyr", { opacity: 0, x: -131, y: 70 }, { opacity: 1, x: 0, y: 0, duration: 1.0, ease: "power2.out", immediateRender: false }, ${t(M(17, 0.45))});
      pop("#lb-key", ${t(M(17, 0.58))});
      out("#lockd", ${t(M(17, 0.72))}, 0.3); pop("#lb-dec", ${t(M(17, 0.75))});
      // ===== L18 没收约 94636 BTC：95 金点 + "没收"盖章
      out("#lb-bkt, #lb-key, #lb-dec, #sr-doj", ${t(LS[18] - 0.2)});
      fadeIn("#dbtc", ${t(LS[18] + 0.3)}, 0.5); pop("#lb-btc", ${t(LS[18] + 0.6)});
      fadeIn("#dseize-stampmark", ${t(M(18, 0.45))}, 0.2); bump("#dseize", ${t(M(18, 0.45))}, 1.06); pop("#lb-2016", ${t(M(18, 0.72))});
      // ===== L19 实物返还申请，法官质疑，仍有争议：天平来回摆
      out("#ev-bfx", ${t(LS[19] - 0.2)});
      fadeIn("#dretg", ${t(M(19, 0.15))}, 0.35); pop("#sr-ret", ${t(M(19, 0.3))});
      X1.tilt(tl, "bal", ${t(M(19, 0.45))}, -10); X1.tilt(tl, "bal", ${t(M(19, 0.6))}, 8); X1.tilt(tl, "bal", ${t(M(19, 0.75))}, -6); X1.tilt(tl, "bal", ${t(M(19, 0.88))}, 0);
      pop("#lb-disp", ${t(M(19, 0.78))});
      // ===== L20 可能要拖好几年：沙漏流沙 + 时间线 2016 → 2022 → 2025
      out("#sr-ret, #lb-btc, #lb-2016", ${t(LS[20] - 0.2)});
      KIT.sand(tl, "hg", ${t(LS[20] + 0.1)}, 2.6); pop("#lb-hg", ${t(LS[20] + 0.3)});
      pop("#tline", ${t(LS[20] + 0.2)}); ["#tl-0", "#tl-1", "#tl-2"].forEach((s, j) => fadeIn(s, ${t(LS[20] + 0.4)} + j * 0.4, 0.25));
`,
});
