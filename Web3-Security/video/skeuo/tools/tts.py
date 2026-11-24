#!/usr/bin/env python3
"""章节配音、逐词时间和字幕（通用版，所有章节共用）。

配音引擎：默认百炼龙安鲁风（需 QWEN_AI_API_KEY，在 zsh 里运行：zsh -ic 'python3 tools/tts.py epNN'），
          第一段悬疑电台腔、其余专业科普腔；ENGINE=edge 退回云希。
用法：
  python3 tools/tts.py <章节目录>            生成全部段
  python3 tools/tts.py <章节目录> seg2 seg4  只生成指定段
  python3 tools/tts.py <章节目录> --fix      只重配"讲稿改过"或"命中多音字表"的句子；
                                             新录音拉伸到原句长度，画面时间不变
输入：<章节目录>/script.json（segments[].id / pill / title / lines）
多音字：tools/pron.json（全局）+ <章节目录>/pron.json（可选，本章追加），
        配音时把"显示写法"换成"同音写法"，字幕仍显示原文。
输出：<章节目录>/audio/<seg>.wav、audio/lines/*.mp3、timing/<seg>.json
字幕规则：按标点断开，不显示任何句号逗号；同一句里过短的片段合并；超过 MAXC 字在词边界对半拆。
"""
import asyncio, json, os, re, subprocess, sys

VOICE, RATE, PITCH = "zh-CN-YunxiNeural", "+5%", "+3Hz"
LEAD, TAIL = 1.6, 1.2
GAP, GAP_Q = 0.22, 0.5
MAXC, MINC = 22, 4
PUNCT = "，。：、！？；"
END = "。！？"
HERE = os.path.dirname(os.path.abspath(__file__))

try:
    import edge_tts
except ImportError:
    edge_tts = None

def load_pron(chdir):
    pairs = json.load(open(os.path.join(HERE, "pron.json")))["pairs"]
    p = os.path.join(chdir, "pron.json")
    if os.path.exists(p):
        pairs = json.load(open(p))["pairs"] + pairs
    return sorted(pairs, key=lambda x: -len(x[0]))

def spoken(text, pairs):
    for a, b in pairs:
        text = text.replace(a, b)
    return text

def unspoken(text, pairs, display_line):
    for a, b in pairs:
        if b in display_line:  # 原文本来就写着同音字（如"最常""诚实的"），不能反向替换
            continue
        text = text.replace(b, a)
    # 引擎返回的词会丢掉英文里的 . - ( ) 空格等；按原文把这些写法恢复回来（tx.origin、EIP-7702、Poly Network）
    toks = re.findall(r"[A-Za-z0-9_$]+(?:(?:[.\-()\[\]]|\s+(?=[A-Za-z0-9_$(]))+[A-Za-z0-9_$)\]]*)+", display_line)
    for tok in sorted(set(toks), key=len, reverse=True):
        key = re.sub(r"[^A-Za-z0-9_$]", "", tok)
        if key and key != tok:
            # 原文里同时有 tok（如 1.2）和裸写的 key（如 12）时，按出现顺序逐个对应，只恢复 tok 那几处
            B = r"(?<![A-Za-z0-9_$])"; E_ = r"(?![A-Za-z0-9_$])"
            order = [m.group(0) == tok for m in re.finditer(B + "(?:" + re.escape(tok) + "|" + re.escape(key) + ")" + E_, display_line)]
            it = iter(order)
            pat = B + r"[\s.\-()\[\]]*".join(map(re.escape, key)) + E_
            text = re.sub(pat, lambda m: tok if next(it, True) else m.group(0), text)
    return text

# ---- 配音引擎 -------------------------------------------------------------------------------
# 默认：阿里云百炼 qwen-audio-3.0-tts-plus，音色龙安鲁风（频道主 2026-11-14 确认）。
#   第一段（钩子）用悬疑电台腔，其余段用专业科普腔；script.json 每段可用 "style" 覆盖。
# ENGINE=edge 时退回 edge-tts 云希。百炼不返回逐词时间：句内时间由"停顿检测 + 按字数分配"估算。
ENGINE = os.environ.get("ENGINE", "qwen")
QWEN_URL = "https://token-plan.cn-beijing.maas.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer"
QWEN_MODEL, QWEN_VOICE = "qwen-audio-3.0-tts-plus", "longanlufeng"
STYLES = {"suspense": "低沉悬疑的深夜电台腔", "expert": "专业科普讲解，轻重缓急清楚"}
EXT = ".wav" if ENGINE == "qwen" else ".mp3"
_sem = asyncio.Semaphore(4)

def _qwen(text, path, style):
    import requests, time
    key = os.environ["QWEN_AI_API_KEY"]
    body = {"model": QWEN_MODEL, "input": {"text": text, "voice": QWEN_VOICE, "format": "wav", "sample_rate": 24000,
                                           "instruction": STYLES.get(style, style)}}
    for k in range(5):
        try:
            r = requests.post(QWEN_URL, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}, json=body, timeout=180)
            j = r.json()
            if r.status_code == 200:
                u = j["output"]["audio"]["url"].replace("http://", "https://", 1)  # 访客网络会劫持明文 http 下载
                data = requests.get(u, timeout=120).content
                if data[:4] != b"RIFF":
                    raise RuntimeError("音频下载拿到的不是 wav（可能是网络登录页）")
                open(path, "wb").write(data); return
            err = f"{r.status_code} {j.get('code')} {j.get('message')}"
        except Exception as e:
            err = repr(e)
        time.sleep(3 * (k + 1))
    raise RuntimeError(f"百炼合成失败：{err}：{text[:30]}")

UNIT = re.compile(r"[A-Za-z0-9_$]+(?:[.\-()][A-Za-z0-9_$()]*)*|[一-鿿]|[^\s]")

def _weight(u):
    if re.fullmatch(r"[一-鿿]", u): return 1.0
    if re.fullmatch(r"[0-9.]+", u): return 0.85 * len(re.sub(r"\D", "", u)) + 0.3
    if re.match(r"[A-Za-z0-9_$]", u): return max(0.8, 0.42 * len(re.sub(r"[^A-Za-z0-9]", "", u)))
    if u in "%％": return 3.0  # 读作"百分之"，字幕要保留 %
    return 0.0

def estimate_words(text, wav):
    """无逐词时间的引擎：停顿检测找到每个小句的起止，小句内按字数分配。返回 [{t,s,e}]。"""
    d = dur(wav)
    err = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-38dB:d=0.09", "-f", "null", "-"], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    sil = list(zip(ss, se + [d] * (len(ss) - len(se))))
    t0 = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    t1 = sil[-1][0] if sil and sil[-1][1] >= d - 0.05 else d
    inner = [(a, b) for a, b in sil if a > t0 + 0.05 and b < t1 - 0.05]
    clauses = [c for c in re.split(f"[{PUNCT}]", text) if UNIT.findall(c) and sum(_weight(u) for u in UNIT.findall(c)) > 0]
    W = [sum(_weight(u) for u in UNIT.findall(c)) for c in clauses]
    tot = sum(W) or 1
    # 小句边界：按字数比例的期望时间，就近吸附到未用的停顿中点
    bounds, acc, used = [t0], 0.0, set()
    for w in W[:-1]:
        acc += w; te = t0 + (t1 - t0) * acc / tot
        best = min(((abs((a + b) / 2 - te), i) for i, (a, b) in enumerate(inner) if i not in used), default=None)
        if best and best[0] < 0.9:
            used.add(best[1]); a, b = inner[best[1]]; bounds.append((a, b))
        else:
            bounds.append((te, te))
    bounds.append(t1)
    words = []
    for ci, c in enumerate(clauses):
        s = bounds[ci] if ci == 0 else bounds[ci][1]
        e = bounds[ci + 1] if ci + 1 == len(clauses) else bounds[ci + 1][0]
        if e <= s: e = s + 0.05
        us = [u for u in UNIT.findall(c) if _weight(u) > 0]; ws = [_weight(u) for u in us]; sw = sum(ws) or 1; t = s
        for u, w in zip(us, ws):
            dt = (e - s) * w / sw; words.append({"t": u, "s": round(t, 3), "e": round(t + dt, 3)}); t += dt
    return words

async def synth(text, path, style="expert"):
    if ENGINE == "qwen":
        async with _sem:
            await asyncio.to_thread(_qwen, text, path, style)
        return estimate_words(text, path)
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

def captions_for(line, words, t0, pairs, display):
    groups, k, cur, ends = [], 0, [], []
    for w in words:
        tok = w["t"]; j = line.find(tok, k)
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
    merged, mends = [], []
    for g, e in zip(groups, ends):
        txt = "".join(x["t"] for x in g); prev = "".join(x["t"] for x in merged[-1]) if merged else ""
        if merged and not mends[-1] and (n(prev) < MINC or n(txt) < MINC) and n(prev) + n(txt) <= MAXC:
            g = [dict(g[0], t=" " + g[0]["t"])] + g[1:]
            merged[-1] = merged[-1] + g; mends[-1] = e
        else:
            merged.append(list(g)); mends.append(e)
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
            cut = min(cut, len(h) - 1); stack[0:0] = [h[:cut], h[cut:]]
    res = []
    for g in out:
        txt = unspoken(spaced("".join(x["t"] for x in g)), pairs, display)
        txt = re.sub(" +", " ", re.sub(f"[{PUNCT}]", " ", txt)).strip()
        res.append({"text": txt, "start": round(t0 + g[0]["s"] - 0.05, 3), "end": round(t0 + g[-1]["e"] + 0.12, 3)})
    return res

def fix_caps(caps, mind=0.35):
    """去掉重叠；时长不足 mind 的字幕并入前一条（估算时间时偶尔两条挤在一起）。"""
    out = []
    for c in sorted(caps, key=lambda c: c["start"]):
        c = dict(c)
        if out and c["start"] < out[-1]["start"] + mind:
            out[-1]["text"] += " " + c["text"]; out[-1]["end"] = max(out[-1]["end"], c["end"]); continue
        out.append(c)
    for i, c in enumerate(out):
        if i + 1 < len(out): c["end"] = round(min(c["end"], out[i + 1]["start"] - 0.02), 3)
        if c["end"] - c["start"] < mind and i > 0:
            out[i - 1]["text"] += " " + c["text"]; out[i - 1]["end"] = c["end"]; c["_drop"] = True
    out = [c for c in out if not c.get("_drop")]
    for i, c in enumerate(out): c["id"] = f"c{i}"
    return out

def finish(sid, seg, lines, words, caps, total, chdir):
    caps[:] = fix_caps(caps)
    bad = [c["text"] for c in caps if re.search(f"[{PUNCT}]", c["text"])]
    assert not bad, bad
    inputs, flt = [], []
    for i, L in enumerate(lines):
        inputs += ["-i", L["src"]]; d = int(L["start"] * 1000); flt.append(f"[{i}]adelay={d}|{d}[a{i}]")
    flt.append("".join(f"[a{i}]" for i in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},loudnorm=I=-16:TP=-1.5:LRA=11[m]")
    wav = os.path.join(chdir, "audio", f"{sid}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(flt), "-map", "[m]", "-t", str(total),
                    "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", wav], check=True)
    json.dump({"id": sid, "title": seg["title"], "pill": seg["pill"], "total": total, "lines": lines, "words": words, "captions": caps},
              open(os.path.join(chdir, "timing", f"{sid}.json"), "w"), ensure_ascii=False, indent=1)

REDO = set()

def remap_words(ws, sp, text, pairs):
    """逐字时间里的字是配音用的同音写法：按位置换回讲稿原文（长度不同时用 difflib 对齐）。"""
    import difflib
    pos, k = [], 0
    for w in ws:
        j = sp.find(w["t"], k)
        if j < 0: j = sp.find(w["t"].replace(" ", ""), k)
        pos.append(j); k = (j + len(w["t"])) if j >= 0 else k
    cmap = {}
    for tag, a0, a1, b0, b1 in difflib.SequenceMatcher(None, sp, text, autojunk=False).get_opcodes():
        if tag in ("equal", "replace") and (a1 - a0) == (b1 - b0):
            for d in range(a1 - a0): cmap[a0 + d] = b0 + d
    out = []
    for w, j in zip(ws, pos):
        t = w["t"]
        if j >= 0 and all((j + d) in cmap for d in range(len(t))):
            t = "".join(text[cmap[j + d]] for d in range(len(t)))
        else:
            t = unspoken(t, pairs, text)
        out.append(dict(w, t=t))
    return out

def style_of(seg, idx):
    return seg.get("style") or ("suspense" if idx == 0 else "expert")

async def do_seg(seg, chdir, pairs, idx=1):
    sid = seg["id"]; st = style_of(seg, idx)
    paths = [os.path.join(chdir, "audio", "lines", f"{sid}-{i:02d}{EXT}") for i in range(len(seg["lines"]))]
    sp = [spoken(t, pairs) for t in seg["lines"]]
    W = await asyncio.gather(*[synth(t, p, st) for t, p in zip(sp, paths)])
    t = seg.get("lead", LEAD); lines, words, caps = [], [], []
    for i, (text, s, p, ws) in enumerate(zip(seg["lines"], sp, paths, W)):
        if i: t += GAP_Q if seg["lines"][i - 1].endswith("？") else GAP
        d = dur(p)
        lines.append({"id": f"{sid}-{i:02d}", "text": text, "spoken": s, "src": p, "start": round(t, 3), "dur": round(d, 3),
                      "speechStart": round(t + ws[0]["s"], 3), "speechEnd": round(t + ws[-1]["e"], 3)})
        words += [{"line": i, "text": w["t"], "start": round(t + w["s"], 3), "end": round(t + w["e"], 3)} for w in remap_words(ws, s, text, pairs)]
        caps += captions_for(s, ws, t, pairs, text)
        t += d
    total = round(t + seg.get("tail", TAIL), 2)
    finish(sid, seg, lines, words, caps, total, chdir)
    print(f"{sid}: {total}s, {len(lines)} 句, {len(caps)} 条字幕")

async def fix_seg(seg, chdir, pairs, idx=1):
    """只重配改过的句子，时间轴不变。"""
    sid = seg["id"]; tj = os.path.join(chdir, "timing", f"{sid}.json"); T = json.load(open(tj))
    lines, words, total = T["lines"], T["words"], T["total"]
    changed = []
    for i, text in enumerate(seg["lines"]):
        s = spoken(text, pairs)
        if lines[i]["text"] != text or lines[i].get("spoken", lines[i]["text"]) != s or f"{sid}:{i}" in REDO:
            changed.append((i, text, s))
    if not changed:
        print(f"{sid}: 无需重配"); return []
    for i, text, s in changed:
        L = lines[i]; base, ext = os.path.splitext(L["src"]); raw = base + "-raw" + ext
        ws = await synth(s, raw, style_of(seg, idx)); nd = dur(raw)
        if i == len(lines) - 1 and nd > L["dur"]:
            # 最后一句改长了：不压缩，片尾顺延（后面没有句子，画面时间不受影响）
            total = round(total + (nd - L["dur"]), 2); L["dur"] = round(nd, 3)
        # 新录音更短：保持原速，句尾补静音；更长：压到原长度（atempo）
        k = max(1.0, nd / L["dur"])
        af = f"atempo={k:.5f},apad" if k > 1.0001 else "apad"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-t", str(L["dur"]), L["src"]], check=True)
        os.remove(raw)
        ws = [{"t": w["t"], "s": w["s"] / k, "e": w["e"] / k} for w in ws]
        L.update({"text": text, "spoken": s, "speechStart": round(L["start"] + ws[0]["s"], 3), "speechEnd": round(L["start"] + ws[-1]["e"], 3)})
        words = [w for w in words if w["line"] != i] + [{"line": i, "text": w["t"], "start": round(L["start"] + w["s"], 3), "end": round(L["start"] + w["e"], 3)} for w in remap_words(ws, s, text, pairs)]
        print(f"{sid} 第 {i} 句重配（拉伸 ×{k:.3f}）：{text}")
    words.sort(key=lambda w: w["start"])
    # 字幕整段按新词时间重建（未改的句子结果与原来相同）
    caps = []
    for i, L in enumerate(lines):
        ws = [{"t": w["text"] if True else w["text"], "s": w["start"] - L["start"], "e": w["end"] - L["start"]} for w in words if w["line"] == i]
        # 用同音写法回到配音文本做分组，再映射回显示写法
        sp_ws = [{"t": spoken(x["t"], pairs), "s": x["s"], "e": x["e"]} for x in ws]
        caps += captions_for(L.get("spoken", spoken(L["text"], pairs)), sp_ws, L["start"], pairs, L["text"])
    finish(sid, seg, lines, words, caps, total, chdir)
    return [i for i, _, _ in changed]

async def main():
    chdir = os.path.abspath(sys.argv[1]); args = sys.argv[2:]
    fix = "--fix" in args
    if "--redo" in args:
        j = args.index("--redo"); REDO.update(args[j + 1].split(",")); del args[j:j + 2]; fix = True
    want = [a for a in args if not a.startswith("--")]
    os.makedirs(os.path.join(chdir, "audio", "lines"), exist_ok=True); os.makedirs(os.path.join(chdir, "timing"), exist_ok=True)
    pairs = load_pron(chdir); S = json.load(open(os.path.join(chdir, "script.json")))
    for idx, seg in enumerate(S["segments"]):
        if want and seg["id"] not in want: continue
        if fix: await fix_seg(seg, chdir, pairs, idx)
        else: await do_seg(seg, chdir, pairs, idx)

if __name__ == "__main__":
    asyncio.run(main())
