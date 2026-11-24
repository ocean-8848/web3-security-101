// ep12/seg6「⑥ 今天能做什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.valid（默认（请确认））。
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
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E4, E5, E7, E9, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// wrap helper (SEGBASE 常见坑 1): scale k around the ground point, optional lift (scale-1 px)
const wrapK = (o, k, lift = 0) => { const [gx, gy] = at(o); return (svg) => `<g transform="translate(${gx},${gy - lift}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; };
const P = (o) => at(o);

// ---------------------------------------------------------------- 世界物件
// F 交易所充值柜台（起点）
put("tel", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tel", scale: 0.8 }));
put("ledf", L.LEDGERF, O.ledgerBook(L.LEDGERF, { id: "ledf", scale: 0.8 }));
put("fake", L.FAKE, E7.oddCoin(L.FAKE, { id: "fake", scale: 0.8 }));
put("rtag", L.RTAGF, E7.returnTag(L.RTAGF, { id: "rtag", face: "ok" }));
put("chT", L.CHAINT, O.chain(L.CHAINT, { id: "chT", n: 3, title: "TRON", blockStates: ["normal", "attacker", "normal"] }));
put("idem", L.IDEM, E9.cheque(L.IDEM, { id: "idem", scale: 0.6, state: "filled", labels: ["交易哈希", "日志序号", "", "", ""] }));
put("confs", L.CONFS, O.hourglass(L.CONFS, { id: "confs" }));
// A 金库
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: 0.8, sign: "BRIDGE" }));
put("safeA", L.SAFE, O.safe(L.SAFE, { id: "safeA", gold: true }));
put("user", L.USER, O.person(L.USER, { id: "user", role: "signer", scale: 0.8 }));
put("chA", L.CHAINA, O.chain(L.CHAINA, { id: "chA", n: 4, title: "A 链" }));
put("msg", L.MSG, E9.cheque(L.MSG, { id: "msg", scale: 0.8, title: "消息", amount: "100",
  labels: ["用户", "金额", "序号", "源链", "目标链"], vals: ["0xU…", "100", "#7", "A", "B"], fields: ["blank", "blank", "blank", "blank", "blank"] }));
// B 桥与验证者平台
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", river: 170 }));
put("proof", L.BOOTH_PROOF, E2.proofCard(L.BOOTH_PROOF, { id: "proof" }), 2);
put("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 9, th: 5, thText: "5/9", level: 0 }));
put("rly", L.RELAYER, O.person(L.RELAYER, { id: "rly", role: "engineer", scale: 0.7 }));
L.VALID.forEach((q, i) => put("v" + i, q, O.person(q, { id: "v" + i, role: "signer", scale: 0.6 })));
L.VKEYS.forEach((q, i) => {
  add(q, wrapK(q, 0.4, q.lift)(O.key(q, { id: "k" + i }).svg), 3);
  if (i <= 4) add(q, S.hid("kr" + i, wrapK(q, 0.4, q.lift)(O.key(q, { id: "kr" + i + "o", state: "attacker" }).svg)), 4);
});
{ const [X0, Y0] = P(L.SMFRAME), q = L.EXT.smFrame;
  add(L.SMFRAME, `<rect id="smf" x="${X0 + q[0]}" y="${Y0 + q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" rx="18" fill="rgba(42,163,201,0.06)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10"/>`, -400); }
put("smp", L.SMPLATE, E1.signBoard(L.SMPLATE, { id: "smp", style: "plate", text: "Sky Mavis", size: 24 }));
put("axp", L.AXPLATE, E1.signBoard(L.AXPLATE, { id: "axp", style: "plate", text: "Axie DAO 授权", size: 24 }));
// 放大镜（L2 扫过平台）：整件包一层 #mgmv，GSAP 平移
const MGO = { u: L.VALID[3].u + 40, v: L.VALID[3].v + 260 };
add(MGO, S.hid("mgmv", O.magnifier(MGO, { id: "mg", z: 120 }).svg), 500);
// 信任边界竖幕（河面，沿 v）
{ const c = L.CURTAIN, pts = [Wp(c.u, c.v - 50, 0), Wp(c.u, c.v + 100, 0), Wp(c.u, c.v + 100, 250), Wp(c.u, c.v - 50, 250)];
  add(c, S.hid("curt", `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="rgba(42,163,201,0.16)" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="16 10"/>`), 600); }
// C 铸币与对账
put("mint", L.MINTB, E11.mintPress(L.MINTB, { id: "mint", scale: 0.8 }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal" }));
put("chB", L.CHAINB, O.chain(L.CHAINB, { id: "chB", n: 4, title: "B 链" }));
put("sw", L.SWITCH, O.knifeSwitch(L.SWITCH, { id: "sw" }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("que", L.QUEUE, E1.mempool(L.QUEUE, { id: "que", n: L.QLETTERS, sign: "延迟队列" }));
// D 四种验证展台
["多签 / MPC", "轻客户端", "乐观证明", "零知识证明"].forEach((t, i) => put("st" + i, L.STALLS[i], E1.signBoard(L.STALLS[i], { id: "st" + i, style: "plate", text: t, size: 30 })));
put("sealD", L.SEALD, O.seal(L.SEALD, { id: "sealD" }));
put("hdr", L.HEADERS, O.ledgerBook(L.HEADERS, { id: "hdr", scale: 0.7 }));
put("hourD", L.HOURD, O.hourglass(L.HOURD, { id: "hourD" }));
put("zkp", L.ZKPROOF, E2.proofCard(L.ZKPROOF, { id: "zkp", text: "ZK 证明" }));
put("upk", L.UPKEY, O.key(L.UPKEY, { id: "upk", state: "attacker" }));
// E 事故档案馆
{ const [X0, Y0] = P(L.WALL), q = L.EXT.wall;
  add(L.WALL, `<rect x="${X0 + q[0]}" y="${Y0 + q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" rx="10" fill="#f7f3ea" stroke="#cfc6b6" stroke-width="3"/>` +
    ["私钥", "验证逻辑", "初始化", "存款伪造"].map((t, i) => `<rect x="${X0 + q[0] + 60 + i * 290}" y="${Y0 + q[1] + 70}" width="230" height="120" rx="8" fill="#ebe4d6" stroke="#bfb4a0" stroke-width="2"/><text x="${X0 + q[0] + 175 + i * 290}" y="${Y0 + q[1] + 142}" font-size="34" font-weight="800" text-anchor="middle" fill="#6d685e">${t}</text>`).join(""), -300); }
put("mt", L.TREE, X.merkleTree(L.TREE, { id: "mt" }));
put("wsig", L.WSIG, E2.proofCard(L.WSIG, { id: "wsig", missing: true, text: "守护者签名" }));
put("sysacc", L.SYSACC, O.doc(L.SYSACC, { id: "sysacc", standing: true, title: "系统账户" }));
L.RPCS.forEach((q, i) => put("rpc" + i, q, O.rpc(q, { id: "rpc" + i })));
put("valE", L.VALIDE, O.person(L.VALIDE, { id: "valE", role: "engineer", scale: 0.7 }));
// 全景绿色地光（每区一片，L8 亮起）
Object.entries(L.ZONE_RECTS).forEach(([k, R]) => {
  const x0 = Math.min(...R.map((r) => r[0])), x1 = Math.max(...R.map((r) => r[2])), y1 = Math.max(...R.map((r) => r[3]));
  const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2 + 40, ry = rx * 0.28, cy = y1 - ry * 0.6;
  add({ u: 0, v: 0 }, S.hid("gl" + k, `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(31,157,85,0.16)" stroke="#1f9d55" stroke-width="4" stroke-dasharray="18 12"/>`), -100000);
});

// ---------------------------------------------------------------- 世界标签
lb("lb-tel", up(A.tel.top, 8), "交易所充值", "lab-ink");
lb("lb-confs", up(A.confs.top, 8), "确认数", "lab-cs lab-sm");
lb("lb-vm", up(A.vm.top, 8), "桥合约 · A 链", "lab-ink");
lb("lb-msg", up(A.msg.top, 10), "消息", "lab-cs lab-sm");
lb("lb-hash", up(A.msg.top, 70), "全部字段 → 消息哈希", "lab-g");
{ const [X0, Y0] = P(L.SMFRAME), q = L.EXT.smFrame;
  lb("lb-gsky", [X0 + (q[0] + q[2]) / 2, Y0 + q[1] - 8], "4 把钥匙 · 1 个组织", "lab-cs lab-sm");
  lb("lb-indep", [X0 + (q[0] + q[2]) / 2, Y0 + q[1] - 8], "签名人不独立", "lab-r");
}
lb("lb-gax", up(P(L.VALID[4]), 190), "1 把", "lab-cs lab-sm");
lb("lb-goth", up(P(L.VALID[8]), 190), "其他 4 把", "lab-cs lab-sm");
lb("lb-revoke", up(A.axp.top, 6), "本应撤销", "lab-r lab-sm");
lb("lb-live", up(A.axp.top, 64), `<span class="stamp">仍在生效</span>`, "", "b");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 1180, y: 300, w: 680 };
const CU = { x: 1180, y: 310, w: 680 };
const html =
  ck("role1", "写桥的人", { x: 760, y: 380, w: 400, kind: "c", icon: "1" }) +
  ck("role2", "审计的人", { x: 760, y: 470, w: 400, kind: "c", icon: "2" }) +
  ck("role3", "普通用户", { x: 760, y: 560, w: 400, kind: "c", icon: "3" }) +
  kw("kw-r1", "<b>写桥的人</b>", { x: 56, y: 120, size: 40, accent: "#1d93ba" }) +
  kw("kw-r2", "<b>审计的人</b>", { x: 58, y: 122, size: 40, accent: "#1d93ba" }) +
  kw("kw-r3", "<b>普通用户</b>", { x: 60, y: 124, size: 40, accent: "#1d93ba" }) +
  codeCard("ca", { ...CA, head: "消息哈希", tag: "示意", mono: true, rows: [
    { html: "hash(srcChain, dstChain,", chip: "全写进", chipCls: "ok" }, "     srcBridge, dstBridge,", "     nonce, user, amount)"] }) +
  codeCard("cu", { ...CU, head: "跨链前先看", rows: [
    { html: "验证方式：多签 / 轻客户端 / 乐观 / ZK" }, { html: "风险列表", chip: "L2BEAT", chipCls: "" }] }) +
  ck("ck1", "官方入口", { x: 1180, y: 520, w: 560 }) +
  ck("ck2", "核对代币合约地址", { x: 1180, y: 600, w: 560 }) +
  ck("ck3", "用完换回原生资产", { x: 1180, y: 680, w: 560 }) +
  kw("kw-sum", `攻破 <b>N</b> 个独立组织 → 放行`, { x: 640, y: 780, size: 40, accent: "#e0453a" }) +
  evt("ev-ronin", "Ronin 跨链桥 · 9 个验证者") +
  kw("kw-q", "最少攻破几个组织？", { x: 642, y: 782, size: 44 }) +
  kw("kw-two", `<b>2</b> 个组织${gtag("解读")}`, { x: 644, y: 772, size: 56, accent: "#e0453a" }) +
  kw("kw-pre", `前提：授权<b>仍在生效</b>${gtag("成立条件")}`, { x: 646, y: 786, size: 40, accent: "#e0453a" }) +
  kw("kw-b", `<b>B 链</b>凭什么相信`, { x: 640, y: 112, size: 60, accent: "#1d93ba" });
const css = `
    .stamp { display: inline-block; font-size: 26px; font-weight: 900; color: #6d685e; border: 4px solid #8a8478; border-radius: 8px; padding: 2px 12px; background: rgba(235,230,220,0.92); transform: rotate(-8deg); }
`;
S.curve("cv-a", [CA.x - 4, codeRowY(CA.y, 0)], S.scr("bankA", A.msg.top), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻
const TM = {
  src: w("源链", 1), dst: w("目标链", 1), both: w("两侧合约", 1), nonce: w("序号", 1), all: w("全部写进", 1),
  list: w("列出", 2), count: w("算一算", 2), pass: w("放行", 2),
  how: w("靠什么验证", 3), l2: w("会列出", 3),
  off: w("官方入口", 4), chk: w("核对", 4), hold: w("不要长期", 4),
  q: w("几个组织", 5),
  two: w("两个", 6), th: w("门限", 6), indep: w("并不独立", 6),
  rev: w("本应撤销", 7), live: w("仍在生效", 7),
  why: w("凭什么相信", 8), cheat: w("被骗走", 8),
};
const t = (x) => f(x);

S.build({
  cam0: "cexTag", sub: "B 链凭什么相信",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],
  shown: ["#lb-tel", "#lb-confs"], css, html,
  terms: [],
  end: { title: "跨链桥安全", line: "桥的安全，就是 B 链凭什么相信", next: "非 EVM 生态的安全", at: LS[9], nextAt: w("下一集", 9) },
  js: `
      // ===== L0 每个人，今天能做一件事 → F 全景 + 三张角色卡
      cam(${t(LS[0] - 0.1)}, "cexF", 1.2); out("#lb-tel, #lb-confs", ${t(LS[0] + 0.2)});
      ["#role1", "#role2", "#role3"].forEach((s, i) => pop(s, ${t(LS[0] + 0.5)} + i * 0.3, 0.25));
      // ===== L1 写桥的人 → 横移回 A，代码卡第 1 行连到消息，字段逐格变绿
      out("#role1, #role2, #role3", ${t(LS[1] - 0.2)});
      cam(${t(LS[1])}, "bankA", 1.8);
      pop("#kw-r1", ${t(LS[1] + 0.2)}); pop("#lb-vm", ${t(LS[1] + 1.6)}); pop("#lb-msg", ${t(LS[1] + 1.8)});
      pop("#ca", ${t(LS[1] + 1.9)}); draw("cv-a", ${t(TM.src)}); hot("#ca-r0", ${t(TM.src)});
      X9.field(tl, "msg", ${t(TM.src)}, 3, "filled"); X9.field(tl, "msg", ${t(TM.dst)}, 4, "filled");
      X9.field(tl, "msg", ${t(TM.nonce)}, 2, "filled");
      X9.fields(tl, "msg", ${t(TM.all)}, ["filled", "filled", null, null, null], 0.25);
      pop("#ca-c0", ${t(TM.all + 0.3)}); out("#lb-msg", ${t(TM.all + 0.2)}, 0.2); pop("#lb-hash", ${t(TM.all + 0.5)});
      // ===== L2 审计的人 → B 平台，放大镜扫过，每组出数字
      out("#kw-r1, #ca, #cv-a, #lb-vm, #lb-hash", ${t(LS[2] - 0.2)});
      cam(${t(LS[2])}, "valid", 1.6);
      pop("#kw-r2", ${t(LS[2] + 0.2)});
      fadeIn("#mgmv", ${t(TM.list - 0.2)}, 0.3);
      tl.fromTo("#mgmv", { x: -320 }, { x: 260, duration: 2.6, ease: "sine.inOut" }, ${t(TM.list - 0.2)});
      pop("#lb-gsky", ${t(TM.list + 0.4)}); pop("#lb-gax", ${t(TM.list + 1.0)}); pop("#lb-goth", ${t(TM.list + 1.6)});
      out("#mgmv", ${t(TM.list + 2.5)}, 0.3);
      pop("#kw-sum", ${t(TM.count)});
      // ===== L3 普通用户 → F，看验证方式，L2BEAT
      out("#kw-r2, #lb-gsky, #lb-gax, #lb-goth, #kw-sum", ${t(LS[3] - 0.2)});
      cam(${t(LS[3])}, "cexF", 1.8);
      pop("#kw-r3", ${t(LS[3] + 0.2)});
      pop("#cu", ${t(TM.how)}); pop("#cu-c1", ${t(TM.l2)});
      // ===== L4 三行清单依次打勾
      pop("#ck1", ${t(TM.off)}); pop("#ck2", ${t(TM.chk)}); bump("#fake", ${t(TM.chk + 0.2)}, 1.08, 1);
      pop("#ck3", ${t(TM.hold)});
      // ===== L5 回到开头 → B 平台，事件卡复现
      out("#kw-r3, #cu, #ck1, #ck2, #ck3", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "valid", 1.8);
      pop("#ev-ronin", ${t(LS[5] + 0.6)}); pop("#kw-q", ${t(TM.q - 0.3)});
      // ===== L6 两个，签名人不独立（关键画面）
      out("#kw-q", ${t(LS[6] - 0.15)}, 0.15);
      pop("#kw-two", ${t(TM.two)});
      tl.to(["#v5", "#v6", "#v7", "#v8", "#k5", "#k6", "#k7", "#k8"].join(", "), { opacity: 0.3, duration: 0.4 }, ${t(TM.two + 0.1)});
      flash("#smf", ${t(TM.two + 0.1)}, 2, 0.3); bump("#axp", ${t(TM.two + 0.2)}, 1.06, 1);
      ["#kr0", "#kr1", "#kr2", "#kr3", "#kr4"].forEach((s, i) => fadeIn(s, ${t(TM.two + 0.3)} + i * 0.12, 0.3));
      X5.fill(tl, "mtr", ${t(TM.th)}, 5, 0.9);
      pop("#lb-indep", ${t(TM.indep)});
      // ===== L7 前提：本应撤销的授权仍在生效（关键画面）
      out("#kw-two", ${t(LS[7] - 0.15)}, 0.15);
      pop("#lb-revoke", ${t(TM.rev)}); pop("#lb-live", ${t(TM.live)}, 0.3); pop("#kw-pre", ${t(LS[7] + 0.2)});
      // ===== L8 拉远到全景，六区绿色地光 + 信任边界竖幕
      out("#ev-ronin, #kw-pre, #lb-indep, #lb-revoke, #lb-live", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "world", 2.2);
      ["#glA", "#glB", "#glC", "#glD", "#glE", "#glF"].forEach((s, i) => fadeIn(s, ${t(LS[8] + 1.6)} + i * 0.12, 0.5));
      fadeIn("#curt", ${t(TM.why)}, 0.5); pop("#kw-b", ${t(TM.why)});
      flash("#curt", ${t(TM.cheat)}, 2, 0.4);
      // ===== L9 下一集 → 结束卡（segbase），静止在 CAMS.world
      out("#kw-b", ${t(LS[9] - 0.2)});
`,
});
