// ep30/seg5「⑤ 公证人与验证者」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.cloudD（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E17 from "../../../ep17/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.legacyE

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E4, E7, E9, E11, E17, E22] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// wrap helper for objects that ignore opts.scale (SEGBASE 常见坑 1): scale around the ground point, rescale anchors
const putK = (key, o, r, dy = 0, opts = {}) => {
  const k = o.scale, [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...opts, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = sc(v); }
};
// D 云角（上一段结尾 cloudD 的画面：三只云桶）
L.D_BUCKETS.forEach((q, i) => putK("cl" + i, q, O.bucket(q, { id: "cl" + i })));
// E · Corda 馆
L.E_CORDA.forEach((q, i) => putK("cr" + i, q, O.rack(q, { id: "cr" + i, tag: "Org" + (i + 1) })));
L.E_NOTARY.forEach((q, i) => put("nt" + i, q, E4.tellerCounter(q, { id: "nt" + i, scale: q.scale, sign: "公证", cash: 0 }), 0, { grow: true }));
putK("nseal", L.E_SEAL, O.seal(L.E_SEAL, { id: "nseal", text: "公证", markText: "公证", stamped: false }), 0, { grow: true });
put("st", L.E_STATE, O.doc(L.E_STATE, { id: "st", title: "同一状态", lines: ["输入引用"], w: 140, h: 110, stampText: "公证" }), 0, { grow: true });
put("pc", L.E_PARCEL, E7.parcel(L.E_PARCEL, { id: "pc", scale: L.E_PARCEL.scale }), 0, { grow: true });
put("mag", L.E_MAG, O.magnifier(L.E_MAG, { id: "mag" }), 0, { grow: true });
put("acc", L.E_ACCEPT, O.doc(L.E_ACCEPT, { id: "acc", title: "always-accept", standing: true, w: 200, h: 150, lines: ["约束"] }), 0, { grow: true });
// flying envelope between Org1 and Org2 (point-to-point, not broadcast)
const ENV0 = { u: L.E_CORDA[0].u, v: L.E_CORDA[0].v, z: 190 }, ENV1 = { u: L.E_CORDA[1].u, v: L.E_CORDA[1].v, z: 190 };
const [ex0, ey0] = at(ENV0), [ex1, ey1] = at(ENV1);
add(ENV0, S.hid("envg", O.envelope(ENV0, { id: "env", w: 70, h: 46 }).svg), 400);
// E · Besu 馆
put("rota", L.E_ROTA, E9.rotaWheel(L.E_ROTA, { id: "rota", n: 4, scale: L.E_ROTA.scale, plate: "QBFT 验证者" }));
put("mint", L.E_MINT, E11.mintPress(L.E_MINT, { id: "mint", scale: L.E_MINT.scale, plate: "原生币", count: "正常", pile: 0.15 }));
put("ctr", L.E_CONTRACT, O.doc(L.E_CONTRACT, { id: "ctr", title: "合同", standing: true, w: 120, h: 150, lines: ["成员协议"] }));
put("pp", L.E_PANEL, E17.peerPanel(L.E_PANEL, { id: "pp", n: 6, scale: L.E_PANEL.scale, label: "验证者 P2P 端口" }));
putK("fw", L.E_FW, E1.firewall(L.E_FW, { id: "fw", len: 120 }), 0, { grow: true });
L.E_ADMIT.forEach((q, i) => put("ad" + i, q, O.doc(q, { id: "ad" + i, title: "本地准入", w: 140, h: 90, lines: [] })));
const PB = { u: L.E_PANEL.u + 60, v: L.E_PANEL.v + 90, z: 0 };
add(PB, S.hid("bigenv", O.envelope(PB, { id: "benv", w: 120, h: 80, state: "attacker" }).svg), 5);
// 退役角
L.E_LEGACY.forEach((q, i) => putK("lg" + i, q, O.rack(q, { id: "lg" + i, tag: ["GoQuorum", "Tessera"][i] })));
put("lsign", L.E_SIGN, E1.signBoard(L.E_SIGN, { id: "lsign", text: "已归档 · 已弃用", style: "plate" }));
put("wr", L.E_WRENCH, E22.wrench(L.E_WRENCH, { id: "wr", scale: L.E_WRENCH.scale }), 0, { grow: true });

// native SVG: hall tags, dots, strike, fix arrow, migrate arrow
const zoneTag = (o, text) => { const [x, y] = at(o);
  return `<g><rect x="${x - 105}" y="${y - 22}" width="210" height="48" rx="12" fill="#fffdf8" stroke="#1d93ba" stroke-width="3"/>
    <text x="${x}" y="${y + 12}" text-anchor="middle" font-size="28" font-weight="900" fill="#1d93ba" font-family="sans-serif">${text}</text></g>`; };
add(L.E_TAGS[0], zoneTag(L.E_TAGS[0], "Corda 馆"), -5);
add(L.E_TAGS[1], zoneTag(L.E_TAGS[1], "Besu 馆"), -5);
// legacy: green fix arrow from above, cut red before the racks
const LGm = { u: (L.E_LEGACY[0].u + L.E_LEGACY[1].u) / 2, v: (L.E_LEGACY[0].v + L.E_LEGACY[1].v) / 2 };
const [fx, fyTop] = at(LGm, 0, 0, 480), [, fyMid] = at(LGm, 0, 0, 400), [, fyLow] = at(LGm, 0, 0, 230);
add(LGm, S.hid("fixarr", `<path d="M${fx} ${fyTop}V${fyMid}" stroke="#1f9d55" stroke-width="10" stroke-linecap="round"/>`), 500);
add(LGm, S.hid("fixcut", `<path d="M${fx} ${fyMid + 14}V${fyLow}" stroke="#e0453a" stroke-width="6" stroke-dasharray="12 10" fill="none"/>
  <path d="M${fx - 18} ${(fyMid + fyLow) / 2 - 18}l36 36M${fx + 18} ${(fyMid + fyLow) / 2 - 18}l-36 36" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/>`), 501);
const [mx0, my0] = at(L.E_MIGRATE, -90, 0), [mx1, my1] = at(L.E_MIGRATE, 90, 0);
add(L.E_MIGRATE, S.hid("mig", `<path d="M${mx0} ${my0}L${mx1} ${my1}" stroke="#1d93ba" stroke-width="9" stroke-linecap="round"/>
  <path d="M${mx1 + 18} ${my1 - 6}L${mx1 - 10} ${my1 - 16}L${mx1 - 2} ${my1 + 10}Z" fill="#1d93ba" stroke="#1d93ba" stroke-width="6" stroke-linejoin="round"/>`), 2);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-cr", up(A.cr1.top, 10), "Corda 节点", "lab-ink lab-sm");
lb("lb-off", up(A.cr2.top, 10), "不收", "lab-g lab-sm");
lb("lb-nt", up(A.nt0.top, 8), "公证人", "lab-cs lab-sm");
lb("lb-nv", up(A.st.top, -10), "非验证型 · 只看输入引用", "lab-cs lab-sm");
lb("lb-ds", up(A.st.top, -14), "签了两次 → 双花", "lab-rs lab-sm");
L.E_NOTARY.forEach((q, i) => lb("lb-op" + i, up(A["nt" + i].top, 8), "运营方 " + (i + 1), ["lab-cs", "lab-gs", "lab-ink"][i] + " lab-sm"));
lb("lb-cl", up(A.nt1.top, 64), "公证人集群", "lab-g lab-sm");
lb("lb-pc", up(A.pc.top, 6), "对方数据", "lab-ink lab-sm", "r");
lb("lb-ok", [A.mag.top[0] + 70, A.mag.top[1] - 10], "先校验 ✓", "lab-gs lab-sm", "l");
lb("lb-acc", up(A.acc.top, 4), "只用于测试", "lab-r lab-sm");
lb("lb-wd", [A.rota.center[0] - 80, A.rota.center[1]], "未授权提款", "lab-rs lab-sm", "r");
lb("lb-fin", up(A.rota.top, 30), "照常确定 ✓", "lab-gs lab-sm");
lb("lb-tol", up(A.rota.top, 34), "4 个 · 容忍 1 个", "lab-cs lab-sm");
lb("lb-gap", up(A.rota.ground, -40), "验证规则缺了一项 · 1 个就够", "lab-rs lab-sm", "t");
lb("lb-coin", up(A.mint.top, 6), "原生币凭空增加", "lab-rs lab-sm");
lb("lb-ctr", up(A.ctr.ground, -24), "事后追责 ✓ · 阻止写错 ✕", "lab-g lab-sm", "t");
lb("lb-pp", up(A.pp.top, 10), "大体积提案 → 无法最终确定", "lab-rs lab-sm");
lb("lb-fw", up(A.fw.top, 4), "只放行成员", "lab-gs lab-sm", "r");
lb("lb-ad", [at(L.E_ADMIT[1])[0] + 140, at(L.E_ADMIT[1])[1] - 30], "每个成员都要配 · 核对一致", "lab-cs lab-sm", "l");
L.E_ADMIT.forEach((q, i) => lb("lb-ak" + i, up(A["ad" + i].center, 30), "✓", "lab-gs lab-sm", "c"));
lb("lb-ax", [at(L.E_ADMIT[3])[0] + 120, at(L.E_ADMIT[3])[1] + 10], "不一致", "lab-rs lab-sm", "l");
lb("lb-nofix", [fx + 34, (fyMid + fyLow) / 2], "没有上游修复", "lab-rs lab-sm", "l");
lb("lb-fixu", [fx + 26, fyTop + 40], "安全修复", "lab-gs lab-sm", "l");
lb("lb-wr", up(A.wr.top, 6), "自行维护", "lab-ink lab-sm");
lb("lb-mg", up(at(L.E_MIGRATE), 26), "迁移", "lab-cs lab-sm");
// L12 dots: 4 validators, one may be faulty; strike over the tolerance label (L13)
const [tx, ty] = up(A.rota.top, 34);
add(L.E_ROTA, S.hid("dots4", [0, 1, 2, 3].map((i) => `<circle cx="${tx - 54 + i * 36}" cy="${ty - 74}" r="11" fill="${i === 1 ? "#e0453a" : "#1d93ba"}"/>`).join("")), 300);
add(L.E_ROTA, S.hid("strike", `<path d="M${tx - 150} ${ty - 22}L${tx + 150} ${ty - 22}" stroke="#e0453a" stroke-width="6" stroke-dasharray="14 9" stroke-linecap="round"/>`), 301);

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev-r3", `<b>来源</b> R3 Corda 文档`)
  + evt("ev-besu", `<b>Besu QBFT 漏洞 · 2026 年 9 月</b><br><span style="font-size:28px">来源 Besu 安全公告 · 受影响 24.5.2 起 · 26.8.1 修复</span>`, { color: "#e0453a", top: 128 })
  + evt("ev-p2p", `<b>同一时期另一项公告</b><br><span style="font-size:28px">来源 Besu 安全公告 · 26.9.0 修复</span>`, { color: "#e0453a", top: 136 })
  + evt("ev-cons", `<b>来源</b> Consensys 仓库说明`, { top: 144 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "cloudD", sub: "单点换了位置",
  grid: { u0: 12000, u1: 21200, v0: -3800, v1: 5400 }, box: [10800, -6100, 6500, 3300],   // 盖住本段镜头 cordaE · besuE · p2pE · legacyE（cloudD = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "公证人", d: "Corda 中防止状态被重复消费的服务", at: w("公证人", 2) },
    { id: "t1", t: "双花", d: "同一份资产被花两次", at: w("双花", 4) },
    { id: "t2", t: "拜占庭验证者", d: "可能任意作恶的验证者", at: w("拜占庭验证者", 10) },
    { id: "t3", t: "最终确定", d: "区块被确认后不再回滚", at: w("最终确定", 15) },
    { id: "t4", t: "准入", d: "决定哪些节点和账户能加入的规则", at: w("准入", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 换两种框架，单点换了位置。 → 镜头右移到 cordaE
      cam(${t(LS[0] + 0.2)}, "cordaE", 1.8, "power2.inOut");
      // ===== L1 Corda 不广播：信封只在 Org1 → Org2 之间飞，Org3 不收
      pop("#lb-cr", ${t(LS[1] + 0.1)}, 0.25);
      fadeIn("#envg", ${t(LS[1] + 0.8)}, 0.3);
      tl.fromTo("#envg", { x: 0, y: 0 }, { x: ${f(ex1 - ex0)}, y: ${f(ey1 - ey0)}, duration: 1.3, ease: "power1.inOut", immediateRender: false }, ${t(LS[1] + 1.2)});
      tl.to("#cr2", { opacity: 0.4, duration: 0.4 }, ${t(LS[1] + 2.0)}); pop("#lb-off", ${t(LS[1] + 2.1)}, 0.25);
      // ===== L2 防双花靠公证人
      out("#envg, #lb-cr", ${t(LS[2] - 0.2)}, 0.2);
      grow("nt0", ${t(LS[2] + 0.2)}); grow("nseal", ${t(LS[2] + 0.5)}); pop("#lb-nt", ${t(LS[2] + 0.8)}, 0.25);
      // ===== L3 非验证型只看输入引用
      grow("st", ${t(LS[3] + 0.3)}); pop("#lb-nv", ${t(LS[3] + 0.8)}, 0.25);
      // ===== L4 单个公证人运营方作恶，同一状态签两次 → 双花
      out("#lb-nv", ${t(LS[4] - 0.2)}, 0.2);
      bump("#nseal", ${t(LS[4] + 3.0)}, 1.12, 1); fadeIn("#st-stampmark", ${t(LS[4] + 3.2)}, 0.15);
      bump("#nseal", ${t(LS[4] + 4.2)}, 1.12, 1); flash("#st-stampmark", ${t(LS[4] + 4.4)}, 2);
      KIT.broke(tl, "st", ${t(LS[4] + 5.2)}, { badge: true, ghost: 0.5 }); pop("#lb-ds", ${t(LS[4] + 5.4)}, 0.25);
      // ===== L5 改成集群，分运营方
      out("#lb-ds, #lb-nt", ${t(LS[5] - 0.2)}, 0.2);
      grow("nt1", ${t(LS[5] + 0.6)}); grow("nt2", ${t(LS[5] + 0.9)});
      [0, 1, 2].forEach((i) => pop("#lb-op" + i, ${t(LS[5] + 1.5)} + i * 0.2, 0.25)); pop("#lb-cl", ${t(LS[5] + 2.2)}, 0.25);
      // ===== L6 对方数据先校验再用
      grow("pc", ${t(LS[6] + 0.8)}); pop("#lb-pc", ${t(LS[6] + 1.1)}, 0.25);
      grow("mag", ${t(LS[6] + 2.0)}); pop("#lb-ok", ${t(LS[6] + 3.2)}, 0.25);
      // ===== L7 always-accept 只用于测试（来源卡）
      out("#lb-op0, #lb-op1, #lb-op2, #lb-cl", ${t(LS[7] - 0.2)}, 0.2);
      grow("acc", ${t(LS[7] + 2.4)});
      KIT.broke(tl, "acc", ${t(LS[7] + 4.0)}, { badge: true, ghost: 0.5 }); pop("#lb-acc", ${t(LS[7] + 4.3)}, 0.25);
      pop("#ev-r3", ${t(LS[7] + 4.5)}, 0.3);
      // ===== L8 再看 Besu → besuE
      out("#lb-pc, #lb-ok, #lb-acc, #lb-off, #ev-r3", ${t(LS[8] - 0.2)}, 0.2);
      cam(${t(LS[8])}, "besuE", 1.4, "power2.inOut");
      // ===== L9 事件卡：Besu QBFT 漏洞
      pop("#ev-besu", ${t(LS[9] + 0.3)}, 0.3);
      // ===== L10 一名拜占庭验证者注入未授权提款
      X9.seat(tl, "rota", ${t(LS[10] + 3.0)}, 1, "red"); pop("#lb-wd", ${t(LS[10] + 3.6)}, 0.25);
      // ===== L11 诚实验证者照常确定，原生币凭空增加
      out("#ev-besu", ${t(LS[11] - 0.2)}, 0.2);
      [0, 2, 3].forEach((k, i) => X9.seat(tl, "rota", ${t(LS[11] + 0.6)} + i * 0.3, k, "hot"));
      pop("#lb-fin", ${t(LS[11] + 2.2)}, 0.25);
      X11.mint(tl, "mint", ${t(LS[11] + 3.0)}, 1.8, 2, 1); pop("#lb-coin", ${t(LS[11] + 3.8)}, 0.25);
      // ===== L12 4 个验证者只容忍 1 个
      out("#lb-fin", ${t(LS[12] - 0.2)}, 0.2);
      fadeIn("#dots4", ${t(LS[12] + 0.3)}, 0.3); pop("#lb-tol", ${t(LS[12] + 0.6)}, 0.25);
      // ===== L13 关键画面：验证规则缺了一项，一名就够
      fadeIn("#strike", ${t(LS[13] + 1.2)}, 0.3); tl.to("#lb-tol", { opacity: 0.45, duration: 0.3 }, ${t(LS[13] + 1.3)});
      pop("#lb-gap", ${t(LS[13] + 1.8)}, 0.3); bump("#lb-coin", ${t(LS[13] + 4.0)}, 1.1, 1);
      // ===== L14 合同只能事后追责
      out("#lb-wd", ${t(LS[14] - 0.2)}, 0.2);
      bump("#ctr", ${t(LS[14] + 0.3)}, 1.06, 1); pop("#lb-ctr", ${t(LS[14] + 0.6)}, 0.25);
      // ===== L15 大体积提案阻止最终确定 → p2pE
      out("#lb-tol, #lb-gap, #strike, #dots4, #lb-coin, #lb-ctr", ${t(LS[15] - 0.2)}, 0.2);
      cam(${t(LS[15])}, "p2pE", 1.4, "power2.inOut");
      pop("#ev-p2p", ${t(LS[15] + 1.2)}, 0.3);
      X17.peerRed(tl, "pp", ${t(LS[15] + 3.6)}, "all", true); fadeIn("#bigenv", ${t(LS[15] + 5.0)}, 0.3);
      X17.peerLamp(tl, "pp", ${t(LS[15] + 6.2)}, "red"); pop("#lb-pp", ${t(LS[15] + 6.4)}, 0.25);
      // ===== L16 网络层限制谁能连
      out("#ev-p2p, #lb-pp", ${t(LS[16] - 0.2)}, 0.2);
      grow("fw", ${t(LS[16] + 2.6)}); out("#bigenv", ${t(LS[16] + 3.0)}, 0.3);
      X17.peerRed(tl, "pp", ${t(LS[16] + 3.2)}, "all", false); X17.peerLamp(tl, "pp", ${t(LS[16] + 3.6)}, "green");
      pop("#lb-fw", ${t(LS[16] + 3.8)}, 0.25);
      // ===== L17 本地准入：每个成员都配，核对一致
      out("#lb-fw", ${t(LS[17] - 0.2)}, 0.2);
      [0, 1, 2].forEach((i) => pop("#lb-ak" + i, ${t(LS[17] + 1.4)} + i * 0.3, 0.2));
      KIT.broke(tl, "ad3", ${t(LS[17] + 2.4)}, { badge: false, ghost: 0.6 }); pop("#lb-ax", ${t(LS[17] + 2.5)}, 0.25);
      pop("#lb-ad", ${t(LS[17] + 3.4)}, 0.25);
      out("#lb-ax", ${t(LS[17] + 4.6)}, 0.2); tl.to("#ad3-solid", { opacity: 1, duration: 0.3 }, ${t(LS[17] + 4.6)}); tl.to("#ad3-wire", { opacity: 0, duration: 0.25 }, ${t(LS[17] + 4.6)}); pop("#lb-ak3", ${t(LS[17] + 4.8)}, 0.2);
      // ===== L18 没有漏洞也会发生 → legacyE
      out("#lb-ad, #lb-ak0, #lb-ak1, #lb-ak2, #lb-ak3", ${t(LS[18] - 0.2)}, 0.2);
      cam(${t(LS[18])}, "legacyE", 1.4, "power2.inOut");
      // ===== L19 GoQuorum 归档，Tessera 弃用：指示灯熄灭 + 来源卡
      [0, 1, 2].forEach((i) => { KIT.led(tl, "lg0-led-" + i, ${t(LS[19] + 0.6)} + i * 0.15, "off"); KIT.led(tl, "lg0-act-" + i, ${t(LS[19] + 0.6)} + i * 0.15, "off"); });
      [0, 1, 2].forEach((i) => { KIT.led(tl, "lg1-led-" + i, ${t(LS[19] + 2.0)} + i * 0.15, "off"); KIT.led(tl, "lg1-act-" + i, ${t(LS[19] + 2.0)} + i * 0.15, "off"); });
      tl.to("#lg0, #lg1", { opacity: 0.6, duration: 0.5 }, ${t(LS[19] + 2.6)});
      bump("#lsign", ${t(LS[19] + 2.8)}, 1.06, 1); pop("#ev-cons", ${t(LS[19] + 1.0)}, 0.3);
      // ===== L20 上游修复箭头在机柜前断开
      out("#ev-cons", ${t(LS[20] + 1.6)}, 0.2);
      fadeIn("#fixarr", ${t(LS[20] + 0.6)}, 0.4); pop("#lb-fixu", ${t(LS[20] + 0.8)}, 0.25);
      fadeIn("#fixcut", ${t(LS[20] + 2.0)}, 0.3); pop("#lb-nofix", ${t(LS[20] + 2.3)}, 0.25);
      // ===== L21 自己维护或尽快迁移
      grow("wr", ${t(LS[21] + 1.6)}); pop("#lb-wr", ${t(LS[21] + 1.9)}, 0.25);
      fadeIn("#mig", ${t(LS[21] + 3.0)}, 0.4); pop("#lb-mg", ${t(LS[21] + 3.3)}, 0.25);
`,
});
