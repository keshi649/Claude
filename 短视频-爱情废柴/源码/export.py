#!/usr/bin/env python3
"""把歌词和它在成片里的时间写成文本，贴进 ../歌词与发布文案.txt 的第三部分。用法：python3 export.py"""
import json
L = json.load(open('timing.json', encoding='utf8'))
SEC = {'v1': '主歌一', 'v2': '主歌二', 'c1': '副歌（第一遍）', 'v3': '主歌二（第二遍）', 'c2': '副歌（第二遍）', 'c3': '副歌（第三遍）'}
last = None
for l in L:
    if l['sec'] != last: print('\n【' + SEC[l['sec']] + '】'); last = l['sec']
    t = l['t0']; print('%d:%04.1f  %s' % (t // 60, t % 60, l['text']))
