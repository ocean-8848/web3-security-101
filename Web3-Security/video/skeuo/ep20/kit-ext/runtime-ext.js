/* ep20 kit-ext runtime — browser helpers for objects built with ep20/kit-ext/objects-ext.mjs (dnsSignpost).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX20. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX20.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale): dnsSignpost ID-arm (and its .dns-tx text groups).
 */
(function () {
  if (window.KITX20) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r4 = function (n) { return Math.round(n * 10000) / 10000; };

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

  // =================================================================== dnsSignpost
  /** set the arm to angle a (deg; 0 = +u, 180 = −u, 90 = toward the viewer); keeps the domain text readable */
  function setArm(el, a) {
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    var ux = num(el, "ux", 0.8192), uy = num(el, "uy", -0.2868), vx = num(el, "vx", 0.5736), vy = num(el, "vy", 0.4096), ce = num(el, "ce", 0.866);
    var m0 = c * ux + s * vx, m1 = c * uy + s * vy;
    el.setAttribute("transform", "matrix(" + r4(m0) + "," + r4(m1) + ",0," + r4(ce) + "," + num(el, "px", 0) + "," + num(el, "py", 0) + ")");
    el.setAttribute("data-a", r4(a));
    var tx = el.querySelectorAll(".dns-tx"), mir = m0 < 0;
    for (var i = 0; i < tx.length; i++) {
      var cx = num(tx[i], "cx", 0);
      if (mir) tx[i].setAttribute("transform", "translate(" + cx + " 0) scale(-1 1) translate(" + (-cx) + " 0)");
      else tx[i].removeAttribute("transform");
    }
  }
  /** turn the arrow to angle `to` (deg). Returns end time. */
  function turn(tl, p, t, to, dur, ease) {
    var el = $(p + "-arm"); if (!el) return t;
    dur = dur == null ? 0.8 : dur;
    tw(tl, "arm:" + p, t, to, dur, ease || "back.out(1.4)", function (a) { setArm(el, a); }, function () { return num(el, "a0", 0); });
    return t + dur;
  }
  /** flip the arrow to the other side (0 ↔ 180, through 90 = toward the viewer) */
  function flip(tl, p, t, dur, ease) {
    var el = $(p + "-arm"); if (!el) return t;
    var cur = ("arm:" + p) in last ? last["arm:" + p] : num(el, "a0", 0);
    return turn(tl, p, t, cur >= 90 ? 0 : 180, dur, ease);
  }
  /** arm face red (attacker) or back to teal */
  function red(tl, p, t, on, dur) {
    on = on !== false; dur = dur == null ? 0.25 : dur;
    op(tl, p + "-arm-r", t, on ? 1 : 0, dur);
    op(tl, p + "-arm-n", t, on ? 0 : 1, dur);
  }
  /** teal glow layer around the arm (on / off) */
  function lit(tl, p, t, on, dur) { op(tl, p + "-arm-lit", t, on === false ? 0 : 1, dur == null ? 0.3 : dur); }
  /** one hijack: flip to the other side, turning red half-way. Returns end time. */
  function hijack(tl, p, t, dur) {
    dur = dur == null ? 0.9 : dur;
    flip(tl, p, t, dur);
    red(tl, p, t + dur * 0.45, true, 0.2);
    return t + dur;
  }
  /** undo a hijack: flip back, back to teal */
  function restore(tl, p, t, dur) {
    dur = dur == null ? 0.9 : dur;
    flip(tl, p, t, dur);
    red(tl, p, t + dur * 0.45, false, 0.2);
    return t + dur;
  }

  var api = { turn: turn, flip: flip, red: red, lit: lit, hijack: hijack, restore: restore };
  window.KITX20 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX20.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
