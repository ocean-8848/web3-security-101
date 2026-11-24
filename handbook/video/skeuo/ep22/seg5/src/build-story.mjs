// ep22/seg5「⑤ 拉开距离」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.homeE（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as E17 from "../../../ep17/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.acctD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E4, E5, E7, E13, E17, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const scPt = (gx, gy, k) => (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
const wput = (key, o, obj, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), k = o.scale, sc = scPt(gx, gy, k);
  put(key, o, obj, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const [n, v] of Object.entries(A[key])) {
    if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = sc(v);
    else if (Array.isArray(v) && Array.isArray(v[0])) A[key][n] = v.map(sc);
  }
};
// 段内局部点：E 区锚点的屏幕偏移 → 地面点
const eP = (X, Y) => { const [ox, oy] = L.ZONE_ANCHOR.E; const q = G(ox + X, oy + Y); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const EA = L.ZONE_ANCHOR.E;
const GRAY = "#b9b4ab";

// E 家（上段终点 homeE 的物件）
put("door", L.DOOR_PLATE, E2.addrPlate(L.DOOR_PLATE, { id: "door", text: "门牌" }));
put("poster", L.POSTER, E1.signBoard(L.POSTER, { id: "poster", style: "wood", text: "海报", size: 34 }));
put("win", L.WINDOW, E17.viewWindow(L.WINDOW, { id: "win", scale: 0.6, label: "窗外" }));
wput("hdesk", L.HOME_DESK, O.desk(L.HOME_DESK, { id: "hdesk" }));
const chatScr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="22" fill="#ece7dd"/>
  <rect x="5" y="34" width="52" height="24" rx="8" fill="#e3f3f8" stroke="#2aa3c9" stroke-width="1.5"/><rect x="20" y="68" width="50" height="24" rx="8" fill="#e8f5ec" stroke="#1f9d55" stroke-width="1.5"/>
  <rect x="5" y="102" width="40" height="20" rx="8" fill="#e3f3f8" stroke="#2aa3c9" stroke-width="1.5"/>`;
wput("cphone", L.CODE_PHONE, O.phone(L.CODE_PHONE, { id: "cphone", screen: chatScr }));
put("holder", L.HOLDER, O.person(L.HOLDER, { id: "holder", role: "signer", scale: 0.6 }));
L.FAMILY.forEach((q, i) => put("fam" + i, q, O.person(q, { id: "fam" + i, color: GRAY, scale: 0.5 })));
put("carry", L.CARRY_HW, O.hwWallet(L.CARRY_HW, { id: "carry", screenText: "随身" }));
// E 金库一侧
wput("msig", L.MSIG_SAFE, O.safe(L.MSIG_SAFE, { id: "msig", plate: "多签" }));
put("tlock", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlock", frac: 1 }));
wput("gpu", L.GPU, E2.gpuRig(L.GPU, { id: "gpu" }));
put("wr", L.WRENCH, X.wrench(L.WRENCH, { id: "wr", scale: 0.9 }));
// E 本段新加：两张地址牌、代收点、包裹
const AP1 = eP(-980, -360), AP2 = eP(-680, -400), PICK = eP(-1450, 200), PC = eP(-300, 400);
put("ap1", AP1, E2.addrPlate(AP1, { id: "ap1", text: "收款" }), 0, { grow: true });
put("ap2", AP2, E2.addrPlate(AP2, { id: "ap2", text: "大额" }), 0, { grow: true });
add(AP1, S.hid("apsep", `<line x1="${EA[0] - 830}" y1="${EA[1] - 600}" x2="${EA[0] - 830}" y2="${EA[1] - 350}" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/>`), 30);
put("pick", PICK, E1.signBoard(PICK, { id: "pick", style: "plate", text: "代收点", size: 30 }), 0, { grow: true });
put("pc", PC, E7.parcel(PC, { id: "pc", scale: 0.9 }), 0, { grow: true });
// F 异地
put("remote", L.REMOTE, O.person(L.REMOTE, { id: "remote", role: "signer", scale: 0.55 }));
wput("rlap", L.REMOTE_LAPTOP, O.laptop(L.REMOTE_LAPTOP, { id: "rlap", screen: O.laptopDefaultScreen({ title: "Device B" }) }));
wput("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", max: 2, th: 2, thText: "2 / 2" }));
put("rsign", L.REMOTE_SIGN, E1.signBoard(L.REMOTE_SIGN, { id: "rsign", style: "plate", text: "异地" }));
// D 账号设置一角
put("acct", L.ACCT_LAPTOP, O.laptop(L.ACCT_LAPTOP, { id: "acct", screen: O.laptopDefaultScreen({ title: "账号设置" }) }));
put("fido", L.FIDO, O.hwWallet(L.FIDO, { id: "fido", screenText: "FIDO2" }));
wput("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb", title: "关键人员", roles: ["owner", "upgrader", "pauser", "param"],
  holders: [null, null, null, null], delays: [null, null, null, null], plates: ["创始人", "签名人", "运维", "账号管理员"], empty: [0, 1, 2, 3] }), 0, { grow: true });
put("mail", L.MAILBOX, O.envelope(L.MAILBOX, { id: "mail", w: 140, h: 70 }));
put("pb", L.PLAYBOOK, O.doc(L.PLAYBOOK, { id: "pb", standing: true, title: "被盗预案" }));
// C 运营商门店
put("teller", L.TELLER, E4.tellerCounter(L.TELLER, { id: "teller", scale: 0.75, sign: "SIM", cash: 0 }));
put("csign", L.CARRIER_SIGN, E1.signBoard(L.CARRIER_SIGN, { id: "csign", style: "plate", text: "运营商" }));
put("fid", L.FAKE_ID, E13.passport(L.FAKE_ID, { id: "fid", fake: true, scale: 0.6 }));
put("phv", L.PHONE_V, O.phone(L.PHONE_V, { id: "phv" }));
put("simV", L.SIM_V, X.simCard(L.SIM_V, { id: "simV", tone: "teal" }));
put("simA", L.SIM_A, X.simCard(L.SIM_A, { id: "simA", state: "attacker" }));
put("pl", L.PORT_LOCK, O.padlock(L.PORT_LOCK, { id: "pl" }));

// 原生 SVG：窗上马赛克、点阵、邮箱绿框
const [wx, wy] = A.win.screen, mos = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) mos.push(`<rect x="${wx - 49 + c * 14}" y="${wy - 28 + r * 14}" width="14" height="14" fill="${(r + c) % 2 ? "#8f8a82" : "#b3aea6"}"/>`);
add(L.WINDOW, S.hid("mosaic", mos.join("")), 40);
const dotsFew = [0, 1, 2].map((i) => `<circle cx="${EA[0] + 200 + i * 20}" cy="${EA[1] + 290}" r="6" fill="#2aa3c9"/>`);
add(eP(200, 290), S.hid("dfew", dotsFew.join("")), 40);
const dotsBig = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) dotsBig.push(`<circle cx="${EA[0] + 630 + c * 18}" cy="${EA[1] - 440 + r * 18}" r="6" fill="#2aa3c9"/>`);
add(eP(630, -360), S.hid("dbig", dotsBig.join("")), 40);
const [mx, my] = at(L.MAILBOX);
add(L.MAILBOX, S.hid("mailbox-ok", `<rect x="${mx - 84}" y="${my - 48}" width="168" height="94" rx="12" fill="none" stroke="#1f9d55" stroke-width="5"/>`), 40);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
["我的持仓", "资产截图", "收益晒单"].forEach((s, i) => lb("lb-pst" + i, up(A.poster.top, 10 + (2 - i) * 64), s, "lab-r lab-sm"));
lb("lb-ap1", up(A.ap1.top, 8), "公开收款", "lab-cs lab-sm");
lb("lb-ap2", up(A.ap2.top, 8), "个人大额", "lab-ink lab-sm");
lb("lb-pc", up(A.pc.top, 8), "硬件钱包", "lab-cs lab-sm");
lb("lb-door", up(A.door.top, 8), "不寄到家", "lab-r lab-sm");
lb("lb-win", up(A.win.top, 8), "不拍：住址 · 车牌 · 路线", "lab-ink lab-sm");
lb("lb-tl", up(A.tlock.top, 8), "时间锁", "lab-cs lab-sm");
lb("lb-m1", [A.meter.levels[0][0] - 80, A.meter.levels[0][1]], "本人", "lab-g lab-sm", "r");
lb("lb-m2", [A.meter.levels[1][0] - 80, A.meter.levels[1][1] - 30], "等异地", "lab-cs lab-sm", "r");
lb("lb-rem", up(A.remote.top, 8), "异地的另一人", "lab-ink lab-sm");
lb("lb-rlap", [A.rlap.ground[0], A.rlap.ground[1] + 14], "另一台设备", "lab-cs lab-sm", "t");
lb("lb-few", [EA[0] + 220, EA[1] + 320], "随身 · 少量", "lab-cs lab-sm", "t");
lb("lb-big", [EA[0] + 693, EA[1] - 460], "多签 · 大额", "lab-ink lab-sm");
lb("lb-code", up(A.cphone.top, 8), "暗号 · 紧急联系", "lab-cs lab-sm");
lb("lb-fam", up(A.fam0.top, 8), "家属", "lab-ink lab-sm");
lb("lb-ok", up(A.tlock.top, 100), "降低：立即转出", "lab-g lab-sm");
lb("lb-no", up(A.tlock.top, 190), "保证：<s>人身安全</s>", "lab-ink lab-sm s5-gray");
lb("lb-pl", up(A.simV.top, 12), "号码转移锁 · SIM 更换 PIN", "lab-g lab-sm");
lb("lb-mail", up(A.mail.top, 8), "专用邮箱 · 不公开", "lab-g lab-sm");
lb("lb-org", [A.rb.ground[0], A.rb.ground[1] + 10], "签名人名单不公开 · 只公开机构", "lab-cs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const AC = { x: 70, y: 300, w: 470 };
const acct = codeCard("ac", { ...AC, head: "账号设置 · 多因素认证", rows: [
  { html: "邮箱", chip: "FIDO2", chipCls: "ok" }, { html: "交易所", chip: "FIDO2", chipCls: "ok" },
  { html: "社交账号", chip: "FIDO2", chipCls: "ok" }, { html: "域名注册商", chip: "FIDO2", chipCls: "ok" },
  { html: "短信验证 / 恢复", chip: "关闭", chipCls: "x" }] });
S.curve("cv-ac", [AC.x + AC.w + 4, codeRowY(AC.y, 0)], S.scr("acctD", A.acct.screen ?? A.acct.top), { color: "#2aa3c9" });
const kp = codeCard("kp", { x: 70, y: 300, w: 470, head: "关键人员", rows: [
  { html: "创始人", chip: "在册", chipCls: "ok" }, { html: "多签签名人", chip: "不公开", chipCls: "x" },
  { html: "运维负责人", chip: "在册", chipCls: "ok" }, { html: "官方账号管理员", chip: "在册", chipCls: "ok" }] });
const ho = codeCard("ho", { x: 70, y: 320, w: 500, head: "官方账号交接", rows: [
  { html: "多因素认证", chip: "保持开启", chipCls: "ok" }, { html: "发帖权限 → 运营", chip: "分开", chipCls: "ok" },
  { html: "恢复权限 → 管理员", chip: "分开", chipCls: "ok" }] });
const dos = codeCard("dos", { x: 1310, y: 300, w: 460, head: "目标档案 · 申请删除", rows: [
  { html: "姓名", chip: "已删除", chipCls: "ok" }, { html: "住址", chip: "已删除", chipCls: "ok" }, { html: "电话", chip: "已删除", chipCls: "ok" }] });
const html = kw("tg0", "<b>降低暴露</b>", { x: 1000, y: 112, size: 34 }) + kw("tg1", "<b>降低胁迫收益</b>", { x: 1260, y: 112, size: 34, accent: "#17809f" })
  + dos + acct + kp + ho
  + `<div class="s5-rule hide" id="rule"><div class="r1">人身安全 第一</div><div class="r2">资产 第二</div></div>`
  + ck("pb0", "备用公告渠道", { x: 1330, y: 300, w: 470 }) + ck("pb1", "平台联系人", { x: 1330, y: 380, w: 470 }) + ck("pb2", "写好的辟谣声明", { x: 1330, y: 460, w: 470 });
const css = `
  .s5-gray { color: #9a958c !important; }
  .s5-rule { position: absolute; left: 610px; top: 330px; width: 700px; background: #fff; border-radius: 16px; padding: 26px 36px;
    box-shadow: 0 10px 24px rgba(70,60,40,0.16); font-family: "Noto Sans SC", sans-serif; text-align: center; opacity: 0; z-index: 30; }
  .s5-rule .r1 { font-size: 60px; font-weight: 900; color: #1c1c1c; }
  .s5-rule .r2 { font-size: 44px; font-weight: 500; color: #8a857c; margin-top: 8px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  exp0: w("降低暴露", 0), coer0: w("降低胁迫", 0), exp1: w("降低暴露", 1),
  hold: w("不公开谈持仓", 1), shot: w("不晒资产截图", 1),
  pub: w("公开收款地址", 2), big: w("个人大额地址", 2), same: w("不用同一个", 2),
  hw: w("硬件钱包", 3), pick: w("代收地址", 3),
  photo: w("照片", 4), plate: w("车牌", 4),
  search: w("搜一搜", 5), del: w("申请删除", 5),
  coer6: w("降低胁迫", 6), noout: w("转不出去", 6),
  msig: w("多签", 7), tl: w("时间锁", 7), other: w("另一个人", 7), dev: w("另一台设备", 7),
  few: w("少量资产", 8), code: w("胁迫暗号", 9), emer: w("紧急联系", 9),
  imm: w("立即转出", 10), safe10: w("人身安全", 10), first: w("人身安全第一", 11),
  mail12: w("邮箱", 12), fido: w("硬件安全密钥", 12), sms: w("短信", 13), rec: w("恢复密码", 13),
  lock: w("号码转移锁", 14), pin: w("SIM", 14), pmail: w("专用邮箱", 15),
  k0: w("创始人", 17), k1: w("签名人", 17), k2: w("运维", 17), k3: w("官方账号管理员", 17),
  hide18: w("不公开", 18), org: w("只公开机构", 18),
  mfa19: w("不关闭", 19), split: w("分开", 19),
  c0: w("备用公告渠道", 20), c1: w("平台联系人", 20), c2: w("辟谣声明", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "homeE", sub: "让人找不到，找到了也转不走",
  grid: { u0: 1700, u1: 16200, v0: -7500, v1: 6700 }, box: [1600, -5200, 11000, 4800],   // 盖住上段终点 homeE + safeE / remoteF / acctD / counterC / simC
  shown: [], css, html,
  terms: [
    { id: "t0", t: "数据经纪", d: "收集并出售个人信息的公司", at: w("数据经纪", 5) },
    { id: "t1", t: "多签", d: "多人签名凑够门槛才能动资金", at: w("多签", 7) },
    { id: "t2", t: "时间锁", d: "交易要等一段时间后才能执行", at: w("时间锁", 10) },
    { id: "t3", t: "硬件安全密钥", d: "插上或贴近才能登录的物理密钥", at: w("硬件安全密钥", 12) },
    { id: "t4", t: "号码转移锁", d: "运营商侧防止号码被转走或换卡", at: w("号码转移锁", 14) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 两张顶部标签
      pop("#tg0", ${t(TM.exp0)}); pop("#tg1", ${t(TM.coer0)});
      // ===== L1 海报三行逐行擦掉；第二张标签变暗
      tl.to("#tg1", { opacity: 0.35, duration: 0.3 }, ${t(TM.exp1)});
      [0, 1, 2].forEach((i) => pop("#lb-pst" + i, ${t(LS[1] + 0.3)} + i * 0.2, 0.25));
      out("#lb-pst0", ${t(TM.hold)}, 0.4); out("#lb-pst1", ${t(TM.shot)}, 0.4); out("#lb-pst2", ${t(TM.shot + 0.6)}, 0.4);
      bump("#poster", ${t(TM.hold)}, 1.06, 1);
      // ===== L2 两张地址牌 + 青蓝分隔线
      grow("ap1", ${t(TM.pub)}); pop("#lb-ap1", ${t(TM.pub + 0.4)});
      grow("ap2", ${t(TM.big)}); pop("#lb-ap2", ${t(TM.big + 0.4)});
      fadeIn("#apsep", ${t(TM.same)}, 0.5);
      // ===== L3 包裹沿路滑到代收点，不进家门
      out("#lb-ap1, #lb-ap2", ${t(LS[3] - 0.2)});
      grow("pc", ${t(TM.hw)}); pop("#lb-pc", ${t(TM.hw + 0.3)}); grow("pick", ${t(TM.hw + 0.4)});
      out("#lb-pc", ${t(TM.pick - 0.1)}, 0.2); X5.fly(tl, "pc", ${t(TM.pick)}, -1030, -120, 1.6, 30);
      pop("#lb-door", ${t(TM.pick + 0.8)});
      // ===== L4 窗上马赛克
      out("#lb-door", ${t(LS[4] - 0.2)});
      fadeIn("#mosaic", ${t(TM.photo + 0.2)}, 0.5); pop("#lb-win", ${t(TM.plate)});
      // ===== L5 目标档案逐行删除（屏幕卡：B 区太远，不往返平移）
      out("#lb-win", ${t(LS[5] - 0.2)});
      pop("#dos", ${t(TM.search)});
      [0, 1, 2].forEach((i) => { tl.to("#dos-r" + i, { opacity: 0.35, duration: 0.3 }, ${t(TM.del)} + i * 0.35); pop("#dos-c" + i, ${t(TM.del)} + i * 0.35, 0.2); });
      // ===== L6 推到 safeE；第二张标签亮
      out("#dos", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "safeE", 1.4);
      tl.to("#tg0", { opacity: 0.35, duration: 0.3 }, ${t(TM.coer6)}); tl.to("#tg1", { opacity: 1, duration: 0.3 }, ${t(TM.coer6)}); bump("#tg1", ${t(TM.coer6)}, 1.08, 1);
      bump("#msig", ${t(TM.noout)}, 1.04, 1);
      // ===== L7 关键画面：本人一格 + 时间锁倒计时 → 右移到异地
      cam(${t(LS[7])}, "remoteF", 1.6);
      X5.fill(tl, "meter", ${t(TM.msig + 0.2)}, 1, 0.6); pop("#lb-m1", ${t(TM.msig + 0.6)});
      pop("#lb-tl", ${t(TM.tl)}); X1.countdown(tl, "tlock", ${t(TM.tl + 0.2)}, 3.5, 0.55);
      pop("#lb-rem", ${t(TM.other)}); bump("#remote", ${t(TM.other)}, 1.1, 1);
      pop("#lb-rlap", ${t(TM.dev)}); bump("#rlap", ${t(TM.dev)}, 1.06, 1); pop("#lb-m2", ${t(TM.dev + 0.4)});
      // ===== L8 随身 3 点 vs 多签一大片
      out("#lb-m1, #lb-m2, #lb-rem, #lb-rlap, #lb-tl", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "safeE", 1.3);
      fadeIn("#dfew", ${t(TM.few - 0.3)}, 0.4); pop("#lb-few", ${t(TM.few)});
      fadeIn("#dbig", ${t(TM.few + 0.5)}, 0.4); pop("#lb-big", ${t(TM.few + 0.7)});
      // ===== L9 暗号手机 + 家属
      out("#lb-few, #lb-big", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "homeE", 1.3);
      pop("#lb-code", ${t(TM.code)}); bump("#cphone", ${t(TM.code)}, 1.06, 1);
      pop("#lb-fam", ${t(TM.emer)}); bump("#fam0, #fam1", ${t(TM.emer)}, 1.08, 1);
      // ===== L10 时间锁旁：降低 vs 不保证
      out("#lb-code, #lb-fam", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "safeE", 1.3);
      pop("#lb-tl", ${t(LS[10] + 1.4)}); pop("#lb-ok", ${t(TM.imm)}); pop("#lb-no", ${t(TM.safe10)});
      // ===== L11 人身安全第一，资产第二
      out("#lb-tl, #lb-ok, #lb-no", ${t(TM.first - 0.4)});
      pop("#rule", ${t(TM.first)}, 0.35);
      // ===== L12 镜头到 D：账号设置卡，四行 FIDO2
      out("#rule, #tg0, #tg1", ${t(LS[12] - 0.3)});
      cam(${t(LS[12])}, "acctD", 1.8);
      pop("#ac", ${t(TM.mail12)}); draw("cv-ac", ${t(TM.mail12 + 0.3)});
      [0, 1, 2, 3].forEach((i) => pop("#ac-c" + i, ${t(TM.fido)} + i * 0.2, 0.2)); bump("#fido", ${t(TM.fido)}, 1.12, 2);
      // ===== L13 短信一行划掉
      hot("#ac-r4", ${t(TM.sms)}, "#f6d3cf"); pop("#ac-c4", ${t(TM.rec)}, 0.2);
      // ===== L14 左扫到 C：号码转移锁扣到受害者 SIM 卡上
      out("#ac, #cv-ac", ${t(LS[14] - 0.2)});
      cam(${t(LS[14])}, "counterC", 1.5);
      X5.fly(tl, "pl", ${t(TM.lock)}, 130, -150, 0.8, 40); pop("#lb-pl", ${t(TM.lock + 0.8)});
      X22.chip(tl, "simV", ${t(TM.lock + 0.8)}, true, "teal"); KIT.broke(tl, "simA", ${t(TM.pin + 0.4)}, { badge: false, ghost: 0.35 });
      // ===== L15 回到 D：专用邮箱
      out("#lb-pl", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "acctD", 1.5);
      fadeIn("#mailbox-ok", ${t(TM.pmail)}, 0.4); pop("#lb-mail", ${t(TM.pmail + 0.2)});
      // ===== L16 关键人员板
      out("#lb-mail", ${t(LS[16] + 0.6)});
      grow("rb", ${t(LS[16] + 0.2)});
      // ===== L17 四张门卡依次挂上
      pop("#kp", ${t(LS[17] + 0.2)}); [0, 2, 3].forEach((i) => pop("#kp-c" + i, [${t(TM.k0)}, 0, ${t(TM.k2)}, ${t(TM.k3)}][i], 0.2)); bump("#kp-r1", ${t(TM.k1)}, 1.04, 1);
      X5.hang(tl, "rb", 0, ${t(TM.k0)}); X5.hang(tl, "rb", 1, ${t(TM.k1)}); X5.hang(tl, "rb", 2, ${t(TM.k2)}); X5.hang(tl, "rb", 3, ${t(TM.k3)});
      // ===== L18 签名人卡取下，只公开机构
      X5.hang(tl, "rb", 1, ${t(TM.hide18)}, false); pop("#kp-c1", ${t(TM.hide18)}, 0.2); hot("#kp-r1", ${t(TM.hide18)}, "#f6d3cf"); pop("#lb-org", ${t(TM.org)});
      // ===== L19 交接卡
      out("#kp, #lb-org", ${t(LS[19] - 0.2)}); pop("#ho", ${t(LS[19] + 0.3)}); [0, 1, 2].forEach((i) => pop("#ho-c" + i, ${t(TM.mfa19)} + (i ? ${f(TM.split - TM.mfa19)} + (i - 1) * 0.3 : 0), 0.2));
      // ===== L20 被盗预案三项打勾
      out("#ho", ${t(LS[20] - 0.2)});
      bump("#pb", ${t(LS[20] + 0.3)}, 1.06, 1);
      pop("#pb0", ${t(TM.c0)}); pop("#pb1", ${t(TM.c1)}); pop("#pb2", ${t(TM.c2)});
`,
});
