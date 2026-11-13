/* Shared pieces of a lesson page (docs/internals/lesson-page.md): number formatting, the base/exponent
   marks, option chips, steppers, the before/after switch, and above all the step-by-step derivation.
   Pages load it before their own script and use the global L. */
window.L = (function () {
  const MINUS = '−';

  /* ---------- numbers and marks ---------- */
  const signed = n => (n < 0 ? MINUS + (-n) : String(n));
  function fmt(v, digits = 6) {
    v = Math.round(v * 1e9) / 1e9;
    return v.toLocaleString('uk-UA', { maximumFractionDigits: digits }).replace('-', MINUS);
  }
  const factor = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
  function plural(n, one, few, many) {
    n = Math.abs(n); const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const B = (x, cls = '') => `<span class="b${cls ? ' ' + cls : ''}">${x}</span>`;   // base: mark 1 (g2: mark 4)
  const E = n => `<span class="e">${n}</span>`;                                      // exponent: mark 2
  const pow = (base, exp, cls) => B(base, cls) + E(exp);
  const SUP = n => `<sup>${n}</sup>`;
  const DOT = '<span class="dot">·</span>';
  const frac = (t, d) => `<span class="fr"><span>${t}</span><span>${d}</span></span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

  /* ---------- controls ---------- */
  // option chips: opts = [{v, label, sub?}] or plain values; small chips when no sub-label is given
  function chips(el, opts, current, onPick) {
    const list = opts.map(o => (typeof o === 'object' ? o : { v: o, label: signed(o) }));
    const small = list.every(o => !o.sub);
    el.classList.add(small ? 'opts' : 'palette');
    el.innerHTML = list.map((o, i) =>
      `<button type="button" class="chip${small ? ' sm' : ''}" data-i="${i}" aria-pressed="${o.v === current}">` +
      (small ? o.label : `<small>${o.sub}</small><span>${o.label}</span>`) + '</button>').join('');
    el.querySelectorAll('button').forEach(b => (b.onclick = () => onPick(list[+b.dataset.i].v)));
  }
  // − value + ; returns a function that redraws the value and the disabled ends
  function stepper(root, { min, max, get, set, show = signed }) {
    const [minus, out, plus] = [root.querySelector('button:first-child'), root.querySelector('output'), root.querySelector('button:last-child')];
    const draw = () => { const v = get(); out.textContent = show(v); minus.disabled = v <= min; plus.disabled = v >= max; };
    minus.onclick = () => { if (get() > min) { set(get() - 1); } draw(); };
    plus.onclick = () => { if (get() < max) { set(get() + 1); } draw(); };
    draw();
    return draw;
  }
  // a card with two readings of the same thing and a switch between them, in place
  function contrast(el, { a, b, labelA, labelB }) {
    el.classList.add('pit');
    el.innerHTML = '<div class="pit-head"><span class="expr"></span><button type="button" class="switch" aria-pressed="false"></button></div><div class="steps"></div><p class="why"></p>';
    const sw = el.querySelector('.switch');
    const draw = () => {
      const on = sw.getAttribute('aria-pressed') === 'true', v = on ? b : a;
      el.querySelector('.expr').innerHTML = v.expr; el.querySelector('.steps').innerHTML = v.steps;
      el.querySelector('.why').innerHTML = v.why; sw.textContent = on ? labelB : labelA;
    };
    sw.onclick = () => { sw.setAttribute('aria-pressed', sw.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); draw(); };
    draw();
  }

  /* ---------- the step-by-step derivation ----------
     stages() returns [{lines:[html], text, warn?, beyond?, read?}]. Each press of "next" shows one more stage;
     its lines are appended under the previous ones, so the whole chain stays on screen. */
  function derivation({ box, next, reset, stages, first = 'Розклади →', more = 'Далі →' }) {
    let stage = 1, shown = 0;
    function render(animate = true) {
      const S = stages();
      stage = Math.min(stage, S.length);
      let h = '', count = 0;
      for (let i = 0; i < stage; i++) {
        S[i].lines.forEach((l, j) => {
          const isNew = animate && count >= shown;
          h += `<div class="ln${isNew ? ' enter' : ''}"><span class="eqs">${i === 0 && j === 0 ? '' : '='}</span><span class="body">${l}</span></div>`;
          count++;
        });
      }
      shown = count;
      const cur = S[stage - 1];
      if (cur.read) h += `<p class="read">${cur.read}</p>`;
      if (cur.text) h += `<div class="explain">${cur.text}</div>`;
      if (cur.warn) h += `<div class="warn">${cur.warn}</div>`;
      if (cur.beyond) h += cur.beyond;
      box.innerHTML = h;
      next.disabled = stage >= S.length;
      next.textContent = stage === 1 ? first : stage >= S.length ? 'Готово' : more;
      reset.disabled = stage === 1;
    }
    next.onclick = () => { stage++; render(); };
    reset.onclick = () => { stage = 1; shown = 0; render(); };
    return {
      render,                                   // keep the stage, redraw (input changed)
      restart() { shown = 0; render(); },       // keep the stage, animate every line again
      toStart() { stage = 1; shown = 0; render(false); },
    };
  }

  // an outside-the-course footnote (docs/internals/lesson-page.md ▸ Зноска)
  function beyond(text, url, label, lang) {
    return `<aside class="beyond"><b>Поза шкільною програмою.</b> ${text} <a href="${url}"${lang ? ` hreflang="${lang}"` : ''} target="_blank" rel="noopener noreferrer">${label} ↗</a></aside>`;
  }

  return { MINUS, signed, fmt, factor, plural, esc, B, E, pow, SUP, DOT, frac, gcd, chips, stepper, contrast, derivation, beyond };
})();
