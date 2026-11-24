/* ep01 kit-ext runtime — window.KITX, helpers for objects-ext.mjs.
 * Inline AFTER kit/runtime.js (iso.runtimeJs()), before the scene script.
 * Same rules as KIT: every helper schedules tweens on a paused GSAP timeline `tl` at time `t`;
 * all motion is a pure function of timeline time (seek-safe, no timers, no repeat:-1, no Math.random).
 * Helpers remember the last scheduled value per part, so calls on the same part chain in time order.
 */
(function () {
  if (window.KITX01) return;
  var D = Math.PI / 180;
  var CA = Math.cos(35 * D), SA = Math.sin(35 * D), SE = 0.5, CE = Math.cos(30 * D);
  var U = [CA, -SA * SE], V = [SA, CA * SE];
  var $ = function (id) { return document.getElementById(id); };
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null ? d : +v; };
  var r1 = function (n) { return Math.round(n * 100) / 100; };
  var last = {};
  var LEDC = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
  function tv(tl, key, t, to, dur, ease, apply) { // tween a scalar, chained from the last scheduled value
    var from = key in last ? last[key] : apply.initial();
    last[key] = to;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: to, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () { apply(o.a); } }, t);
  }
  function prog(tl, t, dur, ease, fn) { // generic 0→1 progress tween
    var o = { k: 0 };
    tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: ease || "none", immediateRender: false, onUpdate: function () { fn(o.k); } }, t);
  }

  // ---------- vending: maintenance side door (−u face, hinge at the back edge)
  function setSideDoor(p, deg) {
    var g = $(p + "-mdoor"); if (!g) return;
    var hx = num(g, "hx"), hy = num(g, "hy"), w = num(g, "w"), h = num(g, "h"), T = num(g, "t");
    var a = deg * D, du = -Math.sin(a), dv = Math.cos(a), nu = -Math.cos(a), nv = -Math.sin(a);
    var dS = [du * U[0] + dv * V[0], du * U[1] + dv * V[1]], nS = [nu * U[0] + nv * V[0], nu * U[1] + nv * V[1]];
    var F = [hx + w * dS[0], hy + w * dS[1]], I = [F[0] - T * nS[0], F[1] - T * nS[1]], Hn = [hx - T * nS[0], hy - T * nS[1]];
    var out = $(p + "-mdoor-out"), inn = $(p + "-mdoor-in"), edge = $(p + "-mdoor-edge"), top = $(p + "-mdoor-top");
    out.setAttribute("transform", "matrix(" + [dS[0], dS[1], 0, CE, hx, hy].map(r1).join(",") + ")");
    inn.setAttribute("transform", "matrix(" + [-dS[0], -dS[1], 0, CE, I[0], I[1]].map(r1).join(",") + ")");
    var showOut = nu * U[1] + nv * V[1] > 0;
    out.setAttribute("opacity", showOut ? 1 : 0); inn.setAttribute("opacity", showOut ? 0 : 1);
    var P = function (q) { return r1(q[0]) + "," + r1(q[1]); }, H = h * CE;
    edge.setAttribute("points", [P(F), P(I), P([I[0], I[1] + H]), P([F[0], F[1] + H])].join(" "));
    top.setAttribute("points", [P([hx, hy]), P(F), P(I), P(Hn)].join(" "));
    var vis = deg > 1.5 ? 1 : 0; edge.setAttribute("opacity", vis); top.setAttribute("opacity", vis);
  }
  function sideDoor(tl, p, t, deg, dur, ease) {
    var f = function (a) { setSideDoor(p, a); }; f.initial = function () { return num($(p + "-mdoor"), "a", 0); };
    tv(tl, "mdoor:" + p, t, deg, dur == null ? 1.0 : dur, ease, f);
  }

  // ---------- vending / miniVend: press a button (flash colour, then back)
  function press(tl, p, i, t, color, hold) {
    var id = p + "-btn-" + i, el = $(id); if (!el) return;
    var c = LEDC[color] || color || LEDC.green, base = el.getAttribute("data-base") || "#f4f5f6";
    tl.to("#" + id, { attr: { fill: c }, duration: 0.06, ease: "none" }, t);
    tl.to("#" + id + "-h", { attr: { fill: c }, opacity: 0.5, duration: 0.06, ease: "none" }, t);
    tl.to("#" + id, { attr: { fill: base }, duration: 0.25, ease: "none" }, t + (hold || 0.35));
    tl.to("#" + id + "-h", { opacity: 0, duration: 0.25, ease: "none" }, t + (hold || 0.35));
  }

  // ---------- vending: gears turn (meshing directions / ratios from data-ratio)
  function gears(tl, p, t, dur, turns) {
    for (var i = 0; i < 8; i++) {
      var id = p + "-gear-" + i, el = $(id); if (!el) break;
      var key = "gear:" + id, from = key in last ? last[key] : num(el, "a", 0), to = from + 360 * (turns == null ? 1 : turns) * num(el, "ratio", 1);
      last[key] = to;
      window.KIT.rot(tl, id, t, to, dur, "none");
    }
  }

  // ---------- vending: coins out of the tray (gold or red), deterministic arcs
  // o = { n:3, start:0, color:"gold"|"red", gap:0.14, dur:0.6, dist:1 }  (8 coins exist: ID-coin-0..7)
  function dispense(tl, p, t, o) {
    o = o || {};
    var root = $(p + "-coins"); if (!root) return;
    var fu = root.getAttribute("data-fu").split(",").map(Number), fv = root.getAttribute("data-fv").split(",").map(Number), fz = root.getAttribute("data-fz").split(",").map(Number);
    var n = o.n || 3, s0 = o.start || 0, gap = o.gap == null ? 0.14 : o.gap, dur = o.dur || 0.6, dist = o.dist || 1, red = o.color === "red";
    for (var j = 0; j < n; j++) {
      (function (i, tt) {
        var id = p + "-coin-" + i; if (!$(id)) return;
        var du = (((i * 37) % 5) - 2) * 12, dv = (46 + (i % 3) * 20) * dist, dz = -16;
        tl.set("#" + id + "-g", { opacity: red ? 0 : 1 }, tt);
        tl.set("#" + id + "-r", { opacity: red ? 1 : 0 }, tt);
        prog(tl, tt, dur, "none", function (k) {
          var z = dz * k + 34 * k * (1 - k), uu = du * k, vv = dv * (1 - (1 - k) * (1 - k));
          var x = uu * fu[0] + vv * fv[0] + z * fz[0], y = uu * fu[1] + vv * fv[1] + z * fz[1];
          var el = $(id); el.setAttribute("transform", "translate(" + r1(x) + "," + r1(y) + ")"); el.setAttribute("opacity", k > 0 ? 1 : 0);
        });
      })(s0 + j, t + j * gap);
    }
  }

  // ---------- move any element whose root has data-px/py (letter) or data-ox/oy through world-canvas points
  function walk(tl, id, t, dur, ptsArr, ease) {
    var el = $(id); if (!el) return;
    var px = num(el, "px", num(el, "ox", 0)), py = num(el, "py", num(el, "oy", 0));
    var key = "walk:" + id, start = key in last ? last[key] : [px, py];
    var P = [start].concat(ptsArr), L = [0];
    for (var i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    last[key] = P[P.length - 1];
    var tot = L[L.length - 1] || 1;
    prog(tl, t, dur, ease || "power1.inOut", function (k) {
      var d = k * tot, j = 1; while (j < P.length - 1 && L[j] < d) j++;
      var seg = (L[j] - L[j - 1]) || 1, q = (d - L[j - 1]) / seg;
      var x = P[j - 1][0] + (P[j][0] - P[j - 1][0]) * q, y = P[j - 1][1] + (P[j][1] - P[j - 1][1]) * q;
      el.setAttribute("transform", "translate(" + r1(x - px) + "," + r1(y - py) + ")");
    });
  }

  // ---------- dashed strokes (conveyor belt, pipe flow, river ripples): advance stroke-dashoffset by delta
  function dash(tl, ids, t, dur, delta) {
    ids = [].concat(ids);
    var key = "dash:" + ids.join("|"), from = key in last ? last[key] : 0;
    last[key] = from - delta;
    var o = { a: from };
    tl.fromTo(o, { a: from }, { a: from - delta, duration: dur, ease: "none", immediateRender: false, onUpdate: function () {
      ids.forEach(function (id) { var el = $(id); if (el) el.setAttribute("stroke-dashoffset", r1(o.a)); });
    } }, t);
  }

  // ---------- sorter arm: absolute pose (deg) or IK reach (du along +u from the shoulder, dz downward)
  function armPose(tl, p, t, a1, a2, dur) { window.KIT.rot(tl, p + "-sh", t, a1, dur == null ? 0.6 : dur); window.KIT.rot(tl, p + "-el", t, a2, dur == null ? 0.6 : dur); }
  function ik(p, du, dz) {
    var sh = $(p + "-sh"), L1 = num(sh, "l1", 72), L2 = num(sh, "l2", 88);
    var d = Math.min(L1 + L2 - 0.5, Math.max(Math.abs(L1 - L2) + 1, Math.hypot(du, dz)));
    var phi = Math.atan2(-du, dz);
    var c2 = (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), a2 = Math.acos(Math.max(-1, Math.min(1, c2)));
    var a1 = phi - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    return [a1 / D, a2 / D];
  }
  function reach(tl, p, t, du, dz, dur) { var a = ik(p, du, dz); armPose(tl, p, t, a[0], a[1], dur); }

  // ---------- firewall flap gate
  function setGate(p, s) {
    [0, 1].forEach(function (i) { var el = $(p + "-flap-" + i); if (!el) return; var px = num(el, "px", 0);
      el.setAttribute("transform", "translate(" + px + " 0) scale(" + r1(s) + " 1) translate(" + -px + " 0)"); });
  }
  function gate(tl, p, t, open, dur) {
    var f = function (s) { setGate(p, s); }; f.initial = function () { var el = $(p + "-flap-0"); var m = /scale\(([\d.]+)/.exec(el.getAttribute("transform")); return m ? +m[1] : 1; };
    tv(tl, "gate:" + p, t, open ? 0.08 : 1, dur == null ? 0.4 : dur, "power2.inOut", f);
  }

  // ---------- flash-loan counter: gold pile in / out (layer by layer)
  function pileIn(tl, p, t, dur) {
    dur = dur || 0.5; var step = dur / 4;
    for (var i = 0; i < 4; i++) tl.fromTo("#" + p + "-pile-" + i, { opacity: 0, y: -36 }, { opacity: 1, y: 0, duration: step * 1.4, ease: "power2.out", immediateRender: false }, t + i * step);
  }
  function pileOut(tl, p, t, dur) {
    dur = dur || 0.5; var step = dur / 4;
    for (var i = 3; i >= 0; i--) tl.to("#" + p + "-pile-" + i, { opacity: 0, y: -30, duration: step * 1.4, ease: "power2.in" }, t + (3 - i) * step);
  }
  function flash(tl, p, t, hold) { pileIn(tl, p, t, 0.45); pileOut(tl, p, t + 0.45 + (hold == null ? 1.2 : hold), 0.45); }

  // ---------- balance: tilt (deg > 0 ⇒ left pan down), pans follow the beam ends
  function setTilt(p, deg) {
    var b = $(p + "-beam"); if (!b) return;
    window.KIT.setRot(p + "-beam", -deg);
    var m = b.getAttribute("data-m").split(",").map(Number), L = num(b, "l", 120), a = -deg * D;
    [[-1, "-panL"], [1, "-panR"]].forEach(function (q) {
      var sg = q[0], ex = sg * L * Math.cos(a) - sg * L, ey = sg * L * Math.sin(a);
      var el = $(p + q[1]); if (el) el.setAttribute("transform", "translate(" + r1(ex * m[0] + ey * m[2]) + "," + r1(ex * m[1] + ey * m[3]) + ")");
    });
  }
  function tilt(tl, p, t, deg, dur, ease) {
    var f = function (a) { setTilt(p, a); }; f.initial = function () { return num($(p + "-beam"), "tilt", 0); };
    tv(tl, "tilt:" + p, t, deg, dur == null ? 0.9 : dur, ease || "back.out(1.6)", f);
  }

  // ---------- oracle needle (miniVend kind:"oracle")
  function needle(tl, p, t, deg, dur, ease) { window.KIT.rot(tl, p + "-needle", t, deg, dur == null ? 0.5 : dur, ease); }

  // ---------- time lock: remaining fraction → arc + hand; unlock lifts the shackle
  function setTimer(p, frac) {
    var arc = $(p + "-arc"); if (!arc) return;
    var Cc = num(arc, "c", 150); arc.setAttribute("stroke-dashoffset", r1(-Cc * (1 - frac)));
    window.KIT.setRot(p + "-hand", (1 - frac) * 360);
  }
  function countdown(tl, p, t, dur, toFrac) {
    var f = function (a) { setTimer(p, a); }; f.initial = function () { return num($(p + "-arc"), "frac", 1); };
    tv(tl, "timer:" + p, t, toFrac == null ? 0 : toFrac, dur, "none", f);
  }
  function unlock(tl, p, t, open, dur) {
    var sh = $(p + "-shackle"), L = num(sh, "lift", 22);
    var f = function (k) { sh.setAttribute("transform", "translate(0," + r1(-k * L) + ")"); };
    f.initial = function () { var m = /translate\(0,([-\d.]+)/.exec(sh.getAttribute("transform")); return m ? -m[1] / L : 0; };
    tv(tl, "shackle:" + p, t, open === false ? 0 : 1, dur == null ? 0.35 : dur, "back.out(2)", f);
    window.KIT.led(tl, p + "-led", t, open === false ? "red" : "green");
  }

  var api = { setSideDoor: setSideDoor, sideDoor: sideDoor, press: press, gears: gears, dispense: dispense, walk: walk, dash: dash,
    armPose: armPose, reach: reach, ik: ik, setGate: setGate, gate: gate, pileIn: pileIn, pileOut: pileOut, flash: flash,
    setTilt: setTilt, tilt: tilt, needle: needle, setTimer: setTimer, countdown: countdown, unlock: unlock };
  window.KITX01 = api;
  window.KITX = Object.assign(window.KITX || {}, api);  // 多章物件库同时加载时按章号区分：KITX01 / KITX03
})();
