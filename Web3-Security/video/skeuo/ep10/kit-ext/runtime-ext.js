/* ep10 kit-ext runtime — browser helpers for objects built with ep10/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX10. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX10.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   coreModule ID-gear-0/1, ID-wheel-0/1, ID-lever-r, ID-lever-m, ID-mv.
 */
(function () {
  if (window.KITX10) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  // projection constants (kit/iso.mjs): azimuth 35°, elevation 30°
  var CA = Math.cos(35 * Math.PI / 180), SA = Math.sin(35 * Math.PI / 180), SE = 0.5;

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
  function setRot(id, deg) {
    var el = $(id); if (!el) return;
    var m = el.getAttribute("data-m"), px = num(el, "px", 0), py = num(el, "py", 0);
    el.setAttribute("transform", "matrix(" + m + ") translate(" + px + " " + py + ") rotate(" + r2(deg) + ") translate(" + -px + " " + -py + ")");
  }
  function rotTo(tl, id, t, deg, dur, ease) {
    var el = $(id); if (!el) return;
    tw(tl, "rot:" + id, t, deg, dur, ease, function (a) { setRot(id, a); }, function () { return num(el, "a", 0); });
  }
  function rotNow(id) { var k = "rot:" + id; return k in last ? last[k] : num($(id), "a", 0); }
  function textSwap(tl, key, t, el, st) {
    if (!el) return;
    step(tl, key, t, st,
      function () { return { text: el.textContent, fill: el.getAttribute("fill") }; },
      function (s) { el.textContent = s.text; if (s.fill) el.setAttribute("fill", s.fill); });
  }

  // ---------- coreModule
  /** both brass gears turn `turns` times (gear-1 the other way, faster) over dur; linear */
  function gears(tl, p, t, dur, turns) {
    dur = dur == null ? 1.2 : dur; turns = turns == null ? 1 : turns;
    for (var i = 0; i < 2; i++) {
      var id = p + "-gear-" + i, el = $(id); if (!el) continue;
      rotTo(tl, id, t, rotNow(id) + 360 * turns * num(el, "ratio", 1), dur, "none");
    }
  }
  /** lever present (true: drops into the socket) / pulled out (false: rises and fades) */
  function lever(tl, p, t, on, dur) {
    var g = $(p + "-lever"), m = $(p + "-lever-m"); if (!g || !m) return;
    dur = dur == null ? 0.45 : dur;
    tw(tl, "lev:" + p, t, on === false ? 0 : 1, dur, on === false ? "power2.in" : "back.out(1.6)", function (v) {
      g.setAttribute("opacity", r2(Math.min(1, v * 1.6)));
      m.setAttribute("transform", "translate(0 " + r2((1 - v) * -34) + ")");
    }, function () { return num(g, "on", 1); });
  }
  /** lever swings forward (deg) and back = "upgrade function called". Returns end time. */
  function pull(tl, p, t, dur, deg) {
    dur = dur == null ? 0.7 : dur; deg = deg == null ? 46 : deg;
    var id = p + "-lever-r", a0 = rotNow(id);
    rotTo(tl, id, t, a0 + deg, dur * 0.45, "power2.out");
    rotTo(tl, id, t + dur * 0.45, a0, dur * 0.55, "back.out(2)");
    return t + dur;
  }
  /** red dashed frame + red X where the lever should be */
  function leverBad(tl, p, t, on) { op(tl, p + "-lever-bad", t, on === false ? 0 : 1, 0.25); }
  var CARD_TONES = { on: [0, 1, 0, 0], red: [0, 0, 1, 0], green: [0, 0, 0, 1], blank: [1, 0, 0, 0] };
  var CARD_INK = { on: "#17607a", red: "#e0453a", green: "#1f9d55" };
  /** first-page card: text ("" = blank / uninitialised), tone "on" (teal, default) | "red" | "green" */
  function card(tl, p, t, text, tone, dur) {
    var blank = !text; tone = blank ? "blank" : tone || "on"; dur = dur == null ? 0.25 : dur;
    var L = CARD_TONES[tone] || CARD_TONES.on;
    op(tl, p + "-card-off", t, L[0], dur); op(tl, p + "-card-on", t, L[1], dur);
    op(tl, p + "-card-red", t, L[2], dur); op(tl, p + "-card-green", t, L[3], dur);
    op(tl, p + "-card-tx", t, blank ? 0 : 1, dur);
    if (!blank) textSwap(tl, "card:" + p, t, $(p + "-card-t"), { text: String(text), fill: CARD_INK[tone] });
  }
  /** red dashed frame + red X around the card holder */
  function cardBad(tl, p, t, on) { op(tl, p + "-card-bad", t, on === false ? 0 : 1, 0.25); }
  /** version plate text; tone "red" = red outline + red text, otherwise teal */
  function plate(tl, p, t, text, tone) {
    var red = tone === "red";
    op(tl, p + "-plate-red", t, red ? 1 : 0, 0.25);
    textSwap(tl, "plate:" + p, t, $(p + "-plate-t"), { text: String(text == null ? $(p + "-plate-t").textContent : text), fill: red ? "#e0453a" : "#17607a" });
  }
  /** body colour crossfade: "blue" | "red" | "green" */
  function skin(tl, p, t, name, dur) {
    ["blue", "red", "green"].forEach(function (k) { op(tl, p + "-skin-" + k, t, k === name ? 1 : 0, dur == null ? 0.35 : dur); });
  }
  /** wheels roll `turns` (negative = backward) over dur */
  function roll(tl, p, t, turns, dur, ease) {
    for (var i = 0; i < 2; i++) { var id = p + "-wheel-" + i; if ($(id)) rotTo(tl, id, t, rotNow(id) + 360 * turns, dur == null ? 0.8 : dur, ease || "power1.inOut"); }
  }
  /** push the whole module (cart and all) so its ground point lands on world-canvas point `to` ([x, y]; null = back home); wheels roll along. Returns end time. */
  function push(tl, p, t, to, dur, ease) {
    var root = $(p), mv = $(p + "-mv"); if (!root || !mv) return t;
    dur = dur == null ? 1 : dur; ease = ease || "power2.inOut";
    var ox = num(root, "ox", 0), oy = num(root, "oy", 0), k = num(mv, "k", 1), wr = num(root, "wr", 10);
    var key = "mv:" + p, from = key in last ? last[key] : [0, 0];
    var d = to ? [to[0] - ox, to[1] - oy] : [0, 0];
    last[key] = d;
    var o = { q: 0 };
    tl.fromTo(o, { q: 0 }, { q: 1, duration: dur, ease: ease, immediateRender: false, onUpdate: function () {
      mv.setAttribute("transform", "translate(" + r2(from[0] + (d[0] - from[0]) * o.q) + " " + r2(from[1] + (d[1] - from[1]) * o.q) + ")");
    } }, t);
    // world displacement along u (wheels roll in the u-z plane)
    var dx = d[0] - from[0], dy = d[1] - from[1], du = CA * dx - SA * dy / SE;
    if ($(p + "-wheel-0")) roll(tl, p, t, du / (2 * Math.PI * wr * k), dur, ease);
    return t + dur;
  }

  var api = {
    gears: gears, lever: lever, pull: pull, leverBad: leverBad, card: card, cardBad: cardBad, plate: plate, skin: skin, roll: roll, push: push,
  };
  window.KITX10 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX10.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
