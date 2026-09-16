const fs=require('fs'), katex=require('./package/dist/katex.js');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const M=(t,d)=>{try{return katex.renderToString(t,{displayMode:!!d,throwOnError:true,strict:false});}
   catch(e){console.error("KATEX ERR:",e.message.slice(0,120),"|",t.slice(0,90)); return '<span class="err">'+esc(t)+'</span>';}};
function segs(text){
  let out='', i=0, re=/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, m;
  while((m=re.exec(text))){
    let pre=esc(text.slice(i,m.index));
    if(m[1]!==undefined) pre=pre.replace(/\n+$/,'');
    out+=pre.replace(/\n/g,'<br>');
    out+= m[1]!==undefined ? '<div class="dm">'+M(m[1].trim(),1)+'</div>' : M(m[2].trim(),0);
    if(m[1]!==undefined){ const rest=text.slice(m.index+m[0].length); const k=rest.match(/^\n+/); if(k) i=m.index+m[0].length+k[0].length, re.lastIndex=i; }
    i=m.index+m[0].length;
  }
  out+=esc(text.slice(i)).replace(/\n/g,'<br>');
  return out.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
}
const HEAD=`<meta charset="utf-8"><link rel="stylesheet" href="katex/katex.min.css">
<style>
@page{size:A4;margin:16mm 15mm 14mm 15mm;}
html,body{margin:0;padding:0;}
body{font-family:"WenQuanYi Zen Hei","Noto Sans CJK SC",serif;font-size:10.8pt;line-height:1.55;color:#000;}
.hd{border:1.2pt solid #000;padding:6pt 9pt;margin-bottom:10pt;}
.hd .t{font-size:14pt;font-weight:bold;letter-spacing:1pt;}
.hd .m{margin-top:5pt;font-size:10.5pt;}
.q{break-inside:avoid;page-break-inside:avoid;margin-bottom:9pt;}
.q .no{font-weight:bold;float:left;width:26pt;}
.q .bd{margin-left:26pt;}
.dm{margin:4pt 0;text-align:center;}
.katex{font-size:1.03em;}
.katex-display{margin:3pt 0;}
.err{color:#b00;font-family:monospace;}
</style>`;
const sets=JSON.parse(fs.readFileSync('solutions.json','utf8'));
sets.forEach((items,i)=>{
  const pad=String(i+1).padStart(2,'0');
  let h='<!doctype html><html><head>'+HEAD+'</head><body>';
  h+=`<div class="hd"><div class="t">数学练习　第 ${pad} 份　答案与解析</div>
  <div class="m">共 ${items.length} 题　　与《练习${pad}》题号一一对应</div></div>`;
  items.forEach((s,k)=>{
    h+=`<div class="q"><div class="no">${k+1}.</div><div class="bd">`+segs(s)+`</div><div style="clear:both"></div></div>`;
  });
  h+='</body></html>';
  fs.writeFileSync(`html/解析${pad}.html`,h);
});
console.log('sets',sets.map(s=>s.length).join(','));
