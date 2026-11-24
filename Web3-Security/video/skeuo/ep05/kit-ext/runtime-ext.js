/* ep05 kit-ext runtime — browser helpers for objects built with ep05/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs():  ${runtimeJs()}\n${runtimeExtJs()}
 * Registers window.KITX05 and merges into window.KITX (call by chapter name when several kit-ext libraries are loaded).
 * Every helper schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure function of
 * timeline time (seek-safe, no timers, no repeat:-1). Same part animated several times: call in time order.
 */
(function () {
  if (window.KITX05) return;
  var D = Math.PI / 180, CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var U = [CA, -SA * SE], V = [SA, CA * SE];
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var LEDC = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
  function tw(tl, key, t, to, dur, ease, apply, init) {
    var from = key in last ? last[key] : init();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
    return from;
  }
  /** opacity tween that remembers the previous target */
  function fade(tl, sel, t, to, dur, ease) {
    var el = typeof sel === "string" ? (sel.charAt(0) === "#" ? $(sel.slice(1)) : document.querySelector(sel)) : sel; if (!el) return;
    var key = "op:" + (el.id || sel), cur = el.getAttribute("opacity");
    var from = key in last ? last[key] : (cur == null ? 1 : +cur);
    last[key] = to;
    tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur == null ? 0.25 : dur, ease: ease || "power1.inOut", immediateRender: false }, t);
  }
  /** y offset (px) tween with memory */
  function ymove(tl, el, t, to, dur, ease) {
    if (!el) return;
    var key = "y:" + el.id, from = key in last ? last[key] : 0;
    last[key] = to;
    tl.fromTo(el, { y: from }, { y: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false }, t);
  }
  function led(tl, id, t, color) {
    if (window.KIT && KIT.led) { KIT.led(tl, id, t, color); return; }
    var c = LEDC[color] || color;
    tl.to("#" + id, { attr: { fill: c }, duration: 0.15, ease: "none" }, t);
  }
  /** absolute screen offset of any group (parabolic lift optional) */
  function fly(tl, id, t, dx, dy, dur, lift, ease) {
    var el = $(id); if (!el) return;
    var key = "fly:" + id, a = last[key] || [0, 0]; last[key] = [dx, dy];
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur || 0.8, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      var q = o.k; gsap.set(el, { x: a[0] + (dx - a[0]) * q, y: a[1] + (dy - a[1]) * q - (lift || 0) * Math.sin(Math.PI * q) });
    } }, t);
  }
  function moveUV(tl, id, t, du, dv, dz, dur, lift, ease) {
    fly(tl, id, t, du * U[0] + dv * V[0], du * U[1] + dv * V[1] - (dz || 0) * CE, dur, lift, ease);
  }

  // ================= funcPanel
  /** press button i: cap sinks 6 units, flashes, springs back (hold:true keeps it down) */
  function press(tl, p, i, t, o) {
    o = o || {};
    var b = $(p + "-btn-" + i); if (!b) return;
    var dy = 6 * CE;
    tl.fromTo(b, { y: 0 }, { y: dy, duration: 0.1, ease: "power2.in", immediateRender: false }, t);
    if (!o.hold) tl.to(b, { y: 0, duration: 0.25, ease: "back.out(2)" }, t + 0.28);
    var fl = $(p + "-btn-" + i + "-fl");
    if (fl) { tl.fromTo(fl, { opacity: 0 }, { opacity: 0.85, duration: 0.08, immediateRender: false }, t + 0.08); tl.to(fl, { opacity: 0, duration: 0.35 }, t + 0.18); }
    var st = $(p + "-st-" + i);
    if (st && o.status !== false) { led(tl, p + "-st-" + i, t + 0.1, o.status || "green"); }
  }
  function setLid(id, a) {
    var g = $(id); if (!g) return;
    var b = g.getAttribute("data-b").split(",").map(Number), hx = num(g, "hx"), hy = num(g, "hy"), w = num(g, "w"), l = num(g, "l"), hh = num(g, "h");
    var c = Math.cos(a * D), s = Math.sin(a * D);
    var Pt = function (x, ss, h) { var ks = ss * c - h * s, kn = ss * s + h * c; return r2(hx + x * b[0] + ks * b[2] + kn * b[4]) + "," + r2(hy + x * b[1] + ks * b[3] + kn * b[5]); };
    var w2 = w / 2;
    var F = [
      [Pt(-w2, 0, 0), Pt(w2, 0, 0), Pt(w2, 0, hh), Pt(-w2, 0, hh)],
      [Pt(w2, 0, 0), Pt(w2, l, 0), Pt(w2, l, hh), Pt(w2, 0, hh)],
      [Pt(-w2, 0, 0), Pt(-w2, l, 0), Pt(-w2, l, hh), Pt(-w2, 0, hh)],
      [Pt(-w2, 0, hh), Pt(w2, 0, hh), Pt(w2, l, hh), Pt(-w2, l, hh)],
      [Pt(-w2, l, 0), Pt(w2, l, 0), Pt(w2, l, hh), Pt(-w2, l, hh)],
      [Pt(-12, l, hh - 9), Pt(12, l, hh - 9), Pt(12, l + 9, hh - 9), Pt(-12, l + 9, hh - 9)]
    ];
    for (var k = 0; k < 6; k++) { var el = $(id + "-f" + k); if (el) el.setAttribute("points", F[k].join(" ")); }
  }
  /** flip cover of button i to deg (0 closed, ~100 open) */
  function lid(tl, p, i, t, deg, dur, ease) {
    var id = p + "-cover-" + i, el = $(id); if (!el) return;
    tw(tl, "lid:" + id, t, deg, dur == null ? 0.5 : dur, ease || "power2.inOut", function (a) { setLid(id, a); }, function () { return num(el, "a", 0); });
  }
  /** guard state of button i: "card" (cover + reader drop on), "none" (removed), "broken" (red dashed gap), "plate" (welded plate drops) */
  function guard(tl, p, i, t, mode, dur) {
    dur = dur == null ? 0.45 : dur;
    var gd = $(p + "-guard-" + i), rd = $(p + "-rdr-" + i), gap = $(p + "-gap-" + i), pl = $(p + "-plate-" + i);
    var want = { guard: mode === "card" ? 1 : 0, rdr: mode === "card" ? 1 : 0, gap: mode === "broken" ? 1 : 0, plate: mode === "plate" ? 1 : 0 };
    if (gd) {
      var gOn = ("op:" + gd.id) in last ? last["op:" + gd.id] : +(gd.getAttribute("opacity") || 1);
      if (want.guard && !gOn) { tl.fromTo(gd, { y: -60 }, { y: 0, duration: dur, ease: "bounce.out", immediateRender: false }, t); }
      fade(tl, gd, t, want.guard, want.guard ? dur * 0.4 : dur * 0.6);
    }
    if (rd) { fade(tl, rd, t + (want.rdr ? dur * 0.5 : 0), want.rdr, 0.25); if (want.rdr && window.KIT) KIT.pop(tl, "#" + rd.id, t + dur * 0.5, 0.3); }
    if (gap) fade(tl, gap, t, want.gap, 0.25);
    if (pl) {
      var pOn = ("op:" + pl.id) in last ? last["op:" + pl.id] : +(pl.getAttribute("opacity") || 1);
      if (want.plate && !pOn) tl.fromTo(pl, { y: -120 }, { y: 0, duration: dur * 1.2, ease: "power3.in", immediateRender: false }, t);
      fade(tl, pl, t, want.plate, want.plate ? 0.15 : 0.3);
    }
  }
  /** card swipe at reader i: slot glows, LED blinks blue, then green (ok) or red */
  function swipe(tl, p, i, t, ok) {
    var rs = $(p + "-rs-" + i), id = p + "-rd-" + i;
    if (rs) { tl.fromTo(rs, { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, t); tl.to(rs, { opacity: 0, duration: 0.3 }, t + 0.35); }
    led(tl, id, t, "blue"); led(tl, id, t + 0.14, "off"); led(tl, id, t + 0.26, "blue"); led(tl, id, t + 0.4, ok === false ? "red" : "green");
  }
  function rd(tl, p, i, t, color) { led(tl, p + "-rd-" + i, t, color); }

  // ================= accountSafe
  function setKey(id, ins, a) {
    var g = $(id); if (!g) return;
    var kx = num(g, "kx"), ky = num(g, "ky");
    var off = -30 * ins + (1 - ins) * 46, ox = kx + off * V[0], oy = ky + off * V[1];
    var c = Math.cos(a * D), s = Math.sin(a * D);
    var yx = s * U[0], yy = c * CE + s * U[1];
    var kb = $(id + "-kb");
    kb.setAttribute("transform", "matrix(" + [V[0], V[1], yx, yy, ox, oy].map(function (n) { return Math.round(n * 10000) / 10000; }).join(",") + ")");
    var bl = $(id + "-bl"), x0 = Math.max(0, -off);
    bl.setAttribute("x", r2(x0)); bl.setAttribute("width", r2(Math.max(0, 34 - x0)));
    var tg = $(id + "-tag");
    tg.setAttribute("transform", "matrix(" + [U[0], U[1], 0, CE, kx + (off + 35) * V[0], ky + (off + 35) * V[1]].map(function (n) { return Math.round(n * 10000) / 10000; }).join(",") + ")");
  }
  function keyState(id) { var g = $(id); return { ins: num(g, "ins", 0), a: num(g, "a", 0) }; }
  function keyTween(tl, id, t, ins, a, dur, ease) {
    var g = $(id); if (!g) return;
    var key = "key:" + id, from = last[key] || keyState(id);
    last[key] = { ins: ins, a: a };
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      setKey(id, from.ins + (ins - from.ins) * o.k, from.a + (a - from.a) * o.k);
    } }, t);
  }
  /** insert key ("owner-0" etc.) of account safe p: appears in front, slides into the keyhole, turns 90° (turn:false skips) */
  function keyIn(tl, p, k, t, o) {
    o = o || {};
    var id = p + "-k-" + k; if (!$(id)) return;
    var cur = last["key:" + id] || keyState(id);
    fade(tl, $(id), t, 1, 0.15);
    keyTween(tl, id, t, 1, cur.a, o.dur || 0.45, "power2.in");
    if (o.turn !== false) keyTween(tl, id, t + (o.dur || 0.45) + 0.05, 1, o.deg == null ? 90 : o.deg, 0.3, "power2.inOut");
  }
  function keyTurn(tl, p, k, t, deg, dur) { var id = p + "-k-" + k, cur = last["key:" + id] || keyState(id); keyTween(tl, id, t, cur.ins, deg, dur || 0.3); }
  function keyOut(tl, p, k, t, o) {
    o = o || {};
    var id = p + "-k-" + k; if (!$(id)) return;
    var cur = last["key:" + id] || keyState(id);
    if (cur.a) keyTween(tl, id, t, cur.ins, 0, 0.25);
    keyTween(tl, id, t + (cur.a ? 0.3 : 0), 0, 0, 0.4, "power2.out");
    if (o.hide !== false) fade(tl, $(id), t + (cur.a ? 0.3 : 0) + 0.3, 0, 0.2);
  }
  /** swap lock cores to attacker red (or back): dials default ["owner","active"] */
  function cores(tl, p, t, to, dials, dur) {
    (dials || ["owner", "active"]).forEach(function (d, k) {
      var a = $(p + "-core-" + d), b = $(p + "-core-" + d + "-atk"); if (!a || !b) return;
      var red = to === "attacker";
      fade(tl, a, t + k * 0.25, red ? 0 : 1, dur || 0.3); fade(tl, b, t + k * 0.25, red ? 1 : 0, dur || 0.3);
    });
  }
  /** highlight ring around a dial */
  function ring(tl, p, dial, t, on, dur) { fade(tl, $(p + "-ring-" + dial), t, on === false ? 0 : 1, dur || 0.25); }
  /** out-chute shutter: closed=true drops it down (and the OUT LED turns red) */
  function gate(tl, p, t, closed, dur) {
    var g = $(p + "-gate"); if (!g) return;
    var dy = num(g, "dy", 60);
    var key = "gate:" + p, cur = key in last ? last[key] : (g.getAttribute("transform").indexOf("(0,0)") >= 0 ? 0 : -dy);
    var to = closed === false ? -dy : 0; last[key] = to;
    var o = { y: cur };
    tl.fromTo(o, { y: cur }, { y: to, duration: dur || (closed === false ? 0.5 : 0.35), ease: closed === false ? "power2.inOut" : "bounce.out", immediateRender: false, onUpdate: function () {
      g.setAttribute("transform", "translate(0," + r2(o.y) + ")");
    } }, t);
    led(tl, p + "-out-led", t + 0.2, closed === false ? "green" : "red");
  }
  /** n coins (≤3 per call, reused) drop through the top IN slot */
  function coinIn(tl, p, t, n, gap) {
    n = n || 3; gap = gap || 0.3;
    var gl = $(p + "-in-glow");
    for (var k = 0; k < n; k++) {
      var c = $(p + "-coin-" + (k % 3)); if (!c) continue;
      var dy = num(c, "dy", 120), tk = t + k * gap;
      tl.fromTo(c, { y: -dy * 0.25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power1.out", immediateRender: false }, tk);
      tl.fromTo(c, { y: 0 }, { y: dy * 0.32, duration: 0.3, ease: "power2.in", immediateRender: false }, tk + 0.2);
      tl.to(c, { opacity: 0, duration: 0.08 }, tk + 0.44);
      if (gl) { tl.fromTo(gl, { opacity: 0 }, { opacity: 1, duration: 0.06, immediateRender: false }, tk + 0.42); tl.to(gl, { opacity: 0, duration: 0.25 }, tk + 0.5); }
    }
  }
  /** coins slide out of the OUT chute onto the tray (back=true hides them again) */
  function coinOut(tl, p, t, back) {
    var g = $(p + "-outc"); if (!g) return;
    if (back) { fade(tl, g, t, 0, 0.25); return; }
    tl.fromTo(g, { y: num(g, "dy", -40) }, { y: 0, duration: 0.45, ease: "bounce.out", immediateRender: false }, t);
    fade(tl, g, t, 1, 0.12);
  }

  // ================= thresholdMeter
  function setLevel(p, lv) {
    var g = $(p + "-liq"); if (!g) return;
    var by = num(g, "by"), uh = num(g, "uh"), th = num(g, "th"), ry = num(g, "ry");
    var y = by - lv * uh;
    var clip = $(p + "-clip"); clip.setAttribute("y", r2(y)); clip.setAttribute("height", r2(by + ry + 6 - y));
    var top = $(p + "-liq-top"); top.setAttribute("cy", r2(y)); top.setAttribute("opacity", lv > 0.01 ? 1 : 0);
    var on = lv >= th - 1e-6, lamp = $(p + "-lamp"), h = $(p + "-lamp-h");
    if (lamp) lamp.setAttribute("fill", on ? LEDC.green : LEDC.off);
    if (h) h.setAttribute("opacity", on ? 0.35 : 0);
  }
  /** liquid column to `to` units (lamp turns green the moment it reaches the threshold) */
  function fill(tl, p, t, to, dur, ease) {
    var g = $(p + "-liq"); if (!g) return;
    tw(tl, "lv:" + p, t, to, dur == null ? 0.6 : dur, ease || "power2.out", function (a) { setLevel(p, a); }, function () { return num(g, "lv", 0); });
  }

  // ================= iceShell
  /** freeze: mode "up" (ice rises from the ground, clip) or "drop" (shell drops on from above) */
  function freeze(tl, p, t, dur, mode) {
    dur = dur || 0.9;
    var ice = $(p + "-ice"), clip = $(p + "-clip"); if (!ice) return;
    var y0 = num(clip, "y0"), h0 = num(clip, "h0");
    if (mode === "drop") {
      tl.set(clip, { attr: { y: y0, height: h0 } }, t);
      tl.fromTo(ice, { y: -160 }, { y: 0, duration: dur, ease: "bounce.out", immediateRender: false }, t);
      fade(tl, ice, t, 1, dur * 0.3);
    } else {
      tl.fromTo(clip, { attr: { y: y0 + h0, height: 0 } }, { attr: { y: y0, height: h0 }, duration: dur, ease: "power1.inOut", immediateRender: false }, t);
      fade(tl, ice, t, 1, 0.05);
    }
  }
  function thaw(tl, p, t, dur) {
    var ice = $(p + "-ice"); if (!ice) return;
    dur = dur || 0.8;
    tl.to(ice, { y: 10, duration: dur, ease: "power1.in" }, t);
    fade(tl, ice, t, 0, dur);
  }

  // ================= roleBoard / keycard
  /** hang (on) or take off (on=false) card/key i on board p: drops onto its hook from above */
  function hang(tl, p, i, t, on, dur) {
    var el = $(p + "-card-" + i) || $(p + "-key-" + i); if (!el) return;
    dur = dur || 0.4;
    if (on === false) { ymove(tl, el, t, -50, dur, "power2.in"); fade(tl, el, t + dur * 0.4, 0, dur * 0.6); return; }
    tl.fromTo(el, { y: -50 }, { y: 0, duration: dur, ease: "back.out(1.6)", immediateRender: false }, t);
    last["y:" + el.id] = 0;
    fade(tl, el, t, 1, dur * 0.4);
  }

  var api = { tw: tw, fade: fade, fly: fly, moveUV: moveUV, led: led,
    press: press, setLid: setLid, lid: lid, guard: guard, swipe: swipe, rd: rd,
    setKey: setKey, keyIn: keyIn, keyTurn: keyTurn, keyOut: keyOut, cores: cores, ring: ring, gate: gate, coinIn: coinIn, coinOut: coinOut,
    setLevel: setLevel, fill: fill, freeze: freeze, thaw: thaw, hang: hang };
  window.KITX05 = api;
  // 合并进 window.KITX：通用助手（tw/fade/fly/moveUV/led）若别章已注册则不覆盖，避免两套"上次终值"记忆打架；
  // 多章物件库同时加载时按章号调用：KITX01 / KITX03 / KITX05
  var K = window.KITX || {}, generic = { tw: 1, fade: 1, fly: 1, moveUV: 1, led: 1 };
  Object.keys(api).forEach(function (k) { if (!(generic[k] && K[k])) K[k] = api[k]; });
  window.KITX = K;
})();
