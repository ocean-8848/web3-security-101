// ep13/seg3「③ 账户就是输入」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         五关全景：五座海关 + 关名牌（seg2 L0–L4、L10–L16；seg6 L14–L15 结束卡）
//   evmA         A EVM 关：道闸 + 售货机 + 存储柜 + 参数包裹 + 外部调用（seg2 L5、L12）
//   solB         B Solana 关全景：道闸 + 程序机器 + 护照一字排开 + 调用者 / 攻击者 + 铸币机（seg1 L12–L13 终点；seg2 起点、L6、L17 终点；seg6 L10、L12）
//   passB        近景：护照 ×4 + 程序机器 + "无状态"框 + 调用者 / 攻击者（seg1 L2–L3、L7、L10–L11；seg3 起点 L0–L5；seg6 L11）
//   mintB        近景：wETH 铸币机 + 程序机器 + 守护者签名证明卡 + 伪造的"系统账户"护照 PASS[3]（seg1 起点 L0–L1、L4）
//   yardB        B后 账户链 + 可信根 + Cashio 点阵 + Anchor 盾（seg3 L6–L13）
//   driftB       B后 Drift 角：门限表 + 两张审批 + 沙漏 + 时间锁（seg3 L14–L20 终点；seg4 起点）
//   moveC        C Move 关：道闸 + 资源包裹（复制框）+ Cetus 角全貌（seg2 L7、L12；seg4 L0–L1）
//   cetusC       近景：Cetus 角：池子 + 开源数学库 + 位移格 + 份额机 + 份额凭证 + 攻击者 + 冻结冰壳（seg4 L2–L10）
//   verifC       近景：C 岗亭 + 放大镜"字节码验证器"（seg4 L11–L13）
//   upgC         C后 升级与部署：未审计模块 + 审计版本卡 + 单签钥匙 + 时间锁 + 多签（seg4 L14–L17 终点；seg5 起点）
//   btcD         D Bitcoin 关：道闸 + 集装箱 + Bitcoin 链 + 两台索引器（seg2 L8、L13；seg5 L0–L4）
//   lnD          D 闪电角：mempool + 截止时间钟 + 超时交易信封（seg5 L5–L7）
//   liquidD      D Liquid 角：联盟签名门限表 + L-BTC 铸币机 + 储备对账天平 + 红点阵（seg5 L8–L12）
//   cosmosE      E Cosmos 关：道闸 + 两条应用链 + 海关章 + 证明卡 + 超时牌 + 托管保险箱（seg2 L9、L13；seg5 L13–L14；seg6 起点 L0）
//   haltE        E Jackfruit 角：三台节点 + 头顶三只钟 + 出块闸刀 + 停机警报灯（seg5 L15–L17 终点）
//   cexF         F 交易所接入台全景（seg6 L0–L9）
//   listF        近景：接入清单 + 失败牌 / 同名假币 / 不可回滚沙漏 / SDK 包裹 + 柜台（seg6 L2–L5、L8）
//   world        全部区（含后院和接入台）：远景备用
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.driftB

// 段内专用位置 / 镜头
const Sx = (X0, Y0, extra = {}) => { const q = G(X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const MINI = Sx(1700 + 720, -600 + 300, { scale: 0.5 });       // L4 跨程序调用的目标小机器（E01 miniVend plain 0.5）
const pr = (q) => L.rect(q, "passport");
const CAMS = {
  ...L.CAMS,
  // L0–L3 护照近景，左侧留给代码卡
  passNear: L.fit([...L.PASS.map(pr), L.rect(L.SIGNER, "person")], [700, 320, 1800, 860], 2.0),
  // L4–L5 护照 + 程序机器 + 小机器，左侧留给代码卡
  passB2: L.fit([...L.PASS.map(pr), L.rect(L.MACH, "contractMachine"), L.rect(L.SIGNER, "person"), L.rect(L.ATK_B, "personAtk"),
    L.rect(MINI, "miniVend")], [680, 300, 1820, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E3, E5, E7, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
const wrapK = (o, k) => { const [gx, gy] = at(o);
  return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] }; };
// 大道（原生 SVG，A–C 段）
{ const r = L.ROAD, ua = L.GATES[0].u - 600, ub = L.GATES[2].u + 600, h = r.w / 2;
  const P = [[ua, r.a.v - h], [ub, r.a.v - h], [ub, r.a.v + h], [ua, r.a.v + h]].map(([u, v]) => Wp(u, v, 0).join(","));
  S.add({ u: -99999, v: -99999 }, `<polygon points="${P.join(" ")}" fill="#d9d4ca" stroke="#cfc9bd" stroke-width="2"/>`, -99999); }
// B 关
put("gB", L.GATES[1], O.checkpoint(L.GATES[1], { id: "gB", n: "B" }));
put("sgnB", L.SIGNS[1], E1.signBoard(L.SIGNS[1], { id: "sgnB", style: "plate", text: "Solana · 查护照" }));
put("mach", L.MACH, E3.contractMachine(L.MACH, { id: "mach", name: "程序", tone: "light" }));
{ const [x, y] = at(L.STATELESS);
  add(L.STATELESS, `<g id="stl"><rect x="${x - 60}" y="${y - 150}" width="120" height="150" rx="8" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="9 7"/><text x="${x}" y="${y - 66}" text-anchor="middle" font-size="22" font-weight="700" fill="#e0453a">无状态</text></g>`); }
put("prfB", L.PROOF_B, E2.proofCard(L.PROOF_B, { id: "prfB", missing: true, text: "守护者签名" }));
put("mintB", L.MINT_B, E11.mintPress(L.MINT_B, { id: "mintB", scale: 0.6, plate: "wETH" }));
L.PASS.forEach((q, i) => put(`ps${i}`, q, X.passport(q, i === 3
  ? { id: "ps3", title: "系统账户", state: "attacker", fake: true }
  : { id: `ps${i}`, fields: ["owner", "签名", "类型"] })));
put("sg", L.SIGNER, O.person(L.SIGNER, { id: "sg", role: "signer", scale: 0.7 }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: 0.7 }));
put("mini", MINI, E1.miniVend(MINI, { id: "mini", kind: "plain", scale: 0.5 }), 0, { grow: true });
{ const du = MINI.u - L.MACH.u, dv = MINI.v - L.MACH.v;
  put("cpi", L.MACH, E1.pipe(L.MACH, { id: "cpi", pts: [[0, 100, 50], [0, dv - 40, 50], [du, dv - 40, 50]] }), 1, { grow: true }); }
{ const [x, y] = up(A.sg.top, 16);
  add(L.SIGNER, S.hid("pen", `<g transform="translate(${x},${y}) rotate(-35)"><rect x="-5" y="-34" width="10" height="28" rx="3" fill="#1c1c1c"/><rect x="-5" y="-34" width="10" height="7" rx="2" fill="#2aa3c9"/><path d="M-5,-6 L5,-6 L0,6 Z" fill="#c9a26a"/></g>`), 2); }
// B后 账户链
L.CHAIN_P.forEach((q, i) => put(`cp${i}`, q, X.passport(q, { id: `cp${i}` })));
put("rootP", L.ROOT, E2.addrPlate(L.ROOT, { id: "rootP", text: "可信根" }), 0, { grow: true });
{ const T0 = [0, 1, 2].map((i) => up(A[`cp${i}`].top, 4)), R = A.rootP.plate ?? A.rootP.top;
  const end = [T0[2][0] + (R[0] - T0[2][0]) * 0.45, T0[2][1] + (R[1] - T0[2][1]) * 0.45 + 26];
  const ln = (a, b, c, extra = "") => `<path d="M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${Math.max(a[1], b[1]) + 18} ${b[0]},${b[1]}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"${extra}/>`;
  const knot = (p) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#1d93ba"/>`;
  const zz = { u: L.ROOT.u + 400, v: L.ROOT.v + 400 };   // 绳子画在护照前面
  add(zz, S.hid("rope", ln(T0[0], T0[1], "#2aa3c9") + ln(T0[1], T0[2], "#2aa3c9") + ln(T0[2], end, "#2aa3c9") + T0.map(knot).join("")));
  add(zz, S.hid("ropeg", ln(T0[0], T0[1], "#1f9d55") + ln(T0[1], T0[2], "#1f9d55")), 1);
  add(zz, S.hid("ropefix", ln(T0[2], R, "#1f9d55") + `<circle cx="${R[0]}" cy="${R[1]}" r="6" fill="#1f9d55"/>`), 2);
  const mx = [(end[0] + R[0]) / 2, (end[1] + R[1]) / 2];
  add(zz, S.hid("rootx", `<line x1="${end[0]}" y1="${end[1]}" x2="${R[0]}" y2="${R[1]}" stroke="#e0453a" stroke-width="3" stroke-dasharray="8 6"/><g stroke="#e0453a" stroke-width="5" stroke-linecap="round"><line x1="${mx[0] - 11}" y1="${mx[1] - 11}" x2="${mx[0] + 11}" y2="${mx[1] + 11}"/><line x1="${mx[0] + 11}" y1="${mx[1] - 11}" x2="${mx[0] - 11}" y2="${mx[1] + 11}"/></g>`), 3);
  S.A.ropeEnd = end; S.A.ropeMid = [(T0[0][0] + T0[1][0]) / 2, (T0[0][1] + T0[1][1]) / 2 + 12]; S.A.ropeMid2 = [(T0[1][0] + T0[2][0]) / 2, (T0[1][1] + T0[2][1]) / 2 + 12]; }
put("atkC", L.ATK_CASH, O.person(L.ATK_CASH, { id: "atkC", role: "attacker", scale: 0.7 }), 0, { grow: true });
put("odd", L.ODD_CASH, E7.oddCoin(L.ODD_CASH, { id: "odd", scale: 0.6, kind: "plain" }), 0, { grow: true });
{ const [gx, gy] = at(L.DOTS_CASH), d = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) d.push(`<circle cx="${gx + 8 + c * 14}" cy="${gy + 8 + r * 14}" r="4.6" fill="#e0453a"/>`);
  add(L.DOTS_CASH, S.hid("dots", d.join("")), 30); S.A.dots = [gx + 75, gy]; }
put("shd", L.ANCHOR_SHIELD, O.shield(L.ANCHOR_SHIELD, { id: "shd" }), 0, { grow: true });
// Drift 角
{ const k = wrapK(L.DMETER, 0.7);
  put("dm", L.DMETER, E5.thresholdMeter(L.DMETER, { id: "dm", max: 5, th: 2, thText: "5 人 2 签" }), 0, { wrap: k.wrap });
  for (const n of ["top", "center", "ground", "th", "lamp"]) if (A.dm[n]) A.dm[n] = k.sc(A.dm[n]); }
L.SIGS.forEach((q, i) => put(`sp${i}`, q, E2.sigPaper(q, { id: `sp${i}`, title: "审批" }), 0, { grow: true }));
put("hg", L.DGLASS, O.hourglass(L.DGLASS, { id: "hg" }));
put("tlk", L.DLOCK, E1.timeLock(L.DLOCK, { id: "tlk", frac: 1 }));

// ---------------------------------------------------------------- 世界标签
lb("lb-in", up(A.ps1.top, 14), "用户输入", "lab-cs lab-sm");
lb("lb-same", up(A.ps2.top, 14), "结构相同", "lab-ink lab-sm");
lb("lb-fakeT", up(A.ps2.top, 14), "冒充", "lab-r lab-sm");
lb("lb-mini", up(A.mini.top, 8), "program id：调用者传入", "lab-cs lab-sm", "r");
lb("lb-cpiok", A.cpi.end ?? A.mini.center, "核对 ✓", "lab-g lab-sm", "r");
lb("lb-wh", up(A.ps3.top, 14), "Wormhole", "lab-r lab-sm");
lb("lb-end", up(S.A.ropeEnd, 10), "终点？", "lab-r lab-sm");
lb("lb-ok1", S.A.ropeMid, "一致", "lab-g lab-sm", "t");
lb("lb-ok2", S.A.ropeMid2, "一致", "lab-g lab-sm", "t");
lb("lb-root", up(A.rootP.top, 8), "可信根", "lab-cs lab-sm");
lb("lb-root2", up(A.rootP.top, 8), "硬编码地址 / PDA", "lab-g lab-sm");
lb("lb-dots", [S.A.dots[0], S.A.dots[1] + 150], "约 20 亿枚 CASH", "lab-r lab-sm", "t");
lb("lb-shd", up(A.shd.top, 8), "Anchor 约束", "lab-cs lab-sm");
lb("lb-tk", A.shd.center, "✓ ✓ ✓ ✓ ✓", "lab-g", "c");
lb("lb-tk2", A.shd.center, `✓ ✓ <span style="display:inline-block;width:.9em;height:.9em;border:2px dashed #e0453a;vertical-align:-0.1em"></span> ✓ ✓`, "lab-g", "c");
lb("lb-miss", A.shd.ground, "漏写一个 = 没有", "lab-r lab-sm", "t");
lb("lb-hg", A.hg.ground, "约 1 分钟", "lab-cs lab-sm", "t");
lb("lb-tl0", up(A.tlk.top, 8), "时间锁 0", "lab-r lab-sm");
lb("lb-tl1", up(A.tlk.top, 8), "时间锁", "lab-cs lab-sm");
lb("lb-sp", up(A.sp1.top, 8), "没完全理解的审批", "lab-r lab-sm");
lb("lb-nonce", up(A.sp0.top, 8), "持久 nonce：不过期", "lab-r lab-sm");
lb("lb-conf", A.sp1.ground, "✓ 执行前再确认", "lab-g lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 60, y: 300, w: 560 };
const rowsA = ["owner = 本程序", "管理员账户已签名", "判别字段 = 预期类型", "CPI 目标 program id", "系统账户：带校验读取"];
const card = codeCard("cs", { ...C, head: "每个账户都要查", rows: rowsA.map((h, i) => ({ html: h, chip: i === 4 ? "Wormhole 缺" : "✓", chipCls: i === 4 ? "x" : "ok" })) });
S.curve("cv0", [C.x + C.w + 4, codeRowY(C.y, 0)], S.scr("passNear", A.ps1.checks[0]), { color: "#e0453a" });
S.curve("cv4", [C.x + C.w + 4, codeRowY(C.y, 4)], S.scr("passB2", A.ps3.center), { color: "#e0453a" });
const card2 = codeCard("cs2", { x: 60, y: 320, w: 500, head: "还要做", rows: [{ html: "PDA 用规范 bump", chip: "✓", chipCls: "ok" }, { html: "CPI 后再次加载账户", chip: "✓", chipCls: "ok" }] });
const evC = evt("evC", `<b>Cashio</b> · 2022 年 3 月<div class="hide" id="evC-r1">rekt.news：约 4800 万美元</div><div class="hide" id="evC-r2">CertiK：约 5280 万美元 ${gtag("两种口径")}</div><div class="hide" id="evC-r3" style="font-size:.8em;color:#666">来源：rekt.news · CertiK</div>`, { color: "#e0453a" });
const evD = evt("evD", `<b>Drift</b> · 2026 年 4 月 · 约 2.85 亿美元<div style="font-size:.8em;opacity:.8">来源：Chainalysis 分析</div><div class="hide" id="evD-r1">描述来自 Drift 自身调查 ${gtag("未经独立验证")}</div>`, { color: "#e0453a", top: 128 });
const html = card + card2 + evC + evD;
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  owner: w("owner", 1), sig: w("签了名", 2), fake: w("冒充", 3), disc: w("判别字段", 3), check4: w("核对", 4),
  wh: w("Wormhole", 5), same7: w("一致", 7), anchor8: w("锚定", 8), cash9: w("20 亿", 9), rekt: w("rekt.news", 10), certik: w("CertiK", 10),
  hard11: w("硬编码", 11), miss13: w("漏写", 13), two16: w("两人", 16), lock16: w("时间锁", 16), nonce18: w("持久 nonce", 18), conf20: w("执行前", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "passB", sub: "每本护照都要自己查",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "owner", d: "有权修改该账户数据的程序", at: w("owner", 1) },
    { id: "t1", t: "判别字段", d: "账户数据开头标明类型的字段", at: w("判别字段", 3) },
    { id: "t2", t: "跨程序调用", d: "Solana 程序调用另一个程序", at: w("跨程序调用", 4) },
    { id: "t3", t: "PDA", d: "由程序和种子派生、没有私钥的地址", at: w("PDA", 11) },
    { id: "t4", t: "bump", d: "派生 PDA 时附加的调整字节", at: w("bump", 12) },
    { id: "t5", t: "持久 nonce", d: "让预签名交易不随时间过期的机制", at: w("持久 nonce", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 Solana 程序拿到的每一个账户，都是用户输入。
      cam(${t(LS[0] + 0.1)}, "passNear", 1.3); X13.cover(tl, "ps1", ${t(LS[0] + 1.0)}); pop("#lb-in", ${t(LS[0] + 1.6)}, 0.25);
      // ===== L1 第一件要查的，是 owner。这个账户，是不是归本程序所有。
      out("#lb-in", ${t(LS[1] - 0.1)}); pop("#cs", ${t(LS[1])}); hot("#cs-r0", ${t(TM.owner)}); draw("cv0", ${t(TM.owner + 0.2)});
      X13.check(tl, "ps1", ${t(TM.owner + 1.0)}, 0, "ok"); pop("#cs-c0", ${t(TM.owner + 1.0)}, 0.2);
      // ===== L2 第二件，是签名。管理员操作，必须检查管理员账户签了名。
      out("#cv0", ${t(LS[2] - 0.2)}); hot("#cs-r1", ${t(LS[2] + 0.2)}); fadeIn("#pen", ${t(LS[2] + 0.6)}, 0.3); bump("#pen", ${t(TM.sig)}, 1.2, 1);
      X13.check(tl, "ps1", ${t(TM.sig + 0.2)}, 1, "ok"); pop("#cs-c1", ${t(TM.sig + 0.2)}, 0.2);
      // ===== L3 第三件，是类型。两种账户结构相同，攻击者就能拿一种冒充另一种。要靠判别字段区分。
      out("#pen", ${t(LS[3] - 0.2)}); pop("#lb-same", ${t(LS[3] + 1.6)}, 0.25);
      out("#lb-same", ${t(TM.fake - 0.2)}, 0.2); X13.title(tl, "ps2", ${t(TM.fake)}, "另一类型"); pop("#lb-fakeT", ${t(TM.fake + 0.1)}, 0.25);
      hot("#cs-r2", ${t(TM.disc)}); X13.check(tl, "ps1", ${t(TM.disc + 0.3)}, 2, "ok"); pop("#cs-c2", ${t(TM.disc + 0.3)}, 0.2);
      KIT.broke(tl, "ps2", ${t(TM.disc + 0.8)}, { badge: false, ghost: 0.35 });
      // ===== L4 第四件，是跨程序调用的目标。program id 由调用者传进来，就必须核对。
      out("#lb-fakeT", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "passB2", 1.3); hot("#cs-r3", ${t(LS[4] + 1.0)});
      grow("mini", ${t(LS[4] + 1.4)}); grow("cpi", ${t(LS[4] + 1.8)}); pop("#lb-mini", ${t(LS[4] + 3.0)}, 0.25);
      pop("#lb-cpiok", ${t(TM.check4)}, 0.25); pop("#cs-c3", ${t(TM.check4)}, 0.2);
      // ===== L5 第五件，是系统账户。要用带校验的读取方式。Wormhole 缺的就是这一件。
      out("#lb-mini, #lb-cpiok", ${t(LS[5] - 0.2)}); hot("#cs-r4", ${t(LS[5] + 0.2)}); draw("cv4", ${t(LS[5] + 0.4)});
      pop("#cs-c4", ${t(TM.wh)}, 0.2); KIT.broke(tl, "ps3", ${t(TM.wh + 0.1)}, { badge: false, ghost: 0.35 }); pop("#lb-wh", ${t(TM.wh + 0.3)}, 0.25);
      // ===== L6 更隐蔽的一种，是信任链没有终点。
      out("#cs, #cv4, #lb-wh", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "yardB", 1.5);
      fadeIn("#rope", ${t(LS[6] + 1.4)}, 0.4); pop("#lb-end", ${t(LS[6] + 2.0)}, 0.25);
      // ===== L7 2022 年 3 月的 Cashio，存抵押品时，只检查了各个账户互相一致。
      pop("#evC", ${t(LS[7] + 0.2)}); fadeIn("#ropeg", ${t(TM.same7)}, 0.3); pop("#lb-ok1", ${t(TM.same7 + 0.1)}, 0.25); pop("#lb-ok2", ${t(TM.same7 + 0.4)}, 0.25);
      // ===== L8 铸币检查没有把 mint 字段，锚定到一个可信的根。
      grow("rootP", ${t(LS[8] + 0.2)}); pop("#lb-root", ${t(LS[8] + 0.8)}, 0.25); fadeIn("#rootx", ${t(TM.anchor8)}, 0.3);
      // ===== L9 攻击者伪造了整条账户链，用没有价值的代币，铸出约 20 亿枚 CASH。
      out("#lb-ok1, #lb-ok2", ${t(LS[9])}); [0, 1, 2].forEach((i) => X13.fake(tl, "cp" + i, ${t(LS[9] + 0.2)} + i * 0.25, true));
      grow("atkC", ${t(LS[9] + 1.2)}); grow("odd", ${t(LS[9] + 1.6)}); fadeIn("#dots", ${t(TM.cash9 - 0.6)}, 0.8); pop("#lb-dots", ${t(TM.cash9)}, 0.25);
      // ===== L10 损失的估计，rekt.news 约 4800 万美元，CertiK 约 5280 万美元。
      pop("#evC-r1", ${t(TM.rekt)}, 0.25); pop("#evC-r3", ${t(TM.rekt + 1.6)}, 0.25); pop("#evC-r2", ${t(TM.certik)}, 0.25);
      // ===== L11 账户之间再一致，也要有一端，落在硬编码的地址，或本程序的 PDA 上。
      out("#rootx, #lb-end, #dots, #lb-dots, #lb-root", ${t(LS[11] + 0.2)}); fadeIn("#ropefix", ${t(TM.hard11)}, 0.4); fadeIn("#ropeg", ${t(TM.hard11)}, 0.1);
      pop("#lb-root2", ${t(TM.hard11 + 0.2)}, 0.25); [0, 1, 2].forEach((i) => X13.fake(tl, "cp" + i, ${t(TM.hard11 + 0.8)} + i * 0.15, false));
      // ===== L12 PDA 要用规范的 bump。跨程序调用之后，要再次加载账户，不用内存里的旧数据。
      pop("#cs2", ${t(LS[12] + 0.1)}); pop("#cs2-c0", ${t(LS[12] + 1.2)}, 0.2); hot("#cs2-r1", ${t(LS[12] + 2.4)}); pop("#cs2-c1", ${t(LS[12] + 3.6)}, 0.2);
      // ===== L13 Anchor 框架的账户约束，能自动做完大部分检查。但约束是开发者写的，漏写一个，就等于没有。
      out("#cs2, #evC", ${t(LS[13] - 0.1)}); grow("shd", ${t(LS[13] + 0.2)}); pop("#lb-shd", ${t(LS[13] + 0.8)}, 0.25); pop("#lb-tk", ${t(LS[13] + 1.6)}, 0.25);
      out("#lb-tk", ${t(TM.miss13)}, 0.15); pop("#lb-tk2", ${t(TM.miss13 + 0.1)}, 0.25); pop("#lb-miss", ${t(TM.miss13 + 0.4)}, 0.25);
      // ===== L14 签名的有效期，也是一种输入。
      out("#lb-tk2, #lb-miss, #lb-shd, #lb-root2", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "driftB", 1.3); pop("#lb-hg", ${t(LS[14] + 1.2)}, 0.25);
      // ===== L15 2026 年 4 月，按 Chainalysis 的分析，Drift 损失约 2.85 亿美元。
      pop("#evD", ${t(LS[15] + 0.2)});
      // ===== L16 它的安全委员会，五个人里两人签名就能放行。迁移到新配置后，时间锁为零。
      X5.fill(tl, "dm", ${t(TM.two16)}, 2, 1.0); X1.countdown(tl, "tlk", ${t(TM.lock16)}, 1.0, 0); pop("#lb-tl0", ${t(TM.lock16 + 0.8)}, 0.25);
      // ===== L17 至少两名成员，签了自己没有完全理解的审批。
      grow("sp0", ${t(LS[17] + 0.2)}); grow("sp1", ${t(LS[17] + 0.5)}); pop("#lb-sp", ${t(LS[17] + 1.4)}, 0.25);
      // ===== L18 Solana 的签名，本来约 1 分钟就会过期。持久 nonce 让这些签名长期有效。
      out("#lb-sp", ${t(LS[18] - 0.1)}); KIT.sand(tl, "hg", ${t(LS[18] + 0.3)}, 2.4);
      pop("#lb-nonce", ${t(TM.nonce18)}, 0.25); bump("#sp0, #sp1", ${t(TM.nonce18 + 0.3)}, 1.06, 2);
      // ===== L19 Chainalysis 也说明，这些描述来自 Drift 自己的调查，未经独立验证。
      pop("#evD-r1", ${t(LS[19] + 0.3)}, 0.25);
      // ===== L20 管理操作要加时间锁，执行前再确认一次。
      out("#lb-nonce, #lb-tl0", ${t(LS[20])}); X1.countdown(tl, "tlk", ${t(LS[20] + 0.2)}, 1.0, 1); pop("#lb-tl1", ${t(LS[20] + 0.6)}, 0.25);
      pop("#lb-conf", ${t(TM.conf20)}, 0.25);
`,
});
