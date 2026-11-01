/* Career Engine — app layer: service worker, update flow, install prompt,
   iOS "Add to Home Screen" guide, offline notice and sharing.
   Progressive enhancement only: the site works fully without this file. */
(function () {
  'use strict';

  var doc = document;
  var DISMISS_KEY = 'ace-install-dismissed';
  var VISITS_KEY = 'ace-visits';
  var DISMISS_DAYS = 30;

  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }

  function el(tag, props, children) {
    var node = doc.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') { node.textContent = props[k]; } else { node.setAttribute(k, props[k]); }
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var ua = window.navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1);
  var isIOSSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);

  /* ---------- Snackbar (update + install prompts) ---------- */
  function snack(id, title, body, actionLabel, onAction, onClose) {
    var bar = el('div', { 'class': 'snack', id: id, role: 'status' });
    var text = el('p', {}, [el('strong', { text: title }), doc.createTextNode(body)]);
    var act = el('button', { type: 'button', 'class': 'snack-btn', text: actionLabel });
    var x = el('button', { type: 'button', 'class': 'snack-x', 'aria-label': 'Dismiss' , text: '\u00d7' });
    bar.appendChild(text); bar.appendChild(act); bar.appendChild(x);
    doc.body.appendChild(bar);
    var hide = function () { bar.classList.remove('show'); setTimeout(function () { bar.remove(); }, 400); };
    act.addEventListener('click', function () { hide(); onAction(); });
    x.addEventListener('click', function () { hide(); if (onClose) { onClose(); } });
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { bar.classList.add('show'); }); });
    return hide;
  }

  /* ---------- Service worker and safe update flow ---------- */
  var reloading = false;
  function promptUpdate(worker) {
    if (doc.getElementById('updateSnack')) { return; }
    snack('updateSnack', 'Update available', 'A newer version of the guide is ready.', 'Refresh', function () {
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  }
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (reg.waiting && navigator.serviceWorker.controller) { promptUpdate(reg.waiting); }
        reg.addEventListener('updatefound', function () {
          var incoming = reg.installing;
          if (!incoming) { return; }
          incoming.addEventListener('statechange', function () {
            if (incoming.state === 'installed' && navigator.serviceWorker.controller) { promptUpdate(incoming); }
          });
        });
        /* Look for a new version whenever the app returns to the foreground. */
        doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'visible') { reg.update().catch(function () {}); } });
      }).catch(function () { /* the site keeps working without a service worker */ });
    });
    /* Reload only when an existing worker is replaced by an update the reader accepted,
       never on the very first visit when the worker simply takes control. */
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading || !hadController) { return; }
      reloading = true;
      window.location.reload();
    });
  }

  /* ---------- Offline notice ---------- */
  var pill = el('div', { 'class': 'net-pill', role: 'status', text: 'You are offline. Pages you have opened still work.' });
  doc.body.appendChild(pill);
  function syncNet() { pill.classList.toggle('show', navigator.onLine === false); }
  window.addEventListener('online', syncNet);
  window.addEventListener('offline', syncNet);
  syncNet();

  /* ---------- Install: Chrome / Edge / Android ---------- */
  var deferred = null;
  var footerActions = doc.querySelector('.footer-bottom');
  var actions = el('div', { 'class': 'footer-actions' });
  if (footerActions) { footerActions.appendChild(actions); }

  var visits = (parseInt(read(VISITS_KEY), 10) || 0) + 1;
  write(VISITS_KEY, String(visits));
  function dismissedRecently() {
    var t = parseInt(read(DISMISS_KEY), 10);
    return t && (Date.now() - t) < DISMISS_DAYS * 86400000;
  }

  var installBtn = null;
  function addInstallButton(handler) {
    if (installBtn || standalone) { return; }
    installBtn = el('button', { type: 'button', 'class': 'btn btn-ghost btn-small', 'data-install': '', text: 'Install the app' });
    installBtn.addEventListener('click', handler);
    actions.insertBefore(installBtn, actions.firstChild);
  }
  function runInstall() {
    if (!deferred) { return; }
    var prompt = deferred;
    deferred = null;
    prompt.prompt();
    prompt.userChoice.then(function () { if (installBtn) { installBtn.remove(); installBtn = null; } });
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    addInstallButton(runInstall);
    /* Offer it at a sensible moment: from the second page view, after a short pause. */
    if (!dismissedRecently() && visits >= 2) {
      setTimeout(function () {
        if (!deferred || doc.getElementById('installSnack')) { return; }
        snack('installSnack', 'Install Career Engine', 'Add it to your home screen to use it like an app, even offline.', 'Install', runInstall,
          function () { write(DISMISS_KEY, String(Date.now())); });
      }, 8000);
    }
  });
  window.addEventListener('appinstalled', function () {
    deferred = null;
    if (installBtn) { installBtn.remove(); installBtn = null; }
    var s = doc.getElementById('installSnack'); if (s) { s.remove(); }
  });

  /* ---------- Install: iPhone / iPad Safari (no install event exists) ---------- */
  if (isIOSSafari && !standalone) {
    var dlg = el('dialog', { 'class': 'ios-guide', 'aria-labelledby': 'iosTitle' });
    var share = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    share.setAttribute('class', 'glyph'); share.setAttribute('viewBox', '0 0 24 24'); share.setAttribute('fill', 'none');
    share.setAttribute('stroke', 'currentColor'); share.setAttribute('stroke-width', '1.8'); share.setAttribute('stroke-linecap', 'round');
    share.setAttribute('stroke-linejoin', 'round'); share.setAttribute('aria-hidden', 'true');
    var p1 = doc.createElementNS('http://www.w3.org/2000/svg', 'path'); p1.setAttribute('d', 'M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1');
    share.appendChild(p1);
    var step2 = el('li', {}, [el('span', {}, [doc.createTextNode('Tap the Share button '), share, doc.createTextNode(' at the bottom of the screen.')])]);
    var close = el('button', { type: 'button', 'class': 'btn btn-primary', text: 'Got it' });
    var inner = el('div', { 'class': 'ios-guide-inner' }, [
      el('h2', { id: 'iosTitle', text: 'Install on iPhone or iPad' }),
      el('ol', {}, [
        el('li', { text: 'Open this site in Safari (not inside another app).' }),
        step2,
        el('li', { text: 'Scroll down and tap \u201cAdd to Home Screen\u201d.' }),
        el('li', { text: 'Tap \u201cAdd\u201d. Career Engine now opens like an app.' })
      ]),
      el('p', { 'class': 'note', text: 'Apple does not allow websites to show an install button, so this is a manual step.' }),
      close
    ]);
    dlg.appendChild(inner);
    doc.body.appendChild(dlg);
    close.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });
    var open = el('button', { type: 'button', 'class': 'btn btn-ghost btn-small', 'data-install': '', text: 'Add to Home Screen' });
    open.addEventListener('click', function () { if (typeof dlg.showModal === 'function') { dlg.showModal(); } });
    actions.insertBefore(open, actions.firstChild);
  }

  /* ---------- Share this page ---------- */
  var shareUrl = (doc.querySelector('link[rel="canonical"]') || {}).href || window.location.href;
  var shareBtn = el('button', { type: 'button', 'class': 'btn btn-ghost btn-small', text: 'Share this page' });
  shareBtn.addEventListener('click', function () {
    var data = { title: doc.title, url: shareUrl };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* the visitor closed the share sheet */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(function () { shareBtn.textContent = 'Link copied'; setTimeout(function () { shareBtn.textContent = 'Share this page'; }, 2000); },
        function () { shareBtn.textContent = 'Copy failed'; });
    }
  });
  if (navigator.share || (navigator.clipboard && navigator.clipboard.writeText)) { actions.appendChild(shareBtn); }
})();
