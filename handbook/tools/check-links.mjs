// Link check for the handbook: node tools/check-links.mjs  (internal links always; add --ext for external URLs).
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => ['node_modules','dist','lib','out','cache','video'].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);
const ext = new Map(); let bad = 0;
for (const f of [...walk(ROOT), ...walk(path.resolve(ROOT, "..", "code"))]) {
  const s = fs.readFileSync(f, 'utf8');
  for (const [, u] of s.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^https?:/.test(u)) { if (!ext.has(u)) ext.set(u, path.relative(ROOT, f)); continue; }
    if (u.startsWith('#') || u.startsWith('mailto:')) continue;
    const t = path.resolve(path.dirname(f), u.split('#')[0]);
    if (!fs.existsSync(t) && !/^(\.\.\/)+(CEX|Contract|web3-loss-101)/.test(u)) { console.log('BROKEN', path.relative(ROOT, f), u); bad++; }
  }
}

// Question sections must be one continuous numbered list: the learning site attaches answer boxes to the first list only.
for (const f of [...walk(ROOT), ...walk(path.resolve(ROOT, "..", "code"))]) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/^#{2,3} .*思考题.*$/gm)) {
    let body = s.slice(m.index + m[0].length); const e = body.search(/^#{1,3} /m); if (e >= 0) body = body.slice(0, e);
    const lines = body.split('\n'); let lists = 0, inList = false, broke = false;
    for (const l of lines) {
      if (/^\d+\. /.test(l)) { if (!inList || broke) lists++; inList = true; broke = false; }
      else if (l.trim() && !/^\s/.test(l) && inList && !/^(---|Sources|来源|下一章|参考)/.test(l)) broke = true;
      else if (/^(---|Sources|来源|下一章)/.test(l)) break;
    }
    if (lists > 1 || /<details/.test(body.split(/^---$/m)[0])) { console.log('QUESTIONS SPLIT', path.relative(ROOT, f)); bad++; }
  }
}
console.log(`internal broken: ${bad}; external urls: ${ext.size}`);
if (process.argv.includes('--ext')) {
  const urls = [...ext.keys()]; let dead = 0;
  for (let i = 0; i < urls.length; i += 12) await Promise.all(urls.slice(i, i + 12).map(async u => {
    try { const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0' } }); if (r.status === 404 || r.status === 410) { console.log('DEAD', r.status, u, ext.get(u)); dead++; } }
    catch (e) { if (/ENOTFOUND|getaddrinfo|EAI_AGAIN/.test(String(e.cause || e))) { console.log('DNS', u, ext.get(u)); dead++; } }
  }));
  console.log('external dead:', dead);
}
