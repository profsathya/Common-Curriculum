/* Isolated regression checks for review fixes; all network requests are local fixtures. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const ctx=await browser.newContext();
 await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='sprint3.test')return route.abort();const f=path.join(root,decodeURIComponent(u.pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:''});return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'text/plain',body:fs.readFileSync(f)});});
 await ctx.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedText=text;}}}));
 const errors=[];ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 const a=await ctx.newPage(),b=await ctx.newPage();
 const url=slug=>'http://sprint3.test/cst286/'+slug+'.html?s3path=B';
 for(const slug of ['my-sprint-3-goal-and-plan','find-and-confirm-my-relationship','five-real-world-scenarios-sprint-3','my-sprint-3-experience']){
  const key='cc-gi:cst286-'+slug+':path:B';await a.goto(url(slug));await b.goto(url(slug));
  const field=a.locator('textarea[data-key]').first(),id=await field.getAttribute('id');
  await field.fill('Newer work in tab A');await field.blur();
  const raw=await a.evaluate(k=>localStorage.getItem(k),key);
  await b.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  assert.equal(await b.evaluate(k=>localStorage.getItem(k),key),raw,'untouched tab overwrote '+slug);
  await b.fill('#'+id,'Different work in stale tab B');await b.locator('#'+id).blur();
  assert.match(await b.locator('.draft-safety').filter({hasText:'Assignment draft:'}).textContent(),/Another tab saved newer work/);
  assert.equal(await b.evaluate(k=>localStorage.getItem(k),key),raw);
  const history=await b.evaluate(k=>JSON.parse(localStorage.getItem(k+':recovery')),key);
  assert.ok(history.some(x=>x.raw.includes('Newer work in tab A')));assert.ok(history.some(x=>x.raw.includes('Different work in stale tab B')));
  await b.getByRole('button',{name:"Use this tab's draft"}).click();
  assert.match(await b.evaluate(k=>localStorage.getItem(k),key),/Different work in stale tab B/);
  await b.click('.copybtn');
  const visiblePrompt=await b.locator('#prompt-1').textContent();
  assert.equal(await b.evaluate(()=>window.copiedText),visiblePrompt);assert.doesNotMatch(visiblePrompt,/\[A, B or C\]/);
  await b.click('#copy-btn');assert.match(await b.inputValue('#summary-out'),/DRAFT.*unfinished sections/);
 }
 console.log('PASS: untouched and edited stale tabs; recoverable versions; explicit conflict resolution; prompt identity; incomplete exports.');
 await a.goto(url('five-real-world-scenarios-sprint-3'));
 await a.locator('#sc2-h').focus();await a.keyboard.press('Enter');assert.equal(await a.isVisible('#bx-s2_situation'),true);
 await a.fill('#bx-s2_situation','Collapsed scenario survives export');await a.locator('#sc2-h').click();
 await a.fill('#bx-feedback','Meeting planned; I will preserve the response in my reflection.');await a.click('#copy-btn');
 assert.match(await a.inputValue('#summary-out'),/Collapsed scenario survives export/);assert.match(await a.inputValue('#summary-out'),/Meeting planned/);
 console.log('PASS: keyboard opens scenario; collapsed answers and feedback still export.');
 await a.goto(url('my-sprint-3-goal-and-plan'));
 const question=await a.evaluate(()=>{const q=document.getElementById('st-predict');return Sprint3Paths.visibleText(q);});assert.doesNotMatch(question,/Path C|output I can measure/);
 await a.evaluate(()=>{localStorage.setItem('cst286.s3.1.leave','Draft reflection only');localStorage.removeItem('cst286.s3.1.leave.done');});
 await a.goto(url('home'));const row=a.locator('#sprint-view .ch[data-key="cst286.s3.1.leave"]');
 assert.equal(await row.evaluate(el=>el.classList.contains('done')),false);assert.match(await row.textContent(),/Draft reflection only/);
 await row.locator('.num').click();assert.equal(await row.evaluate(el=>el.classList.contains('done')),true);
 await row.locator('.num').click();assert.equal(await row.evaluate(el=>el.classList.contains('done')),false);
 console.log('PASS: saved reflection is separate from reversible submission mark; hidden path instructions excluded.');
 await a.goto(url('grade-my-two-partners-sprint-3'));
 assert.equal(await a.isDisabled('#cal-compare'),true);await a.fill('#cal-formula','15');await a.fill('#cal-assumptions','10');await a.fill('#cal-reason','Initial interpretation');await a.click('#cal-compare');await a.fill('#cal-assumptions','0');await a.fill('#cal-reflection','I changed my score because mass does not justify the small-angle assumption.');await a.click('#copy-reviews');assert.match(await a.inputValue('#summary-out'),/assumptions: 10\/20/);await a.reload();assert.equal(await a.isVisible('#cal-interpretation'),true);assert.match(await a.inputValue('#cal-reflection'),/changed my score/);
 console.log('PASS: calibration gate, preserved first scores, reflection and export.');
 // Independent protection for the exploration evidence and peer-review draft.
 await a.goto(url('find-and-confirm-my-relationship').replace('s3path=B','s3path=A'));await b.goto(url('find-and-confirm-my-relationship').replace('s3path=B','s3path=A'));
 await a.fill('#bx-bk_notice','First observation');await a.click('[data-reveal=bk_notice]');
 await b.fill('#bx-bk_notice','Second observation from stale tab');await b.click('[data-reveal=bk_notice]');
 assert.match(await b.locator('.draft-safety').filter({hasText:'Exploration record:'}).textContent(),/Another tab saved newer work/);
 const evidenceKey='cc-book:cst286-relationship:path:A';assert.match(await a.evaluate(k=>localStorage.getItem(k),evidenceKey),/First observation/);
 const versions=await a.evaluate(k=>JSON.parse(localStorage.getItem(k+':recovery')),evidenceKey);assert.ok(versions.some(x=>x.raw.includes('Second observation')));
 await a.goto(url('grade-my-two-partners-sprint-3'));await b.goto(url('grade-my-two-partners-sprint-3'));
 await a.fill('#grader-name','Recent grader');await b.fill('#grader-name','Other grader');
 assert.match(await b.locator('.draft-safety').textContent(),/Another tab saved newer work/);
 assert.match(await a.evaluate(()=>localStorage.getItem('cc-gi:cst286-grade-my-two-partners-sprint-3')),/Recent grader/);
 console.log('PASS: exploration evidence and peer-review drafts also preserve conflicting edits.');

 // Browser-wide write failure is reported, without claiming a successful save.
 await a.goto(url('home'));await a.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota');};});
 const note=a.locator('#sprint-view .notes-l').first();await note.click();await a.locator('#sprint-view .notes textarea').first().fill('Keep this note');await a.waitForTimeout(400);assert.match(await a.locator('#sprint-view .notes .saved').first().textContent(),/Could not save/);
 for(const slug of ['sprint-3-exam','five-real-world-scenarios-sprint-3','grade-my-two-partners-sprint-3']){
  await a.goto(url(slug));await a.setViewportSize({width:390,height:844});assert.ok(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+' mobile overflow');await a.screenshot({path:'/tmp/sprint3-review-'+slug+'-mobile.png'});
  await a.setViewportSize({width:1280,height:900});await a.evaluate(()=>document.documentElement.style.zoom='200%');assert.ok(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+' zoom overflow');
  await a.evaluate(()=>document.documentElement.style.zoom='100%');await a.screenshot({path:'/tmp/sprint3-review-'+slug+'-desktop.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: failed note storage, narrow-screen and 200% layout; no JavaScript errors.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
