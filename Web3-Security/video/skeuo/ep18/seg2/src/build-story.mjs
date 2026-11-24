// ep18/seg2「② 五种放法」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.schemesB（BRIEF）。
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.keyB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const CE = 0.866, VF = E2.VITRINE_FLOOR, BX = -5900;
const bz = (X, Y, extra = {}) => { const q = G(BX + X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; }; // B-local placer (same as layout's zone b)
const bp = (X, Y, z = 0) => [BX + X, Y - z * CE];                 // B-local world-canvas px
/** scale k around ground point o, then lift by `lift` world units; returns wrapped svg and stores rescaled anchors in A[key] */
const mk = (key, o, r, k = 1, lift = 0) => {
  const [gx, gy] = Wp(o.u, o.v, 0), ly = -lift * CE, pt = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k + ly];
  A[key] = {};
  for (const [n, p] of Object.entries(r.anchors)) A[key][n] = Array.isArray(p) && typeof p[0] === "number" ? pt(p) : Array.isArray(p) && Array.isArray(p[0]) ? p.map(pt) : p;
  return `<g transform="translate(${f(gx)},${f(gy + ly)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g>`;
};
const keyIco = (x, y, c) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${c}" stroke-width="3"/><path d="M${x + 7} ${y}H${x + 24}M${x + 18} ${y}V${y + 6}M${x + 23} ${y}V${y + 5}" stroke="${c}" stroke-width="3"/>`;
const phScr = (atk) => `<rect x="0" y="0" width="76" height="150" fill="${atk ? "#fde6e3" : "#f6f3ec"}"/>` +
  `<text x="38" y="48" font-size="15" font-weight="800" text-anchor="middle" fill="#1c1c1c">助记词</text><text x="38" y="68" font-size="15" font-weight="800" text-anchor="middle" fill="#1c1c1c">钱包</text>` + keyIco(26, 100, atk ? "#e0453a" : "#1d93ba");

// 展柜内的东西（inner，放在玻璃罩里）
const SAFE_K = 0.42, LOCK_LIFT = VF + 52;
const lockIn = L.LOCKS_B.map((o, i) => mk("lk" + i, o, O.padlock(o, { id: "lk" + i }), 0.5, LOCK_LIFT)).join("");
const lockKey = [0, 1].map((i) => S.hid("lkk" + i, mk("lkK" + i, L.LOCKS_B[i], O.padlock(L.LOCKS_B[i], { id: "lkK" + i, key: true }), 0.5, LOCK_LIFT))).join("");
const inner = [
  mk("ph", L.PHONE_B, O.phone(L.PHONE_B, { id: "ph", screen: phScr(false) }), 0.7, VF) +
    S.hid("phAw", mk("phA", L.PHONE_B, O.phone(L.PHONE_B, { id: "phA", state: "attacker", screen: phScr(true) }), 0.7, VF)),
  mk("hw", L.HW_B, O.hwWallet(L.HW_B, { id: "hw" }), 1, VF),
  mk("sf", L.SAFE_B, O.safe(L.SAFE_B, { id: "sf" }), SAFE_K, VF) + lockIn + lockKey,
  "",
  mk("hs", L.HSM_B, O.hsm(L.HSM_B, { id: "hs" }), 0.8, VF),
];
const VP = ["软件钱包", "硬件钱包", "多签", "MPC", "HSM"];
L.VIT.forEach((o, i) => put("vit" + i, o, E2.vitrine(o, { id: "vit" + i, w: 160, d: 120, h: 150, plate: VP[i], inner: inner[i] })));

// 展柜前的东西
put("lap", L.LAPTOP_B, O.laptop(L.LAPTOP_B, { id: "lap" }), 0, { wrap: () => mk("lap", L.LAPTOP_B, O.laptop(L.LAPTOP_B, { id: "lap" }), 0.7) });
put("pz", L.PUZZLE_B, E2.puzzleSet(L.PUZZLE_B, { id: "pz", assembled: false }));
put("sl", L.SEAL_B, O.seal(L.SEAL_B, { id: "sl", stamped: false }));
put("mn", L.MNEMO_B, E2.mnemonicPlate(L.MNEMO_B, { id: "mn", filled: false, title: "助记词" }));
put("dl", L.DIAL_B, E2.comboDial(L.DIAL_B, { id: "dl", rings: 8 }), 0, { wrap: () => mk("dl", L.DIAL_B, E2.comboDial(L.DIAL_B, { id: "dl", rings: 8 }), 0.7) });
put("bd", L.BOARD_B, E1.signBoard(L.BOARD_B, { id: "bd", style: "plate", text: "盲签风险", size: 34 }));
put("k0", L.KEYS_B[0], O.key(L.KEYS_B[0], { id: "k0" }), 0, { wrap: (s) => S.hid("k0w", s) });
put("k1", L.KEYS_B[1], O.key(L.KEYS_B[1], { id: "k1", state: "attacker" }), 0, { wrap: (s) => S.hid("k1w", s) });
// L2 印章 + 交易信封；L3 助记词推出三把小钥匙；L8 放大镜；L14 递进 HSM 的指令单
const SL2 = bz(0, 440), LT2 = bz(30, 470), LT22 = bz(200, 500), MAG = bz(-330, 120, { z: 70 }), DOC = bz(1060, 320);
put("sl2", SL2, O.seal(SL2, { id: "sl2", stamped: false }), 0, { wrap: (s) => S.hid("sl2w", s) });
put("lt2", LT2, E1.letter(LT2, { id: "lt2" }), 0, { wrap: (s) => S.hid("lt2w", s) });
put("lt22", LT22, E1.letter(LT22, { id: "lt22", state: "attacker" }), 0, { wrap: (s) => S.hid("lt22w", s) });
put("mg", MAG, O.magnifier(MAG, { id: "mg", z: 70 }), 0, { wrap: (s) => S.hid("mgw", s) });
put("dc", DOC, O.doc(DOC, { id: "dc", title: "指令", w: 90, h: 70 }), 0, { wrap: (s) => S.hid("dcw", s) });
const MK = [[-700, 480], [-560, 510], [-420, 480]].map(([x, y]) => bz(x, y));
MK.forEach((o, i) => put("mk" + i, o, O.key(o, { id: "mk" + i }), 0, { wrap: (s) => S.hid("mkw" + i, mk("mk" + i, o, O.key(o, { id: "mk" + i }), 0.45)) }));

// 原生 SVG：虚线、碎屑、红圈
const dash = (pts, c = "#2aa3c9") => `<path d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/>`;
S.add(L.MNEMO_B, S.hid("mnL", MK.map((o) => dash([A.mn.plate ?? A.mn.center, Wp(o.u, o.v, 20)])).join("")), 300);
const SIGP = [A.pz.center[0], A.pz.center[1] - 170];
S.add(L.PUZZLE_B, S.hid("pzL", (A.pz.pieces ?? []).map((p) => dash([p, SIGP])).join("") +
  `<circle cx="${f(SIGP[0])}" cy="${f(SIGP[1])}" r="22" fill="#fde6e3" stroke="#e0453a" stroke-width="4"/><circle cx="${f(SIGP[0])}" cy="${f(SIGP[1])}" r="9" fill="#e0453a"/>`), 300);
const CR = A.k0.ground;
S.add(L.KEYS_B[0], S.hid("crumb", [[-40, 18], [-22, 28], [-6, 22], [14, 30], [32, 20], [-30, 36], [6, 38]].map(([dx, dy], i) =>
  `<rect x="${f(CR[0] + dx)}" y="${f(CR[1] + dy)}" width="${5 + (i % 3) * 2}" height="4" rx="1" fill="#e0453a" transform="rotate(${i * 37} ${f(CR[0] + dx)} ${f(CR[1] + dy)})"/>`).join("")), 40);
const ring = (p, rx = 62, ry = 38) => `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${rx}" ry="${ry}" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="9 7"/>`;
const WEAK = [A.ph.screen, A.hw.screen, A.lk1.center, A.pz.center, A.hs.center];
WEAK.forEach((p, i) => S.add(L.VIT[i], S.hid("wk" + i, ring(p, i === 3 ? 110 : 60, i === 3 ? 60 : 38)), 400));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-dl", up(A.dl.top, 8), "256 位随机数", "lab-cs lab-sm");
lb("lb-k0", up(A.k0.top, 10), "私钥", "lab-ink lab-sm");
lb("lb-sl2", up(A.sl2.top, 6), "签名 → 资产归谁", "lab-ink lab-sm");
lb("lb-mn", up(A.mn.top, 8), "12 / 24 个单词", "lab-cs lab-sm");
lb("lb-ph", up(A.vit0.top, 4), "私钥在设备里", "lab-cs lab-sm");
lb("lb-phA", up(A.vit0.top, 4), "设备被攻破", "lab-rs lab-sm");
lb("lb-hw", up(A.vit1.top, 4), "私钥不出芯片", "lab-cs lab-sm");
lb("lb-mg", up(A.mg.top, 6), "看清再签", "lab-g lab-sm");
lb("lb-sf", up(A.vit2.top, 4), "链上合约", "lab-cs lab-sm");
lb("lb-th", [A.vit2.top[0] + 120, A.vit2.top[1] + 70], "2 / 3 ✓ 执行", "lab-gs lab-sm", "l");
["甲", "乙", "丙"].forEach((n, i) => lb("lb-pz" + i, up((A.pz.pieces ?? [A.pz.center])[i] ?? A.pz.center, 30), n, "lab-cs lab-sm"));
lb("lb-pzS", [SIGP[0], SIGP[1] - 30], "合成签名", "lab-ink lab-sm");
lb("lb-pzN", [A.pz.ground[0], A.pz.ground[1] + 40], "分片从不拼合", "lab-ink lab-sm", "t");
lb("lb-hs", up(A.vit4.top, 4), "不能导出", "lab-cs lab-sm");
lb("lb-dc", up(A.dc.top, 8), "不看内容", "lab-r lab-sm");
const BG = A.bd.ground, ROWS = [["软件钱包", "高"], ["硬件钱包", "中"], ["多签", "中"], ["MPC", "中"], ["HSM", "高"]];
ROWS.forEach(([n, r], i) => {
  const y = BG[1] - 6 + i * 42;
  lb("lb-r" + i, [BG[0] - 8, y], n, "lab-ink lab-sm", "r");
  lb("lb-v" + i, [BG[0] + 8, y], r, r === "高" ? "lab-rs lab-sm" : "lab-ink lab-sm", "l");
});
lb("lb-oc", [A.vit2.ground[0], A.vit2.ground[1] + 30], "门槛链上可查 ✓", "lab-g lab-sm", "t");
lb("lb-mp", [A.vit3.ground[0] + 40, A.vit3.ground[1] + 150], "普通地址 ?", "lab-ink lab-sm", "t");
lb("lb-k0b", up(A.k0.top, 10), "钥匙 = 私钥", "lab-ink");
lb("lb-n3", up(A.vit2.top, 4), "3 把锁", "lab-cs");
lb("lb-n1", up(A.vit2.top, 4), "退化成 1 把", "lab-rs");
lb("lb-cr", up(A.k0.top, 10), "实物钥匙：复制留痕迹", "lab-r lab-sm");
lb("lb-k1", up(A.k1.top, 10), "私钥：复制无痕迹", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const UI = { x: 1300, y: 330, w: 380, h: 200 };
const LK = [0, 1, 2].map((i) => S.scr("keyB", A["lk" + i].top));
LK.forEach((p, i) => S.curve("ln" + i, p, [UI.x - 4, UI.y + UI.h / 2], { color: "#2aa3c9" }));
const html = `<div id="uiw" class="uiw" style="left:${UI.x}px;top:${UI.y}px;width:${UI.w}px;height:${UI.h}px"><div class="uiw-h">签名界面</div><div class="uiw-b">三个人看的<br>同一块屏幕</div></div>` +
  ["一台设备", "一行日志", "一个签名人的眼睛"].map((tx, i) => `<div id="wkc${i}" class="wkc" style="left:${480 + i * 420}px;top:180px">${tx}</div>`).join("");
const css = `.uiw{position:absolute;background:#fffdf8;border:3px solid #2aa3c9;border-radius:14px;box-shadow:0 10px 24px rgba(70,60,40,.12);opacity:0;overflow:hidden}
.uiw-h{background:#1d93ba;color:#fff;font-weight:800;font-size:28px;padding:8px 18px}
.uiw-b{font-size:34px;font-weight:900;color:#1c1c1c;padding:22px 18px;line-height:1.3}
.wkc{position:absolute;width:360px;text-align:center;background:#fffdf8;border:4px dashed #e0453a;border-radius:16px;font-size:36px;font-weight:900;color:#1c1c1c;padding:16px 0;opacity:0;box-shadow:0 10px 24px rgba(70,60,40,.12)}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);
// 世界画布点（letter walk）
const P2 = [bp(30, 470), bp(260, 520), bp(420, 560)], P22 = [bp(200, 500), bp(420, 560), bp(560, 600)];

S.build({
  cam0: "schemesB", sub: "私钥放在哪里，谁能让它签名",
  grid: { u0: -7400, u1: 2400, v0: -5700, v1: 2700 }, box: [-7600, -800, 9300, 1800],   // 盖住 walletsA（L0 起摇）/ schemesB / softB / multiB / hsmB / keyB / B
  shown: [], css, html,
  terms: [
    { id: "t0", t: "浏览器扩展", d: "装在浏览器里的附加小程序", at: w("浏览器扩展", 5) },
    { id: "t1", t: "Safe", d: "以太坊上常用的多签合约钱包", at: w("Safe", 9) },
    { id: "t2", t: "分片", d: "MPC 各方各持的一份密钥材料", at: w("分片", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。（A 左摇到 B 五个展柜全景）
      cam(${t(LS[0] - 0.2)}, "schemesB", 1.6);
      // ===== L1 私钥是一个 256 位的随机数，用来给交易签名。
      pop("#lb-dl", ${t(LS[1] + 0.3)}); KIT.dialTurn(tl, "dl", ${t(LS[1] + 0.3)}, 120, 2.2);
      fadeIn("#k0w", ${t(LS[1] + 2.6)}, 0.4); pop("#lb-k0", ${t(LS[1] + 2.9)});
      // ===== L2 谁能让私钥签一笔交易，谁就拥有这笔资产。
      out("#lb-dl", ${t(LS[2] - 0.2)}); fadeIn("#sl2w", ${t(LS[2] + 0.2)}, 0.3); KIT.stamp(tl, "sl2", ${t(LS[2] + 0.6)});
      pop("#lb-sl2", ${t(LS[2] + 1.4)}); fadeIn("#lt2w", ${t(LS[2] + 1.7)}, 0.3);
      X1.walk(tl, "lt2", ${t(LS[2] + 2.1)}, 1.6, ${JSON.stringify(P2)});
      out("#lt2w, #sl2w, #lb-sl2, #lb-k0", ${t(LS[3] - 0.3)});
      // ===== L3 助记词是 12 或 24 个单词，可以推导出一组私钥。
      pop("#lb-mn", ${t(LS[3] + 0.2)});
      for (let i = 0; i < 12; i++) fadeIn("#mn-w-" + i, ${t(LS[3] + 0.5)} + i * 0.14, 0.15);
      fadeIn("#mnL", ${t(LS[3] + 2.8)}, 0.4); [0, 1, 2].forEach((i) => fadeIn("#mkw" + i, ${t(LS[3] + 3.1)} + i * 0.2, 0.3));
      // ===== L4 放私钥的方法，常见的有五种。
      out("#lb-mn, #mnL, #mkw0, #mkw1, #mkw2", ${t(LS[4] - 0.2)});
      [0, 1, 2, 3, 4].forEach((i) => flash("#vit" + i + "-glass", ${t(LS[4] + 0.3)} + i * 0.45, 2, 0.3));
      // ===== L5 第一种，助记词软件钱包，私钥在手机、电脑或浏览器扩展里。
      cam(${t(LS[5])}, "softB", 1.2); pop("#lb-ph", ${t(LS[5] + 1.4)});
      // ===== L6 设备被攻破，钱就没了。
      out("#lb-ph", ${t(LS[6])}, 0.2); fadeIn("#phAw", ${t(LS[6] + 0.2)}, 0.3); pop("#lb-phA", ${t(LS[6] + 0.4)});
      // ===== L7 第二种，硬件钱包，私钥在一块独立芯片里，不离开设备。
      pop("#lb-hw", ${t(LS[7] + 0.8)});
      // ===== L8 它只负责签名，签之前，人要看清签的是什么。
      out("#lb-hw", ${t(LS[8] + 1.0)}, 0.2); fadeIn("#mgw", ${t(LS[8] + 1.2)}, 0.4); pop("#lb-mg", ${t(LS[8] + 1.7)});
      // ===== L9 第三种，多签，比如 Safe，几个独立私钥加一个链上合约。
      out("#lb-phA, #lb-hw, #lb-mg", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "multiB", 1.2); pop("#lb-sf", ${t(LS[9] + 3.6)});
      // ===== L10 签名数达到门槛，交易才执行。
      fadeIn("#lkk0", ${t(LS[10] + 0.3)}, 0.3); fadeIn("#lkk1", ${t(LS[10] + 0.7)}, 0.3);
      KIT.door(tl, "sf", ${t(LS[10] + 1.2)}, 25, 0.8); pop("#lb-th", ${t(LS[10] + 1.6)});
      // ===== L11 第四种，MPC 门限签名，私钥被切成几个分片。
      [0, 1, 2].forEach((i) => pop("#lb-pz" + i, ${t(LS[11] + 2.0)} + i * 0.3));
      // ===== L12 几方各自计算，合成一个普通签名，完整私钥从不出现。
      fadeIn("#pzL", ${t(LS[12] + 0.6)}, 0.6); pop("#lb-pzS", ${t(LS[12] + 1.6)}); pop("#lb-pzN", ${t(LS[12] + 3.4)});
      // ===== L13 第五种，HSM，私钥锁在专用硬件里，不能导出。
      out("#lb-sf, #lb-th, #lb-pz0, #lb-pz1, #lb-pz2, #lb-pzS, #lb-pzN, #pzL", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "hsmB", 1.2); pop("#lb-hs", ${t(LS[13] + 2.6)}); flash("#hs-led-0", ${t(LS[13] + 2.8)}, 3);
      // ===== L14 它只按指令签名，不判断指令对不对。
      fadeIn("#dcw", ${t(LS[14] + 0.2)}, 0.3); KIT.stamp(tl, "sl", ${t(LS[14] + 0.8)}); pop("#lb-dc", ${t(LS[14] + 2.0)});
      // ===== L15 签名人看不懂签的内容就签，叫盲签。
      out("#lb-hs", ${t(LS[15] - 0.2)});
      [0, 1, 2, 3, 4].forEach((i) => pop("#lb-r" + i, ${t(LS[15] + 0.4)} + i * 0.2));
      bump("#lb-r0, #lb-r1, #lb-r2, #lb-r3, #lb-r4", ${t(LS[15] + 2.4)}, 1.08, 1);
      // ===== L16 软件钱包和 HSM，盲签风险最高。
      [0, 1, 2, 3, 4].forEach((i) => pop("#lb-v" + i, ${t(LS[16] + 0.3)} + i * 0.25));
      bump("#lb-v0, #lb-v4", ${t(LS[16] + 2.0)}, 1.15, 2);
      // ===== L17 多签的门槛写在链上，谁都能查，MPC 在链上只是一个普通地址。
      out("#lb-dc, #lb-r0, #lb-r1, #lb-r2, #lb-r3, #lb-r4, #lb-v0, #lb-v1, #lb-v2, #lb-v3, #lb-v4", ${t(LS[17] - 0.2)});
      cam(${t(LS[17])}, "B", 1.2); pop("#lb-oc", ${t(LS[17] + 1.4)}); pop("#lb-mp", ${t(LS[17] + 3.6)});
      // ===== L18 打个比方，私钥是保险柜的钥匙。
      out("#lb-oc, #lb-mp", ${t(LS[18] - 0.2)});
      cam(${t(LS[18])}, "keyB", 1.2); pop("#lb-k0b", ${t(LS[18] + 1.4)});
      // ===== L19 多签像一个柜子三把锁，要两把一起开。
      pop("#lb-n3", ${t(LS[19] + 0.4)}); pop("#lb-th", ${t(LS[19] + 2.0)});
      // ===== L20 可如果锁的主人看同一块屏幕，三把锁就退化成一把。（关键画面）
      fadeIn("#uiw", ${t(LS[20] + 0.3)}, 0.4); [0, 1, 2].forEach((i) => draw("ln" + i, ${t(LS[20] + 0.9)} + i * 0.15, 0.8));
      out("#lb-th", ${t(LS[20])}, 0.2); out("#lb-n3", ${t(LS[20] + 2.6)}, 0.2); pop("#lb-n1", ${t(LS[20] + 2.8)});
      // ===== L21 比喻不成立的地方是，真实的钥匙被复制，会留下痕迹。
      out("#uiw, #ln0, #ln1, #ln2, #lb-n1, #lb-k0b", ${t(LS[21] - 0.2)});
      fadeIn("#crumb", ${t(LS[21] + 2.2)}, 0.4); pop("#lb-cr", ${t(LS[21] + 2.6)});
      // ===== L22 私钥被复制，不留任何痕迹，直到资产被转走，你才知道。
      out("#lb-cr", ${t(LS[22] + 0.4)}, 0.2); fadeIn("#k1w", ${t(LS[22] + 0.3)}, 0.4); pop("#lb-k1", ${t(LS[22] + 0.9)});
      fadeIn("#lt22w", ${t(LS[22] + 2.6)}, 0.3); X1.walk(tl, "lt22", ${t(LS[22] + 3.0)}, 1.6, ${JSON.stringify(P22)});
      flash("#lt22w", ${t(LS[22] + 3.2)}, 3);
      // ===== L23 所以方案的强度，取决于最容易被攻破的那个环节。
      out("#crumb, #lb-k1, #lt22w", ${t(LS[23] - 0.2)});
      cam(${t(LS[23])}, "B", 1.2); [0, 1, 2, 3, 4].forEach((i) => fadeIn("#wk" + i, ${t(LS[23] + 1.4)} + i * 0.3, 0.3));
      // ===== L24 一台设备，一行日志，一个签名人的眼睛。
      out("#wk0, #wk1, #wk2, #wk3, #wk4", ${t(LS[24] - 0.2)});
      cam(${t(LS[24])}, "keyB", 1.0); [0, 1, 2].forEach((i) => pop("#wkc" + i, ${t(LS[24] + 0.4)} + i * 0.9));
`,
});
