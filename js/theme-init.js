/* Runs in <head> before first paint so the page never flashes the wrong theme.
   Order of precedence: the visitor's saved choice, then the system preference. */
(function () {
  var root = document.documentElement;
  var theme = null;
  try { theme = localStorage.getItem('ace-theme'); } catch (e) { /* storage blocked: fall through */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', theme);
  root.classList.add('js');
  var color = theme === 'dark' ? '#0A0A18' : '#FAFAFC';
  var metas = document.querySelectorAll('meta[name="theme-color"]');
  for (var i = 0; i < metas.length; i++) { metas[i].setAttribute('content', color); metas[i].removeAttribute('media'); }
})();
