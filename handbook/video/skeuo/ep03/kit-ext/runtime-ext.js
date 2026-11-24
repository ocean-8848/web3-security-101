/* ep03 kit-ext runtime — browser helpers for objects built with kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs():  ${runtimeJs()}\n${runtimeExtJs()}
 * Every helper schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no repeat:-1). Same part animated several
 * times: call in time order — each call starts from the previous call's end value.
 */
(function () {
  if (window.KITX03) return;
  var D = Math.PI / 180, CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var U = [CA, -SA * SE], V = [SA, CA * SE];
  var $ = function (id) { return document.getElementById(id); };
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
  /** opacity tween that remembers the previous target (deterministic from-values) */
  function fade(tl, sel, t, to, dur, ease) {
    var el = typeof sel === "string" ? document.querySelector(sel) : sel; if (!el) return;
    var key = "op:" + (el.id || sel), cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.25 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
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
  function rotBy(tl, id, t, ddeg, dur, ease) {
    var el = $(id); if (!el) return;
    var a0 = ("rot:" + id) in last ? last["rot:" + id] : num(el, "a", 0);
    rotTo(tl, id, t, a0 + ddeg, dur, ease);
  }

  // ---------- contractMachine
  /** turn all gears of machine p by `turns` (gear-0 reference; others follow their data-ratio) */
  function spin(tl, p, t, dur, turns, ease) {
    turns = turns == null ? 1 : turns;
    for (var k = 0; k < 8; k++) {
      var id = p + "-gear-" + k, el = $(id); if (!el) continue;
      rotBy(tl, id, t, 360 * turns * num(el, "ratio", 1), dur, ease || "none");
    }
  }
  function slot(tl, p, t, on, dur) { fade(tl, "#" + p + "-slot-glow", t, on === false ? 0 : 1, dur == null ? 0.2 : dur); }

  // ---------- slotCabinet
  function setDrawer(p, i, s) { var el = $(p + "-d" + i); if (el) el.setAttribute("transform", "translate(" + r2(s * V[0]) + "," + r2(s * V[1]) + ")"); }
  /** pull drawer i out by s world units (true = fully, false/0 = shut) */
  function drawer(tl, p, i, t, s, dur, ease) {
    var el = $(p + "-d" + i); if (!el) return;
    if (s === true) s = num(el, "max", 100); else if (s === false || s == null) s = 0;
    tw(tl, "dr:" + p + ":" + i, t, s, dur == null ? 0.6 : dur, ease || "power2.inOut", function (a) { setDrawer(p, i, a); }, function () { return num(el, "s", 0); });
  }
  /** outline drawer front: color teal|green|red|off */
  function mark(tl, p, i, t, color) {
    var c = { teal: "#2aa3c9", green: "#1f9d55", red: "#e0453a" }[color] || color;
    var el = $(p + "-hl-" + i); if (!el) return;
    if (color !== "off") tl.set(el, { attr: { stroke: c } }, t);
    fade(tl, el, t, color === "off" ? 0 : 1, 0.2);
  }
  /** red flash over the cells, then the byte blocks vanish (drawer emptied) */
  function clearDrawer(tl, p, i, t) {
    fade(tl, "#" + p + "-flash-" + i, t, 1, 0.12);
    fade(tl, "#" + p + "-fill-" + i, t + 0.18, 0, 0.3);
    fade(tl, "#" + p + "-flash-" + i, t + 0.45, 0, 0.35);
  }
  function fillDrawer(tl, p, i, t, dur) { fade(tl, "#" + p + "-fill-" + i, t, 1, dur == null ? 0.25 : dur); }

  // ---------- generic moves (whole object or any group), absolute offsets from the built position
  function fly(tl, id, t, dx, dy, dur, lift, ease) {
    var el = $(id); if (!el) return;
    var key = "fly:" + id, a = last[key] || [0, 0]; last[key] = [dx, dy];
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur || 0.8, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      var q = o.k; gsap.set(el, { x: a[0] + (dx - a[0]) * q, y: a[1] + (dy - a[1]) * q - (lift || 0) * Math.sin(Math.PI * q) });
    } }, t);
  }
  /** same as fly, offset given in world units (du, dv, dz) */
  function moveUV(tl, id, t, du, dv, dz, dur, lift, ease) {
    fly(tl, id, t, du * U[0] + dv * V[0], du * U[1] + dv * V[1] - (dz || 0) * CE, dur, lift, ease);
  }

  // ---------- hashFunnel
  function hash(tl, p, t) {
    for (var k = 0; k < 4; k++) {
      var el = $(p + "-in-" + k); if (!el) continue;
      var dy = num(el, "dy", 100), tk = t + k * 0.14;
      tl.fromTo(el, { y: 0 }, { y: dy, duration: 0.5, ease: "power2.in", immediateRender: false }, tk);
      fade(tl, el, tk + 0.42, 0, 0.12);
    }
    rotBy(tl, p + "-crank", t + 0.35, 720, 1.0, "power1.inOut");
    if ($(p + "-led") && window.KIT) { KIT.led(tl, p + "-led", t + 0.35, "blue"); KIT.led(tl, p + "-led", t + 1.4, "off"); }
    var out = $(p + "-out");
    if (out) {
      tl.fromTo(out, { x: num(out, "dx", 0), y: num(out, "dy", 0), scale: 0.3, transformOrigin: "50% 50%" }, { x: 0, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, t + 1.15);
      fade(tl, out, t + 1.15, 1, 0.15);
    }
  }
  /** put input cards back above the hopper and hide the output card */
  function hashReset(tl, p, t) {
    for (var k = 0; k < 4; k++) { var el = $(p + "-in-" + k); if (!el) continue; tl.set(el, { y: 0 }, t); fade(tl, el, t, 1, 0.2); }
    fade(tl, "#" + p + "-out", t, 0, 0.2);
  }

  // ---------- manual (cover hinged on the −u spine; true 3D, recomputed per frame)
  function setCover(p, a) {
    var g = $(p + "-cover"); if (!g) return;
    var hx = num(g, "hx"), hy = num(g, "hy"), T = num(g, "t", 5), r = a * D, c = Math.cos(r), s = Math.sin(r);
    var ms = "matrix(" + [c * U[0], c * U[1] - s * CE, V[0], V[1], hx, hy].map(function (v, i) { return i < 4 ? Math.round(v * 10000) / 10000 : r2(v); }).join(",") + ")";
    var tr = "translate(" + r2(s * U[0] * T) + "," + r2((s * U[1] + c * CE) * T) + ") ";
    var outVis = 0.574 * s + 0.578 * c > 0;
    $(p + "-cover-th").setAttribute("transform", (outVis ? tr : "") + ms);
    var out = $(p + "-cover-out"), inn = $(p + "-cover-in");
    out.setAttribute("transform", ms); out.setAttribute("opacity", outVis ? 1 : 0);
    inn.setAttribute("transform", (outVis ? "" : tr) + ms); inn.setAttribute("opacity", outVis ? 0 : 1);
  }
  /** open the cover to deg (0 shut, 180 flat open) */
  function book(tl, p, t, deg, dur, ease) {
    tw(tl, "cov:" + p, t, deg, dur == null ? 0.9 : dur, ease || "power2.inOut", function (a) { setCover(p, a); }, function () { return num($(p + "-cover"), "a", 0); });
  }

  // ---------- frameStack (tray tips over its front edge)
  function setTip(p, i, a) {
    var g = $(p + "-t" + i); if (!g) return;
    var r = a * D, m = [U[0], U[1], -Math.cos(r) * V[0], -Math.cos(r) * V[1] - Math.sin(r) * CE, num(g, "hx"), num(g, "hy")];
    var ms = "matrix(" + m.map(function (v, k) { return k < 4 ? Math.round(v * 10000) / 10000 : r2(v); }).join(",") + ")";
    g.setAttribute("transform", ms);
    var sl = $(p + "-t" + i + "-sl"); if (sl) sl.setAttribute("transform", ms);
  }
  /** roll back frame i: red flash, tray tips forward, its changes slide off, tray fades (opt.keep keeps it) */
  function tip(tl, p, i, t, opt) {
    opt = opt || {}; var dur = opt.dur || 0.55;
    fade(tl, "#" + p + "-t" + i + "-red", t, 1, 0.12);
    tw(tl, "tip:" + p + i, t + 0.1, opt.deg == null ? 70 : opt.deg, dur, "power2.in", function (a) { setTip(p, i, a); }, function () { return num($(p + "-t" + i), "a", 0); });
    var it = $(p + "-t" + i + "-items");
    if (it) { tl.fromTo(it, { y: 0 }, { y: -150, duration: dur, ease: "power2.in", immediateRender: false }, t + 0.2); fade(tl, it, t + 0.2 + dur * 0.6, 0, dur * 0.4); }
    var gg = $(p + "-t" + i + "-g");
    if (gg) tl.fromTo(gg, { y: 0 }, { y: opt.drop == null ? 36 : opt.drop, duration: dur, ease: "power2.in", immediateRender: false }, t + 0.1);
    if (!opt.keep) fade(tl, gg, t + 0.1 + dur + 0.05, 0, 0.3);
  }
  /** push frame i on top of the stack (tray drops in level, with its changes) */
  function push(tl, p, i, t, dur) {
    dur = dur || 0.45;
    tw(tl, "tip:" + p + i, t, 0, 0.01, "none", function (a) { setTip(p, i, a); }, function () { return num($(p + "-t" + i), "a", 0); });
    fade(tl, "#" + p + "-t" + i + "-red", t, 0, 0.01);
    var it = $(p + "-t" + i + "-items"); if (it) { tl.set(it, { y: 0 }, t); fade(tl, it, t, 1, 0.01); }
    var g = $(p + "-t" + i + "-g");
    tl.fromTo(g, { y: -70 }, { y: 0, duration: dur, ease: "back.out(1.3)", immediateRender: false }, t);
    fade(tl, g, t, 1, dur * 0.5);
  }

  // ---------- gasGauge
  /** move needle to value (1 = F, 0 = E). ease "steps(n)" gives tick-by-tick motion */
  function gauge(tl, p, t, value, dur, ease) {
    var el = $(p + "-needle"); if (!el) return;
    var lo = num(el, "min", -72), hi = num(el, "max", 72);
    dur = dur == null ? 0.8 : dur;
    rotTo(tl, p + "-needle", t, lo + (hi - lo) * value, dur, ease || "power2.inOut");
    if ($(p + "-lamp") && window.KIT) KIT.led(tl, p + "-lamp", t + dur * 0.95, value <= 0.06 ? "red" : "off");
  }

  // ---------- signboard
  function sign(tl, p, t, step, dur) {
    dur = dur == null ? 0.3 : dur;
    if (step === "all") { ["myth", "strike", "fact", "impact", "lamp"].forEach(function (s, k) { sign(tl, p, t + k * 0.5, s); }); return; }
    if (step === "strike") {
      var st = $(p + "-strike"), L = num(st, "l", 200);
      tl.fromTo(st, { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.4, ease: "power2.inOut", immediateRender: false }, t);
      return;
    }
    if (step === "lamp") { if (window.KIT) KIT.led(tl, p + "-lamp", t, "green"); return; }
    var el = $(p + "-" + step); if (!el) return;
    tl.fromTo(el, { y: 8 }, { y: 0, duration: dur, ease: "power2.out", immediateRender: false }, t);
    fade(tl, el, t, 1, dur);
  }

  var api = { tw: tw, fade: fade, setRot: setRot, rotTo: rotTo, rotBy: rotBy, spin: spin, slot: slot, setDrawer: setDrawer, drawer: drawer, mark: mark,
    clearDrawer: clearDrawer, fillDrawer: fillDrawer, fly: fly, moveUV: moveUV, hash: hash, hashReset: hashReset, setCover: setCover, book: book,
    setTip: setTip, tip: tip, push: push, gauge: gauge, sign: sign };
  window.KITX03 = api;
  window.KITX = Object.assign(window.KITX || {}, api);  // 多章物件库同时加载时按章号区分：KITX01 / KITX03
})();
