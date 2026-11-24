// ep12/seg4「④ 根因与案例」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.valid（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   valid        近景：9 人验证者平台 + 两块分组牌 + 门限表（seg1 起点；seg6 L2、L5–L7 回到这里给答案）
//   bridge       B 桥全景：桥 + 平台 + 岗亭 + 门限表 + 中继者，两岸同框（seg1 终点 "凭什么相信？"；seg2 L0–L3、L8–L9；seg4 L1–L4；seg5 L1–L2）
//   booth        近景：岗亭 + 证明卡 + 门限表（seg2 L12–L15；seg4 L1–L4 证明卡 missing）
//   bankA        A 金库全景：售货机 + 保险柜 + 用户 + 存款事件 + 消息 + 点阵 + A 链（seg2 L4–L7；seg5 L3–L4；seg6 L1）
//   mintB        近景：铸币机 + B 链 + 点阵（seg2 L10–L11、seg2 终点 "信谁？"；seg3 起点）
//   recon        近景：两侧对账天平 + 自动暂停闸刀 + 监控灯 + 延迟队列（seg2 L19；seg5 L8–L9；seg6 L8）
//   hallD        D 四摊全景 + 尽头升级角（seg3 L0、seg4 L0；seg5 L10 远景带过）
//   dMulti       
//   dLight       
//   dOpt         
//   dZk          
//   upgrade      近景：展台尽头 新实现 + 红色升级钥匙 + 时间锁（seg3 终点；seg5 L10）
//   filesE       E 档案墙全景（seg4 L0、L5；seg5 起点 L0、L5–L7）
//   eTree        
//   eSig         
//   eKey         
//   eZero        
//   eRpc         
//   cexF         F 柜台全景（seg5 L11–L12、L17 终点；seg6 起点 L0、L3–L4）
//   cexTag       近景：假币 + 回执 + TRON 区块 + 确认数（seg5 L13–L17）
//   wide         宽景：两岸 = 两座城，A · B · C 前排同框（seg2 L16–L22 两岸 / C→A 反向）
//   world        全景：所有区（seg6 结束卡前拉远）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import { G } from "../../../kit/iso.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
// import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";   // 其他集的物件：import 后加进 ext 列表
import * as L from "../../shared/layout.mjs";

const CAMS_SEG = { ...L.CAMS };
const S = segInit(import.meta.url, { cams: CAMS_SEG, ext: [E1, E2, E3, E5, E7, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// ends static on CAMS.eRpc
const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";
const wrapAt = (o, k, lift = 0) => { const [gx, gy] = at(o);
  return { wrap: (svg) => `<g transform="translate(0,${-lift})"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g></g>`,
    sc: (q) => [gx + (q[0] - gx) * k, gy - lift + (q[1] - gy) * k] }; };
const putW = (key, o, obj, k, lift = 0, opts = {}) => { const W = wrapAt(o, k, lift); put(key, o, obj, 0, { ...opts, wrap: W.wrap });
  for (const n of Object.keys(A[key] ?? {})) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = W.sc(A[key][n]); };
const hidW = (id, o, svg, k, lift = 0, dy = 1) => add(o, S.hid(id, wrapAt(o, k, lift).wrap(svg)), dy);
const ePt = (dX, dY) => { // world point at E-zone px offset (zone anchor (-1900,-1100))
  const q = G(-1900 + dX, -1100 + dY); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const dotsSvg = (X, Y, rows, cols, color, step = 14, r = 4.5) => { let d = "";
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) d += `<circle cx="${X + j * step}" cy="${Y + i * step}" r="${r}" fill="${color}"/>`; return d; };

// D 尽头升级角（起始镜头 upgrade）
// 接 seg3 段尾状态：新实现已推到 ZK 摊位、拉杆已拉下；ZK 证明卡已隐去；电路板 30%；三个标签在场
put("core", L.COREM, E10.coreModule(L.COREM, { id: "core", ver: "新实现", scale: 0.6 }));
const CORE_TO = Wp(L.COREM.u - 250, L.COREM.v - 160);
putW("zkc", L.CURVE, E2.curveBoard(L.CURVE, { id: "zkc" }), 0.6);
const PU = (sx, sy) => { const c = L.CAMS.upgrade; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; };
lb("l16-key", PU(1015, 768), "升级权限", "lab-rs", "b");
lb("l18-by", PU(220, 566), "绕过证明系统", "lab-rs lab-sm", "b");
lb("l19-two", PU(640, 420), "证明系统 ＋ 升级权限", "lab-ink", "c");
put("upk", L.UPKEY, O.key(L.UPKEY, { id: "upk", state: "attacker" }));

// B 桥与验证者平台
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br" }));
put("tm", L.METER, E5.thresholdMeter(L.METER, { id: "tm", max: 9, th: 5, thText: "5/9", level: 5 }));
put("smp", L.SMPLATE, E1.signBoard(L.SMPLATE, { id: "smp", style: "plate", text: "Sky Mavis", size: 24 }));
put("axp", L.AXPLATE, E1.signBoard(L.AXPLATE, { id: "axp", style: "plate", text: "Axie DAO 授权", size: 24 }));
{ const u0 = L.SMFRAME.u - 110, u1 = L.SMFRAME.u + 350, v0 = L.SMFRAME.v - 110, v1 = L.SMFRAME.v + 310;
  const pts = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => Wp(u, v, 0).join(",")).join(" ");
  add(L.SMFRAME, `<polygon id="smf" points="${pts}" fill="rgba(42,163,201,0.06)" stroke="${TEAL}" stroke-width="4" stroke-dasharray="14 10"/>`, -400); }
L.VALID.forEach((q, i) => put("v" + i, q, O.person(q, { id: "v" + i, role: "signer", scale: 0.6 })));
L.VKEYS.forEach((q, i) => { putW("vk" + i, q, O.key(q, { id: "vk" + i }), 0.4, q.lift);
  if (i < 5) hidW("vkr" + i, q, O.key(q, { id: "vkr" + i + "k", state: "attacker" }).svg, 0.4, q.lift, 2); });
const SKC = { u: L.SMFRAME.u + 120, v: L.SMFRAME.v + 100 };   // Sky Mavis 2×2 中心
hidW("bigkey", SKC, O.key(SKC, { id: "bk", state: "attacker" }).svg, 1.0, 170, 300);
const vkPt = (i) => wrapAt(L.VKEYS[i], 0.4, L.VKEYS[i].lift).sc(at(L.VKEYS[i]));
const bkPt = [at(SKC)[0], at(SKC)[1] - 170];

// E 档案墙（原生 SVG，沿 u 的竖板）+ 四个抽屉
const WH = 640, WZ = 230, DR = [-480, -160, 160, 480], DW = 120, DZ0 = 70, DZ1 = 150;
{ const P = (du, z, dv = 0) => Wp(L.WALL.u + du, L.WALL.v + dv, z).join(",");
  let w = `<polygon points="${P(-WH, 0)} ${P(WH, 0)} ${P(WH, WZ)} ${P(-WH, WZ)}" fill="#f7f3ea" stroke="#c9c0ae" stroke-width="4"/>`;
  w += `<polygon points="${P(-WH, WZ)} ${P(WH, WZ)} ${P(WH, WZ, -24)} ${P(-WH, WZ, -24)}" fill="#e4dccb" stroke="#c9c0ae" stroke-width="3"/>`;
  DR.forEach((du) => { w += `<polygon points="${P(du - DW, DZ0)} ${P(du + DW, DZ0)} ${P(du + DW, DZ1)} ${P(du - DW, DZ1)}" fill="#ece5d6" stroke="#9c927f" stroke-width="3"/>`; });
  add(L.WALL, w, -300);
  DR.forEach((du, i) => { const o = 60; // 拉开的抽屉：前移 o（+v），顶面 + 正面
    const sv = `<polygon points="${P(du - DW, DZ1)} ${P(du + DW, DZ1)} ${P(du + DW, DZ1, o)} ${P(du - DW, DZ1, o)}" fill="#cfeaf3" stroke="${TEAL}" stroke-width="3"/>`
      + `<polygon points="${P(du - DW, DZ0, o)} ${P(du + DW, DZ0, o)} ${P(du + DW, DZ1, o)} ${P(du - DW, DZ1, o)}" fill="#ffffff" stroke="${TEAL}" stroke-width="4"/>`
      + `<rect x="${Wp(L.WALL.u + du, L.WALL.v + o, (DZ0 + DZ1) / 2)[0] - 20}" y="${Wp(L.WALL.u + du, L.WALL.v + o, (DZ0 + DZ1) / 2)[1] - 5}" width="40" height="10" rx="5" fill="${TEAL}"/>`;
    add(L.WALL, S.hid("dro" + i, sv), -290); });
  ["私钥", "验证逻辑", "初始化", "存款伪造"].forEach((t, i) => lb("lb-dr" + i, Wp(L.WALL.u + DR[i], L.WALL.v, WZ + 20), t, "lab-cs")); }

// E 各角
put("mt", L.TREE, X.merkleTree(L.TREE, { id: "mt" }), 0, { grow: true });
const KSW = ePt(-840, 20);
putW("ksw", KSW, O.knifeSwitch(KSW, { id: "ksw" }), 0.6);
const DB = [at(L.TREE)[0] + 100, at(L.TREE)[1] - 240];        // BNB 红点阵 8×8
add(L.TREE, S.hid("dpB", dotsSvg(DB[0], DB[1], 8, 8, RED)), 50);
add(L.TREE, S.hid("dsB", dotsSvg(DB[0] - 30, DB[1] + 40, 1, 5, RED, 16)), 51);
put("ws", L.WSIG, E2.proofCard(L.WSIG, { id: "ws", text: "守护者签名" }));
put("sys", L.SYSACC, O.doc(L.SYSACC, { id: "sys", standing: true, title: "系统账户" }));
add(L.SYSACC, S.hid("sysR", O.doc(L.SYSACC, { id: "sysr", standing: true, title: "系统账户", state: "attacker" }).svg), 1);
const DW2 = [at(L.SYSACC)[0] + 90, at(L.SYSACC)[1] - 250];      // Wormhole 红点阵 6×6
add(L.SYSACC, S.hid("dpW", dotsSvg(DW2[0], DW2[1], 6, 6, RED)), 50);
put("selk", L.SELKEY, E3.selectorKey(L.SELKEY, { id: "selk", name: "替换公钥" }));
putW("ps", L.PSAFE, O.safe(L.PSAFE, { id: "ps" }), 0.6);
put("wl", L.WLIST, O.padlock(L.WLIST, { id: "wl" }), 0, { grow: true });
const DP = [at(L.WLIST)[0] + 90, at(L.WLIST)[1] - 210];         // Poly 红点阵 7×7
add(L.WLIST, S.hid("dpP", dotsSvg(DP[0], DP[1], 7, 7, RED)), 50);
put("lot", L.LOT, E7.emptyLot(L.LOT, { id: "lot", zero: true, scale: 0.6 }));
put("rt", L.RTAGE, E7.returnTag(L.RTAGE, { id: "rt", face: "ok" }), 0, { grow: true });
L.RPCS.forEach((q, i) => { put("rpc" + i, q, O.rpc(q, { id: "rpc" + i }));
  add(q, S.hid("rpcR" + i, O.rpc(q, { id: "rpcr" + i, state: "attacker" }).svg), 1); });
put("ve", L.VALIDE, O.person(L.VALIDE, { id: "ve", role: "engineer", scale: 0.7 }));
put("rs", L.RSETH, E1.miniVend(L.RSETH, { id: "rs", kind: "token", scale: 0.6 }));
put("el", L.ELETTER, E1.letter(L.ELETTER, { id: "el", state: "attacker" }));
add(L.ELETTER, S.hid("el2w", E1.letter(L.ELETTER, { id: "el2", state: "attacker" }).svg), 2);
const KS2 = ePt(720, 330);
putW("ksw2", KS2, O.knifeSwitch(KS2, { id: "ksw2" }), 0.5);
const DK = [at(L.RSETH)[0] - 35, at(L.RSETH)[1] - 260];        // KelpDAO 红点阵 6×6
add(L.RSETH, S.hid("dpK", dotsSvg(DK[0], DK[1], 6, 6, RED)), 50);
const SLOT = ePt(-260, 330);                                    // 第二个来源 空位
{ const [sx, sy] = at(SLOT);
  add(SLOT, S.hid("slot", `<rect x="${sx - 75}" y="${sy - 240}" width="150" height="270" rx="12" fill="rgba(224,69,58,0.05)" stroke="${RED}" stroke-width="4" stroke-dasharray="12 9"/>`
    + `<path d="M${sx - 26} ${sy - 131} l52 52 M${sx + 26} ${sy - 131} l-52 52" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>`), -5); }
put("rpc2", SLOT, O.rpc(SLOT, { id: "rpc2" }), 0, { grow: true });
const VN = [ePt(260, 470), ePt(420, 470)];
VN.forEach((q, i) => put("vn" + i, q, O.person(q, { id: "vn" + i, role: "engineer", scale: 0.7 }), 0, { grow: true }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-ax", up(A.axp.top, 6), "本应撤销", "lab-rs lab-sm");
lb("lb-se", Wp(L.SMFRAME.u - 110, L.SMFRAME.v + 100, 190), `社会工程 ${gtag("公开报道")}`, "lab-rs", "r");
lb("lb-mt", up(A.mt.top, 10), "Merkle 树", "lab-ink lab-sm");
lb("lb-dB", [DB[0] + 49, DB[1] - 12], `200 万枚 BNB · 约 5.7 亿美元 ${gtag("公开复盘")}`, "lab-rs lab-sm");
lb("lb-sB", [DB[0] - 40, DB[1] + 70], "约 1 亿美元以上 → 其他链", "lab-r lab-sm", "r");
lb("lb-nk", up(A.mt.top, 60), "私钥 ✕ 没被偷", "lab-ink lab-sm");
lb("lb-pv", [at(L.TREE)[0], at(L.TREE)[1] + 50], "证明验证代码", "lab-rs", "t");
lb("lb-3h", up(A.ksw.top, 8), "全链暂停 · 约 3 小时", "lab-r lab-sm");
lb("lb-mo", A.mt.root, "Moran 硬分叉", "lab-gs lab-sm", "c");
lb("lb-ws", up(A.ws.top, 8), "守护者签名", "lab-cs lab-sm");
lb("lb-sys", up(A.sys.top, 8), "没核对真假", "lab-rs lab-sm");
lb("lb-dW", [DW2[0] + 35, DW2[1] - 12], "约 12 万枚 wETH · 约 3.2 亿美元", "lab-rs lab-sm");
lb("lb-ps", up(A.ps.top, 8), "特权合约", "lab-ink lab-sm");
lb("lb-wl", up(A.wl.top, 8), "白名单", "lab-gs lab-sm");
lb("lb-dP", [DP[0] + 42, DP[1] - 12], "约 6.1 亿美元", "lab-rs lab-sm");
lb("lb-dP2", [DP[0] + 42, DP[1] + 104], "已归还", "lab-gs lab-sm", "t");
lb("lb-0x", [A.mt.root[0] + 120, A.mt.root[1]], "0x00 → 全部通过", "lab-rs lab-sm", "l");
A.mt.leaves.forEach((q, i) => lb("lb-lf" + i, up(q, 26 + (i % 2) * 34), "✓", "lab-g lab-sm"));
lb("lb-lot", up(A.lot.top, 8), "零地址", "lab-ink lab-sm");
lb("lb-led", [at(L.RTAGE)[0] + 60, at(L.RTAGE)[1] - 40], "+ ETH 存款（不存在）", "lab-rs lab-sm", "l");
lb("lb-ok", up(A.rs.top, 60), "合约代码：正确", "lab-gs");
lb("lb-rs", up(A.rs.top, 8), "rsETH", "lab-cs lab-sm");
lb("lb-dK", [DK[0] - 16, DK[1] + 35], "约 11.65 万枚 rsETH", "lab-rs lab-sm", "r");
lb("lb-one", up(A.ve.top, 8), "1 个验证者", "lab-rs lab-sm");
lb("lb-fake", [(at(L.RPCS[0])[0] + at(L.RPCS[1])[0]) / 2, A.rpc0.top[1] - 20], "假数据", "lab-r lab-sm");
lb("lb-slot", up(A.rpc2.top, 10), "第二个来源 ✕", "lab-rs lab-sm");
lb("lb-stop", up(A.ksw2.top, 8), "约 4 万枚 rsETH 被拦下", "lab-gs lab-sm");
lb("lb-ap", up(A.ve.top, 60), "不应允许单个验证者验证高价值交易", "lab-ink lab-sm");

// ---------------------------------------------------------------- 段内镜头
const R = (o, kind, k) => L.rect(o, kind, k);
const box = (x0, y0, x1, y1) => [x0, y0, x1, y1];
const MID = [300, 300, 1620, 860];
const CAMX = {
  ...L.CAMS,
  eTreeW: L.fit([R(L.TREE, "merkleTree"), R({ ...KSW, scale: 0.6 }, "knifeSwitch"), box(DB[0], DB[1] - 50, DB[0] + 110, DB[1] + 110), box(DB[0] - 300, DB[1], DB[0], DB[1] + 80)], MID, 1.4),
  eSigW: L.fit([R(L.WSIG, "proofCard"), R(L.SYSACC, "docStanding"), box(DW2[0], DW2[1] - 50, DW2[0] + 300, DW2[1] + 80)], MID, 1.4),
  eKeyR: L.fit([R(L.SELKEY, "selectorKey"), R(L.PSAFE, "safe"), R(L.WLIST, "padlock"), box(DP[0], DP[1] - 50, DP[0] + 100, DP[1] + 130)], [960, 300, 1800, 860], 1.4),
};
Object.assign(CAMS_SEG, CAMX);

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 60, y: 330, w: 820 };
const card = codeCard("cc", { ...CC, head: "消息执行", tag: "示意", mono: true, rows: [
  { html: "target.call(msg.calldata);", chip: "任意目标", chipCls: "x" },
  { html: "require(allowedTarget[target]", chip: "白名单", chipCls: "ok" },
  { html: "  &amp;&amp; allowedFn[selector]);" }] });
S.curve("cv0", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("eKeyR", A.selk.top), { color: RED });
S.curve("cv1", [CC.x + CC.w + 4, codeRowY(CC.y, 1)], S.scr("eKeyR", A.wl.top), { color: GREEN });
S.curve("cvF0", S.scr("eRpc", A.rpc0.top), S.scr("eRpc", A.ve.top), { color: RED });
S.curve("cvF1", S.scr("eRpc", A.rpc1.top), S.scr("eRpc", A.ve.top), { color: RED });
const EV = [
  ["ev-ron", `<b>Ronin 复盘</b> · 5 把私钥被控制`, RED, 0],
  ["ev-bnb", `<b>BNB Chain Token Hub</b> · 2022 年 10 月`, RED, 0],
  ["ev-wh", `<b>Wormhole</b> · 2022 年 2 月`, RED, 0],
  ["ev-poly", `<b>Poly Network</b> · 2021 年 8 月`, RED, 0],
  ["ev-nomad", `<b>Nomad</b> · 2022 年 8 月`, RED, 0],
  ["ev-qubit", `<b>Qubit</b> · 2022 年 1 月`, RED, 0],
  ["ev-kelp", `<b>KelpDAO</b> · 2026 年 4 月 18 日<br><span style="font-size:28px">约 11.65 万枚 rsETH · 约 2.92 亿美元</span>`, RED, 0],
  ["sc-lz", `来源 · <b>LayerZero 声明</b>`, TEAL, 1],
  ["sc-cd", `来源 · <b>LayerZero 声明 · CoinDesk 报道</b>`, TEAL, 1],
  ["sc-ch", `来源 · <b>Chainalysis 分析</b>`, TEAL, 1],
  ["sc-tb", `来源 · <b>The Block 报道</b>`, TEAL, 1],
];
const evHtml = EV.map(([id, h, c, row], i) => evt(id, h, { color: c, top: ZONE.event.top + (row ? 130 : 0) + i * 3 })).join("");
const html = card + evHtml
  + kw("kw-41", `4 把在同一处 <b>= 1 把</b>`, { x: 1180, y: 760, size: 48, accent: RED })
  + kw("kw-any", `任何消息 <b>= 已证明</b>`, { x: 1180, y: 760, size: 48, accent: RED })
  + kw("kw-red", `数量 + 来源 <b>都要冗余</b>`, { x: 1180, y: 763, size: 48, accent: GREEN })
  + ck("ck-lz", "LayerZero 称：KelpDAO 配置", { x: 120, y: 790, w: 640, kind: "n" })
  + ck("ck-kd", "KelpDAO 称：默认设置", { x: 1120, y: 790, w: 560, kind: "n" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  pk: w("私钥", 0), vl: w("验证逻辑", 0), init: w("初始化", 0), dep: w("存款伪造", 0),
  same: w("同一机构", 2), auth: w("授权", 2), se: w("社会工程", 3), eq: w("等于", 4),
  fake6: w("伪造", 6), mint7: w("凭空", 7), other7: w("其他链", 7), code8: w("代码", 8),
  stop9: w("暂停", 9), fork9: w("硬分叉", 9), sys10: w("系统账户", 10), bypass11: w("绕过", 11), mint11: w("铸出", 11),
  any12: w("任意合约", 12), swap13: w("替换", 13), sign13: w("签出来", 13), back14: w("归还", 14), wl15: w("白名单", 15),
  zero16: w("零值", 16), any17: w("任何消息", 17), zero18: w("零地址", 18), rec18: w("记下", 18),
  kelp20: w("放出", 20), two21: w("两个", 21), fake21: w("假数据", 21), sec22: w("第二个", 22), def23: w("默认设置", 23),
  stop24: w("拦下", 24), sorry25: w("道歉", 25), red26: w("冗余", 26),
};
const t = (x) => f(x);
const evIn = (id, a, b) => `pop("#${id}", ${t(a)}, 0.3); out("#${id}", ${t(b)}, 0.3);`;
const mv = (sel, a, d, dx, dy) => `tl.to("${sel}", { x: ${f(dx)}, y: ${f(dy)}, duration: ${f(d)}, ease: "power2.inOut" }, ${t(a)});`;
const vkMerge = [0, 1, 2, 3].map((i) => mv("#vkr" + i, TM.eq, 0.7, bkPt[0] - vkPt(i)[0], bkPt[1] - vkPt(i)[1])).join(" ");
const sk = at(L.SELKEY), psf = at(L.PSAFE), skD = [(psf[0] - sk[0]) * 0.55, (psf[1] - sk[1]) * 0.55];
const ve = at(L.VALIDE), rsg = at(L.RSETH), el0 = at(L.ELETTER);
const walk1 = [[ve[0] - 40, ve[1] + 30], [ve[0] + 60, ve[1] + 40], [rsg[0] - 50, rsg[1] + 40]];
const walk2 = [[ve[0] + 60, ve[1] + 40], [rsg[0] - 70, rsg[1] + 45]];

S.build({
  cam0: "upgrade", sub: "四类根因，一个单点",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // B · D · E 都在内
  shown: ["#l16-key", "#l18-by", "#l19-two"], css, html,
  terms: [
    { id: "t0", t: "社会工程", d: "骗人交出密钥或权限的手法", at: w("社会工程", 3) },
    { id: "t1", t: "IAVL", d: "一种带哈希的平衡树，能出成员证明", at: w("IAVL", 6) },
    { id: "t2", t: "守护者", d: "Wormhole 里负责签名见证的节点", at: w("守护者", 11) },
    { id: "t3", t: "可信根", d: "已确认的 Merkle 根，用来核对消息", at: w("可信根", 16) },
    { id: "t4", t: "RPC", d: "读写链上数据的节点接口", at: w("RPC", 21) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot

      // 起始状态 = seg3 段尾
      tl.set("#zkc", { opacity: 0.3 }, 0); X10.push(tl, "core", 0, [${t(CORE_TO[0])}, ${t(CORE_TO[1])}], 0.01); X10.pull(tl, "core", 0, 0.01);
      out("#l16-key, #l18-by, #l19-two", ${t(LS[0] + 0.3)}, 0.3);
      const DRL = "#lb-dr0, #lb-dr1, #lb-dr2, #lb-dr3";
      // ===== L0 四类根因：D → E 档案墙，四个抽屉标签依次亮
      cam(${t(LS[0] + 0.4)}, "filesE", 2.6);
      pop("#lb-dr0", ${t(TM.pk)}); pop("#lb-dr1", ${t(TM.vl)}); pop("#lb-dr2", ${t(TM.init)}); pop("#lb-dr3", ${t(TM.dep)});
      // ===== L1 私钥与运营：第一个抽屉拉开，镜头带过 B
      fadeIn("#dro0", ${t(LS[1])}, 0.4); bump("#lb-dr0", ${t(LS[1])}, 1.15, 1);
      cam(${t(LS[1] + 0.5)}, "bridge", 1.6); out(DRL, ${t(LS[1] + 0.3)}, 0.2);
      // ===== L2 4 把同一机构 + 1 把授权：红钥匙回闪
      cam(${t(LS[2])}, "valid", 1.2);
      ${evIn("ev-ron", LS[2] + 0.4, LE[4] - 0.2)}
      [0, 1, 2, 3].forEach((i) => fadeIn("#vkr" + i, ${t(TM.same)} + i * 0.12, 0.3)); flash("#smf", ${t(TM.same + 0.3)}, 2);
      fadeIn("#vkr4", ${t(TM.auth)}, 0.3); pop("#lb-ax", ${t(TM.auth + 0.2)});
      // ===== L3 社会工程
      pop("#lb-se", ${t(TM.se)});
      // ===== L4 4 = 1
      ${vkMerge}
      [0, 1, 2, 3].forEach((i) => out("#vkr" + i, ${t(TM.eq + 0.65)}, 0.15)); fadeIn("#bigkey", ${t(TM.eq + 0.6)}, 0.2); bump("#bigkey", ${t(TM.eq + 0.8)}, 1.2, 1);
      pop("#kw-41", ${t(TM.eq + 0.1)}); out("#lb-ax, #lb-se", ${t(LE[4] - 0.2)}, 0.2); out("#kw-41", ${t(TM.eq + 2.8)}, 0.2);
      // ===== L5 验证逻辑：回 E，第二个抽屉，树升起
      cam(${t(LS[5] - 0.1)}, "filesE", 1.4);
      fadeIn("#dro1", ${t(LS[5] + 0.6)}, 0.4); fadeIn(DRL, ${t(LS[5] + 0.5)}, 0.3); bump("#lb-dr1", ${t(LS[5] + 0.9)}, 1.15, 1);
      grow("mt", ${t(LS[5] + 1.0)}, 0.8);
      // ===== L6 BNB Token Hub：叶子翻红
      out(DRL, ${t(LS[6] - 0.2)}, 0.2); cam(${t(LS[6])}, "eTreeW", 1.2); pop("#lb-mt", ${t(LS[6] + 1.0)});
      ${evIn("ev-bnb", LS[6] + 0.4, LE[9] - 0.2)}
      X12.leaf(tl, "mt", ${t(TM.fake6)}, true);
      // ===== L7 路径红线点到根，根仍绿勾；红点阵 + 外流
      X12.pathTone(tl, "mt", ${t(LS[7] - 0.1)}, "red"); X12.path(tl, "mt", ${t(LS[7])}, true, 1.0); X12.rootState(tl, "mt", ${t(LS[7] + 1.0)}, "ok");
      fadeIn("#dpB", ${t(TM.mint7)}, 0.5); pop("#lb-dB", ${t(TM.mint7 + 0.3)});
      fadeIn("#dsB", ${t(TM.other7 - 0.8)}, 0.2); tl.to("#dsB", { x: -260, y: 90, opacity: 0, duration: 1.4, ease: "power1.in" }, ${t(TM.other7 - 0.5)}); pop("#lb-sB", ${t(TM.other7 - 0.4)}); out("#lb-mt", ${t(TM.other7 - 0.6)}, 0.2);
      // ===== L8 没偷私钥，利用证明验证代码
      out("#lb-sB, #lb-dB, #dpB", ${t(LS[8])}, 0.2); pop("#lb-nk", ${t(LS[8] + 0.2)}); pop("#lb-pv", ${t(TM.code8)}); bump("#lb-pv", ${t(TM.code8 + 0.4)}, 1.12, 1);
      // ===== L9 约 3 小时暂停 + Moran 硬分叉
      out("#lb-nk", ${t(LS[9])}, 0.2);
      KIT.toggle(tl, "ksw", ${t(TM.stop9)}, false); pop("#lb-3h", ${t(TM.stop9 + 0.3)});
      X12.rootState(tl, "mt", ${t(TM.fork9)}, "normal"); pop("#lb-mo", ${t(TM.fork9 + 0.1)});
      out("#lb-mt, #lb-dB, #lb-pv, #lb-3h, #lb-mo, #dpB", ${t(LE[9] - 0.2)}, 0.2);
      // ===== L10 Wormhole：系统账户没核对
      cam(${t(LS[10])}, "eSigW", 1.2); pop("#lb-ws", ${t(LS[10] + 1.0)});
      ${evIn("ev-wh", LS[10] + 0.4, LE[11] - 0.2)}
      KIT.swap(tl, "#sys", "#sysR", ${t(TM.sys10)}, 0.4); pop("#lb-sys", ${t(TM.sys10 + 0.4)});
      // ===== L11 绕过守护者签名，约 12 万枚 wETH
      KIT.swap(tl, "#ws-card", "#ws-slot", ${t(TM.bypass11)}, 0.4);
      out("#lb-sys", ${t(TM.mint11 - 0.2)}, 0.2); fadeIn("#dpW", ${t(TM.mint11)}, 0.5); pop("#lb-dW", ${t(TM.mint11 + 0.3)});
      out("#lb-ws, #lb-sys, #lb-dW, #dpW", ${t(LE[11] - 0.2)}, 0.2);
      // ===== L12 Poly Network：代码卡 C 第 1 行
      cam(${t(LS[12])}, "eKeyR", 1.2); pop("#lb-ps", ${t(LS[12] + 1.0)});
      ${evIn("ev-poly", LS[12] + 0.4, LE[14] - 0.2)}
      pop("#cc", ${t(TM.any12)}, 0.3); hot("#cc-r0", ${t(TM.any12 + 0.4)}, "#fde6e3"); pop("#cc-c0", ${t(TM.any12 + 0.6)}, 0.2);
      // ===== L13 替换公钥插进特权合约
      draw("cv0", ${t(TM.swap13)}, 0.6);
      ${mv("#selk", TM.swap13 + 0.4, 0.9, skD[0], skD[1])} flash("#ps", ${t(TM.sign13)}, 2);
      // ===== L14 约 6.1 亿美元，后归还
      out("#cv0", ${t(LS[14])}, 0.2);
      fadeIn("#dpP", ${t(LS[14] + 0.2)}, 0.5); pop("#lb-dP", ${t(LS[14] + 0.5)});
      tl.to("#dpP circle", { attr: { fill: "#a8a296" }, duration: 0.6 }, ${t(TM.back14)}); pop("#lb-dP2", ${t(TM.back14 + 0.2)});
      // ===== L15 白名单：第 2 行亮，挂锁挂上，钥匙弹开
      out("#dpP, #lb-dP, #lb-dP2", ${t(LS[15])}, 0.2);
      hot("#cc-r1", ${t(LS[15] + 0.3)}, "#e3f4ea"); hot("#cc-r2", ${t(LS[15] + 0.3)}, "#e3f4ea"); pop("#cc-c1", ${t(LS[15] + 0.5)}, 0.2);
      draw("cv1", ${t(TM.wl15 - 0.3)}, 0.6); grow("wl", ${t(TM.wl15)}, 0.6); pop("#lb-wl", ${t(TM.wl15 + 0.4)});
      ${mv("#selk", TM.wl15 + 0.3, 0.6, 0, 0)}
      out("#cc, #cv1, #lb-wl, #lb-ps", ${t(LE[15] - 0.2)}, 0.2);
      // ===== L16 初始化：Nomad 可信根 = 零值
      X12.leaf(tl, "mt", ${t(LS[16])}, false, 0.3); X12.path(tl, "mt", ${t(LS[16])}, false, 0.3);
      cam(${t(LS[16])}, "filesE", 1.0); fadeIn("#dro2", ${t(LS[16] + 0.8)}, 0.4); fadeIn(DRL, ${t(LS[16] + 0.5)}, 0.3); bump("#lb-dr2", ${t(LS[16] + 0.9)}, 1.15, 1); out(DRL, ${t(LS[16] + 1.8)}, 0.2);
      cam(${t(LS[16] + 2.0)}, "eTreeW", 1.2);
      ${evIn("ev-nomad", LS[16] + 2.2, LE[17] - 0.2)}
      X12.rootText(tl, "mt", ${t(TM.zero16)}, "0x00", "red"); X12.rootState(tl, "mt", ${t(TM.zero16 + 0.2)}, "bad");
      // ===== L17 任何消息都被当作已证明
      X12.pathTone(tl, "mt", ${t(LS[17])}, "teal"); X12.path(tl, "mt", ${t(LS[17])}, true, 0.6);
      [0, 1, 2, 3].forEach((i) => pop("#lb-lf" + i, ${t(LS[17] + 0.3)} + i * 0.18, 0.2)); pop("#lb-0x", ${t(LS[17] + 0.4)});
      pop("#kw-any", ${t(TM.any17)}); out("#kw-any, #lb-lf0, #lb-lf1, #lb-lf2, #lb-lf3, #lb-0x", ${t(LE[17] - 0.2)}, 0.2);
      // ===== L18 存款伪造：Qubit 零地址返回成功
      cam(${t(LS[18])}, "filesE", 1.0); fadeIn("#dro3", ${t(LS[18] + 0.7)}, 0.4); fadeIn(DRL, ${t(LS[18] + 0.8)}, 0.3); bump("#lb-dr3", ${t(LS[18] + 1.0)}, 1.15, 1); out(DRL, ${t(LS[18] + 1.7)}, 0.2);
      cam(${t(LS[18] + 1.9)}, "eZero", 1.2); pop("#lb-lot", ${t(LS[18] + 3.0)});
      ${evIn("ev-qubit", LS[18] + 2.1, LE[18] - 0.2)}
      grow("rt", ${t(TM.zero18 + 0.6)}, 0.5); bump("#rt", ${t(TM.zero18 + 1.2)}, 1.2, 1);
      pop("#lb-led", ${t(TM.rec18)}); out("#lb-lot, #lb-led", ${t(LE[18] - 0.2)}, 0.2);
      // ===== L19 代码完全正确：单验证者角
      cam(${t(LS[19])}, "eRpc", 1.2); pop("#lb-rs", ${t(LS[19] + 1.0)}); pop("#lb-ok", ${t(LS[19] + 1.4)});
      // ===== L20 KelpDAO：红信封穿过验证者，rsETH 吐出红点阵
      out("#lb-ok", ${t(LS[20])}, 0.2);
      ${evIn("ev-kelp", LS[20] + 0.3, LE[20] - 0.2)}
      X1.walk(tl, "el", ${t(TM.kelp20 - 1.6)}, 1.6, ${JSON.stringify(walk1)}); out("#el", ${t(TM.kelp20 + 0.1)}, 0.3);
      fadeIn("#dpK", ${t(TM.kelp20 + 0.2)}, 0.5); pop("#lb-dK", ${t(TM.kelp20 + 0.5)});
      // ===== L21 一个验证者，两个 RPC 被控制
      out("#lb-dK, #dpK", ${t(LS[21])}, 0.2);
      ${evIn("sc-lz", LS[21] + 0.3, LE[22] - 0.2)}
      pop("#lb-one", ${t(LS[21] + 0.6)});
      fadeIn("#rpcR0", ${t(TM.two21)}, 0.4); fadeIn("#rpcR1", ${t(TM.two21 + 0.2)}, 0.4);
      draw("cvF0", ${t(TM.fake21 - 0.6)}, 0.5); draw("cvF1", ${t(TM.fake21 - 0.4)}, 0.5); pop("#lb-fake", ${t(TM.fake21)});
      // ===== L22 没有第二个独立来源
      fadeIn("#slot", ${t(TM.sec22)}, 0.4); pop("#lb-slot", ${t(TM.sec22 + 0.3)});
      out("#cvF0, #cvF1, #lb-fake", ${t(LE[22] - 0.2)}, 0.2);
      // ===== L23 责任争议
      pop("#ck-lz", ${t(LS[23] + 1.2)}); pop("#ck-kd", ${t(TM.def23 - 0.8)});
      ${evIn("sc-cd", LS[23] + 0.3, LE[23] - 0.2)}
      out("#ck-lz, #ck-kd", ${t(LE[23] - 0.2)}, 0.2);
      // ===== L24 暂停合约拦下第二封
      ${evIn("sc-ch", LS[24] + 0.3, LE[24] - 0.2)}
      fadeIn("#el2w", ${t(LS[24] + 1.0)}, 0.3); X1.walk(tl, "el2", ${t(LS[24] + 1.2)}, 1.4, ${JSON.stringify(walk2)});
      KIT.toggle(tl, "ksw2", ${t(TM.stop24 - 0.4)}, false); flash("#el2w", ${t(TM.stop24)}, 2); pop("#lb-stop", ${t(TM.stop24 + 0.2)});
      out("#lb-stop", ${t(LE[24] - 0.2)}, 0.2);
      // ===== L25 LayerZero 道歉
      ${evIn("sc-tb", LS[25] + 0.3, LE[25] - 0.2)}
      out("#lb-one", ${t(LS[25])}, 0.2); pop("#lb-ap", ${t(TM.sorry25)}); out("#lb-ap", ${t(LE[25] - 0.2)}, 0.2);
      // ===== L26 冗余：空位里长出第三台 RPC 和第二、三个验证者
      out("#slot, #lb-slot", ${t(LS[26] + 0.3)}, 0.3); grow("rpc2", ${t(LS[26] + 0.6)}, 0.6);
      grow("vn0", ${t(LS[26] + 1.0)}, 0.5); grow("vn1", ${t(LS[26] + 1.3)}, 0.5);
      pop("#kw-red", ${t(TM.red26 - 0.6)});
`,
});
