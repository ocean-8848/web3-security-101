/* ep16 kit-ext runtime — browser helpers for objects built with ep16/kit-ext/objects-ext.mjs (finalitySignal, forkSwitch).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX16. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX16.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale): forkSwitch ID-lever, ID-disc.
 */
(function () {
  if (window.KITX16) return;
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
  /** rotate a rotator group (data-m / data-px / data-py / data-a) to angle `a` */
  function rot(tl, el, t, a, dur, ease) {
    if (!el) return;
    var m = el.getAttribute("data-m"), px = el.getAttribute("data-px"), py = el.getAttribute("data-py");
    tw(tl, "rot:" + el.id, t, a, dur, ease || "power2.inOut", function (v) {
      el.setAttribute("transform", "matrix(" + m + ") translate(" + px + " " + py + ") rotate(" + r2(v) + ") translate(" + (-px) + " " + (-py) + ")");
    }, function () { return +el.getAttribute("data-a"); });
  }

  // =================================================================== finalitySignal
  /** lamp i (0 unsafe, 1 safe, 2 finalized) on / off; red=true lights its red layer instead */
  function sigLamp(tl, p, t, i, on, red, dur) {
    dur = dur == null ? 0.25 : dur;
    op(tl, p + "-lamp-" + i + "-on", t, on !== false && !red ? 1 : 0, dur);
    op(tl, p + "-lamp-" + i + "-red", t, on !== false && red ? 1 : 0, dur);
  }
  /** light lamps 0..lit (lit −1 = all off), lamps above go dark; staggered bottom → top. Returns end time. */
  function sig(tl, p, t, lit, dur) {
    dur = dur == null ? 0.6 : dur;
    var st = dur / 3;
    for (var i = 0; i < 3; i++) sigLamp(tl, p, t + i * st, i, i <= lit, false, Math.min(0.25, st + 0.05));
    return t + dur;
  }
  /** lamp i blinks n times and ends in its previous state (one-shot) */
  function sigBlink(tl, p, t, i, n, dur) {
    i = i == null ? 2 : i; n = n == null ? 2 : n; dur = dur == null ? 0.8 : dur;
    var el = $(p + "-lamp-" + i + "-on"); if (!el) return t;
    var key = "op:" + el.id, base = key in last ? last[key] : +(el.getAttribute("opacity") || 0);
    var o = { q: 0 };
    tl.fromTo(o, { q: 0 }, { q: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      var w = Math.abs(Math.sin(o.q * Math.PI * n));
      el.style.opacity = o.q >= 1 ? base : r2(base > 0.5 ? 1 - w : w);
    } }, t);
    return t + dur;
  }
  /** rolled back: finalized lamp turns red + red dashed frame (on=false restores the green lamp) */
  function sigBad(tl, p, t, on, dur) {
    on = on !== false;
    sigLamp(tl, p, t, 2, true, on, dur);
    op(tl, p + "-bad", t, on ? 1 : 0, dur == null ? 0.25 : dur);
  }

  // =================================================================== forkSwitch
  function lever(tl, p, t, thrown, dur) {
    var el = $(p + "-lever"); if (!el) return t;
    dur = dur == null ? 0.6 : dur;
    rot(tl, el, t, thrown === false ? +el.getAttribute("data-a0") : +el.getAttribute("data-a1"), dur, "back.out(1.6)");
    return t + dur;
  }
  function disc(tl, p, t, thrown, dur) {
    var el = $(p + "-disc"); if (!el) return t;
    dur = dur == null ? 0.45 : dur;
    rot(tl, el, t, thrown === false ? +el.getAttribute("data-a0") : +el.getAttribute("data-a1"), dur, "power2.inOut");
    return t + dur;
  }
  function swLamp(tl, p, t, color, dur) {
    op(tl, p + "-lamp-green", t, color === "green" ? 1 : 0, dur);
    op(tl, p + "-lamp-red", t, color === "red" ? 1 : 0, dur);
  }
  /** throw the switch: lever swings, disc arrow turns, lamp green ↔ red. thrown=false sets it back. Returns end time. */
  function flip(tl, p, t, thrown, dur) {
    thrown = thrown !== false; dur = dur == null ? 0.9 : dur;
    lever(tl, p, t, thrown, dur * 0.6);
    disc(tl, p, t + dur * 0.4, thrown, dur * 0.5);
    swLamp(tl, p, t + dur * 0.55, thrown ? "red" : "green", 0.2);
    return t + dur;
  }
  function swBad(tl, p, t, on, dur) { op(tl, p + "-bad", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }

  var api = { sig: sig, sigLamp: sigLamp, sigBlink: sigBlink, sigBad: sigBad, flip: flip, lever: lever, disc: disc, swLamp: swLamp, swBad: swBad };
  window.KITX16 = api;
  // 合并进 window.KITX：已存在的名字一律不覆盖；多章同时加载时请用 KITX16.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
