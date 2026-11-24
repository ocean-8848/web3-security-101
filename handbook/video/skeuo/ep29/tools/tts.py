#!/usr/bin/env python3
"""按 script.json 生成每段的配音、逐词时间和字幕。
用法：python3 tools/tts.py [段 id ...]      （在 ep29/ 目录运行；不给参数就生成全部）
输出：audio/<seg>.wav（整段配音，响度 -16 LUFS）、timing/<seg>.json（lines / words / captions / total）
字幕规则：按标点断开，不显示任何句号和逗号；同一句里过短的片段合并；超过 MAXC 字的片段在词边界对半拆。
"""
import asyncio, json, os, re, subprocess, sys

VOICE, RATE, PITCH = "zh-CN-YunxiNeural", "+5%", "+3Hz"
LEAD, TAIL = 1.6, 1.2          # 段首留给章节标题的静音、段尾余量（秒）
GAP, GAP_Q = 0.22, 0.5        # 句间停顿；问句后更长
MAXC, MINC = 22, 4             # 字幕最长 / 最短字数（不含空格）
PUNCT = "，。：、！？；"
END = "。！？"

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
S = json.load(open(os.path.join(root, "script.json")))
os.makedirs(os.path.join(root, "audio", "lines"), exist_ok=True)
os.makedirs(os.path.join(root, "timing"), exist_ok=True)

import edge_tts

async def synth(text, path):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary="WordBoundary")
    words, audio = [], b""
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"t": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    open(path, "wb").write(audio)
    return words

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

def spaced(s):
    s = re.sub(r"([一-鿿])([A-Za-z0-9])", r"\1 \2", s)
    s = re.sub(r"([A-Za-z0-9%])([一-鿿])", r"\1 \2", s)
    return re.sub(" +", " ", s).strip()

n = lambda s: len(s.replace(" ", ""))

def captions_for(line, words, t0):
    """把一句话的词按标点分组，返回 [{text,start,end}]，组内不含标点。"""
    groups, k, cur, ends = [], 0, [], []
    for w in words:
        tok = w["t"]
        j = line.find(tok, k)
        if j < 0:
            j = line.find(tok.replace(" ", ""), k); tok = tok.replace(" ", "")
        if j < 0:
            j = k
        between = line[k:j]
        if any(p in between for p in PUNCT) and cur:
            groups.append(cur); ends.append(any(p in between for p in END)); cur = []
        cur.append(w); k = j + len(tok)
    if cur:
        groups.append(cur); ends.append(True)
    # 同一句里过短的片段与相邻片段合并（不跨句号）
    merged, mends = [], []
    for g, e in zip(groups, ends):
        txt = "".join(x["t"] for x in g)
        if merged and not mends[-1] and (n("".join(x["t"] for x in merged[-1])) < MINC or n(txt) < MINC) \
                and n("".join(x["t"] for x in merged[-1])) + n(txt) <= MAXC:
            merged[-1] = merged[-1] + g; mends[-1] = e
        else:
            merged.append(list(g)); mends.append(e)
    # 过长的片段在词边界对半拆
    out = []
    for g in merged:
        stack = [g]
        while stack:
            h = stack.pop(0)
            if n("".join(x["t"] for x in h)) <= MAXC or len(h) < 2:
                out.append(h); continue
            total = n("".join(x["t"] for x in h)); acc, cut = 0, 1
            for i, x in enumerate(h):
                acc += n(x["t"])
                if acc >= total / 2: cut = max(1, i + 1); break
            cut = min(cut, len(h) - 1)
            stack[0:0] = [h[:cut], h[cut:]]
    res = []
    for g in out:
        txt = spaced("".join(x["t"] for x in g))
        txt = re.sub(f"[{PUNCT}]", " ", txt).strip()
        res.append({"text": re.sub(" +", " ", txt), "start": round(t0 + g[0]["s"] - 0.05, 3), "end": round(t0 + g[-1]["e"] + 0.12, 3)})
    return res

async def do_seg(seg):
    sid = seg["id"]
    paths = [os.path.join(root, "audio", "lines", f"{sid}-{i:02d}.mp3") for i in range(len(seg["lines"]))]
    W = await asyncio.gather(*[synth(t, p) for t, p in zip(seg["lines"], paths)])
    t = LEAD; lines, words, caps = [], [], []
    for i, (text, p, ws) in enumerate(zip(seg["lines"], paths, W)):
        if i: t += GAP_Q if seg["lines"][i - 1].endswith("？") else GAP
        d = dur(p)
        lines.append({"id": f"{sid}-{i:02d}", "text": text, "src": p, "start": round(t, 3), "dur": round(d, 3),
                      "speechStart": round(t + ws[0]["s"], 3), "speechEnd": round(t + ws[-1]["e"], 3)})
        words += [{"line": i, "text": w["t"], "start": round(t + w["s"], 3), "end": round(t + w["e"], 3)} for w in ws]
        caps += captions_for(text, ws, t)
        t += d
    total = round(t + TAIL, 2)
    for i, c in enumerate(caps):
        c["id"] = f"c{i}"
        if i + 1 < len(caps): c["end"] = round(min(c["end"], caps[i + 1]["start"] - 0.02), 3)
    bad = [c["text"] for c in caps if re.search(f"[{PUNCT}.]", c["text"].replace("3.9", "").replace("2.3", "").replace("2.85", "").replace("2.92", "").replace("63.4", ""))]
    assert not bad, bad
    # 混音
    inputs, flt = [], []
    for i, L in enumerate(lines):
        inputs += ["-i", L["src"]]; d = int(L["start"] * 1000); flt.append(f"[{i}]adelay={d}|{d}[a{i}]")
    flt.append("".join(f"[a{i}]" for i in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},loudnorm=I=-16:TP=-1.5:LRA=11[m]")
    wav = os.path.join(root, "audio", f"{sid}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(flt), "-map", "[m]", "-t", str(total),
                    "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", wav], check=True)
    json.dump({"id": sid, "title": seg["title"], "pill": seg["pill"], "total": total, "lines": lines, "words": words, "captions": caps},
              open(os.path.join(root, "timing", f"{sid}.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{sid}: {total}s, {len(lines)} 句, {len(caps)} 条字幕")

async def main():
    want = sys.argv[1:]
    for seg in S["segments"]:
        if not want or seg["id"] in want:
            await do_seg(seg)

asyncio.run(main())
