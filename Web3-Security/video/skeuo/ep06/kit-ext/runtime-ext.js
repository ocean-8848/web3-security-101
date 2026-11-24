/* ep06 kit-ext runtime — browser helpers for objects built with ep06/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX06 (also merged into window.KITX; helper names do not collide with KITX01 / KITX03).
 * Every helper schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure function of
 * timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 */
(function () {
  if (window.KITX06) return;
  var D = Math.PI / 180, CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var U = [CA, -SA * SE], V = [SA, CA * SE];
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var LIT = "#5cc0e0", OFF = "#3c3f45";

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
  /** move element by an absolute screen offset `to` ([x,y]), with an optional arc lift (px) */
  function mv(tl, key, el, t, to, dur, lift, ease, from) {
    var a = from || (key in last ? last[key] : [0, 0]); last[key] = [to[0], to[1]];
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur == null ? 0.6 : dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      var q = o.k; gsap.set(el, { x: a[0] + (to[0] - a[0]) * q, y: a[1] + (to[1] - a[1]) * q - (lift || 0) * Math.sin(Math.PI * Math.min(1, Math.max(0, q))) });
    } }, t);
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
  function lamp(tl, id, t, on) {
    var el = $(id); if (!el) return;
    tl.to(el, { attr: { fill: on ? LIT : OFF }, duration: 0.12, ease: "none" }, t);
    if ($(id + "-h")) tl.to("#" + id + "-h", { attr: { fill: on ? LIT : OFF }, opacity: on ? 0.35 : 0, duration: 0.12, ease: "none" }, t);
  }

  // ---------- roundCutter
  /** drop (down=true) or raise the blade */
  function blade(tl, p, t, down, dur) {
    var el = $(p + "-blade"); if (!el) return;
    rotTo(tl, p + "-blade", t, down ? num(el, "dn", 0) : num(el, "up", -34), dur == null ? (down ? 0.22 : 0.45) : dur, down ? "power3.in" : "power2.out");
  }
  /** flip the side lever to "up" | "down"; the matching plate lamp lights */
  function lever(tl, p, t, dir, dur) {
    var el = $(p + "-lever"); if (!el) return;
    var up = dir === "up";
    rotTo(tl, p + "-lever", t, up ? num(el, "up", -36) : num(el, "dn", 36), dur == null ? 0.35 : dur, "back.out(1.6)");
    lamp(tl, p + "-led-up", t + 0.2, up); lamp(tl, p + "-led-dn", t + 0.2, !up);
  }
  /** set how many chips sit in tray side ("L" | "R") */
  function pile(tl, p, side, t, n) {
    var g = $(p + "-pile" + side); if (!g) return;
    var max = num(g, "max", 9), key = "pile:" + p + side, cur = key in last ? last[key] : num(g, "n", 0);
    n = Math.max(0, Math.min(max, n)); last[key] = n;
    for (var k = 0; k < max; k++) {
      var was = k < cur, now = k < n; if (was === now) continue;
      op(tl, p + "-pile" + side + "-" + k, t + (now ? (k - cur) * 0.04 : 0), now ? 1 : 0, 0.12);
    }
  }
  function pileCount(p, side) { var g = $(p + "-pile" + side), key = "pile:" + p + side; return key in last ? last[key] : num(g, "n", 0); }
  /** remainder chip hops off the bed into tray side ("L" protocol | "R" caller); lands → pile +1 */
  function chip(tl, p, t, side, dur) {
    var el = $(p + "-chip"); if (!el) return;
    dur = dur == null ? 0.6 : dur;
    var s = side === "R" ? "r" : "l";
    mv(tl, "chip:" + p, el, t, [num(el, s + "x", 0), num(el, s + "y", 0)], dur, side === "R" ? 50 : 80, "power1.inOut");
    op(tl, el, t + dur - 0.06, 0, 0.06);
    pile(tl, p, side === "R" ? "R" : "L", t + dur - 0.04, pileCount(p, side === "R" ? "R" : "L") + 1);
  }
  /** put a fresh chip back at the cut (for repeated cuts) */
  function chipReset(tl, p, t) {
    var el = $(p + "-chip"); if (!el) return;
    mv(tl, "chip:" + p, el, t, [0, 0], 0.01, 0, "none");
    op(tl, el, t + 0.02, 1, 0.18);
  }
  /** push the gold bar in from the left (it waits outside from time 0 when hold !== false) */
  function feed(tl, p, t, dur, hold) {
    ["A", "B"].forEach(function (k) {
      var el = $(p + "-feed" + k); if (!el) return;
      var off = [num(el, "fx", 0), num(el, "fy", 0)];
      if (hold !== false && !(("feed:" + p + k) in last)) tl.set(el, { x: off[0], y: off[1] }, 0);
      mv(tl, "feed:" + p + k, el, t, [0, 0], dur == null ? 0.7 : dur, 0, "power2.out", off);
    });
  }
  /** one full cut: blade drops, remainder chip into tray `side`, pile +1, blade rises. Returns end time. */
  function cut(tl, p, t, side, o) {
    o = o || {};
    blade(tl, p, t, true, 0.22);
    chip(tl, p, t + 0.24, side, o.chipDur == null ? 0.6 : o.chipDur);
    blade(tl, p, t + 0.42, false, 0.45);
    return t + 0.9;
  }
  /** repeat cut n times (chip reset between), each `period` seconds (≥ 0.95) */
  function cuts(tl, p, t, side, n, period) {
    period = Math.max(0.95, period || 1.0);
    for (var i = 0; i < n; i++) { if (i) chipReset(tl, p, t + i * period - 0.05); cut(tl, p, t + i * period, side); }
    return t + n * period;
  }

  // ---------- decimalRuler
  /** slide the cursor to `pos` cells (from the left end of the integer section) */
  function slider(tl, p, t, pos, dur) {
    var el = $(p + "-slider"); if (!el) return;
    var d = pos - num(el, "pos", 0);
    mv(tl, "sl:" + p, el, t, [d * num(el, "cx", 0), d * num(el, "cy", 0)], dur == null ? 0.7 : dur, 0, "power2.inOut");
  }
  /** move the decimal point by `cells` (relative to where it was built; + = right). o.flash: red flicker over the span; o.red: dot stays red */
  function shiftDot(tl, p, t, cells, o) {
    o = o || {};
    var dot = $(p + "-dot"), dec = $(p + "-dec"), err = $(p + "-err"); if (!dot) return;
    var cw = num(dec, "cw", 20), x0 = num(dec, "x0", 0), w0 = num(dec, "w0", 0), dur = o.dur == null ? 0.8 : o.dur;
    var apply = function (s) { dot.setAttribute("transform", "translate(" + r2(s * cw) + ",0)"); dec.setAttribute("x", r2(x0 + s * cw)); dec.setAttribute("width", r2(Math.max(0, w0 - s * cw))); };
    var from = tw(tl, "dot:" + p, t, cells, dur, o.ease || "power2.inOut", apply, function () { return 0; });
    if (o.flash !== false && err) {
      var a = Math.min(from, cells), b = Math.max(from, cells);
      tl.set(err, { attr: { x: r2(x0 + a * cw), width: r2((b - a) * cw) } }, t);
      var te = t + dur;
      op(tl, err, te, 0.55, 0.08); op(tl, err, te + 0.18, 0.08, 0.1); op(tl, err, te + 0.36, 0.55, 0.08); op(tl, err, te + 0.54, 0.08, 0.1); op(tl, err, te + 0.72, 0.4, 0.1);
      if (o.red !== false) op(tl, p + "-dot-r", te, 1, 0.12);
    }
  }
  /** clear red marks on the ruler */
  function rulerOk(tl, p, t) { op(tl, p + "-err", t, 0, 0.2); op(tl, p + "-dot-r", t, 0, 0.2); }

  // ---------- shareDispenser
  function setTally(p, v) {
    var g = $(p + "-ctr"); if (!g) return;
    var n = num(g, "n", 5);
    for (var i = 0; i < n; i++) {
      var el = $(p + "-dg-" + i); if (!el) continue;
      var h = num(el, "h", 30), P = Math.pow(10, i), d = Math.floor(v / P) % 10, rem = v % P, pos = d;
      if (i === 0) pos = v % 10; else if (rem > P - 1) pos = d + (rem - (P - 1));
      el.setAttribute("transform", "translate(0," + r2(-h * pos) + ")");
    }
  }
  /** roll the "总份额" counter from → to */
  function tally(tl, p, t, dur, from, to, ease) {
    var g = $(p + "-ctr"); if (from == null) from = "tally:" + p in last ? last["tally:" + p] : num(g, "v", 0);
    last["tally:" + p] = to;
    var o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: dur == null ? 0.8 : dur, ease: ease || "power1.inOut", immediateRender: false, onUpdate: function () { setTally(p, Math.max(0, o.v)); } }, t);
  }
  /** ticket i slides out of the slot and drops onto the shelf; the lamp blinks */
  function issue(tl, p, t, i, dur) {
    var el = $(p + "-ticket-" + i); if (!el) return;
    dur = dur == null ? 0.45 : dur;
    tl.fromTo(el, { x: num(el, "ix", 0), y: num(el, "iy", 0) }, { x: num(el, "mx", 0), y: num(el, "my", 0), duration: dur, ease: "power2.out", immediateRender: false }, t);
    op(tl, el, t, 1, 0.01, "none");
    tl.to(el, { x: 0, y: 0, duration: 0.2, ease: "power2.in" }, t + dur + 0.04);
    if ($(p + "-led")) { lamp(tl, p + "-led", t - 0.05, true); lamp(tl, p + "-led", t + dur + 0.35, false); }
  }

  // ---------- pizza
  /** pull slice i outward along its own direction by `dist` world units (0 = back in place) */
  function serve(tl, p, i, t, dist, dur, lift) {
    var el = $(p + "-s-" + i); if (!el) return;
    var du = num(el, "du", 0), dv = num(el, "dv", 0), pull = num(el, "pull", 0);
    mv(tl, "s:" + p + i, el, t, [du * dist, dv * dist], dur == null ? 0.6 : dur, lift == null ? 18 : lift, "power2.inOut", ("s:" + p + i) in last ? null : [du * pull, dv * pull]);
  }

  // ---------- burnBox
  /** card i appears above the slot and drops in — gone for good */
  function burn(tl, p, t, i, dur) {
    var el = $(p + "-card-" + (i || 0)); if (!el) return;
    dur = dur == null ? 0.45 : dur;
    op(tl, el, t, 1, 0.15);
    tl.fromTo(el, { x: 0, y: 0 }, { x: num(el, "dx", 0), y: num(el, "dy", 0), duration: dur, ease: "power2.in", immediateRender: false }, t + 0.3);
    op(tl, el, t + 0.3 + dur, 0, 0.01, "none");
  }

  // ---------- generic
  /** move any element (whole object root or a part) to an absolute world offset (du, dv, dz) from where it was built */
  function carry(tl, id, t, du, dv, dz, dur, lift, ease) {
    var el = $(id); if (!el) return;
    mv(tl, "carry:" + id, el, t, [du * U[0] + dv * V[0], du * U[1] + dv * V[1] - (dz || 0) * CE], dur, lift, ease);
  }

  var api = { blade: blade, lever: lever, pile: pile, chip: chip, chipReset: chipReset, feed: feed, cut: cut, cuts: cuts,
    slider: slider, shiftDot: shiftDot, rulerOk: rulerOk, setTally: setTally, tally: tally, issue: issue, serve: serve, burn: burn, carry: carry };
  window.KITX06 = api;
  window.KITX = Object.assign(window.KITX || {}, api);  // 多章物件库同时加载时按章号区分：KITX01 / KITX03 / KITX06
})();
