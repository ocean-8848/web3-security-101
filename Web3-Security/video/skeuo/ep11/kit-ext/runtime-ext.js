/* ep11 kit-ext runtime — browser helpers for objects built with ep11/kit-ext/objects-ext.mjs (snapshotCamera, mintPress).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX11. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX11.xxx when several chapter libraries are loaded — e.g. KITX.flash / KITX.key may belong to another chapter).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   snapshotCamera ID-photo-s, ID-photo-f, ID-flash;  mintPress ID-wheel, ID-peg, ID-ram, ID-limit, ID-key-0..2.
 */
(function () {
  if (window.KITX11) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  // ---------- primitives (private)
  function tw(tl, key, t, to, dur, ease, apply, init) {
    var from = key in last ? last[key] : init();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
    return from;
  }
  /** one-shot 0→1 pulse (state before and after is the same); apply(q) */
  function pulse(tl, t, dur, ease, apply) {
    var o = { q: 0 };
    tl.fromTo(o, { q: 0 }, { q: 1, duration: dur, ease: ease || "none", immediateRender: false, onUpdate: function () { apply(o.q); } }, t);
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
  function textSwap(tl, key, t, el, st) {
    if (!el) return;
    step(tl, key, t, st,
      function () { return { text: el.textContent, fill: el.getAttribute("fill") }; },
      function (s) { el.textContent = s.text; if (s.fill) el.setAttribute("fill", s.fill); });
  }

  // =================================================================== snapshotCamera
  /** flash burst: white ring pops and fades (one-shot) */
  function flash(tl, p, t, dur) {
    var el = $(p + "-flash"); if (!el) return t;
    dur = dur == null ? 0.55 : dur;
    var cx = num(el, "cx", 0), cy = num(el, "cy", 0);
    pulse(tl, t, dur, "none", function (q) {
      var a = q < 0.12 ? q / 0.12 : Math.max(0, (1 - q) / 0.88);
      var s = 0.55 + 0.75 * Math.sqrt(q);
      el.setAttribute("opacity", r2(q >= 1 ? 0 : a));
      el.setAttribute("transform", "translate(" + cx + " " + cy + ") scale(" + r2(s) + ") translate(" + -cx + " " + -cy + ")");
    });
    return t + dur;
  }
  /** shutter blades close over the lens and open again (one-shot) */
  function shutter(tl, p, t, dur) {
    var el = $(p + "-shutter"); if (!el) return t;
    dur = dur == null ? 0.26 : dur;
    pulse(tl, t, dur, "none", function (q) { el.setAttribute("opacity", r2(q >= 1 ? 0 : 1 - Math.abs(2 * q - 1))); });
    return t + dur;
  }
  /** flash bulb lit (true) / off (false) */
  function bulb(tl, p, t, on, dur) { op(tl, p + "-bulb", t, on === false ? 0 : 1, dur == null ? 0.15 : dur); }
  function photoSlide(p, q) {
    var g = $(p + "-photo"), s = $(p + "-photo-s"); if (!g || !s) return;
    s.setAttribute("transform", "translate(0 " + r2(-num(g, "ph", 46) * (1 - q)) + ")");
  }
  function photoFlip(p, q) {
    var g = $(p + "-photo"), fl = $(p + "-photo-f"); if (!g || !fl) return;
    var w = num(g, "pw", 44) / 2, sx = Math.max(0.02, Math.abs(1 - 2 * q));
    fl.setAttribute("transform", "translate(" + w + " 0) scale(" + r2(sx) + " 1) translate(" + -w + " 0)");
    $(p + "-photo-front").setAttribute("opacity", q > 0.5 ? 1 : 0);
    $(p + "-photo-back").setAttribute("opacity", q > 0.5 ? 0 : 1);
  }
  /** photo slides out of the slot (back side showing) and flips to its front; out=false pulls it back in. Returns end time. */
  function photo(tl, p, t, out, dur) {
    var g = $(p + "-photo"); if (!g) return t;
    dur = dur == null ? 1.0 : dur;
    var on0 = function () { return num(g, "on", 0); };
    if (out === false) {
      tw(tl, "pf:" + p, t, 0, 0.001, "none", function (q) { photoFlip(p, q); }, on0);
      tw(tl, "ps:" + p, t, 0, dur * 0.5, "power2.in", function (q) { photoSlide(p, q); }, on0);
      return t + dur * 0.5;
    }
    tw(tl, "ps:" + p, t, 1, dur * 0.55, "power2.out", function (q) { photoSlide(p, q); }, on0);
    tw(tl, "pf:" + p, t + dur * 0.55, 1, dur * 0.45, "power1.inOut", function (q) { photoFlip(p, q); }, on0);
    return t + dur;
  }
  /** photo header text */
  function photoText(tl, p, t, text, tone) {
    textSwap(tl, "pt:" + p, t, $(p + "-photo-t"), { text: String(text), fill: tone === "red" ? "#e0453a" : "#17607a" });
  }
  /** red dashed frame + red X over the lens (= no snapshot) */
  function lensBad(tl, p, t, on) { op(tl, p + "-lens-bad", t, on === false ? 0 : 1, 0.25); }
  /** one exposure: bulb lights, flash + shutter, photo comes out and flips, bulb off. Returns end time. */
  function snap(tl, p, t, opt) {
    opt = opt || {};
    bulb(tl, p, t, true);
    flash(tl, p, t + 0.18);
    shutter(tl, p, t + 0.18);
    bulb(tl, p, t + 0.75, false, 0.3);
    if (opt.photo === false) return t + 0.8;
    return photo(tl, p, t + 0.5, true, opt.dur == null ? 1.0 : opt.dur);
  }

  // =================================================================== mintPress
  function setWheel(p, a) {
    var w = $(p + "-wheel"); if (!w) return;
    var m = w.getAttribute("data-m");
    w.setAttribute("transform", "matrix(" + m + ") rotate(" + r2(a) + ")");
    var pg = $(p + "-peg"); if (!pg) return;
    var M = m.split(",").map(Number), lx = num(pg, "lx", 0), ly = num(pg, "ly", 0);
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    var x = lx * c - ly * s, y = lx * s + ly * c;
    pg.setAttribute("transform", "translate(" + r2(M[0] * x + M[2] * y) + " " + r2(M[1] * x + M[3] * y) + ")");
  }
  /** flywheel (and its crank peg) turns `turns` times over dur; linear by default */
  function wheel(tl, p, t, dur, turns, ease) {
    var w = $(p + "-wheel"); if (!w) return t;
    dur = dur == null ? 1.2 : dur; turns = turns == null ? 1 : turns;
    var key = "wh:" + p, a0 = key in last ? last[key] : num(w, "a", 0);
    tw(tl, key, t, a0 + 360 * turns, dur, ease || "none", function (a) { setWheel(p, a); }, function () { return a0; });
    return t + dur;
  }
  function setRam(p, v) {
    var el = $(p + "-ram"); if (!el) return;
    el.setAttribute("transform", "translate(0 " + r2(num(el, "dz", 34) * 0.866 * v) + ")");
  }
  /** ram strikes n times (down fast, up slower) over n·dur. Returns end time. */
  function ram(tl, p, t, n, dur) {
    n = n == null ? 1 : n; dur = dur == null ? 0.5 : dur;
    for (var i = 0; i < n; i++) {
      var t0 = t + i * dur;
      tw(tl, "ram:" + p, t0, 1, dur * 0.38, "power3.in", function (v) { setRam(p, v); }, function () { return 0; });
      tw(tl, "ram:" + p, t0 + dur * 0.38, 0, dur * 0.62, "power2.out", function (v) { setRam(p, v); }, function () { return 0; });
    }
    return t + n * dur;
  }
  function setCoins(p, level) {
    var g = $(p + "-coins"); if (!g) return;
    var n = num(g, "n", 42), vis = Math.round(Math.max(0, Math.min(1, level)) * n);
    for (var i = 0; i < n; i++) { var c = $(p + "-coin-" + i); if (c) c.setAttribute("opacity", i < vis ? 1 : 0); }
  }
  /** coin pile in the tray grows / shrinks to level (0–1) over dur */
  function coins(tl, p, t, level, dur) {
    var g = $(p + "-coins"); if (!g) return;
    tw(tl, "pile:" + p, t, level, dur == null ? 0.8 : dur, "none", function (v) { setCoins(p, v); }, function () { return num(g, "pile", 0); });
  }
  /** counter window text; tone "red" = red window + red digits, otherwise green digits */
  function count(tl, p, t, text, tone) {
    var red = tone === "red";
    op(tl, p + "-count-red", t, red ? 1 : 0, 0.2);
    textSwap(tl, "cnt:" + p, t, $(p + "-count-t"), { text: String(text), fill: red ? "#ff6a5c" : "#7fe3a8" });
  }
  /** stop block drops onto the flywheel (down=true, bounces) / lifts back (false). Returns end time. */
  function limit(tl, p, t, down, dur) {
    var el = $(p + "-limit"); if (!el) return t;
    dur = dur == null ? 0.45 : dur;
    tw(tl, "lim:" + p, t, down === false ? 0 : 1, dur, down === false ? "power2.inOut" : "bounce.out", function (v) {
      el.setAttribute("transform", "translate(0 " + r2(num(el, "dy", 20) * v) + ")");
    }, function () { return num(el, "on", 0); });
    return t + dur;
  }
  /** limit post + stop block appear (true) / disappear (false) */
  function limitShow(tl, p, t, on, dur) {
    op(tl, p + "-limit-bar", t, on === false ? 0 : 1, dur == null ? 0.3 : dur);
    op(tl, p + "-limit-o", t, on === false ? 0 : 1, dur == null ? 0.3 : dur);
  }
  /** red dashed frame (+ red X) where the limit post should be */
  function limitBad(tl, p, t, on) { op(tl, p + "-limit-bad", t, on === false ? 0 : 1, 0.25); }
  /** breaker lamp: "green" | "red" | "off" */
  function lamp(tl, p, t, color, dur) {
    op(tl, p + "-lamp-green", t, color === "green" ? 1 : 0, dur == null ? 0.2 : dur);
    op(tl, p + "-lamp-red", t, color === "red" ? 1 : 0, dur == null ? 0.2 : dur);
  }
  /** key i slides into its keyhole (on=true) / is pulled out (false); red=true uses the red (attacker) key. Lamp above lights after it seats. */
  function key(tl, p, t, i, on, red, dur) {
    var el = $(p + "-key-" + i); if (!el) return t;
    on = on !== false; dur = dur == null ? 0.4 : dur;
    var du = num(el, "du", 0.819), dv = num(el, "dv", -0.287);
    if (on) { op(tl, p + "-key-" + i + "-b", t, red ? 0 : 1, 0.01); op(tl, p + "-key-" + i + "-r", t, red ? 1 : 0, 0.01); }
    tw(tl, "key:" + p + i, t, on ? 1 : 0, dur, on ? "power2.out" : "power2.in", function (v) {
      el.setAttribute("opacity", r2(Math.min(1, v * 2)));
      el.setAttribute("transform", "translate(" + r2(-du * 22 * (1 - v)) + " " + r2(-dv * 22 * (1 - v)) + ")");
    }, function () { return num(el, "on", 0); });
    op(tl, p + "-kl-" + i + "-g", on ? t + dur : t, on && !red ? 1 : 0, 0.15);
    op(tl, p + "-kl-" + i + "-r", on ? t + dur : t, on && red ? 1 : 0, 0.15);
    return t + dur;
  }
  /** overflow: coins over the tray rim + red coin dots sprayed in front of the chute */
  function spill(tl, p, t, on, dur) { op(tl, p + "-spill", t, on === false ? 0 : 1, dur == null ? 0.4 : dur); }
  /** one minting run: flywheel turns, ram strikes `strokes` times, coin pile grows to `level` (optional). Returns end time. */
  function mint(tl, p, t, dur, strokes, level) {
    dur = dur == null ? 1.6 : dur; strokes = strokes == null ? 2 : strokes;
    wheel(tl, p, t, dur, strokes, "power1.inOut");
    ram(tl, p, t, strokes, dur / strokes);
    if (level != null) coins(tl, p, t + dur * 0.3, level, dur * 0.7);
    return t + dur;
  }

  var api = {
    flash: flash, shutter: shutter, bulb: bulb, photo: photo, photoText: photoText, lensBad: lensBad, snap: snap,
    wheel: wheel, ram: ram, coins: coins, count: count, limit: limit, limitShow: limitShow, limitBad: limitBad, lamp: lamp, key: key, spill: spill, mint: mint,
  };
  window.KITX11 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX11.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
