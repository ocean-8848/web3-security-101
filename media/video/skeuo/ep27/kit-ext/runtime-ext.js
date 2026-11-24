/* ep27 kit-ext runtime — browser helpers for objects built with ep27/kit-ext/objects-ext.mjs (planeModel).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX27. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX27.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Only opacity is animated here; ID-mv / ID-wingL / ID-wingR stay free for GSAP x/y.
 */
(function () {
  if (window.KITX27) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  function op(tl, el, t, to, dur, ease) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.2 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }
  var side = function (s) { return s === "R" || s === "r" || s === "wingR" ? "wingR" : "wingL"; };

  // =================================================================== planeModel
  /** red highlight on one wing on / off. s = "L" | "R" */
  function wingRed(tl, p, t, s, on, dur) { op(tl, p + "-" + side(s) + "-red", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** red dashed break mark (+ red X) on one wing on / off. s = "L" | "R" */
  function wingBreak(tl, p, t, s, on, dur) { op(tl, p + "-" + side(s) + "-break", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** whole-plane teal outline: pulse `n` times over `dur` (returns to off). Returns end time. */
  function planeHi(tl, p, t, dur, n) {
    var el = $(p + "-hi"); if (!el) return t;
    dur = dur == null ? 0.9 : dur; n = n == null ? 1 : n;
    var o = { q: 0 };
    tl.fromTo(o, { q: 0 }, { q: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      var q = o.q, v = q <= 0 || q >= 1 ? 0 : Math.sin(q * Math.PI * n);
      el.setAttribute("opacity", r2(Math.abs(v)));
    } }, t);
    return t + dur;
  }

  var api = { wingRed: wingRed, wingBreak: wingBreak, planeHi: planeHi };
  window.KITX27 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX27.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
