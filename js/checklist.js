(function(){
  "use strict";

  var STORAGE_KEY = 'ace-checklist';

  /* Canonical map of every checklist item across the whole site, so any
     page (even ones that don't render a given phase's checkboxes) can
     compute that phase's completion and the site-wide total. */
  var PHASE_IDS = {
    '1': ['p1s1','p1s2','p1s3','p1s4'],
    '2': ['p2s1','p2s2','p2s3','p2s4'],
    '3': ['p3s1','p3s2','p3s3','p3s4'],
    '5': ['p5s1','p5s2','p5s3','p5s4','p5s5']
  };

  function readState(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ return {}; }
  }
  function writeState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  var state = readState();

  /* ---------- Hydrate & wire up checkboxes present on THIS page ---------- */
  var checkboxes = document.querySelectorAll('.step input[type="checkbox"]');
  checkboxes.forEach(function(box){
    var id = box.getAttribute('data-id');
    if(state[id]){ box.checked = true; }
    box.addEventListener('change', function(){
      state[id] = box.checked;
      writeState(state);
      refreshAll();
    });
  });

  /* ---------- Compute + paint everything derived from state ---------- */
  function phaseCount(phaseNum){
    var ids = PHASE_IDS[String(phaseNum)] || [];
    var done = 0;
    ids.forEach(function(id){ if(state[id]) done++; });
    return {done: done, total: ids.length};
  }

  function refreshAll(){
    state = readState();

    // Per-phase progress label + bar (only present on that phase's own page)
    Object.keys(PHASE_IDS).forEach(function(phaseNum){
      var c = phaseCount(phaseNum);
      var label = document.querySelector('[data-phase-progress="' + phaseNum + '"]');
      if(label){
        label.innerHTML = c.done + ' / ' + c.total + ' done' +
          '<span class="bar-track"><span class="bar-fill" style="width:' + (c.total ? (c.done/c.total*100) : 0) + '%"></span></span>';
      }
      var isComplete = c.total > 0 && c.done === c.total;
      // Stepper pills + rail links (may appear on every page, linking elsewhere)
      document.querySelectorAll('.stepper-pill[data-phase="' + phaseNum + '"]').forEach(function(p){
        p.classList.toggle('complete', isComplete);
      });
      document.querySelectorAll('.rail-list a[data-phase="' + phaseNum + '"]').forEach(function(a){
        a.classList.toggle('complete', isComplete);
      });
    });

    // Site-wide progress badge in header
    var totalDone = 0, totalAll = 0;
    Object.keys(PHASE_IDS).forEach(function(p){
      var c = phaseCount(p);
      totalDone += c.done; totalAll += c.total;
    });
    document.querySelectorAll('[data-global-progress]').forEach(function(el){
      var textEl = el.querySelector('.gp-text');
      if(textEl){ textEl.textContent = totalDone + ' / ' + totalAll + ' steps'; }
      var fillEl = el.querySelector('.fill');
      if(fillEl){
        var r = 5.5, circumference = 2 * Math.PI * r;
        var pct = totalAll ? (totalDone/totalAll) : 0;
        fillEl.setAttribute('stroke-dasharray', circumference.toFixed(2));
        fillEl.setAttribute('stroke-dashoffset', (circumference * (1 - pct)).toFixed(2));
      }
    });
  }

  refreshAll();

  /* Keep in sync if the person has two tabs open */
  window.addEventListener('storage', function(e){
    if(e.key === STORAGE_KEY){ refreshAll(); }
  });

})();
