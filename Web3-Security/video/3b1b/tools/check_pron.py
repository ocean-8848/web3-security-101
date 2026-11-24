#!/usr/bin/env python3
"""Find polyphonic characters the TTS voice likely misread, by speech recognition.

Usage: PYTHONPATH=<dir with pypinyin> python3 tools/check_pron.py <episode dir> [<episode dir> ...]

For each episode: transcribe assets/narration.wav with whisper (zh, via `npx hyperframes transcribe`,
cached as assets/asr.json), convert the narration text (context-aware readings) and the transcript
(whatever homophones whisper wrote down) to toneless pinyin, align the two syllable sequences, and
report every position where the source character is polyphonic and the syllables differ.
Whisper is biased toward the expected word, so a clean report does not prove a word was read right;
it does catch misreads that whisper heard as a different word (e.g. 回调 heard as 回条).
"""
import difflib, json, os, re, subprocess, sys
from pypinyin import lazy_pinyin, pinyin, Style

HAN = re.compile(r"[一-鿿]")


def han(s):
    return "".join(HAN.findall(s))


def heteronym(ch):
    return len(set(p.rstrip("012345") for p in pinyin(ch, style=Style.NORMAL, heteronym=True)[0])) > 1


for ep in sys.argv[1:]:
    ep = os.path.abspath(ep)
    asr = os.path.join(ep, "assets", "asr.json")
    if not os.path.exists(asr):
        subprocess.run(["npx", "hyperframes", "transcribe", "assets/narration.wav", "--engine", "whisper",
                        "--model", "small", "--language", "zh"], cwd=ep, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.replace(os.path.join(ep, "assets", "transcript.json"), asr)
    d = json.load(open(asr))
    words = d if isinstance(d, list) else d.get("words", [])
    heard = han("".join(w.get("text", w.get("word", "")) for w in words))
    cfg = json.load(open(os.path.join(ep, "narration.json")))
    src_lines = [l for sc in cfg["scenes"] for l in sc["lines"]]
    src = han("".join(src_lines))
    a = lazy_pinyin(src, style=Style.NORMAL)
    b = lazy_pinyin(heard, style=Style.NORMAL)
    hits = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op != "replace" or i2 - i1 != j2 - j1:
            continue
        for k in range(i2 - i1):
            ch = src[i1 + k]
            if a[i1 + k] != b[j1 + k] and heteronym(ch):
                ctx = src[max(0, i1 + k - 4): i1 + k + 5]
                hits.append((ch, a[i1 + k], b[j1 + k], heard[j1 + k], ctx))
    print(f"== {os.path.basename(ep)}  ({len(hits)} flags)")
    for ch, want, got, hch, ctx in hits:
        print(f"  {ch}  应读 {want:<6} 听到 {got:<6}（记作“{hch}”）  …{ctx}…")
