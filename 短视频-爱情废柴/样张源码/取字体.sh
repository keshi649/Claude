#!/bin/bash
# 样张用的字体（都是 SIL OFL，取自 fontsource 的 npm 包）。像素字 FusionPixel12.woff2 已在仓库里；另外三款体积大，不进仓库，跑这个脚本取回。
set -e
cd "$(dirname "$0")/fonts"
get() { local url; url=$(curl -sS "https://registry.npmjs.org/$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['versions'][d['dist-tags']['latest']]['dist']['tarball'])"); rm -rf "$2"; mkdir -p "$2"; curl -sSL "$url" | tar xz -C "$2" --strip-components=1; }
get @fontsource/ma-shan-zheng msz          # 纸雕方向的手写字
get @fontsource/zcool-kuaile zk             # 漫画方向的旁白字
get @fontsource/zcool-qingke-huangyou zq    # 漫画方向的拟声字
