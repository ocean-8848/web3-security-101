// ep12/seg1「① 九个验证者」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.valid；ends static on CAMS.bridge
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
const V = L.VALID, V0 = V[0];
const P = (u, v, z = 0) => Wp(u, v, z);
const poly = (pp) => pp.map((q) => q.map((x) => Math.round(x)).join(",")).join(" ");
const quad = (u0, u1, v0, v1) => poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
const ring = (o, r) => poly(Array.from({ length: 24 }, (_, k) => P(o.u + r * Math.cos(k * Math.PI / 12), o.v + r * Math.sin(k * Math.PI / 12))));
const BACK = { u: V0.u + 900, v: V0.v - 900 };            // 地面层：排在所有立体物件之前
// 木平台 + Sky Mavis 虚线框（地面）+ 过半数虚线圈
add(BACK, `<polygon points="${quad(V0.u - 150, V0.u + 630, V0.v - 130, V0.v + 540)}" fill="#dcc7a2" stroke="#a88b5e" stroke-width="2"/>` +
  [1, 2, 3].map((k) => `<line x1="${P(V0.u - 150 + 195 * k, V0.v - 130)[0]}" y1="${P(V0.u - 150 + 195 * k, V0.v - 130)[1]}" x2="${P(V0.u - 150 + 195 * k, V0.v + 540)[0]}" y2="${P(V0.u - 150 + 195 * k, V0.v + 540)[1]}" stroke="#bfa57a" stroke-width="1.5"/>`).join(""));
add(BACK, S.hid("smf", `<polygon points="${quad(V0.u - 115, V0.u + 355, V0.v - 105, V0.v + 305)}" fill="rgba(42,163,201,.10)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9"/>`), 1);
const MAJ = [1, 4, 5, 6, 7];
add(BACK, S.hid("maj", MAJ.map((i) => `<polygon points="${ring(V[i], 62)}" fill="none" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="9 7"/>`).join("")), 2);
// 验证者 ×9 + 头顶钥匙（青蓝 / 红两层，包一层缩到 0.4）
const keyWrap = (gid, q, op) => (svg) => { const [gx, gy] = at(q); return `<g id="${gid}" opacity="${op}"><g transform="translate(0,${-q.lift}) translate(${gx},${gy}) scale(${q.scale}) translate(${-gx},${-gy})">${svg}</g></g>`; };
V.forEach((q, i) => {
  put("v" + i, q, O.person(q, { id: "v" + i, role: "signer", scale: q.scale }), 0, { grow: true });
  const k = L.VKEYS[i];
  put("kn" + i, k, O.key(k, { id: "knk" + i, stand: true }), 1, { wrap: keyWrap("kn" + i, k, 0) });
  put("kr" + i, k, O.key(k, { id: "krk" + i, stand: true, state: "attacker" }), 2, { wrap: keyWrap("kr" + i, k, 0) });
});
put("smp", L.SMPLATE, E1.signBoard(L.SMPLATE, { id: "smp", style: "plate", text: "Sky Mavis", size: 24 }), 0, { grow: true });
put("axp", L.AXPLATE, E1.signBoard(L.AXPLATE, { id: "axp", style: "plate", text: "Axie DAO 授权", size: 24 }), 0, { grow: true });
// 桥 + 门限表（正常 / 红两层）
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", river: 170 }));
put("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 9, th: 5, thText: "5/9" }));
put("mtrR", L.METER, E5.thresholdMeter(L.METER, { id: "mtrR", max: 9, th: 5, thText: "5/9", level: 5, state: "attacker" }), 1, { wrap: (svg) => S.hid("mtrRw", svg) });
// 两封攻击者信封：从近岸桥头过桥
const NR = G(...A.br.nearRoad);
["lt0", "lt1"].forEach((id) => put(id, NR, E1.letter(NR, { id, state: "attacker" }), 30, { wrap: (svg) => S.hid(id + "w", svg) }));
// 信任边界：河面上沿 v 的青蓝虚线竖幕
const CU = L.CURTAIN, cuv = 170, cuz = 240;
add({ u: CU.u, v: CU.v + 60 }, S.hid("curt", `<polygon points="${poly([P(CU.u, CU.v - cuv), P(CU.u, CU.v + cuv), P(CU.u, CU.v + cuv, cuz), P(CU.u, CU.v - cuv, cuz)])}" fill="rgba(42,163,201,.16)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="16 10"/>`));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-2tx", up(A.br.top, 30), "2 笔交易", "lab-rs");
lb("lb-9", P(V0.u - 170, V0.v + 380), "9 个验证者", "lab-cs", "r");
lb("lb-maj", up(P(V[3].u, V[3].v), 250), "过半数？", "lab-ink");
lb("lb-ax", ((q) => [q[0] + 118, q[1] - 175])(at(L.AXPLATE)), "<s>本应撤销</s>", "lab-r lab-sm", "l");
lb("lb-trust", up(P(CU.u, CU.v - cuv, cuz), 20), "凭什么相信？", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 540, y: 110, w: 660 };
const SMTOP = S.scr("valid", P(V0.u + 120, V0.v - 105));
S.curve("cv0", [C.x + C.w + 4, codeRowY(C.y, 0)], S.scr("valid", up(A.mtr.th ?? A.mtr.top, 0)), { color: "#e0453a" });
S.curve("cv1", [C.x + 200, C.y + 210], SMTOP, { color: "#e0453a" });
const html =
  evt("ev0", `<b>Ronin 跨链桥</b> · 2022 年 3 月 23 日<br>约 17.36 万枚 ETH + 约 2550 万枚 USDC<div id="ev0-loss" style="opacity:0">损失约 6.2 亿美元 ${gtag("公开报道口径")}</div>`, { color: "#e0453a" }) +
  evt("ev-src", `来源 · Ronin 复盘 · Elliptic 分析`, { top: 300 }) +
  codeCard("cb", { ...C, head: "门限签名", tag: "示意", mono: true, rowHide: true,
    rows: [`require(validSigs >= 5);  <span class="cm">// 9 选 5</span>`, `<span class="cm">// 缺：签名人来自不同组织？</span>`] }) +
  kw("kw-q", `先猜<span id="kw-q2" style="opacity:0"> · 最少攻破<b>几个组织？</b></span>`, { x: 56, y: 120 }) +
  kw("kw-2", `<b>2</b>`, { x: 120, y: 330, size: 150, accent: "#e0453a" }) +
  kw("kw-def", `<b>5/9</b> → 2 道防线 ${gtag("解读")}`, { x: 56, y: 128, accent: "#e0453a" });
const css = `#cb .cm { color: #8a8378; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const kp = (i) => at(L.VKEYS[i]).map((x, j) => j ? x - L.VKEYS[i].lift : x);
const BT = up(at(L.BOOTH), 110);
const FLY = [0, 1, 2, 3, 4].map((i) => [BT[0] - kp(i)[0] + (i - 2) * 22, BT[1] - kp(i)[1]].map((x) => Math.round(x)));
const TM = { sky: w("Sky Mavis", 6), ax: w("Axie DAO", 7), rev: w("撤销", 7), ans: w("两个", 9), two: w("两道", 10), ctl: w("控制", 11), loss: w("6.2", 12) };
const t = (x) => f(x);

S.build({
  cam0: "valid", sub: "门限五个，防线两道",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "验证者", d: "替桥核对消息并签名放行的节点", at: w("验证者", 2) },
    { id: "t1", t: "门限", d: "放行所需的最少签名数", at: LS[3] + 0.4 },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 事件卡 + 来源卡；镜头移到桥全景
      pop("#ev0", ${t(LS[0] + 0.4)}); pop("#ev-src", ${t(LS[0] + 1.8)});
      cam(${t(LS[0] + 3.2)}, "bridge", 4.8, "power1.inOut");
      // ===== L1 两封红信封过桥
      ["lt0", "lt1"].forEach((id, k) => { fadeIn("#" + id + "w", ${t(LS[1])} + k * 0.45, 0.2); X1.walk(tl, id, ${t(LS[1] + 0.1)} + k * 0.45, 1.3, ${JSON.stringify(A.br.deck)}); out("#" + id + "w", ${t(LS[1] + 1.6)} + k * 0.45, 0.25); });
      pop("#lb-2tx", ${t(LS[1] + 0.5)});
      // ===== L2 回到平台：9 人逐个长出，头顶钥匙亮
      out("#ev0, #ev-src, #lb-2tx", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "valid", 1.2);
      for (let i = 0; i < 9; i++) { grow("v" + i, ${t(LS[2] + 0.5)} + i * 0.13); fadeIn("#kn" + i, ${t(LS[2] + 0.75)} + i * 0.13, 0.25); }
      pop("#lb-9", ${t(LS[2] + 1.0)});
      // ===== L3 门限表升到 5 线，代码卡第 1 行连到表
      X5.fill(tl, "mtr", ${t(LS[3] + 0.3)}, 5, 1.4);
      pop("#cb", ${t(LS[3] + 0.6)}); pop("#cb-r0", ${t(LS[3] + 0.8)}); draw("cv0", ${t(LS[3] + 1.2)});
      // ===== L4 5 个人一圈虚线：过半数？
      out("#cv0, #cb", ${t(LS[4] - 0.2)}); out("#lb-9", ${t(LS[4] - 0.2)});
      fadeIn("#maj", ${t(LS[4] + 0.3)}, 0.4); pop("#lb-maj", ${t(LS[4] + 0.6)});
      // ===== L5 先猜（门限表回落）
      out("#maj, #lb-maj", ${t(LS[5] - 0.2)}); X5.fill(tl, "mtr", ${t(LS[5])}, 0, 0.6);
      pop("#kw-q", ${t(LS[5] + 0.1)});
      // ===== L6 4 人进 Sky Mavis 虚线框，牌子落下
      fadeIn("#smf", ${t(TM.sky - 0.2)}, 0.5); grow("smp", ${t(TM.sky)}); [0, 1, 2, 3].forEach((i) => bump("#v" + i, ${t(TM.sky + 0.6)}, 1.08, 1));
      // ===== L7 第 5 人背后亮起 Axie DAO 授权，小签"本应撤销"
      grow("axp", ${t(TM.ax)}); bump("#v4", ${t(TM.ax + 0.5)}, 1.08, 1); pop("#lb-ax", ${t(TM.rev)});
      // ===== L8 几个组织？
      fadeIn("#kw-q2", ${t(LS[8] + 0.2)}, 0.35);
      // ===== L9 答案 2：两组钥匙同时变红，门限表一口气升到 5 线变红
      out("#kw-q", ${t(LS[9] - 0.2)});
      [0, 1, 2, 3, 4].forEach((i) => { fadeIn("#kr" + i, ${t(TM.ans)}, 0.3); out("#kn" + i, ${t(TM.ans)}, 0.3); });
      X5.fill(tl, "mtr", ${t(TM.ans)}, 5, 0.6); fadeIn("#mtrRw", ${t(TM.ans + 0.6)}, 0.3);
      pop("#kw-2", ${t(TM.ans)});
      // ===== L10 5/9 → 2 道防线；代码卡第 2 行连到 Sky Mavis 框
      out("#kw-2", ${t(LS[10] - 0.1)});
      pop("#cb", ${t(LS[10] + 0.2)}); pop("#cb-r1", ${t(LS[10] + 0.5)}); draw("cv1", ${t(LS[10] + 0.9)});
      pop("#kw-def", ${t(LS[10] + 1.3)});
      // ===== L11 5 把红钥匙飞到岗亭，岗亭被攻破；来源卡
      out("#cb, #cv1, #kw-def, #lb-ax", ${t(LS[11] - 0.2)});
      ${JSON.stringify(FLY)}.forEach((d, i) => X5.fly(tl, "kr" + i, ${t(TM.ctl)} + i * 0.12, d[0], d[1], 1.0, 60));
      KIT.broke(tl, "br-booth", ${t(TM.ctl + 1.5)}, { badge: false });
      pop("#ev-src", ${t(LS[11] + 0.3)});
      // ===== L12 事件卡追加损失
      out("#ev-src", ${t(LS[12] - 0.2)}); pop("#ev0", ${t(LS[12])}); fadeIn("#ev0-loss", ${t(LS[12] + 0.3)}, 0.3);
      // ===== L13 拉到桥全景，信任边界竖幕：凭什么相信？
      out("#ev0", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "bridge", 1.4); fadeIn("#curt", ${t(LS[13] + 1.0)}, 0.6); pop("#lb-trust", ${t(LS[13] + 1.5)});
`,
});
