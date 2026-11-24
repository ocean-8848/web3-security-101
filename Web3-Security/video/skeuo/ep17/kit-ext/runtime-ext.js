/* ep17 kit-ext runtime — browser helpers for objects built with ep17/kit-ext/objects-ext.mjs (viewWindow, peerPanel).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX17. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX17.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y): viewWindow ID-car-0..2.
 */
(function () {
  if (window.KITX17) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };

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

  // =================================================================== viewWindow
  /** traffic: the cars drive to the right for `dur` s at `speed` local px/s (wrap around). delayed = pass a lower speed. Returns end time. */
  function winFlow(tl, p, t, dur, speed) {
    var g = $(p + "-cars"); if (!g) return t;
    dur = dur == null ? 2 : dur; speed = speed == null ? 40 : speed;
    var span = num(g, "span", 160), x = num(g, "x", 0);
    var cars = [0, 1, 2].map(function (i) { return $(p + "-car-" + i); });
    var key = "flow:" + p, from = key in last ? last[key] : 0, to = from + speed * dur;
    tw(tl, key, t, to, dur, "none", function (s) {
      cars.forEach(function (c) {
        if (!c) return;
        var x0 = num(c, "x0", 0), q = ((x0 + s) % span + span) % span;
        c.setAttribute("transform", "translate(" + r2(x + q) + " 0)");
      });
    }, function () { return 0; });
    return t + dur;
  }
  /** "延迟" chip lit (teal) / grey */
  function winDelay(tl, p, t, on, dur) { op(tl, p + "-delay-on", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** "录像" red dot + label */
  function winRec(tl, p, t, on, dur) { op(tl, p + "-rec", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** switch mode: "live" | "delayed" | "replay" (chip, rec, grey wash, red dashed screen frame) */
  function winMode(tl, p, t, mode, dur) {
    dur = dur == null ? 0.3 : dur;
    op(tl, p + "-delay-on", t, mode === "delayed" ? 1 : 0, dur);
    op(tl, p + "-rec", t, mode === "replay" ? 1 : 0, dur);
    op(tl, p + "-grey", t, mode === "replay" ? 0.55 : 0, dur);
    op(tl, p + "-bad", t, mode === "replay" ? 1 : 0, dur);
  }
  /** sill lamp "green" | "red" | "off" (also used by peerPanel) */
  function lamp(tl, p, t, color, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-lamp-green", t, color === "green" ? 1 : 0, dur);
    op(tl, p + "-lamp-red", t, color === "red" ? 1 : 0, dur);
  }

  // =================================================================== peerPanel
  /** cable(s) turn red (on) / back to their own colour. which = index | array | "all"; gap = stagger between cables for many. Returns end time. */
  function peerRed(tl, p, t, which, on, gap, dur) {
    var g = $(p); var n = num(g, "n", 8);
    var list = which === "all" || which == null ? Array.from({ length: n }, function (_, i) { return i; }) : [].concat(which);
    gap = gap == null ? 0.12 : gap; dur = dur == null ? 0.25 : dur;
    list.forEach(function (i, k) { op(tl, p + "-cable-" + i + "-red", t + k * gap, on === false ? 0 : 1, dur); });
    return t + (list.length - 1) * gap + dur;
  }
  /** two green anchor plugs pop in / hide */
  function peerAnchor(tl, p, t, on, dur) {
    var el = $(p + "-anchor"); if (!el) return t;
    dur = dur == null ? 0.35 : dur;
    op(tl, el, t, on === false ? 0 : 1, dur, on === false ? "power1.in" : "back.out(2)");
    return t + dur;
  }
  function peerLamp(tl, p, t, color, dur) { lamp(tl, p, t, color, dur); }
  /** "diverse" | "eclipsed" | "anchored" (anchored: plugs in, cables 0–1 own colour, rest red) */
  function peerMode(tl, p, t, mode, gap) {
    var n = num($(p), "n", 8), all = Array.from({ length: n }, function (_, i) { return i; });
    if (mode === "diverse") { peerRed(tl, p, t, "all", false, 0, 0.25); peerAnchor(tl, p, t, false); }
    else if (mode === "eclipsed") { peerAnchor(tl, p, t, false); return peerRed(tl, p, t, "all", true, gap); }
    else if (mode === "anchored") { peerRed(tl, p, t, [0, 1], false, 0); peerRed(tl, p, t, all.slice(2), true, gap); return peerAnchor(tl, p, t); }
    return t + 0.3;
  }

  var api = {
    winFlow: winFlow, winDelay: winDelay, winRec: winRec, winMode: winMode, winLamp: lamp,
    peerRed: peerRed, peerAnchor: peerAnchor, peerLamp: peerLamp, peerMode: peerMode,
  };
  window.KITX17 = api;
  // 合并进 window.KITX：已存在的名字一律不覆盖；多章同时加载时请用 KITX17.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
