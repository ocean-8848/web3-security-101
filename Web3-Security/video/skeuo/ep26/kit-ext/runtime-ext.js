/* ep26 kit-ext runtime — browser helpers for objects built with ep26/kit-ext/objects-ext.mjs (faceMask).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX26. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX26.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   faceMask ID-mask.  (ID-mv stays free: GSAP x/y on it is fine.)
 */
(function () {
  if (window.KITX26) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  function tw(tl, key, t, to, dur, ease, apply, init) {
    var from = key in last ? last[key] : init();
    last[key] = to;
    var o = { a: 0 };
    tl.fromTo(o, { a: 0 }, { a: 1, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(from, to, o.a); } }, t);
    return from;
  }
  function op(tl, el, t, to, dur, ease) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.2 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }

  // =================================================================== faceMask
  /** move the mask (with its back shell) by screen offset d=[dx,dy] in world-canvas px from its rest place
   *  (absolute, not cumulative: [0,0] puts it back). Scale-aware. Returns end time. */
  function maskMove(tl, p, t, d, dur) {
    var el = $(p + "-mask"); if (!el) return t;
    dur = dur == null ? 0.8 : dur;
    var k = +(el.getAttribute("data-k") || 1) || 1;
    var to = [d[0] / k, d[1] / k];
    tw(tl, "mv:" + p, t, to, dur, "power2.inOut", function (a, b, q) {
      var x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q;
      el.setAttribute("transform", x === 0 && y === 0 ? "" : "translate(" + r2(x) + " " + r2(y) + ")");
    }, function () { return [0, 0]; });
    return t + dur;
  }
  /** circuit ring on the back shell flashes bright (one pulse, `n` times). Returns end time. */
  function circuit(tl, p, t, dur, n) {
    var el = $(p + "-circ-hi"); if (!el) return t;
    dur = dur == null ? 0.9 : dur; n = n == null ? 1 : n;
    var o = { q: 0 };
    tl.fromTo(o, { q: 0 }, { q: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      var q = o.q, v = q <= 0 || q >= 1 ? 0 : Math.sin(q * Math.PI * n);
      el.setAttribute("opacity", r2(Math.abs(v)));
    } }, t);
    return t + dur;
  }
  /** red outline on the mask edge on / off */
  function maskRed(tl, p, t, on, dur) { op(tl, p + "-red", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }

  var api = { maskMove: maskMove, circuit: circuit, maskRed: maskRed };
  window.KITX26 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX26.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
