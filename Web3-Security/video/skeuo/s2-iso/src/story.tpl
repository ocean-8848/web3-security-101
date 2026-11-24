<template>
  <!-- Source template: edit this file, then run `node src/build-story.mjs` to regenerate compositions/story.html -->
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: #eeece6; font-family: "Noto Sans SC", sans-serif; color: #1b1b1b; }
    #cam { position: absolute; left: 0; top: 0; width: 4000px; height: 2200px; transform-origin: 0 0; }
    #world-svg { position: absolute; left: 0; top: 0; }
    .ff { fill: #ffffff; } .fs { fill: #d8d4cb; } .ft { fill: #fbfaf7; }
    .gate-red .ff { fill: #d9442e; } .gate-red .fs { fill: #a8341f; } .gate-red .ft { fill: #e8705c; }
    .pin { position: absolute; width: 0; height: 0; }
    .bc { position: absolute; left: 0; bottom: 0; transform: translateX(-50%); }
    .mono { font-family: "JetBrains Mono", monospace; }
    .hide { opacity: 0; }

    /* highlighter */
    .kw { position: relative; display: inline-block; }
    .kw .hl { position: absolute; left: -0.04em; right: -0.04em; bottom: 0.04em; height: 0.38em; background: #ffd84a; transform-origin: 0 50%; }
    .kw .t { position: relative; }

    /* white world cards */
    .wcard { background: #ffffff; border-radius: 18px; box-shadow: 0 16px 32px rgba(27,27,27,0.13), 0 2px 0 rgba(27,27,27,0.05); }

    /* gate labels */
    .lbl { white-space: nowrap; font-weight: 700; font-size: 34px; padding: 8px 20px 10px; background: #fff; border-radius: 14px;
      box-shadow: 0 10px 22px rgba(27,27,27,0.12); transform-origin: 50% 100%; }
    .lbl-n { margin-right: 10px; }
    .lbl-red { background: #d9442e; color: #fff; }

    /* transaction card */
    #card-shadow { position: absolute; left: -140px; top: -26px; width: 280px; height: 52px; border-radius: 50%; background: rgba(27,27,27,0.10); }
    #card-anchor { position: absolute; left: -150px; bottom: 26px; width: 300px; height: 204px; perspective: 1400px; }
    #card-scaler { position: absolute; inset: 0; transform-origin: 50% 100%; }
    #card-flip { position: absolute; inset: 0; transform-style: preserve-3d; }
    .face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: #fff; border-radius: 18px;
      box-shadow: 0 16px 30px rgba(27,27,27,0.15), 0 2px 0 rgba(27,27,27,0.05); }
    .face.back { transform: rotateY(180deg); padding: 14px 18px; }
    .front-doc { position: absolute; left: 26px; top: 34px; width: 74px; height: 96px; border: 4px solid #1b1b1b; border-radius: 8px; }
    .front-doc i { position: absolute; left: 12px; right: 12px; height: 5px; background: #1b1b1b; border-radius: 3px; }
    .front-t { position: absolute; left: 124px; top: 36px; font-size: 40px; font-weight: 900; }
    .front-s { position: absolute; left: 126px; top: 96px; font-size: 22px; font-weight: 700; color: #6d695f; }
    .b-head { font-size: 15px; font-weight: 700; color: #6d695f; margin-bottom: 6px; }
    .row { display: flex; align-items: baseline; justify-content: space-between; height: 38px; border-top: 2px solid #ece9e2; position: relative; }
    .row .k { font-family: "JetBrains Mono", monospace; font-size: 16px; font-weight: 700; }
    .row .v { font-size: 16px; font-weight: 700; }
    .row .v.mono { font-size: 13.5px; }
    .row.op { height: 70px; align-items: center; }
    #op-bg { position: absolute; left: -10px; right: -10px; top: 4px; bottom: 0; background: #ffd84a; border-radius: 10px; opacity: 0; }
    #op-q { font-family: "JetBrains Mono", monospace; font-size: 40px; color: #c9c4b9; }
    #op-1 { position: absolute; right: 6px; top: 0; font-family: "JetBrains Mono", monospace; font-weight: 800; font-size: 54px; line-height: 70px; color: #d9442e; opacity: 0; transform-origin: 50% 50%; }
    #card-alarm { position: absolute; inset: -7px; border: 6px solid #d9442e; border-radius: 24px; opacity: 0; }
    #seal { position: absolute; left: 160px; top: -30px; width: 92px; height: 92px; border-radius: 50%; border: 6px solid #1b1b1b; color: #1b1b1b;
      font-size: 40px; font-weight: 900; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); opacity: 0; }
    #op-legend { position: absolute; left: 10px; right: 10px; top: 216px; padding: 3px 0 5px; border-radius: 8px; background: #eeece6; text-align: center; font-family: "JetBrains Mono", monospace; font-size: 15px; font-weight: 700; color: #1b1b1b; opacity: 0; white-space: nowrap; }

    /* gate 4 monitor */
    #mon { width: 380px; transform-origin: 50% 100%; }
    .mon-screen { background: #fff; border: 5px solid #1b1b1b; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 30px rgba(27,27,27,0.14); }
    .mon-head { background: #1b1b1b; color: #fff; font-size: 26px; font-weight: 700; padding: 6px 18px 8px; }
    .mon-body { padding: 12px 18px 16px; position: relative; }
    .mrow { display: flex; justify-content: space-between; font-size: 28px; font-weight: 700; line-height: 1.5; }
    .mrow span { color: #6d695f; font-weight: 500; }
    .mrow .mono { font-size: 24px; }
    #mon-ok { margin-top: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 26px; font-weight: 700; padding: 2px 14px 4px; border: 3px solid #1b1b1b; border-radius: 10px; opacity: 0; }
    .mon-stem { width: 24px; height: 34px; margin: 0 auto; background: #1b1b1b; }

    /* signers */
    #sign { padding: 18px 24px 22px; transform-origin: 50% 100%; white-space: nowrap; }
    .wc-h { font-size: 30px; font-weight: 700; margin-bottom: 14px; }
    .wc-h small { font-size: 22px; color: #8a857a; font-weight: 500; margin-left: 8px; }
    .checks { display: flex; gap: 18px; align-items: center; }
    .ck { width: 64px; height: 64px; border-radius: 50%; border: 5px solid #1b1b1b; display: flex; align-items: center; justify-content: center; background: #fff; }
    .ck svg { opacity: 0; }
    .dots { font-size: 40px; font-weight: 900; color: #8a857a; }

    /* key tag */
    #keytag { padding: 14px 22px 16px; display: flex; align-items: center; gap: 14px; white-space: nowrap; transform-origin: 0 100%; }
    #keytag .kt { font-size: 34px; font-weight: 900; }
    #key-ok { font-size: 28px; font-weight: 700; padding: 2px 14px 4px; border: 3px solid #1b1b1b; border-radius: 10px; opacity: 0; }

    /* storage panel */
    #store { width: 560px; padding: 18px 24px 24px; transform-origin: 50% 100%; position: relative; }
    .slot { position: relative; display: flex; align-items: center; gap: 18px; height: 84px; border: 4px solid #1b1b1b; border-radius: 14px; padding: 0 16px; }
    .slot-k { font-size: 26px; font-weight: 700; }
    .slot .kw { font-size: 30px; font-weight: 700; }
    .chip { position: absolute; right: 12px; top: 12px; height: 52px; padding: 0 16px; border-radius: 10px; display: flex; align-items: center;
      font-size: 26px; font-weight: 700; white-space: nowrap; }
    #chip-old { background: #fff; border: 3px solid #1b1b1b; }
    #atk { position: absolute; right: 12px; top: 12px; width: 190px; height: 52px; }
    #chip-new { right: 0; top: 0; background: #d9442e; color: #fff; }
    #atk-label { position: absolute; right: 0; bottom: 62px; font-family: "JetBrains Mono", monospace; font-size: 26px; font-weight: 700; color: #d9442e; white-space: nowrap; }

    /* screen-space titles */
    .tb { position: absolute; right: 88px; top: 64px; text-align: right; white-space: nowrap; }
    .t-big { font-weight: 900; font-size: 88px; line-height: 1.12; letter-spacing: 0.01em; }
    .t-huge { font-weight: 900; font-size: 96px; line-height: 1.12; }
    .t-tag { font-weight: 700; font-size: 34px; line-height: 1.5; margin: 4px 0 6px; }
    .t-note { font-weight: 500; font-size: 30px; color: #6d695f; line-height: 1.5; }
    .w { display: inline-block; }

    /* end card */
    #end { position: absolute; inset: 0; }
    #end-title { position: absolute; left: 160px; top: 330px; font-weight: 900; font-size: 120px; line-height: 1.1; white-space: nowrap; }
    #end-sub { position: absolute; left: 166px; top: 500px; font-weight: 700; font-size: 40px; color: #1b1b1b; white-space: nowrap; }
    #end-rule { position: absolute; left: 166px; top: 476px; width: 120px; height: 8px; background: #1b1b1b; transform-origin: 0 50%; }
    #end-gate { position: absolute; left: 1240px; top: 190px; width: 420px; height: 580px; }
    #end-gate-in { transform-origin: 50% 100%; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div id="cam" data-layout-allow-overflow data-layout-ignore>
      <!--SVG-->
      <div id="world-html">
        <!--LABELS-->

        <div class="pin" id="key-pin" data-at="3080,150,230">
          <div id="keytag" class="wcard hide">
            <svg width="40" height="48" viewBox="0 0 40 48"><rect x="4" y="20" width="32" height="25" rx="5" fill="#1b1b1b"/><path d="M11 21V14a9 9 0 0 1 18 0v7" fill="none" stroke="#1b1b1b" stroke-width="5"/></svg>
            <span class="kt">私钥</span><span id="key-ok">完好</span>
          </div>
        </div>

        <div class="pin" id="sign-pin" data-at="2500,-420,300">
          <div class="bc"><div id="sign" class="wcard hide">
            <div class="wc-h">签名人确认<small>示意</small></div>
            <div class="checks">
              <span class="ck" id="ck-0"><svg width="34" height="28" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <span class="ck" id="ck-1"><svg width="34" height="28" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <span class="ck" id="ck-2"><svg width="34" height="28" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <span class="dots">…</span>
            </div>
          </div></div>
        </div>

        <div class="pin" id="mon-pin" data-at="1260,0,335">
          <div class="bc"><div id="mon" class="hide">
            <div class="mon-screen">
              <div class="mon-head">④ 显示与解码</div>
              <div class="mon-body">
                <div class="mrow"><span>操作</span>转账</div>
                <div class="mrow"><span>收款</span><b class="mono">0x…（示例）</b></div>
                <div id="mon-ok"><svg width="26" height="22" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#1b1b1b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>看起来正常</div>
              </div>
            </div>
            <div class="mon-stem"></div>
          </div></div>
        </div>

        <div class="pin" id="store-pin" data-at="2950,0,320">
          <div class="bc"><div id="store" class="wcard hide">
            <div class="wc-h">Safe 代理 · 存储</div>
            <div class="slot" id="slot">
              <span class="mono slot-k">slot 0</span>
              <span class="kw"><span class="hl" id="impl-hl"></span><span class="t">实现合约</span></span>
              <span class="chip" id="chip-old">Safe 实现</span>
              <div id="atk" class="hide">
                <div id="atk-label">DELEGATECALL</div>
                <span class="chip" id="chip-new">攻击者合约</span>
              </div>
            </div>
          </div></div>
        </div>

        <div class="pin" id="card-pin" data-at="-110,0,0">
          <div id="card-mover" class="hide">
            <div id="card-shadow"></div>
            <div id="card-lift">
              <div id="card-anchor"><div id="card-scaler"><div id="card-flip">
                <div class="face front">
                  <div class="front-doc"><i style="top:18px"></i><i style="top:36px"></i><i style="top:54px;right:26px"></i></div>
                  <div class="front-t">交易单</div>
                  <div class="front-s">转账 · 示意</div>
                </div>
                <div class="face back">
                  <div class="b-head">实际签下的交易</div>
                  <div class="row"><span class="k">to</span><span class="v">攻击者合约</span></div>
                  <div class="row"><span class="k">data</span><span class="v mono">transfer(address,uint256)</span></div>
                  <div class="row op"><div id="op-bg"></div>
                    <span class="k kw" style="font-size:22px;position:relative"><span class="hl" id="op-hl"></span><span class="t">operation</span></span>
                    <span class="v" style="position:relative"><span id="op-q">?</span></span>
                    <span id="op-1">1</span>
                  </div>
                  <div id="card-alarm"></div>
                  <div id="seal">签</div>
                </div>
              </div></div>
              <div id="op-legend">0 = CALL　·　1 = DELEGATECALL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="titles">
      <div class="tb" id="t1">
        <div class="t-big"><span class="w" id="t1-w0">2025 年</span> <span class="w" id="t1-w1">2 月</span> <span class="w" id="t1-w2">21 日</span></div>
        <div class="t-tag hide" id="t1-tag">Bybit · 以太坊冷钱包</div>
        <div class="t-huge hide" id="t1-amt">约 <span class="kw"><span class="hl" id="t1-hl"></span><span class="t">15 亿美元</span></span></div>
        <div class="t-note hide" id="t1-note">FBI 口径 · 事发时估值</div>
      </div>
      <div class="tb" id="t2">
        <div class="t-big"><span class="w hide" id="t2-a">私钥</span> <span class="w hide kw" id="t2-b"><span class="hl" id="t2-hl"></span><span class="t">未泄露</span></span></div>
        <div class="t-tag hide" id="t2-tag">签名人 · 按流程逐个确认</div>
      </div>
      <div class="tb" id="t6">
        <div class="t-big hide" id="t6-a">钥匙没丢</div>
        <div class="t-big hide" id="t6-b"><span class="kw"><span class="hl" id="t6-hl"></span><span class="t">文件</span></span>被换了</div>
      </div>
      <div class="tb" id="t7">
        <div class="t-huge hide" id="t7-a">签名路径 · <span class="kw"><span class="hl" id="t7-hl"></span><span class="t">七道关</span></span></div>
        <div class="t-tag hide" id="t7-tag">从提出到上链</div>
      </div>
    </div>

    <div id="end">
      <div id="end-title"><span class="w hide" id="e-w0">攻击者</span><span class="w hide" id="e-w1">不再偷</span><span class="w hide kw" id="e-w2"><span class="hl" id="end-hl"></span><span class="t">私钥</span></span></div>
      <div id="end-rule"></div>
      <div id="end-sub" class="hide">第 29 章 · 签名路径</div>
      <div id="end-gate"><div id="end-gate-in" class="hide"><!--ENDGATE--></div></div>
    </div>
  </div>
  <script>
    (function () {
      const D = Math.PI / 180, CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
      const W = (u, v, z) => [900 + u * CA + v * SA, 1700 - u * SA * SE + v * CA * SE - (z || 0) * CE];
      const cam = (u, v, z, sx, sy, k) => { const p = W(u, v, z); return { x: sx - k * p[0], y: sy - k * p[1], scale: k }; };
      const cardAt = (u) => ({ x: (u + 110) * CA, y: -(u + 110) * SA * SE });
      const GU = (i) => i * 420;
      const IO = "power2.inOut";
      const tl = gsap.timeline({ paused: true });

      const blurIn = (s, t, d) => tl.fromTo(s, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: d || 0.18, ease: "power2.out" }, t);
      const blurOut = (s, t) => tl.to(s, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, t);
      const pop = (s, t) => tl.fromTo(s, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, t);
      const hl = (s, t) => tl.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, t);
      const camTo = (t, d, a) => tl.to("#cam", Object.assign({ duration: d, ease: IO }, cam.apply(null, a)), t);
      const hop = (t, u, d) => tl.to("#card-mover", Object.assign({ duration: d || 0.6, ease: "expo.out" }, cardAt(u)), t);

      tl.set(".hl", { scaleX: 0 }, 0);
      tl.set("#cam", cam(1350, 0, 150, 700, 690, 0.5), 0);
      tl.set("#card-mover", cardAt(310), 0);

      // ---------- l1 · 0–7.4: the road, then the cold wallet and the loss
      ["#t1-w0", "#t1-w1", "#t1-w2"].forEach((s, i) => blurIn(s, 0.70 + i * 0.067, 0.14));
      blurIn("#t1-tag", 2.46);
      const vo = W(2950, 150, 0);
      tl.fromTo("#vault", { scaleY: 0, svgOrigin: vo[0] + " " + vo[1] }, { scaleY: 1, svgOrigin: vo[0] + " " + vo[1], duration: 0.6, ease: "expo.out" }, 3.60);
      camTo(3.55, 1.2, [2950, 0, 150, 960, 620, 0.9]);
      blurIn("#t1-amt", 5.23);
      hl("#t1-hl", 5.40);
      blurIn("#t1-note", 5.45);
      blurOut("#t1", 7.30);

      // ---------- l2 · 7.4–13: key intact, signers confirm
      camTo(7.40, 1.1, [2820, 0, 170, 1010, 640, 1.3]);
      blurIn("#t2-a", 7.53);
      pop("#keytag", 7.62);
      blurIn("#t2-b", 8.68);
      hl("#t2-hl", 8.80);
      tl.to("#vault-lamp", { attr: { fill: "#1b1b1b" }, duration: 0.15 }, 8.68);
      pop("#key-ok", 8.75);
      pop("#sign", 9.56);
      blurIn("#t2-tag", 9.62);
      [10.55, 11.45, 12.48].forEach((t, i) => {
        tl.to("#ck-" + i, { backgroundColor: "#1b1b1b", duration: 0.15 }, t);
        tl.to("#ck-" + i + " svg", { opacity: 1, duration: 0.15 }, t);
        tl.fromTo("#ck-" + i, { scale: 1.18 }, { scale: 1, duration: 0.4, ease: "expo.out" }, t);
      });
      blurOut("#t2", 12.85);
      tl.to(["#sign", "#keytag"], { opacity: 0, duration: 0.2 }, 12.85);

      // ---------- l3 · 13–18: the slip walks the road to gate 4
      camTo(12.85, 1.0, [560, 0, 150, 760, 600, 0.9]);
      tl.fromTo("#card-mover", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 13.35);
      tl.fromTo("#card-scaler", { scale: 0.7 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 13.35);
      hop(13.85, 730, 0.55); hop(14.42, 1150, 0.6);
      camTo(14.30, 1.1, [1150, 0, 260, 840, 590, 1.3]);
      tl.fromTo("#mon", { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.45, ease: "expo.out" }, 14.40);
      tl.fromTo("#mon-ok", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: "expo.out" }, 16.09);

      // ---------- l4 · 18–23.7: flip the slip — operation = 1
      const cb = W(1150, 0, 0);
      const cc = [cb[0] - 300, cb[1] - 40 - 26 - 102 * 1.5];
      tl.to("#cam", { x: 760 - 1.45 * cc[0], y: 590 - 1.45 * cc[1], scale: 1.45, duration: 1.0, ease: IO }, 18.15);
      tl.to("#card-lift", { x: -300, y: -40, duration: 0.9, ease: IO }, 18.30);
      tl.to("#card-scaler", { scale: 1.5, duration: 0.9, ease: IO }, 18.30);
      tl.to("#card-flip", { rotationY: 180, duration: 0.6, ease: IO }, 20.08);
      hl("#op-hl", 20.82);
      // 20.95–21.85 hold, then the one strong moment
      tl.set("#op-q", { opacity: 0 }, 21.85);
      tl.fromTo("#op-1", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 21.85);
      tl.to("#op-bg", { opacity: 1, duration: 0.12 }, 21.85);
      tl.to("#gate-3 .ff", { fill: "#d9442e", duration: 0.3 }, 21.90);
      tl.to("#gate-3 .fs", { fill: "#a8341f", duration: 0.3 }, 21.90);
      tl.to("#gate-3 .ft", { fill: "#e8705c", duration: 0.3 }, 21.90);
      tl.to("#cam", { x: 760 - 1.62 * cc[0], y: 600 - 1.62 * cc[1], scale: 1.62, duration: 0.5, ease: IO }, 21.85);
      blurIn("#op-legend", 22.45, 0.2);

      // ---------- l5 · 23.7–31: slip enters the wallet, the implementation is swapped
      tl.to(["#op-legend", "#mon"], { opacity: 0, duration: 0.2 }, 23.75);
      tl.to("#card-lift", { x: 0, y: 0, duration: 0.6, ease: IO }, 23.80);
      tl.to("#card-scaler", { scale: 1, duration: 0.6, ease: IO }, 23.80);
      camTo(23.90, 1.2, [2350, 0, 150, 900, 620, 0.85]);
      hop(24.30, 1570, 0.45); hop(24.75, 1990, 0.45); hop(25.20, 2410, 0.45);
      hop(25.65, 2790, 0.5);
      tl.to("#card-scaler", { scale: 0.3, duration: 0.45, ease: "power3.in" }, 25.70);
      tl.to("#card-mover", { opacity: 0, duration: 0.2 }, 25.95);
      camTo(25.90, 1.1, [2950, 0, 470, 900, 560, 1.15]);
      tl.fromTo("#store", { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.5, ease: "expo.out" }, 26.00);
      tl.fromTo("#atk", { opacity: 0, x: 380 }, { opacity: 1, x: 300, duration: 0.6, ease: "expo.out" }, 26.30);
      hl("#impl-hl", 27.77);
      tl.to("#chip-old", { x: -40, y: 70, opacity: 0, duration: 0.35, ease: "power3.in" }, 28.63);
      tl.to("#atk-label", { opacity: 0, duration: 0.2 }, 28.63);
      tl.to("#atk", { x: 0, duration: 0.6, ease: "expo.out" }, 28.80);
      tl.to("#slot", { borderColor: "#d9442e", duration: 0.25 }, 29.05);

      // ---------- l6 · 31–37.9: the key never left; the paper changed
      camTo(31.30, 1.2, [2700, 0, 250, 780, 640, 1.0]);
      blurIn("#t6-a", 31.40);
      tl.to("#keytag", { opacity: 1, duration: 0.25 }, 31.45);
      tl.fromTo("#key-ok", { scale: 1.3 }, { scale: 1, duration: 0.35, ease: "expo.out" }, 32.53);
      tl.set("#card-mover", cardAt(2790), 33.70);
      tl.to("#card-mover", Object.assign({ opacity: 1, duration: 0.6, ease: "expo.out" }, cardAt(2440)), 33.81);
      tl.to("#card-scaler", { scale: 1.15, duration: 0.6, ease: "expo.out" }, 33.81);
      tl.to("#card-lift", { y: -40, duration: 0.6, ease: "expo.out" }, 33.81);
      tl.to("#card-alarm", { opacity: 1, duration: 0.2 }, 34.10);
      blurIn("#t6-b", 33.85);
      hl("#t6-hl", 35.43);
      tl.fromTo("#seal", { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.35, ease: "expo.out" }, 35.50);
      blurOut("#t6", 37.75);
      tl.to(["#keytag", "#store", "#card-mover"], { opacity: 0, duration: 0.25 }, 37.75);

      // ---------- l7 · 38–43.2: dolly along the seven gates
      camTo(38.05, 1.0, [-60, 0, 200, 700, 640, 0.95]);
      tl.to("#cam", Object.assign({ duration: 3.4, ease: IO }, cam(2620, 0, 200, 1000, 660, 0.95)), 39.10);
      for (let i = 0; i < 7; i++) {
        tl.fromTo("#lbl-" + i, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 38.70 + i * 0.5);
      }
      blurIn("#t7-a", 39.58);
      blurIn("#t7-tag", 41.13);
      hl("#t7-hl", 42.36);

      // ---------- end card · 43.2–47.16
      blurOut("#t7", 43.15);
      tl.to("#cam", { opacity: 0, duration: 0.45, ease: IO }, 43.20);
      ["#e-w0", "#e-w1", "#e-w2"].forEach((s, i) => blurIn(s, 43.50 + i * 0.1, 0.16));
      tl.fromTo("#end-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "expo.out" }, 43.85);
      tl.fromTo("#end-gate-in", { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.6, ease: "expo.out" }, 43.55);
      hl("#end-hl", 44.00);
      blurIn("#end-sub", 44.15, 0.2);
      // everything is still from 44.4 to 47.16

      window.__timelines["story"] = tl;
    })();
  </script>
</template>
