#!/usr/bin/env python3
"""Offline Chinese TTS worker for render.mjs (--engine kokoro).

Reads one JSON object per line on stdin: {"text": "...", "out": "/path/to.wav"}
Writes one JSON line per request on stdout: {"ok": true, "dur": 3.21} or {"ok": false, "err": "..."}

Model: sherpa-onnx Kokoro v1.1-zh (multi-lang), male voice sid 90 by default.
Setup (once):
  pip install sherpa-onnx soundfile cn2an
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
  tar xjf kokoro-multi-lang-v1_1.tar.bz2      # set KOKORO_DIR to the extracted folder
Env: KOKORO_DIR, KOKORO_SID (default 90), KOKORO_SPEED (default 1.1), KOKORO_THREADS (default 2)
"""
import json, os, re, sys

import cn2an
import numpy as np
import sherpa_onnx as so
import soundfile as sf

DIG = '零一二三四五六七八九'
# Acronyms read as words (in the English lexicon) instead of letter by letter.
WORDS = {'TRON': 'Tron', 'DAO': 'dao', 'SAFU': 'safu', 'NFT': 'N F T', 'MEV': 'M E V', 'PEPE': 'pepe'}


def num(s):
    s = s.replace(',', '')
    if '.' in s:
        a, b = s.split('.', 1)
        return cn2an.an2cn(a or '0') + '点' + ''.join(DIG[int(c)] for c in b)
    if len(s) > 1 and s.startswith('0'):
        return ''.join(DIG[int(c)] for c in s)
    return cn2an.an2cn(s)


def normalize(t):
    """Make narration speakable: years digit by digit, numbers and percents in Chinese, acronyms spelled."""
    t = re.sub(r'[“”"「」『』《》【】]', '', t)
    t = t.replace('→', '，到').replace('×', '乘以').replace('≥', '大于等于').replace('≤', '小于等于').replace('≈', '约等于')
    t = re.sub(r'(\d+)\s*/\s*(\d+)(?=\s*(?:多签|签名|门限|阈值))', lambda m: num(m.group(2)) + '选' + num(m.group(1)), t)
    t = re.sub(r'(\d+)\s*/\s*(\d+)', lambda m: num(m.group(2)) + '分之' + num(m.group(1)), t)
    t = t.replace('~', '到').replace('–', '到').replace('—', '，').replace('/', '，')
    t = t.replace('=', '等于').replace('+', '加').replace('>', '大于').replace('<', '小于')
    t = re.sub(r'(\d{4})\s*年', lambda m: ''.join(DIG[int(c)] for c in m.group(1)) + '年', t)
    t = re.sub(r'(\d[\d,]*(?:\.\d+)?)\s*%', lambda m: '百分之' + num(m.group(1)), t)
    t = re.sub(r'(?<![A-Za-z])0x[0-9a-fA-F]+', '一个十六进制值', t)
    t = re.sub(r'\b(EIP|ERC|BEP|TRC|BIP|TIP|SEV|CVE)[- ]?(\d+)', lambda m: m.group(1) + ' ' + (''.join(DIG[int(c)] for c in m.group(2)) if len(m.group(2)) > 2 else num(m.group(2))), t)  # ERC-4626 -> ERC 四六二六
    t = re.sub(r'(?<=[A-Za-z])-(?=\d)', ' ', t)          # V2-3 -> V2 3
    t = re.sub(r'(?<=\d)-(?=\d)', '到', t)                # 10-15 -> 10到15
    t = re.sub(r'\d[\d,]*(?:\.\d+)?', lambda m: num(m.group(0)), t)
    t = re.sub(r'\b[A-Z]{2,6}s?\b', lambda m: WORDS.get(m.group(0), ' '.join(m.group(0))), t)
    t = t.replace('_', ' ')
    return re.sub(r'\s+', ' ', t).strip()


def main():
    d = os.environ.get('KOKORO_DIR', os.path.join(os.path.dirname(__file__), 'kokoro-multi-lang-v1_1'))
    sid = int(os.environ.get('KOKORO_SID', '90'))
    speed = float(os.environ.get('KOKORO_SPEED', '1.1'))
    j = lambda f: os.path.join(d, f)
    tts = so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(
        kokoro=so.OfflineTtsKokoroModelConfig(
            model=j('model.onnx'), voices=j('voices.bin'), tokens=j('tokens.txt'),
            lexicon=j('lexicon-us-en.txt') + ',' + j('lexicon-zh.txt'),
            data_dir=j('espeak-ng-data'), dict_dir=j('dict')),
        num_threads=int(os.environ.get('KOKORO_THREADS', '2')))))
    print(json.dumps({'ready': True}), flush=True)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            a = tts.generate(normalize(req['text']), sid=sid, speed=speed)
            y = np.asarray(a.samples, dtype=np.float32)
            sf.write(req['out'], y, a.sample_rate, subtype='PCM_16')
            print(json.dumps({'ok': True, 'dur': len(y) / a.sample_rate}), flush=True)
        except Exception as e:  # keep the worker alive; renderer decides what to do
            print(json.dumps({'ok': False, 'err': str(e)[:300]}), flush=True)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--normalize':
        for s in sys.argv[2:]:
            print(normalize(s))
    else:
        main()
