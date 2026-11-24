/* Shared drawing helpers for the contract-security video decks. Load BEFORE the deck's own <script> and player.js.
 * marks(el, st): generic onstep handler —
 *   [data-k="n"]       → class "pend" while st < n, class "cur" when st == n (add data-nocur to skip "cur").
 *   [data-show="a"]    → displayed only when st >= a;  data-show="a-b" → only when a <= st <= b.
 *   [data-texts='[..]']→ textContent = texts[min(st, len-1)].
 *   .src .ln[data-mark="k:bad,m:good"] → adds class bad/good from step k (m) on.
 * Decks may call marks(el, st) at the start of their own onstep function.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { gold: '#f0b90b', buy: '#2ebd85', sell: '#f6465d', info: '#5b9cff', warn: '#f0a340', text: '#eceae4', t2: '#9ea3ad', line: '#2c3038', panel: '#16181c', panel2: '#1e2127', dim: '#555b66', curFill: '#221e10', badFill: '#2a1418', goodFill: '#14261e', infoFill: '#142036' };
  function svgEl(tag, attrs, text) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; return e; }
  function T(svg, x, y, s, fill, size, anchor, weight, op) {
    return svg.appendChild(svgEl('text', { x, y, fill: fill || C.text, 'text-anchor': anchor || 'middle', 'dominant-baseline': 'middle', opacity: op ?? 1, style: `font-size:${size || 28}px;${weight ? 'font-weight:700' : ''}` }, s));
  }
  function box(svg, x, y, w, h, t, o = {}) {
    svg.appendChild(svgEl('rect', { x, y, width: w, height: h, rx: o.rx ?? 12, fill: o.fill || C.panel, stroke: o.stroke || C.line, 'stroke-width': o.sw || 3, opacity: o.op ?? 1, 'stroke-dasharray': o.dash ? '10 8' : '' }));
    const lines = Array.isArray(t) ? t : [t];
    const lh = o.lh || 36;
    lines.forEach((s, i) => T(svg, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * lh, s, i ? (o.sc || C.t2) : (o.tc || C.text), i ? (o.ss || 25) : (o.fs || 30), 'middle', i === 0 && o.bold, o.op ?? 1));
  }
  function arrow(svg, x1, y1, x2, y2, color, dash, w, op) {
    color = color || C.t2;
    const id = 'ah' + (svg.id || 'x') + color.replace(/[^a-z0-9]/gi, '');
    if (!svg.querySelector('#' + id)) {
      let defs = svg.querySelector('defs'); if (!defs) { defs = svgEl('defs', {}); svg.insertBefore(defs, svg.firstChild); }
      const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      m.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: color })); defs.appendChild(m);
    }
    return svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w || 4, 'marker-end': `url(#${id})`, 'stroke-dasharray': dash ? '10 8' : '', opacity: op ?? 1 }));
  }
  function line(svg, x1, y1, x2, y2, color, w, dash, op) { return svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: color || C.line, 'stroke-width': w || 3, 'stroke-dasharray': dash ? '10 8' : '', opacity: op ?? 1 })); }
  function rect(svg, x, y, w, h, o = {}) { return svg.appendChild(svgEl('rect', { x, y, width: w, height: h, rx: o.rx ?? 10, fill: o.fill || C.panel, stroke: o.stroke || 'none', 'stroke-width': o.sw || 3, opacity: o.op ?? 1 })); }
  function circle(svg, cx, cy, r, fill, o = {}) { return svg.appendChild(svgEl('circle', { cx, cy, r, fill, stroke: o.stroke || 'none', 'stroke-width': o.sw || 3, opacity: o.op ?? 1 })); }
  const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  function inRange(spec, st) {
    const m = String(spec).split('-');
    const a = +m[0], b = m.length > 1 && m[1] !== '' ? +m[1] : Infinity;
    return st >= a && st <= b;
  }
  function marks(el, st) {
    el.querySelectorAll('[data-k]').forEach(n => {
      const k = +n.dataset.k;
      n.classList.toggle('pend', st < k);
      n.classList.toggle('cur', st === k && !n.hasAttribute('data-nocur'));
    });
    el.querySelectorAll('[data-show]').forEach(n => n.classList.toggle('on', inRange(n.dataset.show, st)));
    el.querySelectorAll('[data-texts]').forEach(n => { const a = JSON.parse(n.dataset.texts); n.textContent = a[Math.min(st, a.length - 1)]; });
    el.querySelectorAll('[data-mark]').forEach(n => {
      n.classList.remove('bad', 'good');
      n.dataset.mark.split(',').forEach(p => { const [k, c] = p.split(':'); if (st >= +k) { n.classList.remove('bad', 'good'); n.classList.add(c); } });
    });
  }
  // rowStep(el, st): reveal table body rows of the scene evenly across its narration steps (all rows shown at the last step).
  // Rows with data-k use that step instead. Also runs marks().
  function rowStep(el, st) {
    marks(el, st);
    const rows = [...el.querySelectorAll('tbody tr')];
    const n = el.querySelectorAll('ol.say > li').length;
    const auto = rows.filter(r => !r.hasAttribute('data-k'));
    const per = auto.length / n;
    const upto = Math.min(auto.length - 1, Math.floor((st + 1) * per - 0.001));
    const from = Math.floor(st * per);
    auto.forEach((r, i) => { r.classList.toggle('pend', i > upto); r.classList.toggle('cur', i >= from && i <= upto); });
  }
  Object.assign(window, { K: { NS, C, svgEl, T, box, arrow, line, rect, circle, fmt }, marks, rowStep });
})();
