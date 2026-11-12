/* ---------- 学习层接入：Web3 行业安全资损 101 ---------- */
(() => {
  const GROUPS = { p0: '第 0 部分 · 总论', p1: '第 1 部分 · 独立案件', p2: '第 2 部分 · 手法归纳', p3: '第 3 部分 · 防御与附录' };
  const study = d => d && !d.soon && GROUPS[d.group];
  LearnLayer.init({
    key: 'losshb',
    name: 'Web3 资损 101',
    watch: '#main',
    root: () => document.getElementById('view'),
    current() {
      const id = location.hash.slice(1) || 'home', d = H.byId[id];
      return study(d) ? { id, title: `${d.code} ${d.title}` } : null;
    },
    chapters: () => H.docs.filter(study).map(d => ({ id: d.id, title: `${d.code} ${d.title}`, code: d.code, group: GROUPS[d.group] })),
    cardBefore: '.pager',
    after(root) { // start the floating 本章目录 collapsed so it doesn't cover the status bar
      const n = root.querySelector('.toc-in.open:not(.pin):not([data-llc])');
      if (n) { n.dataset.llc = '1'; n.classList.remove('open'); const b = n.querySelector('.toc-tg'); if (b) b.setAttribute('aria-expanded', 'false'); }
    }
  });
})();
