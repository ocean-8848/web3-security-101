// ep18/seg6「⑥ 今天做一件事」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.rolesE（BRIEF）。ends static on CAMS.world
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
import { segInit, codeCard, codeRowY, kw, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { G } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// ---------------------------------------------------------------- 段内专用位置 + 镜头
const P = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
// E 角色板右侧的"道具台"（L1–L4 每句换一组道具）：world-canvas px X 7020..7480, 地面 Y −40
const ST = { a: P(7040, -40), b: P(7170, -40), c: P(7300, -40), d: P(7430, -40), cloud: [7170, -330] };
const MNEMO2_B = P(-6700, 330);                            // 第二块助记词板（陈列馆 vitrine 0 前）
const LT_A = P(0, 470, { z: 0 });                          // A 红信封起点（签名人前方）
const CAMS = {
  ...L.CAMS,
  // E 角色板 + 右侧道具台（seg6 L1–L4）
  rolesP: L.fit([L.rect(L.ROLES_E, "roleBoard"), [6980, -370, 7520, 40]], [300, 300, 1620, 860], 1.4),
  // A 全区，偏右，左侧留代码卡（seg6 L11–L13）
  A2: L.fit([L.rect(L.SAFE_A, "safe"), L.rect(L.METER_A, "thresholdMeter"), L.rect(L.BOARD_A, "signPlate"),
    ...L.SIGNERS_A.map((q) => L.rect(q, "person")), ...L.WALLETS_A.map((q) => L.rect(q, "hwWallet")), ...L.KEYS_A.map((q) => L.rect(q, "key"))],
    [640, 300, 1820, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E2, E3, E5] });
const { A, put, add, lb, up, LS, w } = S;
/** put an object that ignores opts.scale: wrap around its ground point and rescale its anchors */
const putK = (key, o, svg, k, dy = 0, inner = (s) => s) => {
  const [gx, gy] = at(o);
  put(key, o, svg, dy, { wrap: (s) => inner(`<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${s}</g>`) });
  for (const n of Object.keys(A[key])) { const q = A[key][n]; if (Array.isArray(q) && typeof q[0] === "number") A[key][n] = [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }
};
const hidW = (id) => (s) => `<g id="${id}" opacity="0">${s}</g>`;   // object wrapper hidden at start (fadeIn / out override)

// ---------------------------------------------------------------- 世界物件
// B 方案陈列馆
const VP = ["软件钱包", "硬件钱包", "多签", "MPC", "HSM"];
L.VIT.forEach((q, i) => put(`vit${i}`, q, E2.vitrine(q, { id: `vit${i}`, w: 160, d: 120, h: 150, plate: VP[i] })));
putK("phB", L.PHONE_B, O.phone(L.PHONE_B, { id: "phB" }), 0.7, 2);
const scrHash = `<rect x="0" y="0" width="70" height="40" fill="#20262b"/><text x="35" y="25" font-size="12" text-anchor="middle" fill="#b9c0c6" font-family="monospace">0x3fa…</text>`;
const scrBad = `<rect x="0" y="0" width="70" height="40" fill="#3a1412"/><text x="35" y="25" font-size="12" text-anchor="middle" fill="#ff8a80">无法解析</text>`;
put("hwB", L.HW_B, O.hwWallet(L.HW_B, { id: "hwB", screenText: "确认?", screen2: `<g id="hwB-h">${scrHash}</g><g id="hwB-u" opacity="0">${scrBad}</g>` }), 2);
putK("sfB", L.SAFE_B, O.safe(L.SAFE_B, { id: "sfB" }), 0.6, 2);
put("pzB", L.PUZZLE_B, E2.puzzleSet(L.PUZZLE_B, { id: "pzB", assembled: false }));
putK("hsmB", L.HSM_B, O.hsm(L.HSM_B, { id: "hsmB" }), 0.8, 2);
put("sealB", L.SEAL_B, O.seal(L.SEAL_B, { id: "sealB" }));
put("mn1", L.MNEMO_B, E2.mnemonicPlate(L.MNEMO_B, { id: "mn1", title: "助记词 A" }));
put("mn2", MNEMO2_B, E2.mnemonicPlate(MNEMO2_B, { id: "mn2", title: "助记词 B" }));
putK("dialB", L.DIAL_B, E2.comboDial(L.DIAL_B, { id: "dialB", rings: 8, text: "256 位" }), 0.7);
// 红虚线框：硬件钱包（L8）
{ const r = L.rect(L.HW_B, "hwWallet"); add(L.HW_B, S.hid("hwBox", `<rect x="${r[0] - 22}" y="${r[1] - 22}" width="${r[2] - r[0] + 44}" height="${r[3] - r[1] + 44}" rx="10" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/>`), 6); }

// C 钥匙流水线（全景用）
put("convC", L.CONV, E2.conveyor(L.CONV, { id: "convC", len: 3200 }));
["生成", "存储", "使用", "备份", "轮换", "销毁"].forEach((t, i) => put(`bdC${i}`, L.BOARDS_C[i], E1.signBoard(L.BOARDS_C[i], { id: `bdC${i}`, style: "plate", text: t }), 4));

// A 冷钱包金库
put("sfA", L.SAFE_A, O.safe(L.SAFE_A, { id: "sfA", gold: true, plate: "WazirX 冷钱包", open: 70 }));
put("mtA", L.METER_A, E5.thresholdMeter(L.METER_A, { id: "mtA", max: 6, th: 4, thText: "6 选 4" }));
put("bdA", L.BOARD_A, E1.signBoard(L.BOARD_A, { id: "bdA", style: "plate", text: "冷钱包 · 大部分资产" }));
const scrUp = `<rect x="0" y="0" width="70" height="40" fill="#3a1412"/><text x="35" y="26" font-size="13" text-anchor="middle" fill="#ff8a80">合约升级</text>`;
L.SIGNERS_A.forEach((q, i) => put(`sg${i}`, q, O.person(q, { id: `sg${i}`, role: "signer", scale: 0.6 })));
L.WALLETS_A.forEach((q, i) => put(`hw${i}`, q, O.hwWallet(q, { id: `hw${i}`, screenText: "转账", screen2: scrUp }), 2));
L.KEYS_A.forEach((q, i) => putK(`ky${i}`, q, O.key(q, { id: `ky${i}` }), 0.6, 1));
L.WALLETS_A.forEach((q, i) => putK(`mg${i}`, q, O.magnifier(q, { id: `mg${i}` }), 0.7, 8, hidW(`mgw${i}`)));
put("ltA", LT_A, E1.letter(LT_A, { id: "ltA", state: "attacker" }), 10, { wrap: hidW("ltw") });
// L13：设备之间各自隔开的青蓝线 / 合成一台的红线
{
  const WA = L.WALLETS_A.map((q) => at(q));
  const seps = WA.slice(0, -1).map((p, i) => { const m = [(p[0] + WA[i + 1][0]) / 2, (p[1] + WA[i + 1][1]) / 2];
    return `<line x1="${m[0]}" y1="${m[1] - 90}" x2="${m[0]}" y2="${m[1] + 40}" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="12 8" stroke-linecap="round"/>`; }).join("");
  add(L.WALLETS_A[0], S.hid("sepA", seps), 12);
  const c = at(P(0, 520));
  const red = WA.map((p) => `<line x1="${p[0]}" y1="${p[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#e0453a" stroke-width="5" stroke-dasharray="10 7"/>`).join("") +
    `<circle cx="${c[0]}" cy="${c[1]}" r="26" fill="#e0453a"/>`;
  add(P(0, 520), S.hid("sepR", red), 12);
}

// D 签名台（全景用）
L.DESKS_D.forEach((q, i) => put(`dkD${i}`, q, O.desk(q, { id: `dkD${i}` })));
L.SIGNERS_D.forEach((q, i) => put(`sgD${i}`, q, O.person(q, { id: `sgD${i}`, role: "signer", scale: 0.55 })));
put("sealD", L.SEAL_D, O.seal(L.SEAL_D, { id: "sealD" }));
put("fnD", L.FUNNEL_D, E3.hashFunnel(L.FUNNEL_D, { id: "fnD", inputs: ["to", "data"], output: "交易哈希" }));
putK("hwD", L.HW_D, O.hwWallet(L.HW_D, { id: "hwD" }), 1.6);
put("magD", L.MAG_D, O.magnifier(L.MAG_D, { id: "magD" }));

// E 交易所三层钱包 + 角色板
put("sfCo", L.COLD_E, O.safe(L.COLD_E, { id: "sfCo", gold: true, plate: "冷钱包" }));
put("sfWa", L.WARM_E, O.safe(L.WARM_E, { id: "sfWa", plate: "温钱包" }));
put("sfHo", L.HOT_E, O.safe(L.HOT_E, { id: "sfHo", variant: "hot", plate: "热钱包" }));
putK("mtE", L.METER_E, E5.thresholdMeter(L.METER_E, { id: "mtE", max: 10, level: 2, thText: "水位" }), 0.8);
put("rb", L.ROLES_E, E5.roleBoard(L.ROLES_E, { id: "rb", title: "今天做一件事",
  plates: ["项目·交易所", "钱包开发者", "运维负责人", "普通用户"], holders: ["multisig", "contract", "bot", "person"],
  delays: ["查共用", "屏蔽密钥", "轮换", "分钱包"], empty: [0, 1, 2, 3] }));
// 道具台 L1：三个签名人，两条线连到同一朵云
["a", "b", "c"].forEach((k, i) => put(`p1${k}`, ST[k], O.person(ST[k], { id: `p1${k}`, role: "signer", scale: 0.55 }), 0, { wrap: hidW(`p1w${k}`) }));
{
  const [cx, cy] = ST.cloud;
  const cloud = `<path d="M${cx - 70},${cy + 30} a34,34 0 0 1 10,-58 a44,44 0 0 1 80,-10 a34,34 0 0 1 48,40 a26,26 0 0 1 -8,28 z" fill="#ffffff" stroke="#2aa3c9" stroke-width="5"/>`;
  add(ST.b, S.hid("p1cl", cloud), 20);
  const hd = (k) => up(A[`p1${k}`].top, -4);
  const ln = (k, col) => { const h = hd(k); return `<line x1="${h[0]}" y1="${h[1]}" x2="${cx}" y2="${cy + 34}" stroke="${col}" stroke-width="5" stroke-dasharray="12 8"/>`; };
  add(ST.b, S.hid("p1ln", ln("a", "#e0453a") + ln("c", "#e0453a")), 18);
  add(ST.b, S.hid("p1box", `<rect x="${cx - 110}" y="${cy - 90}" width="230" height="150" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/>`), 22);
}
// 道具台 L2：日志服务器 + 发布凭证 + 小锁
put("p2db", ST.a, O.dbLedger(ST.a, { id: "p2db", tag: "日志" }), 0, { wrap: hidW("p2dbw") });
put("p2kc", ST.c, E5.keycard(ST.c, { id: "p2kc", scale: 1.8 }), 0, { wrap: hidW("p2kcw") });
putK("p2lk", ST.d, O.padlock(ST.d, { id: "p2lk" }), 0.6, 2, hidW("p2lkw"));
// 道具台 L3：旧钥匙 / 新钥匙 / 拔出的管理员门卡
put("p3k0", ST.a, O.key(ST.a, { id: "p3k0" }), 0, { wrap: hidW("p3k0w") });
put("p3k1", ST.b, O.key(ST.b, { id: "p3k1" }), 0, { wrap: hidW("p3k1w") });
put("p3kc", ST.d, E5.keycard(ST.d, { id: "p3kc", scale: 1.8 }), 0, { wrap: hidW("p3kcw") });
// 道具台 L4：两人同时转钥匙
put("p4a", ST.a, O.person(ST.a, { id: "p4a", role: "signer", scale: 0.55 }), 0, { wrap: hidW("p4aw") });
put("p4b", ST.c, O.person(ST.c, { id: "p4b", role: "signer", scale: 0.55 }), 0, { wrap: hidW("p4bw") });
put("p4k", ST.b, O.key(ST.b, { id: "p4k" }), 0, { wrap: hidW("p4kw") });

// L14 全景：左陈列馆 / 右签名台轻亮（原生椭圆，压在物件下面）
const glow = (id, X, Y, rx, ry) => add(P(X, Y - 2000), S.hid(id, `<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" fill="#2aa3c9" opacity="0.22"/>`), -400);
glow("glB", -5900, 60, 1250, 520);
glow("glD", 2800, 260, 1250, 620);

// ---------------------------------------------------------------- 世界标签
lb("l1-sh", [ST.cloud[0], ST.cloud[1] - 100], "共用", "lab-rs");
lb("l2-db", up(A.p2db.top, 8), "密钥材料 ****", "lab-ink lab-sm");
lb("l2-kc", up(A.p2kc.top, 8), "发布凭证", "lab-ink lab-sm");
lb("l2-lk", up(A.p2lk.top, 8), "多因素认证", "lab-cs lab-sm");
lb("l3-k0", up(A.p3k0.top, 8), "旧钥匙 停用", "lab-ink lab-sm");
lb("l3-k1", up(A.p3k1.top, 8), "新钥匙", "lab-gs lab-sm");
lb("l3-kc", up(A.p3kc.top, 60), "撤销链上权限", "lab-rs lab-sm");
lb("l4-yr", up(A.p4k.top, 150), "每年演练恢复", "lab-cs");
lb("l4-mp", up(A.p4k.top, 20), "多人参与", "lab-gs lab-sm");
lb("l5-sm", up(A.vit0.top, 10), "小额", "lab-cs");
lb("l5-bg", up(A.vit1.top, 10), "大额", "lab-gs");
lb("l5-mn", up(A.mn1.top, 70), "两套不同助记词", "lab-ink lab-sm");
lb("l6-ok", up(A.mn1.top, 72), "只写在纸 / 金属板", "lab-gs lab-sm");
lb("l8-no", up(A.vit1.top, 12), "不签", "lab-rs");
lb("l11-up", up(A.sfA.top, 8), "实际签下：合约升级", "lab-rs");
L.SIGNERS_A.forEach((q, i) => { lb(`ok${i}`, up(A[`sg${i}`].top, 6), "签", "lab-gs lab-sm"); lb(`st${i}`, up(A[`sg${i}`].top, 8), "停", "lab-rs lab-sm"); });
lb("l13-in", up(A.sfA.top, 10), "各自独立的设备", "lab-cs");
lb("l13-one", up(at(P(0, 520)), 40), "合成一台 = 单点", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const cA = { x: 60, y: 330, w: 540 };
const card = codeCard("cA", { ...cA, head: "签名前核对的字段", tag: "示意", mono: true, rows: [
  { html: "to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;收款地址" },
  { html: "value&nbsp;&nbsp;&nbsp;&nbsp;金额" },
  { html: "data&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;调用数据" },
  { html: "operation 1", chip: "不签", chipCls: "x" },
] });
const sB = S.scr("wide", [-5900, -200]), sD = S.scr("wide", [2800, -260]);
const html = card +
  `<div class="s6-card hide" id="q6" style="left:560px;top:112px;width:800px"><div class="s6-q">六把私钥都没泄露<br>资金能被转走吗</div><div class="s6-ans hide" id="q6a">能</div></div>` +
  `<div class="s6-card hide" id="nope" style="left:1400px;top:600px;width:420px">
     <div class="s6-ic"><svg viewBox="0 0 80 60" width="80" height="60"><rect x="6" y="14" width="68" height="40" rx="8" fill="#3b3e44"/><rect x="26" y="6" width="26" height="12" rx="3" fill="#3b3e44"/><circle cx="40" cy="34" r="13" fill="#9ad9ee" stroke="#fff" stroke-width="4"/><path d="M8 8 L72 56 M72 8 L8 56" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/></svg><span>拍照</span></div>
     <div class="s6-ic"><svg viewBox="0 0 80 60" width="80" height="60"><path d="M14 46 a12 12 0 0 1 4 -23 a18 18 0 0 1 34 -6 a14 14 0 0 1 18 18 a11 11 0 0 1 -3 11 z" fill="#fff" stroke="#2aa3c9" stroke-width="4"/><path d="M8 8 L72 56 M72 8 L8 56" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/></svg><span>云笔记</span></div></div>` +
  `<div class="s6-card hide" id="scam" style="left:1404px;top:592px;width:420px"><div class="s6-hd">在线客服</div>
     <div class="s6-bub">验证身份 请输入助记词</div><div class="s6-in">助记词 ________<span class="s6-x">✕</span></div><div class="s6-tag">诈骗</div></div>` +
  kw("kw14a", `放在<b>哪里</b>`, { x: Math.round(sB[0] - 130), y: Math.round(sB[1] - 150), size: 40 }) +
  kw("kw14b", `签下<b>什么</b>`, { x: Math.round(sD[0] - 130), y: Math.round(sD[1] - 160), size: 40 });
const css = `
.s6-card{position:absolute;background:#fff;border-radius:18px;box-shadow:0 6px 24px rgba(0,0,0,.12);padding:22px 28px;font-family:"Noto Sans SC",sans-serif;color:#1c1c1c}
.s6-q{font-size:44px;font-weight:700;line-height:1.35;text-align:center}
.s6-ans{position:absolute;right:28px;top:50%;transform:translateY(-50%);font-size:84px;font-weight:800;color:#fff;background:#e0453a;border-radius:16px;padding:4px 26px}
.s6-ic{display:inline-flex;flex-direction:column;align-items:center;margin:0 26px;font-size:30px;font-weight:600}
.s6-ic span{text-decoration:line-through;text-decoration-color:#e0453a;text-decoration-thickness:4px}
.s6-hd{font-size:28px;font-weight:700;color:#fff;background:#1d93ba;border-radius:10px;padding:6px 14px;margin-bottom:14px}
.s6-bub{font-size:30px;background:#eef6f9;border-radius:12px;padding:10px 14px;margin-bottom:14px}
.s6-in{position:relative;font-size:30px;border:4px dashed #e0453a;border-radius:10px;padding:10px 14px;color:#6b6b6b}
.s6-x{position:absolute;right:12px;top:-6px;font-size:52px;font-weight:800;color:#e0453a}
.s6-tag{position:absolute;right:-14px;top:-22px;background:#e0453a;color:#fff;font-size:30px;font-weight:700;border-radius:10px;padding:4px 14px}`;
S.curve("cvA", [cA.x + cA.w + 4, codeRowY(cA.y, 3)], S.scr("A2", up(A.hw0.screen, 4)), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻
const TM = {
  share: w("共用", 1), mfa: w("多因素认证", 2), mask: w("屏蔽", 2), rot: w("轮换密钥", 3), rev: w("撤销", 3),
  year: w("每年", 4), multi: w("多人参与", 4), big: w("大额", 5), small: w("小额", 5), diff: w("不同的助记词", 5),
  photo: w("不拍照", 6), cloud: w("不存云笔记", 6), scam: w("诈骗", 7), hash: w("只显示哈希", 8), bad: w("无法解析", 8), nosign: w("就不签", 8),
  yes: w("转走资金", 10), diffv: w("不一样", 11), sign: w("照常签名", 11), dec: w("独立解码", 12), chk: w("核对", 12),
  ind: w("真正独立", 13), where: w("放在哪里", 14), what: w("签下的是什么", 14),
};
const t = (x) => f(x);

S.build({
  cam0: "rolesE", sub: "钥匙放好，更要看清签了什么",
  grid: { u0: -11600, u1: 11200, v0: -11300, v1: 12000 }, box: [-7700, -4200, 15400, 8800],   // 盖住 rolesE / rolesP / softB / vaultA / A2 / wide（全景）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "多因素认证", d: "密码之外再加一种验证，如动态码", at: w("多因素认证", 2) },
    { id: "t1", t: "轮换密钥", d: "换用新密钥并停用旧密钥", at: w("轮换密钥", 3) },
  ],
  end: { title: "钱包与密钥管理", line: "钥匙放好，更要看清签了什么", next: "用户侧诈骗", at: LS[15], nextAt: w("下一集", 15) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 按角色，各做一件事。四张卡依次挂上
      [0, 1, 2, 3].forEach((i) => fadeIn("#rb-card-" + i, ${t(LS[0] + 0.2)} + i * 0.35, 0.3));
      // ===== L1 项目方和交易所：清单上两人连到同一朵云 → 共用
      cam(${t(LS[1] - 0.1)}, "rolesP", 1.2); flash("#rb-tag-0", ${t(LS[1] + 0.3)}, 2);
      ["a", "b", "c"].forEach((k, i) => fadeIn("#p1w" + k, ${t(LS[1] + 1.0)} + i * 0.2, 0.3));
      fadeIn("#p1cl", ${t(LS[1] + 1.8)}, 0.4); fadeIn("#p1ln", ${t(TM.share - 1.6)}, 0.6);
      fadeIn("#p1box", ${t(TM.share)}, 0.3); pop("#l1-sh", ${t(TM.share + 0.1)}, 0.25);
      // ===== L2 钱包开发者：日志屏蔽密钥材料，发布凭证加锁
      out("#p1wa, #p1wb, #p1wc, #p1cl, #p1ln, #p1box, #l1-sh", ${t(LS[2] - 0.2)}, 0.3); flash("#rb-tag-1", ${t(LS[2] + 0.3)}, 2);
      fadeIn("#p2dbw", ${t(LS[2] + 1.6)}, 0.3); pop("#l2-db", ${t(TM.mask)}, 0.25); flash("#l2-db", ${t(TM.mask + 0.9)}, 2);
      fadeIn("#p2kcw", ${t(TM.mfa - 1.4)}, 0.3); pop("#l2-kc", ${t(TM.mfa - 1.2)}, 0.25);
      fadeIn("#p2lkw", ${t(TM.mfa)}, 0.3); pop("#l2-lk", ${t(TM.mfa + 0.2)}, 0.25);
      // ===== L3 运维负责人：旧钥匙变灰、新钥匙亮，管理员门卡拔出
      out("#p2dbw, #p2kcw, #p2lkw, #l2-db, #l2-kc, #l2-lk", ${t(LS[3] - 0.2)}, 0.3); flash("#rb-tag-2", ${t(LS[3] + 0.3)}, 2);
      fadeIn("#p3k0w, #p3kcw", ${t(LS[3] + 0.8)}, 0.3);
      tl.to("#p3k0w", { opacity: 0.35, duration: 0.4 }, ${t(TM.rot)}); pop("#l3-k0", ${t(TM.rot)}, 0.25);
      fadeIn("#p3k1w", ${t(TM.rot + 0.4)}, 0.3); pop("#l3-k1", ${t(TM.rot + 0.6)}, 0.25);
      tl.to("#p3kcw", { y: -70, opacity: 0, duration: 0.8, ease: "power2.in" }, ${t(TM.rev)}); pop("#l3-kc", ${t(TM.rev + 0.2)}, 0.25);
      // ===== L4 备份分开、每年演练、多人恢复
      out("#p3k0w, #p3k1w, #l3-k0, #l3-k1, #l3-kc", ${t(LS[4] - 0.2)}, 0.3);
      fadeIn("#p4kw", ${t(LS[4] + 0.4)}, 0.3); pop("#l4-yr", ${t(TM.year)}, 0.25);
      fadeIn("#p4aw, #p4bw", ${t(TM.multi - 0.6)}, 0.3); pop("#l4-mp", ${t(TM.multi)}, 0.25);
      // ===== L5 普通用户：大额硬件钱包，小额另一个钱包，两套助记词
      out("#p4aw, #p4bw, #p4kw, #l4-yr, #l4-mp", ${t(LS[5] - 0.6)}, 0.3); flash("#rb-tag-3", ${t(LS[5] - 0.4)}, 1);
      cam(${t(LS[5])}, "softB", 1.8, "power2.inOut");
      pop("#l5-bg", ${t(TM.big)}, 0.25); pop("#l5-sm", ${t(TM.small)}, 0.25); pop("#l5-mn", ${t(TM.diff)}, 0.25);
      // ===== L6 助记词只写在纸或金属板上：不拍照，不存云笔记
      out("#l5-mn", ${t(LS[6] - 0.2)}, 0.2); pop("#l6-ok", ${t(LS[6] + 0.3)}, 0.25);
      pop("#nope", ${t(TM.photo)}, 0.3);
      // ===== L7 任何人让你输入助记词都是诈骗
      out("#nope, #l6-ok", ${t(LS[7] - 0.2)}, 0.2); pop("#scam", ${t(LS[7] + 0.2)}, 0.3); flash("#scam .s6-tag", ${t(TM.scam)}, 2);
      // ===== L8 屏幕只显示哈希或无法解析，就不签
      out("#scam, #l5-sm, #l5-bg", ${t(LS[8] - 0.2)}, 0.2);
      fadeIn("#hwB-scr2", ${t(TM.hash)}, 0.2); out("#hwB-scr", ${t(TM.hash)}, 0.2);
      out("#hwB-h", ${t(TM.bad)}, 0.15); fadeIn("#hwB-u", ${t(TM.bad)}, 0.15);
      fadeIn("#hwBox", ${t(TM.nosign - 0.2)}, 0.2); pop("#l8-no", ${t(TM.nosign)}, 0.25);
      // ===== L9 回到开头的问题：镜头到 A，题卡回到中央
      out("#l8-no, #hwBox", ${t(LS[9] - 0.2)}, 0.2);
      cam(${t(LS[9] - 0.1)}, "vaultA", 1.6, "power2.inOut"); pop("#q6", ${t(LS[9] + 1.0)}, 0.3);
      // ===== L10 都没泄露，也能转走：答案"能"
      pop("#q6a", ${t(TM.yes)}, 0.3);
      // ===== L11 看到的和签下的不一样，每把钥匙照常签名（关键画面）
      out("#q6", ${t(LS[11] - 0.2)}, 0.3); cam(${t(LS[11])}, "A2", 1.2);
      fadeIn("#ltw", ${t(LS[11] + 1.4)}, 0.3); flash("#hw0-scr, #hw1-scr, #hw2-scr, #hw3-scr, #hw4-scr, #hw5-scr", ${t(TM.diffv + 0.8)}, 2, 0.4);
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#ok" + i, ${t(TM.diffv + 0.3)} + i * 0.15, 0.2));
      tl.to("#ltw", { y: -470, duration: 1.4, ease: "power1.inOut" }, ${t(TM.diffv + 0.2)});
      out("#ltw", ${t(TM.diffv + 1.6)}, 0.2); pop("#l11-up", ${t(TM.diffv + 1.7)}, 0.25); bump("#l11-up", ${t(TM.sign)}, 1.12, 1);
      // ===== L12 独立解码、核对字段：代码卡 A + 六只放大镜，屏幕字段变红，六只手停住，金库门关回
      out("#l11-up, #ok0, #ok1, #ok2, #ok3, #ok4, #ok5", ${t(LS[12] - 0.2)}, 0.2);
      tl.set("#ltw", { y: 0 }, ${t(LS[12])});
      pop("#cA", ${t(LS[12] + 0.2)}, 0.3); [0, 1, 2].forEach((i) => hot("#cA-r" + i, ${t(LS[12] + 1.0)} + i * 0.7));
      [0, 1, 2, 3, 4, 5].forEach((i) => fadeIn("#mgw" + i, ${t(TM.dec)} + i * 0.1, 0.3));
      [0, 1, 2, 3, 4, 5].forEach((i) => { out("#hw" + i + "-scr", ${t(TM.chk)}, 0.2); fadeIn("#hw" + i + "-scr2", ${t(TM.chk)}, 0.2); });
      pop("#cA-c3", ${t(TM.chk + 0.3)}, 0.2); hot("#cA-r3", ${t(TM.chk + 0.3)}); draw("cvA", ${t(TM.chk + 0.4)});
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#st" + i, ${t(TM.chk + 0.8)} + i * 0.1, 0.2));
      KIT.door(tl, "sfA", ${t(TM.chk + 1.2)}, 0, 1.2);
      // ===== L13 只在签名人真正独立时成立：设备之间隔开；合成一台变红（一闪而过）
      out("#cA, #cvA, #st0, #st1, #st2, #st3, #st4, #st5", ${t(LS[13] - 0.2)}, 0.3);
      fadeIn("#sepA", ${t(LS[13] + 0.2)}, 0.4); pop("#l13-in", ${t(LS[13] + 0.4)}, 0.25);
      fadeIn("#sepR", ${t(TM.ind)}, 0.15); pop("#l13-one", ${t(TM.ind + 0.05)}, 0.2);
      out("#sepR, #l13-one", ${t(TM.ind + 1.1)}, 0.2);
      // ===== L14 放在哪里重要，签下的是什么同样重要：拉到全景，陈列馆 / 签名台轻亮
      out("#sepA, #l13-in, #mgw0, #mgw1, #mgw2, #mgw3, #mgw4, #mgw5", ${t(LS[14] - 0.2)}, 0.3);
      cam(${t(LS[14])}, "world", 1.8, "power2.inOut");
      fadeIn("#glB", ${t(TM.where)}, 0.5); pop("#kw14a", ${t(TM.where)}, 0.3);
      fadeIn("#glD", ${t(TM.what)}, 0.5); pop("#kw14b", ${t(TM.what)}, 0.3);
      // ===== L15 下一集讲用户侧诈骗（结束卡，镜头静止在 world）
      out("#kw14a, #kw14b", ${t(LS[15] - 0.2)}, 0.3);
`,
});
