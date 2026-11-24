// ep30/seg4「④ 治理与密钥」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.detC（BRIEF）。
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.cloudD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E2, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- helpers
const RED = "#e0453a", GRN = "#1f9d55", TEAL = "#2aa3c9";
/** screen-px offset (X, Y) → world offset, same as layout.mjs zone() */
const off = (o, X, Y, extra = {}) => ({ ...o, u: Math.round(o.u + 0.8192 * X - 1.1472 * Y), v: Math.round(o.v + 0.5736 * X + 1.6383 * Y), ...extra });
/** put an object that ignores opts.scale: wrap around its ground point, rescale anchors; hide → wrapped in S.hid(key+"-h") */
const putW = (key, o, r, { hide = false, grow = false, dy = 0, lift = 0 } = {}) => {
  const k = o.scale ?? 1, [gx, gy] = at(o);
  const wrap = (s) => {
    const g = `<g transform="translate(${gx},${gy - lift}) scale(${k}) translate(${-gx},${-gy})">${s}</g>`;
    return hide ? S.hid(key + "-h", g) : g;
  };
  put(key, o, r, dy, { wrap, grow });
  const sc = (p) => [gx + (p[0] - gx) * k, gy - lift + (p[1] - gy) * k];
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = sc(p); }
};
/** red dashed box around a layout rect kind, hidden */
const rbox = (id, o, kind, pad = 12, dy = 400) => {
  const [x0, y0, x1, y1] = L.rect(o, kind);
  add(o, S.hid(id, `<rect x="${x0 - pad}" y="${y0 - pad}" width="${x1 - x0 + 2 * pad}" height="${y1 - y0 + 2 * pad}" rx="12" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="12 8"/>`), dy);
};
/** native-SVG floor zone tag (drawn on the ground plane) */
const zoneTag = (o, text) => {
  const [X, Y] = at(o);
  add(o, `<g transform="matrix(0.819 -0.287 0.574 0.410 ${X} ${Y})"><rect x="-130" y="-38" width="260" height="76" rx="14" fill="#fffdf8" stroke="${TEAL}" stroke-width="4"/>` +
    `<text x="0" y="14" text-anchor="middle" font-size="40" font-weight="900" fill="${TEAL}">${text}</text></g>`, -400);
};

// ---------------------------------------------------------------- C 确定性角（上段结尾 detC，开场可见）
putW("dclk", L.C_CLOCK, O.clock(L.C_CLOCK, { id: "dclk" }));
putW("ddie", L.C_DIE, E2.die(L.C_DIE, { id: "ddie" }));
L.C_DETSETS.forEach((q, i) => putW("dset" + i, q, E2.sigPaper(q, { id: "dset" + i, title: "读写集" })));

// ---------------------------------------------------------------- D 治理层
zoneTag(L.D_TAG, "治理层");
// 根 CA 角
putW("hsm", L.D_HSM, O.hsm(L.D_HSM, { id: "hsm" }));
putW("onl", L.D_ONLINE, O.rack(L.D_ONLINE, { id: "onl", tag: "在线" }));
{
  const [hx, hy] = at(L.D_HSM), [rx, ry] = at(L.D_ONLINE);
  const P1 = [hx + 60, hy - 20], P2 = [rx - 50, ry - 40], M = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];
  const seg = (a, b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#1c1c1c" stroke-width="5" stroke-linecap="round"/>`;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  add(L.D_HSM, `<g id="cable">${seg(P1, P2)}</g>`, 60);
  add(L.D_HSM, S.hid("cableCut", seg(P1, lerp(P1, P2, 0.38)) + seg(lerp(P1, P2, 0.62), P2) +
    `<path d="M${M[0] - 12},${M[1] - 12} l24,24 M${M[0] + 12},${M[1] - 12} l-24,24" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>`), 60);
}
const SPEW = [0, 1, 2].map((i) => off(L.D_ONLINE, -40 + i * 40, 40, { scale: 0.5 }));
SPEW.forEach((q, i) => put("spew" + i, q, E5.keycard(q, { id: "spew" + i, state: "attacker", scale: 0.5 }), 200, { wrap: (s) => S.hid("spew" + i + "-h", s) }));
L.D_ICA.forEach((q, i) => putW("ica" + i, q, O.seal(q, { id: "ica" + i, markText: "签发" })));
const ISSUED = L.D_ICA.map((q) => off(q, 115, -20, { scale: 0.5 }));
ISSUED.forEach((q, i) => put("iss" + i, q, E5.keycard(q, { id: "iss" + i, role: "pauser", text: "成员", scale: 0.5 }), 0, { wrap: (s) => S.hid("iss" + i + "-h", s) }));
put("cad0", L.D_CADOCS[0], O.doc(L.D_CADOCS[0], { id: "cad0", w: 200, h: 110, title: "身份 CA" }));
put("cad1", L.D_CADOCS[1], O.doc(L.D_CADOCS[1], { id: "cad1", w: 200, h: 110, title: "TLS CA" }));
{
  const [X, Y] = at(L.D_WALL);
  // teal partition panel standing on the ground (runs along v), grows from the floor
  add(L.D_WALL, `<g id="wall" data-ox="${X}" data-oy="${Y}"><polygon points="${X - 10},${Y - 30} ${X + 12},${Y + 12} ${X + 12},${Y - 150} ${X - 10},${Y - 190}" fill="${TEAL}" opacity="0.85" stroke="#1d93ba" stroke-width="3"/></g>`, 30);
  S.grow("wall");
}
// 管理员角
putW("vendor", L.D_VENDOR, O.desk(L.D_VENDOR, { id: "vendor" }));
put("vstaff", L.D_VSTAFF, O.person(L.D_VSTAFF, { id: "vstaff", role: "engineer", scale: 0.45 }));
put("vstaffR", L.D_VSTAFF, O.person(L.D_VSTAFF, { id: "vstaffR", role: "attacker", scale: 0.45 }), 1, { wrap: (s) => S.hid("vstaffR-h", s) });
const VCARD = off(L.D_VSTAFF, 45, -5, { scale: 0.45, z: 50 });
put("vcard", VCARD, E5.keycard(VCARD, { id: "vcard", color: "#8a8a8a", text: "运维", scale: 0.45, z: 50 }), 2, { wrap: (s) => S.hid("vcard-h", s) });
L.D_ADMINCARDS.forEach((q, i) => {
  put("ac" + i, q, E5.keycard(q, { id: "ac" + i, role: "pauser", text: "Org" + (i + 1), scale: 0.5 }));
  put("acR" + i, q, E5.keycard(q, { id: "acR" + i, state: "attacker", scale: 0.5 }), 1, { wrap: (s) => S.hid("acR" + i + "-h", s) });
});
L.D_HOMES.forEach((q, i) => putW("home" + i, q, O.rack(q, { id: "home" + i, tag: "Org" + (i + 1) })));
// 配置 / 退出角
put("cfg", L.D_CONFIG, O.doc(L.D_CONFIG, { id: "cfg", standing: true, title: "通道配置", lines: ["成员名单", "背书策略"] }));
L.D_SEALS.forEach((q, i) => putW("cs" + i, q, O.seal(q, { id: "cs" + i, markText: "Org" + (i + 1) }), { grow: true }));
put("trail", L.D_TRAIL, O.ledgerBook(L.D_TRAIL, { id: "trail", scale: 0.45 }));
put("rev", L.D_REVOKED, E5.keycard(L.D_REVOKED, { id: "rev", text: "成员", scale: 0.5 }));
{
  const c = A.rev.face ?? A.rev.center;
  add(L.D_REVOKED, S.hid("revX", `<path d="M${c[0] - 26},${c[1] - 26} l52,52 M${c[0] + 26},${c[1] - 26} l-52,52" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>`), 20);
}
put("shared", L.D_SHARED, O.ledgerBook(L.D_SHARED, { id: "shared", scale: 0.45 }));
rbox("sharedBox", L.D_SHARED, "ledgerBook", 8);
putW("hour", L.D_HOUR, O.hourglass(L.D_HOUR, { id: "hour" }));
// 共谋角
L.D_COLLUDERS.forEach((q, i) => put("col" + i, q, O.person(q, { id: "col" + i, role: "signer", scale: 0.4 })));
put("fake", L.D_FAKE, O.ledgerBook(L.D_FAKE, { id: "fake", scale: 0.45 }));
rbox("fakeBox", L.D_FAKE, "ledgerBook", 8);
put("dig", L.D_DIGEST, O.doc(L.D_DIGEST, { id: "dig", w: 200, h: 110, title: "账本摘要" }), 300);
putW("pub", L.D_PUBCHAIN, O.chain(L.D_PUBCHAIN, { id: "pub", n: 3, labels: ["#1", "#2", "#3"] }));
// 云角：一只桶里塞满机柜 → 拆成三只
L.D_BUCKETS.forEach((q, i) => putW("bk" + i, q, O.bucket(q, { id: "bk" + i }), { grow: i > 0 }));
const MINI = [-26, 0, 26].map((X) => off(L.D_BUCKETS[0], X, -4, { scale: 0.2 }));
MINI.forEach((q, i) => putW("mr" + i, q, O.rack(q, { id: "mr" + i }), { lift: 70, dy: 20 + i }));
rbox("oneBox", off(L.D_BUCKETS[0], 0, 0, { scale: 0.75 }), "bucket", 10);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const G0 = (k) => A[k].ground, T0 = (k) => A[k].top;
lb("lb-hsm", up(T0("hsm"), 10), "根 CA", "lab-cs");
lb("lb-off", up(T0("hsm"), 10), "根 CA · 离线", "lab-gs");
lb("lb-onl", up(T0("onl"), 10), "在线服务器", "lab-ink");
lb("lb-any", up(T0("onl"), 10), "签发任意身份", "lab-rs");
lb("lb-ica", up(T0("ica1"), 12), "中间 CA · 日常签发", "lab-cs lab-sm");
lb("lb-kms", [G0("hsm")[0] + 60, G0("hsm")[1] + 14], "节点 · 管理员私钥 → HSM / KMS", "lab-cs lab-sm", "t");
lb("lb-sep", up(at(L.D_WALL), 200), "分开", "lab-cs lab-sm");
lb("lb-vendor", up(T0("vendor"), 10), "技术服务商", "lab-ink");
lb("lb-adm", up(T0("ac1"), 14), "管理员证书 ×3", "lab-cs lab-sm");
lb("lb-lost", up(T0("ac1"), 14), `好几家同时失守${gtag("解读")}`, "lab-rs lab-sm");
lb("lb-self", up(T0("home1"), 12), "各家自持密钥", "lab-gs lab-sm");
lb("lb-limit", [G0("vstaff")[0], G0("vstaff")[1] + 10], "受限运维权限", "lab-ink lab-sm", "t");
lb("lb-multi", up(T0("cfg"), 10), "多家签名", "lab-cs lab-sm");
lb("lb-trail", up(T0("trail"), 8), "变更留痕 +1", "lab-cs lab-sm");
lb("lb-rev", up(T0("rev"), 10), "吊销", "lab-rs lab-sm");
lb("lb-pol", [G0("cfg")[0], G0("cfg")[1] + 8], "策略已改", "lab-cs lab-sm", "t");
lb("lb-shared", up(T0("shared"), 18), "已分发数据 · 评估", "lab-r lab-sm");
lb("lb-hour", [G0("hour")[0], G0("hour")[1] + 10], "不会自动过期", "lab-ink lab-sm", "t");
lb("lb-drill", up(T0("hour"), 10), "演练记录 ✓", "lab-gs lab-sm");
lb("lb-col", up(T0("col1"), 10), "达到背书门槛", "lab-ink lab-sm");
lb("lb-fake", [G0("fake")[0], G0("fake")[1] + 14], "虚假状态", "lab-rs", "t");
lb("lb-pub", up(T0("pub"), 10), "公链", "lab-cs");
lb("lb-hist", up(T0("pub"), 10), "历史没被改写 ✓", "lab-gs");
lb("lb-true", [G0("fake")[0], G0("fake")[1] + 14], "数据为真 ✕", "lab-rs", "t");
lb("lb-one", up(T0("bk0"), 70), "单点 · 同一个云账户", "lab-rs lab-sm");
["账户 1 · 地域 A", "账户 2 · 地域 B", "运营方 C"].forEach((s, i) => i === 1 ? lb("lb-bk1", up(T0("bk1"), 10), s, "lab-cs lab-sm") : lb("lb-bk" + i, [G0("bk" + i)[0], G0("bk" + i)[1] + 12], s, "lab-cs lab-sm", "t"));

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev-fab", `来源 · Fabric 文档`);
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const d = (a, b) => [Math.round(b[0] - a[0]), Math.round(b[1] - a[1])];
const FLY = {
  ac: L.D_ADMINCARDS.map((q, i) => d(at(q), [at(L.D_HOMES[i])[0] + 34, at(L.D_HOMES[i])[1] + 6])),
  dig: d(at(L.D_DIGEST), [A.pub.top[0] + 40, A.pub.top[1] - 10]),
  mr: MINI.map((q, i) => d(at(q), at(L.D_BUCKETS[i])).map((v) => Math.round(v / 0.2))),   // mr* live inside a 0.2 wrap: local units
};
const TM = {
  atk: w("攻破", 2), off: w("离线", 3), ica: w("中间 CA", 3), sep: w("分开", 5), lost: w("失守", 8), self: w("自持", 9), lim: w("受限", 9),
  sign: w("签名", 11), trail: w("留痕", 11), rev: w("吊销证书", 12), pol: w("修改策略", 12), eval: w("评估", 12), exp: w("自动过期", 13),
  drill: w("演练", 14), fake: w("虚假", 16), anchor: w("外部锚定", 17), pubw: w("公链", 17), hist: w("历史", 18), notTrue: w("不能证明", 18),
  single: w("单点", 19), split: w("分账户", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "detC", sub: "最大的风险，常在流程",
  grid: { u0: 7400, u1: 16000, v0: -3700, v1: 5000 }, box: [7000, -4700, 5900, 3200],   // 盖住本段镜头 caD · adminD · configD · colludeD · cloudD（detC = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "中间 CA", d: "由根 CA 授权、负责日常签发的 CA", at: w("中间 CA", 3) },
    { id: "t1", t: "HSM", d: "专门保护私钥的硬件设备", at: w("HSM", 4) },
    { id: "t2", t: "吊销", d: "提前宣布某张证书作废", at: w("吊销", 12) },
    { id: "t3", t: "外部锚定", d: "把账本摘要存到外部以证明历史未变", at: w("外部锚定", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 许可链最大的风险，常常在流程里。（detC → caD）
      cam(${t(LS[0] + 0.2)}, "caD", 2.0);
      // ===== L1 第一处，根 CA。
      pop("#lb-hsm", ${t(LS[1] + 0.2)}, 0.25); bump("#hsm", ${t(LS[1] + 0.4)}, 1.08, 2);
      // ===== L2 根私钥放在在线服务器上，一旦被攻破，攻击者就能签发任意身份。
      pop("#lb-onl", ${t(LS[2] + 0.2)}, 0.25);
      KIT.broke(tl, "onl", ${t(TM.atk)}, { badge: true, ghost: 0.5 });
      out("#lb-onl", ${t(TM.atk + 0.6)}, 0.2); pop("#lb-any", ${t(TM.atk + 0.8)}, 0.25);
      [0, 1, 2].forEach((i) => { fadeIn("#spew" + i + "-h", ${t(TM.atk + 0.9)} + i * 0.25, 0.2); X5.fly(tl, "spew" + i, ${t(TM.atk + 0.9)} + i * 0.25, (i - 1) * 70, -150 - i * 25, 0.8, 30); });
      // ===== L3 控制是根 CA 离线，私钥放进 HSM，日常签发交给中间 CA。
      out("#lb-any, #spew0-h, #spew1-h, #spew2-h", ${t(LS[3] - 0.2)}, 0.3);
      out("#cable", ${t(TM.off)}, 0.15); fadeIn("#cableCut", ${t(TM.off)}, 0.15);
      out("#lb-hsm", ${t(TM.off)}, 0.15); pop("#lb-off", ${t(TM.off + 0.15)}, 0.25);
      bump("#ica0", ${t(TM.ica)}, 1.1, 1); bump("#ica1", ${t(TM.ica + 0.3)}, 1.1, 1);
      fadeIn("#iss0-h", ${t(TM.ica + 0.4)}, 0.3); fadeIn("#iss1-h", ${t(TM.ica + 0.7)}, 0.3); pop("#lb-ica", ${t(TM.ica + 0.9)}, 0.25);
      // ===== L4 节点和管理员的私钥，也放进 HSM 或 KMS。
      pop("#lb-kms", ${t(LS[4] + 0.6)}, 0.3);
      // ===== L5 身份 CA 和 TLS CA，也要分开。
      grow("wall", ${t(TM.sep - 0.6)}, 0.6); pop("#lb-sep", ${t(TM.sep)}, 0.25);
      // ===== L6 第二处，管理员集中。（caD → adminD）
      out("#lb-off, #lb-onl, #lb-ica, #lb-kms, #lb-sep", ${t(LS[6] - 0.2)}, 0.2);
      cam(${t(LS[6])}, "adminD", 1.4);
      // ===== L7 一家技术服务商，替好几家组织拿着管理员证书。
      pop("#lb-vendor", ${t(LS[7] + 0.3)}, 0.25); pop("#lb-adm", ${t(LS[7] + 2.4)}, 0.25);
      [0, 1, 2].forEach((i) => bump("#ac" + i, ${t(LS[7] + 2.4)} + i * 0.2, 1.12, 1));
      // ===== L8 它一出事，好几家就同时失守。
      fadeIn("#vstaffR-h", ${t(LS[8] + 0.3)}, 0.3); out("#vstaff", ${t(LS[8] + 0.3)}, 0.3);
      out("#lb-adm", ${t(TM.lost - 0.3)}, 0.15);
      [0, 1, 2].forEach((i) => fadeIn("#acR" + i + "-h", ${t(TM.lost - 0.2)}, 0.25));
      pop("#lb-lost", ${t(TM.lost)}, 0.25);
      // ===== L9 控制是各家自持密钥，服务商只拿受限的运维权限。
      out("#lb-lost", ${t(LS[9] - 0.2)}, 0.2);
      [0, 1, 2].forEach((i) => out("#acR" + i + "-h", ${t(LS[9])}, 0.3));
      fadeIn("#vstaff", ${t(LS[9])}, 0.3); out("#vstaffR-h", ${t(LS[9])}, 0.3);
      ${JSON.stringify(FLY.ac)}.forEach((p, i) => X5.fly(tl, "ac" + i, ${t(TM.self)} + i * 0.2, p[0], p[1], 0.9, 40));
      pop("#lb-self", ${t(TM.self + 1.2)}, 0.25);
      fadeIn("#vcard-h", ${t(TM.lim)}, 0.3); pop("#lb-limit", ${t(TM.lim + 0.2)}, 0.25);
      // ===== L10 第三处，配置更新和成员退出。（adminD → configD）
      out("#lb-vendor, #lb-self, #lb-limit", ${t(LS[10] - 0.2)}, 0.2);
      cam(${t(LS[10])}, "configD", 1.4);
      // ===== L11 改通道策略或成员名单，要多家组织签名，变更留痕。
      [0, 1, 2].forEach((i) => grow("cs" + i, ${t(TM.sign - 0.4)} + i * 0.3, 0.4));
      pop("#lb-multi", ${t(TM.sign + 0.5)}, 0.25);
      pop("#lb-trail", ${t(TM.trail)}, 0.25); bump("#trail", ${t(TM.trail)}, 1.06, 1);
      // ===== L12 成员退出时，要吊销证书，修改策略，再评估它手里已经拿到的数据。
      out("#lb-multi", ${t(LS[12])}, 0.2);
      fadeIn("#revX", ${t(TM.rev)}, 0.2); pop("#lb-rev", ${t(TM.rev + 0.1)}, 0.25);
      pop("#lb-pol", ${t(TM.pol)}, 0.25); bump("#cfg", ${t(TM.pol)}, 1.06, 1);
      fadeIn("#sharedBox", ${t(TM.eval)}, 0.3); pop("#lb-shared", ${t(TM.eval + 0.2)}, 0.25);
      // ===== L13 Fabric 文档提醒，成员身份不会自动过期，只能吊销。
      pop("#ev-fab", ${t(LS[13] + 0.1)}, 0.3);
      pop("#lb-hour", ${t(TM.exp)}, 0.25); bump("#hour", ${t(TM.exp)}, 1.06, 1);
      // ===== L14 所以吊销流程，要提前演练。
      out("#ev-fab", ${t(LS[14] + 0.6)}, 0.3);
      pop("#lb-drill", ${t(TM.drill)}, 0.25);
      // ===== L15 第四处，成员共谋。（configD → colludeD）
      out("#lb-trail, #lb-rev, #lb-pol, #lb-shared, #lb-hour, #lb-drill", ${t(LS[15] - 0.2)}, 0.2);
      cam(${t(LS[15])}, "colludeD", 1.4);
      // ===== L16 达到背书门槛的几家成员，可以写入虚假的业务状态。
      pop("#lb-col", ${t(LS[16] + 0.4)}, 0.25); [0, 1, 2].forEach((i) => bump("#col" + i, ${t(LS[16] + 0.4)} + i * 0.15, 1.08, 1));
      fadeIn("#fakeBox", ${t(TM.fake)}, 0.3); pop("#lb-fake", ${t(TM.fake + 0.2)}, 0.25);
      // ===== L17 对策是外部锚定，定期把账本摘要写到公链，或者交给第三方保存。
      out("#lb-col", ${t(LS[17])}, 0.2);
      pop("#lb-pub", ${t(TM.anchor)}, 0.25); bump("#dig", ${t(TM.anchor + 0.3)}, 1.08, 1);
      X5.fly(tl, "dig", ${t(TM.pubw - 0.3)}, ${FLY.dig[0]}, ${FLY.dig[1]}, 1.0, 60);
      out("#dig", ${t(TM.pubw + 0.8)}, 0.3); bump("#pub", ${t(TM.pubw + 0.9)}, 1.06, 1);
      // ===== L18 它能证明历史没被改写，却不能证明数据本身是真的。
      out("#lb-pub", ${t(TM.hist - 0.2)}, 0.15); pop("#lb-hist", ${t(TM.hist)}, 0.25);
      out("#lb-fake", ${t(TM.notTrue - 0.15)}, 0.15); pop("#lb-true", ${t(TM.notTrue)}, 0.25);
      // ===== L19 最后，所有节点放在同一个云账户里，也是单点，要分账户，分地域，分运营方。（colludeD → cloudD，静止收尾）
      out("#lb-hist, #lb-true, #fakeBox", ${t(LS[19] - 0.2)}, 0.2);
      cam(${t(LS[19])}, "cloudD", 1.4);
      fadeIn("#oneBox", ${t(TM.single)}, 0.3); pop("#lb-one", ${t(TM.single + 0.2)}, 0.25);
      out("#oneBox, #lb-one", ${t(TM.split - 0.3)}, 0.2);
      grow("bk1", ${t(TM.split - 0.2)}, 0.4); grow("bk2", ${t(TM.split)}, 0.4);
      ${JSON.stringify(FLY.mr)}.forEach((p, i) => X5.fly(tl, "mr" + i, ${t(TM.split + 0.3)} + i * 0.15, p[0], p[1], 0.8, 50));
      [0, 1, 2].forEach((i) => pop("#lb-bk" + i, ${t(TM.split + 1.2)} + i * 0.4, 0.25));
`,
});
