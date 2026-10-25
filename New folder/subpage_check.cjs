const {chromium}=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');process.env.QA_PORT='8767';const server=require('./preview.cjs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});let results=[];
for(const letter of 'abc')for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const slug of ['gioi-thieu','hoat-dong','san-pham','lien-he','dong-nguyen-chat','tin-tuc']){
  let errors=[],failed=[];const err=e=>errors.push(e.message),resp=r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);};page.on('pageerror',err);page.on('response',resp);
  await page.goto(`http://127.0.0.1:8767/website-${letter}/${slug}.html`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.images&&[...document.images].forEach(i=>i.loading='eager'));await page.waitForTimeout(300);
  const data=await page.evaluate(()=>({title:document.title,h1:document.querySelector('article h1')?.innerText,chars:document.querySelector('article')?.innerText.length,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),productCards:document.querySelectorAll('article .verified-grid .verified-card').length,opacity:getComputedStyle(document.body).opacity}));
  if(['san-pham','gioi-thieu','lien-he'].includes(slug))await page.screenshot({path:`qa/${letter}-${slug}-${width}.png`,fullPage:true});
  results.push({letter,width,slug,errors,failed,...data});page.removeListener('pageerror',err);page.removeListener('response',resp);
 }
 await page.goto(`http://127.0.0.1:8767/website-${letter}/`,{waitUntil:'networkidle'});
 let menu={};const button=page.locator('.w-nav-button').filter({visible:true}).first();
 if(width===390&&await button.count()){await button.click();await page.waitForTimeout(500);menu={clicked:true,expanded:await button.getAttribute('aria-expanded'),openClass:await button.getAttribute('class')};await page.screenshot({path:`qa/${letter}-menu-mobile.png`});await button.click();await page.waitForTimeout(500);}
 let tabs={};if(letter==='a'){const tab=page.locator('.w-tab-link').nth(1);await tab.scrollIntoViewIfNeeded();await tab.click();await page.waitForTimeout(300);tabs={clicked:true,active:await tab.getAttribute('aria-selected'),class:await tab.getAttribute('class')};}
 results.push({letter,width,interactions:{menu,tabs}});await page.close();
}
fs.writeFileSync('qa/subpage-results.json',JSON.stringify(results,null,2));await browser.close();server.close();console.log(JSON.stringify(results.filter(r=>r.overflow||r.errors?.length||r.failed?.length||r.brokenImages?.length||r.interactions),null,2));})();
