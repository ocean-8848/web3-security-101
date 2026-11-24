// ep30/seg1「① 同一个哈希」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.nodesA（BRIEF）。
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.hallA

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E3, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点缩放，并换算 anchors（SEGBASE 常见坑 1）
const sc2 = (o, k) => { const [gx, gy] = at(o); return (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; };
function wput(key, o, r, k, dy = 0, gid) {
  const [gx, gy] = at(o), sc = sc2(o, k);
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${gid ? S.hid(gid, svg) : svg}</g>` });
  const isPt = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === "number";
  for (const [n, v] of Object.entries(A[key])) {
    if (isPt(v)) A[key][n] = sc(v);
    else if (Array.isArray(v) && v.every(isPt)) A[key][n] = v.map(sc);
  }
}
const ORG = ["Org1", "Org2", "Org3", "Org4"];
const GREEN = "#1f9d55", RED = "#e0453a", TEAL = "#2aa3c9";

// ---------------------------------------------------------------- 原生 SVG：参观路线、区牌、两路分发线、账本断口
{
  const [x0, y0] = Wp(-1800, 0, 0), [x1, y1] = Wp(2600, 0, 0);
  add({ u: -1800, v: -9000 }, `<g opacity="0.7"><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${TEAL}" stroke-width="4" stroke-dasharray="16 14" stroke-linecap="round"/>` +
    `<polygon points="${x1},${y1} ${x1 - 26},${y1 - 2} ${x1 - 18},${y1 + 16}" fill="${TEAL}"/></g>`);
  const [tx, ty] = at(L.A_TAG);
  add(L.A_TAG, `<g><rect x="${tx - 100}" y="${ty - 22}" width="200" height="48" rx="12" fill="#fffdf8" stroke="#cfc7b8" stroke-width="2"/>` +
    `<text x="${tx}" y="${ty + 12}" font-size="28" font-weight="800" text-anchor="middle" fill="#1c1c1c" font-family="Noto Sans SC, sans-serif">记账大厅</text></g>`, -400);
  // 漏斗 → 左两本（青蓝）/ 右两本（红）地面分发线
  const F = at(L.A_FUNNEL), l1 = at(L.A_LEDGERS[1]), l2 = at(L.A_LEDGERS[2]);
  add(L.A_FUNNEL, S.hid("rtL", `<path d="M${F[0] - 30},${F[1] + 6} L${l1[0] + 70},${l1[1] - 20}" stroke="${TEAL}" stroke-width="6" stroke-dasharray="14 10" fill="none" stroke-linecap="round"/>`), -500);
  add(L.A_FUNNEL, S.hid("rtR", `<path d="M${F[0] + 30},${F[1] + 6} L${l2[0] - 70},${l2[1] - 20}" stroke="${RED}" stroke-width="6" stroke-dasharray="14 10" fill="none" stroke-linecap="round"/>`), -500);
  // 账本断口：左两本 ↔ 右两本之间的红虚线，中间一个红叉
  const bl = at(L.A_LEDGERS[1]), br = at(L.A_LEDGERS[2]);
  const ya = bl[1] + 40, yb = br[1] + 40, xm = (bl[0] + br[0]) / 2, ym = (ya + yb) / 2;
  add(L.A_FORK, S.hid("brk", `<path d="M${bl[0] + 80},${ya} L${xm - 40},${ym}" stroke="${RED}" stroke-width="6" stroke-dasharray="12 10" fill="none"/>` +
    `<path d="M${xm + 40},${ym} L${br[0] - 80},${yb}" stroke="${RED}" stroke-width="6" stroke-dasharray="12 10" fill="none"/>` +
    `<path d="M${xm - 16},${ym - 16} L${xm + 16},${ym + 16} M${xm + 16},${ym - 16} L${xm - 16},${ym + 16}" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>`), 200);
}

// ---------------------------------------------------------------- 世界物件
L.A_RACKS.forEach((o, i) => wput(`rk${i}`, o, O.rack(o, { id: `rk${i}`, tag: ORG[i], leds: ["off", "off", "off"] }), 0.5));
L.A_CARDS.forEach((o, i) => put(`kc${i}`, o, E5.keycard(o, { id: `kc${i}`, scale: 0.5, color: GREEN, text: "成员" }), 0, { wrap: (svg) => S.hid(`kcg${i}`, svg) }));
L.A_LEDGERS.forEach((o, i) => {
  put(`ld${i}`, o, O.ledgerBook(o, { id: `ld${i}`, scale: 0.4 }));
  if (i >= 2) put(`ldr${i}`, o, O.ledgerBook(o, { id: `ldr${i}`, scale: 0.4, state: "attacker" }), 1, { wrap: (svg) => S.hid(`ldrg${i}`, svg) });
});
wput("chn", L.A_CHAIN, O.chain(L.A_CHAIN, { id: "chn", n: 3, labels: ["#1", "#2", "区块"] }), 0.6);
wput("fnl", L.A_FUNNEL, E3.hashFunnel(L.A_FUNNEL, { id: "fnl", text: "解析", inputs: ["区块"], output: "交易" }), 0.6);
put("fork", L.A_FORK, E16.forkSwitch(L.A_FORK, { id: "fork", scale: 0.6, thrown: false, labels: ["A B C", "A C B"] }));
put("proof", L.A_PROOF, E2.proofCard(L.A_PROOF, { id: "proof", text: "编码无歧义" }), 0, { grow: true });
wput("gate", L.A_GATE, E1.firewall(L.A_GATE, { id: "gate", len: 160 }), 0.5);
put("atk", L.A_ATTACKER, O.person(L.A_ATTACKER, { id: "atk", role: "attacker", scale: 0.4, color: "#9a958c" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
L.A_CARDS.forEach((o, i) => lb(`lb-ok${i}`, up(A[`kc${i}`].top, 6), "✓", "lab-gs lab-sm"));
lb("lb-cert", up(A.rk1.top, 50), "有效证书", "lab-gs lab-sm", "b");
lb("lb-atk", up(A.atk.top, 6), "算力 ✕", "lab-r lab-sm");
[0, 1].forEach((i) => lb(`lb-ldA${i}`, up(A[`ld${i}`].top, 4), "A B C", "lab-cs lab-sm"));
[2, 3].forEach((i) => {
  lb(`lb-ldB${i}`, up(A[`ld${i}`].top, 4), "A C B", "lab-rs lab-sm");
  lb(`lb-ldF${i}`, up(A[`ld${i}`].top, 4), "A B C", "lab-gs lab-sm");
});
const LB = A.chn.last;
lb("lb-blkA", [LB[0] - 70, LB[1] - 70], "A B C", "lab-cs lab-sm");
lb("lb-blkB", [LB[0] + 70, LB[1] - 70], "A C B", "lab-rs lab-sm");
lb("lb-hash", [LB[0], LB[1] - 150], `同一个哈希 <b style="color:#fff">=</b>`, "lab-gs lab-sm", "b");
L.A_PATHS.forEach((o, i) => lb(`lb-path${i}`, at(o), i ? "交易 A C B" : "交易 A B C", i ? "lab-rs lab-sm" : "lab-cs lab-sm", "c"));
lb("lb-fix", [A.proof.ground[0] - 150, A.proof.ground[1] + 20], "修复版本 2.2.14 / 2.5.5", "lab-g lab-sm", "t");
lb("lb-key", up(A.chn.top, 20).map((v, j) => v + (j ? 0 : -330)), "私钥 ✓", "lab-cs lab-sm");
lb("lb-cons", up(A.chn.top, 20).map((v, j) => v + (j ? 0 : 330)), "共识 ✓", "lab-cs lab-sm");
lb("lb-door", up(A.gate.top, 10), `挡住的只是外人${gtag("解读")}`, "lab-ink lab-sm");
lb("lb-ttl", at(L.A_TITLE),
  `<div style="font-size:44px;font-weight:900;text-align:center">风险在哪里？</div>` +
  `<div style="margin-top:10px;display:flex;gap:14px;justify-content:center;font-size:30px">` +
  ["谁能写", "谁能看", "谁能改规则"].map((s, i) => `<span id="q${i}" style="opacity:0;padding:2px 14px;border:2px solid #1d93ba;border-radius:10px;color:#17809f">${s}</span>`).join("") + `</div>`,
  "lab-g", "b");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  evt("ev-cve", `Fabric 交易交联 · CVE-2023-46132<br><span style="font-size:28px;color:#6d685e">来源：Fabric 安全公告</span>`) +
  kw("kw-fix", `同一串字节 → <b>同一组交易</b>${gtag("解读")}`, { x: 56, y: 790, size: 38 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  run: w("运营", 0), cert: w("有效", 1), cpu: w("算力", 2), fork: w("分叉", 3),
  bug: w("漏洞", 4), mix: w("重新组合", 5), same: w("没有变", 6), diff: w("不同的交易", 7),
  write: w("各自写入", 8), mis: w("对不上", 8), amb: w("没有歧义", 9), byte: w("同一串", 9),
  key: w("私钥", 10), cons: w("共识", 10), out: w("外人", 11), risk: w("风险", 12),
  q0: w("谁能写", 13), q1: w("谁能看", 13), q2: w("谁能改规则", 13), bld: w("写字楼", 14),
};
const t = (x) => f(x);

S.build({
  cam0: "nodesA", sub: "人人持证，账本照样分叉",
  grid: { u0: -2600, u1: 2500, v0: -2800, v1: 2500 }, box: [-1700, -1100, 3200, 2100],   // 盖住本段镜头 nodesA · hashA · hallA
  shown: [], css, html,
  terms: [
    { id: "t0", t: "联盟链", d: "由多家组织共同治理的许可链", at: w("联盟链", 0) },
    { id: "t1", t: "世界状态", d: "按账本算出的当前全部数据", at: w("世界状态", 8) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 一个联盟链网络，所有节点都由成员机构运营。 四台机柜依次亮灯
      [0, 1, 2, 3].forEach((i) => [0, 1, 2].forEach((j) => KIT.led(tl, "rk" + i + "-led-" + j, ${t(LS[0] + 0.6)} + i * 0.45 + j * 0.08, "green")));
      // ===== L1 每个参与者，都持有一张有效的证书。 工牌依次挂上 + 绿勾
      [0, 1, 2, 3].forEach((i) => { fadeIn("#kcg" + i, ${t(TM.cert - 0.3)} + i * 0.3, 0.3); pop("#lb-ok" + i, ${t(TM.cert)} + i * 0.3, 0.25); });
      pop("#lb-cert", ${t(TM.cert + 1.2)}, 0.3);
      // ===== L2 没有匿名的陌生人，也没有人能靠算力闯进来。 门外攻击者被挡
      out("#lb-cert", ${t(LS[2])}, 0.2);
      KIT.led(tl, "gate-led", ${t(TM.cpu)}, "red"); pop("#lb-atk", ${t(TM.cpu)}, 0.25); bump("#lb-atk", ${t(TM.cpu + 0.6)}, 1.15, 1);
      // ===== L3 可就在这样的网络里，账本分叉了。 右两本变红 + 断口
      [2, 3].forEach((i) => fadeIn("#ldrg" + i, ${t(TM.fork)} + (i - 2) * 0.2, 0.4)); fadeIn("#brk", ${t(TM.fork + 0.4)}, 0.4);
      // ===== L4 Hyperledger Fabric 公布过这样一个漏洞。 → hashA + 事件卡
      out("#lb-atk, ${[0, 1, 2, 3].map((i) => "#lb-ok" + i).join(", ")}", ${t(LS[4] - 0.2)}, 0.2);
      out("#brk", ${t(LS[4] - 0.2)}, 0.3); [2, 3].forEach((i) => out("#ldrg" + i, ${t(LS[4] - 0.2)}, 0.3));
      cam(${t(LS[4])}, "hashA", 1.4); pop("#ev-cve", ${t(TM.bug)}, 0.3);
      // ===== L5 攻击者能把一个区块里的交易，重新组合。 区块上 A B C → A C B
      pop("#lb-blkA", ${t(LS[5] + 0.3)}, 0.25); pop("#lb-blkB", ${t(TM.mix)}, 0.3);
      // ===== L6 区块哈希没有变。 同一张哈希标签
      pop("#lb-hash", ${t(TM.same - 0.3)}, 0.3); bump("#lb-hash", ${t(TM.same + 0.3)}, 1.12, 1);
      // ===== L7 可是不同的节点，从同一个区块里，解析出了不同的交易。 漏斗两路
      X3.hash(tl, "fnl", ${t(LS[7] + 0.2)});
      fadeIn("#rtL", ${t(TM.diff - 0.4)}, 0.4); pop("#lb-path0", ${t(TM.diff - 0.4)}, 0.25);
      fadeIn("#rtR", ${t(TM.diff)}, 0.4); pop("#lb-path1", ${t(TM.diff)}, 0.25);
      // ===== L8 收到不同版本的节点，各自写入世界状态，两份账本从此对不上。 关键画面
      [0, 1].forEach((i) => pop("#lb-ldA" + i, ${t(TM.write)} + i * 0.15, 0.25));
      [2, 3].forEach((i) => { fadeIn("#ldrg" + i, ${t(TM.write + 0.3)} + (i - 2) * 0.15, 0.3); pop("#lb-ldB" + i, ${t(TM.write + 0.3)} + (i - 2) * 0.15, 0.25); });
      X16.flip(tl, "fork", ${t(TM.write + 0.5)}, true);
      fadeIn("#brk", ${t(TM.mis)}, 0.3); flash("#brk", ${t(TM.mis + 0.4)}, 2);
      // ===== L9 修复的方向是，让哈希的编码没有歧义，同一串字节，只能读出同一组交易。 证明卡立起，两路合一
      out("#ev-cve", ${t(LS[9])}, 0.3);
      grow("proof", ${t(TM.amb - 0.3)}); pop("#lb-fix", ${t(TM.amb + 0.4)}, 0.25);
      out("#rtR, #lb-path1, #brk, #lb-blkB, #lb-ldB2, #lb-ldB3, #ldrg2, #ldrg3", ${t(TM.byte - 0.2)}, 0.3);
      X16.flip(tl, "fork", ${t(TM.byte - 0.2)}, false);
      [2, 3].forEach((i) => pop("#lb-ldF" + i, ${t(TM.byte + 0.2)} + (i - 2) * 0.15, 0.25));
      pop("#kw-fix", ${t(TM.byte)}, 0.3);
      // ===== L10 这里没有人偷到私钥，也没有人攻破共识。
      out("#kw-fix", ${t(LS[10] + 1.2)}, 0.25);
      pop("#lb-key", ${t(TM.key)}, 0.25); pop("#lb-cons", ${t(TM.cons)}, 0.25);
      // ===== L11 门禁再严，挡住的也只是外人。 → hallA
      out("#lb-key, #lb-cons, #lb-fix, #lb-hash, #lb-blkA, #lb-path0, #rtL, #lb-ldA0, #lb-ldA1, #lb-ldF2, #lb-ldF3", ${t(LS[11] - 0.2)}, 0.2);
      cam(${t(LS[11])}, "hallA", 1.6);
      pop("#lb-atk", ${t(LS[11] + 1.0)}, 0.25); pop("#lb-door", ${t(TM.out - 0.3)}, 0.3);
      // ===== L12 那么，一个只让熟人进门的区块链，风险到底在哪里？ 题卡
      out("#lb-atk, #lb-door", ${t(LS[12] + 0.6)}, 0.25);
      pop("#lb-ttl", ${t(LS[12] + 1.2)}, 0.35); bump("#lb-ttl", ${t(TM.risk + 0.2)}, 1.06, 1);
      // ===== L13 谁能写，谁能看，谁能改规则？
      fadeIn("#q0", ${t(TM.q0)}, 0.3); fadeIn("#q1", ${t(TM.q1)}, 0.3); fadeIn("#q2", ${t(TM.q2)}, 0.3);
      // ===== L14 我们从一栋刷卡进门的写字楼说起。 题卡收起，停在 hallA
      out("#lb-ttl", ${t(TM.bld - 0.4)}, 0.4);
`,
});
