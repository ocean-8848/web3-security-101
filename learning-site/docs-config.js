/* ---------- 学习层接入：DATA.docs 型手册（CEX / 合约 / Web3 安全） ----------
 * 由 build.py 在前面注入 const LL_SITE = { key, name, skip: [...] }
 */
(() => {
  const SKIP = new Set(['home', 'guide', 'labs', 'examples'].concat(LL_SITE.skip || []));
  const ok = id => DATA.docs[id] && !SKIP.has(id) && !id.startsWith('lab-');
  const groupOf = {};
  DATA.nav.forEach(g => g.items.forEach(id => { groupOf[id] = g.full || g.name; }));
  LearnLayer.init({
    aliases: DATA.aliases || {},
    key: LL_SITE.key,
    name: LL_SITE.name,
    watch: '#main',
    root: () => document.getElementById('view'),
    current() {
      const id = location.hash.slice(1) || 'home';
      return ok(id) ? { id, title: DATA.docs[id].title } : null;
    },
    chapters: () => DATA.nav.flatMap(g => g.items).filter(ok).map(id => ({ id, title: DATA.docs[id].title, group: groupOf[id] })),
    cardBefore: '.pager'
  });
})();
