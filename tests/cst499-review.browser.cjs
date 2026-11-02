/* Local synthetic drafts only; no student data or external requests. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const ctx=await browser.newContext({acceptDownloads:true});
 await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='review.test')return route.abort();const f=path.join(root,decodeURIComponent(u.pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:''});return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'text/plain',body:fs.readFileSync(f)});});
 await ctx.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.copiedText=t;}}}));
 const errors=[];ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 const a=await ctx.newPage(),b=await ctx.newPage(),url=slug=>'http://review.test/cst499/'+slug+'.html';
 const slugs=['quality-review','my-claim','integrative-solving-report','interactive-poster-first-version','decisions-behind-my-work','rehearsal-in-class','interactive-poster-final'];
 for(const slug of slugs){
  await a.goto(url(slug));await b.goto(url(slug));
  const field=a.locator('textarea[data-key],textarea[data-skey]').first();
  // The older quality-review form uses data-key on its containing task.
  const f=(await field.count())?field:a.locator('textarea').first();const id=await f.getAttribute('id');
  await f.fill('Newer work A');await f.blur();
  const key=await a.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('cc-gi:')&&!k.endsWith(':recovery')&&localStorage[k].includes('Newer work A')));
  assert.ok(key,slug+' saved');
  const raw=await a.evaluate(k=>localStorage[k],key);
  await b.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert.equal(await b.evaluate(k=>localStorage[k],key),raw,slug+' unchanged tab');
  await b.fill('#'+id,'Conflicting work B');await b.locator('#'+id).blur();
  assert.match(await b.locator('.draft-safety').textContent(),/Another tab saved newer work/,slug);
  assert.equal(await b.evaluate(k=>localStorage[k],key),raw);
  const history=await b.evaluate(k=>JSON.parse(localStorage[k+':recovery']),key);assert.ok(history.some(v=>v.raw.includes('Conflicting work B')));
  await b.getByRole('button',{name:"Use this tab's draft"}).click();assert.match(await b.evaluate(k=>localStorage[k],key),/Conflicting work B/);
  if(await b.locator('textarea[data-leave]').count()){
   await a.reload();await b.reload();
   const leave=a.locator('textarea[data-leave]'),lk=await leave.getAttribute('data-leave');
   await leave.fill('New reflection A');await leave.blur();await b.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert.equal(await b.evaluate(k=>localStorage[k],lk),'New reflection A');
   await b.locator('textarea[data-leave]').fill('Other reflection B');await b.locator('textarea[data-leave]').blur();assert.equal(await b.evaluate(k=>localStorage[k],lk),'New reflection A');
   await b.getByRole('button',{name:"Use this tab's draft"}).click();assert.equal(await b.evaluate(k=>localStorage[k],lk),'Other reflection B');
  }
  if(await b.locator('#prompt-3').count()){
   const prompt=await b.locator('#prompt-3').textContent();assert.match(prompt,/What I take into/);
   await b.locator('#prompt-3').locator('..').locator('..').getByRole('button').click();assert.equal(await b.evaluate(()=>window.copiedText),prompt);
   await b.click('#copy-btn');assert.match(await b.inputValue('#summary-out'),/Other reflection B/);
  }
  await ctx.clearCookies();await a.evaluate(()=>localStorage.clear());
 }
 console.log('PASS seven pages: stale-tab protection, recovery and explicit resolution; carry-forward text; Dojo prompts and exports.');
 await a.goto(url('home'));await a.evaluate(()=>localStorage.setItem('cst499.s3.report.leave','Draft reflection'));await a.reload();
 const row=a.locator('.ch[data-key="cst499.s3.report.leave"]').first(),desc=await row.locator('.carry').first().textContent();
 assert.ok(desc);assert.equal(await row.evaluate(el=>el.classList.contains('done')),false);assert.match(await row.textContent(),/Saved reflection \(draft\): Draft reflection/);
 await row.locator('.num').click();assert.equal(await row.evaluate(el=>el.classList.contains('done')),true);await row.locator('.num').click();assert.equal(await row.evaluate(el=>el.classList.contains('done')),false);
 await a.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota');};});await row.locator('.notes-l').click();await row.locator('textarea').fill('Unsaved note');await a.waitForTimeout(400);assert.match(await row.locator('.saved').textContent(),/Could not save/);
 console.log('PASS completion toggles, retained descriptions and storage-failure messages.');
 await a.goto(url('interactive-poster-samples'));await a.locator('.card').first().click();await a.keyboard.press('Tab');assert.equal(await a.evaluate(()=>document.activeElement.id),'close');await a.keyboard.press('Shift+Tab');assert.equal(await a.evaluate(()=>document.activeElement.id),'close');assert.ok(await a.locator('.top').evaluate(el=>el.inert));await a.keyboard.press('Escape');assert.equal(await a.evaluate(()=>document.activeElement.classList.contains('card')),true);
 await a.goto(url('interactive-poster-starter'));await a.locator('[aria-label="My claim"]').fill('I can verify a network investigation.');await a.click('[data-open=work]');await a.locator('[aria-label="The work evidence"]').fill('Observed traffic on three ports.');await a.locator('[aria-label="The work evidence link"]').fill('https://example.com/evidence');await a.locator('#work .close').click();
 const dp=a.waitForEvent('download');await a.click('#download');const download=await dp;await download.saveAs('/tmp/cst499-edited-poster.html');const saved=fs.readFileSync('/tmp/cst499-edited-poster.html','utf8');assert.match(saved,/Observed traffic on three ports/);assert.match(saved,/value="https:\/\/example.com\/evidence"/);
 await ctx.route('http://review.test/edited.html',r=>r.fulfill({contentType:'text/html',body:saved}));await a.goto('http://review.test/edited.html');assert.equal(await a.locator('[aria-label="My claim"]').textContent(),'I can verify a network investigation.');await a.click('[data-open=work]');assert.equal(await a.locator('[aria-label="The work evidence link"]').inputValue(),'https://example.com/evidence');await a.keyboard.press('Escape');
 console.log('PASS sample dialog focus containment and return; editable poster download/reopen.');
 for(const slug of ['my-claim','integrative-solving-report','interactive-poster-first-version','decisions-behind-my-work','interactive-poster-final','interactive-poster-samples','interactive-poster-starter']){
  await a.goto(url(slug));await a.setViewportSize({width:390,height:844});assert.ok(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+' mobile overflow');await a.screenshot({path:'/tmp/cst499-'+slug+'-mobile.png'});
  await a.setViewportSize({width:1280,height:900});await a.screenshot({path:'/tmp/cst499-'+slug+'-desktop.png'});
 }
 await a.goto(url('integrative-solving-report'));await a.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota');};});await a.fill('#bx-t1','Work during failed storage');await a.locator('#bx-t1').blur();assert.match(await a.locator('.draft-safety').textContent(),/Could not save/);await a.click('#copy-btn');assert.match(await a.inputValue('#summary-out'),/Work during failed storage/);
 assert.deepEqual(errors,[]);console.log('PASS narrow layouts, failed-save export, and no JavaScript errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
