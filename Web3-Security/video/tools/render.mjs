// Render a video deck to MP4 with synthesized Chinese narration and captions.
// Usage: node render.mjs ../slides/EP01-xxx.html [--engine azure|edge|kokoro|say] [--voice NAME] [--rate R] [--pitch P] [--out ../output]
//   azure:          Azure AI Speech REST API (needs AZURE_SPEECH_KEY + AZURE_SPEECH_REGION), default voice
//                   zh-CN-Yunxi:DragonHDFlashLatestNeural, style "chat"; per-sentence style + pauses, see azure_ssml.mjs
//   edge (default): Microsoft neural voices via `edge-tts` (free, no key, needs network), zh-CN-YunxiNeural "lively"
//                   (+5% rate, +3Hz pitch) with per-sentence rate/pitch/volume — same voice as the CEX series
//   kokoro:         offline neural voice via sherpa-onnx (tools/tts_kokoro.py), male speaker 90; see README §4
//   say:            macOS voices, e.g. --engine say --voice Tingting --rate 200
// Needs: Chrome (or CHROME_PATH=/path/to/chromium), ffmpeg/ffprobe, and the chosen TTS engine.
import { chromium } from 'playwright-core';
import { execFileSync, spawn } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { azureTts, pauseAfter, edgeProsody } from './azure_ssml.mjs';
const EDGE_VARY = process.env.EDGE_PROSODY !== '0';  // edge: vary rate / pitch / volume by sentence role (EDGE_PROSODY=0 = flat)

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const deckPath = path.resolve(args.find(a => a.endsWith('.html')));
const ENGINE = opt('--engine', 'edge');
const VOICE = opt('--voice', ENGINE === 'edge' ? 'zh-CN-YunxiNeural' : ENGINE === 'azure' ? (process.env.AZURE_TTS_VOICE || 'zh-CN-Yunxi:DragonHDFlashLatestNeural') : 'Tingting');
// edge default = CEX voice sample "D-yunxi-lively": Yunxi ~5% faster and ~3 Hz higher than the calm sample
const RATE = opt('--rate', ENGINE === 'edge' ? (process.env.EDGE_RATE || '+5%') : '200');
const PITCH = opt('--pitch', ENGINE === 'edge' ? (process.env.EDGE_PITCH || '+3Hz') : '+0Hz');
const OUT = path.resolve(opt('--out', path.join(path.dirname(deckPath), '..', 'output')));
const GAP = 0.32;        // silence after each sentence (s)
const STEP_GAP = 0.55;   // extra silence when the picture changes (s)
const base = path.basename(deckPath, '.html');
const work = path.join(OUT, '.work', base);
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });

const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const dur = f => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

// Split narration into caption-sized sentences.
function sentences(text) {
  const parts = text.match(/[^。！？；!?;]+[。！？；!?;]?/g) || [];
  const out = [];
  for (let p of parts.map(s => s.trim()).filter(Boolean)) {
    while (p.length > 56) {                       // break long sentences at a comma near the middle
      const cut = [...p.slice(0, 56).matchAll(/[，,、：:]/g)].map(m => m.index).filter(i => i > 12).pop();
      if (cut === undefined) break;
      out.push(p.slice(0, cut + 1)); p = p.slice(cut + 1).trim();
    }
    if (p) out.push(p);
  }
  return out;
}
// Text sent to TTS: drop symbols the voice reads badly.
const speakable = s => s.replace(/[“”"「」『』《》【】]/g, '').replace(/→/g, '，到').replace(/×/g, '乘以').replace(/≥/g, '大于等于').replace(/≤/g, '小于等于');

// Kokoro worker: one long-lived Python process, one JSON request per sentence.
let kok = null;
function kokoroStart() {
  const py = spawn(process.env.PYTHON || 'python3', [path.join(path.dirname(new URL(import.meta.url).pathname), 'tts_kokoro.py')], { stdio: ['pipe', 'pipe', 'inherit'] });
  const rl = readline.createInterface({ input: py.stdout });
  const waiting = [];
  rl.on('line', l => { let m; try { m = JSON.parse(l); } catch { return; } const w = waiting.shift(); if (w) w(m); });
  const call = req => new Promise(res => { waiting.push(res); if (req) py.stdin.write(JSON.stringify(req) + '\n'); });
  kok = { py, call, ready: call(null) };
}
async function ttsKokoro(text, wav) {
  if (!kok) kokoroStart();
  await kok.ready;
  const raw = wav.replace(/\.wav$/, '.raw.wav');
  const r = await kok.call({ text, out: raw });
  if (!r.ok) throw new Error('kokoro: ' + r.err);
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse';
  execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', raw, '-af', trim, '-ar', '44100', '-ac', '1', wav]);
  fs.rmSync(raw);
}

// Synthesize one sentence to a 44.1 kHz mono WAV.
async function tts(text, wav, ctx = {}) {
  if (ENGINE === 'kokoro') return ttsKokoro(text, wav);
  if (ENGINE === 'azure') {
    const raw = wav.replace(/\.wav$/, '.raw.wav');
    await azureTts(text, raw, { voice: VOICE, ...ctx });
    const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse';
    execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', raw, '-af', trim, '-ar', '44100', '-ac', '1', wav]);
    fs.rmSync(raw);
    return;
  }
  if (ENGINE === 'say') {
    execFileSync('say', ['-v', VOICE, '-r', RATE, '--data-format=LEI16@44100', '--channels=1', '-o', wav, text]);
    return;
  }
  const mp3 = wav.replace(/\.wav$/, '.mp3');
  for (let attempt = 1; ; attempt++) {
    try {
      const pr = EDGE_VARY ? edgeProsody(text, ctx, { rate: RATE, pitch: PITCH }) : { rate: RATE, pitch: PITCH, volume: '+0%' };
      execFileSync('edge-tts', ['-v', VOICE, `--rate=${pr.rate}`, `--pitch=${pr.pitch}`, `--volume=${pr.volume}`, '-t', text, '--write-media', mp3], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
      if (fs.statSync(mp3).size > 0) break;
    } catch (e) {
      if (attempt >= 12) throw e;   // ~3 minutes of retries covers short network/DNS outages
    }
    execFileSync('sleep', [String(Math.min(attempt * 3, 30))]);
  }
  // Trim the silence the service adds at both ends; the renderer adds its own pauses (GAP, STEP_GAP).
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse';
  execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', mp3, '-af', trim, '-ar', '44100', '-ac', '1', wav]);
  fs.rmSync(mp3);
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, headless: true } : { channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + deckPath + '?render=1');
await page.waitForFunction(() => window.deck && window.deck.scenes);
await page.evaluate(() => document.fonts.ready);
const deck = await page.evaluate(() => ({ ep: deck.ep, title: deck.title, scenes: deck.scenes, settle: deck.settleMs }));

execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(GAP), path.join(work, 'gap.wav')]);
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(STEP_GAP), path.join(work, 'stepgap.wav')]);

const segs = []; // {img, wav, text, dur}
let n = 0;
for (let si = 0; si < deck.scenes.length; si++) {
  const sc = deck.scenes[si];
  for (let st = 0; st < sc.steps.length; st++) {
    await page.evaluate(([a, b]) => { deck.caption(''); deck.go(a, b); }, [si, st]);
    await page.waitForTimeout(deck.settle);
    const lines = sentences(sc.steps[st]);
    if (!lines.length) lines.push('');
    for (let li = 0; li < lines.length; li++) {
      const id = String(++n).padStart(4, '0');
      await page.evaluate(t => deck.caption(t), lines[li]);
      const img = path.join(work, id + '.png');
      await page.screenshot({ path: img });
      const wav = path.join(work, id + '.wav');
      if (lines[li]) {
        await tts(ENGINE === 'kokoro' ? lines[li] : speakable(lines[li]), wav,
          { scene: si, scenes: deck.scenes.length, sceneTitle: sc.title, step: st, line: li, lines: lines.length });
      } else {
        execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '1.5', wav]);
      }
      // Pauses follow the punctuation (comma < full stop < question), plus a beat when the picture changes.
      const last = li === lines.length - 1;
      const gap = ENGINE === 'azure' || (ENGINE === 'edge' && EDGE_VARY) ? pauseAfter(lines[li], last, last && st === sc.steps.length - 1) : (last ? GAP + STEP_GAP : GAP);
      segs.push({ img, wav, text: lines[li], dur: dur(wav), gap, scene: sc.title });
    }
  }
  process.stdout.write(`  scene ${si + 1}/${deck.scenes.length} ${sc.title}\n`);
}
await browser.close();
if (kok) kok.py.stdin.end();

// Audio track: segment + gap(s)
const gapWav = {};
const gapFile = g => {
  const k = g.toFixed(2);
  if (!gapWav[k]) { gapWav[k] = path.join(work, `gap-${k}.wav`); execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', k, gapWav[k]]); }
  return gapWav[k];
};
const alist = segs.map(s => `file '${s.wav}'\nfile '${gapFile(s.gap)}'\n`).join('');
fs.writeFileSync(path.join(work, 'audio.txt'), alist);
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'audio.txt'), '-c', 'pcm_s16le', path.join(work, 'audio-raw.wav')]);
// Even out loudness across engines and episodes (EBU R128, -16 LUFS; kokoro output is ~10 dB quieter than edge).
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', path.join(work, 'audio-raw.wav'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', path.join(work, 'audio.wav')]);

// Video track: each frame held for its sentence + gap
let vlist = 'ffconcat version 1.0\n';
for (const s of segs) vlist += `file '${s.img}'\nduration ${(s.dur + s.gap).toFixed(3)}\n`;
vlist += `file '${segs[segs.length - 1].img}'\n`;
fs.writeFileSync(path.join(work, 'video.txt'), vlist);

// Subtitles (SRT)
const ts = t => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
let t = 0, srt = '', k = 0, chapters = [], lastScene = null;
for (const s of segs) {
  if (s.scene !== lastScene) { chapters.push([t, s.scene]); lastScene = s.scene; }
  if (s.text) srt += `${++k}\n${ts(t)} --> ${ts(t + s.dur)}\n${s.text}\n\n`;
  t += s.dur + s.gap;
}
fs.mkdirSync(OUT, { recursive: true });
const srtPath = path.join(OUT, base + '.srt');
fs.writeFileSync(srtPath, srt);

// Chapter metadata for players that support it
let meta = ';FFMETADATA1\ntitle=' + `${deck.ep} ${deck.title}` + '\n';
chapters.forEach(([start, title], i) => {
  const end = i + 1 < chapters.length ? chapters[i + 1][0] : t;
  meta += `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(start * 1000)}\nEND=${Math.round(end * 1000)}\ntitle=${title}\n`;
});
fs.writeFileSync(path.join(work, 'meta.txt'), meta);

const mp4 = path.join(OUT, base + '.mp4');
// Pass 1: encode picture + narration. Pass 2: add soft subtitles and chapters by stream copy.
// (Mixing the SRT input into the encode pass makes ffmpeg stall.)
const av = path.join(work, 'av.mp4');
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error',
  '-f', 'concat', '-safe', '0', '-i', path.join(work, 'video.txt'),
  '-i', path.join(work, 'audio.wav'),
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '20', '-r', '15', '-g', '150', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '96k', av]);  // still frames: 15 fps + mono 96k keeps a 15-min episode well under 30 MB
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error',
  '-i', av, '-i', srtPath, '-i', path.join(work, 'meta.txt'),
  '-map', '0:v', '-map', '0:a', '-map', '1:s', '-map_metadata', '2', '-map_chapters', '2',
  '-c', 'copy', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=chi', '-movflags', '+faststart', mp4]);

if (!process.argv.includes('--keep')) fs.rmSync(work, { recursive: true, force: true });
const chars = segs.reduce((a, s) => a + s.text.length, 0);
console.log(JSON.stringify({ mp4, srt: srtPath, minutes: +(t / 60).toFixed(2), segments: segs.length, chars, engine: ENGINE, pageErrors: errors }));
