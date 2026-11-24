// ep24/seg1「① 不含密码」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.callB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   homeA        A 用户 + 来电手机 + 信箱 + 硬件钱包 + 包裹 + SIM + 两只邮箱 + 白名单 + 两个攻击者，右侧留给题卡（seg1 L8–L13 终点；seg2 起点、L8–L12；seg6 L2–L10）
//   bookA        A–B 之间的肥羊通讯录 + 银行流水卡 + 上方链条 + 用户家（seg2 L3–L7 比喻）
//   callB        B 三个客服工位 + 客服后台 + 招募者 + 收买信封 + 导出摞 + 密码私钥框 + 点阵（seg1 起点 L0–L7）
//   backB        B 客服后台特写 + 导出摞 + 密码私钥框 + 收买信封 + 客服 2 工位（seg2 L13–L19 终点；seg3 起点；seg6 L0–L1）
//   streetC      C 四个摊位全景 + 点阵 + 论坛牌，支管从左边 B 接过来（seg3 L0–L1、L5–L6）
//   stall1C      C 摊位近景 ①–④（seg3 L2–L8 / L9–L12 / L13–L15 / L16–L18），①③④ 含各自的点阵 DOTS_C[0..2]
//   stall2C      
//   stall3C      
//   stall4C      
//   weakC        C 放大镜停在一个摊位上，四家都在画内（seg3 L19 终点；seg4 起点）
//   plazaD       D 链 + 四个地址 + 放大镜 + 交易所柜台 + 混币器 + 时钟 + 社交页手机（seg4 L0–L10）
//   coinjoinD    D 四个人 + 4 进 4 出的币 + 交易节点（seg4 L11–L14）
//   courtD       D 法庭天平 + 判决 / 上诉维持 + 放大镜落点 + 混币器 + 交易所柜台（seg4 L15–L23 终点；seg5 起点）
//   ctrlE        E 控制室全部防御物件（遮蔽屏幕、最小权限、导出审批、查询登记、告警、水印、合同 / 通知、提币冷却、工单权限、数据清单、暗网牌）；
//   archiveE     E 链上档案：公链、哈希漏斗、枚举机、盐罐、承诺箱、密钥、挂锁、节点（seg5 L14–L21 终点；seg6 起点）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   wide         整条数据街全景：A → E（seg6 L11–L12 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.homeA

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E7, E22, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
/** 不支持 opts.scale 的物件：绕地面点缩放一层，并换算 anchors */
const putW = (key, o, r, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${(extra.wrap ?? ((s) => s))(svg)}</g>` });
  for (const n of Object.keys(A[key])) if (Array.isArray(A[key][n])) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k];
};
/** 屏幕点 → 世界画布点（在镜头 camName 下） */
const inv = (camName, [sx, sy]) => { const c = L.CAMS[camName]; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; };
const R = L.world.rects;

// ---------------------------------------------------------------- 石板路 + 数据管（最底层）
{
  const P = [[-1600, -110], [5600, -110], [5600, 110], [-1600, 110]].map(([u, v]) => Wp(u, v).map((n) => n.toFixed(1)).join(","));
  const [a0, a1] = [Wp(-1600, 0), Wp(5600, 0)];
  add({ u: -99999, v: -99999 }, `<polygon points="${P.join(" ")}" fill="#ddd7cc" stroke="#cfc8bb" stroke-width="2"/>
    <line x1="${a0[0]}" y1="${a0[1]}" x2="${a1[0]}" y2="${a1[1]}" stroke="#2aa3c9" stroke-width="6" stroke-linecap="round" opacity="0.55"/>`, -1e6);
}

// ---------------------------------------------------------------- 世界物件 · B 外包客服中心
put("signB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "signB", style: "plate", text: "外包客服中心", size: 34 }));
put("ldg", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ldg" }));
const tickets = (hot) => `<rect x="0" y="0" width="148" height="16" fill="${hot ? "#1d93ba" : "#ece7dd"}"/>` +
  [0, 1, 2, 3].map((i) => `<rect x="8" y="${24 + i * 16}" width="12" height="10" rx="2" fill="${hot ? ["#1f9d55", "#2aa3c9", "#e0453a", "#2aa3c9"][i] : "#ddd6c9"}"/><rect x="26" y="${25 + i * 16}" width="${[100, 80, 110, 70][i]}" height="8" rx="4" fill="${hot ? "#9fb7c2" : "#e5dfd4"}"/>`).join("");
L.DESKS.forEach((q, i) => putW("dk" + i, q, O.desk(q, { id: "dk" + i, screen: tickets(false), screen2: tickets(true) })));
L.AGENTS.forEach((q, i) => put("ag" + i, q, O.person(q, { id: "ag" + i, role: "engineer", scale: q.scale })));
put("rec", L.RECRUITER, O.person(L.RECRUITER, { id: "rec", role: "attacker", scale: L.RECRUITER.scale }));
// 收买信封 + 露出的币（开场隐藏，L1 出现并滑向客服 2）
const bribeW = (s) => `<g class="bribe-g" opacity="0">${s}</g>`;
put("bribe", L.BRIBE, O.envelope(L.BRIBE, { id: "bribe", w: L.BRIBE.w, h: L.BRIBE.h }), 0, { wrap: bribeW });
L.BRIBE_COINS.forEach((q, i) => put("bc" + i, q, E7.oddCoin(q, { id: "bc" + i, scale: q.scale }), 2, { wrap: bribeW }));
// 落到客服 2 桌面上的那只信封（画在桌子之后）
{
  const o = L.DESKS[1], [gx, gy] = at(o), dz = -114 * 0.866 * 0.65;
  put("bribe2", o, O.envelope(o, { id: "bribe2", w: 80, h: 50 }), 400,
    { wrap: (s) => `<g id="bribe2-w" opacity="0" transform="translate(24,${dz.toFixed(1)})">${s}</g>` });
  void gx; void gy;
}
// 导出文件摞：3 张立起的"导出"，从后台飞出叠成一摞
const EXP = [0, 1, 2].map((i) => ({ ...S.rel(L.STACK_B, 22 - i * 22, -8 + i * 8), w: L.STACK_B.w, h: L.STACK_B.h }));
[2, 1, 0].forEach((i) => put("exp" + i, EXP[i], O.doc(EXP[i], { id: "exp" + i, standing: true, w: EXP[i].w, h: EXP[i].h, title: "导出", lines: ["姓名 · 余额"] }), 0,
  { wrap: (s) => `<g id="exp${i}-w" opacity="0">${s}</g>` }));
// 密码 / 私钥：灰色虚线框里，画在数据摞之外
{
  const [vx, vy] = at(L.VAULT_B);
  add(L.VAULT_B, `<rect x="${vx}" y="${vy}" width="290" height="200" rx="18" fill="#f4f1ea" fill-opacity="0.6" stroke="#9a9488" stroke-width="3" stroke-dasharray="12 9"/>`, -300);
}
putW("lkB", L.PADLOCK_B, O.padlock(L.PADLOCK_B, { id: "lkB", key: false }));
putW("keyB", L.KEY_B, O.key(L.KEY_B, { id: "keyB" }));
// 点阵：69 点（青蓝，每点约 1000 名用户）→ 40 点（18 实心红 + 22 空心红，每点约 1000 万美元）
{
  const [dx, dy] = at(L.DOTS_B);
  const d69 = [], d40 = [];
  for (let i = 0; i < 69; i++) d69.push(`<circle class="d69-r${Math.floor(i / 10)}" opacity="0" cx="${dx + 14 + (i % 10) * 23}" cy="${dy + 14 + Math.floor(i / 10) * 20}" r="7.5" fill="#2aa3c9"/>`);
  for (let i = 0; i < 40; i++) d40.push(`<circle cx="${dx + 22 + (i % 8) * 28}" cy="${dy + 18 + Math.floor(i / 8) * 28}" r="9.5" fill="${i < 18 ? "#e0453a" : "#fdf0ee"}" stroke="#e0453a" stroke-width="2.6"/>`);
  add(L.DOTS_B, `<g id="d69">${d69.join("")}</g>` + S.hid("d40", d40.join("")), -200);
}
// 客服 2 身上一圈红色虚线
{
  const r = R.agents[1], cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
  add(L.AGENTS[1], S.hid("ring2", `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="78" fill="none" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="10 7"/>`), 30);
}

// ---------------------------------------------------------------- 世界物件 · A 用户家（L8 起的终点画面；冒充者不出现）
put("signA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "signA", style: "plate", text: "用户家", size: 34 }));
put("userA", L.USER_A, O.person(L.USER_A, { id: "userA", role: "signer", scale: L.USER_A.scale }));
const callScr = `<rect x="0" y="0" width="76" height="150" fill="#1f2a33"/><circle cx="38" cy="44" r="16" fill="#3c4b57"/><circle cx="38" cy="40" r="6" fill="#9fb2bf"/><path d="M27 54q11 -9 22 0" fill="#9fb2bf"/>
  <rect x="12" y="70" width="52" height="8" rx="4" fill="#ffffff"/><rect x="20" y="84" width="36" height="6" rx="3" fill="#7d8f9b"/>
  <circle cx="20" cy="124" r="11" fill="#e0453a"/><circle cx="56" cy="124" r="11" fill="#1f9d55"/>`;
putW("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA", screen2: callScr }));
put("addrA", L.ADDR_A, E2.addrPlate(L.ADDR_A, { id: "addrA", text: "住址" }));
put("hwA", L.HW_A, O.hwWallet(L.HW_A, { id: "hwA" }));
put("parA", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "parA", scale: L.PARCEL_A.scale }));
put("simA", L.SIM_A, E22.simCard(L.SIM_A, { id: "simA", scale: L.SIM_A.scale, label: "手机号" }));
L.ENV_A.forEach((q, i) => put("envA" + i, q, O.envelope(q, { id: "envA" + i, w: q.w, h: q.h })));
put("wlA", L.WL_A, O.doc(L.WL_A, { id: "wlA", standing: true, w: L.WL_A.w, h: L.WL_A.h, title: "白名单", lines: ["提币地址"] }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-bribe", up(A.ag1.top, 8), "被收买", "lab-rs lab-sm");
lb("lb-ldg", inv("callB", [966, 600]), "客服后台", "lab-ink lab-sm", "t");
lb("lb-d69", inv("callB", [625, 268]), "69461 名用户", "lab-cs lab-sm");
lb("lb-d69k", inv("callB", [625, 408]), "每点约 1000 名", "lab-g lab-sm", "t");
lb("lb-d40", inv("callB", [625, 268]), "约 1.8 亿到 4 亿美元 · SEC 文件估算", "lab-rs lab-sm");
lb("lb-d40k", inv("callB", [625, 414]), "每点约 1000 万美元", "lab-r lab-sm", "t");
const FIELDS = [["姓名", 1040, 384], ["联系方式", 1205, 384], ["证件图像", 1055, 338], ["余额", 1215, 338], ["交易记录", 1130, 292]];
FIELDS.forEach(([s, x, y], i) => lb("lb-f" + i, inv("callB", [x, y]), s, "lab-cs lab-sm"));
lb("lb-vault", inv("callB", [1405, 444]), "不在数据里", "lab-g lab-sm");
lb("lb-lk", [A.lkB.ground[0], A.lkB.ground[1] + 8], "密码", "lab-ink lab-sm", "t");
lb("lb-key", [A.keyB.ground[0] + 14, A.keyB.ground[1] + 10], "私钥", "lab-ink lab-sm", "t");
lb("lb-safe", inv("callB", [1530, 530]), "照理说：安全？", "lab-g lab-sm", "l");
lb("lb-comp", inv("callB", [90, 560]), "赔偿被骗用户", "lab-rs lab-sm", "l");
lb("lb-call", inv("homeA", [720, 420]), "来电：交易所客服", "lab-cs lab-sm", "r");
const BUB = [["你的名字", 400], ["你的余额", 455], ["上周的工单", 510]];
BUB.forEach(([s, y], i) => lb("lb-b" + i, inv("homeA", [850, y]), `${s} <span style="color:#1f9d55">✓</span>`, "lab-ok lab-sm", "l"));
lb("lb-b3", inv("homeA", [850, 565]), "请转到安全钱包", "lab-rs lab-sm", "l");
lb("lb-leak", inv("homeA", [1700, 440]), "导出的数据", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
S.curve("cv-left", [1100, 545], [80, 720], { color: "#e0453a" });
S.curve("cv-comp", [520, 340], [80, 540], { color: "#e0453a" });
S.curve("cv-out", [760, 612], [300, 870], { color: "#e0453a" });
S.curve("cv-leak", [835, 455], [1885, 395], { color: "#2aa3c9", c1: [1150, 330], c2: [1600, 330] });
const html =
  evt("ev0", `<b>Coinbase</b> · 2025 年 5 月`) +
  evt("ev1", `来源：Coinbase SEC 8-K 文件`, { top: 206, color: "#8a8478" }) +
  `<div class="quiz hide" id="quiz"><div class="quiz-h">先猜</div><div class="quiz-q hide" id="quiz-q">叫得出名字、余额、工单<br><b>他是真客服吗？</b></div></div>`;
const css = `
  .lab-ok { border-color: #1f9d55; color: #1c1c1c; }
  .quiz { position: absolute; left: 1360px; top: 290px; width: 480px; transform-origin: 100% 0%; }
  .quiz-h { display: inline-block; background: #1c1c1c; color: #fff; font-size: 44px; font-weight: 900; padding: 8px 30px 10px; border-radius: 14px; }
  .quiz-q { margin-top: 18px; background: #fff; border-radius: 18px; border-left: 8px solid #e0453a; padding: 20px 26px 22px; font-size: 36px; font-weight: 800;
    line-height: 1.45; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
  .quiz-q b { color: #c3352b; font-size: 46px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  gang: w("犯罪团伙", 0), buy: w("收买", 1), exp: w("导出", 2),
  f: ["姓名", "联系方式", "证件图像", "余额", "交易记录"].map((s) => w(s, 3)),
  pw: w("密码", 4), pk: w("私钥", 4), key: w("钥匙", 5), est: w("估算", 6), amt: w("1.8", 6), comp: w("赔偿", 7),
  call: w("电话", 9), b: [w("名字", 10), w("余额", 10), w("工单", 10)], risk: w("风险", 11), safe: w("安全钱包", 11), leak: w("泄露", 13),
};
const t = (x) => f(x);
const [bx, by] = at(L.BRIBE), [d2x, d2y] = at(L.DESKS[1]);
const SLIDE = { x: f(d2x + 24 - bx), y: f(d2y - 114 * 0.866 * 0.65 - by) };

S.build({
  cam0: "callB", sub: "没有密码，也能骗走钱",
  grid: { u0: -2000, u1: 5700, v0: -4000, v1: 3700 }, box: [-1200, -2000, 5300, 2800],   // 覆盖本段镜头 callB / homeA
  shown: [], css, html,
  terms: [
    { id: "t0", t: "外包客服", d: "交易所把客服交给另一家公司来做", at: w("外包客服", 0) },
    { id: "t1", t: "SEC", d: "美国证券交易委员会", at: w("SEC", 6) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2025 年 5 月，一个犯罪团伙，找上了 Coinbase 的外包客服。
      fadeIn("#dk0-scr2, #dk1-scr2, #dk2-scr2", ${t(LS[0] + 0.4)}, 0.4); pop("#lb-ldg", ${t(LS[0] + 0.8)}, 0.25);
      pop("#ev0", ${t(LS[0] + 0.6)}); pop("#ev1", ${t(LS[0] + 1.0)});
      tl.fromTo("#rec", { x: -110, y: 38 }, { x: 0, y: 0, duration: 1.6, ease: "power1.inOut", immediateRender: false }, ${t(TM.gang)});
      // ===== L1 他们没去撬钱包，只是花钱，收买了客服。
      out("#ev0, #ev1", ${t(LS[1] + 0.2)}); fadeIn(".bribe-g", ${t(LS[1] + 0.4)}, 0.3);
      tl.to(".bribe-g", { x: ${SLIDE.x}, y: ${SLIDE.y}, duration: 1.3, ease: "power2.inOut" }, ${t(TM.buy - 1.6)});
      out(".bribe-g", ${t(TM.buy - 0.35)}, 0.15); fadeIn("#bribe2-w", ${t(TM.buy - 0.35)}, 0.15);
      fadeIn("#ring2", ${t(TM.buy)}, 0.3); pop("#lb-bribe", ${t(TM.buy + 0.15)});
      // ===== L2 被收买的人，从客服工具里，导出了 69461 名用户的数据。
      flash("#ldg", ${t(TM.exp - 0.4)}, 4, 0.5);
      [0, 1, 2].forEach((i) => tl.fromTo("#exp" + i + "-w", { x: ${f(at(L.LEDGER)[0] - at(L.STACK_B)[0])}, y: -60, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${t(TM.exp)} + i * 0.45));
      [0, 1, 2, 3, 4, 5, 6].forEach((r) => fadeIn(".d69-r" + r, ${t(TM.exp + 1.0)} + r * 0.28, 0.2));
      pop("#lb-d69", ${t(TM.exp + 1.2)}); pop("#lb-d69k", ${t(TM.exp + 1.6)}); flash("#ldg", ${t(TM.exp + 2.6)}, 2, 0.6);
      // ===== L3 姓名、联系方式、证件图像、余额、交易记录。
      out("#lb-bribe, #ring2", ${t(LS[3] - 0.2)});
      ${JSON.stringify(TM.f.map((x) => +f(x)))}.forEach((tt, i) => pop("#lb-f" + i, tt, 0.25));
      // ===== L4 可这份数据里，没有密码，也没有私钥。
      pop("#lb-lk", ${t(TM.pw)}); pop("#lb-key", ${t(TM.pk)}); pop("#lb-vault", ${t(TM.pk + 0.3)});
      draw("cv-left", ${t(TM.pk + 0.5)}, 0.8);
      // ===== L5 没有钥匙，照理说，打不开任何一个账户。
      tl.to("#keyB", { rotation: 7, transformOrigin: "50% 50%", duration: 0.15, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${t(TM.key)});
      pop("#lb-safe", ${t(TM.key + 0.8)});
      // ===== L6 可 Coinbase 在提交给 SEC 的文件里估算，这次事件，要花掉约 1.8 亿到 4 亿美元。
      out("#cv-left, #lb-safe", ${t(LS[6] - 0.2)}); pop("#ev1", ${t(LS[6] + 0.4)});
      out("#d69, #lb-d69, #lb-d69k", ${t(TM.amt - 0.5)}, 0.3); fadeIn("#d40", ${t(TM.amt - 0.2)}, 0.4);
      pop("#lb-d40", ${t(TM.amt)}); pop("#lb-d40k", ${t(TM.amt + 0.4)});
      // ===== L7 其中一项，是赔偿被冒充客服骗走资金的用户。
      out("#ev1", ${t(LS[7])}); draw("cv-comp", ${t(TM.comp - 0.3)}, 0.7); pop("#lb-comp", ${t(TM.comp + 0.3)});
      // ===== L8 先猜一道题。
      out("#lb-ldg, [id^=lb-f], #lb-lk, #lb-key, #lb-vault, #lb-d40, #lb-d40k, #lb-comp, #cv-comp", ${t(LS[8] - 0.2)});
      cam(${t(LS[8] - 0.1)}, "homeA", 1.5, "power2.inOut"); pop("#quiz", ${t(LS[8] + 0.6)});
      // ===== L9 一天，你接到电话，对方自称交易所客服。
      fadeIn("#phA-scr2", ${t(TM.call - 0.2)}, 0.2);
      tl.to("#phA", { x: 3, duration: 0.05, yoyo: true, repeat: 15, ease: "none" }, ${t(TM.call)});
      pop("#lb-call", ${t(TM.call + 0.3)}); tl.to("#userA", { x: 10, duration: 0.4, ease: "power1.out" }, ${t(TM.call + 0.4)});
      // ===== L10 他叫得出你的名字，说得出你的余额，还知道你上周提过的工单。
      ${JSON.stringify(TM.b.map((x) => +f(x)))}.forEach((tt, i) => pop("#lb-b" + i, tt, 0.25));
      // ===== L11 他说你的账户有风险，请你把资产，转到一个安全钱包。
      pop("#lb-b3", ${t(TM.safe - 0.3)}); draw("cv-out", ${t(TM.safe)}, 0.7);
      // ===== L12 他是真客服吗？
      pop("#quiz-q", ${t(LS[12])}, 0.35);
      // ===== L13 带着这个问题，我们看看，泄露的数据怎样变成攻击。
      out("#lb-b0, #lb-b1, #lb-b2, #lb-b3, #cv-out, #lb-call", ${t(LS[13] - 0.1)});
      tl.to("#quiz", { y: -170, scale: 0.8, duration: 0.6, ease: "power2.inOut" }, ${t(LS[13] + 0.2)});
      draw("cv-leak", ${t(TM.leak - 0.4)}, 0.9); pop("#lb-leak", ${t(TM.leak + 0.4)});
`,
});
