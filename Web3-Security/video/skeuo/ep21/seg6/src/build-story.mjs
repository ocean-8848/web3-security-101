// ep21/seg6「⑥ 回到作业」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.gateB（BRIEF）。
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
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide

// ---- 段内专用位置 / 镜头
const hz = (X, Y, extra = {}) => { const q = G(L.ZONE_ANCHOR.G[0] + X, L.ZONE_ANCHOR.G[1] + Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const PK_G = hz(140, 300, { scale: 0.7 });                 // 陌生项目包裹（被挡在存钱包的电脑外）
const R = L.world.rects;
const CAMS6 = {
  ...L.CAMS,
  // G 用户家，压到左侧，右侧 x > 1240 留给按角色卡片
  homeGL: L.fit([...L.ZONE_RECTS.G, L.rect(PK_G, "parcel")], [100, 300, 1180, 860], 1.4),
  // C 工作电脑 + 作业包裹 + 员工 + 终端防护，右侧留题卡位
  ansC: L.fit([R.laptop, R.parcelC, R.engs[0], R.shieldC], [200, 300, 1220, 840], 2.0),
  // C 左侧工位（6 月 Homebrew）+ 工作电脑，右侧留组织图卡
  deskC6: L.fit([R.desks[0], R.desks[2], R.laptop, R.engs[0], R.engs[1], R.shieldC, R.parcelC], [100, 300, 1200, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: CAMS6, ext: [E1, E4, E5, E7, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

/** 不支持 scale 的物件：绕地面点缩放 o.scale，并换算 anchors */
const putW = (key, o, r, dy = 0, opts = {}) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { ...opts, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && q.length === 2 && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }
};
const T_ = (x, y, s, str, o = "") => `<text x="${x}" y="${y}" font-size="${s}" font-family="Noto Sans SC, Inter, sans-serif" ${o}>${str}</text>`;

// ---------------------------------------------------------------- 世界物件
// 石板路（最底层）
{ const { u0, u1, v0, v1 } = L.ROAD, P = [Wp(u0, v0), Wp(u1, v0), Wp(u1, v1), Wp(u0, v1)];
  add({ u: u0, v: v0 }, `<polygon points="${P.map((q) => q.join(",")).join(" ")}" fill="#dcd8cf" stroke="#c9c4b8" stroke-width="3"/>`, -1e6); }

// A 招聘角（全景用）
put("rec", L.RECRUITER, O.person(L.RECRUITER, { id: "rec", role: "attacker", scale: 0.55 }));
put("hire", L.HIRE_SIGN, E1.signBoard(L.HIRE_SIGN, { id: "hire", style: "wood", text: "高薪岗位", size: 34 }));

// B 门禁与人事（seg5 终点 = 本段第一帧）
put("gt", L.GATE, O.checkpoint(L.GATE, { id: "gt", n: "入" }));
putW("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb", plates: ["代码仓库", "云", "npm", "多签"], holders: [null, null, null, null], empty: [0, 1, 3], title: "权限板" }));
put("lv", L.LEAVE, O.doc(L.LEAVE, { id: "lv", standing: true, title: "离职清单", lines: ["代码仓库 ✓", "云 ✓", "npm", "域名"] }));
put("log", L.LOGBOOK, O.ledgerBook(L.LOGBOOK, { id: "log", scale: 0.6 }));
put("rpt", L.REPORT, E1.signBoard(L.REPORT, { id: "rpt", style: "plate", text: "匿名报告", size: 34 }));
put("psb", L.PASS_B, E13.passport(L.PASS_B, { id: "psb", scale: 0.8, title: "护照", open: true }));
put("mg", L.MAG, O.magnifier(L.MAG, { id: "mg" }));

// C 工程师工位
const deskScr = `<rect x="0" y="0" width="148" height="16" fill="#ece7dd"/>${T_(8, 13, 11, "代码", `fill="#5f5a50" font-weight="700"`)}<rect x="8" y="26" width="90" height="8" rx="4" fill="#ddd6c9"/><rect x="18" y="42" width="110" height="8" rx="4" fill="#ddd6c9"/><rect x="18" y="58" width="70" height="8" rx="4" fill="#ddd6c9"/>`;
L.DESKS.forEach((q, i) => putW("dk" + i, q, O.desk(q, { id: "dk" + i, screen: deskScr })));
L.ENGS.forEach((q, i) => put("en" + i, q, O.person(q, { id: "en" + i, role: "engineer", scale: 0.5 })));
putW("rk", L.RACK, O.rack(L.RACK, { id: "rk", tag: "部署系统" }));
put("sh", L.SHIELD_C, O.shield(L.SHIELD_C, { id: "sh" }));
put("par", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "par", scale: 0.7 }));
// 主角工作电脑：screen = 工作电脑；screen2 = 关键画面（安装步骤 → 混淆命令 → pyenv 被替换）
const heroScr2 = `<rect x="0" y="0" width="222" height="146" fill="#ffffff"/><rect x="0" y="0" width="222" height="24" fill="#ece7dd"/>${T_(8, 17, 13, "作业仓库", `fill="#5f5a50" font-weight="700"`)}
  <rect x="8" y="32" width="112" height="104" rx="4" fill="#fbf8f1" stroke="#b8b0a0" stroke-width="1.4"/>${T_(16, 50, 14, "安装步骤", `fill="#1c1c1c" font-weight="700"`)}
  <rect x="16" y="60" width="86" height="8" rx="4" fill="#ddd6c9"/>
  <g id="lh-ob">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${16 + i * 13}" y="${78 + (i % 2) * 2}" width="${8 + (i * 5) % 6}" height="9" rx="1.5" fill="#8d939b"/>`).join("")}</g>
  <rect x="16" y="100" width="70" height="8" rx="4" fill="#ddd6c9"/>${T_(16, 126, 11, "混淆的命令", `fill="#8d939b"`)}
  <path id="lh-pl" d="M110 84 C 130 84, 132 70, 150 70" fill="none" stroke="#e0453a" stroke-width="2.6" stroke-dasharray="6 4" opacity="0"/>
  <g id="lh-pg"><rect x="150" y="52" width="62" height="38" rx="6" fill="#1f9d55"/>${T_(181, 76, 14, "pyenv", `fill="#fff" font-weight="700" text-anchor="middle"`)}</g>
  <g id="lh-pr" opacity="0"><rect x="150" y="52" width="62" height="38" rx="6" fill="#e0453a"/>${T_(181, 76, 14, "pyenv", `fill="#fff" font-weight="700" text-anchor="middle"`)}</g>
  ${T_(181, 108, 11, "组件", `fill="#8d939b" text-anchor="middle"`)}`;
put("lh", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lh", screen: O.laptopDefaultScreen({ title: "工作电脑", btnText: "运行" }), screen2: heroScr2 }));

// D 签名室（全景用）：门槛表停在门槛线下
put("vt", L.VAULT, O.safe(L.VAULT, { id: "vt", plate: "多签金库" }));
put("mt", L.METER, E5.thresholdMeter(L.METER, { id: "mt", max: 5, th: 3, level: 1, color: "green" }));
L.SIGNERS.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: 0.5 })));

// E 会议室 / F 客服柜台（全景用）
put("md", L.MDESK, O.desk(L.MDESK, { id: "md" }));
put("ex", L.EXEC, O.person(L.EXEC, { id: "ex", role: "signer", scale: 0.55 }));
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.7, sign: "客服" }));

// G 用户家
const hlScr2 = `<rect x="0" y="0" width="222" height="146" fill="#1c1c1c" opacity="0.35"/><rect x="26" y="22" width="170" height="104" rx="10" fill="#ffffff" stroke="#8d939b" stroke-width="1.4"/>
  ${T_(111, 54, 18, "远程控制？", `fill="#1c1c1c" font-weight="700" text-anchor="middle"`)}${T_(111, 76, 11, "对方请求控制你的屏幕", `fill="#5f5a50" text-anchor="middle"`)}
  <g id="hl-no"><rect x="40" y="88" width="66" height="28" rx="7" fill="#1f9d55"/>${T_(73, 107, 14, "拒绝", `fill="#fff" font-weight="700" text-anchor="middle"`)}</g>
  <rect x="116" y="88" width="66" height="28" rx="7" fill="#d9d4ca"/>${T_(149, 107, 14, "允许", `fill="#8d939b" text-anchor="middle"`)}`;
putW("hl", L.HLAPTOP, O.laptop(L.HLAPTOP, { id: "hl", screen: O.laptopDefaultScreen({ title: "我的钱包" }), screen2: hlScr2 }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: 0.6 }));
const hpScr = `<rect x="0" y="0" width="76" height="150" fill="#26272a"/>${T_(38, 30, 12, "来电", `fill="#c9cdd2" text-anchor="middle"`)}${T_(38, 56, 20, "客服", `fill="#fff" font-weight="700" text-anchor="middle"`)}${T_(38, 78, 10, "账户有风险", `fill="#ff8a80" text-anchor="middle"`)}
  <g id="hp-end"><circle cx="20" cy="124" r="13" fill="#e0453a"/><path d="M13 125 q7 -6 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g><circle cx="56" cy="124" r="13" fill="#1f9d55"/>`;
const hpScr2 = `<rect x="0" y="0" width="76" height="150" fill="#3a3c40"/>${T_(38, 66, 15, "已挂断", `fill="#fff" font-weight="700" text-anchor="middle"`)}<circle cx="38" cy="100" r="13" fill="#e0453a"/><path d="M31 101 q7 -6 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
put("hp", L.HPHONE, O.phone(L.HPHONE, { id: "hp", screen: hpScr, screen2: hpScr2 }));
put("hw", L.HHW, O.hwWallet(L.HHW, { id: "hw" }));
put("app", L.APPSIGN, E1.signBoard(L.APPSIGN, { id: "app", style: "plate", text: "官方 App", size: 34 }), 0, { grow: true });
put("pk", PK_G, E7.parcel(PK_G, { id: "pk", scale: 0.7 }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-usr", up(A.usr.top, 6), "普通用户", "lab-ink lab-sm");
lb("lb-hl", up(A.hl.top, 8), "存钱包的电脑", "lab-ink");
lb("lb-pk", up(A.pk.top, 6), "陌生项目", "lab-r lab-sm");
lb("lb-hp", up(A.hp.top, 6), "主动来电", "lab-rs lab-sm");
lb("lb-lh", up(A.lh.top, 8), "工作电脑", "lab-ink");
lb("lb-par", up(A.par.top, 6), "作业", "lab-cs lab-sm");
lb("lb-sh", up(A.sh.top, 6), "终端防护 · 没有发现", "lab-ink lab-sm");
lb("lb-dk0", up(A.dk0.top, 8), "6 月 · 已清理", "lab-gs lab-sm");
lb("lb-en1", up(A.en1.top, 6), "另一名工程师", "lab-cs lab-sm");
lb("lb-mt", up(A.mt.top, 10), `一人被攻破 · 转不走钱 ${gtag("解读")}`, "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const chip = (t) => `<span class="c6-chip">${t}</span>`;
const stopSvg = `<svg width="92" height="92" viewBox="0 0 92 92"><polygon points="27,2 65,2 90,27 90,65 65,90 27,90 2,65 2,27" fill="#e0453a" stroke="#fff" stroke-width="4"/><text x="46" y="60" font-size="40" font-weight="800" fill="#fff" text-anchor="middle" font-family="Noto Sans SC, sans-serif">停</text></svg>`;
const icoHw = `<svg width="96" height="64" viewBox="0 0 96 64"><rect x="4" y="16" width="44" height="34" rx="6" fill="#3b3e44"/><rect x="10" y="22" width="32" height="14" rx="2" fill="#9ad9ee"/>
  <path d="M60 12h30a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H74l-8 8v-8h-6a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="#2aa3c9"/>
  <g id="rc0-x" opacity="0"><path d="M58 8L94 44M94 8L58 44" stroke="#e0453a" stroke-width="6" stroke-linecap="round"/></g></svg>`;
const icoCtr = `<svg width="96" height="64" viewBox="0 0 96 64"><rect x="6" y="14" width="84" height="42" rx="3" fill="#2f8fb0" stroke="#1b5e78" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${14 + i * 12}" y="18" width="4" height="34" fill="#1b5e78" opacity="0.5"/>`).join("")}<rect x="30" y="4" width="36" height="12" rx="3" fill="#7d5a30"/></svg>`;
const icoDoc = `<svg width="96" height="64" viewBox="0 0 96 64"><rect x="24" y="2" width="48" height="60" rx="4" fill="#fff" stroke="#3b3e44" stroke-width="2"/>${[0, 1, 2, 3].map((i) => `<rect x="32" y="${12 + i * 12}" width="24" height="5" rx="2" fill="#c9c3b7"/>`).join("")}
  <g id="rc2-k" opacity="0"><path d="M58 37l4 4 7-8M58 49l4 4 7-8" stroke="#1f9d55" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
const roleCard = (id, top, role, act, ico) => `<div class="c6 c6-role hide" id="${id}" style="top:${top}px"><span class="c6-who">${role}</span><span class="c6-act">${act}</span>${ico}</div>`;
const orgSvg = `<svg width="360" height="190" viewBox="0 0 360 190">
  <path d="M180 62V92M70 92H290M70 92V112M180 92V112M290 92V112" stroke="#8d939b" stroke-width="3" fill="none"/>
  ${[[180, 34, "#2a9fc6"], [70, 140, "#3b3e44"], [180, 140, "#3b3e44"], [290, 140, "#3b3e44"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y - 10}" r="13" fill="${c}"/><path d="M${x - 22} ${y + 22}q22 -28 44 0z" fill="${c}"/>`).join("")}
  <text x="210" y="40" font-size="28" fill="#1c1c1c" font-family="Noto Sans SC, sans-serif">角色</text>
  <text x="180" y="184" font-size="28" fill="#1c1c1c" text-anchor="middle" font-family="Noto Sans SC, sans-serif">同事</text></svg>`;
const html = `
  <div class="c6 hide" id="stop" style="left:1260px;top:330px;width:540px">
    <div class="c6-row">${chip("下载项目")}${chip("运行脚本")}${chip("装会议软件")}</div>
    <div class="c6-row hide" id="stop-s" style="margin-top:18px">${stopSvg}<span class="c6-big">先停下来</span></div>
  </div>
  ${roleCard("rc0", 300, "签名人", "删掉聊天软件", icoHw)}
  ${roleCard("rc1", 470, "开发者", "隔离环境打开", icoCtr)}
  ${roleCard("rc2", 640, "负责人", "查离职清单", icoDoc)}
  <div class="c6 hide" id="q" style="left:1290px;top:340px;width:520px">
    <div class="c6-head">先猜</div>
    <div class="c6-q">没密码 + 没链接 = 怎么进来？</div>
    <div class="c6-a hide" id="q-a">运行外部代码 = 够了</div>
  </div>
  <div class="c6 hide" id="org" style="left:1300px;top:360px;width:420px">
    <div class="c6-head">攻击者摸清了</div>${orgSvg}
    <div class="c6-a c6-red hide" id="org-t">清理 ≠ 威胁结束</div>
    <div class="c6-ring hide" id="org-x"></div>
  </div>
  ${evt("src", "来源 · <b>Binance 初步报告</b>")}`;
const css = `
  .c6 { position: absolute; background: #ffffff; border-radius: 18px; padding: 22px 26px; box-shadow: 0 6px 22px rgba(28,28,28,.12); font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
  .c6-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .c6-chip { background: #e6f4f9; color: #1d93ba; border: 2px solid #2aa3c9; border-radius: 12px; padding: 6px 14px; font-size: 28px; font-weight: 700; }
  .c6-big { font-size: 40px; font-weight: 800; color: #e0453a; margin-left: 10px; }
  .c6-role { left: 1260px; width: 540px; display: flex; align-items: center; gap: 18px; padding: 20px 24px; }
  .c6-who { background: #1c1c1c; color: #fff; border-radius: 10px; padding: 6px 14px; font-size: 28px; font-weight: 700; white-space: nowrap; }
  .c6-act { font-size: 32px; font-weight: 700; flex: 1; white-space: nowrap; }
  .c6-head { font-size: 28px; font-weight: 700; color: #8d939b; margin-bottom: 8px; }
  .c6-q { font-size: 36px; font-weight: 800; }
  .c6-a { margin-top: 14px; font-size: 36px; font-weight: 800; color: #1f9d55; }
  .c6-red { color: #e0453a; }
  .c6-ring { position: absolute; inset: -10px; border: 4px dashed #e0453a; border-radius: 24px; }
  #sh-solid { filter: grayscale(1); opacity: .7; }`;

// ---------------------------------------------------------------- 红虚线：左侧工位 → 组织图卡
S.curve("cv", S.scr("deskC6", A.dk0.top), [1296, 470], { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dl: w("下载项目", 1), stop: w("先停下来", 1), strange: w("陌生项目", 2), file: w("陌生文件", 2),
  remote: w("远程控制", 3), hang: w("一律挂断", 4), app: w("官方", 4),
  del: w("删掉", 5), edge: w("边缘权限", 7),
  repo: w("作业仓库", 9), obf: w("混淆", 9), mal: w("恶意版本", 9),
  edr: w("终端防护", 10), run: w("运行外部代码", 10), enough: w("就够了", 10),
  brew: w("Homebrew", 11), clean: w("清理", 11), know: w("了解", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "gateB", sub: "安装脚本，就是那扇门",
  grid: { u0: -3000, u1: 15900, v0: -9700, v1: 9700 }, box: [-1100, -5500, 12900, 7500],   // 盖住上段终点 gateB + homeG / laptopC / deskC / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "pyenv", d: "管理 Python 版本的开发工具", at: w("pyenv", 9) },
    { id: "t1", t: "Homebrew", d: "macOS 上的软件安装工具", at: w("Homebrew", 11) },
  ],
  end: { title: "社会工程与内部人", line: "攻击者先攻破人，防线要让一个人被攻破也不够", next: "人身与账号安全", at: LS[15], nextAt: w("下一集", 15) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 普通用户也会遇到同样的手法。（gateB → 一路右移到用户家）
      cam(${t(LS[0] + 0.1)}, "homeGL", 2.6, "power2.inOut"); pop("#lb-usr", ${t(LS[0] + 2.4)});
      // ===== L1 招聘者让你下载项目、运行脚本、安装会议软件，先停下来。
      pop("#stop", ${t(TM.dl)}); pop("#stop-s", ${t(TM.stop)}, 0.3);
      // ===== L2 不在存放钱包的电脑上，运行陌生项目，打开陌生文件。
      out("#stop", ${t(LS[2] + 0.6)}); pop("#lb-hl", ${t(LS[2] + 0.2)});
      grow("pk", ${t(TM.strange)}); pop("#lb-pk", ${t(TM.strange + 0.4)}); KIT.broke(tl, "pk", ${t(TM.file + 0.4)}, { ghost: 0.35 });
      // ===== L3 会议里，拒绝任何远程控制请求。
      fadeIn("#hl-scr2", ${t(TM.remote - 0.3)}, 0.3); flash("#hl-no", ${t(TM.remote + 0.6)}, 3, 0.35);
      // ===== L4 客服主动联系你，说账户有风险，要你转移资产，一律挂断，再从官方 App 里联系客服。
      out("#hl-scr2", ${t(LS[4] + 0.1)}); pop("#lb-hp", ${t(LS[4] + 0.3)}); flash("#hp-end", ${t(TM.hang - 0.9)}, 2, 0.35);
      fadeIn("#hp-scr2", ${t(TM.hang)}, 0.25); grow("app", ${t(TM.app)});
      // ===== L5 如果你是签名人，今天就把聊天软件，从签名设备上删掉。
      pop("#rc0", ${t(LS[5] + 0.3)}); fadeIn("#rc0-x", ${t(TM.del)}, 0.25);
      // ===== L6 如果你是开发者，陌生项目一律先在隔离环境里打开。
      pop("#rc1", ${t(LS[6] + 0.3)});
      // ===== L7 如果你负责团队，查一遍离职清单，看它有没有覆盖边缘权限。
      pop("#rc2", ${t(LS[7] + 0.3)}); fadeIn("#rc2-k", ${t(TM.edge)}, 0.3);
      // ===== L8 回到开头的题。（用户家 → C 工作电脑）
      out("#rc0, #rc1, #rc2, #lb-usr, #lb-hl, #lb-pk, #lb-hp", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "ansC", 1.5, "power2.inOut"); pop("#lb-lh", ${t(LS[8] + 1.2)}); pop("#q", ${t(LS[8] + 1.1)}, 0.3);
      // ===== L9 作业仓库靠的是安装脚本，安装步骤运行了混淆的命令，把合法的 pyenv 组件换成了恶意版本。（关键画面）
      pop("#lb-par", ${t(TM.repo)}); fadeIn("#lh-scr2", ${t(TM.repo + 0.2)}, 0.35); pop("#src", ${t(LS[9] + 0.6)});
      flash("#lh-ob", ${t(TM.obf)}, 3, 0.3); fadeIn("#lh-pl", ${t(TM.obf + 1.2)}, 0.3);
      out("#lh-pg", ${t(TM.mal - 0.3)}, 0.3); fadeIn("#lh-pr", ${t(TM.mal - 0.3)}, 0.3);
      // ===== L10 当时的终端防护没有发现，在工作电脑上运行外部代码，这一步就够了。
      pop("#lb-sh", ${t(TM.edr)}); pop("#q-a", ${t(TM.run)}, 0.3);
      // ===== L11 而在 6 月，另一名工程师下载过被篡改的 Homebrew，Binance 当时就发现并清理了这台设备。（C 左侧工位）
      out("#q, #src, #lb-sh, #lb-lh, #lb-par", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "deskC6", 1.4, "power2.inOut");
      pop("#lb-en1", ${t(LS[11] + 1.3)}); KIT.broke(tl, "dk0", ${t(TM.brew)}, { badge: false, ghost: 0.5 });
      KIT.fixed(tl, "dk0", ${t(TM.clean)}); pop("#lb-dk0", ${t(TM.clean + 0.3)});
      // ===== L12 但报告称，攻击者由此了解了工程师的角色和同事。
      draw("cv", ${t(TM.know - 0.3)}, 0.7); pop("#org", ${t(TM.know + 0.3)}, 0.3);
      // ===== L13 一次清理完成，不代表威胁结束。
      fadeIn("#org-x", ${t(LS[13] + 0.3)}, 0.3); fadeIn("#org-t", ${t(LS[13] + 0.6)}, 0.3);
      // ===== L14 攻击者先攻破人，防线就要设计成，一个人被攻破，也转不走钱。（拉到园区全景）
      out("#org, #cv, #lb-dk0, #lb-en1", ${t(LS[14] - 0.2)}); cam(${t(LS[14])}, "wide", 2.2, "power2.inOut");
      pop("#lb-mt", ${t(LS[14] + 2.4)}, 0.3);
      // ===== L15 下一集讲人身与账号安全。（结束卡，静止）
      out("#lb-mt", ${t(LS[15] - 0.2)});
`,
});
