const katex = require('./package/dist/katex.js');
const ps = require('./problems.json');
let errs = [];
const MACROS = {};
function tryTex(tex, disp, id){
  try { katex.renderToString(tex, {displayMode:!!disp, throwOnError:true, strict:false, macros:MACROS}); }
  catch(e){ errs.push([id, e.message.slice(0,160), tex.slice(0,120)]); }
}
ps.forEach((p,idx)=>{
  p.blocks.forEach(b=>{
    if(b.k==='disp') tryTex(b.tex,1,idx);
    else if(b.k==='p') b.segs.forEach(s=>{ if(s.t==='m') tryTex(s.v,s.d,idx); });
    else if(b.k==='table') b.rows.forEach(r=>r.forEach(c=>{
        const m=/^\$(.+)\$$/.exec(c); if(m) tryTex(m[1],0,idx); }));
  });
});
console.log("errors:", errs.length);
errs.slice(0,40).forEach(e=>console.log(e[0],"|",e[1],"|",e[2]));
