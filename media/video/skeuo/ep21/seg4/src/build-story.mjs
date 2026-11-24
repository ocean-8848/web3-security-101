// ep21/seg4「④ 会议与身份」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.signD（BRIEF）。
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
// ends static on CAMS.counterF
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { applyM } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内专用镜头：E 笔记本特写（弹窗读得清）；B 门禁 + 权限板 + 点阵
const R = L.world.rects;
const CAMS = {
  ...L.CAMS,
  zoomE: L.fit([R.mlaptop], [300, 200, 1620, 880], 2.4),
  boardB: L.fit([R.gate, R.board, R.passB, R.atkB, R.dotsB], [100, 280, 1820, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E4, E5, E7, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
/** 绕地面点缩放（不支持 opts.scale 的物件），并换算 anchors */
const putK = (key, o, r, k, dy = 0, hid = false) => {
  const [gx, gy] = at(o);
  const wrap = (svg) => { const g = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hid ? S.hid(key + "-w", g) : g; };
  put(key, o, r, dy, { wrap });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k]; }
};
/** 原生点阵（屏幕平面），每个点 = 一个单位 */
const dots = (gid, o, n, cols, gap, r, color = "#e0453a", op = 0) => {
  const [gx, gy] = at(o), c = [];
  for (let i = 0; i < n; i++) c.push(`<circle cx="${gx + (i % cols) * gap}" cy="${gy + Math.floor(i / cols) * gap}" r="${r}" fill="${color}" opacity="${op}"/>`);
  add(o, `<g id="${gid}">${c.join("")}</g>`, 30);
  return [gx, gy];
};
const P = (q) => ({ u: q.u, v: q.v });

// ---------------------------------------------------------------- 石板路（最底层）
{
  const { u0, u1, v0, v1 } = L.ROAD, pts = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => Wp(u, v).map((x) => f(x)).join(",")).join(" ");
  add({ u: 0, v: -20000 }, `<polygon points="${pts}" fill="#dedad2" stroke="#cdc7bb" stroke-width="3"/>`);
}

// ---------------------------------------------------------------- D 签名室（上段终点 signD 的样子）
put("vlt", L.VAULT, O.safe(L.VAULT, { id: "vlt", plate: "多签金库", open: 105 }));
put("tmD", L.METER, E5.thresholdMeter(L.METER, { id: "tmD", level: 3 }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: q.scale })));
L.LAPTOPS_D.forEach((q, i) => putK("lpD" + i, q, O.laptop(q, { id: "lpD" + i, state: "attacker" }), q.scale));
L.HWS_D.forEach((q, i) => put("hwD" + i, q, O.hwWallet(q, { id: "hwD" + i })));
putK("fe", L.FRONTEND, O.browserWin(L.FRONTEND, { id: "fe", title: "多签前端" }), L.FRONTEND.scale);
dots("dD", L.DOTS_D, 50, 10, 34, 10, "#e0453a", 1);   // 上段 L21 的 50 点留在原处

// ---------------------------------------------------------------- E 会议室
const SW = 222, SH = 146;
const tile = (x, body) => `<rect x="${x}" y="18" width="102" height="44" rx="3" fill="#3a3d43"/>
  <circle cx="${x + 51}" cy="33" r="8" fill="${body}"/><path d="M${x + 33} 62 Q${x + 33} 44 ${x + 51} 44 Q${x + 69} 44 ${x + 69} 62Z" fill="${body}"/>`;
const meetScr = `<rect x="0" y="0" width="${SW}" height="${SH}" fill="#202226"/>
  <rect x="0" y="0" width="${SW}" height="13" fill="#2e3136"/><circle cx="8" cy="6.5" r="3" fill="#e0453a"/><circle cx="17" cy="6.5" r="3" fill="#c9c3b7"/><circle cx="26" cy="6.5" r="3" fill="#1f9d55"/>
  ${tile(6, "#9aa0a8")}${tile(114, "#e0453a")}
  <g id="mlpop" opacity="0"><rect x="26" y="70" width="170" height="70" rx="7" fill="#f4f5f6" stroke="#8d939b" stroke-width="1.2"/>
    <rect x="34" y="78" width="14" height="14" rx="3" fill="#2d8cff"/>
    <text x="54" y="90" font-family="Noto Sans SC, sans-serif" font-size="12.5" font-weight="900" fill="#1c1c1c">Zoom 请求控制你的屏幕</text>
    <rect x="46" y="110" width="58" height="22" rx="5" fill="#c9c3b7"/><text x="75" y="125" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="12" fill="#fff">拒绝</text>
    <g id="mlok"><rect x="118" y="110" width="58" height="22" rx="5" fill="#2d8cff"/><text x="147" y="125" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="12" fill="#fff">同意</text></g></g>`;
put("mdk", L.MDESK, O.desk(L.MDESK, { id: "mdk" }));
put("ml", L.MLAPTOP, O.laptop(L.MLAPTOP, { id: "ml", screen: meetScr }));
put("exe", L.EXEC, O.person(L.EXEC, { id: "exe", role: "signer", scale: L.EXEC.scale }));
putK("hsE", L.HOTSAFE_E, O.safe(L.HOTSAFE_E, { id: "hsE", variant: "hot" }), L.HOTSAFE_E.scale);
{ const q = S.rel(L.HOTSAFE_E, 40, 120); putK("kyE", q, O.key(q, { id: "kyE" }), 0.5, 40, true); }
put("gc", L.GRASS, E7.parcel(L.GRASS, { id: "gc", scale: L.GRASS.scale }), 0, { grow: true });
{ const [x, y] = S.up(A.gc.top, 10);
  add(L.GRASS, S.hid("bug", `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="13" ry="17" fill="#e0453a" stroke="#8f2620" stroke-width="2"/><circle cx="0" cy="-20" r="8" fill="#c23a30"/>
    <path d="M-12 -8L-24 -14M-13 2L-26 2M-12 12L-24 18M12 -8L24 -14M13 2L26 2M12 12L24 18" stroke="#8f2620" stroke-width="3" stroke-linecap="round"/></g>`), 50); }
const scrW = (x, y) => applyM(A.ml.screenM, 9 + x, 11 + y);   // 笔记本屏幕本地点 → 世界画布点

// ---------------------------------------------------------------- B 门禁与人事
put("gtB", L.GATE, O.checkpoint(L.GATE, { id: "gtB", n: "入" }));
putK("rbB", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rbB", title: "ACCESS", plates: ["仓库", "云", "CI", "合约"], holders: [null, null, null, null], delays: [null, null, null, null], empty: [3], colors: [null, null, null, "#e0453a"] }), L.ROLEBOARD.scale);
put("psB", L.PASS_B, E13.passport(L.PASS_B, { id: "psB", scale: L.PASS_B.scale, title: "护照", fields: ["姓名", "履历", "所在地"], state: "attacker" }), 0, { grow: true });
const ATK0 = { u: L.GATE.u - 280, v: L.GATE.v + 40 }, ATK_DU = 560;
put("atkB", ATK0, O.person(ATK0, { id: "atkB", role: "attacker", scale: 0.5 }), 0, { grow: true });
{ const q = { u: ATK0.u + ATK_DU + 40, v: ATK0.v + 60 }; put("kcB", q, E5.keycard(q, { id: "kcB", scale: 0.45, z: 40, text: "开发", color: "#1d93ba" }), 0, { wrap: (s) => S.hid("kcB-w", s) }); }
const dB = dots("dB", L.DOTS_B, 74, 15, 28, 9);

// ---------------------------------------------------------------- F 客服柜台
put("tlr", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tlr", scale: L.TELLER.scale, sign: "客服", cash: 0 }));
putK("dbF", L.DB, O.dbLedger(L.DB, { id: "dbF" }), L.DB.scale);
put("atkF", L.ATK_F, O.person(L.ATK_F, { id: "atkF", role: "attacker", scale: L.ATK_F.scale }));
const opsScr2 = `<rect x="0" y="0" width="148" height="88" fill="#ffffff"/><rect x="0" y="0" width="148" height="16" fill="#ece7dd"/>
  <rect x="18" y="22" width="112" height="56" rx="6" fill="#fff3d6" stroke="#c9a64a" stroke-width="2"/><text x="74" y="56" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="900" fill="#1c1c1c">兼职</text>
  <g id="opsRed" opacity="0"><rect x="0" y="0" width="148" height="88" fill="#e0453a"/><text x="74" y="56" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="900" fill="#fff">!</text></g>`;
putK("ops", L.OPSDESK, O.desk(L.OPSDESK, { id: "ops", screen2: opsScr2 }), L.OPSDESK.scale);
putK("opsS", L.OPSSAFE, O.safe(L.OPSSAFE, { id: "opsS", variant: "hot" }), L.OPSSAFE.scale);
put("bcF", L.BEACON_F, O.beacon(L.BEACON_F, { id: "bcF" }));
const dF = dots("dF", L.DOTS_F, 44, 11, 27, 9);
// 现金：攻击者手边 → 柜台递钞口
const CASH0 = S.up(A.atkF.ground, 70);
add(L.ATK_F, S.hid("cash", `<g transform="translate(${CASH0[0]},${CASH0[1]})">${[0, 1, 2].map((i) => `<path d="M-22 ${-i * 7}l22 -11l22 11l-22 11z" fill="#3fae6a" stroke="#1d6e40" stroke-width="1.5"/>`).join("")}</g>`), 60);
const CASH_D = [A.tlr.slot[0] - CASH0[0], A.tlr.slot[1] - CASH0[1]];
// 导出的数据纸摞
const DB0 = S.up(A.dbF.top, 0);
add(L.DB, S.hid("dbx", `<g transform="translate(${DB0[0]},${DB0[1]})">${[0, 1, 2].map((i) => `<g transform="translate(${i * 6},${-i * 6})"><rect x="-26" y="-34" width="52" height="66" rx="3" fill="#ffffff" stroke="#8d939b" stroke-width="1.5"/><path d="M-16 -18h32M-16 -6h32M-16 6h22" stroke="#c3352b" stroke-width="3"/></g>`).join("")}</g>`), 80);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-exe", S.up(A.exe.top, 6), "高管", "lab-ink lab-sm");
lb("nmA", scrW(165, 54), "财经媒体", "lab-sm", "c");
lb("nmB", scrW(165, 54), "Zoom", "lab-rs lab-sm", "c");
lb("lb-dl", S.up(A.ml.front, -30), "下载专用会议软件", "lab-g lab-sm", "t");
lb("lb-rc", S.up(A.ml.front, -86), "申请远程控制", "lab-g lab-sm", "t");
lb("lb-sys", S.up(A.ml.top, 4), "看起来像系统提示", "lab-ink lab-sm");
lb("lb-hs", S.up(A.hsE.top, 6), "钱包 / 密码管理器", "lab-r lab-sm");
lb("lb-gc", S.up(A.gc.top, 6), "GrassCall 会议软件", "lab-ink lab-sm");
lb("lb-tro", S.up(A.gc.top, 56), "窃密木马", "lab-rs lab-sm");
lb("lb-ps", S.up(A.psB.top, 6), "盗用 / 伪造的身份", "lab-r lab-sm");
lb("lb-chk", [A.psB.center[0] + 40, A.psB.center[1]], "没有核验", "lab-g lab-sm", "l");
lb("lb-kc", S.up(A.kcB.top, 30), "远程开发岗位", "lab-cs lab-sm");
lb("lb-rb", S.up(A.rbB.top, 6), "权限板", "lab-ink lab-sm");
lb("lb-rb3", S.up(A.rbB.cards[3], -40), "合约发布", "lab-rs lab-sm", "t");
lb("lg-B", [dB[0] - 10, dB[1] - 24], "每点约 1 万美元 · 约 74 万美元", "lab-r lab-sm", "l");
lb("lb-allB", [dB[0] - 10, dB[1] + 5 * 28 + 10], "全案约 91.5 万美元", "lab-ink lab-sm", "l");
lb("lb-tlr", S.up(A.tlr.top, 6), "海外外包客服", "lab-cs lab-sm");
lb("lb-db", S.up(A.dbF.top, 90), "约 7 万名用户", "lab-r lab-sm");
lb("lb-ops", S.up(A.ops.ground, -10), "运营电脑", "lab-ink lab-sm", "t");
lb("lb-opsS", S.up(A.opsS.top, 6), "运营钱包", "lab-ink lab-sm");
lb("lg-F", [dF[0] - 10, dF[1] - 24], "每点约 100 万美元 · 约 4400 万美元", "lab-r lab-sm", "l");
lb("lb-pol", [dF[0] - 10, dF[1] + 4 * 27 + 10], "当地警方称 · 员工不知情", "lab-ink lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const EV = (i, id, h, c) => evt(id, h, { color: c, top: 120 + i * 4 });
const SR = (i, id, h) => evt(id, h, { color: "#8d939b", top: 204 + i * 4 });
let html = [
  EV(0, "ev1", "<b>ELUSIVE COMET</b> · 2025 年 4 月", "#e0453a"), SR(0, "sr1", "来源 · Trail of Bits"),
  EV(1, "ev2", "<b>GrassCall</b> · 2025 年 2 月", "#e0453a"), SR(1, "sr2", "来源 · BleepingComputer 报道"),
  EV(2, "ev3", "<b>冒名受雇</b> · 2025 年 6 月起诉", "#e0453a"), SR(2, "sr3", "来源 · 美国司法部新闻稿"),
  EV(3, "ev4", "<b>Coinbase</b> · 2025 年 5 月", "#e0453a"), SR(3, "sr4", "来源 · Coinbase 估算"),
  EV(4, "ev5", "<b>CoinDCX</b> · 2025 年 7 月", "#e0453a"), SR(4, "sr5", "来源 · Cointelegraph 报道"),
].join("");
html += `<div class="rng hide" id="rng"><div class="rng-t">成本</div><div class="rng-bar"><span class="rng-k l"></span><span class="rng-k r"></span></div>
  <div class="rng-v"><span>约 1.8 亿</span><span>约 4 亿美元</span></div></div>`;
const css = `
    .rng { position: absolute; left: 1160px; top: 330px; width: 600px; background: #ffffff; border-radius: 16px; padding: 14px 28px 16px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .rng-t { font-size: 28px; font-weight: 900; color: #1c1c1c; }
    .rng-bar { position: relative; height: 18px; margin: 18px 10px 8px; background: #2aa3c9; border-radius: 9px; }
    .rng-k { position: absolute; top: -10px; width: 6px; height: 38px; background: #1c1c1c; border-radius: 3px; }
    .rng-k.l { left: -3px; } .rng-k.r { right: -3px; }
    .rng-v { display: flex; justify-content: space-between; font-size: 30px; font-weight: 900; color: #1d93ba; }`;

// 关键画面曲线：弹窗里的"Zoom" → 视频格名牌"Zoom"（镜头 zoomE 静止期间）
S.curve("cvZ", S.scr("zoomE", scrW(66, 78)), S.scr("zoomE", scrW(165, 66)), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  media: w("媒体", 1), dl: w("下载", 2), rc: w("远程控制", 2), rename: w("改成", 4), sys: w("系统提示", 5),
  ok: w("同意", 7), wallet: w("钱包", 7), trojan: w("窃密木马", 9), fake: w("盗用", 11), edit: w("修改", 13),
  all: w("全案", 14), cash: w("现金", 16), cs: w("客服", 16), exp: w("导出", 17), job: w("兼职", 19), mal: w("恶意软件", 19), pol: w("警方", 20),
};
const t = (x) => f(x);
const FLY = (gid, t0, dx, dy, d) => `X5.fly(tl, "${gid}", ${t(t0)}, ${f(dx)}, ${f(dy)}, ${d}, 30);`;

S.build({
  cam0: "signD", sub: "弹窗里的 Zoom，只是个名字",
  grid: { u0: -600, u1: 12700, v0: -6300, v1: 6700 }, box: [0, -3800, 10200, 4500],   // 盖住上段终点 signD + meetE / hireB / counterF
  shown: [], css, html,
  terms: [
    { id: "t0", t: "路演", d: "向投资人介绍项目的会议", at: w("路演", 1) },
    { id: "t1", t: "窃密木马", d: "偷取密码和钱包的恶意程序", at: w("窃密木马", 9) },
    { id: "t2", t: "冒名受雇", d: "用盗用或伪造身份获得岗位", at: w("冒名受雇", 13) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 第二种手法，是一个会议。 D → E
      cam(${t(LS[0] + 0.1)}, "meetE", 2.0); pop("#lb-exe", ${t(LS[0] + 1.9)}, 0.25);
      // ===== L1 冒充媒体或投资机构，访谈或路演
      pop("#nmA", ${t(TM.media)}, 0.25);
      // ===== L2 下载专用会议软件 / 申请远程控制
      pop("#lb-dl", ${t(TM.dl)}, 0.25); pop("#lb-rc", ${t(TM.rc)}, 0.25);
      // ===== L3 Trail of Bits 公开
      pop("#ev1", ${t(LS[3] + 0.2)}); pop("#sr1", ${t(LS[3] + 1.2)});
      // ===== L4 显示名改成 Zoom（笔记本特写）
      out("#lb-dl, #lb-rc, #lb-exe", ${t(LS[4] - 0.2)}); cam(${t(LS[4])}, "zoomE", 1.2);
      KIT.swap(tl, "#nmA", "#nmB", ${t(TM.rename + 0.3)}, 0.3); bump("#nmB", ${t(TM.rename + 0.7)}, 1.15, 1);
      // ===== L5 弹窗像系统提示
      fadeIn("#mlpop", ${t(LS[5] + 0.1)}, 0.3); pop("#lb-sys", ${t(TM.sys)}, 0.25);
      // ===== L6 关键画面：弹窗里的 Zoom 只是参会者名字
      draw("cvZ", ${t(LS[6] + 0.2)}, 0.8); bump("#nmB", ${t(LS[6] + 1.1)}, 1.2, 2);
      // ===== L7 点同意 → 钱包打开，钥匙飞出
      flash("#mlok", ${t(TM.ok)}, 2, 0.3);
      out("#cvZ, #lb-sys, #ev1, #sr1", ${t(LS[7] + 0.9)}); cam(${t(LS[7] + 1.1)}, "meetE", 1.0);
      KIT.door(tl, "hsE", ${t(TM.wallet)}, 100, 0.8); fadeIn("#kyE-w", ${t(TM.wallet + 0.5)}, 0.2);
      ${FLY("kyE-w", TM.wallet + 0.6, 260, -160, 0.8)} pop("#lb-hs", ${t(TM.wallet + 0.4)}, 0.25);
      // ===== L8 假的 Web3 职位
      out("#lb-hs", ${t(LS[8] - 0.2)}); pop("#ev2", ${t(LS[8] + 0.2)}); pop("#sr2", ${t(LS[8] + 1.0)});
      grow("gc", ${t(LS[8] + 0.6)}); pop("#lb-gc", ${t(LS[8] + 1.1)}, 0.25);
      // ===== L9 GrassCall 包裹变红，冒出窃密木马
      X7.parcelLabel(tl, "gc", ${t(LS[9] + 1.0)}, "red"); fadeIn("#bug", ${t(TM.trojan)}, 0.3); pop("#lb-tro", ${t(TM.trojan + 0.1)}, 0.25);
      // ===== L10 把人直接送进公司：E → B
      out("#ev2, #sr2, #lb-gc, #lb-tro, #nmB, #bug", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "hireB", 2.0);
      grow("atkB", ${t(LS[10] + 1.9)}); grow("psB", ${t(LS[10] + 2.3)});
      // ===== L11 盗用 / 伪造身份应聘远程开发：护照翻开没核验，穿过道闸，拿到门卡
      pop("#lb-ps", ${t(TM.fake)}, 0.25); X13.cover(tl, "psB", ${t(LS[11] + 0.9)}, true, 0.6); pop("#lb-chk", ${t(LS[11] + 1.6)}, 0.25);
      KIT.arm(tl, "gtB", ${t(LS[11] + 1.8)}, true); X5.moveUV(tl, "atkB", ${t(LS[11] + 2.1)}, ${ATK_DU}, 0, 0, 1.4, 0);
      fadeIn("#kcB-w", ${t(LS[11] + 3.5)}, 0.25); pop("#lb-kc", ${t(LS[11] + 3.6)}, 0.25); KIT.arm(tl, "gtB", ${t(LS[11] + 3.9)}, false);
      // ===== L12 美国检方起诉 4 名朝鲜人
      pop("#ev3", ${t(LS[12] + 0.2)}); pop("#sr3", ${t(LS[12] + 1.0)});
      // ===== L13 冒名受雇，修改雇主合约：门卡挂上权限板"合约发布"（红）
      out("#lb-ps, #lb-chk, #lb-kc", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "boardB", 1.2); pop("#lb-rb", ${t(LS[13] + 1.3)}, 0.25);
      out("#kcB-w", ${t(TM.edit)}); X5.hang(tl, "rbB", 3, ${t(TM.edit + 0.1)}, true); pop("#lb-rb3", ${t(TM.edit + 0.6)}, 0.25);
      // ===== L14 约 74 万美元（点阵 74），全案约 91.5 万美元
      tl.fromTo("#dB circle", { opacity: 0 }, { opacity: 1, duration: 0.08, stagger: 0.02, immediateRender: false }, ${t(LS[14] + 0.3)});
      pop("#lg-B", ${t(LS[14] + 0.6)}, 0.25); pop("#lb-allB", ${t(TM.all)}, 0.25);
      // ===== L15 最后一种，是一笔钱：B → F
      out("#ev3, #sr3, #lb-rb, #lb-rb3, #lg-B, #lb-allB", ${t(LS[15] - 0.2)}); cam(${t(LS[15])}, "counterF", 2.0);
      // ===== L16 现金收买海外外包客服
      pop("#ev4", ${t(LS[16] + 0.2)}); fadeIn("#cash", ${t(TM.cash)}, 0.2); ${FLY("cash", TM.cash + 0.4, CASH_D[0], CASH_D[1], 1.0)}
      pop("#lb-tlr", ${t(TM.cs)}, 0.25);
      // ===== L17 导出约 7 万名用户的数据
      fadeIn("#dbx", ${t(TM.exp)}, 0.2); ${FLY("dbx", TM.exp + 0.2, 0, -60, 0.6)} pop("#lb-db", ${t(TM.exp + 0.8)}, 0.25);
      // ===== L18 Coinbase 估算 1.8 亿到 4 亿美元
      pop("#sr4", ${t(LS[18] + 0.2)}); pop("#rng", ${t(LS[18] + 1.2)});
      // ===== L19 CoinDCX 员工被兼职吸引，运营电脑装了恶意软件
      out("#ev4, #sr4, #rng, #lb-tlr", ${t(LS[19] - 0.2)}); pop("#ev5", ${t(LS[19] + 0.2)}); pop("#sr5", ${t(LS[19] + 1.0)});
      pop("#lb-ops", ${t(LS[19] + 0.5)}, 0.25); KIT.swap(tl, "#ops-scr", "#ops-scr2", ${t(TM.job)}, 0.3); fadeIn("#opsRed", ${t(TM.mal)}, 0.3);
      // ===== L20 运营钱包被盗约 4400 万美元，员工不知情
      pop("#lb-opsS", ${t(LS[20] + 0.1)}, 0.25); KIT.door(tl, "opsS", ${t(LS[20] + 0.3)}, 100, 0.8);
      tl.fromTo("#dF circle", { opacity: 0 }, { opacity: 1, duration: 0.08, stagger: 0.025, immediateRender: false }, ${t(LS[20] + 0.8)});
      pop("#lg-F", ${t(LS[20] + 1.2)}, 0.25); pop("#lb-pol", ${t(TM.pol)}, 0.25);
      // ends static on CAMS.counterF
`,
});
