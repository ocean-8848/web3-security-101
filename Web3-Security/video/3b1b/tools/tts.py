#!/usr/bin/env python3
"""Synthesize an episode's narration with the free Yunxi voice (edge-tts) and time the film by it.

Usage: python3 tools/tts.py <episode dir>

Reads  <ep>/narration.json  ({voice, rate, pitch, scenes: [{id, lines: [...]}]})
Writes <ep>/assets/voice/<scene>-<n>.mp3   one clip per line (cached; delete to redo)
       <ep>/assets/narration.wav           every line placed on one track
       <ep>/cues.json                      scene starts/durations and each line's start/end
and rewrites the `/*CUES*/ ... /*END*/` block in each compositions/<scene>.html
and the scene hosts' data-start/data-duration in index.html.

The voice is the clock: scene length = lead + lines + gaps + tail.
"""
import json, os, re, subprocess, sys, time

LEAD = 0.6      # silence before a scene's first line
GAP = 0.45      # between lines in a scene
TAIL = 1.1      # after a scene's last line
SR = 48000

ep = os.path.abspath(sys.argv[1])
cfg = json.load(open(os.path.join(ep, "narration.json")))
voice_dir = os.path.join(ep, "assets", "voice")
os.makedirs(voice_dir, exist_ok=True)


# Pronunciation fixes: applied only to the text sent to the voice, never to subtitles.
RULES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "pronounce.json")))["rules"]


def say(text):
    for pat, rep in RULES:
        text = re.sub(pat, rep, text)
    return text


def dur(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "default=nw=1:nk=1", path])
    return float(out)


cues = {"scenes": []}
t = 0.0
placements = []  # (file, start)
for sc in cfg["scenes"]:
    start = t
    lines = []
    cur = LEAD
    for i, text in enumerate(sc["lines"]):
        f = os.path.join(voice_dir, f"{sc['id']}-{i + 1:02d}.mp3")
        meta = f + ".txt"
        spoken = say(text)
        if not (os.path.exists(f) and os.path.exists(meta) and open(meta).read() == spoken):
            for attempt in range(4):
                try:
                    subprocess.check_call(["edge-tts", "--voice", cfg["voice"], f"--rate={cfg['rate']}",
                                           f"--pitch={cfg['pitch']}", "--text", spoken, "--write-media", f],
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    break
                except subprocess.CalledProcessError:
                    if attempt == 3:
                        raise
                    time.sleep(5 * (attempt + 1))
            open(meta, "w").write(spoken)
        d = dur(f)
        lines.append({"s": round(cur, 2), "e": round(cur + d, 2), "text": text})
        placements.append((f, start + cur))
        cur += d + GAP
    total = round(cur - GAP + TAIL, 2)
    cues["scenes"].append({"id": sc["id"], "start": round(start, 2), "duration": total, "lines": lines})
    t = start + total
cues["duration"] = round(t, 2)
json.dump(cues, open(os.path.join(ep, "cues.json"), "w"), ensure_ascii=False, indent=1)

# One narration track: each clip delayed to its start, mixed, then loudness-normalised.
args = ["ffmpeg", "-y", "-v", "error"]
for f, _ in placements:
    args += ["-i", f]
fc = "".join(f"[{i}:a]aresample={SR},adelay={int(s * 1000)}:all=1[a{i}];" for i, (_, s) in enumerate(placements))
fc += "".join(f"[a{i}]" for i in range(len(placements)))
fc += f"amix=inputs={len(placements)}:normalize=0,apad=whole_dur={cues['duration']},loudnorm=I=-16:TP=-1.5:LRA=11[out]"
args += ["-filter_complex", fc, "-map", "[out]", "-ar", str(SR), "-ac", "2",
         os.path.join(ep, "assets", "narration.wav")]
subprocess.check_call(args)

# Inject cues into each scene and retime the hosts.
for sc in cues["scenes"]:
    p = os.path.join(ep, "compositions", f"{sc['id']}.html")
    if os.path.exists(p):
        src = open(p).read()
        block = "/*CUES*/" + json.dumps({"d": sc["duration"], "L": [[l["s"], l["e"]] for l in sc["lines"]]}) + "/*END*/"
        src = re.sub(r"/\*CUES\*/.*?/\*END\*/", block, src, flags=re.S)
        src = re.sub(r'(id="root"[^>]*data-duration=")[\d.]+', lambda m: m.group(1) + str(sc["duration"]), src)
        open(p, "w").write(src)
idx = os.path.join(ep, "index.html")
if os.path.exists(idx):
    src = open(idx).read()
    for sc in cues["scenes"]:
        src = re.sub(rf'(<div\s+id="{sc["id"]}"[^>]*?data-start=")[\d.]+(")', lambda m: m.group(1) + str(sc["start"]) + m.group(2), src, flags=re.S)
        src = re.sub(rf'(<div\s+id="{sc["id"]}"[^>]*?data-duration=")[\d.]+(")', lambda m: m.group(1) + str(sc["duration"]) + m.group(2), src, flags=re.S)
    src = re.sub(r'(data-composition-id="main"[^>]*?data-duration=")[\d.]+', lambda m: m.group(1) + str(cues["duration"]), src, flags=re.S)
    src = re.sub(r'(id="narration"[^>]*?data-duration=")[\d.]+', lambda m: m.group(1) + str(cues["duration"]), src, flags=re.S)
    open(idx, "w").write(src)

for sc in cues["scenes"]:
    print(f"{sc['id']:<10} start {sc['start']:7.2f}  dur {sc['duration']:6.2f}  lines {len(sc['lines'])}")
print(f"total {cues['duration']:.2f} s")
