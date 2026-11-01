/** Regression checks for the Sprint 3 path drafts and learning-record export.
 * Run: node tests/sprint3-paths.browser.cjs (requires Playwright and Chrome).
 * All network requests are intercepted; no real student or AI services are used.
 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const names=['my-sprint-3-goal-and-plan','find-and-confirm-my-relationship','five-real-world-scenarios-sprint-3','my-sprint-3-experience'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname!=='sprint3.test') return route.abort();
  const file=path.join(root,decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()) return route.fulfill({status:404,body:'not found'});
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
  return route.fulfill({contentType:mime,body:fs.readFileSync(file)});
 });
 await context.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}}});});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const goto=async name=>{await page.goto('http://sprint3.test/cst286/'+name+'.html');await page.waitForLoadState('load');};
 const switchTo=async p=>{await Promise.all([page.waitForEvent('load'),page.check('#path-'+p)]);};
 for(const name of names){
  await goto(name);
  await page.evaluate(()=>localStorage.clear());await page.reload();
  assert.equal(await page.locator('#gated').isVisible(),false);
  for(const letter of ['A','B','C']){
   await switchTo(letter);
   const field=page.locator('textarea[data-key]').filter({visible:true}).first();
   assert.equal(await field.inputValue(),'','first entry must be empty '+name+' '+letter);
   assert.equal(await page.locator('input[data-check]:checked').count(),0);
   await field.fill(name+' '+letter+' own work');
   await page.locator('input[data-check]').first().check();
  }
  for(const letter of ['A','B','C']){
   if(letter!==await page.locator('input[name=s3path]:checked').inputValue()) await switchTo(letter);
   assert.equal(await page.locator('textarea[data-key]').filter({visible:true}).first().inputValue(),name+' '+letter+' own work');
   assert.equal(await page.locator('input[data-check]:checked').count(),1);
  }
  const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));
  assert.equal(new Set(ids).size,ids.length,'unique HTML ids '+name);
  const points=await page.locator('ul.selfcheck .pts').allTextContents();
  assert.equal(points.reduce((n,t)=>n+Number(t.match(/\d+/)[0]),0),100);
 }
 console.log('PASS: all four pages keep empty first entries and independent A/B/C answers and checks.');
 await goto(names[0]);await page.evaluate(()=>localStorage.clear());await page.reload();await switchTo('A');
 assert.equal(await page.locator('#dojo-tick').isDisabled(),true);
 assert.equal(await page.locator('#bx-given').inputValue(),'');
 await page.fill('#bx-predict','A prediction');await page.fill('#bx-leave','A next step');
 await page.locator('#bx-leave').blur();
 await switchTo('B');await page.fill('#bx-predict','B prediction');await page.fill('#bx-leave','B next step');await page.locator('#bx-leave').blur();
 await goto(names[1]);assert.equal(await page.locator('#look-text').textContent(),'B prediction');
 assert.equal(await page.locator('#look-leave-text').textContent(),'B next step');
 await switchTo('A');assert.equal(await page.locator('#look-text').textContent(),'A prediction');
 assert.equal(await page.locator('#look-leave-text').textContent(),'A next step');
 const reveal=page.locator('[data-reveal=bk_notice]');
 assert.equal(await reveal.isDisabled(),true);
 await page.fill('#bx-bk_notice','My original guess and reason');await reveal.click();
 assert.equal(await page.locator('#reveal-bk_notice').isVisible(),true);
 await page.fill('#bx-bk_notice','My later revised explanation');
 await page.check('input[name=book_focus][value=speed]');
 for(const [key,val] of Object.entries({b:2,mass:1.5,r1:.75,r2:.45,omega:3})) await page.locator('[data-key=model_speed_'+key+']').fill(String(val));
 await page.fill('#bx-bk_speed_predict','I predict 4.2454 rad/s from conservation of angular momentum.');
 await page.click('[data-run-model=speed]');
 assert.match(await page.locator('#bx-bk_speed_trials').inputValue(),/4\.2454 rad\/s/);
 await page.fill('#bx-bk_speed_compare','Speed reflection marker');
 await page.check('input[name=book_focus][value=direction]');
 for(const [key,val] of Object.entries({mass:.3,distance:.05,inertia:.000375,omega:125.66})) await page.locator('[data-key=model_direction_'+key+']').fill(String(val));
 await page.fill('#bx-bk_direction_predict','I predict about 3.12 rad/s under the steady precession approximation.');
 await page.click('[data-run-model=direction]');
 assert.match(await page.locator('#bx-bk_direction_trials').inputValue(),/3\.1195 rad\/s/);
 await page.click('#copy-btn');
 let text=await page.locator('#summary-out').inputValue();
 assert.match(text,/My original guess and reason/);assert.match(text,/My later revised explanation/);
 assert.match(text,/3\.1195 rad\/s/);assert.match(text,/ADDITIONAL EXPLORATION: SPIN SPEED/);assert.match(text,/Speed reflection marker|4\.2454 rad\/s/);
 await page.reload();assert.equal(await page.locator('input[name=book_focus]:checked').inputValue(),'direction');
 await page.check('input[name=book_focus][value=speed]');assert.equal(await page.locator('#bx-bk_speed_compare').inputValue(),'Speed reflection marker');
 await switchTo('B');await page.click('#copy-btn');text=await page.locator('#summary-out').inputValue();
 assert.doesNotMatch(text,/My original guess|My later revised|PATH A ·|Speed reflection marker|My starting observation/);
 await switchTo('A');assert.equal(await page.locator('#bx-bk_notice').inputValue(),'My later revised explanation');
 console.log('PASS: path-specific look-back context, reveal snapshots, numerical models, branch restoration and filtered submission.');
 // Old autogenerated text is removed without losing student-authored text or the original backup.
 await page.evaluate(()=>{
  localStorage.clear();localStorage.setItem('cst286.s3.path','A');
  localStorage.setItem('cc-gi:cst286-my-sprint-3-goal-and-plan',JSON.stringify({answers:{path:{text:'A'},given:{text:'how fast something is spinning, in radians per second, and how its mass is arranged around the axis before and after the arrangement changes, as a moment of inertia in kilogram square meters,'},predict:{text:'My own old prediction'}},checks:{'sc-1':true}}));
 });
 await goto(names[0]);assert.equal(await page.locator('#bx-given').inputValue(),'');assert.equal(await page.locator('#bx-predict').inputValue(),'My own old prediction');
 assert.ok(await page.evaluate(()=>localStorage.getItem('cc-gi:cst286-my-sprint-3-goal-and-plan')));
 await switchTo('C');assert.equal(await page.locator('#bx-predict').inputValue(),'');
 assert.match(await page.locator('[data-path=C]').allTextContents().then(a=>a.join(' ')),/input.*change/);
 console.log('PASS: migration preserves authored work and original data while removing exact autofill text.');
 // Narrow layouts and a few visual review artifacts.
 await switchTo('A');await page.screenshot({path:'/tmp/sprint3-goal-desktop.png',fullPage:true});
 await goto(names[1]);await page.locator('#path-a-book').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/sprint3-book-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#path-a-book').scrollIntoViewIfNeeded();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'no horizontal overflow');
 await page.screenshot({path:'/tmp/sprint3-book-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: mobile layout and no JavaScript errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
