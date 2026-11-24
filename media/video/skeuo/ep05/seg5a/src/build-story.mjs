// Generates compositions/story.html for ep05/seg5a「⑤ 慢升级快暂停」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { G, at, f, camAt, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { P, rel } from "./layout.mjs";
import { termCss, termCards } from "../../kit-ext/terms.mjs";
import { world, A, OR, cm, fp, rb, rk, b1, b2, b3 } from "./world.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, opt) => wordAt(T, term, opt).start;
const J = (v) => JSON.stringify(v);
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];

// ------------------------------------------------------------------ labels (world, counter-scaled)
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
const btn = fp.anchors.btns;
lab("lb-door", off(fp.anchors.top, 0, -10), "门 · 每个按钮的读卡器", "", "b");
lab("lb-keys", off(rb.anchors.top, 0, -10), "钥匙 · 谁拿着哪张门卡", "", "b");
lab("lb-own", off(A.own.top, 0, 0), "一个 owner", "lab-ink", "b");
lab("lb-t0", off(btn[3], 0, -70), "upgrade", "lab-cs", "b");
lab("lb-t1", off(A.knob.top, 0, -6), "费率 · 抵押率", "lab-cs", "b");
lab("lb-t2", off(at(G(P.sw[0], P.sw[1]), 0, 0, 360), 0, 0), "紧急暂停闸刀", "lab-gs", "b");
lab("lb-bot", off(A.bot.top, 40, 0), "监控机器人", "", "b");
lab("lb-t3", off(btn[0], 0, -70), "mint", "lab-cs", "b");
// L7–L8
lab("lb-stop", at(G(P.sw[0], P.sw[1]), -170, 20, 200), "资金流停下", "lab-g", "r");
lab("lb-loss", at(G(P.vault[0], P.vault[1]), 0, 160, 0), "金库门没开 · 转不走资金", "lab-gs", "t");
lab("lb-any", off(A.cm.top, -40, -20), "升级 = 换掉整台机器的逻辑", "lab-rs", "b");
const qms = [[-210, 30], [190, 0], [-170, -90], [210, 100], [-60, -120]];
qms.forEach((q, i) => pin("qm" + i, off(A.cm.center, q[0], q[1] - 60), `<div class="qm hide" id="qm${i}">?</div>`));
// L9–L13
lab("lb-vit", off(A.vit.top, 0, 0), "时间锁队列 · 公开排队", "", "b");
lab("lb-msig", off(A.msig.top, 0, 0), "提案者 · 多签", "", "b");
lab("lb-35", off(A.meter.top, 0, 0), "五人里三人签名", "lab-gs", "b");
[0, 1, 2].forEach((i) => pin("sgk" + i, off(A["sg" + i].top, 0, 6), CHECK("sgc" + i, 46, "hide")));
lab("lb-48", off(A.lock.center, 70, -20), "48 小时（示例）", "", "l");
lab("lb-exec", off(A.cm.top, -20, -10), "到期才执行", "lab-gs", "b");
lab("lb-see", off(A.watch.top, 30, 0), "大家都看得到", "", "t");
lab("lb-exit", off(A.exitTo, 0, 40), "延迟期内撤出", "lab-gs", "t");
lab("lb-bad", off(A.vit.top, -60, -70), "恶意操作", "lab-rs", "b");
lab("lb-gd", off(A.guard.top, 0, 0), "守护者", "", "b");
lab("lb-cancel", off(A.vit.top, 140, -10), "可以取消", "lab-gs", "b");
lab("lb-start", off(A.gdoc.top, 90, 10), "不能发起", "lab-rs", "l");
pin("gdx", off(A.gdoc.center, 0, -20), BADGE("gdxb", 58, "hide"));
// L14–L15
lab("lb-ok1", off(A.msig.center, -170, 0), "防得住 · 单个私钥被盗", "lab-gs", "r");
lab("lb-ui", off(A.lp2.top, 0, -150), "所有人看到同一个被篡改的界面", "lab-rs", "b");
lab("lb-nostop", off(A.meter.top, 0, 0), "多签挡不住", "lab-rs", "b");
lab("lb-bybit", off(A.meter.ground, 0, 40), "例 · Bybit 2025 · 公开报道", "lab-g lab-sm", "t");
[0, 1, 2].forEach((i) => pin("sgr" + i, off(A["sg" + i].top, 0, 6), CHECK("sgd" + i, 46, "hide")));
// L16–L19 Ronin
lab("lb-ind", off(rk.anchors.top, 0, -10), "阈值 ↔ 私钥的独立性", "", "b");
lab("lb-b1", off(b1.anchors.booth, 0, -20), "Ronin 跨链桥 · 9 选 5", "lab-cs", "b");
lab("lb-grp", off(rk.anchors.group, -40, -60), "同一家机构 · 4 把", "lab-ink", "b");
lab("lb-atk", off(A.atk.top, 0, 0), "攻击者 · 控制 5 把", "lab-rs", "b");
lab("lb-note", off(rk.anchors.note, 70, 20), "早就不需要 · 一直没撤销", "lab-r", "l");
lab("lb-2src", off(rk.anchors.ground, 0, 50), "9 把钥匙 · 只有 2 个来源", "lab-rs", "t");
// L20–L23 Token Hub
lab("lb-cp2", off(A.cp2.top, 120, -10), "注册中继者 · 付 100 BNB", "", "b");
lab("lb-pf", off(A.proof.top, 40, 0), "证明验证有缺陷", "lab-rs", "b");
lab("lb-mint", off(A.mint2.top, 0, 0), "凭空铸造 200 万 BNB", "lab-rs", "b");
lab("lb-wl", off(A.hubList.top, 0, 0), "Moran 硬分叉 · 白名单", "lab-gs", "b");
lab("lb-dec", off(A.cp2.top, 120, -10), "这是一个权限决策", "lab-cs", "b");
// L24–L26 Mantle
lab("lb-cm3", off(A.cm3.top, 0, 0), "L2 桥合约", "", "b");
lab("lb-up3", off(A.fp3.btns[0], 70, -30), "谁能升级？", "lab-ink", "l");
lab("lb-s3", off(A.meter3.top, 0, 0), "14 人里 6 人", "lab-ink", "b");
lab("lb-nolock", off(A.lock3.top, 0, 0), "无延迟", "lab-rs", "b");
lab("lb-trust", off(A.sign3.top, 0, -10), "不是代码漏洞", "lab-g", "b");
lab("lb-know", off(A.user3.top, 0, 0), "存钱之前 · 先知道它", "lab-gs", "b");

// ------------------------------------------------------------------ cameras
const Cc = (pt, k, sx = 960, sy = 520) => camAt(pt, sx, sy, k);
const CAMS = {
  open: Cc([380, -300], 0.8, 960, 560),
  board: Cc([250, -770], 1.2, 1040, 500),
  roles: Cc([520, -360], 0.72, 1340, 540),
  split: Cc([560, -40], 0.9, 1000, 640),
  tl: Cc([-620, 210], 0.78, 1080, 530),
  wide: Cc([60, 120], 0.6, 960, 520),
  exit: Cc([1150, -60], 0.95, 900, 560),
  guard: Cc([-480, 40], 1.0, 1000, 520),
  lim: Cc([-760, 470], 0.95, 1000, 470),
  ronin0: Cc([250, -770], 1.1, 960, 520),
  ronin: Cc([560, -820], 0.9, 1180, 580),
  hub: Cc([2150, -1250], 1.0, 1150, 560),
  l2: Cc([3400, -1330], 0.88, 1200, 540),
  l2end: Cc([3400, -1330], 0.9, 1200, 560),
};

// ------------------------------------------------------------------ times
const TM = {
  door: w("门怎么坏"), keys: w("钥匙怎么分"),
  least: w("最小权限"), owner: w("owner"), split: w("拆成"), one: w("只做一件事"),
  up: w("升级者"), upMs: w("多签加时间锁", { line: 2 }), d48: w("48", { line: 2 }),
  pa: w("参数管理员"), fee: w("费率"), pMs: w("多签加时间锁", { line: 3 }), d24: w("24"),
  ex: w("示例", { line: 4 }), notStd: w("不是标准"),
  pz: w("暂停者"), small: w("小型多签"), bot: w("监控机器人"), noDelay: w("不加延迟"),
  mi: w("增发者"), spec: w("特定的合约"),
  why: w("为什么"), fast: w("暂停要快"), slow: w("升级要慢"),
  stop: w("止损"), noMove: w("转不走资金"), upAny: w("升级可以"), any: w("任何事"),
  p2: w("第二个原则"),
  prop: w("提案者"), three: w("五个人里三人"), hand: w("交给时间锁"),
  queue: w("公开排队"), h48: w("48", { line: 11 }), due: w("到期之后"), exec: w("执行", { line: 11 }),
  see: w("大家都看得到"), disagree: w("不同意"), exit: w("撤出"),
  gd: w("守护者"), cancel: w("取消"), noStart: w("不能发起"), asym: w("不对称"),
  lim: w("局限"),
  oneKey: w("单个私钥被盗"), all: w("所有签名人"), ui: w("被篡改的界面"), cant: w("挡不住"),
  th: w("阈值"), ind: w("独立性"),
  ronin: w("Ronin"), nine: w("9个验证者"), five: w("5个签名"),
  ctrl: w("控制了"), ch12: w("公开复盘"), four: w("4把"),
  another: w("还有一把"), revoke: w("没撤销"), loss: w("损失", { line: 19 }),
  hub: w("Token"), pay: w("付了"), reg: w("注册成"), proof: w("证明验证"), mint: w("凭空铸造"),
  moran: w("Moran"), wl: w("白名单", { line: 22 }),
  dep: w("押金"), dec: w("权限决策"),
  l2: w("L2", { line: 24 }), who: w("谁能升级"), dest: w("去向"),
  beat: w("L2BEAT"), mantle: w("Mantle"), n14: w("14"), n6: w("6人"), noLock: w("无延迟"),
  trust: w("信任假设"), notBug: w("不是代码漏洞"), know: w("存钱之前"),
};

// term cards (RETROFIT-deps rule 2) — the event cards own the top-left here, so the term cards sit bottom-left above the captions
const BOT = 770;
const TC = termCards([
  { id: "tlk", t: "时间锁", d: "让操作公开排队一段时间后才能执行", at: w("时间锁", { line: 2 }), top: BOT },
  { id: "br", t: "跨链桥", d: "在两条链之间转移资产或消息的系统", at: w("跨链桥", { line: 17 }), top: BOT },
  { id: "rly", t: "中继者", d: "把消息和证明从一条链搬到另一条链", at: w("中继者", { line: 21 }), top: BOT },
  { id: "wl", t: "白名单", d: "事先列好、允许通过的名单", at: TM.wl, top: BOT },
  { id: "l2", t: "L2", d: "在以太坊外执行交易、结果交回以太坊", at: TM.l2, top: BOT },
  { id: "l1", t: "L1", d: "L2 所依托的主链 · 这里指以太坊", at: w("L1", { line: 25 }), top: BOT },
]);

// dot rows (each dot = one unit)
const dots = (n, cls = "", partial = 0) => Array.from({ length: n }, (_, i) => `<i class="d ${cls}${partial && i === n - 1 ? " part" : ""}"></i>`).join("");
const SEC = SCRIPT.sections;
const C1 = A.knob.dial;

// ------------------------------------------------------------------ html
const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .qm { width: 66px; height: 66px; border-radius: 50%; background: #e0453a; color: #fff; font-size: 46px; font-weight: 900; line-height: 64px; text-align: center; box-shadow: 0 6px 14px rgba(70,60,40,0.18); }
    .card { position: absolute; left: 60px; top: 130px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 20px 30px 22px; white-space: nowrap; }
    .card .ev-d { font-size: 30px; font-weight: 700; color: #6d685e; margin-bottom: 4px; }
    .card .ev-t { font-size: 42px; font-weight: 900; }
    .card .ev-r { margin-top: 12px; font-size: 34px; font-weight: 900; display: flex; align-items: center; gap: 14px; }
    .card .ev-r .lab { position: static; }
    .card .red { color: #c3352b; } .card2 { top: 346px; } .card2 .ev-r { margin-top: 0; }
    .card .num { font-variant-numeric: tabular-nums; }
    .pc .ev-t b { color: #1d93ba; }
    .dots { display: grid; gap: 7px; margin-top: 14px; }
    .dots .d { width: 18px; height: 18px; border-radius: 50%; background: #e0453a; display: block; }
    .dots .d.gold { background: #e2a72e; }
    .dots .d.part { opacity: 0.4; }
    .dots-cap { font-size: 28px; font-weight: 700; color: #6d685e; margin-top: 8px; }
    #roles { position: absolute; left: 60px; top: 284px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 16px 26px 18px; }
    #roles .r { display: grid; grid-template-columns: 250px 270px 230px; align-items: center; height: 58px; font-size: 30px; font-weight: 800; white-space: nowrap; }
    #roles .r.h { height: 44px; font-size: 28px; color: #8a8478; font-weight: 700; border-bottom: 2px solid #e2ddd3; }
    #roles .chip { display: inline-block; width: 18px; height: 34px; border-radius: 5px; margin-right: 12px; vertical-align: -6px; }
    #roles .dl { position: relative; }
    #roles .dl span { color: #17809f; } #roles .dl em { font-style: normal; font-size: 28px; color: #8a8478; margin-left: 10px; }
    #roles .stamp { position: absolute; left: 470px; top: 150px; white-space: nowrap; transform: rotate(-6deg); border: 4px solid #8a8478; color: #6d685e; border-radius: 10px; padding: 2px 16px 6px; font-size: 32px; font-weight: 900; background: rgba(255,253,248,0.92); }
    #kw { position: absolute; left: 0; right: 0; top: 128px; text-align: center; }
    #kw .k-big { display: inline-block; font-size: 58px; background: #fffdf8; border-radius: 18px; padding: 14px 40px 20px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .k-big .g { color: #17804a; } #kw .k-big .r { color: #c3352b; }
    #veil { position: absolute; inset: 0; background: rgba(60,52,40,0.16); opacity: 0; }
    #limtag { position: absolute; left: 60px; top: 130px; }
${termCss()}
    #limtag .lab { position: static; font-size: 40px; padding: 8px 26px 12px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world()}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="veil"></div>
      <div class="card pc hide" id="pc1"><div class="ev-d">原则 1</div><div class="ev-t">最小权限 · <b>一个角色只做一件事</b></div></div>
      <div id="roles" class="hide">
        <div class="r h"><div>角色</div><div>建议持有者</div><div>延迟</div></div>
        <div class="r" id="rr0" style="opacity:0"><div><i class="chip" style="background:#1d93ba"></i>升级者</div><div>多签 + 时间锁</div><div class="dl"><span>≥ 48 h</span><em id="ex0" style="opacity:0">示例</em></div></div>
        <div class="r" id="rr1" style="opacity:0"><div><i class="chip" style="background:#1c1c1c"></i>参数管理员</div><div>多签 + 时间锁</div><div class="dl"><span>24 h</span><em id="ex1" style="opacity:0">示例</em></div></div>
        <div class="r" id="rr2" style="opacity:0"><div><i class="chip" style="background:#1f9d55"></i>暂停者</div><div>小型多签 · 机器人</div><div class="dl"><span style="color:#17804a">无延迟</span></div></div>
        <div class="r" id="rr3" style="opacity:0"><div><i class="chip" style="background:#8a8f96"></i>增发者</div><div>特定合约</div><div class="dl"><span>—</span></div></div>
        <div class="stamp" id="rstamp" style="opacity:0">示例 · 不是标准</div>
      </div>
      <div id="kw"><div class="k-big hide" id="kw1">为什么 <span class="g">暂停要快</span> · <span class="r">升级要慢</span>？</div></div>
      <div class="card pc hide" id="pc2"><div class="ev-d">原则 2</div><div class="ev-t">多签 + 时间锁 + <b>守护者</b></div></div>
      <div id="limtag" class="hide"><span class="lab lab-g">这套设计的局限</span></div>
      <div class="card hide" id="ev1">
        <div class="ev-d">2022 年 3 月 · Ronin 跨链桥</div>
        <div class="ev-t">9 个验证者 · 5 个签名放行</div>
        <div class="ev-r"><span class="lab lab-g lab-sm">Ronin 官方复盘</span></div>
      </div>
      <div class="card card2 hide" id="ev1-loss"><div class="ev-r red">损失约 6.2 亿美元</div><div class="dots" style="grid-template-columns: repeat(31, 18px)">${dots(62)}</div><div class="dots-cap">每点 = 1000 万美元</div></div>
      <div class="card hide" id="ev2">
        <div class="ev-d">2022 年 10 月 · BNB Chain</div>
        <div class="ev-t">Token Hub 跨链桥</div>
        <div class="ev-r"><span class="lab lab-g lab-sm">公开复盘</span></div>
      </div>
      <div class="card card2 hide" id="ev2-m"><div class="ev-r red">凭空铸造 200 万 BNB</div><div class="dots" style="grid-template-columns: repeat(20, 18px)">${dots(20, "gold")}</div><div class="dots-cap">每点 = 10 万 BNB</div></div>
      <div class="card hide" id="ev3">
        <div class="ev-d">L2 · Mantle</div>
        <div class="ev-t">安全多签 14 人里 6 人</div>
        <div class="ev-r red" id="ev3-r" style="opacity:0">无延迟升级 L1 上的桥</div>
        <div class="ev-r"><span class="lab lab-g lab-sm">第三方分析 · L2BEAT · 截至 2026 年 11 月</span></div>
      </div>
      ${pills(5, { sections: SEC })}
      ${TC.html}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 慢升级快暂停</div><div class="t-sub">钥匙怎么分</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${J(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const fade = (sel, t, to, d) => KITX05.fade(tl, sel, t, to, d);
      const hideGrow = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const hidden = (ids) => ids.forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      const coinPath = (id, t, ptsArr, dur) => {
        tl.set("#" + id, { opacity: 1 }, t);
        const o = { k: 0 }, p0 = ptsArr[0], n = ptsArr.length - 1;
        tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
          const s = o.k * n, i = Math.min(n - 1, Math.floor(s)), q = s - i, a = ptsArr[i], b = ptsArr[i + 1];
          gsap.set("#" + id, { x: a[0] + (b[0] - a[0]) * q - p0[0], y: a[1] + (b[1] - a[1]) * q - p0[1] - 12 }); } }, t);
      };

      KIT.camSet(tl, CAMS.open);
      // initial visibility
      ["kn", "bot", "own", "fc0", "fc1", "fc2", "fc3", "vit", "tlk", "ms", "mt", "sg0", "sg1", "sg2", "sg3", "sg4", "gd", "gdc", "wt", "mg", "us", "atk", "cp2", "atk2", "hl", "pf", "cm3", "fp3", "s3", "lk3", "mt3", "tsign", "us3", "mint2"].forEach(hideGrow);
      for (let i = 0; i < 14; i++) hideGrow("cn" + i);
      for (let i = 0; i < 5; i++) hidden(["lp" + i + "-sc"]);
      hidden(["rk", "pd1", "pd2", "pd3", "ugold", "rb-hold-0", "rb-hold-1", "rb-hold-2", "rb-hold-3", "rb-tag-0", "rb-tag-1", "rb-tag-2", "rb-tag-3"]);
      KITX01.dash(tl, ["fpipe-flow"], 0, ${f(TM.stop + 0.3)}, -${f((TM.stop + 0.3) * 60)});

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 doors vs keys
      pop("#lb-door", ${f(TM.door - 0.1)});
      [0, 2, 3, 4].forEach((i, k) => KITX05.swipe(tl, "fp", i, ${f(TM.door + 0.1)} + k * 0.12, true));
      pop("#lb-keys", ${f(TM.keys)});
      out("#lb-door", ${f(LN[1].start - 0.2)});

      // ===== L1 least privilege: one owner card splits into four role cards
      KIT.cam(tl, ${f(LN[1].start - 0.2)}, CAMS.board, 1.2);
      out("#lb-keys", ${f(LN[1].start - 0.2)});
      pop("#pc1", ${f(TM.least - 0.1)}, 0.35);
      grow("own", ${f(TM.owner - 0.3)}, 0.5); pop("#lb-own", ${f(TM.owner)});
      out("#own, #lb-own", ${f(TM.split + 0.2)}, 0.2);
      ${[0, 1, 2, 3].map((i) => {
        const d = sub(rb.anchors.cards[i], A["fc" + i].center);
        return `tl.set("#fc${i}", { scaleY: 1 }, ${f(TM.split + 0.15)}); fade("#fc${i}", ${f(TM.split + 0.15)}, 1, 0.1);
      KITX05.fly(tl, "fc${i}", ${f(TM.split + 0.25 + i * 0.18)}, ${f(d[0])}, ${f(d[1])}, 0.7, 60);
      fade("#fc${i}", ${f(TM.split + 0.95 + i * 0.18)}, 0, 0.1); fade("#rb-card-${i}", ${f(TM.split + 0.92 + i * 0.18)}, 1, 0.1);`;
      }).join("\n      ")}

      // ===== L2–L6 the role table: card → holder → delay → controlled part
      KIT.cam(tl, ${f(LN[2].start - 0.5)}, CAMS.roles, 1.3);
      pop("#roles", ${f(LN[2].start - 0.2)}, 0.3);
      ${[
        [0, "up", "upMs", "d48", "lb-t0"],
        [1, "pa", "pMs", "d24", "lb-t1"],
        [2, "pz", "small", "noDelay", "lb-t2"],
        [3, "mi", "spec", "spec", "lb-t3"],
      ].map(([i, a, b, c, lb]) => `fade("#rr${i}", ${f(TM[a] - 0.1)}, 1, 0.3);
      tl.fromTo("#rb-card-${i}", { y: 0 }, { y: -10, duration: 0.18, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM[a])});
      fade("#rb-hold-${i}", ${f(TM[b] - 0.1)}, 1, 0.3);
      fade("#rb-tag-${i}", ${f(TM[c] - 0.1)}, 1, 0.3);
      KIT.draw(tl, "ln${i}", ${f(TM[a] + 0.5)}, 0.8);
      pop("#${lb}", ${f(TM[a] + 1.2)});`).join("\n      ")}
      grow("kn", ${f(TM.pa + 0.4)}, 0.5);
      KIT.rot(tl, "kn-ndl", ${f(TM.fee)}, 20, 0.6);
      tl.fromTo("#rb-tag-0, #rb-tag-1", { scale: 1 }, { scale: 1.12, svgOrigin: "0 0", duration: 0.2, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.ex - 0.2)});
      tl.fromTo("#rr0 .dl span, #rr1 .dl span", { backgroundColor: "rgba(42,163,201,0)" }, { backgroundColor: "rgba(42,163,201,0.18)", duration: 0.25, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.ex - 0.2)});
      KIT.pop(tl, "#rstamp", ${f(TM.ex - 0.1)}, 0.3); fade("#ex0", ${f(TM.notStd)}, 1, 0.3); fade("#ex1", ${f(TM.notStd + 0.1)}, 1, 0.3); out("#rstamp", ${f(LN[5].start - 0.1)}, 0.25);
      grow("bot", ${f(TM.bot - 0.3)}, 0.5); pop("#lb-bot", ${f(TM.bot + 0.1)});

      // ===== L7–L8 why pause fast, upgrade slow — split view
      KIT.cam(tl, ${f(LN[7].start - 0.3)}, CAMS.split, 1.3);
      out("#roles, #pc1, #lb-bot, #lb-t1, #lb-t2, #lb-t3", ${f(LN[7].start - 0.3)}, 0.25);
      tl.to("#ln0, #ln1, #ln2, #ln3", { opacity: 0.2, duration: 0.3 }, ${f(LN[7].start - 0.3)}); tl.to("#ln0, #ln1, #ln2, #ln3", { opacity: 0, duration: 0.3 }, ${f(LN[9].start - 0.3)});
      pop("#kw1", ${f(TM.why)}, 0.35);
      KIT.toggle(tl, "sw", ${f(TM.stop - 0.4)}, false, 0.5);
      fade("#fpipe-flow", ${f(TM.stop + 0.1)}, 0.2, 0.3);
      pop("#lb-stop", ${f(TM.stop + 0.2)});
      pop("#lb-loss", ${f(TM.noMove - 0.1)});
      KITX05.press(tl, "fp", 3, ${f(TM.upAny - 0.2)}, { status: "red" });
      KITX03.spin(tl, "cm", ${f(TM.upAny)}, 1.6, 2);
      KIT.led(tl, "cm-led", ${f(TM.upAny + 0.1)}, "red");
      pop("#lb-any", ${f(TM.upAny + 0.3)});
      out("#lb-t0", ${f(TM.any - 0.4)}, 0.2);
      ${qms.map((_, i) => `pop("#qm${i}", ${f(TM.any - 0.2)} + ${i} * 0.09, 0.3);`).join(" ")}

      // ===== L9 principle 2 — time-lock street
      KIT.cam(tl, ${f(LN[9].start - 0.2)}, CAMS.tl, 1.5);
      out("#kw1, #lb-stop, #lb-loss, #lb-any, #lb-t0${qms.map((_, i) => ", #qm" + i).join("")}", ${f(LN[9].start - 0.3)}, 0.25);
      pop("#pc2", ${f(TM.p2)}, 0.35);
      grow("vit", ${f(TM.p2 + 0.2)}, 0.6); grow("tlk", ${f(TM.p2 + 0.5)});
      pop("#lb-vit", ${f(TM.p2 + 0.9)});

      // ===== L10 proposer multisig: three of five sign
      grow("ms", ${f(TM.prop - 0.2)}, 0.5); pop("#lb-msig", ${f(TM.prop + 0.2)});
      ${[0, 1, 2, 3, 4].map((i) => `grow("sg${i}", ${f(TM.prop + 0.3 + i * 0.1)}, 0.4);`).join(" ")}
      grow("mt", ${f(TM.three - 0.4)}, 0.4);
      ${[0, 1, 2].map((i) => `pop("#sgc${i}", ${f(TM.three + 0.3 + i * 0.45)}, 0.25); KITX05.fill(tl, "mt", ${f(TM.three + 0.3 + i * 0.45)}, ${i + 1}, 0.35);`).join(" ")}
      pop("#lb-35", ${f(TM.three + 1.6)});
      fade("#pd1", ${f(TM.hand - 0.2)}, 1, 0.3);
      tl.fromTo("#pd1", { y: -60 }, { y: 0, duration: 0.45, ease: "bounce.out", immediateRender: false }, ${f(TM.hand - 0.2)});

      // ===== L11 queue in public for 48h, then execute
      out("#lb-msig, #lb-35, #sgc0, #sgc1, #sgc2", ${f(LN[11].start)}, 0.2);
      KIT.belt(tl, "belt", ${f(TM.queue)}, 2.4, 470);
      KITX05.moveUV(tl, "pd1", ${f(TM.queue)}, 470, 0, 0, 2.4, 0, "none");
      pop("#lb-48", ${f(TM.h48 - 0.1)});
      KITX01.countdown(tl, "tlk", ${f(TM.h48)}, ${f(TM.due - TM.h48 + 0.3)}, 0);
      KITX01.unlock(tl, "tlk", ${f(TM.due + 0.4)});
      {
        const d = ${J(sub(A.cm.top, A.pd1.center))};
        KITX05.moveUV(tl, "pd1", ${f(TM.exec - 0.5)}, 640, 120, 160, 0.6, 0, "power2.in");
        fade("#pd1", ${f(TM.exec)}, 0, 0.15);
        void d;
      }
      KITX03.spin(tl, "cm", ${f(TM.exec)}, 1.0, 1);
      KIT.led(tl, "cm-led", ${f(TM.exec)}, "green");
      pop("#lb-exec", ${f(TM.exec + 0.1)});

      // ===== L12 everyone sees it; users can exit during the delay
      KIT.cam(tl, ${f(LN[12].start - 0.3)}, CAMS.wide, 1.4);
      out("#lb-exec, #lb-48, #lb-vit", ${f(LN[12].start - 0.3)}, 0.2);
      KITX01.unlock(tl, "tlk", ${f(LN[12].start)}, false);
      KITX01.countdown(tl, "tlk", ${f(LN[12].start)}, 0.4, 1);
      fade("#pd2", ${f(LN[12].start + 0.1)}, 1, 0.3);
      KIT.belt(tl, "belt", ${f(LN[12].start + 0.3)}, 1.4, 220);
      KITX05.moveUV(tl, "pd2", ${f(LN[12].start + 0.3)}, 220, 0, 0, 1.4, 0, "none");
      KITX01.countdown(tl, "tlk", ${f(LN[12].start + 0.6)}, 4.0, 0.5);
      grow("wt", ${f(TM.see - 0.3)}); grow("mg", ${f(TM.see - 0.1)}); pop("#lb-see", ${f(TM.see + 0.2)});
      KIT.cam(tl, ${f(TM.disagree - 0.6)}, CAMS.exit, 1.2);
      grow("us", ${f(TM.disagree - 0.4)});
      fade("#ugold", ${f(TM.disagree)}, 1, 0.2);
      KITX05.moveUV(tl, "us", ${f(TM.exit - 0.6)}, 260, 220, 0, 1.2);
      KITX05.moveUV(tl, "ugold", ${f(TM.exit - 0.6)}, 260, 220, 0, 1.2);
      KIT.draw(tl, "lnx", ${f(TM.exit - 0.5)}, 1.0);
      pop("#lb-exit", ${f(TM.exit + 0.3)});

      // ===== L13 guardian: can cancel, cannot start
      KIT.cam(tl, ${f(LN[13].start - 0.3)}, CAMS.guard, 1.3);
      out("#lb-see, #lb-exit", ${f(LN[13].start - 0.3)}, 0.2);
      grow("gd", ${f(TM.gd - 0.3)}); pop("#lb-gd", ${f(TM.gd)});
      tl.set("#pd3", { x: 0, y: 0 }, 0);
      out("#pd2", ${f(TM.gd + 0.2)}, 0.2);
      KITX05.moveUV(tl, "pd3", ${f(TM.gd)}, 220, 0, 0, 0.01, 0, "none");
      fade("#pd3", ${f(TM.gd + 0.2)}, 1, 0.25);
      pop("#lb-bad", ${f(TM.gd + 0.5)});
      KITX05.moveUV(tl, "pd3", ${f(TM.cancel - 0.2)}, 200, 300, 260, 0.6, 0, "power2.in");
      fade("#pd3", ${f(TM.cancel + 0.25)}, 0, 0.2);
      out("#lb-bad", ${f(TM.cancel + 0.1)}, 0.2);
      pop("#lb-cancel", ${f(TM.cancel + 0.2)});
      grow("gdc", ${f(TM.noStart - 0.9)}, 0.3);
      KITX05.moveUV(tl, "gdc", ${f(TM.noStart - 0.5)}, 0, -120, 40, 0.4, 0, "power2.out");
      KITX05.moveUV(tl, "gdc", ${f(TM.noStart - 0.05)}, 0, -40, 0, 0.35, 0, "back.out(2)");
      pop("#gdxb", ${f(TM.noStart - 0.05)}, 0.25);
      pop("#lb-start", ${f(TM.noStart + 0.1)});

      // ===== L14 limits
      KIT.cam(tl, ${f(LN[14].start - 0.2)}, CAMS.lim, 1.3);
      out("#lb-gd, #lb-cancel, #lb-start, #gdxb, #pc2", ${f(LN[14].start - 0.2)}, 0.2);
      fade("#veil", ${f(TM.lim - 0.3)}, 1, 0.4);
      pop("#limtag", ${f(TM.lim - 0.1)}, 0.3);

      // ===== L15 the multisig guards against one stolen key, not a shared fake UI
      fade("#veil", ${f(LN[15].start)}, 0, 0.4);
      pop("#lb-ok1", ${f(TM.oneKey)});
      KITX05.fill(tl, "mt", ${f(LN[15].start)}, 0, 0.3);
      ${[0, 1, 2, 3, 4].map((i) => `fade("#lp${i}-sc", ${f(TM.all - 0.4 + i * 0.08)}, 1, 0.3);`).join(" ")}
      ${[0, 1, 2, 3, 4].map((i) => `KIT.swap(tl, "#lp${i}-scr", "#lp${i}-scr2", ${f(TM.ui - 0.3)}, 0.3);`).join(" ")}
      pop("#lb-ui", ${f(TM.ui)});
      out("#lb-ok1", ${f(TM.ui - 0.3)}, 0.2);
      ${[0, 1, 2].map((i) => `pop("#sgd${i}", ${f(TM.ui + 0.9 + i * 0.35)}, 0.25); KITX05.fill(tl, "mt", ${f(TM.ui + 0.9 + i * 0.35)}, ${i + 1}, 0.3);`).join(" ")}
      pop("#lb-nostop", ${f(TM.cant - 0.2)});
      pop("#lb-bybit", ${f(TM.cant + 0.3)});

      // ===== L16 threshold vs independence — the board becomes Ronin's validator keys
      KIT.cam(tl, ${f(LN[16].start - 0.3)}, CAMS.ronin0, 1.5);
      out("#limtag, #lb-ui, #lb-nostop, #lb-bybit${[0, 1, 2].map((i) => ", #sgd" + i).join("")}", ${f(LN[16].start - 0.3)}, 0.2);
        fade("#rb", ${f(TM.th)}, 0, 0.4); fade("#rk", ${f(TM.th + 0.1)}, 1, 0.4);
      pop("#lb-ind", ${f(TM.ind - 0.3)});

      // ===== L17 Ronin bridge, 9 validators, 5 signatures
      KIT.cam(tl, ${f(LN[17].start - 0.2)}, CAMS.ronin, 1.4);
      out("#lb-ind", ${f(LN[17].start - 0.2)}, 0.2);
      pop("#ev1", ${f(TM.ronin)}, 0.35);
      KIT.led(tl, "b1-booth-led", ${f(TM.ronin + 0.3)}, "blue");
      pop("#lb-b1", ${f(TM.ronin + 0.4)});

      // ===== L18 attacker controls 5 keys; 4 sit with one organisation
      grow("atk", ${f(TM.ctrl - 0.5)}); pop("#lb-atk", ${f(TM.ctrl)});
      fade("#rk-grpf", ${f(TM.ch12)}, 1, 0.35);
      pop("#lb-grp", ${f(TM.four)});
      {
        const d = ${J(sub(off(A.atk.center, -20, -40), rk.anchors.group))};
        KITX05.fly(tl, "rk-grp", ${f(TM.four + 1.0)}, d[0], d[1], 0.9, 80);
      }
      out("#lb-grp", ${f(TM.four + 0.9)}, 0.2);

      // ===== L19 the fifth key: a stale, never-revoked authorization; ~$620M
      fade("#rk-note", ${f(TM.another)}, 0.95, 0.3);
      pop("#lb-note", ${f(TM.revoke - 0.2)});
      {
        const d = ${J(sub(off(A.atk.center, 30, -10), rk.anchors.cards[4]))};
        KITX05.fly(tl, "rk-key-4", ${f(TM.revoke + 0.6)}, d[0], d[1], 0.8, 60);
      }
      KIT.led(tl, "b1-booth-led", ${f(TM.loss - 0.4)}, "red");
      ${[0, 1, 2].map((i) => `coinPath("cr${i}", ${f(TM.loss - 0.3)} + ${i} * 0.35, ${J(b1.anchors.deck)}, 2.2);`).join(" ")}
      pop("#ev1-loss", ${f(TM.loss)}, 0.3);
      pop("#lb-2src", ${f(TM.loss + 1.2)});

      // ===== L20 Token Hub, Oct 2022
      KIT.cam(tl, ${f(LN[20].start - 0.3)}, CAMS.hub, 1.6);
      out("#ev1, #ev1-loss, #lb-b1, #lb-atk, #lb-note, #lb-2src", ${f(LN[20].start - 0.3)}, 0.25);
      pop("#ev2", ${f(TM.hub)}, 0.35);
      grow("cp2", ${f(TM.hub + 0.2)});

      // ===== L21 pay 100 BNB, become relayer, forged proof → 2M BNB minted
      grow("atk2", ${f(LN[21].start)});
      pop("#lb-cp2", ${f(TM.pay)});
      tl.set("#bnb0", { opacity: 1 }, ${f(TM.pay + 0.3)});
      tl.fromTo("#bnb0", { x: ${f(A.atk2.center[0] - A.cp2.top[0])}, y: ${f(A.atk2.center[1] - A.cp2.top[1])} }, { x: 0, y: 60, duration: 0.7, ease: "power2.inOut", immediateRender: false }, ${f(TM.pay + 0.3)});
      out("#bnb0", ${f(TM.pay + 1.0)}, 0.1);
      KIT.arm(tl, "cp2", ${f(TM.reg)}, true);
      grow("pf", ${f(TM.proof - 0.3)}); pop("#lb-pf", ${f(TM.proof + 0.2)});
      grow("mint2", ${f(TM.mint)}, 0.6); pop("#lb-mint", ${f(TM.mint + 0.4)});
      pop("#ev2-m", ${f(TM.mint + 0.2)}, 0.3);

      // ===== L22 Moran hard fork: relayers become a whitelist
      out("#lb-pf, #lb-mint, #lb-cp2", ${f(LN[22].start)}, 0.2);
      KIT.arm(tl, "cp2", ${f(TM.moran)}, false);
      KIT.broke(tl, "pf", ${f(TM.moran + 0.2)});
      grow("hl", ${f(TM.wl - 0.3)}); pop("#lb-wl", ${f(TM.wl + 0.1)});

      // ===== L23 pay-a-deposit-to-be-a-relayer is a permission decision
      pop("#lb-cp2", ${f(TM.dep - 0.2)});
      tl.to("#lb-cp2", { y: -50, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f(TM.dec - 0.9)});
      pop("#lb-dec", ${f(TM.dec - 0.2)}, 0.35);

      // ===== L24 L2: who can upgrade the bridge contract
      KIT.cam(tl, ${f(LN[24].start - 0.3)}, CAMS.l2, 1.7);
      out("#ev2, #ev2-m, #lb-wl, #lb-dec", ${f(LN[24].start - 0.3)}, 0.25);
      grow("cm3", ${f(TM.l2)}); grow("fp3", ${f(TM.l2 + 0.2)}); pop("#lb-cm3", ${f(TM.l2 + 0.5)});
      pop("#lb-up3", ${f(TM.who)});
      tl.fromTo("#fp3-btn-0", { scale: 1 }, { scale: 1.25, svgOrigin: "${f(A.fp3.btns[0][0])} ${f(A.fp3.btns[0][1])}", duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.who + 0.1)});

      // ===== L25 Mantle: 6 of 14, no delay (L2BEAT, as of Nov 2026)
      pop("#ev3", ${f(TM.beat)}, 0.35);
      grow("s3", ${f(TM.mantle - 0.2)});
      ${Array.from({ length: 14 }, (_, i) => `grow("cn${i}", ${f(TM.n14 - 0.6)} + ${i} * 0.05, 0.3);`).join(" ")}
      KIT.draw(tl, "lnm", ${f(TM.mantle + 0.2)}, 0.8);
      KITX05.rd(tl, "fp3", 0, ${f(TM.mantle + 0.9)}, "green");
      grow("mt3", ${f(TM.n14)});
      KITX05.fill(tl, "mt3", ${f(TM.n6 - 0.2)}, 6, 0.8);
      pop("#lb-s3", ${f(TM.n6 + 0.2)});
      grow("lk3", ${f(TM.noLock - 0.4)});
      pop("#lb-nolock", ${f(TM.noLock)});
      fade("#ev3-r", ${f(TM.noLock)}, 1, 0.3);

      // ===== L26 a trust assumption, not a code bug
      KIT.cam(tl, ${f(LN[26].start - 0.2)}, CAMS.l2end, 1.4);
      grow("tsign", ${f(TM.trust - 0.4)}, 0.6);
      grow("us3", ${f(TM.trust)});
      pop("#lb-trust", ${f(TM.notBug)});
      out("#lb-up3", ${f(TM.know - 0.3)}, 0.2); pop("#lb-know", ${f(TM.know)});
      tl.set({}, {}, ${f(TOTAL)});
      ${TC.js}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
