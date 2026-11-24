// ep24/seg2「② 诈骗的原料」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.homeA（BRIEF）。
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// starts on CAMS.homeA (= seg1 end) · L3 bookA · L8 homeA · L13 pan → ends static on CAMS.backB

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const t = (x) => f(x);
const inv = (cn, [sx, sy]) => { const c = L.CAMS[cn]; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; };   // screen → world canvas
const gnd = (cn, sp) => { const q = G(...inv(cn, sp)); return { u: Math.round(q.u), v: Math.round(q.v) }; };   // screen → ground point
const isPt = (p) => Array.isArray(p) && typeof p[0] === "number";
/** objects that ignore opts.scale: wrap around the ground point and rescale anchors */
const wput = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${svg}</g>` });
  for (const n in A[key]) if (isPt(A[key][n])) A[key][n] = [gx + (A[key][n][0] - gx) * k, gy + (A[key][n][1] - gy) * k];
};
const P = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z).map((x) => f(x)).join(",");

// ---------------------------------------------------------------- 路面 + 数据管（最底层）
{
  const R = L.ROAD, u0 = -1600, u1 = 4600;
  add({ u: 0, v: -99999 }, `<polygon points="${P({ u: u0, v: R.v0 })} ${P({ u: u1, v: R.v0 })} ${P({ u: u1, v: R.v1 })} ${P({ u: u0, v: R.v1 })}" fill="#dcd8d0" stroke="#cbc5b9" stroke-width="2"/>
  <line x1="${f(Wp(u0, 0)[0])}" y1="${f(Wp(u0, 0)[1])}" x2="${f(Wp(u1, 0)[0])}" y2="${f(Wp(u1, 0)[1])}" stroke="#2aa3c9" stroke-width="7" stroke-linecap="round" opacity="0.75"/>`);
}

// ---------------------------------------------------------------- A 用户家（seg1 段尾已在画面里）
put("signA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "signA", style: "plate", text: "用户家" }));
put("userA", L.USER_A, O.person(L.USER_A, { id: "userA", role: "signer", scale: 0.55 }));
// default (normal) screen at frame 0 = seg1 end; scr2 = incoming call: who0 "未知号码" (L0) → who1 "交易所客服" (L9)
const callScr = `<rect width="76" height="150" fill="#22303a"/><text x="38" y="30" font-size="11" fill="#cfe6ee" text-anchor="middle">来电</text>
  <g id="who0"><text x="38" y="58" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">未知号码</text></g>
  <g id="who1" opacity="0"><text x="38" y="58" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">交易所客服</text>
  <rect x="8" y="72" width="60" height="6" rx="3" fill="#e0453a"/><rect x="8" y="84" width="44" height="6" rx="3" fill="#e0453a"/></g>
  <circle cx="20" cy="124" r="11" fill="#e0453a"/><circle cx="56" cy="124" r="11" fill="#1f9d55"/>`;
wput("phoneA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phoneA", screen2: callScr }));
put("addrA", L.ADDR_A, E2.addrPlate(L.ADDR_A, { id: "addrA", text: "住址" }));
put("hwA", L.HW_A, O.hwWallet(L.HW_A, { id: "hwA" }));
put("parcelA", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "parcelA", scale: 0.8 }));
put("simA", L.SIM_A, E22.simCard(L.SIM_A, { id: "simA", scale: 0.7, label: "手机号" }));
L.ENV_A.forEach((q, i) => put("envA" + i, q, O.envelope(q, { id: "envA" + i, w: q.w, h: q.h })));
put("wlA", L.WL_A, O.doc(L.WL_A, { id: "wlA", standing: true, title: "提币白名单", w: L.WL_A.w, h: L.WL_A.h }));
put("atkCall", L.ATK_CALL, O.person(L.ATK_CALL, { id: "atkCall", role: "attacker", scale: 0.5 }), 0, { grow: true });
put("atkDoor", L.ATK_DOOR, O.person(L.ATK_DOOR, { id: "atkDoor", role: "attacker", scale: 0.5 }), 0, { grow: true });
wput("book", L.MANUAL, E3.manual(L.MANUAL, { id: "book", title: "肥羊通讯录", sub: "客户名单" }));
S.grow("book");

// 名单卡（浮在 A 上空）
{
  const [gx, gy] = at(L.LIST_A), x0 = gx - 200, y0 = gy - 180;
  const cols = ["持有多少", "住址", "交易所"];
  let s = `<rect x="${f(x0)}" y="${f(y0)}" width="400" height="180" rx="12" fill="#fffdf8" stroke="#e0453a" stroke-width="3"/>
  <text x="${f(x0 + 18)}" y="${f(y0 + 36)}" font-size="26" font-weight="900" fill="#c3352b">名单</text>
  <rect x="${f(x0 + 84)}" y="${f(y0 + 20)}" width="290" height="8" rx="4" fill="#efe9de"/>`;
  cols.forEach((c, i) => {
    const cx = x0 + 18 + i * 124;
    s += `<rect id="listA-c${i}" x="${f(cx)}" y="${f(y0 + 50)}" width="116" height="30" rx="6" fill="#f1ede5"/>
    <text x="${f(cx + 58)}" y="${f(y0 + 71)}" font-size="17" font-weight="800" fill="#1c1c1c" text-anchor="middle">${c}</text>`;
    for (let r = 0; r < 3; r++) s += `<rect x="${f(cx + 8)}" y="${f(y0 + 94 + r * 26)}" width="${[92, 70, 84][(r + i) % 3]}" height="10" rx="5" fill="#ddd6c9"/>`;
  });
  s += `<g id="listA-old" opacity="0"><rect x="${f(x0)}" y="${f(y0)}" width="400" height="180" rx="12" fill="#b88a3a" opacity="0.32"/></g>`;
  add(L.LIST_A, S.hid("listA", s), 400);
}
// 银行流水卡（私密，加锁）
{
  const [gx, gy] = at(L.BANK_A), x0 = gx - 60, y0 = gy - 80;
  add(L.BANK_A, S.hid("bankA", `<rect x="${f(x0)}" y="${f(y0)}" width="120" height="80" rx="8" fill="#e6e3dd" stroke="#9a9387" stroke-width="2"/>
  <text x="${f(x0 + 10)}" y="${f(y0 + 24)}" font-size="16" font-weight="800" fill="#6b665c">银行流水</text>
  ${[0, 1, 2].map((r) => `<rect x="${f(x0 + 10)}" y="${f(y0 + 38 + r * 13)}" width="${[70, 56, 64][r]}" height="7" rx="3.5" fill="#c9c4ba"/>`).join("")}
  <path d="M${f(x0 + 92)} ${f(y0 + 52)}v-8a10 10 0 0 1 20 0v8" fill="none" stroke="#6b665c" stroke-width="3"/>
  <rect x="${f(x0 + 87)}" y="${f(y0 + 52)}" width="30" height="22" rx="4" fill="#6b665c"/>`), 400);
}
// 公开的链（五个区块）
{
  const [gx, gy] = at(L.BOOK_CHAIN), s2 = 20, h = 36;
  const Q = (cx, cy, u, v, z) => { const p = Wp(u, v, z); return `${f(cx + p[0])},${f(cy + p[1])}`; };
  let s = "";
  for (let i = 0; i < 5; i++) {
    const cx = gx + (i - 2) * 86, cy = gy - 14;
    if (i) s += `<line x1="${f(cx - 86 + 28)}" y1="${f(cy - 34)}" x2="${f(cx - 28)}" y2="${f(cy - 34)}" stroke="#1d93ba" stroke-width="4"/>`;
    s += `<polygon class="bc-l" points="${Q(cx, cy, -s2, -s2, 0)} ${Q(cx, cy, -s2, s2, 0)} ${Q(cx, cy, -s2, s2, h)} ${Q(cx, cy, -s2, -s2, h)}" fill="#1d93ba" stroke="#13647f" stroke-width="1.2"/>
    <polygon class="bc-f" points="${Q(cx, cy, -s2, s2, 0)} ${Q(cx, cy, s2, s2, 0)} ${Q(cx, cy, s2, s2, h)} ${Q(cx, cy, -s2, s2, h)}" fill="#2aa3c9" stroke="#13647f" stroke-width="1.2"/>
    <polygon class="bc-t" points="${Q(cx, cy, -s2, -s2, h)} ${Q(cx, cy, s2, -s2, h)} ${Q(cx, cy, s2, s2, h)} ${Q(cx, cy, -s2, s2, h)}" fill="#7cc8e0" stroke="#13647f" stroke-width="1.2"/>`;
  }
  add(L.BOOK_CHAIN, S.hid("bookChain", s), 400);
}

// ---------------------------------------------------------------- B 外包客服中心（段尾 backB）
put("signB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "signB", style: "plate", text: "外包客服中心" }));
put("ledger", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ledger", tag: "客服后台" }));
const rowsScr = `<rect width="148" height="88" fill="#f4f9fb"/><rect width="148" height="12" fill="#2aa3c9"/>
  ${[0, 1, 2, 3, 4].map((r) => `<rect id="d2-r${r}" x="6" y="${17 + r * 14}" width="${[120, 104, 128, 96, 112][r]}" height="9" rx="3" fill="#d3e7ee"/>`).join("")}
  <g id="d2-camicon" opacity="0"><rect x="116" y="58" width="26" height="20" rx="4" fill="#e0453a"/><circle cx="129" cy="68" r="6" fill="#ffffff"/><rect x="121" y="54" width="10" height="5" fill="#e0453a"/></g>`;
L.DESKS.forEach((q, i) => wput("desk" + i, q, O.desk(q, { id: "desk" + i, screen: i === 1 ? rowsScr : undefined, screen2: i === 1 ? `<rect width="148" height="88" fill="#2b2d31"/>` : undefined })));
L.AGENTS.forEach((q, i) => put("agent" + i, q, O.person(q, { id: "agent" + i, role: "engineer", scale: q.scale })));
put("recruiter", L.RECRUITER, O.person(L.RECRUITER, { id: "recruiter", role: "attacker", scale: 0.5 }));
put("bribe", L.BRIBE, O.envelope(L.BRIBE, { id: "bribe", w: L.BRIBE.w, h: L.BRIBE.h }));
L.BRIBE_COINS.forEach((q, i) => put("bcoin" + i, q, E7.oddCoin(q, { id: "bcoin" + i, scale: q.scale }), 2));
const XLINES = ["姓名", "证件图像", "余额", "交易记录"];
[0, 1, 2].forEach((i) => { const q = S.rel(L.STACK_B, -12 * i, -12 * i); put("stk" + i, q, O.doc(q, { id: "stk" + i, standing: true, title: "导出", lines: XLINES, w: L.STACK_B.w, h: L.STACK_B.h })); });
const FLY = S.rel(L.STACK_B, 14, 14);
put("fly", FLY, O.doc(FLY, { id: "fly", standing: true, title: "导出", lines: XLINES, w: L.STACK_B.w, h: L.STACK_B.h }), 0, { wrap: (s) => S.hid("flyw", s) });
{
  const [gx, gy] = at(L.VAULT_B);
  add(L.VAULT_B, `<rect x="${f(gx)}" y="${f(gy)}" width="290" height="200" rx="14" fill="none" stroke="#9a9387" stroke-width="3" stroke-dasharray="10 8"/>
  <text x="${f(gx + 14)}" y="${f(gy + 30)}" font-size="20" font-weight="800" fill="#6b665c">不在数据里</text>`, -300);
}
wput("padB", L.PADLOCK_B, O.padlock(L.PADLOCK_B, { id: "padB" }));
wput("keyB", L.KEY_B, O.key(L.KEY_B, { id: "keyB" }));
const RANSOM = gnd("backB", [1450, 860]);
put("ransom", RANSOM, O.doc(RANSOM, { id: "ransom", standing: true, state: "attacker", title: "勒索", lines: ["2000 万美元"], w: 120, h: 150 }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签
const WL = (cn, sp) => inv(cn, sp);
lb("lb-call", WL("bookA", [1095, 330]), `<svg width="18" height="26" viewBox="0 0 18 26" style="vertical-align:-5px;margin-right:6px"><rect x="1" y="1" width="16" height="24" rx="3" fill="none" stroke="#e0453a" stroke-width="2.5"/><circle cx="9" cy="20" r="1.8" fill="#e0453a"/></svg>冒充客服`, "lab-r lab-sm", "l");
lb("lb-door", WL("bookA", [1095, 392]), `<svg width="20" height="26" viewBox="0 0 20 26" style="vertical-align:-5px;margin-right:6px"><rect x="2" y="1" width="16" height="24" rx="2" fill="none" stroke="#e0453a" stroke-width="2.5"/><circle cx="14" cy="14" r="1.8" fill="#e0453a"/></svg>找上门`, "lab-r lab-sm", "l");
lb("lb-bad", WL("bookA", [1345, 600]), "比喻不成立", "lab-r", "r");
lb("lb-priv", WL("bookA", [1413, 652]), "私密", "lab-ink lab-sm", "t");
lb("lb-pub", WL("bookA", [1405, 366]), "公开", "lab-cs lab-sm", "r");
lb("lb-hist", WL("bookA", [1603, 330]), "全部历史 · 当前余额", "lab-cs");
lb("lb-old", WL("homeA", [835, 205]), "几年前泄露", "lab-ink lab-sm", "r");
lb("lb-now", WL("homeA", [835, 262]), "今天仍在用", "lab-r", "r");
lb("lb-ledger", up(A.ledger.top, 4), "客服后台", "lab-ink");
lb("lb-exit", WL("backB", [885, 236]), "最集中的出口", "lab-r lab-sm");
lb("lb-recr", up(A.recruiter.top, 6), "高价收数据", "lab-r lab-sm");
lb("lb-ssn", WL("backB", [1160, 300]), "社保号后四位", "lab-ink lab-sm");
lb("lb-bank", WL("backB", [1160, 256]), "银行账号（部分遮蔽）", "lab-ink lab-sm");
lb("lb-amt", WL("backB", [1450, 688]), "2000 万美元", "lab-r");
lb("lb-bounty", WL("backB", [1530, 760]), "悬赏 · 同等金额", "lab-g", "l");
lb("lb-comp", WL("backB", [1530, 822]), "赔偿被骗用户", "lab-g", "l");
lb("lb-fired", WL("backB", [719, 615]), "解雇", "lab-ink lab-sm");
lb("lb-arrest", WL("backB", [719, 562]), "2025 年 12 月 · 逮捕一名前客服", "lab-r lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const BK = { x: 1470, y: 400, w: 380 };
const book = codeCard("bk", { ...BK, head: "肥羊通讯录", rowHide: true, rows: [
  { html: "姓名" }, { html: "电话" }, { html: "存款金额" }, { html: "上周刚联系过客服" }, { html: "地址 0x…", chip: "公开", chipCls: "x" }] });
S.curve("cv", [BK.x + BK.w + 4, codeRowY(BK.y, 4)], S.scr("bookA", [at(L.BOOK_CHAIN)[0] + 60, at(L.BOOK_CHAIN)[1] - 4]), { color: "#e0453a", c1: [1856, 560], c2: [1720, 420] });
const FR = [["fr1", [705, 409, 136, 206], "精准钓鱼"], ["fr2", [883, 649, 88, 96], "账号接管"], ["fr3", [257, 393, 146, 212], "人身风险"]];
const frames = FR.map(([id, [x, y, wd, ht], lab]) => `<div class="fr" id="${id}" style="left:${x}px;top:${y}px;width:${wd}px;height:${ht}px"></div>
  <div class="fr-l" id="${id}-l" style="left:${x + wd / 2}px;top:${id === "fr2" ? y + ht + 10 : y - 52}px">${lab}</div>`).join("");
const html = kw("kw-acc", "准确表述", { x: 400, y: 110, size: 34 }) + book + frames
  + evt("ev-meta", `${gtag("比喻")} 名单 ≈ 肥羊通讯录`, { top: 120 })
  + evt("ev-path", `${gtag("常见路径")} 社交平台招募内部人`, { top: 126 })
  + evt("ev-cb", "Coinbase · 2025 年 5 月", { top: 132 })
  + evt("ev-sec", "来源 · Coinbase SEC 8-K 文件", { top: 212, color: "#e0453a" })
  + evt("ev-news", "来源 · 公开报道", { top: 138 });
const css = `.fr { position:absolute; border:4px dashed #e0453a; border-radius:14px; opacity:0; }
  .fr-l { position:absolute; transform:translateX(-50%); opacity:0; background:#fffdf8; border:3px solid #e0453a; color:#c3352b; font-size:30px; font-weight:900; padding:4px 14px; border-radius:10px; white-space:nowrap; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const SIMTO = (() => { const a = at(L.ATK_CALL), b = at(L.SIM_A); return [a[0] - 46 - b[0], a[1] + 26 - b[1]]; })();
const FLYD = (() => { const d = A.desk1.screen, c = A.fly.center; return [d[0] - c[0], d[1] - c[1]]; })();
const TM = {
  hold: w("持有", 2), live: w("住在", 2), ex: w("交易所", 2), imp: w("冒充", 3), door: w("找上门", 3),
  sheep: w("肥羊", 4), name: w("姓名", 5), tel: w("电话", 5), dep: w("存款", 5), last: w("上周", 5),
  bank: w("银行流水", 6), chain: w("链上交易", 6), addr: w("地址", 7), all: w("全部", 7),
  three: w("三类", 8), phish: w("精准钓鱼", 9), ato: w("账号接管", 10), hijack: w("劫持", 10), phys: w("人身风险", 11), home: w("住址", 11),
  years: w("几年前", 12), today: w("今天", 12), exit: w("客服后台", 13), recruit: w("招募", 14), buy: w("收买", 14),
  query: w("查询", 15), shot: w("截屏", 15), dump: w("导出", 15), ssn: w("社保号", 16), mask: w("遮蔽", 16),
  amt: w("2000", 17), refuse: w("拒付", 18), bounty: w("悬赏", 18), comp: w("赔偿", 18), fired: w("解雇", 19), arrest: w("逮捕", 19), india: w("印度", 19),
};

S.build({
  cam0: "homeA", sub: "名单比密码更好用",
  grid: { u0: -2000, u1: 5300, v0: -3700, v1: 3600 }, box: [-1200, -1800, 5100, 2600],   // 覆盖本段镜头 homeA / bookA / backB（含上段段尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "账号接管", d: "攻击者拿到并控制你的账号", at: w("账号接管", 10) },
    { id: "t1", t: "遮蔽", d: "默认隐藏敏感字段的部分内容", at: w("遮蔽", 16) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。
      pop("#kw-acc", ${t(LS[0] + 0.1)}); grow("atkCall", ${t(Math.max(1.9, LS[0] + 0.3))}); fadeIn("#phoneA-scr2", ${t(Math.max(2.1, LS[0] + 0.5))}, 0.3); bump("#phoneA", ${t(Math.max(2.4, LS[0] + 0.8))}, 1.05, 2); out("#kw-acc", ${t(LS[1] + 0.5)});
      // ===== L1 数据泄露，是下一次诈骗的名单。
      fadeIn("#listA", ${t(LS[1] + 0.3)}, 0.4); bump("#listA", ${t(LS[1] + 0.8)}, 1.04);
      // ===== L2 攻击者知道了谁持有多少资产，住在哪里，用哪家交易所。
      tl.to("#listA-c0", { attr: { fill: "#fbd3cd" }, duration: 0.2 }, ${t(TM.hold)});
      tl.to("#listA-c1", { attr: { fill: "#fbd3cd" }, duration: 0.2 }, ${t(TM.live)}); flash("#addrA", ${t(TM.live)}, 2, 0.35);
      tl.to("#listA-c2", { attr: { fill: "#fbd3cd" }, duration: 0.2 }, ${t(TM.ex)});
      // ===== L3 他就能冒充客服精准下手，甚至找上门。
      cam(${t(LS[3])}, "bookA", 1.2); pop("#lb-call", ${t(Math.max(TM.imp, LS[3] + 1.0))}); pop("#lb-door", ${t(TM.door)});
      // ===== L4 打个比方，一份泄露的客户名单，就是一本肥羊通讯录。
      out("#lb-call, #lb-door", ${t(LS[4] - 0.2)}); pop("#ev-meta", ${t(LS[4] + 0.2)}); grow("book", ${t(TM.sheep - 0.2)}); pop("#bk", ${t(TM.sheep + 0.3)});
      // ===== L5 上面有姓名、电话、存款金额，还注明他上周刚联系过客服。
      pop("#bk-r0", ${t(TM.name)}, 0.2); pop("#bk-r1", ${t(TM.tel)}, 0.2); pop("#bk-r2", ${t(TM.dep)}, 0.2); pop("#bk-r3", ${t(TM.last)}, 0.2); hot("#bk-r3", ${t(TM.last + 0.3)});
      // ===== L6 比喻在这里不成立，银行流水是私密的，链上交易是公开的。
      pop("#lb-bad", ${t(LS[6] + 0.2)}); fadeIn("#bankA", ${t(TM.bank)}, 0.3); pop("#lb-priv", ${t(TM.bank + 0.3)});
      fadeIn("#bookChain", ${t(TM.chain)}, 0.3); pop("#lb-pub", ${t(TM.chain + 0.3)});
      // ===== L7 一个地址 → 全部链上历史（关键画面）
      out("#lb-bad", ${t(LS[7] - 0.2)}); pop("#bk-r4", ${t(TM.addr)}, 0.2); pop("#bk-c4", ${t(TM.addr + 0.2)}, 0.2); hot("#bk-r4", ${t(TM.addr + 0.2)}); draw("cv", ${t(TM.addr + 0.4)}, 0.7);
      tl.to("#bookChain .bc-t", { attr: { fill: "#c9f0fb" }, duration: 0.3 }, ${t(TM.all)}); tl.to("#bookChain .bc-f", { attr: { fill: "#4cc2e6" }, duration: 0.3 }, ${t(TM.all)});
      pop("#lb-hist", ${t(TM.all + 0.2)});
      // ===== L8 回到 homeA：三个空的红框
      out("#bk, #cv, #ev-meta, #lb-priv, #lb-pub, #lb-hist", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "homeA", 1.2);
      pop("#fr1", ${t(TM.three + 0.1)}); pop("#fr2", ${t(TM.three + 0.25)}); pop("#fr3", ${t(TM.three + 0.4)});
      // ===== L9 精准钓鱼：来电 = 交易所客服
      pop("#fr1-l", ${t(TM.phish)}); out("#who0", ${t(TM.phish + 0.3)}); fadeIn("#who1", ${t(TM.phish + 0.3)}, 0.3); bump("#fr1", ${t(TM.phish + 0.4)}, 1.05);
      // ===== L10 账号接管：手机号滑到攻击者手里
      pop("#fr2-l", ${t(TM.ato)}); X22.chipFlash(tl, "simA", ${t(TM.hijack - 0.6)}, 2, "red");
      tl.to("#simA", { x: ${f(SIMTO[0])}, y: ${f(SIMTO[1])}, duration: 0.9, ease: "power2.inOut" }, ${t(TM.hijack)});
      // ===== L11 人身风险：住址旁的剪影
      pop("#fr3-l", ${t(TM.phys)}); grow("atkDoor", ${t(TM.home)}); flash("#addrA", ${t(TM.home + 0.3)}, 2, 0.35);
      // ===== L12 名单泛黄：几年前泄露 → 今天仍在用
      fadeIn("#listA-old", ${t(TM.years)}, 0.6); pop("#lb-old", ${t(TM.years + 0.2)}); pop("#lb-now", ${t(TM.today)});
      // ===== L13 右移到 B：客服后台 = 最集中的出口
      out("#fr1, #fr2, #fr3, #fr1-l, #fr2-l, #fr3-l, #lb-old, #lb-now", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "backB", 2.4);
      fadeIn("#ledger-glow", ${t(TM.exit)}, 0.4); pop("#lb-ledger", ${t(TM.exit)}); pop("#lb-exit", ${t(TM.exit + 0.4)});
      // ===== L14 招募者开价收买
      pop("#ev-path", ${t(LS[14] + 0.2)}); pop("#lb-recr", ${t(TM.recruit)}); bump("#bribe", ${t(TM.buy)}, 1.1);
      // ===== L15 客服 2 后台查询 → 截屏 / 导出
      [0, 1, 2, 3, 4].forEach((i) => tl.to("#d2-r" + i, { attr: { fill: "#e0453a" }, duration: 0.15 }, ${t(TM.query)} + i * 0.18));
      fadeIn("#d2-camicon", ${t(TM.shot)}, 0.15); flash("#d2-camicon", ${t(TM.shot + 0.2)}, 2, 0.2);
      fadeIn("#flyw", ${t(TM.dump)}, 0.15); tl.fromTo("#fly", { x: ${f(FLYD[0])}, y: ${f(FLYD[1])} }, { x: 0, y: 0, duration: 0.8, ease: "power2.inOut", immediateRender: false }, ${t(TM.dump)});
      // ===== L16 Coinbase 细节：社保号后四位、部分遮蔽的银行账号
      out("#ev-path", ${t(LS[16] - 0.2)}); pop("#ev-cb", ${t(LS[16] + 0.2)}); pop("#lb-ssn", ${t(TM.ssn)}); pop("#lb-bank", ${t(TM.mask)});
      // ===== L17 勒索 2000 万美元
      grow("ransom", ${t(LS[17] + 0.2)}); pop("#lb-amt", ${t(TM.amt)}); pop("#ev-sec", ${t(TM.amt + 0.4)});
      // ===== L18 拒付：勒索单红叉，悬赏与赔偿
      KIT.broke(tl, "ransom", ${t(TM.refuse)}, { badge: false, ghost: 0.45 }); pop("#lb-bounty", ${t(TM.bounty)}); pop("#lb-comp", ${t(TM.comp)});
      // ===== L19 解雇、逮捕
      out("#ev-cb, #ev-sec", ${t(LS[19] - 0.2)}); fadeIn("#desk1-scr2", ${t(TM.fired)}, 0.4); pop("#lb-fired", ${t(TM.fired + 0.2)});
      pop("#lb-arrest", ${t(TM.arrest)}); pop("#ev-news", ${t(TM.india)});
`,
});
