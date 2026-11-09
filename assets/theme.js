/* One theme for the whole site: loaded in <head> so the saved choice applies before the first paint.
   Pages that redraw on a theme change listen for the "themechange" event on document. */
(function () {
  var KEY = 'theme';
  var OLD_KEYS = ['log11-theme', 'trap-theme', 'pow-theme'];
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function valid(t) { return t === 'light' || t === 'dark'; }
  try {
    var saved = localStorage.getItem(KEY);
    if (!valid(saved)) {
      // pick up a choice saved by an older page under its own key
      for (var i = 0; i < OLD_KEYS.length && !valid(saved); i++) saved = localStorage.getItem(OLD_KEYS[i]);
      if (valid(saved)) localStorage.setItem(KEY, saved);
    }
    if (valid(saved)) root.setAttribute('data-theme', saved);
  } catch (e) {}

  function current() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function announce() { document.dispatchEvent(new CustomEvent('themechange', { detail: current() })); }

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

  function paint() {
    var btn = document.getElementById('site-theme');
    if (!btn) return;
    var dark = current() === 'dark';
    btn.innerHTML = dark ? SUN : MOON;
    var label = dark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  function init() {
    var btn = document.getElementById('site-theme');
    if (btn) btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint(); announce();
    });
    paint();
  }

  if (mq) {
    var onSystem = function () { paint(); announce(); };
    if (mq.addEventListener) mq.addEventListener('change', onSystem); else mq.addListener(onSystem);
  }
  // another open tab of the site switched the theme
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && valid(e.newValue)) { root.setAttribute('data-theme', e.newValue); paint(); announce(); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
