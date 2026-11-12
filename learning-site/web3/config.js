/* ---------- 学习层接入：Web3 从 0 到 1 ---------- */
LearnLayer.init({
  key: 'w3hb',
  name: 'Web3 从 0 到 1',
  watch: '#main',
  root: () => document.getElementById('view'),
  current() {
    const id = location.hash.slice(1) || 'home', c = H.byId[id];
    return c && c.mod ? { id, title: c.title } : null;
  },
  chapters: () => H.ch.filter(c => c.mod).map(c => ({ id: c.id, title: c.title, code: c.code, group: (H.byId[c.mod].nav || H.byId[c.mod].title) })),
  cardBefore: '.donebar',
  legacyDone: () => [...DONE],
  doneAttr: 'data-markdone',
  isDone: id => DONE.has(id),
  onStatus(id, s) {
    if ((s === 2) !== DONE.has(id)) setDone(id, s === 2);
    const b = document.querySelector(`[data-markdone="${id}"]`);
    if (b) { const v = DONE.has(id); b.className = 'btn ' + (v ? '' : 'primary'); b.textContent = v ? '✓ 已学完（点击取消）' : '标记本篇为已学完'; }
  },
  after(root) {
    const s = root.querySelector('.donebar .muted');
    if (s) s.textContent = '学完会同步到学习台，并进入复习队列。';
  }
});
