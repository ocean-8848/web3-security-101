/* ep29 kit runtime — browser side helpers for objects built with objects.mjs.
 * Inline once per composition (iso.runtimeJs()) before the scene script.
 * Every helper schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a
 * function of timeline time (seek-safe, no timers, no repeat:-1).
 */
(function () {
  if (window.KIT) return;
  var D = Math.PI / 180;
  var CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var $ = function (id) { return document.getElementById(id); };
  var last = {}; // last scheduled value per animated part (lets helpers chain without a "from")
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var r1 = function (n) { return Math.round(n * 100) / 100; };

  // ---------- in-plane rotators (barrier arm, switch blades, clock hands, beacon beam)
  function setRot(id, deg) {
    var el = $(id); if (!el) return;
    var m = el.getAttribute("data-m"), px = num(el, "px", 0), py = num(el, "py", 0);
    el.setAttribute("transform", "matrix(" + m + ") translate(" + px + " " + py + ") rotate(" + r1(deg) + ") translate(" + -px + " " + -py + ")");
    if (el.__onrot) el.__onrot(deg);
  }
  function rotPoint(id, deg, lx, ly) { // local point of a rotator → world-canvas px
    var el = $(id), m = el.getAttribute("data-m").split(",").map(Number), px = num(el, "px", 0), py = num(el, "py", 0);
    var a = deg * D, x = lx - px, y = ly - py, rx = px + x * Math.cos(a) - y * Math.sin(a), ry = py + x * Math.sin(a) + y * Math.cos(a);
    return [m[0] * rx + m[2] * ry + m[4], m[1] * rx + m[3] * ry + m[5]];
  }
  function tweenVal(tl, key, t, to, dur, ease, apply) {
    var from = key in last ? last[key] : apply.initial();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
  }
  function rot(tl, id, t, toDeg, dur, ease) {
    var f = function (a) { setRot(id, a); }; f.initial = function () { return num($(id), "a", 0); };
    tweenVal(tl, "rot:" + id, t, toDeg, dur == null ? 0.6 : dur, ease, f);
  }

  // ---------- safe door (rotates about a vertical hinge; true 3D, recomputed per frame)
  function setDoor(p, deg) {
    var g = $(p + "-door"); if (!g) return;
    var hx = num(g, "hx"), hy = num(g, "hy"), w = num(g, "w"), h = num(g, "h"), T = num(g, "t");
    var a = deg * D, du = -Math.cos(a), dv = Math.sin(a), nu = Math.sin(a), nv = Math.cos(a);
    var dS = [du * CA + dv * SA, -du * SA * SE + dv * CA * SE], nS = [nu * CA + nv * SA, -nu * SA * SE + nv * CA * SE];
    var Fx = hx + w * dS[0], Fy = hy + w * dS[1];
    var out = $(p + "-door-out"), inn = $(p + "-door-in"), edge = $(p + "-door-edge"), top = $(p + "-door-top");
    out.setAttribute("transform", "matrix(" + [-dS[0], -dS[1], 0, CE, Fx, Fy].map(r1).join(",") + ")");
    inn.setAttribute("transform", "matrix(" + [dS[0], dS[1], 0, CE, hx - T * nS[0], hy - T * nS[1]].map(r1).join(",") + ")");
    var showOut = nS[1] > 0;
    out.setAttribute("opacity", showOut ? 1 : 0); inn.setAttribute("opacity", showOut ? 0 : 1);
    var P = function (x, y) { return r1(x) + "," + r1(y); };
    var Ix = Fx - T * nS[0], Iy = Fy - T * nS[1], H = h * CE;
    edge.setAttribute("points", [P(Fx, Fy), P(Ix, Iy), P(Ix, Iy + H), P(Fx, Fy + H)].join(" "));
    top.setAttribute("points", [P(hx, hy), P(Fx, Fy), P(Ix, Iy), P(hx - T * nS[0], hy - T * nS[1])].join(" "));
    var vis = deg > 1.5 ? 1 : 0; edge.setAttribute("opacity", vis); top.setAttribute("opacity", vis);
  }
  function door(tl, p, t, toDeg, dur, ease) {
    var f = function (a) { setDoor(p, a); }; f.initial = function () { return num($(p + "-door"), "a", 0); };
    tweenVal(tl, "door:" + p, t, toDeg, dur == null ? 1.0 : dur, ease || "power2.inOut", f);
  }

  // ---------- knife switch (two blades + handle bar)
  function setSwitch(p, deg) {
    setRot(p + "-blade-0", deg); setRot(p + "-blade-1", deg);
    var g = $(p + "-sw"), L = num(g, "l"), px = num($(p + "-blade-0"), "px", 0), py = num($(p + "-blade-0"), "py", 0);
    var a = rotPoint(p + "-blade-0", deg, px, py - L), b = rotPoint(p + "-blade-1", deg, px, py - L);
    var bar = $(p + "-bar"), barHi = $(p + "-bar-hi");
    [bar, barHi].forEach(function (el) { el.setAttribute("x1", r1(a[0])); el.setAttribute("y1", r1(a[1])); el.setAttribute("x2", r1(b[0])); el.setAttribute("y2", r1(b[1])); });
  }
  function toggle(tl, p, t, on, dur) { // on = closed (blades up in the clips)
    var g = $(p + "-sw"); var to = on ? num(g, "on", 0) : num(g, "off", -115);
    var f = function (a) { setSwitch(p, a); }; f.initial = function () { return num(g, "a", 0); };
    tweenVal(tl, "sw:" + p, t, to, dur == null ? 0.5 : dur, on ? "power3.in" : "back.out(1.3)", f);
    var lamp = $(p + "-lamp");
    if (lamp) tl.to(lamp, { attr: { fill: on ? lamp.getAttribute("data-on") : lamp.getAttribute("data-off") }, duration: 0.12 }, t + (dur == null ? 0.5 : dur) * 0.8);
  }

  // ---------- simple state changes
  function broke(tl, p, t, o) {
    o = o || {};
    tl.to("#" + p + "-solid", { opacity: o.ghost == null ? 0.18 : o.ghost, duration: 0.3, ease: "power1.out" }, t);
    if ($(p + "-glow")) tl.to("#" + p + "-glow", { opacity: 0, duration: 0.3 }, t);
    tl.fromTo("#" + p + "-wire", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out", immediateRender: false }, t);
    if (o.badge !== false && $(p + "-x")) tl.fromTo("#" + p + "-x", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, t + 0.08);
  }
  function fixed(tl, p, t) {
    tl.to("#" + p + "-solid", { opacity: 1, duration: 0.3 }, t);
    tl.to("#" + p + "-wire", { opacity: 0, duration: 0.25 }, t);
    if ($(p + "-x")) tl.to("#" + p + "-x", { opacity: 0, duration: 0.2 }, t);
    if ($(p + "-glow")) tl.to("#" + p + "-glow", { opacity: 1, duration: 0.3 }, t);
  }
  var LEDC = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
  function led(tl, id, t, color) { // id of an LED circle; its halo is id+"-h"
    var c = LEDC[color] || color;
    tl.to("#" + id, { attr: { fill: c }, duration: 0.15, ease: "none" }, t);
    if ($(id + "-h")) tl.to("#" + id + "-h", { attr: { fill: c }, opacity: color === "off" ? 0 : 0.35, duration: 0.15, ease: "none" }, t);
  }
  function swap(tl, a, b, t, dur) { // crossfade selector a → selector b
    tl.to(a, { opacity: 0, duration: dur || 0.25, ease: "power1.inOut" }, t);
    tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: dur || 0.25, ease: "power1.inOut", immediateRender: false }, t);
  }
  function pop(tl, sel, t, d) {
    tl.fromTo(sel, { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: d || 0.25, ease: "back.out(1.4)", immediateRender: false }, t);
  }
  function grow(tl, p, t, d) { // object rises from its ground origin
    var g = $(p), o = g.getAttribute("data-ox") + " " + g.getAttribute("data-oy");
    tl.fromTo("#" + p, { scaleY: 0, opacity: 1, svgOrigin: o }, { scaleY: 1, svgOrigin: o, duration: d || 0.45, ease: "back.out(1.4)", immediateRender: false }, t);
  }
  function draw(tl, id, t, dur) { // reveal an iso.dashCurve
    var m = $(id + "-m"), L = +m.getAttribute("stroke-dasharray").split(" ")[0];
    tl.fromTo(m, { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: dur || 0.6, ease: "power2.inOut", immediateRender: false }, t);
    pop(tl, "#" + id + "-a", t, 0.2);
    pop(tl, "#" + id + "-b", t + (dur || 0.6) * 0.9, 0.25);
  }
  function cam(tl, t, c, dur, ease) {
    tl.to("#cam", { x: c.x, y: c.y, scale: c.scale, duration: dur || 1.0, ease: ease || "power2.inOut" }, t);
    tl.to(".wl", { scale: 1 / c.scale, duration: dur || 1.0, ease: ease || "power2.inOut" }, t);
  }
  function camSet(tl, c) { tl.set("#cam", { x: c.x, y: c.y, scale: c.scale }, 0); tl.set(".wl", { scale: 1 / c.scale }, 0); }

  // ---------- object-specific
  function arm(tl, p, t, up, dur) { var el = $(p + "-arm"); rot(tl, p + "-arm", t, up ? num(el, "up", -78) : 0, dur == null ? 0.7 : dur, up ? "power2.inOut" : "power2.in"); }
  function beacon(tl, p, t, dur, period) { // rotating alarm light, deterministic in time
    period = period || 0.9;
    var lit = $(p + "-lit"), beam = $(p + "-beamg"), o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      var s = o.k * dur, on = o.k > 0 && o.k < 1;
      setRot(p + "-beam", (360 * s) / period);
      beam.setAttribute("opacity", on ? 1 : 0);
      lit.setAttribute("opacity", on ? r1(0.55 + 0.45 * Math.cos((2 * Math.PI * s) / period)) : 0);
    } }, t);
  }
  function sand(tl, p, t, dur) { // hourglass top drains, bottom fills
    var g = $(p + "-hg"), y0 = num(g, "y0"), y1 = num(g, "y1");
    tl.fromTo("#" + p + "-sandT", { attr: { y: y0, height: y1 - y0 + 4 } }, { attr: { y: y1 - 2, height: 6 }, duration: dur, ease: "none", immediateRender: false }, t);
    tl.fromTo("#" + p + "-sandB", { scaleY: 0.35, svgOrigin: g.getAttribute("data-bot") }, { scaleY: 1, svgOrigin: g.getAttribute("data-bot"), duration: dur, ease: "none", immediateRender: false }, t);
    tl.fromTo("#" + p + "-stream", { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t);
    tl.to("#" + p + "-stream", { opacity: 0, duration: 0.1 }, t + dur - 0.1);
  }
  function clock(tl, p, t, dur, minutes) { // advance the hands by `minutes`
    var mh = p + "-mh", hh = p + "-hh";
    var m0 = "rot:" + mh in last ? last["rot:" + mh] : num($(mh), "a", 0), h0 = "rot:" + hh in last ? last["rot:" + hh] : num($(hh), "a", 0);
    rot(tl, mh, t, m0 + minutes * 6, dur, "power1.inOut"); rot(tl, hh, t, h0 + minutes * 0.5, dur, "power1.inOut");
  }
  function stamp(tl, p, t) { // seal lifts over the mark, presses, mark appears, seal returns aside
    var g = $(p + "-stamp"), ax = num(g, "ax", 0), ay = num(g, "ay", 0);
    tl.fromTo("#" + p + "-stamp", { x: ax, y: ay }, { x: 0, y: -90, duration: 0.45, ease: "power2.inOut", immediateRender: false }, t);
    tl.to("#" + p + "-stamp", { y: 0, duration: 0.16, ease: "power3.in" }, t + 0.5);
    tl.fromTo("#" + p + "-mark", { opacity: 0, scale: 1.15, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, t + 0.66);
    tl.to("#" + p + "-stamp", { x: ax, y: ay, duration: 0.5, ease: "power2.inOut" }, t + 0.86);
  }

  window.KIT = { setRot: setRot, rotPoint: rotPoint, rot: rot, setDoor: setDoor, door: door, setSwitch: setSwitch, toggle: toggle,
    broke: broke, fixed: fixed, led: led, swap: swap, pop: pop, grow: grow, draw: draw, cam: cam, camSet: camSet,
    arm: arm, beacon: beacon, sand: sand, clock: clock, stamp: stamp, LEDC: LEDC };
})();
