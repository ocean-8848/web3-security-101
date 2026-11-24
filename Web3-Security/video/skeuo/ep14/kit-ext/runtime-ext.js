/* ep14 kit-ext runtime — browser helpers for objects built with ep14/kit-ext/objects-ext.mjs (answerSheet, gradingMachine).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX14. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX14.xxx when several chapter libraries are loaded — e.g. KITX.lamp / KITX.card may belong to another chapter).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose attributes are rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   gradingMachine ID-card (transform), ID-scr-t (text / fill).
 */
(function () {
  if (window.KITX14) return;
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

  // =================================================================== answerSheet
  /** normal fills appear row by row (use with opts.blank = true); rows = how many rows (default all); returns end time */
  function sheetFill(tl, p, t, rows, gap, dur) {
    var g = $(p + "-fill"); if (!g) return t;
    var n = rows == null ? num(g, "n", 5) : rows; gap = gap == null ? 0.22 : gap; dur = dur == null ? 0.18 : dur;
    for (var i = 0; i < n; i++) op(tl, p + "-fill-" + i, t + i * gap, 1, dur);
    return t + (n - 1) * gap + dur;
  }
  /** hide / show one row's normal fill (on=false hides) */
  function sheetRow(tl, p, t, row, on, dur) { op(tl, p + "-fill-" + row, t, on === false ? 0 : 1, dur == null ? 0.18 : dur); }
  /** last row's extra red fills: appear one by one (on=true) / all vanish; returns end time */
  function sheetExtra(tl, p, t, on, gap, dur) {
    var g = $(p + "-extra"); if (!g) return t;
    on = on !== false; gap = gap == null ? 0.15 : gap; dur = dur == null ? 0.15 : dur;
    var n = num(g, "n", 3);
    for (var i = 0; i < n; i++) op(tl, p + "-extra-" + i, on ? t + i * gap : t, on ? 1 : 0, dur);
    if (!on) return t + dur;
    return t + (n - 1) * gap + dur;
  }
  /** top-right grading stamp: "ok" green check, "bad" red X, "none" */
  function sheetMark(tl, p, t, state, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-mark-ok", t, state === "ok" ? 1 : 0, dur);
    op(tl, p + "-mark-bad", t, state === "bad" ? 1 : 0, dur);
  }
  /** broken frame on the card (on=false hides) */
  function sheetBad(tl, p, t, on, dur) { op(tl, p + "-bad", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }

  // =================================================================== gradingMachine
  /** card in the slot: up=true raises it (visible), up=false sinks it into the machine (read in); returns end time */
  function card(tl, p, t, up, dur) {
    var g = $(p + "-card"); if (!g) return t;
    up = up !== false; dur = dur == null ? 0.5 : dur;
    var D = num(g, "d", 34);
    tw(tl, "card:" + p, t, up ? 0 : D, dur, up ? "power2.out" : "power2.in", function (a) {
      g.setAttribute("transform", "translate(0 " + r2(a) + ")");
    }, function () { return num(g, "up", 0) ? 0 : D; });
    return t + dur;
  }
  /** decision lamp: "green" / "red" / "off" */
  function lamp(tl, p, t, tone, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-lamp-g", t, tone === "green" ? 1 : 0, dur);
    op(tl, p + "-lamp-r", t, tone === "red" ? 1 : 0, dur);
  }
  /** display text; tone "red" = red text, "white", otherwise green */
  function scr(tl, p, t, text, tone) {
    var el = $(p + "-scr-t"); if (!el) return;
    var col = tone === "red" ? "#ff8a80" : tone === "white" ? "#ffffff" : "#7fe0a6";
    var s = String(text == null ? "" : text);
    var sz = s.length > 6 ? 10 : s.length > 4 ? 12 : 14;
    step(tl, "scr:" + p, t, { text: s, fill: col, size: sz },
      function () { return { text: el.textContent, fill: el.getAttribute("fill"), size: +el.getAttribute("font-size") }; },
      function (q) { el.textContent = q.text; el.setAttribute("fill", q.fill); el.setAttribute("font-size", q.size); });
  }
  /** red dashed ring around the machine (attacker look) */
  function ring(tl, p, t, on, dur) { op(tl, p + "-ring", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** broken frame on the front panel */
  function machineBad(tl, p, t, on, dur) { op(tl, p + "-bad", t, on === false ? 0 : 1, dur == null ? 0.25 : dur); }
  /** one grading: card sinks in, then lamp + screen text (tone "green" → "通过", "red" → "不通过" unless text given); returns end time */
  function grade(tl, p, t, tone, text, dur) {
    tone = tone || "green"; dur = dur == null ? 0.5 : dur;
    var t1 = card(tl, p, t, false, dur);
    lamp(tl, p, t1, tone);
    scr(tl, p, t1, text != null ? text : tone === "red" ? "不通过" : "通过", tone === "red" ? "red" : "green");
    return t1 + 0.2;
  }

  var api = { sheetFill: sheetFill, sheetRow: sheetRow, sheetExtra: sheetExtra, sheetMark: sheetMark, sheetBad: sheetBad,
    card: card, lamp: lamp, scr: scr, ring: ring, machineBad: machineBad, grade: grade };
  window.KITX14 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX14.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
