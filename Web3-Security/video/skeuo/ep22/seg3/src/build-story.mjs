// ep22/seg3「③ 号码被转走」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.linkB（BRIEF）。ends static on CAMS.staffD
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   chainA       A 区块链 + 区块浏览器 + 放大镜 + "链上数据"（seg2 L10–L12）
//   linkB        B 线索桌 + 三类线索 + 目标档案 + 住址牌（seg2 L13–L17、L19 终点；seg3 起点）
//   simC         C SIM 卡 ×2 + 两部手机特写，题卡位置在右侧（seg1 L5–L11 终点；seg2 起点；seg3 L3–L8；seg6 L9–L13）
//   counterC     C 运营商柜台 + 伪造证件 + 号码转移锁 + 受害者手机 / 攻击者新卡（seg3 L0–L2；seg5 L14）
//   postD        D 广播塔 + 官方账号帖子 + 粉丝 + 粉丝钱包 + 入口牌 + 点阵（seg1 起点 L0–L4；seg3 L9–L18）
//   acctD        D 账号设置笔记本 + 硬件密钥 + 关键人员板 + 专用邮箱 + 被盗预案（seg5 L12–L20 终点；seg6 起点 L6–L8）
//   staffD       D 交易所员工工位 + 员工 + 手机 + 交易所金库 + 点阵（seg3 L19–L23 终点；seg4 起点）
//   homeE        E 门牌 + 家（书桌 / 窗）+ 持币人 + 家属 + 海报 + 暗号手机 + 点阵（seg4 L0–L7、L16–L17、L21 终点；seg5 起点 L0–L5；seg6 L0–L5）
//   safeE        E 多签金库 + 时间锁 + 扳手 / 算力机比喻 + 持币人 + 随身设备（seg2 L0–L9；seg5 L6–L11）
//   eventsE      E 门口旁的事件牌（seg4 L8–L15、L18–L20，"镜头稍右移"）
//   remoteF      E 右侧（金库 / 时间锁 / 持币人）到草地对面的 F 异地（门槛表）（seg5 L7、L10）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   F            
//   wide         整条街全景：A → F（seg2 L18；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E13, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const RED = "#e0453a", TEAL = "#2aa3c9", GRAY = "#c9c4bb", FONT = `font-family="Noto Sans SC, sans-serif"`;
/** wrap-scaled put (常见坑 1)：绕地面点缩放 o.scale，并换算 anchors */
function putW(key, o, r, dy = 0, extra = {}) {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && q.length === 2 && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }
}
const box = (id, [x0, y0, x1, y1], pad = 10) =>
  `<rect id="${id}-r" x="${x0 - pad}" y="${y0 - pad}" width="${x1 - x0 + 2 * pad}" height="${y1 - y0 + 2 * pad}" rx="10" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="12 8"/>`;
const scrSvg = (lines, bg = "#ffffff") => `<rect width="76" height="150" fill="${bg}"/>` +
  lines.map(([y, txt, size = 13, col = "#1c1c1c", w = 700]) => `<text x="38" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${w}" fill="${col}" ${FONT}>${txt}</text>`).join("");

// B 线索桌（上段终点，开场可见）
putW("dk", L.CLUE_DESK, O.desk(L.CLUE_DESK, { id: "dk" }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: 0.5 }));
putW("pubPh", L.PUB_PHONE, O.phone(L.PUB_PHONE, { id: "pubPh", screen: scrSvg([[40, "公开信息", 12, TEAL], [80, "照片", 12], [110, "采访", 12]]) }));
putW("kyc", L.KYC_DB, O.dbLedger(L.KYC_DB, { id: "kyc", tag: "KYC 数据" }));
put("ord", L.ORDER, E7.parcel(L.ORDER, { id: "ord", scale: 0.6 }));
put("tkt", L.TICKET, O.doc(L.TICKET, { id: "tkt", title: "客服工单" }));
put("dos", L.DOSSIER, O.ledgerBook(L.DOSSIER, { id: "dos", scale: 0.6 }));
putW("adrB", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "adrB", text: "住址" }));
lb("lb-dk", up(A.dk.top, 6), "线索桌", "lab-ink lab-sm");
lb("lb-dos", up(A.dos.top, 6), "目标档案", "lab-cs lab-sm");

// C 运营商门店
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.75, sign: "SIM", cash: 0 }));
put("csign", L.CARRIER_SIGN, E1.signBoard(L.CARRIER_SIGN, { id: "csign", style: "plate", text: "运营商" }));
put("pp", L.FAKE_ID, E13.passport(L.FAKE_ID, { id: "pp", scale: 0.6, title: "证件", fields: ["姓名", "号码", "照片"] }));
put("phV", L.PHONE_V, O.phone(L.PHONE_V, { id: "phV", screen: scrSvg([[46, "手机号", 15, TEAL], [80, "信号 ▮▮▮", 11, "#1f9d55"]]) }));
put("simV", L.SIM_V, X.simCard(L.SIM_V, { id: "simV", tone: "teal" }));
put("simA", L.SIM_A, X.simCard(L.SIM_A, { id: "simA", state: "attacker" }));
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA", role: "attacker",
  screen: scrSvg([[60, "新手机", 13, "#6b665c"]]),
  screen2: scrSvg([[40, "登录", 13], [74, "忘记密码？", 12, RED], [108, "短信找回", 11, "#6b665c", 400]]) }));
put("atkC", L.ATK_C, O.person(L.ATK_C, { id: "atkC", role: "attacker", scale: 0.55 }));
lb("lb-phV", up(A.phV.top, 6), "受害者 · 手机号", "lab-cs lab-sm");
lb("lb-simA", up(A.simA.top, 6), "攻击者的卡", "lab-rs lab-sm");
lb("lb-pp", up(A.pp.top, 14), "伪造证件 / 贿赂 / 欺骗", "lab-r lab-sm");
lb("lb-phVoff", up(A.phV.top, 6), "无信号", "lab-g lab-sm");
S.add(L.FAKE_ID, S.hid("ppBox", box("ppBox", L.rect(L.FAKE_ID, "passport"))), 30);
// 号码小牌：从受害者手机屏幕移到攻击者卡（L1）
const chip = (id, [x, y], txt, col = TEAL) => S.hid(id, `<g><rect x="${x - 50}" y="${y - 18}" width="100" height="36" rx="18" fill="#ffffff" stroke="${col}" stroke-width="3"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="20" font-weight="700" fill="${col}" ${FONT}>${txt}</text></g>`);
S.add(L.PHONE_V, chip("numC", A.phV.screen, "手机号"), 60);
const NUM_D = [A.simA.top[0] - A.phV.screen[0], A.simA.top[1] - 24 - A.phV.screen[1]];
// 短信气泡（L4）：从柜台方向飞到攻击者手机
const SMS_P = [A.phA.screen[0] - 40, A.phA.screen[1] - 70];
S.add(L.PHONE_A, S.hid("sms", `<g><rect x="${SMS_P[0] - 60}" y="${SMS_P[1] - 22}" width="120" height="44" rx="14" fill="#ffffff" stroke="${RED}" stroke-width="3"/><path d="M${SMS_P[0] - 10} ${SMS_P[1] + 22}l8 14l10-14z" fill="#ffffff" stroke="${RED}" stroke-width="3"/><text x="${SMS_P[0]}" y="${SMS_P[1] + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="${RED}" ${FONT}>验证码</text></g>`), 80);

// D 账号广场
putW("tw", L.TOWER, O.tower(L.TOWER, { id: "tw" }));
const pageSvg = `<rect width="380" height="300" fill="#ffffff"/>
  <circle cx="44" cy="44" r="22" fill="#d6d0c4"/>
  <text id="pgN0" x="80" y="52" font-size="24" font-weight="900" fill="#1c1c1c" ${FONT}>官方账号</text>
  <text id="pgN1" x="80" y="52" font-size="24" font-weight="900" fill="#1c1c1c" opacity="0" ${FONT}>Vitalik Buterin</text>
  <text id="pgN2" x="80" y="52" font-size="24" font-weight="900" fill="#1c1c1c" opacity="0" ${FONT}>Mandiant</text>
  <text id="pgN3" x="80" y="52" font-size="24" font-weight="900" fill="${RED}" opacity="0" ${FONT}>Phantom</text>
  <rect x="24" y="90" width="332" height="150" rx="14" fill="#f6f3ee" stroke="#d6d0c4" stroke-width="2"/>
  <rect x="44" y="114" width="220" height="14" rx="7" fill="#d6d0c4"/><rect x="44" y="140" width="170" height="14" rx="7" fill="#d6d0c4"/>
  <g id="pgB1" opacity="0"><text x="44" y="200" font-size="28" font-weight="900" fill="${RED}" ${FONT}>纪念 NFT</text>
  <text x="44" y="228" font-size="18" fill="${RED}" text-decoration="underline" ${FONT}>点击领取 →</text></g>`;
putW("post", L.POST, O.browserWin(L.POST, { id: "post", title: "官方 X 账号", page: pageSvg }));
L.FANS.forEach((q, i) => put("fan" + i, q, O.person(q, { id: "fan" + i, color: GRAY, scale: 0.42 })));
L.FAN_SAFES.forEach((q, i) => putW("fs" + i, q, O.safe(q, { id: "fs" + i, variant: "hot" })));
// 三封钓鱼链接信：从塔顶飞到粉丝旁
const TW_TIP = A.tw.tip ?? A.tw.top;
const LT_PTS = L.LETTERS.map((q) => at(q));
L.LETTERS.forEach((q, i) => S.add(L.TOWER, S.hid("ltw" + i, E1.letter(L.TOWER, { id: "lt" + i, state: "attacker", z: 260 }).svg), 200));
lb("lb-tw", up(A.tw.top, 6), "官方账号", "lab-cs lab-sm");
L.FANS.forEach((q, i) => lb("fck" + i, up(A["fan" + i].top, 4), "✓", "lab-gs lab-sm"));
lb("lb-fans", [A.fan0.top[0] - 30, A.fan0.top[1] + 20], "粉丝", "lab-g lab-sm", "r");
// 入口小牌（四块）→ L18 换成 15 个账号方块
const [ex, ey] = at(L.ENTRIES);
const ENT = ["换卡", "暴力破解", "交接关掉 MFA", "冒充官方"];
ENT.forEach((txt, i) => {
  const x = ex - 380 + i * 192;
  S.add(L.ENTRIES, S.hid("en" + i, `<rect x="${x}" y="${ey - 66}" width="176" height="58" rx="10" fill="#fde6e3" stroke="${RED}" stroke-width="3"/><text x="${x + 88}" y="${ey - 28}" text-anchor="middle" font-size="${txt.length > 5 ? 22 : 26}" font-weight="900" fill="${RED}" ${FONT}>${txt}</text>`), -400);
});
let acc = `<g id="accG">`; for (let i = 0; i < 15; i++) acc += `<rect x="${ex - 372 + i * 50}" y="${ey - 56}" width="40" height="40" rx="8" fill="#ffffff" stroke="#8f887c" stroke-width="3"/>`;
acc += `</g>`; for (let i = 0; i < 15; i++) acc += `<rect id="accR${i}" x="${ex - 372 + i * 50}" y="${ey - 56}" width="40" height="40" rx="8" fill="${RED}" stroke="#8f2620" stroke-width="3" opacity="0"/>`;
S.add(L.ENTRIES, S.hid("acc", acc), -400);
lb("lb-acc", [ex, ey - 64], "15 个加密类账号", "lab-r lab-sm");
lb("lb-mand", [ex - 92, ey - 64], "Mandiant 自查", "lab-g lab-sm");
// 钓鱼邮件信封（L11 / L17）：从第 4 块入口牌飞到帖子窗口
const ENV0 = { u: L.ENTRIES.u + 360, v: L.ENTRIES.v + 120 };
S.add(ENV0, S.hid("envw", O.envelope(ENV0, { id: "env", w: 120, h: 70, state: "attacker" }).svg), 300);
const ENV_D = [A.post.top[0] - at(ENV0)[0] + 40, A.post.top[1] + 70 - at(ENV0)[1]];
lb("lb-env1", [A.post.top[0] + 40, A.post.top[1] + 40], "版权侵权 / 账号违规", "lab-rs lab-sm");
lb("lb-env2", [A.post.top[0] + 40, A.post.top[1] + 150], "版权侵权通知", "lab-rs lab-sm");
// 点阵：69 / 50（D1）、40（D2）
const dots = (n, [x0, y0], cols, dx, dy, r = 7) => { let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${x0 + 12 + (i % cols) * dx}" cy="${y0 + 12 + Math.floor(i / cols) * dy}" r="${r}" fill="${RED}"/>`; return s; };
const D1 = at(L.DOTS_D1), D2 = at(L.DOTS_D2);
S.add(L.DOTS_D1, S.hid("d69", dots(69, D1, 14, 26, 22)), 400);
S.add(L.DOTS_D1, S.hid("d50", dots(50, D1, 10, 36, 22)), 400);
lb("lg69", [D1[0] + 190, D1[1] + 124], "每点约 1 万美元 · ZachXBT 统计", "lab-r lab-sm", "t");
lb("lg50", [D1[0] + 190, D1[1] + 124], "每点约 1 万美元 · 约 50 万美元", "lab-r lab-sm", "t");

// D 交易所员工工位
putW("stDk", L.STAFF_DESK, O.desk(L.STAFF_DESK, { id: "stDk" }));
put("staff", L.STAFF, O.person(L.STAFF, { id: "staff", role: "engineer", scale: 0.5 }));
putW("stPh", L.STAFF_PHONE, O.phone(L.STAFF_PHONE, { id: "stPh", screen: scrSvg([[46, "手机号", 15, TEAL], [80, "员工", 12, "#6b665c"]]) }));
put("ex", L.EXCH_SAFE, O.safe(L.EXCH_SAFE, { id: "ex", plate: "交易所" }));
const SIM_A2 = { u: L.STAFF_PHONE.u + 170, v: L.STAFF_PHONE.v + 40 };
put("simA2", SIM_A2, X.simCard(SIM_A2, { id: "simA2", state: "attacker" }), 0, { grow: true });
lb("lb-staff", up(A.staff.top, 6), "交易所员工", "lab-cs lab-sm");
lb("lb-ex", up(A.ex.top, 6), "交易所金库", "lab-ink lab-sm");
lb("lb-cred", up(A.stPh.top, 10), "特权凭证", "lab-rs");
lb("lb-media", up(A.simA2.top, 8), "媒体援引消息源", "lab-g lab-sm");
S.add(L.STAFF_PHONE, S.hid("phBox", box("phBox", L.rect(L.STAFF_PHONE, "phone"), 14)), 30);
S.add(L.STAFF_PHONE, chip("numS", A.stPh.screen, "手机号"), 60);
const NUM_S = [A.simA2.top[0] - A.stPh.screen[0], A.simA2.top[1] - 24 - A.stPh.screen[1]];
S.add(L.DOTS_D2, S.hid("d40", dots(40, D2, 10, 30, 27)), 400);
lb("lg40", [D2[0] + 150, D2[1] + 124], "每点 1000 万美元 · 超过 4 亿美元", "lab-r lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 1370, y: 300, w: 480 };
const card = codeCard("cc", { ...CC, head: "账号恢复设置", tag: "示意", rows: [
  { html: "验证器 App", chip: "✓ 已开启", chipCls: "ok" },
  { html: "忘记密码 → 短信", chip: "可单独恢复", chipCls: "x" }] });
S.curve("cvNum", S.scr("counterC", A.phV.screen), S.scr("counterC", A.simA.top), { color: RED });
S.curve("cvCode", [CC.x - 4, codeRowY(CC.y, 1)], S.scr("simC", A.simA.center ?? A.simA.top), { color: RED });
S.curve("cvStaff", S.scr("staffD", A.stPh.screen), S.scr("staffD", A.simA2.top), { color: RED });
const html = card +
  `<div id="ccBox" class="hide" style="position:absolute;left:${CC.x - 6}px;top:${codeRowY(CC.y, 0) - 28}px;width:${CC.w + 12}px;height:56px;border:4px dashed ${RED};border-radius:10px;box-sizing:border-box"></div>` +
  kw("kw8", `第二因素有多强<br>看恢复流程里<b>最弱的一环</b>`, { x: CC.x, y: 560, size: 36, accent: RED }) +
  evt("ev1", `<b>Vitalik Buterin</b> · 2023 年 9 月`, { color: RED, top: 120 }) +
  evt("src1", `CoinDesk 报道`, { color: "#8f887c", top: 226 }) +
  evt("ev2", `<b>Mandiant</b> · 2024 年 1 月`, { color: RED, top: 124 }) +
  evt("src2", `SecurityWeek 报道`, { color: "#8f887c", top: 230 }) +
  evt("src3", `Cointelegraph · SentinelOne`, { color: "#8f887c", top: 234 }) +
  evt("src4", `美国联邦起诉书`, { color: "#8f887c", top: 238 }) +
  evt("ev3", `<b>FTX</b> · 2022 年 11 月`, { color: RED, top: 128 }) +
  evt("src5", `CNBC 报道`, { color: "#8f887c", top: 242 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const fr = (i, k) => LS[i] + k * (LE[i] - LS[i]);   // 第 i 句的 k 处（英文词用这个）
const TM = {
  zhuan: w("转到", 1), fake: w("伪造证件", 2), bribe: w("贿赂", 2), forgot: w("忘记密码", 3),
  only: w("唯一", 5), sms5: w("短信验证码", 5), app6: w("验证器 App", 6), still6: w("仍然", 6), alone7: w("单独", 7),
  brute: w("暴力破解", 10), handoff: w("交接", 10), phish: w("钓鱼邮件", 11), doubt: w("几乎", 12),
  vit: fr(13, 0.3), nft: fr(13, 0.75), empty: w("清空", 14), zach: fr(14, 0.6),
  mand: fr(15, 0.4), phan: fr(15, 0.8), brute16: w("暴力破解", 16), hand16: w("交接", 16),
  take: w("接管", 18), fifty: fr(18, 0.8), suit: w("起诉书", 20), hijack: fr(20, 0.75), ftx: fr(22, 0.4), cred: w("特权凭证", 23),
};
const t = (x) => f(x);

S.build({
  cam0: "linkB", sub: "第二因素只和恢复流程一样强",
  grid: { u0: -600, u1: 11400, v0: -5800, v1: 5900 }, box: [-100, -3500, 9100, 4000],   // 盖住上段终点 linkB + counterC / simC / postD / staffD
  shown: ["#lb-dk", "#lb-dos"], css, html,
  terms: [
    { id: "t0", t: "运营商", d: "提供手机号和 SIM 卡的电信公司", at: w("运营商", 1) },
    { id: "t1", t: "验证器 App", d: "手机上按时间生成动态码的应用", at: w("验证器 App", 6) },
    { id: "t2", t: "暴力破解", d: "反复尝试大量密码直到猜中", at: w("暴力破解", 10) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先看账号这条路，SIM 卡劫持。 B → C counterC
      out("#lb-dk, #lb-dos", ${f(LS[0])}); cam(${f(LS[0] + 0.3)}, "counterC", 1.8);
      // ===== L1 运营商把手机号转到攻击者的卡上：号码沿红虚线移到红色 simCard
      pop("#lb-phV", ${f(LS[1] + 0.2)}); pop("#lb-simA", ${f(LS[1] + 0.8)});
      draw("cvNum", ${f(TM.zhuan)}); fadeIn("#numC", ${f(TM.zhuan + 0.2)}, 0.3);
      tl.to("#numC", { x: ${NUM_D[0].toFixed(1)}, y: ${NUM_D[1].toFixed(1)}, duration: 1.4, ease: "power2.inOut" }, ${f(TM.zhuan + 0.6)});
      X22.chip(tl, "simA", ${f(TM.zhuan + 2.0)}, true, "red"); X22.chip(tl, "simV", ${f(TM.zhuan + 2.0)}, false);
      // ===== L2 伪造证件 / 贿赂 / 欺骗客服
      X13.fake(tl, "pp", ${f(TM.fake)}); fadeIn("#ppBox", ${f(TM.fake + 0.1)}, 0.3); pop("#lb-pp", ${f(TM.bribe)});
      // ===== L3 点忘记密码：推到 simC，攻击者手机屏幕
      out("#cvNum, #numC, #ppBox, #lb-pp, #lb-phV", ${f(LS[3] - 0.2)}); cam(${f(LS[3])}, "simC", 1.4);
      KIT.swap(tl, "#phA-scr", "#phA-scr2", ${f(TM.forgot)}, 0.3); bump("#phA", ${f(TM.forgot + 0.3)}, 1.05, 1);
      // ===== L4 短信验证码飞到新卡；受害者手机灰掉
      tl.fromTo("#sms", { x: -340, y: -60 }, { x: 0, y: 0, duration: 1.0, ease: "power2.out" }, ${f(LS[4] + 0.1)}); fadeIn("#sms", ${f(LS[4] + 0.1)}, 0.3);
      X22.chipFlash(tl, "simA", ${f(LS[4] + 1.2)}, 2, "red"); X22.chip(tl, "simA", ${f(LS[4] + 2.0)}, true, "red");
      tl.to("#phV-scr", { opacity: 0.25, duration: 0.4 }, ${f(LS[4] + 0.9)}); pop("#lb-phVoff", ${f(LS[4] + 1.1)});
      // ===== L5 代码卡：第 2 行变红，红虚线连到新卡
      pop("#cc", ${f(LS[5] + 0.2)}); pop("#cc-c1", ${f(TM.sms5)}); hot("#cc-r1", ${f(TM.only)}); draw("cvCode", ${f(TM.only + 0.2)});
      // ===== L6 第 1 行验证器 App 绿勾
      pop("#cc-c0", ${f(TM.app6)}); hot("#cc-r0", ${f(TM.app6)}, "#dff3e6"); flash("#cc-c1", ${f(TM.still6)}, 2);
      // ===== L7 关键画面：绿勾套红虚线框，短信这条线绕过它直达新卡
      pop("#ccBox", ${f(TM.alone7)}); flash("#cvCode", ${f(TM.alone7 + 0.4)}, 2, 0.3); X22.chipFlash(tl, "simA", ${f(TM.alone7 + 0.4)}, 2, "red"); X22.chip(tl, "simA", ${f(TM.alone7 + 1.2)}, true, "red");
      // ===== L8 最弱的一环
      pop("#kw8", ${f(LS[8] + 0.3)});
      // ===== L9 入口不止换卡：→ postD，第 1 块入口牌
      out("#cc, #ccBox, #kw8, #cvCode, #sms, #lb-phVoff, #lb-simA", ${f(LS[9] - 0.2)}); cam(${f(LS[9])}, "postD", 1.6);
      pop("#en0", ${f(LS[9] + 1.8)}); pop("#lb-tw", ${f(LS[9] + 1.9)});
      // ===== L10 暴力破解 / 交接关掉 MFA
      pop("#en1", ${f(TM.brute)}); pop("#en2", ${f(TM.handoff)});
      // ===== L11 冒充官方：信封飞向帖子窗口
      pop("#en3", ${f(LS[11] + 0.2)}); fadeIn("#envw", ${f(TM.phish - 0.4)}, 0.3);
      tl.to("#envw", { x: ${ENV_D[0].toFixed(1)}, y: ${ENV_D[1].toFixed(1)}, duration: 1.2, ease: "power2.inOut" }, ${f(TM.phish)});
      pop("#lb-env1", ${f(Math.min(TM.phish + 1.2, LS[12] - 0.8))});
      // ===== L12 塔发出三封链接信飞向粉丝；粉丝头顶对勾
      out("#lb-env1, #envw", ${f(LS[12] + 0.4)}); flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${f(LS[12] + 0.2)}, 3);
      ${[0, 1, 2].map((i) => `fadeIn("#ltw${i}", ${f(LS[12] + 0.4 + i * 0.35)}, 0.2); X1.walk(tl, "lt${i}", ${f(LS[12] + 0.5 + i * 0.35)}, 1.2, [[${LT_PTS[i].map((v) => v.toFixed(1))}]]);`).join("\n      ")}
      pop("#lb-fans", ${f(TM.doubt - 0.3)});
      ${[0, 1, 2, 3, 4].map((i) => `pop("#fck${i}", ${f(TM.doubt + i * 0.12)});`).join(" ")}
      // ===== L13 Vitalik · 纪念 NFT
      pop("#ev1", ${f(LS[13] + 0.2)}); out("#pgN0", ${f(TM.vit)}, 0.2); fadeIn("#pgN1", ${f(TM.vit)}, 0.3);
      fadeIn("#pgB1", ${f(TM.nft)}, 0.3); pop("#src1", ${f(TM.nft + 0.4)});
      // ===== L14 粉丝钱包清空；69 点
      out("#fck0, #fck1, #fck2, #fck3, #fck4, #ltw0, #ltw1, #ltw2", ${f(LS[14])});
      ${[0, 1, 2].map((i) => `KIT.broke(tl, "fs${i}", ${f(TM.empty + i * 0.3)}, { badge: true });`).join(" ")}
      fadeIn("#d69", ${f(TM.zach - 0.6)}, 0.5); pop("#lg69", ${f(TM.zach)});
      // ===== L15 Mandiant 改名冒充 Phantom
      out("#ev1, #src1, #pgN1, #pgB1, #d69, #lg69", ${f(LS[15] - 0.1)}); pop("#ev2", ${f(LS[15] + 0.3)});
      fadeIn("#pgN2", ${f(TM.mand)}, 0.3); KIT.swap(tl, "#pgN2", "#pgN3", ${f(TM.phan)}, 0.3); pop("#src2", ${f(TM.phan + 0.5)});
      // ===== L16 Mandiant 自查：暴力破解 + 交接期间 MFA
      pop("#lb-mand", ${f(LS[16] + 0.3)}); bump("#en1", ${f(TM.brute16)}, 1.08, 2); bump("#en2", ${f(TM.hand16)}, 1.08, 2);
      // ===== L17 冒充 X 官方发版权侵权通知
      out("#ev2, #src2, #lb-mand", ${f(LS[17] - 0.1)}); bump("#en3", ${f(LS[17] + 0.2)}, 1.08, 2);
      tl.set("#envw", { x: 0, y: 0 }, ${f(LS[17] + 0.3)}); fadeIn("#envw", ${f(LS[17] + 0.4)}, 0.3);
      tl.to("#envw", { x: ${ENV_D[0].toFixed(1)}, y: ${ENV_D[1].toFixed(1)}, duration: 1.2, ease: "power2.inOut" }, ${f(LS[17] + 0.7)});
      pop("#lb-env2", ${f(LS[17] + 1.9)}); pop("#src3", ${f(LS[17] + 2.2)});
      // ===== L18 15 个账号方块变红；50 点
      out("#en0, #en1, #en2, #en3, #lb-env2, #envw, #src3", ${f(LS[18])}); fadeIn("#acc", ${f(LS[18] + 0.2)}, 0.3); pop("#lb-acc", ${f(TM.take)});
      ${Array.from({ length: 15 }, (_, i) => `fadeIn("#accR${i}", ${f(TM.take + 0.2 + i * 0.08)}, 0.15);`).join(" ")}
      fadeIn("#d50", ${f(TM.fifty - 0.5)}, 0.5); pop("#lg50", ${f(TM.fifty)});
      // ===== L19 交易所员工：→ staffD
      out("#lb-acc, #lg50, #d50, #lb-tw, #lb-fans", ${f(LS[19] - 0.2)}); cam(${f(LS[19])}, "staffD", 1.4);
      pop("#lb-staff", ${f(LS[19] + 1.2)}); pop("#lb-ex", ${f(LS[19] + 1.4)});
      // ===== L20 起诉书：员工号码沿红线移到红卡
      pop("#src4", ${f(TM.suit)}); grow("simA2", ${f(TM.hijack - 0.9)}); draw("cvStaff", ${f(TM.hijack - 0.3)});
      fadeIn("#numS", ${f(TM.hijack)}, 0.3); tl.to("#numS", { x: ${NUM_S[0].toFixed(1)}, y: ${NUM_S[1].toFixed(1)}, duration: 1.2, ease: "power2.inOut" }, ${f(TM.hijack + 0.3)});
      X22.chip(tl, "simA2", ${f(TM.hijack + 1.5)}, true, "red");
      // ===== L21 超过 4 亿美元：金库门开，40 点
      KIT.door(tl, "ex", ${f(LS[21] + 0.2)}, 105, 1.0); fadeIn("#d40", ${f(LS[21] + 1.0)}, 0.5); pop("#lg40", ${f(LS[21] + 1.4)});
      // ===== L22 FTX · 申请破产当天
      out("#src4", ${f(LS[22] - 0.1)}); pop("#ev3", ${f(TM.ftx)}); pop("#lb-media", ${f(TM.ftx + 0.3)}); pop("#src5", ${f(TM.ftx + 0.6)});
      // ===== L23 员工手机号 = 特权凭证（ends static on CAMS.staffD）
      out("#ev3, #src5, #lb-media, #cvStaff, #numS", ${f(LS[23] - 0.1)}); fadeIn("#phBox", ${f(TM.cred)}, 0.3); pop("#lb-cred", ${f(TM.cred + 0.1)});
`,
});
