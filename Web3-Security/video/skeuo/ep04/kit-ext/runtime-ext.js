/* ep04 kit-ext runtime — browser helpers for objects built with ep04/kit-ext/objects-ext.mjs.
 * Inline AFTER kit's runtimeJs():  ${runtimeJs()}\n${runtimeExtJs()}
 * Exposed as window.KITX04 and merged into window.KITX (names do not clash with KITX01 / KITX03).
 * Every helper schedules tweens on a paused GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no repeat:-1, no Math.random).
 * Same part animated several times: call in time order — each call starts from the previous end value.
 * armGeom() is also evaluated in Node by objects-ext.mjs so the static SVG matches the runtime exactly.
 */
(function () {
  if (window.KITX04) return;
  var D = Math.PI / 180, CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var U = [CA, -SA * SE], V = [SA, CA * SE];
  var hasDoc = typeof document !== "undefined";
  var $ = function (id) { return hasDoc ? document.getElementById(id) : null; };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  function tw(tl, key, t, to, dur, ease, apply, init) {
    var from = key in last ? last[key] : init();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
    return from;
  }
  function op(tl, sel, t, to, dur, ease) { // opacity tween that remembers the previous target
    var el = typeof sel === "string" ? (sel.charAt(0) === "#" ? $(sel.slice(1)) : $(sel)) : sel; if (!el) return;
    var key = "op4:" + el.id, cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.25 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }
  function setRot4(id, deg) {
    var el = $(id); if (!el) return;
    var m = el.getAttribute("data-m"), px = num(el, "px", 0), py = num(el, "py", 0);
    el.setAttribute("transform", "matrix(" + m + ") translate(" + px + " " + py + ") rotate(" + r2(deg) + ") translate(" + -px + " " + -py + ")");
  }

  // =====================================================================================
  // callbackArm — spring + lazy-tongs (scissor) arm + pointing glove, all in world-canvas px.
  // P = { mx,my: mount, ox,oy: ground origin, k: object scale, n: cells, lb: bar length, gl: glove length, dr: retracted reach }
  // s in [0,1] (0 folded, 1 fingertip on target); (tx,ty) target in world-canvas px (scaled space).
  // =====================================================================================
  function armGeom(P, s, tx, ty) {
    var k = P.k || 1;
    var Tx = P.ox + (tx - P.ox) / k, Ty = P.oy + (ty - P.oy) / k; // target in unscaled local space
    var dx = Tx - P.mx, dy = Ty - P.my, Dt = Math.sqrt(dx * dx + dy * dy) || 1;
    var ax = dx / Dt, ay = dy / Dt, nx = -ay, ny = ax;
    var dE = Math.max(P.dr, Dt - P.gl), d = P.dr + (dE - P.dr) * s;
    var ls = Math.max(10, Math.min(34, d * 0.16));
    var c = Math.min(P.lb * 0.965, Math.max(1.2, (d - ls) / P.n));
    var w = Math.sqrt(P.lb * P.lb - c * c) / 2;
    var Sx = P.mx + ax * ls, Sy = P.my + ay * ls;
    var F = function (n) { return Math.round(n * 10) / 10; };
    var node = function (kk, sg) { return [Sx + ax * kk * c + nx * w * sg, Sy + ay * kk * c + ny * w * sg]; };
    var bars = "", pins = "", rp = 2.6;
    for (var i = 0; i < P.n; i++) {
      var a = node(i, 1), b = node(i + 1, -1), e = node(i, -1), g = node(i + 1, 1);
      bars += "M" + F(a[0]) + " " + F(a[1]) + "L" + F(b[0]) + " " + F(b[1]) + "M" + F(e[0]) + " " + F(e[1]) + "L" + F(g[0]) + " " + F(g[1]);
      var cx = Sx + ax * (i + 0.5) * c, cy = Sy + ay * (i + 0.5) * c;
      pins += "M" + F(cx - rp) + " " + F(cy) + "a" + rp + " " + rp + " 0 1 0 " + 2 * rp + " 0a" + rp + " " + rp + " 0 1 0 " + -2 * rp + " 0";
    }
    for (var j = 1; j < P.n; j++) for (var sg = -1; sg <= 1; sg += 2) {
      var q = node(j, sg);
      pins += "M" + F(q[0] - rp) + " " + F(q[1]) + "a" + rp + " " + rp + " 0 1 0 " + 2 * rp + " 0a" + rp + " " + rp + " 0 1 0 " + -2 * rp + " 0";
    }
    // spring coil (helix seen from the side)
    var spring = "", turns = 6, N = 72;
    for (var t = 0; t <= N; t++) {
      var u = t / N, ph = 2 * Math.PI * turns * u;
      var px = P.mx + ax * (ls * u + 2.6 * Math.cos(ph)) + nx * 8 * Math.sin(ph), py = P.my + ay * (ls * u + 2.6 * Math.cos(ph)) + ny * 8 * Math.sin(ph);
      spring += (t ? "L" : "M") + F(px) + " " + F(py);
    }
    var p0a = node(0, 1), p0b = node(0, -1), pNa = node(P.n, 1), pNb = node(P.n, -1);
    var plate0 = "M" + F(p0a[0] + nx * 3) + " " + F(p0a[1] + ny * 3) + "L" + F(p0b[0] - nx * 3) + " " + F(p0b[1] - ny * 3);
    var plateN = "M" + F(pNa[0] + nx * 3) + " " + F(pNa[1] + ny * 3) + "L" + F(pNb[0] - nx * 3) + " " + F(pNb[1] - ny * 3);
    var Ex = Sx + ax * P.n * c, Ey = Sy + ay * P.n * c, ang = Math.atan2(ay, ax) / D;
    var flip = ax < 0 ? " scale(1,-1)" : "";
    var hand = "translate(" + F(Ex) + "," + F(Ey) + ") rotate(" + F(ang) + ")" + flip;
    var tip = [P.ox + (Ex + ax * P.gl - P.ox) * k, P.oy + (Ey + ay * P.gl - P.oy) * k];
    return { bars: bars, pins: pins, spring: spring, plate0: plate0, plateN: plateN, hand: hand, tip: tip };
  }
  function armParams(p) {
    var g = $(p + "-arm");
    return { g: g, P: { mx: num(g, "mx"), my: num(g, "my"), ox: num(g, "ox"), oy: num(g, "oy"), k: num(g, "k", 1), n: num(g, "n"), lb: num(g, "lb"), gl: num(g, "gl"), dr: num(g, "dr") } };
  }
  function setArm(p, s, tx, ty) {
    var A = armParams(p); if (!A.g) return;
    var G = armGeom(A.P, s, tx, ty);
    $(p + "-arm-bars").setAttribute("d", G.bars); $(p + "-arm-bars-hi").setAttribute("d", G.bars);
    $(p + "-arm-pins").setAttribute("d", G.pins);
    $(p + "-arm-spring").setAttribute("d", G.spring); $(p + "-arm-spring-hi").setAttribute("d", G.spring);
    $(p + "-arm-plate0").setAttribute("d", G.plate0); $(p + "-arm-plateN").setAttribute("d", G.plateN);
    $(p + "-arm-hand").setAttribute("transform", G.hand);
  }
  /** extend (s=1) / retract (s=0) the arm, optionally retargeting. o = { target:[x,y], ease } */
  function callArm(tl, p, t, s, dur, o) {
    o = o || {};
    var A = armParams(p); if (!A.g) return;
    var key = "arm:" + p;
    var from = key in last ? last[key] : { s: num(A.g, "s", 0), x: num(A.g, "tx"), y: num(A.g, "ty") };
    var to = { s: s, x: o.target ? o.target[0] : from.x, y: o.target ? o.target[1] : from.y };
    last[key] = to;
    var st = { s: from.s, x: from.x, y: from.y };
    var ease = o.ease || (s > from.s ? "back.out(1.7)" : "power2.in");
    tl.fromTo(st, { s: from.s, x: from.x, y: from.y }, { s: to.s, x: to.x, y: to.y, duration: dur == null ? 0.45 : dur, ease: ease, immediateRender: false,
      onUpdate: function () { setArm(p, st.s, st.x, st.y); } }, t);
  }
  /** spring out, poke the target, fold back. o = { target, hold:0.35, reach:1 } — reach<1 = blocked short */
  function armPress(tl, p, t, o) {
    o = o || {};
    var reach = o.reach == null ? 1 : o.reach;
    callArm(tl, p, t, reach, 0.4, { target: o.target, ease: "back.out(1.8)" });
    callArm(tl, p, t + 0.42, reach * 0.94, 0.08, { ease: "power1.out" });
    callArm(tl, p, t + 0.5, reach, 0.08, { ease: "power1.in" });
    callArm(tl, p, t + 0.58 + (o.hold == null ? 0.35 : o.hold), 0, 0.4, { ease: "power2.in" });
  }

  // =====================================================================================
  // tellerCounter
  // =====================================================================================
  /** bundle i slides from the cash slot to the customer side (stacking) */
  function cashOut(tl, p, i, t, dur) {
    var el = $(p + "-cash-" + i); if (!el) return;
    var dx = num(el, "dx"), dy = num(el, "dy");
    dur = dur == null ? 0.7 : dur;
    tl.fromTo(el, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.12, ease: "none", immediateRender: false }, t);
    tl.fromTo(el, { x: 0, y: 0 }, { x: dx, y: dy, duration: dur, ease: "power2.out", immediateRender: false }, t + 0.05);
  }
  /** teller's pen: down=true lowers it onto the ledger (writes the mark), false lifts it back */
  function pen(tl, p, t, down, dur) {
    var el = $(p + "-pen"); if (!el) return;
    var dy = num(el, "dy", 40);
    tw(tl, "pen:" + p, t, down ? dy : 0, dur == null ? 0.3 : dur, down ? "power2.in" : "power2.out", function (a) { el.setAttribute("transform", "translate(0," + r2(a) + ")"); }, function () { return num(el, "y", 0); });
    if (down) op(tl, "#" + p + "-pen-mark", t + (dur == null ? 0.3 : dur), 1, 0.25);
  }
  /** vault stock tube on the glass post: value 0..1 (≤0.05 turns red) */
  function stock(tl, p, t, value, dur) {
    var el = $(p + "-stock"); if (!el) return;
    var yb = num(el, "yb"), h = num(el, "h");
    dur = dur == null ? 0.6 : dur;
    tw(tl, "stock:" + p, t, value, dur, "power1.inOut", function (v) {
      el.setAttribute("y", r2(yb - h * v)); el.setAttribute("height", r2(Math.max(0, h * v)));
      el.setAttribute("fill", v <= 0.05 ? "#e0453a" : "#3fb877");
    }, function () { return num(el, "v", 1); });
  }

  // =====================================================================================
  // hasp (function lock): strap swings over the button, padlock snaps shut
  // =====================================================================================
  function hasp(tl, p, t, locked, dur) {
    var g = $(p + "-strap"); if (!g) return;
    dur = dur == null ? 0.7 : dur;
    var aOpen = num(g, "open", -115);
    var setS = function (a) { setRot4(p + "-strap", a); };
    var initS = function () { return num(g, "a", 0); };
    if (locked) {
      tw(tl, "strap:" + p, t, 0, dur * 0.45, "power2.in", setS, initS);
      tl.fromTo("#" + p + "-shackle", { y: -7 }, { y: -7, duration: 0.01, immediateRender: false }, t + dur * 0.45);
      op(tl, "#" + p + "-lock", t + dur * 0.45, 1, 0.12);
      tl.fromTo("#" + p + "-shackle", { y: -7 }, { y: 0, duration: dur * 0.2, ease: "power3.in", immediateRender: false }, t + dur * 0.7);
      tl.fromTo("#" + p + "-lock", { y: -3 }, { y: 0, duration: dur * 0.2, ease: "bounce.out", immediateRender: false }, t + dur * 0.7);
    } else {
      tl.fromTo("#" + p + "-shackle", { y: 0 }, { y: -7, duration: dur * 0.18, ease: "power2.out", immediateRender: false }, t);
      op(tl, "#" + p + "-lock", t + dur * 0.25, 0, 0.18);
      tw(tl, "strap:" + p, t + dur * 0.4, aOpen, dur * 0.6, "back.out(1.2)", setS, initS);
    }
  }
  /** reveal (on=true) or hide the chain links one after another */
  function chainOn(tl, p, t, dur, on) {
    var g = $(p + "-chain"); if (!g) return;
    var n = num(g, "n", 0); dur = dur == null ? 0.6 : dur;
    for (var i = 0; i < n; i++) {
      var id = "#" + p + "-chain-" + (on === false ? n - 1 - i : i);
      op(tl, id, t + (dur * i) / Math.max(1, n), on === false ? 0 : 1, 0.06, "none");
    }
  }
  /** transient hasp: hourglass inside the glass lock drains (one transaction) */
  function haspSand(tl, p, t, dur) {
    var top = $(p + "-hsT"); if (!top) return;
    var y0 = num(top, "y0"), y1 = num(top, "y1");
    tl.fromTo(top, { attr: { y: y0, height: y1 - y0 } }, { attr: { y: y1, height: 0.01 }, duration: dur, ease: "none", immediateRender: false }, t);
    var b = $(p + "-hsBc"), b0 = num(b, "yb0"), b1 = num(b, "yb1"), yf = num(b, "yf");
    tl.fromTo(b, { attr: { y: b0, height: yf - b0 } }, { attr: { y: b1, height: yf - b1 }, duration: dur, ease: "none", immediateRender: false }, t);
    op(tl, "#" + p + "-hsS", t, 1, 0.08); op(tl, "#" + p + "-hsS", t + dur - 0.08, 0, 0.08);
  }

  // =====================================================================================
  // pickupLocker: doors reuse kit's KIT.door (each cell is "ID-c{i}")
  // =====================================================================================
  function lockerDoor(tl, p, i, t, deg, dur) { window.KIT.door(tl, p + "-c" + i, t, deg == null ? 105 : deg, dur == null ? 0.8 : dur); }
  /** amount appears on cell i's little screen (blink in) */
  function lockerWrite(tl, p, i, t) {
    var id = "#" + p + "-c" + i + "-amt";
    op(tl, id, t, 1, 0.08); op(tl, id, t + 0.12, 0.2, 0.06); op(tl, id, t + 0.22, 1, 0.08);
    if ($(p + "-c" + i + "-scr-on")) op(tl, "#" + p + "-c" + i + "-scr-on", t, 1, 0.15);
  }
  /** coin(s) inside cell i lift out toward +v and vanish */
  function lockerTake(tl, p, i, t, dur) {
    var el = $(p + "-c" + i + "-coin"); if (!el) return;
    dur = dur == null ? 0.6 : dur;
    var dx = 60 * V[0], dy = 60 * V[1] - 26 * CE;
    tl.fromTo(el, { x: 0, y: 0 }, { x: dx, y: dy, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
    op(tl, el, t + dur * 0.6, 0, dur * 0.4);
  }

  // =====================================================================================
  // oracleGhost: red ghost needle on ep01 miniVend(kind:"oracle")
  // =====================================================================================
  function setGhost(p, a) {
    var g = $(p + "-ghost"); if (!g) return;
    var real = num(g, "real", -20);
    setRot4(p + "-needle-bad", a);
    setRot4(p + "-needle-bad-t1", a + (real - a) * 0.16);
    setRot4(p + "-needle-bad-t2", a + (real - a) * 0.32);
    var arc = $(p + "-ghost-arc");
    if (arc) {
      var r = num(arc, "r", 29), lo = Math.min(real, a) * D, hi = Math.max(real, a) * D;
      arc.setAttribute("d", "M" + r2(r * Math.sin(lo)) + " " + r2(-r * Math.cos(lo)) + "A" + r + " " + r + " 0 0 1 " + r2(r * Math.sin(hi)) + " " + r2(-r * Math.cos(hi)));
    }
  }
  function ghost(tl, p, t, deg, dur, ease) {
    var g = $(p + "-ghost"); if (!g) return;
    tw(tl, "ghost:" + p, t, deg, dur == null ? 0.6 : dur, ease || "back.out(1.4)", function (a) { setGhost(p, a); }, function () { return num(g, "a", 50); });
  }
  function ghostOn(tl, p, t, on, dur) { op(tl, "#" + p + "-ghost-solid", t, on === false ? 0 : 1, dur == null ? 0.3 : dur); }
  /** deterministic wobble around `center` deg: a = center + amp·sin(2πs/period)·decay */
  function ghostWobble(tl, p, t, dur, center, amp, period) {
    var g = $(p + "-ghost"); if (!g) return;
    period = period || 0.5; amp = amp == null ? 8 : amp;
    var key = "ghost:" + p, c = center == null ? (key in last ? last[key] : num(g, "a", 50)) : center;
    last[key] = c;
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      var s = o.k * dur; setGhost(p, c + amp * Math.sin((2 * Math.PI * s) / period) * (1 - 0.6 * o.k));
    } }, t);
  }

  // =====================================================================================
  // punchCard (kind "tape"): tape spits out of the machine
  // =====================================================================================
  function setTape(p, s) {
    var g = $(p + "-tape"); if (!g) return;
    var l1 = num(g, "l1"), l2 = num(g, "l2"), L = s * (l1 + l2);
    $(p + "-clip1r").setAttribute("height", r2(Math.min(l1, L) + 0.01));
    $(p + "-clip2r").setAttribute("height", r2(Math.max(0, L - l1) + 0.01));
  }
  function tape(tl, p, t, s, dur, ease) {
    var g = $(p + "-tape"); if (!g) return;
    tw(tl, "tape:" + p, t, s, dur == null ? 1.2 : dur, ease || "power1.out", function (a) { setTape(p, a); }, function () { return num(g, "s", 1); });
  }
  /** red highlight on the mismatching columns: on | off | "flash" */
  function tapeMark(tl, p, t, on) {
    if ($(p + "-red-b")) tapeMark1(tl, p + "-red-b", t, on);
    tapeMark1(tl, p + "-red", t, on);
  }
  function tapeMark1(tl, rid, t, on) {
    var id = "#" + rid;
    if (on === "flash") { op(tl, id, t, 1, 0.1); op(tl, id, t + 0.2, 0.2, 0.1); op(tl, id, t + 0.4, 1, 0.1); op(tl, id, t + 0.6, 0.2, 0.1); op(tl, id, t + 0.8, 1, 0.1); return; }
    op(tl, id, t, on === false ? 0 : 1, 0.2);
  }

  var api = { armGeom: armGeom, setArm: setArm, callArm: callArm, armPress: armPress, cashOut: cashOut, pen: pen, stock: stock,
    hasp: hasp, chainOn: chainOn, haspSand: haspSand, lockerDoor: lockerDoor, lockerWrite: lockerWrite, lockerTake: lockerTake,
    setGhost: setGhost, ghost: ghost, ghostOn: ghostOn, ghostWobble: ghostWobble, setTape: setTape, tape: tape, tapeMark: tapeMark, op4: op };
  window.KITX04 = api;
  window.KITX = Object.assign(window.KITX || {}, api);  // 多章物件库同时加载时按章号区分：KITX01 / KITX03 / KITX04
})();
