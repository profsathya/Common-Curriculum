/** Isolated checks: no real Canvas, student, or AI calls. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());if(u.hostname!=='sprint3.test')return route.abort();
  const f=path.join(root,decodeURIComponent(u.pathname));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:''});
  return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(f)]||'text/plain',body:fs.readFileSync(f)});
 });
 await context.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}}}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://sprint3.test/cst286/grade-my-two-partners-sprint-3.html');
 assert.equal(await page.locator('[data-save]').evaluateAll(es=>es.every(e=>e.type==='checkbox'?!e.checked:!e.value)),true);
 const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
 await page.click('#copy-reviews');assert.match(await page.locator('#summary-out').inputValue(),/DRAFT/);assert.match(await page.locator('#summary-out').inputValue(),/not scored/);
 for(const n of [1]){
  await page.fill(`#p${n}-name`,`Partner ${n}`);await page.selectOption(`#p${n}-path`,'C');
  await page.fill(`#p${n}-work`,`Partner ${n} submitted relationship and scenarios version 1`);
  for(const field of await page.locator(`#partner-${n} [data-score]`).all())await field.fill(await field.getAttribute('max'));
  for(const field of await page.locator(`#partner-${n} textarea`).all())if(!(await field.inputValue()))await field.fill(`Evidence and reasoning for partner ${n}`);
 }
 await page.fill('#grader-name','Another classmate');
 await page.check('#eligible-nonreciprocal');await page.check('#eligible-new-partner');
 await page.fill('#reflection','I will check the assumptions of my own model.');
 await page.getByText('Self-check',{exact:true}).click();await page.check('#check-2');await page.reload();
 assert.equal(await page.inputValue('#p1-name'),'Partner 1');assert.equal(await page.inputValue('#p1-path'),'C');assert.equal(await page.inputValue('#grader-name'),'Another classmate');assert.equal(await page.isChecked('#eligible-new-partner'),true);assert.equal(await page.locator('#partner-2').count(),0);assert.equal(await page.isChecked('#check-2'),true);
 assert.match(await page.textContent('#total-1-relationship'),/100 \/ 100/);assert.match(await page.textContent('#total-1-scenarios'),/100 \/ 100/);
 assert.match(await page.textContent('#partner-1'),/reproducible build test/);
 await page.click('#copy-reviews');let txt=await page.inputValue('#summary-out');assert.doesNotMatch(txt,/DRAFT/);assert.match(txt,/CLASSMATE I AM GRADING/);assert.doesNotMatch(txt,/PARTNER 2/);assert.match(txt,/My agreed grader/);assert.match(txt,/Neither my grader.*Sprint 1 or Sprint 2 exam/);assert.equal((txt.match(/Recommended total: 100 \/ 100/g)||[]).length,2);assert.match(txt,/reproducible build test/);assert.match(txt,/\[x\].*Every score/);assert.match(txt,/I will check the assumptions/);
 const before=txt;await page.fill('#p1-relationship-0-score','101');await page.click('#copy-reviews');assert.match(await page.textContent('#copy-status'),/Correct/);assert.equal(await page.inputValue('#summary-out'),before);
 await page.fill('#p1-relationship-0-score','0');await page.click('#copy-reviews');assert.match(await page.inputValue('#summary-out'),/Recommended points: 0 \/ 10/);
 await page.fill('#grader-name',' Partner 1 ');await page.click('#copy-reviews');assert.match(await page.inputValue('#summary-out'),/Reciprocal grading is not allowed/);await page.fill('#grader-name','Another classmate');
 await page.uncheck('#eligible-new-partner');await page.click('#copy-reviews');assert.match(await page.inputValue('#summary-out'),/DRAFT/);await page.check('#eligible-new-partner');
 await page.uncheck('#eligible-nonreciprocal');await page.click('#copy-reviews');assert.match(await page.inputValue('#summary-out'),/DRAFT/);await page.check('#eligible-nonreciprocal');
 await page.evaluate(()=>{const k='cc-gi:cst286-grade-my-two-partners-sprint-3',s=JSON.parse(localStorage.getItem(k));s['p2-name']='Legacy classmate';s['p2-feedback']='Keep this earlier draft';localStorage.setItem(k,JSON.stringify(s));});
 await page.reload();await page.fill('#reflection','Updated reflection');await page.click('#copy-reviews');assert.doesNotMatch(await page.inputValue('#summary-out'),/Legacy classmate|Keep this earlier draft/);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cc-gi:cst286-grade-my-two-partners-sprint-3'))['p2-feedback']),'Keep this earlier draft');
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/sprint3-partner-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/sprint3-partner-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 console.log('PASS: one review, saved drafts and legacy preservation, two totals, eligibility confirmations, nonreciprocal name check, score ranges and mobile layout.');
 await page.goto('http://sprint3.test/cst286/five-real-world-scenarios-sprint-3.html?s3path=C');
 await page.fill('#bx-build_run','Build test marker: new input, predicted 2, observed 2.1, independent evidence.');
 await page.click('#copy-btn');assert.match(await page.inputValue('#summary-out'),/Build test marker/);assert.match(await page.inputValue('#summary-out'),/reproducible build test/);
 await page.goto('http://sprint3.test/cst286/five-real-world-scenarios-sprint-3.html?s3path=A');await page.click('#copy-btn');assert.doesNotMatch(await page.inputValue('#summary-out'),/Build test marker|reproducible build test/);assert.equal(await page.locator('#ex-a').count(),0);
 await page.screenshot({path:'/tmp/sprint3-later-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: Path C build evidence exports only with Path C; no supplied Path A scenario; no browser errors.');
 const blocked=await browser.newContext();await blocked.route('**/*',route=>{
  const u=new URL(route.request().url());if(u.hostname!=='sprint3.test')return route.abort();const f=path.join(root,u.pathname);return route.fulfill({contentType:f.endsWith('.js')?'application/javascript':'text/html',body:fs.readFileSync(f)});
 });
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
 const p=await blocked.newPage();await p.goto('http://sprint3.test/cst286/grade-my-two-partners-sprint-3.html');assert.equal(await p.isVisible('#storage-warning'),true);console.log('PASS: blocked storage is reported.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
