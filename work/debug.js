const fs=require('fs'), katex=require('./package/dist/katex.js');
const ps=require('./problems.json'), order=require('./order.json');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const M=(t,d)=>{try{return katex.renderToString(t,{displayMode:!!d,throwOnError:false,strict:false});}
                catch(e){return '<span class="err">'+esc(t)+'</span>';}};
const segHTML=ss=>ss.map(s=> s.t==='s'? esc(s.v) : M(s.v,s.d)).join('');
function blockHTML(b){
  if(b.k==='p') return '<p>'+segHTML(b.segs)+'</p>';
  if(b.k==='disp') return '<div class="dm">'+M(b.tex,1)+'</div>';
  if(b.k==='row') return '<div class="dm row">'+b.parts.map(s=>s.t==='s'?'<span class="lab">'+esc(s.v)+'</span>':M('\\displaystyle '+s.v,0)).join(' ')+'</div>';
  if(b.k==='table'){
    let h='<table>';
    b.rows.forEach(r=>{h+='<tr>'+r.map(c=>{const m=/^\$(.+)\$$/.exec(c);return '<td>'+(m?M(m[1],0):esc(c))+'</td>';}).join('')+'</tr>';});
    return h+'</table>';
  }
  return '';
}
function space(p){
  const t=p.text;
  const subs=(t.match(/（[ⅠⅡⅢⅣⅤ]）/g)||[]).length;
  const roman=(t.match(/（[ⅠⅡⅢⅣⅤ]）/g)||[]).length;
  const choice=/（　*）|^A[.．]/m.test(t);
  const fill=/_{3,}|\\underline/.test(t);
  let mm = choice?38 : (fill?38:60);
  mm += 15*Math.max(0,roman-1);
  if(/求下列|判别下列/.test(t)) mm+=25;
  return Math.min(mm,118);
}
const HEAD=`<meta charset="utf-8"><link rel="stylesheet" href="katex/katex.min.css">
<style>
@page{size:A4;margin:16mm 15mm 14mm 15mm;}
html,body{margin:0;padding:0;}
body{font-family:"WenQuanYi Zen Hei","Noto Sans CJK SC",serif;font-size:11.2pt;line-height:1.55;color:#000;}
.hd{border:1.2pt solid #000;padding:6pt 9pt;margin-bottom:10pt;}
.hd .t{font-size:14pt;font-weight:bold;letter-spacing:1pt;}
.hd .m{margin-top:5pt;font-size:11pt;}
.q{break-inside:avoid;page-break-inside:avoid;margin-bottom:4pt;}
.q .no{font-weight:bold;float:left;width:26pt;}
.q .bd{margin-left:26pt;}
p{margin:3pt 0;}
.dm{margin:5pt 0;text-align:center;}
.row{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10pt;}
.lab{font-size:11pt;}
table{border-collapse:collapse;margin:5pt auto;}
td{border:0.7pt solid #000;padding:2.5pt 10pt;text-align:center;font-size:10.5pt;}
.sp{border-bottom:0.6pt dotted #bbb;}
.katex{font-size:1.04em;}
.katex-display{margin:4pt 0;}
.err{color:#b00;font-family:monospace;}
</style>`;

const want=[351,352,353,463,484,30,54,56,462,249,250,301];
const sel=[]; ps.forEach((p,k)=>{ if(want.includes(p.src)) sel.push(k); });
let h='<!doctype html><html><head>'+HEAD+'</head><body>';
sel.forEach((gi,k)=>{const p=ps[gi];
 h+=`<div class="q"><div class="no">${k+1}.</div><div class="bd">`+p.blocks.map(blockHTML).join('')+
    `</div><div style="clear:both"></div><div class="sp" style="height:8mm"></div></div>`;});
h+='</body></html>';
fs.writeFileSync('html/debug.html',h);
console.log('debug items',sel.length);
