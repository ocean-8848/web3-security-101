#!/bin/bash
# Render all 27 episodes with Azure "云希 HD"（zh-CN-Yunxi:DragonHDFlashLatestNeural, lively chat style, per-sentence emphasis）.
#   export AZURE_SPEECH_KEY=<your key>  AZURE_SPEECH_REGION=southeastasia   # HD Flash: eastus / westeurope / southeastasia
#   ./render-azure.sh            # all episodes      ./render-azure.sh EP04   # one episode (file-name prefix)
#   ./render-azure.sh --audition # only make tone samples in ../output/audition/ to pick a profile first
# Optional: AZURE_TTS_VOICE=<voice>  AZURE_TTS_PROFILE=mixed|chat|news|flat  JOBS=2 (parallel episodes)
set -e
cd "$(dirname "$0")"
[ -n "$AZURE_SPEECH_KEY" ] || { echo "Set AZURE_SPEECH_KEY (and AZURE_SPEECH_REGION) first."; exit 1; }
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first: brew install ffmpeg"; exit 1; }
[ -d node_modules/playwright-core ] || npm install
if [ "$1" = "--audition" ]; then node azure_ssml.mjs --audition; exit; fi
node azure_ssml.mjs --voices yunxi | head -20   # also checks key + region
JOBS=${JOBS:-2} ./render-all.sh "${1:-}" --engine azure
