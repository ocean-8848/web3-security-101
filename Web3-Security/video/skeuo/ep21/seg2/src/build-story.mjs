// ep21/seg2「② 先攻破人」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.laptopC（BRIEF）。
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
// starts on CAMS.laptopC (= seg1 end) · ends static on CAMS.wide

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const FT = `font-family="Inter, 'Noto Sans SC', sans-serif"`;
const pts = (arr) => arr.map((p) => p.map((v) => f(v)).join(",")).join(" ");
// 不支持 scale 的物件：绕地面点包一层，并换算 anchors
function putW(key, o, r, k = o.scale, dy = 0, hidId) {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { wrap: (svg) => { const g = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hidId ? S.hid(hidId, g) : g; } });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
}
const ring = (gid, p, r, col = "#e0453a") => S.hid(gid, `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${col}" fill-opacity="0.13" stroke="${col}" stroke-width="30"/>`);
const dashBox = (gid, R, pad = 16, col = "#e0453a", sw = 6) => S.hid(gid, `<rect x="${f(R[0] - pad)}" y="${f(R[1] - pad)}" width="${f(R[2] - R[0] + 2 * pad)}" height="${f(R[3] - R[1] + 2 * pad)}" rx="16" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="18 12"/>`);

// ---------------------------------------------------------------- 石板路
{ const R = L.ROAD, q = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v, 0));
  add({ u: 0, v: 0 }, `<polygon points="${pts(q)}" fill="#dcd8d0" stroke="#cbc5ba" stroke-width="3"/>`, -100000); }

// ---------------------------------------------------------------- A 招聘角
put("rec", L.RECRUITER, O.person(L.RECRUITER, { id: "rec", role: "attacker", scale: 0.55 }));
{ const o = S.rel(L.RECRUITER, 6, 34); put("kcA", o, E5.keycard(o, { id: "kcA", scale: 0.35, z: 62, text: "HR", color: "#1d93ba" }), 2); }
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA" }));
put("hire", L.HIRE_SIGN, E1.signBoard(L.HIRE_SIGN, { id: "hire", style: "wood", text: "高薪岗位", size: 34 }));
put("pcA", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pcA", scale: 0.7 }), 0, { grow: true });

// ---------------------------------------------------------------- B 门禁与人事
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "入" }));
putW("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb" }));
put("leave", L.LEAVE, O.doc(L.LEAVE, { id: "leave", title: "离职清单", standing: true }));
put("logb", L.LOGBOOK, O.ledgerBook(L.LOGBOOK, { id: "logb", scale: 0.6 }));
put("rep", L.REPORT, E1.signBoard(L.REPORT, { id: "rep", style: "plate", text: "匿名报告", size: 32 }));
put("psB", L.PASS_B, E13.passport(L.PASS_B, { id: "psB", scale: 0.8, title: "护照" }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: 0.5 }), 0, { grow: true });

// ---------------------------------------------------------------- C 工程师工位（上段终点：工作电脑正常代码屏，作业包裹在旁，无攻击者）
const codeScr = (W, H, fs) => `<rect width="${W}" height="${H}" fill="#1c1c1c"/>${[0, 1, 2, 3].map((i) => `<rect x="${W * 0.08 + (i % 2) * W * 0.06}" y="${H * 0.2 + i * H * 0.15}" width="${W * (0.5 - (i % 3) * 0.1)}" height="${H * 0.06}" rx="2" fill="#4f8fa3"/>`).join("")}<text x="${W * 0.92}" y="${H * 0.9}" text-anchor="end" ${FT} font-size="${fs}" font-weight="900" fill="#9fd3e5">代码</text>`;
const redScr = (W, H, fs) => `<rect width="${W}" height="${H}" fill="#e0453a"/><text x="${W / 2}" y="${H * 0.62}" text-anchor="middle" ${FT} font-size="${fs}" font-weight="900" fill="#ffffff">已被控制</text>`;
put("lapC", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lapC", screen: codeScr(222, 146, 26), screen2: redScr(222, 146, 34) }));
L.ENGS.forEach((q, i) => put(`eng${i}`, q, O.person(q, { id: `eng${i}`, role: "engineer", scale: 0.5 })));
L.DESKS.forEach((q, i) => putW(`dk${i}`, q, O.desk(q, { id: `dk${i}`, screen: codeScr(148, 88, 20), screen2: redScr(148, 88, 24) })));
putW("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "部署系统" }));
put("tok", L.TOKEN, O.key(L.TOKEN, { id: "tok" }));
put("pcC", L.PARCEL_C, E7.parcel(L.PARCEL_C, { id: "pcC", scale: 0.7 }));
// 员工胸前门卡（L2 出现）
{ const o = S.rel(L.ENGS[0], 6, 30); put("kcC", o, E5.keycard(o, { id: "kcC", scale: 0.35, z: 56, text: "员工", color: "#1f9d55" }), 2, { wrap: (s) => S.hid("kcCw", s) }); }
// 员工 → 工作电脑（"自己动手"）
{ const a = A.eng0.center, b = A.lapC.keyboard;
  add(L.LAPTOP, S.hid("hand", `<line x1="${f(a[0] + 20)}" y1="${f(a[1])}" x2="${f(b[0] - 40)}" y2="${f(b[1] + 6)}" stroke="#e0453a" stroke-width="7" stroke-dasharray="14 10" stroke-linecap="round"/><circle cx="${f(b[0] - 40)}" cy="${f(b[1] + 6)}" r="10" fill="#e0453a"/>`), 300); }

// ---------------------------------------------------------------- D 签名室
put("vault", L.VAULT, O.safe(L.VAULT, { id: "vault", plate: "多签金库" }));
put("tm", L.METER, E5.thresholdMeter(L.METER, { id: "tm", max: 3, th: 2, thText: "2 / 3" }));
L.SIGNERS.forEach((q, i) => put(`sg${i}`, q, O.person(q, { id: `sg${i}`, role: "signer", scale: 0.5 })));
L.HWS_D.forEach((q, i) => put(`hwd${i}`, q, O.hwWallet(q, { id: `hwd${i}` })));
const sigScr = O.laptopDefaultScreen({ title: "Safe{Wallet}", line: "转账 10 ETH" });
const sigScrR = `<rect width="222" height="146" fill="#f6b9b2"/>` + sigScr.replace(/fill="#ddd6c9"/g, 'fill="#e0453a"') + `<rect x="2" y="2" width="218" height="142" fill="none" stroke="#e0453a" stroke-width="5"/>`;
L.LAPTOPS_D.forEach((q, i) => putW(`lpd${i}`, q, O.laptop(q, { id: `lpd${i}`, screen: sigScr, screen2: sigScrR })));
const feR = `<rect x="0" y="0" width="380" height="300" fill="#fde6e3"/><text x="28" y="92" ${FT} font-size="26" font-weight="900" fill="#c3352b">新交易</text>
  <rect x="28" y="124" width="300" height="12" rx="6" fill="#f2a59d"/><rect x="28" y="152" width="230" height="12" rx="6" fill="#f2a59d"/><rect x="190" y="230" width="160" height="46" rx="10" fill="#e0453a"/><text x="270" y="262" text-anchor="middle" ${FT} font-size="22" font-weight="900" fill="#ffffff">确认</text>`;
putW("fe", L.FRONTEND, O.browserWin(L.FRONTEND, { id: "fe", title: "多签前端", page2: feR }));
// 共用前端：三台笔记本 → 前端 虚线
add(L.FRONTEND, S.hid("feln", L.LAPTOPS_D.map((_, i) => { const a = A[`lpd${i}`].top, b = A.fe.ground;
  return `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0] - 40 + i * 40)}" y2="${f(b[1])}" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/>`; }).join("")), 2000);
add(L.LAPTOPS_D[0], dashBox("lpdbox", L.rect(L.LAPTOPS_D[0], "laptop")), 400);
// 飞进笔记本的文件（L4）
const DOCOFF = [-520, -360];
{ const [sx, sy] = A.lpd0.screen, x = sx + DOCOFF[0], y = sy + DOCOFF[1];
  add(L.LAPTOPS_D[0], S.hid("fdoc", `<g id="fdocm"><path d="M${f(x - 34)} ${f(y - 44)}h48l20 20v68h-68z" fill="#ffffff" stroke="#1c1c1c" stroke-width="3.5"/><path d="M${f(x + 14)} ${f(y - 44)}v20h20" fill="none" stroke="#1c1c1c" stroke-width="3"/>
    ${[0, 1, 2].map((i) => `<rect x="${f(x - 24)}" y="${f(y - 10 + i * 14)}" width="${36 - i * 6}" height="6" rx="3" fill="#ddd6c9"/>`).join("")}</g>`), 3000); }
// 金库三道门（比喻，native）
const DOORS = [-170, 0, 170].map((du) => S.rel(L.VAULT, du, 210));
const doorSvg = (q, col, dash) => { const P = [[-62, 0], [62, 0], [62, 230], [-62, 230]].map(([a, z]) => Wp(q.u + a, q.v, z));
  return `<polygon points="${pts(P)}" fill="${dash ? "none" : "#e8dcc8"}" fill-opacity="0.92" stroke="${col}" stroke-width="${dash ? 9 : 6}" ${dash ? 'stroke-dasharray="18 12"' : ""}/>`; };
DOORS.forEach((q, i) => { add(q, S.hid(`door${i}`, doorSvg(q, "#1c1c1c", false)), 0); add(q, S.hid(`doorR${i}`, doorSvg(q, "#e0453a", true)), 1);
  A[`door${i}`] = { top: Wp(q.u, q.v, 250), mid: Wp(q.u, q.v, 110) }; });
L.KEYS_D.forEach((q, i) => put(`kd${i}`, q, O.key(q, { id: `kd${i}` }), 0, { wrap: (s) => S.hid(`kdw${i}`, `<g id="kdm${i}">${s}</g>`) }));
L.LETTERS.forEach((q, i) => put(`lt${i}`, q, E1.letter(q, { id: `lt${i}`, w: 52, h: 36 }), 0, { wrap: (s) => S.hid(`ltw${i}`, s) }));
const KEYTO = (i) => { const s = at(S.rel(L.SIGNERS[i], 40, 40)), k = at(L.KEYS_D[i]); return [s[0] - k[0], s[1] - k[1] - 40]; };
const WRONG = [2, 0, 1];                                   // 读过信的人记错的门
const KEYDOOR = (i) => { const d = A[`door${WRONG[i]}`].mid, k = at(L.KEYS_D[i]); return [d[0] - k[0] + (i - 1) * 16, d[1] - k[1]]; };

// ---------------------------------------------------------------- E 会议室
put("mdesk", L.MDESK, O.desk(L.MDESK, { id: "mdesk" }));
const callScr = `<rect width="222" height="146" fill="#2f3237"/><rect x="8" y="10" width="100" height="126" rx="6" fill="#4a5058"/><rect x="114" y="10" width="100" height="126" rx="6" fill="#4a5058"/>
  <circle cx="58" cy="58" r="18" fill="#9aa0a8"/><path d="M28 120q30-44 60 0z" fill="#9aa0a8"/><circle cx="164" cy="58" r="18" fill="#f2a59d"/><path d="M134 120q30-44 60 0z" fill="#f2a59d"/>`;
put("mlap", L.MLAPTOP, O.laptop(L.MLAPTOP, { id: "mlap", screen: callScr }));
put("exec", L.EXEC, O.person(L.EXEC, { id: "exec", role: "signer", scale: 0.55 }));
putW("hsE", L.HOTSAFE_E, O.safe(L.HOTSAFE_E, { id: "hsE", variant: "hot" }));

// ---------------------------------------------------------------- F 客服柜台
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.7 }));
putW("db", L.DB, O.dbLedger(L.DB, { id: "db", tag: "用户数据" }));
put("atkF", L.ATK_F, O.person(L.ATK_F, { id: "atkF", role: "attacker", scale: 0.5 }));
putW("ops", L.OPSDESK, O.desk(L.OPSDESK, { id: "ops" }));
putW("opsS", L.OPSSAFE, O.safe(L.OPSSAFE, { id: "opsS", variant: "hot" }));
put("bcF", L.BEACON_F, O.beacon(L.BEACON_F, { id: "bcF" }));

// ---------------------------------------------------------------- G 用户家
putW("hlap", L.HLAPTOP, O.laptop(L.HLAPTOP, { id: "hlap" }));
put("user", L.USER, O.person(L.USER, { id: "user", role: "signer", scale: 0.6 }));
put("hph", L.HPHONE, O.phone(L.HPHONE, { id: "hph" }));
put("hhw", L.HHW, O.hwWallet(L.HHW, { id: "hhw" }));
put("app", L.APPSIGN, E1.signBoard(L.APPSIGN, { id: "app", style: "plate", text: "官方 App", size: 32 }));

// ---------------------------------------------------------------- 全景五样：红圈（世界层，全景 0.155 倍下约 60 px）
const FIVE = [
  ["A", "rec", "假身份"], ["A", "pcA", "任务"], ["E", "mlap", "会议"], ["F", "tc", "一笔钱"], ["B", "psB", "被雇用的身份"],
];
FIVE.forEach(([z, k], i) => { const c = A[k].center; add({ u: 0, v: 0 }, ring(`ring${i}`, i === 4 ? [(c[0] + A.atkB.center[0]) / 2, (c[1] + A.atkB.center[1]) / 2] : c, 420), 50000); });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-bub", up(A.eng0.top, 14), "💬 高薪岗位 · 先做个测试", "lab-r lab-sm");
lb("lb-self", [A.lapC.top[0] + 60, A.lapC.top[1] - 10], "自己动手", "lab-rs");
lb("lb-perm", [A.kcC.top[0] - 30, A.kcC.top[1] - 4], "合法权限", "lab-gs lab-sm", "r");
lb("lb-intent", [A.kcC.top[0] - 30, A.kcC.top[1] + 90], "有意 / 无意", "lab-g lab-sm", "r");
lb("lb-vok", up(A.vault.top, 8), "多签合约 ✓", "lab-gs lab-sm");
lb("lb-pc", up(A.lpd0.top, 60), "员工电脑", "lab-rs lab-sm");
lb("lb-same", up(A.lpd0.top, 60), "字一样 · 页面是假的", "lab-rs lab-sm");
DOORS.forEach((_, i) => lb(`lb-d${i}`, up(A[`door${i}`].top, 4), `${i + 1}`, "lab-ink lab-sm"));
L.SIGNERS.forEach((_, i) => lb(`lb-s${i}`, up(A[`sg${i}`].top, 8), `管 ${i + 1} 号门`, "lab-cs lab-sm"));
L.SIGNERS.forEach((_, i) => lb(`lb-w${i}`, up(A[`sg${i}`].top, 8), `开 ${WRONG[i] + 1} 号门？`, "lab-rs lab-sm"));
lb("lb-ltr", [at(L.LETTERS[1])[0], at(L.LETTERS[1])[1] - 80], "老同事的来信", "lab-cs lab-sm");
lb("lb-fe", up(A.fe.top, 6), "同一个前端", "lab-cs lab-sm");
lb("lb-th", [A.tm.top[0], A.tm.top[1] - 6], "凑够门槛", "lab-rs");
FIVE.forEach(([z, k], i) => { const c = A[k].top; const dx = i === 0 ? -260 : i === 1 ? 260 : 0; lb(`n${i}`, up([(i === 4 ? A.atkB.top : c)[0] + dx, (i === 4 ? A.atkB.top : c)[1]], 70), `${i + 1}`, "lab-rs"); });

// ---------------------------------------------------------------- 屏幕层卡片
const SL = { x: 640, y: 110, w: 236, gap: 14 };
const slots = `<div id="slots" class="hide">${FIVE.map(([, , txt], i) => `<div class="slot" style="left:${SL.x + i * (SL.w + SL.gap)}px"><span class="sn">${i + 1}</span><span id="sf${i}" class="sf hide">${txt}</span></div>`).join("")}</div>
  <div id="hand-ln" class="hide"></div><div id="hand-tx" class="hide">防的是手法</div>`;
const html = slots
  + evt("ev-meta", `比喻 ${gtag("解读")}`, { color: "#7d776b" })
  + evt("ev-no", `比喻 · 不成立处 ${gtag("解读")}`, { color: "#7d776b", top: 123 })
  + evt("ev-src", `${gtag("公开通报")} 朝鲜相关组织最活跃`, { color: "#e0453a", top: 600 });
const css = `
  .slot { position: absolute; top: ${SL.y}px; width: ${SL.w}px; height: 74px; border: 4px dashed #cfc7b8; border-radius: 14px; background: rgba(255,255,255,0.75);
    display: flex; align-items: center; gap: 10px; padding: 0 12px; box-sizing: border-box; font-family: "Noto Sans SC", sans-serif; }
  .sn { flex: none; width: 40px; height: 40px; border-radius: 20px; background: #e0453a; color: #fff; font-size: 28px; font-weight: 900; text-align: center; line-height: 40px; }
  .sf { font-size: 28px; font-weight: 900; color: #1c1c1c; white-space: nowrap; }
  #hand-ln { position: absolute; left: ${SL.x}px; top: ${SL.y + 88}px; width: ${5 * SL.w + 4 * SL.gap}px; height: 8px; border-radius: 4px; background: #2aa3c9; }
  #hand-tx { position: absolute; left: ${SL.x + 2 * (SL.w + SL.gap) + 10}px; top: ${SL.y + 104}px; padding: 4px 18px 6px; border-radius: 12px; background: #1d93ba; color: #fff;
    font-family: "Noto Sans SC", sans-serif; font-size: 34px; font-weight: 900; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  self: w("自己动手", 1), perm: w("合法权限", 2), intent: w("有意", 2), pc: w("员工的电脑", 3), file: w("文件", 4), fake: w("假的", 5),
  doors: w("三道门", 6), keys: w("钥匙", 6), letter: w("来信", 7), forget: w("记错", 8), no: w("不成立", 9), three: w("三个人", 9),
  fe: w("同一个前端", 10), hack: w("攻破", 10), tamper: w("篡改前端", 10), th: w("门槛", 10),
  five: w("五样", 11), f: [w("假身份", 12), w("任务", 13), w("会议", 14), w("一笔钱", 15), w("被雇用", 16)],
  src: w("公开通报", 17), reuse: w("复用", 18),
};
const t = (x) => f(x);

S.build({
  cam0: "laptopC", sub: "不撬门，先骗掌钥人",
  grid: { u0: -3000, u1: 15900, v0: -9700, v1: 9700 }, box: [-1100, -5500, 12900, 7500],   // 盖住上段终点 laptopC + deskC / signD / vaultD / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "多签", d: "多人签名凑够门槛才能动资金", at: w("多签", 4) },
    { id: "t1", t: "前端", d: "浏览器里的网页和它加载的脚本", at: w("前端", 10) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。laptopC → deskC（上段终点：工作电脑正常代码屏 + 作业包裹）
      cam(${t(LS[0])}, "deskC", 1.4);
      // ===== L1 社会工程：员工头顶对话气泡，手伸向电脑
      pop("#lb-bub", ${t(LS[1] + 0.3)}, 0.3); fadeIn("#hand", ${t(TM.self - 0.3)}, 0.4); pop("#lb-self", ${t(TM.self)}, 0.3);
      // ===== L2 内部人风险：胸前门卡亮起"合法权限"
      out("#lb-bub, #lb-self, #hand", ${t(LS[2] - 0.2)}, 0.2);
      fadeIn("#kcCw", ${t(TM.perm - 0.3)}, 0.3); pop("#lb-perm", ${t(TM.perm)}, 0.3); pop("#lb-intent", ${t(TM.intent)}, 0.3);
      // ===== L3 最贵的漏洞在员工电脑上：右移到 signD
      out("#lb-perm, #lb-intent", ${t(LS[3] - 0.2)}, 0.2); cam(${t(LS[3])}, "signD", 1.8);
      pop("#lb-vok", ${t(LS[3] + 1.6)}, 0.3); fadeIn("#lpdbox", ${t(TM.pc)}, 0.4); pop("#lb-pc", ${t(TM.pc + 0.1)}, 0.3);
      // ===== L4 让签名人打开一个文件：文件飞进笔记本
      out("#lb-pc", ${t(LS[4] - 0.2)}, 0.2);
      fadeIn("#fdoc", ${t(TM.file - 0.9)}, 0.3); X5.fly(tl, "fdocm", ${t(TM.file - 0.6)}, ${f(-DOCOFF[0])}, ${f(-DOCOFF[1])}, 0.9, 80);
      tl.to("#fdocm", { scale: 0.3, transformOrigin: "50% 50%", duration: 0.3 }, ${t(TM.file + 0.2)}); out("#fdoc", ${t(TM.file + 0.4)}, 0.2);
      // ===== L5 显示的一切都可能是假的：屏幕翻红，字一样
      fadeIn("#lpd0-scr2", ${t(LS[5] + 0.4)}, 0.4); pop("#lb-same", ${t(TM.fake - 0.2)}, 0.3);
      // ===== L6 比喻：金库三道门，三人各管一把钥匙
      out("#lb-same, #lb-vok, #lpdbox", ${t(LS[6] - 0.2)}, 0.2); cam(${t(LS[6])}, "vaultD", 1.3); pop("#ev-meta", ${t(LS[6] + 0.2)}, 0.3);
      [0, 1, 2].forEach((i) => { fadeIn("#door" + i, ${t(TM.doors - 0.3)} + i * 0.15, 0.3); pop("#lb-d" + i, ${t(TM.doors)} + i * 0.15, 0.25); });
      ${[0, 1, 2].map((i) => `fadeIn("#kdw${i}", ${t(TM.keys - 0.4 + i * 0.15)}, 0.25); X5.fly(tl, "kdm${i}", ${t(TM.keys - 0.2 + i * 0.15)}, ${KEYTO(i).map(f).join(", ")}, 0.8, 40); pop("#lb-s${i}", ${t(TM.keys + 0.6 + i * 0.15)}, 0.25);`).join("\n      ")}
      // ===== L7 三封老同事的来信依次走到三人身边
      ${[0, 1, 2].map((i) => { const [x, y] = at(S.rel(L.SIGNERS[i], 70, 60)); return `fadeIn("#ltw${i}", ${t(LS[7] + 0.2 + i * 0.5)}, 0.25); X1.walk(tl, "lt${i}", ${t(TM.letter - 1.0 + i * 0.5)}, 1.1, [[${f(x)}, ${f(y)}]]);`; }).join("\n      ")}
      pop("#lb-ltr", ${t(TM.letter)}, 0.3);
      // ===== L8 关键画面：记错门号，钥匙插向错门，门框红虚线
      out("#lb-ltr", ${t(LS[8] - 0.2)}, 0.2);
      ${[0, 1, 2].map((i) => `out("#lb-s${i}", ${t(TM.forget - 0.1 + i * 0.35)}, 0.15); pop("#lb-w${i}", ${t(TM.forget + i * 0.35)}, 0.3); X5.fly(tl, "kdm${i}", ${t(TM.forget + 0.4 + i * 0.35)}, ${KEYDOOR(i).map(f).join(", ")}, 0.9, 30); fadeIn("#doorR${WRONG[i]}", ${t(TM.forget + 1.2 + i * 0.35)}, 0.3);`).join("\n      ")}
      // ===== L9 比喻不成立：不需要同时骗三个人，两封信淡出
      out("#ev-meta", ${t(LS[9] - 0.1)}, 0.15); pop("#ev-no", ${t(LS[9])}, 0.3);
      out("#ltw1, #ltw2, #lb-w1, #lb-w2, #kdw1, #kdw2, #doorR${WRONG[1]}, #doorR${WRONG[2]}", ${t(TM.three)}, 0.5);
      // ===== L10 共用同一个前端，攻破几台 + 篡改前端 → 凑够门槛
      out("#ev-no, #ltw0, #lb-w0, #kdw0, #doorR${WRONG[0]}, #door0, #door1, #door2, #lb-d0, #lb-d1, #lb-d2", ${t(LS[10] - 0.2)}, 0.2);
      cam(${t(LS[10])}, "signD", 1.3);
      fadeIn("#feln", ${t(TM.fe)}, 0.5); pop("#lb-fe", ${t(TM.fe + 0.2)}, 0.3);
      fadeIn("#lpd1-scr2", ${t(TM.hack + 0.3)}, 0.3);
      out("#lb-fe", ${t(TM.tamper - 0.1)}, 0.15); fadeIn("#fe-page2", ${t(TM.tamper)}, 0.4);
      X5.fill(tl, "tm", ${t(TM.th - 0.6)}, 2, 0.8); pop("#lb-th", ${t(TM.th + 0.2)}, 0.3);
      // ===== L11 五样东西：拉到全景，上方五个空槽
      out("#lb-th, #feln", ${t(LS[11] - 0.2)}, 0.2); cam(${t(LS[11])}, "wide", 2.0);
      fadeIn("#slots", ${t(TM.five)}, 0.4);
      // ===== L12–L16 逐一点亮：红圈 + 编号 + 填槽
      grow("pcA", ${t(TM.f[1] - 0.4)}, 0.4); grow("atkB", ${t(TM.f[4] - 0.4)}, 0.4);
      ${TM.f.map((x, i) => `fadeIn("#ring${i}", ${t(x)}, 0.3); pop("#n${i}", ${t(x + 0.1)}, 0.25); pop("#sf${i}", ${t(x + 0.2)}, 0.3);`).join("\n      ")}
      // ===== L17 公开通报：朝鲜相关组织最活跃
      pop("#ev-src", ${t(TM.src)}, 0.3);
      // ===== L18 手法被复用：槽下青蓝横线"防的是手法"
      fadeIn("#hand-ln", ${t(TM.reuse)}, 0.4); pop("#hand-tx", ${t(TM.reuse + 0.3)}, 0.3);
`,
});
