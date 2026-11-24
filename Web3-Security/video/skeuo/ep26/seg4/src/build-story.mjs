// ep26/seg4「④ 冲着人来」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.panelB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整条智能体大街（seg2 L0–L5 放大器、seg6 L16 结束卡）
//   vaultA       A 奖池保险柜 + Freysa + 玩家 + 新会话文件 + 金币 + 点阵（seg1 起点 L0–L7）
//   ruleA        A 提示词文件 + 合约机器 + 转账请求信封（seg1 L8–L11 终点；seg2 起点）
//   aideA        A 右半助理角：新助理 + 支付卡 + 递纸条的人（seg2 L6–L15）
//   crossA       A 五岔路口五块牌（seg2 L16–L20）
//   workshopB    B 智能体 + 五个入口 + 钱包工具 + 链（seg2 L21 终点；seg3 起点 L0–L4）
//   injectB      B Grok + 智能体 + 会员 NFT 卡 + 屏蔽墙 + 20 点点阵（seg3 L5–L9）
//   memoryB      B 记忆柜 + 伪造历史记录 + 智能体（seg3 L10–L14）
//   toolB        B 工具说明手册 + MCP 包 + 两把私钥（seg3 L15–L18）
//   panelB       B 运维面板 + 攻击者 + 回复信封 + 55.5 ETH + 台秤 + 代币（seg3 L19–L24 终点；seg4 起点）
//   meetC        C 笔记本视频会议 + 扩展包裹 + 手机视频 + 换脸面具 + 诈骗集团 + 受害者（seg4 L0–L6）
//   kycC         C 相机 + 护照 + 注入电缆 + 钓鱼信 + 暗语 + 家人 + 换渠道确认 + 点阵（seg4 L7–L18 终点；seg5 起点）
//   benchD       D 阅卷机 + 答题卡 + 审计 AI + 放大镜 + 合约机器 + 沙漏 + 点阵（seg5 L0–L9）
//   oracleD      D 开发机 + 工程师 + 报价机 + 幽灵指针 + 坏账点阵（seg5 L10–L14；代码卡 A 在左侧）
//   supplyD      D 假扩展 + 荒地抢注 + 三张工位 + 内部 AI 机柜（seg5 L15–L18）
//   defendD      D 盾 + 工程师 + 审计 AI + 放大镜（seg5 L19–L20 终点；seg6 起点）
//   gateE        E 加固智能体 + 输入隔离墙 + 三道关卡 + 低额钱包 + 主资产 + 额度表 + 确认设备 + 记忆 / 余额 / 面板（seg6 L0–L9）
//   userE        E 右端用户角（seg6 L10–L11）
//   answerE      E 合约限额机器 + 被拒的信封 + 小提示词文件 + 三道关卡（seg6 L12–L15）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.kycC

// 段内专用镜头：L4–L6 微移到笔记本 + 员工 + 扩展包裹
const MEETLAP = L.fit([L.rect(L.C_LAPTOP, "laptop"), L.rect(L.C_EMPLOYEE, "person"), L.rect(L.C_EXT, "parcel")], [360, 300, 1560, 860], 1.25);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, meetLap: MEETLAP }, ext: [X, E1, E5, E7, E11, E13] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// C 区本地坐标（同 layout.mjs 的 zone(9300)）
const cz = (Xs, Ys, extra = {}) => ({ u: Math.round(9300 + 0.8192 * Xs - 1.1472 * Ys), v: Math.round(0.5736 * Xs + 1.6383 * Ys), ...extra });
// 世界画布点 → 地面 (u, v)（Wp 的逆，z = 0）
const inv = ([x, y]) => { const det = 0.819 * 0.410 + 0.574 * 0.287; return { u: Math.round((x * 0.410 - y * 0.574) / det), v: Math.round((0.287 * x + 0.819 * y) / det) }; };
// 不支持 scale 的物件：绕地面点包一层并换算 anchors；hide = 外层隐藏组 id
const wrapK = (o, k, inner = (s) => s) => { const [gx, gy] = at(o); return (svg) => inner(`<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`); };
const wput = (key, o, r, k, dy = 0, inner) => {
  put(key, o, r, dy, { wrap: wrapK(o, k, inner) });
  const [gx, gy] = at(o);
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const hidMv = (gid) => (svg) => S.hid(gid, `<g id="${gid}-mv">${svg}</g>`);

// ---------------------------------------------------------------- 路面 + 资金管（B 右半 → C）
{
  const U0 = 4900, U1 = 12700, P = [[U0, -110], [U1, -110], [U1, 110], [U0, 110]].map(([u, v]) => Wp(u, v, 0));
  add({ u: U0, v: -110 }, `<polygon points="${P.map((q) => q.map((x) => f(x)).join(",")).join(" ")}" fill="#dcd8d0" stroke="#c9c3b7" stroke-width="2"/>`, -20000);
  const po = { u: U0, v: 0 };
  put("pipe", po, E1.pipe(po, { id: "pipe", pts: [[0, 0, 4], [U1 - U0, 0, 4]], r: 8 }), -19000);
}

// ---------------------------------------------------------------- B 运维面板角（上一段终点 panelB 的物件，开场 2 秒用）
wput("fp", L.B_PANEL, E5.funcPanel(L.B_PANEL, { id: "fp", title: "运维面板" }), 0.6);
put("batk", L.B_ATK, O.person(L.B_ATK, { id: "batk", role: "attacker", scale: 0.5 }));
L.B_REPLIES.forEach((q, i) => put("rep" + i, q, E1.letter(q, { id: "rep" + i, w: 60, h: 40, state: "attacker" })));
put("eth", L.B_ETH, E7.oddCoin(L.B_ETH, { id: "eth", scale: 0.5 }));
put("bsc", L.B_SCALE, E7.scale(L.B_SCALE, { id: "bsc", scale: 0.7 }));
L.B_TOKENS.forEach((q, i) => put("tok" + i, q, E7.oddCoin(q, { id: "tok" + i, scale: q.scale })));
lb("lb-fp", up(A.fp.top, 6), "运维面板", "lab-ink lab-sm");
lb("lb-bsc", up(A.bsc.top, 6), "钱包状态", "lab-ink lab-sm");

// ---------------------------------------------------------------- C 会议室
const SW = 222, SH = 146, cw = SW / 2, ch = SH / 2;
const head = (x, y, col = "#5f6670") => `<circle cx="${x}" cy="${y - 12}" r="11" fill="${col}"/><path d="M${x - 22} ${y + 26} Q${x - 22} ${y + 4} ${x} ${y + 4} Q${x + 22} ${y + 4} ${x + 22} ${y + 26}Z" fill="${col}"/>`;
const cell = (i, name, bg) => { const x = (i % 2) * cw, y = Math.floor(i / 2) * ch;
  return `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" fill="${bg}"/>${head(x + cw / 2, y + 34)}<rect x="${x + 4}" y="${y + ch - 18}" width="${name.length * 13 + 8}" height="15" rx="3" fill="#1c1c1c" opacity="0.7"/><text x="${x + 8}" y="${y + ch - 6}" font-size="12" fill="#fff" font-family="Noto Sans SC, sans-serif">${name}</text>`; };
const vcScreen = `<rect x="0" y="0" width="${SW}" height="${SH}" fill="#2f3237"/>` + cell(0, "高管", "#e9e4da") + cell(1, "同事", "#dfe6ea") + cell(2, "同事", "#e3e8e1") + cell(3, "你", "#ece7dd") +
  `<rect id="vc-red" opacity="0" x="2" y="2" width="${cw - 4}" height="${ch - 4}" fill="none" stroke="#e0453a" stroke-width="5"/>`;
wput("lap", L.C_LAPTOP, O.laptop(L.C_LAPTOP, { id: "lap", screen: vcScreen }), 0.8);
put("emp", L.C_EMPLOYEE, O.person(L.C_EMPLOYEE, { id: "emp", role: "signer", scale: 0.5 }));
put("ext", L.C_EXT, E7.parcel(L.C_EXT, { id: "ext", scale: 0.8, state: "attacker" }), 0, { wrap: hidMv("extg") });
{ const [x0, y0, x1, y1] = L.rect(L.C_EXT, "parcel"), pd = 14;
  add(L.C_EXT, S.hid("ext-bad", `<rect x="${f(x0 - pd)}" y="${f(y0 - pd)}" width="${f(x1 - x0 + 2 * pd)}" height="${f(y1 - y0 + 2 * pd)}" rx="8" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>` +
    `<path d="M${f(x0 - pd)} ${f(y0 - pd)} L${f(x1 + pd)} ${f(y1 + pd)} M${f(x1 + pd)} ${f(y0 - pd)} L${f(x0 - pd)} ${f(y1 + pd)}" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/>`), 2); }
// 手机视频通话：屏幕 1 = 来电画面，屏幕 2 = 女性剪影（换脸后）
const callScr = `<rect x="0" y="0" width="76" height="150" fill="#2f3237"/><rect x="0" y="0" width="76" height="24" fill="#3b3e44"/><text x="38" y="17" text-anchor="middle" font-size="11" fill="#cfd3d8" font-family="Noto Sans SC, sans-serif">视频通话</text>${head(38, 80, "#6b717a")}`;
const womanScr = `<rect x="0" y="0" width="76" height="150" fill="#f3e7e4"/><path d="M18 100 Q14 40 38 38 Q62 40 58 100Z" fill="#3b3e44"/><circle cx="38" cy="66" r="15" fill="#d9b8a8"/><path d="M8 150 Q10 108 38 106 Q66 108 68 150Z" fill="#c9566a"/>`;
wput("cph", L.C_PHONE, O.phone(L.C_PHONE, { id: "cph", screen: callScr, screen2: womanScr }), 0.7);
put("mask", L.C_MASK, X.faceMask(L.C_MASK, { id: "mask", scale: 0.8 }));
L.C_SCAM.forEach((q, i) => put("scam" + i, q, O.person(q, { id: "scam" + i, role: "attacker", scale: q.scale }), 0, { grow: true }));
put("vic", L.C_VICTIM, O.person(L.C_VICTIM, { id: "vic", role: "signer", scale: 0.45 }), 0, { grow: true });
put("sgC0", L.C_SIGN[0], E1.signBoard(L.C_SIGN[0], { id: "sgC0", style: "plate", text: "会议室", size: 40 }));

// ---------------------------------------------------------------- C 开户台
put("kcam", L.C_CAMERA, E11.snapshotCamera(L.C_CAMERA, { id: "kcam", scale: 0.6, photo: "活体检测", sub: "" }));
put("kpp", L.C_PASSPORT, E13.passport(L.C_PASSPORT, { id: "kpp", scale: 0.7, title: "KYC" }));
{ const [sx, sy] = at(L.C_CABLE), [ex, ey] = A.kcam.body ?? A.kcam.center;
  add(L.C_CABLE, S.hid("cable", `<path d="M${f(sx)} ${f(sy)} C${f(sx + 80)} ${f(sy + 40)} ${f(ex - 90)} ${f(ey + 30)} ${f(ex - 14)} ${f(ey)}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8" stroke-linecap="round"/>` +
    `<rect x="${f(sx - 14)}" y="${f(sy - 9)}" width="28" height="18" rx="4" fill="#e0453a"/><circle cx="${f(ex - 14)}" cy="${f(ey)}" r="7" fill="#e0453a"/>`), 30); }
const PH0 = at(L.C_PHISH[0]);
L.C_PHISH.forEach((q, i) => put("ph" + i, q, E1.letter(q, { id: "ph" + i, w: 60, h: 40 }), 0, { wrap: hidMv("phg" + i) }));
// 放大镜：镜片落在第 4 封信上（wrap 0.55）
const MK = 0.55, mg0 = O.magnifier({ u: 0, v: 0 }, { id: "tmp" }).anchors, g0 = at({ u: 0, v: 0 });
const LET3 = A.ph3.center, MAG = inv([LET3[0] - MK * (mg0.lens[0] - g0[0]), LET3[1] - MK * (mg0.lens[1] - g0[1])]);
wput("mag", MAG, O.magnifier(MAG, { id: "mag" }), MK, 40, (s) => S.hid("magg", s));
put("code", L.C_CODE, O.doc(L.C_CODE, { id: "code", w: 90, h: 110, title: "暗语" }), 0, { grow: true });
L.C_FAMILY.forEach((q, i) => put("fam" + i, q, O.person(q, { id: "fam" + i, role: "signer", scale: q.scale }), 0, { grow: true }));
const okScr = `<rect x="0" y="0" width="76" height="150" fill="#e6f4ec"/><circle cx="38" cy="72" r="24" fill="#1f9d55"/><path d="M26 72 L35 82 L51 62" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
wput("cfm", L.C_CONFIRM, O.phone(L.C_CONFIRM, { id: "cfm", screen2: okScr }), 0.7, 0, (s) => S.hid("cfmg", s));
const RP = cz(1080, -230, { scale: 0.6 });
put("rp", RP, E7.parcel(RP, { id: "rp", scale: 0.6, state: "attacker" }), 0, { wrap: (s) => S.hid("rpg", s) });
put("sgC1", L.C_SIGN[1], E1.signBoard(L.C_SIGN[1], { id: "sgC1", style: "plate", text: "开户台", size: 40 }));

// 点阵（C_DOTS 区 340×170）：L12 17 点（14 红实 + 3 红空，每点约 10 亿美元）；L13 两根点柱 2 灰 / 9 红
const [DX, DY] = at(L.C_DOTS);
{ let d = ""; for (let i = 0; i < 17; i++) { const r = Math.floor(i / 9), c = i % 9, x = DX + 50 + c * 30, y = DY + 70 + r * 32;
    d += i < 14 ? `<circle cx="${x}" cy="${y}" r="11" fill="#e0453a"/>` : `<circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="#e0453a" stroke-width="3"/>`; }
  add(L.C_DOTS, S.hid("dm", d), -400);
  let c = ""; for (let i = 0; i < 2; i++) c += `<circle cx="${DX + 50}" cy="${DY + 160 - i * 17}" r="7" fill="#9a958c"/>`;
  for (let i = 0; i < 9; i++) c += `<circle cx="${DX + 300}" cy="${DY + 160 - i * 17}" r="7" fill="#e0453a"/>`;
  add(L.C_DOTS, S.hid("dcol", c), -400); }
const MASKI = `<svg width="30" height="34" viewBox="0 0 34 40" style="vertical-align:-6px"><path d="M3 6 Q17 -2 31 6 Q33 26 17 38 Q1 26 3 6Z" fill="#fff" stroke="#1c1c1c" stroke-width="2.5"/><ellipse cx="11" cy="15" rx="4" ry="2.6" fill="#1c1c1c"/><ellipse cx="23" cy="15" rx="4" ry="2.6" fill="#1c1c1c"/></svg>`;
const UPA = `<svg width="34" height="28" viewBox="0 0 34 28" style="vertical-align:-5px"><path d="M2 24 L13 14 L19 19 L31 5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4 L32 4 L32 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-df", up(A.mask.top, 8), "深度伪造 · 视频 / 图像 / 语音", "lab-cs lab-sm");
lb("lb-scam", up(A.scam0.top, 8), "诈骗集团", "lab-rs lab-sm");
lb("lb-27", [A.cph.top[0] + 40, A.cph.top[1]], "拘捕 27 人", "lab-ink", "l");
lb("lb-fake", up(A.vic.top, 8), "假交易平台", "lab-r lab-sm");
lb("lb-36", [A.vic.ground[0] + 30, A.vic.ground[1] + 18], "超过 3.6 亿港元", "lab-rs", "t");
lb("lb-emp", up(A.emp.top, 6), "员工", "lab-ink lab-sm");
lb("lb-mic", up(A.lap.top, 8), "麦克风有问题？", "lab-r");
lb("lb-mal", [A.ext.ground[0], A.ext.ground[1] + 26], "实为恶意脚本", "lab-rs lab-sm", "t");
lb("lb-attr", [A.emp.ground[0] + 40, A.emp.ground[1] + 16], "高置信度归因", "lab-cs lab-sm", "t");
lb("lb-cam", up(A.kcam.top, 6), "活体检测", "lab-cs lab-sm");
lb("lb-kpp", [A.kpp.ground[0] + 20, A.kpp.ground[1] + 14], "KYC", "lab-cs lab-sm", "t");
lb("lb-cable", [at(L.C_CABLE)[0] + 10, at(L.C_CABLE)[1] + 20], "虚拟摄像头注入", "lab-r lab-sm", "t");
lb("lb-mi", [A.kcam.top[0] - 120, A.kcam.top[1] + 10], `${MASKI} 换脸`, "lab-rs lab-sm", "r");
lb("lb-neq", [A.kcam.top[0] - 120, A.kcam.top[1] + 120], "≠ 真人", "lab-r", "r");
lb("lb-up", [DX + 170, DY + 110], `${UPA} 在增长`, "lab-rs");
const LANGS = ["中", "EN", "日", "한", "ES", "FR"];
lb("lb-ph", up(A.ph3.top, 10), LANGS.join(" / "), "lab-ink lab-sm");
lb("lb-q", up(A.mag.lens, 46), "?", "lab-ink q-grey");
lb("lb-qx", up(A.mag.lens, 46), "✕", "lab-rs");
lb("lb-dm", [DX + 170, DY + 40], "已确认约 140 亿美元 · 估算约 170 亿", "lab-rs lab-sm");
lb("lb-c0", [DX + 50, DY + 120], "无关联", "lab-ink lab-sm");
lb("lb-c1", [DX + 300, DY + 176], "有关联 · 约 4.5 倍", "lab-rs lab-sm", "t");
lb("lb-c2", [DX + 300, DY + 4], "单起获利 ↑", "lab-r");
lb("lb-flow", [DX + 170, DY + 110], "防御 · 回到流程", "lab-gs");
lb("lb-rp", up(A.rp.top, 4), "拒绝", "lab-gs lab-sm");
lb("lb-cfm", up(A.cfm.top, 6), "换渠道确认", "lab-gs lab-sm");
lb("lb-code", up(A.code.top, 6), "暗语", "lab-ink lab-sm");
lb("lb-fam", up(A.fam1.top, 6), "家人", "lab-ink lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  evt("ev-hk", `香港警方 · 2024 年 10 月 ${gtag("公开报道")}`, { top: 120 }) +
  evt("ev-rthk", `RTHK · SCMP 报道`, { top: 196 }) +
  evt("ev-zoom", `假 Zoom 会议 · 2025 年 6 月 ${gtag("公开报道")}`, { top: 122 }) +
  evt("ev-hun", `Huntress 分析 ${gtag("第三方分析")}`, { top: 198 }) +
  evt("ev-ip", `iProov · Sumsub ${gtag("厂商自报")}`, { top: 124 }) +
  evt("ev-ch", `Chainalysis ${gtag("第三方分析")}`, { top: 126 }) +
  evt("ev-fbi", `FBI 公告`, { top: 128 });
const css = `.q-grey { color: #8a857c; border-color: #b9b3a8; font-size: 40px; font-weight: 800; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = { mic: w("麦克风", 5), inst: w("扩展", 5), mal: w("恶意脚本", 5), ref: w("拒绝", 17), alt: w("渠道", 17) };
const MV = [A.cph.screen[0] - A.mask.mask[0], A.cph.screen[1] - A.mask.mask[1]];
const EXT0 = [A.lap.screen[0] - A.ext.center[0], A.lap.screen[1] - A.ext.center[1]];
const t = (x) => f(x);

S.build({
  cam0: "panelB", sub: "真人脸，不能证明是真人",
  grid: { u0: 4900, u1: 12700, v0: -3900, v1: 4200 }, box: [4730, -3990, 5110, 3030],   // 盖住本段镜头 panelB / meetC / kycC（含上一段终点 panelB）
  shown: ["#lb-fp", "#lb-bsc"], css, html,
  terms: [
    { id: "t0", t: "归因", d: "判断攻击是谁做的", at: w("归因", 6) },
    { id: "t1", t: "KYC", d: "开户时核验真实身份", at: w("KYC", 8) },
    { id: "t2", t: "活体检测", d: "确认镜头前是真人的检测", at: w("活体检测", 8) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 AI 也被用来骗人。 B 面板角 → C 会议室
      out("#lb-fp, #lb-bsc", 1.5, 0.2); cam(${t(LS[0])}, "meetC", 1.6);
      // ===== L1 深度伪造：面具电路纹闪
      X26.circuit(tl, "mask", ${t(LS[1] + 0.2)}, 0.9, 2); pop("#lb-df", ${t(LS[1] + 0.3)});
      // ===== L2 香港警方拘捕 27 人
      out("#lb-df", ${t(LS[2] - 0.2)});
      grow("scam0", ${t(LS[2] + 0.2)}); grow("scam1", ${t(LS[2] + 0.4)}); pop("#lb-scam", ${t(LS[2] + 0.8)});
      pop("#ev-hk", ${t(LS[2] + 0.3)}); pop("#lb-27", ${t(LS[2] + 2.6)}); bump("#lb-scam", ${t(LS[2] + 4.0)}, 1.1, 1);
      // ===== L3 换脸假扮女性 · 假平台 · 超过 3.6 亿港元
      out("#lb-27", ${t(LS[3] - 0.2)});
      X26.maskMove(tl, "mask", ${t(LS[3] + 0.3)}, [${f(MV[0])}, ${f(MV[1])}], 0.9); X26.maskRed(tl, "mask", ${t(LS[3] + 1.3)});
      fadeIn("#cph-scr2", ${t(LS[3] + 1.2)}, 0.5);
      grow("vic", ${t(LS[3] + 2.2)}); pop("#lb-fake", ${t(LS[3] + 2.8)}); bump("#lb-fake", ${t(LS[3] + 4.8)}, 1.1, 1);
      pop("#lb-36", ${t(LS[3] + 6.6)}); pop("#ev-rthk", ${t(LS[3] + 6.8)});
      // ===== L4 假 Zoom 会议：微移到笔记本
      out("#lb-scam, #lb-fake, #lb-36, #ev-hk, #ev-rthk", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "meetLap", 1.3); pop("#ev-zoom", ${t(LS[4] + 0.4)}); pop("#lb-emp", ${t(LS[4] + 1.4)});
      fadeIn("#vc-red", ${t(LS[4] + 5.2)}, 0.3); flash("#vc-red", ${t(LS[4] + 5.6)}, 3, 0.2);
      // ===== L5 关键画面：麦克风有问题 → 扩展滑出 → 实为恶意脚本
      pop("#lb-mic", ${t(TM.mic)});
      fadeIn("#extg", ${t(TM.inst)}, 0.2); tl.fromTo("#extg-mv", { x: ${f(EXT0[0])}, y: ${f(EXT0[1])}, scale: 0.4, transformOrigin: "50% 50%" }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }, ${t(TM.inst)});
      fadeIn("#ext-bad", ${t(TM.mal)}, 0.3); pop("#lb-mal", ${t(TM.mal + 0.2)});
      // ===== L6 Huntress 高置信度归因
      out("#lb-mic, #ev-zoom", ${t(LS[6] - 0.2)});
      pop("#ev-hun", ${t(LS[6] + 0.2)}); pop("#lb-attr", ${t(LS[6] + 1.0)});
      // ===== L7 开户台
      out("#lb-emp, #lb-mal, #lb-attr, #ev-hun", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "kycC", 1.5); pop("#lb-cam", ${t(LS[7] + 1.4)}); pop("#lb-kpp", ${t(LS[7] + 1.6)});
      // ===== L8 虚拟摄像头注入 + 换脸 → 活体检测
      fadeIn("#cable", ${t(LS[8] + 0.2)}, 0.6); pop("#lb-cable", ${t(LS[8] + 0.6)});
      pop("#lb-mi", ${t(LS[8] + 1.8)}); bump("#lb-cam", ${t(LS[8] + 3.4)}, 1.12, 1);
      // ===== L9 厂商报告：在增长
      pop("#lb-up", ${t(LS[9] + 0.3)}); pop("#ev-ip", ${t(LS[9] + 0.5)});
      // ===== L10 钓鱼信扇形飞出
      out("#lb-up, #ev-ip, #lb-cable", ${t(LS[10] - 0.2)});
      ${JSON.stringify(L.C_PHISH.map((_, i) => [at(L.C_PHISH[i])[0], at(L.C_PHISH[i])[1]].map((v, j) => +(PH0[j] - v).toFixed(1))))}.forEach((d, i) => {
        const t0 = ${t(LS[10] + 0.6)} + i * 0.35;
        fadeIn("#phg" + i, t0, 0.2); tl.fromTo("#phg" + i + "-mv", { x: d[0], y: d[1] }, { x: 0, y: 0, duration: 0.5, ease: "power2.out" }, t0);
        });
      pop("#lb-ph", ${t(LS[10] + 2.8)});
      // ===== L11 放大镜：看不出真假
      out("#lb-ph", ${t(LS[11] - 0.2)});
      fadeIn("#magg", ${t(LS[11] + 0.1)}, 0.4); pop("#lb-q", ${t(LS[11] + 0.7)});
      out("#lb-q", ${t(LS[11] + 2.0)}, 0.15); pop("#lb-qx", ${t(LS[11] + 2.1)});
      // ===== L12 Chainalysis 17 点点阵
      out("#lb-qx, #magg", ${t(LS[12] - 0.2)});
      pop("#ev-ch", ${t(LS[12] + 0.3)}); fadeIn("#dm", ${t(LS[12] + 2.5)}, 0.6); pop("#lb-dm", ${t(LS[12] + 1.6)}); bump("#lb-dm", ${t(LS[12] + 4.6)}, 1.08, 1);
      // ===== L13 两根点柱：无关联 2 / 有关联 9
      out("#dm, #lb-dm", ${t(LS[13] - 0.2)});
      fadeIn("#dcol", ${t(LS[13] + 0.4)}, 0.6); pop("#lb-c1", ${t(LS[13] + 1.0)}); pop("#lb-c0", ${t(LS[13] + 2.4)}); bump("#lb-c1", ${t(LS[13] + 4.6)}, 1.1, 1);
      // ===== L14 单起获利 ↑
      pop("#lb-c2", ${t(LS[14] + 0.4)});
      // ===== L15 防御回到流程
      out("#dcol, #lb-c0, #lb-c1, #lb-c2, #ev-ch", ${t(LS[15] - 0.2)}); pop("#lb-flow", ${t(LS[15] + 0.2)});
      // ===== L16 真人脸 ≠ 真人
      bump("#lb-mi", ${t(LS[16] + 0.2)}, 1.15, 1); pop("#lb-neq", ${t(LS[16] + 1.6)});
      // ===== L17 安装一律拒绝 · 换渠道确认
      fadeIn("#rpg", ${t(LS[17] + 0.3)}, 0.3); pop("#lb-rp", ${t(TM.ref)});
      fadeIn("#cfmg", ${t(TM.alt - 0.6)}, 0.3); fadeIn("#cfm-scr2", ${t(TM.alt)}, 0.3); pop("#lb-cfm", ${t(TM.alt + 0.2)});
      // ===== L18 FBI：家人暗语
      pop("#ev-fbi", ${t(LS[18] + 0.2)});
      grow("fam0", ${t(LS[18] + 1.0)}); grow("fam1", ${t(LS[18] + 1.2)}); pop("#lb-fam", ${t(LS[18] + 1.6)});
      grow("code", ${t(LS[18] + 2.0)}); pop("#lb-code", ${t(LS[18] + 2.4)});
`,
});
