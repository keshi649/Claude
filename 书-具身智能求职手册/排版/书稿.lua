-- pandoc 过滤器：把书稿里的约定写法转成 LaTeX / EPUB
--   # 标题 {.part}          → \part{标题}
--   ::: engineer / examiner / takeaway / career / try / note   → 对应 tcolorbox 小框
--     （小框第一段如果整段加粗，就当小框标题）
--   图片 xx.pdf             → EPUB 里换成 xx.png

local is_latex = FORMAT:match('latex') ~= nil

local boxes = {
  engineer = {env = 'engineerbox', label = '工程师视角'},
  examiner = {env = 'examinerbox', label = '考官视角'},
  takeaway = {env = 'takeawaybox', label = '本章一句话'},
  career   = {env = 'careerbox',   label = '转行者笔记'},
  try      = {env = 'trybox',      label = '动手试试'},
  note     = {env = 'notebox',     label = ''},
}

local function latex_inline(inlines)
  return pandoc.write(pandoc.Pandoc({pandoc.Plain(inlines)}), 'latex'):gsub('\n$', '')
end

function Header(el)
  if el.level == 1 and el.classes:includes('part') then
    if is_latex then
      return pandoc.RawBlock('latex', '\\part{' .. latex_inline(el.content) .. '}')
    else
      el.classes:insert('part-title')
      return el
    end
  end
end

function Div(el)
  for cls, spec in pairs(boxes) do
    if el.classes:includes(cls) then
      local title = nil
      local first = el.content[1]
      if first and first.t == 'Para' and #first.content == 1 and first.content[1].t == 'Strong' then
        title = first.content[1].content
        table.remove(el.content, 1)
        -- 书稿里写成“转行者笔记：别只看岗位名称”时，去掉重复的“转行者笔记：”，小框自己会加
        local prefix = spec.label .. '：'
        local head = title[1]
        if spec.label ~= '' and head and head.t == 'Str' and head.text:sub(1, #prefix) == prefix then
          head.text = head.text:sub(#prefix + 1)
          if head.text == '' then table.remove(title, 1) end
        end
      end
      if is_latex then
        local t = title and latex_inline(title) or ''
        table.insert(el.content, 1, pandoc.RawBlock('latex', '\\begin{' .. spec.env .. '}{' .. t .. '}'))
        table.insert(el.content, pandoc.RawBlock('latex', '\\end{' .. spec.env .. '}'))
        return el.content
      else
        local head = {}
        if spec.label ~= '' then table.insert(head, pandoc.Str(spec.label)) end
        if title then
          if #head > 0 then table.insert(head, pandoc.Str('｜')) end
          for _, x in ipairs(title) do table.insert(head, x) end
        end
        if #head > 0 then
          table.insert(el.content, 1, pandoc.Para({pandoc.Strong(head)}))
        end
        el.classes = pandoc.List({'box', cls})
        return el
      end
    end
  end
end

function Image(el)
  if not is_latex then
    el.src = el.src:gsub('%.pdf$', '.png')
  end
  return el
end

-- pandoc 的 LaTeX 输出会把中文引号 “” 改成 TeX 的 `` ''，被西文字体排成半角；
-- 这里把引号原样以 raw latex 输出，交给 xeCJK 按全角标点排。
local quote_chars = {['“']=true, ['”']=true, ['‘']=true, ['’']=true, ['—']=true, ['…']=true}
local function split_quotes(text)
  local out, buf = {}, ''
  for _, c in utf8.codes(text) do
    local ch = utf8.char(c)
    if quote_chars[ch] then
      if buf ~= '' then table.insert(out, pandoc.Str(buf)); buf = '' end
      table.insert(out, pandoc.RawInline('latex', ch))
    else
      buf = buf .. ch
    end
  end
  if buf ~= '' then table.insert(out, pandoc.Str(buf)) end
  return out
end

-- 正文里带下划线的名字（unitree_sdk2 这类仓库名）：TeX 会把它断成“uni-tree_sdk2”，读者会以为名字里有连字符。
-- 改成每段不许断词，只在下划线后面可以换行（不加连字符）。
local function identifier_latex(id)
  local parts = {}
  for seg in (id .. '_'):gmatch('([^_]*)_') do table.insert(parts, '\\mbox{' .. seg .. '}') end
  return table.concat(parts, '\\_\\allowbreak{}')
end

function Str(el)
  if not is_latex then return nil end
  local t = el.text
  local has_quote = t:find('“') or t:find('”') or t:find('‘') or t:find('’') or t:find('—') or t:find('…')
  if not (has_quote or t:find('%w_%w')) then return nil end
  local out, pos = {}, 1
  while true do
    local s, e = t:find('[%w%.]*%w_[%w_%.]*%w', pos)
    if not s then break end
    for _, x in ipairs(split_quotes(t:sub(pos, s - 1))) do table.insert(out, x) end
    table.insert(out, pandoc.RawInline('latex', identifier_latex(t:sub(s, e))))
    pos = e + 1
  end
  for _, x in ipairs(split_quotes(t:sub(pos))) do table.insert(out, x) end
  return out
end

-- 长的行内代码（路径、文件名）：允许在 / 和 _ 后面换行，不然整串挤到下一行，上一行被拉得很稀。
function Code(el)
  if not is_latex or utf8.len(el.text) <= 16 then return nil end
  local tex = pandoc.write(pandoc.Pandoc({pandoc.Plain({el})}), 'latex'):gsub('\n$', '')
  tex = tex:gsub('/', '/\\allowbreak{}'):gsub('\\_', '\\_\\allowbreak{}')
  return pandoc.RawInline('latex', tex)
end

-- EPUB 没有 LaTeX 的自动编号：在一级标题前补上“第一部”“第 1 章”“附录 A”，目录里也跟着有。
-- 正文从 \mainmatter 开始编章号，\appendix 之后改编附录字母；{.unnumbered} 的不编。
local cn_digits = {'一', '二', '三', '四', '五', '六', '七', '八', '九', '十'}
function Pandoc(doc)
  if is_latex then return nil end
  local stage, part, chap, app = 'front', 0, 0, 0
  for _, b in ipairs(doc.blocks) do
    if b.t == 'RawBlock' and b.format == 'latex' then
      if b.text:find('\\mainmatter') then stage = 'main'
      elseif b.text:find('\\appendix') then stage = 'appendix' end
    elseif b.t == 'Header' and b.level == 1 and not b.classes:includes('unnumbered') then
      local prefix
      if b.classes:includes('part') then
        part = part + 1
        prefix = '第' .. cn_digits[part] .. '部　'
      elseif stage == 'main' then
        chap = chap + 1
        prefix = '第 ' .. chap .. ' 章　'
      elseif stage == 'appendix' then
        app = app + 1
        prefix = '附录 ' .. string.char(64 + app) .. '　'
      end
      if prefix then b.content:insert(1, pandoc.Str(prefix)) end
    end
  end
  return doc
end
