// ep23/seg5「⑤ 检查站」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.signC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   intakeA      A 区块链 + 充值地址 ×3 + 扫描放大镜 + 台秤 + 真 / 假代币 + returnTag + Omni 交易（seg3 L0–L17）
//   checksA      A 四道入账检查 ①–④ + 确认数信号 + 两个节点 + 台秤（seg3 L18–L25 终点；seg4 起点）
//   vaultB       B 冷 / 温 / 热三层金库 + 水位表 + 管道（seg2 L12–L15）
//   hotB         B 三只热钱包 + 熔断闸刀 + 暂停闸 + 告警灯 + 时钟 + 点阵（seg1 起点 L0–L9；seg4 L16；seg6 L9）
//   delegB       B ETH 热钱包 + 地址立柱 + 委托挂牌 + 攻击者合约，题卡在右侧（seg1 L10–L14 终点；seg2 起点；seg4 L15；seg6 L0–L6）
//   signC        C 账本 → 风控 → 签名服务 + HSM + 容器 + 提现单 + 三条防线牌（seg4 L0–L6、L20–L24 终点；seg5 起点；seg6 L10）
//   devC         C 三个工位 + 工程师 + 部署令牌 + AI 工具 + 攻击者 + 签名服务 / 容器（seg4 L7–L14、L17–L19）
//   gateD        D 四道合规关卡 + 风险表 + 护照 + 另一家服务商 + 三类攻击者 + 门槛牌（seg5 L0–L14）
//   freezeD      D 冻结锁 + 两行点阵 + 原生币 + 代价天平 + 认罪协议 + 误冻的普通用户（seg5 L15–L23 终点；seg6 起点）
//   userE        E 用户柜台：手机 + 地址簿 + 冷却期时间锁 + 提币白名单 + 用户（seg6 L11–L14）
//   flowAC       A 充值扫描 → C 签名服务 → 回到 B 热钱包的整条流水线（seg2 L16–L24 终点；seg3 起点）
//   airport      A–D 中景，五块机场指示牌都在画内（seg2 L0–L11）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   wide         整座机场全景：A → E（seg6 L15–L16 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.freezeD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E4, E7, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- helpers
const D0 = L.ZONE_ANCHOR.D, C0 = L.ZONE_ANCHOR.C;
const P = (X, Y) => [D0[0] + X, D0[1] + Y];                    // D zone-local px → world-canvas px
const PC = (X, Y) => [C0[0] + X, C0[1] + Y];
const oAt = ([x, y]) => { const q = G(x, y); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const isPt = (p) => Array.isArray(p) && typeof p[0] === "number";
/** put a non-scaling object wrapped at o.scale around its (lifted) ground point; anchors rescaled */
const PW = (key, o, r, dy = 0, extra = {}) => {
  const [gx, gy] = Wp(o.u, o.v, o.z ?? 0), k = o.scale;
  const inner = (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
  put(key, o, r, dy, { ...extra, wrap: extra.hid ? (svg) => S.hid(extra.hid, inner(svg)) : inner });
  for (const n of Object.keys(A[key])) if (isPt(A[key][n])) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k];
};
const FONT = `font-family="PingFang SC, Noto Sans SC, sans-serif" font-weight="800"`;
const coin = (x, y, r, fill, st) => `<ellipse cx="${x}" cy="${y + 3}" rx="${r}" ry="${r * 0.55}" fill="${st}"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="${fill}" stroke="${st}" stroke-width="2"/>`;
const dots = (x, y, n, cols, color, step = 14, r = 4.6) => Array.from({ length: n }, (_, i) =>
  `<circle cx="${x + (i % cols) * step + r}" cy="${y + Math.floor(i / cols) * step + r}" r="${r}" fill="${color}"/>`).join("");
const RED = "#e0453a", GRN = "#1f9d55", TEAL = "#2aa3c9", INK = "#1c1c1c", GRAY = "#9a958b";

// ---------------------------------------------------------------- C 区（上段终点 signC 的画面，开场 2 秒可见）
put("signC", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "signC", style: "plate", text: "登机口 · 提币" }));
PW("ledgerC", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ledgerC", tag: "内部账本" }));
PW("shieldC", L.SHIELD, O.shield(L.SHIELD, { id: "shieldC" }));
PW("rackC", L.RACK, O.rack(L.RACK, { id: "rackC", tag: "签名服务", glow: true }));
PW("hsmC", L.HSM, O.hsm(L.HSM, { id: "hsmC" }));
put("ctrC", L.CONTAINER, E13.container(L.CONTAINER, { id: "ctrC", label: "容器", scale: 0.5 }));
PW("wdC", L.WD_DOC, O.doc(L.WD_DOC, { id: "wdC", title: "提现单", standing: true }));
{ // three defence plaques (seg4 L20–L23)
  const [x0, y0] = Wp(L.DEF_C.u, L.DEF_C.v), txt = ["独立核对", "短期 · 绑设备 · 双人", "分团队维护"];
  add(L.DEF_C, txt.map((s, i) => `<g><rect x="${x0 + i * 180}" y="${y0 - 80}" width="160" height="66" rx="10" fill="#fffdf8" stroke="${TEAL}" stroke-width="3"/>
    <rect x="${x0 + i * 180 + 76}" y="${y0 - 14}" width="8" height="14" fill="#8d939b"/>
    <text x="${x0 + i * 180 + 80}" y="${y0 - 40}" text-anchor="middle" font-size="${s.length > 6 ? 16 : 22}" fill="${INK}" ${FONT}>${s}</text></g>`).join(""));
}

// ---------------------------------------------------------------- D 区 · gateD
put("signD", L.SIGN_D, E1.signBoard(L.SIGN_D, { id: "signD", style: "plate", text: "安检 · 边检" }));
L.CKPT_D.forEach((o, i) => PW("ckD" + i, o, O.checkpoint(o, { id: "ckD" + i, n: "①②③④"[i], armUp: true })));
L.ATK_D.forEach((o, i) => put("atk" + i, o, O.person(o, { id: "atk" + i, role: "attacker", scale: 0.5 }), 0, { grow: true }));
put("gauge", L.GAUGE, E3.gasGauge(L.GAUGE, { id: "gauge", label: "风险", value: 0.15, scale: 0.7 }));
put("pp", L.PASSPORT, E13.passport(L.PASSPORT, { id: "pp", title: "转账", fields: ["发起人", "受益人", "金额"], scale: 0.55 }));
put("teller", L.TELLER, E4.tellerCounter(L.TELLER, { id: "teller", scale: 0.6 }));
put("plate0", L.PLATES_D[0], E1.signBoard(L.PLATES_D[0], { id: "plate0", style: "plate", text: "FATF · 门槛", sub: "1000 美元 / 欧元", size: 28 }), 0, { grow: true });
put("plate1", L.PLATES_D[1], E1.signBoard(L.PLATES_D[1], { id: "plate1", style: "plate", text: "欧盟 · 不设门槛", sub: "服务商之间", size: 28 }), 0, { grow: true });

// back wall with one gap (L1 "规则漏洞")
const WALL = (() => {
  const a = L.CKPT_D[0], b = L.CKPT_D[3], du = b.u - a.u, dv = b.v - a.v, n = Math.hypot(du, dv);
  const p0 = { u: a.u - (350 * du) / n, v: a.v - (350 * dv) / n - 300 }, p1 = { u: b.u + (300 * du) / n, v: b.v + (300 * dv) / n - 300 };
  const lerp = (t) => ({ u: p0.u + (p1.u - p0.u) * t, v: p0.v + (p1.v - p0.v) * t });
  const seg = (q0, q1) => { const A0 = Wp(q0.u, q0.v), A1 = Wp(q1.u, q1.v), B1 = Wp(q1.u, q1.v, 46), B0 = Wp(q0.u, q0.v, 46);
    return `<polygon points="${[A0, A1, B1, B0].map((p) => p.join(",")).join(" ")}" fill="#d7eedf" stroke="${GRN}" stroke-width="3"/>`; };
  return { lerp, seg, g0: 0.26, g1: 0.31 };
})();
add(WALL.lerp(0.5), S.hid("wall", WALL.seg(WALL.lerp(0), WALL.lerp(WALL.g0)) + WALL.seg(WALL.lerp(WALL.g1), WALL.lerp(1))), -400);
const GAP = Wp(WALL.lerp((WALL.g0 + WALL.g1) / 2).u, WALL.lerp((WALL.g0 + WALL.g1) / 2).v, 23);
add(WALL.lerp(0.29), S.hid("gapBox", `<rect x="${GAP[0] - 44}" y="${GAP[1] - 56}" width="88" height="112" rx="6" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="10 7"/>`), -390);

// attackers' props
const RC0 = up(A.atk0.center, -6), BC0 = [A.atk2.center[0] + 30, A.atk2.center[1]];
add(L.ATK_D[0], S.hid("redc", [0, 1, 2, 3].map((i) => coin(RC0[0] + 26 + i * 6, RC0[1] - i * 9, 11, RED, "#9e2a21")).join("")), 2);
const TAGP = [A.atk1.center[0] + 34, A.atk1.center[1] - 6];
add(L.ATK_D[1], S.hid("tagOld", `<rect x="${TAGP[0] - 4}" y="${TAGP[1] - 16}" width="70" height="30" rx="5" fill="#fbe3e0" stroke="${RED}" stroke-width="2.5"/><text x="${TAGP[0] + 31}" y="${TAGP[1] + 5}" text-anchor="middle" font-size="16" fill="${RED}" ${FONT}>旧地址</text>`), 2);
add(L.ATK_D[1], S.hid("tagNew", `<rect x="${TAGP[0] - 4}" y="${TAGP[1] - 16}" width="70" height="30" rx="5" fill="#ffffff" stroke="${INK}" stroke-width="2.5"/><text x="${TAGP[0] + 31}" y="${TAGP[1] + 5}" text-anchor="middle" font-size="16" fill="${INK}" ${FONT}>新地址</text>`), 2.1);
add(L.ATK_D[2], S.hid("bigc", coin(BC0[0], BC0[1], 20, RED, "#9e2a21")), 2);
const SM = [[-34, 10], [-16, -14], [4, 14], [22, -12], [40, 12]];
add(L.ATK_D[2], S.hid("smc", SM.map(([dx, dy]) => coin(BC0[0] + dx, BC0[1] + dy, 8, RED, "#9e2a21")).join("")), 2.1);
// L5 operations wallet box + 3 gray coins
const OPS = Wp(L.OPS_D.u, L.OPS_D.v);
add(L.OPS_D, S.hid("ops", `<rect x="${OPS[0] - 66}" y="${OPS[1] - 62}" width="132" height="58" rx="8" fill="#fbe3e0" stroke="${RED}" stroke-width="3.5"/>
  <text x="${OPS[0]}" y="${OPS[1] - 25}" text-anchor="middle" font-size="22" fill="${RED}" ${FONT}>操作钱包</text>`), 1);
[0, 1, 2].forEach((i) => add(L.OPS_D, S.hid("gc" + i, coin(OPS[0] - 34 + i * 34, OPS[1] - 76, 10, "#c9c4ba", "#7d786f")), 1.1 + i * 0.01));
// L7 OFAC list card (world, above ①)
const OF = P(-1170, -500);
add(oAt(P(-1080, -380)), S.hid("ofac", `<rect x="${OF[0]}" y="${OF[1]}" width="190" height="118" rx="8" fill="#ffffff" stroke="${INK}" stroke-width="2.5"/>
  <rect x="${OF[0]}" y="${OF[1]}" width="190" height="30" rx="8" fill="${RED}"/><text x="${OF[0] + 95}" y="${OF[1] + 22}" text-anchor="middle" font-size="19" fill="#fff" ${FONT}>OFAC 名单</text>
  <rect x="${OF[0] + 14}" y="${OF[1] + 42}" width="120" height="9" rx="4" fill="#cfc7b8"/><rect x="${OF[0] + 14}" y="${OF[1] + 60}" width="150" height="9" rx="4" fill="#cfc7b8"/>
  <text id="ofac-tc" x="${OF[0] + 14}" y="${OF[1] + 101}" font-size="20" fill="${INK}" ${FONT}>Tornado Cash</text>`), 1);
add(oAt(P(-1080, -380)), S.hid("ofacStrike", `<line x1="${OF[0] + 8}" y1="${OF[1] + 94}" x2="${OF[0] + 150}" y2="${OF[1] + 94}" stroke="${GRAY}" stroke-width="4"/>`), 1.1);
// L8 three hops to a "被盗" box
const HOP = [P(-1110, -90), P(-1220, -170), P(-1340, -120), P(-1470, -170)];
HOP.slice(0, 3).forEach((p, i) => add(oAt(p), S.hid("hop" + i, `<path d="M${p[0]} ${p[1]}L${HOP[i + 1][0]} ${HOP[i + 1][1]}" stroke="#7d786f" stroke-width="3.5" stroke-dasharray="9 7" fill="none"/><circle cx="${HOP[i + 1][0]}" cy="${HOP[i + 1][1]}" r="6" fill="#7d786f"/>`), 1));
add(oAt(HOP[3]), S.hid("stolen", `<rect x="${HOP[3][0] - 44}" y="${HOP[3][1] - 46}" width="88" height="36" rx="6" fill="#fbe3e0" stroke="${RED}" stroke-width="3"/><text x="${HOP[3][0]}" y="${HOP[3][1] - 21}" text-anchor="middle" font-size="19" fill="${RED}" ${FONT}>被盗</text>`), 1.1);
// L9 passport → teller dashed path + travelling token
const PP0 = A.pp.page ?? A.pp.top, TL0 = A.teller.window1 ?? A.teller.top;
add(L.PASSPORT, S.hid("ppLine", `<path d="M${PP0[0]} ${PP0[1]}Q${(PP0[0] + TL0[0]) / 2} ${Math.min(PP0[1], TL0[1]) - 120} ${TL0[0]} ${TL0[1]}" stroke="${TEAL}" stroke-width="4" stroke-dasharray="11 8" fill="none"/>`), 50);
add(L.PASSPORT, S.hid("ppTok", `<rect x="${PP0[0] - 18}" y="${PP0[1] - 24}" width="36" height="46" rx="4" fill="#1d93ba" stroke="#0f6f8f" stroke-width="2"/><circle cx="${PP0[0]}" cy="${PP0[1] - 6}" r="7" fill="#f0c04a"/>`), 51);
add(L.PASSPORT, S.hid("ppGap", `<rect x="${PP0[0] - 34}" y="${PP0[1] - 30}" width="68" height="56" rx="5" fill="none" stroke="${RED}" stroke-width="3.5" stroke-dasharray="8 6"/>`), 52);
// L10 / L23 teal frame near ④
const FR4 = P(560, 150);
add(oAt(FR4), S.hid("frame4", `<rect x="${FR4[0] - 70}" y="${FR4[1] - 50}" width="140" height="80" rx="10" fill="none" stroke="${TEAL}" stroke-width="4" stroke-dasharray="10 7"/>`), 30);
// L14 small transfer token, L23 gray coin
add(oAt(P(-300, 140)), S.hid("tiny", coin(...P(-300, 140), 9, "#f0c04a", "#b58630")), 20);
add(oAt(P(-700, 140)), S.hid("grayc", coin(...P(-700, 140), 12, "#c9c4ba", "#7d786f")), 20);

// ---------------------------------------------------------------- D 区 · freezeD
L.COINS_D.forEach((o, i) => put("cn" + i, o, E7.oddCoin(o, { id: "cn" + i, kind: "plain", scale: 0.6 })));
L.LOCKS_D.forEach((o, i) => PW("lk" + i, o, O.padlock(o, { id: "lk" + i }), 5, { hid: "lkw" + i }));
L.NATIVE_D.forEach((o, i) => put("nat" + i, o, E7.oddCoin(o, { id: "nat" + i, kind: "plain", scale: 0.6 })));
const RQ = P(990, -90);
add(oAt(RQ), S.hid("redq", [0, 1, 2, 3, 4].map((i) => coin(RQ[0] - 40 + i * 20, RQ[1] + i * 6, 11, RED, "#9e2a21")).join("")), 5);
const DF = Wp(L.DOTS_FRZ.u, L.DOTS_FRZ.v);
add(L.DOTS_FRZ, S.hid("dotsU", dots(DF[0], DF[1], 97, 20, TEAL)) + S.hid("dotsC2", dots(DF[0], DF[1] + 80, 82, 20, TEAL)), 0);
PW("bal", L.BALANCE, E1.balance(L.BALANCE, { id: "bal", tilt: 0 }), 0, { grow: true });
L.PLEA_D.forEach((o, i) => PW("plea" + i, o, O.doc(o, { id: "plea" + i, title: "认罪协议", lines: [["Binance", "KuCoin · OKX"][i]], standing: true }), 0, { grow: true }));
const DP = Wp(L.DOTS_PLEA.u, L.DOTS_PLEA.v);
add(L.DOTS_PLEA, S.hid("dotsP", dots(DP[0], DP[1], 43, 11, RED, 18, 6)), 0);
put("userD", L.USER_D, O.person(L.USER_D, { id: "userD", role: "signer", scale: 0.5 }), 0, { grow: true });
PW("wdD", L.WD_D, O.doc(L.WD_D, { id: "wdD", title: "提现单", standing: true }), 0, { grow: true });
PW("seal", L.SEAL, O.seal(L.SEAL, { id: "seal", markText: "冻结", text: "风控", stamped: false }), 0, { hid: "sealw" });
const RV = Wp(L.REVIEW_D.u, L.REVIEW_D.v);
add(L.REVIEW_D, S.hid("review", ["人工复核", "申诉"].map((s, i) => `<rect x="${RV[0] + i * 140}" y="${RV[1] - 52}" width="124" height="46" rx="8" fill="#fffdf8" stroke="#8d939b" stroke-width="3" stroke-dasharray="8 6"/>
  <text x="${RV[0] + i * 140 + 50}" y="${RV[1] - 21}" text-anchor="middle" font-size="20" fill="${INK}" ${FONT}>${s}</text>
  <rect x="${RV[0] + i * 140 + 94}" y="${RV[1] - 42}" width="22" height="22" rx="4" fill="#fff" stroke="#8d939b" stroke-width="2.5"/>`).join("")), 10);
add(L.REVIEW_D, S.hid("reviewOk", [0, 1].map((i) => `<path d="M${RV[0] + i * 140 + 98} ${RV[1] - 32}l6 7l12 -15" stroke="${GRN}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join("")), 10.1);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-gap", up(GAP, 64), "规则漏洞", "lab-rs lab-sm");
["盗款者", "名单上的人", "洗钱者"].forEach((s, i) => lb("lb-atk" + i, up(A["atk" + i].top, 6), s, "lab-r lab-sm"));
lb("lb-ops-ev", up(OPS, 96), "3 笔 Tornado Cash 提款", "lab-ink lab-sm");
["① 制裁筛查", "② 风险评分", "③ Travel Rule", "④ 反洗钱监控"].forEach((s, i) => lb("lb-ck" + i, up(A["ckD" + i].top, 4), s, "lab-cs lab-sm"));
lb("lb-hit", [A.ckD0.ground[0] + 40, A.ckD0.ground[1] + 120], "✕ 命中 · 拦下", "lab-rs lab-sm", "t");
lb("lb-split", up([FR4[0], FR4[1] - 50], 4), "拆分", "lab-cs lab-sm");
lb("lb-tok", up(TL0, 16), "发起人 / 受益人", "lab-cs lab-sm");
lb("lb-miss", [PP0[0], PP0[1] + 44], "缺发起人 / 受益人信息", "lab-rs lab-sm", "t");
lb("lb-tiny", up(P(-300, 140), 24), "小额", "lab-ink lab-sm");
lb("lb-last", up([RQ[0], RQ[1] - 20], 6), "冻结的最后机会", "lab-rs lab-sm");
lb("lb-usdt", [A.cn0.ground[0] - 30, A.cn0.ground[1] + 14], "USDT", "lab-cs lab-sm", "t");
lb("lb-usdc", [A.cn1.ground[0] + 40, A.cn1.ground[1] + 14], "USDC", "lab-cs lab-sm", "t");
lb("lb-dotsU", [DF[0] + 290, DF[1] + 34], "约 9.711 亿 USDT", "lab-cs lab-sm", "l");
lb("lb-dotsC", [DF[0] + 290, DF[1] + 114], "约 8.23 亿 USDC", "lab-cs lab-sm", "l");
lb("lb-dotsLeg", [DF[0] + 140, DF[1] - 8], "每点约 1000 万枚", "lab-g lab-sm");
lb("lb-btc", [A.nat0.ground[0] - 20, A.nat0.ground[1] + 14], "BTC", "lab-ink lab-sm", "t");
lb("lb-xrp", [A.nat1.ground[0] + 40, A.nat1.ground[1] + 14], "XRP", "lab-ink lab-sm", "t");
lb("lb-native", [A.nat1.ground[0] + 40, A.nat1.ground[1] + 110], "原生资产 · 发行方无法冻结", "lab-rs lab-sm", "t");
lb("lb-bal", up(A.bal.top, 8), "代价", "lab-ink lab-sm");
lb("lb-dotsP", [DP[0] + 100, DP[1] - 8], "约 43 亿美元 · 每点约 1 亿美元", "lab-r lab-sm");
lb("lb-plea0", up(A.plea0.top, 6), "Binance", "lab-ink lab-sm");
lb("lb-plea1", [A.plea1.ground[0] + 30, A.plea1.ground[1] + 10], "KuCoin · OKX", "lab-ink lab-sm", "t");
lb("lb-wrong", up(A.userD.top, 6), "错冻", "lab-rs lab-sm");
lb("lb-gauge", [A.gauge.ground[0] - 120, A.gauge.ground[1] + 10], "风险仍偏高", "lab-r lab-sm", "t");
lb("lb-again", up([FR4[0], FR4[1] - 50], 4), "照样评分", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const EV = (id, html, i, color) => evt(id, html, { top: 120 + i * 3, color });
const html = [
  EV("ev5", `Binance · 事件前一天 ${gtag("TRM 分析")}`, 0, RED),
  kw("kw11", `门槛 <b>按辖区</b>`, { x: 1300, y: 300, accent: TEAL }),
  EV("ev12", `FATF 建议 ${gtag("FATF")}`, 1),
  EV("ev13", `欧盟规定 ${gtag("荷兰央行说明")}`, 2),
  EV("ev16", `Binance 事件当晚 · 冻结 ${gtag("TRM 分析")}`, 3),
  EV("ev19", `Binance · 2023 年 11 月 · 认罪 ${gtag("美国司法部")}`, 4, RED),
  EV("ev20", `KuCoin · OKX · 2025 ${gtag("美国司法部纽约南区")}`, 5, RED),
  EV("ev22", `2025 年 3 月 · 移出制裁名单 ${gtag("美国财政部")}`, 6, GRAY),
].join("");
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  gap: w("规则有漏洞", 1), ofac: w("OFAC", 7), lan: w("命中就拦", 7), hop: w("几跳以内", 8), stolen: w("被盗资金", 8),
  tr: w("发起人", 9), split: w("拆分", 10), small: w("小额转账", 14), miss: w("缺了", 14),
  usdt: w("Tether", 16), usdc: w("Circle", 16), plea: w("认罪", 19), ko: w("KuCoin", 20),
  wrong: w("误报", 21), review: w("人工复核", 21), cuo: w("错冻", 21), nolose: w("没有跟着消失", 22),
};
const t = (x) => f(x);

S.build({
  cam0: "signC", sub: "规则有漏洞就够了",
  grid: { u0: 4200, u1: 12700, v0: -3900, v1: 4200 }, box: [3500, -3800, 7000, 2800],   // 盖住上段终点 signC + gateD / freezeD
  shown: [], css, html,
  terms: [
    { id: "t0", t: "OFAC", d: "美国财政部负责制裁名单的机构", at: w("OFAC", 7) },
    { id: "t1", t: "混币器", d: "把多人资金混在一起切断来源的工具", at: w("混币器", 8) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。
      // ===== L0 再看交易所的另一张面孔，检查站。
      out("#wall", 0, 0.01); cam(${t(LS[0])}, "gateD", 1.8); fadeIn("#wall", ${t(LS[0] + 1.2)}, 0.5); bump("#signD", ${t(LS[0] + 2.0)}, 1.08, 2);
      // ===== L1 这里的攻击者，不需要攻破交易所的系统，只需要规则有漏洞。
      bump("#wall", ${t(LS[1] + 0.4)}, 1.02, 1); fadeIn("#gapBox", ${t(TM.gap)}, 0.3); flash("#gapBox", ${t(TM.gap + 0.3)}, 2); pop("#lb-gap", ${t(TM.gap + 0.2)});
      // ===== L2 盗来的资金，想充进交易所，再提走或者换掉。
      out("#lb-gap", ${t(LS[2] - 0.2)}); grow("atk0", ${t(LS[2])}); fadeIn("#redc", ${t(LS[2] + 0.4)}); pop("#lb-atk0", ${t(LS[2] + 0.5)});
      out("#lb-atk0", ${t(LS[2] + 2.0)}); tl.to("#atk0, #redc", { x: 220, y: -10, duration: 1.4, ease: "power1.inOut" }, ${t(LS[2] + 2.1)});
      // ===== L3 名单上的人，换个新地址、新账户，绕过筛查。
      grow("atk1", ${t(LS[3])}); fadeIn("#tagOld", ${t(LS[3] + 0.4)}); pop("#lb-atk1", ${t(LS[3] + 0.5)});
      out("#tagOld", ${t(LS[3] + 1.9)}, 0.3); pop("#tagNew", ${t(LS[3] + 2.1)});
      // ===== L4 洗钱者把金额拆开，快进快出。
      grow("atk2", ${t(LS[4])}); fadeIn("#bigc", ${t(LS[4] + 0.4)}); pop("#lb-atk2", ${t(LS[4] + 0.5)});
      out("#bigc", ${t(LS[4] + 1.5)}, 0.2); fadeIn("#smc", ${t(LS[4] + 1.5)}, 0.3); bump("#smc", ${t(LS[4] + 1.8)}, 1.15, 1);
      // ===== L5 TRM 记录到，Binance 事件前一天，攻击者的操作钱包，收到 3 笔 Tornado Cash 提款。
      out("#lb-atk1, #lb-atk2", ${t(LS[5] - 0.2)}); pop("#ev5", ${t(LS[5] + 0.3)}); pop("#ops", ${t(LS[5] + 2.6)});
      [0, 1, 2].forEach((i) => { tl.fromTo("#gc" + i, { opacity: 0, y: -90 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.in", immediateRender: false }, ${t(LS[5] + 4.2)} + i * 0.45); });
      pop("#lb-ops-ev", ${t(LS[5] + 5.2)});
      // ===== L6 一笔充值或者提币，要过四道关。
      out("#ev5, #lb-ops-ev", ${t(LS[6] - 0.2)}); [0, 1, 2, 3].forEach((i) => { KIT.arm(tl, "ckD" + i, ${t(LS[6] + 0.4)} + i * 0.3, false, 0.6); flash("#ckD" + i + "-plate", ${t(LS[6] + 0.6)} + i * 0.3, 2); });
      // ===== L7 第一道，制裁筛查，比如美国财政部 OFAC 的名单，命中就拦。
      pop("#lb-ck0", ${t(LS[7] + 0.3)}); pop("#ofac", ${t(TM.ofac)});
      tl.to("#atk1, #tagNew", { x: 210, y: 20, duration: 1.2, ease: "power1.inOut" }, ${t(TM.ofac + 0.4)});
      pop("#lb-hit", ${t(TM.lan)}); bump("#ckD0", ${t(TM.lan + 0.1)}, 1.04, 2);
      // ===== L8 第二道，链上风险评分，看资金在几跳以内，是不是来自被盗资金或者混币器。
      pop("#lb-ck1", ${t(LS[8] + 0.3)}); X3.gauge(tl, "gauge", ${t(LS[8] + 1.0)}, 0.88, 1.6);
      [0, 1, 2].forEach((i) => fadeIn("#hop" + i, ${t(TM.hop)} + i * 0.45, 0.35)); pop("#stolen", ${t(TM.stolen)});
      // ===== L9 第三道，Travel Rule，服务商之间转账，要传递发起人和受益人的信息。
      pop("#lb-ck2", ${t(LS[9] + 0.3)}); X13.cover(tl, "pp", ${t(LS[9] + 1.2)}, true);
      X13.check(tl, "pp", ${t(TM.tr)}, 0, "ok"); X13.check(tl, "pp", ${t(TM.tr + 0.5)}, 1, "ok");
      fadeIn("#ppLine", ${t(TM.tr + 0.6)}, 0.4); fadeIn("#ppTok", ${t(TM.tr + 0.8)}, 0.2);
      tl.to("#ppTok", { x: ${f(TL0[0] - PP0[0])}, y: ${f(TL0[1] - PP0[1])}, duration: 1.4, ease: "power1.inOut" }, ${t(TM.tr + 1.0)}); pop("#lb-tok", ${t(TM.tr + 2.3)});
      // ===== L10 第四道，反洗钱交易监控，盯住拆分和快进快出。
      pop("#lb-ck3", ${t(LS[10] + 0.3)});
      tl.to("#smc", { x: 1627, y: -70, duration: 1.6, ease: "power1.inOut" }, ${t(LS[10] + 0.8)});
      fadeIn("#frame4", ${t(TM.split)}, 0.3); pop("#lb-split", ${t(TM.split + 0.2)});
      // ===== L11 门槛要按辖区来定。
      out("#smc, #frame4, #lb-split, #lb-tok, #ppTok", ${t(LS[11] - 0.2)}); pop("#kw11", ${t(LS[11] + 0.2)});
      // ===== L12 FATF 建议的门槛，是 1000 美元或欧元。
      out("#kw11", ${t(LS[12] - 0.1)}); grow("plate0", ${t(LS[12] + 0.2)}); pop("#ev12", ${t(LS[12] + 0.5)});
      // ===== L13 欧盟规定，服务商之间转账，不设最低门槛。
      out("#ev12", ${t(LS[13] - 0.2)}); grow("plate1", ${t(LS[13] + 0.2)}); pop("#ev13", ${t(LS[13] + 0.5)});
      // ===== L14 系统如果按 1000 欧元设计，小额转账就缺了发起人和受益人的信息。
      out("#ev13", ${t(LS[14] + 2.0)}); fadeIn("#tiny", ${t(TM.small)}, 0.2); pop("#lb-tiny", ${t(TM.small + 0.1)});
      tl.to("#tiny", { x: 400, y: -20, duration: 1.6, ease: "power1.inOut" }, ${t(TM.small + 0.4)});
      X13.check(tl, "pp", ${t(TM.miss)}, 0, ""); X13.check(tl, "pp", ${t(TM.miss)}, 1, "");
      fadeIn("#ppGap", ${t(TM.miss + 0.2)}, 0.3); pop("#lb-miss", ${t(TM.miss + 0.4)}); flash("#ppGap", ${t(TM.miss + 2.0)}, 2); bump("#pp", ${t(TM.miss + 3.2)}, 1.1, 1); bump("#lb-miss", ${t(LS[14] + 5.6)}, 1.1, 2); fadeIn("#ppLine", ${t(LS[14] + 6.4)}, 0.3);
      // ===== L15 被盗资金进入交易所，往往是冻结追回的最后机会。
      out("#lb-ck0, #lb-ck1, #lb-ck2, #lb-ck3, #lb-hit, #lb-miss, #lb-tiny, #tiny, #ppGap, #ppLine", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "freezeD", 1.6); fadeIn("#redq", ${t(LS[15] + 1.6)}, 0.3); pop("#lb-last", ${t(LS[15] + 2.0)});
      // ===== L16 Binance 事件当晚，Tether 冻结了约 9.711 亿 USDT，Circle 冻结了约 8.23 亿 USDC。
      out("#lb-last", ${t(LS[16] - 0.2)}); pop("#ev16", ${t(LS[16] + 0.4)}); pop("#lb-usdt, #lb-usdc", ${t(LS[16] + 0.6)});
      [0, 1].forEach((i) => { tl.fromTo("#lkw" + i, { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.in", immediateRender: false }, [${t(TM.usdt)}, ${t(TM.usdc)}][i] + 0.3); });
      fadeIn("#dotsU", ${t(TM.usdt + 1.2)}, 0.6); pop("#lb-dotsU", ${t(TM.usdt + 1.6)}); pop("#lb-dotsLeg", ${t(TM.usdt + 1.8)});
      fadeIn("#dotsC2", ${t(TM.usdc + 1.2)}, 0.6); pop("#lb-dotsC", ${t(TM.usdc + 1.6)});
      // ===== L17 比特币、XRP 这类原生资产，发行方没办法冻结。
      out("#ev16", ${t(LS[17] - 0.2)}); pop("#lb-btc, #lb-xrp", ${t(LS[17] + 0.2)});
      tl.to("#nat0, #nat1", { x: 36, y: 14, duration: 1.0, ease: "power1.inOut" }, ${t(LS[17] + 1.0)}); pop("#lb-native", ${t(LS[17] + 2.2)});
      // ===== L18 检查站失守，代价最后会回到交易所身上。
      out("#lb-dotsU, #lb-dotsC, #lb-dotsLeg, #lb-native, #redq, #lb-usdt, #lb-usdc, #lb-btc, #lb-xrp", ${t(LS[18] - 0.2)}); grow("bal", ${t(LS[18] + 0.4)}); pop("#lb-bal", ${t(LS[18] + 1.2)});
      // ===== L19 2023 年 11 月，Binance 认罪，支付约 43 亿美元。
      pop("#ev19", ${t(LS[19] + 0.3)}); grow("plea0", ${t(TM.plea)}); pop("#lb-plea0", ${t(TM.plea + 0.4)}); X1.tilt(tl, "bal", ${t(TM.plea + 0.5)}, 10);
      fadeIn("#dotsP", ${t(TM.plea + 1.4)}, 0.6); pop("#lb-dotsP", ${t(TM.plea + 1.8)});
      // ===== L20 2025 年，KuCoin 和 OKX，也认罪无牌汇款。
      out("#ev19", ${t(LS[20] - 0.2)}); pop("#ev20", ${t(LS[20] + 0.3)}); grow("plea1", ${t(TM.ko)}); pop("#lb-plea1", ${t(TM.ko + 0.4)}); X1.tilt(tl, "bal", ${t(TM.ko + 0.6)}, 18);
      // ===== L21 反过来，评分也会误报，没有人工复核和申诉通道，正常用户的钱就会被错冻。
      out("#ev20, #lb-bal, #lb-dotsP", ${t(LS[21] - 0.2)}); grow("userD", ${t(LS[21] + 0.2)}); grow("wdD", ${t(LS[21] + 0.5)}); fadeIn("#sealw", ${t(TM.wrong)}, 0.3);
      fadeIn("#review", ${t(TM.review)}, 0.3); KIT.stamp(tl, "seal", ${t(TM.cuo - 0.3)}); pop("#lb-wrong", ${t(TM.cuo + 0.3)});
      fadeIn("#reviewOk", ${t(LE[21] - 0.6)}, 0.3); tl.to("#seal-mark", { opacity: 0.35, filter: "grayscale(1)", duration: 0.5 }, ${t(LE[21] - 0.2)});
      // ===== L22 Tornado Cash 在 2025 年 3 月被移出制裁名单，可风险没有跟着消失。
      out("#lb-wrong, #lb-plea0, #lb-plea1", ${t(LS[22] - 0.2)});
      cam(${t(LS[22])}, "gateD", 1.6); pop("#ev22", ${t(LS[22] + 0.4)}); pop("#lb-ck0, #lb-ck1", ${t(LS[22] + 1.6)});
      fadeIn("#ofacStrike", ${t(LS[22] + 2.2)}, 0.3); tl.to("#ofac-tc", { fill: "#9a958b", duration: 0.3 }, ${t(LS[22] + 2.2)});
      bump("#gauge", ${t(TM.nolose)}, 1.06, 2); pop("#lb-gauge", ${t(TM.nolose + 0.2)});
      // ===== L23 混币器来的钱，照样要按评分和规则走一遍。
      out("#ev22, #lb-gauge", ${t(LS[23] - 0.2)}); pop("#lb-ck3", ${t(LS[23])}); fadeIn("#grayc", ${t(LS[23] + 0.1)}, 0.2);
      tl.to("#grayc", { x: 220, y: -30, duration: 1.0, ease: "power1.inOut" }, ${t(LS[23] + 0.3)}); X3.gauge(tl, "gauge", ${t(LS[23] + 1.0)}, 0.6, 0.5); X3.gauge(tl, "gauge", ${t(LS[23] + 1.5)}, 0.88, 0.5);
      fadeIn("#frame4", ${t(LS[23] + 1.6)}, 0.3); pop("#lb-again", ${t(LS[23] + 1.9)});
      out("#lb-ck0, #lb-ck1, #lb-ck3, #lb-again, #frame4, #grayc", ${t(LS[23] + 2.9)}); cam(${t(LS[23] + 3.1)}, "freezeD", 1.4);
`,
});
