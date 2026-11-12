// Export narration scripts (Markdown) from every video deck.
// Usage: node export-scripts.mjs   → writes ../scripts/EPxx-*.md and ../scripts/README.md
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const slidesDir = path.join(here, '..', 'slides');
const outDir = path.join(here, '..', 'scripts');
fs.mkdirSync(outDir, { recursive: true });
const decks = fs.readdirSync(slidesDir).filter(f => /^(A\d\d|EP\d\d|C\d\d)-.*\.html$/.test(f)).sort((a, b) => { const o = f => ({ A: 0, E: 1, C: 2 })[f[0]]; return o(a) - o(b) || a.localeCompare(b); });

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, headless: true } : { channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const index = [];
const CPM = 290; // spoken characters per minute incl. pauses (measured across the 17 rendered episodes)

for (const f of decks) {
  await page.goto('file://' + path.join(slidesDir, f) + '?render=1');
  await page.waitForFunction(() => window.deck);
  const data = await page.evaluate(() => {
    const clean = s => s.replace(/\s+/g, ' ').trim();
    return {
      ep: deck.ep, title: deck.title,
      scenes: [...document.querySelectorAll('section.scene')].map((el, i) => {
        const steps = deck.scenes[i].steps;
        const visuals = steps.map((_, k) => [...el.querySelectorAll(`[data-step="${k}"]`)]
          .filter(n => !n.parentElement.closest(`[data-step="${k}"]`))
          .map(n => clean(n.innerText || n.textContent)).filter(Boolean).map(s => s.length > 70 ? s.slice(0, 70) + '…' : s));
        const heading = clean((el.querySelector('h1,h2') || {}).innerText || '');
        return { title: deck.scenes[i].title, heading, steps, visuals, animated: !!el.dataset.onstep };
      }),
    };
  });
  const chars = data.scenes.reduce((a, s) => a + s.steps.join('').length, 0);
  const mins = (chars / CPM).toFixed(1);
  let md = `# ${data.ep} ${data.title}\n\n`;
  md += `> 口播约 ${chars} 字，预计 ${mins} 分钟。画面：[slides/${f}](../slides/${f})（浏览器打开，→ 键逐步播放，N 键显示讲稿）。成片：\`output/${f.replace('.html', '.mp4')}\`。\n\n`;
  md += `## 场景目录\n\n` + data.scenes.map((s, i) => `${i + 1}. ${s.title}${s.heading ? ' · ' + s.heading : ''}`).join('\n') + '\n\n';
  data.scenes.forEach((s, i) => {
    md += `## 场景 ${i + 1}：${s.title}\n\n`;
    if (s.heading) md += `**画面标题**：${s.heading}${s.animated ? '（逐步动画）' : ''}\n\n`;
    s.steps.forEach((t, k) => {
      const v = s.visuals[k];
      md += `**[${i + 1}.${k}]** ${t}\n`;
      if (v && v.length) md += `\n> 画面：${v.join(' ｜ ')}\n`;
      md += '\n';
    });
  });
  const out = f.replace('.html', '.md');
  fs.writeFileSync(path.join(outDir, out), md);
  index.push({ ep: data.ep, title: data.title, file: out, chars, mins, scenes: data.scenes.length });
  console.log(out, chars, mins);
}
await browser.close();

let idx = '# 口播稿目录\n\n由 `tools/export-scripts.mjs` 从讲解页自动生成。`[场景.步骤]` 编号与讲解页的步骤一一对应，真人录制时可按编号对齐画面。\n\n| 集 | 标题 | 场景 | 字数 | 预计时长 |\n|---|---|---|---|---|\n';
idx += index.map(x => `| ${x.ep} | [${x.title}](${x.file}) | ${x.scenes} | ${x.chars} | ${x.mins} 分钟 |`).join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'README.md'), idx);
