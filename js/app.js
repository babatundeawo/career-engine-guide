/* Career Engine — shared page behaviour.
   Progressive enhancement only: every page is fully readable without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  /* ---------- Safe storage helpers (storage can be blocked in private modes) ---------- */
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById('themeToggle');
  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    var color = dark ? '#0A0A18' : '#FAFAFC';
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', color); m.removeAttribute('media'); });
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
  }
  syncTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      function apply() { root.setAttribute('data-theme', next); store('ace-theme', next); syncTheme(); }
      if (!reduceMotion && document.startViewTransition) { document.startViewTransition(apply); } else { apply(); }
    });
  }

  /* ---------- Scroll: progress bar, header state, back-to-top ---------- */
  var bar = document.getElementById('scrollProgress');
  var toTop = document.getElementById('toTop');
  var ticking = false;
  function onScroll() {
    var max = root.scrollHeight - root.clientHeight;
    if (bar) { bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(root.scrollTop / max, 1) : 0) + ')'; }
    root.classList.toggle('is-scrolled', window.scrollY > 8);
    if (toTop) { toTop.classList.toggle('show', window.scrollY > 600); }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) { return; }
          var el = entry.target;
          setTimeout(function () { el.classList.add('is-visible'); }, (i % 5) * 70);
          io.unobserve(el);
        });
      }, { threshold: 0.05 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Cursor spotlight on cards (hover devices only) ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.spot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- Desktop "Guide" dropdown (click, hover, keyboard and touch) ---------- */
  var drop = document.querySelector('.nav-drop');
  if (drop) {
    var dropBtn = drop.querySelector('.nav-drop-toggle');
    var setDrop = function (open) { drop.classList.toggle('open', open); dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    dropBtn.addEventListener('click', function () { setDrop(!drop.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target)) { setDrop(false); } });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrop(false); dropBtn.focus(); } });
    drop.addEventListener('focusout', function (e) { if (!drop.contains(e.relatedTarget)) { setDrop(false); } });
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuToggle.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('open')); });
    mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMenu(false); menuToggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 760) { setMenu(false); } });
  }

  /* ---------- Toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(message, isError) {
    if (!toast) { return; }
    toast.textContent = message;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }

  /* ---------- Copy to clipboard ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    var target = document.querySelector(btn.getAttribute('data-target'));
    var label = btn.querySelector('.label');
    if (!target || !label) { return; }
    var original = label.textContent;
    function done(ok) {
      if (!ok) { showToast('Copy failed. Select the text and copy it manually.', true); return; }
      btn.classList.add('copied');
      label.textContent = 'Copied';
      showToast('Prompt copied to clipboard');
      setTimeout(function () { btn.classList.remove('copied'); label.textContent = original; }, 1800);
    }
    btn.addEventListener('click', function () {
      var text = target.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  /* ---------- Print: expand every prompt so nothing is hidden on paper ---------- */
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('details.prompt-card').forEach(function (d) { d.setAttribute('open', ''); });
  });
})();
