#!/bin/bash
# Render all episodes with the free Microsoft "云希" voice via edge-tts (no key needed; needs internet).
# Voice = CEX sample "D-yunxi-lively" (zh-CN-YunxiNeural, +5% rate, +3Hz pitch). Each sentence also gets its own
# speed / pitch / volume by role (questions rise, warnings slow down and get louder, examples speed up), and pauses
# follow punctuation. EDGE_PROSODY=0 turns the variation off; EDGE_RATE / EDGE_PITCH change the base.
#   ./render-edge.sh          # all 27 episodes        ./render-edge.sh EP04   # one episode (file-name prefix)
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH:$HOME/.local/bin"
for d in "$HOME"/Library/Python/*/bin; do [ -d "$d" ] && PATH="$PATH:$d"; done
command -v node >/dev/null || { echo "需要 Node.js：brew install node"; exit 1; }
command -v ffmpeg >/dev/null || { echo "需要 ffmpeg：brew install ffmpeg"; exit 1; }
if ! command -v edge-tts >/dev/null; then
  echo "安装 edge-tts ..."
  command -v pipx >/dev/null && pipx install edge-tts || python3 -m pip install --user edge-tts || python3 -m pip install --user --break-system-packages edge-tts
  for d in "$HOME"/Library/Python/*/bin; do [ -d "$d" ] && PATH="$PATH:$d"; done
fi
command -v edge-tts >/dev/null || { echo "edge-tts 安装失败，请手动执行：pip3 install edge-tts"; exit 1; }
[ -d node_modules/playwright-core ] || npm install || exit 1
echo "试连语音服务 ..."; edge-tts -v zh-CN-YunxiNeural -t "测试" --write-media /tmp/edge-check.mp3 >/dev/null 2>&1 || { echo "连不上微软语音服务，请检查网络 / 代理"; exit 1; }
JOBS=${JOBS:-3} ./render-all.sh "${1:-}" --engine edge
cd ../output && echo && echo "完成：$(pwd)" && ls -1 *.mp4 | wc -l | xargs echo "MP4 数量："
