/* Sprint 3 drafts belong to both an assignment and a path. */
(function () {
  'use strict';
  var PATH = 'cst286.s3.path';
  function get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function put(k,v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k,v); return true; } catch (_) { return false; } }
  function parse(s) { try { return JSON.parse(s); } catch (_) { return null; } }
  function valid(p) { return /^[ABC]$/.test(p || ''); }
  function chosen(s) { return s && s.answers && s.answers.path && s.answers.path.text; }
  function relevant(el) {
    var path = document.querySelector('input[name="s3path"]:checked');
    var branch = document.querySelector('input[name="book_focus"]:checked');
    for (var n=el; n && n.nodeType===1; n=n.parentElement) {
      if (n.hasAttribute('data-path') && (!path || n.getAttribute('data-path').split(/\s+/).indexOf(path.value)<0)) return false;
      if (n.hasAttribute('data-book-branch') && (!branch || n.getAttribute('data-book-branch')!==branch.value)) return false;
    }
    return true;
  }
  function visibleText(el) {
    var copy=el.cloneNode(true);
    copy.querySelectorAll('[data-path], [data-book-branch]').forEach(function (n) { if (!relevant(n)) n.remove(); });
    return copy.textContent;
  }
  window.Sprint3Paths = { relevant: relevant, visibleText: visibleText, create: function(base) {
    var legacy=parse(get(base));
    var oct=parse(get('cc-gi:cst286-my-sprint-2-experience-and-sprint-3-path')) || parse(get('cc-gi:my-sprint-2-experience-and-sprint-3-path'));
    var query=new URL(location.href).searchParams.get('s3path');
    var path=[query,get(PATH),chosen(legacy),chosen(oct)].filter(valid)[0] || '';
    var key=base+':path:'+(path || 'unselected');
    // Migrate only a draft whose recorded owner is known. Preserve the untouched original.
    if (!get(key) && path && chosen(legacy)===path) {
      var migrated=JSON.parse(JSON.stringify(legacy));
      if (base==='cc-gi:cst286-my-sprint-3-goal-and-plan') {
        var seeded={
          understand:'how spinning objects behave differently from objects moving in a straight line, and how a spin changes when the mass is rearranged.',
          given:'how fast something is spinning, in radians per second, and how its mass is arranged around the axis before and after the arrangement changes, as a moment of inertia in kilogram square meters,',
          predict:'how fast it will spin afterwards, in radians per second, as long as nothing outside twists it while the mass moves.',
          useful:"the same relationship explains how skaters, divers and satellites control their spin, and my phone's gyroscope lets me check the prediction on a spinning chair."
        };
        Object.keys(seeded).forEach(function(k) {
          if (migrated.answers[k] && migrated.answers[k].text.trim()===seeded[k]) delete migrated.answers[k];
        });
      }
      // Revised criteria need a fresh self-check; student-authored answers survive.
      migrated.checks={};
      put(key,JSON.stringify(migrated));
    }
    if (path) put(PATH,path);
    function readShared(k) {
      var value=get(k+':'+path);
      if (value!==null) return value;
      var names=['my-sprint-3-goal-and-plan','find-and-confirm-my-relationship','five-real-world-scenarios-sprint-3','my-sprint-3-experience'];
      var m=k.match(/s3\.(\d)\.leave$/);
      if (m) {
        var owner='cc-gi:cst286-'+names[Number(m[1])-1];
        var s=parse(get(owner+':path:'+path));
        if (!s) { var old=parse(get(owner)); if(chosen(old)===path) s=old; }
        return s && s.answers && s.answers.leave ? s.answers.leave.text : '';
      }
      return '';
    }
    // The home page's legacy echoes always reflect the active path.
    if (path) for(var i=1;i<=4;i++) { var k='cst286.s3.'+i+'.leave'; put(k,readShared(k)||null); }
    return {key:key,path:path,readShared:readShared,
      writeShared:function(k,v) { put(k+':'+path,v); put(k,v); },
      switchTo:function(p) {
        if (!valid(p) || p===path) return;
        var stored=put(PATH,p), url=new URL(location.href);
        if(stored) url.searchParams.delete('s3path'); else url.searchParams.set('s3path',p);
        history.replaceState(null,'',url.href);
        location.reload();
      }
    };
  }};
}());
