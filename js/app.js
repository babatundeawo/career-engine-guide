(function(){
  "use strict";

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
    if(themeColorMeta){ themeColorMeta.setAttribute('content', isDark ? '#100F1D' : '#FFFFFF'); }
  }
  syncThemeIcon();
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('ace-theme', next);
      syncThemeIcon();
    });
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  var bar = document.getElementById('scrollProgress');
  if(bar){
    function updateBar(){
      var h = document.documentElement;
      var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight || 1) * 100;
      bar.style.width = pct + '%';
    }
    document.addEventListener('scroll', updateBar, {passive:true});
    updateBar();
  }

  /* ---------- BACK TO TOP ---------- */
  var toTop = document.getElementById('toTop');
  if(toTop){
    document.addEventListener('scroll', function(){
      toTop.classList.toggle('show', window.scrollY > 600);
    }, {passive:true});
    toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
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
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2000);
  }
  window.aceShowToast = showToast;

})();
