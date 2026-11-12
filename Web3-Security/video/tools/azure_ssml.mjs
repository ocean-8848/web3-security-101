// Azure AI Speech engine for render.mjs (--engine azure): SSML per sentence with light/heavy, fast/slow variation.
//
// Env:
//   AZURE_SPEECH_KEY      (required) Speech resource key
//   AZURE_SPEECH_REGION   (default southeastasia; HD Flash voices: eastus / westeurope / southeastasia / chinanorth3)
//   AZURE_TTS_VOICE       (default zh-CN-Yunxi:DragonHDFlashLatestNeural)
//   AZURE_TTS_PROFILE     mixed (default) | chat | news | flat — how sentence styles vary, see STYLE below
//   AZURE_TTS_STYLE       override the base style (default chat = lively, conversational)
//
// Helpers:
//   node azure_ssml.mjs --voices yunxi          list voices whose name matches, with their styles
//   node azure_ssml.mjs --audition [outDir]     synthesize one sample paragraph in every profile, to pick by ear
//   node azure_ssml.mjs --ssml "一句话？"         print the SSML that would be sent
//
// Why it sounds less flat:
//   - Sentence role decides the style: opening / summary lines are brighter, warnings and conclusions are firmer,
//     questions stay conversational. (HD voices pick their own prosody from text + style.)
//   - Standard (non-HD) voices also get <prosody>: questions rise, key lines slow down, asides speed up.
//   - Pauses after each caption follow punctuation (see pauseAfter), so rhythm is not one fixed gap.
// Results are cached in tools/.tts-cache/ (by SSML hash), so re-rendering after a visual fix costs nothing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const here = path.dirname(new URL(import.meta.url).pathname);
const CACHE = path.join(here, '.tts-cache');
const env = k => process.env[k] || '';
const REGION = () => env('AZURE_SPEECH_REGION') || 'southeastasia';
const isHD = v => /DragonHD/i.test(v);

const RX = {
  question: /[？?]\s*$|[吗呢][。，]?$/,
  warn: /注意|千万|一定要|切记|必须|不要|别忘|红线|致命|教训是/,
  key: /记住|关键在|核心是|结论|一句话|换句话说|本质上|根本原因/,
  aside: /比如|例如|举个例子|顺便|其实|当然|打个比方|想象一下/,
  number: /\d/,
};

export function roleOf(text, ctx = {}) {
  const t = text.trim();
  if (ctx.scene === 0 && ctx.step === 0) return 'open';
  if (ctx.scenes && ctx.scene === ctx.scenes - 1) return 'close';
  if (RX.question.test(t)) return 'question';
  if (RX.warn.test(t)) return 'warn';
  if (RX.key.test(t) || t.length <= 7) return 'key';
  if (RX.aside.test(t)) return 'aside';
  if ((t.match(/\d/g) || []).length >= 4) return 'number';
  return 'plain';
}

// style per role, per profile (Yunxi HD Flash styles: chat, cheerful, news, strict, voice-assistant, ...)
const STYLE = {
  mixed: { open: 'cheerful', close: 'cheerful', question: 'chat', warn: 'strict', key: 'news', aside: 'chat', number: 'news', plain: 'chat' },
  chat: { open: 'chat', close: 'chat', question: 'chat', warn: 'chat', key: 'chat', aside: 'chat', number: 'chat', plain: 'chat' },
  news: { open: 'chat', close: 'chat', question: 'chat', warn: 'news', key: 'news', aside: 'chat', number: 'news', plain: 'news' },
  flat: {},
};
// standard (non-HD) Yunxi: chat, cheerful, serious, narration-relaxed, newscast, assistant, ...
const STD_STYLE = { strict: 'serious', news: 'narration-relaxed', 'voice-assistant': 'assistant' };
// prosody per role, only for standard voices (HD voices ignore / reject <prosody>)
const PROS = {
  open: { rate: '+2%', pitch: '+4%' }, close: { rate: '-2%', pitch: '+2%' },
  question: { rate: '-2%', pitch: '+7%' }, warn: { rate: '-8%', pitch: '-3%' }, key: { rate: '-10%', pitch: '-2%' },
  aside: { rate: '+8%', pitch: '+1%' }, number: { rate: '-6%', pitch: '+0%' }, plain: { rate: '+3%', pitch: '+0%' },
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function buildSsml(text, ctx = {}, o = {}) {
  const voice = o.voice || env('AZURE_TTS_VOICE') || 'zh-CN-Yunxi:DragonHDFlashLatestNeural';
  const profile = o.profile || env('AZURE_TTS_PROFILE') || 'mixed';
  const role = roleOf(text, ctx);
  let style = (STYLE[profile] || STYLE.mixed)[role];
  if (env('AZURE_TTS_STYLE') && (!style || style === 'chat')) style = env('AZURE_TTS_STYLE');
  if (profile === 'flat') style = '';
  if (style && !isHD(voice)) style = STD_STYLE[style] || style;   // standard YunxiNeural uses different style names
  let body = esc(text.trim());
  if (o.breaks !== false) body = body.replace(/([：:])(?=\S)/g, '$1<break time="220ms"/>').replace(/——/g, '<break time="180ms"/>');
  if (!isHD(voice)) {
    const p = PROS[role];
    body = `<prosody rate="${p.rate}" pitch="${p.pitch}">${body}</prosody>`;
  }
  if (style && o.style !== false) {
    const deg = isHD(voice) ? '' : ` styledegree="${role === 'warn' || role === 'key' ? 1.4 : 1.15}"`;
    body = `<mstts:express-as style="${style}"${deg}>${body}</mstts:express-as>`;
  }
  return { role, style, ssml: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="zh-CN"><voice name="${voice}">${body}</voice></speak>` };
}

async function post(ssml) {
  const key = env('AZURE_SPEECH_KEY');
  if (!key) throw new Error('AZURE_SPEECH_KEY is not set');
  const r = await fetch(env("AZURE_TTS_ENDPOINT") || `https://${REGION()}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'riff-48khz-16bit-mono-pcm', 'User-Agent': 'contract-video-render' },
    body: ssml,
  });
  if (!r.ok) { const e = new Error(`azure ${r.status}: ${(await r.text()).slice(0, 200)}`); e.status = r.status; throw e; }
  return Buffer.from(await r.arrayBuffer());
}

// Synthesize text to a WAV file. Falls back to plainer SSML if the voice rejects breaks or styles.
export async function azureTts(text, out, ctx = {}) {
  const tries = [{}, { breaks: false }, { breaks: false, style: false }];
  let lastErr;
  for (const variant of tries) {
    const { ssml } = buildSsml(text, ctx, { ...ctx, ...variant });
    const f = path.join(CACHE, crypto.createHash('sha1').update(REGION() + ssml).digest('hex') + '.wav');
    if (fs.existsSync(f) && fs.statSync(f).size > 1000) { fs.copyFileSync(f, out); return; }
    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        const buf = await post(ssml);
        if (buf.length < 1000) throw Object.assign(new Error('azure: empty audio'), { status: 400 });
        fs.mkdirSync(CACHE, { recursive: true });
        fs.writeFileSync(f, buf); fs.copyFileSync(f, out);
        return;
      } catch (e) {
        lastErr = e;
        if (e.status === 400) break;                       // SSML not accepted → try a plainer variant
        if (e.status === 401 || e.status === 403) throw e;  // wrong key / region
        await new Promise(r => setTimeout(r, Math.min(attempt * 2000, 20000)));  // 429 / 5xx / network
      }
    }
  }
  throw lastErr;
}

// edge-tts (free, no key) cannot take styles, only --rate / --pitch (Hz) / --volume per request.
// Same roles, mapped to those three knobs; Yunxi's speaking pitch is ~120 Hz, so 1% ≈ 1.2 Hz.
const EDGE_VOL = { open: '+4%', close: '+0%', question: '+2%', warn: '+10%', key: '+8%', aside: '-6%', number: '+0%', plain: '+0%' };
export function edgeProsody(text, ctx = {}, base = {}) {
  const role = roleOf(text, ctx);
  const p = PROS[role];
  const add = (a, b) => { const n = parseFloat(a || '0') + parseFloat(b || '0'); return (n >= 0 ? '+' : '') + Math.round(n); };
  return { role, rate: add(base.rate, p.rate) + '%', pitch: add(base.pitch, parseFloat(p.pitch) * 1.2) + 'Hz', volume: EDGE_VOL[role] };
}

// Seconds of silence after a caption line.
export function pauseAfter(line, lastInStep, lastInScene) {
  const t = (line || '').trim();
  let g = /[？?]$/.test(t) ? 0.55 : /[。！!]$/.test(t) ? 0.36 : /[；;]$/.test(t) ? 0.3 : 0.16;  // ，：、 = mid-sentence split
  if (lastInStep) g += 0.42;   // picture changes: give the eye a beat
  if (lastInScene) g += 0.45;  // new chapter
  return g;
}

// ---- CLI helpers ----
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === '--voices') {
    const r = await fetch(`https://${REGION()}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { headers: { 'Ocp-Apim-Subscription-Key': env('AZURE_SPEECH_KEY') } });
    if (!r.ok) { console.error('azure', r.status, await r.text()); process.exit(1); }
    const q = (arg || 'yunxi').toLowerCase();
    for (const v of await r.json()) if ((v.ShortName + ' ' + (v.DisplayName || '')).toLowerCase().includes(q)) console.log(v.ShortName, '|', v.LocalName, '|', (v.StyleList || []).join(','));
  } else if (cmd === '--ssml') {
    console.log(buildSsml(arg || '注意：这里先转账，后改余额。').ssml);
  } else if (cmd === '--audition') {
    const out = path.resolve(arg || path.join(here, '..', 'output', 'audition'));
    fs.mkdirSync(out, { recursive: true });
    const para = ['大家好，这一集我们讲重入攻击。', '先问一个问题：合约把钱转出去的那一刻，账本改了吗？',
      '没有。', '注意，攻击者就卡在这个空档里，再取一次钱。', '举个例子，金库里有 100 ETH，你只存了 1 ETH。',
      '所以，记住一句话：先改账，再转钱。'];
    const voices = [env('AZURE_TTS_VOICE') || 'zh-CN-Yunxi:DragonHDFlashLatestNeural', 'zh-CN-YunxiNeural'];
    for (const voice of voices) for (const profile of ['mixed', 'chat', 'news']) {
      const name = `${voice.replace(/[^A-Za-z0-9]+/g, '_')}-${profile}`;
      const parts = [];
      for (let i = 0; i < para.length; i++) {
        const f = path.join(out, `${name}-${i}.wav`);
        try { await azureTts(para[i], f, { voice, profile, scene: i === 0 ? 0 : 1, step: 0, scenes: 9 }); parts.push(f); }
        catch (e) { console.error(name, e.message); break; }
      }
      if (parts.length === para.length) {
        const { execFileSync } = await import('node:child_process');
        const list = path.join(out, name + '.txt');
        fs.writeFileSync(list, parts.map(f => `file '${f}'`).join('\n'));
        execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c:a', 'libmp3lame', '-q:a', '3', path.join(out, name + '.mp3')]);
        parts.forEach(f => fs.rmSync(f)); fs.rmSync(list);
        console.log('wrote', path.join(out, name + '.mp3'));
      }
    }
  } else {
    console.log('usage: node azure_ssml.mjs --voices yunxi | --audition [dir] | --ssml "text"');
  }
}
