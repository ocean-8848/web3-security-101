// ep23/seg6「⑥ 撤销委托」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.freezeD（BRIEF）。
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E15 from "../../../ep15/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

const R = L.world.rects, ZA = L.ZONE_ANCHOR;
// zone-local canvas px → world ground point / canvas px
const zp = (Z, X, Y, extra = {}) => { const q = L.world && null; const [ax, ay] = ZA[Z]; const g = at0(ax + X, ay + Y); return { ...g, ...extra }; };
import { G } from "../../../kit/iso.mjs";
function at0(X, Y) { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v) }; }
const zpx = (Z, X, Y) => [ZA[Z][0] + X, ZA[Z][1] + Y];

const REVOKE_DOC = zp("B", -320, 480, { scale: 0.5 });
const MINI_CHAIN = zp("B", 900, 430, { scale: 0.35 });
const PIPE_O = zp("B", 560, 100);
const RED_COIN = zp("D", -1060, 120, { scale: 0.5 });
const segCams = {
  ...L.CAMS,
  // B 区特写：时钟 + ETH 热钱包 + 地址立柱 + 委托挂牌 + 攻击者合约（L4–L6），右侧留给卡片
  delegClk: L.fit([R.clock, R.hot[2], R.knife[2], R.toll, R.addrB, R.vend], [200, 300, 1360, 860], 1.6),
  // B 区：温钱包 + 水位 + 三只热钱包 + 三个闸刀 + 撤销流程文件（L7–L9），右侧留给三块牌
  fixB: L.fit([R.warm, R.meter, ...R.hot, ...R.knife, R.toll, L.rect(REVOKE_DOC, "docStanding")], [100, 300, 1360, 860], 1.4),
  // C 区：账本 → 风控 → 签名服务（L10），左侧留给代码卡、右侧留给三块牌
  signC2: L.fit([R.ledger, R.shield, R.rack, R.hsm, R.wdC], [700, 300, 1360, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: segCams, ext: [E1, E2, E3, E5, E7, E15] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// wrap helper (SEGBASE 常见坑 1): scale around the ground point and rescale anchors
const wrapAt = (o, k) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const W = (key, o, r, k = o.scale, dy = 0) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { wrap: wrapAt(o, k) });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const sign = (key, o, text) => put(key, o, E1.signBoard(o, { id: key, style: "plate", text }));

// road (drawn under everything)
{
  const { u0, u1, v0, v1 } = L.ROAD, P = [Wp(u0, v0), Wp(u1, v0), Wp(u1, v1), Wp(u0, v1)];
  add({ u: u0, v: -100000 }, `<polygon points="${P.map((p) => p.map((x) => f(x)).join(",")).join(" ")}" fill="#d9d6cf" stroke="#c9c4b9" stroke-width="2"/>`);
}

// A 入境口 · 充值（全景里看得到）
sign("signA", L.SIGN_A, "入境口 · 充值");
W("chainA", L.CHAIN, O.chain(L.CHAIN, { id: "chainA", n: 4 }));
L.ADDR_A.forEach((q, i) => W(`addrA${i}`, q, E2.addrPlate(q, { id: `addrA${i}`, text: `充值地址 ${i + 1}` })));
L.CKPT_A.forEach((q, i) => W(`ckA${i}`, q, O.checkpoint(q, { id: `ckA${i}`, n: "①②③④"[i] })));

// B 金库区
sign("signB", L.SIGN_B, "金库 · 冷钱包");
put("cold", L.COLD, O.safe(L.COLD, { id: "cold", plate: "冷钱包", gold: true }));
W("warm", L.WARM, O.safe(L.WARM, { id: "warm", plate: "温钱包" }));
W("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 5, th: 3, level: 2, thText: "上限" }));
["XRP", "BTC", "ETH"].forEach((n, i) => W(`hot${i}`, L.HOT[i], O.safe(L.HOT[i], { id: `hot${i}`, variant: "hot", plate: `${n} 热钱包` })));
L.KNIFE.forEach((q, i) => W(`kn${i}`, q, O.knifeSwitch(q, { id: `kn${i}`, text: "分链熔断" })));
put("pipeB", PIPE_O, E1.pipe(PIPE_O, { id: "pipeB", pts: [[-160, 0, 40], [200, 0, 40]] }), -2);
put("toll", L.TOLL, E7.tollClip(L.TOLL, { id: "toll", scale: 0.8, z: 40, axis: "u" }), 2);
put("addrB", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "addrB", text: "热钱包地址" }));
put("tag", L.TAG_B.o, E15.delegateTag(L.TAG_B.o, { id: "tag", ...L.TAG_B.opts, state: "attacker", target: "攻击者合约" }));
put("vend", L.MINIVEND, E1.miniVend(L.MINIVEND, { id: "vend", kind: "attacker", scale: 0.6, label: "攻击者合约" }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("clk", L.CLOCK, O.clock(L.CLOCK, { id: "clk", h: 20, m: 20 }));
// L8 撤销流程文件（长出）
W("rvk", REVOKE_DOC, O.doc(REVOKE_DOC, { id: "rvk", title: "撤销流程", standing: true }));
// L2 链上剪影（隐藏）
{
  const k = MINI_CHAIN.scale, r = O.chain(MINI_CHAIN, { id: "mch", n: 3 });
  add(MINI_CHAIN, S.hid("mchg", wrapAt(MINI_CHAIN, k)(r.svg)), 4);
}
// L3 新转入的币（隐藏），放在门牌处
{
  const cO = { u: L.ADDR_B.u, v: L.ADDR_B.v + 30 }, r = E7.oddCoin(cO, { id: "nc", scale: 0.5, kind: "plain" });
  const [px, py] = A.addrB.plate, [cx, cy] = r.anchors.face ?? r.anchors.center;
  add(cO, S.hid("ncg", `<g id="ncm"><g transform="translate(${f(px - cx)},${f(py - cy - 10)})">${r.svg}</g></g>`), 400);
}

// C 签名间
sign("signC", L.SIGN_C, "登机口 · 提币");
W("ldg", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ldg", tag: "内部账本" }));
W("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }));
W("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "签名服务" }));
W("hsm", L.HSM, O.hsm(L.HSM, { id: "hsm" }));
W("wdC", L.WD_DOC, O.doc(L.WD_DOC, { id: "wdC", title: "提现单", standing: true }));
L.DESKS.forEach((q, i) => W(`desk${i}`, q, O.desk(q, { id: `desk${i}` })));
L.ENGINEERS.forEach((q, i) => put(`eng${i}`, q, O.person(q, { id: `eng${i}`, role: "engineer", scale: q.scale })));

// D 合规检查站（上一段终点 freezeD 的物件）
sign("signD", L.SIGN_D, "安检 · 边检");
L.CKPT_D.forEach((q, i) => W(`ckD${i}`, q, O.checkpoint(q, { id: `ckD${i}`, n: "①②③④"[i] })));
put("redc", RED_COIN, E7.oddCoin(RED_COIN, { id: "redc", scale: 0.5, state: "attacker" }));
["USDT", "USDC"].forEach((n, i) => put(`coin${i}`, L.COINS_D[i], E7.oddCoin(L.COINS_D[i], { id: `coin${i}`, scale: 0.6 })));
["Tether 冻结", "Circle 冻结"].forEach((n, i) => W(`lock${i}`, L.LOCKS_D[i], O.padlock(L.LOCKS_D[i], { id: `lock${i}` }), 0.6, 6));
L.NATIVE_D.forEach((q, i) => put(`nat${i}`, q, E7.oddCoin(q, { id: `nat${i}`, scale: 0.6 })));
W("bal", L.BALANCE, E1.balance(L.BALANCE, { id: "bal", tilt: 6 }));
L.PLEA_D.forEach((q, i) => W(`plea${i}`, q, O.doc(q, { id: `plea${i}`, title: "认罪协议", standing: true })));
put("userD", L.USER_D, O.person(L.USER_D, { id: "userD", role: "signer", scale: 0.5 }));
W("wdD", L.WD_D, O.doc(L.WD_D, { id: "wdD", title: "提现单", standing: true }));
W("seal", L.SEAL, O.seal(L.SEAL, { id: "seal", markText: "冻结", stamped: true }));
// dot matrices (each dot = 1000 万枚 / 1 亿美元)
const dots = (P, n, cols, sp, fill, r = 4.5) => { let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${f(P[0] + (i % cols) * sp)}" cy="${f(P[1] + Math.floor(i / cols) * sp)}" r="${r}" fill="${fill}"/>`; return s; };
{
  const P = at(L.DOTS_FRZ), Q = at(L.DOTS_PLEA);
  add(L.DOTS_FRZ, `<g id="dfz">${dots(P, 97, 20, 14, "#2aa3c9")}${dots([P[0], P[1] + 80], 82, 20, 14, "#2aa3c9")}</g>`);
  add(L.DOTS_PLEA, `<g id="dpl">${dots(Q, 43, 11, 20, "#e0453a", 6)}</g>`);
}

// E 用户柜台
sign("signE", L.SIGN_E, "用户柜台");
put("userE", L.USER_E, O.person(L.USER_E, { id: "userE", role: "signer", scale: 0.55 }));
const okScr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><circle cx="38" cy="50" r="22" fill="#1f9d55"/><path d="M27 50l8 8 14-16" stroke="#fff" stroke-width="5" fill="none"/><circle cx="38" cy="108" r="22" fill="#1f9d55"/><path d="M27 108l8 8 14-16" stroke="#fff" stroke-width="5" fill="none"/>`;
const appScr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="26" fill="#1d93ba"/><rect x="8" y="40" width="60" height="9" rx="3" fill="#cfe9f2"/><rect x="8" y="58" width="60" height="9" rx="3" fill="#cfe9f2"/><rect x="8" y="76" width="44" height="9" rx="3" fill="#cfe9f2"/><rect x="8" y="110" width="60" height="26" rx="7" fill="#1f9d55"/>`;
W("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen2: `<g id="ph-ok">${okScr}</g><g id="ph-app" opacity="0">${appScr}</g>` }));
W("man", L.MANUAL, E3.manual(L.MANUAL, { id: "man", title: "地址簿", sub: "", pageTitle: "地址簿" }));
W("tlk", L.TIMELOCK, E1.timeLock(L.TIMELOCK, { id: "tlk", frac: 1 }));
W("wl", L.WL_DOC, O.doc(L.WL_DOC, { id: "wl", title: "提币白名单", standing: true }));

// ---------------------------------------------------------------- native lines (hidden, world)
const P = (p) => `${f(p[0])} ${f(p[1])}`;
const tagC = A.tag.text ?? A.tag.center;
{
  // L2 委托挂牌外框 + 连到链上剪影
  const [tx, ty] = tagC;
  add(L.ADDR_B, S.hid("tagbox", `<rect x="${f(tx - 40)}" y="${f(ty - 48)}" width="80" height="96" rx="6" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="9 6"/>`
    + `<path d="M${P([tx, ty + 48])} L${P(up(A.mch?.top ?? at(MINI_CHAIN), 0))}" stroke="#e0453a" stroke-width="3" stroke-dasharray="9 6" fill="none"/>`), 500);
  // 链下 / 链上 分隔线
  const d0 = zpx("B", 640, -170), d1 = zpx("B", 640, 470);
  add(L.ADDR_B, S.hid("divl", `<path d="M${P(d0)} L${P(d1)}" stroke="#8a8478" stroke-width="3" stroke-dasharray="12 8" fill="none"/>`), 500);
  // L3 门牌 → 攻击者合约 红线
  add(L.ADDR_B, S.hid("lnv", `<path d="M${P(A.addrB.plate)} Q${P([A.addrB.plate[0] + 60, A.vend.top[1] - 40])} ${P(A.vend.top)}" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="10 7" fill="none"/>`), 500);
  // L15 C 区 账本 → 签名服务 绿线
  add(L.RACK, S.hid("lnc", `<path d="M${P(A.ldg.top)} Q${P([(A.ldg.top[0] + A.rack.top[0]) / 2, Math.min(A.ldg.top[1], A.rack.top[1]) - 80])} ${P(A.rack.top)}" stroke="#1f9d55" stroke-width="6" stroke-dasharray="14 8" fill="none"/>`), 600);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-chainup", [at(MINI_CHAIN)[0] + 70, at(MINI_CHAIN)[1] + 10], "链上", "lab-r", "l");
lb("lb-offch", zpx("B", 600, -180), "链下", "lab-ink", "r");
lb("lb-onch", zpx("B", 680, -180), "链上", "lab-r", "l");
lb("lb-t0", up(A.clk.top, 6), "20:20 UTC", "lab-ink");
lb("lb-t1", up(A.clk.top, 6), "00:10 UTC", "lab-r");
lb("lb-clr", [tagC[0] + 50, tagC[1]], "已清零", "lab-ink", "l");
lb("lb-live", up(A.addrB.top, 10), "存活 约 3 小时 50 分", "lab-rs");
lb("lb-rvk", up(A.rvk.top, 6), "撤销流程 · 演练", "lab-gs lab-sm");
lb("lb-mtr", up(A.mtr.top, 6), "余额上限", "lab-g lab-sm");
lb("lb-ph", [A.ph.top[0] + 60, A.ph.top[1] + 40], "合约地址 ✓ · 网络 ✓", "lab-gs", "l");
lb("lb-ph2", [A.ph.top[0] - 70, A.ph.top[1] + 40], "补充资料 · 只在官方 App", "lab-cs", "r");
lb("lb-mail", [A.ph.top[0] - 70, A.ph.top[1] + 120], `<span style="text-decoration:line-through;color:#8a8478">✉ 陌生邮件链接</span>`, "lab-ink lab-sm", "r");
lb("lb-wl", up(A.wl.top, 6), "提币白名单", "lab-gs");
lb("lb-tlk", up(A.tlk.top, 6), "新地址冷却期", "lab-cs");
lb("lb-man", [A.man.top[0], A.man.top[1] + 70], "地址簿", "lab-cs", "t");
lb("lb-userE", up(A.userE.top, 6), "用户", "lab-ink");
lb("lb-real", [(A.ldg.top[0] + A.rack.top[0]) / 2, Math.min(A.ldg.top[1], A.rack.top[1]) - 90], "只为真实订单签名", "lab-gs");
lb("lb-stop", up(A.redc.top, 10), "拦住赃款", "lab-rs");
lb("lb-pass", up(A.userD.top, 10), "不误伤普通人", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const html = `<div class="sb-kw hide" id="qcard" style="left:1400px;top:300px;width:460px;white-space:normal;font-size:34px;line-height:1.35">提现已停 · 服务已关<br>新进的钱安全吗？<div id="qno" class="hide" style="color:#e0453a;font-size:56px;margin-top:6px">不安全</div></div>`
  + evt("src-bn", `<b>Binance 初步报告</b>`)
  + ck("ck-pause", "暂停提现", { x: 1400, y: 560, w: 440, kind: "g" })
  + ck("ck-rvk", "撤销权限", { x: 1400, y: 650, w: 440, kind: "r" })
  + ck("pl1", `<span id="pl1-t" class="hide">撤销流程 · 含链上授权</span>`, { x: 1380, y: 300, w: 480, kind: "g", icon: "1" })
  + ck("pl2", `<span id="pl2-t" class="hide">余额上限 · 分链熔断</span>`, { x: 1380, y: 400, w: 480, kind: "g", icon: "2" })
  + ck("pl3", `<span id="pl3-t" class="hide">策略覆盖 EIP-7702</span>`, { x: 1380, y: 500, w: 480, kind: "g", icon: "3" })
  + codeCard("cb", { x: 60, y: 300, w: 620, head: "签名前核对", tag: "示意", rows: [
    { html: "请求来源 · 风控引擎签发", chip: "✓", chipCls: "ok" },
    { html: "目标地址 = 账本提现单", chip: "✓", chipCls: "ok" },
    { html: "金额 = 账本提现单", chip: "✓", chipCls: "ok" },
    { html: "交易类型 · 含 EIP-7702 授权", chip: "✓", chipCls: "ok" }] })
  + `<div class="hide" id="interp" style="position:absolute;left:1560px;top:200px">${gtag("解读")}</div>`;
const css = `#pl1, #pl2, #pl3 { font-size: 28px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = { clr: w("清零", 4) };
const t = (x) => f(x);

S.build({
  cam0: "freezeD", sub: "暂停提现，不等于撤销权限",
  grid: { u0: -3700, u1: 15400, v0: -9900, v1: 9600 }, box: [-2000, -5500, 13300, 7500],   // 盖住上段终点 freezeD + delegB / hotB / signC / userE / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "冷却期", d: "新地址加入后要等一段时间才能提币", at: w("冷却期", 13) },
  ],
  end: { title: "托管、充提与合规安全", line: "保管者只为真实订单签名，检查站拦住赃款也不误伤", next: "数据与隐私安全", at: LS[16], nextAt: w("下一集", 16) },
  js: `
      // ===== L0 回到开头的题：D → B 左移，题卡
      cam(${t(LS[0])}, "delegB", 2.0); pop("#qcard", ${t(LS[0] + 1.2)}, 0.35);
      // ===== L1 不安全
      pop("#qno", ${t(LS[1] + 0.3)}, 0.3);
      // ===== L2 委托写在链上，独立于链下
      fadeIn("#tagbox", ${t(LS[2] + 0.3)}, 0.3); fadeIn("#mchg", ${t(LS[2] + 0.8)}, 0.3); pop("#lb-chainup", ${t(LS[2] + 1.0)});
      fadeIn("#divl", ${t(LS[2] + 2.2)}, 0.3); pop("#lb-offch", ${t(LS[2] + 2.4)}); pop("#lb-onch", ${t(LS[2] + 2.6)});
      // ===== L3 新转入的币 → 门牌 → 攻击者合约
      out("#lb-chainup, #lb-offch, #lb-onch", ${t(LS[3] - 0.2)});
      tl.set("#ncg", { opacity: 1 }, ${t(LS[3] + 0.3)}); tl.fromTo("#ncm", { x: -320, y: -120 }, { x: 0, y: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, ${t(LS[3] + 0.3)});
      fadeIn("#lnv", ${t(LS[3] + 1.4)}, 0.3);
      tl.to("#ncm", { x: ${f(A.vend.top[0] - A.addrB.plate[0])}, y: ${f(A.vend.top[1] - A.addrB.plate[1])}, duration: 1.0, ease: "power1.inOut" }, ${t(LS[3] + 2.0)});
      out("#ncg", ${t(LS[3] + 3.0)}, 0.3); bump("#vend", ${t(LS[3] + 3.0)}, 1.06, 1);
      // ===== L4 10 月 30 日 00:10 才清零（关键画面前半）
      out("#qcard, #lnv, #divl, #mchg", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "delegClk", 1.2); pop("#src-bn", ${t(LS[4] + 0.4)}); pop("#lb-t0", ${t(LS[4] + 0.8)});
      KIT.clock(tl, "clk", ${t(LS[4] + 1.4)}, 2.6, 230); out("#lb-t0", ${t(LS[4] + 3.9)}); pop("#lb-t1", ${t(LS[4] + 4.0)});
      X15.tagState(tl, "tag", ${t(TM.clr)}, "cleared"); out("#tagbox", ${t(TM.clr)}); pop("#lb-clr", ${t(TM.clr + 0.3)});
      // ===== L5 存活约 3 小时 50 分（关键画面后半）
      pop("#lb-live", ${t(LS[5] + 0.4)}, 0.35);
      // ===== L6 暂停提现 ≠ 撤销权限
      out("#src-bn", ${t(LS[6] - 0.2)}); pop("#ck-pause", ${t(LS[6] + 0.2)}); pop("#ck-rvk", ${t(LS[6] + 1.2)});
      // ===== L7 交易所三件事：三块牌
      out("#ck-pause, #ck-rvk, #lb-t1, #lb-clr, #lb-live", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "fixB", 1.4); pop("#pl1", ${t(LS[7] + 0.5)}); pop("#pl2", ${t(LS[7] + 0.7)}); pop("#pl3", ${t(LS[7] + 0.9)});
      // ===== L8 撤销流程 + 演练
      fadeIn("#pl1-t", ${t(LS[8] + 0.3)}, 0.3); grow("rvk", ${t(LS[8] + 0.6)}); pop("#lb-rvk", ${t(LS[8] + 1.1)});
      // ===== L9 余额上限 + 分链熔断
      X5.fill(tl, "mtr", ${t(LS[9] + 0.3)}, 3, 0.8); pop("#lb-mtr", ${t(LS[9] + 0.6)});
      [0, 1, 2].forEach((i) => { KIT.toggle(tl, "kn" + i, ${t(LS[9] + 1.4)} + i * 0.45, false, 0.3); KIT.toggle(tl, "kn" + i, ${t(LS[9] + 2.9)} + i * 0.1, true, 0.3); });
      fadeIn("#pl2-t", ${t(LS[9] + 0.4)}, 0.3);
      // ===== L10 签名策略覆盖全部类型
      out("#lb-rvk, #lb-mtr", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "signC2", 1.4); pop("#cb", ${t(LS[10] + 1.2)}); hot("#cb-r3", ${t(LS[10] + 2.6)}, "#dff3e6"); pop("#cb-c3", ${t(LS[10] + 2.7)});
      fadeIn("#pl3-t", ${t(LS[10] + 2.8)}, 0.3);
      // ===== L11 普通用户
      out("#cb, #pl1, #pl2, #pl3", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "userE", 1.6); pop("#lb-userE", ${t(LS[11] + 1.2)}); bump("#userE", ${t(LS[11] + 1.3)}, 1.08, 1);
      // ===== L12 合约地址 + 网络
      KIT.swap(tl, "#ph-scr", "#ph-scr2", ${t(LS[12] + 0.4)}, 0.3); pop("#lb-ph", ${t(LS[12] + 0.7)}); flash("#lb-ph", ${t(LS[12] + 2.4)}, 2, 0.4);
      // ===== L13 白名单 + 冷却期 + 地址簿
      pop("#lb-wl", ${t(LS[13] + 0.3)}); bump("#wl", ${t(LS[13] + 0.3)}, 1.06, 1);
      pop("#lb-tlk", ${t(LS[13] + 1.8)}); X1.countdown(tl, "tlk", ${t(LS[13] + 1.9)}, 1.2, 0.6);
      X3.book(tl, "man", ${t(LS[13] + 3.6)}, 160, 0.8); pop("#lb-man", ${t(LS[13] + 4.0)});
      // ===== L14 来源不明不充；补资料只在官方 App
      out("#lb-ph", ${t(LS[14] + 2.0)}); KIT.swap(tl, "#ph-ok", "#ph-app", ${t(LS[14] + 2.2)}, 0.3);
      pop("#lb-ph2", ${t(LS[14] + 2.4)}); out("#lb-userE", ${t(LS[14] + 3.0)}); pop("#lb-mail", ${t(LS[14] + 3.2)});
      // ===== L15 全景：保管者只为真实订单签名，检查站拦赃款不误伤
      out("#lb-ph2, #lb-mail, #lb-wl, #lb-tlk, #lb-man", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "wide", 2.0); pop("#interp", ${t(LS[15] + 1.0)});
      fadeIn("#lnc", ${t(LS[15] + 2.0)}, 0.4); pop("#lb-real", ${t(LS[15] + 2.2)});
      pop("#lb-stop", ${t(LS[15] + 3.6)}); bump("#redc", ${t(LS[15] + 3.6)}, 1.1, 1); pop("#lb-pass", ${t(LS[15] + 4.6)});
      // ===== L16 结束卡（segbase）
      out("#interp, #lb-real, #lb-stop, #lb-pass, #lnc", ${t(LS[16] - 0.2)});
`,
});
