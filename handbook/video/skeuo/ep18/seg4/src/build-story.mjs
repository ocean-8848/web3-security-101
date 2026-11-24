// ep18/seg4「④ 看清再签」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.vaultA（BRIEF）。ends static on CAMS.desksD
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：钥匙街五个区（seg6 L13–L14 → 结束卡）
//   A            A 冷钱包金库中景：金库 + 门槛表 + 六个签名人（区全景）
//   vaultA       近景：金库 + 门槛表 + 牌子 + 点阵（seg1 起点 L0–L2；seg4 L0–L1；seg6 L9–L12）
//   signersA     A 六个签名人 + 钥匙 + 硬件钱包 + 签名界面（seg1 L3–L7）
//   walletsA     A 六台硬件钱包特写，右上留题卡位（seg1 L8–L11 终点；seg2 起点前）
//   schemesB     B 五个展柜全景（seg2 L0–L4）
//   B            
//   softB        B 软件钱包 + 硬件钱包展柜 + 助记词板 + 密码转盘（seg2 L5–L8；seg6 L5–L8）
//   multiB       B 多签 + MPC 展柜 + 拼图（seg2 L9–L12）
//   hsmB         B HSM 展柜 + 盲签表头（seg2 L13–L17）
//   keyB         B 比喻钥匙（原钥匙 + 红钥匙）+ 多签展柜（seg2 L18–L24 终点；seg3 起点前）
//   lineC        C 流水线全景（seg3 L0–L1）
//   C            
//   genC         C 生成站（seg3 L2–L10）
//   storeC       C 存储站（seg3 L11–L15）
//   releaseC     C 发布站（seg3 L16–L20）
//   backupC      C 备份站：MPC 节点 + 云账户框 + CEO（seg3 L21–L27 终点）
//   D            D 签名台全景
//   uiD          D 签名界面 vs 实际交易 + 恶意合约（seg4 L2–L10）
//   checkD       D 哈希漏斗 + 大号硬件钱包 + 放大镜 + 自己的设备 / 时钟 / 电话（seg4 L11–L17）
//   desksD       D 三个工位 + 两块来源牌（seg4 L18–L19 终点；seg5 起点前）
//   tiersE       E 三层全景：冷 / 温 / 热 + 水位 + 限额 + 用户（seg5 L0–L7）
//   E            
//   hsmE         E HSM + 签名服务器 + 风控盾牌 + 热钱包（seg5 L8–L15）
//   flowE        E 提现单 + 审批记录 + 风控链（seg5 L16–L20 终点）
//   rolesE       E 角色板（seg6 L0–L4）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

// 段内位置（世界画布 px → 地面点）
const P = (X, Y) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const CLK = P(2680, -150), INI = P(3650, 40), MG = P(2580, 330), CQ_A = P(620, -60), LT_A = P(330, 640);
// 段内镜头：checkD 的物件放在左侧，右侧留给代码卡 A
const checkL = L.fit([L.rect(L.VEND_D, "miniVend"), L.rect(L.FUNNEL_D, "hashFunnel"), L.rect(L.HW_D, "hwWallet"), L.rect(L.LAPTOP_D, "laptop"),
  L.rect(L.PHONE_D, "phone"), L.rect({ ...INI, scale: 0.45 }, "person")], [90, 280, 1220, 860], 1.0);

const S = segInit(import.meta.url, { cams: { ...L.CAMS, checkL }, ext: [E1, E3, E5, E9] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const putK = (key, o, obj, k, dy = 0, opt = {}) => {
  const [gx, gy] = at(o);
  put(key, o, obj, dy, { ...opt, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && q.length === 2 && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }
};
// 石板路（原生 SVG，最底层）
S.add(P(0, -4000), `<g id="street"><rect x="-3600" y="480" width="8600" height="160" fill="#dedad2"/><line x1="-3600" y1="480" x2="5000" y2="480" stroke="#cfcac0" stroke-width="3"/><line x1="-3600" y1="640" x2="5000" y2="640" stroke="#cfcac0" stroke-width="3"/></g>`);
// A 冷钱包金库
put("vs", L.SAFE_A, O.safe(L.SAFE_A, { id: "vs", gold: true, plate: "WazirX 冷钱包" }));
put("mt", L.METER_A, E5.thresholdMeter(L.METER_A, { id: "mt", max: 6, th: 4, thText: "6 选 4" }));
put("bdA", L.BOARD_A, E1.signBoard(L.BOARD_A, { id: "bdA", style: "plate", text: "冷钱包 · 大部分资产" }));
L.SIGNERS_A.forEach((q, i) => put(`sgA${i}`, q, O.person(q, { id: `sgA${i}`, role: "signer", scale: 0.6 })));
L.WALLETS_A.forEach((q, i) => put(`hwA${i}`, q, O.hwWallet(q, { id: `hwA${i}` })));
L.KEYS_A.forEach((q, i) => putK(`kyA${i}`, q, O.key(q, { id: `kyA${i}` }), 0.6));
putK("winA", L.UIWIN_A, O.browserWin(L.UIWIN_A, { id: "winA", title: "签名界面" }), 0.6);
const CQL = ["to", "value", "data", "op", "nonce"];
put("cqA", CQ_A, E9.cheque(CQ_A, { id: "cqA", scale: 1.5, labels: CQL, title: "交易" }), 0, { grow: true });
S.add(LT_A, S.hid("ltAw", E1.letter(LT_A, { id: "ltA", state: "attacker" }).svg), 20);
// D 签名台
const PAGE = `<rect width="380" height="300" fill="#ffffff"/><text x="24" y="46" font-size="24" font-weight="700" fill="#1c1c1c">Liminal</text>
  <rect x="24" y="78" width="332" height="124" rx="12" fill="#e6f4eb" stroke="#1f9d55" stroke-width="4"/>
  <text x="190" y="158" text-anchor="middle" font-size="50" font-weight="700" fill="#1f9d55">转账</text>
  <rect x="110" y="226" width="160" height="48" rx="10" fill="#1d93ba"/><text x="190" y="258" text-anchor="middle" font-size="24" fill="#fff">签名</text>`;
putK("win", L.UIWIN_D, O.browserWin(L.UIWIN_D, { id: "win", title: "Liminal 界面", page: PAGE }), 0.6);
put("cqU", L.CHEQUE_UI, E9.cheque(L.CHEQUE_UI, { id: "cqU", fields: Array(5).fill("filled"), labels: CQL, title: "转账" }));
put("sl", L.SEAL_D, O.seal(L.SEAL_D, { id: "sl", stamped: false }));
put("cqR", L.CHEQUE_REAL, E9.cheque(L.CHEQUE_REAL, { id: "cqR", fields: ["filled", "filled", "bad", "bad", "filled"], labels: CQL, title: "合约升级" }));
put("vm", L.VEND_D, E1.miniVend(L.VEND_D, { id: "vm", kind: "attacker" }));
putK("clk", CLK, O.clock(CLK, { id: "clk" }), 0.7);
put("fn", L.FUNNEL_D, E3.hashFunnel(L.FUNNEL_D, { id: "fn", inputs: ["to", "data"], output: "交易哈希" }));
const SCR2 = `<rect width="70" height="40" fill="#0f2a33"/>` + [46, 34, 40, 28].map((w, i) => `<rect x="5" y="${5 + i * 8.5}" width="${w}" height="4.5" rx="1" fill="#2aa3c9"/>`).join("");
putK("hw", L.HW_D, O.hwWallet(L.HW_D, { id: "hw", screenText: "0x3fa…", screen2: SCR2 }), 1.6);
put("lap", L.LAPTOP_D, O.laptop(L.LAPTOP_D, { id: "lap" }));
put("ph", L.PHONE_D, O.phone(L.PHONE_D, { id: "ph" }));
put("ini", INI, O.person(INI, { id: "ini", role: "signer", scale: 0.45 }), 0, { grow: true });
L.DESKS_D.forEach((q, i) => put(`dk${i}`, q, O.desk(q, { id: `dk${i}` })));
L.SIGNERS_D.forEach((q, i) => put(`sgD${i}`, q, O.person(q, { id: `sgD${i}`, role: "signer", scale: 0.55 })));
put("srcW", L.SRC_D[0], E1.signBoard(L.SRC_D[0], { id: "srcW", style: "plate", text: "WazirX 称", size: 36, w: 220 }), 0, { grow: true });
put("srcL", L.SRC_D[1], E1.signBoard(L.SRC_D[1], { id: "srcL", style: "plate", text: "Liminal 称", size: 36, w: 220 }), 0, { grow: true });
put("mg", MG, O.magnifier(MG, { id: "mg" }), 0, { grow: true });
// 红虚线框（单点）
const dashBox = (id, [x0, y0, x1, y1]) => S.hid(id, `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`);
S.add(L.DESKS_D[1], dashBox("spf", [2392, 316, 2710, 686]), 30);
S.add(MG, dashBox("mgx", [2508, 58, 2714, 236]), 30);
S.add(L.HW_D, dashBox("hwx", [2774, 72, 3054, 242]), 30);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const bb = (o, k, sc) => L.rect(sc ? { ...o, scale: sc } : o, k);
L.KEYS_A.forEach((q, i) => { const r = bb(q, "key"); lb(`lk${i}`, [(r[0] + r[2]) / 2, r[3] + 6], i < 5 ? "WazirX" : "Liminal", i < 5 ? "lab-cs lab-sm" : "lab-ink lab-sm", "t");
  lb(`ok${i}`, [r[0] - 6, (r[1] + r[3]) / 2], "✓", "lab-g lab-sm", "r"); });
lb("lb-hash", up(A.mt.top, 10), "同意的哈希 0x3fa…", "lab-cs lab-sm");
lb("lb-cqA", up(A.cqA.top, 8), "内容 ?", "lab-gs lab-sm");
lb("lb-pass", [240, 40], "照样通过", "lab-r lab-sm", "l");
lb("lb-see", [1816, 70], "看到：转账", "lab-g lab-sm", "r");
lb("lb-real", [2332, 140], "实际：合约升级", "lab-r lab-sm", "l");
lb("ne", [2075, 92], "≠", "lab-r", "c");
lb("ctl0", up(A.vm.top, 8), "钱包控制权 · WazirX", "lab-cs lab-sm");
lb("ctl1", up(A.vm.top, 9), "控制权 → 恶意合约", "lab-r lab-sm");
lb("lb-clk", [2680, -138], "提前 8 天", "lab-ink lab-sm", "t");
lb("sW", [3436, 542], "界面数据不一致", "lab-ink lab-sm", "t");
lb("sL", [3735, 622], "受害方 3 台机器被注入", "lab-ink lab-sm", "t");
lb("qm", [3586, 380], "?", "lab-gs", "c");
lb("lb-own", up(A.lap.top, 8), "自己的设备", "lab-cs lab-sm");
lb("lb-web", up(A.vm.top, 8), "网页 0x3fa…", "lab-gs lab-sm");
lb("lb-loc", up(A.fn.top, 10), "本机算出 0x3fa… ✓", "lab-g lab-sm");
lb("lb-f", [3058, 157], "收款地址<br>金额<br>数据<br>操作类型", "lab-ink lab-sm", "l");
lb("lb-f2", [3060, 158], "收款地址<br>金额<br>数据<br>操作类型", "lab-cs lab-sm", "l");
lb("lb-no", [2770, 160], "不签", "lab-r", "r");
lb("lb-ph", up(A.ph.top, 8), "电话确认", "lab-g lab-sm");
lb("lb-ini", up(A.ini.top, 8), "发起人 ✓", "lab-g lab-sm");
lb("lb-spf", [2551, 310], "单点", "lab-r");
lb("lb-mg", [2504, 150], "解码工具", "lab-ink lab-sm", "r");
lb("lb-mgx", [2611, 52], "新的单点", "lab-r");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1290, y: 300, w: 520 };
const card = codeCard("ca", { ...CA, head: "签名前核对的字段", tag: "示意", mono: true, rowHide: true, rows: [
  { html: "to&nbsp;&nbsp;&nbsp;&nbsp;收款地址" }, { html: "value&nbsp;金额" }, { html: "data&nbsp;&nbsp;调用数据" },
  { html: "operation 0 = CALL", chip: "例行", chipCls: "ok" }, { html: "operation 1 = DELEGATECALL", chip: "不签", chipCls: "x" }] });
const row = (i) => [CA.x - 4, codeRowY(CA.y, i)];
S.curve("cv-f", row(1), S.scr("checkL", A.hw.screen ?? A.hw.top), { color: "#2aa3c9" });
S.curve("cv-op", row(3), S.scr("checkL", A.hw.screen ?? A.hw.top), { color: "#1f9d55" });
S.curve("cv-dc", row(4), S.scr("checkL", A.vm.front ?? A.vm.top), { color: "#e0453a" });
S.curve("cv-lap", S.scr("checkL", A.lap.screen ?? A.lap.top), S.scr("checkL", A.fn.hopper ?? A.fn.top), { color: "#2aa3c9" });
S.curve("cv-ne", S.scr("uiD", [1978, 70]), S.scr("uiD", [2172, 130]), { color: "#e0453a" });
S.curve("cv-up", S.scr("uiD", [2326, 120]), S.scr("uiD", A.vm.front ?? A.vm.center), { color: "#e0453a" });
S.curve("cv-hq", S.scr("A", up(A.mt.top, 40)), S.scr("A", A.cqA.top), { color: "#8a8a8a" });
[0, 1, 2].forEach((i) => {
  S.curve(`cv-s${i}`, S.scr("desksD", A[`sgD${i}`].top), S.scr("desksD", A.dk1.screen ?? A.dk1.top), { color: "#e0453a" });
  S.curve(`cv-m${i}`, S.scr("desksD", A[`dk${i}`].screen ?? A[`dk${i}`].top), S.scr("desksD", A.mg.lens ?? A.mg.center), { color: "#e0453a" });
});
const html = card + kw("kw-q", "私钥都没泄露 <b>能转走资金吗？</b>", { x: 60, y: 120, size: 34 })
  + evt("ev-hb", `${gtag("第三方分析")} Halborn 分析 · 钥匙归属`)
  + evt("ev-cd", `${gtag("公开报道")} CoinDesk 报道 · 双方说法并列`, { top: 126 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  wz: w("WazirX", 1), lm: w("Liminal", 1), see: w("看到", 2), real: w("实际", 2), neq: w("不一样", 2),
  up: w("合约升级", 3), tr: w("转走", 3), ahead: w("提前", 4), vic: w("受害方", 6), rep: w("独立报告", 7),
  agree: w("同意", 8), hash: w("哈希", 8), which: w("哪一笔", 9), keys: w("每把钥匙", 10),
  own: w("自己的设备", 12), code: w("另一套代码", 12), calc: w("独立算", 12),
  hwS: w("硬件钱包", 13), to: w("收款地址", 13), amt: w("金额", 13), data: w("数据", 13), op: w("操作类型", 13),
  clear: w("清晰签名", 14), fld: w("字段", 14), call: w("CALL", 15), dcall: w("DELEGATECALL", 16), no: w("不签", 16),
  tel: w("电话", 17), face: w("当面", 17), ini: w("发起人", 17), share: w("共用", 18), sp: w("单点", 18),
  tool: w("解码工具", 19), nsp: w("新的单点", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "vaultA", sub: "签名人看到的，和签下的不一样",
  grid: { u0: -4500, u1: 5600, v0: -4200, v1: 5000 }, box: [-3600, -1300, 8600, 2600],   // 盖住 backupC（L0 起移）/ vaultA / A / uiD / checkD / desksD / D
  shown: [], css, html,
  terms: [
    { id: "t0", t: "合约升级", d: "把合约背后的执行代码换成另一份", at: w("合约升级", 3) },
    { id: "t1", t: "交易哈希", d: "代表一笔交易全部内容的短指纹", at: w("哈希", 8) },
    { id: "t2", t: "CALL", d: "普通调用，只在目标合约里执行", at: w("CALL", 15) },
    { id: "t3", t: "单点", d: "一处失守、全部失守的环节", at: w("单点", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 回到开头的冷钱包（题卡仍在）
      pop("#kw-q", ${t(LS[0])});
      // ===== L1 六把钥匙：五把 WazirX，一把 Liminal
      cam(${t(LS[1])}, "A", 1.2); pop("#ev-hb", ${t(LS[1] + 0.4)});
      [0, 1, 2, 3, 4].forEach((i) => pop("#lk" + i, ${t(TM.wz)} + i * 0.15, 0.25)); pop("#lk5", ${t(TM.lm)}, 0.3); bump("#lk5", ${t(TM.lm + 0.4)}, 1.15, 1);
      // ===== L2 看到的 ≠ 签下的（关键画面）
      out("#kw-q, #ev-hb, #lk0, #lk1, #lk2, #lk3, #lk4, #lk5", ${t(LS[2] - 0.2)});
      cam(${t(LS[2])}, "uiD", 1.4); pop("#lb-see", ${t(TM.see)}); pop("#lb-real", ${t(TM.real)}); KIT.stamp(tl, "sl", ${t(TM.real + 0.2)});
      draw("cv-ne", ${t(TM.neq - 0.2)}, 0.5); pop("#ne", ${t(TM.neq)});
      // ===== L3 合约升级，控制权转走
      pop("#ctl0", ${t(LS[3] + 0.2)}); draw("cv-up", ${t(TM.up + 0.3)}, 0.6); out("#ctl0", ${t(TM.tr - 0.1)}, 0.15); pop("#ctl1", ${t(TM.tr)});
      // ===== L4 恶意合约提前 8 天部署
      bump("#ctl1", ${t(LS[4] + 0.1)}, 1.1, 1); KIT.clock(tl, "clk", ${t(TM.ahead)}, 1.6, 600); pop("#lb-clk", ${t(TM.ahead)});
      // ===== L5 WazirX 称
      out("#lb-see, #lb-real, #ne, #cv-ne, #cv-up, #ctl1, #lb-clk", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "desksD", 1.4); grow("srcW", ${t(LS[5] + 0.6)}); pop("#sW", ${t(LS[5] + 1.4)}); pop("#ev-cd", ${t(LS[5] + 0.4)});
      // ===== L6 Liminal 称（并列，不打叉）
      grow("srcL", ${t(LS[6] + 0.1)}); pop("#sL", ${t(TM.vic)}); bump("#srcW", ${t(TM.vic + 1.6)}, 1.04, 1); bump("#srcL", ${t(TM.vic + 2.4)}, 1.04, 1);
      // ===== L7 没有最终独立报告
      pop("#qm", ${t(TM.rep)});
      // ===== L8 多签只认哈希
      out("#ev-cd, #qm, #sW, #sL", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "A", 1.4); X5.fill(tl, "mt", ${t(TM.agree)}, 4, 1.0); pop("#lb-hash", ${t(TM.hash)});
      // ===== L9 不管代表哪笔交易
      grow("cqA", ${t(LS[9] + 0.1)}); draw("cv-hq", ${t(LS[9] + 0.6)}, 0.5); pop("#lb-cqA", ${t(TM.which)});
      // ===== L10 每把钥匙都正常工作，红交易照样通过
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#ok" + i, ${t(TM.keys)} + i * 0.12, 0.2));
      fadeIn("#ltAw", ${t(LS[10] + 0.2)}, 0.3); X1.walk(tl, "ltA", ${t(LS[10] + 0.6)}, 1.8, [[330, 120], [110, 40]]); pop("#lb-pass", ${t(LS[10] + 2.5)});
      // ===== L11 防线在签名人这一侧
      out("#lb-hash, #lb-cqA, #cv-hq, #lb-pass, #ok0, #ok1, #ok2, #ok3, #ok4, #ok5, #ltAw", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "checkL", 1.5); pop("#lb-own", ${t(LS[11] + 1.2)});
      // ===== L12 自己的设备，另一套代码，独立算哈希
      pop("#lb-web", ${t(TM.own)}); draw("cv-lap", ${t(TM.code)}, 0.6); X3.hash(tl, "fn", ${t(TM.calc)}); pop("#lb-loc", ${t(TM.calc + 1.6)});
      // ===== L13 硬件屏幕核对字段；卡 A 第 1–3 行
      out("#cv-lap", ${t(LS[13])}); pop("#ca", ${t(LS[13])}); KIT.swap(tl, "#hw-scr", "#hw-scr2", ${t(TM.hwS)}, 0.4);
      pop("#ca-r0", ${t(TM.to)}, 0.2); pop("#ca-r1", ${t(TM.amt)}, 0.2); pop("#ca-r2", ${t(TM.data)}, 0.2);
      pop("#lb-f", ${t(TM.to + 0.2)}); draw("cv-f", ${t(TM.op)}, 0.5);
      // ===== L14 清晰签名：字段亮青蓝
      bump("#hw", ${t(LS[14] + 0.3)}, 1.05, 1); out("#lb-f", ${t(TM.fld - 0.1)}, 0.15); pop("#lb-f2", ${t(TM.fld)}); bump("#lb-f2", ${t(TM.clear)}, 1.08, 1);
      // ===== L15 例行转账 CALL
      out("#cv-f", ${t(LS[15])}); pop("#ca-r3", ${t(TM.call - 0.3)}, 0.2); pop("#ca-c3", ${t(TM.call)}); hot("#ca-r3", ${t(TM.call)}, "rgba(31,157,85,.16)"); draw("cv-op", ${t(TM.call + 0.2)}, 0.5);
      // ===== L16 DELEGATECALL 不签
      out("#cv-op", ${t(LS[16])}); pop("#ca-r4", ${t(TM.dcall)}, 0.2); hot("#ca-r4", ${t(TM.dcall + 0.3)}, "rgba(224,69,58,.16)"); draw("cv-dc", ${t(TM.dcall + 0.4)}, 0.5);
      fadeIn("#hwx", ${t(TM.no - 0.3)}, 0.3); pop("#ca-c4", ${t(TM.no)}); pop("#lb-no", ${t(TM.no)});
      // ===== L17 电话或当面确认发起人
      pop("#lb-ph", ${t(TM.tel)}); grow("ini", ${t(TM.face)}); pop("#lb-ini", ${t(TM.ini + 0.3)});
      // ===== L18 共用就是单点（反例：三条线汇到一台电脑）
      out("#ca, #cv-dc, #hwx, #lb-no, #lb-own, #lb-web, #lb-loc, #lb-f2, #lb-ph, #lb-ini", ${t(LS[18] - 0.2)});
      cam(${t(LS[18])}, "desksD", 1.4); [0, 1, 2].forEach((i) => draw("cv-s" + i, ${t(TM.share)} + i * 0.25, 0.5));
      fadeIn("#spf", ${t(TM.sp - 0.2)}, 0.3); pop("#lb-spf", ${t(TM.sp)});
      // ===== L19 共用解码工具 = 新的单点
      out("#cv-s0, #cv-s1, #cv-s2, #spf, #lb-spf", ${t(LS[19])});
      grow("mg", ${t(TM.tool - 0.5)}); pop("#lb-mg", ${t(TM.tool)}); [0, 1, 2].forEach((i) => draw("cv-m" + i, ${t(TM.tool + 0.3)} + i * 0.2, 0.5));
      fadeIn("#mgx", ${t(TM.nsp - 0.2)}, 0.3); pop("#lb-mgx", ${t(TM.nsp)});
`,
});
