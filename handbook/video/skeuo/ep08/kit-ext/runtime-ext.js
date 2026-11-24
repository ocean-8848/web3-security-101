/* ep08 kit-ext runtime — browser helpers for objects built with ep08/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX08. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX08.xxx when several chapter libraries are loaded).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   ammPool ID-needle / -needle-t1 / -needle-t2 / -lvlL-cap / -lvlR-cap / -dropL/R / -outL/R;
 *   twapRecorder ID-paper / -paper-ink / -pen / -knob;  liqBot ID-beam / -claw-l / -claw-r.
 */
(function () {
  if (window.KITX08) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var LEDC = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };

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
  function rotTo(tl, id, t, deg, dur, ease) {
    var el = $(id); if (!el) return;
    tw(tl, "rot:" + id, t, deg, dur, ease, function (a) { setRot(id, a); }, function () { return num(el, "a", 0); });
  }
  function rotNow(id) { var el = $(id); return "rot:" + id in last ? last["rot:" + id] : num(el, "a", 0); }
  function blink(tl, el, t, n, period, end) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, from = key in last ? last[key] : +(el.getAttribute("opacity") || 0);
    last[key] = end;
    prog(tl, t, n * period, "none", function (k) {
      var v = k >= 1 ? end : (Math.sin(Math.PI * k * n * 2 - Math.PI / 2) + 1) / 2;
      gsap.set(el, { opacity: k <= 0 ? from : r2(v) });
    });
  }
  /** one-shot moving token: shows at t, travels by its data-dx/dy over dur (with optional arc), hides at the end */
  function shoot(tl, el, t, dur, ease, arc) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var dx = num(el, "dx", 0), dy = num(el, "dy", 0);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "none", immediateRender: false }, t);
    prog(tl, t, dur, ease || "power2.in", function (k) {
      el.setAttribute("transform", "translate(" + r2(dx * k) + " " + r2(dy * k - (arc || 0) * Math.sin(Math.PI * k)) + ")");
    });
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "none", immediateRender: false }, t + dur);
  }
  /** text switch (content / fill / size) on a <text>, optional extra(el,st) */
  function textSwap(tl, key, t, el, st, extra) {
    if (!el) return;
    step(tl, key, t, st,
      function () { return { text: el.textContent, fill: el.getAttribute("fill"), size: el.getAttribute("font-size"), red: el.getAttribute("data-red") === "1" }; },
      function (s) { el.textContent = s.text; el.setAttribute("fill", s.fill); if (s.size) el.setAttribute("font-size", s.size); if (extra) extra(s); });
  }

  // ---------- ammPool
  function setLevel(p, side, v) {
    var g = $(p + "-lvl" + side), c = $(p + "-lvl" + side + "-c"), cap = $(p + "-lvl" + side + "-cap"); if (!g) return;
    var y0 = num(g, "y0", 0), hs = num(g, "hs", 100), y = y0 - v * hs;
    c.setAttribute("y", r2(y)); c.setAttribute("height", r2(y0 - y + 200));
    cap.setAttribute("transform", "translate(0 " + r2(-v * hs) + ")");
  }
  /** coin pile heights (0–1); pass null to leave a side unchanged */
  function poolLevel(tl, p, t, L, R, dur) {
    [["L", L], ["R", R]].forEach(function (q) {
      if (q[1] == null) return;
      var g = $(p + "-lvl" + q[0]); if (!g) return;
      tw(tl, "lv:" + p + q[0], t, q[1], dur == null ? 0.6 : dur, "power2.inOut", function (v) { setLevel(p, q[0], v); }, function () { return num(g, "lvl", 0.5); });
    });
  }
  /** spot-price needle → deg (0° = straight up, ±70°). The red after-images lag behind the motion. */
  function poolNeedle(tl, p, t, deg, dur) {
    dur = dur == null ? 0.6 : dur;
    var from = rotNow(p + "-needle"), d = deg - from;
    rotTo(tl, p + "-needle", t, deg, dur, "power2.inOut");
    rotTo(tl, p + "-needle-t2", t + 0.03, deg - d * 0.2, dur, "power2.inOut");
    rotTo(tl, p + "-needle-t1", t + 0.06, deg - d * 0.4, dur, "power2.inOut");
  }
  /** needle red + after-images on / off */
  function poolRed(tl, p, t, on, dur) {
    dur = dur == null ? 0.25 : dur;
    op(tl, p + "-needle-r", t, on === false ? 0 : 1, dur);
    op(tl, p + "-needle-t1", t, on === false ? 0 : 0.22, dur);
    op(tl, p + "-needle-t2", t, on === false ? 0 : 0.42, dur);
  }
  /** readout window text; red=true shows red digits */
  function poolRead(tl, p, t, text, red) {
    var el = $(p + "-readout"); if (!el) return;
    textSwap(tl, "rd:" + p, t, el, { text: String(text), fill: red ? "#ff6a5d" : "#9ad9ee" });
  }
  /** hopper ring flashes n times (side "L" | "R") */
  function hop(tl, p, t, side, n) { blink(tl, p + "-hop" + side, t, n || 2, 0.26, 0); }
  /** one swap: a coin drops into hopper `side`, a coin of the other tank slides out of its spout. Returns end time. */
  function poolSwap(tl, p, t, side, dur) {
    dur = dur == null ? 0.8 : dur;
    var other = side === "L" ? "R" : "L";
    hop(tl, p, t, side, 1);
    shoot(tl, p + "-drop" + side, t, dur * 0.42, "power2.in");
    shoot(tl, p + "-out" + other, t + dur * 0.38, dur * 0.55, "power1.in", 10);
    return t + dur;
  }
  /** attacker push: n swaps into `side` (default "R" = dump USDC, pull ETH), levels move, needle swings red. Returns end time.
   *  o: { side="R", n=3, L=0.15, R=0.95, deg=62, read="6,000", gap=0.5 } */
  function poolPump(tl, p, t, o) {
    o = o || {};
    var side = o.side || "R", n = o.n == null ? 3 : o.n, gap = o.gap == null ? 0.5 : o.gap;
    var lv = { L: o.L == null ? 0.15 : o.L, R: o.R == null ? 0.95 : o.R };
    for (var i = 0; i < n; i++) poolSwap(tl, p, t + i * gap, side, 0.75);
    var span = Math.max(0.6, n * gap + 0.2);
    poolLevel(tl, p, t + 0.25, lv.L, lv.R, span);
    poolRed(tl, p, t + 0.3, true, 0.3);
    poolNeedle(tl, p, t + 0.25, o.deg == null ? 62 : o.deg, span);
    if (o.read !== null) poolRead(tl, p, t + 0.25 + span, o.read == null ? "6,000" : o.read, true);
    return t + 0.25 + span;
  }

  // ---------- twapRecorder (paper offset + pen kick share one redraw)
  var TW = {};
  function twState(p) {
    if (TW[p]) return TW[p];
    var d = $(p + "-wdata"), pen = $(p + "-pen");
    var ys = d ? d.getAttribute("data-ys").split(",").map(Number) : [0];
    return (TW[p] = { ys: ys, off: num(d, "off", 0), kick: 0, penX: num(pen, "x", 100) });
  }
  function twYAt(S, X) { var i = Math.max(0, Math.min(S.ys.length - 2, Math.floor(X / 3))), q = X / 3 - i; return S.ys[i] + (S.ys[i + 1] - S.ys[i]) * q; }
  function twDraw(p) {
    var S = twState(p), tr = "translate(" + r2(-S.off) + " 0)";
    var a = $(p + "-paper"), b = $(p + "-paper-ink"), pen = $(p + "-pen");
    if (a) a.setAttribute("transform", tr); if (b) b.setAttribute("transform", tr);
    if (pen) pen.setAttribute("transform", "translate(0 " + r2(twYAt(S, S.penX + S.off) - S.kick) + ")");
  }
  /** paper runs right→left by `dist` paper units (constant speed); the pen tip follows the recorded curve (max total ≈ 800) */
  function paper(tl, p, t, dist, dur) {
    var S = twState(p), key = "off:" + p, from = key in last ? last[key] : S.off;
    tw(tl, key, t, from + dist, dur == null ? 2 : dur, "none", function (v) { S.off = v; twDraw(p); }, function () { return S.off; });
  }
  /** pen jumps up by h (paper units) and comes back */
  function penKick(tl, p, t, h, dur) {
    var S = twState(p); h = h == null ? 24 : h;
    prog(tl, t, dur == null ? 0.5 : dur, "none", function (k) { S.kick = k >= 1 || k <= 0 ? 0 : h * Math.sin(Math.PI * k); twDraw(p); });
  }
  function spike(tl, p, t, on, dur) { op(tl, p + "-spike", t, on === false ? 0 : 1, dur == null ? 0.3 : dur); }
  /** averaging window width (paper units; right edge stays at the pen). The side knob turns with it. */
  function winTo(tl, p, t, w, dur) {
    var g = $(p + "-win"), r = $(p + "-win-r"), h = $(p + "-win-h"); if (!g) return;
    var pen = num(g, "pen", 120), max = num(g, "max", pen - 4);
    w = Math.max(6, Math.min(max, w));
    tw(tl, "win:" + p, t, w, dur == null ? 0.6 : dur, "power2.inOut", function (v) {
      r.setAttribute("x", r2(pen - v)); r.setAttribute("width", r2(v)); h.setAttribute("x", r2(pen - v - 2.5));
      setRot(p + "-knob", -135 + (270 * v) / max);
    }, function () { return num(g, "w", 56); });
  }
  /** average readout text; red=true → red digits + red bezel */
  function avg(tl, p, t, text, red) {
    var el = $(p + "-avg"), bg = $(p + "-avg-bg"); if (!el) return;
    textSwap(tl, "avg:" + p, t, el, { text: String(text), fill: red ? "#ff6a5d" : "#9ad9ee", red: !!red }, function (s) {
      if (!bg) return; bg.setAttribute("stroke", s.red ? "#e0453a" : "#141518"); bg.setAttribute("stroke-width", s.red ? 2.4 : 1.2);
    });
  }
  /** red staircase line wipes in left→right (on) or out (off) */
  function trail(tl, p, t, on, dur) {
    var g = $(p + "-trail"), c = $(p + "-trail-c"); if (!g || !c) return;
    var pw = num(g, "pw", 172);
    tw(tl, "tr:" + p, t, on === false ? 0 : pw, dur == null ? 1.2 : dur, "power1.inOut", function (v) { c.setAttribute("width", r2(v)); }, function () { return +c.getAttribute("width"); });
  }

  // ---------- marketStall
  /** chalk price: wiped, then rewritten; red=true → bigger red numbers */
  function stallPrice(tl, p, t, text, red) {
    var el = $(p + "-board-v"); if (!el) return;
    op(tl, el, t, 0, 0.15);
    textSwap(tl, "pr:" + p, t + 0.16, el, { text: String(text), fill: red ? "#ff6a5d" : "#f4f2ea", size: red ? "19" : "16", red: !!red }, function (s) {
      el.setAttribute("y", s.red ? 36 : 34); el.setAttribute("data-red", s.red ? "1" : "0");
    });
    op(tl, el, t + 0.2, 1, 0.3);
  }
  /** gold bars on the counter → n (0–9); bars leave / return one by one over dur */
  function goldTo(tl, p, t, n, dur) {
    var g = $(p + "-gold"); if (!g) return;
    var key = "gd:" + p, from = key in last ? last[key] : num(g, "n", 9);
    last[key] = n; if (n === from) return;
    dur = dur == null ? 0.6 : dur;
    var steps = Math.abs(n - from), dt = steps > 1 ? dur / steps : 0;
    for (var j = 0; j < steps; j++) {
      var i = n > from ? from + j : from - 1 - j;
      op(tl, p + "-gold-" + i, t + j * dt, n > from ? 1 : 0, 0.1);
    }
  }
  /** lamp on/off; n>0 flickers n times first */
  function stallLamp(tl, p, t, on, n) {
    if (n) blink(tl, p + "-lamp", t, n, 0.18, on === false ? 0 : 1);
    else op(tl, p + "-lamp", t, on === false ? 0 : 1, 0.2);
  }

  // ---------- liqBot
  /** beacon: lights up, beam sweeps `turns` times over dur, halo pulses; keepOn=false switches off at the end */
  function botLamp(tl, p, t, dur, turns, keepOn) {
    dur = dur == null ? 1.6 : dur; turns = turns == null ? 2 : turns;
    var c = $(p + "-lamp-c");
    if (c) step(tl, "lc:" + p, t, LEDC.blue, function () { return c.getAttribute("fill"); }, function (v) { c.setAttribute("fill", v); });
    op(tl, p + "-beam", t, 1, 0.1);
    var from = rotNow(p + "-beam");
    rotTo(tl, p + "-beam", t, from + 360 * turns, dur, "none");
    blink(tl, p + "-lamp", t, Math.max(1, Math.round(turns * 2)), dur / Math.max(1, Math.round(turns * 2)), keepOn === false ? 0 : 1);
    if (keepOn === false) {
      op(tl, p + "-beam", t + dur, 0, 0.1);
      if (c) step(tl, "lc:" + p, t + dur, "#8fb7c4", function () { return c.getAttribute("fill"); }, function (v) { c.setAttribute("fill", v); });
    }
  }
  /** claw fingers open (true) / close (false) */
  function claw(tl, p, t, open, dur) {
    ["l", "r"].forEach(function (s) {
      var id = p + "-claw-" + s, el = $(id); if (!el) return;
      rotTo(tl, id, t, open ? num(el, "open", 22) : 0, dur == null ? 0.25 : dur, open ? "power2.out" : "power3.in");
    });
  }
  /** open then snap shut (grab collateral). Returns end time. */
  function grab(tl, p, t) { claw(tl, p, t, true, 0.22); claw(tl, p, t + 0.36, false, 0.14); return t + 0.55; }
  /** screen text; red=true → red digits */
  function botScr(tl, p, t, text, red) {
    var el = $(p + "-scr"); if (!el) return;
    textSwap(tl, "bs:" + p, t, el, { text: String(text), fill: red ? "#ff6a5d" : "#9ad9ee" });
  }

  var api = {
    poolLevel: poolLevel, poolNeedle: poolNeedle, poolRed: poolRed, poolRead: poolRead, hop: hop, poolSwap: poolSwap, poolPump: poolPump,
    paper: paper, penKick: penKick, spike: spike, winTo: winTo, avg: avg, trail: trail,
    stallPrice: stallPrice, goldTo: goldTo, stallLamp: stallLamp,
    botLamp: botLamp, claw: claw, grab: grab, botScr: botScr,
  };
  window.KITX08 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX08.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
