/* ep09 kit-ext runtime — browser helpers for objects built with ep09/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX09. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX09.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   cheque ID-copy-0..2;  rotaWheel ID-arm / ID-arm-b / ID-lamp;  commitBox ID-door / ID-lock-sh / ID-env-m / ID-copy-m.
 */
(function () {
  if (window.KITX09) return;
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
  function prog(tl, t, dur, ease, fn) {
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: ease || "none", immediateRender: false, onUpdate: function () { fn(o.k); } }, t);
  }
  function setRot(id, deg) {
    var el = $(id); if (!el) return;
    var m = el.getAttribute("data-m"), px = num(el, "px", 0), py = num(el, "py", 0);
    el.setAttribute("transform", "matrix(" + m + ") translate(" + px + " " + py + ") rotate(" + r2(deg) + ") translate(" + -px + " " + -py + ")");
  }
  function rotNow(id) { var el = $(id); return "rot:" + id in last ? last["rot:" + id] : num(el, "a", 0); }
  function rotTo(tl, id, t, deg, dur, ease) {
    var el = $(id); if (!el) return;
    tw(tl, "rot:" + id, t, deg, dur, ease, function (a) { setRot(id, a); }, function () { return num(el, "a", 0); });
  }
  function blink(tl, el, t, n, period, end) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, from = key in last ? last[key] : +(el.getAttribute("opacity") || 0);
    last[key] = end;
    prog(tl, t, n * period, "none", function (k) {
      var v = k >= 1 ? end : (Math.sin(Math.PI * k * n * 2 - Math.PI / 2) + 1) / 2;
      gsap.set(el, { opacity: k <= 0 ? from : r2(v) });
    });
  }
  /** one-shot moving token: shows at t, travels by its data-dx/dy over dur, hides at the end */
  function shoot(tl, el, t, dur, ease) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var dx = num(el, "dx", 0), dy = num(el, "dy", 0);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "none", immediateRender: false }, t);
    prog(tl, t, dur, ease || "power2.in", function (k) { el.setAttribute("transform", "translate(" + r2(dx * k) + " " + r2(dy * k) + ")"); });
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.06, ease: "none", immediateRender: false }, t + dur);
  }
  function textSwap(tl, key, t, el, st, extra) {
    if (!el) return;
    step(tl, key, t, st,
      function () { return { text: el.textContent, fill: el.getAttribute("fill") }; },
      function (s) { el.textContent = s.text; if (s.fill) el.setAttribute("fill", s.fill); if (extra) extra(s); });
  }

  // ---------- cheque
  var FIELD_LAYERS = { blank: [1, 0, 0, 0], filled: [0, 1, 0, 0], bad: [0, 0, 1, 1], warn: [0, 0, 1, 0] };
  /** field slot i (0 nonce · 1 链 ID · 2 合约地址 · 3 截止时间 · 4 用途) → "blank" | "filled" | "bad" (red dashed + red X) | "warn" (red dashed only) */
  function field(tl, p, t, i, state, dur) {
    var L = FIELD_LAYERS[state] || FIELD_LAYERS.blank, d = dur == null ? 0.25 : dur;
    op(tl, p + "-f" + i + "-blank", t, L[0], d);
    op(tl, p + "-f" + i + "-fill", t, L[1], d);
    op(tl, p + "-f" + i + "-bad", t, L[2], d);
    op(tl, p + "-f" + i + "-bad-x", t, L[3], d);
  }
  /** several slots one after another: states = ["filled", null, "bad", …] (null = leave); gap seconds apart. Returns end time. */
  function fields(tl, p, t, states, gap) {
    gap = gap == null ? 0.3 : gap; var k = 0;
    for (var i = 0; i < states.length; i++) if (states[i]) { field(tl, p, t + k * gap, i, states[i]); k++; }
    return t + k * gap;
  }
  /** signature stroke draws in (on) or is wiped (false) */
  function sign(tl, p, t, dur, on) {
    var el = $(p + "-sig"); if (!el) return;
    var L = num(el, "len", 300);
    tw(tl, "sig:" + p, t, on === false ? L : 0, dur == null ? 0.9 : dur, "power1.inOut", function (v) { el.setAttribute("stroke-dashoffset", r2(v)); },
      function () { return +el.getAttribute("stroke-dashoffset"); });
  }
  /** amount box text ("100" → "领取") */
  function amt(tl, p, t, text) { textSwap(tl, "amt:" + p, t, $(p + "-amt"), { text: String(text) }); }
  function copyPos(p, k) { var key = "cp:" + p + ":" + k, el = $(p + "-copy-" + k); if (key in last) return last[key]; var m = /translate\(([-\d.]+)[ ,]+([-\d.]+)/.exec(el.getAttribute("transform") || ""); return m ? [+m[1], +m[2]] : [0, 0]; }
  function moveCopy(tl, p, k, t, to, dur, ease) {
    var el = $(p + "-copy-" + k); if (!el) return;
    var from = copyPos(p, k); last["cp:" + p + ":" + k] = to;
    prog(tl, t, dur, ease || "power2.inOut", function (q) { el.setAttribute("transform", "translate(" + r2(from[0] + (to[0] - from[0]) * q) + " " + r2(from[1] + (to[1] - from[1]) * q) + ")"); });
  }
  /** show n photocopies (fade in + slide out from behind the cheque to their staggered rest spots); n = 0 hides them all. red=true → red outline */
  function copies(tl, p, t, n, dur, red) {
    dur = dur == null ? 0.6 : dur;
    for (var k = 0; k < 3; k++) {
      var el = $(p + "-copy-" + k); if (!el) continue;
      var on = k < n, tk = t + (on ? k * 0.15 : 0);
      op(tl, el, tk, on ? num(el, "op", 0.72) : 0, on ? dur * 0.6 : 0.2);
      moveCopy(tl, p, k, tk, on ? [num(el, "rx", 0), num(el, "ry", 0)] : [0, 0], on ? dur : 0.2);
    }
    if (red != null) copyRed(tl, p, t, red);
  }
  /** copy k slides so its centre lands on world-canvas point pt (null = back to its rest spot). Returns end time. */
  function copyTo(tl, p, t, k, pt, dur) {
    var el = $(p + "-copy-" + k); if (!el) return t;
    dur = dur == null ? 0.7 : dur;
    var to = pt ? [pt[0] - num(el, "cx", 0), pt[1] - num(el, "cy", 0)] : [num(el, "rx", 0), num(el, "ry", 0)];
    var cur = "op:" + el.id in last ? last["op:" + el.id] : +(el.getAttribute("opacity") || 0);
    if (cur < 0.05) op(tl, el, t, num(el, "op", 0.72), 0.2);
    moveCopy(tl, p, k, t, to, dur);
    return t + dur;
  }
  /** copies turn red (replayed) / back to grey */
  function copyRed(tl, p, t, on) {
    for (var k = 0; k < 3; k++) { op(tl, p + "-copy-" + k + "-r", t, on === false ? 0 : 1, 0.25); op(tl, p + "-copy-" + k + "-n", t, on === false ? 1 : 0, 0.25); }
  }

  // ---------- rotaWheel
  var RW = {};
  function rd(p) {
    if (RW[p]) return RW[p];
    var d = $(p + "-rdata"); if (!d) return null;
    return (RW[p] = { n: num(d, "n", 12), a0: num(d, "a0", 0), at: num(d, "at", 0), speed: num(d, "speed", 1),
      L: d.getAttribute("data-lamps").split(";").map(function (s) { return s.split(",").map(Number); }) });
  }
  function seatAng(D, k) { return D.a0 + (360 * (((k % D.n) + D.n) % D.n)) / D.n; }
  function armTo(tl, p, t, deg, dur, ease) { rotTo(tl, p + "-arm", t, deg, dur, ease); rotTo(tl, p + "-arm-b", t, deg, dur, ease); }
  function curSeat(p) { var D = rd(p); return "seat:" + p in last ? last["seat:" + p] : D.at; }
  function lampTo(tl, p, t, k) {
    var D = rd(p), el = $(p + "-lamp"); if (!el) return;
    step(tl, "lk:" + p, t, k, function () { return D.at; }, function (j) { var q = D.L[j]; el.setAttribute("transform", "translate(" + q[0] + " " + q[1] + ")"); });
  }
  /** pointer arm turns forward (screen-clockwise) to seat k, plus `turns` extra full turns; the lamp and the seat ring follow. Returns end time. */
  function point(tl, p, t, k, dur, turns, ease) {
    var D = rd(p); if (!D) return t;
    k = ((k % D.n) + D.n) % D.n;
    var from = rotNow(p + "-arm"), to = seatAng(D, k);
    while (to < from + 0.01) to += 360;
    if (k === curSeat(p) && !turns) to = from;
    to += 360 * (turns || 0);
    if (dur == null) dur = Math.max(0.35, (to - from) / 360 / D.speed);
    var prev = curSeat(p); last["seat:" + p] = k;
    if (to !== from) {
      op(tl, p + "-lamp", t, 0, 0.08);
      op(tl, p + "-seat-" + prev + "-hl", t, 0, 0.12);
      armTo(tl, p, t, to, dur, ease || "power2.inOut");
    }
    lampTo(tl, p, t + dur - 0.02, k);
    op(tl, p + "-lamp", t + dur, 1, 0.12);
    op(tl, p + "-seat-" + k + "-hl", t + dur, 1, 0.15);
    return t + dur;
  }
  /** fast spin: `turns` full turns, then stop on seat k (default: the current one). Returns end time. */
  function spin(tl, p, t, dur, turns, k) {
    var D = rd(p); if (!D) return t;
    turns = turns == null ? 3 : turns;
    return point(tl, p, t, k == null ? curSeat(p) : k, dur == null ? Math.max(0.6, turns / D.speed) : dur, k == null || k === curSeat(p) ? turns : turns, "power1.inOut");
  }
  /** one seat at a time, `steps` times, `gap` seconds apart (TRON 一格一格转). Returns end time. */
  function tick(tl, p, t, steps, gap) {
    gap = gap == null ? 0.45 : gap; var end = t;
    for (var i = 0; i < steps; i++) end = point(tl, p, t + i * gap, curSeat(p) + 1, Math.min(0.3, gap * 0.6), 0, "power3.out");
    return end;
  }
  /** seat k → "red" (figure turns red) | "normal" | "dim" (fades to 0.2) | "hot" (teal ring on) | "cool" (ring off) */
  function seat(tl, p, t, k, state) {
    var d = 0.25;
    if (state === "hot" || state === "cool") { op(tl, p + "-seat-" + k + "-hl", t, state === "hot" ? 1 : 0, d); return; }
    op(tl, p + "-seat-" + k + "-red", t, state === "red" ? 1 : 0, d);
    op(tl, p + "-seat-" + k, t, state === "dim" ? 0.2 : 1, d);
  }
  /** every seat except `except` (array of seat numbers) → state, rippling around the wheel over `dur` */
  function seats(tl, p, t, state, except, dur) {
    var D = rd(p); if (!D) return;
    var ex = except || [], dd = dur == null ? 0.5 : dur;
    for (var k = 0; k < D.n; k++) if (ex.indexOf(k) < 0) seat(tl, p, t + (dd * k) / D.n, k, state);
  }
  /** lamp over the current seat on / off */
  function lamp(tl, p, t, on) { op(tl, p + "-lamp", t, on === false ? 0 : 1, 0.15); }
  /** drum name plate text */
  function plate(tl, p, t, text) { textSwap(tl, "pl:" + p, t, $(p + "-plate-t"), { text: String(text) }); }

  // ---------- commitBox
  function setDoor(p, phi) {
    var el = $(p + "-door"); if (!el) return;
    var uv = el.getAttribute("data-uv").split(",").map(Number), H = num(el, "h", 124), hx = num(el, "hx", 0), hy = num(el, "hy", 0);
    var sn = Math.sin(phi * Math.PI / 180), cs = Math.cos(phi * Math.PI / 180), D0 = sn * uv[2], D1 = sn * uv[3] - cs * uv[4];
    el.setAttribute("transform", "matrix(" + uv[0] + "," + uv[1] + "," + r2(-D0 * 1e4) / 1e4 + "," + r2(-D1 * 1e4) / 1e4 + "," + r2(hx + H * D0) + "," + r2(hy + H * D1) + ")");
  }
  /** slot rim flashes n times (n=0: stays lit; pass on=false via slotOn) */
  function slot(tl, p, t, n) { blink(tl, p + "-slot", t, n || 2, 0.28, 0); }
  function slotOn(tl, p, t, on) { op(tl, p + "-slot", t, on === false ? 0 : 1, 0.2); }
  /** sealed envelope drops through the slot; its silhouette then shows behind the frosted window. Returns end time. */
  function drop(tl, p, t, dur) {
    dur = dur == null ? 0.7 : dur;
    slot(tl, p, t, 1);
    shoot(tl, p + "-env-m", t, dur, "power2.in");
    op(tl, p + "-env-in", t + dur, 1, 0.25);
    op(tl, p + "-env-c", t + dur, 1, 0.01);
    return t + dur + 0.25;
  }
  /** padlock shackle opens (true) / closes (false) */
  function lock(tl, p, t, open, dur) {
    var el = $(p + "-lock-sh"); if (!el) return;
    tw(tl, "lock:" + p, t, open === false ? 0 : -7, dur == null ? 0.25 : dur, open === false ? "power3.in" : "back.out(2)", function (v) { el.setAttribute("transform", "translate(0 " + r2(v) + ")"); },
      function () { return num(el, "y", 0); });
  }
  /** front door angle: 0 closed … 90 lying flat toward the viewer */
  function flap(tl, p, t, deg, dur) {
    var el = $(p + "-door"); if (!el) return;
    tw(tl, "door:" + p, t, deg, dur == null ? 0.7 : dur, deg > 0 ? "bounce.out" : "power2.inOut", function (v) { setDoor(p, v); }, function () { return num(el, "a", 0); });
  }
  /** phase two: lock opens, door drops, the envelope unfolds into the answer letter. Returns end time. */
  function reveal(tl, p, t, text) {
    lock(tl, p, t, true);
    flap(tl, p, t + 0.3, 90, 0.8);
    if (text != null) textSwap(tl, "ans:" + p, t, $(p + "-ans-t"), { text: String(text) });
    op(tl, p + "-env-c", t + 1.05, 0, 0.2);
    op(tl, p + "-ans", t + 1.05, 1, 0.3);
    return t + 1.4;
  }
  /** name card text; "" = blank card */
  function nameTag(tl, p, t, text) {
    var on = !!text, el = $(p + "-name-t");
    if (on) textSwap(tl, "nm:" + p, t, el, { text: String(text) });
    op(tl, p + "-name-on", t, on ? 1 : 0, 0.25);
    op(tl, p + "-name-off", t, on ? 0 : 1, 0.25);
  }
  /** red dashed frame + red X around the name card */
  function nameBad(tl, p, t, on) { op(tl, p + "-name-bad", t, on === false ? 0 : 1, 0.25); }
  /** the bot's red copy hits the slot: accept=true → swallowed (red silhouette in the window); false → bounced back up and away. Returns end time. */
  function copyIn(tl, p, t, accept, dur) {
    var el = $(p + "-copy-m"); if (!el) return t;
    dur = dur == null ? 0.8 : dur;
    if (accept !== false) {
      slot(tl, p, t, 1);
      shoot(tl, el, t, dur, "power2.in");
      op(tl, p + "-copy-in", t + dur, 1, 0.25);
      return t + dur + 0.25;
    }
    var dy = num(el, "dy", 80);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "none", immediateRender: false }, t);
    prog(tl, t, dur, "none", function (k) {
      var x = 0, y = 0;
      if (k < 0.4) { var a = k / 0.4; y = dy * 0.32 * a * a; }
      else { var b = (k - 0.4) / 0.6, e = 1 - (1 - b) * (1 - b); x = -70 * e; y = dy * 0.32 - (dy * 0.32 + 70) * e + 30 * e * e; }
      el.setAttribute("transform", "translate(" + r2(x) + " " + r2(y) + ")");
    });
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "none", immediateRender: false }, t + dur - 0.2);
    blink(tl, p + "-slot", t + dur * 0.38, 2, 0.16, 0);
    return t + dur;
  }

  var api = {
    field: field, fields: fields, sign: sign, amt: amt, copies: copies, copyTo: copyTo, copyRed: copyRed,
    point: point, spin: spin, tick: tick, seat: seat, seats: seats, lamp: lamp, plate: plate,
    slot: slot, slotOn: slotOn, drop: drop, lock: lock, flap: flap, reveal: reveal, nameTag: nameTag, nameBad: nameBad, copyIn: copyIn,
  };
  window.KITX09 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX09.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
