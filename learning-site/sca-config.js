/* ---------- 学习层接入：智能合约安全审计 101（section.ch 型手册） ---------- */
(() => {
  const ok = id => byId[id] && !['start', 'ref'].includes(byId[id].dataset.group);
  LearnLayer.init({
    key: 'sca',
    name: '审计 101',
    watch: '#main',
    root() { const id = location.hash.slice(1) || 'home'; return byId[id] || null; },
    current() {
      const id = location.hash.slice(1) || 'home';
      return ok(id) ? { id, title: `${byId[id].dataset.code} ${byId[id].dataset.title}` } : null;
    },
    chapters: () => countable.map(s => ({ id: s.id, title: `${s.dataset.code} ${s.dataset.title}`, group: GROUPS[s.dataset.group] })),
    cardBefore: '.donebar',
    legacyDone: () => [...done],
    doneSel: '.donebtn',
    isDone: id => done.has(id),
    onStatus(id, s) {
      if ((s === 2) === done.has(id)) return;
      s === 2 ? done.add(id) : done.delete(id);
      store.set('sca-done', [...done]); updateProgress();
    },
    after(root) {
      const s = root.querySelector('.donebar > span');
      if (s) s.textContent = '读完并做完本章的实验和思考题后标记完成。完成状态会同步到学习台，并进入复习队列。';
    }
  });
})();
