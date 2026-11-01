/* Capture the thinking before a reveal as well as the student's later revisions. */
(function () {
  'use strict';
  var book=document.getElementById('path-a-book');
  if (!book) return;
  var path=document.querySelector('input[name="s3path"]:checked');
  var key='cc-book:cst286-relationship:path:'+(path ? path.value : 'unselected');
  var evidence={reveals:{},runs:[]};
  try { var old=JSON.parse(localStorage.getItem(key)); if(old && old.reveals && Array.isArray(old.runs)) evidence=old; } catch (_) {}
  function save() {
    try { localStorage.setItem(key,JSON.stringify(evidence)); }
    catch (_) { document.querySelectorAll('.storenote').forEach(function(n){n.style.display='block';}); }
  }
  function value(k) { var el=document.getElementById('bx-'+k); return el ? el.value.trim() : ''; }
  function write(k,text) { var el=document.getElementById('bx-'+k); if(el) {el.value=text; el.dispatchEvent(new Event('input',{bubbles:true}));} }
  function label(k) { var el=document.querySelector('label[for="bx-'+k+'"]'); return el ? el.textContent.trim() : k; }
  function open(btn,yes) {
    var target=document.getElementById(btn.getAttribute('aria-controls'));
    target.hidden=!yes; btn.setAttribute('aria-expanded',String(yes));
    if(yes) target.querySelectorAll('iframe[data-src]').forEach(function(frame) { if(!frame.src) frame.src=frame.dataset.src; });
  }
  function progress() {
    var fields=Array.from(book.querySelectorAll('textarea[data-key]')).filter(Sprint3Paths.relevant);
    var count=fields.filter(function(el){return el.value.trim();}).length;
    var focus=document.querySelector('input[name="book_focus"]:checked');
    document.getElementById('book-progress').textContent=count+' of '+fields.length+' learning-record boxes have text'+(focus ? '.' : '. Choose your exploration in step 4.');
  }
  book.querySelectorAll('[data-reveal]').forEach(function(btn) {
    var k=btn.dataset.reveal, field=document.getElementById('bx-'+k), note=document.getElementById('gate-note-'+k);
    function refresh() {
      btn.disabled=!field.value.trim() && !evidence.reveals[k];
      if(evidence.reveals[k]) note.textContent='Your original response is saved in your learning record. You can revise the response above as your thinking develops.';
      progress();
    }
    field.addEventListener('input',refresh);
    btn.addEventListener('click',function() {
      if(!evidence.reveals[k]) {
        if(!field.value.trim()) return;
        evidence.reveals[k]={text:field.value.trim(),at:new Date().toISOString()}; save();
      }
      open(btn,btn.getAttribute('aria-expanded')!=='true'); refresh();
    });
    // Reveals remain available after reloading, but videos load only on request.
    refresh();
  });
  function focusChanged() {
    var selected=document.querySelector('input[name="book_focus"]:checked');
    book.querySelectorAll('[data-book-branch]').forEach(function(el){el.hidden=!selected || el.dataset.bookBranch!==selected.value;});
    progress();
  }
  book.querySelectorAll('input[name="book_focus"]').forEach(function(r){r.addEventListener('change',focusChanged);});
  book.addEventListener('input',progress); focusChanged();
  var animations={};
  function animate(kind,rate,p) {
    var spinner=book.querySelector('[data-spinner="'+kind+'"]'),start=performance.now();
    if(animations[kind]) cancelAnimationFrame(animations[kind]);
    if(kind==='speed') {
      var radius=70*p.r2/Math.max(p.r1,p.r2), line=spinner.querySelector('line'), dots=spinner.querySelectorAll('circle');
      line.setAttribute('x1',180-radius); line.setAttribute('x2',180+radius);
      dots[0].setAttribute('cx',180-radius); dots[1].setAttribute('cx',180+radius);
    }
    function frame(now) {
      // Display is intentionally slowed for readability; numeric output uses physical units.
      spinner.setAttribute('transform','rotate('+((now-start)/1000*Math.min(rate,6)*180/Math.PI)+' 180 90)');
      if(now-start<8000 && Sprint3Paths.relevant(spinner) && !matchMedia('(prefers-reduced-motion: reduce)').matches) animations[kind]=requestAnimationFrame(frame);
    }
    frame(start+500);
  }
  book.querySelectorAll('[data-run-model]').forEach(function(btn) {
    var kind=btn.dataset.runModel, model=book.querySelector('[data-model="'+kind+'"]'), status=book.querySelector('[data-model-status="'+kind+'"]');
    btn.addEventListener('click',function() {
      var p={},valid=true;
      model.querySelectorAll('[data-model-param]').forEach(function(input) {
        var n=Number(input.value); if(!input.value.trim() || !Number.isFinite(n) || n<=0) valid=false;
        p[input.dataset.modelParam]=n;
      });
      var prediction=value('bk_'+kind+'_predict');
      if(!valid || !prediction) {status.textContent='Enter a positive value for each input, then write your numerical prediction and reasoning before running.'; return;}
      var output=kind==='speed' ? p.omega*(p.b+2*p.mass*p.r1*p.r1)/(p.b+2*p.mass*p.r2*p.r2) : p.mass*9.8*p.distance/(p.inertia*p.omega);
      if(!Number.isFinite(output)) {status.textContent='These values exceed the model’s numerical range. Choose finite physical inputs.'; return;}
      if(kind==='direction' && output/p.omega>0.1) {status.textContent='These inputs do not give spin much faster than precession (this model uses a 10:1 screening ratio). Reconsider the inputs and your approximation before running; this screen does not establish validity for a real top.'; return;}
      var run={kind:kind,at:new Date().toISOString(),inputs:p,prediction:prediction,output:output};
      evidence.runs.push(run); save();
      var runs=evidence.runs.filter(function(r){return r.kind===kind;});
      write('bk_'+kind+'_trials',runs.map(function(r,i){return 'Run '+(i+1)+' · '+r.at+'\nInputs ('+(r.kind==='speed' ? 'b: kg·m²; mass: kg per mass; r1 and r2: m; omega: rad/s' : 'mass: kg; distance: m; inertia: kg·m²; omega: rad/s')+'): '+JSON.stringify(r.inputs)+'\nPrediction before run: '+r.prediction+'\nModel output: '+r.output.toPrecision(5)+' rad/s';}).join('\n\n'));
      status.textContent='Model output: '+output.toPrecision(5)+' rad/s. Your prediction and inputs are saved. The animation is schematic and capped in speed for readability.';
      animate(kind,output,p); progress();
    });
  });
  window.Sprint3Book={evidenceText:function() {
    if(!path || path.value!=='A') return '';
    var out='';
    book.querySelectorAll('[data-book-branch]').forEach(function(branch) {
      if(Sprint3Paths.relevant(branch)) return;
      var entries=Array.from(branch.querySelectorAll('textarea[data-key]')).filter(function(el){return el.value.trim();});
      if(!entries.length) return;
      out+='PATH A · ADDITIONAL EXPLORATION: '+(branch.dataset.bookBranch==='speed' ? 'SPIN SPEED' : 'AXIS DIRECTION')+'\n';
      entries.forEach(function(el){out+=label(el.dataset.key)+'\n   '+el.value.trim().replace(/\n/g,'\n   ')+'\n\n';});
    });
    out+='PATH A · ORIGINAL RESPONSES BEFORE EXPLANATIONS\n';
    Object.keys(evidence.reveals).forEach(function(k) {
      var field=document.getElementById('bx-'+k); if(!field) return;
      var record=evidence.reveals[k]; out+=label(k)+' · saved '+record.at+'\n   '+record.text.replace(/\n/g,'\n   ')+'\n\n';
    });
    return out+'The current responses and saved model runs are included in the learning record above.\n\n';
  }};
}());
