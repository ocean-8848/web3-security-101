// ep22/seg6「⑥ 回到那张卡」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.acctD（BRIEF）。ends static on CAMS.wide
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：留出右侧一栏放清单 / 角色卡 / 代码卡
const R = L.world.rects;
const CAMS6 = {
  ...L.CAMS,
  homeL: L.fit([R.door, R.window, R.homeDesk, R.holder, ...R.family, R.carry], [100, 300, 1190, 860], 1.4),
  acctL: L.fit([R.acct, R.fido, R.board, R.mail, R.playbook], [100, 300, 1190, 860], 1.4),
  simL: L.fit([R.phoneV, R.simV, R.simA, R.phoneA, R.portLock, R.atkC], [140, 320, 1230, 860], 1.6),
};
const S = segInit(import.meta.url, { cams: CAMS6, ext: [E1, E2, E4, E5, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
/** 不支持 scale 的物件：绕地面点包一层并换算 anchors */
const putW = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && q.length === 2 && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }
};
const sc = (o) => ({ scale: o.scale });

// 石板路 + 草地（原生 SVG，最先画）
const quad = (q) => [Wp(q.u0, q.v0), Wp(q.u1, q.v0), Wp(q.u1, q.v1), Wp(q.u0, q.v1)].map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ");
add({ u: -99999, v: 0 }, `<polygon points="${quad(L.ROAD)}" fill="#dcd8d0" stroke="#cbc6bb" stroke-width="2"/><polygon points="${quad(L.GRASS)}" fill="#d4e2c2" stroke="#bfd0aa" stroke-width="2"/>`, -99999);

// A 链上
putW("chn", L.CHAIN, O.chain(L.CHAIN, { id: "chn", n: 4 }));
putW("expl", L.EXPLORER, O.browserWin(L.EXPLORER, { id: "expl", title: "区块浏览器" }));
put("csign", L.CHAIN_SIGN, E1.signBoard(L.CHAIN_SIGN, { id: "csign", style: "plate", text: "链上数据" }));
// B 线索桌
putW("cdesk", L.CLUE_DESK, O.desk(L.CLUE_DESK, { id: "cdesk" }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", ...sc(L.ATK_B) }));
put("dos", L.DOSSIER, O.ledgerBook(L.DOSSIER, { id: "dos", ...sc(L.DOSSIER) }));
// C 运营商门店
put("tel", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tel", sign: "SIM", ...sc(L.TELLER) }));
put("carr", L.CARRIER_SIGN, E1.signBoard(L.CARRIER_SIGN, { id: "carr", style: "plate", text: "运营商" }));
const phScr = (txt, col) => `<rect x="0" y="0" width="76" height="26" fill="#ece7dd"/><text x="38" y="80" text-anchor="middle" font-size="15" font-weight="800" fill="${col}" font-family="Noto Sans SC">${txt}</text><rect x="8" y="110" width="60" height="26" rx="7" fill="${col}"/>`;
put("phV", L.PHONE_V, O.phone(L.PHONE_V, { id: "phV", screen: phScr("手机号", "#1d93ba") }));
put("simV", L.SIM_V, X.simCard(L.SIM_V, { id: "simV", tone: "teal" }));
put("simA", L.SIM_A, X.simCard(L.SIM_A, { id: "simA", state: "attacker" }));
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA", state: "attacker", screen: phScr("手机号", "#e0453a") }));
put("atkC", L.ATK_C, O.person(L.ATK_C, { id: "atkC", role: "attacker", ...sc(L.ATK_C) }));
put("plk", L.PORT_LOCK, O.padlock(L.PORT_LOCK, { id: "plk" }));
// D 账号广场
putW("twr", L.TOWER, O.tower(L.TOWER, { id: "twr" }));
const postPage = `<rect x="0" y="0" width="380" height="300" fill="#ffffff"/><rect x="24" y="30" width="332" height="240" rx="14" fill="#f6f4ef" stroke="#d8d2c6" stroke-width="2"/>
  <circle cx="60" cy="68" r="20" fill="#1c1c1c"/><rect x="92" y="56" width="140" height="12" rx="6" fill="#3b3e44"/><rect x="92" y="76" width="90" height="10" rx="5" fill="#b9b4aa"/>
  <rect x="44" y="112" width="290" height="12" rx="6" fill="#c9c3b7"/><rect x="44" y="136" width="250" height="12" rx="6" fill="#c9c3b7"/><rect x="44" y="160" width="270" height="12" rx="6" fill="#c9c3b7"/>`;
putW("post", L.POST, O.browserWin(L.POST, { id: "post", title: "官方 X 账号", page: postPage }));
const acctScr = `<rect x="0" y="0" width="222" height="30" fill="#ece7dd"/><text x="12" y="21" font-size="15" font-weight="800" fill="#1c1c1c" font-family="Noto Sans SC">账号设置</text>
  <text x="12" y="66" font-size="14" font-weight="700" fill="#1c1c1c" font-family="Noto Sans SC">多因素认证</text><text x="210" y="66" text-anchor="end" font-size="14" font-weight="800" fill="#1f9d55" font-family="Noto Sans SC">硬件密钥 ✓</text>
  <text x="12" y="102" font-size="14" font-weight="700" fill="#1c1c1c" font-family="Noto Sans SC">短信恢复</text><text x="210" y="102" text-anchor="end" font-size="14" font-weight="800" fill="#1f9d55" font-family="Noto Sans SC">已关闭 ✓</text>`;
put("lap", L.ACCT_LAPTOP, O.laptop(L.ACCT_LAPTOP, { id: "lap", screen: acctScr }));
put("fido", L.FIDO, O.hwWallet(L.FIDO, { id: "fido", screenText: "FIDO2" }));
putW("board", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "board", title: "KEY PEOPLE", plates: ["FOUNDER", "SIGNER", "OPS", "ADMIN"], holders: ["person", "person", "person", "person"], delays: [null, null, null, null] }));
put("mail", L.MAILBOX, O.envelope(L.MAILBOX, { id: "mail", w: 140, h: 70 }));
put("pbk", L.PLAYBOOK, O.doc(L.PLAYBOOK, { id: "pbk", standing: true, title: "被盗预案" }));
// E 家
put("door", L.DOOR_PLATE, E2.addrPlate(L.DOOR_PLATE, { id: "door", text: "门牌" }));
putW("hdesk", L.HOME_DESK, O.desk(L.HOME_DESK, { id: "hdesk" }));
put("hold", L.HOLDER, O.person(L.HOLDER, { id: "hold", role: "signer", ...sc(L.HOLDER) }));
L.FAMILY.forEach((q, i) => put("fam" + i, q, O.person(q, { id: "fam" + i, color: "#b9b4aa", ...sc(q) })));
put("carry", L.CARRY_HW, O.hwWallet(L.CARRY_HW, { id: "carry" }));
putW("msig", L.MSIG_SAFE, O.safe(L.MSIG_SAFE, { id: "msig", plate: "多签" }));
put("tlk", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlk" }));
// F 异地
put("rem", L.REMOTE, O.person(L.REMOTE, { id: "rem", role: "signer", ...sc(L.REMOTE) }));
putW("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 2, th: 2, level: 2, thText: "2 / 2" }));
put("rsign", L.REMOTE_SIGN, E1.signBoard(L.REMOTE_SIGN, { id: "rsign", style: "plate", text: "异地" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-acct", up(A.lap.top, 10), "账号设置", "lab-ink");
lb("lb-fido", up(A.fido.top, 8), "硬件安全密钥", "lab-cs lab-sm");
lb("lb-board", up(A.board.top, 8), "关键人员", "lab-cs lab-sm");
lb("lb-hold", up(A.hold.top, 8), "普通用户", "lab-ink");
lb("lb-simA", up(A.simA.top, 6), "新卡", "lab-rs lab-sm");
lb("lb-simV", up(A.simV.top, 6), "原卡", "lab-cs lab-sm");
lb("lb-phA", up(A.phA.top, 6), "攻击者的手机", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const COL = 1250, CW = 610;
const list = codeCard("lst", { x: COL, y: 270, w: CW, head: "今天就能做", rowHide: true, rows: [
  { html: "关掉短信验证", chip: "✓", chipCls: "ok" },
  { html: "申请号码转移锁", chip: "✓", chipCls: "ok" },
  { html: "空投 · 迁移：先核实", chip: "✓", chipCls: "ok" },
  { html: "线下见面选公共场所", chip: "✓", chipCls: "ok" },
  { html: "<b>人身安全第一</b>", chip: "✓", chipCls: "ok" },
] });
const sub = (a, b) => `${a}<br><span class="r-sub">${b}</span>`;
const roles = ck("ro0", sub("多签签名人", "查：手机号能单独重置哪个账号"), { x: COL, y: 300, w: CW, kind: "c" })
  + ck("ro1", sub("官方账号管理员", "多因素认证 → 硬件密钥"), { x: COL, y: 450, w: CW, kind: "c" })
  + ck("ro2", sub("团队负责人", "关键人员名单 + 号码锁 + 硬件密钥"), { x: COL, y: 600, w: CW, kind: "c" });
const RC = 1290, RW = 570;
const cardA = codeCard("ca", { x: RC, y: 330, w: RW, head: "账号安全设置", tag: "SEC 承认", rows: [
  { html: "多因素认证　已关闭", chip: "✗", chipCls: "x" },
  { html: "忘记密码　短信验证码", chip: "✗", chipCls: "x" },
] });
const pA = S.scr("simL", A.phA.top), pS = S.scr("simL", A.simA.chip), pP = S.scr("simL", A.phA.screen);
const BUB = { x: Math.round(pA[0] - 60), y: Math.round(pA[1] - 150) };
const bubble = `<div class="s6-bub hide" id="bub" style="left:${BUB.x}px;top:${BUB.y}px">短信 · <b>重置码</b></div>`;
S.curve("cv1", pS, pP, { color: "#e0453a" });
S.curve("cv2", [pP[0], pP[1] - 60], [BUB.x + 20, BUB.y + 64], { color: "#e0453a" });
S.curve("cv3", [BUB.x + 250, BUB.y + 30], [RC - 4, 620], { color: "#e0453a" });
// 宽景下三处防线的屏幕位置
const wC = S.scr("wide", A.plk.top), wE = S.scr("wide", A.tlk.top), wF = S.scr("wide", A.rem.top);
const html = list
  + kw("kw3", `限时空投 · 紧急迁移？<b>先核实</b>`, { x: COL, y: 670, size: 34, accent: "#e0453a", cls: "s6-dash" })
  + roles
  + kw("q", `当时开了 <b>多因素认证</b> 吗？`, { x: RC, y: 220, size: 36, accent: "#1d93ba" })
  + evt("src10", `来源 · <b>SEC 声明</b>`)
  + cardA + bubble
  + kw("tgt", `→ <b>官方 X 账号</b> 已登录`, { x: RC, y: 590, size: 36, accent: "#e0453a" })
  + evt("ev12", `换卡者 判 <b>14 个月</b> · 2025 年${gtag("美国司法部")}`, { color: "#e0453a" })
  + kw("kw13", `一条短信 · <b>单独恢复</b>${gtag("解读")}`, { x: RC, y: 620, size: 36, accent: "#e0453a" })
  + ck("wC", "号码转移锁", { x: Math.round(wC[0] - 130), y: Math.round(wC[1] - 150), w: 280 })
  + ck("wE", "多签 · 时间锁", { x: Math.round(wE[0] - 330), y: Math.round(wE[1] - 170), w: 300 })
  + ck("wF", "异地签名", { x: Math.round(wF[0] - 250), y: Math.round(wF[1] + 90), w: 230 })
  + kw("kw14", `一张卡、一次胁迫 · 都<b>不够</b>拿走一切${gtag("解读")}`, { x: 420, y: 140, size: 40, accent: "#1f9d55" });
const css = `
    #ro0, #ro1, #ro2 { height: auto; min-height: 112px; }
    .r-sub { font-size: 28px; font-weight: 700; color: #6d685e; }
    .s6-dash { border: 3px dashed #e0453a; }
    .s6-bub { position: absolute; background: #ffffff; border: 3px solid #e0453a; border-radius: 18px 18px 18px 4px; padding: 10px 22px 12px;
      font-size: 32px; font-weight: 900; white-space: nowrap; box-shadow: 0 8px 20px rgba(70,60,40,0.12); }
    .s6-bub b { color: #e0453a; }
    #lst .c-row b { color: #1c1c1c; font-weight: 900; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const [lx, ly] = at(L.PORT_LOCK), [sx, sy] = at(L.SIM_V);
const TM = {
  r0: w("关掉", 1), r1: w("号码转移锁", 2), r2: w("核实", 3), r3: w("公共场所", 4), r4: w("人身安全第一", 5),
  ro0: w("手机号", 6), ro1: w("硬件密钥", 7), ro2: w("关键人员", 8),
  no: w("没有", 10), sec: w("SEC", 10), sim: w("SIM", 11), code: w("重置码", 11), login: w("登录", 11),
  sms: w("一条短信", 13), wide: LS[14] + 1.1,
};
const t = (x) => f(x);

S.build({
  cam0: "acctD", sub: "一条短信不该打开一切",
  grid: { u0: -3700, u1: 16600, v0: -10600, v1: 10300 }, box: [-1600, -5900, 13600, 7900],   // 盖住上段终点 acctD + homeE / simC / wide
  shown: ["#lb-acct", "#lb-fido", "#lb-board"], css, html,
  terms: [
    { id: "t0", t: "重置码", d: "用来重设密码的一次性验证码", at: w("重置码", 11) },
  ],
  end: { title: "人身与账号安全", line: "一张卡、一次胁迫，都不该拿走一切", next: "托管、充提与合规安全", at: LS[15], nextAt: w("下一集", 15) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 普通用户，可以从这几件事做起。  D → E 家，清单卡
      out("#lb-acct, #lb-fido, #lb-board", ${t(LS[0] - 0.2)}); cam(${t(LS[0])}, "homeL", 1.8);
      pop("#lb-hold", ${t(LS[0] + 1.6)}, 0.25); pop("#lst", ${t(LS[0] + 1.9)});
      // ===== L1 硬件密钥或验证器 App，关掉短信验证
      pop("#lst-r0", ${t(TM.r0)}, 0.25); pop("#lst-c0", ${t(TM.r0 + 0.3)}, 0.2);
      // ===== L2 号码转移锁
      pop("#lst-r1", ${t(TM.r1)}, 0.25); pop("#lst-c1", ${t(TM.r1 + 0.3)}, 0.2);
      // ===== L3 限时空投、紧急迁移，先去别的官方渠道核实
      pop("#kw3", ${t(LS[3] + 0.3)}); pop("#lst-r2", ${t(TM.r2)}, 0.25); pop("#lst-c2", ${t(TM.r2 + 0.3)}, 0.2);
      // ===== L4 线下见面选公共场所
      out("#kw3", ${t(LS[4] - 0.1)}); pop("#lst-r3", ${t(TM.r3)}, 0.25); pop("#lst-c3", ${t(TM.r3 + 0.3)}, 0.2);
      // ===== L5 人身安全第一，事后立即报警
      pop("#lst-r4", ${t(TM.r4)}, 0.25); pop("#lst-c4", ${t(TM.r4 + 0.3)}, 0.2); bump("#hold", ${t(TM.r4 + 0.4)}, 1.05, 1);
      // ===== L6 签名人：手机号能不能单独重置哪个账号  E → D
      out("#lst, #lb-hold", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "acctL", 1.8);
      pop("#lb-acct", ${t(LS[6] + 1.7)}, 0.25); pop("#ro0", ${t(Math.max(TM.ro0, LS[6] + 1.9))});
      // ===== L7 官方账号管理员：多因素认证换成硬件密钥
      pop("#ro1", ${t(LS[7] + 0.3)}); pop("#lb-fido", ${t(TM.ro1)}, 0.25); bump("#fido", ${t(TM.ro1 + 0.2)}, 1.08, 2);
      // ===== L8 团队负责人：关键人员名单 + 号码锁 + 硬件密钥
      pop("#ro2", ${t(LS[8] + 0.3)}); pop("#lb-board", ${t(TM.ro2)}, 0.25); bump("#board", ${t(TM.ro2 + 0.2)}, 1.04, 2);
      // ===== L9 回到开头的题  D → C
      out("#ro0, #ro1, #ro2, #lb-acct, #lb-fido, #lb-board", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "simL", 1.6);
      pop("#q", ${t(LS[9] + 1.0)}); pop("#lb-simV, #lb-simA", ${t(LS[9] + 1.4)}, 0.25);
      // ===== L10 答案是没有，SEC 承认曾请 X 关闭多因素认证
      pop("#ca", ${t(TM.no)}); pop("#ca-c0", ${t(TM.no + 0.4)}, 0.2); hot("#ca-r0", ${t(TM.no + 0.4)}); pop("#ca-c1", ${t(TM.no + 0.7)}, 0.2);
      pop("#src10", ${t(TM.sec)}); flash("#ca-r0", ${t(w("关闭", 10))}, 2);
      // ===== L11 SIM 卡劫持，再用重置码登录（关键画面：新卡 → 手机 → 重置码 → 官方账号）
      X22.chipFlash(tl, "simA", ${t(TM.sim)}, 2, "red"); X22.chip(tl, "simA", ${t(TM.sim + 0.8)}, true, "red");
      draw("cv1", ${t(TM.sim + 0.3)}, 0.5); pop("#lb-phA", ${t(TM.sim + 0.7)}, 0.25); bump("#phA", ${t(TM.sim + 0.8)}, 1.05, 1);
      draw("cv2", ${t(TM.code - 0.5)}, 0.4); pop("#bub", ${t(TM.code - 0.1)});
      draw("cv3", ${t(TM.login - 0.4)}, 0.4); pop("#tgt", ${t(TM.login)});
      // ===== L12 换卡者 2025 年被判 14 个月
      out("#src10", ${t(LS[12] - 0.1)}); pop("#ev12", ${t(LS[12] + 0.3)});
      // ===== L13 监管机构也会失守：一条短信就能单独恢复（解读）
      out("#cv1, #cv2, #cv3, #bub, #tgt", ${t(LS[13] - 0.1)}); pop("#kw13", ${t(TM.sms)}); flash("#ca-r1", ${t(TM.sms + 0.2)}, 2);
      bump("#simA", ${t(TM.sms + 0.4)}, 1.2, 1);
      // ===== L14 一张卡、一次胁迫都不够拿走一切 → 号码锁扣上原卡，拉到全景
      out("#q, #ca, #ev12, #kw13, #lb-simV, #lb-simA, #lb-phA", ${t(LS[14] - 0.1)});
      tl.to("#plk", { x: ${f(sx - lx)}, y: ${f(sy + 22 - ly)}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[14] + 0.1)}); KIT.fixed(tl, "plk", ${t(LS[14] + 0.8)});
      X22.chip(tl, "simV", ${t(LS[14] + 0.8)}, true, "green");
      cam(${t(TM.wide)}, "wide", 2.2);
      pop("#wC", ${t(TM.wide + 2.3)}); KIT.fixed(tl, "tlk", ${t(TM.wide + 2.5)}); KIT.fixed(tl, "msig", ${t(TM.wide + 2.5)}); pop("#wE", ${t(TM.wide + 2.6)});
      KIT.fixed(tl, "rem", ${t(TM.wide + 2.8)}); pop("#wF", ${t(TM.wide + 2.9)}); pop("#kw14", ${t(TM.wide + 3.2)});
      // ===== L15 下一集讲托管、充提与合规安全（结束卡，wide 静止）
      out("#wC, #wE, #wF, #kw14", ${t(LS[15] - 0.25)});
`,
});
