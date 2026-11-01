/* One nonreciprocal classmate review. Drafts stay in this browser; copy is the submission route. */
(function () {
  'use strict';
  var bar = document.getElementById('canvas-bar');
  var framed = true;
  try { framed = window.top !== window.self; } catch (_) {}
  if (bar && (framed || /(^|[?&])context=canvas(&|$)/.test(location.search))) bar.hidden = false;
  var KEY = 'cc-gi:cst286-grade-my-two-partners-sprint-3';
  var criteria = JSON.parse(document.getElementById('partner-criteria').textContent);
  var fields = Array.from(document.querySelectorAll('[data-save]'));
  var warning = document.getElementById('storage-warning');
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { warning.hidden = false; }
  function value(id) { return document.getElementById(id).value.trim(); }
  function save() {
    var draft = Object.assign({}, saved);
    fields.forEach(function (el) { draft[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
    saved = draft;
    try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch (_) { warning.hidden = false; }
  }
  function update() {
    [1].forEach(function (n) {
      var path = value('p' + n + '-path');
      document.querySelectorAll('[data-peer-path][data-review="' + n + '"]').forEach(function (el) { el.hidden = el.dataset.peerPath !== path; });
      document.querySelectorAll('[data-criterion][data-review="' + n + '"]').forEach(function (el) {
        var parts = el.dataset.criterion.split(':'), row = criteria[parts[0]][Number(parts[1])];
        el.textContent = row.labels[path || 'B'] + ' · ' + row.max + ' pts';
      });
      Object.keys(criteria).forEach(function (key) {
        var scored = 0, total = 0, invalid = false;
        document.querySelectorAll('[data-score="' + n + ':' + key + '"]').forEach(function (el) {
          if (el.value === '') return;
          if (!el.checkValidity()) { invalid = true; return; }
          scored++; total += Number(el.value);
        });
        var complete = scored === criteria[key].length && !invalid;
        document.getElementById('total-' + n + '-' + key).textContent = invalid ? 'Correct the score outside its allowed range.' : (complete ? 'Recommended total: ' : 'Partial total: ') + total + ' / 100 · ' + scored + ' of ' + criteria[key].length + ' criteria scored';
      });
    });
  }
  fields.forEach(function (el) {
    if (Object.prototype.hasOwnProperty.call(saved, el.id)) {
      if (el.type === 'checkbox') el.checked = saved[el.id] === true;
      else el.value = String(saved[el.id]);
    }
    el.addEventListener('input', function () { save(); update(); });
    el.addEventListener('change', function () { save(); update(); });
  });
  function missing() {
    var empty = fields.filter(function (el) { return el.required && (el.type === 'checkbox' ? !el.checked : !el.value.trim()); });
    if (empty.length) return empty.length + ' required fields are still empty. The copied text is marked as a draft.';
    var one = value('p1-name').toLowerCase().replace(/\s+/g, ' ');
    var two = value('grader-name').toLowerCase().replace(/\s+/g, ' ');
    if (one === two) return 'Your grader must be different from the classmate you grade. Reciprocal grading is not allowed. The copied text is marked as a draft.';
    return '';
  }
  document.getElementById('copy-reviews').addEventListener('click', function () {
    var status = document.getElementById('copy-status');
    var invalid = fields.find(function (el) { return el.type === 'number' && el.value !== '' && !el.checkValidity(); });
    if (invalid) { status.textContent = 'Correct the highlighted score before copying.'; invalid.reportValidity(); invalid.focus(); return; }
    var issue = missing();
    var text = "CST286 · Grade a classmate's Sprint 3 work\nDue: Wednesday 9 December 2026\n";
    if (issue) text += 'DRAFT: ' + issue + '\n';
    function answer(label, content) { text += '\n' + label + '\n' + (content || '(not yet answered)') + '\n'; }
    answer('My agreed grader', value('grader-name'));
    ['eligible-nonreciprocal', 'eligible-new-partner'].forEach(function (id) {
      var el = document.getElementById(id);
      text += (el.checked ? '[x] ' : '[ ] ') + el.closest('label').textContent.trim() + '\n';
    });
    [1].forEach(function (n) {
      text += '\nCLASSMATE I AM GRADING\n';
      answer('Name', value('p' + n + '-name'));
      var path = value('p' + n + '-path');
      answer('Path', path);
      answer('Work reviewed', value('p' + n + '-work'));
      Object.keys(criteria).forEach(function (key) {
        text += '\n' + (key === 'relationship' ? 'Find and confirm my relationship' : 'Five real-world scenarios') + '\n';
        criteria[key].forEach(function (row, i) {
          var prefix = 'p' + n + '-' + key + '-' + i;
          answer(row.labels[path || 'B'], 'Recommended points: ' + (value(prefix + '-score') || '(not scored)') + ' / ' + row.max + '\nEvidence: ' + (value(prefix + '-evidence') || '(not yet recorded)'));
        });
        text += document.getElementById('total-' + n + '-' + key).textContent + '\n';
      });
      answer('Question and response', value('p' + n + '-question'));
      answer('Feedback for this partner', value('p' + n + '-feedback'));
    });
    answer('Reflection · What reviewing taught me', value('reflection'));
    text += '\nSELF-CHECK\n';
    document.querySelectorAll('.selfcheck li').forEach(function (li) {
      text += (li.querySelector('input').checked ? '[x] ' : '[ ] ') + li.querySelector('label').textContent + ' · ' + li.querySelector('.pts').textContent + '\n';
    });
    text += '\nPeer scores are recommendations for Prof. Sathya to review before any grade changes.\n';
    document.getElementById('summary-out').value = text;
    save();
    function fallback() { status.textContent = (issue ? issue + ' ' : '') + 'Select and copy the text below.'; document.getElementById('summary-out').select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { status.textContent = (issue ? issue + ' ' : '') + 'Copied. Review the text and paste it into Canvas.'; }, fallback);
    else fallback();
  });
  update();
  // Probe storage so a fresh draft also reports blocked persistence.
  save();
}());
