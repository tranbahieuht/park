const {chromium}=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const fs=require('fs');process.env.QA_PORT='8768';const server=require('./preview.cjs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});let result=[];
for(const letter of 'abc'){
 const page=await browser.newPage({viewport:{width:390,height:850}});await page.goto(`http://127.0.0.1:8768/website-${letter}/`,{waitUntil:'networkidle'});
 const button=page.locator(letter==='b'?'.custom-menu':'.w-nav-button').filter({visible:true}).first();await button.click();await page.waitForTimeout(700);
 const nav=page.locator(letter==='b'?'.nav-menu-main-2':'.w-nav-menu').filter({visible:true}).first();
 const links=await nav.locator('a').evaluateAll(els=>els.filter(a=>a.getBoundingClientRect().width>0&&a.innerText.trim()).map(a=>({text:a.innerText,href:a.getAttribute('href')})));
 await page.screenshot({path:`qa/${letter}-menu-final.png`});result.push({letter,menuVisible:await nav.isVisible(),links});await button.click();
 const contact=page.locator('a.verified-contact-link').first();result.push({letter,formDestination:await contact.getAttribute('href')});
 await page.goto(`http://127.0.0.1:8768/website-${letter}/gia-thi-truong.html`,{waitUntil:'networkidle'});const details=page.locator('article details').first();if(await details.count()){await details.locator('summary').click();result.push({letter,marketAccordionOpen:await details.getAttribute('open')!==null,marketHorizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});}
 await page.goto(`http://127.0.0.1:8768/website-${letter}/lien-he.html`,{waitUntil:'networkidle'});result.push({letter,contactTitle:await page.locator('article h1').innerText(),phone:await page.locator('article a[href^="tel:"]').getAttribute('href'),email:await page.locator('article a[href^="mailto:"]').getAttribute('href')});
 await page.screenshot({path:`qa/${letter}-contact-final.png`,fullPage:true});await page.close();
}
fs.writeFileSync('qa/interaction-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();server.close();})();
