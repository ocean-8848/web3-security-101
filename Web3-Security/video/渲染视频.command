#!/bin/bash
# 双击运行：用云希（D-yunxi-lively）为全部 27 集合成配音并渲染 MP4，输出到 video/output/。约 3 小时，可随时关掉窗口，再次双击会从头渲染。
cd "$(dirname "$0")/tools" && ./render-edge.sh "$@"
echo; read -n 1 -s -r -p "按任意键关闭窗口"
