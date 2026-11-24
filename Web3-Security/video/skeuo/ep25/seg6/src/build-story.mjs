// ep25/seg6「⑥ 能冻结哪些」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.prepE（BRIEF）。
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world（= CAMS.wide，全集最后一段 + 结束卡）

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const sc = (o, k) => (p) => { const [gx, gy] = at(o); return [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; };
/** 不支持 opts.scale 的物件：绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1） */
function putW(key, o, r, dy = 0) {
  const k = o.scale ?? 1, [gx, gy] = at(o);
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n in A[key]) { const q = A[key][n]; if (Array.isArray(q) && q.length === 2 && typeof q[0] === "number") A[key][n] = sc(o, k)(q); }
}
const ez = (du, dv) => ({ u: 15900 + du, v: dv }), bz = (du, dv) => ({ u: 3200 + du, v: dv });
const plate = (key, o, text) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text }));

// 石板路 + 资金管（整座城）
const R0 = L.ROAD, road = [Wp(R0.u0, R0.v0), Wp(R0.u1, R0.v0), Wp(R0.u1, R0.v1), Wp(R0.u0, R0.v1)].map((q) => q.join(",")).join(" ");
add({ u: R0.u0, v: 0 }, `<polygon points="${road}" fill="#ddd7cb" stroke="#c9c1b2" stroke-width="3"/>`, -1e6);
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8, flowColor: "#e0453a" }), -9e5);

// A 被盗现场（全景用）
put("hsafe", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hsafe", variant: "hot", plate: "热钱包", open: 105, state: "broken" }));
put("atkA", L.ATK_A, O.person(L.ATK_A, { id: "atkA", role: "attacker", scale: L.ATK_A.scale }));
putW("pauseA", L.PAUSE_A, O.knifeSwitch(L.PAUSE_A, { id: "pauseA", text: "协议暂停" }));
putW("tlockA", L.TLOCK_A, E1.timeLock(L.TLOCK_A, { id: "tlockA" }));
putW("meth", L.METH, E3.contractMachine(L.METH, { id: "meth", name: "mETH" }));
L.CMETH.forEach((q, i) => put("cm" + i, q, E6.shareCert(q, { id: "cm" + i, scale: q.scale, text: "cmETH" })));
plate("sgA", L.SIGN_A, "被盗现场");

// B 发行方路口：五枚主角币 + 两把冻结锁（USDT、USDC）
["USDT 发行方", "USDC 发行方"].forEach((t, i) => put("mp" + i, L.MINT[i], E11.mintPress(L.MINT[i], { id: "mp" + i, scale: L.MINT[i].scale, plate: t })));
L.ADDR_B.forEach((q, i) => putW("adB" + i, q, E2.addrPlate(q, { id: "adB" + i, text: "攻击者地址" })));
put("clkB", L.CLOCK_B[0], O.clock(L.CLOCK_B[0], { id: "clkB" }));
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm", scale: L.AMM.scale, labelL: "USDT", labelR: "ETH" }));
const HERO_N = ["USDT", "USDC", "BTC", "XRP", "SOL"];
const HERO_B = HERO_N.map((_, i) => ({ ...bz(-820 + i * 130, 0), scale: 0.55 }));
HERO_B.forEach((q, i) => put("hc" + i, q, E7.oddCoin(q, { id: "hc" + i, scale: q.scale })));
[0, 1].forEach((i) => { const q = { ...S.rel(HERO_B[i], 0, 80), scale: 0.6 }; putW("hl" + i, q, O.padlock(q, { id: "hl" + i })); });
[[L.DOC_TRO, "临时限制令"], [L.DOC_LIFT, "解除冻结"], [L.DOC_GENIUS, "GENIUS 法案"]].forEach(([q, t], i) => put("dB" + i, q, O.doc(q, { id: "dB" + i, title: t, standing: true })));
putW("sealB", L.SEAL_B, O.seal(L.SEAL_B, { id: "sealB", markText: "法院" }));
plate("sgB", L.SIGN_B, "发行方路口");

// C 出城口
putW("brg", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "brg" }));
putW("lot", L.LOTTERY, E2.lottery(L.LOTTERY, { id: "lot", plate: "混币器" }));
put("stall", L.STALL, E8.marketStall(L.STALL, { id: "stall", scale: L.STALL.scale, head: "场外交易" }));
put("tc", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "tc", scale: L.COUNTER.scale, sign: "交易所 · 风控" }));
L.CHECKS.forEach((q, i) => putW("ck" + i, q, O.checkpoint(q, { id: "ck" + i, n: "①②③④"[i] })));
put("rdoc", L.RISKDOC, O.doc(L.RISKDOC, { id: "rdoc", title: "风控名单", standing: true }));
L.ADDR_C.forEach((q, i) => putW("adC" + i, q, E2.addrPlate(q, { id: "adC" + i, text: "地址 " + (i + 1) })));
plate("sgC", L.SIGN_C, "出城口");

// D 链上法庭
putW("chn", L.CHAIN, O.chain(L.CHAIN, { id: "chn", n: 4, title: "Sui" }));
put("rota", L.ROTA, E9.rotaWheel(L.ROTA, { id: "rota", scale: L.ROTA.scale }));
putW("msig", L.MSIG, E5.accountSafe(L.MSIG, { id: "msig" }));
L.ENG_D.forEach((q, i) => put("engD" + i, q, O.person(q, { id: "engD" + i, role: "engineer", scale: q.scale })));
putW("towD", L.TOWER_D, O.tower(L.TOWER_D, { id: "towD" }));
put("env", L.ENVELOPE, O.envelope(L.ENVELOPE, { id: "env", w: 90, h: 56 }));
putW("bal", L.BAL, E1.balance(L.BAL, { id: "bal" }));
putW("bkt", L.BUCKET, O.bucket(L.BUCKET, { id: "bkt" }));
putW("hg", L.HOURGLASS, O.hourglass(L.HOURGLASS, { id: "hg" }));
[[L.DOC_SEIZE, "没收"], [L.DOC_RETURN, "实物返还申请"]].forEach(([q, t], i) => put("dD" + i, q, O.doc(q, { id: "dD" + i, title: t, standing: true })));
["链级冻结", "谈判", "法院"].forEach((t, i) => plate("sgD" + i, L.SIGN_D[i], t));

// E 应急作战室（全景用）
L.DESKS.forEach((q, i) => putW("dk" + i, q, O.desk(q, { id: "dk" + i })));
L.ENG_E.forEach((q, i) => put("engE" + i, q, O.person(q, { id: "engE" + i, role: "engineer", scale: q.scale })));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("clkE", L.CLOCK_E, O.clock(L.CLOCK_E, { id: "clkE" }));
putW("pauseE", L.PAUSE_E, O.knifeSwitch(L.PAUSE_E, { id: "pauseE", text: "暂停提币" }));
put("list", L.LIST, O.doc(L.LIST, { id: "list", title: "地址清单", lines: ["被盗地址", "攻击者地址", "下一跳"], standing: true }));
["稳定币发行方", "交易所风控", "跨链桥 · 兑换服务", "SEAL 911", "链上分析公司"].forEach((t, i) =>
  put("rcp" + i, L.RECIPS[i], E1.signBoard(L.RECIPS[i], { id: "rcp" + i, style: "plate", text: t, size: 34 })));
put("disp", L.DISPATCH, E7.dispatchDesk(L.DISPATCH, { id: "disp", scale: L.DISPATCH.scale }));
plate("sgE0", L.SIGN_E[0], "应急作战室");
// E 准备区（上一段终点 prepE 的物件）
putW("towE", L.TOWER_E, O.tower(L.TOWER_E, { id: "towE" }));
put("snap", L.SNAPCAM, E11.snapshotCamera(L.SNAPCAM, { id: "snap", scale: L.SNAPCAM.scale, photo: "服务器镜像", sub: "证据保全" }));
putW("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "服务器镜像" }));
put("drep", L.DOC_REPORT, O.doc(L.DOC_REPORT, { id: "drep", title: "报案", standing: true }));
putW("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }));
put("mag", L.MAGNIFIER, O.magnifier(L.MAGNIFIER, { id: "mag" }));
putW("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb" }));
put("dtr", L.DOC_TRACE, O.doc(L.DOC_TRACE, { id: "dtr", title: "追踪结论", standing: true }));

// E 用户角（本段 L0–L6）
plate("sgE1", L.SIGN_E[1], "用户角");
put("you", L.USER, O.person(L.USER, { id: "you", role: "signer", scale: L.USER.scale }));
const phScr = `<rect x="0" y="0" width="76" height="26" fill="#ece7dd"/><text x="38" y="18" font-size="12" font-weight="800" text-anchor="middle" fill="#1c1c1c">授权列表</text>` +
  [0, 1, 2].map((i) => `<rect x="6" y="${36 + i * 34}" width="64" height="26" rx="5" fill="#eef7fb" stroke="#2aa3c9" stroke-width="1.2"/>` +
    `<text x="12" y="${54 + i * 34}" font-size="11" font-weight="700" fill="#1c1c1c">合约 ${"ABC"[i]}</text>` +
    `<g id="phx${i}" opacity="0"><rect x="6" y="${36 + i * 34}" width="64" height="26" rx="5" fill="#ffffff" opacity="0.7"/><path d="M8 ${49 + i * 34}H68" stroke="#e0453a" stroke-width="3"/><text x="64" y="${54 + i * 34}" font-size="10" font-weight="800" text-anchor="end" fill="#e0453a">撤销</text></g>`).join("");
putW("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen: phScr }));
putW("na", L.NEWADDR, E2.addrPlate(L.NEWADDR, { id: "na", text: "全新地址" }));
putW("mn", L.MNEMONIC, E2.mnemonicPlate(L.MNEMONIC, { id: "mn", title: "新助记词" }));
put("hw", L.HWW, O.hwWallet(L.HWW, { id: "hw", screenText: "新设备" }));
const recLines = ["被盗地址", "攻击者地址", "交易哈希", "时间", "点过的链接"];
put("rec", L.DOC_REC, O.doc(L.DOC_REC, { id: "rec", title: "被盗记录", lines: recLines, standing: true }));
// 被盗记录五行：盖白条，逐条揭开（doc 的立面矩阵 anchors.m）
add(L.DOC_REC, `<g transform="matrix(${A.rec.m.join(",")})">${recLines.map((_, i) => `<rect id="rc${i}" x="12" y="${72 + i * 30}" width="176" height="26" fill="#fffdf8"/>`).join("")}</g>`, 1);
put("rcpt", L.DOC_RECEIPT, O.doc(L.DOC_RECEIPT, { id: "rcpt", title: "报案回执", lines: ["已受理"], stampText: "公安", standing: true }), 0, { grow: true });
put("scam", L.SCAMMER, O.person(L.SCAMMER, { id: "scam", role: "attacker", scale: L.SCAMMER.scale }), 0, { grow: true });
// 诈骗者手里的手机 + 红虚线框 + 红叉
const [sx, sy] = at(L.SCAMMER);
add(L.SCAMMER, `<g id="scph"><rect x="${sx - 52}" y="${sy - 92}" width="18" height="32" rx="4" fill="#26272a" stroke="#141518" stroke-width="1.5"/><rect x="${sx - 49}" y="${sy - 88}" width="12" height="22" rx="2" fill="#e0453a"/></g>`, 2);
add(L.SCAMMER, S.hid("scx", `<rect x="${sx - 80}" y="${sy - 150}" width="160" height="170" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 9"/>` +
  `<circle cx="${sx + 80}" cy="${sy - 150}" r="22" fill="#e0453a"/><path d="M${sx + 70} ${sy - 160}L${sx + 90} ${sy - 140}M${sx + 90} ${sy - 160}L${sx + 70} ${sy - 140}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`), 3);
// 两封信：从用户飞向左边（发行方 / 交易所方向）
const LT0 = S.rel(L.USER, -60, -80), LT1 = S.rel(L.USER, -60, -10);
add(LT0, S.hid("lg1", E1.letter(LT0, { id: "lt1", w: 60, h: 40 }).svg), 5);
add(LT1, S.hid("lg2", E1.letter(LT1, { id: "lt2", w: 60, h: 40 }).svg), 5);
const FLY1 = [at(LT0), Wp(LT0.u - 500, LT0.v - 250, 160), Wp(17900, -600, 160)], FLY2 = [at(LT1), Wp(LT1.u - 500, LT1.v - 100, 140), Wp(17900, -150, 140)];

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-you", up(A.you.top, 8), "你", "lab-ink");
lb("lb-hw", up(A.hw.top, 8), "新设备", "lab-cs lab-sm");
lb("lb-iss", Wp(18750, -560, 420), "→ 发行方 · 附交易哈希", "lab-cs lab-sm", "c");
lb("lb-cex", Wp(18750, -560, 260), "→ 交易所 · 官方渠道", "lab-cs lab-sm", "c");
lb("lb-law", S.up(A.rcpt.ground, -14), "冻结常需执法请求", "lab-ink lab-sm", "t");
lb("lb-scam", up(A.scam.top, 60), "先付费，帮你追回", "lab-r");

// ---------------------------------------------------------------- 屏幕层卡片（全景 scale 0.10：标记一律画大，放在屏幕层）
const sw = (o) => S.scr("wide", at(o)).map((v) => Math.round(v));
const Bp = sw(HERO_B[2]);                       // B 区五枚币（屏幕）
const MK = HERO_N.map((t, i) => [230 + i * 86, 470]);
const mk = MK.map(([x, y], i) => `<div class="mk ${i < 2 ? "mk-ok" : "mk-no"} hide" id="mk${i}" style="left:${x - 36}px;top:${y - 36}px">${HERO_N[i]}${i < 2 ? '<span class="mk-lock">锁</span>' : ""}</div>`).join("");
const ring = (id, o, txt, dx = 0, dy = 70) => { const [x, y] = sw(o); return `<div class="rg hide" id="${id}" style="left:${x - 50}px;top:${y - 50}px"></div><div class="rgl hide" id="${id}-l" style="left:${x - 90 + dx}px;top:${y + dy - 18}px">${txt}</div>`; };
const pA = sw({ u: 120, v: 0 }), pB = sw({ u: 4900, v: 0 });
let html = mk +
  `<svg class="ov" width="1920" height="1080"><line id="mk-lead" class="hide" x1="${MK[2][0]}" y1="${MK[2][1] + 40}" x2="${Bp[0]}" y2="${Bp[1] - 20}" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="10 8"/>` +
  `<rect id="mk-box" class="hide" x="${MK[2][0] - 48}" y="${MK[2][1] - 48}" width="${MK[4][0] - MK[2][0] + 96}" height="96" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10"/>` +
  `<line id="pipe-ok" class="hide" x1="${pA[0]}" y1="${pA[1]}" x2="${pB[0]}" y2="${pB[1]}" stroke="#1f9d55" stroke-width="14" stroke-linecap="round"/></svg>` +
  `<div class="mkx hide" id="mk-x" style="left:${MK[4][0] + 30}px;top:${MK[4][1] - 70}px">✕</div>` +
  `<div class="mkt mkt-ok hide" id="mk-ok" style="left:${MK[0][0] - 46}px;top:${MK[0][1] - 104}px">有发行方 · 能冻结</div>` +
  `<div class="mkt mkt-no hide" id="mk-no" style="left:${MK[2][0] - 46}px;top:${MK[2][1] + 58}px">原生资产 · 没有发行方</div>` +
  ring("rg0", L.PAUSE_A, "暂停", 70, -110) + ring("rg1", L.TLOCK_A, "延迟", 40, -110) + ring("rg2", L.LIST, "地址清单", -150, 40) + ring("rg3", L.ROLEBOARD, "值守 · 联系人", -170, 60) +
  kw("kw-q", `发行方冻结能管到<b>哪几种</b>？`, { x: 940, y: 660, size: 44, accent: "#1d87ab" }) +
  kw("kw-end", `大半在<b>出事之前</b>就定了 ${gtag("解读")}`, { x: 944, y: 700, size: 44 }) +
  `<div class="mkt mkt-c hide" id="lb-first" style="left:760px;top:250px">第一批通知 · 不是全部</div>`;
S.curve("cv-first", sw(L.LIST), [Bp[0] - 10, Bp[1] - 60], { color: "#2aa3c9", c1: [1250, 200], c2: [560, 300] });
S.curve("cv-move", S.scr("userE", A.ph.screen), S.scr("userE", A.na.top), { color: "#1f9d55", c1: [700, 560], c2: [760, 420] });
const css = `
  .mk { position: absolute; width: 72px; height: 72px; border-radius: 50%; background: #fffdf8; border: 4px solid #3b3e44; box-sizing: border-box;
        display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; line-height: 1; color: #1c1c1c; box-shadow: 0 4px 10px rgba(0,0,0,.15); }
  .mk-ok { background: #1f9d55; border-color: #167a41; color: #fff; }
  .mk-lock { position: absolute; right: -12px; bottom: -10px; width: 30px; height: 30px; border-radius: 8px; background: #fff; border: 3px solid #167a41; color: #167a41; font-size: 18px; line-height: 24px; text-align: center; }
  .ov { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
  .mkx { position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #e0453a; color: #fff; font-size: 28px; font-weight: 800; line-height: 44px; text-align: center; }
  .mkt { position: absolute; padding: 8px 16px; border-radius: 10px; font-size: 26px; font-weight: 800; line-height: 1.2; background: #fff; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,.12); }
  .mkt-ok { color: #1f9d55; border: 3px solid #1f9d55; } .mkt-no { color: #e0453a; border: 3px solid #e0453a; } .mkt-c { color: #1d93ba; border: 3px solid #2aa3c9; }
  .rg { position: absolute; width: 100px; height: 100px; border-radius: 50%; border: 7px solid #1f9d55; box-sizing: border-box; background: rgba(31,157,85,.12); }
  .rgl { position: absolute; width: 180px; text-align: center; font-size: 26px; font-weight: 800; line-height: 1.2; color: #fff; background: #1f9d55; border-radius: 10px; padding: 6px 0; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  revoke: w("撤销", 1), newAddr: w("全新的地址", 1), mn: w("新助记词", 1), hw: w("新设备", 1),
  rec: [w("被盗地址", 2), w("攻击者地址", 2), w("交易哈希", 2), w("时间", 2), w("链接", 2)],
  iss: w("联系发行方", 3), cex: w("官方渠道", 4), police: w("报警", 5), rcpt: w("回执", 5), law: w("执法请求", 5),
  pay: w("先付费", 6), scam2: w("诈骗", 6, 1),
  usdt: w("USDT", 8), usdc: w("USDC", 8), btc: w("BTC", 9), xrp: w("XRP", 9), sol: w("SOL", 9), noIss: w("没有发行方", 9),
  first: w("第一批", 10), pause: w("暂停", 11), delay: w("延迟", 11), list: w("地址清单", 11), contact: w("联系人", 11), most: w("大半", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "prepE", sub: "出事之前，就定了大半",
  grid: { u0: -4800, u1: 24000, v0: -14900, v1: 14600 }, box: [-1990, -8360, 19510, 11110],   // 盖住本段镜头 prepE / userE / wide（含上一段终点）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "授权", d: "允许某个合约动用你代币的许可", at: w("授权", 1) },
    { id: "t1", t: "助记词", d: "能恢复整个钱包的一组单词", at: w("助记词", 1) },
  ],
  end: { title: "资金追踪与事后处置", line: "钱被转走之后能追回多少，大半在出事之前就定了", next: "AI 与 Web3 安全", at: LS[13], nextAt: w("下一集", 13) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 如果被盗的是你自己的钱，顺序也差不多。
      cam(${t(LS[0])}, "userE", 1.5); pop("#lb-you", ${t(LS[0] + 1.6)}); bump("#you", ${t(LS[0] + 1.7)}, 1.08, 1);
      // ===== L1 先撤销所有授权，把剩下的资产转到全新的地址，用新助记词、新设备。
      [0, 1, 2].forEach((i) => fadeIn("#phx" + i, ${t(TM.revoke)} + i * 0.35, 0.25));
      draw("cv-move", ${t(TM.newAddr)}); bump("#na", ${t(TM.newAddr + 0.8)}, 1.06, 1);
      bump("#mn", ${t(TM.mn)}, 1.06, 1); bump("#hw", ${t(TM.hw)}, 1.08, 1); pop("#lb-hw", ${t(TM.hw)});
      // ===== L2 记下被盗地址、攻击者地址、交易哈希、时间，和你点过的链接。
      out("#cv-move", ${t(LS[2] - 0.2)}); bump("#rec", ${t(LS[2])}, 1.05, 1);
      ${JSON.stringify(TM.rec)}.forEach((tt, i) => out("#rc" + i, tt, 0.3));
      // ===== L3 被盗的是 USDT 或 USDC，马上联系发行方，附上交易哈希。
      fadeIn("#lg1", ${t(TM.iss - 0.3)}, 0.2); X1.walk(tl, "lt1", ${t(TM.iss)}, 1.6, ${JSON.stringify(FLY1)}, "power1.inOut"); pop("#lb-iss", ${t(TM.iss + 0.6)});
      out("#lg1", ${t(TM.iss + 1.5)}, 0.2);
      // ===== L4 钱流进了某个交易所，就通过它的官方渠道提交冻结请求。
      fadeIn("#lg2", ${t(TM.cex - 0.3)}, 0.2); X1.walk(tl, "lt2", ${t(TM.cex)}, 1.6, ${JSON.stringify(FLY2)}, "power1.inOut"); pop("#lb-cex", ${t(TM.cex + 0.6)});
      out("#lg2", ${t(TM.cex + 1.5)}, 0.2); flash("#lb-cex", ${t(TM.cex + 2.4)}, 2, 0.4);
      // ===== L5 报警，拿到报案回执，交易所和发行方通常需要执法请求才能冻结。
      grow("rcpt", ${t(TM.police)}); fadeIn("#rcpt-stampmark", ${t(TM.rcpt + 0.4)}, 0.15); bump("#rcpt", ${t(TM.rcpt + 0.4)}, 1.06, 1);
      pop("#lb-law", ${t(TM.law)}); flash("#lb-law", ${t(LS[5] + 4.9)}, 2, 0.4);
      // ===== L6 当心追回诈骗，说能帮你追回资金、要你先付费的人，几乎都是诈骗。
      grow("scam", ${t(LS[6])}); pop("#lb-scam", ${t(TM.pay)}); fadeIn("#scx", ${t(TM.scam2)}, 0.3);
      // ===== L7 回到开头的问题。
      out("#lb-you, #lb-hw, #lb-iss, #lb-cex, #lb-law, #lb-scam", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "world", 1.6); pop("#kw-q", ${t(LS[7] + 1.0)});
      // ===== L8 发行方冻结，只能管到 USDT、USDC 这类有发行方的代币。
      fadeIn("#mk-lead", ${t(LS[8])}, 0.3); pop("#mk0", ${t(TM.usdt)}); pop("#mk1", ${t(TM.usdc)}); pop("#mk-ok", ${t(TM.usdc + 0.6)});
      // ===== L9 BTC、XRP、SOL 是原生资产，没有发行方，这条路管不到它们。（关键画面）
      pop("#mk2", ${t(TM.btc)}); pop("#mk3", ${t(TM.xrp)}); pop("#mk4", ${t(TM.sol)});
      fadeIn("#mk-box", ${t(TM.noIss)}, 0.3); pop("#mk-x", ${t(TM.noIss + 0.2)}); pop("#mk-no", ${t(TM.noIss + 0.3)});
      // ===== L10 所以第一批通知发给发行方，但不能把它当成全部方案。
      draw("cv-first", ${t(TM.first)}, 1.2); pop("#lb-first", ${t(TM.first + 0.8)});
      // ===== L11 最有效的，是事先设计好的暂停和延迟，加上提前备好的地址清单和联系人。
      out("#cv-first, #lb-first", ${t(LS[11] - 0.2)});
      pop("#rg0, #rg0-l", ${t(TM.pause)}); pop("#rg1, #rg1-l", ${t(TM.delay)}); pop("#rg2, #rg2-l", ${t(TM.list)}); pop("#rg3, #rg3-l", ${t(TM.contact)});
      // ===== L12 钱被转走之后能追回多少，大半在出事之前就定了。
      out("#kw-q", ${t(LS[12] - 0.2)}); fadeIn("#pipe-ok", ${t(LS[12])}, 0.6); pop("#kw-end", ${t(LS[12] + 0.2)});
      // ===== L13 下一集讲 AI 与 Web3 安全。（结束卡，静止在 CAMS.world）
      out(".mk, .mkt, .mkx, .rg, .rgl, #mk-lead, #mk-box, #pipe-ok, #kw-end", ${t(LS[13] - 0.2)}, 0.3);
`,
});
