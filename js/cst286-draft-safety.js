/* Optimistic draft protection: an unchanged or stale tab never replaces newer work. */
(function () {
  'use strict';
  function stringify(x) { return JSON.stringify(x); }
  function read(key) { return localStorage.getItem(key); }
  function describe(raw) {
    try {
      var data=JSON.parse(raw), lines=[];
      function walk(x,path) {
        if(x===null || x===undefined) return;
        if(typeof x!=='object') {if(String(x).trim()) lines.push(path+': '+String(x)); return;}
        Object.keys(x).forEach(function(k){walk(x[k],path ? path+' · '+k : k);});
      }
      walk(data,'');return lines.join('\n\n');
    } catch (_) { return raw || '(empty draft)'; }
  }
  window.CCDA = {open:function(key,getValue,label,onSaved) {
    var observed=null, baseline='', ready=false, conflict=false, history=[];
    var panel=document.createElement('section'), message=document.createElement('p'), details=document.createElement('details');
    panel.className='draft-safety';panel.style.cssText='border:1px solid #aaa;border-radius:5px;padding:8px 12px;margin:12px 0;overflow-wrap:anywhere';
    message.setAttribute('role','status');message.setAttribute('aria-live','polite');message.style.margin='0';
    panel.appendChild(message);panel.appendChild(details);
    var summary=document.createElement('summary');summary.textContent='Recover saved versions';details.appendChild(summary);details.hidden=true;
    var host=document.querySelector('main')||document.body, after=host.querySelector('.gibar')||host.firstElementChild;
    if(after) after.insertAdjacentElement('afterend',panel);else host.prepend(panel);
    function report(text){message.textContent=(label||'Draft')+': '+text;}
    function render() {
      while(details.children.length>1) details.lastElementChild.remove();
      details.hidden=history.length===0;
      history.slice().reverse().forEach(function(item){
        var p=document.createElement('p'),ta=document.createElement('textarea');p.textContent=item.source+' · '+item.at;
        ta.readOnly=true;ta.value=describe(item.raw);ta.setAttribute('aria-label',p.textContent);ta.style.cssText='width:100%;min-height:120px;font:inherit';details.appendChild(p);details.appendChild(ta);
      });
    }
    function recover(raw,source){
      if(raw===null || history.some(function(x){return x.raw===raw;})) return true;
      history.push({raw:raw,source:source,at:new Date().toISOString()});history=history.slice(-8);render();
      try{localStorage.setItem(key+':recovery',stringify(history));return true;}catch(_){return false;}
    }
    try{observed=read(key);history=JSON.parse(read(key+':recovery'))||[];if(!Array.isArray(history))history=[];render();report(observed?'Saved draft loaded on this browser. This is not a Canvas submission.':'Your draft will be saved on this browser. Submit copied answers in Canvas.');}
    catch(_){report('Saving is unavailable. Copy your work before leaving this page.');}
    function save(force) {
      var current=stringify(getValue());
      if(!ready || (!force && current===baseline)) return !conflict;
      try {
        var latest=read(key);
        if(!force && latest!==observed) {
          conflict=true;var a=recover(current,'This tab'),b=recover(latest,'Other saved draft');
          report('Another tab saved newer work. '+(a&&b?'Both versions are preserved below.':'Copy both versions below before leaving; browser storage could not preserve them.')+' Choose a version before continuing.');
          if(!panel.querySelector('button')) {
            var keep=document.createElement('button'),reload=document.createElement('button');keep.type=reload.type='button';keep.textContent="Use this tab's draft";reload.textContent='Load the latest saved draft';
            keep.addEventListener('click',function(){if(save(true)){keep.remove();reload.remove();}});
            reload.addEventListener('click',function(){if(recover(stringify(getValue()),'This tab before reload'))location.reload();else report('Copy your work below before reloading; saving is unavailable.');});
            panel.appendChild(keep);panel.appendChild(reload);
          }
          return false;
        }
        // Preserve the displaced version before the user's explicit conflict resolution.
        if(force && latest!==observed && !recover(latest,'Other saved draft before replacement')) {report('Copy the saved versions before replacing them; recovery storage is unavailable.');return false;}
        localStorage.setItem(key,current);observed=current;baseline=current;conflict=false;
        if(onSaved) onSaved();
        report('Saved on this browser. Copying answers does not submit them to Canvas.');return true;
      } catch(_){report('Could not save. Keep this page open and copy your work before leaving.');return false;}
    }
    return {ready:function(){baseline=stringify(getValue());ready=true;},save:save, pending:function(){if(!conflict)report('Unsaved changes on this tab…');},status:report};
  }};
}());
