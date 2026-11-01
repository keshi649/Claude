-- pandoc 过滤器（只给 EPUB 用）：把公式排成 PNG 图片放进电子书。
-- 电子书阅读器对 MathML 的支持参差不齐，pandoc 默认的纯文本公式又认不出分式、根号，
-- 会把 \frac{g}{z} 原样露给读者。所以：
--   行间公式（$$…$$）一律排成图；
--   行内公式只有带分式、根号、求和的才排成图，其余照旧按文字排（能跟着字号缩放、换行）。
-- 图片用 XeLaTeX 排（字体和纸书一致），按公式内容的 sha1 缓存在 排版/build/公式/。
-- 尺寸按正文 10.5 pt 换算成 em：行间公式定宽度（窄屏上按比例缩小），行内公式定高度并下沉到基线。
-- 底色跟着所在的小框走（和 epub.css 里的底色一致），不用透明底：夜间模式下透明底的黑字会看不见。

if FORMAT:match('latex') then return {} end

local dir = '排版/build/公式'
local body_pt = 10.5
local display_scale = 1.15   -- 行间公式放大一点，手机上分式才看得清
local box_bg = {engineer = 'F3F3F3', try = 'ECECEC'}   -- 和 epub.css 一致

local preamble = [[
\documentclass[border=0pt]{standalone}
\usepackage{amsmath}
\usepackage{xcolor}
\usepackage{fontspec}
\usepackage{xeCJK}
\setCJKmainfont{NotoSerifCJK-Regular.ttc}[Path=/usr/share/fonts/opentype/noto/, FontIndex=2]
\setmainfont{TeX Gyre Pagella}
\usepackage{unicode-math}
\setmathfont{TeX Gyre Pagella Math}
\begin{document}
\fontsize{10.5}{13}\selectfont
]]

local function read_file(path)
  local f = io.open(path, 'r')
  if not f then return nil end
  local s = f:read('a')
  f:close()
  return s
end

-- 排一条公式，返回 图片路径, 高, 深, 宽（单位 pt）；失败返回 nil
local function render(tex, display, bg)
  local base = dir .. '/' .. pandoc.utils.sha1((display and 'D:' or 'I:') .. bg .. ':' .. tex)
  local dim = read_file(base .. '.dim')
  if not dim then
    os.execute('mkdir -p ' .. dir)
    local f = io.open(base .. '.tex', 'w')
    f:write(preamble)
    f:write('\\pagecolor[HTML]{' .. bg .. '}%\n')
    f:write('\\setbox0\\hbox{$' .. (display and '\\displaystyle ' or '') .. tex .. '$}%\n')
    f:write('\\typeout{DIM:\\the\\ht0:\\the\\dp0:\\the\\wd0}\\box0\n\\end{document}\n')
    f:close()
    local ok = os.execute('xelatex -interaction=nonstopmode -halt-on-error -output-directory=' .. dir
      .. ' ' .. base .. '.tex > /dev/null 2>&1')
    local log = read_file(base .. '.log') or ''
    local h, d, w = log:match('DIM:([%d%.]+)pt:([%d%.]+)pt:([%d%.]+)pt')
    if not ok or not h then
      io.stderr:write('[公式.lua] 排不出来，保留原样：' .. tex .. '\n')
      return nil
    end
    os.execute('pdftoppm -r 600 -gray -png -singlefile ' .. base .. '.pdf ' .. base)
    dim = h .. ' ' .. d .. ' ' .. w
    local g = io.open(base .. '.dim', 'w')
    g:write(dim)
    g:close()
    for _, ext in ipairs({'.aux', '.log', '.pdf', '.tex'}) do os.remove(base .. ext) end
  end
  local h, d, w = dim:match('(%S+) (%S+) (%S+)')
  return base .. '.png', tonumber(h), tonumber(d), tonumber(w)
end

local function to_image(el, bg)
  local display = el.mathtype == 'DisplayMath'
  if not display and not (el.text:find('\\frac') or el.text:find('\\sqrt') or el.text:find('\\sum')) then
    return nil
  end
  local src, h, d, w = render(el.text, display, bg)
  if not src then return nil end
  local cls, style
  if display then
    cls = 'eq-display'
    style = string.format('width:%.2fem', w / body_pt * display_scale)
  else
    cls = 'eq-inline'
    style = string.format('height:%.2fem;vertical-align:-%.2fem', (h + d) / body_pt, d / body_pt)
  end
  return pandoc.Image({pandoc.Str(el.text)}, src, '', pandoc.Attr('', {cls}, {{'style', style}}))
end

return {{
  traverse = 'topdown',
  -- 有底色的小框：框里的公式用框的底色排，排完不再往下走
  Div = function(el)
    for cls, bg in pairs(box_bg) do
      if el.classes:includes(cls) then
        return el:walk({Math = function(m) return to_image(m, bg) end}), false
      end
    end
  end,
  Math = function(el) return to_image(el, 'FFFFFF') end,
}}
