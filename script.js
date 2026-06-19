(function(){
  "use strict";

  /* ---------- THEME TOGGLE ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('ace-theme');
  if(savedTheme){ root.setAttribute('data-theme', savedTheme); }
  function syncThemeIcon(){
    themeToggle.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }
  syncThemeIcon();
  themeToggle.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ace-theme', next);
    syncThemeIcon();
  });

  /* ---------- SCROLL PROGRESS BAR ---------- */
  var bar = document.getElementById('scrollProgress');
  function updateBar(){
    var h = document.documentElement;
    var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateBar, {passive:true});
  updateBar();

  /* ---------- BACK TO TOP ---------- */
  var toTop = document.getElementById('toTop');
  document.addEventListener('scroll', function(){
    toTop.classList.toggle('show', window.scrollY > 600);
  }, {passive:true});
  toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  /* ---------- GOTO BUTTONS (rail + stepper + nav) ---------- */
  document.querySelectorAll('[data-goto]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(btn.getAttribute('data-goto'));
      if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  /* ---------- SCROLLSPY: active phase via IntersectionObserver ---------- */
  var phaseSections = Array.prototype.slice.call(document.querySelectorAll('.phase'));
  var railNodes = document.querySelectorAll('.rail-node');
  var stepperPills = document.querySelectorAll('.stepper-pill');

  function setActivePhase(num){
    railNodes.forEach(function(n){ n.classList.toggle('active', n.getAttribute('data-phase') === String(num)); });
    stepperPills.forEach(function(p){ p.classList.toggle('active', p.getAttribute('data-goto') === 'phase-' + num); });
  }

  if('IntersectionObserver' in window && phaseSections.length){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          setActivePhase(entry.target.getAttribute('data-phase'));
        }
      });
    }, {rootMargin: '-35% 0px -50% 0px', threshold: 0});
    phaseSections.forEach(function(s){ observer.observe(s); });
  }

  /* ---------- RAIL FILL based on scroll through .phases ---------- */
  var phasesWrap = document.querySelector('.phases');
  var railFill = document.getElementById('railFill');
  function updateRailFill(){
    if(!phasesWrap || !railFill) return;
    var rect = phasesWrap.getBoundingClientRect();
    var total = rect.height;
    var viewed = Math.min(Math.max(window.innerHeight * 0.5 - rect.top, 0), total);
    var pct = total > 0 ? (viewed / total) * 100 : 0;
    railFill.style.height = pct + '%';
  }
  document.addEventListener('scroll', updateRailFill, {passive:true});
  window.addEventListener('resize', updateRailFill);
  updateRailFill();

  /* ---------- CHECKLIST PERSISTENCE ---------- */
  var STORAGE_KEY = 'ace-checklist';
  var state = {};
  try{ state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ state = {}; }

  var checkboxes = document.querySelectorAll('.step input[type="checkbox"]');
  checkboxes.forEach(function(box){
    var id = box.getAttribute('data-id');
    if(state[id]){ box.checked = true; }
    box.addEventListener('change', function(){
      state[id] = box.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updatePhaseProgress(box.getAttribute('data-phase'));
    });
  });

  function updatePhaseProgress(phaseNum){
    var boxesInPhase = document.querySelectorAll('.step input[data-phase="' + phaseNum + '"]');
    var total = boxesInPhase.length;
    var done = 0;
    boxesInPhase.forEach(function(b){ if(b.checked) done++; });

    var progressLabel = document.querySelector('[data-phase-progress="' + phaseNum + '"]');
    if(progressLabel){ progressLabel.textContent = done + ' / ' + total + ' done'; }

    var isComplete = total > 0 && done === total;
    document.querySelectorAll('.rail-node[data-phase="' + phaseNum + '"]').forEach(function(n){ n.classList.toggle('complete', isComplete); });
    document.querySelectorAll('.stepper-pill[data-goto="phase-' + phaseNum + '"]').forEach(function(p){ p.classList.toggle('complete', isComplete); });
  }
  var allPhases = new Set();
  checkboxes.forEach(function(box){ allPhases.add(box.getAttribute('data-phase')); });
  allPhases.forEach(updatePhaseProgress);

  /* ---------- COPY TO CLIPBOARD ---------- */
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var targetSel = btn.getAttribute('data-target');
      var el = document.querySelector(targetSel);
      if(!el) return;
      var text = el.innerText;

      function showCopied(){
        var labelEl = btn.querySelector('.label');
        var original = labelEl.textContent;
        btn.classList.add('copied');
        labelEl.textContent = 'Copied ✓';
        setTimeout(function(){
          btn.classList.remove('copied');
          labelEl.textContent = original;
        }, 1600);
      }

      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(showCopied).catch(function(){ fallbackCopy(text, showCopied); });
      } else {
        fallbackCopy(text, showCopied);
      }
    });
  });

  function fallbackCopy(text, cb){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); cb(); }catch(e){}
    document.body.removeChild(ta);
  }

})();
