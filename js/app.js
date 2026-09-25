(function(){
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME TOGGLE ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var themeColorMeta = document.getElementById('themeColorMeta');
  var savedTheme = localStorage.getItem('ace-theme');
  if(savedTheme){ root.setAttribute('data-theme', savedTheme); }
  function syncThemeIcon(){
    if(!themeToggle) return;
    var isDark = root.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    if(themeColorMeta){ themeColorMeta.setAttribute('content', isDark ? '#0B0A16' : '#FFFFFF'); }
  }
  syncThemeIcon();
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      function apply(){
        root.setAttribute('data-theme', next);
        localStorage.setItem('ace-theme', next);
        syncThemeIcon();
      }
      /* Progressive enhancement: crossfade the whole page through the new
         theme with the View Transitions API where it's supported. */
      if(!reduceMotion && document.startViewTransition){
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  }

  /* ---------- SCROLL PROGRESS BAR + HEADER ELEVATION ---------- */
  var bar = document.getElementById('scrollProgress');
  var header = document.querySelector('header.site');
  var ticking = false;
  function updateOnScroll(){
    var h = document.documentElement;
    if(bar){
      var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight || 1) * 100;
      bar.style.width = pct + '%';
    }
    if(header){ header.classList.toggle('scrolled', window.scrollY > 4); }
    ticking = false;
  }
  document.addEventListener('scroll', function(){
    if(!ticking){ window.requestAnimationFrame(updateOnScroll); ticking = true; }
  }, {passive:true});
  updateOnScroll();

  /* ---------- BACK TO TOP ---------- */
  var toTop = document.getElementById('toTop');
  if(toTop){
    document.addEventListener('scroll', function(){
      toTop.classList.toggle('show', window.scrollY > 600);
    }, {passive:true});
    toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'}); });
  }

  /* ---------- SCROLL-REVEAL ---------- */
  var revealTargets = document.querySelectorAll(
    '.tool-card, .jp-card, .teaser-card, .tip-card, .step, .pager-link, ' +
    'details.prompt-card, .section-head, .hero-grid > *, .overview-grid > *, ' +
    '.stats-strip, table.kb, .code-block'
  );
  if(revealTargets.length && !reduceMotion && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          var el = entry.target;
          setTimeout(function(){ el.classList.add('is-visible'); }, (i % 6) * 60);
          io.unobserve(el);
        }
      });
    }, {threshold:0.05, rootMargin:'0px 0px -10% 0px'});
    revealTargets.forEach(function(el){
      el.classList.add('reveal');
      io.observe(el);
    });
    /* Safety net: never let content stay invisible if something (a slow
       layout, an unusual viewport, a stalled observer) prevents a natural
       trigger — reveal whatever's left shortly after load. */
    setTimeout(function(){
      revealTargets.forEach(function(el){ el.classList.add('is-visible'); });
    }, 2500);
  } else {
    revealTargets.forEach(function(el){ el.classList.add('reveal','is-visible'); });
  }

  /* ---------- SPOTLIGHT HOVER (cursor-tracked glow on .spot cards) ---------- */
  if(window.matchMedia && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.spot').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- MOBILE MENU (hamburger) ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if(menuToggle && mobileMenu){
    function closeMenu(){
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    menuToggle.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', closeMenu);
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth >= 760){ closeMenu(); }
    });
  }

  /* ---------- SMOOTH SCROLL FOR IN-PAGE ANCHORS ---------- */
  document.querySelectorAll('a[data-scroll]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id && id.charAt(0) === '#'){
        var target = document.querySelector(id);
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
      }
    });
  });

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
        showToast('Prompt copied to clipboard');
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

  /* ---------- TOAST ---------- */
  var toastTimer;
  function showToast(msg){
    var t = document.getElementById('toast');
    if(!t){
      t = document.createElement('div');
      t.className = 'toast';
      t.id = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }
  window.aceShowToast = showToast;

  /* ---------- EXTERNAL LINK SAFETY (belt-and-braces) ---------- */
  document.querySelectorAll('a[target="_blank"]').forEach(function(a){
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    ['noopener','noreferrer'].forEach(function(v){ if(rel.indexOf(v) === -1) rel.push(v); });
    a.setAttribute('rel', rel.join(' '));
  });

})();
