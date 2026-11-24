// ep30/seg6「⑥ 三个问题」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.legacyE（BRIEF）。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide (series finale: end card, no next episode)

// 段内镜头：问询台偏右，左侧留一栏给勾选卡
const deskR = L.fit(L.ZONE_RECTS.F, [640, 270, 1840, 860]);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, deskR }, ext: [E1, E4, E5, E9, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const wput = (key, o, r, k, dy = 0, opts = {}) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...opts, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) {
    const p = A[key][n];
    if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  }
};
const K = (o) => o.scale;

// ---------------------------------------------------------------- 参观路线（地面青蓝虚线，最底层）
{
  const [x0, y0] = at(L.routeAt(L.ROUTE_U[0])), [x1, y1] = at(L.routeAt(L.ROUTE_U[1]));
  add({ u: 60000, v: -60000 }, `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="#2aa3c9" stroke-width="10" stroke-dasharray="44 36" stroke-linecap="round" opacity="0.45" fill="none"/>`);
}

// ---------------------------------------------------------------- 世界物件：A–E 代表物件（全景用；L9–L10 屏幕层标记它们）
// A 记账大厅
L.A_RACKS.forEach((q, i) => wput(`ar${i}`, q, O.rack(q, { id: `ar${i}`, tag: `Org${i + 1}` }), K(q)));
L.A_LEDGERS.forEach((q, i) => put(`al${i}`, q, O.ledgerBook(q, { id: `al${i}`, scale: q.scale })));
wput("achain", L.A_CHAIN, O.chain(L.A_CHAIN, { id: "achain", n: 3, labels: ["", "", "区块"] }), K(L.A_CHAIN));
wput("agate", L.A_GATE, E1.firewall(L.A_GATE, { id: "agate", len: 160, led: "green" }), K(L.A_GATE));
put("aatk", L.A_ATTACKER, O.person(L.A_ATTACKER, { id: "aatk", role: "attacker", scale: L.A_ATTACKER.scale }));
// B 门禁大堂
wput("bgate", L.B_GATE, E1.firewall(L.B_GATE, { id: "bgate", len: 160, led: "green" }), K(L.B_GATE));
put("btell", L.B_TELLER, E4.tellerCounter(L.B_TELLER, { id: "btell", scale: L.B_TELLER.scale }));
put("bsign", L.B_SIGN, E1.signBoard(L.B_SIGN, { id: "bsign", style: "plate", text: "联盟大厦" }));
L.B_CROWD.forEach((q, i) => put(`bc${i}`, q, O.person(q, { id: `bc${i}`, scale: q.scale })));
wput("bdep", L.B_DEPOSIT, O.safe(L.B_DEPOSIT, { id: "bdep" }), K(L.B_DEPOSIT));
// C Fabric 流水线
L.C_ENDORSERS.forEach((q, i) => wput(`ce${i}`, q, O.rack(q, { id: `ce${i}`, tag: `Org${i + 1}` }), K(q)));
wput("csort", L.C_SORTER, E1.sorter(L.C_SORTER, { id: "csort", blockLabel: "区块" }), K(L.C_SORTER));
wput("cgate", L.C_GATE, O.checkpoint(L.C_GATE, { id: "cgate", n: "③" }), K(L.C_GATE));
put("cstate", L.C_STATE, O.ledgerBook(L.C_STATE, { id: "cstate", scale: L.C_STATE.scale }));
L.C_RAFT.forEach((q, i) => wput(`cr${i}`, q, O.rack(q, { id: `cr${i}` }), K(q)));
// D 治理层（L10 的三处）
wput("dhsm", L.D_HSM, O.hsm(L.D_HSM, { id: "dhsm" }), K(L.D_HSM));
wput("donl", L.D_ONLINE, O.rack(L.D_ONLINE, { id: "donl" }), K(L.D_ONLINE));
L.D_ICA.forEach((q, i) => wput(`dica${i}`, q, O.seal(q, { id: `dica${i}` }), K(q)));
wput("dvend", L.D_VENDOR, O.desk(L.D_VENDOR, { id: "dvend" }), K(L.D_VENDOR));
put("dvstaff", L.D_VSTAFF, O.person(L.D_VSTAFF, { id: "dvstaff", role: "engineer", scale: L.D_VSTAFF.scale }));
L.D_ADMINCARDS.forEach((q, i) => put(`dadm${i}`, q, E5.keycard(q, { id: `dadm${i}`, scale: q.scale, color: "#1c1c1c", text: "ADMIN" })));
L.D_HOMES.forEach((q, i) => wput(`dhome${i}`, q, O.rack(q, { id: `dhome${i}`, tag: `Org${i + 1}` }), K(q)));
put("dconf", L.D_CONFIG, O.doc(L.D_CONFIG, { id: "dconf", standing: true, title: "通道配置", lines: [] }));
L.D_COLLUDERS.forEach((q, i) => put(`dcol${i}`, q, O.person(q, { id: `dcol${i}`, role: "signer", scale: q.scale })));
put("dfake", L.D_FAKE, O.ledgerBook(L.D_FAKE, { id: "dfake", scale: L.D_FAKE.scale }));
L.D_BUCKETS.forEach((q, i) => wput(`dbk${i}`, q, O.bucket(q, { id: `dbk${i}` }), K(q)));
// E 两座别馆
L.E_CORDA.forEach((q, i) => wput(`ec${i}`, q, O.rack(q, { id: `ec${i}` }), K(q)));
put("enot", L.E_NOTARY[0], E4.tellerCounter(L.E_NOTARY[0], { id: "enot", scale: L.E_NOTARY[0].scale }));
put("erota", L.E_ROTA, E9.rotaWheel(L.E_ROTA, { id: "erota", scale: L.E_ROTA.scale, n: 4 }));
// E 退役角（= 上一段结尾 legacyE 的画面）
L.E_LEGACY.forEach((q, i) => wput(`eleg${i}`, q, O.rack(q, { id: `eleg${i}`, tag: ["GoQuorum", "Tessera"][i], leds: ["off", "off", "off"] }), K(q)));
put("esign", L.E_SIGN, E1.signBoard(L.E_SIGN, { id: "esign", style: "plate", text: "已归档 · 已弃用" }));
put("ewr", L.E_WRENCH, E22.wrench(L.E_WRENCH, { id: "ewr", scale: L.E_WRENCH.scale }));
{
  const [mx, my] = at(L.E_MIGRATE);
  add(L.E_MIGRATE, `<g opacity="0.9"><path d="M${mx - 70} ${my + 25}L${mx + 50} ${my - 17}" stroke="#2aa3c9" stroke-width="8" stroke-linecap="round"/><path d="M${mx + 72} ${my - 25}L${mx + 34} ${my - 30}L${mx + 46} ${my - 4}Z" fill="#2aa3c9"/></g>`);
}

// F 问询台（本段主场）
wput("fdesk", L.F_DESK, O.desk(L.F_DESK, { id: "fdesk" }), K(L.F_DESK));
put("fassume", L.F_ASSUME, O.doc(L.F_ASSUME, { id: "fassume", standing: true, title: "安全假设", lines: ["依赖哪几家组织"], stampText: "演练" }));
put("fhero", L.F_HERO, E5.keycard(L.F_HERO, { id: "fhero", scale: L.F_HERO.scale, color: "#1d93ba", text: "成员" }), 0, { grow: true });
put("fuser", L.F_USER, O.person(L.F_USER, { id: "fuser", scale: L.F_USER.scale }), 0, { grow: true });
wput("fphone", L.F_PHONE, O.phone(L.F_PHONE, { id: "fphone" }), K(L.F_PHONE), 0, { grow: true });
L.F_QS.forEach((q, i) => put(`fq${i}`, q, E1.signBoard(q, { id: `fq${i}`, style: "plate", text: ["谁能写", "谁能看", "谁能改规则"][i] }), 0, { grow: true }));
put("ferase", L.F_ERASE, O.doc(L.F_ERASE, { id: "ferase", title: "删除 · 更正", lines: ["怎么删除", "怎么更正"] }), 0, { grow: true });
wput("fanchor", L.F_ANCHOR, O.chain(L.F_ANCHOR, { id: "fanchor", n: 3, labels: ["", "", ""] }), K(L.F_ANCHOR), 0, { grow: true });
put("faudit", L.F_AUDIT, O.doc(L.F_AUDIT, { id: "faudit", title: "审计报告", lines: ["第三方", "可核对"] }), 0, { grow: true });
put("fsign", L.F_SIGN, E1.signBoard(L.F_SIGN, { id: "fsign", style: "plate", text: "问询台" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-legacy", up(A.eleg0.top, 10), "没人维护的软件", "lab-rs lab-sm");
lb("lb-dep", up(A.fassume.top, 6), "依赖：Org1 · Org3", "lab-cs lab-sm");
lb("lb-trust", [A.fassume.center[0] - 60, A.fassume.center[1]], "<s>成员可信</s>", "lab-rs lab-sm", "r");
lb("lb-phone", up(A.fphone.top, 8), "上链了，不可篡改", "lab-ink lab-sm");
lb("lb-erase", up(A.ferase.top, 4), "删除 · 更正", "lab-cs lab-sm");
lb("lb-anchor", up(A.fanchor.top, 6), "公链锚定 ✓", "lab-g lab-sm");
lb("lb-audit", [A.faudit.ground[0], A.faudit.ground[1] + 50], "审计报告 ✓", "lab-g lab-sm", "t");
lb("lb-rule", A.fq1.ground, `规则写对了吗？ ${gtag("解读", "font-size:20px")}`, "lab-ink lab-sm", "t");
lb("lb-hero", up(A.fhero.top, 6), "成员", "lab-cs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
// 全景（k 0.086）里的标记一律放屏幕层：门禁绿圈 + 门里四处红色虚线圈
const sw = (p) => S.scr("wide", p).map(Math.round);
const MID = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const RINGS = [
  { id: "rg-ca", p: sw(A.dhsm.center), r: 30, txt: "发证书的人", side: "l" },
  { id: "rg-adm", p: sw(A.dadm1.center), r: 26, txt: "管理员密钥", side: "t" },
  { id: "rg-col", p: sw(MID(A.dcol0.center, A.dcol2.center)), r: 30, txt: "达到门槛的成员", side: "b" },
  { id: "rg-leg", p: sw(MID(A.eleg0.center, A.eleg1.center)), r: 32, txt: "没人维护的软件", side: "t" },
];
const GATE = { p: sw(A.agate.center), r: 34 };
console.log("wide screen points:", JSON.stringify({ gate: GATE.p, rings: RINGS.map((q) => [q.id, q.p]), F: sw(A.fdesk.center), A0: sw(A.ar0.center) }));
const ring = (id, [x, y], r, cls) => `<div class="rg ${cls} hide" id="${id}" style="left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px"></div>`;
const rtag = (id, [x, y], r, txt, side, cls) =>
  `<div class="rt ${cls} hide" id="${id}" style="left:${side === "l" ? x - r - 230 : side === "r" ? x + r + 10 : x - 110}px;top:${side === "t" ? y - r - 54 : side === "b" ? y + r + 8 : y - 26}px">${txt}</div>`;
let html = "";
html += ring("rg-gate", GATE.p, GATE.r, "rg-g") + rtag("rt-gate", GATE.p, GATE.r, "门禁 · 谁能进来", "r", "rt-g");
RINGS.forEach((q) => { html += ring(q.id, q.p, q.r, "rg-r") + rtag(q.id.replace("rg", "rt"), q.p, q.r, q.txt, q.side, "rt-r"); });
html += kw("kw-q", "风险在<b>哪里</b>？", { x: 1180, y: 700, accent: "#e0453a" });
html += kw("kw-in", `风险在<b>门里面</b>${gtag("解读")}`, { x: 1120, y: 706, accent: "#e0453a" });
// 问询台：左栏勾选卡（按角色 / 成立前提）
const CK = { x: 60, w: 540 };
html += ck("ck-op", "运营者 · 写下依赖哪几家", { ...CK, y: 320, kind: "c", icon: "1" });
html += ck("ck-cc", "写链码 · 时间 随机数 加盐", { ...CK, y: 420, kind: "c", icon: "2" });
html += ck("ck-fw", "选框架 · 还有人维护吗", { ...CK, y: 520, kind: "c", icon: "3" });
html += ck("ck-w1", "单点写下来", { x: 64, w: 420, y: 330, kind: "g" });
html += ck("ck-w2", "分给不同组织", { x: 64, w: 420, y: 430, kind: "g" });
html += ck("ck-w3", "定期演练", { x: 64, w: 420, y: 530, kind: "g" });
const css = `
  .rg { position: absolute; border-radius: 50%; box-sizing: border-box; }
  .rg-r { border: 5px dashed #e0453a; }
  .rg-g { border: 5px solid #1f9d55; }
  .rt { position: absolute; width: 220px; text-align: center; font-size: 28px; font-weight: 800; background: #fff; border-radius: 10px; padding: 4px 0 6px; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
  .rt-r { color: #e0453a; border: 2px solid #e0453a; }
  .rt-g { color: #1f9d55; border: 2px solid #1f9d55; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dep: w("依赖哪几家", 1), trust: w("成员可信", 1),
  time: w("本地时间", 2), salt: w("加盐", 2), maint: w("有没有人维护", 3),
  phone: w("上链了", 4), q0: w("谁能写", 5), q1: w("谁能看", 5), q2: w("谁能改规则", 5),
  erase: w("删除", 6), anchor: w("公链锚定", 7), audit: w("审计报告", 7),
  inside: w("门里面", 9), ca: w("发证书", 10), adm: w("管理员密钥", 10), col: w("达到门槛", 10), leg: w("没人维护", 10),
  rule: w("规则本身", 11), p1: w("写下来", 12), p2: w("分给不同", 12), p3: w("定期演练", 12),
};
const t = (x) => f(x);

S.build({
  cam0: "legacyE", sub: "谁能写，谁能看，谁能改规则",
  grid: { u0: -3000, u1: 25000, v0: -3000, v1: 3000 }, box: [-2600, -9300, 23200, 11400],   // 盖住 legacyE · deskR · wide（A–F 全部）
  shown: ["#lb-legacy"], css, html,
  terms: [],
  end: { title: "企业级与许可链安全", line: "许可链没有消灭信任，只是把信任交给了具体的机构和人", next: "", at: LS[13] + 2.2 },   // 系列最后一集：没有"下一集"一行
  js: `
      // ===== L0 镜头右移到问询台
      out("#lb-legacy", ${t(LS[0] - 0.1)}, 0.2); cam(${t(LS[0])}, "deskR", 1.8, "power2.inOut");
      bump("#fsign", ${t(LS[0] + 1.6)}, 1.06, 1);
      // ===== L1 运营者：安全假设依赖哪几家组织；"成员可信"划掉
      pop("#ck-op", ${t(LS[1] + 0.2)}); bump("#fassume", ${t(TM.dep)}, 1.05, 1); pop("#lb-dep", ${t(TM.dep + 0.2)});
      pop("#lb-trust", ${t(TM.trust)});
      // ===== L2 写链码：时间 · 随机数 · 加盐
      pop("#ck-cc", ${t(LS[2] + 0.2)});
      // ===== L3 选框架：还有人维护吗
      pop("#ck-fw", ${t(LS[3] + 0.2)});
      // ===== L4 用户拿着手机：上链了，不可篡改
      out("#lb-dep, #lb-trust", ${t(LS[4] - 0.2)}); grow("fuser", ${t(LS[4])}); grow("fphone", ${t(LS[4] + 0.3)}); pop("#lb-phone", ${t(TM.phone)});
      // ===== L5 三块牌子依次立起
      grow("fq0", ${t(TM.q0)}); grow("fq1", ${t(TM.q1)}); grow("fq2", ${t(TM.q2)});
      // ===== L6 删除 · 更正
      out("#lb-phone", ${t(LS[6] - 0.2)}); grow("ferase", ${t(LS[6] + 0.3)}); pop("#lb-erase", ${t(TM.erase)});
      // ===== L7 公链锚定 + 审计报告
      grow("fanchor", ${t(TM.anchor - 0.3)}); pop("#lb-anchor", ${t(TM.anchor + 0.3)}); grow("faudit", ${t(TM.audit - 0.3)}); pop("#lb-audit", ${t(TM.audit + 0.3)});
      // ===== L8 拉到全景，题卡回来
      out("#ck-op, #ck-cc, #ck-fw, #lb-erase, #lb-anchor, #lb-audit", ${t(LS[8] - 0.3)}); cam(${t(LS[8] - 0.1)}, "wide", 1.6, "power2.inOut");
      pop("#kw-q", ${t(LS[8] + 1.0)});
      // ===== L9 门禁（绿）在最左，风险在门里面
      pop("#rg-gate", ${t(LS[9] + 0.2)}); pop("#rt-gate", ${t(LS[9] + 0.4)});
      out("#kw-q", ${t(TM.inside - 0.2)}, 0.2); pop("#kw-in", ${t(TM.inside)});
      // ===== L10 关键画面：门里四处红色虚线圈
      pop("#rg-ca", ${t(TM.ca)}); pop("#rt-ca", ${t(TM.ca + 0.2)});
      pop("#rg-adm", ${t(TM.adm)}); pop("#rt-adm", ${t(TM.adm + 0.2)});
      pop("#rg-col", ${t(TM.col)}); pop("#rt-col", ${t(TM.col + 0.2)});
      pop("#rg-leg", ${t(TM.leg)}); pop("#rt-leg", ${t(TM.leg + 0.2)});
      // ===== L11 回到问询台：规则写对了吗
      out("#rg-gate, #rt-gate, #rg-ca, #rt-ca, #rg-adm, #rt-adm, #rg-col, #rt-col, #rg-leg, #rt-leg, #kw-in", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "deskR", 1.6, "power2.inOut"); pop("#lb-rule", ${t(TM.rule)});
      // ===== L12 成立前提：写下来 · 分开 · 演练；安全假设盖章
      pop("#ck-w1", ${t(TM.p1)}); pop("#ck-w2", ${t(TM.p2)}); pop("#ck-w3", ${t(TM.p3)});
      tl.to("#fassume-stampmark", { opacity: 1, duration: 0.25 }, ${t(TM.p3 + 0.4)}); bump("#fassume", ${t(TM.p3 + 0.4)}, 1.05, 1);
      // ===== L13 主角工牌回到问询台；拉到全景；结束卡
      out("#ck-w1, #ck-w2, #ck-w3, #lb-rule", ${t(LS[13] - 0.2)}); grow("fhero", ${t(LS[13])}); pop("#lb-hero", ${t(LS[13] + 0.3)});
      out("#lb-hero", ${t(LS[13] + 1.0)}); cam(${t(LS[13] + 1.0)}, "wide", 1.4, "power2.inOut");
      // ===== L14 这个系列就到这里（结束卡静止）
`,
});
