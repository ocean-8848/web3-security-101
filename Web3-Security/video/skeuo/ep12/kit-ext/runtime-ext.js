/* ep12 kit-ext runtime — browser helpers for objects built with ep12/kit-ext/objects-ext.mjs (merkleTree).
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX12. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX12.xxx when several chapter libraries are loaded — e.g. KITX.path / KITX.leaf may belong to another chapter).
 * Every helper takes (tl, id, t, …) and schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure
 * function of timeline time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times:
 * call in time order — each call starts from the previous call's end value.
 * Parts whose attributes are rewritten here (do NOT also tween them with GSAP x/y/rotation/scale):
 *   merkleTree ID-leaf (transform), ID-path-t / ID-path-r (stroke-dashoffset).
 */
(function () {
  if (window.KITX12) return;
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

  // =================================================================== merkleTree
  /** root plate text; tone "red" = red text, "green" = green text, otherwise ink */
  function rootText(tl, p, t, text, tone) {
    var el = $(p + "-root-t"); if (!el) return;
    var col = tone === "red" ? "#e0453a" : tone === "green" ? "#1f9d55" : "#1c1c1c";
    var mono = /^[\x00-\x7f]*$/.test(String(text));
    step(tl, "rt:" + p, t, { text: String(text), fill: col, mono: mono },
      function () { return { text: el.textContent, fill: el.getAttribute("fill"), mono: /Mono/.test(el.getAttribute("font-family") || "") }; },
      function (s) { el.textContent = s.text; el.setAttribute("fill", s.fill); el.setAttribute("font-family", s.mono ? "JetBrains Mono, monospace" : "Noto Sans SC, sans-serif"); });
  }
  /** root plate badge: "ok" = green check, "bad" = red dashed frame + red X, "normal" = neither */
  function rootState(tl, p, t, state, dur) {
    dur = dur == null ? 0.25 : dur;
    op(tl, p + "-root-ok", t, state === "ok" ? 1 : 0, dur);
    op(tl, p + "-root-bad", t, state === "bad" ? 1 : 0, dur);
  }
  /** proof path: draw on (on=true, from the leaf up to the root) / wipe off; returns end time */
  function path(tl, p, t, on, dur) {
    var g = $(p + "-path"); if (!g) return t;
    on = on !== false; dur = dur == null ? 0.8 : dur;
    var L = num(g, "len", 300);
    tw(tl, "path:" + p, t, on ? 0 : L, dur, "power2.inOut", function (a) {
      var v = r2(a); $(p + "-path-t").setAttribute("stroke-dashoffset", v); $(p + "-path-r").setAttribute("stroke-dashoffset", v);
    }, function () { return num(g, "on", 0) ? 0 : L; });
    return t + dur;
  }
  /** proof path colour: "red" or "teal" */
  function pathTone(tl, p, t, tone, dur) {
    dur = dur == null ? 0.25 : dur;
    op(tl, p + "-path-r", t, tone === "red" ? 1 : 0, dur);
    op(tl, p + "-path-t", t, tone === "red" ? 0 : 1, dur);
  }
  /** flip ID-leaf over (around its vertical centre line) to the red face (red=true) or back; returns end time */
  function leaf(tl, p, t, red, dur) {
    var g = $(p + "-leaf"); if (!g) return t;
    red = red !== false; dur = dur == null ? 0.5 : dur;
    var cx = num(g, "cx", 0), n = $(p + "-leaf-n"), r = $(p + "-leaf-r");
    // a: 0 = normal face, 1 = red face; scaleX = |cos(πa)|, face switches at a = 0.5
    tw(tl, "leaf:" + p, t, red ? 1 : 0, dur, "power1.inOut", function (a) {
      var sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * a)));
      g.setAttribute("transform", "translate(" + r2(cx) + " 0) scale(" + r2(sx) + " 1) translate(" + r2(-cx) + " 0)");
      n.setAttribute("opacity", a < 0.5 ? 1 : 0); r.setAttribute("opacity", a < 0.5 ? 0 : 1);
    }, function () { return num(g, "red", 0); });
    return t + dur;
  }

  var api = { rootText: rootText, rootState: rootState, path: path, pathTone: pathTone, leaf: leaf };
  window.KITX12 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX12.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
