// ep12/seg3「③ 四种验证方式」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.mintB（接 seg2 段尾）；ends static on CAMS.upgrade。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   valid        近景：9 人验证者平台 + 两块分组牌 + 门限表（seg1 起点；seg6 L2、L5–L7 回到这里给答案）
//   bridge       B 桥全景：桥 + 平台 + 岗亭 + 门限表 + 中继者，两岸同框（seg1 终点 "凭什么相信？"；seg2 L0–L3、L8–L9；seg4 L1–L4；seg5 L1–L2）
//   booth        近景：岗亭 + 证明卡 + 门限表（seg2 L12–L15；seg4 L1–L4 证明卡 missing）
//   bankA        A 金库全景：售货机 + 保险柜 + 用户 + 存款事件 + 消息 + 点阵 + A 链（seg2 L4–L7；seg5 L3–L4；seg6 L1）
//   mintB        近景：铸币机 + B 链 + 点阵（seg2 L10–L11、seg2 终点 "信谁？"；seg3 起点）
//   recon        近景：两侧对账天平 + 自动暂停闸刀 + 监控灯 + 延迟队列（seg2 L19；seg5 L8–L9；seg6 L8）
//   hallD        D 四摊全景 + 尽头升级角（seg3 L0、seg4 L0；seg5 L10 远景带过）
//   dMulti       
//   dLight       
//   dOpt         
//   dZk          
//   upgrade      近景：展台尽头 新实现 + 红色升级钥匙 + 时间锁（seg3 终点；seg5 L10）
//   filesE       E 档案墙全景（seg4 L0、L5；seg5 起点 L0、L5–L7）
//   eTree        
//   eSig         
//   eKey         
//   eZero        
//   eRpc         
//   cexF         F 柜台全景（seg5 L11–L12、L17 终点；seg6 起点 L0、L3–L4）
//   cexTag       近景：假币 + 回执 + TRON 区块 + 确认数（seg5 L13–L17）
//   wide         宽景：两岸 = 两座城，A · B · C 前排同框（seg2 L16–L22 两岸 / C→A 反向）
//   world        全景：所有区（seg6 结束卡前拉远）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E5, E10, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
// screen point (px) in camera `cn` → world-canvas point
const P = (cn, sx, sy) => { const c = L.CAMS[cn]; return [(sx - c.x) / c.scale, (sy - c.y) / c.scale]; };
const gp = (cn, sx, sy) => { const [X0, Y0] = P(cn, sx, sy); const q = G(X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const wrapAt = (o, k) => { const [gx, gy] = at(o); return { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`, sc: (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k] }; };

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// C 区（起始镜头 mintB）
put("mpz", L.MINTB, E11.mintPress(L.MINTB, { id: "mpz", plate: "映射代币", scale: 0.8 }));
put("chb", L.CHAINB, O.chain(L.CHAINB, { id: "chb", n: 4, title: "B 链" }));
// D 区四个摊位：摊名牌（L0 依次长出）
["多签 / MPC", "轻客户端", "乐观证明", "零知识证明"].forEach((text, i) =>
  put("st" + i, L.STALLS[i], E1.signBoard(L.STALLS[i], { id: "st" + i, style: "plate", text, size: 30 }), 0, { grow: true }));
// 摊 1：门限表（wrap 0.7）+ 公章
const wM = wrapAt(L.MSIGD, 0.7);
put("msig", L.MSIGD, E5.thresholdMeter(L.MSIGD, { id: "msig", max: 5, th: 3, thText: "M/N", level: 0 }), 0, { wrap: wM.wrap });
for (const n of ["top", "center", "ground", "lamp", "th"]) if (A.msig[n]) A.msig[n] = wM.sc(A.msig[n]);
put("sealD", L.SEALD, O.seal(L.SEALD, { id: "sealD", stamped: false }));
// 摊 2：区块头账本 + 放大镜
put("hdr", L.HEADERS, O.ledgerBook(L.HEADERS, { id: "hdr", scale: 0.7 }));
put("mag", L.MAGD, O.magnifier(L.MAGD, { id: "mag" }));
// 摊 3：沙漏 + 挑战者 + 警报灯
put("hgD", L.HOURD, O.hourglass(L.HOURD, { id: "hgD" }));
put("chl", L.CHALLENGER, O.person(L.CHALLENGER, { id: "chl", role: "signer", scale: 0.6 }));
put("bcD", L.BEACOND, O.beacon(L.BEACOND, { id: "bcD" }));
// 摊 4：ZK 证明卡 + 电路板（wrap 0.6）+ 一本被划掉的账本（L14 长出）
put("zk", L.ZKPROOF, E2.proofCard(L.ZKPROOF, { id: "zk", text: "ZK 证明" }));
const wC = wrapAt(L.CURVE, 0.6);
put("zkc", L.CURVE, E2.curveBoard(L.CURVE, { id: "zkc" }), 0, { wrap: wC.wrap });
for (const n of ["top", "center", "ground", "board"]) if (A.zkc[n]) A.zkc[n] = wC.sc(A.zkc[n]);
const LBK = gp("dZk", 1250, 820);
put("lbk", LBK, O.ledgerBook(LBK, { id: "lbk", scale: 0.5 }), 0, { grow: true });
// 展台尽头：新实现 + 红色升级钥匙
put("core", L.COREM, E10.coreModule(L.COREM, { id: "core", ver: "新实现", scale: 0.6 }));
put("upk", L.UPKEY, O.key(L.UPKEY, { id: "upk", state: "attacker" }));
const CORE_TO = Wp(L.COREM.u - 250, L.COREM.v - 160);

// 原生 SVG：L8 区块头上一行红虚线框；L11 挡住挑战者的红杠；L14 账本上的红叉
const box = (cn, x0, y0, x1, y1) => { const [a0, b0] = P(cn, x0, y0), [a1, b1] = P(cn, x1, y1); return [a0, b0, a1 - a0, b1 - b0]; };
const [bx, by, bw, bh] = box("dLight", 812, 782, 944, 814);
add(L.HEADERS, S.hid("bad8", `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="rgba(224,69,58,0.12)" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/>`), 60);
const [rx, ry, rw, rh] = box("dOpt", 906, 712, 920, 866);
add(L.CHALLENGER, S.hid("bar11", `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="5" fill="#e0453a"/>`), 40);
const [kx, ky, kw2, kh] = box("dZk", 1185, 780, 1315, 860);
add(LBK, S.hid("lbk-x", `<path d="M${kx} ${ky}L${kx + kw2} ${ky + kh}M${kx + kw2} ${ky}L${kx} ${ky + kh}" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/>`), 60);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// 摊 1（dMulti）
lb("l2-th", P("dMulti", 770, 650), "凑够 3 个签名", "lab-gs lab-sm", "r");
lb("l3-who", P("dMulti", 1170, 470), "信任：签名人", "lab-cs", "l");
lb("l3-r0", P("dMulti", 1170, 560), "私钥泄露", "lab-rs lab-sm", "l");
lb("l3-r1", P("dMulti", 1170, 630), "验证者共谋", "lab-rs lab-sm", "l");
lb("l3-r2", P("dMulti", 1170, 700), "门限太低", "lab-rs lab-sm", "l");
lb("l4-ev", P("dMulti", 760, 470), "Ronin（2022）", "lab-r", "r");
// 摊 2（dLight）
lb("l6-hd", P("dLight", 760, 830), "A 链区块头", "lab-cs lab-sm", "r");
lb("l7-a", P("dLight", 1170, 470), "信任：A 链共识", "lab-cs", "l");
lb("l7-b", P("dLight", 1170, 545), "＋ 证明验证代码", "lab-cs", "l");
lb("l8-bad", P("dLight", 1170, 640), "代码有漏洞 → 证明可伪造", "lab-rs lab-sm", "l");
lb("l8-ev", P("dLight", 1170, 710), "BNB Chain Token Hub（2022）", "lab-r lab-sm", "l");
// 摊 3（dOpt）
lb("l10-hg", P("dOpt", 760, 690), "挑战期", "lab-cs lab-sm", "r");
lb("l10-fp", P("dOpt", 959, 722), "欺诈证明", "lab-rs lab-sm", "b");
lb("l11-ok", P("dOpt", 1170, 470), "一个诚实的挑战者就够", "lab-gs", "l");
lb("l11-r0", P("dOpt", 1170, 560), "没人盯着", "lab-r lab-sm", "l");
lb("l11-r1", P("dOpt", 1170, 630), "被审查", "lab-rs lab-sm", "l");
lb("l12-ru", P("dOpt", 1170, 720), "多数乐观 Rollup 原生桥", "lab-cs lab-sm", "l");
// 摊 4（dZk）
lb("l14-ok", P("dZk", 1170, 620), "数学证明 · 状态变化正确", "lab-gs lab-sm", "l");
lb("l14-no", P("dZk", 1250, 765), "不用逐条核对", "lab-r lab-sm", "b");
lb("l15-a", P("dZk", 1170, 400), "信任：数学", "lab-cs", "l");
lb("l15-b", P("dZk", 1170, 475), "＋ 证明系统实现 <span style=\"color:#e0453a\">?</span>", "lab-g", "l");
lb("l15-c", P("dZk", 1170, 545), "＋ 可信设置 <span style=\"color:#e0453a\">?</span>", "lab-g", "l");
lb("l15-bad", P("dZk", 1170, 620), "电路或验证器写错也会出事", "lab-rs lab-sm", "l");
// 展台尽头（upgrade）
lb("l16-br", P("upgrade", 217, 570), "桥合约 · ZK 验证", "lab-cs lab-sm", "b");
lb("l16-key", P("upgrade", 1015, 768), "升级权限", "lab-rs", "b");
lb("l16-nd", P("upgrade", 1125, 830), "无延迟", "lab-r lab-sm", "l");
lb("l18-by", P("upgrade", 220, 566), "绕过证明系统", "lab-rs lab-sm", "b");
lb("l19-two", P("upgrade", 640, 420), "证明系统 ＋ 升级权限", "lab-ink", "c");
lb("l20-m", P("upgrade", 1200, 340), "Mantle · OP Succinct 有效性证明", "lab-cs lab-sm", "l");
lb("l21-a", P("upgrade", 1200, 420), "工程多签 → 乐观模式", "lab-rs lab-sm", "l");
lb("l21-b", P("upgrade", 1200, 490), "安全多签 → 无延迟升级", "lab-rs lab-sm", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  kw("kw-who", "差别在于：你<b>信任谁</b>？", { x: 700, y: 140, size: 52 }) +
  codeCard("qz", { x: 1200, y: 300, w: 620, head: "再猜一道题", tag: "ZK 桥", rowHide: true, rows: [
    { html: "证明系统：完全正确 ✓" }, { html: "桥合约：多签可无延迟升级" }, { html: "用户只信数学？" }] }) +
  evt("ev-l2b", `L2BEAT 页面 · 截至 2026 年${gtag("第三方分析")}`) +
  kw("kw-end", "原生桥也是<b>跨链桥</b>", { x: 1180, y: 600, size: 48, accent: "#2aa3c9" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  diff: w("差别", 0), four: w("四种", 0),
  th: w("凑够", 2), pass: w("放行", 2),
  trust3: w("信任", 3), r0: w("私钥泄露", 3), r1: w("共谋", 3), r2: w("门限太低", 3),
  ronin: w("Ronin", 4),
  self6: w("自己验证", 6), hd6: w("区块头", 6),
  cons7: w("共识", 7), code7: w("证明验证代码", 7),
  bug8: w("漏洞", 8), bnb8: w("BNB", 8),
  ch10: w("挑战期", 10), fp10: w("欺诈证明", 10),
  hon11: w("诚实", 11), nobody11: w("没人盯着", 11), cen11: w("审查", 11),
  ru12: w("Rollup", 12),
  math14: w("数学", 14), ledger14: w("逐条核对", 14),
  m15: w("数学", 15), impl15: w("实现", 15), ts15: w("可信设置", 15), bad15: w("写错", 15),
  zk16: w("ZK", 16), up16: w("无延迟升级", 16),
  q17: w("数学", 17),
  no18: w("不是", 18), swap18: w("新实现", 18), by18: w("绕过", 18),
  both19: w("同时", 19),
  src20: w("L2BEAT", 20), m20: w("Mantle", 20),
  eng21: w("工程多签", 21), sec21: w("安全多签", 21),
  end22: w("跨链桥", 22),
};
const t = (x) => f(x);

S.build({
  cam0: "mintB", sub: "每种验证都在信任某个人",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "MPC", d: "多方各持一份密钥、合作签名", at: w("MPC", 1) },
    { id: "t1", t: "区块头", d: "区块的摘要，记着上一块和状态根", at: w("区块头", 6) },
    { id: "t2", t: "欺诈证明", d: "证明某个结果是错的、可推翻它", at: w("欺诈证明", 10) },
    { id: "t3", t: "Rollup", d: "链下执行、把结果交回主链的扩容方案", at: w("Rollup", 12) },
    { id: "t4", t: "可信设置", d: "生成证明系统公共参数的一次性仪式", at: w("可信设置", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 验证的方式，大致有四种。差别在于，你信任谁。 镜头 C → D 全景，四块摊名依次长出
      cam(${t(LS[0])}, "hallD", 1.6);
      [0, 1, 2, 3].forEach((i) => grow("st" + i, ${t(Math.max(TM.four, LS[0] + 1.2))} + i * 0.3, 0.5));
      pop("#kw-who", ${t(TM.diff)}); out("#kw-who", ${t(LS[1] - 0.2)});
      // ===== L1 第一种，外部多签，或者 MPC。 推到摊 1
      cam(${t(LS[1])}, "dMulti", 1.3);
      // ===== L2 一组验证者，凑够门限个签名，就放行。 液面升到 3/5，公章盖下
      X5.fill(tl, "msig", ${t(TM.th)}, 3, 1.0); pop("#l2-th", ${t(TM.th + 0.9)});
      KIT.stamp(tl, "sealD", ${t(TM.pass)});
      // ===== L3 你信任的是这些签名人。风险是私钥泄露，验证者共谋，或者门限太低。
      pop("#l3-who", ${t(TM.trust3)});
      pop("#l3-r0", ${t(TM.r0)}); pop("#l3-r1", ${t(TM.r1)}); pop("#l3-r2", ${t(TM.r2)});
      // ===== L4 Ronin 就是这一种。
      pop("#l4-ev", ${t(TM.ronin)}); bump("#l4-ev", ${t(TM.ronin + 0.5)}, 1.08, 1);
      out("#l2-th, #l3-who, #l3-r0, #l3-r1, #l3-r2, #l4-ev", ${t(LS[5] - 0.2)});
      // ===== L5 第二种，轻客户端，也叫原生证明。 推到摊 2
      cam(${t(LS[5])}, "dLight", 1.3);
      // ===== L6 B 链上的合约，自己验证 A 链的区块头和证明。 放大镜移到区块头上
      pop("#l6-hd", ${t(TM.hd6)});
      tl.to("#mag", { x: ${t(-200)}, y: ${t(150)}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.self6)});
      // ===== L7 你信任的是 A 链的共识，加上这段证明验证代码。
      pop("#l7-a", ${t(TM.cons7)}); pop("#l7-b", ${t(TM.code7)});
      // ===== L8 代码有漏洞，证明就能伪造。2022 年的 BNB Chain Token Hub，属于这一种。
      fadeIn("#bad8", ${t(TM.bug8)}, 0.3); flash("#bad8", ${t(TM.bug8 + 0.35)}, 2);
      pop("#l8-bad", ${t(TM.bug8 + 0.3)}); pop("#l8-ev", ${t(TM.bnb8)});
      out("#l6-hd, #l7-a, #l7-b, #l8-bad, #l8-ev, #bad8", ${t(LS[9] - 0.2)});
      // ===== L9 第三种，乐观证明。 推到摊 3
      cam(${t(LS[9])}, "dOpt", 1.3);
      // ===== L10 消息默认有效，但留出一段挑战期。这期间，任何人都可以提交欺诈证明推翻它。
      KIT.sand(tl, "hgD", ${t(TM.ch10)}, ${t(LS[12] - TM.ch10)}); pop("#l10-hg", ${t(TM.ch10)});
      pop("#l10-fp", ${t(TM.fp10)}); bump("#l10-fp", ${t(TM.fp10 + 0.5)}, 1.1, 1);
      // ===== L11 你只需要一个诚实的挑战者。风险是挑战期里没人盯着，或者挑战者被审查。
      out("#l10-fp", ${t(LS[11])}); pop("#l11-ok", ${t(TM.hon11)});
      tl.to("#chl", { opacity: 0.35, duration: 0.4 }, ${t(TM.nobody11)}); pop("#l11-r0", ${t(TM.nobody11)});
      fadeIn("#bar11", ${t(TM.cen11)}, 0.3); pop("#l11-r1", ${t(TM.cen11)});
      // ===== L12 多数乐观 Rollup 的原生桥，用的是这一种。
      tl.to("#chl", { opacity: 1, duration: 0.3 }, ${t(LS[12])});
      pop("#l12-ru", ${t(TM.ru12)});
      out("#l10-hg, #l11-ok, #l11-r0, #l11-r1, #l12-ru, #bar11", ${t(LS[13] - 0.2)});
      // ===== L13 第四种，零知识证明。 推到摊 4
      cam(${t(LS[13])}, "dZk", 1.3);
      // ===== L14 用数学证明 A 链的状态变化是正确的，不用逐条核对账本。 电路板画出，证明卡亮，账本被划掉
      KIT.drawPath(tl, "zkc-curve", ${t(TM.math14)}, 1.0); bump("#zk", ${t(TM.math14 + 0.9)}, 1.08, 1);
      pop("#l14-ok", ${t(TM.math14 + 1.0)});
      grow("lbk", ${t(TM.ledger14 - 0.6)}, 0.4); fadeIn("#lbk-x", ${t(TM.ledger14)}, 0.25); pop("#l14-no", ${t(TM.ledger14 + 0.2)});
      // ===== L15 你信任的是数学，加上证明系统的实现和可信设置。电路或验证器写错，一样会出事。
      out("#l14-ok", ${t(TM.m15 - 0.2)});
      pop("#l15-a", ${t(TM.m15)}); pop("#l15-b", ${t(TM.impl15)}); pop("#l15-c", ${t(TM.ts15)});
      pop("#l15-bad", ${t(TM.bad15)});
      out("#l14-no, #l15-a, #l15-b, #l15-c, #l15-bad, #lbk, #lbk-x", ${t(LS[16] - 0.2)});
      // ===== L16 再猜一道题。一座 ZK 桥，证明系统完全正确，但桥合约可以被一个多签无延迟升级。 镜头到展台尽头（段尾镜头）
      cam(${t(LS[16])}, "upgrade", 1.4);
      pop("#qz", ${t(LS[16] + 0.6)}); pop("#qz-r0", ${t(TM.zk16)}); pop("#l16-br", ${t(TM.zk16)});
      pop("#qz-r1", ${t(TM.up16 - 0.6)}); pop("#l16-key", ${t(TM.up16 - 0.4)}); bump("#upk", ${t(TM.up16)}, 1.12, 2);
      pop("#l16-nd", ${t(TM.up16 + 0.3)});
      // ===== L17 用户只需要信任数学吗？
      pop("#qz-r2", ${t(LS[17] + 0.2)});
      // ===== L18 不是。多签可以把桥合约换成新实现，绕过证明系统。 新实现推过去，证明卡淡出（关键画面）
      X10.push(tl, "core", ${t(TM.no18 + 0.3)}, [${t(CORE_TO[0])}, ${t(CORE_TO[1])}], 1.4);
      out("#zk, #l16-br", ${t(TM.swap18)}, 0.5); tl.to("#zkc", { opacity: 0.3, duration: 0.5 }, ${t(TM.swap18)}); pop("#l18-by", ${t(TM.by18)});
      X10.pull(tl, "core", ${t(TM.by18 + 0.4)});
      // ===== L19 用户同时信任证明系统，和升级权限的持有人。（关键画面）
      pop("#l19-two", ${t(TM.both19)}); bump("#l19-two", ${t(TM.both19 + 0.6)}, 1.06, 1);
      // ===== L20 按 L2BEAT 截至 2026 年的页面，Mantle 用的是 OP Succinct 有效性证明。
      out("#qz", ${t(LS[20] - 0.2)});
      pop("#ev-l2b", ${t(TM.src20)}); pop("#l20-m", ${t(TM.m20)});
      // ===== L21 但它的输出预言机，可以由工程多签切换到乐观模式。桥合约可以由安全多签无延迟升级。
      pop("#l21-a", ${t(TM.eng21)}); pop("#l21-b", ${t(TM.sec21)}); bump("#upk", ${t(TM.sec21 + 1.4)}, 1.1, 1);
      // ===== L22 L2 的原生桥，也是一座跨链桥。它的安全，取决于证明系统和升级权限两样。 段尾静止在 upgrade
      out("#ev-l2b, #l20-m, #l21-a, #l21-b", ${t(LS[22] - 0.2)});
      pop("#kw-end", ${t(TM.end22)}); bump("#l19-two", ${t(LS[22] + 2.6)}, 1.06, 1);
`,
});
