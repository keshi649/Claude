/**
 * 打包成单个 HTML 文件（手机点开链接就能玩的托管页面用）：
 * 所有 JS / CSS 内联进一个文件，没有任何外部请求；按托管页面的约定只输出页面内容
 * （title、style、根节点、脚本），外层的 doctype / head / body 由托管方补上。
 *
 * 用法：npm run build:artifact [输出路径]（默认 dist-artifact/jinghe.html）
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'vite';

const out = process.argv[2] ?? 'dist-artifact/jinghe.html';
const tmp = 'dist-artifact/build';

await build({
  configFile: 'vite.config.ts',
  base: './',
  logLevel: 'warn',
  build: {
    outDir: tmp,
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { codeSplitting: false } },
  },
});

const assets = join(tmp, 'assets');
const files = readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));
if (js.length !== 1) throw new Error(`期望打包成 1 个 JS 文件，实际 ${js.length} 个：${js.join(', ')}`);

// 内联到 <script> 里时，</script 与 <!-- 会提前结束或打乱脚本，按 HTML 规范转义
let jsText = readFileSync(join(assets, js[0]!), 'utf8').replace(/<\/script/gi, '<\\/script');
if (jsText.includes('<!--')) throw new Error('脚本里含有 <!--，需要额外处理');
const cssText = css.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');

const html = `<title>晶核争锋</title>
<meta name="theme-color" content="#0b120b">
<style>
:root { color-scheme: dark; }
html, body { background: #0b120b; color: #eef2f5; }
${cssText}
</style>
<div id="app"></div>
<script type="module">
${jsText}
</script>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`已生成 ${out}（${(html.length / 1024).toFixed(0)} KB）`);
