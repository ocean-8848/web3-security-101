// ep30/seg2「② 刷卡写字楼」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.hallA（BRIEF），L0 右移到 gateB；ends static on CAMS.roninB。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A–F 整座联盟大厦（seg6 L8–L10、L13–L14 结束卡）
//   A            分区全景
//   B            
//   C            
//   D            
//   E            
//   F            
//   nodesA       A 四台机柜 + 工牌 + 账本 + 门外门禁与攻击者（seg1 起点 L0–L3）
//   hashA        A 区块链 + 哈希漏斗两路 + 扳道器 + 证明卡 + 四本账本（seg1 L4–L9）
//   hallA        A 大厅全景 + 门外门禁 + 题卡（seg1 L10–L14 终点；seg2 起点）
//   gateB        B 门禁闸机 + 前台 + 工牌堆 + 万能钥匙 + 物业（seg2 L0–L5）
//   metaphorB    B 广场 vs 写字楼 + 监控报警 vs 改写账本（seg2 L6–L12）
//   rolesB       B 资源阶梯 roleBoard（+ 前台 / 万能钥匙在左侧）（seg2 L13–L17）
//   roninB       B Ronin 角：九把钥匙 + 门槛表（seg2 L18–L20 终点；seg3 起点）
//   pipeC        C 三道关：背书节点 + 读写集 + 排序服务 + 关卡 + 世界状态（seg3 L0–L5）
//   policyC      C 策略牌 + 五台 Raft 机柜 + 关卡（seg3 L6–L12）
//   privacyC     C 私有数据保险柜 + 信封 + 哈希漏斗 + 三张哈希签 + 圈外组织 + 盐罐（seg3 L13–L17）
//   detC         C 时钟 + 骰子 + 两张读写集（seg3 L18–L19 终点；seg4 起点）
//   caD          D 根 CA 加密机 + 在线服务器 + 中间 CA 公章 + 身份 / TLS CA + 隔板（seg4 L0–L5）
//   adminD       D 服务商工位 + 三张管理员卡 + 三台自家机柜（seg4 L6–L9）
//   configD      D 通道配置 + 三枚公章 + 变更留痕 + 吊销工牌 + 已分发数据 + 沙漏（seg4 L10–L14）
//   colludeD     D 三名成员 + 红账本 + 账本摘要 → 公链（seg4 L15–L18）
//   cloudD       D 云桶拆分（seg4 L19 终点；seg5 起点）
//   cordaE       E Corda 节点 + 公证人柜台 + 同一状态 + 包裹 + 放大镜 + always-accept（seg5 L0–L7）
//   besuE        E Besu 轮值台 + 铸币机 + 合同（seg5 L8–L14）
//   p2pE         E 插线板 + 防火墙 + 四份本地准入（seg5 L15–L17）
//   legacyE      E 退役机柜 + 牌子 + 扳手 + 迁移箭头（seg5 L18–L21 终点；seg6 起点）
//   deskF        F 问询台 + 安全假设 + 工牌 + 用户 / 手机 + 三块牌子 + 删除更正 / 锚定 / 审计（seg6 L0–L7、L11–L12）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内专用镜头：L8 推近前台 + 物业；L13–L17 资源阶梯靠左，右侧留给四张入口卡
const rc = L.rect;
const CAMS2 = {
  ...L.CAMS,
  frontB: L.fit([rc(L.B_TELLER, "tellerCounter"), ...L.B_STACK.map((q) => rc(q, "keycard")), rc(L.B_MASTER, "key"), rc(L.B_STAFF, "person")], [360, 300, 1560, 840]),
  breakB: L.fit([...L.R.breakB, rc(L.B_GATE, "firewall160")], [300, 300, 1620, 840], 1.3),
  rolesL: L.fit([...L.R.roles, rc(L.B_MASTER, "key"), rc(L.B_STAFF, "person")], [140, 290, 1060, 860]),
};
const S = segInit(import.meta.url, { cams: CAMS2, ext: [E1, E5, E11] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 opts.scale 的物件：绕地面点包一层，并换算 anchors
const wput = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale ?? 1;
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const isP = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === "number";
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) {
    const v = A[key][n];
    if (isP(v)) A[key][n] = sc(v); else if (Array.isArray(v) && v.every(isP)) A[key][n] = v.map(sc);
  }
};
const P = (o, dx = 0, dy = 0) => { const [x, y] = at(o); return [x + dx, y + dy]; };  // 地面点 + 屏幕偏移（世界画布 px）
const top = (o, kind, d = 6) => { const q = rc(o, kind); return [(q[0] + q[2]) / 2, q[1] - d]; };
const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";
// 红色虚线框（隐藏，fadeIn 出现），q = 世界画布 bbox
const rbox = (id, q, pad = 10) => add({ u: 0, v: 99999 }, S.hid(id, `<rect x="${q[0] - pad}" y="${q[1] - pad}" width="${q[2] - q[0] + 2 * pad}" height="${q[3] - q[1] + 2 * pad}" rx="12" fill="rgba(224,69,58,0.06)" stroke="${RED}" stroke-width="4" stroke-dasharray="12 8"/>`));
const union = (...qs) => [Math.min(...qs.map((q) => q[0])), Math.min(...qs.map((q) => q[1])), Math.max(...qs.map((q) => q[2])), Math.max(...qs.map((q) => q[3]))];
const ztag = (o, text) => { const [x, y] = P(o); add(o, `<g><rect x="${x - 100}" y="${y - 22}" width="200" height="46" rx="10" fill="#fffdf8" stroke="${TEAL}" stroke-width="3"/><text x="${x}" y="${y + 10}" text-anchor="middle" font-size="26" font-weight="800" fill="#1d93ba">${text}</text></g>`, -400); };

// 参观路线（地面青蓝虚线箭头，A → B → 继续向右）
{
  const [x0, y0] = at(L.routeAt(-1800)), [x1, y1] = at(L.routeAt(7600));
  add(L.routeAt(-1800), `<g opacity="0.7"><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${TEAL}" stroke-width="5" stroke-dasharray="18 14"/></g>`, -99999);
}

// ---- A 记账大厅（上一段结尾 hallA 的画面）
L.A_RACKS.forEach((q, i) => wput(`a-rk${i}`, q, O.rack(q, { id: `a-rk${i}`, tag: `Org${i + 1}` })));
L.A_CARDS.forEach((q, i) => put(`a-kc${i}`, q, E5.keycard(q, { id: `a-kc${i}`, scale: 0.5, color: GREEN, text: "有效证书" })));
L.A_LEDGERS.forEach((q, i) => put(`a-lg${i}`, q, O.ledgerBook(q, { id: `a-lg${i}`, scale: 0.4 })));
wput("a-chain", L.A_CHAIN, O.chain(L.A_CHAIN, { id: "a-chain", n: 3, labels: ["#1", "#2", "区块"] }));
wput("a-fun", L.A_FUNNEL, E3.hashFunnel(L.A_FUNNEL, { id: "a-fun", text: "解析" }));
put("a-fork", L.A_FORK, E16.forkSwitch(L.A_FORK, { id: "a-fork", scale: 0.6, thrown: true }));
put("a-proof", L.A_PROOF, E2.proofCard(L.A_PROOF, { id: "a-proof", text: "编码无歧义" }));
wput("a-gate", L.A_GATE, E1.firewall(L.A_GATE, { id: "a-gate", len: 160 }));
put("a-atk", L.A_ATTACKER, O.person(L.A_ATTACKER, { id: "a-atk", role: "attacker", color: "#a39d92", scale: 0.4 }));
{
  const [x, y] = P(L.A_HASHLBL);
  add(L.A_HASHLBL, `<g><rect x="${x - 105}" y="${y - 28}" width="210" height="38" rx="9" fill="#fffdf8" stroke="${TEAL}" stroke-width="2.5"/><text x="${x}" y="${y}" text-anchor="middle" font-size="22" font-weight="800" fill="#1d93ba">同一个哈希</text></g>`, 600);
  [["交易 A B C", TEAL], ["交易 A C B", RED]].forEach(([t, c], i) => {
    const [px, py] = P(L.A_PATHS[i]);
    add(L.A_PATHS[i], `<g><rect x="${px - 78}" y="${py - 28}" width="156" height="38" rx="9" fill="#fffdf8" stroke="${c}" stroke-width="2.5"/><text x="${px}" y="${py}" text-anchor="middle" font-size="22" font-weight="800" fill="${c}">${t}</text></g>`, 600);
  });
  const [tx, ty] = P(L.A_TITLE);
  add(L.A_TITLE, `<g><rect x="${tx - 210}" y="${ty - 130}" width="420" height="130" rx="16" fill="#fffdf8" stroke="#1c1c1c" stroke-width="3"/><text x="${tx}" y="${ty - 52}" text-anchor="middle" font-size="44" font-weight="900" fill="#1c1c1c">风险在哪里？</text></g>`, 600);
  ztag(L.A_TAG, "记账大厅");
}

// ---- B 门禁大堂
{ // 公共广场（地面圆）
  const [x, y] = P(L.B_PLAZA);
  add(L.B_PLAZA, `<g><ellipse cx="${x}" cy="${y}" rx="270" ry="105" fill="#e6dfd0" stroke="#c9bfa9" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="200" ry="76" fill="none" stroke="#d5ccb9" stroke-width="2" stroke-dasharray="10 8"/></g>`, -300);
}
L.B_CROWD.forEach((q, i) => put(`cr${i}`, q, O.person(q, { id: `cr${i}`, role: i === 2 ? "engineer" : undefined, scale: 0.35 })));
wput("pchain", L.B_PCHAIN, O.chain(L.B_PCHAIN, { id: "pchain", n: 3 }));
wput("dep", L.B_DEPOSIT, O.safe(L.B_DEPOSIT, { id: "dep", gold: true }));
put("bsign", L.B_SIGN, E1.signBoard(L.B_SIGN, { id: "bsign", style: "plate", text: "联盟大厦" }));
wput("gate", L.B_GATE, E1.firewall(L.B_GATE, { id: "gate", len: 160, led: "red" }));
put("hero", L.B_HERO, E5.keycard(L.B_HERO, { id: "hero", scale: 0.6, color: "#1d93ba", text: "成员" }), 30);
put("tc", L.B_TELLER, E4.tellerCounter(L.B_TELLER, { id: "tc", scale: 0.55, sign: "前台" }));
L.B_STACK.forEach((q, i) => put(`stk${i}`, q, E5.keycard(q, { id: `stk${i}`, scale: 0.45, color: "#1d93ba", text: "成员" })));
wput("mkey", L.B_MASTER, O.key(L.B_MASTER, { id: "mkey", stand: true }));
put("staff", L.B_STAFF, O.person(L.B_STAFF, { id: "staff", role: "engineer", scale: 0.45 }));
const STRANGER = L.B_GATE && { u: L.B_GATE.u - 160, v: L.B_GATE.v + 40 };   // 闸机外的陌生人（灰）
put("strg", STRANGER, O.person(STRANGER, { id: "strg", color: "#a39d92", scale: 0.4 }));
put("camr", L.B_CAMERA, E11.snapshotCamera(L.B_CAMERA, { id: "camr", scale: 0.5, photo: "监控", sub: "" }));
put("alarm", L.B_ALARM, O.beacon(L.B_ALARM, { id: "alarm" }));
L.B_SIGNERS.forEach((q, i) => put(`sg${i}`, q, O.person(q, { id: `sg${i}`, role: "signer", scale: 0.4 }), 0, { grow: true }));
put("book", L.B_BOOK, O.ledgerBook(L.B_BOOK, { id: "book", scale: 0.5 }));
wput("rb", L.B_ROLES, E5.roleBoard(L.B_ROLES, { id: "rb", title: "攻击者控制的资源", plates: ["成员证书", "管理员证书", "根 CA 私钥", "背书组织"],
  colors: ["#1d93ba", "#1c1c1c", RED, RED], holders: [null, null, null, null], delays: ["1", "2", "3", "4"] }));
L.B_KEYS.forEach((q, i) => {
  wput(`k${i}`, q, O.key(q, { id: `k${i}` }));
  if (i < 5) wput(`kr${i}`, q, { ...O.key(q, { id: `kr${i}`, state: "attacker" }), svg: S.hid(`kr${i}`, O.key(q, { id: `kr${i}x`, state: "attacker" }).svg) }, 1);
});
wput("tm", L.B_METER, E5.thresholdMeter(L.B_METER, { id: "tm", max: 9, th: 5, thText: "5 / 9", state: "attacker" }));
ztag(L.B_TAG, "门禁大堂");

// 闸机后四个机构铭牌围成一圈（原生 SVG）
const RING = { u: L.B_GATE.u + 0, v: L.B_GATE.v };   // 只用来排序
const [rx, ry] = P(L.B_TELLER, -40, 130);
const ORGP = [[-95, 0], [0, -38], [95, 0], [0, 38]];
add(L.B_GATE, S.hid("orgs", `<ellipse cx="${rx}" cy="${ry}" rx="95" ry="38" fill="none" stroke="${TEAL}" stroke-width="3" stroke-dasharray="8 6"/>` +
  ORGP.map(([dx, dy], i) => `<g><rect x="${rx + dx - 34}" y="${ry + dy - 16}" width="68" height="30" rx="7" fill="#fffdf8" stroke="#1d93ba" stroke-width="2.5"/><text x="${rx + dx}" y="${ry + dy + 6}" text-anchor="middle" font-size="18" font-weight="800" fill="#1d93ba">Org${i + 1}</text></g>`).join("")), 120);

// 红色虚线框
const qHero = rc(L.B_HERO, "keycard"), qKey = rc(L.B_MASTER, "key");
const qRing = [rx - 135, ry - 60, rx + 135, ry + 60];
rbox("bx-hero", qHero, 10); rbox("bx-key", qKey, 10); rbox("bx-ring", qRing, 4);
rbox("bx-tc", union(rc(L.B_TELLER, "tellerCounter"), ...L.B_STACK.map((q) => rc(q, "keycard"))), 12);
rbox("bx-staff", union(qKey, rc(L.B_STAFF, "person")), 12);
rbox("bx-book", rc(L.B_BOOK, "ledgerBook"), 12);
// 九把钥匙里五把被控制：红框
rbox("bx-keys", union(...L.B_KEYS.slice(0, 5).map((q) => rc(q, "key"))), 8);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const qGate = rc(L.B_GATE, "firewall160");
const gx0 = (qGate[0] + qGate[2]) / 2;
lb("lb-r", [gx0 - 90, qGate[1] - 10], "读", "lab-cs lab-sm");
lb("lb-w", [gx0, qGate[1] - 10], "写", "lab-cs lab-sm");
lb("lb-b", [gx0 + 90, qGate[1] - 10], "出块", "lab-cs lab-sm");
lb("lb-union", [rx, ry + 70], "联盟链", "lab-ink lab-sm", "t");
lb("lb-c1", [qHero[0] - 20, (qHero[1] + qHero[3]) / 2], "一张证书", "lab-rs lab-sm", "r");
lb("lb-c2", top(L.B_MASTER, "key", 18), "管理员密钥", "lab-rs lab-sm");
lb("lb-c3", [rx, qRing[3] + 8], "几家成员共谋", "lab-rs lab-sm", "t");
lb("lb-plaza", P(L.B_PLAZA, 0, 140), "公共广场 · 谁都能进", "lab-cs lab-sm", "t");
lb("lb-dep", top(L.B_DEPOSIT, "safe", 4), "押金", "lab-ink lab-sm");
lb("lb-tower", [gx0, qGate[1] - 10], "写字楼 · 刷工牌", "lab-cs lab-sm");
lb("lb-strg", top(STRANGER, "person", -30), "陌生人", "lab-g lab-sm");
lb("lb-hot", [(rc(L.B_TELLER, "tellerCounter")[0] + rc(L.B_STAFF, "person")[2]) / 2, rc(L.B_TELLER, "tellerCounter")[1] - 24], "最值得攻击", "lab-rs");
lb("lb-tc", P(L.B_TELLER, -40, 110), "前台 · 发工牌", "lab-ink lab-sm", "t");
lb("lb-staff", P(L.B_STAFF, 0, 20), "物业 · 万能钥匙", "lab-ink lab-sm", "t");
lb("lb-break", P(L.B_SIGNERS[1], 0, -170), "比方不成立", "lab-ink");
lb("lb-camr", top(L.B_CAMERA, "snapshotCamera", 4), "监控", "lab-cs lab-sm");
lb("lb-alarm", top(L.B_ALARM, "beacon", 4), "报警", "lab-cs lab-sm");
lb("lb-book", P(L.B_BOOK, 0, 50), "业务状态", "lab-ink lab-sm", "t");
lb("lb-legal", [rc(L.B_SIGNERS[2], "person")[2] + 16, (rc(L.B_SIGNERS[2], "person")[1] + rc(L.B_SIGNERS[2], "person")[3]) / 2], "合法", "lab-g lab-sm", "l");
lb("lb-q", [rc(L.B_BOOK, "ledgerBook")[2] + 18, (rc(L.B_BOOK, "ledgerBook")[1] + rc(L.B_BOOK, "ledgerBook")[3]) / 2], "?", "lab-rs", "l");
lb("lb-ronin", top(L.B_METER, "thresholdMeter", 10), "Ronin 桥", "lab-ink lab-sm");
lb("lb-five", P(L.B_KEYS[2], 0, -46), "5 / 9 被控制", "lab-rs lab-sm");
lb("lb-small", [rc(L.B_METER, "thresholdMeter")[2] + 16, rc(L.B_METER, "thresholdMeter")[1] + 90], "集合小 → 门槛低", "lab-r", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  kw("kw-pow", "算力 · 押金", { x: 470, y: 150, size: 44 }) +
  `<div id="pow-x" class="hide" style="position:absolute;left:480px;top:184px;width:300px;height:6px;background:${RED};border-radius:3px;transform-origin:0 50%"></div>` +
  `<div id="pow-bars" class="hide" style="position:absolute;left:500px;top:262px;display:flex;gap:10px;align-items:flex-end;height:70px">` +
  [40, 62, 30, 70, 50].map((h) => `<i style="display:block;width:22px;height:${h}px;background:#b9b2a5;border-radius:4px"></i>`).join("") + `</div>` +
  kw("kw-id", "身份 · <b>治理</b>", { x: 1040, y: 150, size: 44, accent: TEAL }) +
  ck("ck0", "成员证书 → 读通道数据 · 畸形请求", { x: 1110, y: 300, w: 740, kind: "c", icon: "1" }) +
  ck("ck1", "管理员证书 → 改配置 · 批准链码", { x: 1110, y: 410, w: 740, kind: "c", icon: "2" }) +
  ck("ck2", "根 CA 私钥 → 任意身份", { x: 1110, y: 520, w: 740, kind: "r", icon: "3" }) +
  ck("ck3", "背书组织 → 任意状态", { x: 1110, y: 630, w: 740, kind: "r", icon: "4" }) +
  kw("kw-lic", "成员都是持牌机构 ≠ 安全假设", { x: 560, y: 160, size: 44 }) +
  `<div id="lic-x" class="hide" style="position:absolute;left:580px;top:196px;width:390px;height:6px;background:${RED};border-radius:3px;transform-origin:0 50%"></div>` +
  evt("ev-ronin", `Ronin 桥 · 9 个验证者里 5 个签名${gtag("公开报道")}`, { color: RED });
const css = `
  #ck0 .sb-ck-i, #ck1 .sb-ck-i { background: #1d93ba; }
  #ck0, #ck1 { border-left-color: #1d93ba; }
  #ck2, #ck3 { border-left-color: ${RED}; }
  #ck2 .sb-ck-i, #ck3 .sb-ck-i { background: ${RED}; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  swipe: LS[1] + 0.5, rw: w("读写", 1), blk: w("出块", 1), lianmeng: w("联盟链", 2),
  pow: w("密码学", 3), id: w("身份", 3), suanli: w("多数算力", 4),
  c1: w("有效证书", 5), c2: w("管理员密钥", 5), c3: w("共谋", 5),
  plaza: w("公共广场", 6), dep: w("押金", 6), tower: w("写字楼", 7), card7: w("刷工牌", 7),
  strg: w("陌生人", 8), front: w("前台", 8), staff: w("物业", 8), hot: w("最值得攻击", 8),
  camr: w("监控", 10), alarm: w("报警", 10), legal: w("合法", 11), rewrite: w("重写", 11),
  book: w("账本", 12), evil: w("作恶", 12),
  lic: w("持牌机构", 18), v9: w("9 个验证者", 19), v5: w("5 个签名", 19), ctrl: w("控制了", 19), small: w("集合小", 20),
};
// 刷卡：工牌飞到读卡器
const heroC = A.hero.center, rd = A.gate.reader;
const SW = { dx: rd[0] - heroC[0] + 6, dy: rd[1] - heroC[1] };
const t = (x) => f(x);

S.build({
  cam0: "hallA", sub: "发工牌的人，最值得攻击",
  grid: { u0: -2600, u1: 7300, v0: -5000, v1: 4800 }, box: [-1700, -2400, 7200, 3400],   // 盖住本段镜头 gateB · metaphorB · rolesB · roninB（hallA = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "许可链", d: "只有授权者才能读写或出块的区块链", at: w("许可链", 1) },
    { id: "t1", t: "链码", d: "Fabric 上的智能合约", at: w("链码", 15) },
    { id: "t2", t: "根 CA", d: "签发组织全部身份的最顶层证书机构", at: w("根 CA", 16) },
    { id: "t3", t: "背书", d: "组织对交易执行结果的签名认可", at: w("背书", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给一句准确的说法。 hallA → gateB
      cam(${t(LS[0] + 0.1)}, "gateB", 2.2, "power2.inOut");
      // ===== L1 许可链，只让获得授权的参与者，读写或出块。
      X5.fly(tl, "hero", ${t(TM.swipe)}, ${SW.dx}, ${SW.dy}, 0.7, 30); KIT.led(tl, "gate-led", ${t(TM.swipe + 0.75)}, "green");
      X1.gate(tl, "gate", ${t(TM.swipe + 0.85)}, true); X5.fly(tl, "hero", ${t(TM.swipe + 1.3)}, 0, 0, 0.6, 20);
      X1.gate(tl, "gate", ${t(LE[1] - 0.6)}, false); KIT.led(tl, "gate-led", ${t(LE[1] - 0.6)}, "red");
      pop("#lb-r", ${t(TM.rw)}); pop("#lb-w", ${t(TM.rw + 0.3)}); pop("#lb-b", ${t(TM.blk)});
      // ===== L2 由多家组织共同治理的许可链，叫联盟链。
      out("#lb-r, #lb-w, #lb-b", ${t(LS[2] - 0.2)}); fadeIn("#orgs", ${t(LS[2] + 0.2)}, 0.5); bump("#orgs", ${t(LS[2] + 1.6)}, 1.06, 1); pop("#lb-union", ${t(TM.lianmeng)});
      // ===== L3 它把谁能参与，从密码学和经济的问题，变成了身份和治理的问题。
      pop("#kw-pow", ${t(TM.pow)}); fadeIn("#pow-bars", ${t(TM.pow + 0.3)}, 0.4);
      tl.fromTo("#pow-x", { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", immediateRender: false }, ${t(TM.id - 0.3)});
      tl.to("#kw-pow", { color: "#9a958c", duration: 0.3 }, ${t(TM.id - 0.3)}); pop("#kw-id", ${t(TM.id)});
      // ===== L4 攻击者不再需要多数算力。
      tl.to("#pow-bars i", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.6, stagger: 0.08, ease: "power2.in" }, ${t(TM.suanli)});
      out("#pow-bars", ${t(TM.suanli + 1.0)}, 0.3);
      // ===== L5 一张有效证书，一把管理员密钥，或者几家成员共谋，就够了。
      out("#kw-pow, #pow-x, #kw-id, #lb-union", ${t(LS[5] - 0.2)});
      fadeIn("#bx-hero", ${t(TM.c1)}, 0.3); pop("#lb-c1", ${t(TM.c1 + 0.2)});
      fadeIn("#bx-key", ${t(TM.c2)}, 0.3); pop("#lb-c2", ${t(TM.c2 + 0.2)});
      fadeIn("#bx-ring", ${t(TM.c3)}, 0.3); pop("#lb-c3", ${t(TM.c3 + 0.2)});
      // ===== L6 打个比方，公链像公共广场，谁都能进，靠规则和押金维持秩序。 → metaphorB
      out("#bx-hero, #bx-key, #bx-ring, #lb-c1, #lb-c2, #lb-c3, #orgs", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "metaphorB", 1.6);
      pop("#lb-plaza", ${t(TM.plaza)});
      X5.fly(tl, "cr0", ${t(TM.plaza + 0.2)}, 60, 20, 1.6); X5.fly(tl, "cr3", ${t(TM.plaza + 0.4)}, -50, -20, 1.6); X5.fly(tl, "cr4", ${t(TM.plaza + 0.6)}, 40, 25, 1.6);
      pop("#lb-dep", ${t(TM.dep)}); bump("#dep", ${t(TM.dep + 0.1)}, 1.06, 1);
      // ===== L7 许可链像一栋写字楼，进门要刷工牌。
      pop("#lb-tower", ${t(TM.tower)});
      X5.fly(tl, "hero", ${t(TM.card7)}, ${SW.dx}, ${SW.dy}, 0.6, 30); KIT.led(tl, "gate-led", ${t(TM.card7 + 0.65)}, "green");
      X1.gate(tl, "gate", ${t(TM.card7 + 0.7)}, true); X5.fly(tl, "hero", ${t(TM.card7 + 1.2)}, 0, 0, 0.5, 20);
      X1.gate(tl, "gate", ${t(LE[7] - 0.3)}, false); KIT.led(tl, "gate-led", ${t(LE[7] - 0.3)}, "red");
      // ===== L8 陌生人大多进不来，可发工牌的前台，拿着万能钥匙的物业，成了最值得攻击的人。 关键画面
      out("#lb-plaza, #lb-dep, #lb-tower", ${t(LS[8] - 0.2)});
      pop("#lb-strg", ${t(TM.strg)}); X5.fly(tl, "strg", ${t(TM.strg + 0.2)}, 30, -6, 0.4); X5.fly(tl, "strg", ${t(TM.strg + 0.7)}, -10, 2, 0.4); flash("#gate-led", ${t(TM.strg + 0.4)}, 2);
      cam(${t(TM.front - 0.6)}, "frontB", 1.4);
      out("#lb-strg", ${t(TM.front - 0.6)});
      pop("#lb-tc", ${t(TM.front + 0.5)}); pop("#lb-staff", ${t(TM.staff)});
      fadeIn("#bx-tc, #bx-staff", ${t(TM.hot - 0.2)}, 0.3); pop("#lb-hot", ${t(TM.hot)});
      // ===== L9 这个比方有一处不成立。 → metaphorB
      out("#lb-tc, #lb-staff, #lb-hot, #bx-tc, #bx-staff", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "breakB", 1.4); pop("#lb-break", ${t(LS[9] + 0.9)});
      // ===== L10 写字楼失窃，可以调监控，可以报警。
      pop("#lb-camr", ${t(TM.camr)}); X11.bulb(tl, "camr", ${t(TM.camr)}, true); X11.flash(tl, "camr", ${t(TM.camr + 0.3)});
      pop("#lb-alarm", ${t(TM.alarm)}); KIT.beacon(tl, "alarm", ${t(TM.alarm)}, ${t(LE[10] - TM.alarm + 0.2)}, 0.8);
      // ===== L11 联盟链里，多数成员可以合法地重写业务状态。
      out("#lb-break", ${t(LS[11] - 0.2)});
      grow("sg0", ${t(LS[11] + 0.3)}); grow("sg1", ${t(LS[11] + 0.5)}); grow("sg2", ${t(LS[11] + 0.7)});
      pop("#lb-book", ${t(LS[11] + 1.0)}); pop("#lb-legal", ${t(TM.legal)}); bump("#book", ${t(TM.rewrite)}, 1.08, 2); bump("#sg0, #sg1, #sg2", ${t(TM.rewrite + 1.2)}, 1.08, 1); flash("#lb-legal", ${t(LE[11] - 1.4)}, 2);
      // ===== L12 账本本身，看不出这是作恶。
      X11.bulb(tl, "camr", ${t(LS[12])}, false);
      tl.to("#camr, #alarm", { opacity: 0.4, duration: 0.4 }, ${t(LS[12])}); out("#lb-camr, #lb-alarm", ${t(LS[12])});
      fadeIn("#bx-book", ${t(TM.book)}, 0.3); pop("#lb-q", ${t(TM.evil)});
      // ===== L13 按攻击者控制的资源，排一排入口。 → rolesL
      out("#lb-book, #lb-legal, #lb-q, #bx-book", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "rolesL", 1.5);
      [0, 1, 2, 3].forEach((i) => bump("#rb-card-" + i, ${t(LS[13] + 1.4)} + i * 0.2, 1.12, 1));
      // ===== L14 一张普通成员证书，能读通道数据，发送畸形请求。
      pop("#ck0", ${t(LS[14] + 0.2)}); bump("#rb-card-0", ${t(LS[14] + 0.3)}, 1.15, 1);
      // ===== L15 组织管理员的证书，能改本组织的配置，批准链码。
      pop("#ck1", ${t(LS[15] + 0.2)}); bump("#rb-card-1", ${t(LS[15] + 0.3)}, 1.15, 1);
      // ===== L16 根 CA 的私钥，能签发任意身份。
      pop("#ck2", ${t(LS[16] + 0.2)}); bump("#rb-card-2", ${t(LS[16] + 0.3)}, 1.15, 1);
      // ===== L17 足够多的背书组织，能写入符合策略的任意状态。
      pop("#ck3", ${t(LS[17] + 0.2)}); bump("#rb-card-3", ${t(LS[17] + 0.3)}, 1.15, 1);
      // ===== L18 所以不要把成员都是持牌机构，当成安全假设。 → roninB
      out("#ck0, #ck1, #ck2, #ck3", ${t(LS[18] - 0.2)});
      cam(${t(LS[18])}, "roninB", 1.5);
      pop("#kw-lic", ${t(TM.lic - 0.2)});
      tl.fromTo("#lic-x", { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${t(TM.lic + 0.8)});
      // ===== L19 Ronin 桥有 9 个验证者，5 个签名就能放行，攻击者控制了验证者，提走了资金。
      out("#kw-lic, #lic-x", ${t(LS[19] - 0.2)});
      pop("#ev-ronin", ${t(LS[19] + 0.2)}); pop("#lb-ronin", ${t(LS[19] + 0.4)});
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => bump("#k" + i, ${t(TM.v9)} + i * 0.08, 1.15, 1));
      [0, 1, 2, 3, 4].forEach((i) => { fadeIn("#kr" + i, ${t(TM.v5)} + i * 0.3, 0.25); X5.fill(tl, "tm", ${t(TM.v5)} + i * 0.3, i + 1, 0.25); });
      fadeIn("#bx-keys", ${t(TM.ctrl)}, 0.3); pop("#lb-five", ${t(TM.ctrl + 0.2)}); flash("#tm-lamp", ${t(TM.ctrl + 0.4)}, 2);
      // ===== L20 许可的集合小，攻破的门槛也低。
      pop("#lb-small", ${t(TM.small)});
`,
});
