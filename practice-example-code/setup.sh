#!/usr/bin/env bash
# 恢复示例代码的依赖。lib/ 不进仓库，克隆后运行一次即可。
# 用法：在 web3-security-101/ 目录运行  bash practice-example-code/setup.sh
set -euo pipefail
cd "$(dirname "$0")"

FORGE_STD=v1.11.0   # 与手册里的输出一致的版本
OZ=v5.6.1

# 1. forge-std 只下载一份，放在 foundry/lib；MiniLend 直接用这份
# 用 git clone 固定标签；在学习仓库的子目录里 forge install 会报错
fetch() {  # fetch <GitHub 仓库> <标签> <目标目录>
  rm -rf "$3"
  git -c advice.detachedHead=false clone --quiet --depth 1 --branch "$2" "https://github.com/$1.git" "$3"
  rm -rf "$3/.git"   # 去掉嵌套的 git 仓库
  echo "已下载 $1 $2"
}

if [ ! -f foundry/lib/forge-std/src/Test.sol ]; then
  fetch foundry-rs/forge-std "$FORGE_STD" foundry/lib/forge-std
fi

# 2. 每个靶场的 lib/forge-std 是指向这份的符号链接
for d in range/*/; do
  mkdir -p "${d}lib"
  ln -sfn ../../../foundry/lib/forge-std "${d}lib/forge-std"
done

# 3. basics 靶场还需要 OpenZeppelin
if [ ! -d range/basics/lib/openzeppelin-contracts/contracts ]; then
  fetch OpenZeppelin/openzeppelin-contracts "$OZ" range/basics/lib/openzeppelin-contracts
fi

# 4. bootcamp-lab（手敲练习工程）：forge-std 和 OpenZeppelin 都链接到已下载的副本
mkdir -p bootcamp-lab/lib
ln -sfn ../../foundry/lib/forge-std bootcamp-lab/lib/forge-std
ln -sfn ../../range/basics/lib/openzeppelin-contracts bootcamp-lab/lib/openzeppelin-contracts

echo "依赖已就绪：forge-std ${FORGE_STD}，OpenZeppelin ${OZ}"
