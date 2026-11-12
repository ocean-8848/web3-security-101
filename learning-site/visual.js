/* ---------- 视觉层：章节题图、本章地图、阅读进度、提示框图标、学习路线图 ----------
 * 依赖 LearnLayer（learn.js）先加载。只读页面结构，不改正文内容。
 */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* line icons on a 24-unit grid, stroke = currentColor */
const I = {
  block: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  chain: '<rect x="2.5" y="8" width="7" height="8" rx="2"/><rect x="14.5" y="8" width="7" height="8" rx="2"/><path d="M9.5 12h5"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.2 0-2.3-.5-2.9-1.3M12 6.5v11"/>',
  wallet: '<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5h11.5v3"/><path d="M20.5 11h-4a1.75 1.75 0 0 0 0 3.5h4z"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8 20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  shield: '<path d="M12 3 19.5 6v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.6"/>',
  bug: '<rect x="7.5" y="8" width="9" height="12" rx="4.5"/><path d="M9 8a3 3 0 0 1 6 0M12 11v9M3.5 13h4M16.5 13h4M4.5 8.5 7.6 10M19.5 8.5 16.4 10M4.5 18l3.2-1.5M19.5 18l-3.2-1.5"/>',
  book: '<path d="M4 5.5h6.5v14H4zM13.5 5.5H20v14h-6.5z"/><path d="M6 9h2.5M6 12h2.5M15.5 9H18M15.5 12H18M15.5 15H18M6 15h2.5"/>',
  chart: '<path d="M3.5 20.5h17M6 17v-5M10.5 17V8M15 17v-7M19.5 17V5"/>',
  candle: '<path d="M6 3v4M6 15v6M18 4v3M18 15v5M12 6v3M12 17v4"/><rect x="4" y="7" width="4" height="8" rx="1"/><rect x="10" y="9" width="4" height="8" rx="1"/><rect x="16" y="7" width="4" height="8" rx="1"/>',
  bridge: '<path d="M2.5 16.5h19M4 16.5V20M20 16.5V20M3 12c3-4.5 15-4.5 18 0M7.5 16.5v-6M12 16.5V9.5M16.5 16.5v-6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  robot: '<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 4.5V8M9 13v1M15 13v1M9.5 16.5h5M2.5 12.5v3M21.5 12.5v3"/><circle cx="12" cy="4" r="1"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
  vault: '<rect x="3.5" y="4" width="17" height="15.5" rx="2"/><circle cx="12" cy="11.75" r="4"/><path d="M12 9.5v4.5M9.8 11.75h4.4M6 19.5V21M18 19.5V21"/>',
  gavel: '<path d="m13.5 4.5 6 6M11 7l6 6M10 8l4.5-4.5 6 6L16 14M11.5 11.5 4 19"/><path d="M3 21h9"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  server: '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h5.5M11 17h5.5"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2 6.2 15.8M13.2 7.2l4.6 8.6M7.5 18h9"/>',
  code: '<path d="M14 3.5H6.5A1.5 1.5 0 0 0 5 5v14a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5z"/><path d="M14 3.5v5h5M10 12.5l-2 2 2 2M14 12.5l2 2-2 2"/>',
  bolt: '<path d="M13 2.5 5 13.5h6.5L10.5 21.5 19 10h-6.5z"/>',
  layers: '<path d="m12 3.5 9 4.5-9 4.5L3 8z"/><path d="m3 12 9 4.5 9-4.5M3 16l9 4.5 9-4.5"/>',
  swap: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
  alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.6.3 4.4 2 5 5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  flow: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 6H14a3 3 0 0 1 3 3v6.5M5 8.5V15a3 3 0 0 0 3 3h8.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  map: '<path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  bulb: '<path d="M9 17.5h6M10 21h4M8.5 14.5c-1.6-1.3-2.5-3-2.5-5a6 6 0 0 1 12 0c0 2-.9 3.7-2.5 5-.6.5-1 1.3-1 2.1V17h-5v-.4c0-.8-.4-1.6-1-2.1z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
  layersDeep: '<path d="M4 6h16M4 12h16M4 18h10"/>'
};
const svgIcon = (k, size = 24, sw = 1.7) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k] || I.block}</svg>`;

/* topic → icon, first match wins; tested against the chapter title, then group name */
const TOPICS = [
  [/重入|reentr/i, 'bug'], [/漏洞|攻击|事故|事件|hack|exploit|失败|倒闭|案例库/i, 'alert'], [/审计|评估|测试|fuzz|foundry|检查/i, 'search'],
  [/预言机|oracle|喂价/i, 'eye'], [/闪电贷|flash/i, 'bolt'], [/跨链|桥|bridge/i, 'bridge'], [/MEV|三明治|抢跑|排序/i, 'flow'],
  [/签名|私钥|助记词|MPC|门限|密钥|HD/i, 'key'], [/钱包|托管|wallet|充值|提币|冷热/i, 'wallet'], [/金库|vault|储备|国库|保险基金/i, 'vault'],
  [/权限|访问控制|多签|安全|风控|防护|合规前/i, 'shield'], [/合规|监管|牌照|法|税务|治理/i, 'gavel'], [/代理|升级|proxy/i, 'layers'],
  [/L2|Rollup|扩容|分层|架构/i, 'layers'], [/AMM|兑换|swap|闪兑|DEX/i, 'swap'], [/撮合|订单|order|盘口/i, 'book'], [/行情|K 线|深度|价格/i, 'candle'],
  [/借贷|lending|清算|强平|杠杆|保证金|永续|perp|资金费率|衍生品|期权/i, 'chart'], [/预测市场|polymarket|LMSR/i, 'target'],
  [/Agent|AI|MCP|机器人/i, 'robot'], [/节点|RPC|基础设施|运维|高可用|索引/i, 'server'], [/共识|PoS|PoW|网络|P2P/i, 'network'],
  [/EVM|Solidity|合约|字节码|存储|Gas|代码|编程|Go|前端|wagmi|viem/i, 'code'], [/代币|token|ERC|稳定币|USDT|发币|经济|收入|商业|费/i, 'coin'],
  [/账本|分录|对账|结算/i, 'book'], [/区块|哈希|默克尔|链|block/i, 'block'], [/用户|账户|身份|KYC/i, 'users'], [/路线|入门|是什么|全景|地图|概览/i, 'map']
];
function pickIcons(title, group) {
  const found = [];
  for (const [re, k] of TOPICS) if (re.test(title) && !found.includes(k)) found.push(k);
  for (const [re, k] of TOPICS) if (found.length < 3 && re.test(group || '') && !found.includes(k)) found.push(k);
  ['block', 'chain', 'coin'].forEach(k => { if (found.length < 3 && !found.includes(k)) found.push(k); });
  return found.slice(0, 3);
}
/* stable hue per group: rotate through the page's own semantic tokens */
const HUES = ['--ll-acc', '--ll-info', '--ll-warn', '--ll-ok', '--ll-risk'];
const hash = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

const CSS = `
:root{--ll-info:var(--info,#3756c8);--ll-info-soft:var(--info-soft,#e2e8fa)}
.lv-cover{position:relative;margin:4px 0 18px;border-radius:14px;overflow:hidden;border:1px solid var(--rule);background:var(--paper);display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:stretch;min-height:150px}
.lv-cover .lv-art{position:absolute;inset:0;color:var(--lv-c);pointer-events:none}
.lv-cover .lv-art svg{width:100%;height:100%;display:block}
.lv-cover .lv-txt{position:relative;padding:18px 20px;display:grid;gap:8px;align-content:center;min-width:0}
.lv-cover .lv-eye{font-family:var(--f-mono,monospace);font-size:11.5px;letter-spacing:.12em;color:var(--lv-c);font-weight:600;text-transform:uppercase}
.lv-cover .lv-facts{display:flex;flex-wrap:wrap;gap:6px}
.lv-cover .lv-facts span{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;padding:3px 9px;border-radius:999px;background:var(--paper);border:1px solid var(--rule);color:var(--ink-2);white-space:nowrap}
.lv-cover .lv-facts svg{color:var(--lv-c)}
.lv-cover .lv-hero{position:relative;width:170px;display:grid;place-items:center}
.lv-cover .lv-tile{width:92px;height:92px;border-radius:24px;display:grid;place-items:center;background:var(--paper);border:1.5px solid var(--lv-c);color:var(--lv-c);box-shadow:0 10px 24px -12px var(--lv-c),inset 0 0 0 6px var(--lv-soft)}
.lv-cover .lv-sat{position:absolute;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--paper);border:1px solid var(--rule);color:var(--ink-2)}
.lv-cover .lv-sat.a{top:16px;right:20px}.lv-cover .lv-sat.b{bottom:16px;left:18px}
@media (max-width:560px){.lv-cover{grid-template-columns:minmax(0,1fr)}.lv-cover .lv-hero{display:none}.lv-cover{min-height:0}}
@media (prefers-reduced-motion:no-preference){.lv-cover .lv-tile{animation:lv-float 6s ease-in-out infinite}@keyframes lv-float{50%{transform:translateY(-4px)}}}
.lv-prog{position:absolute;left:0;right:0;bottom:-1px;height:2px;pointer-events:none;overflow:hidden}
.lv-prog i{display:block;height:100%;width:0;background:var(--ll-acc);opacity:.75;transition:width .15s linear}
.lv-toc{position:fixed;z-index:20;right:max(16px,env(safe-area-inset-right,0px));top:calc(var(--bar,52px) + env(safe-area-inset-top,0px) + 28px);width:200px;max-height:calc(100vh - var(--bar,52px) - 60px);overflow-y:auto;padding:12px 4px 12px 0;font-size:13px;line-height:1.45}
.lv-toc .k{font-size:11px;letter-spacing:.12em;font-weight:700;color:var(--ink-2);margin:0 0 8px 14px}
.lv-toc ol{list-style:none;margin:0;padding:0;position:relative}
.lv-toc ol::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:var(--rule);border-radius:1px}
.lv-toc li{position:relative;padding:4px 0 4px 18px;margin:0;max-width:none}
.lv-toc li::before{content:"";position:absolute;left:1px;top:9px;width:10px;height:10px;border-radius:50%;background:var(--paper);border:2px solid var(--rule)}
.lv-toc li.seen::before{border-color:var(--ll-ok);background:var(--ll-ok)}
.lv-toc li.on::before{border-color:var(--ll-acc);background:var(--paper);box-shadow:0 0 0 3px var(--ll-acc-soft)}
.lv-toc a{color:var(--ink-2);text-decoration:none;display:block}
.lv-toc li.on a{color:var(--ink);font-weight:700}.lv-toc a:hover{color:var(--ll-acc)}
body:not(.lv-wide) .lv-toc{display:none}
body.lv-wide .lv-tocbtn{display:none}
body.lv-wide .lv-tocpop{display:none}
main.has-toc{display:block!important}
main .toc{position:fixed!important;right:16px;bottom:68px;top:auto!important;z-index:29;width:min(320px,calc(100vw - 32px));max-height:min(60vh,520px)!important;overflow-y:auto;padding:12px 6px!important;background:var(--paper);border:1px solid var(--rule);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18)}
main .toc:not(.open){display:none!important}
.toc-fab:not([hidden]){display:block!important}
body.lv-wide .toc-fab,body.lv-wide main .toc{display:none!important}
.lv-tocpop{display:grid;gap:2px;padding:8px;margin:-6px 0 16px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);font-size:14px}
.lv-tocpop a{padding:5px 8px;border-radius:6px;color:var(--ink);text-decoration:none;display:flex;gap:8px}
.lv-tocpop a:hover{background:var(--tint)}.lv-tocpop a.seen::after{content:"✓";color:var(--ll-ok);margin-left:auto}
/* callout icons for both handbook styles */
.call.analogy>.tag::before,.call.info>.tag::before,.call.warn>.tag::before,.call.risk>.tag::before,.call.deep>.tag::before,.call.start>.tag::before,.call.try>.tag::before{content:"";display:inline-block;width:13px;height:13px;margin-right:5px;vertical-align:-2px;background:currentColor;-webkit-mask:var(--lv-m) center/contain no-repeat;mask:var(--lv-m) center/contain no-repeat}
blockquote.analogy,blockquote.info,blockquote.warn,blockquote.deep{position:relative;padding-left:46px!important}
blockquote.analogy::before,blockquote.info::before,blockquote.warn::before,blockquote.deep::before{content:"";position:absolute;left:14px;top:14px;width:20px;height:20px;background:var(--lv-ic,var(--ink-2));-webkit-mask:var(--lv-m) center/contain no-repeat;mask:var(--lv-m) center/contain no-repeat}
.call.analogy,blockquote.analogy{--lv-m:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${I.bulb}</svg>`)}");--lv-ic:var(--ll-acc)}
.call.info,blockquote.info,.call.start{--lv-m:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${I.info}</svg>`)}");--lv-ic:var(--ll-info)}
.call.warn,.call.risk,blockquote.warn{--lv-m:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${I.alert}</svg>`)}");--lv-ic:var(--ll-warn)}
.call.deep,blockquote.deep{--lv-m:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${I.search}</svg>`)}")}
.call.try{--lv-m:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${I.gear}</svg>`)}")}
/* diagrams: softer node corners and a caption for added figures */
.mmd-wrap svg .node rect,figure.mmd svg .node rect,.mmd-wrap svg rect.actor,figure.mmd svg rect.actor{rx:8px;ry:8px}
.lv-figcap{display:flex;align-items:center;gap:8px;margin:22px 0 -10px;font-size:13px;font-weight:700;color:var(--ink-2)}
.lv-figcap .new{font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;background:var(--ll-acc-soft);color:var(--ll-acc)}
/* route map in the 学习台 */
.lv-route{display:grid;gap:0;margin:0;padding:0;list-style:none}
.lv-route li{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:10px;align-items:center;position:relative;padding:6px 0;max-width:none}
.lv-route li::before{content:"";position:absolute;left:19px;top:-50%;bottom:50%;width:2px;background:var(--rule)}
.lv-route li:first-child::before{display:none}
.lv-route li.done::before{background:var(--ll-ok)}
.lv-route .st{position:relative;width:40px;height:40px;display:grid;place-items:center;color:var(--ink-2)}
.lv-route .st svg.ring{position:absolute;inset:0}
.lv-route li.cur .st{color:var(--ll-acc)}
.lv-route .nm{font-size:13.5px;line-height:1.4;min-width:0}
.lv-route li.cur .nm{font-weight:700}
.lv-route .ct{font-family:var(--f-mono,monospace);font-size:12px;color:var(--ink-2);font-variant-numeric:tabular-nums}
`;

/* ---------- cover illustration ---------- */
function art(seed) {
  // a faint chain of blocks drifting across the banner, seeded so each chapter differs slightly
  let r = seed; const rnd = () => (r = (r * 1103515245 + 12345) >>> 0) / 4294967296;
  let g = '';
  const n = 7, y0 = 40 + rnd() * 40;
  let px = null, py = null;
  for (let i = 0; i < n; i++) {
    const x = 330 + i * 70 + rnd() * 16, y = y0 + Math.sin(i * 0.9 + rnd()) * 26, s = 22 + rnd() * 10;
    if (px !== null) g += `<path d="M${px + 12} ${py}L${x - s / 2} ${y}" stroke="currentColor" stroke-opacity=".28" stroke-width="1.5" stroke-dasharray="4 5"/>`;
    g += `<g transform="translate(${x} ${y})" opacity="${0.12 + i * 0.03}"><path d="M0 ${-s / 2} ${s / 2} ${-s / 4}v${s / 2}L0 ${s / 2} ${-s / 2} ${s / 4}v${-s / 2}z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.4"/><path d="M${-s / 2} ${-s / 4} 0 0 ${s / 2} ${-s / 4}M0 0v${s / 2}" stroke="currentColor" stroke-width="1.2" fill="none"/></g>`;
    px = x; py = y;
  }
  let dots = '';
  for (let i = 0; i < 26; i++) dots += `<circle cx="${(rnd() * 820).toFixed(0)}" cy="${(rnd() * 170).toFixed(0)}" r="${(1 + rnd() * 1.6).toFixed(1)}" fill="currentColor" fill-opacity="${(0.08 + rnd() * 0.12).toFixed(2)}"/>`;
  return `<svg viewBox="0 0 820 170" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><defs><linearGradient id="lvg${seed % 997}" x1="0" x2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset="1" stop-color="currentColor" stop-opacity=".10"/></linearGradient></defs><rect width="820" height="170" fill="url(#lvg${seed % 997})"/>${dots}${g}</svg>`;
}
function facts(root) {
  const text = (root.textContent || '').replace(/\s+/g, '').length;
  const mins = Math.max(3, Math.round(text / 450));
  const figs = $$('.mmd-wrap, figure.mmd', root).length;
  const labs = $$('.lab, .lab-slot, a.lab-link, [data-lab]', root).length;
  const qs = $$('.quiz', root).length + $$('.ll-ans', root).length;
  return [['clock', `约 ${mins} 分钟`], figs && ['map', `${figs} 张图`], labs && ['gear', `${labs} 个实验`], qs && ['target', `${qs} 道题`]].filter(Boolean);
}
function cover(root, ch) {
  if ($('.lv-cover', root)) return;
  const h1 = $('h1', root); if (!h1) return;
  const key = ch.group || ch.title, hue = HUES[hash(key) % HUES.length];
  const icons = pickIcons(ch.title, ch.group);
  const el = document.createElement('div'); el.className = 'lv-cover'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', `章节题图：${ch.title}`);
  el.style.setProperty('--lv-c', `var(${hue})`); el.style.setProperty('--lv-soft', `var(${hue}-soft, var(--tint))`);
  el.innerHTML = `<div class="lv-art">${art(hash(ch.id))}</div>
    <div class="lv-txt"><div class="lv-eye">${esc(ch.group || '')}</div>
      <div class="lv-facts">${facts(root).map(([k, t]) => `<span>${svgIcon(k, 14, 2)}${t}</span>`).join('')}</div></div>
    <div class="lv-hero"><div class="lv-tile">${svgIcon(icons[0], 46, 1.5)}</div><div class="lv-sat a">${svgIcon(icons[1], 22)}</div><div class="lv-sat b">${svgIcon(icons[2], 22)}</div></div>`;
  h1.before(el);
}

/* ---------- section map + reading progress ---------- */
let autoDone = null, spy = null, heads = [], seen = new Set(), tocFor = null;
function slug(h, i) { if (!h.id) h.id = 'lv-s' + i + '-' + hash(h.textContent).toString(36); return h.id; }
function sectionMap(root, ch) {
  heads = $$(':scope > h2, :scope > section > h2, h2', root).filter((h, i, a) => a.indexOf(h) === i && !h.closest('.ll-card, .lab, .quiz') && h.textContent.trim());
  if (tocFor !== ch.id) { seen = new Set(); tocFor = ch.id; }
  let toc = $('.lv-toc');
  if (!toc) { toc = document.createElement('nav'); toc.className = 'lv-toc'; toc.setAttribute('aria-label', '本章地图'); document.body.appendChild(toc); }
  toc.hidden = heads.length < 2;
  toc.innerHTML = `<div class="k">本章地图</div><ol>${heads.map((h, i) => `<li data-i="${i}"><a href="#${esc(ch.id)}" data-lv-go="${slug(h, i)}">${esc(h.textContent.replace(/^\d+[.、]\s*/, ''))}</a></li>`).join('')}</ol>`;
  const strip = $('.ll-strip', root);
  if (strip && heads.length >= 2 && !$('.lv-tocbtn', strip)) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'll-btn lv-tocbtn'; b.innerHTML = `${svgIcon('layersDeep', 15, 2)}本章 ${heads.length} 节`;
    b.addEventListener('click', () => {
      let p = $('.lv-tocpop', root);
      if (p) { p.remove(); return; }
      p = document.createElement('div'); p.className = 'lv-tocpop';
      p.innerHTML = heads.map((h, i) => `<a href="#${esc(ch.id)}" data-lv-go="${h.id}" class="${seen.has(i) ? 'seen' : ''}">${esc(h.textContent)}</a>`).join('');
      strip.after(p);
    });
    strip.insertBefore(b, $('.ll-sp', strip));
  }
  fitToc(); onScroll();
}
function fitToc() {
  const r = curRoot && curRoot.getBoundingClientRect();
  document.body.classList.toggle('lv-wide', !!(r && r.width && window.innerWidth - r.right >= 228));
}
function onScroll() {
  const bar = $('.lv-prog i');
  const root = curRoot; if (!root || !bar) return;
  const r = root.getBoundingClientRect(), vh = window.innerHeight;
  const p = Math.min(1, Math.max(0, (vh * 0.35 - r.top) / Math.max(1, r.height - vh * 0.5)));
  bar.style.width = (curId ? p * 100 : 0) + '%';
  if (curId && p >= 0.97 && autoDone !== curId && r.height > vh * 1.2) { autoDone = curId; window.LearnLayer && LearnLayer.autoRead && LearnLayer.autoRead(curId); }
  let on = -1; heads.forEach((h, i) => { if (h.getBoundingClientRect().top < vh * 0.35) { on = i; seen.add(i); } });
  $$('.lv-toc li').forEach((li, i) => { li.classList.toggle('on', i === on); li.classList.toggle('seen', seen.has(i) && i !== on); });
}

/* ---------- route map (rendered into the 学习台 overview) ---------- */
function ringSvg(p, cls) {
  const r = 17, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" fill="var(--paper)" stroke="var(--tint)" stroke-width="3.5"/><circle cx="20" cy="20" r="${r}" fill="none" stroke="var(${cls})" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 20 20)"/></svg>`;
}
function routeHtml(chs, S, curGroup) {
  const groups = [];
  chs.forEach(c => { let g = groups.find(x => x.name === (c.group || '全部')); if (!g) groups.push(g = { name: c.group || '全部', list: [] }); g.list.push(c); });
  return `<div class="ll-sec"><h4>学习路线</h4><ol class="lv-route">${groups.map(g => {
    const m = g.list.filter(c => (S.ch[c.id] || {}).s === 2).length, rd = g.list.filter(c => (S.ch[c.id] || {}).s === 1).length, rd3 = g.list.filter(c => (S.ch[c.id] || {}).s === 3).length;
    const p = m / g.list.length, done = m === g.list.length;
    const icon = pickIcons(g.name, '')[0];
    return `<li class="${done ? 'done' : ''} ${g.name === curGroup ? 'cur' : ''}"><span class="st">${ringSvg(p, done ? '--ll-ok' : '--ll-acc')}<span style="position:relative">${svgIcon(icon, 16, 2)}</span></span><span class="nm">${esc(g.name)}${rd3 ? `<span class="ll-meta"> · 已读 ${rd3}</span>` : ''}${rd ? `<span class="ll-meta"> · 在读 ${rd}</span>` : ''}</span><span class="ct">${m}/${g.list.length}</span></li>`;
  }).join('')}</ol></div>`;
}

/* ---------- wiring ---------- */
let curRoot = null, curId = null;
function apply() {
  const api = window.LearnLayer && LearnLayer.ctx && LearnLayer.ctx(); if (!api) return;
  const { root, cur, chapters } = api;
  curRoot = root; curId = cur ? cur.id : null;
  const toc = $('.lv-toc');
  if (!root || !cur) { if (toc) toc.hidden = true; onScroll(); return; }
  const meta = chapters.find(c => c.id === cur.id) || {};
  cover(root, { id: cur.id, title: cur.title, group: meta.group });
  sectionMap(root, cur);
}
function init() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const pb = document.createElement('div'); pb.className = 'lv-prog'; pb.innerHTML = '<i></i>'; const hb = $('.bar'); if (hb) { if (getComputedStyle(hb).position === 'static') hb.style.position = 'relative'; hb.appendChild(pb); }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lv-go]'); if (!a) return;
    e.preventDefault(); const h = document.getElementById(a.dataset.lvGo);
    if (h) { const y = h.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  });
  window.addEventListener('resize', () => { fitToc(); onScroll(); }, { passive: true });
  window.addEventListener('scroll', () => { if (!spy) spy = requestAnimationFrame(() => { spy = null; onScroll(); }); }, { passive: true });
  if (window.LearnLayer && LearnLayer.onSync) LearnLayer.onSync(apply);
  if (window.LearnLayer && LearnLayer.addHome) LearnLayer.addHome((chs, S, cur) => routeHtml(chs, S, cur));
  apply();
}
window.LearnVisual = { icons: I, svgIcon };
init();
})();
