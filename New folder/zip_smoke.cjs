const {chromium}=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const fs=require('fs');process.env.QA_PORT='8769';const server=require('./preview.cjs');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});let result=[];
for(const letter of 'abc')for(const slug of ['index','san-pham']){
 const p=await b.newPage({viewport:{width:390,height:850}}),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
 await p.goto(`http://127.0.0.1:8769/qa/zip-check/website-${letter}/${slug}.html`,{waitUntil:'networkidle'});await p.evaluate(()=>[...document.images].forEach(i=>i.loading='eager'));
 for(let y=0;y<await p.evaluate(()=>document.body.scrollHeight);y+=800){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(90);}
 await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);
 result.push({letter,slug,errors,failed,...await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),cards:document.querySelectorAll('article .verified-grid .verified-card').length}))});await p.close();
}
fs.writeFileSync('qa/zip-browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await b.close();server.close();})();
