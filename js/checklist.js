/* Career Engine — checklist progress.
   Progress is stored only in this browser (localStorage). Nothing is uploaded. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ace-checklist';

  /* Every checklist item across the site, so any page can show the total. */
  var PHASE_IDS = {
    '1': ['p1s1', 'p1s2', 'p1s3', 'p1s4'],
    '2': ['p2s1', 'p2s2', 'p2s3', 'p2s4'],
    '3': ['p3s1', 'p3s2', 'p3s3', 'p3s4'],
    '5': ['p5s1', 'p5s2', 'p5s3', 'p5s4', 'p5s5']
  };

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: progress lasts for this visit only */ }
  }

  var state = readState();

  document.querySelectorAll('.step input[type="checkbox"]').forEach(function (box) {
    var id = box.getAttribute('data-id');
    if (state[id]) { box.checked = true; }
    box.addEventListener('change', function () {
      state = readState();
      state[id] = box.checked;
      writeState(state);
      refresh();
    });
  });

  function phaseCount(phase) {
    var ids = PHASE_IDS[phase] || [];
    var done = ids.filter(function (id) { return state[id]; }).length;
    return { done: done, total: ids.length };
  }

  function refresh() {
    var totalDone = 0, totalAll = 0;
    Object.keys(PHASE_IDS).forEach(function (phase) {
      var c = phaseCount(phase);
      totalDone += c.done; totalAll += c.total;

      document.querySelectorAll('[data-phase-progress="' + phase + '"]').forEach(function (label) {
        label.textContent = c.done + ' / ' + c.total + ' done';
        var track = document.createElement('span');
        track.className = 'bar-track';
        track.setAttribute('aria-hidden', 'true');
        var fill = document.createElement('span');
        fill.className = 'bar-fill';
        fill.style.width = (c.total ? c.done / c.total * 100 : 0) + '%';
        track.appendChild(fill);
        label.appendChild(track);
      });

      var complete = c.total > 0 && c.done === c.total;
      document.querySelectorAll('.stepper-pill[data-phase="' + phase + '"], .rail-list a[data-phase="' + phase + '"]').forEach(function (el) {
        el.classList.toggle('complete', complete);
      });
    });

    document.querySelectorAll('[data-global-progress]').forEach(function (el) {
      var text = el.querySelector('.gp-text');
      if (text) { text.textContent = totalDone + ' / ' + totalAll + ' steps'; }
      var fill = el.querySelector('.fill');
      if (fill) {
        var circumference = 2 * Math.PI * 5.5;
        fill.setAttribute('stroke-dasharray', circumference.toFixed(2));
        fill.setAttribute('stroke-dashoffset', (circumference * (1 - (totalAll ? totalDone / totalAll : 0))).toFixed(2));
      }
    });
  }

  refresh();

  /* Keep two open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      state = readState();
      document.querySelectorAll('.step input[type="checkbox"]').forEach(function (box) { box.checked = !!state[box.getAttribute('data-id')]; });
      refresh();
    }
  });
})();
