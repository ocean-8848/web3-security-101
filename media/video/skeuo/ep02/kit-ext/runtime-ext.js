/* ep02 kit-ext runtime — animation helpers for objects-ext.mjs, appended to window.KIT.
 * Inline after the kit runtime (iso.runtimeJs()) and before the scene script.
 * Every helper schedules tweens on GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1).
 */
(function () {
  if (!window.KIT || window.KIT.__ext) return;
  var K = window.KIT;
  var D = Math.PI / 180;
  var CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var $ = function (id) { return document.getElementById(id); };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var Wp = function (u, v, z) { return [u * CA + v * SA, -u * SA * SE + v * CA * SE - z * CE]; };
  var depth = function (u, v, z) { return -u * SA * CE + v * CA * CE + z * SE; };
  var last = {};
  function tweenVal(tl, key, t, to, dur, ease, apply) {
    var from = key in last ? last[key] : apply.initial();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
  }

  // ---------- lottery drum: caps + crank rotate, bars & balls recomputed, balls depth-sorted
  function setDrum(p, deg) {
    var g = $(p + "-drum"); if (!g) return;
    var G = g.__geo || (g.__geo = JSON.parse(g.getAttribute("data-geo")));
    K.setRot(p + "-cap-0", deg); K.setRot(p + "-cap-1", deg); K.setRot(p + "-crank", deg);
    var at = function (du, dv, z) { return Wp(G.ou + du, G.ov + dv, z); };
    for (var k = 0; k < G.nBars; k++) {
      var a = (k * 360 / G.nBars + deg) * D, vv = G.R * Math.cos(a), zz = G.cz - G.R * Math.sin(a);
      var A = at(-G.HL, vv, zz), B = at(G.HL, vv, zz), front = depth(0, vv, zz - G.cz) > 0;
      ["b", "f"].forEach(function (c) {
        var el = $(p + "-bar" + c + "-" + k); if (!el) return;
        el.setAttribute("x1", r2(A[0])); el.setAttribute("y1", r2(A[1])); el.setAttribute("x2", r2(B[0])); el.setAttribute("y2", r2(B[1]));
        el.setAttribute("opacity", c === "f" ? (front ? 1 : 0) : (front ? 0 : 0.55));
      });
    }
    var ph = deg * D, list = [];
    G.balls.forEach(function (b, i) {
      var ang = (90 + 62 * Math.sin(ph * b[3] + b[2])) * D, rr = b[1] * (G.R - G.rb - 4);
      var vv = rr * Math.cos(ang), zz = G.cz - rr * Math.sin(ang), P = at(b[0], vv, zz);
      var el = $(p + "-ball-" + i); if (!el) return;
      el.setAttribute("transform", "translate(" + r2(P[0]) + "," + r2(P[1]) + ")");
      list.push([depth(b[0], vv, zz), el]);
    });
    list.sort(function (x, y) { return x[0] - y[0]; });
    var host = $(p + "-balls"); list.forEach(function (e) { host.appendChild(e[1]); });
  }
  function drum(tl, p, t, dur, turns) {
    var f = function (a) { setDrum(p, a); }; f.initial = function () { return num($(p + "-drum"), "a", 0); };
    var from = "drum:" + p in last ? last["drum:" + p] : f.initial();
    tweenVal(tl, "drum:" + p, t, from + 360 * (turns == null ? 3 : turns), dur == null ? 2 : dur, "power1.inOut", f);
  }
  function ballOut(tl, p, t, dur) { // ball drops from the chute into the tray
    var g = $(p + "-out"), sx = num(g, "sx", 0), sy = num(g, "sy", -40);
    tl.fromTo(g, { opacity: 0, x: sx, y: sy }, { opacity: 1, duration: 0.08, immediateRender: false }, t);
    tl.fromTo(g, { x: sx, y: sy }, { x: 0, y: 0, duration: dur || 0.7, ease: "bounce.out", immediateRender: false }, t);
  }

  // ---------- PRNG counter: pointer clicks `steps` notches (45° each), crank turns along
  function tick(tl, p, t, steps, dur) {
    var cur = "rot:" + p + "-ptr" in last ? last["rot:" + p + "-ptr"] : num($(p + "-ptr"), "a", 0);
    var to = cur + 45 * steps; last["rot:" + p + "-ptr"] = to;
    var n = Math.abs(steps), d = dur == null ? 0.25 * n : dur, el = $(p + "-ptr"), cr = $(p + "-crank"), c0 = num(cr, "a", 0) + (cur - num(el, "a", 0)) * 4;
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: d, ease: "none", immediateRender: false, onUpdate: function () {
      // stepped motion: each notch snaps in the last 35% of its slot
      var x = o.k * n, i = Math.floor(x), fr = x - i, e = fr < 0.65 ? 0 : Math.pow((fr - 0.65) / 0.35, 0.6);
      if (o.k >= 1) { i = n; e = 0; }
      var a = cur + Math.sign(steps) * 45 * (i + e);
      K.setRot(p + "-ptr", a); if (cr) K.setRot(p + "-crank", c0 + (a - cur) * 4);
    } }, t);
  }

  // ---------- combo dial: all rings turn; neighbours counter-rotate, outer rings slower
  function dialTurn(tl, p, t, deg, dur) {
    var n = num($(p + "-dialroot"), "n", 1);
    for (var i = 0; i < n; i++) {
      var id = p + "-ring-" + i, cur = "rot:" + id in last ? last["rot:" + id] : num($(id), "a", 0);
      var k = n === 1 ? 1 : (i % 2 ? -1 : 1) * (1 - i * 0.08);
      K.rot(tl, id, t, cur + deg * k, dur == null ? 1 : dur, "power2.inOut");
    }
  }

  // ---------- shaft: stripes slide = spin
  function shaftSpin(tl, p, t, dur, dist) {
    var el = $(p + "-st"), key = "shaft:" + p, from = key in last ? last[key] : 0, to = from - (dist == null ? 180 : dist);
    last[key] = to;
    tl.fromTo(el, { attr: { "stroke-dashoffset": from } }, { attr: { "stroke-dashoffset": to }, duration: dur || 1, ease: "none", immediateRender: false }, t);
  }

  // ---------- dice cup: lift (k 0→1) / shake; dice roll
  function setCup(p, k, sh) {
    var g = $(p + "-cup"); if (!g) return;
    var px = num(g, "px"), py = num(g, "py"), dx = num(g, "dx"), dy = num(g, "dy"), r = num(g, "r");
    var w = sh || 0;
    g.setAttribute("transform", "translate(" + r2(dx * k + w * 4) + "," + r2(dy * k - Math.abs(w) * 6) + ") rotate(" + r2(r * k + w * 7) + " " + px + " " + py + ")");
  }
  function cup(tl, p, t, up, dur) {
    var f = function (a) { setCup(p, a, 0); }; f.initial = function () { return num($(p + "-cup"), "k", 0); };
    tweenVal(tl, "cup:" + p, t, up ? 1 : 0, dur == null ? 0.6 : dur, up ? "power2.out" : "power2.in", f);
  }
  function cupShake(tl, p, t, dur, hz) {
    var o = { k: 0 }, d = dur || 1, h = hz || 5;
    tl.fromTo(o, { k: 0 }, { k: 1, duration: d, ease: "none", immediateRender: false, onUpdate: function () {
      var env = Math.sin(Math.PI * o.k); setCup(p, 0, o.k >= 1 ? 0 : env * Math.sin(2 * Math.PI * h * o.k * d));
    } }, t);
  }
  function roll(tl, dieId, t, value) { // show face `value` (1–6) on top
    for (var v = 1; v <= 6; v++) tl.set("#" + dieId + "-v" + v, { opacity: v === value ? 1 : 0 }, t);
  }

  // ---------- GPU fans
  function fans(tl, p, t, dur, rps) {
    var n = num($(p + "-cav"), "nf", 0), o = { k: 0 }, d = dur || 2, R = rps == null ? 3 : rps;
    var base = []; for (var i = 0; i < n; i++) base.push(num($(p + "-fan-" + i), "a", 0));
    tl.fromTo(o, { k: 0 }, { k: 1, duration: d, ease: "none", immediateRender: false, onUpdate: function () {
      // spin-up over the first 15%, constant, spin-down over the last 15%
      var k = o.k, ramp = 0.15, s = k < ramp ? (k * k) / (2 * ramp) : k > 1 - ramp ? 1 - ramp / 2 - ((1 - k) * (1 - k)) / (2 * ramp) : k - ramp / 2;
      var a = 360 * R * d * s / (1 - ramp);
      for (var i = 0; i < n; i++) K.setRot(p + "-fan-" + i, base[i] + a * (i % 2 ? 0.93 : 1));
    } }, t);
  }

  // ---------- roll counter (odometer)
  function setCount(p, v) {
    var g = $(p + "-ctr"); if (!g) return;
    var n = num(g, "n", 10);
    for (var i = 0; i < n; i++) {
      var el = $(p + "-dg-" + i), h = num(el, "h", 40), P = Math.pow(10, i), d = Math.floor(v / P) % 10, rem = v % P, pos = d;
      if (i === 0) pos = v % 10; else if (rem > P - 1) pos = d + (rem - (P - 1));
      el.setAttribute("transform", "translate(0," + r2(-h * pos) + ")");
    }
  }
  function count(tl, p, t, dur, from, to, ease) {
    var o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: ease || "power1.in", immediateRender: false, onUpdate: function () { setCount(p, Math.max(0, o.v)); } }, t);
  }

  // ---------- derivation tree leak: trunk → branches → keys turn red
  function leak(tl, p, t, stagger, back) {
    var g = $(p + "-parts"), nb = num(g, "nb", 3), nk = num(g, "nk", 3), s = stagger == null ? 0.18 : stagger, ids = [p + "-trunk"], i;
    for (i = 0; i < nb; i++) ids.push(p + "-br-" + i);
    for (i = 0; i < nk; i++) ids.push(p + "-key-" + i);
    ids.forEach(function (id, j) {
      var tt = t + j * s;
      if (back) K.swap(tl, "#" + id + "-r", "#" + id, tt, 0.2); else K.swap(tl, "#" + id, "#" + id + "-r", tt, 0.2);
    });
  }

  // ---------- puzzle set: together (k=0) / apart (k=1)
  function setAsm(p, k) {
    var g = $(p + "-set"); if (!g) return;
    g.getAttribute("data-pieces").split(",").forEach(function (i) {
      var el = $(p + "-pc-" + i); el.setAttribute("transform", "translate(" + r2(num(el, "dx", 0) * k) + "," + r2(num(el, "dy", 0) * k) + ")");
    });
  }
  function assemble(tl, p, t, together, dur) {
    var f = function (a) { setAsm(p, a); }; f.initial = function () { return num($(p + "-set"), "k", 1); };
    tweenVal(tl, "asm:" + p, t, together === false ? 1 : 0, dur == null ? 0.8 : dur, together === false ? "power2.inOut" : "back.out(1.2)", f);
  }

  // ---------- k machine: gear turns, the k token slides out of the slot into the tray
  function emit(tl, p, t, dur) {
    var d = dur || 0.8, gid = p + "-gear", cur = "rot:" + gid in last ? last["rot:" + gid] : num($(gid), "a", 0);
    K.rot(tl, gid, t, cur + 180, d, "power1.inOut");
    var k = $(p + "-k"), sx = num(k, "sx", 0), sy = num(k, "sy", -40);
    tl.fromTo(k, { opacity: 0, x: sx, y: sy }, { opacity: 1, duration: 0.1, immediateRender: false }, t + d * 0.45);
    tl.fromTo(k, { x: sx, y: sy }, { x: 0, y: 0, duration: d * 0.55, ease: "bounce.out", immediateRender: false }, t + d * 0.45);
  }

  // ---------- conveyor belt
  function belt(tl, p, t, dur, dist) {
    var el = $(p + "-stripes"), sp = num(el, "sp", 28), key = "belt:" + p, from = key in last ? last[key] : 0, to = from + (dist == null ? 200 : dist), o = { x: from };
    last[key] = to;
    tl.fromTo(o, { x: from }, { x: to, duration: dur || 1, ease: "none", immediateRender: false, onUpdate: function () { el.setAttribute("transform", "translate(" + r2(((o.x % sp) + sp) % sp) + ",0)"); } }, t);
  }

  // ---------- cloth unveil / path draw
  function unveil(tl, p, t, dur, cover) {
    var c = "#" + p + "-cloth", d = dur || 0.6;
    if (cover) tl.fromTo(c, { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: d, ease: "power2.in", immediateRender: false }, t);
    else tl.fromTo(c, { opacity: 1, y: 0 }, { opacity: 0, y: -60, duration: d, ease: "power2.out", immediateRender: false }, t);
  }
  function drawPath(tl, id, t, dur) { // reveal any <path> by stroke-dashoffset
    var el = $(id), L = Math.ceil(el.getTotalLength());
    el.setAttribute("stroke-dasharray", L + " " + L); el.setAttribute("stroke-dashoffset", L);
    tl.fromTo(el, { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: dur || 1, ease: "power1.inOut", immediateRender: false }, t);
  }

  K.setDrum = setDrum; K.drum = drum; K.ballOut = ballOut; K.tick = tick; K.dialTurn = dialTurn; K.shaftSpin = shaftSpin;
  K.setCup = setCup; K.cup = cup; K.cupShake = cupShake; K.roll = roll; K.fans = fans; K.setCount = setCount; K.count = count;
  K.leak = leak; K.assemble = assemble; K.emit = emit; K.belt = belt; K.unveil = unveil; K.drawPath = drawPath;
  K.__ext = true;
})();
