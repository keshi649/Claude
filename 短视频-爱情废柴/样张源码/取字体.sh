#!/bin/bash
# 样张用的字体（都是 SIL OFL，取自 fontsource 的 npm 包）。像素字 FusionPixel12.woff2 已在仓库里；其余体积大，不进仓库，跑这个脚本取回。
set -e
cd "$(dirname "$0")/fonts"
get() { local url; url=$(curl -sS "https://registry.npmjs.org/$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['versions'][d['dist-tags']['latest']]['dist']['tarball'])"); rm -rf "$2"; mkdir -p "$2"; curl -sSL "$url" | tar xz -C "$2" --strip-components=1; }
get @fontsource/ma-shan-zheng msz          # 纸雕方向的手写字
get @fontsource/zcool-kuaile zk             # 漫画方向的旁白字
get @fontsource/zcool-qingke-huangyou zq    # 漫画方向的拟声字
get @fontsource/zcool-xiaowei zx            # 火柴方向的歌词
get @fontsource/tilt-neon tn                # 霓虹方向（备用的英文灯管字）
get @fontsource/dancing-script ds           # 备用
get @fontsource/pacifico pc                 # 备用
# 思源黑体只要 200（霓虹灯管字），思源宋体只要 700、900（火柴盒标签）：整包很大，取完只留这几个字重
get @fontsource/noto-sans-sc nss.all; mkdir -p nss/files; cp nss.all/200.css nss/; cp nss.all/files/*-200-normal.woff2 nss/files/; rm -rf nss.all
get @fontsource/noto-serif-sc nsf.all; mkdir -p nsf/files; cp nsf.all/700.css nsf.all/900.css nsf/; cp nsf.all/files/*-700-normal.woff2 nsf.all/files/*-900-normal.woff2 nsf/files/; rm -rf nsf.all
sed -i 's/, url([^)]*\.woff) format(.woff.)//g' nss/200.css nsf/700.css nsf/900.css
