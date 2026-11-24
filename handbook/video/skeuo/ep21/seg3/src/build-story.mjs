// ep21/seg3「③ 测试题与文件」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.wide（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   inviteA      A 招聘者 + 手机邀约 + 作业包裹 + 高薪牌（seg1 起点 L0–L3；seg3 L0–L2、L16–L17）
//   laptopC      C 工作电脑特写，右侧留题卡位（x > 1300）（seg1 L9–L11 终点；seg2 起点；seg3 L3；seg6 L8–L10）
//   deskC        C 三张工位 + 工作电脑 + 部署系统机柜 + 部署令牌 + 员工（seg1 L4–L8；seg2 L0–L2；seg3 L8–L14；seg6 L11–L13）
//   isoC         C 隔离环境集装箱 + 三类设备（硬件密钥 / 工作电脑 / 工位）+ 包裹（seg5 L1–L4）
//   signD        D 签名人 + 笔记本 + 多签前端 + 硬件钱包 + 门槛表（seg2 L3–L5、L10；seg3 L18–L21 终点；seg4 起点）
//   vaultD       D 金库三门比喻：金库 + 三名签名人 + 三把钥匙 + 三封信（seg2 L6–L9）
//   flowD        D 支票四角色 + 电话 + 公章 + 签名人（seg5 L5–L10）
//   meetE        E 会议桌 + 笔记本弹窗 + 高管 + 热钱包 + GrassCall（seg4 L0–L9）
//   gateB        B 门禁 + 权限板 + 匿名报告 + 离职清单 + 访问日志（seg5 L11、L13–L19 终点；seg6 起点）
//   hireB        B 护照核验 + 放大镜 + 门禁 + 攻击者（+ 点阵）（seg4 L10–L14；seg5 L12）
//   counterF     F 客服柜台 + 用户数据 + 攻击者 + 运营电脑 + 运营钱包 + 告警灯（seg4 L15–L20 终点；seg5 起点）
//   homeG        G 用户家（seg6 L0–L7）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   wide         园区全景：A → G 全部（seg2 L11–L18 终点；seg3 起点；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.signD

const R = L.world.rects, Z = L.ZONE_RECTS;
const CAMS = {
  ...L.CAMS,
  // C 浏览器三图标 + 工作电脑 + 部署系统机柜 + 硬件密钥（L4–L7）
  stealC: L.fit([R.browserC, R.laptop, R.rack, R.hwC, R.parcelC, R.token], [200, 290, 1720, 860], 1.4),
  // C 全区，右移给左侧代码卡 A 留位（L15）
  cardC: L.fit(Z.C, [780, 280, 1820, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E4, E5, E7, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
/** 不支持 opts.scale 的物件：绕地面点缩放 o.scale，并换算 anchors；hid = 外包一层透明组的 id */
const wput = (key, o, fn, opts = {}, { dy = 0, hid } = {}) => {
  const r = fn(o, { id: key, ...opts }), [gx, gy] = at(o), k = o.scale ?? 1;
  const svg = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${r.svg}</g>`;
  add(o, hid ? S.hid(hid, svg) : svg, dy);
  A[key] = Object.fromEntries(Object.entries(r.anchors).map(([n, p]) =>
    [n, Array.isArray(p) && typeof p[0] === "number" ? [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] : p]));
};
const sopt = (o, x = {}) => ({ scale: o.scale, ...x });
const T = (x, y, s, t, o = {}) => `<text x="${x}" y="${y}" font-family="Noto Sans SC, Inter, sans-serif" font-size="${s}" font-weight="${o.w ?? 800}" fill="${o.c ?? "#1c1c1c"}" text-anchor="${o.a ?? "start"}">${t}</text>`;

// A 招聘角
put("rec", L.RECRUITER, O.person(L.RECRUITER, { id: "rec", role: "attacker", scale: L.RECRUITER.scale }));
const phoneMsg = `<rect x="0" y="0" width="76" height="26" fill="#ece7dd"/>${T(38, 18, 11, "消息", { a: "middle", c: "#5f5a50" })}`;
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA",
  screen: phoneMsg + `<rect x="6" y="40" width="56" height="16" rx="8" fill="#ddd6c9"/><rect x="6" y="64" width="44" height="16" rx="8" fill="#ddd6c9"/>`,
  screen2: phoneMsg + `<rect x="4" y="36" width="68" height="62" rx="10" fill="#e8f3f7" stroke="#2aa3c9" stroke-width="2"/>` +
    T(38, 60, 13, "高薪岗位", { a: "middle", c: "#1d93ba", w: 900 }) + T(38, 84, 12, "先做个测试", { a: "middle" }) }));
put("pcA", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pcA", scale: L.PARCEL_A.scale }));
put("envA", L.ENV_A, O.envelope(L.ENV_A, { id: "envA" }));
put("hire", L.HIRE_SIGN, E1.signBoard(L.HIRE_SIGN, { id: "hire", style: "wood", text: "高薪岗位" }));
// 复盘.pdf（L18 从信封里抽出）
const pdfO = S.rel(L.ENV_A, 40, -60);
const pdf = O.doc(pdfO, { id: "pdf", title: "复盘.pdf", standing: true, w: 150, h: 190, lines: ["事故复盘", "2024"] });
const [px, py] = at(pdfO);
const gear = Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<rect x="-5" y="-26" width="10" height="12" fill="#e0453a" transform="rotate(${i * 45})"/>`; }).join("");
add(pdfO, S.hid("pdf-h", pdf.svg + `<g transform="translate(${px + 50},${py - 24})">${gear}<circle r="18" fill="#e0453a"/><circle r="7" fill="#fff"/></g>`), 30);
A.pdf = pdf.anchors;

// B / E / F / G 主物件（全景开场用）
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "入" }));
wput("rb", L.ROLEBOARD, E5.roleBoard);
put("mdesk", L.MDESK, O.desk(L.MDESK, { id: "mdesk" }));
put("mlap", L.MLAPTOP, O.laptop(L.MLAPTOP, { id: "mlap" }));
put("exec", L.EXEC, O.person(L.EXEC, { id: "exec", role: "signer", scale: L.EXEC.scale }));
put("teller", L.TELLER, E4.tellerCounter(L.TELLER, { id: "teller", scale: L.TELLER.scale }));
wput("ops", L.OPSDESK, O.desk);
put("user", L.USER, O.person(L.USER, { id: "user", role: "signer", scale: L.USER.scale }));
wput("hlap", L.HLAPTOP, O.laptop);
put("leave", L.LEAVE, O.doc(L.LEAVE, { id: "leave", title: "离职清单", standing: true }));
put("logb", L.LOGBOOK, O.ledgerBook(L.LOGBOOK, { id: "logb", scale: L.LOGBOOK.scale }));
put("rep", L.REPORT, E1.signBoard(L.REPORT, { id: "rep", style: "plate", text: "匿名报告" }));
put("hotE", L.HOTSAFE_E, O.safe(L.HOTSAFE_E, { id: "hotE", variant: "hot" }), 0, { wrap: (v) => { const [x, y] = at(L.HOTSAFE_E); return `<g transform="translate(${x},${y}) scale(0.6) translate(${-x},${-y})">${v}</g>`; } });
wput("db", L.DB, O.dbLedger, { tag: "用户数据" });
wput("opsS", L.OPSSAFE, O.safe, { variant: "hot" });
put("hph", L.HPHONE, O.phone(L.HPHONE, { id: "hph" }));
put("hhw", L.HHW, O.hwWallet(L.HHW, { id: "hhw" }));
put("app", L.APPSIGN, E1.signBoard(L.APPSIGN, { id: "app", style: "plate", text: "官方 App" }));

// C 工程师工位
put("lp", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lp", screen: O.laptopDefaultScreen({ title: "工作电脑", line: "代码" }) }));
wput("lpr", L.LAPTOP, O.laptop, { state: "attacker" }, { hid: "lpr-h", dy: 1 });
L.ENGS.forEach((o, i) => put("eng" + i, o, O.person(o, { id: "eng" + i, role: "engineer", scale: o.scale })));
L.DESKS.forEach((o, i) => wput("dk" + i, o, O.desk));
wput("rk", L.RACK, O.rack, { tag: "部署系统" });
put("tok", L.TOKEN, O.key(L.TOKEN, { id: "tok" }));
const tile = (x, lbl, icon, i) => `<g id="brw-i${i}"><rect x="${x}" y="58" width="104" height="122" rx="12" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>${icon}${T(x + 52, 166, 17, lbl, { a: "middle" })}
  <rect id="brw-x${i}" x="${x - 4}" y="54" width="112" height="130" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8" opacity="0"/></g>`;
const ICK = (x, y) => `<circle cx="${x}" cy="${y}" r="30" fill="#d9a35b" stroke="#8a5a22" stroke-width="3"/><circle cx="${x - 10}" cy="${y - 8}" r="5" fill="#5b3a14"/><circle cx="${x + 12}" cy="${y - 2}" r="5" fill="#5b3a14"/><circle cx="${x - 2}" cy="${y + 14}" r="5" fill="#5b3a14"/>`;
const IKEY = (x, y) => `<circle cx="${x - 16}" cy="${y}" r="15" fill="none" stroke="#3b3e44" stroke-width="7"/><path d="M${x - 2} ${y}H${x + 32}M${x + 22} ${y}v12M${x + 30} ${y}v9" stroke="#3b3e44" stroke-width="7" fill="none"/>`;
const IWAL = (x, y) => `<rect x="${x - 30}" y="${y - 20}" width="60" height="42" rx="8" fill="#1d93ba"/><rect x="${x + 8}" y="${y - 6}" width="26" height="16" rx="5" fill="#9fd3e5"/>`;
const page = tile(20, "cookie", ICK(72, 106), 0) + tile(138, "SSH 密钥", IKEY(190, 106), 1) + tile(256, "钱包", IWAL(308, 106), 2) +
  `<g id="brw-pw"><rect x="20" y="204" width="340" height="76" rx="12" fill="#e9f6ee" stroke="#1f9d55" stroke-width="3"/>${T(48, 252, 26, "密码 ••••••", { c: "#1f9d55", w: 900 })}</g>`;
wput("brw", L.BROWSER_C, O.browserWin, { title: "浏览器", page });
put("hwk", L.HWKEY_C, O.hwWallet(L.HWKEY_C, { id: "hwk", screenText: "登录" }));
put("iso", L.ISO, E13.container(L.ISO, { id: "iso", scale: L.ISO.scale, label: "隔离环境", tone: "teal" }));
put("shd", L.SHIELD_C, O.shield(L.SHIELD_C, { id: "shd" }));
put("pcC", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "pcC", scale: L.PARCEL_C.scale }));
// 包裹一排（L13）
for (let i = 0; i < 6; i++) { const o = S.rel(L.PARCEL_ROW, i * 75, 0); const r = E7.parcel(o, { id: "pr" + i, scale: 0.6 }); add(o, S.hid("pr" + i + "-h", r.svg)); A["pr" + i] = r.anchors; }
// 红光：作业包裹 → 工作电脑屏幕（L3）
const beam = (id, a, b, col = "#e0453a") => `<g id="${id}" opacity="0"><path d="M${a[0]} ${a[1]}Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 120} ${b[0]} ${b[1]}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/></g>`;
add(L.LAPTOP, beam("beam", A.pcC.top, A.lp.screen), 200);
// cookie 路线：浏览器 → 部署系统机柜（从硬件密钥后方绕过）（L6）
const brwFace = [(A.brw.center[0] + A.brw.top[0]) / 2, (A.brw.center[1] + A.brw.top[1]) / 2];
const rkFace = A.rk.center;
add(L.RACK, beam("ckpath", brwFace, rkFace), 400);
// 飞走的三个图标（L4 SSH / 钱包飞出画面，L6 cookie 飞到机柜）
const fly = (id, icon, p) => `<g id="${id}" opacity="0"><g transform="translate(${p[0]},${p[1]})"><circle r="40" fill="#fff6f4" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>${icon}</g></g>`;
add(L.RACK, fly("fly-ck", ICK(0, 0), [brwFace[0] - 40, brwFace[1]]) + fly("fly-ssh", IKEY(0, 0), brwFace) + fly("fly-wal", IWAL(0, 0), [brwFace[0] + 40, brwFace[1]]), 500);
// Ginco 工位外框（L12）
const gr = L.rect(L.DESKS[0], "desk");
add(L.DESKS[0], S.hid("gin-box", `<rect x="${gr[0] - 24}" y="${gr[1] - 20}" width="${gr[2] - gr[0] + 48}" height="${gr[3] - gr[1] + 40}" rx="18" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="16 10"/>`), 300);
// Ginco → DMM 的交易（L9）：信封从 Ginco 工位出发，途中变红
const ltrO = S.rel(L.DESKS[0], 90, 110);
put("ltr", ltrO, E1.letter(ltrO, { id: "ltr" }), 2);
const lr = E1.letter(ltrO, { id: "ltrr", state: "attacker" }); add(ltrO, S.hid("ltrr-h", lr.svg), 3);
const [lx, ly] = at(ltrO), LPATH = [[lx - 120, ly + 110], [lx - 60, ly + 230]];
// 点阵：C 31 点（每点约 1000 万美元），D 50 点（每点约 100 万美元）
const dots = (id, o, n, per, gap, r) => { const [gx, gy] = at(o); let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${gx + 14 + (i % per) * gap}" cy="${gy + 14 + Math.floor(i / per) * gap}" r="${r}" fill="#e0453a" opacity="0"/>`; add(o, `<g id="${id}">${s}</g>`, 600); return [gx, gy]; };
const dC = dots("dc", L.DOTS_C, 31, 11, 36, 11);
// D 签名室
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", plate: "多签金库" }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter" }));
L.SIGNERS.forEach((o, i) => put("sg" + i, o, O.person(o, { id: "sg" + i, role: "signer", scale: o.scale })));
L.HWS_D.forEach((o, i) => put("hwd" + i, o, O.hwWallet(o, { id: "hwd" + i })));
const simScr = O.laptopDefaultScreen({ title: "多签前端", line: "模拟 ✓", btn: "#1f9d55" });
L.LAPTOPS_D.forEach((o, i) => { wput("ld" + i, o, O.laptop, { screen: simScr }); wput("ldr" + i, o, O.laptop, { state: "attacker", screen: simScr }, { hid: "ldr" + i + "-h", dy: 1 }); });
wput("fe", L.FRONTEND, O.browserWin, { title: "多签前端" });
add(L.FRONTEND, L.LAPTOPS_D.map((o, i) => { const a = A["ld" + i].top, b = A.fe.center; return `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="10 8" fill="none" opacity="0.7"/>`; }).join(""), -5);
const dD = dots("dd", L.DOTS_D, 50, 10, 34, 9);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-job", up(A.pcA.top, 10), "GitHub 项目 / Python 脚本", "lab-ink lab-sm");
lb("lb-ext", up(A.lp.top, 10), "工作电脑 + 外部代码", "lab-r");
lb("lb-hw", up(A.hwk.top, 14), "硬件密钥", "lab-cs lab-sm", "l");
lb("lb-login", [A.hwk.top[0] + 10, A.hwk.top[1] + 30], "✓ 只守登录这一步", "lab-gs lab-sm", "t");
lb("lb-rk", up(A.rk.top, 8), "cookie 直接进门", "lab-r lab-sm");
lb("lb-gin", up(A.dk0.top, 8), "Ginco · 钱包软件供应商", "lab-ink lab-sm");
lb("lb-gin2", [gr[0] - 30, (gr[1] + gr[3]) / 2], "攻击面", "lab-cs", "r");
lb("lb-dmm", [LPATH[1][0], LPATH[1][1] + 20], "DMM Bitcoin 的交易", "lab-r lab-sm", "t");
lb("lb-dc", [dC[0] + 200, dC[1] + 140], "每点约 1000 万美元 · 约 3.05 亿美元", "lab-r lab-sm", "t");
lb("lb-30k", up(A.pr5.top, 30), "至少 3 万台设备", "lab-r", "b");
lb("lb-zip", up(A.envA.top, 6), "zip", "lab-ink lab-sm");
lb("lb-pdf", up(A.pdf.top, 12), "复盘.pdf · 其实是 macOS 后门", "lab-r lab-sm");
lb("lb-fe", up(A.fe.top, 10), "显示被改写", "lab-r lab-sm");
lb("lb-sim", up(A.ld1.top, 14), "模拟 ✓", "lab-gs");
lb("lb-simx", up(A.ld1.top, 14), "✗ 模拟结果也是假的", "lab-r");
lb("lb-dd", [dD[0] + 160, dD[1] + 180], "每点约 100 万美元 · 约 5000 万美元", "lab-r lab-sm", "t");
lb("lb-mand", up(A.vault.top, 16), `多签所有权被转走 · Mandiant 归因`, "lab-r lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 300, w: 700 };
const card = codeCard("ca", { ...CA, head: "打开项目就可能执行代码", tag: "示意", rows: [
  { html: "<code>.vscode/tasks.json</code> 打开文件夹即运行" },
  { html: "<code>package.json</code> 安装后自动运行" },
  { html: "<code>Docker 镜像</code> 启动即运行" },
  { html: "防线：受限模式打开陌生项目" },
] });
S.curve("cv-a0", [CA.x + CA.w + 4, codeRowY(CA.y, 0)], S.scr("cardC", A.pcC.top), { color: "#e0453a" });
S.curve("cv-a3", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("cardC", A.iso.top), { color: "#1f9d55" });
const html = card +
  evt("ev-dmm", `<b>DMM Bitcoin · 2024 年</b><div>日本警察厅通报</div><div id="ev-dmm-2" class="hide">FBI、日本警察厅等联合归因</div>`, { color: "#e0453a" }) +
  evt("ev-30k", `<b>多国机构联合告警</b><div>美国国防部网络犯罪中心等</div>`, { top: 128 }) +
  evt("ev-rad", `<b>Radiant Capital · 2024 年</b><div>SecurityWeek 报道</div>`, { color: "#e0453a", top: 136 });
const css = `#ca-r3 { color: #1f9d55; font-weight: 900; } #ca code { font-family: "JetBrains Mono", monospace; font-weight: 700; margin-right: 10px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  ssh: w("SSH", 4), wal: w("钱包", 4), notpw: w("不是密码", 5), mfa: w("多因素认证", 6), only: w("只保护", 7),
  edit: w("篡改", 9), joint: w("联合归因", 11), cfg: w("配置文件", 15), dev3: w("3 名", 18), sim: w("交易模拟", 20), fake: w("也是假的", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "wide", sub: "偷的不是密码，是会话",
  grid: { u0: -3100, u1: 15900, v0: -9700, v1: 9700 }, box: [-1200, -5500, 12900, 7500],   // 盖住上段终点 wide + inviteA / laptopC / deskC / C / signD
  shown: [], css, html,
  terms: [
    { id: "t0", t: "后门", d: "让攻击者远程控制电脑的程序", at: w("后门", 4) },
    { id: "t3", t: "SSH 密钥", d: "登录服务器用的密钥文件", at: w("SSH", 4), low: true },
    { id: "t1", t: "多因素认证", d: "登录时除了密码再验一样东西", at: w("多因素认证", 6) },
    { id: "t2", t: "交易模拟", d: "签名前预演交易结果", at: w("交易模拟", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      var LP = ${JSON.stringify(LPATH)};
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 假招聘和假面试：全景推到 A
      cam(${t(LS[0])}, "inviteA", 1.4);
      // ===== L1 手机消息气泡 + 高薪牌
      KIT.swap(tl, "#phA-scr", "#phA-scr2", ${t(LS[1] + 0.4)}); bump("#hire", ${t(LS[1] + 1.6)}, 1.08, 1);
      // ===== L2 作业包裹：GitHub 项目 / Python 脚本
      pop("#lb-job", ${t(LS[2] + 0.3)}, 0.25); bump("#pcA", ${t(LS[2] + 0.4)}, 1.12, 1);
      // ===== L3 工作电脑上运行外部代码
      out("#lb-job", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "laptopC", 1.6);
      fadeIn("#beam", ${t(LS[3] + 2.0)}, 0.4); fadeIn("#lpr-h", ${t(LS[3] + 2.6)}, 0.6); pop("#lb-ext", ${t(LS[3] + 2.9)}, 0.25);
      // ===== L4 后门回连，偷走 cookie / SSH 密钥 / 钱包
      out("#lb-ext, #beam", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "stealC", 1.2);
      [0, 1, 2].forEach((i) => fadeIn("#brw-x" + i, ${t(LS[4] + 1.4)} + i * 0.4, 0.2));
      fadeIn("#fly-ssh", ${t(TM.ssh)}, 0.2); tl.to("#fly-ssh", { x: -520, y: -260, opacity: 0, duration: 1.0, ease: "power2.in" }, ${t(TM.ssh + 0.4)});
      fadeIn("#fly-wal", ${t(TM.wal)}, 0.2); tl.to("#fly-wal", { x: -520, y: -180, opacity: 0, duration: 1.0, ease: "power2.in" }, ${t(TM.wal + 0.4)});
      tl.to("#brw-i1, #brw-i2", { opacity: 0.25, duration: 0.3 }, ${t(TM.wal + 1.2)});
      // ===== L5 偷的是 cookie，不是密码
      bump("#brw-i0", ${t(LS[5] + 0.4)}, 1.12, 2); tl.to("#brw-pw", { opacity: 0.25, duration: 0.4 }, ${t(TM.notpw)});
      // ===== L6 关键画面：cookie 绕过硬件密钥，直接进部署系统
      pop("#lb-hw", ${t(LS[6] + 0.3)}, 0.25); fadeIn("#ckpath", ${t(LS[6] + 0.8)}, 0.4);
      fadeIn("#fly-ck", ${t(LS[6] + 0.8)}, 0.2); tl.to("#fly-ck", { x: ${f(rkFace[0] - brwFace[0] + 40)}, y: ${f(rkFace[1] - brwFace[1])}, duration: 1.4, ease: "power2.inOut" }, ${t(LS[6] + 1.1)});
      tl.to("#brw-i0", { opacity: 0.25, duration: 0.3 }, ${t(LS[6] + 1.1)});
      [0, 1, 2].forEach((i) => KIT.led(tl, "rk-led-" + i, ${t(LS[6] + 2.5)} + i * 0.1, "red")); pop("#lb-rk", ${t(LS[6] + 2.6)}, 0.25);
      // ===== L7 硬件密钥只保护登录这一步
      pop("#lb-login", ${t(TM.only)}, 0.25); flash("#ckpath", ${t(LS[7] + 0.6)}, 2, 0.3);
      // ===== L8 Ginco 员工运行测试脚本
      out("#lb-hw, #lb-login, #lb-rk, #fly-ck, #ckpath", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "deskC", 1.3);
      pop("#lb-gin", ${t(LS[8] + 1.6)}, 0.25); pop("#ev-dmm", ${t(LS[8] + 2.0)}, 0.3);
      // ===== L9 用偷来的会话篡改 DMM 的交易：信封途中变红
      X1.walk(tl, "ltr", ${t(LS[9] + 1.0)}, 2.4, LP, "power1.inOut"); X1.walk(tl, "ltrr", ${t(LS[9] + 1.0)}, 2.4, LP, "power1.inOut");
      fadeIn("#ltrr-h", ${t(TM.edit)}, 0.4); out("#ltr", ${t(TM.edit + 0.2)}, 0.3); pop("#lb-dmm", ${t(TM.edit + 0.8)}, 0.25);
      // ===== L10 约 3.05 亿美元：红点阵
      out("#lb-dmm", ${t(LS[10] - 0.2)}); tl.to("#dc circle", { opacity: 1, duration: 0.12, stagger: 0.03 }, ${t(LS[10] + 0.2)}); pop("#lb-dc", ${t(LS[10] + 1.3)}, 0.25);
      // ===== L11 联合归因
      fadeIn("#ev-dmm-2", ${t(TM.joint - 0.3)}, 0.3);
      // ===== L12 供应商员工也是攻击面
      out("#lb-dc, #dc, #ltrr-h", ${t(LS[12] - 0.2)}); fadeIn("#gin-box", ${t(LS[12] + 0.3)}, 0.3); pop("#lb-gin2", ${t(LS[12] + 1.2)}, 0.25);
      // ===== L13 规模化：镜头拉开，地面排出一排包裹
      out("#lb-gin, #lb-gin2, #gin-box, #ev-dmm", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "C", 1.2);
      [0, 1, 2, 3, 4, 5].forEach((i) => fadeIn("#pr" + i + "-h", ${t(LS[13] + 1.0)} + i * 0.15, 0.2));
      // ===== L14 至少 3 万台设备
      pop("#ev-30k", ${t(LS[14] + 0.3)}, 0.3); pop("#lb-30k", ${t(LS[14] + 4.0)}, 0.25);
      // ===== L15 代码卡 A：打开项目时配置文件就可能自动执行
      out("#lb-30k, #ev-30k", ${t(LS[15] - 0.2)}); cam(${t(LS[15])}, "cardC", 1.0);
      pop("#ca", ${t(LS[15] + 1.2)}, 0.3); hot("#ca-r0", ${t(TM.cfg)}, "#fde6e3"); draw("cv-a0", ${t(TM.cfg + 0.2)});
      draw("cv-a3", ${t(TM.cfg + 2.2)}); bump("#iso", ${t(TM.cfg + 2.6)}, 1.06, 1);
      // ===== L16 文件也能做同样的事：回到 A，zip 邮包
      out("#ca, #cv-a0, #cv-a3", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "inviteA", 1.4); pop("#lb-zip", ${t(LS[16] + 1.3)}, 0.25);
      // ===== L17 Radiant Capital，Telegram 上的 zip
      pop("#ev-rad", ${t(LS[17] + 0.3)}, 0.3); bump("#envA", ${t(LS[17] + 3.0)}, 1.1, 1);
      // ===== L18 复盘 PDF 里是 macOS 后门 → 签名室三台笔记本变红
      fadeIn("#pdf-h", ${t(LS[18] + 0.3)}, 0.4); pop("#lb-pdf", ${t(LS[18] + 1.0)}, 0.25);
      out("#lb-pdf, #lb-zip", ${t(TM.dev3 - 0.6)}); cam(${t(TM.dev3 - 0.4)}, "signD", 1.6);
      [0, 1, 2].forEach((i) => fadeIn("#ldr" + i + "-h", ${t(TM.dev3 + 1.4)} + i * 0.35, 0.4));
      // ===== L19 改写了多签前端的显示
      KIT.broke(tl, "fe", ${t(LS[19] + 0.6)}, { badge: false, ghost: 1 }); pop("#lb-fe", ${t(LS[19] + 1.0)}, 0.25);
      // ===== L20 硬件钱包 + 交易模拟，模拟结果也是假的
      [0, 1, 2].forEach((i) => bump("#hwd" + i, ${t(LS[20] + 0.6)} + i * 0.12, 1.1, 1));
      pop("#lb-sim", ${t(TM.sim + 0.2)}, 0.25); out("#lb-sim", ${t(TM.fake - 0.1)}, 0.15); pop("#lb-simx", ${t(TM.fake)}, 0.25);
      // ===== L21 多签所有权被转走，约 5000 万美元
      out("#ev-rad, #lb-fe, #lb-simx", ${t(LS[21] - 0.2)}); KIT.door(tl, "vault", ${t(LS[21] + 0.2)}, 105, 1.0);
      tl.to("#dd circle", { opacity: 1, duration: 0.1, stagger: 0.02 }, ${t(LS[21] + 0.6)}); pop("#lb-dd", ${t(LS[21] + 1.8)}, 0.25); pop("#lb-mand", ${t(LS[21] + 2.2)}, 0.25);
`,
});
