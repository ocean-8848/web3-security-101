// ep23/seg4「④ 签名被驱动」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.checksA（BRIEF）。
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
// ends static on CAMS.signC
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E5, E7, E13, E15, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const RED = "#e0453a", GRN = "#1f9d55", TEAL = "#2aa3c9", INK = "#1c1c1c";

// 包层缩放（常见坑 1）：opts.hide → 外面再包一层透明 <g id=hide>
function putW(key, o, r, { hide } = {}) {
  const [gx, gy] = at(o), k = o.wrap ? o.scale : 1;
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const wrap = (svg) => { const s = k !== 1 ? `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` : svg; return hide ? S.hid(hide, s) : s; };
  put(key, o, r, 0, { wrap });
  if (k !== 1) for (const n of Object.keys(A[key] || {})) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = sc(p); }
  return A[key];
}
const ns = (o) => (o.wrap ? {} : o.scale ? { scale: o.scale } : {});   // 只给支持 scale 的物件传 scale

// ---------------------------------------------------------------- 路面
{ const R = L.ROAD, P = [[R.u0, R.v0], [8200, R.v0], [8200, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v).map(Math.round).join(","));
  add({ u: 20000, v: -9000 }, `<polygon points="${P.join(" ")}" fill="#dcd7cd" opacity="0.7"/>`); }

// ---------------------------------------------------------------- A（承接上段终点 checksA）
putW("sc", L.SCALE, E7.scale(L.SCALE, { id: "sc", scale: L.SCALE.scale, before: "150亿", after: "0.001", diff: "不等", diffOk: false }));
L.CKPT_A.forEach((o, i) => putW("cka" + i, o, O.checkpoint(o, { id: "cka" + i, n: "①②③④"[i] })));
putW("fin", L.FINALITY, E16.finalitySignal(L.FINALITY, { id: "fin", scale: L.FINALITY.scale, labels: ["最终", "安全", "未确认"] }));
L.RPC.forEach((o, i) => putW("rpc" + i, o, O.rpc(o, { id: "rpc" + i })));

// ---------------------------------------------------------------- B（L15–L16）
const HOTN = ["XRP 热钱包", "BTC 热钱包", "ETH 热钱包"];
L.HOT.forEach((o, i) => putW("h" + i, o, O.safe(o, { id: "h" + i, variant: "hot", plate: HOTN[i] })));
putW("ab", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "ab", text: "热钱包地址" }));
put("tag", L.TAG_B.o, E15.delegateTag(L.TAG_B.o, { id: "tag", ...L.TAG_B.opts, state: "attacker", target: "攻击者合约", on: false }));
put("av", L.MINIVEND, E1.miniVend(L.MINIVEND, { id: "av", kind: "attacker", scale: L.MINIVEND.scale }));
[0, 1].forEach((i) => putW("lt" + i, L.HOT[i], E1.letter(L.HOT[i], { id: "lt" + i, state: "attacker", z: 40 }), { hide: "lth" + i }));

// ---------------------------------------------------------------- C 签名间
putW("lg", L.LEDGER, O.dbLedger(L.LEDGER, { id: "lg", tag: "内部账本" }));
putW("sh", L.SHIELD, O.shield(L.SHIELD, { id: "sh" }));
putW("rk", L.RACK, O.rack(L.RACK, { id: "rk", tag: "签名服务", glow: true }));
putW("hsm", L.HSM, O.hsm(L.HSM, { id: "hsm", glow: true }));
put("ctr", L.CONTAINER, E13.container(L.CONTAINER, { id: "ctr", label: "容器", scale: L.CONTAINER.scale, seal: "red" }), 0, { grow: true });
putW("d1", L.WD_DOC, O.doc(L.WD_DOC, { id: "d1", title: "提现单", standing: true }));
putW("d2", L.WD_DOC, O.doc(L.WD_DOC, { id: "d2", title: "伪造提现单", standing: true, state: "attacker" }), { hide: "d2h" });
putW("d3", L.WD_DOC, O.doc(L.WD_DOC, { id: "d3", title: "提现指令", standing: true, state: "attacker" }), { hide: "d3h" });
putW("ltr", L.RACK, E1.letter(L.RACK, { id: "ltr", state: "attacker", z: 60 }), { hide: "ltrh" });
putW("ltk", L.RACK, E1.letter(L.RACK, { id: "ltk", state: "attacker", z: 60 }), { hide: "ltkh" });
// 工位屏幕（本地 148×88）
const scrW = (title, body, n) => `<rect width="148" height="88" fill="#1c1c1c"/><rect width="148" height="18" fill="#3b3b3b"/><text x="8" y="13" font-size="11" fill="#fff" font-weight="700">${title}</text>${body}<circle id="dk${n}-dot" cx="134" cy="9" r="6" fill="${RED}"/><path id="dk${n}-ok" opacity="0" d="M104 60 l10 10 l20 -22" stroke="${GRN}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const SCR2 = [
  scrW("Homebrew", `<text x="8" y="40" font-size="11" fill="#8fe3b0">$ brew install</text><rect x="8" y="50" width="96" height="6" fill="#555"/><rect x="8" y="62" width="70" height="6" fill="#555"/>`, 0),
  scrW("面试作业", `<rect x="8" y="30" width="110" height="7" fill="#666"/><rect x="8" y="44" width="80" height="7" fill="#666"/><text x="8" y="72" font-size="11" fill="#ffb4ab">run.sh</text>`, 1),
  scrW("工作台", `<rect x="8" y="30" width="110" height="7" fill="#666"/><rect x="8" y="44" width="80" height="7" fill="#666"/>`, 2),
];
L.DESKS.forEach((o, i) => putW("dk" + i, o, O.desk(o, { id: "dk" + i, screen2: SCR2[i] })));
L.ENGINEERS.forEach((o, i) => put("en" + i, o, O.person(o, { id: "en" + i, role: "engineer", scale: o.scale })));
put("kc", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kc", scale: L.KEYCARD.scale, color: RED, text: "部署令牌" }));
putW("kc2", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kc2", scale: L.KEYCARD.scale, color: TEAL, text: "部署令牌" }), { hide: "kc2h" });
putW("kcx", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kcx", scale: L.KEYCARD.scale, color: RED, text: "部署令牌" }), { hide: "kcxh" });
put("atk", L.ATK_C, O.person(L.ATK_C, { id: "atk", role: "attacker", scale: L.ATK_C.scale }));
const CLK = { ...S.rel(L.KEYCARD, -10, 110), scale: 0.45, wrap: true };
putW("clk", CLK, O.clock(CLK, { id: "clk" }), { hide: "clkh" });

// 原生 SVG：AI 工具小屏、Bitget 事件牌 + 点阵、三条防线牌、分隔线、令牌红虚线框
{ const [x, y] = at(L.AI_C);
  add(L.AI_C, S.hid("ai", `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}" stroke="#555" stroke-width="4"/><rect x="${x - 58}" y="${y - 62}" width="116" height="46" rx="6" fill="#1c1c1c" stroke="${RED}" stroke-width="3"/><text x="${x}" y="${y - 32}" font-size="18" fill="#fff" text-anchor="middle" font-weight="700">AI 工具</text>`)); }
{ const [x, y] = at(L.EVENT_C);
  add(L.EVENT_C, S.hid("evb", `<rect x="${x + 30}" y="${y - 40}" width="8" height="40" fill="#6b665c"/><rect x="${x + 402}" y="${y - 40}" width="8" height="40" fill="#6b665c"/>
    <rect x="${x}" y="${y - 200}" width="440" height="164" rx="10" fill="#fff" stroke="${RED}" stroke-width="3"/>
    <rect x="${x + 20}" y="${y - 116}" width="190" height="66" rx="6" fill="#d9d5cd" stroke="#8a857b" stroke-width="2"/>
    <path id="crk" opacity="0" d="M${x + 150} ${y - 116} l-14 18 l16 12 l-18 20 l12 16" stroke="${RED}" stroke-width="4" fill="none"/>
    <g id="bkc" opacity="0"><rect x="${x + 236}" y="${y - 110}" width="84" height="52" rx="6" fill="#fff" stroke="${RED}" stroke-width="3"/><rect x="${x + 236}" y="${y - 110}" width="84" height="14" rx="4" fill="${RED}"/></g>`), -400); }
{ const [x, y] = at(L.DOTS_C), d = [];
  for (let i = 0; i < 39; i++) d.push(`<circle cx="${x + 10 + (i % 13) * 20}" cy="${y + 10 + Math.floor(i / 13) * 20}" r="7" fill="${RED}"/>`);
  add(L.DOTS_C, S.hid("dotsc", d.join("") ), -400); }
const DEFT = ["独立核对", "短期 · 绑设备 · 双人", "分团队维护"];
{ const [x, y] = at(L.DEF_C);
  add(L.DEF_C, S.hid("dfp", [0, 1, 2].map((i) => `<rect x="${x + i * 180}" y="${y - 84}" width="164" height="70" rx="8" fill="#fff" stroke="${TEAL}" stroke-width="3"/><text x="${x + i * 180 + 14}" y="${y - 58}" font-size="16" fill="${TEAL}" font-weight="800">防线 ${i + 1}</text>`).join("")
), -400);
}
{ const mu = Math.round((L.SHIELD.u + L.RACK.u) / 2), mv = Math.round((L.SHIELD.v + L.RACK.v) / 2);
  const p0 = Wp(mu, mv - 150).map(Math.round), p1 = Wp(mu, mv + 150).map(Math.round);
  add({ u: mu, v: mv - 150 }, S.hid("sep", `<polygon points="${p0[0]},${p0[1]} ${p1[0]},${p1[1]} ${p1[0]},${p1[1] - 150} ${p0[0]},${p0[1] - 150}" fill="${TEAL}" opacity="0.12" stroke="${TEAL}" stroke-width="3" stroke-dasharray="10 8"/>`)); }
{ const q = A.kc; const [cx, cy] = q.center;
  add(L.KEYCARD, S.hid("kcbox", `<rect x="${cx - 36}" y="${cy - 40}" width="72" height="70" rx="6" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="8 6"/>`), 5); }

// ---------------------------------------------------------------- 世界标签
{ const [x, y] = at(L.EVENT_C), [dx, dy] = at(L.DOTS_C);
  lb("lb-evt", [x + 220, y - 150], "Bitget · 约 3.875 亿美元", "lab-rs", "c");
  lb("lb-3p", [x + 115, y - 64], "第三方安全产品", "lab-ink lab-sm", "t");
  lb("lb-cred", [x + 330, y - 84], "高权限凭证", "lab-rs lab-sm", "l");
  lb("lb-dots", [dx + 130, dy + 70], "每点约 1000 万美元", "lab-ink lab-sm", "t"); }
lb("lb-hb", A.dk0.ground, "被篡改的 Homebrew", "lab-r lab-sm", "t");
lb("lb-rk", up(A.rk.top, 12), "签名服务", "lab-cs");
lb("lb-fmt", up(A.rk.top, 12), "只看：格式 ✓", "lab-gs");
lb("lb-rest", A.rk.ground, "地址 · 金额 · 来源：不核对", "lab-ink lab-sm", "t");
lb("lb-sh", up(A.sh.top, 10), "风控引擎", "lab-cs lab-sm");
lb("lb-lg", up(A.lg.top, 10), "内部账本", "lab-cs lab-sm");
lb("lb-atx", up(A.rk.top, 12), "攻击交易", "lab-rs");
lb("lb-hsm", A.hsm.ground, "私钥：项目方称未泄露", "lab-g lab-sm", "t");
lb("lb-hsm2", A.hsm.ground, "私钥 · 没有被拿走", "lab-gs lab-sm", "t");
lb("lb-d3", up(A.d3.top, 6), "伪造提现指令", "lab-rs lab-sm");
lb("lb-6m", up(A.dk0.top, 8), "6 月", "lab-rs lab-sm");
lb("lb-done", up(A.dk0.top, 8), "已处置 · 未确认持续访问", "lab-g lab-sm");
lb("lb-9m", up(A.dk1.top, 8), "9 月", "lab-rs lab-sm");
lb("lb-1020", up(A.dk2.top, 8), "10 月 20 日", "lab-rs lab-sm");
lb("lb-kc", A.kc.ground, "部署令牌", "lab-rs lab-sm", "t");
lb("lb-1029", up(A.ctr.top, 10), "10 月 29 日 · 容器", "lab-rs lab-sm");
lb("lb-kclong", A.kc.ground, "长期 · 能直达生产", "lab-rs", "t");
lb("lb-kcok", A.kc.ground, "短期 · 绑设备", "lab-cs lab-sm", "t");
lb("lb-end1", up(A.dk0.top, 8), "终端", "lab-r");
lb("lb-end2", up(A.rk.top, 12), "生产", "lab-r");
lb("lb-atk", up(A.atk.top, 6), "攻击者", "lab-rs lab-sm");
lb("lb-en2", up(A.en2.top, 6), "第二人批准 ✓", "lab-gs lab-sm");
lb("lb-tA", up(A.sh.top, 10), "团队 A", "lab-cs lab-sm");
lb("lb-tB", up(A.rk.top, 12), "团队 B", "lab-cs lab-sm");
lb("lb-eth", up(A.h2.top, 8), "ETH 热钱包", "lab-cs lab-sm");
lb("lb-7702", A.tag.ground, "EIP-7702 委托 → 攻击者合约", "lab-rs lab-sm", "t");
lb("lb-av", up(A.av.top, 6), "攻击者合约", "lab-rs lab-sm");
lb("lb-tx", up(A.h0.top, 8), "普通签名转账", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层：曲线、卡片
const SC = (cam, p) => S.scr(cam, p);
const clampX = (p) => [Math.max(90, Math.min(1830, p[0])), Math.max(120, Math.min(880, p[1]))];
S.curve("cv-ai1", SC("devC", A.dk1.screen ?? A.dk1.top), SC("devC", up(at(L.AI_C), 40)), { color: RED });
S.curve("cv-ai0", SC("devC", up(at(L.AI_C), 40)), SC("devC", A.dk0.screen ?? A.dk0.top), { color: RED });
S.curve("cv-ai2", SC("devC", up(at(L.AI_C), 40)), SC("devC", A.dk2.screen ?? A.dk2.top), { color: RED });
S.curve("cv-atk", SC("devC", A.atk.center), SC("devC", A.dk1.screen ?? A.dk1.top), { color: RED });
S.curve("cv-ctr", SC("devC", A.ctr.top), SC("devC", A.rk.center), { color: RED });
S.curve("cv-out", SC("devC", A.rk.center), clampX(SC("devC", A.h2.top)), { color: RED });
S.curve("cv-tag", SC("delegB", A.tag.center), SC("delegB", A.av.center), { color: RED });
S.curve("cv-prod", SC("devC", A.dk0.screen ?? A.dk0.top), SC("devC", A.rk.center), { color: RED });
const CB = { x: 60, y: 600, w: 640 };
const cardB = codeCard("cb", { ...CB, head: "签名前核对", tag: "示意", rows: [
  { html: "请求来源 · 风控引擎签发", chip: "✓", chipCls: "ok" },
  { html: "目标地址 = 账本提现单", chip: "✓", chipCls: "ok" },
  { html: "金额 = 账本提现单", chip: "✓", chipCls: "ok" },
  { html: "交易类型 · 含 EIP-7702 授权", chip: "✓", chipCls: "ok" }] });
[1, 2].forEach((i) => S.curve("cv-cb" + i, [CB.x + CB.w + 4, codeRowY(CB.y, i)], SC("signC", A.lg.top), { color: RED }));
const ET = ZONE.event.top;
const html = cardB
  + evt("ev-bg", `<b>Bitget · 2026 年 9 月</b> · 约 3.875 亿美元`, { color: RED })
  + evt("ev-bgs", `来源：BleepingComputer · Cointelegraph`, { color: "#8a857b", top: ET + 92 })
  + evt("ev-bn", `<b>Binance · 2026 年</b>`, { color: RED, top: ET + 2 })
  + evt("ev-bns", `来源：Binance 初步报告`, { color: "#8a857b", top: ET + 94 })
  + ck("ck-hot", "去往热钱包", { x: 90, y: 300, w: 420, kind: "r", icon: "→" })
  + ck("ck-cold", "冷热隔离 · 没失守", { x: 1330, y: 300, w: 470, kind: "g" })
  + ck("ck-key", "私钥保护 · 没失守", { x: 1330, y: 370, w: 470, kind: "g" })
  + kw("kw-drv", `签名流程 <b>被驱动</b>${gtag("解读")}`, { x: 700, y: 130, size: 38, accent: RED })
  + [0, 1, 2].map((i) => ck("dft" + i, `防线 ${i + 1} · ${DEFT[i]}`, { x: 1230, y: 560 + i * 72, w: 600, kind: "c" })).join("")
  + ck("ck-r1", "Bitget · 尚无最终第三方调查报告", { x: 1150, y: 300, w: 680, kind: "n", icon: "…" })
  + ck("ck-r2", "Binance · 尚无最终第三方调查报告", { x: 1150, y: 372, w: 680, kind: "n", icon: "…" });
const css = "#ev-bgs{font-size:30px}";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);
// 飞行位移（世界画布 px）
const dxy = (a, b) => [Math.round(b[0] - a[0]), Math.round(b[1] - a[1])];
const MV = {
  d1: dxy(A.d1.ground, A.rk.ground), d2a: dxy(A.d2.ground, A.sh.ground), d2b: dxy(A.d2.ground, A.rk.ground),
  d3a: dxy(A.d3.ground, A.lg.ground), d3b: dxy(A.d3.ground, A.rk.ground),
  ltr: [-260, 120], ltk: [-420, 180], kcx: dxy(A.kcx.center, A.ctr.door ?? A.ctr.center), lt: [520, -240],
};

S.build({
  cam0: "checksA", sub: "没有私钥，也能签出去",
  grid: { u0: -1300, u1: 8200, v0: -4700, v1: 4800 }, box: [-600, -2800, 7000, 3600],   // 盖住上段终点 checksA + signC / devC / delegB / hotB
  shown: [], css, html,
  terms: [
    { id: "t0", t: "零日漏洞", d: "厂商还没修补就被利用的漏洞", at: w("零日漏洞", 4) },
    { id: "t1", t: "部署令牌", d: "让程序能发布到生产环境的凭证", at: w("部署令牌", 12) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#rk-glow, #hsm-glow", { opacity: 0 }, 0);
      // ===== L0 镜头右移到 C，签名服务地光
      cam(${t(LS[0])}, "signC", 1.8, "power2.inOut"); fadeIn("#rk-glow", ${t(LS[0] + 1.6)}, 0.5); pop("#lb-rk", ${t(LS[0] + 1.8)}); pop("#lb-sh, #lb-lg", ${t(LS[0] + 2.2)});
      // ===== L1 提现单递进签名服务，只看格式
      X5.fly(tl, "d1", ${t(LS[1] + 0.1)}, ${MV.d1[0]}, ${MV.d1[1]}, 1.0, 40); out("#d1", ${t(LS[1] + 1.1)}, 0.2);
      out("#lb-rk", ${t(LS[1] + 1.0)}); pop("#lb-fmt", ${t(LS[1] + 1.2)}); pop("#lb-rest", ${t(LS[1] + 1.5)});
      // ===== L2 伪造上游，红单绕过盾牌，签出攻击交易
      out("#lb-fmt, #lb-rest", ${t(LS[2] - 0.2)}); fadeIn("#d2h", ${t(LS[2] + 0.1)}, 0.3);
      X5.fly(tl, "d2", ${t(LS[2] + 0.5)}, ${MV.d2a[0]}, ${MV.d2a[1] + 60}, 0.9, 30);
      X5.fly(tl, "d2", ${t(LS[2] + 1.5)}, ${MV.d2b[0]}, ${MV.d2b[1]}, 0.9, 60); out("#d2h", ${t(LS[2] + 2.4)}, 0.2);
      bump("#rk", ${t(LS[2] + 2.5)}, 1.04, 1); fadeIn("#ltrh", ${t(LS[2] + 2.7)}, 0.2);
      X5.fly(tl, "ltr", ${t(LS[2] + 2.8)}, ${MV.ltr[0]}, ${MV.ltr[1]}, 0.9, 30); pop("#lb-atx", ${t(LS[2] + 3.0)});
      // ===== L3 Bitget 事件牌 + 39 点
      out("#lb-atx, #ltrh", ${t(LS[3] - 0.2)}); fadeIn("#evb", ${t(LS[3] + 0.2)}, 0.4); pop("#ev-bg", ${t(LS[3] + 0.4)}); pop("#lb-evt", ${t(LS[3] + 0.6)});
      fadeIn("#dotsc", ${t(LS[3] + 1.2)}, 0.8); pop("#lb-dots", ${t(LS[3] + 1.8)}); pop("#ev-bgs", ${t(LS[3] + 2.0)});
      // ===== L4 第三方安全产品裂开，凭证弹出
      pop("#lb-3p", ${t(LS[4] + 0.8)}); fadeIn("#crk", ${t(LS[4] + 1.6)}, 0.3); flash("#crk", ${t(LS[4] + 1.9)}, 2); pop("#bkc", ${t(LS[4] + 3.2)}, 0.3); pop("#lb-cred", ${t(LS[4] + 3.4)});
      // ===== L5 伪造提现指令滑过账本之后进签名服务
      fadeIn("#d3h", ${t(LS[5] + 0.1)}, 0.3); pop("#lb-d3", ${t(LS[5] + 0.3)});
      X5.fly(tl, "d3", ${t(LS[5] + 0.6)}, ${MV.d3a[0]}, ${MV.d3a[1] - 40}, 0.9, 20);
      out("#lb-d3", ${t(LS[5] + 1.4)}); X5.fly(tl, "d3", ${t(LS[5] + 1.6)}, ${MV.d3b[0]}, ${MV.d3b[1]}, 1.0, 40); out("#d3h", ${t(LS[5] + 2.7)}, 0.2);
      // ===== L6 私钥：项目方称未泄露
      fadeIn("#hsm-glow", ${t(LS[6] + 0.2)}, 0.4); pop("#lb-hsm", ${t(LS[6] + 0.4)});
      // ===== L7 Binance：镜头到 devC，工位亮
      out("#ev-bg, #ev-bgs, #lb-hsm, #lb-sh, #lb-lg, #evb, #dotsc, #crk, #bkc, #lb-evt, #lb-3p, #lb-cred, #lb-dots", ${t(LS[7] - 0.2)}); cam(${t(LS[7])}, "devC", 1.4);
      pop("#ev-bn", ${t(LS[7] + 1.2)}); pop("#ev-bns", ${t(LS[7] + 1.8)}); pop("#lb-atk", ${t(LS[7] + 2.2)});
      // ===== L8 工位 1：Homebrew，红点，6 月
      fadeIn("#dk0-scr2", ${t(LS[8] + 0.6)}, 0.3); pop("#lb-6m", ${t(LS[8] + 0.6)}); flash("#dk0-dot", ${t(LS[8] + 1.0)}, 2); pop("#lb-hb", ${t(LS[8] + 2.4)});
      // ===== L9 已处置：红点变灰、绿勾
      tl.to("#dk0-dot", { attr: { fill: "#9a958b" }, duration: 0.3 }, ${t(LS[9] + 0.4)}); fadeIn("#dk0-ok", ${t(LS[9] + 0.6)}, 0.3);
      out("#lb-6m, #lb-hb", ${t(LS[9] + 0.4)}); pop("#lb-done", ${t(LS[9] + 0.6)});
      // ===== L10 工位 2：假面试作业
      out("#lb-done", ${t(LS[10] - 0.2)}); fadeIn("#dk1-scr2", ${t(LS[10] + 0.4)}, 0.3); pop("#lb-9m", ${t(LS[10] + 0.5)});
      draw("cv-atk", ${t(LS[10] + 1.6)}); flash("#dk1-dot", ${t(LS[10] + 1.2)}, 2);
      // ===== L11 经 AI 工具控制另外两台
      out("#lb-9m", ${t(LS[11] - 0.1)}); pop("#lb-1020", ${t(LS[11] + 0.2)}); fadeIn("#ai", ${t(LS[11] + 1.6)}, 0.3);
      draw("cv-ai1", ${t(LS[11] + 2.0)}); draw("cv-ai0", ${t(LS[11] + 3.0)}); draw("cv-ai2", ${t(LS[11] + 3.3)}); fadeIn("#dk2-scr2", ${t(LS[11] + 3.6)}, 0.3);
      // ===== L12 部署令牌亮红
      out("#lb-1020", ${t(LS[12] - 0.2)}); bump("#kc", ${t(LS[12] + 0.6)}, 1.25, 2); pop("#lb-kc", ${t(LS[12] + 0.6)});
      // ===== L13 容器落到签名服务旁，门打开
      out("#cv-ai0, #cv-ai1, #cv-ai2, #cv-atk", ${t(LS[13] - 0.2)}); grow("ctr", ${t(LS[13] + 0.6)}); pop("#lb-1029", ${t(LS[13] + 0.9)});
      X13.door(tl, "ctr", ${t(LS[13] + 1.6)}, true);
      // ===== L14 关键画面：令牌插进容器 → 签名服务 → 红色交易飞向热钱包；HSM 保持绿
      out("#lb-kc", ${t(LS[14] - 0.2)}); fadeIn("#kcxh", ${t(LS[14])}, 0.2); X5.fly(tl, "kcx", ${t(LS[14] + 0.2)}, ${MV.kcx[0]}, ${MV.kcx[1]}, 1.0, 60);
      out("#kcxh", ${t(LS[14] + 1.3)}, 0.2); X13.inside(tl, "ctr", ${t(LS[14] + 1.2)}, true, true);
      draw("cv-ctr", ${t(LS[14] + 1.4)}); KIT.led(tl, "rk-led-0", ${t(LS[14] + 1.9)}, "red"); KIT.led(tl, "rk-led-1", ${t(LS[14] + 2.0)}, "red"); KIT.led(tl, "rk-led-2", ${t(LS[14] + 2.1)}, "red");
      fadeIn("#ltkh", ${t(LS[14] + 2.2)}, 0.2); X5.fly(tl, "ltk", ${t(LS[14] + 2.3)}, ${MV.ltk[0]}, ${MV.ltk[1]}, 1.0, 40);
      draw("cv-out", ${t(LS[14] + 2.4)}); pop("#ck-hot", ${t(LS[14] + 2.6)}); pop("#lb-hsm2", ${t(LS[14] + 2.8)});
      // ===== L15 镜头左移到 delegB，委托挂牌挂上
      out("#ev-bn, #ev-bns, #lb-1029, #lb-atk, #cv-ctr, #cv-out, #ck-hot, #lb-hsm2, #ltkh", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "delegB", 1.8, "power2.inOut"); pop("#lb-eth", ${t(LS[15] + 1.9)});
      X15.tagDrop(tl, "tag", ${t(LS[15] + 2.4)}); pop("#lb-7702", ${t(LS[15] + 3.0)});
      pop("#lb-av", ${t(LS[15] + 4.2)}); draw("cv-tag", ${t(LS[15] + 4.4)});
      // ===== L16 其他链：XRP / BTC 热钱包飞出红信封
      out("#lb-eth, #lb-7702, #lb-av, #cv-tag", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "hotB", 1.0);
      fadeIn("#lth0, #lth1", ${t(LS[16] + 0.9)}, 0.2); pop("#lb-tx", ${t(LS[16] + 1.0)});
      X5.fly(tl, "lt0", ${t(LS[16] + 1.0)}, ${MV.lt[0]}, ${MV.lt[1]}, 1.4, 50); X5.fly(tl, "lt1", ${t(LS[16] + 1.2)}, ${MV.lt[0]}, ${MV.lt[1]}, 1.4, 50);
      out("#lth0, #lth1", ${t(LS[16] + 2.4)}, 0.3);
      // ===== L17 回到 devC：长期部署令牌加红虚线框
      out("#lb-tx", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "devC", 1.6, "power2.inOut");
      fadeIn("#kcbox", ${t(LS[17] + 1.8)}, 0.3); pop("#lb-kclong", ${t(LS[17] + 2.0)}); bump("#kc", ${t(LS[17] + 2.0)}, 1.2, 1);
      // ===== L18 终端失陷 → 生产失陷
      pop("#lb-end1", ${t(LS[18] + 0.3)}); draw("cv-prod", ${t(LS[18] + 0.6)}); pop("#lb-end2", ${t(LS[18] + 1.6)});
      // ===== L19 冷热隔离 / 私钥都没失守，签名流程被驱动（解读）
      out("#lb-end1, #lb-end2, #cv-prod", ${t(LS[19] - 0.1)}); pop("#lb-hsm2", ${t(LS[19] + 0.4)});
      pop("#kw-drv", ${t(LS[19] + 0.4)}); pop("#ck-cold", ${t(LS[19] + 2.0)}); pop("#ck-key", ${t(LS[19] + 2.6)});
      // ===== L20 镜头到 signC，三块空牌
      out("#kw-drv, #ck-cold, #ck-key, #lb-hsm2, #lb-kclong, #kcbox", ${t(LS[20] - 0.2)});
      cam(${t(LS[20])}, "signC", 1.2); fadeIn("#dfp", ${t(LS[20] + 0.6)}, 0.4);
      // ===== L21 代码卡 B：目标地址、金额对上账本
      pop("#cb", ${t(LS[21] + 0.2)}); pop("#lb-lg", ${t(LS[21] + 0.4)}); [0, 1, 2, 3].forEach((i) => pop("#cb-c" + i, ${t(LS[21] + 2.6)} + i * 0.35, 0.2));
      draw("cv-cb1", ${t(LS[21] + 1.4)}); draw("cv-cb2", ${t(LS[21] + 1.8)}); pop("#dft0", ${t(LS[21] + 1.0)}, 0.3);
      // ===== L22 镜头拉到 C 全景：令牌变青蓝 + 时钟 + 第二人批准
      out("#cb, #cv-cb1, #cv-cb2, #lb-lg", ${t(LS[22] - 0.2)}); cam(${t(LS[22])}, "C", 1.0);
      fadeIn("#kc2h", ${t(LS[22] + 1.2)}, 0.4); out("#kc", ${t(LS[22] + 1.2)}, 0.4); pop("#lb-kcok", ${t(LS[22] + 1.4)});
      fadeIn("#clkh", ${t(LS[22] + 2.0)}, 0.3); bump("#en2", ${t(LS[22] + 2.8)}, 1.1, 2); pop("#lb-en2", ${t(LS[22] + 2.8)}); pop("#dft1", ${t(LS[22] + 1.4)}, 0.3);
      // ===== L23 回到 signC：风控 / 签名之间立分隔，两个团队
      out("#lb-kcok, #lb-en2", ${t(LS[23] - 0.2)}); cam(${t(LS[23])}, "signC", 1.0);
      fadeIn("#sep", ${t(LS[23] + 1.0)}, 0.4); pop("#lb-tA", ${t(LS[23] + 1.4)}); pop("#lb-tB", ${t(LS[23] + 1.6)}); pop("#dft2", ${t(LS[23] + 1.8)}, 0.3);
      // ===== L24 两起事件都没有最终第三方报告（静止于 signC）
      pop("#ck-r1", ${t(LS[24] + 0.3)}); pop("#ck-r2", ${t(LS[24] + 0.8)});
`,
});
