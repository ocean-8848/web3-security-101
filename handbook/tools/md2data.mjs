// Markdown -> handbook DATA html, matching the live page's conventions (marked, GFM, breaks).
import { Marked } from 'marked';
import path from 'node:path';

export const EXT_LINKS = {
  'CEX/README.md': 'https://claude.ai/artifact/HYgzfN2Zk8SRLbAskxh8nJ',
  'Contract/README.md': 'https://claude.ai/artifact/7yNTv7XtKX2MYexmqpEogn',
  'web3-loss-101/index.html': 'https://claude.ai/artifact/1a5Nx6xTVLuJdCB8Esf2xj',
  'web3-loss-101/': 'https://claude.ai/artifact/1a5Nx6xTVLuJdCB8Esf2xj',
  'handbook/README.md': 'https://claude.ai/artifact/AuMf2iv5HSYVzvQiBEE6pA',
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function convert(md, mdPath, mdMap, { bookDir = 'handbook' } = {}) {
  const base = path.posix.dirname(mdPath);
  const marked = new Marked({ gfm: true, breaks: true });
  marked.use({
    renderer: {
      code(code, lang) {
        if (lang === 'mermaid') return `<div class="mmd-wrap"><pre class="mmd">${esc(code)}</pre></div>\n`;
        return `<div class="code-wrap"><pre><code${lang ? ` class="language-${lang}"` : ''}>${esc(code)}\n</code></pre></div>\n`;
      },
    },
  });
  // cjkBold: CommonMark does not close **…** when it ends in punctuation and touches CJK text; use <strong> outside code.
  md = md.split(/(```[\s\S]*?```)/).map((blk, i) => {
    if (i % 2) return blk;
    const codes = []; const held = blk.replace(/`[^`\n]*`/g, c => `\u0000${codes.push(c) - 1}\u0000`);
    return held.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/\u0000(\d+)\u0000/g, (_, k) => codes[k]);
  }).join('');
  let out = marked.parse(md);
  out = out.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-wrap"><table>$1</table></div>');
  out = out.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (m, body) => {
    const first = body.replace(/<[^>]+>/g, '').trim();
    const cls = first.startsWith('⚠️') ? 'warn' : first.startsWith('💡') ? 'info' : first.startsWith('🎯') ? 'analogy' : first.startsWith('🪞') ? 'reflect' : first.startsWith('🧪') ? 'labcall' : '';
    return `<blockquote class="${cls}">${body.replace(/^\n/, "")}</blockquote>`;
  });
  out = out.replace(/<a href="([^"]*)"([^>]*)>/g, (m, href, rest) => {
    const raw = href.replace(/&amp;/g, '&');
    if (/^https?:\/\//.test(raw)) return `<a href="${href}" target="_blank" rel="noopener"${rest}>`;
    const [p, frag] = raw.split('#');
    // 仓库根目录的 code/ 链回手册时写 ../handbook/…，这里还原成手册内的路径
    const norm = (p ? path.posix.normalize(path.posix.join(base, p)) : mdPath).replace(/^(\.\.\/)?handbook\//, '');
    const fromParent = path.posix.normalize(path.posix.join(bookDir, norm));
    for (const [k, url] of Object.entries(EXT_LINKS)) if (!k.startsWith(bookDir + '/') && (fromParent === k || '../' + k === norm)) return `<a href="${url}${frag ? '#' + frag : ''}" target="_blank" rel="noopener"${rest}>`;
    if (norm.startsWith('interactive/') && norm.endsWith('.html')) {
      const name = path.posix.basename(norm, '.html');
      const id = name === 'index' ? 'labs' : 'lab-' + name;
      return `<a href="#${id}" data-nav="${id}" class="lab-link"${rest}>`;
    }
    if (norm.startsWith('code/') || norm.startsWith('../code/')) return `<a href="#examples" data-nav="examples"${rest}>`;
    if (norm === 'handbook.html' || norm === 'index.html') return `<a href="#home" data-nav="home"${rest}>`;
    if (norm.startsWith('video/')) return `<a href="#home" data-nav="home"${rest}>`;
    const key = norm.endsWith('.md') ? norm : norm.replace(/\/?$/, '/');
    const id = mdMap[key];
    if (!id) throw new Error(`${mdPath}: unresolved link ${href}`);
    return `<a href="#${id}" data-nav="${id}"${rest}>`;
  });
  return out;
}

export const titleOf = md => md.match(/^# (.+)$/m)[1].trim();
