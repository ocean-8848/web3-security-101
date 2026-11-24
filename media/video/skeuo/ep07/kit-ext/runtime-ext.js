/* ep07 kit-ext runtime — browser helpers for objects built with ep07/kit-ext/objects-ext.mjs.
 * Inline after kit's runtimeJs() (and after other chapters' runtime-ext if any):  ${runtimeJs()}\n${runtimeExtJs()}
 * API: window.KITX07. Also merged into window.KITX WITHOUT overwriting any name another chapter already put there
 * (so always call KITX07.xxx when several chapter libraries are loaded).
 * Every helper schedules tweens on a GSAP timeline `tl` at time `t`; all motion is a pure function of timeline
 * time (seek-safe, no timers, no Math.random, no repeat:-1). Same part animated several times: call in time order —
 * each call starts from the previous call's end value.
 */
(function () {
  if (window.KITX07) return;
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
  /** progress tween k: 0→1 over dur, calling fn(k) */
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
  function popIn(tl, el, t, dur, from) {
    if (typeof el === "string") el = $(el); if (!el) return;
    last["op:" + el.id] = 1;
    tl.fromTo(el, { opacity: 0, scale: from == null ? 0.6 : from, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: dur || 0.3, ease: "back.out(1.8)", immediateRender: false }, t);
  }
  function blink(tl, el, t, n, period, end) {
    if (typeof el === "string") el = $(el); if (!el) return;
    var key = "op:" + el.id, from = key in last ? last[key] : +(el.getAttribute("opacity") || 0);
    last[key] = end;
    prog(tl, t, n * period, "none", function (k) {
      var v = k >= 1 ? end : (Math.sin(Math.PI * k * n * 2 - Math.PI / 2) + 1) / 2;
      gsap.set(el, { opacity: k <= 0 ? from : r2(v) });
    });
  }

  // ---------- emptyLot
  /** plate highlight: blinks n times (default 3) then stays on/off */
  function lotPlate(tl, p, t, on, n) { blink(tl, p + "-plate-hi", t, n == null ? 3 : n, 0.32, on === false ? 0 : 1); }
  /** ghost foundation outline fades to `to` */
  function lotGhost(tl, p, t, to, dur) { op(tl, p + "-ghost", t, to, dur == null ? 0.5 : dur); }

  // ---------- parcel
  /** solid box dissolves into a red dashed empty shell ("never delivered") */
  function lose(tl, p, t, dur) { dur = dur == null ? 0.6 : dur; op(tl, p + "-real", t, 0, dur); op(tl, p + "-lost", t, 1, dur); }
  function found(tl, p, t, dur) { dur = dur == null ? 0.4 : dur; op(tl, p + "-real", t, 1, dur); op(tl, p + "-lost", t, 0, dur); }
  function parcelLabel(tl, p, t, mode) { op(tl, p + "-label-r", t, mode === "red" ? 1 : 0, 0.2); }

  // ---------- returnTag
  var FACES = ["ok", "false", "empty"];
  function tagFace(tl, p, t, face, dur) { FACES.forEach(function (k) { op(tl, p + "-face-" + k, t, k === face ? 1 : 0, dur == null ? 0.25 : dur); }); }
  /** stamp "ok" (green check) / "x" (red cross) / null (clear both) */
  function tagStamp(tl, p, t, kind) {
    ["ok", "x"].forEach(function (k) {
      var id = p + "-stamp-" + k;
      if (k === kind) { tl.fromTo("#" + id, { opacity: 0, scale: 1.8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.22, ease: "power3.in", immediateRender: false }, t); last["op:" + id] = 1; }
      else op(tl, id, t, 0, 0.15);
    });
  }
  /** tag pops up out of a slot / pipe mouth (rise in world-canvas px) */
  function tagPop(tl, p, t, dur, rise) {
    var el = $(p + "-pop"); if (!el) return;
    rise = rise == null ? 36 : rise;
    tl.fromTo(el, { opacity: 0, y: rise }, { opacity: 1, y: 0, duration: dur || 0.4, ease: "back.out(1.7)", immediateRender: false }, t);
  }
  function tagHide(tl, p, t, dur) { tl.to("#" + p + "-pop", { opacity: 0, duration: dur || 0.2 }, t); }

  // ---------- dispatchDesk
  /** write entry i (ink wipes in from the left) */
  function entry(tl, p, t, i, dur) {
    var g = $(p + "-entry-" + i), c = $(p + "-entry-" + i + "-c"); if (!g || !c) return;
    dur = dur == null ? 0.5 : dur;
    op(tl, g, t, 1, 0.01, "none");
    var w = num(g, "w", 60) + 4;
    tw(tl, "ew:" + p + i, t, w, dur, "power1.inOut", function (a) { c.setAttribute("width", r2(a)); }, function () { return +c.getAttribute("width"); });
  }
  function eraseEntry(tl, p, t, i) { op(tl, p + "-entry-" + i, t, 0, 0.25); }
  function slotFlash(tl, p, t, n) { blink(tl, p + "-slot-hi", t, n || 2, 0.3, 0); }

  // ---------- oddCoin (flip about the vertical axis + uniform scale, both kept on the element)
  function setCoin(p, a, s) {
    var el = $(p + "-coin"); if (!el) return;
    if (a == null) a = num(el, "a", 0); if (s == null) s = num(el, "s", 1);
    el.setAttribute("data-a", r2(a)); el.setAttribute("data-s", r2(s));
    var c = Math.cos(a * Math.PI / 180);
    if (Math.abs(c) < 0.04) c = c < 0 ? -0.04 : 0.04;
    el.setAttribute("transform", "scale(" + r2(s * c) + " " + r2(s) + ")");
  }
  function coinFlip(tl, p, t, turns, dur) {
    var key = "cf:" + p, from = key in last ? last[key] : 0, to = from + 360 * (turns == null ? 1 : turns);
    tw(tl, key, t, to, dur == null ? 0.8 : dur, "power2.inOut", function (a) { setCoin(p, a, null); }, function () { return 0; });
  }
  function coinScale(tl, p, t, s, dur) {
    tw(tl, "cs:" + p, t, s, dur == null ? 0.5 : dur, "power2.inOut", function (v) { setCoin(p, null, v); }, function () { return 1; });
  }
  /** rebase breathing: scale oscillates around its current value, returns to it at the end */
  function breathe(tl, p, t, dur, period, amp) {
    var base = "cs:" + p in last ? last["cs:" + p] : 1; period = period || 1.2; amp = amp == null ? 0.12 : amp;
    prog(tl, t, dur, "none", function (k) { setCoin(p, null, k >= 1 || k <= 0 ? base : base * (1 + amp * Math.sin(2 * Math.PI * k * dur / period))); });
  }
  function iconOn(tl, p, t, dur) { popIn(tl, p + "-icon", t, dur || 0.35, 0.5); }
  function iconHi(tl, p, t, on) { op(tl, p + "-icon-hi", t, on === false ? 0 : 1, 0.2); }
  function numOn(tl, p, t, on) { op(tl, p + "-num-lit", t, on === false ? 0 : 1, 0.15); }
  /** tax coin: the snipped chip falls off */
  function chipDrop(tl, p, t, dur) {
    var el = $(p + "-chip"); if (!el) return;
    op(tl, el, t, 1, 0.01);
    tl.fromTo(el, { x: 0, y: 0 }, { x: 10, y: 46, duration: dur || 0.45, ease: "power2.in", immediateRender: false }, t);
    op(tl, el, t + (dur || 0.45), 0, 0.12);
  }

  // ---------- scale (weighing)
  function fmtNum(v, dec) { var s = (+v).toFixed(dec), parts = s.split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return parts.join("."); }
  function decOf(v) { var s = String(v); return s.indexOf(".") < 0 ? 0 : s.length - s.indexOf(".") - 1; }
  /** roll an LCD reading ("before" | "after") to value `to` (number), or blank it with null */
  function read(tl, p, t, which, to, dur) {
    var el = $(p + "-lcd-" + which + "-v"); if (!el) return;
    var unit = el.getAttribute("data-unit") || "", key = "rd:" + p + which;
    var cur = el.textContent.replace(/[^\d.\-]/g, "");
    var from = key in last ? last[key] : (cur === "" ? null : +cur);
    last[key] = to;
    var dec = Math.max(decOf(to == null ? 0 : to), decOf(from == null ? 0 : from));
    var a = from == null ? 0 : from;
    prog(tl, t, to == null ? 0.001 : (dur == null ? 0.8 : dur), "power1.out", function (k) {
      if (k <= 0) { el.textContent = from == null ? "" : fmtNum(from, dec) + unit; return; }
      if (to == null) { el.textContent = ""; return; }
      el.textContent = fmtNum(a + (to - a) * k, k >= 1 ? decOf(to) : dec) + unit;
    });
  }
  /** difference strip: ok=true green, false red, null hidden */
  function diff(tl, p, t, ok, text) {
    var g = $(p + "-diff"), bg = $(p + "-diff-bg"), tx = $(p + "-diff-v"); if (!g) return;
    step(tl, "df:" + p, t, { ok: ok, text: text == null ? tx.textContent : text },
      function () { var d = g.getAttribute("data-ok"); return { ok: d === "" ? null : d === "1", text: tx.textContent }; },
      function (st) {
        g.setAttribute("opacity", st.ok == null ? 0 : 1);
        bg.setAttribute("fill", st.ok === false ? "#e0453a" : "#1f9d55");
        tx.textContent = st.text;
      });
    if (ok != null) tl.fromTo(g, { scale: 1.15, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, ease: "back.out(2)", immediateRender: false }, t);
  }
  /** number of coins on the pan → n (each coin appears / disappears in turn over dur) */
  function pileTo(tl, p, t, n, dur) {
    var key = "pl:" + p, from = key in last ? last[key] : (function () { var c = 0; while ($(p + "-pile-" + c) && +$(p + "-pile-" + c).getAttribute("opacity") > 0) c++; return c; })();
    last[key] = n; if (n === from) return;
    dur = dur == null ? 0.5 : dur;
    var steps = Math.abs(n - from), dt = steps > 1 ? dur / steps : 0;
    for (var j = 0; j < steps; j++) {
      var i = n > from ? from + j : from - 1 - j;
      op(tl, p + "-pile-" + i, t + j * dt, n > from ? 1 : 0, 0.08);
    }
  }
  /** pan dips under a load and settles */
  function weigh(tl, p, t) {
    var el = $(p + "-pan"); if (!el) return;
    tl.fromTo(el, { y: 0 }, { y: 3.5, duration: 0.12, ease: "power2.in", immediateRender: false }, t);
    tl.to(el, { y: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" }, t + 0.12);
  }

  // ---------- tollClip
  function tollBlade(tl, p, t, down, dur) {
    var el = $(p + "-blade"); if (!el) return;
    var dy = num(el, "dy", 30);
    tw(tl, "tb:" + p, t, down ? dy : 0, dur == null ? (down ? 0.18 : 0.4) : dur, down ? "power3.in" : "power2.out", function (y) { el.setAttribute("transform", "translate(0 " + r2(y) + ")"); }, function () { return 0; });
  }
  function cup(tl, p, t, n) {
    var key = "cup:" + p, from = key in last ? last[key] : (function () { var c = 0; while ($(p + "-cup-" + c) && +$(p + "-cup-" + c).getAttribute("opacity") > 0) c++; return c; })();
    last[key] = n;
    for (var i = 0; i < 8; i++) if ((i < n) !== (i < from)) op(tl, p + "-cup-" + i, t, i < n ? 1 : 0, 0.1);
  }
  /** one toll: blade drops, a gold chip is flicked into the cup (pile +1), blade lifts. Returns end time. */
  function toll(tl, p, t) {
    tollBlade(tl, p, t, true, 0.18);
    var ch = $(p + "-chip");
    if (ch) {
      var dx = num(ch, "dx", 0), dy = num(ch, "dy", 0);
      tl.fromTo(ch, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, t + 0.18);
      prog(tl, t + 0.18, 0.45, "power1.inOut", function (k) {
        ch.setAttribute("transform", "translate(" + r2(dx * k) + " " + r2(dy * k - 46 * Math.sin(Math.PI * k)) + ")");
      });
      tl.to(ch, { opacity: 0, duration: 0.06 }, t + 0.62);
    }
    var key = "cup:" + p, cur = key in last ? last[key] : (function () { var c = 0; while ($(p + "-cup-" + c) && +$(p + "-cup-" + c).getAttribute("opacity") > 0) c++; return c; })();
    cup(tl, p, t + 0.62, Math.min(8, cur + 1));
    tollBlade(tl, p, t + 0.3, false, 0.4);
    return t + 0.75;
  }

  // ---------- auctionStand
  function gavelTo(tl, p, t, up, dur) { var el = $(p + "-gavel"); rotTo(tl, p + "-gavel", t, up ? num(el, "up", 48) : 0, dur == null ? 0.3 : dur, up ? "power2.out" : "power3.in"); }
  /** strike once (raise + slam). opts.blocked: raise, try to come down twice, stay up. Returns end time. */
  function gavel(tl, p, t, o) {
    o = o || {};
    gavelTo(tl, p, t, true, 0.25);
    if (!o.blocked) { gavelTo(tl, p, t + 0.3, false, 0.12); return t + 0.45; }
    var el = $(p + "-gavel"), up = num(el, "up", 48);
    rotTo(tl, p + "-gavel", t + 0.3, up * 0.6, 0.12, "power3.in"); rotTo(tl, p + "-gavel", t + 0.42, up, 0.18, "back.out(2)");
    rotTo(tl, p + "-gavel", t + 0.62, up * 0.6, 0.12, "power3.in"); rotTo(tl, p + "-gavel", t + 0.74, up, 0.18, "back.out(2)");
    return t + 0.95;
  }
  /** flip the "highest bid" board to new content {name, amount, red} */
  function board(tl, p, t, o, dur) {
    var g = $(p + "-board"), nm = $(p + "-board-name"), am = $(p + "-board-amt"), rd = $(p + "-board-r"); if (!g) return;
    o = o || {}; dur = dur == null ? 0.5 : dur;
    var key = "bd:" + p, prev = key in last ? last[key] : { name: g.getAttribute("data-name"), amount: g.getAttribute("data-amt"), red: g.getAttribute("data-red") === "1" };
    var next = { name: o.name == null ? prev.name : o.name, amount: o.amount == null ? prev.amount : o.amount, red: o.red == null ? prev.red : !!o.red };
    last[key] = next;
    var cx = num(g, "cx", 0), cy = num(g, "cy", 0);
    prog(tl, t, dur, "none", function (k) {
      var st = k < 0.5 ? prev : next, sy = Math.max(0.02, Math.abs(Math.cos(Math.PI * k)));
      g.setAttribute("transform", "translate(" + cx + " " + cy + ") scale(1 " + r2(sy) + ") translate(" + -cx + " " + -cy + ")");
      nm.textContent = st.name; am.textContent = st.amount; rd.setAttribute("opacity", st.red ? 1 : 0);
    });
  }
  /** refund coin slides down the chute: mode "out" (reaches the bidder end) | "bounce" (pushed back up, chute flashes red) */
  function refund(tl, p, t, mode, dur) {
    var el = $(p + "-refund"); if (!el) return;
    var dx = num(el, "dx", 0), dy = num(el, "dy", 0), red = $(p + "-chute-red");
    dur = dur == null ? 0.8 : dur;
    var set = function (q) { el.setAttribute("transform", "translate(" + r2(dx * q) + " " + r2(dy * q) + ")"); };
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, t);
    if (mode === "bounce") {
      prog(tl, t, dur, "power2.in", function (k) { set(0.78 * k); });
      prog(tl, t + dur, dur * 0.7, "power2.out", function (k) { set(0.78 * (1 - k)); });
      if (red) blink(tl, red, t + dur, 2, 0.28, 1);
      tl.to(el, { opacity: 0, duration: 0.15 }, t + dur * 1.7);
    } else {
      prog(tl, t, dur, "power2.in", function (k) { set(k); });
    }
  }
  function chuteOk(tl, p, t) { op(tl, p + "-chute-red", t, 0, 0.2); }

  var api = {
    lotPlate: lotPlate, lotGhost: lotGhost,
    lose: lose, found: found, parcelLabel: parcelLabel,
    tagFace: tagFace, tagStamp: tagStamp, tagPop: tagPop, tagHide: tagHide,
    entry: entry, eraseEntry: eraseEntry, slotFlash: slotFlash,
    setCoin: setCoin, coinFlip: coinFlip, coinScale: coinScale, breathe: breathe, iconOn: iconOn, iconHi: iconHi, numOn: numOn, chipDrop: chipDrop,
    read: read, diff: diff, pileTo: pileTo, weigh: weigh,
    tollBlade: tollBlade, cup: cup, toll: toll,
    gavelTo: gavelTo, gavel: gavel, board: board, refund: refund, chuteOk: chuteOk,
  };
  window.KITX07 = api;
  // 合并进 window.KITX：已存在的名字（别章的通用或同名助手）一律不覆盖；多章同时加载时请用 KITX07.xxx
  var K = window.KITX || {};
  Object.keys(api).forEach(function (k) { if (!(k in K)) K[k] = api[k]; });
  window.KITX = K;
})();
