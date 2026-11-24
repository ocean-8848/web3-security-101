/* ep24 kit-ext runtime — browser helpers for objects built with ep24/kit-ext/objects-ext.mjs (saltShaker).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX24. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX24.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   saltShaker ID-cap, ID-grains, ID-puff-0..7.  (ID-mv stays free: GSAP x/y on it is fine.)
 */
(function () {
  if (window.KITX24) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
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
  function ty(el, y) { if (el) el.setAttribute("transform", "translate(0 " + r2(y) + ")"); }

  // =================================================================== saltShaker
  /** lift the cap by `dy` px (default 16) or put it back (up=false). */
  function capLift(tl, p, t, up, dur, dy) {
    var el = $(p + "-cap"); if (!el) return;
    tw(tl, "cap:" + p, t, up === false ? 0 : -(dy == null ? 16 : dy), dur == null ? 0.35 : dur, "power2.out", function (v) { ty(el, v); }, function () { return 0; });
  }
  /** shake once: the jar jiggles and 8 grains fly out of the spout toward screen offset dir=[dx,dy] (default [46,18]) and fade. Returns end time. */
  function shake(tl, p, t, dir, dur) {
    dir = dir || [46, 18]; dur = dur == null ? 0.9 : dur;
    var mv = $(p + "-mv");
    if (mv) {
      var o = { q: 0 };
      tl.fromTo(o, { q: 0 }, { q: 1, duration: 0.45, ease: "none", immediateRender: false, onUpdate: function () {
        var a = Math.sin(o.q * Math.PI * 4) * (1 - o.q) * 7;
        mv.setAttribute("transform", o.q >= 1 ? "" : "rotate(" + r2(a) + " " + mv.parentNode.getAttribute("data-ox") + " " + mv.parentNode.getAttribute("data-oy") + ")");
      } }, t);
    }
    for (var i = 0; i < 8; i++) (function (i) {
      var el = $(p + "-puff-" + i); if (!el) return;
      var sp = 0.55 + (i % 4) * 0.15, side = ((i * 5) % 7 - 3) * 4;
      var dx = dir[0] * sp + side * 0.6, dy = dir[1] * sp + side * 0.4, t0 = t + 0.12 + i * 0.035;
      var o = { q: 0 };
      tl.fromTo(o, { q: 0 }, { q: 1, duration: dur - 0.2, ease: "power1.out", immediateRender: false, onUpdate: function () {
        var q = o.q, arc = -Math.sin(q * Math.PI) * 10;
        el.setAttribute("transform", q <= 0 || q >= 1 ? "" : "translate(" + r2(dx * q) + " " + r2(dy * q + arc + 14 * q * q) + ")");
        el.setAttribute("opacity", q <= 0 || q >= 1 ? 0 : r2(q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85));
      } }, t0);
    })(i);
    return t + dur;
  }
  /** empty the jar (grains sink + fade) and draw the red slash on the label. */
  function empty(tl, p, t, dur) {
    dur = dur == null ? 0.6 : dur;
    var g = $(p + "-grains");
    if (g) tw(tl, "gy:" + p, t, 18, dur, "power2.in", function (v) { ty(g, v); }, function () { return 0; });
    op(tl, p + "-grains", t, 0, dur, "power2.in");
    op(tl, p + "-slash", t + dur * 0.7, 1, 0.25);
  }
  /** put the grains back (inverse of empty), slash off. */
  function refill(tl, p, t, dur) {
    dur = dur == null ? 0.5 : dur;
    var g = $(p + "-grains");
    if (g) tw(tl, "gy:" + p, t, 0, dur, "power2.out", function (v) { ty(g, v); }, function () { return 0; });
    op(tl, p + "-grains", t, 1, dur);
    op(tl, p + "-slash", t, 0, 0.2);
  }

  var api = { capLift: capLift, shake: shake, empty: empty, refill: refill };
  window.KITX24 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX24.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
