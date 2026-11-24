// ep16/seg1「① 升级后第二天」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.upgradeA（BRIEF）。
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
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.deskA

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1）
const putWrap = (key, o, objRes) => {
  const [gx, gy] = at(o), k = o.scale;
  const sc = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k];
  put(key, o, objRes, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const [n, v] of Object.entries(A[key])) {
    if (Array.isArray(v) && typeof v[0] === "number") A[key][n] = sc(v);
    else if (Array.isArray(v) && Array.isArray(v[0])) A[key][n] = v.map(sc);
  }
};
put("sgA", L.SIGNA, E1.signBoard(L.SIGNA, { id: "sgA", style: "plate", text: "主网升级 · Fusaka" }));
put("rw", L.ROTA, E9.rotaWheel(L.ROTA, { id: "rw", n: 12, plate: "验证者" }));
put("rk", L.RACKA, O.rack(L.RACKA, { id: "rk", tag: "Prysm" }));
putWrap("mt", L.METERA, E5.thresholdMeter(L.METERA, { id: "mt", max: 12, th: 8, level: 12, thText: "2/3" }));
// 主链：n 5，前 4 块与 n 4 的位置重合（原点 +90u）；b3 = 没出块的 slot（红虚线空格），b4 = 之后长出的新块
const CH = { u: L.CHAINA.u + 90, v: L.CHAINA.v };
put("ch", CH, O.chain(CH, { id: "ch", n: 5 }));
put("fsw", L.FORKA, X.forkSwitch(L.FORKA, { id: "fsw" }));
put("dk", L.DESKA, E7.dispatchDesk(L.DESKA, { id: "dk", scale: L.DESKA.scale, entries: ["N 个区块 ✓"], shown: 0 }));
put("sigA", L.FSIGA, X.finalitySignal(L.FSIGA, { id: "sigA", lit: 0 }));
putWrap("ckA", L.CKPTA, O.checkpoint(L.CKPTA, { id: "ckA", n: "检查点" }));
put("bcA", L.BEACONA, O.beacon(L.BEACONA, { id: "bcA" }));
// 空 slot：b3 位置的红虚线立方框
{
  const c = { u: CH.u + 180, v: CH.v }, h = 50, z = 100;
  const P = (du, dv, zz) => Wp(c.u + du, c.v + dv, zz).map((x) => x.toFixed(1)).join(",");
  const top = [P(-h, -h, z), P(h, -h, z), P(h, h, z), P(-h, h, z)].join(" ");
  const bot = [P(-h, h, 0), P(h, h, 0), P(h, -h, 0)].join(" ");
  const ed = [[-h, h], [h, h], [h, -h]].map(([a, b]) => `<line x1="${P(a, b, 0).split(",")[0]}" y1="${P(a, b, 0).split(",")[1]}" x2="${P(a, b, z).split(",")[0]}" y2="${P(a, b, z).split(",")[1]}"/>`).join("");
  const [cx, cy] = Wp(c.u, c.v, z / 2);
  add(c, S.hid("slot", `<g fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"><polygon points="${top}" fill="rgba(224,69,58,0.08)"/><polyline points="${bot}"/>${ed}</g>` +
    `<g stroke="#e0453a" stroke-width="7" stroke-linecap="round"><line x1="${cx - 22}" y1="${cy - 22}" x2="${cx + 22}" y2="${cy + 22}"/><line x1="${cx + 22}" y1="${cy - 22}" x2="${cx - 22}" y2="${cy + 22}"/></g>`));
}
// 38 点红点阵（每点约 10 ETH）
{
  const [gx, gy] = at(L.DOTSA), dots = [];
  for (let i = 0; i < 38; i++) dots.push(`<circle cx="${gx + 14 + (i % 13) * 28}" cy="${gy + 14 + Math.floor(i / 13) * 28}" r="10" fill="#e0453a" opacity="0"/>`);
  add(L.DOTSA, `<g id="dotsA">${dots.join("")}</g>`, 40);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-mt", up(A.mt.top, 8), "参与率", "lab-cs lab-sm");
lb("lb-ch", up(A.ch.blocks[1], 30), "主链", "lab-cs lab-sm");
lb("lb-75", A.mt.levels[9], "约 75%", "lab-cs lab-sm", "l");
lb("lb-23", A.mt.th, "高于 2/3 ✓", "lab-gs lab-sm", "l");
lb("lb-hyp", A.mt.levels[7], "假设", "lab-g lab-sm", "l");
lb("lb-share", up(A.rk.top, 8), "占比 > 1/3", "lab-rs lab-sm");
lb("lb-slot", up(A.ch.blocks[3], 20), "18.5% 的 slot 空了", "lab-r lab-sm");
{ const [gx, gy] = at(L.DOTSA); lb("lb-dots", [gx + 190, gy + 100], "每点约 10 ETH · 共约 382 ETH", "lab-r lab-sm", "t"); }
lb("lb-dk", up(A.dk.top, 8), "交易所入账", "lab-ink lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 110, w: 720 };
const evHtml = evt("ev", `<b>以太坊主网</b> · 2025 年 12 月 4 日<br><span style="font-size:28px;color:#6d685e">来源：Prysm 事后报告<span id="ev-ct" style="opacity:0"> · Cointelegraph</span></span>`);
const qz = `<div class="qz hide" id="qz"><div class="qz-h">先猜</div><div class="qz-r hide" id="qz-r0">bug 出在占比 <b>&gt; 1/3</b> 的客户端</div><div class="qz-r hide" id="qz-r1">只数 <b>N 个区块</b> 就入账 → 看到什么？</div></div>`;
const html = evHtml + qz +
  codeCard("ca", { ...CA, head: "凭什么入账", tag: "示意", mono: true, rows: ["// 只数区块", `<span class="ca-l">if (head - tx.block &gt;= N) credit(tx)<span class="ca-st" id="ca-st"></span></span>`] }) +
  kw("kw-ask", `先问：<b>控制了什么？</b>`, { x: 64, y: 360, size: 54, accent: "#e0453a" });
S.curve("cv-a", [CA.x + CA.w + 4, codeRowY(CA.y, 1)], S.scr("deskA", A.dk.entries[0]), { color: "#e0453a" });
const css = `
    .qz { position: absolute; right: 48px; top: 120px; width: 640px; background: #ffffff; border-radius: 16px; padding: 14px 26px 18px; border-left: 6px solid #e0453a;
      box-shadow: 0 10px 24px rgba(70,60,40,0.14); transform-origin: top right; }
    .qz-h { font-size: 40px; font-weight: 900; color: #c3352b; margin-bottom: 6px; }
    .qz-r { font-size: 32px; font-weight: 700; line-height: 46px; }
    .qz-r b { color: #c3352b; }
    .ca-l { position: relative; }
    .ca-st { position: absolute; left: -6px; right: -6px; top: 50%; height: 4px; background: #8a8478; transform: scaleX(0); transform-origin: left center; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  fus: w("Fusaka", 0), bug: w("bug", 1), drop: w("跌到", 2), slot: w("没有出块", 3), eth: w("382", 4),
  two3: w("三分之二", 5), guess: w("先猜", 6), one3: w("三分之一", 7), desk: w("交易所", 8), see: w("看到", 8),
  mem: w("先记住", 9), not: w("不是", 10), ctrl: w("控制了什么", 11),
};
const t = (x) => f(x);

S.build({
  cam0: "upgradeA", sub: "参与率掉到约 75%，链没有停",
  grid: { u0: -2500, u1: 2400, v0: -2500, v1: 2700 }, box: [-1400, -1000, 2900, 2100],   // 盖住 upgradeA / deskA
  shown: ["#lb-mt", "#lb-ch"], css, html,
  terms: [
    { id: "t0", t: "Fusaka", d: "以太坊 2025 年 12 月的主网升级", at: w("Fusaka", 0) },
    { id: "t1", t: "客户端", d: "运行节点的软件实现", at: w("客户端", 1) },
    { id: "t2", t: "slot", d: "PoS 链上每个出块位置的时间格", at: w("slot", 3) },
    { id: "t3", t: "验证者", d: "质押并投票出块的参与者", at: w("验证者", 4) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#ch-b3, #ch-b4, #ch-l2, #ch-l3", { opacity: 0 }, 0);
      // ===== L0 2025 年 12 月 4 日，以太坊主网刚完成 Fusaka 升级。
      pop("#ev", ${t(LS[0] + 0.5)}); bump("#sgA", ${t(TM.fus)}, 1.06, 1); X9.spin(tl, "rw", ${t(LS[0] + 1.0)}, 2.0, 2);
      // ===== L1 上线约 5 小时后，Prysm 客户端的一个 bug 在主网触发。
      [0, 1, 2].forEach((i) => KIT.led(tl, "rk-led-" + i, ${t(TM.bug)} + i * 0.35, "red"));
      // ===== L2 全网投票参与率，跌到约 75%。
      [2, 6, 9].forEach((k, i) => X9.seat(tl, "rw", ${t(LS[2] + 0.3)} + i * 0.3, k, "red"));
      X5.fill(tl, "mt", ${t(TM.drop)}, 9, 1.2); pop("#lb-75", ${t(TM.drop + 1.2)});
      // ===== L3 18.5% 的 slot 没有出块。
      fadeIn("#slot", ${t(LS[3] + 0.2)}, 0.3); pop("#lb-slot", ${t(LS[3] + 0.5)}); fadeIn("#ch-b4", ${t(TM.slot)}, 0.4);
      // ===== L4 验证者少拿约 382 ETH 奖励。
      tl.to("#dotsA circle", { opacity: 1, duration: 0.15, stagger: 0.03, ease: "power1.out" }, ${t(LS[4] + 0.2)});
      pop("#lb-dots", ${t(TM.eth + 0.3)}); fadeIn("#ev-ct", ${t(TM.eth + 0.3)}, 0.3);
      // ===== L5 链一直在出块，参与率也仍然高于三分之二。
      out("#lb-75, #lb-slot, #lb-dots", ${t(LS[5] - 0.2)}); cam(${t(LS[5])}, "A", 1.2);
      X16.sig(tl, "sigA", ${t(LS[5] + 1.0)}, 2); pop("#lb-23", ${t(TM.two3)});
      // ===== L6 先猜一道题。
      out("#ev", ${t(LS[6] - 0.2)}); pop("#qz", ${t(TM.guess)});
      // ===== L7 如果同样的 bug，出在占比超过三分之一的客户端上。
      pop("#qz-r0", ${t(LS[7] + 0.3)}); out("#lb-23", ${t(TM.one3 - 0.3)}); pop("#lb-share", ${t(TM.one3)});
      X5.fill(tl, "mt", ${t(TM.one3 + 0.3)}, 7, 1.0); pop("#lb-hyp", ${t(TM.one3 + 0.5)});
      // ===== L8 只按 N 个区块入账的交易所，会看到什么？
      out("#lb-share, #lb-hyp, #lb-ch, #dotsA, #slot", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "deskA", 1.4); X5.fill(tl, "mt", ${t(LS[8] + 1.4)}, 9, 0.1);
      pop("#lb-dk", ${t(LS[8] + 1.4)}); X7.entry(tl, "dk", ${t(TM.desk)}, 0, 0.6);
      pop("#ca", ${t(LS[8] + 1.5)}); draw("cv-a", ${t(TM.desk + 0.6)}); pop("#qz-r1", ${t(TM.see)});
      // ===== L9 先记住这个问题。
      tl.to("#qz", { scale: 0.88, duration: 0.6, ease: "power2.inOut" }, ${t(TM.mem)});
      // ===== L10 链本身出问题时，第一步不是看区块数。
      tl.to("#ca-st", { scaleX: 1, duration: 0.5, ease: "power2.out" }, ${t(TM.not)}); tl.to("#ca-r1, #dk-entry-0", { opacity: 0.4, duration: 0.4 }, ${t(TM.not + 0.4)});
      // ===== L11 而是先问，攻击者或者故障，控制了什么。
      out("#cv-a", ${t(LS[11] - 0.1)}); pop("#kw-ask", ${t(TM.ctrl - 0.4)}); X16.sigBlink(tl, "sigA", ${t(TM.ctrl + 0.4)}, 2, 2, 0.8);
`,
});
