/* ep13 kit-ext runtime — browser helpers for objects built with ep13/kit-ext/objects-ext.mjs (passport, container).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX13. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX13.xxx when several chapter libraries are loaded — e.g. KITX.check / KITX.seal may belong to another chapter).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose transform is rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   passport ID-cover;  container ID-door.
 */
(function () {
  if (window.KITX13) return;
  var $ = function (id) { return document.getElementById(id); };
  var last = {};
  var num = function (el, k, d) { var v = el && el.getAttribute("data-" + k); return v == null || v === "" ? d : +v; };
  var r4 = function (n) { return Math.round(n * 10000) / 10000; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var D = Math.PI / 180, U = [Math.cos(35 * D), -Math.sin(35 * D) * 0.5], V = [Math.sin(35 * D), Math.cos(35 * D) * 0.5], CE = Math.cos(30 * D);

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
  /** vertical panel hinged at (hx, hy): local x along cos(a)·d0 + sin(a)·d1 */
  function swing(el, a, d0, d1) {
    var c = Math.cos(a * D), s = Math.sin(a * D), hx = num(el, "hx", 0), hy = num(el, "hy", 0);
    el.setAttribute("transform", "matrix(" + r4(c * d0[0] + s * d1[0]) + "," + r4(c * d0[1] + s * d1[1]) + ",0," + r4(CE) + "," + r2(hx) + "," + r2(hy) + ")");
  }

  // =================================================================== passport
  /** cover swings open toward the viewer (open=true) / closes; returns end time. ID-cover */
  function cover(tl, p, t, open, dur) {
    var el = $(p + "-cover"); if (!el) return t;
    open = open !== false; dur = dur == null ? 0.6 : dur;
    var fr = $(p + "-cover-front"), ins = $(p + "-cover-inside");
    tw(tl, "cv:" + p, t, open ? num(el, "open", 155) : 0, dur, "power2.inOut", function (a) {
      swing(el, a, U, V);
      var front = a < 125; fr.setAttribute("opacity", front ? 1 : 0); ins.setAttribute("opacity", front ? 0 : 1);
    }, function () { return num(el, "a", 0); });
    return t + dur;
  }
  /** check box i (0–2): mark "ok" = green check, "bad" = red X, "" / "none" = empty */
  function check(tl, p, t, i, mark, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-check-" + i + "-ok", t, mark === "ok" ? 1 : 0, dur);
    op(tl, p + "-check-" + i + "-bad", t, mark === "bad" ? 1 : 0, dur);
  }
  /** red "伪造" stamp on the cover shows (on=true) / hides */
  function fake(tl, p, t, on, dur) { op(tl, p + "-fake", t, on === false ? 0 : 1, dur == null ? 0.25 : dur, "back.out(1.4)"); }
  /** cover title text */
  function title(tl, p, t, text) {
    var el = $(p + "-title"); if (!el) return;
    var mono = /^[\x00-\x7f]*$/.test(String(text));
    step(tl, "ti:" + p, t, { text: String(text), mono: mono },
      function () { return { text: el.textContent, mono: /Mono/.test(el.getAttribute("font-family") || "") }; },
      function (s) { el.textContent = s.text; el.setAttribute("font-family", s.mono ? "JetBrains Mono, monospace" : "Noto Sans SC, sans-serif"); });
  }

  // =================================================================== container
  /** front door swings out toward −u (open=true) / closes; open = an angle in degrees for a crack (e.g. 35); returns end time. ID-door */
  function door(tl, p, t, open, dur) {
    var el = $(p + "-door"); if (!el) return t;
    dur = dur == null ? 0.6 : dur;
    var to = open === false ? 0 : typeof open === "number" ? open : num(el, "open", 105);
    var d0 = [-V[0], -V[1]], d1 = [-U[0], -U[1]];
    tw(tl, "dr:" + p, t, to, dur, "power2.inOut", function (a) { swing(el, a, d0, d1); }, function () { return num(el, "a", 0); });
    return t + dur;
  }
  /** seal tag colour: "green" / "red" */
  function seal(tl, p, t, color, dur) {
    dur = dur == null ? 0.2 : dur;
    op(tl, p + "-seal-r", t, color === "red" ? 1 : 0, dur);
    op(tl, p + "-seal-g", t, color === "red" ? 0 : 1, dur);
  }
  /** cargo silhouettes behind the door: on = visible; red = true red cards, false normal, undefined keep */
  function inside(tl, p, t, on, red, dur) {
    dur = dur == null ? 0.3 : dur;
    op(tl, p + "-inside", t, on === false ? 0 : 1, dur);
    if (red != null) { op(tl, p + "-inside-r", t, red ? 1 : 0, dur); op(tl, p + "-inside-n", t, red ? 0 : 1, dur); }
  }

  var api = { cover: cover, check: check, fake: fake, title: title, door: door, seal: seal, inside: inside };
  window.KITX13 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX13.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
