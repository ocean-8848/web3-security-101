<template>
  <!-- Source template: edit this file, then run `node src/build-story.mjs` to regenerate compositions/story.html -->
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #stage { position: absolute; inset: 0; }
    #cam { position: absolute; left: 0; top: 0; width: 10px; height: 10px; transform-origin: 0 0; }
    .wsvg { position: absolute; overflow: visible; }
    #gatelayer, #objlayer, #objpins, #gatepins { position: absolute; left: 0; top: 0; width: 10px; height: 10px; }
    .pin { position: absolute; width: 0; height: 0; }
    .wl { position: absolute; left: 0; top: 0; width: 0; height: 0; }
    .ctr { position: absolute; left: 0; top: 0; white-space: nowrap; }
    .a-b { transform: translate(-50%, -100%); }
    .a-t { transform: translate(-50%, 0); }
    .a-l { transform: translate(0, -50%); }
    .a-r { transform: translate(-100%, -50%); }
    .a-c { transform: translate(-50%, -50%); }
    .hide { opacity: 0; }

    /* labels */
    .lab { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; font-weight: 700; font-size: 32px; line-height: 1.2;
      padding: 5px 18px 7px; border-radius: 12px; background: #ffffff; border: 3px solid #2aa3c9; color: #17809f;
      box-shadow: 0 6px 14px rgba(70, 60, 40, 0.10); }
    .lab-cs { background: #1d93ba; border-color: #1d93ba; color: #ffffff; }
    .lab-gs { background: #1f9d55; border-color: #1f9d55; color: #ffffff; }
    .lab-r { border-color: #e0453a; color: #c3352b; }
    .lab-rs { background: #e0453a; border-color: #e0453a; color: #ffffff; }
    .stk1 { margin-bottom: 60px; }
    .stk2 { margin-bottom: 120px; }
    .lab-g { border-color: #cfc7b8; color: #1c1c1c; font-size: 30px; }
    .gn { margin-right: 2px; }
    .badge { border-radius: 50%; background: #e0453a; display: flex; align-items: center; justify-content: center;
      border: 4px solid #ffffff; box-shadow: 0 6px 14px rgba(160, 40, 30, 0.28); }
    .env { position: relative; width: 64px; height: 44px; }
    .env svg { display: block; }
    .env-red { position: absolute; left: 0; top: 0; }
    .lock { position: relative; width: 72px; height: 58px; }
    .lk-ck { position: absolute; left: 28px; top: -4px; width: 30px; height: 30px; border-radius: 50%; background: #1f9d55; border: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center; }

    /* top-left date / amount */
    #tl { position: absolute; left: 56px; top: 40px; }
    #tl-date { font-size: 32px; }
    #tl-amt { margin-top: 14px; font-size: 92px; font-weight: 900; line-height: 1.08; white-space: nowrap; font-variant-numeric: tabular-nums; }
    #tl-fbi { margin-top: 4px; font-size: 30px; font-weight: 700; color: #6d685e; }

    /* chapter pills */
    #pills { position: absolute; right: 56px; top: 34px; display: flex; gap: 14px; }
    .pill { font-size: 30px; font-weight: 700; padding: 7px 24px 9px; border-radius: 999px; background: #ffffff; color: #1c1c1c;
      border: 2px solid #e2ddd3; box-shadow: 0 4px 12px rgba(70, 60, 40, 0.08); white-space: nowrap; }

    /* dot matrix */
    #mx { position: absolute; left: 1340px; top: 150px; width: 530px; height: 640px; }
    #mx-title { font-size: 40px; font-weight: 900; white-space: nowrap; }
    #mx-legend { position: absolute; left: 0; top: 64px; display: flex; gap: 12px; }
    .lg { display: inline-flex; align-items: center; gap: 8px; font-size: 28px; font-weight: 700; padding: 3px 16px 5px; background: #ffffff;
      border-radius: 999px; box-shadow: 0 3px 10px rgba(70, 60, 40, 0.08); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .lgd { width: 20px; height: 20px; border-radius: 50%; }
    #lg-red { opacity: 0.45; }
    .mx-t { position: absolute; left: 0; font-size: 28px; font-weight: 700; white-space: nowrap; }
    #mx-t0 { top: 162px; color: #6d685e; }
    #mx-t1 { top: 371px; color: #17809f; }
    #mx-line { position: absolute; left: 142px; top: 391px; width: 388px; height: 0; border-top: 3px dashed #2aa3c9; }
    .slot { position: absolute; width: 56px; height: 56px; border-radius: 50%; border: 3px dashed #d3ccbf; }
    .dot { position: absolute; width: 56px; height: 56px; border-radius: 50%; background: #1f9d55; }

    /* code card */
    #code { position: absolute; left: 56px; top: 136px; width: 800px; background: #ffffff; border-radius: 18px; padding: 24px 34px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.12); }
    .c-head { height: 56px; display: flex; align-items: center; gap: 12px; font-size: 34px; font-weight: 900; white-space: nowrap; }
    .c-tag { margin-left: auto; font-size: 28px; font-weight: 700; color: #7d776b; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; }
    .c-row { position: relative; height: 50px; line-height: 50px; font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 30px;
      font-weight: 500; white-space: pre; }
    .c-cm { color: #8a8478; font-family: "JetBrains Mono", "Noto Sans SC", monospace; }
    #cr-op { font-weight: 700; margin: 0 -16px; padding: 0 16px; border-radius: 10px; background: rgba(253, 234, 231, 0); }
    #op0 { position: relative; display: inline-block; }
    #op-strike { position: absolute; left: -6px; right: -6px; top: 24px; height: 4px; background: #e0453a; transform-origin: 0 50%; }
    #op1 { display: inline-block; margin-left: 14px; color: #e0453a; font-weight: 800; font-size: 42px; line-height: 40px; }
    #op-tag { display: inline-block; margin-left: 16px; font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 800; color: #ffffff;
      background: #e0453a; border-radius: 8px; padding: 0 12px; line-height: 38px; vertical-align: 3px; }
    #op-bar { position: absolute; left: -4px; top: 8px; width: 6px; height: 34px; background: #2aa3c9; border-radius: 3px; transform-origin: 50% 100%; }

    #curve { position: absolute; left: 0; top: 0; }
    #fly-env { position: absolute; left: 0; top: 0; }

    #veil { position: absolute; inset: 0; background: #efebe3; }
    #end-card { position: absolute; left: 460px; top: 290px; width: 1000px; height: 320px; background: #fffdf8; border-radius: 28px;
      box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14); text-align: center; padding-top: 70px; }
    #end-title { font-size: 96px; font-weight: 900; line-height: 1.1; white-space: nowrap; }
    #end-sub { margin-top: 22px; font-size: 40px; font-weight: 700; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        <!--GRIDSVG-->
        <div id="gatelayer">
          <!--GATESVG-->
          <div id="gatepins"><!--GATEPINS--></div>
        </div>
        <div id="objlayer">
          <!--OBJSVG-->
          <div id="objpins"><!--OBJPINS--></div>
        </div>
      </div>

      <div id="tl">
        <div class="lab" id="tl-date">2025-02-21 · 以太坊</div>
        <div id="tl-amt" class="hide">约 <span id="amt-n">0</span> 亿美元</div>
        <div id="tl-fbi" class="hide">FBI 口径 · 事发时估值</div>
      </div>

      <div id="mx">
        <div id="mx-title">每个点 = 1 亿美元</div>
        <div id="mx-legend">
          <span class="lg" id="lg-green"><i class="lgd" style="background:#1f9d55"></i>在钱包里 <b id="lg-g" class="hide">×15</b></span>
          <span class="lg" id="lg-red"><i class="lgd" style="background:#e0453a"></i>被转走 <b id="lg-r">×0</b></span>
        </div>
        <div class="mx-t" id="mx-t0">事发前</div>
        <div class="mx-t" id="mx-t1">2 月 21 日</div>
        <div id="mx-line"></div>
        <!--DOTS-->
      </div>

      <div id="code" class="hide">
        <div class="c-head">
          <svg width="30" height="36" viewBox="0 0 30 36"><path d="M3 3h16l8 8v22H3z" fill="#ffffff" stroke="#1c1c1c" stroke-width="3" stroke-linejoin="round"/><path d="M19 3v8h8M8 18h14M8 24h14M8 30h9" fill="none" stroke="#1c1c1c" stroke-width="2.6"/></svg>
          <span>实际签下的交易</span><span class="c-tag">链上可查</span>
        </div>
        <div class="c-row c-cm" id="cr-cm"># 签名人屏幕上看不到这些字段</div>
        <div class="c-row" id="cr-to">to:        0x… (攻击者合约)</div>
        <div class="c-row" id="cr-val">value:     0</div>
        <div class="c-row" id="cr-data">data:      transfer(address,uint256)</div>
        <div class="c-row" id="cr-op"><i id="op-bar"></i>operation: <span id="op0">0<i id="op-strike"></i></span><span id="op1" class="hide">1</span><span id="op-tag" class="hide">DELEGATECALL</span></div>
      </div>

      <!--CURVE-->
      <div id="fly-env"><div class="ctr a-c"><div class="env hide" id="fly-env-in"><svg width="64" height="44" viewBox="0 0 64 44"><rect x="2" y="2" width="60" height="40" rx="5" fill="#fde6e3" stroke="#e0453a" stroke-width="3"/><path d="M4 5L32 26L60 5" fill="none" stroke="#e0453a" stroke-width="3" stroke-linejoin="round"/></svg></div></div></div>

      <div id="pills">
        <div class="pill" id="pill-0">① 看到了什么</div>
        <div class="pill" id="pill-1">② 签下了什么</div>
        <div class="pill" id="pill-2">③ 断在哪一关</div>
      </div>
    </div>

    <div id="veil" class="hide"></div>
    <div id="end-card" class="hide">
      <div id="end-title">攻击者不再偷私钥</div>
      <div id="end-sub" class="hide">第 29 章 · 签名路径</div>
    </div>
  </div>
  <script>
    (function () {
      /*K*/
      const IO = "power2.inOut";
      const tl = gsap.timeline({ paused: true });
      const pop = (s, t, d) => tl.fromTo(s, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: d || 0.25, ease: "back.out(1.4)" }, t);
      const out = (s, t, d) => tl.to(s, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const fade = (s, t, d, v) => tl.to(s, { opacity: v === undefined ? 1 : v, duration: d || 0.25, ease: "power1.out" }, t);
      const cam = (t, c, d) => {
        tl.to("#cam", { x: c.x, y: c.y, scale: c.scale, duration: d || 1.0, ease: IO }, t);
        tl.to(".wl", { scale: 1 / c.scale, duration: d || 1.0, ease: IO }, t);
      };
      const roll = (sel, a, b, t, d, pre, ez) => {
        const el = document.querySelector(sel); const o = { v: a };
        tl.fromTo(o, { v: a }, { v: b, duration: d, ease: ez || "power1.out", immediateRender: false, onUpdate: () => { el.textContent = (pre || "") + Math.round(o.v); } }, t);
      };
      const pill = (n, t) => [0, 1, 2].forEach((j) => tl.to("#pill-" + j, {
        backgroundColor: j === n ? "#1c1c1c" : "#ffffff", color: j === n ? "#ffffff" : "#1c1c1c", borderColor: j === n ? "#1c1c1c" : "#e2ddd3",
        opacity: j === n ? 1 : 0.5, duration: 0.3, ease: "power1.out" }, t));

      // ---------- frame 0: the whole world is already there
      tl.set("#cam", K.CAM.c1, 0);
      tl.set(".wl", { scale: 1 / K.CAM.c1.scale }, 0);
      tl.set("#l-vault, #l-brw, #l-s3", { opacity: 0.55 }, 0);
      K.gateOrigins.forEach((p, i) => tl.set("#gate-" + i, { scaleY: 0, svgOrigin: p[0] + " " + p[1] }, 0));

      // ---------- l1 · 0–7.4 · the cold wallet and the loss
      tl.to("#l-vault", { opacity: 1, backgroundColor: "#1d93ba", borderColor: "#1d93ba", color: "#ffffff", duration: 0.25 }, 2.46);
      tl.fromTo("#l-vault", { scale: 1.12 }, { scale: 1, duration: 0.35, ease: "back.out(1.4)", immediateRender: false }, 2.46);
      cam(3.60, K.CAM.c1b, 1.0);
      pop("#tl-amt", 5.23, 0.3);
      roll("#amt-n", 0, 15, 5.23, 0.9);
      // dots are full from frame 0; at "15 亿" the legend counts them while each dot pulses once
      fade("#lg-g", 5.23, 0.1);
      roll("#lg-g", 1, 15, 5.23, 0.9, "×", "none");
      for (let i = 0; i < 15; i++) {
        tl.to("#dot-" + i, { scale: 1.18, duration: 0.12, ease: "power2.out" }, 5.23 + i * 0.06);
        tl.to("#dot-" + i, { scale: 1, duration: 0.18, ease: "power2.in" }, 5.35 + i * 0.06);
      }
      pop("#tl-fbi", 5.40, 0.25);
      out("#tl, #mx", 7.45, 0.25);

      // ---------- l2 · 7.4–13 · keys locked, signers confirm
      cam(7.30, K.CAM.c2, 1.1);
      for (let i = 0; i < 3; i++) pop("#lk-" + i, 7.53 + i * 0.08, 0.3);
      for (let i = 0; i < 3; i++) pop("#lk-ck-" + i, 8.68 + i * 0.06, 0.25);
      pop("#l-key", 8.75);
      for (let i = 0; i < 3; i++) {
        const t = 9.56 + i * 0.25;
        fade("#scr-on-" + i, t, 0.2);
        fade("#sg-" + i, t, 0.4);
        fade("#ui-" + i, t + 0.1, 0.2);
      }
      pop("#l-sign", 9.62);
      [11.15, 11.45, 12.48].forEach((t, i) => {
        tl.to("#btn-" + i, { attr: { fill: "#1f9d55" }, duration: 0.15 }, t);
        const dx = K.hub[0] - K.envStart[i][0] + (i - 1) * 10, dy = K.hub[1] - K.envStart[i][1] - i * 8;
        fade("#env-" + i, t + 0.05, 0.1);
        tl.fromTo("#env-" + i, { x: 0 }, { x: dx, duration: 0.75, ease: IO }, t + 0.05);
        tl.fromTo("#env-" + i, { y: 0 }, { y: Math.min(0, dy) - 90, duration: 0.37, ease: "power2.out" }, t + 0.05);
        tl.to("#env-" + i, { y: dy, duration: 0.38, ease: "power2.in" }, t + 0.42);
      });

      // ---------- l3 · 13–18 · what the screen showed
      cam(14.20, K.CAM.c3, 1.0);
      pill(0, 14.40);
      for (let i = 0; i < 3; i++) fade("#ui2-" + i, 14.45, 0.2);
      fade("#brw-hint", 14.70, 0.4, 0.9);
      fade("#l-brw, #l-s3", 14.70, 0.3);
      for (let i = 0; i < 3; i++) tl.fromTo("#ui3-" + i, { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.4)" }, 16.09);

      // ---------- l4 · 18–23.7 · what was actually signed
      cam(17.95, K.CAM.c45, 1.1);
      out("#l-sign, #l-key", 17.95, 0.2);
      pill(1, 18.13);
      tl.fromTo("#code", { x: -880, opacity: 1 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 18.13);
      tl.to("#cr-to, #cr-val, #cr-data", { opacity: 0.3, duration: 0.3, ease: "power1.out" }, 20.08);
      tl.fromTo("#op-bar", { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: "power2.out" }, 20.82);
      // 20.42–20.82 and 21.02–21.85: hold. 21.85: the one strong moment.
      tl.fromTo("#op-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: "power2.out" }, 21.85);
      tl.to("#op0", { color: "#7d776b", duration: 0.18 }, 21.85);
      tl.to("#cr-op", { backgroundColor: "#fdeae7", duration: 0.15 }, 21.85);
      tl.fromTo("#op1", { opacity: 0, y: -40, scale: 1.5 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" }, 21.90);
      pop("#op-tag", 22.05, 0.25);
      tl.fromTo("#stage", { scale: 1, transformOrigin: "330px 441px" }, { scale: 1.06, transformOrigin: "330px 441px", duration: 0.6, ease: "power2.out" }, 21.85);
      tl.to("#stage", { scale: 1, duration: 0.45, ease: IO }, 23.30);

      // ---------- l5 · 23.7–31 · one number reaches the wallet
      pop("#cv-dot", 23.95, 0.2);
      tl.fromTo("#cv-mpath", { strokeDashoffset: K.L }, { strokeDashoffset: 0, duration: 0.6, ease: IO }, 23.95);
      pop("#cv-end", 24.50, 0.25);
      pop("#l-impl", 24.55);
      const fp = { p: 0 };
      const bz = (t) => [0, 1].map((k) => (1 - t) ** 3 * K.P0[k] + 3 * (1 - t) ** 2 * t * K.P1[k] + 3 * (1 - t) * t * t * K.P2[k] + t ** 3 * K.E[k]);
      tl.set("#fly-env", { x: K.P0[0], y: K.P0[1] }, 0);
      fade("#fly-env-in", 26.07, 0.1);
      tl.fromTo(fp, { p: 0 }, { p: 1, duration: 0.85, ease: IO, onUpdate: () => { const q = bz(fp.p); gsap.set("#fly-env", { x: q[0], y: q[1] }); } }, 26.07);
      tl.to("#fly-env-in", { scale: 0.4, opacity: 0, duration: 0.18, ease: "power2.in" }, 26.80);
      fade("#mx", 26.50, 0.3);
      fade("#v-impl", 27.77, 0.25, 0);
      fade("#v-impl-wire", 27.77, 0.25);
      pop("#bdg-impl", 27.85, 0.3);
      pop("#l-slot", 28.05);
      tl.fromTo("#v-atk", { opacity: 0, y: -240 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }, 28.63);
      pop("#l-atk", 28.95);
      for (let i = 0; i < 15; i++) tl.to("#dot-" + i, { backgroundColor: "#e0453a", y: 270, duration: 0.4, ease: IO }, 28.63 + i * 0.06);
      // the gold is pulled up out of the vault and away, with the dots
      for (let i = 0; i < 11; i++) tl.to("#gold-" + i, { x: 240, y: -460, opacity: 0, duration: 0.6, ease: "power2.in" }, 28.70 + i * 0.08);
      roll("#lg-g", 15, 0, 28.70, 1.15, "×", "none");
      roll("#lg-r", 0, 15, 28.70, 1.15, "×", "none");
      fade("#lg-red", 28.63, 0.3);
      fade("#lg-green", 28.63, 0.3, 0.45);

      // ---------- l6 · 31–37.9 · the keys were fine; the file was swapped
      out("#code, #curve, #mx, #l-slot, #l-impl", 31.15, 0.25);
      cam(31.30, K.CAM.c6, 1.1);
      out("#l-key", 31.40, 0.15);
      pop("#l-key2", 31.50);
      fade("#l-sign", 31.50, 0.25, 0.4);
      fade("#l-brw", 31.30, 0.25, 0.4);
      for (let i = 0; i < 3; i++) {
        tl.to("#lk-ck-" + i, { scale: 1.15, duration: 0.15, ease: "power2.out" }, 31.45 + i * 0.06);
        tl.to("#lk-ck-" + i, { scale: 1, duration: 0.2, ease: "power2.in" }, 31.60 + i * 0.06);
      }
      fade("#brw-solid", 33.81, 0.3, 0);
      fade("#brw-hint", 33.81, 0.2, 0);
      fade("#brw-wire", 33.81, 0.3);
      pop("#bdg-brw", 33.90, 0.3);
      pop("#l-js", 34.00);
      fade(".env-red", 35.43, 0.2);
      tl.fromTo("#hubx", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" }, 35.43);
      pop("#l-file", 35.55);

      // ---------- l7 · 38–43.2 · the seven gates
      pill(2, 38.10);
      tl.to("#objlayer", { opacity: 0, scale: 0.94, transformOrigin: K.objCentre[0] + "px " + K.objCentre[1] + "px", duration: 0.5, ease: "power2.in" }, 38.10);
      cam(38.10, K.CAM.c7, 1.1);
      fade("#road-g", 38.70, 0.4);
      K.gateOrigins.forEach((p, i) => {
        const t = 39.58 + i * 0.35;
        tl.to("#gate-" + i, { scaleY: 1, svgOrigin: p[0] + " " + p[1], duration: 0.45, ease: "back.out(1.4)" }, t);
        pop("#l-g" + i, t + 0.2);
      });
      const du = 2390;
      fade("#genv", 39.70, 0.15);
      tl.fromTo("#genv", { x: 0, y: 0 }, { x: du * 0.8192, y: -du * 0.5736 * 0.5, duration: 2.45, ease: "none" }, 39.75);
      fade("#gate-solid-3", 42.36, 0.25, 0);
      fade("#gg-3", 42.36, 0.25, 0);
      fade("#gate-wire-3", 42.36, 0.25);
      pop("#bdg-g3", 42.42, 0.3);
      tl.to("#l-g3", { backgroundColor: "#e0453a", borderColor: "#e0453a", color: "#ffffff", duration: 0.2 }, 42.36);

      // ---------- end card · 43.2–47.16 (still from 43.95)
      fade("#veil", 43.20, 0.4, 0.62);
      out("#genv", 43.20, 0.2);
      tl.fromTo("#end-card", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, 43.30);
      fade("#end-sub", 43.65, 0.3);

      window.__timelines["story"] = tl;
    })();
  </script>
</template>
