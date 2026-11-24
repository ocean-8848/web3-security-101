/* ep22 kit-ext runtime — browser helpers for objects built with ep22/kit-ext/objects-ext.mjs (simCard, wrench).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX22. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX22.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * wrench has no moving parts (use KIT.grow / KIT.broke / GSAP on ID-mv).
 */
(function () {
  if (window.KITX22) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var COL = { gold: "#ffe08a", teal: "#2aa3c9", red: "#e0453a", green: "#1f9d55" };

  function op(tl, el, t, to, dur, ease) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.2 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }
  function tint(tl, p, t, color) {
    var el = $(p + "-chip-lit"); if (!el) return;
    var c = COL[color] || color || COL.gold, key = "col:" + p;
    var from = key in last ? last[key] : COL.gold;
    last[key] = c;
    if (from === c) return;
    var rects = el.querySelectorAll("rect");
    tl.fromTo(rects[0], { attr: { stroke: from } }, { attr: { stroke: c }, duration: 0.01, immediateRender: false }, t);
    tl.fromTo(rects[1], { attr: { fill: from === COL.gold ? "#fff6c8" : from } }, { attr: { fill: c === COL.gold ? "#fff6c8" : c }, duration: 0.01, immediateRender: false }, t);
  }

  // =================================================================== simCard
  /** chip glow on / off; color "gold" (default) | "teal" | "red" | "green" | any css colour */
  function chip(tl, p, t, on, color, dur) {
    on = on !== false;
    if (on) tint(tl, p, t, color);
    op(tl, p + "-chip-lit", t, on ? 1 : 0, dur == null ? 0.25 : dur);
  }
  /** chip blinks n times (ends off). Returns end time. */
  function chipFlash(tl, p, t, n, color, period) {
    n = n == null ? 2 : n; period = period == null ? 0.36 : period;
    tint(tl, p, t, color);
    for (var i = 0; i < n; i++) {
      op(tl, p + "-chip-lit", t + i * period, 1, period * 0.4);
      op(tl, p + "-chip-lit", t + i * period + period * 0.5, 0, period * 0.4);
    }
    return t + n * period;
  }

  var api = { chip: chip, chipFlash: chipFlash };
  window.KITX22 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX22.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
