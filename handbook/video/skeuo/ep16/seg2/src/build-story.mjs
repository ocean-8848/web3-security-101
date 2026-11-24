// ep16/seg2「② 先问控制了什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.deskA（BRIEF）。ends static on CAMS.resourceB
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   upgradeA     ---- A
//   deskA        近景：入账台 + 信号柱 + 检查点 + 告警灯（seg1 L6–L11 终点；seg2 起点；seg6 L1–L5、L10–L11）
//   chainA       近景：主链 + 扳道器 + 信号柱（seg2 L0–L4 主链与分叉示意）
//   A            A 全区
//   notaryB      ---- B
//   resourceB    B 资源分类板 + 沙漏 + 攻击者 + 印章（seg2 L12–L17 终点；seg3 起点）
//   B            
//   mineC        ---- C
//   forkC        近景：两条链 + 扳道器 + 矿机（seg3 L1–L5、L17–L21）
//   countC       近景：确认数计数器 + 沙漏 + 公开链尾（seg3 L6–L12）
//   dotsC        近景：点阵两簇 + 租来的矿机（seg3 L13–L16）
//   deskC        近景：入账台 + 重组告警 + 私下链尾（seg3 L22–L23 终点；seg4 起点）
//   gateD        ---- D
//   clientD      近景：三台客户端机柜 + 投票表（seg4 L3–L6）
//   shareD       近景：四块份额牌阶梯（seg4 L10–L14）
//   rangeD       近景：改写的历史 + 主链 + 旧私钥 + 新节点 + 两份检查点 + 放大镜（seg4 L15–L21 终点；seg5 起点）
//   D            
//   haltE        ---- E
//   seqE         近景：排序器 + 信封 + 信号柱 + L1 + 入账台（seg5 L9–L16）
//   voteE        近景：托管保险柜 + 见证人投票箱 + 手机（seg5 L17–L21 终点；seg6 起点、L6–L7）
//   E            
//   wide         ---- 全景：链上小镇五个区（seg6 L0、L12 → 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// wrap helper (SEGBASE 常见坑 1): objects without opts.scale, scaled around their ground point, anchors rescaled
const wput = (key, o, mk, k) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, mk, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = sc(v); }
};
// ---- A 升级机房（seg1 收尾时的状态：机柜红灯、参与率约 75%、信号柱亮到 finalized）
put("rkA", L.RACKA, O.rack(L.RACKA, { id: "rkA", tag: "Prysm", leds: ["red", "red", "green"] }));
wput("tmA", L.METERA, E5.thresholdMeter(L.METERA, { id: "tmA", max: 4, th: 2.67, level: 3, thText: "2/3" }), 0.8);
put("ch", L.CHAINA, O.chain(L.CHAINA, { id: "ch", n: 4 }));
// 分叉：扳道器立在 b1 与 b2 之间的前方，新分支（2 块）在 b2/b3 前方
const bu = (i) => L.CHAINA.u + (i - 1.5) * 180;
const FK = { u: bu(1) + 70, v: L.CHAINA.v + 150 };
const NB = { u: bu(2) + 150, v: L.CHAINA.v + 230 };
put("fsw", FK, X.forkSwitch(FK, { id: "fsw" }), 0, { grow: true });
const ENV = { u: bu(3), v: L.CHAINA.v, z: 100 };
put("envA", ENV, E1.letter(ENV, { id: "envA", z: 100 }));
put("dk", L.DESKA, E7.dispatchDesk(L.DESKA, { id: "dk", scale: 0.8, entries: ["已确认 ✓", "已确认 ✓"], shown: 2 }));
put("sgA", L.FSIGA, X.finalitySignal(L.FSIGA, { id: "sgA" }));
wput("cpA", L.CKPTA, O.checkpoint(L.CKPTA, { id: "cpA", n: "检查点" }), 0.7);
put("bcA", L.BEACONA, O.beacon(L.BEACONA, { id: "bcA" }));
// ---- B 公证处
put("sgnB", L.SIGNB, E1.signBoard(L.SIGNB, { id: "sgnB", style: "plate", text: "比喻 · 公证处" }));
const CT2 = { u: L.CONTRACT.u + 200, v: L.CONTRACT.v - 60 };
put("ct2", CT2, O.doc(CT2, { id: "ct2", standing: true, state: "attacker", title: "房产买卖合同" }), 0, { grow: true });
put("ct", L.CONTRACT, O.doc(L.CONTRACT, { id: "ct", standing: true, title: "房产买卖合同" }));
put("sl", L.SEALB, O.seal(L.SEALB, { id: "sl", markText: "公证", stamped: false }));
L.NOTARIES.forEach((q, i) => put("nt" + i, q, O.person(q, { id: "nt" + i, role: "signer", scale: q.scale })));
[2, 3, 4].forEach((i) => { const q = L.NOTARIES[i]; put("nr" + i, q, O.person(q, { id: "nr" + i, role: "attacker", scale: q.scale })); });
put("atk", L.ATKB, O.person(L.ATKB, { id: "atk", role: "attacker", scale: L.ATKB.scale }));
put("hg", L.HOURB, O.hourglass(L.HOURB, { id: "hg" }));
put("rb", L.ROLES, E5.roleBoard(L.ROLES, { id: "rb", hooks: 6, mode: "keys", title: "WHAT IS CONTROLLED", empty: [0, 1, 2, 3, 4, 5] }));
// 开场隐藏的世界件
const H0 = ["#nr2", "#nr3", "#nr4"];
put("nb", NB, O.chain(NB, { id: "nb", n: 2, labels: ["#3'", "#4'"] }), 0, { grow: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// 红叉（原生 SVG，S.hid 默认透明）
const xMark = (cx, cy, r, sw = 7) => `<path d="M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}" stroke="#e0453a" stroke-width="${sw}" stroke-linecap="round"/>`;
{ const [ex, ey] = A.envA.center; add(ENV, S.hid("envx", xMark(ex, ey - 40, 22, 6)), 80); }
{ const [x0, y0, x1, y1] = L.rect(L.CONTRACT, "docStanding");
  add(L.CONTRACT, S.hid("ctx", `<rect x="${x0 - 8}" y="${y0 - 8}" width="${x1 - x0 + 16}" height="${y1 - y0 + 16}" rx="8" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>` + xMark((x0 + x1) / 2, (y0 + y1) / 2 - 10, 46, 9)), 60); }
// A
lb("lb-cons", up(A.ch.top, 46), "共识 = 就<b>哪条链正确</b>达成一致", "lab-ink");
lb("lb-reorg", up(A.fsw.top, 10), "重组 · 扳到另一条链", "lab-r lab-sm");
lb("lb-env", up(A.envA.top, 70), "已确认的交易 · 消失", "lab-r lab-sm");
lb("lb-dk", up(A.dk.top, 10), "交易所：已确认", "lab-cs lab-sm");
lb("lb-bet", [A.dk.top[0] + 150, A.dk.top[1] - 34], `<span class="bet">赌注</span>`, "lab-bet", "l");
// B
lb("lb-nt", up(A.nt2.top, 12), "公证员 ×5", "lab-ink lab-sm");
lb("lb-ct", up(A.ct.top, 8), "房产买卖合同", "lab-ink lab-sm");
lb("lb-atk", up(A.atk.top, 10), "临时雇来 3 / 5", "lab-r lab-sm");
lb("lb-ct2", [A.ct2.top[0] + 80, A.ct2.top[1] + 70], "同一套房 · 第二份", "lab-r lab-sm", "l");
lb("lb-hg", up(A.hg.top, 10), "算力按小时租", "lab-cs lab-sm");
lb("lb-rb", up(A.rb.top, 8), "攻击者控制了什么", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
const RES = ["身份与连接", "算力", "单个区块时机", "权益或旧私钥", "别人的动机", "停链份额"];
const SHD = `<svg width="34" height="38" viewBox="0 0 34 38"><path d="M17 2L31 7V18C31 28 24 34 17 36C10 34 3 28 3 18V7Z" fill="#1f9d55"/><path d="M10 19l5 5l9-10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const html =
  RES.map((r, i) => ck("rs" + i, `${r}<span class="shd hide" id="shd${i}">${SHD}</span>`, { x: 1500, y: 236 + i * 84, w: 350, kind: "c", icon: String(i + 1) })).join("") +
  kw("kw-ds", `<b>双花</b> = 同一笔资产花两次`, { x: 960, y: 112 }) +
  kw("kw-yr", `现实：雇公证员要<b>很多年</b>${gtag("比喻")}`, { x: 990, y: 118, accent: "#e0453a" }) +
  kw("kw-51", `51% 攻击？<span class="x51 hide" id="x51">✕</span>`, { x: 1080, y: 124, size: 60 });
const css = `
  .sb-ck[id^="rs"] { font-size: 30px; }
  .sb-ck[id^="rs"] .shd { margin-left: auto; display: inline-flex; }
  .sb-ck[id^="rs"] .sb-ck-t { display: flex; align-items: center; flex: 1; }
  #kw-51 { position: absolute; }
  .x51 { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -54%); font-size: 150px; line-height: 1; color: #e0453a; font-weight: 900; }
  .lab-bet { background: transparent; border: none; box-shadow: none; padding: 0; }
  .lab-bet .bet { display: inline-block; transform: rotate(-12deg); border: 5px solid #8a857b; color: #6d685e; background: rgba(239,235,227,0.92); border-radius: 10px; padding: 2px 16px; font-size: 34px; font-weight: 900; letter-spacing: 6px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  flip: w("改为接受", 2), lost: w("消失", 3), bet: w("赌注", 4), stamp: w("签字", 6), hire: w("半数以上", 7),
  voidc: w("作废", 8), resell: w("同一套房", 8), ds: w("双花", 9), hour: w("按小时租", 11), a51: w("攻击", 12, 1),
  ask: w("控制了什么", 14), k: [w("身份", 15), w("算力", 15), w("时机", 15), w("权益", 16), w("动机", 16), w("份额", 16)],
};
const t = (x) => f(x);

S.build({
  cam0: "deskA", sub: "已确认，只是对安全假设的赌注",
  grid: { u0: -2200, u1: 4800, v0: -2500, v1: 4300 }, box: [-1100, -1100, 5400, 2200],   // 盖住 deskA / chainA / notaryB / resourceB
  shown: [], css, html,
  terms: [
    { id: "t0", t: "PoW", d: "靠算力竞争出块的共识方式", at: w("PoW", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      tl.set(${JSON.stringify(H0.join(", "))}, { opacity: 0 }, 0);
      // ===== L0 先给准确的说法。 入账台 → 主链
      cam(${t(LS[0] + 0.1)}, "chainA", 1.4);
      // ===== L1 共识
      pop("#lb-cons", ${t(LS[1] + 0.3)});
      // ===== L2 重组：b2/b3 抬起变灰，扳道器出现并扳过去，新分支接上
      out("#lb-cons", ${t(LS[2] - 0.2)});
      tl.to("#ch-b2, #ch-b3, #ch-l2, #envA", { y: -40, duration: 0.6, ease: "power2.out" }, ${t(LS[2] + 0.4)});
      tl.to("#ch-b2, #ch-b3, #ch-l2", { opacity: 0.45, filter: "grayscale(1)", duration: 0.6 }, ${t(LS[2] + 0.4)});
      tl.to("#ch-l1", { opacity: 0, duration: 0.4 }, ${t(LS[2] + 0.4)});
      grow("fsw", ${t(LS[2] + 1.0)}); pop("#lb-reorg", ${t(LS[2] + 1.5)});
      X16.flip(tl, "fsw", ${t(TM.flip)}); grow("nb", ${t(TM.flip + 0.9)});
      // ===== L3 已确认的交易消失：信封红叉
      fadeIn("#envx", ${t(LS[3] + 0.2)}, 0.3); pop("#lb-env", ${t(TM.lost)});
      // ===== L4 已确认只是赌注
      pop("#lb-dk", ${t(LS[4] + 0.5)}); pop("#lb-bet", ${t(TM.bet)}, 0.3);
      // ===== L5 打个比方：横移到 B
      out("#lb-reorg, #lb-env, #lb-dk, #lb-bet", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "notaryB", 1.6);
      // ===== L6 多数公证员签字确认，印章盖下
      pop("#lb-ct", ${t(LS[6] + 0.4)}); pop("#lb-nt", ${t(LS[6] + 0.8)});
      KIT.stamp(tl, "sl", ${t(TM.stamp)}); fadeIn("#ct-stampmark", ${t(TM.stamp + 0.66)}, 0.2);
      // ===== L7 临时雇来半数以上
      out("#lb-nt", ${t(LS[7] - 0.1)});
      [2, 3, 4].forEach((i, k) => { out("#nt" + i, ${t(TM.hire)} + k * 0.2, 0.3); fadeIn("#nr" + i, ${t(TM.hire)} + k * 0.2, 0.3); });
      pop("#lb-atk", ${t(TM.hire + 0.7)});
      // ===== L8 盖过章的合同作废，第二份合同出现（关键画面）
      fadeIn("#ctx", ${t(TM.voidc)}, 0.3); grow("ct2", ${t(TM.resell)}); pop("#lb-ct2", ${t(TM.resell + 0.5)});
      // ===== L9 双花
      pop("#kw-ds", ${t(TM.ds)});
      // ===== L10 比喻不成立处
      out("#kw-ds", ${t(LS[10] - 0.2)}); pop("#kw-yr", ${t(LS[10] + 0.4)});
      // ===== L11 小算力 PoW 链，算力按小时租
      out("#kw-yr", ${t(LS[11] - 0.2)}); pop("#lb-hg", ${t(TM.hour - 0.3)}); KIT.sand(tl, "hg", ${t(TM.hour)}, 3);
      // ===== L12 都叫 51% 攻击
      pop("#kw-51", ${t(TM.a51)});
      // ===== L13 选错防线
      pop("#x51", ${t(LS[13] + 0.2)}, 0.3);
      // ===== L14 更好的问法：资源板
      out("#kw-51, #lb-ct, #lb-atk, #lb-ct2, #lb-hg", ${t(LS[14] - 0.2)});
      cam(${t(LS[14])}, "resourceB", 1.4); pop("#lb-rb", ${t(TM.ask)});
      // ===== L15 身份和连接、算力、单个区块的时机
      // ===== L16 权益或旧私钥、别人的动机、停链份额
      ${JSON.stringify(TM.k.map((x) => +x.toFixed(2)))}.forEach((tk, i) => { X5.hang(tl, "rb", i, tk); pop("#rs" + i, tk + 0.1); });
      // ===== L17 资源不同，防线不同：六张卡各出一个小绿盾，段尾静止
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#shd" + i, ${t(LS[17] + 0.4)} + i * 0.15, 0.25));
`,
});
