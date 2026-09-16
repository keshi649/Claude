const fs=require('fs'), katex=require('./package/dist/katex.js');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let ERR=0;
const M=(t,d)=>{try{return katex.renderToString(t,{displayMode:!!d,throwOnError:true,strict:false});}
   catch(e){ERR++;console.error("KATEX ERR:",e.message.slice(0,120),"|",t.slice(0,90)); return '<span class="err">'+esc(t)+'</span>';}};
function tbl(block){
  const rows=block.trim().split('\n').filter(r=>r.trim().startsWith('|'));
  let h='<table class="tb">';
  rows.forEach((r,i)=>{
    const cells=r.trim().replace(/^\|/,'').replace(/\|$/,'').split('|');
    if(cells.every(c=>/^\s*:?-+:?\s*$/.test(c))) return;
    h+='<tr>'+cells.map(c=>'<td>'+inline(c.trim())+'</td>').join('')+'</tr>';
  });
  return h+'</table>';
}
function inline(text){
  let out='', i=0, re=/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, m;
  while((m=re.exec(text))){
    out+=esc(text.slice(i,m.index));
    out+= m[1]!==undefined ? '<div class="dm">'+M(m[1].trim(),1)+'</div>' : M(m[2].trim(),0);
    i=m.index+m[0].length;
  }
  out+=esc(text.slice(i));
  return out.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
}
function body(text){
  // split into paragraph units: display math on its own, table blocks, plain lines
  const lines=text.split('\n');
  let h='', buf=[], i=0;
  const flush=()=>{ if(buf.length){ h+='<p>'+buf.map(inline).join('<br>')+'</p>'; buf=[]; } };
  while(i<lines.length){
    const L=lines[i];
    if(/^\s*$/.test(L)){ flush(); i++; continue; }
    if(/^\s*\|/.test(L)){ let j=i; while(j<lines.length&&/^\s*\|/.test(lines[j])) j++; flush(); h+=tbl(lines.slice(i,j).join('\n')); i=j; continue; }
    if(/^\s*\$\$/.test(L)){
      let j=i, acc=[];
      // collect until closing $$
      let s=L; let open=false;
      if(/^\s*\$\$[\s\S]*\$\$\s*$/.test(L)){ flush(); h+='<div class="dm">'+M(L.trim().replace(/^\$\$/,'').replace(/\$\$$/,'').trim(),1)+'</div>'; i++; continue; }
      acc.push(L.replace(/^\s*\$\$/,'')); j=i+1;
      while(j<lines.length && !/\$\$/.test(lines[j])){ acc.push(lines[j]); j++; }
      if(j<lines.length) acc.push(lines[j].replace(/\$\$.*$/,''));
      flush(); h+='<div class="dm">'+M(acc.join('\n').trim(),1)+'</div>'; i=j+1; continue;
    }
    buf.push(L); i++;
  }
  flush();
  return h;
}
const TITLES={'题目':'【题目】','切入点':'一、切入点是怎么来的','解答':'二、完整解答过程','考点':'三、这道题考什么','易错':'四、常见错法'};
const ORDER=['题目','切入点','解答','考点','易错'];
const HEAD=`<meta charset="utf-8"><link rel="stylesheet" href="katex/katex.min.css">
<style>
@page{size:A4;margin:16mm 15mm 14mm 15mm;}
html,body{margin:0;padding:0;}
body{font-family:"WenQuanYi Zen Hei","Noto Sans CJK SC",serif;font-size:10.5pt;line-height:1.6;color:#000;}
.hd{border:1.2pt solid #000;padding:6pt 9pt;margin-bottom:10pt;}
.hd .t{font-size:14pt;font-weight:bold;letter-spacing:1pt;}
.hd .m{margin-top:5pt;font-size:10.5pt;}
.q{margin-bottom:12pt;padding-bottom:6pt;border-bottom:0.6pt dashed #999;}
.qn{font-size:12pt;font-weight:bold;margin-bottom:4pt;border-left:3pt solid #000;padding-left:6pt;}
.sec{font-weight:bold;margin:6pt 0 2pt;}
.stem{background:#f2f2f2;padding:5pt 7pt;margin-bottom:5pt;}
p{margin:2pt 0;}
.dm{margin:4pt 0;text-align:center;}
.katex{font-size:1.03em;}
.katex-display{margin:3pt 0;}
table.tb{border-collapse:collapse;margin:4pt auto;}
table.tb td{border:0.6pt solid #000;padding:2pt 7pt;text-align:center;}
.err{color:#b00;font-family:monospace;}
</style>`;
function parse(path){
  const txt=fs.readFileSync(path,'utf8');
  const parts=txt.split(/^\[(\d+)\]\s*$/m);
  const out={};
  for(let i=1;i<parts.length;i+=2){
    const n=parseInt(parts[i]); const secs={};
    const sp=parts[i+1].split(/^@(题目|切入点|解答|考点|易错)\s*$/m);
    for(let j=1;j<sp.length;j+=2) secs[sp[j]]=sp[j+1].trim();
    out[n]=secs;
  }
  return out;
}
const files=fs.readdirSync('deep').filter(f=>/^set\d+\.md$/.test(f)).sort();
files.forEach(f=>{
  const pad=f.match(/(\d+)/)[1];
  const d=parse('deep/'+f);
  const nums=Object.keys(d).map(Number).sort((a,b)=>a-b);
  let h='<!doctype html><html><head>'+HEAD+'</head><body>';
  h+=`<div class="hd"><div class="t">数学练习　第 ${pad} 份　详解</div>
  <div class="m">共 ${nums.length} 题　　题号与《练习${pad}》一一对应</div></div>`;
  nums.forEach(n=>{
    const secs=d[n];
    h+=`<div class="q"><div class="qn">第 ${n} 题</div>`;
    let idx=0;
    ORDER.forEach(k=>{
      if(!secs[k]) return;
      if(k==='题目'){ h+='<div class="stem">'+body(secs[k])+'</div>'; return; }
      h+='<div class="sec">'+TITLES[k]+'</div>'+body(secs[k]);
    });
    h+='</div>';
  });
  h+='</body></html>';
  fs.writeFileSync(`html/详解${pad}.html`,h);
  console.log(f,'->',nums.length,'题','缺号:',nums.filter((v,i)=>v!==i+1).slice(0,3).join(','));
});
console.log('KATEX ERRORS:',ERR);
