/* ep15 kit-ext runtime — browser helpers for objects built with ep15/kit-ext/objects-ext.mjs (delegateTag, gasPump).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX15. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX15.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose attributes are rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   delegateTag ID-tag (transform), ID-tag-r (transform), ID-lead / ID-tgt (text, fill, size);
 *   gasPump ID-nozzle (transform), ID-hose (d), ID-level (transform), ID-scr-t (text, fill, size).
 */
(function () {
  if (window.KITX15) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var em = function (s) { var n = 0; for (var i = 0; i < s.length; i++) n += s.charCodeAt(i) < 128 ? 0.6 : 1; return Math.max(1, n); };

  // ---------- primitives (private)
  function tw(tl, key, t, to, dur, ease, apply, init) {
    var from = key in last ? last[key] : init();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
    return from;
  }
  function op(tl, el, t, to, dur, ease) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.2 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }
  /** discrete state switch at time t: apply(next) after t, apply(prev) before t (seek-safe both ways) */
  function step(tl, key, t, next, init, apply) {
    var prev = key in last ? last[key] : init();
    last[key] = next;
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: 0.001, ease: "none", immediateRender: false, onUpdate: function () { apply(o.k > 0 ? next : prev); } }, t);
  }
  function textState(el) { return { text: el.textContent, fill: el.getAttribute("fill"), size: +el.getAttribute("font-size") }; }
  function textApply(el) { return function (q) { el.textContent = q.text; el.setAttribute("fill", q.fill); el.setAttribute("font-size", q.size); }; }

  // =================================================================== delegateTag
  var TAG_COL = { normal: "#17607a", attacker: "#e0453a", cleared: "#6d685e" };
  /** damped swing of the hanging tag about its clip; amp in degrees */
  function tagSwing(tl, p, t, amp, dur) {
    var g = $(p + "-tag-r"); if (!g) return t;
    amp = amp == null ? 7 : amp; dur = dur == null ? 1.6 : dur;
    var cx = num(g, "cx", 0), cy = num(g, "cy", 0), o = { a: 0 };
    var set = function (q) { var a = q >= 1 ? 0 : amp * Math.exp(-3.2 * q) * Math.sin(q * Math.PI * 5); g.setAttribute("transform", "rotate(" + r2(a) + " " + cx + " " + cy + ")"); };
    tl.fromTo(o, { a: 0 }, { a: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () { set(o.a); } }, t);
    return t + dur;
  }
  /** tag (with clip) drops from above the clip and swings to rest; returns end time (drop end, swing continues ~1.4 s) */
  function tagDrop(tl, p, t, dur) {
    var g = $(p + "-tag"); if (!g) return t;
    dur = dur == null ? 0.45 : dur;
    var D = num(g, "dy", -26);
    op(tl, p + "-clipg", t, 1, 0.15);
    op(tl, g, t, 1, 0.12);
    tw(tl, "tagy:" + p, t, 0, dur, "bounce.out", function (a) { g.setAttribute("transform", "translate(0 " + r2(a) + ")"); },
      function () { return num(g, "on", 1) ? 0 : D; });
    tagSwing(tl, p, t + dur * 0.6, 8, 1.4);
    return t + dur;
  }
  /** tag (and clip) fade out */
  function tagHide(tl, p, t, dur) { dur = dur == null ? 0.25 : dur; op(tl, p + "-tag", t, 0, dur); op(tl, p + "-clipg", t, 0, dur); }
  /** change the target text (and colour by tone "normal" / "attacker" / "cleared") */
  function tagText(tl, p, t, target, tone) {
    var el = $(p + "-tgt"), ld = $(p + "-lead"); if (!el) return;
    var col = TAG_COL[tone] || TAG_COL.normal, s = String(target == null ? "" : target);
    var sz = Math.round(Math.min(12, 48 / em(s)) * 10) / 10;
    step(tl, "tgt:" + p, t, { text: s, fill: col, size: sz }, function () { return textState(el); }, textApply(el));
    if (ld) step(tl, "lead:" + p, t, { text: ld.textContent, fill: col, size: +ld.getAttribute("font-size") }, function () { return textState(ld); }, textApply(ld));
  }
  /** grey "已清零" overlay on / off */
  function tagClear(tl, p, t, on, dur) { op(tl, p + "-clear", t, on === false ? 0 : 1, dur == null ? 0.3 : dur); }
  /** state switch: "normal" (teal) / "attacker" (red) / "cleared" (grey overlay); target optional (default per state) */
  function tagState(tl, p, t, state, target, dur) {
    dur = dur == null ? 0.25 : dur;
    op(tl, p + "-bd-n", t, state === "attacker" ? 0 : 1, dur);
    op(tl, p + "-bd-a", t, state === "attacker" ? 1 : 0, dur);
    if (state !== "cleared") tagText(tl, p, t, target != null ? target : state === "attacker" ? "攻击者合约" : "钱包实现", state);
    else if (target != null) tagText(tl, p, t, target, "cleared");
    tagClear(tl, p, t, state === "cleared", dur);
    tagSwing(tl, p, t, 4, 1.0);
  }
  /** a soft highlight flash on the tag face ("挂牌轻轻一亮") */
  function tagPulse(tl, p, t, dur) {
    dur = dur == null ? 0.8 : dur;
    op(tl, p + "-hl", t, 0.75, dur * 0.35, "power2.out");
    op(tl, p + "-hl", t + dur * 0.35, 0, dur * 0.65, "power2.in");
  }

  // =================================================================== gasPump
  /** nozzle out to a world-canvas point `to` ([x, y]), or true = reach 70 px toward the viewer (+v), false = back in the holster; returns end time */
  function pumpNozzle(tl, p, t, to, dur) {
    var g = $(p + "-nozzle"), h = $(p + "-hose"), root = $(p); if (!g) return t;
    dur = dur == null ? 0.6 : dur;
    var k = num(g, "k", 1), ox = num(root, "ox", 0), oy = num(root, "oy", 0);
    var tx = num(g, "tx", 0), ty = num(g, "ty", 0);
    var sx = ox + (tx - ox) * k, sy = oy + (ty - oy) * k;          // scaled tip (world canvas)
    var dx = 0, dy = 0;
    if (to === true || to == null) { dx = 0.574 * 70 / k; dy = 0.41 * 70 / k; }
    else if (to && to.length === 2) { dx = (to[0] - sx) / k; dy = (to[1] - sy) / k; }
    var x0 = num(h, "x0", 0), y0 = num(h, "y0", 0), gx = num(h, "gx", 0), gy = num(h, "gy", 0);
    var key = "noz:" + p, from = key in last ? last[key] : [0, 0];
    last[key] = [dx, dy];
    var o = { a: 0 };
    tl.fromTo(o, { a: 0 }, { a: 1, duration: dur, ease: "power2.inOut", immediateRender: false, onUpdate: function () {
      var x = from[0] + (dx - from[0]) * o.a, y = from[1] + (dy - from[1]) * o.a;
      g.setAttribute("transform", "translate(" + r2(x) + " " + r2(y) + ")");
      if (h) { var ex = gx + x, ey = gy + y, mx = (x0 + ex) / 2, my = Math.max(y0, ey) + 34;
        h.setAttribute("d", "M" + x0 + " " + y0 + "Q" + r2(mx) + " " + r2(my) + " " + r2(ex) + " " + r2(ey)); }
    } }, t);
    return t + dur;
  }
  /** deposit level 0–1 */
  function pumpLevel(tl, p, t, v, dur) {
    var el = $(p + "-level"); if (!el) return t;
    dur = dur == null ? 0.8 : dur;
    var yb = num(el, "yb", 0);
    tw(tl, "lv:" + p, t, Math.max(0, Math.min(1, v)), dur, "power2.inOut", function (a) {
      el.setAttribute("transform", "translate(0 " + yb + ") scale(1 " + Math.round(a * 10000) / 10000 + ") translate(0 " + (-yb) + ")");
    }, function () { return num(el, "lv", 0.8); });
    return t + dur;
  }
  /** screen text; tone "red" = red text, otherwise green */
  function pumpScr(tl, p, t, text, tone) {
    var el = $(p + "-scr-t"); if (!el) return;
    var s = String(text == null ? "" : text);
    step(tl, "scr:" + p, t, { text: s, fill: tone === "red" ? "#ff8a80" : "#7fe0a6", size: Math.round(Math.min(11, 50 / em(s)) * 10) / 10 },
      function () { return textState(el); }, textApply(el));
  }
  /** status lamp "green" / "red" / "off" */
  function pumpLamp(tl, p, t, tone, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-lamp-g", t, tone === "green" ? 1 : 0, dur);
    op(tl, p + "-lamp-r", t, tone === "red" ? 1 : 0, dur);
  }
  /** red dashed frame + X on the front face */
  function pumpBad(tl, p, t, on, dur) { op(tl, p + "-bad", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** state switch: "normal" (green lamp, "代付 Gas", level 0.8) / "attacker" (red lamp, "签名被重放", level 0.1) / "broken" (frame, lamp off) */
  function pumpState(tl, p, t, state, dur) {
    dur = dur == null ? 0.8 : dur;
    if (state === "attacker") { pumpLamp(tl, p, t, "red"); pumpScr(tl, p, t, "签名被重放", "red"); pumpLevel(tl, p, t, 0.1, dur); pumpBad(tl, p, t, false); }
    else if (state === "broken") { pumpLamp(tl, p, t, "off"); pumpBad(tl, p, t, true); }
    else { pumpLamp(tl, p, t, "green"); pumpScr(tl, p, t, "代付 Gas", "green"); pumpLevel(tl, p, t, 0.8, dur); pumpBad(tl, p, t, false); }
    return t + dur;
  }

  var api = { tagDrop: tagDrop, tagHide: tagHide, tagSwing: tagSwing, tagText: tagText, tagClear: tagClear, tagState: tagState, tagPulse: tagPulse,
    pumpNozzle: pumpNozzle, pumpLevel: pumpLevel, pumpScr: pumpScr, pumpLamp: pumpLamp, pumpBad: pumpBad, pumpState: pumpState };
  window.KITX15 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX15.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
