// Run the handbook chapter sources in Node with a tiny DOM stub and dump each chapter's HTML.
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = path.join(__dirname, '../../web3-handbook/src');
const stub = { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, documentElement: {}, createElement() { return { style: {} }; } };
const ctx = { document: stub, window: {}, console, localStorage: { getItem() { return null; }, setItem() {} }, getComputedStyle() { return { getPropertyValue() { return ''; } }; }, matchMedia() { return { matches: false, addEventListener() {} }; } };
vm.createContext(ctx);
const files = ['core.js', ...fs.readdirSync(src).filter(f => /^labs-/.test(f)), ...fs.readdirSync(src).filter(f => /^ch-/.test(f)), ...fs.readdirSync(src).filter(f => /^sub-/.test(f))];
const code = files.map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n;\n') + '\n;globalThis.__H = H;';
vm.runInContext(code, ctx);
const out = {};
ctx.__H.ch.filter(c => c.mod).forEach(c => { out[c.id] = { title: c.title, html: typeof c.html === 'function' ? c.html() : c.html }; });
fs.writeFileSync(path.join(__dirname, 'web3-docs.json'), JSON.stringify(out));
console.log(Object.keys(out).length, 'chapters');
