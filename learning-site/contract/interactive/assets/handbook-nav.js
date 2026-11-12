// When a lab runs inside the handbook (iframe), chapter links ask the outer page to navigate.
// Standalone, the links open the Markdown file as usual.
(function () {
  if (window.parent === window) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (/\.md(#|$)/.test(href)) {
      e.preventDefault();
      window.parent.postMessage({ handbookNavMd: href }, '*');
    } else if (/^[\w-]+\.html(#|$)/.test(href) && href !== 'index.html') {
      e.preventDefault();
      window.parent.postMessage({ handbookNav: 'lab-' + href.replace(/\.html.*$/, '') }, '*');
    }
  });
})();
