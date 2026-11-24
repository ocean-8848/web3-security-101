#!/bin/bash
# 新建一集：复制 EP01 的项目骨架（不含场景、旁白和音频）。
# 用法：tools/new_episode.sh EP04-reentrancy
set -euo pipefail
cd "$(dirname "$0")/.."
ep="$1"; src=EP01-security-landscape
[ -e "$ep" ] && { echo "$ep 已存在"; exit 1; }
mkdir -p "$ep/compositions" "$ep/assets/fonts"
cp "$src/package.json" "$src/hyperframes.json" "$src/AGENTS.md" "$src/CLAUDE.md" "$ep/"
slug=$(echo "$ep" | tr 'A-Z' 'a-z')
sed -i '' "s/ep01-security-landscape/$slug/" "$ep/package.json"
printf '{\n  "id": "%s",\n  "name": "%s",\n  "createdAt": "%s"\n}\n' "$ep" "$ep" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$ep/meta.json"
echo "created $ep"
